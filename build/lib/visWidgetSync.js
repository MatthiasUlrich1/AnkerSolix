"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var visWidgetSync_exports = {};
__export(visWidgetSync_exports, {
  syncVisWidgets: () => syncVisWidgets
});
module.exports = __toCommonJS(visWidgetSync_exports);
var fs = __toESM(require("node:fs"));
var path = __toESM(require("node:path"));
const VIS_ADAPTER_NAMES = ["vis", "vis-2"];
const WIDGETS_MARKER = "0.2.7";
function listFilesRecursive(dir, relative = "") {
  const out = [];
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
async function listVisInstances(adapter, visName) {
  try {
    const view = await adapter.getObjectViewAsync("system", "instance", {
      startkey: `system.adapter.${visName}.`,
      endkey: `system.adapter.${visName}.\uFFFF`
    });
    return view.rows.map((row) => row.id.replace("system.adapter.", "")).filter(Boolean);
  } catch {
    return [];
  }
}
async function copyWidgetsToInstance(adapter, instanceId, widgetsDir) {
  const files = listFilesRecursive(widgetsDir);
  let uploaded = 0;
  for (const file of files) {
    const target = `widgets/${file.rel}`;
    const data = fs.readFileSync(file.abs);
    try {
      await adapter.writeFileAsync(instanceId, target, data);
      uploaded++;
    } catch (err) {
      adapter.log.warn(`VIS widget upload failed (${instanceId}/${target}): ${err.message}`);
    }
  }
  return uploaded;
}
function requestVisRebuild(adapter, instanceId) {
  adapter.sendTo(instanceId, "rebuild", {}, (resp) => {
    if (resp && typeof resp === "object" && "error" in resp && resp.error) {
      const errText = typeof resp.error === "string" ? resp.error : resp.error instanceof Error ? resp.error.message : JSON.stringify(resp.error);
      adapter.log.debug(`VIS rebuild ${instanceId}: ${errText}`);
      return;
    }
    adapter.log.info(`VIS widget catalog rebuild requested on ${instanceId}`);
  });
}
async function syncVisWidgets(adapter, adapterDir) {
  var _a, _b;
  const widgetsDir = path.join(adapterDir, "widgets");
  if (!fs.existsSync(widgetsDir)) {
    adapter.log.debug("No widgets/ folder \u2014 skip VIS sync");
    return;
  }
  const marker = `${(_b = (_a = adapter.common) == null ? void 0 : _a.version) != null ? _b : "0"}-${WIDGETS_MARKER}`;
  const stateId = "info.visWidgetsSynced";
  await adapter.setObjectNotExistsAsync(stateId, {
    type: "state",
    common: {
      name: "VIS widgets synced (internal)",
      type: "string",
      role: "text",
      read: true,
      write: false
    },
    native: {}
  });
  const prev = await adapter.getStateAsync(stateId);
  if ((prev == null ? void 0 : prev.val) === marker) {
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
    adapter.log.info(`VIS widgets synced (${total} files) \u2014 reload VIS/VIS-2 editor (F5)`);
  } else {
    adapter.log.debug("VIS widgets sync: no vis/vis-2 instance found (install vis or vis-2)");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  syncVisWidgets
});
//# sourceMappingURL=visWidgetSync.js.map
