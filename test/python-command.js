const assert = require("assert");
const {
	buildCandidates,
	parsePythonVersionText,
	resolvePythonCommand,
	versionMeetsMinimum,
	getMinimumPythonMinor,
	MIN_MINOR,
} = require("../tools/pythonCommand");
const { parseOsReleaseIsBookworm, BOOKWORM_CONTAINER_MIN_PYTHON_MINOR } = require("../tools/pythonInstallEnv");

describe("python command resolution", () => {
	it("parsePythonVersionText accepts Python 3.12.4", () => {
		const parsed = parsePythonVersionText("Python 3.12.4");
		assert.deepStrictEqual(parsed, { major: 3, minor: 12, patch: 4 });
		assert.strictEqual(versionMeetsMinimum(parsed.major, parsed.minor, 12), true);
	});

	it("rejects Python 3.11 when minMinor is 12 (default hosts)", () => {
		const parsed = parsePythonVersionText("Python 3.11.9");
		assert.ok(parsed);
		assert.strictEqual(versionMeetsMinimum(parsed.major, parsed.minor, 12), false);
	});

	it("accepts Python 3.11 when minMinor is 11 (Bookworm container floor)", () => {
		const parsed = parsePythonVersionText("Python 3.11.2");
		assert.ok(parsed);
		assert.strictEqual(versionMeetsMinimum(parsed.major, parsed.minor, 11), true);
		assert.strictEqual(versionMeetsMinimum(3, 10, 11), false);
	});

	it("Windows / non-Bookworm CI hosts keep default min minor 12", function () {
		if (process.platform === "win32" || process.platform === "darwin") {
			assert.strictEqual(getMinimumPythonMinor(), MIN_MINOR);
			assert.strictEqual(getMinimumPythonMinor(), 12);
			return;
		}
		// Linux CI runners are not Bookworm containers → still 12
		assert.strictEqual(getMinimumPythonMinor(), 12);
	});

	it("Windows candidates prefer py -3.13 and py -3.12 before py -3", function () {
		if (process.platform !== "win32") {
			this.skip();
		}
		const candidates = buildCandidates();
		const labels = candidates.map(c => c.label);
		const i312 = labels.indexOf("py -3.12");
		const i313 = labels.indexOf("py -3.13");
		const i3 = labels.indexOf("py -3");
		assert.ok(i313 >= 0 && i312 >= 0 && i3 >= 0);
		assert.ok(i313 < i312);
		assert.ok(i312 < i3);
	});

	it("resolvePythonCommand returns null or a host-minimum-compliant spec", function () {
		const spec = resolvePythonCommand();
		if (!spec) {
			this.skip(`no Python 3.${getMinimumPythonMinor()}+ on this CI host`);
		}
		assert.ok(spec.label.length > 0);
		assert.ok(spec.cmd.length > 0);
	});
});

describe("Bookworm os-release detection", () => {
	it("detects Debian Bookworm VERSION_CODENAME", () => {
		assert.strictEqual(
			parseOsReleaseIsBookworm('PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"\nVERSION_CODENAME=bookworm\n'),
			true,
		);
		assert.strictEqual(parseOsReleaseIsBookworm('VERSION_CODENAME="bookworm"\n'), true);
	});

	it("rejects non-Bookworm codenames and VERSION_ID-only matches", () => {
		assert.strictEqual(parseOsReleaseIsBookworm("VERSION_CODENAME=trixie\nVERSION_ID=13\n"), false);
		assert.strictEqual(parseOsReleaseIsBookworm('VERSION_ID="12"\nVERSION_CODENAME=jammy\n'), false);
		assert.strictEqual(parseOsReleaseIsBookworm("VERSION_ID=12\n"), false);
		assert.strictEqual(BOOKWORM_CONTAINER_MIN_PYTHON_MINOR, 11);
	});
});
