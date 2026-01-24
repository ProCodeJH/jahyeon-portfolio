/**
 * AppFlowy 페이지 (완벽 구현)
 */

import '@/styles/appflowy/globals.css';
import { AppFlowyApp } from '@/components/appflowy/AppFlowyApp';

export default function AppFlowyPage() {
    return (
        <AppFlowyApp
            workspaceName="My Workspace"
            userName="Jahyeon"
        />
    );
}
