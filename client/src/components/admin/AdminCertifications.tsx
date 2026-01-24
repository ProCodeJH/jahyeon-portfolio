/**
 * AdminCertifications.tsx
 * 자격증 CRUD 관리 컴포넌트
 * Admin.tsx에서 분리됨
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, Trash2, X, Award } from "lucide-react";
import { toast } from "sonner";

// ============================================
// 🔧 Types
// ============================================
interface CertForm {
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    credentialUrl: string;
    imageUrl: string;
    imageKey: string;
    description: string;
}

interface AdminCertificationsProps {
    handleFileUpload: (file: File, onComplete: (url: string, key: string, thumbUrl?: string, thumbKey?: string) => void) => Promise<void>;
    uploading: boolean;
    uploadProgress: number;
}

// ============================================
// 🔧 Constants
// ============================================
const ACCEPTED_FILE_TYPES = {
    image: ".jpg,.jpeg,.png,.gif,.webp",
};

const initialCertForm: CertForm = {
    title: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    imageUrl: "",
    imageKey: "",
    description: "",
};

// ============================================
// 🚀 AdminCertifications Component
// ============================================
export default function AdminCertifications({ handleFileUpload, uploading, uploadProgress }: AdminCertificationsProps) {
    const utils = trpc.useUtils();

    const { data: certifications, isLoading: certsLoading } = trpc.certifications.list.useQuery();

    const createCertification = trpc.certifications.create.useMutation({
        onSuccess: () => {
            utils.certifications.list.invalidate();
            toast.success("Certification added");
            setShowCertDialog(false);
            resetCertForm();
        },
        onError: (e) => toast.error(e.message),
    });

    const deleteCertification = trpc.certifications.delete.useMutation({
        onSuccess: () => {
            utils.certifications.list.invalidate();
            toast.success("Deleted");
        },
    });

    const [showCertDialog, setShowCertDialog] = useState(false);
    const [certForm, setCertForm] = useState<CertForm>(initialCertForm);

    const resetCertForm = () => setCertForm(initialCertForm);

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-light text-white">Certifications</h2>
                </div>
                <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl">
                            <Plus className="h-4 w-4 mr-2" />Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>New Certification</DialogTitle>
                            <DialogDescription className="text-white/50">Add a new certification to your profile</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white/70">Title *</Label>
                                    <Input
                                        value={certForm.title}
                                        onChange={e => setCertForm({ ...certForm, title: e.target.value })}
                                        className="mt-1.5 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/70">Issuer *</Label>
                                    <Input
                                        value={certForm.issuer}
                                        onChange={e => setCertForm({ ...certForm, issuer: e.target.value })}
                                        className="mt-1.5 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white/70">Issue Date *</Label>
                                    <Input
                                        type="date"
                                        value={certForm.issueDate}
                                        onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                                        className="mt-1.5 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/70">Expiry Date</Label>
                                    <Input
                                        type="date"
                                        value={certForm.expiryDate}
                                        onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })}
                                        className="mt-1.5 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-white/70">Certificate Image</Label>
                                <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                                    {certForm.imageUrl ? (
                                        <div className="relative">
                                            <img src={certForm.imageUrl} className="max-h-40 mx-auto rounded-lg" />
                                            <button
                                                onClick={() => setCertForm({ ...certForm, imageUrl: "", imageKey: "" })}
                                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <Award className="w-8 h-8 mx-auto text-white/30 mb-2" />
                                            <span className="text-white/50 text-sm">Upload</span>
                                            <input
                                                type="file"
                                                accept={ACCEPTED_FILE_TYPES.image}
                                                className="hidden"
                                                onChange={e => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleFileUpload(f, (url, key) => setCertForm({ ...certForm, imageUrl: url, imageKey: key }));
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            {uploading && <Progress value={uploadProgress} className="h-2" />}
                            <Button
                                onClick={() => createCertification.mutate(certForm)}
                                disabled={!certForm.title || !certForm.issuer || !certForm.issueDate || uploading}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl"
                            >
                                Add Certification
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="divide-y divide-white/5">
                {certsLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                ) : !certifications?.length ? (
                    <div className="p-12 text-center text-white/40">No certifications</div>
                ) : (
                    certifications.map(cert => (
                        <div key={cert.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                                {cert.imageUrl ? (
                                    <img src={cert.imageUrl} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <Award className="w-6 h-6 text-emerald-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-white">{cert.title}</h3>
                                <p className="text-sm text-white/40">{cert.issuer} • {cert.issueDate}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCertification.mutate({ id: cert.id })}
                                className="text-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
