import { jsx as v, Fragment as Vt, jsxs as _ } from "react/jsx-runtime";
import * as b from "react";
import V, { forwardRef as Qn, createElement as bi, useRef as ze, useState as ye, useEffect as Ze, createContext as er, useId as Gs, useContext as qe, useInsertionEffect as bd, useCallback as wn, useMemo as nn, Children as fg, isValidElement as di, useLayoutEffect as Ys, Fragment as xd, Component as hg, Suspense as pg } from "react";
import * as zi from "react-dom";
import wd from "react-dom";
class je extends Error {
  constructor(t) {
    super(t), this.name = "AgentClientError";
  }
}
class mg {
  baseUrl;
  authSecret;
  timeout;
  _info = null;
  _agent = null;
  _initPromise = null;
  constructor(t) {
    const {
      baseUrl: n,
      agent: r,
      timeout: i,
      authSecret: o,
      getInfo: s = !0
    } = t;
    this.baseUrl = n, this.authSecret = o, this.timeout = i, s ? this._initPromise = this.retrieveInfo().then(() => {
      r && this.updateAgent(r, !1);
    }).catch((a) => {
      console.error("Error fetching service info:", a);
    }) : r && this.updateAgent(r, !0);
  }
  get headers() {
    const t = {
      "Content-Type": "application/json"
    };
    return this.authSecret && (t.Authorization = `Bearer ${this.authSecret}`), t;
  }
  get agent() {
    return this._agent;
  }
  get info() {
    return this._info;
  }
  async retrieveInfo() {
    try {
      const t = new AbortController(), n = this.timeout ? setTimeout(() => t.abort(), this.timeout) : void 0, r = await fetch(`${this.baseUrl}/info`, {
        headers: this.headers,
        signal: t.signal
      });
      if (n && clearTimeout(n), !r.ok)
        throw new je(`HTTP error! status: ${r.status}`);
      this._info = await r.json(), (!this._agent || !this._info?.agents.some((i) => i.key === this._agent)) && (this._agent = this._info?.default_agent || null);
    } catch (t) {
      throw t instanceof Error ? new je(`Error getting service info: ${t.message}`) : t;
    }
  }
  updateAgent(t, n = !1) {
    if (!n) {
      if (!this._info)
        throw new je(
          "Service info not loaded. Call retrieveInfo() first or set getInfo to true in constructor."
        );
      const r = this._info.agents.map((i) => i.key);
      if (!r.includes(t))
        throw new je(
          `Agent ${t} not found in available agents: ${r.join(", ")}`
        );
    }
    this._agent = t;
  }
  async invoke(t) {
    if (this._initPromise && await this._initPromise, !this._agent)
      throw new je("No agent selected. Use updateAgent() to select an agent.");
    try {
      const n = new AbortController(), r = this.timeout ? setTimeout(() => n.abort(), this.timeout) : void 0, i = await fetch(`${this.baseUrl}/${this._agent}/invoke`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(t),
        signal: n.signal
      });
      if (r && clearTimeout(r), !i.ok)
        throw new je(`HTTP error! status: ${i.status}`);
      return await i.json();
    } catch (n) {
      throw n instanceof Error ? new je(`Error invoking agent: ${n.message}`) : n;
    }
  }
  parseStreamLine(t) {
    const n = t.trim();
    if (n.startsWith("data: ")) {
      const r = n.substring(6);
      if (r === "[DONE]")
        return null;
      try {
        const i = JSON.parse(r);
        switch (i.type) {
          case "message":
            return i.content;
          case "token":
            return i.content;
          case "error":
            return {
              type: "ai",
              content: `Error: ${i.content}`
            };
          default:
            return null;
        }
      } catch (i) {
        return console.error("Error parsing stream event:", i), null;
      }
    }
    return null;
  }
  async *stream(t) {
    if (this._initPromise && await this._initPromise, !this._agent)
      throw new je("No agent selected. Use updateAgent() to select an agent.");
    const n = {
      ...t,
      stream_tokens: t.stream_tokens ?? !0
    };
    try {
      const r = new AbortController(), i = this.timeout ? setTimeout(() => r.abort(), this.timeout) : void 0, o = await fetch(`${this.baseUrl}/${this._agent}/stream`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(n),
        signal: r.signal
      });
      if (i && clearTimeout(i), !o.ok)
        throw new je(`HTTP error! status: ${o.status}`);
      if (!o.body)
        throw new je("Response body is null");
      const s = o.body.getReader(), a = new TextDecoder();
      let l = "";
      try {
        for (; ; ) {
          const { done: c, value: u } = await s.read();
          if (c) break;
          l += a.decode(u, { stream: !0 });
          const d = l.split(`
`);
          l = d.pop() || "";
          for (const h of d)
            if (h.trim()) {
              const f = this.parseStreamLine(h);
              if (f === null)
                return;
              f !== "" && (yield f);
            }
        }
      } finally {
        s.releaseLock();
      }
    } catch (r) {
      throw r instanceof Error ? new je(`Error streaming agent response: ${r.message}`) : r;
    }
  }
  async createFeedback(t) {
    try {
      const n = new AbortController(), r = this.timeout ? setTimeout(() => n.abort(), this.timeout) : void 0, i = await fetch(`${this.baseUrl}/feedback`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(t),
        signal: n.signal
      });
      if (r && clearTimeout(r), !i.ok)
        throw new je(`HTTP error! status: ${i.status}`);
    } catch (n) {
      throw n instanceof Error ? new je(`Error creating feedback: ${n.message}`) : n;
    }
  }
  async getHistory(t) {
    try {
      const n = new AbortController(), r = this.timeout ? setTimeout(() => n.abort(), this.timeout) : void 0, i = await fetch(`${this.baseUrl}/history`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(t),
        signal: n.signal
      });
      if (r && clearTimeout(r), !i.ok)
        throw new je(`HTTP error! status: ${i.status}`);
      return await i.json();
    } catch (n) {
      throw n instanceof Error ? new je(`Error getting chat history: ${n.message}`) : n;
    }
  }
  async listThreads(t = 20, n = 0, r) {
    try {
      const i = new AbortController(), o = this.timeout ? setTimeout(() => i.abort(), this.timeout) : void 0, s = {
        limit: t.toString(),
        offset: n.toString()
      };
      r && (s.user_id = r);
      const a = new URLSearchParams(s).toString(), l = await fetch(`${this.baseUrl}/threads?${a}`, {
        method: "GET",
        headers: this.headers,
        signal: i.signal
      });
      if (o && clearTimeout(o), !l.ok) {
        if (l.status === 404) return [];
        throw new je(`HTTP error! status: ${l.status}`);
      }
      return await l.json();
    } catch (i) {
      throw i instanceof Error ? new je(`Error listing threads: ${i.message}`) : i;
    }
  }
}
const gg = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Sd = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
var yg = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const vg = Qn(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: i = "",
    children: o,
    iconNode: s,
    ...a
  }, l) => bi(
    "svg",
    {
      ref: l,
      ...yg,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: Sd("lucide", i),
      ...a
    },
    [
      ...s.map(([c, u]) => bi(c, u)),
      ...Array.isArray(o) ? o : [o]
    ]
  )
);
const ge = (e, t) => {
  const n = Qn(
    ({ className: r, ...i }, o) => bi(vg, {
      ref: o,
      iconNode: t,
      className: Sd(`lucide-${gg(e)}`, r),
      ...i
    })
  );
  return n.displayName = `${e}`, n;
};
const bg = ge("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
const xg = ge("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
const wg = ge("Ban", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m4.9 4.9 14.2 14.2", key: "1m5liu" }]
]);
const Sg = ge("Bot", [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
]);
const xl = ge("Braces", [
  [
    "path",
    { d: "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1", key: "ezmyqa" }
  ],
  [
    "path",
    {
      d: "M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
      key: "e1hn23"
    }
  ]
]);
const kd = ge("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
const Cd = ge("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
const Td = ge("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
const kg = ge("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
const Cg = ge("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
const Tg = ge("CodeXml", [
  ["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }],
  ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
  ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]
]);
const Eg = ge("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
const wo = ge("Dot", [
  ["circle", { cx: "12.1", cy: "12.1", r: "1", key: "18d7e5" }]
]);
const Pg = ge("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
const wl = ge("History", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
]);
const Ag = ge("Info", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
]);
const Ed = ge("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
const Rg = ge("MessageCircle", [
  ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }]
]);
const Ng = ge("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
const Ig = ge("Mic", [
  ["path", { d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z", key: "131961" }],
  ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2", key: "1vc78b" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }]
]);
const Pd = ge("Paperclip", [
  [
    "path",
    {
      d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48",
      key: "1u3ebp"
    }
  ]
]);
const Sl = ge("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
const Dg = ge("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
const Mg = ge("Settings2", [
  ["path", { d: "M20 7h-9", key: "3s1dr2" }],
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
]);
const ji = ge("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
]);
const Og = ge("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
const Lg = ge("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
]);
const _g = ge("ThumbsDown", [
  ["path", { d: "M17 14V2", key: "8ymqnk" }],
  [
    "path",
    {
      d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
      key: "m61m77"
    }
  ]
]);
const Fg = ge("ThumbsUp", [
  ["path", { d: "M7 10v12", key: "1qc93n" }],
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ]
]);
const tr = ge("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Ad(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = Ad(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Rd() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Ad(e)) && (r && (r += " "), r += t);
  return r;
}
const Xs = "-", Vg = (e) => {
  const t = zg(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (s) => {
      const a = s.split(Xs);
      return a[0] === "" && a.length !== 1 && a.shift(), Nd(a, t) || Bg(s);
    },
    getConflictingClassGroupIds: (s, a) => {
      const l = n[s] || [];
      return a && r[s] ? [...l, ...r[s]] : l;
    }
  };
}, Nd = (e, t) => {
  if (e.length === 0)
    return t.classGroupId;
  const n = e[0], r = t.nextPart.get(n), i = r ? Nd(e.slice(1), r) : void 0;
  if (i)
    return i;
  if (t.validators.length === 0)
    return;
  const o = e.join(Xs);
  return t.validators.find(({
    validator: s
  }) => s(o))?.classGroupId;
}, kl = /^\[(.+)\]$/, Bg = (e) => {
  if (kl.test(e)) {
    const t = kl.exec(e)[1], n = t?.substring(0, t.indexOf(":"));
    if (n)
      return "arbitrary.." + n;
  }
}, zg = (e) => {
  const {
    theme: t,
    prefix: n
  } = e, r = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return $g(Object.entries(e.classGroups), n).forEach(([o, s]) => {
    ls(s, r, o, t);
  }), r;
}, ls = (e, t, n, r) => {
  e.forEach((i) => {
    if (typeof i == "string") {
      const o = i === "" ? t : Cl(t, i);
      o.classGroupId = n;
      return;
    }
    if (typeof i == "function") {
      if (jg(i)) {
        ls(i(r), t, n, r);
        return;
      }
      t.validators.push({
        validator: i,
        classGroupId: n
      });
      return;
    }
    Object.entries(i).forEach(([o, s]) => {
      ls(s, Cl(t, o), n, r);
    });
  });
}, Cl = (e, t) => {
  let n = e;
  return t.split(Xs).forEach((r) => {
    n.nextPart.has(r) || n.nextPart.set(r, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), n = n.nextPart.get(r);
  }), n;
}, jg = (e) => e.isThemeGetter, $g = (e, t) => t ? e.map(([n, r]) => {
  const i = r.map((o) => typeof o == "string" ? t + o : typeof o == "object" ? Object.fromEntries(Object.entries(o).map(([s, a]) => [t + s, a])) : o);
  return [n, i];
}) : e, Ug = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  const i = (o, s) => {
    n.set(o, s), t++, t > e && (t = 0, r = n, n = /* @__PURE__ */ new Map());
  };
  return {
    get(o) {
      let s = n.get(o);
      if (s !== void 0)
        return s;
      if ((s = r.get(o)) !== void 0)
        return i(o, s), s;
    },
    set(o, s) {
      n.has(o) ? n.set(o, s) : i(o, s);
    }
  };
}, Id = "!", Hg = (e) => {
  const {
    separator: t,
    experimentalParseClassName: n
  } = e, r = t.length === 1, i = t[0], o = t.length, s = (a) => {
    const l = [];
    let c = 0, u = 0, d;
    for (let y = 0; y < a.length; y++) {
      let g = a[y];
      if (c === 0) {
        if (g === i && (r || a.slice(y, y + o) === t)) {
          l.push(a.slice(u, y)), u = y + o;
          continue;
        }
        if (g === "/") {
          d = y;
          continue;
        }
      }
      g === "[" ? c++ : g === "]" && c--;
    }
    const h = l.length === 0 ? a : a.substring(u), f = h.startsWith(Id), m = f ? h.substring(1) : h, p = d && d > u ? d - u : void 0;
    return {
      modifiers: l,
      hasImportantModifier: f,
      baseClassName: m,
      maybePostfixModifierPosition: p
    };
  };
  return n ? (a) => n({
    className: a,
    parseClassName: s
  }) : s;
}, Wg = (e) => {
  if (e.length <= 1)
    return e;
  const t = [];
  let n = [];
  return e.forEach((r) => {
    r[0] === "[" ? (t.push(...n.sort(), r), n = []) : n.push(r);
  }), t.push(...n.sort()), t;
}, qg = (e) => ({
  cache: Ug(e.cacheSize),
  parseClassName: Hg(e),
  ...Vg(e)
}), Kg = /\s+/, Gg = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: i
  } = t, o = [], s = e.trim().split(Kg);
  let a = "";
  for (let l = s.length - 1; l >= 0; l -= 1) {
    const c = s[l], {
      modifiers: u,
      hasImportantModifier: d,
      baseClassName: h,
      maybePostfixModifierPosition: f
    } = n(c);
    let m = !!f, p = r(m ? h.substring(0, f) : h);
    if (!p) {
      if (!m) {
        a = c + (a.length > 0 ? " " + a : a);
        continue;
      }
      if (p = r(h), !p) {
        a = c + (a.length > 0 ? " " + a : a);
        continue;
      }
      m = !1;
    }
    const y = Wg(u).join(":"), g = d ? y + Id : y, x = g + p;
    if (o.includes(x))
      continue;
    o.push(x);
    const w = i(p, m);
    for (let P = 0; P < w.length; ++P) {
      const E = w[P];
      o.push(g + E);
    }
    a = c + (a.length > 0 ? " " + a : a);
  }
  return a;
};
function Yg() {
  let e = 0, t, n, r = "";
  for (; e < arguments.length; )
    (t = arguments[e++]) && (n = Dd(t)) && (r && (r += " "), r += n);
  return r;
}
const Dd = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = Dd(e[r])) && (n && (n += " "), n += t);
  return n;
};
function Xg(e, ...t) {
  let n, r, i, o = s;
  function s(l) {
    const c = t.reduce((u, d) => d(u), e());
    return n = qg(c), r = n.cache.get, i = n.cache.set, o = a, a(l);
  }
  function a(l) {
    const c = r(l);
    if (c)
      return c;
    const u = Gg(l, n);
    return i(l, u), u;
  }
  return function() {
    return o(Yg.apply(null, arguments));
  };
}
const Ee = (e) => {
  const t = (n) => n[e] || [];
  return t.isThemeGetter = !0, t;
}, Md = /^\[(?:([a-z-]+):)?(.+)\]$/i, Zg = /^\d+\/\d+$/, Jg = /* @__PURE__ */ new Set(["px", "full", "screen"]), Qg = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ey = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ty = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/, ny = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ry = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, _t = (e) => Un(e) || Jg.has(e) || Zg.test(e), Yt = (e) => nr(e, "length", dy), Un = (e) => !!e && !Number.isNaN(Number(e)), So = (e) => nr(e, "number", Un), fr = (e) => !!e && Number.isInteger(Number(e)), iy = (e) => e.endsWith("%") && Un(e.slice(0, -1)), ee = (e) => Md.test(e), Xt = (e) => Qg.test(e), oy = /* @__PURE__ */ new Set(["length", "size", "percentage"]), sy = (e) => nr(e, oy, Od), ay = (e) => nr(e, "position", Od), ly = /* @__PURE__ */ new Set(["image", "url"]), cy = (e) => nr(e, ly, hy), uy = (e) => nr(e, "", fy), hr = () => !0, nr = (e, t, n) => {
  const r = Md.exec(e);
  return r ? r[1] ? typeof t == "string" ? r[1] === t : t.has(r[1]) : n(r[2]) : !1;
}, dy = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  ey.test(e) && !ty.test(e)
), Od = () => !1, fy = (e) => ny.test(e), hy = (e) => ry.test(e), py = () => {
  const e = Ee("colors"), t = Ee("spacing"), n = Ee("blur"), r = Ee("brightness"), i = Ee("borderColor"), o = Ee("borderRadius"), s = Ee("borderSpacing"), a = Ee("borderWidth"), l = Ee("contrast"), c = Ee("grayscale"), u = Ee("hueRotate"), d = Ee("invert"), h = Ee("gap"), f = Ee("gradientColorStops"), m = Ee("gradientColorStopPositions"), p = Ee("inset"), y = Ee("margin"), g = Ee("opacity"), x = Ee("padding"), w = Ee("saturate"), P = Ee("scale"), E = Ee("sepia"), C = Ee("skew"), A = Ee("space"), N = Ee("translate"), L = () => ["auto", "contain", "none"], T = () => ["auto", "hidden", "clip", "visible", "scroll"], O = () => ["auto", ee, t], I = () => [ee, t], W = () => ["", _t, Yt], R = () => ["auto", Un, ee], M = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], B = () => ["solid", "dashed", "dotted", "double", "none"], z = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], $ = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], U = () => ["", "0", ee], S = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], oe = () => [Un, ee];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [hr],
      spacing: [_t, Yt],
      blur: ["none", "", Xt, ee],
      brightness: oe(),
      borderColor: [e],
      borderRadius: ["none", "", "full", Xt, ee],
      borderSpacing: I(),
      borderWidth: W(),
      contrast: oe(),
      grayscale: U(),
      hueRotate: oe(),
      invert: U(),
      gap: I(),
      gradientColorStops: [e],
      gradientColorStopPositions: [iy, Yt],
      inset: O(),
      margin: O(),
      opacity: oe(),
      padding: I(),
      saturate: oe(),
      scale: oe(),
      sepia: U(),
      skew: oe(),
      space: I(),
      translate: I()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", ee]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [Xt]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": S()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": S()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: [...M(), ee]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: T()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": T()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": T()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: L()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": L()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": L()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [p]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [p]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [p]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [p]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [p]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [p]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [p]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [p]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [p]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ["auto", fr, ee]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: O()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["wrap", "wrap-reverse", "nowrap"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ["1", "auto", "initial", "none", ee]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: U()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: U()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", fr, ee]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [hr]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", fr, ee]
        }, ee]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": R()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": R()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [hr]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [fr, ee]
        }, ee]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": R()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": R()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": ["auto", "min", "max", "fr", ee]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", ee]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [h]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": [h]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": [h]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: ["normal", ...$()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": ["start", "end", "center", "stretch"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", "start", "end", "center", "stretch"]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...$(), "baseline"]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", "start", "end", "center", "stretch", "baseline"]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": [...$(), "baseline"]
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", "start", "end", "center", "stretch"]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [x]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [x]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [x]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [x]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [x]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [x]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [x]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [x]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [x]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [y]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [y]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [y]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [y]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [y]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [y]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [y]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [y]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [y]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [A]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      "space-y": [{
        "space-y": [A]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-y-reverse": ["space-y-reverse"],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", ee, t]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [ee, t, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [ee, t, "none", "full", "min", "max", "fit", "prose", {
          screen: [Xt]
        }, Xt]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [ee, t, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [ee, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [ee, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [ee, t, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", Xt, Yt]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", So]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [hr]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", ee]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", Un, So]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", _t, ee]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", ee]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", ee]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: [e]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      "placeholder-opacity": [{
        "placeholder-opacity": [g]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: [e]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      "text-opacity": [{
        "text-opacity": [g]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...B(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", _t, Yt]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", _t, ee]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: [e]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: I()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", ee]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", ee]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      "bg-opacity": [{
        "bg-opacity": [g]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: [...M(), ay]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: ["no-repeat", {
          repeat: ["", "x", "y", "round", "space"]
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: ["auto", "cover", "contain", sy]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, cy]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: [e]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: [m]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [m]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [m]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [f]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [f]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [f]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [o]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": [o]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": [o]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": [o]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": [o]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": [o]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": [o]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": [o]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": [o]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": [o]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": [o]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": [o]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": [o]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": [o]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": [o]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: [a]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": [a]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": [a]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": [a]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": [a]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": [a]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": [a]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": [a]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": [a]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      "border-opacity": [{
        "border-opacity": [g]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...B(), "hidden"]
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x": [{
        "divide-x": [a]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y": [{
        "divide-y": [a]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      "divide-opacity": [{
        "divide-opacity": [g]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: B()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: [i]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": [i]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": [i]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": [i]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": [i]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": [i]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": [i]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": [i]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": [i]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: [i]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: ["", ...B()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [_t, ee]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [_t, Yt]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: [e]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w": [{
        ring: W()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      "ring-color": [{
        ring: [e]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      "ring-opacity": [{
        "ring-opacity": [g]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [_t, Yt]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      "ring-offset-color": [{
        "ring-offset": [e]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ["", "inner", "none", Xt, uy]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [hr]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [g]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...z(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": z()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ["", "none"]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [n]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [r]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [l]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": ["", "none", Xt, ee]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [c]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [u]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [d]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [w]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [E]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": ["", "none"]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": [n]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [r]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [l]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": [c]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [u]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": [d]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [g]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [w]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [E]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": [s]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": [s]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": [s]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", ee]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: oe()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", ee]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: oe()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", ee]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ["", "gpu", "none"]
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [P]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [P]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [P]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [fr, ee]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [N]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [N]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [C]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [C]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", ee]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ["auto", e]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", ee]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: [e]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["none", "auto"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "y", "x", ""]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": I()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": I()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": I()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": I()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": I()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": I()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": I()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": I()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": I()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": I()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": I()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": I()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": I()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": I()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": I()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": I()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": I()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": I()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", ee]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [e, "none"]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [_t, Yt, So]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [e, "none"]
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    }
  };
}, my = /* @__PURE__ */ Xg(py);
function ie(...e) {
  return my(Rd(e));
}
const gy = 50, yy = 10;
function vy(e) {
  const t = ze(null), n = ze(null), [r, i] = ye(!0), o = () => {
    t.current && (t.current.scrollTop = t.current.scrollHeight);
  }, s = () => {
    if (t.current) {
      const { scrollTop: l, scrollHeight: c, clientHeight: u } = t.current, d = Math.abs(
        c - l - u
      ), h = n.current ? l < n.current : !1, f = n.current ? n.current - l : 0;
      if (h && f > yy)
        i(!1);
      else {
        const p = d < gy;
        i(p);
      }
      n.current = l;
    }
  }, a = () => {
    i(!1);
  };
  return Ze(() => {
    t.current && (n.current = t.current.scrollTop);
  }, []), Ze(() => {
    r && o();
  }, e), {
    containerRef: t,
    scrollToBottom: o,
    handleScroll: s,
    shouldAutoScroll: r,
    handleTouchStart: a
  };
}
function Tl(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function An(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((i) => {
      const o = Tl(i, t);
      return !n && typeof o == "function" && (n = !0), o;
    });
    if (n)
      return () => {
        for (let i = 0; i < r.length; i++) {
          const o = r[i];
          typeof o == "function" ? o() : Tl(e[i], null);
        }
      };
  };
}
function Re(...e) {
  return b.useCallback(An(...e), e);
}
var by = /* @__PURE__ */ Symbol.for("react.lazy"), xi = b[" use ".trim().toString()];
function xy(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
function Ld(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === by && "_payload" in e && xy(e._payload);
}
// @__NO_SIDE_EFFECTS__
function wy(e) {
  const t = /* @__PURE__ */ ky(e), n = b.forwardRef((r, i) => {
    let { children: o, ...s } = r;
    Ld(o) && typeof xi == "function" && (o = xi(o._payload));
    const a = b.Children.toArray(o), l = a.find(Ty);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? b.Children.count(c) > 1 ? b.Children.only(null) : b.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ v(t, { ...s, ref: i, children: b.isValidElement(c) ? b.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ v(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
var Sy = /* @__PURE__ */ wy("Slot");
// @__NO_SIDE_EFFECTS__
function ky(e) {
  const t = b.forwardRef((n, r) => {
    let { children: i, ...o } = n;
    if (Ld(i) && typeof xi == "function" && (i = xi(i._payload)), b.isValidElement(i)) {
      const s = Py(i), a = Ey(o, i.props);
      return i.type !== b.Fragment && (a.ref = r ? An(r, s) : s), b.cloneElement(i, a);
    }
    return b.Children.count(i) > 1 ? b.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var Cy = /* @__PURE__ */ Symbol("radix.slottable");
function Ty(e) {
  return b.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Cy;
}
function Ey(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], o = t[r];
    /^on[A-Z]/.test(r) ? i && o ? n[r] = (...a) => {
      const l = o(...a);
      return i(...a), l;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...o } : r === "className" && (n[r] = [i, o].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function Py(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
const El = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, Pl = Rd, _d = (e, t) => (n) => {
  var r;
  if (t?.variants == null) return Pl(e, n?.class, n?.className);
  const { variants: i, defaultVariants: o } = t, s = Object.keys(i).map((c) => {
    const u = n?.[c], d = o?.[c];
    if (u === null) return null;
    const h = El(u) || El(d);
    return i[c][h];
  }), a = n && Object.entries(n).reduce((c, u) => {
    let [d, h] = u;
    return h === void 0 || (c[d] = h), c;
  }, {}), l = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((c, u) => {
    let { class: d, className: h, ...f } = u;
    return Object.entries(f).every((m) => {
      let [p, y] = m;
      return Array.isArray(y) ? y.includes({
        ...o,
        ...a
      }[p]) : {
        ...o,
        ...a
      }[p] === y;
    }) ? [
      ...c,
      d,
      h
    ] : c;
  }, []);
  return Pl(e, s, l, n?.class, n?.className);
}, Ay = _d(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
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
  }
);
function et({
  className: e,
  variant: t = "default",
  size: n = "default",
  asChild: r = !1,
  ...i
}) {
  return /* @__PURE__ */ v(
    r ? Sy : "button",
    {
      "data-slot": "button",
      "data-variant": t,
      "data-size": n,
      className: ie(Ay({ variant: t, size: n, className: e })),
      ...i
    }
  );
}
const Zs = er({});
function Js(e) {
  const t = ze(null);
  return t.current === null && (t.current = e()), t.current;
}
const $i = er(null), Qs = er({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
class Ry extends b.Component {
  getSnapshotBeforeUpdate(t) {
    const n = this.props.childRef.current;
    if (n && t.isPresent && !this.props.isPresent) {
      const r = this.props.sizeRef.current;
      r.height = n.offsetHeight || 0, r.width = n.offsetWidth || 0, r.top = n.offsetTop, r.left = n.offsetLeft;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function Ny({ children: e, isPresent: t }) {
  const n = Gs(), r = ze(null), i = ze({
    width: 0,
    height: 0,
    top: 0,
    left: 0
  }), { nonce: o } = qe(Qs);
  return bd(() => {
    const { width: s, height: a, top: l, left: c } = i.current;
    if (t || !r.current || !s || !a)
      return;
    r.current.dataset.motionPopId = n;
    const u = document.createElement("style");
    return o && (u.nonce = o), document.head.appendChild(u), u.sheet && u.sheet.insertRule(`
          [data-motion-pop-id="${n}"] {
            position: absolute !important;
            width: ${s}px !important;
            height: ${a}px !important;
            top: ${l}px !important;
            left: ${c}px !important;
          }
        `), () => {
      document.head.removeChild(u);
    };
  }, [t]), v(Ry, { isPresent: t, childRef: r, sizeRef: i, children: b.cloneElement(e, { ref: r }) });
}
const Iy = ({ children: e, initial: t, isPresent: n, onExitComplete: r, custom: i, presenceAffectsLayout: o, mode: s }) => {
  const a = Js(Dy), l = Gs(), c = wn((d) => {
    a.set(d, !0);
    for (const h of a.values())
      if (!h)
        return;
    r && r();
  }, [a, r]), u = nn(
    () => ({
      id: l,
      initial: t,
      isPresent: n,
      custom: i,
      onExitComplete: c,
      register: (d) => (a.set(d, !1), () => a.delete(d))
    }),
    /**
     * If the presence of a child affects the layout of the components around it,
     * we want to make a new context value to ensure they get re-rendered
     * so they can detect that layout change.
     */
    o ? [Math.random(), c] : [n, c]
  );
  return nn(() => {
    a.forEach((d, h) => a.set(h, !1));
  }, [n]), b.useEffect(() => {
    !n && !a.size && r && r();
  }, [n]), s === "popLayout" && (e = v(Ny, { isPresent: n, children: e })), v($i.Provider, { value: u, children: e });
};
function Dy() {
  return /* @__PURE__ */ new Map();
}
function Fd(e = !0) {
  const t = qe($i);
  if (t === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: i } = t, o = Gs();
  Ze(() => {
    e && i(o);
  }, [e]);
  const s = wn(() => e && r && r(o), [o, r, e]);
  return !n && r ? [!1, s] : [!0];
}
const Yr = (e) => e.key || "";
function Al(e) {
  const t = [];
  return fg.forEach(e, (n) => {
    di(n) && t.push(n);
  }), t;
}
const ea = typeof window < "u", Vd = ea ? Ys : Ze, Ui = ({ children: e, custom: t, initial: n = !0, onExitComplete: r, presenceAffectsLayout: i = !0, mode: o = "sync", propagate: s = !1 }) => {
  const [a, l] = Fd(s), c = nn(() => Al(e), [e]), u = s && !a ? [] : c.map(Yr), d = ze(!0), h = ze(c), f = Js(() => /* @__PURE__ */ new Map()), [m, p] = ye(c), [y, g] = ye(c);
  Vd(() => {
    d.current = !1, h.current = c;
    for (let P = 0; P < y.length; P++) {
      const E = Yr(y[P]);
      u.includes(E) ? f.delete(E) : f.get(E) !== !0 && f.set(E, !1);
    }
  }, [y, u.length, u.join("-")]);
  const x = [];
  if (c !== m) {
    let P = [...c];
    for (let E = 0; E < y.length; E++) {
      const C = y[E], A = Yr(C);
      u.includes(A) || (P.splice(E, 0, C), x.push(C));
    }
    o === "wait" && x.length && (P = x), g(Al(P)), p(c);
    return;
  }
  process.env.NODE_ENV !== "production" && o === "wait" && y.length > 1 && console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
  const { forceRender: w } = qe(Zs);
  return v(Vt, { children: y.map((P) => {
    const E = Yr(P), C = s && !a ? !1 : c === y || u.includes(E), A = () => {
      if (f.has(E))
        f.set(E, !0);
      else
        return;
      let N = !0;
      f.forEach((L) => {
        L || (N = !1);
      }), N && (w?.(), g(h.current), s && l?.(), r && r());
    };
    return v(Iy, { isPresent: C, initial: !d.current || n ? void 0 : !1, custom: C ? void 0 : t, presenceAffectsLayout: i, mode: o, onExitComplete: C ? void 0 : A, children: P }, E);
  }) });
}, tt = /* @__NO_SIDE_EFFECTS__ */ (e) => e;
let rr = tt, rn = tt;
process.env.NODE_ENV !== "production" && (rr = (e, t) => {
  !e && typeof console < "u" && console.warn(t);
}, rn = (e, t) => {
  if (!e)
    throw new Error(t);
});
// @__NO_SIDE_EFFECTS__
function ta(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
const Kn = /* @__NO_SIDE_EFFECTS__ */ (e, t, n) => {
  const r = t - e;
  return r === 0 ? 1 : (n - e) / r;
}, Rt = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Ft = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, My = {
  useManualTiming: !1
};
function Oy(e) {
  let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = !1, i = !1;
  const o = /* @__PURE__ */ new WeakSet();
  let s = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function a(c) {
    o.has(c) && (l.schedule(c), e()), c(s);
  }
  const l = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (c, u = !1, d = !1) => {
      const f = d && r ? t : n;
      return u && o.add(c), f.has(c) || f.add(c), c;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (c) => {
      n.delete(c), o.delete(c);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (c) => {
      if (s = c, r) {
        i = !0;
        return;
      }
      r = !0, [t, n] = [n, t], t.forEach(a), t.clear(), r = !1, i && (i = !1, l.process(c));
    }
  };
  return l;
}
const Xr = [
  "read",
  // Read
  "resolveKeyframes",
  // Write/Read/Write/Read
  "update",
  // Compute
  "preRender",
  // Compute
  "render",
  // Write
  "postRender"
  // Compute
], Ly = 40;
function Bd(e, t) {
  let n = !1, r = !0;
  const i = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, o = () => n = !0, s = Xr.reduce((g, x) => (g[x] = Oy(o), g), {}), { read: a, resolveKeyframes: l, update: c, preRender: u, render: d, postRender: h } = s, f = () => {
    const g = performance.now();
    n = !1, i.delta = r ? 1e3 / 60 : Math.max(Math.min(g - i.timestamp, Ly), 1), i.timestamp = g, i.isProcessing = !0, a.process(i), l.process(i), c.process(i), u.process(i), d.process(i), h.process(i), i.isProcessing = !1, n && t && (r = !1, e(f));
  }, m = () => {
    n = !0, r = !0, i.isProcessing || e(f);
  };
  return { schedule: Xr.reduce((g, x) => {
    const w = s[x];
    return g[x] = (P, E = !1, C = !1) => (n || m(), w.schedule(P, E, C)), g;
  }, {}), cancel: (g) => {
    for (let x = 0; x < Xr.length; x++)
      s[Xr[x]].cancel(g);
  }, state: i, steps: s };
}
const { schedule: Pe, cancel: on, state: $e, steps: ko } = Bd(typeof requestAnimationFrame < "u" ? requestAnimationFrame : tt, !0), zd = er({ strict: !1 }), Rl = {
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
  hover: ["whileHover", "onHoverStart", "onHoverEnd"],
  tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
  pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
  inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
  layout: ["layout", "layoutId"]
}, Gn = {};
for (const e in Rl)
  Gn[e] = {
    isEnabled: (t) => Rl[e].some((n) => !!t[n])
  };
function _y(e) {
  for (const t in e)
    Gn[t] = {
      ...Gn[t],
      ...e[t]
    };
}
const Fy = /* @__PURE__ */ new Set([
  "animate",
  "exit",
  "variants",
  "initial",
  "style",
  "values",
  "variants",
  "transition",
  "transformTemplate",
  "custom",
  "inherit",
  "onBeforeLayoutMeasure",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onDragStart",
  "onDrag",
  "onDragEnd",
  "onMeasureDragConstraints",
  "onDirectionLock",
  "onDragTransitionEnd",
  "_dragX",
  "_dragY",
  "onHoverStart",
  "onHoverEnd",
  "onViewportEnter",
  "onViewportLeave",
  "globalTapTarget",
  "ignoreStrict",
  "viewport"
]);
function wi(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || Fy.has(e);
}
let jd = (e) => !wi(e);
function Vy(e) {
  e && (jd = (t) => t.startsWith("on") ? !wi(t) : e(t));
}
try {
  Vy(require("@emotion/is-prop-valid").default);
} catch {
}
function By(e, t, n) {
  const r = {};
  for (const i in e)
    i === "values" && typeof e.values == "object" || (jd(i) || n === !0 && wi(i) || !t && !wi(i) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && i.startsWith("onDrag")) && (r[i] = e[i]);
  return r;
}
const Nl = /* @__PURE__ */ new Set();
function Hi(e, t, n) {
  e || Nl.has(t) || (console.warn(t), Nl.add(t));
}
function zy(e) {
  if (typeof Proxy > "u")
    return e;
  const t = /* @__PURE__ */ new Map(), n = (...r) => (process.env.NODE_ENV !== "production" && Hi(!1, "motion() is deprecated. Use motion.create() instead."), e(...r));
  return new Proxy(n, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (r, i) => i === "create" ? e : (t.has(i) || t.set(i, e(i)), t.get(i))
  });
}
const Wi = er({});
function Nr(e) {
  return typeof e == "string" || Array.isArray(e);
}
function qi(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
const na = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], ra = ["initial", ...na];
function Ki(e) {
  return qi(e.animate) || ra.some((t) => Nr(e[t]));
}
function $d(e) {
  return !!(Ki(e) || e.variants);
}
function jy(e, t) {
  if (Ki(e)) {
    const { initial: n, animate: r } = e;
    return {
      initial: n === !1 || Nr(n) ? n : void 0,
      animate: Nr(r) ? r : void 0
    };
  }
  return e.inherit !== !1 ? t : {};
}
function $y(e) {
  const { initial: t, animate: n } = jy(e, qe(Wi));
  return nn(() => ({ initial: t, animate: n }), [Il(t), Il(n)]);
}
function Il(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const Uy = /* @__PURE__ */ Symbol.for("motionComponentSymbol");
function Vn(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function Hy(e, t, n) {
  return wn(
    (r) => {
      r && e.onMount && e.onMount(r), t && (r ? t.mount(r) : t.unmount()), n && (typeof n == "function" ? n(r) : Vn(n) && (n.current = r));
    },
    /**
     * Only pass a new ref callback to React if we've received a visual element
     * factory. Otherwise we'll be mounting/remounting every time externalRef
     * or other dependencies change.
     */
    [t]
  );
}
const ia = (e) => e.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase(), Wy = "framerAppearId", Ud = "data-" + ia(Wy), { schedule: oa } = Bd(queueMicrotask, !1), Hd = er({});
function qy(e, t, n, r, i) {
  var o, s;
  const { visualElement: a } = qe(Wi), l = qe(zd), c = qe($i), u = qe(Qs).reducedMotion, d = ze(null);
  r = r || l.renderer, !d.current && r && (d.current = r(e, {
    visualState: t,
    parent: a,
    props: n,
    presenceContext: c,
    blockInitialAnimation: c ? c.initial === !1 : !1,
    reducedMotionConfig: u
  }));
  const h = d.current, f = qe(Hd);
  h && !h.projection && i && (h.type === "html" || h.type === "svg") && Ky(d.current, n, i, f);
  const m = ze(!1);
  bd(() => {
    h && m.current && h.update(n, c);
  });
  const p = n[Ud], y = ze(!!p && !(!((o = window.MotionHandoffIsComplete) === null || o === void 0) && o.call(window, p)) && ((s = window.MotionHasOptimisedAnimation) === null || s === void 0 ? void 0 : s.call(window, p)));
  return Vd(() => {
    h && (m.current = !0, window.MotionIsMounted = !0, h.updateFeatures(), oa.render(h.render), y.current && h.animationState && h.animationState.animateChanges());
  }), Ze(() => {
    h && (!y.current && h.animationState && h.animationState.animateChanges(), y.current && (queueMicrotask(() => {
      var g;
      (g = window.MotionHandoffMarkAsComplete) === null || g === void 0 || g.call(window, p);
    }), y.current = !1));
  }), h;
}
function Ky(e, t, n, r) {
  const { layoutId: i, layout: o, drag: s, dragConstraints: a, layoutScroll: l, layoutRoot: c } = t;
  e.projection = new n(e.latestValues, t["data-framer-portal-id"] ? void 0 : Wd(e.parent)), e.projection.setOptions({
    layoutId: i,
    layout: o,
    alwaysMeasureLayout: !!s || a && Vn(a),
    visualElement: e,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof o == "string" ? o : "both",
    initialPromotionConfig: r,
    layoutScroll: l,
    layoutRoot: c
  });
}
function Wd(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Wd(e.parent);
}
function Gy({ preloadedFeatures: e, createVisualElement: t, useRender: n, useVisualState: r, Component: i }) {
  var o, s;
  e && _y(e);
  function a(c, u) {
    let d;
    const h = {
      ...qe(Qs),
      ...c,
      layoutId: Yy(c)
    }, { isStatic: f } = h, m = $y(c), p = r(c, f);
    if (!f && ea) {
      Xy(h, e);
      const y = Zy(h);
      d = y.MeasureLayout, m.visualElement = qy(i, p, h, t, y.ProjectionNode);
    }
    return _(Wi.Provider, { value: m, children: [d && m.visualElement ? v(d, { visualElement: m.visualElement, ...h }) : null, n(i, c, Hy(p, m.visualElement, u), p, f, m.visualElement)] });
  }
  a.displayName = `motion.${typeof i == "string" ? i : `create(${(s = (o = i.displayName) !== null && o !== void 0 ? o : i.name) !== null && s !== void 0 ? s : ""})`}`;
  const l = Qn(a);
  return l[Uy] = i, l;
}
function Yy({ layoutId: e }) {
  const t = qe(Zs).id;
  return t && e !== void 0 ? t + "-" + e : e;
}
function Xy(e, t) {
  const n = qe(zd).strict;
  if (process.env.NODE_ENV !== "production" && t && n) {
    const r = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
    e.ignoreStrict ? rr(!1, r) : rn(!1, r);
  }
}
function Zy(e) {
  const { drag: t, layout: n } = Gn;
  if (!t && !n)
    return {};
  const r = { ...t, ...n };
  return {
    MeasureLayout: t?.isEnabled(e) || n?.isEnabled(e) ? r.MeasureLayout : void 0,
    ProjectionNode: r.ProjectionNode
  };
}
const Jy = [
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
function sa(e) {
  return (
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    typeof e != "string" || /**
     * If it contains a dash, the element is a custom HTML webcomponent.
     */
    e.includes("-") ? !1 : (
      /**
       * If it's in our list of lowercase SVG tags, it's an SVG component
       */
      !!(Jy.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function Dl(e) {
  const t = [{}, {}];
  return e?.values.forEach((n, r) => {
    t[0][r] = n.get(), t[1][r] = n.getVelocity();
  }), t;
}
function aa(e, t, n, r) {
  if (typeof t == "function") {
    const [i, o] = Dl(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
    const [i, o] = Dl(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  return t;
}
const cs = (e) => Array.isArray(e), Qy = (e) => !!(e && typeof e == "object" && e.mix && e.toValue), ev = (e) => cs(e) ? e[e.length - 1] || 0 : e, Ke = (e) => !!(e && e.getVelocity);
function fi(e) {
  const t = Ke(e) ? e.get() : e;
  return Qy(t) ? t.toValue() : t;
}
function tv({ scrapeMotionValuesFromProps: e, createRenderState: t, onUpdate: n }, r, i, o) {
  const s = {
    latestValues: nv(r, i, o, e),
    renderState: t()
  };
  return n && (s.onMount = (a) => n({ props: r, current: a, ...s }), s.onUpdate = (a) => n(a)), s;
}
const qd = (e) => (t, n) => {
  const r = qe(Wi), i = qe($i), o = () => tv(e, t, r, i);
  return n ? o() : Js(o);
};
function nv(e, t, n, r) {
  const i = {}, o = r(e, {});
  for (const h in o)
    i[h] = fi(o[h]);
  let { initial: s, animate: a } = e;
  const l = Ki(e), c = $d(e);
  t && c && !l && e.inherit !== !1 && (s === void 0 && (s = t.initial), a === void 0 && (a = t.animate));
  let u = n ? n.initial === !1 : !1;
  u = u || s === !1;
  const d = u ? a : s;
  if (d && typeof d != "boolean" && !qi(d)) {
    const h = Array.isArray(d) ? d : [d];
    for (let f = 0; f < h.length; f++) {
      const m = aa(e, h[f]);
      if (m) {
        const { transitionEnd: p, transition: y, ...g } = m;
        for (const x in g) {
          let w = g[x];
          if (Array.isArray(w)) {
            const P = u ? w.length - 1 : 0;
            w = w[P];
          }
          w !== null && (i[x] = w);
        }
        for (const x in p)
          i[x] = p[x];
      }
    }
  }
  return i;
}
const ir = [
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
], Rn = new Set(ir), Kd = (e) => (t) => typeof t == "string" && t.startsWith(e), Gd = /* @__PURE__ */ Kd("--"), rv = /* @__PURE__ */ Kd("var(--"), la = (e) => rv(e) ? iv.test(e.split("/*")[0].trim()) : !1, iv = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu, Yd = (e, t) => t && typeof e == "number" ? t.transform(e) : e, Bt = (e, t, n) => n > t ? t : n < e ? e : n, or = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, Ir = {
  ...or,
  transform: (e) => Bt(0, 1, e)
}, Zr = {
  ...or,
  default: 1
}, zr = (e) => ({
  test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: (t) => `${t}${e}`
}), Qt = /* @__PURE__ */ zr("deg"), Nt = /* @__PURE__ */ zr("%"), Y = /* @__PURE__ */ zr("px"), ov = /* @__PURE__ */ zr("vh"), sv = /* @__PURE__ */ zr("vw"), Ml = {
  ...Nt,
  parse: (e) => Nt.parse(e) / 100,
  transform: (e) => Nt.transform(e * 100)
}, av = {
  // Border props
  borderWidth: Y,
  borderTopWidth: Y,
  borderRightWidth: Y,
  borderBottomWidth: Y,
  borderLeftWidth: Y,
  borderRadius: Y,
  radius: Y,
  borderTopLeftRadius: Y,
  borderTopRightRadius: Y,
  borderBottomRightRadius: Y,
  borderBottomLeftRadius: Y,
  // Positioning props
  width: Y,
  maxWidth: Y,
  height: Y,
  maxHeight: Y,
  top: Y,
  right: Y,
  bottom: Y,
  left: Y,
  // Spacing props
  padding: Y,
  paddingTop: Y,
  paddingRight: Y,
  paddingBottom: Y,
  paddingLeft: Y,
  margin: Y,
  marginTop: Y,
  marginRight: Y,
  marginBottom: Y,
  marginLeft: Y,
  // Misc
  backgroundPositionX: Y,
  backgroundPositionY: Y
}, lv = {
  rotate: Qt,
  rotateX: Qt,
  rotateY: Qt,
  rotateZ: Qt,
  scale: Zr,
  scaleX: Zr,
  scaleY: Zr,
  scaleZ: Zr,
  skew: Qt,
  skewX: Qt,
  skewY: Qt,
  distance: Y,
  translateX: Y,
  translateY: Y,
  translateZ: Y,
  x: Y,
  y: Y,
  z: Y,
  perspective: Y,
  transformPerspective: Y,
  opacity: Ir,
  originX: Ml,
  originY: Ml,
  originZ: Y
}, Ol = {
  ...or,
  transform: Math.round
}, ca = {
  ...av,
  ...lv,
  zIndex: Ol,
  size: Y,
  // SVG
  fillOpacity: Ir,
  strokeOpacity: Ir,
  numOctaves: Ol
}, cv = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, uv = ir.length;
function dv(e, t, n) {
  let r = "", i = !0;
  for (let o = 0; o < uv; o++) {
    const s = ir[o], a = e[s];
    if (a === void 0)
      continue;
    let l = !0;
    if (typeof a == "number" ? l = a === (s.startsWith("scale") ? 1 : 0) : l = parseFloat(a) === 0, !l || n) {
      const c = Yd(a, ca[s]);
      if (!l) {
        i = !1;
        const u = cv[s] || s;
        r += `${u}(${c}) `;
      }
      n && (t[s] = c);
    }
  }
  return r = r.trim(), n ? r = n(t, i ? "" : r) : i && (r = "none"), r;
}
function ua(e, t, n) {
  const { style: r, vars: i, transformOrigin: o } = e;
  let s = !1, a = !1;
  for (const l in t) {
    const c = t[l];
    if (Rn.has(l)) {
      s = !0;
      continue;
    } else if (Gd(l)) {
      i[l] = c;
      continue;
    } else {
      const u = Yd(c, ca[l]);
      l.startsWith("origin") ? (a = !0, o[l] = u) : r[l] = u;
    }
  }
  if (t.transform || (s || n ? r.transform = dv(t, e.transform, n) : r.transform && (r.transform = "none")), a) {
    const { originX: l = "50%", originY: c = "50%", originZ: u = 0 } = o;
    r.transformOrigin = `${l} ${c} ${u}`;
  }
}
const fv = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, hv = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function pv(e, t, n = 1, r = 0, i = !0) {
  e.pathLength = 1;
  const o = i ? fv : hv;
  e[o.offset] = Y.transform(-r);
  const s = Y.transform(t), a = Y.transform(n);
  e[o.array] = `${s} ${a}`;
}
function Ll(e, t, n) {
  return typeof e == "string" ? e : Y.transform(t + n * e);
}
function mv(e, t, n) {
  const r = Ll(t, e.x, e.width), i = Ll(n, e.y, e.height);
  return `${r} ${i}`;
}
function da(e, {
  attrX: t,
  attrY: n,
  attrScale: r,
  originX: i,
  originY: o,
  pathLength: s,
  pathSpacing: a = 1,
  pathOffset: l = 0,
  // This is object creation, which we try to avoid per-frame.
  ...c
}, u, d) {
  if (ua(e, c, d), u) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: h, style: f, dimensions: m } = e;
  h.transform && (m && (f.transform = h.transform), delete h.transform), m && (i !== void 0 || o !== void 0 || f.transform) && (f.transformOrigin = mv(m, i !== void 0 ? i : 0.5, o !== void 0 ? o : 0.5)), t !== void 0 && (h.x = t), n !== void 0 && (h.y = n), r !== void 0 && (h.scale = r), s !== void 0 && pv(h, s, a, l, !1);
}
const fa = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
}), Xd = () => ({
  ...fa(),
  attrs: {}
}), ha = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function Zd(e, { style: t, vars: n }, r, i) {
  Object.assign(e.style, t, i && i.getProjectionStyles(r));
  for (const o in n)
    e.style.setProperty(o, n[o]);
}
const Jd = /* @__PURE__ */ new Set([
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
function Qd(e, t, n, r) {
  Zd(e, t, void 0, r);
  for (const i in t.attrs)
    e.setAttribute(Jd.has(i) ? i : ia(i), t.attrs[i]);
}
const Si = {};
function gv(e) {
  Object.assign(Si, e);
}
function ef(e, { layout: t, layoutId: n }) {
  return Rn.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!Si[e] || e === "opacity");
}
function pa(e, t, n) {
  var r;
  const { style: i } = e, o = {};
  for (const s in i)
    (Ke(i[s]) || t.style && Ke(t.style[s]) || ef(s, e) || ((r = n?.getValue(s)) === null || r === void 0 ? void 0 : r.liveStyle) !== void 0) && (o[s] = i[s]);
  return o;
}
function tf(e, t, n) {
  const r = pa(e, t, n);
  for (const i in e)
    if (Ke(e[i]) || Ke(t[i])) {
      const o = ir.indexOf(i) !== -1 ? "attr" + i.charAt(0).toUpperCase() + i.substring(1) : i;
      r[o] = e[i];
    }
  return r;
}
function yv(e, t) {
  try {
    t.dimensions = typeof e.getBBox == "function" ? e.getBBox() : e.getBoundingClientRect();
  } catch {
    t.dimensions = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }
}
const _l = ["x", "y", "width", "height", "cx", "cy", "r"], vv = {
  useVisualState: qd({
    scrapeMotionValuesFromProps: tf,
    createRenderState: Xd,
    onUpdate: ({ props: e, prevProps: t, current: n, renderState: r, latestValues: i }) => {
      if (!n)
        return;
      let o = !!e.drag;
      if (!o) {
        for (const a in i)
          if (Rn.has(a)) {
            o = !0;
            break;
          }
      }
      if (!o)
        return;
      let s = !t;
      if (t)
        for (let a = 0; a < _l.length; a++) {
          const l = _l[a];
          e[l] !== t[l] && (s = !0);
        }
      s && Pe.read(() => {
        yv(n, r), Pe.render(() => {
          da(r, i, ha(n.tagName), e.transformTemplate), Qd(n, r);
        });
      });
    }
  })
}, bv = {
  useVisualState: qd({
    scrapeMotionValuesFromProps: pa,
    createRenderState: fa
  })
};
function nf(e, t, n) {
  for (const r in t)
    !Ke(t[r]) && !ef(r, n) && (e[r] = t[r]);
}
function xv({ transformTemplate: e }, t) {
  return nn(() => {
    const n = fa();
    return ua(n, t, e), Object.assign({}, n.vars, n.style);
  }, [t]);
}
function wv(e, t) {
  const n = e.style || {}, r = {};
  return nf(r, n, e), Object.assign(r, xv(e, t)), r;
}
function Sv(e, t) {
  const n = {}, r = wv(e, t);
  return e.drag && e.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
function kv(e, t, n, r) {
  const i = nn(() => {
    const o = Xd();
    return da(o, t, ha(r), e.transformTemplate), {
      ...o.attrs,
      style: { ...o.style }
    };
  }, [t]);
  if (e.style) {
    const o = {};
    nf(o, e.style, e), i.style = { ...o, ...i.style };
  }
  return i;
}
function Cv(e = !1) {
  return (n, r, i, { latestValues: o }, s) => {
    const l = (sa(n) ? kv : Sv)(r, o, s, n), c = By(r, typeof n == "string", e), u = n !== xd ? { ...c, ...l, ref: i } : {}, { children: d } = r, h = nn(() => Ke(d) ? d.get() : d, [d]);
    return bi(n, {
      ...u,
      children: h
    });
  };
}
function Tv(e, t) {
  return function(r, { forwardMotionProps: i } = { forwardMotionProps: !1 }) {
    const s = {
      ...sa(r) ? vv : bv,
      preloadedFeatures: e,
      useRender: Cv(i),
      createVisualElement: t,
      Component: r
    };
    return Gy(s);
  };
}
function rf(e, t) {
  if (!Array.isArray(t))
    return !1;
  const n = t.length;
  if (n !== e.length)
    return !1;
  for (let r = 0; r < n; r++)
    if (t[r] !== e[r])
      return !1;
  return !0;
}
function Gi(e, t, n) {
  const r = e.getProps();
  return aa(r, t, n !== void 0 ? n : r.custom, e);
}
const Ev = /* @__PURE__ */ ta(() => window.ScrollTimeline !== void 0);
class Pv {
  constructor(t) {
    this.stop = () => this.runAll("stop"), this.animations = t.filter(Boolean);
  }
  get finished() {
    return Promise.all(this.animations.map((t) => "finished" in t ? t.finished : t));
  }
  /**
   * TODO: Filter out cancelled or stopped animations before returning
   */
  getAll(t) {
    return this.animations[0][t];
  }
  setAll(t, n) {
    for (let r = 0; r < this.animations.length; r++)
      this.animations[r][t] = n;
  }
  attachTimeline(t, n) {
    const r = this.animations.map((i) => {
      if (Ev() && i.attachTimeline)
        return i.attachTimeline(t);
      if (typeof n == "function")
        return n(i);
    });
    return () => {
      r.forEach((i, o) => {
        i && i(), this.animations[o].stop();
      });
    };
  }
  get time() {
    return this.getAll("time");
  }
  set time(t) {
    this.setAll("time", t);
  }
  get speed() {
    return this.getAll("speed");
  }
  set speed(t) {
    this.setAll("speed", t);
  }
  get startTime() {
    return this.getAll("startTime");
  }
  get duration() {
    let t = 0;
    for (let n = 0; n < this.animations.length; n++)
      t = Math.max(t, this.animations[n].duration);
    return t;
  }
  runAll(t) {
    this.animations.forEach((n) => n[t]());
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
}
class Av extends Pv {
  then(t, n) {
    return Promise.all(this.animations).then(t).catch(n);
  }
}
function ma(e, t) {
  return e ? e[t] || e.default || e : void 0;
}
const us = 2e4;
function of(e) {
  let t = 0;
  const n = 50;
  let r = e.next(t);
  for (; !r.done && t < us; )
    t += n, r = e.next(t);
  return t >= us ? 1 / 0 : t;
}
function ga(e) {
  return typeof e == "function";
}
function Fl(e, t) {
  e.timeline = t, e.onfinish = null;
}
const ya = (e) => Array.isArray(e) && typeof e[0] == "number", Rv = {
  linearEasing: void 0
};
function Nv(e, t) {
  const n = /* @__PURE__ */ ta(e);
  return () => {
    var r;
    return (r = Rv[t]) !== null && r !== void 0 ? r : n();
  };
}
const ki = /* @__PURE__ */ Nv(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), sf = (e, t, n = 10) => {
  let r = "";
  const i = Math.max(Math.round(t / n), 2);
  for (let o = 0; o < i; o++)
    r += e(/* @__PURE__ */ Kn(0, i - 1, o)) + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
};
function af(e) {
  return !!(typeof e == "function" && ki() || !e || typeof e == "string" && (e in ds || ki()) || ya(e) || Array.isArray(e) && e.every(af));
}
const br = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`, ds = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ br([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ br([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ br([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ br([0.33, 1.53, 0.69, 0.99])
};
function lf(e, t) {
  if (e)
    return typeof e == "function" && ki() ? sf(e, t) : ya(e) ? br(e) : Array.isArray(e) ? e.map((n) => lf(n, t) || ds.easeOut) : ds[e];
}
const bt = {
  x: !1,
  y: !1
};
function cf() {
  return bt.x || bt.y;
}
function Iv(e, t, n) {
  var r;
  if (e instanceof Element)
    return [e];
  if (typeof e == "string") {
    let i = document;
    const o = (r = void 0) !== null && r !== void 0 ? r : i.querySelectorAll(e);
    return o ? Array.from(o) : [];
  }
  return Array.from(e);
}
function uf(e, t) {
  const n = Iv(e), r = new AbortController(), i = {
    passive: !0,
    ...t,
    signal: r.signal
  };
  return [n, i, () => r.abort()];
}
function Vl(e) {
  return (t) => {
    t.pointerType === "touch" || cf() || e(t);
  };
}
function Dv(e, t, n = {}) {
  const [r, i, o] = uf(e, n), s = Vl((a) => {
    const { target: l } = a, c = t(a);
    if (typeof c != "function" || !l)
      return;
    const u = Vl((d) => {
      c(d), l.removeEventListener("pointerleave", u);
    });
    l.addEventListener("pointerleave", u, i);
  });
  return r.forEach((a) => {
    a.addEventListener("pointerenter", s, i);
  }), o;
}
const df = (e, t) => t ? e === t ? !0 : df(e, t.parentElement) : !1, va = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, Mv = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function Ov(e) {
  return Mv.has(e.tagName) || e.tabIndex !== -1;
}
const xr = /* @__PURE__ */ new WeakSet();
function Bl(e) {
  return (t) => {
    t.key === "Enter" && e(t);
  };
}
function Co(e, t) {
  e.dispatchEvent(new PointerEvent("pointer" + t, { isPrimary: !0, bubbles: !0 }));
}
const Lv = (e, t) => {
  const n = e.currentTarget;
  if (!n)
    return;
  const r = Bl(() => {
    if (xr.has(n))
      return;
    Co(n, "down");
    const i = Bl(() => {
      Co(n, "up");
    }), o = () => Co(n, "cancel");
    n.addEventListener("keyup", i, t), n.addEventListener("blur", o, t);
  });
  n.addEventListener("keydown", r, t), n.addEventListener("blur", () => n.removeEventListener("keydown", r), t);
};
function zl(e) {
  return va(e) && !cf();
}
function _v(e, t, n = {}) {
  const [r, i, o] = uf(e, n), s = (a) => {
    const l = a.currentTarget;
    if (!zl(a) || xr.has(l))
      return;
    xr.add(l);
    const c = t(a), u = (f, m) => {
      window.removeEventListener("pointerup", d), window.removeEventListener("pointercancel", h), !(!zl(f) || !xr.has(l)) && (xr.delete(l), typeof c == "function" && c(f, { success: m }));
    }, d = (f) => {
      u(f, n.useGlobalTarget || df(l, f.target));
    }, h = (f) => {
      u(f, !1);
    };
    window.addEventListener("pointerup", d, i), window.addEventListener("pointercancel", h, i);
  };
  return r.forEach((a) => {
    !Ov(a) && a.getAttribute("tabindex") === null && (a.tabIndex = 0), (n.useGlobalTarget ? window : a).addEventListener("pointerdown", s, i), a.addEventListener("focus", (c) => Lv(c, i), i);
  }), o;
}
function Fv(e) {
  return e === "x" || e === "y" ? bt[e] ? null : (bt[e] = !0, () => {
    bt[e] = !1;
  }) : bt.x || bt.y ? null : (bt.x = bt.y = !0, () => {
    bt.x = bt.y = !1;
  });
}
const ff = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...ir
]);
let hi;
function Vv() {
  hi = void 0;
}
const It = {
  now: () => (hi === void 0 && It.set($e.isProcessing || My.useManualTiming ? $e.timestamp : performance.now()), hi),
  set: (e) => {
    hi = e, queueMicrotask(Vv);
  }
};
function ba(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function xa(e, t) {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
class wa {
  constructor() {
    this.subscriptions = [];
  }
  add(t) {
    return ba(this.subscriptions, t), () => xa(this.subscriptions, t);
  }
  notify(t, n, r) {
    const i = this.subscriptions.length;
    if (i)
      if (i === 1)
        this.subscriptions[0](t, n, r);
      else
        for (let o = 0; o < i; o++) {
          const s = this.subscriptions[o];
          s && s(t, n, r);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
function hf(e, t) {
  return t ? e * (1e3 / t) : 0;
}
const jl = 30, Bv = (e) => !isNaN(parseFloat(e));
class zv {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   *
   * @internal
   */
  constructor(t, n = {}) {
    this.version = "11.18.2", this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (r, i = !0) => {
      const o = It.now();
      this.updatedAt !== o && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && this.events.change && this.events.change.notify(this.current), i && this.events.renderRequest && this.events.renderRequest.notify(this.current);
    }, this.hasAnimated = !1, this.setCurrent(t), this.owner = n.owner;
  }
  setCurrent(t) {
    this.current = t, this.updatedAt = It.now(), this.canTrackVelocity === null && t !== void 0 && (this.canTrackVelocity = Bv(this.current));
  }
  setPrevFrameValue(t = this.current) {
    this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt;
  }
  /**
   * Adds a function that will be notified when the `MotionValue` is updated.
   *
   * It returns a function that, when called, will cancel the subscription.
   *
   * When calling `onChange` inside a React component, it should be wrapped with the
   * `useEffect` hook. As it returns an unsubscribe function, this should be returned
   * from the `useEffect` function to ensure you don't add duplicate subscribers..
   *
   * ```jsx
   * export const MyComponent = () => {
   *   const x = useMotionValue(0)
   *   const y = useMotionValue(0)
   *   const opacity = useMotionValue(1)
   *
   *   useEffect(() => {
   *     function updateOpacity() {
   *       const maxXY = Math.max(x.get(), y.get())
   *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
   *       opacity.set(newOpacity)
   *     }
   *
   *     const unsubscribeX = x.on("change", updateOpacity)
   *     const unsubscribeY = y.on("change", updateOpacity)
   *
   *     return () => {
   *       unsubscribeX()
   *       unsubscribeY()
   *     }
   *   }, [])
   *
   *   return <motion.div style={{ x }} />
   * }
   * ```
   *
   * @param subscriber - A function that receives the latest value.
   * @returns A function that, when called, will cancel this subscription.
   *
   * @deprecated
   */
  onChange(t) {
    return process.env.NODE_ENV !== "production" && Hi(!1, 'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'), this.on("change", t);
  }
  on(t, n) {
    this.events[t] || (this.events[t] = new wa());
    const r = this.events[t].add(n);
    return t === "change" ? () => {
      r(), Pe.read(() => {
        this.events.change.getSize() || this.stop();
      });
    } : r;
  }
  clearListeners() {
    for (const t in this.events)
      this.events[t].clear();
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   *
   * @internal
   */
  attach(t, n) {
    this.passiveEffect = t, this.stopPassiveEffect = n;
  }
  /**
   * Sets the state of the `MotionValue`.
   *
   * @remarks
   *
   * ```jsx
   * const x = useMotionValue(0)
   * x.set(10)
   * ```
   *
   * @param latest - Latest value to set.
   * @param render - Whether to notify render subscribers. Defaults to `true`
   *
   * @public
   */
  set(t, n = !0) {
    !n || !this.passiveEffect ? this.updateAndNotify(t, n) : this.passiveEffect(t, this.updateAndNotify);
  }
  setWithVelocity(t, n, r) {
    this.set(n), this.prev = void 0, this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt - r;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(t, n = !0) {
    this.updateAndNotify(t), this.prev = t, this.prevUpdatedAt = this.prevFrameValue = void 0, n && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
  /**
   * Returns the latest state of `MotionValue`
   *
   * @returns - The latest state of `MotionValue`
   *
   * @public
   */
  get() {
    return this.current;
  }
  /**
   * @public
   */
  getPrevious() {
    return this.prev;
  }
  /**
   * Returns the latest velocity of `MotionValue`
   *
   * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
   *
   * @public
   */
  getVelocity() {
    const t = It.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || t - this.updatedAt > jl)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, jl);
    return hf(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
  }
  /**
   * Registers a new animation to control this `MotionValue`. Only one
   * animation can drive a `MotionValue` at one time.
   *
   * ```jsx
   * value.start()
   * ```
   *
   * @param animation - A function that starts the provided animation
   *
   * @internal
   */
  start(t) {
    return this.stop(), new Promise((n) => {
      this.hasAnimated = !0, this.animation = t(n), this.events.animationStart && this.events.animationStart.notify();
    }).then(() => {
      this.events.animationComplete && this.events.animationComplete.notify(), this.clearAnimation();
    });
  }
  /**
   * Stop the currently active animation.
   *
   * @public
   */
  stop() {
    this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation();
  }
  /**
   * Returns `true` if this value is currently animating.
   *
   * @public
   */
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    delete this.animation;
  }
  /**
   * Destroy and clean up subscribers to this `MotionValue`.
   *
   * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
   * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
   * created a `MotionValue` via the `motionValue` function.
   *
   * @public
   */
  destroy() {
    this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
}
function Dr(e, t) {
  return new zv(e, t);
}
function jv(e, t, n) {
  e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, Dr(n));
}
function $v(e, t) {
  const n = Gi(e, t);
  let { transitionEnd: r = {}, transition: i = {}, ...o } = n || {};
  o = { ...o, ...r };
  for (const s in o) {
    const a = ev(o[s]);
    jv(e, s, a);
  }
}
function Uv(e) {
  return !!(Ke(e) && e.add);
}
function fs(e, t) {
  const n = e.getValue("willChange");
  if (Uv(n))
    return n.add(t);
}
function pf(e) {
  return e.props[Ud];
}
const mf = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e, Hv = 1e-7, Wv = 12;
function qv(e, t, n, r, i) {
  let o, s, a = 0;
  do
    s = t + (n - t) / 2, o = mf(s, r, i) - e, o > 0 ? n = s : t = s;
  while (Math.abs(o) > Hv && ++a < Wv);
  return s;
}
function jr(e, t, n, r) {
  if (e === t && n === r)
    return tt;
  const i = (o) => qv(o, 0, 1, e, n);
  return (o) => o === 0 || o === 1 ? o : mf(i(o), t, r);
}
const gf = (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, yf = (e) => (t) => 1 - e(1 - t), vf = /* @__PURE__ */ jr(0.33, 1.53, 0.69, 0.99), Sa = /* @__PURE__ */ yf(vf), bf = /* @__PURE__ */ gf(Sa), xf = (e) => (e *= 2) < 1 ? 0.5 * Sa(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), ka = (e) => 1 - Math.sin(Math.acos(e)), wf = yf(ka), Sf = gf(ka), kf = (e) => /^0[^.\s]+$/u.test(e);
function Kv(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || kf(e) : !0;
}
const kr = (e) => Math.round(e * 1e5) / 1e5, Ca = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function Gv(e) {
  return e == null;
}
const Yv = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, Ta = (e, t) => (n) => !!(typeof n == "string" && Yv.test(n) && n.startsWith(e) || t && !Gv(n) && Object.prototype.hasOwnProperty.call(n, t)), Cf = (e, t, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [i, o, s, a] = r.match(Ca);
  return {
    [e]: parseFloat(i),
    [t]: parseFloat(o),
    [n]: parseFloat(s),
    alpha: a !== void 0 ? parseFloat(a) : 1
  };
}, Xv = (e) => Bt(0, 255, e), To = {
  ...or,
  transform: (e) => Math.round(Xv(e))
}, bn = {
  test: /* @__PURE__ */ Ta("rgb", "red"),
  parse: /* @__PURE__ */ Cf("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: n, alpha: r = 1 }) => "rgba(" + To.transform(e) + ", " + To.transform(t) + ", " + To.transform(n) + ", " + kr(Ir.transform(r)) + ")"
};
function Zv(e) {
  let t = "", n = "", r = "", i = "";
  return e.length > 5 ? (t = e.substring(1, 3), n = e.substring(3, 5), r = e.substring(5, 7), i = e.substring(7, 9)) : (t = e.substring(1, 2), n = e.substring(2, 3), r = e.substring(3, 4), i = e.substring(4, 5), t += t, n += n, r += r, i += i), {
    red: parseInt(t, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: i ? parseInt(i, 16) / 255 : 1
  };
}
const hs = {
  test: /* @__PURE__ */ Ta("#"),
  parse: Zv,
  transform: bn.transform
}, Bn = {
  test: /* @__PURE__ */ Ta("hsl", "hue"),
  parse: /* @__PURE__ */ Cf("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(e) + ", " + Nt.transform(kr(t)) + ", " + Nt.transform(kr(n)) + ", " + kr(Ir.transform(r)) + ")"
}, We = {
  test: (e) => bn.test(e) || hs.test(e) || Bn.test(e),
  parse: (e) => bn.test(e) ? bn.parse(e) : Bn.test(e) ? Bn.parse(e) : hs.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? bn.transform(e) : Bn.transform(e)
}, Jv = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function Qv(e) {
  var t, n;
  return isNaN(e) && typeof e == "string" && (((t = e.match(Ca)) === null || t === void 0 ? void 0 : t.length) || 0) + (((n = e.match(Jv)) === null || n === void 0 ? void 0 : n.length) || 0) > 0;
}
const Tf = "number", Ef = "color", eb = "var", tb = "var(", $l = "${}", nb = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Mr(e) {
  const t = e.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, i = [];
  let o = 0;
  const a = t.replace(nb, (l) => (We.test(l) ? (r.color.push(o), i.push(Ef), n.push(We.parse(l))) : l.startsWith(tb) ? (r.var.push(o), i.push(eb), n.push(l)) : (r.number.push(o), i.push(Tf), n.push(parseFloat(l))), ++o, $l)).split($l);
  return { values: n, split: a, indexes: r, types: i };
}
function Pf(e) {
  return Mr(e).values;
}
function Af(e) {
  const { split: t, types: n } = Mr(e), r = t.length;
  return (i) => {
    let o = "";
    for (let s = 0; s < r; s++)
      if (o += t[s], i[s] !== void 0) {
        const a = n[s];
        a === Tf ? o += kr(i[s]) : a === Ef ? o += We.transform(i[s]) : o += i[s];
      }
    return o;
  };
}
const rb = (e) => typeof e == "number" ? 0 : e;
function ib(e) {
  const t = Pf(e);
  return Af(e)(t.map(rb));
}
const sn = {
  test: Qv,
  parse: Pf,
  createTransformer: Af,
  getAnimatableNone: ib
}, ob = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function sb(e) {
  const [t, n] = e.slice(0, -1).split("(");
  if (t === "drop-shadow")
    return e;
  const [r] = n.match(Ca) || [];
  if (!r)
    return e;
  const i = n.replace(r, "");
  let o = ob.has(t) ? 1 : 0;
  return r !== n && (o *= 100), t + "(" + o + i + ")";
}
const ab = /\b([a-z-]*)\(.*?\)/gu, ps = {
  ...sn,
  getAnimatableNone: (e) => {
    const t = e.match(ab);
    return t ? t.map(sb).join(" ") : e;
  }
}, lb = {
  ...ca,
  // Color props
  color: We,
  backgroundColor: We,
  outlineColor: We,
  fill: We,
  stroke: We,
  // Border props
  borderColor: We,
  borderTopColor: We,
  borderRightColor: We,
  borderBottomColor: We,
  borderLeftColor: We,
  filter: ps,
  WebkitFilter: ps
}, Ea = (e) => lb[e];
function Rf(e, t) {
  let n = Ea(e);
  return n !== ps && (n = sn), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0;
}
const cb = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function ub(e, t, n) {
  let r = 0, i;
  for (; r < e.length && !i; ) {
    const o = e[r];
    typeof o == "string" && !cb.has(o) && Mr(o).values.length && (i = e[r]), r++;
  }
  if (i && n)
    for (const o of t)
      e[o] = Rf(n, i);
}
const Ul = (e) => e === or || e === Y, Hl = (e, t) => parseFloat(e.split(", ")[t]), Wl = (e, t) => (n, { transform: r }) => {
  if (r === "none" || !r)
    return 0;
  const i = r.match(/^matrix3d\((.+)\)$/u);
  if (i)
    return Hl(i[1], t);
  {
    const o = r.match(/^matrix\((.+)\)$/u);
    return o ? Hl(o[1], e) : 0;
  }
}, db = /* @__PURE__ */ new Set(["x", "y", "z"]), fb = ir.filter((e) => !db.has(e));
function hb(e) {
  const t = [];
  return fb.forEach((n) => {
    const r = e.getValue(n);
    r !== void 0 && (t.push([n, r.get()]), r.set(n.startsWith("scale") ? 1 : 0));
  }), t;
}
const Yn = {
  // Dimensions
  width: ({ x: e }, { paddingLeft: t = "0", paddingRight: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  height: ({ y: e }, { paddingTop: t = "0", paddingBottom: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  top: (e, { top: t }) => parseFloat(t),
  left: (e, { left: t }) => parseFloat(t),
  bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
  right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
  // Transform
  x: Wl(4, 13),
  y: Wl(5, 14)
};
Yn.translateX = Yn.x;
Yn.translateY = Yn.y;
const xn = /* @__PURE__ */ new Set();
let ms = !1, gs = !1;
function Nf() {
  if (gs) {
    const e = Array.from(xn).filter((r) => r.needsMeasurement), t = new Set(e.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    t.forEach((r) => {
      const i = hb(r);
      i.length && (n.set(r, i), r.render());
    }), e.forEach((r) => r.measureInitialState()), t.forEach((r) => {
      r.render();
      const i = n.get(r);
      i && i.forEach(([o, s]) => {
        var a;
        (a = r.getValue(o)) === null || a === void 0 || a.set(s);
      });
    }), e.forEach((r) => r.measureEndState()), e.forEach((r) => {
      r.suspendedScrollY !== void 0 && window.scrollTo(0, r.suspendedScrollY);
    });
  }
  gs = !1, ms = !1, xn.forEach((e) => e.complete()), xn.clear();
}
function If() {
  xn.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (gs = !0);
  });
}
function pb() {
  If(), Nf();
}
class Pa {
  constructor(t, n, r, i, o, s = !1) {
    this.isComplete = !1, this.isAsync = !1, this.needsMeasurement = !1, this.isScheduled = !1, this.unresolvedKeyframes = [...t], this.onComplete = n, this.name = r, this.motionValue = i, this.element = o, this.isAsync = s;
  }
  scheduleResolve() {
    this.isScheduled = !0, this.isAsync ? (xn.add(this), ms || (ms = !0, Pe.read(If), Pe.resolveKeyframes(Nf))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: t, name: n, element: r, motionValue: i } = this;
    for (let o = 0; o < t.length; o++)
      if (t[o] === null)
        if (o === 0) {
          const s = i?.get(), a = t[t.length - 1];
          if (s !== void 0)
            t[0] = s;
          else if (r && n) {
            const l = r.readValue(n, a);
            l != null && (t[0] = l);
          }
          t[0] === void 0 && (t[0] = a), i && s === void 0 && i.set(t[0]);
        } else
          t[o] = t[o - 1];
  }
  setFinalKeyframe() {
  }
  measureInitialState() {
  }
  renderEndStyles() {
  }
  measureEndState() {
  }
  complete() {
    this.isComplete = !0, this.onComplete(this.unresolvedKeyframes, this.finalKeyframe), xn.delete(this);
  }
  cancel() {
    this.isComplete || (this.isScheduled = !1, xn.delete(this));
  }
  resume() {
    this.isComplete || this.scheduleResolve();
  }
}
const Df = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), mb = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function gb(e) {
  const t = mb.exec(e);
  if (!t)
    return [,];
  const [, n, r, i] = t;
  return [`--${n ?? r}`, i];
}
const yb = 4;
function Mf(e, t, n = 1) {
  rn(n <= yb, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`);
  const [r, i] = gb(e);
  if (!r)
    return;
  const o = window.getComputedStyle(t).getPropertyValue(r);
  if (o) {
    const s = o.trim();
    return Df(s) ? parseFloat(s) : s;
  }
  return la(i) ? Mf(i, t, n + 1) : i;
}
const Of = (e) => (t) => t.test(e), vb = {
  test: (e) => e === "auto",
  parse: (e) => e
}, Lf = [or, Y, Nt, Qt, sv, ov, vb], ql = (e) => Lf.find(Of(e));
class _f extends Pa {
  constructor(t, n, r, i, o) {
    super(t, n, r, i, o, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: t, element: n, name: r } = this;
    if (!n || !n.current)
      return;
    super.readKeyframes();
    for (let l = 0; l < t.length; l++) {
      let c = t[l];
      if (typeof c == "string" && (c = c.trim(), la(c))) {
        const u = Mf(c, n.current);
        u !== void 0 && (t[l] = u), l === t.length - 1 && (this.finalKeyframe = c);
      }
    }
    if (this.resolveNoneKeyframes(), !ff.has(r) || t.length !== 2)
      return;
    const [i, o] = t, s = ql(i), a = ql(o);
    if (s !== a)
      if (Ul(s) && Ul(a))
        for (let l = 0; l < t.length; l++) {
          const c = t[l];
          typeof c == "string" && (t[l] = parseFloat(c));
        }
      else
        this.needsMeasurement = !0;
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: t, name: n } = this, r = [];
    for (let i = 0; i < t.length; i++)
      Kv(t[i]) && r.push(i);
    r.length && ub(t, r, n);
  }
  measureInitialState() {
    const { element: t, unresolvedKeyframes: n, name: r } = this;
    if (!t || !t.current)
      return;
    r === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = Yn[r](t.measureViewportBox(), window.getComputedStyle(t.current)), n[0] = this.measuredOrigin;
    const i = n[n.length - 1];
    i !== void 0 && t.getValue(r, i).jump(i, !1);
  }
  measureEndState() {
    var t;
    const { element: n, name: r, unresolvedKeyframes: i } = this;
    if (!n || !n.current)
      return;
    const o = n.getValue(r);
    o && o.jump(this.measuredOrigin, !1);
    const s = i.length - 1, a = i[s];
    i[s] = Yn[r](n.measureViewportBox(), window.getComputedStyle(n.current)), a !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = a), !((t = this.removedTransforms) === null || t === void 0) && t.length && this.removedTransforms.forEach(([l, c]) => {
      n.getValue(l).set(c);
    }), this.resolveNoneKeyframes();
  }
}
const Kl = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(sn.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function bb(e) {
  const t = e[0];
  if (e.length === 1)
    return !0;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t)
      return !0;
}
function xb(e, t, n, r) {
  const i = e[0];
  if (i === null)
    return !1;
  if (t === "display" || t === "visibility")
    return !0;
  const o = e[e.length - 1], s = Kl(i, t), a = Kl(o, t);
  return rr(s === a, `You are trying to animate ${t} from "${i}" to "${o}". ${i} is not an animatable value - to enable this animation set ${i} to a value animatable to ${o} via the \`style\` property.`), !s || !a ? !1 : bb(e) || (n === "spring" || ga(n)) && r;
}
const wb = (e) => e !== null;
function Yi(e, { repeat: t, repeatType: n = "loop" }, r) {
  const i = e.filter(wb), o = t && n !== "loop" && t % 2 === 1 ? 0 : i.length - 1;
  return !o || r === void 0 ? i[o] : r;
}
const Sb = 40;
class Ff {
  constructor({ autoplay: t = !0, delay: n = 0, type: r = "keyframes", repeat: i = 0, repeatDelay: o = 0, repeatType: s = "loop", ...a }) {
    this.isStopped = !1, this.hasAttemptedResolve = !1, this.createdAt = It.now(), this.options = {
      autoplay: t,
      delay: n,
      type: r,
      repeat: i,
      repeatDelay: o,
      repeatType: s,
      ...a
    }, this.updateFinishedPromise();
  }
  /**
   * This method uses the createdAt and resolvedAt to calculate the
   * animation startTime. *Ideally*, we would use the createdAt time as t=0
   * as the following frame would then be the first frame of the animation in
   * progress, which would feel snappier.
   *
   * However, if there's a delay (main thread work) between the creation of
   * the animation and the first commited frame, we prefer to use resolvedAt
   * to avoid a sudden jump into the animation.
   */
  calcStartTime() {
    return this.resolvedAt ? this.resolvedAt - this.createdAt > Sb ? this.resolvedAt : this.createdAt : this.createdAt;
  }
  /**
   * A getter for resolved data. If keyframes are not yet resolved, accessing
   * this.resolved will synchronously flush all pending keyframe resolvers.
   * This is a deoptimisation, but at its worst still batches read/writes.
   */
  get resolved() {
    return !this._resolved && !this.hasAttemptedResolve && pb(), this._resolved;
  }
  /**
   * A method to be called when the keyframes resolver completes. This method
   * will check if its possible to run the animation and, if not, skip it.
   * Otherwise, it will call initPlayback on the implementing class.
   */
  onKeyframesResolved(t, n) {
    this.resolvedAt = It.now(), this.hasAttemptedResolve = !0;
    const { name: r, type: i, velocity: o, delay: s, onComplete: a, onUpdate: l, isGenerator: c } = this.options;
    if (!c && !xb(t, r, i, o))
      if (s)
        this.options.duration = 0;
      else {
        l && l(Yi(t, this.options, n)), a && a(), this.resolveFinishedPromise();
        return;
      }
    const u = this.initPlayback(t, n);
    u !== !1 && (this._resolved = {
      keyframes: t,
      finalKeyframe: n,
      ...u
    }, this.onPostResolved());
  }
  onPostResolved() {
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(t, n) {
    return this.currentFinishedPromise.then(t, n);
  }
  flatten() {
    this.options.type = "keyframes", this.options.ease = "linear";
  }
  updateFinishedPromise() {
    this.currentFinishedPromise = new Promise((t) => {
      this.resolveFinishedPromise = t;
    });
  }
}
const De = (e, t, n) => e + (t - e) * n;
function Eo(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function kb({ hue: e, saturation: t, lightness: n, alpha: r }) {
  e /= 360, t /= 100, n /= 100;
  let i = 0, o = 0, s = 0;
  if (!t)
    i = o = s = n;
  else {
    const a = n < 0.5 ? n * (1 + t) : n + t - n * t, l = 2 * n - a;
    i = Eo(l, a, e + 1 / 3), o = Eo(l, a, e), s = Eo(l, a, e - 1 / 3);
  }
  return {
    red: Math.round(i * 255),
    green: Math.round(o * 255),
    blue: Math.round(s * 255),
    alpha: r
  };
}
function Ci(e, t) {
  return (n) => n > 0 ? t : e;
}
const Po = (e, t, n) => {
  const r = e * e, i = n * (t * t - r) + r;
  return i < 0 ? 0 : Math.sqrt(i);
}, Cb = [hs, bn, Bn], Tb = (e) => Cb.find((t) => t.test(e));
function Gl(e) {
  const t = Tb(e);
  if (rr(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`), !t)
    return !1;
  let n = t.parse(e);
  return t === Bn && (n = kb(n)), n;
}
const Yl = (e, t) => {
  const n = Gl(e), r = Gl(t);
  if (!n || !r)
    return Ci(e, t);
  const i = { ...n };
  return (o) => (i.red = Po(n.red, r.red, o), i.green = Po(n.green, r.green, o), i.blue = Po(n.blue, r.blue, o), i.alpha = De(n.alpha, r.alpha, o), bn.transform(i));
}, Eb = (e, t) => (n) => t(e(n)), $r = (...e) => e.reduce(Eb), ys = /* @__PURE__ */ new Set(["none", "hidden"]);
function Pb(e, t) {
  return ys.has(e) ? (n) => n <= 0 ? e : t : (n) => n >= 1 ? t : e;
}
function Ab(e, t) {
  return (n) => De(e, t, n);
}
function Aa(e) {
  return typeof e == "number" ? Ab : typeof e == "string" ? la(e) ? Ci : We.test(e) ? Yl : Ib : Array.isArray(e) ? Vf : typeof e == "object" ? We.test(e) ? Yl : Rb : Ci;
}
function Vf(e, t) {
  const n = [...e], r = n.length, i = e.map((o, s) => Aa(o)(o, t[s]));
  return (o) => {
    for (let s = 0; s < r; s++)
      n[s] = i[s](o);
    return n;
  };
}
function Rb(e, t) {
  const n = { ...e, ...t }, r = {};
  for (const i in n)
    e[i] !== void 0 && t[i] !== void 0 && (r[i] = Aa(e[i])(e[i], t[i]));
  return (i) => {
    for (const o in r)
      n[o] = r[o](i);
    return n;
  };
}
function Nb(e, t) {
  var n;
  const r = [], i = { color: 0, var: 0, number: 0 };
  for (let o = 0; o < t.values.length; o++) {
    const s = t.types[o], a = e.indexes[s][i[s]], l = (n = e.values[a]) !== null && n !== void 0 ? n : 0;
    r[o] = l, i[s]++;
  }
  return r;
}
const Ib = (e, t) => {
  const n = sn.createTransformer(t), r = Mr(e), i = Mr(t);
  return r.indexes.var.length === i.indexes.var.length && r.indexes.color.length === i.indexes.color.length && r.indexes.number.length >= i.indexes.number.length ? ys.has(e) && !i.values.length || ys.has(t) && !r.values.length ? Pb(e, t) : $r(Vf(Nb(r, i), i.values), n) : (rr(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`), Ci(e, t));
};
function Bf(e, t, n) {
  return typeof e == "number" && typeof t == "number" && typeof n == "number" ? De(e, t, n) : Aa(e)(e, t);
}
const Db = 5;
function zf(e, t, n) {
  const r = Math.max(t - Db, 0);
  return hf(n - e(r), t - r);
}
const Ie = {
  // Default spring physics
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  // Default duration/bounce-based options
  duration: 800,
  // in ms
  bounce: 0.3,
  visualDuration: 0.3,
  // in seconds
  // Rest thresholds
  restSpeed: {
    granular: 0.01,
    default: 2
  },
  restDelta: {
    granular: 5e-3,
    default: 0.5
  },
  // Limits
  minDuration: 0.01,
  // in seconds
  maxDuration: 10,
  // in seconds
  minDamping: 0.05,
  maxDamping: 1
}, Ao = 1e-3;
function Mb({ duration: e = Ie.duration, bounce: t = Ie.bounce, velocity: n = Ie.velocity, mass: r = Ie.mass }) {
  let i, o;
  rr(e <= /* @__PURE__ */ Rt(Ie.maxDuration), "Spring duration must be 10 seconds or less");
  let s = 1 - t;
  s = Bt(Ie.minDamping, Ie.maxDamping, s), e = Bt(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ Ft(e)), s < 1 ? (i = (c) => {
    const u = c * s, d = u * e, h = u - n, f = vs(c, s), m = Math.exp(-d);
    return Ao - h / f * m;
  }, o = (c) => {
    const d = c * s * e, h = d * n + n, f = Math.pow(s, 2) * Math.pow(c, 2) * e, m = Math.exp(-d), p = vs(Math.pow(c, 2), s);
    return (-i(c) + Ao > 0 ? -1 : 1) * ((h - f) * m) / p;
  }) : (i = (c) => {
    const u = Math.exp(-c * e), d = (c - n) * e + 1;
    return -Ao + u * d;
  }, o = (c) => {
    const u = Math.exp(-c * e), d = (n - c) * (e * e);
    return u * d;
  });
  const a = 5 / e, l = Lb(i, o, a);
  if (e = /* @__PURE__ */ Rt(e), isNaN(l))
    return {
      stiffness: Ie.stiffness,
      damping: Ie.damping,
      duration: e
    };
  {
    const c = Math.pow(l, 2) * r;
    return {
      stiffness: c,
      damping: s * 2 * Math.sqrt(r * c),
      duration: e
    };
  }
}
const Ob = 12;
function Lb(e, t, n) {
  let r = n;
  for (let i = 1; i < Ob; i++)
    r = r - e(r) / t(r);
  return r;
}
function vs(e, t) {
  return e * Math.sqrt(1 - t * t);
}
const _b = ["duration", "bounce"], Fb = ["stiffness", "damping", "mass"];
function Xl(e, t) {
  return t.some((n) => e[n] !== void 0);
}
function Vb(e) {
  let t = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!Xl(e, Fb) && Xl(e, _b))
    if (e.visualDuration) {
      const n = e.visualDuration, r = 2 * Math.PI / (n * 1.2), i = r * r, o = 2 * Bt(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(i);
      t = {
        ...t,
        mass: Ie.mass,
        stiffness: i,
        damping: o
      };
    } else {
      const n = Mb(e);
      t = {
        ...t,
        ...n,
        mass: Ie.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function jf(e = Ie.visualDuration, t = Ie.bounce) {
  const n = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e;
  let { restSpeed: r, restDelta: i } = n;
  const o = n.keyframes[0], s = n.keyframes[n.keyframes.length - 1], a = { done: !1, value: o }, { stiffness: l, damping: c, mass: u, duration: d, velocity: h, isResolvedFromDuration: f } = Vb({
    ...n,
    velocity: -/* @__PURE__ */ Ft(n.velocity || 0)
  }), m = h || 0, p = c / (2 * Math.sqrt(l * u)), y = s - o, g = /* @__PURE__ */ Ft(Math.sqrt(l / u)), x = Math.abs(y) < 5;
  r || (r = x ? Ie.restSpeed.granular : Ie.restSpeed.default), i || (i = x ? Ie.restDelta.granular : Ie.restDelta.default);
  let w;
  if (p < 1) {
    const E = vs(g, p);
    w = (C) => {
      const A = Math.exp(-p * g * C);
      return s - A * ((m + p * g * y) / E * Math.sin(E * C) + y * Math.cos(E * C));
    };
  } else if (p === 1)
    w = (E) => s - Math.exp(-g * E) * (y + (m + g * y) * E);
  else {
    const E = g * Math.sqrt(p * p - 1);
    w = (C) => {
      const A = Math.exp(-p * g * C), N = Math.min(E * C, 300);
      return s - A * ((m + p * g * y) * Math.sinh(N) + E * y * Math.cosh(N)) / E;
    };
  }
  const P = {
    calculatedDuration: f && d || null,
    next: (E) => {
      const C = w(E);
      if (f)
        a.done = E >= d;
      else {
        let A = 0;
        p < 1 && (A = E === 0 ? /* @__PURE__ */ Rt(m) : zf(w, E, C));
        const N = Math.abs(A) <= r, L = Math.abs(s - C) <= i;
        a.done = N && L;
      }
      return a.value = a.done ? s : C, a;
    },
    toString: () => {
      const E = Math.min(of(P), us), C = sf((A) => P.next(E * A).value, E, 30);
      return E + "ms " + C;
    }
  };
  return P;
}
function Zl({ keyframes: e, velocity: t = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: i = 10, bounceStiffness: o = 500, modifyTarget: s, min: a, max: l, restDelta: c = 0.5, restSpeed: u }) {
  const d = e[0], h = {
    done: !1,
    value: d
  }, f = (N) => a !== void 0 && N < a || l !== void 0 && N > l, m = (N) => a === void 0 ? l : l === void 0 || Math.abs(a - N) < Math.abs(l - N) ? a : l;
  let p = n * t;
  const y = d + p, g = s === void 0 ? y : s(y);
  g !== y && (p = g - d);
  const x = (N) => -p * Math.exp(-N / r), w = (N) => g + x(N), P = (N) => {
    const L = x(N), T = w(N);
    h.done = Math.abs(L) <= c, h.value = h.done ? g : T;
  };
  let E, C;
  const A = (N) => {
    f(h.value) && (E = N, C = jf({
      keyframes: [h.value, m(h.value)],
      velocity: zf(w, N, h.value),
      // TODO: This should be passing * 1000
      damping: i,
      stiffness: o,
      restDelta: c,
      restSpeed: u
    }));
  };
  return A(0), {
    calculatedDuration: null,
    next: (N) => {
      let L = !1;
      return !C && E === void 0 && (L = !0, P(N), A(N)), E !== void 0 && N >= E ? C.next(N - E) : (!L && P(N), h);
    }
  };
}
const Bb = /* @__PURE__ */ jr(0.42, 0, 1, 1), zb = /* @__PURE__ */ jr(0, 0, 0.58, 1), $f = /* @__PURE__ */ jr(0.42, 0, 0.58, 1), jb = (e) => Array.isArray(e) && typeof e[0] != "number", Jl = {
  linear: tt,
  easeIn: Bb,
  easeInOut: $f,
  easeOut: zb,
  circIn: ka,
  circInOut: Sf,
  circOut: wf,
  backIn: Sa,
  backInOut: bf,
  backOut: vf,
  anticipate: xf
}, Ql = (e) => {
  if (ya(e)) {
    rn(e.length === 4, "Cubic bezier arrays must contain four numerical values.");
    const [t, n, r, i] = e;
    return jr(t, n, r, i);
  } else if (typeof e == "string")
    return rn(Jl[e] !== void 0, `Invalid easing type '${e}'`), Jl[e];
  return e;
};
function $b(e, t, n) {
  const r = [], i = n || Bf, o = e.length - 1;
  for (let s = 0; s < o; s++) {
    let a = i(e[s], e[s + 1]);
    if (t) {
      const l = Array.isArray(t) ? t[s] || tt : t;
      a = $r(l, a);
    }
    r.push(a);
  }
  return r;
}
function Ub(e, t, { clamp: n = !0, ease: r, mixer: i } = {}) {
  const o = e.length;
  if (rn(o === t.length, "Both input and output ranges must be the same length"), o === 1)
    return () => t[0];
  if (o === 2 && t[0] === t[1])
    return () => t[1];
  const s = e[0] === e[1];
  e[0] > e[o - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const a = $b(t, r, i), l = a.length, c = (u) => {
    if (s && u < e[0])
      return t[0];
    let d = 0;
    if (l > 1)
      for (; d < e.length - 2 && !(u < e[d + 1]); d++)
        ;
    const h = /* @__PURE__ */ Kn(e[d], e[d + 1], u);
    return a[d](h);
  };
  return n ? (u) => c(Bt(e[0], e[o - 1], u)) : c;
}
function Hb(e, t) {
  const n = e[e.length - 1];
  for (let r = 1; r <= t; r++) {
    const i = /* @__PURE__ */ Kn(0, t, r);
    e.push(De(n, 1, i));
  }
}
function Wb(e) {
  const t = [0];
  return Hb(t, e.length - 1), t;
}
function qb(e, t) {
  return e.map((n) => n * t);
}
function Kb(e, t) {
  return e.map(() => t || $f).splice(0, e.length - 1);
}
function Ti({ duration: e = 300, keyframes: t, times: n, ease: r = "easeInOut" }) {
  const i = jb(r) ? r.map(Ql) : Ql(r), o = {
    done: !1,
    value: t[0]
  }, s = qb(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === t.length ? n : Wb(t),
    e
  ), a = Ub(s, t, {
    ease: Array.isArray(i) ? i : Kb(t, i)
  });
  return {
    calculatedDuration: e,
    next: (l) => (o.value = a(l), o.done = l >= e, o)
  };
}
const Gb = (e) => {
  const t = ({ timestamp: n }) => e(n);
  return {
    start: () => Pe.update(t, !0),
    stop: () => on(t),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => $e.isProcessing ? $e.timestamp : It.now()
  };
}, Yb = {
  decay: Zl,
  inertia: Zl,
  tween: Ti,
  keyframes: Ti,
  spring: jf
}, Xb = (e) => e / 100;
class Ra extends Ff {
  constructor(t) {
    super(t), this.holdTime = null, this.cancelTime = null, this.currentTime = 0, this.playbackSpeed = 1, this.pendingPlayState = "running", this.startTime = null, this.state = "idle", this.stop = () => {
      if (this.resolver.cancel(), this.isStopped = !0, this.state === "idle")
        return;
      this.teardown();
      const { onStop: l } = this.options;
      l && l();
    };
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options, s = i?.KeyframeResolver || Pa, a = (l, c) => this.onKeyframesResolved(l, c);
    this.resolver = new s(o, a, n, r, i), this.resolver.scheduleResolve();
  }
  flatten() {
    super.flatten(), this._resolved && Object.assign(this._resolved, this.initPlayback(this._resolved.keyframes));
  }
  initPlayback(t) {
    const { type: n = "keyframes", repeat: r = 0, repeatDelay: i = 0, repeatType: o, velocity: s = 0 } = this.options, a = ga(n) ? n : Yb[n] || Ti;
    let l, c;
    a !== Ti && typeof t[0] != "number" && (process.env.NODE_ENV !== "production" && rn(t.length === 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${t}`), l = $r(Xb, Bf(t[0], t[1])), t = [0, 100]);
    const u = a({ ...this.options, keyframes: t });
    o === "mirror" && (c = a({
      ...this.options,
      keyframes: [...t].reverse(),
      velocity: -s
    })), u.calculatedDuration === null && (u.calculatedDuration = of(u));
    const { calculatedDuration: d } = u, h = d + i, f = h * (r + 1) - i;
    return {
      generator: u,
      mirroredGenerator: c,
      mapPercentToKeyframes: l,
      calculatedDuration: d,
      resolvedDuration: h,
      totalDuration: f
    };
  }
  onPostResolved() {
    const { autoplay: t = !0 } = this.options;
    this.play(), this.pendingPlayState === "paused" || !t ? this.pause() : this.state = this.pendingPlayState;
  }
  tick(t, n = !1) {
    const { resolved: r } = this;
    if (!r) {
      const { keyframes: N } = this.options;
      return { done: !0, value: N[N.length - 1] };
    }
    const { finalKeyframe: i, generator: o, mirroredGenerator: s, mapPercentToKeyframes: a, keyframes: l, calculatedDuration: c, totalDuration: u, resolvedDuration: d } = r;
    if (this.startTime === null)
      return o.next(0);
    const { delay: h, repeat: f, repeatType: m, repeatDelay: p, onUpdate: y } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, t) : this.speed < 0 && (this.startTime = Math.min(t - u / this.speed, this.startTime)), n ? this.currentTime = t : this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = Math.round(t - this.startTime) * this.speed;
    const g = this.currentTime - h * (this.speed >= 0 ? 1 : -1), x = this.speed >= 0 ? g < 0 : g > u;
    this.currentTime = Math.max(g, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = u);
    let w = this.currentTime, P = o;
    if (f) {
      const N = Math.min(this.currentTime, u) / d;
      let L = Math.floor(N), T = N % 1;
      !T && N >= 1 && (T = 1), T === 1 && L--, L = Math.min(L, f + 1), L % 2 && (m === "reverse" ? (T = 1 - T, p && (T -= p / d)) : m === "mirror" && (P = s)), w = Bt(0, 1, T) * d;
    }
    const E = x ? { done: !1, value: l[0] } : P.next(w);
    a && (E.value = a(E.value));
    let { done: C } = E;
    !x && c !== null && (C = this.speed >= 0 ? this.currentTime >= u : this.currentTime <= 0);
    const A = this.holdTime === null && (this.state === "finished" || this.state === "running" && C);
    return A && i !== void 0 && (E.value = Yi(l, this.options, i)), y && y(E.value), A && this.finish(), E;
  }
  get duration() {
    const { resolved: t } = this;
    return t ? /* @__PURE__ */ Ft(t.calculatedDuration) : 0;
  }
  get time() {
    return /* @__PURE__ */ Ft(this.currentTime);
  }
  set time(t) {
    t = /* @__PURE__ */ Rt(t), this.currentTime = t, this.holdTime !== null || this.speed === 0 ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.speed);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(t) {
    const n = this.playbackSpeed !== t;
    this.playbackSpeed = t, n && (this.time = /* @__PURE__ */ Ft(this.currentTime));
  }
  play() {
    if (this.resolver.isScheduled || this.resolver.resume(), !this._resolved) {
      this.pendingPlayState = "running";
      return;
    }
    if (this.isStopped)
      return;
    const { driver: t = Gb, onPlay: n, startTime: r } = this.options;
    this.driver || (this.driver = t((o) => this.tick(o))), n && n();
    const i = this.driver.now();
    this.holdTime !== null ? this.startTime = i - this.holdTime : this.startTime ? this.state === "finished" && (this.startTime = i) : this.startTime = r ?? this.calcStartTime(), this.state === "finished" && this.updateFinishedPromise(), this.cancelTime = this.startTime, this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    var t;
    if (!this._resolved) {
      this.pendingPlayState = "paused";
      return;
    }
    this.state = "paused", this.holdTime = (t = this.currentTime) !== null && t !== void 0 ? t : 0;
  }
  complete() {
    this.state !== "running" && this.play(), this.pendingPlayState = this.state = "finished", this.holdTime = null;
  }
  finish() {
    this.teardown(), this.state = "finished";
    const { onComplete: t } = this.options;
    t && t();
  }
  cancel() {
    this.cancelTime !== null && this.tick(this.cancelTime), this.teardown(), this.updateFinishedPromise();
  }
  teardown() {
    this.state = "idle", this.stopDriver(), this.resolveFinishedPromise(), this.updateFinishedPromise(), this.startTime = this.cancelTime = null, this.resolver.cancel();
  }
  stopDriver() {
    this.driver && (this.driver.stop(), this.driver = void 0);
  }
  sample(t) {
    return this.startTime = 0, this.tick(t, !0);
  }
}
const Zb = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]);
function Jb(e, t, n, { delay: r = 0, duration: i = 300, repeat: o = 0, repeatType: s = "loop", ease: a = "easeInOut", times: l } = {}) {
  const c = { [t]: n };
  l && (c.offset = l);
  const u = lf(a, i);
  return Array.isArray(u) && (c.easing = u), e.animate(c, {
    delay: r,
    duration: i,
    easing: Array.isArray(u) ? "linear" : u,
    fill: "both",
    iterations: o + 1,
    direction: s === "reverse" ? "alternate" : "normal"
  });
}
const Qb = /* @__PURE__ */ ta(() => Object.hasOwnProperty.call(Element.prototype, "animate")), Ei = 10, ex = 2e4;
function tx(e) {
  return ga(e.type) || e.type === "spring" || !af(e.ease);
}
function nx(e, t) {
  const n = new Ra({
    ...t,
    keyframes: e,
    repeat: 0,
    delay: 0,
    isGenerator: !0
  });
  let r = { done: !1, value: e[0] };
  const i = [];
  let o = 0;
  for (; !r.done && o < ex; )
    r = n.sample(o), i.push(r.value), o += Ei;
  return {
    times: void 0,
    keyframes: i,
    duration: o - Ei,
    ease: "linear"
  };
}
const Uf = {
  anticipate: xf,
  backInOut: bf,
  circInOut: Sf
};
function rx(e) {
  return e in Uf;
}
class ec extends Ff {
  constructor(t) {
    super(t);
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options;
    this.resolver = new _f(o, (s, a) => this.onKeyframesResolved(s, a), n, r, i), this.resolver.scheduleResolve();
  }
  initPlayback(t, n) {
    let { duration: r = 300, times: i, ease: o, type: s, motionValue: a, name: l, startTime: c } = this.options;
    if (!a.owner || !a.owner.current)
      return !1;
    if (typeof o == "string" && ki() && rx(o) && (o = Uf[o]), tx(this.options)) {
      const { onComplete: d, onUpdate: h, motionValue: f, element: m, ...p } = this.options, y = nx(t, p);
      t = y.keyframes, t.length === 1 && (t[1] = t[0]), r = y.duration, i = y.times, o = y.ease, s = "keyframes";
    }
    const u = Jb(a.owner.current, l, t, { ...this.options, duration: r, times: i, ease: o });
    return u.startTime = c ?? this.calcStartTime(), this.pendingTimeline ? (Fl(u, this.pendingTimeline), this.pendingTimeline = void 0) : u.onfinish = () => {
      const { onComplete: d } = this.options;
      a.set(Yi(t, this.options, n)), d && d(), this.cancel(), this.resolveFinishedPromise();
    }, {
      animation: u,
      duration: r,
      times: i,
      type: s,
      ease: o,
      keyframes: t
    };
  }
  get duration() {
    const { resolved: t } = this;
    if (!t)
      return 0;
    const { duration: n } = t;
    return /* @__PURE__ */ Ft(n);
  }
  get time() {
    const { resolved: t } = this;
    if (!t)
      return 0;
    const { animation: n } = t;
    return /* @__PURE__ */ Ft(n.currentTime || 0);
  }
  set time(t) {
    const { resolved: n } = this;
    if (!n)
      return;
    const { animation: r } = n;
    r.currentTime = /* @__PURE__ */ Rt(t);
  }
  get speed() {
    const { resolved: t } = this;
    if (!t)
      return 1;
    const { animation: n } = t;
    return n.playbackRate;
  }
  set speed(t) {
    const { resolved: n } = this;
    if (!n)
      return;
    const { animation: r } = n;
    r.playbackRate = t;
  }
  get state() {
    const { resolved: t } = this;
    if (!t)
      return "idle";
    const { animation: n } = t;
    return n.playState;
  }
  get startTime() {
    const { resolved: t } = this;
    if (!t)
      return null;
    const { animation: n } = t;
    return n.startTime;
  }
  /**
   * Replace the default DocumentTimeline with another AnimationTimeline.
   * Currently used for scroll animations.
   */
  attachTimeline(t) {
    if (!this._resolved)
      this.pendingTimeline = t;
    else {
      const { resolved: n } = this;
      if (!n)
        return tt;
      const { animation: r } = n;
      Fl(r, t);
    }
    return tt;
  }
  play() {
    if (this.isStopped)
      return;
    const { resolved: t } = this;
    if (!t)
      return;
    const { animation: n } = t;
    n.playState === "finished" && this.updateFinishedPromise(), n.play();
  }
  pause() {
    const { resolved: t } = this;
    if (!t)
      return;
    const { animation: n } = t;
    n.pause();
  }
  stop() {
    if (this.resolver.cancel(), this.isStopped = !0, this.state === "idle")
      return;
    this.resolveFinishedPromise(), this.updateFinishedPromise();
    const { resolved: t } = this;
    if (!t)
      return;
    const { animation: n, keyframes: r, duration: i, type: o, ease: s, times: a } = t;
    if (n.playState === "idle" || n.playState === "finished")
      return;
    if (this.time) {
      const { motionValue: c, onUpdate: u, onComplete: d, element: h, ...f } = this.options, m = new Ra({
        ...f,
        keyframes: r,
        duration: i,
        type: o,
        ease: s,
        times: a,
        isGenerator: !0
      }), p = /* @__PURE__ */ Rt(this.time);
      c.setWithVelocity(m.sample(p - Ei).value, m.sample(p).value, Ei);
    }
    const { onStop: l } = this.options;
    l && l(), this.cancel();
  }
  complete() {
    const { resolved: t } = this;
    t && t.animation.finish();
  }
  cancel() {
    const { resolved: t } = this;
    t && t.animation.cancel();
  }
  static supports(t) {
    const { motionValue: n, name: r, repeatDelay: i, repeatType: o, damping: s, type: a } = t;
    if (!n || !n.owner || !(n.owner.current instanceof HTMLElement))
      return !1;
    const { onUpdate: l, transformTemplate: c } = n.owner.getProps();
    return Qb() && r && Zb.has(r) && /**
     * If we're outputting values to onUpdate then we can't use WAAPI as there's
     * no way to read the value from WAAPI every frame.
     */
    !l && !c && !i && o !== "mirror" && s !== 0 && a !== "inertia";
  }
}
const ix = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, ox = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), sx = {
  type: "keyframes",
  duration: 0.8
}, ax = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, lx = (e, { keyframes: t }) => t.length > 2 ? sx : Rn.has(e) ? e.startsWith("scale") ? ox(t[1]) : ix : ax;
function cx({ when: e, delay: t, delayChildren: n, staggerChildren: r, staggerDirection: i, repeat: o, repeatType: s, repeatDelay: a, from: l, elapsed: c, ...u }) {
  return !!Object.keys(u).length;
}
const Na = (e, t, n, r = {}, i, o) => (s) => {
  const a = ma(r, e) || {}, l = a.delay || r.delay || 0;
  let { elapsed: c = 0 } = r;
  c = c - /* @__PURE__ */ Rt(l);
  let u = {
    keyframes: Array.isArray(n) ? n : [null, n],
    ease: "easeOut",
    velocity: t.getVelocity(),
    ...a,
    delay: -c,
    onUpdate: (h) => {
      t.set(h), a.onUpdate && a.onUpdate(h);
    },
    onComplete: () => {
      s(), a.onComplete && a.onComplete();
    },
    name: e,
    motionValue: t,
    element: o ? void 0 : i
  };
  cx(a) || (u = {
    ...u,
    ...lx(e, u)
  }), u.duration && (u.duration = /* @__PURE__ */ Rt(u.duration)), u.repeatDelay && (u.repeatDelay = /* @__PURE__ */ Rt(u.repeatDelay)), u.from !== void 0 && (u.keyframes[0] = u.from);
  let d = !1;
  if ((u.type === !1 || u.duration === 0 && !u.repeatDelay) && (u.duration = 0, u.delay === 0 && (d = !0)), d && !o && t.get() !== void 0) {
    const h = Yi(u.keyframes, a);
    if (h !== void 0)
      return Pe.update(() => {
        u.onUpdate(h), u.onComplete();
      }), new Av([]);
  }
  return !o && ec.supports(u) ? new ec(u) : new Ra(u);
};
function ux({ protectedKeys: e, needsAnimating: t }, n) {
  const r = e.hasOwnProperty(n) && t[n] !== !0;
  return t[n] = !1, r;
}
function Hf(e, t, { delay: n = 0, transitionOverride: r, type: i } = {}) {
  var o;
  let { transition: s = e.getDefaultTransition(), transitionEnd: a, ...l } = t;
  r && (s = r);
  const c = [], u = i && e.animationState && e.animationState.getState()[i];
  for (const d in l) {
    const h = e.getValue(d, (o = e.latestValues[d]) !== null && o !== void 0 ? o : null), f = l[d];
    if (f === void 0 || u && ux(u, d))
      continue;
    const m = {
      delay: n,
      ...ma(s || {}, d)
    };
    let p = !1;
    if (window.MotionHandoffAnimation) {
      const g = pf(e);
      if (g) {
        const x = window.MotionHandoffAnimation(g, d, Pe);
        x !== null && (m.startTime = x, p = !0);
      }
    }
    fs(e, d), h.start(Na(d, h, f, e.shouldReduceMotion && ff.has(d) ? { type: !1 } : m, e, p));
    const y = h.animation;
    y && c.push(y);
  }
  return a && Promise.all(c).then(() => {
    Pe.update(() => {
      a && $v(e, a);
    });
  }), c;
}
function bs(e, t, n = {}) {
  var r;
  const i = Gi(e, t, n.type === "exit" ? (r = e.presenceContext) === null || r === void 0 ? void 0 : r.custom : void 0);
  let { transition: o = e.getDefaultTransition() || {} } = i || {};
  n.transitionOverride && (o = n.transitionOverride);
  const s = i ? () => Promise.all(Hf(e, i, n)) : () => Promise.resolve(), a = e.variantChildren && e.variantChildren.size ? (c = 0) => {
    const { delayChildren: u = 0, staggerChildren: d, staggerDirection: h } = o;
    return dx(e, t, u + c, d, h, n);
  } : () => Promise.resolve(), { when: l } = o;
  if (l) {
    const [c, u] = l === "beforeChildren" ? [s, a] : [a, s];
    return c().then(() => u());
  } else
    return Promise.all([s(), a(n.delay)]);
}
function dx(e, t, n = 0, r = 0, i = 1, o) {
  const s = [], a = (e.variantChildren.size - 1) * r, l = i === 1 ? (c = 0) => c * r : (c = 0) => a - c * r;
  return Array.from(e.variantChildren).sort(fx).forEach((c, u) => {
    c.notify("AnimationStart", t), s.push(bs(c, t, {
      ...o,
      delay: n + l(u)
    }).then(() => c.notify("AnimationComplete", t)));
  }), Promise.all(s);
}
function fx(e, t) {
  return e.sortNodePosition(t);
}
function hx(e, t, n = {}) {
  e.notify("AnimationStart", t);
  let r;
  if (Array.isArray(t)) {
    const i = t.map((o) => bs(e, o, n));
    r = Promise.all(i);
  } else if (typeof t == "string")
    r = bs(e, t, n);
  else {
    const i = typeof t == "function" ? Gi(e, t, n.custom) : t;
    r = Promise.all(Hf(e, i, n));
  }
  return r.then(() => {
    e.notify("AnimationComplete", t);
  });
}
const px = ra.length;
function Wf(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const n = e.parent ? Wf(e.parent) || {} : {};
    return e.props.initial !== void 0 && (n.initial = e.props.initial), n;
  }
  const t = {};
  for (let n = 0; n < px; n++) {
    const r = ra[n], i = e.props[r];
    (Nr(i) || i === !1) && (t[r] = i);
  }
  return t;
}
const mx = [...na].reverse(), gx = na.length;
function yx(e) {
  return (t) => Promise.all(t.map(({ animation: n, options: r }) => hx(e, n, r)));
}
function vx(e) {
  let t = yx(e), n = tc(), r = !0;
  const i = (l) => (c, u) => {
    var d;
    const h = Gi(e, u, l === "exit" ? (d = e.presenceContext) === null || d === void 0 ? void 0 : d.custom : void 0);
    if (h) {
      const { transition: f, transitionEnd: m, ...p } = h;
      c = { ...c, ...p, ...m };
    }
    return c;
  };
  function o(l) {
    t = l(e);
  }
  function s(l) {
    const { props: c } = e, u = Wf(e.parent) || {}, d = [], h = /* @__PURE__ */ new Set();
    let f = {}, m = 1 / 0;
    for (let y = 0; y < gx; y++) {
      const g = mx[y], x = n[g], w = c[g] !== void 0 ? c[g] : u[g], P = Nr(w), E = g === l ? x.isActive : null;
      E === !1 && (m = y);
      let C = w === u[g] && w !== c[g] && P;
      if (C && r && e.manuallyAnimateOnMount && (C = !1), x.protectedKeys = { ...f }, // If it isn't active and hasn't *just* been set as inactive
      !x.isActive && E === null || // If we didn't and don't have any defined prop for this animation type
      !w && !x.prevProp || // Or if the prop doesn't define an animation
      qi(w) || typeof w == "boolean")
        continue;
      const A = bx(x.prevProp, w);
      let N = A || // If we're making this variant active, we want to always make it active
      g === l && x.isActive && !C && P || // If we removed a higher-priority variant (i is in reverse order)
      y > m && P, L = !1;
      const T = Array.isArray(w) ? w : [w];
      let O = T.reduce(i(g), {});
      E === !1 && (O = {});
      const { prevResolvedValues: I = {} } = x, W = {
        ...I,
        ...O
      }, R = (z) => {
        N = !0, h.has(z) && (L = !0, h.delete(z)), x.needsAnimating[z] = !0;
        const $ = e.getValue(z);
        $ && ($.liveStyle = !1);
      };
      for (const z in W) {
        const $ = O[z], U = I[z];
        if (f.hasOwnProperty(z))
          continue;
        let S = !1;
        cs($) && cs(U) ? S = !rf($, U) : S = $ !== U, S ? $ != null ? R(z) : h.add(z) : $ !== void 0 && h.has(z) ? R(z) : x.protectedKeys[z] = !0;
      }
      x.prevProp = w, x.prevResolvedValues = O, x.isActive && (f = { ...f, ...O }), r && e.blockInitialAnimation && (N = !1), N && (!(C && A) || L) && d.push(...T.map((z) => ({
        animation: z,
        options: { type: g }
      })));
    }
    if (h.size) {
      const y = {};
      h.forEach((g) => {
        const x = e.getBaseTarget(g), w = e.getValue(g);
        w && (w.liveStyle = !0), y[g] = x ?? null;
      }), d.push({ animation: y });
    }
    let p = !!d.length;
    return r && (c.initial === !1 || c.initial === c.animate) && !e.manuallyAnimateOnMount && (p = !1), r = !1, p ? t(d) : Promise.resolve();
  }
  function a(l, c) {
    var u;
    if (n[l].isActive === c)
      return Promise.resolve();
    (u = e.variantChildren) === null || u === void 0 || u.forEach((h) => {
      var f;
      return (f = h.animationState) === null || f === void 0 ? void 0 : f.setActive(l, c);
    }), n[l].isActive = c;
    const d = s(l);
    for (const h in n)
      n[h].protectedKeys = {};
    return d;
  }
  return {
    animateChanges: s,
    setActive: a,
    setAnimateFunction: o,
    getState: () => n,
    reset: () => {
      n = tc(), r = !0;
    }
  };
}
function bx(e, t) {
  return typeof t == "string" ? t !== e : Array.isArray(t) ? !rf(t, e) : !1;
}
function mn(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function tc() {
  return {
    animate: mn(!0),
    whileInView: mn(),
    whileHover: mn(),
    whileTap: mn(),
    whileDrag: mn(),
    whileFocus: mn(),
    exit: mn()
  };
}
class cn {
  constructor(t) {
    this.isMounted = !1, this.node = t;
  }
  update() {
  }
}
class xx extends cn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(t) {
    super(t), t.animationState || (t.animationState = vx(t));
  }
  updateAnimationControlsSubscription() {
    const { animate: t } = this.node.getProps();
    qi(t) && (this.unmountControls = t.subscribe(this.node));
  }
  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: t } = this.node.getProps(), { animate: n } = this.node.prevProps || {};
    t !== n && this.updateAnimationControlsSubscription();
  }
  unmount() {
    var t;
    this.node.animationState.reset(), (t = this.unmountControls) === null || t === void 0 || t.call(this);
  }
}
let wx = 0;
class Sx extends cn {
  constructor() {
    super(...arguments), this.id = wx++;
  }
  update() {
    if (!this.node.presenceContext)
      return;
    const { isPresent: t, onExitComplete: n } = this.node.presenceContext, { isPresent: r } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || t === r)
      return;
    const i = this.node.animationState.setActive("exit", !t);
    n && !t && i.then(() => n(this.id));
  }
  mount() {
    const { register: t } = this.node.presenceContext || {};
    t && (this.unmount = t(this.id));
  }
  unmount() {
  }
}
const kx = {
  animation: {
    Feature: xx
  },
  exit: {
    Feature: Sx
  }
};
function Or(e, t, n, r = { passive: !0 }) {
  return e.addEventListener(t, n, r), () => e.removeEventListener(t, n);
}
function Ur(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const Cx = (e) => (t) => va(t) && e(t, Ur(t));
function Cr(e, t, n, r) {
  return Or(e, t, Cx(n), r);
}
const nc = (e, t) => Math.abs(e - t);
function Tx(e, t) {
  const n = nc(e.x, t.x), r = nc(e.y, t.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
class qf {
  constructor(t, n, { transformPagePoint: r, contextWindow: i, dragSnapToOrigin: o = !1 } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const d = No(this.lastMoveEventInfo, this.history), h = this.startEvent !== null, f = Tx(d.offset, { x: 0, y: 0 }) >= 3;
      if (!h && !f)
        return;
      const { point: m } = d, { timestamp: p } = $e;
      this.history.push({ ...m, timestamp: p });
      const { onStart: y, onMove: g } = this.handlers;
      h || (y && y(this.lastMoveEvent, d), this.startEvent = this.lastMoveEvent), g && g(this.lastMoveEvent, d);
    }, this.handlePointerMove = (d, h) => {
      this.lastMoveEvent = d, this.lastMoveEventInfo = Ro(h, this.transformPagePoint), Pe.update(this.updatePoint, !0);
    }, this.handlePointerUp = (d, h) => {
      this.end();
      const { onEnd: f, onSessionEnd: m, resumeAnimation: p } = this.handlers;
      if (this.dragSnapToOrigin && p && p(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const y = No(d.type === "pointercancel" ? this.lastMoveEventInfo : Ro(h, this.transformPagePoint), this.history);
      this.startEvent && f && f(d, y), m && m(d, y);
    }, !va(t))
      return;
    this.dragSnapToOrigin = o, this.handlers = n, this.transformPagePoint = r, this.contextWindow = i || window;
    const s = Ur(t), a = Ro(s, this.transformPagePoint), { point: l } = a, { timestamp: c } = $e;
    this.history = [{ ...l, timestamp: c }];
    const { onSessionStart: u } = n;
    u && u(t, No(a, this.history)), this.removeListeners = $r(Cr(this.contextWindow, "pointermove", this.handlePointerMove), Cr(this.contextWindow, "pointerup", this.handlePointerUp), Cr(this.contextWindow, "pointercancel", this.handlePointerUp));
  }
  updateHandlers(t) {
    this.handlers = t;
  }
  end() {
    this.removeListeners && this.removeListeners(), on(this.updatePoint);
  }
}
function Ro(e, t) {
  return t ? { point: t(e.point) } : e;
}
function rc(e, t) {
  return { x: e.x - t.x, y: e.y - t.y };
}
function No({ point: e }, t) {
  return {
    point: e,
    delta: rc(e, Kf(t)),
    offset: rc(e, Ex(t)),
    velocity: Px(t, 0.1)
  };
}
function Ex(e) {
  return e[0];
}
function Kf(e) {
  return e[e.length - 1];
}
function Px(e, t) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let n = e.length - 1, r = null;
  const i = Kf(e);
  for (; n >= 0 && (r = e[n], !(i.timestamp - r.timestamp > /* @__PURE__ */ Rt(t))); )
    n--;
  if (!r)
    return { x: 0, y: 0 };
  const o = /* @__PURE__ */ Ft(i.timestamp - r.timestamp);
  if (o === 0)
    return { x: 0, y: 0 };
  const s = {
    x: (i.x - r.x) / o,
    y: (i.y - r.y) / o
  };
  return s.x === 1 / 0 && (s.x = 0), s.y === 1 / 0 && (s.y = 0), s;
}
const Gf = 1e-4, Ax = 1 - Gf, Rx = 1 + Gf, Yf = 0.01, Nx = 0 - Yf, Ix = 0 + Yf;
function ct(e) {
  return e.max - e.min;
}
function Dx(e, t, n) {
  return Math.abs(e - t) <= n;
}
function ic(e, t, n, r = 0.5) {
  e.origin = r, e.originPoint = De(t.min, t.max, e.origin), e.scale = ct(n) / ct(t), e.translate = De(n.min, n.max, e.origin) - e.originPoint, (e.scale >= Ax && e.scale <= Rx || isNaN(e.scale)) && (e.scale = 1), (e.translate >= Nx && e.translate <= Ix || isNaN(e.translate)) && (e.translate = 0);
}
function Tr(e, t, n, r) {
  ic(e.x, t.x, n.x, r ? r.originX : void 0), ic(e.y, t.y, n.y, r ? r.originY : void 0);
}
function oc(e, t, n) {
  e.min = n.min + t.min, e.max = e.min + ct(t);
}
function Mx(e, t, n) {
  oc(e.x, t.x, n.x), oc(e.y, t.y, n.y);
}
function sc(e, t, n) {
  e.min = t.min - n.min, e.max = e.min + ct(t);
}
function Er(e, t, n) {
  sc(e.x, t.x, n.x), sc(e.y, t.y, n.y);
}
function Ox(e, { min: t, max: n }, r) {
  return t !== void 0 && e < t ? e = r ? De(t, e, r.min) : Math.max(e, t) : n !== void 0 && e > n && (e = r ? De(n, e, r.max) : Math.min(e, n)), e;
}
function ac(e, t, n) {
  return {
    min: t !== void 0 ? e.min + t : void 0,
    max: n !== void 0 ? e.max + n - (e.max - e.min) : void 0
  };
}
function Lx(e, { top: t, left: n, bottom: r, right: i }) {
  return {
    x: ac(e.x, n, i),
    y: ac(e.y, t, r)
  };
}
function lc(e, t) {
  let n = t.min - e.min, r = t.max - e.max;
  return t.max - t.min < e.max - e.min && ([n, r] = [r, n]), { min: n, max: r };
}
function _x(e, t) {
  return {
    x: lc(e.x, t.x),
    y: lc(e.y, t.y)
  };
}
function Fx(e, t) {
  let n = 0.5;
  const r = ct(e), i = ct(t);
  return i > r ? n = /* @__PURE__ */ Kn(t.min, t.max - r, e.min) : r > i && (n = /* @__PURE__ */ Kn(e.min, e.max - i, t.min)), Bt(0, 1, n);
}
function Vx(e, t) {
  const n = {};
  return t.min !== void 0 && (n.min = t.min - e.min), t.max !== void 0 && (n.max = t.max - e.min), n;
}
const xs = 0.35;
function Bx(e = xs) {
  return e === !1 ? e = 0 : e === !0 && (e = xs), {
    x: cc(e, "left", "right"),
    y: cc(e, "top", "bottom")
  };
}
function cc(e, t, n) {
  return {
    min: uc(e, t),
    max: uc(e, n)
  };
}
function uc(e, t) {
  return typeof e == "number" ? e : e[t] || 0;
}
const dc = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), zn = () => ({
  x: dc(),
  y: dc()
}), fc = () => ({ min: 0, max: 0 }), Le = () => ({
  x: fc(),
  y: fc()
});
function ft(e) {
  return [e("x"), e("y")];
}
function Xf({ top: e, left: t, right: n, bottom: r }) {
  return {
    x: { min: t, max: n },
    y: { min: e, max: r }
  };
}
function zx({ x: e, y: t }) {
  return { top: t.min, right: e.max, bottom: t.max, left: e.min };
}
function jx(e, t) {
  if (!t)
    return e;
  const n = t({ x: e.left, y: e.top }), r = t({ x: e.right, y: e.bottom });
  return {
    top: n.y,
    left: n.x,
    bottom: r.y,
    right: r.x
  };
}
function Io(e) {
  return e === void 0 || e === 1;
}
function ws({ scale: e, scaleX: t, scaleY: n }) {
  return !Io(e) || !Io(t) || !Io(n);
}
function yn(e) {
  return ws(e) || Zf(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function Zf(e) {
  return hc(e.x) || hc(e.y);
}
function hc(e) {
  return e && e !== "0%";
}
function Pi(e, t, n) {
  const r = e - n, i = t * r;
  return n + i;
}
function pc(e, t, n, r, i) {
  return i !== void 0 && (e = Pi(e, i, r)), Pi(e, n, r) + t;
}
function Ss(e, t = 0, n = 1, r, i) {
  e.min = pc(e.min, t, n, r, i), e.max = pc(e.max, t, n, r, i);
}
function Jf(e, { x: t, y: n }) {
  Ss(e.x, t.translate, t.scale, t.originPoint), Ss(e.y, n.translate, n.scale, n.originPoint);
}
const mc = 0.999999999999, gc = 1.0000000000001;
function $x(e, t, n, r = !1) {
  const i = n.length;
  if (!i)
    return;
  t.x = t.y = 1;
  let o, s;
  for (let a = 0; a < i; a++) {
    o = n[a], s = o.projectionDelta;
    const { visualElement: l } = o.options;
    l && l.props.style && l.props.style.display === "contents" || (r && o.options.layoutScroll && o.scroll && o !== o.root && $n(e, {
      x: -o.scroll.offset.x,
      y: -o.scroll.offset.y
    }), s && (t.x *= s.x.scale, t.y *= s.y.scale, Jf(e, s)), r && yn(o.latestValues) && $n(e, o.latestValues));
  }
  t.x < gc && t.x > mc && (t.x = 1), t.y < gc && t.y > mc && (t.y = 1);
}
function jn(e, t) {
  e.min = e.min + t, e.max = e.max + t;
}
function yc(e, t, n, r, i = 0.5) {
  const o = De(e.min, e.max, i);
  Ss(e, t, n, o, r);
}
function $n(e, t) {
  yc(e.x, t.x, t.scaleX, t.scale, t.originX), yc(e.y, t.y, t.scaleY, t.scale, t.originY);
}
function Qf(e, t) {
  return Xf(jx(e.getBoundingClientRect(), t));
}
function Ux(e, t, n) {
  const r = Qf(e, n), { scroll: i } = t;
  return i && (jn(r.x, i.offset.x), jn(r.y, i.offset.y)), r;
}
const eh = ({ current: e }) => e ? e.ownerDocument.defaultView : null, Hx = /* @__PURE__ */ new WeakMap();
class Wx {
  constructor(t) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = Le(), this.visualElement = t;
  }
  start(t, { snapToCursor: n = !1 } = {}) {
    const { presenceContext: r } = this.visualElement;
    if (r && r.isPresent === !1)
      return;
    const i = (u) => {
      const { dragSnapToOrigin: d } = this.getProps();
      d ? this.pauseAnimation() : this.stopAnimation(), n && this.snapToCursor(Ur(u).point);
    }, o = (u, d) => {
      const { drag: h, dragPropagation: f, onDragStart: m } = this.getProps();
      if (h && !f && (this.openDragLock && this.openDragLock(), this.openDragLock = Fv(h), !this.openDragLock))
        return;
      this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), ft((y) => {
        let g = this.getAxisMotionValue(y).get() || 0;
        if (Nt.test(g)) {
          const { projection: x } = this.visualElement;
          if (x && x.layout) {
            const w = x.layout.layoutBox[y];
            w && (g = ct(w) * (parseFloat(g) / 100));
          }
        }
        this.originPoint[y] = g;
      }), m && Pe.postRender(() => m(u, d)), fs(this.visualElement, "transform");
      const { animationState: p } = this.visualElement;
      p && p.setActive("whileDrag", !0);
    }, s = (u, d) => {
      const { dragPropagation: h, dragDirectionLock: f, onDirectionLock: m, onDrag: p } = this.getProps();
      if (!h && !this.openDragLock)
        return;
      const { offset: y } = d;
      if (f && this.currentDirection === null) {
        this.currentDirection = qx(y), this.currentDirection !== null && m && m(this.currentDirection);
        return;
      }
      this.updateAxis("x", d.point, y), this.updateAxis("y", d.point, y), this.visualElement.render(), p && p(u, d);
    }, a = (u, d) => this.stop(u, d), l = () => ft((u) => {
      var d;
      return this.getAnimationState(u) === "paused" && ((d = this.getAxisMotionValue(u).animation) === null || d === void 0 ? void 0 : d.play());
    }), { dragSnapToOrigin: c } = this.getProps();
    this.panSession = new qf(t, {
      onSessionStart: i,
      onStart: o,
      onMove: s,
      onSessionEnd: a,
      resumeAnimation: l
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: c,
      contextWindow: eh(this.visualElement)
    });
  }
  stop(t, n) {
    const r = this.isDragging;
    if (this.cancel(), !r)
      return;
    const { velocity: i } = n;
    this.startAnimation(i);
    const { onDragEnd: o } = this.getProps();
    o && Pe.postRender(() => o(t, n));
  }
  cancel() {
    this.isDragging = !1;
    const { projection: t, animationState: n } = this.visualElement;
    t && (t.isAnimationBlocked = !1), this.panSession && this.panSession.end(), this.panSession = void 0;
    const { dragPropagation: r } = this.getProps();
    !r && this.openDragLock && (this.openDragLock(), this.openDragLock = null), n && n.setActive("whileDrag", !1);
  }
  updateAxis(t, n, r) {
    const { drag: i } = this.getProps();
    if (!r || !Jr(t, i, this.currentDirection))
      return;
    const o = this.getAxisMotionValue(t);
    let s = this.originPoint[t] + r[t];
    this.constraints && this.constraints[t] && (s = Ox(s, this.constraints[t], this.elastic[t])), o.set(s);
  }
  resolveConstraints() {
    var t;
    const { dragConstraints: n, dragElastic: r } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (t = this.visualElement.projection) === null || t === void 0 ? void 0 : t.layout, o = this.constraints;
    n && Vn(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = Lx(i.layoutBox, n) : this.constraints = !1, this.elastic = Bx(r), o !== this.constraints && i && this.constraints && !this.hasMutatedConstraints && ft((s) => {
      this.constraints !== !1 && this.getAxisMotionValue(s) && (this.constraints[s] = Vx(i.layoutBox[s], this.constraints[s]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: t, onMeasureDragConstraints: n } = this.getProps();
    if (!t || !Vn(t))
      return !1;
    const r = t.current;
    rn(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.");
    const { projection: i } = this.visualElement;
    if (!i || !i.layout)
      return !1;
    const o = Ux(r, i.root, this.visualElement.getTransformPagePoint());
    let s = _x(i.layout.layoutBox, o);
    if (n) {
      const a = n(zx(s));
      this.hasMutatedConstraints = !!a, a && (s = Xf(a));
    }
    return s;
  }
  startAnimation(t) {
    const { drag: n, dragMomentum: r, dragElastic: i, dragTransition: o, dragSnapToOrigin: s, onDragTransitionEnd: a } = this.getProps(), l = this.constraints || {}, c = ft((u) => {
      if (!Jr(u, n, this.currentDirection))
        return;
      let d = l && l[u] || {};
      s && (d = { min: 0, max: 0 });
      const h = i ? 200 : 1e6, f = i ? 40 : 1e7, m = {
        type: "inertia",
        velocity: r ? t[u] : 0,
        bounceStiffness: h,
        bounceDamping: f,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...o,
        ...d
      };
      return this.startAxisValueAnimation(u, m);
    });
    return Promise.all(c).then(a);
  }
  startAxisValueAnimation(t, n) {
    const r = this.getAxisMotionValue(t);
    return fs(this.visualElement, t), r.start(Na(t, r, 0, n, this.visualElement, !1));
  }
  stopAnimation() {
    ft((t) => this.getAxisMotionValue(t).stop());
  }
  pauseAnimation() {
    ft((t) => {
      var n;
      return (n = this.getAxisMotionValue(t).animation) === null || n === void 0 ? void 0 : n.pause();
    });
  }
  getAnimationState(t) {
    var n;
    return (n = this.getAxisMotionValue(t).animation) === null || n === void 0 ? void 0 : n.state;
  }
  /**
   * Drag works differently depending on which props are provided.
   *
   * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
   * - Otherwise, we apply the delta to the x/y motion values.
   */
  getAxisMotionValue(t) {
    const n = `_drag${t.toUpperCase()}`, r = this.visualElement.getProps(), i = r[n];
    return i || this.visualElement.getValue(t, (r.initial ? r.initial[t] : void 0) || 0);
  }
  snapToCursor(t) {
    ft((n) => {
      const { drag: r } = this.getProps();
      if (!Jr(n, r, this.currentDirection))
        return;
      const { projection: i } = this.visualElement, o = this.getAxisMotionValue(n);
      if (i && i.layout) {
        const { min: s, max: a } = i.layout.layoutBox[n];
        o.set(t[n] - De(s, a, 0.5));
      }
    });
  }
  /**
   * When the viewport resizes we want to check if the measured constraints
   * have changed and, if so, reposition the element within those new constraints
   * relative to where it was before the resize.
   */
  scalePositionWithinConstraints() {
    if (!this.visualElement.current)
      return;
    const { drag: t, dragConstraints: n } = this.getProps(), { projection: r } = this.visualElement;
    if (!Vn(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const i = { x: 0, y: 0 };
    ft((s) => {
      const a = this.getAxisMotionValue(s);
      if (a && this.constraints !== !1) {
        const l = a.get();
        i[s] = Fx({ min: l, max: l }, this.constraints[s]);
      }
    });
    const { transformTemplate: o } = this.visualElement.getProps();
    this.visualElement.current.style.transform = o ? o({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.resolveConstraints(), ft((s) => {
      if (!Jr(s, t, null))
        return;
      const a = this.getAxisMotionValue(s), { min: l, max: c } = this.constraints[s];
      a.set(De(l, c, i[s]));
    });
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    Hx.set(this.visualElement, this);
    const t = this.visualElement.current, n = Cr(t, "pointerdown", (l) => {
      const { drag: c, dragListener: u = !0 } = this.getProps();
      c && u && this.start(l);
    }), r = () => {
      const { dragConstraints: l } = this.getProps();
      Vn(l) && l.current && (this.constraints = this.resolveRefConstraints());
    }, { projection: i } = this.visualElement, o = i.addEventListener("measure", r);
    i && !i.layout && (i.root && i.root.updateScroll(), i.updateLayout()), Pe.read(r);
    const s = Or(window, "resize", () => this.scalePositionWithinConstraints()), a = i.addEventListener("didUpdate", (({ delta: l, hasLayoutChanged: c }) => {
      this.isDragging && c && (ft((u) => {
        const d = this.getAxisMotionValue(u);
        d && (this.originPoint[u] += l[u].translate, d.set(d.get() + l[u].translate));
      }), this.visualElement.render());
    }));
    return () => {
      s(), n(), o(), a && a();
    };
  }
  getProps() {
    const t = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: i = !1, dragConstraints: o = !1, dragElastic: s = xs, dragMomentum: a = !0 } = t;
    return {
      ...t,
      drag: n,
      dragDirectionLock: r,
      dragPropagation: i,
      dragConstraints: o,
      dragElastic: s,
      dragMomentum: a
    };
  }
}
function Jr(e, t, n) {
  return (t === !0 || t === e) && (n === null || n === e);
}
function qx(e, t = 10) {
  let n = null;
  return Math.abs(e.y) > t ? n = "y" : Math.abs(e.x) > t && (n = "x"), n;
}
class Kx extends cn {
  constructor(t) {
    super(t), this.removeGroupControls = tt, this.removeListeners = tt, this.controls = new Wx(t);
  }
  mount() {
    const { dragControls: t } = this.node.getProps();
    t && (this.removeGroupControls = t.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || tt;
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners();
  }
}
const vc = (e) => (t, n) => {
  e && Pe.postRender(() => e(t, n));
};
class Gx extends cn {
  constructor() {
    super(...arguments), this.removePointerDownListener = tt;
  }
  onPointerDown(t) {
    this.session = new qf(t, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: eh(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: t, onPanStart: n, onPan: r, onPanEnd: i } = this.node.getProps();
    return {
      onSessionStart: vc(t),
      onStart: vc(n),
      onMove: r,
      onEnd: (o, s) => {
        delete this.session, i && Pe.postRender(() => i(o, s));
      }
    };
  }
  mount() {
    this.removePointerDownListener = Cr(this.node.current, "pointerdown", (t) => this.onPointerDown(t));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
const pi = {
  /**
   * Global flag as to whether the tree has animated since the last time
   * we resized the window
   */
  hasAnimatedSinceResize: !0,
  /**
   * We set this to true once, on the first update. Any nodes added to the tree beyond that
   * update will be given a `data-projection-id` attribute.
   */
  hasEverUpdated: !1
};
function bc(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
const pr = {
  correct: (e, t) => {
    if (!t.target)
      return e;
    if (typeof e == "string")
      if (Y.test(e))
        e = parseFloat(e);
      else
        return e;
    const n = bc(e, t.target.x), r = bc(e, t.target.y);
    return `${n}% ${r}%`;
  }
}, Yx = {
  correct: (e, { treeScale: t, projectionDelta: n }) => {
    const r = e, i = sn.parse(e);
    if (i.length > 5)
      return r;
    const o = sn.createTransformer(e), s = typeof i[0] != "number" ? 1 : 0, a = n.x.scale * t.x, l = n.y.scale * t.y;
    i[0 + s] /= a, i[1 + s] /= l;
    const c = De(a, l, 0.5);
    return typeof i[2 + s] == "number" && (i[2 + s] /= c), typeof i[3 + s] == "number" && (i[3 + s] /= c), o(i);
  }
};
class Xx extends hg {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: r, layoutId: i } = this.props, { projection: o } = t;
    gv(Zx), o && (n.group && n.group.add(o), r && r.register && i && r.register(o), o.root.didUpdate(), o.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), o.setOptions({
      ...o.options,
      onExitComplete: () => this.safeToRemove()
    })), pi.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(t) {
    const { layoutDependency: n, visualElement: r, drag: i, isPresent: o } = this.props, s = r.projection;
    return s && (s.isPresent = o, i || t.layoutDependency !== n || n === void 0 ? s.willUpdate() : this.safeToRemove(), t.isPresent !== o && (o ? s.promote() : s.relegate() || Pe.postRender(() => {
      const a = s.getStack();
      (!a || !a.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { projection: t } = this.props.visualElement;
    t && (t.root.didUpdate(), oa.postRender(() => {
      !t.currentAnimation && t.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: r } = this.props, { projection: i } = t;
    i && (i.scheduleCheckAfterUnmount(), n && n.group && n.group.remove(i), r && r.deregister && r.deregister(i));
  }
  safeToRemove() {
    const { safeToRemove: t } = this.props;
    t && t();
  }
  render() {
    return null;
  }
}
function th(e) {
  const [t, n] = Fd(), r = qe(Zs);
  return v(Xx, { ...e, layoutGroup: r, switchLayoutGroup: qe(Hd), isPresent: t, safeToRemove: n });
}
const Zx = {
  borderRadius: {
    ...pr,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: pr,
  borderTopRightRadius: pr,
  borderBottomLeftRadius: pr,
  borderBottomRightRadius: pr,
  boxShadow: Yx
};
function Jx(e, t, n) {
  const r = Ke(e) ? e : Dr(e);
  return r.start(Na("", r, t, n)), r.animation;
}
function Qx(e) {
  return e instanceof SVGElement && e.tagName !== "svg";
}
const ew = (e, t) => e.depth - t.depth;
class tw {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(t) {
    ba(this.children, t), this.isDirty = !0;
  }
  remove(t) {
    xa(this.children, t), this.isDirty = !0;
  }
  forEach(t) {
    this.isDirty && this.children.sort(ew), this.isDirty = !1, this.children.forEach(t);
  }
}
function nw(e, t) {
  const n = It.now(), r = ({ timestamp: i }) => {
    const o = i - n;
    o >= t && (on(r), e(o - t));
  };
  return Pe.read(r, !0), () => on(r);
}
const nh = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"], rw = nh.length, xc = (e) => typeof e == "string" ? parseFloat(e) : e, wc = (e) => typeof e == "number" || Y.test(e);
function iw(e, t, n, r, i, o) {
  i ? (e.opacity = De(
    0,
    // TODO Reinstate this if only child
    n.opacity !== void 0 ? n.opacity : 1,
    ow(r)
  ), e.opacityExit = De(t.opacity !== void 0 ? t.opacity : 1, 0, sw(r))) : o && (e.opacity = De(t.opacity !== void 0 ? t.opacity : 1, n.opacity !== void 0 ? n.opacity : 1, r));
  for (let s = 0; s < rw; s++) {
    const a = `border${nh[s]}Radius`;
    let l = Sc(t, a), c = Sc(n, a);
    if (l === void 0 && c === void 0)
      continue;
    l || (l = 0), c || (c = 0), l === 0 || c === 0 || wc(l) === wc(c) ? (e[a] = Math.max(De(xc(l), xc(c), r), 0), (Nt.test(c) || Nt.test(l)) && (e[a] += "%")) : e[a] = c;
  }
  (t.rotate || n.rotate) && (e.rotate = De(t.rotate || 0, n.rotate || 0, r));
}
function Sc(e, t) {
  return e[t] !== void 0 ? e[t] : e.borderRadius;
}
const ow = /* @__PURE__ */ rh(0, 0.5, wf), sw = /* @__PURE__ */ rh(0.5, 0.95, tt);
function rh(e, t, n) {
  return (r) => r < e ? 0 : r > t ? 1 : n(/* @__PURE__ */ Kn(e, t, r));
}
function kc(e, t) {
  e.min = t.min, e.max = t.max;
}
function dt(e, t) {
  kc(e.x, t.x), kc(e.y, t.y);
}
function Cc(e, t) {
  e.translate = t.translate, e.scale = t.scale, e.originPoint = t.originPoint, e.origin = t.origin;
}
function Tc(e, t, n, r, i) {
  return e -= t, e = Pi(e, 1 / n, r), i !== void 0 && (e = Pi(e, 1 / i, r)), e;
}
function aw(e, t = 0, n = 1, r = 0.5, i, o = e, s = e) {
  if (Nt.test(t) && (t = parseFloat(t), t = De(s.min, s.max, t / 100) - s.min), typeof t != "number")
    return;
  let a = De(o.min, o.max, r);
  e === o && (a -= t), e.min = Tc(e.min, t, n, a, i), e.max = Tc(e.max, t, n, a, i);
}
function Ec(e, t, [n, r, i], o, s) {
  aw(e, t[n], t[r], t[i], t.scale, o, s);
}
const lw = ["x", "scaleX", "originX"], cw = ["y", "scaleY", "originY"];
function Pc(e, t, n, r) {
  Ec(e.x, t, lw, n ? n.x : void 0, r ? r.x : void 0), Ec(e.y, t, cw, n ? n.y : void 0, r ? r.y : void 0);
}
function Ac(e) {
  return e.translate === 0 && e.scale === 1;
}
function ih(e) {
  return Ac(e.x) && Ac(e.y);
}
function Rc(e, t) {
  return e.min === t.min && e.max === t.max;
}
function uw(e, t) {
  return Rc(e.x, t.x) && Rc(e.y, t.y);
}
function Nc(e, t) {
  return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max);
}
function oh(e, t) {
  return Nc(e.x, t.x) && Nc(e.y, t.y);
}
function Ic(e) {
  return ct(e.x) / ct(e.y);
}
function Dc(e, t) {
  return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint;
}
class dw {
  constructor() {
    this.members = [];
  }
  add(t) {
    ba(this.members, t), t.scheduleRender();
  }
  remove(t) {
    if (xa(this.members, t), t === this.prevLead && (this.prevLead = void 0), t === this.lead) {
      const n = this.members[this.members.length - 1];
      n && this.promote(n);
    }
  }
  relegate(t) {
    const n = this.members.findIndex((i) => t === i);
    if (n === 0)
      return !1;
    let r;
    for (let i = n; i >= 0; i--) {
      const o = this.members[i];
      if (o.isPresent !== !1) {
        r = o;
        break;
      }
    }
    return r ? (this.promote(r), !0) : !1;
  }
  promote(t, n) {
    const r = this.lead;
    if (t !== r && (this.prevLead = r, this.lead = t, t.show(), r)) {
      r.instance && r.scheduleRender(), t.scheduleRender(), t.resumeFrom = r, n && (t.resumeFrom.preserveOpacity = !0), r.snapshot && (t.snapshot = r.snapshot, t.snapshot.latestValues = r.animationValues || r.latestValues), t.root && t.root.isUpdating && (t.isLayoutDirty = !0);
      const { crossfade: i } = t.options;
      i === !1 && r.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((t) => {
      const { options: n, resumingFrom: r } = t;
      n.onExitComplete && n.onExitComplete(), r && r.options.onExitComplete && r.options.onExitComplete();
    });
  }
  scheduleRender() {
    this.members.forEach((t) => {
      t.instance && t.scheduleRender(!1);
    });
  }
  /**
   * Clear any leads that have been removed this render to prevent them from being
   * used in future animations and to prevent memory leaks
   */
  removeLeadSnapshot() {
    this.lead && this.lead.snapshot && (this.lead.snapshot = void 0);
  }
}
function fw(e, t, n) {
  let r = "";
  const i = e.x.translate / t.x, o = e.y.translate / t.y, s = n?.z || 0;
  if ((i || o || s) && (r = `translate3d(${i}px, ${o}px, ${s}px) `), (t.x !== 1 || t.y !== 1) && (r += `scale(${1 / t.x}, ${1 / t.y}) `), n) {
    const { transformPerspective: c, rotate: u, rotateX: d, rotateY: h, skewX: f, skewY: m } = n;
    c && (r = `perspective(${c}px) ${r}`), u && (r += `rotate(${u}deg) `), d && (r += `rotateX(${d}deg) `), h && (r += `rotateY(${h}deg) `), f && (r += `skewX(${f}deg) `), m && (r += `skewY(${m}deg) `);
  }
  const a = e.x.scale * t.x, l = e.y.scale * t.y;
  return (a !== 1 || l !== 1) && (r += `scale(${a}, ${l})`), r || "none";
}
const vn = {
  type: "projectionFrame",
  totalNodes: 0,
  resolvedTargetDeltas: 0,
  recalculatedProjection: 0
}, wr = typeof window < "u" && window.MotionDebug !== void 0, Do = ["", "X", "Y", "Z"], hw = { visibility: "hidden" }, Mc = 1e3;
let pw = 0;
function Mo(e, t, n, r) {
  const { latestValues: i } = t;
  i[e] && (n[e] = i[e], t.setStaticValue(e, 0), r && (r[e] = 0));
}
function sh(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: t } = e.options;
  if (!t)
    return;
  const n = pf(t);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: i, layoutId: o } = e.options;
    window.MotionCancelOptimisedAnimation(n, "transform", Pe, !(i || o));
  }
  const { parent: r } = e;
  r && !r.hasCheckedOptimisedAppear && sh(r);
}
function ah({ attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: r, resetTransform: i }) {
  return class {
    constructor(s = {}, a = t?.()) {
      this.id = pw++, this.animationId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, wr && (vn.totalNodes = vn.resolvedTargetDeltas = vn.recalculatedProjection = 0), this.nodes.forEach(yw), this.nodes.forEach(Sw), this.nodes.forEach(kw), this.nodes.forEach(vw), wr && window.MotionDebug.record(vn);
      }, this.resolvedRelativeTargetAt = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = s, this.root = a ? a.root || a : this, this.path = a ? [...a.path, a] : [], this.parent = a, this.depth = a ? a.depth + 1 : 0;
      for (let l = 0; l < this.path.length; l++)
        this.path[l].shouldResetTransform = !0;
      this.root === this && (this.nodes = new tw());
    }
    addEventListener(s, a) {
      return this.eventHandlers.has(s) || this.eventHandlers.set(s, new wa()), this.eventHandlers.get(s).add(a);
    }
    notifyListeners(s, ...a) {
      const l = this.eventHandlers.get(s);
      l && l.notify(...a);
    }
    hasListeners(s) {
      return this.eventHandlers.has(s);
    }
    /**
     * Lifecycles
     */
    mount(s, a = this.root.hasTreeAnimated) {
      if (this.instance)
        return;
      this.isSVG = Qx(s), this.instance = s;
      const { layoutId: l, layout: c, visualElement: u } = this.options;
      if (u && !u.current && u.mount(s), this.root.nodes.add(this), this.parent && this.parent.children.add(this), a && (c || l) && (this.isLayoutDirty = !0), e) {
        let d;
        const h = () => this.root.updateBlockedByResize = !1;
        e(s, () => {
          this.root.updateBlockedByResize = !0, d && d(), d = nw(h, 250), pi.hasAnimatedSinceResize && (pi.hasAnimatedSinceResize = !1, this.nodes.forEach(Lc));
        });
      }
      l && this.root.registerSharedNode(l, this), this.options.animate !== !1 && u && (l || c) && this.addEventListener("didUpdate", ({ delta: d, hasLayoutChanged: h, hasRelativeTargetChanged: f, layout: m }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const p = this.options.transition || u.getDefaultTransition() || Aw, { onLayoutAnimationStart: y, onLayoutAnimationComplete: g } = u.getProps(), x = !this.targetLayout || !oh(this.targetLayout, m) || f, w = !h && f;
        if (this.options.layoutRoot || this.resumeFrom && this.resumeFrom.instance || w || h && (x || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0), this.setAnimationOrigin(d, w);
          const P = {
            ...ma(p, "layout"),
            onPlay: y,
            onComplete: g
          };
          (u.shouldReduceMotion || this.options.layoutRoot) && (P.delay = 0, P.type = !1), this.startAnimation(P);
        } else
          h || Lc(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = m;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const s = this.getStack();
      s && s.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, on(this.updateProjection);
    }
    // only on the root
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
    // Note: currently only running on root node
    startUpdate() {
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(Cw), this.animationId++);
    }
    getTransformTemplate() {
      const { visualElement: s } = this.options;
      return s && s.getProps().transformTemplate;
    }
    willUpdate(s = !0) {
      if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && sh(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let u = 0; u < this.path.length; u++) {
        const d = this.path[u];
        d.shouldResetTransform = !0, d.updateScroll("snapshot"), d.options.layoutRoot && d.willUpdate(!1);
      }
      const { layoutId: a, layout: l } = this.options;
      if (a === void 0 && !l)
        return;
      const c = this.getTransformTemplate();
      this.prevTransformTemplateValue = c ? c(this.latestValues, "") : void 0, this.updateSnapshot(), s && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        this.unblockUpdate(), this.clearAllSnapshots(), this.nodes.forEach(Oc);
        return;
      }
      this.isUpdating || this.nodes.forEach(xw), this.isUpdating = !1, this.nodes.forEach(ww), this.nodes.forEach(mw), this.nodes.forEach(gw), this.clearAllSnapshots();
      const a = It.now();
      $e.delta = Bt(0, 1e3 / 60, a - $e.timestamp), $e.timestamp = a, $e.isProcessing = !0, ko.update.process($e), ko.preRender.process($e), ko.render.process($e), $e.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, oa.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(bw), this.sharedNodes.forEach(Tw);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, Pe.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      Pe.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure());
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let l = 0; l < this.path.length; l++)
          this.path[l].updateScroll();
      const s = this.layout;
      this.layout = this.measure(!1), this.layoutCorrected = Le(), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: a } = this.options;
      a && a.notify("LayoutMeasure", this.layout.layoutBox, s ? s.layoutBox : void 0);
    }
    updateScroll(s = "measure") {
      let a = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === s && (a = !1), a) {
        const l = r(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: s,
          isRoot: l,
          offset: n(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : l
        };
      }
    }
    resetTransform() {
      if (!i)
        return;
      const s = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, a = this.projectionDelta && !ih(this.projectionDelta), l = this.getTransformTemplate(), c = l ? l(this.latestValues, "") : void 0, u = c !== this.prevTransformTemplateValue;
      s && (a || yn(this.latestValues) || u) && (i(this.instance, c), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(s = !0) {
      const a = this.measurePageBox();
      let l = this.removeElementScroll(a);
      return s && (l = this.removeTransform(l)), Rw(l), {
        animationId: this.root.animationId,
        measuredBox: a,
        layoutBox: l,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      var s;
      const { visualElement: a } = this.options;
      if (!a)
        return Le();
      const l = a.measureViewportBox();
      if (!(((s = this.scroll) === null || s === void 0 ? void 0 : s.wasRoot) || this.path.some(Nw))) {
        const { scroll: u } = this.root;
        u && (jn(l.x, u.offset.x), jn(l.y, u.offset.y));
      }
      return l;
    }
    removeElementScroll(s) {
      var a;
      const l = Le();
      if (dt(l, s), !((a = this.scroll) === null || a === void 0) && a.wasRoot)
        return l;
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c], { scroll: d, options: h } = u;
        u !== this.root && d && h.layoutScroll && (d.wasRoot && dt(l, s), jn(l.x, d.offset.x), jn(l.y, d.offset.y));
      }
      return l;
    }
    applyTransform(s, a = !1) {
      const l = Le();
      dt(l, s);
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c];
        !a && u.options.layoutScroll && u.scroll && u !== u.root && $n(l, {
          x: -u.scroll.offset.x,
          y: -u.scroll.offset.y
        }), yn(u.latestValues) && $n(l, u.latestValues);
      }
      return yn(this.latestValues) && $n(l, this.latestValues), l;
    }
    removeTransform(s) {
      const a = Le();
      dt(a, s);
      for (let l = 0; l < this.path.length; l++) {
        const c = this.path[l];
        if (!c.instance || !yn(c.latestValues))
          continue;
        ws(c.latestValues) && c.updateSnapshot();
        const u = Le(), d = c.measurePageBox();
        dt(u, d), Pc(a, c.latestValues, c.snapshot ? c.snapshot.layoutBox : void 0, u);
      }
      return yn(this.latestValues) && Pc(a, this.latestValues), a;
    }
    setTargetDelta(s) {
      this.targetDelta = s, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0;
    }
    setOptions(s) {
      this.options = {
        ...this.options,
        ...s,
        crossfade: s.crossfade !== void 0 ? s.crossfade : !0
      };
    }
    clearMeasurements() {
      this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1;
    }
    forceRelativeParentToResolveTarget() {
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== $e.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(s = !1) {
      var a;
      const l = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = l.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = l.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = l.isSharedProjectionDirty);
      const c = !!this.resumingFrom || this !== l;
      if (!(s || c && this.isSharedProjectionDirty || this.isProjectionDirty || !((a = this.parent) === null || a === void 0) && a.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: d, layoutId: h } = this.options;
      if (!(!this.layout || !(d || h))) {
        if (this.resolvedRelativeTargetAt = $e.timestamp, !this.targetDelta && !this.relativeTarget) {
          const f = this.getClosestProjectingParent();
          f && f.layout && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Le(), this.relativeTargetOrigin = Le(), Er(this.relativeTargetOrigin, this.layout.layoutBox, f.layout.layoutBox), dt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
        }
        if (!(!this.relativeTarget && !this.targetDelta)) {
          if (this.target || (this.target = Le(), this.targetWithTransforms = Le()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), Mx(this.target, this.relativeTarget, this.relativeParent.target)) : this.targetDelta ? (this.resumingFrom ? this.target = this.applyTransform(this.layout.layoutBox) : dt(this.target, this.layout.layoutBox), Jf(this.target, this.targetDelta)) : dt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget) {
            this.attemptToResolveRelativeTarget = !1;
            const f = this.getClosestProjectingParent();
            f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Le(), this.relativeTargetOrigin = Le(), Er(this.relativeTargetOrigin, this.target, f.target), dt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
          }
          wr && vn.resolvedTargetDeltas++;
        }
      }
    }
    getClosestProjectingParent() {
      if (!(!this.parent || ws(this.parent.latestValues) || Zf(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    calcProjection() {
      var s;
      const a = this.getLead(), l = !!this.resumingFrom || this !== a;
      let c = !0;
      if ((this.isProjectionDirty || !((s = this.parent) === null || s === void 0) && s.isProjectionDirty) && (c = !1), l && (this.isSharedProjectionDirty || this.isTransformDirty) && (c = !1), this.resolvedRelativeTargetAt === $e.timestamp && (c = !1), c)
        return;
      const { layout: u, layoutId: d } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(u || d))
        return;
      dt(this.layoutCorrected, this.layout.layoutBox);
      const h = this.treeScale.x, f = this.treeScale.y;
      $x(this.layoutCorrected, this.treeScale, this.path, l), a.layout && !a.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (a.target = a.layout.layoutBox, a.targetWithTransforms = Le());
      const { target: m } = a;
      if (!m) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Cc(this.prevProjectionDelta.x, this.projectionDelta.x), Cc(this.prevProjectionDelta.y, this.projectionDelta.y)), Tr(this.projectionDelta, this.layoutCorrected, m, this.latestValues), (this.treeScale.x !== h || this.treeScale.y !== f || !Dc(this.projectionDelta.x, this.prevProjectionDelta.x) || !Dc(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", m)), wr && vn.recalculatedProjection++;
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(s = !0) {
      var a;
      if ((a = this.options.visualElement) === null || a === void 0 || a.scheduleRender(), s) {
        const l = this.getStack();
        l && l.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = zn(), this.projectionDelta = zn(), this.projectionDeltaWithTransform = zn();
    }
    setAnimationOrigin(s, a = !1) {
      const l = this.snapshot, c = l ? l.latestValues : {}, u = { ...this.latestValues }, d = zn();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !a;
      const h = Le(), f = l ? l.source : void 0, m = this.layout ? this.layout.source : void 0, p = f !== m, y = this.getStack(), g = !y || y.members.length <= 1, x = !!(p && !g && this.options.crossfade === !0 && !this.path.some(Pw));
      this.animationProgress = 0;
      let w;
      this.mixTargetDelta = (P) => {
        const E = P / 1e3;
        _c(d.x, s.x, E), _c(d.y, s.y, E), this.setTargetDelta(d), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (Er(h, this.layout.layoutBox, this.relativeParent.layout.layoutBox), Ew(this.relativeTarget, this.relativeTargetOrigin, h, E), w && uw(this.relativeTarget, w) && (this.isProjectionDirty = !1), w || (w = Le()), dt(w, this.relativeTarget)), p && (this.animationValues = u, iw(u, c, this.latestValues, E, x, g)), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = E;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(s) {
      this.notifyListeners("animationStart"), this.currentAnimation && this.currentAnimation.stop(), this.resumingFrom && this.resumingFrom.currentAnimation && this.resumingFrom.currentAnimation.stop(), this.pendingAnimation && (on(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Pe.update(() => {
        pi.hasAnimatedSinceResize = !0, this.currentAnimation = Jx(0, Mc, {
          ...s,
          onUpdate: (a) => {
            this.mixTargetDelta(a), s.onUpdate && s.onUpdate(a);
          },
          onComplete: () => {
            s.onComplete && s.onComplete(), this.completeAnimation();
          }
        }), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
      const s = this.getStack();
      s && s.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(Mc), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const s = this.getLead();
      let { targetWithTransforms: a, target: l, layout: c, latestValues: u } = s;
      if (!(!a || !l || !c)) {
        if (this !== s && this.layout && c && lh(this.options.animationType, this.layout.layoutBox, c.layoutBox)) {
          l = this.target || Le();
          const d = ct(this.layout.layoutBox.x);
          l.x.min = s.target.x.min, l.x.max = l.x.min + d;
          const h = ct(this.layout.layoutBox.y);
          l.y.min = s.target.y.min, l.y.max = l.y.min + h;
        }
        dt(a, l), $n(a, u), Tr(this.projectionDeltaWithTransform, this.layoutCorrected, a, u);
      }
    }
    registerSharedNode(s, a) {
      this.sharedNodes.has(s) || this.sharedNodes.set(s, new dw()), this.sharedNodes.get(s).add(a);
      const c = a.options.initialPromotionConfig;
      a.promote({
        transition: c ? c.transition : void 0,
        preserveFollowOpacity: c && c.shouldPreserveFollowOpacity ? c.shouldPreserveFollowOpacity(a) : void 0
      });
    }
    isLead() {
      const s = this.getStack();
      return s ? s.lead === this : !0;
    }
    getLead() {
      var s;
      const { layoutId: a } = this.options;
      return a ? ((s = this.getStack()) === null || s === void 0 ? void 0 : s.lead) || this : this;
    }
    getPrevLead() {
      var s;
      const { layoutId: a } = this.options;
      return a ? (s = this.getStack()) === null || s === void 0 ? void 0 : s.prevLead : void 0;
    }
    getStack() {
      const { layoutId: s } = this.options;
      if (s)
        return this.root.sharedNodes.get(s);
    }
    promote({ needsReset: s, transition: a, preserveFollowOpacity: l } = {}) {
      const c = this.getStack();
      c && c.promote(this, l), s && (this.projectionDelta = void 0, this.needsReset = !0), a && this.setOptions({ transition: a });
    }
    relegate() {
      const s = this.getStack();
      return s ? s.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: s } = this.options;
      if (!s)
        return;
      let a = !1;
      const { latestValues: l } = s;
      if ((l.z || l.rotate || l.rotateX || l.rotateY || l.rotateZ || l.skewX || l.skewY) && (a = !0), !a)
        return;
      const c = {};
      l.z && Mo("z", s, c, this.animationValues);
      for (let u = 0; u < Do.length; u++)
        Mo(`rotate${Do[u]}`, s, c, this.animationValues), Mo(`skew${Do[u]}`, s, c, this.animationValues);
      s.render();
      for (const u in c)
        s.setStaticValue(u, c[u]), this.animationValues && (this.animationValues[u] = c[u]);
      s.scheduleRender();
    }
    getProjectionStyles(s) {
      var a, l;
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible)
        return hw;
      const c = {
        visibility: ""
      }, u = this.getTransformTemplate();
      if (this.needsReset)
        return this.needsReset = !1, c.opacity = "", c.pointerEvents = fi(s?.pointerEvents) || "", c.transform = u ? u(this.latestValues, "") : "none", c;
      const d = this.getLead();
      if (!this.projectionDelta || !this.layout || !d.target) {
        const p = {};
        return this.options.layoutId && (p.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, p.pointerEvents = fi(s?.pointerEvents) || ""), this.hasProjected && !yn(this.latestValues) && (p.transform = u ? u({}, "") : "none", this.hasProjected = !1), p;
      }
      const h = d.animationValues || d.latestValues;
      this.applyTransformsToTarget(), c.transform = fw(this.projectionDeltaWithTransform, this.treeScale, h), u && (c.transform = u(h, c.transform));
      const { x: f, y: m } = this.projectionDelta;
      c.transformOrigin = `${f.origin * 100}% ${m.origin * 100}% 0`, d.animationValues ? c.opacity = d === this ? (l = (a = h.opacity) !== null && a !== void 0 ? a : this.latestValues.opacity) !== null && l !== void 0 ? l : 1 : this.preserveOpacity ? this.latestValues.opacity : h.opacityExit : c.opacity = d === this ? h.opacity !== void 0 ? h.opacity : "" : h.opacityExit !== void 0 ? h.opacityExit : 0;
      for (const p in Si) {
        if (h[p] === void 0)
          continue;
        const { correct: y, applyTo: g } = Si[p], x = c.transform === "none" ? h[p] : y(h[p], d);
        if (g) {
          const w = g.length;
          for (let P = 0; P < w; P++)
            c[g[P]] = x;
        } else
          c[p] = x;
      }
      return this.options.layoutId && (c.pointerEvents = d === this ? fi(s?.pointerEvents) || "" : "none"), c;
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((s) => {
        var a;
        return (a = s.currentAnimation) === null || a === void 0 ? void 0 : a.stop();
      }), this.root.nodes.forEach(Oc), this.root.sharedNodes.clear();
    }
  };
}
function mw(e) {
  e.updateLayout();
}
function gw(e) {
  var t;
  const n = ((t = e.resumeFrom) === null || t === void 0 ? void 0 : t.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: i } = e.layout, { animationType: o } = e.options, s = n.source !== e.layout.source;
    o === "size" ? ft((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = ct(h);
      h.min = r[d].min, h.max = h.min + f;
    }) : lh(o, n.layoutBox, r) && ft((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = ct(r[d]);
      h.max = h.min + f, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[d].max = e.relativeTarget[d].min + f);
    });
    const a = zn();
    Tr(a, r, n.layoutBox);
    const l = zn();
    s ? Tr(l, e.applyTransform(i, !0), n.measuredBox) : Tr(l, r, n.layoutBox);
    const c = !ih(a);
    let u = !1;
    if (!e.resumeFrom) {
      const d = e.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: h, layout: f } = d;
        if (h && f) {
          const m = Le();
          Er(m, n.layoutBox, h.layoutBox);
          const p = Le();
          Er(p, r, f.layoutBox), oh(m, p) || (u = !0), d.options.layoutRoot && (e.relativeTarget = p, e.relativeTargetOrigin = m, e.relativeParent = d);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: r,
      snapshot: n,
      delta: l,
      layoutDelta: a,
      hasLayoutChanged: c,
      hasRelativeTargetChanged: u
    });
  } else if (e.isLead()) {
    const { onExitComplete: r } = e.options;
    r && r();
  }
  e.options.transition = void 0;
}
function yw(e) {
  wr && vn.totalNodes++, e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function vw(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function bw(e) {
  e.clearSnapshot();
}
function Oc(e) {
  e.clearMeasurements();
}
function xw(e) {
  e.isLayoutDirty = !1;
}
function ww(e) {
  const { visualElement: t } = e.options;
  t && t.getProps().onBeforeLayoutMeasure && t.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function Lc(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function Sw(e) {
  e.resolveTargetDelta();
}
function kw(e) {
  e.calcProjection();
}
function Cw(e) {
  e.resetSkewAndRotation();
}
function Tw(e) {
  e.removeLeadSnapshot();
}
function _c(e, t, n) {
  e.translate = De(t.translate, 0, n), e.scale = De(t.scale, 1, n), e.origin = t.origin, e.originPoint = t.originPoint;
}
function Fc(e, t, n, r) {
  e.min = De(t.min, n.min, r), e.max = De(t.max, n.max, r);
}
function Ew(e, t, n, r) {
  Fc(e.x, t.x, n.x, r), Fc(e.y, t.y, n.y, r);
}
function Pw(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const Aw = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, Vc = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), Bc = Vc("applewebkit/") && !Vc("chrome/") ? Math.round : tt;
function zc(e) {
  e.min = Bc(e.min), e.max = Bc(e.max);
}
function Rw(e) {
  zc(e.x), zc(e.y);
}
function lh(e, t, n) {
  return e === "position" || e === "preserve-aspect" && !Dx(Ic(t), Ic(n), 0.2);
}
function Nw(e) {
  var t;
  return e !== e.root && ((t = e.scroll) === null || t === void 0 ? void 0 : t.wasRoot);
}
const Iw = ah({
  attachResizeListener: (e, t) => Or(e, "resize", t),
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body.scrollLeft,
    y: document.documentElement.scrollTop || document.body.scrollTop
  }),
  checkIsScrollRoot: () => !0
}), Oo = {
  current: void 0
}, ch = ah({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!Oo.current) {
      const e = new Iw({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), Oo.current = e;
    }
    return Oo.current;
  },
  resetTransform: (e, t) => {
    e.style.transform = t !== void 0 ? t : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), Dw = {
  pan: {
    Feature: Gx
  },
  drag: {
    Feature: Kx,
    ProjectionNode: ch,
    MeasureLayout: th
  }
};
function jc(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileHover && e.animationState.setActive("whileHover", n === "Start");
  const i = "onHover" + n, o = r[i];
  o && Pe.postRender(() => o(t, Ur(t)));
}
class Mw extends cn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = Dv(t, (n) => (jc(this.node, n, "Start"), (r) => jc(this.node, r, "End"))));
  }
  unmount() {
  }
}
class Ow extends cn {
  constructor() {
    super(...arguments), this.isActive = !1;
  }
  onFocus() {
    let t = !1;
    try {
      t = this.node.current.matches(":focus-visible");
    } catch {
      t = !0;
    }
    !t || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0);
  }
  onBlur() {
    !this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1);
  }
  mount() {
    this.unmount = $r(Or(this.node.current, "focus", () => this.onFocus()), Or(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function $c(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileTap && e.animationState.setActive("whileTap", n === "Start");
  const i = "onTap" + (n === "End" ? "" : n), o = r[i];
  o && Pe.postRender(() => o(t, Ur(t)));
}
class Lw extends cn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = _v(t, (n) => ($c(this.node, n, "Start"), (r, { success: i }) => $c(this.node, r, i ? "End" : "Cancel")), { useGlobalTarget: this.node.props.globalTapTarget }));
  }
  unmount() {
  }
}
const ks = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), _w = (e) => {
  const t = ks.get(e.target);
  t && t(e);
}, Fw = (e) => {
  e.forEach(_w);
};
function Vw({ root: e, ...t }) {
  const n = e || document;
  Lo.has(n) || Lo.set(n, {});
  const r = Lo.get(n), i = JSON.stringify(t);
  return r[i] || (r[i] = new IntersectionObserver(Fw, { root: e, ...t })), r[i];
}
function Bw(e, t, n) {
  const r = Vw(t);
  return ks.set(e, n), r.observe(e), () => {
    ks.delete(e), r.unobserve(e);
  };
}
const zw = {
  some: 0,
  all: 1
};
class jw extends cn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    this.unmount();
    const { viewport: t = {} } = this.node.getProps(), { root: n, margin: r, amount: i = "some", once: o } = t, s = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof i == "number" ? i : zw[i]
    }, a = (l) => {
      const { isIntersecting: c } = l;
      if (this.isInView === c || (this.isInView = c, o && !c && this.hasEnteredView))
        return;
      c && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", c);
      const { onViewportEnter: u, onViewportLeave: d } = this.node.getProps(), h = c ? u : d;
      h && h(l);
    };
    return Bw(this.node.current, s, a);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: t, prevProps: n } = this.node;
    ["amount", "margin", "root"].some($w(t, n)) && this.startObserver();
  }
  unmount() {
  }
}
function $w({ viewport: e = {} }, { viewport: t = {} } = {}) {
  return (n) => e[n] !== t[n];
}
const Uw = {
  inView: {
    Feature: jw
  },
  tap: {
    Feature: Lw
  },
  focus: {
    Feature: Ow
  },
  hover: {
    Feature: Mw
  }
}, Hw = {
  layout: {
    ProjectionNode: ch,
    MeasureLayout: th
  }
}, Cs = { current: null }, uh = { current: !1 };
function Ww() {
  if (uh.current = !0, !!ea)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => Cs.current = e.matches;
      e.addListener(t), t();
    } else
      Cs.current = !1;
}
const qw = [...Lf, We, sn], Kw = (e) => qw.find(Of(e)), Uc = /* @__PURE__ */ new WeakMap();
function Gw(e, t, n) {
  for (const r in t) {
    const i = t[r], o = n[r];
    if (Ke(i))
      e.addValue(r, i), process.env.NODE_ENV === "development" && Hi(i.version === "11.18.2", `Attempting to mix Motion versions ${i.version} with 11.18.2 may not work as expected.`);
    else if (Ke(o))
      e.addValue(r, Dr(i, { owner: e }));
    else if (o !== i)
      if (e.hasValue(r)) {
        const s = e.getValue(r);
        s.liveStyle === !0 ? s.jump(i) : s.hasAnimated || s.set(i);
      } else {
        const s = e.getStaticValue(r);
        e.addValue(r, Dr(s !== void 0 ? s : i, { owner: e }));
      }
  }
  for (const r in n)
    t[r] === void 0 && e.removeValue(r);
  return t;
}
const Hc = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
class Yw {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(t, n, r) {
    return {};
  }
  constructor({ parent: t, props: n, presenceContext: r, reducedMotionConfig: i, blockInitialAnimation: o, visualState: s }, a = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = Pa, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const f = It.now();
      this.renderScheduledAt < f && (this.renderScheduledAt = f, Pe.render(this.render, !1, !0));
    };
    const { latestValues: l, renderState: c, onUpdate: u } = s;
    this.onUpdate = u, this.latestValues = l, this.baseTarget = { ...l }, this.initialValues = n.initial ? { ...l } : {}, this.renderState = c, this.parent = t, this.props = n, this.presenceContext = r, this.depth = t ? t.depth + 1 : 0, this.reducedMotionConfig = i, this.options = a, this.blockInitialAnimation = !!o, this.isControllingVariants = Ki(n), this.isVariantNode = $d(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(t && t.current);
    const { willChange: d, ...h } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const f in h) {
      const m = h[f];
      l[f] !== void 0 && Ke(m) && m.set(l[f], !1);
    }
  }
  mount(t) {
    this.current = t, Uc.set(t, this), this.projection && !this.projection.instance && this.projection.mount(t), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((n, r) => this.bindToMotionValue(r, n)), uh.current || Ww(), this.shouldReduceMotion = this.reducedMotionConfig === "never" ? !1 : this.reducedMotionConfig === "always" ? !0 : Cs.current, process.env.NODE_ENV !== "production" && Hi(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected."), this.parent && this.parent.children.add(this), this.update(this.props, this.presenceContext);
  }
  unmount() {
    Uc.delete(this.current), this.projection && this.projection.unmount(), on(this.notifyUpdate), on(this.render), this.valueSubscriptions.forEach((t) => t()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent && this.parent.children.delete(this);
    for (const t in this.events)
      this.events[t].clear();
    for (const t in this.features) {
      const n = this.features[t];
      n && (n.unmount(), n.isMounted = !1);
    }
    this.current = null;
  }
  bindToMotionValue(t, n) {
    this.valueSubscriptions.has(t) && this.valueSubscriptions.get(t)();
    const r = Rn.has(t), i = n.on("change", (a) => {
      this.latestValues[t] = a, this.props.onUpdate && Pe.preRender(this.notifyUpdate), r && this.projection && (this.projection.isTransformDirty = !0);
    }), o = n.on("renderRequest", this.scheduleRender);
    let s;
    window.MotionCheckAppearSync && (s = window.MotionCheckAppearSync(this, t, n)), this.valueSubscriptions.set(t, () => {
      i(), o(), s && s(), n.owner && n.stop();
    });
  }
  sortNodePosition(t) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== t.type ? 0 : this.sortInstanceNodePosition(this.current, t.current);
  }
  updateFeatures() {
    let t = "animation";
    for (t in Gn) {
      const n = Gn[t];
      if (!n)
        continue;
      const { isEnabled: r, Feature: i } = n;
      if (!this.features[t] && i && r(this.props) && (this.features[t] = new i(this)), this.features[t]) {
        const o = this.features[t];
        o.isMounted ? o.update() : (o.mount(), o.isMounted = !0);
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  /**
   * Measure the current viewport box with or without transforms.
   * Only measures axis-aligned boxes, rotate and skew must be manually
   * removed with a re-render to work.
   */
  measureViewportBox() {
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Le();
  }
  getStaticValue(t) {
    return this.latestValues[t];
  }
  setStaticValue(t, n) {
    this.latestValues[t] = n;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(t, n) {
    (t.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = t, this.prevPresenceContext = this.presenceContext, this.presenceContext = n;
    for (let r = 0; r < Hc.length; r++) {
      const i = Hc[r];
      this.propEventSubscriptions[i] && (this.propEventSubscriptions[i](), delete this.propEventSubscriptions[i]);
      const o = "on" + i, s = t[o];
      s && (this.propEventSubscriptions[i] = this.on(i, s));
    }
    this.prevMotionValues = Gw(this, this.scrapeMotionValuesFromProps(t, this.prevProps, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue(), this.onUpdate && this.onUpdate(this);
  }
  getProps() {
    return this.props;
  }
  /**
   * Returns the variant definition with a given name.
   */
  getVariant(t) {
    return this.props.variants ? this.props.variants[t] : void 0;
  }
  /**
   * Returns the defined default transition on this component.
   */
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
  }
  /**
   * Add a child visual element to our set of children.
   */
  addVariantChild(t) {
    const n = this.getClosestVariantNode();
    if (n)
      return n.variantChildren && n.variantChildren.add(t), () => n.variantChildren.delete(t);
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(t, n) {
    const r = this.values.get(t);
    n !== r && (r && this.removeValue(t), this.bindToMotionValue(t, n), this.values.set(t, n), this.latestValues[t] = n.get());
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(t) {
    this.values.delete(t);
    const n = this.valueSubscriptions.get(t);
    n && (n(), this.valueSubscriptions.delete(t)), delete this.latestValues[t], this.removeValueFromRenderState(t, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(t) {
    return this.values.has(t);
  }
  getValue(t, n) {
    if (this.props.values && this.props.values[t])
      return this.props.values[t];
    let r = this.values.get(t);
    return r === void 0 && n !== void 0 && (r = Dr(n === null ? void 0 : n, { owner: this }), this.addValue(t, r)), r;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(t, n) {
    var r;
    let i = this.latestValues[t] !== void 0 || !this.current ? this.latestValues[t] : (r = this.getBaseTargetFromProps(this.props, t)) !== null && r !== void 0 ? r : this.readValueFromInstance(this.current, t, this.options);
    return i != null && (typeof i == "string" && (Df(i) || kf(i)) ? i = parseFloat(i) : !Kw(i) && sn.test(n) && (i = Rf(t, n)), this.setBaseTarget(t, Ke(i) ? i.get() : i)), Ke(i) ? i.get() : i;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(t, n) {
    this.baseTarget[t] = n;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(t) {
    var n;
    const { initial: r } = this.props;
    let i;
    if (typeof r == "string" || typeof r == "object") {
      const s = aa(this.props, r, (n = this.presenceContext) === null || n === void 0 ? void 0 : n.custom);
      s && (i = s[t]);
    }
    if (r && i !== void 0)
      return i;
    const o = this.getBaseTargetFromProps(this.props, t);
    return o !== void 0 && !Ke(o) ? o : this.initialValues[t] !== void 0 && i === void 0 ? void 0 : this.baseTarget[t];
  }
  on(t, n) {
    return this.events[t] || (this.events[t] = new wa()), this.events[t].add(n);
  }
  notify(t, ...n) {
    this.events[t] && this.events[t].notify(...n);
  }
}
class dh extends Yw {
  constructor() {
    super(...arguments), this.KeyframeResolver = _f;
  }
  sortInstanceNodePosition(t, n) {
    return t.compareDocumentPosition(n) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(t, n) {
    return t.style ? t.style[n] : void 0;
  }
  removeValueFromRenderState(t, { vars: n, style: r }) {
    delete n[t], delete r[t];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: t } = this.props;
    Ke(t) && (this.childSubscription = t.on("change", (n) => {
      this.current && (this.current.textContent = `${n}`);
    }));
  }
}
function Xw(e) {
  return window.getComputedStyle(e);
}
class Zw extends dh {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = Zd;
  }
  readValueFromInstance(t, n) {
    if (Rn.has(n)) {
      const r = Ea(n);
      return r && r.default || 0;
    } else {
      const r = Xw(t), i = (Gd(n) ? r.getPropertyValue(n) : r[n]) || 0;
      return typeof i == "string" ? i.trim() : i;
    }
  }
  measureInstanceViewportBox(t, { transformPagePoint: n }) {
    return Qf(t, n);
  }
  build(t, n, r) {
    ua(t, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return pa(t, n, r);
  }
}
class Jw extends dh {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Le;
  }
  getBaseTargetFromProps(t, n) {
    return t[n];
  }
  readValueFromInstance(t, n) {
    if (Rn.has(n)) {
      const r = Ea(n);
      return r && r.default || 0;
    }
    return n = Jd.has(n) ? n : ia(n), t.getAttribute(n);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return tf(t, n, r);
  }
  build(t, n, r) {
    da(t, n, this.isSVGTag, r.transformTemplate);
  }
  renderInstance(t, n, r, i) {
    Qd(t, n, r, i);
  }
  mount(t) {
    this.isSVGTag = ha(t.tagName), super.mount(t);
  }
}
const Qw = (e, t) => sa(e) ? new Jw(t) : new Zw(t, {
  allowProjection: e !== xd
}), e0 = /* @__PURE__ */ Tv({
  ...kx,
  ...Uw,
  ...Dw,
  ...Hw
}, Qw), zt = /* @__PURE__ */ zy(e0);
function pe(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(i) {
    if (e?.(i), n === !1 || !i.defaultPrevented)
      return t?.(i);
  };
}
function t0(e, t) {
  const n = b.createContext(t), r = (o) => {
    const { children: s, ...a } = o, l = b.useMemo(() => a, Object.values(a));
    return /* @__PURE__ */ v(n.Provider, { value: l, children: s });
  };
  r.displayName = e + "Provider";
  function i(o) {
    const s = b.useContext(n);
    if (s) return s;
    if (t !== void 0) return t;
    throw new Error(`\`${o}\` must be used within \`${e}\``);
  }
  return [r, i];
}
function sr(e, t = []) {
  let n = [];
  function r(o, s) {
    const a = b.createContext(s), l = n.length;
    n = [...n, s];
    const c = (d) => {
      const { scope: h, children: f, ...m } = d, p = h?.[e]?.[l] || a, y = b.useMemo(() => m, Object.values(m));
      return /* @__PURE__ */ v(p.Provider, { value: y, children: f });
    };
    c.displayName = o + "Provider";
    function u(d, h) {
      const f = h?.[e]?.[l] || a, m = b.useContext(f);
      if (m) return m;
      if (s !== void 0) return s;
      throw new Error(`\`${d}\` must be used within \`${o}\``);
    }
    return [c, u];
  }
  const i = () => {
    const o = n.map((s) => b.createContext(s));
    return function(a) {
      const l = a?.[e] || o;
      return b.useMemo(
        () => ({ [`__scope${e}`]: { ...a, [e]: l } }),
        [a, l]
      );
    };
  };
  return i.scopeName = e, [r, n0(i, ...t)];
}
function n0(...e) {
  const t = e[0];
  if (e.length === 1) return t;
  const n = () => {
    const r = e.map((i) => ({
      useScope: i(),
      scopeName: i.scopeName
    }));
    return function(o) {
      const s = r.reduce((a, { useScope: l, scopeName: c }) => {
        const d = l(o)[`__scope${c}`];
        return { ...a, ...d };
      }, {});
      return b.useMemo(() => ({ [`__scope${t.scopeName}`]: s }), [s]);
    };
  };
  return n.scopeName = t.scopeName, n;
}
var Ue = globalThis?.document ? b.useLayoutEffect : () => {
}, r0 = b[" useInsertionEffect ".trim().toString()] || Ue;
function Lr({
  prop: e,
  defaultProp: t,
  onChange: n = () => {
  },
  caller: r
}) {
  const [i, o, s] = i0({
    defaultProp: t,
    onChange: n
  }), a = e !== void 0, l = a ? e : i;
  {
    const u = b.useRef(e !== void 0);
    b.useEffect(() => {
      const d = u.current;
      d !== a && console.warn(
        `${r} is changing from ${d ? "controlled" : "uncontrolled"} to ${a ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), u.current = a;
    }, [a, r]);
  }
  const c = b.useCallback(
    (u) => {
      if (a) {
        const d = o0(u) ? u(e) : u;
        d !== e && s.current?.(d);
      } else
        o(u);
    },
    [a, e, o, s]
  );
  return [l, c];
}
function i0({
  defaultProp: e,
  onChange: t
}) {
  const [n, r] = b.useState(e), i = b.useRef(n), o = b.useRef(t);
  return r0(() => {
    o.current = t;
  }, [t]), b.useEffect(() => {
    i.current !== n && (o.current?.(n), i.current = n);
  }, [n, i]), [n, r, o];
}
function o0(e) {
  return typeof e == "function";
}
// @__NO_SIDE_EFFECTS__
function s0(e) {
  const t = /* @__PURE__ */ a0(e), n = b.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = b.Children.toArray(o), l = a.find(c0);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? b.Children.count(c) > 1 ? b.Children.only(null) : b.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ v(t, { ...s, ref: i, children: b.isValidElement(c) ? b.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ v(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function a0(e) {
  const t = b.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (b.isValidElement(i)) {
      const s = d0(i), a = u0(o, i.props);
      return i.type !== b.Fragment && (a.ref = r ? An(r, s) : s), b.cloneElement(i, a);
    }
    return b.Children.count(i) > 1 ? b.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var l0 = /* @__PURE__ */ Symbol("radix.slottable");
function c0(e) {
  return b.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === l0;
}
function u0(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], o = t[r];
    /^on[A-Z]/.test(r) ? i && o ? n[r] = (...a) => {
      const l = o(...a);
      return i(...a), l;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...o } : r === "className" && (n[r] = [i, o].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function d0(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var f0 = [
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
], me = f0.reduce((e, t) => {
  const n = /* @__PURE__ */ s0(`Primitive.${t}`), r = b.forwardRef((i, o) => {
    const { asChild: s, ...a } = i, l = s ? n : t;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = !0), /* @__PURE__ */ v(l, { ...a, ref: o });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {});
function h0(e, t) {
  e && zi.flushSync(() => e.dispatchEvent(t));
}
function p0(e, t) {
  return b.useReducer((n, r) => t[n][r] ?? n, e);
}
var Nn = (e) => {
  const { present: t, children: n } = e, r = m0(t), i = typeof n == "function" ? n({ present: r.isPresent }) : b.Children.only(n), o = Re(r.ref, g0(i));
  return typeof n == "function" || r.isPresent ? b.cloneElement(i, { ref: o }) : null;
};
Nn.displayName = "Presence";
function m0(e) {
  const [t, n] = b.useState(), r = b.useRef(null), i = b.useRef(e), o = b.useRef("none"), s = e ? "mounted" : "unmounted", [a, l] = p0(s, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  return b.useEffect(() => {
    const c = Qr(r.current);
    o.current = a === "mounted" ? c : "none";
  }, [a]), Ue(() => {
    const c = r.current, u = i.current;
    if (u !== e) {
      const h = o.current, f = Qr(c);
      e ? l("MOUNT") : f === "none" || c?.display === "none" ? l("UNMOUNT") : l(u && h !== f ? "ANIMATION_OUT" : "UNMOUNT"), i.current = e;
    }
  }, [e, l]), Ue(() => {
    if (t) {
      let c;
      const u = t.ownerDocument.defaultView ?? window, d = (f) => {
        const p = Qr(r.current).includes(CSS.escape(f.animationName));
        if (f.target === t && p && (l("ANIMATION_END"), !i.current)) {
          const y = t.style.animationFillMode;
          t.style.animationFillMode = "forwards", c = u.setTimeout(() => {
            t.style.animationFillMode === "forwards" && (t.style.animationFillMode = y);
          });
        }
      }, h = (f) => {
        f.target === t && (o.current = Qr(r.current));
      };
      return t.addEventListener("animationstart", h), t.addEventListener("animationcancel", d), t.addEventListener("animationend", d), () => {
        u.clearTimeout(c), t.removeEventListener("animationstart", h), t.removeEventListener("animationcancel", d), t.removeEventListener("animationend", d);
      };
    } else
      l("ANIMATION_END");
  }, [t, l]), {
    isPresent: ["mounted", "unmountSuspended"].includes(a),
    ref: b.useCallback((c) => {
      r.current = c ? getComputedStyle(c) : null, n(c);
    }, [])
  };
}
function Qr(e) {
  return e?.animationName || "none";
}
function g0(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var y0 = b[" useId ".trim().toString()] || (() => {
}), v0 = 0;
function tn(e) {
  const [t, n] = b.useState(y0());
  return Ue(() => {
    n((r) => r ?? String(v0++));
  }, [e]), e || (t ? `radix-${t}` : "");
}
var Xi = "Collapsible", [b0] = sr(Xi), [x0, Ia] = b0(Xi), fh = b.forwardRef(
  (e, t) => {
    const {
      __scopeCollapsible: n,
      open: r,
      defaultOpen: i,
      disabled: o,
      onOpenChange: s,
      ...a
    } = e, [l, c] = Lr({
      prop: r,
      defaultProp: i ?? !1,
      onChange: s,
      caller: Xi
    });
    return /* @__PURE__ */ v(
      x0,
      {
        scope: n,
        disabled: o,
        contentId: tn(),
        open: l,
        onOpenToggle: b.useCallback(() => c((u) => !u), [c]),
        children: /* @__PURE__ */ v(
          me.div,
          {
            "data-state": Ma(l),
            "data-disabled": o ? "" : void 0,
            ...a,
            ref: t
          }
        )
      }
    );
  }
);
fh.displayName = Xi;
var hh = "CollapsibleTrigger", ph = b.forwardRef(
  (e, t) => {
    const { __scopeCollapsible: n, ...r } = e, i = Ia(hh, n);
    return /* @__PURE__ */ v(
      me.button,
      {
        type: "button",
        "aria-controls": i.contentId,
        "aria-expanded": i.open || !1,
        "data-state": Ma(i.open),
        "data-disabled": i.disabled ? "" : void 0,
        disabled: i.disabled,
        ...r,
        ref: t,
        onClick: pe(e.onClick, i.onOpenToggle)
      }
    );
  }
);
ph.displayName = hh;
var Da = "CollapsibleContent", mh = b.forwardRef(
  (e, t) => {
    const { forceMount: n, ...r } = e, i = Ia(Da, e.__scopeCollapsible);
    return /* @__PURE__ */ v(Nn, { present: n || i.open, children: ({ present: o }) => /* @__PURE__ */ v(w0, { ...r, ref: t, present: o }) });
  }
);
mh.displayName = Da;
var w0 = b.forwardRef((e, t) => {
  const { __scopeCollapsible: n, present: r, children: i, ...o } = e, s = Ia(Da, n), [a, l] = b.useState(r), c = b.useRef(null), u = Re(t, c), d = b.useRef(0), h = d.current, f = b.useRef(0), m = f.current, p = s.open || a, y = b.useRef(p), g = b.useRef(void 0);
  return b.useEffect(() => {
    const x = requestAnimationFrame(() => y.current = !1);
    return () => cancelAnimationFrame(x);
  }, []), Ue(() => {
    const x = c.current;
    if (x) {
      g.current = g.current || {
        transitionDuration: x.style.transitionDuration,
        animationName: x.style.animationName
      }, x.style.transitionDuration = "0s", x.style.animationName = "none";
      const w = x.getBoundingClientRect();
      d.current = w.height, f.current = w.width, y.current || (x.style.transitionDuration = g.current.transitionDuration, x.style.animationName = g.current.animationName), l(r);
    }
  }, [s.open, r]), /* @__PURE__ */ v(
    me.div,
    {
      "data-state": Ma(s.open),
      "data-disabled": s.disabled ? "" : void 0,
      id: s.contentId,
      hidden: !p,
      ...o,
      ref: u,
      style: {
        "--radix-collapsible-content-height": h ? `${h}px` : void 0,
        "--radix-collapsible-content-width": m ? `${m}px` : void 0,
        ...e.style
      },
      children: p && i
    }
  );
});
function Ma(e) {
  return e ? "open" : "closed";
}
var S0 = fh;
function k0({
  ...e
}) {
  return /* @__PURE__ */ v(S0, { "data-slot": "collapsible", ...e });
}
function C0({
  ...e
}) {
  return /* @__PURE__ */ v(
    ph,
    {
      "data-slot": "collapsible-trigger",
      ...e
    }
  );
}
function T0({
  ...e
}) {
  return /* @__PURE__ */ v(
    mh,
    {
      "data-slot": "collapsible-content",
      ...e
    }
  );
}
const Oa = V.forwardRef(
  (e, t) => e.file.type.startsWith("image/") ? /* @__PURE__ */ v(gh, { ...e, ref: t }) : e.file.type.startsWith("text/") || e.file.name.endsWith(".txt") || e.file.name.endsWith(".md") ? /* @__PURE__ */ v(yh, { ...e, ref: t }) : /* @__PURE__ */ v(vh, { ...e, ref: t })
);
Oa.displayName = "FilePreview";
const gh = V.forwardRef(
  ({ file: e, onRemove: t }, n) => /* @__PURE__ */ _(
    zt.div,
    {
      ref: n,
      className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
      layout: !0,
      initial: { opacity: 0, y: "100%" },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: "100%" },
      children: [
        /* @__PURE__ */ _("div", { className: "flex w-full items-center space-x-2", children: [
          /* @__PURE__ */ v(
            "img",
            {
              alt: `Attachment ${e.name}`,
              className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover",
              src: URL.createObjectURL(e)
            }
          ),
          /* @__PURE__ */ v("span", { className: "w-full truncate text-muted-foreground", children: e.name })
        ] }),
        t ? /* @__PURE__ */ v(
          "button",
          {
            className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
            type: "button",
            onClick: t,
            "aria-label": "Remove attachment",
            children: /* @__PURE__ */ v(tr, { className: "h-2.5 w-2.5" })
          }
        ) : null
      ]
    }
  )
);
gh.displayName = "ImageFilePreview";
const yh = V.forwardRef(
  ({ file: e, onRemove: t }, n) => {
    const [r, i] = V.useState("");
    return Ze(() => {
      const o = new FileReader();
      o.onload = (s) => {
        const a = s.target?.result;
        i(a.slice(0, 50) + (a.length > 50 ? "..." : ""));
      }, o.readAsText(e);
    }, [e]), /* @__PURE__ */ _(
      zt.div,
      {
        ref: n,
        className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        children: [
          /* @__PURE__ */ _("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ v("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5", children: /* @__PURE__ */ v("div", { className: "h-full w-full overflow-hidden text-[6px] leading-none text-muted-foreground", children: r || "Loading..." }) }),
            /* @__PURE__ */ v("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ v(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
              type: "button",
              onClick: t,
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ v(tr, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
yh.displayName = "TextFilePreview";
const vh = V.forwardRef(
  ({ file: e, onRemove: t }, n) => /* @__PURE__ */ _(
    zt.div,
    {
      ref: n,
      className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
      layout: !0,
      initial: { opacity: 0, y: "100%" },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: "100%" },
      children: [
        /* @__PURE__ */ _("div", { className: "flex w-full items-center space-x-2", children: [
          /* @__PURE__ */ v("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted", children: /* @__PURE__ */ v(Pg, { className: "h-6 w-6 text-foreground" }) }),
          /* @__PURE__ */ v("span", { className: "w-full truncate text-muted-foreground", children: e.name })
        ] }),
        t ? /* @__PURE__ */ v(
          "button",
          {
            className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
            type: "button",
            onClick: t,
            "aria-label": "Remove attachment",
            children: /* @__PURE__ */ v(tr, { className: "h-2.5 w-2.5" })
          }
        ) : null
      ]
    }
  )
);
vh.displayName = "GenericFilePreview";
function E0(e, t) {
  const n = t || {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const P0 = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, A0 = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, R0 = {};
function Wc(e, t) {
  return (R0.jsx ? A0 : P0).test(e);
}
const N0 = /[ \t\n\f\r]/g;
function I0(e) {
  return typeof e == "object" ? e.type === "text" ? qc(e.value) : !1 : qc(e);
}
function qc(e) {
  return e.replace(N0, "") === "";
}
class Hr {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(t, n, r) {
    this.normal = n, this.property = t, r && (this.space = r);
  }
}
Hr.prototype.normal = {};
Hr.prototype.property = {};
Hr.prototype.space = void 0;
function bh(e, t) {
  const n = {}, r = {};
  for (const i of e)
    Object.assign(n, i.property), Object.assign(r, i.normal);
  return new Hr(n, r, t);
}
function Ts(e) {
  return e.toLowerCase();
}
class nt {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(t, n) {
    this.attribute = n, this.property = t;
  }
}
nt.prototype.attribute = "";
nt.prototype.booleanish = !1;
nt.prototype.boolean = !1;
nt.prototype.commaOrSpaceSeparated = !1;
nt.prototype.commaSeparated = !1;
nt.prototype.defined = !1;
nt.prototype.mustUseProperty = !1;
nt.prototype.number = !1;
nt.prototype.overloadedBoolean = !1;
nt.prototype.property = "";
nt.prototype.spaceSeparated = !1;
nt.prototype.space = void 0;
let D0 = 0;
const te = In(), Be = In(), Es = In(), F = In(), Ce = In(), Hn = In(), ot = In();
function In() {
  return 2 ** ++D0;
}
const Ps = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: te,
  booleanish: Be,
  commaOrSpaceSeparated: ot,
  commaSeparated: Hn,
  number: F,
  overloadedBoolean: Es,
  spaceSeparated: Ce
}, Symbol.toStringTag, { value: "Module" })), _o = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(Ps)
);
class La extends nt {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(t, n, r, i) {
    let o = -1;
    if (super(t, n), Kc(this, "space", i), typeof r == "number")
      for (; ++o < _o.length; ) {
        const s = _o[o];
        Kc(this, _o[o], (r & Ps[s]) === Ps[s]);
      }
  }
}
La.prototype.defined = !0;
function Kc(e, t, n) {
  n && (e[t] = n);
}
function ar(e) {
  const t = {}, n = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const o = new La(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (o.mustUseProperty = !0), t[r] = o, n[Ts(r)] = r, n[Ts(o.attribute)] = r;
  }
  return new Hr(t, n, e.space);
}
const xh = ar({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: Be,
    ariaAutoComplete: null,
    ariaBusy: Be,
    ariaChecked: Be,
    ariaColCount: F,
    ariaColIndex: F,
    ariaColSpan: F,
    ariaControls: Ce,
    ariaCurrent: null,
    ariaDescribedBy: Ce,
    ariaDetails: null,
    ariaDisabled: Be,
    ariaDropEffect: Ce,
    ariaErrorMessage: null,
    ariaExpanded: Be,
    ariaFlowTo: Ce,
    ariaGrabbed: Be,
    ariaHasPopup: null,
    ariaHidden: Be,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: Ce,
    ariaLevel: F,
    ariaLive: null,
    ariaModal: Be,
    ariaMultiLine: Be,
    ariaMultiSelectable: Be,
    ariaOrientation: null,
    ariaOwns: Ce,
    ariaPlaceholder: null,
    ariaPosInSet: F,
    ariaPressed: Be,
    ariaReadOnly: Be,
    ariaRelevant: null,
    ariaRequired: Be,
    ariaRoleDescription: Ce,
    ariaRowCount: F,
    ariaRowIndex: F,
    ariaRowSpan: F,
    ariaSelected: Be,
    ariaSetSize: F,
    ariaSort: null,
    ariaValueMax: F,
    ariaValueMin: F,
    ariaValueNow: F,
    ariaValueText: null,
    role: null
  },
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  }
});
function wh(e, t) {
  return t in e ? e[t] : t;
}
function Sh(e, t) {
  return wh(e, t.toLowerCase());
}
const M0 = ar({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: Hn,
    acceptCharset: Ce,
    accessKey: Ce,
    action: null,
    allow: null,
    allowFullScreen: te,
    allowPaymentRequest: te,
    allowUserMedia: te,
    alt: null,
    as: null,
    async: te,
    autoCapitalize: null,
    autoComplete: Ce,
    autoFocus: te,
    autoPlay: te,
    blocking: Ce,
    capture: null,
    charSet: null,
    checked: te,
    cite: null,
    className: Ce,
    cols: F,
    colSpan: null,
    content: null,
    contentEditable: Be,
    controls: te,
    controlsList: Ce,
    coords: F | Hn,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: te,
    defer: te,
    dir: null,
    dirName: null,
    disabled: te,
    download: Es,
    draggable: Be,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: te,
    formTarget: null,
    headers: Ce,
    height: F,
    hidden: Es,
    high: F,
    href: null,
    hrefLang: null,
    htmlFor: Ce,
    httpEquiv: Ce,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: te,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: te,
    itemId: null,
    itemProp: Ce,
    itemRef: Ce,
    itemScope: te,
    itemType: Ce,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: te,
    low: F,
    manifest: null,
    max: null,
    maxLength: F,
    media: null,
    method: null,
    min: null,
    minLength: F,
    multiple: te,
    muted: te,
    name: null,
    nonce: null,
    noModule: te,
    noValidate: te,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: te,
    optimum: F,
    pattern: null,
    ping: Ce,
    placeholder: null,
    playsInline: te,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: te,
    referrerPolicy: null,
    rel: Ce,
    required: te,
    reversed: te,
    rows: F,
    rowSpan: F,
    sandbox: Ce,
    scope: null,
    scoped: te,
    seamless: te,
    selected: te,
    shadowRootClonable: te,
    shadowRootDelegatesFocus: te,
    shadowRootMode: null,
    shape: null,
    size: F,
    sizes: null,
    slot: null,
    span: F,
    spellCheck: Be,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: F,
    step: null,
    style: null,
    tabIndex: F,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: te,
    useMap: null,
    value: Be,
    width: F,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: Ce,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: F,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: F,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: te,
    // Lists. Use CSS to reduce space between items instead
    declare: te,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: F,
    // `<img>` and `<object>`
    leftMargin: F,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: F,
    // `<body>`
    marginWidth: F,
    // `<body>`
    noResize: te,
    // `<frame>`
    noHref: te,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: te,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: te,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: F,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: Be,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: F,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: F,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: te,
    disableRemotePlayback: te,
    prefix: null,
    property: null,
    results: F,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: Sh
}), O0 = ar({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: ot,
    accentHeight: F,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: F,
    amplitude: F,
    arabicForm: null,
    ascent: F,
    attributeName: null,
    attributeType: null,
    azimuth: F,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: F,
    by: null,
    calcMode: null,
    capHeight: F,
    className: Ce,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: F,
    diffuseConstant: F,
    direction: null,
    display: null,
    dur: null,
    divisor: F,
    dominantBaseline: null,
    download: te,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: F,
    enableBackground: null,
    end: null,
    event: null,
    exponent: F,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: F,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: Hn,
    g2: Hn,
    glyphName: Hn,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: F,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: F,
    horizOriginX: F,
    horizOriginY: F,
    id: null,
    ideographic: F,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: F,
    k: F,
    k1: F,
    k2: F,
    k3: F,
    k4: F,
    kernelMatrix: ot,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: F,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: F,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: F,
    overlineThickness: F,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: F,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: Ce,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: F,
    pointsAtY: F,
    pointsAtZ: F,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: ot,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: ot,
    rev: ot,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: ot,
    requiredFeatures: ot,
    requiredFonts: ot,
    requiredFormats: ot,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: F,
    specularExponent: F,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: F,
    strikethroughThickness: F,
    string: null,
    stroke: null,
    strokeDashArray: ot,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: F,
    strokeOpacity: F,
    strokeWidth: null,
    style: null,
    surfaceScale: F,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: ot,
    tabIndex: F,
    tableValues: null,
    target: null,
    targetX: F,
    targetY: F,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: ot,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: F,
    underlineThickness: F,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: F,
    values: null,
    vAlphabetic: F,
    vMathematical: F,
    vectorEffect: null,
    vHanging: F,
    vIdeographic: F,
    version: null,
    vertAdvY: F,
    vertOriginX: F,
    vertOriginY: F,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: F,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: wh
}), kh = ar({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(e, t) {
    return "xlink:" + t.slice(5).toLowerCase();
  }
}), Ch = ar({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: Sh
}), Th = ar({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  }
}), L0 = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
}, _0 = /[A-Z]/g, Gc = /-[a-z]/g, F0 = /^data[-\w.:]+$/i;
function V0(e, t) {
  const n = Ts(t);
  let r = t, i = nt;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && F0.test(t)) {
    if (t.charAt(4) === "-") {
      const o = t.slice(5).replace(Gc, z0);
      r = "data" + o.charAt(0).toUpperCase() + o.slice(1);
    } else {
      const o = t.slice(4);
      if (!Gc.test(o)) {
        let s = o.replace(_0, B0);
        s.charAt(0) !== "-" && (s = "-" + s), t = "data" + s;
      }
    }
    i = La;
  }
  return new i(r, t);
}
function B0(e) {
  return "-" + e.toLowerCase();
}
function z0(e) {
  return e.charAt(1).toUpperCase();
}
const j0 = bh([xh, M0, kh, Ch, Th], "html"), _a = bh([xh, O0, kh, Ch, Th], "svg");
function $0(e) {
  return e.join(" ").trim();
}
function Eh(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Dn = {}, Fo, Yc;
function U0() {
  if (Yc) return Fo;
  Yc = 1;
  var e = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, t = /\n/g, n = /^\s*/, r = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, i = /^:\s*/, o = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, s = /^[;\s]*/, a = /^\s+|\s+$/g, l = `
`, c = "/", u = "*", d = "", h = "comment", f = "declaration";
  function m(y, g) {
    if (typeof y != "string")
      throw new TypeError("First argument must be a string");
    if (!y) return [];
    g = g || {};
    var x = 1, w = 1;
    function P(R) {
      var M = R.match(t);
      M && (x += M.length);
      var B = R.lastIndexOf(l);
      w = ~B ? R.length - B : w + R.length;
    }
    function E() {
      var R = { line: x, column: w };
      return function(M) {
        return M.position = new C(R), L(), M;
      };
    }
    function C(R) {
      this.start = R, this.end = { line: x, column: w }, this.source = g.source;
    }
    C.prototype.content = y;
    function A(R) {
      var M = new Error(
        g.source + ":" + x + ":" + w + ": " + R
      );
      if (M.reason = R, M.filename = g.source, M.line = x, M.column = w, M.source = y, !g.silent) throw M;
    }
    function N(R) {
      var M = R.exec(y);
      if (M) {
        var B = M[0];
        return P(B), y = y.slice(B.length), M;
      }
    }
    function L() {
      N(n);
    }
    function T(R) {
      var M;
      for (R = R || []; M = O(); )
        M !== !1 && R.push(M);
      return R;
    }
    function O() {
      var R = E();
      if (!(c != y.charAt(0) || u != y.charAt(1))) {
        for (var M = 2; d != y.charAt(M) && (u != y.charAt(M) || c != y.charAt(M + 1)); )
          ++M;
        if (M += 2, d === y.charAt(M - 1))
          return A("End of comment missing");
        var B = y.slice(2, M - 2);
        return w += 2, P(B), y = y.slice(M), w += 2, R({
          type: h,
          comment: B
        });
      }
    }
    function I() {
      var R = E(), M = N(r);
      if (M) {
        if (O(), !N(i)) return A("property missing ':'");
        var B = N(o), z = R({
          type: f,
          property: p(M[0].replace(e, d)),
          value: B ? p(B[0].replace(e, d)) : d
        });
        return N(s), z;
      }
    }
    function W() {
      var R = [];
      T(R);
      for (var M; M = I(); )
        M !== !1 && (R.push(M), T(R));
      return R;
    }
    return L(), W();
  }
  function p(y) {
    return y ? y.replace(a, d) : d;
  }
  return Fo = m, Fo;
}
var Xc;
function H0() {
  if (Xc) return Dn;
  Xc = 1;
  var e = Dn && Dn.__importDefault || function(r) {
    return r && r.__esModule ? r : { default: r };
  };
  Object.defineProperty(Dn, "__esModule", { value: !0 }), Dn.default = n;
  const t = e(U0());
  function n(r, i) {
    let o = null;
    if (!r || typeof r != "string")
      return o;
    const s = (0, t.default)(r), a = typeof i == "function";
    return s.forEach((l) => {
      if (l.type !== "declaration")
        return;
      const { property: c, value: u } = l;
      a ? i(c, u, l) : u && (o = o || {}, o[c] = u);
    }), o;
  }
  return Dn;
}
var mr = {}, Zc;
function W0() {
  if (Zc) return mr;
  Zc = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.camelCase = void 0;
  var e = /^--[a-zA-Z0-9_-]+$/, t = /-([a-z])/g, n = /^[^-]+$/, r = /^-(webkit|moz|ms|o|khtml)-/, i = /^-(ms)-/, o = function(c) {
    return !c || n.test(c) || e.test(c);
  }, s = function(c, u) {
    return u.toUpperCase();
  }, a = function(c, u) {
    return "".concat(u, "-");
  }, l = function(c, u) {
    return u === void 0 && (u = {}), o(c) ? c : (c = c.toLowerCase(), u.reactCompat ? c = c.replace(i, a) : c = c.replace(r, a), c.replace(t, s));
  };
  return mr.camelCase = l, mr;
}
var gr, Jc;
function q0() {
  if (Jc) return gr;
  Jc = 1;
  var e = gr && gr.__importDefault || function(i) {
    return i && i.__esModule ? i : { default: i };
  }, t = e(H0()), n = W0();
  function r(i, o) {
    var s = {};
    return !i || typeof i != "string" || (0, t.default)(i, function(a, l) {
      a && l && (s[(0, n.camelCase)(a, o)] = l);
    }), s;
  }
  return r.default = r, gr = r, gr;
}
var K0 = q0();
const G0 = /* @__PURE__ */ Eh(K0), Ph = Ah("end"), Fa = Ah("start");
function Ah(e) {
  return t;
  function t(n) {
    const r = n && n.position && n.position[e] || {};
    if (typeof r.line == "number" && r.line > 0 && typeof r.column == "number" && r.column > 0)
      return {
        line: r.line,
        column: r.column,
        offset: typeof r.offset == "number" && r.offset > -1 ? r.offset : void 0
      };
  }
}
function Y0(e) {
  const t = Fa(e), n = Ph(e);
  if (t && n)
    return { start: t, end: n };
}
function Pr(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? Qc(e.position) : "start" in e || "end" in e ? Qc(e) : "line" in e || "column" in e ? As(e) : "";
}
function As(e) {
  return eu(e && e.line) + ":" + eu(e && e.column);
}
function Qc(e) {
  return As(e && e.start) + "-" + As(e && e.end);
}
function eu(e) {
  return e && typeof e == "number" ? e : 1;
}
class Ye extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(t, n, r) {
    super(), typeof n == "string" && (r = n, n = void 0);
    let i = "", o = {}, s = !1;
    if (n && ("line" in n && "column" in n ? o = { place: n } : "start" in n && "end" in n ? o = { place: n } : "type" in n ? o = {
      ancestors: [n],
      place: n.position
    } : o = { ...n }), typeof t == "string" ? i = t : !o.cause && t && (s = !0, i = t.message, o.cause = t), !o.ruleId && !o.source && typeof r == "string") {
      const l = r.indexOf(":");
      l === -1 ? o.ruleId = r : (o.source = r.slice(0, l), o.ruleId = r.slice(l + 1));
    }
    if (!o.place && o.ancestors && o.ancestors) {
      const l = o.ancestors[o.ancestors.length - 1];
      l && (o.place = l.position);
    }
    const a = o.place && "start" in o.place ? o.place.start : o.place;
    this.ancestors = o.ancestors || void 0, this.cause = o.cause || void 0, this.column = a ? a.column : void 0, this.fatal = void 0, this.file = "", this.message = i, this.line = a ? a.line : void 0, this.name = Pr(o.place) || "1:1", this.place = o.place || void 0, this.reason = this.message, this.ruleId = o.ruleId || void 0, this.source = o.source || void 0, this.stack = s && o.cause && typeof o.cause.stack == "string" ? o.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
  }
}
Ye.prototype.file = "";
Ye.prototype.name = "";
Ye.prototype.reason = "";
Ye.prototype.message = "";
Ye.prototype.stack = "";
Ye.prototype.column = void 0;
Ye.prototype.line = void 0;
Ye.prototype.ancestors = void 0;
Ye.prototype.cause = void 0;
Ye.prototype.fatal = void 0;
Ye.prototype.place = void 0;
Ye.prototype.ruleId = void 0;
Ye.prototype.source = void 0;
const Va = {}.hasOwnProperty, X0 = /* @__PURE__ */ new Map(), Z0 = /[A-Z]/g, J0 = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), Q0 = /* @__PURE__ */ new Set(["td", "th"]), Rh = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function e1(e, t) {
  if (!t || t.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = l1(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = a1(n, t.jsx, t.jsxs);
  }
  const i = {
    Fragment: t.Fragment,
    ancestors: [],
    components: t.components || {},
    create: r,
    elementAttributeNameCase: t.elementAttributeNameCase || "react",
    evaluater: t.createEvaluater ? t.createEvaluater() : void 0,
    filePath: n,
    ignoreInvalidStyle: t.ignoreInvalidStyle || !1,
    passKeys: t.passKeys !== !1,
    passNode: t.passNode || !1,
    schema: t.space === "svg" ? _a : j0,
    stylePropertyNameCase: t.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: t.tableCellAlignToStyle !== !1
  }, o = Nh(i, e, void 0);
  return o && typeof o != "string" ? o : i.create(
    e,
    i.Fragment,
    { children: o || void 0 },
    void 0
  );
}
function Nh(e, t, n) {
  if (t.type === "element")
    return t1(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression")
    return n1(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement")
    return i1(e, t, n);
  if (t.type === "mdxjsEsm")
    return r1(e, t);
  if (t.type === "root")
    return o1(e, t, n);
  if (t.type === "text")
    return s1(e, t);
}
function t1(e, t, n) {
  const r = e.schema;
  let i = r;
  t.tagName.toLowerCase() === "svg" && r.space === "html" && (i = _a, e.schema = i), e.ancestors.push(t);
  const o = Dh(e, t.tagName, !1), s = c1(e, t);
  let a = za(e, t);
  return J0.has(t.tagName) && (a = a.filter(function(l) {
    return typeof l == "string" ? !I0(l) : !0;
  })), Ih(e, s, o, t), Ba(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function n1(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  _r(e, t.position);
}
function r1(e, t) {
  if (t.data && t.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(t.data.estree)
    );
  _r(e, t.position);
}
function i1(e, t, n) {
  const r = e.schema;
  let i = r;
  t.name === "svg" && r.space === "html" && (i = _a, e.schema = i), e.ancestors.push(t);
  const o = t.name === null ? e.Fragment : Dh(e, t.name, !0), s = u1(e, t), a = za(e, t);
  return Ih(e, s, o, t), Ba(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function o1(e, t, n) {
  const r = {};
  return Ba(r, za(e, t)), e.create(t, e.Fragment, r, n);
}
function s1(e, t) {
  return t.value;
}
function Ih(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function Ba(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function a1(e, t, n) {
  return r;
  function r(i, o, s, a) {
    const c = Array.isArray(s.children) ? n : t;
    return a ? c(o, s, a) : c(o, s);
  }
}
function l1(e, t) {
  return n;
  function n(r, i, o, s) {
    const a = Array.isArray(o.children), l = Fa(r);
    return t(
      i,
      o,
      s,
      a,
      {
        columnNumber: l ? l.column - 1 : void 0,
        fileName: e,
        lineNumber: l ? l.line : void 0
      },
      void 0
    );
  }
}
function c1(e, t) {
  const n = {};
  let r, i;
  for (i in t.properties)
    if (i !== "children" && Va.call(t.properties, i)) {
      const o = d1(e, i, t.properties[i]);
      if (o) {
        const [s, a] = o;
        e.tableCellAlignToStyle && s === "align" && typeof a == "string" && Q0.has(t.tagName) ? r = a : n[s] = a;
      }
    }
  if (r) {
    const o = (
      /** @type {Style} */
      n.style || (n.style = {})
    );
    o[e.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = r;
  }
  return n;
}
function u1(e, t) {
  const n = {};
  for (const r of t.attributes)
    if (r.type === "mdxJsxExpressionAttribute")
      if (r.data && r.data.estree && e.evaluater) {
        const o = r.data.estree.body[0];
        o.type;
        const s = o.expression;
        s.type;
        const a = s.properties[0];
        a.type, Object.assign(
          n,
          e.evaluater.evaluateExpression(a.argument)
        );
      } else
        _r(e, t.position);
    else {
      const i = r.name;
      let o;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const a = r.value.data.estree.body[0];
          a.type, o = e.evaluater.evaluateExpression(a.expression);
        } else
          _r(e, t.position);
      else
        o = r.value === null ? !0 : r.value;
      n[i] = /** @type {Props[keyof Props]} */
      o;
    }
  return n;
}
function za(e, t) {
  const n = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : X0;
  for (; ++r < t.children.length; ) {
    const o = t.children[r];
    let s;
    if (e.passKeys) {
      const l = o.type === "element" ? o.tagName : o.type === "mdxJsxFlowElement" || o.type === "mdxJsxTextElement" ? o.name : void 0;
      if (l) {
        const c = i.get(l) || 0;
        s = l + "-" + c, i.set(l, c + 1);
      }
    }
    const a = Nh(e, o, s);
    a !== void 0 && n.push(a);
  }
  return n;
}
function d1(e, t, n) {
  const r = V0(e.schema, t);
  if (!(n == null || typeof n == "number" && Number.isNaN(n))) {
    if (Array.isArray(n) && (n = r.commaSeparated ? E0(n) : $0(n)), r.property === "style") {
      let i = typeof n == "object" ? n : f1(e, String(n));
      return e.stylePropertyNameCase === "css" && (i = h1(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? L0[r.property] || r.property : r.attribute,
      n
    ];
  }
}
function f1(e, t) {
  try {
    return G0(t, { reactCompat: !0 });
  } catch (n) {
    if (e.ignoreInvalidStyle)
      return {};
    const r = (
      /** @type {Error} */
      n
    ), i = new Ye("Cannot parse `style` attribute", {
      ancestors: e.ancestors,
      cause: r,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    throw i.file = e.filePath || void 0, i.url = Rh + "#cannot-parse-style-attribute", i;
  }
}
function Dh(e, t, n) {
  let r;
  if (!n)
    r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const i = t.split(".");
    let o = -1, s;
    for (; ++o < i.length; ) {
      const a = Wc(i[o]) ? { type: "Identifier", name: i[o] } : { type: "Literal", value: i[o] };
      s = s ? {
        type: "MemberExpression",
        object: s,
        property: a,
        computed: !!(o && a.type === "Literal"),
        optional: !1
      } : a;
    }
    r = s;
  } else
    r = Wc(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return Va.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  _r(e);
}
function _r(e, t) {
  const n = new Ye(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: t,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw n.file = e.filePath || void 0, n.url = Rh + "#cannot-handle-mdx-estrees-without-createevaluater", n;
}
function h1(e) {
  const t = {};
  let n;
  for (n in e)
    Va.call(e, n) && (t[p1(n)] = e[n]);
  return t;
}
function p1(e) {
  let t = e.replace(Z0, m1);
  return t.slice(0, 3) === "ms-" && (t = "-" + t), t;
}
function m1(e) {
  return "-" + e.toLowerCase();
}
const Vo = {
  action: ["form"],
  cite: ["blockquote", "del", "ins", "q"],
  data: ["object"],
  formAction: ["button", "input"],
  href: ["a", "area", "base", "link"],
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
}, g1 = {};
function ja(e, t) {
  const n = g1, r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0, i = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return Mh(e, r, i);
}
function Mh(e, t, n) {
  if (y1(e)) {
    if ("value" in e)
      return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return tu(e.children, t, n);
  }
  return Array.isArray(e) ? tu(e, t, n) : "";
}
function tu(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = Mh(e[i], t, n);
  return r.join("");
}
function y1(e) {
  return !!(e && typeof e == "object");
}
const nu = document.createElement("i");
function $a(e) {
  const t = "&" + e + ";";
  nu.innerHTML = t;
  const n = nu.textContent;
  return (
    // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
    // yield `null`.
    n.charCodeAt(n.length - 1) === 59 && e !== "semi" || n === t ? !1 : n
  );
}
function at(e, t, n, r) {
  const i = e.length;
  let o = 0, s;
  if (t < 0 ? t = -t > i ? 0 : i + t : t = t > i ? i : t, n = n > 0 ? n : 0, r.length < 1e4)
    s = Array.from(r), s.unshift(t, n), e.splice(...s);
  else
    for (n && e.splice(t, n); o < r.length; )
      s = r.slice(o, o + 1e4), s.unshift(t, 0), e.splice(...s), o += 1e4, t += 1e4;
}
function ht(e, t) {
  return e.length > 0 ? (at(e, e.length, 0, t), e) : t;
}
const ru = {}.hasOwnProperty;
function Oh(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    v1(t, e[n]);
  return t;
}
function v1(e, t) {
  let n;
  for (n in t) {
    const i = (ru.call(e, n) ? e[n] : void 0) || (e[n] = {}), o = t[n];
    let s;
    if (o)
      for (s in o) {
        ru.call(i, s) || (i[s] = []);
        const a = o[s];
        b1(
          // @ts-expect-error Looks like a list.
          i[s],
          Array.isArray(a) ? a : a ? [a] : []
        );
      }
  }
}
function b1(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  at(e, 0, 0, r);
}
function Lh(e, t) {
  const n = Number.parseInt(e, t);
  return (
    // C0 except for HT, LF, FF, CR, space.
    n < 9 || n === 11 || n > 13 && n < 32 || // Control character (DEL) of C0, and C1 controls.
    n > 126 && n < 160 || // Lone high surrogates and low surrogates.
    n > 55295 && n < 57344 || // Noncharacters.
    n > 64975 && n < 65008 || /* eslint-disable no-bitwise */
    (n & 65535) === 65535 || (n & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    n > 1114111 ? "�" : String.fromCodePoint(n)
  );
}
function wt(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const Xe = un(/[A-Za-z]/), Ge = un(/[\dA-Za-z]/), x1 = un(/[#-'*+\--9=?A-Z^-~]/);
function Ai(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const Rs = un(/\d/), w1 = un(/[\dA-Fa-f]/), S1 = un(/[!-/:-@[-`{-~]/);
function K(e) {
  return e !== null && e < -2;
}
function Se(e) {
  return e !== null && (e < 0 || e === 32);
}
function le(e) {
  return e === -2 || e === -1 || e === 32;
}
const Zi = un(new RegExp("\\p{P}|\\p{S}", "u")), Sn = un(/\s/);
function un(e) {
  return t;
  function t(n) {
    return n !== null && n > -1 && e.test(String.fromCharCode(n));
  }
}
function lr(e) {
  const t = [];
  let n = -1, r = 0, i = 0;
  for (; ++n < e.length; ) {
    const o = e.charCodeAt(n);
    let s = "";
    if (o === 37 && Ge(e.charCodeAt(n + 1)) && Ge(e.charCodeAt(n + 2)))
      i = 2;
    else if (o < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(o)) || (s = String.fromCharCode(o));
    else if (o > 55295 && o < 57344) {
      const a = e.charCodeAt(n + 1);
      o < 56320 && a > 56319 && a < 57344 ? (s = String.fromCharCode(o, a), i = 1) : s = "�";
    } else
      s = String.fromCharCode(o);
    s && (t.push(e.slice(r, n), encodeURIComponent(s)), r = n + i + 1, s = ""), i && (n += i, i = 0);
  }
  return t.join("") + e.slice(r);
}
function de(e, t, n, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let o = 0;
  return s;
  function s(l) {
    return le(l) ? (e.enter(n), a(l)) : t(l);
  }
  function a(l) {
    return le(l) && o++ < i ? (e.consume(l), a) : (e.exit(n), t(l));
  }
}
const k1 = {
  tokenize: C1
};
function C1(e) {
  const t = e.attempt(this.parser.constructs.contentInitial, r, i);
  let n;
  return t;
  function r(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), de(e, t, "linePrefix");
  }
  function i(a) {
    return e.enter("paragraph"), o(a);
  }
  function o(a) {
    const l = e.enter("chunkText", {
      contentType: "text",
      previous: n
    });
    return n && (n.next = l), n = l, s(a);
  }
  function s(a) {
    if (a === null) {
      e.exit("chunkText"), e.exit("paragraph"), e.consume(a);
      return;
    }
    return K(a) ? (e.consume(a), e.exit("chunkText"), o) : (e.consume(a), s);
  }
}
const T1 = {
  tokenize: E1
}, iu = {
  tokenize: P1
};
function E1(e) {
  const t = this, n = [];
  let r = 0, i, o, s;
  return a;
  function a(w) {
    if (r < n.length) {
      const P = n[r];
      return t.containerState = P[1], e.attempt(P[0].continuation, l, c)(w);
    }
    return c(w);
  }
  function l(w) {
    if (r++, t.containerState._closeFlow) {
      t.containerState._closeFlow = void 0, i && x();
      const P = t.events.length;
      let E = P, C;
      for (; E--; )
        if (t.events[E][0] === "exit" && t.events[E][1].type === "chunkFlow") {
          C = t.events[E][1].end;
          break;
        }
      g(r);
      let A = P;
      for (; A < t.events.length; )
        t.events[A][1].end = {
          ...C
        }, A++;
      return at(t.events, E + 1, 0, t.events.slice(P)), t.events.length = A, c(w);
    }
    return a(w);
  }
  function c(w) {
    if (r === n.length) {
      if (!i)
        return h(w);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return m(w);
      t.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return t.containerState = {}, e.check(iu, u, d)(w);
  }
  function u(w) {
    return i && x(), g(r), h(w);
  }
  function d(w) {
    return t.parser.lazy[t.now().line] = r !== n.length, s = t.now().offset, m(w);
  }
  function h(w) {
    return t.containerState = {}, e.attempt(iu, f, m)(w);
  }
  function f(w) {
    return r++, n.push([t.currentConstruct, t.containerState]), h(w);
  }
  function m(w) {
    if (w === null) {
      i && x(), g(0), e.consume(w);
      return;
    }
    return i = i || t.parser.flow(t.now()), e.enter("chunkFlow", {
      _tokenizer: i,
      contentType: "flow",
      previous: o
    }), p(w);
  }
  function p(w) {
    if (w === null) {
      y(e.exit("chunkFlow"), !0), g(0), e.consume(w);
      return;
    }
    return K(w) ? (e.consume(w), y(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, a) : (e.consume(w), p);
  }
  function y(w, P) {
    const E = t.sliceStream(w);
    if (P && E.push(null), w.previous = o, o && (o.next = w), o = w, i.defineSkip(w.start), i.write(E), t.parser.lazy[w.start.line]) {
      let C = i.events.length;
      for (; C--; )
        if (
          // The token starts before the line ending…
          i.events[C][1].start.offset < s && // …and either is not ended yet…
          (!i.events[C][1].end || // …or ends after it.
          i.events[C][1].end.offset > s)
        )
          return;
      const A = t.events.length;
      let N = A, L, T;
      for (; N--; )
        if (t.events[N][0] === "exit" && t.events[N][1].type === "chunkFlow") {
          if (L) {
            T = t.events[N][1].end;
            break;
          }
          L = !0;
        }
      for (g(r), C = A; C < t.events.length; )
        t.events[C][1].end = {
          ...T
        }, C++;
      at(t.events, N + 1, 0, t.events.slice(A)), t.events.length = C;
    }
  }
  function g(w) {
    let P = n.length;
    for (; P-- > w; ) {
      const E = n[P];
      t.containerState = E[1], E[0].exit.call(t, e);
    }
    n.length = w;
  }
  function x() {
    i.write([null]), o = void 0, i = void 0, t.containerState._closeFlow = void 0;
  }
}
function P1(e, t, n) {
  return de(e, e.attempt(this.parser.constructs.document, t, n), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function Xn(e) {
  if (e === null || Se(e) || Sn(e))
    return 1;
  if (Zi(e))
    return 2;
}
function Ji(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const o = e[i].resolveAll;
    o && !r.includes(o) && (t = o(t, n), r.push(o));
  }
  return t;
}
const Ns = {
  name: "attention",
  resolveAll: A1,
  tokenize: R1
};
function A1(e, t) {
  let n = -1, r, i, o, s, a, l, c, u;
  for (; ++n < e.length; )
    if (e[n][0] === "enter" && e[n][1].type === "attentionSequence" && e[n][1]._close) {
      for (r = n; r--; )
        if (e[r][0] === "exit" && e[r][1].type === "attentionSequence" && e[r][1]._open && // If the markers are the same:
        t.sliceSerialize(e[r][1]).charCodeAt(0) === t.sliceSerialize(e[n][1]).charCodeAt(0)) {
          if ((e[r][1]._close || e[n][1]._open) && (e[n][1].end.offset - e[n][1].start.offset) % 3 && !((e[r][1].end.offset - e[r][1].start.offset + e[n][1].end.offset - e[n][1].start.offset) % 3))
            continue;
          l = e[r][1].end.offset - e[r][1].start.offset > 1 && e[n][1].end.offset - e[n][1].start.offset > 1 ? 2 : 1;
          const d = {
            ...e[r][1].end
          }, h = {
            ...e[n][1].start
          };
          ou(d, -l), ou(h, l), s = {
            type: l > 1 ? "strongSequence" : "emphasisSequence",
            start: d,
            end: {
              ...e[r][1].end
            }
          }, a = {
            type: l > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...e[n][1].start
            },
            end: h
          }, o = {
            type: l > 1 ? "strongText" : "emphasisText",
            start: {
              ...e[r][1].end
            },
            end: {
              ...e[n][1].start
            }
          }, i = {
            type: l > 1 ? "strong" : "emphasis",
            start: {
              ...s.start
            },
            end: {
              ...a.end
            }
          }, e[r][1].end = {
            ...s.start
          }, e[n][1].start = {
            ...a.end
          }, c = [], e[r][1].end.offset - e[r][1].start.offset && (c = ht(c, [["enter", e[r][1], t], ["exit", e[r][1], t]])), c = ht(c, [["enter", i, t], ["enter", s, t], ["exit", s, t], ["enter", o, t]]), c = ht(c, Ji(t.parser.constructs.insideSpan.null, e.slice(r + 1, n), t)), c = ht(c, [["exit", o, t], ["enter", a, t], ["exit", a, t], ["exit", i, t]]), e[n][1].end.offset - e[n][1].start.offset ? (u = 2, c = ht(c, [["enter", e[n][1], t], ["exit", e[n][1], t]])) : u = 0, at(e, r - 1, n - r + 3, c), n = r + c.length - u - 2;
          break;
        }
    }
  for (n = -1; ++n < e.length; )
    e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function R1(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = Xn(r);
  let o;
  return s;
  function s(l) {
    return o = l, e.enter("attentionSequence"), a(l);
  }
  function a(l) {
    if (l === o)
      return e.consume(l), a;
    const c = e.exit("attentionSequence"), u = Xn(l), d = !u || u === 2 && i || n.includes(l), h = !i || i === 2 && u || n.includes(r);
    return c._open = !!(o === 42 ? d : d && (i || !h)), c._close = !!(o === 42 ? h : h && (u || !d)), t(l);
  }
}
function ou(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const N1 = {
  name: "autolink",
  tokenize: I1
};
function I1(e, t, n) {
  let r = 0;
  return i;
  function i(f) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), o;
  }
  function o(f) {
    return Xe(f) ? (e.consume(f), s) : f === 64 ? n(f) : c(f);
  }
  function s(f) {
    return f === 43 || f === 45 || f === 46 || Ge(f) ? (r = 1, a(f)) : c(f);
  }
  function a(f) {
    return f === 58 ? (e.consume(f), r = 0, l) : (f === 43 || f === 45 || f === 46 || Ge(f)) && r++ < 32 ? (e.consume(f), a) : (r = 0, c(f));
  }
  function l(f) {
    return f === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : f === null || f === 32 || f === 60 || Ai(f) ? n(f) : (e.consume(f), l);
  }
  function c(f) {
    return f === 64 ? (e.consume(f), u) : x1(f) ? (e.consume(f), c) : n(f);
  }
  function u(f) {
    return Ge(f) ? d(f) : n(f);
  }
  function d(f) {
    return f === 46 ? (e.consume(f), r = 0, u) : f === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : h(f);
  }
  function h(f) {
    if ((f === 45 || Ge(f)) && r++ < 63) {
      const m = f === 45 ? h : d;
      return e.consume(f), m;
    }
    return n(f);
  }
}
const Wr = {
  partial: !0,
  tokenize: D1
};
function D1(e, t, n) {
  return r;
  function r(o) {
    return le(o) ? de(e, i, "linePrefix")(o) : i(o);
  }
  function i(o) {
    return o === null || K(o) ? t(o) : n(o);
  }
}
const _h = {
  continuation: {
    tokenize: O1
  },
  exit: L1,
  name: "blockQuote",
  tokenize: M1
};
function M1(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    if (s === 62) {
      const a = r.containerState;
      return a.open || (e.enter("blockQuote", {
        _container: !0
      }), a.open = !0), e.enter("blockQuotePrefix"), e.enter("blockQuoteMarker"), e.consume(s), e.exit("blockQuoteMarker"), o;
    }
    return n(s);
  }
  function o(s) {
    return le(s) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(s), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(s));
  }
}
function O1(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return le(s) ? de(e, o, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(s) : o(s);
  }
  function o(s) {
    return e.attempt(_h, t, n)(s);
  }
}
function L1(e) {
  e.exit("blockQuote");
}
const Fh = {
  name: "characterEscape",
  tokenize: _1
};
function _1(e, t, n) {
  return r;
  function r(o) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(o), e.exit("escapeMarker"), i;
  }
  function i(o) {
    return S1(o) ? (e.enter("characterEscapeValue"), e.consume(o), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(o);
  }
}
const Vh = {
  name: "characterReference",
  tokenize: F1
};
function F1(e, t, n) {
  const r = this;
  let i = 0, o, s;
  return a;
  function a(d) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), l;
  }
  function l(d) {
    return d === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(d), e.exit("characterReferenceMarkerNumeric"), c) : (e.enter("characterReferenceValue"), o = 31, s = Ge, u(d));
  }
  function c(d) {
    return d === 88 || d === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(d), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), o = 6, s = w1, u) : (e.enter("characterReferenceValue"), o = 7, s = Rs, u(d));
  }
  function u(d) {
    if (d === 59 && i) {
      const h = e.exit("characterReferenceValue");
      return s === Ge && !$a(r.sliceSerialize(h)) ? n(d) : (e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), e.exit("characterReference"), t);
    }
    return s(d) && i++ < o ? (e.consume(d), u) : n(d);
  }
}
const su = {
  partial: !0,
  tokenize: B1
}, au = {
  concrete: !0,
  name: "codeFenced",
  tokenize: V1
};
function V1(e, t, n) {
  const r = this, i = {
    partial: !0,
    tokenize: E
  };
  let o = 0, s = 0, a;
  return l;
  function l(C) {
    return c(C);
  }
  function c(C) {
    const A = r.events[r.events.length - 1];
    return o = A && A[1].type === "linePrefix" ? A[2].sliceSerialize(A[1], !0).length : 0, a = C, e.enter("codeFenced"), e.enter("codeFencedFence"), e.enter("codeFencedFenceSequence"), u(C);
  }
  function u(C) {
    return C === a ? (s++, e.consume(C), u) : s < 3 ? n(C) : (e.exit("codeFencedFenceSequence"), le(C) ? de(e, d, "whitespace")(C) : d(C));
  }
  function d(C) {
    return C === null || K(C) ? (e.exit("codeFencedFence"), r.interrupt ? t(C) : e.check(su, p, P)(C)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), h(C));
  }
  function h(C) {
    return C === null || K(C) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), d(C)) : le(C) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), de(e, f, "whitespace")(C)) : C === 96 && C === a ? n(C) : (e.consume(C), h);
  }
  function f(C) {
    return C === null || K(C) ? d(C) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), m(C));
  }
  function m(C) {
    return C === null || K(C) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), d(C)) : C === 96 && C === a ? n(C) : (e.consume(C), m);
  }
  function p(C) {
    return e.attempt(i, P, y)(C);
  }
  function y(C) {
    return e.enter("lineEnding"), e.consume(C), e.exit("lineEnding"), g;
  }
  function g(C) {
    return o > 0 && le(C) ? de(e, x, "linePrefix", o + 1)(C) : x(C);
  }
  function x(C) {
    return C === null || K(C) ? e.check(su, p, P)(C) : (e.enter("codeFlowValue"), w(C));
  }
  function w(C) {
    return C === null || K(C) ? (e.exit("codeFlowValue"), x(C)) : (e.consume(C), w);
  }
  function P(C) {
    return e.exit("codeFenced"), t(C);
  }
  function E(C, A, N) {
    let L = 0;
    return T;
    function T(M) {
      return C.enter("lineEnding"), C.consume(M), C.exit("lineEnding"), O;
    }
    function O(M) {
      return C.enter("codeFencedFence"), le(M) ? de(C, I, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(M) : I(M);
    }
    function I(M) {
      return M === a ? (C.enter("codeFencedFenceSequence"), W(M)) : N(M);
    }
    function W(M) {
      return M === a ? (L++, C.consume(M), W) : L >= s ? (C.exit("codeFencedFenceSequence"), le(M) ? de(C, R, "whitespace")(M) : R(M)) : N(M);
    }
    function R(M) {
      return M === null || K(M) ? (C.exit("codeFencedFence"), A(M)) : N(M);
    }
  }
}
function B1(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s === null ? n(s) : (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
const Bo = {
  name: "codeIndented",
  tokenize: j1
}, z1 = {
  partial: !0,
  tokenize: $1
};
function j1(e, t, n) {
  const r = this;
  return i;
  function i(c) {
    return e.enter("codeIndented"), de(e, o, "linePrefix", 5)(c);
  }
  function o(c) {
    const u = r.events[r.events.length - 1];
    return u && u[1].type === "linePrefix" && u[2].sliceSerialize(u[1], !0).length >= 4 ? s(c) : n(c);
  }
  function s(c) {
    return c === null ? l(c) : K(c) ? e.attempt(z1, s, l)(c) : (e.enter("codeFlowValue"), a(c));
  }
  function a(c) {
    return c === null || K(c) ? (e.exit("codeFlowValue"), s(c)) : (e.consume(c), a);
  }
  function l(c) {
    return e.exit("codeIndented"), t(c);
  }
}
function $1(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return r.parser.lazy[r.now().line] ? n(s) : K(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), i) : de(e, o, "linePrefix", 5)(s);
  }
  function o(s) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : K(s) ? i(s) : n(s);
  }
}
const U1 = {
  name: "codeText",
  previous: W1,
  resolve: H1,
  tokenize: q1
};
function H1(e) {
  let t = e.length - 4, n = 3, r, i;
  if ((e[n][1].type === "lineEnding" || e[n][1].type === "space") && (e[t][1].type === "lineEnding" || e[t][1].type === "space")) {
    for (r = n; ++r < t; )
      if (e[r][1].type === "codeTextData") {
        e[n][1].type = "codeTextPadding", e[t][1].type = "codeTextPadding", n += 2, t -= 2;
        break;
      }
  }
  for (r = n - 1, t++; ++r <= t; )
    i === void 0 ? r !== t && e[r][1].type !== "lineEnding" && (i = r) : (r === t || e[r][1].type === "lineEnding") && (e[i][1].type = "codeTextData", r !== i + 2 && (e[i][1].end = e[r - 1][1].end, e.splice(i + 2, r - i - 2), t -= r - i - 2, r = i + 2), i = void 0);
  return e;
}
function W1(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function q1(e, t, n) {
  let r = 0, i, o;
  return s;
  function s(d) {
    return e.enter("codeText"), e.enter("codeTextSequence"), a(d);
  }
  function a(d) {
    return d === 96 ? (e.consume(d), r++, a) : (e.exit("codeTextSequence"), l(d));
  }
  function l(d) {
    return d === null ? n(d) : d === 32 ? (e.enter("space"), e.consume(d), e.exit("space"), l) : d === 96 ? (o = e.enter("codeTextSequence"), i = 0, u(d)) : K(d) ? (e.enter("lineEnding"), e.consume(d), e.exit("lineEnding"), l) : (e.enter("codeTextData"), c(d));
  }
  function c(d) {
    return d === null || d === 32 || d === 96 || K(d) ? (e.exit("codeTextData"), l(d)) : (e.consume(d), c);
  }
  function u(d) {
    return d === 96 ? (e.consume(d), i++, u) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(d)) : (o.type = "codeTextData", c(d));
  }
}
class K1 {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(t) {
    this.left = t ? [...t] : [], this.right = [];
  }
  /**
   * Array access;
   * does not move the cursor.
   *
   * @param {number} index
   *   Index.
   * @return {T}
   *   Item.
   */
  get(t) {
    if (t < 0 || t >= this.left.length + this.right.length)
      throw new RangeError("Cannot access index `" + t + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    return t < this.left.length ? this.left[t] : this.right[this.right.length - t + this.left.length - 1];
  }
  /**
   * The length of the splice buffer, one greater than the largest index in the
   * array.
   */
  get length() {
    return this.left.length + this.right.length;
  }
  /**
   * Remove and return `list[0]`;
   * moves the cursor to `0`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  shift() {
    return this.setCursor(0), this.right.pop();
  }
  /**
   * Slice the buffer to get an array;
   * does not move the cursor.
   *
   * @param {number} start
   *   Start.
   * @param {number | null | undefined} [end]
   *   End (optional).
   * @returns {Array<T>}
   *   Array of items.
   */
  slice(t, n) {
    const r = n ?? Number.POSITIVE_INFINITY;
    return r < this.left.length ? this.left.slice(t, r) : t > this.left.length ? this.right.slice(this.right.length - r + this.left.length, this.right.length - t + this.left.length).reverse() : this.left.slice(t).concat(this.right.slice(this.right.length - r + this.left.length).reverse());
  }
  /**
   * Mimics the behavior of Array.prototype.splice() except for the change of
   * interface necessary to avoid segfaults when patching in very large arrays.
   *
   * This operation moves cursor is moved to `start` and results in the cursor
   * placed after any inserted items.
   *
   * @param {number} start
   *   Start;
   *   zero-based index at which to start changing the array;
   *   negative numbers count backwards from the end of the array and values
   *   that are out-of bounds are clamped to the appropriate end of the array.
   * @param {number | null | undefined} [deleteCount=0]
   *   Delete count (default: `0`);
   *   maximum number of elements to delete, starting from start.
   * @param {Array<T> | null | undefined} [items=[]]
   *   Items to include in place of the deleted items (default: `[]`).
   * @return {Array<T>}
   *   Any removed items.
   */
  splice(t, n, r) {
    const i = n || 0;
    this.setCursor(Math.trunc(t));
    const o = this.right.splice(this.right.length - i, Number.POSITIVE_INFINITY);
    return r && yr(this.left, r), o.reverse();
  }
  /**
   * Remove and return the highest-numbered item in the array, so
   * `list[list.length - 1]`;
   * Moves the cursor to `length`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  pop() {
    return this.setCursor(Number.POSITIVE_INFINITY), this.left.pop();
  }
  /**
   * Inserts a single item to the high-numbered side of the array;
   * moves the cursor to `length`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  push(t) {
    this.setCursor(Number.POSITIVE_INFINITY), this.left.push(t);
  }
  /**
   * Inserts many items to the high-numbered side of the array.
   * Moves the cursor to `length`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  pushMany(t) {
    this.setCursor(Number.POSITIVE_INFINITY), yr(this.left, t);
  }
  /**
   * Inserts a single item to the low-numbered side of the array;
   * Moves the cursor to `0`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  unshift(t) {
    this.setCursor(0), this.right.push(t);
  }
  /**
   * Inserts many items to the low-numbered side of the array;
   * moves the cursor to `0`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  unshiftMany(t) {
    this.setCursor(0), yr(this.right, t.reverse());
  }
  /**
   * Move the cursor to a specific position in the array. Requires
   * time proportional to the distance moved.
   *
   * If `n < 0`, the cursor will end up at the beginning.
   * If `n > length`, the cursor will end up at the end.
   *
   * @param {number} n
   *   Position.
   * @return {undefined}
   *   Nothing.
   */
  setCursor(t) {
    if (!(t === this.left.length || t > this.left.length && this.right.length === 0 || t < 0 && this.left.length === 0))
      if (t < this.left.length) {
        const n = this.left.splice(t, Number.POSITIVE_INFINITY);
        yr(this.right, n.reverse());
      } else {
        const n = this.right.splice(this.left.length + this.right.length - t, Number.POSITIVE_INFINITY);
        yr(this.left, n.reverse());
      }
  }
}
function yr(e, t) {
  let n = 0;
  if (t.length < 1e4)
    e.push(...t);
  else
    for (; n < t.length; )
      e.push(...t.slice(n, n + 1e4)), n += 1e4;
}
function Bh(e) {
  const t = {};
  let n = -1, r, i, o, s, a, l, c;
  const u = new K1(e);
  for (; ++n < u.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = u.get(n), n && r[1].type === "chunkFlow" && u.get(n - 1)[1].type === "listItemPrefix" && (l = r[1]._tokenizer.events, o = 0, o < l.length && l[o][1].type === "lineEndingBlank" && (o += 2), o < l.length && l[o][1].type === "content"))
      for (; ++o < l.length && l[o][1].type !== "content"; )
        l[o][1].type === "chunkText" && (l[o][1]._isInFirstContentOfListItem = !0, o++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, G1(u, n)), n = t[n], c = !0);
    else if (r[1]._container) {
      for (o = n, i = void 0; o--; )
        if (s = u.get(o), s[1].type === "lineEnding" || s[1].type === "lineEndingBlank")
          s[0] === "enter" && (i && (u.get(i)[1].type = "lineEndingBlank"), s[1].type = "lineEnding", i = o);
        else if (!(s[1].type === "linePrefix" || s[1].type === "listItemIndent")) break;
      i && (r[1].end = {
        ...u.get(i)[1].start
      }, a = u.slice(i, n), a.unshift(r), u.splice(i, n - i + 1, a));
    }
  }
  return at(e, 0, Number.POSITIVE_INFINITY, u.slice(0)), !c;
}
function G1(e, t) {
  const n = e.get(t)[1], r = e.get(t)[2];
  let i = t - 1;
  const o = [];
  let s = n._tokenizer;
  s || (s = r.parser[n.contentType](n.start), n._contentTypeTextTrailing && (s._contentTypeTextTrailing = !0));
  const a = s.events, l = [], c = {};
  let u, d, h = -1, f = n, m = 0, p = 0;
  const y = [p];
  for (; f; ) {
    for (; e.get(++i)[1] !== f; )
      ;
    o.push(i), f._tokenizer || (u = r.sliceStream(f), f.next || u.push(null), d && s.defineSkip(f.start), f._isInFirstContentOfListItem && (s._gfmTasklistFirstContentOfListItem = !0), s.write(u), f._isInFirstContentOfListItem && (s._gfmTasklistFirstContentOfListItem = void 0)), d = f, f = f.next;
  }
  for (f = n; ++h < a.length; )
    // Find a void token that includes a break.
    a[h][0] === "exit" && a[h - 1][0] === "enter" && a[h][1].type === a[h - 1][1].type && a[h][1].start.line !== a[h][1].end.line && (p = h + 1, y.push(p), f._tokenizer = void 0, f.previous = void 0, f = f.next);
  for (s.events = [], f ? (f._tokenizer = void 0, f.previous = void 0) : y.pop(), h = y.length; h--; ) {
    const g = a.slice(y[h], y[h + 1]), x = o.pop();
    l.push([x, x + g.length - 1]), e.splice(x, 2, g);
  }
  for (l.reverse(), h = -1; ++h < l.length; )
    c[m + l[h][0]] = m + l[h][1], m += l[h][1] - l[h][0] - 1;
  return c;
}
const Y1 = {
  resolve: Z1,
  tokenize: J1
}, X1 = {
  partial: !0,
  tokenize: Q1
};
function Z1(e) {
  return Bh(e), e;
}
function J1(e, t) {
  let n;
  return r;
  function r(a) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(a);
  }
  function i(a) {
    return a === null ? o(a) : K(a) ? e.check(X1, s, o)(a) : (e.consume(a), i);
  }
  function o(a) {
    return e.exit("chunkContent"), e.exit("content"), t(a);
  }
  function s(a) {
    return e.consume(a), e.exit("chunkContent"), n.next = e.enter("chunkContent", {
      contentType: "content",
      previous: n
    }), n = n.next, i;
  }
}
function Q1(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), de(e, o, "linePrefix");
  }
  function o(s) {
    if (s === null || K(s))
      return n(s);
    const a = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : e.interrupt(r.parser.constructs.flow, n, t)(s);
  }
}
function zh(e, t, n, r, i, o, s, a, l) {
  const c = l || Number.POSITIVE_INFINITY;
  let u = 0;
  return d;
  function d(g) {
    return g === 60 ? (e.enter(r), e.enter(i), e.enter(o), e.consume(g), e.exit(o), h) : g === null || g === 32 || g === 41 || Ai(g) ? n(g) : (e.enter(r), e.enter(s), e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), p(g));
  }
  function h(g) {
    return g === 62 ? (e.enter(o), e.consume(g), e.exit(o), e.exit(i), e.exit(r), t) : (e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), f(g));
  }
  function f(g) {
    return g === 62 ? (e.exit("chunkString"), e.exit(a), h(g)) : g === null || g === 60 || K(g) ? n(g) : (e.consume(g), g === 92 ? m : f);
  }
  function m(g) {
    return g === 60 || g === 62 || g === 92 ? (e.consume(g), f) : f(g);
  }
  function p(g) {
    return !u && (g === null || g === 41 || Se(g)) ? (e.exit("chunkString"), e.exit(a), e.exit(s), e.exit(r), t(g)) : u < c && g === 40 ? (e.consume(g), u++, p) : g === 41 ? (e.consume(g), u--, p) : g === null || g === 32 || g === 40 || Ai(g) ? n(g) : (e.consume(g), g === 92 ? y : p);
  }
  function y(g) {
    return g === 40 || g === 41 || g === 92 ? (e.consume(g), p) : p(g);
  }
}
function jh(e, t, n, r, i, o) {
  const s = this;
  let a = 0, l;
  return c;
  function c(f) {
    return e.enter(r), e.enter(i), e.consume(f), e.exit(i), e.enter(o), u;
  }
  function u(f) {
    return a > 999 || f === null || f === 91 || f === 93 && !l || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    f === 94 && !a && "_hiddenFootnoteSupport" in s.parser.constructs ? n(f) : f === 93 ? (e.exit(o), e.enter(i), e.consume(f), e.exit(i), e.exit(r), t) : K(f) ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), u) : (e.enter("chunkString", {
      contentType: "string"
    }), d(f));
  }
  function d(f) {
    return f === null || f === 91 || f === 93 || K(f) || a++ > 999 ? (e.exit("chunkString"), u(f)) : (e.consume(f), l || (l = !le(f)), f === 92 ? h : d);
  }
  function h(f) {
    return f === 91 || f === 92 || f === 93 ? (e.consume(f), a++, d) : d(f);
  }
}
function $h(e, t, n, r, i, o) {
  let s;
  return a;
  function a(h) {
    return h === 34 || h === 39 || h === 40 ? (e.enter(r), e.enter(i), e.consume(h), e.exit(i), s = h === 40 ? 41 : h, l) : n(h);
  }
  function l(h) {
    return h === s ? (e.enter(i), e.consume(h), e.exit(i), e.exit(r), t) : (e.enter(o), c(h));
  }
  function c(h) {
    return h === s ? (e.exit(o), l(s)) : h === null ? n(h) : K(h) ? (e.enter("lineEnding"), e.consume(h), e.exit("lineEnding"), de(e, c, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), u(h));
  }
  function u(h) {
    return h === s || h === null || K(h) ? (e.exit("chunkString"), c(h)) : (e.consume(h), h === 92 ? d : u);
  }
  function d(h) {
    return h === s || h === 92 ? (e.consume(h), u) : u(h);
  }
}
function Ar(e, t) {
  let n;
  return r;
  function r(i) {
    return K(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : le(i) ? de(e, r, n ? "linePrefix" : "lineSuffix")(i) : t(i);
  }
}
const eS = {
  name: "definition",
  tokenize: nS
}, tS = {
  partial: !0,
  tokenize: rS
};
function nS(e, t, n) {
  const r = this;
  let i;
  return o;
  function o(f) {
    return e.enter("definition"), s(f);
  }
  function s(f) {
    return jh.call(
      r,
      e,
      a,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(f);
  }
  function a(f) {
    return i = wt(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), f === 58 ? (e.enter("definitionMarker"), e.consume(f), e.exit("definitionMarker"), l) : n(f);
  }
  function l(f) {
    return Se(f) ? Ar(e, c)(f) : c(f);
  }
  function c(f) {
    return zh(
      e,
      u,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(f);
  }
  function u(f) {
    return e.attempt(tS, d, d)(f);
  }
  function d(f) {
    return le(f) ? de(e, h, "whitespace")(f) : h(f);
  }
  function h(f) {
    return f === null || K(f) ? (e.exit("definition"), r.parser.defined.push(i), t(f)) : n(f);
  }
}
function rS(e, t, n) {
  return r;
  function r(a) {
    return Se(a) ? Ar(e, i)(a) : n(a);
  }
  function i(a) {
    return $h(e, o, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(a);
  }
  function o(a) {
    return le(a) ? de(e, s, "whitespace")(a) : s(a);
  }
  function s(a) {
    return a === null || K(a) ? t(a) : n(a);
  }
}
const iS = {
  name: "hardBreakEscape",
  tokenize: oS
};
function oS(e, t, n) {
  return r;
  function r(o) {
    return e.enter("hardBreakEscape"), e.consume(o), i;
  }
  function i(o) {
    return K(o) ? (e.exit("hardBreakEscape"), t(o)) : n(o);
  }
}
const sS = {
  name: "headingAtx",
  resolve: aS,
  tokenize: lS
};
function aS(e, t) {
  let n = e.length - 2, r = 3, i, o;
  return e[r][1].type === "whitespace" && (r += 2), n - 2 > r && e[n][1].type === "whitespace" && (n -= 2), e[n][1].type === "atxHeadingSequence" && (r === n - 1 || n - 4 > r && e[n - 2][1].type === "whitespace") && (n -= r + 1 === n ? 2 : 4), n > r && (i = {
    type: "atxHeadingText",
    start: e[r][1].start,
    end: e[n][1].end
  }, o = {
    type: "chunkText",
    start: e[r][1].start,
    end: e[n][1].end,
    contentType: "text"
  }, at(e, r, n - r + 1, [["enter", i, t], ["enter", o, t], ["exit", o, t], ["exit", i, t]])), e;
}
function lS(e, t, n) {
  let r = 0;
  return i;
  function i(u) {
    return e.enter("atxHeading"), o(u);
  }
  function o(u) {
    return e.enter("atxHeadingSequence"), s(u);
  }
  function s(u) {
    return u === 35 && r++ < 6 ? (e.consume(u), s) : u === null || Se(u) ? (e.exit("atxHeadingSequence"), a(u)) : n(u);
  }
  function a(u) {
    return u === 35 ? (e.enter("atxHeadingSequence"), l(u)) : u === null || K(u) ? (e.exit("atxHeading"), t(u)) : le(u) ? de(e, a, "whitespace")(u) : (e.enter("atxHeadingText"), c(u));
  }
  function l(u) {
    return u === 35 ? (e.consume(u), l) : (e.exit("atxHeadingSequence"), a(u));
  }
  function c(u) {
    return u === null || u === 35 || Se(u) ? (e.exit("atxHeadingText"), a(u)) : (e.consume(u), c);
  }
}
const cS = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], lu = ["pre", "script", "style", "textarea"], uS = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: hS,
  tokenize: pS
}, dS = {
  partial: !0,
  tokenize: gS
}, fS = {
  partial: !0,
  tokenize: mS
};
function hS(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function pS(e, t, n) {
  const r = this;
  let i, o, s, a, l;
  return c;
  function c(k) {
    return u(k);
  }
  function u(k) {
    return e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(k), d;
  }
  function d(k) {
    return k === 33 ? (e.consume(k), h) : k === 47 ? (e.consume(k), o = !0, p) : k === 63 ? (e.consume(k), i = 3, r.interrupt ? t : S) : Xe(k) ? (e.consume(k), s = String.fromCharCode(k), y) : n(k);
  }
  function h(k) {
    return k === 45 ? (e.consume(k), i = 2, f) : k === 91 ? (e.consume(k), i = 5, a = 0, m) : Xe(k) ? (e.consume(k), i = 4, r.interrupt ? t : S) : n(k);
  }
  function f(k) {
    return k === 45 ? (e.consume(k), r.interrupt ? t : S) : n(k);
  }
  function m(k) {
    const G = "CDATA[";
    return k === G.charCodeAt(a++) ? (e.consume(k), a === G.length ? r.interrupt ? t : I : m) : n(k);
  }
  function p(k) {
    return Xe(k) ? (e.consume(k), s = String.fromCharCode(k), y) : n(k);
  }
  function y(k) {
    if (k === null || k === 47 || k === 62 || Se(k)) {
      const G = k === 47, ue = s.toLowerCase();
      return !G && !o && lu.includes(ue) ? (i = 1, r.interrupt ? t(k) : I(k)) : cS.includes(s.toLowerCase()) ? (i = 6, G ? (e.consume(k), g) : r.interrupt ? t(k) : I(k)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(k) : o ? x(k) : w(k));
    }
    return k === 45 || Ge(k) ? (e.consume(k), s += String.fromCharCode(k), y) : n(k);
  }
  function g(k) {
    return k === 62 ? (e.consume(k), r.interrupt ? t : I) : n(k);
  }
  function x(k) {
    return le(k) ? (e.consume(k), x) : T(k);
  }
  function w(k) {
    return k === 47 ? (e.consume(k), T) : k === 58 || k === 95 || Xe(k) ? (e.consume(k), P) : le(k) ? (e.consume(k), w) : T(k);
  }
  function P(k) {
    return k === 45 || k === 46 || k === 58 || k === 95 || Ge(k) ? (e.consume(k), P) : E(k);
  }
  function E(k) {
    return k === 61 ? (e.consume(k), C) : le(k) ? (e.consume(k), E) : w(k);
  }
  function C(k) {
    return k === null || k === 60 || k === 61 || k === 62 || k === 96 ? n(k) : k === 34 || k === 39 ? (e.consume(k), l = k, A) : le(k) ? (e.consume(k), C) : N(k);
  }
  function A(k) {
    return k === l ? (e.consume(k), l = null, L) : k === null || K(k) ? n(k) : (e.consume(k), A);
  }
  function N(k) {
    return k === null || k === 34 || k === 39 || k === 47 || k === 60 || k === 61 || k === 62 || k === 96 || Se(k) ? E(k) : (e.consume(k), N);
  }
  function L(k) {
    return k === 47 || k === 62 || le(k) ? w(k) : n(k);
  }
  function T(k) {
    return k === 62 ? (e.consume(k), O) : n(k);
  }
  function O(k) {
    return k === null || K(k) ? I(k) : le(k) ? (e.consume(k), O) : n(k);
  }
  function I(k) {
    return k === 45 && i === 2 ? (e.consume(k), B) : k === 60 && i === 1 ? (e.consume(k), z) : k === 62 && i === 4 ? (e.consume(k), oe) : k === 63 && i === 3 ? (e.consume(k), S) : k === 93 && i === 5 ? (e.consume(k), U) : K(k) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(dS, X, W)(k)) : k === null || K(k) ? (e.exit("htmlFlowData"), W(k)) : (e.consume(k), I);
  }
  function W(k) {
    return e.check(fS, R, X)(k);
  }
  function R(k) {
    return e.enter("lineEnding"), e.consume(k), e.exit("lineEnding"), M;
  }
  function M(k) {
    return k === null || K(k) ? W(k) : (e.enter("htmlFlowData"), I(k));
  }
  function B(k) {
    return k === 45 ? (e.consume(k), S) : I(k);
  }
  function z(k) {
    return k === 47 ? (e.consume(k), s = "", $) : I(k);
  }
  function $(k) {
    if (k === 62) {
      const G = s.toLowerCase();
      return lu.includes(G) ? (e.consume(k), oe) : I(k);
    }
    return Xe(k) && s.length < 8 ? (e.consume(k), s += String.fromCharCode(k), $) : I(k);
  }
  function U(k) {
    return k === 93 ? (e.consume(k), S) : I(k);
  }
  function S(k) {
    return k === 62 ? (e.consume(k), oe) : k === 45 && i === 2 ? (e.consume(k), S) : I(k);
  }
  function oe(k) {
    return k === null || K(k) ? (e.exit("htmlFlowData"), X(k)) : (e.consume(k), oe);
  }
  function X(k) {
    return e.exit("htmlFlow"), t(k);
  }
}
function mS(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return K(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o) : n(s);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
function gS(e, t, n) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(Wr, t, n);
  }
}
const yS = {
  name: "htmlText",
  tokenize: vS
};
function vS(e, t, n) {
  const r = this;
  let i, o, s;
  return a;
  function a(S) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(S), l;
  }
  function l(S) {
    return S === 33 ? (e.consume(S), c) : S === 47 ? (e.consume(S), E) : S === 63 ? (e.consume(S), w) : Xe(S) ? (e.consume(S), N) : n(S);
  }
  function c(S) {
    return S === 45 ? (e.consume(S), u) : S === 91 ? (e.consume(S), o = 0, m) : Xe(S) ? (e.consume(S), x) : n(S);
  }
  function u(S) {
    return S === 45 ? (e.consume(S), f) : n(S);
  }
  function d(S) {
    return S === null ? n(S) : S === 45 ? (e.consume(S), h) : K(S) ? (s = d, z(S)) : (e.consume(S), d);
  }
  function h(S) {
    return S === 45 ? (e.consume(S), f) : d(S);
  }
  function f(S) {
    return S === 62 ? B(S) : S === 45 ? h(S) : d(S);
  }
  function m(S) {
    const oe = "CDATA[";
    return S === oe.charCodeAt(o++) ? (e.consume(S), o === oe.length ? p : m) : n(S);
  }
  function p(S) {
    return S === null ? n(S) : S === 93 ? (e.consume(S), y) : K(S) ? (s = p, z(S)) : (e.consume(S), p);
  }
  function y(S) {
    return S === 93 ? (e.consume(S), g) : p(S);
  }
  function g(S) {
    return S === 62 ? B(S) : S === 93 ? (e.consume(S), g) : p(S);
  }
  function x(S) {
    return S === null || S === 62 ? B(S) : K(S) ? (s = x, z(S)) : (e.consume(S), x);
  }
  function w(S) {
    return S === null ? n(S) : S === 63 ? (e.consume(S), P) : K(S) ? (s = w, z(S)) : (e.consume(S), w);
  }
  function P(S) {
    return S === 62 ? B(S) : w(S);
  }
  function E(S) {
    return Xe(S) ? (e.consume(S), C) : n(S);
  }
  function C(S) {
    return S === 45 || Ge(S) ? (e.consume(S), C) : A(S);
  }
  function A(S) {
    return K(S) ? (s = A, z(S)) : le(S) ? (e.consume(S), A) : B(S);
  }
  function N(S) {
    return S === 45 || Ge(S) ? (e.consume(S), N) : S === 47 || S === 62 || Se(S) ? L(S) : n(S);
  }
  function L(S) {
    return S === 47 ? (e.consume(S), B) : S === 58 || S === 95 || Xe(S) ? (e.consume(S), T) : K(S) ? (s = L, z(S)) : le(S) ? (e.consume(S), L) : B(S);
  }
  function T(S) {
    return S === 45 || S === 46 || S === 58 || S === 95 || Ge(S) ? (e.consume(S), T) : O(S);
  }
  function O(S) {
    return S === 61 ? (e.consume(S), I) : K(S) ? (s = O, z(S)) : le(S) ? (e.consume(S), O) : L(S);
  }
  function I(S) {
    return S === null || S === 60 || S === 61 || S === 62 || S === 96 ? n(S) : S === 34 || S === 39 ? (e.consume(S), i = S, W) : K(S) ? (s = I, z(S)) : le(S) ? (e.consume(S), I) : (e.consume(S), R);
  }
  function W(S) {
    return S === i ? (e.consume(S), i = void 0, M) : S === null ? n(S) : K(S) ? (s = W, z(S)) : (e.consume(S), W);
  }
  function R(S) {
    return S === null || S === 34 || S === 39 || S === 60 || S === 61 || S === 96 ? n(S) : S === 47 || S === 62 || Se(S) ? L(S) : (e.consume(S), R);
  }
  function M(S) {
    return S === 47 || S === 62 || Se(S) ? L(S) : n(S);
  }
  function B(S) {
    return S === 62 ? (e.consume(S), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(S);
  }
  function z(S) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(S), e.exit("lineEnding"), $;
  }
  function $(S) {
    return le(S) ? de(e, U, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(S) : U(S);
  }
  function U(S) {
    return e.enter("htmlTextData"), s(S);
  }
}
const Ua = {
  name: "labelEnd",
  resolveAll: SS,
  resolveTo: kS,
  tokenize: CS
}, bS = {
  tokenize: TS
}, xS = {
  tokenize: ES
}, wS = {
  tokenize: PS
};
function SS(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.length; ) {
    const r = e[t][1];
    if (n.push(e[t]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd") {
      const i = r.type === "labelImage" ? 4 : 2;
      r.type = "data", t += i;
    }
  }
  return e.length !== n.length && at(e, 0, e.length, n), e;
}
function kS(e, t) {
  let n = e.length, r = 0, i, o, s, a;
  for (; n--; )
    if (i = e[n][1], o) {
      if (i.type === "link" || i.type === "labelLink" && i._inactive)
        break;
      e[n][0] === "enter" && i.type === "labelLink" && (i._inactive = !0);
    } else if (s) {
      if (e[n][0] === "enter" && (i.type === "labelImage" || i.type === "labelLink") && !i._balanced && (o = n, i.type !== "labelLink")) {
        r = 2;
        break;
      }
    } else i.type === "labelEnd" && (s = n);
  const l = {
    type: e[o][1].type === "labelLink" ? "link" : "image",
    start: {
      ...e[o][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  }, c = {
    type: "label",
    start: {
      ...e[o][1].start
    },
    end: {
      ...e[s][1].end
    }
  }, u = {
    type: "labelText",
    start: {
      ...e[o + r + 2][1].end
    },
    end: {
      ...e[s - 2][1].start
    }
  };
  return a = [["enter", l, t], ["enter", c, t]], a = ht(a, e.slice(o + 1, o + r + 3)), a = ht(a, [["enter", u, t]]), a = ht(a, Ji(t.parser.constructs.insideSpan.null, e.slice(o + r + 4, s - 3), t)), a = ht(a, [["exit", u, t], e[s - 2], e[s - 1], ["exit", c, t]]), a = ht(a, e.slice(s + 1)), a = ht(a, [["exit", l, t]]), at(e, o, e.length, a), e;
}
function CS(e, t, n) {
  const r = this;
  let i = r.events.length, o, s;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      o = r.events[i][1];
      break;
    }
  return a;
  function a(h) {
    return o ? o._inactive ? d(h) : (s = r.parser.defined.includes(wt(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(h), e.exit("labelMarker"), e.exit("labelEnd"), l) : n(h);
  }
  function l(h) {
    return h === 40 ? e.attempt(bS, u, s ? u : d)(h) : h === 91 ? e.attempt(xS, u, s ? c : d)(h) : s ? u(h) : d(h);
  }
  function c(h) {
    return e.attempt(wS, u, d)(h);
  }
  function u(h) {
    return t(h);
  }
  function d(h) {
    return o._balanced = !0, n(h);
  }
}
function TS(e, t, n) {
  return r;
  function r(d) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), i;
  }
  function i(d) {
    return Se(d) ? Ar(e, o)(d) : o(d);
  }
  function o(d) {
    return d === 41 ? u(d) : zh(e, s, a, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(d);
  }
  function s(d) {
    return Se(d) ? Ar(e, l)(d) : u(d);
  }
  function a(d) {
    return n(d);
  }
  function l(d) {
    return d === 34 || d === 39 || d === 40 ? $h(e, c, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(d) : u(d);
  }
  function c(d) {
    return Se(d) ? Ar(e, u)(d) : u(d);
  }
  function u(d) {
    return d === 41 ? (e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), e.exit("resource"), t) : n(d);
  }
}
function ES(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return jh.call(r, e, o, s, "reference", "referenceMarker", "referenceString")(a);
  }
  function o(a) {
    return r.parser.defined.includes(wt(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? t(a) : n(a);
  }
  function s(a) {
    return n(a);
  }
}
function PS(e, t, n) {
  return r;
  function r(o) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), i;
  }
  function i(o) {
    return o === 93 ? (e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), e.exit("reference"), t) : n(o);
  }
}
const AS = {
  name: "labelStartImage",
  resolveAll: Ua.resolveAll,
  tokenize: RS
};
function RS(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return e.enter("labelImage"), e.enter("labelImageMarker"), e.consume(a), e.exit("labelImageMarker"), o;
  }
  function o(a) {
    return a === 91 ? (e.enter("labelMarker"), e.consume(a), e.exit("labelMarker"), e.exit("labelImage"), s) : n(a);
  }
  function s(a) {
    return a === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(a) : t(a);
  }
}
const NS = {
  name: "labelStartLink",
  resolveAll: Ua.resolveAll,
  tokenize: IS
};
function IS(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(s), e.exit("labelMarker"), e.exit("labelLink"), o;
  }
  function o(s) {
    return s === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(s) : t(s);
  }
}
const zo = {
  name: "lineEnding",
  tokenize: DS
};
function DS(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), de(e, t, "linePrefix");
  }
}
const mi = {
  name: "thematicBreak",
  tokenize: MS
};
function MS(e, t, n) {
  let r = 0, i;
  return o;
  function o(c) {
    return e.enter("thematicBreak"), s(c);
  }
  function s(c) {
    return i = c, a(c);
  }
  function a(c) {
    return c === i ? (e.enter("thematicBreakSequence"), l(c)) : r >= 3 && (c === null || K(c)) ? (e.exit("thematicBreak"), t(c)) : n(c);
  }
  function l(c) {
    return c === i ? (e.consume(c), r++, l) : (e.exit("thematicBreakSequence"), le(c) ? de(e, a, "whitespace")(c) : a(c));
  }
}
const Je = {
  continuation: {
    tokenize: FS
  },
  exit: BS,
  name: "list",
  tokenize: _S
}, OS = {
  partial: !0,
  tokenize: zS
}, LS = {
  partial: !0,
  tokenize: VS
};
function _S(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let o = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, s = 0;
  return a;
  function a(f) {
    const m = r.containerState.type || (f === 42 || f === 43 || f === 45 ? "listUnordered" : "listOrdered");
    if (m === "listUnordered" ? !r.containerState.marker || f === r.containerState.marker : Rs(f)) {
      if (r.containerState.type || (r.containerState.type = m, e.enter(m, {
        _container: !0
      })), m === "listUnordered")
        return e.enter("listItemPrefix"), f === 42 || f === 45 ? e.check(mi, n, c)(f) : c(f);
      if (!r.interrupt || f === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), l(f);
    }
    return n(f);
  }
  function l(f) {
    return Rs(f) && ++s < 10 ? (e.consume(f), l) : (!r.interrupt || s < 2) && (r.containerState.marker ? f === r.containerState.marker : f === 41 || f === 46) ? (e.exit("listItemValue"), c(f)) : n(f);
  }
  function c(f) {
    return e.enter("listItemMarker"), e.consume(f), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || f, e.check(
      Wr,
      // Can’t be empty when interrupting.
      r.interrupt ? n : u,
      e.attempt(OS, h, d)
    );
  }
  function u(f) {
    return r.containerState.initialBlankLine = !0, o++, h(f);
  }
  function d(f) {
    return le(f) ? (e.enter("listItemPrefixWhitespace"), e.consume(f), e.exit("listItemPrefixWhitespace"), h) : n(f);
  }
  function h(f) {
    return r.containerState.size = o + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(f);
  }
}
function FS(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(Wr, i, o);
  function i(a) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, de(e, t, "listItemIndent", r.containerState.size + 1)(a);
  }
  function o(a) {
    return r.containerState.furtherBlankLines || !le(a) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, s(a)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(LS, t, s)(a));
  }
  function s(a) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, de(e, e.attempt(Je, t, n), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a);
  }
}
function VS(e, t, n) {
  const r = this;
  return de(e, i, "listItemIndent", r.containerState.size + 1);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "listItemIndent" && s[2].sliceSerialize(s[1], !0).length === r.containerState.size ? t(o) : n(o);
  }
}
function BS(e) {
  e.exit(this.containerState.type);
}
function zS(e, t, n) {
  const r = this;
  return de(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return !le(o) && s && s[1].type === "listItemPrefixWhitespace" ? t(o) : n(o);
  }
}
const cu = {
  name: "setextUnderline",
  resolveTo: jS,
  tokenize: $S
};
function jS(e, t) {
  let n = e.length, r, i, o;
  for (; n--; )
    if (e[n][0] === "enter") {
      if (e[n][1].type === "content") {
        r = n;
        break;
      }
      e[n][1].type === "paragraph" && (i = n);
    } else
      e[n][1].type === "content" && e.splice(n, 1), !o && e[n][1].type === "definition" && (o = n);
  const s = {
    type: "setextHeading",
    start: {
      ...e[r][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  };
  return e[i][1].type = "setextHeadingText", o ? (e.splice(i, 0, ["enter", s, t]), e.splice(o + 1, 0, ["exit", e[r][1], t]), e[r][1].end = {
    ...e[o][1].end
  }) : e[r][1] = s, e.push(["exit", s, t]), e;
}
function $S(e, t, n) {
  const r = this;
  let i;
  return o;
  function o(c) {
    let u = r.events.length, d;
    for (; u--; )
      if (r.events[u][1].type !== "lineEnding" && r.events[u][1].type !== "linePrefix" && r.events[u][1].type !== "content") {
        d = r.events[u][1].type === "paragraph";
        break;
      }
    return !r.parser.lazy[r.now().line] && (r.interrupt || d) ? (e.enter("setextHeadingLine"), i = c, s(c)) : n(c);
  }
  function s(c) {
    return e.enter("setextHeadingLineSequence"), a(c);
  }
  function a(c) {
    return c === i ? (e.consume(c), a) : (e.exit("setextHeadingLineSequence"), le(c) ? de(e, l, "lineSuffix")(c) : l(c));
  }
  function l(c) {
    return c === null || K(c) ? (e.exit("setextHeadingLine"), t(c)) : n(c);
  }
}
const US = {
  tokenize: HS
};
function HS(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    Wr,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, de(e, e.attempt(this.parser.constructs.flow, i, e.attempt(Y1, i)), "linePrefix"))
  );
  return n;
  function r(o) {
    if (o === null) {
      e.consume(o);
      return;
    }
    return e.enter("lineEndingBlank"), e.consume(o), e.exit("lineEndingBlank"), t.currentConstruct = void 0, n;
  }
  function i(o) {
    if (o === null) {
      e.consume(o);
      return;
    }
    return e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), t.currentConstruct = void 0, n;
  }
}
const WS = {
  resolveAll: Hh()
}, qS = Uh("string"), KS = Uh("text");
function Uh(e) {
  return {
    resolveAll: Hh(e === "text" ? GS : void 0),
    tokenize: t
  };
  function t(n) {
    const r = this, i = this.parser.constructs[e], o = n.attempt(i, s, a);
    return s;
    function s(u) {
      return c(u) ? o(u) : a(u);
    }
    function a(u) {
      if (u === null) {
        n.consume(u);
        return;
      }
      return n.enter("data"), n.consume(u), l;
    }
    function l(u) {
      return c(u) ? (n.exit("data"), o(u)) : (n.consume(u), l);
    }
    function c(u) {
      if (u === null)
        return !0;
      const d = i[u];
      let h = -1;
      if (d)
        for (; ++h < d.length; ) {
          const f = d[h];
          if (!f.previous || f.previous.call(r, r.previous))
            return !0;
        }
      return !1;
    }
  }
}
function Hh(e) {
  return t;
  function t(n, r) {
    let i = -1, o;
    for (; ++i <= n.length; )
      o === void 0 ? n[i] && n[i][1].type === "data" && (o = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== o + 2 && (n[o][1].end = n[i - 1][1].end, n.splice(o + 2, i - o - 2), i = o + 2), o = void 0);
    return e ? e(n, r) : n;
  }
}
function GS(e, t) {
  let n = 0;
  for (; ++n <= e.length; )
    if ((n === e.length || e[n][1].type === "lineEnding") && e[n - 1][1].type === "data") {
      const r = e[n - 1][1], i = t.sliceStream(r);
      let o = i.length, s = -1, a = 0, l;
      for (; o--; ) {
        const c = i[o];
        if (typeof c == "string") {
          for (s = c.length; c.charCodeAt(s - 1) === 32; )
            a++, s--;
          if (s) break;
          s = -1;
        } else if (c === -2)
          l = !0, a++;
        else if (c !== -1) {
          o++;
          break;
        }
      }
      if (t._contentTypeTextTrailing && n === e.length && (a = 0), a) {
        const c = {
          type: n === e.length || l || a < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: o ? s : r.start._bufferIndex + s,
            _index: r.start._index + o,
            line: r.end.line,
            column: r.end.column - a,
            offset: r.end.offset - a
          },
          end: {
            ...r.end
          }
        };
        r.end = {
          ...c.start
        }, r.start.offset === r.end.offset ? Object.assign(r, c) : (e.splice(n, 0, ["enter", c, t], ["exit", c, t]), n += 2);
      }
      n++;
    }
  return e;
}
const YS = {
  42: Je,
  43: Je,
  45: Je,
  48: Je,
  49: Je,
  50: Je,
  51: Je,
  52: Je,
  53: Je,
  54: Je,
  55: Je,
  56: Je,
  57: Je,
  62: _h
}, XS = {
  91: eS
}, ZS = {
  [-2]: Bo,
  [-1]: Bo,
  32: Bo
}, JS = {
  35: sS,
  42: mi,
  45: [cu, mi],
  60: uS,
  61: cu,
  95: mi,
  96: au,
  126: au
}, QS = {
  38: Vh,
  92: Fh
}, ek = {
  [-5]: zo,
  [-4]: zo,
  [-3]: zo,
  33: AS,
  38: Vh,
  42: Ns,
  60: [N1, yS],
  91: NS,
  92: [iS, Fh],
  93: Ua,
  95: Ns,
  96: U1
}, tk = {
  null: [Ns, WS]
}, nk = {
  null: [42, 95]
}, rk = {
  null: []
}, ik = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: nk,
  contentInitial: XS,
  disable: rk,
  document: YS,
  flow: JS,
  flowInitial: ZS,
  insideSpan: tk,
  string: QS,
  text: ek
}, Symbol.toStringTag, { value: "Module" }));
function ok(e, t, n) {
  let r = {
    _bufferIndex: -1,
    _index: 0,
    line: n && n.line || 1,
    column: n && n.column || 1,
    offset: n && n.offset || 0
  };
  const i = {}, o = [];
  let s = [], a = [];
  const l = {
    attempt: A(E),
    check: A(C),
    consume: x,
    enter: w,
    exit: P,
    interrupt: A(C, {
      interrupt: !0
    })
  }, c = {
    code: null,
    containerState: {},
    defineSkip: p,
    events: [],
    now: m,
    parser: e,
    previous: null,
    sliceSerialize: h,
    sliceStream: f,
    write: d
  };
  let u = t.tokenize.call(c, l);
  return t.resolveAll && o.push(t), c;
  function d(O) {
    return s = ht(s, O), y(), s[s.length - 1] !== null ? [] : (N(t, 0), c.events = Ji(o, c.events, c), c.events);
  }
  function h(O, I) {
    return ak(f(O), I);
  }
  function f(O) {
    return sk(s, O);
  }
  function m() {
    const {
      _bufferIndex: O,
      _index: I,
      line: W,
      column: R,
      offset: M
    } = r;
    return {
      _bufferIndex: O,
      _index: I,
      line: W,
      column: R,
      offset: M
    };
  }
  function p(O) {
    i[O.line] = O.column, T();
  }
  function y() {
    let O;
    for (; r._index < s.length; ) {
      const I = s[r._index];
      if (typeof I == "string")
        for (O = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === O && r._bufferIndex < I.length; )
          g(I.charCodeAt(r._bufferIndex));
      else
        g(I);
    }
  }
  function g(O) {
    u = u(O);
  }
  function x(O) {
    K(O) ? (r.line++, r.column = 1, r.offset += O === -3 ? 2 : 1, T()) : O !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    s[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = O;
  }
  function w(O, I) {
    const W = I || {};
    return W.type = O, W.start = m(), c.events.push(["enter", W, c]), a.push(W), W;
  }
  function P(O) {
    const I = a.pop();
    return I.end = m(), c.events.push(["exit", I, c]), I;
  }
  function E(O, I) {
    N(O, I.from);
  }
  function C(O, I) {
    I.restore();
  }
  function A(O, I) {
    return W;
    function W(R, M, B) {
      let z, $, U, S;
      return Array.isArray(R) ? (
        /* c8 ignore next 1 */
        X(R)
      ) : "tokenize" in R ? (
        // Looks like a construct.
        X([
          /** @type {Construct} */
          R
        ])
      ) : oe(R);
      function oe(ce) {
        return H;
        function H(re) {
          const fe = re !== null && ce[re], ne = re !== null && ce.null, se = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(fe) ? fe : fe ? [fe] : [],
            ...Array.isArray(ne) ? ne : ne ? [ne] : []
          ];
          return X(se)(re);
        }
      }
      function X(ce) {
        return z = ce, $ = 0, ce.length === 0 ? B : k(ce[$]);
      }
      function k(ce) {
        return H;
        function H(re) {
          return S = L(), U = ce, ce.partial || (c.currentConstruct = ce), ce.name && c.parser.constructs.disable.null.includes(ce.name) ? ue() : ce.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            I ? Object.assign(Object.create(c), I) : c,
            l,
            G,
            ue
          )(re);
        }
      }
      function G(ce) {
        return O(U, S), M;
      }
      function ue(ce) {
        return S.restore(), ++$ < z.length ? k(z[$]) : B;
      }
    }
  }
  function N(O, I) {
    O.resolveAll && !o.includes(O) && o.push(O), O.resolve && at(c.events, I, c.events.length - I, O.resolve(c.events.slice(I), c)), O.resolveTo && (c.events = O.resolveTo(c.events, c));
  }
  function L() {
    const O = m(), I = c.previous, W = c.currentConstruct, R = c.events.length, M = Array.from(a);
    return {
      from: R,
      restore: B
    };
    function B() {
      r = O, c.previous = I, c.currentConstruct = W, c.events.length = R, a = M, T();
    }
  }
  function T() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function sk(e, t) {
  const n = t.start._index, r = t.start._bufferIndex, i = t.end._index, o = t.end._bufferIndex;
  let s;
  if (n === i)
    s = [e[n].slice(r, o)];
  else {
    if (s = e.slice(n, i), r > -1) {
      const a = s[0];
      typeof a == "string" ? s[0] = a.slice(r) : s.shift();
    }
    o > 0 && s.push(e[i].slice(0, o));
  }
  return s;
}
function ak(e, t) {
  let n = -1;
  const r = [];
  let i;
  for (; ++n < e.length; ) {
    const o = e[n];
    let s;
    if (typeof o == "string")
      s = o;
    else switch (o) {
      case -5: {
        s = "\r";
        break;
      }
      case -4: {
        s = `
`;
        break;
      }
      case -3: {
        s = `\r
`;
        break;
      }
      case -2: {
        s = t ? " " : "	";
        break;
      }
      case -1: {
        if (!t && i) continue;
        s = " ";
        break;
      }
      default:
        s = String.fromCharCode(o);
    }
    i = o === -2, r.push(s);
  }
  return r.join("");
}
function lk(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      Oh([ik, ...(e || {}).extensions || []])
    ),
    content: i(k1),
    defined: [],
    document: i(T1),
    flow: i(US),
    lazy: {},
    string: i(qS),
    text: i(KS)
  };
  return r;
  function i(o) {
    return s;
    function s(a) {
      return ok(r, o, a);
    }
  }
}
function ck(e) {
  for (; !Bh(e); )
    ;
  return e;
}
const uu = /[\0\t\n\r]/g;
function uk() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(o, s, a) {
    const l = [];
    let c, u, d, h, f;
    for (o = t + (typeof o == "string" ? o.toString() : new TextDecoder(s || void 0).decode(o)), d = 0, t = "", n && (o.charCodeAt(0) === 65279 && d++, n = void 0); d < o.length; ) {
      if (uu.lastIndex = d, c = uu.exec(o), h = c && c.index !== void 0 ? c.index : o.length, f = o.charCodeAt(h), !c) {
        t = o.slice(d);
        break;
      }
      if (f === 10 && d === h && r)
        l.push(-3), r = void 0;
      else
        switch (r && (l.push(-5), r = void 0), d < h && (l.push(o.slice(d, h)), e += h - d), f) {
          case 0: {
            l.push(65533), e++;
            break;
          }
          case 9: {
            for (u = Math.ceil(e / 4) * 4, l.push(-2); e++ < u; ) l.push(-1);
            break;
          }
          case 10: {
            l.push(-4), e = 1;
            break;
          }
          default:
            r = !0, e = 1;
        }
      d = h + 1;
    }
    return a && (r && l.push(-5), t && l.push(t), l.push(null)), l;
  }
}
const dk = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function fk(e) {
  return e.replace(dk, hk);
}
function hk(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), o = i === 120 || i === 88;
    return Lh(n.slice(o ? 2 : 1), o ? 16 : 10);
  }
  return $a(n) || e;
}
const Wh = {}.hasOwnProperty;
function pk(e, t, n) {
  return typeof t != "string" && (n = t, t = void 0), mk(n)(ck(lk(n).document().write(uk()(e, t, !0))));
}
function mk(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: o(Te),
      autolinkProtocol: L,
      autolinkEmail: L,
      atxHeading: o(Ne),
      blockQuote: o(ne),
      characterEscape: L,
      characterReference: L,
      codeFenced: o(se),
      codeFencedFenceInfo: s,
      codeFencedFenceMeta: s,
      codeIndented: o(se, s),
      codeText: o(q, s),
      codeTextData: L,
      data: L,
      codeFlowValue: L,
      definition: o(Q),
      definitionDestinationString: s,
      definitionLabelString: s,
      definitionTitleString: s,
      emphasis: o(we),
      hardBreakEscape: o(ve),
      hardBreakTrailing: o(ve),
      htmlFlow: o(be, s),
      htmlFlowData: L,
      htmlText: o(be, s),
      htmlTextData: L,
      image: o(Me),
      label: s,
      link: o(Te),
      listItem: o(Fe),
      listItemValue: h,
      listOrdered: o(_e, d),
      listUnordered: o(_e),
      paragraph: o(Oe),
      reference: k,
      referenceString: s,
      resourceDestinationString: s,
      resourceTitleString: s,
      setextHeading: o(Ne),
      strong: o(ke),
      thematicBreak: o(bo)
    },
    exit: {
      atxHeading: l(),
      atxHeadingSequence: E,
      autolink: l(),
      autolinkEmail: fe,
      autolinkProtocol: re,
      blockQuote: l(),
      characterEscapeValue: T,
      characterReferenceMarkerHexadecimal: ue,
      characterReferenceMarkerNumeric: ue,
      characterReferenceValue: ce,
      characterReference: H,
      codeFenced: l(y),
      codeFencedFence: p,
      codeFencedFenceInfo: f,
      codeFencedFenceMeta: m,
      codeFlowValue: T,
      codeIndented: l(g),
      codeText: l(M),
      codeTextData: T,
      data: T,
      definition: l(),
      definitionDestinationString: P,
      definitionLabelString: x,
      definitionTitleString: w,
      emphasis: l(),
      hardBreakEscape: l(I),
      hardBreakTrailing: l(I),
      htmlFlow: l(W),
      htmlFlowData: T,
      htmlText: l(R),
      htmlTextData: T,
      image: l(z),
      label: U,
      labelText: $,
      lineEnding: O,
      link: l(B),
      listItem: l(),
      listOrdered: l(),
      listUnordered: l(),
      paragraph: l(),
      referenceString: G,
      resourceDestinationString: S,
      resourceTitleString: oe,
      resource: X,
      setextHeading: l(N),
      setextHeadingLineSequence: A,
      setextHeadingText: C,
      strong: l(),
      thematicBreak: l()
    }
  };
  qh(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(D) {
    let j = {
      type: "root",
      children: []
    };
    const Z = {
      stack: [j],
      tokenStack: [],
      config: t,
      enter: a,
      exit: c,
      buffer: s,
      resume: u,
      data: n
    }, ae = [];
    let he = -1;
    for (; ++he < D.length; )
      if (D[he][1].type === "listOrdered" || D[he][1].type === "listUnordered")
        if (D[he][0] === "enter")
          ae.push(he);
        else {
          const rt = ae.pop();
          he = i(D, rt, he);
        }
    for (he = -1; ++he < D.length; ) {
      const rt = t[D[he][0]];
      Wh.call(rt, D[he][1].type) && rt[D[he][1].type].call(Object.assign({
        sliceSerialize: D[he][2].sliceSerialize
      }, Z), D[he][1]);
    }
    if (Z.tokenStack.length > 0) {
      const rt = Z.tokenStack[Z.tokenStack.length - 1];
      (rt[1] || du).call(Z, void 0, rt[0]);
    }
    for (j.position = {
      start: Zt(D.length > 0 ? D[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: Zt(D.length > 0 ? D[D.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, he = -1; ++he < t.transforms.length; )
      j = t.transforms[he](j) || j;
    return j;
  }
  function i(D, j, Z) {
    let ae = j - 1, he = -1, rt = !1, Tt, it, ut, Ht;
    for (; ++ae <= Z; ) {
      const Ve = D[ae];
      switch (Ve[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          Ve[0] === "enter" ? he++ : he--, Ht = void 0;
          break;
        }
        case "lineEndingBlank": {
          Ve[0] === "enter" && (Tt && !Ht && !he && !ut && (ut = ae), Ht = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          Ht = void 0;
      }
      if (!he && Ve[0] === "enter" && Ve[1].type === "listItemPrefix" || he === -1 && Ve[0] === "exit" && (Ve[1].type === "listUnordered" || Ve[1].type === "listOrdered")) {
        if (Tt) {
          let Wt = ae;
          for (it = void 0; Wt--; ) {
            const pt = D[Wt];
            if (pt[1].type === "lineEnding" || pt[1].type === "lineEndingBlank") {
              if (pt[0] === "exit") continue;
              it && (D[it][1].type = "lineEndingBlank", rt = !0), pt[1].type = "lineEnding", it = Wt;
            } else if (!(pt[1].type === "linePrefix" || pt[1].type === "blockQuotePrefix" || pt[1].type === "blockQuotePrefixWhitespace" || pt[1].type === "blockQuoteMarker" || pt[1].type === "listItemIndent")) break;
          }
          ut && (!it || ut < it) && (Tt._spread = !0), Tt.end = Object.assign({}, it ? D[it][1].start : Ve[1].end), D.splice(it || ae, 0, ["exit", Tt, Ve[2]]), ae++, Z++;
        }
        if (Ve[1].type === "listItemPrefix") {
          const Wt = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, Ve[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          Tt = Wt, D.splice(ae, 0, ["enter", Wt, Ve[2]]), ae++, Z++, ut = void 0, Ht = !0;
        }
      }
    }
    return D[j][1]._spread = rt, Z;
  }
  function o(D, j) {
    return Z;
    function Z(ae) {
      a.call(this, D(ae), ae), j && j.call(this, ae);
    }
  }
  function s() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function a(D, j, Z) {
    this.stack[this.stack.length - 1].children.push(D), this.stack.push(D), this.tokenStack.push([j, Z || void 0]), D.position = {
      start: Zt(j.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function l(D) {
    return j;
    function j(Z) {
      D && D.call(this, Z), c.call(this, Z);
    }
  }
  function c(D, j) {
    const Z = this.stack.pop(), ae = this.tokenStack.pop();
    if (ae)
      ae[0].type !== D.type && (j ? j.call(this, D, ae[0]) : (ae[1] || du).call(this, D, ae[0]));
    else throw new Error("Cannot close `" + D.type + "` (" + Pr({
      start: D.start,
      end: D.end
    }) + "): it’s not open");
    Z.position.end = Zt(D.end);
  }
  function u() {
    return ja(this.stack.pop());
  }
  function d() {
    this.data.expectingFirstListItemValue = !0;
  }
  function h(D) {
    if (this.data.expectingFirstListItemValue) {
      const j = this.stack[this.stack.length - 2];
      j.start = Number.parseInt(this.sliceSerialize(D), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function f() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.lang = D;
  }
  function m() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.meta = D;
  }
  function p() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function y() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.value = D.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function g() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.value = D.replace(/(\r?\n|\r)$/g, "");
  }
  function x(D) {
    const j = this.resume(), Z = this.stack[this.stack.length - 1];
    Z.label = j, Z.identifier = wt(this.sliceSerialize(D)).toLowerCase();
  }
  function w() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.title = D;
  }
  function P() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.url = D;
  }
  function E(D) {
    const j = this.stack[this.stack.length - 1];
    if (!j.depth) {
      const Z = this.sliceSerialize(D).length;
      j.depth = Z;
    }
  }
  function C() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function A(D) {
    const j = this.stack[this.stack.length - 1];
    j.depth = this.sliceSerialize(D).codePointAt(0) === 61 ? 1 : 2;
  }
  function N() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function L(D) {
    const Z = this.stack[this.stack.length - 1].children;
    let ae = Z[Z.length - 1];
    (!ae || ae.type !== "text") && (ae = vo(), ae.position = {
      start: Zt(D.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, Z.push(ae)), this.stack.push(ae);
  }
  function T(D) {
    const j = this.stack.pop();
    j.value += this.sliceSerialize(D), j.position.end = Zt(D.end);
  }
  function O(D) {
    const j = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const Z = j.children[j.children.length - 1];
      Z.position.end = Zt(D.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && t.canContainEols.includes(j.type) && (L.call(this, D), T.call(this, D));
  }
  function I() {
    this.data.atHardBreak = !0;
  }
  function W() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.value = D;
  }
  function R() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.value = D;
  }
  function M() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.value = D;
  }
  function B() {
    const D = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const j = this.data.referenceType || "shortcut";
      D.type += "Reference", D.referenceType = j, delete D.url, delete D.title;
    } else
      delete D.identifier, delete D.label;
    this.data.referenceType = void 0;
  }
  function z() {
    const D = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const j = this.data.referenceType || "shortcut";
      D.type += "Reference", D.referenceType = j, delete D.url, delete D.title;
    } else
      delete D.identifier, delete D.label;
    this.data.referenceType = void 0;
  }
  function $(D) {
    const j = this.sliceSerialize(D), Z = this.stack[this.stack.length - 2];
    Z.label = fk(j), Z.identifier = wt(j).toLowerCase();
  }
  function U() {
    const D = this.stack[this.stack.length - 1], j = this.resume(), Z = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, Z.type === "link") {
      const ae = D.children;
      Z.children = ae;
    } else
      Z.alt = j;
  }
  function S() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.url = D;
  }
  function oe() {
    const D = this.resume(), j = this.stack[this.stack.length - 1];
    j.title = D;
  }
  function X() {
    this.data.inReference = void 0;
  }
  function k() {
    this.data.referenceType = "collapsed";
  }
  function G(D) {
    const j = this.resume(), Z = this.stack[this.stack.length - 1];
    Z.label = j, Z.identifier = wt(this.sliceSerialize(D)).toLowerCase(), this.data.referenceType = "full";
  }
  function ue(D) {
    this.data.characterReferenceType = D.type;
  }
  function ce(D) {
    const j = this.sliceSerialize(D), Z = this.data.characterReferenceType;
    let ae;
    Z ? (ae = Lh(j, Z === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : ae = $a(j);
    const he = this.stack[this.stack.length - 1];
    he.value += ae;
  }
  function H(D) {
    const j = this.stack.pop();
    j.position.end = Zt(D.end);
  }
  function re(D) {
    T.call(this, D);
    const j = this.stack[this.stack.length - 1];
    j.url = this.sliceSerialize(D);
  }
  function fe(D) {
    T.call(this, D);
    const j = this.stack[this.stack.length - 1];
    j.url = "mailto:" + this.sliceSerialize(D);
  }
  function ne() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function se() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function q() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function Q() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function we() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function Ne() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function ve() {
    return {
      type: "break"
    };
  }
  function be() {
    return {
      type: "html",
      value: ""
    };
  }
  function Me() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function Te() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function _e(D) {
    return {
      type: "list",
      ordered: D.type === "listOrdered",
      start: null,
      spread: D._spread,
      children: []
    };
  }
  function Fe(D) {
    return {
      type: "listItem",
      spread: D._spread,
      checked: null,
      children: []
    };
  }
  function Oe() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function ke() {
    return {
      type: "strong",
      children: []
    };
  }
  function vo() {
    return {
      type: "text",
      value: ""
    };
  }
  function bo() {
    return {
      type: "thematicBreak"
    };
  }
}
function Zt(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function qh(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? qh(e, r) : gk(e, r);
  }
}
function gk(e, t) {
  let n;
  for (n in t)
    if (Wh.call(t, n))
      switch (n) {
        case "canContainEols": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "transforms": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "enter":
        case "exit": {
          const r = t[n];
          r && Object.assign(e[n], r);
          break;
        }
      }
}
function du(e, t) {
  throw e ? new Error("Cannot close `" + e.type + "` (" + Pr({
    start: e.start,
    end: e.end
  }) + "): a different token (`" + t.type + "`, " + Pr({
    start: t.start,
    end: t.end
  }) + ") is open") : new Error("Cannot close document, a token (`" + t.type + "`, " + Pr({
    start: t.start,
    end: t.end
  }) + ") is still open");
}
function yk(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return pk(r, {
      ...t.data("settings"),
      ...e,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      extensions: t.data("micromarkExtensions") || [],
      mdastExtensions: t.data("fromMarkdownExtensions") || []
    });
  }
}
function vk(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function bk(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function xk(e, t) {
  const n = t.value ? t.value + `
` : "", r = {}, i = t.lang ? t.lang.split(/\s+/) : [];
  i.length > 0 && (r.className = ["language-" + i[0]]);
  let o = {
    type: "element",
    tagName: "code",
    properties: r,
    children: [{ type: "text", value: n }]
  };
  return t.meta && (o.data = { meta: t.meta }), e.patch(t, o), o = e.applyData(t, o), o = { type: "element", tagName: "pre", properties: {}, children: [o] }, e.patch(t, o), o;
}
function wk(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Sk(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function kk(e, t) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", r = String(t.identifier).toUpperCase(), i = lr(r.toLowerCase()), o = e.footnoteOrder.indexOf(r);
  let s, a = e.footnoteCounts.get(r);
  a === void 0 ? (a = 0, e.footnoteOrder.push(r), s = e.footnoteOrder.length) : s = o + 1, a += 1, e.footnoteCounts.set(r, a);
  const l = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + n + "fn-" + i,
      id: n + "fnref-" + i + (a > 1 ? "-" + a : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(s) }]
  };
  e.patch(t, l);
  const c = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [l]
  };
  return e.patch(t, c), e.applyData(t, c);
}
function Ck(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Tk(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
}
function Kh(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return [{ type: "text", value: "![" + t.alt + r }];
  const i = e.all(t), o = i[0];
  o && o.type === "text" ? o.value = "[" + o.value : i.unshift({ type: "text", value: "[" });
  const s = i[i.length - 1];
  return s && s.type === "text" ? s.value += r : i.push({ type: "text", value: r }), i;
}
function Ek(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Kh(e, t);
  const i = { src: lr(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(t, o), e.applyData(t, o);
}
function Pk(e, t) {
  const n = { src: lr(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function Ak(e, t) {
  const n = { type: "text", value: t.value.replace(/\r?\n|\r/g, " ") };
  e.patch(t, n);
  const r = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [n]
  };
  return e.patch(t, r), e.applyData(t, r);
}
function Rk(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Kh(e, t);
  const i = { href: lr(r.url || "") };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = {
    type: "element",
    tagName: "a",
    properties: i,
    children: e.all(t)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function Nk(e, t) {
  const n = { href: lr(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: n,
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function Ik(e, t, n) {
  const r = e.all(t), i = n ? Dk(n) : Gh(t), o = {}, s = [];
  if (typeof t.checked == "boolean") {
    const u = r[0];
    let d;
    u && u.type === "element" && u.tagName === "p" ? d = u : (d = { type: "element", tagName: "p", properties: {}, children: [] }, r.unshift(d)), d.children.length > 0 && d.children.unshift({ type: "text", value: " " }), d.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: t.checked, disabled: !0 },
      children: []
    }), o.className = ["task-list-item"];
  }
  let a = -1;
  for (; ++a < r.length; ) {
    const u = r[a];
    (i || a !== 0 || u.type !== "element" || u.tagName !== "p") && s.push({ type: "text", value: `
` }), u.type === "element" && u.tagName === "p" && !i ? s.push(...u.children) : s.push(u);
  }
  const l = r[r.length - 1];
  l && (i || l.type !== "element" || l.tagName !== "p") && s.push({ type: "text", value: `
` });
  const c = { type: "element", tagName: "li", properties: o, children: s };
  return e.patch(t, c), e.applyData(t, c);
}
function Dk(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = Gh(n[r]);
  }
  return t;
}
function Gh(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function Mk(e, t) {
  const n = {}, r = e.all(t);
  let i = -1;
  for (typeof t.start == "number" && t.start !== 1 && (n.start = t.start); ++i < r.length; ) {
    const s = r[i];
    if (s.type === "element" && s.tagName === "li" && s.properties && Array.isArray(s.properties.className) && s.properties.className.includes("task-list-item")) {
      n.className = ["contains-task-list"];
      break;
    }
  }
  const o = {
    type: "element",
    tagName: t.ordered ? "ol" : "ul",
    properties: n,
    children: e.wrap(r, !0)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function Ok(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Lk(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function _k(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Fk(e, t) {
  const n = e.all(t), r = n.shift(), i = [];
  if (r) {
    const s = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: e.wrap([r], !0)
    };
    e.patch(t.children[0], s), i.push(s);
  }
  if (n.length > 0) {
    const s = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: e.wrap(n, !0)
    }, a = Fa(t.children[1]), l = Ph(t.children[t.children.length - 1]);
    a && l && (s.position = { start: a, end: l }), i.push(s);
  }
  const o = {
    type: "element",
    tagName: "table",
    properties: {},
    children: e.wrap(i, !0)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function Vk(e, t, n) {
  const r = n ? n.children : void 0, o = (r ? r.indexOf(t) : 1) === 0 ? "th" : "td", s = n && n.type === "table" ? n.align : void 0, a = s ? s.length : t.children.length;
  let l = -1;
  const c = [];
  for (; ++l < a; ) {
    const d = t.children[l], h = {}, f = s ? s[l] : void 0;
    f && (h.align = f);
    let m = { type: "element", tagName: o, properties: h, children: [] };
    d && (m.children = e.all(d), e.patch(d, m), m = e.applyData(d, m)), c.push(m);
  }
  const u = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(c, !0)
  };
  return e.patch(t, u), e.applyData(t, u);
}
function Bk(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const fu = 9, hu = 32;
function zk(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const o = [];
  for (; r; )
    o.push(
      pu(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return o.push(pu(t.slice(i), i > 0, !1)), o.join("");
}
function pu(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let o = e.codePointAt(r);
    for (; o === fu || o === hu; )
      r++, o = e.codePointAt(r);
  }
  if (n) {
    let o = e.codePointAt(i - 1);
    for (; o === fu || o === hu; )
      i--, o = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function jk(e, t) {
  const n = { type: "text", value: zk(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function $k(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const Uk = {
  blockquote: vk,
  break: bk,
  code: xk,
  delete: wk,
  emphasis: Sk,
  footnoteReference: kk,
  heading: Ck,
  html: Tk,
  imageReference: Ek,
  image: Pk,
  inlineCode: Ak,
  linkReference: Rk,
  link: Nk,
  listItem: Ik,
  list: Mk,
  paragraph: Ok,
  // @ts-expect-error: root is different, but hard to type.
  root: Lk,
  strong: _k,
  table: Fk,
  tableCell: Bk,
  tableRow: Vk,
  text: jk,
  thematicBreak: $k,
  toml: ei,
  yaml: ei,
  definition: ei,
  footnoteDefinition: ei
};
function ei() {
}
const Yh = -1, Qi = 0, Rr = 1, Ri = 2, Ha = 3, Wa = 4, qa = 5, Ka = 6, Xh = 7, Zh = 8, mu = typeof self == "object" ? self : globalThis, Hk = (e, t) => {
  const n = (i, o) => (e.set(o, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [o, s] = t[i];
    switch (o) {
      case Qi:
      case Yh:
        return n(s, i);
      case Rr: {
        const a = n([], i);
        for (const l of s)
          a.push(r(l));
        return a;
      }
      case Ri: {
        const a = n({}, i);
        for (const [l, c] of s)
          a[r(l)] = r(c);
        return a;
      }
      case Ha:
        return n(new Date(s), i);
      case Wa: {
        const { source: a, flags: l } = s;
        return n(new RegExp(a, l), i);
      }
      case qa: {
        const a = n(/* @__PURE__ */ new Map(), i);
        for (const [l, c] of s)
          a.set(r(l), r(c));
        return a;
      }
      case Ka: {
        const a = n(/* @__PURE__ */ new Set(), i);
        for (const l of s)
          a.add(r(l));
        return a;
      }
      case Xh: {
        const { name: a, message: l } = s;
        return n(new mu[a](l), i);
      }
      case Zh:
        return n(BigInt(s), i);
      case "BigInt":
        return n(Object(BigInt(s)), i);
      case "ArrayBuffer":
        return n(new Uint8Array(s).buffer, s);
      case "DataView": {
        const { buffer: a } = new Uint8Array(s);
        return n(new DataView(a), s);
      }
    }
    return n(new mu[o](s), i);
  };
  return r;
}, gu = (e) => Hk(/* @__PURE__ */ new Map(), e)(0), Mn = "", { toString: Wk } = {}, { keys: qk } = Object, vr = (e) => {
  const t = typeof e;
  if (t !== "object" || !e)
    return [Qi, t];
  const n = Wk.call(e).slice(8, -1);
  switch (n) {
    case "Array":
      return [Rr, Mn];
    case "Object":
      return [Ri, Mn];
    case "Date":
      return [Ha, Mn];
    case "RegExp":
      return [Wa, Mn];
    case "Map":
      return [qa, Mn];
    case "Set":
      return [Ka, Mn];
    case "DataView":
      return [Rr, n];
  }
  return n.includes("Array") ? [Rr, n] : n.includes("Error") ? [Xh, n] : [Ri, n];
}, ti = ([e, t]) => e === Qi && (t === "function" || t === "symbol"), Kk = (e, t, n, r) => {
  const i = (s, a) => {
    const l = r.push(s) - 1;
    return n.set(a, l), l;
  }, o = (s) => {
    if (n.has(s))
      return n.get(s);
    let [a, l] = vr(s);
    switch (a) {
      case Qi: {
        let u = s;
        switch (l) {
          case "bigint":
            a = Zh, u = s.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + l);
            u = null;
            break;
          case "undefined":
            return i([Yh], s);
        }
        return i([a, u], s);
      }
      case Rr: {
        if (l) {
          let h = s;
          return l === "DataView" ? h = new Uint8Array(s.buffer) : l === "ArrayBuffer" && (h = new Uint8Array(s)), i([l, [...h]], s);
        }
        const u = [], d = i([a, u], s);
        for (const h of s)
          u.push(o(h));
        return d;
      }
      case Ri: {
        if (l)
          switch (l) {
            case "BigInt":
              return i([l, s.toString()], s);
            case "Boolean":
            case "Number":
            case "String":
              return i([l, s.valueOf()], s);
          }
        if (t && "toJSON" in s)
          return o(s.toJSON());
        const u = [], d = i([a, u], s);
        for (const h of qk(s))
          (e || !ti(vr(s[h]))) && u.push([o(h), o(s[h])]);
        return d;
      }
      case Ha:
        return i([a, s.toISOString()], s);
      case Wa: {
        const { source: u, flags: d } = s;
        return i([a, { source: u, flags: d }], s);
      }
      case qa: {
        const u = [], d = i([a, u], s);
        for (const [h, f] of s)
          (e || !(ti(vr(h)) || ti(vr(f)))) && u.push([o(h), o(f)]);
        return d;
      }
      case Ka: {
        const u = [], d = i([a, u], s);
        for (const h of s)
          (e || !ti(vr(h))) && u.push(o(h));
        return d;
      }
    }
    const { message: c } = s;
    return i([a, { name: l, message: c }], s);
  };
  return o;
}, yu = (e, { json: t, lossy: n } = {}) => {
  const r = [];
  return Kk(!(t || n), !!t, /* @__PURE__ */ new Map(), r)(e), r;
}, Ni = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, t) => t && ("json" in t || "lossy" in t) ? gu(yu(e, t)) : structuredClone(e)
) : (e, t) => gu(yu(e, t));
function Gk(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return t > 1 && n.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(t) }]
  }), n;
}
function Yk(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function Xk(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", n = e.options.footnoteBackContent || Gk, r = e.options.footnoteBackLabel || Yk, i = e.options.footnoteLabel || "Footnotes", o = e.options.footnoteLabelTagName || "h2", s = e.options.footnoteLabelProperties || {
    className: ["sr-only"]
  }, a = [];
  let l = -1;
  for (; ++l < e.footnoteOrder.length; ) {
    const c = e.footnoteById.get(
      e.footnoteOrder[l]
    );
    if (!c)
      continue;
    const u = e.all(c), d = String(c.identifier).toUpperCase(), h = lr(d.toLowerCase());
    let f = 0;
    const m = [], p = e.footnoteCounts.get(d);
    for (; p !== void 0 && ++f <= p; ) {
      m.length > 0 && m.push({ type: "text", value: " " });
      let x = typeof n == "string" ? n : n(l, f);
      typeof x == "string" && (x = { type: "text", value: x }), m.push({
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + t + "fnref-" + h + (f > 1 ? "-" + f : ""),
          dataFootnoteBackref: "",
          ariaLabel: typeof r == "string" ? r : r(l, f),
          className: ["data-footnote-backref"]
        },
        children: Array.isArray(x) ? x : [x]
      });
    }
    const y = u[u.length - 1];
    if (y && y.type === "element" && y.tagName === "p") {
      const x = y.children[y.children.length - 1];
      x && x.type === "text" ? x.value += " " : y.children.push({ type: "text", value: " " }), y.children.push(...m);
    } else
      u.push(...m);
    const g = {
      type: "element",
      tagName: "li",
      properties: { id: t + "fn-" + h },
      children: e.wrap(u, !0)
    };
    e.patch(c, g), a.push(g);
  }
  if (a.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: o,
          properties: {
            ...Ni(s),
            id: "footnote-label"
          },
          children: [{ type: "text", value: i }]
        },
        { type: "text", value: `
` },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: e.wrap(a, !0)
        },
        { type: "text", value: `
` }
      ]
    };
}
const eo = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(e) {
    if (e == null)
      return eC;
    if (typeof e == "function")
      return to(e);
    if (typeof e == "object")
      return Array.isArray(e) ? Zk(e) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        Jk(
          /** @type {Props} */
          e
        )
      );
    if (typeof e == "string")
      return Qk(e);
    throw new Error("Expected function, string, or object as test");
  })
);
function Zk(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = eo(e[n]);
  return to(r);
  function r(...i) {
    let o = -1;
    for (; ++o < t.length; )
      if (t[o].apply(this, i)) return !0;
    return !1;
  }
}
function Jk(e) {
  const t = (
    /** @type {Record<string, unknown>} */
    e
  );
  return to(n);
  function n(r) {
    const i = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      r
    );
    let o;
    for (o in e)
      if (i[o] !== t[o]) return !1;
    return !0;
  }
}
function Qk(e) {
  return to(t);
  function t(n) {
    return n && n.type === e;
  }
}
function to(e) {
  return t;
  function t(n, r, i) {
    return !!(tC(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function eC() {
  return !0;
}
function tC(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const Jh = [], nC = !0, Is = !1, rC = "skip";
function Qh(e, t, n, r) {
  let i;
  typeof t == "function" && typeof n != "function" ? (r = n, n = t) : i = t;
  const o = eo(i), s = r ? -1 : 1;
  a(e, void 0, [])();
  function a(l, c, u) {
    const d = (
      /** @type {Record<string, unknown>} */
      l && typeof l == "object" ? l : {}
    );
    if (typeof d.type == "string") {
      const f = (
        // `hast`
        typeof d.tagName == "string" ? d.tagName : (
          // `xast`
          typeof d.name == "string" ? d.name : void 0
        )
      );
      Object.defineProperty(h, "name", {
        value: "node (" + (l.type + (f ? "<" + f + ">" : "")) + ")"
      });
    }
    return h;
    function h() {
      let f = Jh, m, p, y;
      if ((!t || o(l, c, u[u.length - 1] || void 0)) && (f = iC(n(l, u)), f[0] === Is))
        return f;
      if ("children" in l && l.children) {
        const g = (
          /** @type {UnistParent} */
          l
        );
        if (g.children && f[0] !== rC)
          for (p = (r ? g.children.length : -1) + s, y = u.concat(g); p > -1 && p < g.children.length; ) {
            const x = g.children[p];
            if (m = a(x, p, y)(), m[0] === Is)
              return m;
            p = typeof m[1] == "number" ? m[1] : p + s;
          }
      }
      return f;
    }
  }
}
function iC(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [nC, e] : e == null ? Jh : [e];
}
function Ga(e, t, n, r) {
  let i, o, s;
  typeof t == "function" && typeof n != "function" ? (o = void 0, s = t, i = n) : (o = t, s = n, i = r), Qh(e, o, a, i);
  function a(l, c) {
    const u = c[c.length - 1], d = u ? u.children.indexOf(l) : void 0;
    return s(l, d, u);
  }
}
const Ds = {}.hasOwnProperty, oC = {};
function sC(e, t) {
  const n = t || oC, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = { ...Uk, ...n.handlers }, a = {
    all: c,
    applyData: lC,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: o,
    footnoteOrder: [],
    handlers: s,
    one: l,
    options: n,
    patch: aC,
    wrap: uC
  };
  return Ga(e, function(u) {
    if (u.type === "definition" || u.type === "footnoteDefinition") {
      const d = u.type === "definition" ? r : i, h = String(u.identifier).toUpperCase();
      d.has(h) || d.set(h, u);
    }
  }), a;
  function l(u, d) {
    const h = u.type, f = a.handlers[h];
    if (Ds.call(a.handlers, h) && f)
      return f(a, u, d);
    if (a.options.passThrough && a.options.passThrough.includes(h)) {
      if ("children" in u) {
        const { children: p, ...y } = u, g = Ni(y);
        return g.children = a.all(u), g;
      }
      return Ni(u);
    }
    return (a.options.unknownHandler || cC)(a, u, d);
  }
  function c(u) {
    const d = [];
    if ("children" in u) {
      const h = u.children;
      let f = -1;
      for (; ++f < h.length; ) {
        const m = a.one(h[f], u);
        if (m) {
          if (f && h[f - 1].type === "break" && (!Array.isArray(m) && m.type === "text" && (m.value = vu(m.value)), !Array.isArray(m) && m.type === "element")) {
            const p = m.children[0];
            p && p.type === "text" && (p.value = vu(p.value));
          }
          Array.isArray(m) ? d.push(...m) : d.push(m);
        }
      }
    }
    return d;
  }
}
function aC(e, t) {
  e.position && (t.position = Y0(e));
}
function lC(e, t) {
  let n = t;
  if (e && e.data) {
    const r = e.data.hName, i = e.data.hChildren, o = e.data.hProperties;
    if (typeof r == "string")
      if (n.type === "element")
        n.tagName = r;
      else {
        const s = "children" in n ? n.children : [n];
        n = { type: "element", tagName: r, properties: {}, children: s };
      }
    n.type === "element" && o && Object.assign(n.properties, Ni(o)), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function cC(e, t) {
  const n = t.data || {}, r = "value" in t && !(Ds.call(n, "hProperties") || Ds.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function uC(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function vu(e) {
  let t = 0, n = e.charCodeAt(t);
  for (; n === 9 || n === 32; )
    t++, n = e.charCodeAt(t);
  return e.slice(t);
}
function bu(e, t) {
  const n = sC(e, t), r = n.one(e, void 0), i = Xk(n), o = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && o.children.push({ type: "text", value: `
` }, i), o;
}
function dC(e, t) {
  return e && "run" in e ? async function(n, r) {
    const i = (
      /** @type {HastRoot} */
      bu(n, { file: r, ...t })
    );
    await e.run(i, r);
  } : function(n, r) {
    return (
      /** @type {HastRoot} */
      bu(n, { file: r, ...e || t })
    );
  };
}
function xu(e) {
  if (e)
    throw e;
}
var jo, wu;
function fC() {
  if (wu) return jo;
  wu = 1;
  var e = Object.prototype.hasOwnProperty, t = Object.prototype.toString, n = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = function(c) {
    return typeof Array.isArray == "function" ? Array.isArray(c) : t.call(c) === "[object Array]";
  }, o = function(c) {
    if (!c || t.call(c) !== "[object Object]")
      return !1;
    var u = e.call(c, "constructor"), d = c.constructor && c.constructor.prototype && e.call(c.constructor.prototype, "isPrototypeOf");
    if (c.constructor && !u && !d)
      return !1;
    var h;
    for (h in c)
      ;
    return typeof h > "u" || e.call(c, h);
  }, s = function(c, u) {
    n && u.name === "__proto__" ? n(c, u.name, {
      enumerable: !0,
      configurable: !0,
      value: u.newValue,
      writable: !0
    }) : c[u.name] = u.newValue;
  }, a = function(c, u) {
    if (u === "__proto__")
      if (e.call(c, u)) {
        if (r)
          return r(c, u).value;
      } else return;
    return c[u];
  };
  return jo = function l() {
    var c, u, d, h, f, m, p = arguments[0], y = 1, g = arguments.length, x = !1;
    for (typeof p == "boolean" && (x = p, p = arguments[1] || {}, y = 2), (p == null || typeof p != "object" && typeof p != "function") && (p = {}); y < g; ++y)
      if (c = arguments[y], c != null)
        for (u in c)
          d = a(p, u), h = a(c, u), p !== h && (x && h && (o(h) || (f = i(h))) ? (f ? (f = !1, m = d && i(d) ? d : []) : m = d && o(d) ? d : {}, s(p, { name: u, newValue: l(x, m, h) })) : typeof h < "u" && s(p, { name: u, newValue: h }));
    return p;
  }, jo;
}
var hC = fC();
const $o = /* @__PURE__ */ Eh(hC);
function Ms(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function pC() {
  const e = [], t = { run: n, use: r };
  return t;
  function n(...i) {
    let o = -1;
    const s = i.pop();
    if (typeof s != "function")
      throw new TypeError("Expected function as last argument, not " + s);
    a(null, ...i);
    function a(l, ...c) {
      const u = e[++o];
      let d = -1;
      if (l) {
        s(l);
        return;
      }
      for (; ++d < i.length; )
        (c[d] === null || c[d] === void 0) && (c[d] = i[d]);
      i = c, u ? mC(u, a)(...c) : s(null, ...c);
    }
  }
  function r(i) {
    if (typeof i != "function")
      throw new TypeError(
        "Expected `middelware` to be a function, not " + i
      );
    return e.push(i), t;
  }
}
function mC(e, t) {
  let n;
  return r;
  function r(...s) {
    const a = e.length > s.length;
    let l;
    a && s.push(i);
    try {
      l = e.apply(this, s);
    } catch (c) {
      const u = (
        /** @type {Error} */
        c
      );
      if (a && n)
        throw u;
      return i(u);
    }
    a || (l && l.then && typeof l.then == "function" ? l.then(o, i) : l instanceof Error ? i(l) : o(l));
  }
  function i(s, ...a) {
    n || (n = !0, t(s, ...a));
  }
  function o(s) {
    i(null, s);
  }
}
const Et = { basename: gC, dirname: yC, extname: vC, join: bC, sep: "/" };
function gC(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  qr(e);
  let n = 0, r = -1, i = e.length, o;
  if (t === void 0 || t.length === 0 || t.length > e.length) {
    for (; i--; )
      if (e.codePointAt(i) === 47) {
        if (o) {
          n = i + 1;
          break;
        }
      } else r < 0 && (o = !0, r = i + 1);
    return r < 0 ? "" : e.slice(n, r);
  }
  if (t === e)
    return "";
  let s = -1, a = t.length - 1;
  for (; i--; )
    if (e.codePointAt(i) === 47) {
      if (o) {
        n = i + 1;
        break;
      }
    } else
      s < 0 && (o = !0, s = i + 1), a > -1 && (e.codePointAt(i) === t.codePointAt(a--) ? a < 0 && (r = i) : (a = -1, r = s));
  return n === r ? r = s : r < 0 && (r = e.length), e.slice(n, r);
}
function yC(e) {
  if (qr(e), e.length === 0)
    return ".";
  let t = -1, n = e.length, r;
  for (; --n; )
    if (e.codePointAt(n) === 47) {
      if (r) {
        t = n;
        break;
      }
    } else r || (r = !0);
  return t < 0 ? e.codePointAt(0) === 47 ? "/" : "." : t === 1 && e.codePointAt(0) === 47 ? "//" : e.slice(0, t);
}
function vC(e) {
  qr(e);
  let t = e.length, n = -1, r = 0, i = -1, o = 0, s;
  for (; t--; ) {
    const a = e.codePointAt(t);
    if (a === 47) {
      if (s) {
        r = t + 1;
        break;
      }
      continue;
    }
    n < 0 && (s = !0, n = t + 1), a === 46 ? i < 0 ? i = t : o !== 1 && (o = 1) : i > -1 && (o = -1);
  }
  return i < 0 || n < 0 || // We saw a non-dot character immediately before the dot.
  o === 0 || // The (right-most) trimmed path component is exactly `..`.
  o === 1 && i === n - 1 && i === r + 1 ? "" : e.slice(i, n);
}
function bC(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    qr(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : xC(n);
}
function xC(e) {
  qr(e);
  const t = e.codePointAt(0) === 47;
  let n = wC(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function wC(e, t) {
  let n = "", r = 0, i = -1, o = 0, s = -1, a, l;
  for (; ++s <= e.length; ) {
    if (s < e.length)
      a = e.codePointAt(s);
    else {
      if (a === 47)
        break;
      a = 47;
    }
    if (a === 47) {
      if (!(i === s - 1 || o === 1)) if (i !== s - 1 && o === 2) {
        if (n.length < 2 || r !== 2 || n.codePointAt(n.length - 1) !== 46 || n.codePointAt(n.length - 2) !== 46) {
          if (n.length > 2) {
            if (l = n.lastIndexOf("/"), l !== n.length - 1) {
              l < 0 ? (n = "", r = 0) : (n = n.slice(0, l), r = n.length - 1 - n.lastIndexOf("/")), i = s, o = 0;
              continue;
            }
          } else if (n.length > 0) {
            n = "", r = 0, i = s, o = 0;
            continue;
          }
        }
        t && (n = n.length > 0 ? n + "/.." : "..", r = 2);
      } else
        n.length > 0 ? n += "/" + e.slice(i + 1, s) : n = e.slice(i + 1, s), r = s - i - 1;
      i = s, o = 0;
    } else a === 46 && o > -1 ? o++ : o = -1;
  }
  return n;
}
function qr(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const SC = { cwd: kC };
function kC() {
  return "/";
}
function Os(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function CC(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!Os(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return TC(e);
}
function TC(e) {
  if (e.hostname !== "") {
    const r = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    throw r.code = "ERR_INVALID_FILE_URL_HOST", r;
  }
  const t = e.pathname;
  let n = -1;
  for (; ++n < t.length; )
    if (t.codePointAt(n) === 37 && t.codePointAt(n + 1) === 50) {
      const r = t.codePointAt(n + 2);
      if (r === 70 || r === 102) {
        const i = new TypeError(
          "File URL path must not include encoded / characters"
        );
        throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
      }
    }
  return decodeURIComponent(t);
}
const Uo = (
  /** @type {const} */
  [
    "history",
    "path",
    "basename",
    "stem",
    "extname",
    "dirname"
  ]
);
class ep {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Uint8Array` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(t) {
    let n;
    t ? Os(t) ? n = { path: t } : typeof t == "string" || EC(t) ? n = { value: t } : n = t : n = {}, this.cwd = "cwd" in n ? "" : SC.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < Uo.length; ) {
      const o = Uo[r];
      o in n && n[o] !== void 0 && n[o] !== null && (this[o] = o === "history" ? [...n[o]] : n[o]);
    }
    let i;
    for (i in n)
      Uo.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? Et.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} basename
   *   Basename.
   * @returns {undefined}
   *   Nothing.
   */
  set basename(t) {
    Wo(t, "basename"), Ho(t, "basename"), this.path = Et.join(this.dirname || "", t);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? Et.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} dirname
   *   Dirname.
   * @returns {undefined}
   *   Nothing.
   */
  set dirname(t) {
    Su(this.basename, "dirname"), this.path = Et.join(t || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? Et.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} extname
   *   Extname.
   * @returns {undefined}
   *   Nothing.
   */
  set extname(t) {
    if (Ho(t, "extname"), Su(this.dirname, "extname"), t) {
      if (t.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = Et.join(this.dirname, this.stem + (t || ""));
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   *   Path.
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {URL | string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  set path(t) {
    Os(t) && (t = CC(t)), Wo(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? Et.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} stem
   *   Stem.
   * @returns {undefined}
   *   Nothing.
   */
  set stem(t) {
    Wo(t, "stem"), Ho(t, "stem"), this.path = Et.join(this.dirname || "", t + (this.extname || ""));
  }
  // Normal prototypal methods.
  /**
   * Create a fatal message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `true` (error; file not usable)
   * and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Never.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(t, n, r) {
    const i = this.message(t, n, r);
    throw i.fatal = !0, i;
  }
  /**
   * Create an info message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `undefined` (info; change
   * likely not needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(t, n, r) {
    const i = this.message(t, n, r);
    return i.fatal = void 0, i;
  }
  /**
   * Create a message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `false` (warning; change may be
   * needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(t, n, r) {
    const i = new Ye(
      // @ts-expect-error: the overloads are fine.
      t,
      n,
      r
    );
    return this.path && (i.name = this.path + ":" + i.name, i.file = this.path), i.fatal = !1, this.messages.push(i), i;
  }
  /**
   * Serialize the file.
   *
   * > **Note**: which encodings are supported depends on the engine.
   * > For info on Node.js, see:
   * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
   *
   * @param {string | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Uint8Array`
   *   (default: `'utf-8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(t) {
    return this.value === void 0 ? "" : typeof this.value == "string" ? this.value : new TextDecoder(t || void 0).decode(this.value);
  }
}
function Ho(e, t) {
  if (e && e.includes(Et.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + Et.sep + "`"
    );
}
function Wo(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function Su(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function EC(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const PC = (
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  /** @type {unknown} */
  /**
   * @this {Function}
   * @param {string | symbol} property
   * @returns {(...parameters: Array<unknown>) => unknown}
   */
  (function(e) {
    const r = (
      /** @type {Record<string | symbol, Function>} */
      // Prototypes do exist.
      // type-coverage:ignore-next-line
      this.constructor.prototype
    ), i = r[e], o = function() {
      return i.apply(o, arguments);
    };
    return Object.setPrototypeOf(o, r), o;
  })
), AC = {}.hasOwnProperty;
class Ya extends PC {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = pC();
  }
  /**
   * Copy a processor.
   *
   * @deprecated
   *   This is a private internal method and should not be used.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   New *unfrozen* processor ({@linkcode Processor}) that is
   *   configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  copy() {
    const t = (
      /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
      new Ya()
    );
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return t.data($o(!0, {}, this.namespace)), t;
  }
  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * > **Note**: to register custom data in TypeScript, augment the
   * > {@linkcode Data} interface.
   *
   * @example
   *   This example show how to get and set info:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   const processor = unified().data('alpha', 'bravo')
   *
   *   processor.data('alpha') // => 'bravo'
   *
   *   processor.data() // => {alpha: 'bravo'}
   *
   *   processor.data({charlie: 'delta'})
   *
   *   processor.data() // => {charlie: 'delta'}
   *   ```
   *
   * @template {keyof Data} Key
   *
   * @overload
   * @returns {Data}
   *
   * @overload
   * @param {Data} dataset
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Key} key
   * @returns {Data[Key]}
   *
   * @overload
   * @param {Key} key
   * @param {Data[Key]} value
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @param {Data | Key} [key]
   *   Key to get or set, or entire dataset to set, or nothing to get the
   *   entire dataset (optional).
   * @param {Data[Key]} [value]
   *   Value to set (optional).
   * @returns {unknown}
   *   The current processor when setting, the value at `key` when getting, or
   *   the entire dataset when getting without key.
   */
  data(t, n) {
    return typeof t == "string" ? arguments.length === 2 ? (Go("data", this.frozen), this.namespace[t] = n, this) : AC.call(this.namespace, t) && this.namespace[t] || void 0 : t ? (Go("data", this.frozen), this.namespace = t, this) : this.namespace;
  }
  /**
   * Freeze a processor.
   *
   * Frozen processors are meant to be extended and not to be configured
   * directly.
   *
   * When a processor is frozen it cannot be unfrozen.
   * New processors working the same way can be created by calling the
   * processor.
   *
   * It’s possible to freeze processors explicitly by calling `.freeze()`.
   * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
   * `.stringify()`, `.process()`, or `.processSync()` are called.
   *
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   The current processor.
   */
  freeze() {
    if (this.frozen)
      return this;
    const t = (
      /** @type {Processor} */
      /** @type {unknown} */
      this
    );
    for (; ++this.freezeIndex < this.attachers.length; ) {
      const [n, ...r] = this.attachers[this.freezeIndex];
      if (r[0] === !1)
        continue;
      r[0] === !0 && (r[0] = void 0);
      const i = n.call(t, ...r);
      typeof i == "function" && this.transformers.use(i);
    }
    return this.frozen = !0, this.freezeIndex = Number.POSITIVE_INFINITY, this;
  }
  /**
   * Parse text to a syntax tree.
   *
   * > **Note**: `parse` freezes the processor if not already *frozen*.
   *
   * > **Note**: `parse` performs the parse phase, not the run phase or other
   * > phases.
   *
   * @param {Compatible | undefined} [file]
   *   file to parse (optional); typically `string` or `VFile`; any value
   *   accepted as `x` in `new VFile(x)`.
   * @returns {ParseTree extends undefined ? Node : ParseTree}
   *   Syntax tree representing `file`.
   */
  parse(t) {
    this.freeze();
    const n = ni(t), r = this.parser || this.Parser;
    return qo("parse", r), r(String(n), n);
  }
  /**
   * Process the given file as configured on the processor.
   *
   * > **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @overload
   * @param {Compatible | undefined} file
   * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
   * @returns {undefined}
   *
   * @overload
   * @param {Compatible | undefined} [file]
   * @returns {Promise<VFileWithOutput<CompileResult>>}
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`]; any value accepted as
   *   `x` in `new VFile(x)`.
   * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
   *   Callback (optional).
   * @returns {Promise<VFile> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise a promise, rejected with a fatal error or resolved with the
   *   processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  process(t, n) {
    const r = this;
    return this.freeze(), qo("process", this.parser || this.Parser), Ko("process", this.compiler || this.Compiler), n ? i(void 0, n) : new Promise(i);
    function i(o, s) {
      const a = ni(t), l = (
        /** @type {HeadTree extends undefined ? Node : HeadTree} */
        /** @type {unknown} */
        r.parse(a)
      );
      r.run(l, a, function(u, d, h) {
        if (u || !d || !h)
          return c(u);
        const f = (
          /** @type {CompileTree extends undefined ? Node : CompileTree} */
          /** @type {unknown} */
          d
        ), m = r.stringify(f, h);
        IC(m) ? h.value = m : h.result = m, c(
          u,
          /** @type {VFileWithOutput<CompileResult>} */
          h
        );
      });
      function c(u, d) {
        u || !d ? s(u) : o ? o(d) : n(void 0, d);
      }
    }
  }
  /**
   * Process the given file as configured on the processor.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `processSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `processSync` performs the parse, run, and stringify phases.
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`; any value accepted as
   *   `x` in `new VFile(x)`.
   * @returns {VFileWithOutput<CompileResult>}
   *   The processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  processSync(t) {
    let n = !1, r;
    return this.freeze(), qo("processSync", this.parser || this.Parser), Ko("processSync", this.compiler || this.Compiler), this.process(t, i), Cu("processSync", "process", n), r;
    function i(o, s) {
      n = !0, xu(o), r = s;
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * > **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > **Note**: `run` performs the run phase, not other phases.
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} file
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} [file]
   * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {(
   *   RunCallback<TailTree extends undefined ? Node : TailTree> |
   *   Compatible
   * )} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
   *   Callback (optional).
   * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise, a promise rejected with a fatal error or resolved with the
   *   transformed tree.
   */
  run(t, n, r) {
    ku(t), this.freeze();
    const i = this.transformers;
    return !r && typeof n == "function" && (r = n, n = void 0), r ? o(void 0, r) : new Promise(o);
    function o(s, a) {
      const l = ni(n);
      i.run(t, l, c);
      function c(u, d, h) {
        const f = (
          /** @type {TailTree extends undefined ? Node : TailTree} */
          d || t
        );
        u ? a(u) : s ? s(f) : r(void 0, f, h);
      }
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `runSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `runSync` performs the run phase, not other phases.
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {TailTree extends undefined ? Node : TailTree}
   *   Transformed tree.
   */
  runSync(t, n) {
    let r = !1, i;
    return this.run(t, n, o), Cu("runSync", "run", r), i;
    function o(s, a) {
      xu(s), i = a, r = !0;
    }
  }
  /**
   * Compile a syntax tree.
   *
   * > **Note**: `stringify` freezes the processor if not already *frozen*.
   *
   * > **Note**: `stringify` performs the stringify phase, not the run phase
   * > or other phases.
   *
   * @param {CompileTree extends undefined ? Node : CompileTree} tree
   *   Tree to compile.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {CompileResult extends undefined ? Value : CompileResult}
   *   Textual representation of the tree (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most compilers
   *   > return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  stringify(t, n) {
    this.freeze();
    const r = ni(n), i = this.compiler || this.Compiler;
    return Ko("stringify", i), ku(t), i(t, r);
  }
  /**
   * Configure the processor to use a plugin, a list of usable values, or a
   * preset.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * > **Note**: `use` cannot be called on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @example
   *   There are many ways to pass plugins to `.use()`.
   *   This example gives an overview:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use(pluginA, {x: true, y: true})
   *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
   *     .use(pluginA, {y: false, z: true})
   *     // Plugins:
   *     .use([pluginB, pluginC])
   *     // Two plugins, the second with options:
   *     .use([pluginD, [pluginE, {}]])
   *     // Preset with plugins and settings:
   *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
   *     // Settings only:
   *     .use({settings: {position: false}})
   *   ```
   *
   * @template {Array<unknown>} [Parameters=[]]
   * @template {Node | string | undefined} [Input=undefined]
   * @template [Output=Input]
   *
   * @overload
   * @param {Preset | null | undefined} [preset]
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {PluggableList} list
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Plugin<Parameters, Input, Output>} plugin
   * @param {...(Parameters | [boolean])} parameters
   * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
   *
   * @param {PluggableList | Plugin | Preset | null | undefined} value
   *   Usable value.
   * @param {...unknown} parameters
   *   Parameters, when a plugin is given as a usable value.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   Current processor.
   */
  use(t, ...n) {
    const r = this.attachers, i = this.namespace;
    if (Go("use", this.frozen), t != null) if (typeof t == "function")
      l(t, n);
    else if (typeof t == "object")
      Array.isArray(t) ? a(t) : s(t);
    else
      throw new TypeError("Expected usable value, not `" + t + "`");
    return this;
    function o(c) {
      if (typeof c == "function")
        l(c, []);
      else if (typeof c == "object")
        if (Array.isArray(c)) {
          const [u, ...d] = (
            /** @type {PluginTuple<Array<unknown>>} */
            c
          );
          l(u, d);
        } else
          s(c);
      else
        throw new TypeError("Expected usable value, not `" + c + "`");
    }
    function s(c) {
      if (!("plugins" in c) && !("settings" in c))
        throw new Error(
          "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
        );
      a(c.plugins), c.settings && (i.settings = $o(!0, i.settings, c.settings));
    }
    function a(c) {
      let u = -1;
      if (c != null) if (Array.isArray(c))
        for (; ++u < c.length; ) {
          const d = c[u];
          o(d);
        }
      else
        throw new TypeError("Expected a list of plugins, not `" + c + "`");
    }
    function l(c, u) {
      let d = -1, h = -1;
      for (; ++d < r.length; )
        if (r[d][0] === c) {
          h = d;
          break;
        }
      if (h === -1)
        r.push([c, ...u]);
      else if (u.length > 0) {
        let [f, ...m] = u;
        const p = r[h][1];
        Ms(p) && Ms(f) && (f = $o(!0, p, f)), r[h] = [c, f, ...m];
      }
    }
  }
}
const RC = new Ya().freeze();
function qo(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function Ko(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function Go(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function ku(e) {
  if (!Ms(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function Cu(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function ni(e) {
  return NC(e) ? e : new ep(e);
}
function NC(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function IC(e) {
  return typeof e == "string" || DC(e);
}
function DC(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const MC = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", Tu = [], Eu = { allowDangerousHtml: !0 }, OC = /^(https?|ircs?|mailto|xmpp)$/i, LC = [
  { from: "astPlugins", id: "remove-buggy-html-in-markdown-parser" },
  { from: "allowDangerousHtml", id: "remove-buggy-html-in-markdown-parser" },
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
    from: "disallowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "disallowedElements"
  },
  { from: "escapeHtml", id: "remove-buggy-html-in-markdown-parser" },
  { from: "includeElementIndex", id: "#remove-includeelementindex" },
  {
    from: "includeNodeIndex",
    id: "change-includenodeindex-to-includeelementindex"
  },
  { from: "linkTarget", id: "remove-linktarget" },
  { from: "plugins", id: "change-plugins-to-remarkplugins", to: "remarkPlugins" },
  { from: "rawSourcePos", id: "#remove-rawsourcepos" },
  { from: "renderers", id: "change-renderers-to-components", to: "components" },
  { from: "source", id: "change-source-to-children", to: "children" },
  { from: "sourcePos", id: "#remove-sourcepos" },
  { from: "transformImageUri", id: "#add-urltransform", to: "urlTransform" },
  { from: "transformLinkUri", id: "#add-urltransform", to: "urlTransform" }
];
function _C(e) {
  const t = FC(e), n = VC(e);
  return BC(t.runSync(t.parse(n), n), e);
}
function FC(e) {
  const t = e.rehypePlugins || Tu, n = e.remarkPlugins || Tu, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...Eu } : Eu;
  return RC().use(yk).use(n).use(dC, r).use(t);
}
function VC(e) {
  const t = e.children || "", n = new ep();
  return typeof t == "string" && (n.value = t), n;
}
function BC(e, t) {
  const n = t.allowedElements, r = t.allowElement, i = t.components, o = t.disallowedElements, s = t.skipHtml, a = t.unwrapDisallowed, l = t.urlTransform || zC;
  for (const u of LC)
    Object.hasOwn(t, u.from) && ("" + u.from + (u.to ? "use `" + u.to + "` instead" : "remove it") + MC + u.id, void 0);
  return t.className && (e = {
    type: "element",
    tagName: "div",
    properties: { className: t.className },
    // Assume no doctypes.
    children: (
      /** @type {Array<ElementContent>} */
      e.type === "root" ? e.children : [e]
    )
  }), Ga(e, c), e1(e, {
    Fragment: Vt,
    // @ts-expect-error
    // React components are allowed to return numbers,
    // but not according to the types in hast-util-to-jsx-runtime
    components: i,
    ignoreInvalidStyle: !0,
    jsx: v,
    jsxs: _,
    passKeys: !0,
    passNode: !0
  });
  function c(u, d, h) {
    if (u.type === "raw" && h && typeof d == "number")
      return s ? h.children.splice(d, 1) : h.children[d] = { type: "text", value: u.value }, d;
    if (u.type === "element") {
      let f;
      for (f in Vo)
        if (Object.hasOwn(Vo, f) && Object.hasOwn(u.properties, f)) {
          const m = u.properties[f], p = Vo[f];
          (p === null || p.includes(u.tagName)) && (u.properties[f] = l(String(m || ""), f, u));
        }
    }
    if (u.type === "element") {
      let f = n ? !n.includes(u.tagName) : o ? o.includes(u.tagName) : !1;
      if (!f && r && typeof d == "number" && (f = !r(u, d, h)), f && h && typeof d == "number")
        return a && u.children ? h.children.splice(d, 1, ...u.children) : h.children.splice(d, 1), d;
    }
  }
}
function zC(e) {
  const t = e.indexOf(":"), n = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    t === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && t > i || n !== -1 && t > n || r !== -1 && t > r || // It is a protocol, it should be allowed.
    OC.test(e.slice(0, t)) ? e : ""
  );
}
function Pu(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
function jC(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function $C(e, t, n) {
  const i = eo((n || {}).ignore || []), o = UC(t);
  let s = -1;
  for (; ++s < o.length; )
    Qh(e, "text", a);
  function a(c, u) {
    let d = -1, h;
    for (; ++d < u.length; ) {
      const f = u[d], m = h ? h.children : void 0;
      if (i(
        f,
        m ? m.indexOf(f) : void 0,
        h
      ))
        return;
      h = f;
    }
    if (h)
      return l(c, u);
  }
  function l(c, u) {
    const d = u[u.length - 1], h = o[s][0], f = o[s][1];
    let m = 0;
    const y = d.children.indexOf(c);
    let g = !1, x = [];
    h.lastIndex = 0;
    let w = h.exec(c.value);
    for (; w; ) {
      const P = w.index, E = {
        index: w.index,
        input: w.input,
        stack: [...u, c]
      };
      let C = f(...w, E);
      if (typeof C == "string" && (C = C.length > 0 ? { type: "text", value: C } : void 0), C === !1 ? h.lastIndex = P + 1 : (m !== P && x.push({
        type: "text",
        value: c.value.slice(m, P)
      }), Array.isArray(C) ? x.push(...C) : C && x.push(C), m = P + w[0].length, g = !0), !h.global)
        break;
      w = h.exec(c.value);
    }
    return g ? (m < c.value.length && x.push({ type: "text", value: c.value.slice(m) }), d.children.splice(y, 1, ...x)) : x = [c], y + x.length;
  }
}
function UC(e) {
  const t = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const n = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    t.push([HC(i[0]), WC(i[1])]);
  }
  return t;
}
function HC(e) {
  return typeof e == "string" ? new RegExp(jC(e), "g") : e;
}
function WC(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const Yo = "phrasing", Xo = ["autolink", "link", "image", "label"];
function qC() {
  return {
    transforms: [QC],
    enter: {
      literalAutolink: GC,
      literalAutolinkEmail: Zo,
      literalAutolinkHttp: Zo,
      literalAutolinkWww: Zo
    },
    exit: {
      literalAutolink: JC,
      literalAutolinkEmail: ZC,
      literalAutolinkHttp: YC,
      literalAutolinkWww: XC
    }
  };
}
function KC() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: Yo,
        notInConstruct: Xo
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: Yo,
        notInConstruct: Xo
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: Yo,
        notInConstruct: Xo
      }
    ]
  };
}
function GC(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function Zo(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function YC(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function XC(e) {
  this.config.exit.data.call(this, e);
  const t = this.stack[this.stack.length - 1];
  t.type, t.url = "http://" + this.sliceSerialize(e);
}
function ZC(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function JC(e) {
  this.exit(e);
}
function QC(e) {
  $C(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, eT],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), tT]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function eT(e, t, n, r, i) {
  let o = "";
  if (!tp(i) || (/^w/i.test(t) && (n = t + n, t = "", o = "http://"), !nT(n)))
    return !1;
  const s = rT(n + r);
  if (!s[0]) return !1;
  const a = {
    type: "link",
    title: null,
    url: o + t + s[0],
    children: [{ type: "text", value: t + s[0] }]
  };
  return s[1] ? [a, { type: "text", value: s[1] }] : a;
}
function tT(e, t, n, r) {
  return (
    // Not an expected previous character.
    !tp(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(n) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + t + "@" + n,
      children: [{ type: "text", value: t + "@" + n }]
    }
  );
}
function nT(e) {
  const t = e.split(".");
  return !(t.length < 2 || t[t.length - 1] && (/_/.test(t[t.length - 1]) || !/[a-zA-Z\d]/.test(t[t.length - 1])) || t[t.length - 2] && (/_/.test(t[t.length - 2]) || !/[a-zA-Z\d]/.test(t[t.length - 2])));
}
function rT(e) {
  const t = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!t)
    return [e, void 0];
  e = e.slice(0, t.index);
  let n = t[0], r = n.indexOf(")");
  const i = Pu(e, "(");
  let o = Pu(e, ")");
  for (; r !== -1 && i > o; )
    e += n.slice(0, r + 1), n = n.slice(r + 1), r = n.indexOf(")"), o++;
  return [e, n];
}
function tp(e, t) {
  const n = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || Sn(n) || Zi(n)) && // If it’s an email, the previous character should not be a slash.
  (!t || n !== 47);
}
np.peek = fT;
function iT() {
  this.buffer();
}
function oT(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function sT() {
  this.buffer();
}
function aT(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function lT(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = wt(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function cT(e) {
  this.exit(e);
}
function uT(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = wt(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function dT(e) {
  this.exit(e);
}
function fT() {
  return "[";
}
function np(e, t, n, r) {
  const i = n.createTracker(r);
  let o = i.move("[^");
  const s = n.enter("footnoteReference"), a = n.enter("reference");
  return o += i.move(
    n.safe(n.associationId(e), { after: "]", before: o })
  ), a(), s(), o += i.move("]"), o;
}
function hT() {
  return {
    enter: {
      gfmFootnoteCallString: iT,
      gfmFootnoteCall: oT,
      gfmFootnoteDefinitionLabelString: sT,
      gfmFootnoteDefinition: aT
    },
    exit: {
      gfmFootnoteCallString: lT,
      gfmFootnoteCall: cT,
      gfmFootnoteDefinitionLabelString: uT,
      gfmFootnoteDefinition: dT
    }
  };
}
function pT(e) {
  let t = !1;
  return e && e.firstLineBlank && (t = !0), {
    handlers: { footnoteDefinition: n, footnoteReference: np },
    // This is on by default already.
    unsafe: [{ character: "[", inConstruct: ["label", "phrasing", "reference"] }]
  };
  function n(r, i, o, s) {
    const a = o.createTracker(s);
    let l = a.move("[^");
    const c = o.enter("footnoteDefinition"), u = o.enter("label");
    return l += a.move(
      o.safe(o.associationId(r), { before: l, after: "]" })
    ), u(), l += a.move("]:"), r.children && r.children.length > 0 && (a.shift(4), l += a.move(
      (t ? `
` : " ") + o.indentLines(
        o.containerFlow(r, a.current()),
        t ? rp : mT
      )
    )), c(), l;
  }
}
function mT(e, t, n) {
  return t === 0 ? e : rp(e, t, n);
}
function rp(e, t, n) {
  return (n ? "" : "    ") + e;
}
const gT = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
ip.peek = wT;
function yT() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: bT },
    exit: { strikethrough: xT }
  };
}
function vT() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: gT
      }
    ],
    handlers: { delete: ip }
  };
}
function bT(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function xT(e) {
  this.exit(e);
}
function ip(e, t, n, r) {
  const i = n.createTracker(r), o = n.enter("strikethrough");
  let s = i.move("~~");
  return s += n.containerPhrasing(e, {
    ...i.current(),
    before: s,
    after: "~"
  }), s += i.move("~~"), o(), s;
}
function wT() {
  return "~";
}
function ST(e) {
  return e.length;
}
function kT(e, t) {
  const n = t || {}, r = (n.align || []).concat(), i = n.stringLength || ST, o = [], s = [], a = [], l = [];
  let c = 0, u = -1;
  for (; ++u < e.length; ) {
    const p = [], y = [];
    let g = -1;
    for (e[u].length > c && (c = e[u].length); ++g < e[u].length; ) {
      const x = CT(e[u][g]);
      if (n.alignDelimiters !== !1) {
        const w = i(x);
        y[g] = w, (l[g] === void 0 || w > l[g]) && (l[g] = w);
      }
      p.push(x);
    }
    s[u] = p, a[u] = y;
  }
  let d = -1;
  if (typeof r == "object" && "length" in r)
    for (; ++d < c; )
      o[d] = Au(r[d]);
  else {
    const p = Au(r);
    for (; ++d < c; )
      o[d] = p;
  }
  d = -1;
  const h = [], f = [];
  for (; ++d < c; ) {
    const p = o[d];
    let y = "", g = "";
    p === 99 ? (y = ":", g = ":") : p === 108 ? y = ":" : p === 114 && (g = ":");
    let x = n.alignDelimiters === !1 ? 1 : Math.max(
      1,
      l[d] - y.length - g.length
    );
    const w = y + "-".repeat(x) + g;
    n.alignDelimiters !== !1 && (x = y.length + x + g.length, x > l[d] && (l[d] = x), f[d] = x), h[d] = w;
  }
  s.splice(1, 0, h), a.splice(1, 0, f), u = -1;
  const m = [];
  for (; ++u < s.length; ) {
    const p = s[u], y = a[u];
    d = -1;
    const g = [];
    for (; ++d < c; ) {
      const x = p[d] || "";
      let w = "", P = "";
      if (n.alignDelimiters !== !1) {
        const E = l[d] - (y[d] || 0), C = o[d];
        C === 114 ? w = " ".repeat(E) : C === 99 ? E % 2 ? (w = " ".repeat(E / 2 + 0.5), P = " ".repeat(E / 2 - 0.5)) : (w = " ".repeat(E / 2), P = w) : P = " ".repeat(E);
      }
      n.delimiterStart !== !1 && !d && g.push("|"), n.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(n.alignDelimiters === !1 && x === "") && (n.delimiterStart !== !1 || d) && g.push(" "), n.alignDelimiters !== !1 && g.push(w), g.push(x), n.alignDelimiters !== !1 && g.push(P), n.padding !== !1 && g.push(" "), (n.delimiterEnd !== !1 || d !== c - 1) && g.push("|");
    }
    m.push(
      n.delimiterEnd === !1 ? g.join("").replace(/ +$/, "") : g.join("")
    );
  }
  return m.join(`
`);
}
function CT(e) {
  return e == null ? "" : String(e);
}
function Au(e) {
  const t = typeof e == "string" ? e.codePointAt(0) : 0;
  return t === 67 || t === 99 ? 99 : t === 76 || t === 108 ? 108 : t === 82 || t === 114 ? 114 : 0;
}
function TT(e, t, n, r) {
  const i = n.enter("blockquote"), o = n.createTracker(r);
  o.move("> "), o.shift(2);
  const s = n.indentLines(
    n.containerFlow(e, o.current()),
    ET
  );
  return i(), s;
}
function ET(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function PT(e, t) {
  return Ru(e, t.inConstruct, !0) && !Ru(e, t.notInConstruct, !1);
}
function Ru(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function Nu(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && PT(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function AT(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, o = 0, s = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++o > s && (s = o) : o = 1, i = r + t.length, r = n.indexOf(t, i);
  return s;
}
function RT(e, t) {
  return !!(t.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function NT(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function IT(e, t, n, r) {
  const i = NT(n), o = e.value || "", s = i === "`" ? "GraveAccent" : "Tilde";
  if (RT(e, n)) {
    const d = n.enter("codeIndented"), h = n.indentLines(o, DT);
    return d(), h;
  }
  const a = n.createTracker(r), l = i.repeat(Math.max(AT(o, i) + 1, 3)), c = n.enter("codeFenced");
  let u = a.move(l);
  if (e.lang) {
    const d = n.enter(`codeFencedLang${s}`);
    u += a.move(
      n.safe(e.lang, {
        before: u,
        after: " ",
        encode: ["`"],
        ...a.current()
      })
    ), d();
  }
  if (e.lang && e.meta) {
    const d = n.enter(`codeFencedMeta${s}`);
    u += a.move(" "), u += a.move(
      n.safe(e.meta, {
        before: u,
        after: `
`,
        encode: ["`"],
        ...a.current()
      })
    ), d();
  }
  return u += a.move(`
`), o && (u += a.move(o + `
`)), u += a.move(l), c(), u;
}
function DT(e, t, n) {
  return (n ? "" : "    ") + e;
}
function Xa(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function MT(e, t, n, r) {
  const i = Xa(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("definition");
  let a = n.enter("label");
  const l = n.createTracker(r);
  let c = l.move("[");
  return c += l.move(
    n.safe(n.associationId(e), {
      before: c,
      after: "]",
      ...l.current()
    })
  ), c += l.move("]: "), a(), // If there’s no url, or…
  !e.url || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (a = n.enter("destinationLiteral"), c += l.move("<"), c += l.move(
    n.safe(e.url, { before: c, after: ">", ...l.current() })
  ), c += l.move(">")) : (a = n.enter("destinationRaw"), c += l.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : `
`,
      ...l.current()
    })
  )), a(), e.title && (a = n.enter(`title${o}`), c += l.move(" " + i), c += l.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...l.current()
    })
  ), c += l.move(i), a()), s(), c;
}
function OT(e) {
  const t = e.options.emphasis || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + t + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return t;
}
function Fr(e) {
  return "&#x" + e.toString(16).toUpperCase() + ";";
}
function Ii(e, t, n) {
  const r = Xn(e), i = Xn(t);
  return r === void 0 ? i === void 0 ? (
    // Letter inside:
    // we have to encode *both* letters for `_` as it is looser.
    // it already forms for `*` (and GFMs `~`).
    n === "_" ? { inside: !0, outside: !0 } : { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (letter, whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: encode outer (letter)
    { inside: !1, outside: !0 }
  ) : r === 1 ? i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode inner (whitespace).
    { inside: !0, outside: !1 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  );
}
op.peek = LT;
function op(e, t, n, r) {
  const i = OT(n), o = n.enter("emphasis"), s = n.createTracker(r), a = s.move(i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = Ii(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Fr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = Ii(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Fr(d));
  const f = s.move(i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function LT(e, t, n) {
  return n.options.emphasis || "*";
}
function _T(e, t) {
  let n = !1;
  return Ga(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, Is;
  }), !!((!e.depth || e.depth < 3) && ja(e) && (t.options.setext || n));
}
function FT(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), o = n.createTracker(r);
  if (_T(e, n)) {
    const u = n.enter("headingSetext"), d = n.enter("phrasing"), h = n.containerPhrasing(e, {
      ...o.current(),
      before: `
`,
      after: `
`
    });
    return d(), u(), h + `
` + (i === 1 ? "=" : "-").repeat(
      // The whole size…
      h.length - // Minus the position of the character after the last EOL (or
      // 0 if there is none)…
      (Math.max(h.lastIndexOf("\r"), h.lastIndexOf(`
`)) + 1)
    );
  }
  const s = "#".repeat(i), a = n.enter("headingAtx"), l = n.enter("phrasing");
  o.move(s + " ");
  let c = n.containerPhrasing(e, {
    before: "# ",
    after: `
`,
    ...o.current()
  });
  return /^[\t ]/.test(c) && (c = Fr(c.charCodeAt(0)) + c.slice(1)), c = c ? s + " " + c : s, n.options.closeAtx && (c += " " + s), l(), a(), c;
}
sp.peek = VT;
function sp(e) {
  return e.value || "";
}
function VT() {
  return "<";
}
ap.peek = BT;
function ap(e, t, n, r) {
  const i = Xa(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("image");
  let a = n.enter("label");
  const l = n.createTracker(r);
  let c = l.move("![");
  return c += l.move(
    n.safe(e.alt, { before: c, after: "]", ...l.current() })
  ), c += l.move("]("), a(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (a = n.enter("destinationLiteral"), c += l.move("<"), c += l.move(
    n.safe(e.url, { before: c, after: ">", ...l.current() })
  ), c += l.move(">")) : (a = n.enter("destinationRaw"), c += l.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...l.current()
    })
  )), a(), e.title && (a = n.enter(`title${o}`), c += l.move(" " + i), c += l.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...l.current()
    })
  ), c += l.move(i), a()), c += l.move(")"), s(), c;
}
function BT() {
  return "!";
}
lp.peek = zT;
function lp(e, t, n, r) {
  const i = e.referenceType, o = n.enter("imageReference");
  let s = n.enter("label");
  const a = n.createTracker(r);
  let l = a.move("![");
  const c = n.safe(e.alt, {
    before: l,
    after: "]",
    ...a.current()
  });
  l += a.move(c + "]["), s();
  const u = n.stack;
  n.stack = [], s = n.enter("reference");
  const d = n.safe(n.associationId(e), {
    before: l,
    after: "]",
    ...a.current()
  });
  return s(), n.stack = u, o(), i === "full" || !c || c !== d ? l += a.move(d + "]") : i === "shortcut" ? l = l.slice(0, -1) : l += a.move("]"), l;
}
function zT() {
  return "!";
}
cp.peek = jT;
function cp(e, t, n) {
  let r = e.value || "", i = "`", o = -1;
  for (; new RegExp("(^|[^`])" + i + "([^`]|$)").test(r); )
    i += "`";
  for (/[^ \r\n]/.test(r) && (/^[ \r\n]/.test(r) && /[ \r\n]$/.test(r) || /^`|`$/.test(r)) && (r = " " + r + " "); ++o < n.unsafe.length; ) {
    const s = n.unsafe[o], a = n.compilePattern(s);
    let l;
    if (s.atBreak)
      for (; l = a.exec(r); ) {
        let c = l.index;
        r.charCodeAt(c) === 10 && r.charCodeAt(c - 1) === 13 && c--, r = r.slice(0, c) + " " + r.slice(l.index + 1);
      }
  }
  return i + r + i;
}
function jT() {
  return "`";
}
function up(e, t) {
  const n = ja(e);
  return !!(!t.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
dp.peek = $T;
function dp(e, t, n, r) {
  const i = Xa(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.createTracker(r);
  let a, l;
  if (up(e, n)) {
    const u = n.stack;
    n.stack = [], a = n.enter("autolink");
    let d = s.move("<");
    return d += s.move(
      n.containerPhrasing(e, {
        before: d,
        after: ">",
        ...s.current()
      })
    ), d += s.move(">"), a(), n.stack = u, d;
  }
  a = n.enter("link"), l = n.enter("label");
  let c = s.move("[");
  return c += s.move(
    n.containerPhrasing(e, {
      before: c,
      after: "](",
      ...s.current()
    })
  ), c += s.move("]("), l(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (l = n.enter("destinationLiteral"), c += s.move("<"), c += s.move(
    n.safe(e.url, { before: c, after: ">", ...s.current() })
  ), c += s.move(">")) : (l = n.enter("destinationRaw"), c += s.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...s.current()
    })
  )), l(), e.title && (l = n.enter(`title${o}`), c += s.move(" " + i), c += s.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...s.current()
    })
  ), c += s.move(i), l()), c += s.move(")"), a(), c;
}
function $T(e, t, n) {
  return up(e, n) ? "<" : "[";
}
fp.peek = UT;
function fp(e, t, n, r) {
  const i = e.referenceType, o = n.enter("linkReference");
  let s = n.enter("label");
  const a = n.createTracker(r);
  let l = a.move("[");
  const c = n.containerPhrasing(e, {
    before: l,
    after: "]",
    ...a.current()
  });
  l += a.move(c + "]["), s();
  const u = n.stack;
  n.stack = [], s = n.enter("reference");
  const d = n.safe(n.associationId(e), {
    before: l,
    after: "]",
    ...a.current()
  });
  return s(), n.stack = u, o(), i === "full" || !c || c !== d ? l += a.move(d + "]") : i === "shortcut" ? l = l.slice(0, -1) : l += a.move("]"), l;
}
function UT() {
  return "[";
}
function Za(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function HT(e) {
  const t = Za(e), n = e.options.bulletOther;
  if (!n)
    return t === "*" ? "-" : "*";
  if (n !== "*" && n !== "+" && n !== "-")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bulletOther`, expected `*`, `+`, or `-`"
    );
  if (n === t)
    throw new Error(
      "Expected `bullet` (`" + t + "`) and `bulletOther` (`" + n + "`) to be different"
    );
  return n;
}
function WT(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function hp(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function qT(e, t, n, r) {
  const i = n.enter("list"), o = n.bulletCurrent;
  let s = e.ordered ? WT(n) : Za(n);
  const a = e.ordered ? s === "." ? ")" : "." : HT(n);
  let l = t && n.bulletLastUsed ? s === n.bulletLastUsed : !1;
  if (!e.ordered) {
    const u = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (s === "*" || s === "-") && // Empty first list item:
      u && (!u.children || !u.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (l = !0), hp(n) === s && u
    ) {
      let d = -1;
      for (; ++d < e.children.length; ) {
        const h = e.children[d];
        if (h && h.type === "listItem" && h.children && h.children[0] && h.children[0].type === "thematicBreak") {
          l = !0;
          break;
        }
      }
    }
  }
  l && (s = a), n.bulletCurrent = s;
  const c = n.containerFlow(e, r);
  return n.bulletLastUsed = s, n.bulletCurrent = o, i(), c;
}
function KT(e) {
  const t = e.options.listItemIndent || "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function GT(e, t, n, r) {
  const i = KT(n);
  let o = n.bulletCurrent || Za(n);
  t && t.type === "list" && t.ordered && (o = (typeof t.start == "number" && t.start > -1 ? t.start : 1) + (n.options.incrementListMarker === !1 ? 0 : t.children.indexOf(e)) + o);
  let s = o.length + 1;
  (i === "tab" || i === "mixed" && (t && t.type === "list" && t.spread || e.spread)) && (s = Math.ceil(s / 4) * 4);
  const a = n.createTracker(r);
  a.move(o + " ".repeat(s - o.length)), a.shift(s);
  const l = n.enter("listItem"), c = n.indentLines(
    n.containerFlow(e, a.current()),
    u
  );
  return l(), c;
  function u(d, h, f) {
    return h ? (f ? "" : " ".repeat(s)) + d : (f ? o : o + " ".repeat(s - o.length)) + d;
  }
}
function YT(e, t, n, r) {
  const i = n.enter("paragraph"), o = n.enter("phrasing"), s = n.containerPhrasing(e, r);
  return o(), i(), s;
}
const XT = (
  /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
  eo([
    "break",
    "delete",
    "emphasis",
    // To do: next major: removed since footnotes were added to GFM.
    "footnote",
    "footnoteReference",
    "image",
    "imageReference",
    "inlineCode",
    // Enabled by `mdast-util-math`:
    "inlineMath",
    "link",
    "linkReference",
    // Enabled by `mdast-util-mdx`:
    "mdxJsxTextElement",
    // Enabled by `mdast-util-mdx`:
    "mdxTextExpression",
    "strong",
    "text",
    // Enabled by `mdast-util-directive`:
    "textDirective"
  ])
);
function ZT(e, t, n, r) {
  return (e.children.some(function(s) {
    return XT(s);
  }) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function JT(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
pp.peek = QT;
function pp(e, t, n, r) {
  const i = JT(n), o = n.enter("strong"), s = n.createTracker(r), a = s.move(i + i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = Ii(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Fr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = Ii(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Fr(d));
  const f = s.move(i + i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function QT(e, t, n) {
  return n.options.strong || "*";
}
function eE(e, t, n, r) {
  return n.safe(e.value, r);
}
function tE(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function nE(e, t, n) {
  const r = (hp(n) + (n.options.ruleSpaces ? " " : "")).repeat(tE(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const mp = {
  blockquote: TT,
  break: Nu,
  code: IT,
  definition: MT,
  emphasis: op,
  hardBreak: Nu,
  heading: FT,
  html: sp,
  image: ap,
  imageReference: lp,
  inlineCode: cp,
  link: dp,
  linkReference: fp,
  list: qT,
  listItem: GT,
  paragraph: YT,
  root: ZT,
  strong: pp,
  text: eE,
  thematicBreak: nE
};
function rE() {
  return {
    enter: {
      table: iE,
      tableData: Iu,
      tableHeader: Iu,
      tableRow: sE
    },
    exit: {
      codeText: aE,
      table: oE,
      tableData: Jo,
      tableHeader: Jo,
      tableRow: Jo
    }
  };
}
function iE(e) {
  const t = e._align;
  this.enter(
    {
      type: "table",
      align: t.map(function(n) {
        return n === "none" ? null : n;
      }),
      children: []
    },
    e
  ), this.data.inTable = !0;
}
function oE(e) {
  this.exit(e), this.data.inTable = void 0;
}
function sE(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function Jo(e) {
  this.exit(e);
}
function Iu(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function aE(e) {
  let t = this.resume();
  this.data.inTable && (t = t.replace(/\\([\\|])/g, lE));
  const n = this.stack[this.stack.length - 1];
  n.type, n.value = t, this.exit(e);
}
function lE(e, t) {
  return t === "|" ? t : e;
}
function cE(e) {
  const t = e || {}, n = t.tableCellPadding, r = t.tablePipeAlign, i = t.stringLength, o = n ? " " : "|";
  return {
    unsafe: [
      { character: "\r", inConstruct: "tableCell" },
      { character: `
`, inConstruct: "tableCell" },
      // A pipe, when followed by a tab or space (padding), or a dash or colon
      // (unpadded delimiter row), could result in a table.
      { atBreak: !0, character: "|", after: "[	 :-]" },
      // A pipe in a cell must be encoded.
      { character: "|", inConstruct: "tableCell" },
      // A colon must be followed by a dash, in which case it could start a
      // delimiter row.
      { atBreak: !0, character: ":", after: "-" },
      // A delimiter row can also start with a dash, when followed by more
      // dashes, a colon, or a pipe.
      // This is a stricter version than the built in check for lists, thematic
      // breaks, and setex heading underlines though:
      // <https://github.com/syntax-tree/mdast-util-to-markdown/blob/51a2038/lib/unsafe.js#L57>
      { atBreak: !0, character: "-", after: "[:|-]" }
    ],
    handlers: {
      inlineCode: h,
      table: s,
      tableCell: l,
      tableRow: a
    }
  };
  function s(f, m, p, y) {
    return c(u(f, p, y), f.align);
  }
  function a(f, m, p, y) {
    const g = d(f, p, y), x = c([g]);
    return x.slice(0, x.indexOf(`
`));
  }
  function l(f, m, p, y) {
    const g = p.enter("tableCell"), x = p.enter("phrasing"), w = p.containerPhrasing(f, {
      ...y,
      before: o,
      after: o
    });
    return x(), g(), w;
  }
  function c(f, m) {
    return kT(f, {
      align: m,
      // @ts-expect-error: `markdown-table` types should support `null`.
      alignDelimiters: r,
      // @ts-expect-error: `markdown-table` types should support `null`.
      padding: n,
      // @ts-expect-error: `markdown-table` types should support `null`.
      stringLength: i
    });
  }
  function u(f, m, p) {
    const y = f.children;
    let g = -1;
    const x = [], w = m.enter("table");
    for (; ++g < y.length; )
      x[g] = d(y[g], m, p);
    return w(), x;
  }
  function d(f, m, p) {
    const y = f.children;
    let g = -1;
    const x = [], w = m.enter("tableRow");
    for (; ++g < y.length; )
      x[g] = l(y[g], f, m, p);
    return w(), x;
  }
  function h(f, m, p) {
    let y = mp.inlineCode(f, m, p);
    return p.stack.includes("tableCell") && (y = y.replace(/\|/g, "\\$&")), y;
  }
}
function uE() {
  return {
    exit: {
      taskListCheckValueChecked: Du,
      taskListCheckValueUnchecked: Du,
      paragraph: fE
    }
  };
}
function dE() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: hE }
  };
}
function Du(e) {
  const t = this.stack[this.stack.length - 2];
  t.type, t.checked = e.type === "taskListCheckValueChecked";
}
function fE(e) {
  const t = this.stack[this.stack.length - 2];
  if (t && t.type === "listItem" && typeof t.checked == "boolean") {
    const n = this.stack[this.stack.length - 1];
    n.type;
    const r = n.children[0];
    if (r && r.type === "text") {
      const i = t.children;
      let o = -1, s;
      for (; ++o < i.length; ) {
        const a = i[o];
        if (a.type === "paragraph") {
          s = a;
          break;
        }
      }
      s === n && (r.value = r.value.slice(1), r.value.length === 0 ? n.children.shift() : n.position && r.position && typeof r.position.start.offset == "number" && (r.position.start.column++, r.position.start.offset++, n.position.start = Object.assign({}, r.position.start)));
    }
  }
  this.exit(e);
}
function hE(e, t, n, r) {
  const i = e.children[0], o = typeof e.checked == "boolean" && i && i.type === "paragraph", s = "[" + (e.checked ? "x" : " ") + "] ", a = n.createTracker(r);
  o && a.move(s);
  let l = mp.listItem(e, t, n, {
    ...r,
    ...a.current()
  });
  return o && (l = l.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, c)), l;
  function c(u) {
    return u + s;
  }
}
function pE() {
  return [
    qC(),
    hT(),
    yT(),
    rE(),
    uE()
  ];
}
function mE(e) {
  return {
    extensions: [
      KC(),
      pT(e),
      vT(),
      cE(e),
      dE()
    ]
  };
}
const gE = {
  tokenize: SE,
  partial: !0
}, gp = {
  tokenize: kE,
  partial: !0
}, yp = {
  tokenize: CE,
  partial: !0
}, vp = {
  tokenize: TE,
  partial: !0
}, yE = {
  tokenize: EE,
  partial: !0
}, bp = {
  name: "wwwAutolink",
  tokenize: xE,
  previous: wp
}, xp = {
  name: "protocolAutolink",
  tokenize: wE,
  previous: Sp
}, Ut = {
  name: "emailAutolink",
  tokenize: bE,
  previous: kp
}, Ot = {};
function vE() {
  return {
    text: Ot
  };
}
let gn = 48;
for (; gn < 123; )
  Ot[gn] = Ut, gn++, gn === 58 ? gn = 65 : gn === 91 && (gn = 97);
Ot[43] = Ut;
Ot[45] = Ut;
Ot[46] = Ut;
Ot[95] = Ut;
Ot[72] = [Ut, xp];
Ot[104] = [Ut, xp];
Ot[87] = [Ut, bp];
Ot[119] = [Ut, bp];
function bE(e, t, n) {
  const r = this;
  let i, o;
  return s;
  function s(d) {
    return !Ls(d) || !kp.call(r, r.previous) || Ja(r.events) ? n(d) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), a(d));
  }
  function a(d) {
    return Ls(d) ? (e.consume(d), a) : d === 64 ? (e.consume(d), l) : n(d);
  }
  function l(d) {
    return d === 46 ? e.check(yE, u, c)(d) : d === 45 || d === 95 || Ge(d) ? (o = !0, e.consume(d), l) : u(d);
  }
  function c(d) {
    return e.consume(d), i = !0, l;
  }
  function u(d) {
    return o && i && Xe(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), t(d)) : n(d);
  }
}
function xE(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s !== 87 && s !== 119 || !wp.call(r, r.previous) || Ja(r.events) ? n(s) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(gE, e.attempt(gp, e.attempt(yp, o), n), n)(s));
  }
  function o(s) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), t(s);
  }
}
function wE(e, t, n) {
  const r = this;
  let i = "", o = !1;
  return s;
  function s(d) {
    return (d === 72 || d === 104) && Sp.call(r, r.previous) && !Ja(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(d), e.consume(d), a) : n(d);
  }
  function a(d) {
    if (Xe(d) && i.length < 5)
      return i += String.fromCodePoint(d), e.consume(d), a;
    if (d === 58) {
      const h = i.toLowerCase();
      if (h === "http" || h === "https")
        return e.consume(d), l;
    }
    return n(d);
  }
  function l(d) {
    return d === 47 ? (e.consume(d), o ? c : (o = !0, l)) : n(d);
  }
  function c(d) {
    return d === null || Ai(d) || Se(d) || Sn(d) || Zi(d) ? n(d) : e.attempt(gp, e.attempt(yp, u), n)(d);
  }
  function u(d) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), t(d);
  }
}
function SE(e, t, n) {
  let r = 0;
  return i;
  function i(s) {
    return (s === 87 || s === 119) && r < 3 ? (r++, e.consume(s), i) : s === 46 && r === 3 ? (e.consume(s), o) : n(s);
  }
  function o(s) {
    return s === null ? n(s) : t(s);
  }
}
function kE(e, t, n) {
  let r, i, o;
  return s;
  function s(c) {
    return c === 46 || c === 95 ? e.check(vp, l, a)(c) : c === null || Se(c) || Sn(c) || c !== 45 && Zi(c) ? l(c) : (o = !0, e.consume(c), s);
  }
  function a(c) {
    return c === 95 ? r = !0 : (i = r, r = void 0), e.consume(c), s;
  }
  function l(c) {
    return i || r || !o ? n(c) : t(c);
  }
}
function CE(e, t) {
  let n = 0, r = 0;
  return i;
  function i(s) {
    return s === 40 ? (n++, e.consume(s), i) : s === 41 && r < n ? o(s) : s === 33 || s === 34 || s === 38 || s === 39 || s === 41 || s === 42 || s === 44 || s === 46 || s === 58 || s === 59 || s === 60 || s === 63 || s === 93 || s === 95 || s === 126 ? e.check(vp, t, o)(s) : s === null || Se(s) || Sn(s) ? t(s) : (e.consume(s), i);
  }
  function o(s) {
    return s === 41 && r++, e.consume(s), i;
  }
}
function TE(e, t, n) {
  return r;
  function r(a) {
    return a === 33 || a === 34 || a === 39 || a === 41 || a === 42 || a === 44 || a === 46 || a === 58 || a === 59 || a === 63 || a === 95 || a === 126 ? (e.consume(a), r) : a === 38 ? (e.consume(a), o) : a === 93 ? (e.consume(a), i) : (
      // `<` is an end.
      a === 60 || // So is whitespace.
      a === null || Se(a) || Sn(a) ? t(a) : n(a)
    );
  }
  function i(a) {
    return a === null || a === 40 || a === 91 || Se(a) || Sn(a) ? t(a) : r(a);
  }
  function o(a) {
    return Xe(a) ? s(a) : n(a);
  }
  function s(a) {
    return a === 59 ? (e.consume(a), r) : Xe(a) ? (e.consume(a), s) : n(a);
  }
}
function EE(e, t, n) {
  return r;
  function r(o) {
    return e.consume(o), i;
  }
  function i(o) {
    return Ge(o) ? n(o) : t(o);
  }
}
function wp(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || Se(e);
}
function Sp(e) {
  return !Xe(e);
}
function kp(e) {
  return !(e === 47 || Ls(e));
}
function Ls(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || Ge(e);
}
function Ja(e) {
  let t = e.length, n = !1;
  for (; t--; ) {
    const r = e[t][1];
    if ((r.type === "labelLink" || r.type === "labelImage") && !r._balanced) {
      n = !0;
      break;
    }
    if (r._gfmAutolinkLiteralWalkedInto) {
      n = !1;
      break;
    }
  }
  return e.length > 0 && !n && (e[e.length - 1][1]._gfmAutolinkLiteralWalkedInto = !0), n;
}
const PE = {
  tokenize: LE,
  partial: !0
};
function AE() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: DE,
        continuation: {
          tokenize: ME
        },
        exit: OE
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: IE
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: RE,
        resolveTo: NE
      }
    }
  };
}
function RE(e, t, n) {
  const r = this;
  let i = r.events.length;
  const o = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let s;
  for (; i--; ) {
    const l = r.events[i][1];
    if (l.type === "labelImage") {
      s = l;
      break;
    }
    if (l.type === "gfmFootnoteCall" || l.type === "labelLink" || l.type === "label" || l.type === "image" || l.type === "link")
      break;
  }
  return a;
  function a(l) {
    if (!s || !s._balanced)
      return n(l);
    const c = wt(r.sliceSerialize({
      start: s.end,
      end: r.now()
    }));
    return c.codePointAt(0) !== 94 || !o.includes(c.slice(1)) ? n(l) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(l), e.exit("gfmFootnoteCallLabelMarker"), t(l));
  }
}
function NE(e, t) {
  let n = e.length;
  for (; n--; )
    if (e[n][1].type === "labelImage" && e[n][0] === "enter") {
      e[n][1];
      break;
    }
  e[n + 1][1].type = "data", e[n + 3][1].type = "gfmFootnoteCallLabelMarker";
  const r = {
    type: "gfmFootnoteCall",
    start: Object.assign({}, e[n + 3][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  }, i = {
    type: "gfmFootnoteCallMarker",
    start: Object.assign({}, e[n + 3][1].end),
    end: Object.assign({}, e[n + 3][1].end)
  };
  i.end.column++, i.end.offset++, i.end._bufferIndex++;
  const o = {
    type: "gfmFootnoteCallString",
    start: Object.assign({}, i.end),
    end: Object.assign({}, e[e.length - 1][1].start)
  }, s = {
    type: "chunkString",
    contentType: "string",
    start: Object.assign({}, o.start),
    end: Object.assign({}, o.end)
  }, a = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    e[n + 1],
    e[n + 2],
    ["enter", r, t],
    // The `[`
    e[n + 3],
    e[n + 4],
    // The `^`.
    ["enter", i, t],
    ["exit", i, t],
    // Everything in between.
    ["enter", o, t],
    ["enter", s, t],
    ["exit", s, t],
    ["exit", o, t],
    // The ending (`]`, properly parsed and labelled).
    e[e.length - 2],
    e[e.length - 1],
    ["exit", r, t]
  ];
  return e.splice(n, e.length - n + 1, ...a), e;
}
function IE(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o = 0, s;
  return a;
  function a(d) {
    return e.enter("gfmFootnoteCall"), e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), l;
  }
  function l(d) {
    return d !== 94 ? n(d) : (e.enter("gfmFootnoteCallMarker"), e.consume(d), e.exit("gfmFootnoteCallMarker"), e.enter("gfmFootnoteCallString"), e.enter("chunkString").contentType = "string", c);
  }
  function c(d) {
    if (
      // Too long.
      o > 999 || // Closing brace with nothing.
      d === 93 && !s || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      d === null || d === 91 || Se(d)
    )
      return n(d);
    if (d === 93) {
      e.exit("chunkString");
      const h = e.exit("gfmFootnoteCallString");
      return i.includes(wt(r.sliceSerialize(h))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), t) : n(d);
    }
    return Se(d) || (s = !0), o++, e.consume(d), d === 92 ? u : c;
  }
  function u(d) {
    return d === 91 || d === 92 || d === 93 ? (e.consume(d), o++, c) : c(d);
  }
}
function DE(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o, s = 0, a;
  return l;
  function l(m) {
    return e.enter("gfmFootnoteDefinition")._container = !0, e.enter("gfmFootnoteDefinitionLabel"), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionLabelMarker"), c;
  }
  function c(m) {
    return m === 94 ? (e.enter("gfmFootnoteDefinitionMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionMarker"), e.enter("gfmFootnoteDefinitionLabelString"), e.enter("chunkString").contentType = "string", u) : n(m);
  }
  function u(m) {
    if (
      // Too long.
      s > 999 || // Closing brace with nothing.
      m === 93 && !a || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      m === null || m === 91 || Se(m)
    )
      return n(m);
    if (m === 93) {
      e.exit("chunkString");
      const p = e.exit("gfmFootnoteDefinitionLabelString");
      return o = wt(r.sliceSerialize(p)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), h;
    }
    return Se(m) || (a = !0), s++, e.consume(m), m === 92 ? d : u;
  }
  function d(m) {
    return m === 91 || m === 92 || m === 93 ? (e.consume(m), s++, u) : u(m);
  }
  function h(m) {
    return m === 58 ? (e.enter("definitionMarker"), e.consume(m), e.exit("definitionMarker"), i.includes(o) || i.push(o), de(e, f, "gfmFootnoteDefinitionWhitespace")) : n(m);
  }
  function f(m) {
    return t(m);
  }
}
function ME(e, t, n) {
  return e.check(Wr, t, e.attempt(PE, t, n));
}
function OE(e) {
  e.exit("gfmFootnoteDefinition");
}
function LE(e, t, n) {
  const r = this;
  return de(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "gfmFootnoteDefinitionIndent" && s[2].sliceSerialize(s[1], !0).length === 4 ? t(o) : n(o);
  }
}
function _E(e) {
  let n = (e || {}).singleTilde;
  const r = {
    name: "strikethrough",
    tokenize: o,
    resolveAll: i
  };
  return n == null && (n = !0), {
    text: {
      126: r
    },
    insideSpan: {
      null: [r]
    },
    attentionMarkers: {
      null: [126]
    }
  };
  function i(s, a) {
    let l = -1;
    for (; ++l < s.length; )
      if (s[l][0] === "enter" && s[l][1].type === "strikethroughSequenceTemporary" && s[l][1]._close) {
        let c = l;
        for (; c--; )
          if (s[c][0] === "exit" && s[c][1].type === "strikethroughSequenceTemporary" && s[c][1]._open && // If the sizes are the same:
          s[l][1].end.offset - s[l][1].start.offset === s[c][1].end.offset - s[c][1].start.offset) {
            s[l][1].type = "strikethroughSequence", s[c][1].type = "strikethroughSequence";
            const u = {
              type: "strikethrough",
              start: Object.assign({}, s[c][1].start),
              end: Object.assign({}, s[l][1].end)
            }, d = {
              type: "strikethroughText",
              start: Object.assign({}, s[c][1].end),
              end: Object.assign({}, s[l][1].start)
            }, h = [["enter", u, a], ["enter", s[c][1], a], ["exit", s[c][1], a], ["enter", d, a]], f = a.parser.constructs.insideSpan.null;
            f && at(h, h.length, 0, Ji(f, s.slice(c + 1, l), a)), at(h, h.length, 0, [["exit", d, a], ["enter", s[l][1], a], ["exit", s[l][1], a], ["exit", u, a]]), at(s, c - 1, l - c + 3, h), l = c + h.length - 2;
            break;
          }
      }
    for (l = -1; ++l < s.length; )
      s[l][1].type === "strikethroughSequenceTemporary" && (s[l][1].type = "data");
    return s;
  }
  function o(s, a, l) {
    const c = this.previous, u = this.events;
    let d = 0;
    return h;
    function h(m) {
      return c === 126 && u[u.length - 1][1].type !== "characterEscape" ? l(m) : (s.enter("strikethroughSequenceTemporary"), f(m));
    }
    function f(m) {
      const p = Xn(c);
      if (m === 126)
        return d > 1 ? l(m) : (s.consume(m), d++, f);
      if (d < 2 && !n) return l(m);
      const y = s.exit("strikethroughSequenceTemporary"), g = Xn(m);
      return y._open = !g || g === 2 && !!p, y._close = !p || p === 2 && !!g, a(m);
    }
  }
}
class FE {
  /**
   * Create a new edit map.
   */
  constructor() {
    this.map = [];
  }
  /**
   * Create an edit: a remove and/or add at a certain place.
   *
   * @param {number} index
   * @param {number} remove
   * @param {Array<Event>} add
   * @returns {undefined}
   */
  add(t, n, r) {
    VE(this, t, n, r);
  }
  // To do: add this when moving to `micromark`.
  // /**
  //  * Create an edit: but insert `add` before existing additions.
  //  *
  //  * @param {number} index
  //  * @param {number} remove
  //  * @param {Array<Event>} add
  //  * @returns {undefined}
  //  */
  // addBefore(index, remove, add) {
  //   addImplementation(this, index, remove, add, true)
  // }
  /**
   * Done, change the events.
   *
   * @param {Array<Event>} events
   * @returns {undefined}
   */
  consume(t) {
    if (this.map.sort(function(o, s) {
      return o[0] - s[0];
    }), this.map.length === 0)
      return;
    let n = this.map.length;
    const r = [];
    for (; n > 0; )
      n -= 1, r.push(t.slice(this.map[n][0] + this.map[n][1]), this.map[n][2]), t.length = this.map[n][0];
    r.push(t.slice()), t.length = 0;
    let i = r.pop();
    for (; i; ) {
      for (const o of i)
        t.push(o);
      i = r.pop();
    }
    this.map.length = 0;
  }
}
function VE(e, t, n, r) {
  let i = 0;
  if (!(n === 0 && r.length === 0)) {
    for (; i < e.map.length; ) {
      if (e.map[i][0] === t) {
        e.map[i][1] += n, e.map[i][2].push(...r);
        return;
      }
      i += 1;
    }
    e.map.push([t, n, r]);
  }
}
function BE(e, t) {
  let n = !1;
  const r = [];
  for (; t < e.length; ) {
    const i = e[t];
    if (n) {
      if (i[0] === "enter")
        i[1].type === "tableContent" && r.push(e[t + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
      else if (i[1].type === "tableContent") {
        if (e[t - 1][1].type === "tableDelimiterMarker") {
          const o = r.length - 1;
          r[o] = r[o] === "left" ? "center" : "right";
        }
      } else if (i[1].type === "tableDelimiterRow")
        break;
    } else i[0] === "enter" && i[1].type === "tableDelimiterRow" && (n = !0);
    t += 1;
  }
  return r;
}
function zE() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: jE,
        resolveAll: $E
      }
    }
  };
}
function jE(e, t, n) {
  const r = this;
  let i = 0, o = 0, s;
  return a;
  function a(T) {
    let O = r.events.length - 1;
    for (; O > -1; ) {
      const R = r.events[O][1].type;
      if (R === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      R === "linePrefix") O--;
      else break;
    }
    const I = O > -1 ? r.events[O][1].type : null, W = I === "tableHead" || I === "tableRow" ? C : l;
    return W === C && r.parser.lazy[r.now().line] ? n(T) : W(T);
  }
  function l(T) {
    return e.enter("tableHead"), e.enter("tableRow"), c(T);
  }
  function c(T) {
    return T === 124 || (s = !0, o += 1), u(T);
  }
  function u(T) {
    return T === null ? n(T) : K(T) ? o > 1 ? (o = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(T), e.exit("lineEnding"), f) : n(T) : le(T) ? de(e, u, "whitespace")(T) : (o += 1, s && (s = !1, i += 1), T === 124 ? (e.enter("tableCellDivider"), e.consume(T), e.exit("tableCellDivider"), s = !0, u) : (e.enter("data"), d(T)));
  }
  function d(T) {
    return T === null || T === 124 || Se(T) ? (e.exit("data"), u(T)) : (e.consume(T), T === 92 ? h : d);
  }
  function h(T) {
    return T === 92 || T === 124 ? (e.consume(T), d) : d(T);
  }
  function f(T) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? n(T) : (e.enter("tableDelimiterRow"), s = !1, le(T) ? de(e, m, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(T) : m(T));
  }
  function m(T) {
    return T === 45 || T === 58 ? y(T) : T === 124 ? (s = !0, e.enter("tableCellDivider"), e.consume(T), e.exit("tableCellDivider"), p) : E(T);
  }
  function p(T) {
    return le(T) ? de(e, y, "whitespace")(T) : y(T);
  }
  function y(T) {
    return T === 58 ? (o += 1, s = !0, e.enter("tableDelimiterMarker"), e.consume(T), e.exit("tableDelimiterMarker"), g) : T === 45 ? (o += 1, g(T)) : T === null || K(T) ? P(T) : E(T);
  }
  function g(T) {
    return T === 45 ? (e.enter("tableDelimiterFiller"), x(T)) : E(T);
  }
  function x(T) {
    return T === 45 ? (e.consume(T), x) : T === 58 ? (s = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(T), e.exit("tableDelimiterMarker"), w) : (e.exit("tableDelimiterFiller"), w(T));
  }
  function w(T) {
    return le(T) ? de(e, P, "whitespace")(T) : P(T);
  }
  function P(T) {
    return T === 124 ? m(T) : T === null || K(T) ? !s || i !== o ? E(T) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), t(T)) : E(T);
  }
  function E(T) {
    return n(T);
  }
  function C(T) {
    return e.enter("tableRow"), A(T);
  }
  function A(T) {
    return T === 124 ? (e.enter("tableCellDivider"), e.consume(T), e.exit("tableCellDivider"), A) : T === null || K(T) ? (e.exit("tableRow"), t(T)) : le(T) ? de(e, A, "whitespace")(T) : (e.enter("data"), N(T));
  }
  function N(T) {
    return T === null || T === 124 || Se(T) ? (e.exit("data"), A(T)) : (e.consume(T), T === 92 ? L : N);
  }
  function L(T) {
    return T === 92 || T === 124 ? (e.consume(T), N) : N(T);
  }
}
function $E(e, t) {
  let n = -1, r = !0, i = 0, o = [0, 0, 0, 0], s = [0, 0, 0, 0], a = !1, l = 0, c, u, d;
  const h = new FE();
  for (; ++n < e.length; ) {
    const f = e[n], m = f[1];
    f[0] === "enter" ? m.type === "tableHead" ? (a = !1, l !== 0 && (Mu(h, t, l, c, u), u = void 0, l = 0), c = {
      type: "table",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, h.add(n, 0, [["enter", c, t]])) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (r = !0, d = void 0, o = [0, 0, 0, 0], s = [0, n + 1, 0, 0], a && (a = !1, u = {
      type: "tableBody",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, h.add(n, 0, [["enter", u, t]])), i = m.type === "tableDelimiterRow" ? 2 : u ? 3 : 1) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") ? (r = !1, s[2] === 0 && (o[1] !== 0 && (s[0] = s[1], d = ri(h, t, o, i, void 0, d), o = [0, 0, 0, 0]), s[2] = n)) : m.type === "tableCellDivider" && (r ? r = !1 : (o[1] !== 0 && (s[0] = s[1], d = ri(h, t, o, i, void 0, d)), o = s, s = [o[1], n, 0, 0])) : m.type === "tableHead" ? (a = !0, l = n) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (l = n, o[1] !== 0 ? (s[0] = s[1], d = ri(h, t, o, i, n, d)) : s[1] !== 0 && (d = ri(h, t, s, i, n, d)), i = 0) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") && (s[3] = n);
  }
  for (l !== 0 && Mu(h, t, l, c, u), h.consume(t.events), n = -1; ++n < t.events.length; ) {
    const f = t.events[n];
    f[0] === "enter" && f[1].type === "table" && (f[1]._align = BE(t.events, n));
  }
  return e;
}
function ri(e, t, n, r, i, o) {
  const s = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", a = "tableContent";
  n[0] !== 0 && (o.end = Object.assign({}, Fn(t.events, n[0])), e.add(n[0], 0, [["exit", o, t]]));
  const l = Fn(t.events, n[1]);
  if (o = {
    type: s,
    start: Object.assign({}, l),
    // Note: correct end is set later.
    end: Object.assign({}, l)
  }, e.add(n[1], 0, [["enter", o, t]]), n[2] !== 0) {
    const c = Fn(t.events, n[2]), u = Fn(t.events, n[3]), d = {
      type: a,
      start: Object.assign({}, c),
      end: Object.assign({}, u)
    };
    if (e.add(n[2], 0, [["enter", d, t]]), r !== 2) {
      const h = t.events[n[2]], f = t.events[n[3]];
      if (h[1].end = Object.assign({}, f[1].end), h[1].type = "chunkText", h[1].contentType = "text", n[3] > n[2] + 1) {
        const m = n[2] + 1, p = n[3] - n[2] - 1;
        e.add(m, p, []);
      }
    }
    e.add(n[3] + 1, 0, [["exit", d, t]]);
  }
  return i !== void 0 && (o.end = Object.assign({}, Fn(t.events, i)), e.add(i, 0, [["exit", o, t]]), o = void 0), o;
}
function Mu(e, t, n, r, i) {
  const o = [], s = Fn(t.events, n);
  i && (i.end = Object.assign({}, s), o.push(["exit", i, t])), r.end = Object.assign({}, s), o.push(["exit", r, t]), e.add(n + 1, 0, o);
}
function Fn(e, t) {
  const n = e[t], r = n[0] === "enter" ? "start" : "end";
  return n[1][r];
}
const UE = {
  name: "tasklistCheck",
  tokenize: WE
};
function HE() {
  return {
    text: {
      91: UE
    }
  };
}
function WE(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return (
      // Exit if there’s stuff before.
      r.previous !== null || // Exit if not in the first content that is the first child of a list
      // item.
      !r._gfmTasklistFirstContentOfListItem ? n(l) : (e.enter("taskListCheck"), e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), o)
    );
  }
  function o(l) {
    return Se(l) ? (e.enter("taskListCheckValueUnchecked"), e.consume(l), e.exit("taskListCheckValueUnchecked"), s) : l === 88 || l === 120 ? (e.enter("taskListCheckValueChecked"), e.consume(l), e.exit("taskListCheckValueChecked"), s) : n(l);
  }
  function s(l) {
    return l === 93 ? (e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), e.exit("taskListCheck"), a) : n(l);
  }
  function a(l) {
    return K(l) ? t(l) : le(l) ? e.check({
      tokenize: qE
    }, t, n)(l) : n(l);
  }
}
function qE(e, t, n) {
  return de(e, r, "whitespace");
  function r(i) {
    return i === null ? n(i) : t(i);
  }
}
function KE(e) {
  return Oh([
    vE(),
    AE(),
    _E(e),
    zE(),
    HE()
  ]);
}
const GE = {};
function YE(e) {
  const t = (
    /** @type {Processor<Root>} */
    this
  ), n = e || GE, r = t.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), o = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), s = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(KE(n)), o.push(pE()), s.push(mE(n));
}
var XE = (e) => {
  switch (e) {
    case "success":
      return QE;
    case "info":
      return tP;
    case "warning":
      return eP;
    case "error":
      return nP;
    default:
      return null;
  }
}, ZE = Array(12).fill(0), JE = ({ visible: e, className: t }) => V.createElement("div", { className: ["sonner-loading-wrapper", t].filter(Boolean).join(" "), "data-visible": e }, V.createElement("div", { className: "sonner-spinner" }, ZE.map((n, r) => V.createElement("div", { className: "sonner-loading-bar", key: `spinner-bar-${r}` })))), QE = V.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, V.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })), eP = V.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", height: "20", width: "20" }, V.createElement("path", { fillRule: "evenodd", d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z", clipRule: "evenodd" })), tP = V.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, V.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z", clipRule: "evenodd" })), nP = V.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, V.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z", clipRule: "evenodd" })), rP = V.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, V.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), V.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })), iP = () => {
  let [e, t] = V.useState(document.hidden);
  return V.useEffect(() => {
    let n = () => {
      t(document.hidden);
    };
    return document.addEventListener("visibilitychange", n), () => window.removeEventListener("visibilitychange", n);
  }, []), e;
}, _s = 1, oP = class {
  constructor() {
    this.subscribe = (e) => (this.subscribers.push(e), () => {
      let t = this.subscribers.indexOf(e);
      this.subscribers.splice(t, 1);
    }), this.publish = (e) => {
      this.subscribers.forEach((t) => t(e));
    }, this.addToast = (e) => {
      this.publish(e), this.toasts = [...this.toasts, e];
    }, this.create = (e) => {
      var t;
      let { message: n, ...r } = e, i = typeof e?.id == "number" || ((t = e.id) == null ? void 0 : t.length) > 0 ? e.id : _s++, o = this.toasts.find((a) => a.id === i), s = e.dismissible === void 0 ? !0 : e.dismissible;
      return this.dismissedToasts.has(i) && this.dismissedToasts.delete(i), o ? this.toasts = this.toasts.map((a) => a.id === i ? (this.publish({ ...a, ...e, id: i, title: n }), { ...a, ...e, id: i, dismissible: s, title: n }) : a) : this.addToast({ title: n, ...r, dismissible: s, id: i }), i;
    }, this.dismiss = (e) => (this.dismissedToasts.add(e), e || this.toasts.forEach((t) => {
      this.subscribers.forEach((n) => n({ id: t.id, dismiss: !0 }));
    }), this.subscribers.forEach((t) => t({ id: e, dismiss: !0 })), e), this.message = (e, t) => this.create({ ...t, message: e }), this.error = (e, t) => this.create({ ...t, message: e, type: "error" }), this.success = (e, t) => this.create({ ...t, type: "success", message: e }), this.info = (e, t) => this.create({ ...t, type: "info", message: e }), this.warning = (e, t) => this.create({ ...t, type: "warning", message: e }), this.loading = (e, t) => this.create({ ...t, type: "loading", message: e }), this.promise = (e, t) => {
      if (!t) return;
      let n;
      t.loading !== void 0 && (n = this.create({ ...t, promise: e, type: "loading", message: t.loading, description: typeof t.description != "function" ? t.description : void 0 }));
      let r = e instanceof Promise ? e : e(), i = n !== void 0, o, s = r.then(async (l) => {
        if (o = ["resolve", l], V.isValidElement(l)) i = !1, this.create({ id: n, type: "default", message: l });
        else if (aP(l) && !l.ok) {
          i = !1;
          let c = typeof t.error == "function" ? await t.error(`HTTP error! status: ${l.status}`) : t.error, u = typeof t.description == "function" ? await t.description(`HTTP error! status: ${l.status}`) : t.description;
          this.create({ id: n, type: "error", message: c, description: u });
        } else if (t.success !== void 0) {
          i = !1;
          let c = typeof t.success == "function" ? await t.success(l) : t.success, u = typeof t.description == "function" ? await t.description(l) : t.description;
          this.create({ id: n, type: "success", message: c, description: u });
        }
      }).catch(async (l) => {
        if (o = ["reject", l], t.error !== void 0) {
          i = !1;
          let c = typeof t.error == "function" ? await t.error(l) : t.error, u = typeof t.description == "function" ? await t.description(l) : t.description;
          this.create({ id: n, type: "error", message: c, description: u });
        }
      }).finally(() => {
        var l;
        i && (this.dismiss(n), n = void 0), (l = t.finally) == null || l.call(t);
      }), a = () => new Promise((l, c) => s.then(() => o[0] === "reject" ? c(o[1]) : l(o[1])).catch(c));
      return typeof n != "string" && typeof n != "number" ? { unwrap: a } : Object.assign(n, { unwrap: a });
    }, this.custom = (e, t) => {
      let n = t?.id || _s++;
      return this.create({ jsx: e(n), id: n, ...t }), n;
    }, this.getActiveToasts = () => this.toasts.filter((e) => !this.dismissedToasts.has(e.id)), this.subscribers = [], this.toasts = [], this.dismissedToasts = /* @__PURE__ */ new Set();
  }
}, Qe = new oP(), sP = (e, t) => {
  let n = t?.id || _s++;
  return Qe.addToast({ title: e, ...t, id: n }), n;
}, aP = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", lP = sP, cP = () => Qe.toasts, uP = () => Qe.getActiveToasts(), Ou = Object.assign(lP, { success: Qe.success, info: Qe.info, warning: Qe.warning, error: Qe.error, custom: Qe.custom, message: Qe.message, promise: Qe.promise, dismiss: Qe.dismiss, loading: Qe.loading }, { getHistory: cP, getToasts: uP });
function dP(e, { insertAt: t } = {}) {
  if (typeof document > "u") return;
  let n = document.head || document.getElementsByTagName("head")[0], r = document.createElement("style");
  r.type = "text/css", t === "top" && n.firstChild ? n.insertBefore(r, n.firstChild) : n.appendChild(r), r.styleSheet ? r.styleSheet.cssText = e : r.appendChild(document.createTextNode(e));
}
dP(`:where(html[dir="ltr"]),:where([data-sonner-toaster][dir="ltr"]){--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}:where(html[dir="rtl"]),:where([data-sonner-toaster][dir="rtl"]){--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999;transition:transform .4s ease}:where([data-sonner-toaster][data-lifted="true"]){transform:translateY(-10px)}@media (hover: none) and (pointer: coarse){:where([data-sonner-toaster][data-lifted="true"]){transform:none}}:where([data-sonner-toaster][data-x-position="right"]){right:var(--offset-right)}:where([data-sonner-toaster][data-x-position="left"]){left:var(--offset-left)}:where([data-sonner-toaster][data-x-position="center"]){left:50%;transform:translate(-50%)}:where([data-sonner-toaster][data-y-position="top"]){top:var(--offset-top)}:where([data-sonner-toaster][data-y-position="bottom"]){bottom:var(--offset-bottom)}:where([data-sonner-toast]){--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled="true"]){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast][data-y-position="top"]){top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position="bottom"]){bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise="true"]) :where([data-icon])>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px #0006}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0,0,0,.08)}:where([data-sonner-toast][data-theme="dark"]) :where([data-cancel]){background:rgba(255,255,255,.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]{background:var(--gray1)}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast]) :where([data-disabled="true"]){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping="true"]):before{content:"";position:absolute;left:-50%;right:-50%;height:100%;z-index:-1}:where([data-sonner-toast][data-y-position="top"][data-swiping="true"]):before{bottom:50%;transform:scaleY(3) translateY(50%)}:where([data-sonner-toast][data-y-position="bottom"][data-swiping="true"]):before{top:50%;transform:scaleY(3) translateY(-50%)}:where([data-sonner-toast][data-swiping="false"][data-removed="true"]):before{content:"";position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast]):after{content:"";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted="true"]){--y: translateY(0);opacity:1}:where([data-sonner-toast][data-expanded="false"][data-front="false"]){--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity .4s}:where([data-sonner-toast][data-expanded="false"][data-front="false"][data-styled="true"])>*{opacity:0}:where([data-sonner-toast][data-visible="false"]){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted="true"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where([data-sonner-toast][data-removed="true"][data-front="true"][data-swipe-out="false"]){--y: translateY(calc(var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]){--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}:where([data-sonner-toast][data-removed="true"][data-front="false"]):before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y, 0px)) translate(var(--swipe-amount-x, 0px));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-bg-hover: hsl(0, 0%, 12%);--normal-border: hsl(0, 0%, 20%);--normal-border-hover: hsl(0, 0%, 25%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success],[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info],[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning],[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error],[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
`);
function ii(e) {
  return e.label !== void 0;
}
var fP = 3, hP = "32px", pP = "16px", Lu = 4e3, mP = 356, gP = 14, yP = 20, vP = 200;
function vt(...e) {
  return e.filter(Boolean).join(" ");
}
function bP(e) {
  let [t, n] = e.split("-"), r = [];
  return t && r.push(t), n && r.push(n), r;
}
var xP = (e) => {
  var t, n, r, i, o, s, a, l, c, u, d;
  let { invert: h, toast: f, unstyled: m, interacting: p, setHeights: y, visibleToasts: g, heights: x, index: w, toasts: P, expanded: E, removeToast: C, defaultRichColors: A, closeButton: N, style: L, cancelButtonStyle: T, actionButtonStyle: O, className: I = "", descriptionClassName: W = "", duration: R, position: M, gap: B, loadingIcon: z, expandByDefault: $, classNames: U, icons: S, closeButtonAriaLabel: oe = "Close toast", pauseWhenPageIsHidden: X } = e, [k, G] = V.useState(null), [ue, ce] = V.useState(null), [H, re] = V.useState(!1), [fe, ne] = V.useState(!1), [se, q] = V.useState(!1), [Q, we] = V.useState(!1), [Ne, ve] = V.useState(!1), [be, Me] = V.useState(0), [Te, _e] = V.useState(0), Fe = V.useRef(f.duration || R || Lu), Oe = V.useRef(null), ke = V.useRef(null), vo = w === 0, bo = w + 1 <= g, D = f.type, j = f.dismissible !== !1, Z = f.className || "", ae = f.descriptionClassName || "", he = V.useMemo(() => x.findIndex((J) => J.toastId === f.id) || 0, [x, f.id]), rt = V.useMemo(() => {
    var J;
    return (J = f.closeButton) != null ? J : N;
  }, [f.closeButton, N]), Tt = V.useMemo(() => f.duration || R || Lu, [f.duration, R]), it = V.useRef(0), ut = V.useRef(0), Ht = V.useRef(0), Ve = V.useRef(null), [Wt, pt] = M.split("-"), vl = V.useMemo(() => x.reduce((J, xe, Ae) => Ae >= he ? J : J + xe.height, 0), [x, he]), bl = iP(), ug = f.invert || h, xo = D === "loading";
  ut.current = V.useMemo(() => he * B + vl, [he, vl]), V.useEffect(() => {
    Fe.current = Tt;
  }, [Tt]), V.useEffect(() => {
    re(!0);
  }, []), V.useEffect(() => {
    let J = ke.current;
    if (J) {
      let xe = J.getBoundingClientRect().height;
      return _e(xe), y((Ae) => [{ toastId: f.id, height: xe, position: f.position }, ...Ae]), () => y((Ae) => Ae.filter((mt) => mt.toastId !== f.id));
    }
  }, [y, f.id]), V.useLayoutEffect(() => {
    if (!H) return;
    let J = ke.current, xe = J.style.height;
    J.style.height = "auto";
    let Ae = J.getBoundingClientRect().height;
    J.style.height = xe, _e(Ae), y((mt) => mt.find((gt) => gt.toastId === f.id) ? mt.map((gt) => gt.toastId === f.id ? { ...gt, height: Ae } : gt) : [{ toastId: f.id, height: Ae, position: f.position }, ...mt]);
  }, [H, f.title, f.description, y, f.id]);
  let qt = V.useCallback(() => {
    ne(!0), Me(ut.current), y((J) => J.filter((xe) => xe.toastId !== f.id)), setTimeout(() => {
      C(f);
    }, vP);
  }, [f, C, y, ut]);
  V.useEffect(() => {
    if (f.promise && D === "loading" || f.duration === 1 / 0 || f.type === "loading") return;
    let J;
    return E || p || X && bl ? (() => {
      if (Ht.current < it.current) {
        let xe = (/* @__PURE__ */ new Date()).getTime() - it.current;
        Fe.current = Fe.current - xe;
      }
      Ht.current = (/* @__PURE__ */ new Date()).getTime();
    })() : Fe.current !== 1 / 0 && (it.current = (/* @__PURE__ */ new Date()).getTime(), J = setTimeout(() => {
      var xe;
      (xe = f.onAutoClose) == null || xe.call(f, f), qt();
    }, Fe.current)), () => clearTimeout(J);
  }, [E, p, f, D, X, bl, qt]), V.useEffect(() => {
    f.delete && qt();
  }, [qt, f.delete]);
  function dg() {
    var J, xe, Ae;
    return S != null && S.loading ? V.createElement("div", { className: vt(U?.loader, (J = f?.classNames) == null ? void 0 : J.loader, "sonner-loader"), "data-visible": D === "loading" }, S.loading) : z ? V.createElement("div", { className: vt(U?.loader, (xe = f?.classNames) == null ? void 0 : xe.loader, "sonner-loader"), "data-visible": D === "loading" }, z) : V.createElement(JE, { className: vt(U?.loader, (Ae = f?.classNames) == null ? void 0 : Ae.loader), visible: D === "loading" });
  }
  return V.createElement("li", { tabIndex: 0, ref: ke, className: vt(I, Z, U?.toast, (t = f?.classNames) == null ? void 0 : t.toast, U?.default, U?.[D], (n = f?.classNames) == null ? void 0 : n[D]), "data-sonner-toast": "", "data-rich-colors": (r = f.richColors) != null ? r : A, "data-styled": !(f.jsx || f.unstyled || m), "data-mounted": H, "data-promise": !!f.promise, "data-swiped": Ne, "data-removed": fe, "data-visible": bo, "data-y-position": Wt, "data-x-position": pt, "data-index": w, "data-front": vo, "data-swiping": se, "data-dismissible": j, "data-type": D, "data-invert": ug, "data-swipe-out": Q, "data-swipe-direction": ue, "data-expanded": !!(E || $ && H), style: { "--index": w, "--toasts-before": w, "--z-index": P.length - w, "--offset": `${fe ? be : ut.current}px`, "--initial-height": $ ? "auto" : `${Te}px`, ...L, ...f.style }, onDragEnd: () => {
    q(!1), G(null), Ve.current = null;
  }, onPointerDown: (J) => {
    xo || !j || (Oe.current = /* @__PURE__ */ new Date(), Me(ut.current), J.target.setPointerCapture(J.pointerId), J.target.tagName !== "BUTTON" && (q(!0), Ve.current = { x: J.clientX, y: J.clientY }));
  }, onPointerUp: () => {
    var J, xe, Ae, mt;
    if (Q || !j) return;
    Ve.current = null;
    let gt = Number(((J = ke.current) == null ? void 0 : J.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0), Kt = Number(((xe = ke.current) == null ? void 0 : xe.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0), pn = (/* @__PURE__ */ new Date()).getTime() - ((Ae = Oe.current) == null ? void 0 : Ae.getTime()), yt = k === "x" ? gt : Kt, Gt = Math.abs(yt) / pn;
    if (Math.abs(yt) >= yP || Gt > 0.11) {
      Me(ut.current), (mt = f.onDismiss) == null || mt.call(f, f), ce(k === "x" ? gt > 0 ? "right" : "left" : Kt > 0 ? "down" : "up"), qt(), we(!0), ve(!1);
      return;
    }
    q(!1), G(null);
  }, onPointerMove: (J) => {
    var xe, Ae, mt, gt;
    if (!Ve.current || !j || ((xe = window.getSelection()) == null ? void 0 : xe.toString().length) > 0) return;
    let Kt = J.clientY - Ve.current.y, pn = J.clientX - Ve.current.x, yt = (Ae = e.swipeDirections) != null ? Ae : bP(M);
    !k && (Math.abs(pn) > 1 || Math.abs(Kt) > 1) && G(Math.abs(pn) > Math.abs(Kt) ? "x" : "y");
    let Gt = { x: 0, y: 0 };
    k === "y" ? (yt.includes("top") || yt.includes("bottom")) && (yt.includes("top") && Kt < 0 || yt.includes("bottom") && Kt > 0) && (Gt.y = Kt) : k === "x" && (yt.includes("left") || yt.includes("right")) && (yt.includes("left") && pn < 0 || yt.includes("right") && pn > 0) && (Gt.x = pn), (Math.abs(Gt.x) > 0 || Math.abs(Gt.y) > 0) && ve(!0), (mt = ke.current) == null || mt.style.setProperty("--swipe-amount-x", `${Gt.x}px`), (gt = ke.current) == null || gt.style.setProperty("--swipe-amount-y", `${Gt.y}px`);
  } }, rt && !f.jsx ? V.createElement("button", { "aria-label": oe, "data-disabled": xo, "data-close-button": !0, onClick: xo || !j ? () => {
  } : () => {
    var J;
    qt(), (J = f.onDismiss) == null || J.call(f, f);
  }, className: vt(U?.closeButton, (i = f?.classNames) == null ? void 0 : i.closeButton) }, (o = S?.close) != null ? o : rP) : null, f.jsx || di(f.title) ? f.jsx ? f.jsx : typeof f.title == "function" ? f.title() : f.title : V.createElement(V.Fragment, null, D || f.icon || f.promise ? V.createElement("div", { "data-icon": "", className: vt(U?.icon, (s = f?.classNames) == null ? void 0 : s.icon) }, f.promise || f.type === "loading" && !f.icon ? f.icon || dg() : null, f.type !== "loading" ? f.icon || S?.[D] || XE(D) : null) : null, V.createElement("div", { "data-content": "", className: vt(U?.content, (a = f?.classNames) == null ? void 0 : a.content) }, V.createElement("div", { "data-title": "", className: vt(U?.title, (l = f?.classNames) == null ? void 0 : l.title) }, typeof f.title == "function" ? f.title() : f.title), f.description ? V.createElement("div", { "data-description": "", className: vt(W, ae, U?.description, (c = f?.classNames) == null ? void 0 : c.description) }, typeof f.description == "function" ? f.description() : f.description) : null), di(f.cancel) ? f.cancel : f.cancel && ii(f.cancel) ? V.createElement("button", { "data-button": !0, "data-cancel": !0, style: f.cancelButtonStyle || T, onClick: (J) => {
    var xe, Ae;
    ii(f.cancel) && j && ((Ae = (xe = f.cancel).onClick) == null || Ae.call(xe, J), qt());
  }, className: vt(U?.cancelButton, (u = f?.classNames) == null ? void 0 : u.cancelButton) }, f.cancel.label) : null, di(f.action) ? f.action : f.action && ii(f.action) ? V.createElement("button", { "data-button": !0, "data-action": !0, style: f.actionButtonStyle || O, onClick: (J) => {
    var xe, Ae;
    ii(f.action) && ((Ae = (xe = f.action).onClick) == null || Ae.call(xe, J), !J.defaultPrevented && qt());
  }, className: vt(U?.actionButton, (d = f?.classNames) == null ? void 0 : d.actionButton) }, f.action.label) : null));
};
function _u() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  let e = document.documentElement.getAttribute("dir");
  return e === "auto" || !e ? window.getComputedStyle(document.documentElement).direction : e;
}
function wP(e, t) {
  let n = {};
  return [e, t].forEach((r, i) => {
    let o = i === 1, s = o ? "--mobile-offset" : "--offset", a = o ? pP : hP;
    function l(c) {
      ["top", "right", "bottom", "left"].forEach((u) => {
        n[`${s}-${u}`] = typeof c == "number" ? `${c}px` : c;
      });
    }
    typeof r == "number" || typeof r == "string" ? l(r) : typeof r == "object" ? ["top", "right", "bottom", "left"].forEach((c) => {
      r[c] === void 0 ? n[`${s}-${c}`] = a : n[`${s}-${c}`] = typeof r[c] == "number" ? `${r[c]}px` : r[c];
    }) : l(a);
  }), n;
}
Qn(function(e, t) {
  let { invert: n, position: r = "bottom-right", hotkey: i = ["altKey", "KeyT"], expand: o, closeButton: s, className: a, offset: l, mobileOffset: c, theme: u = "light", richColors: d, duration: h, style: f, visibleToasts: m = fP, toastOptions: p, dir: y = _u(), gap: g = gP, loadingIcon: x, icons: w, containerAriaLabel: P = "Notifications", pauseWhenPageIsHidden: E } = e, [C, A] = V.useState([]), N = V.useMemo(() => Array.from(new Set([r].concat(C.filter((X) => X.position).map((X) => X.position)))), [C, r]), [L, T] = V.useState([]), [O, I] = V.useState(!1), [W, R] = V.useState(!1), [M, B] = V.useState(u !== "system" ? u : typeof window < "u" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), z = V.useRef(null), $ = i.join("+").replace(/Key/g, "").replace(/Digit/g, ""), U = V.useRef(null), S = V.useRef(!1), oe = V.useCallback((X) => {
    A((k) => {
      var G;
      return (G = k.find((ue) => ue.id === X.id)) != null && G.delete || Qe.dismiss(X.id), k.filter(({ id: ue }) => ue !== X.id);
    });
  }, []);
  return V.useEffect(() => Qe.subscribe((X) => {
    if (X.dismiss) {
      A((k) => k.map((G) => G.id === X.id ? { ...G, delete: !0 } : G));
      return;
    }
    setTimeout(() => {
      wd.flushSync(() => {
        A((k) => {
          let G = k.findIndex((ue) => ue.id === X.id);
          return G !== -1 ? [...k.slice(0, G), { ...k[G], ...X }, ...k.slice(G + 1)] : [X, ...k];
        });
      });
    });
  }), []), V.useEffect(() => {
    if (u !== "system") {
      B(u);
      return;
    }
    if (u === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? B("dark") : B("light")), typeof window > "u") return;
    let X = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      X.addEventListener("change", ({ matches: k }) => {
        B(k ? "dark" : "light");
      });
    } catch {
      X.addListener(({ matches: G }) => {
        try {
          B(G ? "dark" : "light");
        } catch (ue) {
          console.error(ue);
        }
      });
    }
  }, [u]), V.useEffect(() => {
    C.length <= 1 && I(!1);
  }, [C]), V.useEffect(() => {
    let X = (k) => {
      var G, ue;
      i.every((ce) => k[ce] || k.code === ce) && (I(!0), (G = z.current) == null || G.focus()), k.code === "Escape" && (document.activeElement === z.current || (ue = z.current) != null && ue.contains(document.activeElement)) && I(!1);
    };
    return document.addEventListener("keydown", X), () => document.removeEventListener("keydown", X);
  }, [i]), V.useEffect(() => {
    if (z.current) return () => {
      U.current && (U.current.focus({ preventScroll: !0 }), U.current = null, S.current = !1);
    };
  }, [z.current]), V.createElement("section", { ref: t, "aria-label": `${P} ${$}`, tabIndex: -1, "aria-live": "polite", "aria-relevant": "additions text", "aria-atomic": "false", suppressHydrationWarning: !0 }, N.map((X, k) => {
    var G;
    let [ue, ce] = X.split("-");
    return C.length ? V.createElement("ol", { key: X, dir: y === "auto" ? _u() : y, tabIndex: -1, ref: z, className: a, "data-sonner-toaster": !0, "data-theme": M, "data-y-position": ue, "data-lifted": O && C.length > 1 && !o, "data-x-position": ce, style: { "--front-toast-height": `${((G = L[0]) == null ? void 0 : G.height) || 0}px`, "--width": `${mP}px`, "--gap": `${g}px`, ...f, ...wP(l, c) }, onBlur: (H) => {
      S.current && !H.currentTarget.contains(H.relatedTarget) && (S.current = !1, U.current && (U.current.focus({ preventScroll: !0 }), U.current = null));
    }, onFocus: (H) => {
      H.target instanceof HTMLElement && H.target.dataset.dismissible === "false" || S.current || (S.current = !0, U.current = H.relatedTarget);
    }, onMouseEnter: () => I(!0), onMouseMove: () => I(!0), onMouseLeave: () => {
      W || I(!1);
    }, onDragEnd: () => I(!1), onPointerDown: (H) => {
      H.target instanceof HTMLElement && H.target.dataset.dismissible === "false" || R(!0);
    }, onPointerUp: () => R(!1) }, C.filter((H) => !H.position && k === 0 || H.position === X).map((H, re) => {
      var fe, ne;
      return V.createElement(xP, { key: H.id, icons: w, index: re, toast: H, defaultRichColors: d, duration: (fe = p?.duration) != null ? fe : h, className: p?.className, descriptionClassName: p?.descriptionClassName, invert: n, visibleToasts: m, closeButton: (ne = p?.closeButton) != null ? ne : s, interacting: W, position: X, style: p?.style, unstyled: p?.unstyled, classNames: p?.classNames, cancelButtonStyle: p?.cancelButtonStyle, actionButtonStyle: p?.actionButtonStyle, removeToast: oe, toasts: C.filter((se) => se.position == H.position), heights: L.filter((se) => se.position == H.position), setHeights: T, expandByDefault: o, gap: g, loadingIcon: x, expanded: O, pauseWhenPageIsHidden: E, swipeDirections: e.swipeDirections });
    })) : null;
  }));
});
function SP({
  text: e,
  copyMessage: t = "Copied to clipboard!"
}) {
  const [n, r] = ye(!1), i = ze(null), o = wn(() => {
    navigator.clipboard.writeText(e).then(() => {
      Ou.success(t), r(!0), i.current && (clearTimeout(i.current), i.current = null), i.current = setTimeout(() => {
        r(!1);
      }, 2e3);
    }).catch(() => {
      Ou.error("Failed to copy to clipboard.");
    });
  }, [e, t]);
  return { isCopied: n, handleCopy: o };
}
function Di({ content: e, copyMessage: t }) {
  const { isCopied: n, handleCopy: r } = SP({
    text: e,
    copyMessage: t
  });
  return /* @__PURE__ */ _(
    et,
    {
      variant: "ghost",
      size: "icon",
      className: "relative h-6 w-6",
      "aria-label": "Copy to clipboard",
      onClick: r,
      children: [
        /* @__PURE__ */ v("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ v(
          kd,
          {
            className: ie(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-100" : "scale-0"
            )
          }
        ) }),
        /* @__PURE__ */ v(
          Eg,
          {
            className: ie(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-0" : "scale-100"
            )
          }
        )
      ]
    }
  );
}
function kn(e) {
  const t = b.useRef(e);
  return b.useEffect(() => {
    t.current = e;
  }), b.useMemo(() => (...n) => t.current?.(...n), []);
}
function kP(e, t = globalThis?.document) {
  const n = kn(e);
  b.useEffect(() => {
    const r = (i) => {
      i.key === "Escape" && n(i);
    };
    return t.addEventListener("keydown", r, { capture: !0 }), () => t.removeEventListener("keydown", r, { capture: !0 });
  }, [n, t]);
}
var CP = "DismissableLayer", Fs = "dismissableLayer.update", TP = "dismissableLayer.pointerDownOutside", EP = "dismissableLayer.focusOutside", Fu, Cp = b.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), no = b.forwardRef(
  (e, t) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: i,
      onFocusOutside: o,
      onInteractOutside: s,
      onDismiss: a,
      ...l
    } = e, c = b.useContext(Cp), [u, d] = b.useState(null), h = u?.ownerDocument ?? globalThis?.document, [, f] = b.useState({}), m = Re(t, (A) => d(A)), p = Array.from(c.layers), [y] = [...c.layersWithOutsidePointerEventsDisabled].slice(-1), g = p.indexOf(y), x = u ? p.indexOf(u) : -1, w = c.layersWithOutsidePointerEventsDisabled.size > 0, P = x >= g, E = RP((A) => {
      const N = A.target, L = [...c.branches].some((T) => T.contains(N));
      !P || L || (i?.(A), s?.(A), A.defaultPrevented || a?.());
    }, h), C = NP((A) => {
      const N = A.target;
      [...c.branches].some((T) => T.contains(N)) || (o?.(A), s?.(A), A.defaultPrevented || a?.());
    }, h);
    return kP((A) => {
      x === c.layers.size - 1 && (r?.(A), !A.defaultPrevented && a && (A.preventDefault(), a()));
    }, h), b.useEffect(() => {
      if (u)
        return n && (c.layersWithOutsidePointerEventsDisabled.size === 0 && (Fu = h.body.style.pointerEvents, h.body.style.pointerEvents = "none"), c.layersWithOutsidePointerEventsDisabled.add(u)), c.layers.add(u), Vu(), () => {
          n && c.layersWithOutsidePointerEventsDisabled.size === 1 && (h.body.style.pointerEvents = Fu);
        };
    }, [u, h, n, c]), b.useEffect(() => () => {
      u && (c.layers.delete(u), c.layersWithOutsidePointerEventsDisabled.delete(u), Vu());
    }, [u, c]), b.useEffect(() => {
      const A = () => f({});
      return document.addEventListener(Fs, A), () => document.removeEventListener(Fs, A);
    }, []), /* @__PURE__ */ v(
      me.div,
      {
        ...l,
        ref: m,
        style: {
          pointerEvents: w ? P ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: pe(e.onFocusCapture, C.onFocusCapture),
        onBlurCapture: pe(e.onBlurCapture, C.onBlurCapture),
        onPointerDownCapture: pe(
          e.onPointerDownCapture,
          E.onPointerDownCapture
        )
      }
    );
  }
);
no.displayName = CP;
var PP = "DismissableLayerBranch", AP = b.forwardRef((e, t) => {
  const n = b.useContext(Cp), r = b.useRef(null), i = Re(t, r);
  return b.useEffect(() => {
    const o = r.current;
    if (o)
      return n.branches.add(o), () => {
        n.branches.delete(o);
      };
  }, [n.branches]), /* @__PURE__ */ v(me.div, { ...e, ref: i });
});
AP.displayName = PP;
function RP(e, t = globalThis?.document) {
  const n = kn(e), r = b.useRef(!1), i = b.useRef(() => {
  });
  return b.useEffect(() => {
    const o = (a) => {
      if (a.target && !r.current) {
        let l = function() {
          Tp(
            TP,
            n,
            c,
            { discrete: !0 }
          );
        };
        const c = { originalEvent: a };
        a.pointerType === "touch" ? (t.removeEventListener("click", i.current), i.current = l, t.addEventListener("click", i.current, { once: !0 })) : l();
      } else
        t.removeEventListener("click", i.current);
      r.current = !1;
    }, s = window.setTimeout(() => {
      t.addEventListener("pointerdown", o);
    }, 0);
    return () => {
      window.clearTimeout(s), t.removeEventListener("pointerdown", o), t.removeEventListener("click", i.current);
    };
  }, [t, n]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => r.current = !0
  };
}
function NP(e, t = globalThis?.document) {
  const n = kn(e), r = b.useRef(!1);
  return b.useEffect(() => {
    const i = (o) => {
      o.target && !r.current && Tp(EP, n, { originalEvent: o }, {
        discrete: !1
      });
    };
    return t.addEventListener("focusin", i), () => t.removeEventListener("focusin", i);
  }, [t, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function Vu() {
  const e = new CustomEvent(Fs);
  document.dispatchEvent(e);
}
function Tp(e, t, n, { discrete: r }) {
  const i = n.originalEvent.target, o = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  t && i.addEventListener(e, t, { once: !0 }), r ? h0(i, o) : i.dispatchEvent(o);
}
var Qo = 0;
function Qa() {
  b.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return document.body.insertAdjacentElement("afterbegin", e[0] ?? Bu()), document.body.insertAdjacentElement("beforeend", e[1] ?? Bu()), Qo++, () => {
      Qo === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((t) => t.remove()), Qo--;
    };
  }, []);
}
function Bu() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var es = "focusScope.autoFocusOnMount", ts = "focusScope.autoFocusOnUnmount", zu = { bubbles: !1, cancelable: !0 }, IP = "FocusScope", ro = b.forwardRef((e, t) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: i,
    onUnmountAutoFocus: o,
    ...s
  } = e, [a, l] = b.useState(null), c = kn(i), u = kn(o), d = b.useRef(null), h = Re(t, (p) => l(p)), f = b.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  b.useEffect(() => {
    if (r) {
      let p = function(w) {
        if (f.paused || !a) return;
        const P = w.target;
        a.contains(P) ? d.current = P : en(d.current, { select: !0 });
      }, y = function(w) {
        if (f.paused || !a) return;
        const P = w.relatedTarget;
        P !== null && (a.contains(P) || en(d.current, { select: !0 }));
      }, g = function(w) {
        if (document.activeElement === document.body)
          for (const E of w)
            E.removedNodes.length > 0 && en(a);
      };
      document.addEventListener("focusin", p), document.addEventListener("focusout", y);
      const x = new MutationObserver(g);
      return a && x.observe(a, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", p), document.removeEventListener("focusout", y), x.disconnect();
      };
    }
  }, [r, a, f.paused]), b.useEffect(() => {
    if (a) {
      $u.add(f);
      const p = document.activeElement;
      if (!a.contains(p)) {
        const g = new CustomEvent(es, zu);
        a.addEventListener(es, c), a.dispatchEvent(g), g.defaultPrevented || (DP(FP(Ep(a)), { select: !0 }), document.activeElement === p && en(a));
      }
      return () => {
        a.removeEventListener(es, c), setTimeout(() => {
          const g = new CustomEvent(ts, zu);
          a.addEventListener(ts, u), a.dispatchEvent(g), g.defaultPrevented || en(p ?? document.body, { select: !0 }), a.removeEventListener(ts, u), $u.remove(f);
        }, 0);
      };
    }
  }, [a, c, u, f]);
  const m = b.useCallback(
    (p) => {
      if (!n && !r || f.paused) return;
      const y = p.key === "Tab" && !p.altKey && !p.ctrlKey && !p.metaKey, g = document.activeElement;
      if (y && g) {
        const x = p.currentTarget, [w, P] = MP(x);
        w && P ? !p.shiftKey && g === P ? (p.preventDefault(), n && en(w, { select: !0 })) : p.shiftKey && g === w && (p.preventDefault(), n && en(P, { select: !0 })) : g === x && p.preventDefault();
      }
    },
    [n, r, f.paused]
  );
  return /* @__PURE__ */ v(me.div, { tabIndex: -1, ...s, ref: h, onKeyDown: m });
});
ro.displayName = IP;
function DP(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e)
    if (en(r, { select: t }), document.activeElement !== n) return;
}
function MP(e) {
  const t = Ep(e), n = ju(t, e), r = ju(t.reverse(), e);
  return [n, r];
}
function Ep(e) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const i = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || i ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function ju(e, t) {
  for (const n of e)
    if (!OP(n, { upTo: t })) return n;
}
function OP(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function LP(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function en(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== n && LP(e) && t && e.select();
  }
}
var $u = _P();
function _P() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      t !== n && n?.pause(), e = Uu(e, t), e.unshift(t);
    },
    remove(t) {
      e = Uu(e, t), e[0]?.resume();
    }
  };
}
function Uu(e, t) {
  const n = [...e], r = n.indexOf(t);
  return r !== -1 && n.splice(r, 1), n;
}
function FP(e) {
  return e.filter((t) => t.tagName !== "A");
}
const VP = ["top", "right", "bottom", "left"], an = Math.min, st = Math.max, Mi = Math.round, oi = Math.floor, Dt = (e) => ({
  x: e,
  y: e
}), BP = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, zP = {
  start: "end",
  end: "start"
};
function Vs(e, t, n) {
  return st(e, an(t, n));
}
function jt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function $t(e) {
  return e.split("-")[0];
}
function cr(e) {
  return e.split("-")[1];
}
function el(e) {
  return e === "x" ? "y" : "x";
}
function tl(e) {
  return e === "y" ? "height" : "width";
}
const jP = /* @__PURE__ */ new Set(["top", "bottom"]);
function At(e) {
  return jP.has($t(e)) ? "y" : "x";
}
function nl(e) {
  return el(At(e));
}
function $P(e, t, n) {
  n === void 0 && (n = !1);
  const r = cr(e), i = nl(e), o = tl(i);
  let s = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[o] > t.floating[o] && (s = Oi(s)), [s, Oi(s)];
}
function UP(e) {
  const t = Oi(e);
  return [Bs(e), t, Bs(t)];
}
function Bs(e) {
  return e.replace(/start|end/g, (t) => zP[t]);
}
const Hu = ["left", "right"], Wu = ["right", "left"], HP = ["top", "bottom"], WP = ["bottom", "top"];
function qP(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Wu : Hu : t ? Hu : Wu;
    case "left":
    case "right":
      return t ? HP : WP;
    default:
      return [];
  }
}
function KP(e, t, n, r) {
  const i = cr(e);
  let o = qP($t(e), n === "start", r);
  return i && (o = o.map((s) => s + "-" + i), t && (o = o.concat(o.map(Bs)))), o;
}
function Oi(e) {
  return e.replace(/left|right|bottom|top/g, (t) => BP[t]);
}
function GP(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function Pp(e) {
  return typeof e != "number" ? GP(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Li(e) {
  const {
    x: t,
    y: n,
    width: r,
    height: i
  } = e;
  return {
    width: r,
    height: i,
    top: n,
    left: t,
    right: t + r,
    bottom: n + i,
    x: t,
    y: n
  };
}
function qu(e, t, n) {
  let {
    reference: r,
    floating: i
  } = e;
  const o = At(t), s = nl(t), a = tl(s), l = $t(t), c = o === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, h = r[a] / 2 - i[a] / 2;
  let f;
  switch (l) {
    case "top":
      f = {
        x: u,
        y: r.y - i.height
      };
      break;
    case "bottom":
      f = {
        x: u,
        y: r.y + r.height
      };
      break;
    case "right":
      f = {
        x: r.x + r.width,
        y: d
      };
      break;
    case "left":
      f = {
        x: r.x - i.width,
        y: d
      };
      break;
    default:
      f = {
        x: r.x,
        y: r.y
      };
  }
  switch (cr(t)) {
    case "start":
      f[s] -= h * (n && c ? -1 : 1);
      break;
    case "end":
      f[s] += h * (n && c ? -1 : 1);
      break;
  }
  return f;
}
const YP = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: i = "absolute",
    middleware: o = [],
    platform: s
  } = n, a = o.filter(Boolean), l = await (s.isRTL == null ? void 0 : s.isRTL(t));
  let c = await s.getElementRects({
    reference: e,
    floating: t,
    strategy: i
  }), {
    x: u,
    y: d
  } = qu(c, r, l), h = r, f = {}, m = 0;
  for (let p = 0; p < a.length; p++) {
    const {
      name: y,
      fn: g
    } = a[p], {
      x,
      y: w,
      data: P,
      reset: E
    } = await g({
      x: u,
      y: d,
      initialPlacement: r,
      placement: h,
      strategy: i,
      middlewareData: f,
      rects: c,
      platform: s,
      elements: {
        reference: e,
        floating: t
      }
    });
    u = x ?? u, d = w ?? d, f = {
      ...f,
      [y]: {
        ...f[y],
        ...P
      }
    }, E && m <= 50 && (m++, typeof E == "object" && (E.placement && (h = E.placement), E.rects && (c = E.rects === !0 ? await s.getElementRects({
      reference: e,
      floating: t,
      strategy: i
    }) : E.rects), {
      x: u,
      y: d
    } = qu(c, h, l)), p = -1);
  }
  return {
    x: u,
    y: d,
    placement: h,
    strategy: i,
    middlewareData: f
  };
};
async function Vr(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: r,
    y: i,
    platform: o,
    rects: s,
    elements: a,
    strategy: l
  } = e, {
    boundary: c = "clippingAncestors",
    rootBoundary: u = "viewport",
    elementContext: d = "floating",
    altBoundary: h = !1,
    padding: f = 0
  } = jt(t, e), m = Pp(f), y = a[h ? d === "floating" ? "reference" : "floating" : d], g = Li(await o.getClippingRect({
    element: (n = await (o.isElement == null ? void 0 : o.isElement(y))) == null || n ? y : y.contextElement || await (o.getDocumentElement == null ? void 0 : o.getDocumentElement(a.floating)),
    boundary: c,
    rootBoundary: u,
    strategy: l
  })), x = d === "floating" ? {
    x: r,
    y: i,
    width: s.floating.width,
    height: s.floating.height
  } : s.reference, w = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(a.floating)), P = await (o.isElement == null ? void 0 : o.isElement(w)) ? await (o.getScale == null ? void 0 : o.getScale(w)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, E = Li(o.convertOffsetParentRelativeRectToViewportRelativeRect ? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: a,
    rect: x,
    offsetParent: w,
    strategy: l
  }) : x);
  return {
    top: (g.top - E.top + m.top) / P.y,
    bottom: (E.bottom - g.bottom + m.bottom) / P.y,
    left: (g.left - E.left + m.left) / P.x,
    right: (E.right - g.right + m.right) / P.x
  };
}
const XP = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: r,
      placement: i,
      rects: o,
      platform: s,
      elements: a,
      middlewareData: l
    } = t, {
      element: c,
      padding: u = 0
    } = jt(e, t) || {};
    if (c == null)
      return {};
    const d = Pp(u), h = {
      x: n,
      y: r
    }, f = nl(i), m = tl(f), p = await s.getDimensions(c), y = f === "y", g = y ? "top" : "left", x = y ? "bottom" : "right", w = y ? "clientHeight" : "clientWidth", P = o.reference[m] + o.reference[f] - h[f] - o.floating[m], E = h[f] - o.reference[f], C = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c));
    let A = C ? C[w] : 0;
    (!A || !await (s.isElement == null ? void 0 : s.isElement(C))) && (A = a.floating[w] || o.floating[m]);
    const N = P / 2 - E / 2, L = A / 2 - p[m] / 2 - 1, T = an(d[g], L), O = an(d[x], L), I = T, W = A - p[m] - O, R = A / 2 - p[m] / 2 + N, M = Vs(I, R, W), B = !l.arrow && cr(i) != null && R !== M && o.reference[m] / 2 - (R < I ? T : O) - p[m] / 2 < 0, z = B ? R < I ? R - I : R - W : 0;
    return {
      [f]: h[f] + z,
      data: {
        [f]: M,
        centerOffset: R - M - z,
        ...B && {
          alignmentOffset: z
        }
      },
      reset: B
    };
  }
}), ZP = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: i,
        middlewareData: o,
        rects: s,
        initialPlacement: a,
        platform: l,
        elements: c
      } = t, {
        mainAxis: u = !0,
        crossAxis: d = !0,
        fallbackPlacements: h,
        fallbackStrategy: f = "bestFit",
        fallbackAxisSideDirection: m = "none",
        flipAlignment: p = !0,
        ...y
      } = jt(e, t);
      if ((n = o.arrow) != null && n.alignmentOffset)
        return {};
      const g = $t(i), x = At(a), w = $t(a) === a, P = await (l.isRTL == null ? void 0 : l.isRTL(c.floating)), E = h || (w || !p ? [Oi(a)] : UP(a)), C = m !== "none";
      !h && C && E.push(...KP(a, p, m, P));
      const A = [a, ...E], N = await Vr(t, y), L = [];
      let T = ((r = o.flip) == null ? void 0 : r.overflows) || [];
      if (u && L.push(N[g]), d) {
        const R = $P(i, s, P);
        L.push(N[R[0]], N[R[1]]);
      }
      if (T = [...T, {
        placement: i,
        overflows: L
      }], !L.every((R) => R <= 0)) {
        var O, I;
        const R = (((O = o.flip) == null ? void 0 : O.index) || 0) + 1, M = A[R];
        if (M && (!(d === "alignment" ? x !== At(M) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        T.every(($) => At($.placement) === x ? $.overflows[0] > 0 : !0)))
          return {
            data: {
              index: R,
              overflows: T
            },
            reset: {
              placement: M
            }
          };
        let B = (I = T.filter((z) => z.overflows[0] <= 0).sort((z, $) => z.overflows[1] - $.overflows[1])[0]) == null ? void 0 : I.placement;
        if (!B)
          switch (f) {
            case "bestFit": {
              var W;
              const z = (W = T.filter(($) => {
                if (C) {
                  const U = At($.placement);
                  return U === x || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  U === "y";
                }
                return !0;
              }).map(($) => [$.placement, $.overflows.filter((U) => U > 0).reduce((U, S) => U + S, 0)]).sort(($, U) => $[1] - U[1])[0]) == null ? void 0 : W[0];
              z && (B = z);
              break;
            }
            case "initialPlacement":
              B = a;
              break;
          }
        if (i !== B)
          return {
            reset: {
              placement: B
            }
          };
      }
      return {};
    }
  };
};
function Ku(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Gu(e) {
  return VP.some((t) => e[t] >= 0);
}
const JP = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n
      } = t, {
        strategy: r = "referenceHidden",
        ...i
      } = jt(e, t);
      switch (r) {
        case "referenceHidden": {
          const o = await Vr(t, {
            ...i,
            elementContext: "reference"
          }), s = Ku(o, n.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: Gu(s)
            }
          };
        }
        case "escaped": {
          const o = await Vr(t, {
            ...i,
            altBoundary: !0
          }), s = Ku(o, n.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: Gu(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, Ap = /* @__PURE__ */ new Set(["left", "top"]);
async function QP(e, t) {
  const {
    placement: n,
    platform: r,
    elements: i
  } = e, o = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), s = $t(n), a = cr(n), l = At(n) === "y", c = Ap.has(s) ? -1 : 1, u = o && l ? -1 : 1, d = jt(t, e);
  let {
    mainAxis: h,
    crossAxis: f,
    alignmentAxis: m
  } = typeof d == "number" ? {
    mainAxis: d,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: d.mainAxis || 0,
    crossAxis: d.crossAxis || 0,
    alignmentAxis: d.alignmentAxis
  };
  return a && typeof m == "number" && (f = a === "end" ? m * -1 : m), l ? {
    x: f * u,
    y: h * c
  } : {
    x: h * c,
    y: f * u
  };
}
const eA = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, r;
      const {
        x: i,
        y: o,
        placement: s,
        middlewareData: a
      } = t, l = await QP(t, e);
      return s === ((n = a.offset) == null ? void 0 : n.placement) && (r = a.arrow) != null && r.alignmentOffset ? {} : {
        x: i + l.x,
        y: o + l.y,
        data: {
          ...l,
          placement: s
        }
      };
    }
  };
}, tA = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: r,
        placement: i
      } = t, {
        mainAxis: o = !0,
        crossAxis: s = !1,
        limiter: a = {
          fn: (y) => {
            let {
              x: g,
              y: x
            } = y;
            return {
              x: g,
              y: x
            };
          }
        },
        ...l
      } = jt(e, t), c = {
        x: n,
        y: r
      }, u = await Vr(t, l), d = At($t(i)), h = el(d);
      let f = c[h], m = c[d];
      if (o) {
        const y = h === "y" ? "top" : "left", g = h === "y" ? "bottom" : "right", x = f + u[y], w = f - u[g];
        f = Vs(x, f, w);
      }
      if (s) {
        const y = d === "y" ? "top" : "left", g = d === "y" ? "bottom" : "right", x = m + u[y], w = m - u[g];
        m = Vs(x, m, w);
      }
      const p = a.fn({
        ...t,
        [h]: f,
        [d]: m
      });
      return {
        ...p,
        data: {
          x: p.x - n,
          y: p.y - r,
          enabled: {
            [h]: o,
            [d]: s
          }
        }
      };
    }
  };
}, nA = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(t) {
      const {
        x: n,
        y: r,
        placement: i,
        rects: o,
        middlewareData: s
      } = t, {
        offset: a = 0,
        mainAxis: l = !0,
        crossAxis: c = !0
      } = jt(e, t), u = {
        x: n,
        y: r
      }, d = At(i), h = el(d);
      let f = u[h], m = u[d];
      const p = jt(a, t), y = typeof p == "number" ? {
        mainAxis: p,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...p
      };
      if (l) {
        const w = h === "y" ? "height" : "width", P = o.reference[h] - o.floating[w] + y.mainAxis, E = o.reference[h] + o.reference[w] - y.mainAxis;
        f < P ? f = P : f > E && (f = E);
      }
      if (c) {
        var g, x;
        const w = h === "y" ? "width" : "height", P = Ap.has($t(i)), E = o.reference[d] - o.floating[w] + (P && ((g = s.offset) == null ? void 0 : g[d]) || 0) + (P ? 0 : y.crossAxis), C = o.reference[d] + o.reference[w] + (P ? 0 : ((x = s.offset) == null ? void 0 : x[d]) || 0) - (P ? y.crossAxis : 0);
        m < E ? m = E : m > C && (m = C);
      }
      return {
        [h]: f,
        [d]: m
      };
    }
  };
}, rA = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: i,
        rects: o,
        platform: s,
        elements: a
      } = t, {
        apply: l = () => {
        },
        ...c
      } = jt(e, t), u = await Vr(t, c), d = $t(i), h = cr(i), f = At(i) === "y", {
        width: m,
        height: p
      } = o.floating;
      let y, g;
      d === "top" || d === "bottom" ? (y = d, g = h === (await (s.isRTL == null ? void 0 : s.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (g = d, y = h === "end" ? "top" : "bottom");
      const x = p - u.top - u.bottom, w = m - u.left - u.right, P = an(p - u[y], x), E = an(m - u[g], w), C = !t.middlewareData.shift;
      let A = P, N = E;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (N = w), (r = t.middlewareData.shift) != null && r.enabled.y && (A = x), C && !h) {
        const T = st(u.left, 0), O = st(u.right, 0), I = st(u.top, 0), W = st(u.bottom, 0);
        f ? N = m - 2 * (T !== 0 || O !== 0 ? T + O : st(u.left, u.right)) : A = p - 2 * (I !== 0 || W !== 0 ? I + W : st(u.top, u.bottom));
      }
      await l({
        ...t,
        availableWidth: N,
        availableHeight: A
      });
      const L = await s.getDimensions(a.floating);
      return m !== L.width || p !== L.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function io() {
  return typeof window < "u";
}
function ur(e) {
  return Rp(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function lt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Lt(e) {
  var t;
  return (t = (Rp(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Rp(e) {
  return io() ? e instanceof Node || e instanceof lt(e).Node : !1;
}
function St(e) {
  return io() ? e instanceof Element || e instanceof lt(e).Element : !1;
}
function Mt(e) {
  return io() ? e instanceof HTMLElement || e instanceof lt(e).HTMLElement : !1;
}
function Yu(e) {
  return !io() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof lt(e).ShadowRoot;
}
const iA = /* @__PURE__ */ new Set(["inline", "contents"]);
function Kr(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: i
  } = kt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !iA.has(i);
}
const oA = /* @__PURE__ */ new Set(["table", "td", "th"]);
function sA(e) {
  return oA.has(ur(e));
}
const aA = [":popover-open", ":modal"];
function oo(e) {
  return aA.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
const lA = ["transform", "translate", "scale", "rotate", "perspective"], cA = ["transform", "translate", "scale", "rotate", "perspective", "filter"], uA = ["paint", "layout", "strict", "content"];
function rl(e) {
  const t = il(), n = St(e) ? kt(e) : e;
  return lA.some((r) => n[r] ? n[r] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || cA.some((r) => (n.willChange || "").includes(r)) || uA.some((r) => (n.contain || "").includes(r));
}
function dA(e) {
  let t = ln(e);
  for (; Mt(t) && !Zn(t); ) {
    if (rl(t))
      return t;
    if (oo(t))
      return null;
    t = ln(t);
  }
  return null;
}
function il() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
const fA = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function Zn(e) {
  return fA.has(ur(e));
}
function kt(e) {
  return lt(e).getComputedStyle(e);
}
function so(e) {
  return St(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function ln(e) {
  if (ur(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Yu(e) && e.host || // Fallback.
    Lt(e)
  );
  return Yu(t) ? t.host : t;
}
function Np(e) {
  const t = ln(e);
  return Zn(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Mt(t) && Kr(t) ? t : Np(t);
}
function Br(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const i = Np(e), o = i === ((r = e.ownerDocument) == null ? void 0 : r.body), s = lt(i);
  if (o) {
    const a = zs(s);
    return t.concat(s, s.visualViewport || [], Kr(i) ? i : [], a && n ? Br(a) : []);
  }
  return t.concat(i, Br(i, [], n));
}
function zs(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Ip(e) {
  const t = kt(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const i = Mt(e), o = i ? e.offsetWidth : n, s = i ? e.offsetHeight : r, a = Mi(n) !== o || Mi(r) !== s;
  return a && (n = o, r = s), {
    width: n,
    height: r,
    $: a
  };
}
function ol(e) {
  return St(e) ? e : e.contextElement;
}
function Wn(e) {
  const t = ol(e);
  if (!Mt(t))
    return Dt(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: i,
    $: o
  } = Ip(t);
  let s = (o ? Mi(n.width) : n.width) / r, a = (o ? Mi(n.height) : n.height) / i;
  return (!s || !Number.isFinite(s)) && (s = 1), (!a || !Number.isFinite(a)) && (a = 1), {
    x: s,
    y: a
  };
}
const hA = /* @__PURE__ */ Dt(0);
function Dp(e) {
  const t = lt(e);
  return !il() || !t.visualViewport ? hA : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function pA(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== lt(e) ? !1 : t;
}
function Cn(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const i = e.getBoundingClientRect(), o = ol(e);
  let s = Dt(1);
  t && (r ? St(r) && (s = Wn(r)) : s = Wn(e));
  const a = pA(o, n, r) ? Dp(o) : Dt(0);
  let l = (i.left + a.x) / s.x, c = (i.top + a.y) / s.y, u = i.width / s.x, d = i.height / s.y;
  if (o) {
    const h = lt(o), f = r && St(r) ? lt(r) : r;
    let m = h, p = zs(m);
    for (; p && r && f !== m; ) {
      const y = Wn(p), g = p.getBoundingClientRect(), x = kt(p), w = g.left + (p.clientLeft + parseFloat(x.paddingLeft)) * y.x, P = g.top + (p.clientTop + parseFloat(x.paddingTop)) * y.y;
      l *= y.x, c *= y.y, u *= y.x, d *= y.y, l += w, c += P, m = lt(p), p = zs(m);
    }
  }
  return Li({
    width: u,
    height: d,
    x: l,
    y: c
  });
}
function ao(e, t) {
  const n = so(e).scrollLeft;
  return t ? t.left + n : Cn(Lt(e)).left + n;
}
function Mp(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - ao(e, n), i = n.top + t.scrollTop;
  return {
    x: r,
    y: i
  };
}
function mA(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: i
  } = e;
  const o = i === "fixed", s = Lt(r), a = t ? oo(t.floating) : !1;
  if (r === s || a && o)
    return n;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = Dt(1);
  const u = Dt(0), d = Mt(r);
  if ((d || !d && !o) && ((ur(r) !== "body" || Kr(s)) && (l = so(r)), Mt(r))) {
    const f = Cn(r);
    c = Wn(r), u.x = f.x + r.clientLeft, u.y = f.y + r.clientTop;
  }
  const h = s && !d && !o ? Mp(s, l) : Dt(0);
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - l.scrollLeft * c.x + u.x + h.x,
    y: n.y * c.y - l.scrollTop * c.y + u.y + h.y
  };
}
function gA(e) {
  return Array.from(e.getClientRects());
}
function yA(e) {
  const t = Lt(e), n = so(e), r = e.ownerDocument.body, i = st(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), o = st(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + ao(e);
  const a = -n.scrollTop;
  return kt(r).direction === "rtl" && (s += st(t.clientWidth, r.clientWidth) - i), {
    width: i,
    height: o,
    x: s,
    y: a
  };
}
const Xu = 25;
function vA(e, t) {
  const n = lt(e), r = Lt(e), i = n.visualViewport;
  let o = r.clientWidth, s = r.clientHeight, a = 0, l = 0;
  if (i) {
    o = i.width, s = i.height;
    const u = il();
    (!u || u && t === "fixed") && (a = i.offsetLeft, l = i.offsetTop);
  }
  const c = ao(r);
  if (c <= 0) {
    const u = r.ownerDocument, d = u.body, h = getComputedStyle(d), f = u.compatMode === "CSS1Compat" && parseFloat(h.marginLeft) + parseFloat(h.marginRight) || 0, m = Math.abs(r.clientWidth - d.clientWidth - f);
    m <= Xu && (o -= m);
  } else c <= Xu && (o += c);
  return {
    width: o,
    height: s,
    x: a,
    y: l
  };
}
const bA = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function xA(e, t) {
  const n = Cn(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, o = Mt(e) ? Wn(e) : Dt(1), s = e.clientWidth * o.x, a = e.clientHeight * o.y, l = i * o.x, c = r * o.y;
  return {
    width: s,
    height: a,
    x: l,
    y: c
  };
}
function Zu(e, t, n) {
  let r;
  if (t === "viewport")
    r = vA(e, n);
  else if (t === "document")
    r = yA(Lt(e));
  else if (St(t))
    r = xA(t, n);
  else {
    const i = Dp(e);
    r = {
      x: t.x - i.x,
      y: t.y - i.y,
      width: t.width,
      height: t.height
    };
  }
  return Li(r);
}
function Op(e, t) {
  const n = ln(e);
  return n === t || !St(n) || Zn(n) ? !1 : kt(n).position === "fixed" || Op(n, t);
}
function wA(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = Br(e, [], !1).filter((a) => St(a) && ur(a) !== "body"), i = null;
  const o = kt(e).position === "fixed";
  let s = o ? ln(e) : e;
  for (; St(s) && !Zn(s); ) {
    const a = kt(s), l = rl(s);
    !l && a.position === "fixed" && (i = null), (o ? !l && !i : !l && a.position === "static" && !!i && bA.has(i.position) || Kr(s) && !l && Op(e, s)) ? r = r.filter((u) => u !== s) : i = a, s = ln(s);
  }
  return t.set(e, r), r;
}
function SA(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: i
  } = e;
  const s = [...n === "clippingAncestors" ? oo(t) ? [] : wA(t, this._c) : [].concat(n), r], a = s[0], l = s.reduce((c, u) => {
    const d = Zu(t, u, i);
    return c.top = st(d.top, c.top), c.right = an(d.right, c.right), c.bottom = an(d.bottom, c.bottom), c.left = st(d.left, c.left), c;
  }, Zu(t, a, i));
  return {
    width: l.right - l.left,
    height: l.bottom - l.top,
    x: l.left,
    y: l.top
  };
}
function kA(e) {
  const {
    width: t,
    height: n
  } = Ip(e);
  return {
    width: t,
    height: n
  };
}
function CA(e, t, n) {
  const r = Mt(t), i = Lt(t), o = n === "fixed", s = Cn(e, !0, o, t);
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = Dt(0);
  function c() {
    l.x = ao(i);
  }
  if (r || !r && !o)
    if ((ur(t) !== "body" || Kr(i)) && (a = so(t)), r) {
      const f = Cn(t, !0, o, t);
      l.x = f.x + t.clientLeft, l.y = f.y + t.clientTop;
    } else i && c();
  o && !r && i && c();
  const u = i && !r && !o ? Mp(i, a) : Dt(0), d = s.left + a.scrollLeft - l.x - u.x, h = s.top + a.scrollTop - l.y - u.y;
  return {
    x: d,
    y: h,
    width: s.width,
    height: s.height
  };
}
function ns(e) {
  return kt(e).position === "static";
}
function Ju(e, t) {
  if (!Mt(e) || kt(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Lt(e) === n && (n = n.ownerDocument.body), n;
}
function Lp(e, t) {
  const n = lt(e);
  if (oo(e))
    return n;
  if (!Mt(e)) {
    let i = ln(e);
    for (; i && !Zn(i); ) {
      if (St(i) && !ns(i))
        return i;
      i = ln(i);
    }
    return n;
  }
  let r = Ju(e, t);
  for (; r && sA(r) && ns(r); )
    r = Ju(r, t);
  return r && Zn(r) && ns(r) && !rl(r) ? n : r || dA(e) || n;
}
const TA = async function(e) {
  const t = this.getOffsetParent || Lp, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: CA(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function EA(e) {
  return kt(e).direction === "rtl";
}
const PA = {
  convertOffsetParentRelativeRectToViewportRelativeRect: mA,
  getDocumentElement: Lt,
  getClippingRect: SA,
  getOffsetParent: Lp,
  getElementRects: TA,
  getClientRects: gA,
  getDimensions: kA,
  getScale: Wn,
  isElement: St,
  isRTL: EA
};
function _p(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function AA(e, t) {
  let n = null, r;
  const i = Lt(e);
  function o() {
    var a;
    clearTimeout(r), (a = n) == null || a.disconnect(), n = null;
  }
  function s(a, l) {
    a === void 0 && (a = !1), l === void 0 && (l = 1), o();
    const c = e.getBoundingClientRect(), {
      left: u,
      top: d,
      width: h,
      height: f
    } = c;
    if (a || t(), !h || !f)
      return;
    const m = oi(d), p = oi(i.clientWidth - (u + h)), y = oi(i.clientHeight - (d + f)), g = oi(u), w = {
      rootMargin: -m + "px " + -p + "px " + -y + "px " + -g + "px",
      threshold: st(0, an(1, l)) || 1
    };
    let P = !0;
    function E(C) {
      const A = C[0].intersectionRatio;
      if (A !== l) {
        if (!P)
          return s();
        A ? s(!1, A) : r = setTimeout(() => {
          s(!1, 1e-7);
        }, 1e3);
      }
      A === 1 && !_p(c, e.getBoundingClientRect()) && s(), P = !1;
    }
    try {
      n = new IntersectionObserver(E, {
        ...w,
        // Handle <iframe>s
        root: i.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(E, w);
    }
    n.observe(e);
  }
  return s(!0), o;
}
function RA(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: i = !0,
    ancestorResize: o = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: a = typeof IntersectionObserver == "function",
    animationFrame: l = !1
  } = r, c = ol(e), u = i || o ? [...c ? Br(c) : [], ...Br(t)] : [];
  u.forEach((g) => {
    i && g.addEventListener("scroll", n, {
      passive: !0
    }), o && g.addEventListener("resize", n);
  });
  const d = c && a ? AA(c, n) : null;
  let h = -1, f = null;
  s && (f = new ResizeObserver((g) => {
    let [x] = g;
    x && x.target === c && f && (f.unobserve(t), cancelAnimationFrame(h), h = requestAnimationFrame(() => {
      var w;
      (w = f) == null || w.observe(t);
    })), n();
  }), c && !l && f.observe(c), f.observe(t));
  let m, p = l ? Cn(e) : null;
  l && y();
  function y() {
    const g = Cn(e);
    p && !_p(p, g) && n(), p = g, m = requestAnimationFrame(y);
  }
  return n(), () => {
    var g;
    u.forEach((x) => {
      i && x.removeEventListener("scroll", n), o && x.removeEventListener("resize", n);
    }), d?.(), (g = f) == null || g.disconnect(), f = null, l && cancelAnimationFrame(m);
  };
}
const NA = eA, IA = tA, DA = ZP, MA = rA, OA = JP, Qu = XP, LA = nA, _A = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), i = {
    platform: PA,
    ...n
  }, o = {
    ...i.platform,
    _c: r
  };
  return YP(e, t, {
    ...i,
    platform: o
  });
};
var FA = typeof document < "u", VA = function() {
}, gi = FA ? Ys : VA;
function _i(e, t) {
  if (e === t)
    return !0;
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "function" && e.toString() === t.toString())
    return !0;
  let n, r, i;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (n = e.length, n !== t.length) return !1;
      for (r = n; r-- !== 0; )
        if (!_i(e[r], t[r]))
          return !1;
      return !0;
    }
    if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length)
      return !1;
    for (r = n; r-- !== 0; )
      if (!{}.hasOwnProperty.call(t, i[r]))
        return !1;
    for (r = n; r-- !== 0; ) {
      const o = i[r];
      if (!(o === "_owner" && e.$$typeof) && !_i(e[o], t[o]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Fp(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function ed(e, t) {
  const n = Fp(e);
  return Math.round(t * n) / n;
}
function rs(e) {
  const t = b.useRef(e);
  return gi(() => {
    t.current = e;
  }), t;
}
function BA(e) {
  e === void 0 && (e = {});
  const {
    placement: t = "bottom",
    strategy: n = "absolute",
    middleware: r = [],
    platform: i,
    elements: {
      reference: o,
      floating: s
    } = {},
    transform: a = !0,
    whileElementsMounted: l,
    open: c
  } = e, [u, d] = b.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [h, f] = b.useState(r);
  _i(h, r) || f(r);
  const [m, p] = b.useState(null), [y, g] = b.useState(null), x = b.useCallback(($) => {
    $ !== C.current && (C.current = $, p($));
  }, []), w = b.useCallback(($) => {
    $ !== A.current && (A.current = $, g($));
  }, []), P = o || m, E = s || y, C = b.useRef(null), A = b.useRef(null), N = b.useRef(u), L = l != null, T = rs(l), O = rs(i), I = rs(c), W = b.useCallback(() => {
    if (!C.current || !A.current)
      return;
    const $ = {
      placement: t,
      strategy: n,
      middleware: h
    };
    O.current && ($.platform = O.current), _A(C.current, A.current, $).then((U) => {
      const S = {
        ...U,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: I.current !== !1
      };
      R.current && !_i(N.current, S) && (N.current = S, zi.flushSync(() => {
        d(S);
      }));
    });
  }, [h, t, n, O, I]);
  gi(() => {
    c === !1 && N.current.isPositioned && (N.current.isPositioned = !1, d(($) => ({
      ...$,
      isPositioned: !1
    })));
  }, [c]);
  const R = b.useRef(!1);
  gi(() => (R.current = !0, () => {
    R.current = !1;
  }), []), gi(() => {
    if (P && (C.current = P), E && (A.current = E), P && E) {
      if (T.current)
        return T.current(P, E, W);
      W();
    }
  }, [P, E, W, T, L]);
  const M = b.useMemo(() => ({
    reference: C,
    floating: A,
    setReference: x,
    setFloating: w
  }), [x, w]), B = b.useMemo(() => ({
    reference: P,
    floating: E
  }), [P, E]), z = b.useMemo(() => {
    const $ = {
      position: n,
      left: 0,
      top: 0
    };
    if (!B.floating)
      return $;
    const U = ed(B.floating, u.x), S = ed(B.floating, u.y);
    return a ? {
      ...$,
      transform: "translate(" + U + "px, " + S + "px)",
      ...Fp(B.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: U,
      top: S
    };
  }, [n, a, B.floating, u.x, u.y]);
  return b.useMemo(() => ({
    ...u,
    update: W,
    refs: M,
    elements: B,
    floatingStyles: z
  }), [u, W, M, B, z]);
}
const zA = (e) => {
  function t(n) {
    return {}.hasOwnProperty.call(n, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(n) {
      const {
        element: r,
        padding: i
      } = typeof e == "function" ? e(n) : e;
      return r && t(r) ? r.current != null ? Qu({
        element: r.current,
        padding: i
      }).fn(n) : {} : r ? Qu({
        element: r,
        padding: i
      }).fn(n) : {};
    }
  };
}, jA = (e, t) => ({
  ...NA(e),
  options: [e, t]
}), $A = (e, t) => ({
  ...IA(e),
  options: [e, t]
}), UA = (e, t) => ({
  ...LA(e),
  options: [e, t]
}), HA = (e, t) => ({
  ...DA(e),
  options: [e, t]
}), WA = (e, t) => ({
  ...MA(e),
  options: [e, t]
}), qA = (e, t) => ({
  ...OA(e),
  options: [e, t]
}), KA = (e, t) => ({
  ...zA(e),
  options: [e, t]
});
var GA = "Arrow", Vp = b.forwardRef((e, t) => {
  const { children: n, width: r = 10, height: i = 5, ...o } = e;
  return /* @__PURE__ */ v(
    me.svg,
    {
      ...o,
      ref: t,
      width: r,
      height: i,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : /* @__PURE__ */ v("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Vp.displayName = GA;
var YA = Vp;
function XA(e) {
  const [t, n] = b.useState(void 0);
  return Ue(() => {
    if (e) {
      n({ width: e.offsetWidth, height: e.offsetHeight });
      const r = new ResizeObserver((i) => {
        if (!Array.isArray(i) || !i.length)
          return;
        const o = i[0];
        let s, a;
        if ("borderBoxSize" in o) {
          const l = o.borderBoxSize, c = Array.isArray(l) ? l[0] : l;
          s = c.inlineSize, a = c.blockSize;
        } else
          s = e.offsetWidth, a = e.offsetHeight;
        n({ width: s, height: a });
      });
      return r.observe(e, { box: "border-box" }), () => r.unobserve(e);
    } else
      n(void 0);
  }, [e]), t;
}
var sl = "Popper", [Bp, lo] = sr(sl), [ZA, zp] = Bp(sl), jp = (e) => {
  const { __scopePopper: t, children: n } = e, [r, i] = b.useState(null);
  return /* @__PURE__ */ v(ZA, { scope: t, anchor: r, onAnchorChange: i, children: n });
};
jp.displayName = sl;
var $p = "PopperAnchor", Up = b.forwardRef(
  (e, t) => {
    const { __scopePopper: n, virtualRef: r, ...i } = e, o = zp($p, n), s = b.useRef(null), a = Re(t, s), l = b.useRef(null);
    return b.useEffect(() => {
      const c = l.current;
      l.current = r?.current || s.current, c !== l.current && o.onAnchorChange(l.current);
    }), r ? null : /* @__PURE__ */ v(me.div, { ...i, ref: a });
  }
);
Up.displayName = $p;
var al = "PopperContent", [JA, QA] = Bp(al), Hp = b.forwardRef(
  (e, t) => {
    const {
      __scopePopper: n,
      side: r = "bottom",
      sideOffset: i = 0,
      align: o = "center",
      alignOffset: s = 0,
      arrowPadding: a = 0,
      avoidCollisions: l = !0,
      collisionBoundary: c = [],
      collisionPadding: u = 0,
      sticky: d = "partial",
      hideWhenDetached: h = !1,
      updatePositionStrategy: f = "optimized",
      onPlaced: m,
      ...p
    } = e, y = zp(al, n), [g, x] = b.useState(null), w = Re(t, (H) => x(H)), [P, E] = b.useState(null), C = XA(P), A = C?.width ?? 0, N = C?.height ?? 0, L = r + (o !== "center" ? "-" + o : ""), T = typeof u == "number" ? u : { top: 0, right: 0, bottom: 0, left: 0, ...u }, O = Array.isArray(c) ? c : [c], I = O.length > 0, W = {
      padding: T,
      boundary: O.filter(tR),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: I
    }, { refs: R, floatingStyles: M, placement: B, isPositioned: z, middlewareData: $ } = BA({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: L,
      whileElementsMounted: (...H) => RA(...H, {
        animationFrame: f === "always"
      }),
      elements: {
        reference: y.anchor
      },
      middleware: [
        jA({ mainAxis: i + N, alignmentAxis: s }),
        l && $A({
          mainAxis: !0,
          crossAxis: !1,
          limiter: d === "partial" ? UA() : void 0,
          ...W
        }),
        l && HA({ ...W }),
        WA({
          ...W,
          apply: ({ elements: H, rects: re, availableWidth: fe, availableHeight: ne }) => {
            const { width: se, height: q } = re.reference, Q = H.floating.style;
            Q.setProperty("--radix-popper-available-width", `${fe}px`), Q.setProperty("--radix-popper-available-height", `${ne}px`), Q.setProperty("--radix-popper-anchor-width", `${se}px`), Q.setProperty("--radix-popper-anchor-height", `${q}px`);
          }
        }),
        P && KA({ element: P, padding: a }),
        nR({ arrowWidth: A, arrowHeight: N }),
        h && qA({ strategy: "referenceHidden", ...W })
      ]
    }), [U, S] = Kp(B), oe = kn(m);
    Ue(() => {
      z && oe?.();
    }, [z, oe]);
    const X = $.arrow?.x, k = $.arrow?.y, G = $.arrow?.centerOffset !== 0, [ue, ce] = b.useState();
    return Ue(() => {
      g && ce(window.getComputedStyle(g).zIndex);
    }, [g]), /* @__PURE__ */ v(
      "div",
      {
        ref: R.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...M,
          transform: z ? M.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: ue,
          "--radix-popper-transform-origin": [
            $.transformOrigin?.x,
            $.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...$.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ v(
          JA,
          {
            scope: n,
            placedSide: U,
            onArrowChange: E,
            arrowX: X,
            arrowY: k,
            shouldHideArrow: G,
            children: /* @__PURE__ */ v(
              me.div,
              {
                "data-side": U,
                "data-align": S,
                ...p,
                ref: w,
                style: {
                  ...p.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: z ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
Hp.displayName = al;
var Wp = "PopperArrow", eR = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, qp = b.forwardRef(function(t, n) {
  const { __scopePopper: r, ...i } = t, o = QA(Wp, r), s = eR[o.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ v(
      "span",
      {
        ref: o.onArrowChange,
        style: {
          position: "absolute",
          left: o.arrowX,
          top: o.arrowY,
          [s]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[o.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[o.placedSide],
          visibility: o.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ v(
          YA,
          {
            ...i,
            ref: n,
            style: {
              ...i.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
qp.displayName = Wp;
function tR(e) {
  return e !== null;
}
var nR = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    const { placement: n, rects: r, middlewareData: i } = t, s = i.arrow?.centerOffset !== 0, a = s ? 0 : e.arrowWidth, l = s ? 0 : e.arrowHeight, [c, u] = Kp(n), d = { start: "0%", center: "50%", end: "100%" }[u], h = (i.arrow?.x ?? 0) + a / 2, f = (i.arrow?.y ?? 0) + l / 2;
    let m = "", p = "";
    return c === "bottom" ? (m = s ? d : `${h}px`, p = `${-l}px`) : c === "top" ? (m = s ? d : `${h}px`, p = `${r.floating.height + l}px`) : c === "right" ? (m = `${-l}px`, p = s ? d : `${f}px`) : c === "left" && (m = `${r.floating.width + l}px`, p = s ? d : `${f}px`), { data: { x: m, y: p } };
  }
});
function Kp(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var Gp = jp, ll = Up, Yp = Hp, Xp = qp, rR = "Portal", co = b.forwardRef((e, t) => {
  const { container: n, ...r } = e, [i, o] = b.useState(!1);
  Ue(() => o(!0), []);
  const s = n || i && globalThis?.document?.body;
  return s ? wd.createPortal(/* @__PURE__ */ v(me.div, { ...r, ref: t }), s) : null;
});
co.displayName = rR;
// @__NO_SIDE_EFFECTS__
function iR(e) {
  const t = /* @__PURE__ */ oR(e), n = b.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = b.Children.toArray(o), l = a.find(aR);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? b.Children.count(c) > 1 ? b.Children.only(null) : b.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ v(t, { ...s, ref: i, children: b.isValidElement(c) ? b.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ v(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function oR(e) {
  const t = b.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (b.isValidElement(i)) {
      const s = cR(i), a = lR(o, i.props);
      return i.type !== b.Fragment && (a.ref = r ? An(r, s) : s), b.cloneElement(i, a);
    }
    return b.Children.count(i) > 1 ? b.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var sR = /* @__PURE__ */ Symbol("radix.slottable");
function aR(e) {
  return b.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === sR;
}
function lR(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], o = t[r];
    /^on[A-Z]/.test(r) ? i && o ? n[r] = (...a) => {
      const l = o(...a);
      return i(...a), l;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...o } : r === "className" && (n[r] = [i, o].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function cR(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var uR = function(e) {
  if (typeof document > "u")
    return null;
  var t = Array.isArray(e) ? e[0] : e;
  return t.ownerDocument.body;
}, On = /* @__PURE__ */ new WeakMap(), si = /* @__PURE__ */ new WeakMap(), ai = {}, is = 0, Zp = function(e) {
  return e && (e.host || Zp(e.parentNode));
}, dR = function(e, t) {
  return t.map(function(n) {
    if (e.contains(n))
      return n;
    var r = Zp(n);
    return r && e.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, fR = function(e, t, n, r) {
  var i = dR(t, Array.isArray(e) ? e : [e]);
  ai[n] || (ai[n] = /* @__PURE__ */ new WeakMap());
  var o = ai[n], s = [], a = /* @__PURE__ */ new Set(), l = new Set(i), c = function(d) {
    !d || a.has(d) || (a.add(d), c(d.parentNode));
  };
  i.forEach(c);
  var u = function(d) {
    !d || l.has(d) || Array.prototype.forEach.call(d.children, function(h) {
      if (a.has(h))
        u(h);
      else
        try {
          var f = h.getAttribute(r), m = f !== null && f !== "false", p = (On.get(h) || 0) + 1, y = (o.get(h) || 0) + 1;
          On.set(h, p), o.set(h, y), s.push(h), p === 1 && m && si.set(h, !0), y === 1 && h.setAttribute(n, "true"), m || h.setAttribute(r, "true");
        } catch (g) {
          console.error("aria-hidden: cannot operate on ", h, g);
        }
    });
  };
  return u(t), a.clear(), is++, function() {
    s.forEach(function(d) {
      var h = On.get(d) - 1, f = o.get(d) - 1;
      On.set(d, h), o.set(d, f), h || (si.has(d) || d.removeAttribute(r), si.delete(d)), f || d.removeAttribute(n);
    }), is--, is || (On = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), si = /* @__PURE__ */ new WeakMap(), ai = {});
  };
}, cl = function(e, t, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(e) ? e : [e]), i = uR(e);
  return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), fR(r, i, n, "aria-hidden")) : function() {
    return null;
  };
}, Pt = function() {
  return Pt = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, Pt.apply(this, arguments);
};
function Jp(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function hR(e, t, n) {
  if (n || arguments.length === 2) for (var r = 0, i = t.length, o; r < i; r++)
    (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var yi = "right-scroll-bar-position", vi = "width-before-scroll-bar", pR = "with-scroll-bars-hidden", mR = "--removed-body-scroll-bar-size";
function os(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function gR(e, t) {
  var n = ye(function() {
    return {
      // value
      value: e,
      // last callback
      callback: t,
      // "memoized" public interface
      facade: {
        get current() {
          return n.value;
        },
        set current(r) {
          var i = n.value;
          i !== r && (n.value = r, n.callback(r, i));
        }
      }
    };
  })[0];
  return n.callback = t, n.facade;
}
var yR = typeof window < "u" ? b.useLayoutEffect : b.useEffect, td = /* @__PURE__ */ new WeakMap();
function vR(e, t) {
  var n = gR(null, function(r) {
    return e.forEach(function(i) {
      return os(i, r);
    });
  });
  return yR(function() {
    var r = td.get(n);
    if (r) {
      var i = new Set(r), o = new Set(e), s = n.current;
      i.forEach(function(a) {
        o.has(a) || os(a, null);
      }), o.forEach(function(a) {
        i.has(a) || os(a, s);
      });
    }
    td.set(n, e);
  }, [e]), n;
}
function bR(e) {
  return e;
}
function xR(e, t) {
  t === void 0 && (t = bR);
  var n = [], r = !1, i = {
    read: function() {
      if (r)
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      return n.length ? n[n.length - 1] : e;
    },
    useMedium: function(o) {
      var s = t(o, r);
      return n.push(s), function() {
        n = n.filter(function(a) {
          return a !== s;
        });
      };
    },
    assignSyncMedium: function(o) {
      for (r = !0; n.length; ) {
        var s = n;
        n = [], s.forEach(o);
      }
      n = {
        push: function(a) {
          return o(a);
        },
        filter: function() {
          return n;
        }
      };
    },
    assignMedium: function(o) {
      r = !0;
      var s = [];
      if (n.length) {
        var a = n;
        n = [], a.forEach(o), s = n;
      }
      var l = function() {
        var u = s;
        s = [], u.forEach(o);
      }, c = function() {
        return Promise.resolve().then(l);
      };
      c(), n = {
        push: function(u) {
          s.push(u), c();
        },
        filter: function(u) {
          return s = s.filter(u), n;
        }
      };
    }
  };
  return i;
}
function wR(e) {
  e === void 0 && (e = {});
  var t = xR(null);
  return t.options = Pt({ async: !0, ssr: !1 }, e), t;
}
var Qp = function(e) {
  var t = e.sideCar, n = Jp(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return b.createElement(r, Pt({}, n));
};
Qp.isSideCarExport = !0;
function SR(e, t) {
  return e.useMedium(t), Qp;
}
var em = wR(), ss = function() {
}, uo = b.forwardRef(function(e, t) {
  var n = b.useRef(null), r = b.useState({
    onScrollCapture: ss,
    onWheelCapture: ss,
    onTouchMoveCapture: ss
  }), i = r[0], o = r[1], s = e.forwardProps, a = e.children, l = e.className, c = e.removeScrollBar, u = e.enabled, d = e.shards, h = e.sideCar, f = e.noRelative, m = e.noIsolation, p = e.inert, y = e.allowPinchZoom, g = e.as, x = g === void 0 ? "div" : g, w = e.gapMode, P = Jp(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), E = h, C = vR([n, t]), A = Pt(Pt({}, P), i);
  return b.createElement(
    b.Fragment,
    null,
    u && b.createElement(E, { sideCar: em, removeScrollBar: c, shards: d, noRelative: f, noIsolation: m, inert: p, setCallbacks: o, allowPinchZoom: !!y, lockRef: n, gapMode: w }),
    s ? b.cloneElement(b.Children.only(a), Pt(Pt({}, A), { ref: C })) : b.createElement(x, Pt({}, A, { className: l, ref: C }), a)
  );
});
uo.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
uo.classNames = {
  fullWidth: vi,
  zeroRight: yi
};
var kR = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function CR() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = kR();
  return t && e.setAttribute("nonce", t), e;
}
function TR(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function ER(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var PR = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = CR()) && (TR(t, n), ER(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, AR = function() {
  var e = PR();
  return function(t, n) {
    b.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, tm = function() {
  var e = AR(), t = function(n) {
    var r = n.styles, i = n.dynamic;
    return e(r, i), null;
  };
  return t;
}, RR = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, as = function(e) {
  return parseInt(e || "", 10) || 0;
}, NR = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [as(n), as(r), as(i)];
}, IR = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return RR;
  var t = NR(e), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, r - n + t[2] - t[0])
  };
}, DR = tm(), qn = "data-scroll-locked", MR = function(e, t, n, r) {
  var i = e.left, o = e.top, s = e.right, a = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(pR, ` {
   overflow: hidden `).concat(r, `;
   padding-right: `).concat(a, "px ").concat(r, `;
  }
  body[`).concat(qn, `] {
    overflow: hidden `).concat(r, `;
    overscroll-behavior: contain;
    `).concat([
    t && "position: relative ".concat(r, ";"),
    n === "margin" && `
    padding-left: `.concat(i, `px;
    padding-top: `).concat(o, `px;
    padding-right: `).concat(s, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(a, "px ").concat(r, `;
    `),
    n === "padding" && "padding-right: ".concat(a, "px ").concat(r, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat(yi, ` {
    right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(vi, ` {
    margin-right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(yi, " .").concat(yi, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(vi, " .").concat(vi, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(qn, `] {
    `).concat(mR, ": ").concat(a, `px;
  }
`);
}, nd = function() {
  var e = parseInt(document.body.getAttribute(qn) || "0", 10);
  return isFinite(e) ? e : 0;
}, OR = function() {
  b.useEffect(function() {
    return document.body.setAttribute(qn, (nd() + 1).toString()), function() {
      var e = nd() - 1;
      e <= 0 ? document.body.removeAttribute(qn) : document.body.setAttribute(qn, e.toString());
    };
  }, []);
}, LR = function(e) {
  var t = e.noRelative, n = e.noImportant, r = e.gapMode, i = r === void 0 ? "margin" : r;
  OR();
  var o = b.useMemo(function() {
    return IR(i);
  }, [i]);
  return b.createElement(DR, { styles: MR(o, !t, i, n ? "" : "!important") });
}, js = !1;
if (typeof window < "u")
  try {
    var li = Object.defineProperty({}, "passive", {
      get: function() {
        return js = !0, !0;
      }
    });
    window.addEventListener("test", li, li), window.removeEventListener("test", li, li);
  } catch {
    js = !1;
  }
var Ln = js ? { passive: !1 } : !1, _R = function(e) {
  return e.tagName === "TEXTAREA";
}, nm = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !_R(e) && n[t] === "visible")
  );
}, FR = function(e) {
  return nm(e, "overflowY");
}, VR = function(e) {
  return nm(e, "overflowX");
}, rd = function(e, t) {
  var n = t.ownerDocument, r = t;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var i = rm(e, r);
    if (i) {
      var o = im(e, r), s = o[1], a = o[2];
      if (s > a)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, BR = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, r = e.clientHeight;
  return [
    t,
    n,
    r
  ];
}, zR = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, r = e.clientWidth;
  return [
    t,
    n,
    r
  ];
}, rm = function(e, t) {
  return e === "v" ? FR(t) : VR(t);
}, im = function(e, t) {
  return e === "v" ? BR(t) : zR(t);
}, jR = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, $R = function(e, t, n, r, i) {
  var o = jR(e, window.getComputedStyle(t).direction), s = o * r, a = n.target, l = t.contains(a), c = !1, u = s > 0, d = 0, h = 0;
  do {
    if (!a)
      break;
    var f = im(e, a), m = f[0], p = f[1], y = f[2], g = p - y - o * m;
    (m || g) && rm(e, a) && (d += g, h += m);
    var x = a.parentNode;
    a = x && x.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? x.host : x;
  } while (
    // portaled content
    !l && a !== document.body || // self content
    l && (t.contains(a) || t === a)
  );
  return (u && Math.abs(d) < 1 || !u && Math.abs(h) < 1) && (c = !0), c;
}, ci = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, id = function(e) {
  return [e.deltaX, e.deltaY];
}, od = function(e) {
  return e && "current" in e ? e.current : e;
}, UR = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, HR = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, WR = 0, _n = [];
function qR(e) {
  var t = b.useRef([]), n = b.useRef([0, 0]), r = b.useRef(), i = b.useState(WR++)[0], o = b.useState(tm)[0], s = b.useRef(e);
  b.useEffect(function() {
    s.current = e;
  }, [e]), b.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(i));
      var p = hR([e.lockRef.current], (e.shards || []).map(od), !0).filter(Boolean);
      return p.forEach(function(y) {
        return y.classList.add("allow-interactivity-".concat(i));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(i)), p.forEach(function(y) {
          return y.classList.remove("allow-interactivity-".concat(i));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var a = b.useCallback(function(p, y) {
    if ("touches" in p && p.touches.length === 2 || p.type === "wheel" && p.ctrlKey)
      return !s.current.allowPinchZoom;
    var g = ci(p), x = n.current, w = "deltaX" in p ? p.deltaX : x[0] - g[0], P = "deltaY" in p ? p.deltaY : x[1] - g[1], E, C = p.target, A = Math.abs(w) > Math.abs(P) ? "h" : "v";
    if ("touches" in p && A === "h" && C.type === "range")
      return !1;
    var N = window.getSelection(), L = N && N.anchorNode, T = L ? L === C || L.contains(C) : !1;
    if (T)
      return !1;
    var O = rd(A, C);
    if (!O)
      return !0;
    if (O ? E = A : (E = A === "v" ? "h" : "v", O = rd(A, C)), !O)
      return !1;
    if (!r.current && "changedTouches" in p && (w || P) && (r.current = E), !E)
      return !0;
    var I = r.current || E;
    return $R(I, y, p, I === "h" ? w : P);
  }, []), l = b.useCallback(function(p) {
    var y = p;
    if (!(!_n.length || _n[_n.length - 1] !== o)) {
      var g = "deltaY" in y ? id(y) : ci(y), x = t.current.filter(function(E) {
        return E.name === y.type && (E.target === y.target || y.target === E.shadowParent) && UR(E.delta, g);
      })[0];
      if (x && x.should) {
        y.cancelable && y.preventDefault();
        return;
      }
      if (!x) {
        var w = (s.current.shards || []).map(od).filter(Boolean).filter(function(E) {
          return E.contains(y.target);
        }), P = w.length > 0 ? a(y, w[0]) : !s.current.noIsolation;
        P && y.cancelable && y.preventDefault();
      }
    }
  }, []), c = b.useCallback(function(p, y, g, x) {
    var w = { name: p, delta: y, target: g, should: x, shadowParent: KR(g) };
    t.current.push(w), setTimeout(function() {
      t.current = t.current.filter(function(P) {
        return P !== w;
      });
    }, 1);
  }, []), u = b.useCallback(function(p) {
    n.current = ci(p), r.current = void 0;
  }, []), d = b.useCallback(function(p) {
    c(p.type, id(p), p.target, a(p, e.lockRef.current));
  }, []), h = b.useCallback(function(p) {
    c(p.type, ci(p), p.target, a(p, e.lockRef.current));
  }, []);
  b.useEffect(function() {
    return _n.push(o), e.setCallbacks({
      onScrollCapture: d,
      onWheelCapture: d,
      onTouchMoveCapture: h
    }), document.addEventListener("wheel", l, Ln), document.addEventListener("touchmove", l, Ln), document.addEventListener("touchstart", u, Ln), function() {
      _n = _n.filter(function(p) {
        return p !== o;
      }), document.removeEventListener("wheel", l, Ln), document.removeEventListener("touchmove", l, Ln), document.removeEventListener("touchstart", u, Ln);
    };
  }, []);
  var f = e.removeScrollBar, m = e.inert;
  return b.createElement(
    b.Fragment,
    null,
    m ? b.createElement(o, { styles: HR(i) }) : null,
    f ? b.createElement(LR, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function KR(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const GR = SR(em, qR);
var fo = b.forwardRef(function(e, t) {
  return b.createElement(uo, Pt({}, e, { ref: t, sideCar: GR }));
});
fo.classNames = uo.classNames;
var ho = "Popover", [om] = sr(ho, [
  lo
]), Gr = lo(), [YR, dn] = om(ho), sm = (e) => {
  const {
    __scopePopover: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !1
  } = e, a = Gr(t), l = b.useRef(null), [c, u] = b.useState(!1), [d, h] = Lr({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: ho
  });
  return /* @__PURE__ */ v(Gp, { ...a, children: /* @__PURE__ */ v(
    YR,
    {
      scope: t,
      contentId: tn(),
      triggerRef: l,
      open: d,
      onOpenChange: h,
      onOpenToggle: b.useCallback(() => h((f) => !f), [h]),
      hasCustomAnchor: c,
      onCustomAnchorAdd: b.useCallback(() => u(!0), []),
      onCustomAnchorRemove: b.useCallback(() => u(!1), []),
      modal: s,
      children: n
    }
  ) });
};
sm.displayName = ho;
var am = "PopoverAnchor", XR = b.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = dn(am, n), o = Gr(n), { onCustomAnchorAdd: s, onCustomAnchorRemove: a } = i;
    return b.useEffect(() => (s(), () => a()), [s, a]), /* @__PURE__ */ v(ll, { ...o, ...r, ref: t });
  }
);
XR.displayName = am;
var lm = "PopoverTrigger", cm = b.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = dn(lm, n), o = Gr(n), s = Re(t, i.triggerRef), a = /* @__PURE__ */ v(
      me.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": pm(i.open),
        ...r,
        ref: s,
        onClick: pe(e.onClick, i.onOpenToggle)
      }
    );
    return i.hasCustomAnchor ? a : /* @__PURE__ */ v(ll, { asChild: !0, ...o, children: a });
  }
);
cm.displayName = lm;
var ul = "PopoverPortal", [ZR, JR] = om(ul, {
  forceMount: void 0
}), um = (e) => {
  const { __scopePopover: t, forceMount: n, children: r, container: i } = e, o = dn(ul, t);
  return /* @__PURE__ */ v(ZR, { scope: t, forceMount: n, children: /* @__PURE__ */ v(Nn, { present: n || o.open, children: /* @__PURE__ */ v(co, { asChild: !0, container: i, children: r }) }) });
};
um.displayName = ul;
var Jn = "PopoverContent", dm = b.forwardRef(
  (e, t) => {
    const n = JR(Jn, e.__scopePopover), { forceMount: r = n.forceMount, ...i } = e, o = dn(Jn, e.__scopePopover);
    return /* @__PURE__ */ v(Nn, { present: r || o.open, children: o.modal ? /* @__PURE__ */ v(eN, { ...i, ref: t }) : /* @__PURE__ */ v(tN, { ...i, ref: t }) });
  }
);
dm.displayName = Jn;
var QR = /* @__PURE__ */ iR("PopoverContent.RemoveScroll"), eN = b.forwardRef(
  (e, t) => {
    const n = dn(Jn, e.__scopePopover), r = b.useRef(null), i = Re(t, r), o = b.useRef(!1);
    return b.useEffect(() => {
      const s = r.current;
      if (s) return cl(s);
    }, []), /* @__PURE__ */ v(fo, { as: QR, allowPinchZoom: !0, children: /* @__PURE__ */ v(
      fm,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: pe(e.onCloseAutoFocus, (s) => {
          s.preventDefault(), o.current || n.triggerRef.current?.focus();
        }),
        onPointerDownOutside: pe(
          e.onPointerDownOutside,
          (s) => {
            const a = s.detail.originalEvent, l = a.button === 0 && a.ctrlKey === !0, c = a.button === 2 || l;
            o.current = c;
          },
          { checkForDefaultPrevented: !1 }
        ),
        onFocusOutside: pe(
          e.onFocusOutside,
          (s) => s.preventDefault(),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
), tN = b.forwardRef(
  (e, t) => {
    const n = dn(Jn, e.__scopePopover), r = b.useRef(!1), i = b.useRef(!1);
    return /* @__PURE__ */ v(
      fm,
      {
        ...e,
        ref: t,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (o) => {
          e.onCloseAutoFocus?.(o), o.defaultPrevented || (r.current || n.triggerRef.current?.focus(), o.preventDefault()), r.current = !1, i.current = !1;
        },
        onInteractOutside: (o) => {
          e.onInteractOutside?.(o), o.defaultPrevented || (r.current = !0, o.detail.originalEvent.type === "pointerdown" && (i.current = !0));
          const s = o.target;
          n.triggerRef.current?.contains(s) && o.preventDefault(), o.detail.originalEvent.type === "focusin" && i.current && o.preventDefault();
        }
      }
    );
  }
), fm = b.forwardRef(
  (e, t) => {
    const {
      __scopePopover: n,
      trapFocus: r,
      onOpenAutoFocus: i,
      onCloseAutoFocus: o,
      disableOutsidePointerEvents: s,
      onEscapeKeyDown: a,
      onPointerDownOutside: l,
      onFocusOutside: c,
      onInteractOutside: u,
      ...d
    } = e, h = dn(Jn, n), f = Gr(n);
    return Qa(), /* @__PURE__ */ v(
      ro,
      {
        asChild: !0,
        loop: !0,
        trapped: r,
        onMountAutoFocus: i,
        onUnmountAutoFocus: o,
        children: /* @__PURE__ */ v(
          no,
          {
            asChild: !0,
            disableOutsidePointerEvents: s,
            onInteractOutside: u,
            onEscapeKeyDown: a,
            onPointerDownOutside: l,
            onFocusOutside: c,
            onDismiss: () => h.onOpenChange(!1),
            children: /* @__PURE__ */ v(
              Yp,
              {
                "data-state": pm(h.open),
                role: "dialog",
                id: h.contentId,
                ...f,
                ...d,
                ref: t,
                style: {
                  ...d.style,
                  "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                  "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                  "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                  "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                  "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                }
              }
            )
          }
        )
      }
    );
  }
), hm = "PopoverClose", nN = b.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = dn(hm, n);
    return /* @__PURE__ */ v(
      me.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: pe(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
nN.displayName = hm;
var rN = "PopoverArrow", iN = b.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = Gr(n);
    return /* @__PURE__ */ v(Xp, { ...i, ...r, ref: t });
  }
);
iN.displayName = rN;
function pm(e) {
  return e ? "open" : "closed";
}
var oN = sm, sN = cm, aN = um, lN = dm;
function dl({
  ...e
}) {
  return /* @__PURE__ */ v(oN, { "data-slot": "popover", ...e });
}
function fl({
  ...e
}) {
  return /* @__PURE__ */ v(sN, { "data-slot": "popover-trigger", ...e });
}
function hl({
  className: e,
  align: t = "center",
  sideOffset: n = 4,
  ...r
}) {
  return /* @__PURE__ */ v(aN, { children: /* @__PURE__ */ v(
    lN,
    {
      "data-slot": "popover-content",
      align: t,
      sideOffset: n,
      className: ie(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        e
      ),
      ...r
    }
  ) });
}
function $s({ content: e, className: t }) {
  let n = null, r = !1;
  if (typeof e == "string")
    try {
      n = JSON.parse(e), typeof n == "object" && n !== null && (r = !0);
    } catch {
    }
  else typeof e == "object" && e !== null && (n = e, r = !0);
  if (!r)
    return /* @__PURE__ */ v("code", { className: ie("rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", t), children: typeof e == "string" ? e : JSON.stringify(e) });
  const i = Array.isArray(n) ? `Array [${n.length}]` : "Data", o = JSON.stringify(n, null, 2);
  return /* @__PURE__ */ _(dl, { children: [
    /* @__PURE__ */ v(fl, { asChild: !0, children: /* @__PURE__ */ _(
      "button",
      {
        className: ie(
          "inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer select-none",
          t
        ),
        children: [
          /* @__PURE__ */ v(xl, { className: "h-3 w-3" }),
          /* @__PURE__ */ v("span", { className: "truncate max-w-[200px]", children: i })
        ]
      }
    ) }),
    /* @__PURE__ */ _(hl, { className: "w-[500px] max-w-[90vw] p-0", align: "start", children: [
      /* @__PURE__ */ _("div", { className: "flex items-center justify-between border-b px-3 py-2 bg-muted/30", children: [
        /* @__PURE__ */ _("div", { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
          /* @__PURE__ */ v(xl, { className: "h-4 w-4" }),
          /* @__PURE__ */ v("span", { children: "Data Viewer" })
        ] }),
        /* @__PURE__ */ v(Di, { content: o, copyMessage: "Copied JSON" })
      ] }),
      /* @__PURE__ */ v("div", { className: "max-h-[500px] overflow-auto p-4 bg-background", children: /* @__PURE__ */ v("pre", { className: "text-xs font-mono whitespace-pre-wrap break-words text-foreground", children: o }) })
    ] })
  ] });
}
function sd({ children: e }) {
  return /* @__PURE__ */ v("div", { className: "space-y-3", children: /* @__PURE__ */ v(_C, { remarkPlugins: [YE], components: uN, children: e }) });
}
const mm = V.memo(
  (async ({ children: e, language: t, ...n }) => {
    const { codeToTokens: r, bundledLanguages: i } = await import("./index-CXynWKcY.js");
    if (!(t in i))
      return /* @__PURE__ */ v("pre", { ...n, children: e });
    const { tokens: o } = await r(e, {
      lang: t,
      defaultColor: !1,
      themes: {
        light: "github-light",
        dark: "github-dark"
      }
    });
    return /* @__PURE__ */ v("pre", { ...n, children: /* @__PURE__ */ v("code", { children: o.map((s, a) => /* @__PURE__ */ _(Vt, { children: [
      /* @__PURE__ */ v("span", { children: s.map((l, c) => {
        const u = typeof l.htmlStyle == "string" ? void 0 : l.htmlStyle;
        return /* @__PURE__ */ v(
          "span",
          {
            className: "text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg",
            style: u,
            children: l.content
          },
          c
        );
      }) }, a),
      a !== o.length - 1 && `
`
    ] })) }) });
  })
);
mm.displayName = "HighlightedCode";
const cN = ({
  children: e,
  className: t,
  language: n,
  ...r
}) => {
  const i = typeof e == "string" ? e : Fi(e), o = ie(
    "overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    t
  );
  return /* @__PURE__ */ _("div", { className: "group/code relative mb-4", children: [
    /* @__PURE__ */ v(
      pg,
      {
        fallback: /* @__PURE__ */ v("pre", { className: o, ...r, children: e }),
        children: /* @__PURE__ */ v(mm, { language: n, className: o, children: i })
      }
    ),
    /* @__PURE__ */ v("div", { className: "invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100", children: /* @__PURE__ */ v(Di, { content: i, copyMessage: "Copied code to clipboard" }) })
  ] });
};
function Fi(e) {
  if (typeof e == "string")
    return e;
  if (e?.props?.children) {
    let t = e.props.children;
    return Array.isArray(t) ? t.map((n) => Fi(n)).join("") : Fi(t);
  }
  return "";
}
const uN = {
  h1: He("h1", "text-2xl font-semibold"),
  h2: He("h2", "font-semibold text-xl"),
  h3: He("h3", "font-semibold text-lg"),
  h4: He("h4", "font-semibold text-base"),
  h5: He("h5", "font-medium"),
  strong: He("strong", "font-semibold"),
  a: He("a", "text-primary underline underline-offset-2"),
  blockquote: He("blockquote", "border-l-2 border-primary pl-4"),
  code: ({ children: e, className: t, node: n, ...r }) => {
    const i = /language-(\w+)/.exec(t || ""), o = i ? i[1] : void 0, s = String(e).replace(/\n$/, "");
    let a = o === "json";
    if (!a)
      try {
        const l = JSON.parse(s);
        typeof l == "object" && l !== null && (a = !0);
      } catch {
      }
    return a ? /* @__PURE__ */ v($s, { content: s }) : i ? /* @__PURE__ */ v(cN, { className: t, language: i[1], ...r, children: e }) : /* @__PURE__ */ v(
      "code",
      {
        className: ie(
          "font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5"
        ),
        ...r,
        children: e
      }
    );
  },
  pre: ({ children: e }) => e,
  ol: He("ol", "list-decimal space-y-2 pl-6"),
  ul: He("ul", "list-disc space-y-2 pl-6"),
  li: He("li", "my-1.5"),
  table: He(
    "table",
    "w-full border-collapse overflow-y-auto rounded-md border border-foreground/20"
  ),
  th: He(
    "th",
    "border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  td: He(
    "td",
    "border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  tr: He("tr", "m-0 border-t p-0 even:bg-muted"),
  p: ({ children: e, className: t, ...n }) => {
    const i = Fi(e).trim();
    if (i.startsWith("{") && i.endsWith("}") || i.startsWith("[") && i.endsWith("]"))
      try {
        const s = JSON.parse(i);
        if (typeof s == "object" && s !== null)
          return /* @__PURE__ */ v("div", { className: "my-2", children: /* @__PURE__ */ v($s, { content: i }) });
      } catch {
      }
    return /* @__PURE__ */ v("p", { className: ie("whitespace-pre-wrap", t), ...n, children: e });
  },
  hr: He("hr", "border-foreground/20")
};
function He(e, t) {
  const n = ({ node: r, ...i }) => /* @__PURE__ */ v(e, { className: t, ...i });
  return n.displayName = e, n;
}
const dN = _d(
  "group/message relative break-words rounded-2xl p-4 text-sm sm:max-w-[85%] transition-all duration-300",
  {
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
  }
), fN = ({
  role: e,
  content: t,
  createdAt: n,
  showTimeStamp: r = !1,
  animation: i = "scale",
  actions: o,
  name: s,
  experimental_attachments: a,
  toolInvocations: l,
  parts: c
}) => {
  const u = nn(() => a?.map((y) => {
    const g = hN(y.url);
    return new File([g], y.name ?? "Unknown", {
      type: y.contentType
    });
  }), [a]), d = e === "user", h = e === "user" ? "user" : e === "tool" ? "tool" : e === "subagent" || s && s.startsWith("sub-agent-") ? "subagent" : "assistant", f = n?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }), m = ({ children: y, className: g }) => /* @__PURE__ */ v("div", { className: ie(
    "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
    g
  ), children: y }), p = () => h === "user" ? null : h === "assistant" ? /* @__PURE__ */ v(m, { className: "bg-gradient-to-tr from-primary to-primary/80 border-primary/20 text-primary-foreground", children: /* @__PURE__ */ v(ji, { className: "h-4 w-4" }) }) : h === "subagent" ? /* @__PURE__ */ v(m, { className: "bg-gradient-to-tr from-indigo-500 to-blue-500 border-indigo-400/20 text-white", children: /* @__PURE__ */ v(Sg, { className: "h-4 w-4" }) }) : null;
  return !t && !l && (!c || c.length === 0) ? null : /* @__PURE__ */ _("div", { className: ie(
    "flex w-full gap-3 mb-6",
    d ? "flex-row-reverse" : "flex-row"
  ), children: [
    p(),
    /* @__PURE__ */ _("div", { className: ie(
      "flex flex-col gap-1.5",
      d ? "items-end max-w-[85%]" : "items-start max-w-[85%]"
    ), children: [
      d && u && u.length > 0 && /* @__PURE__ */ v("div", { className: "mb-1 flex flex-wrap gap-2 justify-end", children: u.map((y, g) => /* @__PURE__ */ v(Oa, { file: y }, g)) }),
      /* @__PURE__ */ _("div", { className: ie(dN({ variant: h, animation: i })), children: [
        c && c.length > 0 ? c.map((y, g) => y.type === "text" ? /* @__PURE__ */ v(ad, { variant: h, children: y.text }, g) : y.type === "reasoning" ? /* @__PURE__ */ v(pN, { part: y }, g) : y.type === "tool-invocation" ? /* @__PURE__ */ v(ld, { toolInvocations: [y.toolInvocation] }, g) : null) : l && l.length > 0 ? /* @__PURE__ */ v(ld, { toolInvocations: l }) : /* @__PURE__ */ v(ad, { variant: h, children: t }),
        o && /* @__PURE__ */ v("div", { className: "absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background/80 backdrop-blur-sm p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-md", children: o })
      ] }),
      r && n && /* @__PURE__ */ v(
        "time",
        {
          dateTime: n.toISOString(),
          className: ie(
            "px-1 text-[10px] font-medium text-muted-foreground/50",
            i !== "none" && "duration-500 animate-in fade-in-0"
          ),
          children: f
        }
      )
    ] })
  ] });
}, ad = ({
  children: e,
  threshold: t = 1e3,
  variant: n
}) => {
  const [r, i] = ye(!1), o = e.length > t, s = ie(
    "mt-2 self-start text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer",
    n === "user" ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary hover:text-primary/80"
  );
  return !o || r ? /* @__PURE__ */ _("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ v(sd, { children: e }),
    o && /* @__PURE__ */ v("button", { onClick: () => i(!1), className: s, children: "Show less" })
  ] }) : /* @__PURE__ */ _("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ v(sd, { children: e.slice(0, t) + "..." }),
    /* @__PURE__ */ v("button", { onClick: () => i(!0), className: s, children: "Read more" })
  ] });
};
function hN(e) {
  const t = e.split(",")[1], n = atob(t), r = n.length, i = new Uint8Array(r);
  for (let o = 0; o < r; o++)
    i[o] = n.charCodeAt(o);
  return i;
}
const pN = ({ part: e }) => {
  const [t, n] = ye(!1);
  return /* @__PURE__ */ v("div", { className: "mb-2 flex flex-col items-start sm:max-w-[70%]", children: /* @__PURE__ */ _(
    k0,
    {
      open: t,
      onOpenChange: n,
      className: "group w-full overflow-hidden rounded-lg border bg-muted/50",
      children: [
        /* @__PURE__ */ v("div", { className: "flex items-center p-2", children: /* @__PURE__ */ v(C0, { asChild: !0, children: /* @__PURE__ */ _("button", { className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ v(Td, { className: "h-4 w-4 transition-transform group-data-[state=open]:rotate-90" }),
          /* @__PURE__ */ v("span", { children: "Thinking" })
        ] }) }) }),
        /* @__PURE__ */ v(T0, { forceMount: !0, children: /* @__PURE__ */ v(
          zt.div,
          {
            initial: !1,
            animate: t ? "open" : "closed",
            variants: {
              open: { height: "auto", opacity: 1 },
              closed: { height: 0, opacity: 0 }
            },
            transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
            className: "border-t",
            children: /* @__PURE__ */ v("div", { className: "p-2", children: /* @__PURE__ */ v("div", { className: "whitespace-pre-wrap text-xs", children: e.reasoning }) })
          }
        ) })
      ]
    }
  ) });
};
function ld({
  toolInvocations: e
}) {
  return e?.length ? /* @__PURE__ */ v("div", { className: "flex flex-col items-start gap-2", children: e.map((t, n) => {
    if (t.state === "result" && t.result.__cancelled === !0)
      return /* @__PURE__ */ _(
        "div",
        {
          className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
          children: [
            /* @__PURE__ */ v(wg, { className: "h-4 w-4" }),
            /* @__PURE__ */ _("span", { children: [
              "Cancelled",
              " ",
              /* @__PURE__ */ _("span", { className: "font-mono", children: [
                "`",
                t.toolName,
                "`"
              ] })
            ] })
          ]
        },
        n
      );
    switch (t.state) {
      case "partial-call":
      case "call":
        return /* @__PURE__ */ _(
          "div",
          {
            className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
            children: [
              /* @__PURE__ */ v(Lg, { className: "h-4 w-4" }),
              /* @__PURE__ */ _("span", { children: [
                "Calling",
                " ",
                /* @__PURE__ */ _("span", { className: "font-mono", children: [
                  "`",
                  t.toolName,
                  "`"
                ] }),
                "..."
              ] }),
              /* @__PURE__ */ v(Ed, { className: "h-3 w-3 animate-spin" })
            ]
          },
          n
        );
      case "result":
        return /* @__PURE__ */ _(
          "div",
          {
            className: "flex flex-col gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm",
            children: [
              /* @__PURE__ */ _("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ v(Tg, { className: "h-4 w-4" }),
                /* @__PURE__ */ _("span", { children: [
                  "Result from",
                  " ",
                  /* @__PURE__ */ _("span", { className: "font-mono", children: [
                    "`",
                    t.toolName,
                    "`"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ v($s, { content: t.result })
            ]
          },
          n
        );
      default:
        return null;
    }
  }) }) : null;
}
function mN(e, t, n) {
  let r = (i) => e(i, ...t);
  return n === void 0 ? r : Object.assign(r, { lazy: n, lazyArgs: t });
}
function gm(e, t, n) {
  let r = e.length - t.length;
  if (r === 0) return e(...t);
  if (r === 1) return mN(e, t, n);
  throw Error("Wrong number of arguments");
}
function cd(...e) {
  return gm(gN, e);
}
const gN = (e, t) => e.length >= t;
function ud(...e) {
  return gm(yN, e);
}
function yN(e, t) {
  if (!cd(t, 1)) return { ...e };
  if (!cd(t, 2)) {
    let { [t[0]]: r, ...i } = e;
    return i;
  }
  let n = { ...e };
  for (let r of t) delete n[r];
  return n;
}
const dd = (function() {
  const e = async function(n) {
    try {
      const r = new MediaRecorder(n, {
        mimeType: "audio/webm;codecs=opus"
      }), i = [];
      return new Promise((o, s) => {
        r.ondataavailable = (a) => {
          a.data.size > 0 && i.push(a.data);
        }, r.onstop = () => {
          const a = new Blob(i, { type: "audio/webm" });
          o(a);
        }, r.onerror = () => {
          s(new Error("MediaRecorder error occurred"));
        }, r.start(1e3), e.currentRecorder = r;
      });
    } catch (r) {
      const i = r instanceof Error ? r.message : "Unknown error occurred";
      throw new Error("Failed to start recording: " + i);
    }
  };
  return e.stop = () => {
    const t = e.currentRecorder;
    t && t.state !== "inactive" && t.stop(), delete e.currentRecorder;
  }, e;
})();
function vN({
  transcribeAudio: e,
  onTranscriptionComplete: t
}) {
  const [n, r] = ye(!1), [i, o] = ye(!!e), [s, a] = ye(!1), [l, c] = ye(!1), [u, d] = ye(null), h = ze(null);
  Ze(() => {
    (async () => {
      const y = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      o(y && !!e);
    })();
  }, [e]);
  const f = async () => {
    a(!1), c(!0);
    try {
      dd.stop();
      const p = await h.current;
      if (e) {
        const y = await e(p);
        t?.(y);
      }
    } catch (p) {
      console.error("Error transcribing audio:", p);
    } finally {
      c(!1), r(!1), u && (u.getTracks().forEach((p) => p.stop()), d(null)), h.current = null;
    }
  };
  return {
    isListening: n,
    isSpeechSupported: i,
    isRecording: s,
    isTranscribing: l,
    audioStream: u,
    toggleListening: async () => {
      if (n)
        await f();
      else
        try {
          r(!0), a(!0);
          const p = await navigator.mediaDevices.getUserMedia({
            audio: !0
          });
          d(p), h.current = dd(p);
        } catch (p) {
          console.error("Error recording audio:", p), r(!1), a(!1), u && (u.getTracks().forEach((y) => y.stop()), d(null));
        }
    },
    stopRecording: f
  };
}
function bN({
  ref: e,
  maxHeight: t = Number.MAX_SAFE_INTEGER,
  borderWidth: n = 0,
  dependencies: r
}) {
  const i = ze(null);
  Ys(() => {
    if (!e.current) return;
    const o = e.current, s = n * 2;
    i.current === null && (i.current = o.scrollHeight - s), o.style.removeProperty("height");
    const a = o.scrollHeight, l = Math.min(a, t), c = Math.max(l, i.current);
    o.style.height = `${c + s}px`;
  }, [t, e, ...r]);
}
const Jt = {
  FFT_SIZE: 512,
  SMOOTHING: 0.8,
  MIN_BAR_HEIGHT: 2,
  MIN_BAR_WIDTH: 2,
  BAR_SPACING: 1,
  COLOR: {
    MIN_INTENSITY: 100,
    // Minimum gray value (darker)
    MAX_INTENSITY: 255,
    // Maximum gray value (brighter)
    INTENSITY_RANGE: 155
    // MAX_INTENSITY - MIN_INTENSITY
  }
};
function xN({
  stream: e,
  isRecording: t,
  onClick: n
}) {
  const r = ze(null), i = ze(null), o = ze(null), s = ze(null), a = ze(null), l = () => {
    s.current && cancelAnimationFrame(s.current), i.current && i.current.close();
  };
  Ze(() => l, []), Ze(() => {
    e && t ? c() : l();
  }, [e, t]), Ze(() => {
    const f = () => {
      if (r.current && a.current) {
        const m = a.current, p = r.current, y = window.devicePixelRatio || 1, g = m.getBoundingClientRect();
        p.width = (g.width - 2) * y, p.height = (g.height - 2) * y, p.style.width = `${g.width - 2}px`, p.style.height = `${g.height - 2}px`;
      }
    };
    return window.addEventListener("resize", f), f(), () => window.removeEventListener("resize", f);
  }, []);
  const c = async () => {
    try {
      const f = new AudioContext();
      i.current = f;
      const m = f.createAnalyser();
      m.fftSize = Jt.FFT_SIZE, m.smoothingTimeConstant = Jt.SMOOTHING, o.current = m, f.createMediaStreamSource(e).connect(m), h();
    } catch (f) {
      console.error("Error starting visualization:", f);
    }
  }, u = (f) => {
    const m = Math.floor(f * Jt.COLOR.INTENSITY_RANGE) + Jt.COLOR.MIN_INTENSITY;
    return `rgb(${m}, ${m}, ${m})`;
  }, d = (f, m, p, y, g, x) => {
    f.fillStyle = x, f.fillRect(m, p - g, y, g), f.fillRect(m, p, y, g);
  }, h = () => {
    if (!t) return;
    const f = r.current, m = f?.getContext("2d");
    if (!f || !m || !o.current) return;
    const p = window.devicePixelRatio || 1;
    m.scale(p, p);
    const y = o.current, g = y.frequencyBinCount, x = new Uint8Array(g), w = () => {
      s.current = requestAnimationFrame(w), y.getByteFrequencyData(x), m.clearRect(0, 0, f.width / p, f.height / p);
      const P = Math.max(
        Jt.MIN_BAR_WIDTH,
        f.width / p / g - Jt.BAR_SPACING
      ), E = f.height / p / 2;
      let C = 0;
      for (let A = 0; A < g; A++) {
        const N = x[A] / 255, L = Math.max(
          Jt.MIN_BAR_HEIGHT,
          N * E
        );
        d(
          m,
          C,
          E,
          P,
          L,
          u(N)
        ), C += P + Jt.BAR_SPACING;
      }
    };
    w();
  };
  return /* @__PURE__ */ v(
    "div",
    {
      ref: a,
      className: "h-full w-full cursor-pointer rounded-lg bg-background/80 backdrop-blur",
      onClick: n,
      children: /* @__PURE__ */ v("canvas", { ref: r, className: "h-full w-full" })
    }
  );
}
function wN({ isOpen: e, close: t }) {
  return /* @__PURE__ */ v(Ui, { children: e && /* @__PURE__ */ _(
    zt.div,
    {
      initial: { top: 0, filter: "blur(5px)" },
      animate: {
        top: -40,
        filter: "blur(0px)",
        transition: {
          type: "spring",
          filter: { type: "tween" }
        }
      },
      exit: { top: 0, filter: "blur(5px)" },
      className: "absolute left-1/2 flex -translate-x-1/2 overflow-hidden whitespace-nowrap rounded-full border bg-background py-1 text-center text-sm text-muted-foreground",
      children: [
        /* @__PURE__ */ v("span", { className: "ml-2.5", children: "Press Enter again to interrupt" }),
        /* @__PURE__ */ v(
          "button",
          {
            className: "ml-1 mr-2.5 flex items-center",
            type: "button",
            onClick: t,
            "aria-label": "Close",
            children: /* @__PURE__ */ v(tr, { className: "h-3 w-3" })
          }
        )
      ]
    }
  ) });
}
function ym({
  placeholder: e = "Ask AI...",
  className: t,
  onKeyDown: n,
  submitOnEnter: r = !0,
  stop: i,
  isGenerating: o,
  enableInterrupt: s = !0,
  transcribeAudio: a,
  ...l
}) {
  const [c, u] = ye(!1), [d, h] = ye(!1), {
    isListening: f,
    isSpeechSupported: m,
    isRecording: p,
    isTranscribing: y,
    audioStream: g,
    toggleListening: x,
    stopRecording: w
  } = vN({
    transcribeAudio: a,
    onTranscriptionComplete: (R) => {
      l.onChange?.({ target: { value: R } });
    }
  });
  Ze(() => {
    o || h(!1);
  }, [o]);
  const P = (R) => {
    l.allowAttachments && l.setFiles((M) => M === null ? R : R === null ? M : [...M, ...R]);
  }, E = (R) => {
    l.allowAttachments === !0 && (R.preventDefault(), u(!0));
  }, C = (R) => {
    l.allowAttachments === !0 && (R.preventDefault(), u(!1));
  }, A = (R) => {
    if (u(!1), l.allowAttachments !== !0) return;
    R.preventDefault();
    const M = R.dataTransfer;
    M.files.length && P(Array.from(M.files));
  }, N = (R) => {
    const M = R.clipboardData?.items;
    if (!M) return;
    const B = R.clipboardData.getData("text");
    if (B && B.length > 500 && l.allowAttachments) {
      R.preventDefault();
      const $ = new Blob([B], { type: "text/plain" }), U = new File([$], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now()
      });
      P([U]);
      return;
    }
    const z = Array.from(M).map(($) => $.getAsFile()).filter(($) => $ !== null);
    l.allowAttachments && z.length > 0 && P(z);
  }, L = (R) => {
    if (r && R.key === "Enter" && !R.shiftKey) {
      if (R.preventDefault(), o && i && s) {
        if (d)
          i(), h(!1), R.currentTarget.form?.requestSubmit();
        else if (l.value || l.allowAttachments && l.files?.length) {
          h(!0);
          return;
        }
      }
      R.currentTarget.form?.requestSubmit();
    }
    n?.(R);
  }, T = ze(null), [O, I] = ye(0);
  Ze(() => {
    T.current && I(T.current.offsetHeight);
  }, [l.value]);
  const W = l.allowAttachments && l.files && l.files.length > 0;
  return bN({
    ref: T,
    maxHeight: 240,
    borderWidth: 1,
    dependencies: [l.value, W]
  }), /* @__PURE__ */ _(
    "div",
    {
      className: "relative flex w-full",
      onDragOver: E,
      onDragLeave: C,
      onDrop: A,
      children: [
        s && /* @__PURE__ */ v(
          wN,
          {
            isOpen: d,
            close: () => h(!1)
          }
        ),
        /* @__PURE__ */ v(
          TN,
          {
            isVisible: p,
            onStopRecording: w
          }
        ),
        /* @__PURE__ */ v("div", { className: "relative flex w-full items-center space-x-2", children: /* @__PURE__ */ _("div", { className: "relative flex-1 group/input", children: [
          /* @__PURE__ */ v(
            "textarea",
            {
              "aria-label": "Write your prompt here",
              placeholder: e,
              ref: T,
              onPaste: N,
              onKeyDown: L,
              className: ie(
                "z-10 w-full grow border border-muted-foreground border-2 resize-none rounded-2xl border-none bg-muted/80 backdrop-blur-xl p-4 pr-32 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xl shadow-primary/5",
                W && "pb-20",
                t
              ),
              ...l.allowAttachments ? ud(l, ["allowAttachments", "files", "setFiles"]) : ud(l, ["allowAttachments"])
            }
          ),
          l.allowAttachments && W && /* @__PURE__ */ v("div", { className: "absolute inset-x-3 bottom-0 z-20 overflow-x-scroll py-3", children: /* @__PURE__ */ v("div", { className: "flex space-x-3", children: /* @__PURE__ */ v(Ui, { mode: "popLayout", children: l.files?.map((R) => /* @__PURE__ */ v(
            Oa,
            {
              file: R,
              onRemove: () => {
                l.setFiles((M) => {
                  if (!M) return null;
                  const B = Array.from(M).filter(
                    (z) => z !== R
                  );
                  return B.length === 0 ? null : B;
                });
              }
            },
            R.name + String(R.lastModified)
          )) }) }) })
        ] }) }),
        /* @__PURE__ */ _("div", { className: "absolute right-3 bottom-3 z-20 flex items-center gap-2", children: [
          l.allowAttachments && /* @__PURE__ */ v(
            et,
            {
              type: "button",
              size: "icon",
              variant: "ghost",
              className: "h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-xl",
              "aria-label": "Attach a file",
              onClick: async () => {
                const R = await kN();
                P(R);
              },
              children: /* @__PURE__ */ v(Pd, { className: "h-4.5 w-4.5" })
            }
          ),
          m && /* @__PURE__ */ v(
            et,
            {
              type: "button",
              variant: "ghost",
              className: ie("h-9 w-9 rounded-xl", f ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"),
              "aria-label": "Voice input",
              size: "icon",
              onClick: x,
              children: /* @__PURE__ */ v(Ig, { className: "h-4.5 w-4.5" })
            }
          ),
          o && i ? /* @__PURE__ */ v(
            et,
            {
              type: "button",
              size: "icon",
              className: "h-9 w-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 ring-1 ring-destructive/20",
              "aria-label": "Stop generating",
              onClick: i,
              children: /* @__PURE__ */ v(Og, { className: "h-3 w-3", fill: "currentColor" })
            }
          ) : /* @__PURE__ */ v(
            et,
            {
              type: "submit",
              size: "icon",
              className: ie(
                "h-9 w-9 rounded-xl transition-all shadow-md active:scale-95",
                l.value === "" ? "bg-muted text-muted-foreground" : "bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground hover:shadow-primary/20"
              ),
              "aria-label": "Send message",
              disabled: l.value === "" || o,
              children: /* @__PURE__ */ v(xg, { className: "h-5 w-5" })
            }
          )
        ] }),
        l.allowAttachments && /* @__PURE__ */ v(SN, { isDragging: c }),
        /* @__PURE__ */ v(
          EN,
          {
            isRecording: p,
            isTranscribing: y,
            audioStream: g,
            textAreaHeight: O,
            onStopRecording: w
          }
        )
      ]
    }
  );
}
ym.displayName = "MessageInput";
function SN({ isDragging: e }) {
  return /* @__PURE__ */ v(Ui, { children: e && /* @__PURE__ */ _(
    zt.div,
    {
      className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      "aria-hidden": !0,
      children: [
        /* @__PURE__ */ v(Pd, { className: "h-4 w-4" }),
        /* @__PURE__ */ v("span", { children: "Drop your files here to attach them." })
      ]
    }
  ) });
}
function kN() {
  const e = document.createElement("input");
  return e.type = "file", e.multiple = !0, e.accept = "*/*", e.click(), new Promise((t) => {
    e.onchange = (n) => {
      const r = n.currentTarget.files;
      if (r) {
        t(Array.from(r));
        return;
      }
      t(null);
    };
  });
}
function CN() {
  return /* @__PURE__ */ _(
    zt.div,
    {
      className: "flex h-full w-full flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      children: [
        /* @__PURE__ */ _("div", { className: "relative", children: [
          /* @__PURE__ */ v(Ed, { className: "h-8 w-8 animate-spin text-primary" }),
          /* @__PURE__ */ v(
            zt.div,
            {
              className: "absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-primary/20",
              initial: { scale: 0.8, opacity: 0 },
              animate: { scale: 1.2, opacity: 1 },
              transition: {
                duration: 1,
                repeat: 1 / 0,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }
          )
        ] }),
        /* @__PURE__ */ v("p", { className: "mt-4 text-sm font-medium text-muted-foreground", children: "Transcribing audio..." })
      ]
    }
  );
}
function TN({ isVisible: e, onStopRecording: t }) {
  return /* @__PURE__ */ v(Ui, { children: e && /* @__PURE__ */ v(
    zt.div,
    {
      initial: { top: 0, filter: "blur(5px)" },
      animate: {
        top: -40,
        filter: "blur(0px)",
        transition: {
          type: "spring",
          filter: { type: "tween" }
        }
      },
      exit: { top: 0, filter: "blur(5px)" },
      className: "absolute left-1/2 flex -translate-x-1/2 cursor-pointer overflow-hidden whitespace-nowrap rounded-full border bg-background py-1 text-center text-sm text-muted-foreground",
      onClick: t,
      children: /* @__PURE__ */ _("span", { className: "mx-2.5 flex items-center", children: [
        /* @__PURE__ */ v(Ag, { className: "mr-2 h-3 w-3" }),
        "Click to finish recording"
      ] })
    }
  ) });
}
function EN({
  isRecording: e,
  isTranscribing: t,
  audioStream: n,
  textAreaHeight: r,
  onStopRecording: i
}) {
  return e ? /* @__PURE__ */ v(
    "div",
    {
      className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
      style: { height: r - 2 },
      children: /* @__PURE__ */ v(
        xN,
        {
          stream: n,
          isRecording: e,
          onClick: i
        }
      )
    }
  ) : t ? /* @__PURE__ */ v(
    "div",
    {
      className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
      style: { height: r - 2 },
      children: /* @__PURE__ */ v(CN, {})
    }
  ) : null;
}
function PN() {
  return /* @__PURE__ */ v("div", { className: "justify-left flex space-x-1", children: /* @__PURE__ */ v("div", { className: "rounded-lg bg-muted p-3", children: /* @__PURE__ */ _("div", { className: "flex -space-x-2.5", children: [
    /* @__PURE__ */ v(wo, { className: "h-5 w-5 animate-typing-dot-bounce" }),
    /* @__PURE__ */ v(wo, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:90ms]" }),
    /* @__PURE__ */ v(wo, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:180ms]" })
  ] }) }) });
}
function AN({
  messages: e,
  showTimeStamps: t = !0,
  isTyping: n = !1,
  messageOptions: r
}) {
  return /* @__PURE__ */ _("div", { className: "space-y-4 overflow-visible", children: [
    e.map((i, o) => {
      const s = typeof r == "function" ? r(i) : r;
      return /* @__PURE__ */ v(
        fN,
        {
          showTimeStamp: t,
          ...i,
          ...s
        },
        o
      );
    }),
    n && /* @__PURE__ */ v(PN, {})
  ] });
}
const fd = [Ng, ji, Dg, Cg];
function RN({
  label: e,
  append: t,
  suggestions: n
}) {
  return /* @__PURE__ */ _("div", { className: "flex h-full flex-col items-center justify-center space-y-12 px-4 py-20 animate-in fade-in zoom-in-95 duration-700", children: [
    /* @__PURE__ */ _("div", { className: "space-y-6 text-center max-w-2xl", children: [
      /* @__PURE__ */ v("div", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent shadow-inner mb-8 ring-1 ring-primary/20", children: /* @__PURE__ */ v(ji, { className: "h-10 w-10 text-primary animate-pulse" }) }),
      /* @__PURE__ */ _("div", { className: "space-y-2", children: [
        /* @__PURE__ */ v("h2", { className: "text-4xl font-black tracking-tight sm:text-6xl bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent", children: e || "How can I help you today?" }),
        /* @__PURE__ */ v("p", { className: "text-lg text-muted-foreground/80 leading-relaxed max-w-lg mx-auto", children: "Experience the power of our specialized RCM agents. Choose a task below to get started immediately." })
      ] })
    ] }),
    /* @__PURE__ */ v("div", { className: "grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:mx-auto", children: n.map((r, i) => {
      const o = fd[i % fd.length];
      return /* @__PURE__ */ _(
        "button",
        {
          onClick: () => t({ role: "user", content: r }),
          className: ie(
            "group relative flex flex-row items-center gap-5 rounded-2xl border bg-card/40 p-6 text-left transition-all duration-500 backdrop-blur-sm",
            "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/60",
            "border-border/40 active:scale-[0.98] overflow-hidden"
          ),
          children: [
            /* @__PURE__ */ v("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
            /* @__PURE__ */ v("div", { className: "relative flex flex-shrink-0 h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-lg", children: /* @__PURE__ */ v(o, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ _("div", { className: "relative flex-1 space-y-1.5", children: [
              /* @__PURE__ */ v("p", { className: "font-bold text-[17px] text-foreground group-hover:text-primary transition-colors leading-tight", children: r }),
              /* @__PURE__ */ _("p", { className: "text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5", children: [
                "Click to start this task ",
                /* @__PURE__ */ v(Td, { className: "h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" })
              ] })
            ] })
          ]
        },
        r
      );
    }) })
  ] });
}
function vm({
  messages: e,
  handleSubmit: t,
  input: n,
  handleInputChange: r,
  stop: i,
  isGenerating: o,
  append: s,
  suggestions: a,
  className: l,
  onRateResponse: c,
  setMessages: u,
  transcribeAudio: d,
  placeholder: h
}) {
  const f = e.at(-1), m = e.length === 0, p = f?.role === "user", y = ze(e);
  y.current = e;
  const g = wn(() => {
    if (i?.(), !u) return;
    const w = [...y.current], P = w.findLast(
      (A) => A.role === "assistant"
    );
    if (!P) return;
    let E = !1, C = { ...P };
    if (P.toolInvocations) {
      const A = P.toolInvocations.map(
        (N) => N.state === "call" ? (E = !0, {
          ...N,
          state: "result",
          result: {
            content: "Tool execution was cancelled",
            __cancelled: !0
            // Special marker to indicate cancellation
          }
        }) : N
      );
      E && (C = {
        ...C,
        toolInvocations: A
      });
    }
    if (P.parts && P.parts.length > 0) {
      const A = P.parts.map((N) => N.type === "tool-invocation" && N.toolInvocation && N.toolInvocation.state === "call" ? (E = !0, {
        ...N,
        toolInvocation: {
          ...N.toolInvocation,
          state: "result",
          result: {
            content: "Tool execution was cancelled",
            __cancelled: !0
          }
        }
      }) : N);
      E && (C = {
        ...C,
        parts: A
      });
    }
    if (E) {
      const A = w.findIndex(
        (N) => N.id === P.id
      );
      A !== -1 && (w[A] = C, u(w));
    }
  }, [i, u, y]), x = wn(
    (w) => ({
      actions: c ? /* @__PURE__ */ _(Vt, { children: [
        /* @__PURE__ */ v("div", { className: "border-r pr-1", children: /* @__PURE__ */ v(
          Di,
          {
            content: w.content,
            copyMessage: "Copied response to clipboard!"
          }
        ) }),
        /* @__PURE__ */ v(
          et,
          {
            size: "icon",
            variant: "ghost",
            className: "h-6 w-6",
            onClick: () => c(w.id, "thumbs-up"),
            children: /* @__PURE__ */ v(Fg, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ v(
          et,
          {
            size: "icon",
            variant: "ghost",
            className: "h-6 w-6",
            onClick: () => c(w.id, "thumbs-down"),
            children: /* @__PURE__ */ v(_g, { className: "h-4 w-4" })
          }
        )
      ] }) : /* @__PURE__ */ v(
        Di,
        {
          content: w.content,
          copyMessage: "Copied response to clipboard!"
        }
      )
    }),
    [c]
  );
  return /* @__PURE__ */ _(bm, { className: ie(l, "relative"), children: [
    /* @__PURE__ */ v("div", { className: "flex flex-1 flex-col overflow-hidden", children: m && s && a ? /* @__PURE__ */ v("div", { className: "flex h-full flex-col justify-center overflow-y-auto", children: /* @__PURE__ */ v(
      RN,
      {
        label: "",
        append: s,
        suggestions: a
      }
    ) }) : e.length > 0 ? /* @__PURE__ */ v(NN, { messages: e, className: "flex-1 w-full px-4 pt-8", children: /* @__PURE__ */ _("div", { className: "max-w-4xl mx-auto w-full", children: [
      /* @__PURE__ */ v(
        AN,
        {
          messages: e,
          isTyping: p,
          messageOptions: x
        }
      ),
      s && a && a.length > 0 && !o && /* @__PURE__ */ v("div", { className: "mt-6 flex flex-wrap gap-2 pb-8", children: a.map((w) => /* @__PURE__ */ v(
        et,
        {
          variant: "outline",
          size: "sm",
          className: "rounded-xl bg-background/50 backdrop-blur-sm text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-primary/20 hover:border-primary shadow-sm",
          onClick: () => s({ role: "user", content: w }),
          children: w
        },
        w
      )) })
    ] }) }) : /* @__PURE__ */ v("div", { className: "flex-1" }) }),
    /* @__PURE__ */ v("div", { className: "w-full max-w-4xl mx-auto px-4 pb-6", children: /* @__PURE__ */ v(
      xm,
      {
        className: "relative",
        isPending: o || p,
        handleSubmit: t,
        children: ({ files: w, setFiles: P }) => /* @__PURE__ */ v(
          ym,
          {
            value: n,
            onChange: r,
            allowAttachments: !0,
            files: w,
            setFiles: P,
            stop: g,
            isGenerating: o,
            transcribeAudio: d,
            placeholder: h
          }
        )
      }
    ) })
  ] });
}
vm.displayName = "Chat";
function NN({
  messages: e,
  children: t,
  className: n
}) {
  const {
    containerRef: r,
    scrollToBottom: i,
    handleScroll: o,
    shouldAutoScroll: s,
    handleTouchStart: a
  } = vy([e]);
  return /* @__PURE__ */ _(
    "div",
    {
      className: ie("grid grid-cols-1 overflow-y-auto pb-4", n),
      ref: r,
      onScroll: o,
      onTouchStart: a,
      children: [
        /* @__PURE__ */ v("div", { className: "max-w-full [grid-column:1/1] [grid-row:1/1]", children: t }),
        !s && /* @__PURE__ */ v("div", { className: "pointer-events-none flex flex-1 items-end justify-end [grid-column:1/1] [grid-row:1/1]", children: /* @__PURE__ */ v("div", { className: "sticky bottom-0 left-0 flex w-full justify-end", children: /* @__PURE__ */ v(
          et,
          {
            onClick: i,
            className: "pointer-events-auto h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1",
            size: "icon",
            variant: "ghost",
            children: /* @__PURE__ */ v(bg, { className: "h-4 w-4" })
          }
        ) }) })
      ]
    }
  );
}
const bm = Qn(({ className: e, ...t }, n) => /* @__PURE__ */ v(
  "div",
  {
    ref: n,
    className: ie("grid h-full w-full grid-rows-[1fr_auto]", e),
    ...t
  }
));
bm.displayName = "ChatContainer";
const xm = Qn(
  ({ children: e, handleSubmit: t, className: n }, r) => {
    const [i, o] = ye(null);
    return /* @__PURE__ */ v("form", { ref: r, onSubmit: (a) => {
      if (!i) {
        t(a);
        return;
      }
      const l = IN(i);
      t(a, { experimental_attachments: l }), o(null);
    }, className: n, children: e({ files: i, setFiles: o }) });
  }
);
xm.displayName = "ChatForm";
function IN(e) {
  const t = new DataTransfer();
  for (const n of Array.from(e))
    t.items.add(n);
  return t.files;
}
function hd(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
// @__NO_SIDE_EFFECTS__
function pd(e) {
  const t = /* @__PURE__ */ DN(e), n = b.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = b.Children.toArray(o), l = a.find(ON);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? b.Children.count(c) > 1 ? b.Children.only(null) : b.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ v(t, { ...s, ref: i, children: b.isValidElement(c) ? b.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ v(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function DN(e) {
  const t = b.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (b.isValidElement(i)) {
      const s = _N(i), a = LN(o, i.props);
      return i.type !== b.Fragment && (a.ref = r ? An(r, s) : s), b.cloneElement(i, a);
    }
    return b.Children.count(i) > 1 ? b.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var MN = /* @__PURE__ */ Symbol("radix.slottable");
function ON(e) {
  return b.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === MN;
}
function LN(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], o = t[r];
    /^on[A-Z]/.test(r) ? i && o ? n[r] = (...a) => {
      const l = o(...a);
      return i(...a), l;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...o } : r === "className" && (n[r] = [i, o].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function _N(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function FN(e) {
  const t = e + "CollectionProvider", [n, r] = sr(t), [i, o] = n(
    t,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), s = (p) => {
    const { scope: y, children: g } = p, x = V.useRef(null), w = V.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ v(i, { scope: y, itemMap: w, collectionRef: x, children: g });
  };
  s.displayName = t;
  const a = e + "CollectionSlot", l = /* @__PURE__ */ pd(a), c = V.forwardRef(
    (p, y) => {
      const { scope: g, children: x } = p, w = o(a, g), P = Re(y, w.collectionRef);
      return /* @__PURE__ */ v(l, { ref: P, children: x });
    }
  );
  c.displayName = a;
  const u = e + "CollectionItemSlot", d = "data-radix-collection-item", h = /* @__PURE__ */ pd(u), f = V.forwardRef(
    (p, y) => {
      const { scope: g, children: x, ...w } = p, P = V.useRef(null), E = Re(y, P), C = o(u, g);
      return V.useEffect(() => (C.itemMap.set(P, { ref: P, ...w }), () => {
        C.itemMap.delete(P);
      })), /* @__PURE__ */ v(h, { [d]: "", ref: E, children: x });
    }
  );
  f.displayName = u;
  function m(p) {
    const y = o(e + "CollectionConsumer", p);
    return V.useCallback(() => {
      const x = y.collectionRef.current;
      if (!x) return [];
      const w = Array.from(x.querySelectorAll(`[${d}]`));
      return Array.from(y.itemMap.values()).sort(
        (C, A) => w.indexOf(C.ref.current) - w.indexOf(A.ref.current)
      );
    }, [y.collectionRef, y.itemMap]);
  }
  return [
    { Provider: s, Slot: c, ItemSlot: f },
    m,
    r
  ];
}
var VN = b.createContext(void 0);
function BN(e) {
  const t = b.useContext(VN);
  return e || t || "ltr";
}
// @__NO_SIDE_EFFECTS__
function zN(e) {
  const t = /* @__PURE__ */ jN(e), n = b.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = b.Children.toArray(o), l = a.find(UN);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? b.Children.count(c) > 1 ? b.Children.only(null) : b.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ v(t, { ...s, ref: i, children: b.isValidElement(c) ? b.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ v(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function jN(e) {
  const t = b.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (b.isValidElement(i)) {
      const s = WN(i), a = HN(o, i.props);
      return i.type !== b.Fragment && (a.ref = r ? An(r, s) : s), b.cloneElement(i, a);
    }
    return b.Children.count(i) > 1 ? b.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var $N = /* @__PURE__ */ Symbol("radix.slottable");
function UN(e) {
  return b.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === $N;
}
function HN(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], o = t[r];
    /^on[A-Z]/.test(r) ? i && o ? n[r] = (...a) => {
      const l = o(...a);
      return i(...a), l;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...o } : r === "className" && (n[r] = [i, o].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function WN(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function qN(e) {
  const t = b.useRef({ value: e, previous: e });
  return b.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
var wm = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
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
}), KN = "VisuallyHidden", GN = b.forwardRef(
  (e, t) => /* @__PURE__ */ v(
    me.span,
    {
      ...e,
      ref: t,
      style: { ...wm, ...e.style }
    }
  )
);
GN.displayName = KN;
var YN = [" ", "Enter", "ArrowUp", "ArrowDown"], XN = [" ", "Enter"], Tn = "Select", [po, mo, ZN] = FN(Tn), [dr] = sr(Tn, [
  ZN,
  lo
]), go = lo(), [JN, fn] = dr(Tn), [QN, eI] = dr(Tn), Sm = (e) => {
  const {
    __scopeSelect: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    value: s,
    defaultValue: a,
    onValueChange: l,
    dir: c,
    name: u,
    autoComplete: d,
    disabled: h,
    required: f,
    form: m
  } = e, p = go(t), [y, g] = b.useState(null), [x, w] = b.useState(null), [P, E] = b.useState(!1), C = BN(c), [A, N] = Lr({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Tn
  }), [L, T] = Lr({
    prop: s,
    defaultProp: a,
    onChange: l,
    caller: Tn
  }), O = b.useRef(null), I = y ? m || !!y.closest("form") : !0, [W, R] = b.useState(/* @__PURE__ */ new Set()), M = Array.from(W).map((B) => B.props.value).join(";");
  return /* @__PURE__ */ v(Gp, { ...p, children: /* @__PURE__ */ _(
    JN,
    {
      required: f,
      scope: t,
      trigger: y,
      onTriggerChange: g,
      valueNode: x,
      onValueNodeChange: w,
      valueNodeHasChildren: P,
      onValueNodeHasChildrenChange: E,
      contentId: tn(),
      value: L,
      onValueChange: T,
      open: A,
      onOpenChange: N,
      dir: C,
      triggerPointerDownPosRef: O,
      disabled: h,
      children: [
        /* @__PURE__ */ v(po.Provider, { scope: t, children: /* @__PURE__ */ v(
          QN,
          {
            scope: e.__scopeSelect,
            onNativeOptionAdd: b.useCallback((B) => {
              R((z) => new Set(z).add(B));
            }, []),
            onNativeOptionRemove: b.useCallback((B) => {
              R((z) => {
                const $ = new Set(z);
                return $.delete(B), $;
              });
            }, []),
            children: n
          }
        ) }),
        I ? /* @__PURE__ */ _(
          Hm,
          {
            "aria-hidden": !0,
            required: f,
            tabIndex: -1,
            name: u,
            autoComplete: d,
            value: L,
            onChange: (B) => T(B.target.value),
            disabled: h,
            form: m,
            children: [
              L === void 0 ? /* @__PURE__ */ v("option", { value: "" }) : null,
              Array.from(W)
            ]
          },
          M
        ) : null
      ]
    }
  ) });
};
Sm.displayName = Tn;
var km = "SelectTrigger", Cm = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, disabled: r = !1, ...i } = e, o = go(n), s = fn(km, n), a = s.disabled || r, l = Re(t, s.onTriggerChange), c = mo(n), u = b.useRef("touch"), [d, h, f] = qm((p) => {
      const y = c().filter((w) => !w.disabled), g = y.find((w) => w.value === s.value), x = Km(y, p, g);
      x !== void 0 && s.onValueChange(x.value);
    }), m = (p) => {
      a || (s.onOpenChange(!0), f()), p && (s.triggerPointerDownPosRef.current = {
        x: Math.round(p.pageX),
        y: Math.round(p.pageY)
      });
    };
    return /* @__PURE__ */ v(ll, { asChild: !0, ...o, children: /* @__PURE__ */ v(
      me.button,
      {
        type: "button",
        role: "combobox",
        "aria-controls": s.contentId,
        "aria-expanded": s.open,
        "aria-required": s.required,
        "aria-autocomplete": "none",
        dir: s.dir,
        "data-state": s.open ? "open" : "closed",
        disabled: a,
        "data-disabled": a ? "" : void 0,
        "data-placeholder": Wm(s.value) ? "" : void 0,
        ...i,
        ref: l,
        onClick: pe(i.onClick, (p) => {
          p.currentTarget.focus(), u.current !== "mouse" && m(p);
        }),
        onPointerDown: pe(i.onPointerDown, (p) => {
          u.current = p.pointerType;
          const y = p.target;
          y.hasPointerCapture(p.pointerId) && y.releasePointerCapture(p.pointerId), p.button === 0 && p.ctrlKey === !1 && p.pointerType === "mouse" && (m(p), p.preventDefault());
        }),
        onKeyDown: pe(i.onKeyDown, (p) => {
          const y = d.current !== "";
          !(p.ctrlKey || p.altKey || p.metaKey) && p.key.length === 1 && h(p.key), !(y && p.key === " ") && YN.includes(p.key) && (m(), p.preventDefault());
        })
      }
    ) });
  }
);
Cm.displayName = km;
var Tm = "SelectValue", Em = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, children: o, placeholder: s = "", ...a } = e, l = fn(Tm, n), { onValueNodeHasChildrenChange: c } = l, u = o !== void 0, d = Re(t, l.onValueNodeChange);
    return Ue(() => {
      c(u);
    }, [c, u]), /* @__PURE__ */ v(
      me.span,
      {
        ...a,
        ref: d,
        style: { pointerEvents: "none" },
        children: Wm(l.value) ? /* @__PURE__ */ v(Vt, { children: s }) : o
      }
    );
  }
);
Em.displayName = Tm;
var tI = "SelectIcon", Pm = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, children: r, ...i } = e;
    return /* @__PURE__ */ v(me.span, { "aria-hidden": !0, ...i, ref: t, children: r || "▼" });
  }
);
Pm.displayName = tI;
var nI = "SelectPortal", Am = (e) => /* @__PURE__ */ v(co, { asChild: !0, ...e });
Am.displayName = nI;
var En = "SelectContent", Rm = b.forwardRef(
  (e, t) => {
    const n = fn(En, e.__scopeSelect), [r, i] = b.useState();
    if (Ue(() => {
      i(new DocumentFragment());
    }, []), !n.open) {
      const o = r;
      return o ? zi.createPortal(
        /* @__PURE__ */ v(Nm, { scope: e.__scopeSelect, children: /* @__PURE__ */ v(po.Slot, { scope: e.__scopeSelect, children: /* @__PURE__ */ v("div", { children: e.children }) }) }),
        o
      ) : null;
    }
    return /* @__PURE__ */ v(Im, { ...e, ref: t });
  }
);
Rm.displayName = En;
var xt = 10, [Nm, hn] = dr(En), rI = "SelectContentImpl", iI = /* @__PURE__ */ zN("SelectContent.RemoveScroll"), Im = b.forwardRef(
  (e, t) => {
    const {
      __scopeSelect: n,
      position: r = "item-aligned",
      onCloseAutoFocus: i,
      onEscapeKeyDown: o,
      onPointerDownOutside: s,
      //
      // PopperContent props
      side: a,
      sideOffset: l,
      align: c,
      alignOffset: u,
      arrowPadding: d,
      collisionBoundary: h,
      collisionPadding: f,
      sticky: m,
      hideWhenDetached: p,
      avoidCollisions: y,
      //
      ...g
    } = e, x = fn(En, n), [w, P] = b.useState(null), [E, C] = b.useState(null), A = Re(t, (H) => P(H)), [N, L] = b.useState(null), [T, O] = b.useState(
      null
    ), I = mo(n), [W, R] = b.useState(!1), M = b.useRef(!1);
    b.useEffect(() => {
      if (w) return cl(w);
    }, [w]), Qa();
    const B = b.useCallback(
      (H) => {
        const [re, ...fe] = I().map((q) => q.ref.current), [ne] = fe.slice(-1), se = document.activeElement;
        for (const q of H)
          if (q === se || (q?.scrollIntoView({ block: "nearest" }), q === re && E && (E.scrollTop = 0), q === ne && E && (E.scrollTop = E.scrollHeight), q?.focus(), document.activeElement !== se)) return;
      },
      [I, E]
    ), z = b.useCallback(
      () => B([N, w]),
      [B, N, w]
    );
    b.useEffect(() => {
      W && z();
    }, [W, z]);
    const { onOpenChange: $, triggerPointerDownPosRef: U } = x;
    b.useEffect(() => {
      if (w) {
        let H = { x: 0, y: 0 };
        const re = (ne) => {
          H = {
            x: Math.abs(Math.round(ne.pageX) - (U.current?.x ?? 0)),
            y: Math.abs(Math.round(ne.pageY) - (U.current?.y ?? 0))
          };
        }, fe = (ne) => {
          H.x <= 10 && H.y <= 10 ? ne.preventDefault() : w.contains(ne.target) || $(!1), document.removeEventListener("pointermove", re), U.current = null;
        };
        return U.current !== null && (document.addEventListener("pointermove", re), document.addEventListener("pointerup", fe, { capture: !0, once: !0 })), () => {
          document.removeEventListener("pointermove", re), document.removeEventListener("pointerup", fe, { capture: !0 });
        };
      }
    }, [w, $, U]), b.useEffect(() => {
      const H = () => $(!1);
      return window.addEventListener("blur", H), window.addEventListener("resize", H), () => {
        window.removeEventListener("blur", H), window.removeEventListener("resize", H);
      };
    }, [$]);
    const [S, oe] = qm((H) => {
      const re = I().filter((se) => !se.disabled), fe = re.find((se) => se.ref.current === document.activeElement), ne = Km(re, H, fe);
      ne && setTimeout(() => ne.ref.current.focus());
    }), X = b.useCallback(
      (H, re, fe) => {
        const ne = !M.current && !fe;
        (x.value !== void 0 && x.value === re || ne) && (L(H), ne && (M.current = !0));
      },
      [x.value]
    ), k = b.useCallback(() => w?.focus(), [w]), G = b.useCallback(
      (H, re, fe) => {
        const ne = !M.current && !fe;
        (x.value !== void 0 && x.value === re || ne) && O(H);
      },
      [x.value]
    ), ue = r === "popper" ? Us : Dm, ce = ue === Us ? {
      side: a,
      sideOffset: l,
      align: c,
      alignOffset: u,
      arrowPadding: d,
      collisionBoundary: h,
      collisionPadding: f,
      sticky: m,
      hideWhenDetached: p,
      avoidCollisions: y
    } : {};
    return /* @__PURE__ */ v(
      Nm,
      {
        scope: n,
        content: w,
        viewport: E,
        onViewportChange: C,
        itemRefCallback: X,
        selectedItem: N,
        onItemLeave: k,
        itemTextRefCallback: G,
        focusSelectedItem: z,
        selectedItemText: T,
        position: r,
        isPositioned: W,
        searchRef: S,
        children: /* @__PURE__ */ v(fo, { as: iI, allowPinchZoom: !0, children: /* @__PURE__ */ v(
          ro,
          {
            asChild: !0,
            trapped: x.open,
            onMountAutoFocus: (H) => {
              H.preventDefault();
            },
            onUnmountAutoFocus: pe(i, (H) => {
              x.trigger?.focus({ preventScroll: !0 }), H.preventDefault();
            }),
            children: /* @__PURE__ */ v(
              no,
              {
                asChild: !0,
                disableOutsidePointerEvents: !0,
                onEscapeKeyDown: o,
                onPointerDownOutside: s,
                onFocusOutside: (H) => H.preventDefault(),
                onDismiss: () => x.onOpenChange(!1),
                children: /* @__PURE__ */ v(
                  ue,
                  {
                    role: "listbox",
                    id: x.contentId,
                    "data-state": x.open ? "open" : "closed",
                    dir: x.dir,
                    onContextMenu: (H) => H.preventDefault(),
                    ...g,
                    ...ce,
                    onPlaced: () => R(!0),
                    ref: A,
                    style: {
                      // flex layout so we can place the scroll buttons properly
                      display: "flex",
                      flexDirection: "column",
                      // reset the outline by default as the content MAY get focused
                      outline: "none",
                      ...g.style
                    },
                    onKeyDown: pe(g.onKeyDown, (H) => {
                      const re = H.ctrlKey || H.altKey || H.metaKey;
                      if (H.key === "Tab" && H.preventDefault(), !re && H.key.length === 1 && oe(H.key), ["ArrowUp", "ArrowDown", "Home", "End"].includes(H.key)) {
                        let ne = I().filter((se) => !se.disabled).map((se) => se.ref.current);
                        if (["ArrowUp", "End"].includes(H.key) && (ne = ne.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(H.key)) {
                          const se = H.target, q = ne.indexOf(se);
                          ne = ne.slice(q + 1);
                        }
                        setTimeout(() => B(ne)), H.preventDefault();
                      }
                    })
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
Im.displayName = rI;
var oI = "SelectItemAlignedPosition", Dm = b.forwardRef((e, t) => {
  const { __scopeSelect: n, onPlaced: r, ...i } = e, o = fn(En, n), s = hn(En, n), [a, l] = b.useState(null), [c, u] = b.useState(null), d = Re(t, (A) => u(A)), h = mo(n), f = b.useRef(!1), m = b.useRef(!0), { viewport: p, selectedItem: y, selectedItemText: g, focusSelectedItem: x } = s, w = b.useCallback(() => {
    if (o.trigger && o.valueNode && a && c && p && y && g) {
      const A = o.trigger.getBoundingClientRect(), N = c.getBoundingClientRect(), L = o.valueNode.getBoundingClientRect(), T = g.getBoundingClientRect();
      if (o.dir !== "rtl") {
        const se = T.left - N.left, q = L.left - se, Q = A.left - q, we = A.width + Q, Ne = Math.max(we, N.width), ve = window.innerWidth - xt, be = hd(q, [
          xt,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(xt, ve - Ne)
        ]);
        a.style.minWidth = we + "px", a.style.left = be + "px";
      } else {
        const se = N.right - T.right, q = window.innerWidth - L.right - se, Q = window.innerWidth - A.right - q, we = A.width + Q, Ne = Math.max(we, N.width), ve = window.innerWidth - xt, be = hd(q, [
          xt,
          Math.max(xt, ve - Ne)
        ]);
        a.style.minWidth = we + "px", a.style.right = be + "px";
      }
      const O = h(), I = window.innerHeight - xt * 2, W = p.scrollHeight, R = window.getComputedStyle(c), M = parseInt(R.borderTopWidth, 10), B = parseInt(R.paddingTop, 10), z = parseInt(R.borderBottomWidth, 10), $ = parseInt(R.paddingBottom, 10), U = M + B + W + $ + z, S = Math.min(y.offsetHeight * 5, U), oe = window.getComputedStyle(p), X = parseInt(oe.paddingTop, 10), k = parseInt(oe.paddingBottom, 10), G = A.top + A.height / 2 - xt, ue = I - G, ce = y.offsetHeight / 2, H = y.offsetTop + ce, re = M + B + H, fe = U - re;
      if (re <= G) {
        const se = O.length > 0 && y === O[O.length - 1].ref.current;
        a.style.bottom = "0px";
        const q = c.clientHeight - p.offsetTop - p.offsetHeight, Q = Math.max(
          ue,
          ce + // viewport might have padding bottom, include it to avoid a scrollable viewport
          (se ? k : 0) + q + z
        ), we = re + Q;
        a.style.height = we + "px";
      } else {
        const se = O.length > 0 && y === O[0].ref.current;
        a.style.top = "0px";
        const Q = Math.max(
          G,
          M + p.offsetTop + // viewport might have padding top, include it to avoid a scrollable viewport
          (se ? X : 0) + ce
        ) + fe;
        a.style.height = Q + "px", p.scrollTop = re - G + p.offsetTop;
      }
      a.style.margin = `${xt}px 0`, a.style.minHeight = S + "px", a.style.maxHeight = I + "px", r?.(), requestAnimationFrame(() => f.current = !0);
    }
  }, [
    h,
    o.trigger,
    o.valueNode,
    a,
    c,
    p,
    y,
    g,
    o.dir,
    r
  ]);
  Ue(() => w(), [w]);
  const [P, E] = b.useState();
  Ue(() => {
    c && E(window.getComputedStyle(c).zIndex);
  }, [c]);
  const C = b.useCallback(
    (A) => {
      A && m.current === !0 && (w(), x?.(), m.current = !1);
    },
    [w, x]
  );
  return /* @__PURE__ */ v(
    aI,
    {
      scope: n,
      contentWrapper: a,
      shouldExpandOnScrollRef: f,
      onScrollButtonChange: C,
      children: /* @__PURE__ */ v(
        "div",
        {
          ref: l,
          style: {
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            zIndex: P
          },
          children: /* @__PURE__ */ v(
            me.div,
            {
              ...i,
              ref: d,
              style: {
                // When we get the height of the content, it includes borders. If we were to set
                // the height without having `boxSizing: 'border-box'` it would be too big.
                boxSizing: "border-box",
                // We need to ensure the content doesn't get taller than the wrapper
                maxHeight: "100%",
                ...i.style
              }
            }
          )
        }
      )
    }
  );
});
Dm.displayName = oI;
var sI = "SelectPopperPosition", Us = b.forwardRef((e, t) => {
  const {
    __scopeSelect: n,
    align: r = "start",
    collisionPadding: i = xt,
    ...o
  } = e, s = go(n);
  return /* @__PURE__ */ v(
    Yp,
    {
      ...s,
      ...o,
      ref: t,
      align: r,
      collisionPadding: i,
      style: {
        // Ensure border-box for floating-ui calculations
        boxSizing: "border-box",
        ...o.style,
        "--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-select-content-available-width": "var(--radix-popper-available-width)",
        "--radix-select-content-available-height": "var(--radix-popper-available-height)",
        "--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
      }
    }
  );
});
Us.displayName = sI;
var [aI, pl] = dr(En, {}), Hs = "SelectViewport", Mm = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, nonce: r, ...i } = e, o = hn(Hs, n), s = pl(Hs, n), a = Re(t, o.onViewportChange), l = b.useRef(0);
    return /* @__PURE__ */ _(Vt, { children: [
      /* @__PURE__ */ v(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}"
          },
          nonce: r
        }
      ),
      /* @__PURE__ */ v(po.Slot, { scope: n, children: /* @__PURE__ */ v(
        me.div,
        {
          "data-radix-select-viewport": "",
          role: "presentation",
          ...i,
          ref: a,
          style: {
            // we use position: 'relative' here on the `viewport` so that when we call
            // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
            // (independent of the scrollUpButton).
            position: "relative",
            flex: 1,
            // Viewport should only be scrollable in the vertical direction.
            // This won't work in vertical writing modes, so we'll need to
            // revisit this if/when that is supported
            // https://developer.chrome.com/blog/vertical-form-controls
            overflow: "hidden auto",
            ...i.style
          },
          onScroll: pe(i.onScroll, (c) => {
            const u = c.currentTarget, { contentWrapper: d, shouldExpandOnScrollRef: h } = s;
            if (h?.current && d) {
              const f = Math.abs(l.current - u.scrollTop);
              if (f > 0) {
                const m = window.innerHeight - xt * 2, p = parseFloat(d.style.minHeight), y = parseFloat(d.style.height), g = Math.max(p, y);
                if (g < m) {
                  const x = g + f, w = Math.min(m, x), P = x - w;
                  d.style.height = w + "px", d.style.bottom === "0px" && (u.scrollTop = P > 0 ? P : 0, d.style.justifyContent = "flex-end");
                }
              }
            }
            l.current = u.scrollTop;
          })
        }
      ) })
    ] });
  }
);
Mm.displayName = Hs;
var Om = "SelectGroup", [lI, cI] = dr(Om), uI = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = tn();
    return /* @__PURE__ */ v(lI, { scope: n, id: i, children: /* @__PURE__ */ v(me.div, { role: "group", "aria-labelledby": i, ...r, ref: t }) });
  }
);
uI.displayName = Om;
var Lm = "SelectLabel", dI = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = cI(Lm, n);
    return /* @__PURE__ */ v(me.div, { id: i.id, ...r, ref: t });
  }
);
dI.displayName = Lm;
var Vi = "SelectItem", [fI, _m] = dr(Vi), Fm = b.forwardRef(
  (e, t) => {
    const {
      __scopeSelect: n,
      value: r,
      disabled: i = !1,
      textValue: o,
      ...s
    } = e, a = fn(Vi, n), l = hn(Vi, n), c = a.value === r, [u, d] = b.useState(o ?? ""), [h, f] = b.useState(!1), m = Re(
      t,
      (x) => l.itemRefCallback?.(x, r, i)
    ), p = tn(), y = b.useRef("touch"), g = () => {
      i || (a.onValueChange(r), a.onOpenChange(!1));
    };
    if (r === "")
      throw new Error(
        "A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
      );
    return /* @__PURE__ */ v(
      fI,
      {
        scope: n,
        value: r,
        disabled: i,
        textId: p,
        isSelected: c,
        onItemTextChange: b.useCallback((x) => {
          d((w) => w || (x?.textContent ?? "").trim());
        }, []),
        children: /* @__PURE__ */ v(
          po.ItemSlot,
          {
            scope: n,
            value: r,
            disabled: i,
            textValue: u,
            children: /* @__PURE__ */ v(
              me.div,
              {
                role: "option",
                "aria-labelledby": p,
                "data-highlighted": h ? "" : void 0,
                "aria-selected": c && h,
                "data-state": c ? "checked" : "unchecked",
                "aria-disabled": i || void 0,
                "data-disabled": i ? "" : void 0,
                tabIndex: i ? void 0 : -1,
                ...s,
                ref: m,
                onFocus: pe(s.onFocus, () => f(!0)),
                onBlur: pe(s.onBlur, () => f(!1)),
                onClick: pe(s.onClick, () => {
                  y.current !== "mouse" && g();
                }),
                onPointerUp: pe(s.onPointerUp, () => {
                  y.current === "mouse" && g();
                }),
                onPointerDown: pe(s.onPointerDown, (x) => {
                  y.current = x.pointerType;
                }),
                onPointerMove: pe(s.onPointerMove, (x) => {
                  y.current = x.pointerType, i ? l.onItemLeave?.() : y.current === "mouse" && x.currentTarget.focus({ preventScroll: !0 });
                }),
                onPointerLeave: pe(s.onPointerLeave, (x) => {
                  x.currentTarget === document.activeElement && l.onItemLeave?.();
                }),
                onKeyDown: pe(s.onKeyDown, (x) => {
                  l.searchRef?.current !== "" && x.key === " " || (XN.includes(x.key) && g(), x.key === " " && x.preventDefault());
                })
              }
            )
          }
        )
      }
    );
  }
);
Fm.displayName = Vi;
var Sr = "SelectItemText", Vm = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, ...o } = e, s = fn(Sr, n), a = hn(Sr, n), l = _m(Sr, n), c = eI(Sr, n), [u, d] = b.useState(null), h = Re(
      t,
      (g) => d(g),
      l.onItemTextChange,
      (g) => a.itemTextRefCallback?.(g, l.value, l.disabled)
    ), f = u?.textContent, m = b.useMemo(
      () => /* @__PURE__ */ v("option", { value: l.value, disabled: l.disabled, children: f }, l.value),
      [l.disabled, l.value, f]
    ), { onNativeOptionAdd: p, onNativeOptionRemove: y } = c;
    return Ue(() => (p(m), () => y(m)), [p, y, m]), /* @__PURE__ */ _(Vt, { children: [
      /* @__PURE__ */ v(me.span, { id: l.textId, ...o, ref: h }),
      l.isSelected && s.valueNode && !s.valueNodeHasChildren ? zi.createPortal(o.children, s.valueNode) : null
    ] });
  }
);
Vm.displayName = Sr;
var Bm = "SelectItemIndicator", zm = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return _m(Bm, n).isSelected ? /* @__PURE__ */ v(me.span, { "aria-hidden": !0, ...r, ref: t }) : null;
  }
);
zm.displayName = Bm;
var Ws = "SelectScrollUpButton", jm = b.forwardRef((e, t) => {
  const n = hn(Ws, e.__scopeSelect), r = pl(Ws, e.__scopeSelect), [i, o] = b.useState(!1), s = Re(t, r.onScrollButtonChange);
  return Ue(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollTop > 0;
        o(c);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ v(
    Um,
    {
      ...e,
      ref: s,
      onAutoScroll: () => {
        const { viewport: a, selectedItem: l } = n;
        a && l && (a.scrollTop = a.scrollTop - l.offsetHeight);
      }
    }
  ) : null;
});
jm.displayName = Ws;
var qs = "SelectScrollDownButton", $m = b.forwardRef((e, t) => {
  const n = hn(qs, e.__scopeSelect), r = pl(qs, e.__scopeSelect), [i, o] = b.useState(!1), s = Re(t, r.onScrollButtonChange);
  return Ue(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollHeight - l.clientHeight, u = Math.ceil(l.scrollTop) < c;
        o(u);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ v(
    Um,
    {
      ...e,
      ref: s,
      onAutoScroll: () => {
        const { viewport: a, selectedItem: l } = n;
        a && l && (a.scrollTop = a.scrollTop + l.offsetHeight);
      }
    }
  ) : null;
});
$m.displayName = qs;
var Um = b.forwardRef((e, t) => {
  const { __scopeSelect: n, onAutoScroll: r, ...i } = e, o = hn("SelectScrollButton", n), s = b.useRef(null), a = mo(n), l = b.useCallback(() => {
    s.current !== null && (window.clearInterval(s.current), s.current = null);
  }, []);
  return b.useEffect(() => () => l(), [l]), Ue(() => {
    a().find((u) => u.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
  }, [a]), /* @__PURE__ */ v(
    me.div,
    {
      "aria-hidden": !0,
      ...i,
      ref: t,
      style: { flexShrink: 0, ...i.style },
      onPointerDown: pe(i.onPointerDown, () => {
        s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerMove: pe(i.onPointerMove, () => {
        o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerLeave: pe(i.onPointerLeave, () => {
        l();
      })
    }
  );
}), hI = "SelectSeparator", pI = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return /* @__PURE__ */ v(me.div, { "aria-hidden": !0, ...r, ref: t });
  }
);
pI.displayName = hI;
var Ks = "SelectArrow", mI = b.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = go(n), o = fn(Ks, n), s = hn(Ks, n);
    return o.open && s.position === "popper" ? /* @__PURE__ */ v(Xp, { ...i, ...r, ref: t }) : null;
  }
);
mI.displayName = Ks;
var gI = "SelectBubbleInput", Hm = b.forwardRef(
  ({ __scopeSelect: e, value: t, ...n }, r) => {
    const i = b.useRef(null), o = Re(r, i), s = qN(t);
    return b.useEffect(() => {
      const a = i.current;
      if (!a) return;
      const l = window.HTMLSelectElement.prototype, u = Object.getOwnPropertyDescriptor(
        l,
        "value"
      ).set;
      if (s !== t && u) {
        const d = new Event("change", { bubbles: !0 });
        u.call(a, t), a.dispatchEvent(d);
      }
    }, [s, t]), /* @__PURE__ */ v(
      me.select,
      {
        ...n,
        style: { ...wm, ...n.style },
        ref: o,
        defaultValue: t
      }
    );
  }
);
Hm.displayName = gI;
function Wm(e) {
  return e === "" || e === void 0;
}
function qm(e) {
  const t = kn(e), n = b.useRef(""), r = b.useRef(0), i = b.useCallback(
    (s) => {
      const a = n.current + s;
      t(a), (function l(c) {
        n.current = c, window.clearTimeout(r.current), c !== "" && (r.current = window.setTimeout(() => l(""), 1e3));
      })(a);
    },
    [t]
  ), o = b.useCallback(() => {
    n.current = "", window.clearTimeout(r.current);
  }, []);
  return b.useEffect(() => () => window.clearTimeout(r.current), []), [n, i, o];
}
function Km(e, t, n) {
  const i = t.length > 1 && Array.from(t).every((c) => c === t[0]) ? t[0] : t, o = n ? e.indexOf(n) : -1;
  let s = yI(e, Math.max(o, 0));
  i.length === 1 && (s = s.filter((c) => c !== n));
  const l = s.find(
    (c) => c.textValue.toLowerCase().startsWith(i.toLowerCase())
  );
  return l !== n ? l : void 0;
}
function yI(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
var vI = Sm, bI = Cm, xI = Em, wI = Pm, SI = Am, kI = Rm, CI = Mm, TI = Fm, EI = Vm, PI = zm, AI = jm, RI = $m;
function md({
  ...e
}) {
  return /* @__PURE__ */ v(vI, { "data-slot": "select", ...e });
}
function gd({
  ...e
}) {
  return /* @__PURE__ */ v(xI, { "data-slot": "select-value", ...e });
}
function yd({
  className: e,
  size: t = "default",
  children: n,
  ...r
}) {
  return /* @__PURE__ */ _(
    bI,
    {
      "data-slot": "select-trigger",
      "data-size": t,
      className: ie(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...r,
      children: [
        n,
        /* @__PURE__ */ v(wI, { asChild: !0, children: /* @__PURE__ */ v(Cd, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function vd({
  className: e,
  children: t,
  position: n = "item-aligned",
  align: r = "center",
  ...i
}) {
  return /* @__PURE__ */ v(SI, { children: /* @__PURE__ */ _(
    kI,
    {
      "data-slot": "select-content",
      className: ie(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        e
      ),
      position: n,
      align: r,
      ...i,
      children: [
        /* @__PURE__ */ v(NI, {}),
        /* @__PURE__ */ v(
          CI,
          {
            className: ie(
              "p-1",
              n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children: t
          }
        ),
        /* @__PURE__ */ v(II, {})
      ]
    }
  ) });
}
function ui({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ _(
    TI,
    {
      "data-slot": "select-item",
      className: ie(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        e
      ),
      ...n,
      children: [
        /* @__PURE__ */ v(
          "span",
          {
            "data-slot": "select-item-indicator",
            className: "absolute right-2 flex size-3.5 items-center justify-center",
            children: /* @__PURE__ */ v(PI, { children: /* @__PURE__ */ v(kd, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ v(EI, { children: t })
      ]
    }
  );
}
function NI({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ v(
    AI,
    {
      "data-slot": "select-scroll-up-button",
      className: ie(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ v(kg, { className: "size-4" })
    }
  );
}
function II({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ v(
    RI,
    {
      "data-slot": "select-scroll-down-button",
      className: ie(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ v(Cd, { className: "size-4" })
    }
  );
}
// @__NO_SIDE_EFFECTS__
function DI(e) {
  const t = /* @__PURE__ */ MI(e), n = b.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = b.Children.toArray(o), l = a.find(LI);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? b.Children.count(c) > 1 ? b.Children.only(null) : b.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ v(t, { ...s, ref: i, children: b.isValidElement(c) ? b.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ v(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function MI(e) {
  const t = b.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (b.isValidElement(i)) {
      const s = FI(i), a = _I(o, i.props);
      return i.type !== b.Fragment && (a.ref = r ? An(r, s) : s), b.cloneElement(i, a);
    }
    return b.Children.count(i) > 1 ? b.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var OI = /* @__PURE__ */ Symbol("radix.slottable");
function LI(e) {
  return b.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === OI;
}
function _I(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], o = t[r];
    /^on[A-Z]/.test(r) ? i && o ? n[r] = (...a) => {
      const l = o(...a);
      return i(...a), l;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...o } : r === "className" && (n[r] = [i, o].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function FI(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var yo = "Dialog", [Gm] = sr(yo), [VI, Ct] = Gm(yo), Ym = (e) => {
  const {
    __scopeDialog: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !0
  } = e, a = b.useRef(null), l = b.useRef(null), [c, u] = Lr({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: yo
  });
  return /* @__PURE__ */ v(
    VI,
    {
      scope: t,
      triggerRef: a,
      contentRef: l,
      contentId: tn(),
      titleId: tn(),
      descriptionId: tn(),
      open: c,
      onOpenChange: u,
      onOpenToggle: b.useCallback(() => u((d) => !d), [u]),
      modal: s,
      children: n
    }
  );
};
Ym.displayName = yo;
var Xm = "DialogTrigger", Zm = b.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ct(Xm, n), o = Re(t, i.triggerRef);
    return /* @__PURE__ */ v(
      me.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": yl(i.open),
        ...r,
        ref: o,
        onClick: pe(e.onClick, i.onOpenToggle)
      }
    );
  }
);
Zm.displayName = Xm;
var ml = "DialogPortal", [BI, Jm] = Gm(ml, {
  forceMount: void 0
}), Qm = (e) => {
  const { __scopeDialog: t, forceMount: n, children: r, container: i } = e, o = Ct(ml, t);
  return /* @__PURE__ */ v(BI, { scope: t, forceMount: n, children: b.Children.map(r, (s) => /* @__PURE__ */ v(Nn, { present: n || o.open, children: /* @__PURE__ */ v(co, { asChild: !0, container: i, children: s }) })) });
};
Qm.displayName = ml;
var Bi = "DialogOverlay", eg = b.forwardRef(
  (e, t) => {
    const n = Jm(Bi, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Ct(Bi, e.__scopeDialog);
    return o.modal ? /* @__PURE__ */ v(Nn, { present: r || o.open, children: /* @__PURE__ */ v(jI, { ...i, ref: t }) }) : null;
  }
);
eg.displayName = Bi;
var zI = /* @__PURE__ */ DI("DialogOverlay.RemoveScroll"), jI = b.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ct(Bi, n);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ v(fo, { as: zI, allowPinchZoom: !0, shards: [i.contentRef], children: /* @__PURE__ */ v(
        me.div,
        {
          "data-state": yl(i.open),
          ...r,
          ref: t,
          style: { pointerEvents: "auto", ...r.style }
        }
      ) })
    );
  }
), Pn = "DialogContent", tg = b.forwardRef(
  (e, t) => {
    const n = Jm(Pn, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Ct(Pn, e.__scopeDialog);
    return /* @__PURE__ */ v(Nn, { present: r || o.open, children: o.modal ? /* @__PURE__ */ v($I, { ...i, ref: t }) : /* @__PURE__ */ v(UI, { ...i, ref: t }) });
  }
);
tg.displayName = Pn;
var $I = b.forwardRef(
  (e, t) => {
    const n = Ct(Pn, e.__scopeDialog), r = b.useRef(null), i = Re(t, n.contentRef, r);
    return b.useEffect(() => {
      const o = r.current;
      if (o) return cl(o);
    }, []), /* @__PURE__ */ v(
      ng,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: pe(e.onCloseAutoFocus, (o) => {
          o.preventDefault(), n.triggerRef.current?.focus();
        }),
        onPointerDownOutside: pe(e.onPointerDownOutside, (o) => {
          const s = o.detail.originalEvent, a = s.button === 0 && s.ctrlKey === !0;
          (s.button === 2 || a) && o.preventDefault();
        }),
        onFocusOutside: pe(
          e.onFocusOutside,
          (o) => o.preventDefault()
        )
      }
    );
  }
), UI = b.forwardRef(
  (e, t) => {
    const n = Ct(Pn, e.__scopeDialog), r = b.useRef(!1), i = b.useRef(!1);
    return /* @__PURE__ */ v(
      ng,
      {
        ...e,
        ref: t,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (o) => {
          e.onCloseAutoFocus?.(o), o.defaultPrevented || (r.current || n.triggerRef.current?.focus(), o.preventDefault()), r.current = !1, i.current = !1;
        },
        onInteractOutside: (o) => {
          e.onInteractOutside?.(o), o.defaultPrevented || (r.current = !0, o.detail.originalEvent.type === "pointerdown" && (i.current = !0));
          const s = o.target;
          n.triggerRef.current?.contains(s) && o.preventDefault(), o.detail.originalEvent.type === "focusin" && i.current && o.preventDefault();
        }
      }
    );
  }
), ng = b.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: i, onCloseAutoFocus: o, ...s } = e, a = Ct(Pn, n), l = b.useRef(null), c = Re(t, l);
    return Qa(), /* @__PURE__ */ _(Vt, { children: [
      /* @__PURE__ */ v(
        ro,
        {
          asChild: !0,
          loop: !0,
          trapped: r,
          onMountAutoFocus: i,
          onUnmountAutoFocus: o,
          children: /* @__PURE__ */ v(
            no,
            {
              role: "dialog",
              id: a.contentId,
              "aria-describedby": a.descriptionId,
              "aria-labelledby": a.titleId,
              "data-state": yl(a.open),
              ...s,
              ref: c,
              onDismiss: () => a.onOpenChange(!1)
            }
          )
        }
      ),
      /* @__PURE__ */ _(Vt, { children: [
        /* @__PURE__ */ v(HI, { titleId: a.titleId }),
        /* @__PURE__ */ v(qI, { contentRef: l, descriptionId: a.descriptionId })
      ] })
    ] });
  }
), gl = "DialogTitle", rg = b.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ct(gl, n);
    return /* @__PURE__ */ v(me.h2, { id: i.titleId, ...r, ref: t });
  }
);
rg.displayName = gl;
var ig = "DialogDescription", og = b.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ct(ig, n);
    return /* @__PURE__ */ v(me.p, { id: i.descriptionId, ...r, ref: t });
  }
);
og.displayName = ig;
var sg = "DialogClose", ag = b.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ct(sg, n);
    return /* @__PURE__ */ v(
      me.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: pe(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
ag.displayName = sg;
function yl(e) {
  return e ? "open" : "closed";
}
var lg = "DialogTitleWarning", [pD, cg] = t0(lg, {
  contentName: Pn,
  titleName: gl,
  docsSlug: "dialog"
}), HI = ({ titleId: e }) => {
  const t = cg(lg), n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
  return b.useEffect(() => {
    e && (document.getElementById(e) || console.error(n));
  }, [n, e]), null;
}, WI = "DialogDescriptionWarning", qI = ({ contentRef: e, descriptionId: t }) => {
  const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${cg(WI).contentName}}.`;
  return b.useEffect(() => {
    const i = e.current?.getAttribute("aria-describedby");
    t && i && (document.getElementById(t) || console.warn(r));
  }, [r, e, t]), null;
}, KI = Ym, GI = Zm, YI = Qm, XI = eg, ZI = tg, JI = rg, QI = og, eD = ag;
function tD({ ...e }) {
  return /* @__PURE__ */ v(KI, { "data-slot": "sheet", ...e });
}
function nD({
  ...e
}) {
  return /* @__PURE__ */ v(GI, { "data-slot": "sheet-trigger", ...e });
}
function rD({
  ...e
}) {
  return /* @__PURE__ */ v(YI, { "data-slot": "sheet-portal", ...e });
}
function iD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ v(
    XI,
    {
      "data-slot": "sheet-overlay",
      className: ie(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        e
      ),
      ...t
    }
  );
}
function oD({
  className: e,
  children: t,
  side: n = "right",
  ...r
}) {
  return /* @__PURE__ */ _(rD, { children: [
    /* @__PURE__ */ v(iD, {}),
    /* @__PURE__ */ _(
      ZI,
      {
        "data-slot": "sheet-content",
        className: ie(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          n === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          n === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          n === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          n === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          e
        ),
        ...r,
        children: [
          t,
          /* @__PURE__ */ _(eD, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ v(tr, { className: "size-4" }),
            /* @__PURE__ */ v("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function sD({ className: e, ...t }) {
  return /* @__PURE__ */ v(
    "div",
    {
      "data-slot": "sheet-header",
      className: ie("flex flex-col gap-1.5 p-4", e),
      ...t
    }
  );
}
function aD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ v(
    JI,
    {
      "data-slot": "sheet-title",
      className: ie("text-foreground font-semibold", e),
      ...t
    }
  );
}
function lD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ v(
    QI,
    {
      "data-slot": "sheet-description",
      className: ie("text-muted-foreground text-sm", e),
      ...t
    }
  );
}
function cD({
  baseUrl: e,
  agent: t = "default",
  userId: n = void 0,
  enableStreaming: r = !0,
  suggestions: i = [],
  onError: o = void 0,
  onRateResponse: s = void 0,
  className: a = void 0,
  showSettings: l = !0,
  showHeader: c = !0,
  placeholder: u = "",
  direction: d = "right",
  input: h = void 0,
  setInput: f = void 0,
  model: m = void 0,
  threadId: p = void 0
}) {
  const [y, g] = ye([]), [x, w] = ye(""), P = h !== void 0 ? h : x, E = (q) => {
    h === void 0 && w(q), f?.(q);
  }, [C, A] = ye(!1), [N, L] = ye([]), [T, O] = ye(null), [I, W] = ye(t), [R, M] = ye(m || ""), [B, z] = ye([]), [$, U] = ye([]), [S, oe] = ye(!1), [X, k] = ye([]), [G, ue] = ye(p || null);
  Ze(() => {
    p && (ue(p), T && H(p));
  }, [p, T]), Ze(() => {
    (async () => {
      try {
        const Q = new mg({
          baseUrl: e,
          agent: I,
          getInfo: !0
        });
        await Q.retrieveInfo(), O(Q), Q.info && (z(Q.info.agents), U(Q.info.models), R || M(Q.info.default_model));
      } catch (Q) {
        Q instanceof Error && o?.(Q);
      }
    })();
  }, [e, o]), Ze(() => {
    if (T)
      try {
        T.updateAgent(I, !0);
      } catch (q) {
        console.warn("Could not update agent yet", q);
      }
  }, [I, T]);
  const ce = wn(async () => {
    if (T)
      try {
        const q = await T.listThreads(20, 0, n);
        console.log("Thread List", q), k(q);
      } catch (q) {
        console.error("Failed to fetch history", q);
      }
  }, [T, n]), H = async (q) => {
    if (T)
      try {
        A(!0);
        const we = (await T.getHistory({ thread_id: q })).messages.map((Ne) => ({
          id: Ne.id || crypto.randomUUID(),
          role: Ne.type === "human" ? "user" : "assistant",
          content: Ne.content,
          createdAt: /* @__PURE__ */ new Date()
          // We assume current time if timestamp missing
          // Map other fields if necessary
        }));
        g(we), ue(q), oe(!1);
      } catch (Q) {
        Q instanceof Error && o?.(Q);
      } finally {
        A(!1);
      }
  }, re = () => {
    g([]), L([]), ue(null), E(""), oe(!1);
  }, fe = (q) => {
    const Q = q.match(/(?:```(?:json)?\s*)?({\s*"questions":\s*\[.*?\]\s*})(?:\s*```)?/s);
    if (Q)
      try {
        const Ne = Q[1], be = JSON.parse(Ne).questions || [], Me = q.replace(Q[0], "").trim();
        return { suggestions: be, cleanContent: Me };
      } catch (Ne) {
        console.error("Failed to parse followup JSON", Ne);
      }
    const we = q.match(/\[FOLLOWUP:\s*(.*?)\]/);
    if (we) {
      const ve = we[1].split(",").map((Me) => Me.trim()).filter(Boolean), be = q.replace(/\[FOLLOWUP:\s*.*?\]/, "").trim();
      return { suggestions: ve, cleanContent: be };
    }
    return { suggestions: [], cleanContent: q };
  }, ne = async (q) => {
    if (q?.preventDefault?.(), !P.trim() || !T) return;
    const Q = {
      id: crypto.randomUUID(),
      role: "user",
      content: P,
      createdAt: /* @__PURE__ */ new Date()
    };
    g((ve) => [...ve, Q]), E(""), L([]), A(!0);
    const we = G || crypto.randomUUID();
    G || ue(we);
    const Ne = {
      thread_id: we,
      user_id: n
    };
    try {
      if (r) {
        const ve = T.stream({
          message: Q.content,
          model: R || void 0,
          ...Ne
        });
        let be = null;
        for await (const Me of ve)
          if (typeof Me == "string")
            g((Te) => {
              let _e = be;
              const Fe = Te[Te.length - 1];
              if (_e && Fe && Fe.id === _e && Fe.role === "assistant" && !Fe.toolInvocations)
                return Te.map((Oe) => Oe.id === _e ? { ...Oe, content: Oe.content + Me } : Oe);
              {
                const Oe = crypto.randomUUID();
                return be = Oe, [...Te, {
                  id: Oe,
                  role: "assistant",
                  content: Me,
                  createdAt: /* @__PURE__ */ new Date()
                }];
              }
            });
          else if (typeof Me == "object" && Me !== null) {
            const Te = Me;
            if (Te.tool_calls && Te.tool_calls.length > 0) {
              const Fe = Te.tool_calls.some((ke) => ke.name.includes("sub-agent")) ? "subagent" : "tool", Oe = Te.tool_calls.map((ke) => ({
                state: "call",
                toolName: ke.name,
                toolCallId: ke.id || crypto.randomUUID()
              }));
              be = null, g((ke) => [...ke, {
                id: crypto.randomUUID(),
                role: Fe,
                content: Te.content || "",
                toolInvocations: Oe,
                createdAt: /* @__PURE__ */ new Date()
              }]);
            } else Te.type === "tool" && Te.content ? (be = null, g((_e) => [..._e, {
              id: crypto.randomUUID(),
              role: "tool",
              content: Te.content,
              createdAt: /* @__PURE__ */ new Date()
            }])) : Te.content && g((_e) => {
              let Fe = be;
              const Oe = _e[_e.length - 1];
              if (Fe && Oe && Oe.id === Fe && Oe.role === "assistant" && !Oe.toolInvocations)
                return _e.map((ke) => ke.id === Fe ? { ...ke, content: ke.content + Te.content } : ke);
              {
                const ke = crypto.randomUUID();
                return be = ke, [..._e, {
                  id: ke,
                  role: "assistant",
                  content: Te.content,
                  createdAt: /* @__PURE__ */ new Date()
                }];
              }
            });
          }
        g((Me) => {
          const Te = Me[Me.length - 1];
          if (Te && Te.role === "assistant") {
            const { suggestions: _e, cleanContent: Fe } = fe(Te.content);
            if (_e.length > 0)
              return L(_e), Me.map((Oe, ke) => ke === Me.length - 1 ? { ...Oe, content: Fe } : Oe);
          }
          return Me;
        });
      } else {
        const ve = await T.invoke({
          message: Q.content,
          model: R || void 0,
          ...Ne
        });
        if (ve.suggestions && ve.suggestions.length > 0)
          L(ve.suggestions);
        else {
          const { suggestions: be } = fe(ve.content || "");
          be.length > 0 && L(be);
        }
        g((be) => [
          ...be,
          {
            id: ve.id || crypto.randomUUID(),
            role: "assistant",
            content: ve.content,
            createdAt: /* @__PURE__ */ new Date()
          }
        ]);
      }
    } catch (ve) {
      ve instanceof Error && o?.(ve), g((be) => [
        ...be,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Error processing request. Please try again.",
          createdAt: /* @__PURE__ */ new Date()
        }
      ]);
    } finally {
      A(!1), ce();
    }
  }, se = (q) => {
    E(q.target.value);
  };
  return /* @__PURE__ */ _("div", { className: ie("flex h-full w-full flex-col overflow-hidden", a), children: [
    c && /* @__PURE__ */ v("div", { className: "absolute top-0 left-0 right-0 z-30 transition-all duration-300", children: /* @__PURE__ */ v("div", { className: "mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ _("div", { className: "flex items-center justify-between rounded-2xl border border-border/40 bg-background/60 p-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5", children: [
      /* @__PURE__ */ _("div", { className: "flex items-center gap-3.5 px-1.5", children: [
        /* @__PURE__ */ _("div", { className: "relative group", children: [
          /* @__PURE__ */ v("div", { className: "absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-primary/40 opacity-25 blur transition duration-300 group-hover:opacity-40" }),
          /* @__PURE__ */ v("div", { className: "relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg", children: /* @__PURE__ */ v(ji, { className: "h-5.5 w-5.5" }) }),
          /* @__PURE__ */ v("div", { className: "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" })
        ] }),
        /* @__PURE__ */ _("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ v("h2", { className: "text-[15px] font-bold leading-tight tracking-tight text-foreground sm:text-base", children: "Agent Chat" }),
          /* @__PURE__ */ _("div", { className: "flex items-center gap-2 mt-0.5", children: [
            /* @__PURE__ */ _("div", { className: "flex h-1.5 w-1.5", children: [
              /* @__PURE__ */ v("span", { className: "animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75" }),
              /* @__PURE__ */ v("span", { className: "relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" })
            ] }),
            /* @__PURE__ */ _("p", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60", children: [
              I,
              " ",
              /* @__PURE__ */ v("span", { className: "mx-1 opacity-30", children: "|" }),
              " ",
              R
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ _("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ _(tD, { open: S, onOpenChange: oe, children: [
          /* @__PURE__ */ v(nD, { asChild: !0, children: /* @__PURE__ */ v(et, { variant: "ghost", size: "icon", onClick: ce, title: "Chat History", className: "h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors", children: /* @__PURE__ */ v(wl, { className: "h-4.5 w-4.5" }) }) }),
          /* @__PURE__ */ _(oD, { side: d, className: "w-[300px] sm:w-[400px] border-l border-border/40 backdrop-blur-2xl", children: [
            /* @__PURE__ */ _(sD, { className: "mb-6", children: [
              /* @__PURE__ */ v(aD, { className: "text-xl font-bold tracking-tight", children: "Chat History" }),
              /* @__PURE__ */ v(lD, { className: "text-sm", children: "Select a previous conversation to continue." })
            ] }),
            /* @__PURE__ */ v("div", { className: "px-2", children: /* @__PURE__ */ _(
              et,
              {
                variant: "outline",
                className: "w-full justify-start gap-2.5 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium",
                onClick: re,
                children: [
                  /* @__PURE__ */ v(Sl, { className: "h-4 w-4" }),
                  " New Conversation"
                ]
              }
            ) }),
            /* @__PURE__ */ v("div", { className: "flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-2 mt-6 custom-scrollbar", children: X.length === 0 ? /* @__PURE__ */ _("div", { className: "flex flex-col items-center justify-center py-12 px-4 text-center", children: [
              /* @__PURE__ */ v("div", { className: "h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/40", children: /* @__PURE__ */ v(wl, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ v("p", { className: "text-sm font-medium text-muted-foreground", children: "No recent conversations" }),
              /* @__PURE__ */ v("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Start chatting to see history here." })
            ] }) : X.map((q) => /* @__PURE__ */ _(
              "button",
              {
                className: ie(
                  "group flex flex-col gap-1 w-full text-left p-3.5 rounded-xl transition-all duration-200 border border-transparent",
                  G === q.thread_id ? "bg-primary/5 border-primary/20 shadow-sm" : "hover:bg-muted/50 hover:border-border/50"
                ),
                onClick: () => H(q.thread_id),
                children: [
                  /* @__PURE__ */ v("span", { className: ie(
                    "font-semibold truncate text-[13px]",
                    G === q.thread_id ? "text-primary" : "text-foreground"
                  ), children: q.title || "Untitled Conversation" }),
                  /* @__PURE__ */ _("span", { className: "text-[11px] text-muted-foreground flex items-center gap-2", children: [
                    q.updated_at ? new Date(q.updated_at).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" }) : "Recently",
                    /* @__PURE__ */ v("span", { className: "h-1 w-1 rounded-full bg-muted-foreground/30" }),
                    q.updated_at ? new Date(q.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
                  ] })
                ]
              },
              q.thread_id
            )) })
          ] })
        ] }),
        /* @__PURE__ */ v(
          et,
          {
            variant: "ghost",
            size: "icon",
            onClick: re,
            title: "New Chat",
            className: "h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors",
            children: /* @__PURE__ */ v(Sl, { className: "h-4.5 w-4.5" })
          }
        ),
        l && /* @__PURE__ */ _(dl, { children: [
          /* @__PURE__ */ v(fl, { asChild: !0, children: /* @__PURE__ */ v(
            et,
            {
              variant: "ghost",
              size: "icon",
              className: "h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors",
              children: /* @__PURE__ */ v(Mg, { className: "h-4.5 w-4.5" })
            }
          ) }),
          /* @__PURE__ */ v(hl, { align: "end", className: "w-[280px] p-5 rounded-2xl shadow-2xl border-border/40 backdrop-blur-2xl ring-1 ring-black/5", children: /* @__PURE__ */ _("div", { className: "flex flex-col gap-5", children: [
            /* @__PURE__ */ _("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ v("h4", { className: "font-bold text-base leading-none tracking-tight", children: "Configuration" }),
              /* @__PURE__ */ v("p", { className: "text-xs text-muted-foreground/80 leading-relaxed", children: "Customize your AI agent and model settings for the current session." })
            ] }),
            /* @__PURE__ */ _("div", { className: "grid gap-4", children: [
              /* @__PURE__ */ _("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ v("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Active Agent" }),
                /* @__PURE__ */ _(md, { value: I, onValueChange: W, children: [
                  /* @__PURE__ */ v(yd, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ v(gd, { placeholder: "Select Agent" }) }),
                  /* @__PURE__ */ _(vd, { className: "rounded-xl border-border/40 shadow-xl", children: [
                    B.map((q) => /* @__PURE__ */ v(ui, { value: q.key, className: "text-xs rounded-md my-0.5", children: q.key }, q.key)),
                    B.length === 0 && /* @__PURE__ */ v(ui, { value: I || "default", children: I || "Default" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ _("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ v("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "LLM Model" }),
                /* @__PURE__ */ _(md, { value: R, onValueChange: M, children: [
                  /* @__PURE__ */ v(yd, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ v(gd, { placeholder: "Select Model" }) }),
                  /* @__PURE__ */ _(vd, { className: "rounded-xl border-border/40 shadow-xl", children: [
                    $.map((q) => /* @__PURE__ */ v(ui, { value: q, className: "text-xs rounded-md my-0.5", children: q }, q)),
                    $.length === 0 && /* @__PURE__ */ v(ui, { value: R || "default", children: R || "Default" })
                  ] })
                ] })
              ] })
            ] })
          ] }) })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ v("div", { className: "flex-1 overflow-hidden relative bg-background pt-24", children: /* @__PURE__ */ v(
      vm,
      {
        messages: y,
        handleSubmit: ne,
        input: P,
        handleInputChange: se,
        isGenerating: C,
        stop: () => {
        },
        append: async (q) => {
          E(q.content), g((we) => [...we, { ...q, id: crypto.randomUUID(), createdAt: /* @__PURE__ */ new Date() }]), A(!0);
          const Q = G || crypto.randomUUID();
          G || ue(Q);
          try {
            if (!T) return;
            const we = await T.invoke({
              message: q.content,
              model: R || void 0,
              thread_id: Q,
              user_id: n
            }), { suggestions: Ne, cleanContent: ve } = fe(we.content || "");
            Ne.length > 0 && L(Ne), g((be) => [...be, {
              id: we.id || crypto.randomUUID(),
              role: "assistant",
              content: ve,
              createdAt: /* @__PURE__ */ new Date()
            }]);
          } catch (we) {
            we instanceof Error && o?.(we);
          } finally {
            A(!1), ce();
          }
        },
        suggestions: y.length === 0 ? i : N,
        onRateResponse: s,
        placeholder: u
      }
    ) })
  ] });
}
function mD({
  buttonClassName: e,
  windowClassName: t,
  ...n
}) {
  const [r, i] = ye(!1);
  return /* @__PURE__ */ _(dl, { open: r, onOpenChange: i, children: [
    /* @__PURE__ */ v(fl, { asChild: !0, children: /* @__PURE__ */ v(
      et,
      {
        className: ie(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
          r ? "rotate-90 bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "rotate-0",
          e
        ),
        size: "icon",
        children: r ? /* @__PURE__ */ v(tr, { className: "h-6 w-6" }) : /* @__PURE__ */ v(Rg, { className: "h-6 w-6" })
      }
    ) }),
    /* @__PURE__ */ v(
      hl,
      {
        className: ie("w-[90vw] sm:w-[400px] h-[80vh] sm:h-[600px] p-0 overflow-hidden rounded-2xl border border-border/50 shadow-2xl mr-4 mb-4", t),
        align: "end",
        sideOffset: 16,
        children: /* @__PURE__ */ v(cD, { ...n, className: "h-full w-full" })
      }
    )
  ] });
}
export {
  cD as A,
  et as B,
  vm as C,
  ym as M,
  mD as P,
  E0 as a,
  $0 as b,
  Pu as c,
  mg as d,
  je as e,
  V0 as f,
  bm as g,
  j0 as h,
  xm as i,
  NN as j,
  fN as k,
  AN as l,
  RN as m,
  Di as n,
  sd as o,
  ie as p,
  _a as s,
  I0 as w
};
