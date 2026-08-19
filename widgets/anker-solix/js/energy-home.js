/*
 * ioBroker.anker-solix VIS / VIS-2 widget: Energy Home dashboard
 */
"use strict";

/* global $, vis, systemDictionary */

$.extend(true, systemDictionary, {
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
	"anker_group_states": {
		"en": "State bindings",
		"de": "State-Zuordnungen",
		"ru": "State bindings",
		"pt": "State bindings",
		"nl": "State bindings",
		"fr": "State bindings",
		"it": "State bindings",
		"es": "State bindings",
		"pl": "State bindings",
		"uk": "State bindings",
		"zh-cn": "State bindings"
	},
	"anker_oid_pv": {
		"en": "PV power",
		"de": "PV-Leistung",
		"ru": "PV power",
		"pt": "PV power",
		"nl": "PV power",
		"fr": "PV power",
		"it": "PV power",
		"es": "PV power",
		"pl": "PV power",
		"uk": "PV power",
		"zh-cn": "PV power"
	},
	"anker_oid_home": {
		"en": "Home load",
		"de": "Hausverbrauch",
		"ru": "Home load",
		"pt": "Home load",
		"nl": "Home load",
		"fr": "Home load",
		"it": "Home load",
		"es": "Home load",
		"pl": "Home load",
		"uk": "Home load",
		"zh-cn": "Home load"
	},
	"anker_group_grid": {
		"en": "Grid flows",
		"de": "Netz-Flüsse",
		"ru": "Grid flows",
		"pt": "Grid flows",
		"nl": "Grid flows",
		"fr": "Grid flows",
		"it": "Grid flows",
		"es": "Grid flows",
		"pl": "Grid flows",
		"uk": "Grid flows",
		"zh-cn": "Grid flows"
	},
	"anker_group_battery": {
		"en": "Battery",
		"de": "Batterie",
		"ru": "Battery",
		"pt": "Battery",
		"nl": "Battery",
		"fr": "Battery",
		"it": "Battery",
		"es": "Battery",
		"pl": "Battery",
		"uk": "Battery",
		"zh-cn": "Battery"
	},
	"anker_oid_grid_import": {
		"en": "Grid → Home (grid_to_home_power)",
		"de": "Netz → Haus (grid_to_home_power)",
		"ru": "Grid import (grid_to_home_power)",
		"pt": "Grid import (grid_to_home_power)",
		"nl": "Grid import (grid_to_home_power)",
		"fr": "Grid import (grid_to_home_power)",
		"it": "Grid import (grid_to_home_power)",
		"es": "Grid import (grid_to_home_power)",
		"pl": "Grid import (grid_to_home_power)",
		"uk": "Grid import (grid_to_home_power)",
		"zh-cn": "Grid import (grid_to_home_power)"
	},
	"anker_oid_grid_export": {
		"en": "PV → Grid (photovoltaic_to_grid_power)",
		"de": "PV → Netz (photovoltaic_to_grid_power)",
		"ru": "Grid export (photovoltaic_to_grid_power)",
		"pt": "Grid export (photovoltaic_to_grid_power)",
		"nl": "Grid export (photovoltaic_to_grid_power)",
		"fr": "Grid export (photovoltaic_to_grid_power)",
		"it": "Grid export (photovoltaic_to_grid_power)",
		"es": "Grid export (photovoltaic_to_grid_power)",
		"pl": "Grid export (photovoltaic_to_grid_power)",
		"uk": "Grid export (photovoltaic_to_grid_power)",
		"zh-cn": "Grid export (photovoltaic_to_grid_power)"
	},
	"anker_oid_soc": {
		"en": "Battery SOC (%)",
		"de": "Batterie SOC (%)",
		"ru": "Battery SOC (%)",
		"pt": "Battery SOC (%)",
		"nl": "Battery SOC (%)",
		"fr": "Battery SOC (%)",
		"it": "Battery SOC (%)",
		"es": "Battery SOC (%)",
		"pl": "Battery SOC (%)",
		"uk": "Battery SOC (%)",
		"zh-cn": "Battery SOC (%)"
	},
	"anker_oid_bat_charge": {
		"en": "Battery charge (bat_charge_power)",
		"de": "Batterie laden (bat_charge_power)",
		"ru": "Battery charge (bat_charge_power)",
		"pt": "Battery charge (bat_charge_power)",
		"nl": "Battery charge (bat_charge_power)",
		"fr": "Battery charge (bat_charge_power)",
		"it": "Battery charge (bat_charge_power)",
		"es": "Battery charge (bat_charge_power)",
		"pl": "Battery charge (bat_charge_power)",
		"uk": "Battery charge (bat_charge_power)",
		"zh-cn": "Battery charge (bat_charge_power)"
	},
	"anker_oid_bat_discharge": {
		"en": "Battery discharge (bat_discharge_power)",
		"de": "Batterie entladen (bat_discharge_power)",
		"ru": "Battery discharge (bat_discharge_power)",
		"pt": "Battery discharge (bat_discharge_power)",
		"nl": "Battery discharge (bat_discharge_power)",
		"fr": "Battery discharge (bat_discharge_power)",
		"it": "Battery discharge (bat_discharge_power)",
		"es": "Battery discharge (bat_discharge_power)",
		"pl": "Battery discharge (bat_discharge_power)",
		"uk": "Battery discharge (bat_discharge_power)",
		"zh-cn": "Battery discharge (bat_discharge_power)"
	},
	"anker_oid_ev": {
		"en": "EV charge power",
		"de": "EV-Ladeleistung",
		"ru": "EV charge power",
		"pt": "EV charge power",
		"nl": "EV charge power",
		"fr": "EV charge power",
		"it": "EV charge power",
		"es": "EV charge power",
		"pl": "EV charge power",
		"uk": "EV charge power",
		"zh-cn": "EV charge power"
	},
	"anker_oid_daily_pv": {
		"en": "Today PV (kWh)",
		"de": "Heute PV (kWh)",
		"ru": "Today PV (kWh)",
		"pt": "Today PV (kWh)",
		"nl": "Today PV (kWh)",
		"fr": "Today PV (kWh)",
		"it": "Today PV (kWh)",
		"es": "Today PV (kWh)",
		"pl": "Today PV (kWh)",
		"uk": "Today PV (kWh)",
		"zh-cn": "Today PV (kWh)"
	},
	"anker_oid_self": {
		"en": "Self-consumption (%)",
		"de": "Eigenverbrauch (%)",
		"ru": "Self-consumption (%)",
		"pt": "Self-consumption (%)",
		"nl": "Self-consumption (%)",
		"fr": "Self-consumption (%)",
		"it": "Self-consumption (%)",
		"es": "Self-consumption (%)",
		"pl": "Self-consumption (%)",
		"uk": "Self-consumption (%)",
		"zh-cn": "Self-consumption (%)"
	}
});

vis.binds["anker-solix"] = {
	version: "0.2.5",

	flowThresholdW: 20,

	icons: {
		pv: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffb020" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
		home: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffb020" stroke-width="1.8"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"/></svg>',
		grid: '<svg viewBox="0 0 24 24" fill="none" stroke="#4da3ff" stroke-width="1.8"><path d="M12 3v18M8 6h8M9 10h6M10 14h4"/></svg>',
		battery: '<svg viewBox="0 0 24 24" fill="none" stroke="#45d17a" stroke-width="1.8"><rect x="4" y="7" width="16" height="10" rx="2"/><path d="M7 10h8M20 10v4"/></svg>',
		ev: '<svg viewBox="0 0 24 24" fill="none" stroke="#b07cff" stroke-width="1.8"><path d="M5 16h14l-1.5-5H7L5 16z"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg>',
	},

	flowMarkup:
		'<defs>' +
		'<linearGradient id="anker-grad-pv" gradientUnits="userSpaceOnUse" x1="50" y1="14" x2="50" y2="38"><stop offset="0%" stop-color="#ffd36a"/><stop offset="100%" stop-color="#ff9a1a"/></linearGradient>' +
		'<linearGradient id="anker-grad-grid-import" gradientUnits="userSpaceOnUse" x1="16" y1="47" x2="43" y2="44"><stop offset="0%" stop-color="#6eb6ff"/><stop offset="100%" stop-color="#2f7fe8"/></linearGradient>' +
		'<linearGradient id="anker-grad-grid-export" gradientUnits="userSpaceOnUse" x1="43" y1="46" x2="16" y2="55"><stop offset="0%" stop-color="#6eb6ff"/><stop offset="100%" stop-color="#2f7fe8"/></linearGradient>' +
		'<linearGradient id="anker-grad-bat-charge" gradientUnits="userSpaceOnUse" x1="44" y1="48" x2="24" y2="72"><stop offset="0%" stop-color="#8ef0b0"/><stop offset="100%" stop-color="#45d17a"/></linearGradient>' +
		'<linearGradient id="anker-grad-bat-discharge" gradientUnits="userSpaceOnUse" x1="24" y1="72" x2="44" y2="48"><stop offset="0%" stop-color="#45d17a"/><stop offset="100%" stop-color="#8ef0b0"/></linearGradient>' +
		'<linearGradient id="anker-grad-ev" gradientUnits="userSpaceOnUse" x1="57" y1="44" x2="76" y2="55"><stop offset="0%" stop-color="#c89bff"/><stop offset="100%" stop-color="#8b4dff"/></linearGradient>' +
		'<linearGradient id="anker-grad-ev-cable" gradientUnits="userSpaceOnUse" x1="78" y1="55" x2="83" y2="55"><stop offset="0%" stop-color="#c89bff"/><stop offset="100%" stop-color="#8b4dff"/></linearGradient>' +
		'<filter id="anker-glow-pv" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<filter id="anker-glow-grid" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<filter id="anker-glow-battery" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<filter id="anker-glow-ev" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
		'<marker id="anker-arrow-pv" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#ffb020"/></marker>' +
		'<marker id="anker-arrow-grid" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#4da3ff"/></marker>' +
		'<marker id="anker-arrow-battery" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#45d17a"/></marker>' +
		'<marker id="anker-arrow-ev" markerWidth="4" markerHeight="4" refX="3.2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 Z" fill="#b07cff"/></marker>' +
		"</defs>" +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--pv" data-flow-glow="pv" d="M50,14 L50,38"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--pv" data-flow="pv" d="M50,14 L50,38" stroke="url(#anker-grad-pv)" filter="url(#anker-glow-pv)" marker-end="url(#anker-arrow-pv)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--grid" data-flow-glow="grid-import" d="M16,47 C30,47 38,45 43,44"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--grid" data-flow="grid-import" d="M16,47 C30,47 38,45 43,44" stroke="url(#anker-grad-grid-import)" filter="url(#anker-glow-grid)" marker-end="url(#anker-arrow-grid)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--grid" data-flow-glow="grid-export" d="M43,46 C38,49 28,53 16,55"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--grid" data-flow="grid-export" d="M43,46 C38,49 28,53 16,55" stroke="url(#anker-grad-grid-export)" filter="url(#anker-glow-grid)" marker-end="url(#anker-arrow-grid)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--battery" data-flow-glow="bat-discharge" d="M24,72 L24,57 L44,57 L44,48"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--battery" data-flow="bat-discharge" d="M24,72 L24,57 L44,57 L44,48" stroke="url(#anker-grad-bat-discharge)" filter="url(#anker-glow-battery)" marker-end="url(#anker-arrow-battery)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--battery" data-flow-glow="bat-charge" d="M44,48 L44,57 L24,57 L24,72"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--battery" data-flow="bat-charge" d="M44,48 L44,57 L24,57 L24,72" stroke="url(#anker-grad-bat-charge)" filter="url(#anker-glow-battery)" marker-end="url(#anker-arrow-battery)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--ev" data-flow-glow="ev" d="M57,44 L57,60 L76,60 L76,55"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--ev" data-flow="ev" d="M57,44 L57,60 L76,60 L76,55" stroke="url(#anker-grad-ev)" filter="url(#anker-glow-ev)" marker-end="url(#anker-arrow-ev)"/>' +
		'<path class="anker-energy-home__flow-glow anker-energy-home__flow--ev anker-energy-home__flow--ev-cable" data-flow-glow="ev-cable" d="M78,55 L83,55"/>' +
		'<path class="anker-energy-home__flow anker-energy-home__flow--ev anker-energy-home__flow--ev-cable" data-flow="ev-cable" d="M78,55 L83,55" stroke="url(#anker-grad-ev-cable)" filter="url(#anker-glow-ev)" marker-end="url(#anker-arrow-ev)"/>',

	cardMarkup: function (zone, iconKey, label, valKey, left, top) {
		var icons = vis.binds["anker-solix"].icons;
		return (
			'<div class="anker-energy-home__card" data-zone="' +
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
			'<div class="anker-energy-home__label" data-label="' +
			zone +
			'">' +
			label +
			"</div>" +
			'<div class="anker-energy-home__value" data-val="' +
			valKey +
			'">—</div>' +
			"</div></div>"
		);
	},

	showVersion: function () {
		if (vis.binds["anker-solix"].version) {
			console.log("Version anker-solix widgets: " + vis.binds["anker-solix"].version);
			vis.binds["anker-solix"].version = null;
		}
	},

	destroyWidget: function (widgetID) {
		var $all = $('[id="' + widgetID + '"]');
		if ($all.length > 1) {
			$all.slice(0, -1).remove();
			$all = $('[id="' + widgetID + '"]');
		}

		var $root = $all.first();
		if (!$root.length) {
			return;
		}

		var ctx = $root.data("ankerEnergyCtx");
		if (ctx && ctx._handlers && vis.states && vis.states.unbind) {
			for (var i = 0; i < ctx._handlers.length; i++) {
				vis.states.unbind(ctx._handlers[i].key, ctx._handlers[i].fn);
			}
		}

		$root.removeData("ankerEnergyCtx");
		$root.removeData("bound");
		$root.removeData("bindHandler");
	},

	cleanupLegacyCards: function ($scope) {
		$scope
			.find(
				'[data-zone="grid-import"], [data-zone="grid-export"], [data-zone="bat-charge"], [data-zone="bat-discharge"]',
			)
			.remove();

		var zones = ["grid", "bat-flow", "pv", "home", "soc", "ev"];
		for (var i = 0; i < zones.length; i++) {
			var $cards = $scope.find('[data-zone="' + zones[i] + '"]');
			if ($cards.length > 1) {
				$cards.slice(1).remove();
			}
		}
	},

	destroy: function (widgetID, view, data, style) {
		vis.binds["anker-solix"].destroyWidget(widgetID);
	},

	createWidget: function (widgetID, view, data, style) {
		var api = vis.binds["anker-solix"];
		api.destroyWidget(widgetID);

		var $all = $('[id="' + widgetID + '"]');
		if ($all.length > 1) {
			$all.slice(0, -1).remove();
		}

		var $root = $("#" + widgetID);
		if (!$root.length) {
			return setTimeout(function () {
				vis.binds["anker-solix"].createWidget(widgetID, view, data, style);
			}, 100);
		}

		var bg = data.backgroundImage || "widgets/anker-solix/img/dashboard-bg.png";

		$root
			.addClass("anker-energy-home")
			.html(
				'<div class="anker-energy-home__bg"></div>' +
					'<div class="anker-energy-home__overlay"></div>' +
					'<svg class="anker-energy-home__flows" viewBox="0 0 100 100" preserveAspectRatio="none">' +
					api.flowMarkup +
					"</svg>" +
					'<div class="anker-energy-home__cards">' +
					api.cardMarkup("pv", "pv", "PV", "pv", "50%", "10%") +
					api.cardMarkup("home", "home", "Home", "home", "50%", "44%") +
					api.cardMarkup("grid", "grid", "Grid → Home", "gridFlow", "13%", "51%") +
					api.cardMarkup("soc", "battery", "SOC", "soc", "21%", "70%") +
					api.cardMarkup("bat-flow", "battery", "Entladen", "batFlow", "21%", "78%") +
					api.cardMarkup("ev", "ev", "EV", "ev", "79%", "55%") +
					"</div>" +
					'<div class="anker-energy-home__footer">' +
					'<div class="anker-energy-home__footer-item"><span class="anker-energy-home__footer-dot"></span><span data-val="self">Self-consumption —</span></div>' +
					'<div class="anker-energy-home__footer-item"><span class="anker-energy-home__footer-dot anker-energy-home__footer-dot--pv"></span><span data-val="daily">Today PV —</span></div>' +
					"</div>",
			);

		api.cleanupLegacyCards($root);
		$root.find(".anker-energy-home__bg").css("background-image", 'url("' + bg + '")');

		var ctx = {
			$root: $root,
			data: data,
			oids: {},
			values: {
				pv: 0,
				home: 0,
				gridImport: 0,
				gridExport: 0,
				soc: null,
				batCharge: 0,
				batDischarge: 0,
				ev: 0,
				self: null,
				daily: null,
			},
			bound: [],
		};

		$root.data("ankerEnergyCtx", ctx);
		api.applyConfigOids(ctx);
		api.bindStates(ctx);
	},

	applyConfigOids: function (ctx) {
		var d = ctx.data;

		ctx.oids.pv = d.oidPv || null;
		ctx.oids.home = d.oidHome || null;
		ctx.oids.gridImport = d.oidGridImport || null;
		ctx.oids.gridExport = d.oidGridExport || null;
		ctx.oids.soc = d.oidSoc || null;
		ctx.oids.batCharge = d.oidBatCharge || null;
		ctx.oids.batDischarge = d.oidBatDischarge || null;
		ctx.oids.ev = d.oidEv || null;
		ctx.oids.daily = d.oidDailyPv || null;
		ctx.oids.self = d.oidSelfConsumption || null;
	},

	collectBoundOids: function (ctx) {
		var oids = [];
		var keys = [
			"pv",
			"home",
			"gridImport",
			"gridExport",
			"soc",
			"batCharge",
			"batDischarge",
			"ev",
			"daily",
			"self",
		];

		for (var i = 0; i < keys.length; i++) {
			if (ctx.oids[keys[i]]) {
				oids.push(ctx.oids[keys[i]]);
			}
		}

		return oids;
	},

	ensureRuntimeSubscription: function (oids, done) {
		if (!oids.length) {
			done();
			return;
		}

		if (vis.editMode) {
			done();
			return;
		}

		function finishGetStates(data) {
			if (data && typeof vis.updateStates === "function") {
				vis.updateStates(data);
			}
			done();
		}

		if (vis.conn && typeof vis.conn.getStates === "function") {
			vis.conn.getStates(oids, function (_err, data) {
				var toSubscribe = [];
				if (vis.subscribing && vis.subscribing.active) {
					for (var i = 0; i < oids.length; i++) {
						if (vis.subscribing.active.indexOf(oids[i]) < 0) {
							vis.subscribing.active.push(oids[i]);
							toSubscribe.push(oids[i]);
						}
					}
				} else {
					toSubscribe = oids.slice();
				}

				if (toSubscribe.length && vis.conn.subscribe) {
					vis.conn.subscribe(toSubscribe);
				}

				finishGetStates(data);
			});
			return;
		}

		if (typeof vis.subscribeOidAtRuntime === "function") {
			var index = 0;
			function nextOid() {
				if (index >= oids.length) {
					done();
					return;
				}
				vis.subscribeOidAtRuntime(oids[index++], nextOid);
			}
			nextOid();
			return;
		}

		done();
	},

	syncInitialValues: function (ctx) {
		var api = vis.binds["anker-solix"];
		var keys = [
			"pv",
			"home",
			"soc",
			"ev",
			"daily",
			"self",
			"gridImport",
			"gridExport",
			"batCharge",
			"batDischarge",
		];

		for (var i = 0; i < keys.length; i++) {
			var oid = ctx.oids[keys[i]];
			if (!oid) {
				continue;
			}
			var stateKey = oid + ".val";
			if (vis.states[stateKey] !== undefined) {
				ctx.values[keys[i]] = api.toNumber(vis.states[stateKey]);
			}
		}
	},

	registerVisBindings: function (ctx) {
		var handlers = [];
		if (ctx._handlers && ctx._handlers.length) {
			for (var i = 0; i < ctx._handlers.length; i++) {
				handlers.push(ctx._handlers[i].fn);
			}
		}
		ctx.$root.data("bound", ctx.bound.slice());
		ctx.$root.data("bindHandler", handlers);
	},

	bindStates: function (ctx) {
		var api = vis.binds["anker-solix"];
		var keys = [
			"pv",
			"home",
			"gridImport",
			"gridExport",
			"soc",
			"batCharge",
			"batDischarge",
			"ev",
			"daily",
			"self",
		];

		if (!ctx.bound) {
			ctx.bound = [];
		}
		if (!ctx._handlers) {
			ctx._handlers = [];
		}

		function bindOne(key, oid) {
			if (!oid) {
				return;
			}
			var stateKey = oid + ".val";
			if (ctx.bound.indexOf(stateKey) >= 0) {
				return;
			}
			function onChange(_e, newVal) {
				api.onValue(ctx, key, newVal);
			}
			vis.states.bind(stateKey, onChange);
			ctx.bound.push(stateKey);
			ctx._handlers.push({ key: stateKey, fn: onChange });
		}

		for (var i = 0; i < keys.length; i++) {
			bindOne(keys[i], ctx.oids[keys[i]]);
		}

		api.ensureRuntimeSubscription(api.collectBoundOids(ctx), function () {
			api.syncInitialValues(ctx);
			api.registerVisBindings(ctx);
			api.render(ctx);
		});
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
		if (n < 15) {
			return "0 W";
		}
		return this.formatPower(n);
	},

	isFlowActive: function (w) {
		return this.toNumber(w) >= this.flowThresholdW;
	},

	pickFlowMode: function (wattsA, wattsB, hasA, hasB) {
		var aActive = hasA && this.isFlowActive(wattsA);
		var bActive = hasB && this.isFlowActive(wattsB);

		if (aActive && !bActive) {
			return "a";
		}
		if (bActive && !aActive) {
			return "b";
		}
		if (aActive && bActive) {
			return this.toNumber(wattsA) >= this.toNumber(wattsB) ? "a" : "b";
		}
		if (hasA) {
			return "a";
		}
		if (hasB) {
			return "b";
		}
		return "a";
	},

	updateAlternatingCard: function ($r, zone, valKey, labelA, labelB, wattsA, wattsB, hasA, hasB) {
		var $card = $r.find('[data-zone="' + zone + '"]');

		if (!hasA && !hasB) {
			$card.addClass("anker-energy-home__card--hidden");
			return;
		}

		$card.removeClass("anker-energy-home__card--hidden");
		var mode = this.pickFlowMode(wattsA, wattsB, hasA, hasB);
		var label = mode === "a" ? labelA : labelB;
		var watts = mode === "a" ? wattsA : wattsB;
		var hasOid = mode === "a" ? hasA : hasB;

		$card.find('[data-label="' + zone + '"]').text(label);
		$card.find('[data-val="' + valKey + '"]').text(hasOid ? this.formatGrid(watts) : "—");
	},

	render: function (ctx) {
		var v = ctx.values;
		var $r = ctx.$root;

		this.cleanupLegacyCards($r);

		$r.find('[data-val="pv"]').text(ctx.oids.pv ? this.formatPower(v.pv) : "—");
		$r.find('[data-val="home"]').text(ctx.oids.home ? this.formatPower(v.home) : "—");
		$r.find('[data-val="soc"]').text(
			ctx.oids.soc ? Math.round(this.toNumber(v.soc)) + "%" : "—",
		);

		this.updateAlternatingCard(
			$r,
			"grid",
			"gridFlow",
			"Grid → Home",
			"PV → Grid",
			v.gridImport,
			v.gridExport,
			!!ctx.oids.gridImport,
			!!ctx.oids.gridExport,
		);
		this.updateAlternatingCard(
			$r,
			"bat-flow",
			"batFlow",
			"Entladen",
			"Laden",
			v.batDischarge,
			v.batCharge,
			!!ctx.oids.batDischarge,
			!!ctx.oids.batCharge,
		);

		$r.find('[data-val="ev"]').text(ctx.oids.ev ? this.formatPower(v.ev) : "—");
		$r.find('[data-val="self"]').text(
			ctx.oids.self ? "Self-consumption " + Math.round(this.toNumber(v.self)) + "%" : "Self-consumption —",
		);
		$r.find('[data-val="daily"]').text(
			ctx.oids.daily ? "Today PV " + this.toNumber(v.daily).toFixed(1) + " kWh" : "Today PV —",
		);

		this.updateFlows($r, v, ctx);
	},

	updateFlows: function ($r, v, ctx) {
		var api = vis.binds["anker-solix"];
		var threshold = api.flowThresholdW;

		function flowSpeed(w) {
			var abs = Math.abs(api.toNumber(w));
			if (abs < threshold) {
				return null;
			}
			return Math.max(0.55, Math.min(2.2, 1.8 - abs / 8000)) + "s";
		}

		function setFlowDirection(name, watts, reverse) {
			var active = Math.abs(api.toNumber(watts)) > threshold;
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

		setFlowDirection("pv", ctx.oids.pv ? v.pv : 0, false);
		setFlowDirection("grid-import", ctx.oids.gridImport ? v.gridImport : 0, false);
		setFlowDirection("grid-export", ctx.oids.gridExport ? v.gridExport : 0, false);
		setFlowDirection("bat-charge", ctx.oids.batCharge ? v.batCharge : 0, false);
		setFlowDirection("bat-discharge", ctx.oids.batDischarge ? v.batDischarge : 0, false);
		setFlowDirection("ev", ctx.oids.ev ? v.ev : 0, false);
		setFlowDirection("ev-cable", ctx.oids.ev ? v.ev : 0, false);
	},
};

vis.binds["anker-solix"].showVersion();
