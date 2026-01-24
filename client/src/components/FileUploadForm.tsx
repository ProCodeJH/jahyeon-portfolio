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

/**
 * 🚀 Enterprise Grade File Upload Form
 * Uses presigned URLs for files up to 2GB
 */
export function FileUploadForm({
  onUploadComplete,
  acceptedFileTypes = "*",
  maxSizeMB = 2048, // 2GB default
  label = "Upload File",
  category = "other"
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      // 1. Get presigned URL from server
      const { presignedUrl, key, publicUrl } = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size,
      });

      setUploadProgress(10);

      // 2. Upload directly to R2 using presigned URL with progress tracking
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 85) + 10;
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));

        // Handle abort
        if (abortControllerRef.current) {
          abortControllerRef.current.signal.addEventListener('abort', () => {
            xhr.abort();
          });
        }

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.send(file);
      });

      setUploadProgress(100);
      toast.success("File uploaded successfully!");

      onUploadComplete(
        publicUrl,
        key,
        file.name,
        file.size,
        file.type || 'application/octet-stream'
      );

      setFile(null);
      setUploadProgress(0);

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
              Maximum file size: {maxSizeMB >= 1024 ? `${(maxSizeMB / 1024).toFixed(0)}GB` : `${maxSizeMB}MB`}
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
                Uploading... {uploadProgress < 100 ? '' : 'Complete!'}
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
