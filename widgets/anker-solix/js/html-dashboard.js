/*
 * ioBroker.anker-solix VIS / VIS-2 widget: HTML dashboard (solix4-style states)
 */
"use strict";

/* global $, vis, systemDictionary */

$.extend(true, systemDictionary, {
	anker_group_html: {
		en: "HTML dashboard",
		de: "HTML-Dashboard",
		ru: "HTML dashboard",
		pt: "HTML dashboard",
		nl: "HTML dashboard",
		fr: "HTML dashboard",
		it: "HTML dashboard",
		es: "HTML dashboard",
		pl: "HTML dashboard",
		uk: "HTML dashboard",
		"zh-cn": "HTML 仪表盘",
	},
	anker_oid_html: {
		en: "Dashboard HTML state",
		de: "Dashboard-HTML-State",
		ru: "Dashboard HTML state",
		pt: "Dashboard HTML state",
		nl: "Dashboard HTML state",
		fr: "Dashboard HTML state",
		it: "Dashboard HTML state",
		es: "Dashboard HTML state",
		pl: "Dashboard HTML state",
		uk: "Dashboard HTML state",
		"zh-cn": "仪表盘 HTML 状态",
	},
	anker_html_hint: {
		en: "Bind e.g. anker-solix.0.dashboard.sites.<siteKey>.dashboard.html",
		de: "z. B. anker-solix.0.dashboard.sites.<siteKey>.dashboard.html",
		ru: "Bind dashboard.sites.*.dashboard.html",
		pt: "Bind dashboard.sites.*.dashboard.html",
		nl: "Bind dashboard.sites.*.dashboard.html",
		fr: "Bind dashboard.sites.*.dashboard.html",
		it: "Bind dashboard.sites.*.dashboard.html",
		es: "Bind dashboard.sites.*.dashboard.html",
		pl: "Bind dashboard.sites.*.dashboard.html",
		uk: "Bind dashboard.sites.*.dashboard.html",
		"zh-cn": "绑定 dashboard.sites.*.dashboard.html",
	},
});

if (!vis.binds["anker-solix"]) {
	vis.binds["anker-solix"] = {};
}

$.extend(true, vis.binds["anker-solix"], {
	htmlVersion: "0.2.7",

	createHtmlDashboardWidget: function (widgetID, view, data, style) {
		var $parent = $("#" + widgetID);
		$parent.addClass("anker-html-dashboard");
		if (style && style.width) {
			$parent.css("width", style.width);
		}
		if (style && style.height) {
			$parent.css("height", style.height);
		}

		var oid = data.oidHtml || data.attr("oidHtml");
		if (!oid) {
			$parent.html(
				'<div class="anker-html-dashboard__placeholder">' +
					(systemDictionary.anker_html_hint[vis.language] || systemDictionary.anker_html_hint.en) +
					"</div>",
			);
			return;
		}

		var render = function (html) {
			$parent.html(typeof html === "string" ? html : html == null ? "" : String(html));
		};

		if (vis.states[oid + ".val"] !== undefined) {
			render(vis.states[oid + ".val"]);
		}

		vis.bind(view + "." + widgetID, oid, function (_e, newVal) {
			render(newVal);
		});
	},

	destroyHtmlDashboardWidget: function (widgetID) {
		var $el = $("#" + widgetID);
		$el.removeClass("anker-html-dashboard");
		$el.empty();
	},
});
