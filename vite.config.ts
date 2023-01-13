/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    test: {
      globals: true,
    },
  };
});
