"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var curtailmentForecast_exports = {};
__export(curtailmentForecast_exports, {
  buildForecastSlotKeys: () => buildForecastSlotKeys,
  currentBerlinSlotKey: () => currentBerlinSlotKey,
  currentPhase: () => currentPhase,
  detectCurtailmentWindow: () => detectCurtailmentWindow,
  forecastExportTargetW: () => forecastExportTargetW,
  forecastPowerAtHour: () => forecastPowerAtHour,
  normalizeForecastPowerW: () => normalizeForecastPowerW,
  normalizeForecastResolutionMin: () => normalizeForecastResolutionMin,
  readHourlyForecast: () => readHourlyForecast,
  remainingCurtailmentHours: () => remainingCurtailmentHours
});
module.exports = __toCommonJS(curtailmentForecast_exports);
const FORECAST_HOURS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
function normalizeForecastPowerW(raw, unit) {
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }
  const u = (unit || "").trim().toLowerCase();
  if (u === "kw" || u === "kilowatt" || u === "kilowatts") {
    return Math.round(raw * 1e3);
  }
  if (u === "w" || u === "watt" || u === "watts") {
    return Math.round(raw);
  }
  if (raw < 200) {
    return Math.round(raw * 1e3);
  }
  return Math.round(raw);
}
function normalizeForecastResolutionMin(raw) {
  const n = Number(raw);
  if (n === 15 || n === 30) {
    return n;
  }
  return 60;
}
function pad2(n) {
  return n.toString().padStart(2, "0");
}
function buildForecastSlotKeys(resolutionMin) {
  const minutes = resolutionMin === 15 ? [0, 15, 30, 45] : resolutionMin === 30 ? [0, 30] : [0];
  const keys = [];
  for (const h of FORECAST_HOURS) {
    for (const m of minutes) {
      keys.push(`${pad2(h)}:${pad2(m)}:00`);
    }
  }
  return keys;
}
function currentBerlinSlotKey(resolutionMin, now = /* @__PURE__ */ new Date()) {
  var _a, _b, _c, _d;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);
  const hour = Number((_b = (_a = parts.find((p) => p.type === "hour")) == null ? void 0 : _a.value) != null ? _b : 0);
  const minute = Number((_d = (_c = parts.find((p) => p.type === "minute")) == null ? void 0 : _c.value) != null ? _d : 0);
  const floored = Math.floor(minute / resolutionMin) * resolutionMin;
  return `${pad2(Math.min(23, Math.max(0, hour)))}:${pad2(floored)}:00`;
}
async function readHourlyForecast(plantPath, getState, getObject, resolutionMin = 60) {
  var _a;
  const base = plantPath.replace(/\.$/, "").trim();
  const resolution = normalizeForecastResolutionMin(resolutionMin);
  const channel = `${base}.power.hoursToday`;
  const hours = /* @__PURE__ */ new Map();
  const slots = /* @__PURE__ */ new Map();
  if (!base) {
    return { hours, slots };
  }
  for (const key of buildForecastSlotKeys(resolution)) {
    const id = `${channel}.${key}`;
    const st = await getState(id);
    if ((st == null ? void 0 : st.val) === null || (st == null ? void 0 : st.val) === void 0 || st.val === "") {
      continue;
    }
    const raw = Number(st.val);
    if (Number.isNaN(raw)) {
      continue;
    }
    let unit;
    if (getObject) {
      const obj = await getObject(id);
      const common = obj == null ? void 0 : obj.common;
      unit = common == null ? void 0 : common.unit;
    }
    const watts = normalizeForecastPowerW(raw, unit);
    slots.set(key, watts);
    const hour = Number(key.slice(0, 2));
    if (Number.isFinite(hour)) {
      hours.set(hour, Math.max((_a = hours.get(hour)) != null ? _a : 0, watts));
    }
  }
  return { hours, slots };
}
function detectCurtailmentWindow(forecast, acLimitW) {
  var _a, _b;
  const overHours = [];
  for (const [h, power] of forecast.hours) {
    if (power > acLimitW) {
      overHours.push(h);
    }
  }
  if (!overHours.length) {
    return {
      today: false,
      startHour: 0,
      endHour: 0,
      durationHours: 0,
      chargeDivisorHours: 0
    };
  }
  overHours.sort((a, b) => a - b);
  const startHour = (_a = overHours[0]) != null ? _a : 0;
  const endHour = (_b = overHours[overHours.length - 1]) != null ? _b : 0;
  const durationHours = endHour - startHour + 1;
  return {
    today: true,
    startHour,
    endHour,
    durationHours,
    chargeDivisorHours: durationHours + 1
  };
}
function currentPhase(window, nowHour) {
  if (!window.today) {
    return "idle";
  }
  if (nowHour < window.startHour) {
    return "before";
  }
  if (nowHour <= window.endHour) {
    return "active";
  }
  return "after";
}
function remainingCurtailmentHours(window, nowHour) {
  if (!window.today || nowHour > window.endHour) {
    return 0;
  }
  return Math.max(0, window.endHour - nowHour + 1);
}
function forecastPowerAtHour(forecast, hour) {
  var _a;
  return (_a = forecast.hours.get(hour)) != null ? _a : 0;
}
function forecastExportTargetW(forecast, nowHour, window, resolutionMin = 60, now = /* @__PURE__ */ new Date()) {
  var _a;
  if (!window.today) {
    return 0;
  }
  const resolution = normalizeForecastResolutionMin(resolutionMin);
  if (forecast.slots && forecast.slots.size > 0) {
    const slotKey = currentBerlinSlotKey(resolution, now);
    const slotW = (_a = forecast.slots.get(slotKey)) != null ? _a : 0;
    if (slotW > 0) {
      return slotW;
    }
  }
  const current = forecastPowerAtHour(forecast, nowHour);
  if (current > 0) {
    return current;
  }
  if (nowHour < window.startHour) {
    const atStart = forecastPowerAtHour(forecast, window.startHour);
    if (atStart > 0) {
      return atStart;
    }
  }
  let peak = 0;
  for (let h = window.startHour; h <= window.endHour; h++) {
    peak = Math.max(peak, forecastPowerAtHour(forecast, h));
  }
  return peak;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildForecastSlotKeys,
  currentBerlinSlotKey,
  currentPhase,
  detectCurtailmentWindow,
  forecastExportTargetW,
  forecastPowerAtHour,
  normalizeForecastPowerW,
  normalizeForecastResolutionMin,
  readHourlyForecast,
  remainingCurtailmentHours
});
//# sourceMappingURL=curtailmentForecast.js.map
