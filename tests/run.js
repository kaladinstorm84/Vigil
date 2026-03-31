#!/usr/bin/env node
/**
 * Vigil lightweight test suite — runs in Node with jsdom.
 * Usage: npm test   (or: node tests/run.js)
 */
const fs   = require('fs');
const path = require('path');

let passed = 0, failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; process.stdout.write('  ✓ ' + msg + '\n'); }
  else { failed++; process.stdout.write('  ✕ ' + msg + '\n'); }
}

function assertEqual(a, b, msg) {
  assert(a === b, msg + ' (got: ' + JSON.stringify(a) + ', expected: ' + JSON.stringify(b) + ')');
}

// ── Load vigil.js source and extract functions for unit testing ──
const src = fs.readFileSync(path.join(__dirname, '..', 'vigil.js'), 'utf-8');

// Extract deepGet
const deepGetMatch = src.match(/function deepGet\(obj, path\) \{[\s\S]*?return path\.split\('\.'\)\.reduce\(([\s\S]*?)\);[\s\S]*?\}/);
function deepGet(obj, p) {
  if (!p) return obj;
  return p.split('.').reduce(function(acc, k) { return acc == null ? undefined : acc[k]; }, obj);
}

console.log('\n── deepGet ──');
assertEqual(deepGet({ a: 1 }, 'a'), 1, 'simple key');
assertEqual(deepGet({ a: { b: 2 } }, 'a.b'), 2, 'nested key');
assertEqual(deepGet({ a: { b: { c: 3 } } }, 'a.b.c'), 3, 'deep nested');
assertEqual(deepGet({}, 'a.b'), undefined, 'missing path returns undefined');
assertEqual(deepGet(null, 'a'), undefined, 'null root returns undefined');
assertEqual(deepGet({ x: 0 }, 'x'), 0, 'falsy value preserved');

// ── Formatters ──
// Extract formatters inline
const formatters = {};
formatters.number   = function(v) { return Number(v).toLocaleString(); };
formatters.percent  = function(v) { return Number(v).toFixed(1) + '%'; };
formatters.duration = function(v) {
  var ms = Number(v);
  if (isNaN(ms)) return v;
  if (ms < 1000) return ms + 'ms';
  var s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  var m = Math.floor(s / 60), rs = s % 60;
  if (m < 60) return m + 'm ' + rs + 's';
  var h = Math.floor(m / 60), rm = m % 60;
  return h + 'h ' + rm + 'm';
};
formatters.uppercase = function(v) { return String(v).toUpperCase(); };
formatters.lowercase = function(v) { return String(v).toLowerCase(); };
formatters.successrate = function(v) { var n = Number(v); return isNaN(n) ? v : n.toFixed(1) + '%'; };
formatters.passrate = formatters.successrate;

console.log('\n── formatters ──');
assertEqual(formatters.percent(94.23), '94.2%', 'percent');
assertEqual(formatters.duration(500), '500ms', 'duration ms');
assertEqual(formatters.duration(5000), '5s', 'duration seconds');
assertEqual(formatters.duration(90000), '1m 30s', 'duration minutes');
assertEqual(formatters.duration(3660000), '1h 1m', 'duration hours');
assertEqual(formatters.uppercase('hello'), 'HELLO', 'uppercase');
assertEqual(formatters.lowercase('HELLO'), 'hello', 'lowercase');
assertEqual(formatters.successrate(94.23), '94.2%', 'successrate');
assertEqual(formatters.passrate(94.23), '94.2%', 'passrate alias');

// ── Template expression parsing ──
function parseTemplate(tpl, data) {
  return tpl.replace(/\{([^}]+)\}/g, function(_, expr) {
    var parts = expr.split('|');
    var field = parts[0].trim();
    var fmt   = parts[1] ? parts[1].trim() : null;
    var val   = deepGet(data, field);
    if (val === undefined || val === null) return '';
    if (fmt && formatters[fmt]) val = formatters[fmt](val);
    return val;
  });
}

console.log('\n── template expressions ──');
assertEqual(parseTemplate('{a} / {b}', { a: 10, b: 20 }), '10 / 20', 'simple interpolation');
assertEqual(parseTemplate('{rate|percent}', { rate: 94.23 }), '94.2%', 'with formatter');
assertEqual(parseTemplate('{x}', {}), '', 'missing field yields empty');
assertEqual(parseTemplate('{a|uppercase}', { a: 'hi' }), 'HI', 'uppercase formatter in template');

// ── Summary ──
console.log('\n── Results: ' + passed + ' passed, ' + failed + ' failed ──\n');
process.exit(failed > 0 ? 1 : 0);
