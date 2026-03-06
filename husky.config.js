module.exports = {
  hooks: {
    'pre-commit': 'lint-staged',
    'pre-push': 'npm run test:ci',
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
    'post-commit': 'git status',
    'post-checkout': 'npm install',
    'post-merge': 'npm install',
    'pre-rebase': 'echo "Please do not rebase main branch"',
    'prepare-commit-msg': 'exec < /dev/tty && npx cz --hook || true',
  }
};