import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// extends vitest expect with jest-dom matchers
expect.extend(matchers as any);

// mock window.URL.createObjectURL and revokeObjectURL
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: (obj: any) => 'blob://mock-url',
});
Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: (url: string) => {},
});

// mock XMLHttpRequest for upload progress simulation
function MockXHR() {
  let onload: any = null;
  let onerror: any = null;
  let onprogress: any = null;
  return {
    open: () => {},
    setRequestHeader: () => {},
    send: function () {
      // simulate async upload
      setTimeout(() => {
        if (onload) onload({ target: { status: 200 } });
      }, 10);
    },
    addEventListener: function (type: string, cb: any) {
      if (type === 'load') onload = cb;
      if (type === 'error') onerror = cb;
      if (type === 'progress') onprogress = cb;
    },
    upload: {
      addEventListener: function (type: string, cb: any) {
        if (type === 'progress') onprogress = cb;
      },
    },
    set onloadhandler(cb: any) {
      onload = cb;
    },
  } as any;
}

(global as any).XMLHttpRequest = MockXHR as any;

afterAll(() => {
  Object.defineProperty(window.URL, 'createObjectURL', {
    writable: true,
    value: originalCreateObjectURL,
  });
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    writable: true,
    value: originalRevokeObjectURL,
  });
});
