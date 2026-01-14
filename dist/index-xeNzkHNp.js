var qt = Object.defineProperty;
var zt = (n, e, t) => e in n ? qt(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var d = (n, e, t) => zt(n, typeof e != "symbol" ? e + "" : e, t);
import { w as Be, s as ht, f as Vt, a as Jt, b as Kt, c as Ve, h as Qt } from "./index-BZWFuAq-.js";
const Je = {}.hasOwnProperty;
function Xt(n, e) {
  const t = e || {};
  function r(i, ...s) {
    let a = r.invalid;
    const c = r.handlers;
    if (i && Je.call(i, n)) {
      const o = String(i[n]);
      a = Je.call(c, o) ? c[o] : r.unknown;
    }
    if (a)
      return a.call(this, i, ...s);
  }
  return r.handlers = t.handlers || {}, r.invalid = t.invalid, r.unknown = t.unknown, r;
}
const pt = [
  {
    id: "abap",
    name: "ABAP",
    import: () => import("./abap-BmBUA35e.js")
  },
  {
    id: "actionscript-3",
    name: "ActionScript",
    import: () => import("./actionscript-3-zFUbzQa9.js")
  },
  {
    id: "ada",
    name: "Ada",
    import: () => import("./ada-CBvPkFpZ.js")
  },
  {
    id: "angular-html",
    name: "Angular HTML",
    import: () => import("./angular-html-0fTdLuKf.js").then((n) => n.f)
  },
  {
    id: "angular-ts",
    name: "Angular TypeScript",
    import: () => import("./angular-ts-wkniW60G.js")
  },
  {
    id: "apache",
    name: "Apache Conf",
    import: () => import("./apache-CVNlsSDc.js")
  },
  {
    id: "apex",
    name: "Apex",
    import: () => import("./apex-DFk3KRB1.js")
  },
  {
    id: "apl",
    name: "APL",
    import: () => import("./apl-TLDHFJX6.js")
  },
  {
    id: "applescript",
    name: "AppleScript",
    import: () => import("./applescript-CYMR_y0g.js")
  },
  {
    id: "ara",
    name: "Ara",
    import: () => import("./ara-4QmU5e04.js")
  },
  {
    id: "asciidoc",
    name: "AsciiDoc",
    aliases: [
      "adoc"
    ],
    import: () => import("./asciidoc-v_1bjgUg.js")
  },
  {
    id: "asm",
    name: "Assembly",
    import: () => import("./asm-RC0Yh-NZ.js")
  },
  {
    id: "astro",
    name: "Astro",
    import: () => import("./astro-Uf8_VxKJ.js")
  },
  {
    id: "awk",
    name: "AWK",
    import: () => import("./awk-gPH8MVMW.js")
  },
  {
    id: "ballerina",
    name: "Ballerina",
    import: () => import("./ballerina-kvLnRU_e.js")
  },
  {
    id: "bat",
    name: "Batch File",
    aliases: [
      "batch"
    ],
    import: () => import("./bat-BHYy44sT.js")
  },
  {
    id: "beancount",
    name: "Beancount",
    import: () => import("./beancount-D-MADTs_.js")
  },
  {
    id: "berry",
    name: "Berry",
    aliases: [
      "be"
    ],
    import: () => import("./berry-Ci9U0o4h.js")
  },
  {
    id: "bibtex",
    name: "BibTeX",
    import: () => import("./bibtex-CX618D15.js")
  },
  {
    id: "bicep",
    name: "Bicep",
    import: () => import("./bicep-iuYiPopT.js")
  },
  {
    id: "blade",
    name: "Blade",
    import: () => import("./blade-BtR00Gx0.js")
  },
  {
    id: "bsl",
    name: "1C (Enterprise)",
    aliases: [
      "1c"
    ],
    import: () => import("./bsl-BIXPNqL4.js")
  },
  {
    id: "c",
    name: "C",
    import: () => import("./c-DASdrs7p.js")
  },
  {
    id: "cadence",
    name: "Cadence",
    aliases: [
      "cdc"
    ],
    import: () => import("./cadence-BDALQi26.js")
  },
  {
    id: "cairo",
    name: "Cairo",
    import: () => import("./cairo-tXZKA2PT.js")
  },
  {
    id: "clarity",
    name: "Clarity",
    import: () => import("./clarity-CNgV2Ths.js")
  },
  {
    id: "clojure",
    name: "Clojure",
    aliases: [
      "clj"
    ],
    import: () => import("./clojure-CsKKFGwv.js")
  },
  {
    id: "cmake",
    name: "CMake",
    import: () => import("./cmake-Dr-A3iJx.js")
  },
  {
    id: "cobol",
    name: "COBOL",
    import: () => import("./cobol-DMssKNmC.js")
  },
  {
    id: "codeowners",
    name: "CODEOWNERS",
    import: () => import("./codeowners-Bt9yU6NX.js")
  },
  {
    id: "codeql",
    name: "CodeQL",
    aliases: [
      "ql"
    ],
    import: () => import("./codeql-DBNTqJi1.js")
  },
  {
    id: "coffee",
    name: "CoffeeScript",
    aliases: [
      "coffeescript"
    ],
    import: () => import("./coffee-D_GzM8k1.js")
  },
  {
    id: "common-lisp",
    name: "Common Lisp",
    aliases: [
      "lisp"
    ],
    import: () => import("./common-lisp-r7ZEOG7T.js")
  },
  {
    id: "coq",
    name: "Coq",
    import: () => import("./coq-CB6Pv_W9.js")
  },
  {
    id: "cpp",
    name: "C++",
    aliases: [
      "c++"
    ],
    import: () => import("./cpp-CJF2i3ah.js")
  },
  {
    id: "crystal",
    name: "Crystal",
    import: () => import("./crystal-BKWnaU3g.js")
  },
  {
    id: "csharp",
    name: "C#",
    aliases: [
      "c#",
      "cs"
    ],
    import: () => import("./csharp-CYWRhZ2R.js")
  },
  {
    id: "css",
    name: "CSS",
    import: () => import("./css-D1aVdRIU.js")
  },
  {
    id: "csv",
    name: "CSV",
    import: () => import("./csv-DvCncUGQ.js")
  },
  {
    id: "cue",
    name: "CUE",
    import: () => import("./cue-BXMrmvay.js")
  },
  {
    id: "cypher",
    name: "Cypher",
    aliases: [
      "cql"
    ],
    import: () => import("./cypher-DTm5zNR1.js")
  },
  {
    id: "d",
    name: "D",
    import: () => import("./d-D6ZXmn3l.js")
  },
  {
    id: "dart",
    name: "Dart",
    import: () => import("./dart-Dz59Is3F.js")
  },
  {
    id: "dax",
    name: "DAX",
    import: () => import("./dax-DTVGzydb.js")
  },
  {
    id: "desktop",
    name: "Desktop",
    import: () => import("./desktop-Db9vb-dl.js")
  },
  {
    id: "diff",
    name: "Diff",
    import: () => import("./diff-XmNrvgM1.js")
  },
  {
    id: "docker",
    name: "Dockerfile",
    aliases: [
      "dockerfile"
    ],
    import: () => import("./docker-DWH2onkn.js")
  },
  {
    id: "dotenv",
    name: "dotEnv",
    import: () => import("./dotenv-4337wvzu.js")
  },
  {
    id: "dream-maker",
    name: "Dream Maker",
    import: () => import("./dream-maker-CvvfrJSx.js")
  },
  {
    id: "edge",
    name: "Edge",
    import: () => import("./edge-CgxR-qhM.js")
  },
  {
    id: "elixir",
    name: "Elixir",
    import: () => import("./elixir-DZkeSPwW.js")
  },
  {
    id: "elm",
    name: "Elm",
    import: () => import("./elm-BKuV1HE1.js")
  },
  {
    id: "emacs-lisp",
    name: "Emacs Lisp",
    aliases: [
      "elisp"
    ],
    import: () => import("./emacs-lisp-BAefI874.js")
  },
  {
    id: "erb",
    name: "ERB",
    import: () => import("./erb-BLwkpXUJ.js")
  },
  {
    id: "erlang",
    name: "Erlang",
    aliases: [
      "erl"
    ],
    import: () => import("./erlang-CmIiwF3I.js")
  },
  {
    id: "fennel",
    name: "Fennel",
    import: () => import("./fennel-DNqkz9pE.js")
  },
  {
    id: "fish",
    name: "Fish",
    import: () => import("./fish-DIm72t2T.js")
  },
  {
    id: "fluent",
    name: "Fluent",
    aliases: [
      "ftl"
    ],
    import: () => import("./fluent-BapTxJsC.js")
  },
  {
    id: "fortran-fixed-form",
    name: "Fortran (Fixed Form)",
    aliases: [
      "f",
      "for",
      "f77"
    ],
    import: () => import("./fortran-fixed-form-s9Hnb3av.js")
  },
  {
    id: "fortran-free-form",
    name: "Fortran (Free Form)",
    aliases: [
      "f90",
      "f95",
      "f03",
      "f08",
      "f18"
    ],
    import: () => import("./fortran-free-form-CNDsBFUj.js")
  },
  {
    id: "fsharp",
    name: "F#",
    aliases: [
      "f#",
      "fs"
    ],
    import: () => import("./fsharp-Cv0x43wb.js")
  },
  {
    id: "gdresource",
    name: "GDResource",
    import: () => import("./gdresource-CMcKXvgJ.js")
  },
  {
    id: "gdscript",
    name: "GDScript",
    import: () => import("./gdscript-D7aheHm-.js")
  },
  {
    id: "gdshader",
    name: "GDShader",
    import: () => import("./gdshader-BGJEsM2Z.js")
  },
  {
    id: "genie",
    name: "Genie",
    import: () => import("./genie-C9gPjc6J.js")
  },
  {
    id: "gherkin",
    name: "Gherkin",
    import: () => import("./gherkin-bka1Exbx.js")
  },
  {
    id: "git-commit",
    name: "Git Commit Message",
    import: () => import("./git-commit-BspYIY3P.js")
  },
  {
    id: "git-rebase",
    name: "Git Rebase Message",
    import: () => import("./git-rebase--zLBTjUa.js")
  },
  {
    id: "gleam",
    name: "Gleam",
    import: () => import("./gleam-B4k9YFGD.js")
  },
  {
    id: "glimmer-js",
    name: "Glimmer JS",
    aliases: [
      "gjs"
    ],
    import: () => import("./glimmer-js-DhY9umHJ.js")
  },
  {
    id: "glimmer-ts",
    name: "Glimmer TS",
    aliases: [
      "gts"
    ],
    import: () => import("./glimmer-ts-CCrHcYH5.js")
  },
  {
    id: "glsl",
    name: "GLSL",
    import: () => import("./glsl-XLGYNq5B.js")
  },
  {
    id: "gnuplot",
    name: "Gnuplot",
    import: () => import("./gnuplot-DnWoRZt-.js")
  },
  {
    id: "go",
    name: "Go",
    import: () => import("./go-BErP6iv1.js")
  },
  {
    id: "graphql",
    name: "GraphQL",
    aliases: [
      "gql"
    ],
    import: () => import("./graphql-DWpQF4JI.js")
  },
  {
    id: "groovy",
    name: "Groovy",
    import: () => import("./groovy-IWs5-NIO.js")
  },
  {
    id: "hack",
    name: "Hack",
    import: () => import("./hack-CQrV-ytR.js")
  },
  {
    id: "haml",
    name: "Ruby Haml",
    import: () => import("./haml-CMN0hQaL.js")
  },
  {
    id: "handlebars",
    name: "Handlebars",
    aliases: [
      "hbs"
    ],
    import: () => import("./handlebars-Cc-7fXX5.js")
  },
  {
    id: "haskell",
    name: "Haskell",
    aliases: [
      "hs"
    ],
    import: () => import("./haskell-CtlGos0K.js")
  },
  {
    id: "haxe",
    name: "Haxe",
    import: () => import("./haxe-CZZ33vZw.js")
  },
  {
    id: "hcl",
    name: "HashiCorp HCL",
    import: () => import("./hcl-6hOg9WP4.js")
  },
  {
    id: "hjson",
    name: "Hjson",
    import: () => import("./hjson-CgwED-oz.js")
  },
  {
    id: "hlsl",
    name: "HLSL",
    import: () => import("./hlsl-3-lv4gi7.js")
  },
  {
    id: "html",
    name: "HTML",
    import: () => import("./html-B0P_v3yU.js")
  },
  {
    id: "html-derivative",
    name: "HTML (Derivative)",
    import: () => import("./html-derivative-D59SHfh8.js")
  },
  {
    id: "http",
    name: "HTTP",
    import: () => import("./http-Dcjm_K1m.js")
  },
  {
    id: "hxml",
    name: "HXML",
    import: () => import("./hxml-BNKImryz.js")
  },
  {
    id: "hy",
    name: "Hy",
    import: () => import("./hy-C2xHhR6I.js")
  },
  {
    id: "imba",
    name: "Imba",
    import: () => import("./imba-Drd0AMDo.js")
  },
  {
    id: "ini",
    name: "INI",
    aliases: [
      "properties"
    ],
    import: () => import("./ini-BUcvsX-U.js")
  },
  {
    id: "java",
    name: "Java",
    import: () => import("./java-B7odJ7Ap.js")
  },
  {
    id: "javascript",
    name: "JavaScript",
    aliases: [
      "js"
    ],
    import: () => import("./javascript-fa8UlHZE.js")
  },
  {
    id: "jinja",
    name: "Jinja",
    import: () => import("./jinja-CCSYduCH.js")
  },
  {
    id: "jison",
    name: "Jison",
    import: () => import("./jison-BygvlveW.js")
  },
  {
    id: "json",
    name: "JSON",
    import: () => import("./json-71t8ZF9g.js")
  },
  {
    id: "json5",
    name: "JSON5",
    import: () => import("./json5-Z7F6rA6a.js")
  },
  {
    id: "jsonc",
    name: "JSON with Comments",
    import: () => import("./jsonc-Dphhs4m2.js")
  },
  {
    id: "jsonl",
    name: "JSON Lines",
    import: () => import("./jsonl-D9jj92Gg.js")
  },
  {
    id: "jsonnet",
    name: "Jsonnet",
    import: () => import("./jsonnet-DEQ7IUoJ.js")
  },
  {
    id: "jssm",
    name: "JSSM",
    aliases: [
      "fsl"
    ],
    import: () => import("./jssm-j74e88UX.js")
  },
  {
    id: "jsx",
    name: "JSX",
    import: () => import("./jsx-Bkesy5tT.js")
  },
  {
    id: "julia",
    name: "Julia",
    aliases: [
      "jl"
    ],
    import: () => import("./julia-CiahampL.js")
  },
  {
    id: "kotlin",
    name: "Kotlin",
    aliases: [
      "kt",
      "kts"
    ],
    import: () => import("./kotlin-DCgZY7Ii.js")
  },
  {
    id: "kusto",
    name: "Kusto",
    aliases: [
      "kql"
    ],
    import: () => import("./kusto-Cw029H-v.js")
  },
  {
    id: "latex",
    name: "LaTeX",
    import: () => import("./latex-LfGCYGw5.js")
  },
  {
    id: "lean",
    name: "Lean 4",
    aliases: [
      "lean4"
    ],
    import: () => import("./lean-CYSet4vs.js")
  },
  {
    id: "less",
    name: "Less",
    import: () => import("./less-DQA4v-Nm.js")
  },
  {
    id: "liquid",
    name: "Liquid",
    import: () => import("./liquid-CvufO3kO.js")
  },
  {
    id: "log",
    name: "Log file",
    import: () => import("./log-D2eRfqDn.js")
  },
  {
    id: "logo",
    name: "Logo",
    import: () => import("./logo-QEAtGWZ9.js")
  },
  {
    id: "lua",
    name: "Lua",
    import: () => import("./lua-BVfhNLDr.js")
  },
  {
    id: "luau",
    name: "Luau",
    import: () => import("./luau-BjYGiqID.js")
  },
  {
    id: "make",
    name: "Makefile",
    aliases: [
      "makefile"
    ],
    import: () => import("./make-BjuHP00g.js")
  },
  {
    id: "markdown",
    name: "Markdown",
    aliases: [
      "md"
    ],
    import: () => import("./markdown-B6guhLWd.js")
  },
  {
    id: "marko",
    name: "Marko",
    import: () => import("./marko-CHlMS8w5.js")
  },
  {
    id: "matlab",
    name: "MATLAB",
    import: () => import("./matlab-BpQlIJiw.js")
  },
  {
    id: "mdc",
    name: "MDC",
    import: () => import("./mdc-4K6B6lHG.js")
  },
  {
    id: "mdx",
    name: "MDX",
    import: () => import("./mdx-DIoECIFU.js")
  },
  {
    id: "mermaid",
    name: "Mermaid",
    aliases: [
      "mmd"
    ],
    import: () => import("./mermaid-BZ7WHNIe.js")
  },
  {
    id: "mipsasm",
    name: "MIPS Assembly",
    aliases: [
      "mips"
    ],
    import: () => import("./mipsasm-DusDYkFc.js")
  },
  {
    id: "mojo",
    name: "Mojo",
    import: () => import("./mojo-CY9jaezJ.js")
  },
  {
    id: "move",
    name: "Move",
    import: () => import("./move-ChphFumd.js")
  },
  {
    id: "narrat",
    name: "Narrat Language",
    aliases: [
      "nar"
    ],
    import: () => import("./narrat-Dz4d7OmN.js")
  },
  {
    id: "nextflow",
    name: "Nextflow",
    aliases: [
      "nf"
    ],
    import: () => import("./nextflow-DW0Yq9a2.js")
  },
  {
    id: "nginx",
    name: "Nginx",
    import: () => import("./nginx-Can2eAjw.js")
  },
  {
    id: "nim",
    name: "Nim",
    import: () => import("./nim-B3r2RtQZ.js")
  },
  {
    id: "nix",
    name: "Nix",
    import: () => import("./nix-Cg5uV_xg.js")
  },
  {
    id: "nushell",
    name: "nushell",
    aliases: [
      "nu"
    ],
    import: () => import("./nushell-BfRnzRWn.js")
  },
  {
    id: "objective-c",
    name: "Objective-C",
    aliases: [
      "objc"
    ],
    import: () => import("./objective-c-BGg9R27G.js")
  },
  {
    id: "objective-cpp",
    name: "Objective-C++",
    import: () => import("./objective-cpp-CJ3y3V_5.js")
  },
  {
    id: "ocaml",
    name: "OCaml",
    import: () => import("./ocaml-BZLsfx_o.js")
  },
  {
    id: "pascal",
    name: "Pascal",
    import: () => import("./pascal-l2bqd7Dz.js")
  },
  {
    id: "perl",
    name: "Perl",
    import: () => import("./perl-DaMQyPwp.js")
  },
  {
    id: "php",
    name: "PHP",
    import: () => import("./php-BL3EfPBi.js")
  },
  {
    id: "plsql",
    name: "PL/SQL",
    import: () => import("./plsql-oVq_K_wH.js")
  },
  {
    id: "po",
    name: "Gettext PO",
    aliases: [
      "pot",
      "potx"
    ],
    import: () => import("./po-5jaeIyVd.js")
  },
  {
    id: "polar",
    name: "Polar",
    import: () => import("./polar-wcLp8ci7.js")
  },
  {
    id: "postcss",
    name: "PostCSS",
    import: () => import("./postcss-BZ3MNRIJ.js")
  },
  {
    id: "powerquery",
    name: "PowerQuery",
    import: () => import("./powerquery-CgRa2XRw.js")
  },
  {
    id: "powershell",
    name: "PowerShell",
    aliases: [
      "ps",
      "ps1"
    ],
    import: () => import("./powershell-Diwyv8Eh.js")
  },
  {
    id: "prisma",
    name: "Prisma",
    import: () => import("./prisma-COL_v1x4.js")
  },
  {
    id: "prolog",
    name: "Prolog",
    import: () => import("./prolog-CuvJOxqT.js")
  },
  {
    id: "proto",
    name: "Protocol Buffer 3",
    aliases: [
      "protobuf"
    ],
    import: () => import("./proto-o9HLmF90.js")
  },
  {
    id: "pug",
    name: "Pug",
    aliases: [
      "jade"
    ],
    import: () => import("./pug-HKe4Luo3.js")
  },
  {
    id: "puppet",
    name: "Puppet",
    import: () => import("./puppet-wpGOnQp5.js")
  },
  {
    id: "purescript",
    name: "PureScript",
    import: () => import("./purescript-B_1NgE2N.js")
  },
  {
    id: "python",
    name: "Python",
    aliases: [
      "py"
    ],
    import: () => import("./python-xYxLFJY-.js")
  },
  {
    id: "qml",
    name: "QML",
    import: () => import("./qml-FlMIyjU9.js")
  },
  {
    id: "qmldir",
    name: "QML Directory",
    import: () => import("./qmldir-BInDYbpo.js")
  },
  {
    id: "qss",
    name: "Qt Style Sheets",
    import: () => import("./qss-D-h4NdUG.js")
  },
  {
    id: "r",
    name: "R",
    import: () => import("./r-F-9I-ITZ.js")
  },
  {
    id: "racket",
    name: "Racket",
    import: () => import("./racket-BoD1TBFT.js")
  },
  {
    id: "raku",
    name: "Raku",
    aliases: [
      "perl6"
    ],
    import: () => import("./raku-IaYcw19m.js")
  },
  {
    id: "razor",
    name: "ASP.NET Razor",
    import: () => import("./razor-CeqqNtyB.js")
  },
  {
    id: "reg",
    name: "Windows Registry Script",
    import: () => import("./reg-CMUdAgIP.js")
  },
  {
    id: "regexp",
    name: "RegExp",
    aliases: [
      "regex"
    ],
    import: () => import("./regexp-GiFkbxS-.js")
  },
  {
    id: "rel",
    name: "Rel",
    import: () => import("./rel-BaRn3QX7.js")
  },
  {
    id: "riscv",
    name: "RISC-V",
    import: () => import("./riscv-B9V3SsvW.js")
  },
  {
    id: "rst",
    name: "reStructuredText",
    import: () => import("./rst-C3D6-dqL.js")
  },
  {
    id: "ruby",
    name: "Ruby",
    aliases: [
      "rb"
    ],
    import: () => import("./ruby-DcPLUUK3.js")
  },
  {
    id: "rust",
    name: "Rust",
    aliases: [
      "rs"
    ],
    import: () => import("./rust-Pc7DCsZD.js")
  },
  {
    id: "sas",
    name: "SAS",
    import: () => import("./sas-tDSYjXcL.js")
  },
  {
    id: "sass",
    name: "Sass",
    import: () => import("./sass-iCyS6eP9.js")
  },
  {
    id: "scala",
    name: "Scala",
    import: () => import("./scala-Cly-fENF.js")
  },
  {
    id: "scheme",
    name: "Scheme",
    import: () => import("./scheme-Zi24oEYu.js")
  },
  {
    id: "scss",
    name: "SCSS",
    import: () => import("./scss-DhHc4lxB.js")
  },
  {
    id: "sdbl",
    name: "1C (Query)",
    aliases: [
      "1c-query"
    ],
    import: () => import("./sdbl-BBamrXFL.js")
  },
  {
    id: "shaderlab",
    name: "ShaderLab",
    aliases: [
      "shader"
    ],
    import: () => import("./shaderlab-CvqEIoL0.js")
  },
  {
    id: "shellscript",
    name: "Shell",
    aliases: [
      "bash",
      "sh",
      "shell",
      "zsh"
    ],
    import: () => import("./shellscript-Dn0-btNd.js")
  },
  {
    id: "shellsession",
    name: "Shell Session",
    aliases: [
      "console"
    ],
    import: () => import("./shellsession-8OLo3sB6.js")
  },
  {
    id: "smalltalk",
    name: "Smalltalk",
    import: () => import("./smalltalk-Cns31tKw.js")
  },
  {
    id: "solidity",
    name: "Solidity",
    import: () => import("./solidity-BG_k8fA_.js")
  },
  {
    id: "soy",
    name: "Closure Templates",
    aliases: [
      "closure-templates"
    ],
    import: () => import("./soy-EwHMOVPj.js")
  },
  {
    id: "sparql",
    name: "SPARQL",
    import: () => import("./sparql-DhuelBut.js")
  },
  {
    id: "splunk",
    name: "Splunk Query Language",
    aliases: [
      "spl"
    ],
    import: () => import("./splunk-CTqDjQdo.js")
  },
  {
    id: "sql",
    name: "SQL",
    import: () => import("./sql-DCkt643-.js")
  },
  {
    id: "ssh-config",
    name: "SSH Config",
    import: () => import("./ssh-config-DHHGll-v.js")
  },
  {
    id: "stata",
    name: "Stata",
    import: () => import("./stata-Dok6hMw0.js")
  },
  {
    id: "stylus",
    name: "Stylus",
    aliases: [
      "styl"
    ],
    import: () => import("./stylus-n_9f0QQ5.js")
  },
  {
    id: "svelte",
    name: "Svelte",
    import: () => import("./svelte-01qw6Rxm.js")
  },
  {
    id: "swift",
    name: "Swift",
    import: () => import("./swift-BAWqNR8A.js")
  },
  {
    id: "system-verilog",
    name: "SystemVerilog",
    import: () => import("./system-verilog-Cui-g-ut.js")
  },
  {
    id: "systemd",
    name: "Systemd Units",
    import: () => import("./systemd-CsKYQIQK.js")
  },
  {
    id: "talonscript",
    name: "TalonScript",
    aliases: [
      "talon"
    ],
    import: () => import("./talonscript-D2dGh8FO.js")
  },
  {
    id: "tasl",
    name: "Tasl",
    import: () => import("./tasl-D3W8HMV6.js")
  },
  {
    id: "tcl",
    name: "Tcl",
    import: () => import("./tcl-2y0Fuc4S.js")
  },
  {
    id: "templ",
    name: "Templ",
    import: () => import("./templ-Hmy8U0DD.js")
  },
  {
    id: "terraform",
    name: "Terraform",
    aliases: [
      "tf",
      "tfvars"
    ],
    import: () => import("./terraform-BGW6Oerf.js")
  },
  {
    id: "tex",
    name: "TeX",
    import: () => import("./tex-mHs7a43s.js")
  },
  {
    id: "toml",
    name: "TOML",
    import: () => import("./toml-CQSfOn0e.js")
  },
  {
    id: "ts-tags",
    name: "TypeScript with Tags",
    aliases: [
      "lit"
    ],
    import: () => import("./ts-tags-DYZ4SGcN.js")
  },
  {
    id: "tsv",
    name: "TSV",
    import: () => import("./tsv-BtvSkaG0.js")
  },
  {
    id: "tsx",
    name: "TSX",
    import: () => import("./tsx-DiGsgWT8.js")
  },
  {
    id: "turtle",
    name: "Turtle",
    import: () => import("./turtle-BJ2wmjPc.js")
  },
  {
    id: "twig",
    name: "Twig",
    import: () => import("./twig-BmytkGQV.js")
  },
  {
    id: "typescript",
    name: "TypeScript",
    aliases: [
      "ts"
    ],
    import: () => import("./typescript-buWNZFwO.js")
  },
  {
    id: "typespec",
    name: "TypeSpec",
    aliases: [
      "tsp"
    ],
    import: () => import("./typespec-bLbdsxJL.js")
  },
  {
    id: "typst",
    name: "Typst",
    aliases: [
      "typ"
    ],
    import: () => import("./typst-Y9_SmXTs.js")
  },
  {
    id: "v",
    name: "V",
    import: () => import("./v-wa8Orrdd.js")
  },
  {
    id: "vala",
    name: "Vala",
    import: () => import("./vala-DRdriFr_.js")
  },
  {
    id: "vb",
    name: "Visual Basic",
    aliases: [
      "cmd"
    ],
    import: () => import("./vb-E2_-jk4M.js")
  },
  {
    id: "verilog",
    name: "Verilog",
    import: () => import("./verilog-B1iBoR5_.js")
  },
  {
    id: "vhdl",
    name: "VHDL",
    import: () => import("./vhdl-CRVaAhXk.js")
  },
  {
    id: "viml",
    name: "Vim Script",
    aliases: [
      "vim",
      "vimscript"
    ],
    import: () => import("./viml-B-zWOd7Z.js")
  },
  {
    id: "vue",
    name: "Vue",
    import: () => import("./vue-Bl1uVNsA.js")
  },
  {
    id: "vue-html",
    name: "Vue HTML",
    import: () => import("./vue-html-DHr5wjBG.js")
  },
  {
    id: "vyper",
    name: "Vyper",
    aliases: [
      "vy"
    ],
    import: () => import("./vyper-DWutKXpa.js")
  },
  {
    id: "wasm",
    name: "WebAssembly",
    import: () => import("./wasm-Bv5f0gKv.js")
  },
  {
    id: "wenyan",
    name: "Wenyan",
    aliases: [
      "文言"
    ],
    import: () => import("./wenyan-BMYnfus1.js")
  },
  {
    id: "wgsl",
    name: "WGSL",
    import: () => import("./wgsl-DnPoPGDU.js")
  },
  {
    id: "wikitext",
    name: "Wikitext",
    aliases: [
      "mediawiki",
      "wiki"
    ],
    import: () => import("./wikitext-CntM04PE.js")
  },
  {
    id: "wolfram",
    name: "Wolfram",
    aliases: [
      "wl"
    ],
    import: () => import("./wolfram-Ws5qPlX9.js")
  },
  {
    id: "xml",
    name: "XML",
    import: () => import("./xml-ChBsf5uy.js")
  },
  {
    id: "xsl",
    name: "XSL",
    import: () => import("./xsl-BefjlXrd.js")
  },
  {
    id: "yaml",
    name: "YAML",
    aliases: [
      "yml"
    ],
    import: () => import("./yaml-Bbg74JKr.js")
  },
  {
    id: "zenscript",
    name: "ZenScript",
    import: () => import("./zenscript-C0RKE4nU.js")
  },
  {
    id: "zig",
    name: "Zig",
    import: () => import("./zig-D6SXBGNm.js")
  }
], Yt = Object.fromEntries(pt.map((n) => [n.id, n.import])), Zt = Object.fromEntries(pt.flatMap((n) => {
  var e;
  return ((e = n.aliases) == null ? void 0 : e.map((t) => [t, n.import])) || [];
})), er = {
  ...Yt,
  ...Zt
}, tr = [
  {
    id: "andromeeda",
    displayName: "Andromeeda",
    type: "dark",
    import: () => import("./andromeeda-uXNdzNpk.js")
  },
  {
    id: "aurora-x",
    displayName: "Aurora X",
    type: "dark",
    import: () => import("./aurora-x-BwoVEUWZ.js")
  },
  {
    id: "ayu-dark",
    displayName: "Ayu Dark",
    type: "dark",
    import: () => import("./ayu-dark-CxPZkpb2.js")
  },
  {
    id: "catppuccin-frappe",
    displayName: "Catppuccin Frappé",
    type: "dark",
    import: () => import("./catppuccin-frappe-BrTOiad2.js")
  },
  {
    id: "catppuccin-latte",
    displayName: "Catppuccin Latte",
    type: "light",
    import: () => import("./catppuccin-latte-D-dc_R4m.js")
  },
  {
    id: "catppuccin-macchiato",
    displayName: "Catppuccin Macchiato",
    type: "dark",
    import: () => import("./catppuccin-macchiato-DN4jOp0G.js")
  },
  {
    id: "catppuccin-mocha",
    displayName: "Catppuccin Mocha",
    type: "dark",
    import: () => import("./catppuccin-mocha-B8yCE3-3.js")
  },
  {
    id: "dark-plus",
    displayName: "Dark Plus",
    type: "dark",
    import: () => import("./dark-plus-pUHDTVV0.js")
  },
  {
    id: "dracula",
    displayName: "Dracula Theme",
    type: "dark",
    import: () => import("./dracula-BtZx2Kac.js")
  },
  {
    id: "dracula-soft",
    displayName: "Dracula Theme Soft",
    type: "dark",
    import: () => import("./dracula-soft-BKa-aqBv.js")
  },
  {
    id: "everforest-dark",
    displayName: "Everforest Dark",
    type: "dark",
    import: () => import("./everforest-dark-DMCBqXCK.js")
  },
  {
    id: "everforest-light",
    displayName: "Everforest Light",
    type: "light",
    import: () => import("./everforest-light-BbXl82Em.js")
  },
  {
    id: "github-dark",
    displayName: "GitHub Dark",
    type: "dark",
    import: () => import("./github-dark-DenFmJkN.js")
  },
  {
    id: "github-dark-default",
    displayName: "GitHub Dark Default",
    type: "dark",
    import: () => import("./github-dark-default-BJPUVz4H.js")
  },
  {
    id: "github-dark-dimmed",
    displayName: "GitHub Dark Dimmed",
    type: "dark",
    import: () => import("./github-dark-dimmed-DUshB20C.js")
  },
  {
    id: "github-dark-high-contrast",
    displayName: "GitHub Dark High Contrast",
    type: "dark",
    import: () => import("./github-dark-high-contrast-D3aGCnF8.js")
  },
  {
    id: "github-light",
    displayName: "GitHub Light",
    type: "light",
    import: () => import("./github-light-JYsPkUQd.js")
  },
  {
    id: "github-light-default",
    displayName: "GitHub Light Default",
    type: "light",
    import: () => import("./github-light-default-D99KPAby.js")
  },
  {
    id: "github-light-high-contrast",
    displayName: "GitHub Light High Contrast",
    type: "light",
    import: () => import("./github-light-high-contrast-BbmZE-Mp.js")
  },
  {
    id: "houston",
    displayName: "Houston",
    type: "dark",
    import: () => import("./houston-BDYrDoDW.js")
  },
  {
    id: "kanagawa-dragon",
    displayName: "Kanagawa Dragon",
    type: "dark",
    import: () => import("./kanagawa-dragon-CiKur4Hl.js")
  },
  {
    id: "kanagawa-lotus",
    displayName: "Kanagawa Lotus",
    type: "light",
    import: () => import("./kanagawa-lotus-BKu-smKu.js")
  },
  {
    id: "kanagawa-wave",
    displayName: "Kanagawa Wave",
    type: "dark",
    import: () => import("./kanagawa-wave-CQwozSzG.js")
  },
  {
    id: "laserwave",
    displayName: "LaserWave",
    type: "dark",
    import: () => import("./laserwave-6a00oqik.js")
  },
  {
    id: "light-plus",
    displayName: "Light Plus",
    type: "light",
    import: () => import("./light-plus-CZuVqSLX.js")
  },
  {
    id: "material-theme",
    displayName: "Material Theme",
    type: "dark",
    import: () => import("./material-theme-D6KBX41T.js")
  },
  {
    id: "material-theme-darker",
    displayName: "Material Theme Darker",
    type: "dark",
    import: () => import("./material-theme-darker-CkRroheE.js")
  },
  {
    id: "material-theme-lighter",
    displayName: "Material Theme Lighter",
    type: "light",
    import: () => import("./material-theme-lighter-BUBw43Yz.js")
  },
  {
    id: "material-theme-ocean",
    displayName: "Material Theme Ocean",
    type: "dark",
    import: () => import("./material-theme-ocean-ClGX14Ja.js")
  },
  {
    id: "material-theme-palenight",
    displayName: "Material Theme Palenight",
    type: "dark",
    import: () => import("./material-theme-palenight-C1RVm8K1.js")
  },
  {
    id: "min-dark",
    displayName: "Min Dark",
    type: "dark",
    import: () => import("./min-dark-C7ak0t6c.js")
  },
  {
    id: "min-light",
    displayName: "Min Light",
    type: "light",
    import: () => import("./min-light-CKFxVcPp.js")
  },
  {
    id: "monokai",
    displayName: "Monokai",
    type: "dark",
    import: () => import("./monokai-C1KBYcO0.js")
  },
  {
    id: "night-owl",
    displayName: "Night Owl",
    type: "dark",
    import: () => import("./night-owl-Bm2rzalh.js")
  },
  {
    id: "nord",
    displayName: "Nord",
    type: "dark",
    import: () => import("./nord-CC5OiUXg.js")
  },
  {
    id: "one-dark-pro",
    displayName: "One Dark Pro",
    type: "dark",
    import: () => import("./one-dark-pro-D7-kP8fv.js")
  },
  {
    id: "one-light",
    displayName: "One Light",
    type: "light",
    import: () => import("./one-light-D9sNaUtq.js")
  },
  {
    id: "plastic",
    displayName: "Plastic",
    type: "dark",
    import: () => import("./plastic-CSTz3KZp.js")
  },
  {
    id: "poimandres",
    displayName: "Poimandres",
    type: "dark",
    import: () => import("./poimandres-C-VADXHD.js")
  },
  {
    id: "red",
    displayName: "Red",
    type: "dark",
    import: () => import("./red-7y8PH7HH.js")
  },
  {
    id: "rose-pine",
    displayName: "Rosé Pine",
    type: "dark",
    import: () => import("./rose-pine-DhT-HZE9.js")
  },
  {
    id: "rose-pine-dawn",
    displayName: "Rosé Pine Dawn",
    type: "light",
    import: () => import("./rose-pine-dawn-DiCjL2i4.js")
  },
  {
    id: "rose-pine-moon",
    displayName: "Rosé Pine Moon",
    type: "dark",
    import: () => import("./rose-pine-moon-BNmGHlcn.js")
  },
  {
    id: "slack-dark",
    displayName: "Slack Dark",
    type: "dark",
    import: () => import("./slack-dark-i7wN4OET.js")
  },
  {
    id: "slack-ochin",
    displayName: "Slack Ochin",
    type: "light",
    import: () => import("./slack-ochin-ndHf0LoP.js")
  },
  {
    id: "snazzy-light",
    displayName: "Snazzy Light",
    type: "light",
    import: () => import("./snazzy-light-BlSJXAu4.js")
  },
  {
    id: "solarized-dark",
    displayName: "Solarized Dark",
    type: "dark",
    import: () => import("./solarized-dark-UTmkh7lw.js")
  },
  {
    id: "solarized-light",
    displayName: "Solarized Light",
    type: "light",
    import: () => import("./solarized-light-BheCkDPT.js")
  },
  {
    id: "synthwave-84",
    displayName: "Synthwave '84",
    type: "dark",
    import: () => import("./synthwave-84-NU3C_KFZ.js")
  },
  {
    id: "tokyo-night",
    displayName: "Tokyo Night",
    type: "dark",
    import: () => import("./tokyo-night-LhP3hHhi.js")
  },
  {
    id: "vesper",
    displayName: "Vesper",
    type: "dark",
    import: () => import("./vesper-CJsaOsSM.js")
  },
  {
    id: "vitesse-black",
    displayName: "Vitesse Black",
    type: "dark",
    import: () => import("./vitesse-black-BoGvW84i.js")
  },
  {
    id: "vitesse-dark",
    displayName: "Vitesse Dark",
    type: "dark",
    import: () => import("./vitesse-dark-Cym-eLtO.js")
  },
  {
    id: "vitesse-light",
    displayName: "Vitesse Light",
    type: "light",
    import: () => import("./vitesse-light-CcmG315c.js")
  }
], rr = Object.fromEntries(tr.map((n) => [n.id, n.import]));
let j = class extends Error {
  constructor(e) {
    super(e), this.name = "ShikiError";
  }
}, je = class extends Error {
  constructor(e) {
    super(e), this.name = "ShikiError";
  }
};
function nr() {
  return 2147483648;
}
function ir() {
  return typeof performance < "u" ? performance.now() : Date.now();
}
const sr = (n, e) => n + (e - n % e) % e;
async function ar(n) {
  let e, t;
  const r = {};
  function i(h) {
    t = h, r.HEAPU8 = new Uint8Array(h), r.HEAPU32 = new Uint32Array(h);
  }
  function s(h, f, S) {
    r.HEAPU8.copyWithin(h, f, f + S);
  }
  function a(h) {
    try {
      return e.grow(h - t.byteLength + 65535 >>> 16), i(e.buffer), 1;
    } catch {
    }
  }
  function c(h) {
    const f = r.HEAPU8.length;
    h = h >>> 0;
    const S = nr();
    if (h > S)
      return !1;
    for (let y = 1; y <= 4; y *= 2) {
      let g = f * (1 + 0.2 / y);
      g = Math.min(g, h + 100663296);
      const _ = Math.min(S, sr(Math.max(h, g), 65536));
      if (a(_))
        return !0;
    }
    return !1;
  }
  const o = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
  function l(h, f, S = 1024) {
    const y = f + S;
    let g = f;
    for (; h[g] && !(g >= y); )
      ++g;
    if (g - f > 16 && h.buffer && o)
      return o.decode(h.subarray(f, g));
    let _ = "";
    for (; f < g; ) {
      let b = h[f++];
      if (!(b & 128)) {
        _ += String.fromCharCode(b);
        continue;
      }
      const w = h[f++] & 63;
      if ((b & 224) === 192) {
        _ += String.fromCharCode((b & 31) << 6 | w);
        continue;
      }
      const C = h[f++] & 63;
      if ((b & 240) === 224 ? b = (b & 15) << 12 | w << 6 | C : b = (b & 7) << 18 | w << 12 | C << 6 | h[f++] & 63, b < 65536)
        _ += String.fromCharCode(b);
      else {
        const L = b - 65536;
        _ += String.fromCharCode(55296 | L >> 10, 56320 | L & 1023);
      }
    }
    return _;
  }
  function u(h, f) {
    return h ? l(r.HEAPU8, h, f) : "";
  }
  const m = {
    emscripten_get_now: ir,
    emscripten_memcpy_big: s,
    emscripten_resize_heap: c,
    fd_write: () => 0
  };
  async function p() {
    const f = await n({
      env: m,
      wasi_snapshot_preview1: m
    });
    e = f.memory, i(e.buffer), Object.assign(r, f), r.UTF8ToString = u;
  }
  return await p(), r;
}
var or = Object.defineProperty, cr = (n, e, t) => e in n ? or(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, N = (n, e, t) => (cr(n, typeof e != "symbol" ? e + "" : e, t), t);
let T = null;
function lr(n) {
  throw new je(n.UTF8ToString(n.getLastOnigError()));
}
class _e {
  constructor(e) {
    N(this, "utf16Length"), N(this, "utf8Length"), N(this, "utf16Value"), N(this, "utf8Value"), N(this, "utf16OffsetToUtf8"), N(this, "utf8OffsetToUtf16");
    const t = e.length, r = _e._utf8ByteLength(e), i = r !== t, s = i ? new Uint32Array(t + 1) : null;
    i && (s[t] = r);
    const a = i ? new Uint32Array(r + 1) : null;
    i && (a[r] = t);
    const c = new Uint8Array(r);
    let o = 0;
    for (let l = 0; l < t; l++) {
      const u = e.charCodeAt(l);
      let m = u, p = !1;
      if (u >= 55296 && u <= 56319 && l + 1 < t) {
        const h = e.charCodeAt(l + 1);
        h >= 56320 && h <= 57343 && (m = (u - 55296 << 10) + 65536 | h - 56320, p = !0);
      }
      i && (s[l] = o, p && (s[l + 1] = o), m <= 127 ? a[o + 0] = l : m <= 2047 ? (a[o + 0] = l, a[o + 1] = l) : m <= 65535 ? (a[o + 0] = l, a[o + 1] = l, a[o + 2] = l) : (a[o + 0] = l, a[o + 1] = l, a[o + 2] = l, a[o + 3] = l)), m <= 127 ? c[o++] = m : m <= 2047 ? (c[o++] = 192 | (m & 1984) >>> 6, c[o++] = 128 | (m & 63) >>> 0) : m <= 65535 ? (c[o++] = 224 | (m & 61440) >>> 12, c[o++] = 128 | (m & 4032) >>> 6, c[o++] = 128 | (m & 63) >>> 0) : (c[o++] = 240 | (m & 1835008) >>> 18, c[o++] = 128 | (m & 258048) >>> 12, c[o++] = 128 | (m & 4032) >>> 6, c[o++] = 128 | (m & 63) >>> 0), p && l++;
    }
    this.utf16Length = t, this.utf8Length = r, this.utf16Value = e, this.utf8Value = c, this.utf16OffsetToUtf8 = s, this.utf8OffsetToUtf16 = a;
  }
  static _utf8ByteLength(e) {
    let t = 0;
    for (let r = 0, i = e.length; r < i; r++) {
      const s = e.charCodeAt(r);
      let a = s, c = !1;
      if (s >= 55296 && s <= 56319 && r + 1 < i) {
        const o = e.charCodeAt(r + 1);
        o >= 56320 && o <= 57343 && (a = (s - 55296 << 10) + 65536 | o - 56320, c = !0);
      }
      a <= 127 ? t += 1 : a <= 2047 ? t += 2 : a <= 65535 ? t += 3 : t += 4, c && r++;
    }
    return t;
  }
  createString(e) {
    const t = e.omalloc(this.utf8Length);
    return e.HEAPU8.set(this.utf8Value, t), t;
  }
}
const I = class {
  constructor(n) {
    if (N(this, "id", ++I.LAST_ID), N(this, "_onigBinding"), N(this, "content"), N(this, "utf16Length"), N(this, "utf8Length"), N(this, "utf16OffsetToUtf8"), N(this, "utf8OffsetToUtf16"), N(this, "ptr"), !T)
      throw new je("Must invoke loadWasm first.");
    this._onigBinding = T, this.content = n;
    const e = new _e(n);
    this.utf16Length = e.utf16Length, this.utf8Length = e.utf8Length, this.utf16OffsetToUtf8 = e.utf16OffsetToUtf8, this.utf8OffsetToUtf16 = e.utf8OffsetToUtf16, this.utf8Length < 1e4 && !I._sharedPtrInUse ? (I._sharedPtr || (I._sharedPtr = T.omalloc(1e4)), I._sharedPtrInUse = !0, T.HEAPU8.set(e.utf8Value, I._sharedPtr), this.ptr = I._sharedPtr) : this.ptr = e.createString(T);
  }
  convertUtf8OffsetToUtf16(n) {
    return this.utf8OffsetToUtf16 ? n < 0 ? 0 : n > this.utf8Length ? this.utf16Length : this.utf8OffsetToUtf16[n] : n;
  }
  convertUtf16OffsetToUtf8(n) {
    return this.utf16OffsetToUtf8 ? n < 0 ? 0 : n > this.utf16Length ? this.utf8Length : this.utf16OffsetToUtf8[n] : n;
  }
  dispose() {
    this.ptr === I._sharedPtr ? I._sharedPtrInUse = !1 : this._onigBinding.ofree(this.ptr);
  }
};
let Z = I;
N(Z, "LAST_ID", 0);
N(Z, "_sharedPtr", 0);
N(Z, "_sharedPtrInUse", !1);
class ur {
  constructor(e) {
    if (N(this, "_onigBinding"), N(this, "_ptr"), !T)
      throw new je("Must invoke loadWasm first.");
    const t = [], r = [];
    for (let c = 0, o = e.length; c < o; c++) {
      const l = new _e(e[c]);
      t[c] = l.createString(T), r[c] = l.utf8Length;
    }
    const i = T.omalloc(4 * e.length);
    T.HEAPU32.set(t, i / 4);
    const s = T.omalloc(4 * e.length);
    T.HEAPU32.set(r, s / 4);
    const a = T.createOnigScanner(i, s, e.length);
    for (let c = 0, o = e.length; c < o; c++)
      T.ofree(t[c]);
    T.ofree(s), T.ofree(i), a === 0 && lr(T), this._onigBinding = T, this._ptr = a;
  }
  dispose() {
    this._onigBinding.freeOnigScanner(this._ptr);
  }
  findNextMatchSync(e, t, r) {
    let i = 0;
    if (typeof r == "number" && (i = r), typeof e == "string") {
      e = new Z(e);
      const s = this._findNextMatchSync(e, t, !1, i);
      return e.dispose(), s;
    }
    return this._findNextMatchSync(e, t, !1, i);
  }
  _findNextMatchSync(e, t, r, i) {
    const s = this._onigBinding, a = s.findNextOnigScannerMatch(this._ptr, e.id, e.ptr, e.utf8Length, e.convertUtf16OffsetToUtf8(t), i);
    if (a === 0)
      return null;
    const c = s.HEAPU32;
    let o = a / 4;
    const l = c[o++], u = c[o++], m = [];
    for (let p = 0; p < u; p++) {
      const h = e.convertUtf8OffsetToUtf16(c[o++]), f = e.convertUtf8OffsetToUtf16(c[o++]);
      m[p] = {
        start: h,
        end: f,
        length: f - h
      };
    }
    return {
      index: l,
      captureIndices: m
    };
  }
}
function mr(n) {
  return typeof n.instantiator == "function";
}
function hr(n) {
  return typeof n.default == "function";
}
function pr(n) {
  return typeof n.data < "u";
}
function dr(n) {
  return typeof Response < "u" && n instanceof Response;
}
function fr(n) {
  var e;
  return typeof ArrayBuffer < "u" && (n instanceof ArrayBuffer || ArrayBuffer.isView(n)) || typeof Buffer < "u" && ((e = Buffer.isBuffer) == null ? void 0 : e.call(Buffer, n)) || typeof SharedArrayBuffer < "u" && n instanceof SharedArrayBuffer || typeof Uint32Array < "u" && n instanceof Uint32Array;
}
let re;
function gr(n) {
  if (re)
    return re;
  async function e() {
    T = await ar(async (t) => {
      let r = n;
      return r = await r, typeof r == "function" && (r = await r(t)), typeof r == "function" && (r = await r(t)), mr(r) ? r = await r.instantiator(t) : hr(r) ? r = await r.default(t) : (pr(r) && (r = r.data), dr(r) ? typeof WebAssembly.instantiateStreaming == "function" ? r = await yr(r)(t) : r = await _r(r)(t) : fr(r) ? r = await ke(r)(t) : r instanceof WebAssembly.Module ? r = await ke(r)(t) : "default" in r && r.default instanceof WebAssembly.Module && (r = await ke(r.default)(t))), "instance" in r && (r = r.instance), "exports" in r && (r = r.exports), r;
    });
  }
  return re = e(), re;
}
function ke(n) {
  return (e) => WebAssembly.instantiate(n, e);
}
function yr(n) {
  return (e) => WebAssembly.instantiateStreaming(n, e);
}
function _r(n) {
  return async (e) => {
    const t = await n.arrayBuffer();
    return WebAssembly.instantiate(t, e);
  };
}
let br;
function Sr() {
  return br;
}
async function dt(n) {
  return n && await gr(n), {
    createScanner(e) {
      return new ur(e.map((t) => typeof t == "string" ? t : t.source));
    },
    createString(e) {
      return new Z(e);
    }
  };
}
function wr(n) {
  return $e(n);
}
function $e(n) {
  return Array.isArray(n) ? Cr(n) : n instanceof RegExp ? n : typeof n == "object" ? kr(n) : n;
}
function Cr(n) {
  let e = [];
  for (let t = 0, r = n.length; t < r; t++)
    e[t] = $e(n[t]);
  return e;
}
function kr(n) {
  let e = {};
  for (let t in n)
    e[t] = $e(n[t]);
  return e;
}
function ft(n, ...e) {
  return e.forEach((t) => {
    for (let r in t)
      n[r] = t[r];
  }), n;
}
function gt(n) {
  const e = ~n.lastIndexOf("/") || ~n.lastIndexOf("\\");
  return e === 0 ? n : ~e === n.length - 1 ? gt(n.substring(0, n.length - 1)) : n.substr(~e + 1);
}
var Ne = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g, ne = class {
  static hasCaptures(n) {
    return n === null ? !1 : (Ne.lastIndex = 0, Ne.test(n));
  }
  static replaceCaptures(n, e, t) {
    return n.replace(Ne, (r, i, s, a) => {
      let c = t[parseInt(i || s, 10)];
      if (c) {
        let o = e.substring(c.start, c.end);
        for (; o[0] === "."; )
          o = o.substring(1);
        switch (a) {
          case "downcase":
            return o.toLowerCase();
          case "upcase":
            return o.toUpperCase();
          default:
            return o;
        }
      } else
        return r;
    });
  }
};
function yt(n, e) {
  return n < e ? -1 : n > e ? 1 : 0;
}
function _t(n, e) {
  if (n === null && e === null)
    return 0;
  if (!n)
    return -1;
  if (!e)
    return 1;
  let t = n.length, r = e.length;
  if (t === r) {
    for (let i = 0; i < t; i++) {
      let s = yt(n[i], e[i]);
      if (s !== 0)
        return s;
    }
    return 0;
  }
  return t - r;
}
function Ke(n) {
  return !!(/^#[0-9a-f]{6}$/i.test(n) || /^#[0-9a-f]{8}$/i.test(n) || /^#[0-9a-f]{3}$/i.test(n) || /^#[0-9a-f]{4}$/i.test(n));
}
function bt(n) {
  return n.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
}
var St = class {
  constructor(n) {
    d(this, "cache", /* @__PURE__ */ new Map());
    this.fn = n;
  }
  get(n) {
    if (this.cache.has(n))
      return this.cache.get(n);
    const e = this.fn(n);
    return this.cache.set(n, e), e;
  }
}, ce = class {
  constructor(n, e, t) {
    d(this, "_cachedMatchRoot", new St(
      (n) => this._root.match(n)
    ));
    this._colorMap = n, this._defaults = e, this._root = t;
  }
  static createFromRawTheme(n, e) {
    return this.createFromParsedTheme(Tr(n), e);
  }
  static createFromParsedTheme(n, e) {
    return vr(n, e);
  }
  getColorMap() {
    return this._colorMap.getColorMap();
  }
  getDefaults() {
    return this._defaults;
  }
  match(n) {
    if (n === null)
      return this._defaults;
    const e = n.scopeName, r = this._cachedMatchRoot.get(e).find(
      (i) => Nr(n.parent, i.parentScopes)
    );
    return r ? new wt(
      r.fontStyle,
      r.foreground,
      r.background
    ) : null;
  }
}, Re = class ae {
  constructor(e, t) {
    this.parent = e, this.scopeName = t;
  }
  static push(e, t) {
    for (const r of t)
      e = new ae(e, r);
    return e;
  }
  static from(...e) {
    let t = null;
    for (let r = 0; r < e.length; r++)
      t = new ae(t, e[r]);
    return t;
  }
  push(e) {
    return new ae(this, e);
  }
  getSegments() {
    let e = this;
    const t = [];
    for (; e; )
      t.push(e.scopeName), e = e.parent;
    return t.reverse(), t;
  }
  toString() {
    return this.getSegments().join(" ");
  }
  extends(e) {
    return this === e ? !0 : this.parent === null ? !1 : this.parent.extends(e);
  }
  getExtensionIfDefined(e) {
    const t = [];
    let r = this;
    for (; r && r !== e; )
      t.push(r.scopeName), r = r.parent;
    return r === e ? t.reverse() : void 0;
  }
};
function Nr(n, e) {
  if (e.length === 0)
    return !0;
  for (let t = 0; t < e.length; t++) {
    let r = e[t], i = !1;
    if (r === ">") {
      if (t === e.length - 1)
        return !1;
      r = e[++t], i = !0;
    }
    for (; n && !Rr(n.scopeName, r); ) {
      if (i)
        return !1;
      n = n.parent;
    }
    if (!n)
      return !1;
    n = n.parent;
  }
  return !0;
}
function Rr(n, e) {
  return e === n || n.startsWith(e) && n[e.length] === ".";
}
var wt = class {
  constructor(n, e, t) {
    this.fontStyle = n, this.foregroundId = e, this.backgroundId = t;
  }
};
function Tr(n) {
  if (!n)
    return [];
  if (!n.settings || !Array.isArray(n.settings))
    return [];
  let e = n.settings, t = [], r = 0;
  for (let i = 0, s = e.length; i < s; i++) {
    let a = e[i];
    if (!a.settings)
      continue;
    let c;
    if (typeof a.scope == "string") {
      let m = a.scope;
      m = m.replace(/^[,]+/, ""), m = m.replace(/[,]+$/, ""), c = m.split(",");
    } else Array.isArray(a.scope) ? c = a.scope : c = [""];
    let o = -1;
    if (typeof a.settings.fontStyle == "string") {
      o = 0;
      let m = a.settings.fontStyle.split(" ");
      for (let p = 0, h = m.length; p < h; p++)
        switch (m[p]) {
          case "italic":
            o = o | 1;
            break;
          case "bold":
            o = o | 2;
            break;
          case "underline":
            o = o | 4;
            break;
          case "strikethrough":
            o = o | 8;
            break;
        }
    }
    let l = null;
    typeof a.settings.foreground == "string" && Ke(a.settings.foreground) && (l = a.settings.foreground);
    let u = null;
    typeof a.settings.background == "string" && Ke(a.settings.background) && (u = a.settings.background);
    for (let m = 0, p = c.length; m < p; m++) {
      let f = c[m].trim().split(" "), S = f[f.length - 1], y = null;
      f.length > 1 && (y = f.slice(0, f.length - 1), y.reverse()), t[r++] = new Ar(
        S,
        y,
        i,
        o,
        l,
        u
      );
    }
  }
  return t;
}
var Ar = class {
  constructor(n, e, t, r, i, s) {
    this.scope = n, this.parentScopes = e, this.index = t, this.fontStyle = r, this.foreground = i, this.background = s;
  }
}, B = /* @__PURE__ */ ((n) => (n[n.NotSet = -1] = "NotSet", n[n.None = 0] = "None", n[n.Italic = 1] = "Italic", n[n.Bold = 2] = "Bold", n[n.Underline = 4] = "Underline", n[n.Strikethrough = 8] = "Strikethrough", n))(B || {});
function vr(n, e) {
  n.sort((o, l) => {
    let u = yt(o.scope, l.scope);
    return u !== 0 || (u = _t(o.parentScopes, l.parentScopes), u !== 0) ? u : o.index - l.index;
  });
  let t = 0, r = "#000000", i = "#ffffff";
  for (; n.length >= 1 && n[0].scope === ""; ) {
    let o = n.shift();
    o.fontStyle !== -1 && (t = o.fontStyle), o.foreground !== null && (r = o.foreground), o.background !== null && (i = o.background);
  }
  let s = new Lr(e), a = new wt(t, s.getId(r), s.getId(i)), c = new Er(new Pe(0, null, -1, 0, 0), []);
  for (let o = 0, l = n.length; o < l; o++) {
    let u = n[o];
    c.insert(0, u.scope, u.parentScopes, u.fontStyle, s.getId(u.foreground), s.getId(u.background));
  }
  return new ce(s, a, c);
}
var Lr = class {
  constructor(n) {
    d(this, "_isFrozen");
    d(this, "_lastColorId");
    d(this, "_id2color");
    d(this, "_color2id");
    if (this._lastColorId = 0, this._id2color = [], this._color2id = /* @__PURE__ */ Object.create(null), Array.isArray(n)) {
      this._isFrozen = !0;
      for (let e = 0, t = n.length; e < t; e++)
        this._color2id[n[e]] = e, this._id2color[e] = n[e];
    } else
      this._isFrozen = !1;
  }
  getId(n) {
    if (n === null)
      return 0;
    n = n.toUpperCase();
    let e = this._color2id[n];
    if (e)
      return e;
    if (this._isFrozen)
      throw new Error(`Missing color in color map - ${n}`);
    return e = ++this._lastColorId, this._color2id[n] = e, this._id2color[e] = n, e;
  }
  getColorMap() {
    return this._id2color.slice(0);
  }
}, Pr = Object.freeze([]), Pe = class Ct {
  constructor(e, t, r, i, s) {
    d(this, "scopeDepth");
    d(this, "parentScopes");
    d(this, "fontStyle");
    d(this, "foreground");
    d(this, "background");
    this.scopeDepth = e, this.parentScopes = t || Pr, this.fontStyle = r, this.foreground = i, this.background = s;
  }
  clone() {
    return new Ct(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
  }
  static cloneArr(e) {
    let t = [];
    for (let r = 0, i = e.length; r < i; r++)
      t[r] = e[r].clone();
    return t;
  }
  acceptOverwrite(e, t, r, i) {
    this.scopeDepth > e ? console.log("how did this happen?") : this.scopeDepth = e, t !== -1 && (this.fontStyle = t), r !== 0 && (this.foreground = r), i !== 0 && (this.background = i);
  }
}, Er = class Ee {
  constructor(e, t = [], r = {}) {
    d(this, "_rulesWithParentScopes");
    this._mainRule = e, this._children = r, this._rulesWithParentScopes = t;
  }
  static _cmpBySpecificity(e, t) {
    if (e.scopeDepth !== t.scopeDepth)
      return t.scopeDepth - e.scopeDepth;
    let r = 0, i = 0;
    for (; e.parentScopes[r] === ">" && r++, t.parentScopes[i] === ">" && i++, !(r >= e.parentScopes.length || i >= t.parentScopes.length); ) {
      const s = t.parentScopes[i].length - e.parentScopes[r].length;
      if (s !== 0)
        return s;
      r++, i++;
    }
    return t.parentScopes.length - e.parentScopes.length;
  }
  match(e) {
    if (e !== "") {
      let r = e.indexOf("."), i, s;
      if (r === -1 ? (i = e, s = "") : (i = e.substring(0, r), s = e.substring(r + 1)), this._children.hasOwnProperty(i))
        return this._children[i].match(s);
    }
    const t = this._rulesWithParentScopes.concat(this._mainRule);
    return t.sort(Ee._cmpBySpecificity), t;
  }
  insert(e, t, r, i, s, a) {
    if (t === "") {
      this._doInsertHere(e, r, i, s, a);
      return;
    }
    let c = t.indexOf("."), o, l;
    c === -1 ? (o = t, l = "") : (o = t.substring(0, c), l = t.substring(c + 1));
    let u;
    this._children.hasOwnProperty(o) ? u = this._children[o] : (u = new Ee(this._mainRule.clone(), Pe.cloneArr(this._rulesWithParentScopes)), this._children[o] = u), u.insert(e + 1, l, r, i, s, a);
  }
  _doInsertHere(e, t, r, i, s) {
    if (t === null) {
      this._mainRule.acceptOverwrite(e, r, i, s);
      return;
    }
    for (let a = 0, c = this._rulesWithParentScopes.length; a < c; a++) {
      let o = this._rulesWithParentScopes[a];
      if (_t(o.parentScopes, t) === 0) {
        o.acceptOverwrite(e, r, i, s);
        return;
      }
    }
    r === -1 && (r = this._mainRule.fontStyle), i === 0 && (i = this._mainRule.foreground), s === 0 && (s = this._mainRule.background), this._rulesWithParentScopes.push(new Pe(e, t, r, i, s));
  }
}, U = class P {
  static toBinaryStr(e) {
    return e.toString(2).padStart(32, "0");
  }
  static print(e) {
    const t = P.getLanguageId(e), r = P.getTokenType(e), i = P.getFontStyle(e), s = P.getForeground(e), a = P.getBackground(e);
    console.log({
      languageId: t,
      tokenType: r,
      fontStyle: i,
      foreground: s,
      background: a
    });
  }
  static getLanguageId(e) {
    return (e & 255) >>> 0;
  }
  static getTokenType(e) {
    return (e & 768) >>> 8;
  }
  static containsBalancedBrackets(e) {
    return (e & 1024) !== 0;
  }
  static getFontStyle(e) {
    return (e & 30720) >>> 11;
  }
  static getForeground(e) {
    return (e & 16744448) >>> 15;
  }
  static getBackground(e) {
    return (e & 4278190080) >>> 24;
  }
  /**
   * Updates the fields in `metadata`.
   * A value of `0`, `NotSet` or `null` indicates that the corresponding field should be left as is.
   */
  static set(e, t, r, i, s, a, c) {
    let o = P.getLanguageId(e), l = P.getTokenType(e), u = P.containsBalancedBrackets(e) ? 1 : 0, m = P.getFontStyle(e), p = P.getForeground(e), h = P.getBackground(e);
    return t !== 0 && (o = t), r !== 8 && (l = r), i !== null && (u = i ? 1 : 0), s !== -1 && (m = s), a !== 0 && (p = a), c !== 0 && (h = c), (o << 0 | l << 8 | u << 10 | m << 11 | p << 15 | h << 24) >>> 0;
  }
};
function le(n, e) {
  const t = [], r = Ir(n);
  let i = r.next();
  for (; i !== null; ) {
    let o = 0;
    if (i.length === 2 && i.charAt(1) === ":") {
      switch (i.charAt(0)) {
        case "R":
          o = 1;
          break;
        case "L":
          o = -1;
          break;
        default:
          console.log(`Unknown priority ${i} in scope selector`);
      }
      i = r.next();
    }
    let l = a();
    if (t.push({ matcher: l, priority: o }), i !== ",")
      break;
    i = r.next();
  }
  return t;
  function s() {
    if (i === "-") {
      i = r.next();
      const o = s();
      return (l) => !!o && !o(l);
    }
    if (i === "(") {
      i = r.next();
      const o = c();
      return i === ")" && (i = r.next()), o;
    }
    if (Qe(i)) {
      const o = [];
      do
        o.push(i), i = r.next();
      while (Qe(i));
      return (l) => e(o, l);
    }
    return null;
  }
  function a() {
    const o = [];
    let l = s();
    for (; l; )
      o.push(l), l = s();
    return (u) => o.every((m) => m(u));
  }
  function c() {
    const o = [];
    let l = a();
    for (; l && (o.push(l), i === "|" || i === ","); ) {
      do
        i = r.next();
      while (i === "|" || i === ",");
      l = a();
    }
    return (u) => o.some((m) => m(u));
  }
}
function Qe(n) {
  return !!n && !!n.match(/[\w\.:]+/);
}
function Ir(n) {
  let e = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g, t = e.exec(n);
  return {
    next: () => {
      if (!t)
        return null;
      const r = t[0];
      return t = e.exec(n), r;
    }
  };
}
function kt(n) {
  typeof n.dispose == "function" && n.dispose();
}
var K = class {
  constructor(n) {
    this.scopeName = n;
  }
  toKey() {
    return this.scopeName;
  }
}, xr = class {
  constructor(n, e) {
    this.scopeName = n, this.ruleName = e;
  }
  toKey() {
    return `${this.scopeName}#${this.ruleName}`;
  }
}, Or = class {
  constructor() {
    d(this, "_references", []);
    d(this, "_seenReferenceKeys", /* @__PURE__ */ new Set());
    d(this, "visitedRule", /* @__PURE__ */ new Set());
  }
  get references() {
    return this._references;
  }
  add(n) {
    const e = n.toKey();
    this._seenReferenceKeys.has(e) || (this._seenReferenceKeys.add(e), this._references.push(n));
  }
}, Gr = class {
  constructor(n, e) {
    d(this, "seenFullScopeRequests", /* @__PURE__ */ new Set());
    d(this, "seenPartialScopeRequests", /* @__PURE__ */ new Set());
    d(this, "Q");
    this.repo = n, this.initialScopeName = e, this.seenFullScopeRequests.add(this.initialScopeName), this.Q = [new K(this.initialScopeName)];
  }
  processQueue() {
    const n = this.Q;
    this.Q = [];
    const e = new Or();
    for (const t of n)
      Mr(t, this.initialScopeName, this.repo, e);
    for (const t of e.references)
      if (t instanceof K) {
        if (this.seenFullScopeRequests.has(t.scopeName))
          continue;
        this.seenFullScopeRequests.add(t.scopeName), this.Q.push(t);
      } else {
        if (this.seenFullScopeRequests.has(t.scopeName) || this.seenPartialScopeRequests.has(t.toKey()))
          continue;
        this.seenPartialScopeRequests.add(t.toKey()), this.Q.push(t);
      }
  }
};
function Mr(n, e, t, r) {
  const i = t.lookup(n.scopeName);
  if (!i) {
    if (n.scopeName === e)
      throw new Error(`No grammar provided for <${e}>`);
    return;
  }
  const s = t.lookup(e);
  n instanceof K ? oe({ baseGrammar: s, selfGrammar: i }, r) : Ie(
    n.ruleName,
    { baseGrammar: s, selfGrammar: i, repository: i.repository },
    r
  );
  const a = t.injections(n.scopeName);
  if (a)
    for (const c of a)
      r.add(new K(c));
}
function Ie(n, e, t) {
  if (e.repository && e.repository[n]) {
    const r = e.repository[n];
    ue([r], e, t);
  }
}
function oe(n, e) {
  n.selfGrammar.patterns && Array.isArray(n.selfGrammar.patterns) && ue(
    n.selfGrammar.patterns,
    { ...n, repository: n.selfGrammar.repository },
    e
  ), n.selfGrammar.injections && ue(
    Object.values(n.selfGrammar.injections),
    { ...n, repository: n.selfGrammar.repository },
    e
  );
}
function ue(n, e, t) {
  for (const r of n) {
    if (t.visitedRule.has(r))
      continue;
    t.visitedRule.add(r);
    const i = r.repository ? ft({}, e.repository, r.repository) : e.repository;
    Array.isArray(r.patterns) && ue(r.patterns, { ...e, repository: i }, t);
    const s = r.include;
    if (!s)
      continue;
    const a = Nt(s);
    switch (a.kind) {
      case 0:
        oe({ ...e, selfGrammar: e.baseGrammar }, t);
        break;
      case 1:
        oe(e, t);
        break;
      case 2:
        Ie(a.ruleName, { ...e, repository: i }, t);
        break;
      case 3:
      case 4:
        const c = a.scopeName === e.selfGrammar.scopeName ? e.selfGrammar : a.scopeName === e.baseGrammar.scopeName ? e.baseGrammar : void 0;
        if (c) {
          const o = { baseGrammar: e.baseGrammar, selfGrammar: c, repository: i };
          a.kind === 4 ? Ie(a.ruleName, o, t) : oe(o, t);
        } else
          a.kind === 4 ? t.add(new xr(a.scopeName, a.ruleName)) : t.add(new K(a.scopeName));
        break;
    }
  }
}
var Br = class {
  constructor() {
    d(this, "kind", 0);
  }
}, jr = class {
  constructor() {
    d(this, "kind", 1);
  }
}, $r = class {
  constructor(n) {
    d(this, "kind", 2);
    this.ruleName = n;
  }
}, Dr = class {
  constructor(n) {
    d(this, "kind", 3);
    this.scopeName = n;
  }
}, Fr = class {
  constructor(n, e) {
    d(this, "kind", 4);
    this.scopeName = n, this.ruleName = e;
  }
};
function Nt(n) {
  if (n === "$base")
    return new Br();
  if (n === "$self")
    return new jr();
  const e = n.indexOf("#");
  if (e === -1)
    return new Dr(n);
  if (e === 0)
    return new $r(n.substring(1));
  {
    const t = n.substring(0, e), r = n.substring(e + 1);
    return new Fr(t, r);
  }
}
var Wr = /\\(\d+)/, Xe = /\\(\d+)/g, Ur = -1, Rt = -2;
var ee = class {
  constructor(n, e, t, r) {
    d(this, "$location");
    d(this, "id");
    d(this, "_nameIsCapturing");
    d(this, "_name");
    d(this, "_contentNameIsCapturing");
    d(this, "_contentName");
    this.$location = n, this.id = e, this._name = t || null, this._nameIsCapturing = ne.hasCaptures(this._name), this._contentName = r || null, this._contentNameIsCapturing = ne.hasCaptures(this._contentName);
  }
  get debugName() {
    const n = this.$location ? `${gt(this.$location.filename)}:${this.$location.line}` : "unknown";
    return `${this.constructor.name}#${this.id} @ ${n}`;
  }
  getName(n, e) {
    return !this._nameIsCapturing || this._name === null || n === null || e === null ? this._name : ne.replaceCaptures(this._name, n, e);
  }
  getContentName(n, e) {
    return !this._contentNameIsCapturing || this._contentName === null ? this._contentName : ne.replaceCaptures(this._contentName, n, e);
  }
}, Hr = class extends ee {
  constructor(e, t, r, i, s) {
    super(e, t, r, i);
    d(this, "retokenizeCapturedWithRuleId");
    this.retokenizeCapturedWithRuleId = s;
  }
  dispose() {
  }
  collectPatterns(e, t) {
    throw new Error("Not supported!");
  }
  compile(e, t) {
    throw new Error("Not supported!");
  }
  compileAG(e, t, r, i) {
    throw new Error("Not supported!");
  }
}, qr = class extends ee {
  constructor(e, t, r, i, s) {
    super(e, t, r, null);
    d(this, "_match");
    d(this, "captures");
    d(this, "_cachedCompiledPatterns");
    this._match = new Q(i, this.id), this.captures = s, this._cachedCompiledPatterns = null;
  }
  dispose() {
    this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
  }
  get debugMatchRegExp() {
    return `${this._match.source}`;
  }
  collectPatterns(e, t) {
    t.push(this._match);
  }
  compile(e, t) {
    return this._getCachedCompiledPatterns(e).compile(e);
  }
  compileAG(e, t, r, i) {
    return this._getCachedCompiledPatterns(e).compileAG(e, r, i);
  }
  _getCachedCompiledPatterns(e) {
    return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new X(), this.collectPatterns(e, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
  }
}, Ye = class extends ee {
  constructor(e, t, r, i, s) {
    super(e, t, r, i);
    d(this, "hasMissingPatterns");
    d(this, "patterns");
    d(this, "_cachedCompiledPatterns");
    this.patterns = s.patterns, this.hasMissingPatterns = s.hasMissingPatterns, this._cachedCompiledPatterns = null;
  }
  dispose() {
    this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
  }
  collectPatterns(e, t) {
    for (const r of this.patterns)
      e.getRule(r).collectPatterns(e, t);
  }
  compile(e, t) {
    return this._getCachedCompiledPatterns(e).compile(e);
  }
  compileAG(e, t, r, i) {
    return this._getCachedCompiledPatterns(e).compileAG(e, r, i);
  }
  _getCachedCompiledPatterns(e) {
    return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new X(), this.collectPatterns(e, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
  }
}, xe = class extends ee {
  constructor(e, t, r, i, s, a, c, o, l, u) {
    super(e, t, r, i);
    d(this, "_begin");
    d(this, "beginCaptures");
    d(this, "_end");
    d(this, "endHasBackReferences");
    d(this, "endCaptures");
    d(this, "applyEndPatternLast");
    d(this, "hasMissingPatterns");
    d(this, "patterns");
    d(this, "_cachedCompiledPatterns");
    this._begin = new Q(s, this.id), this.beginCaptures = a, this._end = new Q(c || "￿", -1), this.endHasBackReferences = this._end.hasBackReferences, this.endCaptures = o, this.applyEndPatternLast = l || !1, this.patterns = u.patterns, this.hasMissingPatterns = u.hasMissingPatterns, this._cachedCompiledPatterns = null;
  }
  dispose() {
    this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
  }
  get debugBeginRegExp() {
    return `${this._begin.source}`;
  }
  get debugEndRegExp() {
    return `${this._end.source}`;
  }
  getEndWithResolvedBackReferences(e, t) {
    return this._end.resolveBackReferences(e, t);
  }
  collectPatterns(e, t) {
    t.push(this._begin);
  }
  compile(e, t) {
    return this._getCachedCompiledPatterns(e, t).compile(e);
  }
  compileAG(e, t, r, i) {
    return this._getCachedCompiledPatterns(e, t).compileAG(e, r, i);
  }
  _getCachedCompiledPatterns(e, t) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new X();
      for (const r of this.patterns)
        e.getRule(r).collectPatterns(e, this._cachedCompiledPatterns);
      this.applyEndPatternLast ? this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end) : this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
    }
    return this._end.hasBackReferences && (this.applyEndPatternLast ? this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, t) : this._cachedCompiledPatterns.setSource(0, t)), this._cachedCompiledPatterns;
  }
}, me = class extends ee {
  constructor(e, t, r, i, s, a, c, o, l) {
    super(e, t, r, i);
    d(this, "_begin");
    d(this, "beginCaptures");
    d(this, "whileCaptures");
    d(this, "_while");
    d(this, "whileHasBackReferences");
    d(this, "hasMissingPatterns");
    d(this, "patterns");
    d(this, "_cachedCompiledPatterns");
    d(this, "_cachedCompiledWhilePatterns");
    this._begin = new Q(s, this.id), this.beginCaptures = a, this.whileCaptures = o, this._while = new Q(c, Rt), this.whileHasBackReferences = this._while.hasBackReferences, this.patterns = l.patterns, this.hasMissingPatterns = l.hasMissingPatterns, this._cachedCompiledPatterns = null, this._cachedCompiledWhilePatterns = null;
  }
  dispose() {
    this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null), this._cachedCompiledWhilePatterns && (this._cachedCompiledWhilePatterns.dispose(), this._cachedCompiledWhilePatterns = null);
  }
  get debugBeginRegExp() {
    return `${this._begin.source}`;
  }
  get debugWhileRegExp() {
    return `${this._while.source}`;
  }
  getWhileWithResolvedBackReferences(e, t) {
    return this._while.resolveBackReferences(e, t);
  }
  collectPatterns(e, t) {
    t.push(this._begin);
  }
  compile(e, t) {
    return this._getCachedCompiledPatterns(e).compile(e);
  }
  compileAG(e, t, r, i) {
    return this._getCachedCompiledPatterns(e).compileAG(e, r, i);
  }
  _getCachedCompiledPatterns(e) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new X();
      for (const t of this.patterns)
        e.getRule(t).collectPatterns(e, this._cachedCompiledPatterns);
    }
    return this._cachedCompiledPatterns;
  }
  compileWhile(e, t) {
    return this._getCachedCompiledWhilePatterns(e, t).compile(e);
  }
  compileWhileAG(e, t, r, i) {
    return this._getCachedCompiledWhilePatterns(e, t).compileAG(e, r, i);
  }
  _getCachedCompiledWhilePatterns(e, t) {
    return this._cachedCompiledWhilePatterns || (this._cachedCompiledWhilePatterns = new X(), this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while)), this._while.hasBackReferences && this._cachedCompiledWhilePatterns.setSource(0, t || "￿"), this._cachedCompiledWhilePatterns;
  }
}, Tt = class A {
  static createCaptureRule(e, t, r, i, s) {
    return e.registerRule((a) => new Hr(t, a, r, i, s));
  }
  static getCompiledRuleId(e, t, r) {
    return e.id || t.registerRule((i) => {
      if (e.id = i, e.match)
        return new qr(
          e.$vscodeTextmateLocation,
          e.id,
          e.name,
          e.match,
          A._compileCaptures(e.captures, t, r)
        );
      if (typeof e.begin > "u") {
        e.repository && (r = ft({}, r, e.repository));
        let s = e.patterns;
        return typeof s > "u" && e.include && (s = [{ include: e.include }]), new Ye(
          e.$vscodeTextmateLocation,
          e.id,
          e.name,
          e.contentName,
          A._compilePatterns(s, t, r)
        );
      }
      return e.while ? new me(
        e.$vscodeTextmateLocation,
        e.id,
        e.name,
        e.contentName,
        e.begin,
        A._compileCaptures(e.beginCaptures || e.captures, t, r),
        e.while,
        A._compileCaptures(e.whileCaptures || e.captures, t, r),
        A._compilePatterns(e.patterns, t, r)
      ) : new xe(
        e.$vscodeTextmateLocation,
        e.id,
        e.name,
        e.contentName,
        e.begin,
        A._compileCaptures(e.beginCaptures || e.captures, t, r),
        e.end,
        A._compileCaptures(e.endCaptures || e.captures, t, r),
        e.applyEndPatternLast,
        A._compilePatterns(e.patterns, t, r)
      );
    }), e.id;
  }
  static _compileCaptures(e, t, r) {
    let i = [];
    if (e) {
      let s = 0;
      for (const a in e) {
        if (a === "$vscodeTextmateLocation")
          continue;
        const c = parseInt(a, 10);
        c > s && (s = c);
      }
      for (let a = 0; a <= s; a++)
        i[a] = null;
      for (const a in e) {
        if (a === "$vscodeTextmateLocation")
          continue;
        const c = parseInt(a, 10);
        let o = 0;
        e[a].patterns && (o = A.getCompiledRuleId(e[a], t, r)), i[c] = A.createCaptureRule(t, e[a].$vscodeTextmateLocation, e[a].name, e[a].contentName, o);
      }
    }
    return i;
  }
  static _compilePatterns(e, t, r) {
    let i = [];
    if (e)
      for (let s = 0, a = e.length; s < a; s++) {
        const c = e[s];
        let o = -1;
        if (c.include) {
          const l = Nt(c.include);
          switch (l.kind) {
            case 0:
            case 1:
              o = A.getCompiledRuleId(r[c.include], t, r);
              break;
            case 2:
              let u = r[l.ruleName];
              u && (o = A.getCompiledRuleId(u, t, r));
              break;
            case 3:
            case 4:
              const m = l.scopeName, p = l.kind === 4 ? l.ruleName : null, h = t.getExternalGrammar(m, r);
              if (h)
                if (p) {
                  let f = h.repository[p];
                  f && (o = A.getCompiledRuleId(f, t, h.repository));
                } else
                  o = A.getCompiledRuleId(h.repository.$self, t, h.repository);
              break;
          }
        } else
          o = A.getCompiledRuleId(c, t, r);
        if (o !== -1) {
          const l = t.getRule(o);
          let u = !1;
          if ((l instanceof Ye || l instanceof xe || l instanceof me) && l.hasMissingPatterns && l.patterns.length === 0 && (u = !0), u)
            continue;
          i.push(o);
        }
      }
    return {
      patterns: i,
      hasMissingPatterns: (e ? e.length : 0) !== i.length
    };
  }
}, Q = class At {
  constructor(e, t) {
    d(this, "source");
    d(this, "ruleId");
    d(this, "hasAnchor");
    d(this, "hasBackReferences");
    d(this, "_anchorCache");
    if (e && typeof e == "string") {
      const r = e.length;
      let i = 0, s = [], a = !1;
      for (let c = 0; c < r; c++)
        if (e.charAt(c) === "\\" && c + 1 < r) {
          const l = e.charAt(c + 1);
          l === "z" ? (s.push(e.substring(i, c)), s.push("$(?!\\n)(?<!\\n)"), i = c + 2) : (l === "A" || l === "G") && (a = !0), c++;
        }
      this.hasAnchor = a, i === 0 ? this.source = e : (s.push(e.substring(i, r)), this.source = s.join(""));
    } else
      this.hasAnchor = !1, this.source = e;
    this.hasAnchor ? this._anchorCache = this._buildAnchorCache() : this._anchorCache = null, this.ruleId = t, typeof this.source == "string" ? this.hasBackReferences = Wr.test(this.source) : this.hasBackReferences = !1;
  }
  clone() {
    return new At(this.source, this.ruleId);
  }
  setSource(e) {
    this.source !== e && (this.source = e, this.hasAnchor && (this._anchorCache = this._buildAnchorCache()));
  }
  resolveBackReferences(e, t) {
    if (typeof this.source != "string")
      throw new Error("This method should only be called if the source is a string");
    let r = t.map((i) => e.substring(i.start, i.end));
    return Xe.lastIndex = 0, this.source.replace(Xe, (i, s) => bt(r[parseInt(s, 10)] || ""));
  }
  _buildAnchorCache() {
    if (typeof this.source != "string")
      throw new Error("This method should only be called if the source is a string");
    let e = [], t = [], r = [], i = [], s, a, c, o;
    for (s = 0, a = this.source.length; s < a; s++)
      c = this.source.charAt(s), e[s] = c, t[s] = c, r[s] = c, i[s] = c, c === "\\" && s + 1 < a && (o = this.source.charAt(s + 1), o === "A" ? (e[s + 1] = "￿", t[s + 1] = "￿", r[s + 1] = "A", i[s + 1] = "A") : o === "G" ? (e[s + 1] = "￿", t[s + 1] = "G", r[s + 1] = "￿", i[s + 1] = "G") : (e[s + 1] = o, t[s + 1] = o, r[s + 1] = o, i[s + 1] = o), s++);
    return {
      A0_G0: e.join(""),
      A0_G1: t.join(""),
      A1_G0: r.join(""),
      A1_G1: i.join("")
    };
  }
  resolveAnchors(e, t) {
    return !this.hasAnchor || !this._anchorCache || typeof this.source != "string" ? this.source : e ? t ? this._anchorCache.A1_G1 : this._anchorCache.A1_G0 : t ? this._anchorCache.A0_G1 : this._anchorCache.A0_G0;
  }
}, X = class {
  constructor() {
    d(this, "_items");
    d(this, "_hasAnchors");
    d(this, "_cached");
    d(this, "_anchorCache");
    this._items = [], this._hasAnchors = !1, this._cached = null, this._anchorCache = {
      A0_G0: null,
      A0_G1: null,
      A1_G0: null,
      A1_G1: null
    };
  }
  dispose() {
    this._disposeCaches();
  }
  _disposeCaches() {
    this._cached && (this._cached.dispose(), this._cached = null), this._anchorCache.A0_G0 && (this._anchorCache.A0_G0.dispose(), this._anchorCache.A0_G0 = null), this._anchorCache.A0_G1 && (this._anchorCache.A0_G1.dispose(), this._anchorCache.A0_G1 = null), this._anchorCache.A1_G0 && (this._anchorCache.A1_G0.dispose(), this._anchorCache.A1_G0 = null), this._anchorCache.A1_G1 && (this._anchorCache.A1_G1.dispose(), this._anchorCache.A1_G1 = null);
  }
  push(n) {
    this._items.push(n), this._hasAnchors = this._hasAnchors || n.hasAnchor;
  }
  unshift(n) {
    this._items.unshift(n), this._hasAnchors = this._hasAnchors || n.hasAnchor;
  }
  length() {
    return this._items.length;
  }
  setSource(n, e) {
    this._items[n].source !== e && (this._disposeCaches(), this._items[n].setSource(e));
  }
  compile(n) {
    if (!this._cached) {
      let e = this._items.map((t) => t.source);
      this._cached = new Ze(n, e, this._items.map((t) => t.ruleId));
    }
    return this._cached;
  }
  compileAG(n, e, t) {
    return this._hasAnchors ? e ? t ? (this._anchorCache.A1_G1 || (this._anchorCache.A1_G1 = this._resolveAnchors(n, e, t)), this._anchorCache.A1_G1) : (this._anchorCache.A1_G0 || (this._anchorCache.A1_G0 = this._resolveAnchors(n, e, t)), this._anchorCache.A1_G0) : t ? (this._anchorCache.A0_G1 || (this._anchorCache.A0_G1 = this._resolveAnchors(n, e, t)), this._anchorCache.A0_G1) : (this._anchorCache.A0_G0 || (this._anchorCache.A0_G0 = this._resolveAnchors(n, e, t)), this._anchorCache.A0_G0) : this.compile(n);
  }
  _resolveAnchors(n, e, t) {
    let r = this._items.map((i) => i.resolveAnchors(e, t));
    return new Ze(n, r, this._items.map((i) => i.ruleId));
  }
}, Ze = class {
  constructor(n, e, t) {
    d(this, "scanner");
    this.regExps = e, this.rules = t, this.scanner = n.createOnigScanner(e);
  }
  dispose() {
    typeof this.scanner.dispose == "function" && this.scanner.dispose();
  }
  toString() {
    const n = [];
    for (let e = 0, t = this.rules.length; e < t; e++)
      n.push("   - " + this.rules[e] + ": " + this.regExps[e]);
    return n.join(`
`);
  }
  findNextMatchSync(n, e, t) {
    const r = this.scanner.findNextMatchSync(n, e, t);
    return r ? {
      ruleId: this.rules[r.index],
      captureIndices: r.captureIndices
    } : null;
  }
}, Te = class {
  constructor(n, e) {
    this.languageId = n, this.tokenType = e;
  }
}, M, zr = (M = class {
  constructor(e, t) {
    d(this, "_defaultAttributes");
    d(this, "_embeddedLanguagesMatcher");
    d(this, "_getBasicScopeAttributes", new St((e) => {
      const t = this._scopeToLanguage(e), r = this._toStandardTokenType(e);
      return new Te(t, r);
    }));
    this._defaultAttributes = new Te(
      e,
      8
      /* NotSet */
    ), this._embeddedLanguagesMatcher = new Vr(Object.entries(t || {}));
  }
  getDefaultAttributes() {
    return this._defaultAttributes;
  }
  getBasicScopeAttributes(e) {
    return e === null ? M._NULL_SCOPE_METADATA : this._getBasicScopeAttributes.get(e);
  }
  /**
   * Given a produced TM scope, return the language that token describes or null if unknown.
   * e.g. source.html => html, source.css.embedded.html => css, punctuation.definition.tag.html => null
   */
  _scopeToLanguage(e) {
    return this._embeddedLanguagesMatcher.match(e) || 0;
  }
  _toStandardTokenType(e) {
    const t = e.match(M.STANDARD_TOKEN_TYPE_REGEXP);
    if (!t)
      return 8;
    switch (t[1]) {
      case "comment":
        return 1;
      case "string":
        return 2;
      case "regex":
        return 3;
      case "meta.embedded":
        return 0;
    }
    throw new Error("Unexpected match for standard token type!");
  }
}, d(M, "_NULL_SCOPE_METADATA", new Te(0, 0)), d(M, "STANDARD_TOKEN_TYPE_REGEXP", /\b(comment|string|regex|meta\.embedded)\b/), M), Vr = class {
  constructor(n) {
    d(this, "values");
    d(this, "scopesRegExp");
    if (n.length === 0)
      this.values = null, this.scopesRegExp = null;
    else {
      this.values = new Map(n);
      const e = n.map(
        ([t, r]) => bt(t)
      );
      e.sort(), e.reverse(), this.scopesRegExp = new RegExp(
        `^((${e.join(")|(")}))($|\\.)`,
        ""
      );
    }
  }
  match(n) {
    if (!this.scopesRegExp)
      return;
    const e = n.match(this.scopesRegExp);
    if (e)
      return this.values.get(e[1]);
  }
};
typeof process < "u" && process.env.VSCODE_TEXTMATE_DEBUG;
var et = class {
  constructor(n, e) {
    this.stack = n, this.stoppedEarly = e;
  }
};
function vt(n, e, t, r, i, s, a, c) {
  const o = e.content.length;
  let l = !1, u = -1;
  if (a) {
    const h = Jr(
      n,
      e,
      t,
      r,
      i,
      s
    );
    i = h.stack, r = h.linePos, t = h.isFirstLine, u = h.anchorPosition;
  }
  const m = Date.now();
  for (; !l; ) {
    if (c !== 0 && Date.now() - m > c)
      return new et(i, !0);
    p();
  }
  return new et(i, !1);
  function p() {
    const h = Kr(
      n,
      e,
      t,
      r,
      i,
      u
    );
    if (!h) {
      s.produce(i, o), l = !0;
      return;
    }
    const f = h.captureIndices, S = h.matchedRuleId, y = f && f.length > 0 ? f[0].end > r : !1;
    if (S === Ur) {
      const g = i.getRule(n);
      s.produce(i, f[0].start), i = i.withContentNameScopesList(i.nameScopesList), V(
        n,
        e,
        t,
        i,
        s,
        g.endCaptures,
        f
      ), s.produce(i, f[0].end);
      const _ = i;
      if (i = i.parent, u = _.getAnchorPos(), !y && _.getEnterPos() === r) {
        i = _, s.produce(i, o), l = !0;
        return;
      }
    } else {
      const g = n.getRule(S);
      s.produce(i, f[0].start);
      const _ = i, b = g.getName(e.content, f), w = i.contentNameScopesList.pushAttributed(
        b,
        n
      );
      if (i = i.push(
        S,
        r,
        u,
        f[0].end === o,
        null,
        w,
        w
      ), g instanceof xe) {
        const C = g;
        V(
          n,
          e,
          t,
          i,
          s,
          C.beginCaptures,
          f
        ), s.produce(i, f[0].end), u = f[0].end;
        const L = C.getContentName(
          e.content,
          f
        ), k = w.pushAttributed(
          L,
          n
        );
        if (i = i.withContentNameScopesList(k), C.endHasBackReferences && (i = i.withEndRule(
          C.getEndWithResolvedBackReferences(
            e.content,
            f
          )
        )), !y && _.hasSameRuleAs(i)) {
          i = i.pop(), s.produce(i, o), l = !0;
          return;
        }
      } else if (g instanceof me) {
        const C = g;
        V(
          n,
          e,
          t,
          i,
          s,
          C.beginCaptures,
          f
        ), s.produce(i, f[0].end), u = f[0].end;
        const L = C.getContentName(
          e.content,
          f
        ), k = w.pushAttributed(
          L,
          n
        );
        if (i = i.withContentNameScopesList(k), C.whileHasBackReferences && (i = i.withEndRule(
          C.getWhileWithResolvedBackReferences(
            e.content,
            f
          )
        )), !y && _.hasSameRuleAs(i)) {
          i = i.pop(), s.produce(i, o), l = !0;
          return;
        }
      } else if (V(
        n,
        e,
        t,
        i,
        s,
        g.captures,
        f
      ), s.produce(i, f[0].end), i = i.pop(), !y) {
        i = i.safePop(), s.produce(i, o), l = !0;
        return;
      }
    }
    f[0].end > r && (r = f[0].end, t = !1);
  }
}
function Jr(n, e, t, r, i, s) {
  let a = i.beginRuleCapturedEOL ? 0 : -1;
  const c = [];
  for (let o = i; o; o = o.pop()) {
    const l = o.getRule(n);
    l instanceof me && c.push({
      rule: l,
      stack: o
    });
  }
  for (let o = c.pop(); o; o = c.pop()) {
    const { ruleScanner: l, findOptions: u } = Yr(o.rule, n, o.stack.endRule, t, r === a), m = l.findNextMatchSync(e, r, u);
    if (m) {
      if (m.ruleId !== Rt) {
        i = o.stack.pop();
        break;
      }
      m.captureIndices && m.captureIndices.length && (s.produce(o.stack, m.captureIndices[0].start), V(n, e, t, o.stack, s, o.rule.whileCaptures, m.captureIndices), s.produce(o.stack, m.captureIndices[0].end), a = m.captureIndices[0].end, m.captureIndices[0].end > r && (r = m.captureIndices[0].end, t = !1));
    } else {
      i = o.stack.pop();
      break;
    }
  }
  return { stack: i, linePos: r, anchorPosition: a, isFirstLine: t };
}
function Kr(n, e, t, r, i, s) {
  const a = Qr(n, e, t, r, i, s), c = n.getInjections();
  if (c.length === 0)
    return a;
  const o = Xr(c, n, e, t, r, i, s);
  if (!o)
    return a;
  if (!a)
    return o;
  const l = a.captureIndices[0].start, u = o.captureIndices[0].start;
  return u < l || o.priorityMatch && u === l ? o : a;
}
function Qr(n, e, t, r, i, s) {
  const a = i.getRule(n), { ruleScanner: c, findOptions: o } = Lt(a, n, i.endRule, t, r === s), l = c.findNextMatchSync(e, r, o);
  return l ? {
    captureIndices: l.captureIndices,
    matchedRuleId: l.ruleId
  } : null;
}
function Xr(n, e, t, r, i, s, a) {
  let c = Number.MAX_VALUE, o = null, l, u = 0;
  const m = s.contentNameScopesList.getScopeNames();
  for (let p = 0, h = n.length; p < h; p++) {
    const f = n[p];
    if (!f.matcher(m))
      continue;
    const S = e.getRule(f.ruleId), { ruleScanner: y, findOptions: g } = Lt(S, e, null, r, i === a), _ = y.findNextMatchSync(t, i, g);
    if (!_)
      continue;
    const b = _.captureIndices[0].start;
    if (!(b >= c) && (c = b, o = _.captureIndices, l = _.ruleId, u = f.priority, c === i))
      break;
  }
  return o ? {
    priorityMatch: u === -1,
    captureIndices: o,
    matchedRuleId: l
  } : null;
}
function Lt(n, e, t, r, i) {
  return {
    ruleScanner: n.compileAG(e, t, r, i),
    findOptions: 0
    /* None */
  };
}
function Yr(n, e, t, r, i) {
  return {
    ruleScanner: n.compileWhileAG(e, t, r, i),
    findOptions: 0
    /* None */
  };
}
function V(n, e, t, r, i, s, a) {
  if (s.length === 0)
    return;
  const c = e.content, o = Math.min(s.length, a.length), l = [], u = a[0].end;
  for (let m = 0; m < o; m++) {
    const p = s[m];
    if (p === null)
      continue;
    const h = a[m];
    if (h.length === 0)
      continue;
    if (h.start > u)
      break;
    for (; l.length > 0 && l[l.length - 1].endPos <= h.start; )
      i.produceFromScopes(l[l.length - 1].scopes, l[l.length - 1].endPos), l.pop();
    if (l.length > 0 ? i.produceFromScopes(l[l.length - 1].scopes, h.start) : i.produce(r, h.start), p.retokenizeCapturedWithRuleId) {
      const S = p.getName(c, a), y = r.contentNameScopesList.pushAttributed(S, n), g = p.getContentName(c, a), _ = y.pushAttributed(g, n), b = r.push(p.retokenizeCapturedWithRuleId, h.start, -1, !1, null, y, _), w = n.createOnigString(c.substring(0, h.end));
      vt(
        n,
        w,
        t && h.start === 0,
        h.start,
        b,
        i,
        !1,
        /* no time limit */
        0
      ), kt(w);
      continue;
    }
    const f = p.getName(c, a);
    if (f !== null) {
      const y = (l.length > 0 ? l[l.length - 1].scopes : r.contentNameScopesList).pushAttributed(f, n);
      l.push(new Zr(y, h.end));
    }
  }
  for (; l.length > 0; )
    i.produceFromScopes(l[l.length - 1].scopes, l[l.length - 1].endPos), l.pop();
}
var Zr = class {
  constructor(n, e) {
    d(this, "scopes");
    d(this, "endPos");
    this.scopes = n, this.endPos = e;
  }
};
function en(n, e, t, r, i, s, a, c) {
  return new rn(
    n,
    e,
    t,
    r,
    i,
    s,
    a,
    c
  );
}
function tt(n, e, t, r, i) {
  const s = le(e, he), a = Tt.getCompiledRuleId(t, r, i.repository);
  for (const c of s)
    n.push({
      debugSelector: e,
      matcher: c.matcher,
      ruleId: a,
      grammar: i,
      priority: c.priority
    });
}
function he(n, e) {
  if (e.length < n.length)
    return !1;
  let t = 0;
  return n.every((r) => {
    for (let i = t; i < e.length; i++)
      if (tn(e[i], r))
        return t = i + 1, !0;
    return !1;
  });
}
function tn(n, e) {
  if (!n)
    return !1;
  if (n === e)
    return !0;
  const t = e.length;
  return n.length > t && n.substr(0, t) === e && n[t] === ".";
}
var rn = class {
  constructor(n, e, t, r, i, s, a, c) {
    d(this, "_rootId");
    d(this, "_lastRuleId");
    d(this, "_ruleId2desc");
    d(this, "_includedGrammars");
    d(this, "_grammarRepository");
    d(this, "_grammar");
    d(this, "_injections");
    d(this, "_basicScopeAttributesProvider");
    d(this, "_tokenTypeMatchers");
    if (this._rootScopeName = n, this.balancedBracketSelectors = s, this._onigLib = c, this._basicScopeAttributesProvider = new zr(
      t,
      r
    ), this._rootId = -1, this._lastRuleId = 0, this._ruleId2desc = [null], this._includedGrammars = {}, this._grammarRepository = a, this._grammar = rt(e, null), this._injections = null, this._tokenTypeMatchers = [], i)
      for (const o of Object.keys(i)) {
        const l = le(o, he);
        for (const u of l)
          this._tokenTypeMatchers.push({
            matcher: u.matcher,
            type: i[o]
          });
      }
  }
  get themeProvider() {
    return this._grammarRepository;
  }
  dispose() {
    for (const n of this._ruleId2desc)
      n && n.dispose();
  }
  createOnigScanner(n) {
    return this._onigLib.createOnigScanner(n);
  }
  createOnigString(n) {
    return this._onigLib.createOnigString(n);
  }
  getMetadataForScope(n) {
    return this._basicScopeAttributesProvider.getBasicScopeAttributes(n);
  }
  _collectInjections() {
    const n = {
      lookup: (i) => i === this._rootScopeName ? this._grammar : this.getExternalGrammar(i),
      injections: (i) => this._grammarRepository.injections(i)
    }, e = [], t = this._rootScopeName, r = n.lookup(t);
    if (r) {
      const i = r.injections;
      if (i)
        for (let a in i)
          tt(
            e,
            a,
            i[a],
            this,
            r
          );
      const s = this._grammarRepository.injections(t);
      s && s.forEach((a) => {
        const c = this.getExternalGrammar(a);
        if (c) {
          const o = c.injectionSelector;
          o && tt(
            e,
            o,
            c,
            this,
            c
          );
        }
      });
    }
    return e.sort((i, s) => i.priority - s.priority), e;
  }
  getInjections() {
    return this._injections === null && (this._injections = this._collectInjections()), this._injections;
  }
  registerRule(n) {
    const e = ++this._lastRuleId, t = n(e);
    return this._ruleId2desc[e] = t, t;
  }
  getRule(n) {
    return this._ruleId2desc[n];
  }
  getExternalGrammar(n, e) {
    if (this._includedGrammars[n])
      return this._includedGrammars[n];
    if (this._grammarRepository) {
      const t = this._grammarRepository.lookup(n);
      if (t)
        return this._includedGrammars[n] = rt(
          t,
          e && e.$base
        ), this._includedGrammars[n];
    }
  }
  tokenizeLine(n, e, t = 0) {
    const r = this._tokenize(n, e, !1, t);
    return {
      tokens: r.lineTokens.getResult(r.ruleStack, r.lineLength),
      ruleStack: r.ruleStack,
      stoppedEarly: r.stoppedEarly
    };
  }
  tokenizeLine2(n, e, t = 0) {
    const r = this._tokenize(n, e, !0, t);
    return {
      tokens: r.lineTokens.getBinaryResult(r.ruleStack, r.lineLength),
      ruleStack: r.ruleStack,
      stoppedEarly: r.stoppedEarly
    };
  }
  _tokenize(n, e, t, r) {
    this._rootId === -1 && (this._rootId = Tt.getCompiledRuleId(
      this._grammar.repository.$self,
      this,
      this._grammar.repository
    ), this.getInjections());
    let i;
    if (!e || e === Oe.NULL) {
      i = !0;
      const l = this._basicScopeAttributesProvider.getDefaultAttributes(), u = this.themeProvider.getDefaults(), m = U.set(
        0,
        l.languageId,
        l.tokenType,
        null,
        u.fontStyle,
        u.foregroundId,
        u.backgroundId
      ), p = this.getRule(this._rootId).getName(
        null,
        null
      );
      let h;
      p ? h = J.createRootAndLookUpScopeName(
        p,
        m,
        this
      ) : h = J.createRoot(
        "unknown",
        m
      ), e = new Oe(
        null,
        this._rootId,
        -1,
        -1,
        !1,
        null,
        h,
        h
      );
    } else
      i = !1, e.reset();
    n = n + `
`;
    const s = this.createOnigString(n), a = s.content.length, c = new sn(
      t,
      n,
      this._tokenTypeMatchers,
      this.balancedBracketSelectors
    ), o = vt(
      this,
      s,
      i,
      0,
      e,
      c,
      !0,
      r
    );
    return kt(s), {
      lineLength: a,
      lineTokens: c,
      ruleStack: o.stack,
      stoppedEarly: o.stoppedEarly
    };
  }
};
function rt(n, e) {
  return n = wr(n), n.repository = n.repository || {}, n.repository.$self = {
    $vscodeTextmateLocation: n.$vscodeTextmateLocation,
    patterns: n.patterns,
    name: n.scopeName
  }, n.repository.$base = e || n.repository.$self, n;
}
var J = class x {
  /**
   * Invariant:
   * ```
   * if (parent && !scopePath.extends(parent.scopePath)) {
   * 	throw new Error();
   * }
   * ```
   */
  constructor(e, t, r) {
    this.parent = e, this.scopePath = t, this.tokenAttributes = r;
  }
  static fromExtension(e, t) {
    let r = e, i = (e == null ? void 0 : e.scopePath) ?? null;
    for (const s of t)
      i = Re.push(i, s.scopeNames), r = new x(r, i, s.encodedTokenAttributes);
    return r;
  }
  static createRoot(e, t) {
    return new x(null, new Re(null, e), t);
  }
  static createRootAndLookUpScopeName(e, t, r) {
    const i = r.getMetadataForScope(e), s = new Re(null, e), a = r.themeProvider.themeMatch(s), c = x.mergeAttributes(
      t,
      i,
      a
    );
    return new x(null, s, c);
  }
  get scopeName() {
    return this.scopePath.scopeName;
  }
  toString() {
    return this.getScopeNames().join(" ");
  }
  equals(e) {
    return x.equals(this, e);
  }
  static equals(e, t) {
    do {
      if (e === t || !e && !t)
        return !0;
      if (!e || !t || e.scopeName !== t.scopeName || e.tokenAttributes !== t.tokenAttributes)
        return !1;
      e = e.parent, t = t.parent;
    } while (!0);
  }
  static mergeAttributes(e, t, r) {
    let i = -1, s = 0, a = 0;
    return r !== null && (i = r.fontStyle, s = r.foregroundId, a = r.backgroundId), U.set(
      e,
      t.languageId,
      t.tokenType,
      null,
      i,
      s,
      a
    );
  }
  pushAttributed(e, t) {
    if (e === null)
      return this;
    if (e.indexOf(" ") === -1)
      return x._pushAttributed(this, e, t);
    const r = e.split(/ /g);
    let i = this;
    for (const s of r)
      i = x._pushAttributed(i, s, t);
    return i;
  }
  static _pushAttributed(e, t, r) {
    const i = r.getMetadataForScope(t), s = e.scopePath.push(t), a = r.themeProvider.themeMatch(s), c = x.mergeAttributes(
      e.tokenAttributes,
      i,
      a
    );
    return new x(e, s, c);
  }
  getScopeNames() {
    return this.scopePath.getSegments();
  }
  getExtensionIfDefined(e) {
    var i;
    const t = [];
    let r = this;
    for (; r && r !== e; )
      t.push({
        encodedTokenAttributes: r.tokenAttributes,
        scopeNames: r.scopePath.getExtensionIfDefined(((i = r.parent) == null ? void 0 : i.scopePath) ?? null)
      }), r = r.parent;
    return r === e ? t.reverse() : void 0;
  }
}, E, Oe = (E = class {
  /**
   * Invariant:
   * ```
   * if (contentNameScopesList !== nameScopesList && contentNameScopesList?.parent !== nameScopesList) {
   * 	throw new Error();
   * }
   * if (this.parent && !nameScopesList.extends(this.parent.contentNameScopesList)) {
   * 	throw new Error();
   * }
   * ```
   */
  constructor(e, t, r, i, s, a, c, o) {
    d(this, "_stackElementBrand");
    /**
     * The position on the current line where this state was pushed.
     * This is relevant only while tokenizing a line, to detect endless loops.
     * Its value is meaningless across lines.
     */
    d(this, "_enterPos");
    /**
     * The captured anchor position when this stack element was pushed.
     * This is relevant only while tokenizing a line, to restore the anchor position when popping.
     * Its value is meaningless across lines.
     */
    d(this, "_anchorPos");
    /**
     * The depth of the stack.
     */
    d(this, "depth");
    this.parent = e, this.ruleId = t, this.beginRuleCapturedEOL = s, this.endRule = a, this.nameScopesList = c, this.contentNameScopesList = o, this.depth = this.parent ? this.parent.depth + 1 : 1, this._enterPos = r, this._anchorPos = i;
  }
  equals(e) {
    return e === null ? !1 : E._equals(this, e);
  }
  static _equals(e, t) {
    return e === t ? !0 : this._structuralEquals(e, t) ? J.equals(e.contentNameScopesList, t.contentNameScopesList) : !1;
  }
  /**
   * A structural equals check. Does not take into account `scopes`.
   */
  static _structuralEquals(e, t) {
    do {
      if (e === t || !e && !t)
        return !0;
      if (!e || !t || e.depth !== t.depth || e.ruleId !== t.ruleId || e.endRule !== t.endRule)
        return !1;
      e = e.parent, t = t.parent;
    } while (!0);
  }
  clone() {
    return this;
  }
  static _reset(e) {
    for (; e; )
      e._enterPos = -1, e._anchorPos = -1, e = e.parent;
  }
  reset() {
    E._reset(this);
  }
  pop() {
    return this.parent;
  }
  safePop() {
    return this.parent ? this.parent : this;
  }
  push(e, t, r, i, s, a, c) {
    return new E(
      this,
      e,
      t,
      r,
      i,
      s,
      a,
      c
    );
  }
  getEnterPos() {
    return this._enterPos;
  }
  getAnchorPos() {
    return this._anchorPos;
  }
  getRule(e) {
    return e.getRule(this.ruleId);
  }
  toString() {
    const e = [];
    return this._writeString(e, 0), "[" + e.join(",") + "]";
  }
  _writeString(e, t) {
    var r, i;
    return this.parent && (t = this.parent._writeString(e, t)), e[t++] = `(${this.ruleId}, ${(r = this.nameScopesList) == null ? void 0 : r.toString()}, ${(i = this.contentNameScopesList) == null ? void 0 : i.toString()})`, t;
  }
  withContentNameScopesList(e) {
    return this.contentNameScopesList === e ? this : this.parent.push(
      this.ruleId,
      this._enterPos,
      this._anchorPos,
      this.beginRuleCapturedEOL,
      this.endRule,
      this.nameScopesList,
      e
    );
  }
  withEndRule(e) {
    return this.endRule === e ? this : new E(
      this.parent,
      this.ruleId,
      this._enterPos,
      this._anchorPos,
      this.beginRuleCapturedEOL,
      e,
      this.nameScopesList,
      this.contentNameScopesList
    );
  }
  // Used to warn of endless loops
  hasSameRuleAs(e) {
    let t = this;
    for (; t && t._enterPos === e._enterPos; ) {
      if (t.ruleId === e.ruleId)
        return !0;
      t = t.parent;
    }
    return !1;
  }
  toStateStackFrame() {
    var e, t, r;
    return {
      ruleId: this.ruleId,
      beginRuleCapturedEOL: this.beginRuleCapturedEOL,
      endRule: this.endRule,
      nameScopesList: ((t = this.nameScopesList) == null ? void 0 : t.getExtensionIfDefined(((e = this.parent) == null ? void 0 : e.nameScopesList) ?? null)) ?? [],
      contentNameScopesList: ((r = this.contentNameScopesList) == null ? void 0 : r.getExtensionIfDefined(this.nameScopesList)) ?? []
    };
  }
  static pushFrame(e, t) {
    const r = J.fromExtension((e == null ? void 0 : e.nameScopesList) ?? null, t.nameScopesList);
    return new E(
      e,
      t.ruleId,
      t.enterPos ?? -1,
      t.anchorPos ?? -1,
      t.beginRuleCapturedEOL,
      t.endRule,
      r,
      J.fromExtension(r, t.contentNameScopesList)
    );
  }
}, // TODO remove me
d(E, "NULL", new E(
  null,
  0,
  0,
  0,
  !1,
  null,
  null,
  null
)), E), nn = class {
  constructor(n, e) {
    d(this, "balancedBracketScopes");
    d(this, "unbalancedBracketScopes");
    d(this, "allowAny", !1);
    this.balancedBracketScopes = n.flatMap(
      (t) => t === "*" ? (this.allowAny = !0, []) : le(t, he).map((r) => r.matcher)
    ), this.unbalancedBracketScopes = e.flatMap(
      (t) => le(t, he).map((r) => r.matcher)
    );
  }
  get matchesAlways() {
    return this.allowAny && this.unbalancedBracketScopes.length === 0;
  }
  get matchesNever() {
    return this.balancedBracketScopes.length === 0 && !this.allowAny;
  }
  match(n) {
    for (const e of this.unbalancedBracketScopes)
      if (e(n))
        return !1;
    for (const e of this.balancedBracketScopes)
      if (e(n))
        return !0;
    return this.allowAny;
  }
}, sn = class {
  constructor(n, e, t, r) {
    d(this, "_emitBinaryTokens");
    /**
     * defined only if `false`.
     */
    d(this, "_lineText");
    /**
     * used only if `_emitBinaryTokens` is false.
     */
    d(this, "_tokens");
    /**
     * used only if `_emitBinaryTokens` is true.
     */
    d(this, "_binaryTokens");
    d(this, "_lastTokenEndIndex");
    d(this, "_tokenTypeOverrides");
    this.balancedBracketSelectors = r, this._emitBinaryTokens = n, this._tokenTypeOverrides = t, this._lineText = null, this._tokens = [], this._binaryTokens = [], this._lastTokenEndIndex = 0;
  }
  produce(n, e) {
    this.produceFromScopes(n.contentNameScopesList, e);
  }
  produceFromScopes(n, e) {
    var r;
    if (this._lastTokenEndIndex >= e)
      return;
    if (this._emitBinaryTokens) {
      let i = (n == null ? void 0 : n.tokenAttributes) ?? 0, s = !1;
      if ((r = this.balancedBracketSelectors) != null && r.matchesAlways && (s = !0), this._tokenTypeOverrides.length > 0 || this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever) {
        const a = (n == null ? void 0 : n.getScopeNames()) ?? [];
        for (const c of this._tokenTypeOverrides)
          c.matcher(a) && (i = U.set(
            i,
            0,
            c.type,
            null,
            -1,
            0,
            0
          ));
        this.balancedBracketSelectors && (s = this.balancedBracketSelectors.match(a));
      }
      if (s && (i = U.set(
        i,
        0,
        8,
        s,
        -1,
        0,
        0
      )), this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === i) {
        this._lastTokenEndIndex = e;
        return;
      }
      this._binaryTokens.push(this._lastTokenEndIndex), this._binaryTokens.push(i), this._lastTokenEndIndex = e;
      return;
    }
    const t = (n == null ? void 0 : n.getScopeNames()) ?? [];
    this._tokens.push({
      startIndex: this._lastTokenEndIndex,
      endIndex: e,
      // value: lineText.substring(lastTokenEndIndex, endIndex),
      scopes: t
    }), this._lastTokenEndIndex = e;
  }
  getResult(n, e) {
    return this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === e - 1 && this._tokens.pop(), this._tokens.length === 0 && (this._lastTokenEndIndex = -1, this.produce(n, e), this._tokens[this._tokens.length - 1].startIndex = 0), this._tokens;
  }
  getBinaryResult(n, e) {
    this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === e - 1 && (this._binaryTokens.pop(), this._binaryTokens.pop()), this._binaryTokens.length === 0 && (this._lastTokenEndIndex = -1, this.produce(n, e), this._binaryTokens[this._binaryTokens.length - 2] = 0);
    const t = new Uint32Array(this._binaryTokens.length);
    for (let r = 0, i = this._binaryTokens.length; r < i; r++)
      t[r] = this._binaryTokens[r];
    return t;
  }
}, an = class {
  constructor(n, e) {
    d(this, "_grammars", /* @__PURE__ */ new Map());
    d(this, "_rawGrammars", /* @__PURE__ */ new Map());
    d(this, "_injectionGrammars", /* @__PURE__ */ new Map());
    d(this, "_theme");
    this._onigLib = e, this._theme = n;
  }
  dispose() {
    for (const n of this._grammars.values())
      n.dispose();
  }
  setTheme(n) {
    this._theme = n;
  }
  getColorMap() {
    return this._theme.getColorMap();
  }
  /**
   * Add `grammar` to registry and return a list of referenced scope names
   */
  addGrammar(n, e) {
    this._rawGrammars.set(n.scopeName, n), e && this._injectionGrammars.set(n.scopeName, e);
  }
  /**
   * Lookup a raw grammar.
   */
  lookup(n) {
    return this._rawGrammars.get(n);
  }
  /**
   * Returns the injections for the given grammar
   */
  injections(n) {
    return this._injectionGrammars.get(n);
  }
  /**
   * Get the default theme settings
   */
  getDefaults() {
    return this._theme.getDefaults();
  }
  /**
   * Match a scope in the theme.
   */
  themeMatch(n) {
    return this._theme.match(n);
  }
  /**
   * Lookup a grammar.
   */
  grammarForScopeName(n, e, t, r, i) {
    if (!this._grammars.has(n)) {
      let s = this._rawGrammars.get(n);
      if (!s)
        return null;
      this._grammars.set(n, en(
        n,
        s,
        e,
        t,
        r,
        i,
        this,
        this._onigLib
      ));
    }
    return this._grammars.get(n);
  }
}, on = class {
  constructor(e) {
    d(this, "_options");
    d(this, "_syncRegistry");
    d(this, "_ensureGrammarCache");
    this._options = e, this._syncRegistry = new an(
      ce.createFromRawTheme(e.theme, e.colorMap),
      e.onigLib
    ), this._ensureGrammarCache = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._syncRegistry.dispose();
  }
  /**
   * Change the theme. Once called, no previous `ruleStack` should be used anymore.
   */
  setTheme(e, t) {
    this._syncRegistry.setTheme(ce.createFromRawTheme(e, t));
  }
  /**
   * Returns a lookup array for color ids.
   */
  getColorMap() {
    return this._syncRegistry.getColorMap();
  }
  /**
   * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
   * Please do not use language id 0.
   */
  loadGrammarWithEmbeddedLanguages(e, t, r) {
    return this.loadGrammarWithConfiguration(e, t, { embeddedLanguages: r });
  }
  /**
   * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
   * Please do not use language id 0.
   */
  loadGrammarWithConfiguration(e, t, r) {
    return this._loadGrammar(
      e,
      t,
      r.embeddedLanguages,
      r.tokenTypes,
      new nn(
        r.balancedBracketSelectors || [],
        r.unbalancedBracketSelectors || []
      )
    );
  }
  /**
   * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
   */
  loadGrammar(e) {
    return this._loadGrammar(e, 0, null, null, null);
  }
  _loadGrammar(e, t, r, i, s) {
    const a = new Gr(this._syncRegistry, e);
    for (; a.Q.length > 0; )
      a.Q.map((c) => this._loadSingleGrammar(c.scopeName)), a.processQueue();
    return this._grammarForScopeName(
      e,
      t,
      r,
      i,
      s
    );
  }
  _loadSingleGrammar(e) {
    this._ensureGrammarCache.has(e) || (this._doLoadSingleGrammar(e), this._ensureGrammarCache.set(e, !0));
  }
  _doLoadSingleGrammar(e) {
    const t = this._options.loadGrammar(e);
    if (t) {
      const r = typeof this._options.getInjections == "function" ? this._options.getInjections(e) : void 0;
      this._syncRegistry.addGrammar(t, r);
    }
  }
  /**
   * Adds a rawGrammar.
   */
  addGrammar(e, t = [], r = 0, i = null) {
    return this._syncRegistry.addGrammar(e, t), this._grammarForScopeName(e.scopeName, r, i);
  }
  /**
   * Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `addGrammar`.
   */
  _grammarForScopeName(e, t = 0, r = null, i = null, s = null) {
    return this._syncRegistry.grammarForScopeName(
      e,
      t,
      r,
      i,
      s
    );
  }
}, Ge = Oe.NULL;
const cn = [
  "area",
  "base",
  "basefont",
  "bgsound",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "image",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
], ln = /["&'<>`]/g, un = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g, mn = (
  // eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
  /[\x01-\t\v\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g
), hn = /[|\\{}()[\]^$+*?.]/g, nt = /* @__PURE__ */ new WeakMap();
function pn(n, e) {
  if (n = n.replace(
    e.subset ? dn(e.subset) : ln,
    r
  ), e.subset || e.escapeOnly)
    return n;
  return n.replace(un, t).replace(mn, r);
  function t(i, s, a) {
    return e.format(
      (i.charCodeAt(0) - 55296) * 1024 + i.charCodeAt(1) - 56320 + 65536,
      a.charCodeAt(s + 2),
      e
    );
  }
  function r(i, s, a) {
    return e.format(
      i.charCodeAt(0),
      a.charCodeAt(s + 1),
      e
    );
  }
}
function dn(n) {
  let e = nt.get(n);
  return e || (e = fn(n), nt.set(n, e)), e;
}
function fn(n) {
  const e = [];
  let t = -1;
  for (; ++t < n.length; )
    e.push(n[t].replace(hn, "\\$&"));
  return new RegExp("(?:" + e.join("|") + ")", "g");
}
const gn = /[\dA-Fa-f]/;
function yn(n, e, t) {
  const r = "&#x" + n.toString(16).toUpperCase();
  return t && e && !gn.test(String.fromCharCode(e)) ? r : r + ";";
}
const _n = /\d/;
function bn(n, e, t) {
  const r = "&#" + String(n);
  return t && e && !_n.test(String.fromCharCode(e)) ? r : r + ";";
}
const Sn = [
  "AElig",
  "AMP",
  "Aacute",
  "Acirc",
  "Agrave",
  "Aring",
  "Atilde",
  "Auml",
  "COPY",
  "Ccedil",
  "ETH",
  "Eacute",
  "Ecirc",
  "Egrave",
  "Euml",
  "GT",
  "Iacute",
  "Icirc",
  "Igrave",
  "Iuml",
  "LT",
  "Ntilde",
  "Oacute",
  "Ocirc",
  "Ograve",
  "Oslash",
  "Otilde",
  "Ouml",
  "QUOT",
  "REG",
  "THORN",
  "Uacute",
  "Ucirc",
  "Ugrave",
  "Uuml",
  "Yacute",
  "aacute",
  "acirc",
  "acute",
  "aelig",
  "agrave",
  "amp",
  "aring",
  "atilde",
  "auml",
  "brvbar",
  "ccedil",
  "cedil",
  "cent",
  "copy",
  "curren",
  "deg",
  "divide",
  "eacute",
  "ecirc",
  "egrave",
  "eth",
  "euml",
  "frac12",
  "frac14",
  "frac34",
  "gt",
  "iacute",
  "icirc",
  "iexcl",
  "igrave",
  "iquest",
  "iuml",
  "laquo",
  "lt",
  "macr",
  "micro",
  "middot",
  "nbsp",
  "not",
  "ntilde",
  "oacute",
  "ocirc",
  "ograve",
  "ordf",
  "ordm",
  "oslash",
  "otilde",
  "ouml",
  "para",
  "plusmn",
  "pound",
  "quot",
  "raquo",
  "reg",
  "sect",
  "shy",
  "sup1",
  "sup2",
  "sup3",
  "szlig",
  "thorn",
  "times",
  "uacute",
  "ucirc",
  "ugrave",
  "uml",
  "uuml",
  "yacute",
  "yen",
  "yuml"
], Ae = {
  nbsp: " ",
  iexcl: "¡",
  cent: "¢",
  pound: "£",
  curren: "¤",
  yen: "¥",
  brvbar: "¦",
  sect: "§",
  uml: "¨",
  copy: "©",
  ordf: "ª",
  laquo: "«",
  not: "¬",
  shy: "­",
  reg: "®",
  macr: "¯",
  deg: "°",
  plusmn: "±",
  sup2: "²",
  sup3: "³",
  acute: "´",
  micro: "µ",
  para: "¶",
  middot: "·",
  cedil: "¸",
  sup1: "¹",
  ordm: "º",
  raquo: "»",
  frac14: "¼",
  frac12: "½",
  frac34: "¾",
  iquest: "¿",
  Agrave: "À",
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Auml: "Ä",
  Aring: "Å",
  AElig: "Æ",
  Ccedil: "Ç",
  Egrave: "È",
  Eacute: "É",
  Ecirc: "Ê",
  Euml: "Ë",
  Igrave: "Ì",
  Iacute: "Í",
  Icirc: "Î",
  Iuml: "Ï",
  ETH: "Ð",
  Ntilde: "Ñ",
  Ograve: "Ò",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Ouml: "Ö",
  times: "×",
  Oslash: "Ø",
  Ugrave: "Ù",
  Uacute: "Ú",
  Ucirc: "Û",
  Uuml: "Ü",
  Yacute: "Ý",
  THORN: "Þ",
  szlig: "ß",
  agrave: "à",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  aring: "å",
  aelig: "æ",
  ccedil: "ç",
  egrave: "è",
  eacute: "é",
  ecirc: "ê",
  euml: "ë",
  igrave: "ì",
  iacute: "í",
  icirc: "î",
  iuml: "ï",
  eth: "ð",
  ntilde: "ñ",
  ograve: "ò",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  divide: "÷",
  oslash: "ø",
  ugrave: "ù",
  uacute: "ú",
  ucirc: "û",
  uuml: "ü",
  yacute: "ý",
  thorn: "þ",
  yuml: "ÿ",
  fnof: "ƒ",
  Alpha: "Α",
  Beta: "Β",
  Gamma: "Γ",
  Delta: "Δ",
  Epsilon: "Ε",
  Zeta: "Ζ",
  Eta: "Η",
  Theta: "Θ",
  Iota: "Ι",
  Kappa: "Κ",
  Lambda: "Λ",
  Mu: "Μ",
  Nu: "Ν",
  Xi: "Ξ",
  Omicron: "Ο",
  Pi: "Π",
  Rho: "Ρ",
  Sigma: "Σ",
  Tau: "Τ",
  Upsilon: "Υ",
  Phi: "Φ",
  Chi: "Χ",
  Psi: "Ψ",
  Omega: "Ω",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  pi: "π",
  rho: "ρ",
  sigmaf: "ς",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  thetasym: "ϑ",
  upsih: "ϒ",
  piv: "ϖ",
  bull: "•",
  hellip: "…",
  prime: "′",
  Prime: "″",
  oline: "‾",
  frasl: "⁄",
  weierp: "℘",
  image: "ℑ",
  real: "ℜ",
  trade: "™",
  alefsym: "ℵ",
  larr: "←",
  uarr: "↑",
  rarr: "→",
  darr: "↓",
  harr: "↔",
  crarr: "↵",
  lArr: "⇐",
  uArr: "⇑",
  rArr: "⇒",
  dArr: "⇓",
  hArr: "⇔",
  forall: "∀",
  part: "∂",
  exist: "∃",
  empty: "∅",
  nabla: "∇",
  isin: "∈",
  notin: "∉",
  ni: "∋",
  prod: "∏",
  sum: "∑",
  minus: "−",
  lowast: "∗",
  radic: "√",
  prop: "∝",
  infin: "∞",
  ang: "∠",
  and: "∧",
  or: "∨",
  cap: "∩",
  cup: "∪",
  int: "∫",
  there4: "∴",
  sim: "∼",
  cong: "≅",
  asymp: "≈",
  ne: "≠",
  equiv: "≡",
  le: "≤",
  ge: "≥",
  sub: "⊂",
  sup: "⊃",
  nsub: "⊄",
  sube: "⊆",
  supe: "⊇",
  oplus: "⊕",
  otimes: "⊗",
  perp: "⊥",
  sdot: "⋅",
  lceil: "⌈",
  rceil: "⌉",
  lfloor: "⌊",
  rfloor: "⌋",
  lang: "〈",
  rang: "〉",
  loz: "◊",
  spades: "♠",
  clubs: "♣",
  hearts: "♥",
  diams: "♦",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
  OElig: "Œ",
  oelig: "œ",
  Scaron: "Š",
  scaron: "š",
  Yuml: "Ÿ",
  circ: "ˆ",
  tilde: "˜",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  zwnj: "‌",
  zwj: "‍",
  lrm: "‎",
  rlm: "‏",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  sbquo: "‚",
  ldquo: "“",
  rdquo: "”",
  bdquo: "„",
  dagger: "†",
  Dagger: "‡",
  permil: "‰",
  lsaquo: "‹",
  rsaquo: "›",
  euro: "€"
}, wn = [
  "cent",
  "copy",
  "divide",
  "gt",
  "lt",
  "not",
  "para",
  "times"
], Pt = {}.hasOwnProperty, Me = {};
let ie;
for (ie in Ae)
  Pt.call(Ae, ie) && (Me[Ae[ie]] = ie);
const Cn = /[^\dA-Za-z]/;
function kn(n, e, t, r) {
  const i = String.fromCharCode(n);
  if (Pt.call(Me, i)) {
    const s = Me[i], a = "&" + s;
    return t && Sn.includes(s) && !wn.includes(s) && (!r || e && e !== 61 && Cn.test(String.fromCharCode(e))) ? a : a + ";";
  }
  return "";
}
function Nn(n, e, t) {
  let r = yn(n, e, t.omitOptionalSemicolons), i;
  if ((t.useNamedReferences || t.useShortestReferences) && (i = kn(
    n,
    e,
    t.omitOptionalSemicolons,
    t.attribute
  )), (t.useShortestReferences || !i) && t.useShortestReferences) {
    const s = bn(n, e, t.omitOptionalSemicolons);
    s.length < r.length && (r = s);
  }
  return i && (!t.useShortestReferences || i.length < r.length) ? i : r;
}
function W(n, e) {
  return pn(n, Object.assign({ format: Nn }, e));
}
const Rn = /^>|^->|<!--|-->|--!>|<!-$/g, Tn = [">"], An = ["<", ">"];
function vn(n, e, t, r) {
  return r.settings.bogusComments ? "<?" + W(
    n.value,
    Object.assign({}, r.settings.characterReferences, {
      subset: Tn
    })
  ) + ">" : "<!--" + n.value.replace(Rn, i) + "-->";
  function i(s) {
    return W(
      s,
      Object.assign({}, r.settings.characterReferences, {
        subset: An
      })
    );
  }
}
function Ln(n, e, t, r) {
  return "<!" + (r.settings.upperDoctype ? "DOCTYPE" : "doctype") + (r.settings.tightDoctype ? "" : " ") + "html>";
}
const R = It(1), Et = It(-1), Pn = [];
function It(n) {
  return e;
  function e(t, r, i) {
    const s = t ? t.children : Pn;
    let a = (r || 0) + n, c = s[a];
    if (!i)
      for (; c && Be(c); )
        a += n, c = s[a];
    return c;
  }
}
const En = {}.hasOwnProperty;
function xt(n) {
  return e;
  function e(t, r, i) {
    return En.call(n, t.tagName) && n[t.tagName](t, r, i);
  }
}
const De = xt({
  body: xn,
  caption: ve,
  colgroup: ve,
  dd: Bn,
  dt: Mn,
  head: ve,
  html: In,
  li: Gn,
  optgroup: jn,
  option: $n,
  p: On,
  rp: it,
  rt: it,
  tbody: Fn,
  td: st,
  tfoot: Wn,
  th: st,
  thead: Dn,
  tr: Un
});
function ve(n, e, t) {
  const r = R(t, e, !0);
  return !r || r.type !== "comment" && !(r.type === "text" && Be(r.value.charAt(0)));
}
function In(n, e, t) {
  const r = R(t, e);
  return !r || r.type !== "comment";
}
function xn(n, e, t) {
  const r = R(t, e);
  return !r || r.type !== "comment";
}
function On(n, e, t) {
  const r = R(t, e);
  return r ? r.type === "element" && (r.tagName === "address" || r.tagName === "article" || r.tagName === "aside" || r.tagName === "blockquote" || r.tagName === "details" || r.tagName === "div" || r.tagName === "dl" || r.tagName === "fieldset" || r.tagName === "figcaption" || r.tagName === "figure" || r.tagName === "footer" || r.tagName === "form" || r.tagName === "h1" || r.tagName === "h2" || r.tagName === "h3" || r.tagName === "h4" || r.tagName === "h5" || r.tagName === "h6" || r.tagName === "header" || r.tagName === "hgroup" || r.tagName === "hr" || r.tagName === "main" || r.tagName === "menu" || r.tagName === "nav" || r.tagName === "ol" || r.tagName === "p" || r.tagName === "pre" || r.tagName === "section" || r.tagName === "table" || r.tagName === "ul") : !t || // Confusing parent.
  !(t.type === "element" && (t.tagName === "a" || t.tagName === "audio" || t.tagName === "del" || t.tagName === "ins" || t.tagName === "map" || t.tagName === "noscript" || t.tagName === "video"));
}
function Gn(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && r.tagName === "li";
}
function Mn(n, e, t) {
  const r = R(t, e);
  return !!(r && r.type === "element" && (r.tagName === "dt" || r.tagName === "dd"));
}
function Bn(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && (r.tagName === "dt" || r.tagName === "dd");
}
function it(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && (r.tagName === "rp" || r.tagName === "rt");
}
function jn(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && r.tagName === "optgroup";
}
function $n(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && (r.tagName === "option" || r.tagName === "optgroup");
}
function Dn(n, e, t) {
  const r = R(t, e);
  return !!(r && r.type === "element" && (r.tagName === "tbody" || r.tagName === "tfoot"));
}
function Fn(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && (r.tagName === "tbody" || r.tagName === "tfoot");
}
function Wn(n, e, t) {
  return !R(t, e);
}
function Un(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && r.tagName === "tr";
}
function st(n, e, t) {
  const r = R(t, e);
  return !r || r.type === "element" && (r.tagName === "td" || r.tagName === "th");
}
const Hn = xt({
  body: Vn,
  colgroup: Jn,
  head: zn,
  html: qn,
  tbody: Kn
});
function qn(n) {
  const e = R(n, -1);
  return !e || e.type !== "comment";
}
function zn(n) {
  const e = /* @__PURE__ */ new Set();
  for (const r of n.children)
    if (r.type === "element" && (r.tagName === "base" || r.tagName === "title")) {
      if (e.has(r.tagName)) return !1;
      e.add(r.tagName);
    }
  const t = n.children[0];
  return !t || t.type === "element";
}
function Vn(n) {
  const e = R(n, -1, !0);
  return !e || e.type !== "comment" && !(e.type === "text" && Be(e.value.charAt(0))) && !(e.type === "element" && (e.tagName === "meta" || e.tagName === "link" || e.tagName === "script" || e.tagName === "style" || e.tagName === "template"));
}
function Jn(n, e, t) {
  const r = Et(t, e), i = R(n, -1, !0);
  return t && r && r.type === "element" && r.tagName === "colgroup" && De(r, t.children.indexOf(r), t) ? !1 : !!(i && i.type === "element" && i.tagName === "col");
}
function Kn(n, e, t) {
  const r = Et(t, e), i = R(n, -1);
  return t && r && r.type === "element" && (r.tagName === "thead" || r.tagName === "tbody") && De(r, t.children.indexOf(r), t) ? !1 : !!(i && i.type === "element" && i.tagName === "tr");
}
const se = {
  // See: <https://html.spec.whatwg.org/#attribute-name-state>.
  name: [
    [`	
\f\r &/=>`.split(""), `	
\f\r "&'/=>\``.split("")],
    [`\0	
\f\r "&'/<=>`.split(""), `\0	
\f\r "&'/<=>\``.split("")]
  ],
  // See: <https://html.spec.whatwg.org/#attribute-value-(unquoted)-state>.
  unquoted: [
    [`	
\f\r &>`.split(""), `\0	
\f\r "&'<=>\``.split("")],
    [`\0	
\f\r "&'<=>\``.split(""), `\0	
\f\r "&'<=>\``.split("")]
  ],
  // See: <https://html.spec.whatwg.org/#attribute-value-(single-quoted)-state>.
  single: [
    ["&'".split(""), "\"&'`".split("")],
    ["\0&'".split(""), "\0\"&'`".split("")]
  ],
  // See: <https://html.spec.whatwg.org/#attribute-value-(double-quoted)-state>.
  double: [
    ['"&'.split(""), "\"&'`".split("")],
    ['\0"&'.split(""), "\0\"&'`".split("")]
  ]
};
function Qn(n, e, t, r) {
  const i = r.schema, s = i.space === "svg" ? !1 : r.settings.omitOptionalTags;
  let a = i.space === "svg" ? r.settings.closeEmptyElements : r.settings.voids.includes(n.tagName.toLowerCase());
  const c = [];
  let o;
  i.space === "html" && n.tagName === "svg" && (r.schema = ht);
  const l = Xn(r, n.properties), u = r.all(
    i.space === "html" && n.tagName === "template" ? n.content : n
  );
  return r.schema = i, u && (a = !1), (l || !s || !Hn(n, e, t)) && (c.push("<", n.tagName, l ? " " + l : ""), a && (i.space === "svg" || r.settings.closeSelfClosing) && (o = l.charAt(l.length - 1), (!r.settings.tightSelfClosing || o === "/" || o && o !== '"' && o !== "'") && c.push(" "), c.push("/")), c.push(">")), c.push(u), !a && (!s || !De(n, e, t)) && c.push("</" + n.tagName + ">"), c.join("");
}
function Xn(n, e) {
  const t = [];
  let r = -1, i;
  if (e) {
    for (i in e)
      if (e[i] !== null && e[i] !== void 0) {
        const s = Yn(n, i, e[i]);
        s && t.push(s);
      }
  }
  for (; ++r < t.length; ) {
    const s = n.settings.tightAttributes ? t[r].charAt(t[r].length - 1) : void 0;
    r !== t.length - 1 && s !== '"' && s !== "'" && (t[r] += " ");
  }
  return t.join("");
}
function Yn(n, e, t) {
  const r = Vt(n.schema, e), i = n.settings.allowParseErrors && n.schema.space === "html" ? 0 : 1, s = n.settings.allowDangerousCharacters ? 0 : 1;
  let a = n.quote, c;
  if (r.overloadedBoolean && (t === r.attribute || t === "") ? t = !0 : (r.boolean || r.overloadedBoolean) && (typeof t != "string" || t === r.attribute || t === "") && (t = !!t), t == null || t === !1 || typeof t == "number" && Number.isNaN(t))
    return "";
  const o = W(
    r.attribute,
    Object.assign({}, n.settings.characterReferences, {
      // Always encode without parse errors in non-HTML.
      subset: se.name[i][s]
    })
  );
  return t === !0 || (t = Array.isArray(t) ? (r.commaSeparated ? Jt : Kt)(t, {
    padLeft: !n.settings.tightCommaSeparatedLists
  }) : String(t), n.settings.collapseEmptyAttributes && !t) ? o : (n.settings.preferUnquoted && (c = W(
    t,
    Object.assign({}, n.settings.characterReferences, {
      attribute: !0,
      subset: se.unquoted[i][s]
    })
  )), c !== t && (n.settings.quoteSmart && Ve(t, a) > Ve(t, n.alternative) && (a = n.alternative), c = a + W(
    t,
    Object.assign({}, n.settings.characterReferences, {
      // Always encode without parse errors in non-HTML.
      subset: (a === "'" ? se.single : se.double)[i][s],
      attribute: !0
    })
  ) + a), o + (c && "=" + c));
}
const Zn = ["<", "&"];
function Ot(n, e, t, r) {
  return t && t.type === "element" && (t.tagName === "script" || t.tagName === "style") ? n.value : W(
    n.value,
    Object.assign({}, r.settings.characterReferences, {
      subset: Zn
    })
  );
}
function ei(n, e, t, r) {
  return r.settings.allowDangerousHtml ? n.value : Ot(n, e, t, r);
}
function ti(n, e, t, r) {
  return r.all(n);
}
const ri = Xt("type", {
  invalid: ni,
  unknown: ii,
  handlers: { comment: vn, doctype: Ln, element: Qn, raw: ei, root: ti, text: Ot }
});
function ni(n) {
  throw new Error("Expected node, not `" + n + "`");
}
function ii(n) {
  const e = (
    /** @type {Nodes} */
    n
  );
  throw new Error("Cannot compile unknown node `" + e.type + "`");
}
const si = {}, ai = {}, oi = [];
function ci(n, e) {
  const t = si, r = t.quote || '"', i = r === '"' ? "'" : '"';
  if (r !== '"' && r !== "'")
    throw new Error("Invalid quote `" + r + "`, expected `'` or `\"`");
  return {
    one: li,
    all: ui,
    settings: {
      omitOptionalTags: t.omitOptionalTags || !1,
      allowParseErrors: t.allowParseErrors || !1,
      allowDangerousCharacters: t.allowDangerousCharacters || !1,
      quoteSmart: t.quoteSmart || !1,
      preferUnquoted: t.preferUnquoted || !1,
      tightAttributes: t.tightAttributes || !1,
      upperDoctype: t.upperDoctype || !1,
      tightDoctype: t.tightDoctype || !1,
      bogusComments: t.bogusComments || !1,
      tightCommaSeparatedLists: t.tightCommaSeparatedLists || !1,
      tightSelfClosing: t.tightSelfClosing || !1,
      collapseEmptyAttributes: t.collapseEmptyAttributes || !1,
      allowDangerousHtml: t.allowDangerousHtml || !1,
      voids: t.voids || cn,
      characterReferences: t.characterReferences || ai,
      closeSelfClosing: t.closeSelfClosing || !1,
      closeEmptyElements: t.closeEmptyElements || !1
    },
    schema: t.space === "svg" ? ht : Qt,
    quote: r,
    alternative: i
  }.one(
    Array.isArray(n) ? { type: "root", children: n } : n,
    void 0,
    void 0
  );
}
function li(n, e, t) {
  return ri(n, e, t, this);
}
function ui(n) {
  const e = [], t = n && n.children || oi;
  let r = -1;
  for (; ++r < t.length; )
    e[r] = this.one(t[r], r, n);
  return e.join("");
}
function mi(n) {
  return Array.isArray(n) ? n : [n];
}
function be(n, e = !1) {
  var s;
  const t = n.split(/(\r?\n)/g);
  let r = 0;
  const i = [];
  for (let a = 0; a < t.length; a += 2) {
    const c = e ? t[a] + (t[a + 1] || "") : t[a];
    i.push([c, r]), r += t[a].length, r += ((s = t[a + 1]) == null ? void 0 : s.length) || 0;
  }
  return i;
}
function Fe(n) {
  return !n || ["plaintext", "txt", "text", "plain"].includes(n);
}
function Gt(n) {
  return n === "ansi" || Fe(n);
}
function We(n) {
  return n === "none";
}
function Mt(n) {
  return We(n);
}
function Bt(n, e) {
  var r;
  if (!e)
    return n;
  n.properties || (n.properties = {}), (r = n.properties).class || (r.class = []), typeof n.properties.class == "string" && (n.properties.class = n.properties.class.split(/\s+/g)), Array.isArray(n.properties.class) || (n.properties.class = []);
  const t = Array.isArray(e) ? e : e.split(/\s+/g);
  for (const i of t)
    i && !n.properties.class.includes(i) && n.properties.class.push(i);
  return n;
}
function hi(n, e) {
  let t = 0;
  const r = [];
  for (const i of e)
    i > t && r.push({
      ...n,
      content: n.content.slice(t, i),
      offset: n.offset + t
    }), t = i;
  return t < n.content.length && r.push({
    ...n,
    content: n.content.slice(t),
    offset: n.offset + t
  }), r;
}
function pi(n, e) {
  const t = Array.from(e instanceof Set ? e : new Set(e)).sort((r, i) => r - i);
  return t.length ? n.map((r) => r.flatMap((i) => {
    const s = t.filter((a) => i.offset < a && a < i.offset + i.content.length).map((a) => a - i.offset).sort((a, c) => a - c);
    return s.length ? hi(i, s) : i;
  })) : n;
}
async function jt(n) {
  return Promise.resolve(typeof n == "function" ? n() : n).then((e) => e.default || e);
}
function pe(n, e) {
  const t = typeof n == "string" ? {} : { ...n.colorReplacements }, r = typeof n == "string" ? n : n.name;
  for (const [i, s] of Object.entries((e == null ? void 0 : e.colorReplacements) || {}))
    typeof s == "string" ? t[i] = s : i === r && Object.assign(t, s);
  return t;
}
function $(n, e) {
  return n && ((e == null ? void 0 : e[n == null ? void 0 : n.toLowerCase()]) || n);
}
function $t(n) {
  const e = {};
  return n.color && (e.color = n.color), n.bgColor && (e["background-color"] = n.bgColor), n.fontStyle && (n.fontStyle & B.Italic && (e["font-style"] = "italic"), n.fontStyle & B.Bold && (e["font-weight"] = "bold"), n.fontStyle & B.Underline && (e["text-decoration"] = "underline")), e;
}
function di(n) {
  return typeof n == "string" ? n : Object.entries(n).map(([e, t]) => `${e}:${t}`).join(";");
}
function fi(n) {
  const e = be(n, !0).map(([i]) => i);
  function t(i) {
    if (i === n.length)
      return {
        line: e.length - 1,
        character: e[e.length - 1].length
      };
    let s = i, a = 0;
    for (const c of e) {
      if (s < c.length)
        break;
      s -= c.length, a++;
    }
    return { line: a, character: s };
  }
  function r(i, s) {
    let a = 0;
    for (let c = 0; c < i; c++)
      a += e[c].length;
    return a += s, a;
  }
  return {
    lines: e,
    indexToPos: t,
    posToIndex: r
  };
}
class v extends Error {
  constructor(e) {
    super(e), this.name = "ShikiError";
  }
}
const Dt = /* @__PURE__ */ new WeakMap();
function Se(n, e) {
  Dt.set(n, e);
}
function Y(n) {
  return Dt.get(n);
}
class H {
  constructor(...e) {
    /**
     * Theme to Stack mapping
     */
    d(this, "_stacks", {});
    d(this, "lang");
    if (e.length === 2) {
      const [t, r] = e;
      this.lang = r, this._stacks = t;
    } else {
      const [t, r, i] = e;
      this.lang = r, this._stacks = { [i]: t };
    }
  }
  get themes() {
    return Object.keys(this._stacks);
  }
  get theme() {
    return this.themes[0];
  }
  get _stack() {
    return this._stacks[this.theme];
  }
  /**
   * Static method to create a initial grammar state.
   */
  static initial(e, t) {
    return new H(
      Object.fromEntries(mi(t).map((r) => [r, Ge])),
      e
    );
  }
  /**
   * Get the internal stack object.
   * @internal
   */
  getInternalStack(e = this.theme) {
    return this._stacks[e];
  }
  /**
   * @deprecated use `getScopes` instead
   */
  get scopes() {
    return at(this._stacks[this.theme]);
  }
  getScopes(e = this.theme) {
    return at(this._stacks[e]);
  }
  toJSON() {
    return {
      lang: this.lang,
      theme: this.theme,
      themes: this.themes,
      scopes: this.scopes
    };
  }
}
function at(n) {
  const e = [], t = /* @__PURE__ */ new Set();
  function r(i) {
    var a;
    if (t.has(i))
      return;
    t.add(i);
    const s = (a = i == null ? void 0 : i.nameScopesList) == null ? void 0 : a.scopeName;
    s && e.push(s), i.parent && r(i.parent);
  }
  return r(n), e;
}
function gi(n, e) {
  if (!(n instanceof H))
    throw new v("Invalid grammar state");
  return n.getInternalStack(e);
}
function yi() {
  const n = /* @__PURE__ */ new WeakMap();
  function e(t) {
    if (!n.has(t.meta)) {
      let r = function(a) {
        if (typeof a == "number") {
          if (a < 0 || a > t.source.length)
            throw new v(`Invalid decoration offset: ${a}. Code length: ${t.source.length}`);
          return {
            ...i.indexToPos(a),
            offset: a
          };
        } else {
          const c = i.lines[a.line];
          if (c === void 0)
            throw new v(`Invalid decoration position ${JSON.stringify(a)}. Lines length: ${i.lines.length}`);
          if (a.character < 0 || a.character > c.length)
            throw new v(`Invalid decoration position ${JSON.stringify(a)}. Line ${a.line} length: ${c.length}`);
          return {
            ...a,
            offset: i.posToIndex(a.line, a.character)
          };
        }
      };
      const i = fi(t.source), s = (t.options.decorations || []).map((a) => ({
        ...a,
        start: r(a.start),
        end: r(a.end)
      }));
      _i(s), n.set(t.meta, {
        decorations: s,
        converter: i,
        source: t.source
      });
    }
    return n.get(t.meta);
  }
  return {
    name: "shiki:decorations",
    tokens(t) {
      var a;
      if (!((a = this.options.decorations) != null && a.length))
        return;
      const i = e(this).decorations.flatMap((c) => [c.start.offset, c.end.offset]);
      return pi(t, i);
    },
    code(t) {
      var u;
      if (!((u = this.options.decorations) != null && u.length))
        return;
      const r = e(this), i = Array.from(t.children).filter((m) => m.type === "element" && m.tagName === "span");
      if (i.length !== r.converter.lines.length)
        throw new v(`Number of lines in code element (${i.length}) does not match the number of lines in the source (${r.converter.lines.length}). Failed to apply decorations.`);
      function s(m, p, h, f) {
        const S = i[m];
        let y = "", g = -1, _ = -1;
        if (p === 0 && (g = 0), h === 0 && (_ = 0), h === Number.POSITIVE_INFINITY && (_ = S.children.length), g === -1 || _ === -1)
          for (let w = 0; w < S.children.length; w++)
            y += Ft(S.children[w]), g === -1 && y.length === p && (g = w + 1), _ === -1 && y.length === h && (_ = w + 1);
        if (g === -1)
          throw new v(`Failed to find start index for decoration ${JSON.stringify(f.start)}`);
        if (_ === -1)
          throw new v(`Failed to find end index for decoration ${JSON.stringify(f.end)}`);
        const b = S.children.slice(g, _);
        if (!f.alwaysWrap && b.length === S.children.length)
          c(S, f, "line");
        else if (!f.alwaysWrap && b.length === 1 && b[0].type === "element")
          c(b[0], f, "token");
        else {
          const w = {
            type: "element",
            tagName: "span",
            properties: {},
            children: b
          };
          c(w, f, "wrapper"), S.children.splice(g, b.length, w);
        }
      }
      function a(m, p) {
        i[m] = c(i[m], p, "line");
      }
      function c(m, p, h) {
        var y;
        const f = p.properties || {}, S = p.transform || ((g) => g);
        return m.tagName = p.tagName || "span", m.properties = {
          ...m.properties,
          ...f,
          class: m.properties.class
        }, (y = p.properties) != null && y.class && Bt(m, p.properties.class), m = S(m, h) || m, m;
      }
      const o = [], l = r.decorations.sort((m, p) => p.start.offset - m.start.offset);
      for (const m of l) {
        const { start: p, end: h } = m;
        if (p.line === h.line)
          s(p.line, p.character, h.character, m);
        else if (p.line < h.line) {
          s(p.line, p.character, Number.POSITIVE_INFINITY, m);
          for (let f = p.line + 1; f < h.line; f++)
            o.unshift(() => a(f, m));
          s(h.line, 0, h.character, m);
        }
      }
      o.forEach((m) => m());
    }
  };
}
function _i(n) {
  for (let e = 0; e < n.length; e++) {
    const t = n[e];
    if (t.start.offset > t.end.offset)
      throw new v(`Invalid decoration range: ${JSON.stringify(t.start)} - ${JSON.stringify(t.end)}`);
    for (let r = e + 1; r < n.length; r++) {
      const i = n[r], s = t.start.offset < i.start.offset && i.start.offset < t.end.offset, a = t.start.offset < i.end.offset && i.end.offset < t.end.offset, c = i.start.offset < t.start.offset && t.start.offset < i.end.offset, o = i.start.offset < t.end.offset && t.end.offset < i.end.offset;
      if (s || a || c || o) {
        if (a && a || c && o)
          continue;
        throw new v(`Decorations ${JSON.stringify(t.start)} and ${JSON.stringify(i.start)} intersect.`);
      }
    }
  }
}
function Ft(n) {
  return n.type === "text" ? n.value : n.type === "element" ? n.children.map(Ft).join("") : "";
}
const bi = [
  /* @__PURE__ */ yi()
];
function de(n) {
  return [
    ...n.transformers || [],
    ...bi
  ];
}
var D = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite"
], Le = {
  1: "bold",
  2: "dim",
  3: "italic",
  4: "underline",
  7: "reverse",
  9: "strikethrough"
};
function Si(n, e) {
  const t = n.indexOf("\x1B[", e);
  if (t !== -1) {
    const r = n.indexOf("m", t);
    return {
      sequence: n.substring(t + 2, r).split(";"),
      startPosition: t,
      position: r + 1
    };
  }
  return {
    position: n.length
  };
}
function ot(n, e) {
  let t = 1;
  const r = n[e + t++];
  let i;
  if (r === "2") {
    const s = [
      n[e + t++],
      n[e + t++],
      n[e + t]
    ].map((a) => Number.parseInt(a));
    s.length === 3 && !s.some((a) => Number.isNaN(a)) && (i = {
      type: "rgb",
      rgb: s
    });
  } else if (r === "5") {
    const s = Number.parseInt(n[e + t]);
    Number.isNaN(s) || (i = { type: "table", index: Number(s) });
  }
  return [t, i];
}
function wi(n) {
  const e = [];
  for (let t = 0; t < n.length; t++) {
    const r = n[t], i = Number.parseInt(r);
    if (!Number.isNaN(i))
      if (i === 0)
        e.push({ type: "resetAll" });
      else if (i <= 9)
        Le[i] && e.push({
          type: "setDecoration",
          value: Le[i]
        });
      else if (i <= 29) {
        const s = Le[i - 20];
        s && e.push({
          type: "resetDecoration",
          value: s
        });
      } else if (i <= 37)
        e.push({
          type: "setForegroundColor",
          value: { type: "named", name: D[i - 30] }
        });
      else if (i === 38) {
        const [s, a] = ot(n, t);
        a && e.push({
          type: "setForegroundColor",
          value: a
        }), t += s;
      } else if (i === 39)
        e.push({
          type: "resetForegroundColor"
        });
      else if (i <= 47)
        e.push({
          type: "setBackgroundColor",
          value: { type: "named", name: D[i - 40] }
        });
      else if (i === 48) {
        const [s, a] = ot(n, t);
        a && e.push({
          type: "setBackgroundColor",
          value: a
        }), t += s;
      } else i === 49 ? e.push({
        type: "resetBackgroundColor"
      }) : i >= 90 && i <= 97 ? e.push({
        type: "setForegroundColor",
        value: { type: "named", name: D[i - 90 + 8] }
      }) : i >= 100 && i <= 107 && e.push({
        type: "setBackgroundColor",
        value: { type: "named", name: D[i - 100 + 8] }
      });
  }
  return e;
}
function Ci() {
  let n = null, e = null, t = /* @__PURE__ */ new Set();
  return {
    parse(r) {
      const i = [];
      let s = 0;
      do {
        const a = Si(r, s), c = a.sequence ? r.substring(s, a.startPosition) : r.substring(s);
        if (c.length > 0 && i.push({
          value: c,
          foreground: n,
          background: e,
          decorations: new Set(t)
        }), a.sequence) {
          const o = wi(a.sequence);
          for (const l of o)
            l.type === "resetAll" ? (n = null, e = null, t.clear()) : l.type === "resetForegroundColor" ? n = null : l.type === "resetBackgroundColor" ? e = null : l.type === "resetDecoration" && t.delete(l.value);
          for (const l of o)
            l.type === "setForegroundColor" ? n = l.value : l.type === "setBackgroundColor" ? e = l.value : l.type === "setDecoration" && t.add(l.value);
        }
        s = a.position;
      } while (s < r.length);
      return i;
    }
  };
}
var ki = {
  black: "#000000",
  red: "#bb0000",
  green: "#00bb00",
  yellow: "#bbbb00",
  blue: "#0000bb",
  magenta: "#ff00ff",
  cyan: "#00bbbb",
  white: "#eeeeee",
  brightBlack: "#555555",
  brightRed: "#ff5555",
  brightGreen: "#00ff00",
  brightYellow: "#ffff55",
  brightBlue: "#5555ff",
  brightMagenta: "#ff55ff",
  brightCyan: "#55ffff",
  brightWhite: "#ffffff"
};
function Ni(n = ki) {
  function e(c) {
    return n[c];
  }
  function t(c) {
    return `#${c.map((o) => Math.max(0, Math.min(o, 255)).toString(16).padStart(2, "0")).join("")}`;
  }
  let r;
  function i() {
    if (r)
      return r;
    r = [];
    for (let l = 0; l < D.length; l++)
      r.push(e(D[l]));
    let c = [0, 95, 135, 175, 215, 255];
    for (let l = 0; l < 6; l++)
      for (let u = 0; u < 6; u++)
        for (let m = 0; m < 6; m++)
          r.push(t([c[l], c[u], c[m]]));
    let o = 8;
    for (let l = 0; l < 24; l++, o += 10)
      r.push(t([o, o, o]));
    return r;
  }
  function s(c) {
    return i()[c];
  }
  function a(c) {
    switch (c.type) {
      case "named":
        return e(c.name);
      case "rgb":
        return t(c.rgb);
      case "table":
        return s(c.index);
    }
  }
  return {
    value: a
  };
}
function Ri(n, e, t) {
  const r = pe(n, t), i = be(e), s = Ni(
    Object.fromEntries(
      D.map((c) => {
        var o;
        return [
          c,
          (o = n.colors) == null ? void 0 : o[`terminal.ansi${c[0].toUpperCase()}${c.substring(1)}`]
        ];
      })
    )
  ), a = Ci();
  return i.map(
    (c) => a.parse(c[0]).map((o) => {
      let l, u;
      o.decorations.has("reverse") ? (l = o.background ? s.value(o.background) : n.bg, u = o.foreground ? s.value(o.foreground) : n.fg) : (l = o.foreground ? s.value(o.foreground) : n.fg, u = o.background ? s.value(o.background) : void 0), l = $(l, r), u = $(u, r), o.decorations.has("dim") && (l = Ti(l));
      let m = B.None;
      return o.decorations.has("bold") && (m |= B.Bold), o.decorations.has("italic") && (m |= B.Italic), o.decorations.has("underline") && (m |= B.Underline), {
        content: o.value,
        offset: c[1],
        // TODO: more accurate offset? might need to fork ansi-sequence-parser
        color: l,
        bgColor: u,
        fontStyle: m
      };
    })
  );
}
function Ti(n) {
  const e = n.match(/#([0-9a-f]{3})([0-9a-f]{3})?([0-9a-f]{2})?/);
  if (e)
    if (e[3]) {
      const r = Math.round(Number.parseInt(e[3], 16) / 2).toString(16).padStart(2, "0");
      return `#${e[1]}${e[2]}${r}`;
    } else return e[2] ? `#${e[1]}${e[2]}80` : `#${Array.from(e[1]).map((r) => `${r}${r}`).join("")}80`;
  const t = n.match(/var\((--[\w-]+-ansi-[\w-]+)\)/);
  return t ? `var(${t[1]}-dim)` : n;
}
function Ue(n, e, t = {}) {
  const {
    lang: r = "text",
    theme: i = n.getLoadedThemes()[0]
  } = t;
  if (Fe(r) || We(i))
    return be(e).map((o) => [{ content: o[0], offset: o[1] }]);
  const { theme: s, colorMap: a } = n.setTheme(i);
  if (r === "ansi")
    return Ri(s, e, t);
  const c = n.getLanguage(r);
  if (t.grammarState) {
    if (t.grammarState.lang !== c.name)
      throw new j(`Grammar state language "${t.grammarState.lang}" does not match highlight language "${c.name}"`);
    if (!t.grammarState.themes.includes(s.name))
      throw new j(`Grammar state themes "${t.grammarState.themes}" do not contain highlight theme "${s.name}"`);
  }
  return vi(e, c, s, a, t);
}
function Ai(...n) {
  if (n.length === 2)
    return Y(n[1]);
  const [e, t, r = {}] = n, {
    lang: i = "text",
    theme: s = e.getLoadedThemes()[0]
  } = r;
  if (Fe(i) || We(s))
    throw new j("Plain language does not have grammar state");
  if (i === "ansi")
    throw new j("ANSI language does not have grammar state");
  const { theme: a, colorMap: c } = e.setTheme(s), o = e.getLanguage(i);
  return new H(
    fe(t, o, a, c, r).stateStack,
    o.name,
    a.name
  );
}
function vi(n, e, t, r, i) {
  const s = fe(n, e, t, r, i), a = new H(
    fe(n, e, t, r, i).stateStack,
    e.name,
    t.name
  );
  return Se(s.tokens, a), s.tokens;
}
function fe(n, e, t, r, i) {
  const s = pe(t, i), {
    tokenizeMaxLineLength: a = 0,
    tokenizeTimeLimit: c = 500
  } = i, o = be(n);
  let l = i.grammarState ? gi(i.grammarState, t.name) ?? Ge : i.grammarContextCode != null ? fe(
    i.grammarContextCode,
    e,
    t,
    r,
    {
      ...i,
      grammarState: void 0,
      grammarContextCode: void 0
    }
  ).stateStack : Ge, u = [];
  const m = [];
  for (let p = 0, h = o.length; p < h; p++) {
    const [f, S] = o[p];
    if (f === "") {
      u = [], m.push([]);
      continue;
    }
    if (a > 0 && f.length >= a) {
      u = [], m.push([{
        content: f,
        offset: S,
        color: "",
        fontStyle: 0
      }]);
      continue;
    }
    let y, g, _;
    i.includeExplanation && (y = e.tokenizeLine(f, l), g = y.tokens, _ = 0);
    const b = e.tokenizeLine2(f, l, c), w = b.tokens.length / 2;
    for (let C = 0; C < w; C++) {
      const L = b.tokens[2 * C], k = C + 1 < w ? b.tokens[2 * C + 2] : f.length;
      if (L === k)
        continue;
      const O = b.tokens[2 * C + 1], te = $(
        r[U.getForeground(O)],
        s
      ), q = U.getFontStyle(O), we = {
        content: f.substring(L, k),
        offset: S + L,
        color: te,
        fontStyle: q
      };
      if (i.includeExplanation) {
        const qe = [];
        if (i.includeExplanation !== "scopeName")
          for (const G of t.settings) {
            let F;
            switch (typeof G.scope) {
              case "string":
                F = G.scope.split(/,/).map((Ce) => Ce.trim());
                break;
              case "object":
                F = G.scope;
                break;
              default:
                continue;
            }
            qe.push({
              settings: G,
              selectors: F.map((Ce) => Ce.split(/ /))
            });
          }
        we.explanation = [];
        let ze = 0;
        for (; L + ze < k; ) {
          const G = g[_], F = f.substring(
            G.startIndex,
            G.endIndex
          );
          ze += F.length, we.explanation.push({
            content: F,
            scopes: i.includeExplanation === "scopeName" ? Li(
              G.scopes
            ) : Pi(
              qe,
              G.scopes
            )
          }), _ += 1;
        }
      }
      u.push(we);
    }
    m.push(u), u = [], l = b.ruleStack;
  }
  return {
    tokens: m,
    stateStack: l
  };
}
function Li(n) {
  return n.map((e) => ({ scopeName: e }));
}
function Pi(n, e) {
  const t = [];
  for (let r = 0, i = e.length; r < i; r++) {
    const s = e[r];
    t[r] = {
      scopeName: s,
      themeMatches: Ii(n, s, e.slice(0, r))
    };
  }
  return t;
}
function ct(n, e) {
  return n === e || e.substring(0, n.length) === n && e[n.length] === ".";
}
function Ei(n, e, t) {
  if (!ct(n[n.length - 1], e))
    return !1;
  let r = n.length - 2, i = t.length - 1;
  for (; r >= 0 && i >= 0; )
    ct(n[r], t[i]) && (r -= 1), i -= 1;
  return r === -1;
}
function Ii(n, e, t) {
  const r = [];
  for (const { selectors: i, settings: s } of n)
    for (const a of i)
      if (Ei(a, e, t)) {
        r.push(s);
        break;
      }
  return r;
}
function Wt(n, e, t) {
  const r = Object.entries(t.themes).filter((o) => o[1]).map((o) => ({ color: o[0], theme: o[1] })), i = r.map((o) => {
    const l = Ue(n, e, {
      ...t,
      theme: o.theme
    }), u = Y(l), m = typeof o.theme == "string" ? o.theme : o.theme.name;
    return {
      tokens: l,
      state: u,
      theme: m
    };
  }), s = xi(
    ...i.map((o) => o.tokens)
  ), a = s[0].map(
    (o, l) => o.map((u, m) => {
      const p = {
        content: u.content,
        variants: {},
        offset: u.offset
      };
      return "includeExplanation" in t && t.includeExplanation && (p.explanation = u.explanation), s.forEach((h, f) => {
        const {
          content: S,
          explanation: y,
          offset: g,
          ..._
        } = h[l][m];
        p.variants[r[f].color] = _;
      }), p;
    })
  ), c = i[0].state ? new H(
    Object.fromEntries(i.map((o) => {
      var l;
      return [o.theme, (l = o.state) == null ? void 0 : l.getInternalStack(o.theme)];
    })),
    i[0].state.lang
  ) : void 0;
  return c && Se(a, c), a;
}
function xi(...n) {
  const e = n.map(() => []), t = n.length;
  for (let r = 0; r < n[0].length; r++) {
    const i = n.map((o) => o[r]), s = e.map(() => []);
    e.forEach((o, l) => o.push(s[l]));
    const a = i.map(() => 0), c = i.map((o) => o[0]);
    for (; c.every((o) => o); ) {
      const o = Math.min(...c.map((l) => l.content.length));
      for (let l = 0; l < t; l++) {
        const u = c[l];
        u.content.length === o ? (s[l].push(u), a[l] += 1, c[l] = i[l][a[l]]) : (s[l].push({
          ...u,
          content: u.content.slice(0, o)
        }), c[l] = {
          ...u,
          content: u.content.slice(o),
          offset: u.offset + o
        });
      }
    }
  }
  return e;
}
function ge(n, e, t) {
  let r, i, s, a, c, o;
  if ("themes" in t) {
    const {
      defaultColor: l = "light",
      cssVariablePrefix: u = "--shiki-"
    } = t, m = Object.entries(t.themes).filter((y) => y[1]).map((y) => ({ color: y[0], theme: y[1] })).sort((y, g) => y.color === l ? -1 : g.color === l ? 1 : 0);
    if (m.length === 0)
      throw new j("`themes` option must not be empty");
    const p = Wt(
      n,
      e,
      t
    );
    if (o = Y(p), l && !m.find((y) => y.color === l))
      throw new j(`\`themes\` option must contain the defaultColor key \`${l}\``);
    const h = m.map((y) => n.getTheme(y.theme)), f = m.map((y) => y.color);
    s = p.map((y) => y.map((g) => Oi(g, f, u, l))), o && Se(s, o);
    const S = m.map((y) => pe(y.theme, t));
    i = m.map((y, g) => (g === 0 && l ? "" : `${u + y.color}:`) + ($(h[g].fg, S[g]) || "inherit")).join(";"), r = m.map((y, g) => (g === 0 && l ? "" : `${u + y.color}-bg:`) + ($(h[g].bg, S[g]) || "inherit")).join(";"), a = `shiki-themes ${h.map((y) => y.name).join(" ")}`, c = l ? void 0 : [i, r].join(";");
  } else if ("theme" in t) {
    const l = pe(t.theme, t);
    s = Ue(
      n,
      e,
      t
    );
    const u = n.getTheme(t.theme);
    r = $(u.bg, l), i = $(u.fg, l), a = u.name, o = Y(s);
  } else
    throw new j("Invalid options, either `theme` or `themes` must be provided");
  return {
    tokens: s,
    fg: i,
    bg: r,
    themeName: a,
    rootStyle: c,
    grammarState: o
  };
}
function Oi(n, e, t, r) {
  const i = {
    content: n.content,
    explanation: n.explanation,
    offset: n.offset
  }, s = e.map((o) => $t(n.variants[o])), a = new Set(s.flatMap((o) => Object.keys(o))), c = {};
  return s.forEach((o, l) => {
    for (const u of a) {
      const m = o[u] || "inherit";
      if (l === 0 && r)
        c[u] = m;
      else {
        const p = u === "color" ? "" : u === "background-color" ? "-bg" : `-${u}`, h = t + e[l] + (u === "color" ? "" : p);
        c[h] = m;
      }
    }
  }), i.htmlStyle = c, i;
}
function ye(n, e, t, r = {
  meta: {},
  options: t,
  codeToHast: (i, s) => ye(n, i, s),
  codeToTokens: (i, s) => ge(n, i, s)
}) {
  var h, f;
  let i = e;
  for (const S of de(t))
    i = ((h = S.preprocess) == null ? void 0 : h.call(r, i, t)) || i;
  let {
    tokens: s,
    fg: a,
    bg: c,
    themeName: o,
    rootStyle: l,
    grammarState: u
  } = ge(n, i, t);
  const {
    mergeWhitespaces: m = !0
  } = t;
  m === !0 ? s = Mi(s) : m === "never" && (s = Bi(s));
  const p = {
    ...r,
    get source() {
      return i;
    }
  };
  for (const S of de(t))
    s = ((f = S.tokens) == null ? void 0 : f.call(p, s)) || s;
  return Gi(
    s,
    {
      ...t,
      fg: a,
      bg: c,
      themeName: o,
      rootStyle: l
    },
    p,
    u
  );
}
function Gi(n, e, t, r = Y(n)) {
  var f, S, y;
  const i = de(e), s = [], a = {
    type: "root",
    children: []
  }, {
    structure: c = "classic",
    tabindex: o = "0"
  } = e;
  let l = {
    type: "element",
    tagName: "pre",
    properties: {
      class: `shiki ${e.themeName || ""}`,
      style: e.rootStyle || `background-color:${e.bg};color:${e.fg}`,
      ...o !== !1 && o != null ? {
        tabindex: o.toString()
      } : {},
      ...Object.fromEntries(
        Array.from(
          Object.entries(e.meta || {})
        ).filter(([g]) => !g.startsWith("_"))
      )
    },
    children: []
  }, u = {
    type: "element",
    tagName: "code",
    properties: {},
    children: s
  };
  const m = [], p = {
    ...t,
    structure: c,
    addClassToHast: Bt,
    get source() {
      return t.source;
    },
    get tokens() {
      return n;
    },
    get options() {
      return e;
    },
    get root() {
      return a;
    },
    get pre() {
      return l;
    },
    get code() {
      return u;
    },
    get lines() {
      return m;
    }
  };
  if (n.forEach((g, _) => {
    var C, L;
    _ && (c === "inline" ? a.children.push({ type: "element", tagName: "br", properties: {}, children: [] }) : c === "classic" && s.push({ type: "text", value: `
` }));
    let b = {
      type: "element",
      tagName: "span",
      properties: { class: "line" },
      children: []
    }, w = 0;
    for (const k of g) {
      let O = {
        type: "element",
        tagName: "span",
        properties: {
          ...k.htmlAttrs
        },
        children: [{ type: "text", value: k.content }]
      };
      k.htmlStyle;
      const te = di(k.htmlStyle || $t(k));
      te && (O.properties.style = te);
      for (const q of i)
        O = ((C = q == null ? void 0 : q.span) == null ? void 0 : C.call(p, O, _ + 1, w, b, k)) || O;
      c === "inline" ? a.children.push(O) : c === "classic" && b.children.push(O), w += k.content.length;
    }
    if (c === "classic") {
      for (const k of i)
        b = ((L = k == null ? void 0 : k.line) == null ? void 0 : L.call(p, b, _ + 1)) || b;
      m.push(b), s.push(b);
    }
  }), c === "classic") {
    for (const g of i)
      u = ((f = g == null ? void 0 : g.code) == null ? void 0 : f.call(p, u)) || u;
    l.children.push(u);
    for (const g of i)
      l = ((S = g == null ? void 0 : g.pre) == null ? void 0 : S.call(p, l)) || l;
    a.children.push(l);
  }
  let h = a;
  for (const g of i)
    h = ((y = g == null ? void 0 : g.root) == null ? void 0 : y.call(p, h)) || h;
  return r && Se(h, r), h;
}
function Mi(n) {
  return n.map((e) => {
    const t = [];
    let r = "", i = 0;
    return e.forEach((s, a) => {
      const o = !(s.fontStyle && s.fontStyle & B.Underline);
      o && s.content.match(/^\s+$/) && e[a + 1] ? (i || (i = s.offset), r += s.content) : r ? (o ? t.push({
        ...s,
        offset: i,
        content: r + s.content
      }) : t.push(
        {
          content: r,
          offset: i
        },
        s
      ), i = 0, r = "") : t.push(s);
    }), t;
  });
}
function Bi(n) {
  return n.map((e) => e.flatMap((t) => {
    if (t.content.match(/^\s+$/))
      return t;
    const r = t.content.match(/^(\s*)(.*?)(\s*)$/);
    if (!r)
      return t;
    const [, i, s, a] = r;
    if (!i && !a)
      return t;
    const c = [{
      ...t,
      offset: t.offset + i.length,
      content: s
    }];
    return i && c.unshift({
      content: i,
      offset: t.offset
    }), a && c.push({
      content: a,
      offset: t.offset + i.length + s.length
    }), c;
  }));
}
function ji(n, e, t) {
  var s;
  const r = {
    meta: {},
    options: t,
    codeToHast: (a, c) => ye(n, a, c),
    codeToTokens: (a, c) => ge(n, a, c)
  };
  let i = ci(ye(n, e, t, r));
  for (const a of de(t))
    i = ((s = a.postprocess) == null ? void 0 : s.call(r, i, t)) || i;
  return i;
}
const lt = { light: "#333333", dark: "#bbbbbb" }, ut = { light: "#fffffe", dark: "#1e1e1e" }, mt = "__shiki_resolved";
function He(n) {
  var c, o, l, u, m;
  if (n != null && n[mt])
    return n;
  const e = {
    ...n
  };
  e.tokenColors && !e.settings && (e.settings = e.tokenColors, delete e.tokenColors), e.type || (e.type = "dark"), e.colorReplacements = { ...e.colorReplacements }, e.settings || (e.settings = []);
  let { bg: t, fg: r } = e;
  if (!t || !r) {
    const p = e.settings ? e.settings.find((h) => !h.name && !h.scope) : void 0;
    (c = p == null ? void 0 : p.settings) != null && c.foreground && (r = p.settings.foreground), (o = p == null ? void 0 : p.settings) != null && o.background && (t = p.settings.background), !r && ((l = e == null ? void 0 : e.colors) != null && l["editor.foreground"]) && (r = e.colors["editor.foreground"]), !t && ((u = e == null ? void 0 : e.colors) != null && u["editor.background"]) && (t = e.colors["editor.background"]), r || (r = e.type === "light" ? lt.light : lt.dark), t || (t = e.type === "light" ? ut.light : ut.dark), e.fg = r, e.bg = t;
  }
  e.settings[0] && e.settings[0].settings && !e.settings[0].scope || e.settings.unshift({
    settings: {
      foreground: e.fg,
      background: e.bg
    }
  });
  let i = 0;
  const s = /* @__PURE__ */ new Map();
  function a(p) {
    var f;
    if (s.has(p))
      return s.get(p);
    i += 1;
    const h = `#${i.toString(16).padStart(8, "0").toLowerCase()}`;
    return (f = e.colorReplacements) != null && f[`#${h}`] ? a(p) : (s.set(p, h), h);
  }
  e.settings = e.settings.map((p) => {
    var y, g;
    const h = ((y = p.settings) == null ? void 0 : y.foreground) && !p.settings.foreground.startsWith("#"), f = ((g = p.settings) == null ? void 0 : g.background) && !p.settings.background.startsWith("#");
    if (!h && !f)
      return p;
    const S = {
      ...p,
      settings: {
        ...p.settings
      }
    };
    if (h) {
      const _ = a(p.settings.foreground);
      e.colorReplacements[_] = p.settings.foreground, S.settings.foreground = _;
    }
    if (f) {
      const _ = a(p.settings.background);
      e.colorReplacements[_] = p.settings.background, S.settings.background = _;
    }
    return S;
  });
  for (const p of Object.keys(e.colors || {}))
    if ((p === "editor.foreground" || p === "editor.background" || p.startsWith("terminal.ansi")) && !((m = e.colors[p]) != null && m.startsWith("#"))) {
      const h = a(e.colors[p]);
      e.colorReplacements[h] = e.colors[p], e.colors[p] = h;
    }
  return Object.defineProperty(e, mt, {
    enumerable: !1,
    writable: !1,
    value: !0
  }), e;
}
async function Ut(n) {
  return Array.from(new Set((await Promise.all(
    n.filter((e) => !Gt(e)).map(async (e) => await jt(e).then((t) => Array.isArray(t) ? t : [t]))
  )).flat()));
}
async function Ht(n) {
  return (await Promise.all(
    n.map(
      async (t) => Mt(t) ? null : He(await jt(t))
    )
  )).filter((t) => !!t);
}
class $i extends on {
  constructor(t, r, i, s = {}) {
    super(t);
    d(this, "_resolvedThemes", /* @__PURE__ */ new Map());
    d(this, "_resolvedGrammars", /* @__PURE__ */ new Map());
    d(this, "_langMap", /* @__PURE__ */ new Map());
    d(this, "_langGraph", /* @__PURE__ */ new Map());
    d(this, "_textmateThemeCache", /* @__PURE__ */ new WeakMap());
    d(this, "_loadedThemesCache", null);
    d(this, "_loadedLanguagesCache", null);
    this._resolver = t, this._themes = r, this._langs = i, this._alias = s, this._themes.map((a) => this.loadTheme(a)), this.loadLanguages(this._langs);
  }
  getTheme(t) {
    return typeof t == "string" ? this._resolvedThemes.get(t) : this.loadTheme(t);
  }
  loadTheme(t) {
    const r = He(t);
    return r.name && (this._resolvedThemes.set(r.name, r), this._loadedThemesCache = null), r;
  }
  getLoadedThemes() {
    return this._loadedThemesCache || (this._loadedThemesCache = [...this._resolvedThemes.keys()]), this._loadedThemesCache;
  }
  // Override and re-implement this method to cache the textmate themes as `TextMateTheme.createFromRawTheme`
  // is expensive. Themes can switch often especially for dual-theme support.
  //
  // The parent class also accepts `colorMap` as the second parameter, but since we don't use that,
  // we omit here so it's easier to cache the themes.
  setTheme(t) {
    let r = this._textmateThemeCache.get(t);
    r || (r = ce.createFromRawTheme(t), this._textmateThemeCache.set(t, r)), this._syncRegistry.setTheme(r);
  }
  getGrammar(t) {
    if (this._alias[t]) {
      const r = /* @__PURE__ */ new Set([t]);
      for (; this._alias[t]; ) {
        if (t = this._alias[t], r.has(t))
          throw new v(`Circular alias \`${Array.from(r).join(" -> ")} -> ${t}\``);
        r.add(t);
      }
    }
    return this._resolvedGrammars.get(t);
  }
  loadLanguage(t) {
    var a, c, o, l;
    if (this.getGrammar(t.name))
      return;
    const r = new Set(
      [...this._langMap.values()].filter((u) => {
        var m;
        return (m = u.embeddedLangsLazy) == null ? void 0 : m.includes(t.name);
      })
    );
    this._resolver.addLanguage(t);
    const i = {
      balancedBracketSelectors: t.balancedBracketSelectors || ["*"],
      unbalancedBracketSelectors: t.unbalancedBracketSelectors || []
    };
    this._syncRegistry._rawGrammars.set(t.scopeName, t);
    const s = this.loadGrammarWithConfiguration(t.scopeName, 1, i);
    if (s.name = t.name, this._resolvedGrammars.set(t.name, s), t.aliases && t.aliases.forEach((u) => {
      this._alias[u] = t.name;
    }), this._loadedLanguagesCache = null, r.size)
      for (const u of r)
        this._resolvedGrammars.delete(u.name), this._loadedLanguagesCache = null, (c = (a = this._syncRegistry) == null ? void 0 : a._injectionGrammars) == null || c.delete(u.scopeName), (l = (o = this._syncRegistry) == null ? void 0 : o._grammars) == null || l.delete(u.scopeName), this.loadLanguage(this._langMap.get(u.name));
  }
  dispose() {
    super.dispose(), this._resolvedThemes.clear(), this._resolvedGrammars.clear(), this._langMap.clear(), this._langGraph.clear(), this._loadedThemesCache = null;
  }
  loadLanguages(t) {
    for (const s of t)
      this.resolveEmbeddedLanguages(s);
    const r = Array.from(this._langGraph.entries()), i = r.filter(([s, a]) => !a);
    if (i.length) {
      const s = r.filter(([a, c]) => {
        var o;
        return c && ((o = c.embeddedLangs) == null ? void 0 : o.some((l) => i.map(([u]) => u).includes(l)));
      }).filter((a) => !i.includes(a));
      throw new v(`Missing languages ${i.map(([a]) => `\`${a}\``).join(", ")}, required by ${s.map(([a]) => `\`${a}\``).join(", ")}`);
    }
    for (const [s, a] of r)
      this._resolver.addLanguage(a);
    for (const [s, a] of r)
      this.loadLanguage(a);
  }
  getLoadedLanguages() {
    return this._loadedLanguagesCache || (this._loadedLanguagesCache = [
      .../* @__PURE__ */ new Set([...this._resolvedGrammars.keys(), ...Object.keys(this._alias)])
    ]), this._loadedLanguagesCache;
  }
  resolveEmbeddedLanguages(t) {
    if (this._langMap.set(t.name, t), this._langGraph.set(t.name, t), t.embeddedLangs)
      for (const r of t.embeddedLangs)
        this._langGraph.set(r, this._langMap.get(r));
  }
}
class Di {
  constructor(e, t) {
    d(this, "_langs", /* @__PURE__ */ new Map());
    d(this, "_scopeToLang", /* @__PURE__ */ new Map());
    d(this, "_injections", /* @__PURE__ */ new Map());
    d(this, "_onigLib");
    this._onigLib = {
      createOnigScanner: (r) => e.createScanner(r),
      createOnigString: (r) => e.createString(r)
    }, t.forEach((r) => this.addLanguage(r));
  }
  get onigLib() {
    return this._onigLib;
  }
  getLangRegistration(e) {
    return this._langs.get(e);
  }
  loadGrammar(e) {
    return this._scopeToLang.get(e);
  }
  addLanguage(e) {
    this._langs.set(e.name, e), e.aliases && e.aliases.forEach((t) => {
      this._langs.set(t, e);
    }), this._scopeToLang.set(e.scopeName, e), e.injectTo && e.injectTo.forEach((t) => {
      this._injections.get(t) || this._injections.set(t, []), this._injections.get(t).push(e.scopeName);
    });
  }
  getInjections(e) {
    const t = e.split(".");
    let r = [];
    for (let i = 1; i <= t.length; i++) {
      const s = t.slice(0, i).join(".");
      r = [...r, ...this._injections.get(s) || []];
    }
    return r;
  }
}
let z = 0;
function Fi(n) {
  z += 1, n.warnings !== !1 && z >= 10 && z % 10 === 0 && console.warn(`[Shiki] ${z} instances have been created. Shiki is supposed to be used as a singleton, consider refactoring your code to cache your highlighter instance; Or call \`highlighter.dispose()\` to release unused instances.`);
  let e = !1;
  if (!n.engine)
    throw new v("`engine` option is required for synchronous mode");
  const t = (n.langs || []).flat(1), r = (n.themes || []).flat(1).map(He), i = new Di(n.engine, t), s = new $i(i, r, t, n.langAlias);
  let a;
  function c(_) {
    y();
    const b = s.getGrammar(typeof _ == "string" ? _ : _.name);
    if (!b)
      throw new v(`Language \`${_}\` not found, you may need to load it first`);
    return b;
  }
  function o(_) {
    if (_ === "none")
      return { bg: "", fg: "", name: "none", settings: [], type: "dark" };
    y();
    const b = s.getTheme(_);
    if (!b)
      throw new v(`Theme \`${_}\` not found, you may need to load it first`);
    return b;
  }
  function l(_) {
    y();
    const b = o(_);
    a !== _ && (s.setTheme(b), a = _);
    const w = s.getColorMap();
    return {
      theme: b,
      colorMap: w
    };
  }
  function u() {
    return y(), s.getLoadedThemes();
  }
  function m() {
    return y(), s.getLoadedLanguages();
  }
  function p(..._) {
    y(), s.loadLanguages(_.flat(1));
  }
  async function h(..._) {
    return p(await Ut(_));
  }
  function f(..._) {
    y();
    for (const b of _.flat(1))
      s.loadTheme(b);
  }
  async function S(..._) {
    return y(), f(await Ht(_));
  }
  function y() {
    if (e)
      throw new v("Shiki instance has been disposed");
  }
  function g() {
    e || (e = !0, s.dispose(), z -= 1);
  }
  return {
    setTheme: l,
    getTheme: o,
    getLanguage: c,
    getLoadedThemes: u,
    getLoadedLanguages: m,
    loadLanguage: h,
    loadLanguageSync: p,
    loadTheme: S,
    loadThemeSync: f,
    dispose: g,
    [Symbol.dispose]: g
  };
}
async function Wi(n = {}) {
  n.loadWasm;
  const [
    e,
    t,
    r
  ] = await Promise.all([
    Ht(n.themes || []),
    Ut(n.langs || []),
    n.engine || dt(n.loadWasm || Sr())
  ]);
  return Fi({
    ...n,
    themes: e,
    langs: t,
    engine: r
  });
}
async function Ui(n = {}) {
  const e = await Wi(n);
  return {
    getLastGrammarState: (...t) => Ai(e, ...t),
    codeToTokensBase: (t, r) => Ue(e, t, r),
    codeToTokensWithThemes: (t, r) => Wt(e, t, r),
    codeToTokens: (t, r) => ge(e, t, r),
    codeToHast: (t, r) => ye(e, t, r),
    codeToHtml: (t, r) => ji(e, t, r),
    ...e,
    getInternalContext: () => e
  };
}
function Hi(n, e, t) {
  let r, i, s;
  {
    const c = n;
    r = c.langs, i = c.themes, s = c.engine;
  }
  async function a(c) {
    function o(h) {
      if (typeof h == "string") {
        if (Gt(h))
          return [];
        const f = r[h];
        if (!f)
          throw new j(`Language \`${h}\` is not included in this bundle. You may want to load it from external source.`);
        return f;
      }
      return h;
    }
    function l(h) {
      if (Mt(h))
        return "none";
      if (typeof h == "string") {
        const f = i[h];
        if (!f)
          throw new j(`Theme \`${h}\` is not included in this bundle. You may want to load it from external source.`);
        return f;
      }
      return h;
    }
    const u = (c.themes ?? []).map((h) => l(h)), m = (c.langs ?? []).map((h) => o(h)), p = await Ui({
      engine: c.engine ?? s(),
      ...c,
      themes: u,
      langs: m
    });
    return {
      ...p,
      loadLanguage(...h) {
        return p.loadLanguage(...h.map(o));
      },
      loadTheme(...h) {
        return p.loadTheme(...h.map(l));
      }
    };
  }
  return a;
}
function qi(n) {
  let e;
  async function t(r = {}) {
    if (e) {
      const i = await e;
      return await Promise.all([
        i.loadTheme(...r.themes || []),
        i.loadLanguage(...r.langs || [])
      ]), i;
    } else
      return e = n({
        ...r,
        themes: r.themes || [],
        langs: r.langs || []
      }), e;
  }
  return t;
}
function zi(n) {
  const e = qi(n);
  return {
    getSingletonHighlighter(t) {
      return e(t);
    },
    async codeToHtml(t, r) {
      return (await e({
        langs: [r.lang],
        themes: "theme" in r ? [r.theme] : Object.values(r.themes)
      })).codeToHtml(t, r);
    },
    async codeToHast(t, r) {
      return (await e({
        langs: [r.lang],
        themes: "theme" in r ? [r.theme] : Object.values(r.themes)
      })).codeToHast(t, r);
    },
    async codeToTokens(t, r) {
      return (await e({
        langs: [r.lang],
        themes: "theme" in r ? [r.theme] : Object.values(r.themes)
      })).codeToTokens(t, r);
    },
    async codeToTokensBase(t, r) {
      return (await e({
        langs: [r.lang],
        themes: [r.theme]
      })).codeToTokensBase(t, r);
    },
    async codeToTokensWithThemes(t, r) {
      return (await e({
        langs: [r.lang],
        themes: Object.values(r.themes).filter(Boolean)
      })).codeToTokensWithThemes(t, r);
    },
    async getLastGrammarState(t, r) {
      return (await e({
        langs: [r.lang],
        themes: [r.theme]
      })).getLastGrammarState(t, r);
    }
  };
}
const Vi = /* @__PURE__ */ Hi({
  langs: er,
  themes: rr,
  engine: () => dt(import("./wasm-DQxwEHae.js"))
}), {
  codeToTokens: Zi
} = /* @__PURE__ */ zi(
  Vi
);
export {
  B as FontStyle,
  j as ShikiError,
  U as StackElementMetadata,
  Bt as addClassToHast,
  $ as applyColorReplacements,
  er as bundledLanguages,
  Zt as bundledLanguagesAlias,
  Yt as bundledLanguagesBase,
  pt as bundledLanguagesInfo,
  rr as bundledThemes,
  tr as bundledThemesInfo,
  Zi as codeToTokens,
  Vi as createHighlighter,
  Ui as createHighlighterCore,
  dt as createOnigurumaEngine,
  fi as createPositionConverter,
  Wi as createShikiInternal,
  Fi as createShikiInternalSync,
  zi as createSingletonShorthands,
  Hi as createdBundledHighlighter,
  $t as getTokenStyleObject,
  ci as hastToHtml,
  We as isNoneTheme,
  Fe as isPlainLang,
  Gt as isSpecialLang,
  Mt as isSpecialTheme,
  gr as loadWasm,
  qi as makeSingletonHighlighter,
  jt as normalizeGetter,
  He as normalizeTheme,
  pe as resolveColorReplacements,
  be as splitLines,
  hi as splitToken,
  pi as splitTokens,
  di as stringifyTokenStyle,
  mi as toArray,
  Ri as tokenizeAnsiWithTheme,
  vi as tokenizeWithTheme,
  Gi as tokensToHast,
  yi as transformerDecorations
};
