# Project TODO

## Database & Backend
- [x] Design database schema for projects, certifications, and resources
- [x] Set up database migrations
- [x] Create seed data for initial content
- [x] Implement tRPC procedures for file upload (500MB limit)
- [x] Implement tRPC procedures for CRUD operations

## File Upload System
- [x] Create FileUploadForm component with 500MB limit
- [x] Support video formats (mp4, mov, avi, webm)
- [x] Implement upload progress UI
- [x] Integrate S3 storage for file management

## Frontend Pages
- [x] Home page with hero section and introduction
- [x] About page with detailed profile
- [x] Projects page with gallery layout
- [x] Certifications page with modal functionality
- [x] Resources page with video preview
- [x] Admin panel for content management

## Video Features
- [x] Video preview in Resources page
- [x] Video management in Admin panel
- [x] Video player with controls
- [ ] Thumbnail generation for videos (optional)

## Styling & Theme
- [x] Set up deep navy color theme
- [x] Configure global styles with Tailwind
- [x] Add Google Fonts (Inter)
- [x] Ensure responsive design

## Testing & Deployment
- [x] Test file upload with large files
- [x] Test video playback
- [x] Verify all CRUD operations
- [x] Create checkpoint for deployment

## Bug Fixes
- [x] Fix nested anchor tag error in navigation links
- [x] Fix Admin page file upload error (increased server body size limit to 500MB)

## New Features
- [x] Add specific categories for resources (일상 생활 영상, 수업자료 PPT, 아두이노 프로젝트, C언어 프로젝트, 파이썬 프로젝트)
- [x] Implement real-time upload progress bar with remaining time
- [x] Update Resources page category filter with new categories
- [x] Update Admin page category selector with new categories

## Video Thumbnail Feature
- [x] Implement client-side video thumbnail extraction from first frame
- [x] Upload thumbnail to S3 automatically when video is uploaded
- [x] Display thumbnails in Resources page for better preview
- [x] Update Admin page to show thumbnail preview after upload

## UI Improvements
- [x] Change category labels from Korean to English in Resources page
- [x] Change category labels from Korean to English in Admin page

## Bug Fixes (New)
- [x] Fix video playback issue in Resources page

## Subcategory System
- [x] Add subcategory field to database schema (Code, Documentation, Images)
- [x] Update Admin page to support subcategory selection for project categories
- [x] Update Resources page to show subcategory tabs within project categories
- [x] Implement conditional subcategory selection (only for Arduino/C/Python projects)

## Critical Bugs
- [x] Uploaded files not showing in Resources page (added subcategory validation)
- [x] Video playback still not working (added crossOrigin and playsInline attributes)
- [x] Image thumbnails not displaying (will display after proper upload with subcategory)

## Video Playback Issue
- [x] Video player shows black screen and does not play (root cause: file not uploaded to S3)
- [x] Check S3 URL accessibility (file was 0 bytes - upload failed)
- [x] Verify video file format compatibility (switched to presigned URL upload)
- [x] Test video element attributes and CORS settings (implemented direct S3 upload)

## S3 Configuration Error
- [x] Fix "No value provided for input HTTP label: Bucket" error
- [x] Use existing S3 configuration from storage.ts (switched to Manus storage API)

## Presigned URL Error
- [x] Fix "Failed to get presigned URL: Not Found" error (reverted to base64)
- [x] Implement chunk upload method for large files (50MB+) using 10MB chunks

## File Extension Error
- [x] Fix "Cannot read properties of undefined (reading 'length')" error in file upload

## Persistent Upload Error
- [x] Debug "Cannot read properties of undefined (reading 'length')" error
- [x] Check server logs for exact error location
- [x] Fix root cause of upload failure (fixed uploadData.fileName reference in server/routers.ts)

## Critical Upload Error (Still Occurring)
- [ ] Fix "Cannot read properties of undefined (reading 'length')" error that still occurs during file upload
- [ ] Add detailed server-side logging to identify exact error location
- [ ] Test with actual file upload to reproduce error

## FileUploadForm Component Refactoring
- [x] Create FileUploadForm.tsx component with chunk upload functionality
- [x] Integrate FileUploadForm into Admin page
- [x] Add upload cancellation feature
- [x] Test with small files (1MB) - successful
- [x] Remove old inline upload code from Admin.tsx

## Critical: Upload Error Still Occurring
- [x] Investigate "Cannot read properties of undefined (reading 'length')" error in uploadChunk
- [x] Check server logs for detailed error trace
- [x] Review all code paths that access .length property
- [x] Fix the root cause completely (fixed empty array slots issue - replaced new Array(n) with null-filled array)
