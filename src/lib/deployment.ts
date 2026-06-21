/** True when the app is built for static hosting on GitHub Pages. */
export function isGithubPagesDeployment(): boolean {
  return process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
}
