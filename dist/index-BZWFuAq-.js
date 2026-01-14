var Ly = Object.defineProperty;
var _y = (e, t, n) => t in e ? Ly(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ce = (e, t, n) => _y(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as g, Fragment as It, jsxs as O } from "react/jsx-runtime";
import * as y from "react";
import $, { useState as le, useRef as Ae, useEffect as Be, useCallback as Ve, forwardRef as dr, createElement as Fi, createContext as fr, useId as Ta, useContext as Xe, useInsertionEffect as sf, useMemo as fn, Children as Fy, isValidElement as Pi, useLayoutEffect as Ea, Fragment as af, Component as Vy, Suspense as By } from "react";
import * as ho from "react-dom";
import lf from "react-dom";
class je extends Error {
  constructor(t) {
    super(t), this.name = "AgentClientError";
  }
}
class zy {
  constructor(t) {
    Ce(this, "baseUrl");
    Ce(this, "authSecret");
    Ce(this, "timeout");
    Ce(this, "_info", null);
    Ce(this, "_agent", null);
    Ce(this, "_initPromise", null);
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
    var t, n;
    try {
      const r = new AbortController(), i = this.timeout ? setTimeout(() => r.abort(), this.timeout) : void 0, o = await fetch(`${this.baseUrl}/info`, {
        headers: this.headers,
        signal: r.signal
      });
      if (i && clearTimeout(i), !o.ok)
        throw new je(`HTTP error! status: ${o.status}`);
      this._info = await o.json(), (!this._agent || !((t = this._info) != null && t.agents.some((s) => s.key === this._agent))) && (this._agent = ((n = this._info) == null ? void 0 : n.default_agent) || null);
    } catch (r) {
      throw r instanceof Error ? new je(`Error getting service info: ${r.message}`) : r;
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
          case "update":
            return i;
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
const Pa = {
  lang: "en-US",
  continuous: !1,
  interimResults: !0,
  maxAlternatives: 1,
  pitch: 1,
  rate: 1,
  volume: 1
};
function Vi() {
  const e = !!(typeof window < "u" && (window.SpeechRecognition || window.webkitSpeechRecognition)), t = !!(typeof window < "u" && window.speechSynthesis);
  return {
    speechRecognition: e,
    speechSynthesis: t
  };
}
class $y {
  constructor(t = {}) {
    Ce(this, "recognition", null);
    Ce(this, "isListening", !1);
    Ce(this, "config");
    Ce(this, "onResult", null);
    Ce(this, "onStart", null);
    Ce(this, "onEnd", null);
    Ce(this, "onError", null);
    Ce(this, "onSpeechStart", null);
    Ce(this, "onSpeechEnd", null);
    this.config = { ...Pa, ...t }, this.initRecognition();
  }
  initRecognition() {
    if (typeof window > "u") return !1;
    const t = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!t)
      return console.warn("Speech Recognition is not supported in this browser"), !1;
    try {
      const n = new t();
      return n.lang = this.config.lang, n.continuous = this.config.continuous, n.interimResults = this.config.interimResults, n.maxAlternatives = this.config.maxAlternatives, n.onstart = () => {
        var r;
        this.isListening = !0, (r = this.onStart) == null || r.call(this);
      }, n.onend = () => {
        var r;
        this.isListening = !1, (r = this.onEnd) == null || r.call(this);
      }, n.onerror = (r) => {
        var o;
        this.isListening = !1;
        const i = this.getErrorMessage(r.error);
        (o = this.onError) == null || o.call(this, i);
      }, n.onresult = (r) => {
        var s;
        let i = "", o = !1;
        for (let a = r.resultIndex; a < r.results.length; a++) {
          const l = r.results[a];
          i += l[0].transcript, l.isFinal && (o = !0);
        }
        (s = this.onResult) == null || s.call(this, i, o);
      }, n.onspeechstart = () => {
        var r;
        (r = this.onSpeechStart) == null || r.call(this);
      }, n.onspeechend = () => {
        var r;
        (r = this.onSpeechEnd) == null || r.call(this);
      }, this.recognition = n, !0;
    } catch (n) {
      return console.error("Failed to initialize speech recognition:", n), !1;
    }
  }
  getErrorMessage(t) {
    return {
      "no-speech": "No speech was detected. Please try again.",
      aborted: "Speech recognition was aborted.",
      "audio-capture": "No microphone was found. Ensure a microphone is connected.",
      network: "Network error occurred. Check your internet connection.",
      "not-allowed": "Microphone access denied. Please allow microphone permissions.",
      "service-not-available": "Speech service is not available.",
      "bad-grammar": "Speech grammar error occurred.",
      "language-not-supported": "Language is not supported."
    }[t] || `Unknown error: ${t}`;
  }
  start() {
    var t;
    if (!this.recognition && !this.initRecognition())
      return !1;
    if (this.isListening)
      return !0;
    try {
      return (t = this.recognition) == null || t.start(), !0;
    } catch (n) {
      return console.error("Failed to start speech recognition:", n), !1;
    }
  }
  stop() {
    this.recognition && this.isListening && this.recognition.stop();
  }
  abort() {
    this.recognition && this.recognition.abort();
  }
  updateConfig(t) {
    this.config = { ...this.config, ...t }, this.recognition && (this.recognition.lang = this.config.lang, this.recognition.continuous = this.config.continuous, this.recognition.interimResults = this.config.interimResults, this.recognition.maxAlternatives = this.config.maxAlternatives);
  }
  getIsListening() {
    return this.isListening;
  }
  destroy() {
    this.abort(), this.recognition = null, this.onResult = null, this.onStart = null, this.onEnd = null, this.onError = null, this.onSpeechStart = null, this.onSpeechEnd = null;
  }
}
class jy {
  constructor(t = {}) {
    Ce(this, "utterance", null);
    Ce(this, "config");
    Ce(this, "isSpeaking", !1);
    Ce(this, "availableVoices", []);
    Ce(this, "onStart", null);
    Ce(this, "onEnd", null);
    Ce(this, "onPause", null);
    Ce(this, "onResume", null);
    Ce(this, "onError", null);
    Ce(this, "onBoundary", null);
    this.config = { ...Pa, ...t }, this.loadVoices();
  }
  loadVoices() {
    typeof window > "u" || !window.speechSynthesis || (this.availableVoices = window.speechSynthesis.getVoices(), window.speechSynthesis.onvoiceschanged = () => {
      this.availableVoices = window.speechSynthesis.getVoices();
    });
  }
  getVoices() {
    return this.availableVoices;
  }
  getVoicesByLanguage(t) {
    return this.availableVoices.filter(
      (n) => n.lang.toLowerCase().startsWith(t.toLowerCase().split("-")[0])
    );
  }
  speak(t) {
    if (typeof window > "u" || !window.speechSynthesis)
      return console.warn("Speech Synthesis is not supported in this browser"), !1;
    this.stop();
    try {
      if (this.utterance = new SpeechSynthesisUtterance(t), this.utterance.lang = this.config.lang, this.utterance.pitch = this.config.pitch, this.utterance.rate = this.config.rate, this.utterance.volume = this.config.volume, this.config.voiceURI) {
        const n = this.availableVoices.find(
          (r) => r.voiceURI === this.config.voiceURI
        );
        n && (this.utterance.voice = n);
      }
      return this.utterance.onstart = () => {
        var n;
        this.isSpeaking = !0, (n = this.onStart) == null || n.call(this);
      }, this.utterance.onend = () => {
        var n;
        this.isSpeaking = !1, (n = this.onEnd) == null || n.call(this);
      }, this.utterance.onerror = (n) => {
        var r;
        this.isSpeaking = !1, (r = this.onError) == null || r.call(this, n.error);
      }, this.utterance.onpause = () => {
        var n;
        (n = this.onPause) == null || n.call(this);
      }, this.utterance.onresume = () => {
        var n;
        (n = this.onResume) == null || n.call(this);
      }, this.utterance.onboundary = (n) => {
        var r;
        (r = this.onBoundary) == null || r.call(this, n.charIndex, n.charLength);
      }, window.speechSynthesis.speak(this.utterance), !0;
    } catch (n) {
      return console.error("Failed to speak:", n), !1;
    }
  }
  stop() {
    typeof window > "u" || !window.speechSynthesis || (window.speechSynthesis.cancel(), this.isSpeaking = !1);
  }
  pause() {
    typeof window > "u" || !window.speechSynthesis || window.speechSynthesis.pause();
  }
  resume() {
    typeof window > "u" || !window.speechSynthesis || window.speechSynthesis.resume();
  }
  getIsSpeaking() {
    return this.isSpeaking;
  }
  updateConfig(t) {
    this.config = { ...this.config, ...t };
  }
  destroy() {
    this.stop(), this.utterance = null, this.onStart = null, this.onEnd = null, this.onPause = null, this.onResume = null, this.onError = null, this.onBoundary = null;
  }
}
function Uy(e) {
  return e.replace(/```[\s\S]*?```/g, "Code block omitted. ").replace(/`[^`]+`/g, (t) => t.slice(1, -1)).replace(/#{1,6}\s+/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").replace(/---/g, "").replace(/^>\s+/gm, "").replace(/^[\s]*[-*+]\s+/gm, "").replace(/^[\s]*\d+\.\s+/gm, "").replace(/\n{3,}/g, `

`).trim();
}
function Hy(e = {}) {
  const { config: t } = e, [n, r] = le(!1), [i, o] = le(!1), [s, a] = le(""), [l, c] = le(""), [u, d] = le(null), [h, f] = le([]), [m, p] = le(null), [b, v] = le({
    ...Pa,
    ...t
  }), [x, w] = le(() => Vi()), E = Ae(null), T = Ae(null), k = Ae(e);
  Be(() => {
    k.current = e;
  }), Be(() => {
    const I = Vi();
    if (w(I), I.speechRecognition && (E.current = new $y(b), E.current.onStart = () => {
      var _, L;
      r(!0), d(null), (L = (_ = k.current).onSpeechStart) == null || L.call(_);
    }, E.current.onEnd = () => {
      var _, L;
      r(!1), (L = (_ = k.current).onSpeechEnd) == null || L.call(_);
    }, E.current.onError = (_) => {
      var L, S;
      d(_), r(!1), (S = (L = k.current).onError) == null || S.call(L, _);
    }, E.current.onResult = (_, L) => {
      var S, ee;
      L ? (a((Y) => Y + _), c("")) : c(_), (ee = (S = k.current).onTranscript) == null || ee.call(S, _, L);
    }), I.speechSynthesis) {
      T.current = new jy(b), T.current.onStart = () => {
        o(!0);
      }, T.current.onEnd = () => {
        o(!1);
      }, T.current.onError = (L) => {
        d(L), o(!1);
      };
      const _ = () => {
        var S;
        const L = ((S = T.current) == null ? void 0 : S.getVoices()) || [];
        if (f(L), !m && L.length > 0) {
          const ee = L.filter(
            (Y) => Y.lang.toLowerCase().startsWith(b.lang.toLowerCase().split("-")[0])
          );
          ee.length > 0 && p(ee[0]);
        }
      };
      _(), typeof window < "u" && window.speechSynthesis && (window.speechSynthesis.onvoiceschanged = _);
    }
    return () => {
      var _, L;
      (_ = E.current) == null || _.destroy(), (L = T.current) == null || L.destroy();
    };
  }, []);
  const A = Ve((I) => {
    v((_) => {
      var S, ee;
      const L = { ..._, ...I };
      return (S = E.current) == null || S.updateConfig(L), (ee = T.current) == null || ee.updateConfig(L), L;
    });
  }, []), D = Ve(() => {
    var I;
    d(null), c(""), (I = E.current) == null || I.start();
  }, []), F = Ve(() => {
    var I;
    (I = E.current) == null || I.stop();
  }, []), P = Ve(() => {
    n ? F() : D();
  }, [n, D, F]), N = Ve(() => {
    a(""), c("");
  }, []), R = Ve((I) => {
    var L, S;
    d(null);
    const _ = Uy(I);
    m && ((L = T.current) == null || L.updateConfig({ voiceURI: m.voiceURI })), (S = T.current) == null || S.speak(_);
  }, [m]), B = Ve(() => {
    var I;
    (I = T.current) == null || I.stop();
  }, []), j = Ve(() => {
    var I;
    (I = T.current) == null || I.pause();
  }, []), H = Ve(() => {
    var I;
    (I = T.current) == null || I.resume();
  }, []), V = Ve((I) => {
    p(I), I && A({ voiceURI: I.voiceURI });
  }, [A]);
  return {
    // State
    isListening: n,
    isSpeaking: i,
    transcript: s,
    interimTranscript: l,
    error: u,
    // Support detection
    isRecognitionSupported: x.speechRecognition,
    isSynthesisSupported: x.speechSynthesis,
    // Recognition controls
    startListening: D,
    stopListening: F,
    toggleListening: P,
    clearTranscript: N,
    // Synthesis controls
    speak: R,
    stopSpeaking: B,
    pauseSpeaking: j,
    resumeSpeaking: H,
    // Voice management
    availableVoices: h,
    selectedVoice: m,
    setSelectedVoice: V,
    // Config
    voiceConfig: b,
    updateConfig: A
  };
}
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wy = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), cf = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var qy = {
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
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ky = dr(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: i = "",
    children: o,
    iconNode: s,
    ...a
  }, l) => Fi(
    "svg",
    {
      ref: l,
      ...qy,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: cf("lucide", i),
      ...a
    },
    [
      ...s.map(([c, u]) => Fi(c, u)),
      ...Array.isArray(o) ? o : [o]
    ]
  )
);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xe = (e, t) => {
  const n = dr(
    ({ className: r, ...i }, o) => Fi(Ky, {
      ref: o,
      iconNode: t,
      className: cf(`lucide-${Wy(e)}`, r),
      ...i
    })
  );
  return n.displayName = `${e}`, n;
};
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gy = xe("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yy = xe("Ban", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m4.9 4.9 14.2 14.2", key: "1m5liu" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Xy = xe("Bot", [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const oc = xe("Braces", [
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
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uf = xe("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const df = xe("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Aa = xe("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zy = xe("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Jy = xe("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qy = xe("CodeXml", [
  ["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }],
  ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
  ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ev = xe("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ko = xe("Dot", [
  ["circle", { cx: "12.1", cy: "12.1", r: "1", key: "18d7e5" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tv = xe("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sc = xe("History", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nv = xe("Info", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ff = xe("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rv = xe("Maximize2", [
  ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
  ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }],
  ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const iv = xe("MessageCircle", [
  ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ov = xe("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sv = xe("Mic", [
  ["path", { d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z", key: "131961" }],
  ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2", key: "1vc78b" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const av = xe("Minimize2", [
  ["polyline", { points: "4 14 10 14 10 20", key: "11kfnr" }],
  ["polyline", { points: "20 10 14 10 14 4", key: "rlmsce" }],
  ["line", { x1: "14", x2: "21", y1: "10", y2: "3", key: "o5lafz" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hf = xe("Paperclip", [
  [
    "path",
    {
      d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48",
      key: "1u3ebp"
    }
  ]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pf = xe("RefreshCcw", [
  ["path", { d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "14sxne" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16", key: "1hlbsb" }],
  ["path", { d: "M16 16h5v5", key: "ccwih5" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lv = xe("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cv = xe("Settings2", [
  ["path", { d: "M20 7h-9", key: "3s1dr2" }],
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const po = xe("Sparkles", [
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
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mf = xe("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uv = xe("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dv = xe("ThumbsDown", [
  ["path", { d: "M17 14V2", key: "8ymqnk" }],
  [
    "path",
    {
      d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
      key: "m61m77"
    }
  ]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fv = xe("ThumbsUp", [
  ["path", { d: "M7 10v12", key: "1qc93n" }],
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hv = xe("Volume2", [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hr = xe("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function gf(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = gf(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function yf() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = gf(e)) && (r && (r += " "), r += t);
  return r;
}
const Ra = "-", pv = (e) => {
  const t = gv(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (s) => {
      const a = s.split(Ra);
      return a[0] === "" && a.length !== 1 && a.shift(), vf(a, t) || mv(s);
    },
    getConflictingClassGroupIds: (s, a) => {
      const l = n[s] || [];
      return a && r[s] ? [...l, ...r[s]] : l;
    }
  };
}, vf = (e, t) => {
  var s;
  if (e.length === 0)
    return t.classGroupId;
  const n = e[0], r = t.nextPart.get(n), i = r ? vf(e.slice(1), r) : void 0;
  if (i)
    return i;
  if (t.validators.length === 0)
    return;
  const o = e.join(Ra);
  return (s = t.validators.find(({
    validator: a
  }) => a(o))) == null ? void 0 : s.classGroupId;
}, ac = /^\[(.+)\]$/, mv = (e) => {
  if (ac.test(e)) {
    const t = ac.exec(e)[1], n = t == null ? void 0 : t.substring(0, t.indexOf(":"));
    if (n)
      return "arbitrary.." + n;
  }
}, gv = (e) => {
  const {
    theme: t,
    prefix: n
  } = e, r = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return vv(Object.entries(e.classGroups), n).forEach(([o, s]) => {
    Ds(s, r, o, t);
  }), r;
}, Ds = (e, t, n, r) => {
  e.forEach((i) => {
    if (typeof i == "string") {
      const o = i === "" ? t : lc(t, i);
      o.classGroupId = n;
      return;
    }
    if (typeof i == "function") {
      if (yv(i)) {
        Ds(i(r), t, n, r);
        return;
      }
      t.validators.push({
        validator: i,
        classGroupId: n
      });
      return;
    }
    Object.entries(i).forEach(([o, s]) => {
      Ds(s, lc(t, o), n, r);
    });
  });
}, lc = (e, t) => {
  let n = e;
  return t.split(Ra).forEach((r) => {
    n.nextPart.has(r) || n.nextPart.set(r, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), n = n.nextPart.get(r);
  }), n;
}, yv = (e) => e.isThemeGetter, vv = (e, t) => t ? e.map(([n, r]) => {
  const i = r.map((o) => typeof o == "string" ? t + o : typeof o == "object" ? Object.fromEntries(Object.entries(o).map(([s, a]) => [t + s, a])) : o);
  return [n, i];
}) : e, bv = (e) => {
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
}, bf = "!", xv = (e) => {
  const {
    separator: t,
    experimentalParseClassName: n
  } = e, r = t.length === 1, i = t[0], o = t.length, s = (a) => {
    const l = [];
    let c = 0, u = 0, d;
    for (let b = 0; b < a.length; b++) {
      let v = a[b];
      if (c === 0) {
        if (v === i && (r || a.slice(b, b + o) === t)) {
          l.push(a.slice(u, b)), u = b + o;
          continue;
        }
        if (v === "/") {
          d = b;
          continue;
        }
      }
      v === "[" ? c++ : v === "]" && c--;
    }
    const h = l.length === 0 ? a : a.substring(u), f = h.startsWith(bf), m = f ? h.substring(1) : h, p = d && d > u ? d - u : void 0;
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
}, wv = (e) => {
  if (e.length <= 1)
    return e;
  const t = [];
  let n = [];
  return e.forEach((r) => {
    r[0] === "[" ? (t.push(...n.sort(), r), n = []) : n.push(r);
  }), t.push(...n.sort()), t;
}, Sv = (e) => ({
  cache: bv(e.cacheSize),
  parseClassName: xv(e),
  ...pv(e)
}), kv = /\s+/, Cv = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: i
  } = t, o = [], s = e.trim().split(kv);
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
    const b = wv(u).join(":"), v = d ? b + bf : b, x = v + p;
    if (o.includes(x))
      continue;
    o.push(x);
    const w = i(p, m);
    for (let E = 0; E < w.length; ++E) {
      const T = w[E];
      o.push(v + T);
    }
    a = c + (a.length > 0 ? " " + a : a);
  }
  return a;
};
function Tv() {
  let e = 0, t, n, r = "";
  for (; e < arguments.length; )
    (t = arguments[e++]) && (n = xf(t)) && (r && (r += " "), r += n);
  return r;
}
const xf = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = xf(e[r])) && (n && (n += " "), n += t);
  return n;
};
function Ev(e, ...t) {
  let n, r, i, o = s;
  function s(l) {
    const c = t.reduce((u, d) => d(u), e());
    return n = Sv(c), r = n.cache.get, i = n.cache.set, o = a, a(l);
  }
  function a(l) {
    const c = r(l);
    if (c)
      return c;
    const u = Cv(l, n);
    return i(l, u), u;
  }
  return function() {
    return o(Tv.apply(null, arguments));
  };
}
const Ee = (e) => {
  const t = (n) => n[e] || [];
  return t.isThemeGetter = !0, t;
}, wf = /^\[(?:([a-z-]+):)?(.+)\]$/i, Pv = /^\d+\/\d+$/, Av = /* @__PURE__ */ new Set(["px", "full", "screen"]), Rv = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Nv = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Iv = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/, Dv = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Mv = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Gt = (e) => er(e) || Av.has(e) || Pv.test(e), sn = (e) => pr(e, "length", $v), er = (e) => !!e && !Number.isNaN(Number(e)), Go = (e) => pr(e, "number", er), Er = (e) => !!e && Number.isInteger(Number(e)), Ov = (e) => e.endsWith("%") && er(e.slice(0, -1)), ue = (e) => wf.test(e), an = (e) => Rv.test(e), Lv = /* @__PURE__ */ new Set(["length", "size", "percentage"]), _v = (e) => pr(e, Lv, Sf), Fv = (e) => pr(e, "position", Sf), Vv = /* @__PURE__ */ new Set(["image", "url"]), Bv = (e) => pr(e, Vv, Uv), zv = (e) => pr(e, "", jv), Pr = () => !0, pr = (e, t, n) => {
  const r = wf.exec(e);
  return r ? r[1] ? typeof t == "string" ? r[1] === t : t.has(r[1]) : n(r[2]) : !1;
}, $v = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  Nv.test(e) && !Iv.test(e)
), Sf = () => !1, jv = (e) => Dv.test(e), Uv = (e) => Mv.test(e), Hv = () => {
  const e = Ee("colors"), t = Ee("spacing"), n = Ee("blur"), r = Ee("brightness"), i = Ee("borderColor"), o = Ee("borderRadius"), s = Ee("borderSpacing"), a = Ee("borderWidth"), l = Ee("contrast"), c = Ee("grayscale"), u = Ee("hueRotate"), d = Ee("invert"), h = Ee("gap"), f = Ee("gradientColorStops"), m = Ee("gradientColorStopPositions"), p = Ee("inset"), b = Ee("margin"), v = Ee("opacity"), x = Ee("padding"), w = Ee("saturate"), E = Ee("scale"), T = Ee("sepia"), k = Ee("skew"), A = Ee("space"), D = Ee("translate"), F = () => ["auto", "contain", "none"], P = () => ["auto", "hidden", "clip", "visible", "scroll"], N = () => ["auto", ue, t], R = () => [ue, t], B = () => ["", Gt, sn], j = () => ["auto", er, ue], H = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], V = () => ["solid", "dashed", "dotted", "double", "none"], I = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], _ = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], L = () => ["", "0", ue], S = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], ee = () => [er, ue];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Pr],
      spacing: [Gt, sn],
      blur: ["none", "", an, ue],
      brightness: ee(),
      borderColor: [e],
      borderRadius: ["none", "", "full", an, ue],
      borderSpacing: R(),
      borderWidth: B(),
      contrast: ee(),
      grayscale: L(),
      hueRotate: ee(),
      invert: L(),
      gap: R(),
      gradientColorStops: [e],
      gradientColorStopPositions: [Ov, sn],
      inset: N(),
      margin: N(),
      opacity: ee(),
      padding: R(),
      saturate: ee(),
      scale: ee(),
      sepia: L(),
      skew: ee(),
      space: R(),
      translate: R()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", ue]
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
        columns: [an]
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
        object: [...H(), ue]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: P()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": P()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": P()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: F()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": F()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": F()
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
        z: ["auto", Er, ue]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: N()
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
        flex: ["1", "auto", "initial", "none", ue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: L()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: L()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", Er, ue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [Pr]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Er, ue]
        }, ue]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": j()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": j()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [Pr]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Er, ue]
        }, ue]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": j()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": j()
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
        "auto-cols": ["auto", "min", "max", "fr", ue]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", ue]
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
        justify: ["normal", ..._()]
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
        content: ["normal", ..._(), "baseline"]
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
        "place-content": [..._(), "baseline"]
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
        m: [b]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [b]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [b]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [b]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [b]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [b]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [b]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [b]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [b]
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
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", ue, t]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [ue, t, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [ue, t, "none", "full", "min", "max", "fit", "prose", {
          screen: [an]
        }, an]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [ue, t, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [ue, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [ue, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [ue, t, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", an, sn]
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
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", Go]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Pr]
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
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", ue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", er, Go]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", Gt, ue]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", ue]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", ue]
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
        "placeholder-opacity": [v]
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
        "text-opacity": [v]
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
        decoration: [...V(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", Gt, sn]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", Gt, ue]
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
        indent: R()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", ue]
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
        content: ["none", ue]
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
        "bg-opacity": [v]
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
        bg: [...H(), Fv]
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
        bg: ["auto", "cover", "contain", _v]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, Bv]
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
        "border-opacity": [v]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...V(), "hidden"]
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
        "divide-opacity": [v]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: V()
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
        outline: ["", ...V()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [Gt, ue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [Gt, sn]
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
        ring: B()
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
        "ring-opacity": [v]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [Gt, sn]
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
        shadow: ["", "inner", "none", an, zv]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [Pr]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [v]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...I(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": I()
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
        "drop-shadow": ["", "none", an, ue]
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
        sepia: [T]
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
        "backdrop-opacity": [v]
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
        "backdrop-sepia": [T]
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
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", ue]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: ee()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", ue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: ee()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", ue]
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
        scale: [E]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [E]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [E]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Er, ue]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [D]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [D]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [k]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [k]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", ue]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", ue]
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
        "scroll-m": R()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": R()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": R()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": R()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": R()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": R()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": R()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": R()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": R()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": R()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": R()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": R()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": R()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": R()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": R()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": R()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": R()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": R()
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
        "will-change": ["auto", "scroll", "contents", "transform", ue]
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
        stroke: [Gt, sn, Go]
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
}, Wv = /* @__PURE__ */ Ev(Hv);
function Q(...e) {
  return Wv(yf(e));
}
const qv = 50, Kv = 10;
function Gv(e) {
  const t = Ae(null), n = Ae(null), [r, i] = le(!0), o = () => {
    t.current && (t.current.scrollTop = t.current.scrollHeight);
  }, s = () => {
    if (t.current) {
      const { scrollTop: l, scrollHeight: c, clientHeight: u } = t.current, d = Math.abs(
        c - l - u
      ), h = n.current ? l < n.current : !1, f = n.current ? n.current - l : 0;
      if (h && f > Kv)
        i(!1);
      else {
        const p = d < qv;
        i(p);
      }
      n.current = l;
    }
  }, a = () => {
    i(!1);
  };
  return Be(() => {
    t.current && (n.current = t.current.scrollTop);
  }, []), Be(() => {
    r && o();
  }, e), {
    containerRef: t,
    scrollToBottom: o,
    handleScroll: s,
    shouldAutoScroll: r,
    handleTouchStart: a
  };
}
function cc(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function zn(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((i) => {
      const o = cc(i, t);
      return !n && typeof o == "function" && (n = !0), o;
    });
    if (n)
      return () => {
        for (let i = 0; i < r.length; i++) {
          const o = r[i];
          typeof o == "function" ? o() : cc(e[i], null);
        }
      };
  };
}
function be(...e) {
  return y.useCallback(zn(...e), e);
}
var Yv = Symbol.for("react.lazy"), Bi = y[" use ".trim().toString()];
function Xv(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
function kf(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === Yv && "_payload" in e && Xv(e._payload);
}
// @__NO_SIDE_EFFECTS__
function Cf(e) {
  const t = /* @__PURE__ */ Jv(e), n = y.forwardRef((r, i) => {
    let { children: o, ...s } = r;
    kf(o) && typeof Bi == "function" && (o = Bi(o._payload));
    const a = y.Children.toArray(o), l = a.find(eb);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
var Zv = /* @__PURE__ */ Cf("Slot");
// @__NO_SIDE_EFFECTS__
function Jv(e) {
  const t = y.forwardRef((n, r) => {
    let { children: i, ...o } = n;
    if (kf(i) && typeof Bi == "function" && (i = Bi(i._payload)), y.isValidElement(i)) {
      const s = nb(i), a = tb(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? zn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var Qv = Symbol("radix.slottable");
function eb(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Qv;
}
function tb(e, t) {
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
function nb(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
const uc = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, dc = yf, Tf = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return dc(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: i, defaultVariants: o } = t, s = Object.keys(i).map((c) => {
    const u = n == null ? void 0 : n[c], d = o == null ? void 0 : o[c];
    if (u === null) return null;
    const h = uc(u) || uc(d);
    return i[c][h];
  }), a = n && Object.entries(n).reduce((c, u) => {
    let [d, h] = u;
    return h === void 0 || (c[d] = h), c;
  }, {}), l = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((c, u) => {
    let { class: d, className: h, ...f } = u;
    return Object.entries(f).every((m) => {
      let [p, b] = m;
      return Array.isArray(b) ? b.includes({
        ...o,
        ...a
      }[p]) : {
        ...o,
        ...a
      }[p] === b;
    }) ? [
      ...c,
      d,
      h
    ] : c;
  }, []);
  return dc(e, s, l, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, rb = Tf(
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
), $e = y.forwardRef(({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }, o) => /* @__PURE__ */ g(
  r ? Zv : "button",
  {
    "data-slot": "button",
    "data-variant": t,
    "data-size": n,
    className: Q(rb({ variant: t, size: n, className: e })),
    ref: o,
    ...i
  }
));
$e.displayName = "Button";
const Na = fr({});
function Ia(e) {
  const t = Ae(null);
  return t.current === null && (t.current = e()), t.current;
}
const mo = fr(null), Da = fr({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
class ib extends y.Component {
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
function ob({ children: e, isPresent: t }) {
  const n = Ta(), r = Ae(null), i = Ae({
    width: 0,
    height: 0,
    top: 0,
    left: 0
  }), { nonce: o } = Xe(Da);
  return sf(() => {
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
  }, [t]), g(ib, { isPresent: t, childRef: r, sizeRef: i, children: y.cloneElement(e, { ref: r }) });
}
const sb = ({ children: e, initial: t, isPresent: n, onExitComplete: r, custom: i, presenceAffectsLayout: o, mode: s }) => {
  const a = Ia(ab), l = Ta(), c = Ve((d) => {
    a.set(d, !0);
    for (const h of a.values())
      if (!h)
        return;
    r && r();
  }, [a, r]), u = fn(
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
  return fn(() => {
    a.forEach((d, h) => a.set(h, !1));
  }, [n]), y.useEffect(() => {
    !n && !a.size && r && r();
  }, [n]), s === "popLayout" && (e = g(ob, { isPresent: n, children: e })), g(mo.Provider, { value: u, children: e });
};
function ab() {
  return /* @__PURE__ */ new Map();
}
function Ef(e = !0) {
  const t = Xe(mo);
  if (t === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: i } = t, o = Ta();
  Be(() => {
    e && i(o);
  }, [e]);
  const s = Ve(() => e && r && r(o), [o, r, e]);
  return !n && r ? [!1, s] : [!0];
}
const fi = (e) => e.key || "";
function fc(e) {
  const t = [];
  return Fy.forEach(e, (n) => {
    Pi(n) && t.push(n);
  }), t;
}
const Ma = typeof window < "u", Pf = Ma ? Ea : Be, go = ({ children: e, custom: t, initial: n = !0, onExitComplete: r, presenceAffectsLayout: i = !0, mode: o = "sync", propagate: s = !1 }) => {
  const [a, l] = Ef(s), c = fn(() => fc(e), [e]), u = s && !a ? [] : c.map(fi), d = Ae(!0), h = Ae(c), f = Ia(() => /* @__PURE__ */ new Map()), [m, p] = le(c), [b, v] = le(c);
  Pf(() => {
    d.current = !1, h.current = c;
    for (let E = 0; E < b.length; E++) {
      const T = fi(b[E]);
      u.includes(T) ? f.delete(T) : f.get(T) !== !0 && f.set(T, !1);
    }
  }, [b, u.length, u.join("-")]);
  const x = [];
  if (c !== m) {
    let E = [...c];
    for (let T = 0; T < b.length; T++) {
      const k = b[T], A = fi(k);
      u.includes(A) || (E.splice(T, 0, k), x.push(k));
    }
    o === "wait" && x.length && (E = x), v(fc(E)), p(c);
    return;
  }
  process.env.NODE_ENV !== "production" && o === "wait" && b.length > 1 && console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
  const { forceRender: w } = Xe(Na);
  return g(It, { children: b.map((E) => {
    const T = fi(E), k = s && !a ? !1 : c === b || u.includes(T), A = () => {
      if (f.has(T))
        f.set(T, !0);
      else
        return;
      let D = !0;
      f.forEach((F) => {
        F || (D = !1);
      }), D && (w == null || w(), v(h.current), s && (l == null || l()), r && r());
    };
    return g(sb, { isPresent: k, initial: !d.current || n ? void 0 : !1, custom: k ? void 0 : t, presenceAffectsLayout: i, mode: o, onExitComplete: k ? void 0 : A, children: E }, T);
  }) });
}, lt = /* @__NO_SIDE_EFFECTS__ */ (e) => e;
let mr = lt, hn = lt;
process.env.NODE_ENV !== "production" && (mr = (e, t) => {
  !e && typeof console < "u" && console.warn(t);
}, hn = (e, t) => {
  if (!e)
    throw new Error(t);
});
// @__NO_SIDE_EFFECTS__
function Oa(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
const ir = /* @__NO_SIDE_EFFECTS__ */ (e, t, n) => {
  const r = t - e;
  return r === 0 ? 1 : (n - e) / r;
}, Vt = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Yt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, lb = {
  useManualTiming: !1
};
function cb(e) {
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
const hi = [
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
], ub = 40;
function Af(e, t) {
  let n = !1, r = !0;
  const i = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, o = () => n = !0, s = hi.reduce((v, x) => (v[x] = cb(o), v), {}), { read: a, resolveKeyframes: l, update: c, preRender: u, render: d, postRender: h } = s, f = () => {
    const v = performance.now();
    n = !1, i.delta = r ? 1e3 / 60 : Math.max(Math.min(v - i.timestamp, ub), 1), i.timestamp = v, i.isProcessing = !0, a.process(i), l.process(i), c.process(i), u.process(i), d.process(i), h.process(i), i.isProcessing = !1, n && t && (r = !1, e(f));
  }, m = () => {
    n = !0, r = !0, i.isProcessing || e(f);
  };
  return { schedule: hi.reduce((v, x) => {
    const w = s[x];
    return v[x] = (E, T = !1, k = !1) => (n || m(), w.schedule(E, T, k)), v;
  }, {}), cancel: (v) => {
    for (let x = 0; x < hi.length; x++)
      s[hi[x]].cancel(v);
  }, state: i, steps: s };
}
const { schedule: Pe, cancel: pn, state: Ue, steps: Yo } = Af(typeof requestAnimationFrame < "u" ? requestAnimationFrame : lt, !0), Rf = fr({ strict: !1 }), hc = {
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
}, or = {};
for (const e in hc)
  or[e] = {
    isEnabled: (t) => hc[e].some((n) => !!t[n])
  };
function db(e) {
  for (const t in e)
    or[t] = {
      ...or[t],
      ...e[t]
    };
}
const fb = /* @__PURE__ */ new Set([
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
function zi(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || fb.has(e);
}
let Nf = (e) => !zi(e);
function hb(e) {
  e && (Nf = (t) => t.startsWith("on") ? !zi(t) : e(t));
}
try {
  hb(require("@emotion/is-prop-valid").default);
} catch {
}
function pb(e, t, n) {
  const r = {};
  for (const i in e)
    i === "values" && typeof e.values == "object" || (Nf(i) || n === !0 && zi(i) || !t && !zi(i) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && i.startsWith("onDrag")) && (r[i] = e[i]);
  return r;
}
const pc = /* @__PURE__ */ new Set();
function yo(e, t, n) {
  e || pc.has(t) || (console.warn(t), pc.add(t));
}
function mb(e) {
  if (typeof Proxy > "u")
    return e;
  const t = /* @__PURE__ */ new Map(), n = (...r) => (process.env.NODE_ENV !== "production" && yo(!1, "motion() is deprecated. Use motion.create() instead."), e(...r));
  return new Proxy(n, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (r, i) => i === "create" ? e : (t.has(i) || t.set(i, e(i)), t.get(i))
  });
}
const vo = fr({});
function jr(e) {
  return typeof e == "string" || Array.isArray(e);
}
function bo(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
const La = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], _a = ["initial", ...La];
function xo(e) {
  return bo(e.animate) || _a.some((t) => jr(e[t]));
}
function If(e) {
  return !!(xo(e) || e.variants);
}
function gb(e, t) {
  if (xo(e)) {
    const { initial: n, animate: r } = e;
    return {
      initial: n === !1 || jr(n) ? n : void 0,
      animate: jr(r) ? r : void 0
    };
  }
  return e.inherit !== !1 ? t : {};
}
function yb(e) {
  const { initial: t, animate: n } = gb(e, Xe(vo));
  return fn(() => ({ initial: t, animate: n }), [mc(t), mc(n)]);
}
function mc(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const vb = Symbol.for("motionComponentSymbol");
function Yn(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function bb(e, t, n) {
  return Ve(
    (r) => {
      r && e.onMount && e.onMount(r), t && (r ? t.mount(r) : t.unmount()), n && (typeof n == "function" ? n(r) : Yn(n) && (n.current = r));
    },
    /**
     * Only pass a new ref callback to React if we've received a visual element
     * factory. Otherwise we'll be mounting/remounting every time externalRef
     * or other dependencies change.
     */
    [t]
  );
}
const Fa = (e) => e.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase(), xb = "framerAppearId", Df = "data-" + Fa(xb), { schedule: Va } = Af(queueMicrotask, !1), Mf = fr({});
function wb(e, t, n, r, i) {
  var o, s;
  const { visualElement: a } = Xe(vo), l = Xe(Rf), c = Xe(mo), u = Xe(Da).reducedMotion, d = Ae(null);
  r = r || l.renderer, !d.current && r && (d.current = r(e, {
    visualState: t,
    parent: a,
    props: n,
    presenceContext: c,
    blockInitialAnimation: c ? c.initial === !1 : !1,
    reducedMotionConfig: u
  }));
  const h = d.current, f = Xe(Mf);
  h && !h.projection && i && (h.type === "html" || h.type === "svg") && Sb(d.current, n, i, f);
  const m = Ae(!1);
  sf(() => {
    h && m.current && h.update(n, c);
  });
  const p = n[Df], b = Ae(!!p && !(!((o = window.MotionHandoffIsComplete) === null || o === void 0) && o.call(window, p)) && ((s = window.MotionHasOptimisedAnimation) === null || s === void 0 ? void 0 : s.call(window, p)));
  return Pf(() => {
    h && (m.current = !0, window.MotionIsMounted = !0, h.updateFeatures(), Va.render(h.render), b.current && h.animationState && h.animationState.animateChanges());
  }), Be(() => {
    h && (!b.current && h.animationState && h.animationState.animateChanges(), b.current && (queueMicrotask(() => {
      var v;
      (v = window.MotionHandoffMarkAsComplete) === null || v === void 0 || v.call(window, p);
    }), b.current = !1));
  }), h;
}
function Sb(e, t, n, r) {
  const { layoutId: i, layout: o, drag: s, dragConstraints: a, layoutScroll: l, layoutRoot: c } = t;
  e.projection = new n(e.latestValues, t["data-framer-portal-id"] ? void 0 : Of(e.parent)), e.projection.setOptions({
    layoutId: i,
    layout: o,
    alwaysMeasureLayout: !!s || a && Yn(a),
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
function Of(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Of(e.parent);
}
function kb({ preloadedFeatures: e, createVisualElement: t, useRender: n, useVisualState: r, Component: i }) {
  var o, s;
  e && db(e);
  function a(c, u) {
    let d;
    const h = {
      ...Xe(Da),
      ...c,
      layoutId: Cb(c)
    }, { isStatic: f } = h, m = yb(c), p = r(c, f);
    if (!f && Ma) {
      Tb(h, e);
      const b = Eb(h);
      d = b.MeasureLayout, m.visualElement = wb(i, p, h, t, b.ProjectionNode);
    }
    return O(vo.Provider, { value: m, children: [d && m.visualElement ? g(d, { visualElement: m.visualElement, ...h }) : null, n(i, c, bb(p, m.visualElement, u), p, f, m.visualElement)] });
  }
  a.displayName = `motion.${typeof i == "string" ? i : `create(${(s = (o = i.displayName) !== null && o !== void 0 ? o : i.name) !== null && s !== void 0 ? s : ""})`}`;
  const l = dr(a);
  return l[vb] = i, l;
}
function Cb({ layoutId: e }) {
  const t = Xe(Na).id;
  return t && e !== void 0 ? t + "-" + e : e;
}
function Tb(e, t) {
  const n = Xe(Rf).strict;
  if (process.env.NODE_ENV !== "production" && t && n) {
    const r = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
    e.ignoreStrict ? mr(!1, r) : hn(!1, r);
  }
}
function Eb(e) {
  const { drag: t, layout: n } = or;
  if (!t && !n)
    return {};
  const r = { ...t, ...n };
  return {
    MeasureLayout: t != null && t.isEnabled(e) || n != null && n.isEnabled(e) ? r.MeasureLayout : void 0,
    ProjectionNode: r.ProjectionNode
  };
}
const Pb = [
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
function Ba(e) {
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
      !!(Pb.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function gc(e) {
  const t = [{}, {}];
  return e == null || e.values.forEach((n, r) => {
    t[0][r] = n.get(), t[1][r] = n.getVelocity();
  }), t;
}
function za(e, t, n, r) {
  if (typeof t == "function") {
    const [i, o] = gc(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
    const [i, o] = gc(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  return t;
}
const Ms = (e) => Array.isArray(e), Ab = (e) => !!(e && typeof e == "object" && e.mix && e.toValue), Rb = (e) => Ms(e) ? e[e.length - 1] || 0 : e, Ze = (e) => !!(e && e.getVelocity);
function Ai(e) {
  const t = Ze(e) ? e.get() : e;
  return Ab(t) ? t.toValue() : t;
}
function Nb({ scrapeMotionValuesFromProps: e, createRenderState: t, onUpdate: n }, r, i, o) {
  const s = {
    latestValues: Ib(r, i, o, e),
    renderState: t()
  };
  return n && (s.onMount = (a) => n({ props: r, current: a, ...s }), s.onUpdate = (a) => n(a)), s;
}
const Lf = (e) => (t, n) => {
  const r = Xe(vo), i = Xe(mo), o = () => Nb(e, t, r, i);
  return n ? o() : Ia(o);
};
function Ib(e, t, n, r) {
  const i = {}, o = r(e, {});
  for (const h in o)
    i[h] = Ai(o[h]);
  let { initial: s, animate: a } = e;
  const l = xo(e), c = If(e);
  t && c && !l && e.inherit !== !1 && (s === void 0 && (s = t.initial), a === void 0 && (a = t.animate));
  let u = n ? n.initial === !1 : !1;
  u = u || s === !1;
  const d = u ? a : s;
  if (d && typeof d != "boolean" && !bo(d)) {
    const h = Array.isArray(d) ? d : [d];
    for (let f = 0; f < h.length; f++) {
      const m = za(e, h[f]);
      if (m) {
        const { transitionEnd: p, transition: b, ...v } = m;
        for (const x in v) {
          let w = v[x];
          if (Array.isArray(w)) {
            const E = u ? w.length - 1 : 0;
            w = w[E];
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
const gr = [
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
], $n = new Set(gr), _f = (e) => (t) => typeof t == "string" && t.startsWith(e), Ff = /* @__PURE__ */ _f("--"), Db = /* @__PURE__ */ _f("var(--"), $a = (e) => Db(e) ? Mb.test(e.split("/*")[0].trim()) : !1, Mb = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu, Vf = (e, t) => t && typeof e == "number" ? t.transform(e) : e, Zt = (e, t, n) => n > t ? t : n < e ? e : n, yr = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, Ur = {
  ...yr,
  transform: (e) => Zt(0, 1, e)
}, pi = {
  ...yr,
  default: 1
}, ei = (e) => ({
  test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: (t) => `${t}${e}`
}), un = /* @__PURE__ */ ei("deg"), Bt = /* @__PURE__ */ ei("%"), J = /* @__PURE__ */ ei("px"), Ob = /* @__PURE__ */ ei("vh"), Lb = /* @__PURE__ */ ei("vw"), yc = {
  ...Bt,
  parse: (e) => Bt.parse(e) / 100,
  transform: (e) => Bt.transform(e * 100)
}, _b = {
  // Border props
  borderWidth: J,
  borderTopWidth: J,
  borderRightWidth: J,
  borderBottomWidth: J,
  borderLeftWidth: J,
  borderRadius: J,
  radius: J,
  borderTopLeftRadius: J,
  borderTopRightRadius: J,
  borderBottomRightRadius: J,
  borderBottomLeftRadius: J,
  // Positioning props
  width: J,
  maxWidth: J,
  height: J,
  maxHeight: J,
  top: J,
  right: J,
  bottom: J,
  left: J,
  // Spacing props
  padding: J,
  paddingTop: J,
  paddingRight: J,
  paddingBottom: J,
  paddingLeft: J,
  margin: J,
  marginTop: J,
  marginRight: J,
  marginBottom: J,
  marginLeft: J,
  // Misc
  backgroundPositionX: J,
  backgroundPositionY: J
}, Fb = {
  rotate: un,
  rotateX: un,
  rotateY: un,
  rotateZ: un,
  scale: pi,
  scaleX: pi,
  scaleY: pi,
  scaleZ: pi,
  skew: un,
  skewX: un,
  skewY: un,
  distance: J,
  translateX: J,
  translateY: J,
  translateZ: J,
  x: J,
  y: J,
  z: J,
  perspective: J,
  transformPerspective: J,
  opacity: Ur,
  originX: yc,
  originY: yc,
  originZ: J
}, vc = {
  ...yr,
  transform: Math.round
}, ja = {
  ..._b,
  ...Fb,
  zIndex: vc,
  size: J,
  // SVG
  fillOpacity: Ur,
  strokeOpacity: Ur,
  numOctaves: vc
}, Vb = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, Bb = gr.length;
function zb(e, t, n) {
  let r = "", i = !0;
  for (let o = 0; o < Bb; o++) {
    const s = gr[o], a = e[s];
    if (a === void 0)
      continue;
    let l = !0;
    if (typeof a == "number" ? l = a === (s.startsWith("scale") ? 1 : 0) : l = parseFloat(a) === 0, !l || n) {
      const c = Vf(a, ja[s]);
      if (!l) {
        i = !1;
        const u = Vb[s] || s;
        r += `${u}(${c}) `;
      }
      n && (t[s] = c);
    }
  }
  return r = r.trim(), n ? r = n(t, i ? "" : r) : i && (r = "none"), r;
}
function Ua(e, t, n) {
  const { style: r, vars: i, transformOrigin: o } = e;
  let s = !1, a = !1;
  for (const l in t) {
    const c = t[l];
    if ($n.has(l)) {
      s = !0;
      continue;
    } else if (Ff(l)) {
      i[l] = c;
      continue;
    } else {
      const u = Vf(c, ja[l]);
      l.startsWith("origin") ? (a = !0, o[l] = u) : r[l] = u;
    }
  }
  if (t.transform || (s || n ? r.transform = zb(t, e.transform, n) : r.transform && (r.transform = "none")), a) {
    const { originX: l = "50%", originY: c = "50%", originZ: u = 0 } = o;
    r.transformOrigin = `${l} ${c} ${u}`;
  }
}
const $b = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, jb = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function Ub(e, t, n = 1, r = 0, i = !0) {
  e.pathLength = 1;
  const o = i ? $b : jb;
  e[o.offset] = J.transform(-r);
  const s = J.transform(t), a = J.transform(n);
  e[o.array] = `${s} ${a}`;
}
function bc(e, t, n) {
  return typeof e == "string" ? e : J.transform(t + n * e);
}
function Hb(e, t, n) {
  const r = bc(t, e.x, e.width), i = bc(n, e.y, e.height);
  return `${r} ${i}`;
}
function Ha(e, {
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
  if (Ua(e, c, d), u) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: h, style: f, dimensions: m } = e;
  h.transform && (m && (f.transform = h.transform), delete h.transform), m && (i !== void 0 || o !== void 0 || f.transform) && (f.transformOrigin = Hb(m, i !== void 0 ? i : 0.5, o !== void 0 ? o : 0.5)), t !== void 0 && (h.x = t), n !== void 0 && (h.y = n), r !== void 0 && (h.scale = r), s !== void 0 && Ub(h, s, a, l, !1);
}
const Wa = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
}), Bf = () => ({
  ...Wa(),
  attrs: {}
}), qa = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function zf(e, { style: t, vars: n }, r, i) {
  Object.assign(e.style, t, i && i.getProjectionStyles(r));
  for (const o in n)
    e.style.setProperty(o, n[o]);
}
const $f = /* @__PURE__ */ new Set([
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
function jf(e, t, n, r) {
  zf(e, t, void 0, r);
  for (const i in t.attrs)
    e.setAttribute($f.has(i) ? i : Fa(i), t.attrs[i]);
}
const $i = {};
function Wb(e) {
  Object.assign($i, e);
}
function Uf(e, { layout: t, layoutId: n }) {
  return $n.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!$i[e] || e === "opacity");
}
function Ka(e, t, n) {
  var r;
  const { style: i } = e, o = {};
  for (const s in i)
    (Ze(i[s]) || t.style && Ze(t.style[s]) || Uf(s, e) || ((r = n == null ? void 0 : n.getValue(s)) === null || r === void 0 ? void 0 : r.liveStyle) !== void 0) && (o[s] = i[s]);
  return o;
}
function Hf(e, t, n) {
  const r = Ka(e, t, n);
  for (const i in e)
    if (Ze(e[i]) || Ze(t[i])) {
      const o = gr.indexOf(i) !== -1 ? "attr" + i.charAt(0).toUpperCase() + i.substring(1) : i;
      r[o] = e[i];
    }
  return r;
}
function qb(e, t) {
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
const xc = ["x", "y", "width", "height", "cx", "cy", "r"], Kb = {
  useVisualState: Lf({
    scrapeMotionValuesFromProps: Hf,
    createRenderState: Bf,
    onUpdate: ({ props: e, prevProps: t, current: n, renderState: r, latestValues: i }) => {
      if (!n)
        return;
      let o = !!e.drag;
      if (!o) {
        for (const a in i)
          if ($n.has(a)) {
            o = !0;
            break;
          }
      }
      if (!o)
        return;
      let s = !t;
      if (t)
        for (let a = 0; a < xc.length; a++) {
          const l = xc[a];
          e[l] !== t[l] && (s = !0);
        }
      s && Pe.read(() => {
        qb(n, r), Pe.render(() => {
          Ha(r, i, qa(n.tagName), e.transformTemplate), jf(n, r);
        });
      });
    }
  })
}, Gb = {
  useVisualState: Lf({
    scrapeMotionValuesFromProps: Ka,
    createRenderState: Wa
  })
};
function Wf(e, t, n) {
  for (const r in t)
    !Ze(t[r]) && !Uf(r, n) && (e[r] = t[r]);
}
function Yb({ transformTemplate: e }, t) {
  return fn(() => {
    const n = Wa();
    return Ua(n, t, e), Object.assign({}, n.vars, n.style);
  }, [t]);
}
function Xb(e, t) {
  const n = e.style || {}, r = {};
  return Wf(r, n, e), Object.assign(r, Yb(e, t)), r;
}
function Zb(e, t) {
  const n = {}, r = Xb(e, t);
  return e.drag && e.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
function Jb(e, t, n, r) {
  const i = fn(() => {
    const o = Bf();
    return Ha(o, t, qa(r), e.transformTemplate), {
      ...o.attrs,
      style: { ...o.style }
    };
  }, [t]);
  if (e.style) {
    const o = {};
    Wf(o, e.style, e), i.style = { ...o, ...i.style };
  }
  return i;
}
function Qb(e = !1) {
  return (n, r, i, { latestValues: o }, s) => {
    const l = (Ba(n) ? Jb : Zb)(r, o, s, n), c = pb(r, typeof n == "string", e), u = n !== af ? { ...c, ...l, ref: i } : {}, { children: d } = r, h = fn(() => Ze(d) ? d.get() : d, [d]);
    return Fi(n, {
      ...u,
      children: h
    });
  };
}
function ex(e, t) {
  return function(r, { forwardMotionProps: i } = { forwardMotionProps: !1 }) {
    const s = {
      ...Ba(r) ? Kb : Gb,
      preloadedFeatures: e,
      useRender: Qb(i),
      createVisualElement: t,
      Component: r
    };
    return kb(s);
  };
}
function qf(e, t) {
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
function wo(e, t, n) {
  const r = e.getProps();
  return za(r, t, n !== void 0 ? n : r.custom, e);
}
const tx = /* @__PURE__ */ Oa(() => window.ScrollTimeline !== void 0);
class nx {
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
      if (tx() && i.attachTimeline)
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
class rx extends nx {
  then(t, n) {
    return Promise.all(this.animations).then(t).catch(n);
  }
}
function Ga(e, t) {
  return e ? e[t] || e.default || e : void 0;
}
const Os = 2e4;
function Kf(e) {
  let t = 0;
  const n = 50;
  let r = e.next(t);
  for (; !r.done && t < Os; )
    t += n, r = e.next(t);
  return t >= Os ? 1 / 0 : t;
}
function Ya(e) {
  return typeof e == "function";
}
function wc(e, t) {
  e.timeline = t, e.onfinish = null;
}
const Xa = (e) => Array.isArray(e) && typeof e[0] == "number", ix = {
  linearEasing: void 0
};
function ox(e, t) {
  const n = /* @__PURE__ */ Oa(e);
  return () => {
    var r;
    return (r = ix[t]) !== null && r !== void 0 ? r : n();
  };
}
const ji = /* @__PURE__ */ ox(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), Gf = (e, t, n = 10) => {
  let r = "";
  const i = Math.max(Math.round(t / n), 2);
  for (let o = 0; o < i; o++)
    r += e(/* @__PURE__ */ ir(0, i - 1, o)) + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
};
function Yf(e) {
  return !!(typeof e == "function" && ji() || !e || typeof e == "string" && (e in Ls || ji()) || Xa(e) || Array.isArray(e) && e.every(Yf));
}
const Ir = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`, Ls = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ Ir([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ Ir([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ Ir([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ Ir([0.33, 1.53, 0.69, 0.99])
};
function Xf(e, t) {
  if (e)
    return typeof e == "function" && ji() ? Gf(e, t) : Xa(e) ? Ir(e) : Array.isArray(e) ? e.map((n) => Xf(n, t) || Ls.easeOut) : Ls[e];
}
const At = {
  x: !1,
  y: !1
};
function Zf() {
  return At.x || At.y;
}
function sx(e, t, n) {
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
function Jf(e, t) {
  const n = sx(e), r = new AbortController(), i = {
    passive: !0,
    ...t,
    signal: r.signal
  };
  return [n, i, () => r.abort()];
}
function Sc(e) {
  return (t) => {
    t.pointerType === "touch" || Zf() || e(t);
  };
}
function ax(e, t, n = {}) {
  const [r, i, o] = Jf(e, n), s = Sc((a) => {
    const { target: l } = a, c = t(a);
    if (typeof c != "function" || !l)
      return;
    const u = Sc((d) => {
      c(d), l.removeEventListener("pointerleave", u);
    });
    l.addEventListener("pointerleave", u, i);
  });
  return r.forEach((a) => {
    a.addEventListener("pointerenter", s, i);
  }), o;
}
const Qf = (e, t) => t ? e === t ? !0 : Qf(e, t.parentElement) : !1, Za = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, lx = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function cx(e) {
  return lx.has(e.tagName) || e.tabIndex !== -1;
}
const Dr = /* @__PURE__ */ new WeakSet();
function kc(e) {
  return (t) => {
    t.key === "Enter" && e(t);
  };
}
function Xo(e, t) {
  e.dispatchEvent(new PointerEvent("pointer" + t, { isPrimary: !0, bubbles: !0 }));
}
const ux = (e, t) => {
  const n = e.currentTarget;
  if (!n)
    return;
  const r = kc(() => {
    if (Dr.has(n))
      return;
    Xo(n, "down");
    const i = kc(() => {
      Xo(n, "up");
    }), o = () => Xo(n, "cancel");
    n.addEventListener("keyup", i, t), n.addEventListener("blur", o, t);
  });
  n.addEventListener("keydown", r, t), n.addEventListener("blur", () => n.removeEventListener("keydown", r), t);
};
function Cc(e) {
  return Za(e) && !Zf();
}
function dx(e, t, n = {}) {
  const [r, i, o] = Jf(e, n), s = (a) => {
    const l = a.currentTarget;
    if (!Cc(a) || Dr.has(l))
      return;
    Dr.add(l);
    const c = t(a), u = (f, m) => {
      window.removeEventListener("pointerup", d), window.removeEventListener("pointercancel", h), !(!Cc(f) || !Dr.has(l)) && (Dr.delete(l), typeof c == "function" && c(f, { success: m }));
    }, d = (f) => {
      u(f, n.useGlobalTarget || Qf(l, f.target));
    }, h = (f) => {
      u(f, !1);
    };
    window.addEventListener("pointerup", d, i), window.addEventListener("pointercancel", h, i);
  };
  return r.forEach((a) => {
    !cx(a) && a.getAttribute("tabindex") === null && (a.tabIndex = 0), (n.useGlobalTarget ? window : a).addEventListener("pointerdown", s, i), a.addEventListener("focus", (c) => ux(c, i), i);
  }), o;
}
function fx(e) {
  return e === "x" || e === "y" ? At[e] ? null : (At[e] = !0, () => {
    At[e] = !1;
  }) : At.x || At.y ? null : (At.x = At.y = !0, () => {
    At.x = At.y = !1;
  });
}
const eh = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...gr
]);
let Ri;
function hx() {
  Ri = void 0;
}
const zt = {
  now: () => (Ri === void 0 && zt.set(Ue.isProcessing || lb.useManualTiming ? Ue.timestamp : performance.now()), Ri),
  set: (e) => {
    Ri = e, queueMicrotask(hx);
  }
};
function Ja(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function Qa(e, t) {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
class el {
  constructor() {
    this.subscriptions = [];
  }
  add(t) {
    return Ja(this.subscriptions, t), () => Qa(this.subscriptions, t);
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
function th(e, t) {
  return t ? e * (1e3 / t) : 0;
}
const Tc = 30, px = (e) => !isNaN(parseFloat(e));
class mx {
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
      const o = zt.now();
      this.updatedAt !== o && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && this.events.change && this.events.change.notify(this.current), i && this.events.renderRequest && this.events.renderRequest.notify(this.current);
    }, this.hasAnimated = !1, this.setCurrent(t), this.owner = n.owner;
  }
  setCurrent(t) {
    this.current = t, this.updatedAt = zt.now(), this.canTrackVelocity === null && t !== void 0 && (this.canTrackVelocity = px(this.current));
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
    return process.env.NODE_ENV !== "production" && yo(!1, 'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'), this.on("change", t);
  }
  on(t, n) {
    this.events[t] || (this.events[t] = new el());
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
    const t = zt.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || t - this.updatedAt > Tc)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, Tc);
    return th(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
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
function Hr(e, t) {
  return new mx(e, t);
}
function gx(e, t, n) {
  e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, Hr(n));
}
function yx(e, t) {
  const n = wo(e, t);
  let { transitionEnd: r = {}, transition: i = {}, ...o } = n || {};
  o = { ...o, ...r };
  for (const s in o) {
    const a = Rb(o[s]);
    gx(e, s, a);
  }
}
function vx(e) {
  return !!(Ze(e) && e.add);
}
function _s(e, t) {
  const n = e.getValue("willChange");
  if (vx(n))
    return n.add(t);
}
function nh(e) {
  return e.props[Df];
}
const rh = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e, bx = 1e-7, xx = 12;
function wx(e, t, n, r, i) {
  let o, s, a = 0;
  do
    s = t + (n - t) / 2, o = rh(s, r, i) - e, o > 0 ? n = s : t = s;
  while (Math.abs(o) > bx && ++a < xx);
  return s;
}
function ti(e, t, n, r) {
  if (e === t && n === r)
    return lt;
  const i = (o) => wx(o, 0, 1, e, n);
  return (o) => o === 0 || o === 1 ? o : rh(i(o), t, r);
}
const ih = (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, oh = (e) => (t) => 1 - e(1 - t), sh = /* @__PURE__ */ ti(0.33, 1.53, 0.69, 0.99), tl = /* @__PURE__ */ oh(sh), ah = /* @__PURE__ */ ih(tl), lh = (e) => (e *= 2) < 1 ? 0.5 * tl(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), nl = (e) => 1 - Math.sin(Math.acos(e)), ch = oh(nl), uh = ih(nl), dh = (e) => /^0[^.\s]+$/u.test(e);
function Sx(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || dh(e) : !0;
}
const Lr = (e) => Math.round(e * 1e5) / 1e5, rl = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function kx(e) {
  return e == null;
}
const Cx = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, il = (e, t) => (n) => !!(typeof n == "string" && Cx.test(n) && n.startsWith(e) || t && !kx(n) && Object.prototype.hasOwnProperty.call(n, t)), fh = (e, t, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [i, o, s, a] = r.match(rl);
  return {
    [e]: parseFloat(i),
    [t]: parseFloat(o),
    [n]: parseFloat(s),
    alpha: a !== void 0 ? parseFloat(a) : 1
  };
}, Tx = (e) => Zt(0, 255, e), Zo = {
  ...yr,
  transform: (e) => Math.round(Tx(e))
}, Dn = {
  test: /* @__PURE__ */ il("rgb", "red"),
  parse: /* @__PURE__ */ fh("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: n, alpha: r = 1 }) => "rgba(" + Zo.transform(e) + ", " + Zo.transform(t) + ", " + Zo.transform(n) + ", " + Lr(Ur.transform(r)) + ")"
};
function Ex(e) {
  let t = "", n = "", r = "", i = "";
  return e.length > 5 ? (t = e.substring(1, 3), n = e.substring(3, 5), r = e.substring(5, 7), i = e.substring(7, 9)) : (t = e.substring(1, 2), n = e.substring(2, 3), r = e.substring(3, 4), i = e.substring(4, 5), t += t, n += n, r += r, i += i), {
    red: parseInt(t, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: i ? parseInt(i, 16) / 255 : 1
  };
}
const Fs = {
  test: /* @__PURE__ */ il("#"),
  parse: Ex,
  transform: Dn.transform
}, Xn = {
  test: /* @__PURE__ */ il("hsl", "hue"),
  parse: /* @__PURE__ */ fh("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(e) + ", " + Bt.transform(Lr(t)) + ", " + Bt.transform(Lr(n)) + ", " + Lr(Ur.transform(r)) + ")"
}, Ye = {
  test: (e) => Dn.test(e) || Fs.test(e) || Xn.test(e),
  parse: (e) => Dn.test(e) ? Dn.parse(e) : Xn.test(e) ? Xn.parse(e) : Fs.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? Dn.transform(e) : Xn.transform(e)
}, Px = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function Ax(e) {
  var t, n;
  return isNaN(e) && typeof e == "string" && (((t = e.match(rl)) === null || t === void 0 ? void 0 : t.length) || 0) + (((n = e.match(Px)) === null || n === void 0 ? void 0 : n.length) || 0) > 0;
}
const hh = "number", ph = "color", Rx = "var", Nx = "var(", Ec = "${}", Ix = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Wr(e) {
  const t = e.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, i = [];
  let o = 0;
  const a = t.replace(Ix, (l) => (Ye.test(l) ? (r.color.push(o), i.push(ph), n.push(Ye.parse(l))) : l.startsWith(Nx) ? (r.var.push(o), i.push(Rx), n.push(l)) : (r.number.push(o), i.push(hh), n.push(parseFloat(l))), ++o, Ec)).split(Ec);
  return { values: n, split: a, indexes: r, types: i };
}
function mh(e) {
  return Wr(e).values;
}
function gh(e) {
  const { split: t, types: n } = Wr(e), r = t.length;
  return (i) => {
    let o = "";
    for (let s = 0; s < r; s++)
      if (o += t[s], i[s] !== void 0) {
        const a = n[s];
        a === hh ? o += Lr(i[s]) : a === ph ? o += Ye.transform(i[s]) : o += i[s];
      }
    return o;
  };
}
const Dx = (e) => typeof e == "number" ? 0 : e;
function Mx(e) {
  const t = mh(e);
  return gh(e)(t.map(Dx));
}
const mn = {
  test: Ax,
  parse: mh,
  createTransformer: gh,
  getAnimatableNone: Mx
}, Ox = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function Lx(e) {
  const [t, n] = e.slice(0, -1).split("(");
  if (t === "drop-shadow")
    return e;
  const [r] = n.match(rl) || [];
  if (!r)
    return e;
  const i = n.replace(r, "");
  let o = Ox.has(t) ? 1 : 0;
  return r !== n && (o *= 100), t + "(" + o + i + ")";
}
const _x = /\b([a-z-]*)\(.*?\)/gu, Vs = {
  ...mn,
  getAnimatableNone: (e) => {
    const t = e.match(_x);
    return t ? t.map(Lx).join(" ") : e;
  }
}, Fx = {
  ...ja,
  // Color props
  color: Ye,
  backgroundColor: Ye,
  outlineColor: Ye,
  fill: Ye,
  stroke: Ye,
  // Border props
  borderColor: Ye,
  borderTopColor: Ye,
  borderRightColor: Ye,
  borderBottomColor: Ye,
  borderLeftColor: Ye,
  filter: Vs,
  WebkitFilter: Vs
}, ol = (e) => Fx[e];
function yh(e, t) {
  let n = ol(e);
  return n !== Vs && (n = mn), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0;
}
const Vx = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function Bx(e, t, n) {
  let r = 0, i;
  for (; r < e.length && !i; ) {
    const o = e[r];
    typeof o == "string" && !Vx.has(o) && Wr(o).values.length && (i = e[r]), r++;
  }
  if (i && n)
    for (const o of t)
      e[o] = yh(n, i);
}
const Pc = (e) => e === yr || e === J, Ac = (e, t) => parseFloat(e.split(", ")[t]), Rc = (e, t) => (n, { transform: r }) => {
  if (r === "none" || !r)
    return 0;
  const i = r.match(/^matrix3d\((.+)\)$/u);
  if (i)
    return Ac(i[1], t);
  {
    const o = r.match(/^matrix\((.+)\)$/u);
    return o ? Ac(o[1], e) : 0;
  }
}, zx = /* @__PURE__ */ new Set(["x", "y", "z"]), $x = gr.filter((e) => !zx.has(e));
function jx(e) {
  const t = [];
  return $x.forEach((n) => {
    const r = e.getValue(n);
    r !== void 0 && (t.push([n, r.get()]), r.set(n.startsWith("scale") ? 1 : 0));
  }), t;
}
const sr = {
  // Dimensions
  width: ({ x: e }, { paddingLeft: t = "0", paddingRight: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  height: ({ y: e }, { paddingTop: t = "0", paddingBottom: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  top: (e, { top: t }) => parseFloat(t),
  left: (e, { left: t }) => parseFloat(t),
  bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
  right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
  // Transform
  x: Rc(4, 13),
  y: Rc(5, 14)
};
sr.translateX = sr.x;
sr.translateY = sr.y;
const Mn = /* @__PURE__ */ new Set();
let Bs = !1, zs = !1;
function vh() {
  if (zs) {
    const e = Array.from(Mn).filter((r) => r.needsMeasurement), t = new Set(e.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    t.forEach((r) => {
      const i = jx(r);
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
  zs = !1, Bs = !1, Mn.forEach((e) => e.complete()), Mn.clear();
}
function bh() {
  Mn.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (zs = !0);
  });
}
function Ux() {
  bh(), vh();
}
class sl {
  constructor(t, n, r, i, o, s = !1) {
    this.isComplete = !1, this.isAsync = !1, this.needsMeasurement = !1, this.isScheduled = !1, this.unresolvedKeyframes = [...t], this.onComplete = n, this.name = r, this.motionValue = i, this.element = o, this.isAsync = s;
  }
  scheduleResolve() {
    this.isScheduled = !0, this.isAsync ? (Mn.add(this), Bs || (Bs = !0, Pe.read(bh), Pe.resolveKeyframes(vh))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: t, name: n, element: r, motionValue: i } = this;
    for (let o = 0; o < t.length; o++)
      if (t[o] === null)
        if (o === 0) {
          const s = i == null ? void 0 : i.get(), a = t[t.length - 1];
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
    this.isComplete = !0, this.onComplete(this.unresolvedKeyframes, this.finalKeyframe), Mn.delete(this);
  }
  cancel() {
    this.isComplete || (this.isScheduled = !1, Mn.delete(this));
  }
  resume() {
    this.isComplete || this.scheduleResolve();
  }
}
const xh = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), Hx = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function Wx(e) {
  const t = Hx.exec(e);
  if (!t)
    return [,];
  const [, n, r, i] = t;
  return [`--${n ?? r}`, i];
}
const qx = 4;
function wh(e, t, n = 1) {
  hn(n <= qx, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`);
  const [r, i] = Wx(e);
  if (!r)
    return;
  const o = window.getComputedStyle(t).getPropertyValue(r);
  if (o) {
    const s = o.trim();
    return xh(s) ? parseFloat(s) : s;
  }
  return $a(i) ? wh(i, t, n + 1) : i;
}
const Sh = (e) => (t) => t.test(e), Kx = {
  test: (e) => e === "auto",
  parse: (e) => e
}, kh = [yr, J, Bt, un, Lb, Ob, Kx], Nc = (e) => kh.find(Sh(e));
class Ch extends sl {
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
      if (typeof c == "string" && (c = c.trim(), $a(c))) {
        const u = wh(c, n.current);
        u !== void 0 && (t[l] = u), l === t.length - 1 && (this.finalKeyframe = c);
      }
    }
    if (this.resolveNoneKeyframes(), !eh.has(r) || t.length !== 2)
      return;
    const [i, o] = t, s = Nc(i), a = Nc(o);
    if (s !== a)
      if (Pc(s) && Pc(a))
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
      Sx(t[i]) && r.push(i);
    r.length && Bx(t, r, n);
  }
  measureInitialState() {
    const { element: t, unresolvedKeyframes: n, name: r } = this;
    if (!t || !t.current)
      return;
    r === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = sr[r](t.measureViewportBox(), window.getComputedStyle(t.current)), n[0] = this.measuredOrigin;
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
    i[s] = sr[r](n.measureViewportBox(), window.getComputedStyle(n.current)), a !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = a), !((t = this.removedTransforms) === null || t === void 0) && t.length && this.removedTransforms.forEach(([l, c]) => {
      n.getValue(l).set(c);
    }), this.resolveNoneKeyframes();
  }
}
const Ic = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(mn.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function Gx(e) {
  const t = e[0];
  if (e.length === 1)
    return !0;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t)
      return !0;
}
function Yx(e, t, n, r) {
  const i = e[0];
  if (i === null)
    return !1;
  if (t === "display" || t === "visibility")
    return !0;
  const o = e[e.length - 1], s = Ic(i, t), a = Ic(o, t);
  return mr(s === a, `You are trying to animate ${t} from "${i}" to "${o}". ${i} is not an animatable value - to enable this animation set ${i} to a value animatable to ${o} via the \`style\` property.`), !s || !a ? !1 : Gx(e) || (n === "spring" || Ya(n)) && r;
}
const Xx = (e) => e !== null;
function So(e, { repeat: t, repeatType: n = "loop" }, r) {
  const i = e.filter(Xx), o = t && n !== "loop" && t % 2 === 1 ? 0 : i.length - 1;
  return !o || r === void 0 ? i[o] : r;
}
const Zx = 40;
class Th {
  constructor({ autoplay: t = !0, delay: n = 0, type: r = "keyframes", repeat: i = 0, repeatDelay: o = 0, repeatType: s = "loop", ...a }) {
    this.isStopped = !1, this.hasAttemptedResolve = !1, this.createdAt = zt.now(), this.options = {
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
    return this.resolvedAt ? this.resolvedAt - this.createdAt > Zx ? this.resolvedAt : this.createdAt : this.createdAt;
  }
  /**
   * A getter for resolved data. If keyframes are not yet resolved, accessing
   * this.resolved will synchronously flush all pending keyframe resolvers.
   * This is a deoptimisation, but at its worst still batches read/writes.
   */
  get resolved() {
    return !this._resolved && !this.hasAttemptedResolve && Ux(), this._resolved;
  }
  /**
   * A method to be called when the keyframes resolver completes. This method
   * will check if its possible to run the animation and, if not, skip it.
   * Otherwise, it will call initPlayback on the implementing class.
   */
  onKeyframesResolved(t, n) {
    this.resolvedAt = zt.now(), this.hasAttemptedResolve = !0;
    const { name: r, type: i, velocity: o, delay: s, onComplete: a, onUpdate: l, isGenerator: c } = this.options;
    if (!c && !Yx(t, r, i, o))
      if (s)
        this.options.duration = 0;
      else {
        l && l(So(t, this.options, n)), a && a(), this.resolveFinishedPromise();
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
function Jo(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function Jx({ hue: e, saturation: t, lightness: n, alpha: r }) {
  e /= 360, t /= 100, n /= 100;
  let i = 0, o = 0, s = 0;
  if (!t)
    i = o = s = n;
  else {
    const a = n < 0.5 ? n * (1 + t) : n + t - n * t, l = 2 * n - a;
    i = Jo(l, a, e + 1 / 3), o = Jo(l, a, e), s = Jo(l, a, e - 1 / 3);
  }
  return {
    red: Math.round(i * 255),
    green: Math.round(o * 255),
    blue: Math.round(s * 255),
    alpha: r
  };
}
function Ui(e, t) {
  return (n) => n > 0 ? t : e;
}
const Qo = (e, t, n) => {
  const r = e * e, i = n * (t * t - r) + r;
  return i < 0 ? 0 : Math.sqrt(i);
}, Qx = [Fs, Dn, Xn], ew = (e) => Qx.find((t) => t.test(e));
function Dc(e) {
  const t = ew(e);
  if (mr(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`), !t)
    return !1;
  let n = t.parse(e);
  return t === Xn && (n = Jx(n)), n;
}
const Mc = (e, t) => {
  const n = Dc(e), r = Dc(t);
  if (!n || !r)
    return Ui(e, t);
  const i = { ...n };
  return (o) => (i.red = Qo(n.red, r.red, o), i.green = Qo(n.green, r.green, o), i.blue = Qo(n.blue, r.blue, o), i.alpha = De(n.alpha, r.alpha, o), Dn.transform(i));
}, tw = (e, t) => (n) => t(e(n)), ni = (...e) => e.reduce(tw), $s = /* @__PURE__ */ new Set(["none", "hidden"]);
function nw(e, t) {
  return $s.has(e) ? (n) => n <= 0 ? e : t : (n) => n >= 1 ? t : e;
}
function rw(e, t) {
  return (n) => De(e, t, n);
}
function al(e) {
  return typeof e == "number" ? rw : typeof e == "string" ? $a(e) ? Ui : Ye.test(e) ? Mc : sw : Array.isArray(e) ? Eh : typeof e == "object" ? Ye.test(e) ? Mc : iw : Ui;
}
function Eh(e, t) {
  const n = [...e], r = n.length, i = e.map((o, s) => al(o)(o, t[s]));
  return (o) => {
    for (let s = 0; s < r; s++)
      n[s] = i[s](o);
    return n;
  };
}
function iw(e, t) {
  const n = { ...e, ...t }, r = {};
  for (const i in n)
    e[i] !== void 0 && t[i] !== void 0 && (r[i] = al(e[i])(e[i], t[i]));
  return (i) => {
    for (const o in r)
      n[o] = r[o](i);
    return n;
  };
}
function ow(e, t) {
  var n;
  const r = [], i = { color: 0, var: 0, number: 0 };
  for (let o = 0; o < t.values.length; o++) {
    const s = t.types[o], a = e.indexes[s][i[s]], l = (n = e.values[a]) !== null && n !== void 0 ? n : 0;
    r[o] = l, i[s]++;
  }
  return r;
}
const sw = (e, t) => {
  const n = mn.createTransformer(t), r = Wr(e), i = Wr(t);
  return r.indexes.var.length === i.indexes.var.length && r.indexes.color.length === i.indexes.color.length && r.indexes.number.length >= i.indexes.number.length ? $s.has(e) && !i.values.length || $s.has(t) && !r.values.length ? nw(e, t) : ni(Eh(ow(r, i), i.values), n) : (mr(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`), Ui(e, t));
};
function Ph(e, t, n) {
  return typeof e == "number" && typeof t == "number" && typeof n == "number" ? De(e, t, n) : al(e)(e, t);
}
const aw = 5;
function Ah(e, t, n) {
  const r = Math.max(t - aw, 0);
  return th(n - e(r), t - r);
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
}, es = 1e-3;
function lw({ duration: e = Ie.duration, bounce: t = Ie.bounce, velocity: n = Ie.velocity, mass: r = Ie.mass }) {
  let i, o;
  mr(e <= /* @__PURE__ */ Vt(Ie.maxDuration), "Spring duration must be 10 seconds or less");
  let s = 1 - t;
  s = Zt(Ie.minDamping, Ie.maxDamping, s), e = Zt(Ie.minDuration, Ie.maxDuration, /* @__PURE__ */ Yt(e)), s < 1 ? (i = (c) => {
    const u = c * s, d = u * e, h = u - n, f = js(c, s), m = Math.exp(-d);
    return es - h / f * m;
  }, o = (c) => {
    const d = c * s * e, h = d * n + n, f = Math.pow(s, 2) * Math.pow(c, 2) * e, m = Math.exp(-d), p = js(Math.pow(c, 2), s);
    return (-i(c) + es > 0 ? -1 : 1) * ((h - f) * m) / p;
  }) : (i = (c) => {
    const u = Math.exp(-c * e), d = (c - n) * e + 1;
    return -es + u * d;
  }, o = (c) => {
    const u = Math.exp(-c * e), d = (n - c) * (e * e);
    return u * d;
  });
  const a = 5 / e, l = uw(i, o, a);
  if (e = /* @__PURE__ */ Vt(e), isNaN(l))
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
const cw = 12;
function uw(e, t, n) {
  let r = n;
  for (let i = 1; i < cw; i++)
    r = r - e(r) / t(r);
  return r;
}
function js(e, t) {
  return e * Math.sqrt(1 - t * t);
}
const dw = ["duration", "bounce"], fw = ["stiffness", "damping", "mass"];
function Oc(e, t) {
  return t.some((n) => e[n] !== void 0);
}
function hw(e) {
  let t = {
    velocity: Ie.velocity,
    stiffness: Ie.stiffness,
    damping: Ie.damping,
    mass: Ie.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!Oc(e, fw) && Oc(e, dw))
    if (e.visualDuration) {
      const n = e.visualDuration, r = 2 * Math.PI / (n * 1.2), i = r * r, o = 2 * Zt(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(i);
      t = {
        ...t,
        mass: Ie.mass,
        stiffness: i,
        damping: o
      };
    } else {
      const n = lw(e);
      t = {
        ...t,
        ...n,
        mass: Ie.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function Rh(e = Ie.visualDuration, t = Ie.bounce) {
  const n = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e;
  let { restSpeed: r, restDelta: i } = n;
  const o = n.keyframes[0], s = n.keyframes[n.keyframes.length - 1], a = { done: !1, value: o }, { stiffness: l, damping: c, mass: u, duration: d, velocity: h, isResolvedFromDuration: f } = hw({
    ...n,
    velocity: -/* @__PURE__ */ Yt(n.velocity || 0)
  }), m = h || 0, p = c / (2 * Math.sqrt(l * u)), b = s - o, v = /* @__PURE__ */ Yt(Math.sqrt(l / u)), x = Math.abs(b) < 5;
  r || (r = x ? Ie.restSpeed.granular : Ie.restSpeed.default), i || (i = x ? Ie.restDelta.granular : Ie.restDelta.default);
  let w;
  if (p < 1) {
    const T = js(v, p);
    w = (k) => {
      const A = Math.exp(-p * v * k);
      return s - A * ((m + p * v * b) / T * Math.sin(T * k) + b * Math.cos(T * k));
    };
  } else if (p === 1)
    w = (T) => s - Math.exp(-v * T) * (b + (m + v * b) * T);
  else {
    const T = v * Math.sqrt(p * p - 1);
    w = (k) => {
      const A = Math.exp(-p * v * k), D = Math.min(T * k, 300);
      return s - A * ((m + p * v * b) * Math.sinh(D) + T * b * Math.cosh(D)) / T;
    };
  }
  const E = {
    calculatedDuration: f && d || null,
    next: (T) => {
      const k = w(T);
      if (f)
        a.done = T >= d;
      else {
        let A = 0;
        p < 1 && (A = T === 0 ? /* @__PURE__ */ Vt(m) : Ah(w, T, k));
        const D = Math.abs(A) <= r, F = Math.abs(s - k) <= i;
        a.done = D && F;
      }
      return a.value = a.done ? s : k, a;
    },
    toString: () => {
      const T = Math.min(Kf(E), Os), k = Gf((A) => E.next(T * A).value, T, 30);
      return T + "ms " + k;
    }
  };
  return E;
}
function Lc({ keyframes: e, velocity: t = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: i = 10, bounceStiffness: o = 500, modifyTarget: s, min: a, max: l, restDelta: c = 0.5, restSpeed: u }) {
  const d = e[0], h = {
    done: !1,
    value: d
  }, f = (D) => a !== void 0 && D < a || l !== void 0 && D > l, m = (D) => a === void 0 ? l : l === void 0 || Math.abs(a - D) < Math.abs(l - D) ? a : l;
  let p = n * t;
  const b = d + p, v = s === void 0 ? b : s(b);
  v !== b && (p = v - d);
  const x = (D) => -p * Math.exp(-D / r), w = (D) => v + x(D), E = (D) => {
    const F = x(D), P = w(D);
    h.done = Math.abs(F) <= c, h.value = h.done ? v : P;
  };
  let T, k;
  const A = (D) => {
    f(h.value) && (T = D, k = Rh({
      keyframes: [h.value, m(h.value)],
      velocity: Ah(w, D, h.value),
      // TODO: This should be passing * 1000
      damping: i,
      stiffness: o,
      restDelta: c,
      restSpeed: u
    }));
  };
  return A(0), {
    calculatedDuration: null,
    next: (D) => {
      let F = !1;
      return !k && T === void 0 && (F = !0, E(D), A(D)), T !== void 0 && D >= T ? k.next(D - T) : (!F && E(D), h);
    }
  };
}
const pw = /* @__PURE__ */ ti(0.42, 0, 1, 1), mw = /* @__PURE__ */ ti(0, 0, 0.58, 1), Nh = /* @__PURE__ */ ti(0.42, 0, 0.58, 1), gw = (e) => Array.isArray(e) && typeof e[0] != "number", _c = {
  linear: lt,
  easeIn: pw,
  easeInOut: Nh,
  easeOut: mw,
  circIn: nl,
  circInOut: uh,
  circOut: ch,
  backIn: tl,
  backInOut: ah,
  backOut: sh,
  anticipate: lh
}, Fc = (e) => {
  if (Xa(e)) {
    hn(e.length === 4, "Cubic bezier arrays must contain four numerical values.");
    const [t, n, r, i] = e;
    return ti(t, n, r, i);
  } else if (typeof e == "string")
    return hn(_c[e] !== void 0, `Invalid easing type '${e}'`), _c[e];
  return e;
};
function yw(e, t, n) {
  const r = [], i = n || Ph, o = e.length - 1;
  for (let s = 0; s < o; s++) {
    let a = i(e[s], e[s + 1]);
    if (t) {
      const l = Array.isArray(t) ? t[s] || lt : t;
      a = ni(l, a);
    }
    r.push(a);
  }
  return r;
}
function vw(e, t, { clamp: n = !0, ease: r, mixer: i } = {}) {
  const o = e.length;
  if (hn(o === t.length, "Both input and output ranges must be the same length"), o === 1)
    return () => t[0];
  if (o === 2 && t[0] === t[1])
    return () => t[1];
  const s = e[0] === e[1];
  e[0] > e[o - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const a = yw(t, r, i), l = a.length, c = (u) => {
    if (s && u < e[0])
      return t[0];
    let d = 0;
    if (l > 1)
      for (; d < e.length - 2 && !(u < e[d + 1]); d++)
        ;
    const h = /* @__PURE__ */ ir(e[d], e[d + 1], u);
    return a[d](h);
  };
  return n ? (u) => c(Zt(e[0], e[o - 1], u)) : c;
}
function bw(e, t) {
  const n = e[e.length - 1];
  for (let r = 1; r <= t; r++) {
    const i = /* @__PURE__ */ ir(0, t, r);
    e.push(De(n, 1, i));
  }
}
function xw(e) {
  const t = [0];
  return bw(t, e.length - 1), t;
}
function ww(e, t) {
  return e.map((n) => n * t);
}
function Sw(e, t) {
  return e.map(() => t || Nh).splice(0, e.length - 1);
}
function Hi({ duration: e = 300, keyframes: t, times: n, ease: r = "easeInOut" }) {
  const i = gw(r) ? r.map(Fc) : Fc(r), o = {
    done: !1,
    value: t[0]
  }, s = ww(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === t.length ? n : xw(t),
    e
  ), a = vw(s, t, {
    ease: Array.isArray(i) ? i : Sw(t, i)
  });
  return {
    calculatedDuration: e,
    next: (l) => (o.value = a(l), o.done = l >= e, o)
  };
}
const kw = (e) => {
  const t = ({ timestamp: n }) => e(n);
  return {
    start: () => Pe.update(t, !0),
    stop: () => pn(t),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Ue.isProcessing ? Ue.timestamp : zt.now()
  };
}, Cw = {
  decay: Lc,
  inertia: Lc,
  tween: Hi,
  keyframes: Hi,
  spring: Rh
}, Tw = (e) => e / 100;
class ll extends Th {
  constructor(t) {
    super(t), this.holdTime = null, this.cancelTime = null, this.currentTime = 0, this.playbackSpeed = 1, this.pendingPlayState = "running", this.startTime = null, this.state = "idle", this.stop = () => {
      if (this.resolver.cancel(), this.isStopped = !0, this.state === "idle")
        return;
      this.teardown();
      const { onStop: l } = this.options;
      l && l();
    };
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options, s = (i == null ? void 0 : i.KeyframeResolver) || sl, a = (l, c) => this.onKeyframesResolved(l, c);
    this.resolver = new s(o, a, n, r, i), this.resolver.scheduleResolve();
  }
  flatten() {
    super.flatten(), this._resolved && Object.assign(this._resolved, this.initPlayback(this._resolved.keyframes));
  }
  initPlayback(t) {
    const { type: n = "keyframes", repeat: r = 0, repeatDelay: i = 0, repeatType: o, velocity: s = 0 } = this.options, a = Ya(n) ? n : Cw[n] || Hi;
    let l, c;
    a !== Hi && typeof t[0] != "number" && (process.env.NODE_ENV !== "production" && hn(t.length === 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${t}`), l = ni(Tw, Ph(t[0], t[1])), t = [0, 100]);
    const u = a({ ...this.options, keyframes: t });
    o === "mirror" && (c = a({
      ...this.options,
      keyframes: [...t].reverse(),
      velocity: -s
    })), u.calculatedDuration === null && (u.calculatedDuration = Kf(u));
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
      const { keyframes: D } = this.options;
      return { done: !0, value: D[D.length - 1] };
    }
    const { finalKeyframe: i, generator: o, mirroredGenerator: s, mapPercentToKeyframes: a, keyframes: l, calculatedDuration: c, totalDuration: u, resolvedDuration: d } = r;
    if (this.startTime === null)
      return o.next(0);
    const { delay: h, repeat: f, repeatType: m, repeatDelay: p, onUpdate: b } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, t) : this.speed < 0 && (this.startTime = Math.min(t - u / this.speed, this.startTime)), n ? this.currentTime = t : this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = Math.round(t - this.startTime) * this.speed;
    const v = this.currentTime - h * (this.speed >= 0 ? 1 : -1), x = this.speed >= 0 ? v < 0 : v > u;
    this.currentTime = Math.max(v, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = u);
    let w = this.currentTime, E = o;
    if (f) {
      const D = Math.min(this.currentTime, u) / d;
      let F = Math.floor(D), P = D % 1;
      !P && D >= 1 && (P = 1), P === 1 && F--, F = Math.min(F, f + 1), !!(F % 2) && (m === "reverse" ? (P = 1 - P, p && (P -= p / d)) : m === "mirror" && (E = s)), w = Zt(0, 1, P) * d;
    }
    const T = x ? { done: !1, value: l[0] } : E.next(w);
    a && (T.value = a(T.value));
    let { done: k } = T;
    !x && c !== null && (k = this.speed >= 0 ? this.currentTime >= u : this.currentTime <= 0);
    const A = this.holdTime === null && (this.state === "finished" || this.state === "running" && k);
    return A && i !== void 0 && (T.value = So(l, this.options, i)), b && b(T.value), A && this.finish(), T;
  }
  get duration() {
    const { resolved: t } = this;
    return t ? /* @__PURE__ */ Yt(t.calculatedDuration) : 0;
  }
  get time() {
    return /* @__PURE__ */ Yt(this.currentTime);
  }
  set time(t) {
    t = /* @__PURE__ */ Vt(t), this.currentTime = t, this.holdTime !== null || this.speed === 0 ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.speed);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(t) {
    const n = this.playbackSpeed !== t;
    this.playbackSpeed = t, n && (this.time = /* @__PURE__ */ Yt(this.currentTime));
  }
  play() {
    if (this.resolver.isScheduled || this.resolver.resume(), !this._resolved) {
      this.pendingPlayState = "running";
      return;
    }
    if (this.isStopped)
      return;
    const { driver: t = kw, onPlay: n, startTime: r } = this.options;
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
const Ew = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]);
function Pw(e, t, n, { delay: r = 0, duration: i = 300, repeat: o = 0, repeatType: s = "loop", ease: a = "easeInOut", times: l } = {}) {
  const c = { [t]: n };
  l && (c.offset = l);
  const u = Xf(a, i);
  return Array.isArray(u) && (c.easing = u), e.animate(c, {
    delay: r,
    duration: i,
    easing: Array.isArray(u) ? "linear" : u,
    fill: "both",
    iterations: o + 1,
    direction: s === "reverse" ? "alternate" : "normal"
  });
}
const Aw = /* @__PURE__ */ Oa(() => Object.hasOwnProperty.call(Element.prototype, "animate")), Wi = 10, Rw = 2e4;
function Nw(e) {
  return Ya(e.type) || e.type === "spring" || !Yf(e.ease);
}
function Iw(e, t) {
  const n = new ll({
    ...t,
    keyframes: e,
    repeat: 0,
    delay: 0,
    isGenerator: !0
  });
  let r = { done: !1, value: e[0] };
  const i = [];
  let o = 0;
  for (; !r.done && o < Rw; )
    r = n.sample(o), i.push(r.value), o += Wi;
  return {
    times: void 0,
    keyframes: i,
    duration: o - Wi,
    ease: "linear"
  };
}
const Ih = {
  anticipate: lh,
  backInOut: ah,
  circInOut: uh
};
function Dw(e) {
  return e in Ih;
}
class Vc extends Th {
  constructor(t) {
    super(t);
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options;
    this.resolver = new Ch(o, (s, a) => this.onKeyframesResolved(s, a), n, r, i), this.resolver.scheduleResolve();
  }
  initPlayback(t, n) {
    let { duration: r = 300, times: i, ease: o, type: s, motionValue: a, name: l, startTime: c } = this.options;
    if (!a.owner || !a.owner.current)
      return !1;
    if (typeof o == "string" && ji() && Dw(o) && (o = Ih[o]), Nw(this.options)) {
      const { onComplete: d, onUpdate: h, motionValue: f, element: m, ...p } = this.options, b = Iw(t, p);
      t = b.keyframes, t.length === 1 && (t[1] = t[0]), r = b.duration, i = b.times, o = b.ease, s = "keyframes";
    }
    const u = Pw(a.owner.current, l, t, { ...this.options, duration: r, times: i, ease: o });
    return u.startTime = c ?? this.calcStartTime(), this.pendingTimeline ? (wc(u, this.pendingTimeline), this.pendingTimeline = void 0) : u.onfinish = () => {
      const { onComplete: d } = this.options;
      a.set(So(t, this.options, n)), d && d(), this.cancel(), this.resolveFinishedPromise();
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
    return /* @__PURE__ */ Yt(n);
  }
  get time() {
    const { resolved: t } = this;
    if (!t)
      return 0;
    const { animation: n } = t;
    return /* @__PURE__ */ Yt(n.currentTime || 0);
  }
  set time(t) {
    const { resolved: n } = this;
    if (!n)
      return;
    const { animation: r } = n;
    r.currentTime = /* @__PURE__ */ Vt(t);
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
        return lt;
      const { animation: r } = n;
      wc(r, t);
    }
    return lt;
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
      const { motionValue: c, onUpdate: u, onComplete: d, element: h, ...f } = this.options, m = new ll({
        ...f,
        keyframes: r,
        duration: i,
        type: o,
        ease: s,
        times: a,
        isGenerator: !0
      }), p = /* @__PURE__ */ Vt(this.time);
      c.setWithVelocity(m.sample(p - Wi).value, m.sample(p).value, Wi);
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
    return Aw() && r && Ew.has(r) && /**
     * If we're outputting values to onUpdate then we can't use WAAPI as there's
     * no way to read the value from WAAPI every frame.
     */
    !l && !c && !i && o !== "mirror" && s !== 0 && a !== "inertia";
  }
}
const Mw = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, Ow = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), Lw = {
  type: "keyframes",
  duration: 0.8
}, _w = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, Fw = (e, { keyframes: t }) => t.length > 2 ? Lw : $n.has(e) ? e.startsWith("scale") ? Ow(t[1]) : Mw : _w;
function Vw({ when: e, delay: t, delayChildren: n, staggerChildren: r, staggerDirection: i, repeat: o, repeatType: s, repeatDelay: a, from: l, elapsed: c, ...u }) {
  return !!Object.keys(u).length;
}
const cl = (e, t, n, r = {}, i, o) => (s) => {
  const a = Ga(r, e) || {}, l = a.delay || r.delay || 0;
  let { elapsed: c = 0 } = r;
  c = c - /* @__PURE__ */ Vt(l);
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
  Vw(a) || (u = {
    ...u,
    ...Fw(e, u)
  }), u.duration && (u.duration = /* @__PURE__ */ Vt(u.duration)), u.repeatDelay && (u.repeatDelay = /* @__PURE__ */ Vt(u.repeatDelay)), u.from !== void 0 && (u.keyframes[0] = u.from);
  let d = !1;
  if ((u.type === !1 || u.duration === 0 && !u.repeatDelay) && (u.duration = 0, u.delay === 0 && (d = !0)), d && !o && t.get() !== void 0) {
    const h = So(u.keyframes, a);
    if (h !== void 0)
      return Pe.update(() => {
        u.onUpdate(h), u.onComplete();
      }), new rx([]);
  }
  return !o && Vc.supports(u) ? new Vc(u) : new ll(u);
};
function Bw({ protectedKeys: e, needsAnimating: t }, n) {
  const r = e.hasOwnProperty(n) && t[n] !== !0;
  return t[n] = !1, r;
}
function Dh(e, t, { delay: n = 0, transitionOverride: r, type: i } = {}) {
  var o;
  let { transition: s = e.getDefaultTransition(), transitionEnd: a, ...l } = t;
  r && (s = r);
  const c = [], u = i && e.animationState && e.animationState.getState()[i];
  for (const d in l) {
    const h = e.getValue(d, (o = e.latestValues[d]) !== null && o !== void 0 ? o : null), f = l[d];
    if (f === void 0 || u && Bw(u, d))
      continue;
    const m = {
      delay: n,
      ...Ga(s || {}, d)
    };
    let p = !1;
    if (window.MotionHandoffAnimation) {
      const v = nh(e);
      if (v) {
        const x = window.MotionHandoffAnimation(v, d, Pe);
        x !== null && (m.startTime = x, p = !0);
      }
    }
    _s(e, d), h.start(cl(d, h, f, e.shouldReduceMotion && eh.has(d) ? { type: !1 } : m, e, p));
    const b = h.animation;
    b && c.push(b);
  }
  return a && Promise.all(c).then(() => {
    Pe.update(() => {
      a && yx(e, a);
    });
  }), c;
}
function Us(e, t, n = {}) {
  var r;
  const i = wo(e, t, n.type === "exit" ? (r = e.presenceContext) === null || r === void 0 ? void 0 : r.custom : void 0);
  let { transition: o = e.getDefaultTransition() || {} } = i || {};
  n.transitionOverride && (o = n.transitionOverride);
  const s = i ? () => Promise.all(Dh(e, i, n)) : () => Promise.resolve(), a = e.variantChildren && e.variantChildren.size ? (c = 0) => {
    const { delayChildren: u = 0, staggerChildren: d, staggerDirection: h } = o;
    return zw(e, t, u + c, d, h, n);
  } : () => Promise.resolve(), { when: l } = o;
  if (l) {
    const [c, u] = l === "beforeChildren" ? [s, a] : [a, s];
    return c().then(() => u());
  } else
    return Promise.all([s(), a(n.delay)]);
}
function zw(e, t, n = 0, r = 0, i = 1, o) {
  const s = [], a = (e.variantChildren.size - 1) * r, l = i === 1 ? (c = 0) => c * r : (c = 0) => a - c * r;
  return Array.from(e.variantChildren).sort($w).forEach((c, u) => {
    c.notify("AnimationStart", t), s.push(Us(c, t, {
      ...o,
      delay: n + l(u)
    }).then(() => c.notify("AnimationComplete", t)));
  }), Promise.all(s);
}
function $w(e, t) {
  return e.sortNodePosition(t);
}
function jw(e, t, n = {}) {
  e.notify("AnimationStart", t);
  let r;
  if (Array.isArray(t)) {
    const i = t.map((o) => Us(e, o, n));
    r = Promise.all(i);
  } else if (typeof t == "string")
    r = Us(e, t, n);
  else {
    const i = typeof t == "function" ? wo(e, t, n.custom) : t;
    r = Promise.all(Dh(e, i, n));
  }
  return r.then(() => {
    e.notify("AnimationComplete", t);
  });
}
const Uw = _a.length;
function Mh(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const n = e.parent ? Mh(e.parent) || {} : {};
    return e.props.initial !== void 0 && (n.initial = e.props.initial), n;
  }
  const t = {};
  for (let n = 0; n < Uw; n++) {
    const r = _a[n], i = e.props[r];
    (jr(i) || i === !1) && (t[r] = i);
  }
  return t;
}
const Hw = [...La].reverse(), Ww = La.length;
function qw(e) {
  return (t) => Promise.all(t.map(({ animation: n, options: r }) => jw(e, n, r)));
}
function Kw(e) {
  let t = qw(e), n = Bc(), r = !0;
  const i = (l) => (c, u) => {
    var d;
    const h = wo(e, u, l === "exit" ? (d = e.presenceContext) === null || d === void 0 ? void 0 : d.custom : void 0);
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
    const { props: c } = e, u = Mh(e.parent) || {}, d = [], h = /* @__PURE__ */ new Set();
    let f = {}, m = 1 / 0;
    for (let b = 0; b < Ww; b++) {
      const v = Hw[b], x = n[v], w = c[v] !== void 0 ? c[v] : u[v], E = jr(w), T = v === l ? x.isActive : null;
      T === !1 && (m = b);
      let k = w === u[v] && w !== c[v] && E;
      if (k && r && e.manuallyAnimateOnMount && (k = !1), x.protectedKeys = { ...f }, // If it isn't active and hasn't *just* been set as inactive
      !x.isActive && T === null || // If we didn't and don't have any defined prop for this animation type
      !w && !x.prevProp || // Or if the prop doesn't define an animation
      bo(w) || typeof w == "boolean")
        continue;
      const A = Gw(x.prevProp, w);
      let D = A || // If we're making this variant active, we want to always make it active
      v === l && x.isActive && !k && E || // If we removed a higher-priority variant (i is in reverse order)
      b > m && E, F = !1;
      const P = Array.isArray(w) ? w : [w];
      let N = P.reduce(i(v), {});
      T === !1 && (N = {});
      const { prevResolvedValues: R = {} } = x, B = {
        ...R,
        ...N
      }, j = (I) => {
        D = !0, h.has(I) && (F = !0, h.delete(I)), x.needsAnimating[I] = !0;
        const _ = e.getValue(I);
        _ && (_.liveStyle = !1);
      };
      for (const I in B) {
        const _ = N[I], L = R[I];
        if (f.hasOwnProperty(I))
          continue;
        let S = !1;
        Ms(_) && Ms(L) ? S = !qf(_, L) : S = _ !== L, S ? _ != null ? j(I) : h.add(I) : _ !== void 0 && h.has(I) ? j(I) : x.protectedKeys[I] = !0;
      }
      x.prevProp = w, x.prevResolvedValues = N, x.isActive && (f = { ...f, ...N }), r && e.blockInitialAnimation && (D = !1), D && (!(k && A) || F) && d.push(...P.map((I) => ({
        animation: I,
        options: { type: v }
      })));
    }
    if (h.size) {
      const b = {};
      h.forEach((v) => {
        const x = e.getBaseTarget(v), w = e.getValue(v);
        w && (w.liveStyle = !0), b[v] = x ?? null;
      }), d.push({ animation: b });
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
      n = Bc(), r = !0;
    }
  };
}
function Gw(e, t) {
  return typeof t == "string" ? t !== e : Array.isArray(t) ? !qf(t, e) : !1;
}
function En(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Bc() {
  return {
    animate: En(!0),
    whileInView: En(),
    whileHover: En(),
    whileTap: En(),
    whileDrag: En(),
    whileFocus: En(),
    exit: En()
  };
}
class bn {
  constructor(t) {
    this.isMounted = !1, this.node = t;
  }
  update() {
  }
}
class Yw extends bn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(t) {
    super(t), t.animationState || (t.animationState = Kw(t));
  }
  updateAnimationControlsSubscription() {
    const { animate: t } = this.node.getProps();
    bo(t) && (this.unmountControls = t.subscribe(this.node));
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
let Xw = 0;
class Zw extends bn {
  constructor() {
    super(...arguments), this.id = Xw++;
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
const Jw = {
  animation: {
    Feature: Yw
  },
  exit: {
    Feature: Zw
  }
};
function qr(e, t, n, r = { passive: !0 }) {
  return e.addEventListener(t, n, r), () => e.removeEventListener(t, n);
}
function ri(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const Qw = (e) => (t) => Za(t) && e(t, ri(t));
function _r(e, t, n, r) {
  return qr(e, t, Qw(n), r);
}
const zc = (e, t) => Math.abs(e - t);
function e0(e, t) {
  const n = zc(e.x, t.x), r = zc(e.y, t.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
class Oh {
  constructor(t, n, { transformPagePoint: r, contextWindow: i, dragSnapToOrigin: o = !1 } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const d = ns(this.lastMoveEventInfo, this.history), h = this.startEvent !== null, f = e0(d.offset, { x: 0, y: 0 }) >= 3;
      if (!h && !f)
        return;
      const { point: m } = d, { timestamp: p } = Ue;
      this.history.push({ ...m, timestamp: p });
      const { onStart: b, onMove: v } = this.handlers;
      h || (b && b(this.lastMoveEvent, d), this.startEvent = this.lastMoveEvent), v && v(this.lastMoveEvent, d);
    }, this.handlePointerMove = (d, h) => {
      this.lastMoveEvent = d, this.lastMoveEventInfo = ts(h, this.transformPagePoint), Pe.update(this.updatePoint, !0);
    }, this.handlePointerUp = (d, h) => {
      this.end();
      const { onEnd: f, onSessionEnd: m, resumeAnimation: p } = this.handlers;
      if (this.dragSnapToOrigin && p && p(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const b = ns(d.type === "pointercancel" ? this.lastMoveEventInfo : ts(h, this.transformPagePoint), this.history);
      this.startEvent && f && f(d, b), m && m(d, b);
    }, !Za(t))
      return;
    this.dragSnapToOrigin = o, this.handlers = n, this.transformPagePoint = r, this.contextWindow = i || window;
    const s = ri(t), a = ts(s, this.transformPagePoint), { point: l } = a, { timestamp: c } = Ue;
    this.history = [{ ...l, timestamp: c }];
    const { onSessionStart: u } = n;
    u && u(t, ns(a, this.history)), this.removeListeners = ni(_r(this.contextWindow, "pointermove", this.handlePointerMove), _r(this.contextWindow, "pointerup", this.handlePointerUp), _r(this.contextWindow, "pointercancel", this.handlePointerUp));
  }
  updateHandlers(t) {
    this.handlers = t;
  }
  end() {
    this.removeListeners && this.removeListeners(), pn(this.updatePoint);
  }
}
function ts(e, t) {
  return t ? { point: t(e.point) } : e;
}
function $c(e, t) {
  return { x: e.x - t.x, y: e.y - t.y };
}
function ns({ point: e }, t) {
  return {
    point: e,
    delta: $c(e, Lh(t)),
    offset: $c(e, t0(t)),
    velocity: n0(t, 0.1)
  };
}
function t0(e) {
  return e[0];
}
function Lh(e) {
  return e[e.length - 1];
}
function n0(e, t) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let n = e.length - 1, r = null;
  const i = Lh(e);
  for (; n >= 0 && (r = e[n], !(i.timestamp - r.timestamp > /* @__PURE__ */ Vt(t))); )
    n--;
  if (!r)
    return { x: 0, y: 0 };
  const o = /* @__PURE__ */ Yt(i.timestamp - r.timestamp);
  if (o === 0)
    return { x: 0, y: 0 };
  const s = {
    x: (i.x - r.x) / o,
    y: (i.y - r.y) / o
  };
  return s.x === 1 / 0 && (s.x = 0), s.y === 1 / 0 && (s.y = 0), s;
}
const _h = 1e-4, r0 = 1 - _h, i0 = 1 + _h, Fh = 0.01, o0 = 0 - Fh, s0 = 0 + Fh;
function yt(e) {
  return e.max - e.min;
}
function a0(e, t, n) {
  return Math.abs(e - t) <= n;
}
function jc(e, t, n, r = 0.5) {
  e.origin = r, e.originPoint = De(t.min, t.max, e.origin), e.scale = yt(n) / yt(t), e.translate = De(n.min, n.max, e.origin) - e.originPoint, (e.scale >= r0 && e.scale <= i0 || isNaN(e.scale)) && (e.scale = 1), (e.translate >= o0 && e.translate <= s0 || isNaN(e.translate)) && (e.translate = 0);
}
function Fr(e, t, n, r) {
  jc(e.x, t.x, n.x, r ? r.originX : void 0), jc(e.y, t.y, n.y, r ? r.originY : void 0);
}
function Uc(e, t, n) {
  e.min = n.min + t.min, e.max = e.min + yt(t);
}
function l0(e, t, n) {
  Uc(e.x, t.x, n.x), Uc(e.y, t.y, n.y);
}
function Hc(e, t, n) {
  e.min = t.min - n.min, e.max = e.min + yt(t);
}
function Vr(e, t, n) {
  Hc(e.x, t.x, n.x), Hc(e.y, t.y, n.y);
}
function c0(e, { min: t, max: n }, r) {
  return t !== void 0 && e < t ? e = r ? De(t, e, r.min) : Math.max(e, t) : n !== void 0 && e > n && (e = r ? De(n, e, r.max) : Math.min(e, n)), e;
}
function Wc(e, t, n) {
  return {
    min: t !== void 0 ? e.min + t : void 0,
    max: n !== void 0 ? e.max + n - (e.max - e.min) : void 0
  };
}
function u0(e, { top: t, left: n, bottom: r, right: i }) {
  return {
    x: Wc(e.x, n, i),
    y: Wc(e.y, t, r)
  };
}
function qc(e, t) {
  let n = t.min - e.min, r = t.max - e.max;
  return t.max - t.min < e.max - e.min && ([n, r] = [r, n]), { min: n, max: r };
}
function d0(e, t) {
  return {
    x: qc(e.x, t.x),
    y: qc(e.y, t.y)
  };
}
function f0(e, t) {
  let n = 0.5;
  const r = yt(e), i = yt(t);
  return i > r ? n = /* @__PURE__ */ ir(t.min, t.max - r, e.min) : r > i && (n = /* @__PURE__ */ ir(e.min, e.max - i, t.min)), Zt(0, 1, n);
}
function h0(e, t) {
  const n = {};
  return t.min !== void 0 && (n.min = t.min - e.min), t.max !== void 0 && (n.max = t.max - e.min), n;
}
const Hs = 0.35;
function p0(e = Hs) {
  return e === !1 ? e = 0 : e === !0 && (e = Hs), {
    x: Kc(e, "left", "right"),
    y: Kc(e, "top", "bottom")
  };
}
function Kc(e, t, n) {
  return {
    min: Gc(e, t),
    max: Gc(e, n)
  };
}
function Gc(e, t) {
  return typeof e == "number" ? e : e[t] || 0;
}
const Yc = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), Zn = () => ({
  x: Yc(),
  y: Yc()
}), Xc = () => ({ min: 0, max: 0 }), Le = () => ({
  x: Xc(),
  y: Xc()
});
function wt(e) {
  return [e("x"), e("y")];
}
function Vh({ top: e, left: t, right: n, bottom: r }) {
  return {
    x: { min: t, max: n },
    y: { min: e, max: r }
  };
}
function m0({ x: e, y: t }) {
  return { top: t.min, right: e.max, bottom: t.max, left: e.min };
}
function g0(e, t) {
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
function rs(e) {
  return e === void 0 || e === 1;
}
function Ws({ scale: e, scaleX: t, scaleY: n }) {
  return !rs(e) || !rs(t) || !rs(n);
}
function An(e) {
  return Ws(e) || Bh(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function Bh(e) {
  return Zc(e.x) || Zc(e.y);
}
function Zc(e) {
  return e && e !== "0%";
}
function qi(e, t, n) {
  const r = e - n, i = t * r;
  return n + i;
}
function Jc(e, t, n, r, i) {
  return i !== void 0 && (e = qi(e, i, r)), qi(e, n, r) + t;
}
function qs(e, t = 0, n = 1, r, i) {
  e.min = Jc(e.min, t, n, r, i), e.max = Jc(e.max, t, n, r, i);
}
function zh(e, { x: t, y: n }) {
  qs(e.x, t.translate, t.scale, t.originPoint), qs(e.y, n.translate, n.scale, n.originPoint);
}
const Qc = 0.999999999999, eu = 1.0000000000001;
function y0(e, t, n, r = !1) {
  const i = n.length;
  if (!i)
    return;
  t.x = t.y = 1;
  let o, s;
  for (let a = 0; a < i; a++) {
    o = n[a], s = o.projectionDelta;
    const { visualElement: l } = o.options;
    l && l.props.style && l.props.style.display === "contents" || (r && o.options.layoutScroll && o.scroll && o !== o.root && Qn(e, {
      x: -o.scroll.offset.x,
      y: -o.scroll.offset.y
    }), s && (t.x *= s.x.scale, t.y *= s.y.scale, zh(e, s)), r && An(o.latestValues) && Qn(e, o.latestValues));
  }
  t.x < eu && t.x > Qc && (t.x = 1), t.y < eu && t.y > Qc && (t.y = 1);
}
function Jn(e, t) {
  e.min = e.min + t, e.max = e.max + t;
}
function tu(e, t, n, r, i = 0.5) {
  const o = De(e.min, e.max, i);
  qs(e, t, n, o, r);
}
function Qn(e, t) {
  tu(e.x, t.x, t.scaleX, t.scale, t.originX), tu(e.y, t.y, t.scaleY, t.scale, t.originY);
}
function $h(e, t) {
  return Vh(g0(e.getBoundingClientRect(), t));
}
function v0(e, t, n) {
  const r = $h(e, n), { scroll: i } = t;
  return i && (Jn(r.x, i.offset.x), Jn(r.y, i.offset.y)), r;
}
const jh = ({ current: e }) => e ? e.ownerDocument.defaultView : null, b0 = /* @__PURE__ */ new WeakMap();
class x0 {
  constructor(t) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = Le(), this.visualElement = t;
  }
  start(t, { snapToCursor: n = !1 } = {}) {
    const { presenceContext: r } = this.visualElement;
    if (r && r.isPresent === !1)
      return;
    const i = (u) => {
      const { dragSnapToOrigin: d } = this.getProps();
      d ? this.pauseAnimation() : this.stopAnimation(), n && this.snapToCursor(ri(u).point);
    }, o = (u, d) => {
      const { drag: h, dragPropagation: f, onDragStart: m } = this.getProps();
      if (h && !f && (this.openDragLock && this.openDragLock(), this.openDragLock = fx(h), !this.openDragLock))
        return;
      this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), wt((b) => {
        let v = this.getAxisMotionValue(b).get() || 0;
        if (Bt.test(v)) {
          const { projection: x } = this.visualElement;
          if (x && x.layout) {
            const w = x.layout.layoutBox[b];
            w && (v = yt(w) * (parseFloat(v) / 100));
          }
        }
        this.originPoint[b] = v;
      }), m && Pe.postRender(() => m(u, d)), _s(this.visualElement, "transform");
      const { animationState: p } = this.visualElement;
      p && p.setActive("whileDrag", !0);
    }, s = (u, d) => {
      const { dragPropagation: h, dragDirectionLock: f, onDirectionLock: m, onDrag: p } = this.getProps();
      if (!h && !this.openDragLock)
        return;
      const { offset: b } = d;
      if (f && this.currentDirection === null) {
        this.currentDirection = w0(b), this.currentDirection !== null && m && m(this.currentDirection);
        return;
      }
      this.updateAxis("x", d.point, b), this.updateAxis("y", d.point, b), this.visualElement.render(), p && p(u, d);
    }, a = (u, d) => this.stop(u, d), l = () => wt((u) => {
      var d;
      return this.getAnimationState(u) === "paused" && ((d = this.getAxisMotionValue(u).animation) === null || d === void 0 ? void 0 : d.play());
    }), { dragSnapToOrigin: c } = this.getProps();
    this.panSession = new Oh(t, {
      onSessionStart: i,
      onStart: o,
      onMove: s,
      onSessionEnd: a,
      resumeAnimation: l
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: c,
      contextWindow: jh(this.visualElement)
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
    if (!r || !mi(t, i, this.currentDirection))
      return;
    const o = this.getAxisMotionValue(t);
    let s = this.originPoint[t] + r[t];
    this.constraints && this.constraints[t] && (s = c0(s, this.constraints[t], this.elastic[t])), o.set(s);
  }
  resolveConstraints() {
    var t;
    const { dragConstraints: n, dragElastic: r } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (t = this.visualElement.projection) === null || t === void 0 ? void 0 : t.layout, o = this.constraints;
    n && Yn(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = u0(i.layoutBox, n) : this.constraints = !1, this.elastic = p0(r), o !== this.constraints && i && this.constraints && !this.hasMutatedConstraints && wt((s) => {
      this.constraints !== !1 && this.getAxisMotionValue(s) && (this.constraints[s] = h0(i.layoutBox[s], this.constraints[s]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: t, onMeasureDragConstraints: n } = this.getProps();
    if (!t || !Yn(t))
      return !1;
    const r = t.current;
    hn(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.");
    const { projection: i } = this.visualElement;
    if (!i || !i.layout)
      return !1;
    const o = v0(r, i.root, this.visualElement.getTransformPagePoint());
    let s = d0(i.layout.layoutBox, o);
    if (n) {
      const a = n(m0(s));
      this.hasMutatedConstraints = !!a, a && (s = Vh(a));
    }
    return s;
  }
  startAnimation(t) {
    const { drag: n, dragMomentum: r, dragElastic: i, dragTransition: o, dragSnapToOrigin: s, onDragTransitionEnd: a } = this.getProps(), l = this.constraints || {}, c = wt((u) => {
      if (!mi(u, n, this.currentDirection))
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
    return _s(this.visualElement, t), r.start(cl(t, r, 0, n, this.visualElement, !1));
  }
  stopAnimation() {
    wt((t) => this.getAxisMotionValue(t).stop());
  }
  pauseAnimation() {
    wt((t) => {
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
    wt((n) => {
      const { drag: r } = this.getProps();
      if (!mi(n, r, this.currentDirection))
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
    if (!Yn(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const i = { x: 0, y: 0 };
    wt((s) => {
      const a = this.getAxisMotionValue(s);
      if (a && this.constraints !== !1) {
        const l = a.get();
        i[s] = f0({ min: l, max: l }, this.constraints[s]);
      }
    });
    const { transformTemplate: o } = this.visualElement.getProps();
    this.visualElement.current.style.transform = o ? o({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.resolveConstraints(), wt((s) => {
      if (!mi(s, t, null))
        return;
      const a = this.getAxisMotionValue(s), { min: l, max: c } = this.constraints[s];
      a.set(De(l, c, i[s]));
    });
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    b0.set(this.visualElement, this);
    const t = this.visualElement.current, n = _r(t, "pointerdown", (l) => {
      const { drag: c, dragListener: u = !0 } = this.getProps();
      c && u && this.start(l);
    }), r = () => {
      const { dragConstraints: l } = this.getProps();
      Yn(l) && l.current && (this.constraints = this.resolveRefConstraints());
    }, { projection: i } = this.visualElement, o = i.addEventListener("measure", r);
    i && !i.layout && (i.root && i.root.updateScroll(), i.updateLayout()), Pe.read(r);
    const s = qr(window, "resize", () => this.scalePositionWithinConstraints()), a = i.addEventListener("didUpdate", ({ delta: l, hasLayoutChanged: c }) => {
      this.isDragging && c && (wt((u) => {
        const d = this.getAxisMotionValue(u);
        d && (this.originPoint[u] += l[u].translate, d.set(d.get() + l[u].translate));
      }), this.visualElement.render());
    });
    return () => {
      s(), n(), o(), a && a();
    };
  }
  getProps() {
    const t = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: i = !1, dragConstraints: o = !1, dragElastic: s = Hs, dragMomentum: a = !0 } = t;
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
function mi(e, t, n) {
  return (t === !0 || t === e) && (n === null || n === e);
}
function w0(e, t = 10) {
  let n = null;
  return Math.abs(e.y) > t ? n = "y" : Math.abs(e.x) > t && (n = "x"), n;
}
class S0 extends bn {
  constructor(t) {
    super(t), this.removeGroupControls = lt, this.removeListeners = lt, this.controls = new x0(t);
  }
  mount() {
    const { dragControls: t } = this.node.getProps();
    t && (this.removeGroupControls = t.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || lt;
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners();
  }
}
const nu = (e) => (t, n) => {
  e && Pe.postRender(() => e(t, n));
};
class k0 extends bn {
  constructor() {
    super(...arguments), this.removePointerDownListener = lt;
  }
  onPointerDown(t) {
    this.session = new Oh(t, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: jh(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: t, onPanStart: n, onPan: r, onPanEnd: i } = this.node.getProps();
    return {
      onSessionStart: nu(t),
      onStart: nu(n),
      onMove: r,
      onEnd: (o, s) => {
        delete this.session, i && Pe.postRender(() => i(o, s));
      }
    };
  }
  mount() {
    this.removePointerDownListener = _r(this.node.current, "pointerdown", (t) => this.onPointerDown(t));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
const Ni = {
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
function ru(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
const Ar = {
  correct: (e, t) => {
    if (!t.target)
      return e;
    if (typeof e == "string")
      if (J.test(e))
        e = parseFloat(e);
      else
        return e;
    const n = ru(e, t.target.x), r = ru(e, t.target.y);
    return `${n}% ${r}%`;
  }
}, C0 = {
  correct: (e, { treeScale: t, projectionDelta: n }) => {
    const r = e, i = mn.parse(e);
    if (i.length > 5)
      return r;
    const o = mn.createTransformer(e), s = typeof i[0] != "number" ? 1 : 0, a = n.x.scale * t.x, l = n.y.scale * t.y;
    i[0 + s] /= a, i[1 + s] /= l;
    const c = De(a, l, 0.5);
    return typeof i[2 + s] == "number" && (i[2 + s] /= c), typeof i[3 + s] == "number" && (i[3 + s] /= c), o(i);
  }
};
class T0 extends Vy {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: r, layoutId: i } = this.props, { projection: o } = t;
    Wb(E0), o && (n.group && n.group.add(o), r && r.register && i && r.register(o), o.root.didUpdate(), o.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), o.setOptions({
      ...o.options,
      onExitComplete: () => this.safeToRemove()
    })), Ni.hasEverUpdated = !0;
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
    t && (t.root.didUpdate(), Va.postRender(() => {
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
function Uh(e) {
  const [t, n] = Ef(), r = Xe(Na);
  return g(T0, { ...e, layoutGroup: r, switchLayoutGroup: Xe(Mf), isPresent: t, safeToRemove: n });
}
const E0 = {
  borderRadius: {
    ...Ar,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: Ar,
  borderTopRightRadius: Ar,
  borderBottomLeftRadius: Ar,
  borderBottomRightRadius: Ar,
  boxShadow: C0
};
function P0(e, t, n) {
  const r = Ze(e) ? e : Hr(e);
  return r.start(cl("", r, t, n)), r.animation;
}
function A0(e) {
  return e instanceof SVGElement && e.tagName !== "svg";
}
const R0 = (e, t) => e.depth - t.depth;
class N0 {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(t) {
    Ja(this.children, t), this.isDirty = !0;
  }
  remove(t) {
    Qa(this.children, t), this.isDirty = !0;
  }
  forEach(t) {
    this.isDirty && this.children.sort(R0), this.isDirty = !1, this.children.forEach(t);
  }
}
function I0(e, t) {
  const n = zt.now(), r = ({ timestamp: i }) => {
    const o = i - n;
    o >= t && (pn(r), e(o - t));
  };
  return Pe.read(r, !0), () => pn(r);
}
const Hh = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"], D0 = Hh.length, iu = (e) => typeof e == "string" ? parseFloat(e) : e, ou = (e) => typeof e == "number" || J.test(e);
function M0(e, t, n, r, i, o) {
  i ? (e.opacity = De(
    0,
    // TODO Reinstate this if only child
    n.opacity !== void 0 ? n.opacity : 1,
    O0(r)
  ), e.opacityExit = De(t.opacity !== void 0 ? t.opacity : 1, 0, L0(r))) : o && (e.opacity = De(t.opacity !== void 0 ? t.opacity : 1, n.opacity !== void 0 ? n.opacity : 1, r));
  for (let s = 0; s < D0; s++) {
    const a = `border${Hh[s]}Radius`;
    let l = su(t, a), c = su(n, a);
    if (l === void 0 && c === void 0)
      continue;
    l || (l = 0), c || (c = 0), l === 0 || c === 0 || ou(l) === ou(c) ? (e[a] = Math.max(De(iu(l), iu(c), r), 0), (Bt.test(c) || Bt.test(l)) && (e[a] += "%")) : e[a] = c;
  }
  (t.rotate || n.rotate) && (e.rotate = De(t.rotate || 0, n.rotate || 0, r));
}
function su(e, t) {
  return e[t] !== void 0 ? e[t] : e.borderRadius;
}
const O0 = /* @__PURE__ */ Wh(0, 0.5, ch), L0 = /* @__PURE__ */ Wh(0.5, 0.95, lt);
function Wh(e, t, n) {
  return (r) => r < e ? 0 : r > t ? 1 : n(/* @__PURE__ */ ir(e, t, r));
}
function au(e, t) {
  e.min = t.min, e.max = t.max;
}
function xt(e, t) {
  au(e.x, t.x), au(e.y, t.y);
}
function lu(e, t) {
  e.translate = t.translate, e.scale = t.scale, e.originPoint = t.originPoint, e.origin = t.origin;
}
function cu(e, t, n, r, i) {
  return e -= t, e = qi(e, 1 / n, r), i !== void 0 && (e = qi(e, 1 / i, r)), e;
}
function _0(e, t = 0, n = 1, r = 0.5, i, o = e, s = e) {
  if (Bt.test(t) && (t = parseFloat(t), t = De(s.min, s.max, t / 100) - s.min), typeof t != "number")
    return;
  let a = De(o.min, o.max, r);
  e === o && (a -= t), e.min = cu(e.min, t, n, a, i), e.max = cu(e.max, t, n, a, i);
}
function uu(e, t, [n, r, i], o, s) {
  _0(e, t[n], t[r], t[i], t.scale, o, s);
}
const F0 = ["x", "scaleX", "originX"], V0 = ["y", "scaleY", "originY"];
function du(e, t, n, r) {
  uu(e.x, t, F0, n ? n.x : void 0, r ? r.x : void 0), uu(e.y, t, V0, n ? n.y : void 0, r ? r.y : void 0);
}
function fu(e) {
  return e.translate === 0 && e.scale === 1;
}
function qh(e) {
  return fu(e.x) && fu(e.y);
}
function hu(e, t) {
  return e.min === t.min && e.max === t.max;
}
function B0(e, t) {
  return hu(e.x, t.x) && hu(e.y, t.y);
}
function pu(e, t) {
  return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max);
}
function Kh(e, t) {
  return pu(e.x, t.x) && pu(e.y, t.y);
}
function mu(e) {
  return yt(e.x) / yt(e.y);
}
function gu(e, t) {
  return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint;
}
class z0 {
  constructor() {
    this.members = [];
  }
  add(t) {
    Ja(this.members, t), t.scheduleRender();
  }
  remove(t) {
    if (Qa(this.members, t), t === this.prevLead && (this.prevLead = void 0), t === this.lead) {
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
function $0(e, t, n) {
  let r = "";
  const i = e.x.translate / t.x, o = e.y.translate / t.y, s = (n == null ? void 0 : n.z) || 0;
  if ((i || o || s) && (r = `translate3d(${i}px, ${o}px, ${s}px) `), (t.x !== 1 || t.y !== 1) && (r += `scale(${1 / t.x}, ${1 / t.y}) `), n) {
    const { transformPerspective: c, rotate: u, rotateX: d, rotateY: h, skewX: f, skewY: m } = n;
    c && (r = `perspective(${c}px) ${r}`), u && (r += `rotate(${u}deg) `), d && (r += `rotateX(${d}deg) `), h && (r += `rotateY(${h}deg) `), f && (r += `skewX(${f}deg) `), m && (r += `skewY(${m}deg) `);
  }
  const a = e.x.scale * t.x, l = e.y.scale * t.y;
  return (a !== 1 || l !== 1) && (r += `scale(${a}, ${l})`), r || "none";
}
const Rn = {
  type: "projectionFrame",
  totalNodes: 0,
  resolvedTargetDeltas: 0,
  recalculatedProjection: 0
}, Mr = typeof window < "u" && window.MotionDebug !== void 0, is = ["", "X", "Y", "Z"], j0 = { visibility: "hidden" }, yu = 1e3;
let U0 = 0;
function os(e, t, n, r) {
  const { latestValues: i } = t;
  i[e] && (n[e] = i[e], t.setStaticValue(e, 0), r && (r[e] = 0));
}
function Gh(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: t } = e.options;
  if (!t)
    return;
  const n = nh(t);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: i, layoutId: o } = e.options;
    window.MotionCancelOptimisedAnimation(n, "transform", Pe, !(i || o));
  }
  const { parent: r } = e;
  r && !r.hasCheckedOptimisedAppear && Gh(r);
}
function Yh({ attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: r, resetTransform: i }) {
  return class {
    constructor(s = {}, a = t == null ? void 0 : t()) {
      this.id = U0++, this.animationId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, Mr && (Rn.totalNodes = Rn.resolvedTargetDeltas = Rn.recalculatedProjection = 0), this.nodes.forEach(q0), this.nodes.forEach(Z0), this.nodes.forEach(J0), this.nodes.forEach(K0), Mr && window.MotionDebug.record(Rn);
      }, this.resolvedRelativeTargetAt = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = s, this.root = a ? a.root || a : this, this.path = a ? [...a.path, a] : [], this.parent = a, this.depth = a ? a.depth + 1 : 0;
      for (let l = 0; l < this.path.length; l++)
        this.path[l].shouldResetTransform = !0;
      this.root === this && (this.nodes = new N0());
    }
    addEventListener(s, a) {
      return this.eventHandlers.has(s) || this.eventHandlers.set(s, new el()), this.eventHandlers.get(s).add(a);
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
      this.isSVG = A0(s), this.instance = s;
      const { layoutId: l, layout: c, visualElement: u } = this.options;
      if (u && !u.current && u.mount(s), this.root.nodes.add(this), this.parent && this.parent.children.add(this), a && (c || l) && (this.isLayoutDirty = !0), e) {
        let d;
        const h = () => this.root.updateBlockedByResize = !1;
        e(s, () => {
          this.root.updateBlockedByResize = !0, d && d(), d = I0(h, 250), Ni.hasAnimatedSinceResize && (Ni.hasAnimatedSinceResize = !1, this.nodes.forEach(bu));
        });
      }
      l && this.root.registerSharedNode(l, this), this.options.animate !== !1 && u && (l || c) && this.addEventListener("didUpdate", ({ delta: d, hasLayoutChanged: h, hasRelativeTargetChanged: f, layout: m }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const p = this.options.transition || u.getDefaultTransition() || r1, { onLayoutAnimationStart: b, onLayoutAnimationComplete: v } = u.getProps(), x = !this.targetLayout || !Kh(this.targetLayout, m) || f, w = !h && f;
        if (this.options.layoutRoot || this.resumeFrom && this.resumeFrom.instance || w || h && (x || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0), this.setAnimationOrigin(d, w);
          const E = {
            ...Ga(p, "layout"),
            onPlay: b,
            onComplete: v
          };
          (u.shouldReduceMotion || this.options.layoutRoot) && (E.delay = 0, E.type = !1), this.startAnimation(E);
        } else
          h || bu(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = m;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const s = this.getStack();
      s && s.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, pn(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(Q0), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && Gh(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
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
        this.unblockUpdate(), this.clearAllSnapshots(), this.nodes.forEach(vu);
        return;
      }
      this.isUpdating || this.nodes.forEach(Y0), this.isUpdating = !1, this.nodes.forEach(X0), this.nodes.forEach(H0), this.nodes.forEach(W0), this.clearAllSnapshots();
      const a = zt.now();
      Ue.delta = Zt(0, 1e3 / 60, a - Ue.timestamp), Ue.timestamp = a, Ue.isProcessing = !0, Yo.update.process(Ue), Yo.preRender.process(Ue), Yo.render.process(Ue), Ue.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, Va.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(G0), this.sharedNodes.forEach(e1);
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
      const s = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, a = this.projectionDelta && !qh(this.projectionDelta), l = this.getTransformTemplate(), c = l ? l(this.latestValues, "") : void 0, u = c !== this.prevTransformTemplateValue;
      s && (a || An(this.latestValues) || u) && (i(this.instance, c), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(s = !0) {
      const a = this.measurePageBox();
      let l = this.removeElementScroll(a);
      return s && (l = this.removeTransform(l)), i1(l), {
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
      if (!(((s = this.scroll) === null || s === void 0 ? void 0 : s.wasRoot) || this.path.some(o1))) {
        const { scroll: u } = this.root;
        u && (Jn(l.x, u.offset.x), Jn(l.y, u.offset.y));
      }
      return l;
    }
    removeElementScroll(s) {
      var a;
      const l = Le();
      if (xt(l, s), !((a = this.scroll) === null || a === void 0) && a.wasRoot)
        return l;
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c], { scroll: d, options: h } = u;
        u !== this.root && d && h.layoutScroll && (d.wasRoot && xt(l, s), Jn(l.x, d.offset.x), Jn(l.y, d.offset.y));
      }
      return l;
    }
    applyTransform(s, a = !1) {
      const l = Le();
      xt(l, s);
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c];
        !a && u.options.layoutScroll && u.scroll && u !== u.root && Qn(l, {
          x: -u.scroll.offset.x,
          y: -u.scroll.offset.y
        }), An(u.latestValues) && Qn(l, u.latestValues);
      }
      return An(this.latestValues) && Qn(l, this.latestValues), l;
    }
    removeTransform(s) {
      const a = Le();
      xt(a, s);
      for (let l = 0; l < this.path.length; l++) {
        const c = this.path[l];
        if (!c.instance || !An(c.latestValues))
          continue;
        Ws(c.latestValues) && c.updateSnapshot();
        const u = Le(), d = c.measurePageBox();
        xt(u, d), du(a, c.latestValues, c.snapshot ? c.snapshot.layoutBox : void 0, u);
      }
      return An(this.latestValues) && du(a, this.latestValues), a;
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
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Ue.timestamp && this.relativeParent.resolveTargetDelta(!0);
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
        if (this.resolvedRelativeTargetAt = Ue.timestamp, !this.targetDelta && !this.relativeTarget) {
          const f = this.getClosestProjectingParent();
          f && f.layout && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Le(), this.relativeTargetOrigin = Le(), Vr(this.relativeTargetOrigin, this.layout.layoutBox, f.layout.layoutBox), xt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
        }
        if (!(!this.relativeTarget && !this.targetDelta)) {
          if (this.target || (this.target = Le(), this.targetWithTransforms = Le()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), l0(this.target, this.relativeTarget, this.relativeParent.target)) : this.targetDelta ? (this.resumingFrom ? this.target = this.applyTransform(this.layout.layoutBox) : xt(this.target, this.layout.layoutBox), zh(this.target, this.targetDelta)) : xt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget) {
            this.attemptToResolveRelativeTarget = !1;
            const f = this.getClosestProjectingParent();
            f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Le(), this.relativeTargetOrigin = Le(), Vr(this.relativeTargetOrigin, this.target, f.target), xt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
          }
          Mr && Rn.resolvedTargetDeltas++;
        }
      }
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Ws(this.parent.latestValues) || Bh(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    calcProjection() {
      var s;
      const a = this.getLead(), l = !!this.resumingFrom || this !== a;
      let c = !0;
      if ((this.isProjectionDirty || !((s = this.parent) === null || s === void 0) && s.isProjectionDirty) && (c = !1), l && (this.isSharedProjectionDirty || this.isTransformDirty) && (c = !1), this.resolvedRelativeTargetAt === Ue.timestamp && (c = !1), c)
        return;
      const { layout: u, layoutId: d } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(u || d))
        return;
      xt(this.layoutCorrected, this.layout.layoutBox);
      const h = this.treeScale.x, f = this.treeScale.y;
      y0(this.layoutCorrected, this.treeScale, this.path, l), a.layout && !a.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (a.target = a.layout.layoutBox, a.targetWithTransforms = Le());
      const { target: m } = a;
      if (!m) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (lu(this.prevProjectionDelta.x, this.projectionDelta.x), lu(this.prevProjectionDelta.y, this.projectionDelta.y)), Fr(this.projectionDelta, this.layoutCorrected, m, this.latestValues), (this.treeScale.x !== h || this.treeScale.y !== f || !gu(this.projectionDelta.x, this.prevProjectionDelta.x) || !gu(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", m)), Mr && Rn.recalculatedProjection++;
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
      this.prevProjectionDelta = Zn(), this.projectionDelta = Zn(), this.projectionDeltaWithTransform = Zn();
    }
    setAnimationOrigin(s, a = !1) {
      const l = this.snapshot, c = l ? l.latestValues : {}, u = { ...this.latestValues }, d = Zn();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !a;
      const h = Le(), f = l ? l.source : void 0, m = this.layout ? this.layout.source : void 0, p = f !== m, b = this.getStack(), v = !b || b.members.length <= 1, x = !!(p && !v && this.options.crossfade === !0 && !this.path.some(n1));
      this.animationProgress = 0;
      let w;
      this.mixTargetDelta = (E) => {
        const T = E / 1e3;
        xu(d.x, s.x, T), xu(d.y, s.y, T), this.setTargetDelta(d), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (Vr(h, this.layout.layoutBox, this.relativeParent.layout.layoutBox), t1(this.relativeTarget, this.relativeTargetOrigin, h, T), w && B0(this.relativeTarget, w) && (this.isProjectionDirty = !1), w || (w = Le()), xt(w, this.relativeTarget)), p && (this.animationValues = u, M0(u, c, this.latestValues, T, x, v)), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = T;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(s) {
      this.notifyListeners("animationStart"), this.currentAnimation && this.currentAnimation.stop(), this.resumingFrom && this.resumingFrom.currentAnimation && this.resumingFrom.currentAnimation.stop(), this.pendingAnimation && (pn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Pe.update(() => {
        Ni.hasAnimatedSinceResize = !0, this.currentAnimation = P0(0, yu, {
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(yu), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const s = this.getLead();
      let { targetWithTransforms: a, target: l, layout: c, latestValues: u } = s;
      if (!(!a || !l || !c)) {
        if (this !== s && this.layout && c && Xh(this.options.animationType, this.layout.layoutBox, c.layoutBox)) {
          l = this.target || Le();
          const d = yt(this.layout.layoutBox.x);
          l.x.min = s.target.x.min, l.x.max = l.x.min + d;
          const h = yt(this.layout.layoutBox.y);
          l.y.min = s.target.y.min, l.y.max = l.y.min + h;
        }
        xt(a, l), Qn(a, u), Fr(this.projectionDeltaWithTransform, this.layoutCorrected, a, u);
      }
    }
    registerSharedNode(s, a) {
      this.sharedNodes.has(s) || this.sharedNodes.set(s, new z0()), this.sharedNodes.get(s).add(a);
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
      l.z && os("z", s, c, this.animationValues);
      for (let u = 0; u < is.length; u++)
        os(`rotate${is[u]}`, s, c, this.animationValues), os(`skew${is[u]}`, s, c, this.animationValues);
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
        return j0;
      const c = {
        visibility: ""
      }, u = this.getTransformTemplate();
      if (this.needsReset)
        return this.needsReset = !1, c.opacity = "", c.pointerEvents = Ai(s == null ? void 0 : s.pointerEvents) || "", c.transform = u ? u(this.latestValues, "") : "none", c;
      const d = this.getLead();
      if (!this.projectionDelta || !this.layout || !d.target) {
        const p = {};
        return this.options.layoutId && (p.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, p.pointerEvents = Ai(s == null ? void 0 : s.pointerEvents) || ""), this.hasProjected && !An(this.latestValues) && (p.transform = u ? u({}, "") : "none", this.hasProjected = !1), p;
      }
      const h = d.animationValues || d.latestValues;
      this.applyTransformsToTarget(), c.transform = $0(this.projectionDeltaWithTransform, this.treeScale, h), u && (c.transform = u(h, c.transform));
      const { x: f, y: m } = this.projectionDelta;
      c.transformOrigin = `${f.origin * 100}% ${m.origin * 100}% 0`, d.animationValues ? c.opacity = d === this ? (l = (a = h.opacity) !== null && a !== void 0 ? a : this.latestValues.opacity) !== null && l !== void 0 ? l : 1 : this.preserveOpacity ? this.latestValues.opacity : h.opacityExit : c.opacity = d === this ? h.opacity !== void 0 ? h.opacity : "" : h.opacityExit !== void 0 ? h.opacityExit : 0;
      for (const p in $i) {
        if (h[p] === void 0)
          continue;
        const { correct: b, applyTo: v } = $i[p], x = c.transform === "none" ? h[p] : b(h[p], d);
        if (v) {
          const w = v.length;
          for (let E = 0; E < w; E++)
            c[v[E]] = x;
        } else
          c[p] = x;
      }
      return this.options.layoutId && (c.pointerEvents = d === this ? Ai(s == null ? void 0 : s.pointerEvents) || "" : "none"), c;
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((s) => {
        var a;
        return (a = s.currentAnimation) === null || a === void 0 ? void 0 : a.stop();
      }), this.root.nodes.forEach(vu), this.root.sharedNodes.clear();
    }
  };
}
function H0(e) {
  e.updateLayout();
}
function W0(e) {
  var t;
  const n = ((t = e.resumeFrom) === null || t === void 0 ? void 0 : t.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: i } = e.layout, { animationType: o } = e.options, s = n.source !== e.layout.source;
    o === "size" ? wt((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = yt(h);
      h.min = r[d].min, h.max = h.min + f;
    }) : Xh(o, n.layoutBox, r) && wt((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = yt(r[d]);
      h.max = h.min + f, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[d].max = e.relativeTarget[d].min + f);
    });
    const a = Zn();
    Fr(a, r, n.layoutBox);
    const l = Zn();
    s ? Fr(l, e.applyTransform(i, !0), n.measuredBox) : Fr(l, r, n.layoutBox);
    const c = !qh(a);
    let u = !1;
    if (!e.resumeFrom) {
      const d = e.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: h, layout: f } = d;
        if (h && f) {
          const m = Le();
          Vr(m, n.layoutBox, h.layoutBox);
          const p = Le();
          Vr(p, r, f.layoutBox), Kh(m, p) || (u = !0), d.options.layoutRoot && (e.relativeTarget = p, e.relativeTargetOrigin = m, e.relativeParent = d);
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
function q0(e) {
  Mr && Rn.totalNodes++, e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function K0(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function G0(e) {
  e.clearSnapshot();
}
function vu(e) {
  e.clearMeasurements();
}
function Y0(e) {
  e.isLayoutDirty = !1;
}
function X0(e) {
  const { visualElement: t } = e.options;
  t && t.getProps().onBeforeLayoutMeasure && t.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function bu(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function Z0(e) {
  e.resolveTargetDelta();
}
function J0(e) {
  e.calcProjection();
}
function Q0(e) {
  e.resetSkewAndRotation();
}
function e1(e) {
  e.removeLeadSnapshot();
}
function xu(e, t, n) {
  e.translate = De(t.translate, 0, n), e.scale = De(t.scale, 1, n), e.origin = t.origin, e.originPoint = t.originPoint;
}
function wu(e, t, n, r) {
  e.min = De(t.min, n.min, r), e.max = De(t.max, n.max, r);
}
function t1(e, t, n, r) {
  wu(e.x, t.x, n.x, r), wu(e.y, t.y, n.y, r);
}
function n1(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const r1 = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, Su = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), ku = Su("applewebkit/") && !Su("chrome/") ? Math.round : lt;
function Cu(e) {
  e.min = ku(e.min), e.max = ku(e.max);
}
function i1(e) {
  Cu(e.x), Cu(e.y);
}
function Xh(e, t, n) {
  return e === "position" || e === "preserve-aspect" && !a0(mu(t), mu(n), 0.2);
}
function o1(e) {
  var t;
  return e !== e.root && ((t = e.scroll) === null || t === void 0 ? void 0 : t.wasRoot);
}
const s1 = Yh({
  attachResizeListener: (e, t) => qr(e, "resize", t),
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body.scrollLeft,
    y: document.documentElement.scrollTop || document.body.scrollTop
  }),
  checkIsScrollRoot: () => !0
}), ss = {
  current: void 0
}, Zh = Yh({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!ss.current) {
      const e = new s1({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), ss.current = e;
    }
    return ss.current;
  },
  resetTransform: (e, t) => {
    e.style.transform = t !== void 0 ? t : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), a1 = {
  pan: {
    Feature: k0
  },
  drag: {
    Feature: S0,
    ProjectionNode: Zh,
    MeasureLayout: Uh
  }
};
function Tu(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileHover && e.animationState.setActive("whileHover", n === "Start");
  const i = "onHover" + n, o = r[i];
  o && Pe.postRender(() => o(t, ri(t)));
}
class l1 extends bn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = ax(t, (n) => (Tu(this.node, n, "Start"), (r) => Tu(this.node, r, "End"))));
  }
  unmount() {
  }
}
class c1 extends bn {
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
    this.unmount = ni(qr(this.node.current, "focus", () => this.onFocus()), qr(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function Eu(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileTap && e.animationState.setActive("whileTap", n === "Start");
  const i = "onTap" + (n === "End" ? "" : n), o = r[i];
  o && Pe.postRender(() => o(t, ri(t)));
}
class u1 extends bn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = dx(t, (n) => (Eu(this.node, n, "Start"), (r, { success: i }) => Eu(this.node, r, i ? "End" : "Cancel")), { useGlobalTarget: this.node.props.globalTapTarget }));
  }
  unmount() {
  }
}
const Ks = /* @__PURE__ */ new WeakMap(), as = /* @__PURE__ */ new WeakMap(), d1 = (e) => {
  const t = Ks.get(e.target);
  t && t(e);
}, f1 = (e) => {
  e.forEach(d1);
};
function h1({ root: e, ...t }) {
  const n = e || document;
  as.has(n) || as.set(n, {});
  const r = as.get(n), i = JSON.stringify(t);
  return r[i] || (r[i] = new IntersectionObserver(f1, { root: e, ...t })), r[i];
}
function p1(e, t, n) {
  const r = h1(t);
  return Ks.set(e, n), r.observe(e), () => {
    Ks.delete(e), r.unobserve(e);
  };
}
const m1 = {
  some: 0,
  all: 1
};
class g1 extends bn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    this.unmount();
    const { viewport: t = {} } = this.node.getProps(), { root: n, margin: r, amount: i = "some", once: o } = t, s = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof i == "number" ? i : m1[i]
    }, a = (l) => {
      const { isIntersecting: c } = l;
      if (this.isInView === c || (this.isInView = c, o && !c && this.hasEnteredView))
        return;
      c && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", c);
      const { onViewportEnter: u, onViewportLeave: d } = this.node.getProps(), h = c ? u : d;
      h && h(l);
    };
    return p1(this.node.current, s, a);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: t, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(y1(t, n)) && this.startObserver();
  }
  unmount() {
  }
}
function y1({ viewport: e = {} }, { viewport: t = {} } = {}) {
  return (n) => e[n] !== t[n];
}
const v1 = {
  inView: {
    Feature: g1
  },
  tap: {
    Feature: u1
  },
  focus: {
    Feature: c1
  },
  hover: {
    Feature: l1
  }
}, b1 = {
  layout: {
    ProjectionNode: Zh,
    MeasureLayout: Uh
  }
}, Gs = { current: null }, Jh = { current: !1 };
function x1() {
  if (Jh.current = !0, !!Ma)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => Gs.current = e.matches;
      e.addListener(t), t();
    } else
      Gs.current = !1;
}
const w1 = [...kh, Ye, mn], S1 = (e) => w1.find(Sh(e)), Pu = /* @__PURE__ */ new WeakMap();
function k1(e, t, n) {
  for (const r in t) {
    const i = t[r], o = n[r];
    if (Ze(i))
      e.addValue(r, i), process.env.NODE_ENV === "development" && yo(i.version === "11.18.2", `Attempting to mix Motion versions ${i.version} with 11.18.2 may not work as expected.`);
    else if (Ze(o))
      e.addValue(r, Hr(i, { owner: e }));
    else if (o !== i)
      if (e.hasValue(r)) {
        const s = e.getValue(r);
        s.liveStyle === !0 ? s.jump(i) : s.hasAnimated || s.set(i);
      } else {
        const s = e.getStaticValue(r);
        e.addValue(r, Hr(s !== void 0 ? s : i, { owner: e }));
      }
  }
  for (const r in n)
    t[r] === void 0 && e.removeValue(r);
  return t;
}
const Au = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
class C1 {
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
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = sl, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const f = zt.now();
      this.renderScheduledAt < f && (this.renderScheduledAt = f, Pe.render(this.render, !1, !0));
    };
    const { latestValues: l, renderState: c, onUpdate: u } = s;
    this.onUpdate = u, this.latestValues = l, this.baseTarget = { ...l }, this.initialValues = n.initial ? { ...l } : {}, this.renderState = c, this.parent = t, this.props = n, this.presenceContext = r, this.depth = t ? t.depth + 1 : 0, this.reducedMotionConfig = i, this.options = a, this.blockInitialAnimation = !!o, this.isControllingVariants = xo(n), this.isVariantNode = If(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(t && t.current);
    const { willChange: d, ...h } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const f in h) {
      const m = h[f];
      l[f] !== void 0 && Ze(m) && m.set(l[f], !1);
    }
  }
  mount(t) {
    this.current = t, Pu.set(t, this), this.projection && !this.projection.instance && this.projection.mount(t), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((n, r) => this.bindToMotionValue(r, n)), Jh.current || x1(), this.shouldReduceMotion = this.reducedMotionConfig === "never" ? !1 : this.reducedMotionConfig === "always" ? !0 : Gs.current, process.env.NODE_ENV !== "production" && yo(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected."), this.parent && this.parent.children.add(this), this.update(this.props, this.presenceContext);
  }
  unmount() {
    Pu.delete(this.current), this.projection && this.projection.unmount(), pn(this.notifyUpdate), pn(this.render), this.valueSubscriptions.forEach((t) => t()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent && this.parent.children.delete(this);
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
    const r = $n.has(t), i = n.on("change", (a) => {
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
    for (t in or) {
      const n = or[t];
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
    for (let r = 0; r < Au.length; r++) {
      const i = Au[r];
      this.propEventSubscriptions[i] && (this.propEventSubscriptions[i](), delete this.propEventSubscriptions[i]);
      const o = "on" + i, s = t[o];
      s && (this.propEventSubscriptions[i] = this.on(i, s));
    }
    this.prevMotionValues = k1(this, this.scrapeMotionValuesFromProps(t, this.prevProps, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue(), this.onUpdate && this.onUpdate(this);
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
    return r === void 0 && n !== void 0 && (r = Hr(n === null ? void 0 : n, { owner: this }), this.addValue(t, r)), r;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(t, n) {
    var r;
    let i = this.latestValues[t] !== void 0 || !this.current ? this.latestValues[t] : (r = this.getBaseTargetFromProps(this.props, t)) !== null && r !== void 0 ? r : this.readValueFromInstance(this.current, t, this.options);
    return i != null && (typeof i == "string" && (xh(i) || dh(i)) ? i = parseFloat(i) : !S1(i) && mn.test(n) && (i = yh(t, n)), this.setBaseTarget(t, Ze(i) ? i.get() : i)), Ze(i) ? i.get() : i;
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
      const s = za(this.props, r, (n = this.presenceContext) === null || n === void 0 ? void 0 : n.custom);
      s && (i = s[t]);
    }
    if (r && i !== void 0)
      return i;
    const o = this.getBaseTargetFromProps(this.props, t);
    return o !== void 0 && !Ze(o) ? o : this.initialValues[t] !== void 0 && i === void 0 ? void 0 : this.baseTarget[t];
  }
  on(t, n) {
    return this.events[t] || (this.events[t] = new el()), this.events[t].add(n);
  }
  notify(t, ...n) {
    this.events[t] && this.events[t].notify(...n);
  }
}
class Qh extends C1 {
  constructor() {
    super(...arguments), this.KeyframeResolver = Ch;
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
    Ze(t) && (this.childSubscription = t.on("change", (n) => {
      this.current && (this.current.textContent = `${n}`);
    }));
  }
}
function T1(e) {
  return window.getComputedStyle(e);
}
class E1 extends Qh {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = zf;
  }
  readValueFromInstance(t, n) {
    if ($n.has(n)) {
      const r = ol(n);
      return r && r.default || 0;
    } else {
      const r = T1(t), i = (Ff(n) ? r.getPropertyValue(n) : r[n]) || 0;
      return typeof i == "string" ? i.trim() : i;
    }
  }
  measureInstanceViewportBox(t, { transformPagePoint: n }) {
    return $h(t, n);
  }
  build(t, n, r) {
    Ua(t, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return Ka(t, n, r);
  }
}
class P1 extends Qh {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Le;
  }
  getBaseTargetFromProps(t, n) {
    return t[n];
  }
  readValueFromInstance(t, n) {
    if ($n.has(n)) {
      const r = ol(n);
      return r && r.default || 0;
    }
    return n = $f.has(n) ? n : Fa(n), t.getAttribute(n);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return Hf(t, n, r);
  }
  build(t, n, r) {
    Ha(t, n, this.isSVGTag, r.transformTemplate);
  }
  renderInstance(t, n, r, i) {
    jf(t, n, r, i);
  }
  mount(t) {
    this.isSVGTag = qa(t.tagName), super.mount(t);
  }
}
const A1 = (e, t) => Ba(e) ? new P1(t) : new E1(t, {
  allowProjection: e !== af
}), R1 = /* @__PURE__ */ ex({
  ...Jw,
  ...v1,
  ...a1,
  ...b1
}, A1), Jt = /* @__PURE__ */ mb(R1);
function oe(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(i) {
    if (e == null || e(i), n === !1 || !i.defaultPrevented)
      return t == null ? void 0 : t(i);
  };
}
function N1(e, t) {
  const n = y.createContext(t), r = (o) => {
    const { children: s, ...a } = o, l = y.useMemo(() => a, Object.values(a));
    return /* @__PURE__ */ g(n.Provider, { value: l, children: s });
  };
  r.displayName = e + "Provider";
  function i(o) {
    const s = y.useContext(n);
    if (s) return s;
    if (t !== void 0) return t;
    throw new Error(`\`${o}\` must be used within \`${e}\``);
  }
  return [r, i];
}
function tn(e, t = []) {
  let n = [];
  function r(o, s) {
    const a = y.createContext(s), l = n.length;
    n = [...n, s];
    const c = (d) => {
      var v;
      const { scope: h, children: f, ...m } = d, p = ((v = h == null ? void 0 : h[e]) == null ? void 0 : v[l]) || a, b = y.useMemo(() => m, Object.values(m));
      return /* @__PURE__ */ g(p.Provider, { value: b, children: f });
    };
    c.displayName = o + "Provider";
    function u(d, h) {
      var p;
      const f = ((p = h == null ? void 0 : h[e]) == null ? void 0 : p[l]) || a, m = y.useContext(f);
      if (m) return m;
      if (s !== void 0) return s;
      throw new Error(`\`${d}\` must be used within \`${o}\``);
    }
    return [c, u];
  }
  const i = () => {
    const o = n.map((s) => y.createContext(s));
    return function(a) {
      const l = (a == null ? void 0 : a[e]) || o;
      return y.useMemo(
        () => ({ [`__scope${e}`]: { ...a, [e]: l } }),
        [a, l]
      );
    };
  };
  return i.scopeName = e, [r, I1(i, ...t)];
}
function I1(...e) {
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
      return y.useMemo(() => ({ [`__scope${t.scopeName}`]: s }), [s]);
    };
  };
  return n.scopeName = t.scopeName, n;
}
var He = globalThis != null && globalThis.document ? y.useLayoutEffect : () => {
}, D1 = y[" useInsertionEffect ".trim().toString()] || He;
function gn({
  prop: e,
  defaultProp: t,
  onChange: n = () => {
  },
  caller: r
}) {
  const [i, o, s] = M1({
    defaultProp: t,
    onChange: n
  }), a = e !== void 0, l = a ? e : i;
  {
    const u = y.useRef(e !== void 0);
    y.useEffect(() => {
      const d = u.current;
      d !== a && console.warn(
        `${r} is changing from ${d ? "controlled" : "uncontrolled"} to ${a ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), u.current = a;
    }, [a, r]);
  }
  const c = y.useCallback(
    (u) => {
      var d;
      if (a) {
        const h = O1(u) ? u(e) : u;
        h !== e && ((d = s.current) == null || d.call(s, h));
      } else
        o(u);
    },
    [a, e, o, s]
  );
  return [l, c];
}
function M1({
  defaultProp: e,
  onChange: t
}) {
  const [n, r] = y.useState(e), i = y.useRef(n), o = y.useRef(t);
  return D1(() => {
    o.current = t;
  }, [t]), y.useEffect(() => {
    var s;
    i.current !== n && ((s = o.current) == null || s.call(o, n), i.current = n);
  }, [n, i]), [n, r, o];
}
function O1(e) {
  return typeof e == "function";
}
// @__NO_SIDE_EFFECTS__
function L1(e) {
  const t = /* @__PURE__ */ _1(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(V1);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function _1(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = z1(i), a = B1(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? zn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var F1 = Symbol("radix.slottable");
function V1(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === F1;
}
function B1(e, t) {
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
function z1(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var $1 = [
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
], he = $1.reduce((e, t) => {
  const n = /* @__PURE__ */ L1(`Primitive.${t}`), r = y.forwardRef((i, o) => {
    const { asChild: s, ...a } = i, l = s ? n : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ g(l, { ...a, ref: o });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {});
function j1(e, t) {
  e && ho.flushSync(() => e.dispatchEvent(t));
}
function U1(e, t) {
  return y.useReducer((n, r) => t[n][r] ?? n, e);
}
var nn = (e) => {
  const { present: t, children: n } = e, r = H1(t), i = typeof n == "function" ? n({ present: r.isPresent }) : y.Children.only(n), o = be(r.ref, W1(i));
  return typeof n == "function" || r.isPresent ? y.cloneElement(i, { ref: o }) : null;
};
nn.displayName = "Presence";
function H1(e) {
  const [t, n] = y.useState(), r = y.useRef(null), i = y.useRef(e), o = y.useRef("none"), s = e ? "mounted" : "unmounted", [a, l] = U1(s, {
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
  return y.useEffect(() => {
    const c = gi(r.current);
    o.current = a === "mounted" ? c : "none";
  }, [a]), He(() => {
    const c = r.current, u = i.current;
    if (u !== e) {
      const h = o.current, f = gi(c);
      e ? l("MOUNT") : f === "none" || (c == null ? void 0 : c.display) === "none" ? l("UNMOUNT") : l(u && h !== f ? "ANIMATION_OUT" : "UNMOUNT"), i.current = e;
    }
  }, [e, l]), He(() => {
    if (t) {
      let c;
      const u = t.ownerDocument.defaultView ?? window, d = (f) => {
        const p = gi(r.current).includes(CSS.escape(f.animationName));
        if (f.target === t && p && (l("ANIMATION_END"), !i.current)) {
          const b = t.style.animationFillMode;
          t.style.animationFillMode = "forwards", c = u.setTimeout(() => {
            t.style.animationFillMode === "forwards" && (t.style.animationFillMode = b);
          });
        }
      }, h = (f) => {
        f.target === t && (o.current = gi(r.current));
      };
      return t.addEventListener("animationstart", h), t.addEventListener("animationcancel", d), t.addEventListener("animationend", d), () => {
        u.clearTimeout(c), t.removeEventListener("animationstart", h), t.removeEventListener("animationcancel", d), t.removeEventListener("animationend", d);
      };
    } else
      l("ANIMATION_END");
  }, [t, l]), {
    isPresent: ["mounted", "unmountSuspended"].includes(a),
    ref: y.useCallback((c) => {
      r.current = c ? getComputedStyle(c) : null, n(c);
    }, [])
  };
}
function gi(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
function W1(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var q1 = y[" useId ".trim().toString()] || (() => {
}), K1 = 0;
function Xt(e) {
  const [t, n] = y.useState(q1());
  return He(() => {
    n((r) => r ?? String(K1++));
  }, [e]), e || (t ? `radix-${t}` : "");
}
var ko = "Collapsible", [G1] = tn(ko), [Y1, ul] = G1(ko), ep = y.forwardRef(
  (e, t) => {
    const {
      __scopeCollapsible: n,
      open: r,
      defaultOpen: i,
      disabled: o,
      onOpenChange: s,
      ...a
    } = e, [l, c] = gn({
      prop: r,
      defaultProp: i ?? !1,
      onChange: s,
      caller: ko
    });
    return /* @__PURE__ */ g(
      Y1,
      {
        scope: n,
        disabled: o,
        contentId: Xt(),
        open: l,
        onOpenToggle: y.useCallback(() => c((u) => !u), [c]),
        children: /* @__PURE__ */ g(
          he.div,
          {
            "data-state": fl(l),
            "data-disabled": o ? "" : void 0,
            ...a,
            ref: t
          }
        )
      }
    );
  }
);
ep.displayName = ko;
var tp = "CollapsibleTrigger", np = y.forwardRef(
  (e, t) => {
    const { __scopeCollapsible: n, ...r } = e, i = ul(tp, n);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        "aria-controls": i.contentId,
        "aria-expanded": i.open || !1,
        "data-state": fl(i.open),
        "data-disabled": i.disabled ? "" : void 0,
        disabled: i.disabled,
        ...r,
        ref: t,
        onClick: oe(e.onClick, i.onOpenToggle)
      }
    );
  }
);
np.displayName = tp;
var dl = "CollapsibleContent", rp = y.forwardRef(
  (e, t) => {
    const { forceMount: n, ...r } = e, i = ul(dl, e.__scopeCollapsible);
    return /* @__PURE__ */ g(nn, { present: n || i.open, children: ({ present: o }) => /* @__PURE__ */ g(X1, { ...r, ref: t, present: o }) });
  }
);
rp.displayName = dl;
var X1 = y.forwardRef((e, t) => {
  const { __scopeCollapsible: n, present: r, children: i, ...o } = e, s = ul(dl, n), [a, l] = y.useState(r), c = y.useRef(null), u = be(t, c), d = y.useRef(0), h = d.current, f = y.useRef(0), m = f.current, p = s.open || a, b = y.useRef(p), v = y.useRef(void 0);
  return y.useEffect(() => {
    const x = requestAnimationFrame(() => b.current = !1);
    return () => cancelAnimationFrame(x);
  }, []), He(() => {
    const x = c.current;
    if (x) {
      v.current = v.current || {
        transitionDuration: x.style.transitionDuration,
        animationName: x.style.animationName
      }, x.style.transitionDuration = "0s", x.style.animationName = "none";
      const w = x.getBoundingClientRect();
      d.current = w.height, f.current = w.width, b.current || (x.style.transitionDuration = v.current.transitionDuration, x.style.animationName = v.current.animationName), l(r);
    }
  }, [s.open, r]), /* @__PURE__ */ g(
    he.div,
    {
      "data-state": fl(s.open),
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
function fl(e) {
  return e ? "open" : "closed";
}
var Z1 = ep;
function J1({
  ...e
}) {
  return /* @__PURE__ */ g(Z1, { "data-slot": "collapsible", ...e });
}
function Q1({
  ...e
}) {
  return /* @__PURE__ */ g(
    np,
    {
      "data-slot": "collapsible-trigger",
      ...e
    }
  );
}
function eS({
  ...e
}) {
  return /* @__PURE__ */ g(
    rp,
    {
      "data-slot": "collapsible-content",
      ...e
    }
  );
}
const hl = $.forwardRef(
  (e, t) => e.file.type.startsWith("image/") ? /* @__PURE__ */ g(ip, { ...e, ref: t }) : e.file.type.startsWith("text/") || e.file.name.endsWith(".txt") || e.file.name.endsWith(".md") ? /* @__PURE__ */ g(op, { ...e, ref: t }) : /* @__PURE__ */ g(sp, { ...e, ref: t })
);
hl.displayName = "FilePreview";
const ip = $.forwardRef(
  ({ file: e, onRemove: t }, n) => /* @__PURE__ */ O(
    Jt.div,
    {
      ref: n,
      className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
      layout: !0,
      initial: { opacity: 0, y: "100%" },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: "100%" },
      children: [
        /* @__PURE__ */ O("div", { className: "flex w-full items-center space-x-2", children: [
          /* @__PURE__ */ g(
            "img",
            {
              alt: `Attachment ${e.name}`,
              className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover",
              src: URL.createObjectURL(e)
            }
          ),
          /* @__PURE__ */ g("span", { className: "w-full truncate text-muted-foreground", children: e.name })
        ] }),
        t ? /* @__PURE__ */ g(
          "button",
          {
            className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
            type: "button",
            onClick: t,
            "aria-label": "Remove attachment",
            children: /* @__PURE__ */ g(hr, { className: "h-2.5 w-2.5" })
          }
        ) : null
      ]
    }
  )
);
ip.displayName = "ImageFilePreview";
const op = $.forwardRef(
  ({ file: e, onRemove: t }, n) => {
    const [r, i] = $.useState("");
    return Be(() => {
      const o = new FileReader();
      o.onload = (s) => {
        var l;
        const a = (l = s.target) == null ? void 0 : l.result;
        i(a.slice(0, 50) + (a.length > 50 ? "..." : ""));
      }, o.readAsText(e);
    }, [e]), /* @__PURE__ */ O(
      Jt.div,
      {
        ref: n,
        className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        children: [
          /* @__PURE__ */ O("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ g("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5", children: /* @__PURE__ */ g("div", { className: "h-full w-full overflow-hidden text-[6px] leading-none text-muted-foreground", children: r || "Loading..." }) }),
            /* @__PURE__ */ g("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ g(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
              type: "button",
              onClick: t,
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ g(hr, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
op.displayName = "TextFilePreview";
const sp = $.forwardRef(
  ({ file: e, onRemove: t }, n) => /* @__PURE__ */ O(
    Jt.div,
    {
      ref: n,
      className: "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
      layout: !0,
      initial: { opacity: 0, y: "100%" },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: "100%" },
      children: [
        /* @__PURE__ */ O("div", { className: "flex w-full items-center space-x-2", children: [
          /* @__PURE__ */ g("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted", children: /* @__PURE__ */ g(tv, { className: "h-6 w-6 text-foreground" }) }),
          /* @__PURE__ */ g("span", { className: "w-full truncate text-muted-foreground", children: e.name })
        ] }),
        t ? /* @__PURE__ */ g(
          "button",
          {
            className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background",
            type: "button",
            onClick: t,
            "aria-label": "Remove attachment",
            children: /* @__PURE__ */ g(hr, { className: "h-2.5 w-2.5" })
          }
        ) : null
      ]
    }
  )
);
sp.displayName = "GenericFilePreview";
function tS(e, t) {
  const n = t || {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const nS = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, rS = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, iS = {};
function Ru(e, t) {
  return (iS.jsx ? rS : nS).test(e);
}
const oS = /[ \t\n\f\r]/g;
function sS(e) {
  return typeof e == "object" ? e.type === "text" ? Nu(e.value) : !1 : Nu(e);
}
function Nu(e) {
  return e.replace(oS, "") === "";
}
class ii {
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
ii.prototype.normal = {};
ii.prototype.property = {};
ii.prototype.space = void 0;
function ap(e, t) {
  const n = {}, r = {};
  for (const i of e)
    Object.assign(n, i.property), Object.assign(r, i.normal);
  return new ii(n, r, t);
}
function Ys(e) {
  return e.toLowerCase();
}
class ct {
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
ct.prototype.attribute = "";
ct.prototype.booleanish = !1;
ct.prototype.boolean = !1;
ct.prototype.commaOrSpaceSeparated = !1;
ct.prototype.commaSeparated = !1;
ct.prototype.defined = !1;
ct.prototype.mustUseProperty = !1;
ct.prototype.number = !1;
ct.prototype.overloadedBoolean = !1;
ct.prototype.property = "";
ct.prototype.spaceSeparated = !1;
ct.prototype.space = void 0;
let aS = 0;
const de = jn(), Fe = jn(), Xs = jn(), z = jn(), Te = jn(), tr = jn(), ht = jn();
function jn() {
  return 2 ** ++aS;
}
const Zs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: de,
  booleanish: Fe,
  commaOrSpaceSeparated: ht,
  commaSeparated: tr,
  number: z,
  overloadedBoolean: Xs,
  spaceSeparated: Te
}, Symbol.toStringTag, { value: "Module" })), ls = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(Zs)
);
class pl extends ct {
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
    if (super(t, n), Iu(this, "space", i), typeof r == "number")
      for (; ++o < ls.length; ) {
        const s = ls[o];
        Iu(this, ls[o], (r & Zs[s]) === Zs[s]);
      }
  }
}
pl.prototype.defined = !0;
function Iu(e, t, n) {
  n && (e[t] = n);
}
function vr(e) {
  const t = {}, n = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const o = new pl(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (o.mustUseProperty = !0), t[r] = o, n[Ys(r)] = r, n[Ys(o.attribute)] = r;
  }
  return new ii(t, n, e.space);
}
const lp = vr({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: Fe,
    ariaAutoComplete: null,
    ariaBusy: Fe,
    ariaChecked: Fe,
    ariaColCount: z,
    ariaColIndex: z,
    ariaColSpan: z,
    ariaControls: Te,
    ariaCurrent: null,
    ariaDescribedBy: Te,
    ariaDetails: null,
    ariaDisabled: Fe,
    ariaDropEffect: Te,
    ariaErrorMessage: null,
    ariaExpanded: Fe,
    ariaFlowTo: Te,
    ariaGrabbed: Fe,
    ariaHasPopup: null,
    ariaHidden: Fe,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: Te,
    ariaLevel: z,
    ariaLive: null,
    ariaModal: Fe,
    ariaMultiLine: Fe,
    ariaMultiSelectable: Fe,
    ariaOrientation: null,
    ariaOwns: Te,
    ariaPlaceholder: null,
    ariaPosInSet: z,
    ariaPressed: Fe,
    ariaReadOnly: Fe,
    ariaRelevant: null,
    ariaRequired: Fe,
    ariaRoleDescription: Te,
    ariaRowCount: z,
    ariaRowIndex: z,
    ariaRowSpan: z,
    ariaSelected: Fe,
    ariaSetSize: z,
    ariaSort: null,
    ariaValueMax: z,
    ariaValueMin: z,
    ariaValueNow: z,
    ariaValueText: null,
    role: null
  },
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  }
});
function cp(e, t) {
  return t in e ? e[t] : t;
}
function up(e, t) {
  return cp(e, t.toLowerCase());
}
const lS = vr({
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
    accept: tr,
    acceptCharset: Te,
    accessKey: Te,
    action: null,
    allow: null,
    allowFullScreen: de,
    allowPaymentRequest: de,
    allowUserMedia: de,
    alt: null,
    as: null,
    async: de,
    autoCapitalize: null,
    autoComplete: Te,
    autoFocus: de,
    autoPlay: de,
    blocking: Te,
    capture: null,
    charSet: null,
    checked: de,
    cite: null,
    className: Te,
    cols: z,
    colSpan: null,
    content: null,
    contentEditable: Fe,
    controls: de,
    controlsList: Te,
    coords: z | tr,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: de,
    defer: de,
    dir: null,
    dirName: null,
    disabled: de,
    download: Xs,
    draggable: Fe,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: de,
    formTarget: null,
    headers: Te,
    height: z,
    hidden: Xs,
    high: z,
    href: null,
    hrefLang: null,
    htmlFor: Te,
    httpEquiv: Te,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: de,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: de,
    itemId: null,
    itemProp: Te,
    itemRef: Te,
    itemScope: de,
    itemType: Te,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: de,
    low: z,
    manifest: null,
    max: null,
    maxLength: z,
    media: null,
    method: null,
    min: null,
    minLength: z,
    multiple: de,
    muted: de,
    name: null,
    nonce: null,
    noModule: de,
    noValidate: de,
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
    open: de,
    optimum: z,
    pattern: null,
    ping: Te,
    placeholder: null,
    playsInline: de,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: de,
    referrerPolicy: null,
    rel: Te,
    required: de,
    reversed: de,
    rows: z,
    rowSpan: z,
    sandbox: Te,
    scope: null,
    scoped: de,
    seamless: de,
    selected: de,
    shadowRootClonable: de,
    shadowRootDelegatesFocus: de,
    shadowRootMode: null,
    shape: null,
    size: z,
    sizes: null,
    slot: null,
    span: z,
    spellCheck: Fe,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: z,
    step: null,
    style: null,
    tabIndex: z,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: de,
    useMap: null,
    value: Fe,
    width: z,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: Te,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: z,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: z,
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
    compact: de,
    // Lists. Use CSS to reduce space between items instead
    declare: de,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: z,
    // `<img>` and `<object>`
    leftMargin: z,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: z,
    // `<body>`
    marginWidth: z,
    // `<body>`
    noResize: de,
    // `<frame>`
    noHref: de,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: de,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: de,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: z,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: Fe,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: z,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: z,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: de,
    disableRemotePlayback: de,
    prefix: null,
    property: null,
    results: z,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: up
}), cS = vr({
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
    about: ht,
    accentHeight: z,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: z,
    amplitude: z,
    arabicForm: null,
    ascent: z,
    attributeName: null,
    attributeType: null,
    azimuth: z,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: z,
    by: null,
    calcMode: null,
    capHeight: z,
    className: Te,
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
    descent: z,
    diffuseConstant: z,
    direction: null,
    display: null,
    dur: null,
    divisor: z,
    dominantBaseline: null,
    download: de,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: z,
    enableBackground: null,
    end: null,
    event: null,
    exponent: z,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: z,
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
    g1: tr,
    g2: tr,
    glyphName: tr,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: z,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: z,
    horizOriginX: z,
    horizOriginY: z,
    id: null,
    ideographic: z,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: z,
    k: z,
    k1: z,
    k2: z,
    k3: z,
    k4: z,
    kernelMatrix: ht,
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
    limitingConeAngle: z,
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
    mediaSize: z,
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
    overlinePosition: z,
    overlineThickness: z,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: z,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: Te,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: z,
    pointsAtY: z,
    pointsAtZ: z,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: ht,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: ht,
    rev: ht,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: ht,
    requiredFeatures: ht,
    requiredFonts: ht,
    requiredFormats: ht,
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
    specularConstant: z,
    specularExponent: z,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: z,
    strikethroughThickness: z,
    string: null,
    stroke: null,
    strokeDashArray: ht,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: z,
    strokeOpacity: z,
    strokeWidth: null,
    style: null,
    surfaceScale: z,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: ht,
    tabIndex: z,
    tableValues: null,
    target: null,
    targetX: z,
    targetY: z,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: ht,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: z,
    underlineThickness: z,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: z,
    values: null,
    vAlphabetic: z,
    vMathematical: z,
    vectorEffect: null,
    vHanging: z,
    vIdeographic: z,
    version: null,
    vertAdvY: z,
    vertOriginX: z,
    vertOriginY: z,
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
    xHeight: z,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: cp
}), dp = vr({
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
}), fp = vr({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: up
}), hp = vr({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  }
}), uS = {
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
}, dS = /[A-Z]/g, Du = /-[a-z]/g, fS = /^data[-\w.:]+$/i;
function hS(e, t) {
  const n = Ys(t);
  let r = t, i = ct;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && fS.test(t)) {
    if (t.charAt(4) === "-") {
      const o = t.slice(5).replace(Du, mS);
      r = "data" + o.charAt(0).toUpperCase() + o.slice(1);
    } else {
      const o = t.slice(4);
      if (!Du.test(o)) {
        let s = o.replace(dS, pS);
        s.charAt(0) !== "-" && (s = "-" + s), t = "data" + s;
      }
    }
    i = pl;
  }
  return new i(r, t);
}
function pS(e) {
  return "-" + e.toLowerCase();
}
function mS(e) {
  return e.charAt(1).toUpperCase();
}
const gS = ap([lp, lS, dp, fp, hp], "html"), ml = ap([lp, cS, dp, fp, hp], "svg");
function yS(e) {
  return e.join(" ").trim();
}
var Ki = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function pp(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var gl = {}, Mu = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, vS = /\n/g, bS = /^\s*/, xS = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, wS = /^:\s*/, SS = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, kS = /^[;\s]*/, CS = /^\s+|\s+$/g, TS = `
`, Ou = "/", Lu = "*", In = "", ES = "comment", PS = "declaration";
function AS(e, t) {
  if (typeof e != "string")
    throw new TypeError("First argument must be a string");
  if (!e) return [];
  t = t || {};
  var n = 1, r = 1;
  function i(m) {
    var p = m.match(vS);
    p && (n += p.length);
    var b = m.lastIndexOf(TS);
    r = ~b ? m.length - b : r + m.length;
  }
  function o() {
    var m = { line: n, column: r };
    return function(p) {
      return p.position = new s(m), c(), p;
    };
  }
  function s(m) {
    this.start = m, this.end = { line: n, column: r }, this.source = t.source;
  }
  s.prototype.content = e;
  function a(m) {
    var p = new Error(
      t.source + ":" + n + ":" + r + ": " + m
    );
    if (p.reason = m, p.filename = t.source, p.line = n, p.column = r, p.source = e, !t.silent) throw p;
  }
  function l(m) {
    var p = m.exec(e);
    if (p) {
      var b = p[0];
      return i(b), e = e.slice(b.length), p;
    }
  }
  function c() {
    l(bS);
  }
  function u(m) {
    var p;
    for (m = m || []; p = d(); )
      p !== !1 && m.push(p);
    return m;
  }
  function d() {
    var m = o();
    if (!(Ou != e.charAt(0) || Lu != e.charAt(1))) {
      for (var p = 2; In != e.charAt(p) && (Lu != e.charAt(p) || Ou != e.charAt(p + 1)); )
        ++p;
      if (p += 2, In === e.charAt(p - 1))
        return a("End of comment missing");
      var b = e.slice(2, p - 2);
      return r += 2, i(b), e = e.slice(p), r += 2, m({
        type: ES,
        comment: b
      });
    }
  }
  function h() {
    var m = o(), p = l(xS);
    if (p) {
      if (d(), !l(wS)) return a("property missing ':'");
      var b = l(SS), v = m({
        type: PS,
        property: _u(p[0].replace(Mu, In)),
        value: b ? _u(b[0].replace(Mu, In)) : In
      });
      return l(kS), v;
    }
  }
  function f() {
    var m = [];
    u(m);
    for (var p; p = h(); )
      p !== !1 && (m.push(p), u(m));
    return m;
  }
  return c(), f();
}
function _u(e) {
  return e ? e.replace(CS, In) : In;
}
var RS = AS, NS = Ki && Ki.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(gl, "__esModule", { value: !0 });
gl.default = DS;
const IS = NS(RS);
function DS(e, t) {
  let n = null;
  if (!e || typeof e != "string")
    return n;
  const r = (0, IS.default)(e), i = typeof t == "function";
  return r.forEach((o) => {
    if (o.type !== "declaration")
      return;
    const { property: s, value: a } = o;
    i ? t(s, a, o) : a && (n = n || {}, n[s] = a);
  }), n;
}
var Co = {};
Object.defineProperty(Co, "__esModule", { value: !0 });
Co.camelCase = void 0;
var MS = /^--[a-zA-Z0-9_-]+$/, OS = /-([a-z])/g, LS = /^[^-]+$/, _S = /^-(webkit|moz|ms|o|khtml)-/, FS = /^-(ms)-/, VS = function(e) {
  return !e || LS.test(e) || MS.test(e);
}, BS = function(e, t) {
  return t.toUpperCase();
}, Fu = function(e, t) {
  return "".concat(t, "-");
}, zS = function(e, t) {
  return t === void 0 && (t = {}), VS(e) ? e : (e = e.toLowerCase(), t.reactCompat ? e = e.replace(FS, Fu) : e = e.replace(_S, Fu), e.replace(OS, BS));
};
Co.camelCase = zS;
var $S = Ki && Ki.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
}, jS = $S(gl), US = Co;
function Js(e, t) {
  var n = {};
  return !e || typeof e != "string" || (0, jS.default)(e, function(r, i) {
    r && i && (n[(0, US.camelCase)(r, t)] = i);
  }), n;
}
Js.default = Js;
var HS = Js;
const WS = /* @__PURE__ */ pp(HS), mp = gp("end"), yl = gp("start");
function gp(e) {
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
function qS(e) {
  const t = yl(e), n = mp(e);
  if (t && n)
    return { start: t, end: n };
}
function Br(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? Vu(e.position) : "start" in e || "end" in e ? Vu(e) : "line" in e || "column" in e ? Qs(e) : "";
}
function Qs(e) {
  return Bu(e && e.line) + ":" + Bu(e && e.column);
}
function Vu(e) {
  return Qs(e && e.start) + "-" + Qs(e && e.end);
}
function Bu(e) {
  return e && typeof e == "number" ? e : 1;
}
class Qe extends Error {
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
    this.ancestors = o.ancestors || void 0, this.cause = o.cause || void 0, this.column = a ? a.column : void 0, this.fatal = void 0, this.file = "", this.message = i, this.line = a ? a.line : void 0, this.name = Br(o.place) || "1:1", this.place = o.place || void 0, this.reason = this.message, this.ruleId = o.ruleId || void 0, this.source = o.source || void 0, this.stack = s && o.cause && typeof o.cause.stack == "string" ? o.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
  }
}
Qe.prototype.file = "";
Qe.prototype.name = "";
Qe.prototype.reason = "";
Qe.prototype.message = "";
Qe.prototype.stack = "";
Qe.prototype.column = void 0;
Qe.prototype.line = void 0;
Qe.prototype.ancestors = void 0;
Qe.prototype.cause = void 0;
Qe.prototype.fatal = void 0;
Qe.prototype.place = void 0;
Qe.prototype.ruleId = void 0;
Qe.prototype.source = void 0;
const vl = {}.hasOwnProperty, KS = /* @__PURE__ */ new Map(), GS = /[A-Z]/g, YS = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), XS = /* @__PURE__ */ new Set(["td", "th"]), yp = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function ZS(e, t) {
  if (!t || t.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = ok(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = ik(n, t.jsx, t.jsxs);
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
    schema: t.space === "svg" ? ml : gS,
    stylePropertyNameCase: t.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: t.tableCellAlignToStyle !== !1
  }, o = vp(i, e, void 0);
  return o && typeof o != "string" ? o : i.create(
    e,
    i.Fragment,
    { children: o || void 0 },
    void 0
  );
}
function vp(e, t, n) {
  if (t.type === "element")
    return JS(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression")
    return QS(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement")
    return tk(e, t, n);
  if (t.type === "mdxjsEsm")
    return ek(e, t);
  if (t.type === "root")
    return nk(e, t, n);
  if (t.type === "text")
    return rk(e, t);
}
function JS(e, t, n) {
  const r = e.schema;
  let i = r;
  t.tagName.toLowerCase() === "svg" && r.space === "html" && (i = ml, e.schema = i), e.ancestors.push(t);
  const o = xp(e, t.tagName, !1), s = sk(e, t);
  let a = xl(e, t);
  return YS.has(t.tagName) && (a = a.filter(function(l) {
    return typeof l == "string" ? !sS(l) : !0;
  })), bp(e, s, o, t), bl(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function QS(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  Kr(e, t.position);
}
function ek(e, t) {
  if (t.data && t.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(t.data.estree)
    );
  Kr(e, t.position);
}
function tk(e, t, n) {
  const r = e.schema;
  let i = r;
  t.name === "svg" && r.space === "html" && (i = ml, e.schema = i), e.ancestors.push(t);
  const o = t.name === null ? e.Fragment : xp(e, t.name, !0), s = ak(e, t), a = xl(e, t);
  return bp(e, s, o, t), bl(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function nk(e, t, n) {
  const r = {};
  return bl(r, xl(e, t)), e.create(t, e.Fragment, r, n);
}
function rk(e, t) {
  return t.value;
}
function bp(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function bl(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function ik(e, t, n) {
  return r;
  function r(i, o, s, a) {
    const c = Array.isArray(s.children) ? n : t;
    return a ? c(o, s, a) : c(o, s);
  }
}
function ok(e, t) {
  return n;
  function n(r, i, o, s) {
    const a = Array.isArray(o.children), l = yl(r);
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
function sk(e, t) {
  const n = {};
  let r, i;
  for (i in t.properties)
    if (i !== "children" && vl.call(t.properties, i)) {
      const o = lk(e, i, t.properties[i]);
      if (o) {
        const [s, a] = o;
        e.tableCellAlignToStyle && s === "align" && typeof a == "string" && XS.has(t.tagName) ? r = a : n[s] = a;
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
function ak(e, t) {
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
        Kr(e, t.position);
    else {
      const i = r.name;
      let o;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const a = r.value.data.estree.body[0];
          a.type, o = e.evaluater.evaluateExpression(a.expression);
        } else
          Kr(e, t.position);
      else
        o = r.value === null ? !0 : r.value;
      n[i] = /** @type {Props[keyof Props]} */
      o;
    }
  return n;
}
function xl(e, t) {
  const n = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : KS;
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
    const a = vp(e, o, s);
    a !== void 0 && n.push(a);
  }
  return n;
}
function lk(e, t, n) {
  const r = hS(e.schema, t);
  if (!(n == null || typeof n == "number" && Number.isNaN(n))) {
    if (Array.isArray(n) && (n = r.commaSeparated ? tS(n) : yS(n)), r.property === "style") {
      let i = typeof n == "object" ? n : ck(e, String(n));
      return e.stylePropertyNameCase === "css" && (i = uk(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? uS[r.property] || r.property : r.attribute,
      n
    ];
  }
}
function ck(e, t) {
  try {
    return WS(t, { reactCompat: !0 });
  } catch (n) {
    if (e.ignoreInvalidStyle)
      return {};
    const r = (
      /** @type {Error} */
      n
    ), i = new Qe("Cannot parse `style` attribute", {
      ancestors: e.ancestors,
      cause: r,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    throw i.file = e.filePath || void 0, i.url = yp + "#cannot-parse-style-attribute", i;
  }
}
function xp(e, t, n) {
  let r;
  if (!n)
    r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const i = t.split(".");
    let o = -1, s;
    for (; ++o < i.length; ) {
      const a = Ru(i[o]) ? { type: "Identifier", name: i[o] } : { type: "Literal", value: i[o] };
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
    r = Ru(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return vl.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  Kr(e);
}
function Kr(e, t) {
  const n = new Qe(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: t,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw n.file = e.filePath || void 0, n.url = yp + "#cannot-handle-mdx-estrees-without-createevaluater", n;
}
function uk(e) {
  const t = {};
  let n;
  for (n in e)
    vl.call(e, n) && (t[dk(n)] = e[n]);
  return t;
}
function dk(e) {
  let t = e.replace(GS, fk);
  return t.slice(0, 3) === "ms-" && (t = "-" + t), t;
}
function fk(e) {
  return "-" + e.toLowerCase();
}
const cs = {
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
}, hk = {};
function wl(e, t) {
  const n = hk, r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0, i = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return wp(e, r, i);
}
function wp(e, t, n) {
  if (pk(e)) {
    if ("value" in e)
      return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return zu(e.children, t, n);
  }
  return Array.isArray(e) ? zu(e, t, n) : "";
}
function zu(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = wp(e[i], t, n);
  return r.join("");
}
function pk(e) {
  return !!(e && typeof e == "object");
}
const $u = document.createElement("i");
function Sl(e) {
  const t = "&" + e + ";";
  $u.innerHTML = t;
  const n = $u.textContent;
  return (
    // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
    // yield `null`.
    n.charCodeAt(n.length - 1) === 59 && e !== "semi" || n === t ? !1 : n
  );
}
function mt(e, t, n, r) {
  const i = e.length;
  let o = 0, s;
  if (t < 0 ? t = -t > i ? 0 : i + t : t = t > i ? i : t, n = n > 0 ? n : 0, r.length < 1e4)
    s = Array.from(r), s.unshift(t, n), e.splice(...s);
  else
    for (n && e.splice(t, n); o < r.length; )
      s = r.slice(o, o + 1e4), s.unshift(t, 0), e.splice(...s), o += 1e4, t += 1e4;
}
function St(e, t) {
  return e.length > 0 ? (mt(e, e.length, 0, t), e) : t;
}
const ju = {}.hasOwnProperty;
function Sp(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    mk(t, e[n]);
  return t;
}
function mk(e, t) {
  let n;
  for (n in t) {
    const i = (ju.call(e, n) ? e[n] : void 0) || (e[n] = {}), o = t[n];
    let s;
    if (o)
      for (s in o) {
        ju.call(i, s) || (i[s] = []);
        const a = o[s];
        gk(
          // @ts-expect-error Looks like a list.
          i[s],
          Array.isArray(a) ? a : a ? [a] : []
        );
      }
  }
}
function gk(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  mt(e, 0, 0, r);
}
function kp(e, t) {
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
function Nt(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const nt = xn(/[A-Za-z]/), Je = xn(/[\dA-Za-z]/), yk = xn(/[#-'*+\--9=?A-Z^-~]/);
function Gi(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const ea = xn(/\d/), vk = xn(/[\dA-Fa-f]/), bk = xn(/[!-/:-@[-`{-~]/);
function X(e) {
  return e !== null && e < -2;
}
function Se(e) {
  return e !== null && (e < 0 || e === 32);
}
function ge(e) {
  return e === -2 || e === -1 || e === 32;
}
const To = xn(new RegExp("\\p{P}|\\p{S}", "u")), On = xn(/\s/);
function xn(e) {
  return t;
  function t(n) {
    return n !== null && n > -1 && e.test(String.fromCharCode(n));
  }
}
function br(e) {
  const t = [];
  let n = -1, r = 0, i = 0;
  for (; ++n < e.length; ) {
    const o = e.charCodeAt(n);
    let s = "";
    if (o === 37 && Je(e.charCodeAt(n + 1)) && Je(e.charCodeAt(n + 2)))
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
function ve(e, t, n, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let o = 0;
  return s;
  function s(l) {
    return ge(l) ? (e.enter(n), a(l)) : t(l);
  }
  function a(l) {
    return ge(l) && o++ < i ? (e.consume(l), a) : (e.exit(n), t(l));
  }
}
const xk = {
  tokenize: wk
};
function wk(e) {
  const t = e.attempt(this.parser.constructs.contentInitial, r, i);
  let n;
  return t;
  function r(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), ve(e, t, "linePrefix");
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
    return X(a) ? (e.consume(a), e.exit("chunkText"), o) : (e.consume(a), s);
  }
}
const Sk = {
  tokenize: kk
}, Uu = {
  tokenize: Ck
};
function kk(e) {
  const t = this, n = [];
  let r = 0, i, o, s;
  return a;
  function a(w) {
    if (r < n.length) {
      const E = n[r];
      return t.containerState = E[1], e.attempt(E[0].continuation, l, c)(w);
    }
    return c(w);
  }
  function l(w) {
    if (r++, t.containerState._closeFlow) {
      t.containerState._closeFlow = void 0, i && x();
      const E = t.events.length;
      let T = E, k;
      for (; T--; )
        if (t.events[T][0] === "exit" && t.events[T][1].type === "chunkFlow") {
          k = t.events[T][1].end;
          break;
        }
      v(r);
      let A = E;
      for (; A < t.events.length; )
        t.events[A][1].end = {
          ...k
        }, A++;
      return mt(t.events, T + 1, 0, t.events.slice(E)), t.events.length = A, c(w);
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
    return t.containerState = {}, e.check(Uu, u, d)(w);
  }
  function u(w) {
    return i && x(), v(r), h(w);
  }
  function d(w) {
    return t.parser.lazy[t.now().line] = r !== n.length, s = t.now().offset, m(w);
  }
  function h(w) {
    return t.containerState = {}, e.attempt(Uu, f, m)(w);
  }
  function f(w) {
    return r++, n.push([t.currentConstruct, t.containerState]), h(w);
  }
  function m(w) {
    if (w === null) {
      i && x(), v(0), e.consume(w);
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
      b(e.exit("chunkFlow"), !0), v(0), e.consume(w);
      return;
    }
    return X(w) ? (e.consume(w), b(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, a) : (e.consume(w), p);
  }
  function b(w, E) {
    const T = t.sliceStream(w);
    if (E && T.push(null), w.previous = o, o && (o.next = w), o = w, i.defineSkip(w.start), i.write(T), t.parser.lazy[w.start.line]) {
      let k = i.events.length;
      for (; k--; )
        if (
          // The token starts before the line ending…
          i.events[k][1].start.offset < s && // …and either is not ended yet…
          (!i.events[k][1].end || // …or ends after it.
          i.events[k][1].end.offset > s)
        )
          return;
      const A = t.events.length;
      let D = A, F, P;
      for (; D--; )
        if (t.events[D][0] === "exit" && t.events[D][1].type === "chunkFlow") {
          if (F) {
            P = t.events[D][1].end;
            break;
          }
          F = !0;
        }
      for (v(r), k = A; k < t.events.length; )
        t.events[k][1].end = {
          ...P
        }, k++;
      mt(t.events, D + 1, 0, t.events.slice(A)), t.events.length = k;
    }
  }
  function v(w) {
    let E = n.length;
    for (; E-- > w; ) {
      const T = n[E];
      t.containerState = T[1], T[0].exit.call(t, e);
    }
    n.length = w;
  }
  function x() {
    i.write([null]), o = void 0, i = void 0, t.containerState._closeFlow = void 0;
  }
}
function Ck(e, t, n) {
  return ve(e, e.attempt(this.parser.constructs.document, t, n), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function ar(e) {
  if (e === null || Se(e) || On(e))
    return 1;
  if (To(e))
    return 2;
}
function Eo(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const o = e[i].resolveAll;
    o && !r.includes(o) && (t = o(t, n), r.push(o));
  }
  return t;
}
const ta = {
  name: "attention",
  resolveAll: Tk,
  tokenize: Ek
};
function Tk(e, t) {
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
          Hu(d, -l), Hu(h, l), s = {
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
          }, c = [], e[r][1].end.offset - e[r][1].start.offset && (c = St(c, [["enter", e[r][1], t], ["exit", e[r][1], t]])), c = St(c, [["enter", i, t], ["enter", s, t], ["exit", s, t], ["enter", o, t]]), c = St(c, Eo(t.parser.constructs.insideSpan.null, e.slice(r + 1, n), t)), c = St(c, [["exit", o, t], ["enter", a, t], ["exit", a, t], ["exit", i, t]]), e[n][1].end.offset - e[n][1].start.offset ? (u = 2, c = St(c, [["enter", e[n][1], t], ["exit", e[n][1], t]])) : u = 0, mt(e, r - 1, n - r + 3, c), n = r + c.length - u - 2;
          break;
        }
    }
  for (n = -1; ++n < e.length; )
    e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function Ek(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = ar(r);
  let o;
  return s;
  function s(l) {
    return o = l, e.enter("attentionSequence"), a(l);
  }
  function a(l) {
    if (l === o)
      return e.consume(l), a;
    const c = e.exit("attentionSequence"), u = ar(l), d = !u || u === 2 && i || n.includes(l), h = !i || i === 2 && u || n.includes(r);
    return c._open = !!(o === 42 ? d : d && (i || !h)), c._close = !!(o === 42 ? h : h && (u || !d)), t(l);
  }
}
function Hu(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const Pk = {
  name: "autolink",
  tokenize: Ak
};
function Ak(e, t, n) {
  let r = 0;
  return i;
  function i(f) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), o;
  }
  function o(f) {
    return nt(f) ? (e.consume(f), s) : f === 64 ? n(f) : c(f);
  }
  function s(f) {
    return f === 43 || f === 45 || f === 46 || Je(f) ? (r = 1, a(f)) : c(f);
  }
  function a(f) {
    return f === 58 ? (e.consume(f), r = 0, l) : (f === 43 || f === 45 || f === 46 || Je(f)) && r++ < 32 ? (e.consume(f), a) : (r = 0, c(f));
  }
  function l(f) {
    return f === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : f === null || f === 32 || f === 60 || Gi(f) ? n(f) : (e.consume(f), l);
  }
  function c(f) {
    return f === 64 ? (e.consume(f), u) : yk(f) ? (e.consume(f), c) : n(f);
  }
  function u(f) {
    return Je(f) ? d(f) : n(f);
  }
  function d(f) {
    return f === 46 ? (e.consume(f), r = 0, u) : f === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : h(f);
  }
  function h(f) {
    if ((f === 45 || Je(f)) && r++ < 63) {
      const m = f === 45 ? h : d;
      return e.consume(f), m;
    }
    return n(f);
  }
}
const oi = {
  partial: !0,
  tokenize: Rk
};
function Rk(e, t, n) {
  return r;
  function r(o) {
    return ge(o) ? ve(e, i, "linePrefix")(o) : i(o);
  }
  function i(o) {
    return o === null || X(o) ? t(o) : n(o);
  }
}
const Cp = {
  continuation: {
    tokenize: Ik
  },
  exit: Dk,
  name: "blockQuote",
  tokenize: Nk
};
function Nk(e, t, n) {
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
    return ge(s) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(s), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(s));
  }
}
function Ik(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return ge(s) ? ve(e, o, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(s) : o(s);
  }
  function o(s) {
    return e.attempt(Cp, t, n)(s);
  }
}
function Dk(e) {
  e.exit("blockQuote");
}
const Tp = {
  name: "characterEscape",
  tokenize: Mk
};
function Mk(e, t, n) {
  return r;
  function r(o) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(o), e.exit("escapeMarker"), i;
  }
  function i(o) {
    return bk(o) ? (e.enter("characterEscapeValue"), e.consume(o), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(o);
  }
}
const Ep = {
  name: "characterReference",
  tokenize: Ok
};
function Ok(e, t, n) {
  const r = this;
  let i = 0, o, s;
  return a;
  function a(d) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), l;
  }
  function l(d) {
    return d === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(d), e.exit("characterReferenceMarkerNumeric"), c) : (e.enter("characterReferenceValue"), o = 31, s = Je, u(d));
  }
  function c(d) {
    return d === 88 || d === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(d), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), o = 6, s = vk, u) : (e.enter("characterReferenceValue"), o = 7, s = ea, u(d));
  }
  function u(d) {
    if (d === 59 && i) {
      const h = e.exit("characterReferenceValue");
      return s === Je && !Sl(r.sliceSerialize(h)) ? n(d) : (e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), e.exit("characterReference"), t);
    }
    return s(d) && i++ < o ? (e.consume(d), u) : n(d);
  }
}
const Wu = {
  partial: !0,
  tokenize: _k
}, qu = {
  concrete: !0,
  name: "codeFenced",
  tokenize: Lk
};
function Lk(e, t, n) {
  const r = this, i = {
    partial: !0,
    tokenize: T
  };
  let o = 0, s = 0, a;
  return l;
  function l(k) {
    return c(k);
  }
  function c(k) {
    const A = r.events[r.events.length - 1];
    return o = A && A[1].type === "linePrefix" ? A[2].sliceSerialize(A[1], !0).length : 0, a = k, e.enter("codeFenced"), e.enter("codeFencedFence"), e.enter("codeFencedFenceSequence"), u(k);
  }
  function u(k) {
    return k === a ? (s++, e.consume(k), u) : s < 3 ? n(k) : (e.exit("codeFencedFenceSequence"), ge(k) ? ve(e, d, "whitespace")(k) : d(k));
  }
  function d(k) {
    return k === null || X(k) ? (e.exit("codeFencedFence"), r.interrupt ? t(k) : e.check(Wu, p, E)(k)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), h(k));
  }
  function h(k) {
    return k === null || X(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), d(k)) : ge(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), ve(e, f, "whitespace")(k)) : k === 96 && k === a ? n(k) : (e.consume(k), h);
  }
  function f(k) {
    return k === null || X(k) ? d(k) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), m(k));
  }
  function m(k) {
    return k === null || X(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), d(k)) : k === 96 && k === a ? n(k) : (e.consume(k), m);
  }
  function p(k) {
    return e.attempt(i, E, b)(k);
  }
  function b(k) {
    return e.enter("lineEnding"), e.consume(k), e.exit("lineEnding"), v;
  }
  function v(k) {
    return o > 0 && ge(k) ? ve(e, x, "linePrefix", o + 1)(k) : x(k);
  }
  function x(k) {
    return k === null || X(k) ? e.check(Wu, p, E)(k) : (e.enter("codeFlowValue"), w(k));
  }
  function w(k) {
    return k === null || X(k) ? (e.exit("codeFlowValue"), x(k)) : (e.consume(k), w);
  }
  function E(k) {
    return e.exit("codeFenced"), t(k);
  }
  function T(k, A, D) {
    let F = 0;
    return P;
    function P(H) {
      return k.enter("lineEnding"), k.consume(H), k.exit("lineEnding"), N;
    }
    function N(H) {
      return k.enter("codeFencedFence"), ge(H) ? ve(k, R, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(H) : R(H);
    }
    function R(H) {
      return H === a ? (k.enter("codeFencedFenceSequence"), B(H)) : D(H);
    }
    function B(H) {
      return H === a ? (F++, k.consume(H), B) : F >= s ? (k.exit("codeFencedFenceSequence"), ge(H) ? ve(k, j, "whitespace")(H) : j(H)) : D(H);
    }
    function j(H) {
      return H === null || X(H) ? (k.exit("codeFencedFence"), A(H)) : D(H);
    }
  }
}
function _k(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s === null ? n(s) : (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
const us = {
  name: "codeIndented",
  tokenize: Vk
}, Fk = {
  partial: !0,
  tokenize: Bk
};
function Vk(e, t, n) {
  const r = this;
  return i;
  function i(c) {
    return e.enter("codeIndented"), ve(e, o, "linePrefix", 5)(c);
  }
  function o(c) {
    const u = r.events[r.events.length - 1];
    return u && u[1].type === "linePrefix" && u[2].sliceSerialize(u[1], !0).length >= 4 ? s(c) : n(c);
  }
  function s(c) {
    return c === null ? l(c) : X(c) ? e.attempt(Fk, s, l)(c) : (e.enter("codeFlowValue"), a(c));
  }
  function a(c) {
    return c === null || X(c) ? (e.exit("codeFlowValue"), s(c)) : (e.consume(c), a);
  }
  function l(c) {
    return e.exit("codeIndented"), t(c);
  }
}
function Bk(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return r.parser.lazy[r.now().line] ? n(s) : X(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), i) : ve(e, o, "linePrefix", 5)(s);
  }
  function o(s) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : X(s) ? i(s) : n(s);
  }
}
const zk = {
  name: "codeText",
  previous: jk,
  resolve: $k,
  tokenize: Uk
};
function $k(e) {
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
function jk(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function Uk(e, t, n) {
  let r = 0, i, o;
  return s;
  function s(d) {
    return e.enter("codeText"), e.enter("codeTextSequence"), a(d);
  }
  function a(d) {
    return d === 96 ? (e.consume(d), r++, a) : (e.exit("codeTextSequence"), l(d));
  }
  function l(d) {
    return d === null ? n(d) : d === 32 ? (e.enter("space"), e.consume(d), e.exit("space"), l) : d === 96 ? (o = e.enter("codeTextSequence"), i = 0, u(d)) : X(d) ? (e.enter("lineEnding"), e.consume(d), e.exit("lineEnding"), l) : (e.enter("codeTextData"), c(d));
  }
  function c(d) {
    return d === null || d === 32 || d === 96 || X(d) ? (e.exit("codeTextData"), l(d)) : (e.consume(d), c);
  }
  function u(d) {
    return d === 96 ? (e.consume(d), i++, u) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(d)) : (o.type = "codeTextData", c(d));
  }
}
class Hk {
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
    return r && Rr(this.left, r), o.reverse();
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
    this.setCursor(Number.POSITIVE_INFINITY), Rr(this.left, t);
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
    this.setCursor(0), Rr(this.right, t.reverse());
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
        Rr(this.right, n.reverse());
      } else {
        const n = this.right.splice(this.left.length + this.right.length - t, Number.POSITIVE_INFINITY);
        Rr(this.left, n.reverse());
      }
  }
}
function Rr(e, t) {
  let n = 0;
  if (t.length < 1e4)
    e.push(...t);
  else
    for (; n < t.length; )
      e.push(...t.slice(n, n + 1e4)), n += 1e4;
}
function Pp(e) {
  const t = {};
  let n = -1, r, i, o, s, a, l, c;
  const u = new Hk(e);
  for (; ++n < u.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = u.get(n), n && r[1].type === "chunkFlow" && u.get(n - 1)[1].type === "listItemPrefix" && (l = r[1]._tokenizer.events, o = 0, o < l.length && l[o][1].type === "lineEndingBlank" && (o += 2), o < l.length && l[o][1].type === "content"))
      for (; ++o < l.length && l[o][1].type !== "content"; )
        l[o][1].type === "chunkText" && (l[o][1]._isInFirstContentOfListItem = !0, o++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, Wk(u, n)), n = t[n], c = !0);
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
  return mt(e, 0, Number.POSITIVE_INFINITY, u.slice(0)), !c;
}
function Wk(e, t) {
  const n = e.get(t)[1], r = e.get(t)[2];
  let i = t - 1;
  const o = [];
  let s = n._tokenizer;
  s || (s = r.parser[n.contentType](n.start), n._contentTypeTextTrailing && (s._contentTypeTextTrailing = !0));
  const a = s.events, l = [], c = {};
  let u, d, h = -1, f = n, m = 0, p = 0;
  const b = [p];
  for (; f; ) {
    for (; e.get(++i)[1] !== f; )
      ;
    o.push(i), f._tokenizer || (u = r.sliceStream(f), f.next || u.push(null), d && s.defineSkip(f.start), f._isInFirstContentOfListItem && (s._gfmTasklistFirstContentOfListItem = !0), s.write(u), f._isInFirstContentOfListItem && (s._gfmTasklistFirstContentOfListItem = void 0)), d = f, f = f.next;
  }
  for (f = n; ++h < a.length; )
    // Find a void token that includes a break.
    a[h][0] === "exit" && a[h - 1][0] === "enter" && a[h][1].type === a[h - 1][1].type && a[h][1].start.line !== a[h][1].end.line && (p = h + 1, b.push(p), f._tokenizer = void 0, f.previous = void 0, f = f.next);
  for (s.events = [], f ? (f._tokenizer = void 0, f.previous = void 0) : b.pop(), h = b.length; h--; ) {
    const v = a.slice(b[h], b[h + 1]), x = o.pop();
    l.push([x, x + v.length - 1]), e.splice(x, 2, v);
  }
  for (l.reverse(), h = -1; ++h < l.length; )
    c[m + l[h][0]] = m + l[h][1], m += l[h][1] - l[h][0] - 1;
  return c;
}
const qk = {
  resolve: Gk,
  tokenize: Yk
}, Kk = {
  partial: !0,
  tokenize: Xk
};
function Gk(e) {
  return Pp(e), e;
}
function Yk(e, t) {
  let n;
  return r;
  function r(a) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(a);
  }
  function i(a) {
    return a === null ? o(a) : X(a) ? e.check(Kk, s, o)(a) : (e.consume(a), i);
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
function Xk(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), ve(e, o, "linePrefix");
  }
  function o(s) {
    if (s === null || X(s))
      return n(s);
    const a = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : e.interrupt(r.parser.constructs.flow, n, t)(s);
  }
}
function Ap(e, t, n, r, i, o, s, a, l) {
  const c = l || Number.POSITIVE_INFINITY;
  let u = 0;
  return d;
  function d(v) {
    return v === 60 ? (e.enter(r), e.enter(i), e.enter(o), e.consume(v), e.exit(o), h) : v === null || v === 32 || v === 41 || Gi(v) ? n(v) : (e.enter(r), e.enter(s), e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), p(v));
  }
  function h(v) {
    return v === 62 ? (e.enter(o), e.consume(v), e.exit(o), e.exit(i), e.exit(r), t) : (e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), f(v));
  }
  function f(v) {
    return v === 62 ? (e.exit("chunkString"), e.exit(a), h(v)) : v === null || v === 60 || X(v) ? n(v) : (e.consume(v), v === 92 ? m : f);
  }
  function m(v) {
    return v === 60 || v === 62 || v === 92 ? (e.consume(v), f) : f(v);
  }
  function p(v) {
    return !u && (v === null || v === 41 || Se(v)) ? (e.exit("chunkString"), e.exit(a), e.exit(s), e.exit(r), t(v)) : u < c && v === 40 ? (e.consume(v), u++, p) : v === 41 ? (e.consume(v), u--, p) : v === null || v === 32 || v === 40 || Gi(v) ? n(v) : (e.consume(v), v === 92 ? b : p);
  }
  function b(v) {
    return v === 40 || v === 41 || v === 92 ? (e.consume(v), p) : p(v);
  }
}
function Rp(e, t, n, r, i, o) {
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
    f === 94 && !a && "_hiddenFootnoteSupport" in s.parser.constructs ? n(f) : f === 93 ? (e.exit(o), e.enter(i), e.consume(f), e.exit(i), e.exit(r), t) : X(f) ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), u) : (e.enter("chunkString", {
      contentType: "string"
    }), d(f));
  }
  function d(f) {
    return f === null || f === 91 || f === 93 || X(f) || a++ > 999 ? (e.exit("chunkString"), u(f)) : (e.consume(f), l || (l = !ge(f)), f === 92 ? h : d);
  }
  function h(f) {
    return f === 91 || f === 92 || f === 93 ? (e.consume(f), a++, d) : d(f);
  }
}
function Np(e, t, n, r, i, o) {
  let s;
  return a;
  function a(h) {
    return h === 34 || h === 39 || h === 40 ? (e.enter(r), e.enter(i), e.consume(h), e.exit(i), s = h === 40 ? 41 : h, l) : n(h);
  }
  function l(h) {
    return h === s ? (e.enter(i), e.consume(h), e.exit(i), e.exit(r), t) : (e.enter(o), c(h));
  }
  function c(h) {
    return h === s ? (e.exit(o), l(s)) : h === null ? n(h) : X(h) ? (e.enter("lineEnding"), e.consume(h), e.exit("lineEnding"), ve(e, c, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), u(h));
  }
  function u(h) {
    return h === s || h === null || X(h) ? (e.exit("chunkString"), c(h)) : (e.consume(h), h === 92 ? d : u);
  }
  function d(h) {
    return h === s || h === 92 ? (e.consume(h), u) : u(h);
  }
}
function zr(e, t) {
  let n;
  return r;
  function r(i) {
    return X(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : ge(i) ? ve(e, r, n ? "linePrefix" : "lineSuffix")(i) : t(i);
  }
}
const Zk = {
  name: "definition",
  tokenize: Qk
}, Jk = {
  partial: !0,
  tokenize: eC
};
function Qk(e, t, n) {
  const r = this;
  let i;
  return o;
  function o(f) {
    return e.enter("definition"), s(f);
  }
  function s(f) {
    return Rp.call(
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
    return i = Nt(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), f === 58 ? (e.enter("definitionMarker"), e.consume(f), e.exit("definitionMarker"), l) : n(f);
  }
  function l(f) {
    return Se(f) ? zr(e, c)(f) : c(f);
  }
  function c(f) {
    return Ap(
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
    return e.attempt(Jk, d, d)(f);
  }
  function d(f) {
    return ge(f) ? ve(e, h, "whitespace")(f) : h(f);
  }
  function h(f) {
    return f === null || X(f) ? (e.exit("definition"), r.parser.defined.push(i), t(f)) : n(f);
  }
}
function eC(e, t, n) {
  return r;
  function r(a) {
    return Se(a) ? zr(e, i)(a) : n(a);
  }
  function i(a) {
    return Np(e, o, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(a);
  }
  function o(a) {
    return ge(a) ? ve(e, s, "whitespace")(a) : s(a);
  }
  function s(a) {
    return a === null || X(a) ? t(a) : n(a);
  }
}
const tC = {
  name: "hardBreakEscape",
  tokenize: nC
};
function nC(e, t, n) {
  return r;
  function r(o) {
    return e.enter("hardBreakEscape"), e.consume(o), i;
  }
  function i(o) {
    return X(o) ? (e.exit("hardBreakEscape"), t(o)) : n(o);
  }
}
const rC = {
  name: "headingAtx",
  resolve: iC,
  tokenize: oC
};
function iC(e, t) {
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
  }, mt(e, r, n - r + 1, [["enter", i, t], ["enter", o, t], ["exit", o, t], ["exit", i, t]])), e;
}
function oC(e, t, n) {
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
    return u === 35 ? (e.enter("atxHeadingSequence"), l(u)) : u === null || X(u) ? (e.exit("atxHeading"), t(u)) : ge(u) ? ve(e, a, "whitespace")(u) : (e.enter("atxHeadingText"), c(u));
  }
  function l(u) {
    return u === 35 ? (e.consume(u), l) : (e.exit("atxHeadingSequence"), a(u));
  }
  function c(u) {
    return u === null || u === 35 || Se(u) ? (e.exit("atxHeadingText"), a(u)) : (e.consume(u), c);
  }
}
const sC = [
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
], Ku = ["pre", "script", "style", "textarea"], aC = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: uC,
  tokenize: dC
}, lC = {
  partial: !0,
  tokenize: hC
}, cC = {
  partial: !0,
  tokenize: fC
};
function uC(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function dC(e, t, n) {
  const r = this;
  let i, o, s, a, l;
  return c;
  function c(C) {
    return u(C);
  }
  function u(C) {
    return e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(C), d;
  }
  function d(C) {
    return C === 33 ? (e.consume(C), h) : C === 47 ? (e.consume(C), o = !0, p) : C === 63 ? (e.consume(C), i = 3, r.interrupt ? t : S) : nt(C) ? (e.consume(C), s = String.fromCharCode(C), b) : n(C);
  }
  function h(C) {
    return C === 45 ? (e.consume(C), i = 2, f) : C === 91 ? (e.consume(C), i = 5, a = 0, m) : nt(C) ? (e.consume(C), i = 4, r.interrupt ? t : S) : n(C);
  }
  function f(C) {
    return C === 45 ? (e.consume(C), r.interrupt ? t : S) : n(C);
  }
  function m(C) {
    const q = "CDATA[";
    return C === q.charCodeAt(a++) ? (e.consume(C), a === q.length ? r.interrupt ? t : R : m) : n(C);
  }
  function p(C) {
    return nt(C) ? (e.consume(C), s = String.fromCharCode(C), b) : n(C);
  }
  function b(C) {
    if (C === null || C === 47 || C === 62 || Se(C)) {
      const q = C === 47, Z = s.toLowerCase();
      return !q && !o && Ku.includes(Z) ? (i = 1, r.interrupt ? t(C) : R(C)) : sC.includes(s.toLowerCase()) ? (i = 6, q ? (e.consume(C), v) : r.interrupt ? t(C) : R(C)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(C) : o ? x(C) : w(C));
    }
    return C === 45 || Je(C) ? (e.consume(C), s += String.fromCharCode(C), b) : n(C);
  }
  function v(C) {
    return C === 62 ? (e.consume(C), r.interrupt ? t : R) : n(C);
  }
  function x(C) {
    return ge(C) ? (e.consume(C), x) : P(C);
  }
  function w(C) {
    return C === 47 ? (e.consume(C), P) : C === 58 || C === 95 || nt(C) ? (e.consume(C), E) : ge(C) ? (e.consume(C), w) : P(C);
  }
  function E(C) {
    return C === 45 || C === 46 || C === 58 || C === 95 || Je(C) ? (e.consume(C), E) : T(C);
  }
  function T(C) {
    return C === 61 ? (e.consume(C), k) : ge(C) ? (e.consume(C), T) : w(C);
  }
  function k(C) {
    return C === null || C === 60 || C === 61 || C === 62 || C === 96 ? n(C) : C === 34 || C === 39 ? (e.consume(C), l = C, A) : ge(C) ? (e.consume(C), k) : D(C);
  }
  function A(C) {
    return C === l ? (e.consume(C), l = null, F) : C === null || X(C) ? n(C) : (e.consume(C), A);
  }
  function D(C) {
    return C === null || C === 34 || C === 39 || C === 47 || C === 60 || C === 61 || C === 62 || C === 96 || Se(C) ? T(C) : (e.consume(C), D);
  }
  function F(C) {
    return C === 47 || C === 62 || ge(C) ? w(C) : n(C);
  }
  function P(C) {
    return C === 62 ? (e.consume(C), N) : n(C);
  }
  function N(C) {
    return C === null || X(C) ? R(C) : ge(C) ? (e.consume(C), N) : n(C);
  }
  function R(C) {
    return C === 45 && i === 2 ? (e.consume(C), V) : C === 60 && i === 1 ? (e.consume(C), I) : C === 62 && i === 4 ? (e.consume(C), ee) : C === 63 && i === 3 ? (e.consume(C), S) : C === 93 && i === 5 ? (e.consume(C), L) : X(C) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(lC, Y, B)(C)) : C === null || X(C) ? (e.exit("htmlFlowData"), B(C)) : (e.consume(C), R);
  }
  function B(C) {
    return e.check(cC, j, Y)(C);
  }
  function j(C) {
    return e.enter("lineEnding"), e.consume(C), e.exit("lineEnding"), H;
  }
  function H(C) {
    return C === null || X(C) ? B(C) : (e.enter("htmlFlowData"), R(C));
  }
  function V(C) {
    return C === 45 ? (e.consume(C), S) : R(C);
  }
  function I(C) {
    return C === 47 ? (e.consume(C), s = "", _) : R(C);
  }
  function _(C) {
    if (C === 62) {
      const q = s.toLowerCase();
      return Ku.includes(q) ? (e.consume(C), ee) : R(C);
    }
    return nt(C) && s.length < 8 ? (e.consume(C), s += String.fromCharCode(C), _) : R(C);
  }
  function L(C) {
    return C === 93 ? (e.consume(C), S) : R(C);
  }
  function S(C) {
    return C === 62 ? (e.consume(C), ee) : C === 45 && i === 2 ? (e.consume(C), S) : R(C);
  }
  function ee(C) {
    return C === null || X(C) ? (e.exit("htmlFlowData"), Y(C)) : (e.consume(C), ee);
  }
  function Y(C) {
    return e.exit("htmlFlow"), t(C);
  }
}
function fC(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return X(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o) : n(s);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
function hC(e, t, n) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(oi, t, n);
  }
}
const pC = {
  name: "htmlText",
  tokenize: mC
};
function mC(e, t, n) {
  const r = this;
  let i, o, s;
  return a;
  function a(S) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(S), l;
  }
  function l(S) {
    return S === 33 ? (e.consume(S), c) : S === 47 ? (e.consume(S), T) : S === 63 ? (e.consume(S), w) : nt(S) ? (e.consume(S), D) : n(S);
  }
  function c(S) {
    return S === 45 ? (e.consume(S), u) : S === 91 ? (e.consume(S), o = 0, m) : nt(S) ? (e.consume(S), x) : n(S);
  }
  function u(S) {
    return S === 45 ? (e.consume(S), f) : n(S);
  }
  function d(S) {
    return S === null ? n(S) : S === 45 ? (e.consume(S), h) : X(S) ? (s = d, I(S)) : (e.consume(S), d);
  }
  function h(S) {
    return S === 45 ? (e.consume(S), f) : d(S);
  }
  function f(S) {
    return S === 62 ? V(S) : S === 45 ? h(S) : d(S);
  }
  function m(S) {
    const ee = "CDATA[";
    return S === ee.charCodeAt(o++) ? (e.consume(S), o === ee.length ? p : m) : n(S);
  }
  function p(S) {
    return S === null ? n(S) : S === 93 ? (e.consume(S), b) : X(S) ? (s = p, I(S)) : (e.consume(S), p);
  }
  function b(S) {
    return S === 93 ? (e.consume(S), v) : p(S);
  }
  function v(S) {
    return S === 62 ? V(S) : S === 93 ? (e.consume(S), v) : p(S);
  }
  function x(S) {
    return S === null || S === 62 ? V(S) : X(S) ? (s = x, I(S)) : (e.consume(S), x);
  }
  function w(S) {
    return S === null ? n(S) : S === 63 ? (e.consume(S), E) : X(S) ? (s = w, I(S)) : (e.consume(S), w);
  }
  function E(S) {
    return S === 62 ? V(S) : w(S);
  }
  function T(S) {
    return nt(S) ? (e.consume(S), k) : n(S);
  }
  function k(S) {
    return S === 45 || Je(S) ? (e.consume(S), k) : A(S);
  }
  function A(S) {
    return X(S) ? (s = A, I(S)) : ge(S) ? (e.consume(S), A) : V(S);
  }
  function D(S) {
    return S === 45 || Je(S) ? (e.consume(S), D) : S === 47 || S === 62 || Se(S) ? F(S) : n(S);
  }
  function F(S) {
    return S === 47 ? (e.consume(S), V) : S === 58 || S === 95 || nt(S) ? (e.consume(S), P) : X(S) ? (s = F, I(S)) : ge(S) ? (e.consume(S), F) : V(S);
  }
  function P(S) {
    return S === 45 || S === 46 || S === 58 || S === 95 || Je(S) ? (e.consume(S), P) : N(S);
  }
  function N(S) {
    return S === 61 ? (e.consume(S), R) : X(S) ? (s = N, I(S)) : ge(S) ? (e.consume(S), N) : F(S);
  }
  function R(S) {
    return S === null || S === 60 || S === 61 || S === 62 || S === 96 ? n(S) : S === 34 || S === 39 ? (e.consume(S), i = S, B) : X(S) ? (s = R, I(S)) : ge(S) ? (e.consume(S), R) : (e.consume(S), j);
  }
  function B(S) {
    return S === i ? (e.consume(S), i = void 0, H) : S === null ? n(S) : X(S) ? (s = B, I(S)) : (e.consume(S), B);
  }
  function j(S) {
    return S === null || S === 34 || S === 39 || S === 60 || S === 61 || S === 96 ? n(S) : S === 47 || S === 62 || Se(S) ? F(S) : (e.consume(S), j);
  }
  function H(S) {
    return S === 47 || S === 62 || Se(S) ? F(S) : n(S);
  }
  function V(S) {
    return S === 62 ? (e.consume(S), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(S);
  }
  function I(S) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(S), e.exit("lineEnding"), _;
  }
  function _(S) {
    return ge(S) ? ve(e, L, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(S) : L(S);
  }
  function L(S) {
    return e.enter("htmlTextData"), s(S);
  }
}
const kl = {
  name: "labelEnd",
  resolveAll: bC,
  resolveTo: xC,
  tokenize: wC
}, gC = {
  tokenize: SC
}, yC = {
  tokenize: kC
}, vC = {
  tokenize: CC
};
function bC(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.length; ) {
    const r = e[t][1];
    if (n.push(e[t]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd") {
      const i = r.type === "labelImage" ? 4 : 2;
      r.type = "data", t += i;
    }
  }
  return e.length !== n.length && mt(e, 0, e.length, n), e;
}
function xC(e, t) {
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
  return a = [["enter", l, t], ["enter", c, t]], a = St(a, e.slice(o + 1, o + r + 3)), a = St(a, [["enter", u, t]]), a = St(a, Eo(t.parser.constructs.insideSpan.null, e.slice(o + r + 4, s - 3), t)), a = St(a, [["exit", u, t], e[s - 2], e[s - 1], ["exit", c, t]]), a = St(a, e.slice(s + 1)), a = St(a, [["exit", l, t]]), mt(e, o, e.length, a), e;
}
function wC(e, t, n) {
  const r = this;
  let i = r.events.length, o, s;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      o = r.events[i][1];
      break;
    }
  return a;
  function a(h) {
    return o ? o._inactive ? d(h) : (s = r.parser.defined.includes(Nt(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(h), e.exit("labelMarker"), e.exit("labelEnd"), l) : n(h);
  }
  function l(h) {
    return h === 40 ? e.attempt(gC, u, s ? u : d)(h) : h === 91 ? e.attempt(yC, u, s ? c : d)(h) : s ? u(h) : d(h);
  }
  function c(h) {
    return e.attempt(vC, u, d)(h);
  }
  function u(h) {
    return t(h);
  }
  function d(h) {
    return o._balanced = !0, n(h);
  }
}
function SC(e, t, n) {
  return r;
  function r(d) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), i;
  }
  function i(d) {
    return Se(d) ? zr(e, o)(d) : o(d);
  }
  function o(d) {
    return d === 41 ? u(d) : Ap(e, s, a, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(d);
  }
  function s(d) {
    return Se(d) ? zr(e, l)(d) : u(d);
  }
  function a(d) {
    return n(d);
  }
  function l(d) {
    return d === 34 || d === 39 || d === 40 ? Np(e, c, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(d) : u(d);
  }
  function c(d) {
    return Se(d) ? zr(e, u)(d) : u(d);
  }
  function u(d) {
    return d === 41 ? (e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), e.exit("resource"), t) : n(d);
  }
}
function kC(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return Rp.call(r, e, o, s, "reference", "referenceMarker", "referenceString")(a);
  }
  function o(a) {
    return r.parser.defined.includes(Nt(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? t(a) : n(a);
  }
  function s(a) {
    return n(a);
  }
}
function CC(e, t, n) {
  return r;
  function r(o) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), i;
  }
  function i(o) {
    return o === 93 ? (e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), e.exit("reference"), t) : n(o);
  }
}
const TC = {
  name: "labelStartImage",
  resolveAll: kl.resolveAll,
  tokenize: EC
};
function EC(e, t, n) {
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
const PC = {
  name: "labelStartLink",
  resolveAll: kl.resolveAll,
  tokenize: AC
};
function AC(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(s), e.exit("labelMarker"), e.exit("labelLink"), o;
  }
  function o(s) {
    return s === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(s) : t(s);
  }
}
const ds = {
  name: "lineEnding",
  tokenize: RC
};
function RC(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), ve(e, t, "linePrefix");
  }
}
const Ii = {
  name: "thematicBreak",
  tokenize: NC
};
function NC(e, t, n) {
  let r = 0, i;
  return o;
  function o(c) {
    return e.enter("thematicBreak"), s(c);
  }
  function s(c) {
    return i = c, a(c);
  }
  function a(c) {
    return c === i ? (e.enter("thematicBreakSequence"), l(c)) : r >= 3 && (c === null || X(c)) ? (e.exit("thematicBreak"), t(c)) : n(c);
  }
  function l(c) {
    return c === i ? (e.consume(c), r++, l) : (e.exit("thematicBreakSequence"), ge(c) ? ve(e, a, "whitespace")(c) : a(c));
  }
}
const st = {
  continuation: {
    tokenize: OC
  },
  exit: _C,
  name: "list",
  tokenize: MC
}, IC = {
  partial: !0,
  tokenize: FC
}, DC = {
  partial: !0,
  tokenize: LC
};
function MC(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let o = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, s = 0;
  return a;
  function a(f) {
    const m = r.containerState.type || (f === 42 || f === 43 || f === 45 ? "listUnordered" : "listOrdered");
    if (m === "listUnordered" ? !r.containerState.marker || f === r.containerState.marker : ea(f)) {
      if (r.containerState.type || (r.containerState.type = m, e.enter(m, {
        _container: !0
      })), m === "listUnordered")
        return e.enter("listItemPrefix"), f === 42 || f === 45 ? e.check(Ii, n, c)(f) : c(f);
      if (!r.interrupt || f === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), l(f);
    }
    return n(f);
  }
  function l(f) {
    return ea(f) && ++s < 10 ? (e.consume(f), l) : (!r.interrupt || s < 2) && (r.containerState.marker ? f === r.containerState.marker : f === 41 || f === 46) ? (e.exit("listItemValue"), c(f)) : n(f);
  }
  function c(f) {
    return e.enter("listItemMarker"), e.consume(f), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || f, e.check(
      oi,
      // Can’t be empty when interrupting.
      r.interrupt ? n : u,
      e.attempt(IC, h, d)
    );
  }
  function u(f) {
    return r.containerState.initialBlankLine = !0, o++, h(f);
  }
  function d(f) {
    return ge(f) ? (e.enter("listItemPrefixWhitespace"), e.consume(f), e.exit("listItemPrefixWhitespace"), h) : n(f);
  }
  function h(f) {
    return r.containerState.size = o + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(f);
  }
}
function OC(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(oi, i, o);
  function i(a) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, ve(e, t, "listItemIndent", r.containerState.size + 1)(a);
  }
  function o(a) {
    return r.containerState.furtherBlankLines || !ge(a) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, s(a)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(DC, t, s)(a));
  }
  function s(a) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, ve(e, e.attempt(st, t, n), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a);
  }
}
function LC(e, t, n) {
  const r = this;
  return ve(e, i, "listItemIndent", r.containerState.size + 1);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "listItemIndent" && s[2].sliceSerialize(s[1], !0).length === r.containerState.size ? t(o) : n(o);
  }
}
function _C(e) {
  e.exit(this.containerState.type);
}
function FC(e, t, n) {
  const r = this;
  return ve(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return !ge(o) && s && s[1].type === "listItemPrefixWhitespace" ? t(o) : n(o);
  }
}
const Gu = {
  name: "setextUnderline",
  resolveTo: VC,
  tokenize: BC
};
function VC(e, t) {
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
function BC(e, t, n) {
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
    return c === i ? (e.consume(c), a) : (e.exit("setextHeadingLineSequence"), ge(c) ? ve(e, l, "lineSuffix")(c) : l(c));
  }
  function l(c) {
    return c === null || X(c) ? (e.exit("setextHeadingLine"), t(c)) : n(c);
  }
}
const zC = {
  tokenize: $C
};
function $C(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    oi,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, ve(e, e.attempt(this.parser.constructs.flow, i, e.attempt(qk, i)), "linePrefix"))
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
const jC = {
  resolveAll: Dp()
}, UC = Ip("string"), HC = Ip("text");
function Ip(e) {
  return {
    resolveAll: Dp(e === "text" ? WC : void 0),
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
function Dp(e) {
  return t;
  function t(n, r) {
    let i = -1, o;
    for (; ++i <= n.length; )
      o === void 0 ? n[i] && n[i][1].type === "data" && (o = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== o + 2 && (n[o][1].end = n[i - 1][1].end, n.splice(o + 2, i - o - 2), i = o + 2), o = void 0);
    return e ? e(n, r) : n;
  }
}
function WC(e, t) {
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
const qC = {
  42: st,
  43: st,
  45: st,
  48: st,
  49: st,
  50: st,
  51: st,
  52: st,
  53: st,
  54: st,
  55: st,
  56: st,
  57: st,
  62: Cp
}, KC = {
  91: Zk
}, GC = {
  [-2]: us,
  [-1]: us,
  32: us
}, YC = {
  35: rC,
  42: Ii,
  45: [Gu, Ii],
  60: aC,
  61: Gu,
  95: Ii,
  96: qu,
  126: qu
}, XC = {
  38: Ep,
  92: Tp
}, ZC = {
  [-5]: ds,
  [-4]: ds,
  [-3]: ds,
  33: TC,
  38: Ep,
  42: ta,
  60: [Pk, pC],
  91: PC,
  92: [tC, Tp],
  93: kl,
  95: ta,
  96: zk
}, JC = {
  null: [ta, jC]
}, QC = {
  null: [42, 95]
}, eT = {
  null: []
}, tT = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: QC,
  contentInitial: KC,
  disable: eT,
  document: qC,
  flow: YC,
  flowInitial: GC,
  insideSpan: JC,
  string: XC,
  text: ZC
}, Symbol.toStringTag, { value: "Module" }));
function nT(e, t, n) {
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
    attempt: A(T),
    check: A(k),
    consume: x,
    enter: w,
    exit: E,
    interrupt: A(k, {
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
  function d(N) {
    return s = St(s, N), b(), s[s.length - 1] !== null ? [] : (D(t, 0), c.events = Eo(o, c.events, c), c.events);
  }
  function h(N, R) {
    return iT(f(N), R);
  }
  function f(N) {
    return rT(s, N);
  }
  function m() {
    const {
      _bufferIndex: N,
      _index: R,
      line: B,
      column: j,
      offset: H
    } = r;
    return {
      _bufferIndex: N,
      _index: R,
      line: B,
      column: j,
      offset: H
    };
  }
  function p(N) {
    i[N.line] = N.column, P();
  }
  function b() {
    let N;
    for (; r._index < s.length; ) {
      const R = s[r._index];
      if (typeof R == "string")
        for (N = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === N && r._bufferIndex < R.length; )
          v(R.charCodeAt(r._bufferIndex));
      else
        v(R);
    }
  }
  function v(N) {
    u = u(N);
  }
  function x(N) {
    X(N) ? (r.line++, r.column = 1, r.offset += N === -3 ? 2 : 1, P()) : N !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    s[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = N;
  }
  function w(N, R) {
    const B = R || {};
    return B.type = N, B.start = m(), c.events.push(["enter", B, c]), a.push(B), B;
  }
  function E(N) {
    const R = a.pop();
    return R.end = m(), c.events.push(["exit", R, c]), R;
  }
  function T(N, R) {
    D(N, R.from);
  }
  function k(N, R) {
    R.restore();
  }
  function A(N, R) {
    return B;
    function B(j, H, V) {
      let I, _, L, S;
      return Array.isArray(j) ? (
        /* c8 ignore next 1 */
        Y(j)
      ) : "tokenize" in j ? (
        // Looks like a construct.
        Y([
          /** @type {Construct} */
          j
        ])
      ) : ee(j);
      function ee(ie) {
        return W;
        function W(ne) {
          const pe = ne !== null && ie[ne], se = ne !== null && ie.null, ce = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(pe) ? pe : pe ? [pe] : [],
            ...Array.isArray(se) ? se : se ? [se] : []
          ];
          return Y(ce)(ne);
        }
      }
      function Y(ie) {
        return I = ie, _ = 0, ie.length === 0 ? V : C(ie[_]);
      }
      function C(ie) {
        return W;
        function W(ne) {
          return S = F(), L = ie, ie.partial || (c.currentConstruct = ie), ie.name && c.parser.constructs.disable.null.includes(ie.name) ? Z() : ie.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            R ? Object.assign(Object.create(c), R) : c,
            l,
            q,
            Z
          )(ne);
        }
      }
      function q(ie) {
        return N(L, S), H;
      }
      function Z(ie) {
        return S.restore(), ++_ < I.length ? C(I[_]) : V;
      }
    }
  }
  function D(N, R) {
    N.resolveAll && !o.includes(N) && o.push(N), N.resolve && mt(c.events, R, c.events.length - R, N.resolve(c.events.slice(R), c)), N.resolveTo && (c.events = N.resolveTo(c.events, c));
  }
  function F() {
    const N = m(), R = c.previous, B = c.currentConstruct, j = c.events.length, H = Array.from(a);
    return {
      from: j,
      restore: V
    };
    function V() {
      r = N, c.previous = R, c.currentConstruct = B, c.events.length = j, a = H, P();
    }
  }
  function P() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function rT(e, t) {
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
function iT(e, t) {
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
function oT(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      Sp([tT, ...(e || {}).extensions || []])
    ),
    content: i(xk),
    defined: [],
    document: i(Sk),
    flow: i(zC),
    lazy: {},
    string: i(UC),
    text: i(HC)
  };
  return r;
  function i(o) {
    return s;
    function s(a) {
      return nT(r, o, a);
    }
  }
}
function sT(e) {
  for (; !Pp(e); )
    ;
  return e;
}
const Yu = /[\0\t\n\r]/g;
function aT() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(o, s, a) {
    const l = [];
    let c, u, d, h, f;
    for (o = t + (typeof o == "string" ? o.toString() : new TextDecoder(s || void 0).decode(o)), d = 0, t = "", n && (o.charCodeAt(0) === 65279 && d++, n = void 0); d < o.length; ) {
      if (Yu.lastIndex = d, c = Yu.exec(o), h = c && c.index !== void 0 ? c.index : o.length, f = o.charCodeAt(h), !c) {
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
const lT = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function cT(e) {
  return e.replace(lT, uT);
}
function uT(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), o = i === 120 || i === 88;
    return kp(n.slice(o ? 2 : 1), o ? 16 : 10);
  }
  return Sl(n) || e;
}
const Mp = {}.hasOwnProperty;
function dT(e, t, n) {
  return typeof t != "string" && (n = t, t = void 0), fT(n)(sT(oT(n).document().write(aT()(e, t, !0))));
}
function fT(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: o(dt),
      autolinkProtocol: F,
      autolinkEmail: F,
      atxHeading: o(ut),
      blockQuote: o(se),
      characterEscape: F,
      characterReference: F,
      codeFenced: o(ce),
      codeFencedFenceInfo: s,
      codeFencedFenceMeta: s,
      codeIndented: o(ce, s),
      codeText: o(me, s),
      codeTextData: F,
      data: F,
      codeFlowValue: F,
      definition: o(Me),
      definitionDestinationString: s,
      definitionLabelString: s,
      definitionTitleString: s,
      emphasis: o(We),
      hardBreakEscape: o(rt),
      hardBreakTrailing: o(rt),
      htmlFlow: o(vt, s),
      htmlFlowData: F,
      htmlText: o(vt, s),
      htmlTextData: F,
      image: o(Wt),
      label: s,
      link: o(dt),
      listItem: o(qt),
      listItemValue: h,
      listOrdered: o(Cn, d),
      listUnordered: o(Cn),
      paragraph: o(Un),
      reference: C,
      referenceString: s,
      resourceDestinationString: s,
      resourceTitleString: s,
      setextHeading: o(ut),
      strong: o(kt),
      thematicBreak: o(Tn)
    },
    exit: {
      atxHeading: l(),
      atxHeadingSequence: T,
      autolink: l(),
      autolinkEmail: pe,
      autolinkProtocol: ne,
      blockQuote: l(),
      characterEscapeValue: P,
      characterReferenceMarkerHexadecimal: Z,
      characterReferenceMarkerNumeric: Z,
      characterReferenceValue: ie,
      characterReference: W,
      codeFenced: l(b),
      codeFencedFence: p,
      codeFencedFenceInfo: f,
      codeFencedFenceMeta: m,
      codeFlowValue: P,
      codeIndented: l(v),
      codeText: l(H),
      codeTextData: P,
      data: P,
      definition: l(),
      definitionDestinationString: E,
      definitionLabelString: x,
      definitionTitleString: w,
      emphasis: l(),
      hardBreakEscape: l(R),
      hardBreakTrailing: l(R),
      htmlFlow: l(B),
      htmlFlowData: P,
      htmlText: l(j),
      htmlTextData: P,
      image: l(I),
      label: L,
      labelText: _,
      lineEnding: N,
      link: l(V),
      listItem: l(),
      listOrdered: l(),
      listUnordered: l(),
      paragraph: l(),
      referenceString: q,
      resourceDestinationString: S,
      resourceTitleString: ee,
      resource: Y,
      setextHeading: l(D),
      setextHeadingLineSequence: A,
      setextHeadingText: k,
      strong: l(),
      thematicBreak: l()
    }
  };
  Op(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(M) {
    let U = {
      type: "root",
      children: []
    };
    const te = {
      stack: [U],
      tokenStack: [],
      config: t,
      enter: a,
      exit: c,
      buffer: s,
      resume: u,
      data: n
    }, fe = [];
    let ye = -1;
    for (; ++ye < M.length; )
      if (M[ye][1].type === "listOrdered" || M[ye][1].type === "listUnordered")
        if (M[ye][0] === "enter")
          fe.push(ye);
        else {
          const et = fe.pop();
          ye = i(M, et, ye);
        }
    for (ye = -1; ++ye < M.length; ) {
      const et = t[M[ye][0]];
      Mp.call(et, M[ye][1].type) && et[M[ye][1].type].call(Object.assign({
        sliceSerialize: M[ye][2].sliceSerialize
      }, te), M[ye][1]);
    }
    if (te.tokenStack.length > 0) {
      const et = te.tokenStack[te.tokenStack.length - 1];
      (et[1] || Xu).call(te, void 0, et[0]);
    }
    for (U.position = {
      start: ln(M.length > 0 ? M[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: ln(M.length > 0 ? M[M.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, ye = -1; ++ye < t.transforms.length; )
      U = t.transforms[ye](U) || U;
    return U;
  }
  function i(M, U, te) {
    let fe = U - 1, ye = -1, et = !1, bt, qe, tt, Ct;
    for (; ++fe <= te; ) {
      const Re = M[fe];
      switch (Re[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          Re[0] === "enter" ? ye++ : ye--, Ct = void 0;
          break;
        }
        case "lineEndingBlank": {
          Re[0] === "enter" && (bt && !Ct && !ye && !tt && (tt = fe), Ct = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          Ct = void 0;
      }
      if (!ye && Re[0] === "enter" && Re[1].type === "listItemPrefix" || ye === -1 && Re[0] === "exit" && (Re[1].type === "listUnordered" || Re[1].type === "listOrdered")) {
        if (bt) {
          let Tt = fe;
          for (qe = void 0; Tt--; ) {
            const K = M[Tt];
            if (K[1].type === "lineEnding" || K[1].type === "lineEndingBlank") {
              if (K[0] === "exit") continue;
              qe && (M[qe][1].type = "lineEndingBlank", et = !0), K[1].type = "lineEnding", qe = Tt;
            } else if (!(K[1].type === "linePrefix" || K[1].type === "blockQuotePrefix" || K[1].type === "blockQuotePrefixWhitespace" || K[1].type === "blockQuoteMarker" || K[1].type === "listItemIndent")) break;
          }
          tt && (!qe || tt < qe) && (bt._spread = !0), bt.end = Object.assign({}, qe ? M[qe][1].start : Re[1].end), M.splice(qe || fe, 0, ["exit", bt, Re[2]]), fe++, te++;
        }
        if (Re[1].type === "listItemPrefix") {
          const Tt = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, Re[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          bt = Tt, M.splice(fe, 0, ["enter", Tt, Re[2]]), fe++, te++, tt = void 0, Ct = !0;
        }
      }
    }
    return M[U][1]._spread = et, te;
  }
  function o(M, U) {
    return te;
    function te(fe) {
      a.call(this, M(fe), fe), U && U.call(this, fe);
    }
  }
  function s() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function a(M, U, te) {
    this.stack[this.stack.length - 1].children.push(M), this.stack.push(M), this.tokenStack.push([U, te || void 0]), M.position = {
      start: ln(U.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function l(M) {
    return U;
    function U(te) {
      M && M.call(this, te), c.call(this, te);
    }
  }
  function c(M, U) {
    const te = this.stack.pop(), fe = this.tokenStack.pop();
    if (fe)
      fe[0].type !== M.type && (U ? U.call(this, M, fe[0]) : (fe[1] || Xu).call(this, M, fe[0]));
    else throw new Error("Cannot close `" + M.type + "` (" + Br({
      start: M.start,
      end: M.end
    }) + "): it’s not open");
    te.position.end = ln(M.end);
  }
  function u() {
    return wl(this.stack.pop());
  }
  function d() {
    this.data.expectingFirstListItemValue = !0;
  }
  function h(M) {
    if (this.data.expectingFirstListItemValue) {
      const U = this.stack[this.stack.length - 2];
      U.start = Number.parseInt(this.sliceSerialize(M), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function f() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.lang = M;
  }
  function m() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.meta = M;
  }
  function p() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function b() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = M.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function v() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = M.replace(/(\r?\n|\r)$/g, "");
  }
  function x(M) {
    const U = this.resume(), te = this.stack[this.stack.length - 1];
    te.label = U, te.identifier = Nt(this.sliceSerialize(M)).toLowerCase();
  }
  function w() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.title = M;
  }
  function E() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.url = M;
  }
  function T(M) {
    const U = this.stack[this.stack.length - 1];
    if (!U.depth) {
      const te = this.sliceSerialize(M).length;
      U.depth = te;
    }
  }
  function k() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function A(M) {
    const U = this.stack[this.stack.length - 1];
    U.depth = this.sliceSerialize(M).codePointAt(0) === 61 ? 1 : 2;
  }
  function D() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function F(M) {
    const te = this.stack[this.stack.length - 1].children;
    let fe = te[te.length - 1];
    (!fe || fe.type !== "text") && (fe = Tr(), fe.position = {
      start: ln(M.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, te.push(fe)), this.stack.push(fe);
  }
  function P(M) {
    const U = this.stack.pop();
    U.value += this.sliceSerialize(M), U.position.end = ln(M.end);
  }
  function N(M) {
    const U = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const te = U.children[U.children.length - 1];
      te.position.end = ln(M.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && t.canContainEols.includes(U.type) && (F.call(this, M), P.call(this, M));
  }
  function R() {
    this.data.atHardBreak = !0;
  }
  function B() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = M;
  }
  function j() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = M;
  }
  function H() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = M;
  }
  function V() {
    const M = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const U = this.data.referenceType || "shortcut";
      M.type += "Reference", M.referenceType = U, delete M.url, delete M.title;
    } else
      delete M.identifier, delete M.label;
    this.data.referenceType = void 0;
  }
  function I() {
    const M = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const U = this.data.referenceType || "shortcut";
      M.type += "Reference", M.referenceType = U, delete M.url, delete M.title;
    } else
      delete M.identifier, delete M.label;
    this.data.referenceType = void 0;
  }
  function _(M) {
    const U = this.sliceSerialize(M), te = this.stack[this.stack.length - 2];
    te.label = cT(U), te.identifier = Nt(U).toLowerCase();
  }
  function L() {
    const M = this.stack[this.stack.length - 1], U = this.resume(), te = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, te.type === "link") {
      const fe = M.children;
      te.children = fe;
    } else
      te.alt = U;
  }
  function S() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.url = M;
  }
  function ee() {
    const M = this.resume(), U = this.stack[this.stack.length - 1];
    U.title = M;
  }
  function Y() {
    this.data.inReference = void 0;
  }
  function C() {
    this.data.referenceType = "collapsed";
  }
  function q(M) {
    const U = this.resume(), te = this.stack[this.stack.length - 1];
    te.label = U, te.identifier = Nt(this.sliceSerialize(M)).toLowerCase(), this.data.referenceType = "full";
  }
  function Z(M) {
    this.data.characterReferenceType = M.type;
  }
  function ie(M) {
    const U = this.sliceSerialize(M), te = this.data.characterReferenceType;
    let fe;
    te ? (fe = kp(U, te === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : fe = Sl(U);
    const ye = this.stack[this.stack.length - 1];
    ye.value += fe;
  }
  function W(M) {
    const U = this.stack.pop();
    U.position.end = ln(M.end);
  }
  function ne(M) {
    P.call(this, M);
    const U = this.stack[this.stack.length - 1];
    U.url = this.sliceSerialize(M);
  }
  function pe(M) {
    P.call(this, M);
    const U = this.stack[this.stack.length - 1];
    U.url = "mailto:" + this.sliceSerialize(M);
  }
  function se() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function ce() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function me() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function Me() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function We() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function ut() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function rt() {
    return {
      type: "break"
    };
  }
  function vt() {
    return {
      type: "html",
      value: ""
    };
  }
  function Wt() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function dt() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function Cn(M) {
    return {
      type: "list",
      ordered: M.type === "listOrdered",
      start: null,
      spread: M._spread,
      children: []
    };
  }
  function qt(M) {
    return {
      type: "listItem",
      spread: M._spread,
      checked: null,
      children: []
    };
  }
  function Un() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function kt() {
    return {
      type: "strong",
      children: []
    };
  }
  function Tr() {
    return {
      type: "text",
      value: ""
    };
  }
  function Tn() {
    return {
      type: "thematicBreak"
    };
  }
}
function ln(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function Op(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? Op(e, r) : hT(e, r);
  }
}
function hT(e, t) {
  let n;
  for (n in t)
    if (Mp.call(t, n))
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
function Xu(e, t) {
  throw e ? new Error("Cannot close `" + e.type + "` (" + Br({
    start: e.start,
    end: e.end
  }) + "): a different token (`" + t.type + "`, " + Br({
    start: t.start,
    end: t.end
  }) + ") is open") : new Error("Cannot close document, a token (`" + t.type + "`, " + Br({
    start: t.start,
    end: t.end
  }) + ") is still open");
}
function pT(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return dT(r, {
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
function mT(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function gT(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function yT(e, t) {
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
function vT(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function bT(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function xT(e, t) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", r = String(t.identifier).toUpperCase(), i = br(r.toLowerCase()), o = e.footnoteOrder.indexOf(r);
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
function wT(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function ST(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
}
function Lp(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return [{ type: "text", value: "![" + t.alt + r }];
  const i = e.all(t), o = i[0];
  o && o.type === "text" ? o.value = "[" + o.value : i.unshift({ type: "text", value: "[" });
  const s = i[i.length - 1];
  return s && s.type === "text" ? s.value += r : i.push({ type: "text", value: r }), i;
}
function kT(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Lp(e, t);
  const i = { src: br(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(t, o), e.applyData(t, o);
}
function CT(e, t) {
  const n = { src: br(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function TT(e, t) {
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
function ET(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Lp(e, t);
  const i = { href: br(r.url || "") };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = {
    type: "element",
    tagName: "a",
    properties: i,
    children: e.all(t)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function PT(e, t) {
  const n = { href: br(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: n,
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function AT(e, t, n) {
  const r = e.all(t), i = n ? RT(n) : _p(t), o = {}, s = [];
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
function RT(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = _p(n[r]);
  }
  return t;
}
function _p(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function NT(e, t) {
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
function IT(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function DT(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function MT(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function OT(e, t) {
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
    }, a = yl(t.children[1]), l = mp(t.children[t.children.length - 1]);
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
function LT(e, t, n) {
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
function _T(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const Zu = 9, Ju = 32;
function FT(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const o = [];
  for (; r; )
    o.push(
      Qu(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return o.push(Qu(t.slice(i), i > 0, !1)), o.join("");
}
function Qu(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let o = e.codePointAt(r);
    for (; o === Zu || o === Ju; )
      r++, o = e.codePointAt(r);
  }
  if (n) {
    let o = e.codePointAt(i - 1);
    for (; o === Zu || o === Ju; )
      i--, o = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function VT(e, t) {
  const n = { type: "text", value: FT(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function BT(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const zT = {
  blockquote: mT,
  break: gT,
  code: yT,
  delete: vT,
  emphasis: bT,
  footnoteReference: xT,
  heading: wT,
  html: ST,
  imageReference: kT,
  image: CT,
  inlineCode: TT,
  linkReference: ET,
  link: PT,
  listItem: AT,
  list: NT,
  paragraph: IT,
  // @ts-expect-error: root is different, but hard to type.
  root: DT,
  strong: MT,
  table: OT,
  tableCell: _T,
  tableRow: LT,
  text: VT,
  thematicBreak: BT,
  toml: yi,
  yaml: yi,
  definition: yi,
  footnoteDefinition: yi
};
function yi() {
}
const Fp = -1, Po = 0, $r = 1, Yi = 2, Cl = 3, Tl = 4, El = 5, Pl = 6, Vp = 7, Bp = 8, ed = typeof self == "object" ? self : globalThis, $T = (e, t) => {
  const n = (i, o) => (e.set(o, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [o, s] = t[i];
    switch (o) {
      case Po:
      case Fp:
        return n(s, i);
      case $r: {
        const a = n([], i);
        for (const l of s)
          a.push(r(l));
        return a;
      }
      case Yi: {
        const a = n({}, i);
        for (const [l, c] of s)
          a[r(l)] = r(c);
        return a;
      }
      case Cl:
        return n(new Date(s), i);
      case Tl: {
        const { source: a, flags: l } = s;
        return n(new RegExp(a, l), i);
      }
      case El: {
        const a = n(/* @__PURE__ */ new Map(), i);
        for (const [l, c] of s)
          a.set(r(l), r(c));
        return a;
      }
      case Pl: {
        const a = n(/* @__PURE__ */ new Set(), i);
        for (const l of s)
          a.add(r(l));
        return a;
      }
      case Vp: {
        const { name: a, message: l } = s;
        return n(new ed[a](l), i);
      }
      case Bp:
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
    return n(new ed[o](s), i);
  };
  return r;
}, td = (e) => $T(/* @__PURE__ */ new Map(), e)(0), Hn = "", { toString: jT } = {}, { keys: UT } = Object, Nr = (e) => {
  const t = typeof e;
  if (t !== "object" || !e)
    return [Po, t];
  const n = jT.call(e).slice(8, -1);
  switch (n) {
    case "Array":
      return [$r, Hn];
    case "Object":
      return [Yi, Hn];
    case "Date":
      return [Cl, Hn];
    case "RegExp":
      return [Tl, Hn];
    case "Map":
      return [El, Hn];
    case "Set":
      return [Pl, Hn];
    case "DataView":
      return [$r, n];
  }
  return n.includes("Array") ? [$r, n] : n.includes("Error") ? [Vp, n] : [Yi, n];
}, vi = ([e, t]) => e === Po && (t === "function" || t === "symbol"), HT = (e, t, n, r) => {
  const i = (s, a) => {
    const l = r.push(s) - 1;
    return n.set(a, l), l;
  }, o = (s) => {
    if (n.has(s))
      return n.get(s);
    let [a, l] = Nr(s);
    switch (a) {
      case Po: {
        let u = s;
        switch (l) {
          case "bigint":
            a = Bp, u = s.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + l);
            u = null;
            break;
          case "undefined":
            return i([Fp], s);
        }
        return i([a, u], s);
      }
      case $r: {
        if (l) {
          let h = s;
          return l === "DataView" ? h = new Uint8Array(s.buffer) : l === "ArrayBuffer" && (h = new Uint8Array(s)), i([l, [...h]], s);
        }
        const u = [], d = i([a, u], s);
        for (const h of s)
          u.push(o(h));
        return d;
      }
      case Yi: {
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
        for (const h of UT(s))
          (e || !vi(Nr(s[h]))) && u.push([o(h), o(s[h])]);
        return d;
      }
      case Cl:
        return i([a, s.toISOString()], s);
      case Tl: {
        const { source: u, flags: d } = s;
        return i([a, { source: u, flags: d }], s);
      }
      case El: {
        const u = [], d = i([a, u], s);
        for (const [h, f] of s)
          (e || !(vi(Nr(h)) || vi(Nr(f)))) && u.push([o(h), o(f)]);
        return d;
      }
      case Pl: {
        const u = [], d = i([a, u], s);
        for (const h of s)
          (e || !vi(Nr(h))) && u.push(o(h));
        return d;
      }
    }
    const { message: c } = s;
    return i([a, { name: l, message: c }], s);
  };
  return o;
}, nd = (e, { json: t, lossy: n } = {}) => {
  const r = [];
  return HT(!(t || n), !!t, /* @__PURE__ */ new Map(), r)(e), r;
}, Xi = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, t) => t && ("json" in t || "lossy" in t) ? td(nd(e, t)) : structuredClone(e)
) : (e, t) => td(nd(e, t));
function WT(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return t > 1 && n.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(t) }]
  }), n;
}
function qT(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function KT(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", n = e.options.footnoteBackContent || WT, r = e.options.footnoteBackLabel || qT, i = e.options.footnoteLabel || "Footnotes", o = e.options.footnoteLabelTagName || "h2", s = e.options.footnoteLabelProperties || {
    className: ["sr-only"]
  }, a = [];
  let l = -1;
  for (; ++l < e.footnoteOrder.length; ) {
    const c = e.footnoteById.get(
      e.footnoteOrder[l]
    );
    if (!c)
      continue;
    const u = e.all(c), d = String(c.identifier).toUpperCase(), h = br(d.toLowerCase());
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
    const b = u[u.length - 1];
    if (b && b.type === "element" && b.tagName === "p") {
      const x = b.children[b.children.length - 1];
      x && x.type === "text" ? x.value += " " : b.children.push({ type: "text", value: " " }), b.children.push(...m);
    } else
      u.push(...m);
    const v = {
      type: "element",
      tagName: "li",
      properties: { id: t + "fn-" + h },
      children: e.wrap(u, !0)
    };
    e.patch(c, v), a.push(v);
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
            ...Xi(s),
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
const Ao = (
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
  function(e) {
    if (e == null)
      return ZT;
    if (typeof e == "function")
      return Ro(e);
    if (typeof e == "object")
      return Array.isArray(e) ? GT(e) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        YT(
          /** @type {Props} */
          e
        )
      );
    if (typeof e == "string")
      return XT(e);
    throw new Error("Expected function, string, or object as test");
  }
);
function GT(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = Ao(e[n]);
  return Ro(r);
  function r(...i) {
    let o = -1;
    for (; ++o < t.length; )
      if (t[o].apply(this, i)) return !0;
    return !1;
  }
}
function YT(e) {
  const t = (
    /** @type {Record<string, unknown>} */
    e
  );
  return Ro(n);
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
function XT(e) {
  return Ro(t);
  function t(n) {
    return n && n.type === e;
  }
}
function Ro(e) {
  return t;
  function t(n, r, i) {
    return !!(JT(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function ZT() {
  return !0;
}
function JT(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const zp = [], QT = !0, na = !1, eE = "skip";
function $p(e, t, n, r) {
  let i;
  typeof t == "function" && typeof n != "function" ? (r = n, n = t) : i = t;
  const o = Ao(i), s = r ? -1 : 1;
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
      let f = zp, m, p, b;
      if ((!t || o(l, c, u[u.length - 1] || void 0)) && (f = tE(n(l, u)), f[0] === na))
        return f;
      if ("children" in l && l.children) {
        const v = (
          /** @type {UnistParent} */
          l
        );
        if (v.children && f[0] !== eE)
          for (p = (r ? v.children.length : -1) + s, b = u.concat(v); p > -1 && p < v.children.length; ) {
            const x = v.children[p];
            if (m = a(x, p, b)(), m[0] === na)
              return m;
            p = typeof m[1] == "number" ? m[1] : p + s;
          }
      }
      return f;
    }
  }
}
function tE(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [QT, e] : e == null ? zp : [e];
}
function Al(e, t, n, r) {
  let i, o, s;
  typeof t == "function" && typeof n != "function" ? (o = void 0, s = t, i = n) : (o = t, s = n, i = r), $p(e, o, a, i);
  function a(l, c) {
    const u = c[c.length - 1], d = u ? u.children.indexOf(l) : void 0;
    return s(l, d, u);
  }
}
const ra = {}.hasOwnProperty, nE = {};
function rE(e, t) {
  const n = t || nE, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = { ...zT, ...n.handlers }, a = {
    all: c,
    applyData: oE,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: o,
    footnoteOrder: [],
    handlers: s,
    one: l,
    options: n,
    patch: iE,
    wrap: aE
  };
  return Al(e, function(u) {
    if (u.type === "definition" || u.type === "footnoteDefinition") {
      const d = u.type === "definition" ? r : i, h = String(u.identifier).toUpperCase();
      d.has(h) || d.set(h, u);
    }
  }), a;
  function l(u, d) {
    const h = u.type, f = a.handlers[h];
    if (ra.call(a.handlers, h) && f)
      return f(a, u, d);
    if (a.options.passThrough && a.options.passThrough.includes(h)) {
      if ("children" in u) {
        const { children: p, ...b } = u, v = Xi(b);
        return v.children = a.all(u), v;
      }
      return Xi(u);
    }
    return (a.options.unknownHandler || sE)(a, u, d);
  }
  function c(u) {
    const d = [];
    if ("children" in u) {
      const h = u.children;
      let f = -1;
      for (; ++f < h.length; ) {
        const m = a.one(h[f], u);
        if (m) {
          if (f && h[f - 1].type === "break" && (!Array.isArray(m) && m.type === "text" && (m.value = rd(m.value)), !Array.isArray(m) && m.type === "element")) {
            const p = m.children[0];
            p && p.type === "text" && (p.value = rd(p.value));
          }
          Array.isArray(m) ? d.push(...m) : d.push(m);
        }
      }
    }
    return d;
  }
}
function iE(e, t) {
  e.position && (t.position = qS(e));
}
function oE(e, t) {
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
    n.type === "element" && o && Object.assign(n.properties, Xi(o)), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function sE(e, t) {
  const n = t.data || {}, r = "value" in t && !(ra.call(n, "hProperties") || ra.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function aE(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function rd(e) {
  let t = 0, n = e.charCodeAt(t);
  for (; n === 9 || n === 32; )
    t++, n = e.charCodeAt(t);
  return e.slice(t);
}
function id(e, t) {
  const n = rE(e, t), r = n.one(e, void 0), i = KT(n), o = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && o.children.push({ type: "text", value: `
` }, i), o;
}
function lE(e, t) {
  return e && "run" in e ? async function(n, r) {
    const i = (
      /** @type {HastRoot} */
      id(n, { file: r, ...t })
    );
    await e.run(i, r);
  } : function(n, r) {
    return (
      /** @type {HastRoot} */
      id(n, { file: r, ...e || t })
    );
  };
}
function od(e) {
  if (e)
    throw e;
}
var Di = Object.prototype.hasOwnProperty, jp = Object.prototype.toString, sd = Object.defineProperty, ad = Object.getOwnPropertyDescriptor, ld = function(t) {
  return typeof Array.isArray == "function" ? Array.isArray(t) : jp.call(t) === "[object Array]";
}, cd = function(t) {
  if (!t || jp.call(t) !== "[object Object]")
    return !1;
  var n = Di.call(t, "constructor"), r = t.constructor && t.constructor.prototype && Di.call(t.constructor.prototype, "isPrototypeOf");
  if (t.constructor && !n && !r)
    return !1;
  var i;
  for (i in t)
    ;
  return typeof i > "u" || Di.call(t, i);
}, ud = function(t, n) {
  sd && n.name === "__proto__" ? sd(t, n.name, {
    enumerable: !0,
    configurable: !0,
    value: n.newValue,
    writable: !0
  }) : t[n.name] = n.newValue;
}, dd = function(t, n) {
  if (n === "__proto__")
    if (Di.call(t, n)) {
      if (ad)
        return ad(t, n).value;
    } else return;
  return t[n];
}, cE = function e() {
  var t, n, r, i, o, s, a = arguments[0], l = 1, c = arguments.length, u = !1;
  for (typeof a == "boolean" && (u = a, a = arguments[1] || {}, l = 2), (a == null || typeof a != "object" && typeof a != "function") && (a = {}); l < c; ++l)
    if (t = arguments[l], t != null)
      for (n in t)
        r = dd(a, n), i = dd(t, n), a !== i && (u && i && (cd(i) || (o = ld(i))) ? (o ? (o = !1, s = r && ld(r) ? r : []) : s = r && cd(r) ? r : {}, ud(a, { name: n, newValue: e(u, s, i) })) : typeof i < "u" && ud(a, { name: n, newValue: i }));
  return a;
};
const fs = /* @__PURE__ */ pp(cE);
function ia(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function uE() {
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
      i = c, u ? dE(u, a)(...c) : s(null, ...c);
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
function dE(e, t) {
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
const Lt = { basename: fE, dirname: hE, extname: pE, join: mE, sep: "/" };
function fE(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  si(e);
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
function hE(e) {
  if (si(e), e.length === 0)
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
function pE(e) {
  si(e);
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
function mE(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    si(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : gE(n);
}
function gE(e) {
  si(e);
  const t = e.codePointAt(0) === 47;
  let n = yE(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function yE(e, t) {
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
function si(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const vE = { cwd: bE };
function bE() {
  return "/";
}
function oa(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function xE(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!oa(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return wE(e);
}
function wE(e) {
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
const hs = (
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
class Up {
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
    t ? oa(t) ? n = { path: t } : typeof t == "string" || SE(t) ? n = { value: t } : n = t : n = {}, this.cwd = "cwd" in n ? "" : vE.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < hs.length; ) {
      const o = hs[r];
      o in n && n[o] !== void 0 && n[o] !== null && (this[o] = o === "history" ? [...n[o]] : n[o]);
    }
    let i;
    for (i in n)
      hs.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? Lt.basename(this.path) : void 0;
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
    ms(t, "basename"), ps(t, "basename"), this.path = Lt.join(this.dirname || "", t);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? Lt.dirname(this.path) : void 0;
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
    fd(this.basename, "dirname"), this.path = Lt.join(t || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? Lt.extname(this.path) : void 0;
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
    if (ps(t, "extname"), fd(this.dirname, "extname"), t) {
      if (t.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = Lt.join(this.dirname, this.stem + (t || ""));
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
    oa(t) && (t = xE(t)), ms(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? Lt.basename(this.path, this.extname) : void 0;
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
    ms(t, "stem"), ps(t, "stem"), this.path = Lt.join(this.dirname || "", t + (this.extname || ""));
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
    const i = new Qe(
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
function ps(e, t) {
  if (e && e.includes(Lt.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + Lt.sep + "`"
    );
}
function ms(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function fd(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function SE(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const kE = (
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  /** @type {unknown} */
  /**
   * @this {Function}
   * @param {string | symbol} property
   * @returns {(...parameters: Array<unknown>) => unknown}
   */
  function(e) {
    const r = (
      /** @type {Record<string | symbol, Function>} */
      // Prototypes do exist.
      // type-coverage:ignore-next-line
      this.constructor.prototype
    ), i = r[e], o = function() {
      return i.apply(o, arguments);
    };
    return Object.setPrototypeOf(o, r), o;
  }
), CE = {}.hasOwnProperty;
class Rl extends kE {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = uE();
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
      new Rl()
    );
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return t.data(fs(!0, {}, this.namespace)), t;
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
    return typeof t == "string" ? arguments.length === 2 ? (vs("data", this.frozen), this.namespace[t] = n, this) : CE.call(this.namespace, t) && this.namespace[t] || void 0 : t ? (vs("data", this.frozen), this.namespace = t, this) : this.namespace;
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
    const n = bi(t), r = this.parser || this.Parser;
    return gs("parse", r), r(String(n), n);
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
    return this.freeze(), gs("process", this.parser || this.Parser), ys("process", this.compiler || this.Compiler), n ? i(void 0, n) : new Promise(i);
    function i(o, s) {
      const a = bi(t), l = (
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
        PE(m) ? h.value = m : h.result = m, c(
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
    return this.freeze(), gs("processSync", this.parser || this.Parser), ys("processSync", this.compiler || this.Compiler), this.process(t, i), pd("processSync", "process", n), r;
    function i(o, s) {
      n = !0, od(o), r = s;
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
    hd(t), this.freeze();
    const i = this.transformers;
    return !r && typeof n == "function" && (r = n, n = void 0), r ? o(void 0, r) : new Promise(o);
    function o(s, a) {
      const l = bi(n);
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
    return this.run(t, n, o), pd("runSync", "run", r), i;
    function o(s, a) {
      od(s), i = a, r = !0;
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
    const r = bi(n), i = this.compiler || this.Compiler;
    return ys("stringify", i), hd(t), i(t, r);
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
    if (vs("use", this.frozen), t != null) if (typeof t == "function")
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
      a(c.plugins), c.settings && (i.settings = fs(!0, i.settings, c.settings));
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
        ia(p) && ia(f) && (f = fs(!0, p, f)), r[h] = [c, f, ...m];
      }
    }
  }
}
const TE = new Rl().freeze();
function gs(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function ys(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function vs(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function hd(e) {
  if (!ia(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function pd(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function bi(e) {
  return EE(e) ? e : new Up(e);
}
function EE(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function PE(e) {
  return typeof e == "string" || AE(e);
}
function AE(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const RE = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", md = [], gd = { allowDangerousHtml: !0 }, NE = /^(https?|ircs?|mailto|xmpp)$/i, IE = [
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
function DE(e) {
  const t = ME(e), n = OE(e);
  return LE(t.runSync(t.parse(n), n), e);
}
function ME(e) {
  const t = e.rehypePlugins || md, n = e.remarkPlugins || md, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...gd } : gd;
  return TE().use(pT).use(n).use(lE, r).use(t);
}
function OE(e) {
  const t = e.children || "", n = new Up();
  return typeof t == "string" && (n.value = t), n;
}
function LE(e, t) {
  const n = t.allowedElements, r = t.allowElement, i = t.components, o = t.disallowedElements, s = t.skipHtml, a = t.unwrapDisallowed, l = t.urlTransform || _E;
  for (const u of IE)
    Object.hasOwn(t, u.from) && ("" + u.from + (u.to ? "use `" + u.to + "` instead" : "remove it") + RE + u.id, void 0);
  return t.className && (e = {
    type: "element",
    tagName: "div",
    properties: { className: t.className },
    // Assume no doctypes.
    children: (
      /** @type {Array<ElementContent>} */
      e.type === "root" ? e.children : [e]
    )
  }), Al(e, c), ZS(e, {
    Fragment: It,
    // @ts-expect-error
    // React components are allowed to return numbers,
    // but not according to the types in hast-util-to-jsx-runtime
    components: i,
    ignoreInvalidStyle: !0,
    jsx: g,
    jsxs: O,
    passKeys: !0,
    passNode: !0
  });
  function c(u, d, h) {
    if (u.type === "raw" && h && typeof d == "number")
      return s ? h.children.splice(d, 1) : h.children[d] = { type: "text", value: u.value }, d;
    if (u.type === "element") {
      let f;
      for (f in cs)
        if (Object.hasOwn(cs, f) && Object.hasOwn(u.properties, f)) {
          const m = u.properties[f], p = cs[f];
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
function _E(e) {
  const t = e.indexOf(":"), n = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    t === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && t > i || n !== -1 && t > n || r !== -1 && t > r || // It is a protocol, it should be allowed.
    NE.test(e.slice(0, t)) ? e : ""
  );
}
function yd(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
function FE(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function VE(e, t, n) {
  const i = Ao((n || {}).ignore || []), o = BE(t);
  let s = -1;
  for (; ++s < o.length; )
    $p(e, "text", a);
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
    const b = d.children.indexOf(c);
    let v = !1, x = [];
    h.lastIndex = 0;
    let w = h.exec(c.value);
    for (; w; ) {
      const E = w.index, T = {
        index: w.index,
        input: w.input,
        stack: [...u, c]
      };
      let k = f(...w, T);
      if (typeof k == "string" && (k = k.length > 0 ? { type: "text", value: k } : void 0), k === !1 ? h.lastIndex = E + 1 : (m !== E && x.push({
        type: "text",
        value: c.value.slice(m, E)
      }), Array.isArray(k) ? x.push(...k) : k && x.push(k), m = E + w[0].length, v = !0), !h.global)
        break;
      w = h.exec(c.value);
    }
    return v ? (m < c.value.length && x.push({ type: "text", value: c.value.slice(m) }), d.children.splice(b, 1, ...x)) : x = [c], b + x.length;
  }
}
function BE(e) {
  const t = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const n = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    t.push([zE(i[0]), $E(i[1])]);
  }
  return t;
}
function zE(e) {
  return typeof e == "string" ? new RegExp(FE(e), "g") : e;
}
function $E(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const bs = "phrasing", xs = ["autolink", "link", "image", "label"];
function jE() {
  return {
    transforms: [YE],
    enter: {
      literalAutolink: HE,
      literalAutolinkEmail: ws,
      literalAutolinkHttp: ws,
      literalAutolinkWww: ws
    },
    exit: {
      literalAutolink: GE,
      literalAutolinkEmail: KE,
      literalAutolinkHttp: WE,
      literalAutolinkWww: qE
    }
  };
}
function UE() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: bs,
        notInConstruct: xs
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: bs,
        notInConstruct: xs
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: bs,
        notInConstruct: xs
      }
    ]
  };
}
function HE(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function ws(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function WE(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function qE(e) {
  this.config.exit.data.call(this, e);
  const t = this.stack[this.stack.length - 1];
  t.type, t.url = "http://" + this.sliceSerialize(e);
}
function KE(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function GE(e) {
  this.exit(e);
}
function YE(e) {
  VE(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, XE],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), ZE]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function XE(e, t, n, r, i) {
  let o = "";
  if (!Hp(i) || (/^w/i.test(t) && (n = t + n, t = "", o = "http://"), !JE(n)))
    return !1;
  const s = QE(n + r);
  if (!s[0]) return !1;
  const a = {
    type: "link",
    title: null,
    url: o + t + s[0],
    children: [{ type: "text", value: t + s[0] }]
  };
  return s[1] ? [a, { type: "text", value: s[1] }] : a;
}
function ZE(e, t, n, r) {
  return (
    // Not an expected previous character.
    !Hp(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(n) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + t + "@" + n,
      children: [{ type: "text", value: t + "@" + n }]
    }
  );
}
function JE(e) {
  const t = e.split(".");
  return !(t.length < 2 || t[t.length - 1] && (/_/.test(t[t.length - 1]) || !/[a-zA-Z\d]/.test(t[t.length - 1])) || t[t.length - 2] && (/_/.test(t[t.length - 2]) || !/[a-zA-Z\d]/.test(t[t.length - 2])));
}
function QE(e) {
  const t = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!t)
    return [e, void 0];
  e = e.slice(0, t.index);
  let n = t[0], r = n.indexOf(")");
  const i = yd(e, "(");
  let o = yd(e, ")");
  for (; r !== -1 && i > o; )
    e += n.slice(0, r + 1), n = n.slice(r + 1), r = n.indexOf(")"), o++;
  return [e, n];
}
function Hp(e, t) {
  const n = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || On(n) || To(n)) && // If it’s an email, the previous character should not be a slash.
  (!t || n !== 47);
}
Wp.peek = lP;
function eP() {
  this.buffer();
}
function tP(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function nP() {
  this.buffer();
}
function rP(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function iP(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = Nt(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function oP(e) {
  this.exit(e);
}
function sP(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = Nt(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function aP(e) {
  this.exit(e);
}
function lP() {
  return "[";
}
function Wp(e, t, n, r) {
  const i = n.createTracker(r);
  let o = i.move("[^");
  const s = n.enter("footnoteReference"), a = n.enter("reference");
  return o += i.move(
    n.safe(n.associationId(e), { after: "]", before: o })
  ), a(), s(), o += i.move("]"), o;
}
function cP() {
  return {
    enter: {
      gfmFootnoteCallString: eP,
      gfmFootnoteCall: tP,
      gfmFootnoteDefinitionLabelString: nP,
      gfmFootnoteDefinition: rP
    },
    exit: {
      gfmFootnoteCallString: iP,
      gfmFootnoteCall: oP,
      gfmFootnoteDefinitionLabelString: sP,
      gfmFootnoteDefinition: aP
    }
  };
}
function uP(e) {
  let t = !1;
  return e && e.firstLineBlank && (t = !0), {
    handlers: { footnoteDefinition: n, footnoteReference: Wp },
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
        t ? qp : dP
      )
    )), c(), l;
  }
}
function dP(e, t, n) {
  return t === 0 ? e : qp(e, t, n);
}
function qp(e, t, n) {
  return (n ? "" : "    ") + e;
}
const fP = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
Kp.peek = yP;
function hP() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: mP },
    exit: { strikethrough: gP }
  };
}
function pP() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: fP
      }
    ],
    handlers: { delete: Kp }
  };
}
function mP(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function gP(e) {
  this.exit(e);
}
function Kp(e, t, n, r) {
  const i = n.createTracker(r), o = n.enter("strikethrough");
  let s = i.move("~~");
  return s += n.containerPhrasing(e, {
    ...i.current(),
    before: s,
    after: "~"
  }), s += i.move("~~"), o(), s;
}
function yP() {
  return "~";
}
function vP(e) {
  return e.length;
}
function bP(e, t) {
  const n = t || {}, r = (n.align || []).concat(), i = n.stringLength || vP, o = [], s = [], a = [], l = [];
  let c = 0, u = -1;
  for (; ++u < e.length; ) {
    const p = [], b = [];
    let v = -1;
    for (e[u].length > c && (c = e[u].length); ++v < e[u].length; ) {
      const x = xP(e[u][v]);
      if (n.alignDelimiters !== !1) {
        const w = i(x);
        b[v] = w, (l[v] === void 0 || w > l[v]) && (l[v] = w);
      }
      p.push(x);
    }
    s[u] = p, a[u] = b;
  }
  let d = -1;
  if (typeof r == "object" && "length" in r)
    for (; ++d < c; )
      o[d] = vd(r[d]);
  else {
    const p = vd(r);
    for (; ++d < c; )
      o[d] = p;
  }
  d = -1;
  const h = [], f = [];
  for (; ++d < c; ) {
    const p = o[d];
    let b = "", v = "";
    p === 99 ? (b = ":", v = ":") : p === 108 ? b = ":" : p === 114 && (v = ":");
    let x = n.alignDelimiters === !1 ? 1 : Math.max(
      1,
      l[d] - b.length - v.length
    );
    const w = b + "-".repeat(x) + v;
    n.alignDelimiters !== !1 && (x = b.length + x + v.length, x > l[d] && (l[d] = x), f[d] = x), h[d] = w;
  }
  s.splice(1, 0, h), a.splice(1, 0, f), u = -1;
  const m = [];
  for (; ++u < s.length; ) {
    const p = s[u], b = a[u];
    d = -1;
    const v = [];
    for (; ++d < c; ) {
      const x = p[d] || "";
      let w = "", E = "";
      if (n.alignDelimiters !== !1) {
        const T = l[d] - (b[d] || 0), k = o[d];
        k === 114 ? w = " ".repeat(T) : k === 99 ? T % 2 ? (w = " ".repeat(T / 2 + 0.5), E = " ".repeat(T / 2 - 0.5)) : (w = " ".repeat(T / 2), E = w) : E = " ".repeat(T);
      }
      n.delimiterStart !== !1 && !d && v.push("|"), n.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(n.alignDelimiters === !1 && x === "") && (n.delimiterStart !== !1 || d) && v.push(" "), n.alignDelimiters !== !1 && v.push(w), v.push(x), n.alignDelimiters !== !1 && v.push(E), n.padding !== !1 && v.push(" "), (n.delimiterEnd !== !1 || d !== c - 1) && v.push("|");
    }
    m.push(
      n.delimiterEnd === !1 ? v.join("").replace(/ +$/, "") : v.join("")
    );
  }
  return m.join(`
`);
}
function xP(e) {
  return e == null ? "" : String(e);
}
function vd(e) {
  const t = typeof e == "string" ? e.codePointAt(0) : 0;
  return t === 67 || t === 99 ? 99 : t === 76 || t === 108 ? 108 : t === 82 || t === 114 ? 114 : 0;
}
function wP(e, t, n, r) {
  const i = n.enter("blockquote"), o = n.createTracker(r);
  o.move("> "), o.shift(2);
  const s = n.indentLines(
    n.containerFlow(e, o.current()),
    SP
  );
  return i(), s;
}
function SP(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function kP(e, t) {
  return bd(e, t.inConstruct, !0) && !bd(e, t.notInConstruct, !1);
}
function bd(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function xd(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && kP(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function CP(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, o = 0, s = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++o > s && (s = o) : o = 1, i = r + t.length, r = n.indexOf(t, i);
  return s;
}
function TP(e, t) {
  return !!(t.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function EP(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function PP(e, t, n, r) {
  const i = EP(n), o = e.value || "", s = i === "`" ? "GraveAccent" : "Tilde";
  if (TP(e, n)) {
    const d = n.enter("codeIndented"), h = n.indentLines(o, AP);
    return d(), h;
  }
  const a = n.createTracker(r), l = i.repeat(Math.max(CP(o, i) + 1, 3)), c = n.enter("codeFenced");
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
function AP(e, t, n) {
  return (n ? "" : "    ") + e;
}
function Nl(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function RP(e, t, n, r) {
  const i = Nl(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("definition");
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
function NP(e) {
  const t = e.options.emphasis || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + t + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return t;
}
function Gr(e) {
  return "&#x" + e.toString(16).toUpperCase() + ";";
}
function Zi(e, t, n) {
  const r = ar(e), i = ar(t);
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
Gp.peek = IP;
function Gp(e, t, n, r) {
  const i = NP(n), o = n.enter("emphasis"), s = n.createTracker(r), a = s.move(i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = Zi(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Gr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = Zi(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Gr(d));
  const f = s.move(i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function IP(e, t, n) {
  return n.options.emphasis || "*";
}
function DP(e, t) {
  let n = !1;
  return Al(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, na;
  }), !!((!e.depth || e.depth < 3) && wl(e) && (t.options.setext || n));
}
function MP(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), o = n.createTracker(r);
  if (DP(e, n)) {
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
  return /^[\t ]/.test(c) && (c = Gr(c.charCodeAt(0)) + c.slice(1)), c = c ? s + " " + c : s, n.options.closeAtx && (c += " " + s), l(), a(), c;
}
Yp.peek = OP;
function Yp(e) {
  return e.value || "";
}
function OP() {
  return "<";
}
Xp.peek = LP;
function Xp(e, t, n, r) {
  const i = Nl(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("image");
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
function LP() {
  return "!";
}
Zp.peek = _P;
function Zp(e, t, n, r) {
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
function _P() {
  return "!";
}
Jp.peek = FP;
function Jp(e, t, n) {
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
function FP() {
  return "`";
}
function Qp(e, t) {
  const n = wl(e);
  return !!(!t.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
em.peek = VP;
function em(e, t, n, r) {
  const i = Nl(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.createTracker(r);
  let a, l;
  if (Qp(e, n)) {
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
function VP(e, t, n) {
  return Qp(e, n) ? "<" : "[";
}
tm.peek = BP;
function tm(e, t, n, r) {
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
function BP() {
  return "[";
}
function Il(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function zP(e) {
  const t = Il(e), n = e.options.bulletOther;
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
function $P(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function nm(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function jP(e, t, n, r) {
  const i = n.enter("list"), o = n.bulletCurrent;
  let s = e.ordered ? $P(n) : Il(n);
  const a = e.ordered ? s === "." ? ")" : "." : zP(n);
  let l = t && n.bulletLastUsed ? s === n.bulletLastUsed : !1;
  if (!e.ordered) {
    const u = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (s === "*" || s === "-") && // Empty first list item:
      u && (!u.children || !u.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (l = !0), nm(n) === s && u
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
function UP(e) {
  const t = e.options.listItemIndent || "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function HP(e, t, n, r) {
  const i = UP(n);
  let o = n.bulletCurrent || Il(n);
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
function WP(e, t, n, r) {
  const i = n.enter("paragraph"), o = n.enter("phrasing"), s = n.containerPhrasing(e, r);
  return o(), i(), s;
}
const qP = (
  /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
  Ao([
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
function KP(e, t, n, r) {
  return (e.children.some(function(s) {
    return qP(s);
  }) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function GP(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
rm.peek = YP;
function rm(e, t, n, r) {
  const i = GP(n), o = n.enter("strong"), s = n.createTracker(r), a = s.move(i + i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = Zi(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Gr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = Zi(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Gr(d));
  const f = s.move(i + i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function YP(e, t, n) {
  return n.options.strong || "*";
}
function XP(e, t, n, r) {
  return n.safe(e.value, r);
}
function ZP(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function JP(e, t, n) {
  const r = (nm(n) + (n.options.ruleSpaces ? " " : "")).repeat(ZP(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const im = {
  blockquote: wP,
  break: xd,
  code: PP,
  definition: RP,
  emphasis: Gp,
  hardBreak: xd,
  heading: MP,
  html: Yp,
  image: Xp,
  imageReference: Zp,
  inlineCode: Jp,
  link: em,
  linkReference: tm,
  list: jP,
  listItem: HP,
  paragraph: WP,
  root: KP,
  strong: rm,
  text: XP,
  thematicBreak: JP
};
function QP() {
  return {
    enter: {
      table: eA,
      tableData: wd,
      tableHeader: wd,
      tableRow: nA
    },
    exit: {
      codeText: rA,
      table: tA,
      tableData: Ss,
      tableHeader: Ss,
      tableRow: Ss
    }
  };
}
function eA(e) {
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
function tA(e) {
  this.exit(e), this.data.inTable = void 0;
}
function nA(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function Ss(e) {
  this.exit(e);
}
function wd(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function rA(e) {
  let t = this.resume();
  this.data.inTable && (t = t.replace(/\\([\\|])/g, iA));
  const n = this.stack[this.stack.length - 1];
  n.type, n.value = t, this.exit(e);
}
function iA(e, t) {
  return t === "|" ? t : e;
}
function oA(e) {
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
  function s(f, m, p, b) {
    return c(u(f, p, b), f.align);
  }
  function a(f, m, p, b) {
    const v = d(f, p, b), x = c([v]);
    return x.slice(0, x.indexOf(`
`));
  }
  function l(f, m, p, b) {
    const v = p.enter("tableCell"), x = p.enter("phrasing"), w = p.containerPhrasing(f, {
      ...b,
      before: o,
      after: o
    });
    return x(), v(), w;
  }
  function c(f, m) {
    return bP(f, {
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
    const b = f.children;
    let v = -1;
    const x = [], w = m.enter("table");
    for (; ++v < b.length; )
      x[v] = d(b[v], m, p);
    return w(), x;
  }
  function d(f, m, p) {
    const b = f.children;
    let v = -1;
    const x = [], w = m.enter("tableRow");
    for (; ++v < b.length; )
      x[v] = l(b[v], f, m, p);
    return w(), x;
  }
  function h(f, m, p) {
    let b = im.inlineCode(f, m, p);
    return p.stack.includes("tableCell") && (b = b.replace(/\|/g, "\\$&")), b;
  }
}
function sA() {
  return {
    exit: {
      taskListCheckValueChecked: Sd,
      taskListCheckValueUnchecked: Sd,
      paragraph: lA
    }
  };
}
function aA() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: cA }
  };
}
function Sd(e) {
  const t = this.stack[this.stack.length - 2];
  t.type, t.checked = e.type === "taskListCheckValueChecked";
}
function lA(e) {
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
function cA(e, t, n, r) {
  const i = e.children[0], o = typeof e.checked == "boolean" && i && i.type === "paragraph", s = "[" + (e.checked ? "x" : " ") + "] ", a = n.createTracker(r);
  o && a.move(s);
  let l = im.listItem(e, t, n, {
    ...r,
    ...a.current()
  });
  return o && (l = l.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, c)), l;
  function c(u) {
    return u + s;
  }
}
function uA() {
  return [
    jE(),
    cP(),
    hP(),
    QP(),
    sA()
  ];
}
function dA(e) {
  return {
    extensions: [
      UE(),
      uP(e),
      pP(),
      oA(e),
      aA()
    ]
  };
}
const fA = {
  tokenize: vA,
  partial: !0
}, om = {
  tokenize: bA,
  partial: !0
}, sm = {
  tokenize: xA,
  partial: !0
}, am = {
  tokenize: wA,
  partial: !0
}, hA = {
  tokenize: SA,
  partial: !0
}, lm = {
  name: "wwwAutolink",
  tokenize: gA,
  previous: um
}, cm = {
  name: "protocolAutolink",
  tokenize: yA,
  previous: dm
}, rn = {
  name: "emailAutolink",
  tokenize: mA,
  previous: fm
}, Ut = {};
function pA() {
  return {
    text: Ut
  };
}
let Pn = 48;
for (; Pn < 123; )
  Ut[Pn] = rn, Pn++, Pn === 58 ? Pn = 65 : Pn === 91 && (Pn = 97);
Ut[43] = rn;
Ut[45] = rn;
Ut[46] = rn;
Ut[95] = rn;
Ut[72] = [rn, cm];
Ut[104] = [rn, cm];
Ut[87] = [rn, lm];
Ut[119] = [rn, lm];
function mA(e, t, n) {
  const r = this;
  let i, o;
  return s;
  function s(d) {
    return !sa(d) || !fm.call(r, r.previous) || Dl(r.events) ? n(d) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), a(d));
  }
  function a(d) {
    return sa(d) ? (e.consume(d), a) : d === 64 ? (e.consume(d), l) : n(d);
  }
  function l(d) {
    return d === 46 ? e.check(hA, u, c)(d) : d === 45 || d === 95 || Je(d) ? (o = !0, e.consume(d), l) : u(d);
  }
  function c(d) {
    return e.consume(d), i = !0, l;
  }
  function u(d) {
    return o && i && nt(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), t(d)) : n(d);
  }
}
function gA(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s !== 87 && s !== 119 || !um.call(r, r.previous) || Dl(r.events) ? n(s) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(fA, e.attempt(om, e.attempt(sm, o), n), n)(s));
  }
  function o(s) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), t(s);
  }
}
function yA(e, t, n) {
  const r = this;
  let i = "", o = !1;
  return s;
  function s(d) {
    return (d === 72 || d === 104) && dm.call(r, r.previous) && !Dl(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(d), e.consume(d), a) : n(d);
  }
  function a(d) {
    if (nt(d) && i.length < 5)
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
    return d === null || Gi(d) || Se(d) || On(d) || To(d) ? n(d) : e.attempt(om, e.attempt(sm, u), n)(d);
  }
  function u(d) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), t(d);
  }
}
function vA(e, t, n) {
  let r = 0;
  return i;
  function i(s) {
    return (s === 87 || s === 119) && r < 3 ? (r++, e.consume(s), i) : s === 46 && r === 3 ? (e.consume(s), o) : n(s);
  }
  function o(s) {
    return s === null ? n(s) : t(s);
  }
}
function bA(e, t, n) {
  let r, i, o;
  return s;
  function s(c) {
    return c === 46 || c === 95 ? e.check(am, l, a)(c) : c === null || Se(c) || On(c) || c !== 45 && To(c) ? l(c) : (o = !0, e.consume(c), s);
  }
  function a(c) {
    return c === 95 ? r = !0 : (i = r, r = void 0), e.consume(c), s;
  }
  function l(c) {
    return i || r || !o ? n(c) : t(c);
  }
}
function xA(e, t) {
  let n = 0, r = 0;
  return i;
  function i(s) {
    return s === 40 ? (n++, e.consume(s), i) : s === 41 && r < n ? o(s) : s === 33 || s === 34 || s === 38 || s === 39 || s === 41 || s === 42 || s === 44 || s === 46 || s === 58 || s === 59 || s === 60 || s === 63 || s === 93 || s === 95 || s === 126 ? e.check(am, t, o)(s) : s === null || Se(s) || On(s) ? t(s) : (e.consume(s), i);
  }
  function o(s) {
    return s === 41 && r++, e.consume(s), i;
  }
}
function wA(e, t, n) {
  return r;
  function r(a) {
    return a === 33 || a === 34 || a === 39 || a === 41 || a === 42 || a === 44 || a === 46 || a === 58 || a === 59 || a === 63 || a === 95 || a === 126 ? (e.consume(a), r) : a === 38 ? (e.consume(a), o) : a === 93 ? (e.consume(a), i) : (
      // `<` is an end.
      a === 60 || // So is whitespace.
      a === null || Se(a) || On(a) ? t(a) : n(a)
    );
  }
  function i(a) {
    return a === null || a === 40 || a === 91 || Se(a) || On(a) ? t(a) : r(a);
  }
  function o(a) {
    return nt(a) ? s(a) : n(a);
  }
  function s(a) {
    return a === 59 ? (e.consume(a), r) : nt(a) ? (e.consume(a), s) : n(a);
  }
}
function SA(e, t, n) {
  return r;
  function r(o) {
    return e.consume(o), i;
  }
  function i(o) {
    return Je(o) ? n(o) : t(o);
  }
}
function um(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || Se(e);
}
function dm(e) {
  return !nt(e);
}
function fm(e) {
  return !(e === 47 || sa(e));
}
function sa(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || Je(e);
}
function Dl(e) {
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
const kA = {
  tokenize: IA,
  partial: !0
};
function CA() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: AA,
        continuation: {
          tokenize: RA
        },
        exit: NA
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: PA
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: TA,
        resolveTo: EA
      }
    }
  };
}
function TA(e, t, n) {
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
    const c = Nt(r.sliceSerialize({
      start: s.end,
      end: r.now()
    }));
    return c.codePointAt(0) !== 94 || !o.includes(c.slice(1)) ? n(l) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(l), e.exit("gfmFootnoteCallLabelMarker"), t(l));
  }
}
function EA(e, t) {
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
function PA(e, t, n) {
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
      return i.includes(Nt(r.sliceSerialize(h))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), t) : n(d);
    }
    return Se(d) || (s = !0), o++, e.consume(d), d === 92 ? u : c;
  }
  function u(d) {
    return d === 91 || d === 92 || d === 93 ? (e.consume(d), o++, c) : c(d);
  }
}
function AA(e, t, n) {
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
      return o = Nt(r.sliceSerialize(p)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), h;
    }
    return Se(m) || (a = !0), s++, e.consume(m), m === 92 ? d : u;
  }
  function d(m) {
    return m === 91 || m === 92 || m === 93 ? (e.consume(m), s++, u) : u(m);
  }
  function h(m) {
    return m === 58 ? (e.enter("definitionMarker"), e.consume(m), e.exit("definitionMarker"), i.includes(o) || i.push(o), ve(e, f, "gfmFootnoteDefinitionWhitespace")) : n(m);
  }
  function f(m) {
    return t(m);
  }
}
function RA(e, t, n) {
  return e.check(oi, t, e.attempt(kA, t, n));
}
function NA(e) {
  e.exit("gfmFootnoteDefinition");
}
function IA(e, t, n) {
  const r = this;
  return ve(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "gfmFootnoteDefinitionIndent" && s[2].sliceSerialize(s[1], !0).length === 4 ? t(o) : n(o);
  }
}
function DA(e) {
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
            f && mt(h, h.length, 0, Eo(f, s.slice(c + 1, l), a)), mt(h, h.length, 0, [["exit", d, a], ["enter", s[l][1], a], ["exit", s[l][1], a], ["exit", u, a]]), mt(s, c - 1, l - c + 3, h), l = c + h.length - 2;
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
      const p = ar(c);
      if (m === 126)
        return d > 1 ? l(m) : (s.consume(m), d++, f);
      if (d < 2 && !n) return l(m);
      const b = s.exit("strikethroughSequenceTemporary"), v = ar(m);
      return b._open = !v || v === 2 && !!p, b._close = !p || p === 2 && !!v, a(m);
    }
  }
}
class MA {
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
    OA(this, t, n, r);
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
function OA(e, t, n, r) {
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
function LA(e, t) {
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
function _A() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: FA,
        resolveAll: VA
      }
    }
  };
}
function FA(e, t, n) {
  const r = this;
  let i = 0, o = 0, s;
  return a;
  function a(P) {
    let N = r.events.length - 1;
    for (; N > -1; ) {
      const j = r.events[N][1].type;
      if (j === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      j === "linePrefix") N--;
      else break;
    }
    const R = N > -1 ? r.events[N][1].type : null, B = R === "tableHead" || R === "tableRow" ? k : l;
    return B === k && r.parser.lazy[r.now().line] ? n(P) : B(P);
  }
  function l(P) {
    return e.enter("tableHead"), e.enter("tableRow"), c(P);
  }
  function c(P) {
    return P === 124 || (s = !0, o += 1), u(P);
  }
  function u(P) {
    return P === null ? n(P) : X(P) ? o > 1 ? (o = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(P), e.exit("lineEnding"), f) : n(P) : ge(P) ? ve(e, u, "whitespace")(P) : (o += 1, s && (s = !1, i += 1), P === 124 ? (e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), s = !0, u) : (e.enter("data"), d(P)));
  }
  function d(P) {
    return P === null || P === 124 || Se(P) ? (e.exit("data"), u(P)) : (e.consume(P), P === 92 ? h : d);
  }
  function h(P) {
    return P === 92 || P === 124 ? (e.consume(P), d) : d(P);
  }
  function f(P) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? n(P) : (e.enter("tableDelimiterRow"), s = !1, ge(P) ? ve(e, m, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(P) : m(P));
  }
  function m(P) {
    return P === 45 || P === 58 ? b(P) : P === 124 ? (s = !0, e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), p) : T(P);
  }
  function p(P) {
    return ge(P) ? ve(e, b, "whitespace")(P) : b(P);
  }
  function b(P) {
    return P === 58 ? (o += 1, s = !0, e.enter("tableDelimiterMarker"), e.consume(P), e.exit("tableDelimiterMarker"), v) : P === 45 ? (o += 1, v(P)) : P === null || X(P) ? E(P) : T(P);
  }
  function v(P) {
    return P === 45 ? (e.enter("tableDelimiterFiller"), x(P)) : T(P);
  }
  function x(P) {
    return P === 45 ? (e.consume(P), x) : P === 58 ? (s = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(P), e.exit("tableDelimiterMarker"), w) : (e.exit("tableDelimiterFiller"), w(P));
  }
  function w(P) {
    return ge(P) ? ve(e, E, "whitespace")(P) : E(P);
  }
  function E(P) {
    return P === 124 ? m(P) : P === null || X(P) ? !s || i !== o ? T(P) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), t(P)) : T(P);
  }
  function T(P) {
    return n(P);
  }
  function k(P) {
    return e.enter("tableRow"), A(P);
  }
  function A(P) {
    return P === 124 ? (e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), A) : P === null || X(P) ? (e.exit("tableRow"), t(P)) : ge(P) ? ve(e, A, "whitespace")(P) : (e.enter("data"), D(P));
  }
  function D(P) {
    return P === null || P === 124 || Se(P) ? (e.exit("data"), A(P)) : (e.consume(P), P === 92 ? F : D);
  }
  function F(P) {
    return P === 92 || P === 124 ? (e.consume(P), D) : D(P);
  }
}
function VA(e, t) {
  let n = -1, r = !0, i = 0, o = [0, 0, 0, 0], s = [0, 0, 0, 0], a = !1, l = 0, c, u, d;
  const h = new MA();
  for (; ++n < e.length; ) {
    const f = e[n], m = f[1];
    f[0] === "enter" ? m.type === "tableHead" ? (a = !1, l !== 0 && (kd(h, t, l, c, u), u = void 0, l = 0), c = {
      type: "table",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, h.add(n, 0, [["enter", c, t]])) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (r = !0, d = void 0, o = [0, 0, 0, 0], s = [0, n + 1, 0, 0], a && (a = !1, u = {
      type: "tableBody",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, h.add(n, 0, [["enter", u, t]])), i = m.type === "tableDelimiterRow" ? 2 : u ? 3 : 1) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") ? (r = !1, s[2] === 0 && (o[1] !== 0 && (s[0] = s[1], d = xi(h, t, o, i, void 0, d), o = [0, 0, 0, 0]), s[2] = n)) : m.type === "tableCellDivider" && (r ? r = !1 : (o[1] !== 0 && (s[0] = s[1], d = xi(h, t, o, i, void 0, d)), o = s, s = [o[1], n, 0, 0])) : m.type === "tableHead" ? (a = !0, l = n) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (l = n, o[1] !== 0 ? (s[0] = s[1], d = xi(h, t, o, i, n, d)) : s[1] !== 0 && (d = xi(h, t, s, i, n, d)), i = 0) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") && (s[3] = n);
  }
  for (l !== 0 && kd(h, t, l, c, u), h.consume(t.events), n = -1; ++n < t.events.length; ) {
    const f = t.events[n];
    f[0] === "enter" && f[1].type === "table" && (f[1]._align = LA(t.events, n));
  }
  return e;
}
function xi(e, t, n, r, i, o) {
  const s = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", a = "tableContent";
  n[0] !== 0 && (o.end = Object.assign({}, Gn(t.events, n[0])), e.add(n[0], 0, [["exit", o, t]]));
  const l = Gn(t.events, n[1]);
  if (o = {
    type: s,
    start: Object.assign({}, l),
    // Note: correct end is set later.
    end: Object.assign({}, l)
  }, e.add(n[1], 0, [["enter", o, t]]), n[2] !== 0) {
    const c = Gn(t.events, n[2]), u = Gn(t.events, n[3]), d = {
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
  return i !== void 0 && (o.end = Object.assign({}, Gn(t.events, i)), e.add(i, 0, [["exit", o, t]]), o = void 0), o;
}
function kd(e, t, n, r, i) {
  const o = [], s = Gn(t.events, n);
  i && (i.end = Object.assign({}, s), o.push(["exit", i, t])), r.end = Object.assign({}, s), o.push(["exit", r, t]), e.add(n + 1, 0, o);
}
function Gn(e, t) {
  const n = e[t], r = n[0] === "enter" ? "start" : "end";
  return n[1][r];
}
const BA = {
  name: "tasklistCheck",
  tokenize: $A
};
function zA() {
  return {
    text: {
      91: BA
    }
  };
}
function $A(e, t, n) {
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
    return X(l) ? t(l) : ge(l) ? e.check({
      tokenize: jA
    }, t, n)(l) : n(l);
  }
}
function jA(e, t, n) {
  return ve(e, r, "whitespace");
  function r(i) {
    return i === null ? n(i) : t(i);
  }
}
function UA(e) {
  return Sp([
    pA(),
    CA(),
    DA(e),
    _A(),
    zA()
  ]);
}
const HA = {};
function WA(e) {
  const t = (
    /** @type {Processor<Root>} */
    this
  ), n = e || HA, r = t.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), o = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), s = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(UA(n)), o.push(uA()), s.push(dA(n));
}
var qA = (e) => {
  switch (e) {
    case "success":
      return YA;
    case "info":
      return ZA;
    case "warning":
      return XA;
    case "error":
      return JA;
    default:
      return null;
  }
}, KA = Array(12).fill(0), GA = ({ visible: e, className: t }) => $.createElement("div", { className: ["sonner-loading-wrapper", t].filter(Boolean).join(" "), "data-visible": e }, $.createElement("div", { className: "sonner-spinner" }, KA.map((n, r) => $.createElement("div", { className: "sonner-loading-bar", key: `spinner-bar-${r}` })))), YA = $.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, $.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })), XA = $.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", height: "20", width: "20" }, $.createElement("path", { fillRule: "evenodd", d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z", clipRule: "evenodd" })), ZA = $.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, $.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z", clipRule: "evenodd" })), JA = $.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, $.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z", clipRule: "evenodd" })), QA = $.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, $.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), $.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })), eR = () => {
  let [e, t] = $.useState(document.hidden);
  return $.useEffect(() => {
    let n = () => {
      t(document.hidden);
    };
    return document.addEventListener("visibilitychange", n), () => window.removeEventListener("visibilitychange", n);
  }, []), e;
}, aa = 1, tR = class {
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
      let { message: n, ...r } = e, i = typeof (e == null ? void 0 : e.id) == "number" || ((t = e.id) == null ? void 0 : t.length) > 0 ? e.id : aa++, o = this.toasts.find((a) => a.id === i), s = e.dismissible === void 0 ? !0 : e.dismissible;
      return this.dismissedToasts.has(i) && this.dismissedToasts.delete(i), o ? this.toasts = this.toasts.map((a) => a.id === i ? (this.publish({ ...a, ...e, id: i, title: n }), { ...a, ...e, id: i, dismissible: s, title: n }) : a) : this.addToast({ title: n, ...r, dismissible: s, id: i }), i;
    }, this.dismiss = (e) => (this.dismissedToasts.add(e), e || this.toasts.forEach((t) => {
      this.subscribers.forEach((n) => n({ id: t.id, dismiss: !0 }));
    }), this.subscribers.forEach((t) => t({ id: e, dismiss: !0 })), e), this.message = (e, t) => this.create({ ...t, message: e }), this.error = (e, t) => this.create({ ...t, message: e, type: "error" }), this.success = (e, t) => this.create({ ...t, type: "success", message: e }), this.info = (e, t) => this.create({ ...t, type: "info", message: e }), this.warning = (e, t) => this.create({ ...t, type: "warning", message: e }), this.loading = (e, t) => this.create({ ...t, type: "loading", message: e }), this.promise = (e, t) => {
      if (!t) return;
      let n;
      t.loading !== void 0 && (n = this.create({ ...t, promise: e, type: "loading", message: t.loading, description: typeof t.description != "function" ? t.description : void 0 }));
      let r = e instanceof Promise ? e : e(), i = n !== void 0, o, s = r.then(async (l) => {
        if (o = ["resolve", l], $.isValidElement(l)) i = !1, this.create({ id: n, type: "default", message: l });
        else if (rR(l) && !l.ok) {
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
      let n = (t == null ? void 0 : t.id) || aa++;
      return this.create({ jsx: e(n), id: n, ...t }), n;
    }, this.getActiveToasts = () => this.toasts.filter((e) => !this.dismissedToasts.has(e.id)), this.subscribers = [], this.toasts = [], this.dismissedToasts = /* @__PURE__ */ new Set();
  }
}, at = new tR(), nR = (e, t) => {
  let n = (t == null ? void 0 : t.id) || aa++;
  return at.addToast({ title: e, ...t, id: n }), n;
}, rR = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", iR = nR, oR = () => at.toasts, sR = () => at.getActiveToasts(), Cd = Object.assign(iR, { success: at.success, info: at.info, warning: at.warning, error: at.error, custom: at.custom, message: at.message, promise: at.promise, dismiss: at.dismiss, loading: at.loading }, { getHistory: oR, getToasts: sR });
function aR(e, { insertAt: t } = {}) {
  if (typeof document > "u") return;
  let n = document.head || document.getElementsByTagName("head")[0], r = document.createElement("style");
  r.type = "text/css", t === "top" && n.firstChild ? n.insertBefore(r, n.firstChild) : n.appendChild(r), r.styleSheet ? r.styleSheet.cssText = e : r.appendChild(document.createTextNode(e));
}
aR(`:where(html[dir="ltr"]),:where([data-sonner-toaster][dir="ltr"]){--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}:where(html[dir="rtl"]),:where([data-sonner-toaster][dir="rtl"]){--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999;transition:transform .4s ease}:where([data-sonner-toaster][data-lifted="true"]){transform:translateY(-10px)}@media (hover: none) and (pointer: coarse){:where([data-sonner-toaster][data-lifted="true"]){transform:none}}:where([data-sonner-toaster][data-x-position="right"]){right:var(--offset-right)}:where([data-sonner-toaster][data-x-position="left"]){left:var(--offset-left)}:where([data-sonner-toaster][data-x-position="center"]){left:50%;transform:translate(-50%)}:where([data-sonner-toaster][data-y-position="top"]){top:var(--offset-top)}:where([data-sonner-toaster][data-y-position="bottom"]){bottom:var(--offset-bottom)}:where([data-sonner-toast]){--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled="true"]){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast][data-y-position="top"]){top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position="bottom"]){bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise="true"]) :where([data-icon])>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px #0006}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0,0,0,.08)}:where([data-sonner-toast][data-theme="dark"]) :where([data-cancel]){background:rgba(255,255,255,.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]{background:var(--gray1)}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast]) :where([data-disabled="true"]){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping="true"]):before{content:"";position:absolute;left:-50%;right:-50%;height:100%;z-index:-1}:where([data-sonner-toast][data-y-position="top"][data-swiping="true"]):before{bottom:50%;transform:scaleY(3) translateY(50%)}:where([data-sonner-toast][data-y-position="bottom"][data-swiping="true"]):before{top:50%;transform:scaleY(3) translateY(-50%)}:where([data-sonner-toast][data-swiping="false"][data-removed="true"]):before{content:"";position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast]):after{content:"";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted="true"]){--y: translateY(0);opacity:1}:where([data-sonner-toast][data-expanded="false"][data-front="false"]){--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity .4s}:where([data-sonner-toast][data-expanded="false"][data-front="false"][data-styled="true"])>*{opacity:0}:where([data-sonner-toast][data-visible="false"]){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted="true"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where([data-sonner-toast][data-removed="true"][data-front="true"][data-swipe-out="false"]){--y: translateY(calc(var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]){--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}:where([data-sonner-toast][data-removed="true"][data-front="false"]):before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y, 0px)) translate(var(--swipe-amount-x, 0px));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-bg-hover: hsl(0, 0%, 12%);--normal-border: hsl(0, 0%, 20%);--normal-border-hover: hsl(0, 0%, 25%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success],[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info],[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning],[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error],[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
`);
function wi(e) {
  return e.label !== void 0;
}
var lR = 3, cR = "32px", uR = "16px", Td = 4e3, dR = 356, fR = 14, hR = 20, pR = 200;
function Pt(...e) {
  return e.filter(Boolean).join(" ");
}
function mR(e) {
  let [t, n] = e.split("-"), r = [];
  return t && r.push(t), n && r.push(n), r;
}
var gR = (e) => {
  var t, n, r, i, o, s, a, l, c, u, d;
  let { invert: h, toast: f, unstyled: m, interacting: p, setHeights: b, visibleToasts: v, heights: x, index: w, toasts: E, expanded: T, removeToast: k, defaultRichColors: A, closeButton: D, style: F, cancelButtonStyle: P, actionButtonStyle: N, className: R = "", descriptionClassName: B = "", duration: j, position: H, gap: V, loadingIcon: I, expandByDefault: _, classNames: L, icons: S, closeButtonAriaLabel: ee = "Close toast", pauseWhenPageIsHidden: Y } = e, [C, q] = $.useState(null), [Z, ie] = $.useState(null), [W, ne] = $.useState(!1), [pe, se] = $.useState(!1), [ce, me] = $.useState(!1), [Me, We] = $.useState(!1), [ut, rt] = $.useState(!1), [vt, Wt] = $.useState(0), [dt, Cn] = $.useState(0), qt = $.useRef(f.duration || j || Td), Un = $.useRef(null), kt = $.useRef(null), Tr = w === 0, Tn = w + 1 <= v, M = f.type, U = f.dismissible !== !1, te = f.className || "", fe = f.descriptionClassName || "", ye = $.useMemo(() => x.findIndex((G) => G.toastId === f.id) || 0, [x, f.id]), et = $.useMemo(() => {
    var G;
    return (G = f.closeButton) != null ? G : D;
  }, [f.closeButton, D]), bt = $.useMemo(() => f.duration || j || Td, [f.duration, j]), qe = $.useRef(0), tt = $.useRef(0), Ct = $.useRef(0), Re = $.useRef(null), [Tt, K] = H.split("-"), we = $.useMemo(() => x.reduce((G, re, ae) => ae >= ye ? G : G + re.height, 0), [x, ye]), ke = eR(), ze = f.invert || h, it = M === "loading";
  tt.current = $.useMemo(() => ye * V + we, [ye, we]), $.useEffect(() => {
    qt.current = bt;
  }, [bt]), $.useEffect(() => {
    ne(!0);
  }, []), $.useEffect(() => {
    let G = kt.current;
    if (G) {
      let re = G.getBoundingClientRect().height;
      return Cn(re), b((ae) => [{ toastId: f.id, height: re, position: f.position }, ...ae]), () => b((ae) => ae.filter((Ne) => Ne.toastId !== f.id));
    }
  }, [b, f.id]), $.useLayoutEffect(() => {
    if (!W) return;
    let G = kt.current, re = G.style.height;
    G.style.height = "auto";
    let ae = G.getBoundingClientRect().height;
    G.style.height = re, Cn(ae), b((Ne) => Ne.find((_e) => _e.toastId === f.id) ? Ne.map((_e) => _e.toastId === f.id ? { ..._e, height: ae } : _e) : [{ toastId: f.id, height: ae, position: f.position }, ...Ne]);
  }, [W, f.title, f.description, b, f.id]);
  let Oe = $.useCallback(() => {
    se(!0), Wt(tt.current), b((G) => G.filter((re) => re.toastId !== f.id)), setTimeout(() => {
      k(f);
    }, pR);
  }, [f, k, b, tt]);
  $.useEffect(() => {
    if (f.promise && M === "loading" || f.duration === 1 / 0 || f.type === "loading") return;
    let G;
    return T || p || Y && ke ? (() => {
      if (Ct.current < qe.current) {
        let re = (/* @__PURE__ */ new Date()).getTime() - qe.current;
        qt.current = qt.current - re;
      }
      Ct.current = (/* @__PURE__ */ new Date()).getTime();
    })() : qt.current !== 1 / 0 && (qe.current = (/* @__PURE__ */ new Date()).getTime(), G = setTimeout(() => {
      var re;
      (re = f.onAutoClose) == null || re.call(f, f), Oe();
    }, qt.current)), () => clearTimeout(G);
  }, [T, p, f, M, Y, ke, Oe]), $.useEffect(() => {
    f.delete && Oe();
  }, [Oe, f.delete]);
  function ft() {
    var G, re, ae;
    return S != null && S.loading ? $.createElement("div", { className: Pt(L == null ? void 0 : L.loader, (G = f == null ? void 0 : f.classNames) == null ? void 0 : G.loader, "sonner-loader"), "data-visible": M === "loading" }, S.loading) : I ? $.createElement("div", { className: Pt(L == null ? void 0 : L.loader, (re = f == null ? void 0 : f.classNames) == null ? void 0 : re.loader, "sonner-loader"), "data-visible": M === "loading" }, I) : $.createElement(GA, { className: Pt(L == null ? void 0 : L.loader, (ae = f == null ? void 0 : f.classNames) == null ? void 0 : ae.loader), visible: M === "loading" });
  }
  return $.createElement("li", { tabIndex: 0, ref: kt, className: Pt(R, te, L == null ? void 0 : L.toast, (t = f == null ? void 0 : f.classNames) == null ? void 0 : t.toast, L == null ? void 0 : L.default, L == null ? void 0 : L[M], (n = f == null ? void 0 : f.classNames) == null ? void 0 : n[M]), "data-sonner-toast": "", "data-rich-colors": (r = f.richColors) != null ? r : A, "data-styled": !(f.jsx || f.unstyled || m), "data-mounted": W, "data-promise": !!f.promise, "data-swiped": ut, "data-removed": pe, "data-visible": Tn, "data-y-position": Tt, "data-x-position": K, "data-index": w, "data-front": Tr, "data-swiping": ce, "data-dismissible": U, "data-type": M, "data-invert": ze, "data-swipe-out": Me, "data-swipe-direction": Z, "data-expanded": !!(T || _ && W), style: { "--index": w, "--toasts-before": w, "--z-index": E.length - w, "--offset": `${pe ? vt : tt.current}px`, "--initial-height": _ ? "auto" : `${dt}px`, ...F, ...f.style }, onDragEnd: () => {
    me(!1), q(null), Re.current = null;
  }, onPointerDown: (G) => {
    it || !U || (Un.current = /* @__PURE__ */ new Date(), Wt(tt.current), G.target.setPointerCapture(G.pointerId), G.target.tagName !== "BUTTON" && (me(!0), Re.current = { x: G.clientX, y: G.clientY }));
  }, onPointerUp: () => {
    var G, re, ae, Ne;
    if (Me || !U) return;
    Re.current = null;
    let _e = Number(((G = kt.current) == null ? void 0 : G.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0), ot = Number(((re = kt.current) == null ? void 0 : re.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0), Kt = (/* @__PURE__ */ new Date()).getTime() - ((ae = Un.current) == null ? void 0 : ae.getTime()), Et = C === "x" ? _e : ot, on = Math.abs(Et) / Kt;
    if (Math.abs(Et) >= hR || on > 0.11) {
      Wt(tt.current), (Ne = f.onDismiss) == null || Ne.call(f, f), ie(C === "x" ? _e > 0 ? "right" : "left" : ot > 0 ? "down" : "up"), Oe(), We(!0), rt(!1);
      return;
    }
    me(!1), q(null);
  }, onPointerMove: (G) => {
    var re, ae, Ne, _e;
    if (!Re.current || !U || ((re = window.getSelection()) == null ? void 0 : re.toString().length) > 0) return;
    let ot = G.clientY - Re.current.y, Kt = G.clientX - Re.current.x, Et = (ae = e.swipeDirections) != null ? ae : mR(H);
    !C && (Math.abs(Kt) > 1 || Math.abs(ot) > 1) && q(Math.abs(Kt) > Math.abs(ot) ? "x" : "y");
    let on = { x: 0, y: 0 };
    C === "y" ? (Et.includes("top") || Et.includes("bottom")) && (Et.includes("top") && ot < 0 || Et.includes("bottom") && ot > 0) && (on.y = ot) : C === "x" && (Et.includes("left") || Et.includes("right")) && (Et.includes("left") && Kt < 0 || Et.includes("right") && Kt > 0) && (on.x = Kt), (Math.abs(on.x) > 0 || Math.abs(on.y) > 0) && rt(!0), (Ne = kt.current) == null || Ne.style.setProperty("--swipe-amount-x", `${on.x}px`), (_e = kt.current) == null || _e.style.setProperty("--swipe-amount-y", `${on.y}px`);
  } }, et && !f.jsx ? $.createElement("button", { "aria-label": ee, "data-disabled": it, "data-close-button": !0, onClick: it || !U ? () => {
  } : () => {
    var G;
    Oe(), (G = f.onDismiss) == null || G.call(f, f);
  }, className: Pt(L == null ? void 0 : L.closeButton, (i = f == null ? void 0 : f.classNames) == null ? void 0 : i.closeButton) }, (o = S == null ? void 0 : S.close) != null ? o : QA) : null, f.jsx || Pi(f.title) ? f.jsx ? f.jsx : typeof f.title == "function" ? f.title() : f.title : $.createElement($.Fragment, null, M || f.icon || f.promise ? $.createElement("div", { "data-icon": "", className: Pt(L == null ? void 0 : L.icon, (s = f == null ? void 0 : f.classNames) == null ? void 0 : s.icon) }, f.promise || f.type === "loading" && !f.icon ? f.icon || ft() : null, f.type !== "loading" ? f.icon || (S == null ? void 0 : S[M]) || qA(M) : null) : null, $.createElement("div", { "data-content": "", className: Pt(L == null ? void 0 : L.content, (a = f == null ? void 0 : f.classNames) == null ? void 0 : a.content) }, $.createElement("div", { "data-title": "", className: Pt(L == null ? void 0 : L.title, (l = f == null ? void 0 : f.classNames) == null ? void 0 : l.title) }, typeof f.title == "function" ? f.title() : f.title), f.description ? $.createElement("div", { "data-description": "", className: Pt(B, fe, L == null ? void 0 : L.description, (c = f == null ? void 0 : f.classNames) == null ? void 0 : c.description) }, typeof f.description == "function" ? f.description() : f.description) : null), Pi(f.cancel) ? f.cancel : f.cancel && wi(f.cancel) ? $.createElement("button", { "data-button": !0, "data-cancel": !0, style: f.cancelButtonStyle || P, onClick: (G) => {
    var re, ae;
    wi(f.cancel) && U && ((ae = (re = f.cancel).onClick) == null || ae.call(re, G), Oe());
  }, className: Pt(L == null ? void 0 : L.cancelButton, (u = f == null ? void 0 : f.classNames) == null ? void 0 : u.cancelButton) }, f.cancel.label) : null, Pi(f.action) ? f.action : f.action && wi(f.action) ? $.createElement("button", { "data-button": !0, "data-action": !0, style: f.actionButtonStyle || N, onClick: (G) => {
    var re, ae;
    wi(f.action) && ((ae = (re = f.action).onClick) == null || ae.call(re, G), !G.defaultPrevented && Oe());
  }, className: Pt(L == null ? void 0 : L.actionButton, (d = f == null ? void 0 : f.classNames) == null ? void 0 : d.actionButton) }, f.action.label) : null));
};
function Ed() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  let e = document.documentElement.getAttribute("dir");
  return e === "auto" || !e ? window.getComputedStyle(document.documentElement).direction : e;
}
function yR(e, t) {
  let n = {};
  return [e, t].forEach((r, i) => {
    let o = i === 1, s = o ? "--mobile-offset" : "--offset", a = o ? uR : cR;
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
dr(function(e, t) {
  let { invert: n, position: r = "bottom-right", hotkey: i = ["altKey", "KeyT"], expand: o, closeButton: s, className: a, offset: l, mobileOffset: c, theme: u = "light", richColors: d, duration: h, style: f, visibleToasts: m = lR, toastOptions: p, dir: b = Ed(), gap: v = fR, loadingIcon: x, icons: w, containerAriaLabel: E = "Notifications", pauseWhenPageIsHidden: T } = e, [k, A] = $.useState([]), D = $.useMemo(() => Array.from(new Set([r].concat(k.filter((Y) => Y.position).map((Y) => Y.position)))), [k, r]), [F, P] = $.useState([]), [N, R] = $.useState(!1), [B, j] = $.useState(!1), [H, V] = $.useState(u !== "system" ? u : typeof window < "u" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), I = $.useRef(null), _ = i.join("+").replace(/Key/g, "").replace(/Digit/g, ""), L = $.useRef(null), S = $.useRef(!1), ee = $.useCallback((Y) => {
    A((C) => {
      var q;
      return (q = C.find((Z) => Z.id === Y.id)) != null && q.delete || at.dismiss(Y.id), C.filter(({ id: Z }) => Z !== Y.id);
    });
  }, []);
  return $.useEffect(() => at.subscribe((Y) => {
    if (Y.dismiss) {
      A((C) => C.map((q) => q.id === Y.id ? { ...q, delete: !0 } : q));
      return;
    }
    setTimeout(() => {
      lf.flushSync(() => {
        A((C) => {
          let q = C.findIndex((Z) => Z.id === Y.id);
          return q !== -1 ? [...C.slice(0, q), { ...C[q], ...Y }, ...C.slice(q + 1)] : [Y, ...C];
        });
      });
    });
  }), []), $.useEffect(() => {
    if (u !== "system") {
      V(u);
      return;
    }
    if (u === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? V("dark") : V("light")), typeof window > "u") return;
    let Y = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      Y.addEventListener("change", ({ matches: C }) => {
        V(C ? "dark" : "light");
      });
    } catch {
      Y.addListener(({ matches: q }) => {
        try {
          V(q ? "dark" : "light");
        } catch (Z) {
          console.error(Z);
        }
      });
    }
  }, [u]), $.useEffect(() => {
    k.length <= 1 && R(!1);
  }, [k]), $.useEffect(() => {
    let Y = (C) => {
      var q, Z;
      i.every((ie) => C[ie] || C.code === ie) && (R(!0), (q = I.current) == null || q.focus()), C.code === "Escape" && (document.activeElement === I.current || (Z = I.current) != null && Z.contains(document.activeElement)) && R(!1);
    };
    return document.addEventListener("keydown", Y), () => document.removeEventListener("keydown", Y);
  }, [i]), $.useEffect(() => {
    if (I.current) return () => {
      L.current && (L.current.focus({ preventScroll: !0 }), L.current = null, S.current = !1);
    };
  }, [I.current]), $.createElement("section", { ref: t, "aria-label": `${E} ${_}`, tabIndex: -1, "aria-live": "polite", "aria-relevant": "additions text", "aria-atomic": "false", suppressHydrationWarning: !0 }, D.map((Y, C) => {
    var q;
    let [Z, ie] = Y.split("-");
    return k.length ? $.createElement("ol", { key: Y, dir: b === "auto" ? Ed() : b, tabIndex: -1, ref: I, className: a, "data-sonner-toaster": !0, "data-theme": H, "data-y-position": Z, "data-lifted": N && k.length > 1 && !o, "data-x-position": ie, style: { "--front-toast-height": `${((q = F[0]) == null ? void 0 : q.height) || 0}px`, "--width": `${dR}px`, "--gap": `${v}px`, ...f, ...yR(l, c) }, onBlur: (W) => {
      S.current && !W.currentTarget.contains(W.relatedTarget) && (S.current = !1, L.current && (L.current.focus({ preventScroll: !0 }), L.current = null));
    }, onFocus: (W) => {
      W.target instanceof HTMLElement && W.target.dataset.dismissible === "false" || S.current || (S.current = !0, L.current = W.relatedTarget);
    }, onMouseEnter: () => R(!0), onMouseMove: () => R(!0), onMouseLeave: () => {
      B || R(!1);
    }, onDragEnd: () => R(!1), onPointerDown: (W) => {
      W.target instanceof HTMLElement && W.target.dataset.dismissible === "false" || j(!0);
    }, onPointerUp: () => j(!1) }, k.filter((W) => !W.position && C === 0 || W.position === Y).map((W, ne) => {
      var pe, se;
      return $.createElement(gR, { key: W.id, icons: w, index: ne, toast: W, defaultRichColors: d, duration: (pe = p == null ? void 0 : p.duration) != null ? pe : h, className: p == null ? void 0 : p.className, descriptionClassName: p == null ? void 0 : p.descriptionClassName, invert: n, visibleToasts: m, closeButton: (se = p == null ? void 0 : p.closeButton) != null ? se : s, interacting: B, position: Y, style: p == null ? void 0 : p.style, unstyled: p == null ? void 0 : p.unstyled, classNames: p == null ? void 0 : p.classNames, cancelButtonStyle: p == null ? void 0 : p.cancelButtonStyle, actionButtonStyle: p == null ? void 0 : p.actionButtonStyle, removeToast: ee, toasts: k.filter((ce) => ce.position == W.position), heights: F.filter((ce) => ce.position == W.position), setHeights: P, expandByDefault: o, gap: v, loadingIcon: x, expanded: N, pauseWhenPageIsHidden: T, swipeDirections: e.swipeDirections });
    })) : null;
  }));
});
function vR({
  text: e,
  copyMessage: t = "Copied to clipboard!"
}) {
  const [n, r] = le(!1), i = Ae(null), o = Ve(() => {
    navigator.clipboard.writeText(e).then(() => {
      Cd.success(t), r(!0), i.current && (clearTimeout(i.current), i.current = null), i.current = setTimeout(() => {
        r(!1);
      }, 2e3);
    }).catch(() => {
      Cd.error("Failed to copy to clipboard.");
    });
  }, [e, t]);
  return { isCopied: n, handleCopy: o };
}
function Ji({ content: e, copyMessage: t }) {
  const { isCopied: n, handleCopy: r } = vR({
    text: e,
    copyMessage: t
  });
  return /* @__PURE__ */ O(
    $e,
    {
      variant: "ghost",
      size: "icon",
      className: "relative h-6 w-6",
      "aria-label": "Copy to clipboard",
      onClick: r,
      children: [
        /* @__PURE__ */ g("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ g(
          uf,
          {
            className: Q(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-100" : "scale-0"
            )
          }
        ) }),
        /* @__PURE__ */ g(
          ev,
          {
            className: Q(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-0" : "scale-100"
            )
          }
        )
      ]
    }
  );
}
function Ln(e) {
  const t = y.useRef(e);
  return y.useEffect(() => {
    t.current = e;
  }), y.useMemo(() => (...n) => {
    var r;
    return (r = t.current) == null ? void 0 : r.call(t, ...n);
  }, []);
}
function bR(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = Ln(e);
  y.useEffect(() => {
    const r = (i) => {
      i.key === "Escape" && n(i);
    };
    return t.addEventListener("keydown", r, { capture: !0 }), () => t.removeEventListener("keydown", r, { capture: !0 });
  }, [n, t]);
}
var xR = "DismissableLayer", la = "dismissableLayer.update", wR = "dismissableLayer.pointerDownOutside", SR = "dismissableLayer.focusOutside", Pd, hm = y.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), ai = y.forwardRef(
  (e, t) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: i,
      onFocusOutside: o,
      onInteractOutside: s,
      onDismiss: a,
      ...l
    } = e, c = y.useContext(hm), [u, d] = y.useState(null), h = (u == null ? void 0 : u.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, f] = y.useState({}), m = be(t, (A) => d(A)), p = Array.from(c.layers), [b] = [...c.layersWithOutsidePointerEventsDisabled].slice(-1), v = p.indexOf(b), x = u ? p.indexOf(u) : -1, w = c.layersWithOutsidePointerEventsDisabled.size > 0, E = x >= v, T = TR((A) => {
      const D = A.target, F = [...c.branches].some((P) => P.contains(D));
      !E || F || (i == null || i(A), s == null || s(A), A.defaultPrevented || a == null || a());
    }, h), k = ER((A) => {
      const D = A.target;
      [...c.branches].some((P) => P.contains(D)) || (o == null || o(A), s == null || s(A), A.defaultPrevented || a == null || a());
    }, h);
    return bR((A) => {
      x === c.layers.size - 1 && (r == null || r(A), !A.defaultPrevented && a && (A.preventDefault(), a()));
    }, h), y.useEffect(() => {
      if (u)
        return n && (c.layersWithOutsidePointerEventsDisabled.size === 0 && (Pd = h.body.style.pointerEvents, h.body.style.pointerEvents = "none"), c.layersWithOutsidePointerEventsDisabled.add(u)), c.layers.add(u), Ad(), () => {
          n && c.layersWithOutsidePointerEventsDisabled.size === 1 && (h.body.style.pointerEvents = Pd);
        };
    }, [u, h, n, c]), y.useEffect(() => () => {
      u && (c.layers.delete(u), c.layersWithOutsidePointerEventsDisabled.delete(u), Ad());
    }, [u, c]), y.useEffect(() => {
      const A = () => f({});
      return document.addEventListener(la, A), () => document.removeEventListener(la, A);
    }, []), /* @__PURE__ */ g(
      he.div,
      {
        ...l,
        ref: m,
        style: {
          pointerEvents: w ? E ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: oe(e.onFocusCapture, k.onFocusCapture),
        onBlurCapture: oe(e.onBlurCapture, k.onBlurCapture),
        onPointerDownCapture: oe(
          e.onPointerDownCapture,
          T.onPointerDownCapture
        )
      }
    );
  }
);
ai.displayName = xR;
var kR = "DismissableLayerBranch", CR = y.forwardRef((e, t) => {
  const n = y.useContext(hm), r = y.useRef(null), i = be(t, r);
  return y.useEffect(() => {
    const o = r.current;
    if (o)
      return n.branches.add(o), () => {
        n.branches.delete(o);
      };
  }, [n.branches]), /* @__PURE__ */ g(he.div, { ...e, ref: i });
});
CR.displayName = kR;
function TR(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = Ln(e), r = y.useRef(!1), i = y.useRef(() => {
  });
  return y.useEffect(() => {
    const o = (a) => {
      if (a.target && !r.current) {
        let l = function() {
          pm(
            wR,
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
function ER(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = Ln(e), r = y.useRef(!1);
  return y.useEffect(() => {
    const i = (o) => {
      o.target && !r.current && pm(SR, n, { originalEvent: o }, {
        discrete: !1
      });
    };
    return t.addEventListener("focusin", i), () => t.removeEventListener("focusin", i);
  }, [t, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function Ad() {
  const e = new CustomEvent(la);
  document.dispatchEvent(e);
}
function pm(e, t, n, { discrete: r }) {
  const i = n.originalEvent.target, o = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  t && i.addEventListener(e, t, { once: !0 }), r ? j1(i, o) : i.dispatchEvent(o);
}
var ks = 0;
function Ml() {
  y.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return document.body.insertAdjacentElement("afterbegin", e[0] ?? Rd()), document.body.insertAdjacentElement("beforeend", e[1] ?? Rd()), ks++, () => {
      ks === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((t) => t.remove()), ks--;
    };
  }, []);
}
function Rd() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var Cs = "focusScope.autoFocusOnMount", Ts = "focusScope.autoFocusOnUnmount", Nd = { bubbles: !1, cancelable: !0 }, PR = "FocusScope", No = y.forwardRef((e, t) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: i,
    onUnmountAutoFocus: o,
    ...s
  } = e, [a, l] = y.useState(null), c = Ln(i), u = Ln(o), d = y.useRef(null), h = be(t, (p) => l(p)), f = y.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  y.useEffect(() => {
    if (r) {
      let p = function(w) {
        if (f.paused || !a) return;
        const E = w.target;
        a.contains(E) ? d.current = E : dn(d.current, { select: !0 });
      }, b = function(w) {
        if (f.paused || !a) return;
        const E = w.relatedTarget;
        E !== null && (a.contains(E) || dn(d.current, { select: !0 }));
      }, v = function(w) {
        if (document.activeElement === document.body)
          for (const T of w)
            T.removedNodes.length > 0 && dn(a);
      };
      document.addEventListener("focusin", p), document.addEventListener("focusout", b);
      const x = new MutationObserver(v);
      return a && x.observe(a, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", p), document.removeEventListener("focusout", b), x.disconnect();
      };
    }
  }, [r, a, f.paused]), y.useEffect(() => {
    if (a) {
      Dd.add(f);
      const p = document.activeElement;
      if (!a.contains(p)) {
        const v = new CustomEvent(Cs, Nd);
        a.addEventListener(Cs, c), a.dispatchEvent(v), v.defaultPrevented || (AR(MR(mm(a)), { select: !0 }), document.activeElement === p && dn(a));
      }
      return () => {
        a.removeEventListener(Cs, c), setTimeout(() => {
          const v = new CustomEvent(Ts, Nd);
          a.addEventListener(Ts, u), a.dispatchEvent(v), v.defaultPrevented || dn(p ?? document.body, { select: !0 }), a.removeEventListener(Ts, u), Dd.remove(f);
        }, 0);
      };
    }
  }, [a, c, u, f]);
  const m = y.useCallback(
    (p) => {
      if (!n && !r || f.paused) return;
      const b = p.key === "Tab" && !p.altKey && !p.ctrlKey && !p.metaKey, v = document.activeElement;
      if (b && v) {
        const x = p.currentTarget, [w, E] = RR(x);
        w && E ? !p.shiftKey && v === E ? (p.preventDefault(), n && dn(w, { select: !0 })) : p.shiftKey && v === w && (p.preventDefault(), n && dn(E, { select: !0 })) : v === x && p.preventDefault();
      }
    },
    [n, r, f.paused]
  );
  return /* @__PURE__ */ g(he.div, { tabIndex: -1, ...s, ref: h, onKeyDown: m });
});
No.displayName = PR;
function AR(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e)
    if (dn(r, { select: t }), document.activeElement !== n) return;
}
function RR(e) {
  const t = mm(e), n = Id(t, e), r = Id(t.reverse(), e);
  return [n, r];
}
function mm(e) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const i = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || i ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Id(e, t) {
  for (const n of e)
    if (!NR(n, { upTo: t })) return n;
}
function NR(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function IR(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function dn(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== n && IR(e) && t && e.select();
  }
}
var Dd = DR();
function DR() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      t !== n && (n == null || n.pause()), e = Md(e, t), e.unshift(t);
    },
    remove(t) {
      var n;
      e = Md(e, t), (n = e[0]) == null || n.resume();
    }
  };
}
function Md(e, t) {
  const n = [...e], r = n.indexOf(t);
  return r !== -1 && n.splice(r, 1), n;
}
function MR(e) {
  return e.filter((t) => t.tagName !== "A");
}
const OR = ["top", "right", "bottom", "left"], yn = Math.min, pt = Math.max, Qi = Math.round, Si = Math.floor, $t = (e) => ({
  x: e,
  y: e
}), LR = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, _R = {
  start: "end",
  end: "start"
};
function ca(e, t, n) {
  return pt(e, yn(t, n));
}
function Qt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function en(e) {
  return e.split("-")[0];
}
function xr(e) {
  return e.split("-")[1];
}
function Ol(e) {
  return e === "x" ? "y" : "x";
}
function Ll(e) {
  return e === "y" ? "height" : "width";
}
const FR = /* @__PURE__ */ new Set(["top", "bottom"]);
function Ft(e) {
  return FR.has(en(e)) ? "y" : "x";
}
function _l(e) {
  return Ol(Ft(e));
}
function VR(e, t, n) {
  n === void 0 && (n = !1);
  const r = xr(e), i = _l(e), o = Ll(i);
  let s = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[o] > t.floating[o] && (s = eo(s)), [s, eo(s)];
}
function BR(e) {
  const t = eo(e);
  return [ua(e), t, ua(t)];
}
function ua(e) {
  return e.replace(/start|end/g, (t) => _R[t]);
}
const Od = ["left", "right"], Ld = ["right", "left"], zR = ["top", "bottom"], $R = ["bottom", "top"];
function jR(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Ld : Od : t ? Od : Ld;
    case "left":
    case "right":
      return t ? zR : $R;
    default:
      return [];
  }
}
function UR(e, t, n, r) {
  const i = xr(e);
  let o = jR(en(e), n === "start", r);
  return i && (o = o.map((s) => s + "-" + i), t && (o = o.concat(o.map(ua)))), o;
}
function eo(e) {
  return e.replace(/left|right|bottom|top/g, (t) => LR[t]);
}
function HR(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function gm(e) {
  return typeof e != "number" ? HR(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function to(e) {
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
function _d(e, t, n) {
  let {
    reference: r,
    floating: i
  } = e;
  const o = Ft(t), s = _l(t), a = Ll(s), l = en(t), c = o === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, h = r[a] / 2 - i[a] / 2;
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
  switch (xr(t)) {
    case "start":
      f[s] -= h * (n && c ? -1 : 1);
      break;
    case "end":
      f[s] += h * (n && c ? -1 : 1);
      break;
  }
  return f;
}
const WR = async (e, t, n) => {
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
  } = _d(c, r, l), h = r, f = {}, m = 0;
  for (let p = 0; p < a.length; p++) {
    const {
      name: b,
      fn: v
    } = a[p], {
      x,
      y: w,
      data: E,
      reset: T
    } = await v({
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
      [b]: {
        ...f[b],
        ...E
      }
    }, T && m <= 50 && (m++, typeof T == "object" && (T.placement && (h = T.placement), T.rects && (c = T.rects === !0 ? await s.getElementRects({
      reference: e,
      floating: t,
      strategy: i
    }) : T.rects), {
      x: u,
      y: d
    } = _d(c, h, l)), p = -1);
  }
  return {
    x: u,
    y: d,
    placement: h,
    strategy: i,
    middlewareData: f
  };
};
async function Yr(e, t) {
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
  } = Qt(t, e), m = gm(f), b = a[h ? d === "floating" ? "reference" : "floating" : d], v = to(await o.getClippingRect({
    element: (n = await (o.isElement == null ? void 0 : o.isElement(b))) == null || n ? b : b.contextElement || await (o.getDocumentElement == null ? void 0 : o.getDocumentElement(a.floating)),
    boundary: c,
    rootBoundary: u,
    strategy: l
  })), x = d === "floating" ? {
    x: r,
    y: i,
    width: s.floating.width,
    height: s.floating.height
  } : s.reference, w = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(a.floating)), E = await (o.isElement == null ? void 0 : o.isElement(w)) ? await (o.getScale == null ? void 0 : o.getScale(w)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, T = to(o.convertOffsetParentRelativeRectToViewportRelativeRect ? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: a,
    rect: x,
    offsetParent: w,
    strategy: l
  }) : x);
  return {
    top: (v.top - T.top + m.top) / E.y,
    bottom: (T.bottom - v.bottom + m.bottom) / E.y,
    left: (v.left - T.left + m.left) / E.x,
    right: (T.right - v.right + m.right) / E.x
  };
}
const qR = (e) => ({
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
    } = Qt(e, t) || {};
    if (c == null)
      return {};
    const d = gm(u), h = {
      x: n,
      y: r
    }, f = _l(i), m = Ll(f), p = await s.getDimensions(c), b = f === "y", v = b ? "top" : "left", x = b ? "bottom" : "right", w = b ? "clientHeight" : "clientWidth", E = o.reference[m] + o.reference[f] - h[f] - o.floating[m], T = h[f] - o.reference[f], k = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c));
    let A = k ? k[w] : 0;
    (!A || !await (s.isElement == null ? void 0 : s.isElement(k))) && (A = a.floating[w] || o.floating[m]);
    const D = E / 2 - T / 2, F = A / 2 - p[m] / 2 - 1, P = yn(d[v], F), N = yn(d[x], F), R = P, B = A - p[m] - N, j = A / 2 - p[m] / 2 + D, H = ca(R, j, B), V = !l.arrow && xr(i) != null && j !== H && o.reference[m] / 2 - (j < R ? P : N) - p[m] / 2 < 0, I = V ? j < R ? j - R : j - B : 0;
    return {
      [f]: h[f] + I,
      data: {
        [f]: H,
        centerOffset: j - H - I,
        ...V && {
          alignmentOffset: I
        }
      },
      reset: V
    };
  }
}), KR = function(e) {
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
        ...b
      } = Qt(e, t);
      if ((n = o.arrow) != null && n.alignmentOffset)
        return {};
      const v = en(i), x = Ft(a), w = en(a) === a, E = await (l.isRTL == null ? void 0 : l.isRTL(c.floating)), T = h || (w || !p ? [eo(a)] : BR(a)), k = m !== "none";
      !h && k && T.push(...UR(a, p, m, E));
      const A = [a, ...T], D = await Yr(t, b), F = [];
      let P = ((r = o.flip) == null ? void 0 : r.overflows) || [];
      if (u && F.push(D[v]), d) {
        const j = VR(i, s, E);
        F.push(D[j[0]], D[j[1]]);
      }
      if (P = [...P, {
        placement: i,
        overflows: F
      }], !F.every((j) => j <= 0)) {
        var N, R;
        const j = (((N = o.flip) == null ? void 0 : N.index) || 0) + 1, H = A[j];
        if (H && (!(d === "alignment" ? x !== Ft(H) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        P.every((_) => Ft(_.placement) === x ? _.overflows[0] > 0 : !0)))
          return {
            data: {
              index: j,
              overflows: P
            },
            reset: {
              placement: H
            }
          };
        let V = (R = P.filter((I) => I.overflows[0] <= 0).sort((I, _) => I.overflows[1] - _.overflows[1])[0]) == null ? void 0 : R.placement;
        if (!V)
          switch (f) {
            case "bestFit": {
              var B;
              const I = (B = P.filter((_) => {
                if (k) {
                  const L = Ft(_.placement);
                  return L === x || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  L === "y";
                }
                return !0;
              }).map((_) => [_.placement, _.overflows.filter((L) => L > 0).reduce((L, S) => L + S, 0)]).sort((_, L) => _[1] - L[1])[0]) == null ? void 0 : B[0];
              I && (V = I);
              break;
            }
            case "initialPlacement":
              V = a;
              break;
          }
        if (i !== V)
          return {
            reset: {
              placement: V
            }
          };
      }
      return {};
    }
  };
};
function Fd(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Vd(e) {
  return OR.some((t) => e[t] >= 0);
}
const GR = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n
      } = t, {
        strategy: r = "referenceHidden",
        ...i
      } = Qt(e, t);
      switch (r) {
        case "referenceHidden": {
          const o = await Yr(t, {
            ...i,
            elementContext: "reference"
          }), s = Fd(o, n.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: Vd(s)
            }
          };
        }
        case "escaped": {
          const o = await Yr(t, {
            ...i,
            altBoundary: !0
          }), s = Fd(o, n.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: Vd(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, ym = /* @__PURE__ */ new Set(["left", "top"]);
async function YR(e, t) {
  const {
    placement: n,
    platform: r,
    elements: i
  } = e, o = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), s = en(n), a = xr(n), l = Ft(n) === "y", c = ym.has(s) ? -1 : 1, u = o && l ? -1 : 1, d = Qt(t, e);
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
const XR = function(e) {
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
      } = t, l = await YR(t, e);
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
}, ZR = function(e) {
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
          fn: (b) => {
            let {
              x: v,
              y: x
            } = b;
            return {
              x: v,
              y: x
            };
          }
        },
        ...l
      } = Qt(e, t), c = {
        x: n,
        y: r
      }, u = await Yr(t, l), d = Ft(en(i)), h = Ol(d);
      let f = c[h], m = c[d];
      if (o) {
        const b = h === "y" ? "top" : "left", v = h === "y" ? "bottom" : "right", x = f + u[b], w = f - u[v];
        f = ca(x, f, w);
      }
      if (s) {
        const b = d === "y" ? "top" : "left", v = d === "y" ? "bottom" : "right", x = m + u[b], w = m - u[v];
        m = ca(x, m, w);
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
}, JR = function(e) {
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
      } = Qt(e, t), u = {
        x: n,
        y: r
      }, d = Ft(i), h = Ol(d);
      let f = u[h], m = u[d];
      const p = Qt(a, t), b = typeof p == "number" ? {
        mainAxis: p,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...p
      };
      if (l) {
        const w = h === "y" ? "height" : "width", E = o.reference[h] - o.floating[w] + b.mainAxis, T = o.reference[h] + o.reference[w] - b.mainAxis;
        f < E ? f = E : f > T && (f = T);
      }
      if (c) {
        var v, x;
        const w = h === "y" ? "width" : "height", E = ym.has(en(i)), T = o.reference[d] - o.floating[w] + (E && ((v = s.offset) == null ? void 0 : v[d]) || 0) + (E ? 0 : b.crossAxis), k = o.reference[d] + o.reference[w] + (E ? 0 : ((x = s.offset) == null ? void 0 : x[d]) || 0) - (E ? b.crossAxis : 0);
        m < T ? m = T : m > k && (m = k);
      }
      return {
        [h]: f,
        [d]: m
      };
    }
  };
}, QR = function(e) {
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
      } = Qt(e, t), u = await Yr(t, c), d = en(i), h = xr(i), f = Ft(i) === "y", {
        width: m,
        height: p
      } = o.floating;
      let b, v;
      d === "top" || d === "bottom" ? (b = d, v = h === (await (s.isRTL == null ? void 0 : s.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (v = d, b = h === "end" ? "top" : "bottom");
      const x = p - u.top - u.bottom, w = m - u.left - u.right, E = yn(p - u[b], x), T = yn(m - u[v], w), k = !t.middlewareData.shift;
      let A = E, D = T;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (D = w), (r = t.middlewareData.shift) != null && r.enabled.y && (A = x), k && !h) {
        const P = pt(u.left, 0), N = pt(u.right, 0), R = pt(u.top, 0), B = pt(u.bottom, 0);
        f ? D = m - 2 * (P !== 0 || N !== 0 ? P + N : pt(u.left, u.right)) : A = p - 2 * (R !== 0 || B !== 0 ? R + B : pt(u.top, u.bottom));
      }
      await l({
        ...t,
        availableWidth: D,
        availableHeight: A
      });
      const F = await s.getDimensions(a.floating);
      return m !== F.width || p !== F.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Io() {
  return typeof window < "u";
}
function wr(e) {
  return vm(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function gt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Ht(e) {
  var t;
  return (t = (vm(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function vm(e) {
  return Io() ? e instanceof Node || e instanceof gt(e).Node : !1;
}
function Dt(e) {
  return Io() ? e instanceof Element || e instanceof gt(e).Element : !1;
}
function jt(e) {
  return Io() ? e instanceof HTMLElement || e instanceof gt(e).HTMLElement : !1;
}
function Bd(e) {
  return !Io() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof gt(e).ShadowRoot;
}
const eN = /* @__PURE__ */ new Set(["inline", "contents"]);
function li(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: i
  } = Mt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !eN.has(i);
}
const tN = /* @__PURE__ */ new Set(["table", "td", "th"]);
function nN(e) {
  return tN.has(wr(e));
}
const rN = [":popover-open", ":modal"];
function Do(e) {
  return rN.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
const iN = ["transform", "translate", "scale", "rotate", "perspective"], oN = ["transform", "translate", "scale", "rotate", "perspective", "filter"], sN = ["paint", "layout", "strict", "content"];
function Fl(e) {
  const t = Vl(), n = Dt(e) ? Mt(e) : e;
  return iN.some((r) => n[r] ? n[r] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || oN.some((r) => (n.willChange || "").includes(r)) || sN.some((r) => (n.contain || "").includes(r));
}
function aN(e) {
  let t = vn(e);
  for (; jt(t) && !lr(t); ) {
    if (Fl(t))
      return t;
    if (Do(t))
      return null;
    t = vn(t);
  }
  return null;
}
function Vl() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
const lN = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function lr(e) {
  return lN.has(wr(e));
}
function Mt(e) {
  return gt(e).getComputedStyle(e);
}
function Mo(e) {
  return Dt(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function vn(e) {
  if (wr(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Bd(e) && e.host || // Fallback.
    Ht(e)
  );
  return Bd(t) ? t.host : t;
}
function bm(e) {
  const t = vn(e);
  return lr(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : jt(t) && li(t) ? t : bm(t);
}
function Xr(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const i = bm(e), o = i === ((r = e.ownerDocument) == null ? void 0 : r.body), s = gt(i);
  if (o) {
    const a = da(s);
    return t.concat(s, s.visualViewport || [], li(i) ? i : [], a && n ? Xr(a) : []);
  }
  return t.concat(i, Xr(i, [], n));
}
function da(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function xm(e) {
  const t = Mt(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const i = jt(e), o = i ? e.offsetWidth : n, s = i ? e.offsetHeight : r, a = Qi(n) !== o || Qi(r) !== s;
  return a && (n = o, r = s), {
    width: n,
    height: r,
    $: a
  };
}
function Bl(e) {
  return Dt(e) ? e : e.contextElement;
}
function nr(e) {
  const t = Bl(e);
  if (!jt(t))
    return $t(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: i,
    $: o
  } = xm(t);
  let s = (o ? Qi(n.width) : n.width) / r, a = (o ? Qi(n.height) : n.height) / i;
  return (!s || !Number.isFinite(s)) && (s = 1), (!a || !Number.isFinite(a)) && (a = 1), {
    x: s,
    y: a
  };
}
const cN = /* @__PURE__ */ $t(0);
function wm(e) {
  const t = gt(e);
  return !Vl() || !t.visualViewport ? cN : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function uN(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== gt(e) ? !1 : t;
}
function _n(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const i = e.getBoundingClientRect(), o = Bl(e);
  let s = $t(1);
  t && (r ? Dt(r) && (s = nr(r)) : s = nr(e));
  const a = uN(o, n, r) ? wm(o) : $t(0);
  let l = (i.left + a.x) / s.x, c = (i.top + a.y) / s.y, u = i.width / s.x, d = i.height / s.y;
  if (o) {
    const h = gt(o), f = r && Dt(r) ? gt(r) : r;
    let m = h, p = da(m);
    for (; p && r && f !== m; ) {
      const b = nr(p), v = p.getBoundingClientRect(), x = Mt(p), w = v.left + (p.clientLeft + parseFloat(x.paddingLeft)) * b.x, E = v.top + (p.clientTop + parseFloat(x.paddingTop)) * b.y;
      l *= b.x, c *= b.y, u *= b.x, d *= b.y, l += w, c += E, m = gt(p), p = da(m);
    }
  }
  return to({
    width: u,
    height: d,
    x: l,
    y: c
  });
}
function Oo(e, t) {
  const n = Mo(e).scrollLeft;
  return t ? t.left + n : _n(Ht(e)).left + n;
}
function Sm(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - Oo(e, n), i = n.top + t.scrollTop;
  return {
    x: r,
    y: i
  };
}
function dN(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: i
  } = e;
  const o = i === "fixed", s = Ht(r), a = t ? Do(t.floating) : !1;
  if (r === s || a && o)
    return n;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = $t(1);
  const u = $t(0), d = jt(r);
  if ((d || !d && !o) && ((wr(r) !== "body" || li(s)) && (l = Mo(r)), jt(r))) {
    const f = _n(r);
    c = nr(r), u.x = f.x + r.clientLeft, u.y = f.y + r.clientTop;
  }
  const h = s && !d && !o ? Sm(s, l) : $t(0);
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - l.scrollLeft * c.x + u.x + h.x,
    y: n.y * c.y - l.scrollTop * c.y + u.y + h.y
  };
}
function fN(e) {
  return Array.from(e.getClientRects());
}
function hN(e) {
  const t = Ht(e), n = Mo(e), r = e.ownerDocument.body, i = pt(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), o = pt(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + Oo(e);
  const a = -n.scrollTop;
  return Mt(r).direction === "rtl" && (s += pt(t.clientWidth, r.clientWidth) - i), {
    width: i,
    height: o,
    x: s,
    y: a
  };
}
const zd = 25;
function pN(e, t) {
  const n = gt(e), r = Ht(e), i = n.visualViewport;
  let o = r.clientWidth, s = r.clientHeight, a = 0, l = 0;
  if (i) {
    o = i.width, s = i.height;
    const u = Vl();
    (!u || u && t === "fixed") && (a = i.offsetLeft, l = i.offsetTop);
  }
  const c = Oo(r);
  if (c <= 0) {
    const u = r.ownerDocument, d = u.body, h = getComputedStyle(d), f = u.compatMode === "CSS1Compat" && parseFloat(h.marginLeft) + parseFloat(h.marginRight) || 0, m = Math.abs(r.clientWidth - d.clientWidth - f);
    m <= zd && (o -= m);
  } else c <= zd && (o += c);
  return {
    width: o,
    height: s,
    x: a,
    y: l
  };
}
const mN = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function gN(e, t) {
  const n = _n(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, o = jt(e) ? nr(e) : $t(1), s = e.clientWidth * o.x, a = e.clientHeight * o.y, l = i * o.x, c = r * o.y;
  return {
    width: s,
    height: a,
    x: l,
    y: c
  };
}
function $d(e, t, n) {
  let r;
  if (t === "viewport")
    r = pN(e, n);
  else if (t === "document")
    r = hN(Ht(e));
  else if (Dt(t))
    r = gN(t, n);
  else {
    const i = wm(e);
    r = {
      x: t.x - i.x,
      y: t.y - i.y,
      width: t.width,
      height: t.height
    };
  }
  return to(r);
}
function km(e, t) {
  const n = vn(e);
  return n === t || !Dt(n) || lr(n) ? !1 : Mt(n).position === "fixed" || km(n, t);
}
function yN(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = Xr(e, [], !1).filter((a) => Dt(a) && wr(a) !== "body"), i = null;
  const o = Mt(e).position === "fixed";
  let s = o ? vn(e) : e;
  for (; Dt(s) && !lr(s); ) {
    const a = Mt(s), l = Fl(s);
    !l && a.position === "fixed" && (i = null), (o ? !l && !i : !l && a.position === "static" && !!i && mN.has(i.position) || li(s) && !l && km(e, s)) ? r = r.filter((u) => u !== s) : i = a, s = vn(s);
  }
  return t.set(e, r), r;
}
function vN(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: i
  } = e;
  const s = [...n === "clippingAncestors" ? Do(t) ? [] : yN(t, this._c) : [].concat(n), r], a = s[0], l = s.reduce((c, u) => {
    const d = $d(t, u, i);
    return c.top = pt(d.top, c.top), c.right = yn(d.right, c.right), c.bottom = yn(d.bottom, c.bottom), c.left = pt(d.left, c.left), c;
  }, $d(t, a, i));
  return {
    width: l.right - l.left,
    height: l.bottom - l.top,
    x: l.left,
    y: l.top
  };
}
function bN(e) {
  const {
    width: t,
    height: n
  } = xm(e);
  return {
    width: t,
    height: n
  };
}
function xN(e, t, n) {
  const r = jt(t), i = Ht(t), o = n === "fixed", s = _n(e, !0, o, t);
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = $t(0);
  function c() {
    l.x = Oo(i);
  }
  if (r || !r && !o)
    if ((wr(t) !== "body" || li(i)) && (a = Mo(t)), r) {
      const f = _n(t, !0, o, t);
      l.x = f.x + t.clientLeft, l.y = f.y + t.clientTop;
    } else i && c();
  o && !r && i && c();
  const u = i && !r && !o ? Sm(i, a) : $t(0), d = s.left + a.scrollLeft - l.x - u.x, h = s.top + a.scrollTop - l.y - u.y;
  return {
    x: d,
    y: h,
    width: s.width,
    height: s.height
  };
}
function Es(e) {
  return Mt(e).position === "static";
}
function jd(e, t) {
  if (!jt(e) || Mt(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Ht(e) === n && (n = n.ownerDocument.body), n;
}
function Cm(e, t) {
  const n = gt(e);
  if (Do(e))
    return n;
  if (!jt(e)) {
    let i = vn(e);
    for (; i && !lr(i); ) {
      if (Dt(i) && !Es(i))
        return i;
      i = vn(i);
    }
    return n;
  }
  let r = jd(e, t);
  for (; r && nN(r) && Es(r); )
    r = jd(r, t);
  return r && lr(r) && Es(r) && !Fl(r) ? n : r || aN(e) || n;
}
const wN = async function(e) {
  const t = this.getOffsetParent || Cm, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: xN(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function SN(e) {
  return Mt(e).direction === "rtl";
}
const kN = {
  convertOffsetParentRelativeRectToViewportRelativeRect: dN,
  getDocumentElement: Ht,
  getClippingRect: vN,
  getOffsetParent: Cm,
  getElementRects: wN,
  getClientRects: fN,
  getDimensions: bN,
  getScale: nr,
  isElement: Dt,
  isRTL: SN
};
function Tm(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function CN(e, t) {
  let n = null, r;
  const i = Ht(e);
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
    const m = Si(d), p = Si(i.clientWidth - (u + h)), b = Si(i.clientHeight - (d + f)), v = Si(u), w = {
      rootMargin: -m + "px " + -p + "px " + -b + "px " + -v + "px",
      threshold: pt(0, yn(1, l)) || 1
    };
    let E = !0;
    function T(k) {
      const A = k[0].intersectionRatio;
      if (A !== l) {
        if (!E)
          return s();
        A ? s(!1, A) : r = setTimeout(() => {
          s(!1, 1e-7);
        }, 1e3);
      }
      A === 1 && !Tm(c, e.getBoundingClientRect()) && s(), E = !1;
    }
    try {
      n = new IntersectionObserver(T, {
        ...w,
        // Handle <iframe>s
        root: i.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(T, w);
    }
    n.observe(e);
  }
  return s(!0), o;
}
function TN(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: i = !0,
    ancestorResize: o = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: a = typeof IntersectionObserver == "function",
    animationFrame: l = !1
  } = r, c = Bl(e), u = i || o ? [...c ? Xr(c) : [], ...Xr(t)] : [];
  u.forEach((v) => {
    i && v.addEventListener("scroll", n, {
      passive: !0
    }), o && v.addEventListener("resize", n);
  });
  const d = c && a ? CN(c, n) : null;
  let h = -1, f = null;
  s && (f = new ResizeObserver((v) => {
    let [x] = v;
    x && x.target === c && f && (f.unobserve(t), cancelAnimationFrame(h), h = requestAnimationFrame(() => {
      var w;
      (w = f) == null || w.observe(t);
    })), n();
  }), c && !l && f.observe(c), f.observe(t));
  let m, p = l ? _n(e) : null;
  l && b();
  function b() {
    const v = _n(e);
    p && !Tm(p, v) && n(), p = v, m = requestAnimationFrame(b);
  }
  return n(), () => {
    var v;
    u.forEach((x) => {
      i && x.removeEventListener("scroll", n), o && x.removeEventListener("resize", n);
    }), d == null || d(), (v = f) == null || v.disconnect(), f = null, l && cancelAnimationFrame(m);
  };
}
const EN = XR, PN = ZR, AN = KR, RN = QR, NN = GR, Ud = qR, IN = JR, DN = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), i = {
    platform: kN,
    ...n
  }, o = {
    ...i.platform,
    _c: r
  };
  return WR(e, t, {
    ...i,
    platform: o
  });
};
var MN = typeof document < "u", ON = function() {
}, Mi = MN ? Ea : ON;
function no(e, t) {
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
        if (!no(e[r], t[r]))
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
      if (!(o === "_owner" && e.$$typeof) && !no(e[o], t[o]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Em(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Hd(e, t) {
  const n = Em(e);
  return Math.round(t * n) / n;
}
function Ps(e) {
  const t = y.useRef(e);
  return Mi(() => {
    t.current = e;
  }), t;
}
function LN(e) {
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
  } = e, [u, d] = y.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [h, f] = y.useState(r);
  no(h, r) || f(r);
  const [m, p] = y.useState(null), [b, v] = y.useState(null), x = y.useCallback((_) => {
    _ !== k.current && (k.current = _, p(_));
  }, []), w = y.useCallback((_) => {
    _ !== A.current && (A.current = _, v(_));
  }, []), E = o || m, T = s || b, k = y.useRef(null), A = y.useRef(null), D = y.useRef(u), F = l != null, P = Ps(l), N = Ps(i), R = Ps(c), B = y.useCallback(() => {
    if (!k.current || !A.current)
      return;
    const _ = {
      placement: t,
      strategy: n,
      middleware: h
    };
    N.current && (_.platform = N.current), DN(k.current, A.current, _).then((L) => {
      const S = {
        ...L,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: R.current !== !1
      };
      j.current && !no(D.current, S) && (D.current = S, ho.flushSync(() => {
        d(S);
      }));
    });
  }, [h, t, n, N, R]);
  Mi(() => {
    c === !1 && D.current.isPositioned && (D.current.isPositioned = !1, d((_) => ({
      ..._,
      isPositioned: !1
    })));
  }, [c]);
  const j = y.useRef(!1);
  Mi(() => (j.current = !0, () => {
    j.current = !1;
  }), []), Mi(() => {
    if (E && (k.current = E), T && (A.current = T), E && T) {
      if (P.current)
        return P.current(E, T, B);
      B();
    }
  }, [E, T, B, P, F]);
  const H = y.useMemo(() => ({
    reference: k,
    floating: A,
    setReference: x,
    setFloating: w
  }), [x, w]), V = y.useMemo(() => ({
    reference: E,
    floating: T
  }), [E, T]), I = y.useMemo(() => {
    const _ = {
      position: n,
      left: 0,
      top: 0
    };
    if (!V.floating)
      return _;
    const L = Hd(V.floating, u.x), S = Hd(V.floating, u.y);
    return a ? {
      ..._,
      transform: "translate(" + L + "px, " + S + "px)",
      ...Em(V.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: L,
      top: S
    };
  }, [n, a, V.floating, u.x, u.y]);
  return y.useMemo(() => ({
    ...u,
    update: B,
    refs: H,
    elements: V,
    floatingStyles: I
  }), [u, B, H, V, I]);
}
const _N = (e) => {
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
      return r && t(r) ? r.current != null ? Ud({
        element: r.current,
        padding: i
      }).fn(n) : {} : r ? Ud({
        element: r,
        padding: i
      }).fn(n) : {};
    }
  };
}, FN = (e, t) => ({
  ...EN(e),
  options: [e, t]
}), VN = (e, t) => ({
  ...PN(e),
  options: [e, t]
}), BN = (e, t) => ({
  ...IN(e),
  options: [e, t]
}), zN = (e, t) => ({
  ...AN(e),
  options: [e, t]
}), $N = (e, t) => ({
  ...RN(e),
  options: [e, t]
}), jN = (e, t) => ({
  ...NN(e),
  options: [e, t]
}), UN = (e, t) => ({
  ..._N(e),
  options: [e, t]
});
var HN = "Arrow", Pm = y.forwardRef((e, t) => {
  const { children: n, width: r = 10, height: i = 5, ...o } = e;
  return /* @__PURE__ */ g(
    he.svg,
    {
      ...o,
      ref: t,
      width: r,
      height: i,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : /* @__PURE__ */ g("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Pm.displayName = HN;
var WN = Pm;
function zl(e) {
  const [t, n] = y.useState(void 0);
  return He(() => {
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
var $l = "Popper", [Am, Sr] = tn($l), [qN, Rm] = Am($l), Nm = (e) => {
  const { __scopePopper: t, children: n } = e, [r, i] = y.useState(null);
  return /* @__PURE__ */ g(qN, { scope: t, anchor: r, onAnchorChange: i, children: n });
};
Nm.displayName = $l;
var Im = "PopperAnchor", Dm = y.forwardRef(
  (e, t) => {
    const { __scopePopper: n, virtualRef: r, ...i } = e, o = Rm(Im, n), s = y.useRef(null), a = be(t, s), l = y.useRef(null);
    return y.useEffect(() => {
      const c = l.current;
      l.current = (r == null ? void 0 : r.current) || s.current, c !== l.current && o.onAnchorChange(l.current);
    }), r ? null : /* @__PURE__ */ g(he.div, { ...i, ref: a });
  }
);
Dm.displayName = Im;
var jl = "PopperContent", [KN, GN] = Am(jl), Mm = y.forwardRef(
  (e, t) => {
    var W, ne, pe, se, ce, me;
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
    } = e, b = Rm(jl, n), [v, x] = y.useState(null), w = be(t, (Me) => x(Me)), [E, T] = y.useState(null), k = zl(E), A = (k == null ? void 0 : k.width) ?? 0, D = (k == null ? void 0 : k.height) ?? 0, F = r + (o !== "center" ? "-" + o : ""), P = typeof u == "number" ? u : { top: 0, right: 0, bottom: 0, left: 0, ...u }, N = Array.isArray(c) ? c : [c], R = N.length > 0, B = {
      padding: P,
      boundary: N.filter(XN),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: R
    }, { refs: j, floatingStyles: H, placement: V, isPositioned: I, middlewareData: _ } = LN({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: F,
      whileElementsMounted: (...Me) => TN(...Me, {
        animationFrame: f === "always"
      }),
      elements: {
        reference: b.anchor
      },
      middleware: [
        FN({ mainAxis: i + D, alignmentAxis: s }),
        l && VN({
          mainAxis: !0,
          crossAxis: !1,
          limiter: d === "partial" ? BN() : void 0,
          ...B
        }),
        l && zN({ ...B }),
        $N({
          ...B,
          apply: ({ elements: Me, rects: We, availableWidth: ut, availableHeight: rt }) => {
            const { width: vt, height: Wt } = We.reference, dt = Me.floating.style;
            dt.setProperty("--radix-popper-available-width", `${ut}px`), dt.setProperty("--radix-popper-available-height", `${rt}px`), dt.setProperty("--radix-popper-anchor-width", `${vt}px`), dt.setProperty("--radix-popper-anchor-height", `${Wt}px`);
          }
        }),
        E && UN({ element: E, padding: a }),
        ZN({ arrowWidth: A, arrowHeight: D }),
        h && jN({ strategy: "referenceHidden", ...B })
      ]
    }), [L, S] = _m(V), ee = Ln(m);
    He(() => {
      I && (ee == null || ee());
    }, [I, ee]);
    const Y = (W = _.arrow) == null ? void 0 : W.x, C = (ne = _.arrow) == null ? void 0 : ne.y, q = ((pe = _.arrow) == null ? void 0 : pe.centerOffset) !== 0, [Z, ie] = y.useState();
    return He(() => {
      v && ie(window.getComputedStyle(v).zIndex);
    }, [v]), /* @__PURE__ */ g(
      "div",
      {
        ref: j.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...H,
          transform: I ? H.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: Z,
          "--radix-popper-transform-origin": [
            (se = _.transformOrigin) == null ? void 0 : se.x,
            (ce = _.transformOrigin) == null ? void 0 : ce.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...((me = _.hide) == null ? void 0 : me.referenceHidden) && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ g(
          KN,
          {
            scope: n,
            placedSide: L,
            onArrowChange: T,
            arrowX: Y,
            arrowY: C,
            shouldHideArrow: q,
            children: /* @__PURE__ */ g(
              he.div,
              {
                "data-side": L,
                "data-align": S,
                ...p,
                ref: w,
                style: {
                  ...p.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: I ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
Mm.displayName = jl;
var Om = "PopperArrow", YN = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, Lm = y.forwardRef(function(t, n) {
  const { __scopePopper: r, ...i } = t, o = GN(Om, r), s = YN[o.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ g(
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
        children: /* @__PURE__ */ g(
          WN,
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
Lm.displayName = Om;
function XN(e) {
  return e !== null;
}
var ZN = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    var b, v, x;
    const { placement: n, rects: r, middlewareData: i } = t, s = ((b = i.arrow) == null ? void 0 : b.centerOffset) !== 0, a = s ? 0 : e.arrowWidth, l = s ? 0 : e.arrowHeight, [c, u] = _m(n), d = { start: "0%", center: "50%", end: "100%" }[u], h = (((v = i.arrow) == null ? void 0 : v.x) ?? 0) + a / 2, f = (((x = i.arrow) == null ? void 0 : x.y) ?? 0) + l / 2;
    let m = "", p = "";
    return c === "bottom" ? (m = s ? d : `${h}px`, p = `${-l}px`) : c === "top" ? (m = s ? d : `${h}px`, p = `${r.floating.height + l}px`) : c === "right" ? (m = `${-l}px`, p = s ? d : `${f}px`) : c === "left" && (m = `${r.floating.width + l}px`, p = s ? d : `${f}px`), { data: { x: m, y: p } };
  }
});
function _m(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var Ul = Nm, Lo = Dm, Hl = Mm, Wl = Lm, JN = "Portal", ci = y.forwardRef((e, t) => {
  var a;
  const { container: n, ...r } = e, [i, o] = y.useState(!1);
  He(() => o(!0), []);
  const s = n || i && ((a = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : a.body);
  return s ? lf.createPortal(/* @__PURE__ */ g(he.div, { ...r, ref: t }), s) : null;
});
ci.displayName = JN;
// @__NO_SIDE_EFFECTS__
function QN(e) {
  const t = /* @__PURE__ */ eI(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(nI);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function eI(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = iI(i), a = rI(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? zn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var tI = Symbol("radix.slottable");
function nI(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === tI;
}
function rI(e, t) {
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
function iI(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var oI = function(e) {
  if (typeof document > "u")
    return null;
  var t = Array.isArray(e) ? e[0] : e;
  return t.ownerDocument.body;
}, Wn = /* @__PURE__ */ new WeakMap(), ki = /* @__PURE__ */ new WeakMap(), Ci = {}, As = 0, Fm = function(e) {
  return e && (e.host || Fm(e.parentNode));
}, sI = function(e, t) {
  return t.map(function(n) {
    if (e.contains(n))
      return n;
    var r = Fm(n);
    return r && e.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, aI = function(e, t, n, r) {
  var i = sI(t, Array.isArray(e) ? e : [e]);
  Ci[n] || (Ci[n] = /* @__PURE__ */ new WeakMap());
  var o = Ci[n], s = [], a = /* @__PURE__ */ new Set(), l = new Set(i), c = function(d) {
    !d || a.has(d) || (a.add(d), c(d.parentNode));
  };
  i.forEach(c);
  var u = function(d) {
    !d || l.has(d) || Array.prototype.forEach.call(d.children, function(h) {
      if (a.has(h))
        u(h);
      else
        try {
          var f = h.getAttribute(r), m = f !== null && f !== "false", p = (Wn.get(h) || 0) + 1, b = (o.get(h) || 0) + 1;
          Wn.set(h, p), o.set(h, b), s.push(h), p === 1 && m && ki.set(h, !0), b === 1 && h.setAttribute(n, "true"), m || h.setAttribute(r, "true");
        } catch (v) {
          console.error("aria-hidden: cannot operate on ", h, v);
        }
    });
  };
  return u(t), a.clear(), As++, function() {
    s.forEach(function(d) {
      var h = Wn.get(d) - 1, f = o.get(d) - 1;
      Wn.set(d, h), o.set(d, f), h || (ki.has(d) || d.removeAttribute(r), ki.delete(d)), f || d.removeAttribute(n);
    }), As--, As || (Wn = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), ki = /* @__PURE__ */ new WeakMap(), Ci = {});
  };
}, ql = function(e, t, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(e) ? e : [e]), i = oI(e);
  return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), aI(r, i, n, "aria-hidden")) : function() {
    return null;
  };
}, _t = function() {
  return _t = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, _t.apply(this, arguments);
};
function Vm(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function lI(e, t, n) {
  if (n || arguments.length === 2) for (var r = 0, i = t.length, o; r < i; r++)
    (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var Oi = "right-scroll-bar-position", Li = "width-before-scroll-bar", cI = "with-scroll-bars-hidden", uI = "--removed-body-scroll-bar-size";
function Rs(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function dI(e, t) {
  var n = le(function() {
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
var fI = typeof window < "u" ? y.useLayoutEffect : y.useEffect, Wd = /* @__PURE__ */ new WeakMap();
function hI(e, t) {
  var n = dI(null, function(r) {
    return e.forEach(function(i) {
      return Rs(i, r);
    });
  });
  return fI(function() {
    var r = Wd.get(n);
    if (r) {
      var i = new Set(r), o = new Set(e), s = n.current;
      i.forEach(function(a) {
        o.has(a) || Rs(a, null);
      }), o.forEach(function(a) {
        i.has(a) || Rs(a, s);
      });
    }
    Wd.set(n, e);
  }, [e]), n;
}
function pI(e) {
  return e;
}
function mI(e, t) {
  t === void 0 && (t = pI);
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
function gI(e) {
  e === void 0 && (e = {});
  var t = mI(null);
  return t.options = _t({ async: !0, ssr: !1 }, e), t;
}
var Bm = function(e) {
  var t = e.sideCar, n = Vm(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return y.createElement(r, _t({}, n));
};
Bm.isSideCarExport = !0;
function yI(e, t) {
  return e.useMedium(t), Bm;
}
var zm = gI(), Ns = function() {
}, _o = y.forwardRef(function(e, t) {
  var n = y.useRef(null), r = y.useState({
    onScrollCapture: Ns,
    onWheelCapture: Ns,
    onTouchMoveCapture: Ns
  }), i = r[0], o = r[1], s = e.forwardProps, a = e.children, l = e.className, c = e.removeScrollBar, u = e.enabled, d = e.shards, h = e.sideCar, f = e.noRelative, m = e.noIsolation, p = e.inert, b = e.allowPinchZoom, v = e.as, x = v === void 0 ? "div" : v, w = e.gapMode, E = Vm(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), T = h, k = hI([n, t]), A = _t(_t({}, E), i);
  return y.createElement(
    y.Fragment,
    null,
    u && y.createElement(T, { sideCar: zm, removeScrollBar: c, shards: d, noRelative: f, noIsolation: m, inert: p, setCallbacks: o, allowPinchZoom: !!b, lockRef: n, gapMode: w }),
    s ? y.cloneElement(y.Children.only(a), _t(_t({}, A), { ref: k })) : y.createElement(x, _t({}, A, { className: l, ref: k }), a)
  );
});
_o.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
_o.classNames = {
  fullWidth: Li,
  zeroRight: Oi
};
var vI = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function bI() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = vI();
  return t && e.setAttribute("nonce", t), e;
}
function xI(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function wI(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var SI = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = bI()) && (xI(t, n), wI(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, kI = function() {
  var e = SI();
  return function(t, n) {
    y.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, $m = function() {
  var e = kI(), t = function(n) {
    var r = n.styles, i = n.dynamic;
    return e(r, i), null;
  };
  return t;
}, CI = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, Is = function(e) {
  return parseInt(e || "", 10) || 0;
}, TI = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [Is(n), Is(r), Is(i)];
}, EI = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return CI;
  var t = TI(e), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, r - n + t[2] - t[0])
  };
}, PI = $m(), rr = "data-scroll-locked", AI = function(e, t, n, r) {
  var i = e.left, o = e.top, s = e.right, a = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(cI, ` {
   overflow: hidden `).concat(r, `;
   padding-right: `).concat(a, "px ").concat(r, `;
  }
  body[`).concat(rr, `] {
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
  
  .`).concat(Oi, ` {
    right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(Li, ` {
    margin-right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(Oi, " .").concat(Oi, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(Li, " .").concat(Li, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(rr, `] {
    `).concat(uI, ": ").concat(a, `px;
  }
`);
}, qd = function() {
  var e = parseInt(document.body.getAttribute(rr) || "0", 10);
  return isFinite(e) ? e : 0;
}, RI = function() {
  y.useEffect(function() {
    return document.body.setAttribute(rr, (qd() + 1).toString()), function() {
      var e = qd() - 1;
      e <= 0 ? document.body.removeAttribute(rr) : document.body.setAttribute(rr, e.toString());
    };
  }, []);
}, NI = function(e) {
  var t = e.noRelative, n = e.noImportant, r = e.gapMode, i = r === void 0 ? "margin" : r;
  RI();
  var o = y.useMemo(function() {
    return EI(i);
  }, [i]);
  return y.createElement(PI, { styles: AI(o, !t, i, n ? "" : "!important") });
}, fa = !1;
if (typeof window < "u")
  try {
    var Ti = Object.defineProperty({}, "passive", {
      get: function() {
        return fa = !0, !0;
      }
    });
    window.addEventListener("test", Ti, Ti), window.removeEventListener("test", Ti, Ti);
  } catch {
    fa = !1;
  }
var qn = fa ? { passive: !1 } : !1, II = function(e) {
  return e.tagName === "TEXTAREA";
}, jm = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !II(e) && n[t] === "visible")
  );
}, DI = function(e) {
  return jm(e, "overflowY");
}, MI = function(e) {
  return jm(e, "overflowX");
}, Kd = function(e, t) {
  var n = t.ownerDocument, r = t;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var i = Um(e, r);
    if (i) {
      var o = Hm(e, r), s = o[1], a = o[2];
      if (s > a)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, OI = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, r = e.clientHeight;
  return [
    t,
    n,
    r
  ];
}, LI = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, r = e.clientWidth;
  return [
    t,
    n,
    r
  ];
}, Um = function(e, t) {
  return e === "v" ? DI(t) : MI(t);
}, Hm = function(e, t) {
  return e === "v" ? OI(t) : LI(t);
}, _I = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, FI = function(e, t, n, r, i) {
  var o = _I(e, window.getComputedStyle(t).direction), s = o * r, a = n.target, l = t.contains(a), c = !1, u = s > 0, d = 0, h = 0;
  do {
    if (!a)
      break;
    var f = Hm(e, a), m = f[0], p = f[1], b = f[2], v = p - b - o * m;
    (m || v) && Um(e, a) && (d += v, h += m);
    var x = a.parentNode;
    a = x && x.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? x.host : x;
  } while (
    // portaled content
    !l && a !== document.body || // self content
    l && (t.contains(a) || t === a)
  );
  return (u && Math.abs(d) < 1 || !u && Math.abs(h) < 1) && (c = !0), c;
}, Ei = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Gd = function(e) {
  return [e.deltaX, e.deltaY];
}, Yd = function(e) {
  return e && "current" in e ? e.current : e;
}, VI = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, BI = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, zI = 0, Kn = [];
function $I(e) {
  var t = y.useRef([]), n = y.useRef([0, 0]), r = y.useRef(), i = y.useState(zI++)[0], o = y.useState($m)[0], s = y.useRef(e);
  y.useEffect(function() {
    s.current = e;
  }, [e]), y.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(i));
      var p = lI([e.lockRef.current], (e.shards || []).map(Yd), !0).filter(Boolean);
      return p.forEach(function(b) {
        return b.classList.add("allow-interactivity-".concat(i));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(i)), p.forEach(function(b) {
          return b.classList.remove("allow-interactivity-".concat(i));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var a = y.useCallback(function(p, b) {
    if ("touches" in p && p.touches.length === 2 || p.type === "wheel" && p.ctrlKey)
      return !s.current.allowPinchZoom;
    var v = Ei(p), x = n.current, w = "deltaX" in p ? p.deltaX : x[0] - v[0], E = "deltaY" in p ? p.deltaY : x[1] - v[1], T, k = p.target, A = Math.abs(w) > Math.abs(E) ? "h" : "v";
    if ("touches" in p && A === "h" && k.type === "range")
      return !1;
    var D = window.getSelection(), F = D && D.anchorNode, P = F ? F === k || F.contains(k) : !1;
    if (P)
      return !1;
    var N = Kd(A, k);
    if (!N)
      return !0;
    if (N ? T = A : (T = A === "v" ? "h" : "v", N = Kd(A, k)), !N)
      return !1;
    if (!r.current && "changedTouches" in p && (w || E) && (r.current = T), !T)
      return !0;
    var R = r.current || T;
    return FI(R, b, p, R === "h" ? w : E);
  }, []), l = y.useCallback(function(p) {
    var b = p;
    if (!(!Kn.length || Kn[Kn.length - 1] !== o)) {
      var v = "deltaY" in b ? Gd(b) : Ei(b), x = t.current.filter(function(T) {
        return T.name === b.type && (T.target === b.target || b.target === T.shadowParent) && VI(T.delta, v);
      })[0];
      if (x && x.should) {
        b.cancelable && b.preventDefault();
        return;
      }
      if (!x) {
        var w = (s.current.shards || []).map(Yd).filter(Boolean).filter(function(T) {
          return T.contains(b.target);
        }), E = w.length > 0 ? a(b, w[0]) : !s.current.noIsolation;
        E && b.cancelable && b.preventDefault();
      }
    }
  }, []), c = y.useCallback(function(p, b, v, x) {
    var w = { name: p, delta: b, target: v, should: x, shadowParent: jI(v) };
    t.current.push(w), setTimeout(function() {
      t.current = t.current.filter(function(E) {
        return E !== w;
      });
    }, 1);
  }, []), u = y.useCallback(function(p) {
    n.current = Ei(p), r.current = void 0;
  }, []), d = y.useCallback(function(p) {
    c(p.type, Gd(p), p.target, a(p, e.lockRef.current));
  }, []), h = y.useCallback(function(p) {
    c(p.type, Ei(p), p.target, a(p, e.lockRef.current));
  }, []);
  y.useEffect(function() {
    return Kn.push(o), e.setCallbacks({
      onScrollCapture: d,
      onWheelCapture: d,
      onTouchMoveCapture: h
    }), document.addEventListener("wheel", l, qn), document.addEventListener("touchmove", l, qn), document.addEventListener("touchstart", u, qn), function() {
      Kn = Kn.filter(function(p) {
        return p !== o;
      }), document.removeEventListener("wheel", l, qn), document.removeEventListener("touchmove", l, qn), document.removeEventListener("touchstart", u, qn);
    };
  }, []);
  var f = e.removeScrollBar, m = e.inert;
  return y.createElement(
    y.Fragment,
    null,
    m ? y.createElement(o, { styles: BI(i) }) : null,
    f ? y.createElement(NI, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function jI(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const UI = yI(zm, $I);
var Fo = y.forwardRef(function(e, t) {
  return y.createElement(_o, _t({}, e, { ref: t, sideCar: UI }));
});
Fo.classNames = _o.classNames;
var Vo = "Popover", [Wm] = tn(Vo, [
  Sr
]), ui = Sr(), [HI, wn] = Wm(Vo), qm = (e) => {
  const {
    __scopePopover: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !1
  } = e, a = ui(t), l = y.useRef(null), [c, u] = y.useState(!1), [d, h] = gn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Vo
  });
  return /* @__PURE__ */ g(Ul, { ...a, children: /* @__PURE__ */ g(
    HI,
    {
      scope: t,
      contentId: Xt(),
      triggerRef: l,
      open: d,
      onOpenChange: h,
      onOpenToggle: y.useCallback(() => h((f) => !f), [h]),
      hasCustomAnchor: c,
      onCustomAnchorAdd: y.useCallback(() => u(!0), []),
      onCustomAnchorRemove: y.useCallback(() => u(!1), []),
      modal: s,
      children: n
    }
  ) });
};
qm.displayName = Vo;
var Km = "PopoverAnchor", WI = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = wn(Km, n), o = ui(n), { onCustomAnchorAdd: s, onCustomAnchorRemove: a } = i;
    return y.useEffect(() => (s(), () => a()), [s, a]), /* @__PURE__ */ g(Lo, { ...o, ...r, ref: t });
  }
);
WI.displayName = Km;
var Gm = "PopoverTrigger", Ym = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = wn(Gm, n), o = ui(n), s = be(t, i.triggerRef), a = /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": eg(i.open),
        ...r,
        ref: s,
        onClick: oe(e.onClick, i.onOpenToggle)
      }
    );
    return i.hasCustomAnchor ? a : /* @__PURE__ */ g(Lo, { asChild: !0, ...o, children: a });
  }
);
Ym.displayName = Gm;
var Kl = "PopoverPortal", [qI, KI] = Wm(Kl, {
  forceMount: void 0
}), Xm = (e) => {
  const { __scopePopover: t, forceMount: n, children: r, container: i } = e, o = wn(Kl, t);
  return /* @__PURE__ */ g(qI, { scope: t, forceMount: n, children: /* @__PURE__ */ g(nn, { present: n || o.open, children: /* @__PURE__ */ g(ci, { asChild: !0, container: i, children: r }) }) });
};
Xm.displayName = Kl;
var cr = "PopoverContent", Zm = y.forwardRef(
  (e, t) => {
    const n = KI(cr, e.__scopePopover), { forceMount: r = n.forceMount, ...i } = e, o = wn(cr, e.__scopePopover);
    return /* @__PURE__ */ g(nn, { present: r || o.open, children: o.modal ? /* @__PURE__ */ g(YI, { ...i, ref: t }) : /* @__PURE__ */ g(XI, { ...i, ref: t }) });
  }
);
Zm.displayName = cr;
var GI = /* @__PURE__ */ QN("PopoverContent.RemoveScroll"), YI = y.forwardRef(
  (e, t) => {
    const n = wn(cr, e.__scopePopover), r = y.useRef(null), i = be(t, r), o = y.useRef(!1);
    return y.useEffect(() => {
      const s = r.current;
      if (s) return ql(s);
    }, []), /* @__PURE__ */ g(Fo, { as: GI, allowPinchZoom: !0, children: /* @__PURE__ */ g(
      Jm,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: oe(e.onCloseAutoFocus, (s) => {
          var a;
          s.preventDefault(), o.current || (a = n.triggerRef.current) == null || a.focus();
        }),
        onPointerDownOutside: oe(
          e.onPointerDownOutside,
          (s) => {
            const a = s.detail.originalEvent, l = a.button === 0 && a.ctrlKey === !0, c = a.button === 2 || l;
            o.current = c;
          },
          { checkForDefaultPrevented: !1 }
        ),
        onFocusOutside: oe(
          e.onFocusOutside,
          (s) => s.preventDefault(),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
), XI = y.forwardRef(
  (e, t) => {
    const n = wn(cr, e.__scopePopover), r = y.useRef(!1), i = y.useRef(!1);
    return /* @__PURE__ */ g(
      Jm,
      {
        ...e,
        ref: t,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (o) => {
          var s, a;
          (s = e.onCloseAutoFocus) == null || s.call(e, o), o.defaultPrevented || (r.current || (a = n.triggerRef.current) == null || a.focus(), o.preventDefault()), r.current = !1, i.current = !1;
        },
        onInteractOutside: (o) => {
          var l, c;
          (l = e.onInteractOutside) == null || l.call(e, o), o.defaultPrevented || (r.current = !0, o.detail.originalEvent.type === "pointerdown" && (i.current = !0));
          const s = o.target;
          ((c = n.triggerRef.current) == null ? void 0 : c.contains(s)) && o.preventDefault(), o.detail.originalEvent.type === "focusin" && i.current && o.preventDefault();
        }
      }
    );
  }
), Jm = y.forwardRef(
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
    } = e, h = wn(cr, n), f = ui(n);
    return Ml(), /* @__PURE__ */ g(
      No,
      {
        asChild: !0,
        loop: !0,
        trapped: r,
        onMountAutoFocus: i,
        onUnmountAutoFocus: o,
        children: /* @__PURE__ */ g(
          ai,
          {
            asChild: !0,
            disableOutsidePointerEvents: s,
            onInteractOutside: u,
            onEscapeKeyDown: a,
            onPointerDownOutside: l,
            onFocusOutside: c,
            onDismiss: () => h.onOpenChange(!1),
            children: /* @__PURE__ */ g(
              Hl,
              {
                "data-state": eg(h.open),
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
), Qm = "PopoverClose", ZI = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = wn(Qm, n);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: oe(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
ZI.displayName = Qm;
var JI = "PopoverArrow", QI = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = ui(n);
    return /* @__PURE__ */ g(Wl, { ...i, ...r, ref: t });
  }
);
QI.displayName = JI;
function eg(e) {
  return e ? "open" : "closed";
}
var eD = qm, tD = Ym, nD = Xm, rD = Zm;
function Gl({
  ...e
}) {
  return /* @__PURE__ */ g(eD, { "data-slot": "popover", ...e });
}
function Yl({
  ...e
}) {
  return /* @__PURE__ */ g(tD, { "data-slot": "popover-trigger", ...e });
}
function Xl({
  className: e,
  align: t = "center",
  sideOffset: n = 4,
  ...r
}) {
  return /* @__PURE__ */ g(nD, { children: /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ g(
    rD,
    {
      "data-slot": "popover-content",
      align: t,
      sideOffset: n,
      className: Q(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-none",
        e
      ),
      ...r
    }
  ) }) });
}
function ha({ content: e, className: t }) {
  let n = null, r = !1;
  if (typeof e == "string")
    try {
      n = JSON.parse(e), typeof n == "object" && n !== null && (r = !0);
    } catch {
    }
  else typeof e == "object" && e !== null && (n = e, r = !0);
  if (!r)
    return /* @__PURE__ */ g("code", { className: Q("rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", t), children: typeof e == "string" ? e : JSON.stringify(e) });
  const i = Array.isArray(n) ? `Array [${n.length}]` : "Data", o = JSON.stringify(n, null, 2);
  return /* @__PURE__ */ O(Gl, { children: [
    /* @__PURE__ */ g(Yl, { asChild: !0, children: /* @__PURE__ */ O(
      "button",
      {
        className: Q(
          "inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer select-none",
          t
        ),
        children: [
          /* @__PURE__ */ g(oc, { className: "h-3 w-3" }),
          /* @__PURE__ */ g("span", { className: "truncate max-w-[200px]", children: i })
        ]
      }
    ) }),
    /* @__PURE__ */ O(Xl, { className: "w-[500px] max-w-[90vw] p-0", align: "start", children: [
      /* @__PURE__ */ O("div", { className: "flex items-center justify-between border-b px-3 py-2 bg-muted/30", children: [
        /* @__PURE__ */ O("div", { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
          /* @__PURE__ */ g(oc, { className: "h-4 w-4" }),
          /* @__PURE__ */ g("span", { children: "Data Viewer" })
        ] }),
        /* @__PURE__ */ g(Ji, { content: o, copyMessage: "Copied JSON" })
      ] }),
      /* @__PURE__ */ g("div", { className: "max-h-[500px] overflow-auto p-4 bg-background", children: /* @__PURE__ */ g("pre", { className: "text-xs font-mono whitespace-pre-wrap break-words text-foreground", children: o }) })
    ] })
  ] });
}
function Xd({ children: e }) {
  return /* @__PURE__ */ g("div", { className: "space-y-3", children: /* @__PURE__ */ g(DE, { remarkPlugins: [WA], components: oD, children: e }) });
}
const tg = $.memo(
  async ({ children: e, language: t, ...n }) => {
    const { codeToTokens: r, bundledLanguages: i } = await import("./index-xeNzkHNp.js");
    if (!(t in i))
      return /* @__PURE__ */ g("pre", { ...n, children: e });
    const { tokens: o } = await r(e, {
      lang: t,
      defaultColor: !1,
      themes: {
        light: "github-light",
        dark: "github-dark"
      }
    });
    return /* @__PURE__ */ g("pre", { ...n, children: /* @__PURE__ */ g("code", { children: o.map((s, a) => /* @__PURE__ */ O(It, { children: [
      /* @__PURE__ */ g("span", { children: s.map((l, c) => {
        const u = typeof l.htmlStyle == "string" ? void 0 : l.htmlStyle;
        return /* @__PURE__ */ g(
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
  }
);
tg.displayName = "HighlightedCode";
const iD = ({
  children: e,
  className: t,
  language: n,
  ...r
}) => {
  const i = typeof e == "string" ? e : ro(e), o = Q(
    "overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    t
  );
  return /* @__PURE__ */ O("div", { className: "group/code relative mb-4", children: [
    /* @__PURE__ */ g(
      By,
      {
        fallback: /* @__PURE__ */ g("pre", { className: o, ...r, children: e }),
        children: /* @__PURE__ */ g(tg, { language: n, className: o, children: i })
      }
    ),
    /* @__PURE__ */ g("div", { className: "invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100", children: /* @__PURE__ */ g(Ji, { content: i, copyMessage: "Copied code to clipboard" }) })
  ] });
};
function ro(e) {
  var t;
  if (typeof e == "string")
    return e;
  if ((t = e == null ? void 0 : e.props) != null && t.children) {
    let n = e.props.children;
    return Array.isArray(n) ? n.map((r) => ro(r)).join("") : ro(n);
  }
  return "";
}
const oD = {
  h1: Ke("h1", "text-2xl font-semibold"),
  h2: Ke("h2", "font-semibold text-xl"),
  h3: Ke("h3", "font-semibold text-lg"),
  h4: Ke("h4", "font-semibold text-base"),
  h5: Ke("h5", "font-medium"),
  strong: Ke("strong", "font-semibold"),
  a: Ke("a", "text-primary underline underline-offset-2"),
  blockquote: Ke("blockquote", "border-l-2 border-primary pl-4"),
  code: ({ children: e, className: t, node: n, ...r }) => {
    const i = /language-(\w+)/.exec(t || ""), o = i ? i[1] : void 0, s = String(e).replace(/\n$/, "");
    let a = o === "json";
    if (!a)
      try {
        const l = JSON.parse(s);
        typeof l == "object" && l !== null && (a = !0);
      } catch {
      }
    return a ? /* @__PURE__ */ g(ha, { content: s }) : i ? /* @__PURE__ */ g(iD, { className: t, language: i[1], ...r, children: e }) : /* @__PURE__ */ g(
      "code",
      {
        className: Q(
          "font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5"
        ),
        ...r,
        children: e
      }
    );
  },
  pre: ({ children: e }) => e,
  ol: Ke("ol", "list-decimal space-y-2 pl-6"),
  ul: Ke("ul", "list-disc space-y-2 pl-6"),
  li: Ke("li", "my-1.5"),
  table: Ke(
    "table",
    "w-full border-collapse overflow-y-auto rounded-md border border-foreground/20"
  ),
  th: Ke(
    "th",
    "border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  td: Ke(
    "td",
    "border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  tr: Ke("tr", "m-0 border-t p-0 even:bg-muted"),
  p: ({ children: e, className: t, ...n }) => {
    const i = ro(e).trim();
    if (i.startsWith("{") && i.endsWith("}") || i.startsWith("[") && i.endsWith("]"))
      try {
        const s = JSON.parse(i);
        if (typeof s == "object" && s !== null)
          return /* @__PURE__ */ g("div", { className: "my-2", children: /* @__PURE__ */ g(ha, { content: i }) });
      } catch {
      }
    return /* @__PURE__ */ g("p", { className: Q("whitespace-pre-wrap", t), ...n, children: e });
  },
  hr: Ke("hr", "border-foreground/20")
};
function Ke(e, t) {
  const n = ({ node: r, ...i }) => /* @__PURE__ */ g(e, { className: t, ...i });
  return n.displayName = e, n;
}
const sD = Tf(
  "group/message relative break-words rounded-2xl p-4 text-sm sm:max-w-full transition-all duration-300",
  {
    variants: {
      variant: {
        user: "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 [&_a]:text-sky-200 hover:[&_a]:text-sky-100 [&_a]:underline-offset-4 [&_a]:decoration-sky-300/50 [&_blockquote]:border-primary-foreground/30 [&_code]:bg-primary-foreground/10 [&_code]:text-primary-foreground",
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
), aD = ({
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
  const u = fn(() => a == null ? void 0 : a.map((b) => {
    const v = lD(b.url);
    return new File([v], b.name ?? "Unknown", {
      type: b.contentType
    });
  }), [a]), d = e === "user", h = e === "user" ? "user" : e === "tool" ? "tool" : e === "subagent" || s && s.startsWith("sub-agent-") ? "subagent" : "assistant", f = n == null ? void 0 : n.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }), m = ({ children: b, className: v }) => /* @__PURE__ */ g("div", { className: Q(
    "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
    v
  ), children: b }), p = () => h === "user" ? null : h === "assistant" ? /* @__PURE__ */ g(m, { className: "bg-gradient-to-tr from-primary to-primary/80 border-primary/20 text-primary-foreground", children: /* @__PURE__ */ g(po, { className: "h-4 w-4" }) }) : h === "subagent" ? /* @__PURE__ */ g(m, { className: "bg-gradient-to-tr from-indigo-500 to-blue-500 border-indigo-400/20 text-white", children: /* @__PURE__ */ g(Xy, { className: "h-4 w-4" }) }) : null;
  return !t && !l && (!c || c.length === 0) ? null : /* @__PURE__ */ O("div", { className: Q(
    "flex w-full gap-3 mb-6",
    d ? "flex-row-reverse" : "flex-row"
  ), children: [
    p(),
    /* @__PURE__ */ O("div", { className: Q(
      "flex flex-col gap-1.5",
      d ? "items-end max-w-[70%]" : "items-start max-w-full"
    ), children: [
      d && u && u.length > 0 && /* @__PURE__ */ g("div", { className: "mb-1 flex flex-wrap gap-2 justify-end", children: u.map((b, v) => /* @__PURE__ */ g(hl, { file: b }, v)) }),
      /* @__PURE__ */ O("div", { className: Q(sD({ variant: h, animation: i })), children: [
        c && c.length > 0 ? c.map((b, v) => b.type === "text" ? /* @__PURE__ */ g(Zd, { variant: h, children: b.text }, v) : b.type === "reasoning" ? /* @__PURE__ */ g(cD, { part: b }, v) : b.type === "tool-invocation" ? /* @__PURE__ */ g(Jd, { toolInvocations: [b.toolInvocation] }, v) : null) : l && l.length > 0 ? /* @__PURE__ */ g(Jd, { toolInvocations: l }) : /* @__PURE__ */ g(Zd, { variant: h, children: t }),
        o && /* @__PURE__ */ g("div", { className: "absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background/80 backdrop-blur-sm p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-md", children: o })
      ] }),
      r && n && /* @__PURE__ */ g(
        "time",
        {
          dateTime: n.toISOString(),
          className: Q(
            "px-1 text-[10px] font-medium text-muted-foreground/50",
            i !== "none" && "duration-500 animate-in fade-in-0"
          ),
          children: f
        }
      )
    ] })
  ] });
}, Zd = ({
  children: e,
  threshold: t = 1e3,
  variant: n
}) => {
  const [r, i] = le(!1), o = e.length > t, s = Q(
    "mt-2 self-start text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer",
    n === "user" ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary hover:text-primary/80"
  );
  return !o || r ? /* @__PURE__ */ O("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ g(Xd, { children: e }),
    o && /* @__PURE__ */ g("button", { onClick: () => i(!1), className: s, children: "Show less" })
  ] }) : /* @__PURE__ */ O("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ g(Xd, { children: e.slice(0, t) + "..." }),
    /* @__PURE__ */ g("button", { onClick: () => i(!0), className: s, children: "Read more" })
  ] });
};
function lD(e) {
  const t = e.split(",")[1], n = atob(t), r = n.length, i = new Uint8Array(r);
  for (let o = 0; o < r; o++)
    i[o] = n.charCodeAt(o);
  return i;
}
const cD = ({ part: e }) => {
  const [t, n] = le(!1);
  return /* @__PURE__ */ g("div", { className: "mb-2 flex flex-col items-start sm:max-w-[70%]", children: /* @__PURE__ */ O(
    J1,
    {
      open: t,
      onOpenChange: n,
      className: "group w-full overflow-hidden rounded-lg border bg-muted/50",
      children: [
        /* @__PURE__ */ g("div", { className: "flex items-center p-2", children: /* @__PURE__ */ g(Q1, { asChild: !0, children: /* @__PURE__ */ O("button", { className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ g(Aa, { className: "h-4 w-4 transition-transform group-data-[state=open]:rotate-90" }),
          /* @__PURE__ */ g("span", { children: "Thinking" })
        ] }) }) }),
        /* @__PURE__ */ g(eS, { forceMount: !0, children: /* @__PURE__ */ g(
          Jt.div,
          {
            initial: !1,
            animate: t ? "open" : "closed",
            variants: {
              open: { height: "auto", opacity: 1 },
              closed: { height: 0, opacity: 0 }
            },
            transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
            className: "border-t",
            children: /* @__PURE__ */ g("div", { className: "p-2", children: /* @__PURE__ */ g("div", { className: "whitespace-pre-wrap text-xs", children: e.reasoning }) })
          }
        ) })
      ]
    }
  ) });
};
function Jd({
  toolInvocations: e
}) {
  return e != null && e.length ? /* @__PURE__ */ g("div", { className: "flex flex-col items-start gap-2", children: e.map((t, n) => {
    if (t.state === "result" && t.result.__cancelled === !0)
      return /* @__PURE__ */ O(
        "div",
        {
          className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
          children: [
            /* @__PURE__ */ g(Yy, { className: "h-4 w-4" }),
            /* @__PURE__ */ O("span", { children: [
              "Cancelled",
              " ",
              /* @__PURE__ */ O("span", { className: "font-mono", children: [
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
        return /* @__PURE__ */ O(
          "div",
          {
            className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
            children: [
              /* @__PURE__ */ g(uv, { className: "h-4 w-4" }),
              /* @__PURE__ */ O("span", { children: [
                "Calling",
                " ",
                /* @__PURE__ */ O("span", { className: "font-mono", children: [
                  "`",
                  t.toolName,
                  "`"
                ] }),
                "..."
              ] }),
              /* @__PURE__ */ g(ff, { className: "h-3 w-3 animate-spin" })
            ]
          },
          n
        );
      case "result":
        return /* @__PURE__ */ O(
          "div",
          {
            className: "flex flex-col gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm",
            children: [
              /* @__PURE__ */ O("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ g(Qy, { className: "h-4 w-4" }),
                /* @__PURE__ */ O("span", { children: [
                  "Result from",
                  " ",
                  /* @__PURE__ */ O("span", { className: "font-mono", children: [
                    "`",
                    t.toolName,
                    "`"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ g(ha, { content: t.result })
            ]
          },
          n
        );
      default:
        return null;
    }
  }) }) : null;
}
function uD(e, t, n) {
  let r = (i) => e(i, ...t);
  return n === void 0 ? r : Object.assign(r, { lazy: n, lazyArgs: t });
}
function ng(e, t, n) {
  let r = e.length - t.length;
  if (r === 0) return e(...t);
  if (r === 1) return uD(e, t, n);
  throw Error("Wrong number of arguments");
}
function Qd(...e) {
  return ng(dD, e);
}
const dD = (e, t) => e.length >= t;
function ef(...e) {
  return ng(fD, e);
}
function fD(e, t) {
  if (!Qd(t, 1)) return { ...e };
  if (!Qd(t, 2)) {
    let { [t[0]]: r, ...i } = e;
    return i;
  }
  let n = { ...e };
  for (let r of t) delete n[r];
  return n;
}
const tf = function() {
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
}();
function hD({
  transcribeAudio: e,
  onTranscriptionComplete: t
}) {
  const [n, r] = le(!1), [i, o] = le(!!e), [s, a] = le(!1), [l, c] = le(!1), [u, d] = le(null), h = Ae(null);
  Be(() => {
    (async () => {
      const b = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      o(b && !!e);
    })();
  }, [e]);
  const f = async () => {
    a(!1), c(!0);
    try {
      tf.stop();
      const p = await h.current;
      if (e) {
        const b = await e(p);
        t == null || t(b);
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
          d(p), h.current = tf(p);
        } catch (p) {
          console.error("Error recording audio:", p), r(!1), a(!1), u && (u.getTracks().forEach((b) => b.stop()), d(null));
        }
    },
    stopRecording: f
  };
}
function pD({
  ref: e,
  maxHeight: t = Number.MAX_SAFE_INTEGER,
  borderWidth: n = 0,
  dependencies: r
}) {
  const i = Ae(null);
  Ea(() => {
    if (!e.current) return;
    const o = e.current, s = n * 2;
    i.current === null && (i.current = o.scrollHeight - s), o.style.removeProperty("height");
    const a = o.scrollHeight, l = Math.min(a, t), c = Math.max(l, i.current);
    o.style.height = `${c + s}px`;
  }, [t, e, ...r]);
}
const cn = {
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
function mD({
  stream: e,
  isRecording: t,
  onClick: n
}) {
  const r = Ae(null), i = Ae(null), o = Ae(null), s = Ae(null), a = Ae(null), l = () => {
    s.current && cancelAnimationFrame(s.current), i.current && i.current.close();
  };
  Be(() => l, []), Be(() => {
    e && t ? c() : l();
  }, [e, t]), Be(() => {
    const f = () => {
      if (r.current && a.current) {
        const m = a.current, p = r.current, b = window.devicePixelRatio || 1, v = m.getBoundingClientRect();
        p.width = (v.width - 2) * b, p.height = (v.height - 2) * b, p.style.width = `${v.width - 2}px`, p.style.height = `${v.height - 2}px`;
      }
    };
    return window.addEventListener("resize", f), f(), () => window.removeEventListener("resize", f);
  }, []);
  const c = async () => {
    try {
      const f = new AudioContext();
      i.current = f;
      const m = f.createAnalyser();
      m.fftSize = cn.FFT_SIZE, m.smoothingTimeConstant = cn.SMOOTHING, o.current = m, f.createMediaStreamSource(e).connect(m), h();
    } catch (f) {
      console.error("Error starting visualization:", f);
    }
  }, u = (f) => {
    const m = Math.floor(f * cn.COLOR.INTENSITY_RANGE) + cn.COLOR.MIN_INTENSITY;
    return `rgb(${m}, ${m}, ${m})`;
  }, d = (f, m, p, b, v, x) => {
    f.fillStyle = x, f.fillRect(m, p - v, b, v), f.fillRect(m, p, b, v);
  }, h = () => {
    if (!t) return;
    const f = r.current, m = f == null ? void 0 : f.getContext("2d");
    if (!f || !m || !o.current) return;
    const p = window.devicePixelRatio || 1;
    m.scale(p, p);
    const b = o.current, v = b.frequencyBinCount, x = new Uint8Array(v), w = () => {
      s.current = requestAnimationFrame(w), b.getByteFrequencyData(x), m.clearRect(0, 0, f.width / p, f.height / p);
      const E = Math.max(
        cn.MIN_BAR_WIDTH,
        f.width / p / v - cn.BAR_SPACING
      ), T = f.height / p / 2;
      let k = 0;
      for (let A = 0; A < v; A++) {
        const D = x[A] / 255, F = Math.max(
          cn.MIN_BAR_HEIGHT,
          D * T
        );
        d(
          m,
          k,
          T,
          E,
          F,
          u(D)
        ), k += E + cn.BAR_SPACING;
      }
    };
    w();
  };
  return /* @__PURE__ */ g(
    "div",
    {
      ref: a,
      className: "h-full w-full cursor-pointer rounded-lg bg-background/80 backdrop-blur",
      onClick: n,
      children: /* @__PURE__ */ g("canvas", { ref: r, className: "h-full w-full" })
    }
  );
}
function gD({ isOpen: e, close: t }) {
  return /* @__PURE__ */ g(go, { children: e && /* @__PURE__ */ O(
    Jt.div,
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
        /* @__PURE__ */ g("span", { className: "ml-2.5", children: "Press Enter again to interrupt" }),
        /* @__PURE__ */ g(
          "button",
          {
            className: "ml-1 mr-2.5 flex items-center",
            type: "button",
            onClick: t,
            "aria-label": "Close",
            children: /* @__PURE__ */ g(hr, { className: "h-3 w-3" })
          }
        )
      ]
    }
  ) });
}
const nf = [ov, po, lv, Jy];
function pa({
  label: e,
  append: t,
  suggestions: n
}) {
  return /* @__PURE__ */ O("div", { className: "flex h-full flex-col items-center justify-start sm:justify-center space-y-8 sm:space-y-12 px-4 py-8 sm:py-12 md:py-16 animate-in fade-in zoom-in-95 duration-700 overflow-y-auto", children: [
    /* @__PURE__ */ O("div", { className: "space-y-4 sm:space-y-6 text-center max-w-2xl", children: [
      /* @__PURE__ */ g("div", { className: "mx-auto flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent shadow-inner mb-4 sm:mb-8 ring-1 ring-primary/20", children: /* @__PURE__ */ g(po, { className: "h-7 w-7 sm:h-10 sm:w-10 text-primary animate-pulse" }) }),
      /* @__PURE__ */ O("div", { className: "space-y-1 sm:space-y-2", children: [
        /* @__PURE__ */ g("h2", { className: "text-xl sm:text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent", children: "How can I help you today?" }),
        /* @__PURE__ */ g("p", { className: "text-sm sm:text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-lg mx-auto", children: e || "Experience the power of our specialized agents. Choose a task below to get started immediately." })
      ] })
    ] }),
    /* @__PURE__ */ O("div", { className: "w-full max-w-5xl space-y-6", children: [
      /* @__PURE__ */ O("div", { className: "flex items-center gap-3 px-2", children: [
        /* @__PURE__ */ g("div", { className: "h-px flex-1 bg-border/40" }),
        /* @__PURE__ */ g("span", { className: "text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50", children: "Starter Prompts" }),
        /* @__PURE__ */ g("div", { className: "h-px flex-1 bg-border/40" })
      ] }),
      /* @__PURE__ */ g("div", { className: "flex flex-wrap items-stretch justify-center w-full gap-3 lg:mx-auto", children: n.map((r, i) => {
        const o = nf[i % nf.length];
        return /* @__PURE__ */ O(
          "button",
          {
            onClick: () => t({ role: "user", content: r }),
            className: Q(
              "group relative flex flex-1 flex-row items-center gap-4 sm:gap-5 rounded-xl sm:rounded-2xl border bg-card/40 p-4 sm:p-6 text-left transition-all duration-500 backdrop-blur-sm",
              "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/60",
              "border-border/40 active:scale-[0.98] overflow-hidden",
              "min-w-[280px] max-w-full md:max-w-[calc(50%-0.75rem)]"
            ),
            children: [
              /* @__PURE__ */ g("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
              /* @__PURE__ */ g("div", { className: "relative flex flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-lg", children: /* @__PURE__ */ g(o, { className: "h-5 w-5 sm:h-6 sm:w-6" }) }),
              /* @__PURE__ */ O("div", { className: "relative flex-1 space-y-0.5 sm:space-y-1.5", children: [
                /* @__PURE__ */ g("p", { className: "font-bold text-[14px] sm:text-[17px] text-foreground group-hover:text-primary transition-colors leading-tight", children: r }),
                /* @__PURE__ */ O("p", { className: "text-[10px] sm:text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5", children: [
                  "Click to start this task ",
                  /* @__PURE__ */ g(Aa, { className: "h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" })
                ] })
              ] })
            ]
          },
          r
        );
      }) })
    ] })
  ] });
}
var yD = Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function vD(e) {
  const t = ({ children: n }) => /* @__PURE__ */ g(It, { children: n });
  return t.displayName = `${e}.Slottable`, t.__radixId = yD, t;
}
var rg = Object.freeze({
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
}), bD = "VisuallyHidden", ig = y.forwardRef(
  (e, t) => /* @__PURE__ */ g(
    he.span,
    {
      ...e,
      ref: t,
      style: { ...rg, ...e.style }
    }
  )
);
ig.displayName = bD;
var xD = ig, [Bo] = tn("Tooltip", [
  Sr
]), zo = Sr(), og = "TooltipProvider", wD = 700, ma = "tooltip.open", [SD, Zl] = Bo(og), sg = (e) => {
  const {
    __scopeTooltip: t,
    delayDuration: n = wD,
    skipDelayDuration: r = 300,
    disableHoverableContent: i = !1,
    children: o
  } = e, s = y.useRef(!0), a = y.useRef(!1), l = y.useRef(0);
  return y.useEffect(() => {
    const c = l.current;
    return () => window.clearTimeout(c);
  }, []), /* @__PURE__ */ g(
    SD,
    {
      scope: t,
      isOpenDelayedRef: s,
      delayDuration: n,
      onOpen: y.useCallback(() => {
        window.clearTimeout(l.current), s.current = !1;
      }, []),
      onClose: y.useCallback(() => {
        window.clearTimeout(l.current), l.current = window.setTimeout(
          () => s.current = !0,
          r
        );
      }, [r]),
      isPointerInTransitRef: a,
      onPointerInTransitChange: y.useCallback((c) => {
        a.current = c;
      }, []),
      disableHoverableContent: i,
      children: o
    }
  );
};
sg.displayName = og;
var Zr = "Tooltip", [kD, di] = Bo(Zr), ag = (e) => {
  const {
    __scopeTooltip: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    disableHoverableContent: s,
    delayDuration: a
  } = e, l = Zl(Zr, e.__scopeTooltip), c = zo(t), [u, d] = y.useState(null), h = Xt(), f = y.useRef(0), m = s ?? l.disableHoverableContent, p = a ?? l.delayDuration, b = y.useRef(!1), [v, x] = gn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: (A) => {
      A ? (l.onOpen(), document.dispatchEvent(new CustomEvent(ma))) : l.onClose(), o == null || o(A);
    },
    caller: Zr
  }), w = y.useMemo(() => v ? b.current ? "delayed-open" : "instant-open" : "closed", [v]), E = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, b.current = !1, x(!0);
  }, [x]), T = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, x(!1);
  }, [x]), k = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = window.setTimeout(() => {
      b.current = !0, x(!0), f.current = 0;
    }, p);
  }, [p, x]);
  return y.useEffect(() => () => {
    f.current && (window.clearTimeout(f.current), f.current = 0);
  }, []), /* @__PURE__ */ g(Ul, { ...c, children: /* @__PURE__ */ g(
    kD,
    {
      scope: t,
      contentId: h,
      open: v,
      stateAttribute: w,
      trigger: u,
      onTriggerChange: d,
      onTriggerEnter: y.useCallback(() => {
        l.isOpenDelayedRef.current ? k() : E();
      }, [l.isOpenDelayedRef, k, E]),
      onTriggerLeave: y.useCallback(() => {
        m ? T() : (window.clearTimeout(f.current), f.current = 0);
      }, [T, m]),
      onOpen: E,
      onClose: T,
      disableHoverableContent: m,
      children: n
    }
  ) });
};
ag.displayName = Zr;
var ga = "TooltipTrigger", lg = y.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = di(ga, n), o = Zl(ga, n), s = zo(n), a = y.useRef(null), l = be(t, a, i.onTriggerChange), c = y.useRef(!1), u = y.useRef(!1), d = y.useCallback(() => c.current = !1, []);
    return y.useEffect(() => () => document.removeEventListener("pointerup", d), [d]), /* @__PURE__ */ g(Lo, { asChild: !0, ...s, children: /* @__PURE__ */ g(
      he.button,
      {
        "aria-describedby": i.open ? i.contentId : void 0,
        "data-state": i.stateAttribute,
        ...r,
        ref: l,
        onPointerMove: oe(e.onPointerMove, (h) => {
          h.pointerType !== "touch" && !u.current && !o.isPointerInTransitRef.current && (i.onTriggerEnter(), u.current = !0);
        }),
        onPointerLeave: oe(e.onPointerLeave, () => {
          i.onTriggerLeave(), u.current = !1;
        }),
        onPointerDown: oe(e.onPointerDown, () => {
          i.open && i.onClose(), c.current = !0, document.addEventListener("pointerup", d, { once: !0 });
        }),
        onFocus: oe(e.onFocus, () => {
          c.current || i.onOpen();
        }),
        onBlur: oe(e.onBlur, i.onClose),
        onClick: oe(e.onClick, i.onClose)
      }
    ) });
  }
);
lg.displayName = ga;
var Jl = "TooltipPortal", [CD, TD] = Bo(Jl, {
  forceMount: void 0
}), cg = (e) => {
  const { __scopeTooltip: t, forceMount: n, children: r, container: i } = e, o = di(Jl, t);
  return /* @__PURE__ */ g(CD, { scope: t, forceMount: n, children: /* @__PURE__ */ g(nn, { present: n || o.open, children: /* @__PURE__ */ g(ci, { asChild: !0, container: i, children: r }) }) });
};
cg.displayName = Jl;
var ur = "TooltipContent", ug = y.forwardRef(
  (e, t) => {
    const n = TD(ur, e.__scopeTooltip), { forceMount: r = n.forceMount, side: i = "top", ...o } = e, s = di(ur, e.__scopeTooltip);
    return /* @__PURE__ */ g(nn, { present: r || s.open, children: s.disableHoverableContent ? /* @__PURE__ */ g(dg, { side: i, ...o, ref: t }) : /* @__PURE__ */ g(ED, { side: i, ...o, ref: t }) });
  }
), ED = y.forwardRef((e, t) => {
  const n = di(ur, e.__scopeTooltip), r = Zl(ur, e.__scopeTooltip), i = y.useRef(null), o = be(t, i), [s, a] = y.useState(null), { trigger: l, onClose: c } = n, u = i.current, { onPointerInTransitChange: d } = r, h = y.useCallback(() => {
    a(null), d(!1);
  }, [d]), f = y.useCallback(
    (m, p) => {
      const b = m.currentTarget, v = { x: m.clientX, y: m.clientY }, x = ND(v, b.getBoundingClientRect()), w = ID(v, x), E = DD(p.getBoundingClientRect()), T = OD([...w, ...E]);
      a(T), d(!0);
    },
    [d]
  );
  return y.useEffect(() => () => h(), [h]), y.useEffect(() => {
    if (l && u) {
      const m = (b) => f(b, u), p = (b) => f(b, l);
      return l.addEventListener("pointerleave", m), u.addEventListener("pointerleave", p), () => {
        l.removeEventListener("pointerleave", m), u.removeEventListener("pointerleave", p);
      };
    }
  }, [l, u, f, h]), y.useEffect(() => {
    if (s) {
      const m = (p) => {
        const b = p.target, v = { x: p.clientX, y: p.clientY }, x = (l == null ? void 0 : l.contains(b)) || (u == null ? void 0 : u.contains(b)), w = !MD(v, s);
        x ? h() : w && (h(), c());
      };
      return document.addEventListener("pointermove", m), () => document.removeEventListener("pointermove", m);
    }
  }, [l, u, s, c, h]), /* @__PURE__ */ g(dg, { ...e, ref: o });
}), [PD, AD] = Bo(Zr, { isInside: !1 }), RD = /* @__PURE__ */ vD("TooltipContent"), dg = y.forwardRef(
  (e, t) => {
    const {
      __scopeTooltip: n,
      children: r,
      "aria-label": i,
      onEscapeKeyDown: o,
      onPointerDownOutside: s,
      ...a
    } = e, l = di(ur, n), c = zo(n), { onClose: u } = l;
    return y.useEffect(() => (document.addEventListener(ma, u), () => document.removeEventListener(ma, u)), [u]), y.useEffect(() => {
      if (l.trigger) {
        const d = (h) => {
          const f = h.target;
          f != null && f.contains(l.trigger) && u();
        };
        return window.addEventListener("scroll", d, { capture: !0 }), () => window.removeEventListener("scroll", d, { capture: !0 });
      }
    }, [l.trigger, u]), /* @__PURE__ */ g(
      ai,
      {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: o,
        onPointerDownOutside: s,
        onFocusOutside: (d) => d.preventDefault(),
        onDismiss: u,
        children: /* @__PURE__ */ O(
          Hl,
          {
            "data-state": l.stateAttribute,
            ...c,
            ...a,
            ref: t,
            style: {
              ...a.style,
              "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
              "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
              "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
            },
            children: [
              /* @__PURE__ */ g(RD, { children: r }),
              /* @__PURE__ */ g(PD, { scope: n, isInside: !0, children: /* @__PURE__ */ g(xD, { id: l.contentId, role: "tooltip", children: i || r }) })
            ]
          }
        )
      }
    );
  }
);
ug.displayName = ur;
var fg = "TooltipArrow", hg = y.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = zo(n);
    return AD(
      fg,
      n
    ).isInside ? null : /* @__PURE__ */ g(Wl, { ...i, ...r, ref: t });
  }
);
hg.displayName = fg;
function ND(e, t) {
  const n = Math.abs(t.top - e.y), r = Math.abs(t.bottom - e.y), i = Math.abs(t.right - e.x), o = Math.abs(t.left - e.x);
  switch (Math.min(n, r, i, o)) {
    case o:
      return "left";
    case i:
      return "right";
    case n:
      return "top";
    case r:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function ID(e, t, n = 5) {
  const r = [];
  switch (t) {
    case "top":
      r.push(
        { x: e.x - n, y: e.y + n },
        { x: e.x + n, y: e.y + n }
      );
      break;
    case "bottom":
      r.push(
        { x: e.x - n, y: e.y - n },
        { x: e.x + n, y: e.y - n }
      );
      break;
    case "left":
      r.push(
        { x: e.x + n, y: e.y - n },
        { x: e.x + n, y: e.y + n }
      );
      break;
    case "right":
      r.push(
        { x: e.x - n, y: e.y - n },
        { x: e.x - n, y: e.y + n }
      );
      break;
  }
  return r;
}
function DD(e) {
  const { top: t, right: n, bottom: r, left: i } = e;
  return [
    { x: i, y: t },
    { x: n, y: t },
    { x: n, y: r },
    { x: i, y: r }
  ];
}
function MD(e, t) {
  const { x: n, y: r } = e;
  let i = !1;
  for (let o = 0, s = t.length - 1; o < t.length; s = o++) {
    const a = t[o], l = t[s], c = a.x, u = a.y, d = l.x, h = l.y;
    u > r != h > r && n < (d - c) * (r - u) / (h - u) + c && (i = !i);
  }
  return i;
}
function OD(e) {
  const t = e.slice();
  return t.sort((n, r) => n.x < r.x ? -1 : n.x > r.x ? 1 : n.y < r.y ? -1 : n.y > r.y ? 1 : 0), LD(t);
}
function LD(e) {
  if (e.length <= 1) return e.slice();
  const t = [];
  for (let r = 0; r < e.length; r++) {
    const i = e[r];
    for (; t.length >= 2; ) {
      const o = t[t.length - 1], s = t[t.length - 2];
      if ((o.x - s.x) * (i.y - s.y) >= (o.y - s.y) * (i.x - s.x)) t.pop();
      else break;
    }
    t.push(i);
  }
  t.pop();
  const n = [];
  for (let r = e.length - 1; r >= 0; r--) {
    const i = e[r];
    for (; n.length >= 2; ) {
      const o = n[n.length - 1], s = n[n.length - 2];
      if ((o.x - s.x) * (i.y - s.y) >= (o.y - s.y) * (i.x - s.x)) n.pop();
      else break;
    }
    n.push(i);
  }
  return n.pop(), t.length === 1 && n.length === 1 && t[0].x === n[0].x && t[0].y === n[0].y ? t : t.concat(n);
}
var _D = sg, FD = ag, pg = lg, VD = cg, mg = ug, BD = hg;
function gg({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ g(
    _D,
    {
      "data-slot": "tooltip-provider",
      delayDuration: e,
      ...t
    }
  );
}
function io({
  ...e
}) {
  return /* @__PURE__ */ g(gg, { children: /* @__PURE__ */ g(FD, { "data-slot": "tooltip", ...e }) });
}
const Jr = y.forwardRef(({ ...e }, t) => /* @__PURE__ */ g(pg, { "data-slot": "tooltip-trigger", ...e, ref: t }));
Jr.displayName = pg.displayName;
const Qr = y.forwardRef(({ className: e, sideOffset: t = 0, children: n, ...r }, i) => /* @__PURE__ */ g(VD, { children: /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ O(
  mg,
  {
    ref: i,
    "data-slot": "tooltip-content",
    sideOffset: t,
    className: Q(
      "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
      e
    ),
    ...r,
    children: [
      n,
      /* @__PURE__ */ g(BD, { className: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
    ]
  }
) }) }));
Qr.displayName = mg.displayName;
function yg({
  placeholder: e = "Ask AI...",
  className: t,
  onKeyDown: n,
  submitOnEnter: r = !0,
  stop: i,
  isGenerating: o,
  enableInterrupt: s = !0,
  transcribeAudio: a,
  suggestions: l,
  append: c,
  isListening: u,
  startListening: d,
  stopListening: h,
  isSpeechSupported: f,
  ...m
}) {
  var C;
  const [p, b] = le(!1), [v, x] = le(!1), {
    isListening: w,
    isSpeechSupported: E,
    isRecording: T,
    isTranscribing: k,
    audioStream: A,
    toggleListening: D,
    stopRecording: F
  } = hD({
    transcribeAudio: a,
    onTranscriptionComplete: (q) => {
      var Z;
      (Z = m.onChange) == null || Z.call(m, { target: { value: q } });
    }
  }), P = u ?? w, N = f ?? E, R = () => {
    u !== void 0 && d && h ? u ? h() : d() : D();
  };
  Be(() => {
    o || x(!1);
  }, [o]);
  const B = (q) => {
    m.allowAttachments && m.setFiles((Z) => Z === null ? q : q === null ? Z : [...Z, ...q]);
  }, j = (q) => {
    m.allowAttachments === !0 && (q.preventDefault(), b(!0));
  }, H = (q) => {
    m.allowAttachments === !0 && (q.preventDefault(), b(!1));
  }, V = (q) => {
    if (b(!1), m.allowAttachments !== !0) return;
    q.preventDefault();
    const Z = q.dataTransfer;
    Z.files.length && B(Array.from(Z.files));
  }, I = (q) => {
    var ne;
    const Z = (ne = q.clipboardData) == null ? void 0 : ne.items;
    if (!Z) return;
    const ie = q.clipboardData.getData("text");
    if (ie && ie.length > 500 && m.allowAttachments) {
      q.preventDefault();
      const pe = new Blob([ie], { type: "text/plain" }), se = new File([pe], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now()
      });
      B([se]);
      return;
    }
    const W = Array.from(Z).map((pe) => pe.getAsFile()).filter((pe) => pe !== null);
    m.allowAttachments && W.length > 0 && B(W);
  }, _ = (q) => {
    var Z, ie, W;
    if (r && q.key === "Enter" && !q.shiftKey) {
      if (q.preventDefault(), o && i && s) {
        if (v)
          i(), x(!1), (Z = q.currentTarget.form) == null || Z.requestSubmit();
        else if (m.value || m.allowAttachments && ((ie = m.files) != null && ie.length)) {
          x(!0);
          return;
        }
      }
      (W = q.currentTarget.form) == null || W.requestSubmit();
    }
    n == null || n(q);
  }, L = Ae(null), [S, ee] = le(0);
  Be(() => {
    L.current && ee(L.current.offsetHeight);
  }, [m.value]);
  const Y = m.allowAttachments && m.files && m.files.length > 0;
  return pD({
    ref: L,
    maxHeight: 200,
    borderWidth: 1,
    dependencies: [m.value, Y]
  }), /* @__PURE__ */ O(
    "div",
    {
      className: "relative flex w-full",
      onDragOver: j,
      onDragLeave: H,
      onDrop: V,
      children: [
        s && /* @__PURE__ */ g(
          gD,
          {
            isOpen: v,
            close: () => x(!1)
          }
        ),
        /* @__PURE__ */ g(
          UD,
          {
            isVisible: T,
            onStopRecording: F
          }
        ),
        l && c && l.length > 0 && /* @__PURE__ */ g("div", { className: "mb-2", children: /* @__PURE__ */ g(pa, { label: "", append: c, suggestions: l }) }),
        /* @__PURE__ */ g("div", { className: "relative flex w-full items-center space-x-2", children: /* @__PURE__ */ O("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ g(
            "textarea",
            {
              "aria-label": "Write your prompt here",
              placeholder: e,
              ref: L,
              onPaste: I,
              onKeyDown: _,
              className: Q(
                "z-10 w-full grow resize-none rounded-lg border border-input bg-background/50 backdrop-blur-sm p-4 pr-28 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
                Y && "pb-20",
                t
              ),
              ...m.allowAttachments ? ef(m, ["allowAttachments", "files", "setFiles"]) : ef(m, ["allowAttachments"])
            }
          ),
          m.allowAttachments && /* @__PURE__ */ g("div", { className: "absolute inset-x-3 bottom-0 z-20 py-3", children: /* @__PURE__ */ g("div", { className: "flex space-x-3", children: /* @__PURE__ */ g(go, { mode: "popLayout", children: (C = m.files) == null ? void 0 : C.map((q) => /* @__PURE__ */ g(
            hl,
            {
              file: q,
              onRemove: () => {
                m.setFiles((Z) => {
                  if (!Z) return null;
                  const ie = Array.from(Z).filter(
                    (W) => W !== q
                  );
                  return ie.length === 0 ? null : ie;
                });
              }
            },
            q.name + String(q.lastModified)
          )) }) }) })
        ] }) }),
        l && c && l.length > 0 && /* @__PURE__ */ g("div", { className: "mt-2", children: /* @__PURE__ */ g(pa, { label: "", append: c, suggestions: l }) }),
        /* @__PURE__ */ g("div", { className: "absolute right-3 top-3 z-20 flex gap-1", children: /* @__PURE__ */ O(gg, { delayDuration: 0, children: [
          m.allowAttachments && /* @__PURE__ */ g(
            WD,
            {
              onClick: async () => {
                const q = await $D();
                B(q);
              }
            }
          ),
          /* @__PURE__ */ g(
            qD,
            {
              isSupported: !!N,
              isListening: !!P,
              onClick: R
            }
          ),
          /* @__PURE__ */ g(
            KD,
            {
              isGenerating: o,
              stop: i,
              disabled: m.value === "" || o
            }
          )
        ] }) }),
        m.allowAttachments && /* @__PURE__ */ g(zD, { isDragging: p }),
        /* @__PURE__ */ g(
          HD,
          {
            isRecording: T,
            isTranscribing: k,
            audioStream: A,
            textAreaHeight: S,
            onStopRecording: F
          }
        )
      ]
    }
  );
}
yg.displayName = "MessageInput";
function zD({ isDragging: e }) {
  return /* @__PURE__ */ g(go, { children: e && /* @__PURE__ */ O(
    Jt.div,
    {
      className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      "aria-hidden": !0,
      children: [
        /* @__PURE__ */ g(hf, {}),
        /* @__PURE__ */ g("span", { children: "Drop your files here to attach them." })
      ]
    }
  ) });
}
function $D() {
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
function jD() {
  return /* @__PURE__ */ O(
    Jt.div,
    {
      className: "flex h-full w-full flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      children: [
        /* @__PURE__ */ O("div", { className: "relative", children: [
          /* @__PURE__ */ g(ff, { className: "h-8 w-8 animate-spin text-primary" }),
          /* @__PURE__ */ g(
            Jt.div,
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
        /* @__PURE__ */ g("p", { className: "mt-4 text-sm font-medium text-muted-foreground", children: "Transcribing audio..." })
      ]
    }
  );
}
function UD({ isVisible: e, onStopRecording: t }) {
  return /* @__PURE__ */ g(go, { children: e && /* @__PURE__ */ g(
    Jt.div,
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
      children: /* @__PURE__ */ O("span", { className: "mx-2.5 flex items-center", children: [
        /* @__PURE__ */ g(nv, { className: "mr-2 h-3 w-3" }),
        "Click to finish recording"
      ] })
    }
  ) });
}
function HD({
  isRecording: e,
  isTranscribing: t,
  audioStream: n,
  textAreaHeight: r,
  onStopRecording: i
}) {
  return e ? /* @__PURE__ */ g(
    "div",
    {
      className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
      style: { height: r - 2 },
      children: /* @__PURE__ */ g(
        mD,
        {
          stream: n,
          isRecording: e,
          onClick: i
        }
      )
    }
  ) : t ? /* @__PURE__ */ g(
    "div",
    {
      className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
      style: { height: r - 2 },
      children: /* @__PURE__ */ g(jD, {})
    }
  ) : null;
}
function WD({ onClick: e, className: t }) {
  return /* @__PURE__ */ O(io, { children: [
    /* @__PURE__ */ g(Jr, { asChild: !0, children: /* @__PURE__ */ g(
      $e,
      {
        type: "button",
        size: "icon",
        variant: "ghost",
        className: Q("h-8 w-8 text-muted-foreground hover:text-foreground", t),
        "aria-label": "Attach a file",
        onClick: e,
        children: /* @__PURE__ */ g(hf, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(Qr, { children: "Attach file" })
  ] });
}
function qD({
  isSupported: e,
  isListening: t,
  onClick: n
}) {
  return e ? /* @__PURE__ */ O(io, { children: [
    /* @__PURE__ */ g(Jr, { asChild: !0, children: /* @__PURE__ */ g(
      $e,
      {
        type: "button",
        variant: "ghost",
        "aria-label": t ? "Stop recording" : "Voice input",
        size: "icon",
        onClick: n,
        className: Q(
          "h-8 w-8 transition-all duration-200",
          t ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "text-muted-foreground hover:text-foreground"
        ),
        children: t ? /* @__PURE__ */ O("span", { className: "relative flex h-3 w-3", children: [
          /* @__PURE__ */ g("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" }),
          /* @__PURE__ */ g("span", { className: "relative inline-flex h-3 w-3 rounded-full bg-red-500" })
        ] }) : /* @__PURE__ */ g(sv, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(Qr, { children: t ? "Stop recording" : "Use voice input" })
  ] }) : null;
}
function KD({
  isGenerating: e,
  stop: t,
  disabled: n
}) {
  return e && t ? /* @__PURE__ */ O(io, { children: [
    /* @__PURE__ */ g(Jr, { asChild: !0, children: /* @__PURE__ */ g(
      $e,
      {
        type: "button",
        size: "icon",
        variant: "ghost",
        className: "h-8 w-8 text-muted-foreground hover:text-foreground",
        "aria-label": "Stop generating",
        onClick: t,
        children: /* @__PURE__ */ g(mf, { className: "h-3 w-3 animate-pulse fill-current" })
      }
    ) }),
    /* @__PURE__ */ g(Qr, { children: "Stop generating" })
  ] }) : /* @__PURE__ */ O(io, { children: [
    /* @__PURE__ */ g(Jr, { asChild: !0, children: /* @__PURE__ */ g(
      $e,
      {
        type: "submit",
        size: "icon",
        className: Q(
          "h-8 w-8 rounded-full transition-all duration-200",
          n ? "opacity-50" : "bg-primary text-primary-foreground shadow-sm"
        ),
        "aria-label": "Send message",
        disabled: n,
        children: /* @__PURE__ */ g(Aa, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(Qr, { children: "Send message" })
  ] });
}
function GD() {
  return /* @__PURE__ */ g("div", { className: "justify-left flex space-x-1", children: /* @__PURE__ */ g("div", { className: "rounded-lg bg-muted p-3", children: /* @__PURE__ */ O("div", { className: "flex -space-x-2.5", children: [
    /* @__PURE__ */ g(Ko, { className: "h-5 w-5 animate-typing-dot-bounce" }),
    /* @__PURE__ */ g(Ko, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:90ms]" }),
    /* @__PURE__ */ g(Ko, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:180ms]" })
  ] }) }) });
}
function YD({
  messages: e,
  showTimeStamps: t = !0,
  isTyping: n = !1,
  messageOptions: r
}) {
  return /* @__PURE__ */ O("div", { className: "space-y-4 overflow-visible", children: [
    e.map((i, o) => {
      const s = typeof r == "function" ? r(i) : r;
      return /* @__PURE__ */ g(
        aD,
        {
          showTimeStamp: t,
          ...i,
          ...s
        },
        o
      );
    }),
    n && /* @__PURE__ */ g(GD, {})
  ] });
}
function vg({
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
  placeholder: h,
  label: f,
  isListening: m,
  startListening: p,
  stopListening: b,
  isSpeechSupported: v,
  speak: x,
  stopSpeaking: w,
  isSpeaking: E
}) {
  const T = e.at(-1), k = e.length === 0, A = (T == null ? void 0 : T.role) === "user", D = Ae(e);
  D.current = e;
  const F = Ve(() => {
    if (i == null || i(), !u) return;
    const N = [...D.current], R = N.findLast(
      (H) => H.role === "assistant"
    );
    if (!R) return;
    let B = !1, j = { ...R };
    if (R.toolInvocations) {
      const H = R.toolInvocations.map(
        (V) => V.state === "call" ? (B = !0, {
          ...V,
          state: "result",
          result: {
            content: "Tool execution was cancelled",
            __cancelled: !0
            // Special marker to indicate cancellation
          }
        }) : V
      );
      B && (j = {
        ...j,
        toolInvocations: H
      });
    }
    if (R.parts && R.parts.length > 0) {
      const H = R.parts.map((V) => V.type === "tool-invocation" && V.toolInvocation && V.toolInvocation.state === "call" ? (B = !0, {
        ...V,
        toolInvocation: {
          ...V.toolInvocation,
          state: "result",
          result: {
            content: "Tool execution was cancelled",
            __cancelled: !0
          }
        }
      }) : V);
      B && (j = {
        ...j,
        parts: H
      });
    }
    if (B) {
      const H = N.findIndex(
        (V) => V.id === R.id
      );
      H !== -1 && (N[H] = j, u(N));
    }
  }, [i, u, D]), P = Ve(
    (N) => ({
      actions: /* @__PURE__ */ O(It, { children: [
        x && /* @__PURE__ */ g(
          $e,
          {
            size: "icon",
            variant: "ghost",
            className: "h-6 w-6",
            onClick: () => {
              E && w ? w() : x(N.content);
            },
            children: E ? /* @__PURE__ */ g(mf, { className: "h-3 w-3 fill-current" }) : /* @__PURE__ */ g(hv, { className: "h-4 w-4" })
          }
        ),
        c ? /* @__PURE__ */ O(It, { children: [
          /* @__PURE__ */ g("div", { className: "border-r pr-1 inline-flex items-center h-4 my-auto mx-1", children: /* @__PURE__ */ g(
            Ji,
            {
              content: N.content,
              copyMessage: "Copied response to clipboard!"
            }
          ) }),
          /* @__PURE__ */ g(
            $e,
            {
              size: "icon",
              variant: "ghost",
              className: "h-6 w-6",
              onClick: () => c(N.id, "thumbs-up"),
              children: /* @__PURE__ */ g(fv, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ g(
            $e,
            {
              size: "icon",
              variant: "ghost",
              className: "h-6 w-6",
              onClick: () => c(N.id, "thumbs-down"),
              children: /* @__PURE__ */ g(dv, { className: "h-4 w-4" })
            }
          )
        ] }) : /* @__PURE__ */ g(
          Ji,
          {
            content: N.content,
            copyMessage: "Copied response to clipboard!"
          }
        )
      ] })
    }),
    [c, x, E, w]
  );
  return /* @__PURE__ */ O(bg, { className: Q(l, "relative"), children: [
    /* @__PURE__ */ g("div", { className: "flex-1 min-h-0 flex flex-col overflow-hidden", children: k && s && a ? /* @__PURE__ */ g("div", { className: "flex h-full flex-col justify-center overflow-y-auto", children: /* @__PURE__ */ g(
      pa,
      {
        label: f || "",
        append: s,
        suggestions: a
      }
    ) }) : e.length > 0 ? /* @__PURE__ */ g(XD, { messages: e, className: "flex-1 w-full px-4 pt-8", children: /* @__PURE__ */ O("div", { className: "max-w-4xl mx-auto w-full", children: [
      /* @__PURE__ */ g(
        YD,
        {
          messages: e,
          isTyping: A,
          messageOptions: P
        }
      ),
      s && a && a.length > 0 && !o && /* @__PURE__ */ g("div", { className: "mt-6 flex flex-wrap gap-2 pb-8", children: a.map((N) => /* @__PURE__ */ g(
        $e,
        {
          variant: "outline",
          size: "sm",
          className: "rounded-xl bg-background/50 backdrop-blur-sm text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-primary/20 hover:border-primary shadow-sm",
          onClick: () => s({ role: "user", content: N }),
          children: N
        },
        N
      )) })
    ] }) }) : /* @__PURE__ */ g("div", { className: "flex-1" }) }),
    /* @__PURE__ */ g("div", { className: "flex-none w-full max-w-4xl mx-auto px-4 pb-6", children: /* @__PURE__ */ g(
      xg,
      {
        className: "relative",
        isPending: o || A,
        handleSubmit: t,
        children: ({ files: N, setFiles: R }) => /* @__PURE__ */ g(
          yg,
          {
            value: n,
            onChange: r,
            allowAttachments: !0,
            files: N,
            setFiles: R,
            stop: F,
            isGenerating: o,
            transcribeAudio: d,
            placeholder: h,
            isListening: m,
            startListening: p,
            stopListening: b,
            isSpeechSupported: v
          }
        )
      }
    ) })
  ] });
}
vg.displayName = "Chat";
function XD({
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
  } = Gv([e]);
  return /* @__PURE__ */ O(
    "div",
    {
      className: Q("grid grid-cols-1 overflow-y-auto pb-4", n),
      ref: r,
      onScroll: o,
      onTouchStart: a,
      children: [
        /* @__PURE__ */ g("div", { className: "max-w-full [grid-column:1/1] [grid-row:1/1]", children: t }),
        !s && /* @__PURE__ */ g("div", { className: "pointer-events-none flex flex-1 items-end justify-end [grid-column:1/1] [grid-row:1/1]", children: /* @__PURE__ */ g("div", { className: "sticky bottom-0 left-0 flex w-full justify-end", children: /* @__PURE__ */ g(
          $e,
          {
            onClick: i,
            className: "pointer-events-auto h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1",
            size: "icon",
            variant: "ghost",
            children: /* @__PURE__ */ g(Gy, { className: "h-4 w-4" })
          }
        ) }) })
      ]
    }
  );
}
const bg = dr(({ className: e, ...t }, n) => /* @__PURE__ */ g(
  "div",
  {
    ref: n,
    className: Q("flex flex-col h-full w-full", e),
    ...t
  }
));
bg.displayName = "ChatContainer";
const xg = dr(
  ({ children: e, handleSubmit: t, className: n }, r) => {
    const [i, o] = le(null);
    return /* @__PURE__ */ g("form", { ref: r, onSubmit: (a) => {
      if (!i) {
        t(a);
        return;
      }
      const l = ZD(i);
      t(a, { experimental_attachments: l }), o(null);
    }, className: n, children: e({ files: i, setFiles: o }) });
  }
);
xg.displayName = "ChatForm";
function ZD(e) {
  const t = new DataTransfer();
  for (const n of Array.from(e))
    t.items.add(n);
  return t.files;
}
// @__NO_SIDE_EFFECTS__
function JD(e) {
  const t = /* @__PURE__ */ QD(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(t2);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function QD(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = r2(i), a = n2(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? zn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var e2 = Symbol("radix.slottable");
function t2(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === e2;
}
function n2(e, t) {
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
function r2(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var $o = "Dialog", [wg] = tn($o), [i2, Ot] = wg($o), Sg = (e) => {
  const {
    __scopeDialog: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !0
  } = e, a = y.useRef(null), l = y.useRef(null), [c, u] = gn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: $o
  });
  return /* @__PURE__ */ g(
    i2,
    {
      scope: t,
      triggerRef: a,
      contentRef: l,
      contentId: Xt(),
      titleId: Xt(),
      descriptionId: Xt(),
      open: c,
      onOpenChange: u,
      onOpenToggle: y.useCallback(() => u((d) => !d), [u]),
      modal: s,
      children: n
    }
  );
};
Sg.displayName = $o;
var kg = "DialogTrigger", Cg = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ot(kg, n), o = be(t, i.triggerRef);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": tc(i.open),
        ...r,
        ref: o,
        onClick: oe(e.onClick, i.onOpenToggle)
      }
    );
  }
);
Cg.displayName = kg;
var Ql = "DialogPortal", [o2, Tg] = wg(Ql, {
  forceMount: void 0
}), Eg = (e) => {
  const { __scopeDialog: t, forceMount: n, children: r, container: i } = e, o = Ot(Ql, t);
  return /* @__PURE__ */ g(o2, { scope: t, forceMount: n, children: y.Children.map(r, (s) => /* @__PURE__ */ g(nn, { present: n || o.open, children: /* @__PURE__ */ g(ci, { asChild: !0, container: i, children: s }) })) });
};
Eg.displayName = Ql;
var oo = "DialogOverlay", Pg = y.forwardRef(
  (e, t) => {
    const n = Tg(oo, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Ot(oo, e.__scopeDialog);
    return o.modal ? /* @__PURE__ */ g(nn, { present: r || o.open, children: /* @__PURE__ */ g(a2, { ...i, ref: t }) }) : null;
  }
);
Pg.displayName = oo;
var s2 = /* @__PURE__ */ JD("DialogOverlay.RemoveScroll"), a2 = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ot(oo, n);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ g(Fo, { as: s2, allowPinchZoom: !0, shards: [i.contentRef], children: /* @__PURE__ */ g(
        he.div,
        {
          "data-state": tc(i.open),
          ...r,
          ref: t,
          style: { pointerEvents: "auto", ...r.style }
        }
      ) })
    );
  }
), Fn = "DialogContent", Ag = y.forwardRef(
  (e, t) => {
    const n = Tg(Fn, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Ot(Fn, e.__scopeDialog);
    return /* @__PURE__ */ g(nn, { present: r || o.open, children: o.modal ? /* @__PURE__ */ g(l2, { ...i, ref: t }) : /* @__PURE__ */ g(c2, { ...i, ref: t }) });
  }
);
Ag.displayName = Fn;
var l2 = y.forwardRef(
  (e, t) => {
    const n = Ot(Fn, e.__scopeDialog), r = y.useRef(null), i = be(t, n.contentRef, r);
    return y.useEffect(() => {
      const o = r.current;
      if (o) return ql(o);
    }, []), /* @__PURE__ */ g(
      Rg,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: oe(e.onCloseAutoFocus, (o) => {
          var s;
          o.preventDefault(), (s = n.triggerRef.current) == null || s.focus();
        }),
        onPointerDownOutside: oe(e.onPointerDownOutside, (o) => {
          const s = o.detail.originalEvent, a = s.button === 0 && s.ctrlKey === !0;
          (s.button === 2 || a) && o.preventDefault();
        }),
        onFocusOutside: oe(
          e.onFocusOutside,
          (o) => o.preventDefault()
        )
      }
    );
  }
), c2 = y.forwardRef(
  (e, t) => {
    const n = Ot(Fn, e.__scopeDialog), r = y.useRef(!1), i = y.useRef(!1);
    return /* @__PURE__ */ g(
      Rg,
      {
        ...e,
        ref: t,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (o) => {
          var s, a;
          (s = e.onCloseAutoFocus) == null || s.call(e, o), o.defaultPrevented || (r.current || (a = n.triggerRef.current) == null || a.focus(), o.preventDefault()), r.current = !1, i.current = !1;
        },
        onInteractOutside: (o) => {
          var l, c;
          (l = e.onInteractOutside) == null || l.call(e, o), o.defaultPrevented || (r.current = !0, o.detail.originalEvent.type === "pointerdown" && (i.current = !0));
          const s = o.target;
          ((c = n.triggerRef.current) == null ? void 0 : c.contains(s)) && o.preventDefault(), o.detail.originalEvent.type === "focusin" && i.current && o.preventDefault();
        }
      }
    );
  }
), Rg = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: i, onCloseAutoFocus: o, ...s } = e, a = Ot(Fn, n), l = y.useRef(null), c = be(t, l);
    return Ml(), /* @__PURE__ */ O(It, { children: [
      /* @__PURE__ */ g(
        No,
        {
          asChild: !0,
          loop: !0,
          trapped: r,
          onMountAutoFocus: i,
          onUnmountAutoFocus: o,
          children: /* @__PURE__ */ g(
            ai,
            {
              role: "dialog",
              id: a.contentId,
              "aria-describedby": a.descriptionId,
              "aria-labelledby": a.titleId,
              "data-state": tc(a.open),
              ...s,
              ref: c,
              onDismiss: () => a.onOpenChange(!1)
            }
          )
        }
      ),
      /* @__PURE__ */ O(It, { children: [
        /* @__PURE__ */ g(u2, { titleId: a.titleId }),
        /* @__PURE__ */ g(f2, { contentRef: l, descriptionId: a.descriptionId })
      ] })
    ] });
  }
), ec = "DialogTitle", Ng = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ot(ec, n);
    return /* @__PURE__ */ g(he.h2, { id: i.titleId, ...r, ref: t });
  }
);
Ng.displayName = ec;
var Ig = "DialogDescription", Dg = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ot(Ig, n);
    return /* @__PURE__ */ g(he.p, { id: i.descriptionId, ...r, ref: t });
  }
);
Dg.displayName = Ig;
var Mg = "DialogClose", Og = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ot(Mg, n);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: oe(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
Og.displayName = Mg;
function tc(e) {
  return e ? "open" : "closed";
}
var Lg = "DialogTitleWarning", [sO, _g] = N1(Lg, {
  contentName: Fn,
  titleName: ec,
  docsSlug: "dialog"
}), u2 = ({ titleId: e }) => {
  const t = _g(Lg), n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
  return y.useEffect(() => {
    e && (document.getElementById(e) || console.error(n));
  }, [n, e]), null;
}, d2 = "DialogDescriptionWarning", f2 = ({ contentRef: e, descriptionId: t }) => {
  const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${_g(d2).contentName}}.`;
  return y.useEffect(() => {
    var o;
    const i = (o = e.current) == null ? void 0 : o.getAttribute("aria-describedby");
    t && i && (document.getElementById(t) || console.warn(r));
  }, [r, e, t]), null;
}, h2 = Sg, p2 = Cg, m2 = Eg, g2 = Pg, y2 = Ag, v2 = Ng, b2 = Dg, x2 = Og;
function w2({ ...e }) {
  return /* @__PURE__ */ g(h2, { "data-slot": "sheet", ...e });
}
function S2({
  ...e
}) {
  return /* @__PURE__ */ g(p2, { "data-slot": "sheet-trigger", ...e });
}
function k2({
  ...e
}) {
  return /* @__PURE__ */ g(m2, { "data-slot": "sheet-portal", ...e });
}
function C2({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    g2,
    {
      "data-slot": "sheet-overlay",
      className: Q(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        e
      ),
      ...t
    }
  );
}
function T2({
  className: e,
  children: t,
  side: n = "right",
  ...r
}) {
  return /* @__PURE__ */ g(k2, { children: /* @__PURE__ */ O("div", { className: "chat-theme", children: [
    /* @__PURE__ */ g(C2, {}),
    /* @__PURE__ */ O(
      y2,
      {
        "data-slot": "sheet-content",
        className: Q(
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
          /* @__PURE__ */ O(x2, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ g(hr, { className: "size-4" }),
            /* @__PURE__ */ g("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] }) });
}
function E2({ className: e, ...t }) {
  return /* @__PURE__ */ g(
    "div",
    {
      "data-slot": "sheet-header",
      className: Q("flex flex-col gap-1.5 p-4", e),
      ...t
    }
  );
}
function P2({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    v2,
    {
      "data-slot": "sheet-title",
      className: Q("text-foreground font-semibold", e),
      ...t
    }
  );
}
function A2({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    b2,
    {
      "data-slot": "sheet-description",
      className: Q("text-muted-foreground text-sm", e),
      ...t
    }
  );
}
function R2({
  isOpen: e,
  onOpenChange: t,
  threads: n,
  currentThreadId: r,
  onSelectThread: i,
  onNewChat: o,
  isRefreshing: s,
  onFetchHistory: a,
  direction: l = "right"
}) {
  return /* @__PURE__ */ O(w2, { open: e, onOpenChange: t, children: [
    /* @__PURE__ */ g(S2, { asChild: !0, children: /* @__PURE__ */ g(
      $e,
      {
        variant: "ghost",
        size: "icon",
        onClick: a,
        title: "Chat History",
        className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
        children: /* @__PURE__ */ g(sc, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ O(T2, { side: l, className: "w-[300px] sm:w-[400px] border-l border-border/40 backdrop-blur-2xl", children: [
      /* @__PURE__ */ O(E2, { className: "mb-6", children: [
        /* @__PURE__ */ g(P2, { className: "text-xl font-bold tracking-tight", children: "Chat History" }),
        /* @__PURE__ */ g(A2, { className: "text-sm", children: "Select a previous conversation to continue." })
      ] }),
      /* @__PURE__ */ g("div", { className: "px-2", children: /* @__PURE__ */ O(
        $e,
        {
          variant: "outline",
          className: "w-full justify-start gap-2.5 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium",
          onClick: o,
          disabled: s,
          children: [
            /* @__PURE__ */ g(pf, { className: Q("h-4 w-4", s && "animate-spin") }),
            " New Conversation"
          ]
        }
      ) }),
      /* @__PURE__ */ g("div", { className: "flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-2 mt-6 custom-scrollbar", children: n.length === 0 ? /* @__PURE__ */ O("div", { className: "flex flex-col items-center justify-center py-12 px-4 text-center", children: [
        /* @__PURE__ */ g("div", { className: "h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/40", children: /* @__PURE__ */ g(sc, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ g("p", { className: "text-sm font-medium text-muted-foreground", children: "No recent conversations" }),
        /* @__PURE__ */ g("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Start chatting to see history here." })
      ] }) : n.map((c) => /* @__PURE__ */ O(
        "button",
        {
          className: Q(
            "group flex flex-col gap-1 w-full text-left p-3.5 rounded-xl transition-all duration-200 border border-transparent",
            r === c.thread_id ? "bg-primary/5 border-primary/20 shadow-sm" : "hover:bg-muted/50 hover:border-border/50"
          ),
          onClick: () => i(c.thread_id),
          children: [
            /* @__PURE__ */ g("span", { className: Q(
              "font-semibold truncate text-[13px]",
              r === c.thread_id ? "text-primary" : "text-foreground"
            ), children: c.thread_id || "Untitled Conversation" }),
            /* @__PURE__ */ O("span", { className: "text-[11px] text-muted-foreground flex items-center gap-2", children: [
              c.updated_at ? new Date(c.updated_at).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" }) : "Recently",
              /* @__PURE__ */ g("span", { className: "h-1 w-1 rounded-full bg-muted-foreground/30" }),
              c.updated_at ? new Date(c.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
            ] })
          ]
        },
        c.thread_id
      )) })
    ] })
  ] });
}
function so(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
// @__NO_SIDE_EFFECTS__
function rf(e) {
  const t = /* @__PURE__ */ N2(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(D2);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function N2(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = O2(i), a = M2(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? zn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var I2 = Symbol("radix.slottable");
function D2(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === I2;
}
function M2(e, t) {
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
function O2(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function Fg(e) {
  const t = e + "CollectionProvider", [n, r] = tn(t), [i, o] = n(
    t,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), s = (p) => {
    const { scope: b, children: v } = p, x = $.useRef(null), w = $.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ g(i, { scope: b, itemMap: w, collectionRef: x, children: v });
  };
  s.displayName = t;
  const a = e + "CollectionSlot", l = /* @__PURE__ */ rf(a), c = $.forwardRef(
    (p, b) => {
      const { scope: v, children: x } = p, w = o(a, v), E = be(b, w.collectionRef);
      return /* @__PURE__ */ g(l, { ref: E, children: x });
    }
  );
  c.displayName = a;
  const u = e + "CollectionItemSlot", d = "data-radix-collection-item", h = /* @__PURE__ */ rf(u), f = $.forwardRef(
    (p, b) => {
      const { scope: v, children: x, ...w } = p, E = $.useRef(null), T = be(b, E), k = o(u, v);
      return $.useEffect(() => (k.itemMap.set(E, { ref: E, ...w }), () => void k.itemMap.delete(E))), /* @__PURE__ */ g(h, { [d]: "", ref: T, children: x });
    }
  );
  f.displayName = u;
  function m(p) {
    const b = o(e + "CollectionConsumer", p);
    return $.useCallback(() => {
      const x = b.collectionRef.current;
      if (!x) return [];
      const w = Array.from(x.querySelectorAll(`[${d}]`));
      return Array.from(b.itemMap.values()).sort(
        (k, A) => w.indexOf(k.ref.current) - w.indexOf(A.ref.current)
      );
    }, [b.collectionRef, b.itemMap]);
  }
  return [
    { Provider: s, Slot: c, ItemSlot: f },
    m,
    r
  ];
}
var L2 = y.createContext(void 0);
function Vg(e) {
  const t = y.useContext(L2);
  return e || t || "ltr";
}
// @__NO_SIDE_EFFECTS__
function _2(e) {
  const t = /* @__PURE__ */ F2(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(B2);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function F2(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = $2(i), a = z2(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? zn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var V2 = Symbol("radix.slottable");
function B2(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === V2;
}
function z2(e, t) {
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
function $2(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function nc(e) {
  const t = y.useRef({ value: e, previous: e });
  return y.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
var j2 = [" ", "Enter", "ArrowUp", "ArrowDown"], U2 = [" ", "Enter"], Vn = "Select", [jo, Uo, H2] = Fg(Vn), [kr] = tn(Vn, [
  H2,
  Sr
]), Ho = Sr(), [W2, Sn] = kr(Vn), [q2, K2] = kr(Vn), Bg = (e) => {
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
  } = e, p = Ho(t), [b, v] = y.useState(null), [x, w] = y.useState(null), [E, T] = y.useState(!1), k = Vg(c), [A, D] = gn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Vn
  }), [F, P] = gn({
    prop: s,
    defaultProp: a,
    onChange: l,
    caller: Vn
  }), N = y.useRef(null), R = b ? m || !!b.closest("form") : !0, [B, j] = y.useState(/* @__PURE__ */ new Set()), H = Array.from(B).map((V) => V.props.value).join(";");
  return /* @__PURE__ */ g(Ul, { ...p, children: /* @__PURE__ */ O(
    W2,
    {
      required: f,
      scope: t,
      trigger: b,
      onTriggerChange: v,
      valueNode: x,
      onValueNodeChange: w,
      valueNodeHasChildren: E,
      onValueNodeHasChildrenChange: T,
      contentId: Xt(),
      value: F,
      onValueChange: P,
      open: A,
      onOpenChange: D,
      dir: k,
      triggerPointerDownPosRef: N,
      disabled: h,
      children: [
        /* @__PURE__ */ g(jo.Provider, { scope: t, children: /* @__PURE__ */ g(
          q2,
          {
            scope: e.__scopeSelect,
            onNativeOptionAdd: y.useCallback((V) => {
              j((I) => new Set(I).add(V));
            }, []),
            onNativeOptionRemove: y.useCallback((V) => {
              j((I) => {
                const _ = new Set(I);
                return _.delete(V), _;
              });
            }, []),
            children: n
          }
        ) }),
        R ? /* @__PURE__ */ O(
          ay,
          {
            "aria-hidden": !0,
            required: f,
            tabIndex: -1,
            name: u,
            autoComplete: d,
            value: F,
            onChange: (V) => P(V.target.value),
            disabled: h,
            form: m,
            children: [
              F === void 0 ? /* @__PURE__ */ g("option", { value: "" }) : null,
              Array.from(B)
            ]
          },
          H
        ) : null
      ]
    }
  ) });
};
Bg.displayName = Vn;
var zg = "SelectTrigger", $g = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, disabled: r = !1, ...i } = e, o = Ho(n), s = Sn(zg, n), a = s.disabled || r, l = be(t, s.onTriggerChange), c = Uo(n), u = y.useRef("touch"), [d, h, f] = cy((p) => {
      const b = c().filter((w) => !w.disabled), v = b.find((w) => w.value === s.value), x = uy(b, p, v);
      x !== void 0 && s.onValueChange(x.value);
    }), m = (p) => {
      a || (s.onOpenChange(!0), f()), p && (s.triggerPointerDownPosRef.current = {
        x: Math.round(p.pageX),
        y: Math.round(p.pageY)
      });
    };
    return /* @__PURE__ */ g(Lo, { asChild: !0, ...o, children: /* @__PURE__ */ g(
      he.button,
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
        "data-placeholder": ly(s.value) ? "" : void 0,
        ...i,
        ref: l,
        onClick: oe(i.onClick, (p) => {
          p.currentTarget.focus(), u.current !== "mouse" && m(p);
        }),
        onPointerDown: oe(i.onPointerDown, (p) => {
          u.current = p.pointerType;
          const b = p.target;
          b.hasPointerCapture(p.pointerId) && b.releasePointerCapture(p.pointerId), p.button === 0 && p.ctrlKey === !1 && p.pointerType === "mouse" && (m(p), p.preventDefault());
        }),
        onKeyDown: oe(i.onKeyDown, (p) => {
          const b = d.current !== "";
          !(p.ctrlKey || p.altKey || p.metaKey) && p.key.length === 1 && h(p.key), !(b && p.key === " ") && j2.includes(p.key) && (m(), p.preventDefault());
        })
      }
    ) });
  }
);
$g.displayName = zg;
var jg = "SelectValue", Ug = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, children: o, placeholder: s = "", ...a } = e, l = Sn(jg, n), { onValueNodeHasChildrenChange: c } = l, u = o !== void 0, d = be(t, l.onValueNodeChange);
    return He(() => {
      c(u);
    }, [c, u]), /* @__PURE__ */ g(
      he.span,
      {
        ...a,
        ref: d,
        style: { pointerEvents: "none" },
        children: ly(l.value) ? /* @__PURE__ */ g(It, { children: s }) : o
      }
    );
  }
);
Ug.displayName = jg;
var G2 = "SelectIcon", Hg = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, children: r, ...i } = e;
    return /* @__PURE__ */ g(he.span, { "aria-hidden": !0, ...i, ref: t, children: r || "▼" });
  }
);
Hg.displayName = G2;
var Y2 = "SelectPortal", Wg = (e) => /* @__PURE__ */ g(ci, { asChild: !0, ...e });
Wg.displayName = Y2;
var Bn = "SelectContent", qg = y.forwardRef(
  (e, t) => {
    const n = Sn(Bn, e.__scopeSelect), [r, i] = y.useState();
    if (He(() => {
      i(new DocumentFragment());
    }, []), !n.open) {
      const o = r;
      return o ? ho.createPortal(
        /* @__PURE__ */ g(Kg, { scope: e.__scopeSelect, children: /* @__PURE__ */ g(jo.Slot, { scope: e.__scopeSelect, children: /* @__PURE__ */ g("div", { children: e.children }) }) }),
        o
      ) : null;
    }
    return /* @__PURE__ */ g(Gg, { ...e, ref: t });
  }
);
qg.displayName = Bn;
var Rt = 10, [Kg, kn] = kr(Bn), X2 = "SelectContentImpl", Z2 = /* @__PURE__ */ _2("SelectContent.RemoveScroll"), Gg = y.forwardRef(
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
      avoidCollisions: b,
      //
      ...v
    } = e, x = Sn(Bn, n), [w, E] = y.useState(null), [T, k] = y.useState(null), A = be(t, (W) => E(W)), [D, F] = y.useState(null), [P, N] = y.useState(
      null
    ), R = Uo(n), [B, j] = y.useState(!1), H = y.useRef(!1);
    y.useEffect(() => {
      if (w) return ql(w);
    }, [w]), Ml();
    const V = y.useCallback(
      (W) => {
        const [ne, ...pe] = R().map((me) => me.ref.current), [se] = pe.slice(-1), ce = document.activeElement;
        for (const me of W)
          if (me === ce || (me == null || me.scrollIntoView({ block: "nearest" }), me === ne && T && (T.scrollTop = 0), me === se && T && (T.scrollTop = T.scrollHeight), me == null || me.focus(), document.activeElement !== ce)) return;
      },
      [R, T]
    ), I = y.useCallback(
      () => V([D, w]),
      [V, D, w]
    );
    y.useEffect(() => {
      B && I();
    }, [B, I]);
    const { onOpenChange: _, triggerPointerDownPosRef: L } = x;
    y.useEffect(() => {
      if (w) {
        let W = { x: 0, y: 0 };
        const ne = (se) => {
          var ce, me;
          W = {
            x: Math.abs(Math.round(se.pageX) - (((ce = L.current) == null ? void 0 : ce.x) ?? 0)),
            y: Math.abs(Math.round(se.pageY) - (((me = L.current) == null ? void 0 : me.y) ?? 0))
          };
        }, pe = (se) => {
          W.x <= 10 && W.y <= 10 ? se.preventDefault() : w.contains(se.target) || _(!1), document.removeEventListener("pointermove", ne), L.current = null;
        };
        return L.current !== null && (document.addEventListener("pointermove", ne), document.addEventListener("pointerup", pe, { capture: !0, once: !0 })), () => {
          document.removeEventListener("pointermove", ne), document.removeEventListener("pointerup", pe, { capture: !0 });
        };
      }
    }, [w, _, L]), y.useEffect(() => {
      const W = () => _(!1);
      return window.addEventListener("blur", W), window.addEventListener("resize", W), () => {
        window.removeEventListener("blur", W), window.removeEventListener("resize", W);
      };
    }, [_]);
    const [S, ee] = cy((W) => {
      const ne = R().filter((ce) => !ce.disabled), pe = ne.find((ce) => ce.ref.current === document.activeElement), se = uy(ne, W, pe);
      se && setTimeout(() => se.ref.current.focus());
    }), Y = y.useCallback(
      (W, ne, pe) => {
        const se = !H.current && !pe;
        (x.value !== void 0 && x.value === ne || se) && (F(W), se && (H.current = !0));
      },
      [x.value]
    ), C = y.useCallback(() => w == null ? void 0 : w.focus(), [w]), q = y.useCallback(
      (W, ne, pe) => {
        const se = !H.current && !pe;
        (x.value !== void 0 && x.value === ne || se) && N(W);
      },
      [x.value]
    ), Z = r === "popper" ? ya : Yg, ie = Z === ya ? {
      side: a,
      sideOffset: l,
      align: c,
      alignOffset: u,
      arrowPadding: d,
      collisionBoundary: h,
      collisionPadding: f,
      sticky: m,
      hideWhenDetached: p,
      avoidCollisions: b
    } : {};
    return /* @__PURE__ */ g(
      Kg,
      {
        scope: n,
        content: w,
        viewport: T,
        onViewportChange: k,
        itemRefCallback: Y,
        selectedItem: D,
        onItemLeave: C,
        itemTextRefCallback: q,
        focusSelectedItem: I,
        selectedItemText: P,
        position: r,
        isPositioned: B,
        searchRef: S,
        children: /* @__PURE__ */ g(Fo, { as: Z2, allowPinchZoom: !0, children: /* @__PURE__ */ g(
          No,
          {
            asChild: !0,
            trapped: x.open,
            onMountAutoFocus: (W) => {
              W.preventDefault();
            },
            onUnmountAutoFocus: oe(i, (W) => {
              var ne;
              (ne = x.trigger) == null || ne.focus({ preventScroll: !0 }), W.preventDefault();
            }),
            children: /* @__PURE__ */ g(
              ai,
              {
                asChild: !0,
                disableOutsidePointerEvents: !0,
                onEscapeKeyDown: o,
                onPointerDownOutside: s,
                onFocusOutside: (W) => W.preventDefault(),
                onDismiss: () => x.onOpenChange(!1),
                children: /* @__PURE__ */ g(
                  Z,
                  {
                    role: "listbox",
                    id: x.contentId,
                    "data-state": x.open ? "open" : "closed",
                    dir: x.dir,
                    onContextMenu: (W) => W.preventDefault(),
                    ...v,
                    ...ie,
                    onPlaced: () => j(!0),
                    ref: A,
                    style: {
                      // flex layout so we can place the scroll buttons properly
                      display: "flex",
                      flexDirection: "column",
                      // reset the outline by default as the content MAY get focused
                      outline: "none",
                      ...v.style
                    },
                    onKeyDown: oe(v.onKeyDown, (W) => {
                      const ne = W.ctrlKey || W.altKey || W.metaKey;
                      if (W.key === "Tab" && W.preventDefault(), !ne && W.key.length === 1 && ee(W.key), ["ArrowUp", "ArrowDown", "Home", "End"].includes(W.key)) {
                        let se = R().filter((ce) => !ce.disabled).map((ce) => ce.ref.current);
                        if (["ArrowUp", "End"].includes(W.key) && (se = se.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(W.key)) {
                          const ce = W.target, me = se.indexOf(ce);
                          se = se.slice(me + 1);
                        }
                        setTimeout(() => V(se)), W.preventDefault();
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
Gg.displayName = X2;
var J2 = "SelectItemAlignedPosition", Yg = y.forwardRef((e, t) => {
  const { __scopeSelect: n, onPlaced: r, ...i } = e, o = Sn(Bn, n), s = kn(Bn, n), [a, l] = y.useState(null), [c, u] = y.useState(null), d = be(t, (A) => u(A)), h = Uo(n), f = y.useRef(!1), m = y.useRef(!0), { viewport: p, selectedItem: b, selectedItemText: v, focusSelectedItem: x } = s, w = y.useCallback(() => {
    if (o.trigger && o.valueNode && a && c && p && b && v) {
      const A = o.trigger.getBoundingClientRect(), D = c.getBoundingClientRect(), F = o.valueNode.getBoundingClientRect(), P = v.getBoundingClientRect();
      if (o.dir !== "rtl") {
        const ce = P.left - D.left, me = F.left - ce, Me = A.left - me, We = A.width + Me, ut = Math.max(We, D.width), rt = window.innerWidth - Rt, vt = so(me, [
          Rt,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(Rt, rt - ut)
        ]);
        a.style.minWidth = We + "px", a.style.left = vt + "px";
      } else {
        const ce = D.right - P.right, me = window.innerWidth - F.right - ce, Me = window.innerWidth - A.right - me, We = A.width + Me, ut = Math.max(We, D.width), rt = window.innerWidth - Rt, vt = so(me, [
          Rt,
          Math.max(Rt, rt - ut)
        ]);
        a.style.minWidth = We + "px", a.style.right = vt + "px";
      }
      const N = h(), R = window.innerHeight - Rt * 2, B = p.scrollHeight, j = window.getComputedStyle(c), H = parseInt(j.borderTopWidth, 10), V = parseInt(j.paddingTop, 10), I = parseInt(j.borderBottomWidth, 10), _ = parseInt(j.paddingBottom, 10), L = H + V + B + _ + I, S = Math.min(b.offsetHeight * 5, L), ee = window.getComputedStyle(p), Y = parseInt(ee.paddingTop, 10), C = parseInt(ee.paddingBottom, 10), q = A.top + A.height / 2 - Rt, Z = R - q, ie = b.offsetHeight / 2, W = b.offsetTop + ie, ne = H + V + W, pe = L - ne;
      if (ne <= q) {
        const ce = N.length > 0 && b === N[N.length - 1].ref.current;
        a.style.bottom = "0px";
        const me = c.clientHeight - p.offsetTop - p.offsetHeight, Me = Math.max(
          Z,
          ie + // viewport might have padding bottom, include it to avoid a scrollable viewport
          (ce ? C : 0) + me + I
        ), We = ne + Me;
        a.style.height = We + "px";
      } else {
        const ce = N.length > 0 && b === N[0].ref.current;
        a.style.top = "0px";
        const Me = Math.max(
          q,
          H + p.offsetTop + // viewport might have padding top, include it to avoid a scrollable viewport
          (ce ? Y : 0) + ie
        ) + pe;
        a.style.height = Me + "px", p.scrollTop = ne - q + p.offsetTop;
      }
      a.style.margin = `${Rt}px 0`, a.style.minHeight = S + "px", a.style.maxHeight = R + "px", r == null || r(), requestAnimationFrame(() => f.current = !0);
    }
  }, [
    h,
    o.trigger,
    o.valueNode,
    a,
    c,
    p,
    b,
    v,
    o.dir,
    r
  ]);
  He(() => w(), [w]);
  const [E, T] = y.useState();
  He(() => {
    c && T(window.getComputedStyle(c).zIndex);
  }, [c]);
  const k = y.useCallback(
    (A) => {
      A && m.current === !0 && (w(), x == null || x(), m.current = !1);
    },
    [w, x]
  );
  return /* @__PURE__ */ g(
    eM,
    {
      scope: n,
      contentWrapper: a,
      shouldExpandOnScrollRef: f,
      onScrollButtonChange: k,
      children: /* @__PURE__ */ g(
        "div",
        {
          ref: l,
          style: {
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            zIndex: E
          },
          children: /* @__PURE__ */ g(
            he.div,
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
Yg.displayName = J2;
var Q2 = "SelectPopperPosition", ya = y.forwardRef((e, t) => {
  const {
    __scopeSelect: n,
    align: r = "start",
    collisionPadding: i = Rt,
    ...o
  } = e, s = Ho(n);
  return /* @__PURE__ */ g(
    Hl,
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
ya.displayName = Q2;
var [eM, rc] = kr(Bn, {}), va = "SelectViewport", Xg = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, nonce: r, ...i } = e, o = kn(va, n), s = rc(va, n), a = be(t, o.onViewportChange), l = y.useRef(0);
    return /* @__PURE__ */ O(It, { children: [
      /* @__PURE__ */ g(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}"
          },
          nonce: r
        }
      ),
      /* @__PURE__ */ g(jo.Slot, { scope: n, children: /* @__PURE__ */ g(
        he.div,
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
          onScroll: oe(i.onScroll, (c) => {
            const u = c.currentTarget, { contentWrapper: d, shouldExpandOnScrollRef: h } = s;
            if (h != null && h.current && d) {
              const f = Math.abs(l.current - u.scrollTop);
              if (f > 0) {
                const m = window.innerHeight - Rt * 2, p = parseFloat(d.style.minHeight), b = parseFloat(d.style.height), v = Math.max(p, b);
                if (v < m) {
                  const x = v + f, w = Math.min(m, x), E = x - w;
                  d.style.height = w + "px", d.style.bottom === "0px" && (u.scrollTop = E > 0 ? E : 0, d.style.justifyContent = "flex-end");
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
Xg.displayName = va;
var Zg = "SelectGroup", [tM, nM] = kr(Zg), rM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = Xt();
    return /* @__PURE__ */ g(tM, { scope: n, id: i, children: /* @__PURE__ */ g(he.div, { role: "group", "aria-labelledby": i, ...r, ref: t }) });
  }
);
rM.displayName = Zg;
var Jg = "SelectLabel", iM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = nM(Jg, n);
    return /* @__PURE__ */ g(he.div, { id: i.id, ...r, ref: t });
  }
);
iM.displayName = Jg;
var ao = "SelectItem", [oM, Qg] = kr(ao), ey = y.forwardRef(
  (e, t) => {
    const {
      __scopeSelect: n,
      value: r,
      disabled: i = !1,
      textValue: o,
      ...s
    } = e, a = Sn(ao, n), l = kn(ao, n), c = a.value === r, [u, d] = y.useState(o ?? ""), [h, f] = y.useState(!1), m = be(
      t,
      (x) => {
        var w;
        return (w = l.itemRefCallback) == null ? void 0 : w.call(l, x, r, i);
      }
    ), p = Xt(), b = y.useRef("touch"), v = () => {
      i || (a.onValueChange(r), a.onOpenChange(!1));
    };
    if (r === "")
      throw new Error(
        "A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
      );
    return /* @__PURE__ */ g(
      oM,
      {
        scope: n,
        value: r,
        disabled: i,
        textId: p,
        isSelected: c,
        onItemTextChange: y.useCallback((x) => {
          d((w) => w || ((x == null ? void 0 : x.textContent) ?? "").trim());
        }, []),
        children: /* @__PURE__ */ g(
          jo.ItemSlot,
          {
            scope: n,
            value: r,
            disabled: i,
            textValue: u,
            children: /* @__PURE__ */ g(
              he.div,
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
                onFocus: oe(s.onFocus, () => f(!0)),
                onBlur: oe(s.onBlur, () => f(!1)),
                onClick: oe(s.onClick, () => {
                  b.current !== "mouse" && v();
                }),
                onPointerUp: oe(s.onPointerUp, () => {
                  b.current === "mouse" && v();
                }),
                onPointerDown: oe(s.onPointerDown, (x) => {
                  b.current = x.pointerType;
                }),
                onPointerMove: oe(s.onPointerMove, (x) => {
                  var w;
                  b.current = x.pointerType, i ? (w = l.onItemLeave) == null || w.call(l) : b.current === "mouse" && x.currentTarget.focus({ preventScroll: !0 });
                }),
                onPointerLeave: oe(s.onPointerLeave, (x) => {
                  var w;
                  x.currentTarget === document.activeElement && ((w = l.onItemLeave) == null || w.call(l));
                }),
                onKeyDown: oe(s.onKeyDown, (x) => {
                  var E;
                  ((E = l.searchRef) == null ? void 0 : E.current) !== "" && x.key === " " || (U2.includes(x.key) && v(), x.key === " " && x.preventDefault());
                })
              }
            )
          }
        )
      }
    );
  }
);
ey.displayName = ao;
var Or = "SelectItemText", ty = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, ...o } = e, s = Sn(Or, n), a = kn(Or, n), l = Qg(Or, n), c = K2(Or, n), [u, d] = y.useState(null), h = be(
      t,
      (v) => d(v),
      l.onItemTextChange,
      (v) => {
        var x;
        return (x = a.itemTextRefCallback) == null ? void 0 : x.call(a, v, l.value, l.disabled);
      }
    ), f = u == null ? void 0 : u.textContent, m = y.useMemo(
      () => /* @__PURE__ */ g("option", { value: l.value, disabled: l.disabled, children: f }, l.value),
      [l.disabled, l.value, f]
    ), { onNativeOptionAdd: p, onNativeOptionRemove: b } = c;
    return He(() => (p(m), () => b(m)), [p, b, m]), /* @__PURE__ */ O(It, { children: [
      /* @__PURE__ */ g(he.span, { id: l.textId, ...o, ref: h }),
      l.isSelected && s.valueNode && !s.valueNodeHasChildren ? ho.createPortal(o.children, s.valueNode) : null
    ] });
  }
);
ty.displayName = Or;
var ny = "SelectItemIndicator", ry = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return Qg(ny, n).isSelected ? /* @__PURE__ */ g(he.span, { "aria-hidden": !0, ...r, ref: t }) : null;
  }
);
ry.displayName = ny;
var ba = "SelectScrollUpButton", iy = y.forwardRef((e, t) => {
  const n = kn(ba, e.__scopeSelect), r = rc(ba, e.__scopeSelect), [i, o] = y.useState(!1), s = be(t, r.onScrollButtonChange);
  return He(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollTop > 0;
        o(c);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ g(
    sy,
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
iy.displayName = ba;
var xa = "SelectScrollDownButton", oy = y.forwardRef((e, t) => {
  const n = kn(xa, e.__scopeSelect), r = rc(xa, e.__scopeSelect), [i, o] = y.useState(!1), s = be(t, r.onScrollButtonChange);
  return He(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollHeight - l.clientHeight, u = Math.ceil(l.scrollTop) < c;
        o(u);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ g(
    sy,
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
oy.displayName = xa;
var sy = y.forwardRef((e, t) => {
  const { __scopeSelect: n, onAutoScroll: r, ...i } = e, o = kn("SelectScrollButton", n), s = y.useRef(null), a = Uo(n), l = y.useCallback(() => {
    s.current !== null && (window.clearInterval(s.current), s.current = null);
  }, []);
  return y.useEffect(() => () => l(), [l]), He(() => {
    var u;
    const c = a().find((d) => d.ref.current === document.activeElement);
    (u = c == null ? void 0 : c.ref.current) == null || u.scrollIntoView({ block: "nearest" });
  }, [a]), /* @__PURE__ */ g(
    he.div,
    {
      "aria-hidden": !0,
      ...i,
      ref: t,
      style: { flexShrink: 0, ...i.style },
      onPointerDown: oe(i.onPointerDown, () => {
        s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerMove: oe(i.onPointerMove, () => {
        var c;
        (c = o.onItemLeave) == null || c.call(o), s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerLeave: oe(i.onPointerLeave, () => {
        l();
      })
    }
  );
}), sM = "SelectSeparator", aM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return /* @__PURE__ */ g(he.div, { "aria-hidden": !0, ...r, ref: t });
  }
);
aM.displayName = sM;
var wa = "SelectArrow", lM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = Ho(n), o = Sn(wa, n), s = kn(wa, n);
    return o.open && s.position === "popper" ? /* @__PURE__ */ g(Wl, { ...i, ...r, ref: t }) : null;
  }
);
lM.displayName = wa;
var cM = "SelectBubbleInput", ay = y.forwardRef(
  ({ __scopeSelect: e, value: t, ...n }, r) => {
    const i = y.useRef(null), o = be(r, i), s = nc(t);
    return y.useEffect(() => {
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
    }, [s, t]), /* @__PURE__ */ g(
      he.select,
      {
        ...n,
        style: { ...rg, ...n.style },
        ref: o,
        defaultValue: t
      }
    );
  }
);
ay.displayName = cM;
function ly(e) {
  return e === "" || e === void 0;
}
function cy(e) {
  const t = Ln(e), n = y.useRef(""), r = y.useRef(0), i = y.useCallback(
    (s) => {
      const a = n.current + s;
      t(a), function l(c) {
        n.current = c, window.clearTimeout(r.current), c !== "" && (r.current = window.setTimeout(() => l(""), 1e3));
      }(a);
    },
    [t]
  ), o = y.useCallback(() => {
    n.current = "", window.clearTimeout(r.current);
  }, []);
  return y.useEffect(() => () => window.clearTimeout(r.current), []), [n, i, o];
}
function uy(e, t, n) {
  const i = t.length > 1 && Array.from(t).every((c) => c === t[0]) ? t[0] : t, o = n ? e.indexOf(n) : -1;
  let s = uM(e, Math.max(o, 0));
  i.length === 1 && (s = s.filter((c) => c !== n));
  const l = s.find(
    (c) => c.textValue.toLowerCase().startsWith(i.toLowerCase())
  );
  return l !== n ? l : void 0;
}
function uM(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
var dM = Bg, fM = $g, hM = Ug, pM = Hg, mM = Wg, gM = qg, yM = Xg, vM = ey, bM = ty, xM = ry, wM = iy, SM = oy;
function lo({
  ...e
}) {
  return /* @__PURE__ */ g(dM, { "data-slot": "select", ...e });
}
function co({
  ...e
}) {
  return /* @__PURE__ */ g(hM, { "data-slot": "select-value", ...e });
}
function uo({
  className: e,
  size: t = "default",
  children: n,
  ...r
}) {
  return /* @__PURE__ */ O(
    fM,
    {
      "data-slot": "select-trigger",
      "data-size": t,
      className: Q(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...r,
      children: [
        n,
        /* @__PURE__ */ g(pM, { asChild: !0, children: /* @__PURE__ */ g(df, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function fo({
  className: e,
  children: t,
  position: n = "item-aligned",
  align: r = "center",
  ...i
}) {
  return /* @__PURE__ */ g(mM, { children: /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ O(
    gM,
    {
      "data-slot": "select-content",
      className: Q(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        e
      ),
      position: n,
      align: r,
      ...i,
      children: [
        /* @__PURE__ */ g(kM, {}),
        /* @__PURE__ */ g(
          yM,
          {
            className: Q(
              "p-1",
              n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children: t
          }
        ),
        /* @__PURE__ */ g(CM, {})
      ]
    }
  ) }) });
}
function Ge({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ O(
    vM,
    {
      "data-slot": "select-item",
      className: Q(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...n,
      children: [
        /* @__PURE__ */ g(
          "span",
          {
            "data-slot": "select-item-indicator",
            className: "absolute right-2 flex size-3.5 items-center justify-center",
            children: /* @__PURE__ */ g(xM, { children: /* @__PURE__ */ g(uf, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ g(bM, { children: t })
      ]
    }
  );
}
function kM({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    wM,
    {
      "data-slot": "select-scroll-up-button",
      className: Q(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ g(Zy, { className: "size-4" })
    }
  );
}
function CM({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    SM,
    {
      "data-slot": "select-scroll-down-button",
      className: Q(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ g(df, { className: "size-4" })
    }
  );
}
var TM = [
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
], EM = TM.reduce((e, t) => {
  const n = /* @__PURE__ */ Cf(`Primitive.${t}`), r = y.forwardRef((i, o) => {
    const { asChild: s, ...a } = i, l = s ? n : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ g(l, { ...a, ref: o });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {}), PM = "Label", dy = y.forwardRef((e, t) => /* @__PURE__ */ g(
  EM.label,
  {
    ...e,
    ref: t,
    onMouseDown: (n) => {
      var i;
      n.target.closest("button, input, select, textarea") || ((i = e.onMouseDown) == null || i.call(e, n), !n.defaultPrevented && n.detail > 1 && n.preventDefault());
    }
  }
));
dy.displayName = PM;
var fy = dy;
const Nn = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ g(
  fy,
  {
    ref: n,
    "data-slot": "label",
    className: Q(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      e
    ),
    ...t
  }
));
Nn.displayName = fy.displayName;
var hy = ["PageUp", "PageDown"], py = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], my = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, Cr = "Slider", [Sa, AM, RM] = Fg(Cr), [gy] = tn(Cr, [
  RM
]), [NM, Wo] = gy(Cr), yy = y.forwardRef(
  (e, t) => {
    const {
      name: n,
      min: r = 0,
      max: i = 100,
      step: o = 1,
      orientation: s = "horizontal",
      disabled: a = !1,
      minStepsBetweenThumbs: l = 0,
      defaultValue: c = [r],
      value: u,
      onValueChange: d = () => {
      },
      onValueCommit: h = () => {
      },
      inverted: f = !1,
      form: m,
      ...p
    } = e, b = y.useRef(/* @__PURE__ */ new Set()), v = y.useRef(0), w = s === "horizontal" ? IM : DM, [E = [], T] = gn({
      prop: u,
      defaultProp: c,
      onChange: (N) => {
        var B;
        (B = [...b.current][v.current]) == null || B.focus(), d(N);
      }
    }), k = y.useRef(E);
    function A(N) {
      const R = FM(E, N);
      P(N, R);
    }
    function D(N) {
      P(N, v.current);
    }
    function F() {
      const N = k.current[v.current];
      E[v.current] !== N && h(E);
    }
    function P(N, R, { commit: B } = { commit: !1 }) {
      const j = $M(o), H = jM(Math.round((N - r) / o) * o + r, j), V = so(H, [r, i]);
      T((I = []) => {
        const _ = LM(I, V, R);
        if (zM(_, l * o)) {
          v.current = _.indexOf(V);
          const L = String(_) !== String(I);
          return L && B && h(_), L ? _ : I;
        } else
          return I;
      });
    }
    return /* @__PURE__ */ g(
      NM,
      {
        scope: e.__scopeSlider,
        name: n,
        disabled: a,
        min: r,
        max: i,
        valueIndexToChangeRef: v,
        thumbs: b.current,
        values: E,
        orientation: s,
        form: m,
        children: /* @__PURE__ */ g(Sa.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(Sa.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(
          w,
          {
            "aria-disabled": a,
            "data-disabled": a ? "" : void 0,
            ...p,
            ref: t,
            onPointerDown: oe(p.onPointerDown, () => {
              a || (k.current = E);
            }),
            min: r,
            max: i,
            inverted: f,
            onSlideStart: a ? void 0 : A,
            onSlideMove: a ? void 0 : D,
            onSlideEnd: a ? void 0 : F,
            onHomeKeyDown: () => !a && P(r, 0, { commit: !0 }),
            onEndKeyDown: () => !a && P(i, E.length - 1, { commit: !0 }),
            onStepKeyDown: ({ event: N, direction: R }) => {
              if (!a) {
                const H = hy.includes(N.key) || N.shiftKey && py.includes(N.key) ? 10 : 1, V = v.current, I = E[V], _ = o * H * R;
                P(I + _, V, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
yy.displayName = Cr;
var [vy, by] = gy(Cr, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), IM = y.forwardRef(
  (e, t) => {
    const {
      min: n,
      max: r,
      dir: i,
      inverted: o,
      onSlideStart: s,
      onSlideMove: a,
      onSlideEnd: l,
      onStepKeyDown: c,
      ...u
    } = e, [d, h] = y.useState(null), f = be(t, (w) => h(w)), m = y.useRef(void 0), p = Vg(i), b = p === "ltr", v = b && !o || !b && o;
    function x(w) {
      const E = m.current || d.getBoundingClientRect(), T = [0, E.width], A = ic(T, v ? [n, r] : [r, n]);
      return m.current = E, A(w - E.left);
    }
    return /* @__PURE__ */ g(
      vy,
      {
        scope: e.__scopeSlider,
        startEdge: v ? "left" : "right",
        endEdge: v ? "right" : "left",
        direction: v ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ g(
          xy,
          {
            dir: p,
            "data-orientation": "horizontal",
            ...u,
            ref: f,
            style: {
              ...u.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (w) => {
              const E = x(w.clientX);
              s == null || s(E);
            },
            onSlideMove: (w) => {
              const E = x(w.clientX);
              a == null || a(E);
            },
            onSlideEnd: () => {
              m.current = void 0, l == null || l();
            },
            onStepKeyDown: (w) => {
              const T = my[v ? "from-left" : "from-right"].includes(w.key);
              c == null || c({ event: w, direction: T ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), DM = y.forwardRef(
  (e, t) => {
    const {
      min: n,
      max: r,
      inverted: i,
      onSlideStart: o,
      onSlideMove: s,
      onSlideEnd: a,
      onStepKeyDown: l,
      ...c
    } = e, u = y.useRef(null), d = be(t, u), h = y.useRef(void 0), f = !i;
    function m(p) {
      const b = h.current || u.current.getBoundingClientRect(), v = [0, b.height], w = ic(v, f ? [r, n] : [n, r]);
      return h.current = b, w(p - b.top);
    }
    return /* @__PURE__ */ g(
      vy,
      {
        scope: e.__scopeSlider,
        startEdge: f ? "bottom" : "top",
        endEdge: f ? "top" : "bottom",
        size: "height",
        direction: f ? 1 : -1,
        children: /* @__PURE__ */ g(
          xy,
          {
            "data-orientation": "vertical",
            ...c,
            ref: d,
            style: {
              ...c.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (p) => {
              const b = m(p.clientY);
              o == null || o(b);
            },
            onSlideMove: (p) => {
              const b = m(p.clientY);
              s == null || s(b);
            },
            onSlideEnd: () => {
              h.current = void 0, a == null || a();
            },
            onStepKeyDown: (p) => {
              const v = my[f ? "from-bottom" : "from-top"].includes(p.key);
              l == null || l({ event: p, direction: v ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), xy = y.forwardRef(
  (e, t) => {
    const {
      __scopeSlider: n,
      onSlideStart: r,
      onSlideMove: i,
      onSlideEnd: o,
      onHomeKeyDown: s,
      onEndKeyDown: a,
      onStepKeyDown: l,
      ...c
    } = e, u = Wo(Cr, n);
    return /* @__PURE__ */ g(
      he.span,
      {
        ...c,
        ref: t,
        onKeyDown: oe(e.onKeyDown, (d) => {
          d.key === "Home" ? (s(d), d.preventDefault()) : d.key === "End" ? (a(d), d.preventDefault()) : hy.concat(py).includes(d.key) && (l(d), d.preventDefault());
        }),
        onPointerDown: oe(e.onPointerDown, (d) => {
          const h = d.target;
          h.setPointerCapture(d.pointerId), d.preventDefault(), u.thumbs.has(h) ? h.focus() : r(d);
        }),
        onPointerMove: oe(e.onPointerMove, (d) => {
          d.target.hasPointerCapture(d.pointerId) && i(d);
        }),
        onPointerUp: oe(e.onPointerUp, (d) => {
          const h = d.target;
          h.hasPointerCapture(d.pointerId) && (h.releasePointerCapture(d.pointerId), o(d));
        })
      }
    );
  }
), wy = "SliderTrack", Sy = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...r } = e, i = Wo(wy, n);
    return /* @__PURE__ */ g(
      he.span,
      {
        "data-disabled": i.disabled ? "" : void 0,
        "data-orientation": i.orientation,
        ...r,
        ref: t
      }
    );
  }
);
Sy.displayName = wy;
var ka = "SliderRange", ky = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...r } = e, i = Wo(ka, n), o = by(ka, n), s = y.useRef(null), a = be(t, s), l = i.values.length, c = i.values.map(
      (h) => Ey(h, i.min, i.max)
    ), u = l > 1 ? Math.min(...c) : 0, d = 100 - Math.max(...c);
    return /* @__PURE__ */ g(
      he.span,
      {
        "data-orientation": i.orientation,
        "data-disabled": i.disabled ? "" : void 0,
        ...r,
        ref: a,
        style: {
          ...e.style,
          [o.startEdge]: u + "%",
          [o.endEdge]: d + "%"
        }
      }
    );
  }
);
ky.displayName = ka;
var Ca = "SliderThumb", Cy = y.forwardRef(
  (e, t) => {
    const n = AM(e.__scopeSlider), [r, i] = y.useState(null), o = be(t, (a) => i(a)), s = y.useMemo(
      () => r ? n().findIndex((a) => a.ref.current === r) : -1,
      [n, r]
    );
    return /* @__PURE__ */ g(MM, { ...e, ref: o, index: s });
  }
), MM = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, index: r, name: i, ...o } = e, s = Wo(Ca, n), a = by(Ca, n), [l, c] = y.useState(null), u = be(t, (x) => c(x)), d = l ? s.form || !!l.closest("form") : !0, h = zl(l), f = s.values[r], m = f === void 0 ? 0 : Ey(f, s.min, s.max), p = _M(r, s.values.length), b = h == null ? void 0 : h[a.size], v = b ? VM(b, m, a.direction) : 0;
    return y.useEffect(() => {
      if (l)
        return s.thumbs.add(l), () => {
          s.thumbs.delete(l);
        };
    }, [l, s.thumbs]), /* @__PURE__ */ O(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [a.startEdge]: `calc(${m}% + ${v}px)`
        },
        children: [
          /* @__PURE__ */ g(Sa.ItemSlot, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(
            he.span,
            {
              role: "slider",
              "aria-label": e["aria-label"] || p,
              "aria-valuemin": s.min,
              "aria-valuenow": f,
              "aria-valuemax": s.max,
              "aria-orientation": s.orientation,
              "data-orientation": s.orientation,
              "data-disabled": s.disabled ? "" : void 0,
              tabIndex: s.disabled ? void 0 : 0,
              ...o,
              ref: u,
              style: f === void 0 ? { display: "none" } : e.style,
              onFocus: oe(e.onFocus, () => {
                s.valueIndexToChangeRef.current = r;
              })
            }
          ) }),
          d && /* @__PURE__ */ g(
            Ty,
            {
              name: i ?? (s.name ? s.name + (s.values.length > 1 ? "[]" : "") : void 0),
              form: s.form,
              value: f
            },
            r
          )
        ]
      }
    );
  }
);
Cy.displayName = Ca;
var OM = "RadioBubbleInput", Ty = y.forwardRef(
  ({ __scopeSlider: e, value: t, ...n }, r) => {
    const i = y.useRef(null), o = be(i, r), s = nc(t);
    return y.useEffect(() => {
      const a = i.current;
      if (!a) return;
      const l = window.HTMLInputElement.prototype, u = Object.getOwnPropertyDescriptor(l, "value").set;
      if (s !== t && u) {
        const d = new Event("input", { bubbles: !0 });
        u.call(a, t), a.dispatchEvent(d);
      }
    }, [s, t]), /* @__PURE__ */ g(
      he.input,
      {
        style: { display: "none" },
        ...n,
        ref: o,
        defaultValue: t
      }
    );
  }
);
Ty.displayName = OM;
function LM(e = [], t, n) {
  const r = [...e];
  return r[n] = t, r.sort((i, o) => i - o);
}
function Ey(e, t, n) {
  const o = 100 / (n - t) * (e - t);
  return so(o, [0, 100]);
}
function _M(e, t) {
  return t > 2 ? `Value ${e + 1} of ${t}` : t === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function FM(e, t) {
  if (e.length === 1) return 0;
  const n = e.map((i) => Math.abs(i - t)), r = Math.min(...n);
  return n.indexOf(r);
}
function VM(e, t, n) {
  const r = e / 2, o = ic([0, 50], [0, r]);
  return (r - o(t) * n) * n;
}
function BM(e) {
  return e.slice(0, -1).map((t, n) => e[n + 1] - t);
}
function zM(e, t) {
  if (t > 0) {
    const n = BM(e);
    return Math.min(...n) >= t;
  }
  return !0;
}
function ic(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const r = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + r * (n - e[0]);
  };
}
function $M(e) {
  return (String(e).split(".")[1] || "").length;
}
function jM(e, t) {
  const n = Math.pow(10, t);
  return Math.round(e * n) / n;
}
var Py = yy, UM = Sy, HM = ky, WM = Cy;
const _i = y.forwardRef(({ className: e, defaultValue: t, value: n, min: r = 0, max: i = 100, ...o }, s) => {
  const a = y.useMemo(
    () => Array.isArray(n) ? n : Array.isArray(t) ? t : [r, i],
    [n, t, r, i]
  );
  return /* @__PURE__ */ O(
    Py,
    {
      ref: s,
      "data-slot": "slider",
      defaultValue: t,
      value: n,
      min: r,
      max: i,
      className: Q(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        e
      ),
      ...o,
      children: [
        /* @__PURE__ */ g(
          UM,
          {
            "data-slot": "slider-track",
            className: Q(
              "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            ),
            children: /* @__PURE__ */ g(
              HM,
              {
                "data-slot": "slider-range",
                className: Q(
                  "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                )
              }
            )
          }
        ),
        Array.from({ length: a.length }, (l, c) => /* @__PURE__ */ g(
          WM,
          {
            "data-slot": "slider-thumb",
            className: "border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          },
          c
        ))
      ]
    }
  );
});
_i.displayName = Py.displayName;
var qo = "Switch", [qM] = tn(qo), [KM, GM] = qM(qo), Ay = y.forwardRef(
  (e, t) => {
    const {
      __scopeSwitch: n,
      name: r,
      checked: i,
      defaultChecked: o,
      required: s,
      disabled: a,
      value: l = "on",
      onCheckedChange: c,
      form: u,
      ...d
    } = e, [h, f] = y.useState(null), m = be(t, (w) => f(w)), p = y.useRef(!1), b = h ? u || !!h.closest("form") : !0, [v, x] = gn({
      prop: i,
      defaultProp: o ?? !1,
      onChange: c,
      caller: qo
    });
    return /* @__PURE__ */ O(KM, { scope: n, checked: v, disabled: a, children: [
      /* @__PURE__ */ g(
        he.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": v,
          "aria-required": s,
          "data-state": Dy(v),
          "data-disabled": a ? "" : void 0,
          disabled: a,
          value: l,
          ...d,
          ref: m,
          onClick: oe(e.onClick, (w) => {
            x((E) => !E), b && (p.current = w.isPropagationStopped(), p.current || w.stopPropagation());
          })
        }
      ),
      b && /* @__PURE__ */ g(
        Iy,
        {
          control: h,
          bubbles: !p.current,
          name: r,
          value: l,
          checked: v,
          required: s,
          disabled: a,
          form: u,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Ay.displayName = qo;
var Ry = "SwitchThumb", Ny = y.forwardRef(
  (e, t) => {
    const { __scopeSwitch: n, ...r } = e, i = GM(Ry, n);
    return /* @__PURE__ */ g(
      he.span,
      {
        "data-state": Dy(i.checked),
        "data-disabled": i.disabled ? "" : void 0,
        ...r,
        ref: t
      }
    );
  }
);
Ny.displayName = Ry;
var YM = "SwitchBubbleInput", Iy = y.forwardRef(
  ({
    __scopeSwitch: e,
    control: t,
    checked: n,
    bubbles: r = !0,
    ...i
  }, o) => {
    const s = y.useRef(null), a = be(s, o), l = nc(n), c = zl(t);
    return y.useEffect(() => {
      const u = s.current;
      if (!u) return;
      const d = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(
        d,
        "checked"
      ).set;
      if (l !== n && f) {
        const m = new Event("click", { bubbles: r });
        f.call(u, n), u.dispatchEvent(m);
      }
    }, [l, n, r]), /* @__PURE__ */ g(
      "input",
      {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: n,
        ...i,
        tabIndex: -1,
        ref: a,
        style: {
          ...i.style,
          ...c,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
Iy.displayName = YM;
function Dy(e) {
  return e ? "checked" : "unchecked";
}
var My = Ay, XM = Ny;
const Oy = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ g(
  My,
  {
    ref: n,
    "data-slot": "switch",
    className: Q(
      "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      e
    ),
    ...t,
    children: /* @__PURE__ */ g(
      XM,
      {
        "data-slot": "switch-thumb",
        className: Q(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Oy.displayName = My.displayName;
function ZM({
  voiceConfig: e,
  onConfigChange: t,
  availableVoices: n,
  selectedVoice: r,
  onVoiceChange: i,
  autoSpeak: o = !1,
  onAutoSpeakChange: s
}) {
  const [a, l] = le(() => Vi());
  Be(() => {
    l(Vi());
  }, []);
  const c = n.reduce((d, h) => {
    const f = h.lang.split("-")[0].toUpperCase();
    return d[f] || (d[f] = []), d[f].push(h), d;
  }, {}), u = {
    EN: "English",
    ES: "Spanish",
    FR: "French",
    DE: "German",
    IT: "Italian",
    PT: "Portuguese",
    ZH: "Chinese",
    JA: "Japanese",
    KO: "Korean",
    HI: "Hindi",
    AR: "Arabic"
  };
  return !a.speechRecognition && !a.speechSynthesis ? null : /* @__PURE__ */ O("div", { className: "space-y-4", children: [
    /* @__PURE__ */ g("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ g("h4", { className: "font-semibold text-sm", children: "Voice & Sound" }) }),
    s && a.speechSynthesis && /* @__PURE__ */ O("div", { className: "flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50", children: [
      /* @__PURE__ */ g(Nn, { htmlFor: "auto-speak", className: "text-xs font-medium cursor-pointer", children: "Auto-speak responses" }),
      /* @__PURE__ */ g(
        Oy,
        {
          id: "auto-speak",
          checked: o,
          onCheckedChange: s
        }
      )
    ] }),
    a.speechSynthesis && n.length > 0 && /* @__PURE__ */ O("div", { className: "space-y-2", children: [
      /* @__PURE__ */ g(Nn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Voice Engine" }),
      /* @__PURE__ */ O(
        lo,
        {
          value: (r == null ? void 0 : r.voiceURI) || "",
          onValueChange: (d) => {
            const h = n.find((f) => f.voiceURI === d);
            i(h || null);
          },
          children: [
            /* @__PURE__ */ g(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(co, { placeholder: "Select a voice" }) }),
            /* @__PURE__ */ g(fo, { className: "max-h-60 rounded-xl border-border/40 shadow-xl", children: Object.entries(c).map(([d, h]) => /* @__PURE__ */ O("div", { children: [
              /* @__PURE__ */ g("div", { className: "px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/50 bg-muted/20", children: u[d] || d }),
              h.map((f) => /* @__PURE__ */ g(
                Ge,
                {
                  value: f.voiceURI,
                  className: "text-xs rounded-md my-0.5",
                  children: /* @__PURE__ */ O("span", { className: "truncate", children: [
                    f.name,
                    f.localService && /* @__PURE__ */ g("span", { className: "ml-1 opacity-50 text-[10px]", children: "(local)" })
                  ] })
                },
                f.voiceURI
              ))
            ] }, d)) })
          ]
        }
      )
    ] }),
    a.speechRecognition && /* @__PURE__ */ O("div", { className: "space-y-2 pt-1", children: [
      /* @__PURE__ */ g(Nn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Recognition Language" }),
      /* @__PURE__ */ O(
        lo,
        {
          value: e.lang,
          onValueChange: (d) => t({ lang: d }),
          children: [
            /* @__PURE__ */ g(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(co, {}) }),
            /* @__PURE__ */ O(fo, { className: "rounded-xl border-border/40 shadow-xl", children: [
              /* @__PURE__ */ g(Ge, { value: "en-US", className: "text-xs rounded-md my-0.5", children: "English (US)" }),
              /* @__PURE__ */ g(Ge, { value: "en-GB", className: "text-xs rounded-md my-0.5", children: "English (UK)" }),
              /* @__PURE__ */ g(Ge, { value: "es-ES", className: "text-xs rounded-md my-0.5", children: "Spanish" }),
              /* @__PURE__ */ g(Ge, { value: "fr-FR", className: "text-xs rounded-md my-0.5", children: "French" }),
              /* @__PURE__ */ g(Ge, { value: "de-DE", className: "text-xs rounded-md my-0.5", children: "German" }),
              /* @__PURE__ */ g(Ge, { value: "it-IT", className: "text-xs rounded-md my-0.5", children: "Italian" }),
              /* @__PURE__ */ g(Ge, { value: "pt-BR", className: "text-xs rounded-md my-0.5", children: "Portuguese" }),
              /* @__PURE__ */ g(Ge, { value: "zh-CN", className: "text-xs rounded-md my-0.5", children: "Chinese (Simplified)" }),
              /* @__PURE__ */ g(Ge, { value: "ja-JP", className: "text-xs rounded-md my-0.5", children: "Japanese" }),
              /* @__PURE__ */ g(Ge, { value: "ko-KR", className: "text-xs rounded-md my-0.5", children: "Korean" }),
              /* @__PURE__ */ g(Ge, { value: "hi-IN", className: "text-xs rounded-md my-0.5", children: "Hindi" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ O("div", { className: "grid gap-4 pt-1", children: [
      a.speechSynthesis && /* @__PURE__ */ O("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ O("div", { className: "flex items-center justify-between px-0.5", children: [
          /* @__PURE__ */ g(Nn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Playback Speed" }),
          /* @__PURE__ */ O("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: [
            e.rate.toFixed(1),
            "x"
          ] })
        ] }),
        /* @__PURE__ */ g(
          _i,
          {
            value: [e.rate],
            min: 0.5,
            max: 2,
            step: 0.1,
            onValueChange: ([d]) => t({ rate: d }),
            className: "cursor-pointer"
          }
        )
      ] }),
      a.speechSynthesis && /* @__PURE__ */ O("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ O("div", { className: "flex items-center justify-between px-0.5", children: [
          /* @__PURE__ */ g(Nn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Voice Pitch" }),
          /* @__PURE__ */ g("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: e.pitch.toFixed(1) })
        ] }),
        /* @__PURE__ */ g(
          _i,
          {
            value: [e.pitch],
            min: 0.5,
            max: 2,
            step: 0.1,
            onValueChange: ([d]) => t({ pitch: d }),
            className: "cursor-pointer"
          }
        )
      ] }),
      a.speechSynthesis && /* @__PURE__ */ O("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ O("div", { className: "flex items-center justify-between px-0.5", children: [
          /* @__PURE__ */ g(Nn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Output Volume" }),
          /* @__PURE__ */ O("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: [
            Math.round(e.volume * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ g(
          _i,
          {
            value: [e.volume],
            min: 0,
            max: 1,
            step: 0.1,
            onValueChange: ([d]) => t({ volume: d }),
            className: "cursor-pointer"
          }
        )
      ] })
    ] })
  ] });
}
function JM({
  currentAgent: e,
  onAgentChange: t,
  availableAgents: n,
  currentModel: r,
  onModelChange: i,
  availableModels: o,
  voiceConfig: s,
  onVoiceConfigChange: a,
  availableVoices: l,
  selectedVoice: c,
  onVoiceChange: u,
  autoSpeak: d,
  onAutoSpeakChange: h
}) {
  return /* @__PURE__ */ O(Gl, { children: [
    /* @__PURE__ */ g(Yl, { asChild: !0, children: /* @__PURE__ */ g(
      $e,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
        children: /* @__PURE__ */ g(cv, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(Xl, { align: "end", className: "w-[320px] p-5 rounded-2xl shadow-2xl border-border/40 backdrop-blur-3xl ring-1 ring-black/5 max-h-[85vh] overflow-y-auto custom-scrollbar", children: /* @__PURE__ */ g("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ O("div", { className: "grid gap-6", children: [
      /* @__PURE__ */ O("div", { className: "space-y-4", children: [
        /* @__PURE__ */ g("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ g("h4", { className: "font-semibold text-sm", children: "Model Configuration" }) }),
        /* @__PURE__ */ O("div", { className: "flex items-center gap-4 w-full", children: [
          /* @__PURE__ */ O("div", { className: "flex flex-col gap-2 flex-1", children: [
            /* @__PURE__ */ g("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Active Agent" }),
            /* @__PURE__ */ O(lo, { value: e, onValueChange: t, children: [
              /* @__PURE__ */ g(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(co, { placeholder: "Select Agent", className: "capitalize" }) }),
              /* @__PURE__ */ O(fo, { className: "rounded-xl border-border/40 shadow-xl", children: [
                n.map((f) => /* @__PURE__ */ g(Ge, { value: f.key, className: "text-xs rounded-md my-0.5 capitalize", children: f.key }, f.key)),
                n.length === 0 && /* @__PURE__ */ g(Ge, { value: e || "default", className: "capitalize", children: e || "Default" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ O("div", { className: "flex flex-col gap-2 flex-1", children: [
            /* @__PURE__ */ g("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Active Model" }),
            /* @__PURE__ */ O(lo, { value: r, onValueChange: i, children: [
              /* @__PURE__ */ g(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(co, { placeholder: "Select Model", className: "capitalize" }) }),
              /* @__PURE__ */ O(fo, { className: "rounded-xl border-border/40 shadow-xl", children: [
                o.map((f) => /* @__PURE__ */ g(Ge, { value: f, className: "text-xs rounded-md my-0.5 capitalize", children: f }, f)),
                o.length === 0 && /* @__PURE__ */ g(Ge, { value: r || "default", className: "capitalize", children: r || "Default" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ g("div", { className: "h-px bg-border/50" }),
      /* @__PURE__ */ g(
        ZM,
        {
          voiceConfig: s,
          onConfigChange: a,
          availableVoices: l,
          selectedVoice: c,
          onVoiceChange: u,
          autoSpeak: d,
          onAutoSpeakChange: h
        }
      )
    ] }) }) })
  ] });
}
function QM({
  currentAgent: e,
  isRefreshing: t,
  onNewChat: n,
  isHistoryOpen: r,
  onHistoryOpenChange: i,
  threads: o,
  currentThreadId: s,
  onSelectThread: a,
  onFetchHistory: l,
  direction: c,
  showSettings: u,
  availableAgents: d,
  onAgentChange: h,
  currentModel: f,
  onModelChange: m,
  availableModels: p,
  voiceConfig: b,
  onVoiceConfigChange: v,
  availableVoices: x,
  selectedVoice: w,
  onVoiceChange: E,
  autoSpeak: T,
  onAutoSpeakChange: k,
  onExpand: A,
  isExpanded: D,
  onClose: F
}) {
  return /* @__PURE__ */ g("div", { className: "relative z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl", children: /* @__PURE__ */ O("div", { className: "flex items-center justify-between px-4 py-3", children: [
    /* @__PURE__ */ O("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ O("div", { className: "relative group", children: [
        /* @__PURE__ */ g("div", { className: "absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-primary/40 opacity-25 blur transition duration-300 group-hover:opacity-40" }),
        /* @__PURE__ */ g("div", { className: "relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg", children: /* @__PURE__ */ g(po, { className: "h-4.5 w-4.5" }) }),
        /* @__PURE__ */ g("div", { className: "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" })
      ] }),
      /* @__PURE__ */ O("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ g("h2", { className: "text-sm font-bold leading-tight tracking-tight text-foreground", children: "Agent Chat" }),
        /* @__PURE__ */ O("div", { className: "flex items-center gap-1.5 ", children: [
          /* @__PURE__ */ O("div", { className: "flex h-1.5 w-1.5", children: [
            /* @__PURE__ */ g("span", { className: "animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75" }),
            /* @__PURE__ */ g("span", { className: "relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" })
          ] }),
          /* @__PURE__ */ g("p", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60", children: e })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ O("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ g(
        R2,
        {
          isOpen: r,
          onOpenChange: i,
          threads: o,
          currentThreadId: s,
          onSelectThread: a,
          onNewChat: n,
          isRefreshing: t,
          onFetchHistory: l,
          direction: c
        }
      ),
      /* @__PURE__ */ g(
        $e,
        {
          variant: "ghost",
          size: "icon",
          onClick: n,
          title: "New Chat",
          className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
          disabled: t,
          children: /* @__PURE__ */ g(pf, { className: Q("h-4 w-4", t && "animate-spin") })
        }
      ),
      A && /* @__PURE__ */ g(
        $e,
        {
          variant: "ghost",
          size: "icon",
          onClick: A,
          title: D ? "Collapse" : "Expand",
          className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
          children: D ? /* @__PURE__ */ g(av, { className: "h-4 w-4" }) : /* @__PURE__ */ g(rv, { className: "h-4 w-4" })
        }
      ),
      u && /* @__PURE__ */ g(
        JM,
        {
          currentAgent: e,
          onAgentChange: h,
          availableAgents: d,
          currentModel: f,
          onModelChange: m,
          availableModels: p,
          voiceConfig: b,
          onVoiceConfigChange: v,
          availableVoices: x,
          selectedVoice: w,
          onVoiceChange: E,
          autoSpeak: T,
          onAutoSpeakChange: k
        }
      ),
      F && /* @__PURE__ */ g(
        $e,
        {
          variant: "ghost",
          size: "icon",
          onClick: F,
          title: "Close",
          className: "h-8 w-8 rounded-lg hover:bg-destructive/5 hover:text-destructive transition-colors",
          children: /* @__PURE__ */ g(hr, { className: "h-4 w-4" })
        }
      )
    ] })
  ] }) });
}
const of = (e) => {
  const t = e.match(/(?:```(?:json)?\s*)?({\s*"questions":\s*\[.*?\]\s*})(?:\s*```)?/s);
  if (t)
    try {
      const r = t[1], o = JSON.parse(r).questions || [], s = e.replace(t[0], "").trim();
      return { suggestions: o, cleanContent: s };
    } catch (r) {
      console.error("Failed to parse followup JSON", r);
    }
  const n = e.match(/\[FOLLOWUP:\s*(.*?)\]/);
  if (n) {
    const i = n[1].split(",").map((s) => s.trim()).filter(Boolean), o = e.replace(/\[FOLLOWUP:\s*.*?\]/, "").trim();
    return { suggestions: i, cleanContent: o };
  }
  return { suggestions: [], cleanContent: e };
};
function eO({
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
  threadId: p = void 0,
  onExpand: b = void 0,
  isExpanded: v = !1,
  onClose: x = void 0
}) {
  var tt, Ct, Re, Tt;
  const [w, E] = le(t), [T, k] = le(m || ""), [A, D] = le([]), [F, P] = le(""), N = h ?? F, R = Ve((K) => {
    if (h === void 0 && P(K), f) {
      const we = typeof K == "function" ? K(N) : K;
      f(we);
    }
  }, [h, f, N]), [B, j] = le(!1), [H, V] = le([]), [I, _] = le(null), [L, S] = le([]), [ee, Y] = le([]), [C, q] = le(!1), [Z, ie] = le([]), [W, ne] = le(p || null), [pe, se] = le(!1), ce = Ve((K) => {
    var ze, it;
    if (!((ze = I == null ? void 0 : I.info) != null && ze.agents)) return;
    const we = I.info.agents.find((Oe) => Oe.key === K);
    D([]);
    const ke = (it = we == null ? void 0 : we.suggestions) != null && it.length ? we.suggestions : i != null && i.length ? i : [];
    V(ke);
  }, [(tt = I == null ? void 0 : I.info) == null ? void 0 : tt.agents, i]);
  Be(() => {
    p && (ne(p), I && Me(p));
  }, [p, I]), Be(() => {
    (async () => {
      try {
        const we = w === "default" ? null : w, ke = new zy({
          baseUrl: e,
          agent: we,
          getInfo: !0
        });
        await ke.retrieveInfo(), _(ke), ke.info && (S(ke.info.agents), Y(ke.info.models), ke.agent && E(ke.agent), T || k(ke.info.default_model), A.length === 0 && ke.agent && ce(ke.agent));
      } catch (we) {
        we instanceof Error && (o == null || o(we));
      }
    })();
  }, [e]), Be(() => {
    if (I)
      try {
        I.updateAgent(w, !0);
      } catch (K) {
        console.warn("Could not update agent yet", K);
      }
  }, [w, I]);
  const me = Ve(async () => {
    if (I)
      try {
        const K = await I.listThreads(20, 0, n);
        ie(K);
      } catch (K) {
        console.error("Failed to fetch history", K);
      }
  }, [I, n]), Me = async (K) => {
    if (I)
      try {
        j(!0);
        const ke = (await I.getHistory({
          thread_id: K,
          user_id: n || void 0
        })).messages.map((ze) => ({
          id: ze.id || crypto.randomUUID(),
          role: ze.type === "human" ? "user" : "assistant",
          content: ze.content,
          createdAt: /* @__PURE__ */ new Date()
          // We assume current time if timestamp missing
          // Map other fields if necessary
        }));
        D(ke), ne(K), q(!1);
      } catch (we) {
        we instanceof Error && (o == null || o(we));
      } finally {
        j(!1);
      }
  }, We = () => {
    se(!0), setTimeout(() => se(!1), 1e3), I != null && I.agent ? ce(I.agent) : (D([]), V(i || [])), ne(null), R(""), q(!1);
  }, ut = async (K) => {
    var it, Oe;
    if (!K.trim() || !I) return;
    const we = {
      id: crypto.randomUUID(),
      role: "user",
      content: K,
      createdAt: /* @__PURE__ */ new Date()
    };
    D((ft) => [...ft, we]), R(""), V([]), j(!0);
    const ke = W || crypto.randomUUID();
    W || ne(ke);
    const ze = { thread_id: ke, user_id: n };
    try {
      if (r) {
        const ft = I.stream({
          message: K,
          model: T || void 0,
          ...ze
        });
        let G = null;
        for await (const re of ft)
          if (typeof re == "string")
            rt(re, G, (ae) => G = ae);
          else if (typeof re == "object" && re !== null) {
            if ("type" in re && re.type === "update") {
              const Ne = re, _e = Ne.updates.follow_up || Ne.updates.next_step_suggestions;
              _e && V(_e);
              continue;
            }
            const ae = re;
            if ((it = ae.tool_calls) != null && it.length) {
              const Ne = ae.tool_calls.some((_e) => _e.name.includes("sub-agent"));
              G = null, D((_e) => [..._e, {
                id: crypto.randomUUID(),
                role: Ne ? "subagent" : "tool",
                content: ae.content || "",
                toolInvocations: ae.tool_calls.map((ot) => ({
                  state: "call",
                  toolName: ot.name,
                  toolCallId: ot.id || crypto.randomUUID()
                })),
                createdAt: /* @__PURE__ */ new Date()
              }]);
            } else ae.type === "tool" && ae.content ? (G = null, D((Ne) => [...Ne, {
              id: crypto.randomUUID(),
              role: "tool",
              content: ae.content,
              createdAt: /* @__PURE__ */ new Date()
            }])) : ae.content && rt(ae.content, G, (Ne) => G = Ne);
          }
        D((re) => {
          const ae = re[re.length - 1];
          if ((ae == null ? void 0 : ae.role) === "assistant") {
            const { suggestions: Ne, cleanContent: _e } = of(ae.content);
            if (Ne.length > 0)
              return V(Ne), re.map((ot, Kt) => Kt === re.length - 1 ? { ...ot, content: _e } : ot);
          }
          return re;
        });
      } else {
        const ft = await I.invoke({
          message: K,
          model: T || void 0,
          ...ze
        }), { suggestions: G, cleanContent: re } = of(ft.content || "");
        V((Oe = ft.suggestions) != null && Oe.length ? ft.suggestions : G), D((ae) => [...ae, {
          id: ft.id || crypto.randomUUID(),
          role: "assistant",
          content: re,
          createdAt: /* @__PURE__ */ new Date()
        }]);
      }
    } catch (ft) {
      ft instanceof Error && (o == null || o(ft)), D((G) => [...G, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Error processing request. Please try again.",
        createdAt: /* @__PURE__ */ new Date()
      }]);
    } finally {
      j(!1), me();
    }
  }, rt = Ve((K, we, ke) => {
    D((ze) => {
      const it = ze[ze.length - 1];
      if (we && it && it.id === we && it.role === "assistant" && !it.toolInvocations)
        return ze.map((Oe) => Oe.id === we ? { ...Oe, content: Oe.content + K } : Oe);
      {
        const Oe = crypto.randomUUID();
        return ke(Oe), [...ze, { id: Oe, role: "assistant", content: K, createdAt: /* @__PURE__ */ new Date() }];
      }
    });
  }, []), vt = async (K) => {
    var we;
    (we = K == null ? void 0 : K.preventDefault) == null || we.call(K), ut(N);
  }, Wt = (K) => {
    R(K.target.value);
  }, [dt, Cn] = le(!1), {
    isListening: qt,
    isSpeaking: Un,
    startListening: kt,
    stopListening: Tr,
    speak: Tn,
    stopSpeaking: M,
    voiceConfig: U,
    updateConfig: te,
    availableVoices: fe,
    selectedVoice: ye,
    setSelectedVoice: et,
    isRecognitionSupported: bt
  } = Hy({
    onTranscript: (K, we) => {
      we && R((ke) => {
        const ze = ke && !ke.endsWith(" ") ? " " : "";
        return ke + ze + K;
      });
    }
  }), qe = Ae(B);
  return Be(() => {
    if (qe.current && !B && dt) {
      const K = A[A.length - 1];
      (K == null ? void 0 : K.role) === "assistant" && K.content && Tn(K.content);
    }
    qe.current = B;
  }, [B, dt, A, Tn]), /* @__PURE__ */ g("div", { className: "chat-theme h-full w-full", children: /* @__PURE__ */ O("div", { className: Q("flex h-full w-full flex-col overflow-hidden", a), children: [
    c && /* @__PURE__ */ g(
      QM,
      {
        currentAgent: w,
        isRefreshing: pe,
        onNewChat: We,
        isHistoryOpen: C,
        onHistoryOpenChange: q,
        threads: Z,
        currentThreadId: W,
        onSelectThread: Me,
        onFetchHistory: me,
        direction: d,
        showSettings: l,
        availableAgents: L,
        onAgentChange: E,
        currentModel: T,
        onModelChange: k,
        availableModels: ee,
        voiceConfig: U,
        onVoiceConfigChange: te,
        availableVoices: fe,
        selectedVoice: ye,
        onVoiceChange: et,
        autoSpeak: dt,
        onAutoSpeakChange: Cn,
        onExpand: b,
        isExpanded: v,
        onClose: x
      }
    ),
    /* @__PURE__ */ g("div", { className: "flex-1 overflow-hidden relative bg-background flex flex-col", children: /* @__PURE__ */ g(
      vg,
      {
        messages: A,
        handleSubmit: vt,
        input: N,
        handleInputChange: Wt,
        isGenerating: B,
        append: (K) => ut(K.content),
        suggestions: H.length > 0 ? H : A.length === 0 ? i : [],
        onRateResponse: s,
        placeholder: u,
        isListening: qt,
        startListening: kt,
        stopListening: Tr,
        isSpeechSupported: bt,
        speak: Tn,
        stopSpeaking: M,
        isSpeaking: Un,
        label: (Tt = (Re = (Ct = I == null ? void 0 : I.info) == null ? void 0 : Ct.agents) == null ? void 0 : Re.find((K) => K.key === w)) == null ? void 0 : Tt.description,
        className: "flex-1"
      }
    ) })
  ] }) });
}
function aO({
  buttonClassName: e,
  windowClassName: t,
  ...n
}) {
  const [r, i] = le(!1), [o, s] = le(!1), [a, l] = le({
    width: typeof window < "u" ? window.innerWidth : 0,
    height: typeof window < "u" ? window.innerHeight : 0
  });
  return Be(() => {
    const c = () => {
      l({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    return window.addEventListener("resize", c), () => window.removeEventListener("resize", c);
  }, []), /* @__PURE__ */ O(Gl, { open: r, onOpenChange: i, children: [
    /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ g(Yl, { asChild: !0, className: Q(r && "opacity-0 pointer-events-none"), children: /* @__PURE__ */ g(
      $e,
      {
        className: Q(
          "fixed bottom-6 right-6 size-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
          e
        ),
        size: "icon",
        children: /* @__PURE__ */ g(iv, { className: "size-6" })
      }
    ) }) }),
    /* @__PURE__ */ g(
      Xl,
      {
        className: Q(
          "p-0 overflow-hidden rounded-2xl border border-border/50 shadow-2xl transition-all duration-300 bg-background",
          t
        ),
        style: {
          width: o ? `${a.width}px` : a.width < 640 ? "90vw" : "480px",
          height: o ? `${a.height}px` : a.width < 640 ? "80vh" : "640px"
        },
        align: "end",
        sideOffset: -64,
        children: /* @__PURE__ */ g("div", { className: "chat-theme h-full", children: /* @__PURE__ */ g(
          eO,
          {
            ...n,
            className: "h-full w-full",
            onExpand: () => s(!o),
            isExpanded: o,
            onClose: () => i(!1)
          }
        ) })
      }
    )
  ] });
}
export {
  eO as A,
  $e as B,
  vg as C,
  yg as M,
  aO as P,
  tS as a,
  yS as b,
  yd as c,
  zy as d,
  je as e,
  hS as f,
  bg as g,
  gS as h,
  xg as i,
  XD as j,
  aD as k,
  YD as l,
  pa as m,
  Ji as n,
  Xd as o,
  Q as p,
  ml as s,
  sS as w
};
