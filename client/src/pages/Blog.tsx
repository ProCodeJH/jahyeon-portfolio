import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
    Edit3, Clock, User, Heart, MessageCircle, Eye, Search,
    Plus, Trash2, X, Save, Image, Bold, Italic, Link2, List,
    ArrowUpRight, Calendar, Tag
} from "lucide-react";
import { toast } from "sonner";
import "../styles/dopple-v4.css";

// Supreme Quantum Logo
function SupremeLogo({ size = 48 }: { size?: number }) {
    return (
        <svg viewBox="0 0 100 100" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg">
            <style>{`
                @keyframes spin1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin2 { from { transform: rotate(120deg); } to { transform: rotate(480deg); } }
                @keyframes spin3 { from { transform: rotate(240deg); } to { transform: rotate(600deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
            `}</style>
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4361EE" />
                    <stop offset="50%" stopColor="#7B2FFF" />
                    <stop offset="100%" stopColor="#00D9FF" />
                </linearGradient>
            </defs>
            <g transform="translate(50,50)">
                <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin1 8s linear infinite', transformOrigin: 'center' }} />
                <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin2 8s linear infinite', transformOrigin: 'center' }} />
                <ellipse rx="35" ry="12" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.6" style={{ animation: 'spin3 8s linear infinite', transformOrigin: 'center' }} />
                <circle r="12" fill="url(#grad1)" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                <circle r="6" fill="white" opacity="0.9" />
            </g>
        </svg>
    );
}

// Messenger Widget
function MessengerWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Message from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:contact@jahyeon.com?subject=${subject}&body=${body}`;
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setIsOpen(false);
            setName('');
            setEmail('');
            setMessage('');
        }, 2000);
    };

    return (
        <>
            <button className="messenger-bubble" onClick={() => setIsOpen(!isOpen)} aria-label="Open messenger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
            </button>
            {isOpen && (
                <div className="messenger-modal">
                    <div className="messenger-header">
                        <span>💬 메시지 보내기</span>
                        <button onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    {sent ? (
                        <div className="messenger-sent"><span>✅</span><p>메일 앱이 열립니다!</p></div>
                    ) : (
                        <form onSubmit={handleSubmit} className="messenger-form">
                            <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
                            <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <textarea placeholder="메시지를 입력하세요..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} />
                            <button type="submit" className="messenger-send">
                                <span>보내기</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><polygon points="22,2 15,22 11,13 2,9" /></svg>
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}

// Blog Post Type
interface BlogPost {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    thumbnail?: string;
    views: number;
    likes: number;
}

// Sample blog posts data (in production, this would come from API)
const SAMPLE_POSTS: BlogPost[] = [
    {
        id: 1,
        title: "임베디드 프로그래밍 시작하기",
        content: "임베디드 시스템은 특정 기능을 수행하도록 설계된 컴퓨터 시스템입니다...",
        excerpt: "임베디드 시스템의 기초부터 아두이노 프로그래밍까지 알아봅니다.",
        author: "구자현",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
        tags: ["임베디드", "아두이노", "C언어"],
        views: 1234,
        likes: 45
    },
    {
        id: 2,
        title: "Python으로 데이터 분석하기",
        content: "Python은 데이터 분석에 가장 널리 사용되는 언어입니다...",
        excerpt: "Pandas와 Matplotlib을 활용한 데이터 분석 입문 가이드",
        author: "구자현",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-12",
        tags: ["Python", "데이터분석", "Pandas"],
        views: 892,
        likes: 32
    },
    {
        id: 3,
        title: "웹 개발 트렌드 2024",
        content: "2024년 웹 개발 트렌드를 살펴봅니다. React, Next.js, AI 통합...",
        excerpt: "최신 웹 개발 기술 동향과 학습 로드맵",
        author: "구자현",
        createdAt: "2024-01-05",
        updatedAt: "2024-01-05",
        tags: ["웹개발", "React", "Next.js"],
        views: 2156,
        likes: 78
    }
];

export default function Blog() {
    const [posts, setPosts] = useState<BlogPost[]>(SAMPLE_POSTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isWriting, setIsWriting] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    // New post form
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newTags, setNewTags] = useState("");

    // Check if user is admin (simplified - in production use proper auth)
    const [member, setMember] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("member");
        if (stored) {
            try {
                setMember(JSON.parse(stored));
            } catch { }
        }
    }, []);

    const isAdmin = member?.name === "관리자" || member?.name === "구자현";

    // Get all unique tags
    const allTags = [...new Set(posts.flatMap(p => p.tags))];

    // Filter posts
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || post.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    // Handle new post submission
    const handleSubmitPost = () => {
        if (!newTitle.trim() || !newContent.trim()) {
            toast.error("제목과 내용을 입력해주세요");
            return;
        }

        const newPost: BlogPost = {
            id: Date.now(),
            title: newTitle,
            content: newContent,
            excerpt: newContent.substring(0, 100) + "...",
            author: member?.name || "익명",
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            tags: newTags.split(',').map(t => t.trim()).filter(t => t),
            views: 0,
            likes: 0
        };

        if (editingPost) {
            setPosts(posts.map(p => p.id === editingPost.id ? { ...newPost, id: editingPost.id, views: editingPost.views, likes: editingPost.likes } : p));
            toast.success("글이 수정되었습니다");
        } else {
            setPosts([newPost, ...posts]);
            toast.success("새 글이 등록되었습니다");
        }

        setIsWriting(false);
        setEditingPost(null);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
    };

    // Handle edit
    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setNewTitle(post.title);
        setNewContent(post.content);
        setNewTags(post.tags.join(', '));
        setIsWriting(true);
    };

    // Handle delete
    const handleDelete = (id: number) => {
        if (confirm("정말 삭제하시겠습니까?")) {
            setPosts(posts.filter(p => p.id !== id));
            toast.success("삭제되었습니다");
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FDF8F3 0%, #FAF5EF 50%, #F8F2EB 100%)',
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            {/* Header */}
            <header className="dp4-header">
                <Link href="/" className="dp4-logo">
                    <SupremeLogo size={70} />
                </Link>
                <nav className="dp4-nav">
                    <Link href="/">PROJECTS</Link>
                    <Link href="/resources">RESOURCES</Link>
                    <Link href="/blog">BLOG</Link>
                </nav>
                <a href="mailto:contact@jahyeon.com" className="dp4-send">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 2L11 13" />
                        <polygon points="22,2 15,22 11,13 2,9" />
                    </svg>
                </a>
            </header>

            {/* Main Content */}
            <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

                    {/* Hero Section */}
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h1 style={{
                            fontSize: '3.5rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #4361EE, #7B2FFF, #00D9FF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '16px'
                        }}>
                            개발자 블로그
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                            프로그래밍, 임베디드 시스템, 교육에 대한 이야기를 나눕니다
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        {/* Search */}
                        <div style={{
                            flex: 1,
                            minWidth: '250px',
                            position: 'relative'
                        }}>
                            <Search style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#888',
                                width: '20px',
                                height: '20px'
                            }} />
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    background: 'white',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>

                        {/* Write Button (Admin only) */}
                        {isAdmin && (
                            <button
                                onClick={() => setIsWriting(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '14px 24px',
                                    background: 'linear-gradient(135deg, #4361EE, #7B2FFF)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                            >
                                <Plus size={20} />
                                글쓰기
                            </button>
                        )}
                    </div>

                    {/* Tags */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '32px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setSelectedTag(null)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                background: !selectedTag ? '#4361EE' : '#f0f0f0',
                                color: !selectedTag ? 'white' : '#666',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            전체
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: selectedTag === tag ? '#4361EE' : '#f0f0f0',
                                    color: selectedTag === tag ? 'white' : '#666',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>

                    {/* Blog Posts Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredPosts.map(post => (
                            <article
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                }}
                            >
                                {/* Thumbnail placeholder */}
                                <div style={{
                                    height: '160px',
                                    background: `linear-gradient(135deg, ${['#4361EE', '#7B2FFF', '#00D9FF', '#10b981'][post.id % 4]}, ${['#7B2FFF', '#00D9FF', '#4361EE', '#34d399'][post.id % 4]})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Edit3 size={48} color="rgba(255,255,255,0.5)" />
                                </div>

                                <div style={{ padding: '20px' }}>
                                    {/* Tags */}
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                        {post.tags.slice(0, 3).map(tag => (
                                            <span key={tag} style={{
                                                padding: '4px 10px',
                                                background: '#f0f4ff',
                                                color: '#4361EE',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Title */}
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        marginBottom: '8px',
                                        color: '#1a1a1a',
                                        lineHeight: 1.3
                                    }}>
                                        {post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p style={{
                                        color: '#666',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.6,
                                        marginBottom: '16px'
                                    }}>
                                        {post.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '12px',
                                        borderTop: '1px solid #f0f0f0'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#888', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} />
                                                {post.createdAt}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#888', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Eye size={14} />
                                                {post.views}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Heart size={14} />
                                                {post.likes}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Admin Actions */}
                                    {isAdmin && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            marginTop: '12px',
                                            paddingTop: '12px',
                                            borderTop: '1px solid #f0f0f0'
                                        }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(post); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: '#f0f4ff',
                                                    color: '#4361EE',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <Edit3 size={14} /> 수정
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    background: '#fff0f0',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <Trash2 size={14} /> 삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
                            <Edit3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>게시글이 없습니다</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Write/Edit Modal */}
            {isWriting && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {editingPost ? '글 수정' : '새 글 작성'}
                            </h2>
                            <button
                                onClick={() => { setIsWriting(false); setEditingPost(null); setNewTitle(''); setNewContent(''); setNewTags(''); }}
                                style={{
                                    padding: '8px',
                                    background: '#f0f0f0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                            {/* Title */}
                            <input
                                type="text"
                                placeholder="제목을 입력하세요"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '12px',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '16px'
                                }}
                            />

                            {/* Tags */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Tag size={16} color="#888" />
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>태그 (쉼표로 구분)</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Python, 웹개발, 튜토리얼"
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>

                            {/* Toolbar */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                padding: '12px',
                                background: '#f8f8f8',
                                borderRadius: '12px 12px 0 0',
                                border: '2px solid #e0e0e0',
                                borderBottom: 'none'
                            }}>
                                <button style={{ padding: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    <Bold size={16} />
                                </button>
                                <button style={{ padding: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    <Italic size={16} />
                                </button>
                                <button style={{ padding: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    <Link2 size={16} />
                                </button>
                                <button style={{ padding: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    <List size={16} />
                                </button>
                                <button style={{ padding: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    <Image size={16} />
                                </button>
                            </div>

                            {/* Content */}
                            <textarea
                                placeholder="내용을 입력하세요..."
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '300px',
                                    padding: '16px',
                                    border: '2px solid #e0e0e0',
                                    borderTop: 'none',
                                    borderRadius: '0 0 12px 12px',
                                    fontSize: '1rem',
                                    lineHeight: 1.8,
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => { setIsWriting(false); setEditingPost(null); }}
                                style={{
                                    padding: '12px 24px',
                                    background: '#f0f0f0',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmitPost}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #4361EE, #7B2FFF)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Save size={18} />
                                {editingPost ? '수정하기' : '발행하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div style={{
                            height: '200px',
                            background: `linear-gradient(135deg, #4361EE, #7B2FFF)`,
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setSelectedPost(null)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.9)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '32px' }}>
                            {/* Tags */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                {selectedPost.tags.map(tag => (
                                    <span key={tag} style={{
                                        padding: '6px 14px',
                                        background: '#f0f4ff',
                                        color: '#4361EE',
                                        borderRadius: '16px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Title */}
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: 800,
                                marginBottom: '16px',
                                lineHeight: 1.3
                            }}>
                                {selectedPost.title}
                            </h1>

                            {/* Meta */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                color: '#888',
                                marginBottom: '32px',
                                paddingBottom: '24px',
                                borderBottom: '1px solid #f0f0f0'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={16} />
                                    {selectedPost.author}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={16} />
                                    {selectedPost.createdAt}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Eye size={16} />
                                    {selectedPost.views}
                                </span>
                            </div>

                            {/* Content */}
                            <div style={{
                                fontSize: '1.1rem',
                                lineHeight: 1.8,
                                color: '#333',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {selectedPost.content}
                            </div>

                            {/* Like Button */}
                            <div style={{
                                marginTop: '40px',
                                paddingTop: '24px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 32px',
                                        background: '#fff0f5',
                                        color: '#ec4899',
                                        border: 'none',
                                        borderRadius: '24px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Heart size={20} />
                                    좋아요 {selectedPost.likes}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="dp4-footer">
                <nav className="dp4-footer-nav">
                    <Link href="/">PROJECTS</Link>
                    <Link href="/resources">RESOURCES</Link>
                    <Link href="/blog">BLOG</Link>
                    <a href="mailto:contact@jahyeon.com">CONTACT</a>
                </nav>
                <p>© 2024 Gu Jahyeon. Embedded Developer & Educator.</p>
            </footer>

            {/* Messenger Widget */}
            <MessengerWidget />
        </div>
    );
}
