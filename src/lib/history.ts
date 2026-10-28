import { execFileSync } from "node:child_process";

export interface Change {
  hash: string;
  date: string;
  message: string;
  major: boolean;
}

const RECORD = "\x1e";
const FIELD = "\x1f";

let cached: Change[] | undefined;

export function getHistory() {
  cached ??= readHistory();
  return { changes: cached, total: cached.length };
}

function readHistory(): Change[] {
  let raw: string;
  try {
    raw = execFileSync(
      "git",
      [
        "log",
        `--format=${RECORD}%h${FIELD}%ad${FIELD}%s`,
        "--date=short",
        "--shortstat",
      ],
      { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    );
  } catch {
    return [];
  }

  const changes = raw
    .split(RECORD)
    .filter(Boolean)
    .map((record) => {
      const [head, ...rest] = record.split("\n");
      const [hash, date, message] = head.split(FIELD);
      const stat = rest.join(" ").match(/(\d+) files? changed/);
      return {
        hash,
        date,
        message: message.trim(),
        files: stat ? Number(stat[1]) : 0,
      };
    });

  const sizes = changes.map((c) => c.files).sort((a, b) => b - a);
  const cutoff = sizes[Math.floor(sizes.length / 4)] ?? Infinity;
  return changes.map(({ files, ...change }) => ({
    ...change,
    major: files > 0 && files >= cutoff,
  }));
}
