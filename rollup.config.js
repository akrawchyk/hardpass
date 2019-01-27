import fs from 'fs';
import path from 'path';
import alias from 'rollup-plugin-alias';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

const commitHash = (function() {
  try {
    return fs.readFileSync('.commithash', 'utf-8');
  } catch (err) {
    return 'unknown';
  }
})();

const now = new Date().toUTCString();

const banner = `/*
  @license
        hardpass.js v${pkg.version}
        ${now} - commit ${commitHash}

        https://github.com/akrawchyk/hardpass

        Released under the MIT License.
*/`;

const moduleAliases = {
  resolve: ['.js', '.json'],
  'package.json': path.resolve('package.json')
};

export default  {
  input: './src/hardpass/index.ts',
  plugins: [
    alias(moduleAliases),
    json(),
    typescript()
  ],
  output: [
    { file: 'dist/hardpass.umd.js', format: 'umd', name: 'hardpass', sourcemap: true, banner },
    { file: 'dist/hardpass.esm.js', format: 'esm', banner }
  ]
}
