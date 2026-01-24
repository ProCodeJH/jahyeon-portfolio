/**
 * 코딩쏙학원 - 메인 앱
 */

import { useState } from 'react';
import { AppFlowyApp } from './components/appflowy/AppFlowyApp';

function App() {
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <AppFlowyApp
                workspaceName="코딩쏙학원"
                userName="관리자"
            />
        </div>
    );
}

export default App;
