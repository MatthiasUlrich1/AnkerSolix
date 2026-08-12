/**
 * Resolve a Python executable (default 3.12+; Debian Bookworm containers allow 3.11).
 *
 * @module
 */

const { spawnSync } = require("node:child_process");
const { getMinimumPythonMinor } = require("./pythonInstallEnv");

const MIN_MAJOR = 3;
/** Documented / default floor (non-Bookworm hosts). Dynamic floor: getMinimumPythonMinor(). */
const MIN_MINOR = 12;

/** @param {string} text stdout/stderr from `python --version` */
function parsePythonVersionText(text) {
	const m = (text || "").match(/Python\s+(\d+)\.(\d+)(?:\.(\d+))?/i);
	if (!m) {
		return null;
	}
	return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3] || 0) };
}

/**
 * @param {number} major
 * @param {number} minor
 * @param {number} [minMinor] Override minimum minor (default: host-aware)
 */
function versionMeetsMinimum(major, minor, minMinor = getMinimumPythonMinor()) {
	return major > MIN_MAJOR || (major === MIN_MAJOR && minor >= minMinor);
}

function trySpawn(cmd, args, cwd) {
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

function windowsPyLauncherPaths(cwd) {
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

/**
 * @param {PythonCommand} spec
 * @param {string[]} extra
 * @param {string} [cwd]
 */
function runPython(spec, extra, cwd) {
	return trySpawn(spec.cmd, [...spec.prefix, ...extra], cwd);
}

/**
 * @param {PythonCommand} spec
 * @param {string} [cwd]
 */
function pythonVersionOk(spec, cwd) {
	const text = pythonVersionText(spec, cwd);
	if (!text) {
		return false;
	}
	const parsed = parsePythonVersionText(text);
	return parsed !== null && versionMeetsMinimum(parsed.major, parsed.minor);
}

/**
 * @param {PythonCommand} spec
 * @param {string} [cwd]
 */
function pythonVersionText(spec, cwd) {
	const r = runPython(spec, ["--version"], cwd);
	return (r.stdout || r.stderr).trim();
}

/**
 * @param {string} [customPath] Admin pythonPath or installer --python
 * @returns {PythonCommand[]} Candidate spawn specs in preference order
 */
function buildCandidates(customPath, cwd) {
	const list = [];

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

	const seen = new Set();
	return list.filter(spec => {
		const key = `${spec.cmd}\0${spec.prefix.join(",")}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

/**
 * @param {string} [customPath]
 * @param {string} [cwd]
 * @returns {PythonCommand | null} First matching Python command or null
 */
function resolvePythonCommand(customPath, cwd) {
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

/**
 * @param {string} [customPath]
 * @param {string} [cwd]
 * @returns {string | null} Human-readable reason when nothing matches
 */
function describePythonProbe(customPath, cwd) {
	const minMinor = getMinimumPythonMinor();
	const lines = [];
	for (const spec of buildCandidates(customPath, cwd)) {
		const ver = runPython(spec, ["--version"], cwd);
		if (!ver.ok) {
			lines.push(`${spec.label}: not found`);
			continue;
		}
		const text = pythonVersionText(spec, cwd) || (ver.stdout + ver.stderr).trim();
		if (!pythonVersionOk(spec, cwd)) {
			lines.push(`${spec.label}: ${text} (need ${MIN_MAJOR}.${minMinor}+)`);
		} else {
			lines.push(`${spec.label}: ${text} OK`);
		}
	}
	return lines.length ? lines.join("; ") : "no Python candidates";
}

/** @param {PythonCommand} spec */
function isPyLauncherSpec(spec) {
	return process.platform === "win32" && spec.cmd === "py" && spec.prefix.length > 0;
}

module.exports = {
	MIN_MAJOR,
	MIN_MINOR,
	buildCandidates,
	resolvePythonCommand,
	describePythonProbe,
	runPython,
	pythonVersionOk,
	pythonVersionText,
	parsePythonVersionText,
	versionMeetsMinimum,
	isPyLauncherSpec,
	getMinimumPythonMinor,
};
