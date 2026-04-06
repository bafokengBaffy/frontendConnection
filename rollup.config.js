import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';
import analyze from 'rollup-plugin-analyzer';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import svgr from '@svgr/rollup';
import url from '@rollup/plugin-url';

const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

export default {
  input: 'src/index.jsx',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'named',
      strict: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: !isProduction,
      exports: 'named',
      strict: true,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'App',
      sourcemap: !isProduction,
      exports: 'named',
      strict: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-router-dom': 'ReactRouterDOM',
      },
    },
  ],
  plugins: [
    peerDepsExternal(),
    del({ targets: 'dist/*' }),
    resolve({
      extensions: ['.js', '.jsx', '.json'],
    }),
    nodeResolve({
      preferBuiltins: false,
      browser: true,
    }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true,
    }),
    json(),
    image(),
    url({
      include: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'],
      limit: 8192,
      fileName: 'fonts/[name][hash][extname]',
    }),
    svgr(),
    babel({
      babelHelpers: 'bundled',
      exclude: /node_modules/,
      extensions: ['.js', '.jsx'],
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    }),
    postcss({
      modules: true,
      extract: 'styles.css',
      minimize: isProduction,
      sourceMap: !isProduction,
      use: ['sass'],
      extensions: ['.css', '.scss'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      preventAssignment: true,
    }),
    isProduction &&
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        format: {
          comments: false,
        },
        mangle: true,
        toplevel: true,
      }),
    copy({
      targets: [{ src: 'public/*', dest: 'dist', ignore: ['index.html'] }],
    }),
    isAnalyze &&
      analyze({
        summaryOnly: true,
        limit: 10,
      }),
    isAnalyze &&
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
      }),
  ],
  external: ['react', 'react-dom', 'react-router-dom'],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  },
};
