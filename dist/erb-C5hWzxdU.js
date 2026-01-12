import "./javascript-FJ2IdPhN.js";
import "./css-DWoH0PdD.js";
import { t as html_default } from "./html-B3XIqpFt.js";
import "./java-D1kq62sL.js";
import "./xml-Dh1vhGFf.js";
import "./typescript-08H2X900.js";
import "./sql-CwFiBx88.js";
import "./c-Ba72xrAt.js";
import "./regexp-DZDlNmFB.js";
import "./glsl-BnKVx61d.js";
import "./cpp-k2p3p0Jl.js";
import "./shellscript-CxMcJ_xn.js";
import "./haml-Cr0FXL7K.js";
import "./jsx-Ci_MiMoH.js";
import "./tsx-bg9QWUue.js";
import "./graphql-CgOwtcdR.js";
import "./lua-BSRwm8iw.js";
import "./yaml-BNJHSu2S.js";
import { t as ruby_default } from "./ruby-wI5mJG2q.js";
var lang = Object.freeze(JSON.parse("{\"displayName\":\"ERB\",\"fileTypes\":[\"erb\",\"rhtml\",\"html.erb\"],\"injections\":{\"text.html.erb - (meta.embedded.block.erb | meta.embedded.line.erb | comment)\":{\"patterns\":[{\"begin\":\"(^\\\\s*)(?=<%+#(?![^%]*%>))\",\"beginCaptures\":{\"0\":{\"name\":\"punctuation.whitespace.comment.leading.erb\"}},\"end\":\"(?!\\\\G)(\\\\s*$\\\\n)?\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.whitespace.comment.trailing.erb\"}},\"patterns\":[{\"include\":\"#comment\"}]},{\"begin\":\"(^\\\\s*)(?=<%(?![^%]*%>))\",\"beginCaptures\":{\"0\":{\"name\":\"punctuation.whitespace.embedded.leading.erb\"}},\"end\":\"(?!\\\\G)(\\\\s*$\\\\n)?\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.whitespace.embedded.trailing.erb\"}},\"patterns\":[{\"include\":\"#tags\"}]},{\"include\":\"#comment\"},{\"include\":\"#tags\"}]}},\"name\":\"erb\",\"patterns\":[{\"include\":\"text.html.basic\"}],\"repository\":{\"comment\":{\"patterns\":[{\"begin\":\"<%+#\",\"beginCaptures\":{\"0\":{\"name\":\"punctuation.definition.comment.begin.erb\"}},\"end\":\"%>\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.definition.comment.end.erb\"}},\"name\":\"comment.block.erb\"}]},\"tags\":{\"patterns\":[{\"begin\":\"<%+(?!>)[-=]?(?![^%]*%>)\",\"beginCaptures\":{\"0\":{\"name\":\"punctuation.section.embedded.begin.erb\"}},\"contentName\":\"source.ruby\",\"end\":\"(-?%)>\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.section.embedded.end.erb\"},\"1\":{\"name\":\"source.ruby\"}},\"name\":\"meta.embedded.block.erb\",\"patterns\":[{\"captures\":{\"1\":{\"name\":\"punctuation.definition.comment.erb\"}},\"match\":\"(#).*?(?=-?%>)\",\"name\":\"comment.line.number-sign.erb\"},{\"include\":\"source.ruby\"}]},{\"begin\":\"<%+(?!>)[-=]?\",\"beginCaptures\":{\"0\":{\"name\":\"punctuation.section.embedded.begin.erb\"}},\"contentName\":\"source.ruby\",\"end\":\"(-?%)>\",\"endCaptures\":{\"0\":{\"name\":\"punctuation.section.embedded.end.erb\"},\"1\":{\"name\":\"source.ruby\"}},\"name\":\"meta.embedded.line.erb\",\"patterns\":[{\"captures\":{\"1\":{\"name\":\"punctuation.definition.comment.erb\"}},\"match\":\"(#).*?(?=-?%>)\",\"name\":\"comment.line.number-sign.erb\"},{\"include\":\"source.ruby\"}]}]}},\"scopeName\":\"text.html.erb\",\"embeddedLangs\":[\"html\",\"ruby\"]}")), erb_default = [
	...html_default,
	...ruby_default,
	lang
];
export { erb_default as default };
