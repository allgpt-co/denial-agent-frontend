var ev = Object.defineProperty;
var tv = (e, t, n) => t in e ? ev(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Pe = (e, t, n) => tv(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as p, Fragment as dt, jsxs as M } from "react/jsx-runtime";
import * as y from "react";
import j, { useState as ne, useRef as Me, useEffect as Ve, useCallback as He, forwardRef as fr, createElement as Fi, createContext as hr, useId as Pa, useContext as tt, useInsertionEffect as gf, useMemo as Mn, Children as nv, isValidElement as Pi, useLayoutEffect as Aa, Fragment as yf, Component as rv, Suspense as iv } from "react";
import * as ho from "react-dom";
import vf from "react-dom";
class $e extends Error {
  constructor(t) {
    super(t), this.name = "AgentClientError";
  }
}
class ov {
  constructor(t) {
    Pe(this, "baseUrl");
    Pe(this, "authSecret");
    Pe(this, "timeout");
    Pe(this, "_info", null);
    Pe(this, "_agent", null);
    Pe(this, "_initPromise", null);
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
        throw new $e(`HTTP error! status: ${o.status}`);
      this._info = await o.json(), (!this._agent || !((t = this._info) != null && t.agents.some((s) => s.key === this._agent))) && (this._agent = ((n = this._info) == null ? void 0 : n.default_agent) || null);
    } catch (r) {
      throw r instanceof Error ? new $e(`Error getting service info: ${r.message}`) : r;
    }
  }
  updateAgent(t, n = !1) {
    if (!n) {
      if (!this._info)
        throw new $e(
          "Service info not loaded. Call retrieveInfo() first or set getInfo to true in constructor."
        );
      const r = this._info.agents.map((i) => i.key);
      if (!r.includes(t))
        throw new $e(
          `Agent ${t} not found in available agents: ${r.join(", ")}`
        );
    }
    this._agent = t;
  }
  async invoke(t) {
    if (this._initPromise && await this._initPromise, !this._agent)
      throw new $e("No agent selected. Use updateAgent() to select an agent.");
    try {
      const n = new AbortController(), r = this.timeout ? setTimeout(() => n.abort(), this.timeout) : void 0, i = await fetch(`${this.baseUrl}/${this._agent}/invoke`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(t),
        signal: n.signal
      });
      if (r && clearTimeout(r), !i.ok)
        throw new $e(`HTTP error! status: ${i.status}`);
      return await i.json();
    } catch (n) {
      throw n instanceof Error ? new $e(`Error invoking agent: ${n.message}`) : n;
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
      throw new $e("No agent selected. Use updateAgent() to select an agent.");
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
        throw new $e(`HTTP error! status: ${o.status}`);
      if (!o.body)
        throw new $e("Response body is null");
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
      throw r instanceof Error ? new $e(`Error streaming agent response: ${r.message}`) : r;
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
        throw new $e(`HTTP error! status: ${i.status}`);
    } catch (n) {
      throw n instanceof Error ? new $e(`Error creating feedback: ${n.message}`) : n;
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
        throw new $e(`HTTP error! status: ${i.status}`);
      return await i.json();
    } catch (n) {
      throw n instanceof Error ? new $e(`Error getting chat history: ${n.message}`) : n;
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
        throw new $e(`HTTP error! status: ${l.status}`);
      }
      return await l.json();
    } catch (i) {
      throw i instanceof Error ? new $e(`Error listing threads: ${i.message}`) : i;
    }
  }
  async uploadFile(t) {
    try {
      const n = new FormData();
      n.append("file", t);
      const r = {};
      this.authSecret && (r.Authorization = `Bearer ${this.authSecret}`);
      const i = new AbortController(), o = this.timeout ? setTimeout(() => i.abort(), this.timeout) : void 0, s = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        headers: r,
        body: n,
        signal: i.signal
      });
      if (o && clearTimeout(o), !s.ok)
        throw new $e(`HTTP error! status: ${s.status}`);
      return await s.json();
    } catch (n) {
      throw n instanceof Error ? new $e(`Error uploading file: ${n.message}`) : n;
    }
  }
  async uploadFiles(t) {
    if (t.length === 0)
      return [];
    if (t.length === 1)
      return [await this.uploadFile(t[0])];
    try {
      const n = new FormData();
      t.forEach((a) => {
        n.append("files", a);
      });
      const r = {};
      this.authSecret && (r.Authorization = `Bearer ${this.authSecret}`);
      const i = new AbortController(), o = this.timeout ? setTimeout(() => i.abort(), this.timeout) : void 0, s = await fetch(`${this.baseUrl}/upload-multiple`, {
        method: "POST",
        headers: r,
        body: n,
        signal: i.signal
      });
      if (o && clearTimeout(o), !s.ok)
        throw new $e(`HTTP error! status: ${s.status}`);
      return await s.json();
    } catch (n) {
      throw n instanceof Error ? new $e(`Error uploading files: ${n.message}`) : n;
    }
  }
}
const Ra = {
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
class sv {
  constructor(t = {}) {
    Pe(this, "recognition", null);
    Pe(this, "isListening", !1);
    Pe(this, "config");
    Pe(this, "onResult", null);
    Pe(this, "onStart", null);
    Pe(this, "onEnd", null);
    Pe(this, "onError", null);
    Pe(this, "onSpeechStart", null);
    Pe(this, "onSpeechEnd", null);
    this.config = { ...Ra, ...t }, this.initRecognition();
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
class av {
  constructor(t = {}) {
    Pe(this, "utterance", null);
    Pe(this, "config");
    Pe(this, "isSpeaking", !1);
    Pe(this, "availableVoices", []);
    Pe(this, "onStart", null);
    Pe(this, "onEnd", null);
    Pe(this, "onPause", null);
    Pe(this, "onResume", null);
    Pe(this, "onError", null);
    Pe(this, "onBoundary", null);
    this.config = { ...Ra, ...t }, this.loadVoices();
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
function lv(e) {
  return e.replace(/```[\s\S]*?```/g, "Code block omitted. ").replace(/`[^`]+`/g, (t) => t.slice(1, -1)).replace(/#{1,6}\s+/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").replace(/---/g, "").replace(/^>\s+/gm, "").replace(/^[\s]*[-*+]\s+/gm, "").replace(/^[\s]*\d+\.\s+/gm, "").replace(/\n{3,}/g, `

`).trim();
}
function cv(e = {}) {
  const { config: t } = e, [n, r] = ne(!1), [i, o] = ne(!1), [s, a] = ne(""), [l, c] = ne(""), [u, d] = ne(null), [h, f] = ne([]), [g, m] = ne(null), [b, v] = ne({
    ...Ra,
    ...t
  }), [x, w] = ne(() => Vi()), T = Me(null), E = Me(null), k = Me(e);
  Ve(() => {
    k.current = e;
  }), Ve(() => {
    const D = Vi();
    if (w(D), D.speechRecognition && (T.current = new sv(b), T.current.onStart = () => {
      var _, L;
      r(!0), d(null), (L = (_ = k.current).onSpeechStart) == null || L.call(_);
    }, T.current.onEnd = () => {
      var _, L;
      r(!1), (L = (_ = k.current).onSpeechEnd) == null || L.call(_);
    }, T.current.onError = (_) => {
      var L, S;
      d(_), r(!1), (S = (L = k.current).onError) == null || S.call(L, _);
    }, T.current.onResult = (_, L) => {
      var S, te;
      L ? (a((Z) => Z + _), c("")) : c(_), (te = (S = k.current).onTranscript) == null || te.call(S, _, L);
    }), D.speechSynthesis) {
      E.current = new av(b), E.current.onStart = () => {
        o(!0);
      }, E.current.onEnd = () => {
        o(!1);
      }, E.current.onError = (L) => {
        d(L), o(!1);
      };
      const _ = () => {
        var S;
        const L = ((S = E.current) == null ? void 0 : S.getVoices()) || [];
        if (f(L), !g && L.length > 0) {
          const te = L.filter(
            (Z) => Z.lang.toLowerCase().startsWith(b.lang.toLowerCase().split("-")[0])
          );
          te.length > 0 && m(te[0]);
        }
      };
      _(), typeof window < "u" && window.speechSynthesis && (window.speechSynthesis.onvoiceschanged = _);
    }
    return () => {
      var _, L;
      (_ = T.current) == null || _.destroy(), (L = E.current) == null || L.destroy();
    };
  }, []);
  const A = He((D) => {
    v((_) => {
      var S, te;
      const L = { ..._, ...D };
      return (S = T.current) == null || S.updateConfig(L), (te = E.current) == null || te.updateConfig(L), L;
    });
  }, []), I = He(() => {
    var D;
    d(null), c(""), (D = T.current) == null || D.start();
  }, []), F = He(() => {
    var D;
    (D = T.current) == null || D.stop();
  }, []), P = He(() => {
    n ? F() : I();
  }, [n, I, F]), N = He(() => {
    a(""), c("");
  }, []), R = He((D) => {
    var L, S;
    d(null);
    const _ = lv(D);
    g && ((L = E.current) == null || L.updateConfig({ voiceURI: g.voiceURI })), (S = E.current) == null || S.speak(_);
  }, [g]), B = He(() => {
    var D;
    (D = E.current) == null || D.stop();
  }, []), $ = He(() => {
    var D;
    (D = E.current) == null || D.pause();
  }, []), H = He(() => {
    var D;
    (D = E.current) == null || D.resume();
  }, []), V = He((D) => {
    m(D), D && A({ voiceURI: D.voiceURI });
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
    startListening: I,
    stopListening: F,
    toggleListening: P,
    clearTranscript: N,
    // Synthesis controls
    speak: R,
    stopSpeaking: B,
    pauseSpeaking: $,
    resumeSpeaking: H,
    // Voice management
    availableVoices: h,
    selectedVoice: g,
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
const uv = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), bf = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var dv = {
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
const fv = fr(
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
      ...dv,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: bf("lucide", i),
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
const ke = (e, t) => {
  const n = fr(
    ({ className: r, ...i }, o) => Fi(fv, {
      ref: o,
      iconNode: t,
      className: bf(`lucide-${uv(e)}`, r),
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
const hv = ke("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pv = ke("Ban", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m4.9 4.9 14.2 14.2", key: "1m5liu" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mv = ke("Bot", [
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
const dc = ke("Braces", [
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
const xf = ke("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wf = ke("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Na = ke("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gv = ke("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yv = ke("CircleHelp", [
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
const vv = ke("CodeXml", [
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
const bv = ke("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ko = ke("Dot", [
  ["circle", { cx: "12.1", cy: "12.1", r: "1", key: "18d7e5" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fc = ke("Download", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
  ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ms = ke("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hc = ke("History", [
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
const xv = ke("Info", [
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
const Sf = ke("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wv = ke("Maximize2", [
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
const Sv = ke("MessageCircle", [
  ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kv = ke("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Cv = ke("Mic", [
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
const Tv = ke("Minimize2", [
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
const kf = ke("Paperclip", [
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
const Cf = ke("RefreshCcw", [
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
const Ev = ke("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pv = ke("Settings2", [
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
const po = ke("Sparkles", [
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
const Tf = ke("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Av = ke("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rv = ke("ThumbsDown", [
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
const Nv = ke("ThumbsUp", [
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
const Iv = ke("Volume2", [
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
const zn = ke("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Ef(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = Ef(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Pf() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Ef(e)) && (r && (r += " "), r += t);
  return r;
}
const Ia = "-", Dv = (e) => {
  const t = Ov(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (s) => {
      const a = s.split(Ia);
      return a[0] === "" && a.length !== 1 && a.shift(), Af(a, t) || Mv(s);
    },
    getConflictingClassGroupIds: (s, a) => {
      const l = n[s] || [];
      return a && r[s] ? [...l, ...r[s]] : l;
    }
  };
}, Af = (e, t) => {
  var s;
  if (e.length === 0)
    return t.classGroupId;
  const n = e[0], r = t.nextPart.get(n), i = r ? Af(e.slice(1), r) : void 0;
  if (i)
    return i;
  if (t.validators.length === 0)
    return;
  const o = e.join(Ia);
  return (s = t.validators.find(({
    validator: a
  }) => a(o))) == null ? void 0 : s.classGroupId;
}, pc = /^\[(.+)\]$/, Mv = (e) => {
  if (pc.test(e)) {
    const t = pc.exec(e)[1], n = t == null ? void 0 : t.substring(0, t.indexOf(":"));
    if (n)
      return "arbitrary.." + n;
  }
}, Ov = (e) => {
  const {
    theme: t,
    prefix: n
  } = e, r = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return _v(Object.entries(e.classGroups), n).forEach(([o, s]) => {
    Os(s, r, o, t);
  }), r;
}, Os = (e, t, n, r) => {
  e.forEach((i) => {
    if (typeof i == "string") {
      const o = i === "" ? t : mc(t, i);
      o.classGroupId = n;
      return;
    }
    if (typeof i == "function") {
      if (Lv(i)) {
        Os(i(r), t, n, r);
        return;
      }
      t.validators.push({
        validator: i,
        classGroupId: n
      });
      return;
    }
    Object.entries(i).forEach(([o, s]) => {
      Os(s, mc(t, o), n, r);
    });
  });
}, mc = (e, t) => {
  let n = e;
  return t.split(Ia).forEach((r) => {
    n.nextPart.has(r) || n.nextPart.set(r, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), n = n.nextPart.get(r);
  }), n;
}, Lv = (e) => e.isThemeGetter, _v = (e, t) => t ? e.map(([n, r]) => {
  const i = r.map((o) => typeof o == "string" ? t + o : typeof o == "object" ? Object.fromEntries(Object.entries(o).map(([s, a]) => [t + s, a])) : o);
  return [n, i];
}) : e, Fv = (e) => {
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
}, Rf = "!", Vv = (e) => {
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
    const h = l.length === 0 ? a : a.substring(u), f = h.startsWith(Rf), g = f ? h.substring(1) : h, m = d && d > u ? d - u : void 0;
    return {
      modifiers: l,
      hasImportantModifier: f,
      baseClassName: g,
      maybePostfixModifierPosition: m
    };
  };
  return n ? (a) => n({
    className: a,
    parseClassName: s
  }) : s;
}, Bv = (e) => {
  if (e.length <= 1)
    return e;
  const t = [];
  let n = [];
  return e.forEach((r) => {
    r[0] === "[" ? (t.push(...n.sort(), r), n = []) : n.push(r);
  }), t.push(...n.sort()), t;
}, zv = (e) => ({
  cache: Fv(e.cacheSize),
  parseClassName: Vv(e),
  ...Dv(e)
}), $v = /\s+/, jv = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: i
  } = t, o = [], s = e.trim().split($v);
  let a = "";
  for (let l = s.length - 1; l >= 0; l -= 1) {
    const c = s[l], {
      modifiers: u,
      hasImportantModifier: d,
      baseClassName: h,
      maybePostfixModifierPosition: f
    } = n(c);
    let g = !!f, m = r(g ? h.substring(0, f) : h);
    if (!m) {
      if (!g) {
        a = c + (a.length > 0 ? " " + a : a);
        continue;
      }
      if (m = r(h), !m) {
        a = c + (a.length > 0 ? " " + a : a);
        continue;
      }
      g = !1;
    }
    const b = Bv(u).join(":"), v = d ? b + Rf : b, x = v + m;
    if (o.includes(x))
      continue;
    o.push(x);
    const w = i(m, g);
    for (let T = 0; T < w.length; ++T) {
      const E = w[T];
      o.push(v + E);
    }
    a = c + (a.length > 0 ? " " + a : a);
  }
  return a;
};
function Uv() {
  let e = 0, t, n, r = "";
  for (; e < arguments.length; )
    (t = arguments[e++]) && (n = Nf(t)) && (r && (r += " "), r += n);
  return r;
}
const Nf = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = Nf(e[r])) && (n && (n += " "), n += t);
  return n;
};
function Hv(e, ...t) {
  let n, r, i, o = s;
  function s(l) {
    const c = t.reduce((u, d) => d(u), e());
    return n = zv(c), r = n.cache.get, i = n.cache.set, o = a, a(l);
  }
  function a(l) {
    const c = r(l);
    if (c)
      return c;
    const u = jv(l, n);
    return i(l, u), u;
  }
  return function() {
    return o(Uv.apply(null, arguments));
  };
}
const Ne = (e) => {
  const t = (n) => n[e] || [];
  return t.isThemeGetter = !0, t;
}, If = /^\[(?:([a-z-]+):)?(.+)\]$/i, Wv = /^\d+\/\d+$/, qv = /* @__PURE__ */ new Set(["px", "full", "screen"]), Kv = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Gv = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Yv = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/, Xv = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Zv = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Gt = (e) => tr(e) || qv.has(e) || Wv.test(e), on = (e) => pr(e, "length", ob), tr = (e) => !!e && !Number.isNaN(Number(e)), Go = (e) => pr(e, "number", tr), Er = (e) => !!e && Number.isInteger(Number(e)), Jv = (e) => e.endsWith("%") && tr(e.slice(0, -1)), de = (e) => If.test(e), sn = (e) => Kv.test(e), Qv = /* @__PURE__ */ new Set(["length", "size", "percentage"]), eb = (e) => pr(e, Qv, Df), tb = (e) => pr(e, "position", Df), nb = /* @__PURE__ */ new Set(["image", "url"]), rb = (e) => pr(e, nb, ab), ib = (e) => pr(e, "", sb), Pr = () => !0, pr = (e, t, n) => {
  const r = If.exec(e);
  return r ? r[1] ? typeof t == "string" ? r[1] === t : t.has(r[1]) : n(r[2]) : !1;
}, ob = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  Gv.test(e) && !Yv.test(e)
), Df = () => !1, sb = (e) => Xv.test(e), ab = (e) => Zv.test(e), lb = () => {
  const e = Ne("colors"), t = Ne("spacing"), n = Ne("blur"), r = Ne("brightness"), i = Ne("borderColor"), o = Ne("borderRadius"), s = Ne("borderSpacing"), a = Ne("borderWidth"), l = Ne("contrast"), c = Ne("grayscale"), u = Ne("hueRotate"), d = Ne("invert"), h = Ne("gap"), f = Ne("gradientColorStops"), g = Ne("gradientColorStopPositions"), m = Ne("inset"), b = Ne("margin"), v = Ne("opacity"), x = Ne("padding"), w = Ne("saturate"), T = Ne("scale"), E = Ne("sepia"), k = Ne("skew"), A = Ne("space"), I = Ne("translate"), F = () => ["auto", "contain", "none"], P = () => ["auto", "hidden", "clip", "visible", "scroll"], N = () => ["auto", de, t], R = () => [de, t], B = () => ["", Gt, on], $ = () => ["auto", tr, de], H = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], V = () => ["solid", "dashed", "dotted", "double", "none"], D = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], _ = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], L = () => ["", "0", de], S = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], te = () => [tr, de];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Pr],
      spacing: [Gt, on],
      blur: ["none", "", sn, de],
      brightness: te(),
      borderColor: [e],
      borderRadius: ["none", "", "full", sn, de],
      borderSpacing: R(),
      borderWidth: B(),
      contrast: te(),
      grayscale: L(),
      hueRotate: te(),
      invert: L(),
      gap: R(),
      gradientColorStops: [e],
      gradientColorStopPositions: [Jv, on],
      inset: N(),
      margin: N(),
      opacity: te(),
      padding: R(),
      saturate: te(),
      scale: te(),
      sepia: L(),
      skew: te(),
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
        aspect: ["auto", "square", "video", de]
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
        columns: [sn]
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
        object: [...H(), de]
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
        inset: [m]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [m]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [m]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [m]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [m]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [m]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [m]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [m]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [m]
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
        z: ["auto", Er, de]
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
        flex: ["1", "auto", "initial", "none", de]
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
        order: ["first", "last", "none", Er, de]
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
          span: ["full", Er, de]
        }, de]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": $()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": $()
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
          span: [Er, de]
        }, de]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": $()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": $()
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
        "auto-cols": ["auto", "min", "max", "fr", de]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", de]
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
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", de, t]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [de, t, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [de, t, "none", "full", "min", "max", "fit", "prose", {
          screen: [sn]
        }, sn]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [de, t, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [de, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [de, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [de, t, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", sn, on]
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
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", de]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", tr, Go]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", Gt, de]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", de]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", de]
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
        decoration: ["auto", "from-font", Gt, on]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", Gt, de]
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
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", de]
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
        content: ["none", de]
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
        bg: [...H(), tb]
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
        bg: ["auto", "cover", "contain", eb]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, rb]
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
        from: [g]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [g]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [g]
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
        "outline-offset": [Gt, de]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [Gt, on]
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
        "ring-offset": [Gt, on]
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
        shadow: ["", "inner", "none", sn, ib]
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
        "mix-blend": [...D(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": D()
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
        "drop-shadow": ["", "none", sn, de]
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
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", de]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: te()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", de]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: te()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", de]
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
        scale: [T]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [T]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [T]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Er, de]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [I]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [I]
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
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", de]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", de]
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
        "will-change": ["auto", "scroll", "contents", "transform", de]
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
        stroke: [Gt, on, Go]
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
}, cb = /* @__PURE__ */ Hv(lb);
function K(...e) {
  return cb(Pf(e));
}
const ub = 50, db = 10;
function fb(e) {
  const t = Me(null), n = Me(null), [r, i] = ne(!0), o = () => {
    t.current && (t.current.scrollTop = t.current.scrollHeight);
  }, s = () => {
    if (t.current) {
      const { scrollTop: l, scrollHeight: c, clientHeight: u } = t.current, d = Math.abs(
        c - l - u
      ), h = n.current ? l < n.current : !1, f = n.current ? n.current - l : 0;
      if (h && f > db)
        i(!1);
      else {
        const m = d < ub;
        i(m);
      }
      n.current = l;
    }
  }, a = () => {
    i(!1);
  };
  return Ve(() => {
    t.current && (n.current = t.current.scrollTop);
  }, []), Ve(() => {
    r && o();
  }, e), {
    containerRef: t,
    scrollToBottom: o,
    handleScroll: s,
    shouldAutoScroll: r,
    handleTouchStart: a
  };
}
function gc(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function $n(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((i) => {
      const o = gc(i, t);
      return !n && typeof o == "function" && (n = !0), o;
    });
    if (n)
      return () => {
        for (let i = 0; i < r.length; i++) {
          const o = r[i];
          typeof o == "function" ? o() : gc(e[i], null);
        }
      };
  };
}
function we(...e) {
  return y.useCallback($n(...e), e);
}
var hb = Symbol.for("react.lazy"), Bi = y[" use ".trim().toString()];
function pb(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
function Mf(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === hb && "_payload" in e && pb(e._payload);
}
// @__NO_SIDE_EFFECTS__
function Of(e) {
  const t = /* @__PURE__ */ gb(e), n = y.forwardRef((r, i) => {
    let { children: o, ...s } = r;
    Mf(o) && typeof Bi == "function" && (o = Bi(o._payload));
    const a = y.Children.toArray(o), l = a.find(vb);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ p(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ p(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
var mb = /* @__PURE__ */ Of("Slot");
// @__NO_SIDE_EFFECTS__
function gb(e) {
  const t = y.forwardRef((n, r) => {
    let { children: i, ...o } = n;
    if (Mf(i) && typeof Bi == "function" && (i = Bi(i._payload)), y.isValidElement(i)) {
      const s = xb(i), a = bb(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? $n(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var yb = Symbol("radix.slottable");
function vb(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === yb;
}
function bb(e, t) {
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
function xb(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
const yc = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, vc = Pf, Lf = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return vc(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: i, defaultVariants: o } = t, s = Object.keys(i).map((c) => {
    const u = n == null ? void 0 : n[c], d = o == null ? void 0 : o[c];
    if (u === null) return null;
    const h = yc(u) || yc(d);
    return i[c][h];
  }), a = n && Object.entries(n).reduce((c, u) => {
    let [d, h] = u;
    return h === void 0 || (c[d] = h), c;
  }, {}), l = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((c, u) => {
    let { class: d, className: h, ...f } = u;
    return Object.entries(f).every((g) => {
      let [m, b] = g;
      return Array.isArray(b) ? b.includes({
        ...o,
        ...a
      }[m]) : {
        ...o,
        ...a
      }[m] === b;
    }) ? [
      ...c,
      d,
      h
    ] : c;
  }, []);
  return vc(e, s, l, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, wb = Lf(
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
), We = y.forwardRef(({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }, o) => /* @__PURE__ */ p(
  r ? mb : "button",
  {
    "data-slot": "button",
    "data-variant": t,
    "data-size": n,
    className: K(wb({ variant: t, size: n, className: e })),
    ref: o,
    ...i
  }
));
We.displayName = "Button";
const Da = hr({});
function Ma(e) {
  const t = Me(null);
  return t.current === null && (t.current = e()), t.current;
}
const mo = hr(null), Oa = hr({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
class Sb extends y.Component {
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
function kb({ children: e, isPresent: t }) {
  const n = Pa(), r = Me(null), i = Me({
    width: 0,
    height: 0,
    top: 0,
    left: 0
  }), { nonce: o } = tt(Oa);
  return gf(() => {
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
  }, [t]), p(Sb, { isPresent: t, childRef: r, sizeRef: i, children: y.cloneElement(e, { ref: r }) });
}
const Cb = ({ children: e, initial: t, isPresent: n, onExitComplete: r, custom: i, presenceAffectsLayout: o, mode: s }) => {
  const a = Ma(Tb), l = Pa(), c = He((d) => {
    a.set(d, !0);
    for (const h of a.values())
      if (!h)
        return;
    r && r();
  }, [a, r]), u = Mn(
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
  return Mn(() => {
    a.forEach((d, h) => a.set(h, !1));
  }, [n]), y.useEffect(() => {
    !n && !a.size && r && r();
  }, [n]), s === "popLayout" && (e = p(kb, { isPresent: n, children: e })), p(mo.Provider, { value: u, children: e });
};
function Tb() {
  return /* @__PURE__ */ new Map();
}
function _f(e = !0) {
  const t = tt(mo);
  if (t === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: i } = t, o = Pa();
  Ve(() => {
    e && i(o);
  }, [e]);
  const s = He(() => e && r && r(o), [o, r, e]);
  return !n && r ? [!1, s] : [!0];
}
const fi = (e) => e.key || "";
function bc(e) {
  const t = [];
  return nv.forEach(e, (n) => {
    Pi(n) && t.push(n);
  }), t;
}
const La = typeof window < "u", Ff = La ? Aa : Ve, go = ({ children: e, custom: t, initial: n = !0, onExitComplete: r, presenceAffectsLayout: i = !0, mode: o = "sync", propagate: s = !1 }) => {
  const [a, l] = _f(s), c = Mn(() => bc(e), [e]), u = s && !a ? [] : c.map(fi), d = Me(!0), h = Me(c), f = Ma(() => /* @__PURE__ */ new Map()), [g, m] = ne(c), [b, v] = ne(c);
  Ff(() => {
    d.current = !1, h.current = c;
    for (let T = 0; T < b.length; T++) {
      const E = fi(b[T]);
      u.includes(E) ? f.delete(E) : f.get(E) !== !0 && f.set(E, !1);
    }
  }, [b, u.length, u.join("-")]);
  const x = [];
  if (c !== g) {
    let T = [...c];
    for (let E = 0; E < b.length; E++) {
      const k = b[E], A = fi(k);
      u.includes(A) || (T.splice(E, 0, k), x.push(k));
    }
    o === "wait" && x.length && (T = x), v(bc(T)), m(c);
    return;
  }
  process.env.NODE_ENV !== "production" && o === "wait" && b.length > 1 && console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
  const { forceRender: w } = tt(Da);
  return p(dt, { children: b.map((T) => {
    const E = fi(T), k = s && !a ? !1 : c === b || u.includes(E), A = () => {
      if (f.has(E))
        f.set(E, !0);
      else
        return;
      let I = !0;
      f.forEach((F) => {
        F || (I = !1);
      }), I && (w == null || w(), v(h.current), s && (l == null || l()), r && r());
    };
    return p(Cb, { isPresent: k, initial: !d.current || n ? void 0 : !1, custom: k ? void 0 : t, presenceAffectsLayout: i, mode: o, onExitComplete: k ? void 0 : A, children: T }, E);
  }) });
}, ft = /* @__NO_SIDE_EFFECTS__ */ (e) => e;
let mr = ft, dn = ft;
process.env.NODE_ENV !== "production" && (mr = (e, t) => {
  !e && typeof console < "u" && console.warn(t);
}, dn = (e, t) => {
  if (!e)
    throw new Error(t);
});
// @__NO_SIDE_EFFECTS__
function _a(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
const or = /* @__NO_SIDE_EFFECTS__ */ (e, t, n) => {
  const r = t - e;
  return r === 0 ? 1 : (n - e) / r;
}, Bt = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Yt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, Eb = {
  useManualTiming: !1
};
function Pb(e) {
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
], Ab = 40;
function Vf(e, t) {
  let n = !1, r = !0;
  const i = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, o = () => n = !0, s = hi.reduce((v, x) => (v[x] = Pb(o), v), {}), { read: a, resolveKeyframes: l, update: c, preRender: u, render: d, postRender: h } = s, f = () => {
    const v = performance.now();
    n = !1, i.delta = r ? 1e3 / 60 : Math.max(Math.min(v - i.timestamp, Ab), 1), i.timestamp = v, i.isProcessing = !0, a.process(i), l.process(i), c.process(i), u.process(i), d.process(i), h.process(i), i.isProcessing = !1, n && t && (r = !1, e(f));
  }, g = () => {
    n = !0, r = !0, i.isProcessing || e(f);
  };
  return { schedule: hi.reduce((v, x) => {
    const w = s[x];
    return v[x] = (T, E = !1, k = !1) => (n || g(), w.schedule(T, E, k)), v;
  }, {}), cancel: (v) => {
    for (let x = 0; x < hi.length; x++)
      s[hi[x]].cancel(v);
  }, state: i, steps: s };
}
const { schedule: Ie, cancel: fn, state: Ge, steps: Yo } = Vf(typeof requestAnimationFrame < "u" ? requestAnimationFrame : ft, !0), Bf = hr({ strict: !1 }), xc = {
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
}, sr = {};
for (const e in xc)
  sr[e] = {
    isEnabled: (t) => xc[e].some((n) => !!t[n])
  };
function Rb(e) {
  for (const t in e)
    sr[t] = {
      ...sr[t],
      ...e[t]
    };
}
const Nb = /* @__PURE__ */ new Set([
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
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || Nb.has(e);
}
let zf = (e) => !zi(e);
function Ib(e) {
  e && (zf = (t) => t.startsWith("on") ? !zi(t) : e(t));
}
try {
  Ib(require("@emotion/is-prop-valid").default);
} catch {
}
function Db(e, t, n) {
  const r = {};
  for (const i in e)
    i === "values" && typeof e.values == "object" || (zf(i) || n === !0 && zi(i) || !t && !zi(i) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && i.startsWith("onDrag")) && (r[i] = e[i]);
  return r;
}
const wc = /* @__PURE__ */ new Set();
function yo(e, t, n) {
  e || wc.has(t) || (console.warn(t), wc.add(t));
}
function Mb(e) {
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
const vo = hr({});
function jr(e) {
  return typeof e == "string" || Array.isArray(e);
}
function bo(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
const Fa = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], Va = ["initial", ...Fa];
function xo(e) {
  return bo(e.animate) || Va.some((t) => jr(e[t]));
}
function $f(e) {
  return !!(xo(e) || e.variants);
}
function Ob(e, t) {
  if (xo(e)) {
    const { initial: n, animate: r } = e;
    return {
      initial: n === !1 || jr(n) ? n : void 0,
      animate: jr(r) ? r : void 0
    };
  }
  return e.inherit !== !1 ? t : {};
}
function Lb(e) {
  const { initial: t, animate: n } = Ob(e, tt(vo));
  return Mn(() => ({ initial: t, animate: n }), [Sc(t), Sc(n)]);
}
function Sc(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const _b = Symbol.for("motionComponentSymbol");
function Xn(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function Fb(e, t, n) {
  return He(
    (r) => {
      r && e.onMount && e.onMount(r), t && (r ? t.mount(r) : t.unmount()), n && (typeof n == "function" ? n(r) : Xn(n) && (n.current = r));
    },
    /**
     * Only pass a new ref callback to React if we've received a visual element
     * factory. Otherwise we'll be mounting/remounting every time externalRef
     * or other dependencies change.
     */
    [t]
  );
}
const Ba = (e) => e.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase(), Vb = "framerAppearId", jf = "data-" + Ba(Vb), { schedule: za } = Vf(queueMicrotask, !1), Uf = hr({});
function Bb(e, t, n, r, i) {
  var o, s;
  const { visualElement: a } = tt(vo), l = tt(Bf), c = tt(mo), u = tt(Oa).reducedMotion, d = Me(null);
  r = r || l.renderer, !d.current && r && (d.current = r(e, {
    visualState: t,
    parent: a,
    props: n,
    presenceContext: c,
    blockInitialAnimation: c ? c.initial === !1 : !1,
    reducedMotionConfig: u
  }));
  const h = d.current, f = tt(Uf);
  h && !h.projection && i && (h.type === "html" || h.type === "svg") && zb(d.current, n, i, f);
  const g = Me(!1);
  gf(() => {
    h && g.current && h.update(n, c);
  });
  const m = n[jf], b = Me(!!m && !(!((o = window.MotionHandoffIsComplete) === null || o === void 0) && o.call(window, m)) && ((s = window.MotionHasOptimisedAnimation) === null || s === void 0 ? void 0 : s.call(window, m)));
  return Ff(() => {
    h && (g.current = !0, window.MotionIsMounted = !0, h.updateFeatures(), za.render(h.render), b.current && h.animationState && h.animationState.animateChanges());
  }), Ve(() => {
    h && (!b.current && h.animationState && h.animationState.animateChanges(), b.current && (queueMicrotask(() => {
      var v;
      (v = window.MotionHandoffMarkAsComplete) === null || v === void 0 || v.call(window, m);
    }), b.current = !1));
  }), h;
}
function zb(e, t, n, r) {
  const { layoutId: i, layout: o, drag: s, dragConstraints: a, layoutScroll: l, layoutRoot: c } = t;
  e.projection = new n(e.latestValues, t["data-framer-portal-id"] ? void 0 : Hf(e.parent)), e.projection.setOptions({
    layoutId: i,
    layout: o,
    alwaysMeasureLayout: !!s || a && Xn(a),
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
function Hf(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Hf(e.parent);
}
function $b({ preloadedFeatures: e, createVisualElement: t, useRender: n, useVisualState: r, Component: i }) {
  var o, s;
  e && Rb(e);
  function a(c, u) {
    let d;
    const h = {
      ...tt(Oa),
      ...c,
      layoutId: jb(c)
    }, { isStatic: f } = h, g = Lb(c), m = r(c, f);
    if (!f && La) {
      Ub(h, e);
      const b = Hb(h);
      d = b.MeasureLayout, g.visualElement = Bb(i, m, h, t, b.ProjectionNode);
    }
    return M(vo.Provider, { value: g, children: [d && g.visualElement ? p(d, { visualElement: g.visualElement, ...h }) : null, n(i, c, Fb(m, g.visualElement, u), m, f, g.visualElement)] });
  }
  a.displayName = `motion.${typeof i == "string" ? i : `create(${(s = (o = i.displayName) !== null && o !== void 0 ? o : i.name) !== null && s !== void 0 ? s : ""})`}`;
  const l = fr(a);
  return l[_b] = i, l;
}
function jb({ layoutId: e }) {
  const t = tt(Da).id;
  return t && e !== void 0 ? t + "-" + e : e;
}
function Ub(e, t) {
  const n = tt(Bf).strict;
  if (process.env.NODE_ENV !== "production" && t && n) {
    const r = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
    e.ignoreStrict ? mr(!1, r) : dn(!1, r);
  }
}
function Hb(e) {
  const { drag: t, layout: n } = sr;
  if (!t && !n)
    return {};
  const r = { ...t, ...n };
  return {
    MeasureLayout: t != null && t.isEnabled(e) || n != null && n.isEnabled(e) ? r.MeasureLayout : void 0,
    ProjectionNode: r.ProjectionNode
  };
}
const Wb = [
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
function $a(e) {
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
      !!(Wb.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function kc(e) {
  const t = [{}, {}];
  return e == null || e.values.forEach((n, r) => {
    t[0][r] = n.get(), t[1][r] = n.getVelocity();
  }), t;
}
function ja(e, t, n, r) {
  if (typeof t == "function") {
    const [i, o] = kc(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
    const [i, o] = kc(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  return t;
}
const Ls = (e) => Array.isArray(e), qb = (e) => !!(e && typeof e == "object" && e.mix && e.toValue), Kb = (e) => Ls(e) ? e[e.length - 1] || 0 : e, nt = (e) => !!(e && e.getVelocity);
function Ai(e) {
  const t = nt(e) ? e.get() : e;
  return qb(t) ? t.toValue() : t;
}
function Gb({ scrapeMotionValuesFromProps: e, createRenderState: t, onUpdate: n }, r, i, o) {
  const s = {
    latestValues: Yb(r, i, o, e),
    renderState: t()
  };
  return n && (s.onMount = (a) => n({ props: r, current: a, ...s }), s.onUpdate = (a) => n(a)), s;
}
const Wf = (e) => (t, n) => {
  const r = tt(vo), i = tt(mo), o = () => Gb(e, t, r, i);
  return n ? o() : Ma(o);
};
function Yb(e, t, n, r) {
  const i = {}, o = r(e, {});
  for (const h in o)
    i[h] = Ai(o[h]);
  let { initial: s, animate: a } = e;
  const l = xo(e), c = $f(e);
  t && c && !l && e.inherit !== !1 && (s === void 0 && (s = t.initial), a === void 0 && (a = t.animate));
  let u = n ? n.initial === !1 : !1;
  u = u || s === !1;
  const d = u ? a : s;
  if (d && typeof d != "boolean" && !bo(d)) {
    const h = Array.isArray(d) ? d : [d];
    for (let f = 0; f < h.length; f++) {
      const g = ja(e, h[f]);
      if (g) {
        const { transitionEnd: m, transition: b, ...v } = g;
        for (const x in v) {
          let w = v[x];
          if (Array.isArray(w)) {
            const T = u ? w.length - 1 : 0;
            w = w[T];
          }
          w !== null && (i[x] = w);
        }
        for (const x in m)
          i[x] = m[x];
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
], jn = new Set(gr), qf = (e) => (t) => typeof t == "string" && t.startsWith(e), Kf = /* @__PURE__ */ qf("--"), Xb = /* @__PURE__ */ qf("var(--"), Ua = (e) => Xb(e) ? Zb.test(e.split("/*")[0].trim()) : !1, Zb = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu, Gf = (e, t) => t && typeof e == "number" ? t.transform(e) : e, Zt = (e, t, n) => n > t ? t : n < e ? e : n, yr = {
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
}), cn = /* @__PURE__ */ ei("deg"), zt = /* @__PURE__ */ ei("%"), Q = /* @__PURE__ */ ei("px"), Jb = /* @__PURE__ */ ei("vh"), Qb = /* @__PURE__ */ ei("vw"), Cc = {
  ...zt,
  parse: (e) => zt.parse(e) / 100,
  transform: (e) => zt.transform(e * 100)
}, ex = {
  // Border props
  borderWidth: Q,
  borderTopWidth: Q,
  borderRightWidth: Q,
  borderBottomWidth: Q,
  borderLeftWidth: Q,
  borderRadius: Q,
  radius: Q,
  borderTopLeftRadius: Q,
  borderTopRightRadius: Q,
  borderBottomRightRadius: Q,
  borderBottomLeftRadius: Q,
  // Positioning props
  width: Q,
  maxWidth: Q,
  height: Q,
  maxHeight: Q,
  top: Q,
  right: Q,
  bottom: Q,
  left: Q,
  // Spacing props
  padding: Q,
  paddingTop: Q,
  paddingRight: Q,
  paddingBottom: Q,
  paddingLeft: Q,
  margin: Q,
  marginTop: Q,
  marginRight: Q,
  marginBottom: Q,
  marginLeft: Q,
  // Misc
  backgroundPositionX: Q,
  backgroundPositionY: Q
}, tx = {
  rotate: cn,
  rotateX: cn,
  rotateY: cn,
  rotateZ: cn,
  scale: pi,
  scaleX: pi,
  scaleY: pi,
  scaleZ: pi,
  skew: cn,
  skewX: cn,
  skewY: cn,
  distance: Q,
  translateX: Q,
  translateY: Q,
  translateZ: Q,
  x: Q,
  y: Q,
  z: Q,
  perspective: Q,
  transformPerspective: Q,
  opacity: Ur,
  originX: Cc,
  originY: Cc,
  originZ: Q
}, Tc = {
  ...yr,
  transform: Math.round
}, Ha = {
  ...ex,
  ...tx,
  zIndex: Tc,
  size: Q,
  // SVG
  fillOpacity: Ur,
  strokeOpacity: Ur,
  numOctaves: Tc
}, nx = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, rx = gr.length;
function ix(e, t, n) {
  let r = "", i = !0;
  for (let o = 0; o < rx; o++) {
    const s = gr[o], a = e[s];
    if (a === void 0)
      continue;
    let l = !0;
    if (typeof a == "number" ? l = a === (s.startsWith("scale") ? 1 : 0) : l = parseFloat(a) === 0, !l || n) {
      const c = Gf(a, Ha[s]);
      if (!l) {
        i = !1;
        const u = nx[s] || s;
        r += `${u}(${c}) `;
      }
      n && (t[s] = c);
    }
  }
  return r = r.trim(), n ? r = n(t, i ? "" : r) : i && (r = "none"), r;
}
function Wa(e, t, n) {
  const { style: r, vars: i, transformOrigin: o } = e;
  let s = !1, a = !1;
  for (const l in t) {
    const c = t[l];
    if (jn.has(l)) {
      s = !0;
      continue;
    } else if (Kf(l)) {
      i[l] = c;
      continue;
    } else {
      const u = Gf(c, Ha[l]);
      l.startsWith("origin") ? (a = !0, o[l] = u) : r[l] = u;
    }
  }
  if (t.transform || (s || n ? r.transform = ix(t, e.transform, n) : r.transform && (r.transform = "none")), a) {
    const { originX: l = "50%", originY: c = "50%", originZ: u = 0 } = o;
    r.transformOrigin = `${l} ${c} ${u}`;
  }
}
const ox = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, sx = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function ax(e, t, n = 1, r = 0, i = !0) {
  e.pathLength = 1;
  const o = i ? ox : sx;
  e[o.offset] = Q.transform(-r);
  const s = Q.transform(t), a = Q.transform(n);
  e[o.array] = `${s} ${a}`;
}
function Ec(e, t, n) {
  return typeof e == "string" ? e : Q.transform(t + n * e);
}
function lx(e, t, n) {
  const r = Ec(t, e.x, e.width), i = Ec(n, e.y, e.height);
  return `${r} ${i}`;
}
function qa(e, {
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
  if (Wa(e, c, d), u) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: h, style: f, dimensions: g } = e;
  h.transform && (g && (f.transform = h.transform), delete h.transform), g && (i !== void 0 || o !== void 0 || f.transform) && (f.transformOrigin = lx(g, i !== void 0 ? i : 0.5, o !== void 0 ? o : 0.5)), t !== void 0 && (h.x = t), n !== void 0 && (h.y = n), r !== void 0 && (h.scale = r), s !== void 0 && ax(h, s, a, l, !1);
}
const Ka = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
}), Yf = () => ({
  ...Ka(),
  attrs: {}
}), Ga = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function Xf(e, { style: t, vars: n }, r, i) {
  Object.assign(e.style, t, i && i.getProjectionStyles(r));
  for (const o in n)
    e.style.setProperty(o, n[o]);
}
const Zf = /* @__PURE__ */ new Set([
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
function Jf(e, t, n, r) {
  Xf(e, t, void 0, r);
  for (const i in t.attrs)
    e.setAttribute(Zf.has(i) ? i : Ba(i), t.attrs[i]);
}
const $i = {};
function cx(e) {
  Object.assign($i, e);
}
function Qf(e, { layout: t, layoutId: n }) {
  return jn.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!$i[e] || e === "opacity");
}
function Ya(e, t, n) {
  var r;
  const { style: i } = e, o = {};
  for (const s in i)
    (nt(i[s]) || t.style && nt(t.style[s]) || Qf(s, e) || ((r = n == null ? void 0 : n.getValue(s)) === null || r === void 0 ? void 0 : r.liveStyle) !== void 0) && (o[s] = i[s]);
  return o;
}
function eh(e, t, n) {
  const r = Ya(e, t, n);
  for (const i in e)
    if (nt(e[i]) || nt(t[i])) {
      const o = gr.indexOf(i) !== -1 ? "attr" + i.charAt(0).toUpperCase() + i.substring(1) : i;
      r[o] = e[i];
    }
  return r;
}
function ux(e, t) {
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
const Pc = ["x", "y", "width", "height", "cx", "cy", "r"], dx = {
  useVisualState: Wf({
    scrapeMotionValuesFromProps: eh,
    createRenderState: Yf,
    onUpdate: ({ props: e, prevProps: t, current: n, renderState: r, latestValues: i }) => {
      if (!n)
        return;
      let o = !!e.drag;
      if (!o) {
        for (const a in i)
          if (jn.has(a)) {
            o = !0;
            break;
          }
      }
      if (!o)
        return;
      let s = !t;
      if (t)
        for (let a = 0; a < Pc.length; a++) {
          const l = Pc[a];
          e[l] !== t[l] && (s = !0);
        }
      s && Ie.read(() => {
        ux(n, r), Ie.render(() => {
          qa(r, i, Ga(n.tagName), e.transformTemplate), Jf(n, r);
        });
      });
    }
  })
}, fx = {
  useVisualState: Wf({
    scrapeMotionValuesFromProps: Ya,
    createRenderState: Ka
  })
};
function th(e, t, n) {
  for (const r in t)
    !nt(t[r]) && !Qf(r, n) && (e[r] = t[r]);
}
function hx({ transformTemplate: e }, t) {
  return Mn(() => {
    const n = Ka();
    return Wa(n, t, e), Object.assign({}, n.vars, n.style);
  }, [t]);
}
function px(e, t) {
  const n = e.style || {}, r = {};
  return th(r, n, e), Object.assign(r, hx(e, t)), r;
}
function mx(e, t) {
  const n = {}, r = px(e, t);
  return e.drag && e.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
function gx(e, t, n, r) {
  const i = Mn(() => {
    const o = Yf();
    return qa(o, t, Ga(r), e.transformTemplate), {
      ...o.attrs,
      style: { ...o.style }
    };
  }, [t]);
  if (e.style) {
    const o = {};
    th(o, e.style, e), i.style = { ...o, ...i.style };
  }
  return i;
}
function yx(e = !1) {
  return (n, r, i, { latestValues: o }, s) => {
    const l = ($a(n) ? gx : mx)(r, o, s, n), c = Db(r, typeof n == "string", e), u = n !== yf ? { ...c, ...l, ref: i } : {}, { children: d } = r, h = Mn(() => nt(d) ? d.get() : d, [d]);
    return Fi(n, {
      ...u,
      children: h
    });
  };
}
function vx(e, t) {
  return function(r, { forwardMotionProps: i } = { forwardMotionProps: !1 }) {
    const s = {
      ...$a(r) ? dx : fx,
      preloadedFeatures: e,
      useRender: yx(i),
      createVisualElement: t,
      Component: r
    };
    return $b(s);
  };
}
function nh(e, t) {
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
  return ja(r, t, n !== void 0 ? n : r.custom, e);
}
const bx = /* @__PURE__ */ _a(() => window.ScrollTimeline !== void 0);
class xx {
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
      if (bx() && i.attachTimeline)
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
class wx extends xx {
  then(t, n) {
    return Promise.all(this.animations).then(t).catch(n);
  }
}
function Xa(e, t) {
  return e ? e[t] || e.default || e : void 0;
}
const _s = 2e4;
function rh(e) {
  let t = 0;
  const n = 50;
  let r = e.next(t);
  for (; !r.done && t < _s; )
    t += n, r = e.next(t);
  return t >= _s ? 1 / 0 : t;
}
function Za(e) {
  return typeof e == "function";
}
function Ac(e, t) {
  e.timeline = t, e.onfinish = null;
}
const Ja = (e) => Array.isArray(e) && typeof e[0] == "number", Sx = {
  linearEasing: void 0
};
function kx(e, t) {
  const n = /* @__PURE__ */ _a(e);
  return () => {
    var r;
    return (r = Sx[t]) !== null && r !== void 0 ? r : n();
  };
}
const ji = /* @__PURE__ */ kx(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), ih = (e, t, n = 10) => {
  let r = "";
  const i = Math.max(Math.round(t / n), 2);
  for (let o = 0; o < i; o++)
    r += e(/* @__PURE__ */ or(0, i - 1, o)) + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
};
function oh(e) {
  return !!(typeof e == "function" && ji() || !e || typeof e == "string" && (e in Fs || ji()) || Ja(e) || Array.isArray(e) && e.every(oh));
}
const Ir = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`, Fs = {
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
function sh(e, t) {
  if (e)
    return typeof e == "function" && ji() ? ih(e, t) : Ja(e) ? Ir(e) : Array.isArray(e) ? e.map((n) => sh(n, t) || Fs.easeOut) : Fs[e];
}
const Nt = {
  x: !1,
  y: !1
};
function ah() {
  return Nt.x || Nt.y;
}
function Cx(e, t, n) {
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
function lh(e, t) {
  const n = Cx(e), r = new AbortController(), i = {
    passive: !0,
    ...t,
    signal: r.signal
  };
  return [n, i, () => r.abort()];
}
function Rc(e) {
  return (t) => {
    t.pointerType === "touch" || ah() || e(t);
  };
}
function Tx(e, t, n = {}) {
  const [r, i, o] = lh(e, n), s = Rc((a) => {
    const { target: l } = a, c = t(a);
    if (typeof c != "function" || !l)
      return;
    const u = Rc((d) => {
      c(d), l.removeEventListener("pointerleave", u);
    });
    l.addEventListener("pointerleave", u, i);
  });
  return r.forEach((a) => {
    a.addEventListener("pointerenter", s, i);
  }), o;
}
const ch = (e, t) => t ? e === t ? !0 : ch(e, t.parentElement) : !1, Qa = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, Ex = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function Px(e) {
  return Ex.has(e.tagName) || e.tabIndex !== -1;
}
const Dr = /* @__PURE__ */ new WeakSet();
function Nc(e) {
  return (t) => {
    t.key === "Enter" && e(t);
  };
}
function Xo(e, t) {
  e.dispatchEvent(new PointerEvent("pointer" + t, { isPrimary: !0, bubbles: !0 }));
}
const Ax = (e, t) => {
  const n = e.currentTarget;
  if (!n)
    return;
  const r = Nc(() => {
    if (Dr.has(n))
      return;
    Xo(n, "down");
    const i = Nc(() => {
      Xo(n, "up");
    }), o = () => Xo(n, "cancel");
    n.addEventListener("keyup", i, t), n.addEventListener("blur", o, t);
  });
  n.addEventListener("keydown", r, t), n.addEventListener("blur", () => n.removeEventListener("keydown", r), t);
};
function Ic(e) {
  return Qa(e) && !ah();
}
function Rx(e, t, n = {}) {
  const [r, i, o] = lh(e, n), s = (a) => {
    const l = a.currentTarget;
    if (!Ic(a) || Dr.has(l))
      return;
    Dr.add(l);
    const c = t(a), u = (f, g) => {
      window.removeEventListener("pointerup", d), window.removeEventListener("pointercancel", h), !(!Ic(f) || !Dr.has(l)) && (Dr.delete(l), typeof c == "function" && c(f, { success: g }));
    }, d = (f) => {
      u(f, n.useGlobalTarget || ch(l, f.target));
    }, h = (f) => {
      u(f, !1);
    };
    window.addEventListener("pointerup", d, i), window.addEventListener("pointercancel", h, i);
  };
  return r.forEach((a) => {
    !Px(a) && a.getAttribute("tabindex") === null && (a.tabIndex = 0), (n.useGlobalTarget ? window : a).addEventListener("pointerdown", s, i), a.addEventListener("focus", (c) => Ax(c, i), i);
  }), o;
}
function Nx(e) {
  return e === "x" || e === "y" ? Nt[e] ? null : (Nt[e] = !0, () => {
    Nt[e] = !1;
  }) : Nt.x || Nt.y ? null : (Nt.x = Nt.y = !0, () => {
    Nt.x = Nt.y = !1;
  });
}
const uh = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...gr
]);
let Ri;
function Ix() {
  Ri = void 0;
}
const $t = {
  now: () => (Ri === void 0 && $t.set(Ge.isProcessing || Eb.useManualTiming ? Ge.timestamp : performance.now()), Ri),
  set: (e) => {
    Ri = e, queueMicrotask(Ix);
  }
};
function el(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function tl(e, t) {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
class nl {
  constructor() {
    this.subscriptions = [];
  }
  add(t) {
    return el(this.subscriptions, t), () => tl(this.subscriptions, t);
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
function dh(e, t) {
  return t ? e * (1e3 / t) : 0;
}
const Dc = 30, Dx = (e) => !isNaN(parseFloat(e));
class Mx {
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
      const o = $t.now();
      this.updatedAt !== o && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && this.events.change && this.events.change.notify(this.current), i && this.events.renderRequest && this.events.renderRequest.notify(this.current);
    }, this.hasAnimated = !1, this.setCurrent(t), this.owner = n.owner;
  }
  setCurrent(t) {
    this.current = t, this.updatedAt = $t.now(), this.canTrackVelocity === null && t !== void 0 && (this.canTrackVelocity = Dx(this.current));
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
    this.events[t] || (this.events[t] = new nl());
    const r = this.events[t].add(n);
    return t === "change" ? () => {
      r(), Ie.read(() => {
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
    const t = $t.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || t - this.updatedAt > Dc)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, Dc);
    return dh(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
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
  return new Mx(e, t);
}
function Ox(e, t, n) {
  e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, Hr(n));
}
function Lx(e, t) {
  const n = wo(e, t);
  let { transitionEnd: r = {}, transition: i = {}, ...o } = n || {};
  o = { ...o, ...r };
  for (const s in o) {
    const a = Kb(o[s]);
    Ox(e, s, a);
  }
}
function _x(e) {
  return !!(nt(e) && e.add);
}
function Vs(e, t) {
  const n = e.getValue("willChange");
  if (_x(n))
    return n.add(t);
}
function fh(e) {
  return e.props[jf];
}
const hh = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e, Fx = 1e-7, Vx = 12;
function Bx(e, t, n, r, i) {
  let o, s, a = 0;
  do
    s = t + (n - t) / 2, o = hh(s, r, i) - e, o > 0 ? n = s : t = s;
  while (Math.abs(o) > Fx && ++a < Vx);
  return s;
}
function ti(e, t, n, r) {
  if (e === t && n === r)
    return ft;
  const i = (o) => Bx(o, 0, 1, e, n);
  return (o) => o === 0 || o === 1 ? o : hh(i(o), t, r);
}
const ph = (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, mh = (e) => (t) => 1 - e(1 - t), gh = /* @__PURE__ */ ti(0.33, 1.53, 0.69, 0.99), rl = /* @__PURE__ */ mh(gh), yh = /* @__PURE__ */ ph(rl), vh = (e) => (e *= 2) < 1 ? 0.5 * rl(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), il = (e) => 1 - Math.sin(Math.acos(e)), bh = mh(il), xh = ph(il), wh = (e) => /^0[^.\s]+$/u.test(e);
function zx(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || wh(e) : !0;
}
const Lr = (e) => Math.round(e * 1e5) / 1e5, ol = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function $x(e) {
  return e == null;
}
const jx = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, sl = (e, t) => (n) => !!(typeof n == "string" && jx.test(n) && n.startsWith(e) || t && !$x(n) && Object.prototype.hasOwnProperty.call(n, t)), Sh = (e, t, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [i, o, s, a] = r.match(ol);
  return {
    [e]: parseFloat(i),
    [t]: parseFloat(o),
    [n]: parseFloat(s),
    alpha: a !== void 0 ? parseFloat(a) : 1
  };
}, Ux = (e) => Zt(0, 255, e), Zo = {
  ...yr,
  transform: (e) => Math.round(Ux(e))
}, In = {
  test: /* @__PURE__ */ sl("rgb", "red"),
  parse: /* @__PURE__ */ Sh("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: n, alpha: r = 1 }) => "rgba(" + Zo.transform(e) + ", " + Zo.transform(t) + ", " + Zo.transform(n) + ", " + Lr(Ur.transform(r)) + ")"
};
function Hx(e) {
  let t = "", n = "", r = "", i = "";
  return e.length > 5 ? (t = e.substring(1, 3), n = e.substring(3, 5), r = e.substring(5, 7), i = e.substring(7, 9)) : (t = e.substring(1, 2), n = e.substring(2, 3), r = e.substring(3, 4), i = e.substring(4, 5), t += t, n += n, r += r, i += i), {
    red: parseInt(t, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: i ? parseInt(i, 16) / 255 : 1
  };
}
const Bs = {
  test: /* @__PURE__ */ sl("#"),
  parse: Hx,
  transform: In.transform
}, Zn = {
  test: /* @__PURE__ */ sl("hsl", "hue"),
  parse: /* @__PURE__ */ Sh("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(e) + ", " + zt.transform(Lr(t)) + ", " + zt.transform(Lr(n)) + ", " + Lr(Ur.transform(r)) + ")"
}, et = {
  test: (e) => In.test(e) || Bs.test(e) || Zn.test(e),
  parse: (e) => In.test(e) ? In.parse(e) : Zn.test(e) ? Zn.parse(e) : Bs.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? In.transform(e) : Zn.transform(e)
}, Wx = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function qx(e) {
  var t, n;
  return isNaN(e) && typeof e == "string" && (((t = e.match(ol)) === null || t === void 0 ? void 0 : t.length) || 0) + (((n = e.match(Wx)) === null || n === void 0 ? void 0 : n.length) || 0) > 0;
}
const kh = "number", Ch = "color", Kx = "var", Gx = "var(", Mc = "${}", Yx = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Wr(e) {
  const t = e.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, i = [];
  let o = 0;
  const a = t.replace(Yx, (l) => (et.test(l) ? (r.color.push(o), i.push(Ch), n.push(et.parse(l))) : l.startsWith(Gx) ? (r.var.push(o), i.push(Kx), n.push(l)) : (r.number.push(o), i.push(kh), n.push(parseFloat(l))), ++o, Mc)).split(Mc);
  return { values: n, split: a, indexes: r, types: i };
}
function Th(e) {
  return Wr(e).values;
}
function Eh(e) {
  const { split: t, types: n } = Wr(e), r = t.length;
  return (i) => {
    let o = "";
    for (let s = 0; s < r; s++)
      if (o += t[s], i[s] !== void 0) {
        const a = n[s];
        a === kh ? o += Lr(i[s]) : a === Ch ? o += et.transform(i[s]) : o += i[s];
      }
    return o;
  };
}
const Xx = (e) => typeof e == "number" ? 0 : e;
function Zx(e) {
  const t = Th(e);
  return Eh(e)(t.map(Xx));
}
const hn = {
  test: qx,
  parse: Th,
  createTransformer: Eh,
  getAnimatableNone: Zx
}, Jx = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function Qx(e) {
  const [t, n] = e.slice(0, -1).split("(");
  if (t === "drop-shadow")
    return e;
  const [r] = n.match(ol) || [];
  if (!r)
    return e;
  const i = n.replace(r, "");
  let o = Jx.has(t) ? 1 : 0;
  return r !== n && (o *= 100), t + "(" + o + i + ")";
}
const ew = /\b([a-z-]*)\(.*?\)/gu, zs = {
  ...hn,
  getAnimatableNone: (e) => {
    const t = e.match(ew);
    return t ? t.map(Qx).join(" ") : e;
  }
}, tw = {
  ...Ha,
  // Color props
  color: et,
  backgroundColor: et,
  outlineColor: et,
  fill: et,
  stroke: et,
  // Border props
  borderColor: et,
  borderTopColor: et,
  borderRightColor: et,
  borderBottomColor: et,
  borderLeftColor: et,
  filter: zs,
  WebkitFilter: zs
}, al = (e) => tw[e];
function Ph(e, t) {
  let n = al(e);
  return n !== zs && (n = hn), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0;
}
const nw = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function rw(e, t, n) {
  let r = 0, i;
  for (; r < e.length && !i; ) {
    const o = e[r];
    typeof o == "string" && !nw.has(o) && Wr(o).values.length && (i = e[r]), r++;
  }
  if (i && n)
    for (const o of t)
      e[o] = Ph(n, i);
}
const Oc = (e) => e === yr || e === Q, Lc = (e, t) => parseFloat(e.split(", ")[t]), _c = (e, t) => (n, { transform: r }) => {
  if (r === "none" || !r)
    return 0;
  const i = r.match(/^matrix3d\((.+)\)$/u);
  if (i)
    return Lc(i[1], t);
  {
    const o = r.match(/^matrix\((.+)\)$/u);
    return o ? Lc(o[1], e) : 0;
  }
}, iw = /* @__PURE__ */ new Set(["x", "y", "z"]), ow = gr.filter((e) => !iw.has(e));
function sw(e) {
  const t = [];
  return ow.forEach((n) => {
    const r = e.getValue(n);
    r !== void 0 && (t.push([n, r.get()]), r.set(n.startsWith("scale") ? 1 : 0));
  }), t;
}
const ar = {
  // Dimensions
  width: ({ x: e }, { paddingLeft: t = "0", paddingRight: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  height: ({ y: e }, { paddingTop: t = "0", paddingBottom: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  top: (e, { top: t }) => parseFloat(t),
  left: (e, { left: t }) => parseFloat(t),
  bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
  right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
  // Transform
  x: _c(4, 13),
  y: _c(5, 14)
};
ar.translateX = ar.x;
ar.translateY = ar.y;
const Dn = /* @__PURE__ */ new Set();
let $s = !1, js = !1;
function Ah() {
  if (js) {
    const e = Array.from(Dn).filter((r) => r.needsMeasurement), t = new Set(e.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    t.forEach((r) => {
      const i = sw(r);
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
  js = !1, $s = !1, Dn.forEach((e) => e.complete()), Dn.clear();
}
function Rh() {
  Dn.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (js = !0);
  });
}
function aw() {
  Rh(), Ah();
}
class ll {
  constructor(t, n, r, i, o, s = !1) {
    this.isComplete = !1, this.isAsync = !1, this.needsMeasurement = !1, this.isScheduled = !1, this.unresolvedKeyframes = [...t], this.onComplete = n, this.name = r, this.motionValue = i, this.element = o, this.isAsync = s;
  }
  scheduleResolve() {
    this.isScheduled = !0, this.isAsync ? (Dn.add(this), $s || ($s = !0, Ie.read(Rh), Ie.resolveKeyframes(Ah))) : (this.readKeyframes(), this.complete());
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
    this.isComplete = !0, this.onComplete(this.unresolvedKeyframes, this.finalKeyframe), Dn.delete(this);
  }
  cancel() {
    this.isComplete || (this.isScheduled = !1, Dn.delete(this));
  }
  resume() {
    this.isComplete || this.scheduleResolve();
  }
}
const Nh = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), lw = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function cw(e) {
  const t = lw.exec(e);
  if (!t)
    return [,];
  const [, n, r, i] = t;
  return [`--${n ?? r}`, i];
}
const uw = 4;
function Ih(e, t, n = 1) {
  dn(n <= uw, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`);
  const [r, i] = cw(e);
  if (!r)
    return;
  const o = window.getComputedStyle(t).getPropertyValue(r);
  if (o) {
    const s = o.trim();
    return Nh(s) ? parseFloat(s) : s;
  }
  return Ua(i) ? Ih(i, t, n + 1) : i;
}
const Dh = (e) => (t) => t.test(e), dw = {
  test: (e) => e === "auto",
  parse: (e) => e
}, Mh = [yr, Q, zt, cn, Qb, Jb, dw], Fc = (e) => Mh.find(Dh(e));
class Oh extends ll {
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
      if (typeof c == "string" && (c = c.trim(), Ua(c))) {
        const u = Ih(c, n.current);
        u !== void 0 && (t[l] = u), l === t.length - 1 && (this.finalKeyframe = c);
      }
    }
    if (this.resolveNoneKeyframes(), !uh.has(r) || t.length !== 2)
      return;
    const [i, o] = t, s = Fc(i), a = Fc(o);
    if (s !== a)
      if (Oc(s) && Oc(a))
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
      zx(t[i]) && r.push(i);
    r.length && rw(t, r, n);
  }
  measureInitialState() {
    const { element: t, unresolvedKeyframes: n, name: r } = this;
    if (!t || !t.current)
      return;
    r === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = ar[r](t.measureViewportBox(), window.getComputedStyle(t.current)), n[0] = this.measuredOrigin;
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
    i[s] = ar[r](n.measureViewportBox(), window.getComputedStyle(n.current)), a !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = a), !((t = this.removedTransforms) === null || t === void 0) && t.length && this.removedTransforms.forEach(([l, c]) => {
      n.getValue(l).set(c);
    }), this.resolveNoneKeyframes();
  }
}
const Vc = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(hn.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function fw(e) {
  const t = e[0];
  if (e.length === 1)
    return !0;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t)
      return !0;
}
function hw(e, t, n, r) {
  const i = e[0];
  if (i === null)
    return !1;
  if (t === "display" || t === "visibility")
    return !0;
  const o = e[e.length - 1], s = Vc(i, t), a = Vc(o, t);
  return mr(s === a, `You are trying to animate ${t} from "${i}" to "${o}". ${i} is not an animatable value - to enable this animation set ${i} to a value animatable to ${o} via the \`style\` property.`), !s || !a ? !1 : fw(e) || (n === "spring" || Za(n)) && r;
}
const pw = (e) => e !== null;
function So(e, { repeat: t, repeatType: n = "loop" }, r) {
  const i = e.filter(pw), o = t && n !== "loop" && t % 2 === 1 ? 0 : i.length - 1;
  return !o || r === void 0 ? i[o] : r;
}
const mw = 40;
class Lh {
  constructor({ autoplay: t = !0, delay: n = 0, type: r = "keyframes", repeat: i = 0, repeatDelay: o = 0, repeatType: s = "loop", ...a }) {
    this.isStopped = !1, this.hasAttemptedResolve = !1, this.createdAt = $t.now(), this.options = {
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
    return this.resolvedAt ? this.resolvedAt - this.createdAt > mw ? this.resolvedAt : this.createdAt : this.createdAt;
  }
  /**
   * A getter for resolved data. If keyframes are not yet resolved, accessing
   * this.resolved will synchronously flush all pending keyframe resolvers.
   * This is a deoptimisation, but at its worst still batches read/writes.
   */
  get resolved() {
    return !this._resolved && !this.hasAttemptedResolve && aw(), this._resolved;
  }
  /**
   * A method to be called when the keyframes resolver completes. This method
   * will check if its possible to run the animation and, if not, skip it.
   * Otherwise, it will call initPlayback on the implementing class.
   */
  onKeyframesResolved(t, n) {
    this.resolvedAt = $t.now(), this.hasAttemptedResolve = !0;
    const { name: r, type: i, velocity: o, delay: s, onComplete: a, onUpdate: l, isGenerator: c } = this.options;
    if (!c && !hw(t, r, i, o))
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
const _e = (e, t, n) => e + (t - e) * n;
function Jo(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function gw({ hue: e, saturation: t, lightness: n, alpha: r }) {
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
}, yw = [Bs, In, Zn], vw = (e) => yw.find((t) => t.test(e));
function Bc(e) {
  const t = vw(e);
  if (mr(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`), !t)
    return !1;
  let n = t.parse(e);
  return t === Zn && (n = gw(n)), n;
}
const zc = (e, t) => {
  const n = Bc(e), r = Bc(t);
  if (!n || !r)
    return Ui(e, t);
  const i = { ...n };
  return (o) => (i.red = Qo(n.red, r.red, o), i.green = Qo(n.green, r.green, o), i.blue = Qo(n.blue, r.blue, o), i.alpha = _e(n.alpha, r.alpha, o), In.transform(i));
}, bw = (e, t) => (n) => t(e(n)), ni = (...e) => e.reduce(bw), Us = /* @__PURE__ */ new Set(["none", "hidden"]);
function xw(e, t) {
  return Us.has(e) ? (n) => n <= 0 ? e : t : (n) => n >= 1 ? t : e;
}
function ww(e, t) {
  return (n) => _e(e, t, n);
}
function cl(e) {
  return typeof e == "number" ? ww : typeof e == "string" ? Ua(e) ? Ui : et.test(e) ? zc : Cw : Array.isArray(e) ? _h : typeof e == "object" ? et.test(e) ? zc : Sw : Ui;
}
function _h(e, t) {
  const n = [...e], r = n.length, i = e.map((o, s) => cl(o)(o, t[s]));
  return (o) => {
    for (let s = 0; s < r; s++)
      n[s] = i[s](o);
    return n;
  };
}
function Sw(e, t) {
  const n = { ...e, ...t }, r = {};
  for (const i in n)
    e[i] !== void 0 && t[i] !== void 0 && (r[i] = cl(e[i])(e[i], t[i]));
  return (i) => {
    for (const o in r)
      n[o] = r[o](i);
    return n;
  };
}
function kw(e, t) {
  var n;
  const r = [], i = { color: 0, var: 0, number: 0 };
  for (let o = 0; o < t.values.length; o++) {
    const s = t.types[o], a = e.indexes[s][i[s]], l = (n = e.values[a]) !== null && n !== void 0 ? n : 0;
    r[o] = l, i[s]++;
  }
  return r;
}
const Cw = (e, t) => {
  const n = hn.createTransformer(t), r = Wr(e), i = Wr(t);
  return r.indexes.var.length === i.indexes.var.length && r.indexes.color.length === i.indexes.color.length && r.indexes.number.length >= i.indexes.number.length ? Us.has(e) && !i.values.length || Us.has(t) && !r.values.length ? xw(e, t) : ni(_h(kw(r, i), i.values), n) : (mr(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`), Ui(e, t));
};
function Fh(e, t, n) {
  return typeof e == "number" && typeof t == "number" && typeof n == "number" ? _e(e, t, n) : cl(e)(e, t);
}
const Tw = 5;
function Vh(e, t, n) {
  const r = Math.max(t - Tw, 0);
  return dh(n - e(r), t - r);
}
const Le = {
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
function Ew({ duration: e = Le.duration, bounce: t = Le.bounce, velocity: n = Le.velocity, mass: r = Le.mass }) {
  let i, o;
  mr(e <= /* @__PURE__ */ Bt(Le.maxDuration), "Spring duration must be 10 seconds or less");
  let s = 1 - t;
  s = Zt(Le.minDamping, Le.maxDamping, s), e = Zt(Le.minDuration, Le.maxDuration, /* @__PURE__ */ Yt(e)), s < 1 ? (i = (c) => {
    const u = c * s, d = u * e, h = u - n, f = Hs(c, s), g = Math.exp(-d);
    return es - h / f * g;
  }, o = (c) => {
    const d = c * s * e, h = d * n + n, f = Math.pow(s, 2) * Math.pow(c, 2) * e, g = Math.exp(-d), m = Hs(Math.pow(c, 2), s);
    return (-i(c) + es > 0 ? -1 : 1) * ((h - f) * g) / m;
  }) : (i = (c) => {
    const u = Math.exp(-c * e), d = (c - n) * e + 1;
    return -es + u * d;
  }, o = (c) => {
    const u = Math.exp(-c * e), d = (n - c) * (e * e);
    return u * d;
  });
  const a = 5 / e, l = Aw(i, o, a);
  if (e = /* @__PURE__ */ Bt(e), isNaN(l))
    return {
      stiffness: Le.stiffness,
      damping: Le.damping,
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
const Pw = 12;
function Aw(e, t, n) {
  let r = n;
  for (let i = 1; i < Pw; i++)
    r = r - e(r) / t(r);
  return r;
}
function Hs(e, t) {
  return e * Math.sqrt(1 - t * t);
}
const Rw = ["duration", "bounce"], Nw = ["stiffness", "damping", "mass"];
function $c(e, t) {
  return t.some((n) => e[n] !== void 0);
}
function Iw(e) {
  let t = {
    velocity: Le.velocity,
    stiffness: Le.stiffness,
    damping: Le.damping,
    mass: Le.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!$c(e, Nw) && $c(e, Rw))
    if (e.visualDuration) {
      const n = e.visualDuration, r = 2 * Math.PI / (n * 1.2), i = r * r, o = 2 * Zt(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(i);
      t = {
        ...t,
        mass: Le.mass,
        stiffness: i,
        damping: o
      };
    } else {
      const n = Ew(e);
      t = {
        ...t,
        ...n,
        mass: Le.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function Bh(e = Le.visualDuration, t = Le.bounce) {
  const n = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e;
  let { restSpeed: r, restDelta: i } = n;
  const o = n.keyframes[0], s = n.keyframes[n.keyframes.length - 1], a = { done: !1, value: o }, { stiffness: l, damping: c, mass: u, duration: d, velocity: h, isResolvedFromDuration: f } = Iw({
    ...n,
    velocity: -/* @__PURE__ */ Yt(n.velocity || 0)
  }), g = h || 0, m = c / (2 * Math.sqrt(l * u)), b = s - o, v = /* @__PURE__ */ Yt(Math.sqrt(l / u)), x = Math.abs(b) < 5;
  r || (r = x ? Le.restSpeed.granular : Le.restSpeed.default), i || (i = x ? Le.restDelta.granular : Le.restDelta.default);
  let w;
  if (m < 1) {
    const E = Hs(v, m);
    w = (k) => {
      const A = Math.exp(-m * v * k);
      return s - A * ((g + m * v * b) / E * Math.sin(E * k) + b * Math.cos(E * k));
    };
  } else if (m === 1)
    w = (E) => s - Math.exp(-v * E) * (b + (g + v * b) * E);
  else {
    const E = v * Math.sqrt(m * m - 1);
    w = (k) => {
      const A = Math.exp(-m * v * k), I = Math.min(E * k, 300);
      return s - A * ((g + m * v * b) * Math.sinh(I) + E * b * Math.cosh(I)) / E;
    };
  }
  const T = {
    calculatedDuration: f && d || null,
    next: (E) => {
      const k = w(E);
      if (f)
        a.done = E >= d;
      else {
        let A = 0;
        m < 1 && (A = E === 0 ? /* @__PURE__ */ Bt(g) : Vh(w, E, k));
        const I = Math.abs(A) <= r, F = Math.abs(s - k) <= i;
        a.done = I && F;
      }
      return a.value = a.done ? s : k, a;
    },
    toString: () => {
      const E = Math.min(rh(T), _s), k = ih((A) => T.next(E * A).value, E, 30);
      return E + "ms " + k;
    }
  };
  return T;
}
function jc({ keyframes: e, velocity: t = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: i = 10, bounceStiffness: o = 500, modifyTarget: s, min: a, max: l, restDelta: c = 0.5, restSpeed: u }) {
  const d = e[0], h = {
    done: !1,
    value: d
  }, f = (I) => a !== void 0 && I < a || l !== void 0 && I > l, g = (I) => a === void 0 ? l : l === void 0 || Math.abs(a - I) < Math.abs(l - I) ? a : l;
  let m = n * t;
  const b = d + m, v = s === void 0 ? b : s(b);
  v !== b && (m = v - d);
  const x = (I) => -m * Math.exp(-I / r), w = (I) => v + x(I), T = (I) => {
    const F = x(I), P = w(I);
    h.done = Math.abs(F) <= c, h.value = h.done ? v : P;
  };
  let E, k;
  const A = (I) => {
    f(h.value) && (E = I, k = Bh({
      keyframes: [h.value, g(h.value)],
      velocity: Vh(w, I, h.value),
      // TODO: This should be passing * 1000
      damping: i,
      stiffness: o,
      restDelta: c,
      restSpeed: u
    }));
  };
  return A(0), {
    calculatedDuration: null,
    next: (I) => {
      let F = !1;
      return !k && E === void 0 && (F = !0, T(I), A(I)), E !== void 0 && I >= E ? k.next(I - E) : (!F && T(I), h);
    }
  };
}
const Dw = /* @__PURE__ */ ti(0.42, 0, 1, 1), Mw = /* @__PURE__ */ ti(0, 0, 0.58, 1), zh = /* @__PURE__ */ ti(0.42, 0, 0.58, 1), Ow = (e) => Array.isArray(e) && typeof e[0] != "number", Uc = {
  linear: ft,
  easeIn: Dw,
  easeInOut: zh,
  easeOut: Mw,
  circIn: il,
  circInOut: xh,
  circOut: bh,
  backIn: rl,
  backInOut: yh,
  backOut: gh,
  anticipate: vh
}, Hc = (e) => {
  if (Ja(e)) {
    dn(e.length === 4, "Cubic bezier arrays must contain four numerical values.");
    const [t, n, r, i] = e;
    return ti(t, n, r, i);
  } else if (typeof e == "string")
    return dn(Uc[e] !== void 0, `Invalid easing type '${e}'`), Uc[e];
  return e;
};
function Lw(e, t, n) {
  const r = [], i = n || Fh, o = e.length - 1;
  for (let s = 0; s < o; s++) {
    let a = i(e[s], e[s + 1]);
    if (t) {
      const l = Array.isArray(t) ? t[s] || ft : t;
      a = ni(l, a);
    }
    r.push(a);
  }
  return r;
}
function _w(e, t, { clamp: n = !0, ease: r, mixer: i } = {}) {
  const o = e.length;
  if (dn(o === t.length, "Both input and output ranges must be the same length"), o === 1)
    return () => t[0];
  if (o === 2 && t[0] === t[1])
    return () => t[1];
  const s = e[0] === e[1];
  e[0] > e[o - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const a = Lw(t, r, i), l = a.length, c = (u) => {
    if (s && u < e[0])
      return t[0];
    let d = 0;
    if (l > 1)
      for (; d < e.length - 2 && !(u < e[d + 1]); d++)
        ;
    const h = /* @__PURE__ */ or(e[d], e[d + 1], u);
    return a[d](h);
  };
  return n ? (u) => c(Zt(e[0], e[o - 1], u)) : c;
}
function Fw(e, t) {
  const n = e[e.length - 1];
  for (let r = 1; r <= t; r++) {
    const i = /* @__PURE__ */ or(0, t, r);
    e.push(_e(n, 1, i));
  }
}
function Vw(e) {
  const t = [0];
  return Fw(t, e.length - 1), t;
}
function Bw(e, t) {
  return e.map((n) => n * t);
}
function zw(e, t) {
  return e.map(() => t || zh).splice(0, e.length - 1);
}
function Hi({ duration: e = 300, keyframes: t, times: n, ease: r = "easeInOut" }) {
  const i = Ow(r) ? r.map(Hc) : Hc(r), o = {
    done: !1,
    value: t[0]
  }, s = Bw(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === t.length ? n : Vw(t),
    e
  ), a = _w(s, t, {
    ease: Array.isArray(i) ? i : zw(t, i)
  });
  return {
    calculatedDuration: e,
    next: (l) => (o.value = a(l), o.done = l >= e, o)
  };
}
const $w = (e) => {
  const t = ({ timestamp: n }) => e(n);
  return {
    start: () => Ie.update(t, !0),
    stop: () => fn(t),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Ge.isProcessing ? Ge.timestamp : $t.now()
  };
}, jw = {
  decay: jc,
  inertia: jc,
  tween: Hi,
  keyframes: Hi,
  spring: Bh
}, Uw = (e) => e / 100;
class ul extends Lh {
  constructor(t) {
    super(t), this.holdTime = null, this.cancelTime = null, this.currentTime = 0, this.playbackSpeed = 1, this.pendingPlayState = "running", this.startTime = null, this.state = "idle", this.stop = () => {
      if (this.resolver.cancel(), this.isStopped = !0, this.state === "idle")
        return;
      this.teardown();
      const { onStop: l } = this.options;
      l && l();
    };
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options, s = (i == null ? void 0 : i.KeyframeResolver) || ll, a = (l, c) => this.onKeyframesResolved(l, c);
    this.resolver = new s(o, a, n, r, i), this.resolver.scheduleResolve();
  }
  flatten() {
    super.flatten(), this._resolved && Object.assign(this._resolved, this.initPlayback(this._resolved.keyframes));
  }
  initPlayback(t) {
    const { type: n = "keyframes", repeat: r = 0, repeatDelay: i = 0, repeatType: o, velocity: s = 0 } = this.options, a = Za(n) ? n : jw[n] || Hi;
    let l, c;
    a !== Hi && typeof t[0] != "number" && (process.env.NODE_ENV !== "production" && dn(t.length === 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${t}`), l = ni(Uw, Fh(t[0], t[1])), t = [0, 100]);
    const u = a({ ...this.options, keyframes: t });
    o === "mirror" && (c = a({
      ...this.options,
      keyframes: [...t].reverse(),
      velocity: -s
    })), u.calculatedDuration === null && (u.calculatedDuration = rh(u));
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
      const { keyframes: I } = this.options;
      return { done: !0, value: I[I.length - 1] };
    }
    const { finalKeyframe: i, generator: o, mirroredGenerator: s, mapPercentToKeyframes: a, keyframes: l, calculatedDuration: c, totalDuration: u, resolvedDuration: d } = r;
    if (this.startTime === null)
      return o.next(0);
    const { delay: h, repeat: f, repeatType: g, repeatDelay: m, onUpdate: b } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, t) : this.speed < 0 && (this.startTime = Math.min(t - u / this.speed, this.startTime)), n ? this.currentTime = t : this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = Math.round(t - this.startTime) * this.speed;
    const v = this.currentTime - h * (this.speed >= 0 ? 1 : -1), x = this.speed >= 0 ? v < 0 : v > u;
    this.currentTime = Math.max(v, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = u);
    let w = this.currentTime, T = o;
    if (f) {
      const I = Math.min(this.currentTime, u) / d;
      let F = Math.floor(I), P = I % 1;
      !P && I >= 1 && (P = 1), P === 1 && F--, F = Math.min(F, f + 1), !!(F % 2) && (g === "reverse" ? (P = 1 - P, m && (P -= m / d)) : g === "mirror" && (T = s)), w = Zt(0, 1, P) * d;
    }
    const E = x ? { done: !1, value: l[0] } : T.next(w);
    a && (E.value = a(E.value));
    let { done: k } = E;
    !x && c !== null && (k = this.speed >= 0 ? this.currentTime >= u : this.currentTime <= 0);
    const A = this.holdTime === null && (this.state === "finished" || this.state === "running" && k);
    return A && i !== void 0 && (E.value = So(l, this.options, i)), b && b(E.value), A && this.finish(), E;
  }
  get duration() {
    const { resolved: t } = this;
    return t ? /* @__PURE__ */ Yt(t.calculatedDuration) : 0;
  }
  get time() {
    return /* @__PURE__ */ Yt(this.currentTime);
  }
  set time(t) {
    t = /* @__PURE__ */ Bt(t), this.currentTime = t, this.holdTime !== null || this.speed === 0 ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.speed);
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
    const { driver: t = $w, onPlay: n, startTime: r } = this.options;
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
const Hw = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]);
function Ww(e, t, n, { delay: r = 0, duration: i = 300, repeat: o = 0, repeatType: s = "loop", ease: a = "easeInOut", times: l } = {}) {
  const c = { [t]: n };
  l && (c.offset = l);
  const u = sh(a, i);
  return Array.isArray(u) && (c.easing = u), e.animate(c, {
    delay: r,
    duration: i,
    easing: Array.isArray(u) ? "linear" : u,
    fill: "both",
    iterations: o + 1,
    direction: s === "reverse" ? "alternate" : "normal"
  });
}
const qw = /* @__PURE__ */ _a(() => Object.hasOwnProperty.call(Element.prototype, "animate")), Wi = 10, Kw = 2e4;
function Gw(e) {
  return Za(e.type) || e.type === "spring" || !oh(e.ease);
}
function Yw(e, t) {
  const n = new ul({
    ...t,
    keyframes: e,
    repeat: 0,
    delay: 0,
    isGenerator: !0
  });
  let r = { done: !1, value: e[0] };
  const i = [];
  let o = 0;
  for (; !r.done && o < Kw; )
    r = n.sample(o), i.push(r.value), o += Wi;
  return {
    times: void 0,
    keyframes: i,
    duration: o - Wi,
    ease: "linear"
  };
}
const $h = {
  anticipate: vh,
  backInOut: yh,
  circInOut: xh
};
function Xw(e) {
  return e in $h;
}
class Wc extends Lh {
  constructor(t) {
    super(t);
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options;
    this.resolver = new Oh(o, (s, a) => this.onKeyframesResolved(s, a), n, r, i), this.resolver.scheduleResolve();
  }
  initPlayback(t, n) {
    let { duration: r = 300, times: i, ease: o, type: s, motionValue: a, name: l, startTime: c } = this.options;
    if (!a.owner || !a.owner.current)
      return !1;
    if (typeof o == "string" && ji() && Xw(o) && (o = $h[o]), Gw(this.options)) {
      const { onComplete: d, onUpdate: h, motionValue: f, element: g, ...m } = this.options, b = Yw(t, m);
      t = b.keyframes, t.length === 1 && (t[1] = t[0]), r = b.duration, i = b.times, o = b.ease, s = "keyframes";
    }
    const u = Ww(a.owner.current, l, t, { ...this.options, duration: r, times: i, ease: o });
    return u.startTime = c ?? this.calcStartTime(), this.pendingTimeline ? (Ac(u, this.pendingTimeline), this.pendingTimeline = void 0) : u.onfinish = () => {
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
    r.currentTime = /* @__PURE__ */ Bt(t);
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
        return ft;
      const { animation: r } = n;
      Ac(r, t);
    }
    return ft;
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
      const { motionValue: c, onUpdate: u, onComplete: d, element: h, ...f } = this.options, g = new ul({
        ...f,
        keyframes: r,
        duration: i,
        type: o,
        ease: s,
        times: a,
        isGenerator: !0
      }), m = /* @__PURE__ */ Bt(this.time);
      c.setWithVelocity(g.sample(m - Wi).value, g.sample(m).value, Wi);
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
    return qw() && r && Hw.has(r) && /**
     * If we're outputting values to onUpdate then we can't use WAAPI as there's
     * no way to read the value from WAAPI every frame.
     */
    !l && !c && !i && o !== "mirror" && s !== 0 && a !== "inertia";
  }
}
const Zw = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, Jw = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), Qw = {
  type: "keyframes",
  duration: 0.8
}, e0 = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, t0 = (e, { keyframes: t }) => t.length > 2 ? Qw : jn.has(e) ? e.startsWith("scale") ? Jw(t[1]) : Zw : e0;
function n0({ when: e, delay: t, delayChildren: n, staggerChildren: r, staggerDirection: i, repeat: o, repeatType: s, repeatDelay: a, from: l, elapsed: c, ...u }) {
  return !!Object.keys(u).length;
}
const dl = (e, t, n, r = {}, i, o) => (s) => {
  const a = Xa(r, e) || {}, l = a.delay || r.delay || 0;
  let { elapsed: c = 0 } = r;
  c = c - /* @__PURE__ */ Bt(l);
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
  n0(a) || (u = {
    ...u,
    ...t0(e, u)
  }), u.duration && (u.duration = /* @__PURE__ */ Bt(u.duration)), u.repeatDelay && (u.repeatDelay = /* @__PURE__ */ Bt(u.repeatDelay)), u.from !== void 0 && (u.keyframes[0] = u.from);
  let d = !1;
  if ((u.type === !1 || u.duration === 0 && !u.repeatDelay) && (u.duration = 0, u.delay === 0 && (d = !0)), d && !o && t.get() !== void 0) {
    const h = So(u.keyframes, a);
    if (h !== void 0)
      return Ie.update(() => {
        u.onUpdate(h), u.onComplete();
      }), new wx([]);
  }
  return !o && Wc.supports(u) ? new Wc(u) : new ul(u);
};
function r0({ protectedKeys: e, needsAnimating: t }, n) {
  const r = e.hasOwnProperty(n) && t[n] !== !0;
  return t[n] = !1, r;
}
function jh(e, t, { delay: n = 0, transitionOverride: r, type: i } = {}) {
  var o;
  let { transition: s = e.getDefaultTransition(), transitionEnd: a, ...l } = t;
  r && (s = r);
  const c = [], u = i && e.animationState && e.animationState.getState()[i];
  for (const d in l) {
    const h = e.getValue(d, (o = e.latestValues[d]) !== null && o !== void 0 ? o : null), f = l[d];
    if (f === void 0 || u && r0(u, d))
      continue;
    const g = {
      delay: n,
      ...Xa(s || {}, d)
    };
    let m = !1;
    if (window.MotionHandoffAnimation) {
      const v = fh(e);
      if (v) {
        const x = window.MotionHandoffAnimation(v, d, Ie);
        x !== null && (g.startTime = x, m = !0);
      }
    }
    Vs(e, d), h.start(dl(d, h, f, e.shouldReduceMotion && uh.has(d) ? { type: !1 } : g, e, m));
    const b = h.animation;
    b && c.push(b);
  }
  return a && Promise.all(c).then(() => {
    Ie.update(() => {
      a && Lx(e, a);
    });
  }), c;
}
function Ws(e, t, n = {}) {
  var r;
  const i = wo(e, t, n.type === "exit" ? (r = e.presenceContext) === null || r === void 0 ? void 0 : r.custom : void 0);
  let { transition: o = e.getDefaultTransition() || {} } = i || {};
  n.transitionOverride && (o = n.transitionOverride);
  const s = i ? () => Promise.all(jh(e, i, n)) : () => Promise.resolve(), a = e.variantChildren && e.variantChildren.size ? (c = 0) => {
    const { delayChildren: u = 0, staggerChildren: d, staggerDirection: h } = o;
    return i0(e, t, u + c, d, h, n);
  } : () => Promise.resolve(), { when: l } = o;
  if (l) {
    const [c, u] = l === "beforeChildren" ? [s, a] : [a, s];
    return c().then(() => u());
  } else
    return Promise.all([s(), a(n.delay)]);
}
function i0(e, t, n = 0, r = 0, i = 1, o) {
  const s = [], a = (e.variantChildren.size - 1) * r, l = i === 1 ? (c = 0) => c * r : (c = 0) => a - c * r;
  return Array.from(e.variantChildren).sort(o0).forEach((c, u) => {
    c.notify("AnimationStart", t), s.push(Ws(c, t, {
      ...o,
      delay: n + l(u)
    }).then(() => c.notify("AnimationComplete", t)));
  }), Promise.all(s);
}
function o0(e, t) {
  return e.sortNodePosition(t);
}
function s0(e, t, n = {}) {
  e.notify("AnimationStart", t);
  let r;
  if (Array.isArray(t)) {
    const i = t.map((o) => Ws(e, o, n));
    r = Promise.all(i);
  } else if (typeof t == "string")
    r = Ws(e, t, n);
  else {
    const i = typeof t == "function" ? wo(e, t, n.custom) : t;
    r = Promise.all(jh(e, i, n));
  }
  return r.then(() => {
    e.notify("AnimationComplete", t);
  });
}
const a0 = Va.length;
function Uh(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const n = e.parent ? Uh(e.parent) || {} : {};
    return e.props.initial !== void 0 && (n.initial = e.props.initial), n;
  }
  const t = {};
  for (let n = 0; n < a0; n++) {
    const r = Va[n], i = e.props[r];
    (jr(i) || i === !1) && (t[r] = i);
  }
  return t;
}
const l0 = [...Fa].reverse(), c0 = Fa.length;
function u0(e) {
  return (t) => Promise.all(t.map(({ animation: n, options: r }) => s0(e, n, r)));
}
function d0(e) {
  let t = u0(e), n = qc(), r = !0;
  const i = (l) => (c, u) => {
    var d;
    const h = wo(e, u, l === "exit" ? (d = e.presenceContext) === null || d === void 0 ? void 0 : d.custom : void 0);
    if (h) {
      const { transition: f, transitionEnd: g, ...m } = h;
      c = { ...c, ...m, ...g };
    }
    return c;
  };
  function o(l) {
    t = l(e);
  }
  function s(l) {
    const { props: c } = e, u = Uh(e.parent) || {}, d = [], h = /* @__PURE__ */ new Set();
    let f = {}, g = 1 / 0;
    for (let b = 0; b < c0; b++) {
      const v = l0[b], x = n[v], w = c[v] !== void 0 ? c[v] : u[v], T = jr(w), E = v === l ? x.isActive : null;
      E === !1 && (g = b);
      let k = w === u[v] && w !== c[v] && T;
      if (k && r && e.manuallyAnimateOnMount && (k = !1), x.protectedKeys = { ...f }, // If it isn't active and hasn't *just* been set as inactive
      !x.isActive && E === null || // If we didn't and don't have any defined prop for this animation type
      !w && !x.prevProp || // Or if the prop doesn't define an animation
      bo(w) || typeof w == "boolean")
        continue;
      const A = f0(x.prevProp, w);
      let I = A || // If we're making this variant active, we want to always make it active
      v === l && x.isActive && !k && T || // If we removed a higher-priority variant (i is in reverse order)
      b > g && T, F = !1;
      const P = Array.isArray(w) ? w : [w];
      let N = P.reduce(i(v), {});
      E === !1 && (N = {});
      const { prevResolvedValues: R = {} } = x, B = {
        ...R,
        ...N
      }, $ = (D) => {
        I = !0, h.has(D) && (F = !0, h.delete(D)), x.needsAnimating[D] = !0;
        const _ = e.getValue(D);
        _ && (_.liveStyle = !1);
      };
      for (const D in B) {
        const _ = N[D], L = R[D];
        if (f.hasOwnProperty(D))
          continue;
        let S = !1;
        Ls(_) && Ls(L) ? S = !nh(_, L) : S = _ !== L, S ? _ != null ? $(D) : h.add(D) : _ !== void 0 && h.has(D) ? $(D) : x.protectedKeys[D] = !0;
      }
      x.prevProp = w, x.prevResolvedValues = N, x.isActive && (f = { ...f, ...N }), r && e.blockInitialAnimation && (I = !1), I && (!(k && A) || F) && d.push(...P.map((D) => ({
        animation: D,
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
    let m = !!d.length;
    return r && (c.initial === !1 || c.initial === c.animate) && !e.manuallyAnimateOnMount && (m = !1), r = !1, m ? t(d) : Promise.resolve();
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
      n = qc(), r = !0;
    }
  };
}
function f0(e, t) {
  return typeof t == "string" ? t !== e : Array.isArray(t) ? !nh(t, e) : !1;
}
function Tn(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function qc() {
  return {
    animate: Tn(!0),
    whileInView: Tn(),
    whileHover: Tn(),
    whileTap: Tn(),
    whileDrag: Tn(),
    whileFocus: Tn(),
    exit: Tn()
  };
}
class yn {
  constructor(t) {
    this.isMounted = !1, this.node = t;
  }
  update() {
  }
}
class h0 extends yn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(t) {
    super(t), t.animationState || (t.animationState = d0(t));
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
let p0 = 0;
class m0 extends yn {
  constructor() {
    super(...arguments), this.id = p0++;
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
const g0 = {
  animation: {
    Feature: h0
  },
  exit: {
    Feature: m0
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
const y0 = (e) => (t) => Qa(t) && e(t, ri(t));
function _r(e, t, n, r) {
  return qr(e, t, y0(n), r);
}
const Kc = (e, t) => Math.abs(e - t);
function v0(e, t) {
  const n = Kc(e.x, t.x), r = Kc(e.y, t.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
class Hh {
  constructor(t, n, { transformPagePoint: r, contextWindow: i, dragSnapToOrigin: o = !1 } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const d = ns(this.lastMoveEventInfo, this.history), h = this.startEvent !== null, f = v0(d.offset, { x: 0, y: 0 }) >= 3;
      if (!h && !f)
        return;
      const { point: g } = d, { timestamp: m } = Ge;
      this.history.push({ ...g, timestamp: m });
      const { onStart: b, onMove: v } = this.handlers;
      h || (b && b(this.lastMoveEvent, d), this.startEvent = this.lastMoveEvent), v && v(this.lastMoveEvent, d);
    }, this.handlePointerMove = (d, h) => {
      this.lastMoveEvent = d, this.lastMoveEventInfo = ts(h, this.transformPagePoint), Ie.update(this.updatePoint, !0);
    }, this.handlePointerUp = (d, h) => {
      this.end();
      const { onEnd: f, onSessionEnd: g, resumeAnimation: m } = this.handlers;
      if (this.dragSnapToOrigin && m && m(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const b = ns(d.type === "pointercancel" ? this.lastMoveEventInfo : ts(h, this.transformPagePoint), this.history);
      this.startEvent && f && f(d, b), g && g(d, b);
    }, !Qa(t))
      return;
    this.dragSnapToOrigin = o, this.handlers = n, this.transformPagePoint = r, this.contextWindow = i || window;
    const s = ri(t), a = ts(s, this.transformPagePoint), { point: l } = a, { timestamp: c } = Ge;
    this.history = [{ ...l, timestamp: c }];
    const { onSessionStart: u } = n;
    u && u(t, ns(a, this.history)), this.removeListeners = ni(_r(this.contextWindow, "pointermove", this.handlePointerMove), _r(this.contextWindow, "pointerup", this.handlePointerUp), _r(this.contextWindow, "pointercancel", this.handlePointerUp));
  }
  updateHandlers(t) {
    this.handlers = t;
  }
  end() {
    this.removeListeners && this.removeListeners(), fn(this.updatePoint);
  }
}
function ts(e, t) {
  return t ? { point: t(e.point) } : e;
}
function Gc(e, t) {
  return { x: e.x - t.x, y: e.y - t.y };
}
function ns({ point: e }, t) {
  return {
    point: e,
    delta: Gc(e, Wh(t)),
    offset: Gc(e, b0(t)),
    velocity: x0(t, 0.1)
  };
}
function b0(e) {
  return e[0];
}
function Wh(e) {
  return e[e.length - 1];
}
function x0(e, t) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let n = e.length - 1, r = null;
  const i = Wh(e);
  for (; n >= 0 && (r = e[n], !(i.timestamp - r.timestamp > /* @__PURE__ */ Bt(t))); )
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
const qh = 1e-4, w0 = 1 - qh, S0 = 1 + qh, Kh = 0.01, k0 = 0 - Kh, C0 = 0 + Kh;
function xt(e) {
  return e.max - e.min;
}
function T0(e, t, n) {
  return Math.abs(e - t) <= n;
}
function Yc(e, t, n, r = 0.5) {
  e.origin = r, e.originPoint = _e(t.min, t.max, e.origin), e.scale = xt(n) / xt(t), e.translate = _e(n.min, n.max, e.origin) - e.originPoint, (e.scale >= w0 && e.scale <= S0 || isNaN(e.scale)) && (e.scale = 1), (e.translate >= k0 && e.translate <= C0 || isNaN(e.translate)) && (e.translate = 0);
}
function Fr(e, t, n, r) {
  Yc(e.x, t.x, n.x, r ? r.originX : void 0), Yc(e.y, t.y, n.y, r ? r.originY : void 0);
}
function Xc(e, t, n) {
  e.min = n.min + t.min, e.max = e.min + xt(t);
}
function E0(e, t, n) {
  Xc(e.x, t.x, n.x), Xc(e.y, t.y, n.y);
}
function Zc(e, t, n) {
  e.min = t.min - n.min, e.max = e.min + xt(t);
}
function Vr(e, t, n) {
  Zc(e.x, t.x, n.x), Zc(e.y, t.y, n.y);
}
function P0(e, { min: t, max: n }, r) {
  return t !== void 0 && e < t ? e = r ? _e(t, e, r.min) : Math.max(e, t) : n !== void 0 && e > n && (e = r ? _e(n, e, r.max) : Math.min(e, n)), e;
}
function Jc(e, t, n) {
  return {
    min: t !== void 0 ? e.min + t : void 0,
    max: n !== void 0 ? e.max + n - (e.max - e.min) : void 0
  };
}
function A0(e, { top: t, left: n, bottom: r, right: i }) {
  return {
    x: Jc(e.x, n, i),
    y: Jc(e.y, t, r)
  };
}
function Qc(e, t) {
  let n = t.min - e.min, r = t.max - e.max;
  return t.max - t.min < e.max - e.min && ([n, r] = [r, n]), { min: n, max: r };
}
function R0(e, t) {
  return {
    x: Qc(e.x, t.x),
    y: Qc(e.y, t.y)
  };
}
function N0(e, t) {
  let n = 0.5;
  const r = xt(e), i = xt(t);
  return i > r ? n = /* @__PURE__ */ or(t.min, t.max - r, e.min) : r > i && (n = /* @__PURE__ */ or(e.min, e.max - i, t.min)), Zt(0, 1, n);
}
function I0(e, t) {
  const n = {};
  return t.min !== void 0 && (n.min = t.min - e.min), t.max !== void 0 && (n.max = t.max - e.min), n;
}
const qs = 0.35;
function D0(e = qs) {
  return e === !1 ? e = 0 : e === !0 && (e = qs), {
    x: eu(e, "left", "right"),
    y: eu(e, "top", "bottom")
  };
}
function eu(e, t, n) {
  return {
    min: tu(e, t),
    max: tu(e, n)
  };
}
function tu(e, t) {
  return typeof e == "number" ? e : e[t] || 0;
}
const nu = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), Jn = () => ({
  x: nu(),
  y: nu()
}), ru = () => ({ min: 0, max: 0 }), je = () => ({
  x: ru(),
  y: ru()
});
function Ct(e) {
  return [e("x"), e("y")];
}
function Gh({ top: e, left: t, right: n, bottom: r }) {
  return {
    x: { min: t, max: n },
    y: { min: e, max: r }
  };
}
function M0({ x: e, y: t }) {
  return { top: t.min, right: e.max, bottom: t.max, left: e.min };
}
function O0(e, t) {
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
function Ks({ scale: e, scaleX: t, scaleY: n }) {
  return !rs(e) || !rs(t) || !rs(n);
}
function Pn(e) {
  return Ks(e) || Yh(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function Yh(e) {
  return iu(e.x) || iu(e.y);
}
function iu(e) {
  return e && e !== "0%";
}
function qi(e, t, n) {
  const r = e - n, i = t * r;
  return n + i;
}
function ou(e, t, n, r, i) {
  return i !== void 0 && (e = qi(e, i, r)), qi(e, n, r) + t;
}
function Gs(e, t = 0, n = 1, r, i) {
  e.min = ou(e.min, t, n, r, i), e.max = ou(e.max, t, n, r, i);
}
function Xh(e, { x: t, y: n }) {
  Gs(e.x, t.translate, t.scale, t.originPoint), Gs(e.y, n.translate, n.scale, n.originPoint);
}
const su = 0.999999999999, au = 1.0000000000001;
function L0(e, t, n, r = !1) {
  const i = n.length;
  if (!i)
    return;
  t.x = t.y = 1;
  let o, s;
  for (let a = 0; a < i; a++) {
    o = n[a], s = o.projectionDelta;
    const { visualElement: l } = o.options;
    l && l.props.style && l.props.style.display === "contents" || (r && o.options.layoutScroll && o.scroll && o !== o.root && er(e, {
      x: -o.scroll.offset.x,
      y: -o.scroll.offset.y
    }), s && (t.x *= s.x.scale, t.y *= s.y.scale, Xh(e, s)), r && Pn(o.latestValues) && er(e, o.latestValues));
  }
  t.x < au && t.x > su && (t.x = 1), t.y < au && t.y > su && (t.y = 1);
}
function Qn(e, t) {
  e.min = e.min + t, e.max = e.max + t;
}
function lu(e, t, n, r, i = 0.5) {
  const o = _e(e.min, e.max, i);
  Gs(e, t, n, o, r);
}
function er(e, t) {
  lu(e.x, t.x, t.scaleX, t.scale, t.originX), lu(e.y, t.y, t.scaleY, t.scale, t.originY);
}
function Zh(e, t) {
  return Gh(O0(e.getBoundingClientRect(), t));
}
function _0(e, t, n) {
  const r = Zh(e, n), { scroll: i } = t;
  return i && (Qn(r.x, i.offset.x), Qn(r.y, i.offset.y)), r;
}
const Jh = ({ current: e }) => e ? e.ownerDocument.defaultView : null, F0 = /* @__PURE__ */ new WeakMap();
class V0 {
  constructor(t) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = je(), this.visualElement = t;
  }
  start(t, { snapToCursor: n = !1 } = {}) {
    const { presenceContext: r } = this.visualElement;
    if (r && r.isPresent === !1)
      return;
    const i = (u) => {
      const { dragSnapToOrigin: d } = this.getProps();
      d ? this.pauseAnimation() : this.stopAnimation(), n && this.snapToCursor(ri(u).point);
    }, o = (u, d) => {
      const { drag: h, dragPropagation: f, onDragStart: g } = this.getProps();
      if (h && !f && (this.openDragLock && this.openDragLock(), this.openDragLock = Nx(h), !this.openDragLock))
        return;
      this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Ct((b) => {
        let v = this.getAxisMotionValue(b).get() || 0;
        if (zt.test(v)) {
          const { projection: x } = this.visualElement;
          if (x && x.layout) {
            const w = x.layout.layoutBox[b];
            w && (v = xt(w) * (parseFloat(v) / 100));
          }
        }
        this.originPoint[b] = v;
      }), g && Ie.postRender(() => g(u, d)), Vs(this.visualElement, "transform");
      const { animationState: m } = this.visualElement;
      m && m.setActive("whileDrag", !0);
    }, s = (u, d) => {
      const { dragPropagation: h, dragDirectionLock: f, onDirectionLock: g, onDrag: m } = this.getProps();
      if (!h && !this.openDragLock)
        return;
      const { offset: b } = d;
      if (f && this.currentDirection === null) {
        this.currentDirection = B0(b), this.currentDirection !== null && g && g(this.currentDirection);
        return;
      }
      this.updateAxis("x", d.point, b), this.updateAxis("y", d.point, b), this.visualElement.render(), m && m(u, d);
    }, a = (u, d) => this.stop(u, d), l = () => Ct((u) => {
      var d;
      return this.getAnimationState(u) === "paused" && ((d = this.getAxisMotionValue(u).animation) === null || d === void 0 ? void 0 : d.play());
    }), { dragSnapToOrigin: c } = this.getProps();
    this.panSession = new Hh(t, {
      onSessionStart: i,
      onStart: o,
      onMove: s,
      onSessionEnd: a,
      resumeAnimation: l
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: c,
      contextWindow: Jh(this.visualElement)
    });
  }
  stop(t, n) {
    const r = this.isDragging;
    if (this.cancel(), !r)
      return;
    const { velocity: i } = n;
    this.startAnimation(i);
    const { onDragEnd: o } = this.getProps();
    o && Ie.postRender(() => o(t, n));
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
    this.constraints && this.constraints[t] && (s = P0(s, this.constraints[t], this.elastic[t])), o.set(s);
  }
  resolveConstraints() {
    var t;
    const { dragConstraints: n, dragElastic: r } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (t = this.visualElement.projection) === null || t === void 0 ? void 0 : t.layout, o = this.constraints;
    n && Xn(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = A0(i.layoutBox, n) : this.constraints = !1, this.elastic = D0(r), o !== this.constraints && i && this.constraints && !this.hasMutatedConstraints && Ct((s) => {
      this.constraints !== !1 && this.getAxisMotionValue(s) && (this.constraints[s] = I0(i.layoutBox[s], this.constraints[s]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: t, onMeasureDragConstraints: n } = this.getProps();
    if (!t || !Xn(t))
      return !1;
    const r = t.current;
    dn(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.");
    const { projection: i } = this.visualElement;
    if (!i || !i.layout)
      return !1;
    const o = _0(r, i.root, this.visualElement.getTransformPagePoint());
    let s = R0(i.layout.layoutBox, o);
    if (n) {
      const a = n(M0(s));
      this.hasMutatedConstraints = !!a, a && (s = Gh(a));
    }
    return s;
  }
  startAnimation(t) {
    const { drag: n, dragMomentum: r, dragElastic: i, dragTransition: o, dragSnapToOrigin: s, onDragTransitionEnd: a } = this.getProps(), l = this.constraints || {}, c = Ct((u) => {
      if (!mi(u, n, this.currentDirection))
        return;
      let d = l && l[u] || {};
      s && (d = { min: 0, max: 0 });
      const h = i ? 200 : 1e6, f = i ? 40 : 1e7, g = {
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
      return this.startAxisValueAnimation(u, g);
    });
    return Promise.all(c).then(a);
  }
  startAxisValueAnimation(t, n) {
    const r = this.getAxisMotionValue(t);
    return Vs(this.visualElement, t), r.start(dl(t, r, 0, n, this.visualElement, !1));
  }
  stopAnimation() {
    Ct((t) => this.getAxisMotionValue(t).stop());
  }
  pauseAnimation() {
    Ct((t) => {
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
    Ct((n) => {
      const { drag: r } = this.getProps();
      if (!mi(n, r, this.currentDirection))
        return;
      const { projection: i } = this.visualElement, o = this.getAxisMotionValue(n);
      if (i && i.layout) {
        const { min: s, max: a } = i.layout.layoutBox[n];
        o.set(t[n] - _e(s, a, 0.5));
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
    if (!Xn(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const i = { x: 0, y: 0 };
    Ct((s) => {
      const a = this.getAxisMotionValue(s);
      if (a && this.constraints !== !1) {
        const l = a.get();
        i[s] = N0({ min: l, max: l }, this.constraints[s]);
      }
    });
    const { transformTemplate: o } = this.visualElement.getProps();
    this.visualElement.current.style.transform = o ? o({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.resolveConstraints(), Ct((s) => {
      if (!mi(s, t, null))
        return;
      const a = this.getAxisMotionValue(s), { min: l, max: c } = this.constraints[s];
      a.set(_e(l, c, i[s]));
    });
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    F0.set(this.visualElement, this);
    const t = this.visualElement.current, n = _r(t, "pointerdown", (l) => {
      const { drag: c, dragListener: u = !0 } = this.getProps();
      c && u && this.start(l);
    }), r = () => {
      const { dragConstraints: l } = this.getProps();
      Xn(l) && l.current && (this.constraints = this.resolveRefConstraints());
    }, { projection: i } = this.visualElement, o = i.addEventListener("measure", r);
    i && !i.layout && (i.root && i.root.updateScroll(), i.updateLayout()), Ie.read(r);
    const s = qr(window, "resize", () => this.scalePositionWithinConstraints()), a = i.addEventListener("didUpdate", ({ delta: l, hasLayoutChanged: c }) => {
      this.isDragging && c && (Ct((u) => {
        const d = this.getAxisMotionValue(u);
        d && (this.originPoint[u] += l[u].translate, d.set(d.get() + l[u].translate));
      }), this.visualElement.render());
    });
    return () => {
      s(), n(), o(), a && a();
    };
  }
  getProps() {
    const t = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: i = !1, dragConstraints: o = !1, dragElastic: s = qs, dragMomentum: a = !0 } = t;
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
function B0(e, t = 10) {
  let n = null;
  return Math.abs(e.y) > t ? n = "y" : Math.abs(e.x) > t && (n = "x"), n;
}
class z0 extends yn {
  constructor(t) {
    super(t), this.removeGroupControls = ft, this.removeListeners = ft, this.controls = new V0(t);
  }
  mount() {
    const { dragControls: t } = this.node.getProps();
    t && (this.removeGroupControls = t.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || ft;
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners();
  }
}
const cu = (e) => (t, n) => {
  e && Ie.postRender(() => e(t, n));
};
class $0 extends yn {
  constructor() {
    super(...arguments), this.removePointerDownListener = ft;
  }
  onPointerDown(t) {
    this.session = new Hh(t, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Jh(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: t, onPanStart: n, onPan: r, onPanEnd: i } = this.node.getProps();
    return {
      onSessionStart: cu(t),
      onStart: cu(n),
      onMove: r,
      onEnd: (o, s) => {
        delete this.session, i && Ie.postRender(() => i(o, s));
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
function uu(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
const Ar = {
  correct: (e, t) => {
    if (!t.target)
      return e;
    if (typeof e == "string")
      if (Q.test(e))
        e = parseFloat(e);
      else
        return e;
    const n = uu(e, t.target.x), r = uu(e, t.target.y);
    return `${n}% ${r}%`;
  }
}, j0 = {
  correct: (e, { treeScale: t, projectionDelta: n }) => {
    const r = e, i = hn.parse(e);
    if (i.length > 5)
      return r;
    const o = hn.createTransformer(e), s = typeof i[0] != "number" ? 1 : 0, a = n.x.scale * t.x, l = n.y.scale * t.y;
    i[0 + s] /= a, i[1 + s] /= l;
    const c = _e(a, l, 0.5);
    return typeof i[2 + s] == "number" && (i[2 + s] /= c), typeof i[3 + s] == "number" && (i[3 + s] /= c), o(i);
  }
};
class U0 extends rv {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: r, layoutId: i } = this.props, { projection: o } = t;
    cx(H0), o && (n.group && n.group.add(o), r && r.register && i && r.register(o), o.root.didUpdate(), o.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), o.setOptions({
      ...o.options,
      onExitComplete: () => this.safeToRemove()
    })), Ni.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(t) {
    const { layoutDependency: n, visualElement: r, drag: i, isPresent: o } = this.props, s = r.projection;
    return s && (s.isPresent = o, i || t.layoutDependency !== n || n === void 0 ? s.willUpdate() : this.safeToRemove(), t.isPresent !== o && (o ? s.promote() : s.relegate() || Ie.postRender(() => {
      const a = s.getStack();
      (!a || !a.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { projection: t } = this.props.visualElement;
    t && (t.root.didUpdate(), za.postRender(() => {
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
function Qh(e) {
  const [t, n] = _f(), r = tt(Da);
  return p(U0, { ...e, layoutGroup: r, switchLayoutGroup: tt(Uf), isPresent: t, safeToRemove: n });
}
const H0 = {
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
  boxShadow: j0
};
function W0(e, t, n) {
  const r = nt(e) ? e : Hr(e);
  return r.start(dl("", r, t, n)), r.animation;
}
function q0(e) {
  return e instanceof SVGElement && e.tagName !== "svg";
}
const K0 = (e, t) => e.depth - t.depth;
class G0 {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(t) {
    el(this.children, t), this.isDirty = !0;
  }
  remove(t) {
    tl(this.children, t), this.isDirty = !0;
  }
  forEach(t) {
    this.isDirty && this.children.sort(K0), this.isDirty = !1, this.children.forEach(t);
  }
}
function Y0(e, t) {
  const n = $t.now(), r = ({ timestamp: i }) => {
    const o = i - n;
    o >= t && (fn(r), e(o - t));
  };
  return Ie.read(r, !0), () => fn(r);
}
const ep = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"], X0 = ep.length, du = (e) => typeof e == "string" ? parseFloat(e) : e, fu = (e) => typeof e == "number" || Q.test(e);
function Z0(e, t, n, r, i, o) {
  i ? (e.opacity = _e(
    0,
    // TODO Reinstate this if only child
    n.opacity !== void 0 ? n.opacity : 1,
    J0(r)
  ), e.opacityExit = _e(t.opacity !== void 0 ? t.opacity : 1, 0, Q0(r))) : o && (e.opacity = _e(t.opacity !== void 0 ? t.opacity : 1, n.opacity !== void 0 ? n.opacity : 1, r));
  for (let s = 0; s < X0; s++) {
    const a = `border${ep[s]}Radius`;
    let l = hu(t, a), c = hu(n, a);
    if (l === void 0 && c === void 0)
      continue;
    l || (l = 0), c || (c = 0), l === 0 || c === 0 || fu(l) === fu(c) ? (e[a] = Math.max(_e(du(l), du(c), r), 0), (zt.test(c) || zt.test(l)) && (e[a] += "%")) : e[a] = c;
  }
  (t.rotate || n.rotate) && (e.rotate = _e(t.rotate || 0, n.rotate || 0, r));
}
function hu(e, t) {
  return e[t] !== void 0 ? e[t] : e.borderRadius;
}
const J0 = /* @__PURE__ */ tp(0, 0.5, bh), Q0 = /* @__PURE__ */ tp(0.5, 0.95, ft);
function tp(e, t, n) {
  return (r) => r < e ? 0 : r > t ? 1 : n(/* @__PURE__ */ or(e, t, r));
}
function pu(e, t) {
  e.min = t.min, e.max = t.max;
}
function kt(e, t) {
  pu(e.x, t.x), pu(e.y, t.y);
}
function mu(e, t) {
  e.translate = t.translate, e.scale = t.scale, e.originPoint = t.originPoint, e.origin = t.origin;
}
function gu(e, t, n, r, i) {
  return e -= t, e = qi(e, 1 / n, r), i !== void 0 && (e = qi(e, 1 / i, r)), e;
}
function e1(e, t = 0, n = 1, r = 0.5, i, o = e, s = e) {
  if (zt.test(t) && (t = parseFloat(t), t = _e(s.min, s.max, t / 100) - s.min), typeof t != "number")
    return;
  let a = _e(o.min, o.max, r);
  e === o && (a -= t), e.min = gu(e.min, t, n, a, i), e.max = gu(e.max, t, n, a, i);
}
function yu(e, t, [n, r, i], o, s) {
  e1(e, t[n], t[r], t[i], t.scale, o, s);
}
const t1 = ["x", "scaleX", "originX"], n1 = ["y", "scaleY", "originY"];
function vu(e, t, n, r) {
  yu(e.x, t, t1, n ? n.x : void 0, r ? r.x : void 0), yu(e.y, t, n1, n ? n.y : void 0, r ? r.y : void 0);
}
function bu(e) {
  return e.translate === 0 && e.scale === 1;
}
function np(e) {
  return bu(e.x) && bu(e.y);
}
function xu(e, t) {
  return e.min === t.min && e.max === t.max;
}
function r1(e, t) {
  return xu(e.x, t.x) && xu(e.y, t.y);
}
function wu(e, t) {
  return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max);
}
function rp(e, t) {
  return wu(e.x, t.x) && wu(e.y, t.y);
}
function Su(e) {
  return xt(e.x) / xt(e.y);
}
function ku(e, t) {
  return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint;
}
class i1 {
  constructor() {
    this.members = [];
  }
  add(t) {
    el(this.members, t), t.scheduleRender();
  }
  remove(t) {
    if (tl(this.members, t), t === this.prevLead && (this.prevLead = void 0), t === this.lead) {
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
function o1(e, t, n) {
  let r = "";
  const i = e.x.translate / t.x, o = e.y.translate / t.y, s = (n == null ? void 0 : n.z) || 0;
  if ((i || o || s) && (r = `translate3d(${i}px, ${o}px, ${s}px) `), (t.x !== 1 || t.y !== 1) && (r += `scale(${1 / t.x}, ${1 / t.y}) `), n) {
    const { transformPerspective: c, rotate: u, rotateX: d, rotateY: h, skewX: f, skewY: g } = n;
    c && (r = `perspective(${c}px) ${r}`), u && (r += `rotate(${u}deg) `), d && (r += `rotateX(${d}deg) `), h && (r += `rotateY(${h}deg) `), f && (r += `skewX(${f}deg) `), g && (r += `skewY(${g}deg) `);
  }
  const a = e.x.scale * t.x, l = e.y.scale * t.y;
  return (a !== 1 || l !== 1) && (r += `scale(${a}, ${l})`), r || "none";
}
const An = {
  type: "projectionFrame",
  totalNodes: 0,
  resolvedTargetDeltas: 0,
  recalculatedProjection: 0
}, Mr = typeof window < "u" && window.MotionDebug !== void 0, is = ["", "X", "Y", "Z"], s1 = { visibility: "hidden" }, Cu = 1e3;
let a1 = 0;
function os(e, t, n, r) {
  const { latestValues: i } = t;
  i[e] && (n[e] = i[e], t.setStaticValue(e, 0), r && (r[e] = 0));
}
function ip(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: t } = e.options;
  if (!t)
    return;
  const n = fh(t);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: i, layoutId: o } = e.options;
    window.MotionCancelOptimisedAnimation(n, "transform", Ie, !(i || o));
  }
  const { parent: r } = e;
  r && !r.hasCheckedOptimisedAppear && ip(r);
}
function op({ attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: r, resetTransform: i }) {
  return class {
    constructor(s = {}, a = t == null ? void 0 : t()) {
      this.id = a1++, this.animationId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, Mr && (An.totalNodes = An.resolvedTargetDeltas = An.recalculatedProjection = 0), this.nodes.forEach(u1), this.nodes.forEach(m1), this.nodes.forEach(g1), this.nodes.forEach(d1), Mr && window.MotionDebug.record(An);
      }, this.resolvedRelativeTargetAt = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = s, this.root = a ? a.root || a : this, this.path = a ? [...a.path, a] : [], this.parent = a, this.depth = a ? a.depth + 1 : 0;
      for (let l = 0; l < this.path.length; l++)
        this.path[l].shouldResetTransform = !0;
      this.root === this && (this.nodes = new G0());
    }
    addEventListener(s, a) {
      return this.eventHandlers.has(s) || this.eventHandlers.set(s, new nl()), this.eventHandlers.get(s).add(a);
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
      this.isSVG = q0(s), this.instance = s;
      const { layoutId: l, layout: c, visualElement: u } = this.options;
      if (u && !u.current && u.mount(s), this.root.nodes.add(this), this.parent && this.parent.children.add(this), a && (c || l) && (this.isLayoutDirty = !0), e) {
        let d;
        const h = () => this.root.updateBlockedByResize = !1;
        e(s, () => {
          this.root.updateBlockedByResize = !0, d && d(), d = Y0(h, 250), Ni.hasAnimatedSinceResize && (Ni.hasAnimatedSinceResize = !1, this.nodes.forEach(Eu));
        });
      }
      l && this.root.registerSharedNode(l, this), this.options.animate !== !1 && u && (l || c) && this.addEventListener("didUpdate", ({ delta: d, hasLayoutChanged: h, hasRelativeTargetChanged: f, layout: g }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const m = this.options.transition || u.getDefaultTransition() || w1, { onLayoutAnimationStart: b, onLayoutAnimationComplete: v } = u.getProps(), x = !this.targetLayout || !rp(this.targetLayout, g) || f, w = !h && f;
        if (this.options.layoutRoot || this.resumeFrom && this.resumeFrom.instance || w || h && (x || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0), this.setAnimationOrigin(d, w);
          const T = {
            ...Xa(m, "layout"),
            onPlay: b,
            onComplete: v
          };
          (u.shouldReduceMotion || this.options.layoutRoot) && (T.delay = 0, T.type = !1), this.startAnimation(T);
        } else
          h || Eu(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = g;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const s = this.getStack();
      s && s.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, fn(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(y1), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && ip(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
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
        this.unblockUpdate(), this.clearAllSnapshots(), this.nodes.forEach(Tu);
        return;
      }
      this.isUpdating || this.nodes.forEach(h1), this.isUpdating = !1, this.nodes.forEach(p1), this.nodes.forEach(l1), this.nodes.forEach(c1), this.clearAllSnapshots();
      const a = $t.now();
      Ge.delta = Zt(0, 1e3 / 60, a - Ge.timestamp), Ge.timestamp = a, Ge.isProcessing = !0, Yo.update.process(Ge), Yo.preRender.process(Ge), Yo.render.process(Ge), Ge.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, za.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(f1), this.sharedNodes.forEach(v1);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, Ie.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      Ie.postRender(() => {
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
      this.layout = this.measure(!1), this.layoutCorrected = je(), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
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
      const s = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, a = this.projectionDelta && !np(this.projectionDelta), l = this.getTransformTemplate(), c = l ? l(this.latestValues, "") : void 0, u = c !== this.prevTransformTemplateValue;
      s && (a || Pn(this.latestValues) || u) && (i(this.instance, c), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(s = !0) {
      const a = this.measurePageBox();
      let l = this.removeElementScroll(a);
      return s && (l = this.removeTransform(l)), S1(l), {
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
        return je();
      const l = a.measureViewportBox();
      if (!(((s = this.scroll) === null || s === void 0 ? void 0 : s.wasRoot) || this.path.some(k1))) {
        const { scroll: u } = this.root;
        u && (Qn(l.x, u.offset.x), Qn(l.y, u.offset.y));
      }
      return l;
    }
    removeElementScroll(s) {
      var a;
      const l = je();
      if (kt(l, s), !((a = this.scroll) === null || a === void 0) && a.wasRoot)
        return l;
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c], { scroll: d, options: h } = u;
        u !== this.root && d && h.layoutScroll && (d.wasRoot && kt(l, s), Qn(l.x, d.offset.x), Qn(l.y, d.offset.y));
      }
      return l;
    }
    applyTransform(s, a = !1) {
      const l = je();
      kt(l, s);
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c];
        !a && u.options.layoutScroll && u.scroll && u !== u.root && er(l, {
          x: -u.scroll.offset.x,
          y: -u.scroll.offset.y
        }), Pn(u.latestValues) && er(l, u.latestValues);
      }
      return Pn(this.latestValues) && er(l, this.latestValues), l;
    }
    removeTransform(s) {
      const a = je();
      kt(a, s);
      for (let l = 0; l < this.path.length; l++) {
        const c = this.path[l];
        if (!c.instance || !Pn(c.latestValues))
          continue;
        Ks(c.latestValues) && c.updateSnapshot();
        const u = je(), d = c.measurePageBox();
        kt(u, d), vu(a, c.latestValues, c.snapshot ? c.snapshot.layoutBox : void 0, u);
      }
      return Pn(this.latestValues) && vu(a, this.latestValues), a;
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
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Ge.timestamp && this.relativeParent.resolveTargetDelta(!0);
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
        if (this.resolvedRelativeTargetAt = Ge.timestamp, !this.targetDelta && !this.relativeTarget) {
          const f = this.getClosestProjectingParent();
          f && f.layout && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = je(), this.relativeTargetOrigin = je(), Vr(this.relativeTargetOrigin, this.layout.layoutBox, f.layout.layoutBox), kt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
        }
        if (!(!this.relativeTarget && !this.targetDelta)) {
          if (this.target || (this.target = je(), this.targetWithTransforms = je()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), E0(this.target, this.relativeTarget, this.relativeParent.target)) : this.targetDelta ? (this.resumingFrom ? this.target = this.applyTransform(this.layout.layoutBox) : kt(this.target, this.layout.layoutBox), Xh(this.target, this.targetDelta)) : kt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget) {
            this.attemptToResolveRelativeTarget = !1;
            const f = this.getClosestProjectingParent();
            f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = je(), this.relativeTargetOrigin = je(), Vr(this.relativeTargetOrigin, this.target, f.target), kt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
          }
          Mr && An.resolvedTargetDeltas++;
        }
      }
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Ks(this.parent.latestValues) || Yh(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    calcProjection() {
      var s;
      const a = this.getLead(), l = !!this.resumingFrom || this !== a;
      let c = !0;
      if ((this.isProjectionDirty || !((s = this.parent) === null || s === void 0) && s.isProjectionDirty) && (c = !1), l && (this.isSharedProjectionDirty || this.isTransformDirty) && (c = !1), this.resolvedRelativeTargetAt === Ge.timestamp && (c = !1), c)
        return;
      const { layout: u, layoutId: d } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(u || d))
        return;
      kt(this.layoutCorrected, this.layout.layoutBox);
      const h = this.treeScale.x, f = this.treeScale.y;
      L0(this.layoutCorrected, this.treeScale, this.path, l), a.layout && !a.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (a.target = a.layout.layoutBox, a.targetWithTransforms = je());
      const { target: g } = a;
      if (!g) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (mu(this.prevProjectionDelta.x, this.projectionDelta.x), mu(this.prevProjectionDelta.y, this.projectionDelta.y)), Fr(this.projectionDelta, this.layoutCorrected, g, this.latestValues), (this.treeScale.x !== h || this.treeScale.y !== f || !ku(this.projectionDelta.x, this.prevProjectionDelta.x) || !ku(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", g)), Mr && An.recalculatedProjection++;
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
      this.prevProjectionDelta = Jn(), this.projectionDelta = Jn(), this.projectionDeltaWithTransform = Jn();
    }
    setAnimationOrigin(s, a = !1) {
      const l = this.snapshot, c = l ? l.latestValues : {}, u = { ...this.latestValues }, d = Jn();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !a;
      const h = je(), f = l ? l.source : void 0, g = this.layout ? this.layout.source : void 0, m = f !== g, b = this.getStack(), v = !b || b.members.length <= 1, x = !!(m && !v && this.options.crossfade === !0 && !this.path.some(x1));
      this.animationProgress = 0;
      let w;
      this.mixTargetDelta = (T) => {
        const E = T / 1e3;
        Pu(d.x, s.x, E), Pu(d.y, s.y, E), this.setTargetDelta(d), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (Vr(h, this.layout.layoutBox, this.relativeParent.layout.layoutBox), b1(this.relativeTarget, this.relativeTargetOrigin, h, E), w && r1(this.relativeTarget, w) && (this.isProjectionDirty = !1), w || (w = je()), kt(w, this.relativeTarget)), m && (this.animationValues = u, Z0(u, c, this.latestValues, E, x, v)), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = E;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(s) {
      this.notifyListeners("animationStart"), this.currentAnimation && this.currentAnimation.stop(), this.resumingFrom && this.resumingFrom.currentAnimation && this.resumingFrom.currentAnimation.stop(), this.pendingAnimation && (fn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Ie.update(() => {
        Ni.hasAnimatedSinceResize = !0, this.currentAnimation = W0(0, Cu, {
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(Cu), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const s = this.getLead();
      let { targetWithTransforms: a, target: l, layout: c, latestValues: u } = s;
      if (!(!a || !l || !c)) {
        if (this !== s && this.layout && c && sp(this.options.animationType, this.layout.layoutBox, c.layoutBox)) {
          l = this.target || je();
          const d = xt(this.layout.layoutBox.x);
          l.x.min = s.target.x.min, l.x.max = l.x.min + d;
          const h = xt(this.layout.layoutBox.y);
          l.y.min = s.target.y.min, l.y.max = l.y.min + h;
        }
        kt(a, l), er(a, u), Fr(this.projectionDeltaWithTransform, this.layoutCorrected, a, u);
      }
    }
    registerSharedNode(s, a) {
      this.sharedNodes.has(s) || this.sharedNodes.set(s, new i1()), this.sharedNodes.get(s).add(a);
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
        return s1;
      const c = {
        visibility: ""
      }, u = this.getTransformTemplate();
      if (this.needsReset)
        return this.needsReset = !1, c.opacity = "", c.pointerEvents = Ai(s == null ? void 0 : s.pointerEvents) || "", c.transform = u ? u(this.latestValues, "") : "none", c;
      const d = this.getLead();
      if (!this.projectionDelta || !this.layout || !d.target) {
        const m = {};
        return this.options.layoutId && (m.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, m.pointerEvents = Ai(s == null ? void 0 : s.pointerEvents) || ""), this.hasProjected && !Pn(this.latestValues) && (m.transform = u ? u({}, "") : "none", this.hasProjected = !1), m;
      }
      const h = d.animationValues || d.latestValues;
      this.applyTransformsToTarget(), c.transform = o1(this.projectionDeltaWithTransform, this.treeScale, h), u && (c.transform = u(h, c.transform));
      const { x: f, y: g } = this.projectionDelta;
      c.transformOrigin = `${f.origin * 100}% ${g.origin * 100}% 0`, d.animationValues ? c.opacity = d === this ? (l = (a = h.opacity) !== null && a !== void 0 ? a : this.latestValues.opacity) !== null && l !== void 0 ? l : 1 : this.preserveOpacity ? this.latestValues.opacity : h.opacityExit : c.opacity = d === this ? h.opacity !== void 0 ? h.opacity : "" : h.opacityExit !== void 0 ? h.opacityExit : 0;
      for (const m in $i) {
        if (h[m] === void 0)
          continue;
        const { correct: b, applyTo: v } = $i[m], x = c.transform === "none" ? h[m] : b(h[m], d);
        if (v) {
          const w = v.length;
          for (let T = 0; T < w; T++)
            c[v[T]] = x;
        } else
          c[m] = x;
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
      }), this.root.nodes.forEach(Tu), this.root.sharedNodes.clear();
    }
  };
}
function l1(e) {
  e.updateLayout();
}
function c1(e) {
  var t;
  const n = ((t = e.resumeFrom) === null || t === void 0 ? void 0 : t.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: i } = e.layout, { animationType: o } = e.options, s = n.source !== e.layout.source;
    o === "size" ? Ct((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = xt(h);
      h.min = r[d].min, h.max = h.min + f;
    }) : sp(o, n.layoutBox, r) && Ct((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = xt(r[d]);
      h.max = h.min + f, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[d].max = e.relativeTarget[d].min + f);
    });
    const a = Jn();
    Fr(a, r, n.layoutBox);
    const l = Jn();
    s ? Fr(l, e.applyTransform(i, !0), n.measuredBox) : Fr(l, r, n.layoutBox);
    const c = !np(a);
    let u = !1;
    if (!e.resumeFrom) {
      const d = e.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: h, layout: f } = d;
        if (h && f) {
          const g = je();
          Vr(g, n.layoutBox, h.layoutBox);
          const m = je();
          Vr(m, r, f.layoutBox), rp(g, m) || (u = !0), d.options.layoutRoot && (e.relativeTarget = m, e.relativeTargetOrigin = g, e.relativeParent = d);
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
function u1(e) {
  Mr && An.totalNodes++, e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function d1(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function f1(e) {
  e.clearSnapshot();
}
function Tu(e) {
  e.clearMeasurements();
}
function h1(e) {
  e.isLayoutDirty = !1;
}
function p1(e) {
  const { visualElement: t } = e.options;
  t && t.getProps().onBeforeLayoutMeasure && t.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function Eu(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function m1(e) {
  e.resolveTargetDelta();
}
function g1(e) {
  e.calcProjection();
}
function y1(e) {
  e.resetSkewAndRotation();
}
function v1(e) {
  e.removeLeadSnapshot();
}
function Pu(e, t, n) {
  e.translate = _e(t.translate, 0, n), e.scale = _e(t.scale, 1, n), e.origin = t.origin, e.originPoint = t.originPoint;
}
function Au(e, t, n, r) {
  e.min = _e(t.min, n.min, r), e.max = _e(t.max, n.max, r);
}
function b1(e, t, n, r) {
  Au(e.x, t.x, n.x, r), Au(e.y, t.y, n.y, r);
}
function x1(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const w1 = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, Ru = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), Nu = Ru("applewebkit/") && !Ru("chrome/") ? Math.round : ft;
function Iu(e) {
  e.min = Nu(e.min), e.max = Nu(e.max);
}
function S1(e) {
  Iu(e.x), Iu(e.y);
}
function sp(e, t, n) {
  return e === "position" || e === "preserve-aspect" && !T0(Su(t), Su(n), 0.2);
}
function k1(e) {
  var t;
  return e !== e.root && ((t = e.scroll) === null || t === void 0 ? void 0 : t.wasRoot);
}
const C1 = op({
  attachResizeListener: (e, t) => qr(e, "resize", t),
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body.scrollLeft,
    y: document.documentElement.scrollTop || document.body.scrollTop
  }),
  checkIsScrollRoot: () => !0
}), ss = {
  current: void 0
}, ap = op({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!ss.current) {
      const e = new C1({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), ss.current = e;
    }
    return ss.current;
  },
  resetTransform: (e, t) => {
    e.style.transform = t !== void 0 ? t : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), T1 = {
  pan: {
    Feature: $0
  },
  drag: {
    Feature: z0,
    ProjectionNode: ap,
    MeasureLayout: Qh
  }
};
function Du(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileHover && e.animationState.setActive("whileHover", n === "Start");
  const i = "onHover" + n, o = r[i];
  o && Ie.postRender(() => o(t, ri(t)));
}
class E1 extends yn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = Tx(t, (n) => (Du(this.node, n, "Start"), (r) => Du(this.node, r, "End"))));
  }
  unmount() {
  }
}
class P1 extends yn {
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
function Mu(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileTap && e.animationState.setActive("whileTap", n === "Start");
  const i = "onTap" + (n === "End" ? "" : n), o = r[i];
  o && Ie.postRender(() => o(t, ri(t)));
}
class A1 extends yn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = Rx(t, (n) => (Mu(this.node, n, "Start"), (r, { success: i }) => Mu(this.node, r, i ? "End" : "Cancel")), { useGlobalTarget: this.node.props.globalTapTarget }));
  }
  unmount() {
  }
}
const Ys = /* @__PURE__ */ new WeakMap(), as = /* @__PURE__ */ new WeakMap(), R1 = (e) => {
  const t = Ys.get(e.target);
  t && t(e);
}, N1 = (e) => {
  e.forEach(R1);
};
function I1({ root: e, ...t }) {
  const n = e || document;
  as.has(n) || as.set(n, {});
  const r = as.get(n), i = JSON.stringify(t);
  return r[i] || (r[i] = new IntersectionObserver(N1, { root: e, ...t })), r[i];
}
function D1(e, t, n) {
  const r = I1(t);
  return Ys.set(e, n), r.observe(e), () => {
    Ys.delete(e), r.unobserve(e);
  };
}
const M1 = {
  some: 0,
  all: 1
};
class O1 extends yn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    this.unmount();
    const { viewport: t = {} } = this.node.getProps(), { root: n, margin: r, amount: i = "some", once: o } = t, s = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof i == "number" ? i : M1[i]
    }, a = (l) => {
      const { isIntersecting: c } = l;
      if (this.isInView === c || (this.isInView = c, o && !c && this.hasEnteredView))
        return;
      c && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", c);
      const { onViewportEnter: u, onViewportLeave: d } = this.node.getProps(), h = c ? u : d;
      h && h(l);
    };
    return D1(this.node.current, s, a);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: t, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(L1(t, n)) && this.startObserver();
  }
  unmount() {
  }
}
function L1({ viewport: e = {} }, { viewport: t = {} } = {}) {
  return (n) => e[n] !== t[n];
}
const _1 = {
  inView: {
    Feature: O1
  },
  tap: {
    Feature: A1
  },
  focus: {
    Feature: P1
  },
  hover: {
    Feature: E1
  }
}, F1 = {
  layout: {
    ProjectionNode: ap,
    MeasureLayout: Qh
  }
}, Xs = { current: null }, lp = { current: !1 };
function V1() {
  if (lp.current = !0, !!La)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => Xs.current = e.matches;
      e.addListener(t), t();
    } else
      Xs.current = !1;
}
const B1 = [...Mh, et, hn], z1 = (e) => B1.find(Dh(e)), Ou = /* @__PURE__ */ new WeakMap();
function $1(e, t, n) {
  for (const r in t) {
    const i = t[r], o = n[r];
    if (nt(i))
      e.addValue(r, i), process.env.NODE_ENV === "development" && yo(i.version === "11.18.2", `Attempting to mix Motion versions ${i.version} with 11.18.2 may not work as expected.`);
    else if (nt(o))
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
const Lu = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
class j1 {
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
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = ll, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const f = $t.now();
      this.renderScheduledAt < f && (this.renderScheduledAt = f, Ie.render(this.render, !1, !0));
    };
    const { latestValues: l, renderState: c, onUpdate: u } = s;
    this.onUpdate = u, this.latestValues = l, this.baseTarget = { ...l }, this.initialValues = n.initial ? { ...l } : {}, this.renderState = c, this.parent = t, this.props = n, this.presenceContext = r, this.depth = t ? t.depth + 1 : 0, this.reducedMotionConfig = i, this.options = a, this.blockInitialAnimation = !!o, this.isControllingVariants = xo(n), this.isVariantNode = $f(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(t && t.current);
    const { willChange: d, ...h } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const f in h) {
      const g = h[f];
      l[f] !== void 0 && nt(g) && g.set(l[f], !1);
    }
  }
  mount(t) {
    this.current = t, Ou.set(t, this), this.projection && !this.projection.instance && this.projection.mount(t), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((n, r) => this.bindToMotionValue(r, n)), lp.current || V1(), this.shouldReduceMotion = this.reducedMotionConfig === "never" ? !1 : this.reducedMotionConfig === "always" ? !0 : Xs.current, process.env.NODE_ENV !== "production" && yo(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected."), this.parent && this.parent.children.add(this), this.update(this.props, this.presenceContext);
  }
  unmount() {
    Ou.delete(this.current), this.projection && this.projection.unmount(), fn(this.notifyUpdate), fn(this.render), this.valueSubscriptions.forEach((t) => t()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent && this.parent.children.delete(this);
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
    const r = jn.has(t), i = n.on("change", (a) => {
      this.latestValues[t] = a, this.props.onUpdate && Ie.preRender(this.notifyUpdate), r && this.projection && (this.projection.isTransformDirty = !0);
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
    for (t in sr) {
      const n = sr[t];
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
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : je();
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
    for (let r = 0; r < Lu.length; r++) {
      const i = Lu[r];
      this.propEventSubscriptions[i] && (this.propEventSubscriptions[i](), delete this.propEventSubscriptions[i]);
      const o = "on" + i, s = t[o];
      s && (this.propEventSubscriptions[i] = this.on(i, s));
    }
    this.prevMotionValues = $1(this, this.scrapeMotionValuesFromProps(t, this.prevProps, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue(), this.onUpdate && this.onUpdate(this);
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
    return i != null && (typeof i == "string" && (Nh(i) || wh(i)) ? i = parseFloat(i) : !z1(i) && hn.test(n) && (i = Ph(t, n)), this.setBaseTarget(t, nt(i) ? i.get() : i)), nt(i) ? i.get() : i;
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
      const s = ja(this.props, r, (n = this.presenceContext) === null || n === void 0 ? void 0 : n.custom);
      s && (i = s[t]);
    }
    if (r && i !== void 0)
      return i;
    const o = this.getBaseTargetFromProps(this.props, t);
    return o !== void 0 && !nt(o) ? o : this.initialValues[t] !== void 0 && i === void 0 ? void 0 : this.baseTarget[t];
  }
  on(t, n) {
    return this.events[t] || (this.events[t] = new nl()), this.events[t].add(n);
  }
  notify(t, ...n) {
    this.events[t] && this.events[t].notify(...n);
  }
}
class cp extends j1 {
  constructor() {
    super(...arguments), this.KeyframeResolver = Oh;
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
    nt(t) && (this.childSubscription = t.on("change", (n) => {
      this.current && (this.current.textContent = `${n}`);
    }));
  }
}
function U1(e) {
  return window.getComputedStyle(e);
}
class H1 extends cp {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = Xf;
  }
  readValueFromInstance(t, n) {
    if (jn.has(n)) {
      const r = al(n);
      return r && r.default || 0;
    } else {
      const r = U1(t), i = (Kf(n) ? r.getPropertyValue(n) : r[n]) || 0;
      return typeof i == "string" ? i.trim() : i;
    }
  }
  measureInstanceViewportBox(t, { transformPagePoint: n }) {
    return Zh(t, n);
  }
  build(t, n, r) {
    Wa(t, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return Ya(t, n, r);
  }
}
class W1 extends cp {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = je;
  }
  getBaseTargetFromProps(t, n) {
    return t[n];
  }
  readValueFromInstance(t, n) {
    if (jn.has(n)) {
      const r = al(n);
      return r && r.default || 0;
    }
    return n = Zf.has(n) ? n : Ba(n), t.getAttribute(n);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return eh(t, n, r);
  }
  build(t, n, r) {
    qa(t, n, this.isSVGTag, r.transformTemplate);
  }
  renderInstance(t, n, r, i) {
    Jf(t, n, r, i);
  }
  mount(t) {
    this.isSVGTag = Ga(t.tagName), super.mount(t);
  }
}
const q1 = (e, t) => $a(e) ? new W1(t) : new H1(t, {
  allowProjection: e !== yf
}), K1 = /* @__PURE__ */ vx({
  ...g0,
  ..._1,
  ...T1,
  ...F1
}, q1), Jt = /* @__PURE__ */ Mb(K1);
function ae(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(i) {
    if (e == null || e(i), n === !1 || !i.defaultPrevented)
      return t == null ? void 0 : t(i);
  };
}
function G1(e, t) {
  const n = y.createContext(t), r = (o) => {
    const { children: s, ...a } = o, l = y.useMemo(() => a, Object.values(a));
    return /* @__PURE__ */ p(n.Provider, { value: l, children: s });
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
      const { scope: h, children: f, ...g } = d, m = ((v = h == null ? void 0 : h[e]) == null ? void 0 : v[l]) || a, b = y.useMemo(() => g, Object.values(g));
      return /* @__PURE__ */ p(m.Provider, { value: b, children: f });
    };
    c.displayName = o + "Provider";
    function u(d, h) {
      var m;
      const f = ((m = h == null ? void 0 : h[e]) == null ? void 0 : m[l]) || a, g = y.useContext(f);
      if (g) return g;
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
  return i.scopeName = e, [r, Y1(i, ...t)];
}
function Y1(...e) {
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
var Ye = globalThis != null && globalThis.document ? y.useLayoutEffect : () => {
}, X1 = y[" useInsertionEffect ".trim().toString()] || Ye;
function pn({
  prop: e,
  defaultProp: t,
  onChange: n = () => {
  },
  caller: r
}) {
  const [i, o, s] = Z1({
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
        const h = J1(u) ? u(e) : u;
        h !== e && ((d = s.current) == null || d.call(s, h));
      } else
        o(u);
    },
    [a, e, o, s]
  );
  return [l, c];
}
function Z1({
  defaultProp: e,
  onChange: t
}) {
  const [n, r] = y.useState(e), i = y.useRef(n), o = y.useRef(t);
  return X1(() => {
    o.current = t;
  }, [t]), y.useEffect(() => {
    var s;
    i.current !== n && ((s = o.current) == null || s.call(o, n), i.current = n);
  }, [n, i]), [n, r, o];
}
function J1(e) {
  return typeof e == "function";
}
// @__NO_SIDE_EFFECTS__
function Q1(e) {
  const t = /* @__PURE__ */ eS(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(nS);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ p(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ p(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function eS(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = iS(i), a = rS(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? $n(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var tS = Symbol("radix.slottable");
function nS(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === tS;
}
function rS(e, t) {
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
function iS(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var oS = [
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
], pe = oS.reduce((e, t) => {
  const n = /* @__PURE__ */ Q1(`Primitive.${t}`), r = y.forwardRef((i, o) => {
    const { asChild: s, ...a } = i, l = s ? n : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ p(l, { ...a, ref: o });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {});
function sS(e, t) {
  e && ho.flushSync(() => e.dispatchEvent(t));
}
function aS(e, t) {
  return y.useReducer((n, r) => t[n][r] ?? n, e);
}
var nn = (e) => {
  const { present: t, children: n } = e, r = lS(t), i = typeof n == "function" ? n({ present: r.isPresent }) : y.Children.only(n), o = we(r.ref, cS(i));
  return typeof n == "function" || r.isPresent ? y.cloneElement(i, { ref: o }) : null;
};
nn.displayName = "Presence";
function lS(e) {
  const [t, n] = y.useState(), r = y.useRef(null), i = y.useRef(e), o = y.useRef("none"), s = e ? "mounted" : "unmounted", [a, l] = aS(s, {
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
  }, [a]), Ye(() => {
    const c = r.current, u = i.current;
    if (u !== e) {
      const h = o.current, f = gi(c);
      e ? l("MOUNT") : f === "none" || (c == null ? void 0 : c.display) === "none" ? l("UNMOUNT") : l(u && h !== f ? "ANIMATION_OUT" : "UNMOUNT"), i.current = e;
    }
  }, [e, l]), Ye(() => {
    if (t) {
      let c;
      const u = t.ownerDocument.defaultView ?? window, d = (f) => {
        const m = gi(r.current).includes(CSS.escape(f.animationName));
        if (f.target === t && m && (l("ANIMATION_END"), !i.current)) {
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
function cS(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var uS = y[" useId ".trim().toString()] || (() => {
}), dS = 0;
function Xt(e) {
  const [t, n] = y.useState(uS());
  return Ye(() => {
    n((r) => r ?? String(dS++));
  }, [e]), e || (t ? `radix-${t}` : "");
}
var ko = "Collapsible", [fS] = tn(ko), [hS, fl] = fS(ko), up = y.forwardRef(
  (e, t) => {
    const {
      __scopeCollapsible: n,
      open: r,
      defaultOpen: i,
      disabled: o,
      onOpenChange: s,
      ...a
    } = e, [l, c] = pn({
      prop: r,
      defaultProp: i ?? !1,
      onChange: s,
      caller: ko
    });
    return /* @__PURE__ */ p(
      hS,
      {
        scope: n,
        disabled: o,
        contentId: Xt(),
        open: l,
        onOpenToggle: y.useCallback(() => c((u) => !u), [c]),
        children: /* @__PURE__ */ p(
          pe.div,
          {
            "data-state": pl(l),
            "data-disabled": o ? "" : void 0,
            ...a,
            ref: t
          }
        )
      }
    );
  }
);
up.displayName = ko;
var dp = "CollapsibleTrigger", fp = y.forwardRef(
  (e, t) => {
    const { __scopeCollapsible: n, ...r } = e, i = fl(dp, n);
    return /* @__PURE__ */ p(
      pe.button,
      {
        type: "button",
        "aria-controls": i.contentId,
        "aria-expanded": i.open || !1,
        "data-state": pl(i.open),
        "data-disabled": i.disabled ? "" : void 0,
        disabled: i.disabled,
        ...r,
        ref: t,
        onClick: ae(e.onClick, i.onOpenToggle)
      }
    );
  }
);
fp.displayName = dp;
var hl = "CollapsibleContent", hp = y.forwardRef(
  (e, t) => {
    const { forceMount: n, ...r } = e, i = fl(hl, e.__scopeCollapsible);
    return /* @__PURE__ */ p(nn, { present: n || i.open, children: ({ present: o }) => /* @__PURE__ */ p(pS, { ...r, ref: t, present: o }) });
  }
);
hp.displayName = hl;
var pS = y.forwardRef((e, t) => {
  const { __scopeCollapsible: n, present: r, children: i, ...o } = e, s = fl(hl, n), [a, l] = y.useState(r), c = y.useRef(null), u = we(t, c), d = y.useRef(0), h = d.current, f = y.useRef(0), g = f.current, m = s.open || a, b = y.useRef(m), v = y.useRef(void 0);
  return y.useEffect(() => {
    const x = requestAnimationFrame(() => b.current = !1);
    return () => cancelAnimationFrame(x);
  }, []), Ye(() => {
    const x = c.current;
    if (x) {
      v.current = v.current || {
        transitionDuration: x.style.transitionDuration,
        animationName: x.style.animationName
      }, x.style.transitionDuration = "0s", x.style.animationName = "none";
      const w = x.getBoundingClientRect();
      d.current = w.height, f.current = w.width, b.current || (x.style.transitionDuration = v.current.transitionDuration, x.style.animationName = v.current.animationName), l(r);
    }
  }, [s.open, r]), /* @__PURE__ */ p(
    pe.div,
    {
      "data-state": pl(s.open),
      "data-disabled": s.disabled ? "" : void 0,
      id: s.contentId,
      hidden: !m,
      ...o,
      ref: u,
      style: {
        "--radix-collapsible-content-height": h ? `${h}px` : void 0,
        "--radix-collapsible-content-width": g ? `${g}px` : void 0,
        ...e.style
      },
      children: m && i
    }
  );
});
function pl(e) {
  return e ? "open" : "closed";
}
var mS = up;
function gS({
  ...e
}) {
  return /* @__PURE__ */ p(mS, { "data-slot": "collapsible", ...e });
}
function yS({
  ...e
}) {
  return /* @__PURE__ */ p(
    fp,
    {
      "data-slot": "collapsible-trigger",
      ...e
    }
  );
}
function vS({
  ...e
}) {
  return /* @__PURE__ */ p(
    hp,
    {
      "data-slot": "collapsible-content",
      ...e
    }
  );
}
function On(e) {
  const t = y.useRef(e);
  return y.useEffect(() => {
    t.current = e;
  }), y.useMemo(() => (...n) => {
    var r;
    return (r = t.current) == null ? void 0 : r.call(t, ...n);
  }, []);
}
function bS(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = On(e);
  y.useEffect(() => {
    const r = (i) => {
      i.key === "Escape" && n(i);
    };
    return t.addEventListener("keydown", r, { capture: !0 }), () => t.removeEventListener("keydown", r, { capture: !0 });
  }, [n, t]);
}
var xS = "DismissableLayer", Zs = "dismissableLayer.update", wS = "dismissableLayer.pointerDownOutside", SS = "dismissableLayer.focusOutside", _u, pp = y.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), ii = y.forwardRef(
  (e, t) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: i,
      onFocusOutside: o,
      onInteractOutside: s,
      onDismiss: a,
      ...l
    } = e, c = y.useContext(pp), [u, d] = y.useState(null), h = (u == null ? void 0 : u.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, f] = y.useState({}), g = we(t, (A) => d(A)), m = Array.from(c.layers), [b] = [...c.layersWithOutsidePointerEventsDisabled].slice(-1), v = m.indexOf(b), x = u ? m.indexOf(u) : -1, w = c.layersWithOutsidePointerEventsDisabled.size > 0, T = x >= v, E = TS((A) => {
      const I = A.target, F = [...c.branches].some((P) => P.contains(I));
      !T || F || (i == null || i(A), s == null || s(A), A.defaultPrevented || a == null || a());
    }, h), k = ES((A) => {
      const I = A.target;
      [...c.branches].some((P) => P.contains(I)) || (o == null || o(A), s == null || s(A), A.defaultPrevented || a == null || a());
    }, h);
    return bS((A) => {
      x === c.layers.size - 1 && (r == null || r(A), !A.defaultPrevented && a && (A.preventDefault(), a()));
    }, h), y.useEffect(() => {
      if (u)
        return n && (c.layersWithOutsidePointerEventsDisabled.size === 0 && (_u = h.body.style.pointerEvents, h.body.style.pointerEvents = "none"), c.layersWithOutsidePointerEventsDisabled.add(u)), c.layers.add(u), Fu(), () => {
          n && c.layersWithOutsidePointerEventsDisabled.size === 1 && (h.body.style.pointerEvents = _u);
        };
    }, [u, h, n, c]), y.useEffect(() => () => {
      u && (c.layers.delete(u), c.layersWithOutsidePointerEventsDisabled.delete(u), Fu());
    }, [u, c]), y.useEffect(() => {
      const A = () => f({});
      return document.addEventListener(Zs, A), () => document.removeEventListener(Zs, A);
    }, []), /* @__PURE__ */ p(
      pe.div,
      {
        ...l,
        ref: g,
        style: {
          pointerEvents: w ? T ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: ae(e.onFocusCapture, k.onFocusCapture),
        onBlurCapture: ae(e.onBlurCapture, k.onBlurCapture),
        onPointerDownCapture: ae(
          e.onPointerDownCapture,
          E.onPointerDownCapture
        )
      }
    );
  }
);
ii.displayName = xS;
var kS = "DismissableLayerBranch", CS = y.forwardRef((e, t) => {
  const n = y.useContext(pp), r = y.useRef(null), i = we(t, r);
  return y.useEffect(() => {
    const o = r.current;
    if (o)
      return n.branches.add(o), () => {
        n.branches.delete(o);
      };
  }, [n.branches]), /* @__PURE__ */ p(pe.div, { ...e, ref: i });
});
CS.displayName = kS;
function TS(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = On(e), r = y.useRef(!1), i = y.useRef(() => {
  });
  return y.useEffect(() => {
    const o = (a) => {
      if (a.target && !r.current) {
        let l = function() {
          mp(
            wS,
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
function ES(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = On(e), r = y.useRef(!1);
  return y.useEffect(() => {
    const i = (o) => {
      o.target && !r.current && mp(SS, n, { originalEvent: o }, {
        discrete: !1
      });
    };
    return t.addEventListener("focusin", i), () => t.removeEventListener("focusin", i);
  }, [t, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function Fu() {
  const e = new CustomEvent(Zs);
  document.dispatchEvent(e);
}
function mp(e, t, n, { discrete: r }) {
  const i = n.originalEvent.target, o = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  t && i.addEventListener(e, t, { once: !0 }), r ? sS(i, o) : i.dispatchEvent(o);
}
var ls = "focusScope.autoFocusOnMount", cs = "focusScope.autoFocusOnUnmount", Vu = { bubbles: !1, cancelable: !0 }, PS = "FocusScope", Co = y.forwardRef((e, t) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: i,
    onUnmountAutoFocus: o,
    ...s
  } = e, [a, l] = y.useState(null), c = On(i), u = On(o), d = y.useRef(null), h = we(t, (m) => l(m)), f = y.useRef({
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
      let m = function(w) {
        if (f.paused || !a) return;
        const T = w.target;
        a.contains(T) ? d.current = T : un(d.current, { select: !0 });
      }, b = function(w) {
        if (f.paused || !a) return;
        const T = w.relatedTarget;
        T !== null && (a.contains(T) || un(d.current, { select: !0 }));
      }, v = function(w) {
        if (document.activeElement === document.body)
          for (const E of w)
            E.removedNodes.length > 0 && un(a);
      };
      document.addEventListener("focusin", m), document.addEventListener("focusout", b);
      const x = new MutationObserver(v);
      return a && x.observe(a, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", m), document.removeEventListener("focusout", b), x.disconnect();
      };
    }
  }, [r, a, f.paused]), y.useEffect(() => {
    if (a) {
      zu.add(f);
      const m = document.activeElement;
      if (!a.contains(m)) {
        const v = new CustomEvent(ls, Vu);
        a.addEventListener(ls, c), a.dispatchEvent(v), v.defaultPrevented || (AS(MS(gp(a)), { select: !0 }), document.activeElement === m && un(a));
      }
      return () => {
        a.removeEventListener(ls, c), setTimeout(() => {
          const v = new CustomEvent(cs, Vu);
          a.addEventListener(cs, u), a.dispatchEvent(v), v.defaultPrevented || un(m ?? document.body, { select: !0 }), a.removeEventListener(cs, u), zu.remove(f);
        }, 0);
      };
    }
  }, [a, c, u, f]);
  const g = y.useCallback(
    (m) => {
      if (!n && !r || f.paused) return;
      const b = m.key === "Tab" && !m.altKey && !m.ctrlKey && !m.metaKey, v = document.activeElement;
      if (b && v) {
        const x = m.currentTarget, [w, T] = RS(x);
        w && T ? !m.shiftKey && v === T ? (m.preventDefault(), n && un(w, { select: !0 })) : m.shiftKey && v === w && (m.preventDefault(), n && un(T, { select: !0 })) : v === x && m.preventDefault();
      }
    },
    [n, r, f.paused]
  );
  return /* @__PURE__ */ p(pe.div, { tabIndex: -1, ...s, ref: h, onKeyDown: g });
});
Co.displayName = PS;
function AS(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e)
    if (un(r, { select: t }), document.activeElement !== n) return;
}
function RS(e) {
  const t = gp(e), n = Bu(t, e), r = Bu(t.reverse(), e);
  return [n, r];
}
function gp(e) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const i = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || i ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Bu(e, t) {
  for (const n of e)
    if (!NS(n, { upTo: t })) return n;
}
function NS(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function IS(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function un(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== n && IS(e) && t && e.select();
  }
}
var zu = DS();
function DS() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      t !== n && (n == null || n.pause()), e = $u(e, t), e.unshift(t);
    },
    remove(t) {
      var n;
      e = $u(e, t), (n = e[0]) == null || n.resume();
    }
  };
}
function $u(e, t) {
  const n = [...e], r = n.indexOf(t);
  return r !== -1 && n.splice(r, 1), n;
}
function MS(e) {
  return e.filter((t) => t.tagName !== "A");
}
var OS = "Portal", oi = y.forwardRef((e, t) => {
  var a;
  const { container: n, ...r } = e, [i, o] = y.useState(!1);
  Ye(() => o(!0), []);
  const s = n || i && ((a = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : a.body);
  return s ? vf.createPortal(/* @__PURE__ */ p(pe.div, { ...r, ref: t }), s) : null;
});
oi.displayName = OS;
var us = 0;
function ml() {
  y.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return document.body.insertAdjacentElement("afterbegin", e[0] ?? ju()), document.body.insertAdjacentElement("beforeend", e[1] ?? ju()), us++, () => {
      us === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((t) => t.remove()), us--;
    };
  }, []);
}
function ju() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var Ft = function() {
  return Ft = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, Ft.apply(this, arguments);
};
function yp(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function LS(e, t, n) {
  if (n || arguments.length === 2) for (var r = 0, i = t.length, o; r < i; r++)
    (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var Ii = "right-scroll-bar-position", Di = "width-before-scroll-bar", _S = "with-scroll-bars-hidden", FS = "--removed-body-scroll-bar-size";
function ds(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function VS(e, t) {
  var n = ne(function() {
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
var BS = typeof window < "u" ? y.useLayoutEffect : y.useEffect, Uu = /* @__PURE__ */ new WeakMap();
function zS(e, t) {
  var n = VS(null, function(r) {
    return e.forEach(function(i) {
      return ds(i, r);
    });
  });
  return BS(function() {
    var r = Uu.get(n);
    if (r) {
      var i = new Set(r), o = new Set(e), s = n.current;
      i.forEach(function(a) {
        o.has(a) || ds(a, null);
      }), o.forEach(function(a) {
        i.has(a) || ds(a, s);
      });
    }
    Uu.set(n, e);
  }, [e]), n;
}
function $S(e) {
  return e;
}
function jS(e, t) {
  t === void 0 && (t = $S);
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
function US(e) {
  e === void 0 && (e = {});
  var t = jS(null);
  return t.options = Ft({ async: !0, ssr: !1 }, e), t;
}
var vp = function(e) {
  var t = e.sideCar, n = yp(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return y.createElement(r, Ft({}, n));
};
vp.isSideCarExport = !0;
function HS(e, t) {
  return e.useMedium(t), vp;
}
var bp = US(), fs = function() {
}, To = y.forwardRef(function(e, t) {
  var n = y.useRef(null), r = y.useState({
    onScrollCapture: fs,
    onWheelCapture: fs,
    onTouchMoveCapture: fs
  }), i = r[0], o = r[1], s = e.forwardProps, a = e.children, l = e.className, c = e.removeScrollBar, u = e.enabled, d = e.shards, h = e.sideCar, f = e.noRelative, g = e.noIsolation, m = e.inert, b = e.allowPinchZoom, v = e.as, x = v === void 0 ? "div" : v, w = e.gapMode, T = yp(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), E = h, k = zS([n, t]), A = Ft(Ft({}, T), i);
  return y.createElement(
    y.Fragment,
    null,
    u && y.createElement(E, { sideCar: bp, removeScrollBar: c, shards: d, noRelative: f, noIsolation: g, inert: m, setCallbacks: o, allowPinchZoom: !!b, lockRef: n, gapMode: w }),
    s ? y.cloneElement(y.Children.only(a), Ft(Ft({}, A), { ref: k })) : y.createElement(x, Ft({}, A, { className: l, ref: k }), a)
  );
});
To.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
To.classNames = {
  fullWidth: Di,
  zeroRight: Ii
};
var WS = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function qS() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = WS();
  return t && e.setAttribute("nonce", t), e;
}
function KS(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function GS(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var YS = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = qS()) && (KS(t, n), GS(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, XS = function() {
  var e = YS();
  return function(t, n) {
    y.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, xp = function() {
  var e = XS(), t = function(n) {
    var r = n.styles, i = n.dynamic;
    return e(r, i), null;
  };
  return t;
}, ZS = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, hs = function(e) {
  return parseInt(e || "", 10) || 0;
}, JS = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [hs(n), hs(r), hs(i)];
}, QS = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return ZS;
  var t = JS(e), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, r - n + t[2] - t[0])
  };
}, ek = xp(), nr = "data-scroll-locked", tk = function(e, t, n, r) {
  var i = e.left, o = e.top, s = e.right, a = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(_S, ` {
   overflow: hidden `).concat(r, `;
   padding-right: `).concat(a, "px ").concat(r, `;
  }
  body[`).concat(nr, `] {
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
  
  .`).concat(Ii, ` {
    right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(Di, ` {
    margin-right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(Ii, " .").concat(Ii, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(Di, " .").concat(Di, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(nr, `] {
    `).concat(FS, ": ").concat(a, `px;
  }
`);
}, Hu = function() {
  var e = parseInt(document.body.getAttribute(nr) || "0", 10);
  return isFinite(e) ? e : 0;
}, nk = function() {
  y.useEffect(function() {
    return document.body.setAttribute(nr, (Hu() + 1).toString()), function() {
      var e = Hu() - 1;
      e <= 0 ? document.body.removeAttribute(nr) : document.body.setAttribute(nr, e.toString());
    };
  }, []);
}, rk = function(e) {
  var t = e.noRelative, n = e.noImportant, r = e.gapMode, i = r === void 0 ? "margin" : r;
  nk();
  var o = y.useMemo(function() {
    return QS(i);
  }, [i]);
  return y.createElement(ek, { styles: tk(o, !t, i, n ? "" : "!important") });
}, Js = !1;
if (typeof window < "u")
  try {
    var yi = Object.defineProperty({}, "passive", {
      get: function() {
        return Js = !0, !0;
      }
    });
    window.addEventListener("test", yi, yi), window.removeEventListener("test", yi, yi);
  } catch {
    Js = !1;
  }
var Wn = Js ? { passive: !1 } : !1, ik = function(e) {
  return e.tagName === "TEXTAREA";
}, wp = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !ik(e) && n[t] === "visible")
  );
}, ok = function(e) {
  return wp(e, "overflowY");
}, sk = function(e) {
  return wp(e, "overflowX");
}, Wu = function(e, t) {
  var n = t.ownerDocument, r = t;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var i = Sp(e, r);
    if (i) {
      var o = kp(e, r), s = o[1], a = o[2];
      if (s > a)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, ak = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, r = e.clientHeight;
  return [
    t,
    n,
    r
  ];
}, lk = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, r = e.clientWidth;
  return [
    t,
    n,
    r
  ];
}, Sp = function(e, t) {
  return e === "v" ? ok(t) : sk(t);
}, kp = function(e, t) {
  return e === "v" ? ak(t) : lk(t);
}, ck = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, uk = function(e, t, n, r, i) {
  var o = ck(e, window.getComputedStyle(t).direction), s = o * r, a = n.target, l = t.contains(a), c = !1, u = s > 0, d = 0, h = 0;
  do {
    if (!a)
      break;
    var f = kp(e, a), g = f[0], m = f[1], b = f[2], v = m - b - o * g;
    (g || v) && Sp(e, a) && (d += v, h += g);
    var x = a.parentNode;
    a = x && x.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? x.host : x;
  } while (
    // portaled content
    !l && a !== document.body || // self content
    l && (t.contains(a) || t === a)
  );
  return (u && Math.abs(d) < 1 || !u && Math.abs(h) < 1) && (c = !0), c;
}, vi = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, qu = function(e) {
  return [e.deltaX, e.deltaY];
}, Ku = function(e) {
  return e && "current" in e ? e.current : e;
}, dk = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, fk = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, hk = 0, qn = [];
function pk(e) {
  var t = y.useRef([]), n = y.useRef([0, 0]), r = y.useRef(), i = y.useState(hk++)[0], o = y.useState(xp)[0], s = y.useRef(e);
  y.useEffect(function() {
    s.current = e;
  }, [e]), y.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(i));
      var m = LS([e.lockRef.current], (e.shards || []).map(Ku), !0).filter(Boolean);
      return m.forEach(function(b) {
        return b.classList.add("allow-interactivity-".concat(i));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(i)), m.forEach(function(b) {
          return b.classList.remove("allow-interactivity-".concat(i));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var a = y.useCallback(function(m, b) {
    if ("touches" in m && m.touches.length === 2 || m.type === "wheel" && m.ctrlKey)
      return !s.current.allowPinchZoom;
    var v = vi(m), x = n.current, w = "deltaX" in m ? m.deltaX : x[0] - v[0], T = "deltaY" in m ? m.deltaY : x[1] - v[1], E, k = m.target, A = Math.abs(w) > Math.abs(T) ? "h" : "v";
    if ("touches" in m && A === "h" && k.type === "range")
      return !1;
    var I = window.getSelection(), F = I && I.anchorNode, P = F ? F === k || F.contains(k) : !1;
    if (P)
      return !1;
    var N = Wu(A, k);
    if (!N)
      return !0;
    if (N ? E = A : (E = A === "v" ? "h" : "v", N = Wu(A, k)), !N)
      return !1;
    if (!r.current && "changedTouches" in m && (w || T) && (r.current = E), !E)
      return !0;
    var R = r.current || E;
    return uk(R, b, m, R === "h" ? w : T);
  }, []), l = y.useCallback(function(m) {
    var b = m;
    if (!(!qn.length || qn[qn.length - 1] !== o)) {
      var v = "deltaY" in b ? qu(b) : vi(b), x = t.current.filter(function(E) {
        return E.name === b.type && (E.target === b.target || b.target === E.shadowParent) && dk(E.delta, v);
      })[0];
      if (x && x.should) {
        b.cancelable && b.preventDefault();
        return;
      }
      if (!x) {
        var w = (s.current.shards || []).map(Ku).filter(Boolean).filter(function(E) {
          return E.contains(b.target);
        }), T = w.length > 0 ? a(b, w[0]) : !s.current.noIsolation;
        T && b.cancelable && b.preventDefault();
      }
    }
  }, []), c = y.useCallback(function(m, b, v, x) {
    var w = { name: m, delta: b, target: v, should: x, shadowParent: mk(v) };
    t.current.push(w), setTimeout(function() {
      t.current = t.current.filter(function(T) {
        return T !== w;
      });
    }, 1);
  }, []), u = y.useCallback(function(m) {
    n.current = vi(m), r.current = void 0;
  }, []), d = y.useCallback(function(m) {
    c(m.type, qu(m), m.target, a(m, e.lockRef.current));
  }, []), h = y.useCallback(function(m) {
    c(m.type, vi(m), m.target, a(m, e.lockRef.current));
  }, []);
  y.useEffect(function() {
    return qn.push(o), e.setCallbacks({
      onScrollCapture: d,
      onWheelCapture: d,
      onTouchMoveCapture: h
    }), document.addEventListener("wheel", l, Wn), document.addEventListener("touchmove", l, Wn), document.addEventListener("touchstart", u, Wn), function() {
      qn = qn.filter(function(m) {
        return m !== o;
      }), document.removeEventListener("wheel", l, Wn), document.removeEventListener("touchmove", l, Wn), document.removeEventListener("touchstart", u, Wn);
    };
  }, []);
  var f = e.removeScrollBar, g = e.inert;
  return y.createElement(
    y.Fragment,
    null,
    g ? y.createElement(o, { styles: fk(i) }) : null,
    f ? y.createElement(rk, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function mk(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const gk = HS(bp, pk);
var Eo = y.forwardRef(function(e, t) {
  return y.createElement(To, Ft({}, e, { ref: t, sideCar: gk }));
});
Eo.classNames = To.classNames;
var yk = function(e) {
  if (typeof document > "u")
    return null;
  var t = Array.isArray(e) ? e[0] : e;
  return t.ownerDocument.body;
}, Kn = /* @__PURE__ */ new WeakMap(), bi = /* @__PURE__ */ new WeakMap(), xi = {}, ps = 0, Cp = function(e) {
  return e && (e.host || Cp(e.parentNode));
}, vk = function(e, t) {
  return t.map(function(n) {
    if (e.contains(n))
      return n;
    var r = Cp(n);
    return r && e.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, bk = function(e, t, n, r) {
  var i = vk(t, Array.isArray(e) ? e : [e]);
  xi[n] || (xi[n] = /* @__PURE__ */ new WeakMap());
  var o = xi[n], s = [], a = /* @__PURE__ */ new Set(), l = new Set(i), c = function(d) {
    !d || a.has(d) || (a.add(d), c(d.parentNode));
  };
  i.forEach(c);
  var u = function(d) {
    !d || l.has(d) || Array.prototype.forEach.call(d.children, function(h) {
      if (a.has(h))
        u(h);
      else
        try {
          var f = h.getAttribute(r), g = f !== null && f !== "false", m = (Kn.get(h) || 0) + 1, b = (o.get(h) || 0) + 1;
          Kn.set(h, m), o.set(h, b), s.push(h), m === 1 && g && bi.set(h, !0), b === 1 && h.setAttribute(n, "true"), g || h.setAttribute(r, "true");
        } catch (v) {
          console.error("aria-hidden: cannot operate on ", h, v);
        }
    });
  };
  return u(t), a.clear(), ps++, function() {
    s.forEach(function(d) {
      var h = Kn.get(d) - 1, f = o.get(d) - 1;
      Kn.set(d, h), o.set(d, f), h || (bi.has(d) || d.removeAttribute(r), bi.delete(d)), f || d.removeAttribute(n);
    }), ps--, ps || (Kn = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), bi = /* @__PURE__ */ new WeakMap(), xi = {});
  };
}, gl = function(e, t, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(e) ? e : [e]), i = yk(e);
  return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), bk(r, i, n, "aria-hidden")) : function() {
    return null;
  };
};
// @__NO_SIDE_EFFECTS__
function xk(e) {
  const t = /* @__PURE__ */ wk(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(kk);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ p(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ p(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function wk(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = Tk(i), a = Ck(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? $n(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var Sk = Symbol("radix.slottable");
function kk(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Sk;
}
function Ck(e, t) {
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
function Tk(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var Po = "Dialog", [Tp] = tn(Po), [Ek, Lt] = Tp(Po), Ep = (e) => {
  const {
    __scopeDialog: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !0
  } = e, a = y.useRef(null), l = y.useRef(null), [c, u] = pn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Po
  });
  return /* @__PURE__ */ p(
    Ek,
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
Ep.displayName = Po;
var Pp = "DialogTrigger", Ap = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Lt(Pp, n), o = we(t, i.triggerRef);
    return /* @__PURE__ */ p(
      pe.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": bl(i.open),
        ...r,
        ref: o,
        onClick: ae(e.onClick, i.onOpenToggle)
      }
    );
  }
);
Ap.displayName = Pp;
var yl = "DialogPortal", [Pk, Rp] = Tp(yl, {
  forceMount: void 0
}), Np = (e) => {
  const { __scopeDialog: t, forceMount: n, children: r, container: i } = e, o = Lt(yl, t);
  return /* @__PURE__ */ p(Pk, { scope: t, forceMount: n, children: y.Children.map(r, (s) => /* @__PURE__ */ p(nn, { present: n || o.open, children: /* @__PURE__ */ p(oi, { asChild: !0, container: i, children: s }) })) });
};
Np.displayName = yl;
var Ki = "DialogOverlay", Ip = y.forwardRef(
  (e, t) => {
    const n = Rp(Ki, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Lt(Ki, e.__scopeDialog);
    return o.modal ? /* @__PURE__ */ p(nn, { present: r || o.open, children: /* @__PURE__ */ p(Rk, { ...i, ref: t }) }) : null;
  }
);
Ip.displayName = Ki;
var Ak = /* @__PURE__ */ xk("DialogOverlay.RemoveScroll"), Rk = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Lt(Ki, n);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ p(Eo, { as: Ak, allowPinchZoom: !0, shards: [i.contentRef], children: /* @__PURE__ */ p(
        pe.div,
        {
          "data-state": bl(i.open),
          ...r,
          ref: t,
          style: { pointerEvents: "auto", ...r.style }
        }
      ) })
    );
  }
), Ln = "DialogContent", Dp = y.forwardRef(
  (e, t) => {
    const n = Rp(Ln, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Lt(Ln, e.__scopeDialog);
    return /* @__PURE__ */ p(nn, { present: r || o.open, children: o.modal ? /* @__PURE__ */ p(Nk, { ...i, ref: t }) : /* @__PURE__ */ p(Ik, { ...i, ref: t }) });
  }
);
Dp.displayName = Ln;
var Nk = y.forwardRef(
  (e, t) => {
    const n = Lt(Ln, e.__scopeDialog), r = y.useRef(null), i = we(t, n.contentRef, r);
    return y.useEffect(() => {
      const o = r.current;
      if (o) return gl(o);
    }, []), /* @__PURE__ */ p(
      Mp,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: ae(e.onCloseAutoFocus, (o) => {
          var s;
          o.preventDefault(), (s = n.triggerRef.current) == null || s.focus();
        }),
        onPointerDownOutside: ae(e.onPointerDownOutside, (o) => {
          const s = o.detail.originalEvent, a = s.button === 0 && s.ctrlKey === !0;
          (s.button === 2 || a) && o.preventDefault();
        }),
        onFocusOutside: ae(
          e.onFocusOutside,
          (o) => o.preventDefault()
        )
      }
    );
  }
), Ik = y.forwardRef(
  (e, t) => {
    const n = Lt(Ln, e.__scopeDialog), r = y.useRef(!1), i = y.useRef(!1);
    return /* @__PURE__ */ p(
      Mp,
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
), Mp = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: i, onCloseAutoFocus: o, ...s } = e, a = Lt(Ln, n), l = y.useRef(null), c = we(t, l);
    return ml(), /* @__PURE__ */ M(dt, { children: [
      /* @__PURE__ */ p(
        Co,
        {
          asChild: !0,
          loop: !0,
          trapped: r,
          onMountAutoFocus: i,
          onUnmountAutoFocus: o,
          children: /* @__PURE__ */ p(
            ii,
            {
              role: "dialog",
              id: a.contentId,
              "aria-describedby": a.descriptionId,
              "aria-labelledby": a.titleId,
              "data-state": bl(a.open),
              ...s,
              ref: c,
              onDismiss: () => a.onOpenChange(!1)
            }
          )
        }
      ),
      /* @__PURE__ */ M(dt, { children: [
        /* @__PURE__ */ p(Dk, { titleId: a.titleId }),
        /* @__PURE__ */ p(Ok, { contentRef: l, descriptionId: a.descriptionId })
      ] })
    ] });
  }
), vl = "DialogTitle", Op = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Lt(vl, n);
    return /* @__PURE__ */ p(pe.h2, { id: i.titleId, ...r, ref: t });
  }
);
Op.displayName = vl;
var Lp = "DialogDescription", _p = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Lt(Lp, n);
    return /* @__PURE__ */ p(pe.p, { id: i.descriptionId, ...r, ref: t });
  }
);
_p.displayName = Lp;
var Fp = "DialogClose", Vp = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Lt(Fp, n);
    return /* @__PURE__ */ p(
      pe.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: ae(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
Vp.displayName = Fp;
function bl(e) {
  return e ? "open" : "closed";
}
var Bp = "DialogTitleWarning", [SO, zp] = G1(Bp, {
  contentName: Ln,
  titleName: vl,
  docsSlug: "dialog"
}), Dk = ({ titleId: e }) => {
  const t = zp(Bp), n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
  return y.useEffect(() => {
    e && (document.getElementById(e) || console.error(n));
  }, [n, e]), null;
}, Mk = "DialogDescriptionWarning", Ok = ({ contentRef: e, descriptionId: t }) => {
  const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${zp(Mk).contentName}}.`;
  return y.useEffect(() => {
    var o;
    const i = (o = e.current) == null ? void 0 : o.getAttribute("aria-describedby");
    t && i && (document.getElementById(t) || console.warn(r));
  }, [r, e, t]), null;
}, $p = Ep, Lk = Ap, jp = Np, xl = Ip, wl = Dp, Sl = Op, kl = _p, Up = Vp;
const _k = $p, Fk = jp, Hp = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ p(
  xl,
  {
    ref: n,
    className: K(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      e
    ),
    ...t
  }
));
Hp.displayName = xl.displayName;
const Wp = y.forwardRef(({ className: e, children: t, ...n }, r) => /* @__PURE__ */ M(Fk, { children: [
  /* @__PURE__ */ p(Hp, {}),
  /* @__PURE__ */ M(
    wl,
    {
      ref: r,
      className: K(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        e
      ),
      ...n,
      children: [
        t,
        /* @__PURE__ */ M(Up, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ p(zn, { className: "h-4 w-4" }),
          /* @__PURE__ */ p("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
Wp.displayName = wl.displayName;
const qp = ({
  className: e,
  ...t
}) => /* @__PURE__ */ p(
  "div",
  {
    className: K(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      e
    ),
    ...t
  }
);
qp.displayName = "DialogHeader";
const Kp = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ p(
  Sl,
  {
    ref: n,
    className: K(
      "text-lg font-semibold leading-none tracking-tight",
      e
    ),
    ...t
  }
));
Kp.displayName = Sl.displayName;
const Vk = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ p(
  kl,
  {
    ref: n,
    className: K("text-sm text-muted-foreground", e),
    ...t
  }
));
Vk.displayName = kl.displayName;
const ms = ({
  file: e,
  open: t,
  onOpenChange: n
}) => {
  const [r, i] = ne(null), [o, s] = ne(""), [a, l] = ne(!1);
  Ve(() => {
    if (!e || !t) {
      i((h) => (h && URL.revokeObjectURL(h), null)), s("");
      return;
    }
    if (l(!0), e.type.startsWith("image/")) {
      const h = URL.createObjectURL(e);
      return i((f) => (f && URL.revokeObjectURL(f), h)), l(!1), () => {
        URL.revokeObjectURL(h);
      };
    }
    if (e.type.startsWith("text/") || e.name.endsWith(".txt") || e.name.endsWith(".md") || e.name.endsWith(".json") || e.name.endsWith(".csv")) {
      const h = new FileReader();
      h.onload = (f) => {
        var g;
        s((g = f.target) == null ? void 0 : g.result), l(!1);
      }, h.onerror = () => {
        s("Error reading file"), l(!1);
      }, h.readAsText(e);
    } else
      l(!1);
  }, [e, t]);
  const c = () => {
    if (!e) return;
    const h = URL.createObjectURL(e), f = document.createElement("a");
    f.href = h, f.download = e.name, document.body.appendChild(f), f.click(), document.body.removeChild(f), URL.revokeObjectURL(h);
  };
  if (!e) return null;
  const u = e.type.startsWith("image/"), d = e.type.startsWith("text/") || e.name.endsWith(".txt") || e.name.endsWith(".md") || e.name.endsWith(".json") || e.name.endsWith(".csv");
  return /* @__PURE__ */ p(_k, { open: t, onOpenChange: n, children: /* @__PURE__ */ M(Wp, { className: "max-w-4xl max-h-[90vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ p(qp, { className: "flex-shrink-0", children: /* @__PURE__ */ M("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ M(Kp, { className: "flex items-center gap-2 truncate", children: [
        /* @__PURE__ */ p(Ms, { className: "h-5 w-5 shrink-0" }),
        /* @__PURE__ */ p("span", { className: "truncate", children: e.name })
      ] }),
      /* @__PURE__ */ M(
        We,
        {
          variant: "outline",
          size: "sm",
          onClick: c,
          className: "shrink-0",
          children: [
            /* @__PURE__ */ p(fc, { className: "h-4 w-4 mr-2" }),
            "Download"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ p("div", { className: "flex-1 overflow-auto min-h-0", children: a ? /* @__PURE__ */ p("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ p("div", { className: "text-muted-foreground", children: "Loading..." }) }) : u && r ? /* @__PURE__ */ p("div", { className: "flex items-center justify-center bg-muted/30 rounded-lg p-4", children: /* @__PURE__ */ p(
      "img",
      {
        src: r,
        alt: e.name,
        className: "max-w-full max-h-[70vh] object-contain rounded-lg"
      }
    ) }) : d ? /* @__PURE__ */ p("div", { className: "bg-muted/30 rounded-lg p-4", children: /* @__PURE__ */ p("pre", { className: "whitespace-pre-wrap break-words text-sm font-mono overflow-auto max-h-[70vh]", children: o || "No content to display" }) }) : /* @__PURE__ */ M("div", { className: "flex flex-col items-center justify-center h-64 gap-4", children: [
      /* @__PURE__ */ p(Ms, { className: "h-16 w-16 text-muted-foreground" }),
      /* @__PURE__ */ M("div", { className: "text-center", children: [
        /* @__PURE__ */ p("p", { className: "text-muted-foreground mb-2", children: "Preview not available for this file type" }),
        /* @__PURE__ */ p("p", { className: "text-sm text-muted-foreground/70", children: e.type || "Unknown file type" })
      ] }),
      /* @__PURE__ */ M(We, { variant: "outline", onClick: c, children: [
        /* @__PURE__ */ p(fc, { className: "h-4 w-4 mr-2" }),
        "Download File"
      ] })
    ] }) })
  ] }) });
}, Cl = j.forwardRef(
  (e, t) => {
    const [n, r] = ne(!1), i = e.clickable !== !1;
    return e.file.type.startsWith("image/") ? /* @__PURE__ */ M(dt, { children: [
      /* @__PURE__ */ p(
        Gp,
        {
          ...e,
          ref: t,
          clickable: i,
          onOpenDialog: () => r(!0)
        }
      ),
      i && /* @__PURE__ */ p(
        ms,
        {
          file: e.file,
          open: n,
          onOpenChange: r
        }
      )
    ] }) : e.file.type.startsWith("text/") || e.file.name.endsWith(".txt") || e.file.name.endsWith(".md") ? /* @__PURE__ */ M(dt, { children: [
      /* @__PURE__ */ p(
        Yp,
        {
          ...e,
          ref: t,
          clickable: i,
          onOpenDialog: () => r(!0)
        }
      ),
      i && /* @__PURE__ */ p(
        ms,
        {
          file: e.file,
          open: n,
          onOpenChange: r
        }
      )
    ] }) : /* @__PURE__ */ M(dt, { children: [
      /* @__PURE__ */ p(
        Xp,
        {
          ...e,
          ref: t,
          clickable: i,
          onOpenDialog: () => r(!0)
        }
      ),
      i && /* @__PURE__ */ p(
        ms,
        {
          file: e.file,
          open: n,
          onOpenChange: r
        }
      )
    ] });
  }
);
Cl.displayName = "FilePreview";
const Gp = j.forwardRef(
  ({ file: e, onRemove: t, clickable: n = !0, onOpenDialog: r }, i) => {
    const o = (s) => {
      s.target.closest('button[aria-label="Remove attachment"]') || n && r && r();
    };
    return /* @__PURE__ */ M(
      Jt.div,
      {
        ref: i,
        className: K(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          n && "cursor-pointer hover:border-primary/50 transition-colors"
        ),
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        onClick: o,
        children: [
          /* @__PURE__ */ M("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ p(
              "img",
              {
                alt: `Attachment ${e.name}`,
                className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover",
                src: URL.createObjectURL(e)
              }
            ),
            /* @__PURE__ */ p("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ p(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10",
              type: "button",
              onClick: (s) => {
                s.stopPropagation(), t();
              },
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ p(zn, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
Gp.displayName = "ImageFilePreview";
const Yp = j.forwardRef(
  ({ file: e, onRemove: t, clickable: n = !0, onOpenDialog: r }, i) => {
    const [o, s] = j.useState("");
    Ve(() => {
      const l = new FileReader();
      l.onload = (c) => {
        var d;
        const u = (d = c.target) == null ? void 0 : d.result;
        s(u.slice(0, 50) + (u.length > 50 ? "..." : ""));
      }, l.readAsText(e);
    }, [e]);
    const a = (l) => {
      l.target.closest('button[aria-label="Remove attachment"]') || n && r && r();
    };
    return /* @__PURE__ */ M(
      Jt.div,
      {
        ref: i,
        className: K(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          n && "cursor-pointer hover:border-primary/50 transition-colors"
        ),
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        onClick: a,
        children: [
          /* @__PURE__ */ M("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ p("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5", children: /* @__PURE__ */ p("div", { className: "h-full w-full overflow-hidden text-[6px] leading-none text-muted-foreground", children: o || "Loading..." }) }),
            /* @__PURE__ */ p("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ p(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10",
              type: "button",
              onClick: (l) => {
                l.stopPropagation(), t();
              },
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ p(zn, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
Yp.displayName = "TextFilePreview";
const Xp = j.forwardRef(
  ({ file: e, onRemove: t, clickable: n = !0, onOpenDialog: r }, i) => {
    const o = (s) => {
      s.target.closest('button[aria-label="Remove attachment"]') || n && r && r();
    };
    return /* @__PURE__ */ M(
      Jt.div,
      {
        ref: i,
        className: K(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          n && "cursor-pointer hover:border-primary/50 transition-colors"
        ),
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        onClick: o,
        children: [
          /* @__PURE__ */ M("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ p("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted", children: /* @__PURE__ */ p(Ms, { className: "h-6 w-6 text-foreground" }) }),
            /* @__PURE__ */ p("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ p(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10",
              type: "button",
              onClick: (s) => {
                s.stopPropagation(), t();
              },
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ p(zn, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
Xp.displayName = "GenericFilePreview";
function Bk(e, t) {
  const n = t || {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const zk = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, $k = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, jk = {};
function Gu(e, t) {
  return (jk.jsx ? $k : zk).test(e);
}
const Uk = /[ \t\n\f\r]/g;
function Hk(e) {
  return typeof e == "object" ? e.type === "text" ? Yu(e.value) : !1 : Yu(e);
}
function Yu(e) {
  return e.replace(Uk, "") === "";
}
class si {
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
si.prototype.normal = {};
si.prototype.property = {};
si.prototype.space = void 0;
function Zp(e, t) {
  const n = {}, r = {};
  for (const i of e)
    Object.assign(n, i.property), Object.assign(r, i.normal);
  return new si(n, r, t);
}
function Qs(e) {
  return e.toLowerCase();
}
class ht {
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
ht.prototype.attribute = "";
ht.prototype.booleanish = !1;
ht.prototype.boolean = !1;
ht.prototype.commaOrSpaceSeparated = !1;
ht.prototype.commaSeparated = !1;
ht.prototype.defined = !1;
ht.prototype.mustUseProperty = !1;
ht.prototype.number = !1;
ht.prototype.overloadedBoolean = !1;
ht.prototype.property = "";
ht.prototype.spaceSeparated = !1;
ht.prototype.space = void 0;
let Wk = 0;
const fe = Un(), Ue = Un(), ea = Un(), z = Un(), Ae = Un(), rr = Un(), gt = Un();
function Un() {
  return 2 ** ++Wk;
}
const ta = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: fe,
  booleanish: Ue,
  commaOrSpaceSeparated: gt,
  commaSeparated: rr,
  number: z,
  overloadedBoolean: ea,
  spaceSeparated: Ae
}, Symbol.toStringTag, { value: "Module" })), gs = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(ta)
);
class Tl extends ht {
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
    if (super(t, n), Xu(this, "space", i), typeof r == "number")
      for (; ++o < gs.length; ) {
        const s = gs[o];
        Xu(this, gs[o], (r & ta[s]) === ta[s]);
      }
  }
}
Tl.prototype.defined = !0;
function Xu(e, t, n) {
  n && (e[t] = n);
}
function vr(e) {
  const t = {}, n = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const o = new Tl(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (o.mustUseProperty = !0), t[r] = o, n[Qs(r)] = r, n[Qs(o.attribute)] = r;
  }
  return new si(t, n, e.space);
}
const Jp = vr({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: Ue,
    ariaAutoComplete: null,
    ariaBusy: Ue,
    ariaChecked: Ue,
    ariaColCount: z,
    ariaColIndex: z,
    ariaColSpan: z,
    ariaControls: Ae,
    ariaCurrent: null,
    ariaDescribedBy: Ae,
    ariaDetails: null,
    ariaDisabled: Ue,
    ariaDropEffect: Ae,
    ariaErrorMessage: null,
    ariaExpanded: Ue,
    ariaFlowTo: Ae,
    ariaGrabbed: Ue,
    ariaHasPopup: null,
    ariaHidden: Ue,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: Ae,
    ariaLevel: z,
    ariaLive: null,
    ariaModal: Ue,
    ariaMultiLine: Ue,
    ariaMultiSelectable: Ue,
    ariaOrientation: null,
    ariaOwns: Ae,
    ariaPlaceholder: null,
    ariaPosInSet: z,
    ariaPressed: Ue,
    ariaReadOnly: Ue,
    ariaRelevant: null,
    ariaRequired: Ue,
    ariaRoleDescription: Ae,
    ariaRowCount: z,
    ariaRowIndex: z,
    ariaRowSpan: z,
    ariaSelected: Ue,
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
function Qp(e, t) {
  return t in e ? e[t] : t;
}
function em(e, t) {
  return Qp(e, t.toLowerCase());
}
const qk = vr({
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
    accept: rr,
    acceptCharset: Ae,
    accessKey: Ae,
    action: null,
    allow: null,
    allowFullScreen: fe,
    allowPaymentRequest: fe,
    allowUserMedia: fe,
    alt: null,
    as: null,
    async: fe,
    autoCapitalize: null,
    autoComplete: Ae,
    autoFocus: fe,
    autoPlay: fe,
    blocking: Ae,
    capture: null,
    charSet: null,
    checked: fe,
    cite: null,
    className: Ae,
    cols: z,
    colSpan: null,
    content: null,
    contentEditable: Ue,
    controls: fe,
    controlsList: Ae,
    coords: z | rr,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: fe,
    defer: fe,
    dir: null,
    dirName: null,
    disabled: fe,
    download: ea,
    draggable: Ue,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: fe,
    formTarget: null,
    headers: Ae,
    height: z,
    hidden: ea,
    high: z,
    href: null,
    hrefLang: null,
    htmlFor: Ae,
    httpEquiv: Ae,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: fe,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: fe,
    itemId: null,
    itemProp: Ae,
    itemRef: Ae,
    itemScope: fe,
    itemType: Ae,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: fe,
    low: z,
    manifest: null,
    max: null,
    maxLength: z,
    media: null,
    method: null,
    min: null,
    minLength: z,
    multiple: fe,
    muted: fe,
    name: null,
    nonce: null,
    noModule: fe,
    noValidate: fe,
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
    open: fe,
    optimum: z,
    pattern: null,
    ping: Ae,
    placeholder: null,
    playsInline: fe,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: fe,
    referrerPolicy: null,
    rel: Ae,
    required: fe,
    reversed: fe,
    rows: z,
    rowSpan: z,
    sandbox: Ae,
    scope: null,
    scoped: fe,
    seamless: fe,
    selected: fe,
    shadowRootClonable: fe,
    shadowRootDelegatesFocus: fe,
    shadowRootMode: null,
    shape: null,
    size: z,
    sizes: null,
    slot: null,
    span: z,
    spellCheck: Ue,
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
    typeMustMatch: fe,
    useMap: null,
    value: Ue,
    width: z,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: Ae,
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
    compact: fe,
    // Lists. Use CSS to reduce space between items instead
    declare: fe,
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
    noResize: fe,
    // `<frame>`
    noHref: fe,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: fe,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: fe,
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
    scrolling: Ue,
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
    disablePictureInPicture: fe,
    disableRemotePlayback: fe,
    prefix: null,
    property: null,
    results: z,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: em
}), Kk = vr({
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
    about: gt,
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
    className: Ae,
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
    download: fe,
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
    g1: rr,
    g2: rr,
    glyphName: rr,
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
    kernelMatrix: gt,
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
    ping: Ae,
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
    property: gt,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: gt,
    rev: gt,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: gt,
    requiredFeatures: gt,
    requiredFonts: gt,
    requiredFormats: gt,
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
    strokeDashArray: gt,
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
    systemLanguage: gt,
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
    typeOf: gt,
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
  transform: Qp
}), tm = vr({
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
}), nm = vr({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: em
}), rm = vr({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  }
}), Gk = {
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
}, Yk = /[A-Z]/g, Zu = /-[a-z]/g, Xk = /^data[-\w.:]+$/i;
function Zk(e, t) {
  const n = Qs(t);
  let r = t, i = ht;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && Xk.test(t)) {
    if (t.charAt(4) === "-") {
      const o = t.slice(5).replace(Zu, Qk);
      r = "data" + o.charAt(0).toUpperCase() + o.slice(1);
    } else {
      const o = t.slice(4);
      if (!Zu.test(o)) {
        let s = o.replace(Yk, Jk);
        s.charAt(0) !== "-" && (s = "-" + s), t = "data" + s;
      }
    }
    i = Tl;
  }
  return new i(r, t);
}
function Jk(e) {
  return "-" + e.toLowerCase();
}
function Qk(e) {
  return e.charAt(1).toUpperCase();
}
const eC = Zp([Jp, qk, tm, nm, rm], "html"), El = Zp([Jp, Kk, tm, nm, rm], "svg");
function tC(e) {
  return e.join(" ").trim();
}
var Gi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function im(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Pl = {}, Ju = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, nC = /\n/g, rC = /^\s*/, iC = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, oC = /^:\s*/, sC = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, aC = /^[;\s]*/, lC = /^\s+|\s+$/g, cC = `
`, Qu = "/", ed = "*", Nn = "", uC = "comment", dC = "declaration";
function fC(e, t) {
  if (typeof e != "string")
    throw new TypeError("First argument must be a string");
  if (!e) return [];
  t = t || {};
  var n = 1, r = 1;
  function i(g) {
    var m = g.match(nC);
    m && (n += m.length);
    var b = g.lastIndexOf(cC);
    r = ~b ? g.length - b : r + g.length;
  }
  function o() {
    var g = { line: n, column: r };
    return function(m) {
      return m.position = new s(g), c(), m;
    };
  }
  function s(g) {
    this.start = g, this.end = { line: n, column: r }, this.source = t.source;
  }
  s.prototype.content = e;
  function a(g) {
    var m = new Error(
      t.source + ":" + n + ":" + r + ": " + g
    );
    if (m.reason = g, m.filename = t.source, m.line = n, m.column = r, m.source = e, !t.silent) throw m;
  }
  function l(g) {
    var m = g.exec(e);
    if (m) {
      var b = m[0];
      return i(b), e = e.slice(b.length), m;
    }
  }
  function c() {
    l(rC);
  }
  function u(g) {
    var m;
    for (g = g || []; m = d(); )
      m !== !1 && g.push(m);
    return g;
  }
  function d() {
    var g = o();
    if (!(Qu != e.charAt(0) || ed != e.charAt(1))) {
      for (var m = 2; Nn != e.charAt(m) && (ed != e.charAt(m) || Qu != e.charAt(m + 1)); )
        ++m;
      if (m += 2, Nn === e.charAt(m - 1))
        return a("End of comment missing");
      var b = e.slice(2, m - 2);
      return r += 2, i(b), e = e.slice(m), r += 2, g({
        type: uC,
        comment: b
      });
    }
  }
  function h() {
    var g = o(), m = l(iC);
    if (m) {
      if (d(), !l(oC)) return a("property missing ':'");
      var b = l(sC), v = g({
        type: dC,
        property: td(m[0].replace(Ju, Nn)),
        value: b ? td(b[0].replace(Ju, Nn)) : Nn
      });
      return l(aC), v;
    }
  }
  function f() {
    var g = [];
    u(g);
    for (var m; m = h(); )
      m !== !1 && (g.push(m), u(g));
    return g;
  }
  return c(), f();
}
function td(e) {
  return e ? e.replace(lC, Nn) : Nn;
}
var hC = fC, pC = Gi && Gi.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(Pl, "__esModule", { value: !0 });
Pl.default = gC;
const mC = pC(hC);
function gC(e, t) {
  let n = null;
  if (!e || typeof e != "string")
    return n;
  const r = (0, mC.default)(e), i = typeof t == "function";
  return r.forEach((o) => {
    if (o.type !== "declaration")
      return;
    const { property: s, value: a } = o;
    i ? t(s, a, o) : a && (n = n || {}, n[s] = a);
  }), n;
}
var Ao = {};
Object.defineProperty(Ao, "__esModule", { value: !0 });
Ao.camelCase = void 0;
var yC = /^--[a-zA-Z0-9_-]+$/, vC = /-([a-z])/g, bC = /^[^-]+$/, xC = /^-(webkit|moz|ms|o|khtml)-/, wC = /^-(ms)-/, SC = function(e) {
  return !e || bC.test(e) || yC.test(e);
}, kC = function(e, t) {
  return t.toUpperCase();
}, nd = function(e, t) {
  return "".concat(t, "-");
}, CC = function(e, t) {
  return t === void 0 && (t = {}), SC(e) ? e : (e = e.toLowerCase(), t.reactCompat ? e = e.replace(wC, nd) : e = e.replace(xC, nd), e.replace(vC, kC));
};
Ao.camelCase = CC;
var TC = Gi && Gi.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
}, EC = TC(Pl), PC = Ao;
function na(e, t) {
  var n = {};
  return !e || typeof e != "string" || (0, EC.default)(e, function(r, i) {
    r && i && (n[(0, PC.camelCase)(r, t)] = i);
  }), n;
}
na.default = na;
var AC = na;
const RC = /* @__PURE__ */ im(AC), om = sm("end"), Al = sm("start");
function sm(e) {
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
function NC(e) {
  const t = Al(e), n = om(e);
  if (t && n)
    return { start: t, end: n };
}
function Br(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? rd(e.position) : "start" in e || "end" in e ? rd(e) : "line" in e || "column" in e ? ra(e) : "";
}
function ra(e) {
  return id(e && e.line) + ":" + id(e && e.column);
}
function rd(e) {
  return ra(e && e.start) + "-" + ra(e && e.end);
}
function id(e) {
  return e && typeof e == "number" ? e : 1;
}
class it extends Error {
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
it.prototype.file = "";
it.prototype.name = "";
it.prototype.reason = "";
it.prototype.message = "";
it.prototype.stack = "";
it.prototype.column = void 0;
it.prototype.line = void 0;
it.prototype.ancestors = void 0;
it.prototype.cause = void 0;
it.prototype.fatal = void 0;
it.prototype.place = void 0;
it.prototype.ruleId = void 0;
it.prototype.source = void 0;
const Rl = {}.hasOwnProperty, IC = /* @__PURE__ */ new Map(), DC = /[A-Z]/g, MC = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), OC = /* @__PURE__ */ new Set(["td", "th"]), am = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function LC(e, t) {
  if (!t || t.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = UC(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = jC(n, t.jsx, t.jsxs);
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
    schema: t.space === "svg" ? El : eC,
    stylePropertyNameCase: t.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: t.tableCellAlignToStyle !== !1
  }, o = lm(i, e, void 0);
  return o && typeof o != "string" ? o : i.create(
    e,
    i.Fragment,
    { children: o || void 0 },
    void 0
  );
}
function lm(e, t, n) {
  if (t.type === "element")
    return _C(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression")
    return FC(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement")
    return BC(e, t, n);
  if (t.type === "mdxjsEsm")
    return VC(e, t);
  if (t.type === "root")
    return zC(e, t, n);
  if (t.type === "text")
    return $C(e, t);
}
function _C(e, t, n) {
  const r = e.schema;
  let i = r;
  t.tagName.toLowerCase() === "svg" && r.space === "html" && (i = El, e.schema = i), e.ancestors.push(t);
  const o = um(e, t.tagName, !1), s = HC(e, t);
  let a = Il(e, t);
  return MC.has(t.tagName) && (a = a.filter(function(l) {
    return typeof l == "string" ? !Hk(l) : !0;
  })), cm(e, s, o, t), Nl(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function FC(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  Kr(e, t.position);
}
function VC(e, t) {
  if (t.data && t.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(t.data.estree)
    );
  Kr(e, t.position);
}
function BC(e, t, n) {
  const r = e.schema;
  let i = r;
  t.name === "svg" && r.space === "html" && (i = El, e.schema = i), e.ancestors.push(t);
  const o = t.name === null ? e.Fragment : um(e, t.name, !0), s = WC(e, t), a = Il(e, t);
  return cm(e, s, o, t), Nl(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function zC(e, t, n) {
  const r = {};
  return Nl(r, Il(e, t)), e.create(t, e.Fragment, r, n);
}
function $C(e, t) {
  return t.value;
}
function cm(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function Nl(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function jC(e, t, n) {
  return r;
  function r(i, o, s, a) {
    const c = Array.isArray(s.children) ? n : t;
    return a ? c(o, s, a) : c(o, s);
  }
}
function UC(e, t) {
  return n;
  function n(r, i, o, s) {
    const a = Array.isArray(o.children), l = Al(r);
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
function HC(e, t) {
  const n = {};
  let r, i;
  for (i in t.properties)
    if (i !== "children" && Rl.call(t.properties, i)) {
      const o = qC(e, i, t.properties[i]);
      if (o) {
        const [s, a] = o;
        e.tableCellAlignToStyle && s === "align" && typeof a == "string" && OC.has(t.tagName) ? r = a : n[s] = a;
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
function WC(e, t) {
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
function Il(e, t) {
  const n = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : IC;
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
    const a = lm(e, o, s);
    a !== void 0 && n.push(a);
  }
  return n;
}
function qC(e, t, n) {
  const r = Zk(e.schema, t);
  if (!(n == null || typeof n == "number" && Number.isNaN(n))) {
    if (Array.isArray(n) && (n = r.commaSeparated ? Bk(n) : tC(n)), r.property === "style") {
      let i = typeof n == "object" ? n : KC(e, String(n));
      return e.stylePropertyNameCase === "css" && (i = GC(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? Gk[r.property] || r.property : r.attribute,
      n
    ];
  }
}
function KC(e, t) {
  try {
    return RC(t, { reactCompat: !0 });
  } catch (n) {
    if (e.ignoreInvalidStyle)
      return {};
    const r = (
      /** @type {Error} */
      n
    ), i = new it("Cannot parse `style` attribute", {
      ancestors: e.ancestors,
      cause: r,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    throw i.file = e.filePath || void 0, i.url = am + "#cannot-parse-style-attribute", i;
  }
}
function um(e, t, n) {
  let r;
  if (!n)
    r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const i = t.split(".");
    let o = -1, s;
    for (; ++o < i.length; ) {
      const a = Gu(i[o]) ? { type: "Identifier", name: i[o] } : { type: "Literal", value: i[o] };
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
    r = Gu(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return Rl.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  Kr(e);
}
function Kr(e, t) {
  const n = new it(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: t,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw n.file = e.filePath || void 0, n.url = am + "#cannot-handle-mdx-estrees-without-createevaluater", n;
}
function GC(e) {
  const t = {};
  let n;
  for (n in e)
    Rl.call(e, n) && (t[YC(n)] = e[n]);
  return t;
}
function YC(e) {
  let t = e.replace(DC, XC);
  return t.slice(0, 3) === "ms-" && (t = "-" + t), t;
}
function XC(e) {
  return "-" + e.toLowerCase();
}
const ys = {
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
}, ZC = {};
function Dl(e, t) {
  const n = ZC, r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0, i = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return dm(e, r, i);
}
function dm(e, t, n) {
  if (JC(e)) {
    if ("value" in e)
      return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return od(e.children, t, n);
  }
  return Array.isArray(e) ? od(e, t, n) : "";
}
function od(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = dm(e[i], t, n);
  return r.join("");
}
function JC(e) {
  return !!(e && typeof e == "object");
}
const sd = document.createElement("i");
function Ml(e) {
  const t = "&" + e + ";";
  sd.innerHTML = t;
  const n = sd.textContent;
  return (
    // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
    // yield `null`.
    n.charCodeAt(n.length - 1) === 59 && e !== "semi" || n === t ? !1 : n
  );
}
function vt(e, t, n, r) {
  const i = e.length;
  let o = 0, s;
  if (t < 0 ? t = -t > i ? 0 : i + t : t = t > i ? i : t, n = n > 0 ? n : 0, r.length < 1e4)
    s = Array.from(r), s.unshift(t, n), e.splice(...s);
  else
    for (n && e.splice(t, n); o < r.length; )
      s = r.slice(o, o + 1e4), s.unshift(t, 0), e.splice(...s), o += 1e4, t += 1e4;
}
function Tt(e, t) {
  return e.length > 0 ? (vt(e, e.length, 0, t), e) : t;
}
const ad = {}.hasOwnProperty;
function fm(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    QC(t, e[n]);
  return t;
}
function QC(e, t) {
  let n;
  for (n in t) {
    const i = (ad.call(e, n) ? e[n] : void 0) || (e[n] = {}), o = t[n];
    let s;
    if (o)
      for (s in o) {
        ad.call(i, s) || (i[s] = []);
        const a = o[s];
        eT(
          // @ts-expect-error Looks like a list.
          i[s],
          Array.isArray(a) ? a : a ? [a] : []
        );
      }
  }
}
function eT(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  vt(e, 0, 0, r);
}
function hm(e, t) {
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
function Dt(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const at = vn(/[A-Za-z]/), rt = vn(/[\dA-Za-z]/), tT = vn(/[#-'*+\--9=?A-Z^-~]/);
function Yi(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const ia = vn(/\d/), nT = vn(/[\dA-Fa-f]/), rT = vn(/[!-/:-@[-`{-~]/);
function J(e) {
  return e !== null && e < -2;
}
function Ee(e) {
  return e !== null && (e < 0 || e === 32);
}
function ye(e) {
  return e === -2 || e === -1 || e === 32;
}
const Ro = vn(new RegExp("\\p{P}|\\p{S}", "u")), _n = vn(/\s/);
function vn(e) {
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
    if (o === 37 && rt(e.charCodeAt(n + 1)) && rt(e.charCodeAt(n + 2)))
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
function xe(e, t, n, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let o = 0;
  return s;
  function s(l) {
    return ye(l) ? (e.enter(n), a(l)) : t(l);
  }
  function a(l) {
    return ye(l) && o++ < i ? (e.consume(l), a) : (e.exit(n), t(l));
  }
}
const iT = {
  tokenize: oT
};
function oT(e) {
  const t = e.attempt(this.parser.constructs.contentInitial, r, i);
  let n;
  return t;
  function r(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), xe(e, t, "linePrefix");
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
    return J(a) ? (e.consume(a), e.exit("chunkText"), o) : (e.consume(a), s);
  }
}
const sT = {
  tokenize: aT
}, ld = {
  tokenize: lT
};
function aT(e) {
  const t = this, n = [];
  let r = 0, i, o, s;
  return a;
  function a(w) {
    if (r < n.length) {
      const T = n[r];
      return t.containerState = T[1], e.attempt(T[0].continuation, l, c)(w);
    }
    return c(w);
  }
  function l(w) {
    if (r++, t.containerState._closeFlow) {
      t.containerState._closeFlow = void 0, i && x();
      const T = t.events.length;
      let E = T, k;
      for (; E--; )
        if (t.events[E][0] === "exit" && t.events[E][1].type === "chunkFlow") {
          k = t.events[E][1].end;
          break;
        }
      v(r);
      let A = T;
      for (; A < t.events.length; )
        t.events[A][1].end = {
          ...k
        }, A++;
      return vt(t.events, E + 1, 0, t.events.slice(T)), t.events.length = A, c(w);
    }
    return a(w);
  }
  function c(w) {
    if (r === n.length) {
      if (!i)
        return h(w);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return g(w);
      t.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return t.containerState = {}, e.check(ld, u, d)(w);
  }
  function u(w) {
    return i && x(), v(r), h(w);
  }
  function d(w) {
    return t.parser.lazy[t.now().line] = r !== n.length, s = t.now().offset, g(w);
  }
  function h(w) {
    return t.containerState = {}, e.attempt(ld, f, g)(w);
  }
  function f(w) {
    return r++, n.push([t.currentConstruct, t.containerState]), h(w);
  }
  function g(w) {
    if (w === null) {
      i && x(), v(0), e.consume(w);
      return;
    }
    return i = i || t.parser.flow(t.now()), e.enter("chunkFlow", {
      _tokenizer: i,
      contentType: "flow",
      previous: o
    }), m(w);
  }
  function m(w) {
    if (w === null) {
      b(e.exit("chunkFlow"), !0), v(0), e.consume(w);
      return;
    }
    return J(w) ? (e.consume(w), b(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, a) : (e.consume(w), m);
  }
  function b(w, T) {
    const E = t.sliceStream(w);
    if (T && E.push(null), w.previous = o, o && (o.next = w), o = w, i.defineSkip(w.start), i.write(E), t.parser.lazy[w.start.line]) {
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
      let I = A, F, P;
      for (; I--; )
        if (t.events[I][0] === "exit" && t.events[I][1].type === "chunkFlow") {
          if (F) {
            P = t.events[I][1].end;
            break;
          }
          F = !0;
        }
      for (v(r), k = A; k < t.events.length; )
        t.events[k][1].end = {
          ...P
        }, k++;
      vt(t.events, I + 1, 0, t.events.slice(A)), t.events.length = k;
    }
  }
  function v(w) {
    let T = n.length;
    for (; T-- > w; ) {
      const E = n[T];
      t.containerState = E[1], E[0].exit.call(t, e);
    }
    n.length = w;
  }
  function x() {
    i.write([null]), o = void 0, i = void 0, t.containerState._closeFlow = void 0;
  }
}
function lT(e, t, n) {
  return xe(e, e.attempt(this.parser.constructs.document, t, n), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function lr(e) {
  if (e === null || Ee(e) || _n(e))
    return 1;
  if (Ro(e))
    return 2;
}
function No(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const o = e[i].resolveAll;
    o && !r.includes(o) && (t = o(t, n), r.push(o));
  }
  return t;
}
const oa = {
  name: "attention",
  resolveAll: cT,
  tokenize: uT
};
function cT(e, t) {
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
          cd(d, -l), cd(h, l), s = {
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
          }, c = [], e[r][1].end.offset - e[r][1].start.offset && (c = Tt(c, [["enter", e[r][1], t], ["exit", e[r][1], t]])), c = Tt(c, [["enter", i, t], ["enter", s, t], ["exit", s, t], ["enter", o, t]]), c = Tt(c, No(t.parser.constructs.insideSpan.null, e.slice(r + 1, n), t)), c = Tt(c, [["exit", o, t], ["enter", a, t], ["exit", a, t], ["exit", i, t]]), e[n][1].end.offset - e[n][1].start.offset ? (u = 2, c = Tt(c, [["enter", e[n][1], t], ["exit", e[n][1], t]])) : u = 0, vt(e, r - 1, n - r + 3, c), n = r + c.length - u - 2;
          break;
        }
    }
  for (n = -1; ++n < e.length; )
    e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function uT(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = lr(r);
  let o;
  return s;
  function s(l) {
    return o = l, e.enter("attentionSequence"), a(l);
  }
  function a(l) {
    if (l === o)
      return e.consume(l), a;
    const c = e.exit("attentionSequence"), u = lr(l), d = !u || u === 2 && i || n.includes(l), h = !i || i === 2 && u || n.includes(r);
    return c._open = !!(o === 42 ? d : d && (i || !h)), c._close = !!(o === 42 ? h : h && (u || !d)), t(l);
  }
}
function cd(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const dT = {
  name: "autolink",
  tokenize: fT
};
function fT(e, t, n) {
  let r = 0;
  return i;
  function i(f) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), o;
  }
  function o(f) {
    return at(f) ? (e.consume(f), s) : f === 64 ? n(f) : c(f);
  }
  function s(f) {
    return f === 43 || f === 45 || f === 46 || rt(f) ? (r = 1, a(f)) : c(f);
  }
  function a(f) {
    return f === 58 ? (e.consume(f), r = 0, l) : (f === 43 || f === 45 || f === 46 || rt(f)) && r++ < 32 ? (e.consume(f), a) : (r = 0, c(f));
  }
  function l(f) {
    return f === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : f === null || f === 32 || f === 60 || Yi(f) ? n(f) : (e.consume(f), l);
  }
  function c(f) {
    return f === 64 ? (e.consume(f), u) : tT(f) ? (e.consume(f), c) : n(f);
  }
  function u(f) {
    return rt(f) ? d(f) : n(f);
  }
  function d(f) {
    return f === 46 ? (e.consume(f), r = 0, u) : f === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : h(f);
  }
  function h(f) {
    if ((f === 45 || rt(f)) && r++ < 63) {
      const g = f === 45 ? h : d;
      return e.consume(f), g;
    }
    return n(f);
  }
}
const ai = {
  partial: !0,
  tokenize: hT
};
function hT(e, t, n) {
  return r;
  function r(o) {
    return ye(o) ? xe(e, i, "linePrefix")(o) : i(o);
  }
  function i(o) {
    return o === null || J(o) ? t(o) : n(o);
  }
}
const pm = {
  continuation: {
    tokenize: mT
  },
  exit: gT,
  name: "blockQuote",
  tokenize: pT
};
function pT(e, t, n) {
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
    return ye(s) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(s), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(s));
  }
}
function mT(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return ye(s) ? xe(e, o, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(s) : o(s);
  }
  function o(s) {
    return e.attempt(pm, t, n)(s);
  }
}
function gT(e) {
  e.exit("blockQuote");
}
const mm = {
  name: "characterEscape",
  tokenize: yT
};
function yT(e, t, n) {
  return r;
  function r(o) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(o), e.exit("escapeMarker"), i;
  }
  function i(o) {
    return rT(o) ? (e.enter("characterEscapeValue"), e.consume(o), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(o);
  }
}
const gm = {
  name: "characterReference",
  tokenize: vT
};
function vT(e, t, n) {
  const r = this;
  let i = 0, o, s;
  return a;
  function a(d) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), l;
  }
  function l(d) {
    return d === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(d), e.exit("characterReferenceMarkerNumeric"), c) : (e.enter("characterReferenceValue"), o = 31, s = rt, u(d));
  }
  function c(d) {
    return d === 88 || d === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(d), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), o = 6, s = nT, u) : (e.enter("characterReferenceValue"), o = 7, s = ia, u(d));
  }
  function u(d) {
    if (d === 59 && i) {
      const h = e.exit("characterReferenceValue");
      return s === rt && !Ml(r.sliceSerialize(h)) ? n(d) : (e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), e.exit("characterReference"), t);
    }
    return s(d) && i++ < o ? (e.consume(d), u) : n(d);
  }
}
const ud = {
  partial: !0,
  tokenize: xT
}, dd = {
  concrete: !0,
  name: "codeFenced",
  tokenize: bT
};
function bT(e, t, n) {
  const r = this, i = {
    partial: !0,
    tokenize: E
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
    return k === a ? (s++, e.consume(k), u) : s < 3 ? n(k) : (e.exit("codeFencedFenceSequence"), ye(k) ? xe(e, d, "whitespace")(k) : d(k));
  }
  function d(k) {
    return k === null || J(k) ? (e.exit("codeFencedFence"), r.interrupt ? t(k) : e.check(ud, m, T)(k)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), h(k));
  }
  function h(k) {
    return k === null || J(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), d(k)) : ye(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), xe(e, f, "whitespace")(k)) : k === 96 && k === a ? n(k) : (e.consume(k), h);
  }
  function f(k) {
    return k === null || J(k) ? d(k) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), g(k));
  }
  function g(k) {
    return k === null || J(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), d(k)) : k === 96 && k === a ? n(k) : (e.consume(k), g);
  }
  function m(k) {
    return e.attempt(i, T, b)(k);
  }
  function b(k) {
    return e.enter("lineEnding"), e.consume(k), e.exit("lineEnding"), v;
  }
  function v(k) {
    return o > 0 && ye(k) ? xe(e, x, "linePrefix", o + 1)(k) : x(k);
  }
  function x(k) {
    return k === null || J(k) ? e.check(ud, m, T)(k) : (e.enter("codeFlowValue"), w(k));
  }
  function w(k) {
    return k === null || J(k) ? (e.exit("codeFlowValue"), x(k)) : (e.consume(k), w);
  }
  function T(k) {
    return e.exit("codeFenced"), t(k);
  }
  function E(k, A, I) {
    let F = 0;
    return P;
    function P(H) {
      return k.enter("lineEnding"), k.consume(H), k.exit("lineEnding"), N;
    }
    function N(H) {
      return k.enter("codeFencedFence"), ye(H) ? xe(k, R, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(H) : R(H);
    }
    function R(H) {
      return H === a ? (k.enter("codeFencedFenceSequence"), B(H)) : I(H);
    }
    function B(H) {
      return H === a ? (F++, k.consume(H), B) : F >= s ? (k.exit("codeFencedFenceSequence"), ye(H) ? xe(k, $, "whitespace")(H) : $(H)) : I(H);
    }
    function $(H) {
      return H === null || J(H) ? (k.exit("codeFencedFence"), A(H)) : I(H);
    }
  }
}
function xT(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s === null ? n(s) : (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
const vs = {
  name: "codeIndented",
  tokenize: ST
}, wT = {
  partial: !0,
  tokenize: kT
};
function ST(e, t, n) {
  const r = this;
  return i;
  function i(c) {
    return e.enter("codeIndented"), xe(e, o, "linePrefix", 5)(c);
  }
  function o(c) {
    const u = r.events[r.events.length - 1];
    return u && u[1].type === "linePrefix" && u[2].sliceSerialize(u[1], !0).length >= 4 ? s(c) : n(c);
  }
  function s(c) {
    return c === null ? l(c) : J(c) ? e.attempt(wT, s, l)(c) : (e.enter("codeFlowValue"), a(c));
  }
  function a(c) {
    return c === null || J(c) ? (e.exit("codeFlowValue"), s(c)) : (e.consume(c), a);
  }
  function l(c) {
    return e.exit("codeIndented"), t(c);
  }
}
function kT(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return r.parser.lazy[r.now().line] ? n(s) : J(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), i) : xe(e, o, "linePrefix", 5)(s);
  }
  function o(s) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : J(s) ? i(s) : n(s);
  }
}
const CT = {
  name: "codeText",
  previous: ET,
  resolve: TT,
  tokenize: PT
};
function TT(e) {
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
function ET(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function PT(e, t, n) {
  let r = 0, i, o;
  return s;
  function s(d) {
    return e.enter("codeText"), e.enter("codeTextSequence"), a(d);
  }
  function a(d) {
    return d === 96 ? (e.consume(d), r++, a) : (e.exit("codeTextSequence"), l(d));
  }
  function l(d) {
    return d === null ? n(d) : d === 32 ? (e.enter("space"), e.consume(d), e.exit("space"), l) : d === 96 ? (o = e.enter("codeTextSequence"), i = 0, u(d)) : J(d) ? (e.enter("lineEnding"), e.consume(d), e.exit("lineEnding"), l) : (e.enter("codeTextData"), c(d));
  }
  function c(d) {
    return d === null || d === 32 || d === 96 || J(d) ? (e.exit("codeTextData"), l(d)) : (e.consume(d), c);
  }
  function u(d) {
    return d === 96 ? (e.consume(d), i++, u) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(d)) : (o.type = "codeTextData", c(d));
  }
}
class AT {
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
function ym(e) {
  const t = {};
  let n = -1, r, i, o, s, a, l, c;
  const u = new AT(e);
  for (; ++n < u.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = u.get(n), n && r[1].type === "chunkFlow" && u.get(n - 1)[1].type === "listItemPrefix" && (l = r[1]._tokenizer.events, o = 0, o < l.length && l[o][1].type === "lineEndingBlank" && (o += 2), o < l.length && l[o][1].type === "content"))
      for (; ++o < l.length && l[o][1].type !== "content"; )
        l[o][1].type === "chunkText" && (l[o][1]._isInFirstContentOfListItem = !0, o++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, RT(u, n)), n = t[n], c = !0);
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
  return vt(e, 0, Number.POSITIVE_INFINITY, u.slice(0)), !c;
}
function RT(e, t) {
  const n = e.get(t)[1], r = e.get(t)[2];
  let i = t - 1;
  const o = [];
  let s = n._tokenizer;
  s || (s = r.parser[n.contentType](n.start), n._contentTypeTextTrailing && (s._contentTypeTextTrailing = !0));
  const a = s.events, l = [], c = {};
  let u, d, h = -1, f = n, g = 0, m = 0;
  const b = [m];
  for (; f; ) {
    for (; e.get(++i)[1] !== f; )
      ;
    o.push(i), f._tokenizer || (u = r.sliceStream(f), f.next || u.push(null), d && s.defineSkip(f.start), f._isInFirstContentOfListItem && (s._gfmTasklistFirstContentOfListItem = !0), s.write(u), f._isInFirstContentOfListItem && (s._gfmTasklistFirstContentOfListItem = void 0)), d = f, f = f.next;
  }
  for (f = n; ++h < a.length; )
    // Find a void token that includes a break.
    a[h][0] === "exit" && a[h - 1][0] === "enter" && a[h][1].type === a[h - 1][1].type && a[h][1].start.line !== a[h][1].end.line && (m = h + 1, b.push(m), f._tokenizer = void 0, f.previous = void 0, f = f.next);
  for (s.events = [], f ? (f._tokenizer = void 0, f.previous = void 0) : b.pop(), h = b.length; h--; ) {
    const v = a.slice(b[h], b[h + 1]), x = o.pop();
    l.push([x, x + v.length - 1]), e.splice(x, 2, v);
  }
  for (l.reverse(), h = -1; ++h < l.length; )
    c[g + l[h][0]] = g + l[h][1], g += l[h][1] - l[h][0] - 1;
  return c;
}
const NT = {
  resolve: DT,
  tokenize: MT
}, IT = {
  partial: !0,
  tokenize: OT
};
function DT(e) {
  return ym(e), e;
}
function MT(e, t) {
  let n;
  return r;
  function r(a) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(a);
  }
  function i(a) {
    return a === null ? o(a) : J(a) ? e.check(IT, s, o)(a) : (e.consume(a), i);
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
function OT(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), xe(e, o, "linePrefix");
  }
  function o(s) {
    if (s === null || J(s))
      return n(s);
    const a = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : e.interrupt(r.parser.constructs.flow, n, t)(s);
  }
}
function vm(e, t, n, r, i, o, s, a, l) {
  const c = l || Number.POSITIVE_INFINITY;
  let u = 0;
  return d;
  function d(v) {
    return v === 60 ? (e.enter(r), e.enter(i), e.enter(o), e.consume(v), e.exit(o), h) : v === null || v === 32 || v === 41 || Yi(v) ? n(v) : (e.enter(r), e.enter(s), e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), m(v));
  }
  function h(v) {
    return v === 62 ? (e.enter(o), e.consume(v), e.exit(o), e.exit(i), e.exit(r), t) : (e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), f(v));
  }
  function f(v) {
    return v === 62 ? (e.exit("chunkString"), e.exit(a), h(v)) : v === null || v === 60 || J(v) ? n(v) : (e.consume(v), v === 92 ? g : f);
  }
  function g(v) {
    return v === 60 || v === 62 || v === 92 ? (e.consume(v), f) : f(v);
  }
  function m(v) {
    return !u && (v === null || v === 41 || Ee(v)) ? (e.exit("chunkString"), e.exit(a), e.exit(s), e.exit(r), t(v)) : u < c && v === 40 ? (e.consume(v), u++, m) : v === 41 ? (e.consume(v), u--, m) : v === null || v === 32 || v === 40 || Yi(v) ? n(v) : (e.consume(v), v === 92 ? b : m);
  }
  function b(v) {
    return v === 40 || v === 41 || v === 92 ? (e.consume(v), m) : m(v);
  }
}
function bm(e, t, n, r, i, o) {
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
    f === 94 && !a && "_hiddenFootnoteSupport" in s.parser.constructs ? n(f) : f === 93 ? (e.exit(o), e.enter(i), e.consume(f), e.exit(i), e.exit(r), t) : J(f) ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), u) : (e.enter("chunkString", {
      contentType: "string"
    }), d(f));
  }
  function d(f) {
    return f === null || f === 91 || f === 93 || J(f) || a++ > 999 ? (e.exit("chunkString"), u(f)) : (e.consume(f), l || (l = !ye(f)), f === 92 ? h : d);
  }
  function h(f) {
    return f === 91 || f === 92 || f === 93 ? (e.consume(f), a++, d) : d(f);
  }
}
function xm(e, t, n, r, i, o) {
  let s;
  return a;
  function a(h) {
    return h === 34 || h === 39 || h === 40 ? (e.enter(r), e.enter(i), e.consume(h), e.exit(i), s = h === 40 ? 41 : h, l) : n(h);
  }
  function l(h) {
    return h === s ? (e.enter(i), e.consume(h), e.exit(i), e.exit(r), t) : (e.enter(o), c(h));
  }
  function c(h) {
    return h === s ? (e.exit(o), l(s)) : h === null ? n(h) : J(h) ? (e.enter("lineEnding"), e.consume(h), e.exit("lineEnding"), xe(e, c, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), u(h));
  }
  function u(h) {
    return h === s || h === null || J(h) ? (e.exit("chunkString"), c(h)) : (e.consume(h), h === 92 ? d : u);
  }
  function d(h) {
    return h === s || h === 92 ? (e.consume(h), u) : u(h);
  }
}
function zr(e, t) {
  let n;
  return r;
  function r(i) {
    return J(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : ye(i) ? xe(e, r, n ? "linePrefix" : "lineSuffix")(i) : t(i);
  }
}
const LT = {
  name: "definition",
  tokenize: FT
}, _T = {
  partial: !0,
  tokenize: VT
};
function FT(e, t, n) {
  const r = this;
  let i;
  return o;
  function o(f) {
    return e.enter("definition"), s(f);
  }
  function s(f) {
    return bm.call(
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
    return i = Dt(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), f === 58 ? (e.enter("definitionMarker"), e.consume(f), e.exit("definitionMarker"), l) : n(f);
  }
  function l(f) {
    return Ee(f) ? zr(e, c)(f) : c(f);
  }
  function c(f) {
    return vm(
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
    return e.attempt(_T, d, d)(f);
  }
  function d(f) {
    return ye(f) ? xe(e, h, "whitespace")(f) : h(f);
  }
  function h(f) {
    return f === null || J(f) ? (e.exit("definition"), r.parser.defined.push(i), t(f)) : n(f);
  }
}
function VT(e, t, n) {
  return r;
  function r(a) {
    return Ee(a) ? zr(e, i)(a) : n(a);
  }
  function i(a) {
    return xm(e, o, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(a);
  }
  function o(a) {
    return ye(a) ? xe(e, s, "whitespace")(a) : s(a);
  }
  function s(a) {
    return a === null || J(a) ? t(a) : n(a);
  }
}
const BT = {
  name: "hardBreakEscape",
  tokenize: zT
};
function zT(e, t, n) {
  return r;
  function r(o) {
    return e.enter("hardBreakEscape"), e.consume(o), i;
  }
  function i(o) {
    return J(o) ? (e.exit("hardBreakEscape"), t(o)) : n(o);
  }
}
const $T = {
  name: "headingAtx",
  resolve: jT,
  tokenize: UT
};
function jT(e, t) {
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
  }, vt(e, r, n - r + 1, [["enter", i, t], ["enter", o, t], ["exit", o, t], ["exit", i, t]])), e;
}
function UT(e, t, n) {
  let r = 0;
  return i;
  function i(u) {
    return e.enter("atxHeading"), o(u);
  }
  function o(u) {
    return e.enter("atxHeadingSequence"), s(u);
  }
  function s(u) {
    return u === 35 && r++ < 6 ? (e.consume(u), s) : u === null || Ee(u) ? (e.exit("atxHeadingSequence"), a(u)) : n(u);
  }
  function a(u) {
    return u === 35 ? (e.enter("atxHeadingSequence"), l(u)) : u === null || J(u) ? (e.exit("atxHeading"), t(u)) : ye(u) ? xe(e, a, "whitespace")(u) : (e.enter("atxHeadingText"), c(u));
  }
  function l(u) {
    return u === 35 ? (e.consume(u), l) : (e.exit("atxHeadingSequence"), a(u));
  }
  function c(u) {
    return u === null || u === 35 || Ee(u) ? (e.exit("atxHeadingText"), a(u)) : (e.consume(u), c);
  }
}
const HT = [
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
], fd = ["pre", "script", "style", "textarea"], WT = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: GT,
  tokenize: YT
}, qT = {
  partial: !0,
  tokenize: ZT
}, KT = {
  partial: !0,
  tokenize: XT
};
function GT(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function YT(e, t, n) {
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
    return C === 33 ? (e.consume(C), h) : C === 47 ? (e.consume(C), o = !0, m) : C === 63 ? (e.consume(C), i = 3, r.interrupt ? t : S) : at(C) ? (e.consume(C), s = String.fromCharCode(C), b) : n(C);
  }
  function h(C) {
    return C === 45 ? (e.consume(C), i = 2, f) : C === 91 ? (e.consume(C), i = 5, a = 0, g) : at(C) ? (e.consume(C), i = 4, r.interrupt ? t : S) : n(C);
  }
  function f(C) {
    return C === 45 ? (e.consume(C), r.interrupt ? t : S) : n(C);
  }
  function g(C) {
    const q = "CDATA[";
    return C === q.charCodeAt(a++) ? (e.consume(C), a === q.length ? r.interrupt ? t : R : g) : n(C);
  }
  function m(C) {
    return at(C) ? (e.consume(C), s = String.fromCharCode(C), b) : n(C);
  }
  function b(C) {
    if (C === null || C === 47 || C === 62 || Ee(C)) {
      const q = C === 47, Y = s.toLowerCase();
      return !q && !o && fd.includes(Y) ? (i = 1, r.interrupt ? t(C) : R(C)) : HT.includes(s.toLowerCase()) ? (i = 6, q ? (e.consume(C), v) : r.interrupt ? t(C) : R(C)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(C) : o ? x(C) : w(C));
    }
    return C === 45 || rt(C) ? (e.consume(C), s += String.fromCharCode(C), b) : n(C);
  }
  function v(C) {
    return C === 62 ? (e.consume(C), r.interrupt ? t : R) : n(C);
  }
  function x(C) {
    return ye(C) ? (e.consume(C), x) : P(C);
  }
  function w(C) {
    return C === 47 ? (e.consume(C), P) : C === 58 || C === 95 || at(C) ? (e.consume(C), T) : ye(C) ? (e.consume(C), w) : P(C);
  }
  function T(C) {
    return C === 45 || C === 46 || C === 58 || C === 95 || rt(C) ? (e.consume(C), T) : E(C);
  }
  function E(C) {
    return C === 61 ? (e.consume(C), k) : ye(C) ? (e.consume(C), E) : w(C);
  }
  function k(C) {
    return C === null || C === 60 || C === 61 || C === 62 || C === 96 ? n(C) : C === 34 || C === 39 ? (e.consume(C), l = C, A) : ye(C) ? (e.consume(C), k) : I(C);
  }
  function A(C) {
    return C === l ? (e.consume(C), l = null, F) : C === null || J(C) ? n(C) : (e.consume(C), A);
  }
  function I(C) {
    return C === null || C === 34 || C === 39 || C === 47 || C === 60 || C === 61 || C === 62 || C === 96 || Ee(C) ? E(C) : (e.consume(C), I);
  }
  function F(C) {
    return C === 47 || C === 62 || ye(C) ? w(C) : n(C);
  }
  function P(C) {
    return C === 62 ? (e.consume(C), N) : n(C);
  }
  function N(C) {
    return C === null || J(C) ? R(C) : ye(C) ? (e.consume(C), N) : n(C);
  }
  function R(C) {
    return C === 45 && i === 2 ? (e.consume(C), V) : C === 60 && i === 1 ? (e.consume(C), D) : C === 62 && i === 4 ? (e.consume(C), te) : C === 63 && i === 3 ? (e.consume(C), S) : C === 93 && i === 5 ? (e.consume(C), L) : J(C) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(qT, Z, B)(C)) : C === null || J(C) ? (e.exit("htmlFlowData"), B(C)) : (e.consume(C), R);
  }
  function B(C) {
    return e.check(KT, $, Z)(C);
  }
  function $(C) {
    return e.enter("lineEnding"), e.consume(C), e.exit("lineEnding"), H;
  }
  function H(C) {
    return C === null || J(C) ? B(C) : (e.enter("htmlFlowData"), R(C));
  }
  function V(C) {
    return C === 45 ? (e.consume(C), S) : R(C);
  }
  function D(C) {
    return C === 47 ? (e.consume(C), s = "", _) : R(C);
  }
  function _(C) {
    if (C === 62) {
      const q = s.toLowerCase();
      return fd.includes(q) ? (e.consume(C), te) : R(C);
    }
    return at(C) && s.length < 8 ? (e.consume(C), s += String.fromCharCode(C), _) : R(C);
  }
  function L(C) {
    return C === 93 ? (e.consume(C), S) : R(C);
  }
  function S(C) {
    return C === 62 ? (e.consume(C), te) : C === 45 && i === 2 ? (e.consume(C), S) : R(C);
  }
  function te(C) {
    return C === null || J(C) ? (e.exit("htmlFlowData"), Z(C)) : (e.consume(C), te);
  }
  function Z(C) {
    return e.exit("htmlFlow"), t(C);
  }
}
function XT(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return J(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o) : n(s);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
function ZT(e, t, n) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(ai, t, n);
  }
}
const JT = {
  name: "htmlText",
  tokenize: QT
};
function QT(e, t, n) {
  const r = this;
  let i, o, s;
  return a;
  function a(S) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(S), l;
  }
  function l(S) {
    return S === 33 ? (e.consume(S), c) : S === 47 ? (e.consume(S), E) : S === 63 ? (e.consume(S), w) : at(S) ? (e.consume(S), I) : n(S);
  }
  function c(S) {
    return S === 45 ? (e.consume(S), u) : S === 91 ? (e.consume(S), o = 0, g) : at(S) ? (e.consume(S), x) : n(S);
  }
  function u(S) {
    return S === 45 ? (e.consume(S), f) : n(S);
  }
  function d(S) {
    return S === null ? n(S) : S === 45 ? (e.consume(S), h) : J(S) ? (s = d, D(S)) : (e.consume(S), d);
  }
  function h(S) {
    return S === 45 ? (e.consume(S), f) : d(S);
  }
  function f(S) {
    return S === 62 ? V(S) : S === 45 ? h(S) : d(S);
  }
  function g(S) {
    const te = "CDATA[";
    return S === te.charCodeAt(o++) ? (e.consume(S), o === te.length ? m : g) : n(S);
  }
  function m(S) {
    return S === null ? n(S) : S === 93 ? (e.consume(S), b) : J(S) ? (s = m, D(S)) : (e.consume(S), m);
  }
  function b(S) {
    return S === 93 ? (e.consume(S), v) : m(S);
  }
  function v(S) {
    return S === 62 ? V(S) : S === 93 ? (e.consume(S), v) : m(S);
  }
  function x(S) {
    return S === null || S === 62 ? V(S) : J(S) ? (s = x, D(S)) : (e.consume(S), x);
  }
  function w(S) {
    return S === null ? n(S) : S === 63 ? (e.consume(S), T) : J(S) ? (s = w, D(S)) : (e.consume(S), w);
  }
  function T(S) {
    return S === 62 ? V(S) : w(S);
  }
  function E(S) {
    return at(S) ? (e.consume(S), k) : n(S);
  }
  function k(S) {
    return S === 45 || rt(S) ? (e.consume(S), k) : A(S);
  }
  function A(S) {
    return J(S) ? (s = A, D(S)) : ye(S) ? (e.consume(S), A) : V(S);
  }
  function I(S) {
    return S === 45 || rt(S) ? (e.consume(S), I) : S === 47 || S === 62 || Ee(S) ? F(S) : n(S);
  }
  function F(S) {
    return S === 47 ? (e.consume(S), V) : S === 58 || S === 95 || at(S) ? (e.consume(S), P) : J(S) ? (s = F, D(S)) : ye(S) ? (e.consume(S), F) : V(S);
  }
  function P(S) {
    return S === 45 || S === 46 || S === 58 || S === 95 || rt(S) ? (e.consume(S), P) : N(S);
  }
  function N(S) {
    return S === 61 ? (e.consume(S), R) : J(S) ? (s = N, D(S)) : ye(S) ? (e.consume(S), N) : F(S);
  }
  function R(S) {
    return S === null || S === 60 || S === 61 || S === 62 || S === 96 ? n(S) : S === 34 || S === 39 ? (e.consume(S), i = S, B) : J(S) ? (s = R, D(S)) : ye(S) ? (e.consume(S), R) : (e.consume(S), $);
  }
  function B(S) {
    return S === i ? (e.consume(S), i = void 0, H) : S === null ? n(S) : J(S) ? (s = B, D(S)) : (e.consume(S), B);
  }
  function $(S) {
    return S === null || S === 34 || S === 39 || S === 60 || S === 61 || S === 96 ? n(S) : S === 47 || S === 62 || Ee(S) ? F(S) : (e.consume(S), $);
  }
  function H(S) {
    return S === 47 || S === 62 || Ee(S) ? F(S) : n(S);
  }
  function V(S) {
    return S === 62 ? (e.consume(S), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(S);
  }
  function D(S) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(S), e.exit("lineEnding"), _;
  }
  function _(S) {
    return ye(S) ? xe(e, L, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(S) : L(S);
  }
  function L(S) {
    return e.enter("htmlTextData"), s(S);
  }
}
const Ol = {
  name: "labelEnd",
  resolveAll: rE,
  resolveTo: iE,
  tokenize: oE
}, eE = {
  tokenize: sE
}, tE = {
  tokenize: aE
}, nE = {
  tokenize: lE
};
function rE(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.length; ) {
    const r = e[t][1];
    if (n.push(e[t]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd") {
      const i = r.type === "labelImage" ? 4 : 2;
      r.type = "data", t += i;
    }
  }
  return e.length !== n.length && vt(e, 0, e.length, n), e;
}
function iE(e, t) {
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
  return a = [["enter", l, t], ["enter", c, t]], a = Tt(a, e.slice(o + 1, o + r + 3)), a = Tt(a, [["enter", u, t]]), a = Tt(a, No(t.parser.constructs.insideSpan.null, e.slice(o + r + 4, s - 3), t)), a = Tt(a, [["exit", u, t], e[s - 2], e[s - 1], ["exit", c, t]]), a = Tt(a, e.slice(s + 1)), a = Tt(a, [["exit", l, t]]), vt(e, o, e.length, a), e;
}
function oE(e, t, n) {
  const r = this;
  let i = r.events.length, o, s;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      o = r.events[i][1];
      break;
    }
  return a;
  function a(h) {
    return o ? o._inactive ? d(h) : (s = r.parser.defined.includes(Dt(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(h), e.exit("labelMarker"), e.exit("labelEnd"), l) : n(h);
  }
  function l(h) {
    return h === 40 ? e.attempt(eE, u, s ? u : d)(h) : h === 91 ? e.attempt(tE, u, s ? c : d)(h) : s ? u(h) : d(h);
  }
  function c(h) {
    return e.attempt(nE, u, d)(h);
  }
  function u(h) {
    return t(h);
  }
  function d(h) {
    return o._balanced = !0, n(h);
  }
}
function sE(e, t, n) {
  return r;
  function r(d) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), i;
  }
  function i(d) {
    return Ee(d) ? zr(e, o)(d) : o(d);
  }
  function o(d) {
    return d === 41 ? u(d) : vm(e, s, a, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(d);
  }
  function s(d) {
    return Ee(d) ? zr(e, l)(d) : u(d);
  }
  function a(d) {
    return n(d);
  }
  function l(d) {
    return d === 34 || d === 39 || d === 40 ? xm(e, c, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(d) : u(d);
  }
  function c(d) {
    return Ee(d) ? zr(e, u)(d) : u(d);
  }
  function u(d) {
    return d === 41 ? (e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), e.exit("resource"), t) : n(d);
  }
}
function aE(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return bm.call(r, e, o, s, "reference", "referenceMarker", "referenceString")(a);
  }
  function o(a) {
    return r.parser.defined.includes(Dt(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? t(a) : n(a);
  }
  function s(a) {
    return n(a);
  }
}
function lE(e, t, n) {
  return r;
  function r(o) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), i;
  }
  function i(o) {
    return o === 93 ? (e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), e.exit("reference"), t) : n(o);
  }
}
const cE = {
  name: "labelStartImage",
  resolveAll: Ol.resolveAll,
  tokenize: uE
};
function uE(e, t, n) {
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
const dE = {
  name: "labelStartLink",
  resolveAll: Ol.resolveAll,
  tokenize: fE
};
function fE(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(s), e.exit("labelMarker"), e.exit("labelLink"), o;
  }
  function o(s) {
    return s === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(s) : t(s);
  }
}
const bs = {
  name: "lineEnding",
  tokenize: hE
};
function hE(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), xe(e, t, "linePrefix");
  }
}
const Mi = {
  name: "thematicBreak",
  tokenize: pE
};
function pE(e, t, n) {
  let r = 0, i;
  return o;
  function o(c) {
    return e.enter("thematicBreak"), s(c);
  }
  function s(c) {
    return i = c, a(c);
  }
  function a(c) {
    return c === i ? (e.enter("thematicBreakSequence"), l(c)) : r >= 3 && (c === null || J(c)) ? (e.exit("thematicBreak"), t(c)) : n(c);
  }
  function l(c) {
    return c === i ? (e.consume(c), r++, l) : (e.exit("thematicBreakSequence"), ye(c) ? xe(e, a, "whitespace")(c) : a(c));
  }
}
const ct = {
  continuation: {
    tokenize: vE
  },
  exit: xE,
  name: "list",
  tokenize: yE
}, mE = {
  partial: !0,
  tokenize: wE
}, gE = {
  partial: !0,
  tokenize: bE
};
function yE(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let o = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, s = 0;
  return a;
  function a(f) {
    const g = r.containerState.type || (f === 42 || f === 43 || f === 45 ? "listUnordered" : "listOrdered");
    if (g === "listUnordered" ? !r.containerState.marker || f === r.containerState.marker : ia(f)) {
      if (r.containerState.type || (r.containerState.type = g, e.enter(g, {
        _container: !0
      })), g === "listUnordered")
        return e.enter("listItemPrefix"), f === 42 || f === 45 ? e.check(Mi, n, c)(f) : c(f);
      if (!r.interrupt || f === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), l(f);
    }
    return n(f);
  }
  function l(f) {
    return ia(f) && ++s < 10 ? (e.consume(f), l) : (!r.interrupt || s < 2) && (r.containerState.marker ? f === r.containerState.marker : f === 41 || f === 46) ? (e.exit("listItemValue"), c(f)) : n(f);
  }
  function c(f) {
    return e.enter("listItemMarker"), e.consume(f), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || f, e.check(
      ai,
      // Can’t be empty when interrupting.
      r.interrupt ? n : u,
      e.attempt(mE, h, d)
    );
  }
  function u(f) {
    return r.containerState.initialBlankLine = !0, o++, h(f);
  }
  function d(f) {
    return ye(f) ? (e.enter("listItemPrefixWhitespace"), e.consume(f), e.exit("listItemPrefixWhitespace"), h) : n(f);
  }
  function h(f) {
    return r.containerState.size = o + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(f);
  }
}
function vE(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(ai, i, o);
  function i(a) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, xe(e, t, "listItemIndent", r.containerState.size + 1)(a);
  }
  function o(a) {
    return r.containerState.furtherBlankLines || !ye(a) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, s(a)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(gE, t, s)(a));
  }
  function s(a) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, xe(e, e.attempt(ct, t, n), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a);
  }
}
function bE(e, t, n) {
  const r = this;
  return xe(e, i, "listItemIndent", r.containerState.size + 1);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "listItemIndent" && s[2].sliceSerialize(s[1], !0).length === r.containerState.size ? t(o) : n(o);
  }
}
function xE(e) {
  e.exit(this.containerState.type);
}
function wE(e, t, n) {
  const r = this;
  return xe(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return !ye(o) && s && s[1].type === "listItemPrefixWhitespace" ? t(o) : n(o);
  }
}
const hd = {
  name: "setextUnderline",
  resolveTo: SE,
  tokenize: kE
};
function SE(e, t) {
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
function kE(e, t, n) {
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
    return c === i ? (e.consume(c), a) : (e.exit("setextHeadingLineSequence"), ye(c) ? xe(e, l, "lineSuffix")(c) : l(c));
  }
  function l(c) {
    return c === null || J(c) ? (e.exit("setextHeadingLine"), t(c)) : n(c);
  }
}
const CE = {
  tokenize: TE
};
function TE(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    ai,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, xe(e, e.attempt(this.parser.constructs.flow, i, e.attempt(NT, i)), "linePrefix"))
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
const EE = {
  resolveAll: Sm()
}, PE = wm("string"), AE = wm("text");
function wm(e) {
  return {
    resolveAll: Sm(e === "text" ? RE : void 0),
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
function Sm(e) {
  return t;
  function t(n, r) {
    let i = -1, o;
    for (; ++i <= n.length; )
      o === void 0 ? n[i] && n[i][1].type === "data" && (o = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== o + 2 && (n[o][1].end = n[i - 1][1].end, n.splice(o + 2, i - o - 2), i = o + 2), o = void 0);
    return e ? e(n, r) : n;
  }
}
function RE(e, t) {
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
const NE = {
  42: ct,
  43: ct,
  45: ct,
  48: ct,
  49: ct,
  50: ct,
  51: ct,
  52: ct,
  53: ct,
  54: ct,
  55: ct,
  56: ct,
  57: ct,
  62: pm
}, IE = {
  91: LT
}, DE = {
  [-2]: vs,
  [-1]: vs,
  32: vs
}, ME = {
  35: $T,
  42: Mi,
  45: [hd, Mi],
  60: WT,
  61: hd,
  95: Mi,
  96: dd,
  126: dd
}, OE = {
  38: gm,
  92: mm
}, LE = {
  [-5]: bs,
  [-4]: bs,
  [-3]: bs,
  33: cE,
  38: gm,
  42: oa,
  60: [dT, JT],
  91: dE,
  92: [BT, mm],
  93: Ol,
  95: oa,
  96: CT
}, _E = {
  null: [oa, EE]
}, FE = {
  null: [42, 95]
}, VE = {
  null: []
}, BE = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: FE,
  contentInitial: IE,
  disable: VE,
  document: NE,
  flow: ME,
  flowInitial: DE,
  insideSpan: _E,
  string: OE,
  text: LE
}, Symbol.toStringTag, { value: "Module" }));
function zE(e, t, n) {
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
    check: A(k),
    consume: x,
    enter: w,
    exit: T,
    interrupt: A(k, {
      interrupt: !0
    })
  }, c = {
    code: null,
    containerState: {},
    defineSkip: m,
    events: [],
    now: g,
    parser: e,
    previous: null,
    sliceSerialize: h,
    sliceStream: f,
    write: d
  };
  let u = t.tokenize.call(c, l);
  return t.resolveAll && o.push(t), c;
  function d(N) {
    return s = Tt(s, N), b(), s[s.length - 1] !== null ? [] : (I(t, 0), c.events = No(o, c.events, c), c.events);
  }
  function h(N, R) {
    return jE(f(N), R);
  }
  function f(N) {
    return $E(s, N);
  }
  function g() {
    const {
      _bufferIndex: N,
      _index: R,
      line: B,
      column: $,
      offset: H
    } = r;
    return {
      _bufferIndex: N,
      _index: R,
      line: B,
      column: $,
      offset: H
    };
  }
  function m(N) {
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
    J(N) ? (r.line++, r.column = 1, r.offset += N === -3 ? 2 : 1, P()) : N !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    s[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = N;
  }
  function w(N, R) {
    const B = R || {};
    return B.type = N, B.start = g(), c.events.push(["enter", B, c]), a.push(B), B;
  }
  function T(N) {
    const R = a.pop();
    return R.end = g(), c.events.push(["exit", R, c]), R;
  }
  function E(N, R) {
    I(N, R.from);
  }
  function k(N, R) {
    R.restore();
  }
  function A(N, R) {
    return B;
    function B($, H, V) {
      let D, _, L, S;
      return Array.isArray($) ? (
        /* c8 ignore next 1 */
        Z($)
      ) : "tokenize" in $ ? (
        // Looks like a construct.
        Z([
          /** @type {Construct} */
          $
        ])
      ) : te($);
      function te(se) {
        return W;
        function W(ie) {
          const me = ie !== null && se[ie], le = ie !== null && se.null, ce = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(me) ? me : me ? [me] : [],
            ...Array.isArray(le) ? le : le ? [le] : []
          ];
          return Z(ce)(ie);
        }
      }
      function Z(se) {
        return D = se, _ = 0, se.length === 0 ? V : C(se[_]);
      }
      function C(se) {
        return W;
        function W(ie) {
          return S = F(), L = se, se.partial || (c.currentConstruct = se), se.name && c.parser.constructs.disable.null.includes(se.name) ? Y() : se.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            R ? Object.assign(Object.create(c), R) : c,
            l,
            q,
            Y
          )(ie);
        }
      }
      function q(se) {
        return N(L, S), H;
      }
      function Y(se) {
        return S.restore(), ++_ < D.length ? C(D[_]) : V;
      }
    }
  }
  function I(N, R) {
    N.resolveAll && !o.includes(N) && o.push(N), N.resolve && vt(c.events, R, c.events.length - R, N.resolve(c.events.slice(R), c)), N.resolveTo && (c.events = N.resolveTo(c.events, c));
  }
  function F() {
    const N = g(), R = c.previous, B = c.currentConstruct, $ = c.events.length, H = Array.from(a);
    return {
      from: $,
      restore: V
    };
    function V() {
      r = N, c.previous = R, c.currentConstruct = B, c.events.length = $, a = H, P();
    }
  }
  function P() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function $E(e, t) {
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
function jE(e, t) {
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
function UE(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      fm([BE, ...(e || {}).extensions || []])
    ),
    content: i(iT),
    defined: [],
    document: i(sT),
    flow: i(CE),
    lazy: {},
    string: i(PE),
    text: i(AE)
  };
  return r;
  function i(o) {
    return s;
    function s(a) {
      return zE(r, o, a);
    }
  }
}
function HE(e) {
  for (; !ym(e); )
    ;
  return e;
}
const pd = /[\0\t\n\r]/g;
function WE() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(o, s, a) {
    const l = [];
    let c, u, d, h, f;
    for (o = t + (typeof o == "string" ? o.toString() : new TextDecoder(s || void 0).decode(o)), d = 0, t = "", n && (o.charCodeAt(0) === 65279 && d++, n = void 0); d < o.length; ) {
      if (pd.lastIndex = d, c = pd.exec(o), h = c && c.index !== void 0 ? c.index : o.length, f = o.charCodeAt(h), !c) {
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
const qE = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function KE(e) {
  return e.replace(qE, GE);
}
function GE(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), o = i === 120 || i === 88;
    return hm(n.slice(o ? 2 : 1), o ? 16 : 10);
  }
  return Ml(n) || e;
}
const km = {}.hasOwnProperty;
function YE(e, t, n) {
  return typeof t != "string" && (n = t, t = void 0), XE(n)(HE(UE(n).document().write(WE()(e, t, !0))));
}
function XE(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: o(mt),
      autolinkProtocol: F,
      autolinkEmail: F,
      atxHeading: o(pt),
      blockQuote: o(le),
      characterEscape: F,
      characterReference: F,
      codeFenced: o(ce),
      codeFencedFenceInfo: s,
      codeFencedFenceMeta: s,
      codeIndented: o(ce, s),
      codeText: o(ge, s),
      codeTextData: F,
      data: F,
      codeFlowValue: F,
      definition: o(Be),
      definitionDestinationString: s,
      definitionLabelString: s,
      definitionTitleString: s,
      emphasis: o(Xe),
      hardBreakEscape: o(lt),
      hardBreakTrailing: o(lt),
      htmlFlow: o(wt, s),
      htmlFlowData: F,
      htmlText: o(wt, s),
      htmlTextData: F,
      image: o(qt),
      label: s,
      link: o(mt),
      listItem: o(Kt),
      listItemValue: h,
      listOrdered: o(Sn, d),
      listUnordered: o(Sn),
      paragraph: o(Hn),
      reference: C,
      referenceString: s,
      resourceDestinationString: s,
      resourceTitleString: s,
      setextHeading: o(pt),
      strong: o(Et),
      thematicBreak: o(kn)
    },
    exit: {
      atxHeading: l(),
      atxHeadingSequence: E,
      autolink: l(),
      autolinkEmail: me,
      autolinkProtocol: ie,
      blockQuote: l(),
      characterEscapeValue: P,
      characterReferenceMarkerHexadecimal: Y,
      characterReferenceMarkerNumeric: Y,
      characterReferenceValue: se,
      characterReference: W,
      codeFenced: l(b),
      codeFencedFence: m,
      codeFencedFenceInfo: f,
      codeFencedFenceMeta: g,
      codeFlowValue: P,
      codeIndented: l(v),
      codeText: l(H),
      codeTextData: P,
      data: P,
      definition: l(),
      definitionDestinationString: T,
      definitionLabelString: x,
      definitionTitleString: w,
      emphasis: l(),
      hardBreakEscape: l(R),
      hardBreakTrailing: l(R),
      htmlFlow: l(B),
      htmlFlowData: P,
      htmlText: l($),
      htmlTextData: P,
      image: l(D),
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
      resourceTitleString: te,
      resource: Z,
      setextHeading: l(I),
      setextHeadingLineSequence: A,
      setextHeadingText: k,
      strong: l(),
      thematicBreak: l()
    }
  };
  Cm(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(O) {
    let U = {
      type: "root",
      children: []
    };
    const re = {
      stack: [U],
      tokenStack: [],
      config: t,
      enter: a,
      exit: c,
      buffer: s,
      resume: u,
      data: n
    }, he = [];
    let ve = -1;
    for (; ++ve < O.length; )
      if (O[ve][1].type === "listOrdered" || O[ve][1].type === "listUnordered")
        if (O[ve][0] === "enter")
          he.push(ve);
        else {
          const ot = he.pop();
          ve = i(O, ot, ve);
        }
    for (ve = -1; ++ve < O.length; ) {
      const ot = t[O[ve][0]];
      km.call(ot, O[ve][1].type) && ot[O[ve][1].type].call(Object.assign({
        sliceSerialize: O[ve][2].sliceSerialize
      }, re), O[ve][1]);
    }
    if (re.tokenStack.length > 0) {
      const ot = re.tokenStack[re.tokenStack.length - 1];
      (ot[1] || md).call(re, void 0, ot[0]);
    }
    for (U.position = {
      start: an(O.length > 0 ? O[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: an(O.length > 0 ? O[O.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, ve = -1; ++ve < t.transforms.length; )
      U = t.transforms[ve](U) || U;
    return U;
  }
  function i(O, U, re) {
    let he = U - 1, ve = -1, ot = !1, St, Ze, st, Pt;
    for (; ++he <= re; ) {
      const Oe = O[he];
      switch (Oe[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          Oe[0] === "enter" ? ve++ : ve--, Pt = void 0;
          break;
        }
        case "lineEndingBlank": {
          Oe[0] === "enter" && (St && !Pt && !ve && !st && (st = he), Pt = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          Pt = void 0;
      }
      if (!ve && Oe[0] === "enter" && Oe[1].type === "listItemPrefix" || ve === -1 && Oe[0] === "exit" && (Oe[1].type === "listUnordered" || Oe[1].type === "listOrdered")) {
        if (St) {
          let At = he;
          for (Ze = void 0; At--; ) {
            const G = O[At];
            if (G[1].type === "lineEnding" || G[1].type === "lineEndingBlank") {
              if (G[0] === "exit") continue;
              Ze && (O[Ze][1].type = "lineEndingBlank", ot = !0), G[1].type = "lineEnding", Ze = At;
            } else if (!(G[1].type === "linePrefix" || G[1].type === "blockQuotePrefix" || G[1].type === "blockQuotePrefixWhitespace" || G[1].type === "blockQuoteMarker" || G[1].type === "listItemIndent")) break;
          }
          st && (!Ze || st < Ze) && (St._spread = !0), St.end = Object.assign({}, Ze ? O[Ze][1].start : Oe[1].end), O.splice(Ze || he, 0, ["exit", St, Oe[2]]), he++, re++;
        }
        if (Oe[1].type === "listItemPrefix") {
          const At = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, Oe[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          St = At, O.splice(he, 0, ["enter", At, Oe[2]]), he++, re++, st = void 0, Pt = !0;
        }
      }
    }
    return O[U][1]._spread = ot, re;
  }
  function o(O, U) {
    return re;
    function re(he) {
      a.call(this, O(he), he), U && U.call(this, he);
    }
  }
  function s() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function a(O, U, re) {
    this.stack[this.stack.length - 1].children.push(O), this.stack.push(O), this.tokenStack.push([U, re || void 0]), O.position = {
      start: an(U.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function l(O) {
    return U;
    function U(re) {
      O && O.call(this, re), c.call(this, re);
    }
  }
  function c(O, U) {
    const re = this.stack.pop(), he = this.tokenStack.pop();
    if (he)
      he[0].type !== O.type && (U ? U.call(this, O, he[0]) : (he[1] || md).call(this, O, he[0]));
    else throw new Error("Cannot close `" + O.type + "` (" + Br({
      start: O.start,
      end: O.end
    }) + "): it’s not open");
    re.position.end = an(O.end);
  }
  function u() {
    return Dl(this.stack.pop());
  }
  function d() {
    this.data.expectingFirstListItemValue = !0;
  }
  function h(O) {
    if (this.data.expectingFirstListItemValue) {
      const U = this.stack[this.stack.length - 2];
      U.start = Number.parseInt(this.sliceSerialize(O), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function f() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.lang = O;
  }
  function g() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.meta = O;
  }
  function m() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function b() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = O.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function v() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = O.replace(/(\r?\n|\r)$/g, "");
  }
  function x(O) {
    const U = this.resume(), re = this.stack[this.stack.length - 1];
    re.label = U, re.identifier = Dt(this.sliceSerialize(O)).toLowerCase();
  }
  function w() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.title = O;
  }
  function T() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.url = O;
  }
  function E(O) {
    const U = this.stack[this.stack.length - 1];
    if (!U.depth) {
      const re = this.sliceSerialize(O).length;
      U.depth = re;
    }
  }
  function k() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function A(O) {
    const U = this.stack[this.stack.length - 1];
    U.depth = this.sliceSerialize(O).codePointAt(0) === 61 ? 1 : 2;
  }
  function I() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function F(O) {
    const re = this.stack[this.stack.length - 1].children;
    let he = re[re.length - 1];
    (!he || he.type !== "text") && (he = Tr(), he.position = {
      start: an(O.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, re.push(he)), this.stack.push(he);
  }
  function P(O) {
    const U = this.stack.pop();
    U.value += this.sliceSerialize(O), U.position.end = an(O.end);
  }
  function N(O) {
    const U = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const re = U.children[U.children.length - 1];
      re.position.end = an(O.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && t.canContainEols.includes(U.type) && (F.call(this, O), P.call(this, O));
  }
  function R() {
    this.data.atHardBreak = !0;
  }
  function B() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = O;
  }
  function $() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = O;
  }
  function H() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = O;
  }
  function V() {
    const O = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const U = this.data.referenceType || "shortcut";
      O.type += "Reference", O.referenceType = U, delete O.url, delete O.title;
    } else
      delete O.identifier, delete O.label;
    this.data.referenceType = void 0;
  }
  function D() {
    const O = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const U = this.data.referenceType || "shortcut";
      O.type += "Reference", O.referenceType = U, delete O.url, delete O.title;
    } else
      delete O.identifier, delete O.label;
    this.data.referenceType = void 0;
  }
  function _(O) {
    const U = this.sliceSerialize(O), re = this.stack[this.stack.length - 2];
    re.label = KE(U), re.identifier = Dt(U).toLowerCase();
  }
  function L() {
    const O = this.stack[this.stack.length - 1], U = this.resume(), re = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, re.type === "link") {
      const he = O.children;
      re.children = he;
    } else
      re.alt = U;
  }
  function S() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.url = O;
  }
  function te() {
    const O = this.resume(), U = this.stack[this.stack.length - 1];
    U.title = O;
  }
  function Z() {
    this.data.inReference = void 0;
  }
  function C() {
    this.data.referenceType = "collapsed";
  }
  function q(O) {
    const U = this.resume(), re = this.stack[this.stack.length - 1];
    re.label = U, re.identifier = Dt(this.sliceSerialize(O)).toLowerCase(), this.data.referenceType = "full";
  }
  function Y(O) {
    this.data.characterReferenceType = O.type;
  }
  function se(O) {
    const U = this.sliceSerialize(O), re = this.data.characterReferenceType;
    let he;
    re ? (he = hm(U, re === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : he = Ml(U);
    const ve = this.stack[this.stack.length - 1];
    ve.value += he;
  }
  function W(O) {
    const U = this.stack.pop();
    U.position.end = an(O.end);
  }
  function ie(O) {
    P.call(this, O);
    const U = this.stack[this.stack.length - 1];
    U.url = this.sliceSerialize(O);
  }
  function me(O) {
    P.call(this, O);
    const U = this.stack[this.stack.length - 1];
    U.url = "mailto:" + this.sliceSerialize(O);
  }
  function le() {
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
  function ge() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function Be() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function Xe() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function pt() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function lt() {
    return {
      type: "break"
    };
  }
  function wt() {
    return {
      type: "html",
      value: ""
    };
  }
  function qt() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function mt() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function Sn(O) {
    return {
      type: "list",
      ordered: O.type === "listOrdered",
      start: null,
      spread: O._spread,
      children: []
    };
  }
  function Kt(O) {
    return {
      type: "listItem",
      spread: O._spread,
      checked: null,
      children: []
    };
  }
  function Hn() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function Et() {
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
  function kn() {
    return {
      type: "thematicBreak"
    };
  }
}
function an(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function Cm(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? Cm(e, r) : ZE(e, r);
  }
}
function ZE(e, t) {
  let n;
  for (n in t)
    if (km.call(t, n))
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
function md(e, t) {
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
function JE(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return YE(r, {
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
function QE(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function eP(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function tP(e, t) {
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
function nP(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function rP(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function iP(e, t) {
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
function oP(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function sP(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
}
function Tm(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return [{ type: "text", value: "![" + t.alt + r }];
  const i = e.all(t), o = i[0];
  o && o.type === "text" ? o.value = "[" + o.value : i.unshift({ type: "text", value: "[" });
  const s = i[i.length - 1];
  return s && s.type === "text" ? s.value += r : i.push({ type: "text", value: r }), i;
}
function aP(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Tm(e, t);
  const i = { src: br(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(t, o), e.applyData(t, o);
}
function lP(e, t) {
  const n = { src: br(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function cP(e, t) {
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
function uP(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Tm(e, t);
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
function dP(e, t) {
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
function fP(e, t, n) {
  const r = e.all(t), i = n ? hP(n) : Em(t), o = {}, s = [];
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
function hP(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = Em(n[r]);
  }
  return t;
}
function Em(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function pP(e, t) {
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
function mP(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function gP(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function yP(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function vP(e, t) {
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
    }, a = Al(t.children[1]), l = om(t.children[t.children.length - 1]);
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
function bP(e, t, n) {
  const r = n ? n.children : void 0, o = (r ? r.indexOf(t) : 1) === 0 ? "th" : "td", s = n && n.type === "table" ? n.align : void 0, a = s ? s.length : t.children.length;
  let l = -1;
  const c = [];
  for (; ++l < a; ) {
    const d = t.children[l], h = {}, f = s ? s[l] : void 0;
    f && (h.align = f);
    let g = { type: "element", tagName: o, properties: h, children: [] };
    d && (g.children = e.all(d), e.patch(d, g), g = e.applyData(d, g)), c.push(g);
  }
  const u = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(c, !0)
  };
  return e.patch(t, u), e.applyData(t, u);
}
function xP(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const gd = 9, yd = 32;
function wP(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const o = [];
  for (; r; )
    o.push(
      vd(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return o.push(vd(t.slice(i), i > 0, !1)), o.join("");
}
function vd(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let o = e.codePointAt(r);
    for (; o === gd || o === yd; )
      r++, o = e.codePointAt(r);
  }
  if (n) {
    let o = e.codePointAt(i - 1);
    for (; o === gd || o === yd; )
      i--, o = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function SP(e, t) {
  const n = { type: "text", value: wP(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function kP(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const CP = {
  blockquote: QE,
  break: eP,
  code: tP,
  delete: nP,
  emphasis: rP,
  footnoteReference: iP,
  heading: oP,
  html: sP,
  imageReference: aP,
  image: lP,
  inlineCode: cP,
  linkReference: uP,
  link: dP,
  listItem: fP,
  list: pP,
  paragraph: mP,
  // @ts-expect-error: root is different, but hard to type.
  root: gP,
  strong: yP,
  table: vP,
  tableCell: xP,
  tableRow: bP,
  text: SP,
  thematicBreak: kP,
  toml: wi,
  yaml: wi,
  definition: wi,
  footnoteDefinition: wi
};
function wi() {
}
const Pm = -1, Io = 0, $r = 1, Xi = 2, Ll = 3, _l = 4, Fl = 5, Vl = 6, Am = 7, Rm = 8, bd = typeof self == "object" ? self : globalThis, TP = (e, t) => {
  const n = (i, o) => (e.set(o, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [o, s] = t[i];
    switch (o) {
      case Io:
      case Pm:
        return n(s, i);
      case $r: {
        const a = n([], i);
        for (const l of s)
          a.push(r(l));
        return a;
      }
      case Xi: {
        const a = n({}, i);
        for (const [l, c] of s)
          a[r(l)] = r(c);
        return a;
      }
      case Ll:
        return n(new Date(s), i);
      case _l: {
        const { source: a, flags: l } = s;
        return n(new RegExp(a, l), i);
      }
      case Fl: {
        const a = n(/* @__PURE__ */ new Map(), i);
        for (const [l, c] of s)
          a.set(r(l), r(c));
        return a;
      }
      case Vl: {
        const a = n(/* @__PURE__ */ new Set(), i);
        for (const l of s)
          a.add(r(l));
        return a;
      }
      case Am: {
        const { name: a, message: l } = s;
        return n(new bd[a](l), i);
      }
      case Rm:
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
    return n(new bd[o](s), i);
  };
  return r;
}, xd = (e) => TP(/* @__PURE__ */ new Map(), e)(0), Gn = "", { toString: EP } = {}, { keys: PP } = Object, Nr = (e) => {
  const t = typeof e;
  if (t !== "object" || !e)
    return [Io, t];
  const n = EP.call(e).slice(8, -1);
  switch (n) {
    case "Array":
      return [$r, Gn];
    case "Object":
      return [Xi, Gn];
    case "Date":
      return [Ll, Gn];
    case "RegExp":
      return [_l, Gn];
    case "Map":
      return [Fl, Gn];
    case "Set":
      return [Vl, Gn];
    case "DataView":
      return [$r, n];
  }
  return n.includes("Array") ? [$r, n] : n.includes("Error") ? [Am, n] : [Xi, n];
}, Si = ([e, t]) => e === Io && (t === "function" || t === "symbol"), AP = (e, t, n, r) => {
  const i = (s, a) => {
    const l = r.push(s) - 1;
    return n.set(a, l), l;
  }, o = (s) => {
    if (n.has(s))
      return n.get(s);
    let [a, l] = Nr(s);
    switch (a) {
      case Io: {
        let u = s;
        switch (l) {
          case "bigint":
            a = Rm, u = s.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + l);
            u = null;
            break;
          case "undefined":
            return i([Pm], s);
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
      case Xi: {
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
        for (const h of PP(s))
          (e || !Si(Nr(s[h]))) && u.push([o(h), o(s[h])]);
        return d;
      }
      case Ll:
        return i([a, s.toISOString()], s);
      case _l: {
        const { source: u, flags: d } = s;
        return i([a, { source: u, flags: d }], s);
      }
      case Fl: {
        const u = [], d = i([a, u], s);
        for (const [h, f] of s)
          (e || !(Si(Nr(h)) || Si(Nr(f)))) && u.push([o(h), o(f)]);
        return d;
      }
      case Vl: {
        const u = [], d = i([a, u], s);
        for (const h of s)
          (e || !Si(Nr(h))) && u.push(o(h));
        return d;
      }
    }
    const { message: c } = s;
    return i([a, { name: l, message: c }], s);
  };
  return o;
}, wd = (e, { json: t, lossy: n } = {}) => {
  const r = [];
  return AP(!(t || n), !!t, /* @__PURE__ */ new Map(), r)(e), r;
}, Zi = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, t) => t && ("json" in t || "lossy" in t) ? xd(wd(e, t)) : structuredClone(e)
) : (e, t) => xd(wd(e, t));
function RP(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return t > 1 && n.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(t) }]
  }), n;
}
function NP(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function IP(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", n = e.options.footnoteBackContent || RP, r = e.options.footnoteBackLabel || NP, i = e.options.footnoteLabel || "Footnotes", o = e.options.footnoteLabelTagName || "h2", s = e.options.footnoteLabelProperties || {
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
    const g = [], m = e.footnoteCounts.get(d);
    for (; m !== void 0 && ++f <= m; ) {
      g.length > 0 && g.push({ type: "text", value: " " });
      let x = typeof n == "string" ? n : n(l, f);
      typeof x == "string" && (x = { type: "text", value: x }), g.push({
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
      x && x.type === "text" ? x.value += " " : b.children.push({ type: "text", value: " " }), b.children.push(...g);
    } else
      u.push(...g);
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
            ...Zi(s),
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
const Do = (
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
      return LP;
    if (typeof e == "function")
      return Mo(e);
    if (typeof e == "object")
      return Array.isArray(e) ? DP(e) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        MP(
          /** @type {Props} */
          e
        )
      );
    if (typeof e == "string")
      return OP(e);
    throw new Error("Expected function, string, or object as test");
  }
);
function DP(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = Do(e[n]);
  return Mo(r);
  function r(...i) {
    let o = -1;
    for (; ++o < t.length; )
      if (t[o].apply(this, i)) return !0;
    return !1;
  }
}
function MP(e) {
  const t = (
    /** @type {Record<string, unknown>} */
    e
  );
  return Mo(n);
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
function OP(e) {
  return Mo(t);
  function t(n) {
    return n && n.type === e;
  }
}
function Mo(e) {
  return t;
  function t(n, r, i) {
    return !!(_P(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function LP() {
  return !0;
}
function _P(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const Nm = [], FP = !0, sa = !1, VP = "skip";
function Im(e, t, n, r) {
  let i;
  typeof t == "function" && typeof n != "function" ? (r = n, n = t) : i = t;
  const o = Do(i), s = r ? -1 : 1;
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
      let f = Nm, g, m, b;
      if ((!t || o(l, c, u[u.length - 1] || void 0)) && (f = BP(n(l, u)), f[0] === sa))
        return f;
      if ("children" in l && l.children) {
        const v = (
          /** @type {UnistParent} */
          l
        );
        if (v.children && f[0] !== VP)
          for (m = (r ? v.children.length : -1) + s, b = u.concat(v); m > -1 && m < v.children.length; ) {
            const x = v.children[m];
            if (g = a(x, m, b)(), g[0] === sa)
              return g;
            m = typeof g[1] == "number" ? g[1] : m + s;
          }
      }
      return f;
    }
  }
}
function BP(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [FP, e] : e == null ? Nm : [e];
}
function Bl(e, t, n, r) {
  let i, o, s;
  typeof t == "function" && typeof n != "function" ? (o = void 0, s = t, i = n) : (o = t, s = n, i = r), Im(e, o, a, i);
  function a(l, c) {
    const u = c[c.length - 1], d = u ? u.children.indexOf(l) : void 0;
    return s(l, d, u);
  }
}
const aa = {}.hasOwnProperty, zP = {};
function $P(e, t) {
  const n = t || zP, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = { ...CP, ...n.handlers }, a = {
    all: c,
    applyData: UP,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: o,
    footnoteOrder: [],
    handlers: s,
    one: l,
    options: n,
    patch: jP,
    wrap: WP
  };
  return Bl(e, function(u) {
    if (u.type === "definition" || u.type === "footnoteDefinition") {
      const d = u.type === "definition" ? r : i, h = String(u.identifier).toUpperCase();
      d.has(h) || d.set(h, u);
    }
  }), a;
  function l(u, d) {
    const h = u.type, f = a.handlers[h];
    if (aa.call(a.handlers, h) && f)
      return f(a, u, d);
    if (a.options.passThrough && a.options.passThrough.includes(h)) {
      if ("children" in u) {
        const { children: m, ...b } = u, v = Zi(b);
        return v.children = a.all(u), v;
      }
      return Zi(u);
    }
    return (a.options.unknownHandler || HP)(a, u, d);
  }
  function c(u) {
    const d = [];
    if ("children" in u) {
      const h = u.children;
      let f = -1;
      for (; ++f < h.length; ) {
        const g = a.one(h[f], u);
        if (g) {
          if (f && h[f - 1].type === "break" && (!Array.isArray(g) && g.type === "text" && (g.value = Sd(g.value)), !Array.isArray(g) && g.type === "element")) {
            const m = g.children[0];
            m && m.type === "text" && (m.value = Sd(m.value));
          }
          Array.isArray(g) ? d.push(...g) : d.push(g);
        }
      }
    }
    return d;
  }
}
function jP(e, t) {
  e.position && (t.position = NC(e));
}
function UP(e, t) {
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
    n.type === "element" && o && Object.assign(n.properties, Zi(o)), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function HP(e, t) {
  const n = t.data || {}, r = "value" in t && !(aa.call(n, "hProperties") || aa.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function WP(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function Sd(e) {
  let t = 0, n = e.charCodeAt(t);
  for (; n === 9 || n === 32; )
    t++, n = e.charCodeAt(t);
  return e.slice(t);
}
function kd(e, t) {
  const n = $P(e, t), r = n.one(e, void 0), i = IP(n), o = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && o.children.push({ type: "text", value: `
` }, i), o;
}
function qP(e, t) {
  return e && "run" in e ? async function(n, r) {
    const i = (
      /** @type {HastRoot} */
      kd(n, { file: r, ...t })
    );
    await e.run(i, r);
  } : function(n, r) {
    return (
      /** @type {HastRoot} */
      kd(n, { file: r, ...e || t })
    );
  };
}
function Cd(e) {
  if (e)
    throw e;
}
var Oi = Object.prototype.hasOwnProperty, Dm = Object.prototype.toString, Td = Object.defineProperty, Ed = Object.getOwnPropertyDescriptor, Pd = function(t) {
  return typeof Array.isArray == "function" ? Array.isArray(t) : Dm.call(t) === "[object Array]";
}, Ad = function(t) {
  if (!t || Dm.call(t) !== "[object Object]")
    return !1;
  var n = Oi.call(t, "constructor"), r = t.constructor && t.constructor.prototype && Oi.call(t.constructor.prototype, "isPrototypeOf");
  if (t.constructor && !n && !r)
    return !1;
  var i;
  for (i in t)
    ;
  return typeof i > "u" || Oi.call(t, i);
}, Rd = function(t, n) {
  Td && n.name === "__proto__" ? Td(t, n.name, {
    enumerable: !0,
    configurable: !0,
    value: n.newValue,
    writable: !0
  }) : t[n.name] = n.newValue;
}, Nd = function(t, n) {
  if (n === "__proto__")
    if (Oi.call(t, n)) {
      if (Ed)
        return Ed(t, n).value;
    } else return;
  return t[n];
}, KP = function e() {
  var t, n, r, i, o, s, a = arguments[0], l = 1, c = arguments.length, u = !1;
  for (typeof a == "boolean" && (u = a, a = arguments[1] || {}, l = 2), (a == null || typeof a != "object" && typeof a != "function") && (a = {}); l < c; ++l)
    if (t = arguments[l], t != null)
      for (n in t)
        r = Nd(a, n), i = Nd(t, n), a !== i && (u && i && (Ad(i) || (o = Pd(i))) ? (o ? (o = !1, s = r && Pd(r) ? r : []) : s = r && Ad(r) ? r : {}, Rd(a, { name: n, newValue: e(u, s, i) })) : typeof i < "u" && Rd(a, { name: n, newValue: i }));
  return a;
};
const xs = /* @__PURE__ */ im(KP);
function la(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function GP() {
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
      i = c, u ? YP(u, a)(...c) : s(null, ...c);
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
function YP(e, t) {
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
const _t = { basename: XP, dirname: ZP, extname: JP, join: QP, sep: "/" };
function XP(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  li(e);
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
function ZP(e) {
  if (li(e), e.length === 0)
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
function JP(e) {
  li(e);
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
function QP(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    li(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : eA(n);
}
function eA(e) {
  li(e);
  const t = e.codePointAt(0) === 47;
  let n = tA(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function tA(e, t) {
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
function li(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const nA = { cwd: rA };
function rA() {
  return "/";
}
function ca(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function iA(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!ca(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return oA(e);
}
function oA(e) {
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
const ws = (
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
class Mm {
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
    t ? ca(t) ? n = { path: t } : typeof t == "string" || sA(t) ? n = { value: t } : n = t : n = {}, this.cwd = "cwd" in n ? "" : nA.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < ws.length; ) {
      const o = ws[r];
      o in n && n[o] !== void 0 && n[o] !== null && (this[o] = o === "history" ? [...n[o]] : n[o]);
    }
    let i;
    for (i in n)
      ws.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? _t.basename(this.path) : void 0;
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
    ks(t, "basename"), Ss(t, "basename"), this.path = _t.join(this.dirname || "", t);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? _t.dirname(this.path) : void 0;
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
    Id(this.basename, "dirname"), this.path = _t.join(t || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? _t.extname(this.path) : void 0;
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
    if (Ss(t, "extname"), Id(this.dirname, "extname"), t) {
      if (t.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = _t.join(this.dirname, this.stem + (t || ""));
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
    ca(t) && (t = iA(t)), ks(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? _t.basename(this.path, this.extname) : void 0;
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
    ks(t, "stem"), Ss(t, "stem"), this.path = _t.join(this.dirname || "", t + (this.extname || ""));
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
    const i = new it(
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
function Ss(e, t) {
  if (e && e.includes(_t.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + _t.sep + "`"
    );
}
function ks(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function Id(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function sA(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const aA = (
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
), lA = {}.hasOwnProperty;
class zl extends aA {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = GP();
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
      new zl()
    );
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return t.data(xs(!0, {}, this.namespace)), t;
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
    return typeof t == "string" ? arguments.length === 2 ? (Es("data", this.frozen), this.namespace[t] = n, this) : lA.call(this.namespace, t) && this.namespace[t] || void 0 : t ? (Es("data", this.frozen), this.namespace = t, this) : this.namespace;
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
    const n = ki(t), r = this.parser || this.Parser;
    return Cs("parse", r), r(String(n), n);
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
    return this.freeze(), Cs("process", this.parser || this.Parser), Ts("process", this.compiler || this.Compiler), n ? i(void 0, n) : new Promise(i);
    function i(o, s) {
      const a = ki(t), l = (
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
        ), g = r.stringify(f, h);
        dA(g) ? h.value = g : h.result = g, c(
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
    return this.freeze(), Cs("processSync", this.parser || this.Parser), Ts("processSync", this.compiler || this.Compiler), this.process(t, i), Md("processSync", "process", n), r;
    function i(o, s) {
      n = !0, Cd(o), r = s;
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
    Dd(t), this.freeze();
    const i = this.transformers;
    return !r && typeof n == "function" && (r = n, n = void 0), r ? o(void 0, r) : new Promise(o);
    function o(s, a) {
      const l = ki(n);
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
    return this.run(t, n, o), Md("runSync", "run", r), i;
    function o(s, a) {
      Cd(s), i = a, r = !0;
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
    const r = ki(n), i = this.compiler || this.Compiler;
    return Ts("stringify", i), Dd(t), i(t, r);
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
    if (Es("use", this.frozen), t != null) if (typeof t == "function")
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
      a(c.plugins), c.settings && (i.settings = xs(!0, i.settings, c.settings));
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
        let [f, ...g] = u;
        const m = r[h][1];
        la(m) && la(f) && (f = xs(!0, m, f)), r[h] = [c, f, ...g];
      }
    }
  }
}
const cA = new zl().freeze();
function Cs(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function Ts(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function Es(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function Dd(e) {
  if (!la(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function Md(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function ki(e) {
  return uA(e) ? e : new Mm(e);
}
function uA(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function dA(e) {
  return typeof e == "string" || fA(e);
}
function fA(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const hA = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", Od = [], Ld = { allowDangerousHtml: !0 }, pA = /^(https?|ircs?|mailto|xmpp)$/i, mA = [
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
function gA(e) {
  const t = yA(e), n = vA(e);
  return bA(t.runSync(t.parse(n), n), e);
}
function yA(e) {
  const t = e.rehypePlugins || Od, n = e.remarkPlugins || Od, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...Ld } : Ld;
  return cA().use(JE).use(n).use(qP, r).use(t);
}
function vA(e) {
  const t = e.children || "", n = new Mm();
  return typeof t == "string" && (n.value = t), n;
}
function bA(e, t) {
  const n = t.allowedElements, r = t.allowElement, i = t.components, o = t.disallowedElements, s = t.skipHtml, a = t.unwrapDisallowed, l = t.urlTransform || xA;
  for (const u of mA)
    Object.hasOwn(t, u.from) && ("" + u.from + (u.to ? "use `" + u.to + "` instead" : "remove it") + hA + u.id, void 0);
  return t.className && (e = {
    type: "element",
    tagName: "div",
    properties: { className: t.className },
    // Assume no doctypes.
    children: (
      /** @type {Array<ElementContent>} */
      e.type === "root" ? e.children : [e]
    )
  }), Bl(e, c), LC(e, {
    Fragment: dt,
    // @ts-expect-error
    // React components are allowed to return numbers,
    // but not according to the types in hast-util-to-jsx-runtime
    components: i,
    ignoreInvalidStyle: !0,
    jsx: p,
    jsxs: M,
    passKeys: !0,
    passNode: !0
  });
  function c(u, d, h) {
    if (u.type === "raw" && h && typeof d == "number")
      return s ? h.children.splice(d, 1) : h.children[d] = { type: "text", value: u.value }, d;
    if (u.type === "element") {
      let f;
      for (f in ys)
        if (Object.hasOwn(ys, f) && Object.hasOwn(u.properties, f)) {
          const g = u.properties[f], m = ys[f];
          (m === null || m.includes(u.tagName)) && (u.properties[f] = l(String(g || ""), f, u));
        }
    }
    if (u.type === "element") {
      let f = n ? !n.includes(u.tagName) : o ? o.includes(u.tagName) : !1;
      if (!f && r && typeof d == "number" && (f = !r(u, d, h)), f && h && typeof d == "number")
        return a && u.children ? h.children.splice(d, 1, ...u.children) : h.children.splice(d, 1), d;
    }
  }
}
function xA(e) {
  const t = e.indexOf(":"), n = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    t === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && t > i || n !== -1 && t > n || r !== -1 && t > r || // It is a protocol, it should be allowed.
    pA.test(e.slice(0, t)) ? e : ""
  );
}
function _d(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
function wA(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function SA(e, t, n) {
  const i = Do((n || {}).ignore || []), o = kA(t);
  let s = -1;
  for (; ++s < o.length; )
    Im(e, "text", a);
  function a(c, u) {
    let d = -1, h;
    for (; ++d < u.length; ) {
      const f = u[d], g = h ? h.children : void 0;
      if (i(
        f,
        g ? g.indexOf(f) : void 0,
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
    let g = 0;
    const b = d.children.indexOf(c);
    let v = !1, x = [];
    h.lastIndex = 0;
    let w = h.exec(c.value);
    for (; w; ) {
      const T = w.index, E = {
        index: w.index,
        input: w.input,
        stack: [...u, c]
      };
      let k = f(...w, E);
      if (typeof k == "string" && (k = k.length > 0 ? { type: "text", value: k } : void 0), k === !1 ? h.lastIndex = T + 1 : (g !== T && x.push({
        type: "text",
        value: c.value.slice(g, T)
      }), Array.isArray(k) ? x.push(...k) : k && x.push(k), g = T + w[0].length, v = !0), !h.global)
        break;
      w = h.exec(c.value);
    }
    return v ? (g < c.value.length && x.push({ type: "text", value: c.value.slice(g) }), d.children.splice(b, 1, ...x)) : x = [c], b + x.length;
  }
}
function kA(e) {
  const t = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const n = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    t.push([CA(i[0]), TA(i[1])]);
  }
  return t;
}
function CA(e) {
  return typeof e == "string" ? new RegExp(wA(e), "g") : e;
}
function TA(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const Ps = "phrasing", As = ["autolink", "link", "image", "label"];
function EA() {
  return {
    transforms: [MA],
    enter: {
      literalAutolink: AA,
      literalAutolinkEmail: Rs,
      literalAutolinkHttp: Rs,
      literalAutolinkWww: Rs
    },
    exit: {
      literalAutolink: DA,
      literalAutolinkEmail: IA,
      literalAutolinkHttp: RA,
      literalAutolinkWww: NA
    }
  };
}
function PA() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: Ps,
        notInConstruct: As
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: Ps,
        notInConstruct: As
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: Ps,
        notInConstruct: As
      }
    ]
  };
}
function AA(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function Rs(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function RA(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function NA(e) {
  this.config.exit.data.call(this, e);
  const t = this.stack[this.stack.length - 1];
  t.type, t.url = "http://" + this.sliceSerialize(e);
}
function IA(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function DA(e) {
  this.exit(e);
}
function MA(e) {
  SA(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, OA],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), LA]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function OA(e, t, n, r, i) {
  let o = "";
  if (!Om(i) || (/^w/i.test(t) && (n = t + n, t = "", o = "http://"), !_A(n)))
    return !1;
  const s = FA(n + r);
  if (!s[0]) return !1;
  const a = {
    type: "link",
    title: null,
    url: o + t + s[0],
    children: [{ type: "text", value: t + s[0] }]
  };
  return s[1] ? [a, { type: "text", value: s[1] }] : a;
}
function LA(e, t, n, r) {
  return (
    // Not an expected previous character.
    !Om(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(n) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + t + "@" + n,
      children: [{ type: "text", value: t + "@" + n }]
    }
  );
}
function _A(e) {
  const t = e.split(".");
  return !(t.length < 2 || t[t.length - 1] && (/_/.test(t[t.length - 1]) || !/[a-zA-Z\d]/.test(t[t.length - 1])) || t[t.length - 2] && (/_/.test(t[t.length - 2]) || !/[a-zA-Z\d]/.test(t[t.length - 2])));
}
function FA(e) {
  const t = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!t)
    return [e, void 0];
  e = e.slice(0, t.index);
  let n = t[0], r = n.indexOf(")");
  const i = _d(e, "(");
  let o = _d(e, ")");
  for (; r !== -1 && i > o; )
    e += n.slice(0, r + 1), n = n.slice(r + 1), r = n.indexOf(")"), o++;
  return [e, n];
}
function Om(e, t) {
  const n = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || _n(n) || Ro(n)) && // If it’s an email, the previous character should not be a slash.
  (!t || n !== 47);
}
Lm.peek = qA;
function VA() {
  this.buffer();
}
function BA(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function zA() {
  this.buffer();
}
function $A(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function jA(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = Dt(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function UA(e) {
  this.exit(e);
}
function HA(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = Dt(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function WA(e) {
  this.exit(e);
}
function qA() {
  return "[";
}
function Lm(e, t, n, r) {
  const i = n.createTracker(r);
  let o = i.move("[^");
  const s = n.enter("footnoteReference"), a = n.enter("reference");
  return o += i.move(
    n.safe(n.associationId(e), { after: "]", before: o })
  ), a(), s(), o += i.move("]"), o;
}
function KA() {
  return {
    enter: {
      gfmFootnoteCallString: VA,
      gfmFootnoteCall: BA,
      gfmFootnoteDefinitionLabelString: zA,
      gfmFootnoteDefinition: $A
    },
    exit: {
      gfmFootnoteCallString: jA,
      gfmFootnoteCall: UA,
      gfmFootnoteDefinitionLabelString: HA,
      gfmFootnoteDefinition: WA
    }
  };
}
function GA(e) {
  let t = !1;
  return e && e.firstLineBlank && (t = !0), {
    handlers: { footnoteDefinition: n, footnoteReference: Lm },
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
        t ? _m : YA
      )
    )), c(), l;
  }
}
function YA(e, t, n) {
  return t === 0 ? e : _m(e, t, n);
}
function _m(e, t, n) {
  return (n ? "" : "    ") + e;
}
const XA = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
Fm.peek = tR;
function ZA() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: QA },
    exit: { strikethrough: eR }
  };
}
function JA() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: XA
      }
    ],
    handlers: { delete: Fm }
  };
}
function QA(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function eR(e) {
  this.exit(e);
}
function Fm(e, t, n, r) {
  const i = n.createTracker(r), o = n.enter("strikethrough");
  let s = i.move("~~");
  return s += n.containerPhrasing(e, {
    ...i.current(),
    before: s,
    after: "~"
  }), s += i.move("~~"), o(), s;
}
function tR() {
  return "~";
}
function nR(e) {
  return e.length;
}
function rR(e, t) {
  const n = t || {}, r = (n.align || []).concat(), i = n.stringLength || nR, o = [], s = [], a = [], l = [];
  let c = 0, u = -1;
  for (; ++u < e.length; ) {
    const m = [], b = [];
    let v = -1;
    for (e[u].length > c && (c = e[u].length); ++v < e[u].length; ) {
      const x = iR(e[u][v]);
      if (n.alignDelimiters !== !1) {
        const w = i(x);
        b[v] = w, (l[v] === void 0 || w > l[v]) && (l[v] = w);
      }
      m.push(x);
    }
    s[u] = m, a[u] = b;
  }
  let d = -1;
  if (typeof r == "object" && "length" in r)
    for (; ++d < c; )
      o[d] = Fd(r[d]);
  else {
    const m = Fd(r);
    for (; ++d < c; )
      o[d] = m;
  }
  d = -1;
  const h = [], f = [];
  for (; ++d < c; ) {
    const m = o[d];
    let b = "", v = "";
    m === 99 ? (b = ":", v = ":") : m === 108 ? b = ":" : m === 114 && (v = ":");
    let x = n.alignDelimiters === !1 ? 1 : Math.max(
      1,
      l[d] - b.length - v.length
    );
    const w = b + "-".repeat(x) + v;
    n.alignDelimiters !== !1 && (x = b.length + x + v.length, x > l[d] && (l[d] = x), f[d] = x), h[d] = w;
  }
  s.splice(1, 0, h), a.splice(1, 0, f), u = -1;
  const g = [];
  for (; ++u < s.length; ) {
    const m = s[u], b = a[u];
    d = -1;
    const v = [];
    for (; ++d < c; ) {
      const x = m[d] || "";
      let w = "", T = "";
      if (n.alignDelimiters !== !1) {
        const E = l[d] - (b[d] || 0), k = o[d];
        k === 114 ? w = " ".repeat(E) : k === 99 ? E % 2 ? (w = " ".repeat(E / 2 + 0.5), T = " ".repeat(E / 2 - 0.5)) : (w = " ".repeat(E / 2), T = w) : T = " ".repeat(E);
      }
      n.delimiterStart !== !1 && !d && v.push("|"), n.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(n.alignDelimiters === !1 && x === "") && (n.delimiterStart !== !1 || d) && v.push(" "), n.alignDelimiters !== !1 && v.push(w), v.push(x), n.alignDelimiters !== !1 && v.push(T), n.padding !== !1 && v.push(" "), (n.delimiterEnd !== !1 || d !== c - 1) && v.push("|");
    }
    g.push(
      n.delimiterEnd === !1 ? v.join("").replace(/ +$/, "") : v.join("")
    );
  }
  return g.join(`
`);
}
function iR(e) {
  return e == null ? "" : String(e);
}
function Fd(e) {
  const t = typeof e == "string" ? e.codePointAt(0) : 0;
  return t === 67 || t === 99 ? 99 : t === 76 || t === 108 ? 108 : t === 82 || t === 114 ? 114 : 0;
}
function oR(e, t, n, r) {
  const i = n.enter("blockquote"), o = n.createTracker(r);
  o.move("> "), o.shift(2);
  const s = n.indentLines(
    n.containerFlow(e, o.current()),
    sR
  );
  return i(), s;
}
function sR(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function aR(e, t) {
  return Vd(e, t.inConstruct, !0) && !Vd(e, t.notInConstruct, !1);
}
function Vd(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function Bd(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && aR(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function lR(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, o = 0, s = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++o > s && (s = o) : o = 1, i = r + t.length, r = n.indexOf(t, i);
  return s;
}
function cR(e, t) {
  return !!(t.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function uR(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function dR(e, t, n, r) {
  const i = uR(n), o = e.value || "", s = i === "`" ? "GraveAccent" : "Tilde";
  if (cR(e, n)) {
    const d = n.enter("codeIndented"), h = n.indentLines(o, fR);
    return d(), h;
  }
  const a = n.createTracker(r), l = i.repeat(Math.max(lR(o, i) + 1, 3)), c = n.enter("codeFenced");
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
function fR(e, t, n) {
  return (n ? "" : "    ") + e;
}
function $l(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function hR(e, t, n, r) {
  const i = $l(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("definition");
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
function pR(e) {
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
function Ji(e, t, n) {
  const r = lr(e), i = lr(t);
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
Vm.peek = mR;
function Vm(e, t, n, r) {
  const i = pR(n), o = n.enter("emphasis"), s = n.createTracker(r), a = s.move(i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = Ji(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Gr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = Ji(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Gr(d));
  const f = s.move(i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function mR(e, t, n) {
  return n.options.emphasis || "*";
}
function gR(e, t) {
  let n = !1;
  return Bl(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, sa;
  }), !!((!e.depth || e.depth < 3) && Dl(e) && (t.options.setext || n));
}
function yR(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), o = n.createTracker(r);
  if (gR(e, n)) {
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
Bm.peek = vR;
function Bm(e) {
  return e.value || "";
}
function vR() {
  return "<";
}
zm.peek = bR;
function zm(e, t, n, r) {
  const i = $l(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("image");
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
function bR() {
  return "!";
}
$m.peek = xR;
function $m(e, t, n, r) {
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
function xR() {
  return "!";
}
jm.peek = wR;
function jm(e, t, n) {
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
function wR() {
  return "`";
}
function Um(e, t) {
  const n = Dl(e);
  return !!(!t.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
Hm.peek = SR;
function Hm(e, t, n, r) {
  const i = $l(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.createTracker(r);
  let a, l;
  if (Um(e, n)) {
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
function SR(e, t, n) {
  return Um(e, n) ? "<" : "[";
}
Wm.peek = kR;
function Wm(e, t, n, r) {
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
function kR() {
  return "[";
}
function jl(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function CR(e) {
  const t = jl(e), n = e.options.bulletOther;
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
function TR(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function qm(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function ER(e, t, n, r) {
  const i = n.enter("list"), o = n.bulletCurrent;
  let s = e.ordered ? TR(n) : jl(n);
  const a = e.ordered ? s === "." ? ")" : "." : CR(n);
  let l = t && n.bulletLastUsed ? s === n.bulletLastUsed : !1;
  if (!e.ordered) {
    const u = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (s === "*" || s === "-") && // Empty first list item:
      u && (!u.children || !u.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (l = !0), qm(n) === s && u
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
function PR(e) {
  const t = e.options.listItemIndent || "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function AR(e, t, n, r) {
  const i = PR(n);
  let o = n.bulletCurrent || jl(n);
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
function RR(e, t, n, r) {
  const i = n.enter("paragraph"), o = n.enter("phrasing"), s = n.containerPhrasing(e, r);
  return o(), i(), s;
}
const NR = (
  /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
  Do([
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
function IR(e, t, n, r) {
  return (e.children.some(function(s) {
    return NR(s);
  }) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function DR(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
Km.peek = MR;
function Km(e, t, n, r) {
  const i = DR(n), o = n.enter("strong"), s = n.createTracker(r), a = s.move(i + i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = Ji(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Gr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = Ji(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Gr(d));
  const f = s.move(i + i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function MR(e, t, n) {
  return n.options.strong || "*";
}
function OR(e, t, n, r) {
  return n.safe(e.value, r);
}
function LR(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function _R(e, t, n) {
  const r = (qm(n) + (n.options.ruleSpaces ? " " : "")).repeat(LR(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const Gm = {
  blockquote: oR,
  break: Bd,
  code: dR,
  definition: hR,
  emphasis: Vm,
  hardBreak: Bd,
  heading: yR,
  html: Bm,
  image: zm,
  imageReference: $m,
  inlineCode: jm,
  link: Hm,
  linkReference: Wm,
  list: ER,
  listItem: AR,
  paragraph: RR,
  root: IR,
  strong: Km,
  text: OR,
  thematicBreak: _R
};
function FR() {
  return {
    enter: {
      table: VR,
      tableData: zd,
      tableHeader: zd,
      tableRow: zR
    },
    exit: {
      codeText: $R,
      table: BR,
      tableData: Ns,
      tableHeader: Ns,
      tableRow: Ns
    }
  };
}
function VR(e) {
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
function BR(e) {
  this.exit(e), this.data.inTable = void 0;
}
function zR(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function Ns(e) {
  this.exit(e);
}
function zd(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function $R(e) {
  let t = this.resume();
  this.data.inTable && (t = t.replace(/\\([\\|])/g, jR));
  const n = this.stack[this.stack.length - 1];
  n.type, n.value = t, this.exit(e);
}
function jR(e, t) {
  return t === "|" ? t : e;
}
function UR(e) {
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
  function s(f, g, m, b) {
    return c(u(f, m, b), f.align);
  }
  function a(f, g, m, b) {
    const v = d(f, m, b), x = c([v]);
    return x.slice(0, x.indexOf(`
`));
  }
  function l(f, g, m, b) {
    const v = m.enter("tableCell"), x = m.enter("phrasing"), w = m.containerPhrasing(f, {
      ...b,
      before: o,
      after: o
    });
    return x(), v(), w;
  }
  function c(f, g) {
    return rR(f, {
      align: g,
      // @ts-expect-error: `markdown-table` types should support `null`.
      alignDelimiters: r,
      // @ts-expect-error: `markdown-table` types should support `null`.
      padding: n,
      // @ts-expect-error: `markdown-table` types should support `null`.
      stringLength: i
    });
  }
  function u(f, g, m) {
    const b = f.children;
    let v = -1;
    const x = [], w = g.enter("table");
    for (; ++v < b.length; )
      x[v] = d(b[v], g, m);
    return w(), x;
  }
  function d(f, g, m) {
    const b = f.children;
    let v = -1;
    const x = [], w = g.enter("tableRow");
    for (; ++v < b.length; )
      x[v] = l(b[v], f, g, m);
    return w(), x;
  }
  function h(f, g, m) {
    let b = Gm.inlineCode(f, g, m);
    return m.stack.includes("tableCell") && (b = b.replace(/\|/g, "\\$&")), b;
  }
}
function HR() {
  return {
    exit: {
      taskListCheckValueChecked: $d,
      taskListCheckValueUnchecked: $d,
      paragraph: qR
    }
  };
}
function WR() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: KR }
  };
}
function $d(e) {
  const t = this.stack[this.stack.length - 2];
  t.type, t.checked = e.type === "taskListCheckValueChecked";
}
function qR(e) {
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
function KR(e, t, n, r) {
  const i = e.children[0], o = typeof e.checked == "boolean" && i && i.type === "paragraph", s = "[" + (e.checked ? "x" : " ") + "] ", a = n.createTracker(r);
  o && a.move(s);
  let l = Gm.listItem(e, t, n, {
    ...r,
    ...a.current()
  });
  return o && (l = l.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, c)), l;
  function c(u) {
    return u + s;
  }
}
function GR() {
  return [
    EA(),
    KA(),
    ZA(),
    FR(),
    HR()
  ];
}
function YR(e) {
  return {
    extensions: [
      PA(),
      GA(e),
      JA(),
      UR(e),
      WR()
    ]
  };
}
const XR = {
  tokenize: nN,
  partial: !0
}, Ym = {
  tokenize: rN,
  partial: !0
}, Xm = {
  tokenize: iN,
  partial: !0
}, Zm = {
  tokenize: oN,
  partial: !0
}, ZR = {
  tokenize: sN,
  partial: !0
}, Jm = {
  name: "wwwAutolink",
  tokenize: eN,
  previous: eg
}, Qm = {
  name: "protocolAutolink",
  tokenize: tN,
  previous: tg
}, rn = {
  name: "emailAutolink",
  tokenize: QR,
  previous: ng
}, Ht = {};
function JR() {
  return {
    text: Ht
  };
}
let En = 48;
for (; En < 123; )
  Ht[En] = rn, En++, En === 58 ? En = 65 : En === 91 && (En = 97);
Ht[43] = rn;
Ht[45] = rn;
Ht[46] = rn;
Ht[95] = rn;
Ht[72] = [rn, Qm];
Ht[104] = [rn, Qm];
Ht[87] = [rn, Jm];
Ht[119] = [rn, Jm];
function QR(e, t, n) {
  const r = this;
  let i, o;
  return s;
  function s(d) {
    return !ua(d) || !ng.call(r, r.previous) || Ul(r.events) ? n(d) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), a(d));
  }
  function a(d) {
    return ua(d) ? (e.consume(d), a) : d === 64 ? (e.consume(d), l) : n(d);
  }
  function l(d) {
    return d === 46 ? e.check(ZR, u, c)(d) : d === 45 || d === 95 || rt(d) ? (o = !0, e.consume(d), l) : u(d);
  }
  function c(d) {
    return e.consume(d), i = !0, l;
  }
  function u(d) {
    return o && i && at(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), t(d)) : n(d);
  }
}
function eN(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s !== 87 && s !== 119 || !eg.call(r, r.previous) || Ul(r.events) ? n(s) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(XR, e.attempt(Ym, e.attempt(Xm, o), n), n)(s));
  }
  function o(s) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), t(s);
  }
}
function tN(e, t, n) {
  const r = this;
  let i = "", o = !1;
  return s;
  function s(d) {
    return (d === 72 || d === 104) && tg.call(r, r.previous) && !Ul(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(d), e.consume(d), a) : n(d);
  }
  function a(d) {
    if (at(d) && i.length < 5)
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
    return d === null || Yi(d) || Ee(d) || _n(d) || Ro(d) ? n(d) : e.attempt(Ym, e.attempt(Xm, u), n)(d);
  }
  function u(d) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), t(d);
  }
}
function nN(e, t, n) {
  let r = 0;
  return i;
  function i(s) {
    return (s === 87 || s === 119) && r < 3 ? (r++, e.consume(s), i) : s === 46 && r === 3 ? (e.consume(s), o) : n(s);
  }
  function o(s) {
    return s === null ? n(s) : t(s);
  }
}
function rN(e, t, n) {
  let r, i, o;
  return s;
  function s(c) {
    return c === 46 || c === 95 ? e.check(Zm, l, a)(c) : c === null || Ee(c) || _n(c) || c !== 45 && Ro(c) ? l(c) : (o = !0, e.consume(c), s);
  }
  function a(c) {
    return c === 95 ? r = !0 : (i = r, r = void 0), e.consume(c), s;
  }
  function l(c) {
    return i || r || !o ? n(c) : t(c);
  }
}
function iN(e, t) {
  let n = 0, r = 0;
  return i;
  function i(s) {
    return s === 40 ? (n++, e.consume(s), i) : s === 41 && r < n ? o(s) : s === 33 || s === 34 || s === 38 || s === 39 || s === 41 || s === 42 || s === 44 || s === 46 || s === 58 || s === 59 || s === 60 || s === 63 || s === 93 || s === 95 || s === 126 ? e.check(Zm, t, o)(s) : s === null || Ee(s) || _n(s) ? t(s) : (e.consume(s), i);
  }
  function o(s) {
    return s === 41 && r++, e.consume(s), i;
  }
}
function oN(e, t, n) {
  return r;
  function r(a) {
    return a === 33 || a === 34 || a === 39 || a === 41 || a === 42 || a === 44 || a === 46 || a === 58 || a === 59 || a === 63 || a === 95 || a === 126 ? (e.consume(a), r) : a === 38 ? (e.consume(a), o) : a === 93 ? (e.consume(a), i) : (
      // `<` is an end.
      a === 60 || // So is whitespace.
      a === null || Ee(a) || _n(a) ? t(a) : n(a)
    );
  }
  function i(a) {
    return a === null || a === 40 || a === 91 || Ee(a) || _n(a) ? t(a) : r(a);
  }
  function o(a) {
    return at(a) ? s(a) : n(a);
  }
  function s(a) {
    return a === 59 ? (e.consume(a), r) : at(a) ? (e.consume(a), s) : n(a);
  }
}
function sN(e, t, n) {
  return r;
  function r(o) {
    return e.consume(o), i;
  }
  function i(o) {
    return rt(o) ? n(o) : t(o);
  }
}
function eg(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || Ee(e);
}
function tg(e) {
  return !at(e);
}
function ng(e) {
  return !(e === 47 || ua(e));
}
function ua(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || rt(e);
}
function Ul(e) {
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
const aN = {
  tokenize: mN,
  partial: !0
};
function lN() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: fN,
        continuation: {
          tokenize: hN
        },
        exit: pN
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: dN
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: cN,
        resolveTo: uN
      }
    }
  };
}
function cN(e, t, n) {
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
    const c = Dt(r.sliceSerialize({
      start: s.end,
      end: r.now()
    }));
    return c.codePointAt(0) !== 94 || !o.includes(c.slice(1)) ? n(l) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(l), e.exit("gfmFootnoteCallLabelMarker"), t(l));
  }
}
function uN(e, t) {
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
function dN(e, t, n) {
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
      d === null || d === 91 || Ee(d)
    )
      return n(d);
    if (d === 93) {
      e.exit("chunkString");
      const h = e.exit("gfmFootnoteCallString");
      return i.includes(Dt(r.sliceSerialize(h))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), t) : n(d);
    }
    return Ee(d) || (s = !0), o++, e.consume(d), d === 92 ? u : c;
  }
  function u(d) {
    return d === 91 || d === 92 || d === 93 ? (e.consume(d), o++, c) : c(d);
  }
}
function fN(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o, s = 0, a;
  return l;
  function l(g) {
    return e.enter("gfmFootnoteDefinition")._container = !0, e.enter("gfmFootnoteDefinitionLabel"), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(g), e.exit("gfmFootnoteDefinitionLabelMarker"), c;
  }
  function c(g) {
    return g === 94 ? (e.enter("gfmFootnoteDefinitionMarker"), e.consume(g), e.exit("gfmFootnoteDefinitionMarker"), e.enter("gfmFootnoteDefinitionLabelString"), e.enter("chunkString").contentType = "string", u) : n(g);
  }
  function u(g) {
    if (
      // Too long.
      s > 999 || // Closing brace with nothing.
      g === 93 && !a || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      g === null || g === 91 || Ee(g)
    )
      return n(g);
    if (g === 93) {
      e.exit("chunkString");
      const m = e.exit("gfmFootnoteDefinitionLabelString");
      return o = Dt(r.sliceSerialize(m)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(g), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), h;
    }
    return Ee(g) || (a = !0), s++, e.consume(g), g === 92 ? d : u;
  }
  function d(g) {
    return g === 91 || g === 92 || g === 93 ? (e.consume(g), s++, u) : u(g);
  }
  function h(g) {
    return g === 58 ? (e.enter("definitionMarker"), e.consume(g), e.exit("definitionMarker"), i.includes(o) || i.push(o), xe(e, f, "gfmFootnoteDefinitionWhitespace")) : n(g);
  }
  function f(g) {
    return t(g);
  }
}
function hN(e, t, n) {
  return e.check(ai, t, e.attempt(aN, t, n));
}
function pN(e) {
  e.exit("gfmFootnoteDefinition");
}
function mN(e, t, n) {
  const r = this;
  return xe(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "gfmFootnoteDefinitionIndent" && s[2].sliceSerialize(s[1], !0).length === 4 ? t(o) : n(o);
  }
}
function gN(e) {
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
            f && vt(h, h.length, 0, No(f, s.slice(c + 1, l), a)), vt(h, h.length, 0, [["exit", d, a], ["enter", s[l][1], a], ["exit", s[l][1], a], ["exit", u, a]]), vt(s, c - 1, l - c + 3, h), l = c + h.length - 2;
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
    function h(g) {
      return c === 126 && u[u.length - 1][1].type !== "characterEscape" ? l(g) : (s.enter("strikethroughSequenceTemporary"), f(g));
    }
    function f(g) {
      const m = lr(c);
      if (g === 126)
        return d > 1 ? l(g) : (s.consume(g), d++, f);
      if (d < 2 && !n) return l(g);
      const b = s.exit("strikethroughSequenceTemporary"), v = lr(g);
      return b._open = !v || v === 2 && !!m, b._close = !m || m === 2 && !!v, a(g);
    }
  }
}
class yN {
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
    vN(this, t, n, r);
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
function vN(e, t, n, r) {
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
function bN(e, t) {
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
function xN() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: wN,
        resolveAll: SN
      }
    }
  };
}
function wN(e, t, n) {
  const r = this;
  let i = 0, o = 0, s;
  return a;
  function a(P) {
    let N = r.events.length - 1;
    for (; N > -1; ) {
      const $ = r.events[N][1].type;
      if ($ === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      $ === "linePrefix") N--;
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
    return P === null ? n(P) : J(P) ? o > 1 ? (o = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(P), e.exit("lineEnding"), f) : n(P) : ye(P) ? xe(e, u, "whitespace")(P) : (o += 1, s && (s = !1, i += 1), P === 124 ? (e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), s = !0, u) : (e.enter("data"), d(P)));
  }
  function d(P) {
    return P === null || P === 124 || Ee(P) ? (e.exit("data"), u(P)) : (e.consume(P), P === 92 ? h : d);
  }
  function h(P) {
    return P === 92 || P === 124 ? (e.consume(P), d) : d(P);
  }
  function f(P) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? n(P) : (e.enter("tableDelimiterRow"), s = !1, ye(P) ? xe(e, g, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(P) : g(P));
  }
  function g(P) {
    return P === 45 || P === 58 ? b(P) : P === 124 ? (s = !0, e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), m) : E(P);
  }
  function m(P) {
    return ye(P) ? xe(e, b, "whitespace")(P) : b(P);
  }
  function b(P) {
    return P === 58 ? (o += 1, s = !0, e.enter("tableDelimiterMarker"), e.consume(P), e.exit("tableDelimiterMarker"), v) : P === 45 ? (o += 1, v(P)) : P === null || J(P) ? T(P) : E(P);
  }
  function v(P) {
    return P === 45 ? (e.enter("tableDelimiterFiller"), x(P)) : E(P);
  }
  function x(P) {
    return P === 45 ? (e.consume(P), x) : P === 58 ? (s = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(P), e.exit("tableDelimiterMarker"), w) : (e.exit("tableDelimiterFiller"), w(P));
  }
  function w(P) {
    return ye(P) ? xe(e, T, "whitespace")(P) : T(P);
  }
  function T(P) {
    return P === 124 ? g(P) : P === null || J(P) ? !s || i !== o ? E(P) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), t(P)) : E(P);
  }
  function E(P) {
    return n(P);
  }
  function k(P) {
    return e.enter("tableRow"), A(P);
  }
  function A(P) {
    return P === 124 ? (e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), A) : P === null || J(P) ? (e.exit("tableRow"), t(P)) : ye(P) ? xe(e, A, "whitespace")(P) : (e.enter("data"), I(P));
  }
  function I(P) {
    return P === null || P === 124 || Ee(P) ? (e.exit("data"), A(P)) : (e.consume(P), P === 92 ? F : I);
  }
  function F(P) {
    return P === 92 || P === 124 ? (e.consume(P), I) : I(P);
  }
}
function SN(e, t) {
  let n = -1, r = !0, i = 0, o = [0, 0, 0, 0], s = [0, 0, 0, 0], a = !1, l = 0, c, u, d;
  const h = new yN();
  for (; ++n < e.length; ) {
    const f = e[n], g = f[1];
    f[0] === "enter" ? g.type === "tableHead" ? (a = !1, l !== 0 && (jd(h, t, l, c, u), u = void 0, l = 0), c = {
      type: "table",
      start: Object.assign({}, g.start),
      // Note: correct end is set later.
      end: Object.assign({}, g.end)
    }, h.add(n, 0, [["enter", c, t]])) : g.type === "tableRow" || g.type === "tableDelimiterRow" ? (r = !0, d = void 0, o = [0, 0, 0, 0], s = [0, n + 1, 0, 0], a && (a = !1, u = {
      type: "tableBody",
      start: Object.assign({}, g.start),
      // Note: correct end is set later.
      end: Object.assign({}, g.end)
    }, h.add(n, 0, [["enter", u, t]])), i = g.type === "tableDelimiterRow" ? 2 : u ? 3 : 1) : i && (g.type === "data" || g.type === "tableDelimiterMarker" || g.type === "tableDelimiterFiller") ? (r = !1, s[2] === 0 && (o[1] !== 0 && (s[0] = s[1], d = Ci(h, t, o, i, void 0, d), o = [0, 0, 0, 0]), s[2] = n)) : g.type === "tableCellDivider" && (r ? r = !1 : (o[1] !== 0 && (s[0] = s[1], d = Ci(h, t, o, i, void 0, d)), o = s, s = [o[1], n, 0, 0])) : g.type === "tableHead" ? (a = !0, l = n) : g.type === "tableRow" || g.type === "tableDelimiterRow" ? (l = n, o[1] !== 0 ? (s[0] = s[1], d = Ci(h, t, o, i, n, d)) : s[1] !== 0 && (d = Ci(h, t, s, i, n, d)), i = 0) : i && (g.type === "data" || g.type === "tableDelimiterMarker" || g.type === "tableDelimiterFiller") && (s[3] = n);
  }
  for (l !== 0 && jd(h, t, l, c, u), h.consume(t.events), n = -1; ++n < t.events.length; ) {
    const f = t.events[n];
    f[0] === "enter" && f[1].type === "table" && (f[1]._align = bN(t.events, n));
  }
  return e;
}
function Ci(e, t, n, r, i, o) {
  const s = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", a = "tableContent";
  n[0] !== 0 && (o.end = Object.assign({}, Yn(t.events, n[0])), e.add(n[0], 0, [["exit", o, t]]));
  const l = Yn(t.events, n[1]);
  if (o = {
    type: s,
    start: Object.assign({}, l),
    // Note: correct end is set later.
    end: Object.assign({}, l)
  }, e.add(n[1], 0, [["enter", o, t]]), n[2] !== 0) {
    const c = Yn(t.events, n[2]), u = Yn(t.events, n[3]), d = {
      type: a,
      start: Object.assign({}, c),
      end: Object.assign({}, u)
    };
    if (e.add(n[2], 0, [["enter", d, t]]), r !== 2) {
      const h = t.events[n[2]], f = t.events[n[3]];
      if (h[1].end = Object.assign({}, f[1].end), h[1].type = "chunkText", h[1].contentType = "text", n[3] > n[2] + 1) {
        const g = n[2] + 1, m = n[3] - n[2] - 1;
        e.add(g, m, []);
      }
    }
    e.add(n[3] + 1, 0, [["exit", d, t]]);
  }
  return i !== void 0 && (o.end = Object.assign({}, Yn(t.events, i)), e.add(i, 0, [["exit", o, t]]), o = void 0), o;
}
function jd(e, t, n, r, i) {
  const o = [], s = Yn(t.events, n);
  i && (i.end = Object.assign({}, s), o.push(["exit", i, t])), r.end = Object.assign({}, s), o.push(["exit", r, t]), e.add(n + 1, 0, o);
}
function Yn(e, t) {
  const n = e[t], r = n[0] === "enter" ? "start" : "end";
  return n[1][r];
}
const kN = {
  name: "tasklistCheck",
  tokenize: TN
};
function CN() {
  return {
    text: {
      91: kN
    }
  };
}
function TN(e, t, n) {
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
    return Ee(l) ? (e.enter("taskListCheckValueUnchecked"), e.consume(l), e.exit("taskListCheckValueUnchecked"), s) : l === 88 || l === 120 ? (e.enter("taskListCheckValueChecked"), e.consume(l), e.exit("taskListCheckValueChecked"), s) : n(l);
  }
  function s(l) {
    return l === 93 ? (e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), e.exit("taskListCheck"), a) : n(l);
  }
  function a(l) {
    return J(l) ? t(l) : ye(l) ? e.check({
      tokenize: EN
    }, t, n)(l) : n(l);
  }
}
function EN(e, t, n) {
  return xe(e, r, "whitespace");
  function r(i) {
    return i === null ? n(i) : t(i);
  }
}
function PN(e) {
  return fm([
    JR(),
    lN(),
    gN(e),
    xN(),
    CN()
  ]);
}
const AN = {};
function RN(e) {
  const t = (
    /** @type {Processor<Root>} */
    this
  ), n = e || AN, r = t.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), o = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), s = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(PN(n)), o.push(GR()), s.push(YR(n));
}
var NN = (e) => {
  switch (e) {
    case "success":
      return MN;
    case "info":
      return LN;
    case "warning":
      return ON;
    case "error":
      return _N;
    default:
      return null;
  }
}, IN = Array(12).fill(0), DN = ({ visible: e, className: t }) => j.createElement("div", { className: ["sonner-loading-wrapper", t].filter(Boolean).join(" "), "data-visible": e }, j.createElement("div", { className: "sonner-spinner" }, IN.map((n, r) => j.createElement("div", { className: "sonner-loading-bar", key: `spinner-bar-${r}` })))), MN = j.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, j.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })), ON = j.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", height: "20", width: "20" }, j.createElement("path", { fillRule: "evenodd", d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z", clipRule: "evenodd" })), LN = j.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, j.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z", clipRule: "evenodd" })), _N = j.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, j.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z", clipRule: "evenodd" })), FN = j.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, j.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), j.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })), VN = () => {
  let [e, t] = j.useState(document.hidden);
  return j.useEffect(() => {
    let n = () => {
      t(document.hidden);
    };
    return document.addEventListener("visibilitychange", n), () => window.removeEventListener("visibilitychange", n);
  }, []), e;
}, da = 1, BN = class {
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
      let { message: n, ...r } = e, i = typeof (e == null ? void 0 : e.id) == "number" || ((t = e.id) == null ? void 0 : t.length) > 0 ? e.id : da++, o = this.toasts.find((a) => a.id === i), s = e.dismissible === void 0 ? !0 : e.dismissible;
      return this.dismissedToasts.has(i) && this.dismissedToasts.delete(i), o ? this.toasts = this.toasts.map((a) => a.id === i ? (this.publish({ ...a, ...e, id: i, title: n }), { ...a, ...e, id: i, dismissible: s, title: n }) : a) : this.addToast({ title: n, ...r, dismissible: s, id: i }), i;
    }, this.dismiss = (e) => (this.dismissedToasts.add(e), e || this.toasts.forEach((t) => {
      this.subscribers.forEach((n) => n({ id: t.id, dismiss: !0 }));
    }), this.subscribers.forEach((t) => t({ id: e, dismiss: !0 })), e), this.message = (e, t) => this.create({ ...t, message: e }), this.error = (e, t) => this.create({ ...t, message: e, type: "error" }), this.success = (e, t) => this.create({ ...t, type: "success", message: e }), this.info = (e, t) => this.create({ ...t, type: "info", message: e }), this.warning = (e, t) => this.create({ ...t, type: "warning", message: e }), this.loading = (e, t) => this.create({ ...t, type: "loading", message: e }), this.promise = (e, t) => {
      if (!t) return;
      let n;
      t.loading !== void 0 && (n = this.create({ ...t, promise: e, type: "loading", message: t.loading, description: typeof t.description != "function" ? t.description : void 0 }));
      let r = e instanceof Promise ? e : e(), i = n !== void 0, o, s = r.then(async (l) => {
        if (o = ["resolve", l], j.isValidElement(l)) i = !1, this.create({ id: n, type: "default", message: l });
        else if ($N(l) && !l.ok) {
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
      let n = (t == null ? void 0 : t.id) || da++;
      return this.create({ jsx: e(n), id: n, ...t }), n;
    }, this.getActiveToasts = () => this.toasts.filter((e) => !this.dismissedToasts.has(e.id)), this.subscribers = [], this.toasts = [], this.dismissedToasts = /* @__PURE__ */ new Set();
  }
}, ut = new BN(), zN = (e, t) => {
  let n = (t == null ? void 0 : t.id) || da++;
  return ut.addToast({ title: e, ...t, id: n }), n;
}, $N = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", jN = zN, UN = () => ut.toasts, HN = () => ut.getActiveToasts(), Ud = Object.assign(jN, { success: ut.success, info: ut.info, warning: ut.warning, error: ut.error, custom: ut.custom, message: ut.message, promise: ut.promise, dismiss: ut.dismiss, loading: ut.loading }, { getHistory: UN, getToasts: HN });
function WN(e, { insertAt: t } = {}) {
  if (typeof document > "u") return;
  let n = document.head || document.getElementsByTagName("head")[0], r = document.createElement("style");
  r.type = "text/css", t === "top" && n.firstChild ? n.insertBefore(r, n.firstChild) : n.appendChild(r), r.styleSheet ? r.styleSheet.cssText = e : r.appendChild(document.createTextNode(e));
}
WN(`:where(html[dir="ltr"]),:where([data-sonner-toaster][dir="ltr"]){--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}:where(html[dir="rtl"]),:where([data-sonner-toaster][dir="rtl"]){--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999;transition:transform .4s ease}:where([data-sonner-toaster][data-lifted="true"]){transform:translateY(-10px)}@media (hover: none) and (pointer: coarse){:where([data-sonner-toaster][data-lifted="true"]){transform:none}}:where([data-sonner-toaster][data-x-position="right"]){right:var(--offset-right)}:where([data-sonner-toaster][data-x-position="left"]){left:var(--offset-left)}:where([data-sonner-toaster][data-x-position="center"]){left:50%;transform:translate(-50%)}:where([data-sonner-toaster][data-y-position="top"]){top:var(--offset-top)}:where([data-sonner-toaster][data-y-position="bottom"]){bottom:var(--offset-bottom)}:where([data-sonner-toast]){--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled="true"]){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast][data-y-position="top"]){top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position="bottom"]){bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise="true"]) :where([data-icon])>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px #0006}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0,0,0,.08)}:where([data-sonner-toast][data-theme="dark"]) :where([data-cancel]){background:rgba(255,255,255,.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]{background:var(--gray1)}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast]) :where([data-disabled="true"]){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping="true"]):before{content:"";position:absolute;left:-50%;right:-50%;height:100%;z-index:-1}:where([data-sonner-toast][data-y-position="top"][data-swiping="true"]):before{bottom:50%;transform:scaleY(3) translateY(50%)}:where([data-sonner-toast][data-y-position="bottom"][data-swiping="true"]):before{top:50%;transform:scaleY(3) translateY(-50%)}:where([data-sonner-toast][data-swiping="false"][data-removed="true"]):before{content:"";position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast]):after{content:"";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted="true"]){--y: translateY(0);opacity:1}:where([data-sonner-toast][data-expanded="false"][data-front="false"]){--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity .4s}:where([data-sonner-toast][data-expanded="false"][data-front="false"][data-styled="true"])>*{opacity:0}:where([data-sonner-toast][data-visible="false"]){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted="true"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where([data-sonner-toast][data-removed="true"][data-front="true"][data-swipe-out="false"]){--y: translateY(calc(var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]){--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}:where([data-sonner-toast][data-removed="true"][data-front="false"]):before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y, 0px)) translate(var(--swipe-amount-x, 0px));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-bg-hover: hsl(0, 0%, 12%);--normal-border: hsl(0, 0%, 20%);--normal-border-hover: hsl(0, 0%, 25%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success],[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info],[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning],[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error],[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
`);
function Ti(e) {
  return e.label !== void 0;
}
var qN = 3, KN = "32px", GN = "16px", Hd = 4e3, YN = 356, XN = 14, ZN = 20, JN = 200;
function Rt(...e) {
  return e.filter(Boolean).join(" ");
}
function QN(e) {
  let [t, n] = e.split("-"), r = [];
  return t && r.push(t), n && r.push(n), r;
}
var e2 = (e) => {
  var t, n, r, i, o, s, a, l, c, u, d;
  let { invert: h, toast: f, unstyled: g, interacting: m, setHeights: b, visibleToasts: v, heights: x, index: w, toasts: T, expanded: E, removeToast: k, defaultRichColors: A, closeButton: I, style: F, cancelButtonStyle: P, actionButtonStyle: N, className: R = "", descriptionClassName: B = "", duration: $, position: H, gap: V, loadingIcon: D, expandByDefault: _, classNames: L, icons: S, closeButtonAriaLabel: te = "Close toast", pauseWhenPageIsHidden: Z } = e, [C, q] = j.useState(null), [Y, se] = j.useState(null), [W, ie] = j.useState(!1), [me, le] = j.useState(!1), [ce, ge] = j.useState(!1), [Be, Xe] = j.useState(!1), [pt, lt] = j.useState(!1), [wt, qt] = j.useState(0), [mt, Sn] = j.useState(0), Kt = j.useRef(f.duration || $ || Hd), Hn = j.useRef(null), Et = j.useRef(null), Tr = w === 0, kn = w + 1 <= v, O = f.type, U = f.dismissible !== !1, re = f.className || "", he = f.descriptionClassName || "", ve = j.useMemo(() => x.findIndex((ee) => ee.toastId === f.id) || 0, [x, f.id]), ot = j.useMemo(() => {
    var ee;
    return (ee = f.closeButton) != null ? ee : I;
  }, [f.closeButton, I]), St = j.useMemo(() => f.duration || $ || Hd, [f.duration, $]), Ze = j.useRef(0), st = j.useRef(0), Pt = j.useRef(0), Oe = j.useRef(null), [At, G] = H.split("-"), ue = j.useMemo(() => x.reduce((ee, X, oe) => oe >= ve ? ee : ee + X.height, 0), [x, ve]), Ce = VN(), Re = f.invert || h, Ke = O === "loading";
  st.current = j.useMemo(() => ve * V + ue, [ve, ue]), j.useEffect(() => {
    Kt.current = St;
  }, [St]), j.useEffect(() => {
    ie(!0);
  }, []), j.useEffect(() => {
    let ee = Et.current;
    if (ee) {
      let X = ee.getBoundingClientRect().height;
      return Sn(X), b((oe) => [{ toastId: f.id, height: X, position: f.position }, ...oe]), () => b((oe) => oe.filter((Se) => Se.toastId !== f.id));
    }
  }, [b, f.id]), j.useLayoutEffect(() => {
    if (!W) return;
    let ee = Et.current, X = ee.style.height;
    ee.style.height = "auto";
    let oe = ee.getBoundingClientRect().height;
    ee.style.height = X, Sn(oe), b((Se) => Se.find((be) => be.toastId === f.id) ? Se.map((be) => be.toastId === f.id ? { ...be, height: oe } : be) : [{ toastId: f.id, height: oe, position: f.position }, ...Se]);
  }, [W, f.title, f.description, b, f.id]);
  let De = j.useCallback(() => {
    le(!0), qt(st.current), b((ee) => ee.filter((X) => X.toastId !== f.id)), setTimeout(() => {
      k(f);
    }, JN);
  }, [f, k, b, st]);
  j.useEffect(() => {
    if (f.promise && O === "loading" || f.duration === 1 / 0 || f.type === "loading") return;
    let ee;
    return E || m || Z && Ce ? (() => {
      if (Pt.current < Ze.current) {
        let X = (/* @__PURE__ */ new Date()).getTime() - Ze.current;
        Kt.current = Kt.current - X;
      }
      Pt.current = (/* @__PURE__ */ new Date()).getTime();
    })() : Kt.current !== 1 / 0 && (Ze.current = (/* @__PURE__ */ new Date()).getTime(), ee = setTimeout(() => {
      var X;
      (X = f.onAutoClose) == null || X.call(f, f), De();
    }, Kt.current)), () => clearTimeout(ee);
  }, [E, m, f, O, Z, Ce, De]), j.useEffect(() => {
    f.delete && De();
  }, [De, f.delete]);
  function Cn() {
    var ee, X, oe;
    return S != null && S.loading ? j.createElement("div", { className: Rt(L == null ? void 0 : L.loader, (ee = f == null ? void 0 : f.classNames) == null ? void 0 : ee.loader, "sonner-loader"), "data-visible": O === "loading" }, S.loading) : D ? j.createElement("div", { className: Rt(L == null ? void 0 : L.loader, (X = f == null ? void 0 : f.classNames) == null ? void 0 : X.loader, "sonner-loader"), "data-visible": O === "loading" }, D) : j.createElement(DN, { className: Rt(L == null ? void 0 : L.loader, (oe = f == null ? void 0 : f.classNames) == null ? void 0 : oe.loader), visible: O === "loading" });
  }
  return j.createElement("li", { tabIndex: 0, ref: Et, className: Rt(R, re, L == null ? void 0 : L.toast, (t = f == null ? void 0 : f.classNames) == null ? void 0 : t.toast, L == null ? void 0 : L.default, L == null ? void 0 : L[O], (n = f == null ? void 0 : f.classNames) == null ? void 0 : n[O]), "data-sonner-toast": "", "data-rich-colors": (r = f.richColors) != null ? r : A, "data-styled": !(f.jsx || f.unstyled || g), "data-mounted": W, "data-promise": !!f.promise, "data-swiped": pt, "data-removed": me, "data-visible": kn, "data-y-position": At, "data-x-position": G, "data-index": w, "data-front": Tr, "data-swiping": ce, "data-dismissible": U, "data-type": O, "data-invert": Re, "data-swipe-out": Be, "data-swipe-direction": Y, "data-expanded": !!(E || _ && W), style: { "--index": w, "--toasts-before": w, "--z-index": T.length - w, "--offset": `${me ? wt : st.current}px`, "--initial-height": _ ? "auto" : `${mt}px`, ...F, ...f.style }, onDragEnd: () => {
    ge(!1), q(null), Oe.current = null;
  }, onPointerDown: (ee) => {
    Ke || !U || (Hn.current = /* @__PURE__ */ new Date(), qt(st.current), ee.target.setPointerCapture(ee.pointerId), ee.target.tagName !== "BUTTON" && (ge(!0), Oe.current = { x: ee.clientX, y: ee.clientY }));
  }, onPointerUp: () => {
    var ee, X, oe, Se;
    if (Be || !U) return;
    Oe.current = null;
    let be = Number(((ee = Et.current) == null ? void 0 : ee.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0), Te = Number(((X = Et.current) == null ? void 0 : X.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0), ze = (/* @__PURE__ */ new Date()).getTime() - ((oe = Hn.current) == null ? void 0 : oe.getTime()), Fe = C === "x" ? be : Te, qe = Math.abs(Fe) / ze;
    if (Math.abs(Fe) >= ZN || qe > 0.11) {
      qt(st.current), (Se = f.onDismiss) == null || Se.call(f, f), se(C === "x" ? be > 0 ? "right" : "left" : Te > 0 ? "down" : "up"), De(), Xe(!0), lt(!1);
      return;
    }
    ge(!1), q(null);
  }, onPointerMove: (ee) => {
    var X, oe, Se, be;
    if (!Oe.current || !U || ((X = window.getSelection()) == null ? void 0 : X.toString().length) > 0) return;
    let Te = ee.clientY - Oe.current.y, ze = ee.clientX - Oe.current.x, Fe = (oe = e.swipeDirections) != null ? oe : QN(H);
    !C && (Math.abs(ze) > 1 || Math.abs(Te) > 1) && q(Math.abs(ze) > Math.abs(Te) ? "x" : "y");
    let qe = { x: 0, y: 0 };
    C === "y" ? (Fe.includes("top") || Fe.includes("bottom")) && (Fe.includes("top") && Te < 0 || Fe.includes("bottom") && Te > 0) && (qe.y = Te) : C === "x" && (Fe.includes("left") || Fe.includes("right")) && (Fe.includes("left") && ze < 0 || Fe.includes("right") && ze > 0) && (qe.x = ze), (Math.abs(qe.x) > 0 || Math.abs(qe.y) > 0) && lt(!0), (Se = Et.current) == null || Se.style.setProperty("--swipe-amount-x", `${qe.x}px`), (be = Et.current) == null || be.style.setProperty("--swipe-amount-y", `${qe.y}px`);
  } }, ot && !f.jsx ? j.createElement("button", { "aria-label": te, "data-disabled": Ke, "data-close-button": !0, onClick: Ke || !U ? () => {
  } : () => {
    var ee;
    De(), (ee = f.onDismiss) == null || ee.call(f, f);
  }, className: Rt(L == null ? void 0 : L.closeButton, (i = f == null ? void 0 : f.classNames) == null ? void 0 : i.closeButton) }, (o = S == null ? void 0 : S.close) != null ? o : FN) : null, f.jsx || Pi(f.title) ? f.jsx ? f.jsx : typeof f.title == "function" ? f.title() : f.title : j.createElement(j.Fragment, null, O || f.icon || f.promise ? j.createElement("div", { "data-icon": "", className: Rt(L == null ? void 0 : L.icon, (s = f == null ? void 0 : f.classNames) == null ? void 0 : s.icon) }, f.promise || f.type === "loading" && !f.icon ? f.icon || Cn() : null, f.type !== "loading" ? f.icon || (S == null ? void 0 : S[O]) || NN(O) : null) : null, j.createElement("div", { "data-content": "", className: Rt(L == null ? void 0 : L.content, (a = f == null ? void 0 : f.classNames) == null ? void 0 : a.content) }, j.createElement("div", { "data-title": "", className: Rt(L == null ? void 0 : L.title, (l = f == null ? void 0 : f.classNames) == null ? void 0 : l.title) }, typeof f.title == "function" ? f.title() : f.title), f.description ? j.createElement("div", { "data-description": "", className: Rt(B, he, L == null ? void 0 : L.description, (c = f == null ? void 0 : f.classNames) == null ? void 0 : c.description) }, typeof f.description == "function" ? f.description() : f.description) : null), Pi(f.cancel) ? f.cancel : f.cancel && Ti(f.cancel) ? j.createElement("button", { "data-button": !0, "data-cancel": !0, style: f.cancelButtonStyle || P, onClick: (ee) => {
    var X, oe;
    Ti(f.cancel) && U && ((oe = (X = f.cancel).onClick) == null || oe.call(X, ee), De());
  }, className: Rt(L == null ? void 0 : L.cancelButton, (u = f == null ? void 0 : f.classNames) == null ? void 0 : u.cancelButton) }, f.cancel.label) : null, Pi(f.action) ? f.action : f.action && Ti(f.action) ? j.createElement("button", { "data-button": !0, "data-action": !0, style: f.actionButtonStyle || N, onClick: (ee) => {
    var X, oe;
    Ti(f.action) && ((oe = (X = f.action).onClick) == null || oe.call(X, ee), !ee.defaultPrevented && De());
  }, className: Rt(L == null ? void 0 : L.actionButton, (d = f == null ? void 0 : f.classNames) == null ? void 0 : d.actionButton) }, f.action.label) : null));
};
function Wd() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  let e = document.documentElement.getAttribute("dir");
  return e === "auto" || !e ? window.getComputedStyle(document.documentElement).direction : e;
}
function t2(e, t) {
  let n = {};
  return [e, t].forEach((r, i) => {
    let o = i === 1, s = o ? "--mobile-offset" : "--offset", a = o ? GN : KN;
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
fr(function(e, t) {
  let { invert: n, position: r = "bottom-right", hotkey: i = ["altKey", "KeyT"], expand: o, closeButton: s, className: a, offset: l, mobileOffset: c, theme: u = "light", richColors: d, duration: h, style: f, visibleToasts: g = qN, toastOptions: m, dir: b = Wd(), gap: v = XN, loadingIcon: x, icons: w, containerAriaLabel: T = "Notifications", pauseWhenPageIsHidden: E } = e, [k, A] = j.useState([]), I = j.useMemo(() => Array.from(new Set([r].concat(k.filter((Z) => Z.position).map((Z) => Z.position)))), [k, r]), [F, P] = j.useState([]), [N, R] = j.useState(!1), [B, $] = j.useState(!1), [H, V] = j.useState(u !== "system" ? u : typeof window < "u" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), D = j.useRef(null), _ = i.join("+").replace(/Key/g, "").replace(/Digit/g, ""), L = j.useRef(null), S = j.useRef(!1), te = j.useCallback((Z) => {
    A((C) => {
      var q;
      return (q = C.find((Y) => Y.id === Z.id)) != null && q.delete || ut.dismiss(Z.id), C.filter(({ id: Y }) => Y !== Z.id);
    });
  }, []);
  return j.useEffect(() => ut.subscribe((Z) => {
    if (Z.dismiss) {
      A((C) => C.map((q) => q.id === Z.id ? { ...q, delete: !0 } : q));
      return;
    }
    setTimeout(() => {
      vf.flushSync(() => {
        A((C) => {
          let q = C.findIndex((Y) => Y.id === Z.id);
          return q !== -1 ? [...C.slice(0, q), { ...C[q], ...Z }, ...C.slice(q + 1)] : [Z, ...C];
        });
      });
    });
  }), []), j.useEffect(() => {
    if (u !== "system") {
      V(u);
      return;
    }
    if (u === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? V("dark") : V("light")), typeof window > "u") return;
    let Z = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      Z.addEventListener("change", ({ matches: C }) => {
        V(C ? "dark" : "light");
      });
    } catch {
      Z.addListener(({ matches: q }) => {
        try {
          V(q ? "dark" : "light");
        } catch (Y) {
          console.error(Y);
        }
      });
    }
  }, [u]), j.useEffect(() => {
    k.length <= 1 && R(!1);
  }, [k]), j.useEffect(() => {
    let Z = (C) => {
      var q, Y;
      i.every((se) => C[se] || C.code === se) && (R(!0), (q = D.current) == null || q.focus()), C.code === "Escape" && (document.activeElement === D.current || (Y = D.current) != null && Y.contains(document.activeElement)) && R(!1);
    };
    return document.addEventListener("keydown", Z), () => document.removeEventListener("keydown", Z);
  }, [i]), j.useEffect(() => {
    if (D.current) return () => {
      L.current && (L.current.focus({ preventScroll: !0 }), L.current = null, S.current = !1);
    };
  }, [D.current]), j.createElement("section", { ref: t, "aria-label": `${T} ${_}`, tabIndex: -1, "aria-live": "polite", "aria-relevant": "additions text", "aria-atomic": "false", suppressHydrationWarning: !0 }, I.map((Z, C) => {
    var q;
    let [Y, se] = Z.split("-");
    return k.length ? j.createElement("ol", { key: Z, dir: b === "auto" ? Wd() : b, tabIndex: -1, ref: D, className: a, "data-sonner-toaster": !0, "data-theme": H, "data-y-position": Y, "data-lifted": N && k.length > 1 && !o, "data-x-position": se, style: { "--front-toast-height": `${((q = F[0]) == null ? void 0 : q.height) || 0}px`, "--width": `${YN}px`, "--gap": `${v}px`, ...f, ...t2(l, c) }, onBlur: (W) => {
      S.current && !W.currentTarget.contains(W.relatedTarget) && (S.current = !1, L.current && (L.current.focus({ preventScroll: !0 }), L.current = null));
    }, onFocus: (W) => {
      W.target instanceof HTMLElement && W.target.dataset.dismissible === "false" || S.current || (S.current = !0, L.current = W.relatedTarget);
    }, onMouseEnter: () => R(!0), onMouseMove: () => R(!0), onMouseLeave: () => {
      B || R(!1);
    }, onDragEnd: () => R(!1), onPointerDown: (W) => {
      W.target instanceof HTMLElement && W.target.dataset.dismissible === "false" || $(!0);
    }, onPointerUp: () => $(!1) }, k.filter((W) => !W.position && C === 0 || W.position === Z).map((W, ie) => {
      var me, le;
      return j.createElement(e2, { key: W.id, icons: w, index: ie, toast: W, defaultRichColors: d, duration: (me = m == null ? void 0 : m.duration) != null ? me : h, className: m == null ? void 0 : m.className, descriptionClassName: m == null ? void 0 : m.descriptionClassName, invert: n, visibleToasts: g, closeButton: (le = m == null ? void 0 : m.closeButton) != null ? le : s, interacting: B, position: Z, style: m == null ? void 0 : m.style, unstyled: m == null ? void 0 : m.unstyled, classNames: m == null ? void 0 : m.classNames, cancelButtonStyle: m == null ? void 0 : m.cancelButtonStyle, actionButtonStyle: m == null ? void 0 : m.actionButtonStyle, removeToast: te, toasts: k.filter((ce) => ce.position == W.position), heights: F.filter((ce) => ce.position == W.position), setHeights: P, expandByDefault: o, gap: v, loadingIcon: x, expanded: N, pauseWhenPageIsHidden: E, swipeDirections: e.swipeDirections });
    })) : null;
  }));
});
function n2({
  text: e,
  copyMessage: t = "Copied to clipboard!"
}) {
  const [n, r] = ne(!1), i = Me(null), o = He(() => {
    navigator.clipboard.writeText(e).then(() => {
      Ud.success(t), r(!0), i.current && (clearTimeout(i.current), i.current = null), i.current = setTimeout(() => {
        r(!1);
      }, 2e3);
    }).catch(() => {
      Ud.error("Failed to copy to clipboard.");
    });
  }, [e, t]);
  return { isCopied: n, handleCopy: o };
}
function Qi({ content: e, copyMessage: t }) {
  const { isCopied: n, handleCopy: r } = n2({
    text: e,
    copyMessage: t
  });
  return /* @__PURE__ */ M(
    We,
    {
      variant: "ghost",
      size: "icon",
      className: "relative h-6 w-6",
      "aria-label": "Copy to clipboard",
      onClick: r,
      children: [
        /* @__PURE__ */ p("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ p(
          xf,
          {
            className: K(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-100" : "scale-0"
            )
          }
        ) }),
        /* @__PURE__ */ p(
          bv,
          {
            className: K(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-0" : "scale-100"
            )
          }
        )
      ]
    }
  );
}
const r2 = ["top", "right", "bottom", "left"], mn = Math.min, yt = Math.max, eo = Math.round, Ei = Math.floor, jt = (e) => ({
  x: e,
  y: e
}), i2 = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, o2 = {
  start: "end",
  end: "start"
};
function fa(e, t, n) {
  return yt(e, mn(t, n));
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
function Hl(e) {
  return e === "x" ? "y" : "x";
}
function Wl(e) {
  return e === "y" ? "height" : "width";
}
const s2 = /* @__PURE__ */ new Set(["top", "bottom"]);
function Vt(e) {
  return s2.has(en(e)) ? "y" : "x";
}
function ql(e) {
  return Hl(Vt(e));
}
function a2(e, t, n) {
  n === void 0 && (n = !1);
  const r = xr(e), i = ql(e), o = Wl(i);
  let s = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[o] > t.floating[o] && (s = to(s)), [s, to(s)];
}
function l2(e) {
  const t = to(e);
  return [ha(e), t, ha(t)];
}
function ha(e) {
  return e.replace(/start|end/g, (t) => o2[t]);
}
const qd = ["left", "right"], Kd = ["right", "left"], c2 = ["top", "bottom"], u2 = ["bottom", "top"];
function d2(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Kd : qd : t ? qd : Kd;
    case "left":
    case "right":
      return t ? c2 : u2;
    default:
      return [];
  }
}
function f2(e, t, n, r) {
  const i = xr(e);
  let o = d2(en(e), n === "start", r);
  return i && (o = o.map((s) => s + "-" + i), t && (o = o.concat(o.map(ha)))), o;
}
function to(e) {
  return e.replace(/left|right|bottom|top/g, (t) => i2[t]);
}
function h2(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function rg(e) {
  return typeof e != "number" ? h2(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function no(e) {
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
function Gd(e, t, n) {
  let {
    reference: r,
    floating: i
  } = e;
  const o = Vt(t), s = ql(t), a = Wl(s), l = en(t), c = o === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, h = r[a] / 2 - i[a] / 2;
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
const p2 = async (e, t, n) => {
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
  } = Gd(c, r, l), h = r, f = {}, g = 0;
  for (let m = 0; m < a.length; m++) {
    const {
      name: b,
      fn: v
    } = a[m], {
      x,
      y: w,
      data: T,
      reset: E
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
        ...T
      }
    }, E && g <= 50 && (g++, typeof E == "object" && (E.placement && (h = E.placement), E.rects && (c = E.rects === !0 ? await s.getElementRects({
      reference: e,
      floating: t,
      strategy: i
    }) : E.rects), {
      x: u,
      y: d
    } = Gd(c, h, l)), m = -1);
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
  } = Qt(t, e), g = rg(f), b = a[h ? d === "floating" ? "reference" : "floating" : d], v = no(await o.getClippingRect({
    element: (n = await (o.isElement == null ? void 0 : o.isElement(b))) == null || n ? b : b.contextElement || await (o.getDocumentElement == null ? void 0 : o.getDocumentElement(a.floating)),
    boundary: c,
    rootBoundary: u,
    strategy: l
  })), x = d === "floating" ? {
    x: r,
    y: i,
    width: s.floating.width,
    height: s.floating.height
  } : s.reference, w = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(a.floating)), T = await (o.isElement == null ? void 0 : o.isElement(w)) ? await (o.getScale == null ? void 0 : o.getScale(w)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, E = no(o.convertOffsetParentRelativeRectToViewportRelativeRect ? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: a,
    rect: x,
    offsetParent: w,
    strategy: l
  }) : x);
  return {
    top: (v.top - E.top + g.top) / T.y,
    bottom: (E.bottom - v.bottom + g.bottom) / T.y,
    left: (v.left - E.left + g.left) / T.x,
    right: (E.right - v.right + g.right) / T.x
  };
}
const m2 = (e) => ({
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
    const d = rg(u), h = {
      x: n,
      y: r
    }, f = ql(i), g = Wl(f), m = await s.getDimensions(c), b = f === "y", v = b ? "top" : "left", x = b ? "bottom" : "right", w = b ? "clientHeight" : "clientWidth", T = o.reference[g] + o.reference[f] - h[f] - o.floating[g], E = h[f] - o.reference[f], k = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c));
    let A = k ? k[w] : 0;
    (!A || !await (s.isElement == null ? void 0 : s.isElement(k))) && (A = a.floating[w] || o.floating[g]);
    const I = T / 2 - E / 2, F = A / 2 - m[g] / 2 - 1, P = mn(d[v], F), N = mn(d[x], F), R = P, B = A - m[g] - N, $ = A / 2 - m[g] / 2 + I, H = fa(R, $, B), V = !l.arrow && xr(i) != null && $ !== H && o.reference[g] / 2 - ($ < R ? P : N) - m[g] / 2 < 0, D = V ? $ < R ? $ - R : $ - B : 0;
    return {
      [f]: h[f] + D,
      data: {
        [f]: H,
        centerOffset: $ - H - D,
        ...V && {
          alignmentOffset: D
        }
      },
      reset: V
    };
  }
}), g2 = function(e) {
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
        fallbackAxisSideDirection: g = "none",
        flipAlignment: m = !0,
        ...b
      } = Qt(e, t);
      if ((n = o.arrow) != null && n.alignmentOffset)
        return {};
      const v = en(i), x = Vt(a), w = en(a) === a, T = await (l.isRTL == null ? void 0 : l.isRTL(c.floating)), E = h || (w || !m ? [to(a)] : l2(a)), k = g !== "none";
      !h && k && E.push(...f2(a, m, g, T));
      const A = [a, ...E], I = await Yr(t, b), F = [];
      let P = ((r = o.flip) == null ? void 0 : r.overflows) || [];
      if (u && F.push(I[v]), d) {
        const $ = a2(i, s, T);
        F.push(I[$[0]], I[$[1]]);
      }
      if (P = [...P, {
        placement: i,
        overflows: F
      }], !F.every(($) => $ <= 0)) {
        var N, R;
        const $ = (((N = o.flip) == null ? void 0 : N.index) || 0) + 1, H = A[$];
        if (H && (!(d === "alignment" ? x !== Vt(H) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        P.every((_) => Vt(_.placement) === x ? _.overflows[0] > 0 : !0)))
          return {
            data: {
              index: $,
              overflows: P
            },
            reset: {
              placement: H
            }
          };
        let V = (R = P.filter((D) => D.overflows[0] <= 0).sort((D, _) => D.overflows[1] - _.overflows[1])[0]) == null ? void 0 : R.placement;
        if (!V)
          switch (f) {
            case "bestFit": {
              var B;
              const D = (B = P.filter((_) => {
                if (k) {
                  const L = Vt(_.placement);
                  return L === x || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  L === "y";
                }
                return !0;
              }).map((_) => [_.placement, _.overflows.filter((L) => L > 0).reduce((L, S) => L + S, 0)]).sort((_, L) => _[1] - L[1])[0]) == null ? void 0 : B[0];
              D && (V = D);
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
function Yd(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Xd(e) {
  return r2.some((t) => e[t] >= 0);
}
const y2 = function(e) {
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
          }), s = Yd(o, n.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: Xd(s)
            }
          };
        }
        case "escaped": {
          const o = await Yr(t, {
            ...i,
            altBoundary: !0
          }), s = Yd(o, n.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: Xd(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, ig = /* @__PURE__ */ new Set(["left", "top"]);
async function v2(e, t) {
  const {
    placement: n,
    platform: r,
    elements: i
  } = e, o = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), s = en(n), a = xr(n), l = Vt(n) === "y", c = ig.has(s) ? -1 : 1, u = o && l ? -1 : 1, d = Qt(t, e);
  let {
    mainAxis: h,
    crossAxis: f,
    alignmentAxis: g
  } = typeof d == "number" ? {
    mainAxis: d,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: d.mainAxis || 0,
    crossAxis: d.crossAxis || 0,
    alignmentAxis: d.alignmentAxis
  };
  return a && typeof g == "number" && (f = a === "end" ? g * -1 : g), l ? {
    x: f * u,
    y: h * c
  } : {
    x: h * c,
    y: f * u
  };
}
const b2 = function(e) {
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
      } = t, l = await v2(t, e);
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
}, x2 = function(e) {
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
      }, u = await Yr(t, l), d = Vt(en(i)), h = Hl(d);
      let f = c[h], g = c[d];
      if (o) {
        const b = h === "y" ? "top" : "left", v = h === "y" ? "bottom" : "right", x = f + u[b], w = f - u[v];
        f = fa(x, f, w);
      }
      if (s) {
        const b = d === "y" ? "top" : "left", v = d === "y" ? "bottom" : "right", x = g + u[b], w = g - u[v];
        g = fa(x, g, w);
      }
      const m = a.fn({
        ...t,
        [h]: f,
        [d]: g
      });
      return {
        ...m,
        data: {
          x: m.x - n,
          y: m.y - r,
          enabled: {
            [h]: o,
            [d]: s
          }
        }
      };
    }
  };
}, w2 = function(e) {
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
      }, d = Vt(i), h = Hl(d);
      let f = u[h], g = u[d];
      const m = Qt(a, t), b = typeof m == "number" ? {
        mainAxis: m,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...m
      };
      if (l) {
        const w = h === "y" ? "height" : "width", T = o.reference[h] - o.floating[w] + b.mainAxis, E = o.reference[h] + o.reference[w] - b.mainAxis;
        f < T ? f = T : f > E && (f = E);
      }
      if (c) {
        var v, x;
        const w = h === "y" ? "width" : "height", T = ig.has(en(i)), E = o.reference[d] - o.floating[w] + (T && ((v = s.offset) == null ? void 0 : v[d]) || 0) + (T ? 0 : b.crossAxis), k = o.reference[d] + o.reference[w] + (T ? 0 : ((x = s.offset) == null ? void 0 : x[d]) || 0) - (T ? b.crossAxis : 0);
        g < E ? g = E : g > k && (g = k);
      }
      return {
        [h]: f,
        [d]: g
      };
    }
  };
}, S2 = function(e) {
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
      } = Qt(e, t), u = await Yr(t, c), d = en(i), h = xr(i), f = Vt(i) === "y", {
        width: g,
        height: m
      } = o.floating;
      let b, v;
      d === "top" || d === "bottom" ? (b = d, v = h === (await (s.isRTL == null ? void 0 : s.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (v = d, b = h === "end" ? "top" : "bottom");
      const x = m - u.top - u.bottom, w = g - u.left - u.right, T = mn(m - u[b], x), E = mn(g - u[v], w), k = !t.middlewareData.shift;
      let A = T, I = E;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (I = w), (r = t.middlewareData.shift) != null && r.enabled.y && (A = x), k && !h) {
        const P = yt(u.left, 0), N = yt(u.right, 0), R = yt(u.top, 0), B = yt(u.bottom, 0);
        f ? I = g - 2 * (P !== 0 || N !== 0 ? P + N : yt(u.left, u.right)) : A = m - 2 * (R !== 0 || B !== 0 ? R + B : yt(u.top, u.bottom));
      }
      await l({
        ...t,
        availableWidth: I,
        availableHeight: A
      });
      const F = await s.getDimensions(a.floating);
      return g !== F.width || m !== F.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Oo() {
  return typeof window < "u";
}
function wr(e) {
  return og(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function bt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Wt(e) {
  var t;
  return (t = (og(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function og(e) {
  return Oo() ? e instanceof Node || e instanceof bt(e).Node : !1;
}
function Mt(e) {
  return Oo() ? e instanceof Element || e instanceof bt(e).Element : !1;
}
function Ut(e) {
  return Oo() ? e instanceof HTMLElement || e instanceof bt(e).HTMLElement : !1;
}
function Zd(e) {
  return !Oo() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof bt(e).ShadowRoot;
}
const k2 = /* @__PURE__ */ new Set(["inline", "contents"]);
function ci(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: i
  } = Ot(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !k2.has(i);
}
const C2 = /* @__PURE__ */ new Set(["table", "td", "th"]);
function T2(e) {
  return C2.has(wr(e));
}
const E2 = [":popover-open", ":modal"];
function Lo(e) {
  return E2.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
const P2 = ["transform", "translate", "scale", "rotate", "perspective"], A2 = ["transform", "translate", "scale", "rotate", "perspective", "filter"], R2 = ["paint", "layout", "strict", "content"];
function Kl(e) {
  const t = Gl(), n = Mt(e) ? Ot(e) : e;
  return P2.some((r) => n[r] ? n[r] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || A2.some((r) => (n.willChange || "").includes(r)) || R2.some((r) => (n.contain || "").includes(r));
}
function N2(e) {
  let t = gn(e);
  for (; Ut(t) && !cr(t); ) {
    if (Kl(t))
      return t;
    if (Lo(t))
      return null;
    t = gn(t);
  }
  return null;
}
function Gl() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
const I2 = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function cr(e) {
  return I2.has(wr(e));
}
function Ot(e) {
  return bt(e).getComputedStyle(e);
}
function _o(e) {
  return Mt(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function gn(e) {
  if (wr(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Zd(e) && e.host || // Fallback.
    Wt(e)
  );
  return Zd(t) ? t.host : t;
}
function sg(e) {
  const t = gn(e);
  return cr(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Ut(t) && ci(t) ? t : sg(t);
}
function Xr(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const i = sg(e), o = i === ((r = e.ownerDocument) == null ? void 0 : r.body), s = bt(i);
  if (o) {
    const a = pa(s);
    return t.concat(s, s.visualViewport || [], ci(i) ? i : [], a && n ? Xr(a) : []);
  }
  return t.concat(i, Xr(i, [], n));
}
function pa(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function ag(e) {
  const t = Ot(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const i = Ut(e), o = i ? e.offsetWidth : n, s = i ? e.offsetHeight : r, a = eo(n) !== o || eo(r) !== s;
  return a && (n = o, r = s), {
    width: n,
    height: r,
    $: a
  };
}
function Yl(e) {
  return Mt(e) ? e : e.contextElement;
}
function ir(e) {
  const t = Yl(e);
  if (!Ut(t))
    return jt(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: i,
    $: o
  } = ag(t);
  let s = (o ? eo(n.width) : n.width) / r, a = (o ? eo(n.height) : n.height) / i;
  return (!s || !Number.isFinite(s)) && (s = 1), (!a || !Number.isFinite(a)) && (a = 1), {
    x: s,
    y: a
  };
}
const D2 = /* @__PURE__ */ jt(0);
function lg(e) {
  const t = bt(e);
  return !Gl() || !t.visualViewport ? D2 : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function M2(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== bt(e) ? !1 : t;
}
function Fn(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const i = e.getBoundingClientRect(), o = Yl(e);
  let s = jt(1);
  t && (r ? Mt(r) && (s = ir(r)) : s = ir(e));
  const a = M2(o, n, r) ? lg(o) : jt(0);
  let l = (i.left + a.x) / s.x, c = (i.top + a.y) / s.y, u = i.width / s.x, d = i.height / s.y;
  if (o) {
    const h = bt(o), f = r && Mt(r) ? bt(r) : r;
    let g = h, m = pa(g);
    for (; m && r && f !== g; ) {
      const b = ir(m), v = m.getBoundingClientRect(), x = Ot(m), w = v.left + (m.clientLeft + parseFloat(x.paddingLeft)) * b.x, T = v.top + (m.clientTop + parseFloat(x.paddingTop)) * b.y;
      l *= b.x, c *= b.y, u *= b.x, d *= b.y, l += w, c += T, g = bt(m), m = pa(g);
    }
  }
  return no({
    width: u,
    height: d,
    x: l,
    y: c
  });
}
function Fo(e, t) {
  const n = _o(e).scrollLeft;
  return t ? t.left + n : Fn(Wt(e)).left + n;
}
function cg(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - Fo(e, n), i = n.top + t.scrollTop;
  return {
    x: r,
    y: i
  };
}
function O2(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: i
  } = e;
  const o = i === "fixed", s = Wt(r), a = t ? Lo(t.floating) : !1;
  if (r === s || a && o)
    return n;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = jt(1);
  const u = jt(0), d = Ut(r);
  if ((d || !d && !o) && ((wr(r) !== "body" || ci(s)) && (l = _o(r)), Ut(r))) {
    const f = Fn(r);
    c = ir(r), u.x = f.x + r.clientLeft, u.y = f.y + r.clientTop;
  }
  const h = s && !d && !o ? cg(s, l) : jt(0);
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - l.scrollLeft * c.x + u.x + h.x,
    y: n.y * c.y - l.scrollTop * c.y + u.y + h.y
  };
}
function L2(e) {
  return Array.from(e.getClientRects());
}
function _2(e) {
  const t = Wt(e), n = _o(e), r = e.ownerDocument.body, i = yt(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), o = yt(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + Fo(e);
  const a = -n.scrollTop;
  return Ot(r).direction === "rtl" && (s += yt(t.clientWidth, r.clientWidth) - i), {
    width: i,
    height: o,
    x: s,
    y: a
  };
}
const Jd = 25;
function F2(e, t) {
  const n = bt(e), r = Wt(e), i = n.visualViewport;
  let o = r.clientWidth, s = r.clientHeight, a = 0, l = 0;
  if (i) {
    o = i.width, s = i.height;
    const u = Gl();
    (!u || u && t === "fixed") && (a = i.offsetLeft, l = i.offsetTop);
  }
  const c = Fo(r);
  if (c <= 0) {
    const u = r.ownerDocument, d = u.body, h = getComputedStyle(d), f = u.compatMode === "CSS1Compat" && parseFloat(h.marginLeft) + parseFloat(h.marginRight) || 0, g = Math.abs(r.clientWidth - d.clientWidth - f);
    g <= Jd && (o -= g);
  } else c <= Jd && (o += c);
  return {
    width: o,
    height: s,
    x: a,
    y: l
  };
}
const V2 = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function B2(e, t) {
  const n = Fn(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, o = Ut(e) ? ir(e) : jt(1), s = e.clientWidth * o.x, a = e.clientHeight * o.y, l = i * o.x, c = r * o.y;
  return {
    width: s,
    height: a,
    x: l,
    y: c
  };
}
function Qd(e, t, n) {
  let r;
  if (t === "viewport")
    r = F2(e, n);
  else if (t === "document")
    r = _2(Wt(e));
  else if (Mt(t))
    r = B2(t, n);
  else {
    const i = lg(e);
    r = {
      x: t.x - i.x,
      y: t.y - i.y,
      width: t.width,
      height: t.height
    };
  }
  return no(r);
}
function ug(e, t) {
  const n = gn(e);
  return n === t || !Mt(n) || cr(n) ? !1 : Ot(n).position === "fixed" || ug(n, t);
}
function z2(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = Xr(e, [], !1).filter((a) => Mt(a) && wr(a) !== "body"), i = null;
  const o = Ot(e).position === "fixed";
  let s = o ? gn(e) : e;
  for (; Mt(s) && !cr(s); ) {
    const a = Ot(s), l = Kl(s);
    !l && a.position === "fixed" && (i = null), (o ? !l && !i : !l && a.position === "static" && !!i && V2.has(i.position) || ci(s) && !l && ug(e, s)) ? r = r.filter((u) => u !== s) : i = a, s = gn(s);
  }
  return t.set(e, r), r;
}
function $2(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: i
  } = e;
  const s = [...n === "clippingAncestors" ? Lo(t) ? [] : z2(t, this._c) : [].concat(n), r], a = s[0], l = s.reduce((c, u) => {
    const d = Qd(t, u, i);
    return c.top = yt(d.top, c.top), c.right = mn(d.right, c.right), c.bottom = mn(d.bottom, c.bottom), c.left = yt(d.left, c.left), c;
  }, Qd(t, a, i));
  return {
    width: l.right - l.left,
    height: l.bottom - l.top,
    x: l.left,
    y: l.top
  };
}
function j2(e) {
  const {
    width: t,
    height: n
  } = ag(e);
  return {
    width: t,
    height: n
  };
}
function U2(e, t, n) {
  const r = Ut(t), i = Wt(t), o = n === "fixed", s = Fn(e, !0, o, t);
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = jt(0);
  function c() {
    l.x = Fo(i);
  }
  if (r || !r && !o)
    if ((wr(t) !== "body" || ci(i)) && (a = _o(t)), r) {
      const f = Fn(t, !0, o, t);
      l.x = f.x + t.clientLeft, l.y = f.y + t.clientTop;
    } else i && c();
  o && !r && i && c();
  const u = i && !r && !o ? cg(i, a) : jt(0), d = s.left + a.scrollLeft - l.x - u.x, h = s.top + a.scrollTop - l.y - u.y;
  return {
    x: d,
    y: h,
    width: s.width,
    height: s.height
  };
}
function Is(e) {
  return Ot(e).position === "static";
}
function ef(e, t) {
  if (!Ut(e) || Ot(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Wt(e) === n && (n = n.ownerDocument.body), n;
}
function dg(e, t) {
  const n = bt(e);
  if (Lo(e))
    return n;
  if (!Ut(e)) {
    let i = gn(e);
    for (; i && !cr(i); ) {
      if (Mt(i) && !Is(i))
        return i;
      i = gn(i);
    }
    return n;
  }
  let r = ef(e, t);
  for (; r && T2(r) && Is(r); )
    r = ef(r, t);
  return r && cr(r) && Is(r) && !Kl(r) ? n : r || N2(e) || n;
}
const H2 = async function(e) {
  const t = this.getOffsetParent || dg, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: U2(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function W2(e) {
  return Ot(e).direction === "rtl";
}
const q2 = {
  convertOffsetParentRelativeRectToViewportRelativeRect: O2,
  getDocumentElement: Wt,
  getClippingRect: $2,
  getOffsetParent: dg,
  getElementRects: H2,
  getClientRects: L2,
  getDimensions: j2,
  getScale: ir,
  isElement: Mt,
  isRTL: W2
};
function fg(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function K2(e, t) {
  let n = null, r;
  const i = Wt(e);
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
    const g = Ei(d), m = Ei(i.clientWidth - (u + h)), b = Ei(i.clientHeight - (d + f)), v = Ei(u), w = {
      rootMargin: -g + "px " + -m + "px " + -b + "px " + -v + "px",
      threshold: yt(0, mn(1, l)) || 1
    };
    let T = !0;
    function E(k) {
      const A = k[0].intersectionRatio;
      if (A !== l) {
        if (!T)
          return s();
        A ? s(!1, A) : r = setTimeout(() => {
          s(!1, 1e-7);
        }, 1e3);
      }
      A === 1 && !fg(c, e.getBoundingClientRect()) && s(), T = !1;
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
function G2(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: i = !0,
    ancestorResize: o = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: a = typeof IntersectionObserver == "function",
    animationFrame: l = !1
  } = r, c = Yl(e), u = i || o ? [...c ? Xr(c) : [], ...Xr(t)] : [];
  u.forEach((v) => {
    i && v.addEventListener("scroll", n, {
      passive: !0
    }), o && v.addEventListener("resize", n);
  });
  const d = c && a ? K2(c, n) : null;
  let h = -1, f = null;
  s && (f = new ResizeObserver((v) => {
    let [x] = v;
    x && x.target === c && f && (f.unobserve(t), cancelAnimationFrame(h), h = requestAnimationFrame(() => {
      var w;
      (w = f) == null || w.observe(t);
    })), n();
  }), c && !l && f.observe(c), f.observe(t));
  let g, m = l ? Fn(e) : null;
  l && b();
  function b() {
    const v = Fn(e);
    m && !fg(m, v) && n(), m = v, g = requestAnimationFrame(b);
  }
  return n(), () => {
    var v;
    u.forEach((x) => {
      i && x.removeEventListener("scroll", n), o && x.removeEventListener("resize", n);
    }), d == null || d(), (v = f) == null || v.disconnect(), f = null, l && cancelAnimationFrame(g);
  };
}
const Y2 = b2, X2 = x2, Z2 = g2, J2 = S2, Q2 = y2, tf = m2, eI = w2, tI = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), i = {
    platform: q2,
    ...n
  }, o = {
    ...i.platform,
    _c: r
  };
  return p2(e, t, {
    ...i,
    platform: o
  });
};
var nI = typeof document < "u", rI = function() {
}, Li = nI ? Aa : rI;
function ro(e, t) {
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
        if (!ro(e[r], t[r]))
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
      if (!(o === "_owner" && e.$$typeof) && !ro(e[o], t[o]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function hg(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function nf(e, t) {
  const n = hg(e);
  return Math.round(t * n) / n;
}
function Ds(e) {
  const t = y.useRef(e);
  return Li(() => {
    t.current = e;
  }), t;
}
function iI(e) {
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
  ro(h, r) || f(r);
  const [g, m] = y.useState(null), [b, v] = y.useState(null), x = y.useCallback((_) => {
    _ !== k.current && (k.current = _, m(_));
  }, []), w = y.useCallback((_) => {
    _ !== A.current && (A.current = _, v(_));
  }, []), T = o || g, E = s || b, k = y.useRef(null), A = y.useRef(null), I = y.useRef(u), F = l != null, P = Ds(l), N = Ds(i), R = Ds(c), B = y.useCallback(() => {
    if (!k.current || !A.current)
      return;
    const _ = {
      placement: t,
      strategy: n,
      middleware: h
    };
    N.current && (_.platform = N.current), tI(k.current, A.current, _).then((L) => {
      const S = {
        ...L,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: R.current !== !1
      };
      $.current && !ro(I.current, S) && (I.current = S, ho.flushSync(() => {
        d(S);
      }));
    });
  }, [h, t, n, N, R]);
  Li(() => {
    c === !1 && I.current.isPositioned && (I.current.isPositioned = !1, d((_) => ({
      ..._,
      isPositioned: !1
    })));
  }, [c]);
  const $ = y.useRef(!1);
  Li(() => ($.current = !0, () => {
    $.current = !1;
  }), []), Li(() => {
    if (T && (k.current = T), E && (A.current = E), T && E) {
      if (P.current)
        return P.current(T, E, B);
      B();
    }
  }, [T, E, B, P, F]);
  const H = y.useMemo(() => ({
    reference: k,
    floating: A,
    setReference: x,
    setFloating: w
  }), [x, w]), V = y.useMemo(() => ({
    reference: T,
    floating: E
  }), [T, E]), D = y.useMemo(() => {
    const _ = {
      position: n,
      left: 0,
      top: 0
    };
    if (!V.floating)
      return _;
    const L = nf(V.floating, u.x), S = nf(V.floating, u.y);
    return a ? {
      ..._,
      transform: "translate(" + L + "px, " + S + "px)",
      ...hg(V.floating) >= 1.5 && {
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
    floatingStyles: D
  }), [u, B, H, V, D]);
}
const oI = (e) => {
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
      return r && t(r) ? r.current != null ? tf({
        element: r.current,
        padding: i
      }).fn(n) : {} : r ? tf({
        element: r,
        padding: i
      }).fn(n) : {};
    }
  };
}, sI = (e, t) => ({
  ...Y2(e),
  options: [e, t]
}), aI = (e, t) => ({
  ...X2(e),
  options: [e, t]
}), lI = (e, t) => ({
  ...eI(e),
  options: [e, t]
}), cI = (e, t) => ({
  ...Z2(e),
  options: [e, t]
}), uI = (e, t) => ({
  ...J2(e),
  options: [e, t]
}), dI = (e, t) => ({
  ...Q2(e),
  options: [e, t]
}), fI = (e, t) => ({
  ...oI(e),
  options: [e, t]
});
var hI = "Arrow", pg = y.forwardRef((e, t) => {
  const { children: n, width: r = 10, height: i = 5, ...o } = e;
  return /* @__PURE__ */ p(
    pe.svg,
    {
      ...o,
      ref: t,
      width: r,
      height: i,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : /* @__PURE__ */ p("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
pg.displayName = hI;
var pI = pg;
function Xl(e) {
  const [t, n] = y.useState(void 0);
  return Ye(() => {
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
var Zl = "Popper", [mg, Sr] = tn(Zl), [mI, gg] = mg(Zl), yg = (e) => {
  const { __scopePopper: t, children: n } = e, [r, i] = y.useState(null);
  return /* @__PURE__ */ p(mI, { scope: t, anchor: r, onAnchorChange: i, children: n });
};
yg.displayName = Zl;
var vg = "PopperAnchor", bg = y.forwardRef(
  (e, t) => {
    const { __scopePopper: n, virtualRef: r, ...i } = e, o = gg(vg, n), s = y.useRef(null), a = we(t, s), l = y.useRef(null);
    return y.useEffect(() => {
      const c = l.current;
      l.current = (r == null ? void 0 : r.current) || s.current, c !== l.current && o.onAnchorChange(l.current);
    }), r ? null : /* @__PURE__ */ p(pe.div, { ...i, ref: a });
  }
);
bg.displayName = vg;
var Jl = "PopperContent", [gI, yI] = mg(Jl), xg = y.forwardRef(
  (e, t) => {
    var W, ie, me, le, ce, ge;
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
      onPlaced: g,
      ...m
    } = e, b = gg(Jl, n), [v, x] = y.useState(null), w = we(t, (Be) => x(Be)), [T, E] = y.useState(null), k = Xl(T), A = (k == null ? void 0 : k.width) ?? 0, I = (k == null ? void 0 : k.height) ?? 0, F = r + (o !== "center" ? "-" + o : ""), P = typeof u == "number" ? u : { top: 0, right: 0, bottom: 0, left: 0, ...u }, N = Array.isArray(c) ? c : [c], R = N.length > 0, B = {
      padding: P,
      boundary: N.filter(bI),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: R
    }, { refs: $, floatingStyles: H, placement: V, isPositioned: D, middlewareData: _ } = iI({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: F,
      whileElementsMounted: (...Be) => G2(...Be, {
        animationFrame: f === "always"
      }),
      elements: {
        reference: b.anchor
      },
      middleware: [
        sI({ mainAxis: i + I, alignmentAxis: s }),
        l && aI({
          mainAxis: !0,
          crossAxis: !1,
          limiter: d === "partial" ? lI() : void 0,
          ...B
        }),
        l && cI({ ...B }),
        uI({
          ...B,
          apply: ({ elements: Be, rects: Xe, availableWidth: pt, availableHeight: lt }) => {
            const { width: wt, height: qt } = Xe.reference, mt = Be.floating.style;
            mt.setProperty("--radix-popper-available-width", `${pt}px`), mt.setProperty("--radix-popper-available-height", `${lt}px`), mt.setProperty("--radix-popper-anchor-width", `${wt}px`), mt.setProperty("--radix-popper-anchor-height", `${qt}px`);
          }
        }),
        T && fI({ element: T, padding: a }),
        xI({ arrowWidth: A, arrowHeight: I }),
        h && dI({ strategy: "referenceHidden", ...B })
      ]
    }), [L, S] = kg(V), te = On(g);
    Ye(() => {
      D && (te == null || te());
    }, [D, te]);
    const Z = (W = _.arrow) == null ? void 0 : W.x, C = (ie = _.arrow) == null ? void 0 : ie.y, q = ((me = _.arrow) == null ? void 0 : me.centerOffset) !== 0, [Y, se] = y.useState();
    return Ye(() => {
      v && se(window.getComputedStyle(v).zIndex);
    }, [v]), /* @__PURE__ */ p(
      "div",
      {
        ref: $.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...H,
          transform: D ? H.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: Y,
          "--radix-popper-transform-origin": [
            (le = _.transformOrigin) == null ? void 0 : le.x,
            (ce = _.transformOrigin) == null ? void 0 : ce.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...((ge = _.hide) == null ? void 0 : ge.referenceHidden) && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ p(
          gI,
          {
            scope: n,
            placedSide: L,
            onArrowChange: E,
            arrowX: Z,
            arrowY: C,
            shouldHideArrow: q,
            children: /* @__PURE__ */ p(
              pe.div,
              {
                "data-side": L,
                "data-align": S,
                ...m,
                ref: w,
                style: {
                  ...m.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: D ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
xg.displayName = Jl;
var wg = "PopperArrow", vI = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, Sg = y.forwardRef(function(t, n) {
  const { __scopePopper: r, ...i } = t, o = yI(wg, r), s = vI[o.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ p(
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
        children: /* @__PURE__ */ p(
          pI,
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
Sg.displayName = wg;
function bI(e) {
  return e !== null;
}
var xI = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    var b, v, x;
    const { placement: n, rects: r, middlewareData: i } = t, s = ((b = i.arrow) == null ? void 0 : b.centerOffset) !== 0, a = s ? 0 : e.arrowWidth, l = s ? 0 : e.arrowHeight, [c, u] = kg(n), d = { start: "0%", center: "50%", end: "100%" }[u], h = (((v = i.arrow) == null ? void 0 : v.x) ?? 0) + a / 2, f = (((x = i.arrow) == null ? void 0 : x.y) ?? 0) + l / 2;
    let g = "", m = "";
    return c === "bottom" ? (g = s ? d : `${h}px`, m = `${-l}px`) : c === "top" ? (g = s ? d : `${h}px`, m = `${r.floating.height + l}px`) : c === "right" ? (g = `${-l}px`, m = s ? d : `${f}px`) : c === "left" && (g = `${r.floating.width + l}px`, m = s ? d : `${f}px`), { data: { x: g, y: m } };
  }
});
function kg(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var Ql = yg, Vo = bg, ec = xg, tc = Sg;
// @__NO_SIDE_EFFECTS__
function wI(e) {
  const t = /* @__PURE__ */ SI(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(CI);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ p(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ p(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function SI(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = EI(i), a = TI(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? $n(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var kI = Symbol("radix.slottable");
function CI(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === kI;
}
function TI(e, t) {
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
function EI(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var Bo = "Popover", [Cg] = tn(Bo, [
  Sr
]), ui = Sr(), [PI, bn] = Cg(Bo), Tg = (e) => {
  const {
    __scopePopover: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !1
  } = e, a = ui(t), l = y.useRef(null), [c, u] = y.useState(!1), [d, h] = pn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Bo
  });
  return /* @__PURE__ */ p(Ql, { ...a, children: /* @__PURE__ */ p(
    PI,
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
Tg.displayName = Bo;
var Eg = "PopoverAnchor", AI = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = bn(Eg, n), o = ui(n), { onCustomAnchorAdd: s, onCustomAnchorRemove: a } = i;
    return y.useEffect(() => (s(), () => a()), [s, a]), /* @__PURE__ */ p(Vo, { ...o, ...r, ref: t });
  }
);
AI.displayName = Eg;
var Pg = "PopoverTrigger", Ag = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = bn(Pg, n), o = ui(n), s = we(t, i.triggerRef), a = /* @__PURE__ */ p(
      pe.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": Mg(i.open),
        ...r,
        ref: s,
        onClick: ae(e.onClick, i.onOpenToggle)
      }
    );
    return i.hasCustomAnchor ? a : /* @__PURE__ */ p(Vo, { asChild: !0, ...o, children: a });
  }
);
Ag.displayName = Pg;
var nc = "PopoverPortal", [RI, NI] = Cg(nc, {
  forceMount: void 0
}), Rg = (e) => {
  const { __scopePopover: t, forceMount: n, children: r, container: i } = e, o = bn(nc, t);
  return /* @__PURE__ */ p(RI, { scope: t, forceMount: n, children: /* @__PURE__ */ p(nn, { present: n || o.open, children: /* @__PURE__ */ p(oi, { asChild: !0, container: i, children: r }) }) });
};
Rg.displayName = nc;
var ur = "PopoverContent", Ng = y.forwardRef(
  (e, t) => {
    const n = NI(ur, e.__scopePopover), { forceMount: r = n.forceMount, ...i } = e, o = bn(ur, e.__scopePopover);
    return /* @__PURE__ */ p(nn, { present: r || o.open, children: o.modal ? /* @__PURE__ */ p(DI, { ...i, ref: t }) : /* @__PURE__ */ p(MI, { ...i, ref: t }) });
  }
);
Ng.displayName = ur;
var II = /* @__PURE__ */ wI("PopoverContent.RemoveScroll"), DI = y.forwardRef(
  (e, t) => {
    const n = bn(ur, e.__scopePopover), r = y.useRef(null), i = we(t, r), o = y.useRef(!1);
    return y.useEffect(() => {
      const s = r.current;
      if (s) return gl(s);
    }, []), /* @__PURE__ */ p(Eo, { as: II, allowPinchZoom: !0, children: /* @__PURE__ */ p(
      Ig,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: ae(e.onCloseAutoFocus, (s) => {
          var a;
          s.preventDefault(), o.current || (a = n.triggerRef.current) == null || a.focus();
        }),
        onPointerDownOutside: ae(
          e.onPointerDownOutside,
          (s) => {
            const a = s.detail.originalEvent, l = a.button === 0 && a.ctrlKey === !0, c = a.button === 2 || l;
            o.current = c;
          },
          { checkForDefaultPrevented: !1 }
        ),
        onFocusOutside: ae(
          e.onFocusOutside,
          (s) => s.preventDefault(),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
), MI = y.forwardRef(
  (e, t) => {
    const n = bn(ur, e.__scopePopover), r = y.useRef(!1), i = y.useRef(!1);
    return /* @__PURE__ */ p(
      Ig,
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
), Ig = y.forwardRef(
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
    } = e, h = bn(ur, n), f = ui(n);
    return ml(), /* @__PURE__ */ p(
      Co,
      {
        asChild: !0,
        loop: !0,
        trapped: r,
        onMountAutoFocus: i,
        onUnmountAutoFocus: o,
        children: /* @__PURE__ */ p(
          ii,
          {
            asChild: !0,
            disableOutsidePointerEvents: s,
            onInteractOutside: u,
            onEscapeKeyDown: a,
            onPointerDownOutside: l,
            onFocusOutside: c,
            onDismiss: () => h.onOpenChange(!1),
            children: /* @__PURE__ */ p(
              ec,
              {
                "data-state": Mg(h.open),
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
), Dg = "PopoverClose", OI = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = bn(Dg, n);
    return /* @__PURE__ */ p(
      pe.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: ae(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
OI.displayName = Dg;
var LI = "PopoverArrow", _I = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = ui(n);
    return /* @__PURE__ */ p(tc, { ...i, ...r, ref: t });
  }
);
_I.displayName = LI;
function Mg(e) {
  return e ? "open" : "closed";
}
var FI = Tg, VI = Ag, BI = Rg, zI = Ng;
function rc({
  ...e
}) {
  return /* @__PURE__ */ p(FI, { "data-slot": "popover", ...e });
}
function ic({
  ...e
}) {
  return /* @__PURE__ */ p(VI, { "data-slot": "popover-trigger", ...e });
}
function oc({
  className: e,
  align: t = "center",
  sideOffset: n = 4,
  ...r
}) {
  return /* @__PURE__ */ p(BI, { children: /* @__PURE__ */ p("div", { className: "chat-theme", children: /* @__PURE__ */ p(
    zI,
    {
      "data-slot": "popover-content",
      align: t,
      sideOffset: n,
      className: K(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-none",
        e
      ),
      ...r
    }
  ) }) });
}
function ma({ content: e, className: t }) {
  let n = null, r = !1;
  if (typeof e == "string")
    try {
      n = JSON.parse(e), typeof n == "object" && n !== null && (r = !0);
    } catch {
    }
  else typeof e == "object" && e !== null && (n = e, r = !0);
  if (!r)
    return /* @__PURE__ */ p("code", { className: K("rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", t), children: typeof e == "string" ? e : JSON.stringify(e) });
  const i = Array.isArray(n) ? `Array [${n.length}]` : "Data", o = JSON.stringify(n, null, 2);
  return /* @__PURE__ */ M(rc, { children: [
    /* @__PURE__ */ p(ic, { asChild: !0, children: /* @__PURE__ */ M(
      "button",
      {
        className: K(
          "inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer select-none",
          t
        ),
        children: [
          /* @__PURE__ */ p(dc, { className: "h-3 w-3" }),
          /* @__PURE__ */ p("span", { className: "truncate max-w-[200px]", children: i })
        ]
      }
    ) }),
    /* @__PURE__ */ M(oc, { className: "w-[500px] max-w-[90vw] p-0", align: "start", children: [
      /* @__PURE__ */ M("div", { className: "flex items-center justify-between border-b px-3 py-2 bg-muted/30", children: [
        /* @__PURE__ */ M("div", { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
          /* @__PURE__ */ p(dc, { className: "h-4 w-4" }),
          /* @__PURE__ */ p("span", { children: "Data Viewer" })
        ] }),
        /* @__PURE__ */ p(Qi, { content: o, copyMessage: "Copied JSON" })
      ] }),
      /* @__PURE__ */ p("div", { className: "max-h-[500px] overflow-auto p-4 bg-background", children: /* @__PURE__ */ p("pre", { className: "text-xs font-mono whitespace-pre-wrap break-words text-foreground", children: o }) })
    ] })
  ] });
}
function rf({ children: e }) {
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: /* @__PURE__ */ p(gA, { remarkPlugins: [RN], components: jI, children: e }) });
}
const Og = j.memo(
  async ({ children: e, language: t, ...n }) => {
    const { codeToTokens: r, bundledLanguages: i } = await import("./index-_A9yhDIS.js");
    if (!(t in i))
      return /* @__PURE__ */ p("pre", { ...n, children: e });
    const { tokens: o } = await r(e, {
      lang: t,
      defaultColor: !1,
      themes: {
        light: "github-light",
        dark: "github-dark"
      }
    });
    return /* @__PURE__ */ p("pre", { ...n, children: /* @__PURE__ */ p("code", { children: o.map((s, a) => /* @__PURE__ */ M(dt, { children: [
      /* @__PURE__ */ p("span", { children: s.map((l, c) => {
        const u = typeof l.htmlStyle == "string" ? void 0 : l.htmlStyle;
        return /* @__PURE__ */ p(
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
Og.displayName = "HighlightedCode";
const $I = ({
  children: e,
  className: t,
  language: n,
  ...r
}) => {
  const i = typeof e == "string" ? e : io(e), o = K(
    "overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    t
  );
  return /* @__PURE__ */ M("div", { className: "group/code relative mb-4", children: [
    /* @__PURE__ */ p(
      iv,
      {
        fallback: /* @__PURE__ */ p("pre", { className: o, ...r, children: e }),
        children: /* @__PURE__ */ p(Og, { language: n, className: o, children: i })
      }
    ),
    /* @__PURE__ */ p("div", { className: "invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100", children: /* @__PURE__ */ p(Qi, { content: i, copyMessage: "Copied code to clipboard" }) })
  ] });
};
function io(e) {
  var t;
  if (typeof e == "string")
    return e;
  if ((t = e == null ? void 0 : e.props) != null && t.children) {
    let n = e.props.children;
    return Array.isArray(n) ? n.map((r) => io(r)).join("") : io(n);
  }
  return "";
}
const jI = {
  h1: Je("h1", "text-2xl font-semibold"),
  h2: Je("h2", "font-semibold text-xl"),
  h3: Je("h3", "font-semibold text-lg"),
  h4: Je("h4", "font-semibold text-base"),
  h5: Je("h5", "font-medium"),
  strong: Je("strong", "font-semibold"),
  a: Je("a", "text-primary underline underline-offset-2"),
  blockquote: Je("blockquote", "border-l-2 border-primary pl-4"),
  code: ({ children: e, className: t, node: n, ...r }) => {
    const i = /language-(\w+)/.exec(t || ""), o = i ? i[1] : void 0, s = String(e).replace(/\n$/, "");
    let a = o === "json";
    if (!a)
      try {
        const l = JSON.parse(s);
        typeof l == "object" && l !== null && (a = !0);
      } catch {
      }
    return a ? /* @__PURE__ */ p(ma, { content: s }) : i ? /* @__PURE__ */ p($I, { className: t, language: i[1], ...r, children: e }) : /* @__PURE__ */ p(
      "code",
      {
        className: K(
          "font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5"
        ),
        ...r,
        children: e
      }
    );
  },
  pre: ({ children: e }) => e,
  ol: Je("ol", "list-decimal space-y-2 pl-6"),
  ul: Je("ul", "list-disc space-y-2 pl-6"),
  li: Je("li", "my-1.5"),
  table: Je(
    "table",
    "w-full border-collapse overflow-y-auto rounded-md border border-foreground/20"
  ),
  th: Je(
    "th",
    "border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  td: Je(
    "td",
    "border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
  ),
  tr: Je("tr", "m-0 border-t p-0 even:bg-muted"),
  p: ({ children: e, className: t, ...n }) => {
    const i = io(e).trim();
    if (i.startsWith("{") && i.endsWith("}") || i.startsWith("[") && i.endsWith("]"))
      try {
        const s = JSON.parse(i);
        if (typeof s == "object" && s !== null)
          return /* @__PURE__ */ p("div", { className: "my-2", children: /* @__PURE__ */ p(ma, { content: i }) });
      } catch {
      }
    return /* @__PURE__ */ p("p", { className: K("whitespace-pre-wrap", t), ...n, children: e });
  },
  hr: Je("hr", "border-foreground/20")
};
function Je(e, t) {
  const n = ({ node: r, ...i }) => /* @__PURE__ */ p(e, { className: t, ...i });
  return n.displayName = e, n;
}
const UI = Lf(
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
), HI = ({
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
  const [u, d] = ne([]);
  Ve(() => {
    if (!a || a.length === 0) {
      d([]);
      return;
    }
    (async () => {
      const x = await Promise.all(
        a.map(async (w) => {
          try {
            const T = await WI(w.url);
            return new File([T], w.name ?? "Unknown", {
              type: w.contentType
            });
          } catch (T) {
            return console.error("Error loading file:", T), new File([], w.name ?? "Unknown", {
              type: w.contentType
            });
          }
        })
      );
      d(x);
    })();
  }, [a]);
  const h = e === "user", f = e === "user" ? "user" : e === "tool" ? "tool" : e === "subagent" || s && s.startsWith("sub-agent-") ? "subagent" : "assistant", g = n == null ? void 0 : n.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }), m = ({ children: v, className: x }) => /* @__PURE__ */ p("div", { className: K(
    "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
    x
  ), children: v }), b = () => f === "user" ? null : f === "assistant" ? /* @__PURE__ */ p(m, { className: "bg-gradient-to-tr from-primary to-primary/80 border-primary/20 text-primary-foreground", children: /* @__PURE__ */ p(po, { className: "h-4 w-4" }) }) : f === "subagent" ? /* @__PURE__ */ p(m, { className: "bg-gradient-to-tr from-indigo-500 to-blue-500 border-indigo-400/20 text-white", children: /* @__PURE__ */ p(mv, { className: "h-4 w-4" }) }) : null;
  return !t && !l && (!c || c.length === 0) ? null : /* @__PURE__ */ M("div", { className: K(
    "flex w-full gap-3 mb-6",
    h ? "flex-row-reverse" : "flex-row"
  ), children: [
    b(),
    /* @__PURE__ */ M("div", { className: K(
      "flex flex-col gap-1.5",
      h ? "items-end max-w-[70%]" : "items-start max-w-full"
    ), children: [
      u && u.length > 0 && /* @__PURE__ */ p("div", { className: K(
        "mb-1 flex flex-wrap gap-2",
        h ? "justify-end" : "justify-start"
      ), children: u.map((v, x) => /* @__PURE__ */ p(Cl, { file: v }, x)) }),
      /* @__PURE__ */ M("div", { className: K(UI({ variant: f, animation: i })), children: [
        c && c.length > 0 ? c.map((v, x) => v.type === "text" ? /* @__PURE__ */ p(of, { variant: f, children: v.text }, x) : v.type === "reasoning" ? /* @__PURE__ */ p(qI, { part: v }, x) : v.type === "tool-invocation" ? /* @__PURE__ */ p(sf, { toolInvocations: [v.toolInvocation] }, x) : null) : l && l.length > 0 ? /* @__PURE__ */ p(sf, { toolInvocations: l }) : /* @__PURE__ */ p(of, { variant: f, children: t }),
        o && /* @__PURE__ */ p("div", { className: "absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background/80 backdrop-blur-sm p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-md", children: o })
      ] }),
      r && n && /* @__PURE__ */ p(
        "time",
        {
          dateTime: n.toISOString(),
          className: K(
            "px-1 text-[10px] font-medium text-muted-foreground/50",
            i !== "none" && "duration-500 animate-in fade-in-0"
          ),
          children: g
        }
      )
    ] })
  ] });
}, of = ({
  children: e,
  threshold: t = 1e3,
  variant: n
}) => {
  const [r, i] = ne(!1), o = e.length > t, s = K(
    "mt-2 self-start text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer",
    n === "user" ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary hover:text-primary/80"
  );
  return !o || r ? /* @__PURE__ */ M("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ p(rf, { children: e }),
    o && /* @__PURE__ */ p("button", { onClick: () => i(!1), className: s, children: "Show less" })
  ] }) : /* @__PURE__ */ M("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ p(rf, { children: e.slice(0, t) + "..." }),
    /* @__PURE__ */ p("button", { onClick: () => i(!0), className: s, children: "Read more" })
  ] });
};
async function WI(e) {
  if (e.startsWith("blob:")) {
    const i = await (await fetch(e)).blob();
    return new Uint8Array(await i.arrayBuffer());
  }
  if (e.startsWith("data:")) {
    const r = e.split(",")[1];
    if (!r)
      throw new Error("Invalid data URL format");
    const i = atob(r), o = i.length, s = new Uint8Array(o);
    for (let a = 0; a < o; a++)
      s[a] = i.charCodeAt(a);
    return s;
  }
  const n = await (await fetch(e)).blob();
  return new Uint8Array(await n.arrayBuffer());
}
const qI = ({ part: e }) => {
  const [t, n] = ne(!1);
  return /* @__PURE__ */ p("div", { className: "mb-2 flex flex-col items-start sm:max-w-[70%]", children: /* @__PURE__ */ M(
    gS,
    {
      open: t,
      onOpenChange: n,
      className: "group w-full overflow-hidden rounded-lg border bg-muted/50",
      children: [
        /* @__PURE__ */ p("div", { className: "flex items-center p-2", children: /* @__PURE__ */ p(yS, { asChild: !0, children: /* @__PURE__ */ M("button", { className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ p(Na, { className: "h-4 w-4 transition-transform group-data-[state=open]:rotate-90" }),
          /* @__PURE__ */ p("span", { children: "Thinking" })
        ] }) }) }),
        /* @__PURE__ */ p(vS, { forceMount: !0, children: /* @__PURE__ */ p(
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
            children: /* @__PURE__ */ p("div", { className: "p-2", children: /* @__PURE__ */ p("div", { className: "whitespace-pre-wrap text-xs", children: e.reasoning }) })
          }
        ) })
      ]
    }
  ) });
};
function sf({
  toolInvocations: e
}) {
  return e != null && e.length ? /* @__PURE__ */ p("div", { className: "flex flex-col items-start gap-2", children: e.map((t, n) => {
    if (t.state === "result" && t.result.__cancelled === !0)
      return /* @__PURE__ */ M(
        "div",
        {
          className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
          children: [
            /* @__PURE__ */ p(pv, { className: "h-4 w-4" }),
            /* @__PURE__ */ M("span", { children: [
              "Cancelled",
              " ",
              /* @__PURE__ */ M("span", { className: "font-mono", children: [
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
        return /* @__PURE__ */ M(
          "div",
          {
            className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
            children: [
              /* @__PURE__ */ p(Av, { className: "h-4 w-4" }),
              /* @__PURE__ */ M("span", { children: [
                "Calling",
                " ",
                /* @__PURE__ */ M("span", { className: "font-mono", children: [
                  "`",
                  t.toolName,
                  "`"
                ] }),
                "..."
              ] }),
              /* @__PURE__ */ p(Sf, { className: "h-3 w-3 animate-spin" })
            ]
          },
          n
        );
      case "result":
        return /* @__PURE__ */ M(
          "div",
          {
            className: "flex flex-col gap-1.5 rounded-lg border bg-muted/50 px-3 py-2 text-sm",
            children: [
              /* @__PURE__ */ M("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ p(vv, { className: "h-4 w-4" }),
                /* @__PURE__ */ M("span", { children: [
                  "Result from",
                  " ",
                  /* @__PURE__ */ M("span", { className: "font-mono", children: [
                    "`",
                    t.toolName,
                    "`"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ p(ma, { content: t.result })
            ]
          },
          n
        );
      default:
        return null;
    }
  }) }) : null;
}
function KI(e, t, n) {
  let r = (i) => e(i, ...t);
  return n === void 0 ? r : Object.assign(r, { lazy: n, lazyArgs: t });
}
function Lg(e, t, n) {
  let r = e.length - t.length;
  if (r === 0) return e(...t);
  if (r === 1) return KI(e, t, n);
  throw Error("Wrong number of arguments");
}
function af(...e) {
  return Lg(GI, e);
}
const GI = (e, t) => e.length >= t;
function lf(...e) {
  return Lg(YI, e);
}
function YI(e, t) {
  if (!af(t, 1)) return { ...e };
  if (!af(t, 2)) {
    let { [t[0]]: r, ...i } = e;
    return i;
  }
  let n = { ...e };
  for (let r of t) delete n[r];
  return n;
}
const cf = function() {
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
function XI({
  transcribeAudio: e,
  onTranscriptionComplete: t
}) {
  const [n, r] = ne(!1), [i, o] = ne(!!e), [s, a] = ne(!1), [l, c] = ne(!1), [u, d] = ne(null), h = Me(null);
  Ve(() => {
    (async () => {
      const b = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      o(b && !!e);
    })();
  }, [e]);
  const f = async () => {
    a(!1), c(!0);
    try {
      cf.stop();
      const m = await h.current;
      if (e) {
        const b = await e(m);
        t == null || t(b);
      }
    } catch (m) {
      console.error("Error transcribing audio:", m);
    } finally {
      c(!1), r(!1), u && (u.getTracks().forEach((m) => m.stop()), d(null)), h.current = null;
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
          const m = await navigator.mediaDevices.getUserMedia({
            audio: !0
          });
          d(m), h.current = cf(m);
        } catch (m) {
          console.error("Error recording audio:", m), r(!1), a(!1), u && (u.getTracks().forEach((b) => b.stop()), d(null));
        }
    },
    stopRecording: f
  };
}
function ZI({
  ref: e,
  maxHeight: t = Number.MAX_SAFE_INTEGER,
  borderWidth: n = 0,
  dependencies: r
}) {
  const i = Me(null);
  Aa(() => {
    if (!e.current) return;
    const o = e.current, s = n * 2;
    i.current === null && (i.current = o.scrollHeight - s), o.style.removeProperty("height");
    const a = o.scrollHeight, l = Math.min(a, t), c = Math.max(l, i.current);
    o.style.height = `${c + s}px`;
  }, [t, e, ...r]);
}
const ln = {
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
function JI({
  stream: e,
  isRecording: t,
  onClick: n
}) {
  const r = Me(null), i = Me(null), o = Me(null), s = Me(null), a = Me(null), l = () => {
    s.current && cancelAnimationFrame(s.current), i.current && i.current.close();
  };
  Ve(() => l, []), Ve(() => {
    e && t ? c() : l();
  }, [e, t]), Ve(() => {
    const f = () => {
      if (r.current && a.current) {
        const g = a.current, m = r.current, b = window.devicePixelRatio || 1, v = g.getBoundingClientRect();
        m.width = (v.width - 2) * b, m.height = (v.height - 2) * b, m.style.width = `${v.width - 2}px`, m.style.height = `${v.height - 2}px`;
      }
    };
    return window.addEventListener("resize", f), f(), () => window.removeEventListener("resize", f);
  }, []);
  const c = async () => {
    try {
      const f = new AudioContext();
      i.current = f;
      const g = f.createAnalyser();
      g.fftSize = ln.FFT_SIZE, g.smoothingTimeConstant = ln.SMOOTHING, o.current = g, f.createMediaStreamSource(e).connect(g), h();
    } catch (f) {
      console.error("Error starting visualization:", f);
    }
  }, u = (f) => {
    const g = Math.floor(f * ln.COLOR.INTENSITY_RANGE) + ln.COLOR.MIN_INTENSITY;
    return `rgb(${g}, ${g}, ${g})`;
  }, d = (f, g, m, b, v, x) => {
    f.fillStyle = x, f.fillRect(g, m - v, b, v), f.fillRect(g, m, b, v);
  }, h = () => {
    if (!t) return;
    const f = r.current, g = f == null ? void 0 : f.getContext("2d");
    if (!f || !g || !o.current) return;
    const m = window.devicePixelRatio || 1;
    g.scale(m, m);
    const b = o.current, v = b.frequencyBinCount, x = new Uint8Array(v), w = () => {
      s.current = requestAnimationFrame(w), b.getByteFrequencyData(x), g.clearRect(0, 0, f.width / m, f.height / m);
      const T = Math.max(
        ln.MIN_BAR_WIDTH,
        f.width / m / v - ln.BAR_SPACING
      ), E = f.height / m / 2;
      let k = 0;
      for (let A = 0; A < v; A++) {
        const I = x[A] / 255, F = Math.max(
          ln.MIN_BAR_HEIGHT,
          I * E
        );
        d(
          g,
          k,
          E,
          T,
          F,
          u(I)
        ), k += T + ln.BAR_SPACING;
      }
    };
    w();
  };
  return /* @__PURE__ */ p(
    "div",
    {
      ref: a,
      className: "h-full w-full cursor-pointer rounded-lg bg-background/80 backdrop-blur",
      onClick: n,
      children: /* @__PURE__ */ p("canvas", { ref: r, className: "h-full w-full" })
    }
  );
}
function QI({ isOpen: e, close: t }) {
  return /* @__PURE__ */ p(go, { children: e && /* @__PURE__ */ M(
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
        /* @__PURE__ */ p("span", { className: "ml-2.5", children: "Press Enter again to interrupt" }),
        /* @__PURE__ */ p(
          "button",
          {
            className: "ml-1 mr-2.5 flex items-center",
            type: "button",
            onClick: t,
            "aria-label": "Close",
            children: /* @__PURE__ */ p(zn, { className: "h-3 w-3" })
          }
        )
      ]
    }
  ) });
}
const uf = [kv, po, Ev, yv];
function ga({
  label: e,
  append: t,
  suggestions: n
}) {
  return /* @__PURE__ */ M("div", { className: "flex h-full flex-col items-center justify-start sm:justify-center space-y-8 sm:space-y-12 px-4 py-8 sm:py-12 md:py-16 animate-in fade-in zoom-in-95 duration-700 overflow-y-auto", children: [
    /* @__PURE__ */ M("div", { className: "space-y-4 sm:space-y-6 text-center max-w-2xl", children: [
      /* @__PURE__ */ p("div", { className: "mx-auto flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent shadow-inner mb-4 sm:mb-8 ring-1 ring-primary/20", children: /* @__PURE__ */ p(po, { className: "h-7 w-7 sm:h-10 sm:w-10 text-primary animate-pulse" }) }),
      /* @__PURE__ */ M("div", { className: "space-y-1 sm:space-y-2", children: [
        /* @__PURE__ */ p("h2", { className: "text-xl sm:text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent", children: "How can I help you today?" }),
        /* @__PURE__ */ p("p", { className: "text-sm sm:text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-lg mx-auto", children: e || "Experience the power of our specialized agents. Choose a task below to get started immediately." })
      ] })
    ] }),
    /* @__PURE__ */ M("div", { className: "w-full max-w-5xl space-y-6", children: [
      /* @__PURE__ */ M("div", { className: "flex items-center gap-3 px-2", children: [
        /* @__PURE__ */ p("div", { className: "h-px flex-1 bg-border/40" }),
        /* @__PURE__ */ p("span", { className: "text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50", children: "Starter Prompts" }),
        /* @__PURE__ */ p("div", { className: "h-px flex-1 bg-border/40" })
      ] }),
      /* @__PURE__ */ p("div", { className: "flex flex-wrap items-stretch justify-center w-full gap-3 lg:mx-auto", children: n.map((r, i) => {
        const o = uf[i % uf.length];
        return /* @__PURE__ */ M(
          "button",
          {
            onClick: () => t({ role: "user", content: r }),
            className: K(
              "group relative flex flex-1 flex-row items-center gap-4 sm:gap-5 rounded-xl sm:rounded-2xl border bg-card/40 p-4 sm:p-6 text-left transition-all duration-500 backdrop-blur-sm",
              "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/60",
              "border-border/40 active:scale-[0.98] overflow-hidden",
              "min-w-[280px] max-w-full md:max-w-[calc(50%-0.75rem)]"
            ),
            children: [
              /* @__PURE__ */ p("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
              /* @__PURE__ */ p("div", { className: "relative flex flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-lg", children: /* @__PURE__ */ p(o, { className: "h-5 w-5 sm:h-6 sm:w-6" }) }),
              /* @__PURE__ */ M("div", { className: "relative flex-1 space-y-0.5 sm:space-y-1.5", children: [
                /* @__PURE__ */ p("p", { className: "font-bold text-[14px] sm:text-[17px] text-foreground group-hover:text-primary transition-colors leading-tight", children: r }),
                /* @__PURE__ */ M("p", { className: "text-[10px] sm:text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5", children: [
                  "Click to start this task ",
                  /* @__PURE__ */ p(Na, { className: "h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" })
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
var eD = Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function tD(e) {
  const t = ({ children: n }) => /* @__PURE__ */ p(dt, { children: n });
  return t.displayName = `${e}.Slottable`, t.__radixId = eD, t;
}
var _g = Object.freeze({
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
}), nD = "VisuallyHidden", Fg = y.forwardRef(
  (e, t) => /* @__PURE__ */ p(
    pe.span,
    {
      ...e,
      ref: t,
      style: { ..._g, ...e.style }
    }
  )
);
Fg.displayName = nD;
var rD = Fg, [zo] = tn("Tooltip", [
  Sr
]), $o = Sr(), Vg = "TooltipProvider", iD = 700, ya = "tooltip.open", [oD, sc] = zo(Vg), Bg = (e) => {
  const {
    __scopeTooltip: t,
    delayDuration: n = iD,
    skipDelayDuration: r = 300,
    disableHoverableContent: i = !1,
    children: o
  } = e, s = y.useRef(!0), a = y.useRef(!1), l = y.useRef(0);
  return y.useEffect(() => {
    const c = l.current;
    return () => window.clearTimeout(c);
  }, []), /* @__PURE__ */ p(
    oD,
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
Bg.displayName = Vg;
var Zr = "Tooltip", [sD, di] = zo(Zr), zg = (e) => {
  const {
    __scopeTooltip: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    disableHoverableContent: s,
    delayDuration: a
  } = e, l = sc(Zr, e.__scopeTooltip), c = $o(t), [u, d] = y.useState(null), h = Xt(), f = y.useRef(0), g = s ?? l.disableHoverableContent, m = a ?? l.delayDuration, b = y.useRef(!1), [v, x] = pn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: (A) => {
      A ? (l.onOpen(), document.dispatchEvent(new CustomEvent(ya))) : l.onClose(), o == null || o(A);
    },
    caller: Zr
  }), w = y.useMemo(() => v ? b.current ? "delayed-open" : "instant-open" : "closed", [v]), T = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, b.current = !1, x(!0);
  }, [x]), E = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, x(!1);
  }, [x]), k = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = window.setTimeout(() => {
      b.current = !0, x(!0), f.current = 0;
    }, m);
  }, [m, x]);
  return y.useEffect(() => () => {
    f.current && (window.clearTimeout(f.current), f.current = 0);
  }, []), /* @__PURE__ */ p(Ql, { ...c, children: /* @__PURE__ */ p(
    sD,
    {
      scope: t,
      contentId: h,
      open: v,
      stateAttribute: w,
      trigger: u,
      onTriggerChange: d,
      onTriggerEnter: y.useCallback(() => {
        l.isOpenDelayedRef.current ? k() : T();
      }, [l.isOpenDelayedRef, k, T]),
      onTriggerLeave: y.useCallback(() => {
        g ? E() : (window.clearTimeout(f.current), f.current = 0);
      }, [E, g]),
      onOpen: T,
      onClose: E,
      disableHoverableContent: g,
      children: n
    }
  ) });
};
zg.displayName = Zr;
var va = "TooltipTrigger", $g = y.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = di(va, n), o = sc(va, n), s = $o(n), a = y.useRef(null), l = we(t, a, i.onTriggerChange), c = y.useRef(!1), u = y.useRef(!1), d = y.useCallback(() => c.current = !1, []);
    return y.useEffect(() => () => document.removeEventListener("pointerup", d), [d]), /* @__PURE__ */ p(Vo, { asChild: !0, ...s, children: /* @__PURE__ */ p(
      pe.button,
      {
        "aria-describedby": i.open ? i.contentId : void 0,
        "data-state": i.stateAttribute,
        ...r,
        ref: l,
        onPointerMove: ae(e.onPointerMove, (h) => {
          h.pointerType !== "touch" && !u.current && !o.isPointerInTransitRef.current && (i.onTriggerEnter(), u.current = !0);
        }),
        onPointerLeave: ae(e.onPointerLeave, () => {
          i.onTriggerLeave(), u.current = !1;
        }),
        onPointerDown: ae(e.onPointerDown, () => {
          i.open && i.onClose(), c.current = !0, document.addEventListener("pointerup", d, { once: !0 });
        }),
        onFocus: ae(e.onFocus, () => {
          c.current || i.onOpen();
        }),
        onBlur: ae(e.onBlur, i.onClose),
        onClick: ae(e.onClick, i.onClose)
      }
    ) });
  }
);
$g.displayName = va;
var ac = "TooltipPortal", [aD, lD] = zo(ac, {
  forceMount: void 0
}), jg = (e) => {
  const { __scopeTooltip: t, forceMount: n, children: r, container: i } = e, o = di(ac, t);
  return /* @__PURE__ */ p(aD, { scope: t, forceMount: n, children: /* @__PURE__ */ p(nn, { present: n || o.open, children: /* @__PURE__ */ p(oi, { asChild: !0, container: i, children: r }) }) });
};
jg.displayName = ac;
var dr = "TooltipContent", Ug = y.forwardRef(
  (e, t) => {
    const n = lD(dr, e.__scopeTooltip), { forceMount: r = n.forceMount, side: i = "top", ...o } = e, s = di(dr, e.__scopeTooltip);
    return /* @__PURE__ */ p(nn, { present: r || s.open, children: s.disableHoverableContent ? /* @__PURE__ */ p(Hg, { side: i, ...o, ref: t }) : /* @__PURE__ */ p(cD, { side: i, ...o, ref: t }) });
  }
), cD = y.forwardRef((e, t) => {
  const n = di(dr, e.__scopeTooltip), r = sc(dr, e.__scopeTooltip), i = y.useRef(null), o = we(t, i), [s, a] = y.useState(null), { trigger: l, onClose: c } = n, u = i.current, { onPointerInTransitChange: d } = r, h = y.useCallback(() => {
    a(null), d(!1);
  }, [d]), f = y.useCallback(
    (g, m) => {
      const b = g.currentTarget, v = { x: g.clientX, y: g.clientY }, x = hD(v, b.getBoundingClientRect()), w = pD(v, x), T = mD(m.getBoundingClientRect()), E = yD([...w, ...T]);
      a(E), d(!0);
    },
    [d]
  );
  return y.useEffect(() => () => h(), [h]), y.useEffect(() => {
    if (l && u) {
      const g = (b) => f(b, u), m = (b) => f(b, l);
      return l.addEventListener("pointerleave", g), u.addEventListener("pointerleave", m), () => {
        l.removeEventListener("pointerleave", g), u.removeEventListener("pointerleave", m);
      };
    }
  }, [l, u, f, h]), y.useEffect(() => {
    if (s) {
      const g = (m) => {
        const b = m.target, v = { x: m.clientX, y: m.clientY }, x = (l == null ? void 0 : l.contains(b)) || (u == null ? void 0 : u.contains(b)), w = !gD(v, s);
        x ? h() : w && (h(), c());
      };
      return document.addEventListener("pointermove", g), () => document.removeEventListener("pointermove", g);
    }
  }, [l, u, s, c, h]), /* @__PURE__ */ p(Hg, { ...e, ref: o });
}), [uD, dD] = zo(Zr, { isInside: !1 }), fD = /* @__PURE__ */ tD("TooltipContent"), Hg = y.forwardRef(
  (e, t) => {
    const {
      __scopeTooltip: n,
      children: r,
      "aria-label": i,
      onEscapeKeyDown: o,
      onPointerDownOutside: s,
      ...a
    } = e, l = di(dr, n), c = $o(n), { onClose: u } = l;
    return y.useEffect(() => (document.addEventListener(ya, u), () => document.removeEventListener(ya, u)), [u]), y.useEffect(() => {
      if (l.trigger) {
        const d = (h) => {
          const f = h.target;
          f != null && f.contains(l.trigger) && u();
        };
        return window.addEventListener("scroll", d, { capture: !0 }), () => window.removeEventListener("scroll", d, { capture: !0 });
      }
    }, [l.trigger, u]), /* @__PURE__ */ p(
      ii,
      {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: o,
        onPointerDownOutside: s,
        onFocusOutside: (d) => d.preventDefault(),
        onDismiss: u,
        children: /* @__PURE__ */ M(
          ec,
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
              /* @__PURE__ */ p(fD, { children: r }),
              /* @__PURE__ */ p(uD, { scope: n, isInside: !0, children: /* @__PURE__ */ p(rD, { id: l.contentId, role: "tooltip", children: i || r }) })
            ]
          }
        )
      }
    );
  }
);
Ug.displayName = dr;
var Wg = "TooltipArrow", qg = y.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = $o(n);
    return dD(
      Wg,
      n
    ).isInside ? null : /* @__PURE__ */ p(tc, { ...i, ...r, ref: t });
  }
);
qg.displayName = Wg;
function hD(e, t) {
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
function pD(e, t, n = 5) {
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
function mD(e) {
  const { top: t, right: n, bottom: r, left: i } = e;
  return [
    { x: i, y: t },
    { x: n, y: t },
    { x: n, y: r },
    { x: i, y: r }
  ];
}
function gD(e, t) {
  const { x: n, y: r } = e;
  let i = !1;
  for (let o = 0, s = t.length - 1; o < t.length; s = o++) {
    const a = t[o], l = t[s], c = a.x, u = a.y, d = l.x, h = l.y;
    u > r != h > r && n < (d - c) * (r - u) / (h - u) + c && (i = !i);
  }
  return i;
}
function yD(e) {
  const t = e.slice();
  return t.sort((n, r) => n.x < r.x ? -1 : n.x > r.x ? 1 : n.y < r.y ? -1 : n.y > r.y ? 1 : 0), vD(t);
}
function vD(e) {
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
var bD = Bg, xD = zg, Kg = $g, wD = jg, Gg = Ug, SD = qg;
function Yg({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ p(
    bD,
    {
      "data-slot": "tooltip-provider",
      delayDuration: e,
      ...t
    }
  );
}
function oo({
  ...e
}) {
  return /* @__PURE__ */ p(Yg, { children: /* @__PURE__ */ p(xD, { "data-slot": "tooltip", ...e }) });
}
const Jr = y.forwardRef(({ ...e }, t) => /* @__PURE__ */ p(Kg, { "data-slot": "tooltip-trigger", ...e, ref: t }));
Jr.displayName = Kg.displayName;
const Qr = y.forwardRef(({ className: e, sideOffset: t = 0, children: n, ...r }, i) => /* @__PURE__ */ p(wD, { children: /* @__PURE__ */ p("div", { className: "chat-theme", children: /* @__PURE__ */ M(
  Gg,
  {
    ref: i,
    "data-slot": "tooltip-content",
    sideOffset: t,
    className: K(
      "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
      e
    ),
    ...r,
    children: [
      n,
      /* @__PURE__ */ p(SD, { className: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
    ]
  }
) }) }));
Qr.displayName = Gg.displayName;
const df = 100 * 1024 * 1024, ff = 10, hf = 500 * 1024 * 1024, kD = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "text/markdown",
  "text/html",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/gzip"
];
function CD(e) {
  return e.size > df ? {
    valid: !1,
    error: `File "${e.name}" is too large. Maximum size is ${df / (1024 * 1024)}MB`
  } : (e.type && !kD.includes(e.type) && console.warn(`File "${e.name}" has content type "${e.type}" which is not in the allowed list`), { valid: !0 });
}
function Xg(e) {
  if (e.length > ff)
    return {
      valid: !1,
      error: `Too many files. Maximum ${ff} files allowed per upload`
    };
  if (e.length === 0)
    return {
      valid: !1,
      error: "No files selected"
    };
  const t = e.reduce((n, r) => n + r.size, 0);
  if (t > hf)
    return {
      valid: !1,
      error: `Total size of all files (${(t / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed total size (${hf / (1024 * 1024)}MB)`
    };
  for (const n of e) {
    const r = CD(n);
    if (!r.valid)
      return r;
  }
  return { valid: !0 };
}
function Zg({
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
  ...g
}) {
  var C;
  const [m, b] = ne(!1), [v, x] = ne(!1), {
    isListening: w,
    isSpeechSupported: T,
    isRecording: E,
    isTranscribing: k,
    audioStream: A,
    toggleListening: I,
    stopRecording: F
  } = XI({
    transcribeAudio: a,
    onTranscriptionComplete: (q) => {
      var Y;
      (Y = g.onChange) == null || Y.call(g, { target: { value: q } });
    }
  }), P = u ?? w, N = f ?? T, R = () => {
    u !== void 0 && d && h ? u ? h() : d() : I();
  };
  Ve(() => {
    o || x(!1);
  }, [o]);
  const B = (q) => {
    g.allowAttachments && g.setFiles((Y) => Y === null ? q : q === null ? Y : [...Y, ...q]);
  }, $ = (q) => {
    g.allowAttachments === !0 && (q.preventDefault(), b(!0));
  }, H = (q) => {
    g.allowAttachments === !0 && (q.preventDefault(), b(!1));
  }, V = (q) => {
    if (b(!1), g.allowAttachments !== !0) return;
    q.preventDefault();
    const Y = q.dataTransfer;
    Y.files.length && B(Array.from(Y.files));
  }, D = (q) => {
    var ie;
    const Y = (ie = q.clipboardData) == null ? void 0 : ie.items;
    if (!Y) return;
    const se = q.clipboardData.getData("text");
    if (se && se.length > 500 && g.allowAttachments) {
      q.preventDefault();
      const me = new Blob([se], { type: "text/plain" }), le = new File([me], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now()
      });
      B([le]);
      return;
    }
    const W = Array.from(Y).map((me) => me.getAsFile()).filter((me) => me !== null);
    g.allowAttachments && W.length > 0 && B(W);
  }, _ = (q) => {
    var Y, se, W;
    if (r && q.key === "Enter" && !q.shiftKey) {
      if (q.preventDefault(), o && i && s) {
        if (v)
          i(), x(!1), (Y = q.currentTarget.form) == null || Y.requestSubmit();
        else if (g.value || g.allowAttachments && ((se = g.files) != null && se.length)) {
          x(!0);
          return;
        }
      }
      (W = q.currentTarget.form) == null || W.requestSubmit();
    }
    n == null || n(q);
  }, L = Me(null), [S, te] = ne(0);
  Ve(() => {
    L.current && te(L.current.offsetHeight);
  }, [g.value]);
  const Z = g.allowAttachments && g.files && g.files.length > 0;
  return ZI({
    ref: L,
    maxHeight: 200,
    borderWidth: 1,
    dependencies: [g.value, Z]
  }), /* @__PURE__ */ M(
    "div",
    {
      className: "relative flex w-full",
      onDragOver: $,
      onDragLeave: H,
      onDrop: V,
      children: [
        s && /* @__PURE__ */ p(
          QI,
          {
            isOpen: v,
            close: () => x(!1)
          }
        ),
        /* @__PURE__ */ p(
          AD,
          {
            isVisible: E,
            onStopRecording: F
          }
        ),
        l && c && l.length > 0 && /* @__PURE__ */ p("div", { className: "mb-2", children: /* @__PURE__ */ p(ga, { label: "", append: c, suggestions: l }) }),
        /* @__PURE__ */ p("div", { className: "relative flex w-full items-center space-x-2", children: /* @__PURE__ */ M("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ p(
            "textarea",
            {
              "aria-label": "Write your prompt here",
              placeholder: e,
              ref: L,
              onPaste: D,
              onKeyDown: _,
              className: K(
                "z-10 w-full grow resize-none rounded-lg border border-input bg-background/50 backdrop-blur-sm p-4 pr-28 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
                Z && "pb-20",
                t
              ),
              ...g.allowAttachments ? lf(g, ["allowAttachments", "files", "setFiles"]) : lf(g, ["allowAttachments"])
            }
          ),
          g.allowAttachments && /* @__PURE__ */ p("div", { className: "absolute inset-x-3 bottom-0 z-20 py-3", children: /* @__PURE__ */ p("div", { className: "flex space-x-3", children: /* @__PURE__ */ p(go, { mode: "popLayout", children: (C = g.files) == null ? void 0 : C.map((q) => /* @__PURE__ */ p(
            Cl,
            {
              file: q,
              onRemove: () => {
                g.setFiles((Y) => {
                  if (!Y) return null;
                  const se = Array.from(Y).filter(
                    (W) => W !== q
                  );
                  return se.length === 0 ? null : se;
                });
              }
            },
            q.name + String(q.lastModified)
          )) }) }) })
        ] }) }),
        l && c && l.length > 0 && /* @__PURE__ */ p("div", { className: "mt-2", children: /* @__PURE__ */ p(ga, { label: "", append: c, suggestions: l }) }),
        /* @__PURE__ */ p("div", { className: "absolute right-3 top-3 z-20 flex gap-1", children: /* @__PURE__ */ M(Yg, { delayDuration: 0, children: [
          g.allowAttachments && /* @__PURE__ */ p(
            ND,
            {
              onClick: async () => {
                const q = await ED();
                if (q && q.length > 0)
                  try {
                    const Y = Xg(q);
                    if (!Y.valid) {
                      alert(Y.error || "File validation failed");
                      return;
                    }
                    B(q);
                  } catch (Y) {
                    console.error("Error validating files:", Y), B(q);
                  }
              }
            }
          ),
          /* @__PURE__ */ p(
            ID,
            {
              isSupported: !!N,
              isListening: !!P,
              onClick: R
            }
          ),
          /* @__PURE__ */ p(
            DD,
            {
              isGenerating: o,
              stop: i,
              disabled: g.value === "" || o
            }
          )
        ] }) }),
        g.allowAttachments && /* @__PURE__ */ p(TD, { isDragging: m }),
        /* @__PURE__ */ p(
          RD,
          {
            isRecording: E,
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
Zg.displayName = "MessageInput";
function TD({ isDragging: e }) {
  return /* @__PURE__ */ p(go, { children: e && /* @__PURE__ */ M(
    Jt.div,
    {
      className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      "aria-hidden": !0,
      children: [
        /* @__PURE__ */ p(kf, {}),
        /* @__PURE__ */ p("span", { children: "Drop your files here to attach them." })
      ]
    }
  ) });
}
function ED() {
  const e = document.createElement("input");
  return e.type = "file", e.multiple = !0, e.accept = "*/*", e.style.display = "none", new Promise((t) => {
    let n = !1;
    const r = (a) => {
      n || (n = !0, i(), t(a));
    }, i = () => {
      window.removeEventListener("focus", s), clearTimeout(o);
    };
    let o;
    const s = () => {
      o = setTimeout(() => r(null), 100);
    };
    e.onchange = (a) => {
      const l = a.currentTarget.files;
      r(l && l.length ? Array.from(l) : null);
    }, window.addEventListener("focus", s), e.click();
  });
}
function PD() {
  return /* @__PURE__ */ M(
    Jt.div,
    {
      className: "flex h-full w-full flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      children: [
        /* @__PURE__ */ M("div", { className: "relative", children: [
          /* @__PURE__ */ p(Sf, { className: "h-8 w-8 animate-spin text-primary" }),
          /* @__PURE__ */ p(
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
        /* @__PURE__ */ p("p", { className: "mt-4 text-sm font-medium text-muted-foreground", children: "Transcribing audio..." })
      ]
    }
  );
}
function AD({ isVisible: e, onStopRecording: t }) {
  return /* @__PURE__ */ p(go, { children: e && /* @__PURE__ */ p(
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
      children: /* @__PURE__ */ M("span", { className: "mx-2.5 flex items-center", children: [
        /* @__PURE__ */ p(xv, { className: "mr-2 h-3 w-3" }),
        "Click to finish recording"
      ] })
    }
  ) });
}
function RD({
  isRecording: e,
  isTranscribing: t,
  audioStream: n,
  textAreaHeight: r,
  onStopRecording: i
}) {
  return e ? /* @__PURE__ */ p(
    "div",
    {
      className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
      style: { height: r - 2 },
      children: /* @__PURE__ */ p(
        JI,
        {
          stream: n,
          isRecording: e,
          onClick: i
        }
      )
    }
  ) : t ? /* @__PURE__ */ p(
    "div",
    {
      className: "absolute inset-[1px] z-50 overflow-hidden rounded-xl",
      style: { height: r - 2 },
      children: /* @__PURE__ */ p(PD, {})
    }
  ) : null;
}
function ND({ onClick: e, className: t }) {
  return /* @__PURE__ */ M(oo, { children: [
    /* @__PURE__ */ p(Jr, { asChild: !0, children: /* @__PURE__ */ p(
      We,
      {
        type: "button",
        size: "icon",
        variant: "ghost",
        className: K("h-8 w-8 text-muted-foreground hover:text-foreground", t),
        "aria-label": "Attach a file",
        onClick: e,
        children: /* @__PURE__ */ p(kf, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ p(Qr, { children: "Attach file" })
  ] });
}
function ID({
  isSupported: e,
  isListening: t,
  onClick: n
}) {
  return e ? /* @__PURE__ */ M(oo, { children: [
    /* @__PURE__ */ p(Jr, { asChild: !0, children: /* @__PURE__ */ p(
      We,
      {
        type: "button",
        variant: "ghost",
        "aria-label": t ? "Stop recording" : "Voice input",
        size: "icon",
        onClick: n,
        className: K(
          "h-8 w-8 transition-all duration-200",
          t ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "text-muted-foreground hover:text-foreground"
        ),
        children: t ? /* @__PURE__ */ M("span", { className: "relative flex h-3 w-3", children: [
          /* @__PURE__ */ p("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" }),
          /* @__PURE__ */ p("span", { className: "relative inline-flex h-3 w-3 rounded-full bg-red-500" })
        ] }) : /* @__PURE__ */ p(Cv, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ p(Qr, { children: t ? "Stop recording" : "Use voice input" })
  ] }) : null;
}
function DD({
  isGenerating: e,
  stop: t,
  disabled: n
}) {
  return e && t ? /* @__PURE__ */ M(oo, { children: [
    /* @__PURE__ */ p(Jr, { asChild: !0, children: /* @__PURE__ */ p(
      We,
      {
        type: "button",
        size: "icon",
        variant: "ghost",
        className: "h-8 w-8 text-muted-foreground hover:text-foreground",
        "aria-label": "Stop generating",
        onClick: t,
        children: /* @__PURE__ */ p(Tf, { className: "h-3 w-3 animate-pulse fill-current" })
      }
    ) }),
    /* @__PURE__ */ p(Qr, { children: "Stop generating" })
  ] }) : /* @__PURE__ */ M(oo, { children: [
    /* @__PURE__ */ p(Jr, { asChild: !0, children: /* @__PURE__ */ p(
      We,
      {
        type: "submit",
        size: "icon",
        className: K(
          "h-8 w-8 rounded-full transition-all duration-200",
          n ? "opacity-50" : "bg-primary text-primary-foreground shadow-sm"
        ),
        "aria-label": "Send message",
        disabled: n,
        children: /* @__PURE__ */ p(Na, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ p(Qr, { children: "Send message" })
  ] });
}
function MD() {
  return /* @__PURE__ */ p("div", { className: "justify-left flex space-x-1", children: /* @__PURE__ */ p("div", { className: "rounded-lg bg-muted p-3", children: /* @__PURE__ */ M("div", { className: "flex -space-x-2.5", children: [
    /* @__PURE__ */ p(Ko, { className: "h-5 w-5 animate-typing-dot-bounce" }),
    /* @__PURE__ */ p(Ko, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:90ms]" }),
    /* @__PURE__ */ p(Ko, { className: "h-5 w-5 animate-typing-dot-bounce [animation-delay:180ms]" })
  ] }) }) });
}
function OD({
  messages: e,
  showTimeStamps: t = !0,
  isTyping: n = !1,
  messageOptions: r
}) {
  return /* @__PURE__ */ M("div", { className: "space-y-4 overflow-visible", children: [
    e.map((i, o) => {
      const s = typeof r == "function" ? r(i) : r;
      return /* @__PURE__ */ p(
        HI,
        {
          showTimeStamp: t,
          ...i,
          ...s
        },
        o
      );
    }),
    n && /* @__PURE__ */ p(MD, {})
  ] });
}
function Jg({
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
  isListening: g,
  startListening: m,
  stopListening: b,
  isSpeechSupported: v,
  speak: x,
  stopSpeaking: w,
  isSpeaking: T
}) {
  const E = e.at(-1), k = e.length === 0, A = (E == null ? void 0 : E.role) === "user", I = Me(e);
  I.current = e;
  const F = He(() => {
    if (i == null || i(), !u) return;
    const N = [...I.current], R = N.findLast(
      (H) => H.role === "assistant"
    );
    if (!R) return;
    let B = !1, $ = { ...R };
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
      B && ($ = {
        ...$,
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
      B && ($ = {
        ...$,
        parts: H
      });
    }
    if (B) {
      const H = N.findIndex(
        (V) => V.id === R.id
      );
      H !== -1 && (N[H] = $, u(N));
    }
  }, [i, u, I]), P = He(
    (N) => ({
      actions: /* @__PURE__ */ M(dt, { children: [
        x && /* @__PURE__ */ p(
          We,
          {
            size: "icon",
            variant: "ghost",
            className: "h-6 w-6",
            onClick: () => {
              T && w ? w() : x(N.content);
            },
            children: T ? /* @__PURE__ */ p(Tf, { className: "h-3 w-3 fill-current" }) : /* @__PURE__ */ p(Iv, { className: "h-4 w-4" })
          }
        ),
        c ? /* @__PURE__ */ M(dt, { children: [
          /* @__PURE__ */ p("div", { className: "border-r pr-1 inline-flex items-center h-4 my-auto mx-1", children: /* @__PURE__ */ p(
            Qi,
            {
              content: N.content,
              copyMessage: "Copied response to clipboard!"
            }
          ) }),
          /* @__PURE__ */ p(
            We,
            {
              size: "icon",
              variant: "ghost",
              className: "h-6 w-6",
              onClick: () => c(N.id, "thumbs-up"),
              children: /* @__PURE__ */ p(Nv, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ p(
            We,
            {
              size: "icon",
              variant: "ghost",
              className: "h-6 w-6",
              onClick: () => c(N.id, "thumbs-down"),
              children: /* @__PURE__ */ p(Rv, { className: "h-4 w-4" })
            }
          )
        ] }) : /* @__PURE__ */ p(
          Qi,
          {
            content: N.content,
            copyMessage: "Copied response to clipboard!"
          }
        )
      ] })
    }),
    [c, x, T, w]
  );
  return /* @__PURE__ */ M(Qg, { className: K(l, "relative"), children: [
    /* @__PURE__ */ p("div", { className: "flex-1 min-h-0 flex flex-col overflow-hidden", children: k && s && a ? /* @__PURE__ */ p("div", { className: "flex h-full flex-col justify-center overflow-y-auto", children: /* @__PURE__ */ p(
      ga,
      {
        label: f || "",
        append: s,
        suggestions: a
      }
    ) }) : e.length > 0 ? /* @__PURE__ */ p(LD, { messages: e, className: "flex-1 w-full px-4 pt-8", children: /* @__PURE__ */ M("div", { className: "max-w-4xl mx-auto w-full", children: [
      /* @__PURE__ */ p(
        OD,
        {
          messages: e,
          isTyping: A,
          messageOptions: P
        }
      ),
      s && a && a.length > 0 && !o && /* @__PURE__ */ p("div", { className: "mt-6 flex flex-wrap gap-2 pb-8", children: a.map((N) => /* @__PURE__ */ p(
        We,
        {
          variant: "outline",
          size: "sm",
          className: "rounded-xl bg-background/50 backdrop-blur-sm text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-primary/20 hover:border-primary shadow-sm",
          onClick: () => s({ role: "user", content: N }),
          children: N
        },
        N
      )) })
    ] }) }) : /* @__PURE__ */ p("div", { className: "flex-1" }) }),
    /* @__PURE__ */ p("div", { className: "flex-none w-full max-w-4xl mx-auto px-4 pb-6", children: /* @__PURE__ */ p(
      ey,
      {
        className: "relative",
        isPending: o || A,
        handleSubmit: t,
        children: ({ files: N, setFiles: R }) => /* @__PURE__ */ p(
          Zg,
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
            isListening: g,
            startListening: m,
            stopListening: b,
            isSpeechSupported: v
          }
        )
      }
    ) })
  ] });
}
Jg.displayName = "Chat";
function LD({
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
  } = fb([e]);
  return /* @__PURE__ */ M(
    "div",
    {
      className: K("grid grid-cols-1 overflow-y-auto pb-4", n),
      ref: r,
      onScroll: o,
      onTouchStart: a,
      children: [
        /* @__PURE__ */ p("div", { className: "max-w-full [grid-column:1/1] [grid-row:1/1]", children: t }),
        !s && /* @__PURE__ */ p("div", { className: "pointer-events-none flex flex-1 items-end justify-end [grid-column:1/1] [grid-row:1/1]", children: /* @__PURE__ */ p("div", { className: "sticky bottom-0 left-0 flex w-full justify-end", children: /* @__PURE__ */ p(
          We,
          {
            onClick: i,
            className: "pointer-events-auto h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1",
            size: "icon",
            variant: "ghost",
            children: /* @__PURE__ */ p(hv, { className: "h-4 w-4" })
          }
        ) }) })
      ]
    }
  );
}
const Qg = fr(({ className: e, ...t }, n) => /* @__PURE__ */ p(
  "div",
  {
    ref: n,
    className: K("flex flex-col h-full w-full", e),
    ...t
  }
));
Qg.displayName = "ChatContainer";
const ey = fr(
  ({ children: e, handleSubmit: t, className: n }, r) => {
    const [i, o] = ne(null);
    return /* @__PURE__ */ p("form", { ref: r, onSubmit: (a) => {
      if (!i) {
        t(a);
        return;
      }
      const l = _D(i);
      t(a, { experimental_attachments: l }), o(null);
    }, className: n, children: e({ files: i, setFiles: o }) });
  }
);
ey.displayName = "ChatForm";
function _D(e) {
  const t = new DataTransfer();
  for (const n of Array.from(e))
    t.items.add(n);
  return t.files;
}
function FD({ ...e }) {
  return /* @__PURE__ */ p($p, { "data-slot": "sheet", ...e });
}
function VD({
  ...e
}) {
  return /* @__PURE__ */ p(Lk, { "data-slot": "sheet-trigger", ...e });
}
function BD({
  ...e
}) {
  return /* @__PURE__ */ p(jp, { "data-slot": "sheet-portal", ...e });
}
function zD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ p(
    xl,
    {
      "data-slot": "sheet-overlay",
      className: K(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        e
      ),
      ...t
    }
  );
}
function $D({
  className: e,
  children: t,
  side: n = "right",
  ...r
}) {
  return /* @__PURE__ */ p(BD, { children: /* @__PURE__ */ M("div", { className: "chat-theme", children: [
    /* @__PURE__ */ p(zD, {}),
    /* @__PURE__ */ M(
      wl,
      {
        "data-slot": "sheet-content",
        className: K(
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
          /* @__PURE__ */ M(Up, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ p(zn, { className: "size-4" }),
            /* @__PURE__ */ p("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] }) });
}
function jD({ className: e, ...t }) {
  return /* @__PURE__ */ p(
    "div",
    {
      "data-slot": "sheet-header",
      className: K("flex flex-col gap-1.5 p-4", e),
      ...t
    }
  );
}
function UD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ p(
    Sl,
    {
      "data-slot": "sheet-title",
      className: K("text-foreground font-semibold", e),
      ...t
    }
  );
}
function HD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ p(
    kl,
    {
      "data-slot": "sheet-description",
      className: K("text-muted-foreground text-sm", e),
      ...t
    }
  );
}
function WD({
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
  return /* @__PURE__ */ M(FD, { open: e, onOpenChange: t, children: [
    /* @__PURE__ */ p(VD, { asChild: !0, children: /* @__PURE__ */ p(
      We,
      {
        variant: "ghost",
        size: "icon",
        onClick: a,
        title: "Chat History",
        className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
        children: /* @__PURE__ */ p(hc, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ M($D, { side: l, className: "w-[300px] sm:w-[400px] border-l border-border/40 backdrop-blur-2xl", children: [
      /* @__PURE__ */ M(jD, { className: "mb-6", children: [
        /* @__PURE__ */ p(UD, { className: "text-xl font-bold tracking-tight", children: "Chat History" }),
        /* @__PURE__ */ p(HD, { className: "text-sm", children: "Select a previous conversation to continue." })
      ] }),
      /* @__PURE__ */ p("div", { className: "px-2", children: /* @__PURE__ */ M(
        We,
        {
          variant: "outline",
          className: "w-full justify-start gap-2.5 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium",
          onClick: o,
          disabled: s,
          children: [
            /* @__PURE__ */ p(Cf, { className: K("h-4 w-4", s && "animate-spin") }),
            " New Conversation"
          ]
        }
      ) }),
      /* @__PURE__ */ p("div", { className: "flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-2 mt-6 custom-scrollbar", children: n.length === 0 ? /* @__PURE__ */ M("div", { className: "flex flex-col items-center justify-center py-12 px-4 text-center", children: [
        /* @__PURE__ */ p("div", { className: "h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/40", children: /* @__PURE__ */ p(hc, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ p("p", { className: "text-sm font-medium text-muted-foreground", children: "No recent conversations" }),
        /* @__PURE__ */ p("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Start chatting to see history here." })
      ] }) : n.map((c) => /* @__PURE__ */ M(
        "button",
        {
          className: K(
            "group flex flex-col gap-1 w-full text-left p-3.5 rounded-xl transition-all duration-200 border border-transparent",
            r === c.thread_id ? "bg-primary/5 border-primary/20 shadow-sm" : "hover:bg-muted/50 hover:border-border/50"
          ),
          onClick: () => i(c.thread_id),
          children: [
            /* @__PURE__ */ p("span", { className: K(
              "font-semibold truncate text-[13px]",
              r === c.thread_id ? "text-primary" : "text-foreground"
            ), children: c.thread_id || "Untitled Conversation" }),
            /* @__PURE__ */ M("span", { className: "text-[11px] text-muted-foreground flex items-center gap-2", children: [
              c.updated_at ? new Date(c.updated_at).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" }) : "Recently",
              /* @__PURE__ */ p("span", { className: "h-1 w-1 rounded-full bg-muted-foreground/30" }),
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
function pf(e) {
  const t = /* @__PURE__ */ qD(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(GD);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ p(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ p(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function qD(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = XD(i), a = YD(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? $n(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var KD = Symbol("radix.slottable");
function GD(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === KD;
}
function YD(e, t) {
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
function XD(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function ty(e) {
  const t = e + "CollectionProvider", [n, r] = tn(t), [i, o] = n(
    t,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), s = (m) => {
    const { scope: b, children: v } = m, x = j.useRef(null), w = j.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ p(i, { scope: b, itemMap: w, collectionRef: x, children: v });
  };
  s.displayName = t;
  const a = e + "CollectionSlot", l = /* @__PURE__ */ pf(a), c = j.forwardRef(
    (m, b) => {
      const { scope: v, children: x } = m, w = o(a, v), T = we(b, w.collectionRef);
      return /* @__PURE__ */ p(l, { ref: T, children: x });
    }
  );
  c.displayName = a;
  const u = e + "CollectionItemSlot", d = "data-radix-collection-item", h = /* @__PURE__ */ pf(u), f = j.forwardRef(
    (m, b) => {
      const { scope: v, children: x, ...w } = m, T = j.useRef(null), E = we(b, T), k = o(u, v);
      return j.useEffect(() => (k.itemMap.set(T, { ref: T, ...w }), () => void k.itemMap.delete(T))), /* @__PURE__ */ p(h, { [d]: "", ref: E, children: x });
    }
  );
  f.displayName = u;
  function g(m) {
    const b = o(e + "CollectionConsumer", m);
    return j.useCallback(() => {
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
    g,
    r
  ];
}
var ZD = y.createContext(void 0);
function ny(e) {
  const t = y.useContext(ZD);
  return e || t || "ltr";
}
// @__NO_SIDE_EFFECTS__
function JD(e) {
  const t = /* @__PURE__ */ QD(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(tM);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ p(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ p(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function QD(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = rM(i), a = nM(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? $n(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var eM = Symbol("radix.slottable");
function tM(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === eM;
}
function nM(e, t) {
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
function rM(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function lc(e) {
  const t = y.useRef({ value: e, previous: e });
  return y.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
var iM = [" ", "Enter", "ArrowUp", "ArrowDown"], oM = [" ", "Enter"], Vn = "Select", [jo, Uo, sM] = ty(Vn), [kr] = tn(Vn, [
  sM,
  Sr
]), Ho = Sr(), [aM, xn] = kr(Vn), [lM, cM] = kr(Vn), ry = (e) => {
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
    form: g
  } = e, m = Ho(t), [b, v] = y.useState(null), [x, w] = y.useState(null), [T, E] = y.useState(!1), k = ny(c), [A, I] = pn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Vn
  }), [F, P] = pn({
    prop: s,
    defaultProp: a,
    onChange: l,
    caller: Vn
  }), N = y.useRef(null), R = b ? g || !!b.closest("form") : !0, [B, $] = y.useState(/* @__PURE__ */ new Set()), H = Array.from(B).map((V) => V.props.value).join(";");
  return /* @__PURE__ */ p(Ql, { ...m, children: /* @__PURE__ */ M(
    aM,
    {
      required: f,
      scope: t,
      trigger: b,
      onTriggerChange: v,
      valueNode: x,
      onValueNodeChange: w,
      valueNodeHasChildren: T,
      onValueNodeHasChildrenChange: E,
      contentId: Xt(),
      value: F,
      onValueChange: P,
      open: A,
      onOpenChange: I,
      dir: k,
      triggerPointerDownPosRef: N,
      disabled: h,
      children: [
        /* @__PURE__ */ p(jo.Provider, { scope: t, children: /* @__PURE__ */ p(
          lM,
          {
            scope: e.__scopeSelect,
            onNativeOptionAdd: y.useCallback((V) => {
              $((D) => new Set(D).add(V));
            }, []),
            onNativeOptionRemove: y.useCallback((V) => {
              $((D) => {
                const _ = new Set(D);
                return _.delete(V), _;
              });
            }, []),
            children: n
          }
        ) }),
        R ? /* @__PURE__ */ M(
          Ty,
          {
            "aria-hidden": !0,
            required: f,
            tabIndex: -1,
            name: u,
            autoComplete: d,
            value: F,
            onChange: (V) => P(V.target.value),
            disabled: h,
            form: g,
            children: [
              F === void 0 ? /* @__PURE__ */ p("option", { value: "" }) : null,
              Array.from(B)
            ]
          },
          H
        ) : null
      ]
    }
  ) });
};
ry.displayName = Vn;
var iy = "SelectTrigger", oy = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, disabled: r = !1, ...i } = e, o = Ho(n), s = xn(iy, n), a = s.disabled || r, l = we(t, s.onTriggerChange), c = Uo(n), u = y.useRef("touch"), [d, h, f] = Py((m) => {
      const b = c().filter((w) => !w.disabled), v = b.find((w) => w.value === s.value), x = Ay(b, m, v);
      x !== void 0 && s.onValueChange(x.value);
    }), g = (m) => {
      a || (s.onOpenChange(!0), f()), m && (s.triggerPointerDownPosRef.current = {
        x: Math.round(m.pageX),
        y: Math.round(m.pageY)
      });
    };
    return /* @__PURE__ */ p(Vo, { asChild: !0, ...o, children: /* @__PURE__ */ p(
      pe.button,
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
        "data-placeholder": Ey(s.value) ? "" : void 0,
        ...i,
        ref: l,
        onClick: ae(i.onClick, (m) => {
          m.currentTarget.focus(), u.current !== "mouse" && g(m);
        }),
        onPointerDown: ae(i.onPointerDown, (m) => {
          u.current = m.pointerType;
          const b = m.target;
          b.hasPointerCapture(m.pointerId) && b.releasePointerCapture(m.pointerId), m.button === 0 && m.ctrlKey === !1 && m.pointerType === "mouse" && (g(m), m.preventDefault());
        }),
        onKeyDown: ae(i.onKeyDown, (m) => {
          const b = d.current !== "";
          !(m.ctrlKey || m.altKey || m.metaKey) && m.key.length === 1 && h(m.key), !(b && m.key === " ") && iM.includes(m.key) && (g(), m.preventDefault());
        })
      }
    ) });
  }
);
oy.displayName = iy;
var sy = "SelectValue", ay = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, children: o, placeholder: s = "", ...a } = e, l = xn(sy, n), { onValueNodeHasChildrenChange: c } = l, u = o !== void 0, d = we(t, l.onValueNodeChange);
    return Ye(() => {
      c(u);
    }, [c, u]), /* @__PURE__ */ p(
      pe.span,
      {
        ...a,
        ref: d,
        style: { pointerEvents: "none" },
        children: Ey(l.value) ? /* @__PURE__ */ p(dt, { children: s }) : o
      }
    );
  }
);
ay.displayName = sy;
var uM = "SelectIcon", ly = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, children: r, ...i } = e;
    return /* @__PURE__ */ p(pe.span, { "aria-hidden": !0, ...i, ref: t, children: r || "▼" });
  }
);
ly.displayName = uM;
var dM = "SelectPortal", cy = (e) => /* @__PURE__ */ p(oi, { asChild: !0, ...e });
cy.displayName = dM;
var Bn = "SelectContent", uy = y.forwardRef(
  (e, t) => {
    const n = xn(Bn, e.__scopeSelect), [r, i] = y.useState();
    if (Ye(() => {
      i(new DocumentFragment());
    }, []), !n.open) {
      const o = r;
      return o ? ho.createPortal(
        /* @__PURE__ */ p(dy, { scope: e.__scopeSelect, children: /* @__PURE__ */ p(jo.Slot, { scope: e.__scopeSelect, children: /* @__PURE__ */ p("div", { children: e.children }) }) }),
        o
      ) : null;
    }
    return /* @__PURE__ */ p(fy, { ...e, ref: t });
  }
);
uy.displayName = Bn;
var It = 10, [dy, wn] = kr(Bn), fM = "SelectContentImpl", hM = /* @__PURE__ */ JD("SelectContent.RemoveScroll"), fy = y.forwardRef(
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
      sticky: g,
      hideWhenDetached: m,
      avoidCollisions: b,
      //
      ...v
    } = e, x = xn(Bn, n), [w, T] = y.useState(null), [E, k] = y.useState(null), A = we(t, (W) => T(W)), [I, F] = y.useState(null), [P, N] = y.useState(
      null
    ), R = Uo(n), [B, $] = y.useState(!1), H = y.useRef(!1);
    y.useEffect(() => {
      if (w) return gl(w);
    }, [w]), ml();
    const V = y.useCallback(
      (W) => {
        const [ie, ...me] = R().map((ge) => ge.ref.current), [le] = me.slice(-1), ce = document.activeElement;
        for (const ge of W)
          if (ge === ce || (ge == null || ge.scrollIntoView({ block: "nearest" }), ge === ie && E && (E.scrollTop = 0), ge === le && E && (E.scrollTop = E.scrollHeight), ge == null || ge.focus(), document.activeElement !== ce)) return;
      },
      [R, E]
    ), D = y.useCallback(
      () => V([I, w]),
      [V, I, w]
    );
    y.useEffect(() => {
      B && D();
    }, [B, D]);
    const { onOpenChange: _, triggerPointerDownPosRef: L } = x;
    y.useEffect(() => {
      if (w) {
        let W = { x: 0, y: 0 };
        const ie = (le) => {
          var ce, ge;
          W = {
            x: Math.abs(Math.round(le.pageX) - (((ce = L.current) == null ? void 0 : ce.x) ?? 0)),
            y: Math.abs(Math.round(le.pageY) - (((ge = L.current) == null ? void 0 : ge.y) ?? 0))
          };
        }, me = (le) => {
          W.x <= 10 && W.y <= 10 ? le.preventDefault() : w.contains(le.target) || _(!1), document.removeEventListener("pointermove", ie), L.current = null;
        };
        return L.current !== null && (document.addEventListener("pointermove", ie), document.addEventListener("pointerup", me, { capture: !0, once: !0 })), () => {
          document.removeEventListener("pointermove", ie), document.removeEventListener("pointerup", me, { capture: !0 });
        };
      }
    }, [w, _, L]), y.useEffect(() => {
      const W = () => _(!1);
      return window.addEventListener("blur", W), window.addEventListener("resize", W), () => {
        window.removeEventListener("blur", W), window.removeEventListener("resize", W);
      };
    }, [_]);
    const [S, te] = Py((W) => {
      const ie = R().filter((ce) => !ce.disabled), me = ie.find((ce) => ce.ref.current === document.activeElement), le = Ay(ie, W, me);
      le && setTimeout(() => le.ref.current.focus());
    }), Z = y.useCallback(
      (W, ie, me) => {
        const le = !H.current && !me;
        (x.value !== void 0 && x.value === ie || le) && (F(W), le && (H.current = !0));
      },
      [x.value]
    ), C = y.useCallback(() => w == null ? void 0 : w.focus(), [w]), q = y.useCallback(
      (W, ie, me) => {
        const le = !H.current && !me;
        (x.value !== void 0 && x.value === ie || le) && N(W);
      },
      [x.value]
    ), Y = r === "popper" ? ba : hy, se = Y === ba ? {
      side: a,
      sideOffset: l,
      align: c,
      alignOffset: u,
      arrowPadding: d,
      collisionBoundary: h,
      collisionPadding: f,
      sticky: g,
      hideWhenDetached: m,
      avoidCollisions: b
    } : {};
    return /* @__PURE__ */ p(
      dy,
      {
        scope: n,
        content: w,
        viewport: E,
        onViewportChange: k,
        itemRefCallback: Z,
        selectedItem: I,
        onItemLeave: C,
        itemTextRefCallback: q,
        focusSelectedItem: D,
        selectedItemText: P,
        position: r,
        isPositioned: B,
        searchRef: S,
        children: /* @__PURE__ */ p(Eo, { as: hM, allowPinchZoom: !0, children: /* @__PURE__ */ p(
          Co,
          {
            asChild: !0,
            trapped: x.open,
            onMountAutoFocus: (W) => {
              W.preventDefault();
            },
            onUnmountAutoFocus: ae(i, (W) => {
              var ie;
              (ie = x.trigger) == null || ie.focus({ preventScroll: !0 }), W.preventDefault();
            }),
            children: /* @__PURE__ */ p(
              ii,
              {
                asChild: !0,
                disableOutsidePointerEvents: !0,
                onEscapeKeyDown: o,
                onPointerDownOutside: s,
                onFocusOutside: (W) => W.preventDefault(),
                onDismiss: () => x.onOpenChange(!1),
                children: /* @__PURE__ */ p(
                  Y,
                  {
                    role: "listbox",
                    id: x.contentId,
                    "data-state": x.open ? "open" : "closed",
                    dir: x.dir,
                    onContextMenu: (W) => W.preventDefault(),
                    ...v,
                    ...se,
                    onPlaced: () => $(!0),
                    ref: A,
                    style: {
                      // flex layout so we can place the scroll buttons properly
                      display: "flex",
                      flexDirection: "column",
                      // reset the outline by default as the content MAY get focused
                      outline: "none",
                      ...v.style
                    },
                    onKeyDown: ae(v.onKeyDown, (W) => {
                      const ie = W.ctrlKey || W.altKey || W.metaKey;
                      if (W.key === "Tab" && W.preventDefault(), !ie && W.key.length === 1 && te(W.key), ["ArrowUp", "ArrowDown", "Home", "End"].includes(W.key)) {
                        let le = R().filter((ce) => !ce.disabled).map((ce) => ce.ref.current);
                        if (["ArrowUp", "End"].includes(W.key) && (le = le.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(W.key)) {
                          const ce = W.target, ge = le.indexOf(ce);
                          le = le.slice(ge + 1);
                        }
                        setTimeout(() => V(le)), W.preventDefault();
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
fy.displayName = fM;
var pM = "SelectItemAlignedPosition", hy = y.forwardRef((e, t) => {
  const { __scopeSelect: n, onPlaced: r, ...i } = e, o = xn(Bn, n), s = wn(Bn, n), [a, l] = y.useState(null), [c, u] = y.useState(null), d = we(t, (A) => u(A)), h = Uo(n), f = y.useRef(!1), g = y.useRef(!0), { viewport: m, selectedItem: b, selectedItemText: v, focusSelectedItem: x } = s, w = y.useCallback(() => {
    if (o.trigger && o.valueNode && a && c && m && b && v) {
      const A = o.trigger.getBoundingClientRect(), I = c.getBoundingClientRect(), F = o.valueNode.getBoundingClientRect(), P = v.getBoundingClientRect();
      if (o.dir !== "rtl") {
        const ce = P.left - I.left, ge = F.left - ce, Be = A.left - ge, Xe = A.width + Be, pt = Math.max(Xe, I.width), lt = window.innerWidth - It, wt = so(ge, [
          It,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(It, lt - pt)
        ]);
        a.style.minWidth = Xe + "px", a.style.left = wt + "px";
      } else {
        const ce = I.right - P.right, ge = window.innerWidth - F.right - ce, Be = window.innerWidth - A.right - ge, Xe = A.width + Be, pt = Math.max(Xe, I.width), lt = window.innerWidth - It, wt = so(ge, [
          It,
          Math.max(It, lt - pt)
        ]);
        a.style.minWidth = Xe + "px", a.style.right = wt + "px";
      }
      const N = h(), R = window.innerHeight - It * 2, B = m.scrollHeight, $ = window.getComputedStyle(c), H = parseInt($.borderTopWidth, 10), V = parseInt($.paddingTop, 10), D = parseInt($.borderBottomWidth, 10), _ = parseInt($.paddingBottom, 10), L = H + V + B + _ + D, S = Math.min(b.offsetHeight * 5, L), te = window.getComputedStyle(m), Z = parseInt(te.paddingTop, 10), C = parseInt(te.paddingBottom, 10), q = A.top + A.height / 2 - It, Y = R - q, se = b.offsetHeight / 2, W = b.offsetTop + se, ie = H + V + W, me = L - ie;
      if (ie <= q) {
        const ce = N.length > 0 && b === N[N.length - 1].ref.current;
        a.style.bottom = "0px";
        const ge = c.clientHeight - m.offsetTop - m.offsetHeight, Be = Math.max(
          Y,
          se + // viewport might have padding bottom, include it to avoid a scrollable viewport
          (ce ? C : 0) + ge + D
        ), Xe = ie + Be;
        a.style.height = Xe + "px";
      } else {
        const ce = N.length > 0 && b === N[0].ref.current;
        a.style.top = "0px";
        const Be = Math.max(
          q,
          H + m.offsetTop + // viewport might have padding top, include it to avoid a scrollable viewport
          (ce ? Z : 0) + se
        ) + me;
        a.style.height = Be + "px", m.scrollTop = ie - q + m.offsetTop;
      }
      a.style.margin = `${It}px 0`, a.style.minHeight = S + "px", a.style.maxHeight = R + "px", r == null || r(), requestAnimationFrame(() => f.current = !0);
    }
  }, [
    h,
    o.trigger,
    o.valueNode,
    a,
    c,
    m,
    b,
    v,
    o.dir,
    r
  ]);
  Ye(() => w(), [w]);
  const [T, E] = y.useState();
  Ye(() => {
    c && E(window.getComputedStyle(c).zIndex);
  }, [c]);
  const k = y.useCallback(
    (A) => {
      A && g.current === !0 && (w(), x == null || x(), g.current = !1);
    },
    [w, x]
  );
  return /* @__PURE__ */ p(
    gM,
    {
      scope: n,
      contentWrapper: a,
      shouldExpandOnScrollRef: f,
      onScrollButtonChange: k,
      children: /* @__PURE__ */ p(
        "div",
        {
          ref: l,
          style: {
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            zIndex: T
          },
          children: /* @__PURE__ */ p(
            pe.div,
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
hy.displayName = pM;
var mM = "SelectPopperPosition", ba = y.forwardRef((e, t) => {
  const {
    __scopeSelect: n,
    align: r = "start",
    collisionPadding: i = It,
    ...o
  } = e, s = Ho(n);
  return /* @__PURE__ */ p(
    ec,
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
ba.displayName = mM;
var [gM, cc] = kr(Bn, {}), xa = "SelectViewport", py = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, nonce: r, ...i } = e, o = wn(xa, n), s = cc(xa, n), a = we(t, o.onViewportChange), l = y.useRef(0);
    return /* @__PURE__ */ M(dt, { children: [
      /* @__PURE__ */ p(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}"
          },
          nonce: r
        }
      ),
      /* @__PURE__ */ p(jo.Slot, { scope: n, children: /* @__PURE__ */ p(
        pe.div,
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
          onScroll: ae(i.onScroll, (c) => {
            const u = c.currentTarget, { contentWrapper: d, shouldExpandOnScrollRef: h } = s;
            if (h != null && h.current && d) {
              const f = Math.abs(l.current - u.scrollTop);
              if (f > 0) {
                const g = window.innerHeight - It * 2, m = parseFloat(d.style.minHeight), b = parseFloat(d.style.height), v = Math.max(m, b);
                if (v < g) {
                  const x = v + f, w = Math.min(g, x), T = x - w;
                  d.style.height = w + "px", d.style.bottom === "0px" && (u.scrollTop = T > 0 ? T : 0, d.style.justifyContent = "flex-end");
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
py.displayName = xa;
var my = "SelectGroup", [yM, vM] = kr(my), bM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = Xt();
    return /* @__PURE__ */ p(yM, { scope: n, id: i, children: /* @__PURE__ */ p(pe.div, { role: "group", "aria-labelledby": i, ...r, ref: t }) });
  }
);
bM.displayName = my;
var gy = "SelectLabel", xM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = vM(gy, n);
    return /* @__PURE__ */ p(pe.div, { id: i.id, ...r, ref: t });
  }
);
xM.displayName = gy;
var ao = "SelectItem", [wM, yy] = kr(ao), vy = y.forwardRef(
  (e, t) => {
    const {
      __scopeSelect: n,
      value: r,
      disabled: i = !1,
      textValue: o,
      ...s
    } = e, a = xn(ao, n), l = wn(ao, n), c = a.value === r, [u, d] = y.useState(o ?? ""), [h, f] = y.useState(!1), g = we(
      t,
      (x) => {
        var w;
        return (w = l.itemRefCallback) == null ? void 0 : w.call(l, x, r, i);
      }
    ), m = Xt(), b = y.useRef("touch"), v = () => {
      i || (a.onValueChange(r), a.onOpenChange(!1));
    };
    if (r === "")
      throw new Error(
        "A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
      );
    return /* @__PURE__ */ p(
      wM,
      {
        scope: n,
        value: r,
        disabled: i,
        textId: m,
        isSelected: c,
        onItemTextChange: y.useCallback((x) => {
          d((w) => w || ((x == null ? void 0 : x.textContent) ?? "").trim());
        }, []),
        children: /* @__PURE__ */ p(
          jo.ItemSlot,
          {
            scope: n,
            value: r,
            disabled: i,
            textValue: u,
            children: /* @__PURE__ */ p(
              pe.div,
              {
                role: "option",
                "aria-labelledby": m,
                "data-highlighted": h ? "" : void 0,
                "aria-selected": c && h,
                "data-state": c ? "checked" : "unchecked",
                "aria-disabled": i || void 0,
                "data-disabled": i ? "" : void 0,
                tabIndex: i ? void 0 : -1,
                ...s,
                ref: g,
                onFocus: ae(s.onFocus, () => f(!0)),
                onBlur: ae(s.onBlur, () => f(!1)),
                onClick: ae(s.onClick, () => {
                  b.current !== "mouse" && v();
                }),
                onPointerUp: ae(s.onPointerUp, () => {
                  b.current === "mouse" && v();
                }),
                onPointerDown: ae(s.onPointerDown, (x) => {
                  b.current = x.pointerType;
                }),
                onPointerMove: ae(s.onPointerMove, (x) => {
                  var w;
                  b.current = x.pointerType, i ? (w = l.onItemLeave) == null || w.call(l) : b.current === "mouse" && x.currentTarget.focus({ preventScroll: !0 });
                }),
                onPointerLeave: ae(s.onPointerLeave, (x) => {
                  var w;
                  x.currentTarget === document.activeElement && ((w = l.onItemLeave) == null || w.call(l));
                }),
                onKeyDown: ae(s.onKeyDown, (x) => {
                  var T;
                  ((T = l.searchRef) == null ? void 0 : T.current) !== "" && x.key === " " || (oM.includes(x.key) && v(), x.key === " " && x.preventDefault());
                })
              }
            )
          }
        )
      }
    );
  }
);
vy.displayName = ao;
var Or = "SelectItemText", by = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, ...o } = e, s = xn(Or, n), a = wn(Or, n), l = yy(Or, n), c = cM(Or, n), [u, d] = y.useState(null), h = we(
      t,
      (v) => d(v),
      l.onItemTextChange,
      (v) => {
        var x;
        return (x = a.itemTextRefCallback) == null ? void 0 : x.call(a, v, l.value, l.disabled);
      }
    ), f = u == null ? void 0 : u.textContent, g = y.useMemo(
      () => /* @__PURE__ */ p("option", { value: l.value, disabled: l.disabled, children: f }, l.value),
      [l.disabled, l.value, f]
    ), { onNativeOptionAdd: m, onNativeOptionRemove: b } = c;
    return Ye(() => (m(g), () => b(g)), [m, b, g]), /* @__PURE__ */ M(dt, { children: [
      /* @__PURE__ */ p(pe.span, { id: l.textId, ...o, ref: h }),
      l.isSelected && s.valueNode && !s.valueNodeHasChildren ? ho.createPortal(o.children, s.valueNode) : null
    ] });
  }
);
by.displayName = Or;
var xy = "SelectItemIndicator", wy = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return yy(xy, n).isSelected ? /* @__PURE__ */ p(pe.span, { "aria-hidden": !0, ...r, ref: t }) : null;
  }
);
wy.displayName = xy;
var wa = "SelectScrollUpButton", Sy = y.forwardRef((e, t) => {
  const n = wn(wa, e.__scopeSelect), r = cc(wa, e.__scopeSelect), [i, o] = y.useState(!1), s = we(t, r.onScrollButtonChange);
  return Ye(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollTop > 0;
        o(c);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ p(
    Cy,
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
Sy.displayName = wa;
var Sa = "SelectScrollDownButton", ky = y.forwardRef((e, t) => {
  const n = wn(Sa, e.__scopeSelect), r = cc(Sa, e.__scopeSelect), [i, o] = y.useState(!1), s = we(t, r.onScrollButtonChange);
  return Ye(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollHeight - l.clientHeight, u = Math.ceil(l.scrollTop) < c;
        o(u);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ p(
    Cy,
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
ky.displayName = Sa;
var Cy = y.forwardRef((e, t) => {
  const { __scopeSelect: n, onAutoScroll: r, ...i } = e, o = wn("SelectScrollButton", n), s = y.useRef(null), a = Uo(n), l = y.useCallback(() => {
    s.current !== null && (window.clearInterval(s.current), s.current = null);
  }, []);
  return y.useEffect(() => () => l(), [l]), Ye(() => {
    var u;
    const c = a().find((d) => d.ref.current === document.activeElement);
    (u = c == null ? void 0 : c.ref.current) == null || u.scrollIntoView({ block: "nearest" });
  }, [a]), /* @__PURE__ */ p(
    pe.div,
    {
      "aria-hidden": !0,
      ...i,
      ref: t,
      style: { flexShrink: 0, ...i.style },
      onPointerDown: ae(i.onPointerDown, () => {
        s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerMove: ae(i.onPointerMove, () => {
        var c;
        (c = o.onItemLeave) == null || c.call(o), s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerLeave: ae(i.onPointerLeave, () => {
        l();
      })
    }
  );
}), SM = "SelectSeparator", kM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return /* @__PURE__ */ p(pe.div, { "aria-hidden": !0, ...r, ref: t });
  }
);
kM.displayName = SM;
var ka = "SelectArrow", CM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = Ho(n), o = xn(ka, n), s = wn(ka, n);
    return o.open && s.position === "popper" ? /* @__PURE__ */ p(tc, { ...i, ...r, ref: t }) : null;
  }
);
CM.displayName = ka;
var TM = "SelectBubbleInput", Ty = y.forwardRef(
  ({ __scopeSelect: e, value: t, ...n }, r) => {
    const i = y.useRef(null), o = we(r, i), s = lc(t);
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
    }, [s, t]), /* @__PURE__ */ p(
      pe.select,
      {
        ...n,
        style: { ..._g, ...n.style },
        ref: o,
        defaultValue: t
      }
    );
  }
);
Ty.displayName = TM;
function Ey(e) {
  return e === "" || e === void 0;
}
function Py(e) {
  const t = On(e), n = y.useRef(""), r = y.useRef(0), i = y.useCallback(
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
function Ay(e, t, n) {
  const i = t.length > 1 && Array.from(t).every((c) => c === t[0]) ? t[0] : t, o = n ? e.indexOf(n) : -1;
  let s = EM(e, Math.max(o, 0));
  i.length === 1 && (s = s.filter((c) => c !== n));
  const l = s.find(
    (c) => c.textValue.toLowerCase().startsWith(i.toLowerCase())
  );
  return l !== n ? l : void 0;
}
function EM(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
var PM = ry, AM = oy, RM = ay, NM = ly, IM = cy, DM = uy, MM = py, OM = vy, LM = by, _M = wy, FM = Sy, VM = ky;
function lo({
  ...e
}) {
  return /* @__PURE__ */ p(PM, { "data-slot": "select", ...e });
}
function co({
  ...e
}) {
  return /* @__PURE__ */ p(RM, { "data-slot": "select-value", ...e });
}
function uo({
  className: e,
  size: t = "default",
  children: n,
  ...r
}) {
  return /* @__PURE__ */ M(
    AM,
    {
      "data-slot": "select-trigger",
      "data-size": t,
      className: K(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...r,
      children: [
        n,
        /* @__PURE__ */ p(NM, { asChild: !0, children: /* @__PURE__ */ p(wf, { className: "size-4 opacity-50" }) })
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
  return /* @__PURE__ */ p(IM, { children: /* @__PURE__ */ p("div", { className: "chat-theme", children: /* @__PURE__ */ M(
    DM,
    {
      "data-slot": "select-content",
      className: K(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        e
      ),
      position: n,
      align: r,
      ...i,
      children: [
        /* @__PURE__ */ p(BM, {}),
        /* @__PURE__ */ p(
          MM,
          {
            className: K(
              "p-1",
              n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children: t
          }
        ),
        /* @__PURE__ */ p(zM, {})
      ]
    }
  ) }) });
}
function Qe({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ M(
    OM,
    {
      "data-slot": "select-item",
      className: K(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...n,
      children: [
        /* @__PURE__ */ p(
          "span",
          {
            "data-slot": "select-item-indicator",
            className: "absolute right-2 flex size-3.5 items-center justify-center",
            children: /* @__PURE__ */ p(_M, { children: /* @__PURE__ */ p(xf, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ p(LM, { children: t })
      ]
    }
  );
}
function BM({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ p(
    FM,
    {
      "data-slot": "select-scroll-up-button",
      className: K(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ p(gv, { className: "size-4" })
    }
  );
}
function zM({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ p(
    VM,
    {
      "data-slot": "select-scroll-down-button",
      className: K(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ p(wf, { className: "size-4" })
    }
  );
}
var $M = [
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
], jM = $M.reduce((e, t) => {
  const n = /* @__PURE__ */ Of(`Primitive.${t}`), r = y.forwardRef((i, o) => {
    const { asChild: s, ...a } = i, l = s ? n : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ p(l, { ...a, ref: o });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {}), UM = "Label", Ry = y.forwardRef((e, t) => /* @__PURE__ */ p(
  jM.label,
  {
    ...e,
    ref: t,
    onMouseDown: (n) => {
      var i;
      n.target.closest("button, input, select, textarea") || ((i = e.onMouseDown) == null || i.call(e, n), !n.defaultPrevented && n.detail > 1 && n.preventDefault());
    }
  }
));
Ry.displayName = UM;
var Ny = Ry;
const Rn = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ p(
  Ny,
  {
    ref: n,
    "data-slot": "label",
    className: K(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      e
    ),
    ...t
  }
));
Rn.displayName = Ny.displayName;
var Iy = ["PageUp", "PageDown"], Dy = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], My = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, Cr = "Slider", [Ca, HM, WM] = ty(Cr), [Oy] = tn(Cr, [
  WM
]), [qM, Wo] = Oy(Cr), Ly = y.forwardRef(
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
      form: g,
      ...m
    } = e, b = y.useRef(/* @__PURE__ */ new Set()), v = y.useRef(0), w = s === "horizontal" ? KM : GM, [T = [], E] = pn({
      prop: u,
      defaultProp: c,
      onChange: (N) => {
        var B;
        (B = [...b.current][v.current]) == null || B.focus(), d(N);
      }
    }), k = y.useRef(T);
    function A(N) {
      const R = QM(T, N);
      P(N, R);
    }
    function I(N) {
      P(N, v.current);
    }
    function F() {
      const N = k.current[v.current];
      T[v.current] !== N && h(T);
    }
    function P(N, R, { commit: B } = { commit: !1 }) {
      const $ = rO(o), H = iO(Math.round((N - r) / o) * o + r, $), V = so(H, [r, i]);
      E((D = []) => {
        const _ = ZM(D, V, R);
        if (nO(_, l * o)) {
          v.current = _.indexOf(V);
          const L = String(_) !== String(D);
          return L && B && h(_), L ? _ : D;
        } else
          return D;
      });
    }
    return /* @__PURE__ */ p(
      qM,
      {
        scope: e.__scopeSlider,
        name: n,
        disabled: a,
        min: r,
        max: i,
        valueIndexToChangeRef: v,
        thumbs: b.current,
        values: T,
        orientation: s,
        form: g,
        children: /* @__PURE__ */ p(Ca.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ p(Ca.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ p(
          w,
          {
            "aria-disabled": a,
            "data-disabled": a ? "" : void 0,
            ...m,
            ref: t,
            onPointerDown: ae(m.onPointerDown, () => {
              a || (k.current = T);
            }),
            min: r,
            max: i,
            inverted: f,
            onSlideStart: a ? void 0 : A,
            onSlideMove: a ? void 0 : I,
            onSlideEnd: a ? void 0 : F,
            onHomeKeyDown: () => !a && P(r, 0, { commit: !0 }),
            onEndKeyDown: () => !a && P(i, T.length - 1, { commit: !0 }),
            onStepKeyDown: ({ event: N, direction: R }) => {
              if (!a) {
                const H = Iy.includes(N.key) || N.shiftKey && Dy.includes(N.key) ? 10 : 1, V = v.current, D = T[V], _ = o * H * R;
                P(D + _, V, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Ly.displayName = Cr;
var [_y, Fy] = Oy(Cr, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), KM = y.forwardRef(
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
    } = e, [d, h] = y.useState(null), f = we(t, (w) => h(w)), g = y.useRef(void 0), m = ny(i), b = m === "ltr", v = b && !o || !b && o;
    function x(w) {
      const T = g.current || d.getBoundingClientRect(), E = [0, T.width], A = uc(E, v ? [n, r] : [r, n]);
      return g.current = T, A(w - T.left);
    }
    return /* @__PURE__ */ p(
      _y,
      {
        scope: e.__scopeSlider,
        startEdge: v ? "left" : "right",
        endEdge: v ? "right" : "left",
        direction: v ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ p(
          Vy,
          {
            dir: m,
            "data-orientation": "horizontal",
            ...u,
            ref: f,
            style: {
              ...u.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (w) => {
              const T = x(w.clientX);
              s == null || s(T);
            },
            onSlideMove: (w) => {
              const T = x(w.clientX);
              a == null || a(T);
            },
            onSlideEnd: () => {
              g.current = void 0, l == null || l();
            },
            onStepKeyDown: (w) => {
              const E = My[v ? "from-left" : "from-right"].includes(w.key);
              c == null || c({ event: w, direction: E ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), GM = y.forwardRef(
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
    } = e, u = y.useRef(null), d = we(t, u), h = y.useRef(void 0), f = !i;
    function g(m) {
      const b = h.current || u.current.getBoundingClientRect(), v = [0, b.height], w = uc(v, f ? [r, n] : [n, r]);
      return h.current = b, w(m - b.top);
    }
    return /* @__PURE__ */ p(
      _y,
      {
        scope: e.__scopeSlider,
        startEdge: f ? "bottom" : "top",
        endEdge: f ? "top" : "bottom",
        size: "height",
        direction: f ? 1 : -1,
        children: /* @__PURE__ */ p(
          Vy,
          {
            "data-orientation": "vertical",
            ...c,
            ref: d,
            style: {
              ...c.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (m) => {
              const b = g(m.clientY);
              o == null || o(b);
            },
            onSlideMove: (m) => {
              const b = g(m.clientY);
              s == null || s(b);
            },
            onSlideEnd: () => {
              h.current = void 0, a == null || a();
            },
            onStepKeyDown: (m) => {
              const v = My[f ? "from-bottom" : "from-top"].includes(m.key);
              l == null || l({ event: m, direction: v ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), Vy = y.forwardRef(
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
    return /* @__PURE__ */ p(
      pe.span,
      {
        ...c,
        ref: t,
        onKeyDown: ae(e.onKeyDown, (d) => {
          d.key === "Home" ? (s(d), d.preventDefault()) : d.key === "End" ? (a(d), d.preventDefault()) : Iy.concat(Dy).includes(d.key) && (l(d), d.preventDefault());
        }),
        onPointerDown: ae(e.onPointerDown, (d) => {
          const h = d.target;
          h.setPointerCapture(d.pointerId), d.preventDefault(), u.thumbs.has(h) ? h.focus() : r(d);
        }),
        onPointerMove: ae(e.onPointerMove, (d) => {
          d.target.hasPointerCapture(d.pointerId) && i(d);
        }),
        onPointerUp: ae(e.onPointerUp, (d) => {
          const h = d.target;
          h.hasPointerCapture(d.pointerId) && (h.releasePointerCapture(d.pointerId), o(d));
        })
      }
    );
  }
), By = "SliderTrack", zy = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...r } = e, i = Wo(By, n);
    return /* @__PURE__ */ p(
      pe.span,
      {
        "data-disabled": i.disabled ? "" : void 0,
        "data-orientation": i.orientation,
        ...r,
        ref: t
      }
    );
  }
);
zy.displayName = By;
var Ta = "SliderRange", $y = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...r } = e, i = Wo(Ta, n), o = Fy(Ta, n), s = y.useRef(null), a = we(t, s), l = i.values.length, c = i.values.map(
      (h) => Hy(h, i.min, i.max)
    ), u = l > 1 ? Math.min(...c) : 0, d = 100 - Math.max(...c);
    return /* @__PURE__ */ p(
      pe.span,
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
$y.displayName = Ta;
var Ea = "SliderThumb", jy = y.forwardRef(
  (e, t) => {
    const n = HM(e.__scopeSlider), [r, i] = y.useState(null), o = we(t, (a) => i(a)), s = y.useMemo(
      () => r ? n().findIndex((a) => a.ref.current === r) : -1,
      [n, r]
    );
    return /* @__PURE__ */ p(YM, { ...e, ref: o, index: s });
  }
), YM = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, index: r, name: i, ...o } = e, s = Wo(Ea, n), a = Fy(Ea, n), [l, c] = y.useState(null), u = we(t, (x) => c(x)), d = l ? s.form || !!l.closest("form") : !0, h = Xl(l), f = s.values[r], g = f === void 0 ? 0 : Hy(f, s.min, s.max), m = JM(r, s.values.length), b = h == null ? void 0 : h[a.size], v = b ? eO(b, g, a.direction) : 0;
    return y.useEffect(() => {
      if (l)
        return s.thumbs.add(l), () => {
          s.thumbs.delete(l);
        };
    }, [l, s.thumbs]), /* @__PURE__ */ M(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [a.startEdge]: `calc(${g}% + ${v}px)`
        },
        children: [
          /* @__PURE__ */ p(Ca.ItemSlot, { scope: e.__scopeSlider, children: /* @__PURE__ */ p(
            pe.span,
            {
              role: "slider",
              "aria-label": e["aria-label"] || m,
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
              onFocus: ae(e.onFocus, () => {
                s.valueIndexToChangeRef.current = r;
              })
            }
          ) }),
          d && /* @__PURE__ */ p(
            Uy,
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
jy.displayName = Ea;
var XM = "RadioBubbleInput", Uy = y.forwardRef(
  ({ __scopeSlider: e, value: t, ...n }, r) => {
    const i = y.useRef(null), o = we(i, r), s = lc(t);
    return y.useEffect(() => {
      const a = i.current;
      if (!a) return;
      const l = window.HTMLInputElement.prototype, u = Object.getOwnPropertyDescriptor(l, "value").set;
      if (s !== t && u) {
        const d = new Event("input", { bubbles: !0 });
        u.call(a, t), a.dispatchEvent(d);
      }
    }, [s, t]), /* @__PURE__ */ p(
      pe.input,
      {
        style: { display: "none" },
        ...n,
        ref: o,
        defaultValue: t
      }
    );
  }
);
Uy.displayName = XM;
function ZM(e = [], t, n) {
  const r = [...e];
  return r[n] = t, r.sort((i, o) => i - o);
}
function Hy(e, t, n) {
  const o = 100 / (n - t) * (e - t);
  return so(o, [0, 100]);
}
function JM(e, t) {
  return t > 2 ? `Value ${e + 1} of ${t}` : t === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function QM(e, t) {
  if (e.length === 1) return 0;
  const n = e.map((i) => Math.abs(i - t)), r = Math.min(...n);
  return n.indexOf(r);
}
function eO(e, t, n) {
  const r = e / 2, o = uc([0, 50], [0, r]);
  return (r - o(t) * n) * n;
}
function tO(e) {
  return e.slice(0, -1).map((t, n) => e[n + 1] - t);
}
function nO(e, t) {
  if (t > 0) {
    const n = tO(e);
    return Math.min(...n) >= t;
  }
  return !0;
}
function uc(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const r = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + r * (n - e[0]);
  };
}
function rO(e) {
  return (String(e).split(".")[1] || "").length;
}
function iO(e, t) {
  const n = Math.pow(10, t);
  return Math.round(e * n) / n;
}
var Wy = Ly, oO = zy, sO = $y, aO = jy;
const _i = y.forwardRef(({ className: e, defaultValue: t, value: n, min: r = 0, max: i = 100, ...o }, s) => {
  const a = y.useMemo(
    () => Array.isArray(n) ? n : Array.isArray(t) ? t : [r, i],
    [n, t, r, i]
  );
  return /* @__PURE__ */ M(
    Wy,
    {
      ref: s,
      "data-slot": "slider",
      defaultValue: t,
      value: n,
      min: r,
      max: i,
      className: K(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        e
      ),
      ...o,
      children: [
        /* @__PURE__ */ p(
          oO,
          {
            "data-slot": "slider-track",
            className: K(
              "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            ),
            children: /* @__PURE__ */ p(
              sO,
              {
                "data-slot": "slider-range",
                className: K(
                  "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                )
              }
            )
          }
        ),
        Array.from({ length: a.length }, (l, c) => /* @__PURE__ */ p(
          aO,
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
_i.displayName = Wy.displayName;
var qo = "Switch", [lO] = tn(qo), [cO, uO] = lO(qo), qy = y.forwardRef(
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
    } = e, [h, f] = y.useState(null), g = we(t, (w) => f(w)), m = y.useRef(!1), b = h ? u || !!h.closest("form") : !0, [v, x] = pn({
      prop: i,
      defaultProp: o ?? !1,
      onChange: c,
      caller: qo
    });
    return /* @__PURE__ */ M(cO, { scope: n, checked: v, disabled: a, children: [
      /* @__PURE__ */ p(
        pe.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": v,
          "aria-required": s,
          "data-state": Xy(v),
          "data-disabled": a ? "" : void 0,
          disabled: a,
          value: l,
          ...d,
          ref: g,
          onClick: ae(e.onClick, (w) => {
            x((T) => !T), b && (m.current = w.isPropagationStopped(), m.current || w.stopPropagation());
          })
        }
      ),
      b && /* @__PURE__ */ p(
        Yy,
        {
          control: h,
          bubbles: !m.current,
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
qy.displayName = qo;
var Ky = "SwitchThumb", Gy = y.forwardRef(
  (e, t) => {
    const { __scopeSwitch: n, ...r } = e, i = uO(Ky, n);
    return /* @__PURE__ */ p(
      pe.span,
      {
        "data-state": Xy(i.checked),
        "data-disabled": i.disabled ? "" : void 0,
        ...r,
        ref: t
      }
    );
  }
);
Gy.displayName = Ky;
var dO = "SwitchBubbleInput", Yy = y.forwardRef(
  ({
    __scopeSwitch: e,
    control: t,
    checked: n,
    bubbles: r = !0,
    ...i
  }, o) => {
    const s = y.useRef(null), a = we(s, o), l = lc(n), c = Xl(t);
    return y.useEffect(() => {
      const u = s.current;
      if (!u) return;
      const d = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(
        d,
        "checked"
      ).set;
      if (l !== n && f) {
        const g = new Event("click", { bubbles: r });
        f.call(u, n), u.dispatchEvent(g);
      }
    }, [l, n, r]), /* @__PURE__ */ p(
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
Yy.displayName = dO;
function Xy(e) {
  return e ? "checked" : "unchecked";
}
var Zy = qy, fO = Gy;
const Jy = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ p(
  Zy,
  {
    ref: n,
    "data-slot": "switch",
    className: K(
      "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      e
    ),
    ...t,
    children: /* @__PURE__ */ p(
      fO,
      {
        "data-slot": "switch-thumb",
        className: K(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Jy.displayName = Zy.displayName;
function hO({
  voiceConfig: e,
  onConfigChange: t,
  availableVoices: n,
  selectedVoice: r,
  onVoiceChange: i,
  autoSpeak: o = !1,
  onAutoSpeakChange: s
}) {
  const [a, l] = ne(() => Vi());
  Ve(() => {
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
  return !a.speechRecognition && !a.speechSynthesis ? null : /* @__PURE__ */ M("div", { className: "space-y-4", children: [
    /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ p("h4", { className: "font-semibold text-sm", children: "Voice & Sound" }) }),
    s && a.speechSynthesis && /* @__PURE__ */ M("div", { className: "flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50", children: [
      /* @__PURE__ */ p(Rn, { htmlFor: "auto-speak", className: "text-xs font-medium cursor-pointer", children: "Auto-speak responses" }),
      /* @__PURE__ */ p(
        Jy,
        {
          id: "auto-speak",
          checked: o,
          onCheckedChange: s
        }
      )
    ] }),
    a.speechSynthesis && n.length > 0 && /* @__PURE__ */ M("div", { className: "space-y-2", children: [
      /* @__PURE__ */ p(Rn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Voice Engine" }),
      /* @__PURE__ */ M(
        lo,
        {
          value: (r == null ? void 0 : r.voiceURI) || "",
          onValueChange: (d) => {
            const h = n.find((f) => f.voiceURI === d);
            i(h || null);
          },
          children: [
            /* @__PURE__ */ p(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ p(co, { placeholder: "Select a voice" }) }),
            /* @__PURE__ */ p(fo, { className: "max-h-60 rounded-xl border-border/40 shadow-xl", children: Object.entries(c).map(([d, h]) => /* @__PURE__ */ M("div", { children: [
              /* @__PURE__ */ p("div", { className: "px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/50 bg-muted/20", children: u[d] || d }),
              h.map((f) => /* @__PURE__ */ p(
                Qe,
                {
                  value: f.voiceURI,
                  className: "text-xs rounded-md my-0.5",
                  children: /* @__PURE__ */ M("span", { className: "truncate", children: [
                    f.name,
                    f.localService && /* @__PURE__ */ p("span", { className: "ml-1 opacity-50 text-[10px]", children: "(local)" })
                  ] })
                },
                f.voiceURI
              ))
            ] }, d)) })
          ]
        }
      )
    ] }),
    a.speechRecognition && /* @__PURE__ */ M("div", { className: "space-y-2 pt-1", children: [
      /* @__PURE__ */ p(Rn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Recognition Language" }),
      /* @__PURE__ */ M(
        lo,
        {
          value: e.lang,
          onValueChange: (d) => t({ lang: d }),
          children: [
            /* @__PURE__ */ p(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ p(co, {}) }),
            /* @__PURE__ */ M(fo, { className: "rounded-xl border-border/40 shadow-xl", children: [
              /* @__PURE__ */ p(Qe, { value: "en-US", className: "text-xs rounded-md my-0.5", children: "English (US)" }),
              /* @__PURE__ */ p(Qe, { value: "en-GB", className: "text-xs rounded-md my-0.5", children: "English (UK)" }),
              /* @__PURE__ */ p(Qe, { value: "es-ES", className: "text-xs rounded-md my-0.5", children: "Spanish" }),
              /* @__PURE__ */ p(Qe, { value: "fr-FR", className: "text-xs rounded-md my-0.5", children: "French" }),
              /* @__PURE__ */ p(Qe, { value: "de-DE", className: "text-xs rounded-md my-0.5", children: "German" }),
              /* @__PURE__ */ p(Qe, { value: "it-IT", className: "text-xs rounded-md my-0.5", children: "Italian" }),
              /* @__PURE__ */ p(Qe, { value: "pt-BR", className: "text-xs rounded-md my-0.5", children: "Portuguese" }),
              /* @__PURE__ */ p(Qe, { value: "zh-CN", className: "text-xs rounded-md my-0.5", children: "Chinese (Simplified)" }),
              /* @__PURE__ */ p(Qe, { value: "ja-JP", className: "text-xs rounded-md my-0.5", children: "Japanese" }),
              /* @__PURE__ */ p(Qe, { value: "ko-KR", className: "text-xs rounded-md my-0.5", children: "Korean" }),
              /* @__PURE__ */ p(Qe, { value: "hi-IN", className: "text-xs rounded-md my-0.5", children: "Hindi" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ M("div", { className: "grid gap-4 pt-1", children: [
      a.speechSynthesis && /* @__PURE__ */ M("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ M("div", { className: "flex items-center justify-between px-0.5", children: [
          /* @__PURE__ */ p(Rn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Playback Speed" }),
          /* @__PURE__ */ M("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: [
            e.rate.toFixed(1),
            "x"
          ] })
        ] }),
        /* @__PURE__ */ p(
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
      a.speechSynthesis && /* @__PURE__ */ M("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ M("div", { className: "flex items-center justify-between px-0.5", children: [
          /* @__PURE__ */ p(Rn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Voice Pitch" }),
          /* @__PURE__ */ p("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: e.pitch.toFixed(1) })
        ] }),
        /* @__PURE__ */ p(
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
      a.speechSynthesis && /* @__PURE__ */ M("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ M("div", { className: "flex items-center justify-between px-0.5", children: [
          /* @__PURE__ */ p(Rn, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Output Volume" }),
          /* @__PURE__ */ M("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: [
            Math.round(e.volume * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ p(
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
function pO({
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
  return /* @__PURE__ */ M(rc, { children: [
    /* @__PURE__ */ p(ic, { asChild: !0, children: /* @__PURE__ */ p(
      We,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
        children: /* @__PURE__ */ p(Pv, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ p(oc, { align: "end", className: "w-[320px] p-5 rounded-2xl shadow-2xl border-border/40 backdrop-blur-3xl ring-1 ring-black/5 max-h-[85vh] overflow-y-auto custom-scrollbar", children: /* @__PURE__ */ p("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ M("div", { className: "grid gap-6", children: [
      /* @__PURE__ */ M("div", { className: "space-y-4", children: [
        /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ p("h4", { className: "font-semibold text-sm", children: "Model Configuration" }) }),
        /* @__PURE__ */ M("div", { className: "flex items-center gap-4 w-full", children: [
          /* @__PURE__ */ M("div", { className: "flex flex-col gap-2 flex-1", children: [
            /* @__PURE__ */ p("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Active Agent" }),
            /* @__PURE__ */ M(lo, { value: e, onValueChange: t, children: [
              /* @__PURE__ */ p(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ p(co, { placeholder: "Select Agent", className: "capitalize" }) }),
              /* @__PURE__ */ M(fo, { className: "rounded-xl border-border/40 shadow-xl", children: [
                n.map((f) => /* @__PURE__ */ p(Qe, { value: f.key, className: "text-xs rounded-md my-0.5 capitalize", children: f.key }, f.key)),
                n.length === 0 && /* @__PURE__ */ p(Qe, { value: e || "default", className: "capitalize", children: e || "Default" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ M("div", { className: "flex flex-col gap-2 flex-1", children: [
            /* @__PURE__ */ p("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Active Model" }),
            /* @__PURE__ */ M(lo, { value: r, onValueChange: i, children: [
              /* @__PURE__ */ p(uo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ p(co, { placeholder: "Select Model", className: "capitalize" }) }),
              /* @__PURE__ */ M(fo, { className: "rounded-xl border-border/40 shadow-xl", children: [
                o.map((f) => /* @__PURE__ */ p(Qe, { value: f, className: "text-xs rounded-md my-0.5 capitalize", children: f }, f)),
                o.length === 0 && /* @__PURE__ */ p(Qe, { value: r || "default", className: "capitalize", children: r || "Default" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ p("div", { className: "h-px bg-border/50" }),
      /* @__PURE__ */ p(
        hO,
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
function mO({
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
  onModelChange: g,
  availableModels: m,
  voiceConfig: b,
  onVoiceConfigChange: v,
  availableVoices: x,
  selectedVoice: w,
  onVoiceChange: T,
  autoSpeak: E,
  onAutoSpeakChange: k,
  onExpand: A,
  isExpanded: I,
  onClose: F
}) {
  return /* @__PURE__ */ p("div", { className: "relative z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl", children: /* @__PURE__ */ M("div", { className: "flex items-center justify-between px-4 py-3", children: [
    /* @__PURE__ */ M("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ M("div", { className: "relative group", children: [
        /* @__PURE__ */ p("div", { className: "absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-primary/40 opacity-25 blur transition duration-300 group-hover:opacity-40" }),
        /* @__PURE__ */ p("div", { className: "relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg", children: /* @__PURE__ */ p(po, { className: "h-4.5 w-4.5" }) }),
        /* @__PURE__ */ p("div", { className: "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" })
      ] }),
      /* @__PURE__ */ M("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ p("h2", { className: "text-sm font-bold leading-tight tracking-tight text-foreground", children: "Agent Chat" }),
        /* @__PURE__ */ M("div", { className: "flex items-center gap-1.5 ", children: [
          /* @__PURE__ */ M("div", { className: "flex h-1.5 w-1.5", children: [
            /* @__PURE__ */ p("span", { className: "animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-primary opacity-75" }),
            /* @__PURE__ */ p("span", { className: "relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" })
          ] }),
          /* @__PURE__ */ p("p", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60", children: e })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ M("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ p(
        WD,
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
      /* @__PURE__ */ p(
        We,
        {
          variant: "ghost",
          size: "icon",
          onClick: n,
          title: "New Chat",
          className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
          disabled: t,
          children: /* @__PURE__ */ p(Cf, { className: K("h-4 w-4", t && "animate-spin") })
        }
      ),
      A && /* @__PURE__ */ p(
        We,
        {
          variant: "ghost",
          size: "icon",
          onClick: A,
          title: I ? "Collapse" : "Expand",
          className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
          children: I ? /* @__PURE__ */ p(Tv, { className: "h-4 w-4" }) : /* @__PURE__ */ p(wv, { className: "h-4 w-4" })
        }
      ),
      u && /* @__PURE__ */ p(
        pO,
        {
          currentAgent: e,
          onAgentChange: h,
          availableAgents: d,
          currentModel: f,
          onModelChange: g,
          availableModels: m,
          voiceConfig: b,
          onVoiceConfigChange: v,
          availableVoices: x,
          selectedVoice: w,
          onVoiceChange: T,
          autoSpeak: E,
          onAutoSpeakChange: k
        }
      ),
      F && /* @__PURE__ */ p(
        We,
        {
          variant: "ghost",
          size: "icon",
          onClick: F,
          title: "Close",
          className: "h-8 w-8 rounded-lg hover:bg-destructive/5 hover:text-destructive transition-colors",
          children: /* @__PURE__ */ p(zn, { className: "h-4 w-4" })
        }
      )
    ] })
  ] }) });
}
const mf = (e) => {
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
function gO({
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
  model: g = void 0,
  threadId: m = void 0,
  onExpand: b = void 0,
  isExpanded: v = !1,
  onClose: x = void 0
}) {
  var st, Pt, Oe, At;
  const [w, T] = ne(t), [E, k] = ne(g || ""), [A, I] = ne([]), [F, P] = ne(""), N = h ?? F, R = He((G) => {
    if (h === void 0 && P(G), f) {
      const ue = typeof G == "function" ? G(N) : G;
      f(ue);
    }
  }, [h, f, N]), [B, $] = ne(!1), [H, V] = ne([]), [D, _] = ne(null), [L, S] = ne([]), [te, Z] = ne([]), [C, q] = ne(!1), [Y, se] = ne([]), [W, ie] = ne(m || null), [me, le] = ne(!1), ce = He((G) => {
    var Re, Ke;
    if (!((Re = D == null ? void 0 : D.info) != null && Re.agents)) return;
    const ue = D.info.agents.find((De) => De.key === G);
    I([]);
    const Ce = (Ke = ue == null ? void 0 : ue.suggestions) != null && Ke.length ? ue.suggestions : i != null && i.length ? i : [];
    V(Ce);
  }, [(st = D == null ? void 0 : D.info) == null ? void 0 : st.agents, i]);
  Ve(() => {
    m && (ie(m), D && Be(m));
  }, [m, D]), Ve(() => {
    (async () => {
      try {
        const ue = w === "default" ? null : w, Ce = new ov({
          baseUrl: e,
          agent: ue,
          getInfo: !0
        });
        await Ce.retrieveInfo(), _(Ce), Ce.info && (S(Ce.info.agents), Z(Ce.info.models), Ce.agent && T(Ce.agent), E || k(Ce.info.default_model), A.length === 0 && Ce.agent && ce(Ce.agent));
      } catch (ue) {
        ue instanceof Error && (o == null || o(ue));
      }
    })();
  }, [e]), console.log("Loading thread", m), console.log("User ID", n), console.log("Version 1.0"), Ve(() => {
    var G;
    if (D) {
      try {
        D.updateAgent(w, !0);
      } catch (ue) {
        console.warn("Could not update agent yet", ue);
      }
      if (A.length === 0) {
        const ue = L.find((Re) => Re.key === w), Ce = (G = ue == null ? void 0 : ue.suggestions) != null && G.length ? ue.suggestions : i != null && i.length ? i : [];
        V(Ce);
      }
    }
  }, [w, D, L, A.length, i]);
  const ge = He(async () => {
    if (D)
      try {
        const G = await D.listThreads(20, 0, n);
        se(G);
      } catch (G) {
        console.error("Failed to fetch history", G);
      }
  }, [D, n]), Be = async (G) => {
    if (D)
      try {
        $(!0);
        const ue = await D.getHistory({
          thread_id: G,
          user_id: n || void 0
        }), Ce = await Promise.all(
          ue.messages.map(async (Re) => {
            var De;
            const Ke = {
              id: Re.id || crypto.randomUUID(),
              role: Re.type === "human" ? "user" : "assistant",
              content: Re.content,
              createdAt: /* @__PURE__ */ new Date()
              // We assume current time if timestamp missing
            };
            if ((De = Re.custom_data) != null && De.attachments && Array.isArray(Re.custom_data.attachments))
              try {
                const ee = (await Promise.all(
                  Re.custom_data.attachments.map(async (X) => {
                    const oe = `${e}/files/${X.file_id}`, Se = await fetch(oe);
                    if (!Se.ok)
                      return console.warn(`Failed to load file ${X.file_id}`), null;
                    const be = await Se.blob(), Te = await new Promise((ze, Fe) => {
                      const qe = new FileReader();
                      qe.onload = () => ze(qe.result), qe.onerror = Fe, qe.readAsDataURL(be);
                    });
                    return {
                      name: X.filename,
                      contentType: X.content_type,
                      url: Te
                    };
                  })
                )).filter((X) => X !== null);
                ee.length > 0 && (Ke.experimental_attachments = ee);
              } catch (Cn) {
                console.error("Error loading file attachments from history:", Cn);
              }
            return Ke;
          })
        );
        I(Ce), ie(G), q(!1);
      } catch (ue) {
        ue instanceof Error && (o == null || o(ue));
      } finally {
        $(!1);
      }
  }, Xe = () => {
    le(!0), setTimeout(() => le(!1), 1e3), D != null && D.agent ? ce(D.agent) : (I([]), V(i || [])), ie(null), R(""), q(!1);
  }, pt = async (G, ue) => {
    var Cn, ee;
    if (!G.trim() || !D) return;
    const Ce = ue ? await Promise.all(
      Array.from(ue).map(async (X) => new Promise((oe) => {
        const Se = new FileReader();
        Se.onload = () => {
          oe({
            name: X.name,
            contentType: X.type,
            url: Se.result
            // This will be a data URL
          });
        }, Se.onerror = () => {
          oe({
            name: X.name,
            contentType: X.type,
            url: URL.createObjectURL(X)
          });
        }, Se.readAsDataURL(X);
      }))
    ) : void 0, Re = {
      id: crypto.randomUUID(),
      role: "user",
      content: G,
      createdAt: /* @__PURE__ */ new Date(),
      experimental_attachments: Ce
    };
    I((X) => [...X, Re]), R(""), V([]), $(!0);
    const Ke = W || crypto.randomUUID();
    W || ie(Ke);
    const De = { thread_id: Ke, user_id: n };
    try {
      let X = [];
      if (ue && ue.length > 0)
        try {
          const oe = Array.from(ue), Se = Xg(oe);
          if (!Se.valid) {
            I((be) => [...be, {
              id: crypto.randomUUID(),
              role: "assistant",
              content: Se.error || "File validation failed. Please try again.",
              createdAt: /* @__PURE__ */ new Date()
            }]), $(!1);
            return;
          }
          X = await D.uploadFiles(oe);
        } catch (oe) {
          console.error("Error uploading files:", oe);
          const Se = oe instanceof Error ? oe.message : "Error uploading files. Please try again.";
          I((be) => [...be, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: Se,
            createdAt: /* @__PURE__ */ new Date()
          }]), $(!1);
          return;
        }
      if (r) {
        const oe = D.stream({
          message: G,
          model: E || void 0,
          attachments: X.length > 0 ? X : void 0,
          ...De
        });
        let Se = null;
        for await (const be of oe)
          if (typeof be == "string")
            lt(be, Se, (Te) => Se = Te);
          else if (typeof be == "object" && be !== null) {
            if ("type" in be && be.type === "update") {
              const ze = be, Fe = ze.updates.follow_up || ze.updates.next_step_suggestions;
              Fe && V(Fe);
              continue;
            }
            const Te = be;
            if ((Cn = Te.tool_calls) != null && Cn.length) {
              const ze = Te.tool_calls.some((Fe) => Fe.name.includes("sub-agent"));
              Se = null, I((Fe) => [...Fe, {
                id: crypto.randomUUID(),
                role: ze ? "subagent" : "tool",
                content: Te.content || "",
                toolInvocations: Te.tool_calls.map((qe) => ({
                  state: "call",
                  toolName: qe.name,
                  toolCallId: qe.id || crypto.randomUUID()
                })),
                createdAt: /* @__PURE__ */ new Date()
              }]);
            } else Te.type === "tool" && Te.content ? (Se = null, I((ze) => [...ze, {
              id: crypto.randomUUID(),
              role: "tool",
              content: Te.content,
              createdAt: /* @__PURE__ */ new Date()
            }])) : Te.content && lt(Te.content, Se, (ze) => Se = ze);
          }
        I((be) => {
          const Te = be[be.length - 1];
          if ((Te == null ? void 0 : Te.role) === "assistant") {
            const { suggestions: ze, cleanContent: Fe } = mf(Te.content);
            if (ze.length > 0)
              return V(ze), be.map((qe, Qy) => Qy === be.length - 1 ? { ...qe, content: Fe } : qe);
          }
          return be;
        });
      } else {
        const oe = await D.invoke({
          message: G,
          model: E || void 0,
          attachments: X.length > 0 ? X : void 0,
          ...De
        }), { suggestions: Se, cleanContent: be } = mf(oe.content || "");
        V((ee = oe.suggestions) != null && ee.length ? oe.suggestions : Se), I((Te) => [...Te, {
          id: oe.id || crypto.randomUUID(),
          role: "assistant",
          content: be,
          createdAt: /* @__PURE__ */ new Date()
        }]);
      }
    } catch (X) {
      X instanceof Error && (o == null || o(X)), I((oe) => [...oe, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Error processing request. Please try again.",
        createdAt: /* @__PURE__ */ new Date()
      }]);
    } finally {
      $(!1), ge();
    }
  }, lt = He((G, ue, Ce) => {
    I((Re) => {
      const Ke = Re[Re.length - 1];
      if (ue && Ke && Ke.id === ue && Ke.role === "assistant" && !Ke.toolInvocations)
        return Re.map((De) => De.id === ue ? { ...De, content: De.content + G } : De);
      {
        const De = crypto.randomUUID();
        return Ce(De), [...Re, { id: De, role: "assistant", content: G, createdAt: /* @__PURE__ */ new Date() }];
      }
    });
  }, []), wt = async (G, ue) => {
    var Re;
    (Re = G == null ? void 0 : G.preventDefault) == null || Re.call(G);
    const Ce = ue == null ? void 0 : ue.experimental_attachments;
    pt(N, Ce ? Array.from(Ce) : void 0);
  }, qt = (G) => {
    R(G.target.value);
  }, [mt, Sn] = ne(!1), {
    isListening: Kt,
    isSpeaking: Hn,
    startListening: Et,
    stopListening: Tr,
    speak: kn,
    stopSpeaking: O,
    voiceConfig: U,
    updateConfig: re,
    availableVoices: he,
    selectedVoice: ve,
    setSelectedVoice: ot,
    isRecognitionSupported: St
  } = cv({
    onTranscript: (G, ue) => {
      ue && R((Ce) => {
        const Re = Ce && !Ce.endsWith(" ") ? " " : "";
        return Ce + Re + G;
      });
    }
  }), Ze = Me(B);
  return Ve(() => {
    if (Ze.current && !B && mt) {
      const G = A[A.length - 1];
      (G == null ? void 0 : G.role) === "assistant" && G.content && kn(G.content);
    }
    Ze.current = B;
  }, [B, mt, A, kn]), /* @__PURE__ */ p("div", { className: "chat-theme h-full w-full", children: /* @__PURE__ */ M("div", { className: K("flex h-full w-full flex-col overflow-hidden", a), children: [
    c && /* @__PURE__ */ p(
      mO,
      {
        currentAgent: w,
        isRefreshing: me,
        onNewChat: Xe,
        isHistoryOpen: C,
        onHistoryOpenChange: q,
        threads: Y,
        currentThreadId: W,
        onSelectThread: Be,
        onFetchHistory: ge,
        direction: d,
        showSettings: l,
        availableAgents: L,
        onAgentChange: T,
        currentModel: E,
        onModelChange: k,
        availableModels: te,
        voiceConfig: U,
        onVoiceConfigChange: re,
        availableVoices: he,
        selectedVoice: ve,
        onVoiceChange: ot,
        autoSpeak: mt,
        onAutoSpeakChange: Sn,
        onExpand: b,
        isExpanded: v,
        onClose: x
      }
    ),
    /* @__PURE__ */ p("div", { className: "flex-1 overflow-hidden relative bg-background flex flex-col", children: /* @__PURE__ */ p(
      Jg,
      {
        messages: A,
        handleSubmit: wt,
        input: N,
        handleInputChange: qt,
        isGenerating: B,
        append: (G) => pt(G.content),
        suggestions: H.length > 0 ? H : A.length === 0 ? i : [],
        onRateResponse: s,
        placeholder: u,
        isListening: Kt,
        startListening: Et,
        stopListening: Tr,
        isSpeechSupported: St,
        speak: kn,
        stopSpeaking: O,
        isSpeaking: Hn,
        label: (At = (Oe = (Pt = D == null ? void 0 : D.info) == null ? void 0 : Pt.agents) == null ? void 0 : Oe.find((G) => G.key === w)) == null ? void 0 : At.description,
        className: "flex-1"
      }
    ) })
  ] }) });
}
function kO({
  buttonClassName: e,
  windowClassName: t,
  ...n
}) {
  const [r, i] = ne(!1), [o, s] = ne(!1), [a, l] = ne({
    width: typeof window < "u" ? window.innerWidth : 0,
    height: typeof window < "u" ? window.innerHeight : 0
  });
  return Ve(() => {
    const c = () => {
      l({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    return window.addEventListener("resize", c), () => window.removeEventListener("resize", c);
  }, []), /* @__PURE__ */ M(rc, { open: r, onOpenChange: i, children: [
    /* @__PURE__ */ p("div", { className: "chat-theme", children: /* @__PURE__ */ p(ic, { asChild: !0, className: K(r && "opacity-0 pointer-events-none"), children: /* @__PURE__ */ p(
      We,
      {
        className: K(
          "fixed bottom-6 right-6 size-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
          e
        ),
        size: "icon",
        children: /* @__PURE__ */ p(Sv, { className: "size-6" })
      }
    ) }) }),
    /* @__PURE__ */ p(
      oc,
      {
        className: K(
          "p-0 overflow-hidden rounded-2xl border border-border/50 shadow-2xl transition-all duration-300 bg-background",
          t
        ),
        style: {
          width: o ? `${a.width}px` : a.width < 640 ? "90vw" : "480px",
          height: o ? `${a.height}px` : a.width < 640 ? "80vh" : "640px"
        },
        align: "end",
        sideOffset: -64,
        children: /* @__PURE__ */ p("div", { className: "chat-theme h-full", children: /* @__PURE__ */ p(
          gO,
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
  gO as A,
  We as B,
  Jg as C,
  Zg as M,
  kO as P,
  Bk as a,
  tC as b,
  _d as c,
  ov as d,
  $e as e,
  Zk as f,
  Qg as g,
  eC as h,
  ey as i,
  LD as j,
  HI as k,
  OD as l,
  ga as m,
  Qi as n,
  rf as o,
  K as p,
  El as s,
  Hk as w
};
