var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/@opencode/client/dist/chunks/contract-9rqn6x4v.js
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __defProp2, __returnValue, __export2;
var init_contract_9rqn6x4v = __esm({
  "../../node_modules/@opencode/client/dist/chunks/contract-9rqn6x4v.js"() {
    __defProp2 = Object.defineProperty;
    __returnValue = (v) => v;
    __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, {
          get: all[name],
          enumerable: true,
          configurable: true,
          set: __exportSetter.bind(all, name)
        });
    };
  }
});

// ../../node_modules/@opencode/client/dist/chunks/contract-frbwqjmf.js
function make7(connect) {
  let current;
  const capacity = 4096;
  function stop2(connection) {
    connection.connected = void 0;
    connection.controller.abort();
    if (current === connection)
      current = void 0;
  }
  async function run(connection) {
    let iterator;
    let completion = {};
    try {
      if (connection.controller.signal.aborted)
        return;
      iterator = connect(connection.controller.signal, () => {
        connection.subscribers.forEach((subscriber) => subscriber.activity?.());
      })[Symbol.asyncIterator]();
      while (!connection.controller.signal.aborted) {
        const item = await iterator.next();
        if (item.done || connection.controller.signal.aborted)
          break;
        if (item.value.type === "server.connected")
          connection.connected = item.value;
        connection.subscribers.forEach((subscriber) => subscriber.push(item.value));
      }
    } catch (error) {
      completion = { error };
    } finally {
      stop2(connection);
      try {
        await iterator?.return?.();
      } catch (error) {
        if (!("error" in completion))
          completion = { error };
      }
      connection.subscribers.forEach((subscriber) => subscriber.finish(completion));
    }
  }
  return {
    subscribe(options) {
      return {
        [Symbol.asyncIterator]() {
          const pending = [];
          const queued = [];
          let started = false;
          let completion;
          let connection;
          function finish(result, discard = true) {
            completion = result;
            if (discard)
              queued.length = 0;
            options?.signal?.removeEventListener("abort", abort);
            if (connection?.subscribers.delete(subscriber) && !connection.subscribers.size)
              stop2(connection);
            pending.splice(0).forEach((request) => {
              if ("error" in result)
                request.reject(result.error);
              else
                request.resolve({ done: true, value: void 0 });
            });
          }
          function abort() {
            finish({});
          }
          const subscriber = {
            activity: options?.onActivity,
            finish(result) {
              finish(result, false);
            },
            push(value) {
              if (completion)
                return;
              const request = pending.shift();
              if (request) {
                request.resolve({ done: false, value });
                return;
              }
              if (queued.length === capacity) {
                finish({ error: new Error(`Event subscriber exceeded its ${capacity}-event capacity`) });
                return;
              }
              queued.push(value);
            }
          };
          function start() {
            if (completion)
              return;
            const fresh = !current;
            connection = current ?? {
              controller: new AbortController(),
              subscribers: /* @__PURE__ */ new Set()
            };
            current = connection;
            connection.subscribers.add(subscriber);
            if (connection.connected)
              subscriber.push(connection.connected);
            if (fresh)
              run(connection);
          }
          return {
            next() {
              const value = queued.shift();
              if (value)
                return Promise.resolve({ done: false, value });
              if (completion) {
                if ("error" in completion)
                  return Promise.reject(completion.error);
                return Promise.resolve({ done: true, value: void 0 });
              }
              if (options?.signal?.aborted) {
                abort();
                return Promise.resolve({ done: true, value: void 0 });
              }
              const request = Promise.withResolvers();
              pending.push(request);
              if (!started) {
                started = true;
                options?.signal?.addEventListener("abort", abort, { once: true });
                start();
              }
              return request.promise;
            },
            return() {
              finish({});
              return Promise.resolve({ done: true, value: void 0 });
            }
          };
        }
      };
    }
  };
}
var exports_shared_events;
var init_contract_frbwqjmf = __esm({
  "../../node_modules/@opencode/client/dist/chunks/contract-frbwqjmf.js"() {
    init_contract_9rqn6x4v();
    exports_shared_events = {};
    __export2(exports_shared_events, {
      SharedEvents: () => exports_shared_events,
      make: () => make7
    });
  }
});

// ../../node_modules/@opencode/client/dist/chunks/contract-nwcpakzx.js
var ClientError3;
var init_contract_nwcpakzx = __esm({
  "../../node_modules/@opencode/client/dist/chunks/contract-nwcpakzx.js"() {
    ClientError3 = class extends Error {
      reason;
      name = "ClientError";
      constructor(reason, options) {
        const detail = options?.detail ?? (options?.cause instanceof Error ? options.cause.message : void 0);
        super(detail ? `${reason}: ${detail}` : reason, options);
        this.reason = reason;
      }
    };
  }
});

// ../../node_modules/@opencode/client/dist/chunks/contract-n8g24fq8.js
function make6(options) {
  const fetch2 = options.fetch ?? globalThis.fetch;
  const prepare = (descriptor, requestOptions) => {
    const baseUrl = new URL(options.baseUrl);
    if (!baseUrl.pathname.endsWith("/"))
      baseUrl.pathname += "/";
    const url = new URL(descriptor.path.slice(1), baseUrl);
    for (const [key, value] of Object.entries(descriptor.query ?? {}))
      appendQuery(url.searchParams, key, value);
    const headers2 = new Headers(options.headers);
    for (const [key, value] of Object.entries(descriptor.headers ?? {})) {
      if (value !== void 0 && value !== null)
        headers2.set(key, String(value));
    }
    for (const [key, value] of new Headers(requestOptions?.headers))
      headers2.set(key, value);
    if (descriptor.body !== void 0 && !headers2.has("content-type"))
      headers2.set("content-type", descriptor.binaryBody ? "application/octet-stream" : "application/json");
    return {
      url,
      init: {
        method: descriptor.method,
        signal: requestOptions?.signal,
        headers: headers2,
        body: descriptor.body === void 0 ? void 0 : descriptor.binaryBody ? descriptor.body : JSON.stringify(descriptor.body)
      }
    };
  };
  const execute = async (descriptor, requestOptions) => {
    try {
      const prepared = prepare(descriptor, requestOptions);
      return await fetch2(prepared.url, prepared.init);
    } catch (cause) {
      throw new ClientError3("Transport", { cause });
    }
  };
  const responseError = async (response, descriptor) => {
    if (descriptor.declaredStatuses.includes(response.status))
      throw declared(await json(response));
    try {
      await response.body?.cancel();
    } catch {
    }
    throw new ClientError3("UnexpectedStatus", { cause: { status: response.status }, detail: String(response.status) });
  };
  const request = async (descriptor, requestOptions) => {
    const response = await execute(descriptor, requestOptions);
    if (response.status !== descriptor.successStatus)
      return responseError(response, descriptor);
    if (descriptor.binary)
      return new Uint8Array(await response.arrayBuffer());
    if (descriptor.empty) {
      try {
        await response.body?.cancel();
      } catch {
      }
      return;
    }
    return await json(response);
  };
  const sse = (descriptor, requestOptions) => ({
    async *[Symbol.asyncIterator]() {
      const response = await execute(descriptor, requestOptions);
      if (response.status !== descriptor.successStatus)
        await responseError(response, descriptor);
      if (!isContentType(response, "text/event-stream")) {
        try {
          await response.body?.cancel();
        } catch {
        }
        throw new ClientError3("UnsupportedContentType", { detail: response.headers.get("content-type") });
      }
      if (response.body === null)
        throw new ClientError3("MalformedResponse");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          let next;
          try {
            next = await reader.read();
          } catch (cause) {
            throw new ClientError3("Transport", { cause });
          }
          if (!next.done)
            requestOptions?.onActivity?.();
          buffer += decoder.decode(next.value, { stream: !next.done });
          if (buffer.length > maxSseEventBytes)
            throw new ClientError3("SseEventTooLarge");
          const trailingCarriageReturn = !next.done && buffer.endsWith("\r");
          if (trailingCarriageReturn)
            buffer = buffer.slice(0, -1);
          buffer = buffer.replaceAll(`\r
`, `
`).replaceAll("\r", `
`);
          if (trailingCarriageReturn)
            buffer += "\r";
          if (next.done && buffer !== "")
            buffer += `

`;
          let boundary = buffer.indexOf(`

`);
          while (boundary >= 0) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const data = block.split(`
`).flatMap((line) => line.startsWith("data:") ? [line.slice(5).trimStart()] : []).join(`
`);
            if (data !== "") {
              try {
                yield JSON.parse(data);
              } catch (cause) {
                throw new ClientError3("MalformedResponse", { cause });
              }
            }
            boundary = buffer.indexOf(`

`);
          }
          if (next.done)
            return;
        }
      } finally {
        try {
          await reader.cancel();
        } catch {
        }
        reader.releaseLock();
      }
    }
  });
  return {
    server: {
      info: (requestOptions) => request({ method: "GET", path: `/api/info`, successStatus: 200, declaredStatuses: [400, 401], empty: false }, requestOptions),
      pair: (requestOptions) => request({ method: "POST", path: `/api/pair`, successStatus: 200, declaredStatuses: [400, 401], empty: false }, requestOptions),
      connect: (input, requestOptions) => request({
        method: "GET",
        path: `/auth/connect/${encodeURIComponent(input.code)}`,
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions)
    },
    location: {
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/location`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      reload: (requestOptions) => request({
        method: "POST",
        path: `/api/location/reload`,
        successStatus: 204,
        declaredStatuses: [400, 401, 503],
        empty: true
      }, requestOptions)
    },
    agent: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/agent`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/agent/${encodeURIComponent(input.agentID)}`,
        query: { location: input["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions)
    },
    plugin: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/plugin`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      check: (input, requestOptions) => request({
        method: "POST",
        path: `/api/plugin/check`,
        query: { location: input?.["location"] },
        body: { target: input?.["target"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      update: (input, requestOptions) => request({
        method: "POST",
        path: `/api/plugin/update`,
        query: { location: input["location"] },
        body: { targets: input["targets"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 503],
        empty: true
      }, requestOptions)
    },
    session: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/session`,
        query: {
          limit: input?.["limit"],
          order: input?.["order"],
          search: input?.["search"],
          parentID: input?.["parentID"],
          directory: input?.["directory"],
          project: input?.["project"],
          subpath: input?.["subpath"],
          cursor: input?.["cursor"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      stats: (input, requestOptions) => request({
        method: "GET",
        path: `/api/experimental/session/stats`,
        query: {
          from: input?.["from"],
          to: input?.["to"],
          project: input?.["project"],
          timezone: input?.["timezone"],
          tools: input?.["tools"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions).then((value) => value.data),
      create: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session`,
        body: {
          id: input?.["id"],
          title: input?.["title"],
          agent: input?.["agent"],
          model: input?.["model"],
          location: input?.["location"],
          metadata: input?.["metadata"],
          permissions: input?.["permissions"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions).then((value) => value.data),
      import: (input, requestOptions) => request({
        method: "POST",
        path: `/api/experimental/session/import`,
        body: { info: input["info"], messages: input["messages"], location: input["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 409],
        empty: false
      }, requestOptions).then((value) => value.data),
      export: (input, requestOptions) => request({
        method: "GET",
        path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/export`,
        query: { sanitize: input["sanitize"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 500],
        empty: false
      }, requestOptions).then((value) => value.data),
      active: (requestOptions) => request({
        method: "GET",
        path: `/api/session/active`,
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions).then((value) => value.data),
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/session/${encodeURIComponent(input.sessionID)}`,
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions).then((value) => value.data),
      remove: (input, requestOptions) => request({
        method: "DELETE",
        path: `/api/session/${encodeURIComponent(input.sessionID)}`,
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      fork: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/fork`,
        body: { before: input["before"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions).then((value) => value.data),
      switchAgent: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/agent`,
        body: { agent: input["agent"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      switchModel: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/model`,
        body: { model: input["model"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      update: (input, requestOptions) => request({
        method: "PATCH",
        path: `/api/session/${encodeURIComponent(input.sessionID)}`,
        body: { title: input["title"], metadata: input["metadata"], permissions: input["permissions"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      move: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/move`,
        body: { directory: input["directory"], delivery: input["delivery"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      prompt: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/prompt`,
        body: {
          id: input["id"],
          text: input["text"],
          files: input["files"],
          agents: input["agents"],
          skills: input["skills"],
          metadata: input["metadata"],
          delivery: input["delivery"],
          resume: input["resume"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 409],
        empty: false
      }, requestOptions).then((value) => value.data),
      command: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/command`,
        body: {
          name: input["name"],
          text: input["text"],
          files: input["files"],
          agents: input["agents"],
          skills: input["skills"],
          delivery: input["delivery"]
        },
        successStatus: 204,
        declaredStatuses: [400, 401, 404, 500],
        empty: true
      }, requestOptions),
      skill: (input, requestOptions) => request({
        method: "POST",
        path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/skill`,
        body: { id: input["id"], resume: input["resume"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      synthetic: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/synthetic`,
        body: {
          id: input["id"],
          text: input["text"],
          description: input["description"],
          metadata: input["metadata"],
          delivery: input["delivery"],
          resume: input["resume"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 409],
        empty: false
      }, requestOptions).then((value) => value.data),
      shell: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/shell`,
        body: { id: input["id"], command: input["command"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      compact: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/compact`,
        body: { id: input["id"], delivery: input["delivery"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 409],
        empty: false
      }, requestOptions).then((value) => value.data),
      wait: (input, requestOptions) => request({
        method: "POST",
        path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/wait`,
        successStatus: 204,
        declaredStatuses: [400, 401, 404, 503],
        empty: true
      }, requestOptions),
      revert: {
        stage: (input, requestOptions) => request({
          method: "POST",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/revert/stage`,
          body: { messageID: input["messageID"], files: input["files"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 404, 409, 500],
          empty: false
        }, requestOptions).then((value) => value.data),
        clear: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/revert`,
          successStatus: 204,
          declaredStatuses: [400, 401, 404, 409, 500],
          empty: true
        }, requestOptions),
        commit: (input, requestOptions) => request({
          method: "POST",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/revert/commit`,
          successStatus: 204,
          declaredStatuses: [400, 401, 404, 409],
          empty: true
        }, requestOptions)
      },
      context: (input, requestOptions) => request({
        method: "GET",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/context`,
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 500],
        empty: false
      }, requestOptions).then((value) => value.data),
      diff: (input, requestOptions) => request({
        method: "GET",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/diff`,
        query: { from: input["from"], to: input["to"], context: input["context"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 500],
        empty: false
      }, requestOptions).then((value) => value.data),
      inbox: {
        list: (input, requestOptions) => request({
          method: "GET",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/inbox`,
          successStatus: 200,
          declaredStatuses: [400, 401, 404],
          empty: false
        }, requestOptions).then((value) => value.data),
        cancel: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/inbox/${encodeURIComponent(input.inboxID)}`,
          successStatus: 204,
          declaredStatuses: [400, 401, 404],
          empty: true
        }, requestOptions),
        update: (input, requestOptions) => request({
          method: "PATCH",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/inbox/${encodeURIComponent(input.inboxID)}`,
          body: { delivery: input["delivery"] },
          successStatus: 204,
          declaredStatuses: [400, 401, 404, 409],
          empty: true
        }, requestOptions)
      },
      instructions: {
        entry: {
          list: (input, requestOptions) => request({
            method: "GET",
            path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/instructions/entries`,
            successStatus: 200,
            declaredStatuses: [400, 401, 404],
            empty: false
          }, requestOptions).then((value) => value.data),
          put: (input, requestOptions) => request({
            method: "PUT",
            path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/instructions/entries/${encodeURIComponent(input.key)}`,
            body: { value: input["value"] },
            successStatus: 204,
            declaredStatuses: [400, 401, 404, 413],
            empty: true
          }, requestOptions),
          remove: (input, requestOptions) => request({
            method: "DELETE",
            path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/instructions/entries/${encodeURIComponent(input.key)}`,
            successStatus: 204,
            declaredStatuses: [400, 401, 404],
            empty: true
          }, requestOptions)
        }
      },
      generate: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/generate`,
        body: { prompt: input["prompt"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 503],
        empty: false
      }, requestOptions).then((value) => value.data),
      log: (input, requestOptions) => sse({
        method: "GET",
        path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/log`,
        query: { after: input["after"], follow: input["follow"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      interrupt: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/interrupt`,
        query: { resume: input["resume"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      background: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/background`,
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      message: {
        get: (input, requestOptions) => request({
          method: "GET",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/message/${encodeURIComponent(input.messageID)}`,
          successStatus: 200,
          declaredStatuses: [400, 401, 404],
          empty: false
        }, requestOptions).then((value) => value.data)
      },
      form: {
        list: (input, requestOptions) => request({
          method: "GET",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/form`,
          successStatus: 200,
          declaredStatuses: [400, 401, 404],
          empty: false
        }, requestOptions).then((value) => value.data),
        create: (input, requestOptions) => request({
          method: "POST",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/form`,
          body: { id: input["id"], title: input["title"], metadata: input["metadata"], fields: input["fields"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 404, 409],
          empty: false
        }, requestOptions).then((value) => value.data),
        get: (input, requestOptions) => request({
          method: "GET",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/form/${encodeURIComponent(input.formID)}`,
          successStatus: 200,
          declaredStatuses: [400, 401, 404],
          empty: false
        }, requestOptions).then((value) => value.data),
        reply: (input, requestOptions) => request({
          method: "POST",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/form/${encodeURIComponent(input.formID)}/reply`,
          body: { answer: input["answer"] },
          successStatus: 204,
          declaredStatuses: [400, 401, 404, 409],
          empty: true
        }, requestOptions),
        cancel: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/session/${encodeURIComponent(input.sessionID)}/form/${encodeURIComponent(input.formID)}`,
          successStatus: 204,
          declaredStatuses: [400, 401, 404, 409],
          empty: true
        }, requestOptions)
      },
      environment: (input, requestOptions) => request({
        method: "PUT",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/environment`,
        body: { variables: input["variables"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      view: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/view`,
        body: { idle: input["idle"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions)
    },
    message: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/message`,
        query: { limit: input["limit"], order: input["order"], cursor: input["cursor"], type: input["type"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 500],
        empty: false
      }, requestOptions)
    },
    model: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/model`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions),
      default: (input, requestOptions) => request({
        method: "GET",
        path: `/api/model/default`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions)
    },
    generate: {
      text: (input, requestOptions) => request({
        method: "POST",
        path: `/api/experimental/generate`,
        body: { prompt: input["prompt"], model: input["model"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions).then((value) => value.data)
    },
    provider: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/provider`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions),
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/provider/${encodeURIComponent(input.providerID)}`,
        query: { location: input["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404, 503],
        empty: false
      }, requestOptions)
    },
    integration: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/integration`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/integration/${encodeURIComponent(input.integrationID)}`,
        query: { location: input["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      wellknown: {
        add: (input, requestOptions) => request({
          method: "POST",
          path: `/api/experimental/integration/wellknown`,
          query: { location: input["location"] },
          body: { url: input["url"] },
          successStatus: 204,
          declaredStatuses: [400, 401],
          empty: true
        }, requestOptions)
      },
      connect: {
        key: (input, requestOptions) => request({
          method: "POST",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/key`,
          query: { location: input["location"] },
          body: { key: input["key"], answer: input["answer"], label: input["label"] },
          successStatus: 204,
          declaredStatuses: [400, 401, 404],
          empty: true
        }, requestOptions)
      },
      oauth: {
        connect: (input, requestOptions) => request({
          method: "POST",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/oauth`,
          query: { location: input["location"] },
          body: { methodID: input["methodID"], answer: input["answer"], label: input["label"] },
          successStatus: 200,
          declaredStatuses: [400, 401],
          empty: false
        }, requestOptions),
        status: (input, requestOptions) => request({
          method: "GET",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/oauth/${encodeURIComponent(input.attemptID)}`,
          query: { location: input["location"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 404],
          empty: false
        }, requestOptions),
        complete: (input, requestOptions) => request({
          method: "POST",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/oauth/${encodeURIComponent(input.attemptID)}/complete`,
          query: { location: input["location"] },
          body: { code: input["code"] },
          successStatus: 204,
          declaredStatuses: [400, 401, 404],
          empty: true
        }, requestOptions),
        cancel: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/oauth/${encodeURIComponent(input.attemptID)}`,
          query: { location: input["location"] },
          successStatus: 204,
          declaredStatuses: [400, 401],
          empty: true
        }, requestOptions)
      },
      command: {
        connect: (input, requestOptions) => request({
          method: "POST",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/command`,
          query: { location: input["location"] },
          body: { methodID: input["methodID"], label: input["label"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 404],
          empty: false
        }, requestOptions),
        status: (input, requestOptions) => request({
          method: "GET",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/command/${encodeURIComponent(input.attemptID)}`,
          query: { location: input["location"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 404],
          empty: false
        }, requestOptions),
        cancel: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/integration/${encodeURIComponent(input.integrationID)}/connect/command/${encodeURIComponent(input.attemptID)}`,
          query: { location: input["location"] },
          successStatus: 204,
          declaredStatuses: [400, 401],
          empty: true
        }, requestOptions)
      }
    },
    mcp: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/mcp`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      add: (input, requestOptions) => request({
        method: "PUT",
        path: `/api/experimental/mcp/${encodeURIComponent(input.server)}`,
        query: { location: input["location"] },
        body: { config: input["config"] },
        successStatus: 204,
        declaredStatuses: [400, 401],
        empty: true
      }, requestOptions),
      remove: (input, requestOptions) => request({
        method: "DELETE",
        path: `/api/experimental/mcp/${encodeURIComponent(input.server)}`,
        query: { location: input["location"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      connect: (input, requestOptions) => request({
        method: "POST",
        path: `/api/experimental/mcp/${encodeURIComponent(input.server)}/connect`,
        query: { location: input["location"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      disconnect: (input, requestOptions) => request({
        method: "POST",
        path: `/api/experimental/mcp/${encodeURIComponent(input.server)}/disconnect`,
        query: { location: input["location"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      resource: {
        catalog: (input, requestOptions) => request({
          method: "GET",
          path: `/api/mcp/resource`,
          query: { location: input?.["location"] },
          successStatus: 200,
          declaredStatuses: [400, 401],
          empty: false
        }, requestOptions)
      }
    },
    credential: {
      update: (input, requestOptions) => request({
        method: "PATCH",
        path: `/api/credential/${encodeURIComponent(input.credentialID)}`,
        body: { label: input["label"] },
        successStatus: 204,
        declaredStatuses: [400, 401],
        empty: true
      }, requestOptions),
      activate: (input, requestOptions) => request({
        method: "POST",
        path: `/api/credential/${encodeURIComponent(input.credentialID)}/activate`,
        successStatus: 204,
        declaredStatuses: [400, 401],
        empty: true
      }, requestOptions),
      remove: (input, requestOptions) => request({
        method: "DELETE",
        path: `/api/credential/${encodeURIComponent(input.credentialID)}`,
        successStatus: 204,
        declaredStatuses: [400, 401],
        empty: true
      }, requestOptions)
    },
    project: {
      list: (requestOptions) => request({ method: "GET", path: `/api/project`, successStatus: 200, declaredStatuses: [400, 401], empty: false }, requestOptions),
      update: (input, requestOptions) => request({
        method: "PATCH",
        path: `/api/project/${encodeURIComponent(input.projectID)}`,
        body: {
          canonical: input["canonical"],
          name: input["name"],
          icon: input["icon"],
          commands: input["commands"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions)
    },
    form: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/form`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions)
    },
    permission: {
      request: {
        list: (input, requestOptions) => request({
          method: "GET",
          path: `/api/permission/request`,
          query: { location: input?.["location"] },
          successStatus: 200,
          declaredStatuses: [400, 401],
          empty: false
        }, requestOptions)
      },
      saved: {
        list: (input, requestOptions) => request({
          method: "GET",
          path: `/api/permission/saved`,
          query: { projectID: input?.["projectID"] },
          successStatus: 200,
          declaredStatuses: [400, 401],
          empty: false
        }, requestOptions).then((value) => value.data),
        remove: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/permission/saved/${encodeURIComponent(input.id)}`,
          successStatus: 204,
          declaredStatuses: [400, 401],
          empty: true
        }, requestOptions)
      },
      create: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/permission`,
        body: {
          id: input["id"],
          action: input["action"],
          resources: input["resources"],
          save: input["save"],
          metadata: input["metadata"],
          source: input["source"],
          agent: input["agent"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions).then((value) => value.data),
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/permission`,
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions).then((value) => value.data),
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/permission/${encodeURIComponent(input.requestID)}`,
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions).then((value) => value.data),
      reply: (input, requestOptions) => request({
        method: "POST",
        path: `/api/session/${encodeURIComponent(input.sessionID)}/permission/${encodeURIComponent(input.requestID)}/reply`,
        body: { decision: input["decision"], message: input["message"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions)
    },
    file: {
      read: (input, requestOptions) => request({
        method: "GET",
        path: `/api/fs/read/${encodePath(input.path)}`,
        query: { location: input["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false,
        binary: true
      }, requestOptions),
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/fs/list`,
        query: { location: input?.["location"], path: input?.["path"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      find: (input, requestOptions) => request({
        method: "GET",
        path: `/api/fs/find`,
        query: { location: input["location"], query: input["query"], type: input["type"], limit: input["limit"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      write: (input, requestOptions) => request({
        method: "POST",
        path: `/api/experimental/fs/write`,
        query: { location: input["location"], path: input["path"] },
        body: input["payload"],
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false,
        binaryBody: true
      }, requestOptions)
    },
    command: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/command`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions)
    },
    skill: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/skill`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions)
    },
    rpc: {
      call: (input, requestOptions) => request({
        method: "POST",
        path: `/api/rpc/${encodeURIComponent(input.rpcID)}/${encodeURIComponent(input.method)}`,
        query: { location: input["location"] },
        body: { input: input["input"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 500],
        empty: false
      }, requestOptions)
    },
    event: {
      subscribe: (requestOptions) => sse({ method: "GET", path: `/api/event`, successStatus: 200, declaredStatuses: [400, 401], empty: false }, requestOptions)
    },
    pty: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/pty`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      create: (input, requestOptions) => request({
        method: "POST",
        path: `/api/pty`,
        query: { location: input?.["location"] },
        body: {
          command: input?.["command"],
          args: input?.["args"],
          cwd: input?.["cwd"],
          title: input?.["title"],
          env: input?.["env"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/pty/${encodeURIComponent(input.ptyID)}`,
        query: { location: input["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      update: (input, requestOptions) => request({
        method: "PUT",
        path: `/api/pty/${encodeURIComponent(input.ptyID)}`,
        query: { location: input["location"] },
        body: { title: input["title"], size: input["size"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      remove: (input, requestOptions) => request({
        method: "DELETE",
        path: `/api/pty/${encodeURIComponent(input.ptyID)}`,
        query: { location: input["location"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      connect: {
        token: (input, requestOptions) => request({
          method: "POST",
          path: `/api/pty/${encodeURIComponent(input.ptyID)}/connect-token`,
          query: { location: input["location"] },
          headers: { "x-opencode-ticket": input["x-opencode-ticket"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 403, 404],
          empty: false
        }, requestOptions)
      }
    },
    experimental: {
      persistentPty: {
        read: (input, requestOptions) => request({
          method: "GET",
          path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/terminal/read`,
          query: { lines: input["lines"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 503],
          empty: false
        }, requestOptions).then((value) => value.data),
        list: (input, requestOptions) => request({
          method: "GET",
          path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/terminal`,
          successStatus: 200,
          declaredStatuses: [400, 401, 503],
          empty: false
        }, requestOptions).then((value) => value.data),
        create: (input, requestOptions) => request({
          method: "POST",
          path: `/api/experimental/session/${encodeURIComponent(input.sessionID)}/terminal`,
          body: {
            command: input["command"],
            args: input["args"],
            cwd: input["cwd"],
            title: input["title"],
            env: input["env"],
            size: input["size"]
          },
          successStatus: 200,
          declaredStatuses: [400, 401, 503],
          empty: false
        }, requestOptions).then((value) => value.data),
        shutdown: (requestOptions) => request({
          method: "POST",
          path: `/api/experimental/persistent-pty/shutdown`,
          successStatus: 204,
          declaredStatuses: [400, 401, 503],
          empty: true
        }, requestOptions),
        handoff: (requestOptions) => request({
          method: "POST",
          path: `/api/experimental/persistent-pty/handoff`,
          successStatus: 200,
          declaredStatuses: [400, 401, 503],
          empty: false
        }, requestOptions),
        get: (input, requestOptions) => request({
          method: "GET",
          path: `/api/experimental/persistent-pty/${encodeURIComponent(input.ptyID)}`,
          successStatus: 200,
          declaredStatuses: [400, 401, 404, 503],
          empty: false
        }, requestOptions).then((value) => value.data),
        update: (input, requestOptions) => request({
          method: "PUT",
          path: `/api/experimental/persistent-pty/${encodeURIComponent(input.ptyID)}`,
          body: { attachmentID: input["attachmentID"], size: input["size"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 404, 503],
          empty: false
        }, requestOptions).then((value) => value.data),
        snapshot: (input, requestOptions) => request({
          method: "GET",
          path: `/api/experimental/persistent-pty/${encodeURIComponent(input.ptyID)}/snapshot`,
          successStatus: 200,
          declaredStatuses: [400, 401, 404, 503],
          empty: false
        }, requestOptions).then((value) => value.data),
        remove: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/experimental/persistent-pty/${encodeURIComponent(input.ptyID)}`,
          successStatus: 204,
          declaredStatuses: [400, 401, 404, 503],
          empty: true
        }, requestOptions),
        connectToken: (input, requestOptions) => request({
          method: "POST",
          path: `/api/experimental/persistent-pty/${encodeURIComponent(input.ptyID)}/connect-token`,
          headers: { "x-opencode-ticket": input["x-opencode-ticket"] },
          successStatus: 200,
          declaredStatuses: [400, 401, 403, 404, 503],
          empty: false
        }, requestOptions).then((value) => value.data)
      }
    },
    shell: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/shell`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      create: (input, requestOptions) => request({
        method: "POST",
        path: `/api/shell`,
        query: { location: input["location"] },
        body: {
          command: input["command"],
          cwd: input["cwd"],
          timeout: input["timeout"],
          metadata: input["metadata"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/shell/${encodeURIComponent(input.id)}`,
        query: { location: input["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      output: (input, requestOptions) => request({
        method: "GET",
        path: `/api/shell/${encodeURIComponent(input.id)}/output`,
        query: { location: input["location"], cursor: input["cursor"], limit: input["limit"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      remove: (input, requestOptions) => request({
        method: "DELETE",
        path: `/api/shell/${encodeURIComponent(input.id)}`,
        query: { location: input["location"] },
        successStatus: 204,
        declaredStatuses: [400, 401],
        empty: true
      }, requestOptions)
    },
    reference: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/reference`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions)
    },
    worktree: {
      list: (input, requestOptions) => request({
        method: "GET",
        path: `/api/worktree`,
        query: { projectID: input["projectID"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      create: (input, requestOptions) => request({
        method: "POST",
        path: `/api/worktree`,
        body: {
          projectID: input["projectID"],
          from: input["from"],
          branch: input["branch"],
          directory: input["directory"],
          name: input["name"]
        },
        successStatus: 200,
        declaredStatuses: [400, 401, 404],
        empty: false
      }, requestOptions),
      remove: (input, requestOptions) => request({
        method: "DELETE",
        path: `/api/worktree`,
        body: { projectID: input["projectID"], directory: input["directory"], force: input["force"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions),
      refresh: (input, requestOptions) => request({
        method: "POST",
        path: `/api/worktree/refresh`,
        body: { projectID: input["projectID"] },
        successStatus: 204,
        declaredStatuses: [400, 401, 404],
        empty: true
      }, requestOptions)
    },
    vcs: {
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/vcs`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      base: (input, requestOptions) => request({
        method: "GET",
        path: `/api/vcs/base`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions),
      status: (input, requestOptions) => request({
        method: "GET",
        path: `/api/vcs/status`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      branch: {
        list: (input, requestOptions) => request({
          method: "GET",
          path: `/api/vcs/branch`,
          query: { location: input?.["location"], search: input?.["search"], limit: input?.["limit"] },
          successStatus: 200,
          declaredStatuses: [400, 401],
          empty: false
        }, requestOptions)
      },
      diff: (input, requestOptions) => request({
        method: "GET",
        path: `/api/vcs/diff`,
        query: { location: input["location"], mode: input["mode"], base: input["base"], context: input["context"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions)
    },
    debug: {
      location: {
        list: (requestOptions) => request({
          method: "GET",
          path: `/api/debug/location`,
          successStatus: 200,
          declaredStatuses: [400, 401],
          empty: false
        }, requestOptions),
        evict: (input, requestOptions) => request({
          method: "DELETE",
          path: `/api/debug/location`,
          query: { location: input?.["location"] },
          successStatus: 204,
          declaredStatuses: [400, 401],
          empty: true
        }, requestOptions)
      }
    },
    migration: {
      v1: {
        status: (requestOptions) => request({
          method: "GET",
          path: `/api/experimental/migration/v1`,
          successStatus: 200,
          declaredStatuses: [400, 401],
          empty: false
        }, requestOptions)
      }
    },
    websearch: {
      providers: (input, requestOptions) => request({
        method: "GET",
        path: `/api/websearch/provider`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions),
      query: (input, requestOptions) => request({
        method: "POST",
        path: `/api/websearch`,
        query: { location: input["location"] },
        body: { query: input["query"], providerID: input["providerID"] },
        successStatus: 200,
        declaredStatuses: [400, 401, 503],
        empty: false
      }, requestOptions)
    },
    config: {
      get: (input, requestOptions) => request({
        method: "GET",
        path: `/api/config`,
        query: { location: input?.["location"] },
        successStatus: 200,
        declaredStatuses: [400, 401],
        empty: false
      }, requestOptions),
      shells: (requestOptions) => request({ method: "GET", path: `/api/config/shell`, successStatus: 200, declaredStatuses: [400, 401], empty: false }, requestOptions),
      update: (input, requestOptions) => request({
        method: "PATCH",
        path: `/api/experimental/config`,
        body: { shell: input["shell"] },
        successStatus: 204,
        declaredStatuses: [400, 401],
        empty: true
      }, requestOptions)
    }
  };
}
function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}
function appendQuery(params, key, value) {
  if (value === void 0)
    return;
  if (value === null) {
    params.append(key, "null");
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value)
      appendQuery(params, key, item);
    return;
  }
  if (typeof value === "object") {
    for (const [child, item] of Object.entries(value))
      appendQuery(params, `${key}[${child}]`, item);
    return;
  }
  params.append(key, String(value));
}
async function json(response) {
  if (!isContentType(response, "application/json") && !response.headers.get("content-type")?.includes("+json")) {
    try {
      await response.body?.cancel();
    } catch {
    }
    throw new ClientError3("UnsupportedContentType", { detail: response.headers.get("content-type") });
  }
  let text;
  try {
    text = await response.text();
  } catch (cause) {
    throw new ClientError3("Transport", { cause });
  }
  if (text === "")
    throw new ClientError3("MalformedResponse");
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ClientError3("MalformedResponse", { cause });
  }
}
function declared(body) {
  const error = Object.assign(new Error(body.message ?? body.data?.message), body);
  if (body._tag)
    error.name = body._tag;
  return error;
}
function isContentType(response, expected) {
  return response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() === expected;
}
var exports_client4, maxSseEventBytes;
var init_contract_n8g24fq8 = __esm({
  "../../node_modules/@opencode/client/dist/chunks/contract-n8g24fq8.js"() {
    init_contract_nwcpakzx();
    init_contract_9rqn6x4v();
    exports_client4 = {};
    __export2(exports_client4, {
      make: () => make6
    });
    maxSseEventBytes = 16 * 1024 * 1024;
  }
});

// ../../node_modules/@opencode/client/dist/chunks/contract-4tveyqeh.js
var isInvalidRequestError2, isUnauthorizedError2, isServiceUnavailableError2, isAgentNotFoundError2, isInvalidCursorError2, isSessionNotFoundError2, isConflictError2, isUnknownError2, isMessageNotFoundError2, isCommandNotFoundError2, isCommandExecutionError2, isSkillNotFoundError2, isSessionBusyError2, isInstructionEntryValueTooLargeError2, isFormNotFoundError2, isFormInvalidAnswerError2, isFormAlreadySettledError2, isProviderNotFoundError2, isIntegrationNotFoundError2, isIntegrationAttemptNotFoundError2, isIntegrationMethodNotFoundError2, isMcpServerNotFoundError2, isProjectNotFoundError2, isPermissionNotFoundError2, isFileNotFoundError2, isRpcError2, isRpcInternalError2, isPtyNotFoundError2, isForbiddenError2, isShellNotFoundError2, isWorktreeError2;
var init_contract_4tveyqeh = __esm({
  "../../node_modules/@opencode/client/dist/chunks/contract-4tveyqeh.js"() {
    isInvalidRequestError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "InvalidRequestError";
    isUnauthorizedError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "UnauthorizedError";
    isServiceUnavailableError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "ServiceUnavailableError";
    isAgentNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "AgentNotFoundError";
    isInvalidCursorError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "InvalidCursorError";
    isSessionNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "SessionNotFoundError";
    isConflictError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "ConflictError";
    isUnknownError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "UnknownError";
    isMessageNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "MessageNotFoundError";
    isCommandNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "CommandNotFoundError";
    isCommandExecutionError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "CommandExecutionError";
    isSkillNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "SkillNotFoundError";
    isSessionBusyError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "SessionBusyError";
    isInstructionEntryValueTooLargeError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "InstructionEntryValueTooLargeError";
    isFormNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "FormNotFoundError";
    isFormInvalidAnswerError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "FormInvalidAnswerError";
    isFormAlreadySettledError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "FormAlreadySettledError";
    isProviderNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "ProviderNotFoundError";
    isIntegrationNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "IntegrationNotFoundError";
    isIntegrationAttemptNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "IntegrationAttemptNotFoundError";
    isIntegrationMethodNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "IntegrationMethodNotFoundError";
    isMcpServerNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "McpServerNotFoundError";
    isProjectNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "ProjectNotFoundError";
    isPermissionNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "PermissionNotFoundError";
    isFileNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "FileNotFoundError";
    isRpcError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "RpcError";
    isRpcInternalError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "RpcInternalError";
    isPtyNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "PtyNotFoundError";
    isForbiddenError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "ForbiddenError";
    isShellNotFoundError2 = (value) => typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "ShellNotFoundError";
    isWorktreeError2 = (value) => typeof value === "object" && value !== null && "name" in value && value["name"] === "WorktreeError";
  }
});

// ../../node_modules/@opencode/client/dist/chunks/contract-1tbj6z39.js
function makeRpc2(raw, events) {
  return (definition) => {
    const subscribe = (name, options) => {
      if (!Object.hasOwn(definition.events, name))
        throw new Error(`Unknown RPC event: ${definition.id}.${name}`);
      const type = eventType(definition, name);
      return {
        [Symbol.asyncIterator]() {
          const controller = new AbortController();
          const signal2 = options?.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
          const iterator = async function* () {
            try {
              for await (const published of events.subscribe({ signal: signal2 })) {
                if (signal2.aborted)
                  return;
                if (published.type !== type)
                  continue;
                yield published;
              }
            } catch (error) {
              if (!signal2.aborted)
                throw error;
            } finally {
              controller.abort();
            }
          }();
          return {
            next: () => iterator.next(),
            return: () => {
              controller.abort();
              return iterator.return();
            }
          };
        }
      };
    };
    return Object.assign(Object.fromEntries(Object.keys(definition.methods).map((name) => [
      name,
      async (input, options) => {
        try {
          const result = await raw.rpc.call({
            rpcID: definition.id,
            method: name,
            input,
            location: options?.location
          }, { signal: options?.signal, headers: options?.headers });
          return result.output;
        } catch (error) {
          if (!isRpcError2(error) && !isRpcInternalError2(error))
            throw error;
          throw error.data === void 0 ? { type: error.type, message: error.message } : { type: error.type, message: error.message, data: error.data };
        }
      }
    ])), {
      events: {
        subscribe,
        on: (name, handler, options) => {
          const controller = new AbortController();
          const signal2 = options?.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
          const source = subscribe(name, { signal: signal2 });
          (async () => {
            for await (const event of source)
              await handler(event);
          })().catch((error) => console.error(error));
          return () => controller.abort();
        }
      }
    });
  };
}
function eventType(definition, name) {
  return `rpc.${definition.id}.${name}`;
}
var init_contract_1tbj6z39 = __esm({
  "../../node_modules/@opencode/client/dist/chunks/contract-1tbj6z39.js"() {
    init_contract_4tveyqeh();
  }
});

// ../../node_modules/@opencode/client/dist/chunks/contract-hg4r8g3y.js
function make5(options) {
  const raw = make6(options);
  const events = make7((signal2, onActivity) => raw.event.subscribe({ signal: signal2, onActivity }));
  return {
    ...raw,
    rpc: Object.assign(makeRpc2(raw, events), raw.rpc),
    event: events
  };
}
var exports_client3;
var init_contract_hg4r8g3y = __esm({
  "../../node_modules/@opencode/client/dist/chunks/contract-hg4r8g3y.js"() {
    init_contract_frbwqjmf();
    init_contract_n8g24fq8();
    init_contract_1tbj6z39();
    init_contract_9rqn6x4v();
    exports_client3 = {};
    __export2(exports_client3, {
      OpenCode: () => exports_client3,
      make: () => make5
    });
  }
});

// ../../node_modules/@opencode/client/dist/promise/index.js
var promise_exports = {};
__export(promise_exports, {
  ClientError: () => ClientError3,
  OpenCode: () => exports_client3,
  isAgentNotFoundError: () => isAgentNotFoundError2,
  isCommandExecutionError: () => isCommandExecutionError2,
  isCommandNotFoundError: () => isCommandNotFoundError2,
  isConflictError: () => isConflictError2,
  isFileNotFoundError: () => isFileNotFoundError2,
  isForbiddenError: () => isForbiddenError2,
  isFormAlreadySettledError: () => isFormAlreadySettledError2,
  isFormInvalidAnswerError: () => isFormInvalidAnswerError2,
  isFormNotFoundError: () => isFormNotFoundError2,
  isInstructionEntryValueTooLargeError: () => isInstructionEntryValueTooLargeError2,
  isIntegrationAttemptNotFoundError: () => isIntegrationAttemptNotFoundError2,
  isIntegrationMethodNotFoundError: () => isIntegrationMethodNotFoundError2,
  isIntegrationNotFoundError: () => isIntegrationNotFoundError2,
  isInvalidCursorError: () => isInvalidCursorError2,
  isInvalidRequestError: () => isInvalidRequestError2,
  isMcpServerNotFoundError: () => isMcpServerNotFoundError2,
  isMessageNotFoundError: () => isMessageNotFoundError2,
  isPermissionNotFoundError: () => isPermissionNotFoundError2,
  isProjectNotFoundError: () => isProjectNotFoundError2,
  isProviderNotFoundError: () => isProviderNotFoundError2,
  isPtyNotFoundError: () => isPtyNotFoundError2,
  isRpcError: () => isRpcError2,
  isRpcInternalError: () => isRpcInternalError2,
  isServiceUnavailableError: () => isServiceUnavailableError2,
  isSessionBusyError: () => isSessionBusyError2,
  isSessionNotFoundError: () => isSessionNotFoundError2,
  isShellNotFoundError: () => isShellNotFoundError2,
  isSkillNotFoundError: () => isSkillNotFoundError2,
  isUnauthorizedError: () => isUnauthorizedError2,
  isUnknownError: () => isUnknownError2,
  isWorktreeError: () => isWorktreeError2
});
var init_promise = __esm({
  "../../node_modules/@opencode/client/dist/promise/index.js"() {
    init_contract_hg4r8g3y();
    init_contract_1tbj6z39();
    init_contract_n8g24fq8();
    init_contract_4tveyqeh();
    init_contract_nwcpakzx();
    init_contract_frbwqjmf();
  }
});

// src/extension.ts
import * as vscode5 from "vscode";
import * as fs4 from "fs";
import * as path6 from "path";

// src/opencodeClient.ts
init_promise();

// ../../node_modules/@opencode/client/dist/chunks/contract-txckps9j.js
import { spawn } from "node:child_process";
var stderrLimit = 8 * 1024;
function spawnServiceContender2(command, args, env3) {
  const child = spawn(command, args, {
    detached: true,
    stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, ...env3 }
  });
  let error;
  let closed = false;
  let stderr = Buffer.alloc(0);
  const onStderr = (chunk) => {
    const tail = chunk.subarray(-stderrLimit);
    stderr = tail.length === stderrLimit ? Buffer.from(tail) : Buffer.concat([stderr.subarray(-(stderrLimit - tail.length)), tail]);
  };
  child.stderr?.on("data", onStderr);
  if (child.stderr !== null && "unref" in child.stderr && typeof child.stderr.unref === "function")
    child.stderr.unref();
  child.once("error", (cause) => {
    error = new Error("Failed to start server", { cause });
  });
  child.once("close", () => {
    closed = true;
  });
  child.unref();
  return {
    child,
    error: () => error,
    closed: () => closed,
    stderr: () => stderr.toString("utf8").trim(),
    release: () => {
      child.stderr?.off("data", onStderr);
      child.stderr?.resume();
      stderr = Buffer.alloc(0);
    }
  };
}
function contenderFailure2(contender) {
  const error = contender.error();
  if (error !== void 0)
    return error;
  if (contender.child.exitCode !== null && contender.child.exitCode !== 0)
    return startupError(`Server process exited with code ${contender.child.exitCode}`, contender.stderr());
  if (contender.child.signalCode !== null)
    return startupError(`Server process terminated by ${contender.child.signalCode}`, contender.stderr());
  return;
}
function contenderFinished2(contender) {
  return contender.error() !== void 0 || contender.closed();
}
function startupError(message, stderr) {
  return new Error(stderr ? `${message}
${stderr}` : message);
}

// ../../node_modules/@opencode/client/dist/chunks/contract-xgnj2w4v.js
var timings = /* @__PURE__ */ new WeakMap();
var defaultEnsureTiming2 = {
  pollInterval: 25,
  requestTimeout: 2e3,
  spawnDelay: 5e3,
  maxSpawnDelay: 3e4,
  promiseTimeout: 12e4,
  stopPollInterval: 50,
  stopPollAttempts: 100
};
function ensureTiming2(options) {
  return timings.get(options) ?? defaultEnsureTiming2;
}

// ../../node_modules/@opencode/client/dist/chunks/contract-sxt88q69.js
function matchesVersion2(version, options) {
  if (options.version === void 0)
    return true;
  if (version === void 0)
    return false;
  if (typeof options.version === "function")
    return options.version(version);
  return version === options.version;
}

// ../../node_modules/@opencode/client/dist/chunks/contract-a7ekbhcb.js
init_contract_9rqn6x4v();
import { readFile, rename, rm, writeFile } from "node:fs/promises";
var exports_pty_handoff = {};
__export2(exports_pty_handoff, {
  PtyHandoff: () => exports_pty_handoff,
  clear: () => clear2,
  complete: () => complete2,
  environment: () => environment2,
  prepare: () => prepare2
});
async function prepare2(file, info, timeout) {
  const existing = await read(file);
  if (existing !== void 0 && existing.expiresAt > Date.now() && same(existing.source, info))
    return;
  const { ClientError, OpenCode } = await Promise.resolve().then(() => (init_promise(), promise_exports));
  const client = OpenCode.make({
    baseUrl: info.url,
    headers: info.password === void 0 ? void 0 : { authorization: "Basic " + Buffer.from(`opencode:${info.password}`).toString("base64") }
  });
  const missing = (error) => error instanceof ClientError && error.reason === "UnexpectedStatus" && typeof error.cause === "object" && error.cause !== null && "status" in error.cause && error.cause.status === 404;
  const result = await client.experimental.persistentPty.handoff({ signal: AbortSignal.timeout(timeout) }).then((value) => ({ value }), (cause) => ({ cause }));
  if ("cause" in result) {
    const concurrent = await read(file);
    if (concurrent !== void 0 && concurrent.expiresAt > Date.now() && same(concurrent.source, info))
      return;
    if (!missing(result.cause))
      throw new Error("Failed to prepare persistent terminals for service replacement", { cause: result.cause });
    console.warn("Background service cannot hand off persistent terminals; shutting them down before replacement");
    await client.experimental.persistentPty.shutdown({ signal: AbortSignal.timeout(timeout) }).catch((cause) => {
      if (missing(cause))
        return;
      throw new Error("Failed to shut down persistent terminals before service replacement", { cause });
    });
    await publish(file, info, null);
    return;
  }
  const body = result.value;
  if (typeof body !== "object" || body === null || !("handoff" in body))
    throw new Error("Invalid persistent terminal handoff response");
  if (body.handoff === null) {
    await publish(file, info, null);
    return;
  }
  if (!isHandoff(body.handoff) || body.handoff.expiresAt <= Date.now())
    throw new Error("Invalid or expired persistent terminal handoff");
  await publish(file, info, body.handoff);
}
async function publish(file, info, handoff) {
  const temporary = `${file}.pty-handoff.${crypto.randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify({
    source: { id: info.id, pid: info.pid, url: info.url },
    handoff,
    expiresAt: handoff?.expiresAt ?? Date.now() + 3e4
  }), { mode: 384, flag: "wx" });
  await rename(temporary, file + ".pty-handoff").finally(() => rm(temporary, { force: true }));
}
async function environment2(file, env3) {
  const record = await read(file);
  const current = await readFile(file, "utf8").then((text) => JSON.parse(text)).catch(() => {
    return;
  });
  const handoff = record !== void 0 && record.expiresAt > Date.now() && (current === void 0 || same(record.source, current)) ? record.handoff : void 0;
  return { ...env3, OPENCODE_PTY_HANDOFF: handoff == null ? void 0 : JSON.stringify(handoff) };
}
async function complete2(file, info) {
  const record = await read(file);
  if (record !== void 0 && !same(record.source, info))
    await clear2(file);
}
async function clear2(file) {
  await rm(file + ".pty-handoff", { force: true });
}
async function read(file) {
  const value = await readFile(file + ".pty-handoff", "utf8").then((text) => JSON.parse(text)).catch(() => {
    return;
  });
  if (typeof value !== "object" || value === null || !("source" in value) || !("handoff" in value))
    return;
  if (typeof value.source !== "object" || value.source === null)
    return;
  if (!("pid" in value.source) || typeof value.source.pid !== "number")
    return;
  if (!("url" in value.source) || typeof value.source.url !== "string")
    return;
  if ("id" in value.source && typeof value.source.id !== "string")
    return;
  if (value.handoff !== null && !isHandoff(value.handoff))
    return;
  if (!("expiresAt" in value) || typeof value.expiresAt !== "number" || !Number.isFinite(value.expiresAt))
    return;
  return {
    source: {
      id: "id" in value.source && typeof value.source.id === "string" ? value.source.id : void 0,
      pid: value.source.pid,
      url: value.source.url
    },
    handoff: value.handoff,
    expiresAt: value.expiresAt
  };
}
function same(left, right) {
  return left.id === right.id && left.pid === right.pid && left.url === right.url;
}
function isHandoff(value) {
  return typeof value === "object" && value !== null && "directory" in value && typeof value.directory === "string" && "instanceID" in value && typeof value.instanceID === "string" && "ticket" in value && typeof value.ticket === "string" && "expiresAt" in value && typeof value.expiresAt === "number" && Number.isFinite(value.expiresAt);
}

// ../../node_modules/@opencode/client/dist/promise/service.js
import { readFile as readFile2, rm as rm2 } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
async function discover(options = {}) {
  const found = (await registered(options.file)).service;
  if (found?.state !== "ready")
    return;
  if (!found.compatible)
    return;
  if (!matchesVersion2(found.version, options))
    return;
  return found.endpoint;
}
async function ensure(options = {}) {
  const timing = ensureTiming2(options);
  const deadline = Date.now() + timing.promiseTimeout;
  const contenders = /* @__PURE__ */ new Set();
  let timeouts;
  let announced = false;
  let lastSpawn = 0;
  let spawnDelay = timing.spawnDelay;
  const announce = (reason, previousVersion) => {
    if (announced)
      return;
    announced = true;
    options.onStart?.(reason, previousVersion);
  };
  const spawnContender = async () => {
    const [command, ...args] = options.command ?? ["opencode", "serve", "--service"];
    if (command === void 0)
      throw new Error("Missing service command");
    try {
      return spawnServiceContender2(command, args, await environment2(options.file ?? fallback(), options.env));
    } catch (cause) {
      throw new Error("Failed to start server", { cause });
    }
  };
  try {
    while (true) {
      if (Date.now() >= deadline)
        throw new Error("Timed out waiting for the background service to start");
      const registration = await registered(options.file, timing.requestTimeout);
      if (registration.timedOut && registration.info !== void 0) {
        timeouts = {
          info: registration.info,
          count: timeouts !== void 0 && same2(timeouts.info, registration.info) ? timeouts.count + 1 : 1
        };
        if (timeouts.count >= 3) {
          announce("missing");
          console.warn("Background service is unresponsive; recovery cannot preserve persistent terminals");
          await clear2(options.file ?? fallback());
          await terminate(registration.info, options, timing);
          timeouts = void 0;
          lastSpawn = Date.now() - spawnDelay;
        }
      } else
        timeouts = void 0;
      if (registration.service !== void 0) {
        spawnDelay = timing.spawnDelay;
        const service2 = registration.service;
        const compatible = service2.compatible && matchesVersion2(service2.version, options);
        if (compatible && service2.state === "ready") {
          await complete2(options.file ?? fallback(), service2.info);
          return service2.endpoint;
        }
        if (compatible && service2.state === "failed")
          throw new Error("Background service failed to start");
        if (!compatible) {
          announce("version-mismatch", service2.version);
          if (service2.state !== "ready")
            console.warn("Background service is not ready; replacement cannot preserve persistent terminals");
          await stop({
            file: options.file,
            pty: service2.state === "ready" ? "handoff" : "clear"
          }).catch(() => {
            return;
          });
          lastSpawn = 0;
        }
      } else {
        if (lastSpawn === 0 && registration.info !== void 0)
          lastSpawn = Date.now();
        const finished = [...contenders].filter(contenderFinished2);
        const failure = finished.map(contenderFailure2).find((error) => error !== void 0);
        if (finished.some((item) => item.child.exitCode === 0)) {
          spawnDelay = Math.min(spawnDelay * 2, timing.maxSpawnDelay);
        }
        finished.forEach((item) => contenders.delete(item));
        if (failure !== void 0 && contenders.size === 0)
          throw failure;
        if (contenders.size < 2 && Date.now() - lastSpawn >= spawnDelay) {
          announce("missing");
          contenders.add(await spawnContender());
          lastSpawn = Date.now();
        }
      }
      await delay(timing.pollInterval);
    }
  } finally {
    contenders.forEach((contender) => contender.release());
  }
}
async function stop(options = {}) {
  const info = await read2(options.file);
  if (options.pty === "handoff" && info !== void 0)
    await prepare2(options.file ?? fallback(), info, defaultEnsureTiming2.requestTimeout);
  else
    await clear2(options.file ?? fallback());
  if (info !== void 0)
    await terminate(info, options, defaultEnsureTiming2);
}
function fallback() {
  return join(process.env["XDG_STATE_HOME"] ?? join(homedir(), ".local", "state"), "opencode", "service.json");
}
function headers(endpoint) {
  if (endpoint.auth === void 0)
    return;
  return {
    authorization: "Basic " + Buffer.from(endpoint.auth.username + ":" + endpoint.auth.password).toString("base64")
  };
}
async function read2(file) {
  const text = await readFile2(file ?? fallback(), "utf8").catch(() => {
    return;
  });
  if (text === void 0)
    return;
  try {
    return JSON.parse(text);
  } catch {
    return;
  }
}
async function probeResult(info, timeout = defaultEnsureTiming2.requestTimeout) {
  const endpoint = {
    url: info.url,
    auth: info.password === void 0 ? void 0 : { type: "basic", username: "opencode", password: info.password }
  };
  const signal2 = AbortSignal.timeout(timeout);
  const result = await fetch(new URL("/api/info", info.url), { headers: headers(endpoint), signal: signal2 }).then(async (response2) => ({
    response: response2,
    body: response2.status === 404 ? void 0 : await response2.json()
  })).then((value) => ({ value }), (cause) => ({ cause }));
  if ("cause" in result)
    return { service: void 0, timedOut: signal2.aborted };
  const response = result.value.response;
  if (response.status === 404)
    return {
      service: {
        info,
        endpoint,
        version: info.version,
        state: "ready",
        compatible: false
      },
      timedOut: false
    };
  const serverInfo = decodeInfo(result.value.body);
  if (serverInfo !== void 0) {
    if (serverInfo.pid !== info.pid)
      return { service: void 0, timedOut: false };
    if (info.version !== void 0 && serverInfo.version !== info.version)
      return { service: void 0, timedOut: false };
    return {
      service: {
        info,
        endpoint,
        version: serverInfo.version,
        state: response.ok ? "ready" : response.status === 500 ? "failed" : "waiting",
        compatible: true
      },
      timedOut: false
    };
  }
  return { service: void 0, timedOut: false };
}
function decodeInfo(input) {
  if (typeof input !== "object" || input === null)
    return;
  if (!("version" in input) || typeof input.version !== "string")
    return;
  if (!("pid" in input) || typeof input.pid !== "number" || !Number.isInteger(input.pid) || input.pid < 0)
    return;
  return { version: input.version, pid: input.pid };
}
async function registered(file, timeout) {
  const info = await read2(file);
  if (info === void 0)
    return { info: void 0, service: void 0, timedOut: false };
  return { info, ...await probeResult(info, timeout) };
}
function signal(pid, name) {
  try {
    process.kill(pid, name);
  } catch {
  }
}
function stopped(pid) {
  try {
    process.kill(pid, 0);
    return false;
  } catch {
    return true;
  }
}
async function waitUntilStopped(pid, timing) {
  for (let attempt = 0; attempt <= timing.stopPollAttempts; attempt++) {
    if (stopped(pid))
      return true;
    if (attempt < timing.stopPollAttempts)
      await delay(timing.stopPollInterval);
  }
  return false;
}
function same2(left, right) {
  return left.id === right.id && left.version === right.version && left.url === right.url && left.pid === right.pid;
}
async function terminate(info, options, timing) {
  const current = await read2(options.file);
  if (current === void 0 || !same2(current, info))
    return;
  signal(info.pid, "SIGTERM");
  if (!await waitUntilStopped(info.pid, timing)) {
    const latest2 = await read2(options.file);
    if (latest2 === void 0 || !same2(latest2, info))
      return;
    signal(info.pid, "SIGKILL");
    if (!await waitUntilStopped(info.pid, timing))
      throw new Error(`Server process ${info.pid} is still running`);
  }
  const latest = await read2(options.file);
  if (latest === void 0 || !same2(latest, info))
    return;
  await rm2(options.file ?? fallback(), { force: true });
}
function delay(milliseconds) {
  return new Promise((resolve4) => setTimeout(resolve4, milliseconds));
}
var Service = { discover, ensure, stop, headers };

// src/messagePages.ts
var MAX_MESSAGE_PAGES = 25;
async function collectAllPages(fetchPage, maxPages = MAX_MESSAGE_PAGES) {
  const collected = [];
  const seen = /* @__PURE__ */ new Set();
  let cursor;
  for (let page = 0; page < maxPages; page++) {
    const res = await fetchPage(cursor);
    const fresh = res.data.filter((m) => !seen.has(m.id));
    if (fresh.length === 0) {
      break;
    }
    for (const m of fresh) {
      seen.add(m.id);
      collected.push(m);
    }
    const next = res.cursor?.next;
    if (!next) {
      break;
    }
    cursor = next;
  }
  return collected.reverse();
}

// src/opencodeClient.ts
import * as fs from "node:fs";
import * as path from "node:path";
var cachedClient = null;
var cachedEndpoint = null;
function resolveCliBinary() {
  const exe = process.platform === "win32" ? "opencode.exe" : "opencode";
  const candidates = [];
  const appData = process.env["APPDATA"];
  if (appData) {
    candidates.push(path.join(appData, "npm", "node_modules", "@opencode", "cli", "bin", exe));
  }
  const home = process.env["HOME"] || process.env["USERPROFILE"];
  if (home) {
    candidates.push(path.join(home, ".opencode", "bin", exe));
    if (process.platform !== "win32") {
      candidates.push(path.join(home, ".npm-global", "bin", exe));
    }
  }
  if (process.platform === "darwin") {
    candidates.push("/opt/homebrew/bin/opencode", "/usr/local/bin/opencode");
  }
  if (process.platform === "linux") {
    candidates.push("/usr/local/bin/opencode");
  }
  for (const abs of candidates) {
    try {
      if (fs.existsSync(abs)) {
        return abs;
      }
    } catch {
    }
  }
  return "opencode";
}
var CONNECT_TIMEOUT_MS = 15e3;
var ENSURE_TIMEOUT_MS = 12e4;
var CALL_TIMEOUT_MS = 3e4;
var SESSION_LIST_LIMIT = 50;
var MESSAGE_LIST_LIMIT = 200;
var FILE_FIND_LIMIT = 15;
var ATTACH_MAX_BYTES = 5e6;
function normalizeDir(dir) {
  return dir.replace(/^[a-z](?=:)/, (c) => c.toUpperCase());
}
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
async function ensureClient() {
  if (cachedClient && cachedEndpoint) {
    return { client: cachedClient, endpoint: cachedEndpoint };
  }
  const endpoint = await withTimeout(
    Service.ensure({
      version: (v) => v.startsWith("2."),
      command: [resolveCliBinary(), "serve", "--service"]
    }),
    ENSURE_TIMEOUT_MS,
    "Service.ensure"
  );
  const client = exports_client3.make({ baseUrl: endpoint.url, headers: Service.headers(endpoint) });
  cachedClient = client;
  cachedEndpoint = endpoint;
  return { client, endpoint };
}
async function getServerStatus() {
  let endpoint;
  try {
    ({ endpoint } = await ensureClient());
  } catch (err) {
    cachedClient = null;
    cachedEndpoint = null;
    const reason = err instanceof Error ? err.message : String(err);
    return { status: "offline", detail: `OpenCode service unreachable: ${reason}` };
  }
  try {
    const { client } = await ensureClient();
    const info = await withTimeout(client.server.info(), CONNECT_TIMEOUT_MS, "server.info");
    return {
      status: "online",
      detail: `Connected to OpenCode v${info.version} at ${endpoint.url}`,
      version: info.version,
      url: endpoint.url
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { status: "offline", detail: `OpenCode service unreachable: ${reason}` };
  }
}
function disposeClient() {
  cachedClient = null;
  cachedEndpoint = null;
}
async function restartService() {
  disposeClient();
  await withTimeout(Service.stop(), CONNECT_TIMEOUT_MS, "Service.stop");
  const { client, endpoint } = await ensureClient();
  const info = await withTimeout(client.server.info(), CONNECT_TIMEOUT_MS, "server.info");
  return { version: info.version, url: endpoint.url };
}
async function listSessions(directory) {
  directory = normalizeDir(directory);
  const { client } = await ensureClient();
  const res = await withTimeout(
    client.session.list({ directory, order: "desc", limit: SESSION_LIST_LIMIT }),
    CALL_TIMEOUT_MS,
    "session.list"
  );
  return res.data;
}
async function createSession(directory, title, model) {
  directory = normalizeDir(directory);
  const { client } = await ensureClient();
  return withTimeout(
    client.session.create(
      model ? { location: { directory }, title: title ?? null, model } : { location: { directory }, title: title ?? null }
    ),
    CALL_TIMEOUT_MS,
    "session.create"
  );
}
async function removeSession(sessionID) {
  const { client } = await ensureClient();
  await withTimeout(client.session.remove({ sessionID }), CALL_TIMEOUT_MS, "session.remove");
}
async function renameSession(sessionID, title) {
  const { client } = await ensureClient();
  await withTimeout(client.session.update({ sessionID, title }), CALL_TIMEOUT_MS, "session.update");
}
async function listMessages(sessionID, opts = {}) {
  const { client } = await ensureClient();
  const fetchPage = (cursor) => withTimeout(
    client.message.list(
      // `cursor` must never travel with `order`: the server answers
      // 400 InvalidCursorError and the history load dies on page two.
      // The cursor carries its own order — its payload is base64
      // {"id":"<boundary>","order":"desc","direction":"next"} — so only the
      // first request states it.
      cursor ? { sessionID, limit: MESSAGE_LIST_LIMIT, cursor } : { sessionID, order: "desc", limit: MESSAGE_LIST_LIMIT }
    ),
    CALL_TIMEOUT_MS,
    "message.list"
  );
  if (opts.full) {
    return collectAllPages(fetchPage);
  }
  const res = await fetchPage();
  return res.data.reverse();
}
async function firstUserMessage(sessionID) {
  const { client } = await ensureClient();
  const res = await withTimeout(
    client.message.list({ sessionID, order: "asc", limit: 1, type: "user" }),
    CALL_TIMEOUT_MS,
    "message.list(first)"
  );
  return res.data[0];
}
async function sendPrompt(sessionID, text, files) {
  const { client } = await ensureClient();
  await withTimeout(
    client.session.prompt(files && files.length > 0 ? { sessionID, text, files } : { sessionID, text }),
    CALL_TIMEOUT_MS,
    "session.prompt"
  );
}
async function interruptSession(sessionID) {
  const { client } = await ensureClient();
  await withTimeout(client.session.interrupt({ sessionID }), CALL_TIMEOUT_MS, "session.interrupt");
}
async function compactSession(sessionID) {
  const { client } = await ensureClient();
  await withTimeout(client.session.compact({ sessionID }), CALL_TIMEOUT_MS, "session.compact");
}
async function listPermissions(sessionID) {
  const { client } = await ensureClient();
  return withTimeout(client.permission.list({ sessionID }), CALL_TIMEOUT_MS, "permission.list");
}
async function replyPermission(sessionID, requestID, decision) {
  const { client } = await ensureClient();
  await withTimeout(
    client.permission.reply({ sessionID, requestID, decision }),
    CALL_TIMEOUT_MS,
    "permission.reply"
  );
}
async function listForms(sessionID) {
  const { client } = await ensureClient();
  return withTimeout(client.session.form.list({ sessionID }), CALL_TIMEOUT_MS, "form.list");
}
async function replyForm(sessionID, formID, answer) {
  const { client } = await ensureClient();
  await withTimeout(
    client.session.form.reply({ sessionID, formID, answer }),
    CALL_TIMEOUT_MS,
    "form.reply"
  );
}
async function cancelForm(sessionID, formID) {
  const { client } = await ensureClient();
  await withTimeout(
    client.session.form.cancel({ sessionID, formID }),
    CALL_TIMEOUT_MS,
    "form.cancel"
  );
}
function loc(directory) {
  return directory ? { directory: normalizeDir(directory) } : void 0;
}
async function listIntegrations(directory) {
  const { client } = await ensureClient();
  const l = loc(directory);
  const res = await withTimeout(
    client.integration.list(l ? { location: l } : void 0),
    CALL_TIMEOUT_MS,
    "integration.list"
  );
  return res.data;
}
async function connectKey(input) {
  const { client } = await ensureClient();
  await withTimeout(
    client.integration.connect.key({
      integrationID: input.integrationID,
      key: input.key,
      ...input.answer ? { answer: input.answer } : {},
      ...input.label ? { label: input.label } : {},
      ...input.directory ? { location: { directory: normalizeDir(input.directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.connect.key"
  );
}
async function oauthConnect(input) {
  const { client } = await ensureClient();
  const res = await withTimeout(
    client.integration.oauth.connect({
      integrationID: input.integrationID,
      methodID: input.methodID,
      ...input.answer ? { answer: input.answer } : {},
      ...input.label ? { label: input.label } : {},
      ...input.directory ? { location: { directory: normalizeDir(input.directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.oauth.connect"
  );
  return res.data;
}
async function oauthStatus(integrationID, attemptID, directory) {
  const { client } = await ensureClient();
  const res = await withTimeout(
    client.integration.oauth.status({
      integrationID,
      attemptID,
      ...directory ? { location: { directory: normalizeDir(directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.oauth.status"
  );
  return res.data;
}
async function oauthComplete(integrationID, attemptID, code, directory) {
  const { client } = await ensureClient();
  await withTimeout(
    client.integration.oauth.complete({
      integrationID,
      attemptID,
      ...code ? { code } : {},
      ...directory ? { location: { directory: normalizeDir(directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.oauth.complete"
  );
}
async function oauthCancel(integrationID, attemptID, directory) {
  const { client } = await ensureClient();
  await withTimeout(
    client.integration.oauth.cancel({
      integrationID,
      attemptID,
      ...directory ? { location: { directory: normalizeDir(directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.oauth.cancel"
  );
}
async function removeCredential(credentialID) {
  const { client } = await ensureClient();
  await withTimeout(
    client.credential.remove({ credentialID }),
    CALL_TIMEOUT_MS,
    "credential.remove"
  );
}
async function activateCredential(credentialID) {
  const { client } = await ensureClient();
  await withTimeout(
    client.credential.activate({ credentialID }),
    CALL_TIMEOUT_MS,
    "credential.activate"
  );
}
async function renameCredential(credentialID, label) {
  const { client } = await ensureClient();
  await withTimeout(
    client.credential.update({ credentialID, label }),
    CALL_TIMEOUT_MS,
    "credential.update"
  );
}
async function commandConnect(integrationID, methodID, label, directory) {
  const { client } = await ensureClient();
  const res = await withTimeout(
    client.integration.command.connect({
      integrationID,
      methodID,
      ...label ? { label } : {},
      ...directory ? { location: { directory: normalizeDir(directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.command.connect"
  );
  return res.data;
}
async function commandStatus(integrationID, attemptID, directory) {
  const { client } = await ensureClient();
  const res = await withTimeout(
    client.integration.command.status({
      integrationID,
      attemptID,
      ...directory ? { location: { directory: normalizeDir(directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.command.status"
  );
  return res.data;
}
async function commandCancel(integrationID, attemptID, directory) {
  const { client } = await ensureClient();
  await withTimeout(
    client.integration.command.cancel({
      integrationID,
      attemptID,
      ...directory ? { location: { directory: normalizeDir(directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.command.cancel"
  );
}
async function wellknownAdd(url, directory) {
  const { client } = await ensureClient();
  await withTimeout(
    client.integration.wellknown.add({
      url,
      ...directory ? { location: { directory: normalizeDir(directory) } } : {}
    }),
    CALL_TIMEOUT_MS,
    "integration.wellknown.add"
  );
}
async function getSessionDiff(sessionID) {
  const { client } = await ensureClient();
  return withTimeout(client.session.diff({ sessionID }), CALL_TIMEOUT_MS, "session.diff");
}
async function stageRevert(sessionID, messageID) {
  const { client } = await ensureClient();
  return withTimeout(
    client.session.revert.stage({ sessionID, messageID, files: true }),
    CALL_TIMEOUT_MS,
    "revert.stage"
  );
}
async function commitRevert(sessionID) {
  const { client } = await ensureClient();
  await withTimeout(client.session.revert.commit({ sessionID }), CALL_TIMEOUT_MS, "revert.commit");
}
async function getSession(sessionID) {
  const { client } = await ensureClient();
  return withTimeout(client.session.get({ sessionID }), CALL_TIMEOUT_MS, "session.get");
}
async function listModels() {
  const { client } = await ensureClient();
  const res = await withTimeout(client.model.list(), CALL_TIMEOUT_MS, "model.list");
  return res.data;
}
async function getDefaultModel() {
  const { client } = await ensureClient();
  const res = await withTimeout(client.model.default(), CALL_TIMEOUT_MS, "model.default");
  return res.data;
}
async function listAgents() {
  const { client } = await ensureClient();
  const res = await withTimeout(client.agent.list(), CALL_TIMEOUT_MS, "agent.list");
  return res.data;
}
async function switchSessionModel(sessionID, providerID, id) {
  const { client } = await ensureClient();
  await withTimeout(
    client.session.switchModel({ sessionID, model: { providerID, id } }),
    CALL_TIMEOUT_MS,
    "session.switchModel"
  );
}
async function switchSessionAgent(sessionID, agent) {
  const { client } = await ensureClient();
  await withTimeout(client.session.switchAgent({ sessionID, agent }), CALL_TIMEOUT_MS, "session.switchAgent");
}
async function findFiles(directory, query) {
  directory = normalizeDir(directory);
  const { client } = await ensureClient();
  const res = await withTimeout(
    client.file.find({ query, limit: FILE_FIND_LIMIT, location: { directory } }),
    CALL_TIMEOUT_MS,
    "file.find"
  );
  return res.data;
}
var ATTACH_DIR = ".opencode-gui/attachments";
var ATTACH_MAX_AGE_MS = 30 * 24 * 3600 * 1e3;
var ATTACH_MAX_TOTAL_BYTES = 200 * 1024 * 1024;
async function pruneAttachments(directory, now = Date.now(), opts = {}) {
  const dir = path.join(normalizeDir(directory), ATTACH_DIR);
  let entries;
  try {
    entries = await fs.promises.readdir(dir);
  } catch (err) {
    if (err?.code === "ENOENT") {
      return { deleted: 0, freedBytes: 0 };
    }
    throw err;
  }
  const maxAgeMs = opts.maxAgeMs ?? ATTACH_MAX_AGE_MS;
  const maxTotalBytes = opts.maxTotalBytes ?? ATTACH_MAX_TOTAL_BYTES;
  const files = [];
  for (const name of entries) {
    try {
      const st = await fs.promises.stat(path.join(dir, name));
      if (st.isFile()) {
        files.push({ name, size: st.size, mtime: st.mtimeMs });
      }
    } catch {
    }
  }
  const victims = files.filter((f) => now - f.mtime > maxAgeMs);
  const fresh = files.filter((f) => now - f.mtime <= maxAgeMs).sort((a, b) => a.mtime - b.mtime);
  let total = fresh.reduce((sum, f) => sum + f.size, 0);
  for (const f of fresh) {
    if (total <= maxTotalBytes) {
      break;
    }
    victims.push(f);
    total -= f.size;
  }
  let deleted = 0;
  let freedBytes = 0;
  for (const f of victims) {
    try {
      await fs.promises.unlink(path.join(dir, f.name));
      deleted++;
      freedBytes += f.size;
    } catch {
    }
  }
  return { deleted, freedBytes };
}
function attachmentExt(mime) {
  if (mime === "image/png") {
    return "png";
  }
  if (mime === "image/jpeg") {
    return "jpg";
  }
  if (mime === "image/webp") {
    return "webp";
  }
  if (mime === "image/gif") {
    return "gif";
  }
  if (mime === "image/bmp") {
    return "bmp";
  }
  return "bin";
}
function sniffImageMime(head) {
  if (head[0] === 137 && head[1] === 80 && head[2] === 78 && head[3] === 71) {
    return "image/png";
  }
  if (head[0] === 255 && head[1] === 216 && head[2] === 255) {
    return "image/jpeg";
  }
  if (head[0] === 71 && head[1] === 73 && head[2] === 70) {
    return "image/gif";
  }
  if (head[0] === 82 && head[1] === 73 && head[2] === 70 && head[3] === 70) {
    return "image/webp";
  }
  if (head[0] === 66 && head[1] === 77) {
    return "image/bmp";
  }
  return void 0;
}
async function saveAttachment(directory, base64, mime) {
  directory = normalizeDir(directory);
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > ATTACH_MAX_BYTES) {
    throw new Error("\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u0430\u044F (\u0431\u043E\u043B\u044C\u0448\u0435 ~5 \u041C\u0411).");
  }
  let resolved = mime;
  if (!resolved.startsWith("image/")) {
    resolved = sniffImageMime(bytes) ?? "";
  }
  if (!resolved.startsWith("image/")) {
    throw new Error("\u0412 \u0431\u0443\u0444\u0435\u0440\u0435 \u043D\u0435\u0442 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0438 \u2014 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439 \u0438\u043C\u0435\u043D\u043D\u043E \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435.");
  }
  const dir = path.join(directory, ATTACH_DIR);
  await fs.promises.mkdir(dir, { recursive: true });
  const name = `clip-${Date.now().toString(36)}-${Math.floor(Math.random() * 65535).toString(16)}.${attachmentExt(resolved)}`;
  const abs = path.join(dir, name);
  await fs.promises.writeFile(abs, bytes);
  return { path: abs, uri: toFileUri(abs), name };
}
function toFileUri(absPath) {
  const forward = absPath.replace(/\\/g, "/");
  const withSlash = forward.startsWith("/") ? forward : `/${forward}`;
  const encoded = withSlash.split("/").map((seg, i) => i === 1 && /^[A-Za-z]:$/.test(seg) ? seg : encodeURIComponent(seg)).join("/");
  return `file://${encoded}`;
}
function sleep(ms) {
  return new Promise((resolve4) => setTimeout(resolve4, ms));
}
function startEventStream(onEvent, onError) {
  let stopped2 = false;
  let failures = 0;
  const loop = async () => {
    while (!stopped2) {
      try {
        const { client } = await ensureClient();
        failures = 0;
        for await (const event of client.event.subscribe()) {
          if (stopped2) {
            break;
          }
          try {
            onEvent(event);
          } catch (err) {
            try {
              onError?.(err, "eventHandler", failures);
            } catch {
            }
          }
        }
      } catch (err) {
        failures += 1;
        if (failures === 1 || failures % 10 === 0) {
          try {
            onError?.(err, "eventStream", failures);
          } catch {
          }
        }
      }
      if (stopped2) {
        break;
      }
      if (failures === 0) {
        failures = 1;
      }
      await sleep(Math.min(1e3 * failures, 1e4));
    }
  };
  void loop();
  return () => {
    stopped2 = true;
  };
}

// src/protocol.ts
function tokensToView(t) {
  return {
    input: t.input,
    output: t.output,
    reasoning: t.reasoning,
    cacheRead: t.cache?.read ?? 0,
    cacheWrite: t.cache?.write ?? 0
  };
}
var USER_FILE_SRC_MAX_CHARS = 4e6;
function formToView(f) {
  return {
    id: f.id,
    sessionID: f.sessionID,
    title: f.title,
    fields: f.fields.map((fld) => ({
      key: fld.key,
      type: fld.type,
      title: fld.title,
      description: fld.description,
      required: fld.required,
      placeholder: fld.placeholder,
      default: fld.default,
      options: fld.options,
      custom: fld.custom
    }))
  };
}
function integrationToView(i) {
  return {
    id: i.id,
    name: i.name,
    methods: i.methods.map((m) => ({
      kind: m.type,
      id: m.id,
      label: m.label ?? (m.command ? m.command.join(" ") : void 0) ?? m.names?.join(", "),
      form: m.form?.map((fld) => ({
        key: fld.key,
        type: fld.type,
        title: fld.title,
        description: fld.description,
        required: fld.required,
        placeholder: fld.placeholder,
        default: fld.default,
        options: fld.options,
        custom: fld.custom
      }))
    })),
    connections: i.connections.map((c) => ({
      kind: c.type,
      id: c.id,
      label: c.label,
      method: c.method,
      name: c.name
    }))
  };
}
function permissionToView(p) {
  return { id: p.id, sessionID: p.sessionID, action: p.action, resources: p.resources, message: p.message };
}
function modelToView(m) {
  const free = (m.cost ?? []).every((c) => (c.input ?? 0) === 0 && (c.output ?? 0) === 0);
  return {
    id: m.id,
    providerID: m.providerID,
    name: m.name || m.id,
    free,
    limitContext: m.limit?.context,
    limitInput: m.limit?.input,
    limitOutput: m.limit?.output,
    inputs: m.capabilities?.input ?? [],
    outputs: m.capabilities?.output ?? [],
    parameterCount: declaredParameterCount(m.name),
    compaction: m.settings?.compaction?.type,
    enabled: m.enabled !== false,
    tools: m.capabilities?.tools !== false
  };
}
function declaredParameterCount(name) {
  const match = /(?:^|\s)(\d+(?:\.\d+)?)\s*([bm])(?:\b|$)/i.exec(name);
  return match ? `${match[1]}${match[2].toUpperCase()}` : void 0;
}
function sessionToView(s) {
  const tokens = s.tokens ? s.tokens.input + s.tokens.output : void 0;
  return {
    id: s.id,
    label: s.title ?? s.id.slice(0, 8),
    updated: s.time.updated,
    model: s.model ? `${s.model.providerID}/${s.model.id}` : void 0,
    title: s.title,
    tokensTotal: tokens
  };
}
function summarizeToolInput(input) {
  const pick = (v) => {
    if (typeof v === "string" && v.trim()) {
      return v.trim().replace(/\s+/g, " ").slice(0, 120);
    }
    return void 0;
  };
  for (const key of ["command", "script", "code", "file", "filePath", "path", "pattern", "query", "url", "text"]) {
    const s = pick(input[key]);
    if (s) {
      return s;
    }
  }
  for (const v of Object.values(input)) {
    const s = pick(v);
    if (s) {
      return s;
    }
  }
  try {
    return JSON.stringify(input).slice(0, 120);
  } catch {
    return "";
  }
}
function toolDurationMs(part) {
  const end = part.time.completed ?? part.time.ran;
  if (end === void 0) {
    return void 0;
  }
  const ms = end - part.time.created;
  return ms >= 0 ? ms : void 0;
}
function userFilesToView(files) {
  if (!Array.isArray(files)) {
    return [];
  }
  const views = [];
  for (const f of files) {
    if (!f || typeof f !== "object") {
      continue;
    }
    const name = typeof f.name === "string" && f.name ? f.name : "file";
    const mime = typeof f.mime === "string" ? f.mime : void 0;
    const view = { name, ...mime ? { mime } : {} };
    if (mime?.startsWith("image/") && typeof f.data === "string" && f.data.length <= USER_FILE_SRC_MAX_CHARS) {
      view.src = `data:${mime};base64,${f.data}`;
    }
    const src = f.source;
    if (src && typeof src === "object" && src.type === "uri" && typeof src.uri === "string" && src.uri.startsWith("file://")) {
      view.uri = src.uri;
    }
    views.push(view);
  }
  return views;
}
var PREVIEWABLE_MEDIA_MIME = /^(?:image\/(?:png|jpeg|gif|webp|avif)|video\/(?:mp4|webm|ogg))$/i;
function trustedMediaUrl(uri) {
  if (typeof uri !== "string") {
    return void 0;
  }
  try {
    const url = new URL(uri);
    return url.protocol === "https:" && url.hostname === "media.pollinations.ai" ? uri : void 0;
  } catch {
    return void 0;
  }
}
function toolMediaToView(parts) {
  const media = [];
  for (const part of parts) {
    if (part.type !== "tool" || !part.state || typeof part.state !== "object") {
      continue;
    }
    const content = part.state.content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const item of content) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const file = item;
      const src = file.type === "file" ? trustedMediaUrl(file.uri) : void 0;
      if (!src || typeof file.mime !== "string" || !PREVIEWABLE_MEDIA_MIME.test(file.mime)) {
        continue;
      }
      media.push({
        name: typeof file.name === "string" && file.name ? file.name : "generated media",
        mime: file.mime,
        src
      });
    }
  }
  return media;
}
function messageToView(msg) {
  if (msg.type === "user") {
    return {
      id: msg.id,
      role: "user",
      text: msg.text,
      time: msg.time.created,
      tools: [],
      reasoning: [],
      files: userFilesToView(msg.files)
    };
  }
  if (msg.type === "assistant") {
    const text = msg.content.filter((p) => p.type === "text").map((p) => p.text).join("\n\n");
    const reasoning = msg.content.filter((p) => p.type === "reasoning").map((p) => {
      const ms = p.time?.completed !== void 0 && p.time?.created !== void 0 ? Math.max(0, p.time.completed - p.time.created) : void 0;
      return { text: p.text, durationMs: ms };
    });
    const tools = msg.content.filter((p) => p.type === "tool").map((p) => {
      const st = p.state;
      return {
        id: p.id,
        name: p.name,
        status: st.status,
        durationMs: toolDurationMs(p),
        preview: st.input ? summarizeToolInput(st.input) : void 0
      };
    });
    return {
      id: msg.id,
      role: "assistant",
      text,
      time: msg.time.created,
      tools,
      reasoning,
      files: [],
      media: toolMediaToView(msg.content),
      // Server usage for THIS step only (the session aggregate lives on SessionView).
      tokens: msg.tokens ? tokensToView(msg.tokens) : void 0,
      // The step's own model, so a mid-dialog switch does not rewrite history.
      model: modelRefToView(msg.model)
    };
  }
  return null;
}
function countCompactions(messages) {
  return messages.filter((m) => m.type === "compaction").length;
}
function modelRefToView(m) {
  if (!m || typeof m.id !== "string" || typeof m.providerID !== "string") {
    return void 0;
  }
  return { providerID: m.providerID, id: m.id };
}

// src/constants.ts
var VIEW_ID = "opencode-gui.chatView";
var ATTENTION_POLL_MS = 2e4;
var ATTENTION_MAX_SESSIONS = 15;
var PREVIEW_MAX_SESSIONS = 20;
var PREVIEW_MAX_CHARS = 60;
var SELECTION_MAX_CHARS = 4e3;
var ATTACH_MAX_BASE64_CHARS = 7e6;

// src/util.ts
function formatError(err) {
  return err instanceof Error ? err.message : String(err);
}
function sleepMs(ms) {
  return new Promise((resolve4) => setTimeout(resolve4, ms));
}

// src/diag.ts
var diagStorage;
var diagQueue = [];
var diagWriting = false;
var diagTrimmed = false;
function setDiagStorage(storageUri) {
  diagStorage = storageUri;
}
function diagLine(dir, msg) {
  const t = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
  let summary = "?";
  try {
    const m = msg;
    const raw = msg;
    if (raw && (typeof raw["key"] === "string" || typeof raw["code"] === "string" || typeof raw["answer"] === "object")) {
      return `${t} ${dir} ${m.type ?? "?"} [secret redacted]`;
    }
    const parts = [m.type ?? "?"];
    if (typeof m.sessionID === "string") {
      parts.push(m.sessionID.slice(0, 12));
    }
    if (typeof m.requestID === "string") {
      parts.push(m.requestID.slice(0, 12));
    }
    if (typeof m.state === "string") {
      parts.push(m.state);
    }
    if (typeof m.decision === "string") {
      parts.push(m.decision);
    }
    if (typeof m.text === "string") {
      parts.push(`text[${m.text.length}]`);
    }
    if (Array.isArray(raw["messages"])) {
      parts.push(`n=${raw["messages"].length}`);
    }
    summary = parts.join(" ");
  } catch {
  }
  return `${t} ${dir} ${summary}`;
}
async function diagFlush() {
  if (diagWriting || !diagStorage || diagQueue.length === 0) {
    return;
  }
  diagWriting = true;
  try {
    const fs5 = await import("node:fs");
    const path7 = await import("node:path");
    const dir = diagStorage.fsPath;
    fs5.mkdirSync(dir, { recursive: true });
    const file = path7.join(dir, "opencode-gui-diag.log");
    if (!diagTrimmed) {
      diagTrimmed = true;
      try {
        const st = fs5.statSync(file);
        if (st.size > 3e5) {
          const lines = fs5.readFileSync(file, "utf8").split("\n");
          fs5.writeFileSync(file, lines.slice(-1500).join("\n"));
        }
      } catch {
      }
    }
    const batch = diagQueue.splice(0, diagQueue.length);
    fs5.appendFileSync(file, batch.join("\n") + "\n");
  } catch {
  } finally {
    diagWriting = false;
    if (diagQueue.length > 0) {
      void diagFlush();
    }
  }
}
function diag(dir, msg) {
  if (!diagStorage) {
    return;
  }
  diagQueue.push(diagLine(dir, msg));
  if (diagQueue.length > 200) {
    diagQueue.splice(0, diagQueue.length - 200);
  }
  void diagFlush();
}
function diagError(tag, err) {
  if (!diagStorage) {
    return;
  }
  const t = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
  const what = err instanceof Error ? err.message : String(err);
  diagQueue.push(`${t} ! ${tag}: ${what.replace(/\s+/g, " ").slice(0, 160)}`);
  if (diagQueue.length > 200) {
    diagQueue.splice(0, diagQueue.length - 200);
  }
  void diagFlush();
}

// src/eventRouter.ts
function routeEvent(provider, event) {
  const current = provider.currentSessionID;
  switch (event.type) {
    case "session.text.started":
      if (event.data.sessionID === current) {
        provider.post({ type: "textStarted", assistantMessageID: event.data.assistantMessageID });
        provider.post({ type: "execution", state: "started", sessionID: event.data.sessionID });
      }
      break;
    case "session.text.delta":
      if (event.data.sessionID === current) {
        provider.post({
          type: "textDelta",
          assistantMessageID: event.data.assistantMessageID,
          delta: event.data.delta
        });
      }
      break;
    case "session.text.ended":
      if (event.data.sessionID === current) {
        void provider.refreshCurrent();
        void provider.refreshSessions();
      }
      break;
    case "session.reasoning.started":
      if (event.data.sessionID === current) {
        provider.post({
          type: "reasoningStarted",
          assistantMessageID: event.data.assistantMessageID,
          ordinal: event.data.ordinal
        });
      }
      break;
    case "session.reasoning.delta":
      if (event.data.sessionID === current) {
        provider.post({
          type: "reasoningDelta",
          assistantMessageID: event.data.assistantMessageID,
          ordinal: event.data.ordinal,
          delta: event.data.delta
        });
      }
      break;
    case "session.reasoning.ended":
      if (event.data.sessionID === current) {
        provider.post({
          type: "reasoningEnded",
          assistantMessageID: event.data.assistantMessageID,
          ordinal: event.data.ordinal
        });
        void provider.refreshCurrent();
      }
      break;
    case "session.tool.called":
      if (event.data.sessionID === current) {
        const raw = event.data;
        provider.post({
          type: "toolCalled",
          assistantMessageID: raw.assistantMessageID,
          callID: raw.id,
          name: raw.name ?? raw.tool ?? "tool",
          preview: summarizeToolInput(raw.input ?? {})
        });
      }
      break;
    case "session.tool.success":
    case "session.tool.failed": {
      if (event.data.sessionID === current) {
        const data = event.data;
        const base = {
          type: "toolDone",
          assistantMessageID: event.data.assistantMessageID,
          callID: event.data.id,
          status: event.type === "session.tool.success" ? "completed" : "error"
        };
        if (event.type === "session.tool.failed" && data.error !== void 0) {
          provider.post({ ...base, error: data.error });
        } else {
          provider.post(base);
        }
      }
      break;
    }
    case "session.execution.started":
      provider.post({ type: "execution", state: "started", sessionID: event.data.sessionID });
      break;
    case "session.execution.succeeded":
    case "session.execution.failed":
    case "session.execution.interrupted": {
      const state = event.type === "session.execution.succeeded" ? "succeeded" : event.type === "session.execution.failed" ? "failed" : "interrupted";
      const execMsg = {
        type: "execution",
        state,
        sessionID: event.data.sessionID
      };
      if (state === "failed") {
        const data = event.data;
        if (data.error !== void 0) {
          execMsg.error = data.error;
        }
      }
      provider.post(execMsg);
      if (event.data.sessionID === current) {
        void provider.refreshCurrent();
      }
      void provider.refreshSessions();
      break;
    }
    case "session.idle":
      provider.post({ type: "execution", state: "succeeded", sessionID: event.data.sessionID });
      if (event.data.sessionID === current) {
        void provider.refreshCurrent();
      }
      void provider.refreshSessions();
      break;
    case "session.created":
    case "session.deleted":
      void provider.refreshSessions();
      break;
    case "permission.asked":
      provider.post({ type: "permissionAsked", permission: permissionToView(event.data) });
      break;
    case "permission.replied":
      provider.post({
        type: "permissionReplied",
        requestID: event.data.requestID,
        reply: event.data.reply,
        sessionID: event.data.sessionID
      });
      if (event.data.sessionID === current) {
        void provider.refreshPermissions();
      }
      break;
    case "form.created": {
      const form = event.data.form;
      if (form) {
        provider.post({ type: "formAsked", form: formToView(form) });
      }
      break;
    }
    case "form.replied":
    case "form.cancelled": {
      const data = event.data;
      provider.post({
        type: "formSettled",
        formID: data.id,
        sessionID: data.sessionID,
        cancelled: event.type === "form.cancelled"
      });
      if (data.sessionID === current) {
        void provider.refreshForms();
      }
      break;
    }
    case "credential.updated":
    case "credential.switched":
    case "integration.updated":
    case "provider.updated":
    case "model.updated":
    case "models-dev.refreshed":
      void provider.refreshAuthCatalogs();
      break;
    default:
      break;
  }
}

// src/historyGate.ts
function historySignature(snapshot) {
  return `${snapshot.compactions}\0${JSON.stringify(snapshot.views)}`;
}
var HistoryPostGate = class {
  last;
  /** Records the snapshot and reports whether it differs from the last one. */
  accept(snapshot) {
    const signature = historySignature(snapshot);
    const same3 = this.last !== void 0 && this.last.sessionID === snapshot.sessionID && this.last.signature === signature;
    this.last = { sessionID: snapshot.sessionID, signature };
    return !same3;
  }
  /**
   * Forgets the last post. Call when the receiving webview is (re)created: its
   * feed is empty again, so nothing may be treated as "already sent".
   */
  reset() {
    this.last = void 0;
  }
};

// src/sessionDiff.ts
function restoreOriginalFromPatch(current, patch) {
  const newline = current.includes("\r\n") ? "\r\n" : "\n";
  const currentLines = current.replace(/\r\n/g, "\n").split("\n");
  const hasFinalNewline = currentLines.at(-1) === "";
  if (hasFinalNewline) {
    currentLines.pop();
  }
  const output = [];
  let cursor = 0;
  let foundHunk = false;
  const lines = patch.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const header = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(lines[i]);
    if (!header) {
      continue;
    }
    foundHunk = true;
    const newStart = Number(header[1]);
    const before = Math.max(0, newStart - 1);
    output.push(...currentLines.slice(cursor, before));
    cursor = before;
    i += 1;
    for (; i < lines.length && !lines[i].startsWith("@@ "); i += 1) {
      const line = lines[i];
      if (line.startsWith("\\")) {
        continue;
      }
      const kind = line[0];
      const text = line.slice(1);
      if (kind === "+") {
        cursor += 1;
      } else if (kind === "-") {
        output.push(text);
      } else if (kind === " ") {
        output.push(text);
        cursor += 1;
      }
    }
    i -= 1;
  }
  if (!foundHunk) {
    return current;
  }
  output.push(...currentLines.slice(cursor));
  return output.join(newline) + (hasFinalNewline ? newline : "");
}

// src/attemptPoll.ts
async function pollAttemptLoop(opts) {
  for (let i = 0; i < opts.maxRounds && opts.isCurrent(); i++) {
    await sleepMs(opts.intervalMs);
    if (!opts.isCurrent()) {
      return void 0;
    }
    const st = await opts.fetchStatus();
    if (st.status === "complete" || st.status === "failed" || st.status === "expired") {
      return st;
    }
    opts.onProgress?.(st);
  }
  return void 0;
}

// src/validate.ts
import * as path2 from "path";
var URL_MAX_LEN = 2048;
var KEY_MAX_LEN = 2e4;
var LABEL_MAX_LEN = 200;
var TEXT_MAX_LEN = 2e5;
var LINE_MAX = 1e7;
function isSafeExternalUrl(url) {
  if (typeof url !== "string" || !url || url.length > URL_MAX_LEN) {
    return false;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") {
    return false;
  }
  if (parsed.username || parsed.password) {
    return false;
  }
  return true;
}
function isSafeFormAnswer(answer) {
  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) {
    return false;
  }
  for (const v of Object.values(answer)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      continue;
    }
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      continue;
    }
    return false;
  }
  return true;
}
function isOptionalFormAnswer(answer) {
  return answer === void 0 || isSafeFormAnswer(answer);
}
function cleanKey(key) {
  if (typeof key !== "string") {
    return void 0;
  }
  const trimmed = key.trim();
  if (!trimmed || trimmed.length > KEY_MAX_LEN) {
    return void 0;
  }
  return trimmed;
}
function cleanLabel(label) {
  if (typeof label !== "string") {
    return void 0;
  }
  const trimmed = label.trim();
  if (!trimmed || trimmed.length > LABEL_MAX_LEN) {
    return void 0;
  }
  return trimmed;
}
function cleanText(text) {
  if (typeof text !== "string") {
    return void 0;
  }
  if (text.length > TEXT_MAX_LEN) {
    return void 0;
  }
  return text;
}
function cleanLineNumber(value) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > LINE_MAX) {
    return void 0;
  }
  return value;
}
function fileUriInsideWorkspace(uri, workspaceDir) {
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    return false;
  }
  if (parsed.protocol !== "file:" || parsed.host) {
    return false;
  }
  let p;
  try {
    p = decodeURIComponent(parsed.pathname);
  } catch {
    return false;
  }
  if (/^\/[A-Za-z]:/.test(p)) {
    p = p.slice(1);
  }
  const root = path2.resolve(workspaceDir);
  const resolved = path2.resolve(p);
  const same3 = process.platform === "win32" ? resolved.toLowerCase() === root.toLowerCase() : resolved === root;
  if (same3) {
    return true;
  }
  const prefix = process.platform === "win32" ? root.toLowerCase() + path2.sep : root + path2.sep;
  const target = process.platform === "win32" ? resolved.toLowerCase() : resolved;
  return target.startsWith(prefix);
}
function fileUriToFsPath(uri) {
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    return void 0;
  }
  if (parsed.protocol !== "file:" || parsed.host) {
    return void 0;
  }
  let p;
  try {
    p = decodeURIComponent(parsed.pathname);
  } catch {
    return void 0;
  }
  if (/^\/[A-Za-z]:/.test(p)) {
    p = p.slice(1);
  }
  return p;
}

// src/authFlows.ts
var AuthController = class {
  constructor(deps) {
    this.deps = deps;
  }
  oauthAttempt;
  cmdAttempt;
  async startOauth(integrationID, methodID, answer) {
    await this.cancelOauth(true);
    try {
      const attempt = await oauthConnect({
        integrationID,
        methodID,
        ...answer ? { answer } : {},
        ...this.deps.workspaceDir ? { directory: this.deps.workspaceDir } : {}
      });
      this.oauthAttempt = { integrationID, attemptID: attempt.attemptID };
      this.deps.post({
        type: "oauthState",
        integrationID,
        attemptID: attempt.attemptID,
        phase: "await",
        mode: attempt.mode,
        url: attempt.url,
        instructions: attempt.instructions
      });
      if (integrationID === "openai" && /chatgpt.*browser/i.test(methodID) && isSafeExternalUrl(attempt.url)) {
        try {
          await this.deps.openExternal?.(attempt.url);
        } catch {
        }
      }
      if (attempt.mode !== "code") {
        void this.pollOauth();
      }
    } catch (err) {
      this.deps.post({ type: "oauthState", integrationID, phase: "failed", message: formatError(err) });
    }
  }
  async pollOauth() {
    const active = this.oauthAttempt;
    if (!active) {
      return;
    }
    const isCurrent = () => this.oauthAttempt?.attemptID === active.attemptID;
    let terminal;
    try {
      terminal = await pollAttemptLoop({
        maxRounds: 150,
        intervalMs: 2e3,
        isCurrent,
        fetchStatus: () => oauthStatus(active.integrationID, active.attemptID, this.deps.workspaceDir)
      });
    } catch (err) {
      this.oauthAttempt = void 0;
      this.deps.post({ type: "oauthState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "failed", message: formatError(err) });
      return;
    }
    if (!isCurrent()) {
      return;
    }
    if (!terminal) {
      return;
    }
    if (terminal.status === "complete") {
      this.oauthAttempt = void 0;
      this.deps.post({ type: "oauthState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "done" });
      await this.deps.onAuthChanged();
      return;
    }
    this.oauthAttempt = void 0;
    this.deps.post({
      type: "oauthState",
      integrationID: active.integrationID,
      attemptID: active.attemptID,
      phase: terminal.status,
      message: terminal.status === "failed" ? terminal.message : "Authorization expired, start over."
    });
  }
  async completeOauth(code) {
    const active = this.oauthAttempt;
    if (!active) {
      return;
    }
    const isCurrent = () => this.oauthAttempt?.attemptID === active.attemptID;
    try {
      await oauthComplete(active.integrationID, active.attemptID, code, this.deps.workspaceDir);
      for (let i = 0; i < 10 && isCurrent(); i++) {
        await sleepMs(1e3);
        if (!isCurrent()) {
          return;
        }
        try {
          const st = await oauthStatus(active.integrationID, active.attemptID, this.deps.workspaceDir);
          if (st.status !== "pending") {
            break;
          }
        } catch {
          break;
        }
      }
    } catch (err) {
      if (!isCurrent()) {
        return;
      }
      this.deps.post({ type: "oauthState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "failed", message: formatError(err) });
      return;
    }
    if (!isCurrent()) {
      return;
    }
    this.oauthAttempt = void 0;
    this.deps.post({ type: "oauthState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "done" });
    await this.deps.onAuthChanged();
  }
  async cancelOauth(silent = false) {
    const active = this.oauthAttempt;
    this.oauthAttempt = void 0;
    if (!active) {
      return;
    }
    try {
      await oauthCancel(active.integrationID, active.attemptID, this.deps.workspaceDir);
    } catch {
    }
    if (!silent) {
      this.deps.post({ type: "oauthState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "cancelled" });
    }
  }
  async startCommand(integrationID, methodID) {
    await this.cancelCommand(true);
    try {
      const attempt = await commandConnect(
        integrationID,
        methodID,
        void 0,
        this.deps.workspaceDir
      );
      this.cmdAttempt = { integrationID, attemptID: attempt.attemptID };
      this.deps.post({ type: "cmdState", integrationID, attemptID: attempt.attemptID, phase: "running", message: "Starting command\u2026" });
      void this.pollCommand();
    } catch (err) {
      this.deps.post({ type: "cmdState", integrationID, phase: "failed", message: formatError(err) });
    }
  }
  async pollCommand() {
    const active = this.cmdAttempt;
    if (!active) {
      return;
    }
    const isCurrent = () => this.cmdAttempt?.attemptID === active.attemptID;
    const postRunning = (message) => {
      this.deps.post({ type: "cmdState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "running", message });
    };
    let terminal;
    try {
      terminal = await pollAttemptLoop({
        maxRounds: 300,
        intervalMs: 1e3,
        isCurrent,
        fetchStatus: () => commandStatus(active.integrationID, active.attemptID, this.deps.workspaceDir),
        onProgress: (st) => {
          if (st.status === "pending" && st.message) {
            postRunning(st.message);
          }
        }
      });
    } catch (err) {
      this.cmdAttempt = void 0;
      this.deps.post({ type: "cmdState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "failed", message: formatError(err) });
      return;
    }
    if (!isCurrent()) {
      return;
    }
    if (!terminal) {
      return;
    }
    if (terminal.status === "complete") {
      this.cmdAttempt = void 0;
      this.deps.post({ type: "cmdState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "done" });
      await this.deps.onAuthChanged();
      return;
    }
    this.cmdAttempt = void 0;
    this.deps.post({
      type: "cmdState",
      integrationID: active.integrationID,
      attemptID: active.attemptID,
      phase: terminal.status,
      message: terminal.status === "failed" ? terminal.message : "Command expired, start over."
    });
  }
  async cancelCommand(silent = false) {
    const active = this.cmdAttempt;
    this.cmdAttempt = void 0;
    if (!active) {
      return;
    }
    try {
      await commandCancel(active.integrationID, active.attemptID, this.deps.workspaceDir);
    } catch {
    }
    if (!silent) {
      this.deps.post({ type: "cmdState", integrationID: active.integrationID, attemptID: active.attemptID, phase: "cancelled" });
    }
  }
};

// src/handlers/auth.ts
import * as vscode from "vscode";
var authHandlers = {
  async connectKey(ctx, msg) {
    const { integrationID, answer } = msg;
    const key = cleanKey(msg.key);
    if (typeof integrationID !== "string" || key === void 0) {
      ctx.post({ type: "error", message: "\u0412\u0441\u0442\u0430\u0432\u044C \u043A\u043B\u044E\u0447 \u2014 \u043F\u0443\u0441\u0442\u044B\u043C \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u0442\u044C \u043D\u0435\u0447\u0435\u0433\u043E." });
      return;
    }
    if (!isOptionalFormAnswer(answer)) {
      ctx.post({ type: "error", message: "Bad key form answer." });
      return;
    }
    try {
      await connectKey({
        integrationID,
        key,
        ...answer ? { answer } : {},
        ...ctx.workspaceDir ? { directory: ctx.workspaceDir } : {}
      });
      ctx.post({ type: "authDone", integrationID, method: "key" });
    } catch (err) {
      ctx.post({ type: "error", message: `Key connect failed: ${formatError(err)}` });
      return;
    }
    await ctx.refreshAuthCatalogs();
  },
  async oauthStart(ctx, msg) {
    const { integrationID, methodID, answer } = msg;
    if (typeof integrationID !== "string" || typeof methodID !== "string") {
      return;
    }
    if (!isOptionalFormAnswer(answer)) {
      ctx.post({ type: "error", message: "Bad oauth form answer." });
      return;
    }
    await ctx.auth.startOauth(integrationID, methodID, answer);
  },
  async oauthCode(ctx, msg) {
    const { code } = msg;
    await ctx.auth.completeOauth(typeof code === "string" ? code : void 0);
  },
  async oauthCancel(ctx) {
    await ctx.auth.cancelOauth();
  },
  async cmdStart(ctx, msg) {
    const { integrationID, methodID } = msg;
    if (typeof integrationID !== "string" || typeof methodID !== "string") {
      return;
    }
    await ctx.auth.startCommand(integrationID, methodID);
  },
  async cmdCancel(ctx) {
    await ctx.auth.cancelCommand();
  },
  async credRemove(ctx, msg) {
    const { credentialID, label } = msg;
    if (typeof credentialID !== "string" || !credentialID) {
      return;
    }
    const answer = await vscode.window.showWarningMessage(
      `Disconnect "${typeof label === "string" && label ? label : credentialID}"? Models behind it stop working until you reconnect.`,
      { modal: true },
      "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C"
    );
    if (answer !== "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C") {
      return;
    }
    try {
      await removeCredential(credentialID);
    } catch (err) {
      ctx.post({ type: "error", message: `Disconnect failed: ${formatError(err)}` });
      return;
    }
    await ctx.refreshAuthCatalogs();
  },
  async credActivate(ctx, msg) {
    const { credentialID } = msg;
    if (typeof credentialID !== "string" || !credentialID) {
      return;
    }
    try {
      await activateCredential(credentialID);
    } catch (err) {
      ctx.post({ type: "error", message: `Activate failed: ${formatError(err)}` });
      return;
    }
    await ctx.refreshProviders();
  },
  async credRename(ctx, msg) {
    const { credentialID } = msg;
    const label = cleanLabel(msg.label);
    if (typeof credentialID !== "string" || label === void 0) {
      return;
    }
    try {
      await renameCredential(credentialID, label);
    } catch (err) {
      ctx.post({ type: "error", message: `Rename failed: ${formatError(err)}` });
      return;
    }
    await ctx.refreshProviders();
  },
  async wellknownAdd(ctx, msg) {
    const { url } = msg;
    if (!isSafeExternalUrl(typeof url === "string" ? url.trim() : url)) {
      ctx.post({ type: "error", message: "\u041D\u0443\u0436\u0435\u043D https-URL well-known endpoint." });
      return;
    }
    try {
      await wellknownAdd(url.trim(), ctx.workspaceDir);
    } catch (err) {
      ctx.post({ type: "error", message: `Well-known add failed: ${formatError(err)}` });
      return;
    }
    await ctx.refreshProviders();
  },
  async openUrl(ctx, msg) {
    const { url } = msg;
    if (!isSafeExternalUrl(url)) {
      return;
    }
    await vscode.env.openExternal(vscode.Uri.parse(url));
  }
};

// src/handlers/catalogs.ts
var catalogHandlers = {
  async switchModel(ctx, msg) {
    const { providerID, id } = msg;
    if (typeof providerID !== "string" || typeof id !== "string") {
      return;
    }
    await ctx.rememberModel({ providerID, id });
    const sessionID = ctx.sessionID;
    if (!sessionID) {
      ctx.post({
        type: "sessionModel",
        sessionID: null,
        model: { providerID, id },
        agent: ctx.storedAgent() ?? null
      });
      return;
    }
    try {
      await switchSessionModel(sessionID, providerID, id);
    } catch (err) {
      ctx.post({ type: "error", message: `Model switch failed: ${formatError(err)}` });
    }
    await ctx.refreshSessionModel();
    await ctx.refreshSessions();
  },
  async switchAgent(ctx, msg) {
    const { agent } = msg;
    if (typeof agent !== "string" || !agent) {
      return;
    }
    await ctx.rememberAgent(agent);
    const sessionID = ctx.sessionID;
    if (!sessionID) {
      ctx.post({
        type: "sessionModel",
        sessionID: null,
        model: ctx.storedModel() ?? null,
        agent
      });
      return;
    }
    try {
      await switchSessionAgent(sessionID, agent);
    } catch (err) {
      ctx.post({ type: "error", message: `Agent switch failed: ${formatError(err)}` });
    }
    await ctx.refreshSessionModel();
  },
  async listCatalogs(ctx) {
    await ctx.sendCatalogs();
  },
  async listProviders(ctx) {
    await ctx.refreshProviders();
  },
  async refreshCatalogs(ctx) {
    await ctx.refreshAuthCatalogs();
  }
};

// src/handlers/chat.ts
var chatHandlers = {
  async send(ctx, msg) {
    const dir = ctx.workspaceDir;
    if (!dir) {
      ctx.post({ type: "error", message: "Open a folder first." });
      return;
    }
    const text = cleanText(msg.text ?? "");
    if (text === void 0) {
      ctx.post({ type: "error", message: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0434\u043B\u0438\u043D\u043D\u043E\u0435 (\u043B\u0438\u043C\u0438\u0442 ~200 \u0442\u044B\u0441. \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432)." });
      return;
    }
    const rawFiles = Array.isArray(msg.files) ? msg.files.filter((f) => typeof f.uri === "string" && f.uri).map((f) => ({ uri: f.uri, name: typeof f.name === "string" ? f.name : void 0 })) : void 0;
    const files = rawFiles?.filter((f) => fileUriInsideWorkspace(f.uri, dir));
    if (rawFiles && files && files.length < rawFiles.length) {
      ctx.post({ type: "error", message: "\u0412\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u043D\u0435 \u0440\u0430\u0431\u043E\u0447\u0435\u0439 \u043F\u0430\u043F\u043A\u0438 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E." });
    }
    if (!text.trim() && (!files || files.length === 0)) {
      return;
    }
    if (!ctx.sessionID) {
      const created = await ctx.createSessionWithStoredPrefs();
      ctx.sessionID = created;
      ctx.post({ type: "sessionSelected", sessionID: created });
      await ctx.refreshSessions();
      await ctx.refreshSessionModel();
    }
    const id = ctx.sessionID;
    ctx.post({ type: "execution", state: "started", sessionID: id });
    try {
      await sendPrompt(id, text, files);
      ctx.post({ type: "promptAccepted", sessionID: id });
    } catch (err) {
      ctx.post({ type: "error", message: `Prompt failed: ${formatError(err)}` });
      ctx.post({ type: "execution", state: "failed", sessionID: id });
      return;
    }
    await ctx.refreshCurrent();
  },
  async stop(ctx) {
    const id = ctx.sessionID;
    if (!id) {
      return;
    }
    try {
      await interruptSession(id);
    } catch (err) {
      ctx.post({ type: "error", message: `Interrupt failed: ${formatError(err)}` });
    }
  },
  async checkDelivery(ctx, msg) {
    const { clientID, text } = msg;
    const sessionID = ctx.sessionID;
    if (typeof clientID !== "string" || typeof text !== "string" || !sessionID) {
      return;
    }
    try {
      const messages = await listMessages(sessionID);
      const needle = text.trim();
      const delivered = needle ? messages.some((m) => m.type === "user" && m.text.trim() === needle) : messages.some((m) => m.type === "user");
      ctx.post({ type: "delivery", clientID, delivered });
    } catch (err) {
      ctx.post({ type: "delivery", clientID, delivered: false, error: formatError(err) });
    }
  }
};

// src/handlers/diffs.ts
var diffHandlers = {
  async getDiff(ctx) {
    await ctx.refreshDiff();
  },
  async openSessionDiff(ctx, msg) {
    if (typeof msg.file === "string") {
      await ctx.openSessionDiff(msg.file);
    }
  },
  async acceptDiff(ctx) {
    ctx.post({ type: "diffResolved", decision: "accepted", sessionID: ctx.sessionID });
    await ctx.refreshDiff();
  },
  async rejectDiff(ctx) {
    const sessionID = ctx.sessionID;
    if (!sessionID) {
      return;
    }
    try {
      const messages = await listMessages(sessionID);
      let lastUser;
      for (const m of messages) {
        if (m.type === "user") {
          lastUser = m;
        }
      }
      if (!lastUser) {
        throw new Error("No user message to revert to.");
      }
      await stageRevert(sessionID, lastUser.id);
      await commitRevert(sessionID);
      ctx.forgetPreview(sessionID);
      ctx.post({ type: "diffResolved", decision: "rejected", sessionID });
    } catch (err) {
      ctx.post({ type: "error", message: `Revert failed: ${formatError(err)}` });
    }
    await ctx.refreshDiff();
    await ctx.refreshCurrent();
  }
};

// src/handlers/files.ts
import * as fs2 from "fs";
import * as path4 from "path";
import * as vscode2 from "vscode";

// src/openPath.ts
import * as path3 from "path";
var MAX_REF_CHARS = 2048;
function sameOrInside(target, root) {
  const win = process.platform === "win32";
  const t = win ? target.toLowerCase() : target;
  const r = win ? root.toLowerCase() : root;
  return t === r || t.startsWith(r + path3.sep);
}
async function resolveOpenTarget(raw, workspaceDir, deps) {
  const ref = typeof raw === "string" ? raw.trim() : "";
  if (!ref || ref.length > MAX_REF_CHARS || ref.includes("\0")) {
    return void 0;
  }
  if (!workspaceDir) {
    return void 0;
  }
  const root = path3.resolve(workspaceDir);
  const probe = (target) => {
    if (!sameOrInside(target, root)) {
      return void 0;
    }
    if (!deps.exists(target)) {
      return void 0;
    }
    return { kind: deps.isDirectory(target) ? "directory" : "file", path: target };
  };
  const direct = path3.isAbsolute(ref) ? path3.normalize(ref) : path3.resolve(root, ref);
  const hit = probe(direct);
  if (hit) {
    return hit;
  }
  const name = path3.basename(ref);
  if (!name || name === "." || name === "..") {
    return void 0;
  }
  for (const rel of await deps.findByName(name)) {
    const found = probe(path3.resolve(root, rel));
    if (found) {
      return found;
    }
  }
  return void 0;
}

// src/handlers/files.ts
var fileHandlers = {
  async findFiles(ctx, msg) {
    const dir = ctx.workspaceDir;
    if (!dir) {
      return;
    }
    const { query, reqID } = msg;
    if (typeof query !== "string" || !query) {
      return;
    }
    try {
      const found = await findFiles(dir, query);
      ctx.post({
        type: "fileResults",
        reqID: typeof reqID === "string" ? reqID : void 0,
        query,
        files: found.filter((f) => f.type === "file").map((f) => {
          const abs = path4.join(dir, f.path);
          return { path: f.path, uri: toFileUri(abs) };
        })
      });
    } catch (err) {
      ctx.post({ type: "error", message: `File search failed: ${formatError(err)}` });
    }
  },
  async saveAttachment(ctx, msg) {
    const dir = ctx.workspaceDir;
    if (!dir) {
      ctx.post({ type: "error", message: "Open a folder first." });
      return;
    }
    const { reqID, data, mime } = msg;
    if (typeof reqID !== "string" || typeof data !== "string" || typeof mime !== "string") {
      return;
    }
    if (data.length > ATTACH_MAX_BASE64_CHARS) {
      ctx.post({ type: "attachmentSaved", reqID, error: "\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u0430\u044F (\u0431\u043E\u043B\u044C\u0448\u0435 ~5 \u041C\u0411)." });
      return;
    }
    try {
      const saved = await saveAttachment(dir, data, mime);
      ctx.post({ type: "attachmentSaved", reqID, uri: saved.uri, name: saved.name });
      try {
        await pruneAttachments(dir);
      } catch (err) {
        diagError("attachments.prune", err);
      }
    } catch (err) {
      ctx.post({ type: "attachmentSaved", reqID, error: formatError(err) });
    }
  },
  async openFile(ctx, msg) {
    const dir = ctx.workspaceDir;
    const file = typeof msg.file === "string" ? msg.file : "";
    const startLine = cleanLineNumber(msg.startLine);
    const endLine = cleanLineNumber(msg.endLine);
    if (!file || !dir) {
      return;
    }
    const target = await resolveOpenTarget(file, dir, {
      exists: (p) => fs2.existsSync(p),
      isDirectory: (p) => {
        try {
          return fs2.statSync(p).isDirectory();
        } catch {
          return false;
        }
      },
      findByName: (name) => ctx.findWorkspaceFiles(name)
    });
    if (!target) {
      diagError("openFile.miss", file);
      return;
    }
    try {
      if (target.kind === "directory") {
        await vscode2.commands.executeCommand("revealInExplorer", vscode2.Uri.file(target.path));
        return;
      }
      const doc = await vscode2.workspace.openTextDocument(target.path);
      const editor = await vscode2.window.showTextDocument(doc, { preview: false });
      if (editor && startLine) {
        const lastLine = Math.max(0, doc.lineCount - 1);
        const from = Math.min(startLine - 1, lastLine);
        const to = Math.min((endLine ?? startLine) - 1, lastLine);
        const range = new vscode2.Range(from, 0, Math.max(from, to), 0);
        editor.revealRange(range, vscode2.TextEditorRevealType.InCenter);
        editor.selection = new vscode2.Selection(range.start, range.end);
      }
    } catch (err) {
      ctx.post({ type: "error", message: `Cannot open ${file}: ${formatError(err)}` });
    }
  },
  async openAttachment(ctx, msg) {
    const uri = msg.uri;
    const dir = ctx.workspaceDir;
    if (typeof uri !== "string" || !dir || !fileUriInsideWorkspace(uri, dir)) {
      ctx.post({ type: "error", message: "\u0412\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u043D\u0435 \u0440\u0430\u0431\u043E\u0447\u0435\u0439 \u043F\u0430\u043F\u043A\u0438 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E." });
      return;
    }
    const fsPath = fileUriToFsPath(uri);
    if (!fsPath) {
      ctx.post({ type: "error", message: "\u041D\u0435 \u0441\u043C\u043E\u0433 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u043F\u0443\u0442\u044C \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u044F." });
      return;
    }
    try {
      await vscode2.commands.executeCommand("vscode.open", vscode2.Uri.file(fsPath));
    } catch (err) {
      ctx.post({ type: "error", message: `Cannot open attachment: ${formatError(err)}` });
    }
  }
};

// src/handlers/forms.ts
var formHandlers = {
  async listPermissions(ctx) {
    await ctx.refreshPermissions();
  },
  async replyPermission(ctx, msg) {
    const sessionID = ctx.sessionID;
    if (!sessionID) {
      return;
    }
    const { requestID, decision } = msg;
    if (typeof requestID !== "string" || decision !== "once" && decision !== "always" && decision !== "reject") {
      ctx.post({ type: "error", message: "Bad permission reply (need requestID + once|always|reject)." });
      return;
    }
    try {
      await replyPermission(sessionID, requestID, decision);
    } catch (err) {
      ctx.post({ type: "error", message: `Permission reply failed: ${formatError(err)}` });
    }
    await ctx.refreshPermissions();
  },
  async replyForm(ctx, msg) {
    const sessionID = ctx.sessionID;
    if (!sessionID) {
      return;
    }
    const { formID, answer } = msg;
    if (typeof formID !== "string" || !isSafeFormAnswer(answer)) {
      ctx.post({ type: "error", message: "Bad form reply (need formID + answer)." });
      return;
    }
    try {
      await replyForm(sessionID, formID, answer);
    } catch (err) {
      ctx.post({ type: "error", message: `Question reply failed: ${formatError(err)}` });
    }
    await ctx.refreshForms();
  },
  async cancelForm(ctx, msg) {
    const sessionID = ctx.sessionID;
    if (!sessionID) {
      return;
    }
    const { formID } = msg;
    if (typeof formID !== "string") {
      return;
    }
    try {
      await cancelForm(sessionID, formID);
    } catch (err) {
      ctx.post({ type: "error", message: `Question close failed: ${formatError(err)}` });
    }
    await ctx.refreshForms();
  }
};

// src/handlers/sessions.ts
import * as vscode3 from "vscode";
var sessionHandlers = {
  async ready(ctx) {
    await ctx.refreshSessions();
    await ctx.refreshAuthCatalogs();
    const sessionID = ctx.sessionID;
    if (!sessionID) {
      return;
    }
    ctx.post({ type: "sessionSelected", sessionID });
    await ctx.refreshCurrent();
    await ctx.refreshPermissions();
    await ctx.refreshForms();
    await ctx.refreshSessionModel();
  },
  async listSessions(ctx) {
    await ctx.refreshSessions();
  },
  async createSession(ctx) {
    if (!ctx.workspaceDir) {
      ctx.post({ type: "error", message: "Open a folder first." });
      return;
    }
    const id = await ctx.createSessionWithStoredPrefs();
    ctx.sessionID = id;
    ctx.post({ type: "sessionSelected", sessionID: id });
    await ctx.refreshSessions();
    await ctx.refreshCurrent();
    await ctx.refreshSessionModel();
  },
  async selectSession(ctx, msg) {
    const id = msg.sessionID;
    if (typeof id !== "string" || !id) {
      return;
    }
    ctx.sessionID = id;
    ctx.post({ type: "sessionSelected", sessionID: id });
    await ctx.refreshCurrent();
    await ctx.refreshPermissions();
    await ctx.refreshForms();
    await ctx.refreshSessionModel();
  },
  async deleteSession(ctx, msg) {
    const raw = msg.sessionID;
    const id = typeof raw === "string" && raw ? raw : ctx.sessionID;
    if (!id) {
      return;
    }
    const answer = await vscode3.window.showWarningMessage(
      "Delete this OpenCode session? The conversation is gone for good.",
      { modal: true },
      "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"
    );
    if (answer !== "\u0423\u0434\u0430\u043B\u0438\u0442\u044C") {
      return;
    }
    try {
      await removeSession(id);
      ctx.forgetPreview(id);
    } catch (err) {
      ctx.post({ type: "error", message: `Delete failed: ${formatError(err)}` });
      return;
    }
    if (ctx.sessionID === id) {
      ctx.sessionID = void 0;
      ctx.onModel(void 0);
      ctx.post({ type: "sessionSelected", sessionID: null, deletedID: id });
    }
    await ctx.refreshSessions();
  },
  async renameSession(ctx, msg) {
    const sessionID = typeof msg.sessionID === "string" ? msg.sessionID : "";
    const title = typeof msg.title === "string" ? msg.title.trim() : "";
    if (!sessionID || !title) {
      return;
    }
    try {
      await renameSession(sessionID, title);
    } catch (err) {
      ctx.post({ type: "error", message: `Rename failed: ${formatError(err)}` });
      return;
    }
    await ctx.refreshSessions();
  },
  async compactSession(ctx) {
    if (!ctx.sessionID) {
      return;
    }
    try {
      await compactSession(ctx.sessionID);
      await ctx.refreshCurrent();
    } catch (err) {
      ctx.post({ type: "error", message: `Context compaction failed: ${formatError(err)}` });
    }
  }
};

// src/handlers/types.ts
var REQUEST_TYPES = [
  "ready",
  "listSessions",
  "createSession",
  "selectSession",
  "deleteSession",
  "renameSession",
  "send",
  "stop",
  "compactSession",
  "checkDelivery",
  "listPermissions",
  "replyPermission",
  "replyForm",
  "cancelForm",
  "switchModel",
  "switchAgent",
  "listCatalogs",
  "listProviders",
  "refreshCatalogs",
  "findFiles",
  "saveAttachment",
  "openFile",
  "openAttachment",
  "connectKey",
  "oauthStart",
  "oauthCode",
  "oauthCancel",
  "cmdStart",
  "cmdCancel",
  "credRemove",
  "credActivate",
  "credRename",
  "wellknownAdd",
  "openUrl",
  "getDiff",
  "openSessionDiff",
  "acceptDiff",
  "rejectDiff"
];

// src/handlers/index.ts
var requestHandlers = {
  ...sessionHandlers,
  ...chatHandlers,
  ...catalogHandlers,
  ...fileHandlers,
  ...authHandlers,
  ...diffHandlers,
  ...formHandlers
};
async function dispatchRequest(ctx, msg) {
  const type = msg?.type;
  if (typeof type !== "string" || !REQUEST_TYPES.includes(type)) {
    return;
  }
  await requestHandlers[type](ctx, msg);
}

// src/browserTools.ts
import * as vscode4 from "vscode";
import * as fs3 from "node:fs";
import * as os from "node:os";
import * as path5 from "node:path";
import { spawn as spawn2 } from "node:child_process";

// ../../node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += "\n";
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "	";
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += "\n";
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes2) {
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

// ../../node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + " ".repeat(index);
    })
  },
  "	": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + "	".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "	".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + "	".repeat(index);
    })
  }
};
var supportedEols = ["\n", "\r", "\r\n"];

// ../../node_modules/jsonc-parser/lib/esm/impl/format.js
function format(documentText, range, options) {
  let initialIndentLevel;
  let formatText;
  let formatTextStart;
  let rangeStart;
  let rangeEnd;
  if (range) {
    rangeStart = range.offset;
    rangeEnd = rangeStart + range.length;
    formatTextStart = rangeStart;
    while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
      formatTextStart--;
    }
    let endOffset = rangeEnd;
    while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
      endOffset++;
    }
    formatText = documentText.substring(formatTextStart, endOffset);
    initialIndentLevel = computeIndentLevel(formatText, options);
  } else {
    formatText = documentText;
    initialIndentLevel = 0;
    formatTextStart = 0;
    rangeStart = 0;
    rangeEnd = documentText.length;
  }
  const eol = getEOL(options, documentText);
  const eolFastPathSupported = supportedEols.includes(eol);
  let numberLineBreaks = 0;
  let indentLevel = 0;
  let indentValue;
  if (options.insertSpaces) {
    indentValue = cachedSpaces[options.tabSize || 4] ?? repeat(cachedSpaces[1], options.tabSize || 4);
  } else {
    indentValue = "	";
  }
  const indentType = indentValue === "	" ? "	" : " ";
  let scanner = createScanner(formatText, false);
  let hasError = false;
  function newLinesAndIndent() {
    if (numberLineBreaks > 1) {
      return repeat(eol, numberLineBreaks) + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    const amountOfSpaces = indentValue.length * (initialIndentLevel + indentLevel);
    if (!eolFastPathSupported || amountOfSpaces > cachedBreakLinesWithSpaces[indentType][eol].length) {
      return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    if (amountOfSpaces <= 0) {
      return eol;
    }
    return cachedBreakLinesWithSpaces[indentType][eol][amountOfSpaces];
  }
  function scanNext() {
    let token = scanner.scan();
    numberLineBreaks = 0;
    while (token === 15 || token === 14) {
      if (token === 14 && options.keepLines) {
        numberLineBreaks += 1;
      } else if (token === 14) {
        numberLineBreaks = 1;
      }
      token = scanner.scan();
    }
    hasError = token === 16 || scanner.getTokenError() !== 0;
    return token;
  }
  const editOperations = [];
  function addEdit(text, startOffset, endOffset) {
    if (!hasError && (!range || startOffset < rangeEnd && endOffset > rangeStart) && documentText.substring(startOffset, endOffset) !== text) {
      editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
    }
  }
  let firstToken = scanNext();
  if (options.keepLines && numberLineBreaks > 0) {
    addEdit(repeat(eol, numberLineBreaks), 0, 0);
  }
  if (firstToken !== 17) {
    let firstTokenStart = scanner.getTokenOffset() + formatTextStart;
    let initialIndent = indentValue.length * initialIndentLevel < 20 && options.insertSpaces ? cachedSpaces[indentValue.length * initialIndentLevel] : repeat(indentValue, initialIndentLevel);
    addEdit(initialIndent, formatTextStart, firstTokenStart);
  }
  while (firstToken !== 17) {
    let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
    let secondToken = scanNext();
    let replaceContent = "";
    let needsLineBreak = false;
    while (numberLineBreaks === 0 && (secondToken === 12 || secondToken === 13)) {
      let commentTokenStart = scanner.getTokenOffset() + formatTextStart;
      addEdit(cachedSpaces[1], firstTokenEnd, commentTokenStart);
      firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
      needsLineBreak = secondToken === 12;
      replaceContent = needsLineBreak ? newLinesAndIndent() : "";
      secondToken = scanNext();
    }
    if (secondToken === 2) {
      if (firstToken !== 1) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 1) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else if (secondToken === 4) {
      if (firstToken !== 3) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 3) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else {
      switch (firstToken) {
        case 3:
        case 1:
          indentLevel++;
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 5:
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 12:
          replaceContent = newLinesAndIndent();
          break;
        case 13:
          if (numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 6:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 10:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (secondToken === 6 && !needsLineBreak) {
            replaceContent = "";
          }
          break;
        case 7:
        case 8:
        case 9:
        case 11:
        case 2:
        case 4:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else {
            if ((secondToken === 12 || secondToken === 13) && !needsLineBreak) {
              replaceContent = cachedSpaces[1];
            } else if (secondToken !== 5 && secondToken !== 17) {
              hasError = true;
            }
          }
          break;
        case 16:
          hasError = true;
          break;
      }
      if (numberLineBreaks > 0 && (secondToken === 12 || secondToken === 13)) {
        replaceContent = newLinesAndIndent();
      }
    }
    if (secondToken === 17) {
      if (options.keepLines && numberLineBreaks > 0) {
        replaceContent = newLinesAndIndent();
      } else {
        replaceContent = options.insertFinalNewline ? eol : "";
      }
    }
    const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
    addEdit(replaceContent, firstTokenEnd, secondTokenStart);
    firstToken = secondToken;
  }
  return editOperations;
}
function repeat(s, count) {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += s;
  }
  return result;
}
function computeIndentLevel(content, options) {
  let i = 0;
  let nChars = 0;
  const tabSize = options.tabSize || 4;
  while (i < content.length) {
    let ch = content.charAt(i);
    if (ch === cachedSpaces[1]) {
      nChars++;
    } else if (ch === "	") {
      nChars += tabSize;
    } else {
      break;
    }
    i++;
  }
  return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === "\r") {
      if (i + 1 < text.length && text.charAt(i + 1) === "\n") {
        return "\r\n";
      }
      return "\r";
    } else if (ch === "\n") {
      return "\n";
    }
  }
  return options && options.eol || "\n";
}
function isEOL(text, offset) {
  return "\r\n".indexOf(text.charAt(offset)) !== -1;
}

// ../../node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object = {};
      onValue(object);
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentParent = { type: "array", offset: -1, length: -1, children: [], parent: void 0 };
  function ensurePropertyComplete(endOffset) {
    if (currentParent.type === "property") {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent;
    }
  }
  function onValue(valueNode) {
    currentParent.children.push(valueNode);
    return valueNode;
  }
  const visitor = {
    onObjectBegin: (offset) => {
      currentParent = onValue({ type: "object", offset, length: -1, parent: currentParent, children: [] });
    },
    onObjectProperty: (name, offset, length) => {
      currentParent = onValue({ type: "property", offset, length: -1, parent: currentParent, children: [] });
      currentParent.children.push({ type: "string", value: name, offset, length, parent: currentParent });
    },
    onObjectEnd: (offset, length) => {
      ensurePropertyComplete(offset + length);
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset, length) => {
      currentParent = onValue({ type: "array", offset, length: -1, parent: currentParent, children: [] });
    },
    onArrayEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value, offset, length) => {
      onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep3, offset, length) => {
      if (currentParent.type === "property") {
        if (sep3 === ":") {
          currentParent.colonOffset = offset;
        } else if (sep3 === ",") {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  const result = currentParent.children[0];
  if (result) {
    delete result.parent;
  }
  return result;
}
function findNodeAtLocation(root, path7) {
  if (!root) {
    return void 0;
  }
  let node = root;
  for (let segment of path7) {
    if (typeof segment === "string") {
      if (node.type !== "object" || !Array.isArray(node.children)) {
        return void 0;
      }
      let found = false;
      for (const propertyNode of node.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment && propertyNode.children.length === 2) {
          node = propertyNode.children[1];
          found = true;
          break;
        }
      }
      if (!found) {
        return void 0;
      }
    } else {
      const index = segment;
      if (node.type !== "array" || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
        return void 0;
      }
      node = node.children[index];
    }
  }
  return node;
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(
            14
            /* ParseErrorCode.InvalidUnicode */
          );
          break;
        case 5:
          handleError(
            15
            /* ParseErrorCode.InvalidEscapeCharacter */
          );
          break;
        case 3:
          handleError(
            13
            /* ParseErrorCode.UnexpectedEndOfNumber */
          );
          break;
        case 1:
          if (!disallowComments) {
            handleError(
              11
              /* ParseErrorCode.UnexpectedEndOfComment */
            );
          }
          break;
        case 2:
          handleError(
            12
            /* ParseErrorCode.UnexpectedEndOfString */
          );
          break;
        case 6:
          handleError(
            16
            /* ParseErrorCode.InvalidCharacter */
          );
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(
              10
              /* ParseErrorCode.InvalidCommentToken */
            );
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(
            1
            /* ParseErrorCode.InvalidSymbol */
          );
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(
            2
            /* ParseErrorCode.InvalidNumberFormat */
          );
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
    } else {
      handleError(5, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [
        2
        /* SyntaxKind.CloseBraceToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(4, [], [
          4,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(8, [
        4
        /* SyntaxKind.CloseBracketToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray();
      case 1:
        return parseObject();
      case 10:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}
function getNodeType(value) {
  switch (typeof value) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "object": {
      if (!value) {
        return "null";
      } else if (Array.isArray(value)) {
        return "array";
      }
      return "object";
    }
    default:
      return "null";
  }
}

// ../../node_modules/jsonc-parser/lib/esm/impl/edit.js
function setProperty(text, originalPath, value, options) {
  const path7 = originalPath.slice();
  const errors = [];
  const root = parseTree(text, errors);
  let parent = void 0;
  let lastSegment = void 0;
  while (path7.length > 0) {
    lastSegment = path7.pop();
    parent = findNodeAtLocation(root, path7);
    if (parent === void 0 && value !== void 0) {
      if (typeof lastSegment === "string") {
        value = { [lastSegment]: value };
      } else {
        value = [value];
      }
    } else {
      break;
    }
  }
  if (!parent) {
    if (value === void 0) {
      throw new Error("Can not delete in empty document");
    }
    return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, options);
  } else if (parent.type === "object" && typeof lastSegment === "string" && Array.isArray(parent.children)) {
    const existing = findNodeAtLocation(parent, [lastSegment]);
    if (existing !== void 0) {
      if (value === void 0) {
        if (!existing.parent) {
          throw new Error("Malformed AST");
        }
        const propertyIndex = parent.children.indexOf(existing.parent);
        let removeBegin;
        let removeEnd = existing.parent.offset + existing.parent.length;
        if (propertyIndex > 0) {
          let previous = parent.children[propertyIndex - 1];
          removeBegin = previous.offset + previous.length;
        } else {
          removeBegin = parent.offset + 1;
          if (parent.children.length > 1) {
            let next = parent.children[1];
            removeEnd = next.offset;
          }
        }
        return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: "" }, options);
      } else {
        return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, options);
      }
    } else {
      if (value === void 0) {
        return [];
      }
      const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
      const index = options.getInsertionIndex ? options.getInsertionIndex(parent.children.map((p) => p.children[0].value)) : parent.children.length;
      let edit;
      if (index > 0) {
        let previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      } else if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty + "," };
      }
      return withFormatting(text, edit, options);
    }
  } else if (parent.type === "array" && typeof lastSegment === "number" && Array.isArray(parent.children)) {
    const insertIndex = lastSegment;
    if (insertIndex === -1) {
      const newProperty = `${JSON.stringify(value)}`;
      let edit;
      if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        const previous = parent.children[parent.children.length - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else if (value === void 0 && parent.children.length >= 0) {
      const removalIndex = lastSegment;
      const toRemove = parent.children[removalIndex];
      let edit;
      if (parent.children.length === 1) {
        edit = { offset: parent.offset + 1, length: parent.length - 2, content: "" };
      } else if (parent.children.length - 1 === removalIndex) {
        let previous = parent.children[removalIndex - 1];
        let offset = previous.offset + previous.length;
        let parentEndOffset = parent.offset + parent.length;
        edit = { offset, length: parentEndOffset - 2 - offset, content: "" };
      } else {
        edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: "" };
      }
      return withFormatting(text, edit, options);
    } else if (value !== void 0) {
      let edit;
      const newProperty = `${JSON.stringify(value)}`;
      if (!options.isArrayInsertion && parent.children.length > lastSegment) {
        const toModify = parent.children[lastSegment];
        edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
      } else if (parent.children.length === 0 || lastSegment === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + "," };
      } else {
        const index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
        const previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else {
      throw new Error(`Can not ${value === void 0 ? "remove" : options.isArrayInsertion ? "insert" : "modify"} Array index ${insertIndex} as length is not sufficient`);
    }
  } else {
    throw new Error(`Can not add ${typeof lastSegment !== "number" ? "index" : "property"} to parent of type ${parent.type}`);
  }
}
function withFormatting(text, edit, options) {
  if (!options.formattingOptions) {
    return [edit];
  }
  let newText = applyEdit(text, edit);
  let begin = edit.offset;
  let end = edit.offset + edit.content.length;
  if (edit.length === 0 || edit.content.length === 0) {
    while (begin > 0 && !isEOL(newText, begin - 1)) {
      begin--;
    }
    while (end < newText.length && !isEOL(newText, end)) {
      end++;
    }
  }
  const edits = format(newText, { offset: begin, length: end - begin }, { ...options.formattingOptions, keepLines: false });
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit2 = edits[i];
    newText = applyEdit(newText, edit2);
    begin = Math.min(begin, edit2.offset);
    end = Math.max(end, edit2.offset + edit2.length);
    end += edit2.content.length - edit2.length;
  }
  const editLength = text.length - (newText.length - end) - begin;
  return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
  return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}

// ../../node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError2) {
  ScanError2[ScanError2["None"] = 0] = "None";
  ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
  ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
  ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
  ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
  ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
  ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind2) {
  SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
  SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
  SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
  SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
  SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
  SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
  SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
  SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
  SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
  SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
  SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
  SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
  SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
  SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
  SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var parse2 = parse;
var ParseErrorCode;
(function(ParseErrorCode2) {
  ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
  ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
  ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
  ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
  ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
  ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
  ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
  ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
  ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
  ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
  ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
function modify(text, path7, value, options) {
  return setProperty(text, path7, value, options);
}
function applyEdits(text, edits) {
  let sortedEdits = edits.slice(0).sort((a, b) => {
    const diff = a.offset - b.offset;
    if (diff === 0) {
      return a.length - b.length;
    }
    return diff;
  });
  let lastModifiedOffset = text.length;
  for (let i = sortedEdits.length - 1; i >= 0; i--) {
    let e = sortedEdits[i];
    if (e.offset + e.length <= lastModifiedOffset) {
      text = applyEdit(text, e);
    } else {
      throw new Error("Overlapping edit");
    }
    lastModifiedOffset = e.offset;
  }
  return text;
}

// src/browserTools.ts
var stateFile = path5.join(os.homedir(), ".opencode-gui", "browser-bridge.json");
function chooseOpenCodeConfigFile(dir, exists = fs3.existsSync) {
  const jsonc = path5.join(dir, "opencode.jsonc");
  if (exists(jsonc)) return jsonc;
  const json2 = path5.join(dir, "opencode.json");
  return exists(json2) ? json2 : jsonc;
}
function addBrowserPluginToConfig(source, pluginPath) {
  const current = source.trim() ? source : "{}\n";
  const errors = [];
  const config = parse2(current, errors);
  if (errors.length || !config || Array.isArray(config)) throw new Error("Cannot edit invalid OpenCode JSONC config");
  const plugins = config.plugins;
  if (plugins !== void 0 && !Array.isArray(plugins)) throw new Error("OpenCode plugins setting is not an array");
  const entries = plugins ?? [];
  if (entries.includes(pluginPath)) return current;
  return applyEdits(current, modify(current, ["plugins"], [...entries, pluginPath], {
    formattingOptions: { insertSpaces: true, tabSize: 2, eol: "\n" }
  }));
}
function readState() {
  try {
    const state = JSON.parse(fs3.readFileSync(stateFile, "utf8"));
    const url = new URL(state.url);
    if (url.protocol === "http:" && url.hostname === "127.0.0.1" && /^[a-f0-9]{64}$/.test(state.token)) return state;
  } catch {
  }
  return void 0;
}
async function health(state = readState()) {
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
var BrowserTools = class {
  constructor(context) {
    this.context = context;
  }
  child;
  async enable() {
    const asset = path5.join(this.context.extensionPath, "browser-runtime", "plugin");
    const target = path5.join(this.context.globalStorageUri.fsPath, "browser-plugin");
    const configFile = chooseOpenCodeConfigFile(path5.join(os.homedir(), ".config", "opencode"));
    if (!fs3.existsSync(path5.join(asset, "index.mjs"))) throw new Error("Bundled browser plugin is missing");
    const answer = await vscode4.window.showWarningMessage(
      `Enable Browser Tools in ${configFile}? This adds the local plugin to the global OpenCode config.`,
      { modal: true },
      "Enable Browser Tools"
    );
    if (answer !== "Enable Browser Tools") return;
    fs3.mkdirSync(target, { recursive: true });
    fs3.copyFileSync(path5.join(asset, "index.mjs"), path5.join(target, "index.mjs"));
    fs3.copyFileSync(path5.join(asset, "package.json"), path5.join(target, "package.json"));
    fs3.mkdirSync(path5.dirname(configFile), { recursive: true });
    const original = fs3.existsSync(configFile) ? fs3.readFileSync(configFile, "utf8") : "{}\n";
    const updated = addBrowserPluginToConfig(original, target.replace(/\\/g, "/"));
    if (updated !== original) fs3.writeFileSync(configFile, updated, "utf8");
    vscode4.window.showInformationMessage("Browser Tools enabled. Restart OpenCode, then start a new session to load the plugin.");
  }
  async start() {
    if (!await health()) {
      const script = path5.join(this.context.extensionPath, "browser-runtime", "bridge", "main.cjs");
      if (!fs3.existsSync(script)) throw new Error("Bundled browser bridge is missing");
      if (this.child && this.child.exitCode === null) this.dispose();
      const allowPrivate = vscode4.workspace.getConfiguration("opencode-gui").get("browser.allowPrivateNetworks", false);
      let spawnError;
      const child = spawn2(process.execPath, [script], {
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: "1",
          OPENCODE_GUI_BROWSER_ALLOW_PRIVATE: allowPrivate ? "1" : "0"
        },
        stdio: ["ignore", "ignore", "ignore", "ipc"],
        windowsHide: true
      });
      child.on("error", (error) => {
        spawnError = error;
      });
      this.child = child;
      let ready = false;
      for (let i = 0; i < 100; i++) {
        if (spawnError) throw spawnError;
        if (await health()) {
          ready = true;
          break;
        }
        if (child.exitCode !== null) break;
        await new Promise((resolve4) => setTimeout(resolve4, 100));
      }
      if (!ready) throw new Error("Browser bridge did not start");
    }
    const state = readState();
    if (!state) throw new Error("Browser bridge state is unavailable");
    const response = await fetch(new URL("/launch", state.url), {
      method: "POST",
      headers: { authorization: `Bearer ${state.token}` },
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) {
      let detail = "";
      try {
        const body = await response.json();
        if (typeof body.error === "string") detail = `: ${body.error}`;
      } catch {
      }
      throw new Error(`Browser launch failed (${response.status})${detail}`);
    }
    vscode4.window.showInformationMessage("Browser Tools: isolated Chromium is running.");
  }
  async status() {
    const state = readState();
    if (!state || !await health(state)) {
      vscode4.window.showInformationMessage("Browser Tools: bridge stopped. Run Start Browser Tools.");
      return;
    }
    try {
      const response = await fetch(new URL("/status", state.url), {
        headers: { authorization: `Bearer ${state.token}` },
        signal: AbortSignal.timeout(2e3)
      });
      const body = await response.json();
      vscode4.window.showInformationMessage(body.browser === "running" ? "Browser Tools: bridge and isolated Chromium are running." : "Browser Tools: bridge running, Chromium stopped. Run Start Browser Tools to launch it.");
    } catch {
      vscode4.window.showInformationMessage("Browser Tools: bridge running, browser state unavailable.");
    }
  }
  dispose() {
    const child = this.child;
    this.child = void 0;
    if (!child || child.exitCode !== null) return;
    const forceKill = () => {
      if (child.exitCode !== null) return;
      if (process.platform === "win32" && child.pid) {
        spawn2("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore", windowsHide: true });
      } else {
        child.kill("SIGKILL");
      }
    };
    try {
      if (child.connected) child.disconnect();
      else child.kill();
    } catch {
      forceKill();
    }
    const timer = setTimeout(forceKill, 4e3);
    timer.unref?.();
  }
};

// src/extension.ts
async function activate(context) {
  const browserTools = new BrowserTools(context);
  context.subscriptions.push(browserTools);
  for (const [command, action] of [
    ["opencode-gui.browserEnable", () => browserTools.enable()],
    ["opencode-gui.browserStart", () => browserTools.start()],
    ["opencode-gui.browserStatus", () => browserTools.status()]
  ]) {
    context.subscriptions.push(vscode5.commands.registerCommand(command, async () => {
      try {
        await action();
      } catch (error) {
        vscode5.window.showWarningMessage(`Browser Tools: ${formatError(error)}`);
      }
    }));
  }
  const rawDir = vscode5.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const workspaceDir = rawDir ? normalizeDir(rawDir) : void 0;
  const statusBar = vscode5.window.createStatusBarItem(vscode5.StatusBarAlignment.Right, 100);
  statusBar.text = "$(comment-discussion) OpenCode GUI: \u2026";
  statusBar.tooltip = "OpenCode GUI";
  statusBar.command = "opencode-gui.openPanel";
  statusBar.show();
  context.subscriptions.push(statusBar);
  const provider = new ChatViewProvider(
    context.extensionUri,
    workspaceDir,
    context.globalState,
    (label) => {
      statusModel = label ?? "";
      renderStatus(lastOnline, lastDetail);
    },
    context.globalStorageUri
  );
  context.subscriptions.push(vscode5.window.registerWebviewViewProvider(VIEW_ID, provider));
  let lastOnline = false;
  let lastDetail = "OpenCode GUI";
  let statusModel = "";
  function renderStatus(online, detail) {
    lastOnline = online;
    lastDetail = detail;
    if (online) {
      const modelSuffix = statusModel ? ` \xB7 ${statusModel}` : "";
      statusBar.text = `$(comment-discussion) OpenCode GUI: v${statusVersion}${modelSuffix}`;
      statusBar.tooltip = statusModel ? `${detail}
Model: ${statusModel}` : detail;
      statusBar.backgroundColor = void 0;
    } else {
      statusBar.text = "$(comment-discussion) OpenCode GUI: offline";
      statusBar.tooltip = `${detail} \u2014 run "OpenCode GUI: Reconnect".`;
      statusBar.backgroundColor = new vscode5.ThemeColor("statusBarItem.errorBackground");
    }
  }
  let statusVersion = "?";
  async function refreshStatus() {
    const s = await getServerStatus();
    statusVersion = s.version ?? "?";
    renderStatus(s.status === "online", s.detail);
  }
  context.subscriptions.push(
    vscode5.commands.registerCommand("opencode-gui.reconnect", async () => {
      disposeClient();
      await refreshStatus();
    })
  );
  context.subscriptions.push(
    vscode5.commands.registerCommand("opencode-gui.restartServer", async () => {
      try {
        const info = await restartService();
        statusVersion = info.version;
        renderStatus(true, `Connected to OpenCode v${info.version} at ${info.url}`);
        vscode5.window.showInformationMessage(`OpenCode GUI: server restarted (v${info.version}).`);
      } catch (err) {
        renderStatus(false, `Restart failed: ${formatError(err)}`);
        vscode5.window.showWarningMessage(`OpenCode GUI: restart failed: ${formatError(err)}`);
      }
    })
  );
  context.subscriptions.push(
    vscode5.commands.registerCommand("opencode-gui.openPanel", async () => {
      await vscode5.commands.executeCommand(`${VIEW_ID}.focus`).then(
        () => void 0,
        () => vscode5.window.showInformationMessage("OpenCode GUI: open the sidebar and pick OpenCode GUI > Chat.")
      );
    })
  );
  context.subscriptions.push(
    vscode5.commands.registerCommand("opencode-gui.addSelection", async () => {
      const editor = vscode5.window.activeTextEditor;
      if (!editor) {
        vscode5.window.showWarningMessage("OpenCode GUI: no active editor selection.");
        return;
      }
      const sel = editor.selection;
      const text = editor.document.getText(sel);
      if (!text) {
        vscode5.window.showWarningMessage("OpenCode GUI: selection is empty.");
        return;
      }
      const payload = {
        file: editor.document.fileName,
        startLine: sel.start.line + 1,
        endLine: sel.end.line + 1,
        text: text.slice(0, SELECTION_MAX_CHARS)
      };
      provider.postSelection(payload);
    })
  );
  const stopEvents = startEventStream(
    (event) => routeEvent(provider, event),
    (err, context2, failures) => diagError(`${context2}[x${failures}]`, err)
  );
  context.subscriptions.push({ dispose: stopEvents });
  const attentionTimer = setInterval(() => {
    void provider.pollAttention();
  }, ATTENTION_POLL_MS);
  context.subscriptions.push({ dispose: () => clearInterval(attentionTimer) });
  await refreshStatus();
  await provider.refreshSessions();
}
function deactivate() {
  disposeClient();
}
var ChatViewProvider = class {
  constructor(extensionUri, workspaceDir, store, onModel, storageUri) {
    this.extensionUri = extensionUri;
    this.workspaceDir = workspaceDir;
    this.store = store;
    this.onModel = onModel;
    setDiagStorage(storageUri);
    this.auth = new AuthController({
      post: (msg) => this.post(msg),
      workspaceDir,
      onAuthChanged: () => this.refreshAuthCatalogs(),
      openExternal: async (url) => {
        await vscode5.env.openExternal(vscode5.Uri.parse(url));
      }
    });
  }
  view;
  /** Selected session. Public because the request handlers read and move it. */
  sessionID;
  previewCache = /* @__PURE__ */ new Map();
  /** Drops identical history reposts (#16); reset when the webview reloads. */
  historyGate = new HistoryPostGate();
  /** Provider-connect flows (oauth / CLI command) live in AuthController. */
  auth;
  get currentSessionID() {
    return this.sessionID;
  }
  storedModel() {
    const m = this.store.get("opencode-gui.lastModel");
    return m && typeof m.providerID === "string" && typeof m.id === "string" ? m : void 0;
  }
  storedAgent() {
    const a = this.store.get("opencode-gui.lastAgent");
    return typeof a === "string" && a ? a : void 0;
  }
  /** Persists the picked model so the next session starts on it. */
  async rememberModel(model) {
    await this.store.update("opencode-gui.lastModel", model);
  }
  /** Persists the picked agent so the next session starts on it. */
  async rememberAgent(agent) {
    await this.store.update("opencode-gui.lastAgent", agent);
  }
  /** Drops the cached first-message preview of a session that no longer exists. */
  forgetPreview(sessionID) {
    this.previewCache.delete(sessionID);
  }
  /** Creates a session with persisted model/agent prefs applied. De-dupes create+switch. */
  async createSessionWithStoredPrefs() {
    if (!this.workspaceDir) {
      throw new Error("Open a folder first.");
    }
    const created = await createSession(this.workspaceDir, void 0, this.storedModel());
    const agent = this.storedAgent();
    if (agent) {
      try {
        await switchSessionAgent(created.id, agent);
      } catch (err) {
        diagError("switchAgent.stored", err);
      }
    }
    return created.id;
  }
  /** Providers + model catalogs change together (auth events) — refresh as one unit. */
  async refreshAuthCatalogs() {
    await this.refreshProviders();
    await this.sendCatalogs();
  }
  post(message) {
    diag(">", message);
    void this.view?.webview.postMessage(message);
  }
  postSelection(payload) {
    this.post({ type: "selection", ...payload });
  }
  /**
   * Workspace search by base name — the fallback when a chat reference does not
   * exist at the path as written (agent quoting a path from another root, or a
   * bare `SKILL.md`). VS Code's own index does the walking, so it stays cheap.
   */
  async findWorkspaceFiles(name) {
    if (!this.workspaceDir) {
      return [];
    }
    const escaped = name.replace(/[\\*?[\]{}()!+@]/g, (c) => `\\${c}`);
    const uris = await vscode5.workspace.findFiles(`**/${escaped}`, "**/node_modules/**", 20);
    return uris.map((u) => path6.relative(this.workspaceDir, u.fsPath)).sort((a, b) => a.length - b.length || a.localeCompare(b));
  }
  async refreshSessions() {
    if (!this.workspaceDir) {
      this.post({ type: "error", message: "Open a folder first \u2014 sessions are scoped to a workspace directory." });
      return;
    }
    try {
      const sessions = await listSessions(this.workspaceDir);
      this.post({ type: "sessions", sessions: sessions.map(sessionToView) });
      this.knownSessionIDs = sessions.map((s) => s.id);
      void this.fillPreviews(sessions.map((s) => s.id));
      void this.pollAttention();
    } catch (err) {
      this.post({ type: "error", message: `Failed to list sessions: ${formatError(err)}` });
    }
  }
  /**
   * Attention sweep (mirrors the upstream TUI tab logic): live events cover
   * questions/permissions created while we watch, but anything created earlier
   * (another client, panel closed, stream gap) would never outline its tab.
   * So poll form.list/permission.list for non-active sessions and re-emit the
   * same asked-messages — the webview marks background tabs unread (idempotent).
   */
  knownSessionIDs = [];
  lastAttentionSweep = 0;
  async pollAttention() {
    const now = Date.now();
    if (now - this.lastAttentionSweep < ATTENTION_POLL_MS) {
      return;
    }
    this.lastAttentionSweep = now;
    const current = this.sessionID;
    let sweepFailures = 0;
    for (const id of this.knownSessionIDs.slice(0, ATTENTION_MAX_SESSIONS)) {
      if (id === current) {
        continue;
      }
      try {
        const forms = await listForms(id);
        if (forms.length > 0) {
          this.post({ type: "formAsked", form: formToView(forms[0]) });
          continue;
        }
      } catch {
        sweepFailures++;
        continue;
      }
      try {
        const perms = await listPermissions(id);
        if (perms.length > 0) {
          this.post({ type: "permissionAsked", permission: permissionToView(perms[0]) });
        }
      } catch {
        sweepFailures++;
      }
    }
    if (sweepFailures > 0) {
      diagError("attention.sweep", new Error(`${sweepFailures} background sessions unreadable`));
    }
  }
  /** First user message per session for human-readable labels (cached; first message is append-only). */
  async fillPreviews(ids) {
    let previewFailures = 0;
    for (const id of ids.slice(0, PREVIEW_MAX_SESSIONS)) {
      if (this.previewCache.has(id)) {
        continue;
      }
      try {
        const first = await firstUserMessage(id);
        if (first && first.type === "user" && first.text.trim()) {
          const preview = first.text.replace(/\s+/g, " ").slice(0, PREVIEW_MAX_CHARS);
          this.previewCache.set(id, preview);
          this.post({ type: "sessionPreview", sessionID: id, preview });
        }
      } catch {
        previewFailures++;
      }
    }
    if (previewFailures > 0) {
      diagError("session.previews", new Error(`${previewFailures} previews unreadable`));
    }
  }
  async refreshCurrent() {
    const sessionID = this.sessionID;
    if (!sessionID) {
      return;
    }
    try {
      const messages = await listMessages(sessionID, { full: true });
      const views = messages.map(messageToView).filter((m) => m !== null);
      const compactions = countCompactions(messages);
      if (!this.historyGate.accept({ sessionID, compactions, views })) {
        return;
      }
      this.post({
        type: "messages",
        sessionID,
        messages: views,
        compactions
      });
    } catch (err) {
      this.post({ type: "error", message: `Failed to load messages: ${formatError(err)}` });
    }
  }
  async refreshPermissions() {
    if (!this.sessionID) {
      return;
    }
    try {
      const pending = await listPermissions(this.sessionID);
      this.post({ type: "permissions", sessionID: this.sessionID, permissions: pending.map(permissionToView) });
    } catch (err) {
      this.post({ type: "error", message: `Failed to load permissions: ${formatError(err)}` });
    }
  }
  async refreshForms() {
    if (!this.sessionID) {
      return;
    }
    try {
      const pending = await listForms(this.sessionID);
      this.post({ type: "forms", sessionID: this.sessionID, forms: pending.map(formToView) });
    } catch (err) {
      this.post({ type: "error", message: `Failed to load questions: ${formatError(err)}` });
    }
  }
  async refreshProviders() {
    try {
      const list = await listIntegrations(this.workspaceDir);
      this.post({ type: "providers", providers: list.map(integrationToView) });
    } catch (err) {
      this.post({ type: "error", message: `Failed to load providers: ${formatError(err)}` });
    }
  }
  async refreshDiff() {
    if (!this.sessionID) {
      return;
    }
    try {
      const files = await getSessionDiff(this.sessionID);
      this.post({ type: "diff", sessionID: this.sessionID, files });
    } catch (err) {
      this.post({ type: "error", message: `Failed to load diff: ${formatError(err)}` });
    }
  }
  /** Opens VS Code's own side-by-side editor instead of printing a raw patch in the chat. */
  async openSessionDiff(file) {
    const sessionID = this.sessionID;
    const dir = this.workspaceDir;
    if (!sessionID || !dir || path6.isAbsolute(file)) {
      return;
    }
    const absolute = path6.resolve(dir, file);
    const relative2 = path6.relative(dir, absolute);
    if (relative2.startsWith("..") || path6.isAbsolute(relative2)) {
      return;
    }
    try {
      const diff = (await getSessionDiff(sessionID)).find((entry) => entry.file === file);
      if (!diff) {
        return;
      }
      const exists = fs4.existsSync(absolute);
      const current = exists ? await fs4.promises.readFile(absolute, "utf8") : "";
      const original = diff.status === "added" ? "" : restoreOriginalFromPatch(current, diff.patch);
      const left = await vscode5.workspace.openTextDocument({ content: original });
      const right = exists ? vscode5.Uri.file(absolute) : (await vscode5.workspace.openTextDocument({ content: "" })).uri;
      await vscode5.commands.executeCommand("vscode.diff", left.uri, right, `\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F: ${file}`, { preview: false });
    } catch (err) {
      this.post({ type: "error", message: `Cannot open diff for ${file}: ${formatError(err)}` });
    }
  }
  async refreshSessionModel() {
    if (!this.sessionID) {
      this.onModel(void 0);
      return;
    }
    try {
      const info = await getSession(this.sessionID);
      const model = info.model ?? null;
      this.post({ type: "sessionModel", sessionID: this.sessionID, model, agent: info.agent ?? null });
      this.onModel(model ? `${model.providerID}/${model.id}` : void 0);
    } catch {
    }
  }
  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      // The panel is a single inline bundle; nothing else may be loaded from disk.
      localResourceRoots: [vscode5.Uri.joinPath(this.extensionUri, "webview-dist")]
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);
    webviewView.onDidDispose(() => {
      this.view = void 0;
    });
    webviewView.webview.onDidReceiveMessage((msg) => {
      diag("<", msg);
      void this.handleRequest(msg).catch((err) => {
        this.post({ type: "error", message: formatError(err) });
      });
    });
  }
  async sendCatalogs() {
    try {
      const [models, fallback2, agents] = await Promise.all([
        listModels(),
        getDefaultModel(),
        listAgents()
      ]);
      this.post({
        type: "catalogs",
        models: models.map(modelToView),
        defaultModel: fallback2 ? { providerID: fallback2.providerID, id: fallback2.id } : null,
        agents: agents.filter((a) => !a.hidden && (a.mode === "primary" || a.mode === "all")).map((a) => ({ id: a.id, name: a.name || a.id })),
        storedModel: this.storedModel() ?? null,
        storedAgent: this.storedAgent() ?? null
      });
    } catch (err) {
      this.post({ type: "error", message: `Failed to load models: ${formatError(err)}` });
    }
  }
  /** Webview request routing: 35 types, one handler module per zone (src/handlers). */
  async handleRequest(msg) {
    if (msg.type === "ready") {
      this.historyGate.reset();
    }
    await dispatchRequest(this, msg);
  }
  getHtml(webview) {
    const candidates = [
      // Packaged vsix layout.
      path6.join(this.extensionUri.fsPath, "webview-dist", "index.html"),
      // Monorepo dev layout (F5 with extensionDevelopmentPath=packages/extension).
      path6.join(this.extensionUri.fsPath, "..", "..", "webview", "dist", "index.html"),
      // Legacy dev layout.
      path6.join(
        vscode5.Uri.joinPath(this.extensionUri, "packages", "webview", "dist", "index.html").fsPath
      )
    ];
    for (const p of candidates) {
      try {
        if (fs4.existsSync(p)) {
          const raw = fs4.readFileSync(p, "utf8");
          const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data: blob: https://media.pollinations.ai; media-src https://media.pollinations.ai; font-src ${webview.cspSource} data:;">`;
          return raw.replace(/<head>/i, `<head>${csp}`);
        }
      } catch {
      }
    }
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
      <style>body{font-family:var(--vscode-font-family);padding:16px;color:var(--vscode-foreground)}</style>
      </head><body>
      <h3>OpenCode GUI</h3>
      <p>Webview bundle not built yet. Run <code>npm run build -w packages/webview</code> in <code>ByMS</code>.</p>
      </body></html>`;
  }
};
export {
  ChatViewProvider,
  activate,
  deactivate
};
//# sourceMappingURL=extension.js.map
