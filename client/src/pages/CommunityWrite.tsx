import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { NotionEditor } from "@/components/notion";
import {
    ArrowLeft, Image as ImageIcon, X, Upload, Send,
    Hash, Eye, EyeOff, Loader2
} from "lucide-react";

// 카테고리 정의
const CATEGORIES = [
    { id: "question", label: "질문 Q&A", emoji: "❓", color: "yellow-400" },
    { id: "free", label: "자유 Talk", emoji: "💬", color: "accent-cyan" },
    { id: "homework", label: "과제 HW", emoji: "📝", color: "accent-indigo" },
    { id: "study", label: "스터디", emoji: "📚", color: "purple-400" },
    { id: "notice", label: "공지사항", emoji: "📢", color: "red-400" },
    { id: "gallery", label: "갤러리", emoji: "🎨", color: "pink-400" },
];

export default function CommunityWrite() {
    const [, navigate] = useLocation();
    const [member, setMember] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("free");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editorHtml, setEditorHtml] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auth check
    useEffect(() => {
        const storedMember = localStorage.getItem("member");
        if (storedMember) {
            try {
                const parsed = JSON.parse(storedMember);
                if (parsed.isStudent) {
                    setMember(parsed);
                } else {
                    toast.error("학원 코드를 입력한 계정만 이용 가능합니다");
                    navigate("/login");
                }
            } catch (e) {
                navigate("/login");
            }
        } else {
            toast.error("로그인이 필요합니다");
            navigate("/login");
        }
    }, [navigate]);

    // Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 10) {
            toast.error("이미지는 최대 10개까지 업로드 가능합니다");
            return;
        }

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name}: 10MB 이하만 업로드 가능합니다`);
                continue;
            }

            setImages(prev => [...prev, file]);

            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
        setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Tag handling
    const handleAddTag = () => {
        const tag = tagInput.trim().replace(/^#/, "");
        if (tag && !tags.includes(tag) && tags.length < 5) {
            setTags(prev => [...prev, tag]);
            setTagInput("");
        }
    };

    const removeTag = (index: number) => {
        setTags(prev => prev.filter((_, i) => i !== index));
    };

    // tRPC Mutations
    const uploadImageMutation = trpc.community.uploadImage.useMutation();
    const createPostMutation = trpc.community.posts.create.useMutation();

    // Submit
    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("제목을 입력해주세요");
            return;
        }
        if (!content.trim()) {
            toast.error("내용을 입력해주세요");
            return;
        }
        if (!member) {
            toast.error("로그인이 필요합니다");
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload images first if any
            const imageUrls: string[] = [];
            for (const file of images) {
                const reader = new FileReader();
                const base64 = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve((reader.result as string).split(",")[1]);
                    reader.readAsDataURL(file);
                });

                try {
                    const result = await uploadImageMutation.mutateAsync({
                        memberId: member.id,
                        fileName: `community/${Date.now()}-${file.name}`,
                        fileContent: base64,
                        contentType: file.type,
                    });
                    if (result.url) {
                        imageUrls.push(result.url);
                    }
                } catch (uploadError) {
                    console.error("Image upload failed:", uploadError);
                }
            }

            // Create post with actual API call
            const result = await createPostMutation.mutateAsync({
                memberId: member.id,
                title,
                content: editorHtml || content, // NotionEditor HTML 또는 기존 content
                category: category as "question" | "free" | "homework" | "study" | "notice" | "gallery",
                tags,
                images: imageUrls,
                isAnonymous,
            });

            if (result.success) {
                toast.success("게시글이 작성되었습니다! 🎉");
                navigate("/community");
            } else {
                toast.error("게시글 작성에 실패했습니다");
            }
        } catch (error) {
            console.error("Post creation error:", error);
            toast.error("게시글 작성에 실패했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

    // NotionEditor로 대체되어 insertFormat 함수 제거됨

    if (!member) {
        return (
            <div className="min-h-screen bg-midnight flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-electric/30 border-t-electric rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-midnight text-frost">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-card to-midnight" />
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric/5 rounded-full blur-[150px]" />
            </div>

            <Navigation />

            {/* Main Content */}
            <div className="pt-24 pb-12 relative z-10">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate("/community")}
                            className="flex items-center gap-2 text-frost-muted hover:text-frost transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>커뮤니티로 돌아가기</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsPreview(!isPreview)}
                                className="border-white/20 text-frost"
                            >
                                {isPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                {isPreview ? "편집" : "미리보기"}
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-electric to-accent-cyan text-midnight font-bold px-6 shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                게시하기
                            </Button>
                        </div>
                    </div>

                    {/* Editor Card */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Category Selection */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${category === cat.id
                                            ? 'bg-midnight text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span>{cat.emoji}</span>
                                        <span className="font-medium">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title Input */}
                        <div className="p-6 border-b border-gray-100">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                className="w-full text-3xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none"
                            />
                        </div>

                        {/* NotionEditor가 자체 툴바를 제공하므로 기존 툴바는 이미지 추가 버튼만 유지 */}
                        <div className="flex items-center justify-end p-3 border-b border-gray-100 bg-gray-50">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                            >
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-sm">이미지 추가</span>
                            </button>
                        </div>

                        {/* Content Area - NotionEditor */}
                        <div className="min-h-[400px]">
                            {isPreview ? (
                                <div className="p-6 prose prose-lg max-w-none">
                                    <div
                                        className="text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: editorHtml || '<p>내용을 입력하면 여기에 미리보기가 표시됩니다.</p>' }}
                                    />
                                </div>
                            ) : (
                                <NotionEditor
                                    content={content}
                                    onChange={(html) => {
                                        setEditorHtml(html);
                                        setContent(html);
                                    }}
                                    placeholder='내용을 입력하세요. "/" 를 입력하면 블록을 추가할 수 있습니다.'
                                    className="min-h-[400px]"
                                />
                            )}
                        </div>

                        {/* Image Upload Area */}
                        {imagePreview.length > 0 && (
                            <div className="p-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-3">첨부된 이미지 ({imagePreview.length}/10)</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {imagePreview.map((preview, index) => (
                                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden group">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreview.length < 10 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center gap-2 transition-colors"
                                        >
                                            <Upload className="w-6 h-6 text-gray-400" />
                                            <span className="text-sm text-gray-400">추가</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        <div className="p-6 border-t border-gray-100">
                            <div className="flex flex-wrap items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-400" />
                                {tags.map((tag, index) => (
                                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-electric/10 text-electric rounded-full text-sm">
                                        #{tag}
                                        <button onClick={() => removeTag(index)} className="hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                {tags.length < 5 && (
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                        placeholder="태그 추가 (Enter)"
                                        className="flex-1 min-w-[120px] text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-electric' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform mt-0.5 ${isAnonymous ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </div>
                                <span className="text-gray-600">익명으로 작성</span>
                            </label>

                            <div className="text-sm text-gray-500">
                                작성자: <span className="font-medium text-gray-700">{isAnonymous ? "익명" : member?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    );
}
