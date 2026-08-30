#!/usr/bin/env node
/** Point git at githooks/ (pre-push runs the same checks as CI check-and-lint). */
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!existsSync(path.join(root, ".git"))) {
	process.exit(0);
}
try {
	execSync("git config core.autocrlf false", { cwd: root, stdio: "ignore" });
	execSync("git config core.eol lf", { cwd: root, stdio: "ignore" });
	execSync("git config core.hooksPath githooks", { cwd: root, stdio: "ignore" });
} catch {
	// Non-fatal (e.g. bare clone, sandbox).
}
