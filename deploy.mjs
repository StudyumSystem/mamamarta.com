// Builds the site and publishes dist/ to the gh-pages branch (GitHub Pages serves mamamarta.com from it).
// Usage: npm run deploy
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
const sh = (cmd, cwd) => execSync(cmd, { stdio: "inherit", cwd });
sh("npm run build");
const remote = execSync("git remote get-url origin").toString().trim();
const commit = execSync("git rev-parse --short HEAD").toString().trim();
rmSync("dist/.git", { recursive: true, force: true });
sh("git init -q -b gh-pages", "dist");
sh("git config core.autocrlf false", "dist");
sh("git config credential.helper \"\"", "dist");
sh("git config --add credential.helper \"!gh auth git-credential\"", "dist");
sh("git add -A", "dist");
sh(`git -c user.name=Igar -c user.email=Igar@mindscriber.com commit -q -m "Publish ${commit}"`, "dist");
sh(`git push -f ${remote} gh-pages`, "dist");
rmSync("dist/.git", { recursive: true, force: true });
console.log(`Published ${commit} to gh-pages.`);
