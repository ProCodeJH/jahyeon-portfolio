# 썸네일 자동 생성 가이드

이 프로젝트는 업로드된 콘텐츠의 썸네일을 자동으로 생성하고 표시합니다.

## ✅ 자동 지원 항목

### 1. YouTube 동영상 썸네일
YouTube URL을 입력하면 **자동으로 썸네일이 생성**됩니다.

#### Resources 섹션:
```
YouTube URL 입력: https://youtube.com/watch?v=VIDEO_ID
→ 자동으로 썸네일 URL 설정: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
```

#### Projects 섹션:
```
Video URL 입력: https://youtube.com/watch?v=VIDEO_ID
→ 자동으로 프로젝트 썸네일 설정
```

**지원 형식:**
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`

### 2. 이미지 파일 썸네일
이미지 파일(.jpg, .png, .gif, .webp)을 업로드하면 **자동으로 썸네일로 설정**됩니다.

```
이미지 파일 업로드 → 자동으로 thumbnailUrl = 업로드된 이미지 URL
✅ 알림: "Image uploaded and set as thumbnail!"
```

## 📋 수동 업로드 항목

### PPT/PPTX 파일 썸네일
PPT 파일의 첫 페이지를 썸네일로 사용하려면:

#### 방법 1: 스크린샷 (권장)
1. PPT 파일을 열기
2. 첫 번째 슬라이드 스크린샷
3. Admin 페이지에서 "Thumbnail (optional)" 섹션에 업로드

#### 방법 2: PDF 변환 후 추출
1. PPT를 PDF로 저장
2. PDF 첫 페이지를 이미지로 변환 (온라인 도구 사용)
3. 변환된 이미지를 썸네일로 업로드

#### 방법 3: PowerPoint 내보내기
1. PowerPoint에서 파일 → 내보내기 → 이미지로 내보내기
2. 첫 슬라이드만 선택
3. 생성된 이미지를 썸네일로 업로드

### PDF 파일 썸네일
PDF도 PPT와 동일하게 수동으로 첫 페이지 이미지를 업로드합니다.

## 🎨 Admin 페이지 사용법

### Resources 추가 시:
1. **파일 업로드**:
   - 이미지: 자동으로 썸네일 설정 ✅
   - PPT/PDF: 수동 썸네일 업로드 필요

2. **YouTube URL**:
   - URL 입력 → 자동 썸네일 생성 ✅
   - "✅ YouTube thumbnail auto-detected!" 메시지 확인

3. **썸네일 (선택사항)**:
   - 자동 설정되지 않은 파일은 여기서 수동 업로드
   - PPT, PDF의 경우 첫 페이지 이미지 업로드 권장

### Projects 추가 시:
1. **Project Image**: 프로젝트 대표 이미지 업로드
2. **Video (YouTube URL)**: YouTube URL 입력 → 자동 썸네일 ✅

## 🚀 향후 개선 사항

### 자동 PPT 썸네일 생성 (서버 측)
```bash
# 필요한 도구:
- LibreOffice (headless mode)
- ImageMagick
- PDF to Image converter

# 예상 로직:
1. PPT 업로드
2. 서버에서 PPT → PDF 변환 (LibreOffice)
3. PDF 첫 페이지 → 이미지 변환 (ImageMagick)
4. 썸네일 URL 반환
```

이 기능은 서버 리소스가 필요하므로 현재는 수동 업로드를 권장합니다.

## 📱 사용자 화면에서의 표시

### Resources 페이지:
- **YouTube**: YouTube 썸네일 자동 표시
- **이미지**: 업로드된 이미지 표시
- **PPT**: 커스텀 PPT 아이콘 또는 업로드된 썸네일
- **PDF**: PDF 아이콘 또는 업로드된 썸네일

### Projects 페이지:
- 프로젝트 이미지 또는 YouTube 썸네일 표시
- 비디오 아이콘으로 동영상 있음 표시

## 💡 팁

1. **고해상도 썸네일**: YouTube는 자동으로 `maxresdefault.jpg` (최고 해상도) 사용
2. **일관된 크기**: 썸네일 이미지는 16:9 비율 권장 (예: 1280x720)
3. **파일 크기**: 썸네일은 500KB 이하 권장 (빠른 로딩)
4. **포맷**: JPG 또는 PNG 권장
