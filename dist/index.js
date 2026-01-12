import { a as find, c as stringify, d as __export, f as __toCommonJS, i as svg, l as __commonJSMin, n as stringify$1, o as hastToReact, p as __toESM, r as html$2, s as whitespace, t as ccount, u as __esmMin } from "./ccount-BAQBvLGj.js";
import * as React$1 from "react";
import React, { Children, Component, Fragment, Suspense, createContext, createElement, forwardRef, isValidElement, useCallback, useContext, useEffect, useId, useInsertionEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import * as ReactDOM$1 from "react-dom";
import ReactDOM from "react-dom";
var AgentClientError = class extends Error {
	constructor(i) {
		super(i), this.name = "AgentClientError";
	}
}, AgentClient = class {
	constructor(i) {
		this._info = null, this._agent = null, this._initPromise = null;
		let { baseUrl: a, agent: o, timeout: s, authSecret: c, getInfo: l = !0 } = i;
		this.baseUrl = a, this.authSecret = c, this.timeout = s, l ? this._initPromise = this.retrieveInfo().then(() => {
			o && this.updateAgent(o, !1);
		}).catch((i) => {
			console.error("Error fetching service info:", i);
		}) : o && this.updateAgent(o, !0);
	}
	get headers() {
		let i = { "Content-Type": "application/json" };
		return this.authSecret && (i.Authorization = `Bearer ${this.authSecret}`), i;
	}
	get agent() {
		return this._agent;
	}
	get info() {
		return this._info;
	}
	async retrieveInfo() {
		try {
			let i = new AbortController(), a = this.timeout ? setTimeout(() => i.abort(), this.timeout) : void 0, o = await fetch(`${this.baseUrl}/info`, {
				headers: this.headers,
				signal: i.signal
			});
			if (a && clearTimeout(a), !o.ok) throw new AgentClientError(`HTTP error! status: ${o.status}`);
			this._info = await o.json(), (!this._agent || !this._info?.agents.some((i) => i.key === this._agent)) && (this._agent = this._info?.default_agent || null);
		} catch (i) {
			throw i instanceof Error ? new AgentClientError(`Error getting service info: ${i.message}`) : i;
		}
	}
	updateAgent(i, a = !1) {
		if (!a) {
			if (!this._info) throw new AgentClientError("Service info not loaded. Call retrieveInfo() first or set getInfo to true in constructor.");
			let a = this._info.agents.map((i) => i.key);
			if (!a.includes(i)) throw new AgentClientError(`Agent ${i} not found in available agents: ${a.join(", ")}`);
		}
		this._agent = i;
	}
	async invoke(i) {
		if (this._initPromise && await this._initPromise, !this._agent) throw new AgentClientError("No agent selected. Use updateAgent() to select an agent.");
		try {
			let a = new AbortController(), o = this.timeout ? setTimeout(() => a.abort(), this.timeout) : void 0, s = await fetch(`${this.baseUrl}/${this._agent}/invoke`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(i),
				signal: a.signal
			});
			if (o && clearTimeout(o), !s.ok) throw new AgentClientError(`HTTP error! status: ${s.status}`);
			return await s.json();
		} catch (i) {
			throw i instanceof Error ? new AgentClientError(`Error invoking agent: ${i.message}`) : i;
		}
	}
	parseStreamLine(i) {
		let a = i.trim();
		if (a.startsWith("data: ")) {
			let i = a.substring(6);
			if (i === "[DONE]") return null;
			try {
				let a = JSON.parse(i);
				switch (a.type) {
					case "message": return a.content;
					case "token": return a.content;
					case "error": return {
						type: "ai",
						content: `Error: ${a.content}`
					};
					default: return null;
				}
			} catch (i) {
				return console.error("Error parsing stream event:", i), null;
			}
		}
		return null;
	}
	async *stream(i) {
		if (this._initPromise && await this._initPromise, !this._agent) throw new AgentClientError("No agent selected. Use updateAgent() to select an agent.");
		let a = {
			...i,
			stream_tokens: i.stream_tokens ?? !0
		};
		try {
			let i = new AbortController(), o = this.timeout ? setTimeout(() => i.abort(), this.timeout) : void 0, s = await fetch(`${this.baseUrl}/${this._agent}/stream`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(a),
				signal: i.signal
			});
			if (o && clearTimeout(o), !s.ok) throw new AgentClientError(`HTTP error! status: ${s.status}`);
			if (!s.body) throw new AgentClientError("Response body is null");
			let c = s.body.getReader(), l = new TextDecoder(), u = "";
			try {
				for (;;) {
					let { done: i, value: a } = await c.read();
					if (i) break;
					u += l.decode(a, { stream: !0 });
					let o = u.split("\n");
					u = o.pop() || "";
					for (let i of o) if (i.trim()) {
						let a = this.parseStreamLine(i);
						if (a === null) return;
						a !== "" && (yield a);
					}
				}
			} finally {
				c.releaseLock();
			}
		} catch (i) {
			throw i instanceof Error ? new AgentClientError(`Error streaming agent response: ${i.message}`) : i;
		}
	}
	async createFeedback(i) {
		try {
			let a = new AbortController(), o = this.timeout ? setTimeout(() => a.abort(), this.timeout) : void 0, s = await fetch(`${this.baseUrl}/feedback`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(i),
				signal: a.signal
			});
			if (o && clearTimeout(o), !s.ok) throw new AgentClientError(`HTTP error! status: ${s.status}`);
		} catch (i) {
			throw i instanceof Error ? new AgentClientError(`Error creating feedback: ${i.message}`) : i;
		}
	}
	async getHistory(i) {
		try {
			let a = new AbortController(), o = this.timeout ? setTimeout(() => a.abort(), this.timeout) : void 0, s = await fetch(`${this.baseUrl}/history`, {
				method: "POST",
				headers: this.headers,
				body: JSON.stringify(i),
				signal: a.signal
			});
			if (o && clearTimeout(o), !s.ok) throw new AgentClientError(`HTTP error! status: ${s.status}`);
			return await s.json();
		} catch (i) {
			throw i instanceof Error ? new AgentClientError(`Error getting chat history: ${i.message}`) : i;
		}
	}
	async listThreads(i = 20, a = 0, o) {
		try {
			let s = new AbortController(), c = this.timeout ? setTimeout(() => s.abort(), this.timeout) : void 0, l = {
				limit: i.toString(),
				offset: a.toString()
			};
			o && (l.user_id = o);
			let u = new URLSearchParams(l).toString(), d = await fetch(`${this.baseUrl}/threads?${u}`, {
				method: "GET",
				headers: this.headers,
				signal: s.signal
			});
			if (c && clearTimeout(c), !d.ok) {
				if (d.status === 404) return [];
				throw new AgentClientError(`HTTP error! status: ${d.status}`);
			}
			return await d.json();
		} catch (i) {
			throw i instanceof Error ? new AgentClientError(`Error listing threads: ${i.message}`) : i;
		}
	}
}, toKebabCase = (i) => i.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), toCamelCase = (i) => i.replace(/^([A-Z])|[\s-_]+(\w)/g, (i, a, o) => o ? o.toUpperCase() : a.toLowerCase()), toPascalCase = (i) => {
	let a = toCamelCase(i);
	return a.charAt(0).toUpperCase() + a.slice(1);
}, mergeClasses = (...i) => i.filter((i, a, o) => !!i && i.trim() !== "" && o.indexOf(i) === a).join(" ").trim(), hasA11yProp = (i) => {
	for (let a in i) if (a.startsWith("aria-") || a === "role" || a === "title") return !0;
}, defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Icon$1 = forwardRef(({ color: i = "currentColor", size: a = 24, strokeWidth: o = 2, absoluteStrokeWidth: s, className: c = "", children: l, iconNode: u, ...d }, f) => createElement("svg", {
	ref: f,
	...defaultAttributes,
	width: a,
	height: a,
	stroke: i,
	strokeWidth: s ? Number(o) * 24 / Number(a) : o,
	className: mergeClasses("lucide", c),
	...!l && !hasA11yProp(d) && { "aria-hidden": "true" },
	...d
}, [...u.map(([i, a]) => createElement(i, a)), ...Array.isArray(l) ? l : [l]])), createLucideIcon = (i, a) => {
	let o = forwardRef(({ className: o, ...s }, c) => createElement(Icon$1, {
		ref: c,
		iconNode: a,
		className: mergeClasses(`lucide-${toKebabCase(toPascalCase(i))}`, `lucide-${i}`, o),
		...s
	}));
	return o.displayName = toPascalCase(i), o;
}, ArrowDown = createLucideIcon("arrow-down", [["path", {
	d: "M12 5v14",
	key: "s699le"
}], ["path", {
	d: "m19 12-7 7-7-7",
	key: "1idqje"
}]]), ArrowUp = createLucideIcon("arrow-up", [["path", {
	d: "m5 12 7-7 7 7",
	key: "hav0vg"
}], ["path", {
	d: "M12 19V5",
	key: "x0mq9r"
}]]), Ban = createLucideIcon("ban", [["path", {
	d: "M4.929 4.929 19.07 19.071",
	key: "196cmz"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]), Bot = createLucideIcon("bot", [
	["path", {
		d: "M12 8V4H8",
		key: "hb8ula"
	}],
	["rect", {
		width: "16",
		height: "12",
		x: "4",
		y: "8",
		rx: "2",
		key: "enze0r"
	}],
	["path", {
		d: "M2 14h2",
		key: "vft8re"
	}],
	["path", {
		d: "M20 14h2",
		key: "4cs60a"
	}],
	["path", {
		d: "M15 13v2",
		key: "1xurst"
	}],
	["path", {
		d: "M9 13v2",
		key: "rq6x2g"
	}]
]), Braces = createLucideIcon("braces", [["path", {
	d: "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1",
	key: "ezmyqa"
}], ["path", {
	d: "M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
	key: "e1hn23"
}]]), Check = createLucideIcon("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), ChevronDown = createLucideIcon("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), ChevronRight = createLucideIcon("chevron-right", [["path", {
	d: "m9 18 6-6-6-6",
	key: "mthhwq"
}]]), ChevronUp = createLucideIcon("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), CircleQuestionMark = createLucideIcon("circle-question-mark", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
		key: "1u773s"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]), CodeXml = createLucideIcon("code-xml", [
	["path", {
		d: "m18 16 4-4-4-4",
		key: "1inbqp"
	}],
	["path", {
		d: "m6 8-4 4 4 4",
		key: "15zrgr"
	}],
	["path", {
		d: "m14.5 4-5 16",
		key: "e7oirm"
	}]
]), Copy = createLucideIcon("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]), Dot = createLucideIcon("dot", [["circle", {
	cx: "12.1",
	cy: "12.1",
	r: "1",
	key: "18d7e5"
}]]), File$1 = createLucideIcon("file", [["path", {
	d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
	key: "1oefj6"
}], ["path", {
	d: "M14 2v5a1 1 0 0 0 1 1h5",
	key: "wfsgrz"
}]]), History = createLucideIcon("history", [
	["path", {
		d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
		key: "1357e3"
	}],
	["path", {
		d: "M3 3v5h5",
		key: "1xhq8a"
	}],
	["path", {
		d: "M12 7v5l4 2",
		key: "1fdv2h"
	}]
]), Info = createLucideIcon("info", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 16v-4",
		key: "1dtifu"
	}],
	["path", {
		d: "M12 8h.01",
		key: "e9boi3"
	}]
]), LoaderCircle = createLucideIcon("loader-circle", [["path", {
	d: "M21 12a9 9 0 1 1-6.219-8.56",
	key: "13zald"
}]]), MessageCircle = createLucideIcon("message-circle", [["path", {
	d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
	key: "1sd12s"
}]]), MessageSquare = createLucideIcon("message-square", [["path", {
	d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
	key: "18887p"
}]]), Mic = createLucideIcon("mic", [
	["path", {
		d: "M12 19v3",
		key: "npa21l"
	}],
	["path", {
		d: "M19 10v2a7 7 0 0 1-14 0v-2",
		key: "1vc78b"
	}],
	["rect", {
		x: "9",
		y: "2",
		width: "6",
		height: "13",
		rx: "3",
		key: "s6n7sd"
	}]
]), Paperclip = createLucideIcon("paperclip", [["path", {
	d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
	key: "1miecu"
}]]), Plus = createLucideIcon("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]), Search = createLucideIcon("search", [["path", {
	d: "m21 21-4.34-4.34",
	key: "14j7rj"
}], ["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}]]), Settings2 = createLucideIcon("settings-2", [
	["path", {
		d: "M14 17H5",
		key: "gfn3mx"
	}],
	["path", {
		d: "M19 7h-9",
		key: "6i9tg"
	}],
	["circle", {
		cx: "17",
		cy: "17",
		r: "3",
		key: "18b49y"
	}],
	["circle", {
		cx: "7",
		cy: "7",
		r: "3",
		key: "dfmy0x"
	}]
]), Sparkles = createLucideIcon("sparkles", [
	["path", {
		d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
		key: "1s2grr"
	}],
	["path", {
		d: "M20 2v4",
		key: "1rf3ol"
	}],
	["path", {
		d: "M22 4h-4",
		key: "gwowj6"
	}],
	["circle", {
		cx: "4",
		cy: "20",
		r: "2",
		key: "6kqj1y"
	}]
]), Square = createLucideIcon("square", [["rect", {
	width: "18",
	height: "18",
	x: "3",
	y: "3",
	rx: "2",
	key: "afitv7"
}]]), Terminal = createLucideIcon("terminal", [["path", {
	d: "M12 19h8",
	key: "baeox8"
}], ["path", {
	d: "m4 17 6-6-6-6",
	key: "1yngyt"
}]]), ThumbsDown = createLucideIcon("thumbs-down", [["path", {
	d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
	key: "m61m77"
}], ["path", {
	d: "M17 14V2",
	key: "8ymqnk"
}]]), ThumbsUp = createLucideIcon("thumbs-up", [["path", {
	d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
	key: "emmmcr"
}], ["path", {
	d: "M7 10v12",
	key: "1qc93n"
}]]), X = createLucideIcon("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
function r$1(i) {
	var a, o, s = "";
	if (typeof i == "string" || typeof i == "number") s += i;
	else if (typeof i == "object") if (Array.isArray(i)) {
		var c = i.length;
		for (a = 0; a < c; a++) i[a] && (o = r$1(i[a])) && (s && (s += " "), s += o);
	} else for (o in i) i[o] && (s && (s += " "), s += o);
	return s;
}
function clsx() {
	for (var i, a, o = 0, s = "", c = arguments.length; o < c; o++) (i = arguments[o]) && (a = r$1(i)) && (s && (s += " "), s += a);
	return s;
}
var concatArrays = (i, a) => {
	let o = Array(i.length + a.length);
	for (let a = 0; a < i.length; a++) o[a] = i[a];
	for (let s = 0; s < a.length; s++) o[i.length + s] = a[s];
	return o;
}, createClassValidatorObject = (i, a) => ({
	classGroupId: i,
	validator: a
}), createClassPartObject = (i = /* @__PURE__ */ new Map(), a = null, o) => ({
	nextPart: i,
	validators: a,
	classGroupId: o
}), CLASS_PART_SEPARATOR = "-", EMPTY_CONFLICTS = [], ARBITRARY_PROPERTY_PREFIX = "arbitrary..", createClassGroupUtils = (i) => {
	let a = createClassMap(i), { conflictingClassGroups: o, conflictingClassGroupModifiers: s } = i;
	return {
		getClassGroupId: (i) => {
			if (i.startsWith("[") && i.endsWith("]")) return getGroupIdForArbitraryProperty(i);
			let o = i.split(CLASS_PART_SEPARATOR);
			return getGroupRecursive(o, o[0] === "" && o.length > 1 ? 1 : 0, a);
		},
		getConflictingClassGroupIds: (i, a) => {
			if (a) {
				let a = s[i], c = o[i];
				return a ? c ? concatArrays(c, a) : a : c || EMPTY_CONFLICTS;
			}
			return o[i] || EMPTY_CONFLICTS;
		}
	};
}, getGroupRecursive = (i, a, o) => {
	if (i.length - a === 0) return o.classGroupId;
	let s = i[a], c = o.nextPart.get(s);
	if (c) {
		let o = getGroupRecursive(i, a + 1, c);
		if (o) return o;
	}
	let l = o.validators;
	if (l === null) return;
	let u = a === 0 ? i.join(CLASS_PART_SEPARATOR) : i.slice(a).join(CLASS_PART_SEPARATOR), d = l.length;
	for (let i = 0; i < d; i++) {
		let a = l[i];
		if (a.validator(u)) return a.classGroupId;
	}
}, getGroupIdForArbitraryProperty = (i) => i.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let a = i.slice(1, -1), o = a.indexOf(":"), s = a.slice(0, o);
	return s ? ARBITRARY_PROPERTY_PREFIX + s : void 0;
})(), createClassMap = (i) => {
	let { theme: a, classGroups: o } = i;
	return processClassGroups(o, a);
}, processClassGroups = (i, a) => {
	let o = createClassPartObject();
	for (let s in i) {
		let c = i[s];
		processClassesRecursively(c, o, s, a);
	}
	return o;
}, processClassesRecursively = (i, a, o, s) => {
	let c = i.length;
	for (let l = 0; l < c; l++) {
		let c = i[l];
		processClassDefinition(c, a, o, s);
	}
}, processClassDefinition = (i, a, o, s) => {
	if (typeof i == "string") {
		processStringDefinition(i, a, o);
		return;
	}
	if (typeof i == "function") {
		processFunctionDefinition(i, a, o, s);
		return;
	}
	processObjectDefinition(i, a, o, s);
}, processStringDefinition = (i, a, o) => {
	let s = i === "" ? a : getPart(a, i);
	s.classGroupId = o;
}, processFunctionDefinition = (i, a, o, s) => {
	if (isThemeGetter(i)) {
		processClassesRecursively(i(s), a, o, s);
		return;
	}
	a.validators === null && (a.validators = []), a.validators.push(createClassValidatorObject(o, i));
}, processObjectDefinition = (i, a, o, s) => {
	let c = Object.entries(i), l = c.length;
	for (let i = 0; i < l; i++) {
		let [l, u] = c[i];
		processClassesRecursively(u, getPart(a, l), o, s);
	}
}, getPart = (i, a) => {
	let o = i, s = a.split(CLASS_PART_SEPARATOR), c = s.length;
	for (let i = 0; i < c; i++) {
		let a = s[i], c = o.nextPart.get(a);
		c || (c = createClassPartObject(), o.nextPart.set(a, c)), o = c;
	}
	return o;
}, isThemeGetter = (i) => "isThemeGetter" in i && i.isThemeGetter === !0, createLruCache = (i) => {
	if (i < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let a = 0, o = Object.create(null), s = Object.create(null), c = (c, l) => {
		o[c] = l, a++, a > i && (a = 0, s = o, o = Object.create(null));
	};
	return {
		get(i) {
			let a = o[i];
			if (a !== void 0) return a;
			if ((a = s[i]) !== void 0) return c(i, a), a;
		},
		set(i, a) {
			i in o ? o[i] = a : c(i, a);
		}
	};
}, IMPORTANT_MODIFIER = "!", MODIFIER_SEPARATOR = ":", EMPTY_MODIFIERS = [], createResultObject = (i, a, o, s, c) => ({
	modifiers: i,
	hasImportantModifier: a,
	baseClassName: o,
	maybePostfixModifierPosition: s,
	isExternal: c
}), createParseClassName = (i) => {
	let { prefix: a, experimentalParseClassName: o } = i, s = (i) => {
		let a = [], o = 0, s = 0, c = 0, l, u = i.length;
		for (let d = 0; d < u; d++) {
			let u = i[d];
			if (o === 0 && s === 0) {
				if (u === MODIFIER_SEPARATOR) {
					a.push(i.slice(c, d)), c = d + 1;
					continue;
				}
				if (u === "/") {
					l = d;
					continue;
				}
			}
			u === "[" ? o++ : u === "]" ? o-- : u === "(" ? s++ : u === ")" && s--;
		}
		let d = a.length === 0 ? i : i.slice(c), f = d, p = !1;
		d.endsWith(IMPORTANT_MODIFIER) ? (f = d.slice(0, -1), p = !0) : d.startsWith(IMPORTANT_MODIFIER) && (f = d.slice(1), p = !0);
		let m = l && l > c ? l - c : void 0;
		return createResultObject(a, p, f, m);
	};
	if (a) {
		let i = a + MODIFIER_SEPARATOR, o = s;
		s = (a) => a.startsWith(i) ? o(a.slice(i.length)) : createResultObject(EMPTY_MODIFIERS, !1, a, void 0, !0);
	}
	if (o) {
		let i = s;
		s = (a) => o({
			className: a,
			parseClassName: i
		});
	}
	return s;
}, createSortModifiers = (i) => {
	let a = /* @__PURE__ */ new Map();
	return i.orderSensitiveModifiers.forEach((i, o) => {
		a.set(i, 1e6 + o);
	}), (i) => {
		let o = [], s = [];
		for (let c = 0; c < i.length; c++) {
			let l = i[c], u = l[0] === "[", d = a.has(l);
			u || d ? (s.length > 0 && (s.sort(), o.push(...s), s = []), o.push(l)) : s.push(l);
		}
		return s.length > 0 && (s.sort(), o.push(...s)), o;
	};
}, createConfigUtils = (i) => ({
	cache: createLruCache(i.cacheSize),
	parseClassName: createParseClassName(i),
	sortModifiers: createSortModifiers(i),
	...createClassGroupUtils(i)
}), SPLIT_CLASSES_REGEX = /\s+/, mergeClassList = (i, a) => {
	let { parseClassName: o, getClassGroupId: s, getConflictingClassGroupIds: c, sortModifiers: l } = a, u = [], d = i.trim().split(SPLIT_CLASSES_REGEX), f = "";
	for (let i = d.length - 1; i >= 0; --i) {
		let a = d[i], { isExternal: p, modifiers: m, hasImportantModifier: h, baseClassName: g, maybePostfixModifierPosition: _ } = o(a);
		if (p) {
			f = a + (f.length > 0 ? " " + f : f);
			continue;
		}
		let v = !!_, y = s(v ? g.substring(0, _) : g);
		if (!y) {
			if (!v) {
				f = a + (f.length > 0 ? " " + f : f);
				continue;
			}
			if (y = s(g), !y) {
				f = a + (f.length > 0 ? " " + f : f);
				continue;
			}
			v = !1;
		}
		let b = m.length === 0 ? "" : m.length === 1 ? m[0] : l(m).join(":"), x = h ? b + IMPORTANT_MODIFIER : b, S = x + y;
		if (u.indexOf(S) > -1) continue;
		u.push(S);
		let C = c(y, v);
		for (let i = 0; i < C.length; ++i) {
			let a = C[i];
			u.push(x + a);
		}
		f = a + (f.length > 0 ? " " + f : f);
	}
	return f;
}, twJoin = (...i) => {
	let a = 0, o, s, c = "";
	for (; a < i.length;) (o = i[a++]) && (s = toValue(o)) && (c && (c += " "), c += s);
	return c;
}, toValue = (i) => {
	if (typeof i == "string") return i;
	let a, o = "";
	for (let s = 0; s < i.length; s++) i[s] && (a = toValue(i[s])) && (o && (o += " "), o += a);
	return o;
}, createTailwindMerge = (i, ...a) => {
	let o, s, c, l, u = (u) => (o = createConfigUtils(a.reduce((i, a) => a(i), i())), s = o.cache.get, c = o.cache.set, l = d, d(u)), d = (i) => {
		let a = s(i);
		if (a) return a;
		let l = mergeClassList(i, o);
		return c(i, l), l;
	};
	return l = u, (...i) => l(twJoin(...i));
}, fallbackThemeArr = [], fromTheme = (i) => {
	let a = (a) => a[i] || fallbackThemeArr;
	return a.isThemeGetter = !0, a;
}, arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i, fractionRegex = /^\d+\/\d+$/, tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, isFraction = (i) => fractionRegex.test(i), isNumber = (i) => !!i && !Number.isNaN(Number(i)), isInteger = (i) => !!i && Number.isInteger(Number(i)), isPercent = (i) => i.endsWith("%") && isNumber(i.slice(0, -1)), isTshirtSize = (i) => tshirtUnitRegex.test(i), isAny = () => !0, isLengthOnly = (i) => lengthUnitRegex.test(i) && !colorFunctionRegex.test(i), isNever = () => !1, isShadow = (i) => shadowRegex.test(i), isImage = (i) => imageRegex.test(i), isAnyNonArbitrary = (i) => !isArbitraryValue(i) && !isArbitraryVariable(i), isArbitrarySize = (i) => getIsArbitraryValue(i, isLabelSize, isNever), isArbitraryValue = (i) => arbitraryValueRegex.test(i), isArbitraryLength = (i) => getIsArbitraryValue(i, isLabelLength, isLengthOnly), isArbitraryNumber = (i) => getIsArbitraryValue(i, isLabelNumber, isNumber), isArbitraryPosition = (i) => getIsArbitraryValue(i, isLabelPosition, isNever), isArbitraryImage = (i) => getIsArbitraryValue(i, isLabelImage, isImage), isArbitraryShadow = (i) => getIsArbitraryValue(i, isLabelShadow, isShadow), isArbitraryVariable = (i) => arbitraryVariableRegex.test(i), isArbitraryVariableLength = (i) => getIsArbitraryVariable(i, isLabelLength), isArbitraryVariableFamilyName = (i) => getIsArbitraryVariable(i, isLabelFamilyName), isArbitraryVariablePosition = (i) => getIsArbitraryVariable(i, isLabelPosition), isArbitraryVariableSize = (i) => getIsArbitraryVariable(i, isLabelSize), isArbitraryVariableImage = (i) => getIsArbitraryVariable(i, isLabelImage), isArbitraryVariableShadow = (i) => getIsArbitraryVariable(i, isLabelShadow, !0), getIsArbitraryValue = (i, a, o) => {
	let s = arbitraryValueRegex.exec(i);
	return s ? s[1] ? a(s[1]) : o(s[2]) : !1;
}, getIsArbitraryVariable = (i, a, o = !1) => {
	let s = arbitraryVariableRegex.exec(i);
	return s ? s[1] ? a(s[1]) : o : !1;
}, isLabelPosition = (i) => i === "position" || i === "percentage", isLabelImage = (i) => i === "image" || i === "url", isLabelSize = (i) => i === "length" || i === "size" || i === "bg-size", isLabelLength = (i) => i === "length", isLabelNumber = (i) => i === "number", isLabelFamilyName = (i) => i === "family-name", isLabelShadow = (i) => i === "shadow", twMerge = /* @__PURE__ */ createTailwindMerge(() => {
	let i = fromTheme("color"), a = fromTheme("font"), o = fromTheme("text"), s = fromTheme("font-weight"), c = fromTheme("tracking"), l = fromTheme("leading"), u = fromTheme("breakpoint"), d = fromTheme("container"), f = fromTheme("spacing"), p = fromTheme("radius"), m = fromTheme("shadow"), h = fromTheme("inset-shadow"), g = fromTheme("text-shadow"), _ = fromTheme("drop-shadow"), v = fromTheme("blur"), y = fromTheme("perspective"), b = fromTheme("aspect"), x = fromTheme("ease"), S = fromTheme("animate"), C = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	], w = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	], T = () => [
		...w(),
		isArbitraryVariable,
		isArbitraryValue
	], E = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], D = () => [
		"auto",
		"contain",
		"none"
	], O = () => [
		isArbitraryVariable,
		isArbitraryValue,
		f
	], k = () => [
		isFraction,
		"full",
		"auto",
		...O()
	], A = () => [
		isInteger,
		"none",
		"subgrid",
		isArbitraryVariable,
		isArbitraryValue
	], j = () => [
		"auto",
		{ span: [
			"full",
			isInteger,
			isArbitraryVariable,
			isArbitraryValue
		] },
		isInteger,
		isArbitraryVariable,
		isArbitraryValue
	], M = () => [
		isInteger,
		"auto",
		isArbitraryVariable,
		isArbitraryValue
	], N = () => [
		"auto",
		"min",
		"max",
		"fr",
		isArbitraryVariable,
		isArbitraryValue
	], P = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	], F = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], I = () => ["auto", ...O()], L = () => [
		isFraction,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...O()
	], R = () => [
		i,
		isArbitraryVariable,
		isArbitraryValue
	], z = () => [
		...w(),
		isArbitraryVariablePosition,
		isArbitraryPosition,
		{ position: [isArbitraryVariable, isArbitraryValue] }
	], B = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], V = () => [
		"auto",
		"cover",
		"contain",
		isArbitraryVariableSize,
		isArbitrarySize,
		{ size: [isArbitraryVariable, isArbitraryValue] }
	], H = () => [
		isPercent,
		isArbitraryVariableLength,
		isArbitraryLength
	], U = () => [
		"",
		"none",
		"full",
		p,
		isArbitraryVariable,
		isArbitraryValue
	], W = () => [
		"",
		isNumber,
		isArbitraryVariableLength,
		isArbitraryLength
	], G = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], K = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	], q = () => [
		isNumber,
		isPercent,
		isArbitraryVariablePosition,
		isArbitraryPosition
	], J = () => [
		"",
		"none",
		v,
		isArbitraryVariable,
		isArbitraryValue
	], Y = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	], Z = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	], Q = () => [
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	], $ = () => [
		isFraction,
		"full",
		...O()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [isTshirtSize],
			breakpoint: [isTshirtSize],
			color: [isAny],
			container: [isTshirtSize],
			"drop-shadow": [isTshirtSize],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [isAnyNonArbitrary],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [isTshirtSize],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [isTshirtSize],
			shadow: [isTshirtSize],
			spacing: ["px", isNumber],
			text: [isTshirtSize],
			"text-shadow": [isTshirtSize],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			aspect: [{ aspect: [
				"auto",
				"square",
				isFraction,
				isArbitraryValue,
				isArbitraryVariable,
				b
			] }],
			container: ["container"],
			columns: [{ columns: [
				isNumber,
				isArbitraryValue,
				isArbitraryVariable,
				d
			] }],
			"break-after": [{ "break-after": C() }],
			"break-before": [{ "break-before": C() }],
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			box: [{ box: ["border", "content"] }],
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			sr: ["sr-only", "not-sr-only"],
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			isolation: ["isolate", "isolation-auto"],
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			"object-position": [{ object: T() }],
			overflow: [{ overflow: E() }],
			"overflow-x": [{ "overflow-x": E() }],
			"overflow-y": [{ "overflow-y": E() }],
			overscroll: [{ overscroll: D() }],
			"overscroll-x": [{ "overscroll-x": D() }],
			"overscroll-y": [{ "overscroll-y": D() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: k() }],
			"inset-x": [{ "inset-x": k() }],
			"inset-y": [{ "inset-y": k() }],
			start: [{ start: k() }],
			end: [{ end: k() }],
			top: [{ top: k() }],
			right: [{ right: k() }],
			bottom: [{ bottom: k() }],
			left: [{ left: k() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				isInteger,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			basis: [{ basis: [
				isFraction,
				"full",
				"auto",
				d,
				...O()
			] }],
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			flex: [{ flex: [
				isNumber,
				isFraction,
				"auto",
				"initial",
				"none",
				isArbitraryValue
			] }],
			grow: [{ grow: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			shrink: [{ shrink: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			order: [{ order: [
				isInteger,
				"first",
				"last",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"grid-cols": [{ "grid-cols": A() }],
			"col-start-end": [{ col: j() }],
			"col-start": [{ "col-start": M() }],
			"col-end": [{ "col-end": M() }],
			"grid-rows": [{ "grid-rows": A() }],
			"row-start-end": [{ row: j() }],
			"row-start": [{ "row-start": M() }],
			"row-end": [{ "row-end": M() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": N() }],
			"auto-rows": [{ "auto-rows": N() }],
			gap: [{ gap: O() }],
			"gap-x": [{ "gap-x": O() }],
			"gap-y": [{ "gap-y": O() }],
			"justify-content": [{ justify: [...P(), "normal"] }],
			"justify-items": [{ "justify-items": [...F(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...F()] }],
			"align-content": [{ content: ["normal", ...P()] }],
			"align-items": [{ items: [...F(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...F(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": P() }],
			"place-items": [{ "place-items": [...F(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...F()] }],
			p: [{ p: O() }],
			px: [{ px: O() }],
			py: [{ py: O() }],
			ps: [{ ps: O() }],
			pe: [{ pe: O() }],
			pt: [{ pt: O() }],
			pr: [{ pr: O() }],
			pb: [{ pb: O() }],
			pl: [{ pl: O() }],
			m: [{ m: I() }],
			mx: [{ mx: I() }],
			my: [{ my: I() }],
			ms: [{ ms: I() }],
			me: [{ me: I() }],
			mt: [{ mt: I() }],
			mr: [{ mr: I() }],
			mb: [{ mb: I() }],
			ml: [{ ml: I() }],
			"space-x": [{ "space-x": O() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": O() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: L() }],
			w: [{ w: [
				d,
				"screen",
				...L()
			] }],
			"min-w": [{ "min-w": [
				d,
				"screen",
				"none",
				...L()
			] }],
			"max-w": [{ "max-w": [
				d,
				"screen",
				"none",
				"prose",
				{ screen: [u] },
				...L()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...L()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...L()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...L()
			] }],
			"font-size": [{ text: [
				"base",
				o,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				s,
				isArbitraryVariable,
				isArbitraryNumber
			] }],
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				isPercent,
				isArbitraryValue
			] }],
			"font-family": [{ font: [
				isArbitraryVariableFamilyName,
				isArbitraryValue,
				a
			] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				c,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"line-clamp": [{ "line-clamp": [
				isNumber,
				"none",
				isArbitraryVariable,
				isArbitraryNumber
			] }],
			leading: [{ leading: [l, ...O()] }],
			"list-image": [{ "list-image": [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: R() }],
			"text-color": [{ text: R() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...G(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				isNumber,
				"from-font",
				"auto",
				isArbitraryVariable,
				isArbitraryLength
			] }],
			"text-decoration-color": [{ decoration: R() }],
			"underline-offset": [{ "underline-offset": [
				isNumber,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			indent: [{ indent: O() }],
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			content: [{ content: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			"bg-position": [{ bg: z() }],
			"bg-repeat": [{ bg: B() }],
			"bg-size": [{ bg: V() }],
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					],
					radial: [
						"",
						isArbitraryVariable,
						isArbitraryValue
					],
					conic: [
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					]
				},
				isArbitraryVariableImage,
				isArbitraryImage
			] }],
			"bg-color": [{ bg: R() }],
			"gradient-from-pos": [{ from: H() }],
			"gradient-via-pos": [{ via: H() }],
			"gradient-to-pos": [{ to: H() }],
			"gradient-from": [{ from: R() }],
			"gradient-via": [{ via: R() }],
			"gradient-to": [{ to: R() }],
			rounded: [{ rounded: U() }],
			"rounded-s": [{ "rounded-s": U() }],
			"rounded-e": [{ "rounded-e": U() }],
			"rounded-t": [{ "rounded-t": U() }],
			"rounded-r": [{ "rounded-r": U() }],
			"rounded-b": [{ "rounded-b": U() }],
			"rounded-l": [{ "rounded-l": U() }],
			"rounded-ss": [{ "rounded-ss": U() }],
			"rounded-se": [{ "rounded-se": U() }],
			"rounded-ee": [{ "rounded-ee": U() }],
			"rounded-es": [{ "rounded-es": U() }],
			"rounded-tl": [{ "rounded-tl": U() }],
			"rounded-tr": [{ "rounded-tr": U() }],
			"rounded-br": [{ "rounded-br": U() }],
			"rounded-bl": [{ "rounded-bl": U() }],
			"border-w": [{ border: W() }],
			"border-w-x": [{ "border-x": W() }],
			"border-w-y": [{ "border-y": W() }],
			"border-w-s": [{ "border-s": W() }],
			"border-w-e": [{ "border-e": W() }],
			"border-w-t": [{ "border-t": W() }],
			"border-w-r": [{ "border-r": W() }],
			"border-w-b": [{ "border-b": W() }],
			"border-w-l": [{ "border-l": W() }],
			"divide-x": [{ "divide-x": W() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": W() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...G(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...G(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: R() }],
			"border-color-x": [{ "border-x": R() }],
			"border-color-y": [{ "border-y": R() }],
			"border-color-s": [{ "border-s": R() }],
			"border-color-e": [{ "border-e": R() }],
			"border-color-t": [{ "border-t": R() }],
			"border-color-r": [{ "border-r": R() }],
			"border-color-b": [{ "border-b": R() }],
			"border-color-l": [{ "border-l": R() }],
			"divide-color": [{ divide: R() }],
			"outline-style": [{ outline: [
				...G(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"outline-w": [{ outline: [
				"",
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			"outline-color": [{ outline: R() }],
			shadow: [{ shadow: [
				"",
				"none",
				m,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"shadow-color": [{ shadow: R() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				h,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"inset-shadow-color": [{ "inset-shadow": R() }],
			"ring-w": [{ ring: W() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: R() }],
			"ring-offset-w": [{ "ring-offset": [isNumber, isArbitraryLength] }],
			"ring-offset-color": [{ "ring-offset": R() }],
			"inset-ring-w": [{ "inset-ring": W() }],
			"inset-ring-color": [{ "inset-ring": R() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				g,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"text-shadow-color": [{ "text-shadow": R() }],
			opacity: [{ opacity: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"mix-blend": [{ "mix-blend": [
				...K(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": K() }],
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			"mask-image-linear-pos": [{ "mask-linear": [isNumber] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": q() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": q() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": R() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": R() }],
			"mask-image-t-from-pos": [{ "mask-t-from": q() }],
			"mask-image-t-to-pos": [{ "mask-t-to": q() }],
			"mask-image-t-from-color": [{ "mask-t-from": R() }],
			"mask-image-t-to-color": [{ "mask-t-to": R() }],
			"mask-image-r-from-pos": [{ "mask-r-from": q() }],
			"mask-image-r-to-pos": [{ "mask-r-to": q() }],
			"mask-image-r-from-color": [{ "mask-r-from": R() }],
			"mask-image-r-to-color": [{ "mask-r-to": R() }],
			"mask-image-b-from-pos": [{ "mask-b-from": q() }],
			"mask-image-b-to-pos": [{ "mask-b-to": q() }],
			"mask-image-b-from-color": [{ "mask-b-from": R() }],
			"mask-image-b-to-color": [{ "mask-b-to": R() }],
			"mask-image-l-from-pos": [{ "mask-l-from": q() }],
			"mask-image-l-to-pos": [{ "mask-l-to": q() }],
			"mask-image-l-from-color": [{ "mask-l-from": R() }],
			"mask-image-l-to-color": [{ "mask-l-to": R() }],
			"mask-image-x-from-pos": [{ "mask-x-from": q() }],
			"mask-image-x-to-pos": [{ "mask-x-to": q() }],
			"mask-image-x-from-color": [{ "mask-x-from": R() }],
			"mask-image-x-to-color": [{ "mask-x-to": R() }],
			"mask-image-y-from-pos": [{ "mask-y-from": q() }],
			"mask-image-y-to-pos": [{ "mask-y-to": q() }],
			"mask-image-y-from-color": [{ "mask-y-from": R() }],
			"mask-image-y-to-color": [{ "mask-y-to": R() }],
			"mask-image-radial": [{ "mask-radial": [isArbitraryVariable, isArbitraryValue] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": q() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": q() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": R() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": R() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": w() }],
			"mask-image-conic-pos": [{ "mask-conic": [isNumber] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": q() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": q() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": R() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": R() }],
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			"mask-position": [{ mask: z() }],
			"mask-repeat": [{ mask: B() }],
			"mask-size": [{ mask: V() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			filter: [{ filter: [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			blur: [{ blur: J() }],
			brightness: [{ brightness: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			contrast: [{ contrast: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				_,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			"drop-shadow-color": [{ "drop-shadow": R() }],
			grayscale: [{ grayscale: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"hue-rotate": [{ "hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			invert: [{ invert: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			saturate: [{ saturate: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			sepia: [{ sepia: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-blur": [{ "backdrop-blur": J() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": O() }],
			"border-spacing-x": [{ "border-spacing-x": O() }],
			"border-spacing-y": [{ "border-spacing-y": O() }],
			"table-layout": [{ table: ["auto", "fixed"] }],
			caption: [{ caption: ["top", "bottom"] }],
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				isNumber,
				"initial",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				x,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			delay: [{ delay: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			animate: [{ animate: [
				"none",
				S,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				y,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"perspective-origin": [{ "perspective-origin": T() }],
			rotate: [{ rotate: Y() }],
			"rotate-x": [{ "rotate-x": Y() }],
			"rotate-y": [{ "rotate-y": Y() }],
			"rotate-z": [{ "rotate-z": Y() }],
			scale: [{ scale: Z() }],
			"scale-x": [{ "scale-x": Z() }],
			"scale-y": [{ "scale-y": Z() }],
			"scale-z": [{ "scale-z": Z() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: Q() }],
			"skew-x": [{ "skew-x": Q() }],
			"skew-y": [{ "skew-y": Q() }],
			transform: [{ transform: [
				isArbitraryVariable,
				isArbitraryValue,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: T() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: $() }],
			"translate-x": [{ "translate-x": $() }],
			"translate-y": [{ "translate-y": $() }],
			"translate-z": [{ "translate-z": $() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: R() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: R() }],
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			"scroll-m": [{ "scroll-m": O() }],
			"scroll-mx": [{ "scroll-mx": O() }],
			"scroll-my": [{ "scroll-my": O() }],
			"scroll-ms": [{ "scroll-ms": O() }],
			"scroll-me": [{ "scroll-me": O() }],
			"scroll-mt": [{ "scroll-mt": O() }],
			"scroll-mr": [{ "scroll-mr": O() }],
			"scroll-mb": [{ "scroll-mb": O() }],
			"scroll-ml": [{ "scroll-ml": O() }],
			"scroll-p": [{ "scroll-p": O() }],
			"scroll-px": [{ "scroll-px": O() }],
			"scroll-py": [{ "scroll-py": O() }],
			"scroll-ps": [{ "scroll-ps": O() }],
			"scroll-pe": [{ "scroll-pe": O() }],
			"scroll-pt": [{ "scroll-pt": O() }],
			"scroll-pr": [{ "scroll-pr": O() }],
			"scroll-pb": [{ "scroll-pb": O() }],
			"scroll-pl": [{ "scroll-pl": O() }],
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			"snap-stop": [{ snap: ["normal", "always"] }],
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			"touch-pz": ["touch-pinch-zoom"],
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			fill: [{ fill: ["none", ...R()] }],
			"stroke-w": [{ stroke: [
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength,
				isArbitraryNumber
			] }],
			stroke: [{ stroke: ["none", ...R()] }],
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": ["right", "left"],
			"inset-y": ["top", "bottom"],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: ["pr", "pl"],
			py: ["pt", "pb"],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: ["mr", "ml"],
			my: ["mt", "mb"],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": ["border-w-r", "border-w-l"],
			"border-w-y": ["border-w-t", "border-w-b"],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": ["border-color-r", "border-color-l"],
			"border-color-y": ["border-color-t", "border-color-b"],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": ["scroll-mr", "scroll-ml"],
			"scroll-my": ["scroll-mt", "scroll-mb"],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": ["scroll-pr", "scroll-pl"],
			"scroll-py": ["scroll-pt", "scroll-pb"],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
});
function cn(...i) {
	return twMerge(clsx(i));
}
var ACTIVATION_THRESHOLD = 50, MIN_SCROLL_UP_THRESHOLD = 10;
function useAutoScroll(i) {
	let a = useRef(null), o = useRef(null), [s, c] = useState(!0), l = () => {
		a.current && (a.current.scrollTop = a.current.scrollHeight);
	};
	return useEffect(() => {
		a.current && (o.current = a.current.scrollTop);
	}, []), useEffect(() => {
		s && l();
	}, i), {
		containerRef: a,
		scrollToBottom: l,
		handleScroll: () => {
			if (a.current) {
				let { scrollTop: i, scrollHeight: s, clientHeight: l } = a.current, u = Math.abs(s - i - l), d = o.current ? i < o.current : !1, f = o.current ? o.current - i : 0;
				c(d && f > MIN_SCROLL_UP_THRESHOLD ? !1 : u < ACTIVATION_THRESHOLD), o.current = i;
			}
		},
		shouldAutoScroll: s,
		handleTouchStart: () => {
			c(!1);
		}
	};
}
function setRef(i, a) {
	if (typeof i == "function") return i(a);
	i != null && (i.current = a);
}
function composeRefs(...i) {
	return (a) => {
		let o = !1, s = i.map((i) => {
			let s = setRef(i, a);
			return !o && typeof s == "function" && (o = !0), s;
		});
		if (o) return () => {
			for (let a = 0; a < s.length; a++) {
				let o = s[a];
				typeof o == "function" ? o() : setRef(i[a], null);
			}
		};
	};
}
function useComposedRefs(...i) {
	return React$1.useCallback(composeRefs(...i), i);
}
var REACT_LAZY_TYPE = Symbol.for("react.lazy"), use = React$1.use;
function isPromiseLike(i) {
	return typeof i == "object" && !!i && "then" in i;
}
function isLazyComponent(i) {
	return typeof i == "object" && !!i && "$$typeof" in i && i.$$typeof === REACT_LAZY_TYPE && "_payload" in i && isPromiseLike(i._payload);
}
/* @__NO_SIDE_EFFECTS__ */
function createSlot$5(i) {
	let a = /* @__PURE__ */ createSlotClone$5(i), o = React$1.forwardRef((i, o) => {
		let { children: s, ...c } = i;
		isLazyComponent(s) && typeof use == "function" && (s = use(s._payload));
		let l = React$1.Children.toArray(s), u = l.find(isSlottable$5);
		if (u) {
			let i = u.props.children, s = l.map((a) => a === u ? React$1.Children.count(i) > 1 ? React$1.Children.only(null) : React$1.isValidElement(i) ? i.props.children : null : a);
			return /* @__PURE__ */ jsx(a, {
				...c,
				ref: o,
				children: React$1.isValidElement(i) ? React$1.cloneElement(i, void 0, s) : null
			});
		}
		return /* @__PURE__ */ jsx(a, {
			...c,
			ref: o,
			children: s
		});
	});
	return o.displayName = `${i}.Slot`, o;
}
var Slot$3 = /* @__PURE__ */ createSlot$5("Slot");
/* @__NO_SIDE_EFFECTS__ */
function createSlotClone$5(i) {
	let a = React$1.forwardRef((i, a) => {
		let { children: o, ...s } = i;
		if (isLazyComponent(o) && typeof use == "function" && (o = use(o._payload)), React$1.isValidElement(o)) {
			let i = getElementRef$6(o), c = mergeProps$5(s, o.props);
			return o.type !== React$1.Fragment && (c.ref = a ? composeRefs(a, i) : i), React$1.cloneElement(o, c);
		}
		return React$1.Children.count(o) > 1 ? React$1.Children.only(null) : null;
	});
	return a.displayName = `${i}.SlotClone`, a;
}
var SLOTTABLE_IDENTIFIER$5 = Symbol("radix.slottable");
function isSlottable$5(i) {
	return React$1.isValidElement(i) && typeof i.type == "function" && "__radixId" in i.type && i.type.__radixId === SLOTTABLE_IDENTIFIER$5;
}
function mergeProps$5(i, a) {
	let o = { ...a };
	for (let s in a) {
		let c = i[s], l = a[s];
		/^on[A-Z]/.test(s) ? c && l ? o[s] = (...i) => {
			let a = l(...i);
			return c(...i), a;
		} : c && (o[s] = c) : s === "style" ? o[s] = {
			...c,
			...l
		} : s === "className" && (o[s] = [c, l].filter(Boolean).join(" "));
	}
	return {
		...i,
		...o
	};
}
function getElementRef$6(i) {
	let a = Object.getOwnPropertyDescriptor(i.props, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning;
	return o ? i.ref : (a = Object.getOwnPropertyDescriptor(i, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning, o ? i.props.ref : i.props.ref || i.ref);
}
var falsyToString = (i) => typeof i == "boolean" ? `${i}` : i === 0 ? "0" : i;
const cx = clsx, cva = (i, a) => (o) => {
	if (a?.variants == null) return cx(i, o?.class, o?.className);
	let { variants: s, defaultVariants: c } = a, l = Object.keys(s).map((i) => {
		let a = o?.[i], l = c?.[i];
		if (a === null) return null;
		let u = falsyToString(a) || falsyToString(l);
		return s[i][u];
	}), u = o && Object.entries(o).reduce((i, a) => {
		let [o, s] = a;
		return s === void 0 || (i[o] = s), i;
	}, {});
	return cx(i, l, a?.compoundVariants?.reduce((i, a) => {
		let { class: o, className: s, ...l } = a;
		return Object.entries(l).every((i) => {
			let [a, o] = i;
			return Array.isArray(o) ? o.includes({
				...c,
				...u
			}[a]) : {
				...c,
				...u
			}[a] === o;
		}) ? [
			...i,
			o,
			s
		] : i;
	}, []), o?.class, o?.className);
};
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
			outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2 has-[>svg]:px-3",
			sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
			lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
			icon: "size-9",
			"icon-sm": "size-8",
			"icon-lg": "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className: i, variant: a = "default", size: o = "default", asChild: s = !1, ...c }) {
	return /* @__PURE__ */ jsx(s ? Slot$3 : "button", {
		"data-slot": "button",
		"data-variant": a,
		"data-size": o,
		className: cn(buttonVariants({
			variant: a,
			size: o,
			className: i
		})),
		...c
	});
}
function __insertCSS(i) {
	if (!i || typeof document > "u") return;
	let a = document.head || document.getElementsByTagName("head")[0], o = document.createElement("style");
	o.type = "text/css", a.appendChild(o), o.styleSheet ? o.styleSheet.cssText = i : o.appendChild(document.createTextNode(i));
}
Array(12).fill(0);
var toastsCounter = 1, ToastState = new class {
	constructor() {
		this.subscribe = (i) => (this.subscribers.push(i), () => {
			let a = this.subscribers.indexOf(i);
			this.subscribers.splice(a, 1);
		}), this.publish = (i) => {
			this.subscribers.forEach((a) => a(i));
		}, this.addToast = (i) => {
			this.publish(i), this.toasts = [...this.toasts, i];
		}, this.create = (i) => {
			let { message: a, ...o } = i, s = typeof i?.id == "number" || i.id?.length > 0 ? i.id : toastsCounter++, c = this.toasts.find((i) => i.id === s), l = i.dismissible === void 0 ? !0 : i.dismissible;
			return this.dismissedToasts.has(s) && this.dismissedToasts.delete(s), c ? this.toasts = this.toasts.map((o) => o.id === s ? (this.publish({
				...o,
				...i,
				id: s,
				title: a
			}), {
				...o,
				...i,
				id: s,
				dismissible: l,
				title: a
			}) : o) : this.addToast({
				title: a,
				...o,
				dismissible: l,
				id: s
			}), s;
		}, this.dismiss = (i) => (i ? (this.dismissedToasts.add(i), requestAnimationFrame(() => this.subscribers.forEach((a) => a({
			id: i,
			dismiss: !0
		})))) : this.toasts.forEach((i) => {
			this.subscribers.forEach((a) => a({
				id: i.id,
				dismiss: !0
			}));
		}), i), this.message = (i, a) => this.create({
			...a,
			message: i
		}), this.error = (i, a) => this.create({
			...a,
			message: i,
			type: "error"
		}), this.success = (i, a) => this.create({
			...a,
			type: "success",
			message: i
		}), this.info = (i, a) => this.create({
			...a,
			type: "info",
			message: i
		}), this.warning = (i, a) => this.create({
			...a,
			type: "warning",
			message: i
		}), this.loading = (i, a) => this.create({
			...a,
			type: "loading",
			message: i
		}), this.promise = (i, a) => {
			if (!a) return;
			let o;
			a.loading !== void 0 && (o = this.create({
				...a,
				promise: i,
				type: "loading",
				message: a.loading,
				description: typeof a.description == "function" ? void 0 : a.description
			}));
			let s = Promise.resolve(i instanceof Function ? i() : i), c = o !== void 0, l, u = s.then(async (i) => {
				if (l = ["resolve", i], React.isValidElement(i)) c = !1, this.create({
					id: o,
					type: "default",
					message: i
				});
				else if (isHttpResponse(i) && !i.ok) {
					c = !1;
					let s = typeof a.error == "function" ? await a.error(`HTTP error! status: ${i.status}`) : a.error, l = typeof a.description == "function" ? await a.description(`HTTP error! status: ${i.status}`) : a.description, u = typeof s == "object" && !React.isValidElement(s) ? s : { message: s };
					this.create({
						id: o,
						type: "error",
						description: l,
						...u
					});
				} else if (i instanceof Error) {
					c = !1;
					let s = typeof a.error == "function" ? await a.error(i) : a.error, l = typeof a.description == "function" ? await a.description(i) : a.description, u = typeof s == "object" && !React.isValidElement(s) ? s : { message: s };
					this.create({
						id: o,
						type: "error",
						description: l,
						...u
					});
				} else if (a.success !== void 0) {
					c = !1;
					let s = typeof a.success == "function" ? await a.success(i) : a.success, l = typeof a.description == "function" ? await a.description(i) : a.description, u = typeof s == "object" && !React.isValidElement(s) ? s : { message: s };
					this.create({
						id: o,
						type: "success",
						description: l,
						...u
					});
				}
			}).catch(async (i) => {
				if (l = ["reject", i], a.error !== void 0) {
					c = !1;
					let s = typeof a.error == "function" ? await a.error(i) : a.error, l = typeof a.description == "function" ? await a.description(i) : a.description, u = typeof s == "object" && !React.isValidElement(s) ? s : { message: s };
					this.create({
						id: o,
						type: "error",
						description: l,
						...u
					});
				}
			}).finally(() => {
				c && (this.dismiss(o), o = void 0), a.finally == null || a.finally.call(a);
			}), d = () => new Promise((i, a) => u.then(() => l[0] === "reject" ? a(l[1]) : i(l[1])).catch(a));
			return typeof o != "string" && typeof o != "number" ? { unwrap: d } : Object.assign(o, { unwrap: d });
		}, this.custom = (i, a) => {
			let o = a?.id || toastsCounter++;
			return this.create({
				jsx: i(o),
				id: o,
				...a
			}), o;
		}, this.getActiveToasts = () => this.toasts.filter((i) => !this.dismissedToasts.has(i.id)), this.subscribers = [], this.toasts = [], this.dismissedToasts = /* @__PURE__ */ new Set();
	}
}(), toastFunction = (i, a) => {
	let o = a?.id || toastsCounter++;
	return ToastState.addToast({
		title: i,
		...a,
		id: o
	}), o;
}, isHttpResponse = (i) => i && typeof i == "object" && "ok" in i && typeof i.ok == "boolean" && "status" in i && typeof i.status == "number", basicToast = toastFunction, toast = Object.assign(basicToast, {
	success: ToastState.success,
	info: ToastState.info,
	warning: ToastState.warning,
	error: ToastState.error,
	custom: ToastState.custom,
	message: ToastState.message,
	promise: ToastState.promise,
	dismiss: ToastState.dismiss,
	loading: ToastState.loading
}, {
	getHistory: () => ToastState.toasts,
	getToasts: () => ToastState.getActiveToasts()
});
__insertCSS("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");
function useCopyToClipboard({ text: i, copyMessage: a = "Copied to clipboard!" }) {
	let [o, s] = useState(!1), c = useRef(null);
	return {
		isCopied: o,
		handleCopy: useCallback(() => {
			navigator.clipboard.writeText(i).then(() => {
				toast.success(a), s(!0), c.current &&= (clearTimeout(c.current), null), c.current = setTimeout(() => {
					s(!1);
				}, 2e3);
			}).catch(() => {
				toast.error("Failed to copy to clipboard.");
			});
		}, [i, a])
	};
}
function CopyButton({ content: i, copyMessage: a }) {
	let { isCopied: o, handleCopy: s } = useCopyToClipboard({
		text: i,
		copyMessage: a
	});
	return /* @__PURE__ */ jsxs(Button, {
		variant: "ghost",
		size: "icon",
		className: "relative h-6 w-6",
		"aria-label": "Copy to clipboard",
		onClick: s,
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 flex items-center justify-center",
			children: /* @__PURE__ */ jsx(Check, { className: cn("h-4 w-4 transition-transform ease-in-out", o ? "scale-100" : "scale-0") })
		}), /* @__PURE__ */ jsx(Copy, { className: cn("h-4 w-4 transition-transform ease-in-out", o ? "scale-0" : "scale-100") })]
	});
}
var LayoutGroupContext = createContext({});
function useConstant(i) {
	let a = useRef(null);
	return a.current === null && (a.current = i()), a.current;
}
var PresenceContext = createContext(null), MotionConfigContext = createContext({
	transformPagePoint: (i) => i,
	isStatic: !1,
	reducedMotion: "never"
}), PopChildMeasure = class extends React$1.Component {
	getSnapshotBeforeUpdate(i) {
		let a = this.props.childRef.current;
		if (a && i.isPresent && !this.props.isPresent) {
			let i = this.props.sizeRef.current;
			i.height = a.offsetHeight || 0, i.width = a.offsetWidth || 0, i.top = a.offsetTop, i.left = a.offsetLeft;
		}
		return null;
	}
	componentDidUpdate() {}
	render() {
		return this.props.children;
	}
};
function PopChild({ children: i, isPresent: a }) {
	let o = useId(), s = useRef(null), c = useRef({
		width: 0,
		height: 0,
		top: 0,
		left: 0
	}), { nonce: l } = useContext(MotionConfigContext);
	return useInsertionEffect(() => {
		let { width: i, height: u, top: d, left: f } = c.current;
		if (a || !s.current || !i || !u) return;
		s.current.dataset.motionPopId = o;
		let p = document.createElement("style");
		return l && (p.nonce = l), document.head.appendChild(p), p.sheet && p.sheet.insertRule(`
          [data-motion-pop-id="${o}"] {
            position: absolute !important;
            width: ${i}px !important;
            height: ${u}px !important;
            top: ${d}px !important;
            left: ${f}px !important;
          }
        `), () => {
			document.head.removeChild(p);
		};
	}, [a]), jsx(PopChildMeasure, {
		isPresent: a,
		childRef: s,
		sizeRef: c,
		children: React$1.cloneElement(i, { ref: s })
	});
}
var PresenceChild = ({ children: i, initial: a, isPresent: o, onExitComplete: s, custom: c, presenceAffectsLayout: l, mode: u }) => {
	let d = useConstant(newChildrenMap), f = useId(), p = useCallback((i) => {
		d.set(i, !0);
		for (let i of d.values()) if (!i) return;
		s && s();
	}, [d, s]), m = useMemo(() => ({
		id: f,
		initial: a,
		isPresent: o,
		custom: c,
		onExitComplete: p,
		register: (i) => (d.set(i, !1), () => d.delete(i))
	}), l ? [Math.random(), p] : [o, p]);
	return useMemo(() => {
		d.forEach((i, a) => d.set(a, !1));
	}, [o]), React$1.useEffect(() => {
		!o && !d.size && s && s();
	}, [o]), u === "popLayout" && (i = jsx(PopChild, {
		isPresent: o,
		children: i
	})), jsx(PresenceContext.Provider, {
		value: m,
		children: i
	});
};
function newChildrenMap() {
	return /* @__PURE__ */ new Map();
}
function usePresence$1(i = !0) {
	let a = useContext(PresenceContext);
	if (a === null) return [!0, null];
	let { isPresent: o, onExitComplete: s, register: c } = a, l = useId();
	useEffect(() => {
		i && c(l);
	}, [i]);
	let u = useCallback(() => i && s && s(l), [
		l,
		s,
		i
	]);
	return !o && s ? [!1, u] : [!0];
}
var getChildKey = (i) => i.key || "";
function onlyElements(i) {
	let a = [];
	return Children.forEach(i, (i) => {
		isValidElement(i) && a.push(i);
	}), a;
}
var isBrowser = typeof window < "u", useIsomorphicLayoutEffect$1 = isBrowser ? useLayoutEffect : useEffect, AnimatePresence = ({ children: i, custom: a, initial: o = !0, onExitComplete: s, presenceAffectsLayout: c = !0, mode: l = "sync", propagate: u = !1 }) => {
	let [d, f] = usePresence$1(u), p = useMemo(() => onlyElements(i), [i]), m = u && !d ? [] : p.map(getChildKey), h = useRef(!0), g = useRef(p), _ = useConstant(() => /* @__PURE__ */ new Map()), [v, y] = useState(p), [b, x] = useState(p);
	useIsomorphicLayoutEffect$1(() => {
		h.current = !1, g.current = p;
		for (let i = 0; i < b.length; i++) {
			let a = getChildKey(b[i]);
			m.includes(a) ? _.delete(a) : _.get(a) !== !0 && _.set(a, !1);
		}
	}, [
		b,
		m.length,
		m.join("-")
	]);
	let S = [];
	if (p !== v) {
		let i = [...p];
		for (let a = 0; a < b.length; a++) {
			let o = b[a], s = getChildKey(o);
			m.includes(s) || (i.splice(a, 0, o), S.push(o));
		}
		l === "wait" && S.length && (i = S), x(onlyElements(i)), y(p);
		return;
	}
	process.env.NODE_ENV !== "production" && l === "wait" && b.length > 1 && console.warn("You're attempting to animate multiple children within AnimatePresence, but its mode is set to \"wait\". This will lead to odd visual behaviour.");
	let { forceRender: C } = useContext(LayoutGroupContext);
	return jsx(Fragment$1, { children: b.map((i) => {
		let v = getChildKey(i), y = u && !d ? !1 : p === b || m.includes(v);
		return jsx(PresenceChild, {
			isPresent: y,
			initial: !h.current || o ? void 0 : !1,
			custom: y ? void 0 : a,
			presenceAffectsLayout: c,
			mode: l,
			onExitComplete: y ? void 0 : () => {
				if (_.has(v)) _.set(v, !0);
				else return;
				let i = !0;
				_.forEach((a) => {
					a || (i = !1);
				}), i && (C?.(), x(g.current), u && f?.(), s && s());
			},
			children: i
		}, v);
	}) });
}, noop = /* @__NO_SIDE_EFFECTS__ */ (i) => i, warning = noop, invariant = noop;
process.env.NODE_ENV !== "production" && (warning = (i, a) => {
	!i && typeof console < "u" && console.warn(a);
}, invariant = (i, a) => {
	if (!i) throw Error(a);
});
/* @__NO_SIDE_EFFECTS__ */
function memo(i) {
	let a;
	return () => (a === void 0 && (a = i()), a);
}
var progress = /* @__NO_SIDE_EFFECTS__ */ (i, a, o) => {
	let s = a - i;
	return s === 0 ? 1 : (o - i) / s;
}, secondsToMilliseconds = /* @__NO_SIDE_EFFECTS__ */ (i) => i * 1e3, millisecondsToSeconds = /* @__NO_SIDE_EFFECTS__ */ (i) => i / 1e3, MotionGlobalConfig = {
	skipAnimations: !1,
	useManualTiming: !1
};
function createRenderStep(i) {
	let a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), s = !1, c = !1, l = /* @__PURE__ */ new WeakSet(), u = {
		delta: 0,
		timestamp: 0,
		isProcessing: !1
	};
	function d(a) {
		l.has(a) && (f.schedule(a), i()), a(u);
	}
	let f = {
		schedule: (i, c = !1, u = !1) => {
			let d = u && s ? a : o;
			return c && l.add(i), d.has(i) || d.add(i), i;
		},
		cancel: (i) => {
			o.delete(i), l.delete(i);
		},
		process: (i) => {
			if (u = i, s) {
				c = !0;
				return;
			}
			s = !0, [a, o] = [o, a], a.forEach(d), a.clear(), s = !1, c && (c = !1, f.process(i));
		}
	};
	return f;
}
var stepsOrder = [
	"read",
	"resolveKeyframes",
	"update",
	"preRender",
	"render",
	"postRender"
], maxElapsed = 40;
function createRenderBatcher(i, a) {
	let o = !1, s = !0, c = {
		delta: 0,
		timestamp: 0,
		isProcessing: !1
	}, l = () => o = !0, u = stepsOrder.reduce((i, a) => (i[a] = createRenderStep(l), i), {}), { read: d, resolveKeyframes: f, update: p, preRender: m, render: h, postRender: g } = u, _ = () => {
		let l = MotionGlobalConfig.useManualTiming ? c.timestamp : performance.now();
		o = !1, c.delta = s ? 1e3 / 60 : Math.max(Math.min(l - c.timestamp, maxElapsed), 1), c.timestamp = l, c.isProcessing = !0, d.process(c), f.process(c), p.process(c), m.process(c), h.process(c), g.process(c), c.isProcessing = !1, o && a && (s = !1, i(_));
	}, v = () => {
		o = !0, s = !0, c.isProcessing || i(_);
	};
	return {
		schedule: stepsOrder.reduce((i, a) => {
			let s = u[a];
			return i[a] = (i, a = !1, c = !1) => (o || v(), s.schedule(i, a, c)), i;
		}, {}),
		cancel: (i) => {
			for (let a = 0; a < stepsOrder.length; a++) u[stepsOrder[a]].cancel(i);
		},
		state: c,
		steps: u
	};
}
var { schedule: frame, cancel: cancelFrame, state: frameData, steps: frameSteps } = createRenderBatcher(typeof requestAnimationFrame < "u" ? requestAnimationFrame : noop, !0), LazyContext = createContext({ strict: !1 }), featureProps = {
	animation: [
		"animate",
		"variants",
		"whileHover",
		"whileTap",
		"exit",
		"whileInView",
		"whileFocus",
		"whileDrag"
	],
	exit: ["exit"],
	drag: ["drag", "dragControls"],
	focus: ["whileFocus"],
	hover: [
		"whileHover",
		"onHoverStart",
		"onHoverEnd"
	],
	tap: [
		"whileTap",
		"onTap",
		"onTapStart",
		"onTapCancel"
	],
	pan: [
		"onPan",
		"onPanStart",
		"onPanSessionStart",
		"onPanEnd"
	],
	inView: [
		"whileInView",
		"onViewportEnter",
		"onViewportLeave"
	],
	layout: ["layout", "layoutId"]
}, featureDefinitions = {};
for (let i in featureProps) featureDefinitions[i] = { isEnabled: (a) => featureProps[i].some((i) => !!a[i]) };
function loadFeatures(i) {
	for (let a in i) featureDefinitions[a] = {
		...featureDefinitions[a],
		...i[a]
	};
}
var validMotionProps = new Set(/* @__PURE__ */ "animate.exit.variants.initial.style.values.variants.transition.transformTemplate.custom.inherit.onBeforeLayoutMeasure.onAnimationStart.onAnimationComplete.onUpdate.onDragStart.onDrag.onDragEnd.onMeasureDragConstraints.onDirectionLock.onDragTransitionEnd._dragX._dragY.onHoverStart.onHoverEnd.onViewportEnter.onViewportLeave.globalTapTarget.ignoreStrict.viewport".split("."));
function isValidMotionProp(i) {
	return i.startsWith("while") || i.startsWith("drag") && i !== "draggable" || i.startsWith("layout") || i.startsWith("onTap") || i.startsWith("onPan") || i.startsWith("onLayout") || validMotionProps.has(i);
}
var is_prop_valid_framer_motion_exports = /* @__PURE__ */ __export({ default: () => is_prop_valid_framer_motion_default }), is_prop_valid_framer_motion_default, init_is_prop_valid_framer_motion = __esmMin((() => {
	throw is_prop_valid_framer_motion_default = {}, Error("Could not resolve \"@emotion/is-prop-valid\" imported by \"framer-motion\". Is it installed?");
})), shouldForward = (i) => !isValidMotionProp(i);
function loadExternalIsValidProp(i) {
	i && (shouldForward = (a) => a.startsWith("on") ? !isValidMotionProp(a) : i(a));
}
try {
	loadExternalIsValidProp((init_is_prop_valid_framer_motion(), __toCommonJS(is_prop_valid_framer_motion_exports)).default);
} catch {}
function filterProps(i, a, o) {
	let s = {};
	for (let c in i) c === "values" && typeof i.values == "object" || (shouldForward(c) || o === !0 && isValidMotionProp(c) || !a && !isValidMotionProp(c) || i.draggable && c.startsWith("onDrag")) && (s[c] = i[c]);
	return s;
}
var warned = /* @__PURE__ */ new Set();
function warnOnce(i, a, o) {
	i || warned.has(a) || (console.warn(a), o && console.warn(o), warned.add(a));
}
function createDOMMotionComponentProxy(i) {
	if (typeof Proxy > "u") return i;
	let a = /* @__PURE__ */ new Map();
	return new Proxy((...a) => (process.env.NODE_ENV !== "production" && warnOnce(!1, "motion() is deprecated. Use motion.create() instead."), i(...a)), { get: (o, s) => s === "create" ? i : (a.has(s) || a.set(s, i(s)), a.get(s)) });
}
var MotionContext = createContext({});
function isVariantLabel(i) {
	return typeof i == "string" || Array.isArray(i);
}
function isAnimationControls(i) {
	return typeof i == "object" && !!i && typeof i.start == "function";
}
var variantPriorityOrder = [
	"animate",
	"whileInView",
	"whileFocus",
	"whileHover",
	"whileTap",
	"whileDrag",
	"exit"
], variantProps = ["initial", ...variantPriorityOrder];
function isControllingVariants(i) {
	return isAnimationControls(i.animate) || variantProps.some((a) => isVariantLabel(i[a]));
}
function isVariantNode(i) {
	return !!(isControllingVariants(i) || i.variants);
}
function getCurrentTreeVariants(i, a) {
	if (isControllingVariants(i)) {
		let { initial: a, animate: o } = i;
		return {
			initial: a === !1 || isVariantLabel(a) ? a : void 0,
			animate: isVariantLabel(o) ? o : void 0
		};
	}
	return i.inherit === !1 ? {} : a;
}
function useCreateMotionContext(i) {
	let { initial: a, animate: o } = getCurrentTreeVariants(i, useContext(MotionContext));
	return useMemo(() => ({
		initial: a,
		animate: o
	}), [variantLabelsAsDependency(a), variantLabelsAsDependency(o)]);
}
function variantLabelsAsDependency(i) {
	return Array.isArray(i) ? i.join(" ") : i;
}
var motionComponentSymbol = Symbol.for("motionComponentSymbol");
function isRefObject(i) {
	return i && typeof i == "object" && Object.prototype.hasOwnProperty.call(i, "current");
}
function useMotionRef(i, a, o) {
	return useCallback((s) => {
		s && i.onMount && i.onMount(s), a && (s ? a.mount(s) : a.unmount()), o && (typeof o == "function" ? o(s) : isRefObject(o) && (o.current = s));
	}, [a]);
}
var camelToDash = (i) => i.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase(), optimizedAppearDataAttribute = "data-" + camelToDash("framerAppearId"), { schedule: microtask, cancel: cancelMicrotask } = createRenderBatcher(queueMicrotask, !1), SwitchLayoutGroupContext = createContext({});
function useVisualElement(i, a, o, s, c) {
	let { visualElement: l } = useContext(MotionContext), u = useContext(LazyContext), d = useContext(PresenceContext), f = useContext(MotionConfigContext).reducedMotion, p = useRef(null);
	s ||= u.renderer, !p.current && s && (p.current = s(i, {
		visualState: a,
		parent: l,
		props: o,
		presenceContext: d,
		blockInitialAnimation: d ? d.initial === !1 : !1,
		reducedMotionConfig: f
	}));
	let m = p.current, h = useContext(SwitchLayoutGroupContext);
	m && !m.projection && c && (m.type === "html" || m.type === "svg") && createProjectionNode$1(p.current, o, c, h);
	let g = useRef(!1);
	useInsertionEffect(() => {
		m && g.current && m.update(o, d);
	});
	let _ = o[optimizedAppearDataAttribute], v = useRef(!!_ && !window.MotionHandoffIsComplete?.call(window, _) && window.MotionHasOptimisedAnimation?.call(window, _));
	return useIsomorphicLayoutEffect$1(() => {
		m && (g.current = !0, window.MotionIsMounted = !0, m.updateFeatures(), microtask.render(m.render), v.current && m.animationState && m.animationState.animateChanges());
	}), useEffect(() => {
		m && (!v.current && m.animationState && m.animationState.animateChanges(), v.current &&= (queueMicrotask(() => {
			var i;
			(i = window.MotionHandoffMarkAsComplete) == null || i.call(window, _);
		}), !1));
	}), m;
}
function createProjectionNode$1(i, a, o, s) {
	let { layoutId: c, layout: l, drag: u, dragConstraints: d, layoutScroll: f, layoutRoot: p } = a;
	i.projection = new o(i.latestValues, a["data-framer-portal-id"] ? void 0 : getClosestProjectingNode(i.parent)), i.projection.setOptions({
		layoutId: c,
		layout: l,
		alwaysMeasureLayout: !!u || d && isRefObject(d),
		visualElement: i,
		animationType: typeof l == "string" ? l : "both",
		initialPromotionConfig: s,
		layoutScroll: f,
		layoutRoot: p
	});
}
function getClosestProjectingNode(i) {
	if (i) return i.options.allowProjection === !1 ? getClosestProjectingNode(i.parent) : i.projection;
}
function createRendererMotionComponent({ preloadedFeatures: i, createVisualElement: a, useRender: o, useVisualState: s, Component: c }) {
	i && loadFeatures(i);
	function l(l, u) {
		let d, f = {
			...useContext(MotionConfigContext),
			...l,
			layoutId: useLayoutId(l)
		}, { isStatic: p } = f, m = useCreateMotionContext(l), h = s(l, p);
		if (!p && isBrowser) {
			useStrictMode(f, i);
			let o = getProjectionFunctionality(f);
			d = o.MeasureLayout, m.visualElement = useVisualElement(c, h, f, a, o.ProjectionNode);
		}
		return jsxs(MotionContext.Provider, {
			value: m,
			children: [d && m.visualElement ? jsx(d, {
				visualElement: m.visualElement,
				...f
			}) : null, o(c, l, useMotionRef(h, m.visualElement, u), h, p, m.visualElement)]
		});
	}
	l.displayName = `motion.${typeof c == "string" ? c : `create(${c.displayName ?? c.name ?? ""})`}`;
	let u = forwardRef(l);
	return u[motionComponentSymbol] = c, u;
}
function useLayoutId({ layoutId: i }) {
	let a = useContext(LayoutGroupContext).id;
	return a && i !== void 0 ? a + "-" + i : i;
}
function useStrictMode(i, a) {
	let o = useContext(LazyContext).strict;
	if (process.env.NODE_ENV !== "production" && a && o) {
		let a = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
		i.ignoreStrict ? warning(!1, a) : invariant(!1, a);
	}
}
function getProjectionFunctionality(i) {
	let { drag: a, layout: o } = featureDefinitions;
	if (!a && !o) return {};
	let s = {
		...a,
		...o
	};
	return {
		MeasureLayout: a?.isEnabled(i) || o?.isEnabled(i) ? s.MeasureLayout : void 0,
		ProjectionNode: s.ProjectionNode
	};
}
var lowercaseSVGElements = [
	"animate",
	"circle",
	"defs",
	"desc",
	"ellipse",
	"g",
	"image",
	"line",
	"filter",
	"marker",
	"mask",
	"metadata",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"rect",
	"stop",
	"switch",
	"symbol",
	"svg",
	"text",
	"tspan",
	"use",
	"view"
];
function isSVGComponent(i) {
	return typeof i != "string" || i.includes("-") ? !1 : !!(lowercaseSVGElements.indexOf(i) > -1 || /[A-Z]/u.test(i));
}
function getValueState(i) {
	let a = [{}, {}];
	return i?.values.forEach((i, o) => {
		a[0][o] = i.get(), a[1][o] = i.getVelocity();
	}), a;
}
function resolveVariantFromProps(i, a, o, s) {
	if (typeof a == "function") {
		let [c, l] = getValueState(s);
		a = a(o === void 0 ? i.custom : o, c, l);
	}
	if (typeof a == "string" && (a = i.variants && i.variants[a]), typeof a == "function") {
		let [c, l] = getValueState(s);
		a = a(o === void 0 ? i.custom : o, c, l);
	}
	return a;
}
var isKeyframesTarget = (i) => Array.isArray(i), isCustomValue = (i) => !!(i && typeof i == "object" && i.mix && i.toValue), resolveFinalValueInKeyframes = (i) => isKeyframesTarget(i) ? i[i.length - 1] || 0 : i, isMotionValue = (i) => !!(i && i.getVelocity);
function resolveMotionValue(i) {
	let a = isMotionValue(i) ? i.get() : i;
	return isCustomValue(a) ? a.toValue() : a;
}
function makeState({ scrapeMotionValuesFromProps: i, createRenderState: a, onUpdate: o }, s, c, l) {
	let u = {
		latestValues: makeLatestValues(s, c, l, i),
		renderState: a()
	};
	return o && (u.onMount = (i) => o({
		props: s,
		current: i,
		...u
	}), u.onUpdate = (i) => o(i)), u;
}
var makeUseVisualState = (i) => (a, o) => {
	let s = useContext(MotionContext), c = useContext(PresenceContext), l = () => makeState(i, a, s, c);
	return o ? l() : useConstant(l);
};
function makeLatestValues(i, a, o, s) {
	let c = {}, l = s(i, {});
	for (let i in l) c[i] = resolveMotionValue(l[i]);
	let { initial: u, animate: d } = i, f = isControllingVariants(i), p = isVariantNode(i);
	a && p && !f && i.inherit !== !1 && (u === void 0 && (u = a.initial), d === void 0 && (d = a.animate));
	let m = o ? o.initial === !1 : !1;
	m ||= u === !1;
	let h = m ? d : u;
	if (h && typeof h != "boolean" && !isAnimationControls(h)) {
		let a = Array.isArray(h) ? h : [h];
		for (let o = 0; o < a.length; o++) {
			let s = resolveVariantFromProps(i, a[o]);
			if (s) {
				let { transitionEnd: i, transition: a, ...o } = s;
				for (let i in o) {
					let a = o[i];
					if (Array.isArray(a)) {
						let i = m ? a.length - 1 : 0;
						a = a[i];
					}
					a !== null && (c[i] = a);
				}
				for (let a in i) c[a] = i[a];
			}
		}
	}
	return c;
}
var transformPropOrder = [
	"transformPerspective",
	"x",
	"y",
	"z",
	"translateX",
	"translateY",
	"translateZ",
	"scale",
	"scaleX",
	"scaleY",
	"rotate",
	"rotateX",
	"rotateY",
	"rotateZ",
	"skew",
	"skewX",
	"skewY"
], transformProps = new Set(transformPropOrder), checkStringStartsWith = (i) => (a) => typeof a == "string" && a.startsWith(i), isCSSVariableName = /* @__PURE__ */ checkStringStartsWith("--"), startsAsVariableToken = /* @__PURE__ */ checkStringStartsWith("var(--"), isCSSVariableToken = (i) => startsAsVariableToken(i) ? singleCssVariableRegex.test(i.split("/*")[0].trim()) : !1, singleCssVariableRegex = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu, getValueAsType = (i, a) => a && typeof i == "number" ? a.transform(i) : i, clamp$2 = (i, a, o) => o > a ? a : o < i ? i : o, number = {
	test: (i) => typeof i == "number",
	parse: parseFloat,
	transform: (i) => i
}, alpha = {
	...number,
	transform: (i) => clamp$2(0, 1, i)
}, scale = {
	...number,
	default: 1
}, createUnitType = (i) => ({
	test: (a) => typeof a == "string" && a.endsWith(i) && a.split(" ").length === 1,
	parse: parseFloat,
	transform: (a) => `${a}${i}`
}), degrees = /* @__PURE__ */ createUnitType("deg"), percent = /* @__PURE__ */ createUnitType("%"), px = /* @__PURE__ */ createUnitType("px"), vh = /* @__PURE__ */ createUnitType("vh"), vw = /* @__PURE__ */ createUnitType("vw"), progressPercentage = {
	...percent,
	parse: (i) => percent.parse(i) / 100,
	transform: (i) => percent.transform(i * 100)
}, browserNumberValueTypes = {
	borderWidth: px,
	borderTopWidth: px,
	borderRightWidth: px,
	borderBottomWidth: px,
	borderLeftWidth: px,
	borderRadius: px,
	radius: px,
	borderTopLeftRadius: px,
	borderTopRightRadius: px,
	borderBottomRightRadius: px,
	borderBottomLeftRadius: px,
	width: px,
	maxWidth: px,
	height: px,
	maxHeight: px,
	top: px,
	right: px,
	bottom: px,
	left: px,
	padding: px,
	paddingTop: px,
	paddingRight: px,
	paddingBottom: px,
	paddingLeft: px,
	margin: px,
	marginTop: px,
	marginRight: px,
	marginBottom: px,
	marginLeft: px,
	backgroundPositionX: px,
	backgroundPositionY: px
}, transformValueTypes = {
	rotate: degrees,
	rotateX: degrees,
	rotateY: degrees,
	rotateZ: degrees,
	scale,
	scaleX: scale,
	scaleY: scale,
	scaleZ: scale,
	skew: degrees,
	skewX: degrees,
	skewY: degrees,
	distance: px,
	translateX: px,
	translateY: px,
	translateZ: px,
	x: px,
	y: px,
	z: px,
	perspective: px,
	transformPerspective: px,
	opacity: alpha,
	originX: progressPercentage,
	originY: progressPercentage,
	originZ: px
}, int = {
	...number,
	transform: Math.round
}, numberValueTypes = {
	...browserNumberValueTypes,
	...transformValueTypes,
	zIndex: int,
	size: px,
	fillOpacity: alpha,
	strokeOpacity: alpha,
	numOctaves: int
}, translateAlias = {
	x: "translateX",
	y: "translateY",
	z: "translateZ",
	transformPerspective: "perspective"
}, numTransforms = transformPropOrder.length;
function buildTransform(i, a, o) {
	let s = "", c = !0;
	for (let l = 0; l < numTransforms; l++) {
		let u = transformPropOrder[l], d = i[u];
		if (d === void 0) continue;
		let f = !0;
		if (f = typeof d == "number" ? d === (u.startsWith("scale") ? 1 : 0) : parseFloat(d) === 0, !f || o) {
			let i = getValueAsType(d, numberValueTypes[u]);
			if (!f) {
				c = !1;
				let a = translateAlias[u] || u;
				s += `${a}(${i}) `;
			}
			o && (a[u] = i);
		}
	}
	return s = s.trim(), o ? s = o(a, c ? "" : s) : c && (s = "none"), s;
}
function buildHTMLStyles(i, a, o) {
	let { style: s, vars: c, transformOrigin: l } = i, u = !1, d = !1;
	for (let i in a) {
		let o = a[i];
		if (transformProps.has(i)) {
			u = !0;
			continue;
		} else if (isCSSVariableName(i)) {
			c[i] = o;
			continue;
		} else {
			let a = getValueAsType(o, numberValueTypes[i]);
			i.startsWith("origin") ? (d = !0, l[i] = a) : s[i] = a;
		}
	}
	if (a.transform || (u || o ? s.transform = buildTransform(a, i.transform, o) : s.transform &&= "none"), d) {
		let { originX: i = "50%", originY: a = "50%", originZ: o = 0 } = l;
		s.transformOrigin = `${i} ${a} ${o}`;
	}
}
var dashKeys = {
	offset: "stroke-dashoffset",
	array: "stroke-dasharray"
}, camelKeys = {
	offset: "strokeDashoffset",
	array: "strokeDasharray"
};
function buildSVGPath(i, a, o = 1, s = 0, c = !0) {
	i.pathLength = 1;
	let l = c ? dashKeys : camelKeys;
	i[l.offset] = px.transform(-s);
	let u = px.transform(a), d = px.transform(o);
	i[l.array] = `${u} ${d}`;
}
function calcOrigin$1(i, a, o) {
	return typeof i == "string" ? i : px.transform(a + o * i);
}
function calcSVGTransformOrigin(i, a, o) {
	return `${calcOrigin$1(a, i.x, i.width)} ${calcOrigin$1(o, i.y, i.height)}`;
}
function buildSVGAttrs(i, { attrX: a, attrY: o, attrScale: s, originX: c, originY: l, pathLength: u, pathSpacing: d = 1, pathOffset: f = 0, ...p }, m, h) {
	if (buildHTMLStyles(i, p, h), m) {
		i.style.viewBox && (i.attrs.viewBox = i.style.viewBox);
		return;
	}
	i.attrs = i.style, i.style = {};
	let { attrs: g, style: _, dimensions: v } = i;
	g.transform && (v && (_.transform = g.transform), delete g.transform), v && (c !== void 0 || l !== void 0 || _.transform) && (_.transformOrigin = calcSVGTransformOrigin(v, c === void 0 ? .5 : c, l === void 0 ? .5 : l)), a !== void 0 && (g.x = a), o !== void 0 && (g.y = o), s !== void 0 && (g.scale = s), u !== void 0 && buildSVGPath(g, u, d, f, !1);
}
var createHtmlRenderState = () => ({
	style: {},
	transform: {},
	transformOrigin: {},
	vars: {}
}), createSvgRenderState = () => ({
	...createHtmlRenderState(),
	attrs: {}
}), isSVGTag = (i) => typeof i == "string" && i.toLowerCase() === "svg";
function renderHTML(i, { style: a, vars: o }, s, c) {
	for (let l in Object.assign(i.style, a, c && c.getProjectionStyles(s)), o) i.style.setProperty(l, o[l]);
}
var camelCaseAttributes = new Set([
	"baseFrequency",
	"diffuseConstant",
	"kernelMatrix",
	"kernelUnitLength",
	"keySplines",
	"keyTimes",
	"limitingConeAngle",
	"markerHeight",
	"markerWidth",
	"numOctaves",
	"targetX",
	"targetY",
	"surfaceScale",
	"specularConstant",
	"specularExponent",
	"stdDeviation",
	"tableValues",
	"viewBox",
	"gradientTransform",
	"pathLength",
	"startOffset",
	"textLength",
	"lengthAdjust"
]);
function renderSVG(i, a, o, s) {
	for (let o in renderHTML(i, a, void 0, s), a.attrs) i.setAttribute(camelCaseAttributes.has(o) ? o : camelToDash(o), a.attrs[o]);
}
var scaleCorrectors = {};
function addScaleCorrector(i) {
	Object.assign(scaleCorrectors, i);
}
function isForcedMotionValue(i, { layout: a, layoutId: o }) {
	return transformProps.has(i) || i.startsWith("origin") || (a || o !== void 0) && (!!scaleCorrectors[i] || i === "opacity");
}
function scrapeMotionValuesFromProps$1(i, a, o) {
	let { style: s } = i, c = {};
	for (let l in s) (isMotionValue(s[l]) || a.style && isMotionValue(a.style[l]) || isForcedMotionValue(l, i) || o?.getValue(l)?.liveStyle !== void 0) && (c[l] = s[l]);
	return c;
}
function scrapeMotionValuesFromProps(i, a, o) {
	let s = scrapeMotionValuesFromProps$1(i, a, o);
	for (let o in i) if (isMotionValue(i[o]) || isMotionValue(a[o])) {
		let a = transformPropOrder.indexOf(o) === -1 ? o : "attr" + o.charAt(0).toUpperCase() + o.substring(1);
		s[a] = i[o];
	}
	return s;
}
function updateSVGDimensions(i, a) {
	try {
		a.dimensions = typeof i.getBBox == "function" ? i.getBBox() : i.getBoundingClientRect();
	} catch {
		a.dimensions = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
	}
}
var layoutProps = [
	"x",
	"y",
	"width",
	"height",
	"cx",
	"cy",
	"r"
], svgMotionConfig = { useVisualState: makeUseVisualState({
	scrapeMotionValuesFromProps,
	createRenderState: createSvgRenderState,
	onUpdate: ({ props: i, prevProps: a, current: o, renderState: s, latestValues: c }) => {
		if (!o) return;
		let l = !!i.drag;
		if (!l) {
			for (let i in c) if (transformProps.has(i)) {
				l = !0;
				break;
			}
		}
		if (!l) return;
		let u = !a;
		if (a) for (let o = 0; o < layoutProps.length; o++) {
			let s = layoutProps[o];
			i[s] !== a[s] && (u = !0);
		}
		u && frame.read(() => {
			updateSVGDimensions(o, s), frame.render(() => {
				buildSVGAttrs(s, c, isSVGTag(o.tagName), i.transformTemplate), renderSVG(o, s);
			});
		});
	}
}) }, htmlMotionConfig = { useVisualState: makeUseVisualState({
	scrapeMotionValuesFromProps: scrapeMotionValuesFromProps$1,
	createRenderState: createHtmlRenderState
}) };
function copyRawValuesOnly(i, a, o) {
	for (let s in a) !isMotionValue(a[s]) && !isForcedMotionValue(s, o) && (i[s] = a[s]);
}
function useInitialMotionValues({ transformTemplate: i }, a) {
	return useMemo(() => {
		let o = createHtmlRenderState();
		return buildHTMLStyles(o, a, i), Object.assign({}, o.vars, o.style);
	}, [a]);
}
function useStyle(i, a) {
	let o = i.style || {}, s = {};
	return copyRawValuesOnly(s, o, i), Object.assign(s, useInitialMotionValues(i, a)), s;
}
function useHTMLProps(i, a) {
	let o = {}, s = useStyle(i, a);
	return i.drag && i.dragListener !== !1 && (o.draggable = !1, s.userSelect = s.WebkitUserSelect = s.WebkitTouchCallout = "none", s.touchAction = i.drag === !0 ? "none" : `pan-${i.drag === "x" ? "y" : "x"}`), i.tabIndex === void 0 && (i.onTap || i.onTapStart || i.whileTap) && (o.tabIndex = 0), o.style = s, o;
}
function useSVGProps(i, a, o, s) {
	let c = useMemo(() => {
		let o = createSvgRenderState();
		return buildSVGAttrs(o, a, isSVGTag(s), i.transformTemplate), {
			...o.attrs,
			style: { ...o.style }
		};
	}, [a]);
	if (i.style) {
		let a = {};
		copyRawValuesOnly(a, i.style, i), c.style = {
			...a,
			...c.style
		};
	}
	return c;
}
function createUseRender(i = !1) {
	return (a, o, s, { latestValues: c }, l) => {
		let u = (isSVGComponent(a) ? useSVGProps : useHTMLProps)(o, c, l, a), d = filterProps(o, typeof a == "string", i), f = a === Fragment ? {} : {
			...d,
			...u,
			ref: s
		}, { children: p } = o, m = useMemo(() => isMotionValue(p) ? p.get() : p, [p]);
		return createElement(a, {
			...f,
			children: m
		});
	};
}
function createMotionComponentFactory(i, a) {
	return function(o, { forwardMotionProps: s } = { forwardMotionProps: !1 }) {
		return createRendererMotionComponent({
			...isSVGComponent(o) ? svgMotionConfig : htmlMotionConfig,
			preloadedFeatures: i,
			useRender: createUseRender(s),
			createVisualElement: a,
			Component: o
		});
	};
}
function shallowCompare(i, a) {
	if (!Array.isArray(a)) return !1;
	let o = a.length;
	if (o !== i.length) return !1;
	for (let s = 0; s < o; s++) if (a[s] !== i[s]) return !1;
	return !0;
}
function resolveVariant(i, a, o) {
	let s = i.getProps();
	return resolveVariantFromProps(s, a, o === void 0 ? s.custom : o, i);
}
var supportsScrollTimeline = /* @__PURE__ */ memo(() => window.ScrollTimeline !== void 0), BaseGroupPlaybackControls = class {
	constructor(i) {
		this.stop = () => this.runAll("stop"), this.animations = i.filter(Boolean);
	}
	get finished() {
		return Promise.all(this.animations.map((i) => "finished" in i ? i.finished : i));
	}
	getAll(i) {
		return this.animations[0][i];
	}
	setAll(i, a) {
		for (let o = 0; o < this.animations.length; o++) this.animations[o][i] = a;
	}
	attachTimeline(i, a) {
		let o = this.animations.map((o) => {
			if (supportsScrollTimeline() && o.attachTimeline) return o.attachTimeline(i);
			if (typeof a == "function") return a(o);
		});
		return () => {
			o.forEach((i, a) => {
				i && i(), this.animations[a].stop();
			});
		};
	}
	get time() {
		return this.getAll("time");
	}
	set time(i) {
		this.setAll("time", i);
	}
	get speed() {
		return this.getAll("speed");
	}
	set speed(i) {
		this.setAll("speed", i);
	}
	get startTime() {
		return this.getAll("startTime");
	}
	get duration() {
		let i = 0;
		for (let a = 0; a < this.animations.length; a++) i = Math.max(i, this.animations[a].duration);
		return i;
	}
	runAll(i) {
		this.animations.forEach((a) => a[i]());
	}
	flatten() {
		this.runAll("flatten");
	}
	play() {
		this.runAll("play");
	}
	pause() {
		this.runAll("pause");
	}
	cancel() {
		this.runAll("cancel");
	}
	complete() {
		this.runAll("complete");
	}
}, GroupPlaybackControls = class extends BaseGroupPlaybackControls {
	then(i, a) {
		return Promise.all(this.animations).then(i).catch(a);
	}
};
function getValueTransition(i, a) {
	return i ? i[a] || i.default || i : void 0;
}
var maxGeneratorDuration = 2e4;
function calcGeneratorDuration(i) {
	let a = 0, o = i.next(a);
	for (; !o.done && a < 2e4;) a += 50, o = i.next(a);
	return a >= 2e4 ? Infinity : a;
}
function isGenerator(i) {
	return typeof i == "function";
}
function attachTimeline(i, a) {
	i.timeline = a, i.onfinish = null;
}
var isBezierDefinition = (i) => Array.isArray(i) && typeof i[0] == "number", supportsFlags = { linearEasing: void 0 };
function memoSupports(i, a) {
	let o = /* @__PURE__ */ memo(i);
	return () => supportsFlags[a] ?? o();
}
var supportsLinearEasing = /* @__PURE__ */ memoSupports(() => {
	try {
		document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
	} catch {
		return !1;
	}
	return !0;
}, "linearEasing"), generateLinearEasing = (i, a, o = 10) => {
	let s = "", c = Math.max(Math.round(a / o), 2);
	for (let a = 0; a < c; a++) s += i(/* @__PURE__ */ progress(0, c - 1, a)) + ", ";
	return `linear(${s.substring(0, s.length - 2)})`;
};
function isWaapiSupportedEasing(i) {
	return !!(typeof i == "function" && supportsLinearEasing() || !i || typeof i == "string" && (i in supportedWaapiEasing || supportsLinearEasing()) || isBezierDefinition(i) || Array.isArray(i) && i.every(isWaapiSupportedEasing));
}
var cubicBezierAsString = ([i, a, o, s]) => `cubic-bezier(${i}, ${a}, ${o}, ${s})`, supportedWaapiEasing = {
	linear: "linear",
	ease: "ease",
	easeIn: "ease-in",
	easeOut: "ease-out",
	easeInOut: "ease-in-out",
	circIn: /* @__PURE__ */ cubicBezierAsString([
		0,
		.65,
		.55,
		1
	]),
	circOut: /* @__PURE__ */ cubicBezierAsString([
		.55,
		0,
		1,
		.45
	]),
	backIn: /* @__PURE__ */ cubicBezierAsString([
		.31,
		.01,
		.66,
		-.59
	]),
	backOut: /* @__PURE__ */ cubicBezierAsString([
		.33,
		1.53,
		.69,
		.99
	])
};
function mapEasingToNativeEasing(i, a) {
	if (i) return typeof i == "function" && supportsLinearEasing() ? generateLinearEasing(i, a) : isBezierDefinition(i) ? cubicBezierAsString(i) : Array.isArray(i) ? i.map((i) => mapEasingToNativeEasing(i, a) || supportedWaapiEasing.easeOut) : supportedWaapiEasing[i];
}
var isDragging = {
	x: !1,
	y: !1
};
function isDragActive() {
	return isDragging.x || isDragging.y;
}
function resolveElements(i, a, o) {
	if (i instanceof Element) return [i];
	if (typeof i == "string") {
		let s = document;
		a && (s = a.current);
		let c = o?.[i] ?? s.querySelectorAll(i);
		return c ? Array.from(c) : [];
	}
	return Array.from(i);
}
function setupGesture(i, a) {
	let o = resolveElements(i), s = new AbortController();
	return [
		o,
		{
			passive: !0,
			...a,
			signal: s.signal
		},
		() => s.abort()
	];
}
function filterEvents$1(i) {
	return (a) => {
		a.pointerType === "touch" || isDragActive() || i(a);
	};
}
function hover(i, a, o = {}) {
	let [s, c, l] = setupGesture(i, o), u = filterEvents$1((i) => {
		let { target: o } = i, s = a(i);
		if (typeof s != "function" || !o) return;
		let l = filterEvents$1((i) => {
			s(i), o.removeEventListener("pointerleave", l);
		});
		o.addEventListener("pointerleave", l, c);
	});
	return s.forEach((i) => {
		i.addEventListener("pointerenter", u, c);
	}), l;
}
var isNodeOrChild = (i, a) => a ? i === a ? !0 : isNodeOrChild(i, a.parentElement) : !1, isPrimaryPointer = (i) => i.pointerType === "mouse" ? typeof i.button != "number" || i.button <= 0 : i.isPrimary !== !1, focusableElements = new Set([
	"BUTTON",
	"INPUT",
	"SELECT",
	"TEXTAREA",
	"A"
]);
function isElementKeyboardAccessible(i) {
	return focusableElements.has(i.tagName) || i.tabIndex !== -1;
}
var isPressing = /* @__PURE__ */ new WeakSet();
function filterEvents(i) {
	return (a) => {
		a.key === "Enter" && i(a);
	};
}
function firePointerEvent(i, a) {
	i.dispatchEvent(new PointerEvent("pointer" + a, {
		isPrimary: !0,
		bubbles: !0
	}));
}
var enableKeyboardPress = (i, a) => {
	let o = i.currentTarget;
	if (!o) return;
	let s = filterEvents(() => {
		if (isPressing.has(o)) return;
		firePointerEvent(o, "down");
		let i = filterEvents(() => {
			firePointerEvent(o, "up");
		});
		o.addEventListener("keyup", i, a), o.addEventListener("blur", () => firePointerEvent(o, "cancel"), a);
	});
	o.addEventListener("keydown", s, a), o.addEventListener("blur", () => o.removeEventListener("keydown", s), a);
};
function isValidPressEvent(i) {
	return isPrimaryPointer(i) && !isDragActive();
}
function press(i, a, o = {}) {
	let [s, c, l] = setupGesture(i, o), u = (i) => {
		let s = i.currentTarget;
		if (!isValidPressEvent(i) || isPressing.has(s)) return;
		isPressing.add(s);
		let l = a(i), u = (i, a) => {
			window.removeEventListener("pointerup", d), window.removeEventListener("pointercancel", f), !(!isValidPressEvent(i) || !isPressing.has(s)) && (isPressing.delete(s), typeof l == "function" && l(i, { success: a }));
		}, d = (i) => {
			u(i, o.useGlobalTarget || isNodeOrChild(s, i.target));
		}, f = (i) => {
			u(i, !1);
		};
		window.addEventListener("pointerup", d, c), window.addEventListener("pointercancel", f, c);
	};
	return s.forEach((i) => {
		!isElementKeyboardAccessible(i) && i.getAttribute("tabindex") === null && (i.tabIndex = 0), (o.useGlobalTarget ? window : i).addEventListener("pointerdown", u, c), i.addEventListener("focus", (i) => enableKeyboardPress(i, c), c);
	}), l;
}
function setDragLock(i) {
	return i === "x" || i === "y" ? isDragging[i] ? null : (isDragging[i] = !0, () => {
		isDragging[i] = !1;
	}) : isDragging.x || isDragging.y ? null : (isDragging.x = isDragging.y = !0, () => {
		isDragging.x = isDragging.y = !1;
	});
}
var positionalKeys = new Set([
	"width",
	"height",
	"top",
	"left",
	"right",
	"bottom",
	...transformPropOrder
]), now;
function clearTime() {
	now = void 0;
}
var time = {
	now: () => (now === void 0 && time.set(frameData.isProcessing || MotionGlobalConfig.useManualTiming ? frameData.timestamp : performance.now()), now),
	set: (i) => {
		now = i, queueMicrotask(clearTime);
	}
};
function addUniqueItem(i, a) {
	i.indexOf(a) === -1 && i.push(a);
}
function removeItem(i, a) {
	let o = i.indexOf(a);
	o > -1 && i.splice(o, 1);
}
var SubscriptionManager = class {
	constructor() {
		this.subscriptions = [];
	}
	add(i) {
		return addUniqueItem(this.subscriptions, i), () => removeItem(this.subscriptions, i);
	}
	notify(i, a, o) {
		let s = this.subscriptions.length;
		if (s) if (s === 1) this.subscriptions[0](i, a, o);
		else for (let c = 0; c < s; c++) {
			let s = this.subscriptions[c];
			s && s(i, a, o);
		}
	}
	getSize() {
		return this.subscriptions.length;
	}
	clear() {
		this.subscriptions.length = 0;
	}
};
function velocityPerSecond(i, a) {
	return a ? i * (1e3 / a) : 0;
}
var MAX_VELOCITY_DELTA = 30, isFloat = (i) => !isNaN(parseFloat(i)), collectMotionValues = { current: void 0 }, MotionValue = class {
	constructor(i, a = {}) {
		this.version = "11.18.2", this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (i, a = !0) => {
			let o = time.now();
			this.updatedAt !== o && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(i), this.current !== this.prev && this.events.change && this.events.change.notify(this.current), a && this.events.renderRequest && this.events.renderRequest.notify(this.current);
		}, this.hasAnimated = !1, this.setCurrent(i), this.owner = a.owner;
	}
	setCurrent(i) {
		this.current = i, this.updatedAt = time.now(), this.canTrackVelocity === null && i !== void 0 && (this.canTrackVelocity = isFloat(this.current));
	}
	setPrevFrameValue(i = this.current) {
		this.prevFrameValue = i, this.prevUpdatedAt = this.updatedAt;
	}
	onChange(i) {
		return process.env.NODE_ENV !== "production" && warnOnce(!1, "value.onChange(callback) is deprecated. Switch to value.on(\"change\", callback)."), this.on("change", i);
	}
	on(i, a) {
		this.events[i] || (this.events[i] = new SubscriptionManager());
		let o = this.events[i].add(a);
		return i === "change" ? () => {
			o(), frame.read(() => {
				this.events.change.getSize() || this.stop();
			});
		} : o;
	}
	clearListeners() {
		for (let i in this.events) this.events[i].clear();
	}
	attach(i, a) {
		this.passiveEffect = i, this.stopPassiveEffect = a;
	}
	set(i, a = !0) {
		!a || !this.passiveEffect ? this.updateAndNotify(i, a) : this.passiveEffect(i, this.updateAndNotify);
	}
	setWithVelocity(i, a, o) {
		this.set(a), this.prev = void 0, this.prevFrameValue = i, this.prevUpdatedAt = this.updatedAt - o;
	}
	jump(i, a = !0) {
		this.updateAndNotify(i), this.prev = i, this.prevUpdatedAt = this.prevFrameValue = void 0, a && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
	}
	get() {
		return collectMotionValues.current && collectMotionValues.current.push(this), this.current;
	}
	getPrevious() {
		return this.prev;
	}
	getVelocity() {
		let i = time.now();
		if (!this.canTrackVelocity || this.prevFrameValue === void 0 || i - this.updatedAt > MAX_VELOCITY_DELTA) return 0;
		let a = Math.min(this.updatedAt - this.prevUpdatedAt, MAX_VELOCITY_DELTA);
		return velocityPerSecond(parseFloat(this.current) - parseFloat(this.prevFrameValue), a);
	}
	start(i) {
		return this.stop(), new Promise((a) => {
			this.hasAnimated = !0, this.animation = i(a), this.events.animationStart && this.events.animationStart.notify();
		}).then(() => {
			this.events.animationComplete && this.events.animationComplete.notify(), this.clearAnimation();
		});
	}
	stop() {
		this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation();
	}
	isAnimating() {
		return !!this.animation;
	}
	clearAnimation() {
		delete this.animation;
	}
	destroy() {
		this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
	}
};
function motionValue(i, a) {
	return new MotionValue(i, a);
}
function setMotionValue(i, a, o) {
	i.hasValue(a) ? i.getValue(a).set(o) : i.addValue(a, motionValue(o));
}
function setTarget(i, a) {
	let { transitionEnd: o = {}, transition: s = {}, ...c } = resolveVariant(i, a) || {};
	for (let a in c = {
		...c,
		...o
	}, c) setMotionValue(i, a, resolveFinalValueInKeyframes(c[a]));
}
function isWillChangeMotionValue(i) {
	return !!(isMotionValue(i) && i.add);
}
function addValueToWillChange(i, a) {
	let o = i.getValue("willChange");
	if (isWillChangeMotionValue(o)) return o.add(a);
}
function getOptimisedAppearId(i) {
	return i.props[optimizedAppearDataAttribute];
}
var instantAnimationState = { current: !1 }, calcBezier = (i, a, o) => (((1 - 3 * o + 3 * a) * i + (3 * o - 6 * a)) * i + 3 * a) * i, subdivisionPrecision = 1e-7, subdivisionMaxIterations = 12;
function binarySubdivide(i, a, o, s, c) {
	let l, u, d = 0;
	do
		u = a + (o - a) / 2, l = calcBezier(u, s, c) - i, l > 0 ? o = u : a = u;
	while (Math.abs(l) > subdivisionPrecision && ++d < subdivisionMaxIterations);
	return u;
}
function cubicBezier(i, a, o, s) {
	if (i === a && o === s) return noop;
	let c = (a) => binarySubdivide(a, 0, 1, i, o);
	return (i) => i === 0 || i === 1 ? i : calcBezier(c(i), a, s);
}
var mirrorEasing = (i) => (a) => a <= .5 ? i(2 * a) / 2 : (2 - i(2 * (1 - a))) / 2, reverseEasing = (i) => (a) => 1 - i(1 - a), backOut = /* @__PURE__ */ cubicBezier(.33, 1.53, .69, .99), backIn = /* @__PURE__ */ reverseEasing(backOut), backInOut = /* @__PURE__ */ mirrorEasing(backIn), anticipate = (i) => (i *= 2) < 1 ? .5 * backIn(i) : .5 * (2 - 2 ** (-10 * (i - 1))), circIn = (i) => 1 - Math.sin(Math.acos(i)), circOut = reverseEasing(circIn), circInOut = mirrorEasing(circIn), isZeroValueString = (i) => /^0[^.\s]+$/u.test(i);
function isNone(i) {
	return typeof i == "number" ? i === 0 : i === null ? !0 : i === "none" || i === "0" || isZeroValueString(i);
}
var sanitize = (i) => Math.round(i * 1e5) / 1e5, floatRegex = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function isNullish(i) {
	return i == null;
}
var singleColorRegex = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, isColorString = (i, a) => (o) => !!(typeof o == "string" && singleColorRegex.test(o) && o.startsWith(i) || a && !isNullish(o) && Object.prototype.hasOwnProperty.call(o, a)), splitColor = (i, a, o) => (s) => {
	if (typeof s != "string") return s;
	let [c, l, u, d] = s.match(floatRegex);
	return {
		[i]: parseFloat(c),
		[a]: parseFloat(l),
		[o]: parseFloat(u),
		alpha: d === void 0 ? 1 : parseFloat(d)
	};
}, clampRgbUnit = (i) => clamp$2(0, 255, i), rgbUnit = {
	...number,
	transform: (i) => Math.round(clampRgbUnit(i))
}, rgba = {
	test: /* @__PURE__ */ isColorString("rgb", "red"),
	parse: /* @__PURE__ */ splitColor("red", "green", "blue"),
	transform: ({ red: i, green: a, blue: o, alpha: s = 1 }) => "rgba(" + rgbUnit.transform(i) + ", " + rgbUnit.transform(a) + ", " + rgbUnit.transform(o) + ", " + sanitize(alpha.transform(s)) + ")"
};
function parseHex(i) {
	let a = "", o = "", s = "", c = "";
	return i.length > 5 ? (a = i.substring(1, 3), o = i.substring(3, 5), s = i.substring(5, 7), c = i.substring(7, 9)) : (a = i.substring(1, 2), o = i.substring(2, 3), s = i.substring(3, 4), c = i.substring(4, 5), a += a, o += o, s += s, c += c), {
		red: parseInt(a, 16),
		green: parseInt(o, 16),
		blue: parseInt(s, 16),
		alpha: c ? parseInt(c, 16) / 255 : 1
	};
}
var hex = {
	test: /* @__PURE__ */ isColorString("#"),
	parse: parseHex,
	transform: rgba.transform
}, hsla = {
	test: /* @__PURE__ */ isColorString("hsl", "hue"),
	parse: /* @__PURE__ */ splitColor("hue", "saturation", "lightness"),
	transform: ({ hue: i, saturation: a, lightness: o, alpha: s = 1 }) => "hsla(" + Math.round(i) + ", " + percent.transform(sanitize(a)) + ", " + percent.transform(sanitize(o)) + ", " + sanitize(alpha.transform(s)) + ")"
}, color$1 = {
	test: (i) => rgba.test(i) || hex.test(i) || hsla.test(i),
	parse: (i) => rgba.test(i) ? rgba.parse(i) : hsla.test(i) ? hsla.parse(i) : hex.parse(i),
	transform: (i) => typeof i == "string" ? i : i.hasOwnProperty("red") ? rgba.transform(i) : hsla.transform(i)
}, colorRegex = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function test(i) {
	return isNaN(i) && typeof i == "string" && (i.match(floatRegex)?.length || 0) + (i.match(colorRegex)?.length || 0) > 0;
}
var NUMBER_TOKEN = "number", COLOR_TOKEN = "color", VAR_TOKEN = "var", VAR_FUNCTION_TOKEN = "var(", SPLIT_TOKEN = "${}", complexRegex = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function analyseComplexValue(i) {
	let a = i.toString(), o = [], s = {
		color: [],
		number: [],
		var: []
	}, c = [], l = 0;
	return {
		values: o,
		split: a.replace(complexRegex, (i) => (color$1.test(i) ? (s.color.push(l), c.push(COLOR_TOKEN), o.push(color$1.parse(i))) : i.startsWith(VAR_FUNCTION_TOKEN) ? (s.var.push(l), c.push(VAR_TOKEN), o.push(i)) : (s.number.push(l), c.push(NUMBER_TOKEN), o.push(parseFloat(i))), ++l, SPLIT_TOKEN)).split(SPLIT_TOKEN),
		indexes: s,
		types: c
	};
}
function parseComplexValue(i) {
	return analyseComplexValue(i).values;
}
function createTransformer(i) {
	let { split: a, types: o } = analyseComplexValue(i), s = a.length;
	return (i) => {
		let c = "";
		for (let l = 0; l < s; l++) if (c += a[l], i[l] !== void 0) {
			let a = o[l];
			a === NUMBER_TOKEN ? c += sanitize(i[l]) : a === COLOR_TOKEN ? c += color$1.transform(i[l]) : c += i[l];
		}
		return c;
	};
}
var convertNumbersToZero = (i) => typeof i == "number" ? 0 : i;
function getAnimatableNone$1(i) {
	let a = parseComplexValue(i);
	return createTransformer(i)(a.map(convertNumbersToZero));
}
var complex = {
	test,
	parse: parseComplexValue,
	createTransformer,
	getAnimatableNone: getAnimatableNone$1
}, maxDefaults = new Set([
	"brightness",
	"contrast",
	"saturate",
	"opacity"
]);
function applyDefaultFilter(i) {
	let [a, o] = i.slice(0, -1).split("(");
	if (a === "drop-shadow") return i;
	let [s] = o.match(floatRegex) || [];
	if (!s) return i;
	let c = o.replace(s, ""), l = maxDefaults.has(a) ? 1 : 0;
	return s !== o && (l *= 100), a + "(" + l + c + ")";
}
var functionRegex = /\b([a-z-]*)\(.*?\)/gu, filter = {
	...complex,
	getAnimatableNone: (i) => {
		let a = i.match(functionRegex);
		return a ? a.map(applyDefaultFilter).join(" ") : i;
	}
}, defaultValueTypes = {
	...numberValueTypes,
	color: color$1,
	backgroundColor: color$1,
	outlineColor: color$1,
	fill: color$1,
	stroke: color$1,
	borderColor: color$1,
	borderTopColor: color$1,
	borderRightColor: color$1,
	borderBottomColor: color$1,
	borderLeftColor: color$1,
	filter,
	WebkitFilter: filter
}, getDefaultValueType = (i) => defaultValueTypes[i];
function getAnimatableNone(i, a) {
	let o = getDefaultValueType(i);
	return o !== filter && (o = complex), o.getAnimatableNone ? o.getAnimatableNone(a) : void 0;
}
var invalidTemplates = new Set([
	"auto",
	"none",
	"0"
]);
function makeNoneKeyframesAnimatable(i, a, o) {
	let s = 0, c;
	for (; s < i.length && !c;) {
		let a = i[s];
		typeof a == "string" && !invalidTemplates.has(a) && analyseComplexValue(a).values.length && (c = i[s]), s++;
	}
	if (c && o) for (let s of a) i[s] = getAnimatableNone(o, c);
}
var isNumOrPxType = (i) => i === number || i === px, getPosFromMatrix = (i, a) => parseFloat(i.split(", ")[a]), getTranslateFromMatrix = (i, a) => (o, { transform: s }) => {
	if (s === "none" || !s) return 0;
	let c = s.match(/^matrix3d\((.+)\)$/u);
	if (c) return getPosFromMatrix(c[1], a);
	{
		let a = s.match(/^matrix\((.+)\)$/u);
		return a ? getPosFromMatrix(a[1], i) : 0;
	}
}, transformKeys = new Set([
	"x",
	"y",
	"z"
]), nonTranslationalTransformKeys = transformPropOrder.filter((i) => !transformKeys.has(i));
function removeNonTranslationalTransform(i) {
	let a = [];
	return nonTranslationalTransformKeys.forEach((o) => {
		let s = i.getValue(o);
		s !== void 0 && (a.push([o, s.get()]), s.set(o.startsWith("scale") ? 1 : 0));
	}), a;
}
var positionalValues = {
	width: ({ x: i }, { paddingLeft: a = "0", paddingRight: o = "0" }) => i.max - i.min - parseFloat(a) - parseFloat(o),
	height: ({ y: i }, { paddingTop: a = "0", paddingBottom: o = "0" }) => i.max - i.min - parseFloat(a) - parseFloat(o),
	top: (i, { top: a }) => parseFloat(a),
	left: (i, { left: a }) => parseFloat(a),
	bottom: ({ y: i }, { top: a }) => parseFloat(a) + (i.max - i.min),
	right: ({ x: i }, { left: a }) => parseFloat(a) + (i.max - i.min),
	x: getTranslateFromMatrix(4, 13),
	y: getTranslateFromMatrix(5, 14)
};
positionalValues.translateX = positionalValues.x, positionalValues.translateY = positionalValues.y;
var toResolve = /* @__PURE__ */ new Set(), isScheduled = !1, anyNeedsMeasurement = !1;
function measureAllKeyframes() {
	if (anyNeedsMeasurement) {
		let i = Array.from(toResolve).filter((i) => i.needsMeasurement), a = new Set(i.map((i) => i.element)), o = /* @__PURE__ */ new Map();
		a.forEach((i) => {
			let a = removeNonTranslationalTransform(i);
			a.length && (o.set(i, a), i.render());
		}), i.forEach((i) => i.measureInitialState()), a.forEach((i) => {
			i.render();
			let a = o.get(i);
			a && a.forEach(([a, o]) => {
				var s;
				(s = i.getValue(a)) == null || s.set(o);
			});
		}), i.forEach((i) => i.measureEndState()), i.forEach((i) => {
			i.suspendedScrollY !== void 0 && window.scrollTo(0, i.suspendedScrollY);
		});
	}
	anyNeedsMeasurement = !1, isScheduled = !1, toResolve.forEach((i) => i.complete()), toResolve.clear();
}
function readAllKeyframes() {
	toResolve.forEach((i) => {
		i.readKeyframes(), i.needsMeasurement && (anyNeedsMeasurement = !0);
	});
}
function flushKeyframeResolvers() {
	readAllKeyframes(), measureAllKeyframes();
}
var KeyframeResolver = class {
	constructor(i, a, o, s, c, l = !1) {
		this.isComplete = !1, this.isAsync = !1, this.needsMeasurement = !1, this.isScheduled = !1, this.unresolvedKeyframes = [...i], this.onComplete = a, this.name = o, this.motionValue = s, this.element = c, this.isAsync = l;
	}
	scheduleResolve() {
		this.isScheduled = !0, this.isAsync ? (toResolve.add(this), isScheduled || (isScheduled = !0, frame.read(readAllKeyframes), frame.resolveKeyframes(measureAllKeyframes))) : (this.readKeyframes(), this.complete());
	}
	readKeyframes() {
		let { unresolvedKeyframes: i, name: a, element: o, motionValue: s } = this;
		for (let c = 0; c < i.length; c++) if (i[c] === null) if (c === 0) {
			let c = s?.get(), l = i[i.length - 1];
			if (c !== void 0) i[0] = c;
			else if (o && a) {
				let s = o.readValue(a, l);
				s != null && (i[0] = s);
			}
			i[0] === void 0 && (i[0] = l), s && c === void 0 && s.set(i[0]);
		} else i[c] = i[c - 1];
	}
	setFinalKeyframe() {}
	measureInitialState() {}
	renderEndStyles() {}
	measureEndState() {}
	complete() {
		this.isComplete = !0, this.onComplete(this.unresolvedKeyframes, this.finalKeyframe), toResolve.delete(this);
	}
	cancel() {
		this.isComplete || (this.isScheduled = !1, toResolve.delete(this));
	}
	resume() {
		this.isComplete || this.scheduleResolve();
	}
}, isNumericalString = (i) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(i), splitCSSVariableRegex = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function parseCSSVariable(i) {
	let a = splitCSSVariableRegex.exec(i);
	if (!a) return [,];
	let [, o, s, c] = a;
	return [`--${o ?? s}`, c];
}
var maxDepth = 4;
function getVariableValue(i, a, o = 1) {
	invariant(o <= maxDepth, `Max CSS variable fallback depth detected in property "${i}". This may indicate a circular fallback dependency.`);
	let [s, c] = parseCSSVariable(i);
	if (!s) return;
	let l = window.getComputedStyle(a).getPropertyValue(s);
	if (l) {
		let i = l.trim();
		return isNumericalString(i) ? parseFloat(i) : i;
	}
	return isCSSVariableToken(c) ? getVariableValue(c, a, o + 1) : c;
}
var testValueType = (i) => (a) => a.test(i), dimensionValueTypes = [
	number,
	px,
	percent,
	degrees,
	vw,
	vh,
	{
		test: (i) => i === "auto",
		parse: (i) => i
	}
], findDimensionValueType = (i) => dimensionValueTypes.find(testValueType(i)), DOMKeyframesResolver = class extends KeyframeResolver {
	constructor(i, a, o, s, c) {
		super(i, a, o, s, c, !0);
	}
	readKeyframes() {
		let { unresolvedKeyframes: i, element: a, name: o } = this;
		if (!a || !a.current) return;
		super.readKeyframes();
		for (let o = 0; o < i.length; o++) {
			let s = i[o];
			if (typeof s == "string" && (s = s.trim(), isCSSVariableToken(s))) {
				let c = getVariableValue(s, a.current);
				c !== void 0 && (i[o] = c), o === i.length - 1 && (this.finalKeyframe = s);
			}
		}
		if (this.resolveNoneKeyframes(), !positionalKeys.has(o) || i.length !== 2) return;
		let [s, c] = i, l = findDimensionValueType(s), u = findDimensionValueType(c);
		if (l !== u) if (isNumOrPxType(l) && isNumOrPxType(u)) for (let a = 0; a < i.length; a++) {
			let o = i[a];
			typeof o == "string" && (i[a] = parseFloat(o));
		}
		else this.needsMeasurement = !0;
	}
	resolveNoneKeyframes() {
		let { unresolvedKeyframes: i, name: a } = this, o = [];
		for (let a = 0; a < i.length; a++) isNone(i[a]) && o.push(a);
		o.length && makeNoneKeyframesAnimatable(i, o, a);
	}
	measureInitialState() {
		let { element: i, unresolvedKeyframes: a, name: o } = this;
		if (!i || !i.current) return;
		o === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = positionalValues[o](i.measureViewportBox(), window.getComputedStyle(i.current)), a[0] = this.measuredOrigin;
		let s = a[a.length - 1];
		s !== void 0 && i.getValue(o, s).jump(s, !1);
	}
	measureEndState() {
		let { element: i, name: a, unresolvedKeyframes: o } = this;
		if (!i || !i.current) return;
		let s = i.getValue(a);
		s && s.jump(this.measuredOrigin, !1);
		let c = o.length - 1, l = o[c];
		o[c] = positionalValues[a](i.measureViewportBox(), window.getComputedStyle(i.current)), l !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = l), this.removedTransforms?.length && this.removedTransforms.forEach(([a, o]) => {
			i.getValue(a).set(o);
		}), this.resolveNoneKeyframes();
	}
}, isAnimatable = (i, a) => a === "zIndex" ? !1 : !!(typeof i == "number" || Array.isArray(i) || typeof i == "string" && (complex.test(i) || i === "0") && !i.startsWith("url("));
function hasKeyframesChanged(i) {
	let a = i[0];
	if (i.length === 1) return !0;
	for (let o = 0; o < i.length; o++) if (i[o] !== a) return !0;
}
function canAnimate(i, a, o, s) {
	let c = i[0];
	if (c === null) return !1;
	if (a === "display" || a === "visibility") return !0;
	let l = i[i.length - 1], u = isAnimatable(c, a), d = isAnimatable(l, a);
	return warning(u === d, `You are trying to animate ${a} from "${c}" to "${l}". ${c} is not an animatable value - to enable this animation set ${c} to a value animatable to ${l} via the \`style\` property.`), !u || !d ? !1 : hasKeyframesChanged(i) || (o === "spring" || isGenerator(o)) && s;
}
var isNotNull$1 = (i) => i !== null;
function getFinalKeyframe(i, { repeat: a, repeatType: o = "loop" }, s) {
	let c = i.filter(isNotNull$1), l = a && o !== "loop" && a % 2 == 1 ? 0 : c.length - 1;
	return !l || s === void 0 ? c[l] : s;
}
var MAX_RESOLVE_DELAY = 40, BaseAnimation = class {
	constructor({ autoplay: i = !0, delay: a = 0, type: o = "keyframes", repeat: s = 0, repeatDelay: c = 0, repeatType: l = "loop", ...u }) {
		this.isStopped = !1, this.hasAttemptedResolve = !1, this.createdAt = time.now(), this.options = {
			autoplay: i,
			delay: a,
			type: o,
			repeat: s,
			repeatDelay: c,
			repeatType: l,
			...u
		}, this.updateFinishedPromise();
	}
	calcStartTime() {
		return this.resolvedAt && this.resolvedAt - this.createdAt > MAX_RESOLVE_DELAY ? this.resolvedAt : this.createdAt;
	}
	get resolved() {
		return !this._resolved && !this.hasAttemptedResolve && flushKeyframeResolvers(), this._resolved;
	}
	onKeyframesResolved(i, a) {
		this.resolvedAt = time.now(), this.hasAttemptedResolve = !0;
		let { name: o, type: s, velocity: c, delay: l, onComplete: u, onUpdate: d, isGenerator: f } = this.options;
		if (!f && !canAnimate(i, o, s, c)) if (instantAnimationState.current || !l) {
			d && d(getFinalKeyframe(i, this.options, a)), u && u(), this.resolveFinishedPromise();
			return;
		} else this.options.duration = 0;
		let p = this.initPlayback(i, a);
		p !== !1 && (this._resolved = {
			keyframes: i,
			finalKeyframe: a,
			...p
		}, this.onPostResolved());
	}
	onPostResolved() {}
	then(i, a) {
		return this.currentFinishedPromise.then(i, a);
	}
	flatten() {
		this.options.type = "keyframes", this.options.ease = "linear";
	}
	updateFinishedPromise() {
		this.currentFinishedPromise = new Promise((i) => {
			this.resolveFinishedPromise = i;
		});
	}
}, mixNumber = (i, a, o) => i + (a - i) * o;
function hueToRgb(i, a, o) {
	return o < 0 && (o += 1), o > 1 && --o, o < 1 / 6 ? i + (a - i) * 6 * o : o < 1 / 2 ? a : o < 2 / 3 ? i + (a - i) * (2 / 3 - o) * 6 : i;
}
function hslaToRgba({ hue: i, saturation: a, lightness: o, alpha: s }) {
	i /= 360, a /= 100, o /= 100;
	let c = 0, l = 0, u = 0;
	if (!a) c = l = u = o;
	else {
		let s = o < .5 ? o * (1 + a) : o + a - o * a, d = 2 * o - s;
		c = hueToRgb(d, s, i + 1 / 3), l = hueToRgb(d, s, i), u = hueToRgb(d, s, i - 1 / 3);
	}
	return {
		red: Math.round(c * 255),
		green: Math.round(l * 255),
		blue: Math.round(u * 255),
		alpha: s
	};
}
function mixImmediate(i, a) {
	return (o) => o > 0 ? a : i;
}
var mixLinearColor = (i, a, o) => {
	let s = i * i, c = o * (a * a - s) + s;
	return c < 0 ? 0 : Math.sqrt(c);
}, colorTypes = [
	hex,
	rgba,
	hsla
], getColorType = (i) => colorTypes.find((a) => a.test(i));
function asRGBA(i) {
	let a = getColorType(i);
	if (warning(!!a, `'${i}' is not an animatable color. Use the equivalent color code instead.`), !a) return !1;
	let o = a.parse(i);
	return a === hsla && (o = hslaToRgba(o)), o;
}
var mixColor = (i, a) => {
	let o = asRGBA(i), s = asRGBA(a);
	if (!o || !s) return mixImmediate(i, a);
	let c = { ...o };
	return (i) => (c.red = mixLinearColor(o.red, s.red, i), c.green = mixLinearColor(o.green, s.green, i), c.blue = mixLinearColor(o.blue, s.blue, i), c.alpha = mixNumber(o.alpha, s.alpha, i), rgba.transform(c));
}, combineFunctions = (i, a) => (o) => a(i(o)), pipe = (...i) => i.reduce(combineFunctions), invisibleValues = new Set(["none", "hidden"]);
function mixVisibility(i, a) {
	return invisibleValues.has(i) ? (o) => o <= 0 ? i : a : (o) => o >= 1 ? a : i;
}
function mixNumber$1(i, a) {
	return (o) => mixNumber(i, a, o);
}
function getMixer(i) {
	return typeof i == "number" ? mixNumber$1 : typeof i == "string" ? isCSSVariableToken(i) ? mixImmediate : color$1.test(i) ? mixColor : mixComplex : Array.isArray(i) ? mixArray : typeof i == "object" ? color$1.test(i) ? mixColor : mixObject : mixImmediate;
}
function mixArray(i, a) {
	let o = [...i], s = o.length, c = i.map((i, o) => getMixer(i)(i, a[o]));
	return (i) => {
		for (let a = 0; a < s; a++) o[a] = c[a](i);
		return o;
	};
}
function mixObject(i, a) {
	let o = {
		...i,
		...a
	}, s = {};
	for (let c in o) i[c] !== void 0 && a[c] !== void 0 && (s[c] = getMixer(i[c])(i[c], a[c]));
	return (i) => {
		for (let a in s) o[a] = s[a](i);
		return o;
	};
}
function matchOrder(i, a) {
	let o = [], s = {
		color: 0,
		var: 0,
		number: 0
	};
	for (let c = 0; c < a.values.length; c++) {
		let l = a.types[c], u = i.indexes[l][s[l]];
		o[c] = i.values[u] ?? 0, s[l]++;
	}
	return o;
}
var mixComplex = (i, a) => {
	let o = complex.createTransformer(a), s = analyseComplexValue(i), c = analyseComplexValue(a);
	return s.indexes.var.length === c.indexes.var.length && s.indexes.color.length === c.indexes.color.length && s.indexes.number.length >= c.indexes.number.length ? invisibleValues.has(i) && !c.values.length || invisibleValues.has(a) && !s.values.length ? mixVisibility(i, a) : pipe(mixArray(matchOrder(s, c), c.values), o) : (warning(!0, `Complex values '${i}' and '${a}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`), mixImmediate(i, a));
};
function mix(i, a, o) {
	return typeof i == "number" && typeof a == "number" && typeof o == "number" ? mixNumber(i, a, o) : getMixer(i)(i, a);
}
var velocitySampleDuration = 5;
function calcGeneratorVelocity(i, a, o) {
	let s = Math.max(a - velocitySampleDuration, 0);
	return velocityPerSecond(o - i(s), a - s);
}
var springDefaults = {
	stiffness: 100,
	damping: 10,
	mass: 1,
	velocity: 0,
	duration: 800,
	bounce: .3,
	visualDuration: .3,
	restSpeed: {
		granular: .01,
		default: 2
	},
	restDelta: {
		granular: .005,
		default: .5
	},
	minDuration: .01,
	maxDuration: 10,
	minDamping: .05,
	maxDamping: 1
}, safeMin = .001;
function findSpring({ duration: i = springDefaults.duration, bounce: a = springDefaults.bounce, velocity: o = springDefaults.velocity, mass: s = springDefaults.mass }) {
	let c, l;
	warning(i <= /* @__PURE__ */ secondsToMilliseconds(springDefaults.maxDuration), "Spring duration must be 10 seconds or less");
	let u = 1 - a;
	u = clamp$2(springDefaults.minDamping, springDefaults.maxDamping, u), i = clamp$2(springDefaults.minDuration, springDefaults.maxDuration, /* @__PURE__ */ millisecondsToSeconds(i)), u < 1 ? (c = (a) => {
		let s = a * u, c = s * i, l = s - o, d = calcAngularFreq(a, u), f = Math.exp(-c);
		return safeMin - l / d * f;
	}, l = (a) => {
		let s = a * u * i, l = s * o + o, d = u ** 2 * a ** 2 * i, f = Math.exp(-s), p = calcAngularFreq(a ** 2, u);
		return (-c(a) + safeMin > 0 ? -1 : 1) * ((l - d) * f) / p;
	}) : (c = (a) => {
		let s = Math.exp(-a * i), c = (a - o) * i + 1;
		return -safeMin + s * c;
	}, l = (a) => Math.exp(-a * i) * ((o - a) * (i * i)));
	let d = 5 / i, f = approximateRoot(c, l, d);
	if (i = /* @__PURE__ */ secondsToMilliseconds(i), isNaN(f)) return {
		stiffness: springDefaults.stiffness,
		damping: springDefaults.damping,
		duration: i
	};
	{
		let a = f ** 2 * s;
		return {
			stiffness: a,
			damping: u * 2 * Math.sqrt(s * a),
			duration: i
		};
	}
}
var rootIterations = 12;
function approximateRoot(i, a, o) {
	let s = o;
	for (let o = 1; o < rootIterations; o++) s -= i(s) / a(s);
	return s;
}
function calcAngularFreq(i, a) {
	return i * Math.sqrt(1 - a * a);
}
var durationKeys = ["duration", "bounce"], physicsKeys = [
	"stiffness",
	"damping",
	"mass"
];
function isSpringType(i, a) {
	return a.some((a) => i[a] !== void 0);
}
function getSpringOptions(i) {
	let a = {
		velocity: springDefaults.velocity,
		stiffness: springDefaults.stiffness,
		damping: springDefaults.damping,
		mass: springDefaults.mass,
		isResolvedFromDuration: !1,
		...i
	};
	if (!isSpringType(i, physicsKeys) && isSpringType(i, durationKeys)) if (i.visualDuration) {
		let o = i.visualDuration, s = 2 * Math.PI / (o * 1.2), c = s * s, l = 2 * clamp$2(.05, 1, 1 - (i.bounce || 0)) * Math.sqrt(c);
		a = {
			...a,
			mass: springDefaults.mass,
			stiffness: c,
			damping: l
		};
	} else {
		let o = findSpring(i);
		a = {
			...a,
			...o,
			mass: springDefaults.mass
		}, a.isResolvedFromDuration = !0;
	}
	return a;
}
function spring(i = springDefaults.visualDuration, a = springDefaults.bounce) {
	let o = typeof i == "object" ? i : {
		visualDuration: i,
		keyframes: [0, 1],
		bounce: a
	}, { restSpeed: s, restDelta: c } = o, l = o.keyframes[0], u = o.keyframes[o.keyframes.length - 1], d = {
		done: !1,
		value: l
	}, { stiffness: f, damping: p, mass: m, duration: h, velocity: g, isResolvedFromDuration: _ } = getSpringOptions({
		...o,
		velocity: -/* @__PURE__ */ millisecondsToSeconds(o.velocity || 0)
	}), v = g || 0, y = p / (2 * Math.sqrt(f * m)), b = u - l, x = /* @__PURE__ */ millisecondsToSeconds(Math.sqrt(f / m)), S = Math.abs(b) < 5;
	s ||= S ? springDefaults.restSpeed.granular : springDefaults.restSpeed.default, c ||= S ? springDefaults.restDelta.granular : springDefaults.restDelta.default;
	let C;
	if (y < 1) {
		let i = calcAngularFreq(x, y);
		C = (a) => u - Math.exp(-y * x * a) * ((v + y * x * b) / i * Math.sin(i * a) + b * Math.cos(i * a));
	} else if (y === 1) C = (i) => u - Math.exp(-x * i) * (b + (v + x * b) * i);
	else {
		let i = x * Math.sqrt(y * y - 1);
		C = (a) => {
			let o = Math.exp(-y * x * a), s = Math.min(i * a, 300);
			return u - o * ((v + y * x * b) * Math.sinh(s) + i * b * Math.cosh(s)) / i;
		};
	}
	let w = {
		calculatedDuration: _ && h || null,
		next: (i) => {
			let a = C(i);
			if (_) d.done = i >= h;
			else {
				let o = 0;
				y < 1 && (o = i === 0 ? /* @__PURE__ */ secondsToMilliseconds(v) : calcGeneratorVelocity(C, i, a));
				let l = Math.abs(o) <= s, f = Math.abs(u - a) <= c;
				d.done = l && f;
			}
			return d.value = d.done ? u : a, d;
		},
		toString: () => {
			let i = Math.min(calcGeneratorDuration(w), maxGeneratorDuration), a = generateLinearEasing((a) => w.next(i * a).value, i, 30);
			return i + "ms " + a;
		}
	};
	return w;
}
function inertia({ keyframes: i, velocity: a = 0, power: o = .8, timeConstant: s = 325, bounceDamping: c = 10, bounceStiffness: l = 500, modifyTarget: u, min: d, max: f, restDelta: p = .5, restSpeed: m }) {
	let h = i[0], g = {
		done: !1,
		value: h
	}, _ = (i) => d !== void 0 && i < d || f !== void 0 && i > f, v = (i) => d === void 0 ? f : f === void 0 || Math.abs(d - i) < Math.abs(f - i) ? d : f, y = o * a, b = h + y, x = u === void 0 ? b : u(b);
	x !== b && (y = x - h);
	let S = (i) => -y * Math.exp(-i / s), C = (i) => x + S(i), w = (i) => {
		let a = S(i), o = C(i);
		g.done = Math.abs(a) <= p, g.value = g.done ? x : o;
	}, T, E, D = (i) => {
		_(g.value) && (T = i, E = spring({
			keyframes: [g.value, v(g.value)],
			velocity: calcGeneratorVelocity(C, i, g.value),
			damping: c,
			stiffness: l,
			restDelta: p,
			restSpeed: m
		}));
	};
	return D(0), {
		calculatedDuration: null,
		next: (i) => {
			let a = !1;
			return !E && T === void 0 && (a = !0, w(i), D(i)), T !== void 0 && i >= T ? E.next(i - T) : (!a && w(i), g);
		}
	};
}
var easeIn = /* @__PURE__ */ cubicBezier(.42, 0, 1, 1), easeOut = /* @__PURE__ */ cubicBezier(0, 0, .58, 1), easeInOut = /* @__PURE__ */ cubicBezier(.42, 0, .58, 1), isEasingArray = (i) => Array.isArray(i) && typeof i[0] != "number", easingLookup = {
	linear: noop,
	easeIn,
	easeInOut,
	easeOut,
	circIn,
	circInOut,
	circOut,
	backIn,
	backInOut,
	backOut,
	anticipate
}, easingDefinitionToFunction = (i) => {
	if (isBezierDefinition(i)) {
		invariant(i.length === 4, "Cubic bezier arrays must contain four numerical values.");
		let [a, o, s, c] = i;
		return cubicBezier(a, o, s, c);
	} else if (typeof i == "string") return invariant(easingLookup[i] !== void 0, `Invalid easing type '${i}'`), easingLookup[i];
	return i;
};
function createMixers(i, a, o) {
	let s = [], c = o || mix, l = i.length - 1;
	for (let o = 0; o < l; o++) {
		let l = c(i[o], i[o + 1]);
		a && (l = pipe(Array.isArray(a) ? a[o] || noop : a, l)), s.push(l);
	}
	return s;
}
function interpolate(i, a, { clamp: o = !0, ease: s, mixer: c } = {}) {
	let l = i.length;
	if (invariant(l === a.length, "Both input and output ranges must be the same length"), l === 1) return () => a[0];
	if (l === 2 && a[0] === a[1]) return () => a[1];
	let u = i[0] === i[1];
	i[0] > i[l - 1] && (i = [...i].reverse(), a = [...a].reverse());
	let d = createMixers(a, s, c), f = d.length, p = (o) => {
		if (u && o < i[0]) return a[0];
		let s = 0;
		if (f > 1) for (; s < i.length - 2 && !(o < i[s + 1]); s++);
		let c = /* @__PURE__ */ progress(i[s], i[s + 1], o);
		return d[s](c);
	};
	return o ? (a) => p(clamp$2(i[0], i[l - 1], a)) : p;
}
function fillOffset(i, a) {
	let o = i[i.length - 1];
	for (let s = 1; s <= a; s++) {
		let c = /* @__PURE__ */ progress(0, a, s);
		i.push(mixNumber(o, 1, c));
	}
}
function defaultOffset(i) {
	let a = [0];
	return fillOffset(a, i.length - 1), a;
}
function convertOffsetToTimes(i, a) {
	return i.map((i) => i * a);
}
function defaultEasing(i, a) {
	return i.map(() => a || easeInOut).splice(0, i.length - 1);
}
function keyframes({ duration: i = 300, keyframes: a, times: o, ease: s = "easeInOut" }) {
	let c = isEasingArray(s) ? s.map(easingDefinitionToFunction) : easingDefinitionToFunction(s), l = {
		done: !1,
		value: a[0]
	}, u = interpolate(convertOffsetToTimes(o && o.length === a.length ? o : defaultOffset(a), i), a, { ease: Array.isArray(c) ? c : defaultEasing(a, c) });
	return {
		calculatedDuration: i,
		next: (a) => (l.value = u(a), l.done = a >= i, l)
	};
}
var frameloopDriver = (i) => {
	let a = ({ timestamp: a }) => i(a);
	return {
		start: () => frame.update(a, !0),
		stop: () => cancelFrame(a),
		now: () => frameData.isProcessing ? frameData.timestamp : time.now()
	};
}, generators = {
	decay: inertia,
	inertia,
	tween: keyframes,
	keyframes,
	spring
}, percentToProgress = (i) => i / 100, MainThreadAnimation = class extends BaseAnimation {
	constructor(i) {
		super(i), this.holdTime = null, this.cancelTime = null, this.currentTime = 0, this.playbackSpeed = 1, this.pendingPlayState = "running", this.startTime = null, this.state = "idle", this.stop = () => {
			if (this.resolver.cancel(), this.isStopped = !0, this.state === "idle") return;
			this.teardown();
			let { onStop: i } = this.options;
			i && i();
		};
		let { name: a, motionValue: o, element: s, keyframes: c } = this.options;
		this.resolver = new (s?.KeyframeResolver || KeyframeResolver)(c, (i, a) => this.onKeyframesResolved(i, a), a, o, s), this.resolver.scheduleResolve();
	}
	flatten() {
		super.flatten(), this._resolved && Object.assign(this._resolved, this.initPlayback(this._resolved.keyframes));
	}
	initPlayback(i) {
		let { type: a = "keyframes", repeat: o = 0, repeatDelay: s = 0, repeatType: c, velocity: l = 0 } = this.options, u = isGenerator(a) ? a : generators[a] || keyframes, d, f;
		u !== keyframes && typeof i[0] != "number" && (process.env.NODE_ENV !== "production" && invariant(i.length === 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${i}`), d = pipe(percentToProgress, mix(i[0], i[1])), i = [0, 100]);
		let p = u({
			...this.options,
			keyframes: i
		});
		c === "mirror" && (f = u({
			...this.options,
			keyframes: [...i].reverse(),
			velocity: -l
		})), p.calculatedDuration === null && (p.calculatedDuration = calcGeneratorDuration(p));
		let { calculatedDuration: m } = p, h = m + s, g = h * (o + 1) - s;
		return {
			generator: p,
			mirroredGenerator: f,
			mapPercentToKeyframes: d,
			calculatedDuration: m,
			resolvedDuration: h,
			totalDuration: g
		};
	}
	onPostResolved() {
		let { autoplay: i = !0 } = this.options;
		this.play(), this.pendingPlayState === "paused" || !i ? this.pause() : this.state = this.pendingPlayState;
	}
	tick(i, a = !1) {
		let { resolved: o } = this;
		if (!o) {
			let { keyframes: i } = this.options;
			return {
				done: !0,
				value: i[i.length - 1]
			};
		}
		let { finalKeyframe: s, generator: c, mirroredGenerator: l, mapPercentToKeyframes: u, keyframes: d, calculatedDuration: f, totalDuration: p, resolvedDuration: m } = o;
		if (this.startTime === null) return c.next(0);
		let { delay: h, repeat: g, repeatType: _, repeatDelay: v, onUpdate: y } = this.options;
		this.speed > 0 ? this.startTime = Math.min(this.startTime, i) : this.speed < 0 && (this.startTime = Math.min(i - p / this.speed, this.startTime)), a ? this.currentTime = i : this.holdTime === null ? this.currentTime = Math.round(i - this.startTime) * this.speed : this.currentTime = this.holdTime;
		let b = this.currentTime - h * (this.speed >= 0 ? 1 : -1), x = this.speed >= 0 ? b < 0 : b > p;
		this.currentTime = Math.max(b, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = p);
		let S = this.currentTime, C = c;
		if (g) {
			let i = Math.min(this.currentTime, p) / m, a = Math.floor(i), o = i % 1;
			!o && i >= 1 && (o = 1), o === 1 && a--, a = Math.min(a, g + 1), a % 2 && (_ === "reverse" ? (o = 1 - o, v && (o -= v / m)) : _ === "mirror" && (C = l)), S = clamp$2(0, 1, o) * m;
		}
		let w = x ? {
			done: !1,
			value: d[0]
		} : C.next(S);
		u && (w.value = u(w.value));
		let { done: T } = w;
		!x && f !== null && (T = this.speed >= 0 ? this.currentTime >= p : this.currentTime <= 0);
		let E = this.holdTime === null && (this.state === "finished" || this.state === "running" && T);
		return E && s !== void 0 && (w.value = getFinalKeyframe(d, this.options, s)), y && y(w.value), E && this.finish(), w;
	}
	get duration() {
		let { resolved: i } = this;
		return i ? /* @__PURE__ */ millisecondsToSeconds(i.calculatedDuration) : 0;
	}
	get time() {
		return /* @__PURE__ */ millisecondsToSeconds(this.currentTime);
	}
	set time(i) {
		i = /* @__PURE__ */ secondsToMilliseconds(i), this.currentTime = i, this.holdTime !== null || this.speed === 0 ? this.holdTime = i : this.driver && (this.startTime = this.driver.now() - i / this.speed);
	}
	get speed() {
		return this.playbackSpeed;
	}
	set speed(i) {
		let a = this.playbackSpeed !== i;
		this.playbackSpeed = i, a && (this.time = /* @__PURE__ */ millisecondsToSeconds(this.currentTime));
	}
	play() {
		if (this.resolver.isScheduled || this.resolver.resume(), !this._resolved) {
			this.pendingPlayState = "running";
			return;
		}
		if (this.isStopped) return;
		let { driver: i = frameloopDriver, onPlay: a, startTime: o } = this.options;
		this.driver ||= i((i) => this.tick(i)), a && a();
		let s = this.driver.now();
		this.holdTime === null ? this.startTime ? this.state === "finished" && (this.startTime = s) : this.startTime = o ?? this.calcStartTime() : this.startTime = s - this.holdTime, this.state === "finished" && this.updateFinishedPromise(), this.cancelTime = this.startTime, this.holdTime = null, this.state = "running", this.driver.start();
	}
	pause() {
		if (!this._resolved) {
			this.pendingPlayState = "paused";
			return;
		}
		this.state = "paused", this.holdTime = this.currentTime ?? 0;
	}
	complete() {
		this.state !== "running" && this.play(), this.pendingPlayState = this.state = "finished", this.holdTime = null;
	}
	finish() {
		this.teardown(), this.state = "finished";
		let { onComplete: i } = this.options;
		i && i();
	}
	cancel() {
		this.cancelTime !== null && this.tick(this.cancelTime), this.teardown(), this.updateFinishedPromise();
	}
	teardown() {
		this.state = "idle", this.stopDriver(), this.resolveFinishedPromise(), this.updateFinishedPromise(), this.startTime = this.cancelTime = null, this.resolver.cancel();
	}
	stopDriver() {
		this.driver &&= (this.driver.stop(), void 0);
	}
	sample(i) {
		return this.startTime = 0, this.tick(i, !0);
	}
}, acceleratedValues = new Set([
	"opacity",
	"clipPath",
	"filter",
	"transform"
]);
function startWaapiAnimation(i, a, o, { delay: s = 0, duration: c = 300, repeat: l = 0, repeatType: u = "loop", ease: d = "easeInOut", times: f } = {}) {
	let p = { [a]: o };
	f && (p.offset = f);
	let m = mapEasingToNativeEasing(d, c);
	return Array.isArray(m) && (p.easing = m), i.animate(p, {
		delay: s,
		duration: c,
		easing: Array.isArray(m) ? "linear" : m,
		fill: "both",
		iterations: l + 1,
		direction: u === "reverse" ? "alternate" : "normal"
	});
}
var supportsWaapi = /* @__PURE__ */ memo(() => Object.hasOwnProperty.call(Element.prototype, "animate")), sampleDelta = 10, maxDuration = 2e4;
function requiresPregeneratedKeyframes(i) {
	return isGenerator(i.type) || i.type === "spring" || !isWaapiSupportedEasing(i.ease);
}
function pregenerateKeyframes(i, a) {
	let o = new MainThreadAnimation({
		...a,
		keyframes: i,
		repeat: 0,
		delay: 0,
		isGenerator: !0
	}), s = {
		done: !1,
		value: i[0]
	}, c = [], l = 0;
	for (; !s.done && l < maxDuration;) s = o.sample(l), c.push(s.value), l += sampleDelta;
	return {
		times: void 0,
		keyframes: c,
		duration: l - sampleDelta,
		ease: "linear"
	};
}
var unsupportedEasingFunctions = {
	anticipate,
	backInOut,
	circInOut
};
function isUnsupportedEase(i) {
	return i in unsupportedEasingFunctions;
}
var AcceleratedAnimation = class extends BaseAnimation {
	constructor(i) {
		super(i);
		let { name: a, motionValue: o, element: s, keyframes: c } = this.options;
		this.resolver = new DOMKeyframesResolver(c, (i, a) => this.onKeyframesResolved(i, a), a, o, s), this.resolver.scheduleResolve();
	}
	initPlayback(i, a) {
		let { duration: o = 300, times: s, ease: c, type: l, motionValue: u, name: d, startTime: f } = this.options;
		if (!u.owner || !u.owner.current) return !1;
		if (typeof c == "string" && supportsLinearEasing() && isUnsupportedEase(c) && (c = unsupportedEasingFunctions[c]), requiresPregeneratedKeyframes(this.options)) {
			let { onComplete: a, onUpdate: u, motionValue: d, element: f, ...p } = this.options, m = pregenerateKeyframes(i, p);
			i = m.keyframes, i.length === 1 && (i[1] = i[0]), o = m.duration, s = m.times, c = m.ease, l = "keyframes";
		}
		let p = startWaapiAnimation(u.owner.current, d, i, {
			...this.options,
			duration: o,
			times: s,
			ease: c
		});
		return p.startTime = f ?? this.calcStartTime(), this.pendingTimeline ? (attachTimeline(p, this.pendingTimeline), this.pendingTimeline = void 0) : p.onfinish = () => {
			let { onComplete: o } = this.options;
			u.set(getFinalKeyframe(i, this.options, a)), o && o(), this.cancel(), this.resolveFinishedPromise();
		}, {
			animation: p,
			duration: o,
			times: s,
			type: l,
			ease: c,
			keyframes: i
		};
	}
	get duration() {
		let { resolved: i } = this;
		if (!i) return 0;
		let { duration: a } = i;
		return /* @__PURE__ */ millisecondsToSeconds(a);
	}
	get time() {
		let { resolved: i } = this;
		if (!i) return 0;
		let { animation: a } = i;
		return /* @__PURE__ */ millisecondsToSeconds(a.currentTime || 0);
	}
	set time(i) {
		let { resolved: a } = this;
		if (!a) return;
		let { animation: o } = a;
		o.currentTime = /* @__PURE__ */ secondsToMilliseconds(i);
	}
	get speed() {
		let { resolved: i } = this;
		if (!i) return 1;
		let { animation: a } = i;
		return a.playbackRate;
	}
	set speed(i) {
		let { resolved: a } = this;
		if (!a) return;
		let { animation: o } = a;
		o.playbackRate = i;
	}
	get state() {
		let { resolved: i } = this;
		if (!i) return "idle";
		let { animation: a } = i;
		return a.playState;
	}
	get startTime() {
		let { resolved: i } = this;
		if (!i) return null;
		let { animation: a } = i;
		return a.startTime;
	}
	attachTimeline(i) {
		if (!this._resolved) this.pendingTimeline = i;
		else {
			let { resolved: a } = this;
			if (!a) return noop;
			let { animation: o } = a;
			attachTimeline(o, i);
		}
		return noop;
	}
	play() {
		if (this.isStopped) return;
		let { resolved: i } = this;
		if (!i) return;
		let { animation: a } = i;
		a.playState === "finished" && this.updateFinishedPromise(), a.play();
	}
	pause() {
		let { resolved: i } = this;
		if (!i) return;
		let { animation: a } = i;
		a.pause();
	}
	stop() {
		if (this.resolver.cancel(), this.isStopped = !0, this.state === "idle") return;
		this.resolveFinishedPromise(), this.updateFinishedPromise();
		let { resolved: i } = this;
		if (!i) return;
		let { animation: a, keyframes: o, duration: s, type: c, ease: l, times: u } = i;
		if (a.playState === "idle" || a.playState === "finished") return;
		if (this.time) {
			let { motionValue: i, onUpdate: a, onComplete: d, element: f, ...p } = this.options, m = new MainThreadAnimation({
				...p,
				keyframes: o,
				duration: s,
				type: c,
				ease: l,
				times: u,
				isGenerator: !0
			}), h = /* @__PURE__ */ secondsToMilliseconds(this.time);
			i.setWithVelocity(m.sample(h - sampleDelta).value, m.sample(h).value, sampleDelta);
		}
		let { onStop: d } = this.options;
		d && d(), this.cancel();
	}
	complete() {
		let { resolved: i } = this;
		i && i.animation.finish();
	}
	cancel() {
		let { resolved: i } = this;
		i && i.animation.cancel();
	}
	static supports(i) {
		let { motionValue: a, name: o, repeatDelay: s, repeatType: c, damping: l, type: u } = i;
		if (!a || !a.owner || !(a.owner.current instanceof HTMLElement)) return !1;
		let { onUpdate: d, transformTemplate: f } = a.owner.getProps();
		return supportsWaapi() && o && acceleratedValues.has(o) && !d && !f && !s && c !== "mirror" && l !== 0 && u !== "inertia";
	}
}, underDampedSpring = {
	type: "spring",
	stiffness: 500,
	damping: 25,
	restSpeed: 10
}, criticallyDampedSpring = (i) => ({
	type: "spring",
	stiffness: 550,
	damping: i === 0 ? 2 * Math.sqrt(550) : 30,
	restSpeed: 10
}), keyframesTransition = {
	type: "keyframes",
	duration: .8
}, ease = {
	type: "keyframes",
	ease: [
		.25,
		.1,
		.35,
		1
	],
	duration: .3
}, getDefaultTransition = (i, { keyframes: a }) => a.length > 2 ? keyframesTransition : transformProps.has(i) ? i.startsWith("scale") ? criticallyDampedSpring(a[1]) : underDampedSpring : ease;
function isTransitionDefined({ when: i, delay: a, delayChildren: o, staggerChildren: s, staggerDirection: c, repeat: l, repeatType: u, repeatDelay: d, from: f, elapsed: p, ...m }) {
	return !!Object.keys(m).length;
}
var animateMotionValue = (i, a, o, s = {}, c, l) => (u) => {
	let d = getValueTransition(s, i) || {}, f = d.delay || s.delay || 0, { elapsed: p = 0 } = s;
	p -= /* @__PURE__ */ secondsToMilliseconds(f);
	let m = {
		keyframes: Array.isArray(o) ? o : [null, o],
		ease: "easeOut",
		velocity: a.getVelocity(),
		...d,
		delay: -p,
		onUpdate: (i) => {
			a.set(i), d.onUpdate && d.onUpdate(i);
		},
		onComplete: () => {
			u(), d.onComplete && d.onComplete();
		},
		name: i,
		motionValue: a,
		element: l ? void 0 : c
	};
	isTransitionDefined(d) || (m = {
		...m,
		...getDefaultTransition(i, m)
	}), m.duration &&= /* @__PURE__ */ secondsToMilliseconds(m.duration), m.repeatDelay &&= /* @__PURE__ */ secondsToMilliseconds(m.repeatDelay), m.from !== void 0 && (m.keyframes[0] = m.from);
	let h = !1;
	if ((m.type === !1 || m.duration === 0 && !m.repeatDelay) && (m.duration = 0, m.delay === 0 && (h = !0)), (instantAnimationState.current || MotionGlobalConfig.skipAnimations) && (h = !0, m.duration = 0, m.delay = 0), h && !l && a.get() !== void 0) {
		let i = getFinalKeyframe(m.keyframes, d);
		if (i !== void 0) return frame.update(() => {
			m.onUpdate(i), m.onComplete();
		}), new GroupPlaybackControls([]);
	}
	return !l && AcceleratedAnimation.supports(m) ? new AcceleratedAnimation(m) : new MainThreadAnimation(m);
};
function shouldBlockAnimation({ protectedKeys: i, needsAnimating: a }, o) {
	let s = i.hasOwnProperty(o) && a[o] !== !0;
	return a[o] = !1, s;
}
function animateTarget(i, a, { delay: o = 0, transitionOverride: s, type: c } = {}) {
	let { transition: l = i.getDefaultTransition(), transitionEnd: u, ...d } = a;
	s && (l = s);
	let f = [], p = c && i.animationState && i.animationState.getState()[c];
	for (let a in d) {
		let s = i.getValue(a, i.latestValues[a] ?? null), c = d[a];
		if (c === void 0 || p && shouldBlockAnimation(p, a)) continue;
		let u = {
			delay: o,
			...getValueTransition(l || {}, a)
		}, m = !1;
		if (window.MotionHandoffAnimation) {
			let o = getOptimisedAppearId(i);
			if (o) {
				let i = window.MotionHandoffAnimation(o, a, frame);
				i !== null && (u.startTime = i, m = !0);
			}
		}
		addValueToWillChange(i, a), s.start(animateMotionValue(a, s, c, i.shouldReduceMotion && positionalKeys.has(a) ? { type: !1 } : u, i, m));
		let h = s.animation;
		h && f.push(h);
	}
	return u && Promise.all(f).then(() => {
		frame.update(() => {
			u && setTarget(i, u);
		});
	}), f;
}
function animateVariant(i, a, o = {}) {
	let s = resolveVariant(i, a, o.type === "exit" ? i.presenceContext?.custom : void 0), { transition: c = i.getDefaultTransition() || {} } = s || {};
	o.transitionOverride && (c = o.transitionOverride);
	let l = s ? () => Promise.all(animateTarget(i, s, o)) : () => Promise.resolve(), u = i.variantChildren && i.variantChildren.size ? (s = 0) => {
		let { delayChildren: l = 0, staggerChildren: u, staggerDirection: d } = c;
		return animateChildren(i, a, l + s, u, d, o);
	} : () => Promise.resolve(), { when: d } = c;
	if (d) {
		let [i, a] = d === "beforeChildren" ? [l, u] : [u, l];
		return i().then(() => a());
	} else return Promise.all([l(), u(o.delay)]);
}
function animateChildren(i, a, o = 0, s = 0, c = 1, l) {
	let u = [], d = (i.variantChildren.size - 1) * s, f = c === 1 ? (i = 0) => i * s : (i = 0) => d - i * s;
	return Array.from(i.variantChildren).sort(sortByTreeOrder).forEach((i, s) => {
		i.notify("AnimationStart", a), u.push(animateVariant(i, a, {
			...l,
			delay: o + f(s)
		}).then(() => i.notify("AnimationComplete", a)));
	}), Promise.all(u);
}
function sortByTreeOrder(i, a) {
	return i.sortNodePosition(a);
}
function animateVisualElement(i, a, o = {}) {
	i.notify("AnimationStart", a);
	let s;
	if (Array.isArray(a)) {
		let c = a.map((a) => animateVariant(i, a, o));
		s = Promise.all(c);
	} else if (typeof a == "string") s = animateVariant(i, a, o);
	else {
		let c = typeof a == "function" ? resolveVariant(i, a, o.custom) : a;
		s = Promise.all(animateTarget(i, c, o));
	}
	return s.then(() => {
		i.notify("AnimationComplete", a);
	});
}
var numVariantProps = variantProps.length;
function getVariantContext(i) {
	if (!i) return;
	if (!i.isControllingVariants) {
		let a = i.parent && getVariantContext(i.parent) || {};
		return i.props.initial !== void 0 && (a.initial = i.props.initial), a;
	}
	let a = {};
	for (let o = 0; o < numVariantProps; o++) {
		let s = variantProps[o], c = i.props[s];
		(isVariantLabel(c) || c === !1) && (a[s] = c);
	}
	return a;
}
var reversePriorityOrder = [...variantPriorityOrder].reverse(), numAnimationTypes = variantPriorityOrder.length;
function animateList(i) {
	return (a) => Promise.all(a.map(({ animation: a, options: o }) => animateVisualElement(i, a, o)));
}
function createAnimationState(i) {
	let a = animateList(i), o = createState$1(), s = !0, c = (a) => (o, s) => {
		let c = resolveVariant(i, s, a === "exit" ? i.presenceContext?.custom : void 0);
		if (c) {
			let { transition: i, transitionEnd: a, ...s } = c;
			o = {
				...o,
				...s,
				...a
			};
		}
		return o;
	};
	function l(o) {
		a = o(i);
	}
	function u(l) {
		let { props: u } = i, d = getVariantContext(i.parent) || {}, f = [], p = /* @__PURE__ */ new Set(), m = {}, h = Infinity;
		for (let a = 0; a < numAnimationTypes; a++) {
			let g = reversePriorityOrder[a], _ = o[g], v = u[g] === void 0 ? d[g] : u[g], y = isVariantLabel(v), b = g === l ? _.isActive : null;
			b === !1 && (h = a);
			let x = v === d[g] && v !== u[g] && y;
			if (x && s && i.manuallyAnimateOnMount && (x = !1), _.protectedKeys = { ...m }, !_.isActive && b === null || !v && !_.prevProp || isAnimationControls(v) || typeof v == "boolean") continue;
			let S = checkVariantsDidChange(_.prevProp, v), C = S || g === l && _.isActive && !x && y || a > h && y, w = !1, T = Array.isArray(v) ? v : [v], E = T.reduce(c(g), {});
			b === !1 && (E = {});
			let { prevResolvedValues: D = {} } = _, O = {
				...D,
				...E
			}, k = (a) => {
				C = !0, p.has(a) && (w = !0, p.delete(a)), _.needsAnimating[a] = !0;
				let o = i.getValue(a);
				o && (o.liveStyle = !1);
			};
			for (let i in O) {
				let a = E[i], o = D[i];
				if (m.hasOwnProperty(i)) continue;
				let s = !1;
				s = isKeyframesTarget(a) && isKeyframesTarget(o) ? !shallowCompare(a, o) : a !== o, s ? a == null ? p.add(i) : k(i) : a !== void 0 && p.has(i) ? k(i) : _.protectedKeys[i] = !0;
			}
			_.prevProp = v, _.prevResolvedValues = E, _.isActive && (m = {
				...m,
				...E
			}), s && i.blockInitialAnimation && (C = !1), C && (!(x && S) || w) && f.push(...T.map((i) => ({
				animation: i,
				options: { type: g }
			})));
		}
		if (p.size) {
			let a = {};
			p.forEach((o) => {
				let s = i.getBaseTarget(o), c = i.getValue(o);
				c && (c.liveStyle = !0), a[o] = s ?? null;
			}), f.push({ animation: a });
		}
		let g = !!f.length;
		return s && (u.initial === !1 || u.initial === u.animate) && !i.manuallyAnimateOnMount && (g = !1), s = !1, g ? a(f) : Promise.resolve();
	}
	function d(a, s) {
		var c;
		if (o[a].isActive === s) return Promise.resolve();
		(c = i.variantChildren) == null || c.forEach((i) => i.animationState?.setActive(a, s)), o[a].isActive = s;
		let l = u(a);
		for (let i in o) o[i].protectedKeys = {};
		return l;
	}
	return {
		animateChanges: u,
		setActive: d,
		setAnimateFunction: l,
		getState: () => o,
		reset: () => {
			o = createState$1(), s = !0;
		}
	};
}
function checkVariantsDidChange(i, a) {
	return typeof a == "string" ? a !== i : Array.isArray(a) ? !shallowCompare(a, i) : !1;
}
function createTypeState(i = !1) {
	return {
		isActive: i,
		protectedKeys: {},
		needsAnimating: {},
		prevResolvedValues: {}
	};
}
function createState$1() {
	return {
		animate: createTypeState(!0),
		whileInView: createTypeState(),
		whileHover: createTypeState(),
		whileTap: createTypeState(),
		whileDrag: createTypeState(),
		whileFocus: createTypeState(),
		exit: createTypeState()
	};
}
var Feature = class {
	constructor(i) {
		this.isMounted = !1, this.node = i;
	}
	update() {}
}, AnimationFeature = class extends Feature {
	constructor(i) {
		super(i), i.animationState ||= createAnimationState(i);
	}
	updateAnimationControlsSubscription() {
		let { animate: i } = this.node.getProps();
		isAnimationControls(i) && (this.unmountControls = i.subscribe(this.node));
	}
	mount() {
		this.updateAnimationControlsSubscription();
	}
	update() {
		let { animate: i } = this.node.getProps(), { animate: a } = this.node.prevProps || {};
		i !== a && this.updateAnimationControlsSubscription();
	}
	unmount() {
		var i;
		this.node.animationState.reset(), (i = this.unmountControls) == null || i.call(this);
	}
}, id$1 = 0, animations = {
	animation: { Feature: AnimationFeature },
	exit: { Feature: class extends Feature {
		constructor() {
			super(...arguments), this.id = id$1++;
		}
		update() {
			if (!this.node.presenceContext) return;
			let { isPresent: i, onExitComplete: a } = this.node.presenceContext, { isPresent: o } = this.node.prevPresenceContext || {};
			if (!this.node.animationState || i === o) return;
			let s = this.node.animationState.setActive("exit", !i);
			a && !i && s.then(() => a(this.id));
		}
		mount() {
			let { register: i } = this.node.presenceContext || {};
			i && (this.unmount = i(this.id));
		}
		unmount() {}
	} }
};
function addDomEvent(i, a, o, s = { passive: !0 }) {
	return i.addEventListener(a, o, s), () => i.removeEventListener(a, o);
}
function extractEventInfo(i) {
	return { point: {
		x: i.pageX,
		y: i.pageY
	} };
}
var addPointerInfo = (i) => (a) => isPrimaryPointer(a) && i(a, extractEventInfo(a));
function addPointerEvent(i, a, o, s) {
	return addDomEvent(i, a, addPointerInfo(o), s);
}
var distance = (i, a) => Math.abs(i - a);
function distance2D(i, a) {
	let o = distance(i.x, a.x), s = distance(i.y, a.y);
	return Math.sqrt(o ** 2 + s ** 2);
}
var PanSession = class {
	constructor(i, a, { transformPagePoint: o, contextWindow: s, dragSnapToOrigin: c = !1 } = {}) {
		if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.updatePoint = () => {
			if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
			let i = getPanInfo(this.lastMoveEventInfo, this.history), a = this.startEvent !== null, o = distance2D(i.offset, {
				x: 0,
				y: 0
			}) >= 3;
			if (!a && !o) return;
			let { point: s } = i, { timestamp: c } = frameData;
			this.history.push({
				...s,
				timestamp: c
			});
			let { onStart: l, onMove: u } = this.handlers;
			a || (l && l(this.lastMoveEvent, i), this.startEvent = this.lastMoveEvent), u && u(this.lastMoveEvent, i);
		}, this.handlePointerMove = (i, a) => {
			this.lastMoveEvent = i, this.lastMoveEventInfo = transformPoint(a, this.transformPagePoint), frame.update(this.updatePoint, !0);
		}, this.handlePointerUp = (i, a) => {
			this.end();
			let { onEnd: o, onSessionEnd: s, resumeAnimation: c } = this.handlers;
			if (this.dragSnapToOrigin && c && c(), !(this.lastMoveEvent && this.lastMoveEventInfo)) return;
			let l = getPanInfo(i.type === "pointercancel" ? this.lastMoveEventInfo : transformPoint(a, this.transformPagePoint), this.history);
			this.startEvent && o && o(i, l), s && s(i, l);
		}, !isPrimaryPointer(i)) return;
		this.dragSnapToOrigin = c, this.handlers = a, this.transformPagePoint = o, this.contextWindow = s || window;
		let l = transformPoint(extractEventInfo(i), this.transformPagePoint), { point: u } = l, { timestamp: d } = frameData;
		this.history = [{
			...u,
			timestamp: d
		}];
		let { onSessionStart: f } = a;
		f && f(i, getPanInfo(l, this.history)), this.removeListeners = pipe(addPointerEvent(this.contextWindow, "pointermove", this.handlePointerMove), addPointerEvent(this.contextWindow, "pointerup", this.handlePointerUp), addPointerEvent(this.contextWindow, "pointercancel", this.handlePointerUp));
	}
	updateHandlers(i) {
		this.handlers = i;
	}
	end() {
		this.removeListeners && this.removeListeners(), cancelFrame(this.updatePoint);
	}
};
function transformPoint(i, a) {
	return a ? { point: a(i.point) } : i;
}
function subtractPoint(i, a) {
	return {
		x: i.x - a.x,
		y: i.y - a.y
	};
}
function getPanInfo({ point: i }, a) {
	return {
		point: i,
		delta: subtractPoint(i, lastDevicePoint(a)),
		offset: subtractPoint(i, startDevicePoint(a)),
		velocity: getVelocity(a, .1)
	};
}
function startDevicePoint(i) {
	return i[0];
}
function lastDevicePoint(i) {
	return i[i.length - 1];
}
function getVelocity(i, a) {
	if (i.length < 2) return {
		x: 0,
		y: 0
	};
	let o = i.length - 1, s = null, c = lastDevicePoint(i);
	for (; o >= 0 && (s = i[o], !(c.timestamp - s.timestamp > /* @__PURE__ */ secondsToMilliseconds(a)));) o--;
	if (!s) return {
		x: 0,
		y: 0
	};
	let l = /* @__PURE__ */ millisecondsToSeconds(c.timestamp - s.timestamp);
	if (l === 0) return {
		x: 0,
		y: 0
	};
	let u = {
		x: (c.x - s.x) / l,
		y: (c.y - s.y) / l
	};
	return u.x === Infinity && (u.x = 0), u.y === Infinity && (u.y = 0), u;
}
var SCALE_PRECISION = 1e-4, SCALE_MIN = 1 - SCALE_PRECISION, SCALE_MAX = 1 + SCALE_PRECISION, TRANSLATE_PRECISION = .01, TRANSLATE_MIN = 0 - TRANSLATE_PRECISION, TRANSLATE_MAX = 0 + TRANSLATE_PRECISION;
function calcLength(i) {
	return i.max - i.min;
}
function isNear(i, a, o) {
	return Math.abs(i - a) <= o;
}
function calcAxisDelta(i, a, o, s = .5) {
	i.origin = s, i.originPoint = mixNumber(a.min, a.max, i.origin), i.scale = calcLength(o) / calcLength(a), i.translate = mixNumber(o.min, o.max, i.origin) - i.originPoint, (i.scale >= SCALE_MIN && i.scale <= SCALE_MAX || isNaN(i.scale)) && (i.scale = 1), (i.translate >= TRANSLATE_MIN && i.translate <= TRANSLATE_MAX || isNaN(i.translate)) && (i.translate = 0);
}
function calcBoxDelta(i, a, o, s) {
	calcAxisDelta(i.x, a.x, o.x, s ? s.originX : void 0), calcAxisDelta(i.y, a.y, o.y, s ? s.originY : void 0);
}
function calcRelativeAxis(i, a, o) {
	i.min = o.min + a.min, i.max = i.min + calcLength(a);
}
function calcRelativeBox(i, a, o) {
	calcRelativeAxis(i.x, a.x, o.x), calcRelativeAxis(i.y, a.y, o.y);
}
function calcRelativeAxisPosition(i, a, o) {
	i.min = a.min - o.min, i.max = i.min + calcLength(a);
}
function calcRelativePosition(i, a, o) {
	calcRelativeAxisPosition(i.x, a.x, o.x), calcRelativeAxisPosition(i.y, a.y, o.y);
}
function applyConstraints(i, { min: a, max: o }, s) {
	return a !== void 0 && i < a ? i = s ? mixNumber(a, i, s.min) : Math.max(i, a) : o !== void 0 && i > o && (i = s ? mixNumber(o, i, s.max) : Math.min(i, o)), i;
}
function calcRelativeAxisConstraints(i, a, o) {
	return {
		min: a === void 0 ? void 0 : i.min + a,
		max: o === void 0 ? void 0 : i.max + o - (i.max - i.min)
	};
}
function calcRelativeConstraints(i, { top: a, left: o, bottom: s, right: c }) {
	return {
		x: calcRelativeAxisConstraints(i.x, o, c),
		y: calcRelativeAxisConstraints(i.y, a, s)
	};
}
function calcViewportAxisConstraints(i, a) {
	let o = a.min - i.min, s = a.max - i.max;
	return a.max - a.min < i.max - i.min && ([o, s] = [s, o]), {
		min: o,
		max: s
	};
}
function calcViewportConstraints(i, a) {
	return {
		x: calcViewportAxisConstraints(i.x, a.x),
		y: calcViewportAxisConstraints(i.y, a.y)
	};
}
function calcOrigin(i, a) {
	let o = .5, s = calcLength(i), c = calcLength(a);
	return c > s ? o = /* @__PURE__ */ progress(a.min, a.max - s, i.min) : s > c && (o = /* @__PURE__ */ progress(i.min, i.max - c, a.min)), clamp$2(0, 1, o);
}
function rebaseAxisConstraints(i, a) {
	let o = {};
	return a.min !== void 0 && (o.min = a.min - i.min), a.max !== void 0 && (o.max = a.max - i.min), o;
}
var defaultElastic = .35;
function resolveDragElastic(i = defaultElastic) {
	return i === !1 ? i = 0 : i === !0 && (i = defaultElastic), {
		x: resolveAxisElastic(i, "left", "right"),
		y: resolveAxisElastic(i, "top", "bottom")
	};
}
function resolveAxisElastic(i, a, o) {
	return {
		min: resolvePointElastic(i, a),
		max: resolvePointElastic(i, o)
	};
}
function resolvePointElastic(i, a) {
	return typeof i == "number" ? i : i[a] || 0;
}
var createAxisDelta = () => ({
	translate: 0,
	scale: 1,
	origin: 0,
	originPoint: 0
}), createDelta = () => ({
	x: createAxisDelta(),
	y: createAxisDelta()
}), createAxis = () => ({
	min: 0,
	max: 0
}), createBox = () => ({
	x: createAxis(),
	y: createAxis()
});
function eachAxis(i) {
	return [i("x"), i("y")];
}
function convertBoundingBoxToBox({ top: i, left: a, right: o, bottom: s }) {
	return {
		x: {
			min: a,
			max: o
		},
		y: {
			min: i,
			max: s
		}
	};
}
function convertBoxToBoundingBox({ x: i, y: a }) {
	return {
		top: a.min,
		right: i.max,
		bottom: a.max,
		left: i.min
	};
}
function transformBoxPoints(i, a) {
	if (!a) return i;
	let o = a({
		x: i.left,
		y: i.top
	}), s = a({
		x: i.right,
		y: i.bottom
	});
	return {
		top: o.y,
		left: o.x,
		bottom: s.y,
		right: s.x
	};
}
function isIdentityScale(i) {
	return i === void 0 || i === 1;
}
function hasScale({ scale: i, scaleX: a, scaleY: o }) {
	return !isIdentityScale(i) || !isIdentityScale(a) || !isIdentityScale(o);
}
function hasTransform(i) {
	return hasScale(i) || has2DTranslate(i) || i.z || i.rotate || i.rotateX || i.rotateY || i.skewX || i.skewY;
}
function has2DTranslate(i) {
	return is2DTranslate(i.x) || is2DTranslate(i.y);
}
function is2DTranslate(i) {
	return i && i !== "0%";
}
function scalePoint(i, a, o) {
	return o + a * (i - o);
}
function applyPointDelta(i, a, o, s, c) {
	return c !== void 0 && (i = scalePoint(i, c, s)), scalePoint(i, o, s) + a;
}
function applyAxisDelta(i, a = 0, o = 1, s, c) {
	i.min = applyPointDelta(i.min, a, o, s, c), i.max = applyPointDelta(i.max, a, o, s, c);
}
function applyBoxDelta(i, { x: a, y: o }) {
	applyAxisDelta(i.x, a.translate, a.scale, a.originPoint), applyAxisDelta(i.y, o.translate, o.scale, o.originPoint);
}
var TREE_SCALE_SNAP_MIN = .999999999999, TREE_SCALE_SNAP_MAX = 1.0000000000001;
function applyTreeDeltas(i, a, o, s = !1) {
	let c = o.length;
	if (!c) return;
	a.x = a.y = 1;
	let l, u;
	for (let d = 0; d < c; d++) {
		l = o[d], u = l.projectionDelta;
		let { visualElement: c } = l.options;
		c && c.props.style && c.props.style.display === "contents" || (s && l.options.layoutScroll && l.scroll && l !== l.root && transformBox(i, {
			x: -l.scroll.offset.x,
			y: -l.scroll.offset.y
		}), u && (a.x *= u.x.scale, a.y *= u.y.scale, applyBoxDelta(i, u)), s && hasTransform(l.latestValues) && transformBox(i, l.latestValues));
	}
	a.x < TREE_SCALE_SNAP_MAX && a.x > TREE_SCALE_SNAP_MIN && (a.x = 1), a.y < TREE_SCALE_SNAP_MAX && a.y > TREE_SCALE_SNAP_MIN && (a.y = 1);
}
function translateAxis(i, a) {
	i.min += a, i.max += a;
}
function transformAxis(i, a, o, s, c = .5) {
	applyAxisDelta(i, a, o, mixNumber(i.min, i.max, c), s);
}
function transformBox(i, a) {
	transformAxis(i.x, a.x, a.scaleX, a.scale, a.originX), transformAxis(i.y, a.y, a.scaleY, a.scale, a.originY);
}
function measureViewportBox(i, a) {
	return convertBoundingBoxToBox(transformBoxPoints(i.getBoundingClientRect(), a));
}
function measurePageBox(i, a, o) {
	let s = measureViewportBox(i, o), { scroll: c } = a;
	return c && (translateAxis(s.x, c.offset.x), translateAxis(s.y, c.offset.y)), s;
}
var getContextWindow = ({ current: i }) => i ? i.ownerDocument.defaultView : null, elementDragControls = /* @__PURE__ */ new WeakMap(), VisualElementDragControls = class {
	constructor(i) {
		this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = {
			x: 0,
			y: 0
		}, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = createBox(), this.visualElement = i;
	}
	start(i, { snapToCursor: a = !1 } = {}) {
		let { presenceContext: o } = this.visualElement;
		if (o && o.isPresent === !1) return;
		let s = (i) => {
			let { dragSnapToOrigin: o } = this.getProps();
			o ? this.pauseAnimation() : this.stopAnimation(), a && this.snapToCursor(extractEventInfo(i).point);
		}, c = (i, a) => {
			let { drag: o, dragPropagation: s, onDragStart: c } = this.getProps();
			if (o && !s && (this.openDragLock && this.openDragLock(), this.openDragLock = setDragLock(o), !this.openDragLock)) return;
			this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), eachAxis((i) => {
				let a = this.getAxisMotionValue(i).get() || 0;
				if (percent.test(a)) {
					let { projection: o } = this.visualElement;
					if (o && o.layout) {
						let s = o.layout.layoutBox[i];
						s && (a = calcLength(s) * (parseFloat(a) / 100));
					}
				}
				this.originPoint[i] = a;
			}), c && frame.postRender(() => c(i, a)), addValueToWillChange(this.visualElement, "transform");
			let { animationState: l } = this.visualElement;
			l && l.setActive("whileDrag", !0);
		}, l = (i, a) => {
			let { dragPropagation: o, dragDirectionLock: s, onDirectionLock: c, onDrag: l } = this.getProps();
			if (!o && !this.openDragLock) return;
			let { offset: u } = a;
			if (s && this.currentDirection === null) {
				this.currentDirection = getCurrentDirection(u), this.currentDirection !== null && c && c(this.currentDirection);
				return;
			}
			this.updateAxis("x", a.point, u), this.updateAxis("y", a.point, u), this.visualElement.render(), l && l(i, a);
		}, u = (i, a) => this.stop(i, a), d = () => eachAxis((i) => this.getAnimationState(i) === "paused" && this.getAxisMotionValue(i).animation?.play()), { dragSnapToOrigin: f } = this.getProps();
		this.panSession = new PanSession(i, {
			onSessionStart: s,
			onStart: c,
			onMove: l,
			onSessionEnd: u,
			resumeAnimation: d
		}, {
			transformPagePoint: this.visualElement.getTransformPagePoint(),
			dragSnapToOrigin: f,
			contextWindow: getContextWindow(this.visualElement)
		});
	}
	stop(i, a) {
		let o = this.isDragging;
		if (this.cancel(), !o) return;
		let { velocity: s } = a;
		this.startAnimation(s);
		let { onDragEnd: c } = this.getProps();
		c && frame.postRender(() => c(i, a));
	}
	cancel() {
		this.isDragging = !1;
		let { projection: i, animationState: a } = this.visualElement;
		i && (i.isAnimationBlocked = !1), this.panSession && this.panSession.end(), this.panSession = void 0;
		let { dragPropagation: o } = this.getProps();
		!o && this.openDragLock && (this.openDragLock(), this.openDragLock = null), a && a.setActive("whileDrag", !1);
	}
	updateAxis(i, a, o) {
		let { drag: s } = this.getProps();
		if (!o || !shouldDrag(i, s, this.currentDirection)) return;
		let c = this.getAxisMotionValue(i), l = this.originPoint[i] + o[i];
		this.constraints && this.constraints[i] && (l = applyConstraints(l, this.constraints[i], this.elastic[i])), c.set(l);
	}
	resolveConstraints() {
		let { dragConstraints: i, dragElastic: a } = this.getProps(), o = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : this.visualElement.projection?.layout, s = this.constraints;
		i && isRefObject(i) ? this.constraints ||= this.resolveRefConstraints() : i && o ? this.constraints = calcRelativeConstraints(o.layoutBox, i) : this.constraints = !1, this.elastic = resolveDragElastic(a), s !== this.constraints && o && this.constraints && !this.hasMutatedConstraints && eachAxis((i) => {
			this.constraints !== !1 && this.getAxisMotionValue(i) && (this.constraints[i] = rebaseAxisConstraints(o.layoutBox[i], this.constraints[i]));
		});
	}
	resolveRefConstraints() {
		let { dragConstraints: i, onMeasureDragConstraints: a } = this.getProps();
		if (!i || !isRefObject(i)) return !1;
		let o = i.current;
		invariant(o !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.");
		let { projection: s } = this.visualElement;
		if (!s || !s.layout) return !1;
		let c = measurePageBox(o, s.root, this.visualElement.getTransformPagePoint()), l = calcViewportConstraints(s.layout.layoutBox, c);
		if (a) {
			let i = a(convertBoxToBoundingBox(l));
			this.hasMutatedConstraints = !!i, i && (l = convertBoundingBoxToBox(i));
		}
		return l;
	}
	startAnimation(i) {
		let { drag: a, dragMomentum: o, dragElastic: s, dragTransition: c, dragSnapToOrigin: l, onDragTransitionEnd: u } = this.getProps(), d = this.constraints || {}, f = eachAxis((u) => {
			if (!shouldDrag(u, a, this.currentDirection)) return;
			let f = d && d[u] || {};
			l && (f = {
				min: 0,
				max: 0
			});
			let p = s ? 200 : 1e6, m = s ? 40 : 1e7, h = {
				type: "inertia",
				velocity: o ? i[u] : 0,
				bounceStiffness: p,
				bounceDamping: m,
				timeConstant: 750,
				restDelta: 1,
				restSpeed: 10,
				...c,
				...f
			};
			return this.startAxisValueAnimation(u, h);
		});
		return Promise.all(f).then(u);
	}
	startAxisValueAnimation(i, a) {
		let o = this.getAxisMotionValue(i);
		return addValueToWillChange(this.visualElement, i), o.start(animateMotionValue(i, o, 0, a, this.visualElement, !1));
	}
	stopAnimation() {
		eachAxis((i) => this.getAxisMotionValue(i).stop());
	}
	pauseAnimation() {
		eachAxis((i) => this.getAxisMotionValue(i).animation?.pause());
	}
	getAnimationState(i) {
		return this.getAxisMotionValue(i).animation?.state;
	}
	getAxisMotionValue(i) {
		let a = `_drag${i.toUpperCase()}`, o = this.visualElement.getProps();
		return o[a] || this.visualElement.getValue(i, (o.initial ? o.initial[i] : void 0) || 0);
	}
	snapToCursor(i) {
		eachAxis((a) => {
			let { drag: o } = this.getProps();
			if (!shouldDrag(a, o, this.currentDirection)) return;
			let { projection: s } = this.visualElement, c = this.getAxisMotionValue(a);
			if (s && s.layout) {
				let { min: o, max: l } = s.layout.layoutBox[a];
				c.set(i[a] - mixNumber(o, l, .5));
			}
		});
	}
	scalePositionWithinConstraints() {
		if (!this.visualElement.current) return;
		let { drag: i, dragConstraints: a } = this.getProps(), { projection: o } = this.visualElement;
		if (!isRefObject(a) || !o || !this.constraints) return;
		this.stopAnimation();
		let s = {
			x: 0,
			y: 0
		};
		eachAxis((i) => {
			let a = this.getAxisMotionValue(i);
			if (a && this.constraints !== !1) {
				let o = a.get();
				s[i] = calcOrigin({
					min: o,
					max: o
				}, this.constraints[i]);
			}
		});
		let { transformTemplate: c } = this.visualElement.getProps();
		this.visualElement.current.style.transform = c ? c({}, "") : "none", o.root && o.root.updateScroll(), o.updateLayout(), this.resolveConstraints(), eachAxis((a) => {
			if (!shouldDrag(a, i, null)) return;
			let o = this.getAxisMotionValue(a), { min: c, max: l } = this.constraints[a];
			o.set(mixNumber(c, l, s[a]));
		});
	}
	addListeners() {
		if (!this.visualElement.current) return;
		elementDragControls.set(this.visualElement, this);
		let i = this.visualElement.current, a = addPointerEvent(i, "pointerdown", (i) => {
			let { drag: a, dragListener: o = !0 } = this.getProps();
			a && o && this.start(i);
		}), o = () => {
			let { dragConstraints: i } = this.getProps();
			isRefObject(i) && i.current && (this.constraints = this.resolveRefConstraints());
		}, { projection: s } = this.visualElement, c = s.addEventListener("measure", o);
		s && !s.layout && (s.root && s.root.updateScroll(), s.updateLayout()), frame.read(o);
		let l = addDomEvent(window, "resize", () => this.scalePositionWithinConstraints()), u = s.addEventListener("didUpdate", (({ delta: i, hasLayoutChanged: a }) => {
			this.isDragging && a && (eachAxis((a) => {
				let o = this.getAxisMotionValue(a);
				o && (this.originPoint[a] += i[a].translate, o.set(o.get() + i[a].translate));
			}), this.visualElement.render());
		}));
		return () => {
			l(), a(), c(), u && u();
		};
	}
	getProps() {
		let i = this.visualElement.getProps(), { drag: a = !1, dragDirectionLock: o = !1, dragPropagation: s = !1, dragConstraints: c = !1, dragElastic: l = defaultElastic, dragMomentum: u = !0 } = i;
		return {
			...i,
			drag: a,
			dragDirectionLock: o,
			dragPropagation: s,
			dragConstraints: c,
			dragElastic: l,
			dragMomentum: u
		};
	}
};
function shouldDrag(i, a, o) {
	return (a === !0 || a === i) && (o === null || o === i);
}
function getCurrentDirection(i, a = 10) {
	let o = null;
	return Math.abs(i.y) > a ? o = "y" : Math.abs(i.x) > a && (o = "x"), o;
}
var DragGesture = class extends Feature {
	constructor(i) {
		super(i), this.removeGroupControls = noop, this.removeListeners = noop, this.controls = new VisualElementDragControls(i);
	}
	mount() {
		let { dragControls: i } = this.node.getProps();
		i && (this.removeGroupControls = i.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || noop;
	}
	unmount() {
		this.removeGroupControls(), this.removeListeners();
	}
}, asyncHandler = (i) => (a, o) => {
	i && frame.postRender(() => i(a, o));
}, PanGesture = class extends Feature {
	constructor() {
		super(...arguments), this.removePointerDownListener = noop;
	}
	onPointerDown(i) {
		this.session = new PanSession(i, this.createPanHandlers(), {
			transformPagePoint: this.node.getTransformPagePoint(),
			contextWindow: getContextWindow(this.node)
		});
	}
	createPanHandlers() {
		let { onPanSessionStart: i, onPanStart: a, onPan: o, onPanEnd: s } = this.node.getProps();
		return {
			onSessionStart: asyncHandler(i),
			onStart: asyncHandler(a),
			onMove: o,
			onEnd: (i, a) => {
				delete this.session, s && frame.postRender(() => s(i, a));
			}
		};
	}
	mount() {
		this.removePointerDownListener = addPointerEvent(this.node.current, "pointerdown", (i) => this.onPointerDown(i));
	}
	update() {
		this.session && this.session.updateHandlers(this.createPanHandlers());
	}
	unmount() {
		this.removePointerDownListener(), this.session && this.session.end();
	}
}, globalProjectionState = {
	hasAnimatedSinceResize: !0,
	hasEverUpdated: !1
};
function pixelsToPercent(i, a) {
	return a.max === a.min ? 0 : i / (a.max - a.min) * 100;
}
var correctBorderRadius = { correct: (i, a) => {
	if (!a.target) return i;
	if (typeof i == "string") if (px.test(i)) i = parseFloat(i);
	else return i;
	return `${pixelsToPercent(i, a.target.x)}% ${pixelsToPercent(i, a.target.y)}%`;
} }, correctBoxShadow = { correct: (i, { treeScale: a, projectionDelta: o }) => {
	let s = i, c = complex.parse(i);
	if (c.length > 5) return s;
	let l = complex.createTransformer(i), u = typeof c[0] == "number" ? 0 : 1, d = o.x.scale * a.x, f = o.y.scale * a.y;
	c[0 + u] /= d, c[1 + u] /= f;
	let p = mixNumber(d, f, .5);
	return typeof c[2 + u] == "number" && (c[2 + u] /= p), typeof c[3 + u] == "number" && (c[3 + u] /= p), l(c);
} }, MeasureLayoutWithContext = class extends Component {
	componentDidMount() {
		let { visualElement: i, layoutGroup: a, switchLayoutGroup: o, layoutId: s } = this.props, { projection: c } = i;
		addScaleCorrector(defaultScaleCorrectors), c && (a.group && a.group.add(c), o && o.register && s && o.register(c), c.root.didUpdate(), c.addEventListener("animationComplete", () => {
			this.safeToRemove();
		}), c.setOptions({
			...c.options,
			onExitComplete: () => this.safeToRemove()
		})), globalProjectionState.hasEverUpdated = !0;
	}
	getSnapshotBeforeUpdate(i) {
		let { layoutDependency: a, visualElement: o, drag: s, isPresent: c } = this.props, l = o.projection;
		return l ? (l.isPresent = c, s || i.layoutDependency !== a || a === void 0 ? l.willUpdate() : this.safeToRemove(), i.isPresent !== c && (c ? l.promote() : l.relegate() || frame.postRender(() => {
			let i = l.getStack();
			(!i || !i.members.length) && this.safeToRemove();
		})), null) : null;
	}
	componentDidUpdate() {
		let { projection: i } = this.props.visualElement;
		i && (i.root.didUpdate(), microtask.postRender(() => {
			!i.currentAnimation && i.isLead() && this.safeToRemove();
		}));
	}
	componentWillUnmount() {
		let { visualElement: i, layoutGroup: a, switchLayoutGroup: o } = this.props, { projection: s } = i;
		s && (s.scheduleCheckAfterUnmount(), a && a.group && a.group.remove(s), o && o.deregister && o.deregister(s));
	}
	safeToRemove() {
		let { safeToRemove: i } = this.props;
		i && i();
	}
	render() {
		return null;
	}
};
function MeasureLayout(i) {
	let [a, o] = usePresence$1(), s = useContext(LayoutGroupContext);
	return jsx(MeasureLayoutWithContext, {
		...i,
		layoutGroup: s,
		switchLayoutGroup: useContext(SwitchLayoutGroupContext),
		isPresent: a,
		safeToRemove: o
	});
}
var defaultScaleCorrectors = {
	borderRadius: {
		...correctBorderRadius,
		applyTo: [
			"borderTopLeftRadius",
			"borderTopRightRadius",
			"borderBottomLeftRadius",
			"borderBottomRightRadius"
		]
	},
	borderTopLeftRadius: correctBorderRadius,
	borderTopRightRadius: correctBorderRadius,
	borderBottomLeftRadius: correctBorderRadius,
	borderBottomRightRadius: correctBorderRadius,
	boxShadow: correctBoxShadow
};
function animateSingleValue(i, a, o) {
	let s = isMotionValue(i) ? i : motionValue(i);
	return s.start(animateMotionValue("", s, a, o)), s.animation;
}
function isSVGElement(i) {
	return i instanceof SVGElement && i.tagName !== "svg";
}
var compareByDepth = (i, a) => i.depth - a.depth, FlatTree = class {
	constructor() {
		this.children = [], this.isDirty = !1;
	}
	add(i) {
		addUniqueItem(this.children, i), this.isDirty = !0;
	}
	remove(i) {
		removeItem(this.children, i), this.isDirty = !0;
	}
	forEach(i) {
		this.isDirty && this.children.sort(compareByDepth), this.isDirty = !1, this.children.forEach(i);
	}
};
function delay(i, a) {
	let o = time.now(), s = ({ timestamp: c }) => {
		let l = c - o;
		l >= a && (cancelFrame(s), i(l - a));
	};
	return frame.read(s, !0), () => cancelFrame(s);
}
var borders = [
	"TopLeft",
	"TopRight",
	"BottomLeft",
	"BottomRight"
], numBorders = borders.length, asNumber = (i) => typeof i == "string" ? parseFloat(i) : i, isPx = (i) => typeof i == "number" || px.test(i);
function mixValues(i, a, o, s, c, l) {
	c ? (i.opacity = mixNumber(0, o.opacity === void 0 ? 1 : o.opacity, easeCrossfadeIn(s)), i.opacityExit = mixNumber(a.opacity === void 0 ? 1 : a.opacity, 0, easeCrossfadeOut(s))) : l && (i.opacity = mixNumber(a.opacity === void 0 ? 1 : a.opacity, o.opacity === void 0 ? 1 : o.opacity, s));
	for (let c = 0; c < numBorders; c++) {
		let l = `border${borders[c]}Radius`, u = getRadius(a, l), d = getRadius(o, l);
		u === void 0 && d === void 0 || (u ||= 0, d ||= 0, u === 0 || d === 0 || isPx(u) === isPx(d) ? (i[l] = Math.max(mixNumber(asNumber(u), asNumber(d), s), 0), (percent.test(d) || percent.test(u)) && (i[l] += "%")) : i[l] = d);
	}
	(a.rotate || o.rotate) && (i.rotate = mixNumber(a.rotate || 0, o.rotate || 0, s));
}
function getRadius(i, a) {
	return i[a] === void 0 ? i.borderRadius : i[a];
}
var easeCrossfadeIn = /* @__PURE__ */ compress(0, .5, circOut), easeCrossfadeOut = /* @__PURE__ */ compress(.5, .95, noop);
function compress(i, a, o) {
	return (s) => s < i ? 0 : s > a ? 1 : o(/* @__PURE__ */ progress(i, a, s));
}
function copyAxisInto(i, a) {
	i.min = a.min, i.max = a.max;
}
function copyBoxInto(i, a) {
	copyAxisInto(i.x, a.x), copyAxisInto(i.y, a.y);
}
function copyAxisDeltaInto(i, a) {
	i.translate = a.translate, i.scale = a.scale, i.originPoint = a.originPoint, i.origin = a.origin;
}
function removePointDelta(i, a, o, s, c) {
	return i -= a, i = scalePoint(i, 1 / o, s), c !== void 0 && (i = scalePoint(i, 1 / c, s)), i;
}
function removeAxisDelta(i, a = 0, o = 1, s = .5, c, l = i, u = i) {
	if (percent.test(a) && (a = parseFloat(a), a = mixNumber(u.min, u.max, a / 100) - u.min), typeof a != "number") return;
	let d = mixNumber(l.min, l.max, s);
	i === l && (d -= a), i.min = removePointDelta(i.min, a, o, d, c), i.max = removePointDelta(i.max, a, o, d, c);
}
function removeAxisTransforms(i, a, [o, s, c], l, u) {
	removeAxisDelta(i, a[o], a[s], a[c], a.scale, l, u);
}
var xKeys = [
	"x",
	"scaleX",
	"originX"
], yKeys = [
	"y",
	"scaleY",
	"originY"
];
function removeBoxTransforms(i, a, o, s) {
	removeAxisTransforms(i.x, a, xKeys, o ? o.x : void 0, s ? s.x : void 0), removeAxisTransforms(i.y, a, yKeys, o ? o.y : void 0, s ? s.y : void 0);
}
function isAxisDeltaZero(i) {
	return i.translate === 0 && i.scale === 1;
}
function isDeltaZero(i) {
	return isAxisDeltaZero(i.x) && isAxisDeltaZero(i.y);
}
function axisEquals(i, a) {
	return i.min === a.min && i.max === a.max;
}
function boxEquals(i, a) {
	return axisEquals(i.x, a.x) && axisEquals(i.y, a.y);
}
function axisEqualsRounded(i, a) {
	return Math.round(i.min) === Math.round(a.min) && Math.round(i.max) === Math.round(a.max);
}
function boxEqualsRounded(i, a) {
	return axisEqualsRounded(i.x, a.x) && axisEqualsRounded(i.y, a.y);
}
function aspectRatio(i) {
	return calcLength(i.x) / calcLength(i.y);
}
function axisDeltaEquals(i, a) {
	return i.translate === a.translate && i.scale === a.scale && i.originPoint === a.originPoint;
}
var NodeStack = class {
	constructor() {
		this.members = [];
	}
	add(i) {
		addUniqueItem(this.members, i), i.scheduleRender();
	}
	remove(i) {
		if (removeItem(this.members, i), i === this.prevLead && (this.prevLead = void 0), i === this.lead) {
			let i = this.members[this.members.length - 1];
			i && this.promote(i);
		}
	}
	relegate(i) {
		let a = this.members.findIndex((a) => i === a);
		if (a === 0) return !1;
		let o;
		for (let i = a; i >= 0; i--) {
			let a = this.members[i];
			if (a.isPresent !== !1) {
				o = a;
				break;
			}
		}
		return o ? (this.promote(o), !0) : !1;
	}
	promote(i, a) {
		let o = this.lead;
		if (i !== o && (this.prevLead = o, this.lead = i, i.show(), o)) {
			o.instance && o.scheduleRender(), i.scheduleRender(), i.resumeFrom = o, a && (i.resumeFrom.preserveOpacity = !0), o.snapshot && (i.snapshot = o.snapshot, i.snapshot.latestValues = o.animationValues || o.latestValues), i.root && i.root.isUpdating && (i.isLayoutDirty = !0);
			let { crossfade: s } = i.options;
			s === !1 && o.hide();
		}
	}
	exitAnimationComplete() {
		this.members.forEach((i) => {
			let { options: a, resumingFrom: o } = i;
			a.onExitComplete && a.onExitComplete(), o && o.options.onExitComplete && o.options.onExitComplete();
		});
	}
	scheduleRender() {
		this.members.forEach((i) => {
			i.instance && i.scheduleRender(!1);
		});
	}
	removeLeadSnapshot() {
		this.lead && this.lead.snapshot && (this.lead.snapshot = void 0);
	}
};
function buildProjectionTransform(i, a, o) {
	let s = "", c = i.x.translate / a.x, l = i.y.translate / a.y, u = o?.z || 0;
	if ((c || l || u) && (s = `translate3d(${c}px, ${l}px, ${u}px) `), (a.x !== 1 || a.y !== 1) && (s += `scale(${1 / a.x}, ${1 / a.y}) `), o) {
		let { transformPerspective: i, rotate: a, rotateX: c, rotateY: l, skewX: u, skewY: d } = o;
		i && (s = `perspective(${i}px) ${s}`), a && (s += `rotate(${a}deg) `), c && (s += `rotateX(${c}deg) `), l && (s += `rotateY(${l}deg) `), u && (s += `skewX(${u}deg) `), d && (s += `skewY(${d}deg) `);
	}
	let d = i.x.scale * a.x, f = i.y.scale * a.y;
	return (d !== 1 || f !== 1) && (s += `scale(${d}, ${f})`), s || "none";
}
var metrics = {
	type: "projectionFrame",
	totalNodes: 0,
	resolvedTargetDeltas: 0,
	recalculatedProjection: 0
}, isDebug = typeof window < "u" && window.MotionDebug !== void 0, transformAxes = [
	"",
	"X",
	"Y",
	"Z"
], hiddenVisibility = { visibility: "hidden" }, animationTarget = 1e3, id = 0;
function resetDistortingTransform(i, a, o, s) {
	let { latestValues: c } = a;
	c[i] && (o[i] = c[i], a.setStaticValue(i, 0), s && (s[i] = 0));
}
function cancelTreeOptimisedTransformAnimations(i) {
	if (i.hasCheckedOptimisedAppear = !0, i.root === i) return;
	let { visualElement: a } = i.options;
	if (!a) return;
	let o = getOptimisedAppearId(a);
	if (window.MotionHasOptimisedAnimation(o, "transform")) {
		let { layout: a, layoutId: s } = i.options;
		window.MotionCancelOptimisedAnimation(o, "transform", frame, !(a || s));
	}
	let { parent: s } = i;
	s && !s.hasCheckedOptimisedAppear && cancelTreeOptimisedTransformAnimations(s);
}
function createProjectionNode({ attachResizeListener: i, defaultParent: a, measureScroll: o, checkIsScrollRoot: s, resetTransform: c }) {
	return class {
		constructor(i = {}, o = a?.()) {
			this.id = id++, this.animationId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = {
				x: 1,
				y: 1
			}, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
				this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
			}, this.updateProjection = () => {
				this.projectionUpdateScheduled = !1, isDebug && (metrics.totalNodes = metrics.resolvedTargetDeltas = metrics.recalculatedProjection = 0), this.nodes.forEach(propagateDirtyNodes), this.nodes.forEach(resolveTargetDelta), this.nodes.forEach(calcProjection), this.nodes.forEach(cleanDirtyNodes), isDebug && window.MotionDebug.record(metrics);
			}, this.resolvedRelativeTargetAt = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = i, this.root = o ? o.root || o : this, this.path = o ? [...o.path, o] : [], this.parent = o, this.depth = o ? o.depth + 1 : 0;
			for (let i = 0; i < this.path.length; i++) this.path[i].shouldResetTransform = !0;
			this.root === this && (this.nodes = new FlatTree());
		}
		addEventListener(i, a) {
			return this.eventHandlers.has(i) || this.eventHandlers.set(i, new SubscriptionManager()), this.eventHandlers.get(i).add(a);
		}
		notifyListeners(i, ...a) {
			let o = this.eventHandlers.get(i);
			o && o.notify(...a);
		}
		hasListeners(i) {
			return this.eventHandlers.has(i);
		}
		mount(a, o = this.root.hasTreeAnimated) {
			if (this.instance) return;
			this.isSVG = isSVGElement(a), this.instance = a;
			let { layoutId: s, layout: c, visualElement: l } = this.options;
			if (l && !l.current && l.mount(a), this.root.nodes.add(this), this.parent && this.parent.children.add(this), o && (c || s) && (this.isLayoutDirty = !0), i) {
				let o, s = () => this.root.updateBlockedByResize = !1;
				i(a, () => {
					this.root.updateBlockedByResize = !0, o && o(), o = delay(s, 250), globalProjectionState.hasAnimatedSinceResize && (globalProjectionState.hasAnimatedSinceResize = !1, this.nodes.forEach(finishAnimation));
				});
			}
			s && this.root.registerSharedNode(s, this), this.options.animate !== !1 && l && (s || c) && this.addEventListener("didUpdate", ({ delta: i, hasLayoutChanged: a, hasRelativeTargetChanged: o, layout: s }) => {
				if (this.isTreeAnimationBlocked()) {
					this.target = void 0, this.relativeTarget = void 0;
					return;
				}
				let c = this.options.transition || l.getDefaultTransition() || defaultLayoutTransition, { onLayoutAnimationStart: u, onLayoutAnimationComplete: d } = l.getProps(), f = !this.targetLayout || !boxEqualsRounded(this.targetLayout, s) || o, p = !a && o;
				if (this.options.layoutRoot || this.resumeFrom && this.resumeFrom.instance || p || a && (f || !this.currentAnimation)) {
					this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0), this.setAnimationOrigin(i, p);
					let a = {
						...getValueTransition(c, "layout"),
						onPlay: u,
						onComplete: d
					};
					(l.shouldReduceMotion || this.options.layoutRoot) && (a.delay = 0, a.type = !1), this.startAnimation(a);
				} else a || finishAnimation(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
				this.targetLayout = s;
			});
		}
		unmount() {
			this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
			let i = this.getStack();
			i && i.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, cancelFrame(this.updateProjection);
		}
		blockUpdate() {
			this.updateManuallyBlocked = !0;
		}
		unblockUpdate() {
			this.updateManuallyBlocked = !1;
		}
		isUpdateBlocked() {
			return this.updateManuallyBlocked || this.updateBlockedByResize;
		}
		isTreeAnimationBlocked() {
			return this.isAnimationBlocked || this.parent && this.parent.isTreeAnimationBlocked() || !1;
		}
		startUpdate() {
			this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(resetSkewAndRotation), this.animationId++);
		}
		getTransformTemplate() {
			let { visualElement: i } = this.options;
			return i && i.getProps().transformTemplate;
		}
		willUpdate(i = !0) {
			if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
				this.options.onExitComplete && this.options.onExitComplete();
				return;
			}
			if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && cancelTreeOptimisedTransformAnimations(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty) return;
			this.isLayoutDirty = !0;
			for (let i = 0; i < this.path.length; i++) {
				let a = this.path[i];
				a.shouldResetTransform = !0, a.updateScroll("snapshot"), a.options.layoutRoot && a.willUpdate(!1);
			}
			let { layoutId: a, layout: o } = this.options;
			if (a === void 0 && !o) return;
			let s = this.getTransformTemplate();
			this.prevTransformTemplateValue = s ? s(this.latestValues, "") : void 0, this.updateSnapshot(), i && this.notifyListeners("willUpdate");
		}
		update() {
			if (this.updateScheduled = !1, this.isUpdateBlocked()) {
				this.unblockUpdate(), this.clearAllSnapshots(), this.nodes.forEach(clearMeasurements);
				return;
			}
			this.isUpdating || this.nodes.forEach(clearIsLayoutDirty), this.isUpdating = !1, this.nodes.forEach(resetTransformStyle), this.nodes.forEach(updateLayout), this.nodes.forEach(notifyLayoutUpdate), this.clearAllSnapshots();
			let i = time.now();
			frameData.delta = clamp$2(0, 1e3 / 60, i - frameData.timestamp), frameData.timestamp = i, frameData.isProcessing = !0, frameSteps.update.process(frameData), frameSteps.preRender.process(frameData), frameSteps.render.process(frameData), frameData.isProcessing = !1;
		}
		didUpdate() {
			this.updateScheduled || (this.updateScheduled = !0, microtask.read(this.scheduleUpdate));
		}
		clearAllSnapshots() {
			this.nodes.forEach(clearSnapshot), this.sharedNodes.forEach(removeLeadSnapshots);
		}
		scheduleUpdateProjection() {
			this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, frame.preRender(this.updateProjection, !1, !0));
		}
		scheduleCheckAfterUnmount() {
			frame.postRender(() => {
				this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
			});
		}
		updateSnapshot() {
			this.snapshot || !this.instance || (this.snapshot = this.measure());
		}
		updateLayout() {
			if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty)) return;
			if (this.resumeFrom && !this.resumeFrom.instance) for (let i = 0; i < this.path.length; i++) this.path[i].updateScroll();
			let i = this.layout;
			this.layout = this.measure(!1), this.layoutCorrected = createBox(), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
			let { visualElement: a } = this.options;
			a && a.notify("LayoutMeasure", this.layout.layoutBox, i ? i.layoutBox : void 0);
		}
		updateScroll(i = "measure") {
			let a = !!(this.options.layoutScroll && this.instance);
			if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === i && (a = !1), a) {
				let a = s(this.instance);
				this.scroll = {
					animationId: this.root.animationId,
					phase: i,
					isRoot: a,
					offset: o(this.instance),
					wasRoot: this.scroll ? this.scroll.isRoot : a
				};
			}
		}
		resetTransform() {
			if (!c) return;
			let i = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, a = this.projectionDelta && !isDeltaZero(this.projectionDelta), o = this.getTransformTemplate(), s = o ? o(this.latestValues, "") : void 0, l = s !== this.prevTransformTemplateValue;
			i && (a || hasTransform(this.latestValues) || l) && (c(this.instance, s), this.shouldResetTransform = !1, this.scheduleRender());
		}
		measure(i = !0) {
			let a = this.measurePageBox(), o = this.removeElementScroll(a);
			return i && (o = this.removeTransform(o)), roundBox(o), {
				animationId: this.root.animationId,
				measuredBox: a,
				layoutBox: o,
				latestValues: {},
				source: this.id
			};
		}
		measurePageBox() {
			let { visualElement: i } = this.options;
			if (!i) return createBox();
			let a = i.measureViewportBox();
			if (!(this.scroll?.wasRoot || this.path.some(checkNodeWasScrollRoot))) {
				let { scroll: i } = this.root;
				i && (translateAxis(a.x, i.offset.x), translateAxis(a.y, i.offset.y));
			}
			return a;
		}
		removeElementScroll(i) {
			let a = createBox();
			if (copyBoxInto(a, i), this.scroll?.wasRoot) return a;
			for (let o = 0; o < this.path.length; o++) {
				let s = this.path[o], { scroll: c, options: l } = s;
				s !== this.root && c && l.layoutScroll && (c.wasRoot && copyBoxInto(a, i), translateAxis(a.x, c.offset.x), translateAxis(a.y, c.offset.y));
			}
			return a;
		}
		applyTransform(i, a = !1) {
			let o = createBox();
			copyBoxInto(o, i);
			for (let i = 0; i < this.path.length; i++) {
				let s = this.path[i];
				!a && s.options.layoutScroll && s.scroll && s !== s.root && transformBox(o, {
					x: -s.scroll.offset.x,
					y: -s.scroll.offset.y
				}), hasTransform(s.latestValues) && transformBox(o, s.latestValues);
			}
			return hasTransform(this.latestValues) && transformBox(o, this.latestValues), o;
		}
		removeTransform(i) {
			let a = createBox();
			copyBoxInto(a, i);
			for (let i = 0; i < this.path.length; i++) {
				let o = this.path[i];
				if (!o.instance || !hasTransform(o.latestValues)) continue;
				hasScale(o.latestValues) && o.updateSnapshot();
				let s = createBox();
				copyBoxInto(s, o.measurePageBox()), removeBoxTransforms(a, o.latestValues, o.snapshot ? o.snapshot.layoutBox : void 0, s);
			}
			return hasTransform(this.latestValues) && removeBoxTransforms(a, this.latestValues), a;
		}
		setTargetDelta(i) {
			this.targetDelta = i, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0;
		}
		setOptions(i) {
			this.options = {
				...this.options,
				...i,
				crossfade: i.crossfade === void 0 ? !0 : i.crossfade
			};
		}
		clearMeasurements() {
			this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1;
		}
		forceRelativeParentToResolveTarget() {
			this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== frameData.timestamp && this.relativeParent.resolveTargetDelta(!0);
		}
		resolveTargetDelta(i = !1) {
			let a = this.getLead();
			this.isProjectionDirty ||= a.isProjectionDirty, this.isTransformDirty ||= a.isTransformDirty, this.isSharedProjectionDirty ||= a.isSharedProjectionDirty;
			let o = !!this.resumingFrom || this !== a;
			if (!(i || o && this.isSharedProjectionDirty || this.isProjectionDirty || this.parent?.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize)) return;
			let { layout: s, layoutId: c } = this.options;
			if (!(!this.layout || !(s || c))) {
				if (this.resolvedRelativeTargetAt = frameData.timestamp, !this.targetDelta && !this.relativeTarget) {
					let i = this.getClosestProjectingParent();
					i && i.layout && this.animationProgress !== 1 ? (this.relativeParent = i, this.forceRelativeParentToResolveTarget(), this.relativeTarget = createBox(), this.relativeTargetOrigin = createBox(), calcRelativePosition(this.relativeTargetOrigin, this.layout.layoutBox, i.layout.layoutBox), copyBoxInto(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
				}
				if (!(!this.relativeTarget && !this.targetDelta)) {
					if (this.target || (this.target = createBox(), this.targetWithTransforms = createBox()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), calcRelativeBox(this.target, this.relativeTarget, this.relativeParent.target)) : this.targetDelta ? (this.resumingFrom ? this.target = this.applyTransform(this.layout.layoutBox) : copyBoxInto(this.target, this.layout.layoutBox), applyBoxDelta(this.target, this.targetDelta)) : copyBoxInto(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget) {
						this.attemptToResolveRelativeTarget = !1;
						let i = this.getClosestProjectingParent();
						i && !!i.resumingFrom == !!this.resumingFrom && !i.options.layoutScroll && i.target && this.animationProgress !== 1 ? (this.relativeParent = i, this.forceRelativeParentToResolveTarget(), this.relativeTarget = createBox(), this.relativeTargetOrigin = createBox(), calcRelativePosition(this.relativeTargetOrigin, this.target, i.target), copyBoxInto(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
					}
					isDebug && metrics.resolvedTargetDeltas++;
				}
			}
		}
		getClosestProjectingParent() {
			if (!(!this.parent || hasScale(this.parent.latestValues) || has2DTranslate(this.parent.latestValues))) return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
		}
		isProjecting() {
			return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
		}
		calcProjection() {
			let i = this.getLead(), a = !!this.resumingFrom || this !== i, o = !0;
			if ((this.isProjectionDirty || this.parent?.isProjectionDirty) && (o = !1), a && (this.isSharedProjectionDirty || this.isTransformDirty) && (o = !1), this.resolvedRelativeTargetAt === frameData.timestamp && (o = !1), o) return;
			let { layout: s, layoutId: c } = this.options;
			if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(s || c)) return;
			copyBoxInto(this.layoutCorrected, this.layout.layoutBox);
			let l = this.treeScale.x, u = this.treeScale.y;
			applyTreeDeltas(this.layoutCorrected, this.treeScale, this.path, a), i.layout && !i.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (i.target = i.layout.layoutBox, i.targetWithTransforms = createBox());
			let { target: d } = i;
			if (!d) {
				this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
				return;
			}
			!this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (copyAxisDeltaInto(this.prevProjectionDelta.x, this.projectionDelta.x), copyAxisDeltaInto(this.prevProjectionDelta.y, this.projectionDelta.y)), calcBoxDelta(this.projectionDelta, this.layoutCorrected, d, this.latestValues), (this.treeScale.x !== l || this.treeScale.y !== u || !axisDeltaEquals(this.projectionDelta.x, this.prevProjectionDelta.x) || !axisDeltaEquals(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", d)), isDebug && metrics.recalculatedProjection++;
		}
		hide() {
			this.isVisible = !1;
		}
		show() {
			this.isVisible = !0;
		}
		scheduleRender(i = !0) {
			var a;
			if ((a = this.options.visualElement) == null || a.scheduleRender(), i) {
				let i = this.getStack();
				i && i.scheduleRender();
			}
			this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
		}
		createProjectionDeltas() {
			this.prevProjectionDelta = createDelta(), this.projectionDelta = createDelta(), this.projectionDeltaWithTransform = createDelta();
		}
		setAnimationOrigin(i, a = !1) {
			let o = this.snapshot, s = o ? o.latestValues : {}, c = { ...this.latestValues }, l = createDelta();
			(!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !a;
			let u = createBox(), d = (o ? o.source : void 0) !== (this.layout ? this.layout.source : void 0), f = this.getStack(), p = !f || f.members.length <= 1, m = !!(d && !p && this.options.crossfade === !0 && !this.path.some(hasOpacityCrossfade));
			this.animationProgress = 0;
			let h;
			this.mixTargetDelta = (a) => {
				let o = a / 1e3;
				mixAxisDelta(l.x, i.x, o), mixAxisDelta(l.y, i.y, o), this.setTargetDelta(l), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (calcRelativePosition(u, this.layout.layoutBox, this.relativeParent.layout.layoutBox), mixBox(this.relativeTarget, this.relativeTargetOrigin, u, o), h && boxEquals(this.relativeTarget, h) && (this.isProjectionDirty = !1), h ||= createBox(), copyBoxInto(h, this.relativeTarget)), d && (this.animationValues = c, mixValues(c, s, this.latestValues, o, m, p)), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = o;
			}, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
		}
		startAnimation(i) {
			this.notifyListeners("animationStart"), this.currentAnimation && this.currentAnimation.stop(), this.resumingFrom && this.resumingFrom.currentAnimation && this.resumingFrom.currentAnimation.stop(), this.pendingAnimation &&= (cancelFrame(this.pendingAnimation), void 0), this.pendingAnimation = frame.update(() => {
				globalProjectionState.hasAnimatedSinceResize = !0, this.currentAnimation = animateSingleValue(0, animationTarget, {
					...i,
					onUpdate: (a) => {
						this.mixTargetDelta(a), i.onUpdate && i.onUpdate(a);
					},
					onComplete: () => {
						i.onComplete && i.onComplete(), this.completeAnimation();
					}
				}), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0;
			});
		}
		completeAnimation() {
			this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
			let i = this.getStack();
			i && i.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete");
		}
		finishAnimation() {
			this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(animationTarget), this.currentAnimation.stop()), this.completeAnimation();
		}
		applyTransformsToTarget() {
			let i = this.getLead(), { targetWithTransforms: a, target: o, layout: s, latestValues: c } = i;
			if (!(!a || !o || !s)) {
				if (this !== i && this.layout && s && shouldAnimatePositionOnly(this.options.animationType, this.layout.layoutBox, s.layoutBox)) {
					o = this.target || createBox();
					let a = calcLength(this.layout.layoutBox.x);
					o.x.min = i.target.x.min, o.x.max = o.x.min + a;
					let s = calcLength(this.layout.layoutBox.y);
					o.y.min = i.target.y.min, o.y.max = o.y.min + s;
				}
				copyBoxInto(a, o), transformBox(a, c), calcBoxDelta(this.projectionDeltaWithTransform, this.layoutCorrected, a, c);
			}
		}
		registerSharedNode(i, a) {
			this.sharedNodes.has(i) || this.sharedNodes.set(i, new NodeStack()), this.sharedNodes.get(i).add(a);
			let o = a.options.initialPromotionConfig;
			a.promote({
				transition: o ? o.transition : void 0,
				preserveFollowOpacity: o && o.shouldPreserveFollowOpacity ? o.shouldPreserveFollowOpacity(a) : void 0
			});
		}
		isLead() {
			let i = this.getStack();
			return i ? i.lead === this : !0;
		}
		getLead() {
			let { layoutId: i } = this.options;
			return i && this.getStack()?.lead || this;
		}
		getPrevLead() {
			let { layoutId: i } = this.options;
			return i ? this.getStack()?.prevLead : void 0;
		}
		getStack() {
			let { layoutId: i } = this.options;
			if (i) return this.root.sharedNodes.get(i);
		}
		promote({ needsReset: i, transition: a, preserveFollowOpacity: o } = {}) {
			let s = this.getStack();
			s && s.promote(this, o), i && (this.projectionDelta = void 0, this.needsReset = !0), a && this.setOptions({ transition: a });
		}
		relegate() {
			let i = this.getStack();
			return i ? i.relegate(this) : !1;
		}
		resetSkewAndRotation() {
			let { visualElement: i } = this.options;
			if (!i) return;
			let a = !1, { latestValues: o } = i;
			if ((o.z || o.rotate || o.rotateX || o.rotateY || o.rotateZ || o.skewX || o.skewY) && (a = !0), !a) return;
			let s = {};
			o.z && resetDistortingTransform("z", i, s, this.animationValues);
			for (let a = 0; a < transformAxes.length; a++) resetDistortingTransform(`rotate${transformAxes[a]}`, i, s, this.animationValues), resetDistortingTransform(`skew${transformAxes[a]}`, i, s, this.animationValues);
			for (let a in i.render(), s) i.setStaticValue(a, s[a]), this.animationValues && (this.animationValues[a] = s[a]);
			i.scheduleRender();
		}
		getProjectionStyles(i) {
			if (!this.instance || this.isSVG) return;
			if (!this.isVisible) return hiddenVisibility;
			let a = { visibility: "" }, o = this.getTransformTemplate();
			if (this.needsReset) return this.needsReset = !1, a.opacity = "", a.pointerEvents = resolveMotionValue(i?.pointerEvents) || "", a.transform = o ? o(this.latestValues, "") : "none", a;
			let s = this.getLead();
			if (!this.projectionDelta || !this.layout || !s.target) {
				let a = {};
				return this.options.layoutId && (a.opacity = this.latestValues.opacity === void 0 ? 1 : this.latestValues.opacity, a.pointerEvents = resolveMotionValue(i?.pointerEvents) || ""), this.hasProjected && !hasTransform(this.latestValues) && (a.transform = o ? o({}, "") : "none", this.hasProjected = !1), a;
			}
			let c = s.animationValues || s.latestValues;
			this.applyTransformsToTarget(), a.transform = buildProjectionTransform(this.projectionDeltaWithTransform, this.treeScale, c), o && (a.transform = o(c, a.transform));
			let { x: l, y: u } = this.projectionDelta;
			for (let i in a.transformOrigin = `${l.origin * 100}% ${u.origin * 100}% 0`, s.animationValues ? a.opacity = s === this ? c.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : c.opacityExit : a.opacity = s === this ? c.opacity === void 0 ? "" : c.opacity : c.opacityExit === void 0 ? 0 : c.opacityExit, scaleCorrectors) {
				if (c[i] === void 0) continue;
				let { correct: o, applyTo: l } = scaleCorrectors[i], u = a.transform === "none" ? c[i] : o(c[i], s);
				if (l) {
					let i = l.length;
					for (let o = 0; o < i; o++) a[l[o]] = u;
				} else a[i] = u;
			}
			return this.options.layoutId && (a.pointerEvents = s === this ? resolveMotionValue(i?.pointerEvents) || "" : "none"), a;
		}
		clearSnapshot() {
			this.resumeFrom = this.snapshot = void 0;
		}
		resetTree() {
			this.root.nodes.forEach((i) => i.currentAnimation?.stop()), this.root.nodes.forEach(clearMeasurements), this.root.sharedNodes.clear();
		}
	};
}
function updateLayout(i) {
	i.updateLayout();
}
function notifyLayoutUpdate(i) {
	let a = i.resumeFrom?.snapshot || i.snapshot;
	if (i.isLead() && i.layout && a && i.hasListeners("didUpdate")) {
		let { layoutBox: o, measuredBox: s } = i.layout, { animationType: c } = i.options, l = a.source !== i.layout.source;
		c === "size" ? eachAxis((i) => {
			let s = l ? a.measuredBox[i] : a.layoutBox[i], c = calcLength(s);
			s.min = o[i].min, s.max = s.min + c;
		}) : shouldAnimatePositionOnly(c, a.layoutBox, o) && eachAxis((s) => {
			let c = l ? a.measuredBox[s] : a.layoutBox[s], u = calcLength(o[s]);
			c.max = c.min + u, i.relativeTarget && !i.currentAnimation && (i.isProjectionDirty = !0, i.relativeTarget[s].max = i.relativeTarget[s].min + u);
		});
		let u = createDelta();
		calcBoxDelta(u, o, a.layoutBox);
		let d = createDelta();
		l ? calcBoxDelta(d, i.applyTransform(s, !0), a.measuredBox) : calcBoxDelta(d, o, a.layoutBox);
		let f = !isDeltaZero(u), p = !1;
		if (!i.resumeFrom) {
			let s = i.getClosestProjectingParent();
			if (s && !s.resumeFrom) {
				let { snapshot: c, layout: l } = s;
				if (c && l) {
					let u = createBox();
					calcRelativePosition(u, a.layoutBox, c.layoutBox);
					let d = createBox();
					calcRelativePosition(d, o, l.layoutBox), boxEqualsRounded(u, d) || (p = !0), s.options.layoutRoot && (i.relativeTarget = d, i.relativeTargetOrigin = u, i.relativeParent = s);
				}
			}
		}
		i.notifyListeners("didUpdate", {
			layout: o,
			snapshot: a,
			delta: d,
			layoutDelta: u,
			hasLayoutChanged: f,
			hasRelativeTargetChanged: p
		});
	} else if (i.isLead()) {
		let { onExitComplete: a } = i.options;
		a && a();
	}
	i.options.transition = void 0;
}
function propagateDirtyNodes(i) {
	isDebug && metrics.totalNodes++, i.parent && (i.isProjecting() || (i.isProjectionDirty = i.parent.isProjectionDirty), i.isSharedProjectionDirty ||= !!(i.isProjectionDirty || i.parent.isProjectionDirty || i.parent.isSharedProjectionDirty), i.isTransformDirty ||= i.parent.isTransformDirty);
}
function cleanDirtyNodes(i) {
	i.isProjectionDirty = i.isSharedProjectionDirty = i.isTransformDirty = !1;
}
function clearSnapshot(i) {
	i.clearSnapshot();
}
function clearMeasurements(i) {
	i.clearMeasurements();
}
function clearIsLayoutDirty(i) {
	i.isLayoutDirty = !1;
}
function resetTransformStyle(i) {
	let { visualElement: a } = i.options;
	a && a.getProps().onBeforeLayoutMeasure && a.notify("BeforeLayoutMeasure"), i.resetTransform();
}
function finishAnimation(i) {
	i.finishAnimation(), i.targetDelta = i.relativeTarget = i.target = void 0, i.isProjectionDirty = !0;
}
function resolveTargetDelta(i) {
	i.resolveTargetDelta();
}
function calcProjection(i) {
	i.calcProjection();
}
function resetSkewAndRotation(i) {
	i.resetSkewAndRotation();
}
function removeLeadSnapshots(i) {
	i.removeLeadSnapshot();
}
function mixAxisDelta(i, a, o) {
	i.translate = mixNumber(a.translate, 0, o), i.scale = mixNumber(a.scale, 1, o), i.origin = a.origin, i.originPoint = a.originPoint;
}
function mixAxis(i, a, o, s) {
	i.min = mixNumber(a.min, o.min, s), i.max = mixNumber(a.max, o.max, s);
}
function mixBox(i, a, o, s) {
	mixAxis(i.x, a.x, o.x, s), mixAxis(i.y, a.y, o.y, s);
}
function hasOpacityCrossfade(i) {
	return i.animationValues && i.animationValues.opacityExit !== void 0;
}
var defaultLayoutTransition = {
	duration: .45,
	ease: [
		.4,
		0,
		.1,
		1
	]
}, userAgentContains = (i) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(i), roundPoint = userAgentContains("applewebkit/") && !userAgentContains("chrome/") ? Math.round : noop;
function roundAxis(i) {
	i.min = roundPoint(i.min), i.max = roundPoint(i.max);
}
function roundBox(i) {
	roundAxis(i.x), roundAxis(i.y);
}
function shouldAnimatePositionOnly(i, a, o) {
	return i === "position" || i === "preserve-aspect" && !isNear(aspectRatio(a), aspectRatio(o), .2);
}
function checkNodeWasScrollRoot(i) {
	return i !== i.root && i.scroll?.wasRoot;
}
var DocumentProjectionNode = createProjectionNode({
	attachResizeListener: (i, a) => addDomEvent(i, "resize", a),
	measureScroll: () => ({
		x: document.documentElement.scrollLeft || document.body.scrollLeft,
		y: document.documentElement.scrollTop || document.body.scrollTop
	}),
	checkIsScrollRoot: () => !0
}), rootProjectionNode = { current: void 0 }, HTMLProjectionNode = createProjectionNode({
	measureScroll: (i) => ({
		x: i.scrollLeft,
		y: i.scrollTop
	}),
	defaultParent: () => {
		if (!rootProjectionNode.current) {
			let i = new DocumentProjectionNode({});
			i.mount(window), i.setOptions({ layoutScroll: !0 }), rootProjectionNode.current = i;
		}
		return rootProjectionNode.current;
	},
	resetTransform: (i, a) => {
		i.style.transform = a === void 0 ? "none" : a;
	},
	checkIsScrollRoot: (i) => window.getComputedStyle(i).position === "fixed"
}), drag = {
	pan: { Feature: PanGesture },
	drag: {
		Feature: DragGesture,
		ProjectionNode: HTMLProjectionNode,
		MeasureLayout
	}
};
function handleHoverEvent(i, a, o) {
	let { props: s } = i;
	i.animationState && s.whileHover && i.animationState.setActive("whileHover", o === "Start");
	let c = s["onHover" + o];
	c && frame.postRender(() => c(a, extractEventInfo(a)));
}
var HoverGesture = class extends Feature {
	mount() {
		let { current: i } = this.node;
		i && (this.unmount = hover(i, (i) => (handleHoverEvent(this.node, i, "Start"), (i) => handleHoverEvent(this.node, i, "End"))));
	}
	unmount() {}
}, FocusGesture = class extends Feature {
	constructor() {
		super(...arguments), this.isActive = !1;
	}
	onFocus() {
		let i = !1;
		try {
			i = this.node.current.matches(":focus-visible");
		} catch {
			i = !0;
		}
		!i || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0);
	}
	onBlur() {
		!this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1);
	}
	mount() {
		this.unmount = pipe(addDomEvent(this.node.current, "focus", () => this.onFocus()), addDomEvent(this.node.current, "blur", () => this.onBlur()));
	}
	unmount() {}
};
function handlePressEvent(i, a, o) {
	let { props: s } = i;
	i.animationState && s.whileTap && i.animationState.setActive("whileTap", o === "Start");
	let c = s["onTap" + (o === "End" ? "" : o)];
	c && frame.postRender(() => c(a, extractEventInfo(a)));
}
var PressGesture = class extends Feature {
	mount() {
		let { current: i } = this.node;
		i && (this.unmount = press(i, (i) => (handlePressEvent(this.node, i, "Start"), (i, { success: a }) => handlePressEvent(this.node, i, a ? "End" : "Cancel")), { useGlobalTarget: this.node.props.globalTapTarget }));
	}
	unmount() {}
}, observerCallbacks = /* @__PURE__ */ new WeakMap(), observers = /* @__PURE__ */ new WeakMap(), fireObserverCallback = (i) => {
	let a = observerCallbacks.get(i.target);
	a && a(i);
}, fireAllObserverCallbacks = (i) => {
	i.forEach(fireObserverCallback);
};
function initIntersectionObserver({ root: i, ...a }) {
	let o = i || document;
	observers.has(o) || observers.set(o, {});
	let s = observers.get(o), c = JSON.stringify(a);
	return s[c] || (s[c] = new IntersectionObserver(fireAllObserverCallbacks, {
		root: i,
		...a
	})), s[c];
}
function observeIntersection(i, a, o) {
	let s = initIntersectionObserver(a);
	return observerCallbacks.set(i, o), s.observe(i), () => {
		observerCallbacks.delete(i), s.unobserve(i);
	};
}
var thresholdNames = {
	some: 0,
	all: 1
}, InViewFeature = class extends Feature {
	constructor() {
		super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
	}
	startObserver() {
		this.unmount();
		let { viewport: i = {} } = this.node.getProps(), { root: a, margin: o, amount: s = "some", once: c } = i, l = {
			root: a ? a.current : void 0,
			rootMargin: o,
			threshold: typeof s == "number" ? s : thresholdNames[s]
		};
		return observeIntersection(this.node.current, l, (i) => {
			let { isIntersecting: a } = i;
			if (this.isInView === a || (this.isInView = a, c && !a && this.hasEnteredView)) return;
			a && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", a);
			let { onViewportEnter: o, onViewportLeave: s } = this.node.getProps(), l = a ? o : s;
			l && l(i);
		});
	}
	mount() {
		this.startObserver();
	}
	update() {
		if (typeof IntersectionObserver > "u") return;
		let { props: i, prevProps: a } = this.node;
		[
			"amount",
			"margin",
			"root"
		].some(hasViewportOptionChanged(i, a)) && this.startObserver();
	}
	unmount() {}
};
function hasViewportOptionChanged({ viewport: i = {} }, { viewport: a = {} } = {}) {
	return (o) => i[o] !== a[o];
}
var gestureAnimations = {
	inView: { Feature: InViewFeature },
	tap: { Feature: PressGesture },
	focus: { Feature: FocusGesture },
	hover: { Feature: HoverGesture }
}, layout = { layout: {
	ProjectionNode: HTMLProjectionNode,
	MeasureLayout
} }, prefersReducedMotion = { current: null }, hasReducedMotionListener = { current: !1 };
function initPrefersReducedMotion() {
	if (hasReducedMotionListener.current = !0, isBrowser) if (window.matchMedia) {
		let i = window.matchMedia("(prefers-reduced-motion)"), a = () => prefersReducedMotion.current = i.matches;
		i.addListener(a), a();
	} else prefersReducedMotion.current = !1;
}
var valueTypes = [
	...dimensionValueTypes,
	color$1,
	complex
], findValueType = (i) => valueTypes.find(testValueType(i)), visualElementStore = /* @__PURE__ */ new WeakMap();
function updateMotionValuesFromProps(i, a, o) {
	for (let s in a) {
		let c = a[s], l = o[s];
		if (isMotionValue(c)) i.addValue(s, c), process.env.NODE_ENV === "development" && warnOnce(c.version === "11.18.2", `Attempting to mix Motion versions ${c.version} with 11.18.2 may not work as expected.`);
		else if (isMotionValue(l)) i.addValue(s, motionValue(c, { owner: i }));
		else if (l !== c) if (i.hasValue(s)) {
			let a = i.getValue(s);
			a.liveStyle === !0 ? a.jump(c) : a.hasAnimated || a.set(c);
		} else {
			let a = i.getStaticValue(s);
			i.addValue(s, motionValue(a === void 0 ? c : a, { owner: i }));
		}
	}
	for (let s in o) a[s] === void 0 && i.removeValue(s);
	return a;
}
var propEventHandlers = [
	"AnimationStart",
	"AnimationComplete",
	"Update",
	"BeforeLayoutMeasure",
	"LayoutMeasure",
	"LayoutAnimationStart",
	"LayoutAnimationComplete"
], VisualElement = class {
	scrapeMotionValuesFromProps(i, a, o) {
		return {};
	}
	constructor({ parent: i, props: a, presenceContext: o, reducedMotionConfig: s, blockInitialAnimation: c, visualState: l }, u = {}) {
		this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = KeyframeResolver, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
			this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
		}, this.renderScheduledAt = 0, this.scheduleRender = () => {
			let i = time.now();
			this.renderScheduledAt < i && (this.renderScheduledAt = i, frame.render(this.render, !1, !0));
		};
		let { latestValues: d, renderState: f, onUpdate: p } = l;
		this.onUpdate = p, this.latestValues = d, this.baseTarget = { ...d }, this.initialValues = a.initial ? { ...d } : {}, this.renderState = f, this.parent = i, this.props = a, this.presenceContext = o, this.depth = i ? i.depth + 1 : 0, this.reducedMotionConfig = s, this.options = u, this.blockInitialAnimation = !!c, this.isControllingVariants = isControllingVariants(a), this.isVariantNode = isVariantNode(a), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(i && i.current);
		let { willChange: m, ...h } = this.scrapeMotionValuesFromProps(a, {}, this);
		for (let i in h) {
			let a = h[i];
			d[i] !== void 0 && isMotionValue(a) && a.set(d[i], !1);
		}
	}
	mount(i) {
		this.current = i, visualElementStore.set(i, this), this.projection && !this.projection.instance && this.projection.mount(i), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((i, a) => this.bindToMotionValue(a, i)), hasReducedMotionListener.current || initPrefersReducedMotion(), this.shouldReduceMotion = this.reducedMotionConfig === "never" ? !1 : this.reducedMotionConfig === "always" ? !0 : prefersReducedMotion.current, process.env.NODE_ENV !== "production" && warnOnce(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected."), this.parent && this.parent.children.add(this), this.update(this.props, this.presenceContext);
	}
	unmount() {
		for (let i in visualElementStore.delete(this.current), this.projection && this.projection.unmount(), cancelFrame(this.notifyUpdate), cancelFrame(this.render), this.valueSubscriptions.forEach((i) => i()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent && this.parent.children.delete(this), this.events) this.events[i].clear();
		for (let i in this.features) {
			let a = this.features[i];
			a && (a.unmount(), a.isMounted = !1);
		}
		this.current = null;
	}
	bindToMotionValue(i, a) {
		this.valueSubscriptions.has(i) && this.valueSubscriptions.get(i)();
		let o = transformProps.has(i), s = a.on("change", (a) => {
			this.latestValues[i] = a, this.props.onUpdate && frame.preRender(this.notifyUpdate), o && this.projection && (this.projection.isTransformDirty = !0);
		}), c = a.on("renderRequest", this.scheduleRender), l;
		window.MotionCheckAppearSync && (l = window.MotionCheckAppearSync(this, i, a)), this.valueSubscriptions.set(i, () => {
			s(), c(), l && l(), a.owner && a.stop();
		});
	}
	sortNodePosition(i) {
		return !this.current || !this.sortInstanceNodePosition || this.type !== i.type ? 0 : this.sortInstanceNodePosition(this.current, i.current);
	}
	updateFeatures() {
		let i = "animation";
		for (i in featureDefinitions) {
			let a = featureDefinitions[i];
			if (!a) continue;
			let { isEnabled: o, Feature: s } = a;
			if (!this.features[i] && s && o(this.props) && (this.features[i] = new s(this)), this.features[i]) {
				let a = this.features[i];
				a.isMounted ? a.update() : (a.mount(), a.isMounted = !0);
			}
		}
	}
	triggerBuild() {
		this.build(this.renderState, this.latestValues, this.props);
	}
	measureViewportBox() {
		return this.current ? this.measureInstanceViewportBox(this.current, this.props) : createBox();
	}
	getStaticValue(i) {
		return this.latestValues[i];
	}
	setStaticValue(i, a) {
		this.latestValues[i] = a;
	}
	update(i, a) {
		(i.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = i, this.prevPresenceContext = this.presenceContext, this.presenceContext = a;
		for (let a = 0; a < propEventHandlers.length; a++) {
			let o = propEventHandlers[a];
			this.propEventSubscriptions[o] && (this.propEventSubscriptions[o](), delete this.propEventSubscriptions[o]);
			let s = i["on" + o];
			s && (this.propEventSubscriptions[o] = this.on(o, s));
		}
		this.prevMotionValues = updateMotionValuesFromProps(this, this.scrapeMotionValuesFromProps(i, this.prevProps, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue(), this.onUpdate && this.onUpdate(this);
	}
	getProps() {
		return this.props;
	}
	getVariant(i) {
		return this.props.variants ? this.props.variants[i] : void 0;
	}
	getDefaultTransition() {
		return this.props.transition;
	}
	getTransformPagePoint() {
		return this.props.transformPagePoint;
	}
	getClosestVariantNode() {
		return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
	}
	addVariantChild(i) {
		let a = this.getClosestVariantNode();
		if (a) return a.variantChildren && a.variantChildren.add(i), () => a.variantChildren.delete(i);
	}
	addValue(i, a) {
		let o = this.values.get(i);
		a !== o && (o && this.removeValue(i), this.bindToMotionValue(i, a), this.values.set(i, a), this.latestValues[i] = a.get());
	}
	removeValue(i) {
		this.values.delete(i);
		let a = this.valueSubscriptions.get(i);
		a && (a(), this.valueSubscriptions.delete(i)), delete this.latestValues[i], this.removeValueFromRenderState(i, this.renderState);
	}
	hasValue(i) {
		return this.values.has(i);
	}
	getValue(i, a) {
		if (this.props.values && this.props.values[i]) return this.props.values[i];
		let o = this.values.get(i);
		return o === void 0 && a !== void 0 && (o = motionValue(a === null ? void 0 : a, { owner: this }), this.addValue(i, o)), o;
	}
	readValue(i, a) {
		let o = this.latestValues[i] !== void 0 || !this.current ? this.latestValues[i] : this.getBaseTargetFromProps(this.props, i) ?? this.readValueFromInstance(this.current, i, this.options);
		return o != null && (typeof o == "string" && (isNumericalString(o) || isZeroValueString(o)) ? o = parseFloat(o) : !findValueType(o) && complex.test(a) && (o = getAnimatableNone(i, a)), this.setBaseTarget(i, isMotionValue(o) ? o.get() : o)), isMotionValue(o) ? o.get() : o;
	}
	setBaseTarget(i, a) {
		this.baseTarget[i] = a;
	}
	getBaseTarget(i) {
		let { initial: a } = this.props, o;
		if (typeof a == "string" || typeof a == "object") {
			let s = resolveVariantFromProps(this.props, a, this.presenceContext?.custom);
			s && (o = s[i]);
		}
		if (a && o !== void 0) return o;
		let s = this.getBaseTargetFromProps(this.props, i);
		return s !== void 0 && !isMotionValue(s) ? s : this.initialValues[i] !== void 0 && o === void 0 ? void 0 : this.baseTarget[i];
	}
	on(i, a) {
		return this.events[i] || (this.events[i] = new SubscriptionManager()), this.events[i].add(a);
	}
	notify(i, ...a) {
		this.events[i] && this.events[i].notify(...a);
	}
}, DOMVisualElement = class extends VisualElement {
	constructor() {
		super(...arguments), this.KeyframeResolver = DOMKeyframesResolver;
	}
	sortInstanceNodePosition(i, a) {
		return i.compareDocumentPosition(a) & 2 ? 1 : -1;
	}
	getBaseTargetFromProps(i, a) {
		return i.style ? i.style[a] : void 0;
	}
	removeValueFromRenderState(i, { vars: a, style: o }) {
		delete a[i], delete o[i];
	}
	handleChildMotionValue() {
		this.childSubscription && (this.childSubscription(), delete this.childSubscription);
		let { children: i } = this.props;
		isMotionValue(i) && (this.childSubscription = i.on("change", (i) => {
			this.current && (this.current.textContent = `${i}`);
		}));
	}
};
function getComputedStyle$2(i) {
	return window.getComputedStyle(i);
}
var HTMLVisualElement = class extends DOMVisualElement {
	constructor() {
		super(...arguments), this.type = "html", this.renderInstance = renderHTML;
	}
	readValueFromInstance(i, a) {
		if (transformProps.has(a)) {
			let i = getDefaultValueType(a);
			return i && i.default || 0;
		} else {
			let o = getComputedStyle$2(i), s = (isCSSVariableName(a) ? o.getPropertyValue(a) : o[a]) || 0;
			return typeof s == "string" ? s.trim() : s;
		}
	}
	measureInstanceViewportBox(i, { transformPagePoint: a }) {
		return measureViewportBox(i, a);
	}
	build(i, a, o) {
		buildHTMLStyles(i, a, o.transformTemplate);
	}
	scrapeMotionValuesFromProps(i, a, o) {
		return scrapeMotionValuesFromProps$1(i, a, o);
	}
}, SVGVisualElement = class extends DOMVisualElement {
	constructor() {
		super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = createBox;
	}
	getBaseTargetFromProps(i, a) {
		return i[a];
	}
	readValueFromInstance(i, a) {
		if (transformProps.has(a)) {
			let i = getDefaultValueType(a);
			return i && i.default || 0;
		}
		return a = camelCaseAttributes.has(a) ? a : camelToDash(a), i.getAttribute(a);
	}
	scrapeMotionValuesFromProps(i, a, o) {
		return scrapeMotionValuesFromProps(i, a, o);
	}
	build(i, a, o) {
		buildSVGAttrs(i, a, this.isSVGTag, o.transformTemplate);
	}
	renderInstance(i, a, o, s) {
		renderSVG(i, a, o, s);
	}
	mount(i) {
		this.isSVGTag = isSVGTag(i.tagName), super.mount(i);
	}
}, createDomVisualElement = (i, a) => isSVGComponent(i) ? new SVGVisualElement(a) : new HTMLVisualElement(a, { allowProjection: i !== Fragment }), motion = /* @__PURE__ */ createDOMMotionComponentProxy(/* @__PURE__ */ createMotionComponentFactory({
	...animations,
	...gestureAnimations,
	...drag,
	...layout
}, createDomVisualElement));
function e(i, a, o) {
	let s = (o) => i(o, ...a);
	return o === void 0 ? s : Object.assign(s, {
		lazy: o,
		lazyArgs: a
	});
}
function t(i, a, o) {
	let s = i.length - a.length;
	if (s === 0) return i(...a);
	if (s === 1) return e(i, a, o);
	throw Error("Wrong number of arguments");
}
function t$1(...i) {
	return t(n$1, i);
}
var n$1 = (i, a) => i.length >= a;
function n(...i) {
	return t(r, i);
}
function r(i, a) {
	if (!t$1(a, 1)) return { ...i };
	if (!t$1(a, 2)) {
		let { [a[0]]: o, ...s } = i;
		return s;
	}
	let o = { ...i };
	for (let i of a) delete o[i];
	return o;
}
const recordAudio = (function() {
	let i = async function(a) {
		try {
			let o = new MediaRecorder(a, { mimeType: "audio/webm;codecs=opus" }), s = [];
			return new Promise((a, c) => {
				o.ondataavailable = (i) => {
					i.data.size > 0 && s.push(i.data);
				}, o.onstop = () => {
					a(new Blob(s, { type: "audio/webm" }));
				}, o.onerror = () => {
					c(/* @__PURE__ */ Error("MediaRecorder error occurred"));
				}, o.start(1e3), i.currentRecorder = o;
			});
		} catch (i) {
			let a = i instanceof Error ? i.message : "Unknown error occurred";
			throw Error("Failed to start recording: " + a);
		}
	};
	return i.stop = () => {
		let a = i.currentRecorder;
		a && a.state !== "inactive" && a.stop(), delete i.currentRecorder;
	}, i;
})();
function useAudioRecording({ transcribeAudio: i, onTranscriptionComplete: a }) {
	let [o, s] = useState(!1), [c, l] = useState(!!i), [u, d] = useState(!1), [f, p] = useState(!1), [m, h] = useState(null), g = useRef(null);
	useEffect(() => {
		(async () => {
			l(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !!i);
		})();
	}, [i]);
	let _ = async () => {
		d(!1), p(!0);
		try {
			recordAudio.stop();
			let o = await g.current;
			if (i) {
				let s = await i(o);
				a?.(s);
			}
		} catch (i) {
			console.error("Error transcribing audio:", i);
		} finally {
			p(!1), s(!1), m && (m.getTracks().forEach((i) => i.stop()), h(null)), g.current = null;
		}
	};
	return {
		isListening: o,
		isSpeechSupported: c,
		isRecording: u,
		isTranscribing: f,
		audioStream: m,
		toggleListening: async () => {
			if (o) await _();
			else try {
				s(!0), d(!0);
				let i = await navigator.mediaDevices.getUserMedia({ audio: !0 });
				h(i), g.current = recordAudio(i);
			} catch (i) {
				console.error("Error recording audio:", i), s(!1), d(!1), m && (m.getTracks().forEach((i) => i.stop()), h(null));
			}
		},
		stopRecording: _
	};
}
function useAutosizeTextArea({ ref: i, maxHeight: a = 2 ** 53 - 1, borderWidth: o = 0, dependencies: s }) {
	let c = useRef(null);
	useLayoutEffect(() => {
		if (!i.current) return;
		let s = i.current, l = o * 2;
		c.current === null && (c.current = s.scrollHeight - l), s.style.removeProperty("height");
		let u = s.scrollHeight, d = Math.min(u, a), f = Math.max(d, c.current);
		s.style.height = `${f + l}px`;
	}, [
		a,
		i,
		...s
	]);
}
var AUDIO_CONFIG = {
	FFT_SIZE: 512,
	SMOOTHING: .8,
	MIN_BAR_HEIGHT: 2,
	MIN_BAR_WIDTH: 2,
	BAR_SPACING: 1,
	COLOR: {
		MIN_INTENSITY: 100,
		MAX_INTENSITY: 255,
		INTENSITY_RANGE: 155
	}
};
function AudioVisualizer({ stream: i, isRecording: a, onClick: o }) {
	let s = useRef(null), c = useRef(null), l = useRef(null), u = useRef(null), d = useRef(null), f = () => {
		u.current && cancelAnimationFrame(u.current), c.current && c.current.close();
	};
	useEffect(() => f, []), useEffect(() => {
		i && a ? p() : f();
	}, [i, a]), useEffect(() => {
		let i = () => {
			if (s.current && d.current) {
				let i = d.current, a = s.current, o = window.devicePixelRatio || 1, c = i.getBoundingClientRect();
				a.width = (c.width - 2) * o, a.height = (c.height - 2) * o, a.style.width = `${c.width - 2}px`, a.style.height = `${c.height - 2}px`;
			}
		};
		return window.addEventListener("resize", i), i(), () => window.removeEventListener("resize", i);
	}, []);
	let p = async () => {
		try {
			let a = new AudioContext();
			c.current = a;
			let o = a.createAnalyser();
			o.fftSize = AUDIO_CONFIG.FFT_SIZE, o.smoothingTimeConstant = AUDIO_CONFIG.SMOOTHING, l.current = o, a.createMediaStreamSource(i).connect(o), g();
		} catch (i) {
			console.error("Error starting visualization:", i);
		}
	}, m = (i) => {
		let a = Math.floor(i * AUDIO_CONFIG.COLOR.INTENSITY_RANGE) + AUDIO_CONFIG.COLOR.MIN_INTENSITY;
		return `rgb(${a}, ${a}, ${a})`;
	}, h = (i, a, o, s, c, l) => {
		i.fillStyle = l, i.fillRect(a, o - c, s, c), i.fillRect(a, o, s, c);
	}, g = () => {
		if (!a) return;
		let i = s.current, o = i?.getContext("2d");
		if (!i || !o || !l.current) return;
		let c = window.devicePixelRatio || 1;
		o.scale(c, c);
		let d = l.current, f = d.frequencyBinCount, p = new Uint8Array(f), g = () => {
			u.current = requestAnimationFrame(g), d.getByteFrequencyData(p), o.clearRect(0, 0, i.width / c, i.height / c);
			let a = Math.max(AUDIO_CONFIG.MIN_BAR_WIDTH, i.width / c / f - AUDIO_CONFIG.BAR_SPACING), s = i.height / c / 2, l = 0;
			for (let i = 0; i < f; i++) {
				let c = p[i] / 255, u = Math.max(AUDIO_CONFIG.MIN_BAR_HEIGHT, c * s);
				h(o, l, s, a, u, m(c)), l += a + AUDIO_CONFIG.BAR_SPACING;
			}
		};
		g();
	};
	return /* @__PURE__ */ jsx("div", {
		ref: d,
		className: "h-full w-full cursor-pointer rounded-lg bg-background/80 backdrop-blur",
		onClick: o,
		children: /* @__PURE__ */ jsx("canvas", {
			ref: s,
			className: "h-full w-full"
		})
	});
}
const FilePreview = React.forwardRef((i, a) => i.file.type.startsWith("image/") ? /* @__PURE__ */ jsx(ImageFilePreview, {
	...i,
	ref: a
}) : i.file.type.startsWith("text/") || i.file.name.endsWith(".txt") || i.file.name.endsWith(".md") ? /* @__PURE__ */ jsx(TextFilePreview, {
	...i,
	ref: a
}) : /* @__PURE__ */ jsx(GenericFilePreview, {
	...i,
	ref: a
}));
FilePreview.displayName = "FilePreview";
var ImageFilePreview = React.forwardRef(({ file: i, onRemove: a }, o) => /* @__PURE__ */ jsxs(motion.div, {
	ref: o,
	className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
	layout: !0,
	initial: {
		opacity: 0,
		y: "100%"
	},
	animate: {
		opacity: 1,
		y: 0
	},
	exit: {
		opacity: 0,
		y: "100%"
	},
	children: [/* @__PURE__ */ jsxs("div", {
		className: "flex w-full items-center space-x-2",
		children: [/* @__PURE__ */ jsx("img", {
			alt: `Attachment ${i.name}`,
			className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover",
			src: URL.createObjectURL(i)
		}), /* @__PURE__ */ jsx("span", {
			className: "w-full truncate text-muted-foreground",
			children: i.name
		})]
	}), a ? /* @__PURE__ */ jsx("button", {
		className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
		type: "button",
		onClick: a,
		"aria-label": "Remove attachment",
		children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
	}) : null]
}));
ImageFilePreview.displayName = "ImageFilePreview";
var TextFilePreview = React.forwardRef(({ file: i, onRemove: a }, o) => {
	let [s, c] = React.useState("");
	return useEffect(() => {
		let a = new FileReader();
		a.onload = (i) => {
			let a = i.target?.result;
			c(a.slice(0, 50) + (a.length > 50 ? "..." : ""));
		}, a.readAsText(i);
	}, [i]), /* @__PURE__ */ jsxs(motion.div, {
		ref: o,
		className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
		layout: !0,
		initial: {
			opacity: 0,
			y: "100%"
		},
		animate: {
			opacity: 1,
			y: 0
		},
		exit: {
			opacity: 0,
			y: "100%"
		},
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex w-full items-center space-x-2",
			children: [/* @__PURE__ */ jsx("div", {
				className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5",
				children: /* @__PURE__ */ jsx("div", {
					className: "h-full w-full overflow-hidden text-[6px] leading-none text-muted-foreground",
					children: s || "Loading..."
				})
			}), /* @__PURE__ */ jsx("span", {
				className: "w-full truncate text-muted-foreground",
				children: i.name
			})]
		}), a ? /* @__PURE__ */ jsx("button", {
			className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
			type: "button",
			onClick: a,
			"aria-label": "Remove attachment",
			children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
		}) : null]
	});
});
TextFilePreview.displayName = "TextFilePreview";
var GenericFilePreview = React.forwardRef(({ file: i, onRemove: a }, o) => /* @__PURE__ */ jsxs(motion.div, {
	ref: o,
	className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
	layout: !0,
	initial: {
		opacity: 0,
		y: "100%"
	},
	animate: {
		opacity: 1,
		y: 0
	},
	exit: {
		opacity: 0,
		y: "100%"
	},
	children: [/* @__PURE__ */ jsxs("div", {
		className: "flex w-full items-center space-x-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted",
			children: /* @__PURE__ */ jsx(File$1, { className: "h-6 w-6 text-foreground" })
		}), /* @__PURE__ */ jsx("span", {
			className: "w-full truncate text-muted-foreground",
			children: i.name
		})]
	}), a ? /* @__PURE__ */ jsx("button", {
		className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
		type: "button",
		onClick: a,
		"aria-label": "Remove attachment",
		children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
	}) : null]
}));
GenericFilePreview.displayName = "GenericFilePreview";
function InterruptPrompt({ isOpen: i, close: a }) {
	return /* @__PURE__ */ jsx(AnimatePresence, { children: i && /* @__PURE__ */ jsxs(motion.div, {
		initial: {
			top: 0,
			filter: "blur(5px)"
		},
		animate: {
			top: -40,
			filter: "blur(0px)",
			transition: {
				type: "spring",
				filter: { type: "tween" }
			}
		},
		exit: {
			top: 0,
			filter: "blur(5px)"
		},
		className: "absolute left-1/2 flex -translate-x-1/2 overflow-hidden whitespace-nowrap rounded-full border bg-background py-1 text-center text-sm text-muted-foreground",
		children: [/* @__PURE__ */ jsx("span", {
			className: "ml-2.5",
			children: "Press Enter again to interrupt"
		}), /* @__PURE__ */ jsx("button", {
			className: "ml-1 mr-2.5 flex items-center",
			type: "button",
			onClick: a,
			"aria-label": "Close",
			children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
		})]
	}) });
}
function MessageInput({ placeholder: i = "Ask AI...", className: a, onKeyDown: o, submitOnEnter: s = !0, stop: c, isGenerating: l, enableInterrupt: u = !0, transcribeAudio: d, ...f }) {
	let [p, m] = useState(!1), [h, g] = useState(!1), { isListening: _, isSpeechSupported: v, isRecording: y, isTranscribing: b, audioStream: x, toggleListening: S, stopRecording: C } = useAudioRecording({
		transcribeAudio: d,
		onTranscriptionComplete: (i) => {
			f.onChange?.({ target: { value: i } });
		}
	});
	useEffect(() => {
		l || g(!1);
	}, [l]);
	let w = (i) => {
		f.allowAttachments && f.setFiles((a) => a === null ? i : i === null ? a : [...a, ...i]);
	}, T = (i) => {
		f.allowAttachments === !0 && (i.preventDefault(), m(!0));
	}, E = (i) => {
		f.allowAttachments === !0 && (i.preventDefault(), m(!1));
	}, D = (i) => {
		if (m(!1), f.allowAttachments !== !0) return;
		i.preventDefault();
		let a = i.dataTransfer;
		a.files.length && w(Array.from(a.files));
	}, O = (i) => {
		let a = i.clipboardData?.items;
		if (!a) return;
		let o = i.clipboardData.getData("text");
		if (o && o.length > 500 && f.allowAttachments) {
			i.preventDefault();
			let a = new Blob([o], { type: "text/plain" });
			w([new File([a], "Pasted text", {
				type: "text/plain",
				lastModified: Date.now()
			})]);
			return;
		}
		let s = Array.from(a).map((i) => i.getAsFile()).filter((i) => i !== null);
		f.allowAttachments && s.length > 0 && w(s);
	}, A = (i) => {
		if (s && i.key === "Enter" && !i.shiftKey) {
			if (i.preventDefault(), l && c && u) {
				if (h) c(), g(!1), i.currentTarget.form?.requestSubmit();
				else if (f.value || f.allowAttachments && f.files?.length) {
					g(!0);
					return;
				}
			}
			i.currentTarget.form?.requestSubmit();
		}
		o?.(i);
	}, j = useRef(null), [M, N] = useState(0);
	useEffect(() => {
		j.current && N(j.current.offsetHeight);
	}, [f.value]);
	let I = f.allowAttachments && f.files && f.files.length > 0;
	return useAutosizeTextArea({
		ref: j,
		maxHeight: 240,
		borderWidth: 1,
		dependencies: [f.value, I]
	}), /* @__PURE__ */ jsxs("div", {
		className: "relative flex w-full",
		onDragOver: T,
		onDragLeave: E,
		onDrop: D,
		children: [
			u && /* @__PURE__ */ jsx(InterruptPrompt, {
				isOpen: h,
				close: () => g(!1)
			}),
			/* @__PURE__ */ jsx(RecordingPrompt, {
				isVisible: y,
				onStopRecording: C
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative flex w-full items-center space-x-2",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative flex-1 group/input",
					children: [/* @__PURE__ */ jsx("textarea", {
						"aria-label": "Write your prompt here",
						placeholder: i,
						ref: j,
						onPaste: O,
						onKeyDown: A,
						className: cn("z-10 w-full grow border border-muted-foreground border-2 resize-none rounded-2xl border-none bg-muted/80 backdrop-blur-xl p-4 pr-32 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xl shadow-primary/5", I && "pb-20", a),
						...f.allowAttachments ? n(f, [
							"allowAttachments",
							"files",
							"setFiles"
						]) : n(f, ["allowAttachments"])
					}), f.allowAttachments && I && /* @__PURE__ */ jsx("div", {
						className: "absolute inset-x-3 bottom-0 z-20 overflow-x-scroll py-3",
						children: /* @__PURE__ */ jsx("div", {
							className: "flex space-x-3",
							children: /* @__PURE__ */ jsx(AnimatePresence, {
								mode: "popLayout",
								children: f.files?.map((i) => /* @__PURE__ */ jsx(FilePreview, {
									file: i,
									onRemove: () => {
										f.setFiles((a) => {
											if (!a) return null;
											let o = Array.from(a).filter((a) => a !== i);
											return o.length === 0 ? null : o;
										});
									}
								}, i.name + String(i.lastModified)))
							})
						})
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "absolute right-3 bottom-3 z-20 flex items-center gap-2",
				children: [
					f.allowAttachments && /* @__PURE__ */ jsx(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						className: "h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-xl",
						"aria-label": "Attach a file",
						onClick: async () => {
							w(await showFileUploadDialog());
						},
						children: /* @__PURE__ */ jsx(Paperclip, { className: "h-4.5 w-4.5" })
					}),
					v && /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "ghost",
						className: cn("h-9 w-9 rounded-xl", _ ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"),
						"aria-label": "Voice input",
						size: "icon",
						onClick: S,
						children: /* @__PURE__ */ jsx(Mic, { className: "h-4.5 w-4.5" })
					}),
					l && c ? /* @__PURE__ */ jsx(Button, {
						type: "button",
						size: "icon",
						className: "h-9 w-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 ring-1 ring-destructive/20",
						"aria-label": "Stop generating",
						onClick: c,
						children: /* @__PURE__ */ jsx(Square, {
							className: "h-3 w-3",
							fill: "currentColor"
						})
					}) : /* @__PURE__ */ jsx(Button, {
						type: "submit",
						size: "icon",
						className: cn("h-9 w-9 rounded-xl transition-all shadow-md active:scale-95", f.value === "" ? "bg-muted text-muted-foreground" : "bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground hover:shadow-primary/20"),
						"aria-label": "Send message",
						disabled: f.value === "" || l,
						children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-5 w-5" })
					})
				]
			}),
			f.allowAttachments && /* @__PURE__ */ jsx(FileUploadOverlay, { isDragging: p }),
			/* @__PURE__ */ jsx(RecordingControls, {
				isRecording: y,
				isTranscribing: b,
				audioStream: x,
				textAreaHeight: M,
				onStopRecording: C
			})
		]
	});
}
MessageInput.displayName = "MessageInput";
function FileUploadOverlay({ isDragging: i }) {
	return /* @__PURE__ */ jsx(AnimatePresence, { children: i && /* @__PURE__ */ jsxs(motion.div, {
		className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .2 },
		"aria-hidden": !0,
		children: [/* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", { children: "Drop your files here to attach them." })]
	}) });
}
function showFileUploadDialog() {
	let i = document.createElement("input");
	return i.type = "file", i.multiple = !0, i.accept = "*/*", i.click(), new Promise((a) => {
		i.onchange = (i) => {
			let o = i.currentTarget.files;
			if (o) {
				a(Array.from(o));
				return;
			}
			a(null);
		};
	});
}
function TranscribingOverlay() {
	return /* @__PURE__ */ jsxs(motion.div, {
		className: "flex h-full w-full flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .2 },
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative",
			children: [/* @__PURE__ */ jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }), /* @__PURE__ */ jsx(motion.div, {
				className: "absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-primary/20",
				initial: {
					scale: .8,
					opacity: 0
				},
				animate: {
					scale: 1.2,
					opacity: 1
				},
				transition: {
					duration: 1,
					repeat: Infinity,
					repeatType: "reverse",
					ease: "easeInOut"
				}
			})]
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-4 text-sm font-medium text-muted-foreground",
			children: "Transcribing audio..."
		})]
	});
}
function RecordingPrompt({ isVisible: i, onStopRecording: a }) {
	return /* @__PURE__ */ jsx(AnimatePresence, { children: i && /* @__PURE__ */ jsx(motion.div, {
		initial: {
			top: 0,
			filter: "blur(5px)"
		},
		animate: {
			top: -40,
			filter: "blur(0px)",
			transition: {
				type: "spring",
				filter: { type: "tween" }
			}
		},
		exit: {
			top: 0,
			filter: "blur(5px)"
		},
		className: "absolute left-1/2 flex -translate-x-1/2 cursor-pointer overflow-hidden whitespace-nowrap rounded-full border bg-background py-1 text-center text-sm text-muted-foreground",
		onClick: a,
		children: /* @__PURE__ */ jsxs("span", {
			className: "mx-2.5 flex items-center",
			children: [/* @__PURE__ */ jsx(Info, { className: "mr-2 h-3 w-3" }), "Click to finish recording"]
		})
	}) });
}
function RecordingControls({ isRecording: i, isTranscribing: a, audioStream: o, textAreaHeight: s, onStopRecording: c }) {
	return i ? /* @__PURE__ */ jsx("div", {
		className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
		style: { height: s - 2 },
		children: /* @__PURE__ */ jsx(AudioVisualizer, {
			stream: o,
			isRecording: i,
			onClick: c
		})
	}) : a ? /* @__PURE__ */ jsx("div", {
		className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
		style: { height: s - 2 },
		children: /* @__PURE__ */ jsx(TranscribingOverlay, {})
	}) : null;
}
typeof window < "u" && window.document && window.document.createElement;
function composeEventHandlers(i, a, { checkForDefaultPrevented: o = !0 } = {}) {
	return function(s) {
		if (i?.(s), o === !1 || !s.defaultPrevented) return a?.(s);
	};
}
function createContext2(i, a) {
	let o = React$1.createContext(a), s = (i) => {
		let { children: a, ...s } = i, c = React$1.useMemo(() => s, Object.values(s));
		return /* @__PURE__ */ jsx(o.Provider, {
			value: c,
			children: a
		});
	};
	s.displayName = i + "Provider";
	function c(s) {
		let c = React$1.useContext(o);
		if (c) return c;
		if (a !== void 0) return a;
		throw Error(`\`${s}\` must be used within \`${i}\``);
	}
	return [s, c];
}
function createContextScope(i, a = []) {
	let o = [];
	function s(a, s) {
		let c = React$1.createContext(s), l = o.length;
		o = [...o, s];
		let u = (a) => {
			let { scope: o, children: s, ...u } = a, d = o?.[i]?.[l] || c, f = React$1.useMemo(() => u, Object.values(u));
			return /* @__PURE__ */ jsx(d.Provider, {
				value: f,
				children: s
			});
		};
		u.displayName = a + "Provider";
		function d(o, u) {
			let d = u?.[i]?.[l] || c, f = React$1.useContext(d);
			if (f) return f;
			if (s !== void 0) return s;
			throw Error(`\`${o}\` must be used within \`${a}\``);
		}
		return [u, d];
	}
	let c = () => {
		let a = o.map((i) => React$1.createContext(i));
		return function(o) {
			let s = o?.[i] || a;
			return React$1.useMemo(() => ({ [`__scope${i}`]: {
				...o,
				[i]: s
			} }), [o, s]);
		};
	};
	return c.scopeName = i, [s, composeContextScopes(c, ...a)];
}
function composeContextScopes(...i) {
	let a = i[0];
	if (i.length === 1) return a;
	let o = () => {
		let o = i.map((i) => ({
			useScope: i(),
			scopeName: i.scopeName
		}));
		return function(i) {
			let s = o.reduce((a, { useScope: o, scopeName: s }) => {
				let c = o(i)[`__scope${s}`];
				return {
					...a,
					...c
				};
			}, {});
			return React$1.useMemo(() => ({ [`__scope${a.scopeName}`]: s }), [s]);
		};
	};
	return o.scopeName = a.scopeName, o;
}
var useLayoutEffect2 = globalThis?.document ? React$1.useLayoutEffect : () => {}, useInsertionEffect$1 = React$1.useInsertionEffect || useLayoutEffect2;
function useControllableState({ prop: i, defaultProp: a, onChange: o = () => {}, caller: s }) {
	let [c, l, u] = useUncontrolledState({
		defaultProp: a,
		onChange: o
	}), d = i !== void 0, f = d ? i : c;
	{
		let a = React$1.useRef(i !== void 0);
		React$1.useEffect(() => {
			let i = a.current;
			if (i !== d) {
				let a = i ? "controlled" : "uncontrolled", o = d ? "controlled" : "uncontrolled";
				console.warn(`${s} is changing from ${a} to ${o}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`);
			}
			a.current = d;
		}, [d, s]);
	}
	return [f, React$1.useCallback((a) => {
		if (d) {
			let o = isFunction(a) ? a(i) : a;
			o !== i && u.current?.(o);
		} else l(a);
	}, [
		d,
		i,
		l,
		u
	])];
}
function useUncontrolledState({ defaultProp: i, onChange: a }) {
	let [o, s] = React$1.useState(i), c = React$1.useRef(o), l = React$1.useRef(a);
	return useInsertionEffect$1(() => {
		l.current = a;
	}, [a]), React$1.useEffect(() => {
		c.current !== o && (l.current?.(o), c.current = o);
	}, [o, c]), [
		o,
		s,
		l
	];
}
function isFunction(i) {
	return typeof i == "function";
}
/* @__NO_SIDE_EFFECTS__ */
function createSlot$4(i) {
	let a = /* @__PURE__ */ createSlotClone$4(i), o = React$1.forwardRef((i, o) => {
		let { children: s, ...c } = i, l = React$1.Children.toArray(s), u = l.find(isSlottable$4);
		if (u) {
			let i = u.props.children, s = l.map((a) => a === u ? React$1.Children.count(i) > 1 ? React$1.Children.only(null) : React$1.isValidElement(i) ? i.props.children : null : a);
			return /* @__PURE__ */ jsx(a, {
				...c,
				ref: o,
				children: React$1.isValidElement(i) ? React$1.cloneElement(i, void 0, s) : null
			});
		}
		return /* @__PURE__ */ jsx(a, {
			...c,
			ref: o,
			children: s
		});
	});
	return o.displayName = `${i}.Slot`, o;
}
/* @__NO_SIDE_EFFECTS__ */
function createSlotClone$4(i) {
	let a = React$1.forwardRef((i, a) => {
		let { children: o, ...s } = i;
		if (React$1.isValidElement(o)) {
			let i = getElementRef$5(o), c = mergeProps$4(s, o.props);
			return o.type !== React$1.Fragment && (c.ref = a ? composeRefs(a, i) : i), React$1.cloneElement(o, c);
		}
		return React$1.Children.count(o) > 1 ? React$1.Children.only(null) : null;
	});
	return a.displayName = `${i}.SlotClone`, a;
}
var SLOTTABLE_IDENTIFIER$4 = Symbol("radix.slottable");
function isSlottable$4(i) {
	return React$1.isValidElement(i) && typeof i.type == "function" && "__radixId" in i.type && i.type.__radixId === SLOTTABLE_IDENTIFIER$4;
}
function mergeProps$4(i, a) {
	let o = { ...a };
	for (let s in a) {
		let c = i[s], l = a[s];
		/^on[A-Z]/.test(s) ? c && l ? o[s] = (...i) => {
			let a = l(...i);
			return c(...i), a;
		} : c && (o[s] = c) : s === "style" ? o[s] = {
			...c,
			...l
		} : s === "className" && (o[s] = [c, l].filter(Boolean).join(" "));
	}
	return {
		...i,
		...o
	};
}
function getElementRef$5(i) {
	let a = Object.getOwnPropertyDescriptor(i.props, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning;
	return o ? i.ref : (a = Object.getOwnPropertyDescriptor(i, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning, o ? i.props.ref : i.props.ref || i.ref);
}
var Primitive = [
	"a",
	"button",
	"div",
	"form",
	"h2",
	"h3",
	"img",
	"input",
	"label",
	"li",
	"nav",
	"ol",
	"p",
	"select",
	"span",
	"svg",
	"ul"
].reduce((i, a) => {
	let o = /* @__PURE__ */ createSlot$4(`Primitive.${a}`), s = React$1.forwardRef((i, s) => {
		let { asChild: c, ...l } = i, u = c ? o : a;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ jsx(u, {
			...l,
			ref: s
		});
	});
	return s.displayName = `Primitive.${a}`, {
		...i,
		[a]: s
	};
}, {});
function dispatchDiscreteCustomEvent(i, a) {
	i && ReactDOM$1.flushSync(() => i.dispatchEvent(a));
}
function useStateMachine(i, a) {
	return React$1.useReducer((i, o) => a[i][o] ?? i, i);
}
var Presence = (i) => {
	let { present: a, children: o } = i, s = usePresence(a), c = typeof o == "function" ? o({ present: s.isPresent }) : React$1.Children.only(o), l = useComposedRefs(s.ref, getElementRef$4(c));
	return typeof o == "function" || s.isPresent ? React$1.cloneElement(c, { ref: l }) : null;
};
Presence.displayName = "Presence";
function usePresence(i) {
	let [a, o] = React$1.useState(), s = React$1.useRef(null), c = React$1.useRef(i), l = React$1.useRef("none"), [u, d] = useStateMachine(i ? "mounted" : "unmounted", {
		mounted: {
			UNMOUNT: "unmounted",
			ANIMATION_OUT: "unmountSuspended"
		},
		unmountSuspended: {
			MOUNT: "mounted",
			ANIMATION_END: "unmounted"
		},
		unmounted: { MOUNT: "mounted" }
	});
	return React$1.useEffect(() => {
		let i = getAnimationName(s.current);
		l.current = u === "mounted" ? i : "none";
	}, [u]), useLayoutEffect2(() => {
		let a = s.current, o = c.current;
		if (o !== i) {
			let s = l.current, u = getAnimationName(a);
			i ? d("MOUNT") : u === "none" || a?.display === "none" ? d("UNMOUNT") : d(o && s !== u ? "ANIMATION_OUT" : "UNMOUNT"), c.current = i;
		}
	}, [i, d]), useLayoutEffect2(() => {
		if (a) {
			let i, o = a.ownerDocument.defaultView ?? window, u = (l) => {
				let u = getAnimationName(s.current).includes(CSS.escape(l.animationName));
				if (l.target === a && u && (d("ANIMATION_END"), !c.current)) {
					let s = a.style.animationFillMode;
					a.style.animationFillMode = "forwards", i = o.setTimeout(() => {
						a.style.animationFillMode === "forwards" && (a.style.animationFillMode = s);
					});
				}
			}, f = (i) => {
				i.target === a && (l.current = getAnimationName(s.current));
			};
			return a.addEventListener("animationstart", f), a.addEventListener("animationcancel", u), a.addEventListener("animationend", u), () => {
				o.clearTimeout(i), a.removeEventListener("animationstart", f), a.removeEventListener("animationcancel", u), a.removeEventListener("animationend", u);
			};
		} else d("ANIMATION_END");
	}, [a, d]), {
		isPresent: ["mounted", "unmountSuspended"].includes(u),
		ref: React$1.useCallback((i) => {
			s.current = i ? getComputedStyle(i) : null, o(i);
		}, [])
	};
}
function getAnimationName(i) {
	return i?.animationName || "none";
}
function getElementRef$4(i) {
	let a = Object.getOwnPropertyDescriptor(i.props, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning;
	return o ? i.ref : (a = Object.getOwnPropertyDescriptor(i, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning, o ? i.props.ref : i.props.ref || i.ref);
}
var useReactId = React$1.useId || (() => void 0), count$1 = 0;
function useId$1(i) {
	let [a, o] = React$1.useState(useReactId());
	return useLayoutEffect2(() => {
		i || o((i) => i ?? String(count$1++));
	}, [i]), i || (a ? `radix-${a}` : "");
}
var COLLAPSIBLE_NAME = "Collapsible", [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME), [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME), Collapsible$1 = React$1.forwardRef((i, a) => {
	let { __scopeCollapsible: o, open: s, defaultOpen: c, disabled: l, onOpenChange: u, ...d } = i, [f, p] = useControllableState({
		prop: s,
		defaultProp: c ?? !1,
		onChange: u,
		caller: COLLAPSIBLE_NAME
	});
	return /* @__PURE__ */ jsx(CollapsibleProvider, {
		scope: o,
		disabled: l,
		contentId: useId$1(),
		open: f,
		onOpenToggle: React$1.useCallback(() => p((i) => !i), [p]),
		children: /* @__PURE__ */ jsx(Primitive.div, {
			"data-state": getState$2(f),
			"data-disabled": l ? "" : void 0,
			...d,
			ref: a
		})
	});
});
Collapsible$1.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME$3 = "CollapsibleTrigger", CollapsibleTrigger$1 = React$1.forwardRef((i, a) => {
	let { __scopeCollapsible: o, ...s } = i, c = useCollapsibleContext(TRIGGER_NAME$3, o);
	return /* @__PURE__ */ jsx(Primitive.button, {
		type: "button",
		"aria-controls": c.contentId,
		"aria-expanded": c.open || !1,
		"data-state": getState$2(c.open),
		"data-disabled": c.disabled ? "" : void 0,
		disabled: c.disabled,
		...s,
		ref: a,
		onClick: composeEventHandlers(i.onClick, c.onOpenToggle)
	});
});
CollapsibleTrigger$1.displayName = TRIGGER_NAME$3;
var CONTENT_NAME$4 = "CollapsibleContent", CollapsibleContent$1 = React$1.forwardRef((i, a) => {
	let { forceMount: o, ...s } = i, c = useCollapsibleContext(CONTENT_NAME$4, i.__scopeCollapsible);
	return /* @__PURE__ */ jsx(Presence, {
		present: o || c.open,
		children: ({ present: i }) => /* @__PURE__ */ jsx(CollapsibleContentImpl, {
			...s,
			ref: a,
			present: i
		})
	});
});
CollapsibleContent$1.displayName = CONTENT_NAME$4;
var CollapsibleContentImpl = React$1.forwardRef((i, a) => {
	let { __scopeCollapsible: o, present: s, children: c, ...l } = i, u = useCollapsibleContext(CONTENT_NAME$4, o), [d, f] = React$1.useState(s), p = React$1.useRef(null), m = useComposedRefs(a, p), h = React$1.useRef(0), g = h.current, v = React$1.useRef(0), y = v.current, b = u.open || d, x = React$1.useRef(b), S = React$1.useRef(void 0);
	return React$1.useEffect(() => {
		let i = requestAnimationFrame(() => x.current = !1);
		return () => cancelAnimationFrame(i);
	}, []), useLayoutEffect2(() => {
		let i = p.current;
		if (i) {
			S.current = S.current || {
				transitionDuration: i.style.transitionDuration,
				animationName: i.style.animationName
			}, i.style.transitionDuration = "0s", i.style.animationName = "none";
			let a = i.getBoundingClientRect();
			h.current = a.height, v.current = a.width, x.current || (i.style.transitionDuration = S.current.transitionDuration, i.style.animationName = S.current.animationName), f(s);
		}
	}, [u.open, s]), /* @__PURE__ */ jsx(Primitive.div, {
		"data-state": getState$2(u.open),
		"data-disabled": u.disabled ? "" : void 0,
		id: u.contentId,
		hidden: !b,
		...l,
		ref: m,
		style: {
			"--radix-collapsible-content-height": g ? `${g}px` : void 0,
			"--radix-collapsible-content-width": y ? `${y}px` : void 0,
			...i.style
		},
		children: b && c
	});
});
function getState$2(i) {
	return i ? "open" : "closed";
}
var Root$2 = Collapsible$1;
function Collapsible({ ...i }) {
	return /* @__PURE__ */ jsx(Root$2, {
		"data-slot": "collapsible",
		...i
	});
}
function CollapsibleTrigger({ ...i }) {
	return /* @__PURE__ */ jsx(CollapsibleTrigger$1, {
		"data-slot": "collapsible-trigger",
		...i
	});
}
function CollapsibleContent({ ...i }) {
	return /* @__PURE__ */ jsx(CollapsibleContent$1, {
		"data-slot": "collapsible-content",
		...i
	});
}
var nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, emptyOptions$3 = {};
function name(i, a) {
	return ((a || emptyOptions$3).jsx ? nameReJsx : nameRe).test(i);
}
var require_cjs$2 = /* @__PURE__ */ __commonJSMin(((i, a) => {
	var o = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, s = /\n/g, c = /^\s*/, l = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, u = /^:\s*/, d = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, f = /^[;\s]*/, p = /^\s+|\s+$/g, m = "\n", h = "/", g = "*", _ = "", v = "comment", y = "declaration";
	function b(i, a) {
		if (typeof i != "string") throw TypeError("First argument must be a string");
		if (!i) return [];
		a ||= {};
		var p = 1, b = 1;
		function S(i) {
			var a = i.match(s);
			a && (p += a.length);
			var o = i.lastIndexOf(m);
			b = ~o ? i.length - o : b + i.length;
		}
		function C() {
			var i = {
				line: p,
				column: b
			};
			return function(a) {
				return a.position = new w(i), D(), a;
			};
		}
		function w(i) {
			this.start = i, this.end = {
				line: p,
				column: b
			}, this.source = a.source;
		}
		w.prototype.content = i;
		function T(o) {
			var s = /* @__PURE__ */ Error(a.source + ":" + p + ":" + b + ": " + o);
			if (s.reason = o, s.filename = a.source, s.line = p, s.column = b, s.source = i, !a.silent) throw s;
		}
		function E(a) {
			var o = a.exec(i);
			if (o) {
				var s = o[0];
				return S(s), i = i.slice(s.length), o;
			}
		}
		function D() {
			E(c);
		}
		function O(i) {
			var a;
			for (i ||= []; a = k();) a !== !1 && i.push(a);
			return i;
		}
		function k() {
			var a = C();
			if (!(h != i.charAt(0) || g != i.charAt(1))) {
				for (var o = 2; _ != i.charAt(o) && (g != i.charAt(o) || h != i.charAt(o + 1));) ++o;
				if (o += 2, _ === i.charAt(o - 1)) return T("End of comment missing");
				var s = i.slice(2, o - 2);
				return b += 2, S(s), i = i.slice(o), b += 2, a({
					type: v,
					comment: s
				});
			}
		}
		function A() {
			var i = C(), a = E(l);
			if (a) {
				if (k(), !E(u)) return T("property missing ':'");
				var s = E(d), c = i({
					type: y,
					property: x(a[0].replace(o, _)),
					value: s ? x(s[0].replace(o, _)) : _
				});
				return E(f), c;
			}
		}
		function j() {
			var i = [];
			O(i);
			for (var a; a = A();) a !== !1 && (i.push(a), O(i));
			return i;
		}
		return D(), j();
	}
	function x(i) {
		return i ? i.replace(p, _) : _;
	}
	a.exports = b;
})), require_cjs$1 = /* @__PURE__ */ __commonJSMin(((i) => {
	var a = i && i.__importDefault || function(i) {
		return i && i.__esModule ? i : { default: i };
	};
	Object.defineProperty(i, "__esModule", { value: !0 }), i.default = s;
	var o = a(require_cjs$2());
	function s(i, a) {
		let s = null;
		if (!i || typeof i != "string") return s;
		let c = (0, o.default)(i), l = typeof a == "function";
		return c.forEach((i) => {
			if (i.type !== "declaration") return;
			let { property: o, value: c } = i;
			l ? a(o, c, i) : c && (s ||= {}, s[o] = c);
		}), s;
	}
})), require_utilities = /* @__PURE__ */ __commonJSMin(((i) => {
	Object.defineProperty(i, "__esModule", { value: !0 }), i.camelCase = void 0;
	var a = /^--[a-zA-Z0-9_-]+$/, o = /-([a-z])/g, s = /^[^-]+$/, c = /^-(webkit|moz|ms|o|khtml)-/, l = /^-(ms)-/, u = function(i) {
		return !i || s.test(i) || a.test(i);
	}, d = function(i, a) {
		return a.toUpperCase();
	}, f = function(i, a) {
		return `${a}-`;
	};
	i.camelCase = function(i, a) {
		return a === void 0 && (a = {}), u(i) ? i : (i = i.toLowerCase(), i = a.reactCompat ? i.replace(l, f) : i.replace(c, f), i.replace(o, d));
	};
})), require_cjs = /* @__PURE__ */ __commonJSMin(((i, a) => {
	var o = (i && i.__importDefault || function(i) {
		return i && i.__esModule ? i : { default: i };
	})(require_cjs$1()), s = require_utilities();
	function c(i, a) {
		var c = {};
		return !i || typeof i != "string" || (0, o.default)(i, function(i, o) {
			i && o && (c[(0, s.camelCase)(i, a)] = o);
		}), c;
	}
	c.default = c, a.exports = c;
}));
const pointEnd = point$2("end"), pointStart = point$2("start");
function point$2(i) {
	return a;
	function a(a) {
		let o = a && a.position && a.position[i] || {};
		if (typeof o.line == "number" && o.line > 0 && typeof o.column == "number" && o.column > 0) return {
			line: o.line,
			column: o.column,
			offset: typeof o.offset == "number" && o.offset > -1 ? o.offset : void 0
		};
	}
}
function position(i) {
	let a = pointStart(i), o = pointEnd(i);
	if (a && o) return {
		start: a,
		end: o
	};
}
function stringifyPosition(i) {
	return !i || typeof i != "object" ? "" : "position" in i || "type" in i ? position$1(i.position) : "start" in i || "end" in i ? position$1(i) : "line" in i || "column" in i ? point$1(i) : "";
}
function point$1(i) {
	return index$1(i && i.line) + ":" + index$1(i && i.column);
}
function position$1(i) {
	return point$1(i && i.start) + "-" + point$1(i && i.end);
}
function index$1(i) {
	return i && typeof i == "number" ? i : 1;
}
var VFileMessage = class extends Error {
	constructor(i, a, o) {
		super(), typeof a == "string" && (o = a, a = void 0);
		let s = "", c = {}, l = !1;
		if (a && (c = "line" in a && "column" in a || "start" in a && "end" in a ? { place: a } : "type" in a ? {
			ancestors: [a],
			place: a.position
		} : { ...a }), typeof i == "string" ? s = i : !c.cause && i && (l = !0, s = i.message, c.cause = i), !c.ruleId && !c.source && typeof o == "string") {
			let i = o.indexOf(":");
			i === -1 ? c.ruleId = o : (c.source = o.slice(0, i), c.ruleId = o.slice(i + 1));
		}
		if (!c.place && c.ancestors && c.ancestors) {
			let i = c.ancestors[c.ancestors.length - 1];
			i && (c.place = i.position);
		}
		let u = c.place && "start" in c.place ? c.place.start : c.place;
		this.ancestors = c.ancestors || void 0, this.cause = c.cause || void 0, this.column = u ? u.column : void 0, this.fatal = void 0, this.file = "", this.message = s, this.line = u ? u.line : void 0, this.name = stringifyPosition(c.place) || "1:1", this.place = c.place || void 0, this.reason = this.message, this.ruleId = c.ruleId || void 0, this.source = c.source || void 0, this.stack = l && c.cause && typeof c.cause.stack == "string" ? c.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
	}
};
VFileMessage.prototype.file = "", VFileMessage.prototype.name = "", VFileMessage.prototype.reason = "", VFileMessage.prototype.message = "", VFileMessage.prototype.stack = "", VFileMessage.prototype.column = void 0, VFileMessage.prototype.line = void 0, VFileMessage.prototype.ancestors = void 0, VFileMessage.prototype.cause = void 0, VFileMessage.prototype.fatal = void 0, VFileMessage.prototype.place = void 0, VFileMessage.prototype.ruleId = void 0, VFileMessage.prototype.source = void 0;
var import_cjs = /* @__PURE__ */ __toESM(require_cjs(), 1), own$3 = {}.hasOwnProperty, emptyMap = /* @__PURE__ */ new Map(), cap = /[A-Z]/g, tableElements$1 = new Set([
	"table",
	"tbody",
	"thead",
	"tfoot",
	"tr"
]), tableCellElement = new Set(["td", "th"]), docs = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function toJsxRuntime(i, a) {
	if (!a || a.Fragment === void 0) throw TypeError("Expected `Fragment` in options");
	let o = a.filePath || void 0, s;
	if (a.development) {
		if (typeof a.jsxDEV != "function") throw TypeError("Expected `jsxDEV` in options when `development: true`");
		s = developmentCreate(o, a.jsxDEV);
	} else {
		if (typeof a.jsx != "function") throw TypeError("Expected `jsx` in production options");
		if (typeof a.jsxs != "function") throw TypeError("Expected `jsxs` in production options");
		s = productionCreate(o, a.jsx, a.jsxs);
	}
	let l = {
		Fragment: a.Fragment,
		ancestors: [],
		components: a.components || {},
		create: s,
		elementAttributeNameCase: a.elementAttributeNameCase || "react",
		evaluater: a.createEvaluater ? a.createEvaluater() : void 0,
		filePath: o,
		ignoreInvalidStyle: a.ignoreInvalidStyle || !1,
		passKeys: a.passKeys !== !1,
		passNode: a.passNode || !1,
		schema: a.space === "svg" ? svg : html$2,
		stylePropertyNameCase: a.stylePropertyNameCase || "dom",
		tableCellAlignToStyle: a.tableCellAlignToStyle !== !1
	}, u = one$1(l, i, void 0);
	return u && typeof u != "string" ? u : l.create(i, l.Fragment, { children: u || void 0 }, void 0);
}
function one$1(i, a, o) {
	if (a.type === "element") return element$1(i, a, o);
	if (a.type === "mdxFlowExpression" || a.type === "mdxTextExpression") return mdxExpression(i, a);
	if (a.type === "mdxJsxFlowElement" || a.type === "mdxJsxTextElement") return mdxJsxElement(i, a, o);
	if (a.type === "mdxjsEsm") return mdxEsm(i, a);
	if (a.type === "root") return root$2(i, a, o);
	if (a.type === "text") return text$5(i, a);
}
function element$1(i, a, o) {
	let s = i.schema, l = s;
	a.tagName.toLowerCase() === "svg" && s.space === "html" && (l = svg, i.schema = l), i.ancestors.push(a);
	let u = findComponentFromName(i, a.tagName, !1), d = createElementProps(i, a), f = createChildren(i, a);
	return tableElements$1.has(a.tagName) && (f = f.filter(function(i) {
		return typeof i == "string" ? !whitespace(i) : !0;
	})), addNode(i, d, u, a), addChildren(d, f), i.ancestors.pop(), i.schema = s, i.create(a, u, d, o);
}
function mdxExpression(i, a) {
	if (a.data && a.data.estree && i.evaluater) {
		let o = a.data.estree.body[0];
		return o.type, i.evaluater.evaluateExpression(o.expression);
	}
	crashEstree(i, a.position);
}
function mdxEsm(i, a) {
	if (a.data && a.data.estree && i.evaluater) return i.evaluater.evaluateProgram(a.data.estree);
	crashEstree(i, a.position);
}
function mdxJsxElement(i, a, o) {
	let s = i.schema, l = s;
	a.name === "svg" && s.space === "html" && (l = svg, i.schema = l), i.ancestors.push(a);
	let u = a.name === null ? i.Fragment : findComponentFromName(i, a.name, !0), d = createJsxElementProps(i, a), f = createChildren(i, a);
	return addNode(i, d, u, a), addChildren(d, f), i.ancestors.pop(), i.schema = s, i.create(a, u, d, o);
}
function root$2(i, a, o) {
	let s = {};
	return addChildren(s, createChildren(i, a)), i.create(a, i.Fragment, s, o);
}
function text$5(i, a) {
	return a.value;
}
function addNode(i, a, o, s) {
	typeof o != "string" && o !== i.Fragment && i.passNode && (a.node = s);
}
function addChildren(i, a) {
	if (a.length > 0) {
		let o = a.length > 1 ? a : a[0];
		o && (i.children = o);
	}
}
function productionCreate(i, a, o) {
	return s;
	function s(i, s, c, l) {
		let u = Array.isArray(c.children) ? o : a;
		return l ? u(s, c, l) : u(s, c);
	}
}
function developmentCreate(i, a) {
	return o;
	function o(o, s, c, l) {
		let u = Array.isArray(c.children), d = pointStart(o);
		return a(s, c, l, u, {
			columnNumber: d ? d.column - 1 : void 0,
			fileName: i,
			lineNumber: d ? d.line : void 0
		}, void 0);
	}
}
function createElementProps(i, a) {
	let o = {}, s, c;
	for (c in a.properties) if (c !== "children" && own$3.call(a.properties, c)) {
		let l = createProperty(i, c, a.properties[c]);
		if (l) {
			let [c, u] = l;
			i.tableCellAlignToStyle && c === "align" && typeof u == "string" && tableCellElement.has(a.tagName) ? s = u : o[c] = u;
		}
	}
	if (s) {
		let a = o.style ||= {};
		a[i.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = s;
	}
	return o;
}
function createJsxElementProps(i, a) {
	let o = {};
	for (let s of a.attributes) if (s.type === "mdxJsxExpressionAttribute") if (s.data && s.data.estree && i.evaluater) {
		let a = s.data.estree.body[0];
		a.type;
		let c = a.expression;
		c.type;
		let l = c.properties[0];
		l.type, Object.assign(o, i.evaluater.evaluateExpression(l.argument));
	} else crashEstree(i, a.position);
	else {
		let c = s.name, l;
		if (s.value && typeof s.value == "object") if (s.value.data && s.value.data.estree && i.evaluater) {
			let a = s.value.data.estree.body[0];
			a.type, l = i.evaluater.evaluateExpression(a.expression);
		} else crashEstree(i, a.position);
		else l = s.value === null ? !0 : s.value;
		o[c] = l;
	}
	return o;
}
function createChildren(i, a) {
	let o = [], s = -1, c = i.passKeys ? /* @__PURE__ */ new Map() : emptyMap;
	for (; ++s < a.children.length;) {
		let l = a.children[s], u;
		if (i.passKeys) {
			let i = l.type === "element" ? l.tagName : l.type === "mdxJsxFlowElement" || l.type === "mdxJsxTextElement" ? l.name : void 0;
			if (i) {
				let a = c.get(i) || 0;
				u = i + "-" + a, c.set(i, a + 1);
			}
		}
		let d = one$1(i, l, u);
		d !== void 0 && o.push(d);
	}
	return o;
}
function createProperty(o, s, c) {
	let l = find(o.schema, s);
	if (!(c == null || typeof c == "number" && Number.isNaN(c))) {
		if (Array.isArray(c) && (c = l.commaSeparated ? stringify(c) : stringify$1(c)), l.property === "style") {
			let i = typeof c == "object" ? c : parseStyle(o, String(c));
			return o.stylePropertyNameCase === "css" && (i = transformStylesToCssCasing(i)), ["style", i];
		}
		return [o.elementAttributeNameCase === "react" && l.space ? hastToReact[l.property] || l.property : l.attribute, c];
	}
}
function parseStyle(i, a) {
	try {
		return (0, import_cjs.default)(a, { reactCompat: !0 });
	} catch (a) {
		if (i.ignoreInvalidStyle) return {};
		let o = a, s = new VFileMessage("Cannot parse `style` attribute", {
			ancestors: i.ancestors,
			cause: o,
			ruleId: "style",
			source: "hast-util-to-jsx-runtime"
		});
		throw s.file = i.filePath || void 0, s.url = docs + "#cannot-parse-style-attribute", s;
	}
}
function findComponentFromName(i, a, o) {
	let s;
	if (!o) s = {
		type: "Literal",
		value: a
	};
	else if (a.includes(".")) {
		let i = a.split("."), o = -1, c;
		for (; ++o < i.length;) {
			let a = name(i[o]) ? {
				type: "Identifier",
				name: i[o]
			} : {
				type: "Literal",
				value: i[o]
			};
			c = c ? {
				type: "MemberExpression",
				object: c,
				property: a,
				computed: !!(o && a.type === "Literal"),
				optional: !1
			} : a;
		}
		s = c;
	} else s = name(a) && !/^[a-z]/.test(a) ? {
		type: "Identifier",
		name: a
	} : {
		type: "Literal",
		value: a
	};
	if (s.type === "Literal") {
		let a = s.value;
		return own$3.call(i.components, a) ? i.components[a] : a;
	}
	if (i.evaluater) return i.evaluater.evaluateExpression(s);
	crashEstree(i);
}
function crashEstree(i, a) {
	let o = new VFileMessage("Cannot handle MDX estrees without `createEvaluater`", {
		ancestors: i.ancestors,
		place: a,
		ruleId: "mdx-estree",
		source: "hast-util-to-jsx-runtime"
	});
	throw o.file = i.filePath || void 0, o.url = docs + "#cannot-handle-mdx-estrees-without-createevaluater", o;
}
function transformStylesToCssCasing(i) {
	let a = {}, o;
	for (o in i) own$3.call(i, o) && (a[transformStyleToCssCasing(o)] = i[o]);
	return a;
}
function transformStyleToCssCasing(i) {
	let a = i.replace(cap, toDash);
	return a.slice(0, 3) === "ms-" && (a = "-" + a), a;
}
function toDash(i) {
	return "-" + i.toLowerCase();
}
const urlAttributes = {
	action: ["form"],
	cite: [
		"blockquote",
		"del",
		"ins",
		"q"
	],
	data: ["object"],
	formAction: ["button", "input"],
	href: [
		"a",
		"area",
		"base",
		"link"
	],
	icon: ["menuitem"],
	itemId: null,
	manifest: ["html"],
	ping: ["a", "area"],
	poster: ["video"],
	src: [
		"audio",
		"embed",
		"iframe",
		"img",
		"input",
		"script",
		"source",
		"track",
		"video"
	]
};
var emptyOptions$2 = {};
function toString(i, a) {
	let o = a || emptyOptions$2;
	return one(i, typeof o.includeImageAlt == "boolean" ? o.includeImageAlt : !0, typeof o.includeHtml == "boolean" ? o.includeHtml : !0);
}
function one(i, a, o) {
	if (node(i)) {
		if ("value" in i) return i.type === "html" && !o ? "" : i.value;
		if (a && "alt" in i && i.alt) return i.alt;
		if ("children" in i) return all(i.children, a, o);
	}
	return Array.isArray(i) ? all(i, a, o) : "";
}
function all(i, a, o) {
	let s = [], c = -1;
	for (; ++c < i.length;) s[c] = one(i[c], a, o);
	return s.join("");
}
function node(i) {
	return !!(i && typeof i == "object");
}
var element = document.createElement("i");
function decodeNamedCharacterReference(i) {
	let a = "&" + i + ";";
	element.innerHTML = a;
	let o = element.textContent;
	return o.charCodeAt(o.length - 1) === 59 && i !== "semi" || o === a ? !1 : o;
}
function splice(i, a, o, s) {
	let c = i.length, l = 0, u;
	if (a = a < 0 ? -a > c ? 0 : c + a : a > c ? c : a, o = o > 0 ? o : 0, s.length < 1e4) u = Array.from(s), u.unshift(a, o), i.splice(...u);
	else for (o && i.splice(a, o); l < s.length;) u = s.slice(l, l + 1e4), u.unshift(a, 0), i.splice(...u), l += 1e4, a += 1e4;
}
function push(i, a) {
	return i.length > 0 ? (splice(i, i.length, 0, a), i) : a;
}
var hasOwnProperty = {}.hasOwnProperty;
function combineExtensions(i) {
	let a = {}, o = -1;
	for (; ++o < i.length;) syntaxExtension(a, i[o]);
	return a;
}
function syntaxExtension(i, a) {
	let o;
	for (o in a) {
		let s = (hasOwnProperty.call(i, o) ? i[o] : void 0) || (i[o] = {}), c = a[o], l;
		if (c) for (l in c) {
			hasOwnProperty.call(s, l) || (s[l] = []);
			let i = c[l];
			constructs(s[l], Array.isArray(i) ? i : i ? [i] : []);
		}
	}
}
function constructs(i, a) {
	let o = -1, s = [];
	for (; ++o < a.length;) (a[o].add === "after" ? i : s).push(a[o]);
	splice(i, 0, 0, s);
}
function decodeNumericCharacterReference(i, a) {
	let o = Number.parseInt(i, a);
	return o < 9 || o === 11 || o > 13 && o < 32 || o > 126 && o < 160 || o > 55295 && o < 57344 || o > 64975 && o < 65008 || (o & 65535) == 65535 || (o & 65535) == 65534 || o > 1114111 ? "�" : String.fromCodePoint(o);
}
function normalizeIdentifier(i) {
	return i.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const asciiAlpha = regexCheck(/[A-Za-z]/), asciiAlphanumeric = regexCheck(/[\dA-Za-z]/), asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
function asciiControl(i) {
	return i !== null && (i < 32 || i === 127);
}
const asciiDigit = regexCheck(/\d/), asciiHexDigit = regexCheck(/[\dA-Fa-f]/), asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
function markdownLineEnding(i) {
	return i !== null && i < -2;
}
function markdownLineEndingOrSpace(i) {
	return i !== null && (i < 0 || i === 32);
}
function markdownSpace(i) {
	return i === -2 || i === -1 || i === 32;
}
const unicodePunctuation = regexCheck(/\p{P}|\p{S}/u), unicodeWhitespace = regexCheck(/\s/);
function regexCheck(i) {
	return a;
	function a(a) {
		return a !== null && a > -1 && i.test(String.fromCharCode(a));
	}
}
function normalizeUri(i) {
	let a = [], o = -1, s = 0, c = 0;
	for (; ++o < i.length;) {
		let l = i.charCodeAt(o), u = "";
		if (l === 37 && asciiAlphanumeric(i.charCodeAt(o + 1)) && asciiAlphanumeric(i.charCodeAt(o + 2))) c = 2;
		else if (l < 128) /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(l)) || (u = String.fromCharCode(l));
		else if (l > 55295 && l < 57344) {
			let a = i.charCodeAt(o + 1);
			l < 56320 && a > 56319 && a < 57344 ? (u = String.fromCharCode(l, a), c = 1) : u = "�";
		} else u = String.fromCharCode(l);
		u &&= (a.push(i.slice(s, o), encodeURIComponent(u)), s = o + c + 1, ""), c &&= (o += c, 0);
	}
	return a.join("") + i.slice(s);
}
function factorySpace(i, a, o, s) {
	let c = s ? s - 1 : Infinity, l = 0;
	return u;
	function u(s) {
		return markdownSpace(s) ? (i.enter(o), d(s)) : a(s);
	}
	function d(s) {
		return markdownSpace(s) && l++ < c ? (i.consume(s), d) : (i.exit(o), a(s));
	}
}
const content = { tokenize: initializeContent };
function initializeContent(i) {
	let a = i.attempt(this.parser.constructs.contentInitial, s, c), o;
	return a;
	function s(o) {
		if (o === null) {
			i.consume(o);
			return;
		}
		return i.enter("lineEnding"), i.consume(o), i.exit("lineEnding"), factorySpace(i, a, "linePrefix");
	}
	function c(a) {
		return i.enter("paragraph"), l(a);
	}
	function l(a) {
		let s = i.enter("chunkText", {
			contentType: "text",
			previous: o
		});
		return o && (o.next = s), o = s, u(a);
	}
	function u(a) {
		if (a === null) {
			i.exit("chunkText"), i.exit("paragraph"), i.consume(a);
			return;
		}
		return markdownLineEnding(a) ? (i.consume(a), i.exit("chunkText"), l) : (i.consume(a), u);
	}
}
const document$1 = { tokenize: initializeDocument };
var containerConstruct = { tokenize: tokenizeContainer };
function initializeDocument(i) {
	let a = this, o = [], s = 0, c, l, u;
	return d;
	function d(c) {
		if (s < o.length) {
			let l = o[s];
			return a.containerState = l[1], i.attempt(l[0].continuation, f, p)(c);
		}
		return p(c);
	}
	function f(i) {
		if (s++, a.containerState._closeFlow) {
			a.containerState._closeFlow = void 0, c && S();
			let o = a.events.length, l = o, u;
			for (; l--;) if (a.events[l][0] === "exit" && a.events[l][1].type === "chunkFlow") {
				u = a.events[l][1].end;
				break;
			}
			x(s);
			let d = o;
			for (; d < a.events.length;) a.events[d][1].end = { ...u }, d++;
			return splice(a.events, l + 1, 0, a.events.slice(o)), a.events.length = d, p(i);
		}
		return d(i);
	}
	function p(l) {
		if (s === o.length) {
			if (!c) return g(l);
			if (c.currentConstruct && c.currentConstruct.concrete) return v(l);
			a.interrupt = !!(c.currentConstruct && !c._gfmTableDynamicInterruptHack);
		}
		return a.containerState = {}, i.check(containerConstruct, m, h)(l);
	}
	function m(i) {
		return c && S(), x(s), g(i);
	}
	function h(i) {
		return a.parser.lazy[a.now().line] = s !== o.length, u = a.now().offset, v(i);
	}
	function g(o) {
		return a.containerState = {}, i.attempt(containerConstruct, _, v)(o);
	}
	function _(i) {
		return s++, o.push([a.currentConstruct, a.containerState]), g(i);
	}
	function v(o) {
		if (o === null) {
			c && S(), x(0), i.consume(o);
			return;
		}
		return c ||= a.parser.flow(a.now()), i.enter("chunkFlow", {
			_tokenizer: c,
			contentType: "flow",
			previous: l
		}), y(o);
	}
	function y(o) {
		if (o === null) {
			b(i.exit("chunkFlow"), !0), x(0), i.consume(o);
			return;
		}
		return markdownLineEnding(o) ? (i.consume(o), b(i.exit("chunkFlow")), s = 0, a.interrupt = void 0, d) : (i.consume(o), y);
	}
	function b(i, o) {
		let d = a.sliceStream(i);
		if (o && d.push(null), i.previous = l, l && (l.next = i), l = i, c.defineSkip(i.start), c.write(d), a.parser.lazy[i.start.line]) {
			let i = c.events.length;
			for (; i--;) if (c.events[i][1].start.offset < u && (!c.events[i][1].end || c.events[i][1].end.offset > u)) return;
			let o = a.events.length, l = o, d, f;
			for (; l--;) if (a.events[l][0] === "exit" && a.events[l][1].type === "chunkFlow") {
				if (d) {
					f = a.events[l][1].end;
					break;
				}
				d = !0;
			}
			for (x(s), i = o; i < a.events.length;) a.events[i][1].end = { ...f }, i++;
			splice(a.events, l + 1, 0, a.events.slice(o)), a.events.length = i;
		}
	}
	function x(s) {
		let c = o.length;
		for (; c-- > s;) {
			let s = o[c];
			a.containerState = s[1], s[0].exit.call(a, i);
		}
		o.length = s;
	}
	function S() {
		c.write([null]), l = void 0, c = void 0, a.containerState._closeFlow = void 0;
	}
}
function tokenizeContainer(i, a, o) {
	return factorySpace(i, i.attempt(this.parser.constructs.document, a, o), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function classifyCharacter(i) {
	if (i === null || markdownLineEndingOrSpace(i) || unicodeWhitespace(i)) return 1;
	if (unicodePunctuation(i)) return 2;
}
function resolveAll(i, a, o) {
	let s = [], c = -1;
	for (; ++c < i.length;) {
		let l = i[c].resolveAll;
		l && !s.includes(l) && (a = l(a, o), s.push(l));
	}
	return a;
}
const attention = {
	name: "attention",
	resolveAll: resolveAllAttention,
	tokenize: tokenizeAttention
};
function resolveAllAttention(i, a) {
	let o = -1, s, c, l, u, d, f, p, m;
	for (; ++o < i.length;) if (i[o][0] === "enter" && i[o][1].type === "attentionSequence" && i[o][1]._close) {
		for (s = o; s--;) if (i[s][0] === "exit" && i[s][1].type === "attentionSequence" && i[s][1]._open && a.sliceSerialize(i[s][1]).charCodeAt(0) === a.sliceSerialize(i[o][1]).charCodeAt(0)) {
			if ((i[s][1]._close || i[o][1]._open) && (i[o][1].end.offset - i[o][1].start.offset) % 3 && !((i[s][1].end.offset - i[s][1].start.offset + i[o][1].end.offset - i[o][1].start.offset) % 3)) continue;
			f = i[s][1].end.offset - i[s][1].start.offset > 1 && i[o][1].end.offset - i[o][1].start.offset > 1 ? 2 : 1;
			let h = { ...i[s][1].end }, g = { ...i[o][1].start };
			movePoint(h, -f), movePoint(g, f), u = {
				type: f > 1 ? "strongSequence" : "emphasisSequence",
				start: h,
				end: { ...i[s][1].end }
			}, d = {
				type: f > 1 ? "strongSequence" : "emphasisSequence",
				start: { ...i[o][1].start },
				end: g
			}, l = {
				type: f > 1 ? "strongText" : "emphasisText",
				start: { ...i[s][1].end },
				end: { ...i[o][1].start }
			}, c = {
				type: f > 1 ? "strong" : "emphasis",
				start: { ...u.start },
				end: { ...d.end }
			}, i[s][1].end = { ...u.start }, i[o][1].start = { ...d.end }, p = [], i[s][1].end.offset - i[s][1].start.offset && (p = push(p, [[
				"enter",
				i[s][1],
				a
			], [
				"exit",
				i[s][1],
				a
			]])), p = push(p, [
				[
					"enter",
					c,
					a
				],
				[
					"enter",
					u,
					a
				],
				[
					"exit",
					u,
					a
				],
				[
					"enter",
					l,
					a
				]
			]), p = push(p, resolveAll(a.parser.constructs.insideSpan.null, i.slice(s + 1, o), a)), p = push(p, [
				[
					"exit",
					l,
					a
				],
				[
					"enter",
					d,
					a
				],
				[
					"exit",
					d,
					a
				],
				[
					"exit",
					c,
					a
				]
			]), i[o][1].end.offset - i[o][1].start.offset ? (m = 2, p = push(p, [[
				"enter",
				i[o][1],
				a
			], [
				"exit",
				i[o][1],
				a
			]])) : m = 0, splice(i, s - 1, o - s + 3, p), o = s + p.length - m - 2;
			break;
		}
	}
	for (o = -1; ++o < i.length;) i[o][1].type === "attentionSequence" && (i[o][1].type = "data");
	return i;
}
function tokenizeAttention(i, a) {
	let o = this.parser.constructs.attentionMarkers.null, s = this.previous, c = classifyCharacter(s), l;
	return u;
	function u(a) {
		return l = a, i.enter("attentionSequence"), d(a);
	}
	function d(u) {
		if (u === l) return i.consume(u), d;
		let f = i.exit("attentionSequence"), p = classifyCharacter(u), m = !p || p === 2 && c || o.includes(u), h = !c || c === 2 && p || o.includes(s);
		return f._open = !!(l === 42 ? m : m && (c || !h)), f._close = !!(l === 42 ? h : h && (p || !m)), a(u);
	}
}
function movePoint(i, a) {
	i.column += a, i.offset += a, i._bufferIndex += a;
}
const autolink = {
	name: "autolink",
	tokenize: tokenizeAutolink
};
function tokenizeAutolink(i, a, o) {
	let s = 0;
	return c;
	function c(a) {
		return i.enter("autolink"), i.enter("autolinkMarker"), i.consume(a), i.exit("autolinkMarker"), i.enter("autolinkProtocol"), l;
	}
	function l(a) {
		return asciiAlpha(a) ? (i.consume(a), u) : a === 64 ? o(a) : p(a);
	}
	function u(i) {
		return i === 43 || i === 45 || i === 46 || asciiAlphanumeric(i) ? (s = 1, d(i)) : p(i);
	}
	function d(a) {
		return a === 58 ? (i.consume(a), s = 0, f) : (a === 43 || a === 45 || a === 46 || asciiAlphanumeric(a)) && s++ < 32 ? (i.consume(a), d) : (s = 0, p(a));
	}
	function f(s) {
		return s === 62 ? (i.exit("autolinkProtocol"), i.enter("autolinkMarker"), i.consume(s), i.exit("autolinkMarker"), i.exit("autolink"), a) : s === null || s === 32 || s === 60 || asciiControl(s) ? o(s) : (i.consume(s), f);
	}
	function p(a) {
		return a === 64 ? (i.consume(a), m) : asciiAtext(a) ? (i.consume(a), p) : o(a);
	}
	function m(i) {
		return asciiAlphanumeric(i) ? h(i) : o(i);
	}
	function h(o) {
		return o === 46 ? (i.consume(o), s = 0, m) : o === 62 ? (i.exit("autolinkProtocol").type = "autolinkEmail", i.enter("autolinkMarker"), i.consume(o), i.exit("autolinkMarker"), i.exit("autolink"), a) : g(o);
	}
	function g(a) {
		if ((a === 45 || asciiAlphanumeric(a)) && s++ < 63) {
			let o = a === 45 ? g : h;
			return i.consume(a), o;
		}
		return o(a);
	}
}
const blankLine = {
	partial: !0,
	tokenize: tokenizeBlankLine
};
function tokenizeBlankLine(i, a, o) {
	return s;
	function s(a) {
		return markdownSpace(a) ? factorySpace(i, c, "linePrefix")(a) : c(a);
	}
	function c(i) {
		return i === null || markdownLineEnding(i) ? a(i) : o(i);
	}
}
const blockQuote = {
	continuation: { tokenize: tokenizeBlockQuoteContinuation },
	exit: exit$1,
	name: "blockQuote",
	tokenize: tokenizeBlockQuoteStart
};
function tokenizeBlockQuoteStart(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		if (a === 62) {
			let o = s.containerState;
			return o.open ||= (i.enter("blockQuote", { _container: !0 }), !0), i.enter("blockQuotePrefix"), i.enter("blockQuoteMarker"), i.consume(a), i.exit("blockQuoteMarker"), l;
		}
		return o(a);
	}
	function l(o) {
		return markdownSpace(o) ? (i.enter("blockQuotePrefixWhitespace"), i.consume(o), i.exit("blockQuotePrefixWhitespace"), i.exit("blockQuotePrefix"), a) : (i.exit("blockQuotePrefix"), a(o));
	}
}
function tokenizeBlockQuoteContinuation(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return markdownSpace(a) ? factorySpace(i, l, "linePrefix", s.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a) : l(a);
	}
	function l(s) {
		return i.attempt(blockQuote, a, o)(s);
	}
}
function exit$1(i) {
	i.exit("blockQuote");
}
const characterEscape = {
	name: "characterEscape",
	tokenize: tokenizeCharacterEscape
};
function tokenizeCharacterEscape(i, a, o) {
	return s;
	function s(a) {
		return i.enter("characterEscape"), i.enter("escapeMarker"), i.consume(a), i.exit("escapeMarker"), c;
	}
	function c(s) {
		return asciiPunctuation(s) ? (i.enter("characterEscapeValue"), i.consume(s), i.exit("characterEscapeValue"), i.exit("characterEscape"), a) : o(s);
	}
}
const characterReference = {
	name: "characterReference",
	tokenize: tokenizeCharacterReference
};
function tokenizeCharacterReference(i, a, o) {
	let s = this, c = 0, l, u;
	return d;
	function d(a) {
		return i.enter("characterReference"), i.enter("characterReferenceMarker"), i.consume(a), i.exit("characterReferenceMarker"), f;
	}
	function f(a) {
		return a === 35 ? (i.enter("characterReferenceMarkerNumeric"), i.consume(a), i.exit("characterReferenceMarkerNumeric"), p) : (i.enter("characterReferenceValue"), l = 31, u = asciiAlphanumeric, m(a));
	}
	function p(a) {
		return a === 88 || a === 120 ? (i.enter("characterReferenceMarkerHexadecimal"), i.consume(a), i.exit("characterReferenceMarkerHexadecimal"), i.enter("characterReferenceValue"), l = 6, u = asciiHexDigit, m) : (i.enter("characterReferenceValue"), l = 7, u = asciiDigit, m(a));
	}
	function m(d) {
		if (d === 59 && c) {
			let c = i.exit("characterReferenceValue");
			return u === asciiAlphanumeric && !decodeNamedCharacterReference(s.sliceSerialize(c)) ? o(d) : (i.enter("characterReferenceMarker"), i.consume(d), i.exit("characterReferenceMarker"), i.exit("characterReference"), a);
		}
		return u(d) && c++ < l ? (i.consume(d), m) : o(d);
	}
}
var nonLazyContinuation = {
	partial: !0,
	tokenize: tokenizeNonLazyContinuation
};
const codeFenced = {
	concrete: !0,
	name: "codeFenced",
	tokenize: tokenizeCodeFenced
};
function tokenizeCodeFenced(i, a, o) {
	let s = this, c = {
		partial: !0,
		tokenize: T
	}, l = 0, u = 0, d;
	return f;
	function f(i) {
		return p(i);
	}
	function p(a) {
		let o = s.events[s.events.length - 1];
		return l = o && o[1].type === "linePrefix" ? o[2].sliceSerialize(o[1], !0).length : 0, d = a, i.enter("codeFenced"), i.enter("codeFencedFence"), i.enter("codeFencedFenceSequence"), m(a);
	}
	function m(a) {
		return a === d ? (u++, i.consume(a), m) : u < 3 ? o(a) : (i.exit("codeFencedFenceSequence"), markdownSpace(a) ? factorySpace(i, h, "whitespace")(a) : h(a));
	}
	function h(o) {
		return o === null || markdownLineEnding(o) ? (i.exit("codeFencedFence"), s.interrupt ? a(o) : i.check(nonLazyContinuation, y, w)(o)) : (i.enter("codeFencedFenceInfo"), i.enter("chunkString", { contentType: "string" }), g(o));
	}
	function g(a) {
		return a === null || markdownLineEnding(a) ? (i.exit("chunkString"), i.exit("codeFencedFenceInfo"), h(a)) : markdownSpace(a) ? (i.exit("chunkString"), i.exit("codeFencedFenceInfo"), factorySpace(i, _, "whitespace")(a)) : a === 96 && a === d ? o(a) : (i.consume(a), g);
	}
	function _(a) {
		return a === null || markdownLineEnding(a) ? h(a) : (i.enter("codeFencedFenceMeta"), i.enter("chunkString", { contentType: "string" }), v(a));
	}
	function v(a) {
		return a === null || markdownLineEnding(a) ? (i.exit("chunkString"), i.exit("codeFencedFenceMeta"), h(a)) : a === 96 && a === d ? o(a) : (i.consume(a), v);
	}
	function y(a) {
		return i.attempt(c, w, b)(a);
	}
	function b(a) {
		return i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), x;
	}
	function x(a) {
		return l > 0 && markdownSpace(a) ? factorySpace(i, S, "linePrefix", l + 1)(a) : S(a);
	}
	function S(a) {
		return a === null || markdownLineEnding(a) ? i.check(nonLazyContinuation, y, w)(a) : (i.enter("codeFlowValue"), C(a));
	}
	function C(a) {
		return a === null || markdownLineEnding(a) ? (i.exit("codeFlowValue"), S(a)) : (i.consume(a), C);
	}
	function w(o) {
		return i.exit("codeFenced"), a(o);
	}
	function T(i, a, o) {
		let c = 0;
		return l;
		function l(a) {
			return i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), f;
		}
		function f(a) {
			return i.enter("codeFencedFence"), markdownSpace(a) ? factorySpace(i, p, "linePrefix", s.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a) : p(a);
		}
		function p(a) {
			return a === d ? (i.enter("codeFencedFenceSequence"), m(a)) : o(a);
		}
		function m(a) {
			return a === d ? (c++, i.consume(a), m) : c >= u ? (i.exit("codeFencedFenceSequence"), markdownSpace(a) ? factorySpace(i, h, "whitespace")(a) : h(a)) : o(a);
		}
		function h(s) {
			return s === null || markdownLineEnding(s) ? (i.exit("codeFencedFence"), a(s)) : o(s);
		}
	}
}
function tokenizeNonLazyContinuation(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return a === null ? o(a) : (i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), l);
	}
	function l(i) {
		return s.parser.lazy[s.now().line] ? o(i) : a(i);
	}
}
const codeIndented = {
	name: "codeIndented",
	tokenize: tokenizeCodeIndented
};
var furtherStart = {
	partial: !0,
	tokenize: tokenizeFurtherStart
};
function tokenizeCodeIndented(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return i.enter("codeIndented"), factorySpace(i, l, "linePrefix", 5)(a);
	}
	function l(i) {
		let a = s.events[s.events.length - 1];
		return a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? u(i) : o(i);
	}
	function u(a) {
		return a === null ? f(a) : markdownLineEnding(a) ? i.attempt(furtherStart, u, f)(a) : (i.enter("codeFlowValue"), d(a));
	}
	function d(a) {
		return a === null || markdownLineEnding(a) ? (i.exit("codeFlowValue"), u(a)) : (i.consume(a), d);
	}
	function f(o) {
		return i.exit("codeIndented"), a(o);
	}
}
function tokenizeFurtherStart(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return s.parser.lazy[s.now().line] ? o(a) : markdownLineEnding(a) ? (i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), c) : factorySpace(i, l, "linePrefix", 5)(a);
	}
	function l(i) {
		let l = s.events[s.events.length - 1];
		return l && l[1].type === "linePrefix" && l[2].sliceSerialize(l[1], !0).length >= 4 ? a(i) : markdownLineEnding(i) ? c(i) : o(i);
	}
}
const codeText = {
	name: "codeText",
	previous: previous$1,
	resolve: resolveCodeText,
	tokenize: tokenizeCodeText
};
function resolveCodeText(i) {
	let a = i.length - 4, o = 3, s, c;
	if ((i[o][1].type === "lineEnding" || i[o][1].type === "space") && (i[a][1].type === "lineEnding" || i[a][1].type === "space")) {
		for (s = o; ++s < a;) if (i[s][1].type === "codeTextData") {
			i[o][1].type = "codeTextPadding", i[a][1].type = "codeTextPadding", o += 2, a -= 2;
			break;
		}
	}
	for (s = o - 1, a++; ++s <= a;) c === void 0 ? s !== a && i[s][1].type !== "lineEnding" && (c = s) : (s === a || i[s][1].type === "lineEnding") && (i[c][1].type = "codeTextData", s !== c + 2 && (i[c][1].end = i[s - 1][1].end, i.splice(c + 2, s - c - 2), a -= s - c - 2, s = c + 2), c = void 0);
	return i;
}
function previous$1(i) {
	return i !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function tokenizeCodeText(i, a, o) {
	let s = 0, c, l;
	return u;
	function u(a) {
		return i.enter("codeText"), i.enter("codeTextSequence"), d(a);
	}
	function d(a) {
		return a === 96 ? (i.consume(a), s++, d) : (i.exit("codeTextSequence"), f(a));
	}
	function f(a) {
		return a === null ? o(a) : a === 32 ? (i.enter("space"), i.consume(a), i.exit("space"), f) : a === 96 ? (l = i.enter("codeTextSequence"), c = 0, m(a)) : markdownLineEnding(a) ? (i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), f) : (i.enter("codeTextData"), p(a));
	}
	function p(a) {
		return a === null || a === 32 || a === 96 || markdownLineEnding(a) ? (i.exit("codeTextData"), f(a)) : (i.consume(a), p);
	}
	function m(o) {
		return o === 96 ? (i.consume(o), c++, m) : c === s ? (i.exit("codeTextSequence"), i.exit("codeText"), a(o)) : (l.type = "codeTextData", p(o));
	}
}
var SpliceBuffer = class {
	constructor(i) {
		this.left = i ? [...i] : [], this.right = [];
	}
	get(i) {
		if (i < 0 || i >= this.left.length + this.right.length) throw RangeError("Cannot access index `" + i + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
		return i < this.left.length ? this.left[i] : this.right[this.right.length - i + this.left.length - 1];
	}
	get length() {
		return this.left.length + this.right.length;
	}
	shift() {
		return this.setCursor(0), this.right.pop();
	}
	slice(i, a) {
		let o = a ?? Infinity;
		return o < this.left.length ? this.left.slice(i, o) : i > this.left.length ? this.right.slice(this.right.length - o + this.left.length, this.right.length - i + this.left.length).reverse() : this.left.slice(i).concat(this.right.slice(this.right.length - o + this.left.length).reverse());
	}
	splice(i, a, o) {
		let s = a || 0;
		this.setCursor(Math.trunc(i));
		let c = this.right.splice(this.right.length - s, Infinity);
		return o && chunkedPush(this.left, o), c.reverse();
	}
	pop() {
		return this.setCursor(Infinity), this.left.pop();
	}
	push(i) {
		this.setCursor(Infinity), this.left.push(i);
	}
	pushMany(i) {
		this.setCursor(Infinity), chunkedPush(this.left, i);
	}
	unshift(i) {
		this.setCursor(0), this.right.push(i);
	}
	unshiftMany(i) {
		this.setCursor(0), chunkedPush(this.right, i.reverse());
	}
	setCursor(i) {
		if (!(i === this.left.length || i > this.left.length && this.right.length === 0 || i < 0 && this.left.length === 0)) if (i < this.left.length) {
			let a = this.left.splice(i, Infinity);
			chunkedPush(this.right, a.reverse());
		} else {
			let a = this.right.splice(this.left.length + this.right.length - i, Infinity);
			chunkedPush(this.left, a.reverse());
		}
	}
};
function chunkedPush(i, a) {
	let o = 0;
	if (a.length < 1e4) i.push(...a);
	else for (; o < a.length;) i.push(...a.slice(o, o + 1e4)), o += 1e4;
}
function subtokenize(i) {
	let a = {}, o = -1, s, c, l, u, d, f, p, m = new SpliceBuffer(i);
	for (; ++o < m.length;) {
		for (; o in a;) o = a[o];
		if (s = m.get(o), o && s[1].type === "chunkFlow" && m.get(o - 1)[1].type === "listItemPrefix" && (f = s[1]._tokenizer.events, l = 0, l < f.length && f[l][1].type === "lineEndingBlank" && (l += 2), l < f.length && f[l][1].type === "content")) for (; ++l < f.length && f[l][1].type !== "content";) f[l][1].type === "chunkText" && (f[l][1]._isInFirstContentOfListItem = !0, l++);
		if (s[0] === "enter") s[1].contentType && (Object.assign(a, subcontent(m, o)), o = a[o], p = !0);
		else if (s[1]._container) {
			for (l = o, c = void 0; l--;) if (u = m.get(l), u[1].type === "lineEnding" || u[1].type === "lineEndingBlank") u[0] === "enter" && (c && (m.get(c)[1].type = "lineEndingBlank"), u[1].type = "lineEnding", c = l);
			else if (!(u[1].type === "linePrefix" || u[1].type === "listItemIndent")) break;
			c && (s[1].end = { ...m.get(c)[1].start }, d = m.slice(c, o), d.unshift(s), m.splice(c, o - c + 1, d));
		}
	}
	return splice(i, 0, Infinity, m.slice(0)), !p;
}
function subcontent(i, a) {
	let o = i.get(a)[1], s = i.get(a)[2], c = a - 1, l = [], u = o._tokenizer;
	u || (u = s.parser[o.contentType](o.start), o._contentTypeTextTrailing && (u._contentTypeTextTrailing = !0));
	let d = u.events, f = [], p = {}, m, h, g = -1, _ = o, v = 0, y = 0, b = [y];
	for (; _;) {
		for (; i.get(++c)[1] !== _;);
		l.push(c), _._tokenizer || (m = s.sliceStream(_), _.next || m.push(null), h && u.defineSkip(_.start), _._isInFirstContentOfListItem && (u._gfmTasklistFirstContentOfListItem = !0), u.write(m), _._isInFirstContentOfListItem && (u._gfmTasklistFirstContentOfListItem = void 0)), h = _, _ = _.next;
	}
	for (_ = o; ++g < d.length;) d[g][0] === "exit" && d[g - 1][0] === "enter" && d[g][1].type === d[g - 1][1].type && d[g][1].start.line !== d[g][1].end.line && (y = g + 1, b.push(y), _._tokenizer = void 0, _.previous = void 0, _ = _.next);
	for (u.events = [], _ ? (_._tokenizer = void 0, _.previous = void 0) : b.pop(), g = b.length; g--;) {
		let a = d.slice(b[g], b[g + 1]), o = l.pop();
		f.push([o, o + a.length - 1]), i.splice(o, 2, a);
	}
	for (f.reverse(), g = -1; ++g < f.length;) p[v + f[g][0]] = v + f[g][1], v += f[g][1] - f[g][0] - 1;
	return p;
}
const content$1 = {
	resolve: resolveContent,
	tokenize: tokenizeContent
};
var continuationConstruct = {
	partial: !0,
	tokenize: tokenizeContinuation
};
function resolveContent(i) {
	return subtokenize(i), i;
}
function tokenizeContent(i, a) {
	let o;
	return s;
	function s(a) {
		return i.enter("content"), o = i.enter("chunkContent", { contentType: "content" }), c(a);
	}
	function c(a) {
		return a === null ? l(a) : markdownLineEnding(a) ? i.check(continuationConstruct, u, l)(a) : (i.consume(a), c);
	}
	function l(o) {
		return i.exit("chunkContent"), i.exit("content"), a(o);
	}
	function u(a) {
		return i.consume(a), i.exit("chunkContent"), o.next = i.enter("chunkContent", {
			contentType: "content",
			previous: o
		}), o = o.next, c;
	}
}
function tokenizeContinuation(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return i.exit("chunkContent"), i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), factorySpace(i, l, "linePrefix");
	}
	function l(c) {
		if (c === null || markdownLineEnding(c)) return o(c);
		let l = s.events[s.events.length - 1];
		return !s.parser.constructs.disable.null.includes("codeIndented") && l && l[1].type === "linePrefix" && l[2].sliceSerialize(l[1], !0).length >= 4 ? a(c) : i.interrupt(s.parser.constructs.flow, o, a)(c);
	}
}
function factoryDestination(i, a, o, s, c, l, u, d, f) {
	let p = f || Infinity, m = 0;
	return h;
	function h(a) {
		return a === 60 ? (i.enter(s), i.enter(c), i.enter(l), i.consume(a), i.exit(l), g) : a === null || a === 32 || a === 41 || asciiControl(a) ? o(a) : (i.enter(s), i.enter(u), i.enter(d), i.enter("chunkString", { contentType: "string" }), y(a));
	}
	function g(o) {
		return o === 62 ? (i.enter(l), i.consume(o), i.exit(l), i.exit(c), i.exit(s), a) : (i.enter(d), i.enter("chunkString", { contentType: "string" }), _(o));
	}
	function _(a) {
		return a === 62 ? (i.exit("chunkString"), i.exit(d), g(a)) : a === null || a === 60 || markdownLineEnding(a) ? o(a) : (i.consume(a), a === 92 ? v : _);
	}
	function v(a) {
		return a === 60 || a === 62 || a === 92 ? (i.consume(a), _) : _(a);
	}
	function y(c) {
		return !m && (c === null || c === 41 || markdownLineEndingOrSpace(c)) ? (i.exit("chunkString"), i.exit(d), i.exit(u), i.exit(s), a(c)) : m < p && c === 40 ? (i.consume(c), m++, y) : c === 41 ? (i.consume(c), m--, y) : c === null || c === 32 || c === 40 || asciiControl(c) ? o(c) : (i.consume(c), c === 92 ? b : y);
	}
	function b(a) {
		return a === 40 || a === 41 || a === 92 ? (i.consume(a), y) : y(a);
	}
}
function factoryLabel(i, a, o, s, c, l) {
	let u = this, d = 0, f;
	return p;
	function p(a) {
		return i.enter(s), i.enter(c), i.consume(a), i.exit(c), i.enter(l), m;
	}
	function m(p) {
		return d > 999 || p === null || p === 91 || p === 93 && !f || p === 94 && !d && "_hiddenFootnoteSupport" in u.parser.constructs ? o(p) : p === 93 ? (i.exit(l), i.enter(c), i.consume(p), i.exit(c), i.exit(s), a) : markdownLineEnding(p) ? (i.enter("lineEnding"), i.consume(p), i.exit("lineEnding"), m) : (i.enter("chunkString", { contentType: "string" }), h(p));
	}
	function h(a) {
		return a === null || a === 91 || a === 93 || markdownLineEnding(a) || d++ > 999 ? (i.exit("chunkString"), m(a)) : (i.consume(a), f ||= !markdownSpace(a), a === 92 ? g : h);
	}
	function g(a) {
		return a === 91 || a === 92 || a === 93 ? (i.consume(a), d++, h) : h(a);
	}
}
function factoryTitle(i, a, o, s, c, l) {
	let u;
	return d;
	function d(a) {
		return a === 34 || a === 39 || a === 40 ? (i.enter(s), i.enter(c), i.consume(a), i.exit(c), u = a === 40 ? 41 : a, f) : o(a);
	}
	function f(o) {
		return o === u ? (i.enter(c), i.consume(o), i.exit(c), i.exit(s), a) : (i.enter(l), p(o));
	}
	function p(a) {
		return a === u ? (i.exit(l), f(u)) : a === null ? o(a) : markdownLineEnding(a) ? (i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), factorySpace(i, p, "linePrefix")) : (i.enter("chunkString", { contentType: "string" }), m(a));
	}
	function m(a) {
		return a === u || a === null || markdownLineEnding(a) ? (i.exit("chunkString"), p(a)) : (i.consume(a), a === 92 ? h : m);
	}
	function h(a) {
		return a === u || a === 92 ? (i.consume(a), m) : m(a);
	}
}
function factoryWhitespace(i, a) {
	let o;
	return s;
	function s(c) {
		return markdownLineEnding(c) ? (i.enter("lineEnding"), i.consume(c), i.exit("lineEnding"), o = !0, s) : markdownSpace(c) ? factorySpace(i, s, o ? "linePrefix" : "lineSuffix")(c) : a(c);
	}
}
const definition$1 = {
	name: "definition",
	tokenize: tokenizeDefinition
};
var titleBefore = {
	partial: !0,
	tokenize: tokenizeTitleBefore
};
function tokenizeDefinition(i, a, o) {
	let s = this, c;
	return l;
	function l(a) {
		return i.enter("definition"), u(a);
	}
	function u(a) {
		return factoryLabel.call(s, i, d, o, "definitionLabel", "definitionLabelMarker", "definitionLabelString")(a);
	}
	function d(a) {
		return c = normalizeIdentifier(s.sliceSerialize(s.events[s.events.length - 1][1]).slice(1, -1)), a === 58 ? (i.enter("definitionMarker"), i.consume(a), i.exit("definitionMarker"), f) : o(a);
	}
	function f(a) {
		return markdownLineEndingOrSpace(a) ? factoryWhitespace(i, p)(a) : p(a);
	}
	function p(a) {
		return factoryDestination(i, m, o, "definitionDestination", "definitionDestinationLiteral", "definitionDestinationLiteralMarker", "definitionDestinationRaw", "definitionDestinationString")(a);
	}
	function m(a) {
		return i.attempt(titleBefore, h, h)(a);
	}
	function h(a) {
		return markdownSpace(a) ? factorySpace(i, g, "whitespace")(a) : g(a);
	}
	function g(l) {
		return l === null || markdownLineEnding(l) ? (i.exit("definition"), s.parser.defined.push(c), a(l)) : o(l);
	}
}
function tokenizeTitleBefore(i, a, o) {
	return s;
	function s(a) {
		return markdownLineEndingOrSpace(a) ? factoryWhitespace(i, c)(a) : o(a);
	}
	function c(a) {
		return factoryTitle(i, l, o, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(a);
	}
	function l(a) {
		return markdownSpace(a) ? factorySpace(i, u, "whitespace")(a) : u(a);
	}
	function u(i) {
		return i === null || markdownLineEnding(i) ? a(i) : o(i);
	}
}
const hardBreakEscape = {
	name: "hardBreakEscape",
	tokenize: tokenizeHardBreakEscape
};
function tokenizeHardBreakEscape(i, a, o) {
	return s;
	function s(a) {
		return i.enter("hardBreakEscape"), i.consume(a), c;
	}
	function c(s) {
		return markdownLineEnding(s) ? (i.exit("hardBreakEscape"), a(s)) : o(s);
	}
}
const headingAtx = {
	name: "headingAtx",
	resolve: resolveHeadingAtx,
	tokenize: tokenizeHeadingAtx
};
function resolveHeadingAtx(i, a) {
	let o = i.length - 2, s = 3, c, l;
	return i[s][1].type === "whitespace" && (s += 2), o - 2 > s && i[o][1].type === "whitespace" && (o -= 2), i[o][1].type === "atxHeadingSequence" && (s === o - 1 || o - 4 > s && i[o - 2][1].type === "whitespace") && (o -= s + 1 === o ? 2 : 4), o > s && (c = {
		type: "atxHeadingText",
		start: i[s][1].start,
		end: i[o][1].end
	}, l = {
		type: "chunkText",
		start: i[s][1].start,
		end: i[o][1].end,
		contentType: "text"
	}, splice(i, s, o - s + 1, [
		[
			"enter",
			c,
			a
		],
		[
			"enter",
			l,
			a
		],
		[
			"exit",
			l,
			a
		],
		[
			"exit",
			c,
			a
		]
	])), i;
}
function tokenizeHeadingAtx(i, a, o) {
	let s = 0;
	return c;
	function c(a) {
		return i.enter("atxHeading"), l(a);
	}
	function l(a) {
		return i.enter("atxHeadingSequence"), u(a);
	}
	function u(a) {
		return a === 35 && s++ < 6 ? (i.consume(a), u) : a === null || markdownLineEndingOrSpace(a) ? (i.exit("atxHeadingSequence"), d(a)) : o(a);
	}
	function d(o) {
		return o === 35 ? (i.enter("atxHeadingSequence"), f(o)) : o === null || markdownLineEnding(o) ? (i.exit("atxHeading"), a(o)) : markdownSpace(o) ? factorySpace(i, d, "whitespace")(o) : (i.enter("atxHeadingText"), p(o));
	}
	function f(a) {
		return a === 35 ? (i.consume(a), f) : (i.exit("atxHeadingSequence"), d(a));
	}
	function p(a) {
		return a === null || a === 35 || markdownLineEndingOrSpace(a) ? (i.exit("atxHeadingText"), d(a)) : (i.consume(a), p);
	}
}
const htmlBlockNames = /* @__PURE__ */ "address.article.aside.base.basefont.blockquote.body.caption.center.col.colgroup.dd.details.dialog.dir.div.dl.dt.fieldset.figcaption.figure.footer.form.frame.frameset.h1.h2.h3.h4.h5.h6.head.header.hr.html.iframe.legend.li.link.main.menu.menuitem.nav.noframes.ol.optgroup.option.p.param.search.section.summary.table.tbody.td.tfoot.th.thead.title.tr.track.ul".split("."), htmlRawNames = [
	"pre",
	"script",
	"style",
	"textarea"
], htmlFlow = {
	concrete: !0,
	name: "htmlFlow",
	resolveTo: resolveToHtmlFlow,
	tokenize: tokenizeHtmlFlow
};
var blankLineBefore = {
	partial: !0,
	tokenize: tokenizeBlankLineBefore
}, nonLazyContinuationStart = {
	partial: !0,
	tokenize: tokenizeNonLazyContinuationStart
};
function resolveToHtmlFlow(i) {
	let a = i.length;
	for (; a-- && !(i[a][0] === "enter" && i[a][1].type === "htmlFlow"););
	return a > 1 && i[a - 2][1].type === "linePrefix" && (i[a][1].start = i[a - 2][1].start, i[a + 1][1].start = i[a - 2][1].start, i.splice(a - 2, 2)), i;
}
function tokenizeHtmlFlow(i, a, o) {
	let s = this, c, l, u, d, f;
	return p;
	function p(i) {
		return m(i);
	}
	function m(a) {
		return i.enter("htmlFlow"), i.enter("htmlFlowData"), i.consume(a), h;
	}
	function h(d) {
		return d === 33 ? (i.consume(d), g) : d === 47 ? (i.consume(d), l = !0, y) : d === 63 ? (i.consume(d), c = 3, s.interrupt ? a : B) : asciiAlpha(d) ? (i.consume(d), u = String.fromCharCode(d), b) : o(d);
	}
	function g(l) {
		return l === 45 ? (i.consume(l), c = 2, _) : l === 91 ? (i.consume(l), c = 5, d = 0, v) : asciiAlpha(l) ? (i.consume(l), c = 4, s.interrupt ? a : B) : o(l);
	}
	function _(c) {
		return c === 45 ? (i.consume(c), s.interrupt ? a : B) : o(c);
	}
	function v(c) {
		return c === "CDATA[".charCodeAt(d++) ? (i.consume(c), d === 6 ? s.interrupt ? a : M : v) : o(c);
	}
	function y(a) {
		return asciiAlpha(a) ? (i.consume(a), u = String.fromCharCode(a), b) : o(a);
	}
	function b(d) {
		if (d === null || d === 47 || d === 62 || markdownLineEndingOrSpace(d)) {
			let f = d === 47, p = u.toLowerCase();
			return !f && !l && htmlRawNames.includes(p) ? (c = 1, s.interrupt ? a(d) : M(d)) : htmlBlockNames.includes(u.toLowerCase()) ? (c = 6, f ? (i.consume(d), x) : s.interrupt ? a(d) : M(d)) : (c = 7, s.interrupt && !s.parser.lazy[s.now().line] ? o(d) : l ? S(d) : C(d));
		}
		return d === 45 || asciiAlphanumeric(d) ? (i.consume(d), u += String.fromCharCode(d), b) : o(d);
	}
	function x(c) {
		return c === 62 ? (i.consume(c), s.interrupt ? a : M) : o(c);
	}
	function S(a) {
		return markdownSpace(a) ? (i.consume(a), S) : A(a);
	}
	function C(a) {
		return a === 47 ? (i.consume(a), A) : a === 58 || a === 95 || asciiAlpha(a) ? (i.consume(a), w) : markdownSpace(a) ? (i.consume(a), C) : A(a);
	}
	function w(a) {
		return a === 45 || a === 46 || a === 58 || a === 95 || asciiAlphanumeric(a) ? (i.consume(a), w) : T(a);
	}
	function T(a) {
		return a === 61 ? (i.consume(a), E) : markdownSpace(a) ? (i.consume(a), T) : C(a);
	}
	function E(a) {
		return a === null || a === 60 || a === 61 || a === 62 || a === 96 ? o(a) : a === 34 || a === 39 ? (i.consume(a), f = a, D) : markdownSpace(a) ? (i.consume(a), E) : O(a);
	}
	function D(a) {
		return a === f ? (i.consume(a), f = null, k) : a === null || markdownLineEnding(a) ? o(a) : (i.consume(a), D);
	}
	function O(a) {
		return a === null || a === 34 || a === 39 || a === 47 || a === 60 || a === 61 || a === 62 || a === 96 || markdownLineEndingOrSpace(a) ? T(a) : (i.consume(a), O);
	}
	function k(i) {
		return i === 47 || i === 62 || markdownSpace(i) ? C(i) : o(i);
	}
	function A(a) {
		return a === 62 ? (i.consume(a), j) : o(a);
	}
	function j(a) {
		return a === null || markdownLineEnding(a) ? M(a) : markdownSpace(a) ? (i.consume(a), j) : o(a);
	}
	function M(a) {
		return a === 45 && c === 2 ? (i.consume(a), I) : a === 60 && c === 1 ? (i.consume(a), L) : a === 62 && c === 4 ? (i.consume(a), V) : a === 63 && c === 3 ? (i.consume(a), B) : a === 93 && c === 5 ? (i.consume(a), z) : markdownLineEnding(a) && (c === 6 || c === 7) ? (i.exit("htmlFlowData"), i.check(blankLineBefore, H, N)(a)) : a === null || markdownLineEnding(a) ? (i.exit("htmlFlowData"), N(a)) : (i.consume(a), M);
	}
	function N(a) {
		return i.check(nonLazyContinuationStart, P, H)(a);
	}
	function P(a) {
		return i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), F;
	}
	function F(a) {
		return a === null || markdownLineEnding(a) ? N(a) : (i.enter("htmlFlowData"), M(a));
	}
	function I(a) {
		return a === 45 ? (i.consume(a), B) : M(a);
	}
	function L(a) {
		return a === 47 ? (i.consume(a), u = "", R) : M(a);
	}
	function R(a) {
		if (a === 62) {
			let o = u.toLowerCase();
			return htmlRawNames.includes(o) ? (i.consume(a), V) : M(a);
		}
		return asciiAlpha(a) && u.length < 8 ? (i.consume(a), u += String.fromCharCode(a), R) : M(a);
	}
	function z(a) {
		return a === 93 ? (i.consume(a), B) : M(a);
	}
	function B(a) {
		return a === 62 ? (i.consume(a), V) : a === 45 && c === 2 ? (i.consume(a), B) : M(a);
	}
	function V(a) {
		return a === null || markdownLineEnding(a) ? (i.exit("htmlFlowData"), H(a)) : (i.consume(a), V);
	}
	function H(o) {
		return i.exit("htmlFlow"), a(o);
	}
}
function tokenizeNonLazyContinuationStart(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return markdownLineEnding(a) ? (i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), l) : o(a);
	}
	function l(i) {
		return s.parser.lazy[s.now().line] ? o(i) : a(i);
	}
}
function tokenizeBlankLineBefore(i, a, o) {
	return s;
	function s(s) {
		return i.enter("lineEnding"), i.consume(s), i.exit("lineEnding"), i.attempt(blankLine, a, o);
	}
}
const htmlText = {
	name: "htmlText",
	tokenize: tokenizeHtmlText
};
function tokenizeHtmlText(i, a, o) {
	let s = this, c, l, u;
	return d;
	function d(a) {
		return i.enter("htmlText"), i.enter("htmlTextData"), i.consume(a), f;
	}
	function f(a) {
		return a === 33 ? (i.consume(a), p) : a === 47 ? (i.consume(a), T) : a === 63 ? (i.consume(a), C) : asciiAlpha(a) ? (i.consume(a), O) : o(a);
	}
	function p(a) {
		return a === 45 ? (i.consume(a), m) : a === 91 ? (i.consume(a), l = 0, v) : asciiAlpha(a) ? (i.consume(a), S) : o(a);
	}
	function m(a) {
		return a === 45 ? (i.consume(a), _) : o(a);
	}
	function h(a) {
		return a === null ? o(a) : a === 45 ? (i.consume(a), g) : markdownLineEnding(a) ? (u = h, L(a)) : (i.consume(a), h);
	}
	function g(a) {
		return a === 45 ? (i.consume(a), _) : h(a);
	}
	function _(i) {
		return i === 62 ? I(i) : i === 45 ? g(i) : h(i);
	}
	function v(a) {
		return a === "CDATA[".charCodeAt(l++) ? (i.consume(a), l === 6 ? y : v) : o(a);
	}
	function y(a) {
		return a === null ? o(a) : a === 93 ? (i.consume(a), b) : markdownLineEnding(a) ? (u = y, L(a)) : (i.consume(a), y);
	}
	function b(a) {
		return a === 93 ? (i.consume(a), x) : y(a);
	}
	function x(a) {
		return a === 62 ? I(a) : a === 93 ? (i.consume(a), x) : y(a);
	}
	function S(a) {
		return a === null || a === 62 ? I(a) : markdownLineEnding(a) ? (u = S, L(a)) : (i.consume(a), S);
	}
	function C(a) {
		return a === null ? o(a) : a === 63 ? (i.consume(a), w) : markdownLineEnding(a) ? (u = C, L(a)) : (i.consume(a), C);
	}
	function w(i) {
		return i === 62 ? I(i) : C(i);
	}
	function T(a) {
		return asciiAlpha(a) ? (i.consume(a), E) : o(a);
	}
	function E(a) {
		return a === 45 || asciiAlphanumeric(a) ? (i.consume(a), E) : D(a);
	}
	function D(a) {
		return markdownLineEnding(a) ? (u = D, L(a)) : markdownSpace(a) ? (i.consume(a), D) : I(a);
	}
	function O(a) {
		return a === 45 || asciiAlphanumeric(a) ? (i.consume(a), O) : a === 47 || a === 62 || markdownLineEndingOrSpace(a) ? k(a) : o(a);
	}
	function k(a) {
		return a === 47 ? (i.consume(a), I) : a === 58 || a === 95 || asciiAlpha(a) ? (i.consume(a), A) : markdownLineEnding(a) ? (u = k, L(a)) : markdownSpace(a) ? (i.consume(a), k) : I(a);
	}
	function A(a) {
		return a === 45 || a === 46 || a === 58 || a === 95 || asciiAlphanumeric(a) ? (i.consume(a), A) : j(a);
	}
	function j(a) {
		return a === 61 ? (i.consume(a), M) : markdownLineEnding(a) ? (u = j, L(a)) : markdownSpace(a) ? (i.consume(a), j) : k(a);
	}
	function M(a) {
		return a === null || a === 60 || a === 61 || a === 62 || a === 96 ? o(a) : a === 34 || a === 39 ? (i.consume(a), c = a, N) : markdownLineEnding(a) ? (u = M, L(a)) : markdownSpace(a) ? (i.consume(a), M) : (i.consume(a), P);
	}
	function N(a) {
		return a === c ? (i.consume(a), c = void 0, F) : a === null ? o(a) : markdownLineEnding(a) ? (u = N, L(a)) : (i.consume(a), N);
	}
	function P(a) {
		return a === null || a === 34 || a === 39 || a === 60 || a === 61 || a === 96 ? o(a) : a === 47 || a === 62 || markdownLineEndingOrSpace(a) ? k(a) : (i.consume(a), P);
	}
	function F(i) {
		return i === 47 || i === 62 || markdownLineEndingOrSpace(i) ? k(i) : o(i);
	}
	function I(s) {
		return s === 62 ? (i.consume(s), i.exit("htmlTextData"), i.exit("htmlText"), a) : o(s);
	}
	function L(a) {
		return i.exit("htmlTextData"), i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), R;
	}
	function R(a) {
		return markdownSpace(a) ? factorySpace(i, z, "linePrefix", s.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a) : z(a);
	}
	function z(a) {
		return i.enter("htmlTextData"), u(a);
	}
}
const labelEnd = {
	name: "labelEnd",
	resolveAll: resolveAllLabelEnd,
	resolveTo: resolveToLabelEnd,
	tokenize: tokenizeLabelEnd
};
var resourceConstruct = { tokenize: tokenizeResource }, referenceFullConstruct = { tokenize: tokenizeReferenceFull }, referenceCollapsedConstruct = { tokenize: tokenizeReferenceCollapsed };
function resolveAllLabelEnd(i) {
	let a = -1, o = [];
	for (; ++a < i.length;) {
		let s = i[a][1];
		if (o.push(i[a]), s.type === "labelImage" || s.type === "labelLink" || s.type === "labelEnd") {
			let i = s.type === "labelImage" ? 4 : 2;
			s.type = "data", a += i;
		}
	}
	return i.length !== o.length && splice(i, 0, i.length, o), i;
}
function resolveToLabelEnd(i, a) {
	let o = i.length, s = 0, c, l, u, d;
	for (; o--;) if (c = i[o][1], l) {
		if (c.type === "link" || c.type === "labelLink" && c._inactive) break;
		i[o][0] === "enter" && c.type === "labelLink" && (c._inactive = !0);
	} else if (u) {
		if (i[o][0] === "enter" && (c.type === "labelImage" || c.type === "labelLink") && !c._balanced && (l = o, c.type !== "labelLink")) {
			s = 2;
			break;
		}
	} else c.type === "labelEnd" && (u = o);
	let f = {
		type: i[l][1].type === "labelLink" ? "link" : "image",
		start: { ...i[l][1].start },
		end: { ...i[i.length - 1][1].end }
	}, p = {
		type: "label",
		start: { ...i[l][1].start },
		end: { ...i[u][1].end }
	}, m = {
		type: "labelText",
		start: { ...i[l + s + 2][1].end },
		end: { ...i[u - 2][1].start }
	};
	return d = [[
		"enter",
		f,
		a
	], [
		"enter",
		p,
		a
	]], d = push(d, i.slice(l + 1, l + s + 3)), d = push(d, [[
		"enter",
		m,
		a
	]]), d = push(d, resolveAll(a.parser.constructs.insideSpan.null, i.slice(l + s + 4, u - 3), a)), d = push(d, [
		[
			"exit",
			m,
			a
		],
		i[u - 2],
		i[u - 1],
		[
			"exit",
			p,
			a
		]
	]), d = push(d, i.slice(u + 1)), d = push(d, [[
		"exit",
		f,
		a
	]]), splice(i, l, i.length, d), i;
}
function tokenizeLabelEnd(i, a, o) {
	let s = this, c = s.events.length, l, u;
	for (; c--;) if ((s.events[c][1].type === "labelImage" || s.events[c][1].type === "labelLink") && !s.events[c][1]._balanced) {
		l = s.events[c][1];
		break;
	}
	return d;
	function d(a) {
		return l ? l._inactive ? h(a) : (u = s.parser.defined.includes(normalizeIdentifier(s.sliceSerialize({
			start: l.end,
			end: s.now()
		}))), i.enter("labelEnd"), i.enter("labelMarker"), i.consume(a), i.exit("labelMarker"), i.exit("labelEnd"), f) : o(a);
	}
	function f(a) {
		return a === 40 ? i.attempt(resourceConstruct, m, u ? m : h)(a) : a === 91 ? i.attempt(referenceFullConstruct, m, u ? p : h)(a) : u ? m(a) : h(a);
	}
	function p(a) {
		return i.attempt(referenceCollapsedConstruct, m, h)(a);
	}
	function m(i) {
		return a(i);
	}
	function h(i) {
		return l._balanced = !0, o(i);
	}
}
function tokenizeResource(i, a, o) {
	return s;
	function s(a) {
		return i.enter("resource"), i.enter("resourceMarker"), i.consume(a), i.exit("resourceMarker"), c;
	}
	function c(a) {
		return markdownLineEndingOrSpace(a) ? factoryWhitespace(i, l)(a) : l(a);
	}
	function l(a) {
		return a === 41 ? m(a) : factoryDestination(i, u, d, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(a);
	}
	function u(a) {
		return markdownLineEndingOrSpace(a) ? factoryWhitespace(i, f)(a) : m(a);
	}
	function d(i) {
		return o(i);
	}
	function f(a) {
		return a === 34 || a === 39 || a === 40 ? factoryTitle(i, p, o, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(a) : m(a);
	}
	function p(a) {
		return markdownLineEndingOrSpace(a) ? factoryWhitespace(i, m)(a) : m(a);
	}
	function m(s) {
		return s === 41 ? (i.enter("resourceMarker"), i.consume(s), i.exit("resourceMarker"), i.exit("resource"), a) : o(s);
	}
}
function tokenizeReferenceFull(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return factoryLabel.call(s, i, l, u, "reference", "referenceMarker", "referenceString")(a);
	}
	function l(i) {
		return s.parser.defined.includes(normalizeIdentifier(s.sliceSerialize(s.events[s.events.length - 1][1]).slice(1, -1))) ? a(i) : o(i);
	}
	function u(i) {
		return o(i);
	}
}
function tokenizeReferenceCollapsed(i, a, o) {
	return s;
	function s(a) {
		return i.enter("reference"), i.enter("referenceMarker"), i.consume(a), i.exit("referenceMarker"), c;
	}
	function c(s) {
		return s === 93 ? (i.enter("referenceMarker"), i.consume(s), i.exit("referenceMarker"), i.exit("reference"), a) : o(s);
	}
}
const labelStartImage = {
	name: "labelStartImage",
	resolveAll: labelEnd.resolveAll,
	tokenize: tokenizeLabelStartImage
};
function tokenizeLabelStartImage(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return i.enter("labelImage"), i.enter("labelImageMarker"), i.consume(a), i.exit("labelImageMarker"), l;
	}
	function l(a) {
		return a === 91 ? (i.enter("labelMarker"), i.consume(a), i.exit("labelMarker"), i.exit("labelImage"), u) : o(a);
	}
	function u(i) {
		/* c8 ignore next 3 */
		return i === 94 && "_hiddenFootnoteSupport" in s.parser.constructs ? o(i) : a(i);
	}
}
const labelStartLink = {
	name: "labelStartLink",
	resolveAll: labelEnd.resolveAll,
	tokenize: tokenizeLabelStartLink
};
function tokenizeLabelStartLink(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return i.enter("labelLink"), i.enter("labelMarker"), i.consume(a), i.exit("labelMarker"), i.exit("labelLink"), l;
	}
	function l(i) {
		/* c8 ignore next 3 */
		return i === 94 && "_hiddenFootnoteSupport" in s.parser.constructs ? o(i) : a(i);
	}
}
const lineEnding = {
	name: "lineEnding",
	tokenize: tokenizeLineEnding
};
function tokenizeLineEnding(i, a) {
	return o;
	function o(o) {
		return i.enter("lineEnding"), i.consume(o), i.exit("lineEnding"), factorySpace(i, a, "linePrefix");
	}
}
const thematicBreak$2 = {
	name: "thematicBreak",
	tokenize: tokenizeThematicBreak
};
function tokenizeThematicBreak(i, a, o) {
	let s = 0, c;
	return l;
	function l(a) {
		return i.enter("thematicBreak"), u(a);
	}
	function u(i) {
		return c = i, d(i);
	}
	function d(l) {
		return l === c ? (i.enter("thematicBreakSequence"), f(l)) : s >= 3 && (l === null || markdownLineEnding(l)) ? (i.exit("thematicBreak"), a(l)) : o(l);
	}
	function f(a) {
		return a === c ? (i.consume(a), s++, f) : (i.exit("thematicBreakSequence"), markdownSpace(a) ? factorySpace(i, d, "whitespace")(a) : d(a));
	}
}
const list$2 = {
	continuation: { tokenize: tokenizeListContinuation },
	exit: tokenizeListEnd,
	name: "list",
	tokenize: tokenizeListStart
};
var listItemPrefixWhitespaceConstruct = {
	partial: !0,
	tokenize: tokenizeListItemPrefixWhitespace
}, indentConstruct = {
	partial: !0,
	tokenize: tokenizeIndent$1
};
function tokenizeListStart(i, a, o) {
	let s = this, c = s.events[s.events.length - 1], l = c && c[1].type === "linePrefix" ? c[2].sliceSerialize(c[1], !0).length : 0, u = 0;
	return d;
	function d(a) {
		let c = s.containerState.type || (a === 42 || a === 43 || a === 45 ? "listUnordered" : "listOrdered");
		if (c === "listUnordered" ? !s.containerState.marker || a === s.containerState.marker : asciiDigit(a)) {
			if (s.containerState.type || (s.containerState.type = c, i.enter(c, { _container: !0 })), c === "listUnordered") return i.enter("listItemPrefix"), a === 42 || a === 45 ? i.check(thematicBreak$2, o, p)(a) : p(a);
			if (!s.interrupt || a === 49) return i.enter("listItemPrefix"), i.enter("listItemValue"), f(a);
		}
		return o(a);
	}
	function f(a) {
		return asciiDigit(a) && ++u < 10 ? (i.consume(a), f) : (!s.interrupt || u < 2) && (s.containerState.marker ? a === s.containerState.marker : a === 41 || a === 46) ? (i.exit("listItemValue"), p(a)) : o(a);
	}
	function p(a) {
		return i.enter("listItemMarker"), i.consume(a), i.exit("listItemMarker"), s.containerState.marker = s.containerState.marker || a, i.check(blankLine, s.interrupt ? o : m, i.attempt(listItemPrefixWhitespaceConstruct, g, h));
	}
	function m(i) {
		return s.containerState.initialBlankLine = !0, l++, g(i);
	}
	function h(a) {
		return markdownSpace(a) ? (i.enter("listItemPrefixWhitespace"), i.consume(a), i.exit("listItemPrefixWhitespace"), g) : o(a);
	}
	function g(o) {
		return s.containerState.size = l + s.sliceSerialize(i.exit("listItemPrefix"), !0).length, a(o);
	}
}
function tokenizeListContinuation(i, a, o) {
	let s = this;
	return s.containerState._closeFlow = void 0, i.check(blankLine, c, l);
	function c(o) {
		return s.containerState.furtherBlankLines = s.containerState.furtherBlankLines || s.containerState.initialBlankLine, factorySpace(i, a, "listItemIndent", s.containerState.size + 1)(o);
	}
	function l(o) {
		return s.containerState.furtherBlankLines || !markdownSpace(o) ? (s.containerState.furtherBlankLines = void 0, s.containerState.initialBlankLine = void 0, u(o)) : (s.containerState.furtherBlankLines = void 0, s.containerState.initialBlankLine = void 0, i.attempt(indentConstruct, a, u)(o));
	}
	function u(c) {
		return s.containerState._closeFlow = !0, s.interrupt = void 0, factorySpace(i, i.attempt(list$2, a, o), "linePrefix", s.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(c);
	}
}
function tokenizeIndent$1(i, a, o) {
	let s = this;
	return factorySpace(i, c, "listItemIndent", s.containerState.size + 1);
	function c(i) {
		let c = s.events[s.events.length - 1];
		return c && c[1].type === "listItemIndent" && c[2].sliceSerialize(c[1], !0).length === s.containerState.size ? a(i) : o(i);
	}
}
function tokenizeListEnd(i) {
	i.exit(this.containerState.type);
}
function tokenizeListItemPrefixWhitespace(i, a, o) {
	let s = this;
	return factorySpace(i, c, "listItemPrefixWhitespace", s.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
	function c(i) {
		let c = s.events[s.events.length - 1];
		return !markdownSpace(i) && c && c[1].type === "listItemPrefixWhitespace" ? a(i) : o(i);
	}
}
const setextUnderline = {
	name: "setextUnderline",
	resolveTo: resolveToSetextUnderline,
	tokenize: tokenizeSetextUnderline
};
function resolveToSetextUnderline(i, a) {
	let o = i.length, s, c, l;
	for (; o--;) if (i[o][0] === "enter") {
		if (i[o][1].type === "content") {
			s = o;
			break;
		}
		i[o][1].type === "paragraph" && (c = o);
	} else i[o][1].type === "content" && i.splice(o, 1), !l && i[o][1].type === "definition" && (l = o);
	let u = {
		type: "setextHeading",
		start: { ...i[s][1].start },
		end: { ...i[i.length - 1][1].end }
	};
	return i[c][1].type = "setextHeadingText", l ? (i.splice(c, 0, [
		"enter",
		u,
		a
	]), i.splice(l + 1, 0, [
		"exit",
		i[s][1],
		a
	]), i[s][1].end = { ...i[l][1].end }) : i[s][1] = u, i.push([
		"exit",
		u,
		a
	]), i;
}
function tokenizeSetextUnderline(i, a, o) {
	let s = this, c;
	return l;
	function l(a) {
		let l = s.events.length, d;
		for (; l--;) if (s.events[l][1].type !== "lineEnding" && s.events[l][1].type !== "linePrefix" && s.events[l][1].type !== "content") {
			d = s.events[l][1].type === "paragraph";
			break;
		}
		return !s.parser.lazy[s.now().line] && (s.interrupt || d) ? (i.enter("setextHeadingLine"), c = a, u(a)) : o(a);
	}
	function u(a) {
		return i.enter("setextHeadingLineSequence"), d(a);
	}
	function d(a) {
		return a === c ? (i.consume(a), d) : (i.exit("setextHeadingLineSequence"), markdownSpace(a) ? factorySpace(i, f, "lineSuffix")(a) : f(a));
	}
	function f(s) {
		return s === null || markdownLineEnding(s) ? (i.exit("setextHeadingLine"), a(s)) : o(s);
	}
}
const flow = { tokenize: initializeFlow };
function initializeFlow(i) {
	let a = this, o = i.attempt(blankLine, s, i.attempt(this.parser.constructs.flowInitial, c, factorySpace(i, i.attempt(this.parser.constructs.flow, c, i.attempt(content$1, c)), "linePrefix")));
	return o;
	function s(s) {
		if (s === null) {
			i.consume(s);
			return;
		}
		return i.enter("lineEndingBlank"), i.consume(s), i.exit("lineEndingBlank"), a.currentConstruct = void 0, o;
	}
	function c(s) {
		if (s === null) {
			i.consume(s);
			return;
		}
		return i.enter("lineEnding"), i.consume(s), i.exit("lineEnding"), a.currentConstruct = void 0, o;
	}
}
const resolver = { resolveAll: createResolver() }, string = initializeFactory("string"), text$3 = initializeFactory("text");
function initializeFactory(i) {
	return {
		resolveAll: createResolver(i === "text" ? resolveAllLineSuffixes : void 0),
		tokenize: a
	};
	function a(a) {
		let o = this, s = this.parser.constructs[i], c = a.attempt(s, l, u);
		return l;
		function l(i) {
			return f(i) ? c(i) : u(i);
		}
		function u(i) {
			if (i === null) {
				a.consume(i);
				return;
			}
			return a.enter("data"), a.consume(i), d;
		}
		function d(i) {
			return f(i) ? (a.exit("data"), c(i)) : (a.consume(i), d);
		}
		function f(i) {
			if (i === null) return !0;
			let a = s[i], c = -1;
			if (a) for (; ++c < a.length;) {
				let i = a[c];
				if (!i.previous || i.previous.call(o, o.previous)) return !0;
			}
			return !1;
		}
	}
}
function createResolver(i) {
	return a;
	function a(a, o) {
		let s = -1, c;
		for (; ++s <= a.length;) c === void 0 ? a[s] && a[s][1].type === "data" && (c = s, s++) : (!a[s] || a[s][1].type !== "data") && (s !== c + 2 && (a[c][1].end = a[s - 1][1].end, a.splice(c + 2, s - c - 2), s = c + 2), c = void 0);
		return i ? i(a, o) : a;
	}
}
function resolveAllLineSuffixes(i, a) {
	let o = 0;
	for (; ++o <= i.length;) if ((o === i.length || i[o][1].type === "lineEnding") && i[o - 1][1].type === "data") {
		let s = i[o - 1][1], c = a.sliceStream(s), l = c.length, u = -1, d = 0, f;
		for (; l--;) {
			let i = c[l];
			if (typeof i == "string") {
				for (u = i.length; i.charCodeAt(u - 1) === 32;) d++, u--;
				if (u) break;
				u = -1;
			} else if (i === -2) f = !0, d++;
			else if (i !== -1) {
				l++;
				break;
			}
		}
		if (a._contentTypeTextTrailing && o === i.length && (d = 0), d) {
			let c = {
				type: o === i.length || f || d < 2 ? "lineSuffix" : "hardBreakTrailing",
				start: {
					_bufferIndex: l ? u : s.start._bufferIndex + u,
					_index: s.start._index + l,
					line: s.end.line,
					column: s.end.column - d,
					offset: s.end.offset - d
				},
				end: { ...s.end }
			};
			s.end = { ...c.start }, s.start.offset === s.end.offset ? Object.assign(s, c) : (i.splice(o, 0, [
				"enter",
				c,
				a
			], [
				"exit",
				c,
				a
			]), o += 2);
		}
		o++;
	}
	return i;
}
var constructs_exports = /* @__PURE__ */ __export({
	attentionMarkers: () => attentionMarkers,
	contentInitial: () => contentInitial,
	disable: () => disable,
	document: () => document$2,
	flow: () => flow$1,
	flowInitial: () => flowInitial,
	insideSpan: () => insideSpan,
	string: () => string$1,
	text: () => text$4
});
const document$2 = {
	42: list$2,
	43: list$2,
	45: list$2,
	48: list$2,
	49: list$2,
	50: list$2,
	51: list$2,
	52: list$2,
	53: list$2,
	54: list$2,
	55: list$2,
	56: list$2,
	57: list$2,
	62: blockQuote
}, contentInitial = { 91: definition$1 }, flowInitial = {
	[-2]: codeIndented,
	[-1]: codeIndented,
	32: codeIndented
}, flow$1 = {
	35: headingAtx,
	42: thematicBreak$2,
	45: [setextUnderline, thematicBreak$2],
	60: htmlFlow,
	61: setextUnderline,
	95: thematicBreak$2,
	96: codeFenced,
	126: codeFenced
}, string$1 = {
	38: characterReference,
	92: characterEscape
}, text$4 = {
	[-5]: lineEnding,
	[-4]: lineEnding,
	[-3]: lineEnding,
	33: labelStartImage,
	38: characterReference,
	42: attention,
	60: [autolink, htmlText],
	91: labelStartLink,
	92: [hardBreakEscape, characterEscape],
	93: labelEnd,
	95: attention,
	96: codeText
}, insideSpan = { null: [attention, resolver] }, attentionMarkers = { null: [42, 95] }, disable = { null: [] };
function createTokenizer(i, a, o) {
	let s = {
		_bufferIndex: -1,
		_index: 0,
		line: o && o.line || 1,
		column: o && o.column || 1,
		offset: o && o.offset || 0
	}, c = {}, l = [], u = [], d = [], f = {
		attempt: D(T),
		check: D(E),
		consume: S,
		enter: C,
		exit: w,
		interrupt: D(E, { interrupt: !0 })
	}, p = {
		code: null,
		containerState: {},
		defineSkip: y,
		events: [],
		now: v,
		parser: i,
		previous: null,
		sliceSerialize: g,
		sliceStream: _,
		write: h
	}, m = a.tokenize.call(p, f);
	return a.resolveAll && l.push(a), p;
	function h(i) {
		return u = push(u, i), b(), u[u.length - 1] === null ? (O(a, 0), p.events = resolveAll(l, p.events, p), p.events) : [];
	}
	function g(i, a) {
		return serializeChunks(_(i), a);
	}
	function _(i) {
		return sliceChunks(u, i);
	}
	function v() {
		let { _bufferIndex: i, _index: a, line: o, column: c, offset: l } = s;
		return {
			_bufferIndex: i,
			_index: a,
			line: o,
			column: c,
			offset: l
		};
	}
	function y(i) {
		c[i.line] = i.column, A();
	}
	function b() {
		let i;
		for (; s._index < u.length;) {
			let a = u[s._index];
			if (typeof a == "string") for (i = s._index, s._bufferIndex < 0 && (s._bufferIndex = 0); s._index === i && s._bufferIndex < a.length;) x(a.charCodeAt(s._bufferIndex));
			else x(a);
		}
	}
	function x(i) {
		m = m(i);
	}
	function S(i) {
		markdownLineEnding(i) ? (s.line++, s.column = 1, s.offset += i === -3 ? 2 : 1, A()) : i !== -1 && (s.column++, s.offset++), s._bufferIndex < 0 ? s._index++ : (s._bufferIndex++, s._bufferIndex === u[s._index].length && (s._bufferIndex = -1, s._index++)), p.previous = i;
	}
	function C(i, a) {
		let o = a || {};
		return o.type = i, o.start = v(), p.events.push([
			"enter",
			o,
			p
		]), d.push(o), o;
	}
	function w(i) {
		let a = d.pop();
		return a.end = v(), p.events.push([
			"exit",
			a,
			p
		]), a;
	}
	function T(i, a) {
		O(i, a.from);
	}
	function E(i, a) {
		a.restore();
	}
	function D(i, a) {
		return o;
		function o(o, s, c) {
			let l, u, d, m;
			return Array.isArray(o) ? g(o) : "tokenize" in o ? g([o]) : h(o);
			function h(i) {
				return a;
				function a(a) {
					let o = a !== null && i[a], s = a !== null && i.null;
					return g([...Array.isArray(o) ? o : o ? [o] : [], ...Array.isArray(s) ? s : s ? [s] : []])(a);
				}
			}
			function g(i) {
				return l = i, u = 0, i.length === 0 ? c : _(i[u]);
			}
			function _(i) {
				return o;
				function o(o) {
					return m = k(), d = i, i.partial || (p.currentConstruct = i), i.name && p.parser.constructs.disable.null.includes(i.name) ? y(o) : i.tokenize.call(a ? Object.assign(Object.create(p), a) : p, f, v, y)(o);
				}
			}
			function v(a) {
				return i(d, m), s;
			}
			function y(i) {
				return m.restore(), ++u < l.length ? _(l[u]) : c;
			}
		}
	}
	function O(i, a) {
		i.resolveAll && !l.includes(i) && l.push(i), i.resolve && splice(p.events, a, p.events.length - a, i.resolve(p.events.slice(a), p)), i.resolveTo && (p.events = i.resolveTo(p.events, p));
	}
	function k() {
		let i = v(), a = p.previous, o = p.currentConstruct, c = p.events.length, l = Array.from(d);
		return {
			from: c,
			restore: u
		};
		function u() {
			s = i, p.previous = a, p.currentConstruct = o, p.events.length = c, d = l, A();
		}
	}
	function A() {
		s.line in c && s.column < 2 && (s.column = c[s.line], s.offset += c[s.line] - 1);
	}
}
function sliceChunks(i, a) {
	let o = a.start._index, s = a.start._bufferIndex, c = a.end._index, l = a.end._bufferIndex, u;
	if (o === c) u = [i[o].slice(s, l)];
	else {
		if (u = i.slice(o, c), s > -1) {
			let i = u[0];
			typeof i == "string" ? u[0] = i.slice(s) : u.shift();
		}
		l > 0 && u.push(i[c].slice(0, l));
	}
	return u;
}
function serializeChunks(i, a) {
	let o = -1, s = [], c;
	for (; ++o < i.length;) {
		let l = i[o], u;
		if (typeof l == "string") u = l;
		else switch (l) {
			case -5:
				u = "\r";
				break;
			case -4:
				u = "\n";
				break;
			case -3:
				u = "\r\n";
				break;
			case -2:
				u = a ? " " : "	";
				break;
			case -1:
				if (!a && c) continue;
				u = " ";
				break;
			default: u = String.fromCharCode(l);
		}
		c = l === -2, s.push(u);
	}
	return s.join("");
}
function parse$1(i) {
	let a = {
		constructs: combineExtensions([constructs_exports, ...(i || {}).extensions || []]),
		content: o(content),
		defined: [],
		document: o(document$1),
		flow: o(flow),
		lazy: {},
		string: o(string),
		text: o(text$3)
	};
	return a;
	function o(i) {
		return o;
		function o(o) {
			return createTokenizer(a, i, o);
		}
	}
}
function postprocess(i) {
	for (; !subtokenize(i););
	return i;
}
var search = /[\0\t\n\r]/g;
function preprocess() {
	let i = 1, a = "", o = !0, s;
	return c;
	function c(c, l, u) {
		let d = [], f, p, m, h, g;
		for (c = a + (typeof c == "string" ? c.toString() : new TextDecoder(l || void 0).decode(c)), m = 0, a = "", o &&= (c.charCodeAt(0) === 65279 && m++, void 0); m < c.length;) {
			if (search.lastIndex = m, f = search.exec(c), h = f && f.index !== void 0 ? f.index : c.length, g = c.charCodeAt(h), !f) {
				a = c.slice(m);
				break;
			}
			if (g === 10 && m === h && s) d.push(-3), s = void 0;
			else switch (s &&= (d.push(-5), void 0), m < h && (d.push(c.slice(m, h)), i += h - m), g) {
				case 0:
					d.push(65533), i++;
					break;
				case 9:
					for (p = Math.ceil(i / 4) * 4, d.push(-2); i++ < p;) d.push(-1);
					break;
				case 10:
					d.push(-4), i = 1;
					break;
				default: s = !0, i = 1;
			}
			m = h + 1;
		}
		return u && (s && d.push(-5), a && d.push(a), d.push(null)), d;
	}
}
var characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function decodeString(i) {
	return i.replace(characterEscapeOrReference, decode);
}
function decode(i, a, o) {
	if (a) return a;
	if (o.charCodeAt(0) === 35) {
		let i = o.charCodeAt(1), a = i === 120 || i === 88;
		return decodeNumericCharacterReference(o.slice(a ? 2 : 1), a ? 16 : 10);
	}
	return decodeNamedCharacterReference(o) || i;
}
var own$2 = {}.hasOwnProperty;
function fromMarkdown(i, a, o) {
	return typeof a != "string" && (o = a, a = void 0), compiler(o)(postprocess(parse$1(o).document().write(preprocess()(i, a, !0))));
}
function compiler(i) {
	let a = {
		transforms: [],
		canContainEols: [
			"emphasis",
			"fragment",
			"heading",
			"paragraph",
			"strong"
		],
		enter: {
			autolink: l(Bj),
			autolinkProtocol: k,
			autolinkEmail: k,
			atxHeading: l(Ij),
			blockQuote: l(Z),
			characterEscape: k,
			characterReference: k,
			codeFenced: l(Q),
			codeFencedFenceInfo: u,
			codeFencedFenceMeta: u,
			codeIndented: l(Q, u),
			codeText: l($, u),
			codeTextData: k,
			data: k,
			codeFlowValue: k,
			definition: l(Pj),
			definitionDestinationString: u,
			definitionLabelString: u,
			definitionTitleString: u,
			emphasis: l(Fj),
			hardBreakEscape: l(Lj),
			hardBreakTrailing: l(Lj),
			htmlFlow: l(Rj, u),
			htmlFlowData: k,
			htmlText: l(Rj, u),
			htmlTextData: k,
			image: l(zj),
			label: u,
			link: l(Bj),
			listItem: l(Hj),
			listItemValue: g,
			listOrdered: l(Vj, h),
			listUnordered: l(Vj),
			paragraph: l(Uj),
			reference: U,
			referenceString: u,
			resourceDestinationString: u,
			resourceTitleString: u,
			setextHeading: l(Ij),
			strong: l(Wj),
			thematicBreak: l(Kj)
		},
		exit: {
			atxHeading: f(),
			atxHeadingSequence: T,
			autolink: f(),
			autolinkEmail: Y,
			autolinkProtocol: J,
			blockQuote: f(),
			characterEscapeValue: A,
			characterReferenceMarkerHexadecimal: G,
			characterReferenceMarkerNumeric: G,
			characterReferenceValue: K,
			characterReference: q,
			codeFenced: f(b),
			codeFencedFence: y,
			codeFencedFenceInfo: _,
			codeFencedFenceMeta: v,
			codeFlowValue: A,
			codeIndented: f(x),
			codeText: f(F),
			codeTextData: A,
			data: A,
			definition: f(),
			definitionDestinationString: w,
			definitionLabelString: S,
			definitionTitleString: C,
			emphasis: f(),
			hardBreakEscape: f(M),
			hardBreakTrailing: f(M),
			htmlFlow: f(N),
			htmlFlowData: A,
			htmlText: f(P),
			htmlTextData: A,
			image: f(L),
			label: z,
			labelText: R,
			lineEnding: j,
			link: f(I),
			listItem: f(),
			listOrdered: f(),
			listUnordered: f(),
			paragraph: f(),
			referenceString: W,
			resourceDestinationString: B,
			resourceTitleString: V,
			resource: H,
			setextHeading: f(O),
			setextHeadingLineSequence: D,
			setextHeadingText: E,
			strong: f(),
			thematicBreak: f()
		}
	};
	configure(a, (i || {}).mdastExtensions || []);
	let o = {};
	return s;
	function s(i) {
		let s = {
			type: "root",
			children: []
		}, l = {
			stack: [s],
			tokenStack: [],
			config: a,
			enter: d,
			exit: p,
			buffer: u,
			resume: m,
			data: o
		}, f = [], h = -1;
		for (; ++h < i.length;) (i[h][1].type === "listOrdered" || i[h][1].type === "listUnordered") && (i[h][0] === "enter" ? f.push(h) : h = c(i, f.pop(), h));
		for (h = -1; ++h < i.length;) {
			let o = a[i[h][0]];
			own$2.call(o, i[h][1].type) && o[i[h][1].type].call(Object.assign({ sliceSerialize: i[h][2].sliceSerialize }, l), i[h][1]);
		}
		if (l.tokenStack.length > 0) {
			let i = l.tokenStack[l.tokenStack.length - 1];
			(i[1] || defaultOnError).call(l, void 0, i[0]);
		}
		for (s.position = {
			start: point(i.length > 0 ? i[0][1].start : {
				line: 1,
				column: 1,
				offset: 0
			}),
			end: point(i.length > 0 ? i[i.length - 2][1].end : {
				line: 1,
				column: 1,
				offset: 0
			})
		}, h = -1; ++h < a.transforms.length;) s = a.transforms[h](s) || s;
		return s;
	}
	function c(i, a, o) {
		let s = a - 1, c = -1, l = !1, u, d, f, p;
		for (; ++s <= o;) {
			let a = i[s];
			switch (a[1].type) {
				case "listUnordered":
				case "listOrdered":
				case "blockQuote":
					a[0] === "enter" ? c++ : c--, p = void 0;
					break;
				case "lineEndingBlank":
					a[0] === "enter" && (u && !p && !c && !f && (f = s), p = void 0);
					break;
				case "linePrefix":
				case "listItemValue":
				case "listItemMarker":
				case "listItemPrefix":
				case "listItemPrefixWhitespace": break;
				default: p = void 0;
			}
			if (!c && a[0] === "enter" && a[1].type === "listItemPrefix" || c === -1 && a[0] === "exit" && (a[1].type === "listUnordered" || a[1].type === "listOrdered")) {
				if (u) {
					let c = s;
					for (d = void 0; c--;) {
						let a = i[c];
						if (a[1].type === "lineEnding" || a[1].type === "lineEndingBlank") {
							if (a[0] === "exit") continue;
							d && (i[d][1].type = "lineEndingBlank", l = !0), a[1].type = "lineEnding", d = c;
						} else if (!(a[1].type === "linePrefix" || a[1].type === "blockQuotePrefix" || a[1].type === "blockQuotePrefixWhitespace" || a[1].type === "blockQuoteMarker" || a[1].type === "listItemIndent")) break;
					}
					f && (!d || f < d) && (u._spread = !0), u.end = Object.assign({}, d ? i[d][1].start : a[1].end), i.splice(d || s, 0, [
						"exit",
						u,
						a[2]
					]), s++, o++;
				}
				if (a[1].type === "listItemPrefix") {
					let c = {
						type: "listItem",
						_spread: !1,
						start: Object.assign({}, a[1].start),
						end: void 0
					};
					u = c, i.splice(s, 0, [
						"enter",
						c,
						a[2]
					]), s++, o++, f = void 0, p = !0;
				}
			}
		}
		return i[a][1]._spread = l, o;
	}
	function l(i, a) {
		return o;
		function o(o) {
			d.call(this, i(o), o), a && a.call(this, o);
		}
	}
	function u() {
		this.stack.push({
			type: "fragment",
			children: []
		});
	}
	function d(i, a, o) {
		this.stack[this.stack.length - 1].children.push(i), this.stack.push(i), this.tokenStack.push([a, o || void 0]), i.position = {
			start: point(a.start),
			end: void 0
		};
	}
	function f(i) {
		return a;
		function a(a) {
			i && i.call(this, a), p.call(this, a);
		}
	}
	function p(i, a) {
		let o = this.stack.pop(), s = this.tokenStack.pop();
		if (s) s[0].type !== i.type && (a ? a.call(this, i, s[0]) : (s[1] || defaultOnError).call(this, i, s[0]));
		else throw Error("Cannot close `" + i.type + "` (" + stringifyPosition({
			start: i.start,
			end: i.end
		}) + "): it’s not open");
		o.position.end = point(i.end);
	}
	function m() {
		return toString(this.stack.pop());
	}
	function h() {
		this.data.expectingFirstListItemValue = !0;
	}
	function g(i) {
		if (this.data.expectingFirstListItemValue) {
			let a = this.stack[this.stack.length - 2];
			a.start = Number.parseInt(this.sliceSerialize(i), 10), this.data.expectingFirstListItemValue = void 0;
		}
	}
	function _() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.lang = i;
	}
	function v() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.meta = i;
	}
	function y() {
		this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
	}
	function b() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.value = i.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
	}
	function x() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.value = i.replace(/(\r?\n|\r)$/g, "");
	}
	function S(i) {
		let a = this.resume(), o = this.stack[this.stack.length - 1];
		o.label = a, o.identifier = normalizeIdentifier(this.sliceSerialize(i)).toLowerCase();
	}
	function C() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.title = i;
	}
	function w() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.url = i;
	}
	function T(i) {
		let a = this.stack[this.stack.length - 1];
		a.depth ||= this.sliceSerialize(i).length;
	}
	function E() {
		this.data.setextHeadingSlurpLineEnding = !0;
	}
	function D(i) {
		let a = this.stack[this.stack.length - 1];
		a.depth = this.sliceSerialize(i).codePointAt(0) === 61 ? 1 : 2;
	}
	function O() {
		this.data.setextHeadingSlurpLineEnding = void 0;
	}
	function k(i) {
		let a = this.stack[this.stack.length - 1].children, o = a[a.length - 1];
		(!o || o.type !== "text") && (o = Gj(), o.position = {
			start: point(i.start),
			end: void 0
		}, a.push(o)), this.stack.push(o);
	}
	function A(i) {
		let a = this.stack.pop();
		a.value += this.sliceSerialize(i), a.position.end = point(i.end);
	}
	function j(i) {
		let o = this.stack[this.stack.length - 1];
		if (this.data.atHardBreak) {
			let a = o.children[o.children.length - 1];
			a.position.end = point(i.end), this.data.atHardBreak = void 0;
			return;
		}
		!this.data.setextHeadingSlurpLineEnding && a.canContainEols.includes(o.type) && (k.call(this, i), A.call(this, i));
	}
	function M() {
		this.data.atHardBreak = !0;
	}
	function N() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.value = i;
	}
	function P() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.value = i;
	}
	function F() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.value = i;
	}
	function I() {
		let i = this.stack[this.stack.length - 1];
		if (this.data.inReference) {
			let a = this.data.referenceType || "shortcut";
			i.type += "Reference", i.referenceType = a, delete i.url, delete i.title;
		} else delete i.identifier, delete i.label;
		this.data.referenceType = void 0;
	}
	function L() {
		let i = this.stack[this.stack.length - 1];
		if (this.data.inReference) {
			let a = this.data.referenceType || "shortcut";
			i.type += "Reference", i.referenceType = a, delete i.url, delete i.title;
		} else delete i.identifier, delete i.label;
		this.data.referenceType = void 0;
	}
	function R(i) {
		let a = this.sliceSerialize(i), o = this.stack[this.stack.length - 2];
		o.label = decodeString(a), o.identifier = normalizeIdentifier(a).toLowerCase();
	}
	function z() {
		let i = this.stack[this.stack.length - 1], a = this.resume(), o = this.stack[this.stack.length - 1];
		this.data.inReference = !0, o.type === "link" ? o.children = i.children : o.alt = a;
	}
	function B() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.url = i;
	}
	function V() {
		let i = this.resume(), a = this.stack[this.stack.length - 1];
		a.title = i;
	}
	function H() {
		this.data.inReference = void 0;
	}
	function U() {
		this.data.referenceType = "collapsed";
	}
	function W(i) {
		let a = this.resume(), o = this.stack[this.stack.length - 1];
		o.label = a, o.identifier = normalizeIdentifier(this.sliceSerialize(i)).toLowerCase(), this.data.referenceType = "full";
	}
	function G(i) {
		this.data.characterReferenceType = i.type;
	}
	function K(i) {
		let a = this.sliceSerialize(i), o = this.data.characterReferenceType, s;
		o ? (s = decodeNumericCharacterReference(a, o === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : s = decodeNamedCharacterReference(a);
		let c = this.stack[this.stack.length - 1];
		c.value += s;
	}
	function q(i) {
		let a = this.stack.pop();
		a.position.end = point(i.end);
	}
	function J(i) {
		A.call(this, i);
		let a = this.stack[this.stack.length - 1];
		a.url = this.sliceSerialize(i);
	}
	function Y(i) {
		A.call(this, i);
		let a = this.stack[this.stack.length - 1];
		a.url = "mailto:" + this.sliceSerialize(i);
	}
	function Z() {
		return {
			type: "blockquote",
			children: []
		};
	}
	function Q() {
		return {
			type: "code",
			lang: null,
			meta: null,
			value: ""
		};
	}
	function $() {
		return {
			type: "inlineCode",
			value: ""
		};
	}
	function Pj() {
		return {
			type: "definition",
			identifier: "",
			label: null,
			title: null,
			url: ""
		};
	}
	function Fj() {
		return {
			type: "emphasis",
			children: []
		};
	}
	function Ij() {
		return {
			type: "heading",
			depth: 0,
			children: []
		};
	}
	function Lj() {
		return { type: "break" };
	}
	function Rj() {
		return {
			type: "html",
			value: ""
		};
	}
	function zj() {
		return {
			type: "image",
			title: null,
			url: "",
			alt: null
		};
	}
	function Bj() {
		return {
			type: "link",
			title: null,
			url: "",
			children: []
		};
	}
	function Vj(i) {
		return {
			type: "list",
			ordered: i.type === "listOrdered",
			start: null,
			spread: i._spread,
			children: []
		};
	}
	function Hj(i) {
		return {
			type: "listItem",
			spread: i._spread,
			checked: null,
			children: []
		};
	}
	function Uj() {
		return {
			type: "paragraph",
			children: []
		};
	}
	function Wj() {
		return {
			type: "strong",
			children: []
		};
	}
	function Gj() {
		return {
			type: "text",
			value: ""
		};
	}
	function Kj() {
		return { type: "thematicBreak" };
	}
}
function point(i) {
	return {
		line: i.line,
		column: i.column,
		offset: i.offset
	};
}
function configure(i, a) {
	let o = -1;
	for (; ++o < a.length;) {
		let s = a[o];
		Array.isArray(s) ? configure(i, s) : extension(i, s);
	}
}
function extension(i, a) {
	let o;
	for (o in a) if (own$2.call(a, o)) switch (o) {
		case "canContainEols": {
			let s = a[o];
			s && i[o].push(...s);
			break;
		}
		case "transforms": {
			let s = a[o];
			s && i[o].push(...s);
			break;
		}
		case "enter":
		case "exit": {
			let s = a[o];
			s && Object.assign(i[o], s);
			break;
		}
	}
}
function defaultOnError(i, a) {
	throw i ? Error("Cannot close `" + i.type + "` (" + stringifyPosition({
		start: i.start,
		end: i.end
	}) + "): a different token (`" + a.type + "`, " + stringifyPosition({
		start: a.start,
		end: a.end
	}) + ") is open") : Error("Cannot close document, a token (`" + a.type + "`, " + stringifyPosition({
		start: a.start,
		end: a.end
	}) + ") is still open");
}
function remarkParse(i) {
	let a = this;
	a.parser = o;
	function o(o) {
		return fromMarkdown(o, {
			...a.data("settings"),
			...i,
			extensions: a.data("micromarkExtensions") || [],
			mdastExtensions: a.data("fromMarkdownExtensions") || []
		});
	}
}
function blockquote$1(i, a) {
	let o = {
		type: "element",
		tagName: "blockquote",
		properties: {},
		children: i.wrap(i.all(a), !0)
	};
	return i.patch(a, o), i.applyData(a, o);
}
function hardBreak$1(i, a) {
	let o = {
		type: "element",
		tagName: "br",
		properties: {},
		children: []
	};
	return i.patch(a, o), [i.applyData(a, o), {
		type: "text",
		value: "\n"
	}];
}
function code$2(i, a) {
	let o = a.value ? a.value + "\n" : "", s = {}, c = a.lang ? a.lang.split(/\s+/) : [];
	c.length > 0 && (s.className = ["language-" + c[0]]);
	let l = {
		type: "element",
		tagName: "code",
		properties: s,
		children: [{
			type: "text",
			value: o
		}]
	};
	return a.meta && (l.data = { meta: a.meta }), i.patch(a, l), l = i.applyData(a, l), l = {
		type: "element",
		tagName: "pre",
		properties: {},
		children: [l]
	}, i.patch(a, l), l;
}
function strikethrough(i, a) {
	let o = {
		type: "element",
		tagName: "del",
		properties: {},
		children: i.all(a)
	};
	return i.patch(a, o), i.applyData(a, o);
}
function emphasis$1(i, a) {
	let o = {
		type: "element",
		tagName: "em",
		properties: {},
		children: i.all(a)
	};
	return i.patch(a, o), i.applyData(a, o);
}
function footnoteReference$1(i, a) {
	let o = typeof i.options.clobberPrefix == "string" ? i.options.clobberPrefix : "user-content-", s = String(a.identifier).toUpperCase(), c = normalizeUri(s.toLowerCase()), l = i.footnoteOrder.indexOf(s), u, d = i.footnoteCounts.get(s);
	d === void 0 ? (d = 0, i.footnoteOrder.push(s), u = i.footnoteOrder.length) : u = l + 1, d += 1, i.footnoteCounts.set(s, d);
	let f = {
		type: "element",
		tagName: "a",
		properties: {
			href: "#" + o + "fn-" + c,
			id: o + "fnref-" + c + (d > 1 ? "-" + d : ""),
			dataFootnoteRef: !0,
			ariaDescribedBy: ["footnote-label"]
		},
		children: [{
			type: "text",
			value: String(u)
		}]
	};
	i.patch(a, f);
	let p = {
		type: "element",
		tagName: "sup",
		properties: {},
		children: [f]
	};
	return i.patch(a, p), i.applyData(a, p);
}
function heading$1(i, a) {
	let o = {
		type: "element",
		tagName: "h" + a.depth,
		properties: {},
		children: i.all(a)
	};
	return i.patch(a, o), i.applyData(a, o);
}
function html$1(i, a) {
	if (i.options.allowDangerousHtml) {
		let o = {
			type: "raw",
			value: a.value
		};
		return i.patch(a, o), i.applyData(a, o);
	}
}
function revert(i, a) {
	let o = a.referenceType, s = "]";
	if (o === "collapsed" ? s += "[]" : o === "full" && (s += "[" + (a.label || a.identifier) + "]"), a.type === "imageReference") return [{
		type: "text",
		value: "![" + a.alt + s
	}];
	let c = i.all(a), l = c[0];
	l && l.type === "text" ? l.value = "[" + l.value : c.unshift({
		type: "text",
		value: "["
	});
	let u = c[c.length - 1];
	return u && u.type === "text" ? u.value += s : c.push({
		type: "text",
		value: s
	}), c;
}
function imageReference$1(i, a) {
	let o = String(a.identifier).toUpperCase(), s = i.definitionById.get(o);
	if (!s) return revert(i, a);
	let c = {
		src: normalizeUri(s.url || ""),
		alt: a.alt
	};
	s.title !== null && s.title !== void 0 && (c.title = s.title);
	let l = {
		type: "element",
		tagName: "img",
		properties: c,
		children: []
	};
	return i.patch(a, l), i.applyData(a, l);
}
function image$1(i, a) {
	let o = { src: normalizeUri(a.url) };
	a.alt !== null && a.alt !== void 0 && (o.alt = a.alt), a.title !== null && a.title !== void 0 && (o.title = a.title);
	let s = {
		type: "element",
		tagName: "img",
		properties: o,
		children: []
	};
	return i.patch(a, s), i.applyData(a, s);
}
function inlineCode$1(i, a) {
	let o = {
		type: "text",
		value: a.value.replace(/\r?\n|\r/g, " ")
	};
	i.patch(a, o);
	let s = {
		type: "element",
		tagName: "code",
		properties: {},
		children: [o]
	};
	return i.patch(a, s), i.applyData(a, s);
}
function linkReference$1(i, a) {
	let o = String(a.identifier).toUpperCase(), s = i.definitionById.get(o);
	if (!s) return revert(i, a);
	let c = { href: normalizeUri(s.url || "") };
	s.title !== null && s.title !== void 0 && (c.title = s.title);
	let l = {
		type: "element",
		tagName: "a",
		properties: c,
		children: i.all(a)
	};
	return i.patch(a, l), i.applyData(a, l);
}
function link$1(i, a) {
	let o = { href: normalizeUri(a.url) };
	a.title !== null && a.title !== void 0 && (o.title = a.title);
	let s = {
		type: "element",
		tagName: "a",
		properties: o,
		children: i.all(a)
	};
	return i.patch(a, s), i.applyData(a, s);
}
function listItem$1(i, a, o) {
	let s = i.all(a), c = o ? listLoose(o) : listItemLoose(a), l = {}, u = [];
	if (typeof a.checked == "boolean") {
		let i = s[0], o;
		i && i.type === "element" && i.tagName === "p" ? o = i : (o = {
			type: "element",
			tagName: "p",
			properties: {},
			children: []
		}, s.unshift(o)), o.children.length > 0 && o.children.unshift({
			type: "text",
			value: " "
		}), o.children.unshift({
			type: "element",
			tagName: "input",
			properties: {
				type: "checkbox",
				checked: a.checked,
				disabled: !0
			},
			children: []
		}), l.className = ["task-list-item"];
	}
	let d = -1;
	for (; ++d < s.length;) {
		let i = s[d];
		(c || d !== 0 || i.type !== "element" || i.tagName !== "p") && u.push({
			type: "text",
			value: "\n"
		}), i.type === "element" && i.tagName === "p" && !c ? u.push(...i.children) : u.push(i);
	}
	let f = s[s.length - 1];
	f && (c || f.type !== "element" || f.tagName !== "p") && u.push({
		type: "text",
		value: "\n"
	});
	let p = {
		type: "element",
		tagName: "li",
		properties: l,
		children: u
	};
	return i.patch(a, p), i.applyData(a, p);
}
function listLoose(i) {
	let a = !1;
	if (i.type === "list") {
		a = i.spread || !1;
		let o = i.children, s = -1;
		for (; !a && ++s < o.length;) a = listItemLoose(o[s]);
	}
	return a;
}
function listItemLoose(i) {
	return i.spread ?? i.children.length > 1;
}
function list$1(i, a) {
	let o = {}, s = i.all(a), c = -1;
	for (typeof a.start == "number" && a.start !== 1 && (o.start = a.start); ++c < s.length;) {
		let i = s[c];
		if (i.type === "element" && i.tagName === "li" && i.properties && Array.isArray(i.properties.className) && i.properties.className.includes("task-list-item")) {
			o.className = ["contains-task-list"];
			break;
		}
	}
	let l = {
		type: "element",
		tagName: a.ordered ? "ol" : "ul",
		properties: o,
		children: i.wrap(s, !0)
	};
	return i.patch(a, l), i.applyData(a, l);
}
function paragraph$1(i, a) {
	let o = {
		type: "element",
		tagName: "p",
		properties: {},
		children: i.all(a)
	};
	return i.patch(a, o), i.applyData(a, o);
}
function root$1(i, a) {
	let o = {
		type: "root",
		children: i.wrap(i.all(a))
	};
	return i.patch(a, o), i.applyData(a, o);
}
function strong$1(i, a) {
	let o = {
		type: "element",
		tagName: "strong",
		properties: {},
		children: i.all(a)
	};
	return i.patch(a, o), i.applyData(a, o);
}
function table(i, a) {
	let o = i.all(a), s = o.shift(), c = [];
	if (s) {
		let o = {
			type: "element",
			tagName: "thead",
			properties: {},
			children: i.wrap([s], !0)
		};
		i.patch(a.children[0], o), c.push(o);
	}
	if (o.length > 0) {
		let s = {
			type: "element",
			tagName: "tbody",
			properties: {},
			children: i.wrap(o, !0)
		}, l = pointStart(a.children[1]), u = pointEnd(a.children[a.children.length - 1]);
		l && u && (s.position = {
			start: l,
			end: u
		}), c.push(s);
	}
	let l = {
		type: "element",
		tagName: "table",
		properties: {},
		children: i.wrap(c, !0)
	};
	return i.patch(a, l), i.applyData(a, l);
}
function tableRow(i, a, o) {
	let s = o ? o.children : void 0, c = (s ? s.indexOf(a) : 1) === 0 ? "th" : "td", l = o && o.type === "table" ? o.align : void 0, u = l ? l.length : a.children.length, d = -1, f = [];
	for (; ++d < u;) {
		let o = a.children[d], s = {}, u = l ? l[d] : void 0;
		u && (s.align = u);
		let p = {
			type: "element",
			tagName: c,
			properties: s,
			children: []
		};
		o && (p.children = i.all(o), i.patch(o, p), p = i.applyData(o, p)), f.push(p);
	}
	let p = {
		type: "element",
		tagName: "tr",
		properties: {},
		children: i.wrap(f, !0)
	};
	return i.patch(a, p), i.applyData(a, p);
}
function tableCell(i, a) {
	let o = {
		type: "element",
		tagName: "td",
		properties: {},
		children: i.all(a)
	};
	return i.patch(a, o), i.applyData(a, o);
}
var tab = 9, space = 32;
function trimLines(i) {
	let a = String(i), o = /\r?\n|\r/g, s = o.exec(a), c = 0, l = [];
	for (; s;) l.push(trimLine(a.slice(c, s.index), c > 0, !0), s[0]), c = s.index + s[0].length, s = o.exec(a);
	return l.push(trimLine(a.slice(c), c > 0, !1)), l.join("");
}
function trimLine(i, a, o) {
	let s = 0, c = i.length;
	if (a) {
		let a = i.codePointAt(s);
		for (; a === tab || a === space;) s++, a = i.codePointAt(s);
	}
	if (o) {
		let a = i.codePointAt(c - 1);
		for (; a === tab || a === space;) c--, a = i.codePointAt(c - 1);
	}
	return c > s ? i.slice(s, c) : "";
}
function text$2(i, a) {
	let o = {
		type: "text",
		value: trimLines(String(a.value))
	};
	return i.patch(a, o), i.applyData(a, o);
}
function thematicBreak$1(i, a) {
	let o = {
		type: "element",
		tagName: "hr",
		properties: {},
		children: []
	};
	return i.patch(a, o), i.applyData(a, o);
}
const handlers = {
	blockquote: blockquote$1,
	break: hardBreak$1,
	code: code$2,
	delete: strikethrough,
	emphasis: emphasis$1,
	footnoteReference: footnoteReference$1,
	heading: heading$1,
	html: html$1,
	imageReference: imageReference$1,
	image: image$1,
	inlineCode: inlineCode$1,
	linkReference: linkReference$1,
	link: link$1,
	listItem: listItem$1,
	list: list$1,
	paragraph: paragraph$1,
	root: root$1,
	strong: strong$1,
	table,
	tableCell,
	tableRow,
	text: text$2,
	thematicBreak: thematicBreak$1,
	toml: ignore,
	yaml: ignore,
	definition: ignore,
	footnoteDefinition: ignore
};
function ignore() {}
var env = typeof self == "object" ? self : globalThis, deserializer = (i, a) => {
	let o = (a, o) => (i.set(o, a), a), s = (c) => {
		if (i.has(c)) return i.get(c);
		let [l, u] = a[c];
		switch (l) {
			case 0:
			case -1: return o(u, c);
			case 1: {
				let i = o([], c);
				for (let a of u) i.push(s(a));
				return i;
			}
			case 2: {
				let i = o({}, c);
				for (let [a, o] of u) i[s(a)] = s(o);
				return i;
			}
			case 3: return o(new Date(u), c);
			case 4: {
				let { source: i, flags: a } = u;
				return o(new RegExp(i, a), c);
			}
			case 5: {
				let i = o(/* @__PURE__ */ new Map(), c);
				for (let [a, o] of u) i.set(s(a), s(o));
				return i;
			}
			case 6: {
				let i = o(/* @__PURE__ */ new Set(), c);
				for (let a of u) i.add(s(a));
				return i;
			}
			case 7: {
				let { name: i, message: a } = u;
				return o(new env[i](a), c);
			}
			case 8: return o(BigInt(u), c);
			case "BigInt": return o(Object(BigInt(u)), c);
			case "ArrayBuffer": return o(new Uint8Array(u).buffer, u);
			case "DataView": {
				let { buffer: i } = new Uint8Array(u);
				return o(new DataView(i), u);
			}
		}
		return o(new env[l](u), c);
	};
	return s;
};
const deserialize = (i) => deserializer(/* @__PURE__ */ new Map(), i)(0);
var EMPTY = "", { toString: toString$1 } = {}, { keys } = Object, typeOf = (i) => {
	let a = typeof i;
	if (a !== "object" || !i) return [0, a];
	let o = toString$1.call(i).slice(8, -1);
	switch (o) {
		case "Array": return [1, EMPTY];
		case "Object": return [2, EMPTY];
		case "Date": return [3, EMPTY];
		case "RegExp": return [4, EMPTY];
		case "Map": return [5, EMPTY];
		case "Set": return [6, EMPTY];
		case "DataView": return [1, o];
	}
	return o.includes("Array") ? [1, o] : o.includes("Error") ? [7, o] : [2, o];
}, shouldSkip = ([i, a]) => i === 0 && (a === "function" || a === "symbol"), serializer = (i, a, o, s) => {
	let c = (i, a) => {
		let c = s.push(i) - 1;
		return o.set(a, c), c;
	}, l = (s) => {
		if (o.has(s)) return o.get(s);
		let [u, d] = typeOf(s);
		switch (u) {
			case 0: {
				let a = s;
				switch (d) {
					case "bigint":
						u = 8, a = s.toString();
						break;
					case "function":
					case "symbol":
						if (i) throw TypeError("unable to serialize " + d);
						a = null;
						break;
					case "undefined": return c([-1], s);
				}
				return c([u, a], s);
			}
			case 1: {
				if (d) {
					let i = s;
					return d === "DataView" ? i = new Uint8Array(s.buffer) : d === "ArrayBuffer" && (i = new Uint8Array(s)), c([d, [...i]], s);
				}
				let i = [], a = c([u, i], s);
				for (let a of s) i.push(l(a));
				return a;
			}
			case 2: {
				if (d) switch (d) {
					case "BigInt": return c([d, s.toString()], s);
					case "Boolean":
					case "Number":
					case "String": return c([d, s.valueOf()], s);
				}
				if (a && "toJSON" in s) return l(s.toJSON());
				let o = [], f = c([u, o], s);
				for (let a of keys(s)) (i || !shouldSkip(typeOf(s[a]))) && o.push([l(a), l(s[a])]);
				return f;
			}
			case 3: return c([u, s.toISOString()], s);
			case 4: {
				let { source: i, flags: a } = s;
				return c([u, {
					source: i,
					flags: a
				}], s);
			}
			case 5: {
				let a = [], o = c([u, a], s);
				for (let [o, c] of s) (i || !(shouldSkip(typeOf(o)) || shouldSkip(typeOf(c)))) && a.push([l(o), l(c)]);
				return o;
			}
			case 6: {
				let a = [], o = c([u, a], s);
				for (let o of s) (i || !shouldSkip(typeOf(o))) && a.push(l(o));
				return o;
			}
		}
		let { message: f } = s;
		return c([u, {
			name: d,
			message: f
		}], s);
	};
	return l;
};
const serialize$1 = (i, { json: a, lossy: o } = {}) => {
	let s = [];
	return serializer(!(a || o), !!a, /* @__PURE__ */ new Map(), s)(i), s;
};
var esm_default = typeof structuredClone == "function" ? (i, a) => a && ("json" in a || "lossy" in a) ? deserialize(serialize$1(i, a)) : structuredClone(i) : (i, a) => deserialize(serialize$1(i, a));
function defaultFootnoteBackContent(i, a) {
	let o = [{
		type: "text",
		value: "↩"
	}];
	return a > 1 && o.push({
		type: "element",
		tagName: "sup",
		properties: {},
		children: [{
			type: "text",
			value: String(a)
		}]
	}), o;
}
function defaultFootnoteBackLabel(i, a) {
	return "Back to reference " + (i + 1) + (a > 1 ? "-" + a : "");
}
function footer(i) {
	let a = typeof i.options.clobberPrefix == "string" ? i.options.clobberPrefix : "user-content-", o = i.options.footnoteBackContent || defaultFootnoteBackContent, s = i.options.footnoteBackLabel || defaultFootnoteBackLabel, c = i.options.footnoteLabel || "Footnotes", l = i.options.footnoteLabelTagName || "h2", u = i.options.footnoteLabelProperties || { className: ["sr-only"] }, d = [], f = -1;
	for (; ++f < i.footnoteOrder.length;) {
		let c = i.footnoteById.get(i.footnoteOrder[f]);
		if (!c) continue;
		let l = i.all(c), u = String(c.identifier).toUpperCase(), p = normalizeUri(u.toLowerCase()), m = 0, h = [], g = i.footnoteCounts.get(u);
		for (; g !== void 0 && ++m <= g;) {
			h.length > 0 && h.push({
				type: "text",
				value: " "
			});
			let i = typeof o == "string" ? o : o(f, m);
			typeof i == "string" && (i = {
				type: "text",
				value: i
			}), h.push({
				type: "element",
				tagName: "a",
				properties: {
					href: "#" + a + "fnref-" + p + (m > 1 ? "-" + m : ""),
					dataFootnoteBackref: "",
					ariaLabel: typeof s == "string" ? s : s(f, m),
					className: ["data-footnote-backref"]
				},
				children: Array.isArray(i) ? i : [i]
			});
		}
		let _ = l[l.length - 1];
		if (_ && _.type === "element" && _.tagName === "p") {
			let i = _.children[_.children.length - 1];
			i && i.type === "text" ? i.value += " " : _.children.push({
				type: "text",
				value: " "
			}), _.children.push(...h);
		} else l.push(...h);
		let v = {
			type: "element",
			tagName: "li",
			properties: { id: a + "fn-" + p },
			children: i.wrap(l, !0)
		};
		i.patch(c, v), d.push(v);
	}
	if (d.length !== 0) return {
		type: "element",
		tagName: "section",
		properties: {
			dataFootnotes: !0,
			className: ["footnotes"]
		},
		children: [
			{
				type: "element",
				tagName: l,
				properties: {
					...esm_default(u),
					id: "footnote-label"
				},
				children: [{
					type: "text",
					value: c
				}]
			},
			{
				type: "text",
				value: "\n"
			},
			{
				type: "element",
				tagName: "ol",
				properties: {},
				children: i.wrap(d, !0)
			},
			{
				type: "text",
				value: "\n"
			}
		]
	};
}
const convert = (function(i) {
	if (i == null) return ok$1;
	if (typeof i == "function") return castFactory(i);
	if (typeof i == "object") return Array.isArray(i) ? anyFactory(i) : propertiesFactory(i);
	if (typeof i == "string") return typeFactory(i);
	throw Error("Expected function, string, or object as test");
});
function anyFactory(i) {
	let a = [], o = -1;
	for (; ++o < i.length;) a[o] = convert(i[o]);
	return castFactory(s);
	function s(...i) {
		let o = -1;
		for (; ++o < a.length;) if (a[o].apply(this, i)) return !0;
		return !1;
	}
}
function propertiesFactory(i) {
	let a = i;
	return castFactory(o);
	function o(o) {
		let s = o, c;
		for (c in i) if (s[c] !== a[c]) return !1;
		return !0;
	}
}
function typeFactory(i) {
	return castFactory(a);
	function a(a) {
		return a && a.type === i;
	}
}
function castFactory(i) {
	return a;
	function a(a, o, s) {
		return !!(looksLikeANode(a) && i.call(this, a, typeof o == "number" ? o : void 0, s || void 0));
	}
}
function ok$1() {
	return !0;
}
function looksLikeANode(i) {
	return typeof i == "object" && !!i && "type" in i;
}
function color(i) {
	return i;
}
var empty = [];
function visitParents(i, a, o, s) {
	let c;
	typeof a == "function" && typeof o != "function" ? (s = o, o = a) : c = a;
	let l = convert(c), u = s ? -1 : 1;
	d(i, void 0, [])();
	function d(i, c, f) {
		let p = i && typeof i == "object" ? i : {};
		if (typeof p.type == "string") {
			let a = typeof p.tagName == "string" ? p.tagName : typeof p.name == "string" ? p.name : void 0;
			Object.defineProperty(m, "name", { value: "node (" + color(i.type + (a ? "<" + a + ">" : "")) + ")" });
		}
		return m;
		function m() {
			let p = empty, m, h, g;
			if ((!a || l(i, c, f[f.length - 1] || void 0)) && (p = toResult(o(i, f)), p[0] === !1)) return p;
			if ("children" in i && i.children) {
				let a = i;
				if (a.children && p[0] !== "skip") for (h = (s ? a.children.length : -1) + u, g = f.concat(a); h > -1 && h < a.children.length;) {
					let i = a.children[h];
					if (m = d(i, h, g)(), m[0] === !1) return m;
					h = typeof m[1] == "number" ? m[1] : h + u;
				}
			}
			return p;
		}
	}
}
function toResult(i) {
	return Array.isArray(i) ? i : typeof i == "number" ? [!0, i] : i == null ? empty : [i];
}
function visit(i, a, o, s) {
	let c, l, u;
	typeof a == "function" && typeof o != "function" ? (l = void 0, u = a, c = o) : (l = a, u = o, c = s), visitParents(i, l, d, c);
	function d(i, a) {
		let o = a[a.length - 1], s = o ? o.children.indexOf(i) : void 0;
		return u(i, s, o);
	}
}
var own$1 = {}.hasOwnProperty, emptyOptions$1 = {};
function createState(i, a) {
	let o = a || emptyOptions$1, s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = {
		all: d,
		applyData,
		definitionById: s,
		footnoteById: c,
		footnoteCounts: /* @__PURE__ */ new Map(),
		footnoteOrder: [],
		handlers: {
			...handlers,
			...o.handlers
		},
		one: u,
		options: o,
		patch,
		wrap: wrap$1
	};
	return visit(i, function(i) {
		if (i.type === "definition" || i.type === "footnoteDefinition") {
			let a = i.type === "definition" ? s : c, o = String(i.identifier).toUpperCase();
			a.has(o) || a.set(o, i);
		}
	}), l;
	function u(i, a) {
		let o = i.type, s = l.handlers[o];
		if (own$1.call(l.handlers, o) && s) return s(l, i, a);
		if (l.options.passThrough && l.options.passThrough.includes(o)) {
			if ("children" in i) {
				let { children: a, ...o } = i, s = esm_default(o);
				return s.children = l.all(i), s;
			}
			return esm_default(i);
		}
		return (l.options.unknownHandler || defaultUnknownHandler)(l, i, a);
	}
	function d(i) {
		let a = [];
		if ("children" in i) {
			let o = i.children, s = -1;
			for (; ++s < o.length;) {
				let c = l.one(o[s], i);
				if (c) {
					if (s && o[s - 1].type === "break" && (!Array.isArray(c) && c.type === "text" && (c.value = trimMarkdownSpaceStart(c.value)), !Array.isArray(c) && c.type === "element")) {
						let i = c.children[0];
						i && i.type === "text" && (i.value = trimMarkdownSpaceStart(i.value));
					}
					Array.isArray(c) ? a.push(...c) : a.push(c);
				}
			}
		}
		return a;
	}
}
function patch(i, a) {
	i.position && (a.position = position(i));
}
function applyData(i, a) {
	let o = a;
	if (i && i.data) {
		let a = i.data.hName, s = i.data.hChildren, c = i.data.hProperties;
		typeof a == "string" && (o.type === "element" ? o.tagName = a : o = {
			type: "element",
			tagName: a,
			properties: {},
			children: "children" in o ? o.children : [o]
		}), o.type === "element" && c && Object.assign(o.properties, esm_default(c)), "children" in o && o.children && s != null && (o.children = s);
	}
	return o;
}
function defaultUnknownHandler(i, a) {
	let o = a.data || {}, s = "value" in a && !(own$1.call(o, "hProperties") || own$1.call(o, "hChildren")) ? {
		type: "text",
		value: a.value
	} : {
		type: "element",
		tagName: "div",
		properties: {},
		children: i.all(a)
	};
	return i.patch(a, s), i.applyData(a, s);
}
function wrap$1(i, a) {
	let o = [], s = -1;
	for (a && o.push({
		type: "text",
		value: "\n"
	}); ++s < i.length;) s && o.push({
		type: "text",
		value: "\n"
	}), o.push(i[s]);
	return a && i.length > 0 && o.push({
		type: "text",
		value: "\n"
	}), o;
}
function trimMarkdownSpaceStart(i) {
	let a = 0, o = i.charCodeAt(a);
	for (; o === 9 || o === 32;) a++, o = i.charCodeAt(a);
	return i.slice(a);
}
function toHast(i, a) {
	let o = createState(i, a), s = o.one(i, void 0), c = footer(o), l = Array.isArray(s) ? {
		type: "root",
		children: s
	} : s || {
		type: "root",
		children: []
	};
	return c && ("children" in l, l.children.push({
		type: "text",
		value: "\n"
	}, c)), l;
}
function remarkRehype(i, a) {
	return i && "run" in i ? async function(o, s) {
		let c = toHast(o, {
			file: s,
			...a
		});
		await i.run(c, s);
	} : function(o, s) {
		return toHast(o, {
			file: s,
			...i || a
		});
	};
}
function bail(i) {
	if (i) throw i;
}
var require_extend = /* @__PURE__ */ __commonJSMin(((i, a) => {
	var o = Object.prototype.hasOwnProperty, s = Object.prototype.toString, c = Object.defineProperty, l = Object.getOwnPropertyDescriptor, u = function(i) {
		return typeof Array.isArray == "function" ? Array.isArray(i) : s.call(i) === "[object Array]";
	}, d = function(i) {
		if (!i || s.call(i) !== "[object Object]") return !1;
		var a = o.call(i, "constructor"), c = i.constructor && i.constructor.prototype && o.call(i.constructor.prototype, "isPrototypeOf");
		if (i.constructor && !a && !c) return !1;
		for (var l in i);
		return l === void 0 || o.call(i, l);
	}, f = function(i, a) {
		c && a.name === "__proto__" ? c(i, a.name, {
			enumerable: !0,
			configurable: !0,
			value: a.newValue,
			writable: !0
		}) : i[a.name] = a.newValue;
	}, p = function(i, a) {
		if (a === "__proto__") if (o.call(i, a)) {
			if (l) return l(i, a).value;
		} else return;
		return i[a];
	};
	a.exports = function i() {
		var a, o, s, c, l, m, h = arguments[0], g = 1, _ = arguments.length, v = !1;
		for (typeof h == "boolean" && (v = h, h = arguments[1] || {}, g = 2), (h == null || typeof h != "object" && typeof h != "function") && (h = {}); g < _; ++g) if (a = arguments[g], a != null) for (o in a) s = p(h, o), c = p(a, o), h !== c && (v && c && (d(c) || (l = u(c))) ? (l ? (l = !1, m = s && u(s) ? s : []) : m = s && d(s) ? s : {}, f(h, {
			name: o,
			newValue: i(v, m, c)
		})) : c !== void 0 && f(h, {
			name: o,
			newValue: c
		}));
		return h;
	};
}));
function isPlainObject(i) {
	if (typeof i != "object" || !i) return !1;
	let a = Object.getPrototypeOf(i);
	return (a === null || a === Object.prototype || Object.getPrototypeOf(a) === null) && !(Symbol.toStringTag in i) && !(Symbol.iterator in i);
}
function trough() {
	let i = [], a = {
		run: o,
		use: s
	};
	return a;
	function o(...a) {
		let o = -1, s = a.pop();
		if (typeof s != "function") throw TypeError("Expected function as last argument, not " + s);
		c(null, ...a);
		function c(l, ...u) {
			let d = i[++o], f = -1;
			if (l) {
				s(l);
				return;
			}
			for (; ++f < a.length;) (u[f] === null || u[f] === void 0) && (u[f] = a[f]);
			a = u, d ? wrap(d, c)(...u) : s(null, ...u);
		}
	}
	function s(o) {
		if (typeof o != "function") throw TypeError("Expected `middelware` to be a function, not " + o);
		return i.push(o), a;
	}
}
function wrap(i, a) {
	let o;
	return s;
	function s(...a) {
		let s = i.length > a.length, u;
		s && a.push(c);
		try {
			u = i.apply(this, a);
		} catch (i) {
			let a = i;
			if (s && o) throw a;
			return c(a);
		}
		s || (u && u.then && typeof u.then == "function" ? u.then(l, c) : u instanceof Error ? c(u) : l(u));
	}
	function c(i, ...s) {
		o || (o = !0, a(i, ...s));
	}
	function l(i) {
		c(null, i);
	}
}
const minpath = {
	basename,
	dirname,
	extname,
	join,
	sep: "/"
};
function basename(i, a) {
	if (a !== void 0 && typeof a != "string") throw TypeError("\"ext\" argument must be a string");
	assertPath$1(i);
	let o = 0, s = -1, c = i.length, l;
	if (a === void 0 || a.length === 0 || a.length > i.length) {
		for (; c--;) if (i.codePointAt(c) === 47) {
			if (l) {
				o = c + 1;
				break;
			}
		} else s < 0 && (l = !0, s = c + 1);
		return s < 0 ? "" : i.slice(o, s);
	}
	if (a === i) return "";
	let u = -1, d = a.length - 1;
	for (; c--;) if (i.codePointAt(c) === 47) {
		if (l) {
			o = c + 1;
			break;
		}
	} else u < 0 && (l = !0, u = c + 1), d > -1 && (i.codePointAt(c) === a.codePointAt(d--) ? d < 0 && (s = c) : (d = -1, s = u));
	return o === s ? s = u : s < 0 && (s = i.length), i.slice(o, s);
}
function dirname(i) {
	if (assertPath$1(i), i.length === 0) return ".";
	let a = -1, o = i.length, s;
	for (; --o;) if (i.codePointAt(o) === 47) {
		if (s) {
			a = o;
			break;
		}
	} else s ||= !0;
	return a < 0 ? i.codePointAt(0) === 47 ? "/" : "." : a === 1 && i.codePointAt(0) === 47 ? "//" : i.slice(0, a);
}
function extname(i) {
	assertPath$1(i);
	let a = i.length, o = -1, s = 0, c = -1, l = 0, u;
	for (; a--;) {
		let d = i.codePointAt(a);
		if (d === 47) {
			if (u) {
				s = a + 1;
				break;
			}
			continue;
		}
		o < 0 && (u = !0, o = a + 1), d === 46 ? c < 0 ? c = a : l !== 1 && (l = 1) : c > -1 && (l = -1);
	}
	return c < 0 || o < 0 || l === 0 || l === 1 && c === o - 1 && c === s + 1 ? "" : i.slice(c, o);
}
function join(...i) {
	let a = -1, o;
	for (; ++a < i.length;) assertPath$1(i[a]), i[a] && (o = o === void 0 ? i[a] : o + "/" + i[a]);
	return o === void 0 ? "." : normalize(o);
}
function normalize(i) {
	assertPath$1(i);
	let a = i.codePointAt(0) === 47, o = normalizeString(i, !a);
	return o.length === 0 && !a && (o = "."), o.length > 0 && i.codePointAt(i.length - 1) === 47 && (o += "/"), a ? "/" + o : o;
}
function normalizeString(i, a) {
	let o = "", s = 0, c = -1, l = 0, u = -1, d, f;
	for (; ++u <= i.length;) {
		if (u < i.length) d = i.codePointAt(u);
		else if (d === 47) break;
		else d = 47;
		if (d === 47) {
			if (!(c === u - 1 || l === 1)) if (c !== u - 1 && l === 2) {
				if (o.length < 2 || s !== 2 || o.codePointAt(o.length - 1) !== 46 || o.codePointAt(o.length - 2) !== 46) {
					if (o.length > 2) {
						if (f = o.lastIndexOf("/"), f !== o.length - 1) {
							f < 0 ? (o = "", s = 0) : (o = o.slice(0, f), s = o.length - 1 - o.lastIndexOf("/")), c = u, l = 0;
							continue;
						}
					} else if (o.length > 0) {
						o = "", s = 0, c = u, l = 0;
						continue;
					}
				}
				a && (o = o.length > 0 ? o + "/.." : "..", s = 2);
			} else o.length > 0 ? o += "/" + i.slice(c + 1, u) : o = i.slice(c + 1, u), s = u - c - 1;
			c = u, l = 0;
		} else d === 46 && l > -1 ? l++ : l = -1;
	}
	return o;
}
function assertPath$1(i) {
	if (typeof i != "string") throw TypeError("Path must be a string. Received " + JSON.stringify(i));
}
const minproc = { cwd };
function cwd() {
	return "/";
}
function isUrl(i) {
	return !!(typeof i == "object" && i && "href" in i && i.href && "protocol" in i && i.protocol && i.auth === void 0);
}
function urlToPath(i) {
	if (typeof i == "string") i = new URL(i);
	else if (!isUrl(i)) {
		let a = /* @__PURE__ */ TypeError("The \"path\" argument must be of type string or an instance of URL. Received `" + i + "`");
		throw a.code = "ERR_INVALID_ARG_TYPE", a;
	}
	if (i.protocol !== "file:") {
		let i = /* @__PURE__ */ TypeError("The URL must be of scheme file");
		throw i.code = "ERR_INVALID_URL_SCHEME", i;
	}
	return getPathFromURLPosix(i);
}
function getPathFromURLPosix(i) {
	if (i.hostname !== "") {
		let i = /* @__PURE__ */ TypeError("File URL host must be \"localhost\" or empty on darwin");
		throw i.code = "ERR_INVALID_FILE_URL_HOST", i;
	}
	let a = i.pathname, o = -1;
	for (; ++o < a.length;) if (a.codePointAt(o) === 37 && a.codePointAt(o + 1) === 50) {
		let i = a.codePointAt(o + 2);
		if (i === 70 || i === 102) {
			let i = /* @__PURE__ */ TypeError("File URL path must not include encoded / characters");
			throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
		}
	}
	return decodeURIComponent(a);
}
var order = [
	"history",
	"path",
	"basename",
	"stem",
	"extname",
	"dirname"
], VFile = class {
	constructor(i) {
		let a;
		a = i ? isUrl(i) ? { path: i } : typeof i == "string" || isUint8Array$1(i) ? { value: i } : i : {}, this.cwd = "cwd" in a ? "" : minproc.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
		let o = -1;
		for (; ++o < order.length;) {
			let i = order[o];
			i in a && a[i] !== void 0 && a[i] !== null && (this[i] = i === "history" ? [...a[i]] : a[i]);
		}
		let s;
		for (s in a) order.includes(s) || (this[s] = a[s]);
	}
	get basename() {
		return typeof this.path == "string" ? minpath.basename(this.path) : void 0;
	}
	set basename(i) {
		assertNonEmpty(i, "basename"), assertPart(i, "basename"), this.path = minpath.join(this.dirname || "", i);
	}
	get dirname() {
		return typeof this.path == "string" ? minpath.dirname(this.path) : void 0;
	}
	set dirname(i) {
		assertPath(this.basename, "dirname"), this.path = minpath.join(i || "", this.basename);
	}
	get extname() {
		return typeof this.path == "string" ? minpath.extname(this.path) : void 0;
	}
	set extname(i) {
		if (assertPart(i, "extname"), assertPath(this.dirname, "extname"), i) {
			if (i.codePointAt(0) !== 46) throw Error("`extname` must start with `.`");
			if (i.includes(".", 1)) throw Error("`extname` cannot contain multiple dots");
		}
		this.path = minpath.join(this.dirname, this.stem + (i || ""));
	}
	get path() {
		return this.history[this.history.length - 1];
	}
	set path(i) {
		isUrl(i) && (i = urlToPath(i)), assertNonEmpty(i, "path"), this.path !== i && this.history.push(i);
	}
	get stem() {
		return typeof this.path == "string" ? minpath.basename(this.path, this.extname) : void 0;
	}
	set stem(i) {
		assertNonEmpty(i, "stem"), assertPart(i, "stem"), this.path = minpath.join(this.dirname || "", i + (this.extname || ""));
	}
	fail(i, a, o) {
		let s = this.message(i, a, o);
		throw s.fatal = !0, s;
	}
	info(i, a, o) {
		let s = this.message(i, a, o);
		return s.fatal = void 0, s;
	}
	message(i, a, o) {
		let s = new VFileMessage(i, a, o);
		return this.path && (s.name = this.path + ":" + s.name, s.file = this.path), s.fatal = !1, this.messages.push(s), s;
	}
	toString(i) {
		return this.value === void 0 ? "" : typeof this.value == "string" ? this.value : new TextDecoder(i || void 0).decode(this.value);
	}
};
function assertPart(i, a) {
	if (i && i.includes(minpath.sep)) throw Error("`" + a + "` cannot be a path: did not expect `" + minpath.sep + "`");
}
function assertNonEmpty(i, a) {
	if (!i) throw Error("`" + a + "` cannot be empty");
}
function assertPath(i, a) {
	if (!i) throw Error("Setting `" + a + "` requires `path` to be set too");
}
function isUint8Array$1(i) {
	return !!(i && typeof i == "object" && "byteLength" in i && "byteOffset" in i);
}
const CallableInstance = (function(i) {
	let a = this.constructor.prototype, o = a[i], s = function() {
		return o.apply(s, arguments);
	};
	return Object.setPrototypeOf(s, a), s;
});
var import_extend = /* @__PURE__ */ __toESM(require_extend(), 1), own = {}.hasOwnProperty;
const unified = new class i extends CallableInstance {
	constructor() {
		super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = trough();
	}
	copy() {
		let a = new i(), o = -1;
		for (; ++o < this.attachers.length;) {
			let i = this.attachers[o];
			a.use(...i);
		}
		return a.data((0, import_extend.default)(!0, {}, this.namespace)), a;
	}
	data(i, a) {
		return typeof i == "string" ? arguments.length === 2 ? (assertUnfrozen("data", this.frozen), this.namespace[i] = a, this) : own.call(this.namespace, i) && this.namespace[i] || void 0 : i ? (assertUnfrozen("data", this.frozen), this.namespace = i, this) : this.namespace;
	}
	freeze() {
		if (this.frozen) return this;
		let i = this;
		for (; ++this.freezeIndex < this.attachers.length;) {
			let [a, ...o] = this.attachers[this.freezeIndex];
			if (o[0] === !1) continue;
			o[0] === !0 && (o[0] = void 0);
			let s = a.call(i, ...o);
			typeof s == "function" && this.transformers.use(s);
		}
		return this.frozen = !0, this.freezeIndex = Infinity, this;
	}
	parse(i) {
		this.freeze();
		let a = vfile(i), o = this.parser || this.Parser;
		return assertParser("parse", o), o(String(a), a);
	}
	process(i, a) {
		let o = this;
		return this.freeze(), assertParser("process", this.parser || this.Parser), assertCompiler("process", this.compiler || this.Compiler), a ? s(void 0, a) : new Promise(s);
		function s(s, c) {
			let l = vfile(i), u = o.parse(l);
			o.run(u, l, function(i, a, s) {
				if (i || !a || !s) return d(i);
				let c = a, l = o.stringify(c, s);
				looksLikeAValue(l) ? s.value = l : s.result = l, d(i, s);
			});
			function d(i, o) {
				i || !o ? c(i) : s ? s(o) : a(void 0, o);
			}
		}
	}
	processSync(i) {
		let a = !1, o;
		return this.freeze(), assertParser("processSync", this.parser || this.Parser), assertCompiler("processSync", this.compiler || this.Compiler), this.process(i, s), assertDone("processSync", "process", a), o;
		function s(i, s) {
			a = !0, bail(i), o = s;
		}
	}
	run(i, a, o) {
		assertNode(i), this.freeze();
		let s = this.transformers;
		return !o && typeof a == "function" && (o = a, a = void 0), o ? c(void 0, o) : new Promise(c);
		function c(c, l) {
			let u = vfile(a);
			s.run(i, u, d);
			function d(a, s, u) {
				let d = s || i;
				a ? l(a) : c ? c(d) : o(void 0, d, u);
			}
		}
	}
	runSync(i, a) {
		let o = !1, s;
		return this.run(i, a, c), assertDone("runSync", "run", o), s;
		function c(i, a) {
			bail(i), s = a, o = !0;
		}
	}
	stringify(i, a) {
		this.freeze();
		let o = vfile(a), s = this.compiler || this.Compiler;
		return assertCompiler("stringify", s), assertNode(i), s(i, o);
	}
	use(i, ...a) {
		let o = this.attachers, s = this.namespace;
		if (assertUnfrozen("use", this.frozen), i != null) if (typeof i == "function") d(i, a);
		else if (typeof i == "object") Array.isArray(i) ? u(i) : l(i);
		else throw TypeError("Expected usable value, not `" + i + "`");
		return this;
		function c(i) {
			if (typeof i == "function") d(i, []);
			else if (typeof i == "object") if (Array.isArray(i)) {
				let [a, ...o] = i;
				d(a, o);
			} else l(i);
			else throw TypeError("Expected usable value, not `" + i + "`");
		}
		function l(i) {
			if (!("plugins" in i) && !("settings" in i)) throw Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");
			u(i.plugins), i.settings && (s.settings = (0, import_extend.default)(!0, s.settings, i.settings));
		}
		function u(i) {
			let a = -1;
			if (i != null) if (Array.isArray(i)) for (; ++a < i.length;) {
				let o = i[a];
				c(o);
			}
			else throw TypeError("Expected a list of plugins, not `" + i + "`");
		}
		function d(i, a) {
			let s = -1, c = -1;
			for (; ++s < o.length;) if (o[s][0] === i) {
				c = s;
				break;
			}
			if (c === -1) o.push([i, ...a]);
			else if (a.length > 0) {
				let [s, ...l] = a, u = o[c][1];
				isPlainObject(u) && isPlainObject(s) && (s = (0, import_extend.default)(!0, u, s)), o[c] = [
					i,
					s,
					...l
				];
			}
		}
	}
}().freeze();
function assertParser(i, a) {
	if (typeof a != "function") throw TypeError("Cannot `" + i + "` without `parser`");
}
function assertCompiler(i, a) {
	if (typeof a != "function") throw TypeError("Cannot `" + i + "` without `compiler`");
}
function assertUnfrozen(i, a) {
	if (a) throw Error("Cannot call `" + i + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.");
}
function assertNode(i) {
	if (!isPlainObject(i) || typeof i.type != "string") throw TypeError("Expected node, got `" + i + "`");
}
function assertDone(i, a, o) {
	if (!o) throw Error("`" + i + "` finished async. Use `" + a + "` instead");
}
function vfile(i) {
	return looksLikeAVFile(i) ? i : new VFile(i);
}
function looksLikeAVFile(i) {
	return !!(i && typeof i == "object" && "message" in i && "messages" in i);
}
function looksLikeAValue(i) {
	return typeof i == "string" || isUint8Array(i);
}
function isUint8Array(i) {
	return !!(i && typeof i == "object" && "byteLength" in i && "byteOffset" in i);
}
var emptyPlugins = [], emptyRemarkRehypeOptions = { allowDangerousHtml: !0 }, safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i, deprecations = [
	{
		from: "astPlugins",
		id: "remove-buggy-html-in-markdown-parser"
	},
	{
		from: "allowDangerousHtml",
		id: "remove-buggy-html-in-markdown-parser"
	},
	{
		from: "allowNode",
		id: "replace-allownode-allowedtypes-and-disallowedtypes",
		to: "allowElement"
	},
	{
		from: "allowedTypes",
		id: "replace-allownode-allowedtypes-and-disallowedtypes",
		to: "allowedElements"
	},
	{
		from: "className",
		id: "remove-classname"
	},
	{
		from: "disallowedTypes",
		id: "replace-allownode-allowedtypes-and-disallowedtypes",
		to: "disallowedElements"
	},
	{
		from: "escapeHtml",
		id: "remove-buggy-html-in-markdown-parser"
	},
	{
		from: "includeElementIndex",
		id: "#remove-includeelementindex"
	},
	{
		from: "includeNodeIndex",
		id: "change-includenodeindex-to-includeelementindex"
	},
	{
		from: "linkTarget",
		id: "remove-linktarget"
	},
	{
		from: "plugins",
		id: "change-plugins-to-remarkplugins",
		to: "remarkPlugins"
	},
	{
		from: "rawSourcePos",
		id: "#remove-rawsourcepos"
	},
	{
		from: "renderers",
		id: "change-renderers-to-components",
		to: "components"
	},
	{
		from: "source",
		id: "change-source-to-children",
		to: "children"
	},
	{
		from: "sourcePos",
		id: "#remove-sourcepos"
	},
	{
		from: "transformImageUri",
		id: "#add-urltransform",
		to: "urlTransform"
	},
	{
		from: "transformLinkUri",
		id: "#add-urltransform",
		to: "urlTransform"
	}
];
function Markdown(i) {
	let a = createProcessor(i), o = createFile(i);
	return post(a.runSync(a.parse(o), o), i);
}
function createProcessor(i) {
	let a = i.rehypePlugins || emptyPlugins, o = i.remarkPlugins || emptyPlugins, s = i.remarkRehypeOptions ? {
		...i.remarkRehypeOptions,
		...emptyRemarkRehypeOptions
	} : emptyRemarkRehypeOptions;
	return unified().use(remarkParse).use(o).use(remarkRehype, s).use(a);
}
function createFile(i) {
	let a = i.children || "", o = new VFile();
	return typeof a == "string" ? o.value = a : "" + a, o;
}
function post(i, a) {
	let o = a.allowedElements, s = a.allowElement, c = a.components, l = a.disallowedElements, u = a.skipHtml, d = a.unwrapDisallowed, f = a.urlTransform || defaultUrlTransform;
	for (let i of deprecations) Object.hasOwn(a, i.from) && "" + i.from + (i.to ? "use `" + i.to + "` instead" : "remove it") + i.id;
	return visit(i, p), toJsxRuntime(i, {
		Fragment: Fragment$1,
		components: c,
		ignoreInvalidStyle: !0,
		jsx,
		jsxs,
		passKeys: !0,
		passNode: !0
	});
	function p(i, a, c) {
		if (i.type === "raw" && c && typeof a == "number") return u ? c.children.splice(a, 1) : c.children[a] = {
			type: "text",
			value: i.value
		}, a;
		if (i.type === "element") {
			let a;
			for (a in urlAttributes) if (Object.hasOwn(urlAttributes, a) && Object.hasOwn(i.properties, a)) {
				let o = i.properties[a], s = urlAttributes[a];
				(s === null || s.includes(i.tagName)) && (i.properties[a] = f(String(o || ""), a, i));
			}
		}
		if (i.type === "element") {
			let u = o ? !o.includes(i.tagName) : l ? l.includes(i.tagName) : !1;
			if (!u && s && typeof a == "number" && (u = !s(i, a, c)), u && c && typeof a == "number") return d && i.children ? c.children.splice(a, 1, ...i.children) : c.children.splice(a, 1), a;
		}
	}
}
function defaultUrlTransform(i) {
	let a = i.indexOf(":"), o = i.indexOf("?"), s = i.indexOf("#"), c = i.indexOf("/");
	return a === -1 || c !== -1 && a > c || o !== -1 && a > o || s !== -1 && a > s || safeProtocol.test(i.slice(0, a)) ? i : "";
}
function escapeStringRegexp(i) {
	if (typeof i != "string") throw TypeError("Expected a string");
	return i.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function findAndReplace(i, a, o) {
	let s = convert((o || {}).ignore || []), c = toPairs(a), l = -1;
	for (; ++l < c.length;) visitParents(i, "text", u);
	function u(i, a) {
		let o = -1, c;
		for (; ++o < a.length;) {
			let i = a[o], l = c ? c.children : void 0;
			if (s(i, l ? l.indexOf(i) : void 0, c)) return;
			c = i;
		}
		if (c) return d(i, a);
	}
	function d(i, a) {
		let o = a[a.length - 1], s = c[l][0], u = c[l][1], d = 0, f = o.children.indexOf(i), p = !1, m = [];
		s.lastIndex = 0;
		let h = s.exec(i.value);
		for (; h;) {
			let o = h.index, c = {
				index: h.index,
				input: h.input,
				stack: [...a, i]
			}, l = u(...h, c);
			if (typeof l == "string" && (l = l.length > 0 ? {
				type: "text",
				value: l
			} : void 0), l === !1 ? s.lastIndex = o + 1 : (d !== o && m.push({
				type: "text",
				value: i.value.slice(d, o)
			}), Array.isArray(l) ? m.push(...l) : l && m.push(l), d = o + h[0].length, p = !0), !s.global) break;
			h = s.exec(i.value);
		}
		return p ? (d < i.value.length && m.push({
			type: "text",
			value: i.value.slice(d)
		}), o.children.splice(f, 1, ...m)) : m = [i], f + m.length;
	}
}
function toPairs(i) {
	let a = [];
	if (!Array.isArray(i)) throw TypeError("Expected find and replace tuple or list of tuples");
	let o = !i[0] || Array.isArray(i[0]) ? i : [i], s = -1;
	for (; ++s < o.length;) {
		let i = o[s];
		a.push([toExpression(i[0]), toFunction(i[1])]);
	}
	return a;
}
function toExpression(i) {
	return typeof i == "string" ? new RegExp(escapeStringRegexp(i), "g") : i;
}
function toFunction(i) {
	return typeof i == "function" ? i : function() {
		return i;
	};
}
var inConstruct = "phrasing", notInConstruct = [
	"autolink",
	"link",
	"image",
	"label"
];
function gfmAutolinkLiteralFromMarkdown() {
	return {
		transforms: [transformGfmAutolinkLiterals],
		enter: {
			literalAutolink: enterLiteralAutolink,
			literalAutolinkEmail: enterLiteralAutolinkValue,
			literalAutolinkHttp: enterLiteralAutolinkValue,
			literalAutolinkWww: enterLiteralAutolinkValue
		},
		exit: {
			literalAutolink: exitLiteralAutolink,
			literalAutolinkEmail: exitLiteralAutolinkEmail,
			literalAutolinkHttp: exitLiteralAutolinkHttp,
			literalAutolinkWww: exitLiteralAutolinkWww
		}
	};
}
function gfmAutolinkLiteralToMarkdown() {
	return { unsafe: [
		{
			character: "@",
			before: "[+\\-.\\w]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ".",
			before: "[Ww]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ":",
			before: "[ps]",
			after: "\\/",
			inConstruct,
			notInConstruct
		}
	] };
}
function enterLiteralAutolink(i) {
	this.enter({
		type: "link",
		title: null,
		url: "",
		children: []
	}, i);
}
function enterLiteralAutolinkValue(i) {
	this.config.enter.autolinkProtocol.call(this, i);
}
function exitLiteralAutolinkHttp(i) {
	this.config.exit.autolinkProtocol.call(this, i);
}
function exitLiteralAutolinkWww(i) {
	this.config.exit.data.call(this, i);
	let a = this.stack[this.stack.length - 1];
	a.type, a.url = "http://" + this.sliceSerialize(i);
}
function exitLiteralAutolinkEmail(i) {
	this.config.exit.autolinkEmail.call(this, i);
}
function exitLiteralAutolink(i) {
	this.exit(i);
}
function transformGfmAutolinkLiterals(i) {
	findAndReplace(i, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), findEmail]], { ignore: ["link", "linkReference"] });
}
function findUrl(i, a, o, s, c) {
	let l = "";
	if (!previous(c) || (/^w/i.test(a) && (o = a + o, a = "", l = "http://"), !isCorrectDomain(o))) return !1;
	let u = splitUrl(o + s);
	if (!u[0]) return !1;
	let d = {
		type: "link",
		title: null,
		url: l + a + u[0],
		children: [{
			type: "text",
			value: a + u[0]
		}]
	};
	return u[1] ? [d, {
		type: "text",
		value: u[1]
	}] : d;
}
function findEmail(i, a, o, s) {
	return !previous(s, !0) || /[-\d_]$/.test(o) ? !1 : {
		type: "link",
		title: null,
		url: "mailto:" + a + "@" + o,
		children: [{
			type: "text",
			value: a + "@" + o
		}]
	};
}
function isCorrectDomain(i) {
	let a = i.split(".");
	return !(a.length < 2 || a[a.length - 1] && (/_/.test(a[a.length - 1]) || !/[a-zA-Z\d]/.test(a[a.length - 1])) || a[a.length - 2] && (/_/.test(a[a.length - 2]) || !/[a-zA-Z\d]/.test(a[a.length - 2])));
}
function splitUrl(i) {
	let a = /[!"&'),.:;<>?\]}]+$/.exec(i);
	if (!a) return [i, void 0];
	i = i.slice(0, a.index);
	let o = a[0], s = o.indexOf(")"), c = ccount(i, "("), l = ccount(i, ")");
	for (; s !== -1 && c > l;) i += o.slice(0, s + 1), o = o.slice(s + 1), s = o.indexOf(")"), l++;
	return [i, o];
}
function previous(i, a) {
	let o = i.input.charCodeAt(i.index - 1);
	return (i.index === 0 || unicodeWhitespace(o) || unicodePunctuation(o)) && (!a || o !== 47);
}
footnoteReference.peek = footnoteReferencePeek;
function enterFootnoteCallString() {
	this.buffer();
}
function enterFootnoteCall(i) {
	this.enter({
		type: "footnoteReference",
		identifier: "",
		label: ""
	}, i);
}
function enterFootnoteDefinitionLabelString() {
	this.buffer();
}
function enterFootnoteDefinition(i) {
	this.enter({
		type: "footnoteDefinition",
		identifier: "",
		label: "",
		children: []
	}, i);
}
function exitFootnoteCallString(i) {
	let a = this.resume(), o = this.stack[this.stack.length - 1];
	o.type, o.identifier = normalizeIdentifier(this.sliceSerialize(i)).toLowerCase(), o.label = a;
}
function exitFootnoteCall(i) {
	this.exit(i);
}
function exitFootnoteDefinitionLabelString(i) {
	let a = this.resume(), o = this.stack[this.stack.length - 1];
	o.type, o.identifier = normalizeIdentifier(this.sliceSerialize(i)).toLowerCase(), o.label = a;
}
function exitFootnoteDefinition(i) {
	this.exit(i);
}
function footnoteReferencePeek() {
	return "[";
}
function footnoteReference(i, a, o, s) {
	let c = o.createTracker(s), l = c.move("[^"), u = o.enter("footnoteReference"), d = o.enter("reference");
	return l += c.move(o.safe(o.associationId(i), {
		after: "]",
		before: l
	})), d(), u(), l += c.move("]"), l;
}
function gfmFootnoteFromMarkdown() {
	return {
		enter: {
			gfmFootnoteCallString: enterFootnoteCallString,
			gfmFootnoteCall: enterFootnoteCall,
			gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
			gfmFootnoteDefinition: enterFootnoteDefinition
		},
		exit: {
			gfmFootnoteCallString: exitFootnoteCallString,
			gfmFootnoteCall: exitFootnoteCall,
			gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
			gfmFootnoteDefinition: exitFootnoteDefinition
		}
	};
}
function gfmFootnoteToMarkdown(i) {
	let a = !1;
	return i && i.firstLineBlank && (a = !0), {
		handlers: {
			footnoteDefinition: o,
			footnoteReference
		},
		unsafe: [{
			character: "[",
			inConstruct: [
				"label",
				"phrasing",
				"reference"
			]
		}]
	};
	function o(i, o, s, c) {
		let l = s.createTracker(c), u = l.move("[^"), d = s.enter("footnoteDefinition"), f = s.enter("label");
		return u += l.move(s.safe(s.associationId(i), {
			before: u,
			after: "]"
		})), f(), u += l.move("]:"), i.children && i.children.length > 0 && (l.shift(4), u += l.move((a ? "\n" : " ") + s.indentLines(s.containerFlow(i, l.current()), a ? mapAll : mapExceptFirst))), d(), u;
	}
}
function mapExceptFirst(i, a, o) {
	return a === 0 ? i : mapAll(i, a, o);
}
function mapAll(i, a, o) {
	return (o ? "" : "    ") + i;
}
var constructsWithoutStrikethrough = [
	"autolink",
	"destinationLiteral",
	"destinationRaw",
	"reference",
	"titleQuote",
	"titleApostrophe"
];
handleDelete.peek = peekDelete;
function gfmStrikethroughFromMarkdown() {
	return {
		canContainEols: ["delete"],
		enter: { strikethrough: enterStrikethrough },
		exit: { strikethrough: exitStrikethrough }
	};
}
function gfmStrikethroughToMarkdown() {
	return {
		unsafe: [{
			character: "~",
			inConstruct: "phrasing",
			notInConstruct: constructsWithoutStrikethrough
		}],
		handlers: { delete: handleDelete }
	};
}
function enterStrikethrough(i) {
	this.enter({
		type: "delete",
		children: []
	}, i);
}
function exitStrikethrough(i) {
	this.exit(i);
}
function handleDelete(i, a, o, s) {
	let c = o.createTracker(s), l = o.enter("strikethrough"), u = c.move("~~");
	return u += o.containerPhrasing(i, {
		...c.current(),
		before: u,
		after: "~"
	}), u += c.move("~~"), l(), u;
}
function peekDelete() {
	return "~";
}
function defaultStringLength(i) {
	return i.length;
}
function markdownTable(i, a) {
	let o = a || {}, s = (o.align || []).concat(), c = o.stringLength || defaultStringLength, l = [], u = [], d = [], f = [], p = 0, m = -1;
	for (; ++m < i.length;) {
		let a = [], s = [], l = -1;
		for (i[m].length > p && (p = i[m].length); ++l < i[m].length;) {
			let u = serialize(i[m][l]);
			if (o.alignDelimiters !== !1) {
				let i = c(u);
				s[l] = i, (f[l] === void 0 || i > f[l]) && (f[l] = i);
			}
			a.push(u);
		}
		u[m] = a, d[m] = s;
	}
	let h = -1;
	if (typeof s == "object" && "length" in s) for (; ++h < p;) l[h] = toAlignment(s[h]);
	else {
		let i = toAlignment(s);
		for (; ++h < p;) l[h] = i;
	}
	h = -1;
	let g = [], _ = [];
	for (; ++h < p;) {
		let i = l[h], a = "", s = "";
		i === 99 ? (a = ":", s = ":") : i === 108 ? a = ":" : i === 114 && (s = ":");
		let c = o.alignDelimiters === !1 ? 1 : Math.max(1, f[h] - a.length - s.length), u = a + "-".repeat(c) + s;
		o.alignDelimiters !== !1 && (c = a.length + c + s.length, c > f[h] && (f[h] = c), _[h] = c), g[h] = u;
	}
	u.splice(1, 0, g), d.splice(1, 0, _), m = -1;
	let v = [];
	for (; ++m < u.length;) {
		let i = u[m], a = d[m];
		h = -1;
		let s = [];
		for (; ++h < p;) {
			let c = i[h] || "", u = "", d = "";
			if (o.alignDelimiters !== !1) {
				let i = f[h] - (a[h] || 0), o = l[h];
				o === 114 ? u = " ".repeat(i) : o === 99 ? i % 2 ? (u = " ".repeat(i / 2 + .5), d = " ".repeat(i / 2 - .5)) : (u = " ".repeat(i / 2), d = u) : d = " ".repeat(i);
			}
			o.delimiterStart !== !1 && !h && s.push("|"), o.padding !== !1 && !(o.alignDelimiters === !1 && c === "") && (o.delimiterStart !== !1 || h) && s.push(" "), o.alignDelimiters !== !1 && s.push(u), s.push(c), o.alignDelimiters !== !1 && s.push(d), o.padding !== !1 && s.push(" "), (o.delimiterEnd !== !1 || h !== p - 1) && s.push("|");
		}
		v.push(o.delimiterEnd === !1 ? s.join("").replace(/ +$/, "") : s.join(""));
	}
	return v.join("\n");
}
function serialize(i) {
	return i == null ? "" : String(i);
}
function toAlignment(i) {
	let a = typeof i == "string" ? i.codePointAt(0) : 0;
	return a === 67 || a === 99 ? 99 : a === 76 || a === 108 ? 108 : a === 82 || a === 114 ? 114 : 0;
}
function blockquote(i, a, o, s) {
	let c = o.enter("blockquote"), l = o.createTracker(s);
	l.move("> "), l.shift(2);
	let u = o.indentLines(o.containerFlow(i, l.current()), map$1);
	return c(), u;
}
function map$1(i, a, o) {
	return ">" + (o ? "" : " ") + i;
}
function patternInScope(i, a) {
	return listInScope(i, a.inConstruct, !0) && !listInScope(i, a.notInConstruct, !1);
}
function listInScope(i, a, o) {
	if (typeof a == "string" && (a = [a]), !a || a.length === 0) return o;
	let s = -1;
	for (; ++s < a.length;) if (i.includes(a[s])) return !0;
	return !1;
}
function hardBreak(i, a, o, s) {
	let c = -1;
	for (; ++c < o.unsafe.length;) if (o.unsafe[c].character === "\n" && patternInScope(o.stack, o.unsafe[c])) return /[ \t]/.test(s.before) ? "" : " ";
	return "\\\n";
}
function longestStreak(i, a) {
	let o = String(i), s = o.indexOf(a), c = s, l = 0, u = 0;
	if (typeof a != "string") throw TypeError("Expected substring");
	for (; s !== -1;) s === c ? ++l > u && (u = l) : l = 1, c = s + a.length, s = o.indexOf(a, c);
	return u;
}
function formatCodeAsIndented(i, a) {
	return !!(a.options.fences === !1 && i.value && !i.lang && /[^ \r\n]/.test(i.value) && !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(i.value));
}
function checkFence(i) {
	let a = i.options.fence || "`";
	if (a !== "`" && a !== "~") throw Error("Cannot serialize code with `" + a + "` for `options.fence`, expected `` ` `` or `~`");
	return a;
}
function code$1(i, a, o, s) {
	let c = checkFence(o), l = i.value || "", u = c === "`" ? "GraveAccent" : "Tilde";
	if (formatCodeAsIndented(i, o)) {
		let i = o.enter("codeIndented"), a = o.indentLines(l, map);
		return i(), a;
	}
	let d = o.createTracker(s), f = c.repeat(Math.max(longestStreak(l, c) + 1, 3)), p = o.enter("codeFenced"), m = d.move(f);
	if (i.lang) {
		let a = o.enter(`codeFencedLang${u}`);
		m += d.move(o.safe(i.lang, {
			before: m,
			after: " ",
			encode: ["`"],
			...d.current()
		})), a();
	}
	if (i.lang && i.meta) {
		let a = o.enter(`codeFencedMeta${u}`);
		m += d.move(" "), m += d.move(o.safe(i.meta, {
			before: m,
			after: "\n",
			encode: ["`"],
			...d.current()
		})), a();
	}
	return m += d.move("\n"), l && (m += d.move(l + "\n")), m += d.move(f), p(), m;
}
function map(i, a, o) {
	return (o ? "" : "    ") + i;
}
function checkQuote(i) {
	let a = i.options.quote || "\"";
	if (a !== "\"" && a !== "'") throw Error("Cannot serialize title with `" + a + "` for `options.quote`, expected `\"`, or `'`");
	return a;
}
function definition(i, a, o, s) {
	let c = checkQuote(o), l = c === "\"" ? "Quote" : "Apostrophe", u = o.enter("definition"), d = o.enter("label"), f = o.createTracker(s), p = f.move("[");
	return p += f.move(o.safe(o.associationId(i), {
		before: p,
		after: "]",
		...f.current()
	})), p += f.move("]: "), d(), !i.url || /[\0- \u007F]/.test(i.url) ? (d = o.enter("destinationLiteral"), p += f.move("<"), p += f.move(o.safe(i.url, {
		before: p,
		after: ">",
		...f.current()
	})), p += f.move(">")) : (d = o.enter("destinationRaw"), p += f.move(o.safe(i.url, {
		before: p,
		after: i.title ? " " : "\n",
		...f.current()
	}))), d(), i.title && (d = o.enter(`title${l}`), p += f.move(" " + c), p += f.move(o.safe(i.title, {
		before: p,
		after: c,
		...f.current()
	})), p += f.move(c), d()), u(), p;
}
function checkEmphasis(i) {
	let a = i.options.emphasis || "*";
	if (a !== "*" && a !== "_") throw Error("Cannot serialize emphasis with `" + a + "` for `options.emphasis`, expected `*`, or `_`");
	return a;
}
function encodeCharacterReference(i) {
	return "&#x" + i.toString(16).toUpperCase() + ";";
}
function encodeInfo(i, a, o) {
	let s = classifyCharacter(i), c = classifyCharacter(a);
	return s === void 0 ? c === void 0 ? o === "_" ? {
		inside: !0,
		outside: !0
	} : {
		inside: !1,
		outside: !1
	} : c === 1 ? {
		inside: !0,
		outside: !0
	} : {
		inside: !1,
		outside: !0
	} : s === 1 ? c === void 0 ? {
		inside: !1,
		outside: !1
	} : c === 1 ? {
		inside: !0,
		outside: !0
	} : {
		inside: !1,
		outside: !1
	} : c === void 0 ? {
		inside: !1,
		outside: !1
	} : c === 1 ? {
		inside: !0,
		outside: !1
	} : {
		inside: !1,
		outside: !1
	};
}
emphasis.peek = emphasisPeek;
function emphasis(i, a, o, s) {
	let c = checkEmphasis(o), l = o.enter("emphasis"), u = o.createTracker(s), d = u.move(c), f = u.move(o.containerPhrasing(i, {
		after: c,
		before: d,
		...u.current()
	})), p = f.charCodeAt(0), m = encodeInfo(s.before.charCodeAt(s.before.length - 1), p, c);
	m.inside && (f = encodeCharacterReference(p) + f.slice(1));
	let h = f.charCodeAt(f.length - 1), g = encodeInfo(s.after.charCodeAt(0), h, c);
	g.inside && (f = f.slice(0, -1) + encodeCharacterReference(h));
	let _ = u.move(c);
	return l(), o.attentionEncodeSurroundingInfo = {
		after: g.outside,
		before: m.outside
	}, d + f + _;
}
function emphasisPeek(i, a, o) {
	return o.options.emphasis || "*";
}
function formatHeadingAsSetext(i, a) {
	let o = !1;
	return visit(i, function(i) {
		if ("value" in i && /\r?\n|\r/.test(i.value) || i.type === "break") return o = !0, !1;
	}), !!((!i.depth || i.depth < 3) && toString(i) && (a.options.setext || o));
}
function heading(i, a, o, s) {
	let c = Math.max(Math.min(6, i.depth || 1), 1), l = o.createTracker(s);
	if (formatHeadingAsSetext(i, o)) {
		let a = o.enter("headingSetext"), s = o.enter("phrasing"), u = o.containerPhrasing(i, {
			...l.current(),
			before: "\n",
			after: "\n"
		});
		return s(), a(), u + "\n" + (c === 1 ? "=" : "-").repeat(u.length - (Math.max(u.lastIndexOf("\r"), u.lastIndexOf("\n")) + 1));
	}
	let u = "#".repeat(c), d = o.enter("headingAtx"), f = o.enter("phrasing");
	l.move(u + " ");
	let p = o.containerPhrasing(i, {
		before: "# ",
		after: "\n",
		...l.current()
	});
	return /^[\t ]/.test(p) && (p = encodeCharacterReference(p.charCodeAt(0)) + p.slice(1)), p = p ? u + " " + p : u, o.options.closeAtx && (p += " " + u), f(), d(), p;
}
html.peek = htmlPeek;
function html(i) {
	return i.value || "";
}
function htmlPeek() {
	return "<";
}
image.peek = imagePeek;
function image(i, a, o, s) {
	let c = checkQuote(o), l = c === "\"" ? "Quote" : "Apostrophe", u = o.enter("image"), d = o.enter("label"), f = o.createTracker(s), p = f.move("![");
	return p += f.move(o.safe(i.alt, {
		before: p,
		after: "]",
		...f.current()
	})), p += f.move("]("), d(), !i.url && i.title || /[\0- \u007F]/.test(i.url) ? (d = o.enter("destinationLiteral"), p += f.move("<"), p += f.move(o.safe(i.url, {
		before: p,
		after: ">",
		...f.current()
	})), p += f.move(">")) : (d = o.enter("destinationRaw"), p += f.move(o.safe(i.url, {
		before: p,
		after: i.title ? " " : ")",
		...f.current()
	}))), d(), i.title && (d = o.enter(`title${l}`), p += f.move(" " + c), p += f.move(o.safe(i.title, {
		before: p,
		after: c,
		...f.current()
	})), p += f.move(c), d()), p += f.move(")"), u(), p;
}
function imagePeek() {
	return "!";
}
imageReference.peek = imageReferencePeek;
function imageReference(i, a, o, s) {
	let c = i.referenceType, l = o.enter("imageReference"), u = o.enter("label"), d = o.createTracker(s), f = d.move("!["), p = o.safe(i.alt, {
		before: f,
		after: "]",
		...d.current()
	});
	f += d.move(p + "]["), u();
	let m = o.stack;
	o.stack = [], u = o.enter("reference");
	let h = o.safe(o.associationId(i), {
		before: f,
		after: "]",
		...d.current()
	});
	return u(), o.stack = m, l(), c === "full" || !p || p !== h ? f += d.move(h + "]") : c === "shortcut" ? f = f.slice(0, -1) : f += d.move("]"), f;
}
function imageReferencePeek() {
	return "!";
}
inlineCode.peek = inlineCodePeek;
function inlineCode(i, a, o) {
	let s = i.value || "", c = "`", l = -1;
	for (; (/* @__PURE__ */ RegExp("(^|[^`])" + c + "([^`]|$)")).test(s);) c += "`";
	for (/[^ \r\n]/.test(s) && (/^[ \r\n]/.test(s) && /[ \r\n]$/.test(s) || /^`|`$/.test(s)) && (s = " " + s + " "); ++l < o.unsafe.length;) {
		let i = o.unsafe[l], a = o.compilePattern(i), c;
		if (i.atBreak) for (; c = a.exec(s);) {
			let i = c.index;
			s.charCodeAt(i) === 10 && s.charCodeAt(i - 1) === 13 && i--, s = s.slice(0, i) + " " + s.slice(c.index + 1);
		}
	}
	return c + s + c;
}
function inlineCodePeek() {
	return "`";
}
function formatLinkAsAutolink(i, a) {
	let o = toString(i);
	return !!(!a.options.resourceLink && i.url && !i.title && i.children && i.children.length === 1 && i.children[0].type === "text" && (o === i.url || "mailto:" + o === i.url) && /^[a-z][a-z+.-]+:/i.test(i.url) && !/[\0- <>\u007F]/.test(i.url));
}
link.peek = linkPeek;
function link(i, a, o, s) {
	let c = checkQuote(o), l = c === "\"" ? "Quote" : "Apostrophe", u = o.createTracker(s), d, f;
	if (formatLinkAsAutolink(i, o)) {
		let a = o.stack;
		o.stack = [], d = o.enter("autolink");
		let s = u.move("<");
		return s += u.move(o.containerPhrasing(i, {
			before: s,
			after: ">",
			...u.current()
		})), s += u.move(">"), d(), o.stack = a, s;
	}
	d = o.enter("link"), f = o.enter("label");
	let p = u.move("[");
	return p += u.move(o.containerPhrasing(i, {
		before: p,
		after: "](",
		...u.current()
	})), p += u.move("]("), f(), !i.url && i.title || /[\0- \u007F]/.test(i.url) ? (f = o.enter("destinationLiteral"), p += u.move("<"), p += u.move(o.safe(i.url, {
		before: p,
		after: ">",
		...u.current()
	})), p += u.move(">")) : (f = o.enter("destinationRaw"), p += u.move(o.safe(i.url, {
		before: p,
		after: i.title ? " " : ")",
		...u.current()
	}))), f(), i.title && (f = o.enter(`title${l}`), p += u.move(" " + c), p += u.move(o.safe(i.title, {
		before: p,
		after: c,
		...u.current()
	})), p += u.move(c), f()), p += u.move(")"), d(), p;
}
function linkPeek(i, a, o) {
	return formatLinkAsAutolink(i, o) ? "<" : "[";
}
linkReference.peek = linkReferencePeek;
function linkReference(i, a, o, s) {
	let c = i.referenceType, l = o.enter("linkReference"), u = o.enter("label"), d = o.createTracker(s), f = d.move("["), p = o.containerPhrasing(i, {
		before: f,
		after: "]",
		...d.current()
	});
	f += d.move(p + "]["), u();
	let m = o.stack;
	o.stack = [], u = o.enter("reference");
	let h = o.safe(o.associationId(i), {
		before: f,
		after: "]",
		...d.current()
	});
	return u(), o.stack = m, l(), c === "full" || !p || p !== h ? f += d.move(h + "]") : c === "shortcut" ? f = f.slice(0, -1) : f += d.move("]"), f;
}
function linkReferencePeek() {
	return "[";
}
function checkBullet(i) {
	let a = i.options.bullet || "*";
	if (a !== "*" && a !== "+" && a !== "-") throw Error("Cannot serialize items with `" + a + "` for `options.bullet`, expected `*`, `+`, or `-`");
	return a;
}
function checkBulletOther(i) {
	let a = checkBullet(i), o = i.options.bulletOther;
	if (!o) return a === "*" ? "-" : "*";
	if (o !== "*" && o !== "+" && o !== "-") throw Error("Cannot serialize items with `" + o + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
	if (o === a) throw Error("Expected `bullet` (`" + a + "`) and `bulletOther` (`" + o + "`) to be different");
	return o;
}
function checkBulletOrdered(i) {
	let a = i.options.bulletOrdered || ".";
	if (a !== "." && a !== ")") throw Error("Cannot serialize items with `" + a + "` for `options.bulletOrdered`, expected `.` or `)`");
	return a;
}
function checkRule(i) {
	let a = i.options.rule || "*";
	if (a !== "*" && a !== "-" && a !== "_") throw Error("Cannot serialize rules with `" + a + "` for `options.rule`, expected `*`, `-`, or `_`");
	return a;
}
function list(i, a, o, s) {
	let c = o.enter("list"), l = o.bulletCurrent, u = i.ordered ? checkBulletOrdered(o) : checkBullet(o), d = i.ordered ? u === "." ? ")" : "." : checkBulletOther(o), f = a && o.bulletLastUsed ? u === o.bulletLastUsed : !1;
	if (!i.ordered) {
		let a = i.children ? i.children[0] : void 0;
		if ((u === "*" || u === "-") && a && (!a.children || !a.children[0]) && o.stack[o.stack.length - 1] === "list" && o.stack[o.stack.length - 2] === "listItem" && o.stack[o.stack.length - 3] === "list" && o.stack[o.stack.length - 4] === "listItem" && o.indexStack[o.indexStack.length - 1] === 0 && o.indexStack[o.indexStack.length - 2] === 0 && o.indexStack[o.indexStack.length - 3] === 0 && (f = !0), checkRule(o) === u && a) {
			let a = -1;
			for (; ++a < i.children.length;) {
				let o = i.children[a];
				if (o && o.type === "listItem" && o.children && o.children[0] && o.children[0].type === "thematicBreak") {
					f = !0;
					break;
				}
			}
		}
	}
	f && (u = d), o.bulletCurrent = u;
	let p = o.containerFlow(i, s);
	return o.bulletLastUsed = u, o.bulletCurrent = l, c(), p;
}
function checkListItemIndent(i) {
	let a = i.options.listItemIndent || "one";
	if (a !== "tab" && a !== "one" && a !== "mixed") throw Error("Cannot serialize items with `" + a + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
	return a;
}
function listItem(i, a, o, s) {
	let c = checkListItemIndent(o), l = o.bulletCurrent || checkBullet(o);
	a && a.type === "list" && a.ordered && (l = (typeof a.start == "number" && a.start > -1 ? a.start : 1) + (o.options.incrementListMarker === !1 ? 0 : a.children.indexOf(i)) + l);
	let u = l.length + 1;
	(c === "tab" || c === "mixed" && (a && a.type === "list" && a.spread || i.spread)) && (u = Math.ceil(u / 4) * 4);
	let d = o.createTracker(s);
	d.move(l + " ".repeat(u - l.length)), d.shift(u);
	let f = o.enter("listItem"), p = o.indentLines(o.containerFlow(i, d.current()), m);
	return f(), p;
	function m(i, a, o) {
		return a ? (o ? "" : " ".repeat(u)) + i : (o ? l : l + " ".repeat(u - l.length)) + i;
	}
}
function paragraph(i, a, o, s) {
	let c = o.enter("paragraph"), l = o.enter("phrasing"), u = o.containerPhrasing(i, s);
	return l(), c(), u;
}
const phrasing = convert([
	"break",
	"delete",
	"emphasis",
	"footnote",
	"footnoteReference",
	"image",
	"imageReference",
	"inlineCode",
	"inlineMath",
	"link",
	"linkReference",
	"mdxJsxTextElement",
	"mdxTextExpression",
	"strong",
	"text",
	"textDirective"
]);
function root(i, a, o, s) {
	return (i.children.some(function(i) {
		return phrasing(i);
	}) ? o.containerPhrasing : o.containerFlow).call(o, i, s);
}
function checkStrong(i) {
	let a = i.options.strong || "*";
	if (a !== "*" && a !== "_") throw Error("Cannot serialize strong with `" + a + "` for `options.strong`, expected `*`, or `_`");
	return a;
}
strong.peek = strongPeek;
function strong(i, a, o, s) {
	let c = checkStrong(o), l = o.enter("strong"), u = o.createTracker(s), d = u.move(c + c), f = u.move(o.containerPhrasing(i, {
		after: c,
		before: d,
		...u.current()
	})), p = f.charCodeAt(0), m = encodeInfo(s.before.charCodeAt(s.before.length - 1), p, c);
	m.inside && (f = encodeCharacterReference(p) + f.slice(1));
	let h = f.charCodeAt(f.length - 1), g = encodeInfo(s.after.charCodeAt(0), h, c);
	g.inside && (f = f.slice(0, -1) + encodeCharacterReference(h));
	let _ = u.move(c + c);
	return l(), o.attentionEncodeSurroundingInfo = {
		after: g.outside,
		before: m.outside
	}, d + f + _;
}
function strongPeek(i, a, o) {
	return o.options.strong || "*";
}
function text$1(i, a, o, s) {
	return o.safe(i.value, s);
}
function checkRuleRepetition(i) {
	let a = i.options.ruleRepetition || 3;
	if (a < 3) throw Error("Cannot serialize rules with repetition `" + a + "` for `options.ruleRepetition`, expected `3` or more");
	return a;
}
function thematicBreak(i, a, o) {
	let s = (checkRule(o) + (o.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(o));
	return o.options.ruleSpaces ? s.slice(0, -1) : s;
}
const handle = {
	blockquote,
	break: hardBreak,
	code: code$1,
	definition,
	emphasis,
	hardBreak,
	heading,
	html,
	image,
	imageReference,
	inlineCode,
	link,
	linkReference,
	list,
	listItem,
	paragraph,
	root,
	strong,
	text: text$1,
	thematicBreak
};
function gfmTableFromMarkdown() {
	return {
		enter: {
			table: enterTable,
			tableData: enterCell,
			tableHeader: enterCell,
			tableRow: enterRow
		},
		exit: {
			codeText: exitCodeText,
			table: exitTable,
			tableData: exit,
			tableHeader: exit,
			tableRow: exit
		}
	};
}
function enterTable(i) {
	let a = i._align;
	this.enter({
		type: "table",
		align: a.map(function(i) {
			return i === "none" ? null : i;
		}),
		children: []
	}, i), this.data.inTable = !0;
}
function exitTable(i) {
	this.exit(i), this.data.inTable = void 0;
}
function enterRow(i) {
	this.enter({
		type: "tableRow",
		children: []
	}, i);
}
function exit(i) {
	this.exit(i);
}
function enterCell(i) {
	this.enter({
		type: "tableCell",
		children: []
	}, i);
}
function exitCodeText(i) {
	let a = this.resume();
	this.data.inTable && (a = a.replace(/\\([\\|])/g, replace));
	let o = this.stack[this.stack.length - 1];
	o.type, o.value = a, this.exit(i);
}
function replace(i, a) {
	return a === "|" ? a : i;
}
function gfmTableToMarkdown(i) {
	let a = i || {}, o = a.tableCellPadding, s = a.tablePipeAlign, c = a.stringLength, l = o ? " " : "|";
	return {
		unsafe: [
			{
				character: "\r",
				inConstruct: "tableCell"
			},
			{
				character: "\n",
				inConstruct: "tableCell"
			},
			{
				atBreak: !0,
				character: "|",
				after: "[	 :-]"
			},
			{
				character: "|",
				inConstruct: "tableCell"
			},
			{
				atBreak: !0,
				character: ":",
				after: "-"
			},
			{
				atBreak: !0,
				character: "-",
				after: "[:|-]"
			}
		],
		handlers: {
			inlineCode: g,
			table: u,
			tableCell: f,
			tableRow: d
		}
	};
	function u(i, a, o, s) {
		return p(m(i, o, s), i.align);
	}
	function d(i, a, o, s) {
		let c = p([h(i, o, s)]);
		return c.slice(0, c.indexOf("\n"));
	}
	function f(i, a, o, s) {
		let c = o.enter("tableCell"), u = o.enter("phrasing"), d = o.containerPhrasing(i, {
			...s,
			before: l,
			after: l
		});
		return u(), c(), d;
	}
	function p(i, a) {
		return markdownTable(i, {
			align: a,
			alignDelimiters: s,
			padding: o,
			stringLength: c
		});
	}
	function m(i, a, o) {
		let s = i.children, c = -1, l = [], u = a.enter("table");
		for (; ++c < s.length;) l[c] = h(s[c], a, o);
		return u(), l;
	}
	function h(i, a, o) {
		let s = i.children, c = -1, l = [], u = a.enter("tableRow");
		for (; ++c < s.length;) l[c] = f(s[c], i, a, o);
		return u(), l;
	}
	function g(i, a, o) {
		let s = handle.inlineCode(i, a, o);
		return o.stack.includes("tableCell") && (s = s.replace(/\|/g, "\\$&")), s;
	}
}
function gfmTaskListItemFromMarkdown() {
	return { exit: {
		taskListCheckValueChecked: exitCheck,
		taskListCheckValueUnchecked: exitCheck,
		paragraph: exitParagraphWithTaskListItem
	} };
}
function gfmTaskListItemToMarkdown() {
	return {
		unsafe: [{
			atBreak: !0,
			character: "-",
			after: "[:|-]"
		}],
		handlers: { listItem: listItemWithTaskListItem }
	};
}
function exitCheck(i) {
	let a = this.stack[this.stack.length - 2];
	a.type, a.checked = i.type === "taskListCheckValueChecked";
}
function exitParagraphWithTaskListItem(i) {
	let a = this.stack[this.stack.length - 2];
	if (a && a.type === "listItem" && typeof a.checked == "boolean") {
		let i = this.stack[this.stack.length - 1];
		i.type;
		let o = i.children[0];
		if (o && o.type === "text") {
			let s = a.children, c = -1, l;
			for (; ++c < s.length;) {
				let i = s[c];
				if (i.type === "paragraph") {
					l = i;
					break;
				}
			}
			l === i && (o.value = o.value.slice(1), o.value.length === 0 ? i.children.shift() : i.position && o.position && typeof o.position.start.offset == "number" && (o.position.start.column++, o.position.start.offset++, i.position.start = Object.assign({}, o.position.start)));
		}
	}
	this.exit(i);
}
function listItemWithTaskListItem(i, a, o, s) {
	let c = i.children[0], l = typeof i.checked == "boolean" && c && c.type === "paragraph", u = "[" + (i.checked ? "x" : " ") + "] ", d = o.createTracker(s);
	l && d.move(u);
	let f = handle.listItem(i, a, o, {
		...s,
		...d.current()
	});
	return l && (f = f.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, p)), f;
	function p(i) {
		return i + u;
	}
}
function gfmFromMarkdown() {
	return [
		gfmAutolinkLiteralFromMarkdown(),
		gfmFootnoteFromMarkdown(),
		gfmStrikethroughFromMarkdown(),
		gfmTableFromMarkdown(),
		gfmTaskListItemFromMarkdown()
	];
}
function gfmToMarkdown(i) {
	return { extensions: [
		gfmAutolinkLiteralToMarkdown(),
		gfmFootnoteToMarkdown(i),
		gfmStrikethroughToMarkdown(),
		gfmTableToMarkdown(i),
		gfmTaskListItemToMarkdown()
	] };
}
var wwwPrefix = {
	tokenize: tokenizeWwwPrefix,
	partial: !0
}, domain = {
	tokenize: tokenizeDomain,
	partial: !0
}, path = {
	tokenize: tokenizePath,
	partial: !0
}, trail = {
	tokenize: tokenizeTrail,
	partial: !0
}, emailDomainDotTrail = {
	tokenize: tokenizeEmailDomainDotTrail,
	partial: !0
}, wwwAutolink = {
	name: "wwwAutolink",
	tokenize: tokenizeWwwAutolink,
	previous: previousWww
}, protocolAutolink = {
	name: "protocolAutolink",
	tokenize: tokenizeProtocolAutolink,
	previous: previousProtocol
}, emailAutolink = {
	name: "emailAutolink",
	tokenize: tokenizeEmailAutolink,
	previous: previousEmail
}, text = {};
function gfmAutolinkLiteral() {
	return { text };
}
for (var code = 48; code < 123;) text[code] = emailAutolink, code++, code === 58 ? code = 65 : code === 91 && (code = 97);
text[43] = emailAutolink, text[45] = emailAutolink, text[46] = emailAutolink, text[95] = emailAutolink, text[72] = [emailAutolink, protocolAutolink], text[104] = [emailAutolink, protocolAutolink], text[87] = [emailAutolink, wwwAutolink], text[119] = [emailAutolink, wwwAutolink];
function tokenizeEmailAutolink(i, a, o) {
	let s = this, c, l;
	return u;
	function u(a) {
		return !gfmAtext(a) || !previousEmail.call(s, s.previous) || previousUnbalanced(s.events) ? o(a) : (i.enter("literalAutolink"), i.enter("literalAutolinkEmail"), d(a));
	}
	function d(a) {
		return gfmAtext(a) ? (i.consume(a), d) : a === 64 ? (i.consume(a), f) : o(a);
	}
	function f(a) {
		return a === 46 ? i.check(emailDomainDotTrail, m, p)(a) : a === 45 || a === 95 || asciiAlphanumeric(a) ? (l = !0, i.consume(a), f) : m(a);
	}
	function p(a) {
		return i.consume(a), c = !0, f;
	}
	function m(u) {
		return l && c && asciiAlpha(s.previous) ? (i.exit("literalAutolinkEmail"), i.exit("literalAutolink"), a(u)) : o(u);
	}
}
function tokenizeWwwAutolink(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return a !== 87 && a !== 119 || !previousWww.call(s, s.previous) || previousUnbalanced(s.events) ? o(a) : (i.enter("literalAutolink"), i.enter("literalAutolinkWww"), i.check(wwwPrefix, i.attempt(domain, i.attempt(path, l), o), o)(a));
	}
	function l(o) {
		return i.exit("literalAutolinkWww"), i.exit("literalAutolink"), a(o);
	}
}
function tokenizeProtocolAutolink(i, a, o) {
	let s = this, c = "", l = !1;
	return u;
	function u(a) {
		return (a === 72 || a === 104) && previousProtocol.call(s, s.previous) && !previousUnbalanced(s.events) ? (i.enter("literalAutolink"), i.enter("literalAutolinkHttp"), c += String.fromCodePoint(a), i.consume(a), d) : o(a);
	}
	function d(a) {
		if (asciiAlpha(a) && c.length < 5) return c += String.fromCodePoint(a), i.consume(a), d;
		if (a === 58) {
			let o = c.toLowerCase();
			if (o === "http" || o === "https") return i.consume(a), f;
		}
		return o(a);
	}
	function f(a) {
		return a === 47 ? (i.consume(a), l ? p : (l = !0, f)) : o(a);
	}
	function p(a) {
		return a === null || asciiControl(a) || markdownLineEndingOrSpace(a) || unicodeWhitespace(a) || unicodePunctuation(a) ? o(a) : i.attempt(domain, i.attempt(path, m), o)(a);
	}
	function m(o) {
		return i.exit("literalAutolinkHttp"), i.exit("literalAutolink"), a(o);
	}
}
function tokenizeWwwPrefix(i, a, o) {
	let s = 0;
	return c;
	function c(a) {
		return (a === 87 || a === 119) && s < 3 ? (s++, i.consume(a), c) : a === 46 && s === 3 ? (i.consume(a), l) : o(a);
	}
	function l(i) {
		return i === null ? o(i) : a(i);
	}
}
function tokenizeDomain(i, a, o) {
	let s, c, l;
	return u;
	function u(a) {
		return a === 46 || a === 95 ? i.check(trail, f, d)(a) : a === null || markdownLineEndingOrSpace(a) || unicodeWhitespace(a) || a !== 45 && unicodePunctuation(a) ? f(a) : (l = !0, i.consume(a), u);
	}
	function d(a) {
		return a === 95 ? s = !0 : (c = s, s = void 0), i.consume(a), u;
	}
	function f(i) {
		return c || s || !l ? o(i) : a(i);
	}
}
function tokenizePath(i, a) {
	let o = 0, s = 0;
	return c;
	function c(u) {
		return u === 40 ? (o++, i.consume(u), c) : u === 41 && s < o ? l(u) : u === 33 || u === 34 || u === 38 || u === 39 || u === 41 || u === 42 || u === 44 || u === 46 || u === 58 || u === 59 || u === 60 || u === 63 || u === 93 || u === 95 || u === 126 ? i.check(trail, a, l)(u) : u === null || markdownLineEndingOrSpace(u) || unicodeWhitespace(u) ? a(u) : (i.consume(u), c);
	}
	function l(a) {
		return a === 41 && s++, i.consume(a), c;
	}
}
function tokenizeTrail(i, a, o) {
	return s;
	function s(u) {
		return u === 33 || u === 34 || u === 39 || u === 41 || u === 42 || u === 44 || u === 46 || u === 58 || u === 59 || u === 63 || u === 95 || u === 126 ? (i.consume(u), s) : u === 38 ? (i.consume(u), l) : u === 93 ? (i.consume(u), c) : u === 60 || u === null || markdownLineEndingOrSpace(u) || unicodeWhitespace(u) ? a(u) : o(u);
	}
	function c(i) {
		return i === null || i === 40 || i === 91 || markdownLineEndingOrSpace(i) || unicodeWhitespace(i) ? a(i) : s(i);
	}
	function l(i) {
		return asciiAlpha(i) ? u(i) : o(i);
	}
	function u(a) {
		return a === 59 ? (i.consume(a), s) : asciiAlpha(a) ? (i.consume(a), u) : o(a);
	}
}
function tokenizeEmailDomainDotTrail(i, a, o) {
	return s;
	function s(a) {
		return i.consume(a), c;
	}
	function c(i) {
		return asciiAlphanumeric(i) ? o(i) : a(i);
	}
}
function previousWww(i) {
	return i === null || i === 40 || i === 42 || i === 95 || i === 91 || i === 93 || i === 126 || markdownLineEndingOrSpace(i);
}
function previousProtocol(i) {
	return !asciiAlpha(i);
}
function previousEmail(i) {
	return !(i === 47 || gfmAtext(i));
}
function gfmAtext(i) {
	return i === 43 || i === 45 || i === 46 || i === 95 || asciiAlphanumeric(i);
}
function previousUnbalanced(i) {
	let a = i.length, o = !1;
	for (; a--;) {
		let s = i[a][1];
		if ((s.type === "labelLink" || s.type === "labelImage") && !s._balanced) {
			o = !0;
			break;
		}
		if (s._gfmAutolinkLiteralWalkedInto) {
			o = !1;
			break;
		}
	}
	return i.length > 0 && !o && (i[i.length - 1][1]._gfmAutolinkLiteralWalkedInto = !0), o;
}
var indent = {
	tokenize: tokenizeIndent,
	partial: !0
};
function gfmFootnote() {
	return {
		document: { 91: {
			name: "gfmFootnoteDefinition",
			tokenize: tokenizeDefinitionStart,
			continuation: { tokenize: tokenizeDefinitionContinuation },
			exit: gfmFootnoteDefinitionEnd
		} },
		text: {
			91: {
				name: "gfmFootnoteCall",
				tokenize: tokenizeGfmFootnoteCall
			},
			93: {
				name: "gfmPotentialFootnoteCall",
				add: "after",
				tokenize: tokenizePotentialGfmFootnoteCall,
				resolveTo: resolveToPotentialGfmFootnoteCall
			}
		}
	};
}
function tokenizePotentialGfmFootnoteCall(i, a, o) {
	let s = this, c = s.events.length, l = s.parser.gfmFootnotes || (s.parser.gfmFootnotes = []), u;
	for (; c--;) {
		let i = s.events[c][1];
		if (i.type === "labelImage") {
			u = i;
			break;
		}
		if (i.type === "gfmFootnoteCall" || i.type === "labelLink" || i.type === "label" || i.type === "image" || i.type === "link") break;
	}
	return d;
	function d(c) {
		if (!u || !u._balanced) return o(c);
		let d = normalizeIdentifier(s.sliceSerialize({
			start: u.end,
			end: s.now()
		}));
		return d.codePointAt(0) !== 94 || !l.includes(d.slice(1)) ? o(c) : (i.enter("gfmFootnoteCallLabelMarker"), i.consume(c), i.exit("gfmFootnoteCallLabelMarker"), a(c));
	}
}
function resolveToPotentialGfmFootnoteCall(i, a) {
	let o = i.length;
	for (; o--;) if (i[o][1].type === "labelImage" && i[o][0] === "enter") {
		i[o][1];
		break;
	}
	i[o + 1][1].type = "data", i[o + 3][1].type = "gfmFootnoteCallLabelMarker";
	let s = {
		type: "gfmFootnoteCall",
		start: Object.assign({}, i[o + 3][1].start),
		end: Object.assign({}, i[i.length - 1][1].end)
	}, c = {
		type: "gfmFootnoteCallMarker",
		start: Object.assign({}, i[o + 3][1].end),
		end: Object.assign({}, i[o + 3][1].end)
	};
	c.end.column++, c.end.offset++, c.end._bufferIndex++;
	let l = {
		type: "gfmFootnoteCallString",
		start: Object.assign({}, c.end),
		end: Object.assign({}, i[i.length - 1][1].start)
	}, u = {
		type: "chunkString",
		contentType: "string",
		start: Object.assign({}, l.start),
		end: Object.assign({}, l.end)
	}, d = [
		i[o + 1],
		i[o + 2],
		[
			"enter",
			s,
			a
		],
		i[o + 3],
		i[o + 4],
		[
			"enter",
			c,
			a
		],
		[
			"exit",
			c,
			a
		],
		[
			"enter",
			l,
			a
		],
		[
			"enter",
			u,
			a
		],
		[
			"exit",
			u,
			a
		],
		[
			"exit",
			l,
			a
		],
		i[i.length - 2],
		i[i.length - 1],
		[
			"exit",
			s,
			a
		]
	];
	return i.splice(o, i.length - o + 1, ...d), i;
}
function tokenizeGfmFootnoteCall(i, a, o) {
	let s = this, c = s.parser.gfmFootnotes || (s.parser.gfmFootnotes = []), l = 0, u;
	return d;
	function d(a) {
		return i.enter("gfmFootnoteCall"), i.enter("gfmFootnoteCallLabelMarker"), i.consume(a), i.exit("gfmFootnoteCallLabelMarker"), f;
	}
	function f(a) {
		return a === 94 ? (i.enter("gfmFootnoteCallMarker"), i.consume(a), i.exit("gfmFootnoteCallMarker"), i.enter("gfmFootnoteCallString"), i.enter("chunkString").contentType = "string", p) : o(a);
	}
	function p(d) {
		if (l > 999 || d === 93 && !u || d === null || d === 91 || markdownLineEndingOrSpace(d)) return o(d);
		if (d === 93) {
			i.exit("chunkString");
			let l = i.exit("gfmFootnoteCallString");
			return c.includes(normalizeIdentifier(s.sliceSerialize(l))) ? (i.enter("gfmFootnoteCallLabelMarker"), i.consume(d), i.exit("gfmFootnoteCallLabelMarker"), i.exit("gfmFootnoteCall"), a) : o(d);
		}
		return markdownLineEndingOrSpace(d) || (u = !0), l++, i.consume(d), d === 92 ? m : p;
	}
	function m(a) {
		return a === 91 || a === 92 || a === 93 ? (i.consume(a), l++, p) : p(a);
	}
}
function tokenizeDefinitionStart(i, a, o) {
	let s = this, c = s.parser.gfmFootnotes || (s.parser.gfmFootnotes = []), l, u = 0, d;
	return f;
	function f(a) {
		return i.enter("gfmFootnoteDefinition")._container = !0, i.enter("gfmFootnoteDefinitionLabel"), i.enter("gfmFootnoteDefinitionLabelMarker"), i.consume(a), i.exit("gfmFootnoteDefinitionLabelMarker"), p;
	}
	function p(a) {
		return a === 94 ? (i.enter("gfmFootnoteDefinitionMarker"), i.consume(a), i.exit("gfmFootnoteDefinitionMarker"), i.enter("gfmFootnoteDefinitionLabelString"), i.enter("chunkString").contentType = "string", m) : o(a);
	}
	function m(a) {
		if (u > 999 || a === 93 && !d || a === null || a === 91 || markdownLineEndingOrSpace(a)) return o(a);
		if (a === 93) {
			i.exit("chunkString");
			let o = i.exit("gfmFootnoteDefinitionLabelString");
			return l = normalizeIdentifier(s.sliceSerialize(o)), i.enter("gfmFootnoteDefinitionLabelMarker"), i.consume(a), i.exit("gfmFootnoteDefinitionLabelMarker"), i.exit("gfmFootnoteDefinitionLabel"), g;
		}
		return markdownLineEndingOrSpace(a) || (d = !0), u++, i.consume(a), a === 92 ? h : m;
	}
	function h(a) {
		return a === 91 || a === 92 || a === 93 ? (i.consume(a), u++, m) : m(a);
	}
	function g(a) {
		return a === 58 ? (i.enter("definitionMarker"), i.consume(a), i.exit("definitionMarker"), c.includes(l) || c.push(l), factorySpace(i, _, "gfmFootnoteDefinitionWhitespace")) : o(a);
	}
	function _(i) {
		return a(i);
	}
}
function tokenizeDefinitionContinuation(i, a, o) {
	return i.check(blankLine, a, i.attempt(indent, a, o));
}
function gfmFootnoteDefinitionEnd(i) {
	i.exit("gfmFootnoteDefinition");
}
function tokenizeIndent(i, a, o) {
	let s = this;
	return factorySpace(i, c, "gfmFootnoteDefinitionIndent", 5);
	function c(i) {
		let c = s.events[s.events.length - 1];
		return c && c[1].type === "gfmFootnoteDefinitionIndent" && c[2].sliceSerialize(c[1], !0).length === 4 ? a(i) : o(i);
	}
}
function gfmStrikethrough(i) {
	let a = (i || {}).singleTilde, o = {
		name: "strikethrough",
		tokenize: c,
		resolveAll: s
	};
	return a ??= !0, {
		text: { 126: o },
		insideSpan: { null: [o] },
		attentionMarkers: { null: [126] }
	};
	function s(i, a) {
		let o = -1;
		for (; ++o < i.length;) if (i[o][0] === "enter" && i[o][1].type === "strikethroughSequenceTemporary" && i[o][1]._close) {
			let s = o;
			for (; s--;) if (i[s][0] === "exit" && i[s][1].type === "strikethroughSequenceTemporary" && i[s][1]._open && i[o][1].end.offset - i[o][1].start.offset === i[s][1].end.offset - i[s][1].start.offset) {
				i[o][1].type = "strikethroughSequence", i[s][1].type = "strikethroughSequence";
				let c = {
					type: "strikethrough",
					start: Object.assign({}, i[s][1].start),
					end: Object.assign({}, i[o][1].end)
				}, l = {
					type: "strikethroughText",
					start: Object.assign({}, i[s][1].end),
					end: Object.assign({}, i[o][1].start)
				}, u = [
					[
						"enter",
						c,
						a
					],
					[
						"enter",
						i[s][1],
						a
					],
					[
						"exit",
						i[s][1],
						a
					],
					[
						"enter",
						l,
						a
					]
				], d = a.parser.constructs.insideSpan.null;
				d && splice(u, u.length, 0, resolveAll(d, i.slice(s + 1, o), a)), splice(u, u.length, 0, [
					[
						"exit",
						l,
						a
					],
					[
						"enter",
						i[o][1],
						a
					],
					[
						"exit",
						i[o][1],
						a
					],
					[
						"exit",
						c,
						a
					]
				]), splice(i, s - 1, o - s + 3, u), o = s + u.length - 2;
				break;
			}
		}
		for (o = -1; ++o < i.length;) i[o][1].type === "strikethroughSequenceTemporary" && (i[o][1].type = "data");
		return i;
	}
	function c(i, o, s) {
		let c = this.previous, l = this.events, u = 0;
		return d;
		function d(a) {
			return c === 126 && l[l.length - 1][1].type !== "characterEscape" ? s(a) : (i.enter("strikethroughSequenceTemporary"), f(a));
		}
		function f(l) {
			let d = classifyCharacter(c);
			if (l === 126) return u > 1 ? s(l) : (i.consume(l), u++, f);
			if (u < 2 && !a) return s(l);
			let p = i.exit("strikethroughSequenceTemporary"), m = classifyCharacter(l);
			return p._open = !m || m === 2 && !!d, p._close = !d || d === 2 && !!m, o(l);
		}
	}
}
var EditMap = class {
	constructor() {
		this.map = [];
	}
	add(i, a, o) {
		addImplementation(this, i, a, o);
	}
	consume(i) {
		/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
		if (this.map.sort(function(i, a) {
			return i[0] - a[0];
		}), this.map.length === 0) return;
		let a = this.map.length, o = [];
		for (; a > 0;) --a, o.push(i.slice(this.map[a][0] + this.map[a][1]), this.map[a][2]), i.length = this.map[a][0];
		o.push(i.slice()), i.length = 0;
		let s = o.pop();
		for (; s;) {
			for (let a of s) i.push(a);
			s = o.pop();
		}
		this.map.length = 0;
	}
};
function addImplementation(i, a, o, s) {
	let c = 0;
	if (!(o === 0 && s.length === 0)) {
		for (; c < i.map.length;) {
			if (i.map[c][0] === a) {
				i.map[c][1] += o, i.map[c][2].push(...s);
				return;
			}
			c += 1;
		}
		i.map.push([
			a,
			o,
			s
		]);
	}
}
function gfmTableAlign(i, a) {
	let o = !1, s = [];
	for (; a < i.length;) {
		let c = i[a];
		if (o) {
			if (c[0] === "enter") c[1].type === "tableContent" && s.push(i[a + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
			else if (c[1].type === "tableContent") {
				if (i[a - 1][1].type === "tableDelimiterMarker") {
					let i = s.length - 1;
					s[i] = s[i] === "left" ? "center" : "right";
				}
			} else if (c[1].type === "tableDelimiterRow") break;
		} else c[0] === "enter" && c[1].type === "tableDelimiterRow" && (o = !0);
		a += 1;
	}
	return s;
}
function gfmTable() {
	return { flow: { null: {
		name: "table",
		tokenize: tokenizeTable,
		resolveAll: resolveTable
	} } };
}
function tokenizeTable(i, a, o) {
	let s = this, c = 0, l = 0, u;
	return d;
	function d(i) {
		let a = s.events.length - 1;
		for (; a > -1;) {
			let i = s.events[a][1].type;
			if (i === "lineEnding" || i === "linePrefix") a--;
			else break;
		}
		let c = a > -1 ? s.events[a][1].type : null, l = c === "tableHead" || c === "tableRow" ? E : f;
		return l === E && s.parser.lazy[s.now().line] ? o(i) : l(i);
	}
	function f(a) {
		return i.enter("tableHead"), i.enter("tableRow"), p(a);
	}
	function p(i) {
		return i === 124 ? m(i) : (u = !0, l += 1, m(i));
	}
	function m(a) {
		return a === null ? o(a) : markdownLineEnding(a) ? l > 1 ? (l = 0, s.interrupt = !0, i.exit("tableRow"), i.enter("lineEnding"), i.consume(a), i.exit("lineEnding"), _) : o(a) : markdownSpace(a) ? factorySpace(i, m, "whitespace")(a) : (l += 1, u && (u = !1, c += 1), a === 124 ? (i.enter("tableCellDivider"), i.consume(a), i.exit("tableCellDivider"), u = !0, m) : (i.enter("data"), h(a)));
	}
	function h(a) {
		return a === null || a === 124 || markdownLineEndingOrSpace(a) ? (i.exit("data"), m(a)) : (i.consume(a), a === 92 ? g : h);
	}
	function g(a) {
		return a === 92 || a === 124 ? (i.consume(a), h) : h(a);
	}
	function _(a) {
		return s.interrupt = !1, s.parser.lazy[s.now().line] ? o(a) : (i.enter("tableDelimiterRow"), u = !1, markdownSpace(a) ? factorySpace(i, v, "linePrefix", s.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a) : v(a));
	}
	function v(a) {
		return a === 45 || a === 58 ? b(a) : a === 124 ? (u = !0, i.enter("tableCellDivider"), i.consume(a), i.exit("tableCellDivider"), y) : T(a);
	}
	function y(a) {
		return markdownSpace(a) ? factorySpace(i, b, "whitespace")(a) : b(a);
	}
	function b(a) {
		return a === 58 ? (l += 1, u = !0, i.enter("tableDelimiterMarker"), i.consume(a), i.exit("tableDelimiterMarker"), x) : a === 45 ? (l += 1, x(a)) : a === null || markdownLineEnding(a) ? w(a) : T(a);
	}
	function x(a) {
		return a === 45 ? (i.enter("tableDelimiterFiller"), S(a)) : T(a);
	}
	function S(a) {
		return a === 45 ? (i.consume(a), S) : a === 58 ? (u = !0, i.exit("tableDelimiterFiller"), i.enter("tableDelimiterMarker"), i.consume(a), i.exit("tableDelimiterMarker"), C) : (i.exit("tableDelimiterFiller"), C(a));
	}
	function C(a) {
		return markdownSpace(a) ? factorySpace(i, w, "whitespace")(a) : w(a);
	}
	function w(o) {
		return o === 124 ? v(o) : o === null || markdownLineEnding(o) ? !u || c !== l ? T(o) : (i.exit("tableDelimiterRow"), i.exit("tableHead"), a(o)) : T(o);
	}
	function T(i) {
		return o(i);
	}
	function E(a) {
		return i.enter("tableRow"), D(a);
	}
	function D(o) {
		return o === 124 ? (i.enter("tableCellDivider"), i.consume(o), i.exit("tableCellDivider"), D) : o === null || markdownLineEnding(o) ? (i.exit("tableRow"), a(o)) : markdownSpace(o) ? factorySpace(i, D, "whitespace")(o) : (i.enter("data"), O(o));
	}
	function O(a) {
		return a === null || a === 124 || markdownLineEndingOrSpace(a) ? (i.exit("data"), D(a)) : (i.consume(a), a === 92 ? k : O);
	}
	function k(a) {
		return a === 92 || a === 124 ? (i.consume(a), O) : O(a);
	}
}
function resolveTable(i, a) {
	let o = -1, s = !0, c = 0, l = [
		0,
		0,
		0,
		0
	], u = [
		0,
		0,
		0,
		0
	], d = !1, f = 0, p, m, h, g = new EditMap();
	for (; ++o < i.length;) {
		let _ = i[o], v = _[1];
		_[0] === "enter" ? v.type === "tableHead" ? (d = !1, f !== 0 && (flushTableEnd(g, a, f, p, m), m = void 0, f = 0), p = {
			type: "table",
			start: Object.assign({}, v.start),
			end: Object.assign({}, v.end)
		}, g.add(o, 0, [[
			"enter",
			p,
			a
		]])) : v.type === "tableRow" || v.type === "tableDelimiterRow" ? (s = !0, h = void 0, l = [
			0,
			0,
			0,
			0
		], u = [
			0,
			o + 1,
			0,
			0
		], d && (d = !1, m = {
			type: "tableBody",
			start: Object.assign({}, v.start),
			end: Object.assign({}, v.end)
		}, g.add(o, 0, [[
			"enter",
			m,
			a
		]])), c = v.type === "tableDelimiterRow" ? 2 : m ? 3 : 1) : c && (v.type === "data" || v.type === "tableDelimiterMarker" || v.type === "tableDelimiterFiller") ? (s = !1, u[2] === 0 && (l[1] !== 0 && (u[0] = u[1], h = flushCell(g, a, l, c, void 0, h), l = [
			0,
			0,
			0,
			0
		]), u[2] = o)) : v.type === "tableCellDivider" && (s ? s = !1 : (l[1] !== 0 && (u[0] = u[1], h = flushCell(g, a, l, c, void 0, h)), l = u, u = [
			l[1],
			o,
			0,
			0
		])) : v.type === "tableHead" ? (d = !0, f = o) : v.type === "tableRow" || v.type === "tableDelimiterRow" ? (f = o, l[1] === 0 ? u[1] !== 0 && (h = flushCell(g, a, u, c, o, h)) : (u[0] = u[1], h = flushCell(g, a, l, c, o, h)), c = 0) : c && (v.type === "data" || v.type === "tableDelimiterMarker" || v.type === "tableDelimiterFiller") && (u[3] = o);
	}
	for (f !== 0 && flushTableEnd(g, a, f, p, m), g.consume(a.events), o = -1; ++o < a.events.length;) {
		let i = a.events[o];
		i[0] === "enter" && i[1].type === "table" && (i[1]._align = gfmTableAlign(a.events, o));
	}
	return i;
}
function flushCell(i, a, o, s, c, l) {
	let u = s === 1 ? "tableHeader" : s === 2 ? "tableDelimiter" : "tableData";
	o[0] !== 0 && (l.end = Object.assign({}, getPoint(a.events, o[0])), i.add(o[0], 0, [[
		"exit",
		l,
		a
	]]));
	let d = getPoint(a.events, o[1]);
	if (l = {
		type: u,
		start: Object.assign({}, d),
		end: Object.assign({}, d)
	}, i.add(o[1], 0, [[
		"enter",
		l,
		a
	]]), o[2] !== 0) {
		let c = getPoint(a.events, o[2]), l = getPoint(a.events, o[3]), u = {
			type: "tableContent",
			start: Object.assign({}, c),
			end: Object.assign({}, l)
		};
		if (i.add(o[2], 0, [[
			"enter",
			u,
			a
		]]), s !== 2) {
			let s = a.events[o[2]], c = a.events[o[3]];
			if (s[1].end = Object.assign({}, c[1].end), s[1].type = "chunkText", s[1].contentType = "text", o[3] > o[2] + 1) {
				let a = o[2] + 1, s = o[3] - o[2] - 1;
				i.add(a, s, []);
			}
		}
		i.add(o[3] + 1, 0, [[
			"exit",
			u,
			a
		]]);
	}
	return c !== void 0 && (l.end = Object.assign({}, getPoint(a.events, c)), i.add(c, 0, [[
		"exit",
		l,
		a
	]]), l = void 0), l;
}
function flushTableEnd(i, a, o, s, c) {
	let l = [], u = getPoint(a.events, o);
	c && (c.end = Object.assign({}, u), l.push([
		"exit",
		c,
		a
	])), s.end = Object.assign({}, u), l.push([
		"exit",
		s,
		a
	]), i.add(o + 1, 0, l);
}
function getPoint(i, a) {
	let o = i[a], s = o[0] === "enter" ? "start" : "end";
	return o[1][s];
}
var tasklistCheck = {
	name: "tasklistCheck",
	tokenize: tokenizeTasklistCheck
};
function gfmTaskListItem() {
	return { text: { 91: tasklistCheck } };
}
function tokenizeTasklistCheck(i, a, o) {
	let s = this;
	return c;
	function c(a) {
		return s.previous !== null || !s._gfmTasklistFirstContentOfListItem ? o(a) : (i.enter("taskListCheck"), i.enter("taskListCheckMarker"), i.consume(a), i.exit("taskListCheckMarker"), l);
	}
	function l(a) {
		return markdownLineEndingOrSpace(a) ? (i.enter("taskListCheckValueUnchecked"), i.consume(a), i.exit("taskListCheckValueUnchecked"), u) : a === 88 || a === 120 ? (i.enter("taskListCheckValueChecked"), i.consume(a), i.exit("taskListCheckValueChecked"), u) : o(a);
	}
	function u(a) {
		return a === 93 ? (i.enter("taskListCheckMarker"), i.consume(a), i.exit("taskListCheckMarker"), i.exit("taskListCheck"), d) : o(a);
	}
	function d(s) {
		return markdownLineEnding(s) ? a(s) : markdownSpace(s) ? i.check({ tokenize: spaceThenNonSpace }, a, o)(s) : o(s);
	}
}
function spaceThenNonSpace(i, a, o) {
	return factorySpace(i, s, "whitespace");
	function s(i) {
		return i === null ? o(i) : a(i);
	}
}
function gfm(i) {
	return combineExtensions([
		gfmAutolinkLiteral(),
		gfmFootnote(),
		gfmStrikethrough(i),
		gfmTable(),
		gfmTaskListItem()
	]);
}
var emptyOptions = {};
function remarkGfm(i) {
	let a = this, o = i || emptyOptions, s = a.data(), c = s.micromarkExtensions ||= [], l = s.fromMarkdownExtensions ||= [], u = s.toMarkdownExtensions ||= [];
	c.push(gfm(o)), l.push(gfmFromMarkdown()), u.push(gfmToMarkdown(o));
}
function useCallbackRef(i) {
	let a = React$1.useRef(i);
	return React$1.useEffect(() => {
		a.current = i;
	}), React$1.useMemo(() => (...i) => a.current?.(...i), []);
}
function useEscapeKeydown(i, a = globalThis?.document) {
	let o = useCallbackRef(i);
	React$1.useEffect(() => {
		let i = (i) => {
			i.key === "Escape" && o(i);
		};
		return a.addEventListener("keydown", i, { capture: !0 }), () => a.removeEventListener("keydown", i, { capture: !0 });
	}, [o, a]);
}
var DISMISSABLE_LAYER_NAME = "DismissableLayer", CONTEXT_UPDATE = "dismissableLayer.update", POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside", FOCUS_OUTSIDE = "dismissableLayer.focusOutside", originalBodyPointerEvents, DismissableLayerContext = React$1.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), DismissableLayer = React$1.forwardRef((i, a) => {
	let { disableOutsidePointerEvents: o = !1, onEscapeKeyDown: s, onPointerDownOutside: c, onFocusOutside: l, onInteractOutside: u, onDismiss: d, ...f } = i, p = React$1.useContext(DismissableLayerContext), [m, h] = React$1.useState(null), g = m?.ownerDocument ?? globalThis?.document, [, v] = React$1.useState({}), y = useComposedRefs(a, (i) => h(i)), b = Array.from(p.layers), [x] = [...p.layersWithOutsidePointerEventsDisabled].slice(-1), S = b.indexOf(x), C = m ? b.indexOf(m) : -1, w = p.layersWithOutsidePointerEventsDisabled.size > 0, T = C >= S, E = usePointerDownOutside((i) => {
		let a = i.target, o = [...p.branches].some((i) => i.contains(a));
		!T || o || (c?.(i), u?.(i), i.defaultPrevented || d?.());
	}, g), D = useFocusOutside((i) => {
		let a = i.target;
		[...p.branches].some((i) => i.contains(a)) || (l?.(i), u?.(i), i.defaultPrevented || d?.());
	}, g);
	return useEscapeKeydown((i) => {
		C === p.layers.size - 1 && (s?.(i), !i.defaultPrevented && d && (i.preventDefault(), d()));
	}, g), React$1.useEffect(() => {
		if (m) return o && (p.layersWithOutsidePointerEventsDisabled.size === 0 && (originalBodyPointerEvents = g.body.style.pointerEvents, g.body.style.pointerEvents = "none"), p.layersWithOutsidePointerEventsDisabled.add(m)), p.layers.add(m), dispatchUpdate(), () => {
			o && p.layersWithOutsidePointerEventsDisabled.size === 1 && (g.body.style.pointerEvents = originalBodyPointerEvents);
		};
	}, [
		m,
		g,
		o,
		p
	]), React$1.useEffect(() => () => {
		m && (p.layers.delete(m), p.layersWithOutsidePointerEventsDisabled.delete(m), dispatchUpdate());
	}, [m, p]), React$1.useEffect(() => {
		let i = () => v({});
		return document.addEventListener(CONTEXT_UPDATE, i), () => document.removeEventListener(CONTEXT_UPDATE, i);
	}, []), /* @__PURE__ */ jsx(Primitive.div, {
		...f,
		ref: y,
		style: {
			pointerEvents: w ? T ? "auto" : "none" : void 0,
			...i.style
		},
		onFocusCapture: composeEventHandlers(i.onFocusCapture, D.onFocusCapture),
		onBlurCapture: composeEventHandlers(i.onBlurCapture, D.onBlurCapture),
		onPointerDownCapture: composeEventHandlers(i.onPointerDownCapture, E.onPointerDownCapture)
	});
});
DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;
var BRANCH_NAME = "DismissableLayerBranch", DismissableLayerBranch = React$1.forwardRef((i, a) => {
	let o = React$1.useContext(DismissableLayerContext), s = React$1.useRef(null), c = useComposedRefs(a, s);
	return React$1.useEffect(() => {
		let i = s.current;
		if (i) return o.branches.add(i), () => {
			o.branches.delete(i);
		};
	}, [o.branches]), /* @__PURE__ */ jsx(Primitive.div, {
		...i,
		ref: c
	});
});
DismissableLayerBranch.displayName = BRANCH_NAME;
function usePointerDownOutside(i, a = globalThis?.document) {
	let o = useCallbackRef(i), s = React$1.useRef(!1), c = React$1.useRef(() => {});
	return React$1.useEffect(() => {
		let i = (i) => {
			if (i.target && !s.current) {
				let s = function() {
					handleAndDispatchCustomEvent(POINTER_DOWN_OUTSIDE, o, l, { discrete: !0 });
				}, l = { originalEvent: i };
				i.pointerType === "touch" ? (a.removeEventListener("click", c.current), c.current = s, a.addEventListener("click", c.current, { once: !0 })) : s();
			} else a.removeEventListener("click", c.current);
			s.current = !1;
		}, l = window.setTimeout(() => {
			a.addEventListener("pointerdown", i);
		}, 0);
		return () => {
			window.clearTimeout(l), a.removeEventListener("pointerdown", i), a.removeEventListener("click", c.current);
		};
	}, [a, o]), { onPointerDownCapture: () => s.current = !0 };
}
function useFocusOutside(i, a = globalThis?.document) {
	let o = useCallbackRef(i), s = React$1.useRef(!1);
	return React$1.useEffect(() => {
		let i = (i) => {
			i.target && !s.current && handleAndDispatchCustomEvent(FOCUS_OUTSIDE, o, { originalEvent: i }, { discrete: !1 });
		};
		return a.addEventListener("focusin", i), () => a.removeEventListener("focusin", i);
	}, [a, o]), {
		onFocusCapture: () => s.current = !0,
		onBlurCapture: () => s.current = !1
	};
}
function dispatchUpdate() {
	let i = new CustomEvent(CONTEXT_UPDATE);
	document.dispatchEvent(i);
}
function handleAndDispatchCustomEvent(i, a, o, { discrete: s }) {
	let c = o.originalEvent.target, l = new CustomEvent(i, {
		bubbles: !1,
		cancelable: !0,
		detail: o
	});
	a && c.addEventListener(i, a, { once: !0 }), s ? dispatchDiscreteCustomEvent(c, l) : c.dispatchEvent(l);
}
var count = 0;
function useFocusGuards() {
	React$1.useEffect(() => {
		let i = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", i[0] ?? createFocusGuard()), document.body.insertAdjacentElement("beforeend", i[1] ?? createFocusGuard()), count++, () => {
			count === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((i) => i.remove()), count--;
		};
	}, []);
}
function createFocusGuard() {
	let i = document.createElement("span");
	return i.setAttribute("data-radix-focus-guard", ""), i.tabIndex = 0, i.style.outline = "none", i.style.opacity = "0", i.style.position = "fixed", i.style.pointerEvents = "none", i;
}
var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount", AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount", EVENT_OPTIONS = {
	bubbles: !1,
	cancelable: !0
}, FOCUS_SCOPE_NAME = "FocusScope", FocusScope = React$1.forwardRef((i, a) => {
	let { loop: o = !1, trapped: s = !1, onMountAutoFocus: c, onUnmountAutoFocus: l, ...u } = i, [d, f] = React$1.useState(null), p = useCallbackRef(c), m = useCallbackRef(l), h = React$1.useRef(null), g = useComposedRefs(a, (i) => f(i)), v = React$1.useRef({
		paused: !1,
		pause() {
			this.paused = !0;
		},
		resume() {
			this.paused = !1;
		}
	}).current;
	React$1.useEffect(() => {
		if (s) {
			let i = function(i) {
				if (v.paused || !d) return;
				let a = i.target;
				d.contains(a) ? h.current = a : focus(h.current, { select: !0 });
			}, a = function(i) {
				if (v.paused || !d) return;
				let a = i.relatedTarget;
				a !== null && (d.contains(a) || focus(h.current, { select: !0 }));
			}, o = function(i) {
				if (document.activeElement === document.body) for (let a of i) a.removedNodes.length > 0 && focus(d);
			};
			document.addEventListener("focusin", i), document.addEventListener("focusout", a);
			let s = new MutationObserver(o);
			return d && s.observe(d, {
				childList: !0,
				subtree: !0
			}), () => {
				document.removeEventListener("focusin", i), document.removeEventListener("focusout", a), s.disconnect();
			};
		}
	}, [
		s,
		d,
		v.paused
	]), React$1.useEffect(() => {
		if (d) {
			focusScopesStack.add(v);
			let i = document.activeElement;
			if (!d.contains(i)) {
				let a = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
				d.addEventListener(AUTOFOCUS_ON_MOUNT, p), d.dispatchEvent(a), a.defaultPrevented || (focusFirst(removeLinks(getTabbableCandidates(d)), { select: !0 }), document.activeElement === i && focus(d));
			}
			return () => {
				d.removeEventListener(AUTOFOCUS_ON_MOUNT, p), setTimeout(() => {
					let a = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
					d.addEventListener(AUTOFOCUS_ON_UNMOUNT, m), d.dispatchEvent(a), a.defaultPrevented || focus(i ?? document.body, { select: !0 }), d.removeEventListener(AUTOFOCUS_ON_UNMOUNT, m), focusScopesStack.remove(v);
				}, 0);
			};
		}
	}, [
		d,
		p,
		m,
		v
	]);
	let y = React$1.useCallback((i) => {
		if (!o && !s || v.paused) return;
		let a = i.key === "Tab" && !i.altKey && !i.ctrlKey && !i.metaKey, c = document.activeElement;
		if (a && c) {
			let a = i.currentTarget, [s, l] = getTabbableEdges(a);
			s && l ? !i.shiftKey && c === l ? (i.preventDefault(), o && focus(s, { select: !0 })) : i.shiftKey && c === s && (i.preventDefault(), o && focus(l, { select: !0 })) : c === a && i.preventDefault();
		}
	}, [
		o,
		s,
		v.paused
	]);
	return /* @__PURE__ */ jsx(Primitive.div, {
		tabIndex: -1,
		...u,
		ref: g,
		onKeyDown: y
	});
});
FocusScope.displayName = FOCUS_SCOPE_NAME;
function focusFirst(i, { select: a = !1 } = {}) {
	let o = document.activeElement;
	for (let s of i) if (focus(s, { select: a }), document.activeElement !== o) return;
}
function getTabbableEdges(i) {
	let a = getTabbableCandidates(i);
	return [findVisible(a, i), findVisible(a.reverse(), i)];
}
function getTabbableCandidates(i) {
	let a = [], o = document.createTreeWalker(i, NodeFilter.SHOW_ELEMENT, { acceptNode: (i) => {
		let a = i.tagName === "INPUT" && i.type === "hidden";
		return i.disabled || i.hidden || a ? NodeFilter.FILTER_SKIP : i.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; o.nextNode();) a.push(o.currentNode);
	return a;
}
function findVisible(i, a) {
	for (let o of i) if (!isHidden(o, { upTo: a })) return o;
}
function isHidden(i, { upTo: a }) {
	if (getComputedStyle(i).visibility === "hidden") return !0;
	for (; i;) {
		if (a !== void 0 && i === a) return !1;
		if (getComputedStyle(i).display === "none") return !0;
		i = i.parentElement;
	}
	return !1;
}
function isSelectableInput(i) {
	return i instanceof HTMLInputElement && "select" in i;
}
function focus(i, { select: a = !1 } = {}) {
	if (i && i.focus) {
		let o = document.activeElement;
		i.focus({ preventScroll: !0 }), i !== o && isSelectableInput(i) && a && i.select();
	}
}
var focusScopesStack = createFocusScopesStack();
function createFocusScopesStack() {
	let i = [];
	return {
		add(a) {
			let o = i[0];
			a !== o && o?.pause(), i = arrayRemove(i, a), i.unshift(a);
		},
		remove(a) {
			i = arrayRemove(i, a), i[0]?.resume();
		}
	};
}
function arrayRemove(i, a) {
	let o = [...i], s = o.indexOf(a);
	return s !== -1 && o.splice(s, 1), o;
}
function removeLinks(i) {
	return i.filter((i) => i.tagName !== "A");
}
var sides = [
	"top",
	"right",
	"bottom",
	"left"
], min = Math.min, max = Math.max, round = Math.round, floor = Math.floor, createCoords = (i) => ({
	x: i,
	y: i
}), oppositeSideMap = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
}, oppositeAlignmentMap = {
	start: "end",
	end: "start"
};
function clamp$1(i, a, o) {
	return max(i, min(a, o));
}
function evaluate(i, a) {
	return typeof i == "function" ? i(a) : i;
}
function getSide(i) {
	return i.split("-")[0];
}
function getAlignment(i) {
	return i.split("-")[1];
}
function getOppositeAxis(i) {
	return i === "x" ? "y" : "x";
}
function getAxisLength(i) {
	return i === "y" ? "height" : "width";
}
var yAxisSides = /* @__PURE__ */ new Set(["top", "bottom"]);
function getSideAxis(i) {
	return yAxisSides.has(getSide(i)) ? "y" : "x";
}
function getAlignmentAxis(i) {
	return getOppositeAxis(getSideAxis(i));
}
function getAlignmentSides(i, a, o) {
	o === void 0 && (o = !1);
	let s = getAlignment(i), c = getAlignmentAxis(i), l = getAxisLength(c), u = c === "x" ? s === (o ? "end" : "start") ? "right" : "left" : s === "start" ? "bottom" : "top";
	return a.reference[l] > a.floating[l] && (u = getOppositePlacement(u)), [u, getOppositePlacement(u)];
}
function getExpandedPlacements(i) {
	let a = getOppositePlacement(i);
	return [
		getOppositeAlignmentPlacement(i),
		a,
		getOppositeAlignmentPlacement(a)
	];
}
function getOppositeAlignmentPlacement(i) {
	return i.replace(/start|end/g, (i) => oppositeAlignmentMap[i]);
}
var lrPlacement = ["left", "right"], rlPlacement = ["right", "left"], tbPlacement = ["top", "bottom"], btPlacement = ["bottom", "top"];
function getSideList(i, a, o) {
	switch (i) {
		case "top":
		case "bottom": return o ? a ? rlPlacement : lrPlacement : a ? lrPlacement : rlPlacement;
		case "left":
		case "right": return a ? tbPlacement : btPlacement;
		default: return [];
	}
}
function getOppositeAxisPlacements(i, a, o, s) {
	let c = getAlignment(i), l = getSideList(getSide(i), o === "start", s);
	return c && (l = l.map((i) => i + "-" + c), a && (l = l.concat(l.map(getOppositeAlignmentPlacement)))), l;
}
function getOppositePlacement(i) {
	return i.replace(/left|right|bottom|top/g, (i) => oppositeSideMap[i]);
}
function expandPaddingObject(i) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...i
	};
}
function getPaddingObject(i) {
	return typeof i == "number" ? {
		top: i,
		right: i,
		bottom: i,
		left: i
	} : expandPaddingObject(i);
}
function rectToClientRect(i) {
	let { x: a, y: o, width: s, height: c } = i;
	return {
		width: s,
		height: c,
		top: o,
		left: a,
		right: a + s,
		bottom: o + c,
		x: a,
		y: o
	};
}
function computeCoordsFromPlacement(i, a, o) {
	let { reference: s, floating: c } = i, l = getSideAxis(a), u = getAlignmentAxis(a), d = getAxisLength(u), f = getSide(a), p = l === "y", m = s.x + s.width / 2 - c.width / 2, h = s.y + s.height / 2 - c.height / 2, g = s[d] / 2 - c[d] / 2, _;
	switch (f) {
		case "top":
			_ = {
				x: m,
				y: s.y - c.height
			};
			break;
		case "bottom":
			_ = {
				x: m,
				y: s.y + s.height
			};
			break;
		case "right":
			_ = {
				x: s.x + s.width,
				y: h
			};
			break;
		case "left":
			_ = {
				x: s.x - c.width,
				y: h
			};
			break;
		default: _ = {
			x: s.x,
			y: s.y
		};
	}
	switch (getAlignment(a)) {
		case "start":
			_[u] -= g * (o && p ? -1 : 1);
			break;
		case "end":
			_[u] += g * (o && p ? -1 : 1);
			break;
	}
	return _;
}
var computePosition$1 = async (i, a, o) => {
	let { placement: s = "bottom", strategy: c = "absolute", middleware: l = [], platform: u } = o, d = l.filter(Boolean), f = await (u.isRTL == null ? void 0 : u.isRTL(a)), p = await u.getElementRects({
		reference: i,
		floating: a,
		strategy: c
	}), { x: m, y: h } = computeCoordsFromPlacement(p, s, f), g = s, _ = {}, v = 0;
	for (let o = 0; o < d.length; o++) {
		let { name: l, fn: y } = d[o], { x: b, y: x, data: S, reset: C } = await y({
			x: m,
			y: h,
			initialPlacement: s,
			placement: g,
			strategy: c,
			middlewareData: _,
			rects: p,
			platform: u,
			elements: {
				reference: i,
				floating: a
			}
		});
		m = b ?? m, h = x ?? h, _ = {
			..._,
			[l]: {
				..._[l],
				...S
			}
		}, C && v <= 50 && (v++, typeof C == "object" && (C.placement && (g = C.placement), C.rects && (p = C.rects === !0 ? await u.getElementRects({
			reference: i,
			floating: a,
			strategy: c
		}) : C.rects), {x: m, y: h} = computeCoordsFromPlacement(p, g, f)), o = -1);
	}
	return {
		x: m,
		y: h,
		placement: g,
		strategy: c,
		middlewareData: _
	};
};
async function detectOverflow$1(i, a) {
	a === void 0 && (a = {});
	let { x: o, y: s, platform: c, rects: l, elements: u, strategy: d } = i, { boundary: f = "clippingAncestors", rootBoundary: p = "viewport", elementContext: m = "floating", altBoundary: h = !1, padding: g = 0 } = evaluate(a, i), _ = getPaddingObject(g), v = u[h ? m === "floating" ? "reference" : "floating" : m], y = rectToClientRect(await c.getClippingRect({
		element: await (c.isElement == null ? void 0 : c.isElement(v)) ?? !0 ? v : v.contextElement || await (c.getDocumentElement == null ? void 0 : c.getDocumentElement(u.floating)),
		boundary: f,
		rootBoundary: p,
		strategy: d
	})), b = m === "floating" ? {
		x: o,
		y: s,
		width: l.floating.width,
		height: l.floating.height
	} : l.reference, x = await (c.getOffsetParent == null ? void 0 : c.getOffsetParent(u.floating)), S = await (c.isElement == null ? void 0 : c.isElement(x)) && await (c.getScale == null ? void 0 : c.getScale(x)) || {
		x: 1,
		y: 1
	}, C = rectToClientRect(c.convertOffsetParentRelativeRectToViewportRelativeRect ? await c.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: u,
		rect: b,
		offsetParent: x,
		strategy: d
	}) : b);
	return {
		top: (y.top - C.top + _.top) / S.y,
		bottom: (C.bottom - y.bottom + _.bottom) / S.y,
		left: (y.left - C.left + _.left) / S.x,
		right: (C.right - y.right + _.right) / S.x
	};
}
var arrow$2 = (i) => ({
	name: "arrow",
	options: i,
	async fn(a) {
		let { x: o, y: s, placement: c, rects: l, platform: u, elements: d, middlewareData: f } = a, { element: p, padding: m = 0 } = evaluate(i, a) || {};
		if (p == null) return {};
		let h = getPaddingObject(m), g = {
			x: o,
			y: s
		}, _ = getAlignmentAxis(c), v = getAxisLength(_), y = await u.getDimensions(p), b = _ === "y", x = b ? "top" : "left", S = b ? "bottom" : "right", C = b ? "clientHeight" : "clientWidth", w = l.reference[v] + l.reference[_] - g[_] - l.floating[v], T = g[_] - l.reference[_], E = await (u.getOffsetParent == null ? void 0 : u.getOffsetParent(p)), D = E ? E[C] : 0;
		(!D || !await (u.isElement == null ? void 0 : u.isElement(E))) && (D = d.floating[C] || l.floating[v]);
		let O = w / 2 - T / 2, k = D / 2 - y[v] / 2 - 1, A = min(h[x], k), j = min(h[S], k), M = A, N = D - y[v] - j, P = D / 2 - y[v] / 2 + O, F = clamp$1(M, P, N), I = !f.arrow && getAlignment(c) != null && P !== F && l.reference[v] / 2 - (P < M ? A : j) - y[v] / 2 < 0, L = I ? P < M ? P - M : P - N : 0;
		return {
			[_]: g[_] + L,
			data: {
				[_]: F,
				centerOffset: P - F - L,
				...I && { alignmentOffset: L }
			},
			reset: I
		};
	}
}), flip$2 = function(i) {
	return i === void 0 && (i = {}), {
		name: "flip",
		options: i,
		async fn(a) {
			var o;
			let { placement: s, middlewareData: c, rects: l, initialPlacement: u, platform: d, elements: f } = a, { mainAxis: p = !0, crossAxis: m = !0, fallbackPlacements: h, fallbackStrategy: g = "bestFit", fallbackAxisSideDirection: _ = "none", flipAlignment: v = !0, ...y } = evaluate(i, a);
			if ((o = c.arrow) != null && o.alignmentOffset) return {};
			let b = getSide(s), x = getSideAxis(u), S = getSide(u) === u, C = await (d.isRTL == null ? void 0 : d.isRTL(f.floating)), w = h || (S || !v ? [getOppositePlacement(u)] : getExpandedPlacements(u)), T = _ !== "none";
			!h && T && w.push(...getOppositeAxisPlacements(u, v, _, C));
			let E = [u, ...w], D = await detectOverflow$1(a, y), O = [], k = c.flip?.overflows || [];
			if (p && O.push(D[b]), m) {
				let i = getAlignmentSides(s, l, C);
				O.push(D[i[0]], D[i[1]]);
			}
			if (k = [...k, {
				placement: s,
				overflows: O
			}], !O.every((i) => i <= 0)) {
				let i = (c.flip?.index || 0) + 1, a = E[i];
				if (a && (!(m === "alignment" && x !== getSideAxis(a)) || k.every((i) => getSideAxis(i.placement) === x ? i.overflows[0] > 0 : !0))) return {
					data: {
						index: i,
						overflows: k
					},
					reset: { placement: a }
				};
				let o = k.filter((i) => i.overflows[0] <= 0).sort((i, a) => i.overflows[1] - a.overflows[1])[0]?.placement;
				if (!o) switch (g) {
					case "bestFit": {
						let i = k.filter((i) => {
							if (T) {
								let a = getSideAxis(i.placement);
								return a === x || a === "y";
							}
							return !0;
						}).map((i) => [i.placement, i.overflows.filter((i) => i > 0).reduce((i, a) => i + a, 0)]).sort((i, a) => i[1] - a[1])[0]?.[0];
						i && (o = i);
						break;
					}
					case "initialPlacement":
						o = u;
						break;
				}
				if (s !== o) return { reset: { placement: o } };
			}
			return {};
		}
	};
};
function getSideOffsets(i, a) {
	return {
		top: i.top - a.height,
		right: i.right - a.width,
		bottom: i.bottom - a.height,
		left: i.left - a.width
	};
}
function isAnySideFullyClipped(i) {
	return sides.some((a) => i[a] >= 0);
}
var hide$2 = function(i) {
	return i === void 0 && (i = {}), {
		name: "hide",
		options: i,
		async fn(a) {
			let { rects: o } = a, { strategy: s = "referenceHidden", ...c } = evaluate(i, a);
			switch (s) {
				case "referenceHidden": {
					let i = getSideOffsets(await detectOverflow$1(a, {
						...c,
						elementContext: "reference"
					}), o.reference);
					return { data: {
						referenceHiddenOffsets: i,
						referenceHidden: isAnySideFullyClipped(i)
					} };
				}
				case "escaped": {
					let i = getSideOffsets(await detectOverflow$1(a, {
						...c,
						altBoundary: !0
					}), o.floating);
					return { data: {
						escapedOffsets: i,
						escaped: isAnySideFullyClipped(i)
					} };
				}
				default: return {};
			}
		}
	};
}, originSides = /* @__PURE__ */ new Set(["left", "top"]);
async function convertValueToCoords(i, a) {
	let { placement: o, platform: s, elements: c } = i, l = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), u = getSide(o), d = getAlignment(o), f = getSideAxis(o) === "y", p = originSides.has(u) ? -1 : 1, m = l && f ? -1 : 1, h = evaluate(a, i), { mainAxis: g, crossAxis: _, alignmentAxis: v } = typeof h == "number" ? {
		mainAxis: h,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: h.mainAxis || 0,
		crossAxis: h.crossAxis || 0,
		alignmentAxis: h.alignmentAxis
	};
	return d && typeof v == "number" && (_ = d === "end" ? v * -1 : v), f ? {
		x: _ * m,
		y: g * p
	} : {
		x: g * p,
		y: _ * m
	};
}
var offset$2 = function(i) {
	return i === void 0 && (i = 0), {
		name: "offset",
		options: i,
		async fn(a) {
			var o;
			let { x: s, y: c, placement: l, middlewareData: u } = a, d = await convertValueToCoords(a, i);
			return l === u.offset?.placement && (o = u.arrow) != null && o.alignmentOffset ? {} : {
				x: s + d.x,
				y: c + d.y,
				data: {
					...d,
					placement: l
				}
			};
		}
	};
}, shift$2 = function(i) {
	return i === void 0 && (i = {}), {
		name: "shift",
		options: i,
		async fn(a) {
			let { x: o, y: s, placement: c } = a, { mainAxis: l = !0, crossAxis: u = !1, limiter: d = { fn: (i) => {
				let { x: a, y: o } = i;
				return {
					x: a,
					y: o
				};
			} }, ...f } = evaluate(i, a), p = {
				x: o,
				y: s
			}, m = await detectOverflow$1(a, f), h = getSideAxis(getSide(c)), g = getOppositeAxis(h), _ = p[g], v = p[h];
			if (l) {
				let i = g === "y" ? "top" : "left", a = g === "y" ? "bottom" : "right", o = _ + m[i], s = _ - m[a];
				_ = clamp$1(o, _, s);
			}
			if (u) {
				let i = h === "y" ? "top" : "left", a = h === "y" ? "bottom" : "right", o = v + m[i], s = v - m[a];
				v = clamp$1(o, v, s);
			}
			let y = d.fn({
				...a,
				[g]: _,
				[h]: v
			});
			return {
				...y,
				data: {
					x: y.x - o,
					y: y.y - s,
					enabled: {
						[g]: l,
						[h]: u
					}
				}
			};
		}
	};
}, limitShift$2 = function(i) {
	return i === void 0 && (i = {}), {
		options: i,
		fn(a) {
			let { x: o, y: s, placement: c, rects: l, middlewareData: u } = a, { offset: d = 0, mainAxis: f = !0, crossAxis: p = !0 } = evaluate(i, a), m = {
				x: o,
				y: s
			}, h = getSideAxis(c), g = getOppositeAxis(h), _ = m[g], v = m[h], y = evaluate(d, a), b = typeof y == "number" ? {
				mainAxis: y,
				crossAxis: 0
			} : {
				mainAxis: 0,
				crossAxis: 0,
				...y
			};
			if (f) {
				let i = g === "y" ? "height" : "width", a = l.reference[g] - l.floating[i] + b.mainAxis, o = l.reference[g] + l.reference[i] - b.mainAxis;
				_ < a ? _ = a : _ > o && (_ = o);
			}
			if (p) {
				let i = g === "y" ? "width" : "height", a = originSides.has(getSide(c)), o = l.reference[h] - l.floating[i] + (a && u.offset?.[h] || 0) + (a ? 0 : b.crossAxis), s = l.reference[h] + l.reference[i] + (a ? 0 : u.offset?.[h] || 0) - (a ? b.crossAxis : 0);
				v < o ? v = o : v > s && (v = s);
			}
			return {
				[g]: _,
				[h]: v
			};
		}
	};
}, size$2 = function(i) {
	return i === void 0 && (i = {}), {
		name: "size",
		options: i,
		async fn(a) {
			var o, s;
			let { placement: c, rects: l, platform: u, elements: d } = a, { apply: f = () => {}, ...p } = evaluate(i, a), m = await detectOverflow$1(a, p), h = getSide(c), g = getAlignment(c), _ = getSideAxis(c) === "y", { width: v, height: y } = l.floating, b, x;
			h === "top" || h === "bottom" ? (b = h, x = g === (await (u.isRTL == null ? void 0 : u.isRTL(d.floating)) ? "start" : "end") ? "left" : "right") : (x = h, b = g === "end" ? "top" : "bottom");
			let S = y - m.top - m.bottom, C = v - m.left - m.right, w = min(y - m[b], S), T = min(v - m[x], C), E = !a.middlewareData.shift, D = w, O = T;
			if ((o = a.middlewareData.shift) != null && o.enabled.x && (O = C), (s = a.middlewareData.shift) != null && s.enabled.y && (D = S), E && !g) {
				let i = max(m.left, 0), a = max(m.right, 0), o = max(m.top, 0), s = max(m.bottom, 0);
				_ ? O = v - 2 * (i !== 0 || a !== 0 ? i + a : max(m.left, m.right)) : D = y - 2 * (o !== 0 || s !== 0 ? o + s : max(m.top, m.bottom));
			}
			await f({
				...a,
				availableWidth: O,
				availableHeight: D
			});
			let k = await u.getDimensions(d.floating);
			return v !== k.width || y !== k.height ? { reset: { rects: !0 } } : {};
		}
	};
};
function hasWindow() {
	return typeof window < "u";
}
function getNodeName(i) {
	return isNode(i) ? (i.nodeName || "").toLowerCase() : "#document";
}
function getWindow(i) {
	var a;
	return (i == null || (a = i.ownerDocument) == null ? void 0 : a.defaultView) || window;
}
function getDocumentElement(i) {
	return ((isNode(i) ? i.ownerDocument : i.document) || window.document)?.documentElement;
}
function isNode(i) {
	return hasWindow() ? i instanceof Node || i instanceof getWindow(i).Node : !1;
}
function isElement(i) {
	return hasWindow() ? i instanceof Element || i instanceof getWindow(i).Element : !1;
}
function isHTMLElement(i) {
	return hasWindow() ? i instanceof HTMLElement || i instanceof getWindow(i).HTMLElement : !1;
}
function isShadowRoot(i) {
	return !hasWindow() || typeof ShadowRoot > "u" ? !1 : i instanceof ShadowRoot || i instanceof getWindow(i).ShadowRoot;
}
var invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(i) {
	let { overflow: a, overflowX: o, overflowY: s, display: c } = getComputedStyle$1(i);
	return /auto|scroll|overlay|hidden|clip/.test(a + s + o) && !invalidOverflowDisplayValues.has(c);
}
var tableElements = /* @__PURE__ */ new Set([
	"table",
	"td",
	"th"
]);
function isTableElement(i) {
	return tableElements.has(getNodeName(i));
}
var topLayerSelectors = [":popover-open", ":modal"];
function isTopLayer(i) {
	return topLayerSelectors.some((a) => {
		try {
			return i.matches(a);
		} catch {
			return !1;
		}
	});
}
var transformProperties = [
	"transform",
	"translate",
	"scale",
	"rotate",
	"perspective"
], willChangeValues = [
	"transform",
	"translate",
	"scale",
	"rotate",
	"perspective",
	"filter"
], containValues = [
	"paint",
	"layout",
	"strict",
	"content"
];
function isContainingBlock(i) {
	let a = isWebKit(), o = isElement(i) ? getComputedStyle$1(i) : i;
	return transformProperties.some((i) => o[i] ? o[i] !== "none" : !1) || (o.containerType ? o.containerType !== "normal" : !1) || !a && (o.backdropFilter ? o.backdropFilter !== "none" : !1) || !a && (o.filter ? o.filter !== "none" : !1) || willChangeValues.some((i) => (o.willChange || "").includes(i)) || containValues.some((i) => (o.contain || "").includes(i));
}
function getContainingBlock(i) {
	let a = getParentNode(i);
	for (; isHTMLElement(a) && !isLastTraversableNode(a);) {
		if (isContainingBlock(a)) return a;
		if (isTopLayer(a)) return null;
		a = getParentNode(a);
	}
	return null;
}
function isWebKit() {
	return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
var lastTraversableNodeNames = /* @__PURE__ */ new Set([
	"html",
	"body",
	"#document"
]);
function isLastTraversableNode(i) {
	return lastTraversableNodeNames.has(getNodeName(i));
}
function getComputedStyle$1(i) {
	return getWindow(i).getComputedStyle(i);
}
function getNodeScroll(i) {
	return isElement(i) ? {
		scrollLeft: i.scrollLeft,
		scrollTop: i.scrollTop
	} : {
		scrollLeft: i.scrollX,
		scrollTop: i.scrollY
	};
}
function getParentNode(i) {
	if (getNodeName(i) === "html") return i;
	let a = i.assignedSlot || i.parentNode || isShadowRoot(i) && i.host || getDocumentElement(i);
	return isShadowRoot(a) ? a.host : a;
}
function getNearestOverflowAncestor(i) {
	let a = getParentNode(i);
	return isLastTraversableNode(a) ? i.ownerDocument ? i.ownerDocument.body : i.body : isHTMLElement(a) && isOverflowElement(a) ? a : getNearestOverflowAncestor(a);
}
function getOverflowAncestors(i, a, o) {
	a === void 0 && (a = []), o === void 0 && (o = !0);
	let s = getNearestOverflowAncestor(i), c = s === i.ownerDocument?.body, l = getWindow(s);
	if (c) {
		let i = getFrameElement(l);
		return a.concat(l, l.visualViewport || [], isOverflowElement(s) ? s : [], i && o ? getOverflowAncestors(i) : []);
	}
	return a.concat(s, getOverflowAncestors(s, [], o));
}
function getFrameElement(i) {
	return i.parent && Object.getPrototypeOf(i.parent) ? i.frameElement : null;
}
function getCssDimensions(i) {
	let a = getComputedStyle$1(i), o = parseFloat(a.width) || 0, s = parseFloat(a.height) || 0, c = isHTMLElement(i), l = c ? i.offsetWidth : o, u = c ? i.offsetHeight : s, d = round(o) !== l || round(s) !== u;
	return d && (o = l, s = u), {
		width: o,
		height: s,
		$: d
	};
}
function unwrapElement(i) {
	return isElement(i) ? i : i.contextElement;
}
function getScale(i) {
	let a = unwrapElement(i);
	if (!isHTMLElement(a)) return createCoords(1);
	let o = a.getBoundingClientRect(), { width: s, height: c, $: l } = getCssDimensions(a), u = (l ? round(o.width) : o.width) / s, d = (l ? round(o.height) : o.height) / c;
	return (!u || !Number.isFinite(u)) && (u = 1), (!d || !Number.isFinite(d)) && (d = 1), {
		x: u,
		y: d
	};
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(i) {
	let a = getWindow(i);
	return !isWebKit() || !a.visualViewport ? noOffsets : {
		x: a.visualViewport.offsetLeft,
		y: a.visualViewport.offsetTop
	};
}
function shouldAddVisualOffsets(i, a, o) {
	return a === void 0 && (a = !1), !o || a && o !== getWindow(i) ? !1 : a;
}
function getBoundingClientRect(i, a, o, s) {
	a === void 0 && (a = !1), o === void 0 && (o = !1);
	let c = i.getBoundingClientRect(), l = unwrapElement(i), u = createCoords(1);
	a && (s ? isElement(s) && (u = getScale(s)) : u = getScale(i));
	let d = shouldAddVisualOffsets(l, o, s) ? getVisualOffsets(l) : createCoords(0), f = (c.left + d.x) / u.x, p = (c.top + d.y) / u.y, m = c.width / u.x, h = c.height / u.y;
	if (l) {
		let i = getWindow(l), a = s && isElement(s) ? getWindow(s) : s, o = i, c = getFrameElement(o);
		for (; c && s && a !== o;) {
			let i = getScale(c), a = c.getBoundingClientRect(), s = getComputedStyle$1(c), l = a.left + (c.clientLeft + parseFloat(s.paddingLeft)) * i.x, u = a.top + (c.clientTop + parseFloat(s.paddingTop)) * i.y;
			f *= i.x, p *= i.y, m *= i.x, h *= i.y, f += l, p += u, o = getWindow(c), c = getFrameElement(o);
		}
	}
	return rectToClientRect({
		width: m,
		height: h,
		x: f,
		y: p
	});
}
function getWindowScrollBarX(i, a) {
	let o = getNodeScroll(i).scrollLeft;
	return a ? a.left + o : getBoundingClientRect(getDocumentElement(i)).left + o;
}
function getHTMLOffset(i, a) {
	let o = i.getBoundingClientRect();
	return {
		x: o.left + a.scrollLeft - getWindowScrollBarX(i, o),
		y: o.top + a.scrollTop
	};
}
function convertOffsetParentRelativeRectToViewportRelativeRect(i) {
	let { elements: a, rect: o, offsetParent: s, strategy: c } = i, l = c === "fixed", u = getDocumentElement(s), d = a ? isTopLayer(a.floating) : !1;
	if (s === u || d && l) return o;
	let f = {
		scrollLeft: 0,
		scrollTop: 0
	}, p = createCoords(1), m = createCoords(0), h = isHTMLElement(s);
	if ((h || !h && !l) && ((getNodeName(s) !== "body" || isOverflowElement(u)) && (f = getNodeScroll(s)), isHTMLElement(s))) {
		let i = getBoundingClientRect(s);
		p = getScale(s), m.x = i.x + s.clientLeft, m.y = i.y + s.clientTop;
	}
	let g = u && !h && !l ? getHTMLOffset(u, f) : createCoords(0);
	return {
		width: o.width * p.x,
		height: o.height * p.y,
		x: o.x * p.x - f.scrollLeft * p.x + m.x + g.x,
		y: o.y * p.y - f.scrollTop * p.y + m.y + g.y
	};
}
function getClientRects(i) {
	return Array.from(i.getClientRects());
}
function getDocumentRect(i) {
	let a = getDocumentElement(i), o = getNodeScroll(i), s = i.ownerDocument.body, c = max(a.scrollWidth, a.clientWidth, s.scrollWidth, s.clientWidth), l = max(a.scrollHeight, a.clientHeight, s.scrollHeight, s.clientHeight), u = -o.scrollLeft + getWindowScrollBarX(i), d = -o.scrollTop;
	return getComputedStyle$1(s).direction === "rtl" && (u += max(a.clientWidth, s.clientWidth) - c), {
		width: c,
		height: l,
		x: u,
		y: d
	};
}
var SCROLLBAR_MAX = 25;
function getViewportRect(i, a) {
	let o = getWindow(i), s = getDocumentElement(i), c = o.visualViewport, l = s.clientWidth, u = s.clientHeight, d = 0, f = 0;
	if (c) {
		l = c.width, u = c.height;
		let i = isWebKit();
		(!i || i && a === "fixed") && (d = c.offsetLeft, f = c.offsetTop);
	}
	let p = getWindowScrollBarX(s);
	if (p <= 0) {
		let i = s.ownerDocument, a = i.body, o = getComputedStyle(a), c = i.compatMode === "CSS1Compat" && parseFloat(o.marginLeft) + parseFloat(o.marginRight) || 0, u = Math.abs(s.clientWidth - a.clientWidth - c);
		u <= SCROLLBAR_MAX && (l -= u);
	} else p <= SCROLLBAR_MAX && (l += p);
	return {
		width: l,
		height: u,
		x: d,
		y: f
	};
}
var absoluteOrFixed = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function getInnerBoundingClientRect(i, a) {
	let o = getBoundingClientRect(i, !0, a === "fixed"), s = o.top + i.clientTop, c = o.left + i.clientLeft, l = isHTMLElement(i) ? getScale(i) : createCoords(1);
	return {
		width: i.clientWidth * l.x,
		height: i.clientHeight * l.y,
		x: c * l.x,
		y: s * l.y
	};
}
function getClientRectFromClippingAncestor(i, a, o) {
	let s;
	if (a === "viewport") s = getViewportRect(i, o);
	else if (a === "document") s = getDocumentRect(getDocumentElement(i));
	else if (isElement(a)) s = getInnerBoundingClientRect(a, o);
	else {
		let o = getVisualOffsets(i);
		s = {
			x: a.x - o.x,
			y: a.y - o.y,
			width: a.width,
			height: a.height
		};
	}
	return rectToClientRect(s);
}
function hasFixedPositionAncestor(i, a) {
	let o = getParentNode(i);
	return o === a || !isElement(o) || isLastTraversableNode(o) ? !1 : getComputedStyle$1(o).position === "fixed" || hasFixedPositionAncestor(o, a);
}
function getClippingElementAncestors(i, a) {
	let o = a.get(i);
	if (o) return o;
	let s = getOverflowAncestors(i, [], !1).filter((i) => isElement(i) && getNodeName(i) !== "body"), c = null, l = getComputedStyle$1(i).position === "fixed", u = l ? getParentNode(i) : i;
	for (; isElement(u) && !isLastTraversableNode(u);) {
		let a = getComputedStyle$1(u), o = isContainingBlock(u);
		!o && a.position === "fixed" && (c = null), (l ? !o && !c : !o && a.position === "static" && c && absoluteOrFixed.has(c.position) || isOverflowElement(u) && !o && hasFixedPositionAncestor(i, u)) ? s = s.filter((i) => i !== u) : c = a, u = getParentNode(u);
	}
	return a.set(i, s), s;
}
function getClippingRect(i) {
	let { element: a, boundary: o, rootBoundary: s, strategy: c } = i, l = [...o === "clippingAncestors" ? isTopLayer(a) ? [] : getClippingElementAncestors(a, this._c) : [].concat(o), s], u = l[0], d = l.reduce((i, o) => {
		let s = getClientRectFromClippingAncestor(a, o, c);
		return i.top = max(s.top, i.top), i.right = min(s.right, i.right), i.bottom = min(s.bottom, i.bottom), i.left = max(s.left, i.left), i;
	}, getClientRectFromClippingAncestor(a, u, c));
	return {
		width: d.right - d.left,
		height: d.bottom - d.top,
		x: d.left,
		y: d.top
	};
}
function getDimensions(i) {
	let { width: a, height: o } = getCssDimensions(i);
	return {
		width: a,
		height: o
	};
}
function getRectRelativeToOffsetParent(i, a, o) {
	let s = isHTMLElement(a), c = getDocumentElement(a), l = o === "fixed", u = getBoundingClientRect(i, !0, l, a), d = {
		scrollLeft: 0,
		scrollTop: 0
	}, f = createCoords(0);
	function p() {
		f.x = getWindowScrollBarX(c);
	}
	if (s || !s && !l) if ((getNodeName(a) !== "body" || isOverflowElement(c)) && (d = getNodeScroll(a)), s) {
		let i = getBoundingClientRect(a, !0, l, a);
		f.x = i.x + a.clientLeft, f.y = i.y + a.clientTop;
	} else c && p();
	l && !s && c && p();
	let m = c && !s && !l ? getHTMLOffset(c, d) : createCoords(0);
	return {
		x: u.left + d.scrollLeft - f.x - m.x,
		y: u.top + d.scrollTop - f.y - m.y,
		width: u.width,
		height: u.height
	};
}
function isStaticPositioned(i) {
	return getComputedStyle$1(i).position === "static";
}
function getTrueOffsetParent(i, a) {
	if (!isHTMLElement(i) || getComputedStyle$1(i).position === "fixed") return null;
	if (a) return a(i);
	let o = i.offsetParent;
	return getDocumentElement(i) === o && (o = o.ownerDocument.body), o;
}
function getOffsetParent(i, a) {
	let o = getWindow(i);
	if (isTopLayer(i)) return o;
	if (!isHTMLElement(i)) {
		let a = getParentNode(i);
		for (; a && !isLastTraversableNode(a);) {
			if (isElement(a) && !isStaticPositioned(a)) return a;
			a = getParentNode(a);
		}
		return o;
	}
	let s = getTrueOffsetParent(i, a);
	for (; s && isTableElement(s) && isStaticPositioned(s);) s = getTrueOffsetParent(s, a);
	return s && isLastTraversableNode(s) && isStaticPositioned(s) && !isContainingBlock(s) ? o : s || getContainingBlock(i) || o;
}
var getElementRects = async function(i) {
	let a = this.getOffsetParent || getOffsetParent, o = this.getDimensions, s = await o(i.floating);
	return {
		reference: getRectRelativeToOffsetParent(i.reference, await a(i.floating), i.strategy),
		floating: {
			x: 0,
			y: 0,
			width: s.width,
			height: s.height
		}
	};
};
function isRTL(i) {
	return getComputedStyle$1(i).direction === "rtl";
}
var platform = {
	convertOffsetParentRelativeRectToViewportRelativeRect,
	getDocumentElement,
	getClippingRect,
	getOffsetParent,
	getElementRects,
	getClientRects,
	getDimensions,
	getScale,
	isElement,
	isRTL
};
function rectsAreEqual(i, a) {
	return i.x === a.x && i.y === a.y && i.width === a.width && i.height === a.height;
}
function observeMove(i, a) {
	let o = null, s, c = getDocumentElement(i);
	function l() {
		var i;
		clearTimeout(s), (i = o) == null || i.disconnect(), o = null;
	}
	function u(d, f) {
		d === void 0 && (d = !1), f === void 0 && (f = 1), l();
		let p = i.getBoundingClientRect(), { left: m, top: h, width: g, height: _ } = p;
		if (d || a(), !g || !_) return;
		let v = floor(h), y = floor(c.clientWidth - (m + g)), b = floor(c.clientHeight - (h + _)), x = floor(m), S = {
			rootMargin: -v + "px " + -y + "px " + -b + "px " + -x + "px",
			threshold: max(0, min(1, f)) || 1
		}, C = !0;
		function w(a) {
			let o = a[0].intersectionRatio;
			if (o !== f) {
				if (!C) return u();
				o ? u(!1, o) : s = setTimeout(() => {
					u(!1, 1e-7);
				}, 1e3);
			}
			o === 1 && !rectsAreEqual(p, i.getBoundingClientRect()) && u(), C = !1;
		}
		try {
			o = new IntersectionObserver(w, {
				...S,
				root: c.ownerDocument
			});
		} catch {
			o = new IntersectionObserver(w, S);
		}
		o.observe(i);
	}
	return u(!0), l;
}
function autoUpdate(i, a, o, s) {
	s === void 0 && (s = {});
	let { ancestorScroll: c = !0, ancestorResize: l = !0, elementResize: u = typeof ResizeObserver == "function", layoutShift: d = typeof IntersectionObserver == "function", animationFrame: f = !1 } = s, p = unwrapElement(i), m = c || l ? [...p ? getOverflowAncestors(p) : [], ...getOverflowAncestors(a)] : [];
	m.forEach((i) => {
		c && i.addEventListener("scroll", o, { passive: !0 }), l && i.addEventListener("resize", o);
	});
	let h = p && d ? observeMove(p, o) : null, g = -1, _ = null;
	u && (_ = new ResizeObserver((i) => {
		let [s] = i;
		s && s.target === p && _ && (_.unobserve(a), cancelAnimationFrame(g), g = requestAnimationFrame(() => {
			var i;
			(i = _) == null || i.observe(a);
		})), o();
	}), p && !f && _.observe(p), _.observe(a));
	let v, y = f ? getBoundingClientRect(i) : null;
	f && b();
	function b() {
		let a = getBoundingClientRect(i);
		y && !rectsAreEqual(y, a) && o(), y = a, v = requestAnimationFrame(b);
	}
	return o(), () => {
		var i;
		m.forEach((i) => {
			c && i.removeEventListener("scroll", o), l && i.removeEventListener("resize", o);
		}), h?.(), (i = _) == null || i.disconnect(), _ = null, f && cancelAnimationFrame(v);
	};
}
var offset$1 = offset$2, shift$1 = shift$2, flip$1 = flip$2, size$1 = size$2, hide$1 = hide$2, arrow$1 = arrow$2, limitShift$1 = limitShift$2, computePosition = (i, a, o) => {
	let s = /* @__PURE__ */ new Map(), c = {
		platform,
		...o
	}, l = {
		...c.platform,
		_c: s
	};
	return computePosition$1(i, a, {
		...c,
		platform: l
	});
}, index = typeof document < "u" ? useLayoutEffect : function() {};
function deepEqual(i, a) {
	if (i === a) return !0;
	if (typeof i != typeof a) return !1;
	if (typeof i == "function" && i.toString() === a.toString()) return !0;
	let o, s, c;
	if (i && a && typeof i == "object") {
		if (Array.isArray(i)) {
			if (o = i.length, o !== a.length) return !1;
			for (s = o; s-- !== 0;) if (!deepEqual(i[s], a[s])) return !1;
			return !0;
		}
		if (c = Object.keys(i), o = c.length, o !== Object.keys(a).length) return !1;
		for (s = o; s-- !== 0;) if (!{}.hasOwnProperty.call(a, c[s])) return !1;
		for (s = o; s-- !== 0;) {
			let o = c[s];
			if (!(o === "_owner" && i.$$typeof) && !deepEqual(i[o], a[o])) return !1;
		}
		return !0;
	}
	return i !== i && a !== a;
}
function getDPR(i) {
	return typeof window > "u" ? 1 : (i.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function roundByDPR(i, a) {
	let o = getDPR(i);
	return Math.round(a * o) / o;
}
function useLatestRef(i) {
	let a = React$1.useRef(i);
	return index(() => {
		a.current = i;
	}), a;
}
function useFloating(i) {
	i === void 0 && (i = {});
	let { placement: a = "bottom", strategy: o = "absolute", middleware: s = [], platform: c, elements: { reference: l, floating: u } = {}, transform: d = !0, whileElementsMounted: f, open: p } = i, [m, h] = React$1.useState({
		x: 0,
		y: 0,
		strategy: o,
		placement: a,
		middlewareData: {},
		isPositioned: !1
	}), [g, v] = React$1.useState(s);
	deepEqual(g, s) || v(s);
	let [y, b] = React$1.useState(null), [x, S] = React$1.useState(null), C = React$1.useCallback((i) => {
		i !== D.current && (D.current = i, b(i));
	}, []), w = React$1.useCallback((i) => {
		i !== O.current && (O.current = i, S(i));
	}, []), T = l || y, E = u || x, D = React$1.useRef(null), O = React$1.useRef(null), k = React$1.useRef(m), A = f != null, j = useLatestRef(f), M = useLatestRef(c), N = useLatestRef(p), P = React$1.useCallback(() => {
		if (!D.current || !O.current) return;
		let i = {
			placement: a,
			strategy: o,
			middleware: g
		};
		M.current && (i.platform = M.current), computePosition(D.current, O.current, i).then((i) => {
			let a = {
				...i,
				isPositioned: N.current !== !1
			};
			F.current && !deepEqual(k.current, a) && (k.current = a, ReactDOM$1.flushSync(() => {
				h(a);
			}));
		});
	}, [
		g,
		a,
		o,
		M,
		N
	]);
	index(() => {
		p === !1 && k.current.isPositioned && (k.current.isPositioned = !1, h((i) => ({
			...i,
			isPositioned: !1
		})));
	}, [p]);
	let F = React$1.useRef(!1);
	index(() => (F.current = !0, () => {
		F.current = !1;
	}), []), index(() => {
		if (T && (D.current = T), E && (O.current = E), T && E) {
			if (j.current) return j.current(T, E, P);
			P();
		}
	}, [
		T,
		E,
		P,
		j,
		A
	]);
	let I = React$1.useMemo(() => ({
		reference: D,
		floating: O,
		setReference: C,
		setFloating: w
	}), [C, w]), L = React$1.useMemo(() => ({
		reference: T,
		floating: E
	}), [T, E]), R = React$1.useMemo(() => {
		let i = {
			position: o,
			left: 0,
			top: 0
		};
		if (!L.floating) return i;
		let a = roundByDPR(L.floating, m.x), s = roundByDPR(L.floating, m.y);
		return d ? {
			...i,
			transform: "translate(" + a + "px, " + s + "px)",
			...getDPR(L.floating) >= 1.5 && { willChange: "transform" }
		} : {
			position: o,
			left: a,
			top: s
		};
	}, [
		o,
		d,
		L.floating,
		m.x,
		m.y
	]);
	return React$1.useMemo(() => ({
		...m,
		update: P,
		refs: I,
		elements: L,
		floatingStyles: R
	}), [
		m,
		P,
		I,
		L,
		R
	]);
}
var arrow$1$1 = (i) => {
	function a(i) {
		return {}.hasOwnProperty.call(i, "current");
	}
	return {
		name: "arrow",
		options: i,
		fn(o) {
			let { element: s, padding: c } = typeof i == "function" ? i(o) : i;
			return s && a(s) ? s.current == null ? {} : arrow$1({
				element: s.current,
				padding: c
			}).fn(o) : s ? arrow$1({
				element: s,
				padding: c
			}).fn(o) : {};
		}
	};
}, offset = (i, a) => ({
	...offset$1(i),
	options: [i, a]
}), shift = (i, a) => ({
	...shift$1(i),
	options: [i, a]
}), limitShift = (i, a) => ({
	...limitShift$1(i),
	options: [i, a]
}), flip = (i, a) => ({
	...flip$1(i),
	options: [i, a]
}), size = (i, a) => ({
	...size$1(i),
	options: [i, a]
}), hide = (i, a) => ({
	...hide$1(i),
	options: [i, a]
}), arrow = (i, a) => ({
	...arrow$1$1(i),
	options: [i, a]
}), NAME$1 = "Arrow", Arrow$1 = React$1.forwardRef((i, a) => {
	let { children: o, width: s = 10, height: c = 5, ...l } = i;
	return /* @__PURE__ */ jsx(Primitive.svg, {
		...l,
		ref: a,
		width: s,
		height: c,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: i.asChild ? o : /* @__PURE__ */ jsx("polygon", { points: "0,0 30,0 15,10" })
	});
});
Arrow$1.displayName = NAME$1;
var Root$1 = Arrow$1;
function useSize(i) {
	let [a, o] = React$1.useState(void 0);
	return useLayoutEffect2(() => {
		if (i) {
			o({
				width: i.offsetWidth,
				height: i.offsetHeight
			});
			let a = new ResizeObserver((a) => {
				if (!Array.isArray(a) || !a.length) return;
				let s = a[0], c, l;
				if ("borderBoxSize" in s) {
					let i = s.borderBoxSize, a = Array.isArray(i) ? i[0] : i;
					c = a.inlineSize, l = a.blockSize;
				} else c = i.offsetWidth, l = i.offsetHeight;
				o({
					width: c,
					height: l
				});
			});
			return a.observe(i, { box: "border-box" }), () => a.unobserve(i);
		} else o(void 0);
	}, [i]), a;
}
var POPPER_NAME = "Popper", [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME), [PopperProvider, usePopperContext] = createPopperContext(POPPER_NAME), Popper = (i) => {
	let { __scopePopper: a, children: o } = i, [s, c] = React$1.useState(null);
	return /* @__PURE__ */ jsx(PopperProvider, {
		scope: a,
		anchor: s,
		onAnchorChange: c,
		children: o
	});
};
Popper.displayName = POPPER_NAME;
var ANCHOR_NAME$1 = "PopperAnchor", PopperAnchor = React$1.forwardRef((i, a) => {
	let { __scopePopper: o, virtualRef: s, ...c } = i, l = usePopperContext(ANCHOR_NAME$1, o), u = React$1.useRef(null), d = useComposedRefs(a, u), f = React$1.useRef(null);
	return React$1.useEffect(() => {
		let i = f.current;
		f.current = s?.current || u.current, i !== f.current && l.onAnchorChange(f.current);
	}), s ? null : /* @__PURE__ */ jsx(Primitive.div, {
		...c,
		ref: d
	});
});
PopperAnchor.displayName = ANCHOR_NAME$1;
var CONTENT_NAME$3 = "PopperContent", [PopperContentProvider, useContentContext] = createPopperContext(CONTENT_NAME$3), PopperContent = React$1.forwardRef((i, a) => {
	let { __scopePopper: o, side: s = "bottom", sideOffset: c = 0, align: l = "center", alignOffset: u = 0, arrowPadding: d = 0, avoidCollisions: f = !0, collisionBoundary: p = [], collisionPadding: m = 0, sticky: h = "partial", hideWhenDetached: g = !1, updatePositionStrategy: v = "optimized", onPlaced: y, ...b } = i, x = usePopperContext(CONTENT_NAME$3, o), [S, C] = React$1.useState(null), w = useComposedRefs(a, (i) => C(i)), [T, E] = React$1.useState(null), D = useSize(T), O = D?.width ?? 0, k = D?.height ?? 0, A = s + (l === "center" ? "" : "-" + l), j = typeof m == "number" ? m : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...m
	}, M = Array.isArray(p) ? p : [p], N = M.length > 0, P = {
		padding: j,
		boundary: M.filter(isNotNull),
		altBoundary: N
	}, { refs: F, floatingStyles: I, placement: R, isPositioned: z, middlewareData: B } = useFloating({
		strategy: "fixed",
		placement: A,
		whileElementsMounted: (...i) => autoUpdate(...i, { animationFrame: v === "always" }),
		elements: { reference: x.anchor },
		middleware: [
			offset({
				mainAxis: c + k,
				alignmentAxis: u
			}),
			f && shift({
				mainAxis: !0,
				crossAxis: !1,
				limiter: h === "partial" ? limitShift() : void 0,
				...P
			}),
			f && flip({ ...P }),
			size({
				...P,
				apply: ({ elements: i, rects: a, availableWidth: o, availableHeight: s }) => {
					let { width: c, height: l } = a.reference, u = i.floating.style;
					u.setProperty("--radix-popper-available-width", `${o}px`), u.setProperty("--radix-popper-available-height", `${s}px`), u.setProperty("--radix-popper-anchor-width", `${c}px`), u.setProperty("--radix-popper-anchor-height", `${l}px`);
				}
			}),
			T && arrow({
				element: T,
				padding: d
			}),
			transformOrigin({
				arrowWidth: O,
				arrowHeight: k
			}),
			g && hide({
				strategy: "referenceHidden",
				...P
			})
		]
	}), [V, H] = getSideAndAlignFromPlacement(R), U = useCallbackRef(y);
	useLayoutEffect2(() => {
		z && U?.();
	}, [z, U]);
	let W = B.arrow?.x, G = B.arrow?.y, K = B.arrow?.centerOffset !== 0, [q, J] = React$1.useState();
	return useLayoutEffect2(() => {
		S && J(window.getComputedStyle(S).zIndex);
	}, [S]), /* @__PURE__ */ jsx("div", {
		ref: F.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...I,
			transform: z ? I.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: q,
			"--radix-popper-transform-origin": [B.transformOrigin?.x, B.transformOrigin?.y].join(" "),
			...B.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: i.dir,
		children: /* @__PURE__ */ jsx(PopperContentProvider, {
			scope: o,
			placedSide: V,
			onArrowChange: E,
			arrowX: W,
			arrowY: G,
			shouldHideArrow: K,
			children: /* @__PURE__ */ jsx(Primitive.div, {
				"data-side": V,
				"data-align": H,
				...b,
				ref: w,
				style: {
					...b.style,
					animation: z ? void 0 : "none"
				}
			})
		})
	});
});
PopperContent.displayName = CONTENT_NAME$3;
var ARROW_NAME$2 = "PopperArrow", OPPOSITE_SIDE = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, PopperArrow = React$1.forwardRef(function(i, a) {
	let { __scopePopper: o, ...s } = i, c = useContentContext(ARROW_NAME$2, o), l = OPPOSITE_SIDE[c.placedSide];
	return /* @__PURE__ */ jsx("span", {
		ref: c.onArrowChange,
		style: {
			position: "absolute",
			left: c.arrowX,
			top: c.arrowY,
			[l]: 0,
			transformOrigin: {
				top: "",
				right: "0 0",
				bottom: "center 0",
				left: "100% 0"
			}[c.placedSide],
			transform: {
				top: "translateY(100%)",
				right: "translateY(50%) rotate(90deg) translateX(-50%)",
				bottom: "rotate(180deg)",
				left: "translateY(50%) rotate(-90deg) translateX(50%)"
			}[c.placedSide],
			visibility: c.shouldHideArrow ? "hidden" : void 0
		},
		children: /* @__PURE__ */ jsx(Root$1, {
			...s,
			ref: a,
			style: {
				...s.style,
				display: "block"
			}
		})
	});
});
PopperArrow.displayName = ARROW_NAME$2;
function isNotNull(i) {
	return i !== null;
}
var transformOrigin = (i) => ({
	name: "transformOrigin",
	options: i,
	fn(a) {
		let { placement: o, rects: s, middlewareData: c } = a, l = c.arrow?.centerOffset !== 0, u = l ? 0 : i.arrowWidth, d = l ? 0 : i.arrowHeight, [f, p] = getSideAndAlignFromPlacement(o), m = {
			start: "0%",
			center: "50%",
			end: "100%"
		}[p], h = (c.arrow?.x ?? 0) + u / 2, g = (c.arrow?.y ?? 0) + d / 2, _ = "", v = "";
		return f === "bottom" ? (_ = l ? m : `${h}px`, v = `${-d}px`) : f === "top" ? (_ = l ? m : `${h}px`, v = `${s.floating.height + d}px`) : f === "right" ? (_ = `${-d}px`, v = l ? m : `${g}px`) : f === "left" && (_ = `${s.floating.width + d}px`, v = l ? m : `${g}px`), { data: {
			x: _,
			y: v
		} };
	}
});
function getSideAndAlignFromPlacement(i) {
	let [a, o = "center"] = i.split("-");
	return [a, o];
}
var Root2$2 = Popper, Anchor = PopperAnchor, Content$1 = PopperContent, Arrow = PopperArrow, PORTAL_NAME$3 = "Portal", Portal = React$1.forwardRef((i, a) => {
	let { container: o, ...s } = i, [c, l] = React$1.useState(!1);
	useLayoutEffect2(() => l(!0), []);
	let u = o || c && globalThis?.document?.body;
	return u ? ReactDOM.createPortal(/* @__PURE__ */ jsx(Primitive.div, {
		...s,
		ref: a
	}), u) : null;
});
Portal.displayName = PORTAL_NAME$3;
/* @__NO_SIDE_EFFECTS__ */
function createSlot$3(i) {
	let a = /* @__PURE__ */ createSlotClone$3(i), o = React$1.forwardRef((i, o) => {
		let { children: s, ...c } = i, l = React$1.Children.toArray(s), u = l.find(isSlottable$3);
		if (u) {
			let i = u.props.children, s = l.map((a) => a === u ? React$1.Children.count(i) > 1 ? React$1.Children.only(null) : React$1.isValidElement(i) ? i.props.children : null : a);
			return /* @__PURE__ */ jsx(a, {
				...c,
				ref: o,
				children: React$1.isValidElement(i) ? React$1.cloneElement(i, void 0, s) : null
			});
		}
		return /* @__PURE__ */ jsx(a, {
			...c,
			ref: o,
			children: s
		});
	});
	return o.displayName = `${i}.Slot`, o;
}
/* @__NO_SIDE_EFFECTS__ */
function createSlotClone$3(i) {
	let a = React$1.forwardRef((i, a) => {
		let { children: o, ...s } = i;
		if (React$1.isValidElement(o)) {
			let i = getElementRef$3(o), c = mergeProps$3(s, o.props);
			return o.type !== React$1.Fragment && (c.ref = a ? composeRefs(a, i) : i), React$1.cloneElement(o, c);
		}
		return React$1.Children.count(o) > 1 ? React$1.Children.only(null) : null;
	});
	return a.displayName = `${i}.SlotClone`, a;
}
var SLOTTABLE_IDENTIFIER$3 = Symbol("radix.slottable");
function isSlottable$3(i) {
	return React$1.isValidElement(i) && typeof i.type == "function" && "__radixId" in i.type && i.type.__radixId === SLOTTABLE_IDENTIFIER$3;
}
function mergeProps$3(i, a) {
	let o = { ...a };
	for (let s in a) {
		let c = i[s], l = a[s];
		/^on[A-Z]/.test(s) ? c && l ? o[s] = (...i) => {
			let a = l(...i);
			return c(...i), a;
		} : c && (o[s] = c) : s === "style" ? o[s] = {
			...c,
			...l
		} : s === "className" && (o[s] = [c, l].filter(Boolean).join(" "));
	}
	return {
		...i,
		...o
	};
}
function getElementRef$3(i) {
	let a = Object.getOwnPropertyDescriptor(i.props, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning;
	return o ? i.ref : (a = Object.getOwnPropertyDescriptor(i, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning, o ? i.props.ref : i.props.ref || i.ref);
}
var getDefaultParent = function(i) {
	return typeof document > "u" ? null : (Array.isArray(i) ? i[0] : i).ownerDocument.body;
}, counterMap = /* @__PURE__ */ new WeakMap(), uncontrolledNodes = /* @__PURE__ */ new WeakMap(), markerMap = {}, lockCount = 0, unwrapHost = function(i) {
	return i && (i.host || unwrapHost(i.parentNode));
}, correctTargets = function(i, a) {
	return a.map(function(a) {
		if (i.contains(a)) return a;
		var o = unwrapHost(a);
		return o && i.contains(o) ? o : (console.error("aria-hidden", a, "in not contained inside", i, ". Doing nothing"), null);
	}).filter(function(i) {
		return !!i;
	});
}, applyAttributeToOthers = function(i, a, o, s) {
	var c = correctTargets(a, Array.isArray(i) ? i : [i]);
	markerMap[o] || (markerMap[o] = /* @__PURE__ */ new WeakMap());
	var l = markerMap[o], u = [], d = /* @__PURE__ */ new Set(), f = new Set(c), p = function(i) {
		!i || d.has(i) || (d.add(i), p(i.parentNode));
	};
	c.forEach(p);
	var m = function(i) {
		!i || f.has(i) || Array.prototype.forEach.call(i.children, function(i) {
			if (d.has(i)) m(i);
			else try {
				var a = i.getAttribute(s), c = a !== null && a !== "false", f = (counterMap.get(i) || 0) + 1, p = (l.get(i) || 0) + 1;
				counterMap.set(i, f), l.set(i, p), u.push(i), f === 1 && c && uncontrolledNodes.set(i, !0), p === 1 && i.setAttribute(o, "true"), c || i.setAttribute(s, "true");
			} catch (a) {
				console.error("aria-hidden: cannot operate on ", i, a);
			}
		});
	};
	return m(a), d.clear(), lockCount++, function() {
		u.forEach(function(i) {
			var a = counterMap.get(i) - 1, c = l.get(i) - 1;
			counterMap.set(i, a), l.set(i, c), a || (uncontrolledNodes.has(i) || i.removeAttribute(s), uncontrolledNodes.delete(i)), c || i.removeAttribute(o);
		}), lockCount--, lockCount || (counterMap = /* @__PURE__ */ new WeakMap(), counterMap = /* @__PURE__ */ new WeakMap(), uncontrolledNodes = /* @__PURE__ */ new WeakMap(), markerMap = {});
	};
}, hideOthers = function(i, a, o) {
	o === void 0 && (o = "data-aria-hidden");
	var s = Array.from(Array.isArray(i) ? i : [i]), c = a || getDefaultParent(i);
	return c ? (s.push.apply(s, Array.from(c.querySelectorAll("[aria-live], script"))), applyAttributeToOthers(s, c, o, "aria-hidden")) : function() {
		return null;
	};
}, __assign = function() {
	return __assign = Object.assign || function(i) {
		for (var a, o = 1, s = arguments.length; o < s; o++) for (var c in a = arguments[o], a) Object.prototype.hasOwnProperty.call(a, c) && (i[c] = a[c]);
		return i;
	}, __assign.apply(this, arguments);
};
function __rest(i, a) {
	var o = {};
	for (var s in i) Object.prototype.hasOwnProperty.call(i, s) && a.indexOf(s) < 0 && (o[s] = i[s]);
	if (i != null && typeof Object.getOwnPropertySymbols == "function") for (var c = 0, s = Object.getOwnPropertySymbols(i); c < s.length; c++) a.indexOf(s[c]) < 0 && Object.prototype.propertyIsEnumerable.call(i, s[c]) && (o[s[c]] = i[s[c]]);
	return o;
}
function __spreadArray(i, a, o) {
	if (o || arguments.length === 2) for (var s = 0, c = a.length, l; s < c; s++) (l || !(s in a)) && (l ||= Array.prototype.slice.call(a, 0, s), l[s] = a[s]);
	return i.concat(l || Array.prototype.slice.call(a));
}
var zeroRightClassName = "right-scroll-bar-position", fullWidthClassName = "width-before-scroll-bar", noScrollbarsClassName = "with-scroll-bars-hidden", removedBarSizeVariable = "--removed-body-scroll-bar-size";
function assignRef(i, a) {
	return typeof i == "function" ? i(a) : i && (i.current = a), i;
}
function useCallbackRef$1(i, a) {
	var o = useState(function() {
		return {
			value: i,
			callback: a,
			facade: {
				get current() {
					return o.value;
				},
				set current(i) {
					var a = o.value;
					a !== i && (o.value = i, o.callback(i, a));
				}
			}
		};
	})[0];
	return o.callback = a, o.facade;
}
var useIsomorphicLayoutEffect = typeof window < "u" ? React$1.useLayoutEffect : React$1.useEffect, currentValues = /* @__PURE__ */ new WeakMap();
function useMergeRefs(i, a) {
	var o = useCallbackRef$1(a || null, function(a) {
		return i.forEach(function(i) {
			return assignRef(i, a);
		});
	});
	return useIsomorphicLayoutEffect(function() {
		var a = currentValues.get(o);
		if (a) {
			var s = new Set(a), c = new Set(i), l = o.current;
			s.forEach(function(i) {
				c.has(i) || assignRef(i, null);
			}), c.forEach(function(i) {
				s.has(i) || assignRef(i, l);
			});
		}
		currentValues.set(o, i);
	}, [i]), o;
}
function ItoI(i) {
	return i;
}
function innerCreateMedium(i, a) {
	a === void 0 && (a = ItoI);
	var o = [], s = !1;
	return {
		read: function() {
			if (s) throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
			return o.length ? o[o.length - 1] : i;
		},
		useMedium: function(i) {
			var c = a(i, s);
			return o.push(c), function() {
				o = o.filter(function(i) {
					return i !== c;
				});
			};
		},
		assignSyncMedium: function(i) {
			for (s = !0; o.length;) {
				var a = o;
				o = [], a.forEach(i);
			}
			o = {
				push: function(a) {
					return i(a);
				},
				filter: function() {
					return o;
				}
			};
		},
		assignMedium: function(i) {
			s = !0;
			var a = [];
			if (o.length) {
				var c = o;
				o = [], c.forEach(i), a = o;
			}
			var l = function() {
				var o = a;
				a = [], o.forEach(i);
			}, u = function() {
				return Promise.resolve().then(l);
			};
			u(), o = {
				push: function(i) {
					a.push(i), u();
				},
				filter: function(i) {
					return a = a.filter(i), o;
				}
			};
		}
	};
}
function createSidecarMedium(i) {
	i === void 0 && (i = {});
	var a = innerCreateMedium(null);
	return a.options = __assign({
		async: !0,
		ssr: !1
	}, i), a;
}
var SideCar = function(i) {
	var a = i.sideCar, o = __rest(i, ["sideCar"]);
	if (!a) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var s = a.read();
	if (!s) throw Error("Sidecar medium not found");
	return React$1.createElement(s, __assign({}, o));
};
SideCar.isSideCarExport = !0;
function exportSidecar(i, a) {
	return i.useMedium(a), SideCar;
}
var effectCar = createSidecarMedium(), nothing = function() {}, RemoveScroll = React$1.forwardRef(function(i, a) {
	var o = React$1.useRef(null), s = React$1.useState({
		onScrollCapture: nothing,
		onWheelCapture: nothing,
		onTouchMoveCapture: nothing
	}), c = s[0], l = s[1], u = i.forwardProps, d = i.children, f = i.className, p = i.removeScrollBar, m = i.enabled, h = i.shards, g = i.sideCar, v = i.noRelative, y = i.noIsolation, b = i.inert, x = i.allowPinchZoom, S = i.as, C = S === void 0 ? "div" : S, w = i.gapMode, T = __rest(i, [
		"forwardProps",
		"children",
		"className",
		"removeScrollBar",
		"enabled",
		"shards",
		"sideCar",
		"noRelative",
		"noIsolation",
		"inert",
		"allowPinchZoom",
		"as",
		"gapMode"
	]), E = g, D = useMergeRefs([o, a]), O = __assign(__assign({}, T), c);
	return React$1.createElement(React$1.Fragment, null, m && React$1.createElement(E, {
		sideCar: effectCar,
		removeScrollBar: p,
		shards: h,
		noRelative: v,
		noIsolation: y,
		inert: b,
		setCallbacks: l,
		allowPinchZoom: !!x,
		lockRef: o,
		gapMode: w
	}), u ? React$1.cloneElement(React$1.Children.only(d), __assign(__assign({}, O), { ref: D })) : React$1.createElement(C, __assign({}, O, {
		className: f,
		ref: D
	}), d));
});
RemoveScroll.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, RemoveScroll.classNames = {
	fullWidth: fullWidthClassName,
	zeroRight: zeroRightClassName
};
var currentNonce, getNonce = function() {
	if (currentNonce) return currentNonce;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function makeStyleTag() {
	if (!document) return null;
	var i = document.createElement("style");
	i.type = "text/css";
	var a = getNonce();
	return a && i.setAttribute("nonce", a), i;
}
function injectStyles(i, a) {
	i.styleSheet ? i.styleSheet.cssText = a : i.appendChild(document.createTextNode(a));
}
function insertStyleTag(i) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(i);
}
var stylesheetSingleton = function() {
	var i = 0, a = null;
	return {
		add: function(o) {
			i == 0 && (a = makeStyleTag()) && (injectStyles(a, o), insertStyleTag(a)), i++;
		},
		remove: function() {
			i--, !i && a && (a.parentNode && a.parentNode.removeChild(a), a = null);
		}
	};
}, styleHookSingleton = function() {
	var i = stylesheetSingleton();
	return function(a, o) {
		React$1.useEffect(function() {
			return i.add(a), function() {
				i.remove();
			};
		}, [a && o]);
	};
}, styleSingleton = function() {
	var i = styleHookSingleton();
	return function(a) {
		var o = a.styles, s = a.dynamic;
		return i(o, s), null;
	};
}, zeroGap = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, parse = function(i) {
	return parseInt(i || "", 10) || 0;
}, getOffset = function(i) {
	var a = window.getComputedStyle(document.body), o = a[i === "padding" ? "paddingLeft" : "marginLeft"], s = a[i === "padding" ? "paddingTop" : "marginTop"], c = a[i === "padding" ? "paddingRight" : "marginRight"];
	return [
		parse(o),
		parse(s),
		parse(c)
	];
}, getGapWidth = function(i) {
	if (i === void 0 && (i = "margin"), typeof window > "u") return zeroGap;
	var a = getOffset(i), o = document.documentElement.clientWidth, s = window.innerWidth;
	return {
		left: a[0],
		top: a[1],
		right: a[2],
		gap: Math.max(0, s - o + a[2] - a[0])
	};
}, Style = styleSingleton(), lockAttribute = "data-scroll-locked", getStyles = function(i, a, o, s) {
	var c = i.left, l = i.top, u = i.right, d = i.gap;
	return o === void 0 && (o = "margin"), `
  .${noScrollbarsClassName} {
   overflow: hidden ${s};
   padding-right: ${d}px ${s};
  }
  body[${lockAttribute}] {
    overflow: hidden ${s};
    overscroll-behavior: contain;
    ${[
		a && `position: relative ${s};`,
		o === "margin" && `
    padding-left: ${c}px;
    padding-top: ${l}px;
    padding-right: ${u}px;
    margin-left:0;
    margin-top:0;
    margin-right: ${d}px ${s};
    `,
		o === "padding" && `padding-right: ${d}px ${s};`
	].filter(Boolean).join("")}
  }
  
  .${zeroRightClassName} {
    right: ${d}px ${s};
  }
  
  .${fullWidthClassName} {
    margin-right: ${d}px ${s};
  }
  
  .${zeroRightClassName} .${zeroRightClassName} {
    right: 0 ${s};
  }
  
  .${fullWidthClassName} .${fullWidthClassName} {
    margin-right: 0 ${s};
  }
  
  body[${lockAttribute}] {
    ${removedBarSizeVariable}: ${d}px;
  }
`;
}, getCurrentUseCounter = function() {
	var i = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(i) ? i : 0;
}, useLockAttribute = function() {
	React$1.useEffect(function() {
		return document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString()), function() {
			var i = getCurrentUseCounter() - 1;
			i <= 0 ? document.body.removeAttribute(lockAttribute) : document.body.setAttribute(lockAttribute, i.toString());
		};
	}, []);
}, RemoveScrollBar = function(i) {
	var a = i.noRelative, o = i.noImportant, s = i.gapMode, c = s === void 0 ? "margin" : s;
	useLockAttribute();
	var l = React$1.useMemo(function() {
		return getGapWidth(c);
	}, [c]);
	return React$1.createElement(Style, { styles: getStyles(l, !a, c, o ? "" : "!important") });
}, passiveSupported = !1;
if (typeof window < "u") try {
	var options = Object.defineProperty({}, "passive", { get: function() {
		return passiveSupported = !0, !0;
	} });
	window.addEventListener("test", options, options), window.removeEventListener("test", options, options);
} catch {
	passiveSupported = !1;
}
var nonPassive = passiveSupported ? { passive: !1 } : !1, alwaysContainsScroll = function(i) {
	return i.tagName === "TEXTAREA";
}, elementCanBeScrolled = function(i, a) {
	if (!(i instanceof Element)) return !1;
	var o = window.getComputedStyle(i);
	return o[a] !== "hidden" && !(o.overflowY === o.overflowX && !alwaysContainsScroll(i) && o[a] === "visible");
}, elementCouldBeVScrolled = function(i) {
	return elementCanBeScrolled(i, "overflowY");
}, elementCouldBeHScrolled = function(i) {
	return elementCanBeScrolled(i, "overflowX");
}, locationCouldBeScrolled = function(i, a) {
	var o = a.ownerDocument, s = a;
	do {
		if (typeof ShadowRoot < "u" && s instanceof ShadowRoot && (s = s.host), elementCouldBeScrolled(i, s)) {
			var c = getScrollVariables(i, s);
			if (c[1] > c[2]) return !0;
		}
		s = s.parentNode;
	} while (s && s !== o.body);
	return !1;
}, getVScrollVariables = function(i) {
	return [
		i.scrollTop,
		i.scrollHeight,
		i.clientHeight
	];
}, getHScrollVariables = function(i) {
	return [
		i.scrollLeft,
		i.scrollWidth,
		i.clientWidth
	];
}, elementCouldBeScrolled = function(i, a) {
	return i === "v" ? elementCouldBeVScrolled(a) : elementCouldBeHScrolled(a);
}, getScrollVariables = function(i, a) {
	return i === "v" ? getVScrollVariables(a) : getHScrollVariables(a);
}, getDirectionFactor = function(i, a) {
	return i === "h" && a === "rtl" ? -1 : 1;
}, handleScroll = function(i, a, o, s, c) {
	var l = getDirectionFactor(i, window.getComputedStyle(a).direction), u = l * s, d = o.target, f = a.contains(d), p = !1, m = u > 0, h = 0, g = 0;
	do {
		if (!d) break;
		var _ = getScrollVariables(i, d), v = _[0], y = _[1] - _[2] - l * v;
		(v || y) && elementCouldBeScrolled(i, d) && (h += y, g += v);
		var b = d.parentNode;
		d = b && b.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? b.host : b;
	} while (!f && d !== document.body || f && (a.contains(d) || a === d));
	return (m && (c && Math.abs(h) < 1 || !c && u > h) || !m && (c && Math.abs(g) < 1 || !c && -u > g)) && (p = !0), p;
}, getTouchXY = function(i) {
	return "changedTouches" in i ? [i.changedTouches[0].clientX, i.changedTouches[0].clientY] : [0, 0];
}, getDeltaXY = function(i) {
	return [i.deltaX, i.deltaY];
}, extractRef = function(i) {
	return i && "current" in i ? i.current : i;
}, deltaCompare = function(i, a) {
	return i[0] === a[0] && i[1] === a[1];
}, generateStyle = function(i) {
	return `
  .block-interactivity-${i} {pointer-events: none;}
  .allow-interactivity-${i} {pointer-events: all;}
`;
}, idCounter = 0, lockStack = [];
function RemoveScrollSideCar(i) {
	var a = React$1.useRef([]), o = React$1.useRef([0, 0]), s = React$1.useRef(), c = React$1.useState(idCounter++)[0], l = React$1.useState(styleSingleton)[0], u = React$1.useRef(i);
	React$1.useEffect(function() {
		u.current = i;
	}, [i]), React$1.useEffect(function() {
		if (i.inert) {
			document.body.classList.add(`block-interactivity-${c}`);
			var a = __spreadArray([i.lockRef.current], (i.shards || []).map(extractRef), !0).filter(Boolean);
			return a.forEach(function(i) {
				return i.classList.add(`allow-interactivity-${c}`);
			}), function() {
				document.body.classList.remove(`block-interactivity-${c}`), a.forEach(function(i) {
					return i.classList.remove(`allow-interactivity-${c}`);
				});
			};
		}
	}, [
		i.inert,
		i.lockRef.current,
		i.shards
	]);
	var d = React$1.useCallback(function(i, a) {
		if ("touches" in i && i.touches.length === 2 || i.type === "wheel" && i.ctrlKey) return !u.current.allowPinchZoom;
		var c = getTouchXY(i), l = o.current, d = "deltaX" in i ? i.deltaX : l[0] - c[0], f = "deltaY" in i ? i.deltaY : l[1] - c[1], p, m = i.target, h = Math.abs(d) > Math.abs(f) ? "h" : "v";
		if ("touches" in i && h === "h" && m.type === "range") return !1;
		var g = window.getSelection(), _ = g && g.anchorNode;
		if (_ && (_ === m || _.contains(m))) return !1;
		var v = locationCouldBeScrolled(h, m);
		if (!v) return !0;
		if (v ? p = h : (p = h === "v" ? "h" : "v", v = locationCouldBeScrolled(h, m)), !v) return !1;
		if (!s.current && "changedTouches" in i && (d || f) && (s.current = p), !p) return !0;
		var y = s.current || p;
		return handleScroll(y, a, i, y === "h" ? d : f, !0);
	}, []), f = React$1.useCallback(function(i) {
		var o = i;
		if (!(!lockStack.length || lockStack[lockStack.length - 1] !== l)) {
			var s = "deltaY" in o ? getDeltaXY(o) : getTouchXY(o), c = a.current.filter(function(i) {
				return i.name === o.type && (i.target === o.target || o.target === i.shadowParent) && deltaCompare(i.delta, s);
			})[0];
			if (c && c.should) {
				o.cancelable && o.preventDefault();
				return;
			}
			if (!c) {
				var f = (u.current.shards || []).map(extractRef).filter(Boolean).filter(function(i) {
					return i.contains(o.target);
				});
				(f.length > 0 ? d(o, f[0]) : !u.current.noIsolation) && o.cancelable && o.preventDefault();
			}
		}
	}, []), p = React$1.useCallback(function(i, o, s, c) {
		var l = {
			name: i,
			delta: o,
			target: s,
			should: c,
			shadowParent: getOutermostShadowParent(s)
		};
		a.current.push(l), setTimeout(function() {
			a.current = a.current.filter(function(i) {
				return i !== l;
			});
		}, 1);
	}, []), m = React$1.useCallback(function(i) {
		o.current = getTouchXY(i), s.current = void 0;
	}, []), h = React$1.useCallback(function(a) {
		p(a.type, getDeltaXY(a), a.target, d(a, i.lockRef.current));
	}, []), g = React$1.useCallback(function(a) {
		p(a.type, getTouchXY(a), a.target, d(a, i.lockRef.current));
	}, []);
	React$1.useEffect(function() {
		return lockStack.push(l), i.setCallbacks({
			onScrollCapture: h,
			onWheelCapture: h,
			onTouchMoveCapture: g
		}), document.addEventListener("wheel", f, nonPassive), document.addEventListener("touchmove", f, nonPassive), document.addEventListener("touchstart", m, nonPassive), function() {
			lockStack = lockStack.filter(function(i) {
				return i !== l;
			}), document.removeEventListener("wheel", f, nonPassive), document.removeEventListener("touchmove", f, nonPassive), document.removeEventListener("touchstart", m, nonPassive);
		};
	}, []);
	var v = i.removeScrollBar, y = i.inert;
	return React$1.createElement(React$1.Fragment, null, y ? React$1.createElement(l, { styles: generateStyle(c) }) : null, v ? React$1.createElement(RemoveScrollBar, {
		noRelative: i.noRelative,
		gapMode: i.gapMode
	}) : null);
}
function getOutermostShadowParent(i) {
	for (var a = null; i !== null;) i instanceof ShadowRoot && (a = i.host, i = i.host), i = i.parentNode;
	return a;
}
var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar), ReactRemoveScroll = React$1.forwardRef(function(i, a) {
	return React$1.createElement(RemoveScroll, __assign({}, i, {
		ref: a,
		sideCar: sidecar_default
	}));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
var Combination_default = ReactRemoveScroll, POPOVER_NAME = "Popover", [createPopoverContext, createPopoverScope] = createContextScope(POPOVER_NAME, [createPopperScope]), usePopperScope$1 = createPopperScope(), [PopoverProvider, usePopoverContext] = createPopoverContext(POPOVER_NAME), Popover$1 = (i) => {
	let { __scopePopover: a, children: o, open: s, defaultOpen: c, onOpenChange: l, modal: u = !1 } = i, d = usePopperScope$1(a), f = React$1.useRef(null), [p, m] = React$1.useState(!1), [h, g] = useControllableState({
		prop: s,
		defaultProp: c ?? !1,
		onChange: l,
		caller: POPOVER_NAME
	});
	return /* @__PURE__ */ jsx(Root2$2, {
		...d,
		children: /* @__PURE__ */ jsx(PopoverProvider, {
			scope: a,
			contentId: useId$1(),
			triggerRef: f,
			open: h,
			onOpenChange: g,
			onOpenToggle: React$1.useCallback(() => g((i) => !i), [g]),
			hasCustomAnchor: p,
			onCustomAnchorAdd: React$1.useCallback(() => m(!0), []),
			onCustomAnchorRemove: React$1.useCallback(() => m(!1), []),
			modal: u,
			children: o
		})
	});
};
Popover$1.displayName = POPOVER_NAME;
var ANCHOR_NAME = "PopoverAnchor", PopoverAnchor = React$1.forwardRef((i, a) => {
	let { __scopePopover: o, ...s } = i, c = usePopoverContext(ANCHOR_NAME, o), l = usePopperScope$1(o), { onCustomAnchorAdd: u, onCustomAnchorRemove: d } = c;
	return React$1.useEffect(() => (u(), () => d()), [u, d]), /* @__PURE__ */ jsx(Anchor, {
		...l,
		...s,
		ref: a
	});
});
PopoverAnchor.displayName = ANCHOR_NAME;
var TRIGGER_NAME$2 = "PopoverTrigger", PopoverTrigger$1 = React$1.forwardRef((i, a) => {
	let { __scopePopover: o, ...s } = i, c = usePopoverContext(TRIGGER_NAME$2, o), l = usePopperScope$1(o), u = useComposedRefs(a, c.triggerRef), d = /* @__PURE__ */ jsx(Primitive.button, {
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": c.open,
		"aria-controls": c.contentId,
		"data-state": getState$1(c.open),
		...s,
		ref: u,
		onClick: composeEventHandlers(i.onClick, c.onOpenToggle)
	});
	return c.hasCustomAnchor ? d : /* @__PURE__ */ jsx(Anchor, {
		asChild: !0,
		...l,
		children: d
	});
});
PopoverTrigger$1.displayName = TRIGGER_NAME$2;
var PORTAL_NAME$2 = "PopoverPortal", [PortalProvider$1, usePortalContext$1] = createPopoverContext(PORTAL_NAME$2, { forceMount: void 0 }), PopoverPortal = (i) => {
	let { __scopePopover: a, forceMount: o, children: s, container: c } = i, l = usePopoverContext(PORTAL_NAME$2, a);
	return /* @__PURE__ */ jsx(PortalProvider$1, {
		scope: a,
		forceMount: o,
		children: /* @__PURE__ */ jsx(Presence, {
			present: o || l.open,
			children: /* @__PURE__ */ jsx(Portal, {
				asChild: !0,
				container: c,
				children: s
			})
		})
	});
};
PopoverPortal.displayName = PORTAL_NAME$2;
var CONTENT_NAME$2 = "PopoverContent", PopoverContent$1 = React$1.forwardRef((i, a) => {
	let o = usePortalContext$1(CONTENT_NAME$2, i.__scopePopover), { forceMount: s = o.forceMount, ...c } = i, l = usePopoverContext(CONTENT_NAME$2, i.__scopePopover);
	return /* @__PURE__ */ jsx(Presence, {
		present: s || l.open,
		children: l.modal ? /* @__PURE__ */ jsx(PopoverContentModal, {
			...c,
			ref: a
		}) : /* @__PURE__ */ jsx(PopoverContentNonModal, {
			...c,
			ref: a
		})
	});
});
PopoverContent$1.displayName = CONTENT_NAME$2;
var Slot$2 = /* @__PURE__ */ createSlot$3("PopoverContent.RemoveScroll"), PopoverContentModal = React$1.forwardRef((i, a) => {
	let o = usePopoverContext(CONTENT_NAME$2, i.__scopePopover), s = React$1.useRef(null), c = useComposedRefs(a, s), l = React$1.useRef(!1);
	return React$1.useEffect(() => {
		let i = s.current;
		if (i) return hideOthers(i);
	}, []), /* @__PURE__ */ jsx(Combination_default, {
		as: Slot$2,
		allowPinchZoom: !0,
		children: /* @__PURE__ */ jsx(PopoverContentImpl, {
			...i,
			ref: c,
			trapFocus: o.open,
			disableOutsidePointerEvents: !0,
			onCloseAutoFocus: composeEventHandlers(i.onCloseAutoFocus, (i) => {
				i.preventDefault(), l.current || o.triggerRef.current?.focus();
			}),
			onPointerDownOutside: composeEventHandlers(i.onPointerDownOutside, (i) => {
				let a = i.detail.originalEvent, o = a.button === 0 && a.ctrlKey === !0;
				l.current = a.button === 2 || o;
			}, { checkForDefaultPrevented: !1 }),
			onFocusOutside: composeEventHandlers(i.onFocusOutside, (i) => i.preventDefault(), { checkForDefaultPrevented: !1 })
		})
	});
}), PopoverContentNonModal = React$1.forwardRef((i, a) => {
	let o = usePopoverContext(CONTENT_NAME$2, i.__scopePopover), s = React$1.useRef(!1), c = React$1.useRef(!1);
	return /* @__PURE__ */ jsx(PopoverContentImpl, {
		...i,
		ref: a,
		trapFocus: !1,
		disableOutsidePointerEvents: !1,
		onCloseAutoFocus: (a) => {
			i.onCloseAutoFocus?.(a), a.defaultPrevented || (s.current || o.triggerRef.current?.focus(), a.preventDefault()), s.current = !1, c.current = !1;
		},
		onInteractOutside: (a) => {
			i.onInteractOutside?.(a), a.defaultPrevented || (s.current = !0, a.detail.originalEvent.type === "pointerdown" && (c.current = !0));
			let l = a.target;
			o.triggerRef.current?.contains(l) && a.preventDefault(), a.detail.originalEvent.type === "focusin" && c.current && a.preventDefault();
		}
	});
}), PopoverContentImpl = React$1.forwardRef((i, a) => {
	let { __scopePopover: o, trapFocus: s, onOpenAutoFocus: c, onCloseAutoFocus: l, disableOutsidePointerEvents: u, onEscapeKeyDown: d, onPointerDownOutside: f, onFocusOutside: p, onInteractOutside: m, ...h } = i, g = usePopoverContext(CONTENT_NAME$2, o), _ = usePopperScope$1(o);
	return useFocusGuards(), /* @__PURE__ */ jsx(FocusScope, {
		asChild: !0,
		loop: !0,
		trapped: s,
		onMountAutoFocus: c,
		onUnmountAutoFocus: l,
		children: /* @__PURE__ */ jsx(DismissableLayer, {
			asChild: !0,
			disableOutsidePointerEvents: u,
			onInteractOutside: m,
			onEscapeKeyDown: d,
			onPointerDownOutside: f,
			onFocusOutside: p,
			onDismiss: () => g.onOpenChange(!1),
			children: /* @__PURE__ */ jsx(Content$1, {
				"data-state": getState$1(g.open),
				role: "dialog",
				id: g.contentId,
				..._,
				...h,
				ref: a,
				style: {
					...h.style,
					"--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
					"--radix-popover-content-available-width": "var(--radix-popper-available-width)",
					"--radix-popover-content-available-height": "var(--radix-popper-available-height)",
					"--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
					"--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
				}
			})
		})
	});
}), CLOSE_NAME$1 = "PopoverClose", PopoverClose = React$1.forwardRef((i, a) => {
	let { __scopePopover: o, ...s } = i, c = usePopoverContext(CLOSE_NAME$1, o);
	return /* @__PURE__ */ jsx(Primitive.button, {
		type: "button",
		...s,
		ref: a,
		onClick: composeEventHandlers(i.onClick, () => c.onOpenChange(!1))
	});
});
PopoverClose.displayName = CLOSE_NAME$1;
var ARROW_NAME$1 = "PopoverArrow", PopoverArrow = React$1.forwardRef((i, a) => {
	let { __scopePopover: o, ...s } = i;
	return /* @__PURE__ */ jsx(Arrow, {
		...usePopperScope$1(o),
		...s,
		ref: a
	});
});
PopoverArrow.displayName = ARROW_NAME$1;
function getState$1(i) {
	return i ? "open" : "closed";
}
var Root2$1 = Popover$1, Trigger$2 = PopoverTrigger$1, Portal$3 = PopoverPortal, Content2$1 = PopoverContent$1;
function Popover({ ...i }) {
	return /* @__PURE__ */ jsx(Root2$1, {
		"data-slot": "popover",
		...i
	});
}
function PopoverTrigger({ ...i }) {
	return /* @__PURE__ */ jsx(Trigger$2, {
		"data-slot": "popover-trigger",
		...i
	});
}
function PopoverContent({ className: i, align: a = "center", sideOffset: o = 4, ...s }) {
	return /* @__PURE__ */ jsx(Portal$3, { children: /* @__PURE__ */ jsx(Content2$1, {
		"data-slot": "popover-content",
		align: a,
		sideOffset: o,
		className: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", i),
		...s
	}) });
}
function JsonChip({ content: i, className: a }) {
	let o = null, s = !1;
	if (typeof i == "string") try {
		o = JSON.parse(i), typeof o == "object" && o && (s = !0);
	} catch {}
	else typeof i == "object" && i && (o = i, s = !0);
	if (!s) return /* @__PURE__ */ jsx("code", {
		className: cn("rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", a),
		children: typeof i == "string" ? i : JSON.stringify(i)
	});
	let c = Array.isArray(o) ? `Array [${o.length}]` : "Data", l = JSON.stringify(o, null, 2);
	return /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
		asChild: !0,
		children: /* @__PURE__ */ jsxs("button", {
			className: cn("inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer select-none", a),
			children: [/* @__PURE__ */ jsx(Braces, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", {
				className: "truncate max-w-[200px]",
				children: c
			})]
		})
	}), /* @__PURE__ */ jsxs(PopoverContent, {
		className: "w-[500px] max-w-[90vw] p-0",
		align: "start",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between border-b px-3 py-2 bg-muted/30",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 text-sm font-medium text-muted-foreground",
				children: [/* @__PURE__ */ jsx(Braces, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", { children: "Data Viewer" })]
			}), /* @__PURE__ */ jsx(CopyButton, {
				content: l,
				copyMessage: "Copied JSON"
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "max-h-[500px] overflow-auto p-4 bg-background",
			children: /* @__PURE__ */ jsx("pre", {
				className: "text-xs font-mono whitespace-pre-wrap break-words text-foreground",
				children: l
			})
		})]
	})] });
}
function MarkdownRenderer({ children: i }) {
	return /* @__PURE__ */ jsx("div", {
		className: "space-y-3",
		children: /* @__PURE__ */ jsx(Markdown, {
			remarkPlugins: [remarkGfm],
			components: COMPONENTS,
			children: i
		})
	});
}
var HighlightedPre = React.memo(async ({ children: i, language: a, ...o }) => {
	let { codeToTokens: s, bundledLanguages: c } = await import("./dist-wSNuTeVv.js");
	if (!(a in c)) return /* @__PURE__ */ jsx("pre", {
		...o,
		children: i
	});
	let { tokens: l } = await s(i, {
		lang: a,
		defaultColor: !1,
		themes: {
			light: "github-light",
			dark: "github-dark"
		}
	});
	return /* @__PURE__ */ jsx("pre", {
		...o,
		children: /* @__PURE__ */ jsx("code", { children: l.map((i, a) => /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", { children: i.map((i, a) => /* @__PURE__ */ jsx("span", {
			className: "text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg",
			style: typeof i.htmlStyle == "string" ? void 0 : i.htmlStyle,
			children: i.content
		}, a)) }, a), a !== l.length - 1 && "\n"] })) })
	});
});
HighlightedPre.displayName = "HighlightedCode";
var CodeBlock = ({ children: i, className: a, language: o, ...s }) => {
	let c = typeof i == "string" ? i : childrenTakeAllStringContents(i), l = cn("overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]", a);
	return /* @__PURE__ */ jsxs("div", {
		className: "group/code relative mb-4",
		children: [/* @__PURE__ */ jsx(Suspense, {
			fallback: /* @__PURE__ */ jsx("pre", {
				className: l,
				...s,
				children: i
			}),
			children: /* @__PURE__ */ jsx(HighlightedPre, {
				language: o,
				className: l,
				children: c
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100",
			children: /* @__PURE__ */ jsx(CopyButton, {
				content: c,
				copyMessage: "Copied code to clipboard"
			})
		})]
	});
};
function childrenTakeAllStringContents(i) {
	if (typeof i == "string") return i;
	if (i?.props?.children) {
		let a = i.props.children;
		return Array.isArray(a) ? a.map((i) => childrenTakeAllStringContents(i)).join("") : childrenTakeAllStringContents(a);
	}
	return "";
}
var COMPONENTS = {
	h1: withClass("h1", "text-2xl font-semibold"),
	h2: withClass("h2", "font-semibold text-xl"),
	h3: withClass("h3", "font-semibold text-lg"),
	h4: withClass("h4", "font-semibold text-base"),
	h5: withClass("h5", "font-medium"),
	strong: withClass("strong", "font-semibold"),
	a: withClass("a", "text-primary underline underline-offset-2"),
	blockquote: withClass("blockquote", "border-l-2 border-primary pl-4"),
	code: ({ children: i, className: a, node: o, ...s }) => {
		let c = /language-(\w+)/.exec(a || ""), l = c ? c[1] : void 0, u = String(i).replace(/\n$/, ""), d = l === "json";
		if (!d) try {
			let i = JSON.parse(u);
			typeof i == "object" && i && (d = !0);
		} catch {}
		return d ? /* @__PURE__ */ jsx(JsonChip, { content: u }) : c ? /* @__PURE__ */ jsx(CodeBlock, {
			className: a,
			language: c[1],
			...s,
			children: i
		}) : /* @__PURE__ */ jsx("code", {
			className: cn("font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5"),
			...s,
			children: i
		});
	},
	pre: ({ children: i }) => i,
	ol: withClass("ol", "list-decimal space-y-2 pl-6"),
	ul: withClass("ul", "list-disc space-y-2 pl-6"),
	li: withClass("li", "my-1.5"),
	table: withClass("table", "w-full border-collapse overflow-y-auto rounded-md border border-foreground/20"),
	th: withClass("th", "border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"),
	td: withClass("td", "border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"),
	tr: withClass("tr", "m-0 border-t p-0 even:bg-muted"),
	p: ({ children: i, className: a, ...o }) => {
		let s = childrenTakeAllStringContents(i).trim();
		if (s.startsWith("{") && s.endsWith("}") || s.startsWith("[") && s.endsWith("]")) try {
			let i = JSON.parse(s);
			if (typeof i == "object" && i) return /* @__PURE__ */ jsx("div", {
				className: "my-2",
				children: /* @__PURE__ */ jsx(JsonChip, { content: s })
			});
		} catch {}
		return /* @__PURE__ */ jsx("p", {
			className: cn("whitespace-pre-wrap", a),
			...o,
			children: i
		});
	},
	hr: withClass("hr", "border-foreground/20")
};
function withClass(i, a) {
	let o = ({ node: o, ...s }) => /* @__PURE__ */ jsx(i, {
		className: a,
		...s
	});
	return o.displayName = i, o;
}
var chatBubbleVariants = cva("group/message relative break-words rounded-2xl p-4 text-sm sm:max-w-[85%] transition-all duration-300", {
	variants: {
		variant: {
			user: "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
			assistant: "bg-card/80 backdrop-blur-md text-card-foreground rounded-tl-none border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20",
			tool: "bg-muted/50 text-muted-foreground rounded-xl border border-border/40 font-mono text-[11px] max-w-full",
			subagent: "bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-indigo-950/40 dark:to-blue-950/40 text-indigo-900 dark:text-indigo-100 rounded-tl-none border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm"
		},
		animation: {
			none: "",
			slide: "duration-500 animate-in fade-in-0 slide-in-from-bottom-2",
			scale: "duration-300 animate-in fade-in-0 zoom-in-95",
			fade: "duration-500 animate-in fade-in-0"
		}
	},
	compoundVariants: [
		{
			variant: "user",
			animation: "slide",
			class: "slide-in-from-right-4"
		},
		{
			variant: "assistant",
			animation: "slide",
			class: "slide-in-from-left-4"
		},
		{
			variant: "tool",
			animation: "slide",
			class: "slide-in-from-left-4"
		},
		{
			variant: "subagent",
			animation: "slide",
			class: "slide-in-from-left-4"
		},
		{
			variant: "user",
			animation: "scale",
			class: "origin-bottom-right"
		},
		{
			variant: "assistant",
			animation: "scale",
			class: "origin-bottom-left"
		},
		{
			variant: "tool",
			animation: "scale",
			class: "origin-bottom-left"
		},
		{
			variant: "subagent",
			animation: "scale",
			class: "origin-bottom-left"
		}
	]
});
const ChatMessage = ({ role: i, content: a, createdAt: o, showTimeStamp: s = !1, animation: c = "scale", actions: l, name: u, experimental_attachments: d, toolInvocations: f, parts: p }) => {
	let m = useMemo(() => d?.map((i) => {
		let a = dataUrlToUint8Array(i.url);
		return new File([a], i.name ?? "Unknown", { type: i.contentType });
	}), [d]), h = i === "user", g = i === "user" ? "user" : i === "tool" ? "tool" : i === "subagent" || u && u.startsWith("sub-agent-") ? "subagent" : "assistant", _ = o?.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit"
	}), v = ({ children: i, className: a }) => /* @__PURE__ */ jsx("div", {
		className: cn("flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm", a),
		children: i
	});
	return !a && !f && (!p || p.length === 0) ? null : /* @__PURE__ */ jsxs("div", {
		className: cn("flex w-full gap-3 mb-6", h ? "flex-row-reverse" : "flex-row"),
		children: [(() => g === "user" ? null : g === "assistant" ? /* @__PURE__ */ jsx(v, {
			className: "bg-gradient-to-tr from-primary to-primary/80 border-primary/20 text-primary-foreground",
			children: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" })
		}) : g === "subagent" ? /* @__PURE__ */ jsx(v, {
			className: "bg-gradient-to-tr from-indigo-500 to-blue-500 border-indigo-400/20 text-white",
			children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4" })
		}) : null)(), /* @__PURE__ */ jsxs("div", {
			className: cn("flex flex-col gap-1.5", h ? "items-end max-w-[85%]" : "items-start max-w-[85%]"),
			children: [
				h && m && m.length > 0 && /* @__PURE__ */ jsx("div", {
					className: "mb-1 flex flex-wrap gap-2 justify-end",
					children: m.map((i, a) => /* @__PURE__ */ jsx(FilePreview, { file: i }, a))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: cn(chatBubbleVariants({
						variant: g,
						animation: c
					})),
					children: [p && p.length > 0 ? p.map((i, a) => i.type === "text" ? /* @__PURE__ */ jsx(ExpandableMarkdown, {
						variant: g,
						children: i.text
					}, a) : i.type === "reasoning" ? /* @__PURE__ */ jsx(ReasoningBlock, { part: i }, a) : i.type === "tool-invocation" ? /* @__PURE__ */ jsx(ToolCall, { toolInvocations: [i.toolInvocation] }, a) : null) : f && f.length > 0 ? /* @__PURE__ */ jsx(ToolCall, { toolInvocations: f }) : /* @__PURE__ */ jsx(ExpandableMarkdown, {
						variant: g,
						children: a
					}), l && /* @__PURE__ */ jsx("div", {
						className: "absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background/80 backdrop-blur-sm p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-md",
						children: l
					})]
				}),
				s && o && /* @__PURE__ */ jsx("time", {
					dateTime: o.toISOString(),
					className: cn("px-1 text-[10px] font-medium text-muted-foreground/50", c !== "none" && "duration-500 animate-in fade-in-0"),
					children: _
				})
			]
		})]
	});
};
var ExpandableMarkdown = ({ children: i, threshold: a = 1e3, variant: o }) => {
	let [s, c] = useState(!1), l = i.length > a, u = cn("mt-2 self-start text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer", o === "user" ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary hover:text-primary/80");
	return !l || s ? /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col",
		children: [/* @__PURE__ */ jsx(MarkdownRenderer, { children: i }), l && /* @__PURE__ */ jsx("button", {
			onClick: () => c(!1),
			className: u,
			children: "Show less"
		})]
	}) : /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col",
		children: [/* @__PURE__ */ jsx(MarkdownRenderer, { children: i.slice(0, a) + "..." }), /* @__PURE__ */ jsx("button", {
			onClick: () => c(!0),
			className: u,
			children: "Read more"
		})]
	});
};
function dataUrlToUint8Array(i) {
	let a = i.split(",")[1], o = atob(a), s = o.length, c = new Uint8Array(s);
	for (let i = 0; i < s; i++) c[i] = o.charCodeAt(i);
	return c;
}
var ReasoningBlock = ({ part: i }) => {
	let [a, o] = useState(!1);
	return /* @__PURE__ */ jsx("div", {
		className: "mb-2 flex flex-col items-start sm:max-w-[70%]",
		children: /* @__PURE__ */ jsxs(Collapsible, {
			open: a,
			onOpenChange: o,
			className: "group w-full overflow-hidden rounded-lg border bg-muted/50",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex items-center p-2",
				children: /* @__PURE__ */ jsx(CollapsibleTrigger, {
					asChild: !0,
					children: /* @__PURE__ */ jsxs("button", {
						className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
						children: [/* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 transition-transform group-data-[state=open]:rotate-90" }), /* @__PURE__ */ jsx("span", { children: "Thinking" })]
					})
				})
			}), /* @__PURE__ */ jsx(CollapsibleContent, {
				forceMount: !0,
				children: /* @__PURE__ */ jsx(motion.div, {
					initial: !1,
					animate: a ? "open" : "closed",
					variants: {
						open: {
							height: "auto",
							opacity: 1
						},
						closed: {
							height: 0,
							opacity: 0
						}
					},
					transition: {
						duration: .3,
						ease: [
							.04,
							.62,
							.23,
							.98
						]
					},
					className: "border-t",
					children: /* @__PURE__ */ jsx("div", {
						className: "p-2",
						children: /* @__PURE__ */ jsx("div", {
							className: "whitespace-pre-wrap text-xs",
							children: i.reasoning
						})
					})
				})
			})]
		})
	});
};
function ToolCall({ toolInvocations: i }) {
	return i?.length ? /* @__PURE__ */ jsx("div", {
		className: "flex flex-col items-start gap-2",
		children: i.map((i, a) => {
			if (i.state === "result" && i.result.__cancelled === !0) return /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }), /* @__PURE__ */ jsxs("span", { children: [
					"Cancelled",
					" ",
					/* @__PURE__ */ jsxs("span", {
						className: "font-mono",
						children: [
							"`",
							i.toolName,
							"`"
						]
					})
				] })]
			}, a);
			switch (i.state) {
				case "partial-call":
				case "call": return /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ jsx(Terminal, { className: "h-4 w-4" }),
						/* @__PURE__ */ jsxs("span", { children: [
							"Calling",
							" ",
							/* @__PURE__ */ jsxs("span", {
								className: "font-mono",
								children: [
									"`",
									i.toolName,
									"`"
								]
							}),
							"..."
						] }),
						/* @__PURE__ */ jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" })
					]
				}, a);
				case "result": return /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-muted-foreground",
						children: [/* @__PURE__ */ jsx(CodeXml, { className: "h-4 w-4" }), /* @__PURE__ */ jsxs("span", { children: [
							"Result from",
							" ",
							/* @__PURE__ */ jsxs("span", {
								className: "font-mono",
								children: [
									"`",
									i.toolName,
									"`"
								]
							})
						] })]
					}), /* @__PURE__ */ jsx(JsonChip, { content: i.result })]
				}, a);
				default: return null;
			}
		})
	}) : null;
}
function TypingIndicator() {
	return /* @__PURE__ */ jsx("div", {
		className: "justify-left flex space-x-1",
		children: /* @__PURE__ */ jsx("div", {
			className: "rounded-lg bg-muted p-3",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex -space-x-2.5",
				children: [
					/* @__PURE__ */ jsx(Dot, { className: "h-5 w-5 animate-typing-dot-bounce" }),
					/* @__PURE__ */ jsx(Dot, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:90ms]" }),
					/* @__PURE__ */ jsx(Dot, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:180ms]" })
				]
			})
		})
	});
}
function MessageList({ messages: i, showTimeStamps: a = !0, isTyping: o = !1, messageOptions: s }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4 overflow-visible",
		children: [i.map((i, o) => {
			let c = typeof s == "function" ? s(i) : s;
			return /* @__PURE__ */ jsx(ChatMessage, {
				showTimeStamp: a,
				...i,
				...c
			}, o);
		}), o && /* @__PURE__ */ jsx(TypingIndicator, {})]
	});
}
var ICONS = [
	MessageSquare,
	Sparkles,
	Search,
	CircleQuestionMark
];
function PromptSuggestions({ label: i, append: a, suggestions: o }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col items-center justify-center space-y-12 px-4 py-20 animate-in fade-in zoom-in-95 duration-700",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "space-y-6 text-center max-w-2xl",
			children: [/* @__PURE__ */ jsx("div", {
				className: "mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent shadow-inner mb-8 ring-1 ring-primary/20",
				children: /* @__PURE__ */ jsx(Sparkles, { className: "h-10 w-10 text-primary animate-pulse" })
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "text-4xl font-black tracking-tight sm:text-6xl bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent",
					children: i || "How can I help you today?"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-lg text-muted-foreground/80 leading-relaxed max-w-lg mx-auto",
					children: "Experience the power of our specialized RCM agents. Choose a task below to get started immediately."
				})]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:mx-auto",
			children: o.map((i, o) => {
				let s = ICONS[o % ICONS.length];
				return /* @__PURE__ */ jsxs("button", {
					onClick: () => a({
						role: "user",
						content: i
					}),
					className: cn("group relative flex flex-row items-center gap-5 rounded-2xl border bg-card/40 p-6 text-left transition-all duration-500 backdrop-blur-sm", "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/60", "border-border/40 active:scale-[0.98] overflow-hidden"),
					children: [
						/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
						/* @__PURE__ */ jsx("div", {
							className: "relative flex flex-shrink-0 h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-lg",
							children: /* @__PURE__ */ jsx(s, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "relative flex-1 space-y-1.5",
							children: [/* @__PURE__ */ jsx("p", {
								className: "font-bold text-[17px] text-foreground group-hover:text-primary transition-colors leading-tight",
								children: i
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5",
								children: ["Click to start this task ", /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" })]
							})]
						})
					]
				}, i);
			})
		})]
	});
}
function Chat({ messages: i, handleSubmit: a, input: o, handleInputChange: s, stop: c, isGenerating: l, append: u, suggestions: d, className: f, onRateResponse: p, setMessages: m, transcribeAudio: h, placeholder: g }) {
	let _ = i.at(-1), v = i.length === 0, y = _?.role === "user", b = useRef(i);
	b.current = i;
	let x = useCallback(() => {
		if (c?.(), !m) return;
		let i = [...b.current], a = i.findLast((i) => i.role === "assistant");
		if (!a) return;
		let o = !1, s = { ...a };
		if (a.toolInvocations) {
			let i = a.toolInvocations.map((i) => i.state === "call" ? (o = !0, {
				...i,
				state: "result",
				result: {
					content: "Tool execution was cancelled",
					__cancelled: !0
				}
			}) : i);
			o && (s = {
				...s,
				toolInvocations: i
			});
		}
		if (a.parts && a.parts.length > 0) {
			let i = a.parts.map((i) => i.type === "tool-invocation" && i.toolInvocation && i.toolInvocation.state === "call" ? (o = !0, {
				...i,
				toolInvocation: {
					...i.toolInvocation,
					state: "result",
					result: {
						content: "Tool execution was cancelled",
						__cancelled: !0
					}
				}
			}) : i);
			o && (s = {
				...s,
				parts: i
			});
		}
		if (o) {
			let o = i.findIndex((i) => i.id === a.id);
			o !== -1 && (i[o] = s, m(i));
		}
	}, [
		c,
		m,
		b
	]), S = useCallback((i) => ({ actions: p ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("div", {
			className: "border-r pr-1",
			children: /* @__PURE__ */ jsx(CopyButton, {
				content: i.content,
				copyMessage: "Copied response to clipboard!"
			})
		}),
		/* @__PURE__ */ jsx(Button, {
			size: "icon",
			variant: "ghost",
			className: "h-6 w-6",
			onClick: () => p(i.id, "thumbs-up"),
			children: /* @__PURE__ */ jsx(ThumbsUp, { className: "h-4 w-4" })
		}),
		/* @__PURE__ */ jsx(Button, {
			size: "icon",
			variant: "ghost",
			className: "h-6 w-6",
			onClick: () => p(i.id, "thumbs-down"),
			children: /* @__PURE__ */ jsx(ThumbsDown, { className: "h-4 w-4" })
		})
	] }) : /* @__PURE__ */ jsx(CopyButton, {
		content: i.content,
		copyMessage: "Copied response to clipboard!"
	}) }), [p]);
	return /* @__PURE__ */ jsxs(ChatContainer, {
		className: cn(f, "relative"),
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-1 flex-col overflow-hidden",
			children: v && u && d ? /* @__PURE__ */ jsx("div", {
				className: "flex h-full flex-col justify-center overflow-y-auto",
				children: /* @__PURE__ */ jsx(PromptSuggestions, {
					label: "",
					append: u,
					suggestions: d
				})
			}) : i.length > 0 ? /* @__PURE__ */ jsx(ChatMessages, {
				messages: i,
				className: "flex-1 w-full px-4 pt-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-4xl mx-auto w-full",
					children: [/* @__PURE__ */ jsx(MessageList, {
						messages: i,
						isTyping: y,
						messageOptions: S
					}), u && d && d.length > 0 && !l && /* @__PURE__ */ jsx("div", {
						className: "mt-6 flex flex-wrap gap-2 pb-8",
						children: d.map((i) => /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							size: "sm",
							className: "rounded-xl bg-background/50 backdrop-blur-sm text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-primary/20 hover:border-primary shadow-sm",
							onClick: () => u({
								role: "user",
								content: i
							}),
							children: i
						}, i))
					})]
				})
			}) : /* @__PURE__ */ jsx("div", { className: "flex-1" })
		}), /* @__PURE__ */ jsx("div", {
			className: "w-full max-w-4xl mx-auto px-4 pb-6",
			children: /* @__PURE__ */ jsx(ChatForm, {
				className: "relative",
				isPending: l || y,
				handleSubmit: a,
				children: ({ files: i, setFiles: a }) => /* @__PURE__ */ jsx(MessageInput, {
					value: o,
					onChange: s,
					allowAttachments: !0,
					files: i,
					setFiles: a,
					stop: x,
					isGenerating: l,
					transcribeAudio: h,
					placeholder: g
				})
			})
		})]
	});
}
Chat.displayName = "Chat";
function ChatMessages({ messages: i, children: a, className: o }) {
	let { containerRef: s, scrollToBottom: c, handleScroll: l, shouldAutoScroll: u, handleTouchStart: d } = useAutoScroll([i]);
	return /* @__PURE__ */ jsxs("div", {
		className: cn("grid grid-cols-1 overflow-y-auto pb-4", o),
		ref: s,
		onScroll: l,
		onTouchStart: d,
		children: [/* @__PURE__ */ jsx("div", {
			className: "max-w-full [grid-column:1/1] [grid-row:1/1]",
			children: a
		}), !u && /* @__PURE__ */ jsx("div", {
			className: "pointer-events-none flex flex-1 items-end justify-end [grid-column:1/1] [grid-row:1/1]",
			children: /* @__PURE__ */ jsx("div", {
				className: "sticky bottom-0 left-0 flex w-full justify-end",
				children: /* @__PURE__ */ jsx(Button, {
					onClick: c,
					className: "pointer-events-auto h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1",
					size: "icon",
					variant: "ghost",
					children: /* @__PURE__ */ jsx(ArrowDown, { className: "h-4 w-4" })
				})
			})
		})]
	});
}
const ChatContainer = forwardRef(({ className: i, ...a }, o) => /* @__PURE__ */ jsx("div", {
	ref: o,
	className: cn("grid h-full w-full grid-rows-[1fr_auto]", i),
	...a
}));
ChatContainer.displayName = "ChatContainer";
const ChatForm = forwardRef(({ children: i, handleSubmit: a, className: o }, s) => {
	let [c, l] = useState(null);
	return /* @__PURE__ */ jsx("form", {
		ref: s,
		onSubmit: (i) => {
			if (!c) {
				a(i);
				return;
			}
			a(i, { experimental_attachments: createFileList(c) }), l(null);
		},
		className: o,
		children: i({
			files: c,
			setFiles: l
		})
	});
});
ChatForm.displayName = "ChatForm";
function createFileList(i) {
	let a = new DataTransfer();
	for (let o of Array.from(i)) a.items.add(o);
	return a.files;
}
function clamp(i, [a, o]) {
	return Math.min(o, Math.max(a, i));
}
/* @__NO_SIDE_EFFECTS__ */
function createSlot$2(i) {
	let a = /* @__PURE__ */ createSlotClone$2(i), o = React$1.forwardRef((i, o) => {
		let { children: s, ...c } = i, l = React$1.Children.toArray(s), u = l.find(isSlottable$2);
		if (u) {
			let i = u.props.children, s = l.map((a) => a === u ? React$1.Children.count(i) > 1 ? React$1.Children.only(null) : React$1.isValidElement(i) ? i.props.children : null : a);
			return /* @__PURE__ */ jsx(a, {
				...c,
				ref: o,
				children: React$1.isValidElement(i) ? React$1.cloneElement(i, void 0, s) : null
			});
		}
		return /* @__PURE__ */ jsx(a, {
			...c,
			ref: o,
			children: s
		});
	});
	return o.displayName = `${i}.Slot`, o;
}
/* @__NO_SIDE_EFFECTS__ */
function createSlotClone$2(i) {
	let a = React$1.forwardRef((i, a) => {
		let { children: o, ...s } = i;
		if (React$1.isValidElement(o)) {
			let i = getElementRef$2(o), c = mergeProps$2(s, o.props);
			return o.type !== React$1.Fragment && (c.ref = a ? composeRefs(a, i) : i), React$1.cloneElement(o, c);
		}
		return React$1.Children.count(o) > 1 ? React$1.Children.only(null) : null;
	});
	return a.displayName = `${i}.SlotClone`, a;
}
var SLOTTABLE_IDENTIFIER$2 = Symbol("radix.slottable");
function isSlottable$2(i) {
	return React$1.isValidElement(i) && typeof i.type == "function" && "__radixId" in i.type && i.type.__radixId === SLOTTABLE_IDENTIFIER$2;
}
function mergeProps$2(i, a) {
	let o = { ...a };
	for (let s in a) {
		let c = i[s], l = a[s];
		/^on[A-Z]/.test(s) ? c && l ? o[s] = (...i) => {
			let a = l(...i);
			return c(...i), a;
		} : c && (o[s] = c) : s === "style" ? o[s] = {
			...c,
			...l
		} : s === "className" && (o[s] = [c, l].filter(Boolean).join(" "));
	}
	return {
		...i,
		...o
	};
}
function getElementRef$2(i) {
	let a = Object.getOwnPropertyDescriptor(i.props, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning;
	return o ? i.ref : (a = Object.getOwnPropertyDescriptor(i, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning, o ? i.props.ref : i.props.ref || i.ref);
}
function createCollection(i) {
	let a = i + "CollectionProvider", [o, s] = createContextScope(a), [c, l] = o(a, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), u = (i) => {
		let { scope: a, children: o } = i, s = React.useRef(null), l = React.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ jsx(c, {
			scope: a,
			itemMap: l,
			collectionRef: s,
			children: o
		});
	};
	u.displayName = a;
	let d = i + "CollectionSlot", f = /* @__PURE__ */ createSlot$2(d), p = React.forwardRef((i, a) => {
		let { scope: o, children: s } = i;
		return /* @__PURE__ */ jsx(f, {
			ref: useComposedRefs(a, l(d, o).collectionRef),
			children: s
		});
	});
	p.displayName = d;
	let m = i + "CollectionItemSlot", h = "data-radix-collection-item", g = /* @__PURE__ */ createSlot$2(m), _ = React.forwardRef((i, a) => {
		let { scope: o, children: s, ...c } = i, u = React.useRef(null), d = useComposedRefs(a, u), f = l(m, o);
		return React.useEffect(() => (f.itemMap.set(u, {
			ref: u,
			...c
		}), () => void f.itemMap.delete(u))), /* @__PURE__ */ jsx(g, {
			[h]: "",
			ref: d,
			children: s
		});
	});
	_.displayName = m;
	function y(a) {
		let o = l(i + "CollectionConsumer", a);
		return React.useCallback(() => {
			let i = o.collectionRef.current;
			if (!i) return [];
			let a = Array.from(i.querySelectorAll(`[${h}]`));
			return Array.from(o.itemMap.values()).sort((i, o) => a.indexOf(i.ref.current) - a.indexOf(o.ref.current));
		}, [o.collectionRef, o.itemMap]);
	}
	return [
		{
			Provider: u,
			Slot: p,
			ItemSlot: _
		},
		y,
		s
	];
}
var DirectionContext = React$1.createContext(void 0);
function useDirection(i) {
	let a = React$1.useContext(DirectionContext);
	return i || a || "ltr";
}
/* @__NO_SIDE_EFFECTS__ */
function createSlot$1(i) {
	let a = /* @__PURE__ */ createSlotClone$1(i), o = React$1.forwardRef((i, o) => {
		let { children: s, ...c } = i, l = React$1.Children.toArray(s), u = l.find(isSlottable$1);
		if (u) {
			let i = u.props.children, s = l.map((a) => a === u ? React$1.Children.count(i) > 1 ? React$1.Children.only(null) : React$1.isValidElement(i) ? i.props.children : null : a);
			return /* @__PURE__ */ jsx(a, {
				...c,
				ref: o,
				children: React$1.isValidElement(i) ? React$1.cloneElement(i, void 0, s) : null
			});
		}
		return /* @__PURE__ */ jsx(a, {
			...c,
			ref: o,
			children: s
		});
	});
	return o.displayName = `${i}.Slot`, o;
}
/* @__NO_SIDE_EFFECTS__ */
function createSlotClone$1(i) {
	let a = React$1.forwardRef((i, a) => {
		let { children: o, ...s } = i;
		if (React$1.isValidElement(o)) {
			let i = getElementRef$1(o), c = mergeProps$1(s, o.props);
			return o.type !== React$1.Fragment && (c.ref = a ? composeRefs(a, i) : i), React$1.cloneElement(o, c);
		}
		return React$1.Children.count(o) > 1 ? React$1.Children.only(null) : null;
	});
	return a.displayName = `${i}.SlotClone`, a;
}
var SLOTTABLE_IDENTIFIER$1 = Symbol("radix.slottable");
function isSlottable$1(i) {
	return React$1.isValidElement(i) && typeof i.type == "function" && "__radixId" in i.type && i.type.__radixId === SLOTTABLE_IDENTIFIER$1;
}
function mergeProps$1(i, a) {
	let o = { ...a };
	for (let s in a) {
		let c = i[s], l = a[s];
		/^on[A-Z]/.test(s) ? c && l ? o[s] = (...i) => {
			let a = l(...i);
			return c(...i), a;
		} : c && (o[s] = c) : s === "style" ? o[s] = {
			...c,
			...l
		} : s === "className" && (o[s] = [c, l].filter(Boolean).join(" "));
	}
	return {
		...i,
		...o
	};
}
function getElementRef$1(i) {
	let a = Object.getOwnPropertyDescriptor(i.props, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning;
	return o ? i.ref : (a = Object.getOwnPropertyDescriptor(i, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning, o ? i.props.ref : i.props.ref || i.ref);
}
function usePrevious(i) {
	let a = React$1.useRef({
		value: i,
		previous: i
	});
	return React$1.useMemo(() => (a.current.value !== i && (a.current.previous = a.current.value, a.current.value = i), a.current.previous), [i]);
}
var VISUALLY_HIDDEN_STYLES = Object.freeze({
	position: "absolute",
	border: 0,
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	wordWrap: "normal"
}), NAME = "VisuallyHidden", VisuallyHidden = React$1.forwardRef((i, a) => /* @__PURE__ */ jsx(Primitive.span, {
	...i,
	ref: a,
	style: {
		...VISUALLY_HIDDEN_STYLES,
		...i.style
	}
}));
VisuallyHidden.displayName = NAME;
var OPEN_KEYS = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], SELECTION_KEYS = [" ", "Enter"], SELECT_NAME = "Select", [Collection, useCollection, createCollectionScope] = createCollection(SELECT_NAME), [createSelectContext, createSelectScope] = createContextScope(SELECT_NAME, [createCollectionScope, createPopperScope]), usePopperScope = createPopperScope(), [SelectProvider, useSelectContext] = createSelectContext(SELECT_NAME), [SelectNativeOptionsProvider, useSelectNativeOptionsContext] = createSelectContext(SELECT_NAME), Select$1 = (i) => {
	let { __scopeSelect: a, children: o, open: s, defaultOpen: c, onOpenChange: l, value: u, defaultValue: d, onValueChange: f, dir: p, name: m, autoComplete: h, disabled: g, required: v, form: y } = i, b = usePopperScope(a), [x, S] = React$1.useState(null), [C, w] = React$1.useState(null), [T, E] = React$1.useState(!1), D = useDirection(p), [O, k] = useControllableState({
		prop: s,
		defaultProp: c ?? !1,
		onChange: l,
		caller: SELECT_NAME
	}), [A, j] = useControllableState({
		prop: u,
		defaultProp: d,
		onChange: f,
		caller: SELECT_NAME
	}), M = React$1.useRef(null), N = x ? y || !!x.closest("form") : !0, [P, F] = React$1.useState(/* @__PURE__ */ new Set()), I = Array.from(P).map((i) => i.props.value).join(";");
	return /* @__PURE__ */ jsx(Root2$2, {
		...b,
		children: /* @__PURE__ */ jsxs(SelectProvider, {
			required: v,
			scope: a,
			trigger: x,
			onTriggerChange: S,
			valueNode: C,
			onValueNodeChange: w,
			valueNodeHasChildren: T,
			onValueNodeHasChildrenChange: E,
			contentId: useId$1(),
			value: A,
			onValueChange: j,
			open: O,
			onOpenChange: k,
			dir: D,
			triggerPointerDownPosRef: M,
			disabled: g,
			children: [/* @__PURE__ */ jsx(Collection.Provider, {
				scope: a,
				children: /* @__PURE__ */ jsx(SelectNativeOptionsProvider, {
					scope: i.__scopeSelect,
					onNativeOptionAdd: React$1.useCallback((i) => {
						F((a) => new Set(a).add(i));
					}, []),
					onNativeOptionRemove: React$1.useCallback((i) => {
						F((a) => {
							let o = new Set(a);
							return o.delete(i), o;
						});
					}, []),
					children: o
				})
			}), N ? /* @__PURE__ */ jsxs(SelectBubbleInput, {
				"aria-hidden": !0,
				required: v,
				tabIndex: -1,
				name: m,
				autoComplete: h,
				value: A,
				onChange: (i) => j(i.target.value),
				disabled: g,
				form: y,
				children: [A === void 0 ? /* @__PURE__ */ jsx("option", { value: "" }) : null, Array.from(P)]
			}, I) : null]
		})
	});
};
Select$1.displayName = SELECT_NAME;
var TRIGGER_NAME$1 = "SelectTrigger", SelectTrigger$1 = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, disabled: s = !1, ...c } = i, l = usePopperScope(o), u = useSelectContext(TRIGGER_NAME$1, o), d = u.disabled || s, f = useComposedRefs(a, u.onTriggerChange), p = useCollection(o), m = React$1.useRef("touch"), [h, g, v] = useTypeaheadSearch((i) => {
		let a = p().filter((i) => !i.disabled), o = findNextItem(a, i, a.find((i) => i.value === u.value));
		o !== void 0 && u.onValueChange(o.value);
	}), y = (i) => {
		d || (u.onOpenChange(!0), v()), i && (u.triggerPointerDownPosRef.current = {
			x: Math.round(i.pageX),
			y: Math.round(i.pageY)
		});
	};
	return /* @__PURE__ */ jsx(Anchor, {
		asChild: !0,
		...l,
		children: /* @__PURE__ */ jsx(Primitive.button, {
			type: "button",
			role: "combobox",
			"aria-controls": u.contentId,
			"aria-expanded": u.open,
			"aria-required": u.required,
			"aria-autocomplete": "none",
			dir: u.dir,
			"data-state": u.open ? "open" : "closed",
			disabled: d,
			"data-disabled": d ? "" : void 0,
			"data-placeholder": shouldShowPlaceholder(u.value) ? "" : void 0,
			...c,
			ref: f,
			onClick: composeEventHandlers(c.onClick, (i) => {
				i.currentTarget.focus(), m.current !== "mouse" && y(i);
			}),
			onPointerDown: composeEventHandlers(c.onPointerDown, (i) => {
				m.current = i.pointerType;
				let a = i.target;
				a.hasPointerCapture(i.pointerId) && a.releasePointerCapture(i.pointerId), i.button === 0 && i.ctrlKey === !1 && i.pointerType === "mouse" && (y(i), i.preventDefault());
			}),
			onKeyDown: composeEventHandlers(c.onKeyDown, (i) => {
				let a = h.current !== "";
				!(i.ctrlKey || i.altKey || i.metaKey) && i.key.length === 1 && g(i.key), !(a && i.key === " ") && OPEN_KEYS.includes(i.key) && (y(), i.preventDefault());
			})
		})
	});
});
SelectTrigger$1.displayName = TRIGGER_NAME$1;
var VALUE_NAME = "SelectValue", SelectValue$1 = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, className: s, style: c, children: l, placeholder: u = "", ...d } = i, f = useSelectContext(VALUE_NAME, o), { onValueNodeHasChildrenChange: p } = f, m = l !== void 0, h = useComposedRefs(a, f.onValueNodeChange);
	return useLayoutEffect2(() => {
		p(m);
	}, [p, m]), /* @__PURE__ */ jsx(Primitive.span, {
		...d,
		ref: h,
		style: { pointerEvents: "none" },
		children: shouldShowPlaceholder(f.value) ? /* @__PURE__ */ jsx(Fragment$1, { children: u }) : l
	});
});
SelectValue$1.displayName = VALUE_NAME;
var ICON_NAME = "SelectIcon", SelectIcon = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, children: s, ...c } = i;
	return /* @__PURE__ */ jsx(Primitive.span, {
		"aria-hidden": !0,
		...c,
		ref: a,
		children: s || "▼"
	});
});
SelectIcon.displayName = ICON_NAME;
var PORTAL_NAME$1 = "SelectPortal", SelectPortal = (i) => /* @__PURE__ */ jsx(Portal, {
	asChild: !0,
	...i
});
SelectPortal.displayName = PORTAL_NAME$1;
var CONTENT_NAME$1 = "SelectContent", SelectContent$1 = React$1.forwardRef((i, a) => {
	let o = useSelectContext(CONTENT_NAME$1, i.__scopeSelect), [s, c] = React$1.useState();
	if (useLayoutEffect2(() => {
		c(new DocumentFragment());
	}, []), !o.open) {
		let a = s;
		return a ? ReactDOM$1.createPortal(/* @__PURE__ */ jsx(SelectContentProvider, {
			scope: i.__scopeSelect,
			children: /* @__PURE__ */ jsx(Collection.Slot, {
				scope: i.__scopeSelect,
				children: /* @__PURE__ */ jsx("div", { children: i.children })
			})
		}), a) : null;
	}
	return /* @__PURE__ */ jsx(SelectContentImpl, {
		...i,
		ref: a
	});
});
SelectContent$1.displayName = CONTENT_NAME$1;
var CONTENT_MARGIN = 10, [SelectContentProvider, useSelectContentContext] = createSelectContext(CONTENT_NAME$1), CONTENT_IMPL_NAME = "SelectContentImpl", Slot$1 = /* @__PURE__ */ createSlot$1("SelectContent.RemoveScroll"), SelectContentImpl = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, position: s = "item-aligned", onCloseAutoFocus: c, onEscapeKeyDown: l, onPointerDownOutside: u, side: d, sideOffset: f, align: p, alignOffset: m, arrowPadding: h, collisionBoundary: g, collisionPadding: v, sticky: y, hideWhenDetached: b, avoidCollisions: x, ...S } = i, C = useSelectContext(CONTENT_NAME$1, o), [w, T] = React$1.useState(null), [E, D] = React$1.useState(null), O = useComposedRefs(a, (i) => T(i)), [k, A] = React$1.useState(null), [j, M] = React$1.useState(null), N = useCollection(o), [P, F] = React$1.useState(!1), I = React$1.useRef(!1);
	React$1.useEffect(() => {
		if (w) return hideOthers(w);
	}, [w]), useFocusGuards();
	let R = React$1.useCallback((i) => {
		let [a, ...o] = N().map((i) => i.ref.current), [s] = o.slice(-1), c = document.activeElement;
		for (let o of i) if (o === c || (o?.scrollIntoView({ block: "nearest" }), o === a && E && (E.scrollTop = 0), o === s && E && (E.scrollTop = E.scrollHeight), o?.focus(), document.activeElement !== c)) return;
	}, [N, E]), z = React$1.useCallback(() => R([k, w]), [
		R,
		k,
		w
	]);
	React$1.useEffect(() => {
		P && z();
	}, [P, z]);
	let { onOpenChange: B, triggerPointerDownPosRef: V } = C;
	React$1.useEffect(() => {
		if (w) {
			let i = {
				x: 0,
				y: 0
			}, a = (a) => {
				i = {
					x: Math.abs(Math.round(a.pageX) - (V.current?.x ?? 0)),
					y: Math.abs(Math.round(a.pageY) - (V.current?.y ?? 0))
				};
			}, o = (o) => {
				i.x <= 10 && i.y <= 10 ? o.preventDefault() : w.contains(o.target) || B(!1), document.removeEventListener("pointermove", a), V.current = null;
			};
			return V.current !== null && (document.addEventListener("pointermove", a), document.addEventListener("pointerup", o, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", a), document.removeEventListener("pointerup", o, { capture: !0 });
			};
		}
	}, [
		w,
		B,
		V
	]), React$1.useEffect(() => {
		let i = () => B(!1);
		return window.addEventListener("blur", i), window.addEventListener("resize", i), () => {
			window.removeEventListener("blur", i), window.removeEventListener("resize", i);
		};
	}, [B]);
	let [H, U] = useTypeaheadSearch((i) => {
		let a = N().filter((i) => !i.disabled), o = findNextItem(a, i, a.find((i) => i.ref.current === document.activeElement));
		o && setTimeout(() => o.ref.current.focus());
	}), W = React$1.useCallback((i, a, o) => {
		let s = !I.current && !o;
		(C.value !== void 0 && C.value === a || s) && (A(i), s && (I.current = !0));
	}, [C.value]), G = React$1.useCallback(() => w?.focus(), [w]), K = React$1.useCallback((i, a, o) => {
		let s = !I.current && !o;
		(C.value !== void 0 && C.value === a || s) && M(i);
	}, [C.value]), q = s === "popper" ? SelectPopperPosition : SelectItemAlignedPosition, J = q === SelectPopperPosition ? {
		side: d,
		sideOffset: f,
		align: p,
		alignOffset: m,
		arrowPadding: h,
		collisionBoundary: g,
		collisionPadding: v,
		sticky: y,
		hideWhenDetached: b,
		avoidCollisions: x
	} : {};
	return /* @__PURE__ */ jsx(SelectContentProvider, {
		scope: o,
		content: w,
		viewport: E,
		onViewportChange: D,
		itemRefCallback: W,
		selectedItem: k,
		onItemLeave: G,
		itemTextRefCallback: K,
		focusSelectedItem: z,
		selectedItemText: j,
		position: s,
		isPositioned: P,
		searchRef: H,
		children: /* @__PURE__ */ jsx(Combination_default, {
			as: Slot$1,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ jsx(FocusScope, {
				asChild: !0,
				trapped: C.open,
				onMountAutoFocus: (i) => {
					i.preventDefault();
				},
				onUnmountAutoFocus: composeEventHandlers(c, (i) => {
					C.trigger?.focus({ preventScroll: !0 }), i.preventDefault();
				}),
				children: /* @__PURE__ */ jsx(DismissableLayer, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: l,
					onPointerDownOutside: u,
					onFocusOutside: (i) => i.preventDefault(),
					onDismiss: () => C.onOpenChange(!1),
					children: /* @__PURE__ */ jsx(q, {
						role: "listbox",
						id: C.contentId,
						"data-state": C.open ? "open" : "closed",
						dir: C.dir,
						onContextMenu: (i) => i.preventDefault(),
						...S,
						...J,
						onPlaced: () => F(!0),
						ref: O,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...S.style
						},
						onKeyDown: composeEventHandlers(S.onKeyDown, (i) => {
							let a = i.ctrlKey || i.altKey || i.metaKey;
							if (i.key === "Tab" && i.preventDefault(), !a && i.key.length === 1 && U(i.key), [
								"ArrowUp",
								"ArrowDown",
								"Home",
								"End"
							].includes(i.key)) {
								let a = N().filter((i) => !i.disabled).map((i) => i.ref.current);
								if (["ArrowUp", "End"].includes(i.key) && (a = a.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(i.key)) {
									let o = i.target, s = a.indexOf(o);
									a = a.slice(s + 1);
								}
								setTimeout(() => R(a)), i.preventDefault();
							}
						})
					})
				})
			})
		})
	});
});
SelectContentImpl.displayName = CONTENT_IMPL_NAME;
var ITEM_ALIGNED_POSITION_NAME = "SelectItemAlignedPosition", SelectItemAlignedPosition = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, onPlaced: s, ...c } = i, l = useSelectContext(CONTENT_NAME$1, o), u = useSelectContentContext(CONTENT_NAME$1, o), [d, f] = React$1.useState(null), [p, m] = React$1.useState(null), h = useComposedRefs(a, (i) => m(i)), g = useCollection(o), v = React$1.useRef(!1), y = React$1.useRef(!0), { viewport: b, selectedItem: x, selectedItemText: S, focusSelectedItem: C } = u, w = React$1.useCallback(() => {
		if (l.trigger && l.valueNode && d && p && b && x && S) {
			let i = l.trigger.getBoundingClientRect(), a = p.getBoundingClientRect(), o = l.valueNode.getBoundingClientRect(), c = S.getBoundingClientRect();
			if (l.dir !== "rtl") {
				let s = c.left - a.left, l = o.left - s, u = i.left - l, f = i.width + u, p = Math.max(f, a.width), m = window.innerWidth - CONTENT_MARGIN, h = clamp(l, [CONTENT_MARGIN, Math.max(CONTENT_MARGIN, m - p)]);
				d.style.minWidth = f + "px", d.style.left = h + "px";
			} else {
				let s = a.right - c.right, l = window.innerWidth - o.right - s, u = window.innerWidth - i.right - l, f = i.width + u, p = Math.max(f, a.width), m = window.innerWidth - CONTENT_MARGIN, h = clamp(l, [CONTENT_MARGIN, Math.max(CONTENT_MARGIN, m - p)]);
				d.style.minWidth = f + "px", d.style.right = h + "px";
			}
			let u = g(), f = window.innerHeight - CONTENT_MARGIN * 2, m = b.scrollHeight, h = window.getComputedStyle(p), _ = parseInt(h.borderTopWidth, 10), y = parseInt(h.paddingTop, 10), C = parseInt(h.borderBottomWidth, 10), w = parseInt(h.paddingBottom, 10), T = _ + y + m + w + C, E = Math.min(x.offsetHeight * 5, T), D = window.getComputedStyle(b), O = parseInt(D.paddingTop, 10), k = parseInt(D.paddingBottom, 10), A = i.top + i.height / 2 - CONTENT_MARGIN, j = f - A, M = x.offsetHeight / 2, N = x.offsetTop + M, P = _ + y + N, F = T - P;
			if (P <= A) {
				let i = u.length > 0 && x === u[u.length - 1].ref.current;
				d.style.bottom = "0px";
				let a = p.clientHeight - b.offsetTop - b.offsetHeight, o = P + Math.max(j, M + (i ? k : 0) + a + C);
				d.style.height = o + "px";
			} else {
				let i = u.length > 0 && x === u[0].ref.current;
				d.style.top = "0px";
				let a = Math.max(A, _ + b.offsetTop + (i ? O : 0) + M) + F;
				d.style.height = a + "px", b.scrollTop = P - A + b.offsetTop;
			}
			d.style.margin = `${CONTENT_MARGIN}px 0`, d.style.minHeight = E + "px", d.style.maxHeight = f + "px", s?.(), requestAnimationFrame(() => v.current = !0);
		}
	}, [
		g,
		l.trigger,
		l.valueNode,
		d,
		p,
		b,
		x,
		S,
		l.dir,
		s
	]);
	useLayoutEffect2(() => w(), [w]);
	let [T, E] = React$1.useState();
	return useLayoutEffect2(() => {
		p && E(window.getComputedStyle(p).zIndex);
	}, [p]), /* @__PURE__ */ jsx(SelectViewportProvider, {
		scope: o,
		contentWrapper: d,
		shouldExpandOnScrollRef: v,
		onScrollButtonChange: React$1.useCallback((i) => {
			i && y.current === !0 && (w(), C?.(), y.current = !1);
		}, [w, C]),
		children: /* @__PURE__ */ jsx("div", {
			ref: f,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: T
			},
			children: /* @__PURE__ */ jsx(Primitive.div, {
				...c,
				ref: h,
				style: {
					boxSizing: "border-box",
					maxHeight: "100%",
					...c.style
				}
			})
		})
	});
});
SelectItemAlignedPosition.displayName = ITEM_ALIGNED_POSITION_NAME;
var POPPER_POSITION_NAME = "SelectPopperPosition", SelectPopperPosition = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, align: s = "start", collisionPadding: c = CONTENT_MARGIN, ...l } = i;
	return /* @__PURE__ */ jsx(Content$1, {
		...usePopperScope(o),
		...l,
		ref: a,
		align: s,
		collisionPadding: c,
		style: {
			boxSizing: "border-box",
			...l.style,
			"--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-select-content-available-width": "var(--radix-popper-available-width)",
			"--radix-select-content-available-height": "var(--radix-popper-available-height)",
			"--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
});
SelectPopperPosition.displayName = POPPER_POSITION_NAME;
var [SelectViewportProvider, useSelectViewportContext] = createSelectContext(CONTENT_NAME$1, {}), VIEWPORT_NAME = "SelectViewport", SelectViewport = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, nonce: s, ...c } = i, l = useSelectContentContext(VIEWPORT_NAME, o), u = useSelectViewportContext(VIEWPORT_NAME, o), d = useComposedRefs(a, l.onViewportChange), f = React$1.useRef(0);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: s
	}), /* @__PURE__ */ jsx(Collection.Slot, {
		scope: o,
		children: /* @__PURE__ */ jsx(Primitive.div, {
			"data-radix-select-viewport": "",
			role: "presentation",
			...c,
			ref: d,
			style: {
				position: "relative",
				flex: 1,
				overflow: "hidden auto",
				...c.style
			},
			onScroll: composeEventHandlers(c.onScroll, (i) => {
				let a = i.currentTarget, { contentWrapper: o, shouldExpandOnScrollRef: s } = u;
				if (s?.current && o) {
					let i = Math.abs(f.current - a.scrollTop);
					if (i > 0) {
						let s = window.innerHeight - CONTENT_MARGIN * 2, c = parseFloat(o.style.minHeight), l = parseFloat(o.style.height), u = Math.max(c, l);
						if (u < s) {
							let c = u + i, l = Math.min(s, c), d = c - l;
							o.style.height = l + "px", o.style.bottom === "0px" && (a.scrollTop = d > 0 ? d : 0, o.style.justifyContent = "flex-end");
						}
					}
				}
				f.current = a.scrollTop;
			})
		})
	})] });
});
SelectViewport.displayName = VIEWPORT_NAME;
var GROUP_NAME = "SelectGroup", [SelectGroupContextProvider, useSelectGroupContext] = createSelectContext(GROUP_NAME), SelectGroup = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, ...s } = i, c = useId$1();
	return /* @__PURE__ */ jsx(SelectGroupContextProvider, {
		scope: o,
		id: c,
		children: /* @__PURE__ */ jsx(Primitive.div, {
			role: "group",
			"aria-labelledby": c,
			...s,
			ref: a
		})
	});
});
SelectGroup.displayName = GROUP_NAME;
var LABEL_NAME = "SelectLabel", SelectLabel = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, ...s } = i, c = useSelectGroupContext(LABEL_NAME, o);
	return /* @__PURE__ */ jsx(Primitive.div, {
		id: c.id,
		...s,
		ref: a
	});
});
SelectLabel.displayName = LABEL_NAME;
var ITEM_NAME = "SelectItem", [SelectItemContextProvider, useSelectItemContext] = createSelectContext(ITEM_NAME), SelectItem$1 = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, value: s, disabled: c = !1, textValue: l, ...u } = i, d = useSelectContext(ITEM_NAME, o), f = useSelectContentContext(ITEM_NAME, o), p = d.value === s, [m, h] = React$1.useState(l ?? ""), [g, v] = React$1.useState(!1), y = useComposedRefs(a, (i) => f.itemRefCallback?.(i, s, c)), b = useId$1(), x = React$1.useRef("touch"), S = () => {
		c || (d.onValueChange(s), d.onOpenChange(!1));
	};
	if (s === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ jsx(SelectItemContextProvider, {
		scope: o,
		value: s,
		disabled: c,
		textId: b,
		isSelected: p,
		onItemTextChange: React$1.useCallback((i) => {
			h((a) => a || (i?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ jsx(Collection.ItemSlot, {
			scope: o,
			value: s,
			disabled: c,
			textValue: m,
			children: /* @__PURE__ */ jsx(Primitive.div, {
				role: "option",
				"aria-labelledby": b,
				"data-highlighted": g ? "" : void 0,
				"aria-selected": p && g,
				"data-state": p ? "checked" : "unchecked",
				"aria-disabled": c || void 0,
				"data-disabled": c ? "" : void 0,
				tabIndex: c ? void 0 : -1,
				...u,
				ref: y,
				onFocus: composeEventHandlers(u.onFocus, () => v(!0)),
				onBlur: composeEventHandlers(u.onBlur, () => v(!1)),
				onClick: composeEventHandlers(u.onClick, () => {
					x.current !== "mouse" && S();
				}),
				onPointerUp: composeEventHandlers(u.onPointerUp, () => {
					x.current === "mouse" && S();
				}),
				onPointerDown: composeEventHandlers(u.onPointerDown, (i) => {
					x.current = i.pointerType;
				}),
				onPointerMove: composeEventHandlers(u.onPointerMove, (i) => {
					x.current = i.pointerType, c ? f.onItemLeave?.() : x.current === "mouse" && i.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: composeEventHandlers(u.onPointerLeave, (i) => {
					i.currentTarget === document.activeElement && f.onItemLeave?.();
				}),
				onKeyDown: composeEventHandlers(u.onKeyDown, (i) => {
					f.searchRef?.current !== "" && i.key === " " || (SELECTION_KEYS.includes(i.key) && S(), i.key === " " && i.preventDefault());
				})
			})
		})
	});
});
SelectItem$1.displayName = ITEM_NAME;
var ITEM_TEXT_NAME = "SelectItemText", SelectItemText = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, className: s, style: c, ...l } = i, u = useSelectContext(ITEM_TEXT_NAME, o), d = useSelectContentContext(ITEM_TEXT_NAME, o), f = useSelectItemContext(ITEM_TEXT_NAME, o), p = useSelectNativeOptionsContext(ITEM_TEXT_NAME, o), [m, h] = React$1.useState(null), g = useComposedRefs(a, (i) => h(i), f.onItemTextChange, (i) => d.itemTextRefCallback?.(i, f.value, f.disabled)), v = m?.textContent, y = React$1.useMemo(() => /* @__PURE__ */ jsx("option", {
		value: f.value,
		disabled: f.disabled,
		children: v
	}, f.value), [
		f.disabled,
		f.value,
		v
	]), { onNativeOptionAdd: b, onNativeOptionRemove: x } = p;
	return useLayoutEffect2(() => (b(y), () => x(y)), [
		b,
		x,
		y
	]), /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Primitive.span, {
		id: f.textId,
		...l,
		ref: g
	}), f.isSelected && u.valueNode && !u.valueNodeHasChildren ? ReactDOM$1.createPortal(l.children, u.valueNode) : null] });
});
SelectItemText.displayName = ITEM_TEXT_NAME;
var ITEM_INDICATOR_NAME = "SelectItemIndicator", SelectItemIndicator = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, ...s } = i;
	return useSelectItemContext(ITEM_INDICATOR_NAME, o).isSelected ? /* @__PURE__ */ jsx(Primitive.span, {
		"aria-hidden": !0,
		...s,
		ref: a
	}) : null;
});
SelectItemIndicator.displayName = ITEM_INDICATOR_NAME;
var SCROLL_UP_BUTTON_NAME = "SelectScrollUpButton", SelectScrollUpButton$1 = React$1.forwardRef((i, a) => {
	let o = useSelectContentContext(SCROLL_UP_BUTTON_NAME, i.__scopeSelect), s = useSelectViewportContext(SCROLL_UP_BUTTON_NAME, i.__scopeSelect), [c, l] = React$1.useState(!1), u = useComposedRefs(a, s.onScrollButtonChange);
	return useLayoutEffect2(() => {
		if (o.viewport && o.isPositioned) {
			let i = function() {
				l(a.scrollTop > 0);
			}, a = o.viewport;
			return i(), a.addEventListener("scroll", i), () => a.removeEventListener("scroll", i);
		}
	}, [o.viewport, o.isPositioned]), c ? /* @__PURE__ */ jsx(SelectScrollButtonImpl, {
		...i,
		ref: u,
		onAutoScroll: () => {
			let { viewport: i, selectedItem: a } = o;
			i && a && (i.scrollTop -= a.offsetHeight);
		}
	}) : null;
});
SelectScrollUpButton$1.displayName = SCROLL_UP_BUTTON_NAME;
var SCROLL_DOWN_BUTTON_NAME = "SelectScrollDownButton", SelectScrollDownButton$1 = React$1.forwardRef((i, a) => {
	let o = useSelectContentContext(SCROLL_DOWN_BUTTON_NAME, i.__scopeSelect), s = useSelectViewportContext(SCROLL_DOWN_BUTTON_NAME, i.__scopeSelect), [c, l] = React$1.useState(!1), u = useComposedRefs(a, s.onScrollButtonChange);
	return useLayoutEffect2(() => {
		if (o.viewport && o.isPositioned) {
			let i = function() {
				let i = a.scrollHeight - a.clientHeight;
				l(Math.ceil(a.scrollTop) < i);
			}, a = o.viewport;
			return i(), a.addEventListener("scroll", i), () => a.removeEventListener("scroll", i);
		}
	}, [o.viewport, o.isPositioned]), c ? /* @__PURE__ */ jsx(SelectScrollButtonImpl, {
		...i,
		ref: u,
		onAutoScroll: () => {
			let { viewport: i, selectedItem: a } = o;
			i && a && (i.scrollTop += a.offsetHeight);
		}
	}) : null;
});
SelectScrollDownButton$1.displayName = SCROLL_DOWN_BUTTON_NAME;
var SelectScrollButtonImpl = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, onAutoScroll: s, ...c } = i, l = useSelectContentContext("SelectScrollButton", o), u = React$1.useRef(null), d = useCollection(o), f = React$1.useCallback(() => {
		u.current !== null && (window.clearInterval(u.current), u.current = null);
	}, []);
	return React$1.useEffect(() => () => f(), [f]), useLayoutEffect2(() => {
		d().find((i) => i.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [d]), /* @__PURE__ */ jsx(Primitive.div, {
		"aria-hidden": !0,
		...c,
		ref: a,
		style: {
			flexShrink: 0,
			...c.style
		},
		onPointerDown: composeEventHandlers(c.onPointerDown, () => {
			u.current === null && (u.current = window.setInterval(s, 50));
		}),
		onPointerMove: composeEventHandlers(c.onPointerMove, () => {
			l.onItemLeave?.(), u.current === null && (u.current = window.setInterval(s, 50));
		}),
		onPointerLeave: composeEventHandlers(c.onPointerLeave, () => {
			f();
		})
	});
}), SEPARATOR_NAME = "SelectSeparator", SelectSeparator = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, ...s } = i;
	return /* @__PURE__ */ jsx(Primitive.div, {
		"aria-hidden": !0,
		...s,
		ref: a
	});
});
SelectSeparator.displayName = SEPARATOR_NAME;
var ARROW_NAME = "SelectArrow", SelectArrow = React$1.forwardRef((i, a) => {
	let { __scopeSelect: o, ...s } = i, c = usePopperScope(o), l = useSelectContext(ARROW_NAME, o), u = useSelectContentContext(ARROW_NAME, o);
	return l.open && u.position === "popper" ? /* @__PURE__ */ jsx(Arrow, {
		...c,
		...s,
		ref: a
	}) : null;
});
SelectArrow.displayName = ARROW_NAME;
var BUBBLE_INPUT_NAME = "SelectBubbleInput", SelectBubbleInput = React$1.forwardRef(({ __scopeSelect: i, value: a, ...o }, s) => {
	let c = React$1.useRef(null), l = useComposedRefs(s, c), u = usePrevious(a);
	return React$1.useEffect(() => {
		let i = c.current;
		if (!i) return;
		let o = window.HTMLSelectElement.prototype, s = Object.getOwnPropertyDescriptor(o, "value").set;
		if (u !== a && s) {
			let o = new Event("change", { bubbles: !0 });
			s.call(i, a), i.dispatchEvent(o);
		}
	}, [u, a]), /* @__PURE__ */ jsx(Primitive.select, {
		...o,
		style: {
			...VISUALLY_HIDDEN_STYLES,
			...o.style
		},
		ref: l,
		defaultValue: a
	});
});
SelectBubbleInput.displayName = BUBBLE_INPUT_NAME;
function shouldShowPlaceholder(i) {
	return i === "" || i === void 0;
}
function useTypeaheadSearch(i) {
	let a = useCallbackRef(i), o = React$1.useRef(""), s = React$1.useRef(0), c = React$1.useCallback((i) => {
		let c = o.current + i;
		a(c), (function i(a) {
			o.current = a, window.clearTimeout(s.current), a !== "" && (s.current = window.setTimeout(() => i(""), 1e3));
		})(c);
	}, [a]), l = React$1.useCallback(() => {
		o.current = "", window.clearTimeout(s.current);
	}, []);
	return React$1.useEffect(() => () => window.clearTimeout(s.current), []), [
		o,
		c,
		l
	];
}
function findNextItem(i, a, o) {
	let s = a.length > 1 && Array.from(a).every((i) => i === a[0]) ? a[0] : a, c = o ? i.indexOf(o) : -1, l = wrapArray(i, Math.max(c, 0));
	s.length === 1 && (l = l.filter((i) => i !== o));
	let u = l.find((i) => i.textValue.toLowerCase().startsWith(s.toLowerCase()));
	return u === o ? void 0 : u;
}
function wrapArray(i, a) {
	return i.map((o, s) => i[(a + s) % i.length]);
}
var Root2 = Select$1, Trigger$1 = SelectTrigger$1, Value = SelectValue$1, Icon = SelectIcon, Portal$2 = SelectPortal, Content2 = SelectContent$1, Viewport = SelectViewport, Item = SelectItem$1, ItemText = SelectItemText, ItemIndicator = SelectItemIndicator, ScrollUpButton = SelectScrollUpButton$1, ScrollDownButton = SelectScrollDownButton$1;
function Select({ ...i }) {
	return /* @__PURE__ */ jsx(Root2, {
		"data-slot": "select",
		...i
	});
}
function SelectValue({ ...i }) {
	return /* @__PURE__ */ jsx(Value, {
		"data-slot": "select-value",
		...i
	});
}
function SelectTrigger({ className: i, size: a = "default", children: o, ...s }) {
	return /* @__PURE__ */ jsxs(Trigger$1, {
		"data-slot": "select-trigger",
		"data-size": a,
		className: cn("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", i),
		...s,
		children: [o, /* @__PURE__ */ jsx(Icon, {
			asChild: !0,
			children: /* @__PURE__ */ jsx(ChevronDown, { className: "size-4 opacity-50" })
		})]
	});
}
function SelectContent({ className: i, children: a, position: o = "item-aligned", align: s = "center", ...c }) {
	return /* @__PURE__ */ jsx(Portal$2, { children: /* @__PURE__ */ jsxs(Content2, {
		"data-slot": "select-content",
		className: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md", o === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", i),
		position: o,
		align: s,
		...c,
		children: [
			/* @__PURE__ */ jsx(SelectScrollUpButton, {}),
			/* @__PURE__ */ jsx(Viewport, {
				className: cn("p-1", o === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
				children: a
			}),
			/* @__PURE__ */ jsx(SelectScrollDownButton, {})
		]
	}) });
}
function SelectItem({ className: i, children: a, ...o }) {
	return /* @__PURE__ */ jsxs(Item, {
		"data-slot": "select-item",
		className: cn("focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", i),
		...o,
		children: [/* @__PURE__ */ jsx("span", {
			"data-slot": "select-item-indicator",
			className: "absolute right-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ jsx(ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "size-4" }) })
		}), /* @__PURE__ */ jsx(ItemText, { children: a })]
	});
}
function SelectScrollUpButton({ className: i, ...a }) {
	return /* @__PURE__ */ jsx(ScrollUpButton, {
		"data-slot": "select-scroll-up-button",
		className: cn("flex cursor-default items-center justify-center py-1", i),
		...a,
		children: /* @__PURE__ */ jsx(ChevronUp, { className: "size-4" })
	});
}
function SelectScrollDownButton({ className: i, ...a }) {
	return /* @__PURE__ */ jsx(ScrollDownButton, {
		"data-slot": "select-scroll-down-button",
		className: cn("flex cursor-default items-center justify-center py-1", i),
		...a,
		children: /* @__PURE__ */ jsx(ChevronDown, { className: "size-4" })
	});
}
/* @__NO_SIDE_EFFECTS__ */
function createSlot(i) {
	let a = /* @__PURE__ */ createSlotClone(i), o = React$1.forwardRef((i, o) => {
		let { children: s, ...c } = i, l = React$1.Children.toArray(s), u = l.find(isSlottable);
		if (u) {
			let i = u.props.children, s = l.map((a) => a === u ? React$1.Children.count(i) > 1 ? React$1.Children.only(null) : React$1.isValidElement(i) ? i.props.children : null : a);
			return /* @__PURE__ */ jsx(a, {
				...c,
				ref: o,
				children: React$1.isValidElement(i) ? React$1.cloneElement(i, void 0, s) : null
			});
		}
		return /* @__PURE__ */ jsx(a, {
			...c,
			ref: o,
			children: s
		});
	});
	return o.displayName = `${i}.Slot`, o;
}
/* @__NO_SIDE_EFFECTS__ */
function createSlotClone(i) {
	let a = React$1.forwardRef((i, a) => {
		let { children: o, ...s } = i;
		if (React$1.isValidElement(o)) {
			let i = getElementRef(o), c = mergeProps(s, o.props);
			return o.type !== React$1.Fragment && (c.ref = a ? composeRefs(a, i) : i), React$1.cloneElement(o, c);
		}
		return React$1.Children.count(o) > 1 ? React$1.Children.only(null) : null;
	});
	return a.displayName = `${i}.SlotClone`, a;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(i) {
	return React$1.isValidElement(i) && typeof i.type == "function" && "__radixId" in i.type && i.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(i, a) {
	let o = { ...a };
	for (let s in a) {
		let c = i[s], l = a[s];
		/^on[A-Z]/.test(s) ? c && l ? o[s] = (...i) => {
			let a = l(...i);
			return c(...i), a;
		} : c && (o[s] = c) : s === "style" ? o[s] = {
			...c,
			...l
		} : s === "className" && (o[s] = [c, l].filter(Boolean).join(" "));
	}
	return {
		...i,
		...o
	};
}
function getElementRef(i) {
	let a = Object.getOwnPropertyDescriptor(i.props, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning;
	return o ? i.ref : (a = Object.getOwnPropertyDescriptor(i, "ref")?.get, o = a && "isReactWarning" in a && a.isReactWarning, o ? i.props.ref : i.props.ref || i.ref);
}
var DIALOG_NAME = "Dialog", [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME), [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME), Dialog = (i) => {
	let { __scopeDialog: a, children: o, open: s, defaultOpen: c, onOpenChange: l, modal: u = !0 } = i, d = React$1.useRef(null), f = React$1.useRef(null), [p, m] = useControllableState({
		prop: s,
		defaultProp: c ?? !1,
		onChange: l,
		caller: DIALOG_NAME
	});
	return /* @__PURE__ */ jsx(DialogProvider, {
		scope: a,
		triggerRef: d,
		contentRef: f,
		contentId: useId$1(),
		titleId: useId$1(),
		descriptionId: useId$1(),
		open: p,
		onOpenChange: m,
		onOpenToggle: React$1.useCallback(() => m((i) => !i), [m]),
		modal: u,
		children: o
	});
};
Dialog.displayName = DIALOG_NAME;
var TRIGGER_NAME = "DialogTrigger", DialogTrigger = React$1.forwardRef((i, a) => {
	let { __scopeDialog: o, ...s } = i, c = useDialogContext(TRIGGER_NAME, o), l = useComposedRefs(a, c.triggerRef);
	return /* @__PURE__ */ jsx(Primitive.button, {
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": c.open,
		"aria-controls": c.contentId,
		"data-state": getState(c.open),
		...s,
		ref: l,
		onClick: composeEventHandlers(i.onClick, c.onOpenToggle)
	});
});
DialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DialogPortal", [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, { forceMount: void 0 }), DialogPortal = (i) => {
	let { __scopeDialog: a, forceMount: o, children: s, container: c } = i, l = useDialogContext(PORTAL_NAME, a);
	return /* @__PURE__ */ jsx(PortalProvider, {
		scope: a,
		forceMount: o,
		children: React$1.Children.map(s, (i) => /* @__PURE__ */ jsx(Presence, {
			present: o || l.open,
			children: /* @__PURE__ */ jsx(Portal, {
				asChild: !0,
				container: c,
				children: i
			})
		}))
	});
};
DialogPortal.displayName = PORTAL_NAME;
var OVERLAY_NAME = "DialogOverlay", DialogOverlay = React$1.forwardRef((i, a) => {
	let o = usePortalContext(OVERLAY_NAME, i.__scopeDialog), { forceMount: s = o.forceMount, ...c } = i, l = useDialogContext(OVERLAY_NAME, i.__scopeDialog);
	return l.modal ? /* @__PURE__ */ jsx(Presence, {
		present: s || l.open,
		children: /* @__PURE__ */ jsx(DialogOverlayImpl, {
			...c,
			ref: a
		})
	}) : null;
});
DialogOverlay.displayName = OVERLAY_NAME;
var Slot = /* @__PURE__ */ createSlot("DialogOverlay.RemoveScroll"), DialogOverlayImpl = React$1.forwardRef((i, a) => {
	let { __scopeDialog: o, ...s } = i, c = useDialogContext(OVERLAY_NAME, o);
	return /* @__PURE__ */ jsx(Combination_default, {
		as: Slot,
		allowPinchZoom: !0,
		shards: [c.contentRef],
		children: /* @__PURE__ */ jsx(Primitive.div, {
			"data-state": getState(c.open),
			...s,
			ref: a,
			style: {
				pointerEvents: "auto",
				...s.style
			}
		})
	});
}), CONTENT_NAME = "DialogContent", DialogContent = React$1.forwardRef((i, a) => {
	let o = usePortalContext(CONTENT_NAME, i.__scopeDialog), { forceMount: s = o.forceMount, ...c } = i, l = useDialogContext(CONTENT_NAME, i.__scopeDialog);
	return /* @__PURE__ */ jsx(Presence, {
		present: s || l.open,
		children: l.modal ? /* @__PURE__ */ jsx(DialogContentModal, {
			...c,
			ref: a
		}) : /* @__PURE__ */ jsx(DialogContentNonModal, {
			...c,
			ref: a
		})
	});
});
DialogContent.displayName = CONTENT_NAME;
var DialogContentModal = React$1.forwardRef((i, a) => {
	let o = useDialogContext(CONTENT_NAME, i.__scopeDialog), s = React$1.useRef(null), c = useComposedRefs(a, o.contentRef, s);
	return React$1.useEffect(() => {
		let i = s.current;
		if (i) return hideOthers(i);
	}, []), /* @__PURE__ */ jsx(DialogContentImpl, {
		...i,
		ref: c,
		trapFocus: o.open,
		disableOutsidePointerEvents: !0,
		onCloseAutoFocus: composeEventHandlers(i.onCloseAutoFocus, (i) => {
			i.preventDefault(), o.triggerRef.current?.focus();
		}),
		onPointerDownOutside: composeEventHandlers(i.onPointerDownOutside, (i) => {
			let a = i.detail.originalEvent, o = a.button === 0 && a.ctrlKey === !0;
			(a.button === 2 || o) && i.preventDefault();
		}),
		onFocusOutside: composeEventHandlers(i.onFocusOutside, (i) => i.preventDefault())
	});
}), DialogContentNonModal = React$1.forwardRef((i, a) => {
	let o = useDialogContext(CONTENT_NAME, i.__scopeDialog), s = React$1.useRef(!1), c = React$1.useRef(!1);
	return /* @__PURE__ */ jsx(DialogContentImpl, {
		...i,
		ref: a,
		trapFocus: !1,
		disableOutsidePointerEvents: !1,
		onCloseAutoFocus: (a) => {
			i.onCloseAutoFocus?.(a), a.defaultPrevented || (s.current || o.triggerRef.current?.focus(), a.preventDefault()), s.current = !1, c.current = !1;
		},
		onInteractOutside: (a) => {
			i.onInteractOutside?.(a), a.defaultPrevented || (s.current = !0, a.detail.originalEvent.type === "pointerdown" && (c.current = !0));
			let l = a.target;
			o.triggerRef.current?.contains(l) && a.preventDefault(), a.detail.originalEvent.type === "focusin" && c.current && a.preventDefault();
		}
	});
}), DialogContentImpl = React$1.forwardRef((i, a) => {
	let { __scopeDialog: o, trapFocus: s, onOpenAutoFocus: c, onCloseAutoFocus: l, ...u } = i, d = useDialogContext(CONTENT_NAME, o), f = React$1.useRef(null), p = useComposedRefs(a, f);
	return useFocusGuards(), /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(FocusScope, {
		asChild: !0,
		loop: !0,
		trapped: s,
		onMountAutoFocus: c,
		onUnmountAutoFocus: l,
		children: /* @__PURE__ */ jsx(DismissableLayer, {
			role: "dialog",
			id: d.contentId,
			"aria-describedby": d.descriptionId,
			"aria-labelledby": d.titleId,
			"data-state": getState(d.open),
			...u,
			ref: p,
			onDismiss: () => d.onOpenChange(!1)
		})
	}), /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(TitleWarning, { titleId: d.titleId }), /* @__PURE__ */ jsx(DescriptionWarning, {
		contentRef: f,
		descriptionId: d.descriptionId
	})] })] });
}), TITLE_NAME = "DialogTitle", DialogTitle = React$1.forwardRef((i, a) => {
	let { __scopeDialog: o, ...s } = i, c = useDialogContext(TITLE_NAME, o);
	return /* @__PURE__ */ jsx(Primitive.h2, {
		id: c.titleId,
		...s,
		ref: a
	});
});
DialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription", DialogDescription = React$1.forwardRef((i, a) => {
	let { __scopeDialog: o, ...s } = i, c = useDialogContext(DESCRIPTION_NAME, o);
	return /* @__PURE__ */ jsx(Primitive.p, {
		id: c.descriptionId,
		...s,
		ref: a
	});
});
DialogDescription.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose", DialogClose = React$1.forwardRef((i, a) => {
	let { __scopeDialog: o, ...s } = i, c = useDialogContext(CLOSE_NAME, o);
	return /* @__PURE__ */ jsx(Primitive.button, {
		type: "button",
		...s,
		ref: a,
		onClick: composeEventHandlers(i.onClick, () => c.onOpenChange(!1))
	});
});
DialogClose.displayName = CLOSE_NAME;
function getState(i) {
	return i ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning", [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
	contentName: CONTENT_NAME,
	titleName: TITLE_NAME,
	docsSlug: "dialog"
}), TitleWarning = ({ titleId: i }) => {
	let a = useWarningContext(TITLE_WARNING_NAME), o = `\`${a.contentName}\` requires a \`${a.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${a.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${a.docsSlug}`;
	return React$1.useEffect(() => {
		i && (document.getElementById(i) || console.error(o));
	}, [o, i]), null;
}, DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning", DescriptionWarning = ({ contentRef: i, descriptionId: a }) => {
	let o = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${useWarningContext(DESCRIPTION_WARNING_NAME).contentName}}.`;
	return React$1.useEffect(() => {
		let s = i.current?.getAttribute("aria-describedby");
		a && s && (document.getElementById(a) || console.warn(o));
	}, [
		o,
		i,
		a
	]), null;
}, Root = Dialog, Trigger = DialogTrigger, Portal$1 = DialogPortal, Overlay = DialogOverlay, Content = DialogContent, Title = DialogTitle, Description = DialogDescription, Close = DialogClose;
function Sheet({ ...i }) {
	return /* @__PURE__ */ jsx(Root, {
		"data-slot": "sheet",
		...i
	});
}
function SheetTrigger({ ...i }) {
	return /* @__PURE__ */ jsx(Trigger, {
		"data-slot": "sheet-trigger",
		...i
	});
}
function SheetPortal({ ...i }) {
	return /* @__PURE__ */ jsx(Portal$1, {
		"data-slot": "sheet-portal",
		...i
	});
}
function SheetOverlay({ className: i, ...a }) {
	return /* @__PURE__ */ jsx(Overlay, {
		"data-slot": "sheet-overlay",
		className: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", i),
		...a
	});
}
function SheetContent({ className: i, children: a, side: o = "right", ...s }) {
	return /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(Content, {
		"data-slot": "sheet-content",
		className: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500", o === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm", o === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", o === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b", o === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t", i),
		...s,
		children: [a, /* @__PURE__ */ jsxs(Close, {
			className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
			children: [/* @__PURE__ */ jsx(X, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className: i, ...a }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-1.5 p-4", i),
		...a
	});
}
function SheetTitle({ className: i, ...a }) {
	return /* @__PURE__ */ jsx(Title, {
		"data-slot": "sheet-title",
		className: cn("text-foreground font-semibold", i),
		...a
	});
}
function SheetDescription({ className: i, ...a }) {
	return /* @__PURE__ */ jsx(Description, {
		"data-slot": "sheet-description",
		className: cn("text-muted-foreground text-sm", i),
		...a
	});
}
function AgentChat({ baseUrl: i, agent: a = "default", userId: o, enableStreaming: s = !0, suggestions: c = [], onError: l, onRateResponse: u, className: d, showSettings: f = !0, showHeader: p = !0, placeholder: m = "", direction: h = "right", input: g, setInput: _, model: v }) {
	let [y, b] = useState([]), [x, S] = useState(""), C = g === void 0 ? x : g, w = (i) => {
		g === void 0 && S(i), _?.(i);
	}, [T, E] = useState(!1), [O, A] = useState([]), [j, M] = useState(null), [N, P] = useState(a), [I, z] = useState(v || ""), [B, V] = useState([]), [U, W] = useState([]), [G, K] = useState(!1), [q, J] = useState([]), [Y, Z] = useState(null);
	useEffect(() => {
		(async () => {
			try {
				let a = new AgentClient({
					baseUrl: i,
					agent: N,
					getInfo: !0
				});
				await a.retrieveInfo(), M(a), a.info && (V(a.info.agents), W(a.info.models), I || z(a.info.default_model));
			} catch (i) {
				i instanceof Error && l?.(i);
			}
		})();
	}, [i, l]), useEffect(() => {
		if (j) try {
			j.updateAgent(N, !0);
		} catch (i) {
			console.warn("Could not update agent yet", i);
		}
	}, [N, j]);
	let Q = useCallback(async () => {
		if (j) try {
			let i = await j.listThreads(20, 0, o);
			console.log("Thread List", i), J(i);
		} catch (i) {
			console.error("Failed to fetch history", i);
		}
	}, [j, o]), $ = async (i) => {
		if (j) try {
			E(!0), b((await j.getHistory({ thread_id: i })).messages.map((i) => ({
				id: i.id || crypto.randomUUID(),
				role: i.type === "human" ? "user" : "assistant",
				content: i.content,
				createdAt: /* @__PURE__ */ new Date()
			}))), Z(i), K(!1);
		} catch (i) {
			i instanceof Error && l?.(i);
		} finally {
			E(!1);
		}
	}, Pj = () => {
		b([]), A([]), Z(null), w(""), K(!1);
	}, Fj = (i) => {
		let a = i.match(/(?:```(?:json)?\s*)?({\s*"questions":\s*\[.*?\]\s*})(?:\s*```)?/s);
		if (a) try {
			let o = a[1];
			return {
				suggestions: JSON.parse(o).questions || [],
				cleanContent: i.replace(a[0], "").trim()
			};
		} catch (i) {
			console.error("Failed to parse followup JSON", i);
		}
		let o = i.match(/\[FOLLOWUP:\s*(.*?)\]/);
		return o ? {
			suggestions: o[1].split(",").map((i) => i.trim()).filter(Boolean),
			cleanContent: i.replace(/\[FOLLOWUP:\s*.*?\]/, "").trim()
		} : {
			suggestions: [],
			cleanContent: i
		};
	};
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex h-full w-full flex-col overflow-hidden", d),
		children: [p && /* @__PURE__ */ jsx("div", {
			className: "absolute top-0 left-0 right-0 z-30 transition-all duration-300",
			children: /* @__PURE__ */ jsx("div", {
				className: "mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between rounded-2xl border border-border/40 bg-background/60 p-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3.5 px-1.5",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "relative group",
							children: [
								/* @__PURE__ */ jsx("div", { className: "absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-primary/40 opacity-25 blur transition duration-300 group-hover:opacity-40" }),
								/* @__PURE__ */ jsx("div", {
									className: "relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg",
									children: /* @__PURE__ */ jsx(Sparkles, { className: "h-5.5 w-5.5" })
								}),
								/* @__PURE__ */ jsx("div", { className: "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" })
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-[15px] font-bold leading-tight tracking-tight text-foreground sm:text-base",
								children: "Agent Chat"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 mt-0.5",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex h-1.5 w-1.5",
									children: [/* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75" }), /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" })]
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
									children: [
										N,
										" ",
										/* @__PURE__ */ jsx("span", {
											className: "mx-1 opacity-30",
											children: "|"
										}),
										" ",
										I
									]
								})]
							})]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsxs(Sheet, {
								open: G,
								onOpenChange: K,
								children: [/* @__PURE__ */ jsx(SheetTrigger, {
									asChild: !0,
									children: /* @__PURE__ */ jsx(Button, {
										variant: "ghost",
										size: "icon",
										onClick: Q,
										title: "Chat History",
										className: "h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors",
										children: /* @__PURE__ */ jsx(History, { className: "h-4.5 w-4.5" })
									})
								}), /* @__PURE__ */ jsxs(SheetContent, {
									side: h,
									className: "w-[300px] sm:w-[400px] border-l border-border/40 backdrop-blur-2xl",
									children: [
										/* @__PURE__ */ jsxs(SheetHeader, {
											className: "mb-6",
											children: [/* @__PURE__ */ jsx(SheetTitle, {
												className: "text-xl font-bold tracking-tight",
												children: "Chat History"
											}), /* @__PURE__ */ jsx(SheetDescription, {
												className: "text-sm",
												children: "Select a previous conversation to continue."
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "px-2",
											children: /* @__PURE__ */ jsxs(Button, {
												variant: "outline",
												className: "w-full justify-start gap-2.5 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium",
												onClick: Pj,
												children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " New Conversation"]
											})
										}),
										/* @__PURE__ */ jsx("div", {
											className: "flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-2 mt-6 custom-scrollbar",
											children: q.length === 0 ? /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col items-center justify-center py-12 px-4 text-center",
												children: [
													/* @__PURE__ */ jsx("div", {
														className: "h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/40",
														children: /* @__PURE__ */ jsx(History, { className: "h-6 w-6" })
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-sm font-medium text-muted-foreground",
														children: "No recent conversations"
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-xs text-muted-foreground/60 mt-1",
														children: "Start chatting to see history here."
													})
												]
											}) : q.map((i) => /* @__PURE__ */ jsxs("button", {
												className: cn("group flex flex-col gap-1 w-full text-left p-3.5 rounded-xl transition-all duration-200 border border-transparent", Y === i.thread_id ? "bg-primary/5 border-primary/20 shadow-sm" : "hover:bg-muted/50 hover:border-border/50"),
												onClick: () => $(i.thread_id),
												children: [/* @__PURE__ */ jsx("span", {
													className: cn("font-semibold truncate text-[13px]", Y === i.thread_id ? "text-primary" : "text-foreground"),
													children: i.title || "Untitled Conversation"
												}), /* @__PURE__ */ jsxs("span", {
													className: "text-[11px] text-muted-foreground flex items-center gap-2",
													children: [
														i.updated_at ? new Date(i.updated_at).toLocaleDateString(void 0, {
															month: "short",
															day: "numeric",
															year: "numeric"
														}) : "Recently",
														/* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-muted-foreground/30" }),
														i.updated_at ? new Date(i.updated_at).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit"
														}) : ""
													]
												})]
											}, i.thread_id))
										})
									]
								})]
							}),
							/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "icon",
								onClick: Pj,
								title: "New Chat",
								className: "h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors",
								children: /* @__PURE__ */ jsx(Plus, { className: "h-4.5 w-4.5" })
							}),
							f && /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
								asChild: !0,
								children: /* @__PURE__ */ jsx(Button, {
									variant: "ghost",
									size: "icon",
									className: "h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors",
									children: /* @__PURE__ */ jsx(Settings2, { className: "h-4.5 w-4.5" })
								})
							}), /* @__PURE__ */ jsx(PopoverContent, {
								align: "end",
								className: "w-[280px] p-5 rounded-2xl shadow-2xl border-border/40 backdrop-blur-2xl ring-1 ring-black/5",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-5",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsx("h4", {
											className: "font-bold text-base leading-none tracking-tight",
											children: "Configuration"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-xs text-muted-foreground/80 leading-relaxed",
											children: "Customize your AI agent and model settings for the current session."
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "grid gap-4",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex flex-col gap-2",
											children: [/* @__PURE__ */ jsx("label", {
												className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5",
												children: "Active Agent"
											}), /* @__PURE__ */ jsxs(Select, {
												value: N,
												onValueChange: P,
												children: [/* @__PURE__ */ jsx(SelectTrigger, {
													className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20",
													children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Agent" })
												}), /* @__PURE__ */ jsxs(SelectContent, {
													className: "rounded-xl border-border/40 shadow-xl",
													children: [B.map((i) => /* @__PURE__ */ jsx(SelectItem, {
														value: i.key,
														className: "text-xs rounded-md my-0.5",
														children: i.key
													}, i.key)), B.length === 0 && /* @__PURE__ */ jsx(SelectItem, {
														value: N || "default",
														children: N || "Default"
													})]
												})]
											})]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex flex-col gap-2",
											children: [/* @__PURE__ */ jsx("label", {
												className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5",
												children: "LLM Model"
											}), /* @__PURE__ */ jsxs(Select, {
												value: I,
												onValueChange: z,
												children: [/* @__PURE__ */ jsx(SelectTrigger, {
													className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20",
													children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Model" })
												}), /* @__PURE__ */ jsxs(SelectContent, {
													className: "rounded-xl border-border/40 shadow-xl",
													children: [U.map((i) => /* @__PURE__ */ jsx(SelectItem, {
														value: i,
														className: "text-xs rounded-md my-0.5",
														children: i
													}, i)), U.length === 0 && /* @__PURE__ */ jsx(SelectItem, {
														value: I || "default",
														children: I || "Default"
													})]
												})]
											})]
										})]
									})]
								})
							})] })
						]
					})]
				})
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "flex-1 overflow-hidden relative bg-background pt-24",
			children: /* @__PURE__ */ jsx(Chat, {
				messages: y,
				handleSubmit: async (i) => {
					if (i?.preventDefault?.(), !C.trim() || !j) return;
					let a = {
						id: crypto.randomUUID(),
						role: "user",
						content: C,
						createdAt: /* @__PURE__ */ new Date()
					};
					b((i) => [...i, a]), w(""), A([]), E(!0);
					let c = Y || crypto.randomUUID();
					Y || Z(c);
					let u = {
						thread_id: c,
						user_id: o
					};
					try {
						if (s) {
							let i = j.stream({
								message: a.content,
								model: I || void 0,
								...u
							}), o = null;
							for await (let a of i) if (typeof a == "string") b((i) => {
								let s = o, c = i[i.length - 1];
								if (s && c && c.id === s && c.role === "assistant" && !c.toolInvocations) return i.map((i) => i.id === s ? {
									...i,
									content: i.content + a
								} : i);
								{
									let s = crypto.randomUUID();
									return o = s, [...i, {
										id: s,
										role: "assistant",
										content: a,
										createdAt: /* @__PURE__ */ new Date()
									}];
								}
							});
							else if (typeof a == "object" && a) {
								let i = a;
								if (i.tool_calls && i.tool_calls.length > 0) {
									let a = i.tool_calls.some((i) => i.name.includes("sub-agent")) ? "subagent" : "tool", s = i.tool_calls.map((i) => ({
										state: "call",
										toolName: i.name,
										toolCallId: i.id || crypto.randomUUID()
									}));
									o = null, b((o) => [...o, {
										id: crypto.randomUUID(),
										role: a,
										content: i.content || "",
										toolInvocations: s,
										createdAt: /* @__PURE__ */ new Date()
									}]);
								} else i.type === "tool" && i.content ? (o = null, b((a) => [...a, {
									id: crypto.randomUUID(),
									role: "tool",
									content: i.content,
									createdAt: /* @__PURE__ */ new Date()
								}])) : i.content && b((a) => {
									let s = o, c = a[a.length - 1];
									if (s && c && c.id === s && c.role === "assistant" && !c.toolInvocations) return a.map((a) => a.id === s ? {
										...a,
										content: a.content + i.content
									} : a);
									{
										let s = crypto.randomUUID();
										return o = s, [...a, {
											id: s,
											role: "assistant",
											content: i.content,
											createdAt: /* @__PURE__ */ new Date()
										}];
									}
								});
							}
							b((i) => {
								let a = i[i.length - 1];
								if (a && a.role === "assistant") {
									let { suggestions: o, cleanContent: s } = Fj(a.content);
									if (o.length > 0) return A(o), i.map((a, o) => o === i.length - 1 ? {
										...a,
										content: s
									} : a);
								}
								return i;
							});
						} else {
							let i = await j.invoke({
								message: a.content,
								model: I || void 0,
								...u
							});
							if (i.suggestions && i.suggestions.length > 0) A(i.suggestions);
							else {
								let { suggestions: a } = Fj(i.content || "");
								a.length > 0 && A(a);
							}
							b((a) => [...a, {
								id: i.id || crypto.randomUUID(),
								role: "assistant",
								content: i.content,
								createdAt: /* @__PURE__ */ new Date()
							}]);
						}
					} catch (i) {
						i instanceof Error && l?.(i), b((i) => [...i, {
							id: crypto.randomUUID(),
							role: "assistant",
							content: "Error processing request. Please try again.",
							createdAt: /* @__PURE__ */ new Date()
						}]);
					} finally {
						E(!1), Q();
					}
				},
				input: C,
				handleInputChange: (i) => {
					w(i.target.value);
				},
				isGenerating: T,
				stop: () => {},
				append: async (i) => {
					w(i.content), b((a) => [...a, {
						...i,
						id: crypto.randomUUID(),
						createdAt: /* @__PURE__ */ new Date()
					}]), E(!0);
					let a = Y || crypto.randomUUID();
					Y || Z(a);
					try {
						if (!j) return;
						let s = await j.invoke({
							message: i.content,
							model: I || void 0,
							thread_id: a,
							user_id: o
						}), { suggestions: c, cleanContent: l } = Fj(s.content || "");
						c.length > 0 && A(c), b((i) => [...i, {
							id: s.id || crypto.randomUUID(),
							role: "assistant",
							content: l,
							createdAt: /* @__PURE__ */ new Date()
						}]);
					} catch (i) {
						i instanceof Error && l?.(i);
					} finally {
						E(!1), Q();
					}
				},
				suggestions: y.length === 0 ? c : O,
				onRateResponse: u,
				placeholder: m
			})
		})]
	});
}
function PopupChatbot({ buttonClassName: i, windowClassName: a, ...o }) {
	let [s, c] = useState(!1);
	return /* @__PURE__ */ jsxs(Popover, {
		open: s,
		onOpenChange: c,
		children: [/* @__PURE__ */ jsx(PopoverTrigger, {
			asChild: !0,
			children: /* @__PURE__ */ jsx(Button, {
				className: cn("fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50", s ? "rotate-90 bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "rotate-0", i),
				size: "icon",
				children: jsx(s ? X : MessageCircle, { className: "h-6 w-6" })
			})
		}), /* @__PURE__ */ jsx(PopoverContent, {
			className: cn("w-[90vw] sm:w-[400px] h-[80vh] sm:h-[600px] p-0 overflow-hidden rounded-2xl border border-border/50 shadow-2xl mr-4 mb-4", a),
			align: "end",
			sideOffset: 16,
			children: /* @__PURE__ */ jsx(AgentChat, {
				...o,
				className: "h-full w-full"
			})
		})]
	});
}
export { AgentChat, AgentChat as Chatbot, AgentChat as FullChatbot, AgentClient, AgentClientError, Button, Chat, ChatContainer, ChatForm, ChatMessage as ChatMessageComponent, ChatMessages, CopyButton, MarkdownRenderer, MessageInput, MessageList, PopupChatbot, PromptSuggestions, cn };
