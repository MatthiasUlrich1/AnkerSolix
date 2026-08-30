/**
 * Deploy VIS / VIS-2 widget files and trigger editor reload.
 *
 * ioBroker copies widget sets from node_modules on vis startup, but GitHub installs
 * and in-place updates can leave the editor without the latest widgets/anker-solix.html.
 */

import * as fs from "node:fs";
import * as path from "node:path";

const VIS_ADAPTER_NAMES = ["vis", "vis-2"] as const;
const WIDGETS_MARKER = "0.2.7";

function listFilesRecursive(dir: string, relative = ""): { rel: string; abs: string }[] {
	const out: { rel: string; abs: string }[] = [];
	if (!fs.existsSync(dir)) {
		return out;
	}
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const rel = relative ? `${relative}/${entry.name}` : entry.name;
		const abs = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...listFilesRecursive(abs, rel));
		} else {
			out.push({ rel: rel.replace(/\\/g, "/"), abs });
		}
	}
	return out;
}

async function listVisInstances(adapter: ioBroker.Adapter, visName: string): Promise<string[]> {
	try {
		const view = await adapter.getObjectViewAsync("system", "instance", {
			startkey: `system.adapter.${visName}.`,
			endkey: `system.adapter.${visName}.\uffff`,
		});
		return view.rows.map((row: { id: string }) => row.id.replace("system.adapter.", "")).filter(Boolean);
	} catch {
		return [];
	}
}

async function copyWidgetsToInstance(
	adapter: ioBroker.Adapter,
	instanceId: string,
	widgetsDir: string,
): Promise<number> {
	const files = listFilesRecursive(widgetsDir);
	let uploaded = 0;
	for (const file of files) {
		const target = `widgets/${file.rel}`;
		const data = fs.readFileSync(file.abs);
		try {
			await adapter.writeFileAsync(instanceId, target, data);
			uploaded++;
		} catch (err) {
			adapter.log.warn(`VIS widget upload failed (${instanceId}/${target}): ${(err as Error).message}`);
		}
	}
	return uploaded;
}

function requestVisRebuild(adapter: ioBroker.Adapter, instanceId: string): void {
	adapter.sendTo(instanceId, "rebuild", {}, resp => {
		if (resp && typeof resp === "object" && "error" in resp && resp.error) {
			const errText =
				typeof resp.error === "string"
					? resp.error
					: resp.error instanceof Error
						? resp.error.message
						: JSON.stringify(resp.error);
			adapter.log.debug(`VIS rebuild ${instanceId}: ${errText}`);
			return;
		}
		adapter.log.info(`VIS widget catalog rebuild requested on ${instanceId}`);
	});
}

/** Copy widgets/ to vis + vis-2 file storage and ask vis-2 to rebuild widgets.html. */
export async function syncVisWidgets(adapter: ioBroker.Adapter, adapterDir: string): Promise<void> {
	const widgetsDir = path.join(adapterDir, "widgets");
	if (!fs.existsSync(widgetsDir)) {
		adapter.log.debug("No widgets/ folder — skip VIS sync");
		return;
	}

	const marker = `${adapter.common?.version ?? "0"}-${WIDGETS_MARKER}`;
	const stateId = "info.visWidgetsSynced";
	await adapter.setObjectNotExistsAsync(stateId, {
		type: "state",
		common: {
			name: "VIS widgets synced (internal)",
			type: "string",
			role: "text",
			read: true,
			write: false,
		},
		native: {},
	});

	const prev = await adapter.getStateAsync(stateId);
	if (prev?.val === marker) {
		return;
	}

	let total = 0;
	for (const visName of VIS_ADAPTER_NAMES) {
		const instances = await listVisInstances(adapter, visName);
		for (const instanceId of instances) {
			total += await copyWidgetsToInstance(adapter, instanceId, widgetsDir);
			if (visName === "vis-2") {
				requestVisRebuild(adapter, instanceId);
			}
		}
	}

	if (total > 0) {
		await adapter.setState(stateId, marker, true);
		adapter.log.info(`VIS widgets synced (${total} files) — reload VIS/VIS-2 editor (F5)`);
	} else {
		adapter.log.debug("VIS widgets sync: no vis/vis-2 instance found (install vis or vis-2)");
	}
}
