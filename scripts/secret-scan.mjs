/* eslint-env node */
// scripts/secret-scan.mjs
// Scans STAGED diff for high-signal secret patterns.

import { execSync } from 'child_process';
import process from 'process';

/** @type {Array<{name: string, re: RegExp}>} */
const PATTERNS = [
  { name: "Bearer token",                  re: /bearer\s+[a-z0-9._\-]{20,}/i },
  { name: "Stripe secret key",             re: /\bsk_(live|test)_[0-9a-zA-Z]{10,}\b/ },
  { name: "Stripe publishable key",        re: /\bpk_(live|test)_[0-9a-zA-Z]{10,}\b/ },
  { name: "GitHub token (ghp_)",           re: /\bghp_[0-9a-zA-Z]{20,}\b/ },
  { name: "GitHub fine-grained token",     re: /\bgithub_pat_[0-9a-zA-Z_]{20,}\b/ },
  { name: "Slack token",                   re: /\bxox[baprs]-[0-9a-zA-Z-]{10,}\b/ },
  { name: "Google API key (AIza...)",      re: /\bAIza[0-9A-Za-z\-_]{30,}\b/ },
  { name: "JWT-like token",                re: /\beyJ[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\b/ },
  { name: "Suspicious key assignment",     re: /\b(api[_-]?key|secret|private[_-]?key|token)\s*[:=]\s*['"][^'"]{16,}['"]/i },
];

const ALLOWLIST = [/css-tokenizer/i, /js-tokens/i, /tokenizer/i];

function getStagedDiff() {
  try {
    return execSync("git diff --cached --unified=0 --no-color", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
  } catch {          // ← no binding needed; error is intentionally ignored
    return "";
  }
}

const isAllowlisted = (line) => ALLOWLIST.some((re) => re.test(line));

function main() {
  const diff = getStagedDiff();
  if (!diff.trim()) process.exit(0);

  const lines = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
  const hits = [];

  for (const line of lines) {
    if (isAllowlisted(line)) continue;
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        hits.push({ pattern: p.name, line });
      }
    }
  }

  if (hits.length) {
    console.error("\n✖ Commit blocked: possible secret detected in staged changes.\n");
    hits.slice(0, 10).forEach((h) => {
      console.error(`- ${h.pattern}: ${h.line.substring(0, 200)}`);
    });
    console.error("\nFix: remove the secret or move it to .env / Sanity secrets.\n");
    process.exit(1);
  }

  process.exit(0);
}

main();