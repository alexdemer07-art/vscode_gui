var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var os2 = __toESM(require("node:os"), 1);
var path4 = __toESM(require("node:path"), 1);

// src/server.ts
var import_node_http = require("node:http");
var import_node_crypto2 = require("node:crypto");
var os = __toESM(require("node:os"), 1);
var path2 = __toESM(require("node:path"), 1);

// ../browser-shared/src/protocol.ts
var import_node_crypto = require("node:crypto");
var import_node_net = require("node:net");
function isValidBridgeToken(expected, received) {
  const expectedBytes = Buffer.from(expected, "utf8");
  const receivedBytes = Buffer.from(received, "utf8");
  return expectedBytes.length === receivedBytes.length && (0, import_node_crypto.timingSafeEqual)(expectedBytes, receivedBytes);
}
function isLoopbackUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "ws:") && (url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "[::1]");
  } catch {
    return false;
  }
}
function isAllowedNavigationUrl(value, options = {}) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    if (url.username || url.password) {
      return false;
    }
    return options.allowPrivate === true || !isPrivateHostname(url.hostname);
  } catch {
    return false;
  }
}
var LOCAL_SUFFIXES = [".localhost", ".local", ".internal", ".lan", ".home.arpa"];
function isPrivateHostname(raw) {
  const host = raw.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (!host) {
    return true;
  }
  if (host === "localhost" || LOCAL_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return true;
  }
  const version = (0, import_node_net.isIP)(host);
  if (version === 4) {
    const [a, b] = host.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168;
  }
  if (version === 6) {
    if (host === "::" || host === "::1") {
      return true;
    }
    return /^f[cd][0-9a-f]{2}:/.test(host) || /^fe[89ab][0-9a-f]:/.test(host) || host.startsWith("::ffff:");
  }
  return false;
}

// src/chromium.ts
var import_node_child_process = require("node:child_process");
var fs = __toESM(require("node:fs"), 1);
var path = __toESM(require("node:path"), 1);
var import_playwright_core = require("playwright-core");
var SNAPSHOT_LIMIT = 2e4;
var SNAPSHOT_MAX = 2e5;
var REF_LIMIT = 80;
var EXTRACT_LIMIT = 2e4;
var INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  'input:not([type="hidden"])',
  "select",
  "textarea",
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="option"]',
  '[contenteditable="true"]'
].join(",");
function findBrowserExecutable(env = process.env, exists = fs.existsSync) {
  const explicit = env.OPENCODE_GUI_BROWSER_EXECUTABLE;
  if (explicit) return explicit;
  const candidates = process.platform === "win32" ? [
    env.ProgramFiles && path.join(env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
    env["ProgramFiles(x86)"] && path.join(env["ProgramFiles(x86)"], "Google", "Chrome", "Application", "chrome.exe"),
    env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
    env.ProgramFiles && path.join(env.ProgramFiles, "Microsoft", "Edge", "Application", "msedge.exe")
  ] : process.platform === "darwin" ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"] : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return candidates.find((candidate) => Boolean(candidate) && exists(candidate));
}
async function waitForDevToolsPort(file, timeoutMs = 1e4) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const port = Number(fs.readFileSync(file, "utf8").split(/\r?\n/, 1)[0]);
      if (Number.isInteger(port) && port > 0 && port < 65536) return port;
    } catch {
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Automation Chromium did not open its DevTools port in time");
}
function killProcessTree(child) {
  if (child.exitCode !== null || child.killed) return;
  if (process.platform === "win32" && child.pid) {
    try {
      (0, import_node_child_process.spawn)("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore", windowsHide: true });
      return;
    } catch {
    }
  }
  child.kill("SIGKILL");
}
async function launchAutomationBrowser(options) {
  const executable = options.executablePath ?? findBrowserExecutable();
  if (!executable || !fs.existsSync(executable)) throw new Error("No Chrome, Chromium, or Edge executable was found");
  fs.mkdirSync(options.profileDir, { recursive: true });
  const activePort = path.join(options.profileDir, "DevToolsActivePort");
  try {
    fs.rmSync(activePort, { force: true });
  } catch {
  }
  const child = (0, import_node_child_process.spawn)(executable, [
    "--remote-debugging-port=0",
    "--remote-debugging-address=127.0.0.1",
    `--user-data-dir=${options.profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
  ], { stdio: "ignore", windowsHide: false });
  try {
    const port = await Promise.race([
      waitForDevToolsPort(activePort),
      new Promise((_, reject) => child.once("error", reject)),
      new Promise((_, reject) => child.once("exit", () => reject(new Error("Automation Chromium exited before opening its DevTools port"))))
    ]);
    const endpoint = `http://127.0.0.1:${port}`;
    const browser = await import_playwright_core.chromium.connectOverCDP(endpoint);
    const ids = /* @__PURE__ */ new WeakMap();
    const refMaps = /* @__PURE__ */ new WeakMap();
    const observed = /* @__PURE__ */ new WeakSet();
    let nextID = 1;
    const observe = (page) => {
      if (observed.has(page)) return;
      observed.add(page);
      page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) refMaps.delete(page);
      });
    };
    const pages = () => {
      const all = browser.contexts().flatMap((context) => context.pages());
      for (const page of all) observe(page);
      return all;
    };
    const tabID = (page) => ids.get(page) ?? (() => {
      const id = `tab_${nextID++}`;
      ids.set(page, id);
      return id;
    })();
    const pageByID = (id) => {
      const page = pages().find((candidate) => tabID(candidate) === id);
      if (!page) throw new Error("Unknown browser tab");
      observe(page);
      return page;
    };
    const targetFor = (page, target) => {
      if ("ref" in target) {
        const handle = refMaps.get(page)?.get(target.ref);
        if (!handle) throw new Error("Unknown or stale ref; take a new snapshot");
        return handle;
      }
      return page.locator(target.selector).first();
    };
    const indexInteractive = async (page) => {
      const handles = await page.$$(INTERACTIVE_SELECTOR);
      const refs = /* @__PURE__ */ new Map();
      const lines = [];
      let index = 0;
      for (const handle of handles) {
        if (index >= REF_LIMIT) break;
        try {
          if (!await handle.isVisible()) continue;
          const info = await handle.evaluate((el) => {
            const tag = String(el.tagName || "").toLowerCase();
            const role = String(el.getAttribute("role") || tag);
            const inputType = tag === "input" ? String(el.type || "text") : "";
            const raw = el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.innerText || el.value || el.getAttribute("title") || "";
            return {
              role,
              inputType,
              name: String(raw).replace(/\s+/g, " ").trim().slice(0, 80)
            };
          });
          const ref = `e${++index}`;
          refs.set(ref, handle);
          const label = info.inputType ? `${info.role}[${info.inputType}]` : info.role;
          lines.push(`[${ref}] ${label}${info.name ? ` "${info.name}"` : ""}`);
        } catch {
        }
      }
      refMaps.set(page, refs);
      return lines;
    };
    return {
      endpoint,
      process: child,
      alive: () => child.exitCode === null && browser.isConnected(),
      open: async (url) => {
        const context = browser.contexts()[0] ?? await browser.newContext();
        const page = await context.newPage();
        observe(page);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        refMaps.delete(page);
        return { id: tabID(page), title: await page.title(), url: page.url() };
      },
      navigate: async (id, url) => {
        const page = pageByID(id);
        refMaps.delete(page);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        refMaps.delete(page);
        return { id, title: await page.title(), url: page.url() };
      },
      tabs: async () => Promise.all(pages().map(async (page) => ({ id: tabID(page), title: await page.title(), url: page.url() }))),
      snapshot: async (id, snapshotOptions = {}) => {
        const page = pageByID(id);
        const body = (await page.locator("body").innerText()).slice(0, SNAPSHOT_MAX);
        const total = body.length;
        const offset = Math.max(0, Math.min(Math.floor(snapshotOptions.offset ?? 0), total));
        const text = body.slice(offset, offset + SNAPSHOT_LIMIT);
        const end = offset + text.length;
        return {
          text,
          offset,
          nextOffset: end < total ? end : null,
          total,
          refs: offset === 0 ? await indexInteractive(page) : []
        };
      },
      extract: async (id, selector, extractOptions = {}) => {
        const page = pageByID(id);
        const locator = page.locator(selector);
        const count = await locator.count();
        if (!count) throw new Error("No elements matched selector");
        const maxValues = extractOptions.all ? 50 : 1;
        const values = [];
        let used = 0;
        let scanned = 0;
        for (; scanned < count && values.length < maxValues; scanned++) {
          const item = locator.nth(scanned);
          const raw = extractOptions.attribute ? await item.getAttribute(extractOptions.attribute) : await item.innerText();
          const value = (raw ?? "").trim();
          if (!value) continue;
          const room = EXTRACT_LIMIT - used;
          if (room <= 0) break;
          const piece = value.slice(0, room);
          values.push(piece);
          used += piece.length;
        }
        return { values, count, truncated: scanned < count };
      },
      click: async (id, target) => {
        await targetFor(pageByID(id), target).click();
      },
      type: async (id, target, text) => {
        await targetFor(pageByID(id), target).fill(text);
      },
      screenshot: async (id, screenshotOptions = {}) => {
        const page = pageByID(id);
        let data;
        if (screenshotOptions.selector) {
          const locator = page.locator(screenshotOptions.selector);
          if (await locator.count() === 0) throw new Error("No elements matched selector");
          data = await locator.first().screenshot({ type: "png" });
        } else {
          data = await page.screenshot({ type: "png", fullPage: Boolean(screenshotOptions.fullPage) });
        }
        return { data: data.toString("base64"), mimeType: "image/png" };
      },
      closeTab: async (id) => {
        const page = pageByID(id);
        refMaps.delete(page);
        await page.close();
      },
      close: () => new Promise((resolve) => {
        if (child.exitCode !== null || child.killed) return resolve();
        let settled = false;
        let timer;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve();
        };
        timer = setTimeout(() => {
          killProcessTree(child);
          finish();
        }, 5e3);
        timer.unref?.();
        child.once("exit", finish);
        void browser.close().catch(() => killProcessTree(child));
      })
    };
  } catch (error) {
    killProcessTree(child);
    throw error;
  }
}

// src/server.ts
var MAX_BODY_BYTES = 1048576;
var OVERSIZED = Symbol("oversized-body");
function bearerToken(request) {
  const value = request.headers.authorization;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length) : "";
}
function send(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}
function requestBody(request) {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    request.on("data", (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        settled = true;
        chunks.length = 0;
        resolve(OVERSIZED);
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (settled) return;
      settled = true;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        resolve(void 0);
      }
    });
    request.on("error", () => {
      if (settled) return;
      settled = true;
      resolve(void 0);
    });
  });
}
async function createBridge(options = {}) {
  const token = options.token ?? (0, import_node_crypto2.randomBytes)(32).toString("hex");
  const profileDir = options.profileDir ?? path2.join(os.homedir(), ".opencode-gui", "browser-profile");
  const allowPrivate = options.allowPrivate ?? process.env.OPENCODE_GUI_BROWSER_ALLOW_PRIVATE === "1";
  let automation;
  let launching;
  const current = () => automation && (automation.alive?.() ?? true) ? automation : void 0;
  const startBrowser = () => {
    launching ??= (async () => (options.launchBrowser ?? launchAutomationBrowser)({ profileDir }))().finally(() => {
      launching = void 0;
    });
    return launching;
  };
  const server = (0, import_node_http.createServer)(async (request, response) => {
    if (!isValidBridgeToken(token, bearerToken(request))) {
      send(response, 401, { error: "unauthorized" });
      return;
    }
    if (request.method === "GET" && request.url === "/health") {
      send(response, 200, { status: "ok" });
      return;
    }
    if (request.method === "GET" && request.url === "/status") {
      send(response, 200, { status: "ready", browser: current() ? "running" : "stopped", attachedTabs: 0, allowPrivate });
      return;
    }
    if (request.method === "GET" && request.url === "/tabs") {
      const browser = current();
      if (!browser) {
        send(response, 200, { tabs: [] });
        return;
      }
      try {
        send(response, 200, { tabs: await browser.tabs() });
      } catch (error) {
        send(response, 502, { error: error instanceof Error ? error.message : "tabs_failed" });
      }
      return;
    }
    if (request.method === "POST" && request.url === "/launch") {
      if (current()) {
        send(response, 200, { status: "running" });
        return;
      }
      void (async () => {
        try {
          automation = await startBrowser();
          send(response, 200, { status: "running" });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to launch automation browser";
          send(response, 500, { error: message });
        }
      })();
      return;
    }
    if (request.method === "POST" && ["/open", "/navigate"].includes(request.url ?? "")) {
      const body = await requestBody(request);
      if (body === OVERSIZED) {
        send(response, 413, { error: "request_too_large" });
        return;
      }
      const url = body && typeof body === "object" ? body.url : void 0;
      const tabID = body && typeof body === "object" ? body.tabID : void 0;
      if (typeof url !== "string" || !isAllowedNavigationUrl(url, { allowPrivate })) {
        send(response, 400, { error: "invalid_navigation_url" });
        return;
      }
      if (request.url === "/navigate" && typeof tabID !== "string") {
        send(response, 400, { error: "invalid_request" });
        return;
      }
      const browser = current();
      if (!browser) {
        send(response, 409, { error: "browser_not_running" });
        return;
      }
      try {
        send(response, 200, request.url === "/open" ? await browser.open(url) : await browser.navigate(tabID, url));
      } catch (error) {
        send(response, 502, { error: error instanceof Error ? error.message : "navigation_failed" });
      }
      return;
    }
    if (request.method === "POST" && request.url === "/extract") {
      const browser = current();
      if (!browser) {
        send(response, 409, { error: "browser_not_running" });
        return;
      }
      const body = await requestBody(request);
      if (body === OVERSIZED) {
        send(response, 413, { error: "request_too_large" });
        return;
      }
      const input = body;
      if (typeof input?.tabID !== "string" || typeof input.selector !== "string") {
        send(response, 400, { error: "invalid_request" });
        return;
      }
      try {
        send(response, 200, await browser.extract(input.tabID, input.selector, {
          all: typeof input.all === "boolean" ? input.all : void 0,
          attribute: typeof input.attribute === "string" ? input.attribute : void 0
        }));
      } catch (error) {
        send(response, 404, { error: error instanceof Error ? error.message : "browser_operation_failed" });
      }
      return;
    }
    if (request.method === "POST" && ["/snapshot", "/click", "/type", "/screenshot", "/close"].includes(request.url ?? "")) {
      const browser = current();
      if (!browser) {
        send(response, 409, { error: "browser_not_running" });
        return;
      }
      const body = await requestBody(request);
      if (body === OVERSIZED) {
        send(response, 413, { error: "request_too_large" });
        return;
      }
      const input = body;
      if (typeof input?.tabID !== "string") {
        send(response, 400, { error: "invalid_request" });
        return;
      }
      try {
        if (request.url === "/snapshot") {
          const options2 = typeof input.offset === "number" ? { offset: input.offset } : {};
          send(response, 200, await browser.snapshot(input.tabID, options2));
        }
        if (request.url === "/screenshot") send(response, 200, await browser.screenshot(input.tabID, input));
        if (request.url === "/close") {
          await browser.closeTab(input.tabID);
          send(response, 200, { status: "ok" });
        }
        if (request.url === "/click") {
          if (!input.target || typeof input.target !== "object") {
            send(response, 400, { error: "invalid_request" });
            return;
          }
          await browser.click(input.tabID, input.target);
          send(response, 200, { status: "ok" });
        }
        if (request.url === "/type") {
          if (typeof input.text !== "string" || !input.target || typeof input.target !== "object") {
            send(response, 400, { error: "invalid_request" });
            return;
          }
          await browser.type(input.tabID, input.target, input.text);
          send(response, 200, { status: "ok" });
        }
      } catch (error) {
        send(response, 404, { error: error instanceof Error ? error.message : "browser_operation_failed" });
      }
      return;
    }
    send(response, 404, { error: "not_found" });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    await new Promise((resolve) => server.close(() => resolve()));
    throw new Error("Browser bridge did not receive a TCP address");
  }
  return {
    token,
    url: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await launching?.catch(() => void 0);
      try {
        await automation?.close();
      } catch {
      }
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
  };
}

// src/state.ts
var fs2 = __toESM(require("node:fs"), 1);
var path3 = __toESM(require("node:path"), 1);
var import_node_child_process2 = require("node:child_process");
function restrictWindowsAcl(file) {
  if (process.platform !== "win32") return;
  const identity = (0, import_node_child_process2.execFileSync)("whoami", ["/user", "/fo", "csv"], { encoding: "utf8", windowsHide: true });
  const sid = identity.match(/S-1-5-(?:\d+-)+\d+/)?.[0];
  if (!sid) throw new Error("Unable to identify Windows user for bridge state ACL");
  (0, import_node_child_process2.execFileSync)("icacls", [file, "/inheritance:r", "/grant:r", `*${sid}:(F)`], { stdio: "ignore", windowsHide: true });
}
function readBridgeState(file) {
  try {
    const value = JSON.parse(fs2.readFileSync(file, "utf8"));
    if (!value || typeof value !== "object") return void 0;
    const state = value;
    return typeof state.url === "string" && isLoopbackUrl(state.url) && typeof state.token === "string" && /^[a-f0-9]{64}$/.test(state.token) && Number.isSafeInteger(state.pid) && (state.pid ?? 0) > 0 ? state : void 0;
  } catch {
    return void 0;
  }
}
function writeBridgeState(file, state) {
  if (!isLoopbackUrl(state.url) || !/^[a-f0-9]{64}$/.test(state.token) || !Number.isSafeInteger(state.pid) || state.pid < 1) {
    throw new Error("Invalid bridge state");
  }
  fs2.mkdirSync(path3.dirname(file), { recursive: true, mode: 448 });
  const temp = `${file}.${process.pid}.tmp`;
  try {
    fs2.writeFileSync(temp, JSON.stringify(state), { mode: 384, flag: "wx" });
    restrictWindowsAcl(temp);
    fs2.renameSync(temp, file);
  } catch (error) {
    fs2.rmSync(temp, { force: true });
    throw error;
  }
}
function removeBridgeState(file, owner) {
  const current = readBridgeState(file);
  if (current?.token === owner.token && current.pid === owner.pid) fs2.rmSync(file, { force: true });
}

// src/main.ts
var stateFile = process.env.OPENCODE_GUI_BROWSER_STATE ?? path4.join(os2.homedir(), ".opencode-gui", "browser-bridge.json");
async function activeBridge() {
  const state = readBridgeState(stateFile);
  if (!state) return false;
  try {
    const response = await fetch(new URL("/health", state.url), {
      headers: { authorization: `Bearer ${state.token}` },
      signal: AbortSignal.timeout(1e3)
    });
    return response.ok;
  } catch {
    return false;
  }
}
async function main() {
  if (await activeBridge()) throw new Error("Browser bridge is already running");
  const bridge = await createBridge({ profileDir: process.env.OPENCODE_GUI_BROWSER_PROFILE });
  const state = { url: bridge.url, token: bridge.token, pid: process.pid };
  try {
    writeBridgeState(stateFile, state);
  } catch (error) {
    await bridge.close();
    throw error;
  }
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    const watchdog = setTimeout(() => process.exit(0), 8e3);
    watchdog.unref();
    try {
      await bridge.close();
    } finally {
      clearTimeout(watchdog);
      removeBridgeState(stateFile, state);
    }
  };
  process.on("SIGTERM", () => {
    void stop().then(() => process.exit(0), () => process.exit(1));
  });
  process.on("SIGINT", () => {
    void stop().then(() => process.exit(0), () => process.exit(1));
  });
  process.on("disconnect", () => {
    void stop().then(() => process.exit(0), () => process.exit(1));
  });
  process.stdout.write(`Browser bridge ready at ${bridge.url}
`);
}
void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Browser bridge failed"}
`);
  process.exitCode = 1;
});
