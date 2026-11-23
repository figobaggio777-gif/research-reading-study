import {createHash} from "node:crypto";
import {copyFile, mkdir, readFile, writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const placeholder = "https://study-backend.invalid";
const publicDir = resolve(process.argv[2] || "_site");
const templates = new URL("../templates/", import.meta.url);
let apiOrigin;
if (process.env.STUDY_API_ORIGIN) {
  const parsed = new URL(process.env.STUDY_API_ORIGIN);
  if (parsed.protocol !== "https:" || parsed.href !== parsed.origin + "/" || parsed.origin === placeholder) {
    throw new Error("STUDY_API_ORIGIN must be the HTTPS service origin without credentials, path, query or fragment.");
  }
  apiOrigin = parsed.origin;
}

const pending = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>科研文献判断</title></head><body><main><h1>答题服务准备中</h1><p>研究团队正在连接答题服务，请稍后再打开本链接。</p></main></body></html>';

async function buildStudent() {
  if (!apiOrigin) return pending;
  const source = await readFile(new URL("student.html", templates), "utf8");
  if (!source.includes(placeholder)) throw new Error("Student API origin placeholder missing.");
  const html = source.replaceAll(placeholder, apiOrigin);
  const scripts = [...html.matchAll(/<script>([\s\S]+?)<\/script>/g)].map(match =>
    "'sha256-" + createHash("sha256").update(match[1].replace(/\r\n?/g, "\n")).digest("base64") + "'"
  );
  if (!scripts.length) throw new Error("Missing student page script.");
  const policy = `default-src 'none'; script-src ${scripts.join(" ")}; style-src 'unsafe-inline'; connect-src ${apiOrigin}; form-action 'none'; base-uri 'none'; object-src 'none'`;
  const meta = `<meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="${policy}">`;
  return html.replace("<head>", "<head>" + meta);
}

function buildAdminRedirect() {
  if (!apiOrigin) return pending;
  const admin = new URL("/admin", apiOrigin).href;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${admin}"><title>研究者后台</title></head><body><main><a href="${admin}">打开研究者后台</a></main></body></html>`;
}

await Promise.all([
  mkdir(resolve(publicDir, "admin"), {recursive: true}),
  mkdir(resolve(publicDir, "practice"), {recursive: true}),
]);
await Promise.all([
  writeFile(resolve(publicDir, "index.html"), await buildStudent()),
  writeFile(resolve(publicDir, "admin/index.html"), buildAdminRedirect()),
  copyFile(new URL("practice.html", templates), resolve(publicDir, "practice/index.html")),
  writeFile(resolve(publicDir, ".nojekyll"), ""),
]);
if (!apiOrigin) console.log("Setup page generated. Set STUDY_API_ORIGIN and rerun Publish study pages to enable collection.");
