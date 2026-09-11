# GitHub Pages Deployment

Production URL: `https://valie1.github.io/`

1. Open the existing `valie1.github.io` repository in GitHub Desktop.
2. Choose Repository → Show in Explorer.
3. Keep the hidden `.git` folder and remove the old website files from the repository working tree.
4. Copy every file and folder from Pass 123.08 into the repository root, including the hidden `.github` folder.
5. In GitHub Desktop, review the changes, commit them to the current default branch, and Push origin.
6. On GitHub.com, open Settings → Pages and set Build and deployment → Source to GitHub Actions.
7. Open the Actions tab and wait for `Deploy VALIE Portfolio to GitHub Pages` to finish successfully.
8. Open `https://valie1.github.io/` and hard refresh once if the previous site was cached.

The workflow installs the pinned dependencies, runs TypeScript and GitHub Pages compatibility checks, exports the site to `out/`, uploads that folder as the Pages artifact, and deploys it.

### Pass 123.07
No deployment changes. Website card hover affordances are visual-only and remain compatible with the existing GitHub Pages static export workflow.

### Pass 123.08
No deployment changes. This pass only removes the small active-tab underline marker from the three work-category tabs.
