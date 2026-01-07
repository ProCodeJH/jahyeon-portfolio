import { CodeEditor } from "@/components/code-editor/CodeEditor";
import { Navigation } from "@/components/layout/Navigation";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function CodeEditorPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <GradientMeshBackground />
                <SubtleDots />
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Content */}
            <div className="flex-1 pt-24 pb-8 px-4 md:px-8 relative z-10 flex flex-col h-screen">
                <AnimatedSection className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full h-full bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden">
                    <CodeEditor />
                </AnimatedSection>
            </div>
        </div>
    );
}
