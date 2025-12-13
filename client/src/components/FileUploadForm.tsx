import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2, X, FileVideo, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface FileUploadFormProps {
  onUploadComplete: (fileUrl: string, fileKey: string, fileName: string, fileSize: number, mimeType: string) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  label?: string;
  category?: "video" | "image" | "document" | "code" | "other";
}

// Chunk size: 10MB
const CHUNK_SIZE = 10 * 1024 * 1024;

export function FileUploadForm({ 
  onUploadComplete, 
  acceptedFileTypes = "*",
  maxSizeMB = 500,
  label = "Upload File",
  category = "other"
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>("");
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // tRPC chunk upload mutation
  const uploadChunkMutation = trpc.upload.uploadChunk.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
  };

  // Read file chunk as Base64
  const readChunkAsBase64 = (file: File, start: number, end: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const chunk = file.slice(start, end);
      
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      
      reader.onerror = () => reject(new Error("Failed to read chunk"));
      reader.readAsDataURL(chunk);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStartTime(Date.now());
    setEstimatedTimeRemaining("Calculating...");
    abortControllerRef.current = new AbortController();

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadId: string | undefined;
      let result: { fileKey: string; publicUrl: string } | null = null;

      console.log(`Upload started: ${file.name}, ${totalChunks} chunks total`);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Upload cancelled");
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const base64Content = await readChunkAsBase64(file, start, end);

        const chunkResult = await uploadChunkMutation.mutateAsync({
          fileName: file.name,
          fileContent: base64Content,
          chunkIndex,
          totalChunks,
          uploadId,
          contentType: file.type || 'application/octet-stream',
        });

        if (!uploadId) {
          uploadId = chunkResult.uploadId;
        }

        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 95);
        setUploadProgress(progress);

        if (uploadStartTime) {
          const elapsed = Date.now() - uploadStartTime;
          const rate = (chunkIndex + 1) / elapsed;
          const remaining = (totalChunks - chunkIndex - 1) / rate;
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setEstimatedTimeRemaining(`${minutes}m ${seconds}s`);
        }

        console.log(`Chunk ${chunkIndex + 1}/${totalChunks} completed (${progress}%)`);

        if (chunkResult.complete) {
          result = {
            fileKey: chunkResult.fileKey,
            publicUrl: chunkResult.publicUrl,
          };
        }
      }

      if (result && result.publicUrl) {
        setUploadProgress(100);
        toast.success("File uploaded successfully!");
        onUploadComplete(
          result.publicUrl, 
          result.fileKey, 
          file.name, 
          file.size, 
          file.type || 'application/octet-stream'
        );
        
        setFile(null);
        setUploadProgress(0);
        setEstimatedTimeRemaining("");
      } else {
        throw new Error("Upload failed: no result from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error && error.message === "Upload cancelled") {
        toast.info("Upload cancelled");
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Upload failed: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
      setUploadStartTime(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setEstimatedTimeRemaining("");
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-4 w-4 text-primary flex-shrink-0" />;
    
    if (file.type.startsWith('video/')) {
      return <FileVideo className="h-4 w-4 text-primary flex-shrink-0" />;
    } else if (file.type.startsWith('image/')) {
      return <FileImage className="h-4 w-4 text-primary flex-shrink-0" />;
    } else {
      return <FileText className="h-4 w-4 text-primary flex-shrink-0" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label htmlFor="file-upload">{label}</Label>
          <div className="mt-2">
            <Input
              id="file-upload"
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: {maxSizeMB}MB
              {category === "video" && " • Supports mp4, mov, avi, webm"}
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getFileIcon()}
              <span className="text-sm truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Uploading... {uploadProgress < 100 ? `(${Math.ceil(file!.size / CHUNK_SIZE)} chunks)` : 'Complete!'}
              </span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{(file!.size * uploadProgress / 100 / (1024 * 1024)).toFixed(2)} MB / {(file!.size / (1024 * 1024)).toFixed(2)} MB</span>
              {estimatedTimeRemaining && <span>Est. {estimatedTimeRemaining} remaining</span>}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
          
          {uploading && (
            <Button 
              variant="outline" 
              onClick={handleCancelUpload}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
