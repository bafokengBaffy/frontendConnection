module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3,
        targets: {
          browsers: [
            '> 0.2%',
            'not dead',
            'not op_mini all',
            'chrome >= 60',
            'firefox >= 60',
            'safari >= 12',
            'edge >= 79',
          ],
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: 'react',
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-dynamic-import',
    process.env.NODE_ENV === 'development' && 'react-refresh/babel',
    process.env.NODE_ENV === 'production' && [
      'babel-plugin-transform-react-remove-prop-types',
      {
        removeImport: true,
        ignoreFilenames: ['node_modules'],
      },
    ],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@pages': './src/pages',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@utils': './src/utils',
          '@context': './src/context',
          '@assets': './assets',
          '@styles': './src/styles',
          '@config': './src/config',
          '@types': './src/types',
          '@routing': './src/routing',
        },
      },
    ],
  ].filter(Boolean),
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  },
};
