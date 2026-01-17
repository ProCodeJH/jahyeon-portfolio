// 데일리영상 제외 모든 리소스/폴더 삭제 스크립트
const BASE_URL = 'https://www.jahyeon.com';

async function cleanup() {
    console.log('🧹 Starting cleanup...');

    // Get all resources
    const resourcesRes = await fetch(`${BASE_URL}/api/trpc/resources.list?batch=1&input={}`);
    const resourcesData = await resourcesRes.json();
    const resources = resourcesData[0]?.result?.data?.json || [];

    // Get all folders
    const foldersRes = await fetch(`${BASE_URL}/api/trpc/folders.list?batch=1&input={}`);
    const foldersData = await foldersRes.json();
    const folders = foldersData[0]?.result?.data?.json || [];

    console.log(`📊 Total resources: ${resources.length}`);
    console.log(`📁 Total folders: ${folders.length}`);

    // Filter: Delete everything EXCEPT daily_life
    const resourcesToDelete = resources.filter(r => r.category !== 'daily_life');
    const foldersToDelete = folders.filter(f => f.category !== 'daily_life');
    const keptResources = resources.filter(r => r.category === 'daily_life');

    console.log(`\n🗑️  Resources to delete: ${resourcesToDelete.length}`);
    console.log(`📁 Folders to delete: ${foldersToDelete.length}`);
    console.log(`✅ Resources to keep (daily_life): ${keptResources.length}`);

    // Delete resources
    let deletedResources = 0;
    for (const resource of resourcesToDelete) {
        try {
            const res = await fetch(`${BASE_URL}/api/trpc/resources.delete?batch=1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "0": { "json": { "id": resource.id } } })
            });
            if (res.ok) {
                deletedResources++;
                console.log(`  ✓ Deleted resource: ${resource.id} - ${resource.title}`);
            }
        } catch (e) {
            console.error(`  ✗ Failed: ${resource.id}`);
        }
    }

    // Delete folders
    let deletedFolders = 0;
    for (const folder of foldersToDelete) {
        try {
            const res = await fetch(`${BASE_URL}/api/trpc/folders.delete?batch=1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "0": { "json": { "id": folder.id } } })
            });
            if (res.ok) {
                deletedFolders++;
                console.log(`  ✓ Deleted folder: ${folder.id} - ${folder.name}`);
            }
        } catch (e) {
            console.error(`  ✗ Failed: ${folder.id}`);
        }
    }

    console.log(`\n✅ Complete!`);
    console.log(`  Deleted ${deletedResources} resources`);
    console.log(`  Deleted ${deletedFolders} folders`);
    console.log(`  Kept ${keptResources.length} daily_life resources`);
}

cleanup();
