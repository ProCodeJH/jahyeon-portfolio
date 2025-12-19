# Upload Limits

This project enforces an upload size limit on the **server**. By default this is **500 MB** and can be customized with the `MAX_UPLOAD_MB` environment variable.

- Client UI will show the configured default (`DEFAULT_MAX_UPLOAD_MB` in `shared/const.ts`).
- The presigned endpoint (`upload.getPresignedUrl`) accepts an optional `fileSizeBytes` and will reject uploads that exceed the configured limit. Set `MAX_UPLOAD_MB` on the *server* (default 500) and `VITE_MAX_UPLOAD_MB` on the *client* build environment to keep client and server limits consistent.
- The base64 upload endpoint (`upload.file`) will also reject files exceeding the limit.

If you expect to support files larger than 500MB (up to S3 limits), consider implementing multipart presigned uploads and increasing `MAX_UPLOAD_MB` as needed.