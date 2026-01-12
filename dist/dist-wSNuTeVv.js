import { a as find, c as stringify$1, i as svg, n as stringify$2, r as html, s as whitespace, t as ccount } from "./ccount-BAQBvLGj.js";
var own$2 = {}.hasOwnProperty;
function zwitch(s, I) {
	let L = I || {};
	function R(I, ...L) {
		let z = R.invalid, B = R.handlers;
		if (I && own$2.call(I, s)) {
			let L = String(I[s]);
			z = own$2.call(B, L) ? B[L] : R.unknown;
		}
		if (z) return z.call(this, I, ...L);
	}
	return R.handlers = L.handlers || {}, R.invalid = L.invalid, R.unknown = L.unknown, R;
}
var bundledLanguagesInfo = [
	{
		id: "abap",
		name: "ABAP",
		import: () => import("./abap-BE84eBnf.js")
	},
	{
		id: "actionscript-3",
		name: "ActionScript",
		import: () => import("./actionscript-3-5LMQGRuq.js")
	},
	{
		id: "ada",
		name: "Ada",
		import: () => import("./ada-Go9ZFi0b.js")
	},
	{
		id: "angular-html",
		name: "Angular HTML",
		import: () => import("./angular-html-Bs5ZlCNx.js")
	},
	{
		id: "angular-ts",
		name: "Angular TypeScript",
		import: () => import("./angular-ts-CG8HPE4I.js")
	},
	{
		id: "apache",
		name: "Apache Conf",
		import: () => import("./apache-CJTEGmjB.js")
	},
	{
		id: "apex",
		name: "Apex",
		import: () => import("./apex-Bp2I5cJe.js")
	},
	{
		id: "apl",
		name: "APL",
		import: () => import("./apl-DWi-9lrx.js")
	},
	{
		id: "applescript",
		name: "AppleScript",
		import: () => import("./applescript-u24R4p_p.js")
	},
	{
		id: "ara",
		name: "Ara",
		import: () => import("./ara-klIuKq2I.js")
	},
	{
		id: "asciidoc",
		name: "AsciiDoc",
		aliases: ["adoc"],
		import: () => import("./asciidoc-Cw7D6KnD.js")
	},
	{
		id: "asm",
		name: "Assembly",
		import: () => import("./asm-swjx-a89.js")
	},
	{
		id: "astro",
		name: "Astro",
		import: () => import("./astro-tbBTk8m8.js")
	},
	{
		id: "awk",
		name: "AWK",
		import: () => import("./awk-CEaAOqaq.js")
	},
	{
		id: "ballerina",
		name: "Ballerina",
		import: () => import("./ballerina-BnDTcJCF.js")
	},
	{
		id: "bat",
		name: "Batch File",
		aliases: ["batch"],
		import: () => import("./bat-DfCVNF8F.js")
	},
	{
		id: "beancount",
		name: "Beancount",
		import: () => import("./beancount-BhVPxKgY.js")
	},
	{
		id: "berry",
		name: "Berry",
		aliases: ["be"],
		import: () => import("./berry-B93EyYZB.js")
	},
	{
		id: "bibtex",
		name: "BibTeX",
		import: () => import("./bibtex-D3AXbE4q.js")
	},
	{
		id: "bicep",
		name: "Bicep",
		import: () => import("./bicep-D9X006da.js")
	},
	{
		id: "blade",
		name: "Blade",
		import: () => import("./blade-DV48iFGZ.js")
	},
	{
		id: "bsl",
		name: "1C (Enterprise)",
		aliases: ["1c"],
		import: () => import("./bsl-C4rO5nSH.js")
	},
	{
		id: "c",
		name: "C",
		import: () => import("./c-Ck3Zfzuy.js")
	},
	{
		id: "cadence",
		name: "Cadence",
		aliases: ["cdc"],
		import: () => import("./cadence-BM1RxosP.js")
	},
	{
		id: "cairo",
		name: "Cairo",
		import: () => import("./cairo-5SBKOwUc.js")
	},
	{
		id: "clarity",
		name: "Clarity",
		import: () => import("./clarity-DwkkCykC.js")
	},
	{
		id: "clojure",
		name: "Clojure",
		aliases: ["clj"],
		import: () => import("./clojure-DAKElQI1.js")
	},
	{
		id: "cmake",
		name: "CMake",
		import: () => import("./cmake-5PvNrdyS.js")
	},
	{
		id: "cobol",
		name: "COBOL",
		import: () => import("./cobol-BPmZOGYd.js")
	},
	{
		id: "codeowners",
		name: "CODEOWNERS",
		import: () => import("./codeowners-DRB40hM6.js")
	},
	{
		id: "codeql",
		name: "CodeQL",
		aliases: ["ql"],
		import: () => import("./codeql-CcS1Na8f.js")
	},
	{
		id: "coffee",
		name: "CoffeeScript",
		aliases: ["coffeescript"],
		import: () => import("./coffee-BnidrFai.js")
	},
	{
		id: "common-lisp",
		name: "Common Lisp",
		aliases: ["lisp"],
		import: () => import("./common-lisp-CXdJi1fy.js")
	},
	{
		id: "coq",
		name: "Coq",
		import: () => import("./coq-qV1tVgWF.js")
	},
	{
		id: "cpp",
		name: "C++",
		aliases: ["c++"],
		import: () => import("./cpp-CbjpTdlh.js")
	},
	{
		id: "crystal",
		name: "Crystal",
		import: () => import("./crystal-431cRqLq.js")
	},
	{
		id: "csharp",
		name: "C#",
		aliases: ["c#", "cs"],
		import: () => import("./csharp-CZ6X3Dwh.js")
	},
	{
		id: "css",
		name: "CSS",
		import: () => import("./css-DnrHD_wV.js")
	},
	{
		id: "csv",
		name: "CSV",
		import: () => import("./csv-lyDbC4_b.js")
	},
	{
		id: "cue",
		name: "CUE",
		import: () => import("./cue-Dk6MacaM.js")
	},
	{
		id: "cypher",
		name: "Cypher",
		aliases: ["cql"],
		import: () => import("./cypher-D_GOHU33.js")
	},
	{
		id: "d",
		name: "D",
		import: () => import("./d-CH0q6I_P.js")
	},
	{
		id: "dart",
		name: "Dart",
		import: () => import("./dart-DLkm5bet.js")
	},
	{
		id: "dax",
		name: "DAX",
		import: () => import("./dax-DU4nBtHb.js")
	},
	{
		id: "desktop",
		name: "Desktop",
		import: () => import("./desktop-CFzprYAS.js")
	},
	{
		id: "diff",
		name: "Diff",
		import: () => import("./diff-Q1fm5opG.js")
	},
	{
		id: "docker",
		name: "Dockerfile",
		aliases: ["dockerfile"],
		import: () => import("./docker-BhTW_5Wd.js")
	},
	{
		id: "dotenv",
		name: "dotEnv",
		import: () => import("./dotenv-CXb0pZ1i.js")
	},
	{
		id: "dream-maker",
		name: "Dream Maker",
		import: () => import("./dream-maker-zBubhh68.js")
	},
	{
		id: "edge",
		name: "Edge",
		import: () => import("./edge-DPgugftY.js")
	},
	{
		id: "elixir",
		name: "Elixir",
		import: () => import("./elixir-Ec-gqmzv.js")
	},
	{
		id: "elm",
		name: "Elm",
		import: () => import("./elm-D005yQmx.js")
	},
	{
		id: "emacs-lisp",
		name: "Emacs Lisp",
		aliases: ["elisp"],
		import: () => import("./emacs-lisp-DdljNYsk.js")
	},
	{
		id: "erb",
		name: "ERB",
		import: () => import("./erb-C5hWzxdU.js")
	},
	{
		id: "erlang",
		name: "Erlang",
		aliases: ["erl"],
		import: () => import("./erlang-CHY7mJts.js")
	},
	{
		id: "fennel",
		name: "Fennel",
		import: () => import("./fennel-CE8iv9eA.js")
	},
	{
		id: "fish",
		name: "Fish",
		import: () => import("./fish-CvncxCad.js")
	},
	{
		id: "fluent",
		name: "Fluent",
		aliases: ["ftl"],
		import: () => import("./fluent-DVOtZCRy.js")
	},
	{
		id: "fortran-fixed-form",
		name: "Fortran (Fixed Form)",
		aliases: [
			"f",
			"for",
			"f77"
		],
		import: () => import("./fortran-fixed-form-B7424FVB.js")
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
		import: () => import("./fortran-free-form-BLPwYKPN.js")
	},
	{
		id: "fsharp",
		name: "F#",
		aliases: ["f#", "fs"],
		import: () => import("./fsharp-CpxRsFW4.js")
	},
	{
		id: "gdresource",
		name: "GDResource",
		import: () => import("./gdresource-CR84gyBy.js")
	},
	{
		id: "gdscript",
		name: "GDScript",
		import: () => import("./gdscript-vPAYMFcU.js")
	},
	{
		id: "gdshader",
		name: "GDShader",
		import: () => import("./gdshader-3tYrqRgn.js")
	},
	{
		id: "genie",
		name: "Genie",
		import: () => import("./genie-C5owbNzp.js")
	},
	{
		id: "gherkin",
		name: "Gherkin",
		import: () => import("./gherkin-Do2v1Rxh.js")
	},
	{
		id: "git-commit",
		name: "Git Commit Message",
		import: () => import("./git-commit-2vADItDW.js")
	},
	{
		id: "git-rebase",
		name: "Git Rebase Message",
		import: () => import("./git-rebase-BYKv8k-5.js")
	},
	{
		id: "gleam",
		name: "Gleam",
		import: () => import("./gleam-cYDYtYs7.js")
	},
	{
		id: "glimmer-js",
		name: "Glimmer JS",
		aliases: ["gjs"],
		import: () => import("./glimmer-js-CpzzsS7A.js")
	},
	{
		id: "glimmer-ts",
		name: "Glimmer TS",
		aliases: ["gts"],
		import: () => import("./glimmer-ts-C9WZO0qE.js")
	},
	{
		id: "glsl",
		name: "GLSL",
		import: () => import("./glsl-DF_lf1hJ.js")
	},
	{
		id: "gnuplot",
		name: "Gnuplot",
		import: () => import("./gnuplot-BqB3UFB2.js")
	},
	{
		id: "go",
		name: "Go",
		import: () => import("./go-9mdl7OOn.js")
	},
	{
		id: "graphql",
		name: "GraphQL",
		aliases: ["gql"],
		import: () => import("./graphql-B1m6Iwcr.js")
	},
	{
		id: "groovy",
		name: "Groovy",
		import: () => import("./groovy-hBeguzZr.js")
	},
	{
		id: "hack",
		name: "Hack",
		import: () => import("./hack-CHdsC2HW.js")
	},
	{
		id: "haml",
		name: "Ruby Haml",
		import: () => import("./haml-d8oWnnik.js")
	},
	{
		id: "handlebars",
		name: "Handlebars",
		aliases: ["hbs"],
		import: () => import("./handlebars-D4b2Q_ci.js")
	},
	{
		id: "haskell",
		name: "Haskell",
		aliases: ["hs"],
		import: () => import("./haskell-CGvdt6-d.js")
	},
	{
		id: "haxe",
		name: "Haxe",
		import: () => import("./haxe-DXu56TP7.js")
	},
	{
		id: "hcl",
		name: "HashiCorp HCL",
		import: () => import("./hcl-DnG2Xa49.js")
	},
	{
		id: "hjson",
		name: "Hjson",
		import: () => import("./hjson-DinJWFtn.js")
	},
	{
		id: "hlsl",
		name: "HLSL",
		import: () => import("./hlsl-Cmd9B6wo.js")
	},
	{
		id: "html",
		name: "HTML",
		import: () => import("./html-B3JxBo1O.js")
	},
	{
		id: "html-derivative",
		name: "HTML (Derivative)",
		import: () => import("./html-derivative-p5_NmjLd.js")
	},
	{
		id: "http",
		name: "HTTP",
		import: () => import("./http-DsF810AA.js")
	},
	{
		id: "hxml",
		name: "HXML",
		import: () => import("./hxml-AbwmqrZ5.js")
	},
	{
		id: "hy",
		name: "Hy",
		import: () => import("./hy-DzsBp7hV.js")
	},
	{
		id: "imba",
		name: "Imba",
		import: () => import("./imba-D8B0ta3D.js")
	},
	{
		id: "ini",
		name: "INI",
		aliases: ["properties"],
		import: () => import("./ini-nb2EDQHX.js")
	},
	{
		id: "java",
		name: "Java",
		import: () => import("./java-BJI1-XdE.js")
	},
	{
		id: "javascript",
		name: "JavaScript",
		aliases: ["js"],
		import: () => import("./javascript-COr40jIU.js")
	},
	{
		id: "jinja",
		name: "Jinja",
		import: () => import("./jinja-ChA-T6gy.js")
	},
	{
		id: "jison",
		name: "Jison",
		import: () => import("./jison-DYkg-g1k.js")
	},
	{
		id: "json",
		name: "JSON",
		import: () => import("./json--cG8EXtj.js")
	},
	{
		id: "json5",
		name: "JSON5",
		import: () => import("./json5-DDgG2zmR.js")
	},
	{
		id: "jsonc",
		name: "JSON with Comments",
		import: () => import("./jsonc-C7hup-i0.js")
	},
	{
		id: "jsonl",
		name: "JSON Lines",
		import: () => import("./jsonl-Cn9zVdai.js")
	},
	{
		id: "jsonnet",
		name: "Jsonnet",
		import: () => import("./jsonnet-ErAhwqhZ.js")
	},
	{
		id: "jssm",
		name: "JSSM",
		aliases: ["fsl"],
		import: () => import("./jssm-B1P9i6fN.js")
	},
	{
		id: "jsx",
		name: "JSX",
		import: () => import("./jsx-HwO3hKvR.js")
	},
	{
		id: "julia",
		name: "Julia",
		aliases: ["jl"],
		import: () => import("./julia-BcyaOV7h.js")
	},
	{
		id: "kotlin",
		name: "Kotlin",
		aliases: ["kt", "kts"],
		import: () => import("./kotlin-Cb85OFAs.js")
	},
	{
		id: "kusto",
		name: "Kusto",
		aliases: ["kql"],
		import: () => import("./kusto-CCdqJmF7.js")
	},
	{
		id: "latex",
		name: "LaTeX",
		import: () => import("./latex-DNCPHjRP.js")
	},
	{
		id: "lean",
		name: "Lean 4",
		aliases: ["lean4"],
		import: () => import("./lean-CxcBPoUK.js")
	},
	{
		id: "less",
		name: "Less",
		import: () => import("./less-B3IB7-Zi.js")
	},
	{
		id: "liquid",
		name: "Liquid",
		import: () => import("./liquid-CkW8iUqY.js")
	},
	{
		id: "log",
		name: "Log file",
		import: () => import("./log-u1fEPAdO.js")
	},
	{
		id: "logo",
		name: "Logo",
		import: () => import("./logo-XDOSy7uL.js")
	},
	{
		id: "lua",
		name: "Lua",
		import: () => import("./lua-C7Cs6OlK.js")
	},
	{
		id: "luau",
		name: "Luau",
		import: () => import("./luau-Bu5SoDL6.js")
	},
	{
		id: "make",
		name: "Makefile",
		aliases: ["makefile"],
		import: () => import("./make-BciPVdu9.js")
	},
	{
		id: "markdown",
		name: "Markdown",
		aliases: ["md"],
		import: () => import("./markdown-CY8mScU1.js")
	},
	{
		id: "marko",
		name: "Marko",
		import: () => import("./marko-W3w-8rIA.js")
	},
	{
		id: "matlab",
		name: "MATLAB",
		import: () => import("./matlab-BcBRe2uc.js")
	},
	{
		id: "mdc",
		name: "MDC",
		import: () => import("./mdc-Bcmh2Qep.js")
	},
	{
		id: "mdx",
		name: "MDX",
		import: () => import("./mdx-DuFQhHBa.js")
	},
	{
		id: "mermaid",
		name: "Mermaid",
		aliases: ["mmd"],
		import: () => import("./mermaid-C-ZvFrhO.js")
	},
	{
		id: "mipsasm",
		name: "MIPS Assembly",
		aliases: ["mips"],
		import: () => import("./mipsasm-Ba2sgIRc.js")
	},
	{
		id: "mojo",
		name: "Mojo",
		import: () => import("./mojo-CfRlvLNa.js")
	},
	{
		id: "move",
		name: "Move",
		import: () => import("./move-DO_pOwGQ.js")
	},
	{
		id: "narrat",
		name: "Narrat Language",
		aliases: ["nar"],
		import: () => import("./narrat-BfiRwxKJ.js")
	},
	{
		id: "nextflow",
		name: "Nextflow",
		aliases: ["nf"],
		import: () => import("./nextflow-C8Y5jA-F.js")
	},
	{
		id: "nginx",
		name: "Nginx",
		import: () => import("./nginx-C0-AOnfA.js")
	},
	{
		id: "nim",
		name: "Nim",
		import: () => import("./nim-Ck1p8gd7.js")
	},
	{
		id: "nix",
		name: "Nix",
		import: () => import("./nix-BlSPAWKx.js")
	},
	{
		id: "nushell",
		name: "nushell",
		aliases: ["nu"],
		import: () => import("./nushell-Dob_9GOl.js")
	},
	{
		id: "objective-c",
		name: "Objective-C",
		aliases: ["objc"],
		import: () => import("./objective-c-fU0thNi3.js")
	},
	{
		id: "objective-cpp",
		name: "Objective-C++",
		import: () => import("./objective-cpp-NHoWNr_e.js")
	},
	{
		id: "ocaml",
		name: "OCaml",
		import: () => import("./ocaml-CTY_CUiC.js")
	},
	{
		id: "pascal",
		name: "Pascal",
		import: () => import("./pascal-gM9ezcvY.js")
	},
	{
		id: "perl",
		name: "Perl",
		import: () => import("./perl-Cw2keyVM.js")
	},
	{
		id: "php",
		name: "PHP",
		import: () => import("./php-Buxxt2V0.js")
	},
	{
		id: "plsql",
		name: "PL/SQL",
		import: () => import("./plsql-CJT4f8Nt.js")
	},
	{
		id: "po",
		name: "Gettext PO",
		aliases: ["pot", "potx"],
		import: () => import("./po-DZYArtPH.js")
	},
	{
		id: "polar",
		name: "Polar",
		import: () => import("./polar-UjPOEnEU.js")
	},
	{
		id: "postcss",
		name: "PostCSS",
		import: () => import("./postcss-B7VSWzdU.js")
	},
	{
		id: "powerquery",
		name: "PowerQuery",
		import: () => import("./powerquery-CXCH0Qwm.js")
	},
	{
		id: "powershell",
		name: "PowerShell",
		aliases: ["ps", "ps1"],
		import: () => import("./powershell-galGYPHu.js")
	},
	{
		id: "prisma",
		name: "Prisma",
		import: () => import("./prisma-B_7QPsY9.js")
	},
	{
		id: "prolog",
		name: "Prolog",
		import: () => import("./prolog-CG4aGiIr.js")
	},
	{
		id: "proto",
		name: "Protocol Buffer 3",
		aliases: ["protobuf"],
		import: () => import("./proto-DOgv3qhv.js")
	},
	{
		id: "pug",
		name: "Pug",
		aliases: ["jade"],
		import: () => import("./pug-B5fz_N-p.js")
	},
	{
		id: "puppet",
		name: "Puppet",
		import: () => import("./puppet-Cfub3OuW.js")
	},
	{
		id: "purescript",
		name: "PureScript",
		import: () => import("./purescript-Cstxdo1m.js")
	},
	{
		id: "python",
		name: "Python",
		aliases: ["py"],
		import: () => import("./python-Cc4_zWRZ.js")
	},
	{
		id: "qml",
		name: "QML",
		import: () => import("./qml-B8Unsby6.js")
	},
	{
		id: "qmldir",
		name: "QML Directory",
		import: () => import("./qmldir-B-KvDFoq.js")
	},
	{
		id: "qss",
		name: "Qt Style Sheets",
		import: () => import("./qss-BQ7lnt5Q.js")
	},
	{
		id: "r",
		name: "R",
		import: () => import("./r-CmWlAmxv.js")
	},
	{
		id: "racket",
		name: "Racket",
		import: () => import("./racket-Brv8hhOJ.js")
	},
	{
		id: "raku",
		name: "Raku",
		aliases: ["perl6"],
		import: () => import("./raku-eJMtYy9M.js")
	},
	{
		id: "razor",
		name: "ASP.NET Razor",
		import: () => import("./razor-Bp4Kvres.js")
	},
	{
		id: "reg",
		name: "Windows Registry Script",
		import: () => import("./reg-CnEdo1fY.js")
	},
	{
		id: "regexp",
		name: "RegExp",
		aliases: ["regex"],
		import: () => import("./regexp-fRltvscZ.js")
	},
	{
		id: "rel",
		name: "Rel",
		import: () => import("./rel-BiJ-lIp-.js")
	},
	{
		id: "riscv",
		name: "RISC-V",
		import: () => import("./riscv-uqoXiHrG.js")
	},
	{
		id: "rst",
		name: "reStructuredText",
		import: () => import("./rst-bi3-IUvz.js")
	},
	{
		id: "ruby",
		name: "Ruby",
		aliases: ["rb"],
		import: () => import("./ruby-9S8a-5_i.js")
	},
	{
		id: "rust",
		name: "Rust",
		aliases: ["rs"],
		import: () => import("./rust-D9-z0wLQ.js")
	},
	{
		id: "sas",
		name: "SAS",
		import: () => import("./sas-BpYSsk5u.js")
	},
	{
		id: "sass",
		name: "Sass",
		import: () => import("./sass-CM-y7JbP.js")
	},
	{
		id: "scala",
		name: "Scala",
		import: () => import("./scala-BNt7HIVb.js")
	},
	{
		id: "scheme",
		name: "Scheme",
		import: () => import("./scheme-CFMFAV75.js")
	},
	{
		id: "scss",
		name: "SCSS",
		import: () => import("./scss-DsH_2jhr.js")
	},
	{
		id: "sdbl",
		name: "1C (Query)",
		aliases: ["1c-query"],
		import: () => import("./sdbl-v3FW7Zdp.js")
	},
	{
		id: "shaderlab",
		name: "ShaderLab",
		aliases: ["shader"],
		import: () => import("./shaderlab-DN3ZDJsz.js")
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
		import: () => import("./shellscript-D-k9mwuy.js")
	},
	{
		id: "shellsession",
		name: "Shell Session",
		aliases: ["console"],
		import: () => import("./shellsession-CI1EBdVf.js")
	},
	{
		id: "smalltalk",
		name: "Smalltalk",
		import: () => import("./smalltalk-MUSCy22n.js")
	},
	{
		id: "solidity",
		name: "Solidity",
		import: () => import("./solidity-k9C6gUf8.js")
	},
	{
		id: "soy",
		name: "Closure Templates",
		aliases: ["closure-templates"],
		import: () => import("./soy-Cq8zsAnr.js")
	},
	{
		id: "sparql",
		name: "SPARQL",
		import: () => import("./sparql--JVCU0uh.js")
	},
	{
		id: "splunk",
		name: "Splunk Query Language",
		aliases: ["spl"],
		import: () => import("./splunk-t2zI7Eju.js")
	},
	{
		id: "sql",
		name: "SQL",
		import: () => import("./sql-BiC3d3Cm.js")
	},
	{
		id: "ssh-config",
		name: "SSH Config",
		import: () => import("./ssh-config-DWFrelot.js")
	},
	{
		id: "stata",
		name: "Stata",
		import: () => import("./stata-L-SGnb_x.js")
	},
	{
		id: "stylus",
		name: "Stylus",
		aliases: ["styl"],
		import: () => import("./stylus-Cvyk1yPa.js")
	},
	{
		id: "svelte",
		name: "Svelte",
		import: () => import("./svelte-CaxjuaY0.js")
	},
	{
		id: "swift",
		name: "Swift",
		import: () => import("./swift-CJVmToiH.js")
	},
	{
		id: "system-verilog",
		name: "SystemVerilog",
		import: () => import("./system-verilog-DHkJYM74.js")
	},
	{
		id: "systemd",
		name: "Systemd Units",
		import: () => import("./systemd-B548Q9Wr.js")
	},
	{
		id: "talonscript",
		name: "TalonScript",
		aliases: ["talon"],
		import: () => import("./talonscript-BLbO0TYS.js")
	},
	{
		id: "tasl",
		name: "Tasl",
		import: () => import("./tasl-NwREUinY.js")
	},
	{
		id: "tcl",
		name: "Tcl",
		import: () => import("./tcl-C2L9tRo3.js")
	},
	{
		id: "templ",
		name: "Templ",
		import: () => import("./templ-S2mBvN0S.js")
	},
	{
		id: "terraform",
		name: "Terraform",
		aliases: ["tf", "tfvars"],
		import: () => import("./terraform-C6ylDBH-.js")
	},
	{
		id: "tex",
		name: "TeX",
		import: () => import("./tex-DW-FSYIO.js")
	},
	{
		id: "toml",
		name: "TOML",
		import: () => import("./toml-CU9ajv0e.js")
	},
	{
		id: "ts-tags",
		name: "TypeScript with Tags",
		aliases: ["lit"],
		import: () => import("./ts-tags-B4nGi3BQ.js")
	},
	{
		id: "tsv",
		name: "TSV",
		import: () => import("./tsv-45remwqE.js")
	},
	{
		id: "tsx",
		name: "TSX",
		import: () => import("./tsx-DbP0eqS3.js")
	},
	{
		id: "turtle",
		name: "Turtle",
		import: () => import("./turtle-8Td7gwAO.js")
	},
	{
		id: "twig",
		name: "Twig",
		import: () => import("./twig-DJUKoRXG.js")
	},
	{
		id: "typescript",
		name: "TypeScript",
		aliases: ["ts"],
		import: () => import("./typescript-B_ef9_SD.js")
	},
	{
		id: "typespec",
		name: "TypeSpec",
		aliases: ["tsp"],
		import: () => import("./typespec-CZKCbYC6.js")
	},
	{
		id: "typst",
		name: "Typst",
		aliases: ["typ"],
		import: () => import("./typst-DRv9mV7U.js")
	},
	{
		id: "v",
		name: "V",
		import: () => import("./v-C06qFO1I.js")
	},
	{
		id: "vala",
		name: "Vala",
		import: () => import("./vala-CF0L9-X2.js")
	},
	{
		id: "vb",
		name: "Visual Basic",
		aliases: ["cmd"],
		import: () => import("./vb-CFlHAudk.js")
	},
	{
		id: "verilog",
		name: "Verilog",
		import: () => import("./verilog-DS0_vWNE.js")
	},
	{
		id: "vhdl",
		name: "VHDL",
		import: () => import("./vhdl-dyLZYf1g.js")
	},
	{
		id: "viml",
		name: "Vim Script",
		aliases: ["vim", "vimscript"],
		import: () => import("./viml-D_43r79k.js")
	},
	{
		id: "vue",
		name: "Vue",
		import: () => import("./vue-D6qdEJge.js")
	},
	{
		id: "vue-html",
		name: "Vue HTML",
		import: () => import("./vue-html-BKnsNo0L.js")
	},
	{
		id: "vyper",
		name: "Vyper",
		aliases: ["vy"],
		import: () => import("./vyper-B9SdRhtM.js")
	},
	{
		id: "wasm",
		name: "WebAssembly",
		import: () => import("./wasm-wKFE2BPS.js")
	},
	{
		id: "wenyan",
		name: "Wenyan",
		aliases: ["文言"],
		import: () => import("./wenyan-BgfTwkom.js")
	},
	{
		id: "wgsl",
		name: "WGSL",
		import: () => import("./wgsl-SUoQISUg.js")
	},
	{
		id: "wikitext",
		name: "Wikitext",
		aliases: ["mediawiki", "wiki"],
		import: () => import("./wikitext-BQRBzVR-.js")
	},
	{
		id: "wolfram",
		name: "Wolfram",
		aliases: ["wl"],
		import: () => import("./wolfram-wzJ0Wai0.js")
	},
	{
		id: "xml",
		name: "XML",
		import: () => import("./xml-D7zeR20O.js")
	},
	{
		id: "xsl",
		name: "XSL",
		import: () => import("./xsl-DV-6lQf9.js")
	},
	{
		id: "yaml",
		name: "YAML",
		aliases: ["yml"],
		import: () => import("./yaml-j-ZVQsJi.js")
	},
	{
		id: "zenscript",
		name: "ZenScript",
		import: () => import("./zenscript-UkaAS4Lv.js")
	},
	{
		id: "zig",
		name: "Zig",
		import: () => import("./zig-C28f8AFW.js")
	}
], bundledLanguagesBase = Object.fromEntries(bundledLanguagesInfo.map((s) => [s.id, s.import])), bundledLanguagesAlias = Object.fromEntries(bundledLanguagesInfo.flatMap((s) => s.aliases?.map((I) => [I, s.import]) || [])), bundledLanguages = {
	...bundledLanguagesBase,
	...bundledLanguagesAlias
}, bundledThemes = Object.fromEntries([
	{
		id: "andromeeda",
		displayName: "Andromeeda",
		type: "dark",
		import: () => import("./andromeeda-5pik5mll.js")
	},
	{
		id: "aurora-x",
		displayName: "Aurora X",
		type: "dark",
		import: () => import("./aurora-x-DUgjlS2o.js")
	},
	{
		id: "ayu-dark",
		displayName: "Ayu Dark",
		type: "dark",
		import: () => import("./ayu-dark-BXPNFeDF.js")
	},
	{
		id: "catppuccin-frappe",
		displayName: "Catppuccin Frappé",
		type: "dark",
		import: () => import("./catppuccin-frappe-BiEeQ7rz.js")
	},
	{
		id: "catppuccin-latte",
		displayName: "Catppuccin Latte",
		type: "light",
		import: () => import("./catppuccin-latte-1ks7ulUc.js")
	},
	{
		id: "catppuccin-macchiato",
		displayName: "Catppuccin Macchiato",
		type: "dark",
		import: () => import("./catppuccin-macchiato-CrS_hj_p.js")
	},
	{
		id: "catppuccin-mocha",
		displayName: "Catppuccin Mocha",
		type: "dark",
		import: () => import("./catppuccin-mocha-BOTLeO64.js")
	},
	{
		id: "dark-plus",
		displayName: "Dark Plus",
		type: "dark",
		import: () => import("./dark-plus-CcHvQoqj.js")
	},
	{
		id: "dracula",
		displayName: "Dracula Theme",
		type: "dark",
		import: () => import("./dracula-CBPir8te.js")
	},
	{
		id: "dracula-soft",
		displayName: "Dracula Theme Soft",
		type: "dark",
		import: () => import("./dracula-soft-CJ_0Rv1r.js")
	},
	{
		id: "everforest-dark",
		displayName: "Everforest Dark",
		type: "dark",
		import: () => import("./everforest-dark-DzzeMygO.js")
	},
	{
		id: "everforest-light",
		displayName: "Everforest Light",
		type: "light",
		import: () => import("./everforest-light--xNSbTOa.js")
	},
	{
		id: "github-dark",
		displayName: "GitHub Dark",
		type: "dark",
		import: () => import("./github-dark-BFQyUD-N.js")
	},
	{
		id: "github-dark-default",
		displayName: "GitHub Dark Default",
		type: "dark",
		import: () => import("./github-dark-default-BZ6qkWOc.js")
	},
	{
		id: "github-dark-dimmed",
		displayName: "GitHub Dark Dimmed",
		type: "dark",
		import: () => import("./github-dark-dimmed-n8U77RSR.js")
	},
	{
		id: "github-dark-high-contrast",
		displayName: "GitHub Dark High Contrast",
		type: "dark",
		import: () => import("./github-dark-high-contrast-BTEyEqxe.js")
	},
	{
		id: "github-light",
		displayName: "GitHub Light",
		type: "light",
		import: () => import("./github-light-BQotEKwe.js")
	},
	{
		id: "github-light-default",
		displayName: "GitHub Light Default",
		type: "light",
		import: () => import("./github-light-default-C-OrzS68.js")
	},
	{
		id: "github-light-high-contrast",
		displayName: "GitHub Light High Contrast",
		type: "light",
		import: () => import("./github-light-high-contrast-DqAJZznb.js")
	},
	{
		id: "houston",
		displayName: "Houston",
		type: "dark",
		import: () => import("./houston-CXiKHMlH.js")
	},
	{
		id: "kanagawa-dragon",
		displayName: "Kanagawa Dragon",
		type: "dark",
		import: () => import("./kanagawa-dragon-BtnNpycE.js")
	},
	{
		id: "kanagawa-lotus",
		displayName: "Kanagawa Lotus",
		type: "light",
		import: () => import("./kanagawa-lotus-CSAChgGt.js")
	},
	{
		id: "kanagawa-wave",
		displayName: "Kanagawa Wave",
		type: "dark",
		import: () => import("./kanagawa-wave-92EFKKOB.js")
	},
	{
		id: "laserwave",
		displayName: "LaserWave",
		type: "dark",
		import: () => import("./laserwave-hrmxiEMY.js")
	},
	{
		id: "light-plus",
		displayName: "Light Plus",
		type: "light",
		import: () => import("./light-plus-BVtVa2PP.js")
	},
	{
		id: "material-theme",
		displayName: "Material Theme",
		type: "dark",
		import: () => import("./material-theme-DIezVnnR.js")
	},
	{
		id: "material-theme-darker",
		displayName: "Material Theme Darker",
		type: "dark",
		import: () => import("./material-theme-darker-BzBhimBJ.js")
	},
	{
		id: "material-theme-lighter",
		displayName: "Material Theme Lighter",
		type: "light",
		import: () => import("./material-theme-lighter-BLvuFF3G.js")
	},
	{
		id: "material-theme-ocean",
		displayName: "Material Theme Ocean",
		type: "dark",
		import: () => import("./material-theme-ocean-CPWfmTi5.js")
	},
	{
		id: "material-theme-palenight",
		displayName: "Material Theme Palenight",
		type: "dark",
		import: () => import("./material-theme-palenight-68A9FvN7.js")
	},
	{
		id: "min-dark",
		displayName: "Min Dark",
		type: "dark",
		import: () => import("./min-dark-76Dae5Jk.js")
	},
	{
		id: "min-light",
		displayName: "Min Light",
		type: "light",
		import: () => import("./min-light-ZSqa300P.js")
	},
	{
		id: "monokai",
		displayName: "Monokai",
		type: "dark",
		import: () => import("./monokai-iS1cJV2z.js")
	},
	{
		id: "night-owl",
		displayName: "Night Owl",
		type: "dark",
		import: () => import("./night-owl-C7BsTARB.js")
	},
	{
		id: "nord",
		displayName: "Nord",
		type: "dark",
		import: () => import("./nord-CPFQBzp9.js")
	},
	{
		id: "one-dark-pro",
		displayName: "One Dark Pro",
		type: "dark",
		import: () => import("./one-dark-pro-DMv9p5MA.js")
	},
	{
		id: "one-light",
		displayName: "One Light",
		type: "light",
		import: () => import("./one-light-Bc0PWibD.js")
	},
	{
		id: "plastic",
		displayName: "Plastic",
		type: "dark",
		import: () => import("./plastic-CnHi1Dah.js")
	},
	{
		id: "poimandres",
		displayName: "Poimandres",
		type: "dark",
		import: () => import("./poimandres-DmpAFPU5.js")
	},
	{
		id: "red",
		displayName: "Red",
		type: "dark",
		import: () => import("./red-mUlpyWeh.js")
	},
	{
		id: "rose-pine",
		displayName: "Rosé Pine",
		type: "dark",
		import: () => import("./rose-pine-XbrMuSNV.js")
	},
	{
		id: "rose-pine-dawn",
		displayName: "Rosé Pine Dawn",
		type: "light",
		import: () => import("./rose-pine-dawn-Cd43hkIB.js")
	},
	{
		id: "rose-pine-moon",
		displayName: "Rosé Pine Moon",
		type: "dark",
		import: () => import("./rose-pine-moon-CNvYJY_R.js")
	},
	{
		id: "slack-dark",
		displayName: "Slack Dark",
		type: "dark",
		import: () => import("./slack-dark-CrMcaxnx.js")
	},
	{
		id: "slack-ochin",
		displayName: "Slack Ochin",
		type: "light",
		import: () => import("./slack-ochin-DUNfRZvp.js")
	},
	{
		id: "snazzy-light",
		displayName: "Snazzy Light",
		type: "light",
		import: () => import("./snazzy-light-Ds-xL_dJ.js")
	},
	{
		id: "solarized-dark",
		displayName: "Solarized Dark",
		type: "dark",
		import: () => import("./solarized-dark-DBul5zax.js")
	},
	{
		id: "solarized-light",
		displayName: "Solarized Light",
		type: "light",
		import: () => import("./solarized-light-ByZe0SWc.js")
	},
	{
		id: "synthwave-84",
		displayName: "Synthwave '84",
		type: "dark",
		import: () => import("./synthwave-84-Bjr9vBWn.js")
	},
	{
		id: "tokyo-night",
		displayName: "Tokyo Night",
		type: "dark",
		import: () => import("./tokyo-night-DUayxYkQ.js")
	},
	{
		id: "vesper",
		displayName: "Vesper",
		type: "dark",
		import: () => import("./vesper-D2NLJCkE.js")
	},
	{
		id: "vitesse-black",
		displayName: "Vitesse Black",
		type: "dark",
		import: () => import("./vitesse-black-CN42CDxl.js")
	},
	{
		id: "vitesse-dark",
		displayName: "Vitesse Dark",
		type: "dark",
		import: () => import("./vitesse-dark-DXlxLz3s.js")
	},
	{
		id: "vitesse-light",
		displayName: "Vitesse Light",
		type: "light",
		import: () => import("./vitesse-light-DAqRfg-U.js")
	}
].map((s) => [s.id, s.import])), ShikiError = class extends Error {
	constructor(s) {
		super(s), this.name = "ShikiError";
	}
}, ShikiError$2 = class extends Error {
	constructor(s) {
		super(s), this.name = "ShikiError";
	}
};
function getHeapMax() {
	return 2147483648;
}
function _emscripten_get_now() {
	return typeof performance < "u" ? performance.now() : Date.now();
}
var alignUp = (s, I) => s + (I - s % I) % I;
async function main(s) {
	let I, L, R = {};
	function z(s) {
		L = s, R.HEAPU8 = new Uint8Array(s), R.HEAPU32 = new Uint32Array(s);
	}
	function B(s, I, L) {
		R.HEAPU8.copyWithin(s, I, I + L);
	}
	function V(s) {
		try {
			return I.grow(s - L.byteLength + 65535 >>> 16), z(I.buffer), 1;
		} catch {}
	}
	function H(s) {
		let I = R.HEAPU8.length;
		s >>>= 0;
		let L = getHeapMax();
		if (s > L) return !1;
		for (let R = 1; R <= 4; R *= 2) {
			let z = I * (1 + .2 / R);
			if (z = Math.min(z, s + 100663296), V(Math.min(L, alignUp(Math.max(s, z), 65536)))) return !0;
		}
		return !1;
	}
	let U = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
	function W(s, I, L = 1024) {
		let R = I + L, z = I;
		for (; s[z] && !(z >= R);) ++z;
		if (z - I > 16 && s.buffer && U) return U.decode(s.subarray(I, z));
		let B = "";
		for (; I < z;) {
			let L = s[I++];
			if (!(L & 128)) {
				B += String.fromCharCode(L);
				continue;
			}
			let R = s[I++] & 63;
			if ((L & 224) == 192) {
				B += String.fromCharCode((L & 31) << 6 | R);
				continue;
			}
			let z = s[I++] & 63;
			if (L = (L & 240) == 224 ? (L & 15) << 12 | R << 6 | z : (L & 7) << 18 | R << 12 | z << 6 | s[I++] & 63, L < 65536) B += String.fromCharCode(L);
			else {
				let s = L - 65536;
				B += String.fromCharCode(55296 | s >> 10, 56320 | s & 1023);
			}
		}
		return B;
	}
	function G(s, I) {
		return s ? W(R.HEAPU8, s, I) : "";
	}
	let K = {
		emscripten_get_now: _emscripten_get_now,
		emscripten_memcpy_big: B,
		emscripten_resize_heap: H,
		fd_write: () => 0
	};
	async function q() {
		let L = await s({
			env: K,
			wasi_snapshot_preview1: K
		});
		I = L.memory, z(I.buffer), Object.assign(R, L), R.UTF8ToString = G;
	}
	return await q(), R;
}
var __defProp = Object.defineProperty, __defNormalProp = (s, I, L) => I in s ? __defProp(s, I, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: L
}) : s[I] = L, __publicField = (s, I, L) => (__defNormalProp(s, typeof I == "symbol" ? I : I + "", L), L), onigBinding = null;
function throwLastOnigError(s) {
	throw new ShikiError$2(s.UTF8ToString(s.getLastOnigError()));
}
var UtfString = class s {
	constructor(I) {
		__publicField(this, "utf16Length"), __publicField(this, "utf8Length"), __publicField(this, "utf16Value"), __publicField(this, "utf8Value"), __publicField(this, "utf16OffsetToUtf8"), __publicField(this, "utf8OffsetToUtf16");
		let L = I.length, R = s._utf8ByteLength(I), z = R !== L, B = z ? new Uint32Array(L + 1) : null;
		z && (B[L] = R);
		let V = z ? new Uint32Array(R + 1) : null;
		z && (V[R] = L);
		let H = new Uint8Array(R), U = 0;
		for (let s = 0; s < L; s++) {
			let R = I.charCodeAt(s), W = R, G = !1;
			if (R >= 55296 && R <= 56319 && s + 1 < L) {
				let L = I.charCodeAt(s + 1);
				L >= 56320 && L <= 57343 && (W = (R - 55296 << 10) + 65536 | L - 56320, G = !0);
			}
			z && (B[s] = U, G && (B[s + 1] = U), W <= 127 ? V[U + 0] = s : W <= 2047 ? (V[U + 0] = s, V[U + 1] = s) : W <= 65535 ? (V[U + 0] = s, V[U + 1] = s, V[U + 2] = s) : (V[U + 0] = s, V[U + 1] = s, V[U + 2] = s, V[U + 3] = s)), W <= 127 ? H[U++] = W : W <= 2047 ? (H[U++] = 192 | (W & 1984) >>> 6, H[U++] = 128 | (W & 63) >>> 0) : W <= 65535 ? (H[U++] = 224 | (W & 61440) >>> 12, H[U++] = 128 | (W & 4032) >>> 6, H[U++] = 128 | (W & 63) >>> 0) : (H[U++] = 240 | (W & 1835008) >>> 18, H[U++] = 128 | (W & 258048) >>> 12, H[U++] = 128 | (W & 4032) >>> 6, H[U++] = 128 | (W & 63) >>> 0), G && s++;
		}
		this.utf16Length = L, this.utf8Length = R, this.utf16Value = I, this.utf8Value = H, this.utf16OffsetToUtf8 = B, this.utf8OffsetToUtf16 = V;
	}
	static _utf8ByteLength(s) {
		let I = 0;
		for (let L = 0, R = s.length; L < R; L++) {
			let z = s.charCodeAt(L), B = z, V = !1;
			if (z >= 55296 && z <= 56319 && L + 1 < R) {
				let I = s.charCodeAt(L + 1);
				I >= 56320 && I <= 57343 && (B = (z - 55296 << 10) + 65536 | I - 56320, V = !0);
			}
			B <= 127 ? I += 1 : B <= 2047 ? I += 2 : B <= 65535 ? I += 3 : I += 4, V && L++;
		}
		return I;
	}
	createString(s) {
		let I = s.omalloc(this.utf8Length);
		return s.HEAPU8.set(this.utf8Value, I), I;
	}
}, _OnigString = class {
	constructor(s) {
		if (__publicField(this, "id", ++_OnigString.LAST_ID), __publicField(this, "_onigBinding"), __publicField(this, "content"), __publicField(this, "utf16Length"), __publicField(this, "utf8Length"), __publicField(this, "utf16OffsetToUtf8"), __publicField(this, "utf8OffsetToUtf16"), __publicField(this, "ptr"), !onigBinding) throw new ShikiError$2("Must invoke loadWasm first.");
		this._onigBinding = onigBinding, this.content = s;
		let I = new UtfString(s);
		this.utf16Length = I.utf16Length, this.utf8Length = I.utf8Length, this.utf16OffsetToUtf8 = I.utf16OffsetToUtf8, this.utf8OffsetToUtf16 = I.utf8OffsetToUtf16, this.utf8Length < 1e4 && !_OnigString._sharedPtrInUse ? (_OnigString._sharedPtr ||= onigBinding.omalloc(1e4), _OnigString._sharedPtrInUse = !0, onigBinding.HEAPU8.set(I.utf8Value, _OnigString._sharedPtr), this.ptr = _OnigString._sharedPtr) : this.ptr = I.createString(onigBinding);
	}
	convertUtf8OffsetToUtf16(s) {
		return this.utf8OffsetToUtf16 ? s < 0 ? 0 : s > this.utf8Length ? this.utf16Length : this.utf8OffsetToUtf16[s] : s;
	}
	convertUtf16OffsetToUtf8(s) {
		return this.utf16OffsetToUtf8 ? s < 0 ? 0 : s > this.utf16Length ? this.utf8Length : this.utf16OffsetToUtf8[s] : s;
	}
	dispose() {
		this.ptr === _OnigString._sharedPtr ? _OnigString._sharedPtrInUse = !1 : this._onigBinding.ofree(this.ptr);
	}
}, OnigString = _OnigString;
__publicField(OnigString, "LAST_ID", 0), __publicField(OnigString, "_sharedPtr", 0), __publicField(OnigString, "_sharedPtrInUse", !1);
var OnigScanner = class {
	constructor(s) {
		if (__publicField(this, "_onigBinding"), __publicField(this, "_ptr"), !onigBinding) throw new ShikiError$2("Must invoke loadWasm first.");
		let I = [], L = [];
		for (let R = 0, z = s.length; R < z; R++) {
			let z = new UtfString(s[R]);
			I[R] = z.createString(onigBinding), L[R] = z.utf8Length;
		}
		let R = onigBinding.omalloc(4 * s.length);
		onigBinding.HEAPU32.set(I, R / 4);
		let z = onigBinding.omalloc(4 * s.length);
		onigBinding.HEAPU32.set(L, z / 4);
		let B = onigBinding.createOnigScanner(R, z, s.length);
		for (let L = 0, R = s.length; L < R; L++) onigBinding.ofree(I[L]);
		onigBinding.ofree(z), onigBinding.ofree(R), B === 0 && throwLastOnigError(onigBinding), this._onigBinding = onigBinding, this._ptr = B;
	}
	dispose() {
		this._onigBinding.freeOnigScanner(this._ptr);
	}
	findNextMatchSync(s, I, L) {
		let R = 0;
		if (typeof L == "number" && (R = L), typeof s == "string") {
			s = new OnigString(s);
			let L = this._findNextMatchSync(s, I, !1, R);
			return s.dispose(), L;
		}
		return this._findNextMatchSync(s, I, !1, R);
	}
	_findNextMatchSync(s, I, L, R) {
		let z = this._onigBinding, B = z.findNextOnigScannerMatch(this._ptr, s.id, s.ptr, s.utf8Length, s.convertUtf16OffsetToUtf8(I), R);
		if (B === 0) return null;
		let V = z.HEAPU32, H = B / 4, U = V[H++], W = V[H++], G = [];
		for (let I = 0; I < W; I++) {
			let L = s.convertUtf8OffsetToUtf16(V[H++]), R = s.convertUtf8OffsetToUtf16(V[H++]);
			G[I] = {
				start: L,
				end: R,
				length: R - L
			};
		}
		return {
			index: U,
			captureIndices: G
		};
	}
};
function isInstantiatorOptionsObject(s) {
	return typeof s.instantiator == "function";
}
function isInstantiatorModule(s) {
	return typeof s.default == "function";
}
function isDataOptionsObject(s) {
	return s.data !== void 0;
}
function isResponse(s) {
	return typeof Response < "u" && s instanceof Response;
}
function isArrayBuffer(s) {
	return typeof ArrayBuffer < "u" && (s instanceof ArrayBuffer || ArrayBuffer.isView(s)) || typeof Buffer < "u" && Buffer.isBuffer?.(s) || typeof SharedArrayBuffer < "u" && s instanceof SharedArrayBuffer || typeof Uint32Array < "u" && s instanceof Uint32Array;
}
var initPromise;
function loadWasm(s) {
	if (initPromise) return initPromise;
	async function I() {
		onigBinding = await main(async (I) => {
			let L = s;
			return L = await L, typeof L == "function" && (L = await L(I)), typeof L == "function" && (L = await L(I)), isInstantiatorOptionsObject(L) ? L = await L.instantiator(I) : isInstantiatorModule(L) ? L = await L.default(I) : (isDataOptionsObject(L) && (L = L.data), isResponse(L) ? L = typeof WebAssembly.instantiateStreaming == "function" ? await _makeResponseStreamingLoader(L)(I) : await _makeResponseNonStreamingLoader(L)(I) : isArrayBuffer(L) || L instanceof WebAssembly.Module ? L = await _makeArrayBufferLoader(L)(I) : "default" in L && L.default instanceof WebAssembly.Module && (L = await _makeArrayBufferLoader(L.default)(I))), "instance" in L && (L = L.instance), "exports" in L && (L = L.exports), L;
		});
	}
	return initPromise = I(), initPromise;
}
function _makeArrayBufferLoader(s) {
	return (I) => WebAssembly.instantiate(s, I);
}
function _makeResponseStreamingLoader(s) {
	return (I) => WebAssembly.instantiateStreaming(s, I);
}
function _makeResponseNonStreamingLoader(s) {
	return async (I) => {
		let L = await s.arrayBuffer();
		return WebAssembly.instantiate(L, I);
	};
}
var _defaultWasmLoader;
function getDefaultWasmLoader() {
	return _defaultWasmLoader;
}
async function createOnigurumaEngine(s) {
	return s && await loadWasm(s), {
		createScanner(s) {
			return new OnigScanner(s.map((s) => typeof s == "string" ? s : s.source));
		},
		createString(s) {
			return new OnigString(s);
		}
	};
}
var _emitDeprecation = !1, _emitError = !1;
function warnDeprecated(s, I = 3) {
	if (_emitDeprecation && !(typeof _emitDeprecation == "number" && I > _emitDeprecation)) {
		if (_emitError) throw Error(`[SHIKI DEPRECATE]: ${s}`);
		console.trace(`[SHIKI DEPRECATE]: ${s}`);
	}
}
function clone(s) {
	return doClone(s);
}
function doClone(s) {
	return Array.isArray(s) ? cloneArray(s) : s instanceof RegExp ? s : typeof s == "object" ? cloneObj(s) : s;
}
function cloneArray(s) {
	let I = [];
	for (let L = 0, R = s.length; L < R; L++) I[L] = doClone(s[L]);
	return I;
}
function cloneObj(s) {
	let I = {};
	for (let L in s) I[L] = doClone(s[L]);
	return I;
}
function mergeObjects(s, ...I) {
	return I.forEach((I) => {
		for (let L in I) s[L] = I[L];
	}), s;
}
function basename(s) {
	let I = ~s.lastIndexOf("/") || ~s.lastIndexOf("\\");
	return I === 0 ? s : ~I === s.length - 1 ? basename(s.substring(0, s.length - 1)) : s.substr(~I + 1);
}
var CAPTURING_REGEX_SOURCE = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g, RegexSource = class {
	static hasCaptures(s) {
		return s === null ? !1 : (CAPTURING_REGEX_SOURCE.lastIndex = 0, CAPTURING_REGEX_SOURCE.test(s));
	}
	static replaceCaptures(s, I, L) {
		return s.replace(CAPTURING_REGEX_SOURCE, (s, R, z, B) => {
			let V = L[parseInt(R || z, 10)];
			if (V) {
				let s = I.substring(V.start, V.end);
				for (; s[0] === ".";) s = s.substring(1);
				switch (B) {
					case "downcase": return s.toLowerCase();
					case "upcase": return s.toUpperCase();
					default: return s;
				}
			} else return s;
		});
	}
};
function strcmp(s, I) {
	return s < I ? -1 : s > I ? 1 : 0;
}
function strArrCmp(s, I) {
	if (s === null && I === null) return 0;
	if (!s) return -1;
	if (!I) return 1;
	let L = s.length, R = I.length;
	if (L === R) {
		for (let R = 0; R < L; R++) {
			let L = strcmp(s[R], I[R]);
			if (L !== 0) return L;
		}
		return 0;
	}
	return L - R;
}
function isValidHexColor(s) {
	return !!(/^#[0-9a-f]{6}$/i.test(s) || /^#[0-9a-f]{8}$/i.test(s) || /^#[0-9a-f]{3}$/i.test(s) || /^#[0-9a-f]{4}$/i.test(s));
}
function escapeRegExpCharacters(s) {
	return s.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
}
var CachedFn = class {
	constructor(s) {
		this.fn = s;
	}
	cache = /* @__PURE__ */ new Map();
	get(s) {
		if (this.cache.has(s)) return this.cache.get(s);
		let I = this.fn(s);
		return this.cache.set(s, I), I;
	}
}, Theme = class {
	constructor(s, I, L) {
		this._colorMap = s, this._defaults = I, this._root = L;
	}
	static createFromRawTheme(s, I) {
		return this.createFromParsedTheme(parseTheme(s), I);
	}
	static createFromParsedTheme(s, I) {
		return resolveParsedThemeRules(s, I);
	}
	_cachedMatchRoot = new CachedFn((s) => this._root.match(s));
	getColorMap() {
		return this._colorMap.getColorMap();
	}
	getDefaults() {
		return this._defaults;
	}
	match(s) {
		if (s === null) return this._defaults;
		let I = s.scopeName, L = this._cachedMatchRoot.get(I).find((I) => _scopePathMatchesParentScopes(s.parent, I.parentScopes));
		return L ? new StyleAttributes(L.fontStyle, L.foreground, L.background) : null;
	}
}, ScopeStack = class s {
	constructor(s, I) {
		this.parent = s, this.scopeName = I;
	}
	static push(I, L) {
		for (let R of L) I = new s(I, R);
		return I;
	}
	static from(...I) {
		let L = null;
		for (let R = 0; R < I.length; R++) L = new s(L, I[R]);
		return L;
	}
	push(I) {
		return new s(this, I);
	}
	getSegments() {
		let s = this, I = [];
		for (; s;) I.push(s.scopeName), s = s.parent;
		return I.reverse(), I;
	}
	toString() {
		return this.getSegments().join(" ");
	}
	extends(s) {
		return this === s ? !0 : this.parent === null ? !1 : this.parent.extends(s);
	}
	getExtensionIfDefined(s) {
		let I = [], L = this;
		for (; L && L !== s;) I.push(L.scopeName), L = L.parent;
		return L === s ? I.reverse() : void 0;
	}
};
function _scopePathMatchesParentScopes(s, I) {
	if (I.length === 0) return !0;
	for (let L = 0; L < I.length; L++) {
		let R = I[L], z = !1;
		if (R === ">") {
			if (L === I.length - 1) return !1;
			R = I[++L], z = !0;
		}
		for (; s && !_matchesScope(s.scopeName, R);) {
			if (z) return !1;
			s = s.parent;
		}
		if (!s) return !1;
		s = s.parent;
	}
	return !0;
}
function _matchesScope(s, I) {
	return I === s || s.startsWith(I) && s[I.length] === ".";
}
var StyleAttributes = class {
	constructor(s, I, L) {
		this.fontStyle = s, this.foregroundId = I, this.backgroundId = L;
	}
};
function parseTheme(s) {
	if (!s || !s.settings || !Array.isArray(s.settings)) return [];
	let I = s.settings, L = [], R = 0;
	for (let s = 0, z = I.length; s < z; s++) {
		let z = I[s];
		if (!z.settings) continue;
		let B;
		if (typeof z.scope == "string") {
			let s = z.scope;
			s = s.replace(/^[,]+/, ""), s = s.replace(/[,]+$/, ""), B = s.split(",");
		} else B = Array.isArray(z.scope) ? z.scope : [""];
		let V = -1;
		if (typeof z.settings.fontStyle == "string") {
			V = 0;
			let s = z.settings.fontStyle.split(" ");
			for (let I = 0, L = s.length; I < L; I++) switch (s[I]) {
				case "italic":
					V |= 1;
					break;
				case "bold":
					V |= 2;
					break;
				case "underline":
					V |= 4;
					break;
				case "strikethrough":
					V |= 8;
					break;
			}
		}
		let H = null;
		typeof z.settings.foreground == "string" && isValidHexColor(z.settings.foreground) && (H = z.settings.foreground);
		let U = null;
		typeof z.settings.background == "string" && isValidHexColor(z.settings.background) && (U = z.settings.background);
		for (let I = 0, z = B.length; I < z; I++) {
			let z = B[I].trim().split(" "), W = z[z.length - 1], G = null;
			z.length > 1 && (G = z.slice(0, z.length - 1), G.reverse()), L[R++] = new ParsedThemeRule(W, G, s, V, H, U);
		}
	}
	return L;
}
var ParsedThemeRule = class {
	constructor(s, I, L, R, z, B) {
		this.scope = s, this.parentScopes = I, this.index = L, this.fontStyle = R, this.foreground = z, this.background = B;
	}
}, FontStyle = /* @__PURE__ */ ((s) => (s[s.NotSet = -1] = "NotSet", s[s.None = 0] = "None", s[s.Italic = 1] = "Italic", s[s.Bold = 2] = "Bold", s[s.Underline = 4] = "Underline", s[s.Strikethrough = 8] = "Strikethrough", s))(FontStyle || {});
function resolveParsedThemeRules(s, I) {
	s.sort((s, I) => {
		let L = strcmp(s.scope, I.scope);
		return L !== 0 || (L = strArrCmp(s.parentScopes, I.parentScopes), L !== 0) ? L : s.index - I.index;
	});
	let L = 0, R = "#000000", z = "#ffffff";
	for (; s.length >= 1 && s[0].scope === "";) {
		let I = s.shift();
		I.fontStyle !== -1 && (L = I.fontStyle), I.foreground !== null && (R = I.foreground), I.background !== null && (z = I.background);
	}
	let B = new ColorMap(I), V = new StyleAttributes(L, B.getId(R), B.getId(z)), H = new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1, 0, 0), []);
	for (let I = 0, L = s.length; I < L; I++) {
		let L = s[I];
		H.insert(0, L.scope, L.parentScopes, L.fontStyle, B.getId(L.foreground), B.getId(L.background));
	}
	return new Theme(B, V, H);
}
var ColorMap = class {
	_isFrozen;
	_lastColorId;
	_id2color;
	_color2id;
	constructor(s) {
		if (this._lastColorId = 0, this._id2color = [], this._color2id = /* @__PURE__ */ Object.create(null), Array.isArray(s)) {
			this._isFrozen = !0;
			for (let I = 0, L = s.length; I < L; I++) this._color2id[s[I]] = I, this._id2color[I] = s[I];
		} else this._isFrozen = !1;
	}
	getId(s) {
		if (s === null) return 0;
		s = s.toUpperCase();
		let I = this._color2id[s];
		if (I) return I;
		if (this._isFrozen) throw Error(`Missing color in color map - ${s}`);
		return I = ++this._lastColorId, this._color2id[s] = I, this._id2color[I] = s, I;
	}
	getColorMap() {
		return this._id2color.slice(0);
	}
}, emptyParentScopes = Object.freeze([]), ThemeTrieElementRule = class s {
	scopeDepth;
	parentScopes;
	fontStyle;
	foreground;
	background;
	constructor(s, I, L, R, z) {
		this.scopeDepth = s, this.parentScopes = I || emptyParentScopes, this.fontStyle = L, this.foreground = R, this.background = z;
	}
	clone() {
		return new s(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
	}
	static cloneArr(s) {
		let I = [];
		for (let L = 0, R = s.length; L < R; L++) I[L] = s[L].clone();
		return I;
	}
	acceptOverwrite(s, I, L, R) {
		this.scopeDepth > s ? console.log("how did this happen?") : this.scopeDepth = s, I !== -1 && (this.fontStyle = I), L !== 0 && (this.foreground = L), R !== 0 && (this.background = R);
	}
}, ThemeTrieElement = class s {
	constructor(s, I = [], L = {}) {
		this._mainRule = s, this._children = L, this._rulesWithParentScopes = I;
	}
	_rulesWithParentScopes;
	static _cmpBySpecificity(s, I) {
		if (s.scopeDepth !== I.scopeDepth) return I.scopeDepth - s.scopeDepth;
		let L = 0, R = 0;
		for (; s.parentScopes[L] === ">" && L++, I.parentScopes[R] === ">" && R++, !(L >= s.parentScopes.length || R >= I.parentScopes.length);) {
			let z = I.parentScopes[R].length - s.parentScopes[L].length;
			if (z !== 0) return z;
			L++, R++;
		}
		return I.parentScopes.length - s.parentScopes.length;
	}
	match(I) {
		if (I !== "") {
			let s = I.indexOf("."), L, R;
			if (s === -1 ? (L = I, R = "") : (L = I.substring(0, s), R = I.substring(s + 1)), this._children.hasOwnProperty(L)) return this._children[L].match(R);
		}
		let L = this._rulesWithParentScopes.concat(this._mainRule);
		return L.sort(s._cmpBySpecificity), L;
	}
	insert(I, L, R, z, B, V) {
		if (L === "") {
			this._doInsertHere(I, R, z, B, V);
			return;
		}
		let H = L.indexOf("."), U, W;
		H === -1 ? (U = L, W = "") : (U = L.substring(0, H), W = L.substring(H + 1));
		let G;
		this._children.hasOwnProperty(U) ? G = this._children[U] : (G = new s(this._mainRule.clone(), ThemeTrieElementRule.cloneArr(this._rulesWithParentScopes)), this._children[U] = G), G.insert(I + 1, W, R, z, B, V);
	}
	_doInsertHere(s, I, L, R, z) {
		if (I === null) {
			this._mainRule.acceptOverwrite(s, L, R, z);
			return;
		}
		for (let B = 0, V = this._rulesWithParentScopes.length; B < V; B++) {
			let V = this._rulesWithParentScopes[B];
			if (strArrCmp(V.parentScopes, I) === 0) {
				V.acceptOverwrite(s, L, R, z);
				return;
			}
		}
		L === -1 && (L = this._mainRule.fontStyle), R === 0 && (R = this._mainRule.foreground), z === 0 && (z = this._mainRule.background), this._rulesWithParentScopes.push(new ThemeTrieElementRule(s, I, L, R, z));
	}
}, EncodedTokenMetadata = class s {
	static toBinaryStr(s) {
		return s.toString(2).padStart(32, "0");
	}
	static print(I) {
		let L = s.getLanguageId(I), R = s.getTokenType(I), z = s.getFontStyle(I), B = s.getForeground(I), V = s.getBackground(I);
		console.log({
			languageId: L,
			tokenType: R,
			fontStyle: z,
			foreground: B,
			background: V
		});
	}
	static getLanguageId(s) {
		return (s & 255) >>> 0;
	}
	static getTokenType(s) {
		return (s & 768) >>> 8;
	}
	static containsBalancedBrackets(s) {
		return (s & 1024) != 0;
	}
	static getFontStyle(s) {
		return (s & 30720) >>> 11;
	}
	static getForeground(s) {
		return (s & 16744448) >>> 15;
	}
	static getBackground(s) {
		return (s & 4278190080) >>> 24;
	}
	static set(I, L, R, z, B, V, H) {
		let U = s.getLanguageId(I), W = s.getTokenType(I), G = s.containsBalancedBrackets(I) ? 1 : 0, K = s.getFontStyle(I), q = s.getForeground(I), J = s.getBackground(I);
		return L !== 0 && (U = L), R !== 8 && (W = fromOptionalTokenType(R)), z !== null && (G = z ? 1 : 0), B !== -1 && (K = B), V !== 0 && (q = V), H !== 0 && (J = H), (U << 0 | W << 8 | G << 10 | K << 11 | q << 15 | J << 24) >>> 0;
	}
};
function toOptionalTokenType(s) {
	return s;
}
function fromOptionalTokenType(s) {
	return s;
}
function createMatchers(s, I) {
	let L = [], R = newTokenizer(s), z = R.next();
	for (; z !== null;) {
		let s = 0;
		if (z.length === 2 && z.charAt(1) === ":") {
			switch (z.charAt(0)) {
				case "R":
					s = 1;
					break;
				case "L":
					s = -1;
					break;
				default: console.log(`Unknown priority ${z} in scope selector`);
			}
			z = R.next();
		}
		let I = V();
		if (L.push({
			matcher: I,
			priority: s
		}), z !== ",") break;
		z = R.next();
	}
	return L;
	function B() {
		if (z === "-") {
			z = R.next();
			let s = B();
			return (I) => !!s && !s(I);
		}
		if (z === "(") {
			z = R.next();
			let s = H();
			return z === ")" && (z = R.next()), s;
		}
		if (isIdentifier(z)) {
			let s = [];
			do
				s.push(z), z = R.next();
			while (isIdentifier(z));
			return (L) => I(s, L);
		}
		return null;
	}
	function V() {
		let s = [], I = B();
		for (; I;) s.push(I), I = B();
		return (I) => s.every((s) => s(I));
	}
	function H() {
		let s = [], I = V();
		for (; I && (s.push(I), z === "|" || z === ",");) {
			do
				z = R.next();
			while (z === "|" || z === ",");
			I = V();
		}
		return (I) => s.some((s) => s(I));
	}
}
function isIdentifier(s) {
	return !!s && !!s.match(/[\w\.:]+/);
}
function newTokenizer(s) {
	let I = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g, L = I.exec(s);
	return { next: () => {
		if (!L) return null;
		let R = L[0];
		return L = I.exec(s), R;
	} };
}
function disposeOnigString(s) {
	typeof s.dispose == "function" && s.dispose();
}
var TopLevelRuleReference = class {
	constructor(s) {
		this.scopeName = s;
	}
	toKey() {
		return this.scopeName;
	}
}, TopLevelRepositoryRuleReference = class {
	constructor(s, I) {
		this.scopeName = s, this.ruleName = I;
	}
	toKey() {
		return `${this.scopeName}#${this.ruleName}`;
	}
}, ExternalReferenceCollector = class {
	_references = [];
	_seenReferenceKeys = /* @__PURE__ */ new Set();
	get references() {
		return this._references;
	}
	visitedRule = /* @__PURE__ */ new Set();
	add(s) {
		let I = s.toKey();
		this._seenReferenceKeys.has(I) || (this._seenReferenceKeys.add(I), this._references.push(s));
	}
}, ScopeDependencyProcessor = class {
	constructor(s, I) {
		this.repo = s, this.initialScopeName = I, this.seenFullScopeRequests.add(this.initialScopeName), this.Q = [new TopLevelRuleReference(this.initialScopeName)];
	}
	seenFullScopeRequests = /* @__PURE__ */ new Set();
	seenPartialScopeRequests = /* @__PURE__ */ new Set();
	Q;
	processQueue() {
		let s = this.Q;
		this.Q = [];
		let I = new ExternalReferenceCollector();
		for (let L of s) collectReferencesOfReference(L, this.initialScopeName, this.repo, I);
		for (let s of I.references) if (s instanceof TopLevelRuleReference) {
			if (this.seenFullScopeRequests.has(s.scopeName)) continue;
			this.seenFullScopeRequests.add(s.scopeName), this.Q.push(s);
		} else {
			if (this.seenFullScopeRequests.has(s.scopeName) || this.seenPartialScopeRequests.has(s.toKey())) continue;
			this.seenPartialScopeRequests.add(s.toKey()), this.Q.push(s);
		}
	}
};
function collectReferencesOfReference(s, I, L, R) {
	let z = L.lookup(s.scopeName);
	if (!z) {
		if (s.scopeName === I) throw Error(`No grammar provided for <${I}>`);
		return;
	}
	let B = L.lookup(I);
	s instanceof TopLevelRuleReference ? collectExternalReferencesInTopLevelRule({
		baseGrammar: B,
		selfGrammar: z
	}, R) : collectExternalReferencesInTopLevelRepositoryRule(s.ruleName, {
		baseGrammar: B,
		selfGrammar: z,
		repository: z.repository
	}, R);
	let V = L.injections(s.scopeName);
	if (V) for (let s of V) R.add(new TopLevelRuleReference(s));
}
function collectExternalReferencesInTopLevelRepositoryRule(s, I, L) {
	if (I.repository && I.repository[s]) {
		let R = I.repository[s];
		collectExternalReferencesInRules([R], I, L);
	}
}
function collectExternalReferencesInTopLevelRule(s, I) {
	s.selfGrammar.patterns && Array.isArray(s.selfGrammar.patterns) && collectExternalReferencesInRules(s.selfGrammar.patterns, {
		...s,
		repository: s.selfGrammar.repository
	}, I), s.selfGrammar.injections && collectExternalReferencesInRules(Object.values(s.selfGrammar.injections), {
		...s,
		repository: s.selfGrammar.repository
	}, I);
}
function collectExternalReferencesInRules(s, I, L) {
	for (let R of s) {
		if (L.visitedRule.has(R)) continue;
		L.visitedRule.add(R);
		let s = R.repository ? mergeObjects({}, I.repository, R.repository) : I.repository;
		Array.isArray(R.patterns) && collectExternalReferencesInRules(R.patterns, {
			...I,
			repository: s
		}, L);
		let z = R.include;
		if (!z) continue;
		let B = parseInclude(z);
		switch (B.kind) {
			case 0:
				collectExternalReferencesInTopLevelRule({
					...I,
					selfGrammar: I.baseGrammar
				}, L);
				break;
			case 1:
				collectExternalReferencesInTopLevelRule(I, L);
				break;
			case 2:
				collectExternalReferencesInTopLevelRepositoryRule(B.ruleName, {
					...I,
					repository: s
				}, L);
				break;
			case 3:
			case 4:
				let R = B.scopeName === I.selfGrammar.scopeName ? I.selfGrammar : B.scopeName === I.baseGrammar.scopeName ? I.baseGrammar : void 0;
				if (R) {
					let z = {
						baseGrammar: I.baseGrammar,
						selfGrammar: R,
						repository: s
					};
					B.kind === 4 ? collectExternalReferencesInTopLevelRepositoryRule(B.ruleName, z, L) : collectExternalReferencesInTopLevelRule(z, L);
				} else B.kind === 4 ? L.add(new TopLevelRepositoryRuleReference(B.scopeName, B.ruleName)) : L.add(new TopLevelRuleReference(B.scopeName));
				break;
		}
	}
}
var BaseReference = class {
	kind = 0;
}, SelfReference = class {
	kind = 1;
}, RelativeReference = class {
	constructor(s) {
		this.ruleName = s;
	}
	kind = 2;
}, TopLevelReference = class {
	constructor(s) {
		this.scopeName = s;
	}
	kind = 3;
}, TopLevelRepositoryReference = class {
	constructor(s, I) {
		this.scopeName = s, this.ruleName = I;
	}
	kind = 4;
};
function parseInclude(s) {
	if (s === "$base") return new BaseReference();
	if (s === "$self") return new SelfReference();
	let I = s.indexOf("#");
	return I === -1 ? new TopLevelReference(s) : I === 0 ? new RelativeReference(s.substring(1)) : new TopLevelRepositoryReference(s.substring(0, I), s.substring(I + 1));
}
var HAS_BACK_REFERENCES = /\\(\d+)/, BACK_REFERENCING_END = /\\(\d+)/g, endRuleId = -1, whileRuleId = -2;
function ruleIdFromNumber(s) {
	return s;
}
function ruleIdToNumber(s) {
	return s;
}
var Rule = class {
	$location;
	id;
	_nameIsCapturing;
	_name;
	_contentNameIsCapturing;
	_contentName;
	constructor(s, I, L, R) {
		this.$location = s, this.id = I, this._name = L || null, this._nameIsCapturing = RegexSource.hasCaptures(this._name), this._contentName = R || null, this._contentNameIsCapturing = RegexSource.hasCaptures(this._contentName);
	}
	get debugName() {
		let s = this.$location ? `${basename(this.$location.filename)}:${this.$location.line}` : "unknown";
		return `${this.constructor.name}#${this.id} @ ${s}`;
	}
	getName(s, I) {
		return !this._nameIsCapturing || this._name === null || s === null || I === null ? this._name : RegexSource.replaceCaptures(this._name, s, I);
	}
	getContentName(s, I) {
		return !this._contentNameIsCapturing || this._contentName === null ? this._contentName : RegexSource.replaceCaptures(this._contentName, s, I);
	}
}, CaptureRule = class extends Rule {
	retokenizeCapturedWithRuleId;
	constructor(s, I, L, R, z) {
		super(s, I, L, R), this.retokenizeCapturedWithRuleId = z;
	}
	dispose() {}
	collectPatterns(s, I) {
		throw Error("Not supported!");
	}
	compile(s, I) {
		throw Error("Not supported!");
	}
	compileAG(s, I, L, R) {
		throw Error("Not supported!");
	}
}, MatchRule = class extends Rule {
	_match;
	captures;
	_cachedCompiledPatterns;
	constructor(s, I, L, R, z) {
		super(s, I, L, null), this._match = new RegExpSource(R, this.id), this.captures = z, this._cachedCompiledPatterns = null;
	}
	dispose() {
		this._cachedCompiledPatterns &&= (this._cachedCompiledPatterns.dispose(), null);
	}
	get debugMatchRegExp() {
		return `${this._match.source}`;
	}
	collectPatterns(s, I) {
		I.push(this._match);
	}
	compile(s, I) {
		return this._getCachedCompiledPatterns(s).compile(s);
	}
	compileAG(s, I, L, R) {
		return this._getCachedCompiledPatterns(s).compileAG(s, L, R);
	}
	_getCachedCompiledPatterns(s) {
		return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new RegExpSourceList(), this.collectPatterns(s, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
	}
}, IncludeOnlyRule = class extends Rule {
	hasMissingPatterns;
	patterns;
	_cachedCompiledPatterns;
	constructor(s, I, L, R, z) {
		super(s, I, L, R), this.patterns = z.patterns, this.hasMissingPatterns = z.hasMissingPatterns, this._cachedCompiledPatterns = null;
	}
	dispose() {
		this._cachedCompiledPatterns &&= (this._cachedCompiledPatterns.dispose(), null);
	}
	collectPatterns(s, I) {
		for (let L of this.patterns) s.getRule(L).collectPatterns(s, I);
	}
	compile(s, I) {
		return this._getCachedCompiledPatterns(s).compile(s);
	}
	compileAG(s, I, L, R) {
		return this._getCachedCompiledPatterns(s).compileAG(s, L, R);
	}
	_getCachedCompiledPatterns(s) {
		return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new RegExpSourceList(), this.collectPatterns(s, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
	}
}, BeginEndRule = class extends Rule {
	_begin;
	beginCaptures;
	_end;
	endHasBackReferences;
	endCaptures;
	applyEndPatternLast;
	hasMissingPatterns;
	patterns;
	_cachedCompiledPatterns;
	constructor(s, I, L, R, z, B, V, H, U, W) {
		super(s, I, L, R), this._begin = new RegExpSource(z, this.id), this.beginCaptures = B, this._end = new RegExpSource(V || "￿", -1), this.endHasBackReferences = this._end.hasBackReferences, this.endCaptures = H, this.applyEndPatternLast = U || !1, this.patterns = W.patterns, this.hasMissingPatterns = W.hasMissingPatterns, this._cachedCompiledPatterns = null;
	}
	dispose() {
		this._cachedCompiledPatterns &&= (this._cachedCompiledPatterns.dispose(), null);
	}
	get debugBeginRegExp() {
		return `${this._begin.source}`;
	}
	get debugEndRegExp() {
		return `${this._end.source}`;
	}
	getEndWithResolvedBackReferences(s, I) {
		return this._end.resolveBackReferences(s, I);
	}
	collectPatterns(s, I) {
		I.push(this._begin);
	}
	compile(s, I) {
		return this._getCachedCompiledPatterns(s, I).compile(s);
	}
	compileAG(s, I, L, R) {
		return this._getCachedCompiledPatterns(s, I).compileAG(s, L, R);
	}
	_getCachedCompiledPatterns(s, I) {
		if (!this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns = new RegExpSourceList();
			for (let I of this.patterns) s.getRule(I).collectPatterns(s, this._cachedCompiledPatterns);
			this.applyEndPatternLast ? this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end) : this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
		}
		return this._end.hasBackReferences && (this.applyEndPatternLast ? this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, I) : this._cachedCompiledPatterns.setSource(0, I)), this._cachedCompiledPatterns;
	}
}, BeginWhileRule = class extends Rule {
	_begin;
	beginCaptures;
	whileCaptures;
	_while;
	whileHasBackReferences;
	hasMissingPatterns;
	patterns;
	_cachedCompiledPatterns;
	_cachedCompiledWhilePatterns;
	constructor(s, I, L, R, z, B, V, H, U) {
		super(s, I, L, R), this._begin = new RegExpSource(z, this.id), this.beginCaptures = B, this.whileCaptures = H, this._while = new RegExpSource(V, whileRuleId), this.whileHasBackReferences = this._while.hasBackReferences, this.patterns = U.patterns, this.hasMissingPatterns = U.hasMissingPatterns, this._cachedCompiledPatterns = null, this._cachedCompiledWhilePatterns = null;
	}
	dispose() {
		this._cachedCompiledPatterns &&= (this._cachedCompiledPatterns.dispose(), null), this._cachedCompiledWhilePatterns &&= (this._cachedCompiledWhilePatterns.dispose(), null);
	}
	get debugBeginRegExp() {
		return `${this._begin.source}`;
	}
	get debugWhileRegExp() {
		return `${this._while.source}`;
	}
	getWhileWithResolvedBackReferences(s, I) {
		return this._while.resolveBackReferences(s, I);
	}
	collectPatterns(s, I) {
		I.push(this._begin);
	}
	compile(s, I) {
		return this._getCachedCompiledPatterns(s).compile(s);
	}
	compileAG(s, I, L, R) {
		return this._getCachedCompiledPatterns(s).compileAG(s, L, R);
	}
	_getCachedCompiledPatterns(s) {
		if (!this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns = new RegExpSourceList();
			for (let I of this.patterns) s.getRule(I).collectPatterns(s, this._cachedCompiledPatterns);
		}
		return this._cachedCompiledPatterns;
	}
	compileWhile(s, I) {
		return this._getCachedCompiledWhilePatterns(s, I).compile(s);
	}
	compileWhileAG(s, I, L, R) {
		return this._getCachedCompiledWhilePatterns(s, I).compileAG(s, L, R);
	}
	_getCachedCompiledWhilePatterns(s, I) {
		return this._cachedCompiledWhilePatterns || (this._cachedCompiledWhilePatterns = new RegExpSourceList(), this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while)), this._while.hasBackReferences && this._cachedCompiledWhilePatterns.setSource(0, I || "￿"), this._cachedCompiledWhilePatterns;
	}
}, RuleFactory = class s {
	static createCaptureRule(s, I, L, R, z) {
		return s.registerRule((s) => new CaptureRule(I, s, L, R, z));
	}
	static getCompiledRuleId(I, L, R) {
		return I.id || L.registerRule((z) => {
			if (I.id = z, I.match) return new MatchRule(I.$vscodeTextmateLocation, I.id, I.name, I.match, s._compileCaptures(I.captures, L, R));
			if (I.begin === void 0) {
				I.repository && (R = mergeObjects({}, R, I.repository));
				let z = I.patterns;
				return z === void 0 && I.include && (z = [{ include: I.include }]), new IncludeOnlyRule(I.$vscodeTextmateLocation, I.id, I.name, I.contentName, s._compilePatterns(z, L, R));
			}
			return I.while ? new BeginWhileRule(I.$vscodeTextmateLocation, I.id, I.name, I.contentName, I.begin, s._compileCaptures(I.beginCaptures || I.captures, L, R), I.while, s._compileCaptures(I.whileCaptures || I.captures, L, R), s._compilePatterns(I.patterns, L, R)) : new BeginEndRule(I.$vscodeTextmateLocation, I.id, I.name, I.contentName, I.begin, s._compileCaptures(I.beginCaptures || I.captures, L, R), I.end, s._compileCaptures(I.endCaptures || I.captures, L, R), I.applyEndPatternLast, s._compilePatterns(I.patterns, L, R));
		}), I.id;
	}
	static _compileCaptures(I, L, R) {
		let z = [];
		if (I) {
			let B = 0;
			for (let s in I) {
				if (s === "$vscodeTextmateLocation") continue;
				let I = parseInt(s, 10);
				I > B && (B = I);
			}
			for (let s = 0; s <= B; s++) z[s] = null;
			for (let B in I) {
				if (B === "$vscodeTextmateLocation") continue;
				let V = parseInt(B, 10), H = 0;
				I[B].patterns && (H = s.getCompiledRuleId(I[B], L, R)), z[V] = s.createCaptureRule(L, I[B].$vscodeTextmateLocation, I[B].name, I[B].contentName, H);
			}
		}
		return z;
	}
	static _compilePatterns(I, L, R) {
		let z = [];
		if (I) for (let B = 0, V = I.length; B < V; B++) {
			let V = I[B], H = -1;
			if (V.include) {
				let I = parseInclude(V.include);
				switch (I.kind) {
					case 0:
					case 1:
						H = s.getCompiledRuleId(R[V.include], L, R);
						break;
					case 2:
						let z = R[I.ruleName];
						z && (H = s.getCompiledRuleId(z, L, R));
						break;
					case 3:
					case 4:
						let B = I.scopeName, U = I.kind === 4 ? I.ruleName : null, W = L.getExternalGrammar(B, R);
						if (W) if (U) {
							let I = W.repository[U];
							I && (H = s.getCompiledRuleId(I, L, W.repository));
						} else H = s.getCompiledRuleId(W.repository.$self, L, W.repository);
						break;
				}
			} else H = s.getCompiledRuleId(V, L, R);
			if (H !== -1) {
				let s = L.getRule(H), I = !1;
				if ((s instanceof IncludeOnlyRule || s instanceof BeginEndRule || s instanceof BeginWhileRule) && s.hasMissingPatterns && s.patterns.length === 0 && (I = !0), I) continue;
				z.push(H);
			}
		}
		return {
			patterns: z,
			hasMissingPatterns: (I ? I.length : 0) !== z.length
		};
	}
}, RegExpSource = class s {
	source;
	ruleId;
	hasAnchor;
	hasBackReferences;
	_anchorCache;
	constructor(s, I) {
		if (s && typeof s == "string") {
			let I = s.length, L = 0, R = [], z = !1;
			for (let B = 0; B < I; B++) if (s.charAt(B) === "\\" && B + 1 < I) {
				let I = s.charAt(B + 1);
				I === "z" ? (R.push(s.substring(L, B)), R.push("$(?!\\n)(?<!\\n)"), L = B + 2) : (I === "A" || I === "G") && (z = !0), B++;
			}
			this.hasAnchor = z, L === 0 ? this.source = s : (R.push(s.substring(L, I)), this.source = R.join(""));
		} else this.hasAnchor = !1, this.source = s;
		this.hasAnchor ? this._anchorCache = this._buildAnchorCache() : this._anchorCache = null, this.ruleId = I, typeof this.source == "string" ? this.hasBackReferences = HAS_BACK_REFERENCES.test(this.source) : this.hasBackReferences = !1;
	}
	clone() {
		return new s(this.source, this.ruleId);
	}
	setSource(s) {
		this.source !== s && (this.source = s, this.hasAnchor && (this._anchorCache = this._buildAnchorCache()));
	}
	resolveBackReferences(s, I) {
		if (typeof this.source != "string") throw Error("This method should only be called if the source is a string");
		let L = I.map((I) => s.substring(I.start, I.end));
		return BACK_REFERENCING_END.lastIndex = 0, this.source.replace(BACK_REFERENCING_END, (s, I) => escapeRegExpCharacters(L[parseInt(I, 10)] || ""));
	}
	_buildAnchorCache() {
		if (typeof this.source != "string") throw Error("This method should only be called if the source is a string");
		let s = [], I = [], L = [], R = [], z, B, V, H;
		for (z = 0, B = this.source.length; z < B; z++) V = this.source.charAt(z), s[z] = V, I[z] = V, L[z] = V, R[z] = V, V === "\\" && z + 1 < B && (H = this.source.charAt(z + 1), H === "A" ? (s[z + 1] = "￿", I[z + 1] = "￿", L[z + 1] = "A", R[z + 1] = "A") : H === "G" ? (s[z + 1] = "￿", I[z + 1] = "G", L[z + 1] = "￿", R[z + 1] = "G") : (s[z + 1] = H, I[z + 1] = H, L[z + 1] = H, R[z + 1] = H), z++);
		return {
			A0_G0: s.join(""),
			A0_G1: I.join(""),
			A1_G0: L.join(""),
			A1_G1: R.join("")
		};
	}
	resolveAnchors(s, I) {
		return !this.hasAnchor || !this._anchorCache || typeof this.source != "string" ? this.source : s ? I ? this._anchorCache.A1_G1 : this._anchorCache.A1_G0 : I ? this._anchorCache.A0_G1 : this._anchorCache.A0_G0;
	}
}, RegExpSourceList = class {
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
		this._cached &&= (this._cached.dispose(), null), this._anchorCache.A0_G0 && (this._anchorCache.A0_G0.dispose(), this._anchorCache.A0_G0 = null), this._anchorCache.A0_G1 && (this._anchorCache.A0_G1.dispose(), this._anchorCache.A0_G1 = null), this._anchorCache.A1_G0 && (this._anchorCache.A1_G0.dispose(), this._anchorCache.A1_G0 = null), this._anchorCache.A1_G1 && (this._anchorCache.A1_G1.dispose(), this._anchorCache.A1_G1 = null);
	}
	push(s) {
		this._items.push(s), this._hasAnchors = this._hasAnchors || s.hasAnchor;
	}
	unshift(s) {
		this._items.unshift(s), this._hasAnchors = this._hasAnchors || s.hasAnchor;
	}
	length() {
		return this._items.length;
	}
	setSource(s, I) {
		this._items[s].source !== I && (this._disposeCaches(), this._items[s].setSource(I));
	}
	compile(s) {
		return this._cached ||= new CompiledRule(s, this._items.map((s) => s.source), this._items.map((s) => s.ruleId)), this._cached;
	}
	compileAG(s, I, L) {
		return this._hasAnchors ? I ? L ? (this._anchorCache.A1_G1 || (this._anchorCache.A1_G1 = this._resolveAnchors(s, I, L)), this._anchorCache.A1_G1) : (this._anchorCache.A1_G0 || (this._anchorCache.A1_G0 = this._resolveAnchors(s, I, L)), this._anchorCache.A1_G0) : L ? (this._anchorCache.A0_G1 || (this._anchorCache.A0_G1 = this._resolveAnchors(s, I, L)), this._anchorCache.A0_G1) : (this._anchorCache.A0_G0 || (this._anchorCache.A0_G0 = this._resolveAnchors(s, I, L)), this._anchorCache.A0_G0) : this.compile(s);
	}
	_resolveAnchors(s, I, L) {
		return new CompiledRule(s, this._items.map((s) => s.resolveAnchors(I, L)), this._items.map((s) => s.ruleId));
	}
}, CompiledRule = class {
	constructor(s, I, L) {
		this.regExps = I, this.rules = L, this.scanner = s.createOnigScanner(I);
	}
	scanner;
	dispose() {
		typeof this.scanner.dispose == "function" && this.scanner.dispose();
	}
	toString() {
		let s = [];
		for (let I = 0, L = this.rules.length; I < L; I++) s.push("   - " + this.rules[I] + ": " + this.regExps[I]);
		return s.join("\n");
	}
	findNextMatchSync(s, I, L) {
		let R = this.scanner.findNextMatchSync(s, I, L);
		return R ? {
			ruleId: this.rules[R.index],
			captureIndices: R.captureIndices
		} : null;
	}
}, BasicScopeAttributes = class {
	constructor(s, I) {
		this.languageId = s, this.tokenType = I;
	}
}, BasicScopeAttributesProvider = class s {
	_defaultAttributes;
	_embeddedLanguagesMatcher;
	constructor(s, I) {
		this._defaultAttributes = new BasicScopeAttributes(s, 8), this._embeddedLanguagesMatcher = new ScopeMatcher(Object.entries(I || {}));
	}
	getDefaultAttributes() {
		return this._defaultAttributes;
	}
	getBasicScopeAttributes(I) {
		return I === null ? s._NULL_SCOPE_METADATA : this._getBasicScopeAttributes.get(I);
	}
	static _NULL_SCOPE_METADATA = new BasicScopeAttributes(0, 0);
	_getBasicScopeAttributes = new CachedFn((s) => new BasicScopeAttributes(this._scopeToLanguage(s), this._toStandardTokenType(s)));
	_scopeToLanguage(s) {
		return this._embeddedLanguagesMatcher.match(s) || 0;
	}
	_toStandardTokenType(I) {
		let L = I.match(s.STANDARD_TOKEN_TYPE_REGEXP);
		if (!L) return 8;
		switch (L[1]) {
			case "comment": return 1;
			case "string": return 2;
			case "regex": return 3;
			case "meta.embedded": return 0;
		}
		throw Error("Unexpected match for standard token type!");
	}
	static STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
}, ScopeMatcher = class {
	values;
	scopesRegExp;
	constructor(s) {
		if (s.length === 0) this.values = null, this.scopesRegExp = null;
		else {
			this.values = new Map(s);
			let I = s.map(([s, I]) => escapeRegExpCharacters(s));
			I.sort(), I.reverse(), this.scopesRegExp = RegExp(`^((${I.join(")|(")}))($|\\.)`, "");
		}
	}
	match(s) {
		if (!this.scopesRegExp) return;
		let I = s.match(this.scopesRegExp);
		if (I) return this.values.get(I[1]);
	}
};
typeof process < "u" && process.env.VSCODE_TEXTMATE_DEBUG;
var UseOnigurumaFindOptions = !1, TokenizeStringResult = class {
	constructor(s, I) {
		this.stack = s, this.stoppedEarly = I;
	}
};
function _tokenizeString(s, I, L, R, z, B, V, H) {
	let U = I.content.length, W = !1, G = -1;
	if (V) {
		let V = _checkWhileConditions(s, I, L, R, z, B);
		z = V.stack, R = V.linePos, L = V.isFirstLine, G = V.anchorPosition;
	}
	let K = Date.now();
	for (; !W;) {
		if (H !== 0 && Date.now() - K > H) return new TokenizeStringResult(z, !0);
		q();
	}
	return new TokenizeStringResult(z, !1);
	function q() {
		let V = matchRuleOrInjections(s, I, L, R, z, G);
		if (!V) {
			B.produce(z, U), W = !0;
			return;
		}
		let H = V.captureIndices, K = V.matchedRuleId, q = H && H.length > 0 ? H[0].end > R : !1;
		if (K === endRuleId) {
			let V = z.getRule(s);
			B.produce(z, H[0].start), z = z.withContentNameScopesList(z.nameScopesList), handleCaptures(s, I, L, z, B, V.endCaptures, H), B.produce(z, H[0].end);
			let K = z;
			if (z = z.parent, G = K.getAnchorPos(), !q && K.getEnterPos() === R) {
				z = K, B.produce(z, U), W = !0;
				return;
			}
		} else {
			let V = s.getRule(K);
			B.produce(z, H[0].start);
			let J = z, Y = V.getName(I.content, H), X = z.contentNameScopesList.pushAttributed(Y, s);
			if (z = z.push(K, R, G, H[0].end === U, null, X, X), V instanceof BeginEndRule) {
				let R = V;
				handleCaptures(s, I, L, z, B, R.beginCaptures, H), B.produce(z, H[0].end), G = H[0].end;
				let K = R.getContentName(I.content, H), Y = X.pushAttributed(K, s);
				if (z = z.withContentNameScopesList(Y), R.endHasBackReferences && (z = z.withEndRule(R.getEndWithResolvedBackReferences(I.content, H))), !q && J.hasSameRuleAs(z)) {
					z = z.pop(), B.produce(z, U), W = !0;
					return;
				}
			} else if (V instanceof BeginWhileRule) {
				let R = V;
				handleCaptures(s, I, L, z, B, R.beginCaptures, H), B.produce(z, H[0].end), G = H[0].end;
				let K = R.getContentName(I.content, H), Y = X.pushAttributed(K, s);
				if (z = z.withContentNameScopesList(Y), R.whileHasBackReferences && (z = z.withEndRule(R.getWhileWithResolvedBackReferences(I.content, H))), !q && J.hasSameRuleAs(z)) {
					z = z.pop(), B.produce(z, U), W = !0;
					return;
				}
			} else if (handleCaptures(s, I, L, z, B, V.captures, H), B.produce(z, H[0].end), z = z.pop(), !q) {
				z = z.safePop(), B.produce(z, U), W = !0;
				return;
			}
		}
		H[0].end > R && (R = H[0].end, L = !1);
	}
}
function _checkWhileConditions(s, I, L, R, z, B) {
	let V = z.beginRuleCapturedEOL ? 0 : -1, H = [];
	for (let I = z; I; I = I.pop()) {
		let L = I.getRule(s);
		L instanceof BeginWhileRule && H.push({
			rule: L,
			stack: I
		});
	}
	for (let U = H.pop(); U; U = H.pop()) {
		let { ruleScanner: H, findOptions: W } = prepareRuleWhileSearch(U.rule, s, U.stack.endRule, L, R === V), G = H.findNextMatchSync(I, R, W);
		if (G) {
			if (G.ruleId !== whileRuleId) {
				z = U.stack.pop();
				break;
			}
			G.captureIndices && G.captureIndices.length && (B.produce(U.stack, G.captureIndices[0].start), handleCaptures(s, I, L, U.stack, B, U.rule.whileCaptures, G.captureIndices), B.produce(U.stack, G.captureIndices[0].end), V = G.captureIndices[0].end, G.captureIndices[0].end > R && (R = G.captureIndices[0].end, L = !1));
		} else {
			z = U.stack.pop();
			break;
		}
	}
	return {
		stack: z,
		linePos: R,
		anchorPosition: V,
		isFirstLine: L
	};
}
function matchRuleOrInjections(s, I, L, R, z, B) {
	let V = matchRule(s, I, L, R, z, B), H = s.getInjections();
	if (H.length === 0) return V;
	let U = matchInjections(H, s, I, L, R, z, B);
	if (!U) return V;
	if (!V) return U;
	let W = V.captureIndices[0].start, G = U.captureIndices[0].start;
	return G < W || U.priorityMatch && G === W ? U : V;
}
function matchRule(s, I, L, R, z, B) {
	let { ruleScanner: V, findOptions: H } = prepareRuleSearch(z.getRule(s), s, z.endRule, L, R === B), U = V.findNextMatchSync(I, R, H);
	return U ? {
		captureIndices: U.captureIndices,
		matchedRuleId: U.ruleId
	} : null;
}
function matchInjections(s, I, L, R, z, B, V) {
	let H = Number.MAX_VALUE, U = null, W, G = 0, K = B.contentNameScopesList.getScopeNames();
	for (let B = 0, q = s.length; B < q; B++) {
		let q = s[B];
		if (!q.matcher(K)) continue;
		let { ruleScanner: J, findOptions: Y } = prepareRuleSearch(I.getRule(q.ruleId), I, null, R, z === V), X = J.findNextMatchSync(L, z, Y);
		if (!X) continue;
		let Z = X.captureIndices[0].start;
		if (!(Z >= H) && (H = Z, U = X.captureIndices, W = X.ruleId, G = q.priority, H === z)) break;
	}
	return U ? {
		priorityMatch: G === -1,
		captureIndices: U,
		matchedRuleId: W
	} : null;
}
function prepareRuleSearch(s, I, L, R, z) {
	return UseOnigurumaFindOptions ? {
		ruleScanner: s.compile(I, L),
		findOptions: getFindOptions(R, z)
	} : {
		ruleScanner: s.compileAG(I, L, R, z),
		findOptions: 0
	};
}
function prepareRuleWhileSearch(s, I, L, R, z) {
	return UseOnigurumaFindOptions ? {
		ruleScanner: s.compileWhile(I, L),
		findOptions: getFindOptions(R, z)
	} : {
		ruleScanner: s.compileWhileAG(I, L, R, z),
		findOptions: 0
	};
}
function getFindOptions(s, I) {
	let L = 0;
	return s || (L |= 1), I || (L |= 4), L;
}
function handleCaptures(s, I, L, R, z, B, V) {
	if (B.length === 0) return;
	let H = I.content, U = Math.min(B.length, V.length), W = [], G = V[0].end;
	for (let I = 0; I < U; I++) {
		let U = B[I];
		if (U === null) continue;
		let K = V[I];
		if (K.length === 0) continue;
		if (K.start > G) break;
		for (; W.length > 0 && W[W.length - 1].endPos <= K.start;) z.produceFromScopes(W[W.length - 1].scopes, W[W.length - 1].endPos), W.pop();
		if (W.length > 0 ? z.produceFromScopes(W[W.length - 1].scopes, K.start) : z.produce(R, K.start), U.retokenizeCapturedWithRuleId) {
			let I = U.getName(H, V), B = R.contentNameScopesList.pushAttributed(I, s), W = U.getContentName(H, V), G = B.pushAttributed(W, s), q = R.push(U.retokenizeCapturedWithRuleId, K.start, -1, !1, null, B, G), J = s.createOnigString(H.substring(0, K.end));
			_tokenizeString(s, J, L && K.start === 0, K.start, q, z, !1, 0), disposeOnigString(J);
			continue;
		}
		let q = U.getName(H, V);
		if (q !== null) {
			let I = (W.length > 0 ? W[W.length - 1].scopes : R.contentNameScopesList).pushAttributed(q, s);
			W.push(new LocalStackElement(I, K.end));
		}
	}
	for (; W.length > 0;) z.produceFromScopes(W[W.length - 1].scopes, W[W.length - 1].endPos), W.pop();
}
var LocalStackElement = class {
	scopes;
	endPos;
	constructor(s, I) {
		this.scopes = s, this.endPos = I;
	}
};
function createGrammar(s, I, L, R, z, B, V, H) {
	return new Grammar(s, I, L, R, z, B, V, H);
}
function collectInjections(s, I, L, R, z) {
	let B = createMatchers(I, nameMatcher), V = RuleFactory.getCompiledRuleId(L, R, z.repository);
	for (let L of B) s.push({
		debugSelector: I,
		matcher: L.matcher,
		ruleId: V,
		grammar: z,
		priority: L.priority
	});
}
function nameMatcher(s, I) {
	if (I.length < s.length) return !1;
	let L = 0;
	return s.every((s) => {
		for (let R = L; R < I.length; R++) if (scopesAreMatching(I[R], s)) return L = R + 1, !0;
		return !1;
	});
}
function scopesAreMatching(s, I) {
	if (!s) return !1;
	if (s === I) return !0;
	let L = I.length;
	return s.length > L && s.substr(0, L) === I && s[L] === ".";
}
var Grammar = class {
	constructor(s, I, L, R, z, B, V, H) {
		if (this._rootScopeName = s, this.balancedBracketSelectors = B, this._onigLib = H, this._basicScopeAttributesProvider = new BasicScopeAttributesProvider(L, R), this._rootId = -1, this._lastRuleId = 0, this._ruleId2desc = [null], this._includedGrammars = {}, this._grammarRepository = V, this._grammar = initGrammar(I, null), this._injections = null, this._tokenTypeMatchers = [], z) for (let s of Object.keys(z)) {
			let I = createMatchers(s, nameMatcher);
			for (let L of I) this._tokenTypeMatchers.push({
				matcher: L.matcher,
				type: z[s]
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
		for (let s of this._ruleId2desc) s && s.dispose();
	}
	createOnigScanner(s) {
		return this._onigLib.createOnigScanner(s);
	}
	createOnigString(s) {
		return this._onigLib.createOnigString(s);
	}
	getMetadataForScope(s) {
		return this._basicScopeAttributesProvider.getBasicScopeAttributes(s);
	}
	_collectInjections() {
		let s = {
			lookup: (s) => s === this._rootScopeName ? this._grammar : this.getExternalGrammar(s),
			injections: (s) => this._grammarRepository.injections(s)
		}, I = [], L = this._rootScopeName, R = s.lookup(L);
		if (R) {
			let s = R.injections;
			if (s) for (let L in s) collectInjections(I, L, s[L], this, R);
			let z = this._grammarRepository.injections(L);
			z && z.forEach((s) => {
				let L = this.getExternalGrammar(s);
				if (L) {
					let s = L.injectionSelector;
					s && collectInjections(I, s, L, this, L);
				}
			});
		}
		return I.sort((s, I) => s.priority - I.priority), I;
	}
	getInjections() {
		return this._injections === null && (this._injections = this._collectInjections()), this._injections;
	}
	registerRule(s) {
		let I = ++this._lastRuleId, L = s(ruleIdFromNumber(I));
		return this._ruleId2desc[I] = L, L;
	}
	getRule(s) {
		return this._ruleId2desc[ruleIdToNumber(s)];
	}
	getExternalGrammar(s, I) {
		if (this._includedGrammars[s]) return this._includedGrammars[s];
		if (this._grammarRepository) {
			let L = this._grammarRepository.lookup(s);
			if (L) return this._includedGrammars[s] = initGrammar(L, I && I.$base), this._includedGrammars[s];
		}
	}
	tokenizeLine(s, I, L = 0) {
		let R = this._tokenize(s, I, !1, L);
		return {
			tokens: R.lineTokens.getResult(R.ruleStack, R.lineLength),
			ruleStack: R.ruleStack,
			stoppedEarly: R.stoppedEarly
		};
	}
	tokenizeLine2(s, I, L = 0) {
		let R = this._tokenize(s, I, !0, L);
		return {
			tokens: R.lineTokens.getBinaryResult(R.ruleStack, R.lineLength),
			ruleStack: R.ruleStack,
			stoppedEarly: R.stoppedEarly
		};
	}
	_tokenize(s, I, L, R) {
		this._rootId === -1 && (this._rootId = RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository), this.getInjections());
		let z;
		if (!I || I === StateStackImpl.NULL) {
			z = !0;
			let s = this._basicScopeAttributesProvider.getDefaultAttributes(), L = this.themeProvider.getDefaults(), R = EncodedTokenMetadata.set(0, s.languageId, s.tokenType, null, L.fontStyle, L.foregroundId, L.backgroundId), B = this.getRule(this._rootId).getName(null, null), V;
			V = B ? AttributedScopeStack.createRootAndLookUpScopeName(B, R, this) : AttributedScopeStack.createRoot("unknown", R), I = new StateStackImpl(null, this._rootId, -1, -1, !1, null, V, V);
		} else z = !1, I.reset();
		s += "\n";
		let B = this.createOnigString(s), V = B.content.length, H = new LineTokens(L, s, this._tokenTypeMatchers, this.balancedBracketSelectors), U = _tokenizeString(this, B, z, 0, I, H, !0, R);
		return disposeOnigString(B), {
			lineLength: V,
			lineTokens: H,
			ruleStack: U.stack,
			stoppedEarly: U.stoppedEarly
		};
	}
};
function initGrammar(s, I) {
	return s = clone(s), s.repository = s.repository || {}, s.repository.$self = {
		$vscodeTextmateLocation: s.$vscodeTextmateLocation,
		patterns: s.patterns,
		name: s.scopeName
	}, s.repository.$base = I || s.repository.$self, s;
}
var AttributedScopeStack = class s {
	constructor(s, I, L) {
		this.parent = s, this.scopePath = I, this.tokenAttributes = L;
	}
	static fromExtension(I, L) {
		let R = I, z = I?.scopePath ?? null;
		for (let I of L) z = ScopeStack.push(z, I.scopeNames), R = new s(R, z, I.encodedTokenAttributes);
		return R;
	}
	static createRoot(I, L) {
		return new s(null, new ScopeStack(null, I), L);
	}
	static createRootAndLookUpScopeName(I, L, R) {
		let z = R.getMetadataForScope(I), B = new ScopeStack(null, I), V = R.themeProvider.themeMatch(B);
		return new s(null, B, s.mergeAttributes(L, z, V));
	}
	get scopeName() {
		return this.scopePath.scopeName;
	}
	toString() {
		return this.getScopeNames().join(" ");
	}
	equals(I) {
		return s.equals(this, I);
	}
	static equals(s, I) {
		do {
			if (s === I || !s && !I) return !0;
			if (!s || !I || s.scopeName !== I.scopeName || s.tokenAttributes !== I.tokenAttributes) return !1;
			s = s.parent, I = I.parent;
		} while (!0);
	}
	static mergeAttributes(s, I, L) {
		let R = -1, z = 0, B = 0;
		return L !== null && (R = L.fontStyle, z = L.foregroundId, B = L.backgroundId), EncodedTokenMetadata.set(s, I.languageId, I.tokenType, null, R, z, B);
	}
	pushAttributed(I, L) {
		if (I === null) return this;
		if (I.indexOf(" ") === -1) return s._pushAttributed(this, I, L);
		let R = I.split(/ /g), z = this;
		for (let I of R) z = s._pushAttributed(z, I, L);
		return z;
	}
	static _pushAttributed(I, L, R) {
		let z = R.getMetadataForScope(L), B = I.scopePath.push(L), V = R.themeProvider.themeMatch(B);
		return new s(I, B, s.mergeAttributes(I.tokenAttributes, z, V));
	}
	getScopeNames() {
		return this.scopePath.getSegments();
	}
	getExtensionIfDefined(s) {
		let I = [], L = this;
		for (; L && L !== s;) I.push({
			encodedTokenAttributes: L.tokenAttributes,
			scopeNames: L.scopePath.getExtensionIfDefined(L.parent?.scopePath ?? null)
		}), L = L.parent;
		return L === s ? I.reverse() : void 0;
	}
}, StateStackImpl = class s {
	constructor(s, I, L, R, z, B, V, H) {
		this.parent = s, this.ruleId = I, this.beginRuleCapturedEOL = z, this.endRule = B, this.nameScopesList = V, this.contentNameScopesList = H, this.depth = this.parent ? this.parent.depth + 1 : 1, this._enterPos = L, this._anchorPos = R;
	}
	_stackElementBrand = void 0;
	static NULL = new s(null, 0, 0, 0, !1, null, null, null);
	_enterPos;
	_anchorPos;
	depth;
	equals(I) {
		return I === null ? !1 : s._equals(this, I);
	}
	static _equals(s, I) {
		return s === I ? !0 : this._structuralEquals(s, I) ? AttributedScopeStack.equals(s.contentNameScopesList, I.contentNameScopesList) : !1;
	}
	static _structuralEquals(s, I) {
		do {
			if (s === I || !s && !I) return !0;
			if (!s || !I || s.depth !== I.depth || s.ruleId !== I.ruleId || s.endRule !== I.endRule) return !1;
			s = s.parent, I = I.parent;
		} while (!0);
	}
	clone() {
		return this;
	}
	static _reset(s) {
		for (; s;) s._enterPos = -1, s._anchorPos = -1, s = s.parent;
	}
	reset() {
		s._reset(this);
	}
	pop() {
		return this.parent;
	}
	safePop() {
		return this.parent ? this.parent : this;
	}
	push(I, L, R, z, B, V, H) {
		return new s(this, I, L, R, z, B, V, H);
	}
	getEnterPos() {
		return this._enterPos;
	}
	getAnchorPos() {
		return this._anchorPos;
	}
	getRule(s) {
		return s.getRule(this.ruleId);
	}
	toString() {
		let s = [];
		return this._writeString(s, 0), "[" + s.join(",") + "]";
	}
	_writeString(s, I) {
		return this.parent && (I = this.parent._writeString(s, I)), s[I++] = `(${this.ruleId}, ${this.nameScopesList?.toString()}, ${this.contentNameScopesList?.toString()})`, I;
	}
	withContentNameScopesList(s) {
		return this.contentNameScopesList === s ? this : this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, this.endRule, this.nameScopesList, s);
	}
	withEndRule(I) {
		return this.endRule === I ? this : new s(this.parent, this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, I, this.nameScopesList, this.contentNameScopesList);
	}
	hasSameRuleAs(s) {
		let I = this;
		for (; I && I._enterPos === s._enterPos;) {
			if (I.ruleId === s.ruleId) return !0;
			I = I.parent;
		}
		return !1;
	}
	toStateStackFrame() {
		return {
			ruleId: ruleIdToNumber(this.ruleId),
			beginRuleCapturedEOL: this.beginRuleCapturedEOL,
			endRule: this.endRule,
			nameScopesList: this.nameScopesList?.getExtensionIfDefined(this.parent?.nameScopesList ?? null) ?? [],
			contentNameScopesList: this.contentNameScopesList?.getExtensionIfDefined(this.nameScopesList) ?? []
		};
	}
	static pushFrame(I, L) {
		let R = AttributedScopeStack.fromExtension(I?.nameScopesList ?? null, L.nameScopesList);
		return new s(I, ruleIdFromNumber(L.ruleId), L.enterPos ?? -1, L.anchorPos ?? -1, L.beginRuleCapturedEOL, L.endRule, R, AttributedScopeStack.fromExtension(R, L.contentNameScopesList));
	}
}, BalancedBracketSelectors = class {
	balancedBracketScopes;
	unbalancedBracketScopes;
	allowAny = !1;
	constructor(s, I) {
		this.balancedBracketScopes = s.flatMap((s) => s === "*" ? (this.allowAny = !0, []) : createMatchers(s, nameMatcher).map((s) => s.matcher)), this.unbalancedBracketScopes = I.flatMap((s) => createMatchers(s, nameMatcher).map((s) => s.matcher));
	}
	get matchesAlways() {
		return this.allowAny && this.unbalancedBracketScopes.length === 0;
	}
	get matchesNever() {
		return this.balancedBracketScopes.length === 0 && !this.allowAny;
	}
	match(s) {
		for (let I of this.unbalancedBracketScopes) if (I(s)) return !1;
		for (let I of this.balancedBracketScopes) if (I(s)) return !0;
		return this.allowAny;
	}
}, LineTokens = class {
	constructor(s, I, L, R) {
		this.balancedBracketSelectors = R, this._emitBinaryTokens = s, this._tokenTypeOverrides = L, this._lineText = null, this._tokens = [], this._binaryTokens = [], this._lastTokenEndIndex = 0;
	}
	_emitBinaryTokens;
	_lineText;
	_tokens;
	_binaryTokens;
	_lastTokenEndIndex;
	_tokenTypeOverrides;
	produce(s, I) {
		this.produceFromScopes(s.contentNameScopesList, I);
	}
	produceFromScopes(s, I) {
		if (this._lastTokenEndIndex >= I) return;
		if (this._emitBinaryTokens) {
			let L = s?.tokenAttributes ?? 0, R = !1;
			if (this.balancedBracketSelectors?.matchesAlways && (R = !0), this._tokenTypeOverrides.length > 0 || this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever) {
				let I = s?.getScopeNames() ?? [];
				for (let s of this._tokenTypeOverrides) s.matcher(I) && (L = EncodedTokenMetadata.set(L, 0, toOptionalTokenType(s.type), null, -1, 0, 0));
				this.balancedBracketSelectors && (R = this.balancedBracketSelectors.match(I));
			}
			if (R && (L = EncodedTokenMetadata.set(L, 0, 8, R, -1, 0, 0)), this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === L) {
				this._lastTokenEndIndex = I;
				return;
			}
			this._binaryTokens.push(this._lastTokenEndIndex), this._binaryTokens.push(L), this._lastTokenEndIndex = I;
			return;
		}
		let L = s?.getScopeNames() ?? [];
		this._tokens.push({
			startIndex: this._lastTokenEndIndex,
			endIndex: I,
			scopes: L
		}), this._lastTokenEndIndex = I;
	}
	getResult(s, I) {
		return this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === I - 1 && this._tokens.pop(), this._tokens.length === 0 && (this._lastTokenEndIndex = -1, this.produce(s, I), this._tokens[this._tokens.length - 1].startIndex = 0), this._tokens;
	}
	getBinaryResult(s, I) {
		this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === I - 1 && (this._binaryTokens.pop(), this._binaryTokens.pop()), this._binaryTokens.length === 0 && (this._lastTokenEndIndex = -1, this.produce(s, I), this._binaryTokens[this._binaryTokens.length - 2] = 0);
		let L = new Uint32Array(this._binaryTokens.length);
		for (let s = 0, I = this._binaryTokens.length; s < I; s++) L[s] = this._binaryTokens[s];
		return L;
	}
}, SyncRegistry = class {
	constructor(s, I) {
		this._onigLib = I, this._theme = s;
	}
	_grammars = /* @__PURE__ */ new Map();
	_rawGrammars = /* @__PURE__ */ new Map();
	_injectionGrammars = /* @__PURE__ */ new Map();
	_theme;
	dispose() {
		for (let s of this._grammars.values()) s.dispose();
	}
	setTheme(s) {
		this._theme = s;
	}
	getColorMap() {
		return this._theme.getColorMap();
	}
	addGrammar(s, I) {
		this._rawGrammars.set(s.scopeName, s), I && this._injectionGrammars.set(s.scopeName, I);
	}
	lookup(s) {
		return this._rawGrammars.get(s);
	}
	injections(s) {
		return this._injectionGrammars.get(s);
	}
	getDefaults() {
		return this._theme.getDefaults();
	}
	themeMatch(s) {
		return this._theme.match(s);
	}
	grammarForScopeName(s, I, L, R, z) {
		if (!this._grammars.has(s)) {
			let B = this._rawGrammars.get(s);
			if (!B) return null;
			this._grammars.set(s, createGrammar(s, B, I, L, R, z, this, this._onigLib));
		}
		return this._grammars.get(s);
	}
}, Registry = class {
	_options;
	_syncRegistry;
	_ensureGrammarCache;
	constructor(s) {
		this._options = s, this._syncRegistry = new SyncRegistry(Theme.createFromRawTheme(s.theme, s.colorMap), s.onigLib), this._ensureGrammarCache = /* @__PURE__ */ new Map();
	}
	dispose() {
		this._syncRegistry.dispose();
	}
	setTheme(s, I) {
		this._syncRegistry.setTheme(Theme.createFromRawTheme(s, I));
	}
	getColorMap() {
		return this._syncRegistry.getColorMap();
	}
	loadGrammarWithEmbeddedLanguages(s, I, L) {
		return this.loadGrammarWithConfiguration(s, I, { embeddedLanguages: L });
	}
	loadGrammarWithConfiguration(s, I, L) {
		return this._loadGrammar(s, I, L.embeddedLanguages, L.tokenTypes, new BalancedBracketSelectors(L.balancedBracketSelectors || [], L.unbalancedBracketSelectors || []));
	}
	loadGrammar(s) {
		return this._loadGrammar(s, 0, null, null, null);
	}
	_loadGrammar(s, I, L, R, z) {
		let B = new ScopeDependencyProcessor(this._syncRegistry, s);
		for (; B.Q.length > 0;) B.Q.map((s) => this._loadSingleGrammar(s.scopeName)), B.processQueue();
		return this._grammarForScopeName(s, I, L, R, z);
	}
	_loadSingleGrammar(s) {
		this._ensureGrammarCache.has(s) || (this._doLoadSingleGrammar(s), this._ensureGrammarCache.set(s, !0));
	}
	_doLoadSingleGrammar(s) {
		let I = this._options.loadGrammar(s);
		if (I) {
			let L = typeof this._options.getInjections == "function" ? this._options.getInjections(s) : void 0;
			this._syncRegistry.addGrammar(I, L);
		}
	}
	addGrammar(s, I = [], L = 0, R = null) {
		return this._syncRegistry.addGrammar(s, I), this._grammarForScopeName(s.scopeName, L, R);
	}
	_grammarForScopeName(s, I = 0, L = null, R = null, z = null) {
		return this._syncRegistry.grammarForScopeName(s, I, L, R, z);
	}
}, INITIAL = StateStackImpl.NULL;
const htmlVoidElements = [
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
];
var defaultSubsetRegex = /["&'<>`]/g, surrogatePairsRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g, controlCharactersRegex = /[\x01-\t\v\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g, regexEscapeRegex = /[|\\{}()[\]^$+*?.]/g, subsetToRegexCache = /* @__PURE__ */ new WeakMap();
function core(s, I) {
	if (s = s.replace(I.subset ? charactersToExpressionCached(I.subset) : defaultSubsetRegex, R), I.subset || I.escapeOnly) return s;
	return s.replace(surrogatePairsRegex, L).replace(controlCharactersRegex, R);
	function L(s, L, R) {
		return I.format((s.charCodeAt(0) - 55296) * 1024 + s.charCodeAt(1) - 56320 + 65536, R.charCodeAt(L + 2), I);
	}
	function R(s, L, R) {
		return I.format(s.charCodeAt(0), R.charCodeAt(L + 1), I);
	}
}
function charactersToExpressionCached(s) {
	let I = subsetToRegexCache.get(s);
	return I || (I = charactersToExpression(s), subsetToRegexCache.set(s, I)), I;
}
function charactersToExpression(s) {
	let I = [], L = -1;
	for (; ++L < s.length;) I.push(s[L].replace(regexEscapeRegex, "\\$&"));
	return RegExp("(?:" + I.join("|") + ")", "g");
}
var hexadecimalRegex = /[\dA-Fa-f]/;
function toHexadecimal(s, I, L) {
	let R = "&#x" + s.toString(16).toUpperCase();
	return L && I && !hexadecimalRegex.test(String.fromCharCode(I)) ? R : R + ";";
}
var decimalRegex = /\d/;
function toDecimal(s, I, L) {
	let R = "&#" + String(s);
	return L && I && !decimalRegex.test(String.fromCharCode(I)) ? R : R + ";";
}
const characterEntitiesLegacy = /* @__PURE__ */ "AElig.AMP.Aacute.Acirc.Agrave.Aring.Atilde.Auml.COPY.Ccedil.ETH.Eacute.Ecirc.Egrave.Euml.GT.Iacute.Icirc.Igrave.Iuml.LT.Ntilde.Oacute.Ocirc.Ograve.Oslash.Otilde.Ouml.QUOT.REG.THORN.Uacute.Ucirc.Ugrave.Uuml.Yacute.aacute.acirc.acute.aelig.agrave.amp.aring.atilde.auml.brvbar.ccedil.cedil.cent.copy.curren.deg.divide.eacute.ecirc.egrave.eth.euml.frac12.frac14.frac34.gt.iacute.icirc.iexcl.igrave.iquest.iuml.laquo.lt.macr.micro.middot.nbsp.not.ntilde.oacute.ocirc.ograve.ordf.ordm.oslash.otilde.ouml.para.plusmn.pound.quot.raquo.reg.sect.shy.sup1.sup2.sup3.szlig.thorn.times.uacute.ucirc.ugrave.uml.uuml.yacute.yen.yuml".split("."), characterEntitiesHtml4 = {
	nbsp: "\xA0",
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
	quot: "\"",
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
}, dangerous = [
	"cent",
	"copy",
	"divide",
	"gt",
	"lt",
	"not",
	"para",
	"times"
];
var own$1 = {}.hasOwnProperty, characters = {}, key;
for (key in characterEntitiesHtml4) own$1.call(characterEntitiesHtml4, key) && (characters[characterEntitiesHtml4[key]] = key);
var notAlphanumericRegex = /[^\dA-Za-z]/;
function toNamed(s, I, L, R) {
	let z = String.fromCharCode(s);
	if (own$1.call(characters, z)) {
		let s = characters[z], B = "&" + s;
		return L && characterEntitiesLegacy.includes(s) && !dangerous.includes(s) && (!R || I && I !== 61 && notAlphanumericRegex.test(String.fromCharCode(I))) ? B : B + ";";
	}
	return "";
}
function formatSmart(s, I, L) {
	let R = toHexadecimal(s, I, L.omitOptionalSemicolons), z;
	if ((L.useNamedReferences || L.useShortestReferences) && (z = toNamed(s, I, L.omitOptionalSemicolons, L.attribute)), (L.useShortestReferences || !z) && L.useShortestReferences) {
		let z = toDecimal(s, I, L.omitOptionalSemicolons);
		z.length < R.length && (R = z);
	}
	return z && (!L.useShortestReferences || z.length < R.length) ? z : R;
}
function stringifyEntities(s, I) {
	return core(s, Object.assign({ format: formatSmart }, I));
}
var htmlCommentRegex = /^>|^->|<!--|-->|--!>|<!-$/g, bogusCommentEntitySubset = [">"], commentEntitySubset = ["<", ">"];
function comment(s, I, L, R) {
	return R.settings.bogusComments ? "<?" + stringifyEntities(s.value, Object.assign({}, R.settings.characterReferences, { subset: bogusCommentEntitySubset })) + ">" : "<!--" + s.value.replace(htmlCommentRegex, z) + "-->";
	function z(s) {
		return stringifyEntities(s, Object.assign({}, R.settings.characterReferences, { subset: commentEntitySubset }));
	}
}
function doctype(s, I, L, R) {
	return "<!" + (R.settings.upperDoctype ? "DOCTYPE" : "doctype") + (R.settings.tightDoctype ? "" : " ") + "html>";
}
const siblingAfter = siblings(1), siblingBefore = siblings(-1);
var emptyChildren$1 = [];
function siblings(s) {
	return I;
	function I(I, L, R) {
		let z = I ? I.children : emptyChildren$1, V = (L || 0) + s, H = z[V];
		if (!R) for (; H && whitespace(H);) V += s, H = z[V];
		return H;
	}
}
var own = {}.hasOwnProperty;
function omission(s) {
	return I;
	function I(I, L, R) {
		return own.call(s, I.tagName) && s[I.tagName](I, L, R);
	}
}
const closing = omission({
	body: body$1,
	caption: headOrColgroupOrCaption,
	colgroup: headOrColgroupOrCaption,
	dd,
	dt,
	head: headOrColgroupOrCaption,
	html: html$2,
	li,
	optgroup,
	option,
	p,
	rp: rubyElement,
	rt: rubyElement,
	tbody: tbody$1,
	td: cells,
	tfoot,
	th: cells,
	thead,
	tr
});
function headOrColgroupOrCaption(s, I, L) {
	let R = siblingAfter(L, I, !0);
	return !R || R.type !== "comment" && !(R.type === "text" && whitespace(R.value.charAt(0)));
}
function html$2(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type !== "comment";
}
function body$1(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type !== "comment";
}
function p(s, I, L) {
	let R = siblingAfter(L, I);
	return R ? R.type === "element" && (R.tagName === "address" || R.tagName === "article" || R.tagName === "aside" || R.tagName === "blockquote" || R.tagName === "details" || R.tagName === "div" || R.tagName === "dl" || R.tagName === "fieldset" || R.tagName === "figcaption" || R.tagName === "figure" || R.tagName === "footer" || R.tagName === "form" || R.tagName === "h1" || R.tagName === "h2" || R.tagName === "h3" || R.tagName === "h4" || R.tagName === "h5" || R.tagName === "h6" || R.tagName === "header" || R.tagName === "hgroup" || R.tagName === "hr" || R.tagName === "main" || R.tagName === "menu" || R.tagName === "nav" || R.tagName === "ol" || R.tagName === "p" || R.tagName === "pre" || R.tagName === "section" || R.tagName === "table" || R.tagName === "ul") : !L || !(L.type === "element" && (L.tagName === "a" || L.tagName === "audio" || L.tagName === "del" || L.tagName === "ins" || L.tagName === "map" || L.tagName === "noscript" || L.tagName === "video"));
}
function li(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && R.tagName === "li";
}
function dt(s, I, L) {
	let R = siblingAfter(L, I);
	return !!(R && R.type === "element" && (R.tagName === "dt" || R.tagName === "dd"));
}
function dd(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && (R.tagName === "dt" || R.tagName === "dd");
}
function rubyElement(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && (R.tagName === "rp" || R.tagName === "rt");
}
function optgroup(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && R.tagName === "optgroup";
}
function option(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && (R.tagName === "option" || R.tagName === "optgroup");
}
function thead(s, I, L) {
	let R = siblingAfter(L, I);
	return !!(R && R.type === "element" && (R.tagName === "tbody" || R.tagName === "tfoot"));
}
function tbody$1(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && (R.tagName === "tbody" || R.tagName === "tfoot");
}
function tfoot(s, I, L) {
	return !siblingAfter(L, I);
}
function tr(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && R.tagName === "tr";
}
function cells(s, I, L) {
	let R = siblingAfter(L, I);
	return !R || R.type === "element" && (R.tagName === "td" || R.tagName === "th");
}
const opening = omission({
	body,
	colgroup,
	head,
	html: html$1,
	tbody
});
function html$1(s) {
	let I = siblingAfter(s, -1);
	return !I || I.type !== "comment";
}
function head(s) {
	let I = /* @__PURE__ */ new Set();
	for (let L of s.children) if (L.type === "element" && (L.tagName === "base" || L.tagName === "title")) {
		if (I.has(L.tagName)) return !1;
		I.add(L.tagName);
	}
	let L = s.children[0];
	return !L || L.type === "element";
}
function body(s) {
	let I = siblingAfter(s, -1, !0);
	return !I || I.type !== "comment" && !(I.type === "text" && whitespace(I.value.charAt(0))) && !(I.type === "element" && (I.tagName === "meta" || I.tagName === "link" || I.tagName === "script" || I.tagName === "style" || I.tagName === "template"));
}
function colgroup(s, I, L) {
	let R = siblingBefore(L, I), z = siblingAfter(s, -1, !0);
	return L && R && R.type === "element" && R.tagName === "colgroup" && closing(R, L.children.indexOf(R), L) ? !1 : !!(z && z.type === "element" && z.tagName === "col");
}
function tbody(s, I, L) {
	let R = siblingBefore(L, I), z = siblingAfter(s, -1);
	return L && R && R.type === "element" && (R.tagName === "thead" || R.tagName === "tbody") && closing(R, L.children.indexOf(R), L) ? !1 : !!(z && z.type === "element" && z.tagName === "tr");
}
var constants = {
	name: [["	\n\f\r &/=>".split(""), "	\n\f\r \"&'/=>`".split("")], ["\0	\n\f\r \"&'/<=>".split(""), "\0	\n\f\r \"&'/<=>`".split("")]],
	unquoted: [["	\n\f\r &>".split(""), "\0	\n\f\r \"&'<=>`".split("")], ["\0	\n\f\r \"&'<=>`".split(""), "\0	\n\f\r \"&'<=>`".split("")]],
	single: [["&'".split(""), "\"&'`".split("")], ["\0&'".split(""), "\0\"&'`".split("")]],
	double: [["\"&".split(""), "\"&'`".split("")], ["\0\"&".split(""), "\0\"&'`".split("")]]
};
function element(s, I, R, z) {
	let B = z.schema, V = B.space === "svg" ? !1 : z.settings.omitOptionalTags, H = B.space === "svg" ? z.settings.closeEmptyElements : z.settings.voids.includes(s.tagName.toLowerCase()), U = [], W;
	B.space === "html" && s.tagName === "svg" && (z.schema = svg);
	let G = serializeAttributes(z, s.properties), K = z.all(B.space === "html" && s.tagName === "template" ? s.content : s);
	return z.schema = B, K && (H = !1), (G || !V || !opening(s, I, R)) && (U.push("<", s.tagName, G ? " " + G : ""), H && (B.space === "svg" || z.settings.closeSelfClosing) && (W = G.charAt(G.length - 1), (!z.settings.tightSelfClosing || W === "/" || W && W !== "\"" && W !== "'") && U.push(" "), U.push("/")), U.push(">")), U.push(K), !H && (!V || !closing(s, I, R)) && U.push("</" + s.tagName + ">"), U.join("");
}
function serializeAttributes(s, I) {
	let L = [], R = -1, z;
	if (I) {
		for (z in I) if (I[z] !== null && I[z] !== void 0) {
			let R = serializeAttribute(s, z, I[z]);
			R && L.push(R);
		}
	}
	for (; ++R < L.length;) {
		let I = s.settings.tightAttributes ? L[R].charAt(L[R].length - 1) : void 0;
		R !== L.length - 1 && I !== "\"" && I !== "'" && (L[R] += " ");
	}
	return L.join("");
}
function serializeAttribute(L, z, B) {
	let H = find(L.schema, z), U = L.settings.allowParseErrors && L.schema.space === "html" ? 0 : 1, W = L.settings.allowDangerousCharacters ? 0 : 1, G = L.quote, K;
	if (H.overloadedBoolean && (B === H.attribute || B === "") ? B = !0 : (H.boolean || H.overloadedBoolean) && (typeof B != "string" || B === H.attribute || B === "") && (B = !!B), B == null || B === !1 || typeof B == "number" && Number.isNaN(B)) return "";
	let q = stringifyEntities(H.attribute, Object.assign({}, L.settings.characterReferences, { subset: constants.name[U][W] }));
	return B === !0 || (B = Array.isArray(B) ? (H.commaSeparated ? stringify$1 : stringify$2)(B, { padLeft: !L.settings.tightCommaSeparatedLists }) : String(B), L.settings.collapseEmptyAttributes && !B) ? q : (L.settings.preferUnquoted && (K = stringifyEntities(B, Object.assign({}, L.settings.characterReferences, {
		attribute: !0,
		subset: constants.unquoted[U][W]
	}))), K !== B && (L.settings.quoteSmart && ccount(B, G) > ccount(B, L.alternative) && (G = L.alternative), K = G + stringifyEntities(B, Object.assign({}, L.settings.characterReferences, {
		subset: (G === "'" ? constants.single : constants.double)[U][W],
		attribute: !0
	})) + G), q + (K && "=" + K));
}
var textEntitySubset = ["<", "&"];
function text(s, I, L, R) {
	return L && L.type === "element" && (L.tagName === "script" || L.tagName === "style") ? s.value : stringifyEntities(s.value, Object.assign({}, R.settings.characterReferences, { subset: textEntitySubset }));
}
function raw(s, I, L, R) {
	return R.settings.allowDangerousHtml ? s.value : text(s, I, L, R);
}
function root(s, I, L, R) {
	return R.all(s);
}
const handle = zwitch("type", {
	invalid,
	unknown,
	handlers: {
		comment,
		doctype,
		element,
		raw,
		root,
		text
	}
});
function invalid(s) {
	throw Error("Expected node, not `" + s + "`");
}
function unknown(s) {
	let I = s;
	throw Error("Cannot compile unknown node `" + I.type + "`");
}
var emptyOptions = {}, emptyCharacterReferences = {}, emptyChildren = [];
function toHtml(s, I) {
	let R = I || emptyOptions, B = R.quote || "\"", V = B === "\"" ? "'" : "\"";
	if (B !== "\"" && B !== "'") throw Error("Invalid quote `" + B + "`, expected `'` or `\"`");
	return {
		one,
		all,
		settings: {
			omitOptionalTags: R.omitOptionalTags || !1,
			allowParseErrors: R.allowParseErrors || !1,
			allowDangerousCharacters: R.allowDangerousCharacters || !1,
			quoteSmart: R.quoteSmart || !1,
			preferUnquoted: R.preferUnquoted || !1,
			tightAttributes: R.tightAttributes || !1,
			upperDoctype: R.upperDoctype || !1,
			tightDoctype: R.tightDoctype || !1,
			bogusComments: R.bogusComments || !1,
			tightCommaSeparatedLists: R.tightCommaSeparatedLists || !1,
			tightSelfClosing: R.tightSelfClosing || !1,
			collapseEmptyAttributes: R.collapseEmptyAttributes || !1,
			allowDangerousHtml: R.allowDangerousHtml || !1,
			voids: R.voids || htmlVoidElements,
			characterReferences: R.characterReferences || emptyCharacterReferences,
			closeSelfClosing: R.closeSelfClosing || !1,
			closeEmptyElements: R.closeEmptyElements || !1
		},
		schema: R.space === "svg" ? svg : html,
		quote: B,
		alternative: V
	}.one(Array.isArray(s) ? {
		type: "root",
		children: s
	} : s, void 0, void 0);
}
function one(s, I, L) {
	return handle(s, I, L, this);
}
function all(s) {
	let I = [], L = s && s.children || emptyChildren, R = -1;
	for (; ++R < L.length;) I[R] = this.one(L[R], R, s);
	return I.join("");
}
function createOnigurumaEngine$1(s) {
	return warnDeprecated("import `createOnigurumaEngine` from `@shikijs/engine-oniguruma` or `shiki/engine/oniguruma` instead"), createOnigurumaEngine(s);
}
function toArray(s) {
	return Array.isArray(s) ? s : [s];
}
function splitLines(s, I = !1) {
	let L = s.split(/(\r?\n)/g), R = 0, z = [];
	for (let s = 0; s < L.length; s += 2) {
		let B = I ? L[s] + (L[s + 1] || "") : L[s];
		z.push([B, R]), R += L[s].length, R += L[s + 1]?.length || 0;
	}
	return z;
}
function isPlainLang(s) {
	return !s || [
		"plaintext",
		"txt",
		"text",
		"plain"
	].includes(s);
}
function isSpecialLang(s) {
	return s === "ansi" || isPlainLang(s);
}
function isNoneTheme(s) {
	return s === "none";
}
function isSpecialTheme(s) {
	return isNoneTheme(s);
}
function addClassToHast(s, I) {
	if (!I) return s;
	s.properties ||= {}, s.properties.class ||= [], typeof s.properties.class == "string" && (s.properties.class = s.properties.class.split(/\s+/g)), Array.isArray(s.properties.class) || (s.properties.class = []);
	let L = Array.isArray(I) ? I : I.split(/\s+/g);
	for (let I of L) I && !s.properties.class.includes(I) && s.properties.class.push(I);
	return s;
}
function splitToken(s, I) {
	let L = 0, R = [];
	for (let z of I) z > L && R.push({
		...s,
		content: s.content.slice(L, z),
		offset: s.offset + L
	}), L = z;
	return L < s.content.length && R.push({
		...s,
		content: s.content.slice(L),
		offset: s.offset + L
	}), R;
}
function splitTokens(s, I) {
	let L = Array.from(I instanceof Set ? I : new Set(I)).sort((s, I) => s - I);
	return L.length ? s.map((s) => s.flatMap((s) => {
		let I = L.filter((I) => s.offset < I && I < s.offset + s.content.length).map((I) => I - s.offset).sort((s, I) => s - I);
		return I.length ? splitToken(s, I) : s;
	})) : s;
}
async function normalizeGetter(s) {
	return Promise.resolve(typeof s == "function" ? s() : s).then((s) => s.default || s);
}
function resolveColorReplacements(s, I) {
	let L = typeof s == "string" ? {} : { ...s.colorReplacements }, R = typeof s == "string" ? s : s.name;
	for (let [s, z] of Object.entries(I?.colorReplacements || {})) typeof z == "string" ? L[s] = z : s === R && Object.assign(L, z);
	return L;
}
function applyColorReplacements(s, I) {
	return s && (I?.[s?.toLowerCase()] || s);
}
function getTokenStyleObject(s) {
	let I = {};
	return s.color && (I.color = s.color), s.bgColor && (I["background-color"] = s.bgColor), s.fontStyle && (s.fontStyle & FontStyle.Italic && (I["font-style"] = "italic"), s.fontStyle & FontStyle.Bold && (I["font-weight"] = "bold"), s.fontStyle & FontStyle.Underline && (I["text-decoration"] = "underline")), I;
}
function stringifyTokenStyle(s) {
	return typeof s == "string" ? s : Object.entries(s).map(([s, I]) => `${s}:${I}`).join(";");
}
function createPositionConverter(s) {
	let I = splitLines(s, !0).map(([s]) => s);
	function L(L) {
		if (L === s.length) return {
			line: I.length - 1,
			character: I[I.length - 1].length
		};
		let R = L, z = 0;
		for (let s of I) {
			if (R < s.length) break;
			R -= s.length, z++;
		}
		return {
			line: z,
			character: R
		};
	}
	function R(s, L) {
		let R = 0;
		for (let L = 0; L < s; L++) R += I[L].length;
		return R += L, R;
	}
	return {
		lines: I,
		indexToPos: L,
		posToIndex: R
	};
}
var ShikiError$1 = class extends Error {
	constructor(s) {
		super(s), this.name = "ShikiError";
	}
}, _grammarStateMap = /* @__PURE__ */ new WeakMap();
function setLastGrammarStateToMap(s, I) {
	_grammarStateMap.set(s, I);
}
function getLastGrammarStateFromMap(s) {
	return _grammarStateMap.get(s);
}
var GrammarState = class s {
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
	static initial(I, L) {
		return new s(Object.fromEntries(toArray(L).map((s) => [s, INITIAL])), I);
	}
	constructor(...s) {
		if (s.length === 2) {
			let [I, L] = s;
			this.lang = L, this._stacks = I;
		} else {
			let [I, L, R] = s;
			this.lang = L, this._stacks = { [R]: I };
		}
	}
	getInternalStack(s = this.theme) {
		return this._stacks[s];
	}
	get scopes() {
		return warnDeprecated("GrammarState.scopes is deprecated, use GrammarState.getScopes() instead"), getScopes(this._stacks[this.theme]);
	}
	getScopes(s = this.theme) {
		return getScopes(this._stacks[s]);
	}
	toJSON() {
		return {
			lang: this.lang,
			theme: this.theme,
			themes: this.themes,
			scopes: this.scopes
		};
	}
};
function getScopes(s) {
	let I = [], L = /* @__PURE__ */ new Set();
	function R(s) {
		if (L.has(s)) return;
		L.add(s);
		let z = s?.nameScopesList?.scopeName;
		z && I.push(z), s.parent && R(s.parent);
	}
	return R(s), I;
}
function getGrammarStack(s, I) {
	if (!(s instanceof GrammarState)) throw new ShikiError$1("Invalid grammar state");
	return s.getInternalStack(I);
}
function transformerDecorations() {
	let s = /* @__PURE__ */ new WeakMap();
	function I(I) {
		if (!s.has(I.meta)) {
			let L = function(s) {
				if (typeof s == "number") {
					if (s < 0 || s > I.source.length) throw new ShikiError$1(`Invalid decoration offset: ${s}. Code length: ${I.source.length}`);
					return {
						...R.indexToPos(s),
						offset: s
					};
				} else {
					let I = R.lines[s.line];
					if (I === void 0) throw new ShikiError$1(`Invalid decoration position ${JSON.stringify(s)}. Lines length: ${R.lines.length}`);
					if (s.character < 0 || s.character > I.length) throw new ShikiError$1(`Invalid decoration position ${JSON.stringify(s)}. Line ${s.line} length: ${I.length}`);
					return {
						...s,
						offset: R.posToIndex(s.line, s.character)
					};
				}
			}, R = createPositionConverter(I.source), z = (I.options.decorations || []).map((s) => ({
				...s,
				start: L(s.start),
				end: L(s.end)
			}));
			verifyIntersections(z), s.set(I.meta, {
				decorations: z,
				converter: R,
				source: I.source
			});
		}
		return s.get(I.meta);
	}
	return {
		name: "shiki:decorations",
		tokens(s) {
			if (this.options.decorations?.length) return splitTokens(s, I(this).decorations.flatMap((s) => [s.start.offset, s.end.offset]));
		},
		code(s) {
			if (!this.options.decorations?.length) return;
			let L = I(this), R = Array.from(s.children).filter((s) => s.type === "element" && s.tagName === "span");
			if (R.length !== L.converter.lines.length) throw new ShikiError$1(`Number of lines in code element (${R.length}) does not match the number of lines in the source (${L.converter.lines.length}). Failed to apply decorations.`);
			function z(s, I, L, z) {
				let B = R[s], H = "", U = -1, W = -1;
				if (I === 0 && (U = 0), L === 0 && (W = 0), L === Infinity && (W = B.children.length), U === -1 || W === -1) for (let s = 0; s < B.children.length; s++) H += stringify(B.children[s]), U === -1 && H.length === I && (U = s + 1), W === -1 && H.length === L && (W = s + 1);
				if (U === -1) throw new ShikiError$1(`Failed to find start index for decoration ${JSON.stringify(z.start)}`);
				if (W === -1) throw new ShikiError$1(`Failed to find end index for decoration ${JSON.stringify(z.end)}`);
				let G = B.children.slice(U, W);
				if (!z.alwaysWrap && G.length === B.children.length) V(B, z, "line");
				else if (!z.alwaysWrap && G.length === 1 && G[0].type === "element") V(G[0], z, "token");
				else {
					let s = {
						type: "element",
						tagName: "span",
						properties: {},
						children: G
					};
					V(s, z, "wrapper"), B.children.splice(U, G.length, s);
				}
			}
			function B(s, I) {
				R[s] = V(R[s], I, "line");
			}
			function V(s, I, L) {
				let R = I.properties || {}, z = I.transform || ((s) => s);
				return s.tagName = I.tagName || "span", s.properties = {
					...s.properties,
					...R,
					class: s.properties.class
				}, I.properties?.class && addClassToHast(s, I.properties.class), s = z(s, L) || s, s;
			}
			let H = [], U = L.decorations.sort((s, I) => I.start.offset - s.start.offset);
			for (let s of U) {
				let { start: I, end: L } = s;
				if (I.line === L.line) z(I.line, I.character, L.character, s);
				else if (I.line < L.line) {
					z(I.line, I.character, Infinity, s);
					for (let R = I.line + 1; R < L.line; R++) H.unshift(() => B(R, s));
					z(L.line, 0, L.character, s);
				}
			}
			H.forEach((s) => s());
		}
	};
}
function verifyIntersections(s) {
	for (let I = 0; I < s.length; I++) {
		let L = s[I];
		if (L.start.offset > L.end.offset) throw new ShikiError$1(`Invalid decoration range: ${JSON.stringify(L.start)} - ${JSON.stringify(L.end)}`);
		for (let R = I + 1; R < s.length; R++) {
			let I = s[R], z = L.start.offset < I.start.offset && I.start.offset < L.end.offset, B = L.start.offset < I.end.offset && I.end.offset < L.end.offset, V = I.start.offset < L.start.offset && L.start.offset < I.end.offset, H = I.start.offset < L.end.offset && L.end.offset < I.end.offset;
			if (z || B || V || H) {
				if (B && B || V && H) continue;
				throw new ShikiError$1(`Decorations ${JSON.stringify(L.start)} and ${JSON.stringify(I.start)} intersect.`);
			}
		}
	}
}
function stringify(s) {
	return s.type === "text" ? s.value : s.type === "element" ? s.children.map(stringify).join("") : "";
}
var builtInTransformers = [/* @__PURE__ */ transformerDecorations()];
function getTransformers(s) {
	return [...s.transformers || [], ...builtInTransformers];
}
var namedColors = [
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
], decorations = {
	1: "bold",
	2: "dim",
	3: "italic",
	4: "underline",
	7: "reverse",
	9: "strikethrough"
};
function findSequence(s, I) {
	let L = s.indexOf("\x1B[", I);
	if (L !== -1) {
		let I = s.indexOf("m", L);
		return {
			sequence: s.substring(L + 2, I).split(";"),
			startPosition: L,
			position: I + 1
		};
	}
	return { position: s.length };
}
function parseColor(s, I) {
	let L = 1, R = s[I + L++], z;
	if (R === "2") {
		let R = [
			s[I + L++],
			s[I + L++],
			s[I + L]
		].map((s) => Number.parseInt(s));
		R.length === 3 && !R.some((s) => Number.isNaN(s)) && (z = {
			type: "rgb",
			rgb: R
		});
	} else if (R === "5") {
		let R = Number.parseInt(s[I + L]);
		Number.isNaN(R) || (z = {
			type: "table",
			index: Number(R)
		});
	}
	return [L, z];
}
function parseSequence(s) {
	let I = [];
	for (let L = 0; L < s.length; L++) {
		let R = s[L], z = Number.parseInt(R);
		if (!Number.isNaN(z)) if (z === 0) I.push({ type: "resetAll" });
		else if (z <= 9) decorations[z] && I.push({
			type: "setDecoration",
			value: decorations[z]
		});
		else if (z <= 29) {
			let s = decorations[z - 20];
			s && I.push({
				type: "resetDecoration",
				value: s
			});
		} else if (z <= 37) I.push({
			type: "setForegroundColor",
			value: {
				type: "named",
				name: namedColors[z - 30]
			}
		});
		else if (z === 38) {
			let [R, z] = parseColor(s, L);
			z && I.push({
				type: "setForegroundColor",
				value: z
			}), L += R;
		} else if (z === 39) I.push({ type: "resetForegroundColor" });
		else if (z <= 47) I.push({
			type: "setBackgroundColor",
			value: {
				type: "named",
				name: namedColors[z - 40]
			}
		});
		else if (z === 48) {
			let [R, z] = parseColor(s, L);
			z && I.push({
				type: "setBackgroundColor",
				value: z
			}), L += R;
		} else z === 49 ? I.push({ type: "resetBackgroundColor" }) : z >= 90 && z <= 97 ? I.push({
			type: "setForegroundColor",
			value: {
				type: "named",
				name: namedColors[z - 90 + 8]
			}
		}) : z >= 100 && z <= 107 && I.push({
			type: "setBackgroundColor",
			value: {
				type: "named",
				name: namedColors[z - 100 + 8]
			}
		});
	}
	return I;
}
function createAnsiSequenceParser() {
	let s = null, I = null, L = /* @__PURE__ */ new Set();
	return { parse(R) {
		let z = [], B = 0;
		do {
			let V = findSequence(R, B), H = V.sequence ? R.substring(B, V.startPosition) : R.substring(B);
			if (H.length > 0 && z.push({
				value: H,
				foreground: s,
				background: I,
				decorations: new Set(L)
			}), V.sequence) {
				let R = parseSequence(V.sequence);
				for (let z of R) z.type === "resetAll" ? (s = null, I = null, L.clear()) : z.type === "resetForegroundColor" ? s = null : z.type === "resetBackgroundColor" ? I = null : z.type === "resetDecoration" && L.delete(z.value);
				for (let z of R) z.type === "setForegroundColor" ? s = z.value : z.type === "setBackgroundColor" ? I = z.value : z.type === "setDecoration" && L.add(z.value);
			}
			B = V.position;
		} while (B < R.length);
		return z;
	} };
}
var defaultNamedColorsMap = {
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
function createColorPalette(s = defaultNamedColorsMap) {
	function I(I) {
		return s[I];
	}
	function L(s) {
		return `#${s.map((s) => Math.max(0, Math.min(s, 255)).toString(16).padStart(2, "0")).join("")}`;
	}
	let R;
	function z() {
		if (R) return R;
		R = [];
		for (let s = 0; s < namedColors.length; s++) R.push(I(namedColors[s]));
		let s = [
			0,
			95,
			135,
			175,
			215,
			255
		];
		for (let I = 0; I < 6; I++) for (let z = 0; z < 6; z++) for (let B = 0; B < 6; B++) R.push(L([
			s[I],
			s[z],
			s[B]
		]));
		let z = 8;
		for (let s = 0; s < 24; s++, z += 10) R.push(L([
			z,
			z,
			z
		]));
		return R;
	}
	function B(s) {
		return z()[s];
	}
	function V(s) {
		switch (s.type) {
			case "named": return I(s.name);
			case "rgb": return L(s.rgb);
			case "table": return B(s.index);
		}
	}
	return { value: V };
}
function tokenizeAnsiWithTheme(s, I, L) {
	let R = resolveColorReplacements(s, L), z = splitLines(I), B = createColorPalette(Object.fromEntries(namedColors.map((I) => [I, s.colors?.[`terminal.ansi${I[0].toUpperCase()}${I.substring(1)}`]]))), V = createAnsiSequenceParser();
	return z.map((I) => V.parse(I[0]).map((L) => {
		let z, V;
		L.decorations.has("reverse") ? (z = L.background ? B.value(L.background) : s.bg, V = L.foreground ? B.value(L.foreground) : s.fg) : (z = L.foreground ? B.value(L.foreground) : s.fg, V = L.background ? B.value(L.background) : void 0), z = applyColorReplacements(z, R), V = applyColorReplacements(V, R), L.decorations.has("dim") && (z = dimColor(z));
		let H = FontStyle.None;
		return L.decorations.has("bold") && (H |= FontStyle.Bold), L.decorations.has("italic") && (H |= FontStyle.Italic), L.decorations.has("underline") && (H |= FontStyle.Underline), {
			content: L.value,
			offset: I[1],
			color: z,
			bgColor: V,
			fontStyle: H
		};
	}));
}
function dimColor(s) {
	let I = s.match(/#([0-9a-f]{3})([0-9a-f]{3})?([0-9a-f]{2})?/);
	if (I) if (I[3]) {
		let s = Math.round(Number.parseInt(I[3], 16) / 2).toString(16).padStart(2, "0");
		return `#${I[1]}${I[2]}${s}`;
	} else if (I[2]) return `#${I[1]}${I[2]}80`;
	else return `#${Array.from(I[1]).map((s) => `${s}${s}`).join("")}80`;
	let L = s.match(/var\((--[\w-]+-ansi-[\w-]+)\)/);
	return L ? `var(${L[1]}-dim)` : s;
}
function codeToTokensBase$1(s, I, L = {}) {
	let { lang: R = "text", theme: z = s.getLoadedThemes()[0] } = L;
	if (isPlainLang(R) || isNoneTheme(z)) return splitLines(I).map((s) => [{
		content: s[0],
		offset: s[1]
	}]);
	let { theme: B, colorMap: V } = s.setTheme(z);
	if (R === "ansi") return tokenizeAnsiWithTheme(B, I, L);
	let H = s.getLanguage(R);
	if (L.grammarState) {
		if (L.grammarState.lang !== H.name) throw new ShikiError(`Grammar state language "${L.grammarState.lang}" does not match highlight language "${H.name}"`);
		if (!L.grammarState.themes.includes(B.name)) throw new ShikiError(`Grammar state themes "${L.grammarState.themes}" do not contain highlight theme "${B.name}"`);
	}
	return tokenizeWithTheme(I, H, B, V, L);
}
function getLastGrammarState$1(...s) {
	if (s.length === 2) return getLastGrammarStateFromMap(s[1]);
	let [I, L, R = {}] = s, { lang: z = "text", theme: B = I.getLoadedThemes()[0] } = R;
	if (isPlainLang(z) || isNoneTheme(B)) throw new ShikiError("Plain language does not have grammar state");
	if (z === "ansi") throw new ShikiError("ANSI language does not have grammar state");
	let { theme: V, colorMap: H } = I.setTheme(B), U = I.getLanguage(z);
	return new GrammarState(_tokenizeWithTheme(L, U, V, H, R).stateStack, U.name, V.name);
}
function tokenizeWithTheme(s, I, L, R, z) {
	let B = _tokenizeWithTheme(s, I, L, R, z), V = new GrammarState(_tokenizeWithTheme(s, I, L, R, z).stateStack, I.name, L.name);
	return setLastGrammarStateToMap(B.tokens, V), B.tokens;
}
function _tokenizeWithTheme(s, I, L, R, z) {
	let B = resolveColorReplacements(L, z), { tokenizeMaxLineLength: V = 0, tokenizeTimeLimit: H = 500 } = z, U = splitLines(s), W = z.grammarState ? getGrammarStack(z.grammarState, L.name) ?? INITIAL : z.grammarContextCode == null ? INITIAL : _tokenizeWithTheme(z.grammarContextCode, I, L, R, {
		...z,
		grammarState: void 0,
		grammarContextCode: void 0
	}).stateStack, G = [], K = [];
	for (let s = 0, q = U.length; s < q; s++) {
		let [q, J] = U[s];
		if (q === "") {
			G = [], K.push([]);
			continue;
		}
		if (V > 0 && q.length >= V) {
			G = [], K.push([{
				content: q,
				offset: J,
				color: "",
				fontStyle: 0
			}]);
			continue;
		}
		let Y, X, Z;
		z.includeExplanation && (Y = I.tokenizeLine(q, W), X = Y.tokens, Z = 0);
		let Q = I.tokenizeLine2(q, W, H), $ = Q.tokens.length / 2;
		for (let s = 0; s < $; s++) {
			let I = Q.tokens[2 * s], V = s + 1 < $ ? Q.tokens[2 * s + 2] : q.length;
			if (I === V) continue;
			let H = Q.tokens[2 * s + 1], U = applyColorReplacements(R[EncodedTokenMetadata.getForeground(H)], B), W = EncodedTokenMetadata.getFontStyle(H), K = {
				content: q.substring(I, V),
				offset: J + I,
				color: U,
				fontStyle: W
			};
			if (z.includeExplanation) {
				let s = [];
				if (z.includeExplanation !== "scopeName") for (let I of L.settings) {
					let L;
					switch (typeof I.scope) {
						case "string":
							L = I.scope.split(/,/).map((s) => s.trim());
							break;
						case "object":
							L = I.scope;
							break;
						default: continue;
					}
					s.push({
						settings: I,
						selectors: L.map((s) => s.split(/ /))
					});
				}
				K.explanation = [];
				let R = 0;
				for (; I + R < V;) {
					let I = X[Z], L = q.substring(I.startIndex, I.endIndex);
					R += L.length, K.explanation.push({
						content: L,
						scopes: z.includeExplanation === "scopeName" ? explainThemeScopesNameOnly(I.scopes) : explainThemeScopesFull(s, I.scopes)
					}), Z += 1;
				}
			}
			G.push(K);
		}
		K.push(G), G = [], W = Q.ruleStack;
	}
	return {
		tokens: K,
		stateStack: W
	};
}
function explainThemeScopesNameOnly(s) {
	return s.map((s) => ({ scopeName: s }));
}
function explainThemeScopesFull(s, I) {
	let L = [];
	for (let R = 0, z = I.length; R < z; R++) {
		let z = I[R];
		L[R] = {
			scopeName: z,
			themeMatches: explainThemeScope(s, z, I.slice(0, R))
		};
	}
	return L;
}
function matchesOne(s, I) {
	return s === I || I.substring(0, s.length) === s && I[s.length] === ".";
}
function matches(s, I, L) {
	if (!matchesOne(s[s.length - 1], I)) return !1;
	let R = s.length - 2, z = L.length - 1;
	for (; R >= 0 && z >= 0;) matchesOne(s[R], L[z]) && --R, --z;
	return R === -1;
}
function explainThemeScope(s, I, L) {
	let R = [];
	for (let { selectors: z, settings: B } of s) for (let s of z) if (matches(s, I, L)) {
		R.push(B);
		break;
	}
	return R;
}
function codeToTokensWithThemes$1(s, I, L) {
	let R = Object.entries(L.themes).filter((s) => s[1]).map((s) => ({
		color: s[0],
		theme: s[1]
	})), z = R.map((R) => {
		let z = codeToTokensBase$1(s, I, {
			...L,
			theme: R.theme
		});
		return {
			tokens: z,
			state: getLastGrammarStateFromMap(z),
			theme: typeof R.theme == "string" ? R.theme : R.theme.name
		};
	}), B = syncThemesTokenization(...z.map((s) => s.tokens)), V = B[0].map((s, I) => s.map((s, z) => {
		let V = {
			content: s.content,
			variants: {},
			offset: s.offset
		};
		return "includeExplanation" in L && L.includeExplanation && (V.explanation = s.explanation), B.forEach((s, L) => {
			let { content: B, explanation: H, offset: U, ...W } = s[I][z];
			V.variants[R[L].color] = W;
		}), V;
	})), H = z[0].state ? new GrammarState(Object.fromEntries(z.map((s) => [s.theme, s.state?.getInternalStack(s.theme)])), z[0].state.lang) : void 0;
	return H && setLastGrammarStateToMap(V, H), V;
}
function syncThemesTokenization(...s) {
	let I = s.map(() => []), L = s.length;
	for (let R = 0; R < s[0].length; R++) {
		let z = s.map((s) => s[R]), B = I.map(() => []);
		I.forEach((s, I) => s.push(B[I]));
		let V = z.map(() => 0), H = z.map((s) => s[0]);
		for (; H.every((s) => s);) {
			let s = Math.min(...H.map((s) => s.content.length));
			for (let I = 0; I < L; I++) {
				let L = H[I];
				L.content.length === s ? (B[I].push(L), V[I] += 1, H[I] = z[I][V[I]]) : (B[I].push({
					...L,
					content: L.content.slice(0, s)
				}), H[I] = {
					...L,
					content: L.content.slice(s),
					offset: L.offset + s
				});
			}
		}
	}
	return I;
}
function codeToTokens$1(s, I, L) {
	let R, z, B, V, H, U;
	if ("themes" in L) {
		let { defaultColor: W = "light", cssVariablePrefix: G = "--shiki-" } = L, K = Object.entries(L.themes).filter((s) => s[1]).map((s) => ({
			color: s[0],
			theme: s[1]
		})).sort((s, I) => s.color === W ? -1 : I.color === W ? 1 : 0);
		if (K.length === 0) throw new ShikiError("`themes` option must not be empty");
		let q = codeToTokensWithThemes$1(s, I, L);
		if (U = getLastGrammarStateFromMap(q), W && !K.find((s) => s.color === W)) throw new ShikiError(`\`themes\` option must contain the defaultColor key \`${W}\``);
		let J = K.map((I) => s.getTheme(I.theme)), X = K.map((s) => s.color);
		B = q.map((s) => s.map((s) => mergeToken(s, X, G, W))), U && setLastGrammarStateToMap(B, U);
		let Z = K.map((s) => resolveColorReplacements(s.theme, L));
		z = K.map((s, I) => (I === 0 && W ? "" : `${G + s.color}:`) + (applyColorReplacements(J[I].fg, Z[I]) || "inherit")).join(";"), R = K.map((s, I) => (I === 0 && W ? "" : `${G + s.color}-bg:`) + (applyColorReplacements(J[I].bg, Z[I]) || "inherit")).join(";"), V = `shiki-themes ${J.map((s) => s.name).join(" ")}`, H = W ? void 0 : [z, R].join(";");
	} else if ("theme" in L) {
		let H = resolveColorReplacements(L.theme, L);
		B = codeToTokensBase$1(s, I, L);
		let W = s.getTheme(L.theme);
		R = applyColorReplacements(W.bg, H), z = applyColorReplacements(W.fg, H), V = W.name, U = getLastGrammarStateFromMap(B);
	} else throw new ShikiError("Invalid options, either `theme` or `themes` must be provided");
	return {
		tokens: B,
		fg: z,
		bg: R,
		themeName: V,
		rootStyle: H,
		grammarState: U
	};
}
function mergeToken(s, I, L, R) {
	let z = {
		content: s.content,
		explanation: s.explanation,
		offset: s.offset
	}, B = I.map((I) => getTokenStyleObject(s.variants[I])), V = new Set(B.flatMap((s) => Object.keys(s))), H = {};
	return B.forEach((s, z) => {
		for (let B of V) {
			let V = s[B] || "inherit";
			if (z === 0 && R) H[B] = V;
			else {
				let s = B === "color" ? "" : B === "background-color" ? "-bg" : `-${B}`, R = L + I[z] + (B === "color" ? "" : s);
				H[R] = V;
			}
		}
	}), z.htmlStyle = H, z;
}
function codeToHast$1(s, I, L, R = {
	meta: {},
	options: L,
	codeToHast: (I, L) => codeToHast$1(s, I, L),
	codeToTokens: (I, L) => codeToTokens$1(s, I, L)
}) {
	let z = I;
	for (let s of getTransformers(L)) z = s.preprocess?.call(R, z, L) || z;
	let { tokens: B, fg: V, bg: H, themeName: U, rootStyle: W, grammarState: G } = codeToTokens$1(s, z, L), { mergeWhitespaces: K = !0 } = L;
	K === !0 ? B = mergeWhitespaceTokens(B) : K === "never" && (B = splitWhitespaceTokens(B));
	let q = {
		...R,
		get source() {
			return z;
		}
	};
	for (let s of getTransformers(L)) B = s.tokens?.call(q, B) || B;
	return tokensToHast(B, {
		...L,
		fg: V,
		bg: H,
		themeName: U,
		rootStyle: W
	}, q, G);
}
function tokensToHast(s, I, L, R = getLastGrammarStateFromMap(s)) {
	let z = getTransformers(I), B = [], V = {
		type: "root",
		children: []
	}, { structure: H = "classic", tabindex: U = "0" } = I, W = {
		type: "element",
		tagName: "pre",
		properties: {
			class: `shiki ${I.themeName || ""}`,
			style: I.rootStyle || `background-color:${I.bg};color:${I.fg}`,
			...U !== !1 && U != null ? { tabindex: U.toString() } : {},
			...Object.fromEntries(Array.from(Object.entries(I.meta || {})).filter(([s]) => !s.startsWith("_")))
		},
		children: []
	}, G = {
		type: "element",
		tagName: "code",
		properties: {},
		children: B
	}, K = [], q = {
		...L,
		structure: H,
		addClassToHast,
		get source() {
			return L.source;
		},
		get tokens() {
			return s;
		},
		get options() {
			return I;
		},
		get root() {
			return V;
		},
		get pre() {
			return W;
		},
		get code() {
			return G;
		},
		get lines() {
			return K;
		}
	};
	if (s.forEach((s, I) => {
		I && (H === "inline" ? V.children.push({
			type: "element",
			tagName: "br",
			properties: {},
			children: []
		}) : H === "classic" && B.push({
			type: "text",
			value: "\n"
		}));
		let L = {
			type: "element",
			tagName: "span",
			properties: { class: "line" },
			children: []
		}, R = 0;
		for (let B of s) {
			let s = {
				type: "element",
				tagName: "span",
				properties: { ...B.htmlAttrs },
				children: [{
					type: "text",
					value: B.content
				}]
			};
			typeof B.htmlStyle == "string" && warnDeprecated("`htmlStyle` as a string is deprecated. Use an object instead.");
			let U = stringifyTokenStyle(B.htmlStyle || getTokenStyleObject(B));
			U && (s.properties.style = U);
			for (let V of z) s = V?.span?.call(q, s, I + 1, R, L, B) || s;
			H === "inline" ? V.children.push(s) : H === "classic" && L.children.push(s), R += B.content.length;
		}
		if (H === "classic") {
			for (let s of z) L = s?.line?.call(q, L, I + 1) || L;
			K.push(L), B.push(L);
		}
	}), H === "classic") {
		for (let s of z) G = s?.code?.call(q, G) || G;
		W.children.push(G);
		for (let s of z) W = s?.pre?.call(q, W) || W;
		V.children.push(W);
	}
	let J = V;
	for (let s of z) J = s?.root?.call(q, J) || J;
	return R && setLastGrammarStateToMap(J, R), J;
}
function mergeWhitespaceTokens(s) {
	return s.map((s) => {
		let I = [], L = "", R = 0;
		return s.forEach((z, B) => {
			let V = !(z.fontStyle && z.fontStyle & FontStyle.Underline);
			V && z.content.match(/^\s+$/) && s[B + 1] ? (R ||= z.offset, L += z.content) : L ? (V ? I.push({
				...z,
				offset: R,
				content: L + z.content
			}) : I.push({
				content: L,
				offset: R
			}, z), R = 0, L = "") : I.push(z);
		}), I;
	});
}
function splitWhitespaceTokens(s) {
	return s.map((s) => s.flatMap((s) => {
		if (s.content.match(/^\s+$/)) return s;
		let I = s.content.match(/^(\s*)(.*?)(\s*)$/);
		if (!I) return s;
		let [, L, R, z] = I;
		if (!L && !z) return s;
		let B = [{
			...s,
			offset: s.offset + L.length,
			content: R
		}];
		return L && B.unshift({
			content: L,
			offset: s.offset
		}), z && B.push({
			content: z,
			offset: s.offset + L.length + R.length
		}), B;
	}));
}
function codeToHtml$1(s, I, L) {
	let R = {
		meta: {},
		options: L,
		codeToHast: (I, L) => codeToHast$1(s, I, L),
		codeToTokens: (I, L) => codeToTokens$1(s, I, L)
	}, z = toHtml(codeToHast$1(s, I, L, R));
	for (let s of getTransformers(L)) z = s.postprocess?.call(R, z, L) || z;
	return z;
}
var VSCODE_FALLBACK_EDITOR_FG = {
	light: "#333333",
	dark: "#bbbbbb"
}, VSCODE_FALLBACK_EDITOR_BG = {
	light: "#fffffe",
	dark: "#1e1e1e"
}, RESOLVED_KEY = "__shiki_resolved";
function normalizeTheme(s) {
	if (s?.[RESOLVED_KEY]) return s;
	let I = { ...s };
	I.tokenColors && !I.settings && (I.settings = I.tokenColors, delete I.tokenColors), I.type ||= "dark", I.colorReplacements = { ...I.colorReplacements }, I.settings ||= [];
	let { bg: L, fg: R } = I;
	if (!L || !R) {
		let s = I.settings ? I.settings.find((s) => !s.name && !s.scope) : void 0;
		s?.settings?.foreground && (R = s.settings.foreground), s?.settings?.background && (L = s.settings.background), !R && I?.colors?.["editor.foreground"] && (R = I.colors["editor.foreground"]), !L && I?.colors?.["editor.background"] && (L = I.colors["editor.background"]), R ||= I.type === "light" ? VSCODE_FALLBACK_EDITOR_FG.light : VSCODE_FALLBACK_EDITOR_FG.dark, L ||= I.type === "light" ? VSCODE_FALLBACK_EDITOR_BG.light : VSCODE_FALLBACK_EDITOR_BG.dark, I.fg = R, I.bg = L;
	}
	I.settings[0] && I.settings[0].settings && !I.settings[0].scope || I.settings.unshift({ settings: {
		foreground: I.fg,
		background: I.bg
	} });
	let z = 0, B = /* @__PURE__ */ new Map();
	function V(s) {
		if (B.has(s)) return B.get(s);
		z += 1;
		let L = `#${z.toString(16).padStart(8, "0").toLowerCase()}`;
		return I.colorReplacements?.[`#${L}`] ? V(s) : (B.set(s, L), L);
	}
	I.settings = I.settings.map((s) => {
		let L = s.settings?.foreground && !s.settings.foreground.startsWith("#"), R = s.settings?.background && !s.settings.background.startsWith("#");
		if (!L && !R) return s;
		let z = {
			...s,
			settings: { ...s.settings }
		};
		if (L) {
			let L = V(s.settings.foreground);
			I.colorReplacements[L] = s.settings.foreground, z.settings.foreground = L;
		}
		if (R) {
			let L = V(s.settings.background);
			I.colorReplacements[L] = s.settings.background, z.settings.background = L;
		}
		return z;
	});
	for (let s of Object.keys(I.colors || {})) if ((s === "editor.foreground" || s === "editor.background" || s.startsWith("terminal.ansi")) && !I.colors[s]?.startsWith("#")) {
		let L = V(I.colors[s]);
		I.colorReplacements[L] = I.colors[s], I.colors[s] = L;
	}
	return Object.defineProperty(I, RESOLVED_KEY, {
		enumerable: !1,
		writable: !1,
		value: !0
	}), I;
}
async function resolveLangs(s) {
	return Array.from(new Set((await Promise.all(s.filter((s) => !isSpecialLang(s)).map(async (s) => await normalizeGetter(s).then((s) => Array.isArray(s) ? s : [s])))).flat()));
}
async function resolveThemes(s) {
	return (await Promise.all(s.map(async (s) => isSpecialTheme(s) ? null : normalizeTheme(await normalizeGetter(s))))).filter((s) => !!s);
}
var Registry$1 = class extends Registry {
	constructor(s, I, L, R = {}) {
		super(s), this._resolver = s, this._themes = I, this._langs = L, this._alias = R, this._themes.map((s) => this.loadTheme(s)), this.loadLanguages(this._langs);
	}
	_resolvedThemes = /* @__PURE__ */ new Map();
	_resolvedGrammars = /* @__PURE__ */ new Map();
	_langMap = /* @__PURE__ */ new Map();
	_langGraph = /* @__PURE__ */ new Map();
	_textmateThemeCache = /* @__PURE__ */ new WeakMap();
	_loadedThemesCache = null;
	_loadedLanguagesCache = null;
	getTheme(s) {
		return typeof s == "string" ? this._resolvedThemes.get(s) : this.loadTheme(s);
	}
	loadTheme(s) {
		let I = normalizeTheme(s);
		return I.name && (this._resolvedThemes.set(I.name, I), this._loadedThemesCache = null), I;
	}
	getLoadedThemes() {
		return this._loadedThemesCache ||= [...this._resolvedThemes.keys()], this._loadedThemesCache;
	}
	setTheme(s) {
		let I = this._textmateThemeCache.get(s);
		I || (I = Theme.createFromRawTheme(s), this._textmateThemeCache.set(s, I)), this._syncRegistry.setTheme(I);
	}
	getGrammar(s) {
		if (this._alias[s]) {
			let I = /* @__PURE__ */ new Set([s]);
			for (; this._alias[s];) {
				if (s = this._alias[s], I.has(s)) throw new ShikiError$1(`Circular alias \`${Array.from(I).join(" -> ")} -> ${s}\``);
				I.add(s);
			}
		}
		return this._resolvedGrammars.get(s);
	}
	loadLanguage(s) {
		if (this.getGrammar(s.name)) return;
		let I = new Set([...this._langMap.values()].filter((I) => I.embeddedLangsLazy?.includes(s.name)));
		this._resolver.addLanguage(s);
		let L = {
			balancedBracketSelectors: s.balancedBracketSelectors || ["*"],
			unbalancedBracketSelectors: s.unbalancedBracketSelectors || []
		};
		this._syncRegistry._rawGrammars.set(s.scopeName, s);
		let R = this.loadGrammarWithConfiguration(s.scopeName, 1, L);
		if (R.name = s.name, this._resolvedGrammars.set(s.name, R), s.aliases && s.aliases.forEach((I) => {
			this._alias[I] = s.name;
		}), this._loadedLanguagesCache = null, I.size) for (let s of I) this._resolvedGrammars.delete(s.name), this._loadedLanguagesCache = null, this._syncRegistry?._injectionGrammars?.delete(s.scopeName), this._syncRegistry?._grammars?.delete(s.scopeName), this.loadLanguage(this._langMap.get(s.name));
	}
	dispose() {
		super.dispose(), this._resolvedThemes.clear(), this._resolvedGrammars.clear(), this._langMap.clear(), this._langGraph.clear(), this._loadedThemesCache = null;
	}
	loadLanguages(s) {
		for (let I of s) this.resolveEmbeddedLanguages(I);
		let I = Array.from(this._langGraph.entries()), L = I.filter(([s, I]) => !I);
		if (L.length) {
			let s = I.filter(([s, I]) => I && I.embeddedLangs?.some((s) => L.map(([s]) => s).includes(s))).filter((s) => !L.includes(s));
			throw new ShikiError$1(`Missing languages ${L.map(([s]) => `\`${s}\``).join(", ")}, required by ${s.map(([s]) => `\`${s}\``).join(", ")}`);
		}
		for (let [s, L] of I) this._resolver.addLanguage(L);
		for (let [s, L] of I) this.loadLanguage(L);
	}
	getLoadedLanguages() {
		return this._loadedLanguagesCache ||= [.../* @__PURE__ */ new Set([...this._resolvedGrammars.keys(), ...Object.keys(this._alias)])], this._loadedLanguagesCache;
	}
	resolveEmbeddedLanguages(s) {
		if (this._langMap.set(s.name, s), this._langGraph.set(s.name, s), s.embeddedLangs) for (let I of s.embeddedLangs) this._langGraph.set(I, this._langMap.get(I));
	}
}, Resolver = class {
	_langs = /* @__PURE__ */ new Map();
	_scopeToLang = /* @__PURE__ */ new Map();
	_injections = /* @__PURE__ */ new Map();
	_onigLib;
	constructor(s, I) {
		this._onigLib = {
			createOnigScanner: (I) => s.createScanner(I),
			createOnigString: (I) => s.createString(I)
		}, I.forEach((s) => this.addLanguage(s));
	}
	get onigLib() {
		return this._onigLib;
	}
	getLangRegistration(s) {
		return this._langs.get(s);
	}
	loadGrammar(s) {
		return this._scopeToLang.get(s);
	}
	addLanguage(s) {
		this._langs.set(s.name, s), s.aliases && s.aliases.forEach((I) => {
			this._langs.set(I, s);
		}), this._scopeToLang.set(s.scopeName, s), s.injectTo && s.injectTo.forEach((I) => {
			this._injections.get(I) || this._injections.set(I, []), this._injections.get(I).push(s.scopeName);
		});
	}
	getInjections(s) {
		let I = s.split("."), L = [];
		for (let s = 1; s <= I.length; s++) {
			let R = I.slice(0, s).join(".");
			L = [...L, ...this._injections.get(R) || []];
		}
		return L;
	}
}, instancesCount = 0;
function createShikiInternalSync(s) {
	instancesCount += 1, s.warnings !== !1 && instancesCount >= 10 && instancesCount % 10 == 0 && console.warn(`[Shiki] ${instancesCount} instances have been created. Shiki is supposed to be used as a singleton, consider refactoring your code to cache your highlighter instance; Or call \`highlighter.dispose()\` to release unused instances.`);
	let I = !1;
	if (!s.engine) throw new ShikiError$1("`engine` option is required for synchronous mode");
	let L = (s.langs || []).flat(1), R = (s.themes || []).flat(1).map(normalizeTheme), z = new Registry$1(new Resolver(s.engine, L), R, L, s.langAlias), B;
	function V(s) {
		X();
		let I = z.getGrammar(typeof s == "string" ? s : s.name);
		if (!I) throw new ShikiError$1(`Language \`${s}\` not found, you may need to load it first`);
		return I;
	}
	function H(s) {
		if (s === "none") return {
			bg: "",
			fg: "",
			name: "none",
			settings: [],
			type: "dark"
		};
		X();
		let I = z.getTheme(s);
		if (!I) throw new ShikiError$1(`Theme \`${s}\` not found, you may need to load it first`);
		return I;
	}
	function U(s) {
		X();
		let I = H(s);
		return B !== s && (z.setTheme(I), B = s), {
			theme: I,
			colorMap: z.getColorMap()
		};
	}
	function W() {
		return X(), z.getLoadedThemes();
	}
	function G() {
		return X(), z.getLoadedLanguages();
	}
	function K(...s) {
		X(), z.loadLanguages(s.flat(1));
	}
	async function q(...s) {
		return K(await resolveLangs(s));
	}
	function J(...s) {
		X();
		for (let I of s.flat(1)) z.loadTheme(I);
	}
	async function Y(...s) {
		return X(), J(await resolveThemes(s));
	}
	function X() {
		if (I) throw new ShikiError$1("Shiki instance has been disposed");
	}
	function Z() {
		I || (I = !0, z.dispose(), --instancesCount);
	}
	return {
		setTheme: U,
		getTheme: H,
		getLanguage: V,
		getLoadedThemes: W,
		getLoadedLanguages: G,
		loadLanguage: q,
		loadLanguageSync: K,
		loadTheme: Y,
		loadThemeSync: J,
		dispose: Z,
		[Symbol.dispose]: Z
	};
}
async function createShikiInternal(s = {}) {
	s.loadWasm && warnDeprecated("`loadWasm` option is deprecated. Use `engine: createOnigurumaEngine(loadWasm)` instead.");
	let [I, L, R] = await Promise.all([
		resolveThemes(s.themes || []),
		resolveLangs(s.langs || []),
		s.engine || createOnigurumaEngine(s.loadWasm || getDefaultWasmLoader())
	]);
	return createShikiInternalSync({
		...s,
		loadWasm: void 0,
		themes: I,
		langs: L,
		engine: R
	});
}
async function createHighlighterCore(s = {}) {
	let I = await createShikiInternal(s);
	return {
		getLastGrammarState: (...s) => getLastGrammarState$1(I, ...s),
		codeToTokensBase: (s, L) => codeToTokensBase$1(I, s, L),
		codeToTokensWithThemes: (s, L) => codeToTokensWithThemes$1(I, s, L),
		codeToTokens: (s, L) => codeToTokens$1(I, s, L),
		codeToHast: (s, L) => codeToHast$1(I, s, L),
		codeToHtml: (s, L) => codeToHtml$1(I, s, L),
		...I,
		getInternalContext: () => I
	};
}
function createdBundledHighlighter(s, I, L) {
	let R, z, B;
	if (I) warnDeprecated("`createdBundledHighlighter` signature with `bundledLanguages` and `bundledThemes` is deprecated. Use the options object signature instead."), R = s, z = I, B = () => createOnigurumaEngine$1(L);
	else {
		let I = s;
		R = I.langs, z = I.themes, B = I.engine;
	}
	async function V(s) {
		function I(s) {
			if (typeof s == "string") {
				if (isSpecialLang(s)) return [];
				let I = R[s];
				if (!I) throw new ShikiError(`Language \`${s}\` is not included in this bundle. You may want to load it from external source.`);
				return I;
			}
			return s;
		}
		function L(s) {
			if (isSpecialTheme(s)) return "none";
			if (typeof s == "string") {
				let I = z[s];
				if (!I) throw new ShikiError(`Theme \`${s}\` is not included in this bundle. You may want to load it from external source.`);
				return I;
			}
			return s;
		}
		let V = (s.themes ?? []).map((s) => L(s)), H = (s.langs ?? []).map((s) => I(s)), U = await createHighlighterCore({
			engine: s.engine ?? B(),
			...s,
			themes: V,
			langs: H
		});
		return {
			...U,
			loadLanguage(...s) {
				return U.loadLanguage(...s.map(I));
			},
			loadTheme(...s) {
				return U.loadTheme(...s.map(L));
			}
		};
	}
	return V;
}
function makeSingletonHighlighter(s) {
	let I;
	async function L(L = {}) {
		if (I) {
			let s = await I;
			return await Promise.all([s.loadTheme(...L.themes || []), s.loadLanguage(...L.langs || [])]), s;
		} else return I = s({
			...L,
			themes: L.themes || [],
			langs: L.langs || []
		}), I;
	}
	return L;
}
function createSingletonShorthands(s) {
	let I = makeSingletonHighlighter(s);
	return {
		getSingletonHighlighter(s) {
			return I(s);
		},
		async codeToHtml(s, L) {
			return (await I({
				langs: [L.lang],
				themes: "theme" in L ? [L.theme] : Object.values(L.themes)
			})).codeToHtml(s, L);
		},
		async codeToHast(s, L) {
			return (await I({
				langs: [L.lang],
				themes: "theme" in L ? [L.theme] : Object.values(L.themes)
			})).codeToHast(s, L);
		},
		async codeToTokens(s, L) {
			return (await I({
				langs: [L.lang],
				themes: "theme" in L ? [L.theme] : Object.values(L.themes)
			})).codeToTokens(s, L);
		},
		async codeToTokensBase(s, L) {
			return (await I({
				langs: [L.lang],
				themes: [L.theme]
			})).codeToTokensBase(s, L);
		},
		async codeToTokensWithThemes(s, L) {
			return (await I({
				langs: [L.lang],
				themes: Object.values(L.themes).filter(Boolean)
			})).codeToTokensWithThemes(s, L);
		},
		async getLastGrammarState(s, L) {
			return (await I({
				langs: [L.lang],
				themes: [L.theme]
			})).getLastGrammarState(s, L);
		}
	};
}
var { codeToHtml, codeToHast, codeToTokens, codeToTokensBase, codeToTokensWithThemes, getSingletonHighlighter, getLastGrammarState } = /* @__PURE__ */ createSingletonShorthands(/* @__PURE__ */ createdBundledHighlighter({
	langs: bundledLanguages,
	themes: bundledThemes,
	engine: () => createOnigurumaEngine(import("./wasm-M_x5rTwZ.js"))
}));
export { bundledLanguages, codeToTokens };
