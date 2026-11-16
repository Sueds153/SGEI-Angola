const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

async function buildCss() {
  console.log('[build-css] Starting Tailwind CSS v4 compilation...');
  const inputPath = path.resolve(__dirname, '../src/app/globals.css');
  const outputPath = path.resolve(__dirname, '../src/app/compiled.css');

  const css = fs.readFileSync(inputPath, 'utf8');
  const result = await postcss([tailwind()]).process(css, { from: inputPath });

  fs.writeFileSync(outputPath, result.css);
  console.log(`[build-css] Successfully compiled CSS to ${outputPath} (${result.css.length} bytes)`);
  console.log(`[build-css] Has .flex: ${result.css.includes('.flex')}, Has .grid: ${result.css.includes('.grid')}`);
}

buildCss().catch(err => {
  console.error('[build-css] Error compiling CSS:', err);
  process.exit(1);
});
