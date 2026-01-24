import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ChatWidget } from '@/components/chat/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Jahyeon - Portfolio & Support',
    description: 'Professional portfolio and live support platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className={inter.className}>
                {children}
                <ChatWidget />
            </body>
        </html>
    );
}
