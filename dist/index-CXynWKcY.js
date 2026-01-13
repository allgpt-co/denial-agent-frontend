import { w as xe, s as lt, f as Ht, a as qt, b as zt, c as He, h as Vt } from "./index-3KbPGRub.js";
const qe = {}.hasOwnProperty;
function Jt(r, e) {
  const t = e || {};
  function n(i, ...s) {
    let o = n.invalid;
    const c = n.handlers;
    if (i && qe.call(i, r)) {
      const a = String(i[r]);
      o = qe.call(c, a) ? c[a] : n.unknown;
    }
    if (o)
      return o.call(this, i, ...s);
  }
  return n.handlers = t.handlers || {}, n.invalid = t.invalid, n.unknown = t.unknown, n;
}
const ut = [
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
    import: () => import("./angular-html-0fTdLuKf.js").then((r) => r.f)
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
], Kt = Object.fromEntries(ut.map((r) => [r.id, r.import])), Qt = Object.fromEntries(ut.flatMap((r) => r.aliases?.map((e) => [e, r.import]) || [])), Xt = {
  ...Kt,
  ...Qt
}, Yt = [
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
], Zt = Object.fromEntries(Yt.map((r) => [r.id, r.import]));
let x = class extends Error {
  constructor(e) {
    super(e), this.name = "ShikiError";
  }
}, Oe = class extends Error {
  constructor(e) {
    super(e), this.name = "ShikiError";
  }
};
function er() {
  return 2147483648;
}
function tr() {
  return typeof performance < "u" ? performance.now() : Date.now();
}
const rr = (r, e) => r + (e - r % e) % e;
async function nr(r) {
  let e, t;
  const n = {};
  function i(h) {
    t = h, n.HEAPU8 = new Uint8Array(h), n.HEAPU32 = new Uint32Array(h);
  }
  function s(h, p, b) {
    n.HEAPU8.copyWithin(h, p, p + b);
  }
  function o(h) {
    try {
      return e.grow(h - t.byteLength + 65535 >>> 16), i(e.buffer), 1;
    } catch {
    }
  }
  function c(h) {
    const p = n.HEAPU8.length;
    h = h >>> 0;
    const b = er();
    if (h > b)
      return !1;
    for (let f = 1; f <= 4; f *= 2) {
      let y = p * (1 + 0.2 / f);
      y = Math.min(y, h + 100663296);
      const g = Math.min(b, rr(Math.max(h, y), 65536));
      if (o(g))
        return !0;
    }
    return !1;
  }
  const a = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
  function l(h, p, b = 1024) {
    const f = p + b;
    let y = p;
    for (; h[y] && !(y >= f); )
      ++y;
    if (y - p > 16 && h.buffer && a)
      return a.decode(h.subarray(p, y));
    let g = "";
    for (; p < y; ) {
      let _ = h[p++];
      if (!(_ & 128)) {
        g += String.fromCharCode(_);
        continue;
      }
      const w = h[p++] & 63;
      if ((_ & 224) === 192) {
        g += String.fromCharCode((_ & 31) << 6 | w);
        continue;
      }
      const S = h[p++] & 63;
      if ((_ & 240) === 224 ? _ = (_ & 15) << 12 | w << 6 | S : _ = (_ & 7) << 18 | w << 12 | S << 6 | h[p++] & 63, _ < 65536)
        g += String.fromCharCode(_);
      else {
        const v = _ - 65536;
        g += String.fromCharCode(55296 | v >> 10, 56320 | v & 1023);
      }
    }
    return g;
  }
  function u(h, p) {
    return h ? l(n.HEAPU8, h, p) : "";
  }
  const m = {
    emscripten_get_now: tr,
    emscripten_memcpy_big: s,
    emscripten_resize_heap: c,
    fd_write: () => 0
  };
  async function d() {
    const p = await r({
      env: m,
      wasi_snapshot_preview1: m
    });
    e = p.memory, i(e.buffer), Object.assign(n, p), n.UTF8ToString = u;
  }
  return await d(), n;
}
var ir = Object.defineProperty, sr = (r, e, t) => e in r ? ir(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, C = (r, e, t) => (sr(r, typeof e != "symbol" ? e + "" : e, t), t);
let N = null;
function ar(r) {
  throw new Oe(r.UTF8ToString(r.getLastOnigError()));
}
class pe {
  constructor(e) {
    C(this, "utf16Length"), C(this, "utf8Length"), C(this, "utf16Value"), C(this, "utf8Value"), C(this, "utf16OffsetToUtf8"), C(this, "utf8OffsetToUtf16");
    const t = e.length, n = pe._utf8ByteLength(e), i = n !== t, s = i ? new Uint32Array(t + 1) : null;
    i && (s[t] = n);
    const o = i ? new Uint32Array(n + 1) : null;
    i && (o[n] = t);
    const c = new Uint8Array(n);
    let a = 0;
    for (let l = 0; l < t; l++) {
      const u = e.charCodeAt(l);
      let m = u, d = !1;
      if (u >= 55296 && u <= 56319 && l + 1 < t) {
        const h = e.charCodeAt(l + 1);
        h >= 56320 && h <= 57343 && (m = (u - 55296 << 10) + 65536 | h - 56320, d = !0);
      }
      i && (s[l] = a, d && (s[l + 1] = a), m <= 127 ? o[a + 0] = l : m <= 2047 ? (o[a + 0] = l, o[a + 1] = l) : m <= 65535 ? (o[a + 0] = l, o[a + 1] = l, o[a + 2] = l) : (o[a + 0] = l, o[a + 1] = l, o[a + 2] = l, o[a + 3] = l)), m <= 127 ? c[a++] = m : m <= 2047 ? (c[a++] = 192 | (m & 1984) >>> 6, c[a++] = 128 | (m & 63) >>> 0) : m <= 65535 ? (c[a++] = 224 | (m & 61440) >>> 12, c[a++] = 128 | (m & 4032) >>> 6, c[a++] = 128 | (m & 63) >>> 0) : (c[a++] = 240 | (m & 1835008) >>> 18, c[a++] = 128 | (m & 258048) >>> 12, c[a++] = 128 | (m & 4032) >>> 6, c[a++] = 128 | (m & 63) >>> 0), d && l++;
    }
    this.utf16Length = t, this.utf8Length = n, this.utf16Value = e, this.utf8Value = c, this.utf16OffsetToUtf8 = s, this.utf8OffsetToUtf16 = o;
  }
  static _utf8ByteLength(e) {
    let t = 0;
    for (let n = 0, i = e.length; n < i; n++) {
      const s = e.charCodeAt(n);
      let o = s, c = !1;
      if (s >= 55296 && s <= 56319 && n + 1 < i) {
        const a = e.charCodeAt(n + 1);
        a >= 56320 && a <= 57343 && (o = (s - 55296 << 10) + 65536 | a - 56320, c = !0);
      }
      o <= 127 ? t += 1 : o <= 2047 ? t += 2 : o <= 65535 ? t += 3 : t += 4, c && n++;
    }
    return t;
  }
  createString(e) {
    const t = e.omalloc(this.utf8Length);
    return e.HEAPU8.set(this.utf8Value, t), t;
  }
}
const L = class {
  constructor(r) {
    if (C(this, "id", ++L.LAST_ID), C(this, "_onigBinding"), C(this, "content"), C(this, "utf16Length"), C(this, "utf8Length"), C(this, "utf16OffsetToUtf8"), C(this, "utf8OffsetToUtf16"), C(this, "ptr"), !N)
      throw new Oe("Must invoke loadWasm first.");
    this._onigBinding = N, this.content = r;
    const e = new pe(r);
    this.utf16Length = e.utf16Length, this.utf8Length = e.utf8Length, this.utf16OffsetToUtf8 = e.utf16OffsetToUtf8, this.utf8OffsetToUtf16 = e.utf8OffsetToUtf16, this.utf8Length < 1e4 && !L._sharedPtrInUse ? (L._sharedPtr || (L._sharedPtr = N.omalloc(1e4)), L._sharedPtrInUse = !0, N.HEAPU8.set(e.utf8Value, L._sharedPtr), this.ptr = L._sharedPtr) : this.ptr = e.createString(N);
  }
  convertUtf8OffsetToUtf16(r) {
    return this.utf8OffsetToUtf16 ? r < 0 ? 0 : r > this.utf8Length ? this.utf16Length : this.utf8OffsetToUtf16[r] : r;
  }
  convertUtf16OffsetToUtf8(r) {
    return this.utf16OffsetToUtf8 ? r < 0 ? 0 : r > this.utf16Length ? this.utf8Length : this.utf16OffsetToUtf8[r] : r;
  }
  dispose() {
    this.ptr === L._sharedPtr ? L._sharedPtrInUse = !1 : this._onigBinding.ofree(this.ptr);
  }
};
let K = L;
C(K, "LAST_ID", 0);
C(K, "_sharedPtr", 0);
C(K, "_sharedPtrInUse", !1);
class or {
  constructor(e) {
    if (C(this, "_onigBinding"), C(this, "_ptr"), !N)
      throw new Oe("Must invoke loadWasm first.");
    const t = [], n = [];
    for (let c = 0, a = e.length; c < a; c++) {
      const l = new pe(e[c]);
      t[c] = l.createString(N), n[c] = l.utf8Length;
    }
    const i = N.omalloc(4 * e.length);
    N.HEAPU32.set(t, i / 4);
    const s = N.omalloc(4 * e.length);
    N.HEAPU32.set(n, s / 4);
    const o = N.createOnigScanner(i, s, e.length);
    for (let c = 0, a = e.length; c < a; c++)
      N.ofree(t[c]);
    N.ofree(s), N.ofree(i), o === 0 && ar(N), this._onigBinding = N, this._ptr = o;
  }
  dispose() {
    this._onigBinding.freeOnigScanner(this._ptr);
  }
  findNextMatchSync(e, t, n) {
    let i = 0;
    if (typeof n == "number" && (i = n), typeof e == "string") {
      e = new K(e);
      const s = this._findNextMatchSync(e, t, !1, i);
      return e.dispose(), s;
    }
    return this._findNextMatchSync(e, t, !1, i);
  }
  _findNextMatchSync(e, t, n, i) {
    const s = this._onigBinding, o = s.findNextOnigScannerMatch(this._ptr, e.id, e.ptr, e.utf8Length, e.convertUtf16OffsetToUtf8(t), i);
    if (o === 0)
      return null;
    const c = s.HEAPU32;
    let a = o / 4;
    const l = c[a++], u = c[a++], m = [];
    for (let d = 0; d < u; d++) {
      const h = e.convertUtf8OffsetToUtf16(c[a++]), p = e.convertUtf8OffsetToUtf16(c[a++]);
      m[d] = {
        start: h,
        end: p,
        length: p - h
      };
    }
    return {
      index: l,
      captureIndices: m
    };
  }
}
function cr(r) {
  return typeof r.instantiator == "function";
}
function lr(r) {
  return typeof r.default == "function";
}
function ur(r) {
  return typeof r.data < "u";
}
function mr(r) {
  return typeof Response < "u" && r instanceof Response;
}
function hr(r) {
  return typeof ArrayBuffer < "u" && (r instanceof ArrayBuffer || ArrayBuffer.isView(r)) || typeof Buffer < "u" && Buffer.isBuffer?.(r) || typeof SharedArrayBuffer < "u" && r instanceof SharedArrayBuffer || typeof Uint32Array < "u" && r instanceof Uint32Array;
}
let X;
function pr(r) {
  if (X)
    return X;
  async function e() {
    N = await nr(async (t) => {
      let n = r;
      return n = await n, typeof n == "function" && (n = await n(t)), typeof n == "function" && (n = await n(t)), cr(n) ? n = await n.instantiator(t) : lr(n) ? n = await n.default(t) : (ur(n) && (n = n.data), mr(n) ? typeof WebAssembly.instantiateStreaming == "function" ? n = await dr(n)(t) : n = await fr(n)(t) : hr(n) ? n = await _e(n)(t) : n instanceof WebAssembly.Module ? n = await _e(n)(t) : "default" in n && n.default instanceof WebAssembly.Module && (n = await _e(n.default)(t))), "instance" in n && (n = n.instance), "exports" in n && (n = n.exports), n;
    });
  }
  return X = e(), X;
}
function _e(r) {
  return (e) => WebAssembly.instantiate(r, e);
}
function dr(r) {
  return (e) => WebAssembly.instantiateStreaming(r, e);
}
function fr(r) {
  return async (e) => {
    const t = await r.arrayBuffer();
    return WebAssembly.instantiate(t, e);
  };
}
let gr;
function yr() {
  return gr;
}
async function mt(r) {
  return r && await pr(r), {
    createScanner(e) {
      return new or(e.map((t) => typeof t == "string" ? t : t.source));
    },
    createString(e) {
      return new K(e);
    }
  };
}
function _r(r) {
  return Ge(r);
}
function Ge(r) {
  return Array.isArray(r) ? br(r) : r instanceof RegExp ? r : typeof r == "object" ? Sr(r) : r;
}
function br(r) {
  let e = [];
  for (let t = 0, n = r.length; t < n; t++)
    e[t] = Ge(r[t]);
  return e;
}
function Sr(r) {
  let e = {};
  for (let t in r)
    e[t] = Ge(r[t]);
  return e;
}
function ht(r, ...e) {
  return e.forEach((t) => {
    for (let n in t)
      r[n] = t[n];
  }), r;
}
function pt(r) {
  const e = ~r.lastIndexOf("/") || ~r.lastIndexOf("\\");
  return e === 0 ? r : ~e === r.length - 1 ? pt(r.substring(0, r.length - 1)) : r.substr(~e + 1);
}
var be = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g, Y = class {
  static hasCaptures(r) {
    return r === null ? !1 : (be.lastIndex = 0, be.test(r));
  }
  static replaceCaptures(r, e, t) {
    return r.replace(be, (n, i, s, o) => {
      let c = t[parseInt(i || s, 10)];
      if (c) {
        let a = e.substring(c.start, c.end);
        for (; a[0] === "."; )
          a = a.substring(1);
        switch (o) {
          case "downcase":
            return a.toLowerCase();
          case "upcase":
            return a.toUpperCase();
          default:
            return a;
        }
      } else
        return n;
    });
  }
};
function dt(r, e) {
  return r < e ? -1 : r > e ? 1 : 0;
}
function ft(r, e) {
  if (r === null && e === null)
    return 0;
  if (!r)
    return -1;
  if (!e)
    return 1;
  let t = r.length, n = e.length;
  if (t === n) {
    for (let i = 0; i < t; i++) {
      let s = dt(r[i], e[i]);
      if (s !== 0)
        return s;
    }
    return 0;
  }
  return t - n;
}
function ze(r) {
  return !!(/^#[0-9a-f]{6}$/i.test(r) || /^#[0-9a-f]{8}$/i.test(r) || /^#[0-9a-f]{3}$/i.test(r) || /^#[0-9a-f]{4}$/i.test(r));
}
function gt(r) {
  return r.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
}
var yt = class {
  constructor(r) {
    this.fn = r;
  }
  cache = /* @__PURE__ */ new Map();
  get(r) {
    if (this.cache.has(r))
      return this.cache.get(r);
    const e = this.fn(r);
    return this.cache.set(r, e), e;
  }
}, ne = class {
  constructor(r, e, t) {
    this._colorMap = r, this._defaults = e, this._root = t;
  }
  static createFromRawTheme(r, e) {
    return this.createFromParsedTheme(kr(r), e);
  }
  static createFromParsedTheme(r, e) {
    return Rr(r, e);
  }
  _cachedMatchRoot = new yt(
    (r) => this._root.match(r)
  );
  getColorMap() {
    return this._colorMap.getColorMap();
  }
  getDefaults() {
    return this._defaults;
  }
  match(r) {
    if (r === null)
      return this._defaults;
    const e = r.scopeName, n = this._cachedMatchRoot.get(e).find(
      (i) => wr(r.parent, i.parentScopes)
    );
    return n ? new _t(
      n.fontStyle,
      n.foreground,
      n.background
    ) : null;
  }
}, Se = class te {
  constructor(e, t) {
    this.parent = e, this.scopeName = t;
  }
  static push(e, t) {
    for (const n of t)
      e = new te(e, n);
    return e;
  }
  static from(...e) {
    let t = null;
    for (let n = 0; n < e.length; n++)
      t = new te(t, e[n]);
    return t;
  }
  push(e) {
    return new te(this, e);
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
    let n = this;
    for (; n && n !== e; )
      t.push(n.scopeName), n = n.parent;
    return n === e ? t.reverse() : void 0;
  }
};
function wr(r, e) {
  if (e.length === 0)
    return !0;
  for (let t = 0; t < e.length; t++) {
    let n = e[t], i = !1;
    if (n === ">") {
      if (t === e.length - 1)
        return !1;
      n = e[++t], i = !0;
    }
    for (; r && !Cr(r.scopeName, n); ) {
      if (i)
        return !1;
      r = r.parent;
    }
    if (!r)
      return !1;
    r = r.parent;
  }
  return !0;
}
function Cr(r, e) {
  return e === r || r.startsWith(e) && r[e.length] === ".";
}
var _t = class {
  constructor(r, e, t) {
    this.fontStyle = r, this.foregroundId = e, this.backgroundId = t;
  }
};
function kr(r) {
  if (!r)
    return [];
  if (!r.settings || !Array.isArray(r.settings))
    return [];
  let e = r.settings, t = [], n = 0;
  for (let i = 0, s = e.length; i < s; i++) {
    let o = e[i];
    if (!o.settings)
      continue;
    let c;
    if (typeof o.scope == "string") {
      let m = o.scope;
      m = m.replace(/^[,]+/, ""), m = m.replace(/[,]+$/, ""), c = m.split(",");
    } else Array.isArray(o.scope) ? c = o.scope : c = [""];
    let a = -1;
    if (typeof o.settings.fontStyle == "string") {
      a = 0;
      let m = o.settings.fontStyle.split(" ");
      for (let d = 0, h = m.length; d < h; d++)
        switch (m[d]) {
          case "italic":
            a = a | 1;
            break;
          case "bold":
            a = a | 2;
            break;
          case "underline":
            a = a | 4;
            break;
          case "strikethrough":
            a = a | 8;
            break;
        }
    }
    let l = null;
    typeof o.settings.foreground == "string" && ze(o.settings.foreground) && (l = o.settings.foreground);
    let u = null;
    typeof o.settings.background == "string" && ze(o.settings.background) && (u = o.settings.background);
    for (let m = 0, d = c.length; m < d; m++) {
      let p = c[m].trim().split(" "), b = p[p.length - 1], f = null;
      p.length > 1 && (f = p.slice(0, p.length - 1), f.reverse()), t[n++] = new Nr(
        b,
        f,
        i,
        a,
        l,
        u
      );
    }
  }
  return t;
}
var Nr = class {
  constructor(r, e, t, n, i, s) {
    this.scope = r, this.parentScopes = e, this.index = t, this.fontStyle = n, this.foreground = i, this.background = s;
  }
}, I = /* @__PURE__ */ ((r) => (r[r.NotSet = -1] = "NotSet", r[r.None = 0] = "None", r[r.Italic = 1] = "Italic", r[r.Bold = 2] = "Bold", r[r.Underline = 4] = "Underline", r[r.Strikethrough = 8] = "Strikethrough", r))(I || {});
function Rr(r, e) {
  r.sort((a, l) => {
    let u = dt(a.scope, l.scope);
    return u !== 0 || (u = ft(a.parentScopes, l.parentScopes), u !== 0) ? u : a.index - l.index;
  });
  let t = 0, n = "#000000", i = "#ffffff";
  for (; r.length >= 1 && r[0].scope === ""; ) {
    let a = r.shift();
    a.fontStyle !== -1 && (t = a.fontStyle), a.foreground !== null && (n = a.foreground), a.background !== null && (i = a.background);
  }
  let s = new Tr(e), o = new _t(t, s.getId(n), s.getId(i)), c = new vr(new Re(0, null, -1, 0, 0), []);
  for (let a = 0, l = r.length; a < l; a++) {
    let u = r[a];
    c.insert(0, u.scope, u.parentScopes, u.fontStyle, s.getId(u.foreground), s.getId(u.background));
  }
  return new ne(s, o, c);
}
var Tr = class {
  _isFrozen;
  _lastColorId;
  _id2color;
  _color2id;
  constructor(r) {
    if (this._lastColorId = 0, this._id2color = [], this._color2id = /* @__PURE__ */ Object.create(null), Array.isArray(r)) {
      this._isFrozen = !0;
      for (let e = 0, t = r.length; e < t; e++)
        this._color2id[r[e]] = e, this._id2color[e] = r[e];
    } else
      this._isFrozen = !1;
  }
  getId(r) {
    if (r === null)
      return 0;
    r = r.toUpperCase();
    let e = this._color2id[r];
    if (e)
      return e;
    if (this._isFrozen)
      throw new Error(`Missing color in color map - ${r}`);
    return e = ++this._lastColorId, this._color2id[r] = e, this._id2color[e] = r, e;
  }
  getColorMap() {
    return this._id2color.slice(0);
  }
}, Ar = Object.freeze([]), Re = class bt {
  scopeDepth;
  parentScopes;
  fontStyle;
  foreground;
  background;
  constructor(e, t, n, i, s) {
    this.scopeDepth = e, this.parentScopes = t || Ar, this.fontStyle = n, this.foreground = i, this.background = s;
  }
  clone() {
    return new bt(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
  }
  static cloneArr(e) {
    let t = [];
    for (let n = 0, i = e.length; n < i; n++)
      t[n] = e[n].clone();
    return t;
  }
  acceptOverwrite(e, t, n, i) {
    this.scopeDepth > e ? console.log("how did this happen?") : this.scopeDepth = e, t !== -1 && (this.fontStyle = t), n !== 0 && (this.foreground = n), i !== 0 && (this.background = i);
  }
}, vr = class Te {
  constructor(e, t = [], n = {}) {
    this._mainRule = e, this._children = n, this._rulesWithParentScopes = t;
  }
  _rulesWithParentScopes;
  static _cmpBySpecificity(e, t) {
    if (e.scopeDepth !== t.scopeDepth)
      return t.scopeDepth - e.scopeDepth;
    let n = 0, i = 0;
    for (; e.parentScopes[n] === ">" && n++, t.parentScopes[i] === ">" && i++, !(n >= e.parentScopes.length || i >= t.parentScopes.length); ) {
      const s = t.parentScopes[i].length - e.parentScopes[n].length;
      if (s !== 0)
        return s;
      n++, i++;
    }
    return t.parentScopes.length - e.parentScopes.length;
  }
  match(e) {
    if (e !== "") {
      let n = e.indexOf("."), i, s;
      if (n === -1 ? (i = e, s = "") : (i = e.substring(0, n), s = e.substring(n + 1)), this._children.hasOwnProperty(i))
        return this._children[i].match(s);
    }
    const t = this._rulesWithParentScopes.concat(this._mainRule);
    return t.sort(Te._cmpBySpecificity), t;
  }
  insert(e, t, n, i, s, o) {
    if (t === "") {
      this._doInsertHere(e, n, i, s, o);
      return;
    }
    let c = t.indexOf("."), a, l;
    c === -1 ? (a = t, l = "") : (a = t.substring(0, c), l = t.substring(c + 1));
    let u;
    this._children.hasOwnProperty(a) ? u = this._children[a] : (u = new Te(this._mainRule.clone(), Re.cloneArr(this._rulesWithParentScopes)), this._children[a] = u), u.insert(e + 1, l, n, i, s, o);
  }
  _doInsertHere(e, t, n, i, s) {
    if (t === null) {
      this._mainRule.acceptOverwrite(e, n, i, s);
      return;
    }
    for (let o = 0, c = this._rulesWithParentScopes.length; o < c; o++) {
      let a = this._rulesWithParentScopes[o];
      if (ft(a.parentScopes, t) === 0) {
        a.acceptOverwrite(e, n, i, s);
        return;
      }
    }
    n === -1 && (n = this._mainRule.fontStyle), i === 0 && (i = this._mainRule.foreground), s === 0 && (s = this._mainRule.background), this._rulesWithParentScopes.push(new Re(e, t, n, i, s));
  }
}, D = class A {
  static toBinaryStr(e) {
    return e.toString(2).padStart(32, "0");
  }
  static print(e) {
    const t = A.getLanguageId(e), n = A.getTokenType(e), i = A.getFontStyle(e), s = A.getForeground(e), o = A.getBackground(e);
    console.log({
      languageId: t,
      tokenType: n,
      fontStyle: i,
      foreground: s,
      background: o
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
  static set(e, t, n, i, s, o, c) {
    let a = A.getLanguageId(e), l = A.getTokenType(e), u = A.containsBalancedBrackets(e) ? 1 : 0, m = A.getFontStyle(e), d = A.getForeground(e), h = A.getBackground(e);
    return t !== 0 && (a = t), n !== 8 && (l = n), i !== null && (u = i ? 1 : 0), s !== -1 && (m = s), o !== 0 && (d = o), c !== 0 && (h = c), (a << 0 | l << 8 | u << 10 | m << 11 | d << 15 | h << 24) >>> 0;
  }
};
function ie(r, e) {
  const t = [], n = Lr(r);
  let i = n.next();
  for (; i !== null; ) {
    let a = 0;
    if (i.length === 2 && i.charAt(1) === ":") {
      switch (i.charAt(0)) {
        case "R":
          a = 1;
          break;
        case "L":
          a = -1;
          break;
        default:
          console.log(`Unknown priority ${i} in scope selector`);
      }
      i = n.next();
    }
    let l = o();
    if (t.push({ matcher: l, priority: a }), i !== ",")
      break;
    i = n.next();
  }
  return t;
  function s() {
    if (i === "-") {
      i = n.next();
      const a = s();
      return (l) => !!a && !a(l);
    }
    if (i === "(") {
      i = n.next();
      const a = c();
      return i === ")" && (i = n.next()), a;
    }
    if (Ve(i)) {
      const a = [];
      do
        a.push(i), i = n.next();
      while (Ve(i));
      return (l) => e(a, l);
    }
    return null;
  }
  function o() {
    const a = [];
    let l = s();
    for (; l; )
      a.push(l), l = s();
    return (u) => a.every((m) => m(u));
  }
  function c() {
    const a = [];
    let l = o();
    for (; l && (a.push(l), i === "|" || i === ","); ) {
      do
        i = n.next();
      while (i === "|" || i === ",");
      l = o();
    }
    return (u) => a.some((m) => m(u));
  }
}
function Ve(r) {
  return !!r && !!r.match(/[\w\.:]+/);
}
function Lr(r) {
  let e = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g, t = e.exec(r);
  return {
    next: () => {
      if (!t)
        return null;
      const n = t[0];
      return t = e.exec(r), n;
    }
  };
}
function St(r) {
  typeof r.dispose == "function" && r.dispose();
}
var q = class {
  constructor(r) {
    this.scopeName = r;
  }
  toKey() {
    return this.scopeName;
  }
}, Pr = class {
  constructor(r, e) {
    this.scopeName = r, this.ruleName = e;
  }
  toKey() {
    return `${this.scopeName}#${this.ruleName}`;
  }
}, Er = class {
  _references = [];
  _seenReferenceKeys = /* @__PURE__ */ new Set();
  get references() {
    return this._references;
  }
  visitedRule = /* @__PURE__ */ new Set();
  add(r) {
    const e = r.toKey();
    this._seenReferenceKeys.has(e) || (this._seenReferenceKeys.add(e), this._references.push(r));
  }
}, Ir = class {
  constructor(r, e) {
    this.repo = r, this.initialScopeName = e, this.seenFullScopeRequests.add(this.initialScopeName), this.Q = [new q(this.initialScopeName)];
  }
  seenFullScopeRequests = /* @__PURE__ */ new Set();
  seenPartialScopeRequests = /* @__PURE__ */ new Set();
  Q;
  processQueue() {
    const r = this.Q;
    this.Q = [];
    const e = new Er();
    for (const t of r)
      xr(t, this.initialScopeName, this.repo, e);
    for (const t of e.references)
      if (t instanceof q) {
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
function xr(r, e, t, n) {
  const i = t.lookup(r.scopeName);
  if (!i) {
    if (r.scopeName === e)
      throw new Error(`No grammar provided for <${e}>`);
    return;
  }
  const s = t.lookup(e);
  r instanceof q ? re({ baseGrammar: s, selfGrammar: i }, n) : Ae(
    r.ruleName,
    { baseGrammar: s, selfGrammar: i, repository: i.repository },
    n
  );
  const o = t.injections(r.scopeName);
  if (o)
    for (const c of o)
      n.add(new q(c));
}
function Ae(r, e, t) {
  if (e.repository && e.repository[r]) {
    const n = e.repository[r];
    se([n], e, t);
  }
}
function re(r, e) {
  r.selfGrammar.patterns && Array.isArray(r.selfGrammar.patterns) && se(
    r.selfGrammar.patterns,
    { ...r, repository: r.selfGrammar.repository },
    e
  ), r.selfGrammar.injections && se(
    Object.values(r.selfGrammar.injections),
    { ...r, repository: r.selfGrammar.repository },
    e
  );
}
function se(r, e, t) {
  for (const n of r) {
    if (t.visitedRule.has(n))
      continue;
    t.visitedRule.add(n);
    const i = n.repository ? ht({}, e.repository, n.repository) : e.repository;
    Array.isArray(n.patterns) && se(n.patterns, { ...e, repository: i }, t);
    const s = n.include;
    if (!s)
      continue;
    const o = wt(s);
    switch (o.kind) {
      case 0:
        re({ ...e, selfGrammar: e.baseGrammar }, t);
        break;
      case 1:
        re(e, t);
        break;
      case 2:
        Ae(o.ruleName, { ...e, repository: i }, t);
        break;
      case 3:
      case 4:
        const c = o.scopeName === e.selfGrammar.scopeName ? e.selfGrammar : o.scopeName === e.baseGrammar.scopeName ? e.baseGrammar : void 0;
        if (c) {
          const a = { baseGrammar: e.baseGrammar, selfGrammar: c, repository: i };
          o.kind === 4 ? Ae(o.ruleName, a, t) : re(a, t);
        } else
          o.kind === 4 ? t.add(new Pr(o.scopeName, o.ruleName)) : t.add(new q(o.scopeName));
        break;
    }
  }
}
var Or = class {
  kind = 0;
}, Gr = class {
  kind = 1;
}, Mr = class {
  constructor(r) {
    this.ruleName = r;
  }
  kind = 2;
}, Br = class {
  constructor(r) {
    this.scopeName = r;
  }
  kind = 3;
}, jr = class {
  constructor(r, e) {
    this.scopeName = r, this.ruleName = e;
  }
  kind = 4;
};
function wt(r) {
  if (r === "$base")
    return new Or();
  if (r === "$self")
    return new Gr();
  const e = r.indexOf("#");
  if (e === -1)
    return new Br(r);
  if (e === 0)
    return new Mr(r.substring(1));
  {
    const t = r.substring(0, e), n = r.substring(e + 1);
    return new jr(t, n);
  }
}
var $r = /\\(\d+)/, Je = /\\(\d+)/g, Dr = -1, Ct = -2;
var Q = class {
  $location;
  id;
  _nameIsCapturing;
  _name;
  _contentNameIsCapturing;
  _contentName;
  constructor(r, e, t, n) {
    this.$location = r, this.id = e, this._name = t || null, this._nameIsCapturing = Y.hasCaptures(this._name), this._contentName = n || null, this._contentNameIsCapturing = Y.hasCaptures(this._contentName);
  }
  get debugName() {
    const r = this.$location ? `${pt(this.$location.filename)}:${this.$location.line}` : "unknown";
    return `${this.constructor.name}#${this.id} @ ${r}`;
  }
  getName(r, e) {
    return !this._nameIsCapturing || this._name === null || r === null || e === null ? this._name : Y.replaceCaptures(this._name, r, e);
  }
  getContentName(r, e) {
    return !this._contentNameIsCapturing || this._contentName === null ? this._contentName : Y.replaceCaptures(this._contentName, r, e);
  }
}, Fr = class extends Q {
  retokenizeCapturedWithRuleId;
  constructor(r, e, t, n, i) {
    super(r, e, t, n), this.retokenizeCapturedWithRuleId = i;
  }
  dispose() {
  }
  collectPatterns(r, e) {
    throw new Error("Not supported!");
  }
  compile(r, e) {
    throw new Error("Not supported!");
  }
  compileAG(r, e, t, n) {
    throw new Error("Not supported!");
  }
}, Wr = class extends Q {
  _match;
  captures;
  _cachedCompiledPatterns;
  constructor(r, e, t, n, i) {
    super(r, e, t, null), this._match = new z(n, this.id), this.captures = i, this._cachedCompiledPatterns = null;
  }
  dispose() {
    this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
  }
  get debugMatchRegExp() {
    return `${this._match.source}`;
  }
  collectPatterns(r, e) {
    e.push(this._match);
  }
  compile(r, e) {
    return this._getCachedCompiledPatterns(r).compile(r);
  }
  compileAG(r, e, t, n) {
    return this._getCachedCompiledPatterns(r).compileAG(r, t, n);
  }
  _getCachedCompiledPatterns(r) {
    return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new V(), this.collectPatterns(r, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
  }
}, Ke = class extends Q {
  hasMissingPatterns;
  patterns;
  _cachedCompiledPatterns;
  constructor(r, e, t, n, i) {
    super(r, e, t, n), this.patterns = i.patterns, this.hasMissingPatterns = i.hasMissingPatterns, this._cachedCompiledPatterns = null;
  }
  dispose() {
    this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
  }
  collectPatterns(r, e) {
    for (const t of this.patterns)
      r.getRule(t).collectPatterns(r, e);
  }
  compile(r, e) {
    return this._getCachedCompiledPatterns(r).compile(r);
  }
  compileAG(r, e, t, n) {
    return this._getCachedCompiledPatterns(r).compileAG(r, t, n);
  }
  _getCachedCompiledPatterns(r) {
    return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new V(), this.collectPatterns(r, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
  }
}, ve = class extends Q {
  _begin;
  beginCaptures;
  _end;
  endHasBackReferences;
  endCaptures;
  applyEndPatternLast;
  hasMissingPatterns;
  patterns;
  _cachedCompiledPatterns;
  constructor(r, e, t, n, i, s, o, c, a, l) {
    super(r, e, t, n), this._begin = new z(i, this.id), this.beginCaptures = s, this._end = new z(o || "￿", -1), this.endHasBackReferences = this._end.hasBackReferences, this.endCaptures = c, this.applyEndPatternLast = a || !1, this.patterns = l.patterns, this.hasMissingPatterns = l.hasMissingPatterns, this._cachedCompiledPatterns = null;
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
  getEndWithResolvedBackReferences(r, e) {
    return this._end.resolveBackReferences(r, e);
  }
  collectPatterns(r, e) {
    e.push(this._begin);
  }
  compile(r, e) {
    return this._getCachedCompiledPatterns(r, e).compile(r);
  }
  compileAG(r, e, t, n) {
    return this._getCachedCompiledPatterns(r, e).compileAG(r, t, n);
  }
  _getCachedCompiledPatterns(r, e) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new V();
      for (const t of this.patterns)
        r.getRule(t).collectPatterns(r, this._cachedCompiledPatterns);
      this.applyEndPatternLast ? this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end) : this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
    }
    return this._end.hasBackReferences && (this.applyEndPatternLast ? this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, e) : this._cachedCompiledPatterns.setSource(0, e)), this._cachedCompiledPatterns;
  }
}, ae = class extends Q {
  _begin;
  beginCaptures;
  whileCaptures;
  _while;
  whileHasBackReferences;
  hasMissingPatterns;
  patterns;
  _cachedCompiledPatterns;
  _cachedCompiledWhilePatterns;
  constructor(r, e, t, n, i, s, o, c, a) {
    super(r, e, t, n), this._begin = new z(i, this.id), this.beginCaptures = s, this.whileCaptures = c, this._while = new z(o, Ct), this.whileHasBackReferences = this._while.hasBackReferences, this.patterns = a.patterns, this.hasMissingPatterns = a.hasMissingPatterns, this._cachedCompiledPatterns = null, this._cachedCompiledWhilePatterns = null;
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
  getWhileWithResolvedBackReferences(r, e) {
    return this._while.resolveBackReferences(r, e);
  }
  collectPatterns(r, e) {
    e.push(this._begin);
  }
  compile(r, e) {
    return this._getCachedCompiledPatterns(r).compile(r);
  }
  compileAG(r, e, t, n) {
    return this._getCachedCompiledPatterns(r).compileAG(r, t, n);
  }
  _getCachedCompiledPatterns(r) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new V();
      for (const e of this.patterns)
        r.getRule(e).collectPatterns(r, this._cachedCompiledPatterns);
    }
    return this._cachedCompiledPatterns;
  }
  compileWhile(r, e) {
    return this._getCachedCompiledWhilePatterns(r, e).compile(r);
  }
  compileWhileAG(r, e, t, n) {
    return this._getCachedCompiledWhilePatterns(r, e).compileAG(r, t, n);
  }
  _getCachedCompiledWhilePatterns(r, e) {
    return this._cachedCompiledWhilePatterns || (this._cachedCompiledWhilePatterns = new V(), this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while)), this._while.hasBackReferences && this._cachedCompiledWhilePatterns.setSource(0, e || "￿"), this._cachedCompiledWhilePatterns;
  }
}, kt = class R {
  static createCaptureRule(e, t, n, i, s) {
    return e.registerRule((o) => new Fr(t, o, n, i, s));
  }
  static getCompiledRuleId(e, t, n) {
    return e.id || t.registerRule((i) => {
      if (e.id = i, e.match)
        return new Wr(
          e.$vscodeTextmateLocation,
          e.id,
          e.name,
          e.match,
          R._compileCaptures(e.captures, t, n)
        );
      if (typeof e.begin > "u") {
        e.repository && (n = ht({}, n, e.repository));
        let s = e.patterns;
        return typeof s > "u" && e.include && (s = [{ include: e.include }]), new Ke(
          e.$vscodeTextmateLocation,
          e.id,
          e.name,
          e.contentName,
          R._compilePatterns(s, t, n)
        );
      }
      return e.while ? new ae(
        e.$vscodeTextmateLocation,
        e.id,
        e.name,
        e.contentName,
        e.begin,
        R._compileCaptures(e.beginCaptures || e.captures, t, n),
        e.while,
        R._compileCaptures(e.whileCaptures || e.captures, t, n),
        R._compilePatterns(e.patterns, t, n)
      ) : new ve(
        e.$vscodeTextmateLocation,
        e.id,
        e.name,
        e.contentName,
        e.begin,
        R._compileCaptures(e.beginCaptures || e.captures, t, n),
        e.end,
        R._compileCaptures(e.endCaptures || e.captures, t, n),
        e.applyEndPatternLast,
        R._compilePatterns(e.patterns, t, n)
      );
    }), e.id;
  }
  static _compileCaptures(e, t, n) {
    let i = [];
    if (e) {
      let s = 0;
      for (const o in e) {
        if (o === "$vscodeTextmateLocation")
          continue;
        const c = parseInt(o, 10);
        c > s && (s = c);
      }
      for (let o = 0; o <= s; o++)
        i[o] = null;
      for (const o in e) {
        if (o === "$vscodeTextmateLocation")
          continue;
        const c = parseInt(o, 10);
        let a = 0;
        e[o].patterns && (a = R.getCompiledRuleId(e[o], t, n)), i[c] = R.createCaptureRule(t, e[o].$vscodeTextmateLocation, e[o].name, e[o].contentName, a);
      }
    }
    return i;
  }
  static _compilePatterns(e, t, n) {
    let i = [];
    if (e)
      for (let s = 0, o = e.length; s < o; s++) {
        const c = e[s];
        let a = -1;
        if (c.include) {
          const l = wt(c.include);
          switch (l.kind) {
            case 0:
            case 1:
              a = R.getCompiledRuleId(n[c.include], t, n);
              break;
            case 2:
              let u = n[l.ruleName];
              u && (a = R.getCompiledRuleId(u, t, n));
              break;
            case 3:
            case 4:
              const m = l.scopeName, d = l.kind === 4 ? l.ruleName : null, h = t.getExternalGrammar(m, n);
              if (h)
                if (d) {
                  let p = h.repository[d];
                  p && (a = R.getCompiledRuleId(p, t, h.repository));
                } else
                  a = R.getCompiledRuleId(h.repository.$self, t, h.repository);
              break;
          }
        } else
          a = R.getCompiledRuleId(c, t, n);
        if (a !== -1) {
          const l = t.getRule(a);
          let u = !1;
          if ((l instanceof Ke || l instanceof ve || l instanceof ae) && l.hasMissingPatterns && l.patterns.length === 0 && (u = !0), u)
            continue;
          i.push(a);
        }
      }
    return {
      patterns: i,
      hasMissingPatterns: (e ? e.length : 0) !== i.length
    };
  }
}, z = class Nt {
  source;
  ruleId;
  hasAnchor;
  hasBackReferences;
  _anchorCache;
  constructor(e, t) {
    if (e && typeof e == "string") {
      const n = e.length;
      let i = 0, s = [], o = !1;
      for (let c = 0; c < n; c++)
        if (e.charAt(c) === "\\" && c + 1 < n) {
          const l = e.charAt(c + 1);
          l === "z" ? (s.push(e.substring(i, c)), s.push("$(?!\\n)(?<!\\n)"), i = c + 2) : (l === "A" || l === "G") && (o = !0), c++;
        }
      this.hasAnchor = o, i === 0 ? this.source = e : (s.push(e.substring(i, n)), this.source = s.join(""));
    } else
      this.hasAnchor = !1, this.source = e;
    this.hasAnchor ? this._anchorCache = this._buildAnchorCache() : this._anchorCache = null, this.ruleId = t, typeof this.source == "string" ? this.hasBackReferences = $r.test(this.source) : this.hasBackReferences = !1;
  }
  clone() {
    return new Nt(this.source, this.ruleId);
  }
  setSource(e) {
    this.source !== e && (this.source = e, this.hasAnchor && (this._anchorCache = this._buildAnchorCache()));
  }
  resolveBackReferences(e, t) {
    if (typeof this.source != "string")
      throw new Error("This method should only be called if the source is a string");
    let n = t.map((i) => e.substring(i.start, i.end));
    return Je.lastIndex = 0, this.source.replace(Je, (i, s) => gt(n[parseInt(s, 10)] || ""));
  }
  _buildAnchorCache() {
    if (typeof this.source != "string")
      throw new Error("This method should only be called if the source is a string");
    let e = [], t = [], n = [], i = [], s, o, c, a;
    for (s = 0, o = this.source.length; s < o; s++)
      c = this.source.charAt(s), e[s] = c, t[s] = c, n[s] = c, i[s] = c, c === "\\" && s + 1 < o && (a = this.source.charAt(s + 1), a === "A" ? (e[s + 1] = "￿", t[s + 1] = "￿", n[s + 1] = "A", i[s + 1] = "A") : a === "G" ? (e[s + 1] = "￿", t[s + 1] = "G", n[s + 1] = "￿", i[s + 1] = "G") : (e[s + 1] = a, t[s + 1] = a, n[s + 1] = a, i[s + 1] = a), s++);
    return {
      A0_G0: e.join(""),
      A0_G1: t.join(""),
      A1_G0: n.join(""),
      A1_G1: i.join("")
    };
  }
  resolveAnchors(e, t) {
    return !this.hasAnchor || !this._anchorCache || typeof this.source != "string" ? this.source : e ? t ? this._anchorCache.A1_G1 : this._anchorCache.A1_G0 : t ? this._anchorCache.A0_G1 : this._anchorCache.A0_G0;
  }
}, V = class {
  _items;
  _hasAnchors;
  _cached;
  _anchorCache;
  constructor() {
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
  push(r) {
    this._items.push(r), this._hasAnchors = this._hasAnchors || r.hasAnchor;
  }
  unshift(r) {
    this._items.unshift(r), this._hasAnchors = this._hasAnchors || r.hasAnchor;
  }
  length() {
    return this._items.length;
  }
  setSource(r, e) {
    this._items[r].source !== e && (this._disposeCaches(), this._items[r].setSource(e));
  }
  compile(r) {
    if (!this._cached) {
      let e = this._items.map((t) => t.source);
      this._cached = new Qe(r, e, this._items.map((t) => t.ruleId));
    }
    return this._cached;
  }
  compileAG(r, e, t) {
    return this._hasAnchors ? e ? t ? (this._anchorCache.A1_G1 || (this._anchorCache.A1_G1 = this._resolveAnchors(r, e, t)), this._anchorCache.A1_G1) : (this._anchorCache.A1_G0 || (this._anchorCache.A1_G0 = this._resolveAnchors(r, e, t)), this._anchorCache.A1_G0) : t ? (this._anchorCache.A0_G1 || (this._anchorCache.A0_G1 = this._resolveAnchors(r, e, t)), this._anchorCache.A0_G1) : (this._anchorCache.A0_G0 || (this._anchorCache.A0_G0 = this._resolveAnchors(r, e, t)), this._anchorCache.A0_G0) : this.compile(r);
  }
  _resolveAnchors(r, e, t) {
    let n = this._items.map((i) => i.resolveAnchors(e, t));
    return new Qe(r, n, this._items.map((i) => i.ruleId));
  }
}, Qe = class {
  constructor(r, e, t) {
    this.regExps = e, this.rules = t, this.scanner = r.createOnigScanner(e);
  }
  scanner;
  dispose() {
    typeof this.scanner.dispose == "function" && this.scanner.dispose();
  }
  toString() {
    const r = [];
    for (let e = 0, t = this.rules.length; e < t; e++)
      r.push("   - " + this.rules[e] + ": " + this.regExps[e]);
    return r.join(`
`);
  }
  findNextMatchSync(r, e, t) {
    const n = this.scanner.findNextMatchSync(r, e, t);
    return n ? {
      ruleId: this.rules[n.index],
      captureIndices: n.captureIndices
    } : null;
  }
}, we = class {
  constructor(r, e) {
    this.languageId = r, this.tokenType = e;
  }
}, Ur = class Le {
  _defaultAttributes;
  _embeddedLanguagesMatcher;
  constructor(e, t) {
    this._defaultAttributes = new we(
      e,
      8
      /* NotSet */
    ), this._embeddedLanguagesMatcher = new Hr(Object.entries(t || {}));
  }
  getDefaultAttributes() {
    return this._defaultAttributes;
  }
  getBasicScopeAttributes(e) {
    return e === null ? Le._NULL_SCOPE_METADATA : this._getBasicScopeAttributes.get(e);
  }
  static _NULL_SCOPE_METADATA = new we(0, 0);
  _getBasicScopeAttributes = new yt((e) => {
    const t = this._scopeToLanguage(e), n = this._toStandardTokenType(e);
    return new we(t, n);
  });
  /**
   * Given a produced TM scope, return the language that token describes or null if unknown.
   * e.g. source.html => html, source.css.embedded.html => css, punctuation.definition.tag.html => null
   */
  _scopeToLanguage(e) {
    return this._embeddedLanguagesMatcher.match(e) || 0;
  }
  _toStandardTokenType(e) {
    const t = e.match(Le.STANDARD_TOKEN_TYPE_REGEXP);
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
  static STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
}, Hr = class {
  values;
  scopesRegExp;
  constructor(r) {
    if (r.length === 0)
      this.values = null, this.scopesRegExp = null;
    else {
      this.values = new Map(r);
      const e = r.map(
        ([t, n]) => gt(t)
      );
      e.sort(), e.reverse(), this.scopesRegExp = new RegExp(
        `^((${e.join(")|(")}))($|\\.)`,
        ""
      );
    }
  }
  match(r) {
    if (!this.scopesRegExp)
      return;
    const e = r.match(this.scopesRegExp);
    if (e)
      return this.values.get(e[1]);
  }
};
typeof process < "u" && process.env.VSCODE_TEXTMATE_DEBUG;
var Xe = class {
  constructor(r, e) {
    this.stack = r, this.stoppedEarly = e;
  }
};
function Rt(r, e, t, n, i, s, o, c) {
  const a = e.content.length;
  let l = !1, u = -1;
  if (o) {
    const h = qr(
      r,
      e,
      t,
      n,
      i,
      s
    );
    i = h.stack, n = h.linePos, t = h.isFirstLine, u = h.anchorPosition;
  }
  const m = Date.now();
  for (; !l; ) {
    if (c !== 0 && Date.now() - m > c)
      return new Xe(i, !0);
    d();
  }
  return new Xe(i, !1);
  function d() {
    const h = zr(
      r,
      e,
      t,
      n,
      i,
      u
    );
    if (!h) {
      s.produce(i, a), l = !0;
      return;
    }
    const p = h.captureIndices, b = h.matchedRuleId, f = p && p.length > 0 ? p[0].end > n : !1;
    if (b === Dr) {
      const y = i.getRule(r);
      s.produce(i, p[0].start), i = i.withContentNameScopesList(i.nameScopesList), U(
        r,
        e,
        t,
        i,
        s,
        y.endCaptures,
        p
      ), s.produce(i, p[0].end);
      const g = i;
      if (i = i.parent, u = g.getAnchorPos(), !f && g.getEnterPos() === n) {
        i = g, s.produce(i, a), l = !0;
        return;
      }
    } else {
      const y = r.getRule(b);
      s.produce(i, p[0].start);
      const g = i, _ = y.getName(e.content, p), w = i.contentNameScopesList.pushAttributed(
        _,
        r
      );
      if (i = i.push(
        b,
        n,
        u,
        p[0].end === a,
        null,
        w,
        w
      ), y instanceof ve) {
        const S = y;
        U(
          r,
          e,
          t,
          i,
          s,
          S.beginCaptures,
          p
        ), s.produce(i, p[0].end), u = p[0].end;
        const v = S.getContentName(
          e.content,
          p
        ), O = w.pushAttributed(
          v,
          r
        );
        if (i = i.withContentNameScopesList(O), S.endHasBackReferences && (i = i.withEndRule(
          S.getEndWithResolvedBackReferences(
            e.content,
            p
          )
        )), !f && g.hasSameRuleAs(i)) {
          i = i.pop(), s.produce(i, a), l = !0;
          return;
        }
      } else if (y instanceof ae) {
        const S = y;
        U(
          r,
          e,
          t,
          i,
          s,
          S.beginCaptures,
          p
        ), s.produce(i, p[0].end), u = p[0].end;
        const v = S.getContentName(
          e.content,
          p
        ), O = w.pushAttributed(
          v,
          r
        );
        if (i = i.withContentNameScopesList(O), S.whileHasBackReferences && (i = i.withEndRule(
          S.getWhileWithResolvedBackReferences(
            e.content,
            p
          )
        )), !f && g.hasSameRuleAs(i)) {
          i = i.pop(), s.produce(i, a), l = !0;
          return;
        }
      } else if (U(
        r,
        e,
        t,
        i,
        s,
        y.captures,
        p
      ), s.produce(i, p[0].end), i = i.pop(), !f) {
        i = i.safePop(), s.produce(i, a), l = !0;
        return;
      }
    }
    p[0].end > n && (n = p[0].end, t = !1);
  }
}
function qr(r, e, t, n, i, s) {
  let o = i.beginRuleCapturedEOL ? 0 : -1;
  const c = [];
  for (let a = i; a; a = a.pop()) {
    const l = a.getRule(r);
    l instanceof ae && c.push({
      rule: l,
      stack: a
    });
  }
  for (let a = c.pop(); a; a = c.pop()) {
    const { ruleScanner: l, findOptions: u } = Kr(a.rule, r, a.stack.endRule, t, n === o), m = l.findNextMatchSync(e, n, u);
    if (m) {
      if (m.ruleId !== Ct) {
        i = a.stack.pop();
        break;
      }
      m.captureIndices && m.captureIndices.length && (s.produce(a.stack, m.captureIndices[0].start), U(r, e, t, a.stack, s, a.rule.whileCaptures, m.captureIndices), s.produce(a.stack, m.captureIndices[0].end), o = m.captureIndices[0].end, m.captureIndices[0].end > n && (n = m.captureIndices[0].end, t = !1));
    } else {
      i = a.stack.pop();
      break;
    }
  }
  return { stack: i, linePos: n, anchorPosition: o, isFirstLine: t };
}
function zr(r, e, t, n, i, s) {
  const o = Vr(r, e, t, n, i, s), c = r.getInjections();
  if (c.length === 0)
    return o;
  const a = Jr(c, r, e, t, n, i, s);
  if (!a)
    return o;
  if (!o)
    return a;
  const l = o.captureIndices[0].start, u = a.captureIndices[0].start;
  return u < l || a.priorityMatch && u === l ? a : o;
}
function Vr(r, e, t, n, i, s) {
  const o = i.getRule(r), { ruleScanner: c, findOptions: a } = Tt(o, r, i.endRule, t, n === s), l = c.findNextMatchSync(e, n, a);
  return l ? {
    captureIndices: l.captureIndices,
    matchedRuleId: l.ruleId
  } : null;
}
function Jr(r, e, t, n, i, s, o) {
  let c = Number.MAX_VALUE, a = null, l, u = 0;
  const m = s.contentNameScopesList.getScopeNames();
  for (let d = 0, h = r.length; d < h; d++) {
    const p = r[d];
    if (!p.matcher(m))
      continue;
    const b = e.getRule(p.ruleId), { ruleScanner: f, findOptions: y } = Tt(b, e, null, n, i === o), g = f.findNextMatchSync(t, i, y);
    if (!g)
      continue;
    const _ = g.captureIndices[0].start;
    if (!(_ >= c) && (c = _, a = g.captureIndices, l = g.ruleId, u = p.priority, c === i))
      break;
  }
  return a ? {
    priorityMatch: u === -1,
    captureIndices: a,
    matchedRuleId: l
  } : null;
}
function Tt(r, e, t, n, i) {
  return {
    ruleScanner: r.compileAG(e, t, n, i),
    findOptions: 0
    /* None */
  };
}
function Kr(r, e, t, n, i) {
  return {
    ruleScanner: r.compileWhileAG(e, t, n, i),
    findOptions: 0
    /* None */
  };
}
function U(r, e, t, n, i, s, o) {
  if (s.length === 0)
    return;
  const c = e.content, a = Math.min(s.length, o.length), l = [], u = o[0].end;
  for (let m = 0; m < a; m++) {
    const d = s[m];
    if (d === null)
      continue;
    const h = o[m];
    if (h.length === 0)
      continue;
    if (h.start > u)
      break;
    for (; l.length > 0 && l[l.length - 1].endPos <= h.start; )
      i.produceFromScopes(l[l.length - 1].scopes, l[l.length - 1].endPos), l.pop();
    if (l.length > 0 ? i.produceFromScopes(l[l.length - 1].scopes, h.start) : i.produce(n, h.start), d.retokenizeCapturedWithRuleId) {
      const b = d.getName(c, o), f = n.contentNameScopesList.pushAttributed(b, r), y = d.getContentName(c, o), g = f.pushAttributed(y, r), _ = n.push(d.retokenizeCapturedWithRuleId, h.start, -1, !1, null, f, g), w = r.createOnigString(c.substring(0, h.end));
      Rt(
        r,
        w,
        t && h.start === 0,
        h.start,
        _,
        i,
        !1,
        /* no time limit */
        0
      ), St(w);
      continue;
    }
    const p = d.getName(c, o);
    if (p !== null) {
      const f = (l.length > 0 ? l[l.length - 1].scopes : n.contentNameScopesList).pushAttributed(p, r);
      l.push(new Qr(f, h.end));
    }
  }
  for (; l.length > 0; )
    i.produceFromScopes(l[l.length - 1].scopes, l[l.length - 1].endPos), l.pop();
}
var Qr = class {
  scopes;
  endPos;
  constructor(r, e) {
    this.scopes = r, this.endPos = e;
  }
};
function Xr(r, e, t, n, i, s, o, c) {
  return new Zr(
    r,
    e,
    t,
    n,
    i,
    s,
    o,
    c
  );
}
function Ye(r, e, t, n, i) {
  const s = ie(e, oe), o = kt.getCompiledRuleId(t, n, i.repository);
  for (const c of s)
    r.push({
      debugSelector: e,
      matcher: c.matcher,
      ruleId: o,
      grammar: i,
      priority: c.priority
    });
}
function oe(r, e) {
  if (e.length < r.length)
    return !1;
  let t = 0;
  return r.every((n) => {
    for (let i = t; i < e.length; i++)
      if (Yr(e[i], n))
        return t = i + 1, !0;
    return !1;
  });
}
function Yr(r, e) {
  if (!r)
    return !1;
  if (r === e)
    return !0;
  const t = e.length;
  return r.length > t && r.substr(0, t) === e && r[t] === ".";
}
var Zr = class {
  constructor(r, e, t, n, i, s, o, c) {
    if (this._rootScopeName = r, this.balancedBracketSelectors = s, this._onigLib = c, this._basicScopeAttributesProvider = new Ur(
      t,
      n
    ), this._rootId = -1, this._lastRuleId = 0, this._ruleId2desc = [null], this._includedGrammars = {}, this._grammarRepository = o, this._grammar = Ze(e, null), this._injections = null, this._tokenTypeMatchers = [], i)
      for (const a of Object.keys(i)) {
        const l = ie(a, oe);
        for (const u of l)
          this._tokenTypeMatchers.push({
            matcher: u.matcher,
            type: i[a]
          });
      }
  }
  _rootId;
  _lastRuleId;
  _ruleId2desc;
  _includedGrammars;
  _grammarRepository;
  _grammar;
  _injections;
  _basicScopeAttributesProvider;
  _tokenTypeMatchers;
  get themeProvider() {
    return this._grammarRepository;
  }
  dispose() {
    for (const r of this._ruleId2desc)
      r && r.dispose();
  }
  createOnigScanner(r) {
    return this._onigLib.createOnigScanner(r);
  }
  createOnigString(r) {
    return this._onigLib.createOnigString(r);
  }
  getMetadataForScope(r) {
    return this._basicScopeAttributesProvider.getBasicScopeAttributes(r);
  }
  _collectInjections() {
    const r = {
      lookup: (i) => i === this._rootScopeName ? this._grammar : this.getExternalGrammar(i),
      injections: (i) => this._grammarRepository.injections(i)
    }, e = [], t = this._rootScopeName, n = r.lookup(t);
    if (n) {
      const i = n.injections;
      if (i)
        for (let o in i)
          Ye(
            e,
            o,
            i[o],
            this,
            n
          );
      const s = this._grammarRepository.injections(t);
      s && s.forEach((o) => {
        const c = this.getExternalGrammar(o);
        if (c) {
          const a = c.injectionSelector;
          a && Ye(
            e,
            a,
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
  registerRule(r) {
    const e = ++this._lastRuleId, t = r(e);
    return this._ruleId2desc[e] = t, t;
  }
  getRule(r) {
    return this._ruleId2desc[r];
  }
  getExternalGrammar(r, e) {
    if (this._includedGrammars[r])
      return this._includedGrammars[r];
    if (this._grammarRepository) {
      const t = this._grammarRepository.lookup(r);
      if (t)
        return this._includedGrammars[r] = Ze(
          t,
          e && e.$base
        ), this._includedGrammars[r];
    }
  }
  tokenizeLine(r, e, t = 0) {
    const n = this._tokenize(r, e, !1, t);
    return {
      tokens: n.lineTokens.getResult(n.ruleStack, n.lineLength),
      ruleStack: n.ruleStack,
      stoppedEarly: n.stoppedEarly
    };
  }
  tokenizeLine2(r, e, t = 0) {
    const n = this._tokenize(r, e, !0, t);
    return {
      tokens: n.lineTokens.getBinaryResult(n.ruleStack, n.lineLength),
      ruleStack: n.ruleStack,
      stoppedEarly: n.stoppedEarly
    };
  }
  _tokenize(r, e, t, n) {
    this._rootId === -1 && (this._rootId = kt.getCompiledRuleId(
      this._grammar.repository.$self,
      this,
      this._grammar.repository
    ), this.getInjections());
    let i;
    if (!e || e === Pe.NULL) {
      i = !0;
      const l = this._basicScopeAttributesProvider.getDefaultAttributes(), u = this.themeProvider.getDefaults(), m = D.set(
        0,
        l.languageId,
        l.tokenType,
        null,
        u.fontStyle,
        u.foregroundId,
        u.backgroundId
      ), d = this.getRule(this._rootId).getName(
        null,
        null
      );
      let h;
      d ? h = H.createRootAndLookUpScopeName(
        d,
        m,
        this
      ) : h = H.createRoot(
        "unknown",
        m
      ), e = new Pe(
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
    r = r + `
`;
    const s = this.createOnigString(r), o = s.content.length, c = new tn(
      t,
      r,
      this._tokenTypeMatchers,
      this.balancedBracketSelectors
    ), a = Rt(
      this,
      s,
      i,
      0,
      e,
      c,
      !0,
      n
    );
    return St(s), {
      lineLength: o,
      lineTokens: c,
      ruleStack: a.stack,
      stoppedEarly: a.stoppedEarly
    };
  }
};
function Ze(r, e) {
  return r = _r(r), r.repository = r.repository || {}, r.repository.$self = {
    $vscodeTextmateLocation: r.$vscodeTextmateLocation,
    patterns: r.patterns,
    name: r.scopeName
  }, r.repository.$base = e || r.repository.$self, r;
}
var H = class P {
  /**
   * Invariant:
   * ```
   * if (parent && !scopePath.extends(parent.scopePath)) {
   * 	throw new Error();
   * }
   * ```
   */
  constructor(e, t, n) {
    this.parent = e, this.scopePath = t, this.tokenAttributes = n;
  }
  static fromExtension(e, t) {
    let n = e, i = e?.scopePath ?? null;
    for (const s of t)
      i = Se.push(i, s.scopeNames), n = new P(n, i, s.encodedTokenAttributes);
    return n;
  }
  static createRoot(e, t) {
    return new P(null, new Se(null, e), t);
  }
  static createRootAndLookUpScopeName(e, t, n) {
    const i = n.getMetadataForScope(e), s = new Se(null, e), o = n.themeProvider.themeMatch(s), c = P.mergeAttributes(
      t,
      i,
      o
    );
    return new P(null, s, c);
  }
  get scopeName() {
    return this.scopePath.scopeName;
  }
  toString() {
    return this.getScopeNames().join(" ");
  }
  equals(e) {
    return P.equals(this, e);
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
  static mergeAttributes(e, t, n) {
    let i = -1, s = 0, o = 0;
    return n !== null && (i = n.fontStyle, s = n.foregroundId, o = n.backgroundId), D.set(
      e,
      t.languageId,
      t.tokenType,
      null,
      i,
      s,
      o
    );
  }
  pushAttributed(e, t) {
    if (e === null)
      return this;
    if (e.indexOf(" ") === -1)
      return P._pushAttributed(this, e, t);
    const n = e.split(/ /g);
    let i = this;
    for (const s of n)
      i = P._pushAttributed(i, s, t);
    return i;
  }
  static _pushAttributed(e, t, n) {
    const i = n.getMetadataForScope(t), s = e.scopePath.push(t), o = n.themeProvider.themeMatch(s), c = P.mergeAttributes(
      e.tokenAttributes,
      i,
      o
    );
    return new P(e, s, c);
  }
  getScopeNames() {
    return this.scopePath.getSegments();
  }
  getExtensionIfDefined(e) {
    const t = [];
    let n = this;
    for (; n && n !== e; )
      t.push({
        encodedTokenAttributes: n.tokenAttributes,
        scopeNames: n.scopePath.getExtensionIfDefined(n.parent?.scopePath ?? null)
      }), n = n.parent;
    return n === e ? t.reverse() : void 0;
  }
}, Pe = class G {
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
  constructor(e, t, n, i, s, o, c, a) {
    this.parent = e, this.ruleId = t, this.beginRuleCapturedEOL = s, this.endRule = o, this.nameScopesList = c, this.contentNameScopesList = a, this.depth = this.parent ? this.parent.depth + 1 : 1, this._enterPos = n, this._anchorPos = i;
  }
  _stackElementBrand = void 0;
  // TODO remove me
  static NULL = new G(
    null,
    0,
    0,
    0,
    !1,
    null,
    null,
    null
  );
  /**
   * The position on the current line where this state was pushed.
   * This is relevant only while tokenizing a line, to detect endless loops.
   * Its value is meaningless across lines.
   */
  _enterPos;
  /**
   * The captured anchor position when this stack element was pushed.
   * This is relevant only while tokenizing a line, to restore the anchor position when popping.
   * Its value is meaningless across lines.
   */
  _anchorPos;
  /**
   * The depth of the stack.
   */
  depth;
  equals(e) {
    return e === null ? !1 : G._equals(this, e);
  }
  static _equals(e, t) {
    return e === t ? !0 : this._structuralEquals(e, t) ? H.equals(e.contentNameScopesList, t.contentNameScopesList) : !1;
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
    G._reset(this);
  }
  pop() {
    return this.parent;
  }
  safePop() {
    return this.parent ? this.parent : this;
  }
  push(e, t, n, i, s, o, c) {
    return new G(
      this,
      e,
      t,
      n,
      i,
      s,
      o,
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
    return this.parent && (t = this.parent._writeString(e, t)), e[t++] = `(${this.ruleId}, ${this.nameScopesList?.toString()}, ${this.contentNameScopesList?.toString()})`, t;
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
    return this.endRule === e ? this : new G(
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
    return {
      ruleId: this.ruleId,
      beginRuleCapturedEOL: this.beginRuleCapturedEOL,
      endRule: this.endRule,
      nameScopesList: this.nameScopesList?.getExtensionIfDefined(this.parent?.nameScopesList ?? null) ?? [],
      contentNameScopesList: this.contentNameScopesList?.getExtensionIfDefined(this.nameScopesList) ?? []
    };
  }
  static pushFrame(e, t) {
    const n = H.fromExtension(e?.nameScopesList ?? null, t.nameScopesList);
    return new G(
      e,
      t.ruleId,
      t.enterPos ?? -1,
      t.anchorPos ?? -1,
      t.beginRuleCapturedEOL,
      t.endRule,
      n,
      H.fromExtension(n, t.contentNameScopesList)
    );
  }
}, en = class {
  balancedBracketScopes;
  unbalancedBracketScopes;
  allowAny = !1;
  constructor(r, e) {
    this.balancedBracketScopes = r.flatMap(
      (t) => t === "*" ? (this.allowAny = !0, []) : ie(t, oe).map((n) => n.matcher)
    ), this.unbalancedBracketScopes = e.flatMap(
      (t) => ie(t, oe).map((n) => n.matcher)
    );
  }
  get matchesAlways() {
    return this.allowAny && this.unbalancedBracketScopes.length === 0;
  }
  get matchesNever() {
    return this.balancedBracketScopes.length === 0 && !this.allowAny;
  }
  match(r) {
    for (const e of this.unbalancedBracketScopes)
      if (e(r))
        return !1;
    for (const e of this.balancedBracketScopes)
      if (e(r))
        return !0;
    return this.allowAny;
  }
}, tn = class {
  constructor(r, e, t, n) {
    this.balancedBracketSelectors = n, this._emitBinaryTokens = r, this._tokenTypeOverrides = t, this._lineText = null, this._tokens = [], this._binaryTokens = [], this._lastTokenEndIndex = 0;
  }
  _emitBinaryTokens;
  /**
   * defined only if `false`.
   */
  _lineText;
  /**
   * used only if `_emitBinaryTokens` is false.
   */
  _tokens;
  /**
   * used only if `_emitBinaryTokens` is true.
   */
  _binaryTokens;
  _lastTokenEndIndex;
  _tokenTypeOverrides;
  produce(r, e) {
    this.produceFromScopes(r.contentNameScopesList, e);
  }
  produceFromScopes(r, e) {
    if (this._lastTokenEndIndex >= e)
      return;
    if (this._emitBinaryTokens) {
      let n = r?.tokenAttributes ?? 0, i = !1;
      if (this.balancedBracketSelectors?.matchesAlways && (i = !0), this._tokenTypeOverrides.length > 0 || this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever) {
        const s = r?.getScopeNames() ?? [];
        for (const o of this._tokenTypeOverrides)
          o.matcher(s) && (n = D.set(
            n,
            0,
            o.type,
            null,
            -1,
            0,
            0
          ));
        this.balancedBracketSelectors && (i = this.balancedBracketSelectors.match(s));
      }
      if (i && (n = D.set(
        n,
        0,
        8,
        i,
        -1,
        0,
        0
      )), this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === n) {
        this._lastTokenEndIndex = e;
        return;
      }
      this._binaryTokens.push(this._lastTokenEndIndex), this._binaryTokens.push(n), this._lastTokenEndIndex = e;
      return;
    }
    const t = r?.getScopeNames() ?? [];
    this._tokens.push({
      startIndex: this._lastTokenEndIndex,
      endIndex: e,
      // value: lineText.substring(lastTokenEndIndex, endIndex),
      scopes: t
    }), this._lastTokenEndIndex = e;
  }
  getResult(r, e) {
    return this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === e - 1 && this._tokens.pop(), this._tokens.length === 0 && (this._lastTokenEndIndex = -1, this.produce(r, e), this._tokens[this._tokens.length - 1].startIndex = 0), this._tokens;
  }
  getBinaryResult(r, e) {
    this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === e - 1 && (this._binaryTokens.pop(), this._binaryTokens.pop()), this._binaryTokens.length === 0 && (this._lastTokenEndIndex = -1, this.produce(r, e), this._binaryTokens[this._binaryTokens.length - 2] = 0);
    const t = new Uint32Array(this._binaryTokens.length);
    for (let n = 0, i = this._binaryTokens.length; n < i; n++)
      t[n] = this._binaryTokens[n];
    return t;
  }
}, rn = class {
  constructor(r, e) {
    this._onigLib = e, this._theme = r;
  }
  _grammars = /* @__PURE__ */ new Map();
  _rawGrammars = /* @__PURE__ */ new Map();
  _injectionGrammars = /* @__PURE__ */ new Map();
  _theme;
  dispose() {
    for (const r of this._grammars.values())
      r.dispose();
  }
  setTheme(r) {
    this._theme = r;
  }
  getColorMap() {
    return this._theme.getColorMap();
  }
  /**
   * Add `grammar` to registry and return a list of referenced scope names
   */
  addGrammar(r, e) {
    this._rawGrammars.set(r.scopeName, r), e && this._injectionGrammars.set(r.scopeName, e);
  }
  /**
   * Lookup a raw grammar.
   */
  lookup(r) {
    return this._rawGrammars.get(r);
  }
  /**
   * Returns the injections for the given grammar
   */
  injections(r) {
    return this._injectionGrammars.get(r);
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
  themeMatch(r) {
    return this._theme.match(r);
  }
  /**
   * Lookup a grammar.
   */
  grammarForScopeName(r, e, t, n, i) {
    if (!this._grammars.has(r)) {
      let s = this._rawGrammars.get(r);
      if (!s)
        return null;
      this._grammars.set(r, Xr(
        r,
        s,
        e,
        t,
        n,
        i,
        this,
        this._onigLib
      ));
    }
    return this._grammars.get(r);
  }
}, nn = class {
  _options;
  _syncRegistry;
  _ensureGrammarCache;
  constructor(e) {
    this._options = e, this._syncRegistry = new rn(
      ne.createFromRawTheme(e.theme, e.colorMap),
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
    this._syncRegistry.setTheme(ne.createFromRawTheme(e, t));
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
  loadGrammarWithEmbeddedLanguages(e, t, n) {
    return this.loadGrammarWithConfiguration(e, t, { embeddedLanguages: n });
  }
  /**
   * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
   * Please do not use language id 0.
   */
  loadGrammarWithConfiguration(e, t, n) {
    return this._loadGrammar(
      e,
      t,
      n.embeddedLanguages,
      n.tokenTypes,
      new en(
        n.balancedBracketSelectors || [],
        n.unbalancedBracketSelectors || []
      )
    );
  }
  /**
   * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
   */
  loadGrammar(e) {
    return this._loadGrammar(e, 0, null, null, null);
  }
  _loadGrammar(e, t, n, i, s) {
    const o = new Ir(this._syncRegistry, e);
    for (; o.Q.length > 0; )
      o.Q.map((c) => this._loadSingleGrammar(c.scopeName)), o.processQueue();
    return this._grammarForScopeName(
      e,
      t,
      n,
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
      const n = typeof this._options.getInjections == "function" ? this._options.getInjections(e) : void 0;
      this._syncRegistry.addGrammar(t, n);
    }
  }
  /**
   * Adds a rawGrammar.
   */
  addGrammar(e, t = [], n = 0, i = null) {
    return this._syncRegistry.addGrammar(e, t), this._grammarForScopeName(e.scopeName, n, i);
  }
  /**
   * Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `addGrammar`.
   */
  _grammarForScopeName(e, t = 0, n = null, i = null, s = null) {
    return this._syncRegistry.grammarForScopeName(
      e,
      t,
      n,
      i,
      s
    );
  }
}, Ee = Pe.NULL;
const sn = [
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
], an = /["&'<>`]/g, on = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g, cn = (
  // eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
  /[\x01-\t\v\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g
), ln = /[|\\{}()[\]^$+*?.]/g, et = /* @__PURE__ */ new WeakMap();
function un(r, e) {
  if (r = r.replace(
    e.subset ? mn(e.subset) : an,
    n
  ), e.subset || e.escapeOnly)
    return r;
  return r.replace(on, t).replace(cn, n);
  function t(i, s, o) {
    return e.format(
      (i.charCodeAt(0) - 55296) * 1024 + i.charCodeAt(1) - 56320 + 65536,
      o.charCodeAt(s + 2),
      e
    );
  }
  function n(i, s, o) {
    return e.format(
      i.charCodeAt(0),
      o.charCodeAt(s + 1),
      e
    );
  }
}
function mn(r) {
  let e = et.get(r);
  return e || (e = hn(r), et.set(r, e)), e;
}
function hn(r) {
  const e = [];
  let t = -1;
  for (; ++t < r.length; )
    e.push(r[t].replace(ln, "\\$&"));
  return new RegExp("(?:" + e.join("|") + ")", "g");
}
const pn = /[\dA-Fa-f]/;
function dn(r, e, t) {
  const n = "&#x" + r.toString(16).toUpperCase();
  return t && e && !pn.test(String.fromCharCode(e)) ? n : n + ";";
}
const fn = /\d/;
function gn(r, e, t) {
  const n = "&#" + String(r);
  return t && e && !fn.test(String.fromCharCode(e)) ? n : n + ";";
}
const yn = [
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
], Ce = {
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
}, _n = [
  "cent",
  "copy",
  "divide",
  "gt",
  "lt",
  "not",
  "para",
  "times"
], At = {}.hasOwnProperty, Ie = {};
let Z;
for (Z in Ce)
  At.call(Ce, Z) && (Ie[Ce[Z]] = Z);
const bn = /[^\dA-Za-z]/;
function Sn(r, e, t, n) {
  const i = String.fromCharCode(r);
  if (At.call(Ie, i)) {
    const s = Ie[i], o = "&" + s;
    return t && yn.includes(s) && !_n.includes(s) && (!n || e && e !== 61 && bn.test(String.fromCharCode(e))) ? o : o + ";";
  }
  return "";
}
function wn(r, e, t) {
  let n = dn(r, e, t.omitOptionalSemicolons), i;
  if ((t.useNamedReferences || t.useShortestReferences) && (i = Sn(
    r,
    e,
    t.omitOptionalSemicolons,
    t.attribute
  )), (t.useShortestReferences || !i) && t.useShortestReferences) {
    const s = gn(r, e, t.omitOptionalSemicolons);
    s.length < n.length && (n = s);
  }
  return i && (!t.useShortestReferences || i.length < n.length) ? i : n;
}
function $(r, e) {
  return un(r, Object.assign({ format: wn }, e));
}
const Cn = /^>|^->|<!--|-->|--!>|<!-$/g, kn = [">"], Nn = ["<", ">"];
function Rn(r, e, t, n) {
  return n.settings.bogusComments ? "<?" + $(
    r.value,
    Object.assign({}, n.settings.characterReferences, {
      subset: kn
    })
  ) + ">" : "<!--" + r.value.replace(Cn, i) + "-->";
  function i(s) {
    return $(
      s,
      Object.assign({}, n.settings.characterReferences, {
        subset: Nn
      })
    );
  }
}
function Tn(r, e, t, n) {
  return "<!" + (n.settings.upperDoctype ? "DOCTYPE" : "doctype") + (n.settings.tightDoctype ? "" : " ") + "html>";
}
const k = Lt(1), vt = Lt(-1), An = [];
function Lt(r) {
  return e;
  function e(t, n, i) {
    const s = t ? t.children : An;
    let o = (n || 0) + r, c = s[o];
    if (!i)
      for (; c && xe(c); )
        o += r, c = s[o];
    return c;
  }
}
const vn = {}.hasOwnProperty;
function Pt(r) {
  return e;
  function e(t, n, i) {
    return vn.call(r, t.tagName) && r[t.tagName](t, n, i);
  }
}
const Me = Pt({
  body: Pn,
  caption: ke,
  colgroup: ke,
  dd: On,
  dt: xn,
  head: ke,
  html: Ln,
  li: In,
  optgroup: Gn,
  option: Mn,
  p: En,
  rp: tt,
  rt: tt,
  tbody: jn,
  td: rt,
  tfoot: $n,
  th: rt,
  thead: Bn,
  tr: Dn
});
function ke(r, e, t) {
  const n = k(t, e, !0);
  return !n || n.type !== "comment" && !(n.type === "text" && xe(n.value.charAt(0)));
}
function Ln(r, e, t) {
  const n = k(t, e);
  return !n || n.type !== "comment";
}
function Pn(r, e, t) {
  const n = k(t, e);
  return !n || n.type !== "comment";
}
function En(r, e, t) {
  const n = k(t, e);
  return n ? n.type === "element" && (n.tagName === "address" || n.tagName === "article" || n.tagName === "aside" || n.tagName === "blockquote" || n.tagName === "details" || n.tagName === "div" || n.tagName === "dl" || n.tagName === "fieldset" || n.tagName === "figcaption" || n.tagName === "figure" || n.tagName === "footer" || n.tagName === "form" || n.tagName === "h1" || n.tagName === "h2" || n.tagName === "h3" || n.tagName === "h4" || n.tagName === "h5" || n.tagName === "h6" || n.tagName === "header" || n.tagName === "hgroup" || n.tagName === "hr" || n.tagName === "main" || n.tagName === "menu" || n.tagName === "nav" || n.tagName === "ol" || n.tagName === "p" || n.tagName === "pre" || n.tagName === "section" || n.tagName === "table" || n.tagName === "ul") : !t || // Confusing parent.
  !(t.type === "element" && (t.tagName === "a" || t.tagName === "audio" || t.tagName === "del" || t.tagName === "ins" || t.tagName === "map" || t.tagName === "noscript" || t.tagName === "video"));
}
function In(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && n.tagName === "li";
}
function xn(r, e, t) {
  const n = k(t, e);
  return !!(n && n.type === "element" && (n.tagName === "dt" || n.tagName === "dd"));
}
function On(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && (n.tagName === "dt" || n.tagName === "dd");
}
function tt(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && (n.tagName === "rp" || n.tagName === "rt");
}
function Gn(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && n.tagName === "optgroup";
}
function Mn(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && (n.tagName === "option" || n.tagName === "optgroup");
}
function Bn(r, e, t) {
  const n = k(t, e);
  return !!(n && n.type === "element" && (n.tagName === "tbody" || n.tagName === "tfoot"));
}
function jn(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && (n.tagName === "tbody" || n.tagName === "tfoot");
}
function $n(r, e, t) {
  return !k(t, e);
}
function Dn(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && n.tagName === "tr";
}
function rt(r, e, t) {
  const n = k(t, e);
  return !n || n.type === "element" && (n.tagName === "td" || n.tagName === "th");
}
const Fn = Pt({
  body: Hn,
  colgroup: qn,
  head: Un,
  html: Wn,
  tbody: zn
});
function Wn(r) {
  const e = k(r, -1);
  return !e || e.type !== "comment";
}
function Un(r) {
  const e = /* @__PURE__ */ new Set();
  for (const n of r.children)
    if (n.type === "element" && (n.tagName === "base" || n.tagName === "title")) {
      if (e.has(n.tagName)) return !1;
      e.add(n.tagName);
    }
  const t = r.children[0];
  return !t || t.type === "element";
}
function Hn(r) {
  const e = k(r, -1, !0);
  return !e || e.type !== "comment" && !(e.type === "text" && xe(e.value.charAt(0))) && !(e.type === "element" && (e.tagName === "meta" || e.tagName === "link" || e.tagName === "script" || e.tagName === "style" || e.tagName === "template"));
}
function qn(r, e, t) {
  const n = vt(t, e), i = k(r, -1, !0);
  return t && n && n.type === "element" && n.tagName === "colgroup" && Me(n, t.children.indexOf(n), t) ? !1 : !!(i && i.type === "element" && i.tagName === "col");
}
function zn(r, e, t) {
  const n = vt(t, e), i = k(r, -1);
  return t && n && n.type === "element" && (n.tagName === "thead" || n.tagName === "tbody") && Me(n, t.children.indexOf(n), t) ? !1 : !!(i && i.type === "element" && i.tagName === "tr");
}
const ee = {
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
function Vn(r, e, t, n) {
  const i = n.schema, s = i.space === "svg" ? !1 : n.settings.omitOptionalTags;
  let o = i.space === "svg" ? n.settings.closeEmptyElements : n.settings.voids.includes(r.tagName.toLowerCase());
  const c = [];
  let a;
  i.space === "html" && r.tagName === "svg" && (n.schema = lt);
  const l = Jn(n, r.properties), u = n.all(
    i.space === "html" && r.tagName === "template" ? r.content : r
  );
  return n.schema = i, u && (o = !1), (l || !s || !Fn(r, e, t)) && (c.push("<", r.tagName, l ? " " + l : ""), o && (i.space === "svg" || n.settings.closeSelfClosing) && (a = l.charAt(l.length - 1), (!n.settings.tightSelfClosing || a === "/" || a && a !== '"' && a !== "'") && c.push(" "), c.push("/")), c.push(">")), c.push(u), !o && (!s || !Me(r, e, t)) && c.push("</" + r.tagName + ">"), c.join("");
}
function Jn(r, e) {
  const t = [];
  let n = -1, i;
  if (e) {
    for (i in e)
      if (e[i] !== null && e[i] !== void 0) {
        const s = Kn(r, i, e[i]);
        s && t.push(s);
      }
  }
  for (; ++n < t.length; ) {
    const s = r.settings.tightAttributes ? t[n].charAt(t[n].length - 1) : void 0;
    n !== t.length - 1 && s !== '"' && s !== "'" && (t[n] += " ");
  }
  return t.join("");
}
function Kn(r, e, t) {
  const n = Ht(r.schema, e), i = r.settings.allowParseErrors && r.schema.space === "html" ? 0 : 1, s = r.settings.allowDangerousCharacters ? 0 : 1;
  let o = r.quote, c;
  if (n.overloadedBoolean && (t === n.attribute || t === "") ? t = !0 : (n.boolean || n.overloadedBoolean) && (typeof t != "string" || t === n.attribute || t === "") && (t = !!t), t == null || t === !1 || typeof t == "number" && Number.isNaN(t))
    return "";
  const a = $(
    n.attribute,
    Object.assign({}, r.settings.characterReferences, {
      // Always encode without parse errors in non-HTML.
      subset: ee.name[i][s]
    })
  );
  return t === !0 || (t = Array.isArray(t) ? (n.commaSeparated ? qt : zt)(t, {
    padLeft: !r.settings.tightCommaSeparatedLists
  }) : String(t), r.settings.collapseEmptyAttributes && !t) ? a : (r.settings.preferUnquoted && (c = $(
    t,
    Object.assign({}, r.settings.characterReferences, {
      attribute: !0,
      subset: ee.unquoted[i][s]
    })
  )), c !== t && (r.settings.quoteSmart && He(t, o) > He(t, r.alternative) && (o = r.alternative), c = o + $(
    t,
    Object.assign({}, r.settings.characterReferences, {
      // Always encode without parse errors in non-HTML.
      subset: (o === "'" ? ee.single : ee.double)[i][s],
      attribute: !0
    })
  ) + o), a + (c && "=" + c));
}
const Qn = ["<", "&"];
function Et(r, e, t, n) {
  return t && t.type === "element" && (t.tagName === "script" || t.tagName === "style") ? r.value : $(
    r.value,
    Object.assign({}, n.settings.characterReferences, {
      subset: Qn
    })
  );
}
function Xn(r, e, t, n) {
  return n.settings.allowDangerousHtml ? r.value : Et(r, e, t, n);
}
function Yn(r, e, t, n) {
  return n.all(r);
}
const Zn = Jt("type", {
  invalid: ei,
  unknown: ti,
  handlers: { comment: Rn, doctype: Tn, element: Vn, raw: Xn, root: Yn, text: Et }
});
function ei(r) {
  throw new Error("Expected node, not `" + r + "`");
}
function ti(r) {
  const e = (
    /** @type {Nodes} */
    r
  );
  throw new Error("Cannot compile unknown node `" + e.type + "`");
}
const ri = {}, ni = {}, ii = [];
function si(r, e) {
  const t = ri, n = t.quote || '"', i = n === '"' ? "'" : '"';
  if (n !== '"' && n !== "'")
    throw new Error("Invalid quote `" + n + "`, expected `'` or `\"`");
  return {
    one: ai,
    all: oi,
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
      voids: t.voids || sn,
      characterReferences: t.characterReferences || ni,
      closeSelfClosing: t.closeSelfClosing || !1,
      closeEmptyElements: t.closeEmptyElements || !1
    },
    schema: t.space === "svg" ? lt : Vt,
    quote: n,
    alternative: i
  }.one(
    Array.isArray(r) ? { type: "root", children: r } : r,
    void 0,
    void 0
  );
}
function ai(r, e, t) {
  return Zn(r, e, t, this);
}
function oi(r) {
  const e = [], t = r && r.children || ii;
  let n = -1;
  for (; ++n < t.length; )
    e[n] = this.one(t[n], n, r);
  return e.join("");
}
function ci(r) {
  return Array.isArray(r) ? r : [r];
}
function de(r, e = !1) {
  const t = r.split(/(\r?\n)/g);
  let n = 0;
  const i = [];
  for (let s = 0; s < t.length; s += 2) {
    const o = e ? t[s] + (t[s + 1] || "") : t[s];
    i.push([o, n]), n += t[s].length, n += t[s + 1]?.length || 0;
  }
  return i;
}
function Be(r) {
  return !r || ["plaintext", "txt", "text", "plain"].includes(r);
}
function It(r) {
  return r === "ansi" || Be(r);
}
function je(r) {
  return r === "none";
}
function xt(r) {
  return je(r);
}
function Ot(r, e) {
  if (!e)
    return r;
  r.properties ||= {}, r.properties.class ||= [], typeof r.properties.class == "string" && (r.properties.class = r.properties.class.split(/\s+/g)), Array.isArray(r.properties.class) || (r.properties.class = []);
  const t = Array.isArray(e) ? e : e.split(/\s+/g);
  for (const n of t)
    n && !r.properties.class.includes(n) && r.properties.class.push(n);
  return r;
}
function li(r, e) {
  let t = 0;
  const n = [];
  for (const i of e)
    i > t && n.push({
      ...r,
      content: r.content.slice(t, i),
      offset: r.offset + t
    }), t = i;
  return t < r.content.length && n.push({
    ...r,
    content: r.content.slice(t),
    offset: r.offset + t
  }), n;
}
function ui(r, e) {
  const t = Array.from(e instanceof Set ? e : new Set(e)).sort((n, i) => n - i);
  return t.length ? r.map((n) => n.flatMap((i) => {
    const s = t.filter((o) => i.offset < o && o < i.offset + i.content.length).map((o) => o - i.offset).sort((o, c) => o - c);
    return s.length ? li(i, s) : i;
  })) : r;
}
async function Gt(r) {
  return Promise.resolve(typeof r == "function" ? r() : r).then((e) => e.default || e);
}
function ce(r, e) {
  const t = typeof r == "string" ? {} : { ...r.colorReplacements }, n = typeof r == "string" ? r : r.name;
  for (const [i, s] of Object.entries(e?.colorReplacements || {}))
    typeof s == "string" ? t[i] = s : i === n && Object.assign(t, s);
  return t;
}
function M(r, e) {
  return r && (e?.[r?.toLowerCase()] || r);
}
function Mt(r) {
  const e = {};
  return r.color && (e.color = r.color), r.bgColor && (e["background-color"] = r.bgColor), r.fontStyle && (r.fontStyle & I.Italic && (e["font-style"] = "italic"), r.fontStyle & I.Bold && (e["font-weight"] = "bold"), r.fontStyle & I.Underline && (e["text-decoration"] = "underline")), e;
}
function mi(r) {
  return typeof r == "string" ? r : Object.entries(r).map(([e, t]) => `${e}:${t}`).join(";");
}
function hi(r) {
  const e = de(r, !0).map(([i]) => i);
  function t(i) {
    if (i === r.length)
      return {
        line: e.length - 1,
        character: e[e.length - 1].length
      };
    let s = i, o = 0;
    for (const c of e) {
      if (s < c.length)
        break;
      s -= c.length, o++;
    }
    return { line: o, character: s };
  }
  function n(i, s) {
    let o = 0;
    for (let c = 0; c < i; c++)
      o += e[c].length;
    return o += s, o;
  }
  return {
    lines: e,
    indexToPos: t,
    posToIndex: n
  };
}
class T extends Error {
  constructor(e) {
    super(e), this.name = "ShikiError";
  }
}
const Bt = /* @__PURE__ */ new WeakMap();
function fe(r, e) {
  Bt.set(r, e);
}
function J(r) {
  return Bt.get(r);
}
class F {
  /**
   * Theme to Stack mapping
   */
  _stacks = {};
  lang;
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
    return new F(
      Object.fromEntries(ci(t).map((n) => [n, Ee])),
      e
    );
  }
  constructor(...e) {
    if (e.length === 2) {
      const [t, n] = e;
      this.lang = n, this._stacks = t;
    } else {
      const [t, n, i] = e;
      this.lang = n, this._stacks = { [i]: t };
    }
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
    return nt(this._stacks[this.theme]);
  }
  getScopes(e = this.theme) {
    return nt(this._stacks[e]);
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
function nt(r) {
  const e = [], t = /* @__PURE__ */ new Set();
  function n(i) {
    if (t.has(i))
      return;
    t.add(i);
    const s = i?.nameScopesList?.scopeName;
    s && e.push(s), i.parent && n(i.parent);
  }
  return n(r), e;
}
function pi(r, e) {
  if (!(r instanceof F))
    throw new T("Invalid grammar state");
  return r.getInternalStack(e);
}
function di() {
  const r = /* @__PURE__ */ new WeakMap();
  function e(t) {
    if (!r.has(t.meta)) {
      let n = function(o) {
        if (typeof o == "number") {
          if (o < 0 || o > t.source.length)
            throw new T(`Invalid decoration offset: ${o}. Code length: ${t.source.length}`);
          return {
            ...i.indexToPos(o),
            offset: o
          };
        } else {
          const c = i.lines[o.line];
          if (c === void 0)
            throw new T(`Invalid decoration position ${JSON.stringify(o)}. Lines length: ${i.lines.length}`);
          if (o.character < 0 || o.character > c.length)
            throw new T(`Invalid decoration position ${JSON.stringify(o)}. Line ${o.line} length: ${c.length}`);
          return {
            ...o,
            offset: i.posToIndex(o.line, o.character)
          };
        }
      };
      const i = hi(t.source), s = (t.options.decorations || []).map((o) => ({
        ...o,
        start: n(o.start),
        end: n(o.end)
      }));
      fi(s), r.set(t.meta, {
        decorations: s,
        converter: i,
        source: t.source
      });
    }
    return r.get(t.meta);
  }
  return {
    name: "shiki:decorations",
    tokens(t) {
      if (!this.options.decorations?.length)
        return;
      const i = e(this).decorations.flatMap((o) => [o.start.offset, o.end.offset]);
      return ui(t, i);
    },
    code(t) {
      if (!this.options.decorations?.length)
        return;
      const n = e(this), i = Array.from(t.children).filter((u) => u.type === "element" && u.tagName === "span");
      if (i.length !== n.converter.lines.length)
        throw new T(`Number of lines in code element (${i.length}) does not match the number of lines in the source (${n.converter.lines.length}). Failed to apply decorations.`);
      function s(u, m, d, h) {
        const p = i[u];
        let b = "", f = -1, y = -1;
        if (m === 0 && (f = 0), d === 0 && (y = 0), d === Number.POSITIVE_INFINITY && (y = p.children.length), f === -1 || y === -1)
          for (let _ = 0; _ < p.children.length; _++)
            b += jt(p.children[_]), f === -1 && b.length === m && (f = _ + 1), y === -1 && b.length === d && (y = _ + 1);
        if (f === -1)
          throw new T(`Failed to find start index for decoration ${JSON.stringify(h.start)}`);
        if (y === -1)
          throw new T(`Failed to find end index for decoration ${JSON.stringify(h.end)}`);
        const g = p.children.slice(f, y);
        if (!h.alwaysWrap && g.length === p.children.length)
          c(p, h, "line");
        else if (!h.alwaysWrap && g.length === 1 && g[0].type === "element")
          c(g[0], h, "token");
        else {
          const _ = {
            type: "element",
            tagName: "span",
            properties: {},
            children: g
          };
          c(_, h, "wrapper"), p.children.splice(f, g.length, _);
        }
      }
      function o(u, m) {
        i[u] = c(i[u], m, "line");
      }
      function c(u, m, d) {
        const h = m.properties || {}, p = m.transform || ((b) => b);
        return u.tagName = m.tagName || "span", u.properties = {
          ...u.properties,
          ...h,
          class: u.properties.class
        }, m.properties?.class && Ot(u, m.properties.class), u = p(u, d) || u, u;
      }
      const a = [], l = n.decorations.sort((u, m) => m.start.offset - u.start.offset);
      for (const u of l) {
        const { start: m, end: d } = u;
        if (m.line === d.line)
          s(m.line, m.character, d.character, u);
        else if (m.line < d.line) {
          s(m.line, m.character, Number.POSITIVE_INFINITY, u);
          for (let h = m.line + 1; h < d.line; h++)
            a.unshift(() => o(h, u));
          s(d.line, 0, d.character, u);
        }
      }
      a.forEach((u) => u());
    }
  };
}
function fi(r) {
  for (let e = 0; e < r.length; e++) {
    const t = r[e];
    if (t.start.offset > t.end.offset)
      throw new T(`Invalid decoration range: ${JSON.stringify(t.start)} - ${JSON.stringify(t.end)}`);
    for (let n = e + 1; n < r.length; n++) {
      const i = r[n], s = t.start.offset < i.start.offset && i.start.offset < t.end.offset, o = t.start.offset < i.end.offset && i.end.offset < t.end.offset, c = i.start.offset < t.start.offset && t.start.offset < i.end.offset, a = i.start.offset < t.end.offset && t.end.offset < i.end.offset;
      if (s || o || c || a) {
        if (o && o || c && a)
          continue;
        throw new T(`Decorations ${JSON.stringify(t.start)} and ${JSON.stringify(i.start)} intersect.`);
      }
    }
  }
}
function jt(r) {
  return r.type === "text" ? r.value : r.type === "element" ? r.children.map(jt).join("") : "";
}
const gi = [
  /* @__PURE__ */ di()
];
function le(r) {
  return [
    ...r.transformers || [],
    ...gi
  ];
}
var B = [
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
], Ne = {
  1: "bold",
  2: "dim",
  3: "italic",
  4: "underline",
  7: "reverse",
  9: "strikethrough"
};
function yi(r, e) {
  const t = r.indexOf("\x1B[", e);
  if (t !== -1) {
    const n = r.indexOf("m", t);
    return {
      sequence: r.substring(t + 2, n).split(";"),
      startPosition: t,
      position: n + 1
    };
  }
  return {
    position: r.length
  };
}
function it(r, e) {
  let t = 1;
  const n = r[e + t++];
  let i;
  if (n === "2") {
    const s = [
      r[e + t++],
      r[e + t++],
      r[e + t]
    ].map((o) => Number.parseInt(o));
    s.length === 3 && !s.some((o) => Number.isNaN(o)) && (i = {
      type: "rgb",
      rgb: s
    });
  } else if (n === "5") {
    const s = Number.parseInt(r[e + t]);
    Number.isNaN(s) || (i = { type: "table", index: Number(s) });
  }
  return [t, i];
}
function _i(r) {
  const e = [];
  for (let t = 0; t < r.length; t++) {
    const n = r[t], i = Number.parseInt(n);
    if (!Number.isNaN(i))
      if (i === 0)
        e.push({ type: "resetAll" });
      else if (i <= 9)
        Ne[i] && e.push({
          type: "setDecoration",
          value: Ne[i]
        });
      else if (i <= 29) {
        const s = Ne[i - 20];
        s && e.push({
          type: "resetDecoration",
          value: s
        });
      } else if (i <= 37)
        e.push({
          type: "setForegroundColor",
          value: { type: "named", name: B[i - 30] }
        });
      else if (i === 38) {
        const [s, o] = it(r, t);
        o && e.push({
          type: "setForegroundColor",
          value: o
        }), t += s;
      } else if (i === 39)
        e.push({
          type: "resetForegroundColor"
        });
      else if (i <= 47)
        e.push({
          type: "setBackgroundColor",
          value: { type: "named", name: B[i - 40] }
        });
      else if (i === 48) {
        const [s, o] = it(r, t);
        o && e.push({
          type: "setBackgroundColor",
          value: o
        }), t += s;
      } else i === 49 ? e.push({
        type: "resetBackgroundColor"
      }) : i >= 90 && i <= 97 ? e.push({
        type: "setForegroundColor",
        value: { type: "named", name: B[i - 90 + 8] }
      }) : i >= 100 && i <= 107 && e.push({
        type: "setBackgroundColor",
        value: { type: "named", name: B[i - 100 + 8] }
      });
  }
  return e;
}
function bi() {
  let r = null, e = null, t = /* @__PURE__ */ new Set();
  return {
    parse(n) {
      const i = [];
      let s = 0;
      do {
        const o = yi(n, s), c = o.sequence ? n.substring(s, o.startPosition) : n.substring(s);
        if (c.length > 0 && i.push({
          value: c,
          foreground: r,
          background: e,
          decorations: new Set(t)
        }), o.sequence) {
          const a = _i(o.sequence);
          for (const l of a)
            l.type === "resetAll" ? (r = null, e = null, t.clear()) : l.type === "resetForegroundColor" ? r = null : l.type === "resetBackgroundColor" ? e = null : l.type === "resetDecoration" && t.delete(l.value);
          for (const l of a)
            l.type === "setForegroundColor" ? r = l.value : l.type === "setBackgroundColor" ? e = l.value : l.type === "setDecoration" && t.add(l.value);
        }
        s = o.position;
      } while (s < n.length);
      return i;
    }
  };
}
var Si = {
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
function wi(r = Si) {
  function e(c) {
    return r[c];
  }
  function t(c) {
    return `#${c.map((a) => Math.max(0, Math.min(a, 255)).toString(16).padStart(2, "0")).join("")}`;
  }
  let n;
  function i() {
    if (n)
      return n;
    n = [];
    for (let l = 0; l < B.length; l++)
      n.push(e(B[l]));
    let c = [0, 95, 135, 175, 215, 255];
    for (let l = 0; l < 6; l++)
      for (let u = 0; u < 6; u++)
        for (let m = 0; m < 6; m++)
          n.push(t([c[l], c[u], c[m]]));
    let a = 8;
    for (let l = 0; l < 24; l++, a += 10)
      n.push(t([a, a, a]));
    return n;
  }
  function s(c) {
    return i()[c];
  }
  function o(c) {
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
    value: o
  };
}
function Ci(r, e, t) {
  const n = ce(r, t), i = de(e), s = wi(
    Object.fromEntries(
      B.map((c) => [
        c,
        r.colors?.[`terminal.ansi${c[0].toUpperCase()}${c.substring(1)}`]
      ])
    )
  ), o = bi();
  return i.map(
    (c) => o.parse(c[0]).map((a) => {
      let l, u;
      a.decorations.has("reverse") ? (l = a.background ? s.value(a.background) : r.bg, u = a.foreground ? s.value(a.foreground) : r.fg) : (l = a.foreground ? s.value(a.foreground) : r.fg, u = a.background ? s.value(a.background) : void 0), l = M(l, n), u = M(u, n), a.decorations.has("dim") && (l = ki(l));
      let m = I.None;
      return a.decorations.has("bold") && (m |= I.Bold), a.decorations.has("italic") && (m |= I.Italic), a.decorations.has("underline") && (m |= I.Underline), {
        content: a.value,
        offset: c[1],
        // TODO: more accurate offset? might need to fork ansi-sequence-parser
        color: l,
        bgColor: u,
        fontStyle: m
      };
    })
  );
}
function ki(r) {
  const e = r.match(/#([0-9a-f]{3})([0-9a-f]{3})?([0-9a-f]{2})?/);
  if (e)
    if (e[3]) {
      const n = Math.round(Number.parseInt(e[3], 16) / 2).toString(16).padStart(2, "0");
      return `#${e[1]}${e[2]}${n}`;
    } else return e[2] ? `#${e[1]}${e[2]}80` : `#${Array.from(e[1]).map((n) => `${n}${n}`).join("")}80`;
  const t = r.match(/var\((--[\w-]+-ansi-[\w-]+)\)/);
  return t ? `var(${t[1]}-dim)` : r;
}
function $e(r, e, t = {}) {
  const {
    lang: n = "text",
    theme: i = r.getLoadedThemes()[0]
  } = t;
  if (Be(n) || je(i))
    return de(e).map((a) => [{ content: a[0], offset: a[1] }]);
  const { theme: s, colorMap: o } = r.setTheme(i);
  if (n === "ansi")
    return Ci(s, e, t);
  const c = r.getLanguage(n);
  if (t.grammarState) {
    if (t.grammarState.lang !== c.name)
      throw new x(`Grammar state language "${t.grammarState.lang}" does not match highlight language "${c.name}"`);
    if (!t.grammarState.themes.includes(s.name))
      throw new x(`Grammar state themes "${t.grammarState.themes}" do not contain highlight theme "${s.name}"`);
  }
  return Ri(e, c, s, o, t);
}
function Ni(...r) {
  if (r.length === 2)
    return J(r[1]);
  const [e, t, n = {}] = r, {
    lang: i = "text",
    theme: s = e.getLoadedThemes()[0]
  } = n;
  if (Be(i) || je(s))
    throw new x("Plain language does not have grammar state");
  if (i === "ansi")
    throw new x("ANSI language does not have grammar state");
  const { theme: o, colorMap: c } = e.setTheme(s), a = e.getLanguage(i);
  return new F(
    ue(t, a, o, c, n).stateStack,
    a.name,
    o.name
  );
}
function Ri(r, e, t, n, i) {
  const s = ue(r, e, t, n, i), o = new F(
    ue(r, e, t, n, i).stateStack,
    e.name,
    t.name
  );
  return fe(s.tokens, o), s.tokens;
}
function ue(r, e, t, n, i) {
  const s = ce(t, i), {
    tokenizeMaxLineLength: o = 0,
    tokenizeTimeLimit: c = 500
  } = i, a = de(r);
  let l = i.grammarState ? pi(i.grammarState, t.name) ?? Ee : i.grammarContextCode != null ? ue(
    i.grammarContextCode,
    e,
    t,
    n,
    {
      ...i,
      grammarState: void 0,
      grammarContextCode: void 0
    }
  ).stateStack : Ee, u = [];
  const m = [];
  for (let d = 0, h = a.length; d < h; d++) {
    const [p, b] = a[d];
    if (p === "") {
      u = [], m.push([]);
      continue;
    }
    if (o > 0 && p.length >= o) {
      u = [], m.push([{
        content: p,
        offset: b,
        color: "",
        fontStyle: 0
      }]);
      continue;
    }
    let f, y, g;
    i.includeExplanation && (f = e.tokenizeLine(p, l), y = f.tokens, g = 0);
    const _ = e.tokenizeLine2(p, l, c), w = _.tokens.length / 2;
    for (let S = 0; S < w; S++) {
      const v = _.tokens[2 * S], O = S + 1 < w ? _.tokens[2 * S + 2] : p.length;
      if (v === O)
        continue;
      const Fe = _.tokens[2 * S + 1], Wt = M(
        n[D.getForeground(Fe)],
        s
      ), Ut = D.getFontStyle(Fe), ge = {
        content: p.substring(v, O),
        offset: b + v,
        color: Wt,
        fontStyle: Ut
      };
      if (i.includeExplanation) {
        const We = [];
        if (i.includeExplanation !== "scopeName")
          for (const E of t.settings) {
            let j;
            switch (typeof E.scope) {
              case "string":
                j = E.scope.split(/,/).map((ye) => ye.trim());
                break;
              case "object":
                j = E.scope;
                break;
              default:
                continue;
            }
            We.push({
              settings: E,
              selectors: j.map((ye) => ye.split(/ /))
            });
          }
        ge.explanation = [];
        let Ue = 0;
        for (; v + Ue < O; ) {
          const E = y[g], j = p.substring(
            E.startIndex,
            E.endIndex
          );
          Ue += j.length, ge.explanation.push({
            content: j,
            scopes: i.includeExplanation === "scopeName" ? Ti(
              E.scopes
            ) : Ai(
              We,
              E.scopes
            )
          }), g += 1;
        }
      }
      u.push(ge);
    }
    m.push(u), u = [], l = _.ruleStack;
  }
  return {
    tokens: m,
    stateStack: l
  };
}
function Ti(r) {
  return r.map((e) => ({ scopeName: e }));
}
function Ai(r, e) {
  const t = [];
  for (let n = 0, i = e.length; n < i; n++) {
    const s = e[n];
    t[n] = {
      scopeName: s,
      themeMatches: Li(r, s, e.slice(0, n))
    };
  }
  return t;
}
function st(r, e) {
  return r === e || e.substring(0, r.length) === r && e[r.length] === ".";
}
function vi(r, e, t) {
  if (!st(r[r.length - 1], e))
    return !1;
  let n = r.length - 2, i = t.length - 1;
  for (; n >= 0 && i >= 0; )
    st(r[n], t[i]) && (n -= 1), i -= 1;
  return n === -1;
}
function Li(r, e, t) {
  const n = [];
  for (const { selectors: i, settings: s } of r)
    for (const o of i)
      if (vi(o, e, t)) {
        n.push(s);
        break;
      }
  return n;
}
function $t(r, e, t) {
  const n = Object.entries(t.themes).filter((a) => a[1]).map((a) => ({ color: a[0], theme: a[1] })), i = n.map((a) => {
    const l = $e(r, e, {
      ...t,
      theme: a.theme
    }), u = J(l), m = typeof a.theme == "string" ? a.theme : a.theme.name;
    return {
      tokens: l,
      state: u,
      theme: m
    };
  }), s = Pi(
    ...i.map((a) => a.tokens)
  ), o = s[0].map(
    (a, l) => a.map((u, m) => {
      const d = {
        content: u.content,
        variants: {},
        offset: u.offset
      };
      return "includeExplanation" in t && t.includeExplanation && (d.explanation = u.explanation), s.forEach((h, p) => {
        const {
          content: b,
          explanation: f,
          offset: y,
          ...g
        } = h[l][m];
        d.variants[n[p].color] = g;
      }), d;
    })
  ), c = i[0].state ? new F(
    Object.fromEntries(i.map((a) => [a.theme, a.state?.getInternalStack(a.theme)])),
    i[0].state.lang
  ) : void 0;
  return c && fe(o, c), o;
}
function Pi(...r) {
  const e = r.map(() => []), t = r.length;
  for (let n = 0; n < r[0].length; n++) {
    const i = r.map((a) => a[n]), s = e.map(() => []);
    e.forEach((a, l) => a.push(s[l]));
    const o = i.map(() => 0), c = i.map((a) => a[0]);
    for (; c.every((a) => a); ) {
      const a = Math.min(...c.map((l) => l.content.length));
      for (let l = 0; l < t; l++) {
        const u = c[l];
        u.content.length === a ? (s[l].push(u), o[l] += 1, c[l] = i[l][o[l]]) : (s[l].push({
          ...u,
          content: u.content.slice(0, a)
        }), c[l] = {
          ...u,
          content: u.content.slice(a),
          offset: u.offset + a
        });
      }
    }
  }
  return e;
}
function me(r, e, t) {
  let n, i, s, o, c, a;
  if ("themes" in t) {
    const {
      defaultColor: l = "light",
      cssVariablePrefix: u = "--shiki-"
    } = t, m = Object.entries(t.themes).filter((f) => f[1]).map((f) => ({ color: f[0], theme: f[1] })).sort((f, y) => f.color === l ? -1 : y.color === l ? 1 : 0);
    if (m.length === 0)
      throw new x("`themes` option must not be empty");
    const d = $t(
      r,
      e,
      t
    );
    if (a = J(d), l && !m.find((f) => f.color === l))
      throw new x(`\`themes\` option must contain the defaultColor key \`${l}\``);
    const h = m.map((f) => r.getTheme(f.theme)), p = m.map((f) => f.color);
    s = d.map((f) => f.map((y) => Ei(y, p, u, l))), a && fe(s, a);
    const b = m.map((f) => ce(f.theme, t));
    i = m.map((f, y) => (y === 0 && l ? "" : `${u + f.color}:`) + (M(h[y].fg, b[y]) || "inherit")).join(";"), n = m.map((f, y) => (y === 0 && l ? "" : `${u + f.color}-bg:`) + (M(h[y].bg, b[y]) || "inherit")).join(";"), o = `shiki-themes ${h.map((f) => f.name).join(" ")}`, c = l ? void 0 : [i, n].join(";");
  } else if ("theme" in t) {
    const l = ce(t.theme, t);
    s = $e(
      r,
      e,
      t
    );
    const u = r.getTheme(t.theme);
    n = M(u.bg, l), i = M(u.fg, l), o = u.name, a = J(s);
  } else
    throw new x("Invalid options, either `theme` or `themes` must be provided");
  return {
    tokens: s,
    fg: i,
    bg: n,
    themeName: o,
    rootStyle: c,
    grammarState: a
  };
}
function Ei(r, e, t, n) {
  const i = {
    content: r.content,
    explanation: r.explanation,
    offset: r.offset
  }, s = e.map((a) => Mt(r.variants[a])), o = new Set(s.flatMap((a) => Object.keys(a))), c = {};
  return s.forEach((a, l) => {
    for (const u of o) {
      const m = a[u] || "inherit";
      if (l === 0 && n)
        c[u] = m;
      else {
        const d = u === "color" ? "" : u === "background-color" ? "-bg" : `-${u}`, h = t + e[l] + (u === "color" ? "" : d);
        c[h] = m;
      }
    }
  }), i.htmlStyle = c, i;
}
function he(r, e, t, n = {
  meta: {},
  options: t,
  codeToHast: (i, s) => he(r, i, s),
  codeToTokens: (i, s) => me(r, i, s)
}) {
  let i = e;
  for (const h of le(t))
    i = h.preprocess?.call(n, i, t) || i;
  let {
    tokens: s,
    fg: o,
    bg: c,
    themeName: a,
    rootStyle: l,
    grammarState: u
  } = me(r, i, t);
  const {
    mergeWhitespaces: m = !0
  } = t;
  m === !0 ? s = xi(s) : m === "never" && (s = Oi(s));
  const d = {
    ...n,
    get source() {
      return i;
    }
  };
  for (const h of le(t))
    s = h.tokens?.call(d, s) || s;
  return Ii(
    s,
    {
      ...t,
      fg: o,
      bg: c,
      themeName: a,
      rootStyle: l
    },
    d,
    u
  );
}
function Ii(r, e, t, n = J(r)) {
  const i = le(e), s = [], o = {
    type: "root",
    children: []
  }, {
    structure: c = "classic",
    tabindex: a = "0"
  } = e;
  let l = {
    type: "element",
    tagName: "pre",
    properties: {
      class: `shiki ${e.themeName || ""}`,
      style: e.rootStyle || `background-color:${e.bg};color:${e.fg}`,
      ...a !== !1 && a != null ? {
        tabindex: a.toString()
      } : {},
      ...Object.fromEntries(
        Array.from(
          Object.entries(e.meta || {})
        ).filter(([p]) => !p.startsWith("_"))
      )
    },
    children: []
  }, u = {
    type: "element",
    tagName: "code",
    properties: {},
    children: s
  };
  const m = [], d = {
    ...t,
    structure: c,
    addClassToHast: Ot,
    get source() {
      return t.source;
    },
    get tokens() {
      return r;
    },
    get options() {
      return e;
    },
    get root() {
      return o;
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
  if (r.forEach((p, b) => {
    b && (c === "inline" ? o.children.push({ type: "element", tagName: "br", properties: {}, children: [] }) : c === "classic" && s.push({ type: "text", value: `
` }));
    let f = {
      type: "element",
      tagName: "span",
      properties: { class: "line" },
      children: []
    }, y = 0;
    for (const g of p) {
      let _ = {
        type: "element",
        tagName: "span",
        properties: {
          ...g.htmlAttrs
        },
        children: [{ type: "text", value: g.content }]
      };
      g.htmlStyle;
      const w = mi(g.htmlStyle || Mt(g));
      w && (_.properties.style = w);
      for (const S of i)
        _ = S?.span?.call(d, _, b + 1, y, f, g) || _;
      c === "inline" ? o.children.push(_) : c === "classic" && f.children.push(_), y += g.content.length;
    }
    if (c === "classic") {
      for (const g of i)
        f = g?.line?.call(d, f, b + 1) || f;
      m.push(f), s.push(f);
    }
  }), c === "classic") {
    for (const p of i)
      u = p?.code?.call(d, u) || u;
    l.children.push(u);
    for (const p of i)
      l = p?.pre?.call(d, l) || l;
    o.children.push(l);
  }
  let h = o;
  for (const p of i)
    h = p?.root?.call(d, h) || h;
  return n && fe(h, n), h;
}
function xi(r) {
  return r.map((e) => {
    const t = [];
    let n = "", i = 0;
    return e.forEach((s, o) => {
      const a = !(s.fontStyle && s.fontStyle & I.Underline);
      a && s.content.match(/^\s+$/) && e[o + 1] ? (i || (i = s.offset), n += s.content) : n ? (a ? t.push({
        ...s,
        offset: i,
        content: n + s.content
      }) : t.push(
        {
          content: n,
          offset: i
        },
        s
      ), i = 0, n = "") : t.push(s);
    }), t;
  });
}
function Oi(r) {
  return r.map((e) => e.flatMap((t) => {
    if (t.content.match(/^\s+$/))
      return t;
    const n = t.content.match(/^(\s*)(.*?)(\s*)$/);
    if (!n)
      return t;
    const [, i, s, o] = n;
    if (!i && !o)
      return t;
    const c = [{
      ...t,
      offset: t.offset + i.length,
      content: s
    }];
    return i && c.unshift({
      content: i,
      offset: t.offset
    }), o && c.push({
      content: o,
      offset: t.offset + i.length + s.length
    }), c;
  }));
}
function Gi(r, e, t) {
  const n = {
    meta: {},
    options: t,
    codeToHast: (s, o) => he(r, s, o),
    codeToTokens: (s, o) => me(r, s, o)
  };
  let i = si(he(r, e, t, n));
  for (const s of le(t))
    i = s.postprocess?.call(n, i, t) || i;
  return i;
}
const at = { light: "#333333", dark: "#bbbbbb" }, ot = { light: "#fffffe", dark: "#1e1e1e" }, ct = "__shiki_resolved";
function De(r) {
  if (r?.[ct])
    return r;
  const e = {
    ...r
  };
  e.tokenColors && !e.settings && (e.settings = e.tokenColors, delete e.tokenColors), e.type ||= "dark", e.colorReplacements = { ...e.colorReplacements }, e.settings ||= [];
  let { bg: t, fg: n } = e;
  if (!t || !n) {
    const c = e.settings ? e.settings.find((a) => !a.name && !a.scope) : void 0;
    c?.settings?.foreground && (n = c.settings.foreground), c?.settings?.background && (t = c.settings.background), !n && e?.colors?.["editor.foreground"] && (n = e.colors["editor.foreground"]), !t && e?.colors?.["editor.background"] && (t = e.colors["editor.background"]), n || (n = e.type === "light" ? at.light : at.dark), t || (t = e.type === "light" ? ot.light : ot.dark), e.fg = n, e.bg = t;
  }
  e.settings[0] && e.settings[0].settings && !e.settings[0].scope || e.settings.unshift({
    settings: {
      foreground: e.fg,
      background: e.bg
    }
  });
  let i = 0;
  const s = /* @__PURE__ */ new Map();
  function o(c) {
    if (s.has(c))
      return s.get(c);
    i += 1;
    const a = `#${i.toString(16).padStart(8, "0").toLowerCase()}`;
    return e.colorReplacements?.[`#${a}`] ? o(c) : (s.set(c, a), a);
  }
  e.settings = e.settings.map((c) => {
    const a = c.settings?.foreground && !c.settings.foreground.startsWith("#"), l = c.settings?.background && !c.settings.background.startsWith("#");
    if (!a && !l)
      return c;
    const u = {
      ...c,
      settings: {
        ...c.settings
      }
    };
    if (a) {
      const m = o(c.settings.foreground);
      e.colorReplacements[m] = c.settings.foreground, u.settings.foreground = m;
    }
    if (l) {
      const m = o(c.settings.background);
      e.colorReplacements[m] = c.settings.background, u.settings.background = m;
    }
    return u;
  });
  for (const c of Object.keys(e.colors || {}))
    if ((c === "editor.foreground" || c === "editor.background" || c.startsWith("terminal.ansi")) && !e.colors[c]?.startsWith("#")) {
      const a = o(e.colors[c]);
      e.colorReplacements[a] = e.colors[c], e.colors[c] = a;
    }
  return Object.defineProperty(e, ct, {
    enumerable: !1,
    writable: !1,
    value: !0
  }), e;
}
async function Dt(r) {
  return Array.from(new Set((await Promise.all(
    r.filter((e) => !It(e)).map(async (e) => await Gt(e).then((t) => Array.isArray(t) ? t : [t]))
  )).flat()));
}
async function Ft(r) {
  return (await Promise.all(
    r.map(
      async (t) => xt(t) ? null : De(await Gt(t))
    )
  )).filter((t) => !!t);
}
class Mi extends nn {
  constructor(e, t, n, i = {}) {
    super(e), this._resolver = e, this._themes = t, this._langs = n, this._alias = i, this._themes.map((s) => this.loadTheme(s)), this.loadLanguages(this._langs);
  }
  _resolvedThemes = /* @__PURE__ */ new Map();
  _resolvedGrammars = /* @__PURE__ */ new Map();
  _langMap = /* @__PURE__ */ new Map();
  _langGraph = /* @__PURE__ */ new Map();
  _textmateThemeCache = /* @__PURE__ */ new WeakMap();
  _loadedThemesCache = null;
  _loadedLanguagesCache = null;
  getTheme(e) {
    return typeof e == "string" ? this._resolvedThemes.get(e) : this.loadTheme(e);
  }
  loadTheme(e) {
    const t = De(e);
    return t.name && (this._resolvedThemes.set(t.name, t), this._loadedThemesCache = null), t;
  }
  getLoadedThemes() {
    return this._loadedThemesCache || (this._loadedThemesCache = [...this._resolvedThemes.keys()]), this._loadedThemesCache;
  }
  // Override and re-implement this method to cache the textmate themes as `TextMateTheme.createFromRawTheme`
  // is expensive. Themes can switch often especially for dual-theme support.
  //
  // The parent class also accepts `colorMap` as the second parameter, but since we don't use that,
  // we omit here so it's easier to cache the themes.
  setTheme(e) {
    let t = this._textmateThemeCache.get(e);
    t || (t = ne.createFromRawTheme(e), this._textmateThemeCache.set(e, t)), this._syncRegistry.setTheme(t);
  }
  getGrammar(e) {
    if (this._alias[e]) {
      const t = /* @__PURE__ */ new Set([e]);
      for (; this._alias[e]; ) {
        if (e = this._alias[e], t.has(e))
          throw new T(`Circular alias \`${Array.from(t).join(" -> ")} -> ${e}\``);
        t.add(e);
      }
    }
    return this._resolvedGrammars.get(e);
  }
  loadLanguage(e) {
    if (this.getGrammar(e.name))
      return;
    const t = new Set(
      [...this._langMap.values()].filter((s) => s.embeddedLangsLazy?.includes(e.name))
    );
    this._resolver.addLanguage(e);
    const n = {
      balancedBracketSelectors: e.balancedBracketSelectors || ["*"],
      unbalancedBracketSelectors: e.unbalancedBracketSelectors || []
    };
    this._syncRegistry._rawGrammars.set(e.scopeName, e);
    const i = this.loadGrammarWithConfiguration(e.scopeName, 1, n);
    if (i.name = e.name, this._resolvedGrammars.set(e.name, i), e.aliases && e.aliases.forEach((s) => {
      this._alias[s] = e.name;
    }), this._loadedLanguagesCache = null, t.size)
      for (const s of t)
        this._resolvedGrammars.delete(s.name), this._loadedLanguagesCache = null, this._syncRegistry?._injectionGrammars?.delete(s.scopeName), this._syncRegistry?._grammars?.delete(s.scopeName), this.loadLanguage(this._langMap.get(s.name));
  }
  dispose() {
    super.dispose(), this._resolvedThemes.clear(), this._resolvedGrammars.clear(), this._langMap.clear(), this._langGraph.clear(), this._loadedThemesCache = null;
  }
  loadLanguages(e) {
    for (const i of e)
      this.resolveEmbeddedLanguages(i);
    const t = Array.from(this._langGraph.entries()), n = t.filter(([i, s]) => !s);
    if (n.length) {
      const i = t.filter(([s, o]) => o && o.embeddedLangs?.some((c) => n.map(([a]) => a).includes(c))).filter((s) => !n.includes(s));
      throw new T(`Missing languages ${n.map(([s]) => `\`${s}\``).join(", ")}, required by ${i.map(([s]) => `\`${s}\``).join(", ")}`);
    }
    for (const [i, s] of t)
      this._resolver.addLanguage(s);
    for (const [i, s] of t)
      this.loadLanguage(s);
  }
  getLoadedLanguages() {
    return this._loadedLanguagesCache || (this._loadedLanguagesCache = [
      .../* @__PURE__ */ new Set([...this._resolvedGrammars.keys(), ...Object.keys(this._alias)])
    ]), this._loadedLanguagesCache;
  }
  resolveEmbeddedLanguages(e) {
    if (this._langMap.set(e.name, e), this._langGraph.set(e.name, e), e.embeddedLangs)
      for (const t of e.embeddedLangs)
        this._langGraph.set(t, this._langMap.get(t));
  }
}
class Bi {
  _langs = /* @__PURE__ */ new Map();
  _scopeToLang = /* @__PURE__ */ new Map();
  _injections = /* @__PURE__ */ new Map();
  _onigLib;
  constructor(e, t) {
    this._onigLib = {
      createOnigScanner: (n) => e.createScanner(n),
      createOnigString: (n) => e.createString(n)
    }, t.forEach((n) => this.addLanguage(n));
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
    let n = [];
    for (let i = 1; i <= t.length; i++) {
      const s = t.slice(0, i).join(".");
      n = [...n, ...this._injections.get(s) || []];
    }
    return n;
  }
}
let W = 0;
function ji(r) {
  W += 1, r.warnings !== !1 && W >= 10 && W % 10 === 0 && console.warn(`[Shiki] ${W} instances have been created. Shiki is supposed to be used as a singleton, consider refactoring your code to cache your highlighter instance; Or call \`highlighter.dispose()\` to release unused instances.`);
  let e = !1;
  if (!r.engine)
    throw new T("`engine` option is required for synchronous mode");
  const t = (r.langs || []).flat(1), n = (r.themes || []).flat(1).map(De), i = new Bi(r.engine, t), s = new Mi(i, n, t, r.langAlias);
  let o;
  function c(g) {
    f();
    const _ = s.getGrammar(typeof g == "string" ? g : g.name);
    if (!_)
      throw new T(`Language \`${g}\` not found, you may need to load it first`);
    return _;
  }
  function a(g) {
    if (g === "none")
      return { bg: "", fg: "", name: "none", settings: [], type: "dark" };
    f();
    const _ = s.getTheme(g);
    if (!_)
      throw new T(`Theme \`${g}\` not found, you may need to load it first`);
    return _;
  }
  function l(g) {
    f();
    const _ = a(g);
    o !== g && (s.setTheme(_), o = g);
    const w = s.getColorMap();
    return {
      theme: _,
      colorMap: w
    };
  }
  function u() {
    return f(), s.getLoadedThemes();
  }
  function m() {
    return f(), s.getLoadedLanguages();
  }
  function d(...g) {
    f(), s.loadLanguages(g.flat(1));
  }
  async function h(...g) {
    return d(await Dt(g));
  }
  function p(...g) {
    f();
    for (const _ of g.flat(1))
      s.loadTheme(_);
  }
  async function b(...g) {
    return f(), p(await Ft(g));
  }
  function f() {
    if (e)
      throw new T("Shiki instance has been disposed");
  }
  function y() {
    e || (e = !0, s.dispose(), W -= 1);
  }
  return {
    setTheme: l,
    getTheme: a,
    getLanguage: c,
    getLoadedThemes: u,
    getLoadedLanguages: m,
    loadLanguage: h,
    loadLanguageSync: d,
    loadTheme: b,
    loadThemeSync: p,
    dispose: y,
    [Symbol.dispose]: y
  };
}
async function $i(r = {}) {
  r.loadWasm;
  const [
    e,
    t,
    n
  ] = await Promise.all([
    Ft(r.themes || []),
    Dt(r.langs || []),
    r.engine || mt(r.loadWasm || yr())
  ]);
  return ji({
    ...r,
    themes: e,
    langs: t,
    engine: n
  });
}
async function Di(r = {}) {
  const e = await $i(r);
  return {
    getLastGrammarState: (...t) => Ni(e, ...t),
    codeToTokensBase: (t, n) => $e(e, t, n),
    codeToTokensWithThemes: (t, n) => $t(e, t, n),
    codeToTokens: (t, n) => me(e, t, n),
    codeToHast: (t, n) => he(e, t, n),
    codeToHtml: (t, n) => Gi(e, t, n),
    ...e,
    getInternalContext: () => e
  };
}
function Fi(r, e, t) {
  let n, i, s;
  {
    const c = r;
    n = c.langs, i = c.themes, s = c.engine;
  }
  async function o(c) {
    function a(h) {
      if (typeof h == "string") {
        if (It(h))
          return [];
        const p = n[h];
        if (!p)
          throw new x(`Language \`${h}\` is not included in this bundle. You may want to load it from external source.`);
        return p;
      }
      return h;
    }
    function l(h) {
      if (xt(h))
        return "none";
      if (typeof h == "string") {
        const p = i[h];
        if (!p)
          throw new x(`Theme \`${h}\` is not included in this bundle. You may want to load it from external source.`);
        return p;
      }
      return h;
    }
    const u = (c.themes ?? []).map((h) => l(h)), m = (c.langs ?? []).map((h) => a(h)), d = await Di({
      engine: c.engine ?? s(),
      ...c,
      themes: u,
      langs: m
    });
    return {
      ...d,
      loadLanguage(...h) {
        return d.loadLanguage(...h.map(a));
      },
      loadTheme(...h) {
        return d.loadTheme(...h.map(l));
      }
    };
  }
  return o;
}
function Wi(r) {
  let e;
  async function t(n = {}) {
    if (e) {
      const i = await e;
      return await Promise.all([
        i.loadTheme(...n.themes || []),
        i.loadLanguage(...n.langs || [])
      ]), i;
    } else
      return e = r({
        ...n,
        themes: n.themes || [],
        langs: n.langs || []
      }), e;
  }
  return t;
}
function Ui(r) {
  const e = Wi(r);
  return {
    getSingletonHighlighter(t) {
      return e(t);
    },
    async codeToHtml(t, n) {
      return (await e({
        langs: [n.lang],
        themes: "theme" in n ? [n.theme] : Object.values(n.themes)
      })).codeToHtml(t, n);
    },
    async codeToHast(t, n) {
      return (await e({
        langs: [n.lang],
        themes: "theme" in n ? [n.theme] : Object.values(n.themes)
      })).codeToHast(t, n);
    },
    async codeToTokens(t, n) {
      return (await e({
        langs: [n.lang],
        themes: "theme" in n ? [n.theme] : Object.values(n.themes)
      })).codeToTokens(t, n);
    },
    async codeToTokensBase(t, n) {
      return (await e({
        langs: [n.lang],
        themes: [n.theme]
      })).codeToTokensBase(t, n);
    },
    async codeToTokensWithThemes(t, n) {
      return (await e({
        langs: [n.lang],
        themes: Object.values(n.themes).filter(Boolean)
      })).codeToTokensWithThemes(t, n);
    },
    async getLastGrammarState(t, n) {
      return (await e({
        langs: [n.lang],
        themes: [n.theme]
      })).getLastGrammarState(t, n);
    }
  };
}
const Hi = /* @__PURE__ */ Fi({
  langs: Xt,
  themes: Zt,
  engine: () => mt(import("./wasm-DQxwEHae.js"))
}), {
  codeToTokens: Ki
} = /* @__PURE__ */ Ui(
  Hi
);
export {
  I as FontStyle,
  x as ShikiError,
  D as StackElementMetadata,
  Ot as addClassToHast,
  M as applyColorReplacements,
  Xt as bundledLanguages,
  Qt as bundledLanguagesAlias,
  Kt as bundledLanguagesBase,
  ut as bundledLanguagesInfo,
  Zt as bundledThemes,
  Yt as bundledThemesInfo,
  Ki as codeToTokens,
  Hi as createHighlighter,
  Di as createHighlighterCore,
  mt as createOnigurumaEngine,
  hi as createPositionConverter,
  $i as createShikiInternal,
  ji as createShikiInternalSync,
  Ui as createSingletonShorthands,
  Fi as createdBundledHighlighter,
  Mt as getTokenStyleObject,
  si as hastToHtml,
  je as isNoneTheme,
  Be as isPlainLang,
  It as isSpecialLang,
  xt as isSpecialTheme,
  pr as loadWasm,
  Wi as makeSingletonHighlighter,
  Gt as normalizeGetter,
  De as normalizeTheme,
  ce as resolveColorReplacements,
  de as splitLines,
  li as splitToken,
  ui as splitTokens,
  mi as stringifyTokenStyle,
  ci as toArray,
  Ci as tokenizeAnsiWithTheme,
  Ri as tokenizeWithTheme,
  Ii as tokensToHast,
  di as transformerDecorations
};
