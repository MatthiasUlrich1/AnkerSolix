import { expect } from "chai";

import {
	buildLiveWidgetHtml,
	buildOverviewHtml,
	cloudOnline,
	escapeHtml,
	type DashboardSiteSnapshot,
} from "./htmlDashboards";

function sampleSite(overrides: Partial<DashboardSiteSnapshot> = {}): DashboardSiteSnapshot {
	return {
		siteId: "site-1234567890",
		siteKey: "site-123",
		siteName: "Test Site",
		solar: 1200,
		home: 800,
		gridImport: 0,
		gridExport: 400,
		batteryCharge: 200,
		batteryDischarge: 0,
		soc: 72,
		batteryTemp: 28.5,
		mqttConnected: true,
		solarbankName: "SB4",
		solarbankModel: "AE103",
		solarbankOnline: true,
		smartmeterOnline: true,
		devices: [
			{
				type: "solarbank",
				typeLabel: "Solarbank",
				name: "SB4",
				model: "AE103",
				online: true,
				key: "SN1",
			},
		],
		settings: {
			appOutputPower: 800,
			homeLoadPreset: 300,
			chargeUpperLimit: 100,
			dischargeLowerLimit: 10,
			allowGridExport: true,
			acInputLimit: 800,
			operatingMode: "manual",
		},
		energy: {
			solar: 12.4,
			home: 9.1,
			gridImport: 1.2,
			gridExport: 4.3,
			batteryCharge: 2.1,
			batteryDischarge: 1.8,
			autarky: 86.8,
			selfConsumption: 65.3,
		},
		updatedAt: "2026-08-30T10:00:00.000Z",
		...overrides,
	};
}

describe("htmlDashboards", () => {
	it("escapes HTML", () => {
		expect(escapeHtml(`<script>"x"&</script>`)).to.equal("&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;");
	});

	it("builds live widget with credit link", () => {
		const html = buildLiveWidgetHtml(sampleSite());
		expect(html).to.include("SOLAR");
		expect(html).to.include("1200 W");
		expect(html).to.include("michihorn64/ioBroker.solix4");
		expect(html).to.include("Danke");
	});

	it("builds overview for multiple sites", () => {
		const html = buildOverviewHtml([sampleSite(), sampleSite({ siteName: "Site 2", siteKey: "site-456" })]);
		expect(html).to.include("Anlagen-Übersicht (2)");
		expect(html).to.include("Test Site");
		expect(html).to.include("Site 2");
	});

	it("detects cloud online state", () => {
		expect(cloudOnline({ cloud_state: "online" })).to.equal(true);
		expect(cloudOnline({ cloud_state: "offline" })).to.equal(false);
		expect(cloudOnline({ mqtt_connection: true })).to.equal(true);
	});
});
