// @ts-check
import { defineConfig } from 'astro/config';
import rehypeImagePerformance from './src/utils/rehype-image-performance.mjs';

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeImagePerformance],
  },
});
