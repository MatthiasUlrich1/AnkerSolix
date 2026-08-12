/**
 * Detect host environment for Python dependency installation (tools/install-python.js).
 */

const fs = require("node:fs");

/** Default minimum Python minor (upstream anker-solix-api / HA). */
const DEFAULT_MIN_PYTHON_MINOR = 12;
/** Best-effort floor for Debian 12 Bookworm containers (system python3 is 3.11). */
const BOOKWORM_CONTAINER_MIN_PYTHON_MINOR = 11;

/** @returns {"windows" | "macos" | "linux-server" | "ha-iobroker" | "container"} Install profile id */
function detectInstallProfile(adapterRoot) {
	if (process.platform === "win32") {
		return "windows";
	}
	if (process.platform === "darwin") {
		return "macos";
	}

	const root = (adapterRoot || "").replace(/\\/g, "/").toLowerCase();
	const cwd = process.cwd().replace(/\\/g, "/").toLowerCase();

	if (root.includes("/data/iobroker") || cwd.includes("/data/iobroker")) {
		return "ha-iobroker";
	}

	if (isHomeAssistantOs()) {
		return "ha-iobroker";
	}

	if (isLinuxContainer()) {
		return "container";
	}

	return "linux-server";
}

function isHomeAssistantOs() {
	try {
		if (!fs.existsSync("/etc/os-release")) {
			return false;
		}
		const text = fs.readFileSync("/etc/os-release", "utf8");
		return (
			/\bHOMEASSISTANT\b/i.test(text) ||
			/\bHOMEASSISTANT_OS\b/i.test(text) ||
			/\bhaos\b/i.test(text) ||
			/SUPERVISOR/i.test(text)
		);
	} catch {
		return false;
	}
}

function isLinuxContainer() {
	return fs.existsSync("/.dockerenv") || inContainerCgroup();
}

function inContainerCgroup() {
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

/**
 * Debian 12 Bookworm (e.g. buanet/iobroker:latest-v11).
 * Prefer VERSION_CODENAME; do not treat other distros with VERSION_ID=12 as Bookworm.
 */
function parseOsReleaseIsBookworm(text) {
	return /^\s*VERSION_CODENAME\s*=\s*"?bookworm"?\s*$/im.test(text || "");
}

function isDebianBookworm() {
	try {
		if (!fs.existsSync("/etc/os-release")) {
			return false;
		}
		return parseOsReleaseIsBookworm(fs.readFileSync("/etc/os-release", "utf8"));
	} catch {
		return false;
	}
}

/**
 * True only for Linux containers on Debian Bookworm.
 * Bare-metal Bookworm, Windows, macOS, and non-Bookworm containers stay on 3.12+.
 */
function isDebianBookwormContainer() {
	if (process.platform === "win32" || process.platform === "darwin") {
		return false;
	}
	return isLinuxContainer() && isDebianBookworm();
}

/** @returns {number} Minimum accepted Python 3.x minor version for this host */
function getMinimumPythonMinor() {
	if (isDebianBookwormContainer()) {
		return BOOKWORM_CONTAINER_MIN_PYTHON_MINOR;
	}
	return DEFAULT_MIN_PYTHON_MINOR;
}

/** @returns {"venv-first" | "site-packages-first"} Preferred install order */
function installOrder(profile) {
	if (profile === "ha-iobroker" || profile === "container") {
		// venv is not subject to PEP 668; prefer it before touching system pip
		return "venv-first";
	}
	return "venv-first";
}

/** @returns {string[]} Log hint lines for the profile */
function hintLines(profile) {
	switch (profile) {
		case "ha-iobroker":
			return [
				"Home Assistant ioBroker add-on: Python is PEP 668 (externally managed).",
				"Installer tries venv first, then pip with --break-system-packages / PIP_BREAK_SYSTEM_PACKAGES.",
				"If it still fails: copy python/site-packages from a working Ubuntu install, or run node tools/install-python.js in the add-on SSH shell.",
			];
		case "container":
			if (isDebianBookwormContainer()) {
				return [
					"Debian 12 Bookworm container: system python3 is 3.11 — accepted as best-effort (upstream prefers 3.12+).",
					"Preferred: install Python 3.12+ into a persistent path and set pythonPath in admin.",
				];
			}
			return [
				"Container host: prefer Python 3.12+ (venv or site-packages in the adapter folder).",
				"If venv is unavailable, installer falls back to site-packages.",
			];
		case "windows":
			return [
				"Windows: install Python 3.12+ from python.org (include pip).",
				"Installer tries py -3.13, py -3.12, then Program Files Python paths before generic py -3.",
				"Or set pythonPath in admin to the full path of python.exe.",
			];
		case "macos":
			return ["macOS: brew install python@3.12 (includes pip) if automatic install fails."];
		default:
			return ["Debian/Ubuntu: sudo apt install python3-venv python3-pip (Python 3.12+)"];
	}
}

/** @returns {string} Human-readable profile label */
function profileLabel(profile) {
	const labels = {
		windows: "Windows",
		macos: "macOS",
		"linux-server": "Linux server",
		"ha-iobroker": "Home Assistant ioBroker add-on",
		container: "Linux container",
	};
	return labels[profile] || profile;
}

module.exports = {
	DEFAULT_MIN_PYTHON_MINOR,
	BOOKWORM_CONTAINER_MIN_PYTHON_MINOR,
	detectInstallProfile,
	installOrder,
	hintLines,
	profileLabel,
	isHomeAssistantOs,
	isLinuxContainer,
	isDebianBookworm,
	isDebianBookwormContainer,
	getMinimumPythonMinor,
	parseOsReleaseIsBookworm,
};
