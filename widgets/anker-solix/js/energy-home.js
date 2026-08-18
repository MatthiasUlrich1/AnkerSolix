/*
 * ioBroker.anker-solix VIS / VIS-2 widget: Energy Home dashboard
 */
"use strict";

/* global $, vis, systemDictionary */

$.extend(true, systemDictionary, {
	"anker_instance": {
		"en": "Adapter instance",
		"de": "Adapter-Instanz",
		"ru": "Adapter instance",
		"pt": "Adapter instance",
		"nl": "Adapter instance",
		"fr": "Adapter instance",
		"it": "Adapter instance",
		"es": "Adapter instance",
		"pl": "Adapter instance",
		"uk": "Adapter instance",
		"zh-cn": "Adapter instance"
	},
	"anker_auto_discover": {
		"en": "Auto-discover states",
		"de": "States automatisch finden",
		"ru": "Auto-discover states",
		"pt": "Auto-discover states",
		"nl": "Auto-discover states",
		"fr": "Auto-discover states",
		"it": "Auto-discover states",
		"es": "Auto-discover states",
		"pl": "Auto-discover states",
		"uk": "Auto-discover states",
		"zh-cn": "Auto-discover states"
	},
	"anker_background": {
		"en": "Background image",
		"de": "Hintergrundbild",
		"ru": "Background image",
		"pt": "Background image",
		"nl": "Background image",
		"fr": "Background image",
		"it": "Background image",
		"es": "Background image",
		"pl": "Background image",
		"uk": "Background image",
		"zh-cn": "Background image"
	},
	"anker_group_manual": {
		"en": "Manual state IDs (optional)",
		"de": "Manuelle State-IDs (optional)",
		"ru": "Manual state IDs (optional)",
		"pt": "Manual state IDs (optional)",
		"nl": "Manual state IDs (optional)",
		"fr": "Manual state IDs (optional)",
		"it": "Manual state IDs (optional)",
		"es": "Manual state IDs (optional)",
		"pl": "Manual state IDs (optional)",
		"uk": "Manual state IDs (optional)",
		"zh-cn": "Manual state IDs (optional)"
	}
});

vis.binds["anker-solix"] = {
	version: "0.1.0",

	showVersion: function () {
		if (vis.binds["anker-solix"].version) {
			console.log("Version anker-solix widgets: " + vis.binds["anker-solix"].version);
			vis.binds["anker-solix"].version = null;
		}
	},

	createWidget: function (widgetID, view, data, style) {
		var $root = $("#" + widgetID);
		if (!$root.length) {
			return setTimeout(function () {
				vis.binds["anker-solix"].createWidget(widgetID, view, data, style);
			}, 100);
		}

		var api = vis.binds["anker-solix"];
		var ns = (data.instance || "anker-solix.0").replace(/\.$/, "");
		var bg = data.backgroundImage || "widgets/anker-solix/img/dashboard-bg.png";

		$root
			.addClass("anker-energy-home")
			.html(
				'<div class="anker-energy-home__bg"></div>' +
					'<div class="anker-energy-home__overlay"></div>' +
					'<svg class="anker-energy-home__flows" viewBox="0 0 100 100" preserveAspectRatio="none">' +
					'<path class="anker-energy-home__flow anker-energy-home__flow--pv" data-flow="pv" d="M50,12 L50,42"/>' +
					'<path class="anker-energy-home__flow anker-energy-home__flow--grid" data-flow="grid" d="M12,52 L42,52"/>' +
					'<path class="anker-energy-home__flow anker-energy-home__flow--battery" data-flow="battery" d="M22,72 L42,58"/>' +
					'<path class="anker-energy-home__flow anker-energy-home__flow--ev" data-flow="ev" d="M58,52 L82,58"/>' +
					"</svg>" +
					'<div class="anker-energy-home__card" data-zone="pv" style="left:50%;top:11%"><div class="anker-energy-home__label">PV</div><div class="anker-energy-home__value" data-val="pv">—</div></div>' +
					'<div class="anker-energy-home__card" data-zone="home" style="left:50%;top:46%"><div class="anker-energy-home__label">Home</div><div class="anker-energy-home__value" data-val="home">—</div></div>' +
					'<div class="anker-energy-home__card" data-zone="grid" style="left:14%;top:52%"><div class="anker-energy-home__label">Grid</div><div class="anker-energy-home__value" data-val="grid">—</div></div>' +
					'<div class="anker-energy-home__card" data-zone="battery" style="left:22%;top:74%"><div class="anker-energy-home__label">Battery</div><div class="anker-energy-home__value" data-val="soc">—</div><div class="anker-energy-home__sub" data-val="bat"> </div></div>' +
					'<div class="anker-energy-home__card anker-energy-home__card--hidden" data-zone="ev" style="left:78%;top:56%"><div class="anker-energy-home__label">EV</div><div class="anker-energy-home__value" data-val="ev">—</div></div>' +
					'<div class="anker-energy-home__footer">' +
					'<div class="anker-energy-home__footer-item"><span class="anker-energy-home__footer-dot"></span><span data-val="self">Self-consumption —</span></div>' +
					'<div class="anker-energy-home__footer-item"><span class="anker-energy-home__footer-dot anker-energy-home__footer-dot--pv"></span><span data-val="daily">Today PV —</span></div>' +
					"</div>" +
					'<div class="anker-energy-home__status" data-val="status"></div>',
			);

		$root.find(".anker-energy-home__bg").css("background-image", 'url("' + bg + '")');

		var ctx = {
			$root: $root,
			ns: ns,
			data: data,
			oids: {},
			values: { pv: 0, home: 0, grid: 0, soc: null, bat: 0, ev: 0, self: null, daily: null },
			bound: [],
		};

		$root.data("ankerEnergyCtx", ctx);

		if (data.autoDiscover !== false && data.autoDiscover !== "false") {
			api.discoverOids(ctx, function () {
				api.applyManualOids(ctx);
				api.bindStates(ctx);
				api.render(ctx);
			});
		} else {
			api.applyManualOids(ctx);
			api.bindStates(ctx);
			api.render(ctx);
		}
	},

	applyManualOids: function (ctx) {
		var d = ctx.data;
		if (d.oidPv) {
			ctx.oids.pv = d.oidPv;
		}
		if (d.oidHome) {
			ctx.oids.home = d.oidHome;
		}
		if (d.oidGrid) {
			ctx.oids.grid = d.oidGrid;
		}
		if (d.oidSoc) {
			ctx.oids.soc = d.oidSoc;
		}
		if (d.oidBatPower) {
			ctx.oids.bat = d.oidBatPower;
		}
		if (d.oidEv) {
			ctx.oids.ev = d.oidEv;
		}
		if (d.oidDailyPv) {
			ctx.oids.daily = d.oidDailyPv;
		}
		if (d.oidSelfConsumption) {
			ctx.oids.self = d.oidSelfConsumption;
		}
	},

	discoverOids: function (ctx, done) {
		var ns = ctx.ns;
		var prefix = ns + ".";

		function firstMatch(re) {
			var found = null;
			for (var id in vis.objects) {
				if (!Object.prototype.hasOwnProperty.call(vis.objects, id)) {
					continue;
				}
				if (id.indexOf(prefix) !== 0) {
					continue;
				}
				if (vis.objects[id] && vis.objects[id].type === "state" && re.test(id)) {
					found = id;
					break;
				}
			}
			return found;
		}

		function allMatches(re) {
			var out = [];
			for (var id in vis.objects) {
				if (!Object.prototype.hasOwnProperty.call(vis.objects, id)) {
					continue;
				}
				if (id.indexOf(prefix) !== 0) {
					continue;
				}
				if (vis.objects[id] && vis.objects[id].type === "state" && re.test(id)) {
					out.push(id);
				}
			}
			return out;
		}

		ctx.oids.pv =
			firstMatch(/\.system\.[^.]+\.sensors\.total_pv_power$/) ||
			firstMatch(/\.combiner_box\.[^.]+\.sensors\.total_pv_power$/) ||
			firstMatch(/\.modbus\.[^.]+\.sensors\.pv_power$/);

		ctx.oids.home =
			firstMatch(/\.system\.[^.]+\.sensors\.home_power$/) ||
			firstMatch(/\.modbus\.[^.]+\.sensors\.load_power$/);

		ctx.oids.grid =
			firstMatch(/\.smartmeter\.[^.]+\.sensors\.grid_power$/) ||
			firstMatch(/\.system\.[^.]+\.sensors\.grid_power$/) ||
			firstMatch(/\.modbus\.[^.]+\.sensors\.grid_power$/);

		ctx.oids.soc =
			firstMatch(/\.combiner_box\.[^.]+\.sensors\.total_state_of_charge$/) ||
			firstMatch(/\.system\.[^.]+\.sensors\.state_of_charge$/) ||
			firstMatch(/\.modbus\.[^.]+\.sensors\.battery_soc$/);

		ctx.oids.bat =
			firstMatch(/\.system\.[^.]+\.sensors\.battery_power$/) ||
			firstMatch(/\.modbus\.[^.]+\.sensors\.battery_discharging_power$/) ||
			firstMatch(/\.modbus\.[^.]+\.sensors\.battery_charging_power$/) ||
			firstMatch(/\.system\.[^.]+\.sensors\.bat_discharge_power$/) ||
			firstMatch(/\.system\.[^.]+\.sensors\.bat_charge_power$/);

		ctx.oids.ev = firstMatch(/\.ev_charger\.[^.]+\.sensors\.ev_charger_bat_charge_power$/);

		ctx.oids.daily =
			firstMatch(/\.combiner_box\.[^.]+\.statistics\.daily_solar_production$/) ||
			firstMatch(/\.system\.[^.]+\.statistics\.daily_solar_production$/);

		ctx.oids.self =
			firstMatch(/\.combiner_box\.[^.]+\.statistics\.daily_battery_share$/) ||
			firstMatch(/\.system\.[^.]+\.statistics\.daily_battery_share$/);

		ctx.oids.evPowerParts = allMatches(/\.ev_charger\.[^.]+\.sensors\.ev_charger_power_l[123]$/);

		if (!ctx.oids.grid) {
			ctx.$root.find('[data-zone="grid"]').addClass("anker-energy-home__card--hidden");
		}
		if (!ctx.oids.ev && (!ctx.oids.evPowerParts || !ctx.oids.evPowerParts.length)) {
			ctx.$root.find('[data-zone="ev"]').addClass("anker-energy-home__card--hidden");
		} else {
			ctx.$root.find('[data-zone="ev"]').removeClass("anker-energy-home__card--hidden");
		}
		if (!ctx.oids.soc && !ctx.oids.bat) {
			ctx.$root.find('[data-zone="battery"]').addClass("anker-energy-home__card--hidden");
		}

		if (typeof done === "function") {
			done();
		}
	},

	bindStates: function (ctx) {
		var api = vis.binds["anker-solix"];
		var keys = ["pv", "home", "grid", "soc", "bat", "ev", "daily", "self"];

		function bindOne(key, oid) {
			if (!oid) {
				return;
			}
			var stateKey = oid + ".val";
			function onChange(_e, newVal) {
				api.onValue(ctx, key, newVal);
			}
			if (vis.states[stateKey] !== undefined) {
				api.onValue(ctx, key, vis.states[stateKey]);
			}
			vis.states.bind(stateKey, onChange);
			ctx.bound.push(stateKey);
			if (!ctx._handlers) {
				ctx._handlers = [];
			}
			ctx._handlers.push({ key: stateKey, fn: onChange });
		}

		for (var i = 0; i < keys.length; i++) {
			bindOne(keys[i], ctx.oids[keys[i]]);
		}

		if (ctx.oids.evPowerParts && ctx.oids.evPowerParts.length) {
			for (var p = 0; p < ctx.oids.evPowerParts.length; p++) {
				(function (oid) {
					var stateKey = oid + ".val";
					function onEvPart() {
						var sum = 0;
						for (var j = 0; j < ctx.oids.evPowerParts.length; j++) {
							sum += api.toNumber(vis.states[ctx.oids.evPowerParts[j] + ".val"]);
						}
						api.onValue(ctx, "ev", sum);
					}
					vis.states.bind(stateKey, onEvPart);
					ctx.bound.push(stateKey);
					onEvPart();
				})(ctx.oids.evPowerParts[p]);
			}
		}
	},

	toNumber: function (val) {
		if (val === null || val === undefined || val === "") {
			return 0;
		}
		var n = Number(val);
		return isFinite(n) ? n : 0;
	},

	onValue: function (ctx, key, val) {
		ctx.values[key] = this.toNumber(val);
		this.render(ctx);
	},

	formatPower: function (w) {
		var n = this.toNumber(w);
		var abs = Math.abs(n);
		if (abs >= 1000) {
			return (n / 1000).toFixed(1) + " kW";
		}
		return Math.round(n) + " W";
	},

	formatGrid: function (w) {
		var n = this.toNumber(w);
		if (Math.abs(n) < 15) {
			return "0 W";
		}
		if (n > 0) {
			return this.formatPower(n) + " import";
		}
		return this.formatPower(n) + " export";
	},

	render: function (ctx) {
		var v = ctx.values;
		var $r = ctx.$root;

		$r.find('[data-val="pv"]').text(this.formatPower(v.pv));
		$r.find('[data-val="home"]').text(this.formatPower(v.home));
		$r.find('[data-val="grid"]').text(this.formatGrid(v.grid));

		if (ctx.oids.soc) {
			$r.find('[data-val="soc"]').text("SOC " + Math.round(this.toNumber(v.soc)) + "%");
		} else {
			$r.find('[data-val="soc"]').text("Battery");
		}

		var batText = "";
		if (ctx.oids.bat) {
			batText = this.formatPower(v.bat);
		}
		$r.find('[data-val="bat"]').text(batText);

		if (ctx.oids.ev || (ctx.oids.evPowerParts && ctx.oids.evPowerParts.length)) {
			$r.find('[data-val="ev"]').text(this.formatPower(v.ev));
		}

		if (ctx.oids.self) {
			$r.find('[data-val="self"]').text("Self-consumption " + Math.round(this.toNumber(v.self)) + "%");
		} else {
			$r.find('[data-val="self"]').text("Self-consumption —");
		}

		if (ctx.oids.daily) {
			$r.find('[data-val="daily"]').text("Today PV " + this.toNumber(v.daily).toFixed(1) + " kWh");
		} else {
			$r.find('[data-val="daily"]').text("Today PV —");
		}

		this.updateFlows($r, v);
	},

	updateFlows: function ($r, v) {
		function setFlow(name, active, reverse) {
			var $p = $r.find('[data-flow="' + name + '"]');
			$p.toggleClass("anker-energy-home__flow--idle", !active);
			if (reverse) {
				$p.css("stroke-dasharray", "8 8").css("animation", "anker-flow-reverse 1.2s linear infinite");
			} else if (active) {
				$p.css("stroke-dasharray", "8 8").css("animation", "anker-flow 1.2s linear infinite");
			} else {
				$p.css("animation", "none");
			}
		}

		setFlow("pv", Math.abs(v.pv) > 20, false);
		setFlow("grid", Math.abs(v.grid) > 20, v.grid < 0);
		setFlow("battery", Math.abs(v.bat) > 20, v.bat < 0);
		setFlow("ev", Math.abs(v.ev) > 20, false);
	},
};

if (typeof document !== "undefined") {
	var ankerFlowStyle = document.getElementById("anker-energy-home-keyframes");
	if (!ankerFlowStyle) {
		ankerFlowStyle = document.createElement("style");
		ankerFlowStyle.id = "anker-energy-home-keyframes";
		ankerFlowStyle.textContent =
			"@keyframes anker-flow { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }" +
			"@keyframes anker-flow-reverse { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 16; } }";
		document.head.appendChild(ankerFlowStyle);
	}
}

vis.binds["anker-solix"].showVersion();
