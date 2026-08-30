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
var profiles_exports = {};
__export(profiles_exports, {
  MODBUS_PROFILES: () => MODBUS_PROFILES,
  MODBUS_PROFILE_ORDER: () => MODBUS_PROFILE_ORDER,
  getModbusProfile: () => getModbusProfile,
  matchProfileByProductCode: () => matchProfileByProductCode
});
module.exports = __toCommonJS(profiles_exports);
var import_types = require("./types");
const SOLARBANK_RANGES = [
  { type: "input", start: 1e4, end: 10050 },
  { type: "input", start: 10090, end: 10156 },
  { type: "input", start: 10208, end: 10265 },
  { type: "input", start: 32768, end: 32774 },
  { type: "holding", start: 10060, end: 10072 },
  { type: "holding", start: 10074, end: 10081 },
  { type: "holding", start: 6e4, end: 60003 }
];
const SOLARBANK_QUANTITIES = {
  device_model: {
    address: 32768,
    dataType: "STRING",
    count: 5,
    name: "Device model"
  },
  device_sn: {
    address: 10100,
    dataType: "STRING",
    count: 12,
    name: "Device serial"
  },
  device_sw_version: {
    address: 10112,
    dataType: "STRING",
    count: 6,
    name: "Firmware"
  },
  battery_soc: {
    address: 10014,
    dataType: "UINT16",
    count: 1,
    unit: "%",
    name: "Battery SOC"
  },
  pv_power: {
    address: 10002,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "PV power",
    additionalSources: ["third_party_pv_power"]
  },
  third_party_pv_power: {
    address: 10004,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Third-party PV power",
    internal: true
  },
  battery_charging_power: {
    address: 10008,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Battery charging power",
    powerSplit: "negative_only"
  },
  battery_discharging_power: {
    address: 10008,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Battery discharging power",
    powerSplit: "positive_only"
  },
  load_power: {
    address: 10010,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Load power"
  },
  grid_import_power: {
    address: 10012,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Grid import power",
    powerSplit: "positive_only"
  },
  grid_export_power: {
    address: 10012,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Grid export power",
    powerSplit: "negative_only"
  },
  ac_grid_output_power: {
    address: 10208,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "AC grid output power"
  },
  pv_total_generation: {
    address: 10018,
    dataType: "UINT32",
    count: 2,
    gain: 10,
    unit: "kWh",
    name: "PV total generation"
  },
  cumulative_charge_energy: {
    address: 10262,
    dataType: "UINT32",
    count: 2,
    gain: 10,
    unit: "kWh",
    name: "Cumulative charge energy"
  },
  cumulative_discharge_energy: {
    address: 10264,
    dataType: "UINT32",
    count: 2,
    gain: 10,
    unit: "kWh",
    name: "Cumulative discharge energy"
  },
  rated_energy: {
    address: 10250,
    dataType: "UINT32",
    count: 2,
    gain: 10,
    unit: "kWh",
    name: "Rated energy"
  },
  battery_status: {
    address: 10001,
    dataType: "UINT16",
    count: 1,
    name: "Battery status",
    valueMapping: { 0: "standby", 1: "charging", 2: "discharging", 3: "sleep" }
  },
  operating_mode: {
    address: 10064,
    dataType: "UINT16",
    count: 1,
    name: "Operating mode",
    valueMapping: {
      0: "self_consumption",
      1: "tou_mode",
      3: "third_party_control",
      4: "custom_mode",
      5: "socket_overlay_mode",
      6: "smart_mode",
      7: "dynamic_pricing"
    },
    internal: true
  },
  ems_mode_mask: {
    address: 32774,
    dataType: "UINT16",
    count: 1,
    name: "EMS mode mask",
    internal: true
  },
  max_charge_power: {
    address: 10036,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Max charge power",
    internal: true
  },
  max_discharge_power: {
    address: 10038,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Max discharge power",
    internal: true
  },
  battery_power_raw: {
    address: 10071,
    dataType: "INT32",
    count: 2,
    unit: "W",
    name: "Battery power setpoint raw",
    internal: true
  },
  charging_limit_soc: {
    address: 6e4,
    dataType: "UINT16",
    count: 1,
    unit: "%",
    name: "Charging limit SOC",
    internal: true
  },
  discharge_limit_soc: {
    address: 60001,
    dataType: "UINT16",
    count: 1,
    unit: "%",
    name: "Discharge limit SOC",
    internal: true
  },
  backup_reserve_soc: {
    address: 60002,
    dataType: "UINT16",
    count: 1,
    unit: "%",
    name: "Backup reserve SOC",
    internal: true
  },
  backup_soc_enable: {
    address: 60003,
    dataType: "UINT16",
    count: 1,
    name: "Backup SOC enable",
    valueMapping: { 0: "disabled", 1: "enabled" },
    internal: true
  }
};
const SOLARBANK_CONTROLS = [
  {
    id: "operating_mode",
    name: "Operating mode",
    kind: "select",
    address: 10064,
    dataType: "UINT16",
    count: 1,
    options: import_types.OPERATING_MODE_OPTIONS,
    optionLabels: import_types.OPERATING_MODE_LABELS,
    capabilityBits: import_types.OPERATING_MODE_CAPABILITY_BITS
  },
  {
    id: "backup_soc_enable",
    name: "Backup SOC enable",
    kind: "switch",
    address: 60003,
    dataType: "UINT16",
    count: 1
  },
  {
    id: "charging_limit_soc",
    name: "Charging limit SOC",
    kind: "number",
    address: 6e4,
    dataType: "UINT16",
    count: 1,
    unit: "%",
    min: 80,
    max: 100
  },
  {
    id: "discharge_limit_soc",
    name: "Discharge limit SOC",
    kind: "number",
    address: 60001,
    dataType: "UINT16",
    count: 1,
    unit: "%",
    min: 0,
    max: 20
  },
  {
    id: "backup_reserve_soc",
    name: "Backup reserve SOC",
    kind: "number",
    address: 60002,
    dataType: "UINT16",
    count: 1,
    unit: "%",
    min: 0,
    max: 100,
    requireBackupEnable: true
  },
  {
    id: "battery_power_direction",
    name: "Battery power direction",
    kind: "select",
    address: 10071,
    dataType: "INT32",
    count: 2,
    options: { charge: 0, discharge: 1 },
    optionLabels: { charge: "Charge", discharge: "Discharge" },
    neverRead: true,
    localOnly: true,
    requireThirdParty: true
  },
  {
    id: "battery_power_setpoint",
    name: "Battery power setpoint",
    kind: "number",
    address: 10071,
    dataType: "INT32",
    count: 2,
    unit: "W",
    min: 0,
    max: 1e4,
    neverRead: true,
    signedFromDirection: true,
    requireThirdParty: true
  }
];
function solarbankProfile(id, label, productCodes) {
  return {
    id,
    label,
    snKey: "device_sn",
    modelKey: "device_model",
    productCodes,
    ranges: SOLARBANK_RANGES,
    quantities: SOLARBANK_QUANTITIES,
    controls: SOLARBANK_CONTROLS
  };
}
const SMART_METER_GEN2 = {
  id: "smartMeterGen2",
  label: "Anker SOLIX Smart Meter Gen 2",
  snKey: "meter_sn",
  modelKey: "meter_model",
  productCodes: {
    DNSL: "Anker SOLIX Smart Meter Gen 2",
    DNSM: "Anker SOLIX Smart Meter Gen 2"
  },
  ranges: [
    { type: "holding", start: 10620, end: 10646 },
    { type: "holding", start: 10666, end: 10677 },
    { type: "holding", start: 10696, end: 10712 }
  ],
  quantities: {
    meter_model: { address: 10620, dataType: "STRING", count: 10, name: "Meter model" },
    meter_type: {
      address: 10630,
      dataType: "UINT16",
      count: 1,
      name: "Meter type",
      valueMapping: { 1: "single_phase", 2: "three_phase" }
    },
    meter_sn: { address: 10702, dataType: "STRING", count: 10, name: "Meter serial" },
    meter_sw_version: { address: 10696, dataType: "VERSION", count: 2, name: "Meter firmware" },
    primary_total_active_power: {
      address: 10644,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Primary total active power"
    },
    primary_phase_1_active_power: {
      address: 10638,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Primary phase 1 active power"
    },
    primary_phase_1_current: {
      address: 10635,
      dataType: "INT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Primary phase 1 current"
    },
    primary_phase_1_voltage: {
      address: 10632,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "V",
      name: "Primary phase 1 voltage"
    },
    primary_phase_2_active_power: {
      address: 10640,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Primary phase 2 active power"
    },
    primary_phase_2_current: {
      address: 10636,
      dataType: "INT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Primary phase 2 current"
    },
    primary_phase_2_voltage: {
      address: 10633,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "V",
      name: "Primary phase 2 voltage"
    },
    primary_phase_3_active_power: {
      address: 10642,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Primary phase 3 active power"
    },
    primary_phase_3_current: {
      address: 10637,
      dataType: "INT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Primary phase 3 current"
    },
    primary_phase_3_voltage: {
      address: 10634,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "V",
      name: "Primary phase 3 voltage"
    },
    secondary_total_active_power: {
      address: 10675,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Secondary total active power"
    },
    secondary_phase_1_active_power: {
      address: 10669,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Secondary phase 1 active power"
    },
    secondary_phase_1_current: {
      address: 10666,
      dataType: "INT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Secondary phase 1 current"
    },
    secondary_phase_2_active_power: {
      address: 10671,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Secondary phase 2 active power"
    },
    secondary_phase_2_current: {
      address: 10667,
      dataType: "INT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Secondary phase 2 current"
    },
    secondary_phase_3_active_power: {
      address: 10673,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Secondary phase 3 active power"
    },
    secondary_phase_3_current: {
      address: 10668,
      dataType: "INT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Secondary phase 3 current"
    }
  }
};
const SMART_PLUG_GEN2 = {
  id: "smartPlugGen2",
  label: "Anker SOLIX Smart Plug Gen 2",
  snKey: "device_sn",
  modelKey: "device_model",
  productCodes: {
    QNA: "Anker SOLIX Smart Plug Gen 2"
  },
  ranges: [
    { type: "holding", start: 3e4, end: 30037 },
    { type: "holding", start: 32768, end: 32772 }
  ],
  quantities: {
    device_model: { address: 32768, dataType: "STRING", count: 5, name: "Device model" },
    device_sn: { address: 30005, dataType: "STRING", count: 12, name: "Device serial" },
    real_time_power: {
      address: 30030,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "W",
      name: "Real-time power"
    },
    voltage: { address: 30031, dataType: "UINT16", count: 1, gain: 10, unit: "V", name: "Voltage" },
    current: { address: 30032, dataType: "UINT16", count: 1, gain: 100, unit: "A", name: "Current" },
    temperature: { address: 30037, dataType: "INT16", count: 1, gain: 10, unit: "\xB0C", name: "Temperature" },
    switch_status: {
      address: 30029,
      dataType: "UINT16",
      count: 1,
      name: "Switch status",
      valueMapping: { 0: "disconnected", 1: "connected" }
    }
  },
  controls: [
    {
      id: "power_switch",
      name: "Power switch",
      kind: "switch",
      address: 30047,
      dataType: "UINT16",
      count: 1,
      readFrom: "switch_status"
    }
  ]
};
const X1_LE = { wordOrder: "little" };
const X1_STR = { stringByteOrder: "low" };
const X1_HES = {
  id: "x1Hes",
  label: "Anker SOLIX X1 HES",
  snKey: "device_sn",
  modelKey: "device_model",
  productCodes: {
    A510: "Anker SOLIX X1 HES",
    A515: "Anker SOLIX X1 HES",
    A522: "Anker SOLIX X1 Battery Module",
    A534: "Anker SOLIX X1 Backup Controller"
  },
  ranges: [
    { type: "input", start: 1e4, end: 10039 },
    { type: "input", start: 10090, end: 10132 },
    { type: "input", start: 10156, end: 10215 },
    { type: "input", start: 10224, end: 10265 },
    { type: "holding", start: 10060, end: 10080 }
  ],
  quantities: {
    plant_status: {
      address: 1e4,
      dataType: "UINT16",
      count: 1,
      name: "Plant status",
      valueMapping: { 1: "on_grid", 2: "off_grid", 3: "standby", 4: "fault" }
    },
    battery_status: {
      address: 10001,
      dataType: "UINT16",
      count: 1,
      name: "Battery status",
      valueMapping: { 0: "standby", 1: "charging", 2: "discharging", 3: "sleep" }
    },
    pv_power: {
      address: 10002,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "PV power",
      additionalSources: ["third_party_pv_power"],
      ...X1_LE
    },
    third_party_pv_power: {
      address: 10004,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Third-party PV power",
      internal: true,
      ...X1_LE
    },
    battery_charging_power: {
      address: 10008,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Battery charging power",
      powerSplit: "negative_only",
      ...X1_LE
    },
    battery_discharging_power: {
      address: 10008,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Battery discharging power",
      powerSplit: "positive_only",
      ...X1_LE
    },
    load_power: {
      address: 10010,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Load power",
      ...X1_LE
    },
    grid_import_power: {
      address: 10012,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Grid import power",
      powerSplit: "positive_only",
      ...X1_LE
    },
    grid_export_power: {
      address: 10012,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Grid export power",
      powerSplit: "negative_only",
      ...X1_LE
    },
    battery_soc: {
      address: 10014,
      dataType: "UINT16",
      count: 1,
      unit: "%",
      name: "Battery SOC"
    },
    battery_soh: {
      address: 10015,
      dataType: "UINT16",
      count: 1,
      unit: "%",
      name: "Battery SOH"
    },
    pv_energy_total: {
      address: 10018,
      dataType: "UINT32",
      count: 2,
      gain: 100,
      unit: "kWh",
      name: "PV total generation",
      ...X1_LE
    },
    cumulative_charge_energy: {
      address: 10022,
      dataType: "UINT32",
      count: 2,
      gain: 100,
      unit: "kWh",
      name: "Cumulative charge energy",
      ...X1_LE
    },
    grid_import_energy: {
      address: 10030,
      dataType: "UINT32",
      count: 2,
      gain: 100,
      unit: "kWh",
      name: "Grid import energy",
      ...X1_LE
    },
    grid_export_energy: {
      address: 10034,
      dataType: "UINT32",
      count: 2,
      gain: 100,
      unit: "kWh",
      name: "Grid export energy",
      ...X1_LE
    },
    max_charge_power: {
      address: 10036,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Max charge power",
      internal: true,
      ...X1_LE
    },
    max_discharge_power: {
      address: 10038,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Max discharge power",
      internal: true,
      ...X1_LE
    },
    device_model: {
      address: 10090,
      dataType: "STRING",
      count: 10,
      name: "Device model",
      ...X1_STR
    },
    device_sn: {
      address: 10100,
      dataType: "STRING",
      count: 12,
      name: "Device serial",
      ...X1_STR
    },
    device_sw_version: {
      address: 10112,
      dataType: "STRING",
      count: 6,
      name: "Firmware",
      ...X1_STR
    },
    inverter_temperature: {
      address: 10156,
      dataType: "INT16",
      count: 1,
      gain: 10,
      unit: "\xB0C",
      name: "Inverter temperature"
    },
    usable_pv_power: {
      address: 10183,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Usable PV power",
      ...X1_LE
    },
    backup_power: {
      address: 10233,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Backup power",
      ...X1_LE
    },
    cumulative_discharge_energy: {
      address: 10264,
      dataType: "UINT32",
      count: 2,
      gain: 100,
      unit: "kWh",
      name: "Cumulative discharge energy",
      ...X1_LE
    },
    battery_module_count: {
      address: 10249,
      dataType: "UINT16",
      count: 1,
      name: "Battery module count"
    },
    operating_mode: {
      address: 10064,
      dataType: "UINT16",
      count: 1,
      name: "Work mode",
      valueMapping: {
        0: "self_consumption",
        1: "tou_mode",
        2: "backup_only",
        3: "third_party_control",
        4: "custom_mode",
        5: "socket_overlay_mode",
        20: "app_managed"
      },
      internal: true
    },
    battery_power_raw: {
      address: 10071,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Battery power setpoint raw",
      internal: true,
      ...X1_LE
    }
  },
  controls: [
    {
      id: "operating_mode",
      name: "Work mode",
      kind: "select",
      address: 10064,
      dataType: "UINT16",
      count: 1,
      options: {
        self_consumption: 0,
        tou_mode: 1,
        backup_only: 2,
        third_party_control: 3,
        custom_mode: 4,
        socket_overlay_mode: 5,
        app_managed: 20
      },
      optionLabels: {
        self_consumption: "Self-consumption",
        tou_mode: "Time of use",
        backup_only: "Backup only",
        third_party_control: "VPP / third-party",
        custom_mode: "User-defined",
        socket_overlay_mode: "Socket aggregation",
        app_managed: "App-managed"
      }
    },
    {
      id: "battery_power_direction",
      name: "Battery power direction",
      kind: "select",
      address: 10071,
      dataType: "INT32",
      count: 2,
      options: { charge: 0, discharge: 1 },
      optionLabels: { charge: "Charge", discharge: "Discharge" },
      neverRead: true,
      localOnly: true,
      requireThirdParty: true
    },
    {
      id: "battery_power_setpoint",
      name: "Battery power setpoint",
      kind: "number",
      address: 10071,
      dataType: "INT32",
      count: 2,
      unit: "W",
      min: 0,
      max: 12e3,
      neverRead: true,
      signedFromDirection: true,
      requireThirdParty: true,
      wordOrder: "little"
    }
  ]
};
const EV_CHARGER_V1 = {
  id: "evChargerV1",
  label: "Anker SOLIX V1 Smart EV Charger",
  snKey: "device_sn",
  modelKey: "device_model",
  productCodes: {
    A519: "Anker SOLIX V1 Smart EV Charger"
  },
  ranges: [
    { type: "input", start: 2e4, end: 20100 },
    { type: "holding", start: 21e3, end: 21005 }
  ],
  quantities: {
    device_model: { address: 20001, dataType: "STRING", count: 10, name: "Device model" },
    device_sn: { address: 20011, dataType: "STRING", count: 12, name: "Device serial" },
    device_sw_version: { address: 20023, dataType: "STRING", count: 6, name: "Firmware" },
    rated_power: {
      address: 20035,
      dataType: "INT32",
      count: 2,
      unit: "W",
      name: "Rated power"
    },
    phase_1_voltage: {
      address: 20053,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "V",
      name: "Phase 1 voltage"
    },
    phase_2_voltage: {
      address: 20054,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "V",
      name: "Phase 2 voltage"
    },
    phase_3_voltage: {
      address: 20055,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "V",
      name: "Phase 3 voltage"
    },
    phase_1_current: {
      address: 20059,
      dataType: "UINT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Phase 1 current"
    },
    phase_2_current: {
      address: 20060,
      dataType: "UINT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Phase 2 current"
    },
    phase_3_current: {
      address: 20061,
      dataType: "UINT16",
      count: 1,
      gain: 100,
      unit: "A",
      name: "Phase 3 current"
    },
    charge_power: {
      address: 20068,
      dataType: "UINT32",
      count: 2,
      unit: "W",
      name: "Charge power"
    },
    session_energy: {
      address: 20084,
      dataType: "UINT32",
      count: 2,
      gain: 1e3,
      unit: "kWh",
      name: "Session energy"
    },
    temperature_1: {
      address: 20093,
      dataType: "INT16",
      count: 1,
      unit: "\xB0C",
      name: "Internal temperature 1"
    },
    temperature_2: {
      address: 20094,
      dataType: "INT16",
      count: 1,
      unit: "\xB0C",
      name: "Internal temperature 2"
    },
    charging_status: {
      address: 20097,
      dataType: "UINT16",
      count: 1,
      name: "Charging status",
      valueMapping: {
        0: "idle",
        1: "preparing",
        2: "charging",
        3: "charger_paused",
        4: "vehicle_paused",
        5: "completed",
        6: "reserving",
        7: "disabled",
        8: "error"
      }
    },
    max_current_setting: {
      address: 21001,
      dataType: "UINT16",
      count: 1,
      gain: 10,
      unit: "A",
      name: "Max current setting",
      internal: true
    }
  },
  controls: [
    {
      id: "charge_command",
      name: "Charge command",
      kind: "select",
      address: 21e3,
      dataType: "UINT16",
      count: 1,
      options: { start: 1, stop: 2 },
      optionLabels: { start: "Start charging", stop: "Stop charging" },
      neverRead: true
    },
    {
      id: "max_current",
      name: "Max current",
      kind: "number",
      address: 21001,
      dataType: "UINT16",
      count: 1,
      unit: "A",
      min: 6,
      max: 32,
      writeGain: 10,
      readFrom: "max_current_setting"
    }
  ]
};
const MODBUS_PROFILES = {
  solarbank4: solarbankProfile("solarbank4", "Anker SOLIX Solarbank 4 E5000 Pro", {
    DN7M: "Anker SOLIX Solarbank 4 E5000 Pro",
    DPM4: "Anker SOLIX Solarbank 4 E5000 Pro"
  }),
  solarbankMaxAc: solarbankProfile("solarbankMaxAc", "Anker SOLIX Solarbank Max AC", {
    DMWH: "Anker SOLIX Solarbank Max AC",
    DMXU: "Anker SOLIX Solarbank Max AC",
    E25H: "Anker SOLIX Solarbank Max AC",
    DNMS: "Anker SOLIX XE AC",
    DPP4: "Anker SOLIX XE AC",
    DNN3: "Anker SOLIX XE AC"
  }),
  solarbankMax: solarbankProfile("solarbankMax", "Anker SOLIX Solarbank Max", {
    DMY6: "Anker SOLIX Solarbank Max",
    DN9U: "Anker SOLIX Solarbank Max",
    DPTK: "Anker SOLIX Solarbank Max",
    DNMT: "Anker SOLIX XE",
    DPP5: "Anker SOLIX XE",
    DNN4: "Anker SOLIX XE"
  }),
  smartMeterGen2: SMART_METER_GEN2,
  smartPlugGen2: SMART_PLUG_GEN2,
  x1Hes: X1_HES,
  evChargerV1: EV_CHARGER_V1
};
const MODBUS_PROFILE_ORDER = [
  "x1Hes",
  "evChargerV1",
  "solarbank4",
  "solarbankMaxAc",
  "solarbankMax",
  "smartMeterGen2",
  "smartPlugGen2"
];
function getModbusProfile(id) {
  return MODBUS_PROFILES[id];
}
function matchProfileByProductCode(code) {
  const key = (code || "").slice(0, 4).toUpperCase();
  if (!key) {
    return void 0;
  }
  for (const id of MODBUS_PROFILE_ORDER) {
    const profile = MODBUS_PROFILES[id];
    if (profile.productCodes[key]) {
      return profile;
    }
  }
  return void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MODBUS_PROFILES,
  MODBUS_PROFILE_ORDER,
  getModbusProfile,
  matchProfileByProductCode
});
//# sourceMappingURL=profiles.js.map
