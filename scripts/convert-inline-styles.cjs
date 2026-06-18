/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const targetFile = path.resolve("e:/origami/Teach_Frontend/app/formations/page.tsx");
const cssFile = path.resolve("e:/origami/Teach_Frontend/app/formations/page.inline-styles.css");

const source = fs.readFileSync(targetFile, "utf8");
const sf = ts.createSourceFile(targetFile, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const unitlessProps = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
]);

function camelToKebab(prop) {
  return prop
    .replace(/^ms/, "-ms")
    .replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
    .toLowerCase();
}

function getPropertyName(name) {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name)) return name.text;
  return null;
}

function getLiteralValue(expr) {
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    return { ok: true, type: "string", value: expr.text };
  }
  if (ts.isNumericLiteral(expr)) {
    return { ok: true, type: "number", value: Number(expr.text) };
  }
  if (expr.kind === ts.SyntaxKind.TrueKeyword) {
    return { ok: true, type: "boolean", value: true };
  }
  if (expr.kind === ts.SyntaxKind.FalseKeyword) {
    return { ok: true, type: "boolean", value: false };
  }
  if (ts.isPrefixUnaryExpression(expr) && expr.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(expr.operand)) {
    return { ok: true, type: "number", value: -Number(expr.operand.text) };
  }
  return { ok: false };
}

function toCssValue(prop, literal) {
  if (literal.type === "string") return literal.value;
  if (literal.type === "boolean") return literal.value ? "1" : "0";
  if (literal.type === "number") {
    if (literal.value === 0) return "0";
    if (unitlessProps.has(prop)) return String(literal.value);
    return `${literal.value}px`;
  }
  return null;
}

const edits = [];
const classBySignature = new Map();
const declarationsByClass = new Map();
let classCounter = 1;
let converted = 0;
let skipped = 0;

function walk(node) {
  if (ts.isJsxAttribute(node) && node.name && node.name.text === "style") {
    const init = node.initializer;
    if (!init || !ts.isJsxExpression(init) || !init.expression || !ts.isObjectLiteralExpression(init.expression)) {
      skipped += 1;
      return;
    }

    const obj = init.expression;
    const decls = [];
    let supported = true;

    for (const prop of obj.properties) {
      if (!ts.isPropertyAssignment(prop)) {
        supported = false;
        break;
      }

      const propName = getPropertyName(prop.name);
      if (!propName) {
        supported = false;
        break;
      }

      const lit = getLiteralValue(prop.initializer);
      if (!lit.ok) {
        supported = false;
        break;
      }

      const cssName = camelToKebab(propName);
      const cssValue = toCssValue(propName, lit);
      if (cssValue == null) {
        supported = false;
        break;
      }

      decls.push(`${cssName}: ${cssValue};`);
    }

    if (!supported || decls.length === 0) {
      skipped += 1;
      return;
    }

    const signature = decls.join(" ");
    let cls = classBySignature.get(signature);
    if (!cls) {
      cls = `sx-${classCounter++}`;
      classBySignature.set(signature, cls);
      declarationsByClass.set(cls, decls);
    }

    edits.push({
      start: node.getStart(sf),
      end: node.getEnd(sf),
      replacement: `data-sx=\"${cls}\"`,
    });
    converted += 1;
    return;
  }

  ts.forEachChild(node, walk);
}

walk(sf);

let nextSource = source;
for (const edit of edits.sort((a, b) => b.start - a.start)) {
  nextSource = nextSource.slice(0, edit.start) + edit.replacement + nextSource.slice(edit.end);
}

if (!nextSource.includes("./page.inline-styles.css")) {
  nextSource = nextSource.replace(/^"use client";\s*/m, `"use client";\n\nimport "./page.inline-styles.css";\n`);
}

const cssLines = [
  "/* Auto-generated from inline styles in app/formations/page.tsx */",
  "",
];

for (const [cls, decls] of declarationsByClass.entries()) {
  cssLines.push(`[data-sx=\"${cls}\"] {`);
  for (const d of decls) {
    cssLines.push(`  ${d}`);
  }
  cssLines.push("}");
  cssLines.push("");
}

fs.writeFileSync(targetFile, nextSource, "utf8");
fs.writeFileSync(cssFile, cssLines.join("\n"), "utf8");

console.log(`converted=${converted}`);
console.log(`skipped=${skipped}`);
console.log(`cssRules=${declarationsByClass.size}`);
