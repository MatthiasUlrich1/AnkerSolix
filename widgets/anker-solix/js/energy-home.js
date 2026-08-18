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
	version: "0.1.2",

	icons: {
		pv: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffb020" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
		home: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffb020" stroke-width="1.8"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"/></svg>',
		grid: '<svg viewBox="0 0 24 24" fill="none" stroke="#4da3ff" stroke-width="1.8"><path d="M12 3v18M8 6h8M9 10h6M10 14h4"/></svg>',
		battery: '<svg viewBox="0 0 24 24" fill="none" stroke="#45d17a" stroke-width="1.8"><rect x="4" y="7" width="16" height="10" rx="2"/><path d="M7 10h8M20 10v4"/></svg>',
		ev: '<svg viewBox="0 0 24 24" fill="none" stroke="#b07cff" stroke-width="1.8"><path d="M5 16h14l-1.5-5H7L5 16z"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg>',
	},

	flowMarkup:
		'<defs>' +
		'<linearGradient id="anker-grad-pv" gradientUnits="userSpaceOnUse" x1="50" y1="13" x2="50" y2="40"><stop offset="0%" stop-color="#ffd36a"/><stop offset="100%" stop-color="#ff9a1a"/></linearGradient>' +
		'<linearGradient id="anker-grad-grid" gradientUnits="userSpaceOnUse" x1="14" y1="51" x2="44" y2="44"><stop offset="0%" stop-color="#6eb6ff"/><stop offset="100%" stop-color="#2f7fe8"/></linearGradient>' +
		'<linearGradient id="anker-grad-battery" gradientUnits="userSpaceOnUse" x1="47" y1="45" x2="20" y2="73"><stop offset="0%" stop-color="#8ef0b0"/><stop offset="100%" stop-color="#45d17a"/></linearGradient>' +
		'<linearGradient id="anker-grad-ev" gradientUnits="userSpaceOnUse" x1="53" y1="45" x2="81" y2="54"><stop offset="0%" stop-color="#c89bff"/><stop offset="100%" stop-color="#8b4dff"/></linearGradient>' +
		'<linearGradient id="anker-grad-ev-cable" gradientUnits="userSpaceOnUse" x1="83" y1="55" x2="88" y2="56"><stop offset="0%" stop-color="#c89bff"/><stop offset="100%" stop-color="#8b4dff"/></linearGradient>' +
		'<filter id="anker-glow-pv" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<filter id="anker-glow-grid" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<filter id="anker-glow-battery" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<filter id="anker-glow-ev" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<marker id="anker-arrow-pv" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#ffb020"/></marker>' +
		'<marker id="anker-arrow-grid" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#4da3ff"/></marker>' +
		'<marker id="anker-arrow-battery" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#45d17a"/></marker>' +
		'<marker id="anker-arrow-ev" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#b07cff"/></marker>' +
		"</defs>" +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--pv" data-flow-glow="pv" d="M50,13 L50,40"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--pv" data-flow="pv" d="M50,13 L50,40" stroke="url(#anker-grad-pv)" filter="url(#anker-glow-pv)" marker-end="url(#anker-arrow-pv)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--grid" data-flow-glow="grid" d="M14,51 C26,51 36,47 44,44"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--grid" data-flow="grid" d="M14,51 C26,51 36,47 44,44" stroke="url(#anker-grad-grid)" filter="url(#anker-glow-grid)" marker-end="url(#anker-arrow-grid)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--battery" data-flow-glow="battery" d="M47,45 L47,57 Q47,61 43,61 L20,61 L20,73"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--battery" data-flow="battery" d="M47,45 L47,57 Q47,61 43,61 L20,61 L20,73" stroke="url(#anker-grad-battery)" filter="url(#anker-glow-battery)" marker-end="url(#anker-arrow-battery)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--ev" data-flow-glow="ev" d="M53,45 L53,57 Q53,61 57,61 L81,61 L81,54"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--ev" data-flow="ev" d="M53,45 L53,57 Q53,61 57,61 L81,61 L81,54" stroke="url(#anker-grad-ev)" filter="url(#anker-glow-ev)" marker-end="url(#anker-arrow-ev)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--ev anker-energy-home__flow--ev-cable" data-flow-glow="ev-cable" d="M83,55 L88,56"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--ev anker-energy-home__flow--ev-cable" data-flow="ev-cable" d="M83,55 L88,56" stroke="url(#anker-grad-ev-cable)" filter="url(#anker-glow-ev)" marker-end="url(#anker-arrow-ev)"/>',

	cardMarkup: function (zone, iconKey, label, valKey, subKey, left, top, hidden) {
		var icons = vis.binds["anker-solix"].icons;
		var sub = subKey
			? '<div class="anker-energy-home__sub" data-val="' + subKey + '"></div>'
			: "";
		return (
			'<div class="anker-energy-home__card' +
			(hidden ? " anker-energy-home__card--hidden" : "") +
			'" data-zone="' +
			zone +
			'" style="left:' +
			left +
			";top:" +
			top +
			'">' +
			'<div class="anker-energy-home__icon">' +
			icons[iconKey] +
			"</div>" +
			'<div class="anker-energy-home__card-body">' +
			'<div class="anker-energy-home__label">' +
			label +
			"</div>" +
			'<div class="anker-energy-home__value" data-val="' +
			valKey +
			'">—</div>' +
			sub +
			"</div></div>"
		);
	},

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
					'<svg class="anker-energy-home__flows" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' +
					api.flowMarkup +
					"</svg>" +
					'<div class="anker-energy-home__cards">' +
					api.cardMarkup("pv", "pv", "PV", "pv", null, "50%", "10%") +
					api.cardMarkup("home", "home", "Home", "home", null, "50%", "44%") +
					api.cardMarkup("grid", "grid", "Grid", "grid", null, "13%", "51%") +
					api.cardMarkup("battery", "battery", "SOC", "soc", null, "21%", "76%") +
					api.cardMarkup("ev", "ev", "EV", "ev", null, "79%", "55%", true) +
					"</div>" +
					'<div class="anker-energy-home__footer">' +
					'<div class="anker-energy-home__footer-item"><span class="anker-energy-home__footer-dot"></span><span data-val="self">Self-consumption —</span></div>' +
					'<div class="anker-energy-home__footer-item"><span class="anker-energy-home__footer-dot anker-energy-home__footer-dot--pv"></span><span data-val="daily">Today PV —</span></div>' +
					"</div>",
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
		return this.formatPower(n);
	},

	render: function (ctx) {
		var v = ctx.values;
		var $r = ctx.$root;

		$r.find('[data-val="pv"]').text(this.formatPower(v.pv));
		$r.find('[data-val="home"]').text(this.formatPower(v.home));
		$r.find('[data-val="grid"]').text(this.formatGrid(v.grid));

		if (ctx.oids.soc && ctx.oids.bat) {
			$r.find('[data-val="soc"]').text(
				Math.round(this.toNumber(v.soc)) + "% | " + this.formatPower(v.bat),
			);
		} else if (ctx.oids.soc) {
			$r.find('[data-val="soc"]').text(Math.round(this.toNumber(v.soc)) + "%");
		} else if (ctx.oids.bat) {
			$r.find('[data-val="soc"]').text(this.formatPower(v.bat));
		} else {
			$r.find('[data-val="soc"]').text("—");
		}

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
		var api = vis.binds["anker-solix"];

		function flowSpeed(w) {
			var abs = Math.abs(api.toNumber(w));
			if (abs < 20) {
				return null;
			}
			return Math.max(0.55, Math.min(2.2, 1.8 - abs / 8000)) + "s";
		}

		function setFlow(name, watts, reverseWhenNegative) {
			var active = Math.abs(api.toNumber(watts)) > 20;
			var reverse = reverseWhenNegative && api.toNumber(watts) < 0;
			var speed = flowSpeed(watts);
			var dash = "3 5";

			$r.find('[data-flow="' + name + '"], [data-flow-glow="' + name + '"]').each(function () {
				var el = this;
				el.classList.remove(
					"anker-energy-home__flow--idle",
					"anker-energy-home__flow--animate-forward",
					"anker-energy-home__flow--animate-reverse",
				);
				if (!active) {
					el.classList.add("anker-energy-home__flow--idle");
					el.style.strokeDasharray = "";
					el.style.animation = "";
					el.style.removeProperty("--anker-flow-speed");
					return;
				}
				el.style.strokeDasharray = dash;
				if (speed) {
					el.style.setProperty("--anker-flow-speed", speed);
				}
				el.classList.add(reverse ? "anker-energy-home__flow--animate-reverse" : "anker-energy-home__flow--animate-forward");
			});
		}

		setFlow("pv", v.pv, false);
		setFlow("grid", v.grid, true);
		setFlow("battery", v.bat, true);
		setFlow("ev", v.ev, false);
		setFlow("ev-cable", v.ev, false);
	},
};

vis.binds["anker-solix"].showVersion();
