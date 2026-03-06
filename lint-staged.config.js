module.exports = {
  // JavaScript and JSX files
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run test:staged'
  ],
  
  // TypeScript and TSX files
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run test:staged'
  ],
  
  // CSS and SCSS files
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write'
  ],
  
  // JSON files
  '*.json': [
    'prettier --write'
  ],
  
  // Markdown files
  '*.{md,markdown}': [
    'prettier --write'
  ],
  
  // YAML files
  '*.{yml,yaml}': [
    'prettier --write'
  ],
  
  // GraphQL files
  '*.{graphql,gql}': [
    'prettier --write'
  ],
  
  // HTML files
  '*.html': [
    'prettier --write'
  ],
  
  // Image files
  '*.{png,jpeg,jpg,gif,svg}': [
    'imagemin-lint-staged'
  ],
  
  // Package files
  'package.json': [
    'npm run validate:dependencies'
  ]
};