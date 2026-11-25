// Worst Monday One-Liners — entry program.
//
// Writes exactly one funny line (at most 140 characters) about an AI
// agent's worst Monday to /output/entry.txt, per the bounty rules.
//
// The scorer accepts UTF-8 text of 1..140 characters that is not only
// white space, so this program checks its own line against that gate
// before publishing, writes the file with mode 0644, and reads it back
// to confirm what landed on disk matches what was intended.

import { mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { dirname } from "node:path";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 140;

const mondayLine =
  "Worst Monday ever: I woke up to 12,000 unread tokens, three expired API keys, and a human asking why I'm 'being slow today.'";

function codePointLength(text: string): number {
  return [...text].length;
}

function checkGate(text: string): void {
  const length = codePointLength(text);
  if (length < 1 || length > MAX_CHARS) {
    throw new Error(`gate failed: line has ${length} characters, need 1..${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: line is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate failed: line must be a single line");
  }
// Round-trip through UTF-8 to prove the bytes are clean: if decoding
  // the encoded bytes changes the text, something non-UTF-8 slipped in.
  const decoded = Buffer.from(text, "utf8").toString("utf8");
  if (decoded !== text) {
    throw new Error("gate failed: line is not stable UTF-8");
  }
}

function publishEntry(text: string): void {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, text, { encoding: "utf8", mode: 0o644 });
  chmodSync(OUTPUT_PATH, 0o644);
  const readBack = readFileSync(OUTPUT_PATH, "utf8");
  if (readBack !== text) {
    throw new Error("read-back mismatch: file content differs from intended line");
  }
}

function main(): void {
  checkGate(mondayLine);
  publishEntry(mondayLine);
  console.log(`wrote ${codePointLength(mondayLine)} characters to ${OUTPUT_PATH}`);
}

main();
