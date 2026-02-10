import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
// import fs from 'fs';
// import fsp from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  site: 'https://briefing-usa.com/',
  base: '/feature/briefing_core/',
  // trailingSlash: 'never',
  outDir: 'dist/feature/briefing_core',
  server: {
    host: true,
    // output: 'static',
    // open: true,
  },
  // build: {
  //   assets: {
  //     prefix: '', // 任意（空でもよい）
  //     hash: false, // ← これがポイント！
  //   },
  // },
  // build: {
  //   format: 'preserve',
  // },
  vite: {
    // build: {
    //   cssCodeSplit: false, // ✅ CSSを分割せず1ファイルにする
    // },
    // base: '.',
    // build: {
    //   rollupOptions: {
    //     output: {
    //       entryFileNames: '_astro/[name].js',
    //       chunkFileNames: '_astro/[name].js',
    //       assetFileNames: '_astro/[name][extname]',
    //     },
    //   },
    // },
    resolve: {
      alias: {
        src: '/src',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        // '@lib': '/src/lib',
        '@functions': '/src/functions',
        '@scss': '/src/scss',
        '@styles': '/src/styles',
        // '@ts': '/src/ts',
        '@js': '/src/scripts',
        '@data': '/src/data',
        // '@types': '/src/types',
        '@images': '/src/images',
      },
    },
    css: {
      devSourcemap: true, // SCSSのソースマップを生成（ビルド時には自動的に無効になる）
      preprocessorOptions: {
        scss: {
          quietDeps: true, // 依存関係の警告を抑制
        },
      },
      // preprocessorOptions: {
      //   scss: {
      //     additionalData: `@use "src/styles/global" as *;`,
      //   },
      // },
    },
  },
  // output: 'server',
  // adapter: netlify(),
  integrations: [
    // {
    //   name: 'copyToWp',
    //   hooks: {
    //     'astro:build:done': async ({ dir }) => {
    //       const distDir = fileURLToPath(dir); // ✅ ← これが鍵
    //       const srcDir = path.resolve(distDir, '_astro');
    //       const destDir = path.resolve(__dirname, 'wpMamp/wp/wp-content/themes/line-inc/assets');

    //       console.log('📁 Copying from:', srcDir);
    //       console.log('📁 Copying to:', destDir);

    //       if (!fs.existsSync(srcDir)) {
    //         console.warn('⚠️ Source directory does not exist.');
    //         return;
    //       }

    //       await fsp.mkdir(destDir, { recursive: true });

    //       const files = await fsp.readdir(srcDir);
    //       for (const file of files) {
    //         await fsp.copyFile(path.join(srcDir, file), path.join(destDir, file));
    //         console.log('✅ Copied:', file);
    //       }

    //       console.log('🎉 Assets copied to WordPress theme.');
    //     },
    //   },
    // },
    [sitemap()],
    icon(),
  ],
});
