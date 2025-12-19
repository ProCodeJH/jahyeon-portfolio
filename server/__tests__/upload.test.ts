import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers';

describe('upload router', () => {
  it('returns a presigned URL payload', async () => {
    const res = await appRouter.createCaller({ userId: '1' }).upload.getPresignedUrl({ fileName: 'test.mp4', contentType: 'video/mp4', fileSizeBytes: 1024 } as any);
    expect(res).toHaveProperty('url');
    expect(res).toHaveProperty('key');
    expect(res).toHaveProperty('publicUrl');
    expect(typeof res.url).toBe('string');
    expect(typeof res.key).toBe('string');

    // oversize should be rejected
    await expect(appRouter.createCaller({ userId: '1' }).upload.getPresignedUrl({ fileName: 'big.mp4', contentType: 'video/mp4', fileSizeBytes: 600 * 1024 * 1024 } as any)).rejects.toThrow();
  });
});