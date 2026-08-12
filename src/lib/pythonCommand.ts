import { spawnSync } from "node:child_process";
import * as fs from "node:fs";

const MIN_MAJOR = 3;
/** Documented / default floor (non-Bookworm hosts). Dynamic floor: getMinimumPythonMinor(). */
const MIN_MINOR = 12;
const BOOKWORM_CONTAINER_MIN_PYTHON_MINOR = 11;

export interface PythonCommand {
	cmd: string;
	prefix: string[];
	label: string;
}

export interface ParsedPythonVersion {
	major: number;
	minor: number;
	patch: number;
}

function isLinuxContainer(): boolean {
	if (fs.existsSync("/.dockerenv")) {
		return true;
	}
	try {
		if (!fs.existsSync("/proc/1/cgroup")) {
			return false;
		}
		const text = fs.readFileSync("/proc/1/cgroup", "utf8");
		return /docker|kubepods|containerd|lxc/i.test(text);
	} catch {
		return false;
	}
}

/** Debian 12 Bookworm only (VERSION_CODENAME). */
export function isDebianBookworm(): boolean {
	try {
		if (!fs.existsSync("/etc/os-release")) {
			return false;
		}
		const text = fs.readFileSync("/etc/os-release", "utf8");
		return /^\s*VERSION_CODENAME\s*=\s*"?bookworm"?\s*$/im.test(text);
	} catch {
		return false;
	}
}

/**
 * True only for Linux containers on Debian Bookworm (e.g. buanet v11).
 * Bare-metal Bookworm / Windows / macOS / other containers stay on 3.12+.
 */
export function isDebianBookwormContainer(): boolean {
	if (process.platform === "win32" || process.platform === "darwin") {
		return false;
	}
	return isLinuxContainer() && isDebianBookworm();
}

/** Minimum accepted Python 3.x minor for this host. */
export function getMinimumPythonMinor(): number {
	if (isDebianBookwormContainer()) {
		return BOOKWORM_CONTAINER_MIN_PYTHON_MINOR;
	}
	return MIN_MINOR;
}

export function parsePythonVersionText(text: string): ParsedPythonVersion | null {
	const m = (text || "").match(/Python\s+(\d+)\.(\d+)(?:\.(\d+))?/i);
	if (!m) {
		return null;
	}
	return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3] || 0) };
}

export function versionMeetsMinimum(major: number, minor: number, minMinor: number = getMinimumPythonMinor()): boolean {
	return major > MIN_MAJOR || (major === MIN_MAJOR && minor >= minMinor);
}

function trySpawn(cmd: string, args: string[], cwd?: string): { ok: boolean; stdout: string; stderr: string } {
	const result = spawnSync(cmd, args, {
		cwd,
		encoding: "utf8",
		shell: false,
		windowsHide: true,
	});
	return {
		ok: result.status === 0,
		stdout: (result.stdout || "").trim(),
		stderr: (result.stderr || "").trim(),
	};
}

function windowsPyLauncherPaths(cwd?: string): string[] {
	const result = spawnSync("py", ["-0p"], {
		cwd,
		encoding: "utf8",
		shell: false,
		windowsHide: true,
	});
	if (result.status !== 0) {
		return [];
	}
	const text = `${result.stdout || ""}\n${result.stderr || ""}`;
	const paths = text
		.split(/\r?\n/)
		.map(line => line.trim())
		.map(line => {
			const m = line.match(/([A-Za-z]:\\[^*"]*python(?:\.exe)?)/i);
			return m ? m[1] : "";
		})
		.filter(Boolean);
	return [...new Set(paths)];
}

export function runPython(spec: PythonCommand, extra: string[], cwd?: string): { ok: boolean } {
	return trySpawn(spec.cmd, [...spec.prefix, ...extra], cwd);
}

export function pythonVersionText(spec: PythonCommand, cwd?: string): string {
	const r = trySpawn(spec.cmd, [...spec.prefix, "--version"], cwd);
	return (r.stdout || r.stderr).trim();
}

export function pythonVersionOk(spec: PythonCommand, cwd?: string): boolean {
	const text = pythonVersionText(spec, cwd);
	if (!text) {
		return false;
	}
	const parsed = parsePythonVersionText(text);
	return parsed !== null && versionMeetsMinimum(parsed.major, parsed.minor);
}

export function buildCandidates(customPath?: string, cwd?: string): PythonCommand[] {
	const list: PythonCommand[] = [];

	if (customPath?.trim()) {
		const p = customPath.trim();
		list.push({ cmd: p, prefix: [], label: p });
	}

	if (process.platform === "win32") {
		for (const minor of [13, 12]) {
			list.push({ cmd: "py", prefix: [`-${MIN_MAJOR}.${minor}`], label: `py -${MIN_MAJOR}.${minor}` });
		}
		list.push({ cmd: "py", prefix: ["-3"], label: "py -3" });
		for (const exe of windowsPyLauncherPaths(cwd)) {
			list.push({ cmd: exe, prefix: [], label: exe });
		}
		list.push({ cmd: "python", prefix: [], label: "python" });
		list.push({ cmd: "python3", prefix: [], label: "python3" });
	} else {
		list.push({ cmd: "python3", prefix: [], label: "python3" });
		list.push({ cmd: "python", prefix: [], label: "python" });
	}

	const seen = new Set<string>();
	return list.filter(spec => {
		const key = `${spec.cmd}\0${spec.prefix.join(",")}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

export function resolvePythonCommand(customPath?: string, cwd?: string): PythonCommand | null {
	for (const spec of buildCandidates(customPath, cwd)) {
		const text = pythonVersionText(spec, cwd);
		if (!text) {
			continue;
		}
		const parsed = parsePythonVersionText(text);
		if (!parsed || !versionMeetsMinimum(parsed.major, parsed.minor)) {
			continue;
		}
		return spec;
	}
	return null;
}

export function isPyLauncherSpec(spec: PythonCommand): boolean {
	return process.platform === "win32" && spec.cmd === "py" && spec.prefix.length > 0;
}

export { MIN_MAJOR, MIN_MINOR, BOOKWORM_CONTAINER_MIN_PYTHON_MINOR };
