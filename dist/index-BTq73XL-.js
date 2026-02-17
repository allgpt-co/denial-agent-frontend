var Uy = Object.defineProperty;
var Hy = (e, t, n) => t in e ? Uy(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Re = (e, t, n) => Hy(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as g, Fragment as Wt, jsxs as O } from "react/jsx-runtime";
import * as y from "react";
import U, { useState as se, useRef as De, useEffect as $e, useCallback as Be, forwardRef as hr, createElement as $i, createContext as pr, useId as Aa, useContext as tt, useInsertionEffect as hf, useMemo as Ln, Children as Wy, isValidElement as Ii, useLayoutEffect as Ra, Fragment as pf, Component as qy, Suspense as Ky } from "react";
import * as yo from "react-dom";
import mf from "react-dom";
class Fe extends Error {
  constructor(t) {
    super(t), this.name = "AgentClientError";
  }
}
class Gy {
  constructor(t) {
    Re(this, "baseUrl");
    Re(this, "authSecret");
    Re(this, "timeout");
    Re(this, "_info", null);
    Re(this, "_agent", null);
    Re(this, "_initPromise", null);
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
        throw new Fe(`HTTP error! status: ${o.status}`);
      this._info = await o.json(), (!this._agent || !((t = this._info) != null && t.agents.some((s) => s.key === this._agent))) && (this._agent = ((n = this._info) == null ? void 0 : n.default_agent) || null);
    } catch (r) {
      throw r instanceof Error ? new Fe(`Error getting service info: ${r.message}`) : r;
    }
  }
  updateAgent(t, n = !1) {
    if (!n) {
      if (!this._info)
        throw new Fe(
          "Service info not loaded. Call retrieveInfo() first or set getInfo to true in constructor."
        );
      const r = this._info.agents.map((i) => i.key);
      if (!r.includes(t))
        throw new Fe(
          `Agent ${t} not found in available agents: ${r.join(", ")}`
        );
    }
    this._agent = t;
  }
  async invoke(t) {
    if (this._initPromise && await this._initPromise, !this._agent)
      throw new Fe("No agent selected. Use updateAgent() to select an agent.");
    try {
      const n = new AbortController(), r = this.timeout ? setTimeout(() => n.abort(), this.timeout) : void 0, i = await fetch(`${this.baseUrl}/${this._agent}/invoke`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(t),
        signal: n.signal
      });
      if (r && clearTimeout(r), !i.ok)
        throw new Fe(`HTTP error! status: ${i.status}`);
      return await i.json();
    } catch (n) {
      throw n instanceof Error ? new Fe(`Error invoking agent: ${n.message}`) : n;
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
      throw new Fe("No agent selected. Use updateAgent() to select an agent.");
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
        throw new Fe(`HTTP error! status: ${o.status}`);
      if (!o.body)
        throw new Fe("Response body is null");
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
      throw r instanceof Error ? new Fe(`Error streaming agent response: ${r.message}`) : r;
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
        throw new Fe(`HTTP error! status: ${i.status}`);
    } catch (n) {
      throw n instanceof Error ? new Fe(`Error creating feedback: ${n.message}`) : n;
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
        throw new Fe(`HTTP error! status: ${i.status}`);
      return await i.json();
    } catch (n) {
      throw n instanceof Error ? new Fe(`Error getting chat history: ${n.message}`) : n;
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
        throw new Fe(`HTTP error! status: ${l.status}`);
      }
      return await l.json();
    } catch (i) {
      throw i instanceof Error ? new Fe(`Error listing threads: ${i.message}`) : i;
    }
  }
  async deleteThread(t, n) {
    try {
      const r = new AbortController(), i = this.timeout ? setTimeout(() => r.abort(), this.timeout) : void 0, o = `${this.baseUrl}/threads/${encodeURIComponent(t)}?user_id=${encodeURIComponent(n)}`, s = await fetch(o, {
        method: "DELETE",
        headers: this.headers,
        signal: r.signal
      });
      if (i && clearTimeout(i), !s.ok)
        throw new Fe(`HTTP error! status: ${s.status}`);
    } catch (r) {
      throw r instanceof Error ? new Fe(`Error deleting thread: ${r.message}`) : r;
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
        throw new Fe(`HTTP error! status: ${s.status}`);
      return await s.json();
    } catch (n) {
      throw n instanceof Error ? new Fe(`Error uploading file: ${n.message}`) : n;
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
        throw new Fe(`HTTP error! status: ${s.status}`);
      return await s.json();
    } catch (n) {
      throw n instanceof Error ? new Fe(`Error uploading files: ${n.message}`) : n;
    }
  }
}
const Na = {
  lang: "en-US",
  continuous: !1,
  interimResults: !0,
  maxAlternatives: 1,
  pitch: 1,
  rate: 1,
  volume: 1
};
function ji() {
  const e = !!(typeof window < "u" && (window.SpeechRecognition || window.webkitSpeechRecognition)), t = !!(typeof window < "u" && window.speechSynthesis);
  return {
    speechRecognition: e,
    speechSynthesis: t
  };
}
class Yy {
  constructor(t = {}) {
    Re(this, "recognition", null);
    Re(this, "isListening", !1);
    Re(this, "config");
    Re(this, "onResult", null);
    Re(this, "onStart", null);
    Re(this, "onEnd", null);
    Re(this, "onError", null);
    Re(this, "onSpeechStart", null);
    Re(this, "onSpeechEnd", null);
    this.config = { ...Na, ...t }, this.initRecognition();
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
class Xy {
  constructor(t = {}) {
    Re(this, "utterance", null);
    Re(this, "config");
    Re(this, "isSpeaking", !1);
    Re(this, "availableVoices", []);
    Re(this, "onStart", null);
    Re(this, "onEnd", null);
    Re(this, "onPause", null);
    Re(this, "onResume", null);
    Re(this, "onError", null);
    Re(this, "onBoundary", null);
    this.config = { ...Na, ...t }, this.loadVoices();
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
function Zy(e) {
  return e.replace(/```[\s\S]*?```/g, "Code block omitted. ").replace(/`[^`]+`/g, (t) => t.slice(1, -1)).replace(/#{1,6}\s+/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").replace(/---/g, "").replace(/^>\s+/gm, "").replace(/^[\s]*[-*+]\s+/gm, "").replace(/^[\s]*\d+\.\s+/gm, "").replace(/\n{3,}/g, `

`).trim();
}
function Jy(e = {}) {
  const { config: t } = e, [n, r] = se(!1), [i, o] = se(!1), [s, a] = se(""), [l, c] = se(""), [u, d] = se(null), [h, f] = se([]), [m, p] = se(null), [b, v] = se({
    ...Na,
    ...t
  }), [x, w] = se(() => ji()), T = De(null), E = De(null), k = De(e);
  $e(() => {
    k.current = e;
  }), $e(() => {
    const N = ji();
    if (w(N), N.speechRecognition && (T.current = new Yy(b), T.current.onStart = () => {
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
      L ? (a((X) => X + _), c("")) : c(_), (te = (S = k.current).onTranscript) == null || te.call(S, _, L);
    }), N.speechSynthesis) {
      E.current = new Xy(b), E.current.onStart = () => {
        o(!0);
      }, E.current.onEnd = () => {
        o(!1);
      }, E.current.onError = (L) => {
        d(L), o(!1);
      };
      const _ = () => {
        var S;
        const L = ((S = E.current) == null ? void 0 : S.getVoices()) || [];
        if (f(L), !m && L.length > 0) {
          const te = L.filter(
            (X) => X.lang.toLowerCase().startsWith(b.lang.toLowerCase().split("-")[0])
          );
          te.length > 0 && p(te[0]);
        }
      };
      _(), typeof window < "u" && window.speechSynthesis && (window.speechSynthesis.onvoiceschanged = _);
    }
    return () => {
      var _, L;
      (_ = T.current) == null || _.destroy(), (L = E.current) == null || L.destroy();
    };
  }, []);
  const A = Be((N) => {
    v((_) => {
      var S, te;
      const L = { ..._, ...N };
      return (S = T.current) == null || S.updateConfig(L), (te = E.current) == null || te.updateConfig(L), L;
    });
  }, []), D = Be(() => {
    var N;
    d(null), c(""), (N = T.current) == null || N.start();
  }, []), F = Be(() => {
    var N;
    (N = T.current) == null || N.stop();
  }, []), P = Be(() => {
    n ? F() : D();
  }, [n, D, F]), I = Be(() => {
    a(""), c("");
  }, []), R = Be((N) => {
    var L, S;
    d(null);
    const _ = Zy(N);
    m && ((L = E.current) == null || L.updateConfig({ voiceURI: m.voiceURI })), (S = E.current) == null || S.speak(_);
  }, [m]), z = Be(() => {
    var N;
    (N = E.current) == null || N.stop();
  }, []), j = Be(() => {
    var N;
    (N = E.current) == null || N.pause();
  }, []), W = Be(() => {
    var N;
    (N = E.current) == null || N.resume();
  }, []), V = Be((N) => {
    p(N), N && A({ voiceURI: N.voiceURI });
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
    clearTranscript: I,
    // Synthesis controls
    speak: R,
    stopSpeaking: z,
    pauseSpeaking: j,
    resumeSpeaking: W,
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
const Qy = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), gf = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var ev = {
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
const tv = hr(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: i = "",
    children: o,
    iconNode: s,
    ...a
  }, l) => $i(
    "svg",
    {
      ref: l,
      ...ev,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: gf("lucide", i),
      ...a
    },
    [
      ...s.map(([c, u]) => $i(c, u)),
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
  const n = hr(
    ({ className: r, ...i }, o) => $i(tv, {
      ref: o,
      iconNode: t,
      className: gf(`lucide-${Qy(e)}`, r),
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
const nv = ke("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rv = ke("Ban", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m4.9 4.9 14.2 14.2", key: "1m5liu" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const iv = ke("Bot", [
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
const cc = ke("Braces", [
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
const yf = ke("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vf = ke("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ia = ke("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ov = ke("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sv = ke("CircleHelp", [
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
const av = ke("CodeXml", [
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
const lv = ke("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cv = ke("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uc = ke("History", [
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
const uv = ke("Info", [
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
const Da = ke("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dv = ke("Maximize2", [
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
const fv = ke("MessageCircle", [
  ["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hv = ke("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pv = ke("Mic", [
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
const mv = ke("Minimize2", [
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
const bf = ke("Paperclip", [
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
const xf = ke("RefreshCcw", [
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
const gv = ke("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yv = ke("Settings2", [
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
const vo = ke("Sparkles", [
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
const wf = ke("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vv = ke("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const bv = ke("ThumbsDown", [
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
const xv = ke("ThumbsUp", [
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
const wv = ke("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sv = ke("Volume2", [
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
const mr = ke("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Sf(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = Sf(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function kf() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Sf(e)) && (r && (r += " "), r += t);
  return r;
}
const Ma = "-", kv = (e) => {
  const t = Tv(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (s) => {
      const a = s.split(Ma);
      return a[0] === "" && a.length !== 1 && a.shift(), Cf(a, t) || Cv(s);
    },
    getConflictingClassGroupIds: (s, a) => {
      const l = n[s] || [];
      return a && r[s] ? [...l, ...r[s]] : l;
    }
  };
}, Cf = (e, t) => {
  var s;
  if (e.length === 0)
    return t.classGroupId;
  const n = e[0], r = t.nextPart.get(n), i = r ? Cf(e.slice(1), r) : void 0;
  if (i)
    return i;
  if (t.validators.length === 0)
    return;
  const o = e.join(Ma);
  return (s = t.validators.find(({
    validator: a
  }) => a(o))) == null ? void 0 : s.classGroupId;
}, dc = /^\[(.+)\]$/, Cv = (e) => {
  if (dc.test(e)) {
    const t = dc.exec(e)[1], n = t == null ? void 0 : t.substring(0, t.indexOf(":"));
    if (n)
      return "arbitrary.." + n;
  }
}, Tv = (e) => {
  const {
    theme: t,
    prefix: n
  } = e, r = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return Pv(Object.entries(e.classGroups), n).forEach(([o, s]) => {
    Ls(s, r, o, t);
  }), r;
}, Ls = (e, t, n, r) => {
  e.forEach((i) => {
    if (typeof i == "string") {
      const o = i === "" ? t : fc(t, i);
      o.classGroupId = n;
      return;
    }
    if (typeof i == "function") {
      if (Ev(i)) {
        Ls(i(r), t, n, r);
        return;
      }
      t.validators.push({
        validator: i,
        classGroupId: n
      });
      return;
    }
    Object.entries(i).forEach(([o, s]) => {
      Ls(s, fc(t, o), n, r);
    });
  });
}, fc = (e, t) => {
  let n = e;
  return t.split(Ma).forEach((r) => {
    n.nextPart.has(r) || n.nextPart.set(r, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), n = n.nextPart.get(r);
  }), n;
}, Ev = (e) => e.isThemeGetter, Pv = (e, t) => t ? e.map(([n, r]) => {
  const i = r.map((o) => typeof o == "string" ? t + o : typeof o == "object" ? Object.fromEntries(Object.entries(o).map(([s, a]) => [t + s, a])) : o);
  return [n, i];
}) : e, Av = (e) => {
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
}, Tf = "!", Rv = (e) => {
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
    const h = l.length === 0 ? a : a.substring(u), f = h.startsWith(Tf), m = f ? h.substring(1) : h, p = d && d > u ? d - u : void 0;
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
}, Nv = (e) => {
  if (e.length <= 1)
    return e;
  const t = [];
  let n = [];
  return e.forEach((r) => {
    r[0] === "[" ? (t.push(...n.sort(), r), n = []) : n.push(r);
  }), t.push(...n.sort()), t;
}, Iv = (e) => ({
  cache: Av(e.cacheSize),
  parseClassName: Rv(e),
  ...kv(e)
}), Dv = /\s+/, Mv = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: i
  } = t, o = [], s = e.trim().split(Dv);
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
    const b = Nv(u).join(":"), v = d ? b + Tf : b, x = v + p;
    if (o.includes(x))
      continue;
    o.push(x);
    const w = i(p, m);
    for (let T = 0; T < w.length; ++T) {
      const E = w[T];
      o.push(v + E);
    }
    a = c + (a.length > 0 ? " " + a : a);
  }
  return a;
};
function Ov() {
  let e = 0, t, n, r = "";
  for (; e < arguments.length; )
    (t = arguments[e++]) && (n = Ef(t)) && (r && (r += " "), r += n);
  return r;
}
const Ef = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = Ef(e[r])) && (n && (n += " "), n += t);
  return n;
};
function Lv(e, ...t) {
  let n, r, i, o = s;
  function s(l) {
    const c = t.reduce((u, d) => d(u), e());
    return n = Iv(c), r = n.cache.get, i = n.cache.set, o = a, a(l);
  }
  function a(l) {
    const c = r(l);
    if (c)
      return c;
    const u = Mv(l, n);
    return i(l, u), u;
  }
  return function() {
    return o(Ov.apply(null, arguments));
  };
}
const Ie = (e) => {
  const t = (n) => n[e] || [];
  return t.isThemeGetter = !0, t;
}, Pf = /^\[(?:([a-z-]+):)?(.+)\]$/i, _v = /^\d+\/\d+$/, Fv = /* @__PURE__ */ new Set(["px", "full", "screen"]), Vv = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, zv = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Bv = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/, $v = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, jv = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Jt = (e) => nr(e) || Fv.has(e) || _v.test(e), un = (e) => gr(e, "length", Xv), nr = (e) => !!e && !Number.isNaN(Number(e)), Zo = (e) => gr(e, "number", nr), Nr = (e) => !!e && Number.isInteger(Number(e)), Uv = (e) => e.endsWith("%") && nr(e.slice(0, -1)), ce = (e) => Pf.test(e), dn = (e) => Vv.test(e), Hv = /* @__PURE__ */ new Set(["length", "size", "percentage"]), Wv = (e) => gr(e, Hv, Af), qv = (e) => gr(e, "position", Af), Kv = /* @__PURE__ */ new Set(["image", "url"]), Gv = (e) => gr(e, Kv, Jv), Yv = (e) => gr(e, "", Zv), Ir = () => !0, gr = (e, t, n) => {
  const r = Pf.exec(e);
  return r ? r[1] ? typeof t == "string" ? r[1] === t : t.has(r[1]) : n(r[2]) : !1;
}, Xv = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  zv.test(e) && !Bv.test(e)
), Af = () => !1, Zv = (e) => $v.test(e), Jv = (e) => jv.test(e), Qv = () => {
  const e = Ie("colors"), t = Ie("spacing"), n = Ie("blur"), r = Ie("brightness"), i = Ie("borderColor"), o = Ie("borderRadius"), s = Ie("borderSpacing"), a = Ie("borderWidth"), l = Ie("contrast"), c = Ie("grayscale"), u = Ie("hueRotate"), d = Ie("invert"), h = Ie("gap"), f = Ie("gradientColorStops"), m = Ie("gradientColorStopPositions"), p = Ie("inset"), b = Ie("margin"), v = Ie("opacity"), x = Ie("padding"), w = Ie("saturate"), T = Ie("scale"), E = Ie("sepia"), k = Ie("skew"), A = Ie("space"), D = Ie("translate"), F = () => ["auto", "contain", "none"], P = () => ["auto", "hidden", "clip", "visible", "scroll"], I = () => ["auto", ce, t], R = () => [ce, t], z = () => ["", Jt, un], j = () => ["auto", nr, ce], W = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], V = () => ["solid", "dashed", "dotted", "double", "none"], N = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], _ = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], L = () => ["", "0", ce], S = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], te = () => [nr, ce];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Ir],
      spacing: [Jt, un],
      blur: ["none", "", dn, ce],
      brightness: te(),
      borderColor: [e],
      borderRadius: ["none", "", "full", dn, ce],
      borderSpacing: R(),
      borderWidth: z(),
      contrast: te(),
      grayscale: L(),
      hueRotate: te(),
      invert: L(),
      gap: R(),
      gradientColorStops: [e],
      gradientColorStopPositions: [Uv, un],
      inset: I(),
      margin: I(),
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
        aspect: ["auto", "square", "video", ce]
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
        columns: [dn]
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
        object: [...W(), ce]
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
        z: ["auto", Nr, ce]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: I()
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
        flex: ["1", "auto", "initial", "none", ce]
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
        order: ["first", "last", "none", Nr, ce]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [Ir]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Nr, ce]
        }, ce]
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
        "grid-rows": [Ir]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Nr, ce]
        }, ce]
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
        "auto-cols": ["auto", "min", "max", "fr", ce]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", ce]
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
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", ce, t]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [ce, t, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [ce, t, "none", "full", "min", "max", "fit", "prose", {
          screen: [dn]
        }, dn]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [ce, t, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [ce, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [ce, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [ce, t, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", dn, un]
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
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", Zo]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Ir]
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
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", ce]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", nr, Zo]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", Jt, ce]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", ce]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", ce]
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
        decoration: ["auto", "from-font", Jt, un]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", Jt, ce]
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
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", ce]
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
        content: ["none", ce]
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
        bg: [...W(), qv]
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
        bg: ["auto", "cover", "contain", Wv]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, Gv]
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
        "outline-offset": [Jt, ce]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [Jt, un]
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
        ring: z()
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
        "ring-offset": [Jt, un]
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
        shadow: ["", "inner", "none", dn, Yv]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [Ir]
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
        "mix-blend": [...N(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": N()
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
        "drop-shadow": ["", "none", dn, ce]
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
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", ce]
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
        ease: ["linear", "in", "out", "in-out", ce]
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
        animate: ["none", "spin", "ping", "pulse", "bounce", ce]
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
        rotate: [Nr, ce]
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
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", ce]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", ce]
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
        "will-change": ["auto", "scroll", "contents", "transform", ce]
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
        stroke: [Jt, un, Zo]
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
}, eb = /* @__PURE__ */ Lv(Qv);
function Y(...e) {
  return eb(kf(e));
}
const tb = 50, nb = 10;
function rb(e) {
  const t = De(null), n = De(null), [r, i] = se(!0), o = () => {
    t.current && (t.current.scrollTop = t.current.scrollHeight);
  }, s = () => {
    if (t.current) {
      const { scrollTop: l, scrollHeight: c, clientHeight: u } = t.current, d = Math.abs(
        c - l - u
      ), h = n.current ? l < n.current : !1, f = n.current ? n.current - l : 0;
      if (h && f > nb)
        i(!1);
      else {
        const p = d < tb;
        i(p);
      }
      n.current = l;
    }
  }, a = () => {
    i(!1);
  };
  return $e(() => {
    t.current && (n.current = t.current.scrollTop);
  }, []), $e(() => {
    r && o();
  }, e), {
    containerRef: t,
    scrollToBottom: o,
    handleScroll: s,
    shouldAutoScroll: r,
    handleTouchStart: a
  };
}
function hc(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function jn(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((i) => {
      const o = hc(i, t);
      return !n && typeof o == "function" && (n = !0), o;
    });
    if (n)
      return () => {
        for (let i = 0; i < r.length; i++) {
          const o = r[i];
          typeof o == "function" ? o() : hc(e[i], null);
        }
      };
  };
}
function we(...e) {
  return y.useCallback(jn(...e), e);
}
var ib = Symbol.for("react.lazy"), Ui = y[" use ".trim().toString()];
function ob(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
function Rf(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === ib && "_payload" in e && ob(e._payload);
}
// @__NO_SIDE_EFFECTS__
function Nf(e) {
  const t = /* @__PURE__ */ ab(e), n = y.forwardRef((r, i) => {
    let { children: o, ...s } = r;
    Rf(o) && typeof Ui == "function" && (o = Ui(o._payload));
    const a = y.Children.toArray(o), l = a.find(cb);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
var sb = /* @__PURE__ */ Nf("Slot");
// @__NO_SIDE_EFFECTS__
function ab(e) {
  const t = y.forwardRef((n, r) => {
    let { children: i, ...o } = n;
    if (Rf(i) && typeof Ui == "function" && (i = Ui(i._payload)), y.isValidElement(i)) {
      const s = db(i), a = ub(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? jn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var lb = Symbol("radix.slottable");
function cb(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === lb;
}
function ub(e, t) {
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
function db(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
const pc = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, mc = kf, If = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return mc(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: i, defaultVariants: o } = t, s = Object.keys(i).map((c) => {
    const u = n == null ? void 0 : n[c], d = o == null ? void 0 : o[c];
    if (u === null) return null;
    const h = pc(u) || pc(d);
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
  return mc(e, s, l, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, fb = If(
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
), qe = y.forwardRef(({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }, o) => /* @__PURE__ */ g(
  r ? sb : "button",
  {
    "data-slot": "button",
    "data-variant": t,
    "data-size": n,
    className: Y(fb({ variant: t, size: n, className: e })),
    ref: o,
    ...i
  }
));
qe.displayName = "Button";
const Oa = pr({});
function La(e) {
  const t = De(null);
  return t.current === null && (t.current = e()), t.current;
}
const bo = pr(null), _a = pr({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
class hb extends y.Component {
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
function pb({ children: e, isPresent: t }) {
  const n = Aa(), r = De(null), i = De({
    width: 0,
    height: 0,
    top: 0,
    left: 0
  }), { nonce: o } = tt(_a);
  return hf(() => {
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
  }, [t]), g(hb, { isPresent: t, childRef: r, sizeRef: i, children: y.cloneElement(e, { ref: r }) });
}
const mb = ({ children: e, initial: t, isPresent: n, onExitComplete: r, custom: i, presenceAffectsLayout: o, mode: s }) => {
  const a = La(gb), l = Aa(), c = Be((d) => {
    a.set(d, !0);
    for (const h of a.values())
      if (!h)
        return;
    r && r();
  }, [a, r]), u = Ln(
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
  return Ln(() => {
    a.forEach((d, h) => a.set(h, !1));
  }, [n]), y.useEffect(() => {
    !n && !a.size && r && r();
  }, [n]), s === "popLayout" && (e = g(pb, { isPresent: n, children: e })), g(bo.Provider, { value: u, children: e });
};
function gb() {
  return /* @__PURE__ */ new Map();
}
function Df(e = !0) {
  const t = tt(bo);
  if (t === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: r, register: i } = t, o = Aa();
  $e(() => {
    e && i(o);
  }, [e]);
  const s = Be(() => e && r && r(o), [o, r, e]);
  return !n && r ? [!1, s] : [!0];
}
const gi = (e) => e.key || "";
function gc(e) {
  const t = [];
  return Wy.forEach(e, (n) => {
    Ii(n) && t.push(n);
  }), t;
}
const Fa = typeof window < "u", Mf = Fa ? Ra : $e, xo = ({ children: e, custom: t, initial: n = !0, onExitComplete: r, presenceAffectsLayout: i = !0, mode: o = "sync", propagate: s = !1 }) => {
  const [a, l] = Df(s), c = Ln(() => gc(e), [e]), u = s && !a ? [] : c.map(gi), d = De(!0), h = De(c), f = La(() => /* @__PURE__ */ new Map()), [m, p] = se(c), [b, v] = se(c);
  Mf(() => {
    d.current = !1, h.current = c;
    for (let T = 0; T < b.length; T++) {
      const E = gi(b[T]);
      u.includes(E) ? f.delete(E) : f.get(E) !== !0 && f.set(E, !1);
    }
  }, [b, u.length, u.join("-")]);
  const x = [];
  if (c !== m) {
    let T = [...c];
    for (let E = 0; E < b.length; E++) {
      const k = b[E], A = gi(k);
      u.includes(A) || (T.splice(E, 0, k), x.push(k));
    }
    o === "wait" && x.length && (T = x), v(gc(T)), p(c);
    return;
  }
  process.env.NODE_ENV !== "production" && o === "wait" && b.length > 1 && console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
  const { forceRender: w } = tt(Oa);
  return g(Wt, { children: b.map((T) => {
    const E = gi(T), k = s && !a ? !1 : c === b || u.includes(E), A = () => {
      if (f.has(E))
        f.set(E, !0);
      else
        return;
      let D = !0;
      f.forEach((F) => {
        F || (D = !1);
      }), D && (w == null || w(), v(h.current), s && (l == null || l()), r && r());
    };
    return g(mb, { isPresent: k, initial: !d.current || n ? void 0 : !1, custom: k ? void 0 : t, presenceAffectsLayout: i, mode: o, onExitComplete: k ? void 0 : A, children: T }, E);
  }) });
}, ht = /* @__NO_SIDE_EFFECTS__ */ (e) => e;
let yr = ht, gn = ht;
process.env.NODE_ENV !== "production" && (yr = (e, t) => {
  !e && typeof console < "u" && console.warn(t);
}, gn = (e, t) => {
  if (!e)
    throw new Error(t);
});
// @__NO_SIDE_EFFECTS__
function Va(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
const sr = /* @__NO_SIDE_EFFECTS__ */ (e, t, n) => {
  const r = t - e;
  return r === 0 ? 1 : (n - e) / r;
}, $t = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, Qt = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, yb = {
  useManualTiming: !1
};
function vb(e) {
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
const yi = [
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
], bb = 40;
function Of(e, t) {
  let n = !1, r = !0;
  const i = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, o = () => n = !0, s = yi.reduce((v, x) => (v[x] = vb(o), v), {}), { read: a, resolveKeyframes: l, update: c, preRender: u, render: d, postRender: h } = s, f = () => {
    const v = performance.now();
    n = !1, i.delta = r ? 1e3 / 60 : Math.max(Math.min(v - i.timestamp, bb), 1), i.timestamp = v, i.isProcessing = !0, a.process(i), l.process(i), c.process(i), u.process(i), d.process(i), h.process(i), i.isProcessing = !1, n && t && (r = !1, e(f));
  }, m = () => {
    n = !0, r = !0, i.isProcessing || e(f);
  };
  return { schedule: yi.reduce((v, x) => {
    const w = s[x];
    return v[x] = (T, E = !1, k = !1) => (n || m(), w.schedule(T, E, k)), v;
  }, {}), cancel: (v) => {
    for (let x = 0; x < yi.length; x++)
      s[yi[x]].cancel(v);
  }, state: i, steps: s };
}
const { schedule: Me, cancel: yn, state: Ye, steps: Jo } = Of(typeof requestAnimationFrame < "u" ? requestAnimationFrame : ht, !0), Lf = pr({ strict: !1 }), yc = {
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
}, ar = {};
for (const e in yc)
  ar[e] = {
    isEnabled: (t) => yc[e].some((n) => !!t[n])
  };
function xb(e) {
  for (const t in e)
    ar[t] = {
      ...ar[t],
      ...e[t]
    };
}
const wb = /* @__PURE__ */ new Set([
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
function Hi(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || wb.has(e);
}
let _f = (e) => !Hi(e);
function Sb(e) {
  e && (_f = (t) => t.startsWith("on") ? !Hi(t) : e(t));
}
try {
  Sb(require("@emotion/is-prop-valid").default);
} catch {
}
function kb(e, t, n) {
  const r = {};
  for (const i in e)
    i === "values" && typeof e.values == "object" || (_f(i) || n === !0 && Hi(i) || !t && !Hi(i) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && i.startsWith("onDrag")) && (r[i] = e[i]);
  return r;
}
const vc = /* @__PURE__ */ new Set();
function wo(e, t, n) {
  e || vc.has(t) || (console.warn(t), vc.add(t));
}
function Cb(e) {
  if (typeof Proxy > "u")
    return e;
  const t = /* @__PURE__ */ new Map(), n = (...r) => (process.env.NODE_ENV !== "production" && wo(!1, "motion() is deprecated. Use motion.create() instead."), e(...r));
  return new Proxy(n, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (r, i) => i === "create" ? e : (t.has(i) || t.set(i, e(i)), t.get(i))
  });
}
const So = pr({});
function qr(e) {
  return typeof e == "string" || Array.isArray(e);
}
function ko(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
const za = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], Ba = ["initial", ...za];
function Co(e) {
  return ko(e.animate) || Ba.some((t) => qr(e[t]));
}
function Ff(e) {
  return !!(Co(e) || e.variants);
}
function Tb(e, t) {
  if (Co(e)) {
    const { initial: n, animate: r } = e;
    return {
      initial: n === !1 || qr(n) ? n : void 0,
      animate: qr(r) ? r : void 0
    };
  }
  return e.inherit !== !1 ? t : {};
}
function Eb(e) {
  const { initial: t, animate: n } = Tb(e, tt(So));
  return Ln(() => ({ initial: t, animate: n }), [bc(t), bc(n)]);
}
function bc(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const Pb = Symbol.for("motionComponentSymbol");
function Zn(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function Ab(e, t, n) {
  return Be(
    (r) => {
      r && e.onMount && e.onMount(r), t && (r ? t.mount(r) : t.unmount()), n && (typeof n == "function" ? n(r) : Zn(n) && (n.current = r));
    },
    /**
     * Only pass a new ref callback to React if we've received a visual element
     * factory. Otherwise we'll be mounting/remounting every time externalRef
     * or other dependencies change.
     */
    [t]
  );
}
const $a = (e) => e.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase(), Rb = "framerAppearId", Vf = "data-" + $a(Rb), { schedule: ja } = Of(queueMicrotask, !1), zf = pr({});
function Nb(e, t, n, r, i) {
  var o, s;
  const { visualElement: a } = tt(So), l = tt(Lf), c = tt(bo), u = tt(_a).reducedMotion, d = De(null);
  r = r || l.renderer, !d.current && r && (d.current = r(e, {
    visualState: t,
    parent: a,
    props: n,
    presenceContext: c,
    blockInitialAnimation: c ? c.initial === !1 : !1,
    reducedMotionConfig: u
  }));
  const h = d.current, f = tt(zf);
  h && !h.projection && i && (h.type === "html" || h.type === "svg") && Ib(d.current, n, i, f);
  const m = De(!1);
  hf(() => {
    h && m.current && h.update(n, c);
  });
  const p = n[Vf], b = De(!!p && !(!((o = window.MotionHandoffIsComplete) === null || o === void 0) && o.call(window, p)) && ((s = window.MotionHasOptimisedAnimation) === null || s === void 0 ? void 0 : s.call(window, p)));
  return Mf(() => {
    h && (m.current = !0, window.MotionIsMounted = !0, h.updateFeatures(), ja.render(h.render), b.current && h.animationState && h.animationState.animateChanges());
  }), $e(() => {
    h && (!b.current && h.animationState && h.animationState.animateChanges(), b.current && (queueMicrotask(() => {
      var v;
      (v = window.MotionHandoffMarkAsComplete) === null || v === void 0 || v.call(window, p);
    }), b.current = !1));
  }), h;
}
function Ib(e, t, n, r) {
  const { layoutId: i, layout: o, drag: s, dragConstraints: a, layoutScroll: l, layoutRoot: c } = t;
  e.projection = new n(e.latestValues, t["data-framer-portal-id"] ? void 0 : Bf(e.parent)), e.projection.setOptions({
    layoutId: i,
    layout: o,
    alwaysMeasureLayout: !!s || a && Zn(a),
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
function Bf(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : Bf(e.parent);
}
function Db({ preloadedFeatures: e, createVisualElement: t, useRender: n, useVisualState: r, Component: i }) {
  var o, s;
  e && xb(e);
  function a(c, u) {
    let d;
    const h = {
      ...tt(_a),
      ...c,
      layoutId: Mb(c)
    }, { isStatic: f } = h, m = Eb(c), p = r(c, f);
    if (!f && Fa) {
      Ob(h, e);
      const b = Lb(h);
      d = b.MeasureLayout, m.visualElement = Nb(i, p, h, t, b.ProjectionNode);
    }
    return O(So.Provider, { value: m, children: [d && m.visualElement ? g(d, { visualElement: m.visualElement, ...h }) : null, n(i, c, Ab(p, m.visualElement, u), p, f, m.visualElement)] });
  }
  a.displayName = `motion.${typeof i == "string" ? i : `create(${(s = (o = i.displayName) !== null && o !== void 0 ? o : i.name) !== null && s !== void 0 ? s : ""})`}`;
  const l = hr(a);
  return l[Pb] = i, l;
}
function Mb({ layoutId: e }) {
  const t = tt(Oa).id;
  return t && e !== void 0 ? t + "-" + e : e;
}
function Ob(e, t) {
  const n = tt(Lf).strict;
  if (process.env.NODE_ENV !== "production" && t && n) {
    const r = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
    e.ignoreStrict ? yr(!1, r) : gn(!1, r);
  }
}
function Lb(e) {
  const { drag: t, layout: n } = ar;
  if (!t && !n)
    return {};
  const r = { ...t, ...n };
  return {
    MeasureLayout: t != null && t.isEnabled(e) || n != null && n.isEnabled(e) ? r.MeasureLayout : void 0,
    ProjectionNode: r.ProjectionNode
  };
}
const _b = [
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
function Ua(e) {
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
      !!(_b.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function xc(e) {
  const t = [{}, {}];
  return e == null || e.values.forEach((n, r) => {
    t[0][r] = n.get(), t[1][r] = n.getVelocity();
  }), t;
}
function Ha(e, t, n, r) {
  if (typeof t == "function") {
    const [i, o] = xc(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
    const [i, o] = xc(r);
    t = t(n !== void 0 ? n : e.custom, i, o);
  }
  return t;
}
const _s = (e) => Array.isArray(e), Fb = (e) => !!(e && typeof e == "object" && e.mix && e.toValue), Vb = (e) => _s(e) ? e[e.length - 1] || 0 : e, nt = (e) => !!(e && e.getVelocity);
function Di(e) {
  const t = nt(e) ? e.get() : e;
  return Fb(t) ? t.toValue() : t;
}
function zb({ scrapeMotionValuesFromProps: e, createRenderState: t, onUpdate: n }, r, i, o) {
  const s = {
    latestValues: Bb(r, i, o, e),
    renderState: t()
  };
  return n && (s.onMount = (a) => n({ props: r, current: a, ...s }), s.onUpdate = (a) => n(a)), s;
}
const $f = (e) => (t, n) => {
  const r = tt(So), i = tt(bo), o = () => zb(e, t, r, i);
  return n ? o() : La(o);
};
function Bb(e, t, n, r) {
  const i = {}, o = r(e, {});
  for (const h in o)
    i[h] = Di(o[h]);
  let { initial: s, animate: a } = e;
  const l = Co(e), c = Ff(e);
  t && c && !l && e.inherit !== !1 && (s === void 0 && (s = t.initial), a === void 0 && (a = t.animate));
  let u = n ? n.initial === !1 : !1;
  u = u || s === !1;
  const d = u ? a : s;
  if (d && typeof d != "boolean" && !ko(d)) {
    const h = Array.isArray(d) ? d : [d];
    for (let f = 0; f < h.length; f++) {
      const m = Ha(e, h[f]);
      if (m) {
        const { transitionEnd: p, transition: b, ...v } = m;
        for (const x in v) {
          let w = v[x];
          if (Array.isArray(w)) {
            const T = u ? w.length - 1 : 0;
            w = w[T];
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
const vr = [
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
], Un = new Set(vr), jf = (e) => (t) => typeof t == "string" && t.startsWith(e), Uf = /* @__PURE__ */ jf("--"), $b = /* @__PURE__ */ jf("var(--"), Wa = (e) => $b(e) ? jb.test(e.split("/*")[0].trim()) : !1, jb = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu, Hf = (e, t) => t && typeof e == "number" ? t.transform(e) : e, tn = (e, t, n) => n > t ? t : n < e ? e : n, br = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, Kr = {
  ...br,
  transform: (e) => tn(0, 1, e)
}, vi = {
  ...br,
  default: 1
}, ii = (e) => ({
  test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: (t) => `${t}${e}`
}), pn = /* @__PURE__ */ ii("deg"), jt = /* @__PURE__ */ ii("%"), ee = /* @__PURE__ */ ii("px"), Ub = /* @__PURE__ */ ii("vh"), Hb = /* @__PURE__ */ ii("vw"), wc = {
  ...jt,
  parse: (e) => jt.parse(e) / 100,
  transform: (e) => jt.transform(e * 100)
}, Wb = {
  // Border props
  borderWidth: ee,
  borderTopWidth: ee,
  borderRightWidth: ee,
  borderBottomWidth: ee,
  borderLeftWidth: ee,
  borderRadius: ee,
  radius: ee,
  borderTopLeftRadius: ee,
  borderTopRightRadius: ee,
  borderBottomRightRadius: ee,
  borderBottomLeftRadius: ee,
  // Positioning props
  width: ee,
  maxWidth: ee,
  height: ee,
  maxHeight: ee,
  top: ee,
  right: ee,
  bottom: ee,
  left: ee,
  // Spacing props
  padding: ee,
  paddingTop: ee,
  paddingRight: ee,
  paddingBottom: ee,
  paddingLeft: ee,
  margin: ee,
  marginTop: ee,
  marginRight: ee,
  marginBottom: ee,
  marginLeft: ee,
  // Misc
  backgroundPositionX: ee,
  backgroundPositionY: ee
}, qb = {
  rotate: pn,
  rotateX: pn,
  rotateY: pn,
  rotateZ: pn,
  scale: vi,
  scaleX: vi,
  scaleY: vi,
  scaleZ: vi,
  skew: pn,
  skewX: pn,
  skewY: pn,
  distance: ee,
  translateX: ee,
  translateY: ee,
  translateZ: ee,
  x: ee,
  y: ee,
  z: ee,
  perspective: ee,
  transformPerspective: ee,
  opacity: Kr,
  originX: wc,
  originY: wc,
  originZ: ee
}, Sc = {
  ...br,
  transform: Math.round
}, qa = {
  ...Wb,
  ...qb,
  zIndex: Sc,
  size: ee,
  // SVG
  fillOpacity: Kr,
  strokeOpacity: Kr,
  numOctaves: Sc
}, Kb = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, Gb = vr.length;
function Yb(e, t, n) {
  let r = "", i = !0;
  for (let o = 0; o < Gb; o++) {
    const s = vr[o], a = e[s];
    if (a === void 0)
      continue;
    let l = !0;
    if (typeof a == "number" ? l = a === (s.startsWith("scale") ? 1 : 0) : l = parseFloat(a) === 0, !l || n) {
      const c = Hf(a, qa[s]);
      if (!l) {
        i = !1;
        const u = Kb[s] || s;
        r += `${u}(${c}) `;
      }
      n && (t[s] = c);
    }
  }
  return r = r.trim(), n ? r = n(t, i ? "" : r) : i && (r = "none"), r;
}
function Ka(e, t, n) {
  const { style: r, vars: i, transformOrigin: o } = e;
  let s = !1, a = !1;
  for (const l in t) {
    const c = t[l];
    if (Un.has(l)) {
      s = !0;
      continue;
    } else if (Uf(l)) {
      i[l] = c;
      continue;
    } else {
      const u = Hf(c, qa[l]);
      l.startsWith("origin") ? (a = !0, o[l] = u) : r[l] = u;
    }
  }
  if (t.transform || (s || n ? r.transform = Yb(t, e.transform, n) : r.transform && (r.transform = "none")), a) {
    const { originX: l = "50%", originY: c = "50%", originZ: u = 0 } = o;
    r.transformOrigin = `${l} ${c} ${u}`;
  }
}
const Xb = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, Zb = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function Jb(e, t, n = 1, r = 0, i = !0) {
  e.pathLength = 1;
  const o = i ? Xb : Zb;
  e[o.offset] = ee.transform(-r);
  const s = ee.transform(t), a = ee.transform(n);
  e[o.array] = `${s} ${a}`;
}
function kc(e, t, n) {
  return typeof e == "string" ? e : ee.transform(t + n * e);
}
function Qb(e, t, n) {
  const r = kc(t, e.x, e.width), i = kc(n, e.y, e.height);
  return `${r} ${i}`;
}
function Ga(e, {
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
  if (Ka(e, c, d), u) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: h, style: f, dimensions: m } = e;
  h.transform && (m && (f.transform = h.transform), delete h.transform), m && (i !== void 0 || o !== void 0 || f.transform) && (f.transformOrigin = Qb(m, i !== void 0 ? i : 0.5, o !== void 0 ? o : 0.5)), t !== void 0 && (h.x = t), n !== void 0 && (h.y = n), r !== void 0 && (h.scale = r), s !== void 0 && Jb(h, s, a, l, !1);
}
const Ya = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
}), Wf = () => ({
  ...Ya(),
  attrs: {}
}), Xa = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function qf(e, { style: t, vars: n }, r, i) {
  Object.assign(e.style, t, i && i.getProjectionStyles(r));
  for (const o in n)
    e.style.setProperty(o, n[o]);
}
const Kf = /* @__PURE__ */ new Set([
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
function Gf(e, t, n, r) {
  qf(e, t, void 0, r);
  for (const i in t.attrs)
    e.setAttribute(Kf.has(i) ? i : $a(i), t.attrs[i]);
}
const Wi = {};
function ex(e) {
  Object.assign(Wi, e);
}
function Yf(e, { layout: t, layoutId: n }) {
  return Un.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!Wi[e] || e === "opacity");
}
function Za(e, t, n) {
  var r;
  const { style: i } = e, o = {};
  for (const s in i)
    (nt(i[s]) || t.style && nt(t.style[s]) || Yf(s, e) || ((r = n == null ? void 0 : n.getValue(s)) === null || r === void 0 ? void 0 : r.liveStyle) !== void 0) && (o[s] = i[s]);
  return o;
}
function Xf(e, t, n) {
  const r = Za(e, t, n);
  for (const i in e)
    if (nt(e[i]) || nt(t[i])) {
      const o = vr.indexOf(i) !== -1 ? "attr" + i.charAt(0).toUpperCase() + i.substring(1) : i;
      r[o] = e[i];
    }
  return r;
}
function tx(e, t) {
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
const Cc = ["x", "y", "width", "height", "cx", "cy", "r"], nx = {
  useVisualState: $f({
    scrapeMotionValuesFromProps: Xf,
    createRenderState: Wf,
    onUpdate: ({ props: e, prevProps: t, current: n, renderState: r, latestValues: i }) => {
      if (!n)
        return;
      let o = !!e.drag;
      if (!o) {
        for (const a in i)
          if (Un.has(a)) {
            o = !0;
            break;
          }
      }
      if (!o)
        return;
      let s = !t;
      if (t)
        for (let a = 0; a < Cc.length; a++) {
          const l = Cc[a];
          e[l] !== t[l] && (s = !0);
        }
      s && Me.read(() => {
        tx(n, r), Me.render(() => {
          Ga(r, i, Xa(n.tagName), e.transformTemplate), Gf(n, r);
        });
      });
    }
  })
}, rx = {
  useVisualState: $f({
    scrapeMotionValuesFromProps: Za,
    createRenderState: Ya
  })
};
function Zf(e, t, n) {
  for (const r in t)
    !nt(t[r]) && !Yf(r, n) && (e[r] = t[r]);
}
function ix({ transformTemplate: e }, t) {
  return Ln(() => {
    const n = Ya();
    return Ka(n, t, e), Object.assign({}, n.vars, n.style);
  }, [t]);
}
function ox(e, t) {
  const n = e.style || {}, r = {};
  return Zf(r, n, e), Object.assign(r, ix(e, t)), r;
}
function sx(e, t) {
  const n = {}, r = ox(e, t);
  return e.drag && e.dragListener !== !1 && (n.draggable = !1, r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = "none", r.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0), n.style = r, n;
}
function ax(e, t, n, r) {
  const i = Ln(() => {
    const o = Wf();
    return Ga(o, t, Xa(r), e.transformTemplate), {
      ...o.attrs,
      style: { ...o.style }
    };
  }, [t]);
  if (e.style) {
    const o = {};
    Zf(o, e.style, e), i.style = { ...o, ...i.style };
  }
  return i;
}
function lx(e = !1) {
  return (n, r, i, { latestValues: o }, s) => {
    const l = (Ua(n) ? ax : sx)(r, o, s, n), c = kb(r, typeof n == "string", e), u = n !== pf ? { ...c, ...l, ref: i } : {}, { children: d } = r, h = Ln(() => nt(d) ? d.get() : d, [d]);
    return $i(n, {
      ...u,
      children: h
    });
  };
}
function cx(e, t) {
  return function(r, { forwardMotionProps: i } = { forwardMotionProps: !1 }) {
    const s = {
      ...Ua(r) ? nx : rx,
      preloadedFeatures: e,
      useRender: lx(i),
      createVisualElement: t,
      Component: r
    };
    return Db(s);
  };
}
function Jf(e, t) {
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
function To(e, t, n) {
  const r = e.getProps();
  return Ha(r, t, n !== void 0 ? n : r.custom, e);
}
const ux = /* @__PURE__ */ Va(() => window.ScrollTimeline !== void 0);
class dx {
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
      if (ux() && i.attachTimeline)
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
class fx extends dx {
  then(t, n) {
    return Promise.all(this.animations).then(t).catch(n);
  }
}
function Ja(e, t) {
  return e ? e[t] || e.default || e : void 0;
}
const Fs = 2e4;
function Qf(e) {
  let t = 0;
  const n = 50;
  let r = e.next(t);
  for (; !r.done && t < Fs; )
    t += n, r = e.next(t);
  return t >= Fs ? 1 / 0 : t;
}
function Qa(e) {
  return typeof e == "function";
}
function Tc(e, t) {
  e.timeline = t, e.onfinish = null;
}
const el = (e) => Array.isArray(e) && typeof e[0] == "number", hx = {
  linearEasing: void 0
};
function px(e, t) {
  const n = /* @__PURE__ */ Va(e);
  return () => {
    var r;
    return (r = hx[t]) !== null && r !== void 0 ? r : n();
  };
}
const qi = /* @__PURE__ */ px(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), eh = (e, t, n = 10) => {
  let r = "";
  const i = Math.max(Math.round(t / n), 2);
  for (let o = 0; o < i; o++)
    r += e(/* @__PURE__ */ sr(0, i - 1, o)) + ", ";
  return `linear(${r.substring(0, r.length - 2)})`;
};
function th(e) {
  return !!(typeof e == "function" && qi() || !e || typeof e == "string" && (e in Vs || qi()) || el(e) || Array.isArray(e) && e.every(th));
}
const Lr = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`, Vs = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ Lr([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ Lr([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ Lr([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ Lr([0.33, 1.53, 0.69, 0.99])
};
function nh(e, t) {
  if (e)
    return typeof e == "function" && qi() ? eh(e, t) : el(e) ? Lr(e) : Array.isArray(e) ? e.map((n) => nh(n, t) || Vs.easeOut) : Vs[e];
}
const Dt = {
  x: !1,
  y: !1
};
function rh() {
  return Dt.x || Dt.y;
}
function mx(e, t, n) {
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
function ih(e, t) {
  const n = mx(e), r = new AbortController(), i = {
    passive: !0,
    ...t,
    signal: r.signal
  };
  return [n, i, () => r.abort()];
}
function Ec(e) {
  return (t) => {
    t.pointerType === "touch" || rh() || e(t);
  };
}
function gx(e, t, n = {}) {
  const [r, i, o] = ih(e, n), s = Ec((a) => {
    const { target: l } = a, c = t(a);
    if (typeof c != "function" || !l)
      return;
    const u = Ec((d) => {
      c(d), l.removeEventListener("pointerleave", u);
    });
    l.addEventListener("pointerleave", u, i);
  });
  return r.forEach((a) => {
    a.addEventListener("pointerenter", s, i);
  }), o;
}
const oh = (e, t) => t ? e === t ? !0 : oh(e, t.parentElement) : !1, tl = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, yx = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function vx(e) {
  return yx.has(e.tagName) || e.tabIndex !== -1;
}
const _r = /* @__PURE__ */ new WeakSet();
function Pc(e) {
  return (t) => {
    t.key === "Enter" && e(t);
  };
}
function Qo(e, t) {
  e.dispatchEvent(new PointerEvent("pointer" + t, { isPrimary: !0, bubbles: !0 }));
}
const bx = (e, t) => {
  const n = e.currentTarget;
  if (!n)
    return;
  const r = Pc(() => {
    if (_r.has(n))
      return;
    Qo(n, "down");
    const i = Pc(() => {
      Qo(n, "up");
    }), o = () => Qo(n, "cancel");
    n.addEventListener("keyup", i, t), n.addEventListener("blur", o, t);
  });
  n.addEventListener("keydown", r, t), n.addEventListener("blur", () => n.removeEventListener("keydown", r), t);
};
function Ac(e) {
  return tl(e) && !rh();
}
function xx(e, t, n = {}) {
  const [r, i, o] = ih(e, n), s = (a) => {
    const l = a.currentTarget;
    if (!Ac(a) || _r.has(l))
      return;
    _r.add(l);
    const c = t(a), u = (f, m) => {
      window.removeEventListener("pointerup", d), window.removeEventListener("pointercancel", h), !(!Ac(f) || !_r.has(l)) && (_r.delete(l), typeof c == "function" && c(f, { success: m }));
    }, d = (f) => {
      u(f, n.useGlobalTarget || oh(l, f.target));
    }, h = (f) => {
      u(f, !1);
    };
    window.addEventListener("pointerup", d, i), window.addEventListener("pointercancel", h, i);
  };
  return r.forEach((a) => {
    !vx(a) && a.getAttribute("tabindex") === null && (a.tabIndex = 0), (n.useGlobalTarget ? window : a).addEventListener("pointerdown", s, i), a.addEventListener("focus", (c) => bx(c, i), i);
  }), o;
}
function wx(e) {
  return e === "x" || e === "y" ? Dt[e] ? null : (Dt[e] = !0, () => {
    Dt[e] = !1;
  }) : Dt.x || Dt.y ? null : (Dt.x = Dt.y = !0, () => {
    Dt.x = Dt.y = !1;
  });
}
const sh = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...vr
]);
let Mi;
function Sx() {
  Mi = void 0;
}
const Ut = {
  now: () => (Mi === void 0 && Ut.set(Ye.isProcessing || yb.useManualTiming ? Ye.timestamp : performance.now()), Mi),
  set: (e) => {
    Mi = e, queueMicrotask(Sx);
  }
};
function nl(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function rl(e, t) {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
class il {
  constructor() {
    this.subscriptions = [];
  }
  add(t) {
    return nl(this.subscriptions, t), () => rl(this.subscriptions, t);
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
function ah(e, t) {
  return t ? e * (1e3 / t) : 0;
}
const Rc = 30, kx = (e) => !isNaN(parseFloat(e));
class Cx {
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
      const o = Ut.now();
      this.updatedAt !== o && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(r), this.current !== this.prev && this.events.change && this.events.change.notify(this.current), i && this.events.renderRequest && this.events.renderRequest.notify(this.current);
    }, this.hasAnimated = !1, this.setCurrent(t), this.owner = n.owner;
  }
  setCurrent(t) {
    this.current = t, this.updatedAt = Ut.now(), this.canTrackVelocity === null && t !== void 0 && (this.canTrackVelocity = kx(this.current));
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
    return process.env.NODE_ENV !== "production" && wo(!1, 'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'), this.on("change", t);
  }
  on(t, n) {
    this.events[t] || (this.events[t] = new il());
    const r = this.events[t].add(n);
    return t === "change" ? () => {
      r(), Me.read(() => {
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
    const t = Ut.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || t - this.updatedAt > Rc)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, Rc);
    return ah(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
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
function Gr(e, t) {
  return new Cx(e, t);
}
function Tx(e, t, n) {
  e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, Gr(n));
}
function Ex(e, t) {
  const n = To(e, t);
  let { transitionEnd: r = {}, transition: i = {}, ...o } = n || {};
  o = { ...o, ...r };
  for (const s in o) {
    const a = Vb(o[s]);
    Tx(e, s, a);
  }
}
function Px(e) {
  return !!(nt(e) && e.add);
}
function zs(e, t) {
  const n = e.getValue("willChange");
  if (Px(n))
    return n.add(t);
}
function lh(e) {
  return e.props[Vf];
}
const ch = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e, Ax = 1e-7, Rx = 12;
function Nx(e, t, n, r, i) {
  let o, s, a = 0;
  do
    s = t + (n - t) / 2, o = ch(s, r, i) - e, o > 0 ? n = s : t = s;
  while (Math.abs(o) > Ax && ++a < Rx);
  return s;
}
function oi(e, t, n, r) {
  if (e === t && n === r)
    return ht;
  const i = (o) => Nx(o, 0, 1, e, n);
  return (o) => o === 0 || o === 1 ? o : ch(i(o), t, r);
}
const uh = (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, dh = (e) => (t) => 1 - e(1 - t), fh = /* @__PURE__ */ oi(0.33, 1.53, 0.69, 0.99), ol = /* @__PURE__ */ dh(fh), hh = /* @__PURE__ */ uh(ol), ph = (e) => (e *= 2) < 1 ? 0.5 * ol(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), sl = (e) => 1 - Math.sin(Math.acos(e)), mh = dh(sl), gh = uh(sl), yh = (e) => /^0[^.\s]+$/u.test(e);
function Ix(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || yh(e) : !0;
}
const zr = (e) => Math.round(e * 1e5) / 1e5, al = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function Dx(e) {
  return e == null;
}
const Mx = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, ll = (e, t) => (n) => !!(typeof n == "string" && Mx.test(n) && n.startsWith(e) || t && !Dx(n) && Object.prototype.hasOwnProperty.call(n, t)), vh = (e, t, n) => (r) => {
  if (typeof r != "string")
    return r;
  const [i, o, s, a] = r.match(al);
  return {
    [e]: parseFloat(i),
    [t]: parseFloat(o),
    [n]: parseFloat(s),
    alpha: a !== void 0 ? parseFloat(a) : 1
  };
}, Ox = (e) => tn(0, 255, e), es = {
  ...br,
  transform: (e) => Math.round(Ox(e))
}, Mn = {
  test: /* @__PURE__ */ ll("rgb", "red"),
  parse: /* @__PURE__ */ vh("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: n, alpha: r = 1 }) => "rgba(" + es.transform(e) + ", " + es.transform(t) + ", " + es.transform(n) + ", " + zr(Kr.transform(r)) + ")"
};
function Lx(e) {
  let t = "", n = "", r = "", i = "";
  return e.length > 5 ? (t = e.substring(1, 3), n = e.substring(3, 5), r = e.substring(5, 7), i = e.substring(7, 9)) : (t = e.substring(1, 2), n = e.substring(2, 3), r = e.substring(3, 4), i = e.substring(4, 5), t += t, n += n, r += r, i += i), {
    red: parseInt(t, 16),
    green: parseInt(n, 16),
    blue: parseInt(r, 16),
    alpha: i ? parseInt(i, 16) / 255 : 1
  };
}
const Bs = {
  test: /* @__PURE__ */ ll("#"),
  parse: Lx,
  transform: Mn.transform
}, Jn = {
  test: /* @__PURE__ */ ll("hsl", "hue"),
  parse: /* @__PURE__ */ vh("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(e) + ", " + jt.transform(zr(t)) + ", " + jt.transform(zr(n)) + ", " + zr(Kr.transform(r)) + ")"
}, et = {
  test: (e) => Mn.test(e) || Bs.test(e) || Jn.test(e),
  parse: (e) => Mn.test(e) ? Mn.parse(e) : Jn.test(e) ? Jn.parse(e) : Bs.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? Mn.transform(e) : Jn.transform(e)
}, _x = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function Fx(e) {
  var t, n;
  return isNaN(e) && typeof e == "string" && (((t = e.match(al)) === null || t === void 0 ? void 0 : t.length) || 0) + (((n = e.match(_x)) === null || n === void 0 ? void 0 : n.length) || 0) > 0;
}
const bh = "number", xh = "color", Vx = "var", zx = "var(", Nc = "${}", Bx = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Yr(e) {
  const t = e.toString(), n = [], r = {
    color: [],
    number: [],
    var: []
  }, i = [];
  let o = 0;
  const a = t.replace(Bx, (l) => (et.test(l) ? (r.color.push(o), i.push(xh), n.push(et.parse(l))) : l.startsWith(zx) ? (r.var.push(o), i.push(Vx), n.push(l)) : (r.number.push(o), i.push(bh), n.push(parseFloat(l))), ++o, Nc)).split(Nc);
  return { values: n, split: a, indexes: r, types: i };
}
function wh(e) {
  return Yr(e).values;
}
function Sh(e) {
  const { split: t, types: n } = Yr(e), r = t.length;
  return (i) => {
    let o = "";
    for (let s = 0; s < r; s++)
      if (o += t[s], i[s] !== void 0) {
        const a = n[s];
        a === bh ? o += zr(i[s]) : a === xh ? o += et.transform(i[s]) : o += i[s];
      }
    return o;
  };
}
const $x = (e) => typeof e == "number" ? 0 : e;
function jx(e) {
  const t = wh(e);
  return Sh(e)(t.map($x));
}
const vn = {
  test: Fx,
  parse: wh,
  createTransformer: Sh,
  getAnimatableNone: jx
}, Ux = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function Hx(e) {
  const [t, n] = e.slice(0, -1).split("(");
  if (t === "drop-shadow")
    return e;
  const [r] = n.match(al) || [];
  if (!r)
    return e;
  const i = n.replace(r, "");
  let o = Ux.has(t) ? 1 : 0;
  return r !== n && (o *= 100), t + "(" + o + i + ")";
}
const Wx = /\b([a-z-]*)\(.*?\)/gu, $s = {
  ...vn,
  getAnimatableNone: (e) => {
    const t = e.match(Wx);
    return t ? t.map(Hx).join(" ") : e;
  }
}, qx = {
  ...qa,
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
  filter: $s,
  WebkitFilter: $s
}, cl = (e) => qx[e];
function kh(e, t) {
  let n = cl(e);
  return n !== $s && (n = vn), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0;
}
const Kx = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function Gx(e, t, n) {
  let r = 0, i;
  for (; r < e.length && !i; ) {
    const o = e[r];
    typeof o == "string" && !Kx.has(o) && Yr(o).values.length && (i = e[r]), r++;
  }
  if (i && n)
    for (const o of t)
      e[o] = kh(n, i);
}
const Ic = (e) => e === br || e === ee, Dc = (e, t) => parseFloat(e.split(", ")[t]), Mc = (e, t) => (n, { transform: r }) => {
  if (r === "none" || !r)
    return 0;
  const i = r.match(/^matrix3d\((.+)\)$/u);
  if (i)
    return Dc(i[1], t);
  {
    const o = r.match(/^matrix\((.+)\)$/u);
    return o ? Dc(o[1], e) : 0;
  }
}, Yx = /* @__PURE__ */ new Set(["x", "y", "z"]), Xx = vr.filter((e) => !Yx.has(e));
function Zx(e) {
  const t = [];
  return Xx.forEach((n) => {
    const r = e.getValue(n);
    r !== void 0 && (t.push([n, r.get()]), r.set(n.startsWith("scale") ? 1 : 0));
  }), t;
}
const lr = {
  // Dimensions
  width: ({ x: e }, { paddingLeft: t = "0", paddingRight: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  height: ({ y: e }, { paddingTop: t = "0", paddingBottom: n = "0" }) => e.max - e.min - parseFloat(t) - parseFloat(n),
  top: (e, { top: t }) => parseFloat(t),
  left: (e, { left: t }) => parseFloat(t),
  bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
  right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
  // Transform
  x: Mc(4, 13),
  y: Mc(5, 14)
};
lr.translateX = lr.x;
lr.translateY = lr.y;
const On = /* @__PURE__ */ new Set();
let js = !1, Us = !1;
function Ch() {
  if (Us) {
    const e = Array.from(On).filter((r) => r.needsMeasurement), t = new Set(e.map((r) => r.element)), n = /* @__PURE__ */ new Map();
    t.forEach((r) => {
      const i = Zx(r);
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
  Us = !1, js = !1, On.forEach((e) => e.complete()), On.clear();
}
function Th() {
  On.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (Us = !0);
  });
}
function Jx() {
  Th(), Ch();
}
class ul {
  constructor(t, n, r, i, o, s = !1) {
    this.isComplete = !1, this.isAsync = !1, this.needsMeasurement = !1, this.isScheduled = !1, this.unresolvedKeyframes = [...t], this.onComplete = n, this.name = r, this.motionValue = i, this.element = o, this.isAsync = s;
  }
  scheduleResolve() {
    this.isScheduled = !0, this.isAsync ? (On.add(this), js || (js = !0, Me.read(Th), Me.resolveKeyframes(Ch))) : (this.readKeyframes(), this.complete());
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
    this.isComplete = !0, this.onComplete(this.unresolvedKeyframes, this.finalKeyframe), On.delete(this);
  }
  cancel() {
    this.isComplete || (this.isScheduled = !1, On.delete(this));
  }
  resume() {
    this.isComplete || this.scheduleResolve();
  }
}
const Eh = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), Qx = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function ew(e) {
  const t = Qx.exec(e);
  if (!t)
    return [,];
  const [, n, r, i] = t;
  return [`--${n ?? r}`, i];
}
const tw = 4;
function Ph(e, t, n = 1) {
  gn(n <= tw, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`);
  const [r, i] = ew(e);
  if (!r)
    return;
  const o = window.getComputedStyle(t).getPropertyValue(r);
  if (o) {
    const s = o.trim();
    return Eh(s) ? parseFloat(s) : s;
  }
  return Wa(i) ? Ph(i, t, n + 1) : i;
}
const Ah = (e) => (t) => t.test(e), nw = {
  test: (e) => e === "auto",
  parse: (e) => e
}, Rh = [br, ee, jt, pn, Hb, Ub, nw], Oc = (e) => Rh.find(Ah(e));
class Nh extends ul {
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
      if (typeof c == "string" && (c = c.trim(), Wa(c))) {
        const u = Ph(c, n.current);
        u !== void 0 && (t[l] = u), l === t.length - 1 && (this.finalKeyframe = c);
      }
    }
    if (this.resolveNoneKeyframes(), !sh.has(r) || t.length !== 2)
      return;
    const [i, o] = t, s = Oc(i), a = Oc(o);
    if (s !== a)
      if (Ic(s) && Ic(a))
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
      Ix(t[i]) && r.push(i);
    r.length && Gx(t, r, n);
  }
  measureInitialState() {
    const { element: t, unresolvedKeyframes: n, name: r } = this;
    if (!t || !t.current)
      return;
    r === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = lr[r](t.measureViewportBox(), window.getComputedStyle(t.current)), n[0] = this.measuredOrigin;
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
    i[s] = lr[r](n.measureViewportBox(), window.getComputedStyle(n.current)), a !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = a), !((t = this.removedTransforms) === null || t === void 0) && t.length && this.removedTransforms.forEach(([l, c]) => {
      n.getValue(l).set(c);
    }), this.resolveNoneKeyframes();
  }
}
const Lc = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(vn.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function rw(e) {
  const t = e[0];
  if (e.length === 1)
    return !0;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t)
      return !0;
}
function iw(e, t, n, r) {
  const i = e[0];
  if (i === null)
    return !1;
  if (t === "display" || t === "visibility")
    return !0;
  const o = e[e.length - 1], s = Lc(i, t), a = Lc(o, t);
  return yr(s === a, `You are trying to animate ${t} from "${i}" to "${o}". ${i} is not an animatable value - to enable this animation set ${i} to a value animatable to ${o} via the \`style\` property.`), !s || !a ? !1 : rw(e) || (n === "spring" || Qa(n)) && r;
}
const ow = (e) => e !== null;
function Eo(e, { repeat: t, repeatType: n = "loop" }, r) {
  const i = e.filter(ow), o = t && n !== "loop" && t % 2 === 1 ? 0 : i.length - 1;
  return !o || r === void 0 ? i[o] : r;
}
const sw = 40;
class Ih {
  constructor({ autoplay: t = !0, delay: n = 0, type: r = "keyframes", repeat: i = 0, repeatDelay: o = 0, repeatType: s = "loop", ...a }) {
    this.isStopped = !1, this.hasAttemptedResolve = !1, this.createdAt = Ut.now(), this.options = {
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
    return this.resolvedAt ? this.resolvedAt - this.createdAt > sw ? this.resolvedAt : this.createdAt : this.createdAt;
  }
  /**
   * A getter for resolved data. If keyframes are not yet resolved, accessing
   * this.resolved will synchronously flush all pending keyframe resolvers.
   * This is a deoptimisation, but at its worst still batches read/writes.
   */
  get resolved() {
    return !this._resolved && !this.hasAttemptedResolve && Jx(), this._resolved;
  }
  /**
   * A method to be called when the keyframes resolver completes. This method
   * will check if its possible to run the animation and, if not, skip it.
   * Otherwise, it will call initPlayback on the implementing class.
   */
  onKeyframesResolved(t, n) {
    this.resolvedAt = Ut.now(), this.hasAttemptedResolve = !0;
    const { name: r, type: i, velocity: o, delay: s, onComplete: a, onUpdate: l, isGenerator: c } = this.options;
    if (!c && !iw(t, r, i, o))
      if (s)
        this.options.duration = 0;
      else {
        l && l(Eo(t, this.options, n)), a && a(), this.resolveFinishedPromise();
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
const ze = (e, t, n) => e + (t - e) * n;
function ts(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function aw({ hue: e, saturation: t, lightness: n, alpha: r }) {
  e /= 360, t /= 100, n /= 100;
  let i = 0, o = 0, s = 0;
  if (!t)
    i = o = s = n;
  else {
    const a = n < 0.5 ? n * (1 + t) : n + t - n * t, l = 2 * n - a;
    i = ts(l, a, e + 1 / 3), o = ts(l, a, e), s = ts(l, a, e - 1 / 3);
  }
  return {
    red: Math.round(i * 255),
    green: Math.round(o * 255),
    blue: Math.round(s * 255),
    alpha: r
  };
}
function Ki(e, t) {
  return (n) => n > 0 ? t : e;
}
const ns = (e, t, n) => {
  const r = e * e, i = n * (t * t - r) + r;
  return i < 0 ? 0 : Math.sqrt(i);
}, lw = [Bs, Mn, Jn], cw = (e) => lw.find((t) => t.test(e));
function _c(e) {
  const t = cw(e);
  if (yr(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`), !t)
    return !1;
  let n = t.parse(e);
  return t === Jn && (n = aw(n)), n;
}
const Fc = (e, t) => {
  const n = _c(e), r = _c(t);
  if (!n || !r)
    return Ki(e, t);
  const i = { ...n };
  return (o) => (i.red = ns(n.red, r.red, o), i.green = ns(n.green, r.green, o), i.blue = ns(n.blue, r.blue, o), i.alpha = ze(n.alpha, r.alpha, o), Mn.transform(i));
}, uw = (e, t) => (n) => t(e(n)), si = (...e) => e.reduce(uw), Hs = /* @__PURE__ */ new Set(["none", "hidden"]);
function dw(e, t) {
  return Hs.has(e) ? (n) => n <= 0 ? e : t : (n) => n >= 1 ? t : e;
}
function fw(e, t) {
  return (n) => ze(e, t, n);
}
function dl(e) {
  return typeof e == "number" ? fw : typeof e == "string" ? Wa(e) ? Ki : et.test(e) ? Fc : mw : Array.isArray(e) ? Dh : typeof e == "object" ? et.test(e) ? Fc : hw : Ki;
}
function Dh(e, t) {
  const n = [...e], r = n.length, i = e.map((o, s) => dl(o)(o, t[s]));
  return (o) => {
    for (let s = 0; s < r; s++)
      n[s] = i[s](o);
    return n;
  };
}
function hw(e, t) {
  const n = { ...e, ...t }, r = {};
  for (const i in n)
    e[i] !== void 0 && t[i] !== void 0 && (r[i] = dl(e[i])(e[i], t[i]));
  return (i) => {
    for (const o in r)
      n[o] = r[o](i);
    return n;
  };
}
function pw(e, t) {
  var n;
  const r = [], i = { color: 0, var: 0, number: 0 };
  for (let o = 0; o < t.values.length; o++) {
    const s = t.types[o], a = e.indexes[s][i[s]], l = (n = e.values[a]) !== null && n !== void 0 ? n : 0;
    r[o] = l, i[s]++;
  }
  return r;
}
const mw = (e, t) => {
  const n = vn.createTransformer(t), r = Yr(e), i = Yr(t);
  return r.indexes.var.length === i.indexes.var.length && r.indexes.color.length === i.indexes.color.length && r.indexes.number.length >= i.indexes.number.length ? Hs.has(e) && !i.values.length || Hs.has(t) && !r.values.length ? dw(e, t) : si(Dh(pw(r, i), i.values), n) : (yr(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`), Ki(e, t));
};
function Mh(e, t, n) {
  return typeof e == "number" && typeof t == "number" && typeof n == "number" ? ze(e, t, n) : dl(e)(e, t);
}
const gw = 5;
function Oh(e, t, n) {
  const r = Math.max(t - gw, 0);
  return ah(n - e(r), t - r);
}
const Ve = {
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
}, rs = 1e-3;
function yw({ duration: e = Ve.duration, bounce: t = Ve.bounce, velocity: n = Ve.velocity, mass: r = Ve.mass }) {
  let i, o;
  yr(e <= /* @__PURE__ */ $t(Ve.maxDuration), "Spring duration must be 10 seconds or less");
  let s = 1 - t;
  s = tn(Ve.minDamping, Ve.maxDamping, s), e = tn(Ve.minDuration, Ve.maxDuration, /* @__PURE__ */ Qt(e)), s < 1 ? (i = (c) => {
    const u = c * s, d = u * e, h = u - n, f = Ws(c, s), m = Math.exp(-d);
    return rs - h / f * m;
  }, o = (c) => {
    const d = c * s * e, h = d * n + n, f = Math.pow(s, 2) * Math.pow(c, 2) * e, m = Math.exp(-d), p = Ws(Math.pow(c, 2), s);
    return (-i(c) + rs > 0 ? -1 : 1) * ((h - f) * m) / p;
  }) : (i = (c) => {
    const u = Math.exp(-c * e), d = (c - n) * e + 1;
    return -rs + u * d;
  }, o = (c) => {
    const u = Math.exp(-c * e), d = (n - c) * (e * e);
    return u * d;
  });
  const a = 5 / e, l = bw(i, o, a);
  if (e = /* @__PURE__ */ $t(e), isNaN(l))
    return {
      stiffness: Ve.stiffness,
      damping: Ve.damping,
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
const vw = 12;
function bw(e, t, n) {
  let r = n;
  for (let i = 1; i < vw; i++)
    r = r - e(r) / t(r);
  return r;
}
function Ws(e, t) {
  return e * Math.sqrt(1 - t * t);
}
const xw = ["duration", "bounce"], ww = ["stiffness", "damping", "mass"];
function Vc(e, t) {
  return t.some((n) => e[n] !== void 0);
}
function Sw(e) {
  let t = {
    velocity: Ve.velocity,
    stiffness: Ve.stiffness,
    damping: Ve.damping,
    mass: Ve.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!Vc(e, ww) && Vc(e, xw))
    if (e.visualDuration) {
      const n = e.visualDuration, r = 2 * Math.PI / (n * 1.2), i = r * r, o = 2 * tn(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(i);
      t = {
        ...t,
        mass: Ve.mass,
        stiffness: i,
        damping: o
      };
    } else {
      const n = yw(e);
      t = {
        ...t,
        ...n,
        mass: Ve.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function Lh(e = Ve.visualDuration, t = Ve.bounce) {
  const n = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e;
  let { restSpeed: r, restDelta: i } = n;
  const o = n.keyframes[0], s = n.keyframes[n.keyframes.length - 1], a = { done: !1, value: o }, { stiffness: l, damping: c, mass: u, duration: d, velocity: h, isResolvedFromDuration: f } = Sw({
    ...n,
    velocity: -/* @__PURE__ */ Qt(n.velocity || 0)
  }), m = h || 0, p = c / (2 * Math.sqrt(l * u)), b = s - o, v = /* @__PURE__ */ Qt(Math.sqrt(l / u)), x = Math.abs(b) < 5;
  r || (r = x ? Ve.restSpeed.granular : Ve.restSpeed.default), i || (i = x ? Ve.restDelta.granular : Ve.restDelta.default);
  let w;
  if (p < 1) {
    const E = Ws(v, p);
    w = (k) => {
      const A = Math.exp(-p * v * k);
      return s - A * ((m + p * v * b) / E * Math.sin(E * k) + b * Math.cos(E * k));
    };
  } else if (p === 1)
    w = (E) => s - Math.exp(-v * E) * (b + (m + v * b) * E);
  else {
    const E = v * Math.sqrt(p * p - 1);
    w = (k) => {
      const A = Math.exp(-p * v * k), D = Math.min(E * k, 300);
      return s - A * ((m + p * v * b) * Math.sinh(D) + E * b * Math.cosh(D)) / E;
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
        p < 1 && (A = E === 0 ? /* @__PURE__ */ $t(m) : Oh(w, E, k));
        const D = Math.abs(A) <= r, F = Math.abs(s - k) <= i;
        a.done = D && F;
      }
      return a.value = a.done ? s : k, a;
    },
    toString: () => {
      const E = Math.min(Qf(T), Fs), k = eh((A) => T.next(E * A).value, E, 30);
      return E + "ms " + k;
    }
  };
  return T;
}
function zc({ keyframes: e, velocity: t = 0, power: n = 0.8, timeConstant: r = 325, bounceDamping: i = 10, bounceStiffness: o = 500, modifyTarget: s, min: a, max: l, restDelta: c = 0.5, restSpeed: u }) {
  const d = e[0], h = {
    done: !1,
    value: d
  }, f = (D) => a !== void 0 && D < a || l !== void 0 && D > l, m = (D) => a === void 0 ? l : l === void 0 || Math.abs(a - D) < Math.abs(l - D) ? a : l;
  let p = n * t;
  const b = d + p, v = s === void 0 ? b : s(b);
  v !== b && (p = v - d);
  const x = (D) => -p * Math.exp(-D / r), w = (D) => v + x(D), T = (D) => {
    const F = x(D), P = w(D);
    h.done = Math.abs(F) <= c, h.value = h.done ? v : P;
  };
  let E, k;
  const A = (D) => {
    f(h.value) && (E = D, k = Lh({
      keyframes: [h.value, m(h.value)],
      velocity: Oh(w, D, h.value),
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
      return !k && E === void 0 && (F = !0, T(D), A(D)), E !== void 0 && D >= E ? k.next(D - E) : (!F && T(D), h);
    }
  };
}
const kw = /* @__PURE__ */ oi(0.42, 0, 1, 1), Cw = /* @__PURE__ */ oi(0, 0, 0.58, 1), _h = /* @__PURE__ */ oi(0.42, 0, 0.58, 1), Tw = (e) => Array.isArray(e) && typeof e[0] != "number", Bc = {
  linear: ht,
  easeIn: kw,
  easeInOut: _h,
  easeOut: Cw,
  circIn: sl,
  circInOut: gh,
  circOut: mh,
  backIn: ol,
  backInOut: hh,
  backOut: fh,
  anticipate: ph
}, $c = (e) => {
  if (el(e)) {
    gn(e.length === 4, "Cubic bezier arrays must contain four numerical values.");
    const [t, n, r, i] = e;
    return oi(t, n, r, i);
  } else if (typeof e == "string")
    return gn(Bc[e] !== void 0, `Invalid easing type '${e}'`), Bc[e];
  return e;
};
function Ew(e, t, n) {
  const r = [], i = n || Mh, o = e.length - 1;
  for (let s = 0; s < o; s++) {
    let a = i(e[s], e[s + 1]);
    if (t) {
      const l = Array.isArray(t) ? t[s] || ht : t;
      a = si(l, a);
    }
    r.push(a);
  }
  return r;
}
function Pw(e, t, { clamp: n = !0, ease: r, mixer: i } = {}) {
  const o = e.length;
  if (gn(o === t.length, "Both input and output ranges must be the same length"), o === 1)
    return () => t[0];
  if (o === 2 && t[0] === t[1])
    return () => t[1];
  const s = e[0] === e[1];
  e[0] > e[o - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const a = Ew(t, r, i), l = a.length, c = (u) => {
    if (s && u < e[0])
      return t[0];
    let d = 0;
    if (l > 1)
      for (; d < e.length - 2 && !(u < e[d + 1]); d++)
        ;
    const h = /* @__PURE__ */ sr(e[d], e[d + 1], u);
    return a[d](h);
  };
  return n ? (u) => c(tn(e[0], e[o - 1], u)) : c;
}
function Aw(e, t) {
  const n = e[e.length - 1];
  for (let r = 1; r <= t; r++) {
    const i = /* @__PURE__ */ sr(0, t, r);
    e.push(ze(n, 1, i));
  }
}
function Rw(e) {
  const t = [0];
  return Aw(t, e.length - 1), t;
}
function Nw(e, t) {
  return e.map((n) => n * t);
}
function Iw(e, t) {
  return e.map(() => t || _h).splice(0, e.length - 1);
}
function Gi({ duration: e = 300, keyframes: t, times: n, ease: r = "easeInOut" }) {
  const i = Tw(r) ? r.map($c) : $c(r), o = {
    done: !1,
    value: t[0]
  }, s = Nw(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === t.length ? n : Rw(t),
    e
  ), a = Pw(s, t, {
    ease: Array.isArray(i) ? i : Iw(t, i)
  });
  return {
    calculatedDuration: e,
    next: (l) => (o.value = a(l), o.done = l >= e, o)
  };
}
const Dw = (e) => {
  const t = ({ timestamp: n }) => e(n);
  return {
    start: () => Me.update(t, !0),
    stop: () => yn(t),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => Ye.isProcessing ? Ye.timestamp : Ut.now()
  };
}, Mw = {
  decay: zc,
  inertia: zc,
  tween: Gi,
  keyframes: Gi,
  spring: Lh
}, Ow = (e) => e / 100;
class fl extends Ih {
  constructor(t) {
    super(t), this.holdTime = null, this.cancelTime = null, this.currentTime = 0, this.playbackSpeed = 1, this.pendingPlayState = "running", this.startTime = null, this.state = "idle", this.stop = () => {
      if (this.resolver.cancel(), this.isStopped = !0, this.state === "idle")
        return;
      this.teardown();
      const { onStop: l } = this.options;
      l && l();
    };
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options, s = (i == null ? void 0 : i.KeyframeResolver) || ul, a = (l, c) => this.onKeyframesResolved(l, c);
    this.resolver = new s(o, a, n, r, i), this.resolver.scheduleResolve();
  }
  flatten() {
    super.flatten(), this._resolved && Object.assign(this._resolved, this.initPlayback(this._resolved.keyframes));
  }
  initPlayback(t) {
    const { type: n = "keyframes", repeat: r = 0, repeatDelay: i = 0, repeatType: o, velocity: s = 0 } = this.options, a = Qa(n) ? n : Mw[n] || Gi;
    let l, c;
    a !== Gi && typeof t[0] != "number" && (process.env.NODE_ENV !== "production" && gn(t.length === 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${t}`), l = si(Ow, Mh(t[0], t[1])), t = [0, 100]);
    const u = a({ ...this.options, keyframes: t });
    o === "mirror" && (c = a({
      ...this.options,
      keyframes: [...t].reverse(),
      velocity: -s
    })), u.calculatedDuration === null && (u.calculatedDuration = Qf(u));
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
    let w = this.currentTime, T = o;
    if (f) {
      const D = Math.min(this.currentTime, u) / d;
      let F = Math.floor(D), P = D % 1;
      !P && D >= 1 && (P = 1), P === 1 && F--, F = Math.min(F, f + 1), !!(F % 2) && (m === "reverse" ? (P = 1 - P, p && (P -= p / d)) : m === "mirror" && (T = s)), w = tn(0, 1, P) * d;
    }
    const E = x ? { done: !1, value: l[0] } : T.next(w);
    a && (E.value = a(E.value));
    let { done: k } = E;
    !x && c !== null && (k = this.speed >= 0 ? this.currentTime >= u : this.currentTime <= 0);
    const A = this.holdTime === null && (this.state === "finished" || this.state === "running" && k);
    return A && i !== void 0 && (E.value = Eo(l, this.options, i)), b && b(E.value), A && this.finish(), E;
  }
  get duration() {
    const { resolved: t } = this;
    return t ? /* @__PURE__ */ Qt(t.calculatedDuration) : 0;
  }
  get time() {
    return /* @__PURE__ */ Qt(this.currentTime);
  }
  set time(t) {
    t = /* @__PURE__ */ $t(t), this.currentTime = t, this.holdTime !== null || this.speed === 0 ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.speed);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(t) {
    const n = this.playbackSpeed !== t;
    this.playbackSpeed = t, n && (this.time = /* @__PURE__ */ Qt(this.currentTime));
  }
  play() {
    if (this.resolver.isScheduled || this.resolver.resume(), !this._resolved) {
      this.pendingPlayState = "running";
      return;
    }
    if (this.isStopped)
      return;
    const { driver: t = Dw, onPlay: n, startTime: r } = this.options;
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
const Lw = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform"
  // TODO: Can be accelerated but currently disabled until https://issues.chromium.org/issues/41491098 is resolved
  // or until we implement support for linear() easing.
  // "background-color"
]);
function _w(e, t, n, { delay: r = 0, duration: i = 300, repeat: o = 0, repeatType: s = "loop", ease: a = "easeInOut", times: l } = {}) {
  const c = { [t]: n };
  l && (c.offset = l);
  const u = nh(a, i);
  return Array.isArray(u) && (c.easing = u), e.animate(c, {
    delay: r,
    duration: i,
    easing: Array.isArray(u) ? "linear" : u,
    fill: "both",
    iterations: o + 1,
    direction: s === "reverse" ? "alternate" : "normal"
  });
}
const Fw = /* @__PURE__ */ Va(() => Object.hasOwnProperty.call(Element.prototype, "animate")), Yi = 10, Vw = 2e4;
function zw(e) {
  return Qa(e.type) || e.type === "spring" || !th(e.ease);
}
function Bw(e, t) {
  const n = new fl({
    ...t,
    keyframes: e,
    repeat: 0,
    delay: 0,
    isGenerator: !0
  });
  let r = { done: !1, value: e[0] };
  const i = [];
  let o = 0;
  for (; !r.done && o < Vw; )
    r = n.sample(o), i.push(r.value), o += Yi;
  return {
    times: void 0,
    keyframes: i,
    duration: o - Yi,
    ease: "linear"
  };
}
const Fh = {
  anticipate: ph,
  backInOut: hh,
  circInOut: gh
};
function $w(e) {
  return e in Fh;
}
class jc extends Ih {
  constructor(t) {
    super(t);
    const { name: n, motionValue: r, element: i, keyframes: o } = this.options;
    this.resolver = new Nh(o, (s, a) => this.onKeyframesResolved(s, a), n, r, i), this.resolver.scheduleResolve();
  }
  initPlayback(t, n) {
    let { duration: r = 300, times: i, ease: o, type: s, motionValue: a, name: l, startTime: c } = this.options;
    if (!a.owner || !a.owner.current)
      return !1;
    if (typeof o == "string" && qi() && $w(o) && (o = Fh[o]), zw(this.options)) {
      const { onComplete: d, onUpdate: h, motionValue: f, element: m, ...p } = this.options, b = Bw(t, p);
      t = b.keyframes, t.length === 1 && (t[1] = t[0]), r = b.duration, i = b.times, o = b.ease, s = "keyframes";
    }
    const u = _w(a.owner.current, l, t, { ...this.options, duration: r, times: i, ease: o });
    return u.startTime = c ?? this.calcStartTime(), this.pendingTimeline ? (Tc(u, this.pendingTimeline), this.pendingTimeline = void 0) : u.onfinish = () => {
      const { onComplete: d } = this.options;
      a.set(Eo(t, this.options, n)), d && d(), this.cancel(), this.resolveFinishedPromise();
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
    return /* @__PURE__ */ Qt(n);
  }
  get time() {
    const { resolved: t } = this;
    if (!t)
      return 0;
    const { animation: n } = t;
    return /* @__PURE__ */ Qt(n.currentTime || 0);
  }
  set time(t) {
    const { resolved: n } = this;
    if (!n)
      return;
    const { animation: r } = n;
    r.currentTime = /* @__PURE__ */ $t(t);
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
        return ht;
      const { animation: r } = n;
      Tc(r, t);
    }
    return ht;
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
      const { motionValue: c, onUpdate: u, onComplete: d, element: h, ...f } = this.options, m = new fl({
        ...f,
        keyframes: r,
        duration: i,
        type: o,
        ease: s,
        times: a,
        isGenerator: !0
      }), p = /* @__PURE__ */ $t(this.time);
      c.setWithVelocity(m.sample(p - Yi).value, m.sample(p).value, Yi);
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
    return Fw() && r && Lw.has(r) && /**
     * If we're outputting values to onUpdate then we can't use WAAPI as there's
     * no way to read the value from WAAPI every frame.
     */
    !l && !c && !i && o !== "mirror" && s !== 0 && a !== "inertia";
  }
}
const jw = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, Uw = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), Hw = {
  type: "keyframes",
  duration: 0.8
}, Ww = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, qw = (e, { keyframes: t }) => t.length > 2 ? Hw : Un.has(e) ? e.startsWith("scale") ? Uw(t[1]) : jw : Ww;
function Kw({ when: e, delay: t, delayChildren: n, staggerChildren: r, staggerDirection: i, repeat: o, repeatType: s, repeatDelay: a, from: l, elapsed: c, ...u }) {
  return !!Object.keys(u).length;
}
const hl = (e, t, n, r = {}, i, o) => (s) => {
  const a = Ja(r, e) || {}, l = a.delay || r.delay || 0;
  let { elapsed: c = 0 } = r;
  c = c - /* @__PURE__ */ $t(l);
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
  Kw(a) || (u = {
    ...u,
    ...qw(e, u)
  }), u.duration && (u.duration = /* @__PURE__ */ $t(u.duration)), u.repeatDelay && (u.repeatDelay = /* @__PURE__ */ $t(u.repeatDelay)), u.from !== void 0 && (u.keyframes[0] = u.from);
  let d = !1;
  if ((u.type === !1 || u.duration === 0 && !u.repeatDelay) && (u.duration = 0, u.delay === 0 && (d = !0)), d && !o && t.get() !== void 0) {
    const h = Eo(u.keyframes, a);
    if (h !== void 0)
      return Me.update(() => {
        u.onUpdate(h), u.onComplete();
      }), new fx([]);
  }
  return !o && jc.supports(u) ? new jc(u) : new fl(u);
};
function Gw({ protectedKeys: e, needsAnimating: t }, n) {
  const r = e.hasOwnProperty(n) && t[n] !== !0;
  return t[n] = !1, r;
}
function Vh(e, t, { delay: n = 0, transitionOverride: r, type: i } = {}) {
  var o;
  let { transition: s = e.getDefaultTransition(), transitionEnd: a, ...l } = t;
  r && (s = r);
  const c = [], u = i && e.animationState && e.animationState.getState()[i];
  for (const d in l) {
    const h = e.getValue(d, (o = e.latestValues[d]) !== null && o !== void 0 ? o : null), f = l[d];
    if (f === void 0 || u && Gw(u, d))
      continue;
    const m = {
      delay: n,
      ...Ja(s || {}, d)
    };
    let p = !1;
    if (window.MotionHandoffAnimation) {
      const v = lh(e);
      if (v) {
        const x = window.MotionHandoffAnimation(v, d, Me);
        x !== null && (m.startTime = x, p = !0);
      }
    }
    zs(e, d), h.start(hl(d, h, f, e.shouldReduceMotion && sh.has(d) ? { type: !1 } : m, e, p));
    const b = h.animation;
    b && c.push(b);
  }
  return a && Promise.all(c).then(() => {
    Me.update(() => {
      a && Ex(e, a);
    });
  }), c;
}
function qs(e, t, n = {}) {
  var r;
  const i = To(e, t, n.type === "exit" ? (r = e.presenceContext) === null || r === void 0 ? void 0 : r.custom : void 0);
  let { transition: o = e.getDefaultTransition() || {} } = i || {};
  n.transitionOverride && (o = n.transitionOverride);
  const s = i ? () => Promise.all(Vh(e, i, n)) : () => Promise.resolve(), a = e.variantChildren && e.variantChildren.size ? (c = 0) => {
    const { delayChildren: u = 0, staggerChildren: d, staggerDirection: h } = o;
    return Yw(e, t, u + c, d, h, n);
  } : () => Promise.resolve(), { when: l } = o;
  if (l) {
    const [c, u] = l === "beforeChildren" ? [s, a] : [a, s];
    return c().then(() => u());
  } else
    return Promise.all([s(), a(n.delay)]);
}
function Yw(e, t, n = 0, r = 0, i = 1, o) {
  const s = [], a = (e.variantChildren.size - 1) * r, l = i === 1 ? (c = 0) => c * r : (c = 0) => a - c * r;
  return Array.from(e.variantChildren).sort(Xw).forEach((c, u) => {
    c.notify("AnimationStart", t), s.push(qs(c, t, {
      ...o,
      delay: n + l(u)
    }).then(() => c.notify("AnimationComplete", t)));
  }), Promise.all(s);
}
function Xw(e, t) {
  return e.sortNodePosition(t);
}
function Zw(e, t, n = {}) {
  e.notify("AnimationStart", t);
  let r;
  if (Array.isArray(t)) {
    const i = t.map((o) => qs(e, o, n));
    r = Promise.all(i);
  } else if (typeof t == "string")
    r = qs(e, t, n);
  else {
    const i = typeof t == "function" ? To(e, t, n.custom) : t;
    r = Promise.all(Vh(e, i, n));
  }
  return r.then(() => {
    e.notify("AnimationComplete", t);
  });
}
const Jw = Ba.length;
function zh(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const n = e.parent ? zh(e.parent) || {} : {};
    return e.props.initial !== void 0 && (n.initial = e.props.initial), n;
  }
  const t = {};
  for (let n = 0; n < Jw; n++) {
    const r = Ba[n], i = e.props[r];
    (qr(i) || i === !1) && (t[r] = i);
  }
  return t;
}
const Qw = [...za].reverse(), e0 = za.length;
function t0(e) {
  return (t) => Promise.all(t.map(({ animation: n, options: r }) => Zw(e, n, r)));
}
function n0(e) {
  let t = t0(e), n = Uc(), r = !0;
  const i = (l) => (c, u) => {
    var d;
    const h = To(e, u, l === "exit" ? (d = e.presenceContext) === null || d === void 0 ? void 0 : d.custom : void 0);
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
    const { props: c } = e, u = zh(e.parent) || {}, d = [], h = /* @__PURE__ */ new Set();
    let f = {}, m = 1 / 0;
    for (let b = 0; b < e0; b++) {
      const v = Qw[b], x = n[v], w = c[v] !== void 0 ? c[v] : u[v], T = qr(w), E = v === l ? x.isActive : null;
      E === !1 && (m = b);
      let k = w === u[v] && w !== c[v] && T;
      if (k && r && e.manuallyAnimateOnMount && (k = !1), x.protectedKeys = { ...f }, // If it isn't active and hasn't *just* been set as inactive
      !x.isActive && E === null || // If we didn't and don't have any defined prop for this animation type
      !w && !x.prevProp || // Or if the prop doesn't define an animation
      ko(w) || typeof w == "boolean")
        continue;
      const A = r0(x.prevProp, w);
      let D = A || // If we're making this variant active, we want to always make it active
      v === l && x.isActive && !k && T || // If we removed a higher-priority variant (i is in reverse order)
      b > m && T, F = !1;
      const P = Array.isArray(w) ? w : [w];
      let I = P.reduce(i(v), {});
      E === !1 && (I = {});
      const { prevResolvedValues: R = {} } = x, z = {
        ...R,
        ...I
      }, j = (N) => {
        D = !0, h.has(N) && (F = !0, h.delete(N)), x.needsAnimating[N] = !0;
        const _ = e.getValue(N);
        _ && (_.liveStyle = !1);
      };
      for (const N in z) {
        const _ = I[N], L = R[N];
        if (f.hasOwnProperty(N))
          continue;
        let S = !1;
        _s(_) && _s(L) ? S = !Jf(_, L) : S = _ !== L, S ? _ != null ? j(N) : h.add(N) : _ !== void 0 && h.has(N) ? j(N) : x.protectedKeys[N] = !0;
      }
      x.prevProp = w, x.prevResolvedValues = I, x.isActive && (f = { ...f, ...I }), r && e.blockInitialAnimation && (D = !1), D && (!(k && A) || F) && d.push(...P.map((N) => ({
        animation: N,
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
      n = Uc(), r = !0;
    }
  };
}
function r0(e, t) {
  return typeof t == "string" ? t !== e : Array.isArray(t) ? !Jf(t, e) : !1;
}
function Pn(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Uc() {
  return {
    animate: Pn(!0),
    whileInView: Pn(),
    whileHover: Pn(),
    whileTap: Pn(),
    whileDrag: Pn(),
    whileFocus: Pn(),
    exit: Pn()
  };
}
class Sn {
  constructor(t) {
    this.isMounted = !1, this.node = t;
  }
  update() {
  }
}
class i0 extends Sn {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(t) {
    super(t), t.animationState || (t.animationState = n0(t));
  }
  updateAnimationControlsSubscription() {
    const { animate: t } = this.node.getProps();
    ko(t) && (this.unmountControls = t.subscribe(this.node));
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
let o0 = 0;
class s0 extends Sn {
  constructor() {
    super(...arguments), this.id = o0++;
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
const a0 = {
  animation: {
    Feature: i0
  },
  exit: {
    Feature: s0
  }
};
function Xr(e, t, n, r = { passive: !0 }) {
  return e.addEventListener(t, n, r), () => e.removeEventListener(t, n);
}
function ai(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const l0 = (e) => (t) => tl(t) && e(t, ai(t));
function Br(e, t, n, r) {
  return Xr(e, t, l0(n), r);
}
const Hc = (e, t) => Math.abs(e - t);
function c0(e, t) {
  const n = Hc(e.x, t.x), r = Hc(e.y, t.y);
  return Math.sqrt(n ** 2 + r ** 2);
}
class Bh {
  constructor(t, n, { transformPagePoint: r, contextWindow: i, dragSnapToOrigin: o = !1 } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const d = os(this.lastMoveEventInfo, this.history), h = this.startEvent !== null, f = c0(d.offset, { x: 0, y: 0 }) >= 3;
      if (!h && !f)
        return;
      const { point: m } = d, { timestamp: p } = Ye;
      this.history.push({ ...m, timestamp: p });
      const { onStart: b, onMove: v } = this.handlers;
      h || (b && b(this.lastMoveEvent, d), this.startEvent = this.lastMoveEvent), v && v(this.lastMoveEvent, d);
    }, this.handlePointerMove = (d, h) => {
      this.lastMoveEvent = d, this.lastMoveEventInfo = is(h, this.transformPagePoint), Me.update(this.updatePoint, !0);
    }, this.handlePointerUp = (d, h) => {
      this.end();
      const { onEnd: f, onSessionEnd: m, resumeAnimation: p } = this.handlers;
      if (this.dragSnapToOrigin && p && p(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const b = os(d.type === "pointercancel" ? this.lastMoveEventInfo : is(h, this.transformPagePoint), this.history);
      this.startEvent && f && f(d, b), m && m(d, b);
    }, !tl(t))
      return;
    this.dragSnapToOrigin = o, this.handlers = n, this.transformPagePoint = r, this.contextWindow = i || window;
    const s = ai(t), a = is(s, this.transformPagePoint), { point: l } = a, { timestamp: c } = Ye;
    this.history = [{ ...l, timestamp: c }];
    const { onSessionStart: u } = n;
    u && u(t, os(a, this.history)), this.removeListeners = si(Br(this.contextWindow, "pointermove", this.handlePointerMove), Br(this.contextWindow, "pointerup", this.handlePointerUp), Br(this.contextWindow, "pointercancel", this.handlePointerUp));
  }
  updateHandlers(t) {
    this.handlers = t;
  }
  end() {
    this.removeListeners && this.removeListeners(), yn(this.updatePoint);
  }
}
function is(e, t) {
  return t ? { point: t(e.point) } : e;
}
function Wc(e, t) {
  return { x: e.x - t.x, y: e.y - t.y };
}
function os({ point: e }, t) {
  return {
    point: e,
    delta: Wc(e, $h(t)),
    offset: Wc(e, u0(t)),
    velocity: d0(t, 0.1)
  };
}
function u0(e) {
  return e[0];
}
function $h(e) {
  return e[e.length - 1];
}
function d0(e, t) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let n = e.length - 1, r = null;
  const i = $h(e);
  for (; n >= 0 && (r = e[n], !(i.timestamp - r.timestamp > /* @__PURE__ */ $t(t))); )
    n--;
  if (!r)
    return { x: 0, y: 0 };
  const o = /* @__PURE__ */ Qt(i.timestamp - r.timestamp);
  if (o === 0)
    return { x: 0, y: 0 };
  const s = {
    x: (i.x - r.x) / o,
    y: (i.y - r.y) / o
  };
  return s.x === 1 / 0 && (s.x = 0), s.y === 1 / 0 && (s.y = 0), s;
}
const jh = 1e-4, f0 = 1 - jh, h0 = 1 + jh, Uh = 0.01, p0 = 0 - Uh, m0 = 0 + Uh;
function xt(e) {
  return e.max - e.min;
}
function g0(e, t, n) {
  return Math.abs(e - t) <= n;
}
function qc(e, t, n, r = 0.5) {
  e.origin = r, e.originPoint = ze(t.min, t.max, e.origin), e.scale = xt(n) / xt(t), e.translate = ze(n.min, n.max, e.origin) - e.originPoint, (e.scale >= f0 && e.scale <= h0 || isNaN(e.scale)) && (e.scale = 1), (e.translate >= p0 && e.translate <= m0 || isNaN(e.translate)) && (e.translate = 0);
}
function $r(e, t, n, r) {
  qc(e.x, t.x, n.x, r ? r.originX : void 0), qc(e.y, t.y, n.y, r ? r.originY : void 0);
}
function Kc(e, t, n) {
  e.min = n.min + t.min, e.max = e.min + xt(t);
}
function y0(e, t, n) {
  Kc(e.x, t.x, n.x), Kc(e.y, t.y, n.y);
}
function Gc(e, t, n) {
  e.min = t.min - n.min, e.max = e.min + xt(t);
}
function jr(e, t, n) {
  Gc(e.x, t.x, n.x), Gc(e.y, t.y, n.y);
}
function v0(e, { min: t, max: n }, r) {
  return t !== void 0 && e < t ? e = r ? ze(t, e, r.min) : Math.max(e, t) : n !== void 0 && e > n && (e = r ? ze(n, e, r.max) : Math.min(e, n)), e;
}
function Yc(e, t, n) {
  return {
    min: t !== void 0 ? e.min + t : void 0,
    max: n !== void 0 ? e.max + n - (e.max - e.min) : void 0
  };
}
function b0(e, { top: t, left: n, bottom: r, right: i }) {
  return {
    x: Yc(e.x, n, i),
    y: Yc(e.y, t, r)
  };
}
function Xc(e, t) {
  let n = t.min - e.min, r = t.max - e.max;
  return t.max - t.min < e.max - e.min && ([n, r] = [r, n]), { min: n, max: r };
}
function x0(e, t) {
  return {
    x: Xc(e.x, t.x),
    y: Xc(e.y, t.y)
  };
}
function w0(e, t) {
  let n = 0.5;
  const r = xt(e), i = xt(t);
  return i > r ? n = /* @__PURE__ */ sr(t.min, t.max - r, e.min) : r > i && (n = /* @__PURE__ */ sr(e.min, e.max - i, t.min)), tn(0, 1, n);
}
function S0(e, t) {
  const n = {};
  return t.min !== void 0 && (n.min = t.min - e.min), t.max !== void 0 && (n.max = t.max - e.min), n;
}
const Ks = 0.35;
function k0(e = Ks) {
  return e === !1 ? e = 0 : e === !0 && (e = Ks), {
    x: Zc(e, "left", "right"),
    y: Zc(e, "top", "bottom")
  };
}
function Zc(e, t, n) {
  return {
    min: Jc(e, t),
    max: Jc(e, n)
  };
}
function Jc(e, t) {
  return typeof e == "number" ? e : e[t] || 0;
}
const Qc = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), Qn = () => ({
  x: Qc(),
  y: Qc()
}), eu = () => ({ min: 0, max: 0 }), Ue = () => ({
  x: eu(),
  y: eu()
});
function Ct(e) {
  return [e("x"), e("y")];
}
function Hh({ top: e, left: t, right: n, bottom: r }) {
  return {
    x: { min: t, max: n },
    y: { min: e, max: r }
  };
}
function C0({ x: e, y: t }) {
  return { top: t.min, right: e.max, bottom: t.max, left: e.min };
}
function T0(e, t) {
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
function ss(e) {
  return e === void 0 || e === 1;
}
function Gs({ scale: e, scaleX: t, scaleY: n }) {
  return !ss(e) || !ss(t) || !ss(n);
}
function Rn(e) {
  return Gs(e) || Wh(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function Wh(e) {
  return tu(e.x) || tu(e.y);
}
function tu(e) {
  return e && e !== "0%";
}
function Xi(e, t, n) {
  const r = e - n, i = t * r;
  return n + i;
}
function nu(e, t, n, r, i) {
  return i !== void 0 && (e = Xi(e, i, r)), Xi(e, n, r) + t;
}
function Ys(e, t = 0, n = 1, r, i) {
  e.min = nu(e.min, t, n, r, i), e.max = nu(e.max, t, n, r, i);
}
function qh(e, { x: t, y: n }) {
  Ys(e.x, t.translate, t.scale, t.originPoint), Ys(e.y, n.translate, n.scale, n.originPoint);
}
const ru = 0.999999999999, iu = 1.0000000000001;
function E0(e, t, n, r = !1) {
  const i = n.length;
  if (!i)
    return;
  t.x = t.y = 1;
  let o, s;
  for (let a = 0; a < i; a++) {
    o = n[a], s = o.projectionDelta;
    const { visualElement: l } = o.options;
    l && l.props.style && l.props.style.display === "contents" || (r && o.options.layoutScroll && o.scroll && o !== o.root && tr(e, {
      x: -o.scroll.offset.x,
      y: -o.scroll.offset.y
    }), s && (t.x *= s.x.scale, t.y *= s.y.scale, qh(e, s)), r && Rn(o.latestValues) && tr(e, o.latestValues));
  }
  t.x < iu && t.x > ru && (t.x = 1), t.y < iu && t.y > ru && (t.y = 1);
}
function er(e, t) {
  e.min = e.min + t, e.max = e.max + t;
}
function ou(e, t, n, r, i = 0.5) {
  const o = ze(e.min, e.max, i);
  Ys(e, t, n, o, r);
}
function tr(e, t) {
  ou(e.x, t.x, t.scaleX, t.scale, t.originX), ou(e.y, t.y, t.scaleY, t.scale, t.originY);
}
function Kh(e, t) {
  return Hh(T0(e.getBoundingClientRect(), t));
}
function P0(e, t, n) {
  const r = Kh(e, n), { scroll: i } = t;
  return i && (er(r.x, i.offset.x), er(r.y, i.offset.y)), r;
}
const Gh = ({ current: e }) => e ? e.ownerDocument.defaultView : null, A0 = /* @__PURE__ */ new WeakMap();
class R0 {
  constructor(t) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = Ue(), this.visualElement = t;
  }
  start(t, { snapToCursor: n = !1 } = {}) {
    const { presenceContext: r } = this.visualElement;
    if (r && r.isPresent === !1)
      return;
    const i = (u) => {
      const { dragSnapToOrigin: d } = this.getProps();
      d ? this.pauseAnimation() : this.stopAnimation(), n && this.snapToCursor(ai(u).point);
    }, o = (u, d) => {
      const { drag: h, dragPropagation: f, onDragStart: m } = this.getProps();
      if (h && !f && (this.openDragLock && this.openDragLock(), this.openDragLock = wx(h), !this.openDragLock))
        return;
      this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Ct((b) => {
        let v = this.getAxisMotionValue(b).get() || 0;
        if (jt.test(v)) {
          const { projection: x } = this.visualElement;
          if (x && x.layout) {
            const w = x.layout.layoutBox[b];
            w && (v = xt(w) * (parseFloat(v) / 100));
          }
        }
        this.originPoint[b] = v;
      }), m && Me.postRender(() => m(u, d)), zs(this.visualElement, "transform");
      const { animationState: p } = this.visualElement;
      p && p.setActive("whileDrag", !0);
    }, s = (u, d) => {
      const { dragPropagation: h, dragDirectionLock: f, onDirectionLock: m, onDrag: p } = this.getProps();
      if (!h && !this.openDragLock)
        return;
      const { offset: b } = d;
      if (f && this.currentDirection === null) {
        this.currentDirection = N0(b), this.currentDirection !== null && m && m(this.currentDirection);
        return;
      }
      this.updateAxis("x", d.point, b), this.updateAxis("y", d.point, b), this.visualElement.render(), p && p(u, d);
    }, a = (u, d) => this.stop(u, d), l = () => Ct((u) => {
      var d;
      return this.getAnimationState(u) === "paused" && ((d = this.getAxisMotionValue(u).animation) === null || d === void 0 ? void 0 : d.play());
    }), { dragSnapToOrigin: c } = this.getProps();
    this.panSession = new Bh(t, {
      onSessionStart: i,
      onStart: o,
      onMove: s,
      onSessionEnd: a,
      resumeAnimation: l
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: c,
      contextWindow: Gh(this.visualElement)
    });
  }
  stop(t, n) {
    const r = this.isDragging;
    if (this.cancel(), !r)
      return;
    const { velocity: i } = n;
    this.startAnimation(i);
    const { onDragEnd: o } = this.getProps();
    o && Me.postRender(() => o(t, n));
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
    if (!r || !bi(t, i, this.currentDirection))
      return;
    const o = this.getAxisMotionValue(t);
    let s = this.originPoint[t] + r[t];
    this.constraints && this.constraints[t] && (s = v0(s, this.constraints[t], this.elastic[t])), o.set(s);
  }
  resolveConstraints() {
    var t;
    const { dragConstraints: n, dragElastic: r } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : (t = this.visualElement.projection) === null || t === void 0 ? void 0 : t.layout, o = this.constraints;
    n && Zn(n) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : n && i ? this.constraints = b0(i.layoutBox, n) : this.constraints = !1, this.elastic = k0(r), o !== this.constraints && i && this.constraints && !this.hasMutatedConstraints && Ct((s) => {
      this.constraints !== !1 && this.getAxisMotionValue(s) && (this.constraints[s] = S0(i.layoutBox[s], this.constraints[s]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: t, onMeasureDragConstraints: n } = this.getProps();
    if (!t || !Zn(t))
      return !1;
    const r = t.current;
    gn(r !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.");
    const { projection: i } = this.visualElement;
    if (!i || !i.layout)
      return !1;
    const o = P0(r, i.root, this.visualElement.getTransformPagePoint());
    let s = x0(i.layout.layoutBox, o);
    if (n) {
      const a = n(C0(s));
      this.hasMutatedConstraints = !!a, a && (s = Hh(a));
    }
    return s;
  }
  startAnimation(t) {
    const { drag: n, dragMomentum: r, dragElastic: i, dragTransition: o, dragSnapToOrigin: s, onDragTransitionEnd: a } = this.getProps(), l = this.constraints || {}, c = Ct((u) => {
      if (!bi(u, n, this.currentDirection))
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
    return zs(this.visualElement, t), r.start(hl(t, r, 0, n, this.visualElement, !1));
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
      if (!bi(n, r, this.currentDirection))
        return;
      const { projection: i } = this.visualElement, o = this.getAxisMotionValue(n);
      if (i && i.layout) {
        const { min: s, max: a } = i.layout.layoutBox[n];
        o.set(t[n] - ze(s, a, 0.5));
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
    if (!Zn(n) || !r || !this.constraints)
      return;
    this.stopAnimation();
    const i = { x: 0, y: 0 };
    Ct((s) => {
      const a = this.getAxisMotionValue(s);
      if (a && this.constraints !== !1) {
        const l = a.get();
        i[s] = w0({ min: l, max: l }, this.constraints[s]);
      }
    });
    const { transformTemplate: o } = this.visualElement.getProps();
    this.visualElement.current.style.transform = o ? o({}, "") : "none", r.root && r.root.updateScroll(), r.updateLayout(), this.resolveConstraints(), Ct((s) => {
      if (!bi(s, t, null))
        return;
      const a = this.getAxisMotionValue(s), { min: l, max: c } = this.constraints[s];
      a.set(ze(l, c, i[s]));
    });
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    A0.set(this.visualElement, this);
    const t = this.visualElement.current, n = Br(t, "pointerdown", (l) => {
      const { drag: c, dragListener: u = !0 } = this.getProps();
      c && u && this.start(l);
    }), r = () => {
      const { dragConstraints: l } = this.getProps();
      Zn(l) && l.current && (this.constraints = this.resolveRefConstraints());
    }, { projection: i } = this.visualElement, o = i.addEventListener("measure", r);
    i && !i.layout && (i.root && i.root.updateScroll(), i.updateLayout()), Me.read(r);
    const s = Xr(window, "resize", () => this.scalePositionWithinConstraints()), a = i.addEventListener("didUpdate", ({ delta: l, hasLayoutChanged: c }) => {
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
    const t = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: r = !1, dragPropagation: i = !1, dragConstraints: o = !1, dragElastic: s = Ks, dragMomentum: a = !0 } = t;
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
function bi(e, t, n) {
  return (t === !0 || t === e) && (n === null || n === e);
}
function N0(e, t = 10) {
  let n = null;
  return Math.abs(e.y) > t ? n = "y" : Math.abs(e.x) > t && (n = "x"), n;
}
class I0 extends Sn {
  constructor(t) {
    super(t), this.removeGroupControls = ht, this.removeListeners = ht, this.controls = new R0(t);
  }
  mount() {
    const { dragControls: t } = this.node.getProps();
    t && (this.removeGroupControls = t.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || ht;
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners();
  }
}
const su = (e) => (t, n) => {
  e && Me.postRender(() => e(t, n));
};
class D0 extends Sn {
  constructor() {
    super(...arguments), this.removePointerDownListener = ht;
  }
  onPointerDown(t) {
    this.session = new Bh(t, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Gh(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: t, onPanStart: n, onPan: r, onPanEnd: i } = this.node.getProps();
    return {
      onSessionStart: su(t),
      onStart: su(n),
      onMove: r,
      onEnd: (o, s) => {
        delete this.session, i && Me.postRender(() => i(o, s));
      }
    };
  }
  mount() {
    this.removePointerDownListener = Br(this.node.current, "pointerdown", (t) => this.onPointerDown(t));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
const Oi = {
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
function au(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
const Dr = {
  correct: (e, t) => {
    if (!t.target)
      return e;
    if (typeof e == "string")
      if (ee.test(e))
        e = parseFloat(e);
      else
        return e;
    const n = au(e, t.target.x), r = au(e, t.target.y);
    return `${n}% ${r}%`;
  }
}, M0 = {
  correct: (e, { treeScale: t, projectionDelta: n }) => {
    const r = e, i = vn.parse(e);
    if (i.length > 5)
      return r;
    const o = vn.createTransformer(e), s = typeof i[0] != "number" ? 1 : 0, a = n.x.scale * t.x, l = n.y.scale * t.y;
    i[0 + s] /= a, i[1 + s] /= l;
    const c = ze(a, l, 0.5);
    return typeof i[2 + s] == "number" && (i[2 + s] /= c), typeof i[3 + s] == "number" && (i[3 + s] /= c), o(i);
  }
};
class O0 extends qy {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: r, layoutId: i } = this.props, { projection: o } = t;
    ex(L0), o && (n.group && n.group.add(o), r && r.register && i && r.register(o), o.root.didUpdate(), o.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), o.setOptions({
      ...o.options,
      onExitComplete: () => this.safeToRemove()
    })), Oi.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(t) {
    const { layoutDependency: n, visualElement: r, drag: i, isPresent: o } = this.props, s = r.projection;
    return s && (s.isPresent = o, i || t.layoutDependency !== n || n === void 0 ? s.willUpdate() : this.safeToRemove(), t.isPresent !== o && (o ? s.promote() : s.relegate() || Me.postRender(() => {
      const a = s.getStack();
      (!a || !a.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { projection: t } = this.props.visualElement;
    t && (t.root.didUpdate(), ja.postRender(() => {
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
function Yh(e) {
  const [t, n] = Df(), r = tt(Oa);
  return g(O0, { ...e, layoutGroup: r, switchLayoutGroup: tt(zf), isPresent: t, safeToRemove: n });
}
const L0 = {
  borderRadius: {
    ...Dr,
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  },
  borderTopLeftRadius: Dr,
  borderTopRightRadius: Dr,
  borderBottomLeftRadius: Dr,
  borderBottomRightRadius: Dr,
  boxShadow: M0
};
function _0(e, t, n) {
  const r = nt(e) ? e : Gr(e);
  return r.start(hl("", r, t, n)), r.animation;
}
function F0(e) {
  return e instanceof SVGElement && e.tagName !== "svg";
}
const V0 = (e, t) => e.depth - t.depth;
class z0 {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(t) {
    nl(this.children, t), this.isDirty = !0;
  }
  remove(t) {
    rl(this.children, t), this.isDirty = !0;
  }
  forEach(t) {
    this.isDirty && this.children.sort(V0), this.isDirty = !1, this.children.forEach(t);
  }
}
function B0(e, t) {
  const n = Ut.now(), r = ({ timestamp: i }) => {
    const o = i - n;
    o >= t && (yn(r), e(o - t));
  };
  return Me.read(r, !0), () => yn(r);
}
const Xh = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"], $0 = Xh.length, lu = (e) => typeof e == "string" ? parseFloat(e) : e, cu = (e) => typeof e == "number" || ee.test(e);
function j0(e, t, n, r, i, o) {
  i ? (e.opacity = ze(
    0,
    // TODO Reinstate this if only child
    n.opacity !== void 0 ? n.opacity : 1,
    U0(r)
  ), e.opacityExit = ze(t.opacity !== void 0 ? t.opacity : 1, 0, H0(r))) : o && (e.opacity = ze(t.opacity !== void 0 ? t.opacity : 1, n.opacity !== void 0 ? n.opacity : 1, r));
  for (let s = 0; s < $0; s++) {
    const a = `border${Xh[s]}Radius`;
    let l = uu(t, a), c = uu(n, a);
    if (l === void 0 && c === void 0)
      continue;
    l || (l = 0), c || (c = 0), l === 0 || c === 0 || cu(l) === cu(c) ? (e[a] = Math.max(ze(lu(l), lu(c), r), 0), (jt.test(c) || jt.test(l)) && (e[a] += "%")) : e[a] = c;
  }
  (t.rotate || n.rotate) && (e.rotate = ze(t.rotate || 0, n.rotate || 0, r));
}
function uu(e, t) {
  return e[t] !== void 0 ? e[t] : e.borderRadius;
}
const U0 = /* @__PURE__ */ Zh(0, 0.5, mh), H0 = /* @__PURE__ */ Zh(0.5, 0.95, ht);
function Zh(e, t, n) {
  return (r) => r < e ? 0 : r > t ? 1 : n(/* @__PURE__ */ sr(e, t, r));
}
function du(e, t) {
  e.min = t.min, e.max = t.max;
}
function kt(e, t) {
  du(e.x, t.x), du(e.y, t.y);
}
function fu(e, t) {
  e.translate = t.translate, e.scale = t.scale, e.originPoint = t.originPoint, e.origin = t.origin;
}
function hu(e, t, n, r, i) {
  return e -= t, e = Xi(e, 1 / n, r), i !== void 0 && (e = Xi(e, 1 / i, r)), e;
}
function W0(e, t = 0, n = 1, r = 0.5, i, o = e, s = e) {
  if (jt.test(t) && (t = parseFloat(t), t = ze(s.min, s.max, t / 100) - s.min), typeof t != "number")
    return;
  let a = ze(o.min, o.max, r);
  e === o && (a -= t), e.min = hu(e.min, t, n, a, i), e.max = hu(e.max, t, n, a, i);
}
function pu(e, t, [n, r, i], o, s) {
  W0(e, t[n], t[r], t[i], t.scale, o, s);
}
const q0 = ["x", "scaleX", "originX"], K0 = ["y", "scaleY", "originY"];
function mu(e, t, n, r) {
  pu(e.x, t, q0, n ? n.x : void 0, r ? r.x : void 0), pu(e.y, t, K0, n ? n.y : void 0, r ? r.y : void 0);
}
function gu(e) {
  return e.translate === 0 && e.scale === 1;
}
function Jh(e) {
  return gu(e.x) && gu(e.y);
}
function yu(e, t) {
  return e.min === t.min && e.max === t.max;
}
function G0(e, t) {
  return yu(e.x, t.x) && yu(e.y, t.y);
}
function vu(e, t) {
  return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max);
}
function Qh(e, t) {
  return vu(e.x, t.x) && vu(e.y, t.y);
}
function bu(e) {
  return xt(e.x) / xt(e.y);
}
function xu(e, t) {
  return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint;
}
class Y0 {
  constructor() {
    this.members = [];
  }
  add(t) {
    nl(this.members, t), t.scheduleRender();
  }
  remove(t) {
    if (rl(this.members, t), t === this.prevLead && (this.prevLead = void 0), t === this.lead) {
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
function X0(e, t, n) {
  let r = "";
  const i = e.x.translate / t.x, o = e.y.translate / t.y, s = (n == null ? void 0 : n.z) || 0;
  if ((i || o || s) && (r = `translate3d(${i}px, ${o}px, ${s}px) `), (t.x !== 1 || t.y !== 1) && (r += `scale(${1 / t.x}, ${1 / t.y}) `), n) {
    const { transformPerspective: c, rotate: u, rotateX: d, rotateY: h, skewX: f, skewY: m } = n;
    c && (r = `perspective(${c}px) ${r}`), u && (r += `rotate(${u}deg) `), d && (r += `rotateX(${d}deg) `), h && (r += `rotateY(${h}deg) `), f && (r += `skewX(${f}deg) `), m && (r += `skewY(${m}deg) `);
  }
  const a = e.x.scale * t.x, l = e.y.scale * t.y;
  return (a !== 1 || l !== 1) && (r += `scale(${a}, ${l})`), r || "none";
}
const Nn = {
  type: "projectionFrame",
  totalNodes: 0,
  resolvedTargetDeltas: 0,
  recalculatedProjection: 0
}, Fr = typeof window < "u" && window.MotionDebug !== void 0, as = ["", "X", "Y", "Z"], Z0 = { visibility: "hidden" }, wu = 1e3;
let J0 = 0;
function ls(e, t, n, r) {
  const { latestValues: i } = t;
  i[e] && (n[e] = i[e], t.setStaticValue(e, 0), r && (r[e] = 0));
}
function ep(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: t } = e.options;
  if (!t)
    return;
  const n = lh(t);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: i, layoutId: o } = e.options;
    window.MotionCancelOptimisedAnimation(n, "transform", Me, !(i || o));
  }
  const { parent: r } = e;
  r && !r.hasCheckedOptimisedAppear && ep(r);
}
function tp({ attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: r, resetTransform: i }) {
  return class {
    constructor(s = {}, a = t == null ? void 0 : t()) {
      this.id = J0++, this.animationId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, Fr && (Nn.totalNodes = Nn.resolvedTargetDeltas = Nn.recalculatedProjection = 0), this.nodes.forEach(t1), this.nodes.forEach(s1), this.nodes.forEach(a1), this.nodes.forEach(n1), Fr && window.MotionDebug.record(Nn);
      }, this.resolvedRelativeTargetAt = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = s, this.root = a ? a.root || a : this, this.path = a ? [...a.path, a] : [], this.parent = a, this.depth = a ? a.depth + 1 : 0;
      for (let l = 0; l < this.path.length; l++)
        this.path[l].shouldResetTransform = !0;
      this.root === this && (this.nodes = new z0());
    }
    addEventListener(s, a) {
      return this.eventHandlers.has(s) || this.eventHandlers.set(s, new il()), this.eventHandlers.get(s).add(a);
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
      this.isSVG = F0(s), this.instance = s;
      const { layoutId: l, layout: c, visualElement: u } = this.options;
      if (u && !u.current && u.mount(s), this.root.nodes.add(this), this.parent && this.parent.children.add(this), a && (c || l) && (this.isLayoutDirty = !0), e) {
        let d;
        const h = () => this.root.updateBlockedByResize = !1;
        e(s, () => {
          this.root.updateBlockedByResize = !0, d && d(), d = B0(h, 250), Oi.hasAnimatedSinceResize && (Oi.hasAnimatedSinceResize = !1, this.nodes.forEach(ku));
        });
      }
      l && this.root.registerSharedNode(l, this), this.options.animate !== !1 && u && (l || c) && this.addEventListener("didUpdate", ({ delta: d, hasLayoutChanged: h, hasRelativeTargetChanged: f, layout: m }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const p = this.options.transition || u.getDefaultTransition() || f1, { onLayoutAnimationStart: b, onLayoutAnimationComplete: v } = u.getProps(), x = !this.targetLayout || !Qh(this.targetLayout, m) || f, w = !h && f;
        if (this.options.layoutRoot || this.resumeFrom && this.resumeFrom.instance || w || h && (x || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0), this.setAnimationOrigin(d, w);
          const T = {
            ...Ja(p, "layout"),
            onPlay: b,
            onComplete: v
          };
          (u.shouldReduceMotion || this.options.layoutRoot) && (T.delay = 0, T.type = !1), this.startAnimation(T);
        } else
          h || ku(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = m;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const s = this.getStack();
      s && s.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, yn(this.updateProjection);
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
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(l1), this.animationId++);
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
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && ep(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
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
        this.unblockUpdate(), this.clearAllSnapshots(), this.nodes.forEach(Su);
        return;
      }
      this.isUpdating || this.nodes.forEach(i1), this.isUpdating = !1, this.nodes.forEach(o1), this.nodes.forEach(Q0), this.nodes.forEach(e1), this.clearAllSnapshots();
      const a = Ut.now();
      Ye.delta = tn(0, 1e3 / 60, a - Ye.timestamp), Ye.timestamp = a, Ye.isProcessing = !0, Jo.update.process(Ye), Jo.preRender.process(Ye), Jo.render.process(Ye), Ye.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, ja.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(r1), this.sharedNodes.forEach(c1);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, Me.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      Me.postRender(() => {
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
      this.layout = this.measure(!1), this.layoutCorrected = Ue(), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
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
      const s = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, a = this.projectionDelta && !Jh(this.projectionDelta), l = this.getTransformTemplate(), c = l ? l(this.latestValues, "") : void 0, u = c !== this.prevTransformTemplateValue;
      s && (a || Rn(this.latestValues) || u) && (i(this.instance, c), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(s = !0) {
      const a = this.measurePageBox();
      let l = this.removeElementScroll(a);
      return s && (l = this.removeTransform(l)), h1(l), {
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
        return Ue();
      const l = a.measureViewportBox();
      if (!(((s = this.scroll) === null || s === void 0 ? void 0 : s.wasRoot) || this.path.some(p1))) {
        const { scroll: u } = this.root;
        u && (er(l.x, u.offset.x), er(l.y, u.offset.y));
      }
      return l;
    }
    removeElementScroll(s) {
      var a;
      const l = Ue();
      if (kt(l, s), !((a = this.scroll) === null || a === void 0) && a.wasRoot)
        return l;
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c], { scroll: d, options: h } = u;
        u !== this.root && d && h.layoutScroll && (d.wasRoot && kt(l, s), er(l.x, d.offset.x), er(l.y, d.offset.y));
      }
      return l;
    }
    applyTransform(s, a = !1) {
      const l = Ue();
      kt(l, s);
      for (let c = 0; c < this.path.length; c++) {
        const u = this.path[c];
        !a && u.options.layoutScroll && u.scroll && u !== u.root && tr(l, {
          x: -u.scroll.offset.x,
          y: -u.scroll.offset.y
        }), Rn(u.latestValues) && tr(l, u.latestValues);
      }
      return Rn(this.latestValues) && tr(l, this.latestValues), l;
    }
    removeTransform(s) {
      const a = Ue();
      kt(a, s);
      for (let l = 0; l < this.path.length; l++) {
        const c = this.path[l];
        if (!c.instance || !Rn(c.latestValues))
          continue;
        Gs(c.latestValues) && c.updateSnapshot();
        const u = Ue(), d = c.measurePageBox();
        kt(u, d), mu(a, c.latestValues, c.snapshot ? c.snapshot.layoutBox : void 0, u);
      }
      return Rn(this.latestValues) && mu(a, this.latestValues), a;
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
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== Ye.timestamp && this.relativeParent.resolveTargetDelta(!0);
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
        if (this.resolvedRelativeTargetAt = Ye.timestamp, !this.targetDelta && !this.relativeTarget) {
          const f = this.getClosestProjectingParent();
          f && f.layout && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Ue(), this.relativeTargetOrigin = Ue(), jr(this.relativeTargetOrigin, this.layout.layoutBox, f.layout.layoutBox), kt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
        }
        if (!(!this.relativeTarget && !this.targetDelta)) {
          if (this.target || (this.target = Ue(), this.targetWithTransforms = Ue()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), y0(this.target, this.relativeTarget, this.relativeParent.target)) : this.targetDelta ? (this.resumingFrom ? this.target = this.applyTransform(this.layout.layoutBox) : kt(this.target, this.layout.layoutBox), qh(this.target, this.targetDelta)) : kt(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget) {
            this.attemptToResolveRelativeTarget = !1;
            const f = this.getClosestProjectingParent();
            f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? (this.relativeParent = f, this.forceRelativeParentToResolveTarget(), this.relativeTarget = Ue(), this.relativeTargetOrigin = Ue(), jr(this.relativeTargetOrigin, this.target, f.target), kt(this.relativeTarget, this.relativeTargetOrigin)) : this.relativeParent = this.relativeTarget = void 0;
          }
          Fr && Nn.resolvedTargetDeltas++;
        }
      }
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Gs(this.parent.latestValues) || Wh(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    calcProjection() {
      var s;
      const a = this.getLead(), l = !!this.resumingFrom || this !== a;
      let c = !0;
      if ((this.isProjectionDirty || !((s = this.parent) === null || s === void 0) && s.isProjectionDirty) && (c = !1), l && (this.isSharedProjectionDirty || this.isTransformDirty) && (c = !1), this.resolvedRelativeTargetAt === Ye.timestamp && (c = !1), c)
        return;
      const { layout: u, layoutId: d } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(u || d))
        return;
      kt(this.layoutCorrected, this.layout.layoutBox);
      const h = this.treeScale.x, f = this.treeScale.y;
      E0(this.layoutCorrected, this.treeScale, this.path, l), a.layout && !a.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (a.target = a.layout.layoutBox, a.targetWithTransforms = Ue());
      const { target: m } = a;
      if (!m) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (fu(this.prevProjectionDelta.x, this.projectionDelta.x), fu(this.prevProjectionDelta.y, this.projectionDelta.y)), $r(this.projectionDelta, this.layoutCorrected, m, this.latestValues), (this.treeScale.x !== h || this.treeScale.y !== f || !xu(this.projectionDelta.x, this.prevProjectionDelta.x) || !xu(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", m)), Fr && Nn.recalculatedProjection++;
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
      this.prevProjectionDelta = Qn(), this.projectionDelta = Qn(), this.projectionDeltaWithTransform = Qn();
    }
    setAnimationOrigin(s, a = !1) {
      const l = this.snapshot, c = l ? l.latestValues : {}, u = { ...this.latestValues }, d = Qn();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !a;
      const h = Ue(), f = l ? l.source : void 0, m = this.layout ? this.layout.source : void 0, p = f !== m, b = this.getStack(), v = !b || b.members.length <= 1, x = !!(p && !v && this.options.crossfade === !0 && !this.path.some(d1));
      this.animationProgress = 0;
      let w;
      this.mixTargetDelta = (T) => {
        const E = T / 1e3;
        Cu(d.x, s.x, E), Cu(d.y, s.y, E), this.setTargetDelta(d), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (jr(h, this.layout.layoutBox, this.relativeParent.layout.layoutBox), u1(this.relativeTarget, this.relativeTargetOrigin, h, E), w && G0(this.relativeTarget, w) && (this.isProjectionDirty = !1), w || (w = Ue()), kt(w, this.relativeTarget)), p && (this.animationValues = u, j0(u, c, this.latestValues, E, x, v)), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = E;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(s) {
      this.notifyListeners("animationStart"), this.currentAnimation && this.currentAnimation.stop(), this.resumingFrom && this.resumingFrom.currentAnimation && this.resumingFrom.currentAnimation.stop(), this.pendingAnimation && (yn(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = Me.update(() => {
        Oi.hasAnimatedSinceResize = !0, this.currentAnimation = _0(0, wu, {
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
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(wu), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const s = this.getLead();
      let { targetWithTransforms: a, target: l, layout: c, latestValues: u } = s;
      if (!(!a || !l || !c)) {
        if (this !== s && this.layout && c && np(this.options.animationType, this.layout.layoutBox, c.layoutBox)) {
          l = this.target || Ue();
          const d = xt(this.layout.layoutBox.x);
          l.x.min = s.target.x.min, l.x.max = l.x.min + d;
          const h = xt(this.layout.layoutBox.y);
          l.y.min = s.target.y.min, l.y.max = l.y.min + h;
        }
        kt(a, l), tr(a, u), $r(this.projectionDeltaWithTransform, this.layoutCorrected, a, u);
      }
    }
    registerSharedNode(s, a) {
      this.sharedNodes.has(s) || this.sharedNodes.set(s, new Y0()), this.sharedNodes.get(s).add(a);
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
      l.z && ls("z", s, c, this.animationValues);
      for (let u = 0; u < as.length; u++)
        ls(`rotate${as[u]}`, s, c, this.animationValues), ls(`skew${as[u]}`, s, c, this.animationValues);
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
        return Z0;
      const c = {
        visibility: ""
      }, u = this.getTransformTemplate();
      if (this.needsReset)
        return this.needsReset = !1, c.opacity = "", c.pointerEvents = Di(s == null ? void 0 : s.pointerEvents) || "", c.transform = u ? u(this.latestValues, "") : "none", c;
      const d = this.getLead();
      if (!this.projectionDelta || !this.layout || !d.target) {
        const p = {};
        return this.options.layoutId && (p.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, p.pointerEvents = Di(s == null ? void 0 : s.pointerEvents) || ""), this.hasProjected && !Rn(this.latestValues) && (p.transform = u ? u({}, "") : "none", this.hasProjected = !1), p;
      }
      const h = d.animationValues || d.latestValues;
      this.applyTransformsToTarget(), c.transform = X0(this.projectionDeltaWithTransform, this.treeScale, h), u && (c.transform = u(h, c.transform));
      const { x: f, y: m } = this.projectionDelta;
      c.transformOrigin = `${f.origin * 100}% ${m.origin * 100}% 0`, d.animationValues ? c.opacity = d === this ? (l = (a = h.opacity) !== null && a !== void 0 ? a : this.latestValues.opacity) !== null && l !== void 0 ? l : 1 : this.preserveOpacity ? this.latestValues.opacity : h.opacityExit : c.opacity = d === this ? h.opacity !== void 0 ? h.opacity : "" : h.opacityExit !== void 0 ? h.opacityExit : 0;
      for (const p in Wi) {
        if (h[p] === void 0)
          continue;
        const { correct: b, applyTo: v } = Wi[p], x = c.transform === "none" ? h[p] : b(h[p], d);
        if (v) {
          const w = v.length;
          for (let T = 0; T < w; T++)
            c[v[T]] = x;
        } else
          c[p] = x;
      }
      return this.options.layoutId && (c.pointerEvents = d === this ? Di(s == null ? void 0 : s.pointerEvents) || "" : "none"), c;
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((s) => {
        var a;
        return (a = s.currentAnimation) === null || a === void 0 ? void 0 : a.stop();
      }), this.root.nodes.forEach(Su), this.root.sharedNodes.clear();
    }
  };
}
function Q0(e) {
  e.updateLayout();
}
function e1(e) {
  var t;
  const n = ((t = e.resumeFrom) === null || t === void 0 ? void 0 : t.snapshot) || e.snapshot;
  if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
    const { layoutBox: r, measuredBox: i } = e.layout, { animationType: o } = e.options, s = n.source !== e.layout.source;
    o === "size" ? Ct((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = xt(h);
      h.min = r[d].min, h.max = h.min + f;
    }) : np(o, n.layoutBox, r) && Ct((d) => {
      const h = s ? n.measuredBox[d] : n.layoutBox[d], f = xt(r[d]);
      h.max = h.min + f, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[d].max = e.relativeTarget[d].min + f);
    });
    const a = Qn();
    $r(a, r, n.layoutBox);
    const l = Qn();
    s ? $r(l, e.applyTransform(i, !0), n.measuredBox) : $r(l, r, n.layoutBox);
    const c = !Jh(a);
    let u = !1;
    if (!e.resumeFrom) {
      const d = e.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: h, layout: f } = d;
        if (h && f) {
          const m = Ue();
          jr(m, n.layoutBox, h.layoutBox);
          const p = Ue();
          jr(p, r, f.layoutBox), Qh(m, p) || (u = !0), d.options.layoutRoot && (e.relativeTarget = p, e.relativeTargetOrigin = m, e.relativeParent = d);
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
function t1(e) {
  Fr && Nn.totalNodes++, e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function n1(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function r1(e) {
  e.clearSnapshot();
}
function Su(e) {
  e.clearMeasurements();
}
function i1(e) {
  e.isLayoutDirty = !1;
}
function o1(e) {
  const { visualElement: t } = e.options;
  t && t.getProps().onBeforeLayoutMeasure && t.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function ku(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function s1(e) {
  e.resolveTargetDelta();
}
function a1(e) {
  e.calcProjection();
}
function l1(e) {
  e.resetSkewAndRotation();
}
function c1(e) {
  e.removeLeadSnapshot();
}
function Cu(e, t, n) {
  e.translate = ze(t.translate, 0, n), e.scale = ze(t.scale, 1, n), e.origin = t.origin, e.originPoint = t.originPoint;
}
function Tu(e, t, n, r) {
  e.min = ze(t.min, n.min, r), e.max = ze(t.max, n.max, r);
}
function u1(e, t, n, r) {
  Tu(e.x, t.x, n.x, r), Tu(e.y, t.y, n.y, r);
}
function d1(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const f1 = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, Eu = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), Pu = Eu("applewebkit/") && !Eu("chrome/") ? Math.round : ht;
function Au(e) {
  e.min = Pu(e.min), e.max = Pu(e.max);
}
function h1(e) {
  Au(e.x), Au(e.y);
}
function np(e, t, n) {
  return e === "position" || e === "preserve-aspect" && !g0(bu(t), bu(n), 0.2);
}
function p1(e) {
  var t;
  return e !== e.root && ((t = e.scroll) === null || t === void 0 ? void 0 : t.wasRoot);
}
const m1 = tp({
  attachResizeListener: (e, t) => Xr(e, "resize", t),
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body.scrollLeft,
    y: document.documentElement.scrollTop || document.body.scrollTop
  }),
  checkIsScrollRoot: () => !0
}), cs = {
  current: void 0
}, rp = tp({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!cs.current) {
      const e = new m1({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), cs.current = e;
    }
    return cs.current;
  },
  resetTransform: (e, t) => {
    e.style.transform = t !== void 0 ? t : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), g1 = {
  pan: {
    Feature: D0
  },
  drag: {
    Feature: I0,
    ProjectionNode: rp,
    MeasureLayout: Yh
  }
};
function Ru(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileHover && e.animationState.setActive("whileHover", n === "Start");
  const i = "onHover" + n, o = r[i];
  o && Me.postRender(() => o(t, ai(t)));
}
class y1 extends Sn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = gx(t, (n) => (Ru(this.node, n, "Start"), (r) => Ru(this.node, r, "End"))));
  }
  unmount() {
  }
}
class v1 extends Sn {
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
    this.unmount = si(Xr(this.node.current, "focus", () => this.onFocus()), Xr(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function Nu(e, t, n) {
  const { props: r } = e;
  e.animationState && r.whileTap && e.animationState.setActive("whileTap", n === "Start");
  const i = "onTap" + (n === "End" ? "" : n), o = r[i];
  o && Me.postRender(() => o(t, ai(t)));
}
class b1 extends Sn {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = xx(t, (n) => (Nu(this.node, n, "Start"), (r, { success: i }) => Nu(this.node, r, i ? "End" : "Cancel")), { useGlobalTarget: this.node.props.globalTapTarget }));
  }
  unmount() {
  }
}
const Xs = /* @__PURE__ */ new WeakMap(), us = /* @__PURE__ */ new WeakMap(), x1 = (e) => {
  const t = Xs.get(e.target);
  t && t(e);
}, w1 = (e) => {
  e.forEach(x1);
};
function S1({ root: e, ...t }) {
  const n = e || document;
  us.has(n) || us.set(n, {});
  const r = us.get(n), i = JSON.stringify(t);
  return r[i] || (r[i] = new IntersectionObserver(w1, { root: e, ...t })), r[i];
}
function k1(e, t, n) {
  const r = S1(t);
  return Xs.set(e, n), r.observe(e), () => {
    Xs.delete(e), r.unobserve(e);
  };
}
const C1 = {
  some: 0,
  all: 1
};
class T1 extends Sn {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    this.unmount();
    const { viewport: t = {} } = this.node.getProps(), { root: n, margin: r, amount: i = "some", once: o } = t, s = {
      root: n ? n.current : void 0,
      rootMargin: r,
      threshold: typeof i == "number" ? i : C1[i]
    }, a = (l) => {
      const { isIntersecting: c } = l;
      if (this.isInView === c || (this.isInView = c, o && !c && this.hasEnteredView))
        return;
      c && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", c);
      const { onViewportEnter: u, onViewportLeave: d } = this.node.getProps(), h = c ? u : d;
      h && h(l);
    };
    return k1(this.node.current, s, a);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: t, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(E1(t, n)) && this.startObserver();
  }
  unmount() {
  }
}
function E1({ viewport: e = {} }, { viewport: t = {} } = {}) {
  return (n) => e[n] !== t[n];
}
const P1 = {
  inView: {
    Feature: T1
  },
  tap: {
    Feature: b1
  },
  focus: {
    Feature: v1
  },
  hover: {
    Feature: y1
  }
}, A1 = {
  layout: {
    ProjectionNode: rp,
    MeasureLayout: Yh
  }
}, Zs = { current: null }, ip = { current: !1 };
function R1() {
  if (ip.current = !0, !!Fa)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => Zs.current = e.matches;
      e.addListener(t), t();
    } else
      Zs.current = !1;
}
const N1 = [...Rh, et, vn], I1 = (e) => N1.find(Ah(e)), Iu = /* @__PURE__ */ new WeakMap();
function D1(e, t, n) {
  for (const r in t) {
    const i = t[r], o = n[r];
    if (nt(i))
      e.addValue(r, i), process.env.NODE_ENV === "development" && wo(i.version === "11.18.2", `Attempting to mix Motion versions ${i.version} with 11.18.2 may not work as expected.`);
    else if (nt(o))
      e.addValue(r, Gr(i, { owner: e }));
    else if (o !== i)
      if (e.hasValue(r)) {
        const s = e.getValue(r);
        s.liveStyle === !0 ? s.jump(i) : s.hasAnimated || s.set(i);
      } else {
        const s = e.getStaticValue(r);
        e.addValue(r, Gr(s !== void 0 ? s : i, { owner: e }));
      }
  }
  for (const r in n)
    t[r] === void 0 && e.removeValue(r);
  return t;
}
const Du = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
class M1 {
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
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = ul, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const f = Ut.now();
      this.renderScheduledAt < f && (this.renderScheduledAt = f, Me.render(this.render, !1, !0));
    };
    const { latestValues: l, renderState: c, onUpdate: u } = s;
    this.onUpdate = u, this.latestValues = l, this.baseTarget = { ...l }, this.initialValues = n.initial ? { ...l } : {}, this.renderState = c, this.parent = t, this.props = n, this.presenceContext = r, this.depth = t ? t.depth + 1 : 0, this.reducedMotionConfig = i, this.options = a, this.blockInitialAnimation = !!o, this.isControllingVariants = Co(n), this.isVariantNode = Ff(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(t && t.current);
    const { willChange: d, ...h } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const f in h) {
      const m = h[f];
      l[f] !== void 0 && nt(m) && m.set(l[f], !1);
    }
  }
  mount(t) {
    this.current = t, Iu.set(t, this), this.projection && !this.projection.instance && this.projection.mount(t), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((n, r) => this.bindToMotionValue(r, n)), ip.current || R1(), this.shouldReduceMotion = this.reducedMotionConfig === "never" ? !1 : this.reducedMotionConfig === "always" ? !0 : Zs.current, process.env.NODE_ENV !== "production" && wo(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected."), this.parent && this.parent.children.add(this), this.update(this.props, this.presenceContext);
  }
  unmount() {
    Iu.delete(this.current), this.projection && this.projection.unmount(), yn(this.notifyUpdate), yn(this.render), this.valueSubscriptions.forEach((t) => t()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent && this.parent.children.delete(this);
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
    const r = Un.has(t), i = n.on("change", (a) => {
      this.latestValues[t] = a, this.props.onUpdate && Me.preRender(this.notifyUpdate), r && this.projection && (this.projection.isTransformDirty = !0);
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
    for (t in ar) {
      const n = ar[t];
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
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Ue();
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
    for (let r = 0; r < Du.length; r++) {
      const i = Du[r];
      this.propEventSubscriptions[i] && (this.propEventSubscriptions[i](), delete this.propEventSubscriptions[i]);
      const o = "on" + i, s = t[o];
      s && (this.propEventSubscriptions[i] = this.on(i, s));
    }
    this.prevMotionValues = D1(this, this.scrapeMotionValuesFromProps(t, this.prevProps, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue(), this.onUpdate && this.onUpdate(this);
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
    return r === void 0 && n !== void 0 && (r = Gr(n === null ? void 0 : n, { owner: this }), this.addValue(t, r)), r;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(t, n) {
    var r;
    let i = this.latestValues[t] !== void 0 || !this.current ? this.latestValues[t] : (r = this.getBaseTargetFromProps(this.props, t)) !== null && r !== void 0 ? r : this.readValueFromInstance(this.current, t, this.options);
    return i != null && (typeof i == "string" && (Eh(i) || yh(i)) ? i = parseFloat(i) : !I1(i) && vn.test(n) && (i = kh(t, n)), this.setBaseTarget(t, nt(i) ? i.get() : i)), nt(i) ? i.get() : i;
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
      const s = Ha(this.props, r, (n = this.presenceContext) === null || n === void 0 ? void 0 : n.custom);
      s && (i = s[t]);
    }
    if (r && i !== void 0)
      return i;
    const o = this.getBaseTargetFromProps(this.props, t);
    return o !== void 0 && !nt(o) ? o : this.initialValues[t] !== void 0 && i === void 0 ? void 0 : this.baseTarget[t];
  }
  on(t, n) {
    return this.events[t] || (this.events[t] = new il()), this.events[t].add(n);
  }
  notify(t, ...n) {
    this.events[t] && this.events[t].notify(...n);
  }
}
class op extends M1 {
  constructor() {
    super(...arguments), this.KeyframeResolver = Nh;
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
function O1(e) {
  return window.getComputedStyle(e);
}
class L1 extends op {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = qf;
  }
  readValueFromInstance(t, n) {
    if (Un.has(n)) {
      const r = cl(n);
      return r && r.default || 0;
    } else {
      const r = O1(t), i = (Uf(n) ? r.getPropertyValue(n) : r[n]) || 0;
      return typeof i == "string" ? i.trim() : i;
    }
  }
  measureInstanceViewportBox(t, { transformPagePoint: n }) {
    return Kh(t, n);
  }
  build(t, n, r) {
    Ka(t, n, r.transformTemplate);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return Za(t, n, r);
  }
}
class _1 extends op {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Ue;
  }
  getBaseTargetFromProps(t, n) {
    return t[n];
  }
  readValueFromInstance(t, n) {
    if (Un.has(n)) {
      const r = cl(n);
      return r && r.default || 0;
    }
    return n = Kf.has(n) ? n : $a(n), t.getAttribute(n);
  }
  scrapeMotionValuesFromProps(t, n, r) {
    return Xf(t, n, r);
  }
  build(t, n, r) {
    Ga(t, n, this.isSVGTag, r.transformTemplate);
  }
  renderInstance(t, n, r, i) {
    Gf(t, n, r, i);
  }
  mount(t) {
    this.isSVGTag = Xa(t.tagName), super.mount(t);
  }
}
const F1 = (e, t) => Ua(e) ? new _1(t) : new L1(t, {
  allowProjection: e !== pf
}), V1 = /* @__PURE__ */ cx({
  ...a0,
  ...P1,
  ...g1,
  ...A1
}, F1), nn = /* @__PURE__ */ Cb(V1);
function le(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(i) {
    if (e == null || e(i), n === !1 || !i.defaultPrevented)
      return t == null ? void 0 : t(i);
  };
}
function z1(e, t) {
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
function sn(e, t = []) {
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
  return i.scopeName = e, [r, B1(i, ...t)];
}
function B1(...e) {
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
var Xe = globalThis != null && globalThis.document ? y.useLayoutEffect : () => {
}, $1 = y[" useInsertionEffect ".trim().toString()] || Xe;
function bn({
  prop: e,
  defaultProp: t,
  onChange: n = () => {
  },
  caller: r
}) {
  const [i, o, s] = j1({
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
        const h = U1(u) ? u(e) : u;
        h !== e && ((d = s.current) == null || d.call(s, h));
      } else
        o(u);
    },
    [a, e, o, s]
  );
  return [l, c];
}
function j1({
  defaultProp: e,
  onChange: t
}) {
  const [n, r] = y.useState(e), i = y.useRef(n), o = y.useRef(t);
  return $1(() => {
    o.current = t;
  }, [t]), y.useEffect(() => {
    var s;
    i.current !== n && ((s = o.current) == null || s.call(o, n), i.current = n);
  }, [n, i]), [n, r, o];
}
function U1(e) {
  return typeof e == "function";
}
// @__NO_SIDE_EFFECTS__
function H1(e) {
  const t = /* @__PURE__ */ W1(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(K1);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function W1(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = Y1(i), a = G1(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? jn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var q1 = Symbol("radix.slottable");
function K1(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === q1;
}
function G1(e, t) {
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
function Y1(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var X1 = [
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
], he = X1.reduce((e, t) => {
  const n = /* @__PURE__ */ H1(`Primitive.${t}`), r = y.forwardRef((i, o) => {
    const { asChild: s, ...a } = i, l = s ? n : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ g(l, { ...a, ref: o });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {});
function Z1(e, t) {
  e && yo.flushSync(() => e.dispatchEvent(t));
}
function J1(e, t) {
  return y.useReducer((n, r) => t[n][r] ?? n, e);
}
var an = (e) => {
  const { present: t, children: n } = e, r = Q1(t), i = typeof n == "function" ? n({ present: r.isPresent }) : y.Children.only(n), o = we(r.ref, eS(i));
  return typeof n == "function" || r.isPresent ? y.cloneElement(i, { ref: o }) : null;
};
an.displayName = "Presence";
function Q1(e) {
  const [t, n] = y.useState(), r = y.useRef(null), i = y.useRef(e), o = y.useRef("none"), s = e ? "mounted" : "unmounted", [a, l] = J1(s, {
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
    const c = xi(r.current);
    o.current = a === "mounted" ? c : "none";
  }, [a]), Xe(() => {
    const c = r.current, u = i.current;
    if (u !== e) {
      const h = o.current, f = xi(c);
      e ? l("MOUNT") : f === "none" || (c == null ? void 0 : c.display) === "none" ? l("UNMOUNT") : l(u && h !== f ? "ANIMATION_OUT" : "UNMOUNT"), i.current = e;
    }
  }, [e, l]), Xe(() => {
    if (t) {
      let c;
      const u = t.ownerDocument.defaultView ?? window, d = (f) => {
        const p = xi(r.current).includes(CSS.escape(f.animationName));
        if (f.target === t && p && (l("ANIMATION_END"), !i.current)) {
          const b = t.style.animationFillMode;
          t.style.animationFillMode = "forwards", c = u.setTimeout(() => {
            t.style.animationFillMode === "forwards" && (t.style.animationFillMode = b);
          });
        }
      }, h = (f) => {
        f.target === t && (o.current = xi(r.current));
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
function xi(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
function eS(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var tS = y[" useId ".trim().toString()] || (() => {
}), nS = 0;
function en(e) {
  const [t, n] = y.useState(tS());
  return Xe(() => {
    n((r) => r ?? String(nS++));
  }, [e]), e || (t ? `radix-${t}` : "");
}
var Po = "Collapsible", [rS] = sn(Po), [iS, pl] = rS(Po), sp = y.forwardRef(
  (e, t) => {
    const {
      __scopeCollapsible: n,
      open: r,
      defaultOpen: i,
      disabled: o,
      onOpenChange: s,
      ...a
    } = e, [l, c] = bn({
      prop: r,
      defaultProp: i ?? !1,
      onChange: s,
      caller: Po
    });
    return /* @__PURE__ */ g(
      iS,
      {
        scope: n,
        disabled: o,
        contentId: en(),
        open: l,
        onOpenToggle: y.useCallback(() => c((u) => !u), [c]),
        children: /* @__PURE__ */ g(
          he.div,
          {
            "data-state": gl(l),
            "data-disabled": o ? "" : void 0,
            ...a,
            ref: t
          }
        )
      }
    );
  }
);
sp.displayName = Po;
var ap = "CollapsibleTrigger", lp = y.forwardRef(
  (e, t) => {
    const { __scopeCollapsible: n, ...r } = e, i = pl(ap, n);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        "aria-controls": i.contentId,
        "aria-expanded": i.open || !1,
        "data-state": gl(i.open),
        "data-disabled": i.disabled ? "" : void 0,
        disabled: i.disabled,
        ...r,
        ref: t,
        onClick: le(e.onClick, i.onOpenToggle)
      }
    );
  }
);
lp.displayName = ap;
var ml = "CollapsibleContent", cp = y.forwardRef(
  (e, t) => {
    const { forceMount: n, ...r } = e, i = pl(ml, e.__scopeCollapsible);
    return /* @__PURE__ */ g(an, { present: n || i.open, children: ({ present: o }) => /* @__PURE__ */ g(oS, { ...r, ref: t, present: o }) });
  }
);
cp.displayName = ml;
var oS = y.forwardRef((e, t) => {
  const { __scopeCollapsible: n, present: r, children: i, ...o } = e, s = pl(ml, n), [a, l] = y.useState(r), c = y.useRef(null), u = we(t, c), d = y.useRef(0), h = d.current, f = y.useRef(0), m = f.current, p = s.open || a, b = y.useRef(p), v = y.useRef(void 0);
  return y.useEffect(() => {
    const x = requestAnimationFrame(() => b.current = !1);
    return () => cancelAnimationFrame(x);
  }, []), Xe(() => {
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
      "data-state": gl(s.open),
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
function gl(e) {
  return e ? "open" : "closed";
}
var sS = sp;
function aS({
  ...e
}) {
  return /* @__PURE__ */ g(sS, { "data-slot": "collapsible", ...e });
}
function lS({
  ...e
}) {
  return /* @__PURE__ */ g(
    lp,
    {
      "data-slot": "collapsible-trigger",
      ...e
    }
  );
}
function cS({
  ...e
}) {
  return /* @__PURE__ */ g(
    cp,
    {
      "data-slot": "collapsible-content",
      ...e
    }
  );
}
const yl = U.forwardRef(
  (e, t) => {
    const n = e.clickable !== !1;
    return e.file.type.startsWith("image/") ? /* @__PURE__ */ g(
      up,
      {
        ...e,
        ref: t,
        clickable: n
      }
    ) : e.file.type.startsWith("text/") || e.file.name.endsWith(".txt") || e.file.name.endsWith(".md") ? /* @__PURE__ */ g(
      dp,
      {
        ...e,
        ref: t,
        clickable: n
      }
    ) : /* @__PURE__ */ g(
      fp,
      {
        ...e,
        ref: t,
        clickable: n
      }
    );
  }
);
yl.displayName = "FilePreview";
const up = U.forwardRef(
  ({ file: e, onRemove: t, clickable: n = !0 }, r) => {
    const i = (o) => {
      if (!o.target.closest('button[aria-label="Remove attachment"]') && n) {
        console.log("Downloading file:", e.name);
        const s = URL.createObjectURL(e), a = document.createElement("a");
        a.href = s, a.download = e.name, document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(s);
      }
    };
    return /* @__PURE__ */ O(
      nn.div,
      {
        ref: r,
        className: Y(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          n && "cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all active:scale-[0.98]"
        ),
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        onClick: i,
        role: n ? "button" : void 0,
        tabIndex: n ? 0 : void 0,
        onKeyDown: n ? (o) => {
          (o.key === "Enter" || o.key === " ") && (o.preventDefault(), i(o));
        } : void 0,
        "aria-label": n ? `Download ${e.name}` : void 0,
        children: [
          /* @__PURE__ */ O("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ g(
              "img",
              {
                alt: `Attachment ${e.name}`,
                className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover pointer-events-none",
                src: URL.createObjectURL(e)
              }
            ),
            /* @__PURE__ */ g("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ g(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10",
              type: "button",
              onClick: (o) => {
                o.stopPropagation(), t();
              },
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ g(mr, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
up.displayName = "ImageFilePreview";
const dp = U.forwardRef(
  ({ file: e, onRemove: t, clickable: n = !0 }, r) => {
    const [i, o] = U.useState("");
    $e(() => {
      const a = new FileReader();
      a.onload = (l) => {
        var u;
        const c = (u = l.target) == null ? void 0 : u.result;
        o(c.slice(0, 50) + (c.length > 50 ? "..." : ""));
      }, a.readAsText(e);
    }, [e]);
    const s = (a) => {
      if (!a.target.closest('button[aria-label="Remove attachment"]') && n) {
        console.log("Downloading file:", e.name);
        const l = URL.createObjectURL(e), c = document.createElement("a");
        c.href = l, c.download = e.name, document.body.appendChild(c), c.click(), document.body.removeChild(c), URL.revokeObjectURL(l);
      }
    };
    return /* @__PURE__ */ O(
      nn.div,
      {
        ref: r,
        className: Y(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          n && "cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all active:scale-[0.98]"
        ),
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        onClick: s,
        role: n ? "button" : void 0,
        tabIndex: n ? 0 : void 0,
        onKeyDown: n ? (a) => {
          (a.key === "Enter" || a.key === " ") && (a.preventDefault(), s(a));
        } : void 0,
        "aria-label": n ? `Download ${e.name}` : void 0,
        children: [
          /* @__PURE__ */ O("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ g("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5 pointer-events-none", children: /* @__PURE__ */ g("div", { className: "h-full w-full overflow-hidden text-[6px] leading-none text-muted-foreground", children: i || "Loading..." }) }),
            /* @__PURE__ */ g("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ g(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10",
              type: "button",
              onClick: (a) => {
                a.stopPropagation(), t();
              },
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ g(mr, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
dp.displayName = "TextFilePreview";
const fp = U.forwardRef(
  ({ file: e, onRemove: t, clickable: n = !0 }, r) => {
    const i = (o) => {
      if (!o.target.closest('button[aria-label="Remove attachment"]') && n) {
        console.log("Downloading file:", e.name);
        const s = URL.createObjectURL(e), a = document.createElement("a");
        a.href = s, a.download = e.name, document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(s);
      }
    };
    return /* @__PURE__ */ O(
      nn.div,
      {
        ref: r,
        className: Y(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          n && "cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all active:scale-[0.98]"
        ),
        layout: !0,
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        onClick: i,
        role: n ? "button" : void 0,
        tabIndex: n ? 0 : void 0,
        onKeyDown: n ? (o) => {
          (o.key === "Enter" || o.key === " ") && (o.preventDefault(), i(o));
        } : void 0,
        "aria-label": n ? `Download ${e.name}` : void 0,
        children: [
          /* @__PURE__ */ O("div", { className: "flex w-full items-center space-x-2", children: [
            /* @__PURE__ */ g("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted pointer-events-none", children: /* @__PURE__ */ g(cv, { className: "h-6 w-6 text-foreground" }) }),
            /* @__PURE__ */ g("span", { className: "w-full truncate text-muted-foreground", children: e.name })
          ] }),
          t ? /* @__PURE__ */ g(
            "button",
            {
              className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10",
              type: "button",
              onClick: (o) => {
                o.stopPropagation(), t();
              },
              "aria-label": "Remove attachment",
              children: /* @__PURE__ */ g(mr, { className: "h-2.5 w-2.5" })
            }
          ) : null
        ]
      }
    );
  }
);
fp.displayName = "GenericFilePreview";
function uS(e, t) {
  const n = t || {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const dS = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, fS = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, hS = {};
function Mu(e, t) {
  return (hS.jsx ? fS : dS).test(e);
}
const pS = /[ \t\n\f\r]/g;
function mS(e) {
  return typeof e == "object" ? e.type === "text" ? Ou(e.value) : !1 : Ou(e);
}
function Ou(e) {
  return e.replace(pS, "") === "";
}
class li {
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
li.prototype.normal = {};
li.prototype.property = {};
li.prototype.space = void 0;
function hp(e, t) {
  const n = {}, r = {};
  for (const i of e)
    Object.assign(n, i.property), Object.assign(r, i.normal);
  return new li(n, r, t);
}
function Js(e) {
  return e.toLowerCase();
}
class pt {
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
pt.prototype.attribute = "";
pt.prototype.booleanish = !1;
pt.prototype.boolean = !1;
pt.prototype.commaOrSpaceSeparated = !1;
pt.prototype.commaSeparated = !1;
pt.prototype.defined = !1;
pt.prototype.mustUseProperty = !1;
pt.prototype.number = !1;
pt.prototype.overloadedBoolean = !1;
pt.prototype.property = "";
pt.prototype.spaceSeparated = !1;
pt.prototype.space = void 0;
let gS = 0;
const ue = Hn(), We = Hn(), Qs = Hn(), $ = Hn(), Ne = Hn(), rr = Hn(), gt = Hn();
function Hn() {
  return 2 ** ++gS;
}
const ea = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: ue,
  booleanish: We,
  commaOrSpaceSeparated: gt,
  commaSeparated: rr,
  number: $,
  overloadedBoolean: Qs,
  spaceSeparated: Ne
}, Symbol.toStringTag, { value: "Module" })), ds = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(ea)
);
class vl extends pt {
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
    if (super(t, n), Lu(this, "space", i), typeof r == "number")
      for (; ++o < ds.length; ) {
        const s = ds[o];
        Lu(this, ds[o], (r & ea[s]) === ea[s]);
      }
  }
}
vl.prototype.defined = !0;
function Lu(e, t, n) {
  n && (e[t] = n);
}
function xr(e) {
  const t = {}, n = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const o = new vl(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (o.mustUseProperty = !0), t[r] = o, n[Js(r)] = r, n[Js(o.attribute)] = r;
  }
  return new li(t, n, e.space);
}
const pp = xr({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: We,
    ariaAutoComplete: null,
    ariaBusy: We,
    ariaChecked: We,
    ariaColCount: $,
    ariaColIndex: $,
    ariaColSpan: $,
    ariaControls: Ne,
    ariaCurrent: null,
    ariaDescribedBy: Ne,
    ariaDetails: null,
    ariaDisabled: We,
    ariaDropEffect: Ne,
    ariaErrorMessage: null,
    ariaExpanded: We,
    ariaFlowTo: Ne,
    ariaGrabbed: We,
    ariaHasPopup: null,
    ariaHidden: We,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: Ne,
    ariaLevel: $,
    ariaLive: null,
    ariaModal: We,
    ariaMultiLine: We,
    ariaMultiSelectable: We,
    ariaOrientation: null,
    ariaOwns: Ne,
    ariaPlaceholder: null,
    ariaPosInSet: $,
    ariaPressed: We,
    ariaReadOnly: We,
    ariaRelevant: null,
    ariaRequired: We,
    ariaRoleDescription: Ne,
    ariaRowCount: $,
    ariaRowIndex: $,
    ariaRowSpan: $,
    ariaSelected: We,
    ariaSetSize: $,
    ariaSort: null,
    ariaValueMax: $,
    ariaValueMin: $,
    ariaValueNow: $,
    ariaValueText: null,
    role: null
  },
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  }
});
function mp(e, t) {
  return t in e ? e[t] : t;
}
function gp(e, t) {
  return mp(e, t.toLowerCase());
}
const yS = xr({
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
    acceptCharset: Ne,
    accessKey: Ne,
    action: null,
    allow: null,
    allowFullScreen: ue,
    allowPaymentRequest: ue,
    allowUserMedia: ue,
    alt: null,
    as: null,
    async: ue,
    autoCapitalize: null,
    autoComplete: Ne,
    autoFocus: ue,
    autoPlay: ue,
    blocking: Ne,
    capture: null,
    charSet: null,
    checked: ue,
    cite: null,
    className: Ne,
    cols: $,
    colSpan: null,
    content: null,
    contentEditable: We,
    controls: ue,
    controlsList: Ne,
    coords: $ | rr,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: ue,
    defer: ue,
    dir: null,
    dirName: null,
    disabled: ue,
    download: Qs,
    draggable: We,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: ue,
    formTarget: null,
    headers: Ne,
    height: $,
    hidden: Qs,
    high: $,
    href: null,
    hrefLang: null,
    htmlFor: Ne,
    httpEquiv: Ne,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: ue,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: ue,
    itemId: null,
    itemProp: Ne,
    itemRef: Ne,
    itemScope: ue,
    itemType: Ne,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: ue,
    low: $,
    manifest: null,
    max: null,
    maxLength: $,
    media: null,
    method: null,
    min: null,
    minLength: $,
    multiple: ue,
    muted: ue,
    name: null,
    nonce: null,
    noModule: ue,
    noValidate: ue,
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
    open: ue,
    optimum: $,
    pattern: null,
    ping: Ne,
    placeholder: null,
    playsInline: ue,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: ue,
    referrerPolicy: null,
    rel: Ne,
    required: ue,
    reversed: ue,
    rows: $,
    rowSpan: $,
    sandbox: Ne,
    scope: null,
    scoped: ue,
    seamless: ue,
    selected: ue,
    shadowRootClonable: ue,
    shadowRootDelegatesFocus: ue,
    shadowRootMode: null,
    shape: null,
    size: $,
    sizes: null,
    slot: null,
    span: $,
    spellCheck: We,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: $,
    step: null,
    style: null,
    tabIndex: $,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: ue,
    useMap: null,
    value: We,
    width: $,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: Ne,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: $,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: $,
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
    compact: ue,
    // Lists. Use CSS to reduce space between items instead
    declare: ue,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: $,
    // `<img>` and `<object>`
    leftMargin: $,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: $,
    // `<body>`
    marginWidth: $,
    // `<body>`
    noResize: ue,
    // `<frame>`
    noHref: ue,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: ue,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: ue,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: $,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: We,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: $,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: $,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: ue,
    disableRemotePlayback: ue,
    prefix: null,
    property: null,
    results: $,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: gp
}), vS = xr({
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
    accentHeight: $,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: $,
    amplitude: $,
    arabicForm: null,
    ascent: $,
    attributeName: null,
    attributeType: null,
    azimuth: $,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: $,
    by: null,
    calcMode: null,
    capHeight: $,
    className: Ne,
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
    descent: $,
    diffuseConstant: $,
    direction: null,
    display: null,
    dur: null,
    divisor: $,
    dominantBaseline: null,
    download: ue,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: $,
    enableBackground: null,
    end: null,
    event: null,
    exponent: $,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: $,
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
    hanging: $,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: $,
    horizOriginX: $,
    horizOriginY: $,
    id: null,
    ideographic: $,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: $,
    k: $,
    k1: $,
    k2: $,
    k3: $,
    k4: $,
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
    limitingConeAngle: $,
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
    mediaSize: $,
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
    overlinePosition: $,
    overlineThickness: $,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: $,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: Ne,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: $,
    pointsAtY: $,
    pointsAtZ: $,
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
    specularConstant: $,
    specularExponent: $,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: $,
    strikethroughThickness: $,
    string: null,
    stroke: null,
    strokeDashArray: gt,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: $,
    strokeOpacity: $,
    strokeWidth: null,
    style: null,
    surfaceScale: $,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: gt,
    tabIndex: $,
    tableValues: null,
    target: null,
    targetX: $,
    targetY: $,
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
    underlinePosition: $,
    underlineThickness: $,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: $,
    values: null,
    vAlphabetic: $,
    vMathematical: $,
    vectorEffect: null,
    vHanging: $,
    vIdeographic: $,
    version: null,
    vertAdvY: $,
    vertOriginX: $,
    vertOriginY: $,
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
    xHeight: $,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: mp
}), yp = xr({
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
}), vp = xr({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: gp
}), bp = xr({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  }
}), bS = {
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
}, xS = /[A-Z]/g, _u = /-[a-z]/g, wS = /^data[-\w.:]+$/i;
function SS(e, t) {
  const n = Js(t);
  let r = t, i = pt;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && wS.test(t)) {
    if (t.charAt(4) === "-") {
      const o = t.slice(5).replace(_u, CS);
      r = "data" + o.charAt(0).toUpperCase() + o.slice(1);
    } else {
      const o = t.slice(4);
      if (!_u.test(o)) {
        let s = o.replace(xS, kS);
        s.charAt(0) !== "-" && (s = "-" + s), t = "data" + s;
      }
    }
    i = vl;
  }
  return new i(r, t);
}
function kS(e) {
  return "-" + e.toLowerCase();
}
function CS(e) {
  return e.charAt(1).toUpperCase();
}
const TS = hp([pp, yS, yp, vp, bp], "html"), bl = hp([pp, vS, yp, vp, bp], "svg");
function ES(e) {
  return e.join(" ").trim();
}
var Zi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function xp(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var xl = {}, Fu = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, PS = /\n/g, AS = /^\s*/, RS = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, NS = /^:\s*/, IS = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, DS = /^[;\s]*/, MS = /^\s+|\s+$/g, OS = `
`, Vu = "/", zu = "*", Dn = "", LS = "comment", _S = "declaration";
function FS(e, t) {
  if (typeof e != "string")
    throw new TypeError("First argument must be a string");
  if (!e) return [];
  t = t || {};
  var n = 1, r = 1;
  function i(m) {
    var p = m.match(PS);
    p && (n += p.length);
    var b = m.lastIndexOf(OS);
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
    l(AS);
  }
  function u(m) {
    var p;
    for (m = m || []; p = d(); )
      p !== !1 && m.push(p);
    return m;
  }
  function d() {
    var m = o();
    if (!(Vu != e.charAt(0) || zu != e.charAt(1))) {
      for (var p = 2; Dn != e.charAt(p) && (zu != e.charAt(p) || Vu != e.charAt(p + 1)); )
        ++p;
      if (p += 2, Dn === e.charAt(p - 1))
        return a("End of comment missing");
      var b = e.slice(2, p - 2);
      return r += 2, i(b), e = e.slice(p), r += 2, m({
        type: LS,
        comment: b
      });
    }
  }
  function h() {
    var m = o(), p = l(RS);
    if (p) {
      if (d(), !l(NS)) return a("property missing ':'");
      var b = l(IS), v = m({
        type: _S,
        property: Bu(p[0].replace(Fu, Dn)),
        value: b ? Bu(b[0].replace(Fu, Dn)) : Dn
      });
      return l(DS), v;
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
function Bu(e) {
  return e ? e.replace(MS, Dn) : Dn;
}
var VS = FS, zS = Zi && Zi.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(xl, "__esModule", { value: !0 });
xl.default = $S;
const BS = zS(VS);
function $S(e, t) {
  let n = null;
  if (!e || typeof e != "string")
    return n;
  const r = (0, BS.default)(e), i = typeof t == "function";
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
var jS = /^--[a-zA-Z0-9_-]+$/, US = /-([a-z])/g, HS = /^[^-]+$/, WS = /^-(webkit|moz|ms|o|khtml)-/, qS = /^-(ms)-/, KS = function(e) {
  return !e || HS.test(e) || jS.test(e);
}, GS = function(e, t) {
  return t.toUpperCase();
}, $u = function(e, t) {
  return "".concat(t, "-");
}, YS = function(e, t) {
  return t === void 0 && (t = {}), KS(e) ? e : (e = e.toLowerCase(), t.reactCompat ? e = e.replace(qS, $u) : e = e.replace(WS, $u), e.replace(US, GS));
};
Ao.camelCase = YS;
var XS = Zi && Zi.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
}, ZS = XS(xl), JS = Ao;
function ta(e, t) {
  var n = {};
  return !e || typeof e != "string" || (0, ZS.default)(e, function(r, i) {
    r && i && (n[(0, JS.camelCase)(r, t)] = i);
  }), n;
}
ta.default = ta;
var QS = ta;
const ek = /* @__PURE__ */ xp(QS), wp = Sp("end"), wl = Sp("start");
function Sp(e) {
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
function tk(e) {
  const t = wl(e), n = wp(e);
  if (t && n)
    return { start: t, end: n };
}
function Ur(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? ju(e.position) : "start" in e || "end" in e ? ju(e) : "line" in e || "column" in e ? na(e) : "";
}
function na(e) {
  return Uu(e && e.line) + ":" + Uu(e && e.column);
}
function ju(e) {
  return na(e && e.start) + "-" + na(e && e.end);
}
function Uu(e) {
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
    this.ancestors = o.ancestors || void 0, this.cause = o.cause || void 0, this.column = a ? a.column : void 0, this.fatal = void 0, this.file = "", this.message = i, this.line = a ? a.line : void 0, this.name = Ur(o.place) || "1:1", this.place = o.place || void 0, this.reason = this.message, this.ruleId = o.ruleId || void 0, this.source = o.source || void 0, this.stack = s && o.cause && typeof o.cause.stack == "string" ? o.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
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
const Sl = {}.hasOwnProperty, nk = /* @__PURE__ */ new Map(), rk = /[A-Z]/g, ik = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), ok = /* @__PURE__ */ new Set(["td", "th"]), kp = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function sk(e, t) {
  if (!t || t.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = pk(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = hk(n, t.jsx, t.jsxs);
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
    schema: t.space === "svg" ? bl : TS,
    stylePropertyNameCase: t.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: t.tableCellAlignToStyle !== !1
  }, o = Cp(i, e, void 0);
  return o && typeof o != "string" ? o : i.create(
    e,
    i.Fragment,
    { children: o || void 0 },
    void 0
  );
}
function Cp(e, t, n) {
  if (t.type === "element")
    return ak(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression")
    return lk(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement")
    return uk(e, t, n);
  if (t.type === "mdxjsEsm")
    return ck(e, t);
  if (t.type === "root")
    return dk(e, t, n);
  if (t.type === "text")
    return fk(e, t);
}
function ak(e, t, n) {
  const r = e.schema;
  let i = r;
  t.tagName.toLowerCase() === "svg" && r.space === "html" && (i = bl, e.schema = i), e.ancestors.push(t);
  const o = Ep(e, t.tagName, !1), s = mk(e, t);
  let a = Cl(e, t);
  return ik.has(t.tagName) && (a = a.filter(function(l) {
    return typeof l == "string" ? !mS(l) : !0;
  })), Tp(e, s, o, t), kl(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function lk(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  Zr(e, t.position);
}
function ck(e, t) {
  if (t.data && t.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(t.data.estree)
    );
  Zr(e, t.position);
}
function uk(e, t, n) {
  const r = e.schema;
  let i = r;
  t.name === "svg" && r.space === "html" && (i = bl, e.schema = i), e.ancestors.push(t);
  const o = t.name === null ? e.Fragment : Ep(e, t.name, !0), s = gk(e, t), a = Cl(e, t);
  return Tp(e, s, o, t), kl(s, a), e.ancestors.pop(), e.schema = r, e.create(t, o, s, n);
}
function dk(e, t, n) {
  const r = {};
  return kl(r, Cl(e, t)), e.create(t, e.Fragment, r, n);
}
function fk(e, t) {
  return t.value;
}
function Tp(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function kl(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function hk(e, t, n) {
  return r;
  function r(i, o, s, a) {
    const c = Array.isArray(s.children) ? n : t;
    return a ? c(o, s, a) : c(o, s);
  }
}
function pk(e, t) {
  return n;
  function n(r, i, o, s) {
    const a = Array.isArray(o.children), l = wl(r);
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
function mk(e, t) {
  const n = {};
  let r, i;
  for (i in t.properties)
    if (i !== "children" && Sl.call(t.properties, i)) {
      const o = yk(e, i, t.properties[i]);
      if (o) {
        const [s, a] = o;
        e.tableCellAlignToStyle && s === "align" && typeof a == "string" && ok.has(t.tagName) ? r = a : n[s] = a;
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
function gk(e, t) {
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
        Zr(e, t.position);
    else {
      const i = r.name;
      let o;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const a = r.value.data.estree.body[0];
          a.type, o = e.evaluater.evaluateExpression(a.expression);
        } else
          Zr(e, t.position);
      else
        o = r.value === null ? !0 : r.value;
      n[i] = /** @type {Props[keyof Props]} */
      o;
    }
  return n;
}
function Cl(e, t) {
  const n = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : nk;
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
    const a = Cp(e, o, s);
    a !== void 0 && n.push(a);
  }
  return n;
}
function yk(e, t, n) {
  const r = SS(e.schema, t);
  if (!(n == null || typeof n == "number" && Number.isNaN(n))) {
    if (Array.isArray(n) && (n = r.commaSeparated ? uS(n) : ES(n)), r.property === "style") {
      let i = typeof n == "object" ? n : vk(e, String(n));
      return e.stylePropertyNameCase === "css" && (i = bk(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? bS[r.property] || r.property : r.attribute,
      n
    ];
  }
}
function vk(e, t) {
  try {
    return ek(t, { reactCompat: !0 });
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
    throw i.file = e.filePath || void 0, i.url = kp + "#cannot-parse-style-attribute", i;
  }
}
function Ep(e, t, n) {
  let r;
  if (!n)
    r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const i = t.split(".");
    let o = -1, s;
    for (; ++o < i.length; ) {
      const a = Mu(i[o]) ? { type: "Identifier", name: i[o] } : { type: "Literal", value: i[o] };
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
    r = Mu(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return Sl.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  Zr(e);
}
function Zr(e, t) {
  const n = new it(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: t,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw n.file = e.filePath || void 0, n.url = kp + "#cannot-handle-mdx-estrees-without-createevaluater", n;
}
function bk(e) {
  const t = {};
  let n;
  for (n in e)
    Sl.call(e, n) && (t[xk(n)] = e[n]);
  return t;
}
function xk(e) {
  let t = e.replace(rk, wk);
  return t.slice(0, 3) === "ms-" && (t = "-" + t), t;
}
function wk(e) {
  return "-" + e.toLowerCase();
}
const fs = {
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
}, Sk = {};
function Tl(e, t) {
  const n = Sk, r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0, i = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return Pp(e, r, i);
}
function Pp(e, t, n) {
  if (kk(e)) {
    if ("value" in e)
      return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return Hu(e.children, t, n);
  }
  return Array.isArray(e) ? Hu(e, t, n) : "";
}
function Hu(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = Pp(e[i], t, n);
  return r.join("");
}
function kk(e) {
  return !!(e && typeof e == "object");
}
const Wu = document.createElement("i");
function El(e) {
  const t = "&" + e + ";";
  Wu.innerHTML = t;
  const n = Wu.textContent;
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
const qu = {}.hasOwnProperty;
function Ap(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    Ck(t, e[n]);
  return t;
}
function Ck(e, t) {
  let n;
  for (n in t) {
    const i = (qu.call(e, n) ? e[n] : void 0) || (e[n] = {}), o = t[n];
    let s;
    if (o)
      for (s in o) {
        qu.call(i, s) || (i[s] = []);
        const a = o[s];
        Tk(
          // @ts-expect-error Looks like a list.
          i[s],
          Array.isArray(a) ? a : a ? [a] : []
        );
      }
  }
}
function Tk(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  vt(e, 0, 0, r);
}
function Rp(e, t) {
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
function Ot(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const lt = kn(/[A-Za-z]/), rt = kn(/[\dA-Za-z]/), Ek = kn(/[#-'*+\--9=?A-Z^-~]/);
function Ji(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const ra = kn(/\d/), Pk = kn(/[\dA-Fa-f]/), Ak = kn(/[!-/:-@[-`{-~]/);
function Z(e) {
  return e !== null && e < -2;
}
function Ae(e) {
  return e !== null && (e < 0 || e === 32);
}
function pe(e) {
  return e === -2 || e === -1 || e === 32;
}
const Ro = kn(new RegExp("\\p{P}|\\p{S}", "u")), _n = kn(/\s/);
function kn(e) {
  return t;
  function t(n) {
    return n !== null && n > -1 && e.test(String.fromCharCode(n));
  }
}
function wr(e) {
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
    return pe(l) ? (e.enter(n), a(l)) : t(l);
  }
  function a(l) {
    return pe(l) && o++ < i ? (e.consume(l), a) : (e.exit(n), t(l));
  }
}
const Rk = {
  tokenize: Nk
};
function Nk(e) {
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
    return Z(a) ? (e.consume(a), e.exit("chunkText"), o) : (e.consume(a), s);
  }
}
const Ik = {
  tokenize: Dk
}, Ku = {
  tokenize: Mk
};
function Dk(e) {
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
        return m(w);
      t.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return t.containerState = {}, e.check(Ku, u, d)(w);
  }
  function u(w) {
    return i && x(), v(r), h(w);
  }
  function d(w) {
    return t.parser.lazy[t.now().line] = r !== n.length, s = t.now().offset, m(w);
  }
  function h(w) {
    return t.containerState = {}, e.attempt(Ku, f, m)(w);
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
    return Z(w) ? (e.consume(w), b(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, a) : (e.consume(w), p);
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
      vt(t.events, D + 1, 0, t.events.slice(A)), t.events.length = k;
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
function Mk(e, t, n) {
  return xe(e, e.attempt(this.parser.constructs.document, t, n), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function cr(e) {
  if (e === null || Ae(e) || _n(e))
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
const ia = {
  name: "attention",
  resolveAll: Ok,
  tokenize: Lk
};
function Ok(e, t) {
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
          Gu(d, -l), Gu(h, l), s = {
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
function Lk(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = cr(r);
  let o;
  return s;
  function s(l) {
    return o = l, e.enter("attentionSequence"), a(l);
  }
  function a(l) {
    if (l === o)
      return e.consume(l), a;
    const c = e.exit("attentionSequence"), u = cr(l), d = !u || u === 2 && i || n.includes(l), h = !i || i === 2 && u || n.includes(r);
    return c._open = !!(o === 42 ? d : d && (i || !h)), c._close = !!(o === 42 ? h : h && (u || !d)), t(l);
  }
}
function Gu(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const _k = {
  name: "autolink",
  tokenize: Fk
};
function Fk(e, t, n) {
  let r = 0;
  return i;
  function i(f) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), o;
  }
  function o(f) {
    return lt(f) ? (e.consume(f), s) : f === 64 ? n(f) : c(f);
  }
  function s(f) {
    return f === 43 || f === 45 || f === 46 || rt(f) ? (r = 1, a(f)) : c(f);
  }
  function a(f) {
    return f === 58 ? (e.consume(f), r = 0, l) : (f === 43 || f === 45 || f === 46 || rt(f)) && r++ < 32 ? (e.consume(f), a) : (r = 0, c(f));
  }
  function l(f) {
    return f === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : f === null || f === 32 || f === 60 || Ji(f) ? n(f) : (e.consume(f), l);
  }
  function c(f) {
    return f === 64 ? (e.consume(f), u) : Ek(f) ? (e.consume(f), c) : n(f);
  }
  function u(f) {
    return rt(f) ? d(f) : n(f);
  }
  function d(f) {
    return f === 46 ? (e.consume(f), r = 0, u) : f === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : h(f);
  }
  function h(f) {
    if ((f === 45 || rt(f)) && r++ < 63) {
      const m = f === 45 ? h : d;
      return e.consume(f), m;
    }
    return n(f);
  }
}
const ci = {
  partial: !0,
  tokenize: Vk
};
function Vk(e, t, n) {
  return r;
  function r(o) {
    return pe(o) ? xe(e, i, "linePrefix")(o) : i(o);
  }
  function i(o) {
    return o === null || Z(o) ? t(o) : n(o);
  }
}
const Np = {
  continuation: {
    tokenize: Bk
  },
  exit: $k,
  name: "blockQuote",
  tokenize: zk
};
function zk(e, t, n) {
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
    return pe(s) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(s), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(s));
  }
}
function Bk(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return pe(s) ? xe(e, o, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(s) : o(s);
  }
  function o(s) {
    return e.attempt(Np, t, n)(s);
  }
}
function $k(e) {
  e.exit("blockQuote");
}
const Ip = {
  name: "characterEscape",
  tokenize: jk
};
function jk(e, t, n) {
  return r;
  function r(o) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(o), e.exit("escapeMarker"), i;
  }
  function i(o) {
    return Ak(o) ? (e.enter("characterEscapeValue"), e.consume(o), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(o);
  }
}
const Dp = {
  name: "characterReference",
  tokenize: Uk
};
function Uk(e, t, n) {
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
    return d === 88 || d === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(d), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), o = 6, s = Pk, u) : (e.enter("characterReferenceValue"), o = 7, s = ra, u(d));
  }
  function u(d) {
    if (d === 59 && i) {
      const h = e.exit("characterReferenceValue");
      return s === rt && !El(r.sliceSerialize(h)) ? n(d) : (e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), e.exit("characterReference"), t);
    }
    return s(d) && i++ < o ? (e.consume(d), u) : n(d);
  }
}
const Yu = {
  partial: !0,
  tokenize: Wk
}, Xu = {
  concrete: !0,
  name: "codeFenced",
  tokenize: Hk
};
function Hk(e, t, n) {
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
    return k === a ? (s++, e.consume(k), u) : s < 3 ? n(k) : (e.exit("codeFencedFenceSequence"), pe(k) ? xe(e, d, "whitespace")(k) : d(k));
  }
  function d(k) {
    return k === null || Z(k) ? (e.exit("codeFencedFence"), r.interrupt ? t(k) : e.check(Yu, p, T)(k)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), h(k));
  }
  function h(k) {
    return k === null || Z(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), d(k)) : pe(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), xe(e, f, "whitespace")(k)) : k === 96 && k === a ? n(k) : (e.consume(k), h);
  }
  function f(k) {
    return k === null || Z(k) ? d(k) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), m(k));
  }
  function m(k) {
    return k === null || Z(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), d(k)) : k === 96 && k === a ? n(k) : (e.consume(k), m);
  }
  function p(k) {
    return e.attempt(i, T, b)(k);
  }
  function b(k) {
    return e.enter("lineEnding"), e.consume(k), e.exit("lineEnding"), v;
  }
  function v(k) {
    return o > 0 && pe(k) ? xe(e, x, "linePrefix", o + 1)(k) : x(k);
  }
  function x(k) {
    return k === null || Z(k) ? e.check(Yu, p, T)(k) : (e.enter("codeFlowValue"), w(k));
  }
  function w(k) {
    return k === null || Z(k) ? (e.exit("codeFlowValue"), x(k)) : (e.consume(k), w);
  }
  function T(k) {
    return e.exit("codeFenced"), t(k);
  }
  function E(k, A, D) {
    let F = 0;
    return P;
    function P(W) {
      return k.enter("lineEnding"), k.consume(W), k.exit("lineEnding"), I;
    }
    function I(W) {
      return k.enter("codeFencedFence"), pe(W) ? xe(k, R, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(W) : R(W);
    }
    function R(W) {
      return W === a ? (k.enter("codeFencedFenceSequence"), z(W)) : D(W);
    }
    function z(W) {
      return W === a ? (F++, k.consume(W), z) : F >= s ? (k.exit("codeFencedFenceSequence"), pe(W) ? xe(k, j, "whitespace")(W) : j(W)) : D(W);
    }
    function j(W) {
      return W === null || Z(W) ? (k.exit("codeFencedFence"), A(W)) : D(W);
    }
  }
}
function Wk(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s === null ? n(s) : (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
const hs = {
  name: "codeIndented",
  tokenize: Kk
}, qk = {
  partial: !0,
  tokenize: Gk
};
function Kk(e, t, n) {
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
    return c === null ? l(c) : Z(c) ? e.attempt(qk, s, l)(c) : (e.enter("codeFlowValue"), a(c));
  }
  function a(c) {
    return c === null || Z(c) ? (e.exit("codeFlowValue"), s(c)) : (e.consume(c), a);
  }
  function l(c) {
    return e.exit("codeIndented"), t(c);
  }
}
function Gk(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return r.parser.lazy[r.now().line] ? n(s) : Z(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), i) : xe(e, o, "linePrefix", 5)(s);
  }
  function o(s) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : Z(s) ? i(s) : n(s);
  }
}
const Yk = {
  name: "codeText",
  previous: Zk,
  resolve: Xk,
  tokenize: Jk
};
function Xk(e) {
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
function Zk(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function Jk(e, t, n) {
  let r = 0, i, o;
  return s;
  function s(d) {
    return e.enter("codeText"), e.enter("codeTextSequence"), a(d);
  }
  function a(d) {
    return d === 96 ? (e.consume(d), r++, a) : (e.exit("codeTextSequence"), l(d));
  }
  function l(d) {
    return d === null ? n(d) : d === 32 ? (e.enter("space"), e.consume(d), e.exit("space"), l) : d === 96 ? (o = e.enter("codeTextSequence"), i = 0, u(d)) : Z(d) ? (e.enter("lineEnding"), e.consume(d), e.exit("lineEnding"), l) : (e.enter("codeTextData"), c(d));
  }
  function c(d) {
    return d === null || d === 32 || d === 96 || Z(d) ? (e.exit("codeTextData"), l(d)) : (e.consume(d), c);
  }
  function u(d) {
    return d === 96 ? (e.consume(d), i++, u) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(d)) : (o.type = "codeTextData", c(d));
  }
}
class Qk {
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
    return r && Mr(this.left, r), o.reverse();
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
    this.setCursor(Number.POSITIVE_INFINITY), Mr(this.left, t);
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
    this.setCursor(0), Mr(this.right, t.reverse());
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
        Mr(this.right, n.reverse());
      } else {
        const n = this.right.splice(this.left.length + this.right.length - t, Number.POSITIVE_INFINITY);
        Mr(this.left, n.reverse());
      }
  }
}
function Mr(e, t) {
  let n = 0;
  if (t.length < 1e4)
    e.push(...t);
  else
    for (; n < t.length; )
      e.push(...t.slice(n, n + 1e4)), n += 1e4;
}
function Mp(e) {
  const t = {};
  let n = -1, r, i, o, s, a, l, c;
  const u = new Qk(e);
  for (; ++n < u.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = u.get(n), n && r[1].type === "chunkFlow" && u.get(n - 1)[1].type === "listItemPrefix" && (l = r[1]._tokenizer.events, o = 0, o < l.length && l[o][1].type === "lineEndingBlank" && (o += 2), o < l.length && l[o][1].type === "content"))
      for (; ++o < l.length && l[o][1].type !== "content"; )
        l[o][1].type === "chunkText" && (l[o][1]._isInFirstContentOfListItem = !0, o++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, eC(u, n)), n = t[n], c = !0);
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
function eC(e, t) {
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
const tC = {
  resolve: rC,
  tokenize: iC
}, nC = {
  partial: !0,
  tokenize: oC
};
function rC(e) {
  return Mp(e), e;
}
function iC(e, t) {
  let n;
  return r;
  function r(a) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(a);
  }
  function i(a) {
    return a === null ? o(a) : Z(a) ? e.check(nC, s, o)(a) : (e.consume(a), i);
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
function oC(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), xe(e, o, "linePrefix");
  }
  function o(s) {
    if (s === null || Z(s))
      return n(s);
    const a = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(s) : e.interrupt(r.parser.constructs.flow, n, t)(s);
  }
}
function Op(e, t, n, r, i, o, s, a, l) {
  const c = l || Number.POSITIVE_INFINITY;
  let u = 0;
  return d;
  function d(v) {
    return v === 60 ? (e.enter(r), e.enter(i), e.enter(o), e.consume(v), e.exit(o), h) : v === null || v === 32 || v === 41 || Ji(v) ? n(v) : (e.enter(r), e.enter(s), e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), p(v));
  }
  function h(v) {
    return v === 62 ? (e.enter(o), e.consume(v), e.exit(o), e.exit(i), e.exit(r), t) : (e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), f(v));
  }
  function f(v) {
    return v === 62 ? (e.exit("chunkString"), e.exit(a), h(v)) : v === null || v === 60 || Z(v) ? n(v) : (e.consume(v), v === 92 ? m : f);
  }
  function m(v) {
    return v === 60 || v === 62 || v === 92 ? (e.consume(v), f) : f(v);
  }
  function p(v) {
    return !u && (v === null || v === 41 || Ae(v)) ? (e.exit("chunkString"), e.exit(a), e.exit(s), e.exit(r), t(v)) : u < c && v === 40 ? (e.consume(v), u++, p) : v === 41 ? (e.consume(v), u--, p) : v === null || v === 32 || v === 40 || Ji(v) ? n(v) : (e.consume(v), v === 92 ? b : p);
  }
  function b(v) {
    return v === 40 || v === 41 || v === 92 ? (e.consume(v), p) : p(v);
  }
}
function Lp(e, t, n, r, i, o) {
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
    f === 94 && !a && "_hiddenFootnoteSupport" in s.parser.constructs ? n(f) : f === 93 ? (e.exit(o), e.enter(i), e.consume(f), e.exit(i), e.exit(r), t) : Z(f) ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), u) : (e.enter("chunkString", {
      contentType: "string"
    }), d(f));
  }
  function d(f) {
    return f === null || f === 91 || f === 93 || Z(f) || a++ > 999 ? (e.exit("chunkString"), u(f)) : (e.consume(f), l || (l = !pe(f)), f === 92 ? h : d);
  }
  function h(f) {
    return f === 91 || f === 92 || f === 93 ? (e.consume(f), a++, d) : d(f);
  }
}
function _p(e, t, n, r, i, o) {
  let s;
  return a;
  function a(h) {
    return h === 34 || h === 39 || h === 40 ? (e.enter(r), e.enter(i), e.consume(h), e.exit(i), s = h === 40 ? 41 : h, l) : n(h);
  }
  function l(h) {
    return h === s ? (e.enter(i), e.consume(h), e.exit(i), e.exit(r), t) : (e.enter(o), c(h));
  }
  function c(h) {
    return h === s ? (e.exit(o), l(s)) : h === null ? n(h) : Z(h) ? (e.enter("lineEnding"), e.consume(h), e.exit("lineEnding"), xe(e, c, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), u(h));
  }
  function u(h) {
    return h === s || h === null || Z(h) ? (e.exit("chunkString"), c(h)) : (e.consume(h), h === 92 ? d : u);
  }
  function d(h) {
    return h === s || h === 92 ? (e.consume(h), u) : u(h);
  }
}
function Hr(e, t) {
  let n;
  return r;
  function r(i) {
    return Z(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : pe(i) ? xe(e, r, n ? "linePrefix" : "lineSuffix")(i) : t(i);
  }
}
const sC = {
  name: "definition",
  tokenize: lC
}, aC = {
  partial: !0,
  tokenize: cC
};
function lC(e, t, n) {
  const r = this;
  let i;
  return o;
  function o(f) {
    return e.enter("definition"), s(f);
  }
  function s(f) {
    return Lp.call(
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
    return i = Ot(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), f === 58 ? (e.enter("definitionMarker"), e.consume(f), e.exit("definitionMarker"), l) : n(f);
  }
  function l(f) {
    return Ae(f) ? Hr(e, c)(f) : c(f);
  }
  function c(f) {
    return Op(
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
    return e.attempt(aC, d, d)(f);
  }
  function d(f) {
    return pe(f) ? xe(e, h, "whitespace")(f) : h(f);
  }
  function h(f) {
    return f === null || Z(f) ? (e.exit("definition"), r.parser.defined.push(i), t(f)) : n(f);
  }
}
function cC(e, t, n) {
  return r;
  function r(a) {
    return Ae(a) ? Hr(e, i)(a) : n(a);
  }
  function i(a) {
    return _p(e, o, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(a);
  }
  function o(a) {
    return pe(a) ? xe(e, s, "whitespace")(a) : s(a);
  }
  function s(a) {
    return a === null || Z(a) ? t(a) : n(a);
  }
}
const uC = {
  name: "hardBreakEscape",
  tokenize: dC
};
function dC(e, t, n) {
  return r;
  function r(o) {
    return e.enter("hardBreakEscape"), e.consume(o), i;
  }
  function i(o) {
    return Z(o) ? (e.exit("hardBreakEscape"), t(o)) : n(o);
  }
}
const fC = {
  name: "headingAtx",
  resolve: hC,
  tokenize: pC
};
function hC(e, t) {
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
function pC(e, t, n) {
  let r = 0;
  return i;
  function i(u) {
    return e.enter("atxHeading"), o(u);
  }
  function o(u) {
    return e.enter("atxHeadingSequence"), s(u);
  }
  function s(u) {
    return u === 35 && r++ < 6 ? (e.consume(u), s) : u === null || Ae(u) ? (e.exit("atxHeadingSequence"), a(u)) : n(u);
  }
  function a(u) {
    return u === 35 ? (e.enter("atxHeadingSequence"), l(u)) : u === null || Z(u) ? (e.exit("atxHeading"), t(u)) : pe(u) ? xe(e, a, "whitespace")(u) : (e.enter("atxHeadingText"), c(u));
  }
  function l(u) {
    return u === 35 ? (e.consume(u), l) : (e.exit("atxHeadingSequence"), a(u));
  }
  function c(u) {
    return u === null || u === 35 || Ae(u) ? (e.exit("atxHeadingText"), a(u)) : (e.consume(u), c);
  }
}
const mC = [
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
], Zu = ["pre", "script", "style", "textarea"], gC = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: bC,
  tokenize: xC
}, yC = {
  partial: !0,
  tokenize: SC
}, vC = {
  partial: !0,
  tokenize: wC
};
function bC(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function xC(e, t, n) {
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
    return C === 33 ? (e.consume(C), h) : C === 47 ? (e.consume(C), o = !0, p) : C === 63 ? (e.consume(C), i = 3, r.interrupt ? t : S) : lt(C) ? (e.consume(C), s = String.fromCharCode(C), b) : n(C);
  }
  function h(C) {
    return C === 45 ? (e.consume(C), i = 2, f) : C === 91 ? (e.consume(C), i = 5, a = 0, m) : lt(C) ? (e.consume(C), i = 4, r.interrupt ? t : S) : n(C);
  }
  function f(C) {
    return C === 45 ? (e.consume(C), r.interrupt ? t : S) : n(C);
  }
  function m(C) {
    const J = "CDATA[";
    return C === J.charCodeAt(a++) ? (e.consume(C), a === J.length ? r.interrupt ? t : R : m) : n(C);
  }
  function p(C) {
    return lt(C) ? (e.consume(C), s = String.fromCharCode(C), b) : n(C);
  }
  function b(C) {
    if (C === null || C === 47 || C === 62 || Ae(C)) {
      const J = C === 47, q = s.toLowerCase();
      return !J && !o && Zu.includes(q) ? (i = 1, r.interrupt ? t(C) : R(C)) : mC.includes(s.toLowerCase()) ? (i = 6, J ? (e.consume(C), v) : r.interrupt ? t(C) : R(C)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(C) : o ? x(C) : w(C));
    }
    return C === 45 || rt(C) ? (e.consume(C), s += String.fromCharCode(C), b) : n(C);
  }
  function v(C) {
    return C === 62 ? (e.consume(C), r.interrupt ? t : R) : n(C);
  }
  function x(C) {
    return pe(C) ? (e.consume(C), x) : P(C);
  }
  function w(C) {
    return C === 47 ? (e.consume(C), P) : C === 58 || C === 95 || lt(C) ? (e.consume(C), T) : pe(C) ? (e.consume(C), w) : P(C);
  }
  function T(C) {
    return C === 45 || C === 46 || C === 58 || C === 95 || rt(C) ? (e.consume(C), T) : E(C);
  }
  function E(C) {
    return C === 61 ? (e.consume(C), k) : pe(C) ? (e.consume(C), E) : w(C);
  }
  function k(C) {
    return C === null || C === 60 || C === 61 || C === 62 || C === 96 ? n(C) : C === 34 || C === 39 ? (e.consume(C), l = C, A) : pe(C) ? (e.consume(C), k) : D(C);
  }
  function A(C) {
    return C === l ? (e.consume(C), l = null, F) : C === null || Z(C) ? n(C) : (e.consume(C), A);
  }
  function D(C) {
    return C === null || C === 34 || C === 39 || C === 47 || C === 60 || C === 61 || C === 62 || C === 96 || Ae(C) ? E(C) : (e.consume(C), D);
  }
  function F(C) {
    return C === 47 || C === 62 || pe(C) ? w(C) : n(C);
  }
  function P(C) {
    return C === 62 ? (e.consume(C), I) : n(C);
  }
  function I(C) {
    return C === null || Z(C) ? R(C) : pe(C) ? (e.consume(C), I) : n(C);
  }
  function R(C) {
    return C === 45 && i === 2 ? (e.consume(C), V) : C === 60 && i === 1 ? (e.consume(C), N) : C === 62 && i === 4 ? (e.consume(C), te) : C === 63 && i === 3 ? (e.consume(C), S) : C === 93 && i === 5 ? (e.consume(C), L) : Z(C) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(yC, X, z)(C)) : C === null || Z(C) ? (e.exit("htmlFlowData"), z(C)) : (e.consume(C), R);
  }
  function z(C) {
    return e.check(vC, j, X)(C);
  }
  function j(C) {
    return e.enter("lineEnding"), e.consume(C), e.exit("lineEnding"), W;
  }
  function W(C) {
    return C === null || Z(C) ? z(C) : (e.enter("htmlFlowData"), R(C));
  }
  function V(C) {
    return C === 45 ? (e.consume(C), S) : R(C);
  }
  function N(C) {
    return C === 47 ? (e.consume(C), s = "", _) : R(C);
  }
  function _(C) {
    if (C === 62) {
      const J = s.toLowerCase();
      return Zu.includes(J) ? (e.consume(C), te) : R(C);
    }
    return lt(C) && s.length < 8 ? (e.consume(C), s += String.fromCharCode(C), _) : R(C);
  }
  function L(C) {
    return C === 93 ? (e.consume(C), S) : R(C);
  }
  function S(C) {
    return C === 62 ? (e.consume(C), te) : C === 45 && i === 2 ? (e.consume(C), S) : R(C);
  }
  function te(C) {
    return C === null || Z(C) ? (e.exit("htmlFlowData"), X(C)) : (e.consume(C), te);
  }
  function X(C) {
    return e.exit("htmlFlow"), t(C);
  }
}
function wC(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return Z(s) ? (e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), o) : n(s);
  }
  function o(s) {
    return r.parser.lazy[r.now().line] ? n(s) : t(s);
  }
}
function SC(e, t, n) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(ci, t, n);
  }
}
const kC = {
  name: "htmlText",
  tokenize: CC
};
function CC(e, t, n) {
  const r = this;
  let i, o, s;
  return a;
  function a(S) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(S), l;
  }
  function l(S) {
    return S === 33 ? (e.consume(S), c) : S === 47 ? (e.consume(S), E) : S === 63 ? (e.consume(S), w) : lt(S) ? (e.consume(S), D) : n(S);
  }
  function c(S) {
    return S === 45 ? (e.consume(S), u) : S === 91 ? (e.consume(S), o = 0, m) : lt(S) ? (e.consume(S), x) : n(S);
  }
  function u(S) {
    return S === 45 ? (e.consume(S), f) : n(S);
  }
  function d(S) {
    return S === null ? n(S) : S === 45 ? (e.consume(S), h) : Z(S) ? (s = d, N(S)) : (e.consume(S), d);
  }
  function h(S) {
    return S === 45 ? (e.consume(S), f) : d(S);
  }
  function f(S) {
    return S === 62 ? V(S) : S === 45 ? h(S) : d(S);
  }
  function m(S) {
    const te = "CDATA[";
    return S === te.charCodeAt(o++) ? (e.consume(S), o === te.length ? p : m) : n(S);
  }
  function p(S) {
    return S === null ? n(S) : S === 93 ? (e.consume(S), b) : Z(S) ? (s = p, N(S)) : (e.consume(S), p);
  }
  function b(S) {
    return S === 93 ? (e.consume(S), v) : p(S);
  }
  function v(S) {
    return S === 62 ? V(S) : S === 93 ? (e.consume(S), v) : p(S);
  }
  function x(S) {
    return S === null || S === 62 ? V(S) : Z(S) ? (s = x, N(S)) : (e.consume(S), x);
  }
  function w(S) {
    return S === null ? n(S) : S === 63 ? (e.consume(S), T) : Z(S) ? (s = w, N(S)) : (e.consume(S), w);
  }
  function T(S) {
    return S === 62 ? V(S) : w(S);
  }
  function E(S) {
    return lt(S) ? (e.consume(S), k) : n(S);
  }
  function k(S) {
    return S === 45 || rt(S) ? (e.consume(S), k) : A(S);
  }
  function A(S) {
    return Z(S) ? (s = A, N(S)) : pe(S) ? (e.consume(S), A) : V(S);
  }
  function D(S) {
    return S === 45 || rt(S) ? (e.consume(S), D) : S === 47 || S === 62 || Ae(S) ? F(S) : n(S);
  }
  function F(S) {
    return S === 47 ? (e.consume(S), V) : S === 58 || S === 95 || lt(S) ? (e.consume(S), P) : Z(S) ? (s = F, N(S)) : pe(S) ? (e.consume(S), F) : V(S);
  }
  function P(S) {
    return S === 45 || S === 46 || S === 58 || S === 95 || rt(S) ? (e.consume(S), P) : I(S);
  }
  function I(S) {
    return S === 61 ? (e.consume(S), R) : Z(S) ? (s = I, N(S)) : pe(S) ? (e.consume(S), I) : F(S);
  }
  function R(S) {
    return S === null || S === 60 || S === 61 || S === 62 || S === 96 ? n(S) : S === 34 || S === 39 ? (e.consume(S), i = S, z) : Z(S) ? (s = R, N(S)) : pe(S) ? (e.consume(S), R) : (e.consume(S), j);
  }
  function z(S) {
    return S === i ? (e.consume(S), i = void 0, W) : S === null ? n(S) : Z(S) ? (s = z, N(S)) : (e.consume(S), z);
  }
  function j(S) {
    return S === null || S === 34 || S === 39 || S === 60 || S === 61 || S === 96 ? n(S) : S === 47 || S === 62 || Ae(S) ? F(S) : (e.consume(S), j);
  }
  function W(S) {
    return S === 47 || S === 62 || Ae(S) ? F(S) : n(S);
  }
  function V(S) {
    return S === 62 ? (e.consume(S), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(S);
  }
  function N(S) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(S), e.exit("lineEnding"), _;
  }
  function _(S) {
    return pe(S) ? xe(e, L, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(S) : L(S);
  }
  function L(S) {
    return e.enter("htmlTextData"), s(S);
  }
}
const Pl = {
  name: "labelEnd",
  resolveAll: AC,
  resolveTo: RC,
  tokenize: NC
}, TC = {
  tokenize: IC
}, EC = {
  tokenize: DC
}, PC = {
  tokenize: MC
};
function AC(e) {
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
function RC(e, t) {
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
function NC(e, t, n) {
  const r = this;
  let i = r.events.length, o, s;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      o = r.events[i][1];
      break;
    }
  return a;
  function a(h) {
    return o ? o._inactive ? d(h) : (s = r.parser.defined.includes(Ot(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(h), e.exit("labelMarker"), e.exit("labelEnd"), l) : n(h);
  }
  function l(h) {
    return h === 40 ? e.attempt(TC, u, s ? u : d)(h) : h === 91 ? e.attempt(EC, u, s ? c : d)(h) : s ? u(h) : d(h);
  }
  function c(h) {
    return e.attempt(PC, u, d)(h);
  }
  function u(h) {
    return t(h);
  }
  function d(h) {
    return o._balanced = !0, n(h);
  }
}
function IC(e, t, n) {
  return r;
  function r(d) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), i;
  }
  function i(d) {
    return Ae(d) ? Hr(e, o)(d) : o(d);
  }
  function o(d) {
    return d === 41 ? u(d) : Op(e, s, a, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(d);
  }
  function s(d) {
    return Ae(d) ? Hr(e, l)(d) : u(d);
  }
  function a(d) {
    return n(d);
  }
  function l(d) {
    return d === 34 || d === 39 || d === 40 ? _p(e, c, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(d) : u(d);
  }
  function c(d) {
    return Ae(d) ? Hr(e, u)(d) : u(d);
  }
  function u(d) {
    return d === 41 ? (e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), e.exit("resource"), t) : n(d);
  }
}
function DC(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return Lp.call(r, e, o, s, "reference", "referenceMarker", "referenceString")(a);
  }
  function o(a) {
    return r.parser.defined.includes(Ot(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? t(a) : n(a);
  }
  function s(a) {
    return n(a);
  }
}
function MC(e, t, n) {
  return r;
  function r(o) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), i;
  }
  function i(o) {
    return o === 93 ? (e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), e.exit("reference"), t) : n(o);
  }
}
const OC = {
  name: "labelStartImage",
  resolveAll: Pl.resolveAll,
  tokenize: LC
};
function LC(e, t, n) {
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
const _C = {
  name: "labelStartLink",
  resolveAll: Pl.resolveAll,
  tokenize: FC
};
function FC(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(s), e.exit("labelMarker"), e.exit("labelLink"), o;
  }
  function o(s) {
    return s === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(s) : t(s);
  }
}
const ps = {
  name: "lineEnding",
  tokenize: VC
};
function VC(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), xe(e, t, "linePrefix");
  }
}
const Li = {
  name: "thematicBreak",
  tokenize: zC
};
function zC(e, t, n) {
  let r = 0, i;
  return o;
  function o(c) {
    return e.enter("thematicBreak"), s(c);
  }
  function s(c) {
    return i = c, a(c);
  }
  function a(c) {
    return c === i ? (e.enter("thematicBreakSequence"), l(c)) : r >= 3 && (c === null || Z(c)) ? (e.exit("thematicBreak"), t(c)) : n(c);
  }
  function l(c) {
    return c === i ? (e.consume(c), r++, l) : (e.exit("thematicBreakSequence"), pe(c) ? xe(e, a, "whitespace")(c) : a(c));
  }
}
const dt = {
  continuation: {
    tokenize: UC
  },
  exit: WC,
  name: "list",
  tokenize: jC
}, BC = {
  partial: !0,
  tokenize: qC
}, $C = {
  partial: !0,
  tokenize: HC
};
function jC(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let o = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, s = 0;
  return a;
  function a(f) {
    const m = r.containerState.type || (f === 42 || f === 43 || f === 45 ? "listUnordered" : "listOrdered");
    if (m === "listUnordered" ? !r.containerState.marker || f === r.containerState.marker : ra(f)) {
      if (r.containerState.type || (r.containerState.type = m, e.enter(m, {
        _container: !0
      })), m === "listUnordered")
        return e.enter("listItemPrefix"), f === 42 || f === 45 ? e.check(Li, n, c)(f) : c(f);
      if (!r.interrupt || f === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), l(f);
    }
    return n(f);
  }
  function l(f) {
    return ra(f) && ++s < 10 ? (e.consume(f), l) : (!r.interrupt || s < 2) && (r.containerState.marker ? f === r.containerState.marker : f === 41 || f === 46) ? (e.exit("listItemValue"), c(f)) : n(f);
  }
  function c(f) {
    return e.enter("listItemMarker"), e.consume(f), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || f, e.check(
      ci,
      // Can’t be empty when interrupting.
      r.interrupt ? n : u,
      e.attempt(BC, h, d)
    );
  }
  function u(f) {
    return r.containerState.initialBlankLine = !0, o++, h(f);
  }
  function d(f) {
    return pe(f) ? (e.enter("listItemPrefixWhitespace"), e.consume(f), e.exit("listItemPrefixWhitespace"), h) : n(f);
  }
  function h(f) {
    return r.containerState.size = o + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(f);
  }
}
function UC(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(ci, i, o);
  function i(a) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, xe(e, t, "listItemIndent", r.containerState.size + 1)(a);
  }
  function o(a) {
    return r.containerState.furtherBlankLines || !pe(a) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, s(a)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt($C, t, s)(a));
  }
  function s(a) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, xe(e, e.attempt(dt, t, n), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a);
  }
}
function HC(e, t, n) {
  const r = this;
  return xe(e, i, "listItemIndent", r.containerState.size + 1);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "listItemIndent" && s[2].sliceSerialize(s[1], !0).length === r.containerState.size ? t(o) : n(o);
  }
}
function WC(e) {
  e.exit(this.containerState.type);
}
function qC(e, t, n) {
  const r = this;
  return xe(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return !pe(o) && s && s[1].type === "listItemPrefixWhitespace" ? t(o) : n(o);
  }
}
const Ju = {
  name: "setextUnderline",
  resolveTo: KC,
  tokenize: GC
};
function KC(e, t) {
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
function GC(e, t, n) {
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
    return c === i ? (e.consume(c), a) : (e.exit("setextHeadingLineSequence"), pe(c) ? xe(e, l, "lineSuffix")(c) : l(c));
  }
  function l(c) {
    return c === null || Z(c) ? (e.exit("setextHeadingLine"), t(c)) : n(c);
  }
}
const YC = {
  tokenize: XC
};
function XC(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    ci,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, xe(e, e.attempt(this.parser.constructs.flow, i, e.attempt(tC, i)), "linePrefix"))
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
const ZC = {
  resolveAll: Vp()
}, JC = Fp("string"), QC = Fp("text");
function Fp(e) {
  return {
    resolveAll: Vp(e === "text" ? eT : void 0),
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
function Vp(e) {
  return t;
  function t(n, r) {
    let i = -1, o;
    for (; ++i <= n.length; )
      o === void 0 ? n[i] && n[i][1].type === "data" && (o = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== o + 2 && (n[o][1].end = n[i - 1][1].end, n.splice(o + 2, i - o - 2), i = o + 2), o = void 0);
    return e ? e(n, r) : n;
  }
}
function eT(e, t) {
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
const tT = {
  42: dt,
  43: dt,
  45: dt,
  48: dt,
  49: dt,
  50: dt,
  51: dt,
  52: dt,
  53: dt,
  54: dt,
  55: dt,
  56: dt,
  57: dt,
  62: Np
}, nT = {
  91: sC
}, rT = {
  [-2]: hs,
  [-1]: hs,
  32: hs
}, iT = {
  35: fC,
  42: Li,
  45: [Ju, Li],
  60: gC,
  61: Ju,
  95: Li,
  96: Xu,
  126: Xu
}, oT = {
  38: Dp,
  92: Ip
}, sT = {
  [-5]: ps,
  [-4]: ps,
  [-3]: ps,
  33: OC,
  38: Dp,
  42: ia,
  60: [_k, kC],
  91: _C,
  92: [uC, Ip],
  93: Pl,
  95: ia,
  96: Yk
}, aT = {
  null: [ia, ZC]
}, lT = {
  null: [42, 95]
}, cT = {
  null: []
}, uT = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: lT,
  contentInitial: nT,
  disable: cT,
  document: tT,
  flow: iT,
  flowInitial: rT,
  insideSpan: aT,
  string: oT,
  text: sT
}, Symbol.toStringTag, { value: "Module" }));
function dT(e, t, n) {
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
  function d(I) {
    return s = Tt(s, I), b(), s[s.length - 1] !== null ? [] : (D(t, 0), c.events = No(o, c.events, c), c.events);
  }
  function h(I, R) {
    return hT(f(I), R);
  }
  function f(I) {
    return fT(s, I);
  }
  function m() {
    const {
      _bufferIndex: I,
      _index: R,
      line: z,
      column: j,
      offset: W
    } = r;
    return {
      _bufferIndex: I,
      _index: R,
      line: z,
      column: j,
      offset: W
    };
  }
  function p(I) {
    i[I.line] = I.column, P();
  }
  function b() {
    let I;
    for (; r._index < s.length; ) {
      const R = s[r._index];
      if (typeof R == "string")
        for (I = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === I && r._bufferIndex < R.length; )
          v(R.charCodeAt(r._bufferIndex));
      else
        v(R);
    }
  }
  function v(I) {
    u = u(I);
  }
  function x(I) {
    Z(I) ? (r.line++, r.column = 1, r.offset += I === -3 ? 2 : 1, P()) : I !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    s[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = I;
  }
  function w(I, R) {
    const z = R || {};
    return z.type = I, z.start = m(), c.events.push(["enter", z, c]), a.push(z), z;
  }
  function T(I) {
    const R = a.pop();
    return R.end = m(), c.events.push(["exit", R, c]), R;
  }
  function E(I, R) {
    D(I, R.from);
  }
  function k(I, R) {
    R.restore();
  }
  function A(I, R) {
    return z;
    function z(j, W, V) {
      let N, _, L, S;
      return Array.isArray(j) ? (
        /* c8 ignore next 1 */
        X(j)
      ) : "tokenize" in j ? (
        // Looks like a construct.
        X([
          /** @type {Construct} */
          j
        ])
      ) : te(j);
      function te(K) {
        return B;
        function B(G) {
          const ge = G !== null && K[G], re = G !== null && K.null, oe = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(ge) ? ge : ge ? [ge] : [],
            ...Array.isArray(re) ? re : re ? [re] : []
          ];
          return X(oe)(G);
        }
      }
      function X(K) {
        return N = K, _ = 0, K.length === 0 ? V : C(K[_]);
      }
      function C(K) {
        return B;
        function B(G) {
          return S = F(), L = K, K.partial || (c.currentConstruct = K), K.name && c.parser.constructs.disable.null.includes(K.name) ? q() : K.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            R ? Object.assign(Object.create(c), R) : c,
            l,
            J,
            q
          )(G);
        }
      }
      function J(K) {
        return I(L, S), W;
      }
      function q(K) {
        return S.restore(), ++_ < N.length ? C(N[_]) : V;
      }
    }
  }
  function D(I, R) {
    I.resolveAll && !o.includes(I) && o.push(I), I.resolve && vt(c.events, R, c.events.length - R, I.resolve(c.events.slice(R), c)), I.resolveTo && (c.events = I.resolveTo(c.events, c));
  }
  function F() {
    const I = m(), R = c.previous, z = c.currentConstruct, j = c.events.length, W = Array.from(a);
    return {
      from: j,
      restore: V
    };
    function V() {
      r = I, c.previous = R, c.currentConstruct = z, c.events.length = j, a = W, P();
    }
  }
  function P() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function fT(e, t) {
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
function hT(e, t) {
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
function pT(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      Ap([uT, ...(e || {}).extensions || []])
    ),
    content: i(Rk),
    defined: [],
    document: i(Ik),
    flow: i(YC),
    lazy: {},
    string: i(JC),
    text: i(QC)
  };
  return r;
  function i(o) {
    return s;
    function s(a) {
      return dT(r, o, a);
    }
  }
}
function mT(e) {
  for (; !Mp(e); )
    ;
  return e;
}
const Qu = /[\0\t\n\r]/g;
function gT() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(o, s, a) {
    const l = [];
    let c, u, d, h, f;
    for (o = t + (typeof o == "string" ? o.toString() : new TextDecoder(s || void 0).decode(o)), d = 0, t = "", n && (o.charCodeAt(0) === 65279 && d++, n = void 0); d < o.length; ) {
      if (Qu.lastIndex = d, c = Qu.exec(o), h = c && c.index !== void 0 ? c.index : o.length, f = o.charCodeAt(h), !c) {
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
const yT = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function vT(e) {
  return e.replace(yT, bT);
}
function bT(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), o = i === 120 || i === 88;
    return Rp(n.slice(o ? 2 : 1), o ? 16 : 10);
  }
  return El(n) || e;
}
const zp = {}.hasOwnProperty;
function xT(e, t, n) {
  return typeof t != "string" && (n = t, t = void 0), wT(n)(mT(pT(n).document().write(gT()(e, t, !0))));
}
function wT(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: o(Et),
      autolinkProtocol: F,
      autolinkEmail: F,
      atxHeading: o(wt),
      blockQuote: o(re),
      characterEscape: F,
      characterReference: F,
      codeFenced: o(oe),
      codeFencedFenceInfo: s,
      codeFencedFenceMeta: s,
      codeIndented: o(oe, s),
      codeText: o(de, s),
      codeTextData: F,
      data: F,
      codeFlowValue: F,
      definition: o(je),
      definitionDestinationString: s,
      definitionLabelString: s,
      definitionTitleString: s,
      emphasis: o(Ke),
      hardBreakEscape: o(ct),
      hardBreakTrailing: o(ct),
      htmlFlow: o(mt, s),
      htmlFlowData: F,
      htmlText: o(mt, s),
      htmlTextData: F,
      image: o(Yt),
      label: s,
      link: o(Et),
      listItem: o(Zt),
      listItemValue: h,
      listOrdered: o(Xt, d),
      listUnordered: o(Xt),
      paragraph: o(Wn),
      reference: C,
      referenceString: s,
      resourceDestinationString: s,
      resourceTitleString: s,
      setextHeading: o(wt),
      strong: o(Pt),
      thematicBreak: o(Ar)
    },
    exit: {
      atxHeading: l(),
      atxHeadingSequence: E,
      autolink: l(),
      autolinkEmail: ge,
      autolinkProtocol: G,
      blockQuote: l(),
      characterEscapeValue: P,
      characterReferenceMarkerHexadecimal: q,
      characterReferenceMarkerNumeric: q,
      characterReferenceValue: K,
      characterReference: B,
      codeFenced: l(b),
      codeFencedFence: p,
      codeFencedFenceInfo: f,
      codeFencedFenceMeta: m,
      codeFlowValue: P,
      codeIndented: l(v),
      codeText: l(W),
      codeTextData: P,
      data: P,
      definition: l(),
      definitionDestinationString: T,
      definitionLabelString: x,
      definitionTitleString: w,
      emphasis: l(),
      hardBreakEscape: l(R),
      hardBreakTrailing: l(R),
      htmlFlow: l(z),
      htmlFlowData: P,
      htmlText: l(j),
      htmlTextData: P,
      image: l(N),
      label: L,
      labelText: _,
      lineEnding: I,
      link: l(V),
      listItem: l(),
      listOrdered: l(),
      listUnordered: l(),
      paragraph: l(),
      referenceString: J,
      resourceDestinationString: S,
      resourceTitleString: te,
      resource: X,
      setextHeading: l(D),
      setextHeadingLineSequence: A,
      setextHeadingText: k,
      strong: l(),
      thematicBreak: l()
    }
  };
  Bp(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(M) {
    let H = {
      type: "root",
      children: []
    };
    const ie = {
      stack: [H],
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
          const ot = fe.pop();
          ye = i(M, ot, ye);
        }
    for (ye = -1; ++ye < M.length; ) {
      const ot = t[M[ye][0]];
      zp.call(ot, M[ye][1].type) && ot[M[ye][1].type].call(Object.assign({
        sliceSerialize: M[ye][2].sliceSerialize
      }, ie), M[ye][1]);
    }
    if (ie.tokenStack.length > 0) {
      const ot = ie.tokenStack[ie.tokenStack.length - 1];
      (ot[1] || ed).call(ie, void 0, ot[0]);
    }
    for (H.position = {
      start: fn(M.length > 0 ? M[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: fn(M.length > 0 ? M[M.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, ye = -1; ++ye < t.transforms.length; )
      H = t.transforms[ye](H) || H;
    return H;
  }
  function i(M, H, ie) {
    let fe = H - 1, ye = -1, ot = !1, St, st, at, At;
    for (; ++fe <= ie; ) {
      const Le = M[fe];
      switch (Le[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          Le[0] === "enter" ? ye++ : ye--, At = void 0;
          break;
        }
        case "lineEndingBlank": {
          Le[0] === "enter" && (St && !At && !ye && !at && (at = fe), At = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          At = void 0;
      }
      if (!ye && Le[0] === "enter" && Le[1].type === "listItemPrefix" || ye === -1 && Le[0] === "exit" && (Le[1].type === "listUnordered" || Le[1].type === "listOrdered")) {
        if (St) {
          let Rt = fe;
          for (st = void 0; Rt--; ) {
            const ut = M[Rt];
            if (ut[1].type === "lineEnding" || ut[1].type === "lineEndingBlank") {
              if (ut[0] === "exit") continue;
              st && (M[st][1].type = "lineEndingBlank", ot = !0), ut[1].type = "lineEnding", st = Rt;
            } else if (!(ut[1].type === "linePrefix" || ut[1].type === "blockQuotePrefix" || ut[1].type === "blockQuotePrefixWhitespace" || ut[1].type === "blockQuoteMarker" || ut[1].type === "listItemIndent")) break;
          }
          at && (!st || at < st) && (St._spread = !0), St.end = Object.assign({}, st ? M[st][1].start : Le[1].end), M.splice(st || fe, 0, ["exit", St, Le[2]]), fe++, ie++;
        }
        if (Le[1].type === "listItemPrefix") {
          const Rt = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, Le[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          St = Rt, M.splice(fe, 0, ["enter", Rt, Le[2]]), fe++, ie++, at = void 0, At = !0;
        }
      }
    }
    return M[H][1]._spread = ot, ie;
  }
  function o(M, H) {
    return ie;
    function ie(fe) {
      a.call(this, M(fe), fe), H && H.call(this, fe);
    }
  }
  function s() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function a(M, H, ie) {
    this.stack[this.stack.length - 1].children.push(M), this.stack.push(M), this.tokenStack.push([H, ie || void 0]), M.position = {
      start: fn(H.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function l(M) {
    return H;
    function H(ie) {
      M && M.call(this, ie), c.call(this, ie);
    }
  }
  function c(M, H) {
    const ie = this.stack.pop(), fe = this.tokenStack.pop();
    if (fe)
      fe[0].type !== M.type && (H ? H.call(this, M, fe[0]) : (fe[1] || ed).call(this, M, fe[0]));
    else throw new Error("Cannot close `" + M.type + "` (" + Ur({
      start: M.start,
      end: M.end
    }) + "): it’s not open");
    ie.position.end = fn(M.end);
  }
  function u() {
    return Tl(this.stack.pop());
  }
  function d() {
    this.data.expectingFirstListItemValue = !0;
  }
  function h(M) {
    if (this.data.expectingFirstListItemValue) {
      const H = this.stack[this.stack.length - 2];
      H.start = Number.parseInt(this.sliceSerialize(M), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function f() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.lang = M;
  }
  function m() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.meta = M;
  }
  function p() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function b() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.value = M.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function v() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.value = M.replace(/(\r?\n|\r)$/g, "");
  }
  function x(M) {
    const H = this.resume(), ie = this.stack[this.stack.length - 1];
    ie.label = H, ie.identifier = Ot(this.sliceSerialize(M)).toLowerCase();
  }
  function w() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.title = M;
  }
  function T() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.url = M;
  }
  function E(M) {
    const H = this.stack[this.stack.length - 1];
    if (!H.depth) {
      const ie = this.sliceSerialize(M).length;
      H.depth = ie;
    }
  }
  function k() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function A(M) {
    const H = this.stack[this.stack.length - 1];
    H.depth = this.sliceSerialize(M).codePointAt(0) === 61 ? 1 : 2;
  }
  function D() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function F(M) {
    const ie = this.stack[this.stack.length - 1].children;
    let fe = ie[ie.length - 1];
    (!fe || fe.type !== "text") && (fe = Pr(), fe.position = {
      start: fn(M.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, ie.push(fe)), this.stack.push(fe);
  }
  function P(M) {
    const H = this.stack.pop();
    H.value += this.sliceSerialize(M), H.position.end = fn(M.end);
  }
  function I(M) {
    const H = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const ie = H.children[H.children.length - 1];
      ie.position.end = fn(M.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && t.canContainEols.includes(H.type) && (F.call(this, M), P.call(this, M));
  }
  function R() {
    this.data.atHardBreak = !0;
  }
  function z() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.value = M;
  }
  function j() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.value = M;
  }
  function W() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.value = M;
  }
  function V() {
    const M = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const H = this.data.referenceType || "shortcut";
      M.type += "Reference", M.referenceType = H, delete M.url, delete M.title;
    } else
      delete M.identifier, delete M.label;
    this.data.referenceType = void 0;
  }
  function N() {
    const M = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const H = this.data.referenceType || "shortcut";
      M.type += "Reference", M.referenceType = H, delete M.url, delete M.title;
    } else
      delete M.identifier, delete M.label;
    this.data.referenceType = void 0;
  }
  function _(M) {
    const H = this.sliceSerialize(M), ie = this.stack[this.stack.length - 2];
    ie.label = vT(H), ie.identifier = Ot(H).toLowerCase();
  }
  function L() {
    const M = this.stack[this.stack.length - 1], H = this.resume(), ie = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, ie.type === "link") {
      const fe = M.children;
      ie.children = fe;
    } else
      ie.alt = H;
  }
  function S() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.url = M;
  }
  function te() {
    const M = this.resume(), H = this.stack[this.stack.length - 1];
    H.title = M;
  }
  function X() {
    this.data.inReference = void 0;
  }
  function C() {
    this.data.referenceType = "collapsed";
  }
  function J(M) {
    const H = this.resume(), ie = this.stack[this.stack.length - 1];
    ie.label = H, ie.identifier = Ot(this.sliceSerialize(M)).toLowerCase(), this.data.referenceType = "full";
  }
  function q(M) {
    this.data.characterReferenceType = M.type;
  }
  function K(M) {
    const H = this.sliceSerialize(M), ie = this.data.characterReferenceType;
    let fe;
    ie ? (fe = Rp(H, ie === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : fe = El(H);
    const ye = this.stack[this.stack.length - 1];
    ye.value += fe;
  }
  function B(M) {
    const H = this.stack.pop();
    H.position.end = fn(M.end);
  }
  function G(M) {
    P.call(this, M);
    const H = this.stack[this.stack.length - 1];
    H.url = this.sliceSerialize(M);
  }
  function ge(M) {
    P.call(this, M);
    const H = this.stack[this.stack.length - 1];
    H.url = "mailto:" + this.sliceSerialize(M);
  }
  function re() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function oe() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function de() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function je() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function Ke() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function wt() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function ct() {
    return {
      type: "break"
    };
  }
  function mt() {
    return {
      type: "html",
      value: ""
    };
  }
  function Yt() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function Et() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function Xt(M) {
    return {
      type: "list",
      ordered: M.type === "listOrdered",
      start: null,
      spread: M._spread,
      children: []
    };
  }
  function Zt(M) {
    return {
      type: "listItem",
      spread: M._spread,
      checked: null,
      children: []
    };
  }
  function Wn() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function Pt() {
    return {
      type: "strong",
      children: []
    };
  }
  function Pr() {
    return {
      type: "text",
      value: ""
    };
  }
  function Ar() {
    return {
      type: "thematicBreak"
    };
  }
}
function fn(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function Bp(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? Bp(e, r) : ST(e, r);
  }
}
function ST(e, t) {
  let n;
  for (n in t)
    if (zp.call(t, n))
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
function ed(e, t) {
  throw e ? new Error("Cannot close `" + e.type + "` (" + Ur({
    start: e.start,
    end: e.end
  }) + "): a different token (`" + t.type + "`, " + Ur({
    start: t.start,
    end: t.end
  }) + ") is open") : new Error("Cannot close document, a token (`" + t.type + "`, " + Ur({
    start: t.start,
    end: t.end
  }) + ") is still open");
}
function kT(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return xT(r, {
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
function CT(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function TT(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function ET(e, t) {
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
function PT(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function AT(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function RT(e, t) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", r = String(t.identifier).toUpperCase(), i = wr(r.toLowerCase()), o = e.footnoteOrder.indexOf(r);
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
function NT(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function IT(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
}
function $p(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return [{ type: "text", value: "![" + t.alt + r }];
  const i = e.all(t), o = i[0];
  o && o.type === "text" ? o.value = "[" + o.value : i.unshift({ type: "text", value: "[" });
  const s = i[i.length - 1];
  return s && s.type === "text" ? s.value += r : i.push({ type: "text", value: r }), i;
}
function DT(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return $p(e, t);
  const i = { src: wr(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(t, o), e.applyData(t, o);
}
function MT(e, t) {
  const n = { src: wr(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function OT(e, t) {
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
function LT(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return $p(e, t);
  const i = { href: wr(r.url || "") };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = {
    type: "element",
    tagName: "a",
    properties: i,
    children: e.all(t)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function _T(e, t) {
  const n = { href: wr(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: n,
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function FT(e, t, n) {
  const r = e.all(t), i = n ? VT(n) : jp(t), o = {}, s = [];
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
function VT(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = jp(n[r]);
  }
  return t;
}
function jp(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function zT(e, t) {
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
function BT(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function $T(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function jT(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function UT(e, t) {
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
    }, a = wl(t.children[1]), l = wp(t.children[t.children.length - 1]);
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
function HT(e, t, n) {
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
function WT(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const td = 9, nd = 32;
function qT(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const o = [];
  for (; r; )
    o.push(
      rd(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return o.push(rd(t.slice(i), i > 0, !1)), o.join("");
}
function rd(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let o = e.codePointAt(r);
    for (; o === td || o === nd; )
      r++, o = e.codePointAt(r);
  }
  if (n) {
    let o = e.codePointAt(i - 1);
    for (; o === td || o === nd; )
      i--, o = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function KT(e, t) {
  const n = { type: "text", value: qT(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function GT(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const YT = {
  blockquote: CT,
  break: TT,
  code: ET,
  delete: PT,
  emphasis: AT,
  footnoteReference: RT,
  heading: NT,
  html: IT,
  imageReference: DT,
  image: MT,
  inlineCode: OT,
  linkReference: LT,
  link: _T,
  listItem: FT,
  list: zT,
  paragraph: BT,
  // @ts-expect-error: root is different, but hard to type.
  root: $T,
  strong: jT,
  table: UT,
  tableCell: WT,
  tableRow: HT,
  text: KT,
  thematicBreak: GT,
  toml: wi,
  yaml: wi,
  definition: wi,
  footnoteDefinition: wi
};
function wi() {
}
const Up = -1, Io = 0, Wr = 1, Qi = 2, Al = 3, Rl = 4, Nl = 5, Il = 6, Hp = 7, Wp = 8, id = typeof self == "object" ? self : globalThis, XT = (e, t) => {
  const n = (i, o) => (e.set(o, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [o, s] = t[i];
    switch (o) {
      case Io:
      case Up:
        return n(s, i);
      case Wr: {
        const a = n([], i);
        for (const l of s)
          a.push(r(l));
        return a;
      }
      case Qi: {
        const a = n({}, i);
        for (const [l, c] of s)
          a[r(l)] = r(c);
        return a;
      }
      case Al:
        return n(new Date(s), i);
      case Rl: {
        const { source: a, flags: l } = s;
        return n(new RegExp(a, l), i);
      }
      case Nl: {
        const a = n(/* @__PURE__ */ new Map(), i);
        for (const [l, c] of s)
          a.set(r(l), r(c));
        return a;
      }
      case Il: {
        const a = n(/* @__PURE__ */ new Set(), i);
        for (const l of s)
          a.add(r(l));
        return a;
      }
      case Hp: {
        const { name: a, message: l } = s;
        return n(new id[a](l), i);
      }
      case Wp:
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
    return n(new id[o](s), i);
  };
  return r;
}, od = (e) => XT(/* @__PURE__ */ new Map(), e)(0), qn = "", { toString: ZT } = {}, { keys: JT } = Object, Or = (e) => {
  const t = typeof e;
  if (t !== "object" || !e)
    return [Io, t];
  const n = ZT.call(e).slice(8, -1);
  switch (n) {
    case "Array":
      return [Wr, qn];
    case "Object":
      return [Qi, qn];
    case "Date":
      return [Al, qn];
    case "RegExp":
      return [Rl, qn];
    case "Map":
      return [Nl, qn];
    case "Set":
      return [Il, qn];
    case "DataView":
      return [Wr, n];
  }
  return n.includes("Array") ? [Wr, n] : n.includes("Error") ? [Hp, n] : [Qi, n];
}, Si = ([e, t]) => e === Io && (t === "function" || t === "symbol"), QT = (e, t, n, r) => {
  const i = (s, a) => {
    const l = r.push(s) - 1;
    return n.set(a, l), l;
  }, o = (s) => {
    if (n.has(s))
      return n.get(s);
    let [a, l] = Or(s);
    switch (a) {
      case Io: {
        let u = s;
        switch (l) {
          case "bigint":
            a = Wp, u = s.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + l);
            u = null;
            break;
          case "undefined":
            return i([Up], s);
        }
        return i([a, u], s);
      }
      case Wr: {
        if (l) {
          let h = s;
          return l === "DataView" ? h = new Uint8Array(s.buffer) : l === "ArrayBuffer" && (h = new Uint8Array(s)), i([l, [...h]], s);
        }
        const u = [], d = i([a, u], s);
        for (const h of s)
          u.push(o(h));
        return d;
      }
      case Qi: {
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
        for (const h of JT(s))
          (e || !Si(Or(s[h]))) && u.push([o(h), o(s[h])]);
        return d;
      }
      case Al:
        return i([a, s.toISOString()], s);
      case Rl: {
        const { source: u, flags: d } = s;
        return i([a, { source: u, flags: d }], s);
      }
      case Nl: {
        const u = [], d = i([a, u], s);
        for (const [h, f] of s)
          (e || !(Si(Or(h)) || Si(Or(f)))) && u.push([o(h), o(f)]);
        return d;
      }
      case Il: {
        const u = [], d = i([a, u], s);
        for (const h of s)
          (e || !Si(Or(h))) && u.push(o(h));
        return d;
      }
    }
    const { message: c } = s;
    return i([a, { name: l, message: c }], s);
  };
  return o;
}, sd = (e, { json: t, lossy: n } = {}) => {
  const r = [];
  return QT(!(t || n), !!t, /* @__PURE__ */ new Map(), r)(e), r;
}, eo = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, t) => t && ("json" in t || "lossy" in t) ? od(sd(e, t)) : structuredClone(e)
) : (e, t) => od(sd(e, t));
function eE(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return t > 1 && n.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(t) }]
  }), n;
}
function tE(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function nE(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", n = e.options.footnoteBackContent || eE, r = e.options.footnoteBackLabel || tE, i = e.options.footnoteLabel || "Footnotes", o = e.options.footnoteLabelTagName || "h2", s = e.options.footnoteLabelProperties || {
    className: ["sr-only"]
  }, a = [];
  let l = -1;
  for (; ++l < e.footnoteOrder.length; ) {
    const c = e.footnoteById.get(
      e.footnoteOrder[l]
    );
    if (!c)
      continue;
    const u = e.all(c), d = String(c.identifier).toUpperCase(), h = wr(d.toLowerCase());
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
            ...eo(s),
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
      return sE;
    if (typeof e == "function")
      return Mo(e);
    if (typeof e == "object")
      return Array.isArray(e) ? rE(e) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        iE(
          /** @type {Props} */
          e
        )
      );
    if (typeof e == "string")
      return oE(e);
    throw new Error("Expected function, string, or object as test");
  }
);
function rE(e) {
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
function iE(e) {
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
function oE(e) {
  return Mo(t);
  function t(n) {
    return n && n.type === e;
  }
}
function Mo(e) {
  return t;
  function t(n, r, i) {
    return !!(aE(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function sE() {
  return !0;
}
function aE(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const qp = [], lE = !0, oa = !1, cE = "skip";
function Kp(e, t, n, r) {
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
      let f = qp, m, p, b;
      if ((!t || o(l, c, u[u.length - 1] || void 0)) && (f = uE(n(l, u)), f[0] === oa))
        return f;
      if ("children" in l && l.children) {
        const v = (
          /** @type {UnistParent} */
          l
        );
        if (v.children && f[0] !== cE)
          for (p = (r ? v.children.length : -1) + s, b = u.concat(v); p > -1 && p < v.children.length; ) {
            const x = v.children[p];
            if (m = a(x, p, b)(), m[0] === oa)
              return m;
            p = typeof m[1] == "number" ? m[1] : p + s;
          }
      }
      return f;
    }
  }
}
function uE(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [lE, e] : e == null ? qp : [e];
}
function Dl(e, t, n, r) {
  let i, o, s;
  typeof t == "function" && typeof n != "function" ? (o = void 0, s = t, i = n) : (o = t, s = n, i = r), Kp(e, o, a, i);
  function a(l, c) {
    const u = c[c.length - 1], d = u ? u.children.indexOf(l) : void 0;
    return s(l, d, u);
  }
}
const sa = {}.hasOwnProperty, dE = {};
function fE(e, t) {
  const n = t || dE, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = { ...YT, ...n.handlers }, a = {
    all: c,
    applyData: pE,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: o,
    footnoteOrder: [],
    handlers: s,
    one: l,
    options: n,
    patch: hE,
    wrap: gE
  };
  return Dl(e, function(u) {
    if (u.type === "definition" || u.type === "footnoteDefinition") {
      const d = u.type === "definition" ? r : i, h = String(u.identifier).toUpperCase();
      d.has(h) || d.set(h, u);
    }
  }), a;
  function l(u, d) {
    const h = u.type, f = a.handlers[h];
    if (sa.call(a.handlers, h) && f)
      return f(a, u, d);
    if (a.options.passThrough && a.options.passThrough.includes(h)) {
      if ("children" in u) {
        const { children: p, ...b } = u, v = eo(b);
        return v.children = a.all(u), v;
      }
      return eo(u);
    }
    return (a.options.unknownHandler || mE)(a, u, d);
  }
  function c(u) {
    const d = [];
    if ("children" in u) {
      const h = u.children;
      let f = -1;
      for (; ++f < h.length; ) {
        const m = a.one(h[f], u);
        if (m) {
          if (f && h[f - 1].type === "break" && (!Array.isArray(m) && m.type === "text" && (m.value = ad(m.value)), !Array.isArray(m) && m.type === "element")) {
            const p = m.children[0];
            p && p.type === "text" && (p.value = ad(p.value));
          }
          Array.isArray(m) ? d.push(...m) : d.push(m);
        }
      }
    }
    return d;
  }
}
function hE(e, t) {
  e.position && (t.position = tk(e));
}
function pE(e, t) {
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
    n.type === "element" && o && Object.assign(n.properties, eo(o)), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function mE(e, t) {
  const n = t.data || {}, r = "value" in t && !(sa.call(n, "hProperties") || sa.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function gE(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function ad(e) {
  let t = 0, n = e.charCodeAt(t);
  for (; n === 9 || n === 32; )
    t++, n = e.charCodeAt(t);
  return e.slice(t);
}
function ld(e, t) {
  const n = fE(e, t), r = n.one(e, void 0), i = nE(n), o = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && o.children.push({ type: "text", value: `
` }, i), o;
}
function yE(e, t) {
  return e && "run" in e ? async function(n, r) {
    const i = (
      /** @type {HastRoot} */
      ld(n, { file: r, ...t })
    );
    await e.run(i, r);
  } : function(n, r) {
    return (
      /** @type {HastRoot} */
      ld(n, { file: r, ...e || t })
    );
  };
}
function cd(e) {
  if (e)
    throw e;
}
var _i = Object.prototype.hasOwnProperty, Gp = Object.prototype.toString, ud = Object.defineProperty, dd = Object.getOwnPropertyDescriptor, fd = function(t) {
  return typeof Array.isArray == "function" ? Array.isArray(t) : Gp.call(t) === "[object Array]";
}, hd = function(t) {
  if (!t || Gp.call(t) !== "[object Object]")
    return !1;
  var n = _i.call(t, "constructor"), r = t.constructor && t.constructor.prototype && _i.call(t.constructor.prototype, "isPrototypeOf");
  if (t.constructor && !n && !r)
    return !1;
  var i;
  for (i in t)
    ;
  return typeof i > "u" || _i.call(t, i);
}, pd = function(t, n) {
  ud && n.name === "__proto__" ? ud(t, n.name, {
    enumerable: !0,
    configurable: !0,
    value: n.newValue,
    writable: !0
  }) : t[n.name] = n.newValue;
}, md = function(t, n) {
  if (n === "__proto__")
    if (_i.call(t, n)) {
      if (dd)
        return dd(t, n).value;
    } else return;
  return t[n];
}, vE = function e() {
  var t, n, r, i, o, s, a = arguments[0], l = 1, c = arguments.length, u = !1;
  for (typeof a == "boolean" && (u = a, a = arguments[1] || {}, l = 2), (a == null || typeof a != "object" && typeof a != "function") && (a = {}); l < c; ++l)
    if (t = arguments[l], t != null)
      for (n in t)
        r = md(a, n), i = md(t, n), a !== i && (u && i && (hd(i) || (o = fd(i))) ? (o ? (o = !1, s = r && fd(r) ? r : []) : s = r && hd(r) ? r : {}, pd(a, { name: n, newValue: e(u, s, i) })) : typeof i < "u" && pd(a, { name: n, newValue: i }));
  return a;
};
const ms = /* @__PURE__ */ xp(vE);
function aa(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function bE() {
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
      i = c, u ? xE(u, a)(...c) : s(null, ...c);
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
function xE(e, t) {
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
const Vt = { basename: wE, dirname: SE, extname: kE, join: CE, sep: "/" };
function wE(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  ui(e);
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
function SE(e) {
  if (ui(e), e.length === 0)
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
function kE(e) {
  ui(e);
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
function CE(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    ui(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : TE(n);
}
function TE(e) {
  ui(e);
  const t = e.codePointAt(0) === 47;
  let n = EE(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function EE(e, t) {
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
function ui(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const PE = { cwd: AE };
function AE() {
  return "/";
}
function la(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function RE(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!la(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return NE(e);
}
function NE(e) {
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
const gs = (
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
class Yp {
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
    t ? la(t) ? n = { path: t } : typeof t == "string" || IE(t) ? n = { value: t } : n = t : n = {}, this.cwd = "cwd" in n ? "" : PE.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < gs.length; ) {
      const o = gs[r];
      o in n && n[o] !== void 0 && n[o] !== null && (this[o] = o === "history" ? [...n[o]] : n[o]);
    }
    let i;
    for (i in n)
      gs.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? Vt.basename(this.path) : void 0;
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
    vs(t, "basename"), ys(t, "basename"), this.path = Vt.join(this.dirname || "", t);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? Vt.dirname(this.path) : void 0;
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
    gd(this.basename, "dirname"), this.path = Vt.join(t || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? Vt.extname(this.path) : void 0;
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
    if (ys(t, "extname"), gd(this.dirname, "extname"), t) {
      if (t.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = Vt.join(this.dirname, this.stem + (t || ""));
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
    la(t) && (t = RE(t)), vs(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? Vt.basename(this.path, this.extname) : void 0;
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
    vs(t, "stem"), ys(t, "stem"), this.path = Vt.join(this.dirname || "", t + (this.extname || ""));
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
function ys(e, t) {
  if (e && e.includes(Vt.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + Vt.sep + "`"
    );
}
function vs(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function gd(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function IE(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const DE = (
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
), ME = {}.hasOwnProperty;
class Ml extends DE {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = bE();
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
      new Ml()
    );
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return t.data(ms(!0, {}, this.namespace)), t;
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
    return typeof t == "string" ? arguments.length === 2 ? (ws("data", this.frozen), this.namespace[t] = n, this) : ME.call(this.namespace, t) && this.namespace[t] || void 0 : t ? (ws("data", this.frozen), this.namespace = t, this) : this.namespace;
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
    return bs("parse", r), r(String(n), n);
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
    return this.freeze(), bs("process", this.parser || this.Parser), xs("process", this.compiler || this.Compiler), n ? i(void 0, n) : new Promise(i);
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
        ), m = r.stringify(f, h);
        _E(m) ? h.value = m : h.result = m, c(
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
    return this.freeze(), bs("processSync", this.parser || this.Parser), xs("processSync", this.compiler || this.Compiler), this.process(t, i), vd("processSync", "process", n), r;
    function i(o, s) {
      n = !0, cd(o), r = s;
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
    yd(t), this.freeze();
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
    return this.run(t, n, o), vd("runSync", "run", r), i;
    function o(s, a) {
      cd(s), i = a, r = !0;
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
    return xs("stringify", i), yd(t), i(t, r);
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
    if (ws("use", this.frozen), t != null) if (typeof t == "function")
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
      a(c.plugins), c.settings && (i.settings = ms(!0, i.settings, c.settings));
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
        aa(p) && aa(f) && (f = ms(!0, p, f)), r[h] = [c, f, ...m];
      }
    }
  }
}
const OE = new Ml().freeze();
function bs(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function xs(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function ws(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function yd(e) {
  if (!aa(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function vd(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function ki(e) {
  return LE(e) ? e : new Yp(e);
}
function LE(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function _E(e) {
  return typeof e == "string" || FE(e);
}
function FE(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const VE = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", bd = [], xd = { allowDangerousHtml: !0 }, zE = /^(https?|ircs?|mailto|xmpp)$/i, BE = [
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
function $E(e) {
  const t = jE(e), n = UE(e);
  return HE(t.runSync(t.parse(n), n), e);
}
function jE(e) {
  const t = e.rehypePlugins || bd, n = e.remarkPlugins || bd, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...xd } : xd;
  return OE().use(kT).use(n).use(yE, r).use(t);
}
function UE(e) {
  const t = e.children || "", n = new Yp();
  return typeof t == "string" && (n.value = t), n;
}
function HE(e, t) {
  const n = t.allowedElements, r = t.allowElement, i = t.components, o = t.disallowedElements, s = t.skipHtml, a = t.unwrapDisallowed, l = t.urlTransform || WE;
  for (const u of BE)
    Object.hasOwn(t, u.from) && ("" + u.from + (u.to ? "use `" + u.to + "` instead" : "remove it") + VE + u.id, void 0);
  return t.className && (e = {
    type: "element",
    tagName: "div",
    properties: { className: t.className },
    // Assume no doctypes.
    children: (
      /** @type {Array<ElementContent>} */
      e.type === "root" ? e.children : [e]
    )
  }), Dl(e, c), sk(e, {
    Fragment: Wt,
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
      for (f in fs)
        if (Object.hasOwn(fs, f) && Object.hasOwn(u.properties, f)) {
          const m = u.properties[f], p = fs[f];
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
function WE(e) {
  const t = e.indexOf(":"), n = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    t === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && t > i || n !== -1 && t > n || r !== -1 && t > r || // It is a protocol, it should be allowed.
    zE.test(e.slice(0, t)) ? e : ""
  );
}
function wd(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
function qE(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function KE(e, t, n) {
  const i = Do((n || {}).ignore || []), o = GE(t);
  let s = -1;
  for (; ++s < o.length; )
    Kp(e, "text", a);
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
      const T = w.index, E = {
        index: w.index,
        input: w.input,
        stack: [...u, c]
      };
      let k = f(...w, E);
      if (typeof k == "string" && (k = k.length > 0 ? { type: "text", value: k } : void 0), k === !1 ? h.lastIndex = T + 1 : (m !== T && x.push({
        type: "text",
        value: c.value.slice(m, T)
      }), Array.isArray(k) ? x.push(...k) : k && x.push(k), m = T + w[0].length, v = !0), !h.global)
        break;
      w = h.exec(c.value);
    }
    return v ? (m < c.value.length && x.push({ type: "text", value: c.value.slice(m) }), d.children.splice(b, 1, ...x)) : x = [c], b + x.length;
  }
}
function GE(e) {
  const t = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const n = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    t.push([YE(i[0]), XE(i[1])]);
  }
  return t;
}
function YE(e) {
  return typeof e == "string" ? new RegExp(qE(e), "g") : e;
}
function XE(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const Ss = "phrasing", ks = ["autolink", "link", "image", "label"];
function ZE() {
  return {
    transforms: [iP],
    enter: {
      literalAutolink: QE,
      literalAutolinkEmail: Cs,
      literalAutolinkHttp: Cs,
      literalAutolinkWww: Cs
    },
    exit: {
      literalAutolink: rP,
      literalAutolinkEmail: nP,
      literalAutolinkHttp: eP,
      literalAutolinkWww: tP
    }
  };
}
function JE() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: Ss,
        notInConstruct: ks
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: Ss,
        notInConstruct: ks
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: Ss,
        notInConstruct: ks
      }
    ]
  };
}
function QE(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function Cs(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function eP(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function tP(e) {
  this.config.exit.data.call(this, e);
  const t = this.stack[this.stack.length - 1];
  t.type, t.url = "http://" + this.sliceSerialize(e);
}
function nP(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function rP(e) {
  this.exit(e);
}
function iP(e) {
  KE(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, oP],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), sP]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function oP(e, t, n, r, i) {
  let o = "";
  if (!Xp(i) || (/^w/i.test(t) && (n = t + n, t = "", o = "http://"), !aP(n)))
    return !1;
  const s = lP(n + r);
  if (!s[0]) return !1;
  const a = {
    type: "link",
    title: null,
    url: o + t + s[0],
    children: [{ type: "text", value: t + s[0] }]
  };
  return s[1] ? [a, { type: "text", value: s[1] }] : a;
}
function sP(e, t, n, r) {
  return (
    // Not an expected previous character.
    !Xp(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(n) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + t + "@" + n,
      children: [{ type: "text", value: t + "@" + n }]
    }
  );
}
function aP(e) {
  const t = e.split(".");
  return !(t.length < 2 || t[t.length - 1] && (/_/.test(t[t.length - 1]) || !/[a-zA-Z\d]/.test(t[t.length - 1])) || t[t.length - 2] && (/_/.test(t[t.length - 2]) || !/[a-zA-Z\d]/.test(t[t.length - 2])));
}
function lP(e) {
  const t = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!t)
    return [e, void 0];
  e = e.slice(0, t.index);
  let n = t[0], r = n.indexOf(")");
  const i = wd(e, "(");
  let o = wd(e, ")");
  for (; r !== -1 && i > o; )
    e += n.slice(0, r + 1), n = n.slice(r + 1), r = n.indexOf(")"), o++;
  return [e, n];
}
function Xp(e, t) {
  const n = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || _n(n) || Ro(n)) && // If it’s an email, the previous character should not be a slash.
  (!t || n !== 47);
}
Zp.peek = yP;
function cP() {
  this.buffer();
}
function uP(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function dP() {
  this.buffer();
}
function fP(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function hP(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = Ot(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function pP(e) {
  this.exit(e);
}
function mP(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = Ot(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function gP(e) {
  this.exit(e);
}
function yP() {
  return "[";
}
function Zp(e, t, n, r) {
  const i = n.createTracker(r);
  let o = i.move("[^");
  const s = n.enter("footnoteReference"), a = n.enter("reference");
  return o += i.move(
    n.safe(n.associationId(e), { after: "]", before: o })
  ), a(), s(), o += i.move("]"), o;
}
function vP() {
  return {
    enter: {
      gfmFootnoteCallString: cP,
      gfmFootnoteCall: uP,
      gfmFootnoteDefinitionLabelString: dP,
      gfmFootnoteDefinition: fP
    },
    exit: {
      gfmFootnoteCallString: hP,
      gfmFootnoteCall: pP,
      gfmFootnoteDefinitionLabelString: mP,
      gfmFootnoteDefinition: gP
    }
  };
}
function bP(e) {
  let t = !1;
  return e && e.firstLineBlank && (t = !0), {
    handlers: { footnoteDefinition: n, footnoteReference: Zp },
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
        t ? Jp : xP
      )
    )), c(), l;
  }
}
function xP(e, t, n) {
  return t === 0 ? e : Jp(e, t, n);
}
function Jp(e, t, n) {
  return (n ? "" : "    ") + e;
}
const wP = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
Qp.peek = EP;
function SP() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: CP },
    exit: { strikethrough: TP }
  };
}
function kP() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: wP
      }
    ],
    handlers: { delete: Qp }
  };
}
function CP(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function TP(e) {
  this.exit(e);
}
function Qp(e, t, n, r) {
  const i = n.createTracker(r), o = n.enter("strikethrough");
  let s = i.move("~~");
  return s += n.containerPhrasing(e, {
    ...i.current(),
    before: s,
    after: "~"
  }), s += i.move("~~"), o(), s;
}
function EP() {
  return "~";
}
function PP(e) {
  return e.length;
}
function AP(e, t) {
  const n = t || {}, r = (n.align || []).concat(), i = n.stringLength || PP, o = [], s = [], a = [], l = [];
  let c = 0, u = -1;
  for (; ++u < e.length; ) {
    const p = [], b = [];
    let v = -1;
    for (e[u].length > c && (c = e[u].length); ++v < e[u].length; ) {
      const x = RP(e[u][v]);
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
      o[d] = Sd(r[d]);
  else {
    const p = Sd(r);
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
      let w = "", T = "";
      if (n.alignDelimiters !== !1) {
        const E = l[d] - (b[d] || 0), k = o[d];
        k === 114 ? w = " ".repeat(E) : k === 99 ? E % 2 ? (w = " ".repeat(E / 2 + 0.5), T = " ".repeat(E / 2 - 0.5)) : (w = " ".repeat(E / 2), T = w) : T = " ".repeat(E);
      }
      n.delimiterStart !== !1 && !d && v.push("|"), n.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(n.alignDelimiters === !1 && x === "") && (n.delimiterStart !== !1 || d) && v.push(" "), n.alignDelimiters !== !1 && v.push(w), v.push(x), n.alignDelimiters !== !1 && v.push(T), n.padding !== !1 && v.push(" "), (n.delimiterEnd !== !1 || d !== c - 1) && v.push("|");
    }
    m.push(
      n.delimiterEnd === !1 ? v.join("").replace(/ +$/, "") : v.join("")
    );
  }
  return m.join(`
`);
}
function RP(e) {
  return e == null ? "" : String(e);
}
function Sd(e) {
  const t = typeof e == "string" ? e.codePointAt(0) : 0;
  return t === 67 || t === 99 ? 99 : t === 76 || t === 108 ? 108 : t === 82 || t === 114 ? 114 : 0;
}
function NP(e, t, n, r) {
  const i = n.enter("blockquote"), o = n.createTracker(r);
  o.move("> "), o.shift(2);
  const s = n.indentLines(
    n.containerFlow(e, o.current()),
    IP
  );
  return i(), s;
}
function IP(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function DP(e, t) {
  return kd(e, t.inConstruct, !0) && !kd(e, t.notInConstruct, !1);
}
function kd(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function Cd(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && DP(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function MP(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, o = 0, s = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++o > s && (s = o) : o = 1, i = r + t.length, r = n.indexOf(t, i);
  return s;
}
function OP(e, t) {
  return !!(t.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function LP(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function _P(e, t, n, r) {
  const i = LP(n), o = e.value || "", s = i === "`" ? "GraveAccent" : "Tilde";
  if (OP(e, n)) {
    const d = n.enter("codeIndented"), h = n.indentLines(o, FP);
    return d(), h;
  }
  const a = n.createTracker(r), l = i.repeat(Math.max(MP(o, i) + 1, 3)), c = n.enter("codeFenced");
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
function FP(e, t, n) {
  return (n ? "" : "    ") + e;
}
function Ol(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function VP(e, t, n, r) {
  const i = Ol(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("definition");
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
function zP(e) {
  const t = e.options.emphasis || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + t + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return t;
}
function Jr(e) {
  return "&#x" + e.toString(16).toUpperCase() + ";";
}
function to(e, t, n) {
  const r = cr(e), i = cr(t);
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
em.peek = BP;
function em(e, t, n, r) {
  const i = zP(n), o = n.enter("emphasis"), s = n.createTracker(r), a = s.move(i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = to(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Jr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = to(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Jr(d));
  const f = s.move(i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function BP(e, t, n) {
  return n.options.emphasis || "*";
}
function $P(e, t) {
  let n = !1;
  return Dl(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, oa;
  }), !!((!e.depth || e.depth < 3) && Tl(e) && (t.options.setext || n));
}
function jP(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), o = n.createTracker(r);
  if ($P(e, n)) {
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
  return /^[\t ]/.test(c) && (c = Jr(c.charCodeAt(0)) + c.slice(1)), c = c ? s + " " + c : s, n.options.closeAtx && (c += " " + s), l(), a(), c;
}
tm.peek = UP;
function tm(e) {
  return e.value || "";
}
function UP() {
  return "<";
}
nm.peek = HP;
function nm(e, t, n, r) {
  const i = Ol(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.enter("image");
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
function HP() {
  return "!";
}
rm.peek = WP;
function rm(e, t, n, r) {
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
function WP() {
  return "!";
}
im.peek = qP;
function im(e, t, n) {
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
function qP() {
  return "`";
}
function om(e, t) {
  const n = Tl(e);
  return !!(!t.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
sm.peek = KP;
function sm(e, t, n, r) {
  const i = Ol(n), o = i === '"' ? "Quote" : "Apostrophe", s = n.createTracker(r);
  let a, l;
  if (om(e, n)) {
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
function KP(e, t, n) {
  return om(e, n) ? "<" : "[";
}
am.peek = GP;
function am(e, t, n, r) {
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
function GP() {
  return "[";
}
function Ll(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function YP(e) {
  const t = Ll(e), n = e.options.bulletOther;
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
function XP(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function lm(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function ZP(e, t, n, r) {
  const i = n.enter("list"), o = n.bulletCurrent;
  let s = e.ordered ? XP(n) : Ll(n);
  const a = e.ordered ? s === "." ? ")" : "." : YP(n);
  let l = t && n.bulletLastUsed ? s === n.bulletLastUsed : !1;
  if (!e.ordered) {
    const u = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (s === "*" || s === "-") && // Empty first list item:
      u && (!u.children || !u.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (l = !0), lm(n) === s && u
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
function JP(e) {
  const t = e.options.listItemIndent || "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function QP(e, t, n, r) {
  const i = JP(n);
  let o = n.bulletCurrent || Ll(n);
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
function eA(e, t, n, r) {
  const i = n.enter("paragraph"), o = n.enter("phrasing"), s = n.containerPhrasing(e, r);
  return o(), i(), s;
}
const tA = (
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
function nA(e, t, n, r) {
  return (e.children.some(function(s) {
    return tA(s);
  }) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function rA(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
cm.peek = iA;
function cm(e, t, n, r) {
  const i = rA(n), o = n.enter("strong"), s = n.createTracker(r), a = s.move(i + i);
  let l = s.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...s.current()
    })
  );
  const c = l.charCodeAt(0), u = to(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = Jr(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), h = to(r.after.charCodeAt(0), d, i);
  h.inside && (l = l.slice(0, -1) + Jr(d));
  const f = s.move(i + i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: h.outside,
    before: u.outside
  }, a + l + f;
}
function iA(e, t, n) {
  return n.options.strong || "*";
}
function oA(e, t, n, r) {
  return n.safe(e.value, r);
}
function sA(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function aA(e, t, n) {
  const r = (lm(n) + (n.options.ruleSpaces ? " " : "")).repeat(sA(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const um = {
  blockquote: NP,
  break: Cd,
  code: _P,
  definition: VP,
  emphasis: em,
  hardBreak: Cd,
  heading: jP,
  html: tm,
  image: nm,
  imageReference: rm,
  inlineCode: im,
  link: sm,
  linkReference: am,
  list: ZP,
  listItem: QP,
  paragraph: eA,
  root: nA,
  strong: cm,
  text: oA,
  thematicBreak: aA
};
function lA() {
  return {
    enter: {
      table: cA,
      tableData: Td,
      tableHeader: Td,
      tableRow: dA
    },
    exit: {
      codeText: fA,
      table: uA,
      tableData: Ts,
      tableHeader: Ts,
      tableRow: Ts
    }
  };
}
function cA(e) {
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
function uA(e) {
  this.exit(e), this.data.inTable = void 0;
}
function dA(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function Ts(e) {
  this.exit(e);
}
function Td(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function fA(e) {
  let t = this.resume();
  this.data.inTable && (t = t.replace(/\\([\\|])/g, hA));
  const n = this.stack[this.stack.length - 1];
  n.type, n.value = t, this.exit(e);
}
function hA(e, t) {
  return t === "|" ? t : e;
}
function pA(e) {
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
    return AP(f, {
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
    let b = um.inlineCode(f, m, p);
    return p.stack.includes("tableCell") && (b = b.replace(/\|/g, "\\$&")), b;
  }
}
function mA() {
  return {
    exit: {
      taskListCheckValueChecked: Ed,
      taskListCheckValueUnchecked: Ed,
      paragraph: yA
    }
  };
}
function gA() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: vA }
  };
}
function Ed(e) {
  const t = this.stack[this.stack.length - 2];
  t.type, t.checked = e.type === "taskListCheckValueChecked";
}
function yA(e) {
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
function vA(e, t, n, r) {
  const i = e.children[0], o = typeof e.checked == "boolean" && i && i.type === "paragraph", s = "[" + (e.checked ? "x" : " ") + "] ", a = n.createTracker(r);
  o && a.move(s);
  let l = um.listItem(e, t, n, {
    ...r,
    ...a.current()
  });
  return o && (l = l.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, c)), l;
  function c(u) {
    return u + s;
  }
}
function bA() {
  return [
    ZE(),
    vP(),
    SP(),
    lA(),
    mA()
  ];
}
function xA(e) {
  return {
    extensions: [
      JE(),
      bP(e),
      kP(),
      pA(e),
      gA()
    ]
  };
}
const wA = {
  tokenize: PA,
  partial: !0
}, dm = {
  tokenize: AA,
  partial: !0
}, fm = {
  tokenize: RA,
  partial: !0
}, hm = {
  tokenize: NA,
  partial: !0
}, SA = {
  tokenize: IA,
  partial: !0
}, pm = {
  name: "wwwAutolink",
  tokenize: TA,
  previous: gm
}, mm = {
  name: "protocolAutolink",
  tokenize: EA,
  previous: ym
}, ln = {
  name: "emailAutolink",
  tokenize: CA,
  previous: vm
}, Kt = {};
function kA() {
  return {
    text: Kt
  };
}
let An = 48;
for (; An < 123; )
  Kt[An] = ln, An++, An === 58 ? An = 65 : An === 91 && (An = 97);
Kt[43] = ln;
Kt[45] = ln;
Kt[46] = ln;
Kt[95] = ln;
Kt[72] = [ln, mm];
Kt[104] = [ln, mm];
Kt[87] = [ln, pm];
Kt[119] = [ln, pm];
function CA(e, t, n) {
  const r = this;
  let i, o;
  return s;
  function s(d) {
    return !ca(d) || !vm.call(r, r.previous) || _l(r.events) ? n(d) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), a(d));
  }
  function a(d) {
    return ca(d) ? (e.consume(d), a) : d === 64 ? (e.consume(d), l) : n(d);
  }
  function l(d) {
    return d === 46 ? e.check(SA, u, c)(d) : d === 45 || d === 95 || rt(d) ? (o = !0, e.consume(d), l) : u(d);
  }
  function c(d) {
    return e.consume(d), i = !0, l;
  }
  function u(d) {
    return o && i && lt(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), t(d)) : n(d);
  }
}
function TA(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return s !== 87 && s !== 119 || !gm.call(r, r.previous) || _l(r.events) ? n(s) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(wA, e.attempt(dm, e.attempt(fm, o), n), n)(s));
  }
  function o(s) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), t(s);
  }
}
function EA(e, t, n) {
  const r = this;
  let i = "", o = !1;
  return s;
  function s(d) {
    return (d === 72 || d === 104) && ym.call(r, r.previous) && !_l(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(d), e.consume(d), a) : n(d);
  }
  function a(d) {
    if (lt(d) && i.length < 5)
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
    return d === null || Ji(d) || Ae(d) || _n(d) || Ro(d) ? n(d) : e.attempt(dm, e.attempt(fm, u), n)(d);
  }
  function u(d) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), t(d);
  }
}
function PA(e, t, n) {
  let r = 0;
  return i;
  function i(s) {
    return (s === 87 || s === 119) && r < 3 ? (r++, e.consume(s), i) : s === 46 && r === 3 ? (e.consume(s), o) : n(s);
  }
  function o(s) {
    return s === null ? n(s) : t(s);
  }
}
function AA(e, t, n) {
  let r, i, o;
  return s;
  function s(c) {
    return c === 46 || c === 95 ? e.check(hm, l, a)(c) : c === null || Ae(c) || _n(c) || c !== 45 && Ro(c) ? l(c) : (o = !0, e.consume(c), s);
  }
  function a(c) {
    return c === 95 ? r = !0 : (i = r, r = void 0), e.consume(c), s;
  }
  function l(c) {
    return i || r || !o ? n(c) : t(c);
  }
}
function RA(e, t) {
  let n = 0, r = 0;
  return i;
  function i(s) {
    return s === 40 ? (n++, e.consume(s), i) : s === 41 && r < n ? o(s) : s === 33 || s === 34 || s === 38 || s === 39 || s === 41 || s === 42 || s === 44 || s === 46 || s === 58 || s === 59 || s === 60 || s === 63 || s === 93 || s === 95 || s === 126 ? e.check(hm, t, o)(s) : s === null || Ae(s) || _n(s) ? t(s) : (e.consume(s), i);
  }
  function o(s) {
    return s === 41 && r++, e.consume(s), i;
  }
}
function NA(e, t, n) {
  return r;
  function r(a) {
    return a === 33 || a === 34 || a === 39 || a === 41 || a === 42 || a === 44 || a === 46 || a === 58 || a === 59 || a === 63 || a === 95 || a === 126 ? (e.consume(a), r) : a === 38 ? (e.consume(a), o) : a === 93 ? (e.consume(a), i) : (
      // `<` is an end.
      a === 60 || // So is whitespace.
      a === null || Ae(a) || _n(a) ? t(a) : n(a)
    );
  }
  function i(a) {
    return a === null || a === 40 || a === 91 || Ae(a) || _n(a) ? t(a) : r(a);
  }
  function o(a) {
    return lt(a) ? s(a) : n(a);
  }
  function s(a) {
    return a === 59 ? (e.consume(a), r) : lt(a) ? (e.consume(a), s) : n(a);
  }
}
function IA(e, t, n) {
  return r;
  function r(o) {
    return e.consume(o), i;
  }
  function i(o) {
    return rt(o) ? n(o) : t(o);
  }
}
function gm(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || Ae(e);
}
function ym(e) {
  return !lt(e);
}
function vm(e) {
  return !(e === 47 || ca(e));
}
function ca(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || rt(e);
}
function _l(e) {
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
const DA = {
  tokenize: BA,
  partial: !0
};
function MA() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: FA,
        continuation: {
          tokenize: VA
        },
        exit: zA
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: _A
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: OA,
        resolveTo: LA
      }
    }
  };
}
function OA(e, t, n) {
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
    const c = Ot(r.sliceSerialize({
      start: s.end,
      end: r.now()
    }));
    return c.codePointAt(0) !== 94 || !o.includes(c.slice(1)) ? n(l) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(l), e.exit("gfmFootnoteCallLabelMarker"), t(l));
  }
}
function LA(e, t) {
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
function _A(e, t, n) {
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
      d === null || d === 91 || Ae(d)
    )
      return n(d);
    if (d === 93) {
      e.exit("chunkString");
      const h = e.exit("gfmFootnoteCallString");
      return i.includes(Ot(r.sliceSerialize(h))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), t) : n(d);
    }
    return Ae(d) || (s = !0), o++, e.consume(d), d === 92 ? u : c;
  }
  function u(d) {
    return d === 91 || d === 92 || d === 93 ? (e.consume(d), o++, c) : c(d);
  }
}
function FA(e, t, n) {
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
      m === null || m === 91 || Ae(m)
    )
      return n(m);
    if (m === 93) {
      e.exit("chunkString");
      const p = e.exit("gfmFootnoteDefinitionLabelString");
      return o = Ot(r.sliceSerialize(p)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), h;
    }
    return Ae(m) || (a = !0), s++, e.consume(m), m === 92 ? d : u;
  }
  function d(m) {
    return m === 91 || m === 92 || m === 93 ? (e.consume(m), s++, u) : u(m);
  }
  function h(m) {
    return m === 58 ? (e.enter("definitionMarker"), e.consume(m), e.exit("definitionMarker"), i.includes(o) || i.push(o), xe(e, f, "gfmFootnoteDefinitionWhitespace")) : n(m);
  }
  function f(m) {
    return t(m);
  }
}
function VA(e, t, n) {
  return e.check(ci, t, e.attempt(DA, t, n));
}
function zA(e) {
  e.exit("gfmFootnoteDefinition");
}
function BA(e, t, n) {
  const r = this;
  return xe(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "gfmFootnoteDefinitionIndent" && s[2].sliceSerialize(s[1], !0).length === 4 ? t(o) : n(o);
  }
}
function $A(e) {
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
    function h(m) {
      return c === 126 && u[u.length - 1][1].type !== "characterEscape" ? l(m) : (s.enter("strikethroughSequenceTemporary"), f(m));
    }
    function f(m) {
      const p = cr(c);
      if (m === 126)
        return d > 1 ? l(m) : (s.consume(m), d++, f);
      if (d < 2 && !n) return l(m);
      const b = s.exit("strikethroughSequenceTemporary"), v = cr(m);
      return b._open = !v || v === 2 && !!p, b._close = !p || p === 2 && !!v, a(m);
    }
  }
}
class jA {
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
    UA(this, t, n, r);
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
function UA(e, t, n, r) {
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
function HA(e, t) {
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
function WA() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: qA,
        resolveAll: KA
      }
    }
  };
}
function qA(e, t, n) {
  const r = this;
  let i = 0, o = 0, s;
  return a;
  function a(P) {
    let I = r.events.length - 1;
    for (; I > -1; ) {
      const j = r.events[I][1].type;
      if (j === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      j === "linePrefix") I--;
      else break;
    }
    const R = I > -1 ? r.events[I][1].type : null, z = R === "tableHead" || R === "tableRow" ? k : l;
    return z === k && r.parser.lazy[r.now().line] ? n(P) : z(P);
  }
  function l(P) {
    return e.enter("tableHead"), e.enter("tableRow"), c(P);
  }
  function c(P) {
    return P === 124 || (s = !0, o += 1), u(P);
  }
  function u(P) {
    return P === null ? n(P) : Z(P) ? o > 1 ? (o = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(P), e.exit("lineEnding"), f) : n(P) : pe(P) ? xe(e, u, "whitespace")(P) : (o += 1, s && (s = !1, i += 1), P === 124 ? (e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), s = !0, u) : (e.enter("data"), d(P)));
  }
  function d(P) {
    return P === null || P === 124 || Ae(P) ? (e.exit("data"), u(P)) : (e.consume(P), P === 92 ? h : d);
  }
  function h(P) {
    return P === 92 || P === 124 ? (e.consume(P), d) : d(P);
  }
  function f(P) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? n(P) : (e.enter("tableDelimiterRow"), s = !1, pe(P) ? xe(e, m, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(P) : m(P));
  }
  function m(P) {
    return P === 45 || P === 58 ? b(P) : P === 124 ? (s = !0, e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), p) : E(P);
  }
  function p(P) {
    return pe(P) ? xe(e, b, "whitespace")(P) : b(P);
  }
  function b(P) {
    return P === 58 ? (o += 1, s = !0, e.enter("tableDelimiterMarker"), e.consume(P), e.exit("tableDelimiterMarker"), v) : P === 45 ? (o += 1, v(P)) : P === null || Z(P) ? T(P) : E(P);
  }
  function v(P) {
    return P === 45 ? (e.enter("tableDelimiterFiller"), x(P)) : E(P);
  }
  function x(P) {
    return P === 45 ? (e.consume(P), x) : P === 58 ? (s = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(P), e.exit("tableDelimiterMarker"), w) : (e.exit("tableDelimiterFiller"), w(P));
  }
  function w(P) {
    return pe(P) ? xe(e, T, "whitespace")(P) : T(P);
  }
  function T(P) {
    return P === 124 ? m(P) : P === null || Z(P) ? !s || i !== o ? E(P) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), t(P)) : E(P);
  }
  function E(P) {
    return n(P);
  }
  function k(P) {
    return e.enter("tableRow"), A(P);
  }
  function A(P) {
    return P === 124 ? (e.enter("tableCellDivider"), e.consume(P), e.exit("tableCellDivider"), A) : P === null || Z(P) ? (e.exit("tableRow"), t(P)) : pe(P) ? xe(e, A, "whitespace")(P) : (e.enter("data"), D(P));
  }
  function D(P) {
    return P === null || P === 124 || Ae(P) ? (e.exit("data"), A(P)) : (e.consume(P), P === 92 ? F : D);
  }
  function F(P) {
    return P === 92 || P === 124 ? (e.consume(P), D) : D(P);
  }
}
function KA(e, t) {
  let n = -1, r = !0, i = 0, o = [0, 0, 0, 0], s = [0, 0, 0, 0], a = !1, l = 0, c, u, d;
  const h = new jA();
  for (; ++n < e.length; ) {
    const f = e[n], m = f[1];
    f[0] === "enter" ? m.type === "tableHead" ? (a = !1, l !== 0 && (Pd(h, t, l, c, u), u = void 0, l = 0), c = {
      type: "table",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, h.add(n, 0, [["enter", c, t]])) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (r = !0, d = void 0, o = [0, 0, 0, 0], s = [0, n + 1, 0, 0], a && (a = !1, u = {
      type: "tableBody",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, h.add(n, 0, [["enter", u, t]])), i = m.type === "tableDelimiterRow" ? 2 : u ? 3 : 1) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") ? (r = !1, s[2] === 0 && (o[1] !== 0 && (s[0] = s[1], d = Ci(h, t, o, i, void 0, d), o = [0, 0, 0, 0]), s[2] = n)) : m.type === "tableCellDivider" && (r ? r = !1 : (o[1] !== 0 && (s[0] = s[1], d = Ci(h, t, o, i, void 0, d)), o = s, s = [o[1], n, 0, 0])) : m.type === "tableHead" ? (a = !0, l = n) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (l = n, o[1] !== 0 ? (s[0] = s[1], d = Ci(h, t, o, i, n, d)) : s[1] !== 0 && (d = Ci(h, t, s, i, n, d)), i = 0) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") && (s[3] = n);
  }
  for (l !== 0 && Pd(h, t, l, c, u), h.consume(t.events), n = -1; ++n < t.events.length; ) {
    const f = t.events[n];
    f[0] === "enter" && f[1].type === "table" && (f[1]._align = HA(t.events, n));
  }
  return e;
}
function Ci(e, t, n, r, i, o) {
  const s = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", a = "tableContent";
  n[0] !== 0 && (o.end = Object.assign({}, Xn(t.events, n[0])), e.add(n[0], 0, [["exit", o, t]]));
  const l = Xn(t.events, n[1]);
  if (o = {
    type: s,
    start: Object.assign({}, l),
    // Note: correct end is set later.
    end: Object.assign({}, l)
  }, e.add(n[1], 0, [["enter", o, t]]), n[2] !== 0) {
    const c = Xn(t.events, n[2]), u = Xn(t.events, n[3]), d = {
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
  return i !== void 0 && (o.end = Object.assign({}, Xn(t.events, i)), e.add(i, 0, [["exit", o, t]]), o = void 0), o;
}
function Pd(e, t, n, r, i) {
  const o = [], s = Xn(t.events, n);
  i && (i.end = Object.assign({}, s), o.push(["exit", i, t])), r.end = Object.assign({}, s), o.push(["exit", r, t]), e.add(n + 1, 0, o);
}
function Xn(e, t) {
  const n = e[t], r = n[0] === "enter" ? "start" : "end";
  return n[1][r];
}
const GA = {
  name: "tasklistCheck",
  tokenize: XA
};
function YA() {
  return {
    text: {
      91: GA
    }
  };
}
function XA(e, t, n) {
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
    return Ae(l) ? (e.enter("taskListCheckValueUnchecked"), e.consume(l), e.exit("taskListCheckValueUnchecked"), s) : l === 88 || l === 120 ? (e.enter("taskListCheckValueChecked"), e.consume(l), e.exit("taskListCheckValueChecked"), s) : n(l);
  }
  function s(l) {
    return l === 93 ? (e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), e.exit("taskListCheck"), a) : n(l);
  }
  function a(l) {
    return Z(l) ? t(l) : pe(l) ? e.check({
      tokenize: ZA
    }, t, n)(l) : n(l);
  }
}
function ZA(e, t, n) {
  return xe(e, r, "whitespace");
  function r(i) {
    return i === null ? n(i) : t(i);
  }
}
function JA(e) {
  return Ap([
    kA(),
    MA(),
    $A(e),
    WA(),
    YA()
  ]);
}
const QA = {};
function eR(e) {
  const t = (
    /** @type {Processor<Root>} */
    this
  ), n = e || QA, r = t.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), o = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), s = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(JA(n)), o.push(bA()), s.push(xA(n));
}
var tR = (e) => {
  switch (e) {
    case "success":
      return iR;
    case "info":
      return sR;
    case "warning":
      return oR;
    case "error":
      return aR;
    default:
      return null;
  }
}, nR = Array(12).fill(0), rR = ({ visible: e, className: t }) => U.createElement("div", { className: ["sonner-loading-wrapper", t].filter(Boolean).join(" "), "data-visible": e }, U.createElement("div", { className: "sonner-spinner" }, nR.map((n, r) => U.createElement("div", { className: "sonner-loading-bar", key: `spinner-bar-${r}` })))), iR = U.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, U.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })), oR = U.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", height: "20", width: "20" }, U.createElement("path", { fillRule: "evenodd", d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z", clipRule: "evenodd" })), sR = U.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, U.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z", clipRule: "evenodd" })), aR = U.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", height: "20", width: "20" }, U.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z", clipRule: "evenodd" })), lR = U.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, U.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), U.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })), cR = () => {
  let [e, t] = U.useState(document.hidden);
  return U.useEffect(() => {
    let n = () => {
      t(document.hidden);
    };
    return document.addEventListener("visibilitychange", n), () => window.removeEventListener("visibilitychange", n);
  }, []), e;
}, ua = 1, uR = class {
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
      let { message: n, ...r } = e, i = typeof (e == null ? void 0 : e.id) == "number" || ((t = e.id) == null ? void 0 : t.length) > 0 ? e.id : ua++, o = this.toasts.find((a) => a.id === i), s = e.dismissible === void 0 ? !0 : e.dismissible;
      return this.dismissedToasts.has(i) && this.dismissedToasts.delete(i), o ? this.toasts = this.toasts.map((a) => a.id === i ? (this.publish({ ...a, ...e, id: i, title: n }), { ...a, ...e, id: i, dismissible: s, title: n }) : a) : this.addToast({ title: n, ...r, dismissible: s, id: i }), i;
    }, this.dismiss = (e) => (this.dismissedToasts.add(e), e || this.toasts.forEach((t) => {
      this.subscribers.forEach((n) => n({ id: t.id, dismiss: !0 }));
    }), this.subscribers.forEach((t) => t({ id: e, dismiss: !0 })), e), this.message = (e, t) => this.create({ ...t, message: e }), this.error = (e, t) => this.create({ ...t, message: e, type: "error" }), this.success = (e, t) => this.create({ ...t, type: "success", message: e }), this.info = (e, t) => this.create({ ...t, type: "info", message: e }), this.warning = (e, t) => this.create({ ...t, type: "warning", message: e }), this.loading = (e, t) => this.create({ ...t, type: "loading", message: e }), this.promise = (e, t) => {
      if (!t) return;
      let n;
      t.loading !== void 0 && (n = this.create({ ...t, promise: e, type: "loading", message: t.loading, description: typeof t.description != "function" ? t.description : void 0 }));
      let r = e instanceof Promise ? e : e(), i = n !== void 0, o, s = r.then(async (l) => {
        if (o = ["resolve", l], U.isValidElement(l)) i = !1, this.create({ id: n, type: "default", message: l });
        else if (fR(l) && !l.ok) {
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
      let n = (t == null ? void 0 : t.id) || ua++;
      return this.create({ jsx: e(n), id: n, ...t }), n;
    }, this.getActiveToasts = () => this.toasts.filter((e) => !this.dismissedToasts.has(e.id)), this.subscribers = [], this.toasts = [], this.dismissedToasts = /* @__PURE__ */ new Set();
  }
}, ft = new uR(), dR = (e, t) => {
  let n = (t == null ? void 0 : t.id) || ua++;
  return ft.addToast({ title: e, ...t, id: n }), n;
}, fR = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", hR = dR, pR = () => ft.toasts, mR = () => ft.getActiveToasts(), Ad = Object.assign(hR, { success: ft.success, info: ft.info, warning: ft.warning, error: ft.error, custom: ft.custom, message: ft.message, promise: ft.promise, dismiss: ft.dismiss, loading: ft.loading }, { getHistory: pR, getToasts: mR });
function gR(e, { insertAt: t } = {}) {
  if (typeof document > "u") return;
  let n = document.head || document.getElementsByTagName("head")[0], r = document.createElement("style");
  r.type = "text/css", t === "top" && n.firstChild ? n.insertBefore(r, n.firstChild) : n.appendChild(r), r.styleSheet ? r.styleSheet.cssText = e : r.appendChild(document.createTextNode(e));
}
gR(`:where(html[dir="ltr"]),:where([data-sonner-toaster][dir="ltr"]){--toast-icon-margin-start: -3px;--toast-icon-margin-end: 4px;--toast-svg-margin-start: -1px;--toast-svg-margin-end: 0px;--toast-button-margin-start: auto;--toast-button-margin-end: 0;--toast-close-button-start: 0;--toast-close-button-end: unset;--toast-close-button-transform: translate(-35%, -35%)}:where(html[dir="rtl"]),:where([data-sonner-toaster][dir="rtl"]){--toast-icon-margin-start: 4px;--toast-icon-margin-end: -3px;--toast-svg-margin-start: 0px;--toast-svg-margin-end: -1px;--toast-button-margin-start: 0;--toast-button-margin-end: auto;--toast-close-button-start: unset;--toast-close-button-end: 0;--toast-close-button-transform: translate(35%, -35%)}:where([data-sonner-toaster]){position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1: hsl(0, 0%, 99%);--gray2: hsl(0, 0%, 97.3%);--gray3: hsl(0, 0%, 95.1%);--gray4: hsl(0, 0%, 93%);--gray5: hsl(0, 0%, 90.9%);--gray6: hsl(0, 0%, 88.7%);--gray7: hsl(0, 0%, 85.8%);--gray8: hsl(0, 0%, 78%);--gray9: hsl(0, 0%, 56.1%);--gray10: hsl(0, 0%, 52.3%);--gray11: hsl(0, 0%, 43.5%);--gray12: hsl(0, 0%, 9%);--border-radius: 8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:none;z-index:999999999;transition:transform .4s ease}:where([data-sonner-toaster][data-lifted="true"]){transform:translateY(-10px)}@media (hover: none) and (pointer: coarse){:where([data-sonner-toaster][data-lifted="true"]){transform:none}}:where([data-sonner-toaster][data-x-position="right"]){right:var(--offset-right)}:where([data-sonner-toaster][data-x-position="left"]){left:var(--offset-left)}:where([data-sonner-toaster][data-x-position="center"]){left:50%;transform:translate(-50%)}:where([data-sonner-toaster][data-y-position="top"]){top:var(--offset-top)}:where([data-sonner-toaster][data-y-position="bottom"]){bottom:var(--offset-bottom)}:where([data-sonner-toast]){--y: translateY(100%);--lift-amount: calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);filter:blur(0);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:none;overflow-wrap:anywhere}:where([data-sonner-toast][data-styled="true"]){padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px #0000001a;width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}:where([data-sonner-toast]:focus-visible){box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast][data-y-position="top"]){top:0;--y: translateY(-100%);--lift: 1;--lift-amount: calc(1 * var(--gap))}:where([data-sonner-toast][data-y-position="bottom"]){bottom:0;--y: translateY(100%);--lift: -1;--lift-amount: calc(var(--lift) * var(--gap))}:where([data-sonner-toast]) :where([data-description]){font-weight:400;line-height:1.4;color:inherit}:where([data-sonner-toast]) :where([data-title]){font-weight:500;line-height:1.5;color:inherit}:where([data-sonner-toast]) :where([data-icon]){display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}:where([data-sonner-toast][data-promise="true"]) :where([data-icon])>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}:where([data-sonner-toast]) :where([data-icon])>*{flex-shrink:0}:where([data-sonner-toast]) :where([data-icon]) svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}:where([data-sonner-toast]) :where([data-content]){display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;cursor:pointer;outline:none;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}:where([data-sonner-toast]) :where([data-button]):focus-visible{box-shadow:0 0 0 2px #0006}:where([data-sonner-toast]) :where([data-button]):first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}:where([data-sonner-toast]) :where([data-cancel]){color:var(--normal-text);background:rgba(0,0,0,.08)}:where([data-sonner-toast][data-theme="dark"]) :where([data-cancel]){background:rgba(255,255,255,.3)}:where([data-sonner-toast]) :where([data-close-button]){position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast] [data-close-button]{background:var(--gray1)}:where([data-sonner-toast]) :where([data-close-button]):focus-visible{box-shadow:0 4px 12px #0000001a,0 0 0 2px #0003}:where([data-sonner-toast]) :where([data-disabled="true"]){cursor:not-allowed}:where([data-sonner-toast]):hover :where([data-close-button]):hover{background:var(--gray2);border-color:var(--gray5)}:where([data-sonner-toast][data-swiping="true"]):before{content:"";position:absolute;left:-50%;right:-50%;height:100%;z-index:-1}:where([data-sonner-toast][data-y-position="top"][data-swiping="true"]):before{bottom:50%;transform:scaleY(3) translateY(50%)}:where([data-sonner-toast][data-y-position="bottom"][data-swiping="true"]):before{top:50%;transform:scaleY(3) translateY(-50%)}:where([data-sonner-toast][data-swiping="false"][data-removed="true"]):before{content:"";position:absolute;inset:0;transform:scaleY(2)}:where([data-sonner-toast]):after{content:"";position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}:where([data-sonner-toast][data-mounted="true"]){--y: translateY(0);opacity:1}:where([data-sonner-toast][data-expanded="false"][data-front="false"]){--scale: var(--toasts-before) * .05 + 1;--y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}:where([data-sonner-toast])>*{transition:opacity .4s}:where([data-sonner-toast][data-expanded="false"][data-front="false"][data-styled="true"])>*{opacity:0}:where([data-sonner-toast][data-visible="false"]){opacity:0;pointer-events:none}:where([data-sonner-toast][data-mounted="true"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}:where([data-sonner-toast][data-removed="true"][data-front="true"][data-swipe-out="false"]){--y: translateY(calc(var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="true"]){--y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}:where([data-sonner-toast][data-removed="true"][data-front="false"][data-swipe-out="false"][data-expanded="false"]){--y: translateY(40%);opacity:0;transition:transform .5s,opacity .2s}:where([data-sonner-toast][data-removed="true"][data-front="false"]):before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y, 0px)) translate(var(--swipe-amount-x, 0px));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{0%{transform:var(--y) translate(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translate(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{0%{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width: 600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-theme=light]{--normal-bg: #fff;--normal-border: var(--gray4);--normal-text: var(--gray12);--success-bg: hsl(143, 85%, 96%);--success-border: hsl(145, 92%, 91%);--success-text: hsl(140, 100%, 27%);--info-bg: hsl(208, 100%, 97%);--info-border: hsl(221, 91%, 91%);--info-text: hsl(210, 92%, 45%);--warning-bg: hsl(49, 100%, 97%);--warning-border: hsl(49, 91%, 91%);--warning-text: hsl(31, 92%, 45%);--error-bg: hsl(359, 100%, 97%);--error-border: hsl(359, 100%, 94%);--error-text: hsl(360, 100%, 45%)}[data-sonner-toaster][data-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg: #000;--normal-border: hsl(0, 0%, 20%);--normal-text: var(--gray1)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg: #fff;--normal-border: var(--gray3);--normal-text: var(--gray12)}[data-sonner-toaster][data-theme=dark]{--normal-bg: #000;--normal-bg-hover: hsl(0, 0%, 12%);--normal-border: hsl(0, 0%, 20%);--normal-border-hover: hsl(0, 0%, 25%);--normal-text: var(--gray1);--success-bg: hsl(150, 100%, 6%);--success-border: hsl(147, 100%, 12%);--success-text: hsl(150, 86%, 65%);--info-bg: hsl(215, 100%, 6%);--info-border: hsl(223, 100%, 12%);--info-text: hsl(216, 87%, 65%);--warning-bg: hsl(64, 100%, 6%);--warning-border: hsl(60, 100%, 12%);--warning-text: hsl(46, 87%, 65%);--error-bg: hsl(358, 76%, 10%);--error-border: hsl(357, 89%, 16%);--error-text: hsl(358, 100%, 81%)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success],[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info],[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning],[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error],[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size: 16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:nth-child(1){animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}to{opacity:.15}}@media (prefers-reduced-motion){[data-sonner-toast],[data-sonner-toast]>*,.sonner-loading-bar{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}
`);
function Ti(e) {
  return e.label !== void 0;
}
var yR = 3, vR = "32px", bR = "16px", Rd = 4e3, xR = 356, wR = 14, SR = 20, kR = 200;
function It(...e) {
  return e.filter(Boolean).join(" ");
}
function CR(e) {
  let [t, n] = e.split("-"), r = [];
  return t && r.push(t), n && r.push(n), r;
}
var TR = (e) => {
  var t, n, r, i, o, s, a, l, c, u, d;
  let { invert: h, toast: f, unstyled: m, interacting: p, setHeights: b, visibleToasts: v, heights: x, index: w, toasts: T, expanded: E, removeToast: k, defaultRichColors: A, closeButton: D, style: F, cancelButtonStyle: P, actionButtonStyle: I, className: R = "", descriptionClassName: z = "", duration: j, position: W, gap: V, loadingIcon: N, expandByDefault: _, classNames: L, icons: S, closeButtonAriaLabel: te = "Close toast", pauseWhenPageIsHidden: X } = e, [C, J] = U.useState(null), [q, K] = U.useState(null), [B, G] = U.useState(!1), [ge, re] = U.useState(!1), [oe, de] = U.useState(!1), [je, Ke] = U.useState(!1), [wt, ct] = U.useState(!1), [mt, Yt] = U.useState(0), [Et, Xt] = U.useState(0), Zt = U.useRef(f.duration || j || Rd), Wn = U.useRef(null), Pt = U.useRef(null), Pr = w === 0, Ar = w + 1 <= v, M = f.type, H = f.dismissible !== !1, ie = f.className || "", fe = f.descriptionClassName || "", ye = U.useMemo(() => x.findIndex((ne) => ne.toastId === f.id) || 0, [x, f.id]), ot = U.useMemo(() => {
    var ne;
    return (ne = f.closeButton) != null ? ne : D;
  }, [f.closeButton, D]), St = U.useMemo(() => f.duration || j || Rd, [f.duration, j]), st = U.useRef(0), at = U.useRef(0), At = U.useRef(0), Le = U.useRef(null), [Rt, ut] = W.split("-"), Q = U.useMemo(() => x.reduce((ne, ve, be) => be >= ye ? ne : ne + ve.height, 0), [x, ye]), ae = cR(), Te = f.invert || h, Ce = M === "loading";
  at.current = U.useMemo(() => ye * V + Q, [ye, Q]), U.useEffect(() => {
    Zt.current = St;
  }, [St]), U.useEffect(() => {
    G(!0);
  }, []), U.useEffect(() => {
    let ne = Pt.current;
    if (ne) {
      let ve = ne.getBoundingClientRect().height;
      return Xt(ve), b((be) => [{ toastId: f.id, height: ve, position: f.position }, ...be]), () => b((be) => be.filter((Ze) => Ze.toastId !== f.id));
    }
  }, [b, f.id]), U.useLayoutEffect(() => {
    if (!B) return;
    let ne = Pt.current, ve = ne.style.height;
    ne.style.height = "auto";
    let be = ne.getBoundingClientRect().height;
    ne.style.height = ve, Xt(be), b((Ze) => Ze.find((Ge) => Ge.toastId === f.id) ? Ze.map((Ge) => Ge.toastId === f.id ? { ...Ge, height: be } : Ge) : [{ toastId: f.id, height: be, position: f.position }, ...Ze]);
  }, [B, f.title, f.description, b, f.id]);
  let Oe = U.useCallback(() => {
    re(!0), Yt(at.current), b((ne) => ne.filter((ve) => ve.toastId !== f.id)), setTimeout(() => {
      k(f);
    }, kR);
  }, [f, k, b, at]);
  U.useEffect(() => {
    if (f.promise && M === "loading" || f.duration === 1 / 0 || f.type === "loading") return;
    let ne;
    return E || p || X && ae ? (() => {
      if (At.current < st.current) {
        let ve = (/* @__PURE__ */ new Date()).getTime() - st.current;
        Zt.current = Zt.current - ve;
      }
      At.current = (/* @__PURE__ */ new Date()).getTime();
    })() : Zt.current !== 1 / 0 && (st.current = (/* @__PURE__ */ new Date()).getTime(), ne = setTimeout(() => {
      var ve;
      (ve = f.onAutoClose) == null || ve.call(f, f), Oe();
    }, Zt.current)), () => clearTimeout(ne);
  }, [E, p, f, M, X, ae, Oe]), U.useEffect(() => {
    f.delete && Oe();
  }, [Oe, f.delete]);
  function He() {
    var ne, ve, be;
    return S != null && S.loading ? U.createElement("div", { className: It(L == null ? void 0 : L.loader, (ne = f == null ? void 0 : f.classNames) == null ? void 0 : ne.loader, "sonner-loader"), "data-visible": M === "loading" }, S.loading) : N ? U.createElement("div", { className: It(L == null ? void 0 : L.loader, (ve = f == null ? void 0 : f.classNames) == null ? void 0 : ve.loader, "sonner-loader"), "data-visible": M === "loading" }, N) : U.createElement(rR, { className: It(L == null ? void 0 : L.loader, (be = f == null ? void 0 : f.classNames) == null ? void 0 : be.loader), visible: M === "loading" });
  }
  return U.createElement("li", { tabIndex: 0, ref: Pt, className: It(R, ie, L == null ? void 0 : L.toast, (t = f == null ? void 0 : f.classNames) == null ? void 0 : t.toast, L == null ? void 0 : L.default, L == null ? void 0 : L[M], (n = f == null ? void 0 : f.classNames) == null ? void 0 : n[M]), "data-sonner-toast": "", "data-rich-colors": (r = f.richColors) != null ? r : A, "data-styled": !(f.jsx || f.unstyled || m), "data-mounted": B, "data-promise": !!f.promise, "data-swiped": wt, "data-removed": ge, "data-visible": Ar, "data-y-position": Rt, "data-x-position": ut, "data-index": w, "data-front": Pr, "data-swiping": oe, "data-dismissible": H, "data-type": M, "data-invert": Te, "data-swipe-out": je, "data-swipe-direction": q, "data-expanded": !!(E || _ && B), style: { "--index": w, "--toasts-before": w, "--z-index": T.length - w, "--offset": `${ge ? mt : at.current}px`, "--initial-height": _ ? "auto" : `${Et}px`, ...F, ...f.style }, onDragEnd: () => {
    de(!1), J(null), Le.current = null;
  }, onPointerDown: (ne) => {
    Ce || !H || (Wn.current = /* @__PURE__ */ new Date(), Yt(at.current), ne.target.setPointerCapture(ne.pointerId), ne.target.tagName !== "BUTTON" && (de(!0), Le.current = { x: ne.clientX, y: ne.clientY }));
  }, onPointerUp: () => {
    var ne, ve, be, Ze;
    if (je || !H) return;
    Le.current = null;
    let Ge = Number(((ne = Pt.current) == null ? void 0 : ne.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0), Ee = Number(((ve = Pt.current) == null ? void 0 : ve.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0), Pe = (/* @__PURE__ */ new Date()).getTime() - ((be = Wn.current) == null ? void 0 : be.getTime()), Se = C === "x" ? Ge : Ee, me = Math.abs(Se) / Pe;
    if (Math.abs(Se) >= SR || me > 0.11) {
      Yt(at.current), (Ze = f.onDismiss) == null || Ze.call(f, f), K(C === "x" ? Ge > 0 ? "right" : "left" : Ee > 0 ? "down" : "up"), Oe(), Ke(!0), ct(!1);
      return;
    }
    de(!1), J(null);
  }, onPointerMove: (ne) => {
    var ve, be, Ze, Ge;
    if (!Le.current || !H || ((ve = window.getSelection()) == null ? void 0 : ve.toString().length) > 0) return;
    let Ee = ne.clientY - Le.current.y, Pe = ne.clientX - Le.current.x, Se = (be = e.swipeDirections) != null ? be : CR(W);
    !C && (Math.abs(Pe) > 1 || Math.abs(Ee) > 1) && J(Math.abs(Pe) > Math.abs(Ee) ? "x" : "y");
    let me = { x: 0, y: 0 };
    C === "y" ? (Se.includes("top") || Se.includes("bottom")) && (Se.includes("top") && Ee < 0 || Se.includes("bottom") && Ee > 0) && (me.y = Ee) : C === "x" && (Se.includes("left") || Se.includes("right")) && (Se.includes("left") && Pe < 0 || Se.includes("right") && Pe > 0) && (me.x = Pe), (Math.abs(me.x) > 0 || Math.abs(me.y) > 0) && ct(!0), (Ze = Pt.current) == null || Ze.style.setProperty("--swipe-amount-x", `${me.x}px`), (Ge = Pt.current) == null || Ge.style.setProperty("--swipe-amount-y", `${me.y}px`);
  } }, ot && !f.jsx ? U.createElement("button", { "aria-label": te, "data-disabled": Ce, "data-close-button": !0, onClick: Ce || !H ? () => {
  } : () => {
    var ne;
    Oe(), (ne = f.onDismiss) == null || ne.call(f, f);
  }, className: It(L == null ? void 0 : L.closeButton, (i = f == null ? void 0 : f.classNames) == null ? void 0 : i.closeButton) }, (o = S == null ? void 0 : S.close) != null ? o : lR) : null, f.jsx || Ii(f.title) ? f.jsx ? f.jsx : typeof f.title == "function" ? f.title() : f.title : U.createElement(U.Fragment, null, M || f.icon || f.promise ? U.createElement("div", { "data-icon": "", className: It(L == null ? void 0 : L.icon, (s = f == null ? void 0 : f.classNames) == null ? void 0 : s.icon) }, f.promise || f.type === "loading" && !f.icon ? f.icon || He() : null, f.type !== "loading" ? f.icon || (S == null ? void 0 : S[M]) || tR(M) : null) : null, U.createElement("div", { "data-content": "", className: It(L == null ? void 0 : L.content, (a = f == null ? void 0 : f.classNames) == null ? void 0 : a.content) }, U.createElement("div", { "data-title": "", className: It(L == null ? void 0 : L.title, (l = f == null ? void 0 : f.classNames) == null ? void 0 : l.title) }, typeof f.title == "function" ? f.title() : f.title), f.description ? U.createElement("div", { "data-description": "", className: It(z, fe, L == null ? void 0 : L.description, (c = f == null ? void 0 : f.classNames) == null ? void 0 : c.description) }, typeof f.description == "function" ? f.description() : f.description) : null), Ii(f.cancel) ? f.cancel : f.cancel && Ti(f.cancel) ? U.createElement("button", { "data-button": !0, "data-cancel": !0, style: f.cancelButtonStyle || P, onClick: (ne) => {
    var ve, be;
    Ti(f.cancel) && H && ((be = (ve = f.cancel).onClick) == null || be.call(ve, ne), Oe());
  }, className: It(L == null ? void 0 : L.cancelButton, (u = f == null ? void 0 : f.classNames) == null ? void 0 : u.cancelButton) }, f.cancel.label) : null, Ii(f.action) ? f.action : f.action && Ti(f.action) ? U.createElement("button", { "data-button": !0, "data-action": !0, style: f.actionButtonStyle || I, onClick: (ne) => {
    var ve, be;
    Ti(f.action) && ((be = (ve = f.action).onClick) == null || be.call(ve, ne), !ne.defaultPrevented && Oe());
  }, className: It(L == null ? void 0 : L.actionButton, (d = f == null ? void 0 : f.classNames) == null ? void 0 : d.actionButton) }, f.action.label) : null));
};
function Nd() {
  if (typeof window > "u" || typeof document > "u") return "ltr";
  let e = document.documentElement.getAttribute("dir");
  return e === "auto" || !e ? window.getComputedStyle(document.documentElement).direction : e;
}
function ER(e, t) {
  let n = {};
  return [e, t].forEach((r, i) => {
    let o = i === 1, s = o ? "--mobile-offset" : "--offset", a = o ? bR : vR;
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
hr(function(e, t) {
  let { invert: n, position: r = "bottom-right", hotkey: i = ["altKey", "KeyT"], expand: o, closeButton: s, className: a, offset: l, mobileOffset: c, theme: u = "light", richColors: d, duration: h, style: f, visibleToasts: m = yR, toastOptions: p, dir: b = Nd(), gap: v = wR, loadingIcon: x, icons: w, containerAriaLabel: T = "Notifications", pauseWhenPageIsHidden: E } = e, [k, A] = U.useState([]), D = U.useMemo(() => Array.from(new Set([r].concat(k.filter((X) => X.position).map((X) => X.position)))), [k, r]), [F, P] = U.useState([]), [I, R] = U.useState(!1), [z, j] = U.useState(!1), [W, V] = U.useState(u !== "system" ? u : typeof window < "u" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), N = U.useRef(null), _ = i.join("+").replace(/Key/g, "").replace(/Digit/g, ""), L = U.useRef(null), S = U.useRef(!1), te = U.useCallback((X) => {
    A((C) => {
      var J;
      return (J = C.find((q) => q.id === X.id)) != null && J.delete || ft.dismiss(X.id), C.filter(({ id: q }) => q !== X.id);
    });
  }, []);
  return U.useEffect(() => ft.subscribe((X) => {
    if (X.dismiss) {
      A((C) => C.map((J) => J.id === X.id ? { ...J, delete: !0 } : J));
      return;
    }
    setTimeout(() => {
      mf.flushSync(() => {
        A((C) => {
          let J = C.findIndex((q) => q.id === X.id);
          return J !== -1 ? [...C.slice(0, J), { ...C[J], ...X }, ...C.slice(J + 1)] : [X, ...C];
        });
      });
    });
  }), []), U.useEffect(() => {
    if (u !== "system") {
      V(u);
      return;
    }
    if (u === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? V("dark") : V("light")), typeof window > "u") return;
    let X = window.matchMedia("(prefers-color-scheme: dark)");
    try {
      X.addEventListener("change", ({ matches: C }) => {
        V(C ? "dark" : "light");
      });
    } catch {
      X.addListener(({ matches: J }) => {
        try {
          V(J ? "dark" : "light");
        } catch (q) {
          console.error(q);
        }
      });
    }
  }, [u]), U.useEffect(() => {
    k.length <= 1 && R(!1);
  }, [k]), U.useEffect(() => {
    let X = (C) => {
      var J, q;
      i.every((K) => C[K] || C.code === K) && (R(!0), (J = N.current) == null || J.focus()), C.code === "Escape" && (document.activeElement === N.current || (q = N.current) != null && q.contains(document.activeElement)) && R(!1);
    };
    return document.addEventListener("keydown", X), () => document.removeEventListener("keydown", X);
  }, [i]), U.useEffect(() => {
    if (N.current) return () => {
      L.current && (L.current.focus({ preventScroll: !0 }), L.current = null, S.current = !1);
    };
  }, [N.current]), U.createElement("section", { ref: t, "aria-label": `${T} ${_}`, tabIndex: -1, "aria-live": "polite", "aria-relevant": "additions text", "aria-atomic": "false", suppressHydrationWarning: !0 }, D.map((X, C) => {
    var J;
    let [q, K] = X.split("-");
    return k.length ? U.createElement("ol", { key: X, dir: b === "auto" ? Nd() : b, tabIndex: -1, ref: N, className: a, "data-sonner-toaster": !0, "data-theme": W, "data-y-position": q, "data-lifted": I && k.length > 1 && !o, "data-x-position": K, style: { "--front-toast-height": `${((J = F[0]) == null ? void 0 : J.height) || 0}px`, "--width": `${xR}px`, "--gap": `${v}px`, ...f, ...ER(l, c) }, onBlur: (B) => {
      S.current && !B.currentTarget.contains(B.relatedTarget) && (S.current = !1, L.current && (L.current.focus({ preventScroll: !0 }), L.current = null));
    }, onFocus: (B) => {
      B.target instanceof HTMLElement && B.target.dataset.dismissible === "false" || S.current || (S.current = !0, L.current = B.relatedTarget);
    }, onMouseEnter: () => R(!0), onMouseMove: () => R(!0), onMouseLeave: () => {
      z || R(!1);
    }, onDragEnd: () => R(!1), onPointerDown: (B) => {
      B.target instanceof HTMLElement && B.target.dataset.dismissible === "false" || j(!0);
    }, onPointerUp: () => j(!1) }, k.filter((B) => !B.position && C === 0 || B.position === X).map((B, G) => {
      var ge, re;
      return U.createElement(TR, { key: B.id, icons: w, index: G, toast: B, defaultRichColors: d, duration: (ge = p == null ? void 0 : p.duration) != null ? ge : h, className: p == null ? void 0 : p.className, descriptionClassName: p == null ? void 0 : p.descriptionClassName, invert: n, visibleToasts: m, closeButton: (re = p == null ? void 0 : p.closeButton) != null ? re : s, interacting: z, position: X, style: p == null ? void 0 : p.style, unstyled: p == null ? void 0 : p.unstyled, classNames: p == null ? void 0 : p.classNames, cancelButtonStyle: p == null ? void 0 : p.cancelButtonStyle, actionButtonStyle: p == null ? void 0 : p.actionButtonStyle, removeToast: te, toasts: k.filter((oe) => oe.position == B.position), heights: F.filter((oe) => oe.position == B.position), setHeights: P, expandByDefault: o, gap: v, loadingIcon: x, expanded: I, pauseWhenPageIsHidden: E, swipeDirections: e.swipeDirections });
    })) : null;
  }));
});
function PR({
  text: e,
  copyMessage: t = "Copied to clipboard!"
}) {
  const [n, r] = se(!1), i = De(null), o = Be(() => {
    navigator.clipboard.writeText(e).then(() => {
      Ad.success(t), r(!0), i.current && (clearTimeout(i.current), i.current = null), i.current = setTimeout(() => {
        r(!1);
      }, 2e3);
    }).catch(() => {
      Ad.error("Failed to copy to clipboard.");
    });
  }, [e, t]);
  return { isCopied: n, handleCopy: o };
}
function no({ content: e, copyMessage: t }) {
  const { isCopied: n, handleCopy: r } = PR({
    text: e,
    copyMessage: t
  });
  return /* @__PURE__ */ O(
    qe,
    {
      variant: "ghost",
      size: "icon",
      className: "relative h-6 w-6",
      "aria-label": "Copy to clipboard",
      onClick: r,
      children: [
        /* @__PURE__ */ g("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ g(
          yf,
          {
            className: Y(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-100" : "scale-0"
            )
          }
        ) }),
        /* @__PURE__ */ g(
          lv,
          {
            className: Y(
              "h-4 w-4 transition-transform ease-in-out",
              n ? "scale-0" : "scale-100"
            )
          }
        )
      ]
    }
  );
}
function Fn(e) {
  const t = y.useRef(e);
  return y.useEffect(() => {
    t.current = e;
  }), y.useMemo(() => (...n) => {
    var r;
    return (r = t.current) == null ? void 0 : r.call(t, ...n);
  }, []);
}
function AR(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = Fn(e);
  y.useEffect(() => {
    const r = (i) => {
      i.key === "Escape" && n(i);
    };
    return t.addEventListener("keydown", r, { capture: !0 }), () => t.removeEventListener("keydown", r, { capture: !0 });
  }, [n, t]);
}
var RR = "DismissableLayer", da = "dismissableLayer.update", NR = "dismissableLayer.pointerDownOutside", IR = "dismissableLayer.focusOutside", Id, bm = y.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), di = y.forwardRef(
  (e, t) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: i,
      onFocusOutside: o,
      onInteractOutside: s,
      onDismiss: a,
      ...l
    } = e, c = y.useContext(bm), [u, d] = y.useState(null), h = (u == null ? void 0 : u.ownerDocument) ?? (globalThis == null ? void 0 : globalThis.document), [, f] = y.useState({}), m = we(t, (A) => d(A)), p = Array.from(c.layers), [b] = [...c.layersWithOutsidePointerEventsDisabled].slice(-1), v = p.indexOf(b), x = u ? p.indexOf(u) : -1, w = c.layersWithOutsidePointerEventsDisabled.size > 0, T = x >= v, E = OR((A) => {
      const D = A.target, F = [...c.branches].some((P) => P.contains(D));
      !T || F || (i == null || i(A), s == null || s(A), A.defaultPrevented || a == null || a());
    }, h), k = LR((A) => {
      const D = A.target;
      [...c.branches].some((P) => P.contains(D)) || (o == null || o(A), s == null || s(A), A.defaultPrevented || a == null || a());
    }, h);
    return AR((A) => {
      x === c.layers.size - 1 && (r == null || r(A), !A.defaultPrevented && a && (A.preventDefault(), a()));
    }, h), y.useEffect(() => {
      if (u)
        return n && (c.layersWithOutsidePointerEventsDisabled.size === 0 && (Id = h.body.style.pointerEvents, h.body.style.pointerEvents = "none"), c.layersWithOutsidePointerEventsDisabled.add(u)), c.layers.add(u), Dd(), () => {
          n && c.layersWithOutsidePointerEventsDisabled.size === 1 && (h.body.style.pointerEvents = Id);
        };
    }, [u, h, n, c]), y.useEffect(() => () => {
      u && (c.layers.delete(u), c.layersWithOutsidePointerEventsDisabled.delete(u), Dd());
    }, [u, c]), y.useEffect(() => {
      const A = () => f({});
      return document.addEventListener(da, A), () => document.removeEventListener(da, A);
    }, []), /* @__PURE__ */ g(
      he.div,
      {
        ...l,
        ref: m,
        style: {
          pointerEvents: w ? T ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: le(e.onFocusCapture, k.onFocusCapture),
        onBlurCapture: le(e.onBlurCapture, k.onBlurCapture),
        onPointerDownCapture: le(
          e.onPointerDownCapture,
          E.onPointerDownCapture
        )
      }
    );
  }
);
di.displayName = RR;
var DR = "DismissableLayerBranch", MR = y.forwardRef((e, t) => {
  const n = y.useContext(bm), r = y.useRef(null), i = we(t, r);
  return y.useEffect(() => {
    const o = r.current;
    if (o)
      return n.branches.add(o), () => {
        n.branches.delete(o);
      };
  }, [n.branches]), /* @__PURE__ */ g(he.div, { ...e, ref: i });
});
MR.displayName = DR;
function OR(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = Fn(e), r = y.useRef(!1), i = y.useRef(() => {
  });
  return y.useEffect(() => {
    const o = (a) => {
      if (a.target && !r.current) {
        let l = function() {
          xm(
            NR,
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
function LR(e, t = globalThis == null ? void 0 : globalThis.document) {
  const n = Fn(e), r = y.useRef(!1);
  return y.useEffect(() => {
    const i = (o) => {
      o.target && !r.current && xm(IR, n, { originalEvent: o }, {
        discrete: !1
      });
    };
    return t.addEventListener("focusin", i), () => t.removeEventListener("focusin", i);
  }, [t, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function Dd() {
  const e = new CustomEvent(da);
  document.dispatchEvent(e);
}
function xm(e, t, n, { discrete: r }) {
  const i = n.originalEvent.target, o = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  t && i.addEventListener(e, t, { once: !0 }), r ? Z1(i, o) : i.dispatchEvent(o);
}
var Es = 0;
function Fl() {
  y.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return document.body.insertAdjacentElement("afterbegin", e[0] ?? Md()), document.body.insertAdjacentElement("beforeend", e[1] ?? Md()), Es++, () => {
      Es === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((t) => t.remove()), Es--;
    };
  }, []);
}
function Md() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var Ps = "focusScope.autoFocusOnMount", As = "focusScope.autoFocusOnUnmount", Od = { bubbles: !1, cancelable: !0 }, _R = "FocusScope", Oo = y.forwardRef((e, t) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: i,
    onUnmountAutoFocus: o,
    ...s
  } = e, [a, l] = y.useState(null), c = Fn(i), u = Fn(o), d = y.useRef(null), h = we(t, (p) => l(p)), f = y.useRef({
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
        const T = w.target;
        a.contains(T) ? d.current = T : mn(d.current, { select: !0 });
      }, b = function(w) {
        if (f.paused || !a) return;
        const T = w.relatedTarget;
        T !== null && (a.contains(T) || mn(d.current, { select: !0 }));
      }, v = function(w) {
        if (document.activeElement === document.body)
          for (const E of w)
            E.removedNodes.length > 0 && mn(a);
      };
      document.addEventListener("focusin", p), document.addEventListener("focusout", b);
      const x = new MutationObserver(v);
      return a && x.observe(a, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", p), document.removeEventListener("focusout", b), x.disconnect();
      };
    }
  }, [r, a, f.paused]), y.useEffect(() => {
    if (a) {
      _d.add(f);
      const p = document.activeElement;
      if (!a.contains(p)) {
        const v = new CustomEvent(Ps, Od);
        a.addEventListener(Ps, c), a.dispatchEvent(v), v.defaultPrevented || (FR(jR(wm(a)), { select: !0 }), document.activeElement === p && mn(a));
      }
      return () => {
        a.removeEventListener(Ps, c), setTimeout(() => {
          const v = new CustomEvent(As, Od);
          a.addEventListener(As, u), a.dispatchEvent(v), v.defaultPrevented || mn(p ?? document.body, { select: !0 }), a.removeEventListener(As, u), _d.remove(f);
        }, 0);
      };
    }
  }, [a, c, u, f]);
  const m = y.useCallback(
    (p) => {
      if (!n && !r || f.paused) return;
      const b = p.key === "Tab" && !p.altKey && !p.ctrlKey && !p.metaKey, v = document.activeElement;
      if (b && v) {
        const x = p.currentTarget, [w, T] = VR(x);
        w && T ? !p.shiftKey && v === T ? (p.preventDefault(), n && mn(w, { select: !0 })) : p.shiftKey && v === w && (p.preventDefault(), n && mn(T, { select: !0 })) : v === x && p.preventDefault();
      }
    },
    [n, r, f.paused]
  );
  return /* @__PURE__ */ g(he.div, { tabIndex: -1, ...s, ref: h, onKeyDown: m });
});
Oo.displayName = _R;
function FR(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e)
    if (mn(r, { select: t }), document.activeElement !== n) return;
}
function VR(e) {
  const t = wm(e), n = Ld(t, e), r = Ld(t.reverse(), e);
  return [n, r];
}
function wm(e) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const i = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || i ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Ld(e, t) {
  for (const n of e)
    if (!zR(n, { upTo: t })) return n;
}
function zR(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function BR(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function mn(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== n && BR(e) && t && e.select();
  }
}
var _d = $R();
function $R() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      t !== n && (n == null || n.pause()), e = Fd(e, t), e.unshift(t);
    },
    remove(t) {
      var n;
      e = Fd(e, t), (n = e[0]) == null || n.resume();
    }
  };
}
function Fd(e, t) {
  const n = [...e], r = n.indexOf(t);
  return r !== -1 && n.splice(r, 1), n;
}
function jR(e) {
  return e.filter((t) => t.tagName !== "A");
}
const UR = ["top", "right", "bottom", "left"], xn = Math.min, yt = Math.max, ro = Math.round, Ei = Math.floor, Ht = (e) => ({
  x: e,
  y: e
}), HR = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, WR = {
  start: "end",
  end: "start"
};
function fa(e, t, n) {
  return yt(e, xn(t, n));
}
function rn(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function on(e) {
  return e.split("-")[0];
}
function Sr(e) {
  return e.split("-")[1];
}
function Vl(e) {
  return e === "x" ? "y" : "x";
}
function zl(e) {
  return e === "y" ? "height" : "width";
}
const qR = /* @__PURE__ */ new Set(["top", "bottom"]);
function Bt(e) {
  return qR.has(on(e)) ? "y" : "x";
}
function Bl(e) {
  return Vl(Bt(e));
}
function KR(e, t, n) {
  n === void 0 && (n = !1);
  const r = Sr(e), i = Bl(e), o = zl(i);
  let s = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[o] > t.floating[o] && (s = io(s)), [s, io(s)];
}
function GR(e) {
  const t = io(e);
  return [ha(e), t, ha(t)];
}
function ha(e) {
  return e.replace(/start|end/g, (t) => WR[t]);
}
const Vd = ["left", "right"], zd = ["right", "left"], YR = ["top", "bottom"], XR = ["bottom", "top"];
function ZR(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? zd : Vd : t ? Vd : zd;
    case "left":
    case "right":
      return t ? YR : XR;
    default:
      return [];
  }
}
function JR(e, t, n, r) {
  const i = Sr(e);
  let o = ZR(on(e), n === "start", r);
  return i && (o = o.map((s) => s + "-" + i), t && (o = o.concat(o.map(ha)))), o;
}
function io(e) {
  return e.replace(/left|right|bottom|top/g, (t) => HR[t]);
}
function QR(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function Sm(e) {
  return typeof e != "number" ? QR(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function oo(e) {
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
function Bd(e, t, n) {
  let {
    reference: r,
    floating: i
  } = e;
  const o = Bt(t), s = Bl(t), a = zl(s), l = on(t), c = o === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, h = r[a] / 2 - i[a] / 2;
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
  switch (Sr(t)) {
    case "start":
      f[s] -= h * (n && c ? -1 : 1);
      break;
    case "end":
      f[s] += h * (n && c ? -1 : 1);
      break;
  }
  return f;
}
const eN = async (e, t, n) => {
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
  } = Bd(c, r, l), h = r, f = {}, m = 0;
  for (let p = 0; p < a.length; p++) {
    const {
      name: b,
      fn: v
    } = a[p], {
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
    }, E && m <= 50 && (m++, typeof E == "object" && (E.placement && (h = E.placement), E.rects && (c = E.rects === !0 ? await s.getElementRects({
      reference: e,
      floating: t,
      strategy: i
    }) : E.rects), {
      x: u,
      y: d
    } = Bd(c, h, l)), p = -1);
  }
  return {
    x: u,
    y: d,
    placement: h,
    strategy: i,
    middlewareData: f
  };
};
async function Qr(e, t) {
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
  } = rn(t, e), m = Sm(f), b = a[h ? d === "floating" ? "reference" : "floating" : d], v = oo(await o.getClippingRect({
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
  }, E = oo(o.convertOffsetParentRelativeRectToViewportRelativeRect ? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: a,
    rect: x,
    offsetParent: w,
    strategy: l
  }) : x);
  return {
    top: (v.top - E.top + m.top) / T.y,
    bottom: (E.bottom - v.bottom + m.bottom) / T.y,
    left: (v.left - E.left + m.left) / T.x,
    right: (E.right - v.right + m.right) / T.x
  };
}
const tN = (e) => ({
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
    } = rn(e, t) || {};
    if (c == null)
      return {};
    const d = Sm(u), h = {
      x: n,
      y: r
    }, f = Bl(i), m = zl(f), p = await s.getDimensions(c), b = f === "y", v = b ? "top" : "left", x = b ? "bottom" : "right", w = b ? "clientHeight" : "clientWidth", T = o.reference[m] + o.reference[f] - h[f] - o.floating[m], E = h[f] - o.reference[f], k = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c));
    let A = k ? k[w] : 0;
    (!A || !await (s.isElement == null ? void 0 : s.isElement(k))) && (A = a.floating[w] || o.floating[m]);
    const D = T / 2 - E / 2, F = A / 2 - p[m] / 2 - 1, P = xn(d[v], F), I = xn(d[x], F), R = P, z = A - p[m] - I, j = A / 2 - p[m] / 2 + D, W = fa(R, j, z), V = !l.arrow && Sr(i) != null && j !== W && o.reference[m] / 2 - (j < R ? P : I) - p[m] / 2 < 0, N = V ? j < R ? j - R : j - z : 0;
    return {
      [f]: h[f] + N,
      data: {
        [f]: W,
        centerOffset: j - W - N,
        ...V && {
          alignmentOffset: N
        }
      },
      reset: V
    };
  }
}), nN = function(e) {
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
      } = rn(e, t);
      if ((n = o.arrow) != null && n.alignmentOffset)
        return {};
      const v = on(i), x = Bt(a), w = on(a) === a, T = await (l.isRTL == null ? void 0 : l.isRTL(c.floating)), E = h || (w || !p ? [io(a)] : GR(a)), k = m !== "none";
      !h && k && E.push(...JR(a, p, m, T));
      const A = [a, ...E], D = await Qr(t, b), F = [];
      let P = ((r = o.flip) == null ? void 0 : r.overflows) || [];
      if (u && F.push(D[v]), d) {
        const j = KR(i, s, T);
        F.push(D[j[0]], D[j[1]]);
      }
      if (P = [...P, {
        placement: i,
        overflows: F
      }], !F.every((j) => j <= 0)) {
        var I, R;
        const j = (((I = o.flip) == null ? void 0 : I.index) || 0) + 1, W = A[j];
        if (W && (!(d === "alignment" ? x !== Bt(W) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        P.every((_) => Bt(_.placement) === x ? _.overflows[0] > 0 : !0)))
          return {
            data: {
              index: j,
              overflows: P
            },
            reset: {
              placement: W
            }
          };
        let V = (R = P.filter((N) => N.overflows[0] <= 0).sort((N, _) => N.overflows[1] - _.overflows[1])[0]) == null ? void 0 : R.placement;
        if (!V)
          switch (f) {
            case "bestFit": {
              var z;
              const N = (z = P.filter((_) => {
                if (k) {
                  const L = Bt(_.placement);
                  return L === x || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  L === "y";
                }
                return !0;
              }).map((_) => [_.placement, _.overflows.filter((L) => L > 0).reduce((L, S) => L + S, 0)]).sort((_, L) => _[1] - L[1])[0]) == null ? void 0 : z[0];
              N && (V = N);
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
function $d(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function jd(e) {
  return UR.some((t) => e[t] >= 0);
}
const rN = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n
      } = t, {
        strategy: r = "referenceHidden",
        ...i
      } = rn(e, t);
      switch (r) {
        case "referenceHidden": {
          const o = await Qr(t, {
            ...i,
            elementContext: "reference"
          }), s = $d(o, n.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: jd(s)
            }
          };
        }
        case "escaped": {
          const o = await Qr(t, {
            ...i,
            altBoundary: !0
          }), s = $d(o, n.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: jd(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, km = /* @__PURE__ */ new Set(["left", "top"]);
async function iN(e, t) {
  const {
    placement: n,
    platform: r,
    elements: i
  } = e, o = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), s = on(n), a = Sr(n), l = Bt(n) === "y", c = km.has(s) ? -1 : 1, u = o && l ? -1 : 1, d = rn(t, e);
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
const oN = function(e) {
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
      } = t, l = await iN(t, e);
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
}, sN = function(e) {
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
      } = rn(e, t), c = {
        x: n,
        y: r
      }, u = await Qr(t, l), d = Bt(on(i)), h = Vl(d);
      let f = c[h], m = c[d];
      if (o) {
        const b = h === "y" ? "top" : "left", v = h === "y" ? "bottom" : "right", x = f + u[b], w = f - u[v];
        f = fa(x, f, w);
      }
      if (s) {
        const b = d === "y" ? "top" : "left", v = d === "y" ? "bottom" : "right", x = m + u[b], w = m - u[v];
        m = fa(x, m, w);
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
}, aN = function(e) {
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
      } = rn(e, t), u = {
        x: n,
        y: r
      }, d = Bt(i), h = Vl(d);
      let f = u[h], m = u[d];
      const p = rn(a, t), b = typeof p == "number" ? {
        mainAxis: p,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...p
      };
      if (l) {
        const w = h === "y" ? "height" : "width", T = o.reference[h] - o.floating[w] + b.mainAxis, E = o.reference[h] + o.reference[w] - b.mainAxis;
        f < T ? f = T : f > E && (f = E);
      }
      if (c) {
        var v, x;
        const w = h === "y" ? "width" : "height", T = km.has(on(i)), E = o.reference[d] - o.floating[w] + (T && ((v = s.offset) == null ? void 0 : v[d]) || 0) + (T ? 0 : b.crossAxis), k = o.reference[d] + o.reference[w] + (T ? 0 : ((x = s.offset) == null ? void 0 : x[d]) || 0) - (T ? b.crossAxis : 0);
        m < E ? m = E : m > k && (m = k);
      }
      return {
        [h]: f,
        [d]: m
      };
    }
  };
}, lN = function(e) {
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
      } = rn(e, t), u = await Qr(t, c), d = on(i), h = Sr(i), f = Bt(i) === "y", {
        width: m,
        height: p
      } = o.floating;
      let b, v;
      d === "top" || d === "bottom" ? (b = d, v = h === (await (s.isRTL == null ? void 0 : s.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (v = d, b = h === "end" ? "top" : "bottom");
      const x = p - u.top - u.bottom, w = m - u.left - u.right, T = xn(p - u[b], x), E = xn(m - u[v], w), k = !t.middlewareData.shift;
      let A = T, D = E;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (D = w), (r = t.middlewareData.shift) != null && r.enabled.y && (A = x), k && !h) {
        const P = yt(u.left, 0), I = yt(u.right, 0), R = yt(u.top, 0), z = yt(u.bottom, 0);
        f ? D = m - 2 * (P !== 0 || I !== 0 ? P + I : yt(u.left, u.right)) : A = p - 2 * (R !== 0 || z !== 0 ? R + z : yt(u.top, u.bottom));
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
function Lo() {
  return typeof window < "u";
}
function kr(e) {
  return Cm(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function bt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Gt(e) {
  var t;
  return (t = (Cm(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Cm(e) {
  return Lo() ? e instanceof Node || e instanceof bt(e).Node : !1;
}
function Lt(e) {
  return Lo() ? e instanceof Element || e instanceof bt(e).Element : !1;
}
function qt(e) {
  return Lo() ? e instanceof HTMLElement || e instanceof bt(e).HTMLElement : !1;
}
function Ud(e) {
  return !Lo() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof bt(e).ShadowRoot;
}
const cN = /* @__PURE__ */ new Set(["inline", "contents"]);
function fi(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: i
  } = _t(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !cN.has(i);
}
const uN = /* @__PURE__ */ new Set(["table", "td", "th"]);
function dN(e) {
  return uN.has(kr(e));
}
const fN = [":popover-open", ":modal"];
function _o(e) {
  return fN.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
const hN = ["transform", "translate", "scale", "rotate", "perspective"], pN = ["transform", "translate", "scale", "rotate", "perspective", "filter"], mN = ["paint", "layout", "strict", "content"];
function $l(e) {
  const t = jl(), n = Lt(e) ? _t(e) : e;
  return hN.some((r) => n[r] ? n[r] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || pN.some((r) => (n.willChange || "").includes(r)) || mN.some((r) => (n.contain || "").includes(r));
}
function gN(e) {
  let t = wn(e);
  for (; qt(t) && !ur(t); ) {
    if ($l(t))
      return t;
    if (_o(t))
      return null;
    t = wn(t);
  }
  return null;
}
function jl() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
const yN = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function ur(e) {
  return yN.has(kr(e));
}
function _t(e) {
  return bt(e).getComputedStyle(e);
}
function Fo(e) {
  return Lt(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function wn(e) {
  if (kr(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Ud(e) && e.host || // Fallback.
    Gt(e)
  );
  return Ud(t) ? t.host : t;
}
function Tm(e) {
  const t = wn(e);
  return ur(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : qt(t) && fi(t) ? t : Tm(t);
}
function ei(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const i = Tm(e), o = i === ((r = e.ownerDocument) == null ? void 0 : r.body), s = bt(i);
  if (o) {
    const a = pa(s);
    return t.concat(s, s.visualViewport || [], fi(i) ? i : [], a && n ? ei(a) : []);
  }
  return t.concat(i, ei(i, [], n));
}
function pa(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Em(e) {
  const t = _t(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const i = qt(e), o = i ? e.offsetWidth : n, s = i ? e.offsetHeight : r, a = ro(n) !== o || ro(r) !== s;
  return a && (n = o, r = s), {
    width: n,
    height: r,
    $: a
  };
}
function Ul(e) {
  return Lt(e) ? e : e.contextElement;
}
function ir(e) {
  const t = Ul(e);
  if (!qt(t))
    return Ht(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: i,
    $: o
  } = Em(t);
  let s = (o ? ro(n.width) : n.width) / r, a = (o ? ro(n.height) : n.height) / i;
  return (!s || !Number.isFinite(s)) && (s = 1), (!a || !Number.isFinite(a)) && (a = 1), {
    x: s,
    y: a
  };
}
const vN = /* @__PURE__ */ Ht(0);
function Pm(e) {
  const t = bt(e);
  return !jl() || !t.visualViewport ? vN : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function bN(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== bt(e) ? !1 : t;
}
function Vn(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const i = e.getBoundingClientRect(), o = Ul(e);
  let s = Ht(1);
  t && (r ? Lt(r) && (s = ir(r)) : s = ir(e));
  const a = bN(o, n, r) ? Pm(o) : Ht(0);
  let l = (i.left + a.x) / s.x, c = (i.top + a.y) / s.y, u = i.width / s.x, d = i.height / s.y;
  if (o) {
    const h = bt(o), f = r && Lt(r) ? bt(r) : r;
    let m = h, p = pa(m);
    for (; p && r && f !== m; ) {
      const b = ir(p), v = p.getBoundingClientRect(), x = _t(p), w = v.left + (p.clientLeft + parseFloat(x.paddingLeft)) * b.x, T = v.top + (p.clientTop + parseFloat(x.paddingTop)) * b.y;
      l *= b.x, c *= b.y, u *= b.x, d *= b.y, l += w, c += T, m = bt(p), p = pa(m);
    }
  }
  return oo({
    width: u,
    height: d,
    x: l,
    y: c
  });
}
function Vo(e, t) {
  const n = Fo(e).scrollLeft;
  return t ? t.left + n : Vn(Gt(e)).left + n;
}
function Am(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - Vo(e, n), i = n.top + t.scrollTop;
  return {
    x: r,
    y: i
  };
}
function xN(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: i
  } = e;
  const o = i === "fixed", s = Gt(r), a = t ? _o(t.floating) : !1;
  if (r === s || a && o)
    return n;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = Ht(1);
  const u = Ht(0), d = qt(r);
  if ((d || !d && !o) && ((kr(r) !== "body" || fi(s)) && (l = Fo(r)), qt(r))) {
    const f = Vn(r);
    c = ir(r), u.x = f.x + r.clientLeft, u.y = f.y + r.clientTop;
  }
  const h = s && !d && !o ? Am(s, l) : Ht(0);
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - l.scrollLeft * c.x + u.x + h.x,
    y: n.y * c.y - l.scrollTop * c.y + u.y + h.y
  };
}
function wN(e) {
  return Array.from(e.getClientRects());
}
function SN(e) {
  const t = Gt(e), n = Fo(e), r = e.ownerDocument.body, i = yt(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), o = yt(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + Vo(e);
  const a = -n.scrollTop;
  return _t(r).direction === "rtl" && (s += yt(t.clientWidth, r.clientWidth) - i), {
    width: i,
    height: o,
    x: s,
    y: a
  };
}
const Hd = 25;
function kN(e, t) {
  const n = bt(e), r = Gt(e), i = n.visualViewport;
  let o = r.clientWidth, s = r.clientHeight, a = 0, l = 0;
  if (i) {
    o = i.width, s = i.height;
    const u = jl();
    (!u || u && t === "fixed") && (a = i.offsetLeft, l = i.offsetTop);
  }
  const c = Vo(r);
  if (c <= 0) {
    const u = r.ownerDocument, d = u.body, h = getComputedStyle(d), f = u.compatMode === "CSS1Compat" && parseFloat(h.marginLeft) + parseFloat(h.marginRight) || 0, m = Math.abs(r.clientWidth - d.clientWidth - f);
    m <= Hd && (o -= m);
  } else c <= Hd && (o += c);
  return {
    width: o,
    height: s,
    x: a,
    y: l
  };
}
const CN = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function TN(e, t) {
  const n = Vn(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, o = qt(e) ? ir(e) : Ht(1), s = e.clientWidth * o.x, a = e.clientHeight * o.y, l = i * o.x, c = r * o.y;
  return {
    width: s,
    height: a,
    x: l,
    y: c
  };
}
function Wd(e, t, n) {
  let r;
  if (t === "viewport")
    r = kN(e, n);
  else if (t === "document")
    r = SN(Gt(e));
  else if (Lt(t))
    r = TN(t, n);
  else {
    const i = Pm(e);
    r = {
      x: t.x - i.x,
      y: t.y - i.y,
      width: t.width,
      height: t.height
    };
  }
  return oo(r);
}
function Rm(e, t) {
  const n = wn(e);
  return n === t || !Lt(n) || ur(n) ? !1 : _t(n).position === "fixed" || Rm(n, t);
}
function EN(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = ei(e, [], !1).filter((a) => Lt(a) && kr(a) !== "body"), i = null;
  const o = _t(e).position === "fixed";
  let s = o ? wn(e) : e;
  for (; Lt(s) && !ur(s); ) {
    const a = _t(s), l = $l(s);
    !l && a.position === "fixed" && (i = null), (o ? !l && !i : !l && a.position === "static" && !!i && CN.has(i.position) || fi(s) && !l && Rm(e, s)) ? r = r.filter((u) => u !== s) : i = a, s = wn(s);
  }
  return t.set(e, r), r;
}
function PN(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: i
  } = e;
  const s = [...n === "clippingAncestors" ? _o(t) ? [] : EN(t, this._c) : [].concat(n), r], a = s[0], l = s.reduce((c, u) => {
    const d = Wd(t, u, i);
    return c.top = yt(d.top, c.top), c.right = xn(d.right, c.right), c.bottom = xn(d.bottom, c.bottom), c.left = yt(d.left, c.left), c;
  }, Wd(t, a, i));
  return {
    width: l.right - l.left,
    height: l.bottom - l.top,
    x: l.left,
    y: l.top
  };
}
function AN(e) {
  const {
    width: t,
    height: n
  } = Em(e);
  return {
    width: t,
    height: n
  };
}
function RN(e, t, n) {
  const r = qt(t), i = Gt(t), o = n === "fixed", s = Vn(e, !0, o, t);
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = Ht(0);
  function c() {
    l.x = Vo(i);
  }
  if (r || !r && !o)
    if ((kr(t) !== "body" || fi(i)) && (a = Fo(t)), r) {
      const f = Vn(t, !0, o, t);
      l.x = f.x + t.clientLeft, l.y = f.y + t.clientTop;
    } else i && c();
  o && !r && i && c();
  const u = i && !r && !o ? Am(i, a) : Ht(0), d = s.left + a.scrollLeft - l.x - u.x, h = s.top + a.scrollTop - l.y - u.y;
  return {
    x: d,
    y: h,
    width: s.width,
    height: s.height
  };
}
function Rs(e) {
  return _t(e).position === "static";
}
function qd(e, t) {
  if (!qt(e) || _t(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Gt(e) === n && (n = n.ownerDocument.body), n;
}
function Nm(e, t) {
  const n = bt(e);
  if (_o(e))
    return n;
  if (!qt(e)) {
    let i = wn(e);
    for (; i && !ur(i); ) {
      if (Lt(i) && !Rs(i))
        return i;
      i = wn(i);
    }
    return n;
  }
  let r = qd(e, t);
  for (; r && dN(r) && Rs(r); )
    r = qd(r, t);
  return r && ur(r) && Rs(r) && !$l(r) ? n : r || gN(e) || n;
}
const NN = async function(e) {
  const t = this.getOffsetParent || Nm, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: RN(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function IN(e) {
  return _t(e).direction === "rtl";
}
const DN = {
  convertOffsetParentRelativeRectToViewportRelativeRect: xN,
  getDocumentElement: Gt,
  getClippingRect: PN,
  getOffsetParent: Nm,
  getElementRects: NN,
  getClientRects: wN,
  getDimensions: AN,
  getScale: ir,
  isElement: Lt,
  isRTL: IN
};
function Im(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function MN(e, t) {
  let n = null, r;
  const i = Gt(e);
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
    const m = Ei(d), p = Ei(i.clientWidth - (u + h)), b = Ei(i.clientHeight - (d + f)), v = Ei(u), w = {
      rootMargin: -m + "px " + -p + "px " + -b + "px " + -v + "px",
      threshold: yt(0, xn(1, l)) || 1
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
      A === 1 && !Im(c, e.getBoundingClientRect()) && s(), T = !1;
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
function ON(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: i = !0,
    ancestorResize: o = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: a = typeof IntersectionObserver == "function",
    animationFrame: l = !1
  } = r, c = Ul(e), u = i || o ? [...c ? ei(c) : [], ...ei(t)] : [];
  u.forEach((v) => {
    i && v.addEventListener("scroll", n, {
      passive: !0
    }), o && v.addEventListener("resize", n);
  });
  const d = c && a ? MN(c, n) : null;
  let h = -1, f = null;
  s && (f = new ResizeObserver((v) => {
    let [x] = v;
    x && x.target === c && f && (f.unobserve(t), cancelAnimationFrame(h), h = requestAnimationFrame(() => {
      var w;
      (w = f) == null || w.observe(t);
    })), n();
  }), c && !l && f.observe(c), f.observe(t));
  let m, p = l ? Vn(e) : null;
  l && b();
  function b() {
    const v = Vn(e);
    p && !Im(p, v) && n(), p = v, m = requestAnimationFrame(b);
  }
  return n(), () => {
    var v;
    u.forEach((x) => {
      i && x.removeEventListener("scroll", n), o && x.removeEventListener("resize", n);
    }), d == null || d(), (v = f) == null || v.disconnect(), f = null, l && cancelAnimationFrame(m);
  };
}
const LN = oN, _N = sN, FN = nN, VN = lN, zN = rN, Kd = tN, BN = aN, $N = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), i = {
    platform: DN,
    ...n
  }, o = {
    ...i.platform,
    _c: r
  };
  return eN(e, t, {
    ...i,
    platform: o
  });
};
var jN = typeof document < "u", UN = function() {
}, Fi = jN ? Ra : UN;
function so(e, t) {
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
        if (!so(e[r], t[r]))
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
      if (!(o === "_owner" && e.$$typeof) && !so(e[o], t[o]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Dm(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Gd(e, t) {
  const n = Dm(e);
  return Math.round(t * n) / n;
}
function Ns(e) {
  const t = y.useRef(e);
  return Fi(() => {
    t.current = e;
  }), t;
}
function HN(e) {
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
  so(h, r) || f(r);
  const [m, p] = y.useState(null), [b, v] = y.useState(null), x = y.useCallback((_) => {
    _ !== k.current && (k.current = _, p(_));
  }, []), w = y.useCallback((_) => {
    _ !== A.current && (A.current = _, v(_));
  }, []), T = o || m, E = s || b, k = y.useRef(null), A = y.useRef(null), D = y.useRef(u), F = l != null, P = Ns(l), I = Ns(i), R = Ns(c), z = y.useCallback(() => {
    if (!k.current || !A.current)
      return;
    const _ = {
      placement: t,
      strategy: n,
      middleware: h
    };
    I.current && (_.platform = I.current), $N(k.current, A.current, _).then((L) => {
      const S = {
        ...L,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: R.current !== !1
      };
      j.current && !so(D.current, S) && (D.current = S, yo.flushSync(() => {
        d(S);
      }));
    });
  }, [h, t, n, I, R]);
  Fi(() => {
    c === !1 && D.current.isPositioned && (D.current.isPositioned = !1, d((_) => ({
      ..._,
      isPositioned: !1
    })));
  }, [c]);
  const j = y.useRef(!1);
  Fi(() => (j.current = !0, () => {
    j.current = !1;
  }), []), Fi(() => {
    if (T && (k.current = T), E && (A.current = E), T && E) {
      if (P.current)
        return P.current(T, E, z);
      z();
    }
  }, [T, E, z, P, F]);
  const W = y.useMemo(() => ({
    reference: k,
    floating: A,
    setReference: x,
    setFloating: w
  }), [x, w]), V = y.useMemo(() => ({
    reference: T,
    floating: E
  }), [T, E]), N = y.useMemo(() => {
    const _ = {
      position: n,
      left: 0,
      top: 0
    };
    if (!V.floating)
      return _;
    const L = Gd(V.floating, u.x), S = Gd(V.floating, u.y);
    return a ? {
      ..._,
      transform: "translate(" + L + "px, " + S + "px)",
      ...Dm(V.floating) >= 1.5 && {
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
    update: z,
    refs: W,
    elements: V,
    floatingStyles: N
  }), [u, z, W, V, N]);
}
const WN = (e) => {
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
      return r && t(r) ? r.current != null ? Kd({
        element: r.current,
        padding: i
      }).fn(n) : {} : r ? Kd({
        element: r,
        padding: i
      }).fn(n) : {};
    }
  };
}, qN = (e, t) => ({
  ...LN(e),
  options: [e, t]
}), KN = (e, t) => ({
  ..._N(e),
  options: [e, t]
}), GN = (e, t) => ({
  ...BN(e),
  options: [e, t]
}), YN = (e, t) => ({
  ...FN(e),
  options: [e, t]
}), XN = (e, t) => ({
  ...VN(e),
  options: [e, t]
}), ZN = (e, t) => ({
  ...zN(e),
  options: [e, t]
}), JN = (e, t) => ({
  ...WN(e),
  options: [e, t]
});
var QN = "Arrow", Mm = y.forwardRef((e, t) => {
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
Mm.displayName = QN;
var eI = Mm;
function Hl(e) {
  const [t, n] = y.useState(void 0);
  return Xe(() => {
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
var Wl = "Popper", [Om, Cr] = sn(Wl), [tI, Lm] = Om(Wl), _m = (e) => {
  const { __scopePopper: t, children: n } = e, [r, i] = y.useState(null);
  return /* @__PURE__ */ g(tI, { scope: t, anchor: r, onAnchorChange: i, children: n });
};
_m.displayName = Wl;
var Fm = "PopperAnchor", Vm = y.forwardRef(
  (e, t) => {
    const { __scopePopper: n, virtualRef: r, ...i } = e, o = Lm(Fm, n), s = y.useRef(null), a = we(t, s), l = y.useRef(null);
    return y.useEffect(() => {
      const c = l.current;
      l.current = (r == null ? void 0 : r.current) || s.current, c !== l.current && o.onAnchorChange(l.current);
    }), r ? null : /* @__PURE__ */ g(he.div, { ...i, ref: a });
  }
);
Vm.displayName = Fm;
var ql = "PopperContent", [nI, rI] = Om(ql), zm = y.forwardRef(
  (e, t) => {
    var B, G, ge, re, oe, de;
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
    } = e, b = Lm(ql, n), [v, x] = y.useState(null), w = we(t, (je) => x(je)), [T, E] = y.useState(null), k = Hl(T), A = (k == null ? void 0 : k.width) ?? 0, D = (k == null ? void 0 : k.height) ?? 0, F = r + (o !== "center" ? "-" + o : ""), P = typeof u == "number" ? u : { top: 0, right: 0, bottom: 0, left: 0, ...u }, I = Array.isArray(c) ? c : [c], R = I.length > 0, z = {
      padding: P,
      boundary: I.filter(oI),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: R
    }, { refs: j, floatingStyles: W, placement: V, isPositioned: N, middlewareData: _ } = HN({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: F,
      whileElementsMounted: (...je) => ON(...je, {
        animationFrame: f === "always"
      }),
      elements: {
        reference: b.anchor
      },
      middleware: [
        qN({ mainAxis: i + D, alignmentAxis: s }),
        l && KN({
          mainAxis: !0,
          crossAxis: !1,
          limiter: d === "partial" ? GN() : void 0,
          ...z
        }),
        l && YN({ ...z }),
        XN({
          ...z,
          apply: ({ elements: je, rects: Ke, availableWidth: wt, availableHeight: ct }) => {
            const { width: mt, height: Yt } = Ke.reference, Et = je.floating.style;
            Et.setProperty("--radix-popper-available-width", `${wt}px`), Et.setProperty("--radix-popper-available-height", `${ct}px`), Et.setProperty("--radix-popper-anchor-width", `${mt}px`), Et.setProperty("--radix-popper-anchor-height", `${Yt}px`);
          }
        }),
        T && JN({ element: T, padding: a }),
        sI({ arrowWidth: A, arrowHeight: D }),
        h && ZN({ strategy: "referenceHidden", ...z })
      ]
    }), [L, S] = jm(V), te = Fn(m);
    Xe(() => {
      N && (te == null || te());
    }, [N, te]);
    const X = (B = _.arrow) == null ? void 0 : B.x, C = (G = _.arrow) == null ? void 0 : G.y, J = ((ge = _.arrow) == null ? void 0 : ge.centerOffset) !== 0, [q, K] = y.useState();
    return Xe(() => {
      v && K(window.getComputedStyle(v).zIndex);
    }, [v]), /* @__PURE__ */ g(
      "div",
      {
        ref: j.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...W,
          transform: N ? W.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: q,
          "--radix-popper-transform-origin": [
            (re = _.transformOrigin) == null ? void 0 : re.x,
            (oe = _.transformOrigin) == null ? void 0 : oe.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...((de = _.hide) == null ? void 0 : de.referenceHidden) && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ g(
          nI,
          {
            scope: n,
            placedSide: L,
            onArrowChange: E,
            arrowX: X,
            arrowY: C,
            shouldHideArrow: J,
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
                  animation: N ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
zm.displayName = ql;
var Bm = "PopperArrow", iI = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, $m = y.forwardRef(function(t, n) {
  const { __scopePopper: r, ...i } = t, o = rI(Bm, r), s = iI[o.placedSide];
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
          eI,
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
$m.displayName = Bm;
function oI(e) {
  return e !== null;
}
var sI = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    var b, v, x;
    const { placement: n, rects: r, middlewareData: i } = t, s = ((b = i.arrow) == null ? void 0 : b.centerOffset) !== 0, a = s ? 0 : e.arrowWidth, l = s ? 0 : e.arrowHeight, [c, u] = jm(n), d = { start: "0%", center: "50%", end: "100%" }[u], h = (((v = i.arrow) == null ? void 0 : v.x) ?? 0) + a / 2, f = (((x = i.arrow) == null ? void 0 : x.y) ?? 0) + l / 2;
    let m = "", p = "";
    return c === "bottom" ? (m = s ? d : `${h}px`, p = `${-l}px`) : c === "top" ? (m = s ? d : `${h}px`, p = `${r.floating.height + l}px`) : c === "right" ? (m = `${-l}px`, p = s ? d : `${f}px`) : c === "left" && (m = `${r.floating.width + l}px`, p = s ? d : `${f}px`), { data: { x: m, y: p } };
  }
});
function jm(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var Kl = _m, zo = Vm, Gl = zm, Yl = $m, aI = "Portal", hi = y.forwardRef((e, t) => {
  var a;
  const { container: n, ...r } = e, [i, o] = y.useState(!1);
  Xe(() => o(!0), []);
  const s = n || i && ((a = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : a.body);
  return s ? mf.createPortal(/* @__PURE__ */ g(he.div, { ...r, ref: t }), s) : null;
});
hi.displayName = aI;
// @__NO_SIDE_EFFECTS__
function lI(e) {
  const t = /* @__PURE__ */ cI(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(dI);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function cI(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = hI(i), a = fI(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? jn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var uI = Symbol("radix.slottable");
function dI(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === uI;
}
function fI(e, t) {
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
function hI(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var pI = function(e) {
  if (typeof document > "u")
    return null;
  var t = Array.isArray(e) ? e[0] : e;
  return t.ownerDocument.body;
}, Kn = /* @__PURE__ */ new WeakMap(), Pi = /* @__PURE__ */ new WeakMap(), Ai = {}, Is = 0, Um = function(e) {
  return e && (e.host || Um(e.parentNode));
}, mI = function(e, t) {
  return t.map(function(n) {
    if (e.contains(n))
      return n;
    var r = Um(n);
    return r && e.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, gI = function(e, t, n, r) {
  var i = mI(t, Array.isArray(e) ? e : [e]);
  Ai[n] || (Ai[n] = /* @__PURE__ */ new WeakMap());
  var o = Ai[n], s = [], a = /* @__PURE__ */ new Set(), l = new Set(i), c = function(d) {
    !d || a.has(d) || (a.add(d), c(d.parentNode));
  };
  i.forEach(c);
  var u = function(d) {
    !d || l.has(d) || Array.prototype.forEach.call(d.children, function(h) {
      if (a.has(h))
        u(h);
      else
        try {
          var f = h.getAttribute(r), m = f !== null && f !== "false", p = (Kn.get(h) || 0) + 1, b = (o.get(h) || 0) + 1;
          Kn.set(h, p), o.set(h, b), s.push(h), p === 1 && m && Pi.set(h, !0), b === 1 && h.setAttribute(n, "true"), m || h.setAttribute(r, "true");
        } catch (v) {
          console.error("aria-hidden: cannot operate on ", h, v);
        }
    });
  };
  return u(t), a.clear(), Is++, function() {
    s.forEach(function(d) {
      var h = Kn.get(d) - 1, f = o.get(d) - 1;
      Kn.set(d, h), o.set(d, f), h || (Pi.has(d) || d.removeAttribute(r), Pi.delete(d)), f || d.removeAttribute(n);
    }), Is--, Is || (Kn = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), Pi = /* @__PURE__ */ new WeakMap(), Ai = {});
  };
}, Xl = function(e, t, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(e) ? e : [e]), i = pI(e);
  return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), gI(r, i, n, "aria-hidden")) : function() {
    return null;
  };
}, zt = function() {
  return zt = Object.assign || function(t) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, zt.apply(this, arguments);
};
function Hm(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
}
function yI(e, t, n) {
  if (n || arguments.length === 2) for (var r = 0, i = t.length, o; r < i; r++)
    (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var Vi = "right-scroll-bar-position", zi = "width-before-scroll-bar", vI = "with-scroll-bars-hidden", bI = "--removed-body-scroll-bar-size";
function Ds(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function xI(e, t) {
  var n = se(function() {
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
var wI = typeof window < "u" ? y.useLayoutEffect : y.useEffect, Yd = /* @__PURE__ */ new WeakMap();
function SI(e, t) {
  var n = xI(null, function(r) {
    return e.forEach(function(i) {
      return Ds(i, r);
    });
  });
  return wI(function() {
    var r = Yd.get(n);
    if (r) {
      var i = new Set(r), o = new Set(e), s = n.current;
      i.forEach(function(a) {
        o.has(a) || Ds(a, null);
      }), o.forEach(function(a) {
        i.has(a) || Ds(a, s);
      });
    }
    Yd.set(n, e);
  }, [e]), n;
}
function kI(e) {
  return e;
}
function CI(e, t) {
  t === void 0 && (t = kI);
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
function TI(e) {
  e === void 0 && (e = {});
  var t = CI(null);
  return t.options = zt({ async: !0, ssr: !1 }, e), t;
}
var Wm = function(e) {
  var t = e.sideCar, n = Hm(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return y.createElement(r, zt({}, n));
};
Wm.isSideCarExport = !0;
function EI(e, t) {
  return e.useMedium(t), Wm;
}
var qm = TI(), Ms = function() {
}, Bo = y.forwardRef(function(e, t) {
  var n = y.useRef(null), r = y.useState({
    onScrollCapture: Ms,
    onWheelCapture: Ms,
    onTouchMoveCapture: Ms
  }), i = r[0], o = r[1], s = e.forwardProps, a = e.children, l = e.className, c = e.removeScrollBar, u = e.enabled, d = e.shards, h = e.sideCar, f = e.noRelative, m = e.noIsolation, p = e.inert, b = e.allowPinchZoom, v = e.as, x = v === void 0 ? "div" : v, w = e.gapMode, T = Hm(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), E = h, k = SI([n, t]), A = zt(zt({}, T), i);
  return y.createElement(
    y.Fragment,
    null,
    u && y.createElement(E, { sideCar: qm, removeScrollBar: c, shards: d, noRelative: f, noIsolation: m, inert: p, setCallbacks: o, allowPinchZoom: !!b, lockRef: n, gapMode: w }),
    s ? y.cloneElement(y.Children.only(a), zt(zt({}, A), { ref: k })) : y.createElement(x, zt({}, A, { className: l, ref: k }), a)
  );
});
Bo.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Bo.classNames = {
  fullWidth: zi,
  zeroRight: Vi
};
var PI = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function AI() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = PI();
  return t && e.setAttribute("nonce", t), e;
}
function RI(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function NI(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var II = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = AI()) && (RI(t, n), NI(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, DI = function() {
  var e = II();
  return function(t, n) {
    y.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, Km = function() {
  var e = DI(), t = function(n) {
    var r = n.styles, i = n.dynamic;
    return e(r, i), null;
  };
  return t;
}, MI = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, Os = function(e) {
  return parseInt(e || "", 10) || 0;
}, OI = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [Os(n), Os(r), Os(i)];
}, LI = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return MI;
  var t = OI(e), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, r - n + t[2] - t[0])
  };
}, _I = Km(), or = "data-scroll-locked", FI = function(e, t, n, r) {
  var i = e.left, o = e.top, s = e.right, a = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(vI, ` {
   overflow: hidden `).concat(r, `;
   padding-right: `).concat(a, "px ").concat(r, `;
  }
  body[`).concat(or, `] {
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
  
  .`).concat(Vi, ` {
    right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(zi, ` {
    margin-right: `).concat(a, "px ").concat(r, `;
  }
  
  .`).concat(Vi, " .").concat(Vi, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(zi, " .").concat(zi, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(or, `] {
    `).concat(bI, ": ").concat(a, `px;
  }
`);
}, Xd = function() {
  var e = parseInt(document.body.getAttribute(or) || "0", 10);
  return isFinite(e) ? e : 0;
}, VI = function() {
  y.useEffect(function() {
    return document.body.setAttribute(or, (Xd() + 1).toString()), function() {
      var e = Xd() - 1;
      e <= 0 ? document.body.removeAttribute(or) : document.body.setAttribute(or, e.toString());
    };
  }, []);
}, zI = function(e) {
  var t = e.noRelative, n = e.noImportant, r = e.gapMode, i = r === void 0 ? "margin" : r;
  VI();
  var o = y.useMemo(function() {
    return LI(i);
  }, [i]);
  return y.createElement(_I, { styles: FI(o, !t, i, n ? "" : "!important") });
}, ma = !1;
if (typeof window < "u")
  try {
    var Ri = Object.defineProperty({}, "passive", {
      get: function() {
        return ma = !0, !0;
      }
    });
    window.addEventListener("test", Ri, Ri), window.removeEventListener("test", Ri, Ri);
  } catch {
    ma = !1;
  }
var Gn = ma ? { passive: !1 } : !1, BI = function(e) {
  return e.tagName === "TEXTAREA";
}, Gm = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !BI(e) && n[t] === "visible")
  );
}, $I = function(e) {
  return Gm(e, "overflowY");
}, jI = function(e) {
  return Gm(e, "overflowX");
}, Zd = function(e, t) {
  var n = t.ownerDocument, r = t;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var i = Ym(e, r);
    if (i) {
      var o = Xm(e, r), s = o[1], a = o[2];
      if (s > a)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, UI = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, r = e.clientHeight;
  return [
    t,
    n,
    r
  ];
}, HI = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, r = e.clientWidth;
  return [
    t,
    n,
    r
  ];
}, Ym = function(e, t) {
  return e === "v" ? $I(t) : jI(t);
}, Xm = function(e, t) {
  return e === "v" ? UI(t) : HI(t);
}, WI = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, qI = function(e, t, n, r, i) {
  var o = WI(e, window.getComputedStyle(t).direction), s = o * r, a = n.target, l = t.contains(a), c = !1, u = s > 0, d = 0, h = 0;
  do {
    if (!a)
      break;
    var f = Xm(e, a), m = f[0], p = f[1], b = f[2], v = p - b - o * m;
    (m || v) && Ym(e, a) && (d += v, h += m);
    var x = a.parentNode;
    a = x && x.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? x.host : x;
  } while (
    // portaled content
    !l && a !== document.body || // self content
    l && (t.contains(a) || t === a)
  );
  return (u && Math.abs(d) < 1 || !u && Math.abs(h) < 1) && (c = !0), c;
}, Ni = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Jd = function(e) {
  return [e.deltaX, e.deltaY];
}, Qd = function(e) {
  return e && "current" in e ? e.current : e;
}, KI = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, GI = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, YI = 0, Yn = [];
function XI(e) {
  var t = y.useRef([]), n = y.useRef([0, 0]), r = y.useRef(), i = y.useState(YI++)[0], o = y.useState(Km)[0], s = y.useRef(e);
  y.useEffect(function() {
    s.current = e;
  }, [e]), y.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(i));
      var p = yI([e.lockRef.current], (e.shards || []).map(Qd), !0).filter(Boolean);
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
    var v = Ni(p), x = n.current, w = "deltaX" in p ? p.deltaX : x[0] - v[0], T = "deltaY" in p ? p.deltaY : x[1] - v[1], E, k = p.target, A = Math.abs(w) > Math.abs(T) ? "h" : "v";
    if ("touches" in p && A === "h" && k.type === "range")
      return !1;
    var D = window.getSelection(), F = D && D.anchorNode, P = F ? F === k || F.contains(k) : !1;
    if (P)
      return !1;
    var I = Zd(A, k);
    if (!I)
      return !0;
    if (I ? E = A : (E = A === "v" ? "h" : "v", I = Zd(A, k)), !I)
      return !1;
    if (!r.current && "changedTouches" in p && (w || T) && (r.current = E), !E)
      return !0;
    var R = r.current || E;
    return qI(R, b, p, R === "h" ? w : T);
  }, []), l = y.useCallback(function(p) {
    var b = p;
    if (!(!Yn.length || Yn[Yn.length - 1] !== o)) {
      var v = "deltaY" in b ? Jd(b) : Ni(b), x = t.current.filter(function(E) {
        return E.name === b.type && (E.target === b.target || b.target === E.shadowParent) && KI(E.delta, v);
      })[0];
      if (x && x.should) {
        b.cancelable && b.preventDefault();
        return;
      }
      if (!x) {
        var w = (s.current.shards || []).map(Qd).filter(Boolean).filter(function(E) {
          return E.contains(b.target);
        }), T = w.length > 0 ? a(b, w[0]) : !s.current.noIsolation;
        T && b.cancelable && b.preventDefault();
      }
    }
  }, []), c = y.useCallback(function(p, b, v, x) {
    var w = { name: p, delta: b, target: v, should: x, shadowParent: ZI(v) };
    t.current.push(w), setTimeout(function() {
      t.current = t.current.filter(function(T) {
        return T !== w;
      });
    }, 1);
  }, []), u = y.useCallback(function(p) {
    n.current = Ni(p), r.current = void 0;
  }, []), d = y.useCallback(function(p) {
    c(p.type, Jd(p), p.target, a(p, e.lockRef.current));
  }, []), h = y.useCallback(function(p) {
    c(p.type, Ni(p), p.target, a(p, e.lockRef.current));
  }, []);
  y.useEffect(function() {
    return Yn.push(o), e.setCallbacks({
      onScrollCapture: d,
      onWheelCapture: d,
      onTouchMoveCapture: h
    }), document.addEventListener("wheel", l, Gn), document.addEventListener("touchmove", l, Gn), document.addEventListener("touchstart", u, Gn), function() {
      Yn = Yn.filter(function(p) {
        return p !== o;
      }), document.removeEventListener("wheel", l, Gn), document.removeEventListener("touchmove", l, Gn), document.removeEventListener("touchstart", u, Gn);
    };
  }, []);
  var f = e.removeScrollBar, m = e.inert;
  return y.createElement(
    y.Fragment,
    null,
    m ? y.createElement(o, { styles: GI(i) }) : null,
    f ? y.createElement(zI, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function ZI(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const JI = EI(qm, XI);
var $o = y.forwardRef(function(e, t) {
  return y.createElement(Bo, zt({}, e, { ref: t, sideCar: JI }));
});
$o.classNames = Bo.classNames;
var jo = "Popover", [Zm] = sn(jo, [
  Cr
]), pi = Cr(), [QI, Cn] = Zm(jo), Jm = (e) => {
  const {
    __scopePopover: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !1
  } = e, a = pi(t), l = y.useRef(null), [c, u] = y.useState(!1), [d, h] = bn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: jo
  });
  return /* @__PURE__ */ g(Kl, { ...a, children: /* @__PURE__ */ g(
    QI,
    {
      scope: t,
      contentId: en(),
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
Jm.displayName = jo;
var Qm = "PopoverAnchor", e2 = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = Cn(Qm, n), o = pi(n), { onCustomAnchorAdd: s, onCustomAnchorRemove: a } = i;
    return y.useEffect(() => (s(), () => a()), [s, a]), /* @__PURE__ */ g(zo, { ...o, ...r, ref: t });
  }
);
e2.displayName = Qm;
var eg = "PopoverTrigger", tg = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = Cn(eg, n), o = pi(n), s = we(t, i.triggerRef), a = /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": sg(i.open),
        ...r,
        ref: s,
        onClick: le(e.onClick, i.onOpenToggle)
      }
    );
    return i.hasCustomAnchor ? a : /* @__PURE__ */ g(zo, { asChild: !0, ...o, children: a });
  }
);
tg.displayName = eg;
var Zl = "PopoverPortal", [t2, n2] = Zm(Zl, {
  forceMount: void 0
}), ng = (e) => {
  const { __scopePopover: t, forceMount: n, children: r, container: i } = e, o = Cn(Zl, t);
  return /* @__PURE__ */ g(t2, { scope: t, forceMount: n, children: /* @__PURE__ */ g(an, { present: n || o.open, children: /* @__PURE__ */ g(hi, { asChild: !0, container: i, children: r }) }) });
};
ng.displayName = Zl;
var dr = "PopoverContent", rg = y.forwardRef(
  (e, t) => {
    const n = n2(dr, e.__scopePopover), { forceMount: r = n.forceMount, ...i } = e, o = Cn(dr, e.__scopePopover);
    return /* @__PURE__ */ g(an, { present: r || o.open, children: o.modal ? /* @__PURE__ */ g(i2, { ...i, ref: t }) : /* @__PURE__ */ g(o2, { ...i, ref: t }) });
  }
);
rg.displayName = dr;
var r2 = /* @__PURE__ */ lI("PopoverContent.RemoveScroll"), i2 = y.forwardRef(
  (e, t) => {
    const n = Cn(dr, e.__scopePopover), r = y.useRef(null), i = we(t, r), o = y.useRef(!1);
    return y.useEffect(() => {
      const s = r.current;
      if (s) return Xl(s);
    }, []), /* @__PURE__ */ g($o, { as: r2, allowPinchZoom: !0, children: /* @__PURE__ */ g(
      ig,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: le(e.onCloseAutoFocus, (s) => {
          var a;
          s.preventDefault(), o.current || (a = n.triggerRef.current) == null || a.focus();
        }),
        onPointerDownOutside: le(
          e.onPointerDownOutside,
          (s) => {
            const a = s.detail.originalEvent, l = a.button === 0 && a.ctrlKey === !0, c = a.button === 2 || l;
            o.current = c;
          },
          { checkForDefaultPrevented: !1 }
        ),
        onFocusOutside: le(
          e.onFocusOutside,
          (s) => s.preventDefault(),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
), o2 = y.forwardRef(
  (e, t) => {
    const n = Cn(dr, e.__scopePopover), r = y.useRef(!1), i = y.useRef(!1);
    return /* @__PURE__ */ g(
      ig,
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
), ig = y.forwardRef(
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
    } = e, h = Cn(dr, n), f = pi(n);
    return Fl(), /* @__PURE__ */ g(
      Oo,
      {
        asChild: !0,
        loop: !0,
        trapped: r,
        onMountAutoFocus: i,
        onUnmountAutoFocus: o,
        children: /* @__PURE__ */ g(
          di,
          {
            asChild: !0,
            disableOutsidePointerEvents: s,
            onInteractOutside: u,
            onEscapeKeyDown: a,
            onPointerDownOutside: l,
            onFocusOutside: c,
            onDismiss: () => h.onOpenChange(!1),
            children: /* @__PURE__ */ g(
              Gl,
              {
                "data-state": sg(h.open),
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
), og = "PopoverClose", s2 = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = Cn(og, n);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: le(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
s2.displayName = og;
var a2 = "PopoverArrow", l2 = y.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, i = pi(n);
    return /* @__PURE__ */ g(Yl, { ...i, ...r, ref: t });
  }
);
l2.displayName = a2;
function sg(e) {
  return e ? "open" : "closed";
}
var c2 = Jm, u2 = tg, d2 = ng, f2 = rg;
function Jl({
  ...e
}) {
  return /* @__PURE__ */ g(c2, { "data-slot": "popover", ...e });
}
function Ql({
  ...e
}) {
  return /* @__PURE__ */ g(u2, { "data-slot": "popover-trigger", ...e });
}
function ec({
  className: e,
  align: t = "center",
  sideOffset: n = 4,
  ...r
}) {
  return /* @__PURE__ */ g(d2, { children: /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ g(
    f2,
    {
      "data-slot": "popover-content",
      align: t,
      sideOffset: n,
      className: Y(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-none",
        e
      ),
      ...r
    }
  ) }) });
}
function ga({ content: e, className: t }) {
  let n = null, r = !1;
  if (typeof e == "string")
    try {
      n = JSON.parse(e), typeof n == "object" && n !== null && (r = !0);
    } catch {
    }
  else typeof e == "object" && e !== null && (n = e, r = !0);
  if (!r)
    return /* @__PURE__ */ g("code", { className: Y("rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", t), children: typeof e == "string" ? e : JSON.stringify(e) });
  const i = Array.isArray(n) ? `Array [${n.length}]` : "Data", o = JSON.stringify(n, null, 2);
  return /* @__PURE__ */ O(Jl, { children: [
    /* @__PURE__ */ g(Ql, { asChild: !0, children: /* @__PURE__ */ O(
      "button",
      {
        className: Y(
          "inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer select-none",
          t
        ),
        children: [
          /* @__PURE__ */ g(cc, { className: "h-3 w-3" }),
          /* @__PURE__ */ g("span", { className: "truncate max-w-[200px]", children: i })
        ]
      }
    ) }),
    /* @__PURE__ */ O(ec, { className: "w-[500px] max-w-[90vw] p-0", align: "start", children: [
      /* @__PURE__ */ O("div", { className: "flex items-center justify-between border-b px-3 py-2 bg-muted/30", children: [
        /* @__PURE__ */ O("div", { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
          /* @__PURE__ */ g(cc, { className: "h-4 w-4" }),
          /* @__PURE__ */ g("span", { children: "Data Viewer" })
        ] }),
        /* @__PURE__ */ g(no, { content: o, copyMessage: "Copied JSON" })
      ] }),
      /* @__PURE__ */ g("div", { className: "max-h-[500px] overflow-auto p-4 bg-background", children: /* @__PURE__ */ g("pre", { className: "text-xs font-mono whitespace-pre-wrap break-words text-foreground", children: o }) })
    ] })
  ] });
}
function ef({ children: e }) {
  return /* @__PURE__ */ g("div", { className: "space-y-3", children: /* @__PURE__ */ g($E, { remarkPlugins: [eR], components: m2, children: e }) });
}
function h2({ children: e, language: t, ...n }) {
  const [r, i] = se(null), o = De(n);
  return o.current = n, $e(() => {
    i(null);
    let s = !1;
    const a = o.current;
    return import("./index-1NgKGSEN.js").then(({ codeToTokens: l, bundledLanguages: c }) => {
      if (!s) {
        if (!(t in c)) {
          i(/* @__PURE__ */ g("pre", { ...a, children: e }));
          return;
        }
        l(e, {
          lang: t,
          defaultColor: !1,
          themes: {
            light: "github-light",
            dark: "github-dark"
          }
        }).then(({ tokens: u }) => {
          if (s) return;
          const d = o.current;
          i(
            /* @__PURE__ */ g("pre", { ...d, children: /* @__PURE__ */ g("code", { children: u.map((h, f) => /* @__PURE__ */ O(U.Fragment, { children: [
              /* @__PURE__ */ g("span", { children: h.map((m, p) => {
                const b = typeof m.htmlStyle == "string" ? void 0 : m.htmlStyle;
                return /* @__PURE__ */ g(
                  "span",
                  {
                    className: "text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg",
                    style: b,
                    children: m.content
                  },
                  p
                );
              }) }),
              f !== u.length - 1 && `
`
            ] }, f)) }) })
          );
        });
      }
    }), () => {
      s = !0;
    };
  }, [e, t]), r !== null ? r : /* @__PURE__ */ g("pre", { ...n, children: e });
}
const ag = U.memo(h2);
ag.displayName = "HighlightedCode";
const p2 = ({
  children: e,
  className: t,
  language: n,
  ...r
}) => {
  const i = typeof e == "string" ? e : ao(e), o = Y(
    "overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    t
  );
  return /* @__PURE__ */ O("div", { className: "group/code relative mb-4", children: [
    /* @__PURE__ */ g(
      Ky,
      {
        fallback: /* @__PURE__ */ g("pre", { className: o, ...r, children: e }),
        children: /* @__PURE__ */ g(ag, { language: n, className: o, children: i })
      }
    ),
    /* @__PURE__ */ g("div", { className: "invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100", children: /* @__PURE__ */ g(no, { content: i, copyMessage: "Copied code to clipboard" }) })
  ] });
};
function ao(e) {
  var t;
  if (typeof e == "string")
    return e;
  if ((t = e == null ? void 0 : e.props) != null && t.children) {
    let n = e.props.children;
    return Array.isArray(n) ? n.map((r) => ao(r)).join("") : ao(n);
  }
  return "";
}
const m2 = {
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
    return a ? /* @__PURE__ */ g(ga, { content: s }) : i ? /* @__PURE__ */ g(p2, { className: t, language: i[1], ...r, children: e }) : /* @__PURE__ */ g(
      "code",
      {
        className: Y(
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
    const i = ao(e).trim();
    if (i.startsWith("{") && i.endsWith("}") || i.startsWith("[") && i.endsWith("]"))
      try {
        const s = JSON.parse(i);
        if (typeof s == "object" && s !== null)
          return /* @__PURE__ */ g("div", { className: "my-2", children: /* @__PURE__ */ g(ga, { content: i }) });
      } catch {
      }
    return /* @__PURE__ */ g("p", { className: Y("whitespace-pre-wrap", t), ...n, children: e });
  },
  hr: Je("hr", "border-foreground/20")
};
function Je(e, t) {
  const n = ({ node: r, ...i }) => /* @__PURE__ */ g(e, { className: t, ...i });
  return n.displayName = e, n;
}
const g2 = If(
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
), y2 = ({
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
  const [u, d] = se([]);
  $e(() => {
    if (!a || a.length === 0) {
      d([]);
      return;
    }
    (async () => {
      const x = await Promise.all(
        a.map(async (w) => {
          try {
            const T = await v2(w.url);
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
  const h = e === "user", f = e === "user" ? "user" : e === "tool" ? "tool" : e === "subagent" || s && s.startsWith("sub-agent-") ? "subagent" : "assistant", m = n == null ? void 0 : n.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }), p = ({ children: v, className: x }) => /* @__PURE__ */ g("div", { className: Y(
    "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm",
    x
  ), children: v }), b = () => f === "user" ? null : f === "assistant" ? /* @__PURE__ */ g(p, { className: "bg-gradient-to-tr from-primary to-primary/80 border-primary/20 text-primary-foreground", children: /* @__PURE__ */ g(vo, { className: "h-4 w-4" }) }) : f === "subagent" ? /* @__PURE__ */ g(p, { className: "bg-gradient-to-tr from-indigo-500 to-blue-500 border-indigo-400/20 text-white", children: /* @__PURE__ */ g(iv, { className: "h-4 w-4" }) }) : null;
  return !t && !l && (!c || c.length === 0) ? null : /* @__PURE__ */ O("div", { className: Y(
    "flex w-full gap-3 mb-6",
    h ? "flex-row-reverse" : "flex-row"
  ), children: [
    b(),
    /* @__PURE__ */ O("div", { className: Y(
      "flex flex-col gap-1.5",
      h ? "items-end max-w-[70%]" : "items-start max-w-full"
    ), children: [
      u && u.length > 0 && /* @__PURE__ */ g("div", { className: Y(
        "mb-1 flex flex-wrap gap-2",
        h ? "justify-end" : "justify-start"
      ), children: u.map((v, x) => /* @__PURE__ */ g(
        yl,
        {
          file: v,
          clickable: !0
        },
        x
      )) }),
      /* @__PURE__ */ O("div", { className: Y(g2({ variant: f, animation: i })), children: [
        c && c.length > 0 ? c.map((v, x) => v.type === "text" ? /* @__PURE__ */ g(tf, { variant: f, children: v.text }, x) : v.type === "reasoning" ? /* @__PURE__ */ g(b2, { part: v }, x) : v.type === "tool-invocation" ? /* @__PURE__ */ g(nf, { toolInvocations: [v.toolInvocation] }, x) : null) : l && l.length > 0 ? /* @__PURE__ */ g(nf, { toolInvocations: l }) : /* @__PURE__ */ g(tf, { variant: f, children: t }),
        o && /* @__PURE__ */ g("div", { className: "absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background/80 backdrop-blur-sm p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-md", children: o })
      ] }),
      r && n && /* @__PURE__ */ g(
        "time",
        {
          dateTime: n.toISOString(),
          className: Y(
            "px-1 text-[10px] font-medium text-muted-foreground/50",
            i !== "none" && "duration-500 animate-in fade-in-0"
          ),
          children: m
        }
      )
    ] })
  ] });
}, tf = ({
  children: e,
  threshold: t = 1e3,
  variant: n
}) => {
  const [r, i] = se(!1), o = e.length > t, s = Y(
    "mt-2 self-start text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer",
    n === "user" ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary hover:text-primary/80"
  );
  return !o || r ? /* @__PURE__ */ O("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ g(ef, { children: e }),
    o && /* @__PURE__ */ g("button", { onClick: () => i(!1), className: s, children: "Show less" })
  ] }) : /* @__PURE__ */ O("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ g(ef, { children: e.slice(0, t) + "..." }),
    /* @__PURE__ */ g("button", { onClick: () => i(!0), className: s, children: "Read more" })
  ] });
};
async function v2(e) {
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
const b2 = ({ part: e }) => {
  const [t, n] = se(!1);
  return /* @__PURE__ */ g("div", { className: "mb-2 flex flex-col items-start sm:max-w-[70%]", children: /* @__PURE__ */ O(
    aS,
    {
      open: t,
      onOpenChange: n,
      className: "group w-full overflow-hidden rounded-lg border bg-muted/50",
      children: [
        /* @__PURE__ */ g("div", { className: "flex items-center p-2", children: /* @__PURE__ */ g(lS, { asChild: !0, children: /* @__PURE__ */ O("button", { className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ g(Ia, { className: "h-4 w-4 transition-transform group-data-[state=open]:rotate-90" }),
          /* @__PURE__ */ g("span", { children: "Thinking" })
        ] }) }) }),
        /* @__PURE__ */ g(cS, { forceMount: !0, children: /* @__PURE__ */ g(
          nn.div,
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
function nf({
  toolInvocations: e
}) {
  return e != null && e.length ? /* @__PURE__ */ g("div", { className: "flex flex-col items-start gap-2", children: e.map((t, n) => {
    if (t.state === "result" && t.result.__cancelled === !0)
      return /* @__PURE__ */ O(
        "div",
        {
          className: "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
          children: [
            /* @__PURE__ */ g(rv, { className: "h-4 w-4" }),
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
              /* @__PURE__ */ g(vv, { className: "h-4 w-4" }),
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
              /* @__PURE__ */ g(Da, { className: "h-3 w-3 animate-spin" })
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
                /* @__PURE__ */ g(av, { className: "h-4 w-4" }),
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
              /* @__PURE__ */ g(ga, { content: t.result })
            ]
          },
          n
        );
      default:
        return null;
    }
  }) }) : null;
}
function x2(e, t, n) {
  let r = (i) => e(i, ...t);
  return n === void 0 ? r : Object.assign(r, { lazy: n, lazyArgs: t });
}
function lg(e, t, n) {
  let r = e.length - t.length;
  if (r === 0) return e(...t);
  if (r === 1) return x2(e, t, n);
  throw Error("Wrong number of arguments");
}
function rf(...e) {
  return lg(w2, e);
}
const w2 = (e, t) => e.length >= t;
function of(...e) {
  return lg(S2, e);
}
function S2(e, t) {
  if (!rf(t, 1)) return { ...e };
  if (!rf(t, 2)) {
    let { [t[0]]: r, ...i } = e;
    return i;
  }
  let n = { ...e };
  for (let r of t) delete n[r];
  return n;
}
const sf = function() {
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
function k2({
  transcribeAudio: e,
  onTranscriptionComplete: t
}) {
  const [n, r] = se(!1), [i, o] = se(!!e), [s, a] = se(!1), [l, c] = se(!1), [u, d] = se(null), h = De(null);
  $e(() => {
    (async () => {
      const b = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      o(b && !!e);
    })();
  }, [e]);
  const f = async () => {
    a(!1), c(!0);
    try {
      sf.stop();
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
          d(p), h.current = sf(p);
        } catch (p) {
          console.error("Error recording audio:", p), r(!1), a(!1), u && (u.getTracks().forEach((b) => b.stop()), d(null));
        }
    },
    stopRecording: f
  };
}
function C2({
  ref: e,
  maxHeight: t = Number.MAX_SAFE_INTEGER,
  borderWidth: n = 0,
  dependencies: r
}) {
  const i = De(null);
  Ra(() => {
    if (!e.current) return;
    const o = e.current, s = n * 2;
    i.current === null && (i.current = o.scrollHeight - s), o.style.removeProperty("height");
    const a = o.scrollHeight, l = Math.min(a, t), c = Math.max(l, i.current);
    o.style.height = `${c + s}px`;
  }, [t, e, ...r]);
}
const hn = {
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
function T2({
  stream: e,
  isRecording: t,
  onClick: n
}) {
  const r = De(null), i = De(null), o = De(null), s = De(null), a = De(null), l = () => {
    s.current && cancelAnimationFrame(s.current), i.current && i.current.close();
  };
  $e(() => l, []), $e(() => {
    e && t ? c() : l();
  }, [e, t]), $e(() => {
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
      m.fftSize = hn.FFT_SIZE, m.smoothingTimeConstant = hn.SMOOTHING, o.current = m, f.createMediaStreamSource(e).connect(m), h();
    } catch (f) {
      console.error("Error starting visualization:", f);
    }
  }, u = (f) => {
    const m = Math.floor(f * hn.COLOR.INTENSITY_RANGE) + hn.COLOR.MIN_INTENSITY;
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
      const T = Math.max(
        hn.MIN_BAR_WIDTH,
        f.width / p / v - hn.BAR_SPACING
      ), E = f.height / p / 2;
      let k = 0;
      for (let A = 0; A < v; A++) {
        const D = x[A] / 255, F = Math.max(
          hn.MIN_BAR_HEIGHT,
          D * E
        );
        d(
          m,
          k,
          E,
          T,
          F,
          u(D)
        ), k += T + hn.BAR_SPACING;
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
function E2({ isOpen: e, close: t }) {
  return /* @__PURE__ */ g(xo, { children: e && /* @__PURE__ */ O(
    nn.div,
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
            children: /* @__PURE__ */ g(mr, { className: "h-3 w-3" })
          }
        )
      ]
    }
  ) });
}
const af = [hv, vo, gv, sv];
function ya({
  label: e,
  append: t,
  suggestions: n
}) {
  return /* @__PURE__ */ O("div", { className: "flex h-full flex-col items-center justify-start sm:justify-center space-y-8 sm:space-y-12 px-4 py-8 sm:py-12 md:py-16 animate-in fade-in zoom-in-95 duration-700 overflow-y-auto", children: [
    /* @__PURE__ */ O("div", { className: "space-y-4 sm:space-y-6 text-center max-w-2xl", children: [
      /* @__PURE__ */ g("div", { className: "mx-auto flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent shadow-inner mb-4 sm:mb-8 ring-1 ring-primary/20", children: /* @__PURE__ */ g(vo, { className: "h-7 w-7 sm:h-10 sm:w-10 text-primary animate-pulse" }) }),
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
        const o = af[i % af.length];
        return /* @__PURE__ */ O(
          "button",
          {
            onClick: () => t({ role: "user", content: r }),
            className: Y(
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
                  /* @__PURE__ */ g(Ia, { className: "h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" })
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
var P2 = Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function A2(e) {
  const t = ({ children: n }) => /* @__PURE__ */ g(Wt, { children: n });
  return t.displayName = `${e}.Slottable`, t.__radixId = P2, t;
}
var cg = Object.freeze({
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
}), R2 = "VisuallyHidden", ug = y.forwardRef(
  (e, t) => /* @__PURE__ */ g(
    he.span,
    {
      ...e,
      ref: t,
      style: { ...cg, ...e.style }
    }
  )
);
ug.displayName = R2;
var N2 = ug, [Uo] = sn("Tooltip", [
  Cr
]), Ho = Cr(), dg = "TooltipProvider", I2 = 700, va = "tooltip.open", [D2, tc] = Uo(dg), fg = (e) => {
  const {
    __scopeTooltip: t,
    delayDuration: n = I2,
    skipDelayDuration: r = 300,
    disableHoverableContent: i = !1,
    children: o
  } = e, s = y.useRef(!0), a = y.useRef(!1), l = y.useRef(0);
  return y.useEffect(() => {
    const c = l.current;
    return () => window.clearTimeout(c);
  }, []), /* @__PURE__ */ g(
    D2,
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
fg.displayName = dg;
var ti = "Tooltip", [M2, mi] = Uo(ti), hg = (e) => {
  const {
    __scopeTooltip: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    disableHoverableContent: s,
    delayDuration: a
  } = e, l = tc(ti, e.__scopeTooltip), c = Ho(t), [u, d] = y.useState(null), h = en(), f = y.useRef(0), m = s ?? l.disableHoverableContent, p = a ?? l.delayDuration, b = y.useRef(!1), [v, x] = bn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: (A) => {
      A ? (l.onOpen(), document.dispatchEvent(new CustomEvent(va))) : l.onClose(), o == null || o(A);
    },
    caller: ti
  }), w = y.useMemo(() => v ? b.current ? "delayed-open" : "instant-open" : "closed", [v]), T = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, b.current = !1, x(!0);
  }, [x]), E = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, x(!1);
  }, [x]), k = y.useCallback(() => {
    window.clearTimeout(f.current), f.current = window.setTimeout(() => {
      b.current = !0, x(!0), f.current = 0;
    }, p);
  }, [p, x]);
  return y.useEffect(() => () => {
    f.current && (window.clearTimeout(f.current), f.current = 0);
  }, []), /* @__PURE__ */ g(Kl, { ...c, children: /* @__PURE__ */ g(
    M2,
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
        m ? E() : (window.clearTimeout(f.current), f.current = 0);
      }, [E, m]),
      onOpen: T,
      onClose: E,
      disableHoverableContent: m,
      children: n
    }
  ) });
};
hg.displayName = ti;
var ba = "TooltipTrigger", pg = y.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = mi(ba, n), o = tc(ba, n), s = Ho(n), a = y.useRef(null), l = we(t, a, i.onTriggerChange), c = y.useRef(!1), u = y.useRef(!1), d = y.useCallback(() => c.current = !1, []);
    return y.useEffect(() => () => document.removeEventListener("pointerup", d), [d]), /* @__PURE__ */ g(zo, { asChild: !0, ...s, children: /* @__PURE__ */ g(
      he.button,
      {
        "aria-describedby": i.open ? i.contentId : void 0,
        "data-state": i.stateAttribute,
        ...r,
        ref: l,
        onPointerMove: le(e.onPointerMove, (h) => {
          h.pointerType !== "touch" && !u.current && !o.isPointerInTransitRef.current && (i.onTriggerEnter(), u.current = !0);
        }),
        onPointerLeave: le(e.onPointerLeave, () => {
          i.onTriggerLeave(), u.current = !1;
        }),
        onPointerDown: le(e.onPointerDown, () => {
          i.open && i.onClose(), c.current = !0, document.addEventListener("pointerup", d, { once: !0 });
        }),
        onFocus: le(e.onFocus, () => {
          c.current || i.onOpen();
        }),
        onBlur: le(e.onBlur, i.onClose),
        onClick: le(e.onClick, i.onClose)
      }
    ) });
  }
);
pg.displayName = ba;
var nc = "TooltipPortal", [O2, L2] = Uo(nc, {
  forceMount: void 0
}), mg = (e) => {
  const { __scopeTooltip: t, forceMount: n, children: r, container: i } = e, o = mi(nc, t);
  return /* @__PURE__ */ g(O2, { scope: t, forceMount: n, children: /* @__PURE__ */ g(an, { present: n || o.open, children: /* @__PURE__ */ g(hi, { asChild: !0, container: i, children: r }) }) });
};
mg.displayName = nc;
var fr = "TooltipContent", gg = y.forwardRef(
  (e, t) => {
    const n = L2(fr, e.__scopeTooltip), { forceMount: r = n.forceMount, side: i = "top", ...o } = e, s = mi(fr, e.__scopeTooltip);
    return /* @__PURE__ */ g(an, { present: r || s.open, children: s.disableHoverableContent ? /* @__PURE__ */ g(yg, { side: i, ...o, ref: t }) : /* @__PURE__ */ g(_2, { side: i, ...o, ref: t }) });
  }
), _2 = y.forwardRef((e, t) => {
  const n = mi(fr, e.__scopeTooltip), r = tc(fr, e.__scopeTooltip), i = y.useRef(null), o = we(t, i), [s, a] = y.useState(null), { trigger: l, onClose: c } = n, u = i.current, { onPointerInTransitChange: d } = r, h = y.useCallback(() => {
    a(null), d(!1);
  }, [d]), f = y.useCallback(
    (m, p) => {
      const b = m.currentTarget, v = { x: m.clientX, y: m.clientY }, x = B2(v, b.getBoundingClientRect()), w = $2(v, x), T = j2(p.getBoundingClientRect()), E = H2([...w, ...T]);
      a(E), d(!0);
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
        const b = p.target, v = { x: p.clientX, y: p.clientY }, x = (l == null ? void 0 : l.contains(b)) || (u == null ? void 0 : u.contains(b)), w = !U2(v, s);
        x ? h() : w && (h(), c());
      };
      return document.addEventListener("pointermove", m), () => document.removeEventListener("pointermove", m);
    }
  }, [l, u, s, c, h]), /* @__PURE__ */ g(yg, { ...e, ref: o });
}), [F2, V2] = Uo(ti, { isInside: !1 }), z2 = /* @__PURE__ */ A2("TooltipContent"), yg = y.forwardRef(
  (e, t) => {
    const {
      __scopeTooltip: n,
      children: r,
      "aria-label": i,
      onEscapeKeyDown: o,
      onPointerDownOutside: s,
      ...a
    } = e, l = mi(fr, n), c = Ho(n), { onClose: u } = l;
    return y.useEffect(() => (document.addEventListener(va, u), () => document.removeEventListener(va, u)), [u]), y.useEffect(() => {
      if (l.trigger) {
        const d = (h) => {
          const f = h.target;
          f != null && f.contains(l.trigger) && u();
        };
        return window.addEventListener("scroll", d, { capture: !0 }), () => window.removeEventListener("scroll", d, { capture: !0 });
      }
    }, [l.trigger, u]), /* @__PURE__ */ g(
      di,
      {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: o,
        onPointerDownOutside: s,
        onFocusOutside: (d) => d.preventDefault(),
        onDismiss: u,
        children: /* @__PURE__ */ O(
          Gl,
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
              /* @__PURE__ */ g(z2, { children: r }),
              /* @__PURE__ */ g(F2, { scope: n, isInside: !0, children: /* @__PURE__ */ g(N2, { id: l.contentId, role: "tooltip", children: i || r }) })
            ]
          }
        )
      }
    );
  }
);
gg.displayName = fr;
var vg = "TooltipArrow", bg = y.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = Ho(n);
    return V2(
      vg,
      n
    ).isInside ? null : /* @__PURE__ */ g(Yl, { ...i, ...r, ref: t });
  }
);
bg.displayName = vg;
function B2(e, t) {
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
function $2(e, t, n = 5) {
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
function j2(e) {
  const { top: t, right: n, bottom: r, left: i } = e;
  return [
    { x: i, y: t },
    { x: n, y: t },
    { x: n, y: r },
    { x: i, y: r }
  ];
}
function U2(e, t) {
  const { x: n, y: r } = e;
  let i = !1;
  for (let o = 0, s = t.length - 1; o < t.length; s = o++) {
    const a = t[o], l = t[s], c = a.x, u = a.y, d = l.x, h = l.y;
    u > r != h > r && n < (d - c) * (r - u) / (h - u) + c && (i = !i);
  }
  return i;
}
function H2(e) {
  const t = e.slice();
  return t.sort((n, r) => n.x < r.x ? -1 : n.x > r.x ? 1 : n.y < r.y ? -1 : n.y > r.y ? 1 : 0), W2(t);
}
function W2(e) {
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
var q2 = fg, K2 = hg, xg = pg, G2 = mg, wg = gg, Y2 = bg;
function Sg({
  delayDuration: e = 0,
  ...t
}) {
  return /* @__PURE__ */ g(
    q2,
    {
      "data-slot": "tooltip-provider",
      delayDuration: e,
      ...t
    }
  );
}
function lo({
  ...e
}) {
  return /* @__PURE__ */ g(Sg, { children: /* @__PURE__ */ g(K2, { "data-slot": "tooltip", ...e }) });
}
const ni = y.forwardRef(({ ...e }, t) => /* @__PURE__ */ g(xg, { "data-slot": "tooltip-trigger", ...e, ref: t }));
ni.displayName = xg.displayName;
const ri = y.forwardRef(({ className: e, sideOffset: t = 0, children: n, ...r }, i) => /* @__PURE__ */ g(G2, { children: /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ O(
  wg,
  {
    ref: i,
    "data-slot": "tooltip-content",
    sideOffset: t,
    className: Y(
      "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
      e
    ),
    ...r,
    children: [
      n,
      /* @__PURE__ */ g(Y2, { className: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
    ]
  }
) }) }));
ri.displayName = wg.displayName;
const lf = 100 * 1024 * 1024, cf = 10, uf = 500 * 1024 * 1024, X2 = [
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
function Z2(e) {
  return e.size > lf ? {
    valid: !1,
    error: `File "${e.name}" is too large. Maximum size is ${lf / (1024 * 1024)}MB`
  } : (e.type && !X2.includes(e.type) && console.warn(`File "${e.name}" has content type "${e.type}" which is not in the allowed list`), { valid: !0 });
}
function kg(e) {
  if (e.length > cf)
    return {
      valid: !1,
      error: `Too many files. Maximum ${cf} files allowed per upload`
    };
  if (e.length === 0)
    return {
      valid: !1,
      error: "No files selected"
    };
  const t = e.reduce((n, r) => n + r.size, 0);
  if (t > uf)
    return {
      valid: !1,
      error: `Total size of all files (${(t / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed total size (${uf / (1024 * 1024)}MB)`
    };
  for (const n of e) {
    const r = Z2(n);
    if (!r.valid)
      return r;
  }
  return { valid: !0 };
}
function Cg({
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
  var C, J;
  const [p, b] = se(!1), [v, x] = se(!1), {
    isListening: w,
    isSpeechSupported: T,
    isRecording: E,
    isTranscribing: k,
    audioStream: A,
    toggleListening: D,
    stopRecording: F
  } = k2({
    transcribeAudio: a,
    onTranscriptionComplete: (q) => {
      var K;
      (K = m.onChange) == null || K.call(m, { target: { value: q } });
    }
  }), P = u ?? w, I = f ?? T, R = () => {
    u !== void 0 && d && h ? u ? h() : d() : D();
  };
  $e(() => {
    o || x(!1);
  }, [o]);
  const z = (q) => {
    console.log("addFiles called with:", q ? q.map((K) => ({ name: K.name, size: K.size, type: K.type })) : null), console.log("allowAttachments:", m.allowAttachments), console.log("setFiles available:", "setFiles" in m ? !!m.setFiles : !1), m.allowAttachments && "setFiles" in m && m.setFiles ? m.setFiles((K) => {
      if (console.log("Current files in state:", K), K === null)
        return console.log("Setting initial files:", q), q;
      if (q === null)
        return K;
      const B = [...K, ...q];
      return console.log("Files added to state:", B.map((G) => ({ name: G.name, size: G.size, type: G.type }))), B;
    }) : console.warn("Cannot add files: allowAttachments is", m.allowAttachments, "setFiles is", "setFiles" in m ? !!m.setFiles : !1);
  }, j = (q) => {
    m.allowAttachments === !0 && (q.preventDefault(), b(!0));
  }, W = (q) => {
    m.allowAttachments === !0 && (q.preventDefault(), b(!1));
  }, V = (q) => {
    if (b(!1), m.allowAttachments !== !0) return;
    q.preventDefault();
    const K = q.dataTransfer;
    K.files.length && z(Array.from(K.files));
  }, N = (q) => {
    var ge;
    const K = (ge = q.clipboardData) == null ? void 0 : ge.items;
    if (!K) return;
    const B = q.clipboardData.getData("text");
    if (B && B.length > 500 && m.allowAttachments) {
      q.preventDefault();
      const re = new Blob([B], { type: "text/plain" }), oe = new File([re], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now()
      });
      z([oe]);
      return;
    }
    const G = Array.from(K).map((re) => re.getAsFile()).filter((re) => re !== null);
    m.allowAttachments && G.length > 0 && z(G);
  }, _ = (q) => {
    var K, B, G;
    if (r && q.key === "Enter" && !q.shiftKey) {
      if (q.preventDefault(), o && i && s) {
        if (v)
          i(), x(!1), (K = q.currentTarget.form) == null || K.requestSubmit();
        else if (m.value || m.allowAttachments && ((B = m.files) != null && B.length)) {
          x(!0);
          return;
        }
      }
      (G = q.currentTarget.form) == null || G.requestSubmit();
    }
    n == null || n(q);
  }, L = De(null), [S, te] = se(0);
  $e(() => {
    L.current && te(L.current.offsetHeight);
  }, [m.value]);
  const X = m.allowAttachments && m.files && m.files.length > 0;
  return C2({
    ref: L,
    maxHeight: 200,
    borderWidth: 1,
    dependencies: [m.value, X]
  }), /* @__PURE__ */ O(
    "div",
    {
      className: "relative flex w-full",
      onDragOver: j,
      onDragLeave: W,
      onDrop: V,
      children: [
        s && /* @__PURE__ */ g(
          E2,
          {
            isOpen: v,
            close: () => x(!1)
          }
        ),
        /* @__PURE__ */ g(
          tD,
          {
            isVisible: E,
            onStopRecording: F
          }
        ),
        l && c && l.length > 0 && /* @__PURE__ */ g("div", { className: "mb-2", children: /* @__PURE__ */ g(ya, { label: "", append: c, suggestions: l }) }),
        /* @__PURE__ */ g("div", { className: "relative flex w-full items-center space-x-2", children: /* @__PURE__ */ O("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ g(
            "textarea",
            {
              "aria-label": "Write your prompt here",
              placeholder: e,
              ref: L,
              onPaste: N,
              onKeyDown: _,
              className: Y(
                "z-10 w-full grow resize-none rounded-lg border border-input bg-background/50 backdrop-blur-sm p-4 pr-28 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
                X && "pb-20",
                t
              ),
              ...m.allowAttachments ? of(m, ["allowAttachments", "files", "setFiles"]) : of(m, ["allowAttachments"])
            }
          ),
          m.allowAttachments && /* @__PURE__ */ g("div", { className: "absolute inset-x-3 bottom-0 z-20 py-3", children: /* @__PURE__ */ g("div", { className: "flex space-x-3", children: /* @__PURE__ */ g(xo, { mode: "popLayout", children: (C = m.files) == null ? void 0 : C.map((q) => /* @__PURE__ */ g(
            yl,
            {
              file: q,
              onRemove: () => {
                m.setFiles((K) => {
                  if (!K) return null;
                  const B = Array.from(K).filter(
                    (G) => G !== q
                  );
                  return B.length === 0 ? null : B;
                });
              }
            },
            q.name + String(q.lastModified)
          )) }) }) })
        ] }) }),
        l && c && l.length > 0 && /* @__PURE__ */ g("div", { className: "mt-2", children: /* @__PURE__ */ g(ya, { label: "", append: c, suggestions: l }) }),
        /* @__PURE__ */ g("div", { className: "absolute right-3 top-3 z-20 flex gap-1", children: /* @__PURE__ */ O(Sg, { delayDuration: 0, children: [
          m.allowAttachments && /* @__PURE__ */ g(
            rD,
            {
              onClick: async () => {
                console.log("Attachment button clicked");
                try {
                  const q = await Q2();
                  if (console.log("Files selected from dialog:", q ? q.map((K) => ({ name: K.name, size: K.size, type: K.type })) : null), q && q.length > 0)
                    try {
                      const K = kg(q);
                      if (!K.valid) {
                        console.error("File validation failed:", K.error), alert(K.error || "File validation failed");
                        return;
                      }
                      console.log("Files validated, adding to state..."), z(q);
                    } catch (K) {
                      console.error("Error validating files:", K), z(q);
                    }
                  else
                    console.log("No files selected or dialog was cancelled");
                } catch (q) {
                  console.error("Error in file upload dialog:", q);
                }
              }
            }
          ),
          /* @__PURE__ */ g(
            iD,
            {
              isSupported: !!I,
              isListening: !!P,
              onClick: R
            }
          ),
          /* @__PURE__ */ g(
            oD,
            {
              isGenerating: o,
              stop: i,
              disabled: m.value === "" && (!m.allowAttachments || !((J = m.files) != null && J.length)) || o
            }
          )
        ] }) }),
        m.allowAttachments && /* @__PURE__ */ g(J2, { isDragging: p }),
        /* @__PURE__ */ g(
          nD,
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
Cg.displayName = "MessageInput";
function J2({ isDragging: e }) {
  return /* @__PURE__ */ g(xo, { children: e && /* @__PURE__ */ O(
    nn.div,
    {
      className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      "aria-hidden": !0,
      children: [
        /* @__PURE__ */ g(bf, {}),
        /* @__PURE__ */ g("span", { children: "Drop your files here to attach them." })
      ]
    }
  ) });
}
function Q2() {
  const e = document.createElement("input");
  return e.type = "file", e.multiple = !0, e.accept = "*/*", e.style.display = "none", document.body.appendChild(e), new Promise((t) => {
    let n = !1, r = !1, i = null;
    const o = (l) => {
      n || (n = !0, i && (clearTimeout(i), i = null), s(), t(l));
    }, s = () => {
      window.removeEventListener("focus", a), setTimeout(() => {
        try {
          e.parentNode && e.parentNode.removeChild(e);
        } catch {
        }
      }, 100);
    };
    e.onchange = (l) => {
      const c = l.currentTarget.files;
      console.log("File input onchange fired, files:", c ? Array.from(c).map((u) => u.name) : null), c && c.length > 0 && (r = !0, i && (clearTimeout(i), i = null), o(Array.from(c)));
    };
    const a = () => {
      i = setTimeout(() => {
        if (!n) {
          const l = e.files;
          l && l.length > 0 ? (console.log("Files found on input element (onchange delayed):", Array.from(l).map((c) => c.name)), r = !0, o(Array.from(l))) : r || (console.log("Dialog closed without file selection (cancelled)"), o(null));
        }
      }, 200);
    };
    setTimeout(() => {
      window.addEventListener("focus", a, { once: !0 });
    }, 100), console.log("Opening file dialog..."), e.click();
  });
}
function eD() {
  return /* @__PURE__ */ O(
    nn.div,
    {
      className: "flex h-full w-full flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      children: [
        /* @__PURE__ */ O("div", { className: "relative", children: [
          /* @__PURE__ */ g(Da, { className: "h-8 w-8 animate-spin text-primary" }),
          /* @__PURE__ */ g(
            nn.div,
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
function tD({ isVisible: e, onStopRecording: t }) {
  return /* @__PURE__ */ g(xo, { children: e && /* @__PURE__ */ g(
    nn.div,
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
        /* @__PURE__ */ g(uv, { className: "mr-2 h-3 w-3" }),
        "Click to finish recording"
      ] })
    }
  ) });
}
function nD({
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
        T2,
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
      children: /* @__PURE__ */ g(eD, {})
    }
  ) : null;
}
function rD({ onClick: e, className: t }) {
  return /* @__PURE__ */ O(lo, { children: [
    /* @__PURE__ */ g(ni, { asChild: !0, children: /* @__PURE__ */ g(
      qe,
      {
        type: "button",
        size: "icon",
        variant: "ghost",
        className: Y("h-8 w-8 text-muted-foreground hover:text-foreground", t),
        "aria-label": "Attach a file",
        onClick: e,
        children: /* @__PURE__ */ g(bf, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(ri, { children: "Attach file" })
  ] });
}
function iD({
  isSupported: e,
  isListening: t,
  onClick: n
}) {
  return e ? /* @__PURE__ */ O(lo, { children: [
    /* @__PURE__ */ g(ni, { asChild: !0, children: /* @__PURE__ */ g(
      qe,
      {
        type: "button",
        variant: "ghost",
        "aria-label": t ? "Stop recording" : "Voice input",
        size: "icon",
        onClick: n,
        className: Y(
          "h-8 w-8 transition-all duration-200",
          t ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "text-muted-foreground hover:text-foreground"
        ),
        children: t ? /* @__PURE__ */ O("span", { className: "relative flex h-3 w-3", children: [
          /* @__PURE__ */ g("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" }),
          /* @__PURE__ */ g("span", { className: "relative inline-flex h-3 w-3 rounded-full bg-red-500" })
        ] }) : /* @__PURE__ */ g(pv, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(ri, { children: t ? "Stop recording" : "Use voice input" })
  ] }) : null;
}
function oD({
  isGenerating: e,
  stop: t,
  disabled: n
}) {
  return e && t ? /* @__PURE__ */ O(lo, { children: [
    /* @__PURE__ */ g(ni, { asChild: !0, children: /* @__PURE__ */ g(
      qe,
      {
        type: "button",
        size: "icon",
        variant: "ghost",
        className: "h-8 w-8 text-muted-foreground hover:text-foreground",
        "aria-label": "Stop generating",
        onClick: t,
        children: /* @__PURE__ */ g(wf, { className: "h-3 w-3 animate-pulse fill-current" })
      }
    ) }),
    /* @__PURE__ */ g(ri, { children: "Stop generating" })
  ] }) : /* @__PURE__ */ O(lo, { children: [
    /* @__PURE__ */ g(ni, { asChild: !0, children: /* @__PURE__ */ g(
      qe,
      {
        type: "submit",
        size: "icon",
        className: Y(
          "h-8 w-8 rounded-full transition-all duration-200",
          n ? "opacity-50" : "bg-primary text-primary-foreground shadow-sm"
        ),
        "aria-label": "Send message",
        disabled: n,
        children: /* @__PURE__ */ g(Ia, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(ri, { children: "Send message" })
  ] });
}
function sD() {
  return /* @__PURE__ */ g("div", { className: "justify-left flex gap-2", children: /* @__PURE__ */ g("div", { className: "rounded-lg bg-muted p-3 flex items-center space-x-2 opacity-50 text-sm", children: /* @__PURE__ */ g(Da, { className: "h-5 w-5 animate-spin text-primary" }) }) });
}
function aD({
  messages: e,
  showTimeStamps: t = !0,
  isTyping: n = !1,
  messageOptions: r
}) {
  return /* @__PURE__ */ O("div", { className: "space-y-4 overflow-visible", children: [
    e.map((i, o) => {
      const s = typeof r == "function" ? r(i) : r;
      return /* @__PURE__ */ g(
        y2,
        {
          showTimeStamp: t,
          ...i,
          ...s
        },
        o
      );
    }),
    n && /* @__PURE__ */ g(sD, {})
  ] });
}
function Tg({
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
  isSpeaking: T
}) {
  const E = e.at(-1), k = e.length === 0, A = (E == null ? void 0 : E.role) === "user", D = De(e);
  D.current = e;
  const F = Be(() => {
    if (i == null || i(), !u) return;
    const I = [...D.current], R = I.findLast(
      (W) => W.role === "assistant"
    );
    if (!R) return;
    let z = !1, j = { ...R };
    if (R.toolInvocations) {
      const W = R.toolInvocations.map(
        (V) => V.state === "call" ? (z = !0, {
          ...V,
          state: "result",
          result: {
            content: "Tool execution was cancelled",
            __cancelled: !0
            // Special marker to indicate cancellation
          }
        }) : V
      );
      z && (j = {
        ...j,
        toolInvocations: W
      });
    }
    if (R.parts && R.parts.length > 0) {
      const W = R.parts.map((V) => V.type === "tool-invocation" && V.toolInvocation && V.toolInvocation.state === "call" ? (z = !0, {
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
      z && (j = {
        ...j,
        parts: W
      });
    }
    if (z) {
      const W = I.findIndex(
        (V) => V.id === R.id
      );
      W !== -1 && (I[W] = j, u(I));
    }
  }, [i, u, D]), P = Be(
    (I) => ({
      actions: /* @__PURE__ */ O(Wt, { children: [
        x && /* @__PURE__ */ g(
          qe,
          {
            size: "icon",
            variant: "ghost",
            className: "h-6 w-6",
            onClick: () => {
              T && w ? w() : x(I.content);
            },
            children: T ? /* @__PURE__ */ g(wf, { className: "h-3 w-3 fill-current" }) : /* @__PURE__ */ g(Sv, { className: "h-4 w-4" })
          }
        ),
        c ? /* @__PURE__ */ O(Wt, { children: [
          /* @__PURE__ */ g("div", { className: "border-r pr-1 inline-flex items-center h-4 my-auto mx-1", children: /* @__PURE__ */ g(
            no,
            {
              content: I.content,
              copyMessage: "Copied response to clipboard!"
            }
          ) }),
          /* @__PURE__ */ g(
            qe,
            {
              size: "icon",
              variant: "ghost",
              className: "h-6 w-6",
              onClick: () => c(I.id, "thumbs-up"),
              children: /* @__PURE__ */ g(xv, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ g(
            qe,
            {
              size: "icon",
              variant: "ghost",
              className: "h-6 w-6",
              onClick: () => c(I.id, "thumbs-down"),
              children: /* @__PURE__ */ g(bv, { className: "h-4 w-4" })
            }
          )
        ] }) : /* @__PURE__ */ g(
          no,
          {
            content: I.content,
            copyMessage: "Copied response to clipboard!"
          }
        )
      ] })
    }),
    [c, x, T, w]
  );
  return /* @__PURE__ */ O(Eg, { className: Y(l, "relative"), children: [
    /* @__PURE__ */ g("div", { className: "flex-1 min-h-0 flex flex-col overflow-hidden", children: k && s && a ? /* @__PURE__ */ g("div", { className: "flex h-full flex-col justify-center overflow-y-auto", children: /* @__PURE__ */ g(
      ya,
      {
        label: f || "",
        append: s,
        suggestions: a
      }
    ) }) : e.length > 0 ? /* @__PURE__ */ g(lD, { messages: e, className: "flex-1 w-full px-4 pt-8", children: /* @__PURE__ */ O("div", { className: "max-w-4xl mx-auto w-full", children: [
      /* @__PURE__ */ g(
        aD,
        {
          messages: e,
          isTyping: A,
          messageOptions: P
        }
      ),
      s && a && a.length > 0 && !o && /* @__PURE__ */ g("div", { className: "mt-6 flex flex-wrap gap-2 pb-8", children: a.map((I) => /* @__PURE__ */ g(
        qe,
        {
          variant: "outline",
          size: "sm",
          className: "rounded-xl bg-background/50 backdrop-blur-sm text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-primary/20 hover:border-primary shadow-sm",
          onClick: () => s({ role: "user", content: I }),
          children: I
        },
        I
      )) })
    ] }) }) : /* @__PURE__ */ g("div", { className: "flex-1" }) }),
    /* @__PURE__ */ g("div", { className: "flex-none w-full max-w-4xl mx-auto px-4 pb-6", children: /* @__PURE__ */ g(
      Pg,
      {
        className: "relative",
        isPending: o || A,
        handleSubmit: t,
        children: ({ files: I, setFiles: R }) => /* @__PURE__ */ g(
          Cg,
          {
            value: n,
            onChange: r,
            allowAttachments: !0,
            files: I,
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
Tg.displayName = "Chat";
function lD({
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
  } = rb([e]);
  return /* @__PURE__ */ O(
    "div",
    {
      className: Y("grid grid-cols-1 overflow-y-auto pb-4", n),
      ref: r,
      onScroll: o,
      onTouchStart: a,
      children: [
        /* @__PURE__ */ g("div", { className: "max-w-full [grid-column:1/1] [grid-row:1/1]", children: t }),
        !s && /* @__PURE__ */ g("div", { className: "pointer-events-none flex flex-1 items-end justify-end [grid-column:1/1] [grid-row:1/1]", children: /* @__PURE__ */ g("div", { className: "sticky bottom-0 left-0 flex w-full justify-end", children: /* @__PURE__ */ g(
          qe,
          {
            onClick: i,
            className: "pointer-events-auto h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1",
            size: "icon",
            variant: "ghost",
            children: /* @__PURE__ */ g(nv, { className: "h-4 w-4" })
          }
        ) }) })
      ]
    }
  );
}
const Eg = hr(({ className: e, ...t }, n) => /* @__PURE__ */ g(
  "div",
  {
    ref: n,
    className: Y("flex flex-col h-full w-full", e),
    ...t
  }
));
Eg.displayName = "ChatContainer";
const Pg = hr(
  ({ children: e, handleSubmit: t, className: n }, r) => {
    const [i, o] = se(null);
    return /* @__PURE__ */ g("form", { ref: r, onSubmit: (a) => {
      if (!i || i.length === 0) {
        console.log("Form submitted without files"), t(a);
        return;
      }
      console.log("Form submitted with files:", i.map((c) => ({ name: c.name, size: c.size, type: c.type })));
      const l = cD(i);
      t(a, { experimental_attachments: l }), o(null);
    }, className: n, children: e({ files: i, setFiles: o }) });
  }
);
Pg.displayName = "ChatForm";
function cD(e) {
  const t = new DataTransfer();
  for (const n of Array.from(e))
    t.items.add(n);
  return t.files;
}
// @__NO_SIDE_EFFECTS__
function uD(e) {
  const t = /* @__PURE__ */ dD(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(hD);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function dD(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = mD(i), a = pD(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? jn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var fD = Symbol("radix.slottable");
function hD(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === fD;
}
function pD(e, t) {
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
function mD(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var Wo = "Dialog", [Ag] = sn(Wo), [gD, Ft] = Ag(Wo), Rg = (e) => {
  const {
    __scopeDialog: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: o,
    modal: s = !0
  } = e, a = y.useRef(null), l = y.useRef(null), [c, u] = bn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Wo
  });
  return /* @__PURE__ */ g(
    gD,
    {
      scope: t,
      triggerRef: a,
      contentRef: l,
      contentId: en(),
      titleId: en(),
      descriptionId: en(),
      open: c,
      onOpenChange: u,
      onOpenToggle: y.useCallback(() => u((d) => !d), [u]),
      modal: s,
      children: n
    }
  );
};
Rg.displayName = Wo;
var Ng = "DialogTrigger", Ig = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ft(Ng, n), o = we(t, i.triggerRef);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": i.open,
        "aria-controls": i.contentId,
        "data-state": oc(i.open),
        ...r,
        ref: o,
        onClick: le(e.onClick, i.onOpenToggle)
      }
    );
  }
);
Ig.displayName = Ng;
var rc = "DialogPortal", [yD, Dg] = Ag(rc, {
  forceMount: void 0
}), Mg = (e) => {
  const { __scopeDialog: t, forceMount: n, children: r, container: i } = e, o = Ft(rc, t);
  return /* @__PURE__ */ g(yD, { scope: t, forceMount: n, children: y.Children.map(r, (s) => /* @__PURE__ */ g(an, { present: n || o.open, children: /* @__PURE__ */ g(hi, { asChild: !0, container: i, children: s }) })) });
};
Mg.displayName = rc;
var co = "DialogOverlay", Og = y.forwardRef(
  (e, t) => {
    const n = Dg(co, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Ft(co, e.__scopeDialog);
    return o.modal ? /* @__PURE__ */ g(an, { present: r || o.open, children: /* @__PURE__ */ g(bD, { ...i, ref: t }) }) : null;
  }
);
Og.displayName = co;
var vD = /* @__PURE__ */ uD("DialogOverlay.RemoveScroll"), bD = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ft(co, n);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ g($o, { as: vD, allowPinchZoom: !0, shards: [i.contentRef], children: /* @__PURE__ */ g(
        he.div,
        {
          "data-state": oc(i.open),
          ...r,
          ref: t,
          style: { pointerEvents: "auto", ...r.style }
        }
      ) })
    );
  }
), zn = "DialogContent", Lg = y.forwardRef(
  (e, t) => {
    const n = Dg(zn, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, o = Ft(zn, e.__scopeDialog);
    return /* @__PURE__ */ g(an, { present: r || o.open, children: o.modal ? /* @__PURE__ */ g(xD, { ...i, ref: t }) : /* @__PURE__ */ g(wD, { ...i, ref: t }) });
  }
);
Lg.displayName = zn;
var xD = y.forwardRef(
  (e, t) => {
    const n = Ft(zn, e.__scopeDialog), r = y.useRef(null), i = we(t, n.contentRef, r);
    return y.useEffect(() => {
      const o = r.current;
      if (o) return Xl(o);
    }, []), /* @__PURE__ */ g(
      _g,
      {
        ...e,
        ref: i,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: le(e.onCloseAutoFocus, (o) => {
          var s;
          o.preventDefault(), (s = n.triggerRef.current) == null || s.focus();
        }),
        onPointerDownOutside: le(e.onPointerDownOutside, (o) => {
          const s = o.detail.originalEvent, a = s.button === 0 && s.ctrlKey === !0;
          (s.button === 2 || a) && o.preventDefault();
        }),
        onFocusOutside: le(
          e.onFocusOutside,
          (o) => o.preventDefault()
        )
      }
    );
  }
), wD = y.forwardRef(
  (e, t) => {
    const n = Ft(zn, e.__scopeDialog), r = y.useRef(!1), i = y.useRef(!1);
    return /* @__PURE__ */ g(
      _g,
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
), _g = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: i, onCloseAutoFocus: o, ...s } = e, a = Ft(zn, n), l = y.useRef(null), c = we(t, l);
    return Fl(), /* @__PURE__ */ O(Wt, { children: [
      /* @__PURE__ */ g(
        Oo,
        {
          asChild: !0,
          loop: !0,
          trapped: r,
          onMountAutoFocus: i,
          onUnmountAutoFocus: o,
          children: /* @__PURE__ */ g(
            di,
            {
              role: "dialog",
              id: a.contentId,
              "aria-describedby": a.descriptionId,
              "aria-labelledby": a.titleId,
              "data-state": oc(a.open),
              ...s,
              ref: c,
              onDismiss: () => a.onOpenChange(!1)
            }
          )
        }
      ),
      /* @__PURE__ */ O(Wt, { children: [
        /* @__PURE__ */ g(SD, { titleId: a.titleId }),
        /* @__PURE__ */ g(CD, { contentRef: l, descriptionId: a.descriptionId })
      ] })
    ] });
  }
), ic = "DialogTitle", Fg = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ft(ic, n);
    return /* @__PURE__ */ g(he.h2, { id: i.titleId, ...r, ref: t });
  }
);
Fg.displayName = ic;
var Vg = "DialogDescription", zg = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ft(Vg, n);
    return /* @__PURE__ */ g(he.p, { id: i.descriptionId, ...r, ref: t });
  }
);
zg.displayName = Vg;
var Bg = "DialogClose", $g = y.forwardRef(
  (e, t) => {
    const { __scopeDialog: n, ...r } = e, i = Ft(Bg, n);
    return /* @__PURE__ */ g(
      he.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: le(e.onClick, () => i.onOpenChange(!1))
      }
    );
  }
);
$g.displayName = Bg;
function oc(e) {
  return e ? "open" : "closed";
}
var jg = "DialogTitleWarning", [vO, Ug] = z1(jg, {
  contentName: zn,
  titleName: ic,
  docsSlug: "dialog"
}), SD = ({ titleId: e }) => {
  const t = Ug(jg), n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
  return y.useEffect(() => {
    e && (document.getElementById(e) || console.error(n));
  }, [n, e]), null;
}, kD = "DialogDescriptionWarning", CD = ({ contentRef: e, descriptionId: t }) => {
  const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${Ug(kD).contentName}}.`;
  return y.useEffect(() => {
    var o;
    const i = (o = e.current) == null ? void 0 : o.getAttribute("aria-describedby");
    t && i && (document.getElementById(t) || console.warn(r));
  }, [r, e, t]), null;
}, TD = Rg, ED = Ig, PD = Mg, AD = Og, RD = Lg, ND = Fg, ID = zg, DD = $g;
function MD({ ...e }) {
  return /* @__PURE__ */ g(TD, { "data-slot": "sheet", ...e });
}
function OD({
  ...e
}) {
  return /* @__PURE__ */ g(ED, { "data-slot": "sheet-trigger", ...e });
}
function LD({
  ...e
}) {
  return /* @__PURE__ */ g(PD, { "data-slot": "sheet-portal", ...e });
}
function _D({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    AD,
    {
      "data-slot": "sheet-overlay",
      className: Y(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        e
      ),
      ...t
    }
  );
}
function FD({
  className: e,
  children: t,
  side: n = "right",
  ...r
}) {
  return /* @__PURE__ */ g(LD, { children: /* @__PURE__ */ O("div", { className: "chat-theme", children: [
    /* @__PURE__ */ g(_D, {}),
    /* @__PURE__ */ O(
      RD,
      {
        "data-slot": "sheet-content",
        className: Y(
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
          /* @__PURE__ */ O(DD, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ g(mr, { className: "size-4" }),
            /* @__PURE__ */ g("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] }) });
}
function VD({ className: e, ...t }) {
  return /* @__PURE__ */ g(
    "div",
    {
      "data-slot": "sheet-header",
      className: Y("flex flex-col gap-1.5 p-4", e),
      ...t
    }
  );
}
function zD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    ND,
    {
      "data-slot": "sheet-title",
      className: Y("text-foreground font-semibold", e),
      ...t
    }
  );
}
function BD({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    ID,
    {
      "data-slot": "sheet-description",
      className: Y("text-muted-foreground text-sm", e),
      ...t
    }
  );
}
function $D({
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
  return /* @__PURE__ */ O(MD, { open: e, onOpenChange: t, children: [
    /* @__PURE__ */ g(OD, { asChild: !0, children: /* @__PURE__ */ g(
      qe,
      {
        variant: "ghost",
        size: "icon",
        onClick: a,
        title: "Chat History",
        className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
        children: /* @__PURE__ */ g(uc, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ O(FD, { side: l, className: "w-[300px] sm:w-[400px] border-l border-border/40 backdrop-blur-2xl", children: [
      /* @__PURE__ */ O(VD, { className: "mb-6", children: [
        /* @__PURE__ */ g(zD, { className: "text-xl font-bold tracking-tight", children: "Chat History" }),
        /* @__PURE__ */ g(BD, { className: "text-sm", children: "Select a previous conversation to continue." })
      ] }),
      /* @__PURE__ */ g("div", { className: "px-2", children: /* @__PURE__ */ O(
        qe,
        {
          variant: "outline",
          className: "w-full justify-start gap-2.5 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium",
          onClick: o,
          disabled: s,
          children: [
            /* @__PURE__ */ g(xf, { className: Y("h-4 w-4", s && "animate-spin") }),
            " New Conversation"
          ]
        }
      ) }),
      /* @__PURE__ */ g("div", { className: "flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-2 mt-6 custom-scrollbar", children: n.length === 0 ? /* @__PURE__ */ O("div", { className: "flex flex-col items-center justify-center py-12 px-4 text-center", children: [
        /* @__PURE__ */ g("div", { className: "h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/40", children: /* @__PURE__ */ g(uc, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ g("p", { className: "text-sm font-medium text-muted-foreground", children: "No recent conversations" }),
        /* @__PURE__ */ g("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Start chatting to see history here." })
      ] }) : n.map((c) => /* @__PURE__ */ O(
        "button",
        {
          className: Y(
            "group flex flex-col gap-1 w-full text-left p-3.5 rounded-xl transition-all duration-200 border border-transparent",
            r === c.thread_id ? "bg-primary/5 border-primary/20 shadow-sm" : "hover:bg-muted/50 hover:border-border/50"
          ),
          onClick: () => i(c.thread_id),
          children: [
            /* @__PURE__ */ g("span", { className: Y(
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
function uo(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
// @__NO_SIDE_EFFECTS__
function df(e) {
  const t = /* @__PURE__ */ jD(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(HD);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function jD(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = qD(i), a = WD(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? jn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var UD = Symbol("radix.slottable");
function HD(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === UD;
}
function WD(e, t) {
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
function qD(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function Hg(e) {
  const t = e + "CollectionProvider", [n, r] = sn(t), [i, o] = n(
    t,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), s = (p) => {
    const { scope: b, children: v } = p, x = U.useRef(null), w = U.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ g(i, { scope: b, itemMap: w, collectionRef: x, children: v });
  };
  s.displayName = t;
  const a = e + "CollectionSlot", l = /* @__PURE__ */ df(a), c = U.forwardRef(
    (p, b) => {
      const { scope: v, children: x } = p, w = o(a, v), T = we(b, w.collectionRef);
      return /* @__PURE__ */ g(l, { ref: T, children: x });
    }
  );
  c.displayName = a;
  const u = e + "CollectionItemSlot", d = "data-radix-collection-item", h = /* @__PURE__ */ df(u), f = U.forwardRef(
    (p, b) => {
      const { scope: v, children: x, ...w } = p, T = U.useRef(null), E = we(b, T), k = o(u, v);
      return U.useEffect(() => (k.itemMap.set(T, { ref: T, ...w }), () => void k.itemMap.delete(T))), /* @__PURE__ */ g(h, { [d]: "", ref: E, children: x });
    }
  );
  f.displayName = u;
  function m(p) {
    const b = o(e + "CollectionConsumer", p);
    return U.useCallback(() => {
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
var KD = y.createContext(void 0);
function Wg(e) {
  const t = y.useContext(KD);
  return e || t || "ltr";
}
// @__NO_SIDE_EFFECTS__
function GD(e) {
  const t = /* @__PURE__ */ YD(e), n = y.forwardRef((r, i) => {
    const { children: o, ...s } = r, a = y.Children.toArray(o), l = a.find(ZD);
    if (l) {
      const c = l.props.children, u = a.map((d) => d === l ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ g(t, { ...s, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ g(t, { ...s, ref: i, children: o });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function YD(e) {
  const t = y.forwardRef((n, r) => {
    const { children: i, ...o } = n;
    if (y.isValidElement(i)) {
      const s = QD(i), a = JD(o, i.props);
      return i.type !== y.Fragment && (a.ref = r ? jn(r, s) : s), y.cloneElement(i, a);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var XD = Symbol("radix.slottable");
function ZD(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === XD;
}
function JD(e, t) {
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
function QD(e) {
  var r, i;
  let t = (r = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : r.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = (i = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : i.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function sc(e) {
  const t = y.useRef({ value: e, previous: e });
  return y.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
var eM = [" ", "Enter", "ArrowUp", "ArrowDown"], tM = [" ", "Enter"], Bn = "Select", [qo, Ko, nM] = Hg(Bn), [Tr] = sn(Bn, [
  nM,
  Cr
]), Go = Cr(), [rM, Tn] = Tr(Bn), [iM, oM] = Tr(Bn), qg = (e) => {
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
  } = e, p = Go(t), [b, v] = y.useState(null), [x, w] = y.useState(null), [T, E] = y.useState(!1), k = Wg(c), [A, D] = bn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: o,
    caller: Bn
  }), [F, P] = bn({
    prop: s,
    defaultProp: a,
    onChange: l,
    caller: Bn
  }), I = y.useRef(null), R = b ? m || !!b.closest("form") : !0, [z, j] = y.useState(/* @__PURE__ */ new Set()), W = Array.from(z).map((V) => V.props.value).join(";");
  return /* @__PURE__ */ g(Kl, { ...p, children: /* @__PURE__ */ O(
    rM,
    {
      required: f,
      scope: t,
      trigger: b,
      onTriggerChange: v,
      valueNode: x,
      onValueNodeChange: w,
      valueNodeHasChildren: T,
      onValueNodeHasChildrenChange: E,
      contentId: en(),
      value: F,
      onValueChange: P,
      open: A,
      onOpenChange: D,
      dir: k,
      triggerPointerDownPosRef: I,
      disabled: h,
      children: [
        /* @__PURE__ */ g(qo.Provider, { scope: t, children: /* @__PURE__ */ g(
          iM,
          {
            scope: e.__scopeSelect,
            onNativeOptionAdd: y.useCallback((V) => {
              j((N) => new Set(N).add(V));
            }, []),
            onNativeOptionRemove: y.useCallback((V) => {
              j((N) => {
                const _ = new Set(N);
                return _.delete(V), _;
              });
            }, []),
            children: n
          }
        ) }),
        R ? /* @__PURE__ */ O(
          py,
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
              Array.from(z)
            ]
          },
          W
        ) : null
      ]
    }
  ) });
};
qg.displayName = Bn;
var Kg = "SelectTrigger", Gg = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, disabled: r = !1, ...i } = e, o = Go(n), s = Tn(Kg, n), a = s.disabled || r, l = we(t, s.onTriggerChange), c = Ko(n), u = y.useRef("touch"), [d, h, f] = gy((p) => {
      const b = c().filter((w) => !w.disabled), v = b.find((w) => w.value === s.value), x = yy(b, p, v);
      x !== void 0 && s.onValueChange(x.value);
    }), m = (p) => {
      a || (s.onOpenChange(!0), f()), p && (s.triggerPointerDownPosRef.current = {
        x: Math.round(p.pageX),
        y: Math.round(p.pageY)
      });
    };
    return /* @__PURE__ */ g(zo, { asChild: !0, ...o, children: /* @__PURE__ */ g(
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
        "data-placeholder": my(s.value) ? "" : void 0,
        ...i,
        ref: l,
        onClick: le(i.onClick, (p) => {
          p.currentTarget.focus(), u.current !== "mouse" && m(p);
        }),
        onPointerDown: le(i.onPointerDown, (p) => {
          u.current = p.pointerType;
          const b = p.target;
          b.hasPointerCapture(p.pointerId) && b.releasePointerCapture(p.pointerId), p.button === 0 && p.ctrlKey === !1 && p.pointerType === "mouse" && (m(p), p.preventDefault());
        }),
        onKeyDown: le(i.onKeyDown, (p) => {
          const b = d.current !== "";
          !(p.ctrlKey || p.altKey || p.metaKey) && p.key.length === 1 && h(p.key), !(b && p.key === " ") && eM.includes(p.key) && (m(), p.preventDefault());
        })
      }
    ) });
  }
);
Gg.displayName = Kg;
var Yg = "SelectValue", Xg = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, children: o, placeholder: s = "", ...a } = e, l = Tn(Yg, n), { onValueNodeHasChildrenChange: c } = l, u = o !== void 0, d = we(t, l.onValueNodeChange);
    return Xe(() => {
      c(u);
    }, [c, u]), /* @__PURE__ */ g(
      he.span,
      {
        ...a,
        ref: d,
        style: { pointerEvents: "none" },
        children: my(l.value) ? /* @__PURE__ */ g(Wt, { children: s }) : o
      }
    );
  }
);
Xg.displayName = Yg;
var sM = "SelectIcon", Zg = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, children: r, ...i } = e;
    return /* @__PURE__ */ g(he.span, { "aria-hidden": !0, ...i, ref: t, children: r || "▼" });
  }
);
Zg.displayName = sM;
var aM = "SelectPortal", Jg = (e) => /* @__PURE__ */ g(hi, { asChild: !0, ...e });
Jg.displayName = aM;
var $n = "SelectContent", Qg = y.forwardRef(
  (e, t) => {
    const n = Tn($n, e.__scopeSelect), [r, i] = y.useState();
    if (Xe(() => {
      i(new DocumentFragment());
    }, []), !n.open) {
      const o = r;
      return o ? yo.createPortal(
        /* @__PURE__ */ g(ey, { scope: e.__scopeSelect, children: /* @__PURE__ */ g(qo.Slot, { scope: e.__scopeSelect, children: /* @__PURE__ */ g("div", { children: e.children }) }) }),
        o
      ) : null;
    }
    return /* @__PURE__ */ g(ty, { ...e, ref: t });
  }
);
Qg.displayName = $n;
var Mt = 10, [ey, En] = Tr($n), lM = "SelectContentImpl", cM = /* @__PURE__ */ GD("SelectContent.RemoveScroll"), ty = y.forwardRef(
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
    } = e, x = Tn($n, n), [w, T] = y.useState(null), [E, k] = y.useState(null), A = we(t, (B) => T(B)), [D, F] = y.useState(null), [P, I] = y.useState(
      null
    ), R = Ko(n), [z, j] = y.useState(!1), W = y.useRef(!1);
    y.useEffect(() => {
      if (w) return Xl(w);
    }, [w]), Fl();
    const V = y.useCallback(
      (B) => {
        const [G, ...ge] = R().map((de) => de.ref.current), [re] = ge.slice(-1), oe = document.activeElement;
        for (const de of B)
          if (de === oe || (de == null || de.scrollIntoView({ block: "nearest" }), de === G && E && (E.scrollTop = 0), de === re && E && (E.scrollTop = E.scrollHeight), de == null || de.focus(), document.activeElement !== oe)) return;
      },
      [R, E]
    ), N = y.useCallback(
      () => V([D, w]),
      [V, D, w]
    );
    y.useEffect(() => {
      z && N();
    }, [z, N]);
    const { onOpenChange: _, triggerPointerDownPosRef: L } = x;
    y.useEffect(() => {
      if (w) {
        let B = { x: 0, y: 0 };
        const G = (re) => {
          var oe, de;
          B = {
            x: Math.abs(Math.round(re.pageX) - (((oe = L.current) == null ? void 0 : oe.x) ?? 0)),
            y: Math.abs(Math.round(re.pageY) - (((de = L.current) == null ? void 0 : de.y) ?? 0))
          };
        }, ge = (re) => {
          B.x <= 10 && B.y <= 10 ? re.preventDefault() : w.contains(re.target) || _(!1), document.removeEventListener("pointermove", G), L.current = null;
        };
        return L.current !== null && (document.addEventListener("pointermove", G), document.addEventListener("pointerup", ge, { capture: !0, once: !0 })), () => {
          document.removeEventListener("pointermove", G), document.removeEventListener("pointerup", ge, { capture: !0 });
        };
      }
    }, [w, _, L]), y.useEffect(() => {
      const B = () => _(!1);
      return window.addEventListener("blur", B), window.addEventListener("resize", B), () => {
        window.removeEventListener("blur", B), window.removeEventListener("resize", B);
      };
    }, [_]);
    const [S, te] = gy((B) => {
      const G = R().filter((oe) => !oe.disabled), ge = G.find((oe) => oe.ref.current === document.activeElement), re = yy(G, B, ge);
      re && setTimeout(() => re.ref.current.focus());
    }), X = y.useCallback(
      (B, G, ge) => {
        const re = !W.current && !ge;
        (x.value !== void 0 && x.value === G || re) && (F(B), re && (W.current = !0));
      },
      [x.value]
    ), C = y.useCallback(() => w == null ? void 0 : w.focus(), [w]), J = y.useCallback(
      (B, G, ge) => {
        const re = !W.current && !ge;
        (x.value !== void 0 && x.value === G || re) && I(B);
      },
      [x.value]
    ), q = r === "popper" ? xa : ny, K = q === xa ? {
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
      ey,
      {
        scope: n,
        content: w,
        viewport: E,
        onViewportChange: k,
        itemRefCallback: X,
        selectedItem: D,
        onItemLeave: C,
        itemTextRefCallback: J,
        focusSelectedItem: N,
        selectedItemText: P,
        position: r,
        isPositioned: z,
        searchRef: S,
        children: /* @__PURE__ */ g($o, { as: cM, allowPinchZoom: !0, children: /* @__PURE__ */ g(
          Oo,
          {
            asChild: !0,
            trapped: x.open,
            onMountAutoFocus: (B) => {
              B.preventDefault();
            },
            onUnmountAutoFocus: le(i, (B) => {
              var G;
              (G = x.trigger) == null || G.focus({ preventScroll: !0 }), B.preventDefault();
            }),
            children: /* @__PURE__ */ g(
              di,
              {
                asChild: !0,
                disableOutsidePointerEvents: !0,
                onEscapeKeyDown: o,
                onPointerDownOutside: s,
                onFocusOutside: (B) => B.preventDefault(),
                onDismiss: () => x.onOpenChange(!1),
                children: /* @__PURE__ */ g(
                  q,
                  {
                    role: "listbox",
                    id: x.contentId,
                    "data-state": x.open ? "open" : "closed",
                    dir: x.dir,
                    onContextMenu: (B) => B.preventDefault(),
                    ...v,
                    ...K,
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
                    onKeyDown: le(v.onKeyDown, (B) => {
                      const G = B.ctrlKey || B.altKey || B.metaKey;
                      if (B.key === "Tab" && B.preventDefault(), !G && B.key.length === 1 && te(B.key), ["ArrowUp", "ArrowDown", "Home", "End"].includes(B.key)) {
                        let re = R().filter((oe) => !oe.disabled).map((oe) => oe.ref.current);
                        if (["ArrowUp", "End"].includes(B.key) && (re = re.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(B.key)) {
                          const oe = B.target, de = re.indexOf(oe);
                          re = re.slice(de + 1);
                        }
                        setTimeout(() => V(re)), B.preventDefault();
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
ty.displayName = lM;
var uM = "SelectItemAlignedPosition", ny = y.forwardRef((e, t) => {
  const { __scopeSelect: n, onPlaced: r, ...i } = e, o = Tn($n, n), s = En($n, n), [a, l] = y.useState(null), [c, u] = y.useState(null), d = we(t, (A) => u(A)), h = Ko(n), f = y.useRef(!1), m = y.useRef(!0), { viewport: p, selectedItem: b, selectedItemText: v, focusSelectedItem: x } = s, w = y.useCallback(() => {
    if (o.trigger && o.valueNode && a && c && p && b && v) {
      const A = o.trigger.getBoundingClientRect(), D = c.getBoundingClientRect(), F = o.valueNode.getBoundingClientRect(), P = v.getBoundingClientRect();
      if (o.dir !== "rtl") {
        const oe = P.left - D.left, de = F.left - oe, je = A.left - de, Ke = A.width + je, wt = Math.max(Ke, D.width), ct = window.innerWidth - Mt, mt = uo(de, [
          Mt,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(Mt, ct - wt)
        ]);
        a.style.minWidth = Ke + "px", a.style.left = mt + "px";
      } else {
        const oe = D.right - P.right, de = window.innerWidth - F.right - oe, je = window.innerWidth - A.right - de, Ke = A.width + je, wt = Math.max(Ke, D.width), ct = window.innerWidth - Mt, mt = uo(de, [
          Mt,
          Math.max(Mt, ct - wt)
        ]);
        a.style.minWidth = Ke + "px", a.style.right = mt + "px";
      }
      const I = h(), R = window.innerHeight - Mt * 2, z = p.scrollHeight, j = window.getComputedStyle(c), W = parseInt(j.borderTopWidth, 10), V = parseInt(j.paddingTop, 10), N = parseInt(j.borderBottomWidth, 10), _ = parseInt(j.paddingBottom, 10), L = W + V + z + _ + N, S = Math.min(b.offsetHeight * 5, L), te = window.getComputedStyle(p), X = parseInt(te.paddingTop, 10), C = parseInt(te.paddingBottom, 10), J = A.top + A.height / 2 - Mt, q = R - J, K = b.offsetHeight / 2, B = b.offsetTop + K, G = W + V + B, ge = L - G;
      if (G <= J) {
        const oe = I.length > 0 && b === I[I.length - 1].ref.current;
        a.style.bottom = "0px";
        const de = c.clientHeight - p.offsetTop - p.offsetHeight, je = Math.max(
          q,
          K + // viewport might have padding bottom, include it to avoid a scrollable viewport
          (oe ? C : 0) + de + N
        ), Ke = G + je;
        a.style.height = Ke + "px";
      } else {
        const oe = I.length > 0 && b === I[0].ref.current;
        a.style.top = "0px";
        const je = Math.max(
          J,
          W + p.offsetTop + // viewport might have padding top, include it to avoid a scrollable viewport
          (oe ? X : 0) + K
        ) + ge;
        a.style.height = je + "px", p.scrollTop = G - J + p.offsetTop;
      }
      a.style.margin = `${Mt}px 0`, a.style.minHeight = S + "px", a.style.maxHeight = R + "px", r == null || r(), requestAnimationFrame(() => f.current = !0);
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
  Xe(() => w(), [w]);
  const [T, E] = y.useState();
  Xe(() => {
    c && E(window.getComputedStyle(c).zIndex);
  }, [c]);
  const k = y.useCallback(
    (A) => {
      A && m.current === !0 && (w(), x == null || x(), m.current = !1);
    },
    [w, x]
  );
  return /* @__PURE__ */ g(
    fM,
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
            zIndex: T
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
ny.displayName = uM;
var dM = "SelectPopperPosition", xa = y.forwardRef((e, t) => {
  const {
    __scopeSelect: n,
    align: r = "start",
    collisionPadding: i = Mt,
    ...o
  } = e, s = Go(n);
  return /* @__PURE__ */ g(
    Gl,
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
xa.displayName = dM;
var [fM, ac] = Tr($n, {}), wa = "SelectViewport", ry = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, nonce: r, ...i } = e, o = En(wa, n), s = ac(wa, n), a = we(t, o.onViewportChange), l = y.useRef(0);
    return /* @__PURE__ */ O(Wt, { children: [
      /* @__PURE__ */ g(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}"
          },
          nonce: r
        }
      ),
      /* @__PURE__ */ g(qo.Slot, { scope: n, children: /* @__PURE__ */ g(
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
          onScroll: le(i.onScroll, (c) => {
            const u = c.currentTarget, { contentWrapper: d, shouldExpandOnScrollRef: h } = s;
            if (h != null && h.current && d) {
              const f = Math.abs(l.current - u.scrollTop);
              if (f > 0) {
                const m = window.innerHeight - Mt * 2, p = parseFloat(d.style.minHeight), b = parseFloat(d.style.height), v = Math.max(p, b);
                if (v < m) {
                  const x = v + f, w = Math.min(m, x), T = x - w;
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
ry.displayName = wa;
var iy = "SelectGroup", [hM, pM] = Tr(iy), mM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = en();
    return /* @__PURE__ */ g(hM, { scope: n, id: i, children: /* @__PURE__ */ g(he.div, { role: "group", "aria-labelledby": i, ...r, ref: t }) });
  }
);
mM.displayName = iy;
var oy = "SelectLabel", gM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = pM(oy, n);
    return /* @__PURE__ */ g(he.div, { id: i.id, ...r, ref: t });
  }
);
gM.displayName = oy;
var fo = "SelectItem", [yM, sy] = Tr(fo), ay = y.forwardRef(
  (e, t) => {
    const {
      __scopeSelect: n,
      value: r,
      disabled: i = !1,
      textValue: o,
      ...s
    } = e, a = Tn(fo, n), l = En(fo, n), c = a.value === r, [u, d] = y.useState(o ?? ""), [h, f] = y.useState(!1), m = we(
      t,
      (x) => {
        var w;
        return (w = l.itemRefCallback) == null ? void 0 : w.call(l, x, r, i);
      }
    ), p = en(), b = y.useRef("touch"), v = () => {
      i || (a.onValueChange(r), a.onOpenChange(!1));
    };
    if (r === "")
      throw new Error(
        "A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
      );
    return /* @__PURE__ */ g(
      yM,
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
          qo.ItemSlot,
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
                onFocus: le(s.onFocus, () => f(!0)),
                onBlur: le(s.onBlur, () => f(!1)),
                onClick: le(s.onClick, () => {
                  b.current !== "mouse" && v();
                }),
                onPointerUp: le(s.onPointerUp, () => {
                  b.current === "mouse" && v();
                }),
                onPointerDown: le(s.onPointerDown, (x) => {
                  b.current = x.pointerType;
                }),
                onPointerMove: le(s.onPointerMove, (x) => {
                  var w;
                  b.current = x.pointerType, i ? (w = l.onItemLeave) == null || w.call(l) : b.current === "mouse" && x.currentTarget.focus({ preventScroll: !0 });
                }),
                onPointerLeave: le(s.onPointerLeave, (x) => {
                  var w;
                  x.currentTarget === document.activeElement && ((w = l.onItemLeave) == null || w.call(l));
                }),
                onKeyDown: le(s.onKeyDown, (x) => {
                  var T;
                  ((T = l.searchRef) == null ? void 0 : T.current) !== "" && x.key === " " || (tM.includes(x.key) && v(), x.key === " " && x.preventDefault());
                })
              }
            )
          }
        )
      }
    );
  }
);
ay.displayName = fo;
var Vr = "SelectItemText", ly = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, className: r, style: i, ...o } = e, s = Tn(Vr, n), a = En(Vr, n), l = sy(Vr, n), c = oM(Vr, n), [u, d] = y.useState(null), h = we(
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
    return Xe(() => (p(m), () => b(m)), [p, b, m]), /* @__PURE__ */ O(Wt, { children: [
      /* @__PURE__ */ g(he.span, { id: l.textId, ...o, ref: h }),
      l.isSelected && s.valueNode && !s.valueNodeHasChildren ? yo.createPortal(o.children, s.valueNode) : null
    ] });
  }
);
ly.displayName = Vr;
var cy = "SelectItemIndicator", uy = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return sy(cy, n).isSelected ? /* @__PURE__ */ g(he.span, { "aria-hidden": !0, ...r, ref: t }) : null;
  }
);
uy.displayName = cy;
var Sa = "SelectScrollUpButton", dy = y.forwardRef((e, t) => {
  const n = En(Sa, e.__scopeSelect), r = ac(Sa, e.__scopeSelect), [i, o] = y.useState(!1), s = we(t, r.onScrollButtonChange);
  return Xe(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollTop > 0;
        o(c);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ g(
    hy,
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
dy.displayName = Sa;
var ka = "SelectScrollDownButton", fy = y.forwardRef((e, t) => {
  const n = En(ka, e.__scopeSelect), r = ac(ka, e.__scopeSelect), [i, o] = y.useState(!1), s = we(t, r.onScrollButtonChange);
  return Xe(() => {
    if (n.viewport && n.isPositioned) {
      let a = function() {
        const c = l.scrollHeight - l.clientHeight, u = Math.ceil(l.scrollTop) < c;
        o(u);
      };
      const l = n.viewport;
      return a(), l.addEventListener("scroll", a), () => l.removeEventListener("scroll", a);
    }
  }, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ g(
    hy,
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
fy.displayName = ka;
var hy = y.forwardRef((e, t) => {
  const { __scopeSelect: n, onAutoScroll: r, ...i } = e, o = En("SelectScrollButton", n), s = y.useRef(null), a = Ko(n), l = y.useCallback(() => {
    s.current !== null && (window.clearInterval(s.current), s.current = null);
  }, []);
  return y.useEffect(() => () => l(), [l]), Xe(() => {
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
      onPointerDown: le(i.onPointerDown, () => {
        s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerMove: le(i.onPointerMove, () => {
        var c;
        (c = o.onItemLeave) == null || c.call(o), s.current === null && (s.current = window.setInterval(r, 50));
      }),
      onPointerLeave: le(i.onPointerLeave, () => {
        l();
      })
    }
  );
}), vM = "SelectSeparator", bM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return /* @__PURE__ */ g(he.div, { "aria-hidden": !0, ...r, ref: t });
  }
);
bM.displayName = vM;
var Ca = "SelectArrow", xM = y.forwardRef(
  (e, t) => {
    const { __scopeSelect: n, ...r } = e, i = Go(n), o = Tn(Ca, n), s = En(Ca, n);
    return o.open && s.position === "popper" ? /* @__PURE__ */ g(Yl, { ...i, ...r, ref: t }) : null;
  }
);
xM.displayName = Ca;
var wM = "SelectBubbleInput", py = y.forwardRef(
  ({ __scopeSelect: e, value: t, ...n }, r) => {
    const i = y.useRef(null), o = we(r, i), s = sc(t);
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
        style: { ...cg, ...n.style },
        ref: o,
        defaultValue: t
      }
    );
  }
);
py.displayName = wM;
function my(e) {
  return e === "" || e === void 0;
}
function gy(e) {
  const t = Fn(e), n = y.useRef(""), r = y.useRef(0), i = y.useCallback(
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
function yy(e, t, n) {
  const i = t.length > 1 && Array.from(t).every((c) => c === t[0]) ? t[0] : t, o = n ? e.indexOf(n) : -1;
  let s = SM(e, Math.max(o, 0));
  i.length === 1 && (s = s.filter((c) => c !== n));
  const l = s.find(
    (c) => c.textValue.toLowerCase().startsWith(i.toLowerCase())
  );
  return l !== n ? l : void 0;
}
function SM(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
var kM = qg, CM = Gg, TM = Xg, EM = Zg, PM = Jg, AM = Qg, RM = ry, NM = ay, IM = ly, DM = uy, MM = dy, OM = fy;
function ho({
  ...e
}) {
  return /* @__PURE__ */ g(kM, { "data-slot": "select", ...e });
}
function po({
  ...e
}) {
  return /* @__PURE__ */ g(TM, { "data-slot": "select-value", ...e });
}
function mo({
  className: e,
  size: t = "default",
  children: n,
  ...r
}) {
  return /* @__PURE__ */ O(
    CM,
    {
      "data-slot": "select-trigger",
      "data-size": t,
      className: Y(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        e
      ),
      ...r,
      children: [
        n,
        /* @__PURE__ */ g(EM, { asChild: !0, children: /* @__PURE__ */ g(vf, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function go({
  className: e,
  children: t,
  position: n = "item-aligned",
  align: r = "center",
  ...i
}) {
  return /* @__PURE__ */ g(PM, { children: /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ O(
    AM,
    {
      "data-slot": "select-content",
      className: Y(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        e
      ),
      position: n,
      align: r,
      ...i,
      children: [
        /* @__PURE__ */ g(LM, {}),
        /* @__PURE__ */ g(
          RM,
          {
            className: Y(
              "p-1",
              n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children: t
          }
        ),
        /* @__PURE__ */ g(_M, {})
      ]
    }
  ) }) });
}
function Qe({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ O(
    NM,
    {
      "data-slot": "select-item",
      className: Y(
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
            children: /* @__PURE__ */ g(DM, { children: /* @__PURE__ */ g(yf, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ g(IM, { children: t })
      ]
    }
  );
}
function LM({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    MM,
    {
      "data-slot": "select-scroll-up-button",
      className: Y(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ g(ov, { className: "size-4" })
    }
  );
}
function _M({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ g(
    OM,
    {
      "data-slot": "select-scroll-down-button",
      className: Y(
        "flex cursor-default items-center justify-center py-1",
        e
      ),
      ...t,
      children: /* @__PURE__ */ g(vf, { className: "size-4" })
    }
  );
}
var FM = [
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
], VM = FM.reduce((e, t) => {
  const n = /* @__PURE__ */ Nf(`Primitive.${t}`), r = y.forwardRef((i, o) => {
    const { asChild: s, ...a } = i, l = s ? n : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ g(l, { ...a, ref: o });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {}), zM = "Label", vy = y.forwardRef((e, t) => /* @__PURE__ */ g(
  VM.label,
  {
    ...e,
    ref: t,
    onMouseDown: (n) => {
      var i;
      n.target.closest("button, input, select, textarea") || ((i = e.onMouseDown) == null || i.call(e, n), !n.defaultPrevented && n.detail > 1 && n.preventDefault());
    }
  }
));
vy.displayName = zM;
var by = vy;
const In = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ g(
  by,
  {
    ref: n,
    "data-slot": "label",
    className: Y(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      e
    ),
    ...t
  }
));
In.displayName = by.displayName;
var xy = ["PageUp", "PageDown"], wy = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], Sy = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, Er = "Slider", [Ta, BM, $M] = Hg(Er), [ky] = sn(Er, [
  $M
]), [jM, Yo] = ky(Er), Cy = y.forwardRef(
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
    } = e, b = y.useRef(/* @__PURE__ */ new Set()), v = y.useRef(0), w = s === "horizontal" ? UM : HM, [T = [], E] = bn({
      prop: u,
      defaultProp: c,
      onChange: (I) => {
        var z;
        (z = [...b.current][v.current]) == null || z.focus(), d(I);
      }
    }), k = y.useRef(T);
    function A(I) {
      const R = YM(T, I);
      P(I, R);
    }
    function D(I) {
      P(I, v.current);
    }
    function F() {
      const I = k.current[v.current];
      T[v.current] !== I && h(T);
    }
    function P(I, R, { commit: z } = { commit: !1 }) {
      const j = QM(o), W = eO(Math.round((I - r) / o) * o + r, j), V = uo(W, [r, i]);
      E((N = []) => {
        const _ = KM(N, V, R);
        if (JM(_, l * o)) {
          v.current = _.indexOf(V);
          const L = String(_) !== String(N);
          return L && z && h(_), L ? _ : N;
        } else
          return N;
      });
    }
    return /* @__PURE__ */ g(
      jM,
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
        form: m,
        children: /* @__PURE__ */ g(Ta.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(Ta.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(
          w,
          {
            "aria-disabled": a,
            "data-disabled": a ? "" : void 0,
            ...p,
            ref: t,
            onPointerDown: le(p.onPointerDown, () => {
              a || (k.current = T);
            }),
            min: r,
            max: i,
            inverted: f,
            onSlideStart: a ? void 0 : A,
            onSlideMove: a ? void 0 : D,
            onSlideEnd: a ? void 0 : F,
            onHomeKeyDown: () => !a && P(r, 0, { commit: !0 }),
            onEndKeyDown: () => !a && P(i, T.length - 1, { commit: !0 }),
            onStepKeyDown: ({ event: I, direction: R }) => {
              if (!a) {
                const W = xy.includes(I.key) || I.shiftKey && wy.includes(I.key) ? 10 : 1, V = v.current, N = T[V], _ = o * W * R;
                P(N + _, V, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Cy.displayName = Er;
var [Ty, Ey] = ky(Er, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), UM = y.forwardRef(
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
    } = e, [d, h] = y.useState(null), f = we(t, (w) => h(w)), m = y.useRef(void 0), p = Wg(i), b = p === "ltr", v = b && !o || !b && o;
    function x(w) {
      const T = m.current || d.getBoundingClientRect(), E = [0, T.width], A = lc(E, v ? [n, r] : [r, n]);
      return m.current = T, A(w - T.left);
    }
    return /* @__PURE__ */ g(
      Ty,
      {
        scope: e.__scopeSlider,
        startEdge: v ? "left" : "right",
        endEdge: v ? "right" : "left",
        direction: v ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ g(
          Py,
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
              const T = x(w.clientX);
              s == null || s(T);
            },
            onSlideMove: (w) => {
              const T = x(w.clientX);
              a == null || a(T);
            },
            onSlideEnd: () => {
              m.current = void 0, l == null || l();
            },
            onStepKeyDown: (w) => {
              const E = Sy[v ? "from-left" : "from-right"].includes(w.key);
              c == null || c({ event: w, direction: E ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), HM = y.forwardRef(
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
    function m(p) {
      const b = h.current || u.current.getBoundingClientRect(), v = [0, b.height], w = lc(v, f ? [r, n] : [n, r]);
      return h.current = b, w(p - b.top);
    }
    return /* @__PURE__ */ g(
      Ty,
      {
        scope: e.__scopeSlider,
        startEdge: f ? "bottom" : "top",
        endEdge: f ? "top" : "bottom",
        size: "height",
        direction: f ? 1 : -1,
        children: /* @__PURE__ */ g(
          Py,
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
              const v = Sy[f ? "from-bottom" : "from-top"].includes(p.key);
              l == null || l({ event: p, direction: v ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), Py = y.forwardRef(
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
    } = e, u = Yo(Er, n);
    return /* @__PURE__ */ g(
      he.span,
      {
        ...c,
        ref: t,
        onKeyDown: le(e.onKeyDown, (d) => {
          d.key === "Home" ? (s(d), d.preventDefault()) : d.key === "End" ? (a(d), d.preventDefault()) : xy.concat(wy).includes(d.key) && (l(d), d.preventDefault());
        }),
        onPointerDown: le(e.onPointerDown, (d) => {
          const h = d.target;
          h.setPointerCapture(d.pointerId), d.preventDefault(), u.thumbs.has(h) ? h.focus() : r(d);
        }),
        onPointerMove: le(e.onPointerMove, (d) => {
          d.target.hasPointerCapture(d.pointerId) && i(d);
        }),
        onPointerUp: le(e.onPointerUp, (d) => {
          const h = d.target;
          h.hasPointerCapture(d.pointerId) && (h.releasePointerCapture(d.pointerId), o(d));
        })
      }
    );
  }
), Ay = "SliderTrack", Ry = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...r } = e, i = Yo(Ay, n);
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
Ry.displayName = Ay;
var Ea = "SliderRange", Ny = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...r } = e, i = Yo(Ea, n), o = Ey(Ea, n), s = y.useRef(null), a = we(t, s), l = i.values.length, c = i.values.map(
      (h) => My(h, i.min, i.max)
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
Ny.displayName = Ea;
var Pa = "SliderThumb", Iy = y.forwardRef(
  (e, t) => {
    const n = BM(e.__scopeSlider), [r, i] = y.useState(null), o = we(t, (a) => i(a)), s = y.useMemo(
      () => r ? n().findIndex((a) => a.ref.current === r) : -1,
      [n, r]
    );
    return /* @__PURE__ */ g(WM, { ...e, ref: o, index: s });
  }
), WM = y.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, index: r, name: i, ...o } = e, s = Yo(Pa, n), a = Ey(Pa, n), [l, c] = y.useState(null), u = we(t, (x) => c(x)), d = l ? s.form || !!l.closest("form") : !0, h = Hl(l), f = s.values[r], m = f === void 0 ? 0 : My(f, s.min, s.max), p = GM(r, s.values.length), b = h == null ? void 0 : h[a.size], v = b ? XM(b, m, a.direction) : 0;
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
          /* @__PURE__ */ g(Ta.ItemSlot, { scope: e.__scopeSlider, children: /* @__PURE__ */ g(
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
              onFocus: le(e.onFocus, () => {
                s.valueIndexToChangeRef.current = r;
              })
            }
          ) }),
          d && /* @__PURE__ */ g(
            Dy,
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
Iy.displayName = Pa;
var qM = "RadioBubbleInput", Dy = y.forwardRef(
  ({ __scopeSlider: e, value: t, ...n }, r) => {
    const i = y.useRef(null), o = we(i, r), s = sc(t);
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
Dy.displayName = qM;
function KM(e = [], t, n) {
  const r = [...e];
  return r[n] = t, r.sort((i, o) => i - o);
}
function My(e, t, n) {
  const o = 100 / (n - t) * (e - t);
  return uo(o, [0, 100]);
}
function GM(e, t) {
  return t > 2 ? `Value ${e + 1} of ${t}` : t === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function YM(e, t) {
  if (e.length === 1) return 0;
  const n = e.map((i) => Math.abs(i - t)), r = Math.min(...n);
  return n.indexOf(r);
}
function XM(e, t, n) {
  const r = e / 2, o = lc([0, 50], [0, r]);
  return (r - o(t) * n) * n;
}
function ZM(e) {
  return e.slice(0, -1).map((t, n) => e[n + 1] - t);
}
function JM(e, t) {
  if (t > 0) {
    const n = ZM(e);
    return Math.min(...n) >= t;
  }
  return !0;
}
function lc(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const r = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + r * (n - e[0]);
  };
}
function QM(e) {
  return (String(e).split(".")[1] || "").length;
}
function eO(e, t) {
  const n = Math.pow(10, t);
  return Math.round(e * n) / n;
}
var Oy = Cy, tO = Ry, nO = Ny, rO = Iy;
const Bi = y.forwardRef(({ className: e, defaultValue: t, value: n, min: r = 0, max: i = 100, ...o }, s) => {
  const a = y.useMemo(
    () => Array.isArray(n) ? n : Array.isArray(t) ? t : [r, i],
    [n, t, r, i]
  );
  return /* @__PURE__ */ O(
    Oy,
    {
      ref: s,
      "data-slot": "slider",
      defaultValue: t,
      value: n,
      min: r,
      max: i,
      className: Y(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        e
      ),
      ...o,
      children: [
        /* @__PURE__ */ g(
          tO,
          {
            "data-slot": "slider-track",
            className: Y(
              "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            ),
            children: /* @__PURE__ */ g(
              nO,
              {
                "data-slot": "slider-range",
                className: Y(
                  "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                )
              }
            )
          }
        ),
        Array.from({ length: a.length }, (l, c) => /* @__PURE__ */ g(
          rO,
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
Bi.displayName = Oy.displayName;
var Xo = "Switch", [iO] = sn(Xo), [oO, sO] = iO(Xo), Ly = y.forwardRef(
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
    } = e, [h, f] = y.useState(null), m = we(t, (w) => f(w)), p = y.useRef(!1), b = h ? u || !!h.closest("form") : !0, [v, x] = bn({
      prop: i,
      defaultProp: o ?? !1,
      onChange: c,
      caller: Xo
    });
    return /* @__PURE__ */ O(oO, { scope: n, checked: v, disabled: a, children: [
      /* @__PURE__ */ g(
        he.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": v,
          "aria-required": s,
          "data-state": zy(v),
          "data-disabled": a ? "" : void 0,
          disabled: a,
          value: l,
          ...d,
          ref: m,
          onClick: le(e.onClick, (w) => {
            x((T) => !T), b && (p.current = w.isPropagationStopped(), p.current || w.stopPropagation());
          })
        }
      ),
      b && /* @__PURE__ */ g(
        Vy,
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
Ly.displayName = Xo;
var _y = "SwitchThumb", Fy = y.forwardRef(
  (e, t) => {
    const { __scopeSwitch: n, ...r } = e, i = sO(_y, n);
    return /* @__PURE__ */ g(
      he.span,
      {
        "data-state": zy(i.checked),
        "data-disabled": i.disabled ? "" : void 0,
        ...r,
        ref: t
      }
    );
  }
);
Fy.displayName = _y;
var aO = "SwitchBubbleInput", Vy = y.forwardRef(
  ({
    __scopeSwitch: e,
    control: t,
    checked: n,
    bubbles: r = !0,
    ...i
  }, o) => {
    const s = y.useRef(null), a = we(s, o), l = sc(n), c = Hl(t);
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
Vy.displayName = aO;
function zy(e) {
  return e ? "checked" : "unchecked";
}
var By = Ly, lO = Fy;
const $y = y.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ g(
  By,
  {
    ref: n,
    "data-slot": "switch",
    className: Y(
      "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      e
    ),
    ...t,
    children: /* @__PURE__ */ g(
      lO,
      {
        "data-slot": "switch-thumb",
        className: Y(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
$y.displayName = By.displayName;
function cO({
  voiceConfig: e,
  onConfigChange: t,
  availableVoices: n,
  selectedVoice: r,
  onVoiceChange: i,
  autoSpeak: o = !1,
  onAutoSpeakChange: s
}) {
  const [a, l] = se(() => ji());
  $e(() => {
    l(ji());
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
      /* @__PURE__ */ g(In, { htmlFor: "auto-speak", className: "text-xs font-medium cursor-pointer", children: "Auto-speak responses" }),
      /* @__PURE__ */ g(
        $y,
        {
          id: "auto-speak",
          checked: o,
          onCheckedChange: s
        }
      )
    ] }),
    a.speechSynthesis && n.length > 0 && /* @__PURE__ */ O("div", { className: "space-y-2", children: [
      /* @__PURE__ */ g(In, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Voice Engine" }),
      /* @__PURE__ */ O(
        ho,
        {
          value: (r == null ? void 0 : r.voiceURI) || "",
          onValueChange: (d) => {
            const h = n.find((f) => f.voiceURI === d);
            i(h || null);
          },
          children: [
            /* @__PURE__ */ g(mo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(po, { placeholder: "Select a voice" }) }),
            /* @__PURE__ */ g(go, { className: "max-h-60 rounded-xl border-border/40 shadow-xl", children: Object.entries(c).map(([d, h]) => /* @__PURE__ */ O("div", { children: [
              /* @__PURE__ */ g("div", { className: "px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/50 bg-muted/20", children: u[d] || d }),
              h.map((f) => /* @__PURE__ */ g(
                Qe,
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
      /* @__PURE__ */ g(In, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Recognition Language" }),
      /* @__PURE__ */ O(
        ho,
        {
          value: e.lang,
          onValueChange: (d) => t({ lang: d }),
          children: [
            /* @__PURE__ */ g(mo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(po, {}) }),
            /* @__PURE__ */ O(go, { className: "rounded-xl border-border/40 shadow-xl", children: [
              /* @__PURE__ */ g(Qe, { value: "en-US", className: "text-xs rounded-md my-0.5", children: "English (US)" }),
              /* @__PURE__ */ g(Qe, { value: "en-GB", className: "text-xs rounded-md my-0.5", children: "English (UK)" }),
              /* @__PURE__ */ g(Qe, { value: "es-ES", className: "text-xs rounded-md my-0.5", children: "Spanish" }),
              /* @__PURE__ */ g(Qe, { value: "fr-FR", className: "text-xs rounded-md my-0.5", children: "French" }),
              /* @__PURE__ */ g(Qe, { value: "de-DE", className: "text-xs rounded-md my-0.5", children: "German" }),
              /* @__PURE__ */ g(Qe, { value: "it-IT", className: "text-xs rounded-md my-0.5", children: "Italian" }),
              /* @__PURE__ */ g(Qe, { value: "pt-BR", className: "text-xs rounded-md my-0.5", children: "Portuguese" }),
              /* @__PURE__ */ g(Qe, { value: "zh-CN", className: "text-xs rounded-md my-0.5", children: "Chinese (Simplified)" }),
              /* @__PURE__ */ g(Qe, { value: "ja-JP", className: "text-xs rounded-md my-0.5", children: "Japanese" }),
              /* @__PURE__ */ g(Qe, { value: "ko-KR", className: "text-xs rounded-md my-0.5", children: "Korean" }),
              /* @__PURE__ */ g(Qe, { value: "hi-IN", className: "text-xs rounded-md my-0.5", children: "Hindi" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ O("div", { className: "grid gap-4 pt-1", children: [
      a.speechSynthesis && /* @__PURE__ */ O("div", { className: "space-y-2.5", children: [
        /* @__PURE__ */ O("div", { className: "flex items-center justify-between px-0.5", children: [
          /* @__PURE__ */ g(In, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Playback Speed" }),
          /* @__PURE__ */ O("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: [
            e.rate.toFixed(1),
            "x"
          ] })
        ] }),
        /* @__PURE__ */ g(
          Bi,
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
          /* @__PURE__ */ g(In, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Voice Pitch" }),
          /* @__PURE__ */ g("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: e.pitch.toFixed(1) })
        ] }),
        /* @__PURE__ */ g(
          Bi,
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
          /* @__PURE__ */ g(In, { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70", children: "Output Volume" }),
          /* @__PURE__ */ O("span", { className: "text-[10px] font-mono font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded", children: [
            Math.round(e.volume * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ g(
          Bi,
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
function uO({
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
  return /* @__PURE__ */ O(Jl, { children: [
    /* @__PURE__ */ g(Ql, { asChild: !0, children: /* @__PURE__ */ g(
      qe,
      {
        variant: "ghost",
        size: "icon",
        className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
        children: /* @__PURE__ */ g(yv, { className: "h-4 w-4" })
      }
    ) }),
    /* @__PURE__ */ g(ec, { align: "end", className: "w-[320px] p-5 rounded-2xl shadow-2xl border-border/40 backdrop-blur-3xl ring-1 ring-black/5 max-h-[85vh] overflow-y-auto custom-scrollbar", children: /* @__PURE__ */ g("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ O("div", { className: "grid gap-6", children: [
      /* @__PURE__ */ O("div", { className: "space-y-4", children: [
        /* @__PURE__ */ g("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ g("h4", { className: "font-semibold text-sm", children: "Model Configuration" }) }),
        /* @__PURE__ */ O("div", { className: "flex items-center gap-4 w-full", children: [
          /* @__PURE__ */ O("div", { className: "flex flex-col gap-2 flex-1", children: [
            /* @__PURE__ */ g("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Active Agent" }),
            /* @__PURE__ */ O(ho, { value: e, onValueChange: t, children: [
              /* @__PURE__ */ g(mo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(po, { placeholder: "Select Agent", className: "capitalize" }) }),
              /* @__PURE__ */ O(go, { className: "rounded-xl border-border/40 shadow-xl", children: [
                n.map((f) => /* @__PURE__ */ g(Qe, { value: f.key, className: "text-xs rounded-md my-0.5 capitalize", children: f.key }, f.key)),
                n.length === 0 && /* @__PURE__ */ g(Qe, { value: e || "default", className: "capitalize", children: e || "Default" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ O("div", { className: "flex flex-col gap-2 flex-1", children: [
            /* @__PURE__ */ g("label", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5", children: "Active Model" }),
            /* @__PURE__ */ O(ho, { value: r, onValueChange: i, children: [
              /* @__PURE__ */ g(mo, { className: "h-9 text-xs rounded-lg border-border/60 bg-muted/30 focus:ring-primary/20", children: /* @__PURE__ */ g(po, { placeholder: "Select Model", className: "capitalize" }) }),
              /* @__PURE__ */ O(go, { className: "rounded-xl border-border/40 shadow-xl", children: [
                o.map((f) => /* @__PURE__ */ g(Qe, { value: f, className: "text-xs rounded-md my-0.5 capitalize", children: f }, f)),
                o.length === 0 && /* @__PURE__ */ g(Qe, { value: r || "default", className: "capitalize", children: r || "Default" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ g("div", { className: "h-px bg-border/50" }),
      /* @__PURE__ */ g(
        cO,
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
function dO({
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
  onVoiceChange: T,
  autoSpeak: E,
  onAutoSpeakChange: k,
  onDeleteThread: A,
  onExpand: D,
  isExpanded: F,
  onClose: P
}) {
  return /* @__PURE__ */ g("div", { className: "relative z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl", children: /* @__PURE__ */ O("div", { className: "flex items-center justify-between px-4 py-3", children: [
    /* @__PURE__ */ O("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ O("div", { className: "relative group", children: [
        /* @__PURE__ */ g("div", { className: "absolute -inset-1 rounded-xl bg-gradient-to-tr from-primary to-primary/40 opacity-25 blur transition duration-300 group-hover:opacity-40" }),
        /* @__PURE__ */ g("div", { className: "relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg", children: /* @__PURE__ */ g(vo, { className: "h-4.5 w-4.5" }) }),
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
        $D,
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
        qe,
        {
          variant: "ghost",
          size: "icon",
          onClick: n,
          title: "New Chat",
          className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
          disabled: t,
          children: /* @__PURE__ */ g(xf, { className: Y("h-4 w-4", t && "animate-spin") })
        }
      ),
      A && s && /* @__PURE__ */ g(
        qe,
        {
          variant: "ghost",
          size: "icon",
          onClick: () => A(s),
          title: "Delete this conversation",
          className: "h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors",
          children: /* @__PURE__ */ g(wv, { className: "h-4 w-4" })
        }
      ),
      D && /* @__PURE__ */ g(
        qe,
        {
          variant: "ghost",
          size: "icon",
          onClick: D,
          title: F ? "Collapse" : "Expand",
          className: "h-8 w-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors",
          children: F ? /* @__PURE__ */ g(mv, { className: "h-4 w-4" }) : /* @__PURE__ */ g(dv, { className: "h-4 w-4" })
        }
      ),
      u && /* @__PURE__ */ g(
        uO,
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
          onVoiceChange: T,
          autoSpeak: E,
          onAutoSpeakChange: k
        }
      ),
      P && /* @__PURE__ */ g(
        qe,
        {
          variant: "ghost",
          size: "icon",
          onClick: P,
          title: "Close",
          className: "h-8 w-8 rounded-lg hover:bg-destructive/5 hover:text-destructive transition-colors",
          children: /* @__PURE__ */ g(mr, { className: "h-4 w-4" })
        }
      )
    ] })
  ] }) });
}
const ff = (e) => {
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
function fO({
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
  var At, Le, Rt, ut;
  const [w, T] = se(t), [E, k] = se(m || ""), [A, D] = se([]), [F, P] = se(""), I = h ?? F, R = Be((Q) => {
    if (h === void 0 && P(Q), f) {
      const ae = typeof Q == "function" ? Q(I) : Q;
      f(ae);
    }
  }, [h, f, I]), [z, j] = se(!1), [W, V] = se([]), [N, _] = se(null), [L, S] = se([]), [te, X] = se([]), [C, J] = se(!1), [q, K] = se([]), [B, G] = se(p || null), [ge, re] = se(!1), oe = Be((Q) => {
    var Ce, Oe;
    if (!((Ce = N == null ? void 0 : N.info) != null && Ce.agents)) return;
    const ae = N.info.agents.find((He) => He.key === Q);
    D([]);
    const Te = (Oe = ae == null ? void 0 : ae.suggestions) != null && Oe.length ? ae.suggestions : i != null && i.length ? i : [];
    V(Te);
  }, [(At = N == null ? void 0 : N.info) == null ? void 0 : At.agents, i]);
  $e(() => {
    p && (G(p), N && je(p));
  }, [p, N]), $e(() => {
    (async () => {
      try {
        const ae = w === "default" ? null : w, Te = new Gy({
          baseUrl: e,
          agent: ae,
          getInfo: !0
        });
        await Te.retrieveInfo(), _(Te), Te.info && (S(Te.info.agents), X(Te.info.models), Te.agent && T(Te.agent), E || k(Te.info.default_model), A.length === 0 && Te.agent && oe(Te.agent));
      } catch (ae) {
        ae instanceof Error && (o == null || o(ae));
      }
    })();
  }, [e]), $e(() => {
    var Q;
    if (N) {
      try {
        N.updateAgent(w, !0);
      } catch (ae) {
        console.warn("Could not update agent yet", ae);
      }
      if (A.length === 0) {
        const ae = L.find((Ce) => Ce.key === w), Te = (Q = ae == null ? void 0 : ae.suggestions) != null && Q.length ? ae.suggestions : i != null && i.length ? i : [];
        V(Te);
      }
    }
  }, [w, N, L, A.length, i]);
  const de = Be(async () => {
    if (N) {
      if (n == null || n === "") {
        K([]);
        return;
      }
      try {
        const Q = await N.listThreads(20, 0, n);
        K(Q);
      } catch (Q) {
        console.error("Failed to fetch history", Q);
      }
    }
  }, [N, n]), je = async (Q) => {
    if (N)
      try {
        j(!0);
        const ae = await N.getHistory({
          thread_id: Q,
          user_id: n || void 0
        }), Te = await Promise.all(
          ae.messages.map(async (Ce) => {
            var He;
            const Oe = {
              id: Ce.id || crypto.randomUUID(),
              role: Ce.type === "human" ? "user" : "assistant",
              content: Ce.content,
              createdAt: /* @__PURE__ */ new Date()
              // We assume current time if timestamp missing
            };
            if ((He = Ce.custom_data) != null && He.attachments && Array.isArray(Ce.custom_data.attachments))
              try {
                const ve = (await Promise.all(
                  Ce.custom_data.attachments.map(async (be) => {
                    const Ze = `${e}/files/${be.file_id}`, Ge = await fetch(Ze);
                    if (!Ge.ok)
                      return console.warn(`Failed to load file ${be.file_id}`), null;
                    const Ee = await Ge.blob(), Pe = await new Promise((Se, me) => {
                      const _e = new FileReader();
                      _e.onload = () => Se(_e.result), _e.onerror = me, _e.readAsDataURL(Ee);
                    });
                    return {
                      name: be.filename,
                      contentType: be.content_type,
                      url: Pe
                    };
                  })
                )).filter((be) => be !== null);
                ve.length > 0 && (Oe.experimental_attachments = ve);
              } catch (ne) {
                console.error("Error loading file attachments from history:", ne);
              }
            return Oe;
          })
        );
        D(Te), G(Q), J(!1);
      } catch (ae) {
        ae instanceof Error && (o == null || o(ae));
      } finally {
        j(!1);
      }
  }, Ke = Be(() => {
    re(!0), setTimeout(() => re(!1), 1e3), N != null && N.agent ? oe(N.agent) : (D([]), V(i || [])), G(null), R(""), J(!1);
  }, [N == null ? void 0 : N.agent, oe, i]), wt = Be(async () => {
    if (!(!B || !n || !N))
      try {
        await N.deleteThread(B, n), Ke(), await de();
      } catch (Q) {
        Q instanceof Error && (o == null || o(Q));
      }
  }, [B, n, N, o, de, Ke]), ct = async (Q, ae) => {
    var Ze, Ge;
    const Te = Q.trim().length > 0, Ce = ae && ae.length > 0;
    if (!Te && !Ce || !N) return;
    const Oe = ae ? await Promise.all(
      Array.from(ae).map(async (Ee) => new Promise((Pe) => {
        const Se = new FileReader();
        Se.onload = () => {
          Pe({
            name: Ee.name,
            contentType: Ee.type,
            url: Se.result
            // This will be a data URL
          });
        }, Se.onerror = () => {
          Pe({
            name: Ee.name,
            contentType: Ee.type,
            url: URL.createObjectURL(Ee)
          });
        }, Se.readAsDataURL(Ee);
      }))
    ) : void 0, He = Q.trim() || (Ce ? "Please analyze the attached files." : ""), ne = {
      id: crypto.randomUUID(),
      role: "user",
      content: He,
      createdAt: /* @__PURE__ */ new Date(),
      experimental_attachments: Oe
    };
    D((Ee) => [...Ee, ne]), R(""), V([]), j(!0);
    const ve = B || crypto.randomUUID();
    B || G(ve);
    const be = { thread_id: ve, user_id: n };
    try {
      let Ee = [];
      if (ae && ae.length > 0)
        try {
          const Pe = Array.from(ae);
          console.log("Uploading files:", Pe.map((me) => ({ name: me.name, size: me.size, type: me.type })));
          const Se = kg(Pe);
          if (!Se.valid) {
            console.error("File validation failed:", Se.error), D((me) => [...me, {
              id: crypto.randomUUID(),
              role: "assistant",
              content: Se.error || "File validation failed. Please try again.",
              createdAt: /* @__PURE__ */ new Date()
            }]), j(!1);
            return;
          }
          Ee = await N.uploadFiles(Pe);
        } catch (Pe) {
          console.error("Error uploading files:", Pe);
          const Se = Pe instanceof Error ? Pe.message : "Error uploading files. Please try again.";
          D((me) => [...me, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: Se,
            createdAt: /* @__PURE__ */ new Date()
          }]), j(!1);
          return;
        }
      if (r) {
        const Pe = N.stream({
          message: Q.trim() || (Ce ? "Please analyze the attached files." : ""),
          model: E || void 0,
          attachments: Ee.length > 0 ? Ee : void 0,
          ...be
        });
        let Se = null;
        for await (const me of Pe)
          if (typeof me == "string")
            mt(me, Se, (_e) => Se = _e);
          else if (typeof me == "object" && me !== null) {
            if ("type" in me && me.type === "update") {
              const Nt = me, cn = Nt.updates.follow_up || Nt.updates.next_step_suggestions;
              cn && V(cn);
              continue;
            }
            const _e = me;
            if ((Ze = _e.tool_calls) != null && Ze.length) {
              const Nt = _e.tool_calls.some((cn) => cn.name.includes("sub-agent"));
              Se = null, D((cn) => [...cn, {
                id: crypto.randomUUID(),
                role: Nt ? "subagent" : "tool",
                content: _e.content || "",
                toolInvocations: _e.tool_calls.map((Rr) => ({
                  state: "call",
                  toolName: Rr.name,
                  toolCallId: Rr.id || crypto.randomUUID()
                })),
                createdAt: /* @__PURE__ */ new Date()
              }]);
            } else _e.type === "tool" && _e.content ? (Se = null, D((Nt) => [...Nt, {
              id: crypto.randomUUID(),
              role: "tool",
              content: _e.content,
              createdAt: /* @__PURE__ */ new Date()
            }])) : _e.content && mt(_e.content, Se, (Nt) => Se = Nt);
          }
        D((me) => {
          const _e = me[me.length - 1];
          if ((_e == null ? void 0 : _e.role) === "assistant") {
            const { suggestions: Nt, cleanContent: cn } = ff(_e.content);
            if (Nt.length > 0)
              return V(Nt), me.map((Rr, jy) => jy === me.length - 1 ? { ...Rr, content: cn } : Rr);
          }
          return me;
        });
      } else {
        const Pe = await N.invoke({
          message: Q.trim() || (Ce ? "Please analyze the attached files." : ""),
          model: E || void 0,
          attachments: Ee.length > 0 ? Ee : void 0,
          ...be
        }), { suggestions: Se, cleanContent: me } = ff(Pe.content || "");
        V((Ge = Pe.suggestions) != null && Ge.length ? Pe.suggestions : Se), D((_e) => [..._e, {
          id: Pe.id || crypto.randomUUID(),
          role: "assistant",
          content: me,
          createdAt: /* @__PURE__ */ new Date()
        }]);
      }
    } catch (Ee) {
      console.log("Error: ", Ee), Ee instanceof Error && (o == null || o(Ee)), D((Pe) => [...Pe, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "More Information required to proceed",
        createdAt: /* @__PURE__ */ new Date()
      }]);
    } finally {
      j(!1), de();
    }
  }, mt = Be((Q, ae, Te) => {
    D((Ce) => {
      const Oe = Ce[Ce.length - 1];
      if (ae && Oe && Oe.id === ae && Oe.role === "assistant" && !Oe.toolInvocations)
        return Ce.map((He) => He.id === ae ? { ...He, content: He.content + Q } : He);
      {
        const He = crypto.randomUUID();
        return Te(He), [...Ce, { id: He, role: "assistant", content: Q, createdAt: /* @__PURE__ */ new Date() }];
      }
    });
  }, []), Yt = async (Q, ae) => {
    var Oe;
    (Oe = Q == null ? void 0 : Q.preventDefault) == null || Oe.call(Q);
    const Te = ae == null ? void 0 : ae.experimental_attachments, Ce = Te && Te.length > 0 ? Array.from(Te) : void 0;
    Ce && console.log("Files being sent:", Ce.map((He) => ({ name: He.name, size: He.size, type: He.type }))), ct(I, Ce);
  }, Et = (Q) => {
    R(Q.target.value);
  }, [Xt, Zt] = se(!1), {
    isListening: Wn,
    isSpeaking: Pt,
    startListening: Pr,
    stopListening: Ar,
    speak: M,
    stopSpeaking: H,
    voiceConfig: ie,
    updateConfig: fe,
    availableVoices: ye,
    selectedVoice: ot,
    setSelectedVoice: St,
    isRecognitionSupported: st
  } = Jy({
    onTranscript: (Q, ae) => {
      ae && R((Te) => {
        const Ce = Te && !Te.endsWith(" ") ? " " : "";
        return Te + Ce + Q;
      });
    }
  }), at = De(z);
  return $e(() => {
    if (at.current && !z && Xt) {
      const Q = A[A.length - 1];
      (Q == null ? void 0 : Q.role) === "assistant" && Q.content && M(Q.content);
    }
    at.current = z;
  }, [z, Xt, A, M]), /* @__PURE__ */ g("div", { className: "chat-theme h-full w-full", children: /* @__PURE__ */ O("div", { className: Y("flex h-full w-full flex-col overflow-hidden", a), children: [
    c && /* @__PURE__ */ g(
      dO,
      {
        currentAgent: w,
        isRefreshing: ge,
        onNewChat: Ke,
        onDeleteThread: wt,
        isHistoryOpen: C,
        onHistoryOpenChange: J,
        threads: q,
        currentThreadId: B,
        onSelectThread: je,
        onFetchHistory: de,
        direction: d,
        showSettings: l,
        availableAgents: L,
        onAgentChange: T,
        currentModel: E,
        onModelChange: k,
        availableModels: te,
        voiceConfig: ie,
        onVoiceConfigChange: fe,
        availableVoices: ye,
        selectedVoice: ot,
        onVoiceChange: St,
        autoSpeak: Xt,
        onAutoSpeakChange: Zt,
        onExpand: b,
        isExpanded: v,
        onClose: x
      }
    ),
    /* @__PURE__ */ g("div", { className: "flex-1 overflow-hidden relative bg-background flex flex-col", children: /* @__PURE__ */ g(
      Tg,
      {
        messages: A,
        handleSubmit: Yt,
        input: I,
        handleInputChange: Et,
        isGenerating: z,
        append: (Q) => ct(Q.content),
        suggestions: W.length > 0 ? W : A.length === 0 ? i : [],
        onRateResponse: s,
        placeholder: u,
        isListening: Wn,
        startListening: Pr,
        stopListening: Ar,
        isSpeechSupported: st,
        speak: M,
        stopSpeaking: H,
        isSpeaking: Pt,
        label: (ut = (Rt = (Le = N == null ? void 0 : N.info) == null ? void 0 : Le.agents) == null ? void 0 : Rt.find((Q) => Q.key === w)) == null ? void 0 : ut.description,
        className: "flex-1"
      }
    ) })
  ] }) });
}
function bO({
  buttonClassName: e,
  windowClassName: t,
  ...n
}) {
  const [r, i] = se(!1), [o, s] = se(!1), [a, l] = se({
    width: typeof window < "u" ? window.innerWidth : 0,
    height: typeof window < "u" ? window.innerHeight : 0
  });
  return $e(() => {
    const c = () => {
      l({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    return window.addEventListener("resize", c), () => window.removeEventListener("resize", c);
  }, []), /* @__PURE__ */ O(Jl, { open: r, onOpenChange: i, children: [
    /* @__PURE__ */ g("div", { className: "chat-theme", children: /* @__PURE__ */ g(Ql, { asChild: !0, className: Y(r && "opacity-0 pointer-events-none"), children: /* @__PURE__ */ g(
      qe,
      {
        className: Y(
          "fixed bottom-6 right-6 size-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
          e
        ),
        size: "icon",
        children: /* @__PURE__ */ g(fv, { className: "size-6" })
      }
    ) }) }),
    /* @__PURE__ */ g(
      ec,
      {
        className: Y(
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
          fO,
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
  fO as A,
  qe as B,
  Tg as C,
  Cg as M,
  bO as P,
  uS as a,
  ES as b,
  wd as c,
  Gy as d,
  Fe as e,
  SS as f,
  Eg as g,
  TS as h,
  Pg as i,
  lD as j,
  y2 as k,
  aD as l,
  ya as m,
  no as n,
  ef as o,
  Y as p,
  bl as s,
  mS as w
};
