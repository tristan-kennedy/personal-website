import { execFileSync } from "node:child_process";

const git = (...args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

try {
  if (git("rev-parse", "--is-shallow-repository") === "true") {
    git("fetch", "--unshallow", "--quiet");
    console.log("Fetched full git history for the About log.");
  }
} catch (error) {
  console.warn(
    `Could not fetch full git history: ${error.message.split("\n")[0]}`,
  );
}
