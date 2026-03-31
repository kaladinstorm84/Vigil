#!/usr/bin/env node
/**
 * build.js — Minify vigil.js and vigil.css into dist/
 * Produces: dist/vigil.min.js, dist/vigil.min.css, dist/vigil.esm.js
 */
const fs   = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// ── JS minification (simple, no external deps) ──────────────
const jsSrc = fs.readFileSync(path.join(__dirname, 'vigil.js'), 'utf-8');

// Strip comments (block and line) and collapse whitespace — lightweight approach
let jsMin = jsSrc
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/[^\n]*/g, '')
  .replace(/\n\s*\n/g, '\n')
  .replace(/^\s+/gm, '')
  .trim();

fs.writeFileSync(path.join(distDir, 'vigil.min.js'), jsMin);

// ── ESM wrapper ─────────────────────────────────────────────
const esmWrapper = jsSrc.replace(
  /\(function \(global\) \{/,
  'var global = typeof window !== "undefined" ? window : {};\n(function (global) {'
) + '\nexport default (typeof window !== "undefined" ? window.Vigil : {});\n';

fs.writeFileSync(path.join(distDir, 'vigil.esm.js'), esmWrapper);

// ── CSS minification (strip comments, whitespace) ───────────
const cssSrc = fs.readFileSync(path.join(__dirname, 'vigil.css'), 'utf-8');
let cssMin = cssSrc
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>~+])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

fs.writeFileSync(path.join(distDir, 'vigil.min.css'), cssMin);

// ── Report ──────────────────────────────────────────────────
function kb(str) { return (Buffer.byteLength(str) / 1024).toFixed(1); }
console.log('Build complete:');
console.log('  dist/vigil.min.js   ' + kb(jsMin)  + ' KB');
console.log('  dist/vigil.esm.js   ' + kb(esmWrapper) + ' KB');
console.log('  dist/vigil.min.css  ' + kb(cssMin) + ' KB');
