(() => {
  "use strict";
  let e,
    t,
    a,
    s,
    r,
    n = {
      googleAnalytics: "googleAnalytics",
      precache: "precache-v2",
      prefix: "serwist",
      runtime: "runtime",
      suffix: "u" > typeof registration ? registration.scope : "",
    },
    i = (e) => [n.prefix, e, n.suffix].filter((e) => e && e.length > 0).join("-"),
    c = (e) => e || i(n.precache),
    o = (e) => e || i(n.runtime);
  var l = class extends Error {
    details;
    constructor(e, t) {
      (super(
        ((e, ...t) => {
          let a = e;
          return (t.length > 0 && (a += ` :: ${JSON.stringify(t)}`), a);
        })(e, t),
      ),
        (this.name = e),
        (this.details = t));
    }
  };
  function h(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  let u = new Set();
  function d(e, t) {
    let a = new URL(e);
    for (let e of t) a.searchParams.delete(e);
    return a.href;
  }
  async function m(e, t, a, s) {
    let r = d(t.url, a);
    if (t.url === r) return e.match(t, s);
    let n = { ...s, ignoreSearch: !0 };
    for (let i of await e.keys(t, n)) if (r === d(i.url, a)) return e.match(i, s);
  }
  var f = class {
    promise;
    resolve;
    reject;
    constructor() {
      this.promise = new Promise((e, t) => {
        ((this.resolve = e), (this.reject = t));
      });
    }
  };
  let g = async () => {
      for (let e of u) await e();
    },
    w = "-precache-",
    p = async (e, t = w) => {
      let a = (await self.caches.keys()).filter(
        (a) => a.includes(t) && a.includes(self.registration.scope) && a !== e,
      );
      return (await Promise.all(a.map((e) => self.caches.delete(e))), a);
    },
    y = (e, t) => {
      let a = t();
      return (e.waitUntil(a), a);
    },
    _ = (e, t) => t.some((t) => e instanceof t),
    x = new WeakMap(),
    b = new WeakMap(),
    v = new WeakMap(),
    E = {
      get(e, t, a) {
        if (e instanceof IDBTransaction) {
          if ("done" === t) return x.get(e);
          if ("store" === t)
            return a.objectStoreNames[1] ? void 0 : a.objectStore(a.objectStoreNames[0]);
        }
        return R(e[t]);
      },
      set: (e, t, a) => ((e[t] = a), !0),
      has: (e, t) => (e instanceof IDBTransaction && ("done" === t || "store" === t)) || t in e,
    };
  function R(e) {
    if (e instanceof IDBRequest) {
      let t;
      return (
        (t = new Promise((t, a) => {
          let s = () => {
              (e.removeEventListener("success", r), e.removeEventListener("error", n));
            },
            r = () => {
              (t(R(e.result)), s());
            },
            n = () => {
              (a(e.error), s());
            };
          (e.addEventListener("success", r), e.addEventListener("error", n));
        })),
        v.set(t, e),
        t
      );
    }
    if (b.has(e)) return b.get(e);
    let t = (function (e) {
      if ("function" == typeof e)
        return (
          r ||
          (r = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
          ])
        ).includes(e)
          ? function (...t) {
              return (e.apply(q(this), t), R(this.request));
            }
          : function (...t) {
              return R(e.apply(q(this), t));
            };
      return (e instanceof IDBTransaction &&
        (function (e) {
          if (x.has(e)) return;
          let t = new Promise((t, a) => {
            let s = () => {
                (e.removeEventListener("complete", r),
                  e.removeEventListener("error", n),
                  e.removeEventListener("abort", n));
              },
              r = () => {
                (t(), s());
              },
              n = () => {
                (a(e.error || new DOMException("AbortError", "AbortError")), s());
              };
            (e.addEventListener("complete", r),
              e.addEventListener("error", n),
              e.addEventListener("abort", n));
          });
          x.set(e, t);
        })(e),
      _(e, s || (s = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])))
        ? new Proxy(e, E)
        : e;
    })(e);
    return (t !== e && (b.set(e, t), v.set(t, e)), t);
  }
  let q = (e) => v.get(e);
  function S(e, t, { blocked: a, upgrade: s, blocking: r, terminated: n } = {}) {
    let i = indexedDB.open(e, t),
      c = R(i);
    return (
      s &&
        i.addEventListener("upgradeneeded", (e) => {
          s(R(i.result), e.oldVersion, e.newVersion, R(i.transaction), e);
        }),
      a && i.addEventListener("blocked", (e) => a(e.oldVersion, e.newVersion, e)),
      c
        .then((e) => {
          (n && e.addEventListener("close", () => n()),
            r && e.addEventListener("versionchange", (e) => r(e.oldVersion, e.newVersion, e)));
        })
        .catch(() => {}),
      c
    );
  }
  let D = ["get", "getKey", "getAll", "getAllKeys", "count"],
    N = ["put", "add", "delete", "clear"],
    C = new Map();
  function T(e, t) {
    if (!(e instanceof IDBDatabase && !(t in e) && "string" == typeof t)) return;
    if (C.get(t)) return C.get(t);
    let a = t.replace(/FromIndex$/, ""),
      s = t !== a,
      r = N.includes(a);
    if (!(a in (s ? IDBIndex : IDBObjectStore).prototype) || !(r || D.includes(a))) return;
    let n = async function (e, ...t) {
      let n = this.transaction(e, r ? "readwrite" : "readonly"),
        i = n.store;
      return (s && (i = i.index(t.shift())), (await Promise.all([i[a](...t), r && n.done]))[0]);
    };
    return (C.set(t, n), n);
  }
  E = {
    ...(e = E),
    get: (t, a, s) => T(t, a) || e.get(t, a, s),
    has: (t, a) => !!T(t, a) || e.has(t, a),
  };
  let P = ["continue", "continuePrimaryKey", "advance"],
    k = {},
    A = new WeakMap(),
    I = new WeakMap(),
    U = {
      get(e, t) {
        if (!P.includes(t)) return e[t];
        let a = k[t];
        return (
          a ||
            (a = k[t] =
              function (...e) {
                A.set(this, I.get(this)[t](...e));
              }),
          a
        );
      },
    };
  async function* L(...e) {
    let t = this;
    if ((t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)) return;
    let a = new Proxy(t, U);
    for (I.set(a, t), v.set(a, q(t)); t; )
      (yield a, (t = await (A.get(a) || t.continue())), A.delete(a));
  }
  function F(e, t) {
    return (
      (t === Symbol.asyncIterator && _(e, [IDBIndex, IDBObjectStore, IDBCursor])) ||
      ("iterate" === t && _(e, [IDBIndex, IDBObjectStore]))
    );
  }
  E = {
    ...(t = E),
    get: (e, a, s) => (F(e, a) ? L : t.get(e, a, s)),
    has: (e, a) => F(e, a) || t.has(e, a),
  };
  let M = async (e, t) => {
      let s = null;
      if ((e.url && (s = new URL(e.url).origin), s !== self.location.origin))
        throw new l("cross-origin-copy-response", { origin: s });
      let r = e.clone(),
        n = { headers: new Headers(r.headers), status: r.status, statusText: r.statusText },
        i = t ? t(n) : n,
        c = !(function () {
          if (void 0 === a) {
            let e = new Response("");
            if ("body" in e)
              try {
                (new Response(e.body), (a = !0));
              } catch {
                a = !1;
              }
            a = !1;
          }
          return a;
        })()
          ? await r.blob()
          : r.body;
      return new Response(c, i);
    },
    O = "requests",
    B = "queueName";
  var K = class {
      _db = null;
      async addEntry(e) {
        let t = (await this.getDb()).transaction(O, "readwrite", { durability: "relaxed" });
        (await t.store.add(e), await t.done);
      }
      async getFirstEntryId() {
        return (await (await this.getDb()).transaction(O).store.openCursor())?.value.id;
      }
      async getAllEntriesByQueueName(e) {
        return (await (await this.getDb()).getAllFromIndex(O, B, IDBKeyRange.only(e))) || [];
      }
      async getEntryCountByQueueName(e) {
        return (await this.getDb()).countFromIndex(O, B, IDBKeyRange.only(e));
      }
      async deleteEntry(e) {
        await (await this.getDb()).delete(O, e);
      }
      async getFirstEntryByQueueName(e) {
        return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "next");
      }
      async getLastEntryByQueueName(e) {
        return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "prev");
      }
      async getEndEntryFromIndex(e, t) {
        return (await (await this.getDb()).transaction(O).store.index(B).openCursor(e, t))?.value;
      }
      async getDb() {
        return (
          this._db ||
            (this._db = await S("serwist-background-sync", 3, { upgrade: this._upgradeDb })),
          this._db
        );
      }
      _upgradeDb(e, t) {
        (t > 0 && t < 3 && e.objectStoreNames.contains(O) && e.deleteObjectStore(O),
          e
            .createObjectStore(O, { autoIncrement: !0, keyPath: "id" })
            .createIndex(B, B, { unique: !1 }));
      }
    },
    W = class {
      _queueName;
      _queueDb;
      constructor(e) {
        ((this._queueName = e), (this._queueDb = new K()));
      }
      async pushEntry(e) {
        (delete e.id, (e.queueName = this._queueName), await this._queueDb.addEntry(e));
      }
      async unshiftEntry(e) {
        let t = await this._queueDb.getFirstEntryId();
        (t ? (e.id = t - 1) : delete e.id,
          (e.queueName = this._queueName),
          await this._queueDb.addEntry(e));
      }
      async popEntry() {
        return this._removeEntry(await this._queueDb.getLastEntryByQueueName(this._queueName));
      }
      async shiftEntry() {
        return this._removeEntry(await this._queueDb.getFirstEntryByQueueName(this._queueName));
      }
      async getAll() {
        return await this._queueDb.getAllEntriesByQueueName(this._queueName);
      }
      async size() {
        return await this._queueDb.getEntryCountByQueueName(this._queueName);
      }
      async deleteEntry(e) {
        await this._queueDb.deleteEntry(e);
      }
      async _removeEntry(e) {
        return (e && (await this.deleteEntry(e.id)), e);
      }
    };
  let j = [
    "method",
    "referrer",
    "referrerPolicy",
    "mode",
    "credentials",
    "cache",
    "redirect",
    "integrity",
    "keepalive",
  ];
  var $ = class e {
    _requestData;
    static async fromRequest(t) {
      let a = { url: t.url, headers: {} };
      for (let e of ("GET" !== t.method && (a.body = await t.clone().arrayBuffer()),
      t.headers.forEach((e, t) => {
        a.headers[t] = e;
      }),
      j))
        void 0 !== t[e] && (a[e] = t[e]);
      return new e(a);
    }
    constructor(e) {
      ("navigate" === e.mode && (e.mode = "same-origin"), (this._requestData = e));
    }
    toObject() {
      let e = Object.assign({}, this._requestData);
      return (
        (e.headers = Object.assign({}, this._requestData.headers)),
        e.body && (e.body = e.body.slice(0)),
        e
      );
    }
    toRequest() {
      return new Request(this._requestData.url, this._requestData);
    }
    clone() {
      return new e(this.toObject());
    }
  };
  let H = "serwist-background-sync",
    G = new Set(),
    Q = (e) => {
      let t = { request: new $(e.requestData).toRequest(), timestamp: e.timestamp };
      return (e.metadata && (t.metadata = e.metadata), t);
    };
  var V = class {
      _name;
      _onSync;
      _maxRetentionTime;
      _queueStore;
      _forceSyncFallback;
      _syncInProgress = !1;
      _requestsAddedDuringSync = !1;
      constructor(e, { forceSyncFallback: t, onSync: a, maxRetentionTime: s } = {}) {
        if (G.has(e)) throw new l("duplicate-queue-name", { name: e });
        (G.add(e),
          (this._name = e),
          (this._onSync = a || this.replayRequests),
          (this._maxRetentionTime = s || 10080),
          (this._forceSyncFallback = !!t),
          (this._queueStore = new W(this._name)),
          this._addSyncListener());
      }
      get name() {
        return this._name;
      }
      async pushRequest(e) {
        await this._addRequest(e, "push");
      }
      async unshiftRequest(e) {
        await this._addRequest(e, "unshift");
      }
      async popRequest() {
        return this._removeRequest("pop");
      }
      async shiftRequest() {
        return this._removeRequest("shift");
      }
      async getAll() {
        let e = await this._queueStore.getAll(),
          t = Date.now(),
          a = [];
        for (let s of e) {
          let e = 60 * this._maxRetentionTime * 1e3;
          t - s.timestamp > e ? await this._queueStore.deleteEntry(s.id) : a.push(Q(s));
        }
        return a;
      }
      async size() {
        return await this._queueStore.size();
      }
      async _addRequest({ request: e, metadata: t, timestamp: a = Date.now() }, s) {
        let r = { requestData: (await $.fromRequest(e.clone())).toObject(), timestamp: a };
        switch ((t && (r.metadata = t), s)) {
          case "push":
            await this._queueStore.pushEntry(r);
            break;
          case "unshift":
            await this._queueStore.unshiftEntry(r);
        }
        this._syncInProgress ? (this._requestsAddedDuringSync = !0) : await this.registerSync();
      }
      async _removeRequest(e) {
        let t,
          a = Date.now();
        switch (e) {
          case "pop":
            t = await this._queueStore.popEntry();
            break;
          case "shift":
            t = await this._queueStore.shiftEntry();
        }
        if (t) {
          let s = 60 * this._maxRetentionTime * 1e3;
          return a - t.timestamp > s ? this._removeRequest(e) : Q(t);
        }
      }
      async replayRequests() {
        let e;
        for (; (e = await this.shiftRequest()); )
          try {
            await fetch(e.request.clone());
          } catch {
            throw (
              await this.unshiftRequest(e),
              new l("queue-replay-failed", { name: this._name })
            );
          }
      }
      async registerSync() {
        if ("sync" in self.registration && !this._forceSyncFallback)
          try {
            await self.registration.sync.register(`${H}:${this._name}`);
          } catch (e) {}
      }
      _addSyncListener() {
        "sync" in self.registration && !this._forceSyncFallback
          ? self.addEventListener("sync", (e) => {
              if (e.tag === `${H}:${this._name}`) {
                let t = async () => {
                  let t;
                  this._syncInProgress = !0;
                  try {
                    await this._onSync({ queue: this });
                  } catch (e) {
                    if (e instanceof Error) throw e;
                  } finally {
                    (this._requestsAddedDuringSync &&
                      !(t && !e.lastChance) &&
                      (await this.registerSync()),
                      (this._syncInProgress = !1),
                      (this._requestsAddedDuringSync = !1));
                  }
                };
                e.waitUntil(t());
              }
            })
          : this._onSync({ queue: this });
      }
      static get _queueNames() {
        return G;
      }
    },
    z = class {
      _queue;
      constructor(e, t) {
        this._queue = new V(e, t);
      }
      async fetchDidFail({ request: e }) {
        await this._queue.pushRequest({ request: e });
      }
    };
  let J = {
    cacheWillUpdate: async ({ response: e }) => (200 === e.status || 0 === e.status ? e : null),
  };
  function X(e) {
    return "string" == typeof e ? new Request(e) : e;
  }
  var Y = class {
      event;
      request;
      url;
      params;
      _cacheKeys = {};
      _strategy;
      _handlerDeferred;
      _extendLifetimePromises;
      _plugins;
      _pluginStateMap;
      constructor(e, t) {
        for (const a of ((this.event = t.event),
        (this.request = t.request),
        t.url && ((this.url = t.url), (this.params = t.params)),
        (this._strategy = e),
        (this._handlerDeferred = new f()),
        (this._extendLifetimePromises = []),
        (this._plugins = [...e.plugins]),
        (this._pluginStateMap = new Map()),
        this._plugins))
          this._pluginStateMap.set(a, {});
        this.event.waitUntil(this._handlerDeferred.promise);
      }
      async fetch(e) {
        let { event: t } = this,
          a = X(e),
          s = await this.getPreloadResponse();
        if (s) return s;
        let r = this.hasCallback("fetchDidFail") ? a.clone() : null;
        try {
          for (let e of this.iterateCallbacks("requestWillFetch"))
            a = await e({ request: a.clone(), event: t });
        } catch (e) {
          if (e instanceof Error)
            throw new l("plugin-error-request-will-fetch", { thrownErrorMessage: e.message });
        }
        let n = a.clone();
        try {
          let e;
          for (let s of ((e = await fetch(
            a,
            "navigate" === a.mode ? void 0 : this._strategy.fetchOptions,
          )),
          this.iterateCallbacks("fetchDidSucceed")))
            e = await s({ event: t, request: n, response: e });
          return e;
        } catch (e) {
          throw (
            r &&
              (await this.runCallbacks("fetchDidFail", {
                error: e,
                event: t,
                originalRequest: r.clone(),
                request: n.clone(),
              })),
            e
          );
        }
      }
      async fetchAndCachePut(e) {
        let t = await this.fetch(e),
          a = t.clone();
        return (this.waitUntil(this.cachePut(e, a)), t);
      }
      async cacheMatch(e) {
        let t,
          a = X(e),
          { cacheName: s, matchOptions: r } = this._strategy,
          n = await this.getCacheKey(a, "read"),
          i = { ...r, cacheName: s };
        for (let e of ((t = await caches.match(n, i)),
        this.iterateCallbacks("cachedResponseWillBeUsed")))
          t =
            (await e({
              cacheName: s,
              matchOptions: r,
              cachedResponse: t,
              request: n,
              event: this.event,
            })) || void 0;
        return t;
      }
      async cachePut(e, t) {
        let a = X(e);
        await h(0);
        let s = await this.getCacheKey(a, "write");
        if (!t)
          throw new l("cache-put-with-no-response", {
            url: new URL(String(s.url), location.href).href.replace(
              RegExp(`^${location.origin}`),
              "",
            ),
          });
        let r = await this._ensureResponseSafeToCache(t);
        if (!r) return !1;
        let { cacheName: n, matchOptions: i } = this._strategy,
          c = await self.caches.open(n),
          o = this.hasCallback("cacheDidUpdate"),
          u = o ? await m(c, s.clone(), ["__WB_REVISION__"], i) : null;
        try {
          await c.put(s, o ? r.clone() : r);
        } catch (e) {
          if (e instanceof Error) throw ("QuotaExceededError" === e.name && (await g()), e);
        }
        for (let e of this.iterateCallbacks("cacheDidUpdate"))
          await e({
            cacheName: n,
            oldResponse: u,
            newResponse: r.clone(),
            request: s,
            event: this.event,
          });
        return !0;
      }
      async getCacheKey(e, t) {
        let a = `${e.url} | ${t}`;
        if (!this._cacheKeys[a]) {
          let s = e;
          for (let e of this.iterateCallbacks("cacheKeyWillBeUsed"))
            s = X(await e({ mode: t, request: s, event: this.event, params: this.params }));
          this._cacheKeys[a] = s;
        }
        return this._cacheKeys[a];
      }
      hasCallback(e) {
        for (let t of this._strategy.plugins) if (e in t) return !0;
        return !1;
      }
      async runCallbacks(e, t) {
        for (let a of this.iterateCallbacks(e)) await a(t);
      }
      *iterateCallbacks(e) {
        for (let t of this._strategy.plugins)
          if ("function" == typeof t[e]) {
            let a = this._pluginStateMap.get(t),
              s = (s) => {
                let r = { ...s, state: a };
                return t[e](r);
              };
            yield s;
          }
      }
      waitUntil(e) {
        return (this._extendLifetimePromises.push(e), e);
      }
      async doneWaiting() {
        let e;
        for (; (e = this._extendLifetimePromises.shift()); ) await e;
      }
      destroy() {
        this._handlerDeferred.resolve(null);
      }
      async getPreloadResponse() {
        if (
          this.event instanceof FetchEvent &&
          "navigate" === this.event.request.mode &&
          "preloadResponse" in this.event
        )
          try {
            let e = await this.event.preloadResponse;
            if (e) return e;
          } catch (e) {
            return;
          }
      }
      async _ensureResponseSafeToCache(e) {
        let t = e,
          a = !1;
        for (let e of this.iterateCallbacks("cacheWillUpdate"))
          if (
            ((t = (await e({ request: this.request, response: t, event: this.event })) || void 0),
            (a = !0),
            !t)
          )
            break;
        return (!a && t && 200 !== t.status && (t = void 0), t);
      }
    },
    Z = class {
      cacheName;
      plugins;
      fetchOptions;
      matchOptions;
      constructor(e = {}) {
        ((this.cacheName = o(e.cacheName)),
          (this.plugins = e.plugins || []),
          (this.fetchOptions = e.fetchOptions),
          (this.matchOptions = e.matchOptions));
      }
      handle(e) {
        let [t] = this.handleAll(e);
        return t;
      }
      handleAll(e) {
        e instanceof FetchEvent && (e = { event: e, request: e.request });
        let t = e.event,
          a = "string" == typeof e.request ? new Request(e.request) : e.request,
          s = new Y(
            this,
            e.url
              ? { event: t, request: a, url: e.url, params: e.params }
              : { event: t, request: a },
          ),
          r = this._getResponse(s, a, t);
        return [r, this._awaitComplete(r, s, a, t)];
      }
      async _getResponse(e, t, a) {
        let s;
        await e.runCallbacks("handlerWillStart", { event: a, request: t });
        try {
          if (((s = await this._handle(t, e)), void 0 === s || "error" === s.type))
            throw new l("no-response", { url: t.url });
        } catch (r) {
          if (r instanceof Error) {
            for (let n of e.iterateCallbacks("handlerDidError"))
              if (void 0 !== (s = await n({ error: r, event: a, request: t }))) break;
          }
          if (!s) throw r;
        }
        for (let r of e.iterateCallbacks("handlerWillRespond"))
          s = await r({ event: a, request: t, response: s });
        return s;
      }
      async _awaitComplete(e, t, a, s) {
        let r, n;
        try {
          r = await e;
        } catch {}
        try {
          (await t.runCallbacks("handlerDidRespond", { event: s, request: a, response: r }),
            await t.doneWaiting());
        } catch (e) {
          e instanceof Error && (n = e);
        }
        if (
          (await t.runCallbacks("handlerDidComplete", {
            event: s,
            request: a,
            response: r,
            error: n,
          }),
          t.destroy(),
          n)
        )
          throw n;
      }
    },
    ee = class extends Z {
      _networkTimeoutSeconds;
      constructor(e = {}) {
        (super(e),
          this.plugins.some((e) => "cacheWillUpdate" in e) || this.plugins.unshift(J),
          (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0));
      }
      async _handle(e, t) {
        let a,
          s = [],
          r = [];
        if (this._networkTimeoutSeconds) {
          let { id: n, promise: i } = this._getTimeoutPromise({ request: e, logs: s, handler: t });
          ((a = n), r.push(i));
        }
        let n = this._getNetworkPromise({ timeoutId: a, request: e, logs: s, handler: t });
        r.push(n);
        let i = await t.waitUntil(
          (async () => (await t.waitUntil(Promise.race(r))) || (await n))(),
        );
        if (!i) throw new l("no-response", { url: e.url });
        return i;
      }
      _getTimeoutPromise({ request: e, logs: t, handler: a }) {
        let s;
        return {
          promise: new Promise((t) => {
            s = setTimeout(async () => {
              t(await a.cacheMatch(e));
            }, 1e3 * this._networkTimeoutSeconds);
          }),
          id: s,
        };
      }
      async _getNetworkPromise({ timeoutId: e, request: t, logs: a, handler: s }) {
        let r, n;
        try {
          n = await s.fetchAndCachePut(t);
        } catch (e) {
          e instanceof Error && (r = e);
        }
        return (e && clearTimeout(e), (r || !n) && (n = await s.cacheMatch(t)), n);
      }
    },
    et = class extends Z {
      _networkTimeoutSeconds;
      constructor(e = {}) {
        (super(e), (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0));
      }
      async _handle(e, t) {
        let a, s;
        try {
          let a = [t.fetch(e)];
          if (this._networkTimeoutSeconds) {
            let e = h(1e3 * this._networkTimeoutSeconds);
            a.push(e);
          }
          if (!(s = await Promise.race(a)))
            throw Error(
              `Timed out the network response after ${this._networkTimeoutSeconds} seconds.`,
            );
        } catch (e) {
          e instanceof Error && (a = e);
        }
        if (!s) throw new l("no-response", { url: e.url, error: a });
        return s;
      }
    };
  let ea = (e) => (e && "object" == typeof e ? e : { handle: e });
  var es = class {
      handler;
      match;
      method;
      catchHandler;
      constructor(e, t, a = "GET") {
        ((this.handler = ea(t)), (this.match = e), (this.method = a));
      }
      setCatchHandler(e) {
        this.catchHandler = ea(e);
      }
    },
    er = class e extends Z {
      _fallbackToNetwork;
      static defaultPrecacheCacheabilityPlugin = {
        cacheWillUpdate: async ({ response: e }) => (!e || e.status >= 400 ? null : e),
      };
      static copyRedirectedCacheableResponsesPlugin = {
        cacheWillUpdate: async ({ response: e }) => (e.redirected ? await M(e) : e),
      };
      constructor(t = {}) {
        ((t.cacheName = c(t.cacheName)),
          super(t),
          (this._fallbackToNetwork = !1 !== t.fallbackToNetwork),
          this.plugins.push(e.copyRedirectedCacheableResponsesPlugin));
      }
      async _handle(e, t) {
        let a = await t.getPreloadResponse();
        if (a) return a;
        let s = await t.cacheMatch(e);
        return (
          s ||
          (t.event && "install" === t.event.type
            ? await this._handleInstall(e, t)
            : await this._handleFetch(e, t))
        );
      }
      async _handleFetch(e, t) {
        let a,
          s = t.params || {};
        if (this._fallbackToNetwork) {
          let r = s.integrity,
            n = e.integrity,
            i = !n || n === r;
          ((a = await t.fetch(
            new Request(e, { integrity: "no-cors" !== e.mode ? n || r : void 0 }),
          )),
            r &&
              i &&
              "no-cors" !== e.mode &&
              (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, a.clone())));
        } else throw new l("missing-precache-entry", { cacheName: this.cacheName, url: e.url });
        return a;
      }
      async _handleInstall(e, t) {
        this._useDefaultCacheabilityPluginIfNeeded();
        let a = await t.fetch(e);
        if (!(await t.cachePut(e, a.clone())))
          throw new l("bad-precaching-response", { url: e.url, status: a.status });
        return a;
      }
      _useDefaultCacheabilityPluginIfNeeded() {
        let t = null,
          a = 0;
        for (let [s, r] of this.plugins.entries())
          r !== e.copyRedirectedCacheableResponsesPlugin &&
            (r === e.defaultPrecacheCacheabilityPlugin && (t = s), r.cacheWillUpdate && a++);
        0 === a
          ? this.plugins.push(e.defaultPrecacheCacheabilityPlugin)
          : a > 1 && null !== t && this.plugins.splice(t, 1);
      }
    },
    en = class extends es {
      _allowlist;
      _denylist;
      constructor(e, { allowlist: t = [/./], denylist: a = [] } = {}) {
        (super((e) => this._match(e), e), (this._allowlist = t), (this._denylist = a));
      }
      _match({ url: e, request: t }) {
        if (t && "navigate" !== t.mode) return !1;
        let a = e.pathname + e.search;
        for (let e of this._denylist) if (e.test(a)) return !1;
        return !!this._allowlist.some((e) => e.test(a));
      }
    },
    ei = class extends es {
      constructor(e, t, a) {
        super(
          ({ url: t }) => {
            let a = e.exec(t.href);
            if (a) return t.origin !== location.origin && 0 !== a.index ? void 0 : a.slice(1);
          },
          t,
          a,
        );
      }
    };
  let ec = (e) => {
    if (!e) throw new l("add-to-cache-list-unexpected-type", { entry: e });
    if ("string" == typeof e) {
      let t = new URL(e, location.href);
      return { cacheKey: t.href, url: t.href };
    }
    let { revision: t, url: a } = e;
    if (!a) throw new l("add-to-cache-list-unexpected-type", { entry: e });
    if (!t) {
      let e = new URL(a, location.href);
      return { cacheKey: e.href, url: e.href };
    }
    let s = new URL(a, location.href),
      r = new URL(a, location.href);
    return (s.searchParams.set("__WB_REVISION__", t), { cacheKey: s.href, url: r.href });
  };
  var eo = class {
    updatedURLs = [];
    notUpdatedURLs = [];
    handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    };
    cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: a }) => {
      if ("install" === e.type && t?.originalRequest && t.originalRequest instanceof Request) {
        let e = t.originalRequest.url;
        a ? this.notUpdatedURLs.push(e) : this.updatedURLs.push(e);
      }
      return a;
    };
  };
  let el = async (e, t, a) => {
    let s = t.map((e, t) => ({ index: t, item: e })),
      r = async (e) => {
        let t = [];
        for (;;) {
          let r = s.pop();
          if (!r) return e(t);
          let n = await a(r.item);
          t.push({ result: n, index: r.index });
        }
      },
      n = Array.from({ length: e }, () => new Promise(r));
    return (await Promise.all(n))
      .flat()
      .sort((e, t) => (e.index < t.index ? -1 : 1))
      .map((e) => e.result);
  };
  "u" > typeof navigator && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  let eh = "cache-entries",
    eu = (e) => {
      let t = new URL(e, location.href);
      return ((t.hash = ""), t.href);
    };
  var ed = class {
      _cacheName;
      _db = null;
      constructor(e) {
        this._cacheName = e;
      }
      _getId(e) {
        return `${this._cacheName}|${eu(e)}`;
      }
      _upgradeDb(e) {
        let t = e.createObjectStore(eh, { keyPath: "id" });
        (t.createIndex("cacheName", "cacheName", { unique: !1 }),
          t.createIndex("timestamp", "timestamp", { unique: !1 }));
      }
      _upgradeDbAndDeleteOldDbs(e) {
        (this._upgradeDb(e),
          this._cacheName &&
            (function (e, { blocked: t } = {}) {
              let a = indexedDB.deleteDatabase(e);
              (t && a.addEventListener("blocked", (e) => t(e.oldVersion, e)),
                R(a).then(() => void 0));
            })(this._cacheName));
      }
      async setTimestamp(e, t) {
        e = eu(e);
        let a = { id: this._getId(e), cacheName: this._cacheName, url: e, timestamp: t },
          s = (await this.getDb()).transaction(eh, "readwrite", { durability: "relaxed" });
        (await s.store.put(a), await s.done);
      }
      async getTimestamp(e) {
        return (await (await this.getDb()).get(eh, this._getId(e)))?.timestamp;
      }
      async expireEntries(e, t) {
        let a = await (await this.getDb())
            .transaction(eh, "readwrite")
            .store.index("timestamp")
            .openCursor(null, "prev"),
          s = [],
          r = 0;
        for (; a; ) {
          let n = a.value;
          (n.cacheName === this._cacheName &&
            ((e && n.timestamp < e) || (t && r >= t) ? (a.delete(), s.push(n.url)) : r++),
            (a = await a.continue()));
        }
        return s;
      }
      async getDb() {
        return (
          this._db ||
            (this._db = await S("serwist-expiration", 1, {
              upgrade: this._upgradeDbAndDeleteOldDbs.bind(this),
            })),
          this._db
        );
      }
    },
    em = class {
      _isRunning = !1;
      _rerunRequested = !1;
      _maxEntries;
      _maxAgeSeconds;
      _matchOptions;
      _cacheName;
      _timestampModel;
      constructor(e, t = {}) {
        ((this._maxEntries = t.maxEntries),
          (this._maxAgeSeconds = t.maxAgeSeconds),
          (this._matchOptions = t.matchOptions),
          (this._cacheName = e),
          (this._timestampModel = new ed(e)));
      }
      async expireEntries() {
        if (this._isRunning) {
          this._rerunRequested = !0;
          return;
        }
        this._isRunning = !0;
        let e = this._maxAgeSeconds ? Date.now() - 1e3 * this._maxAgeSeconds : 0,
          t = await this._timestampModel.expireEntries(e, this._maxEntries),
          a = await self.caches.open(this._cacheName);
        for (let e of t) await a.delete(e, this._matchOptions);
        ((this._isRunning = !1),
          this._rerunRequested && ((this._rerunRequested = !1), this.expireEntries()));
      }
      async updateTimestamp(e) {
        await this._timestampModel.setTimestamp(e, Date.now());
      }
      async isURLExpired(e) {
        if (!this._maxAgeSeconds) return !1;
        let t = await this._timestampModel.getTimestamp(e),
          a = Date.now() - 1e3 * this._maxAgeSeconds;
        return void 0 === t || t < a;
      }
      async delete() {
        ((this._rerunRequested = !1), await this._timestampModel.expireEntries(1 / 0));
      }
    },
    ef = class {
      _config;
      _cacheExpirations;
      constructor(e = {}) {
        ((this._config = e),
          (this._cacheExpirations = new Map()),
          this._config.maxAgeFrom || (this._config.maxAgeFrom = "last-fetched"),
          this._config.purgeOnQuotaError &&
            ((e) => {
              u.add(e);
            })(() => this.deleteCacheAndMetadata()));
      }
      _getCacheExpiration(e) {
        if (e === o()) throw new l("expire-custom-caches-only");
        let t = this._cacheExpirations.get(e);
        return (t || ((t = new em(e, this._config)), this._cacheExpirations.set(e, t)), t);
      }
      cachedResponseWillBeUsed({ event: e, cacheName: t, request: a, cachedResponse: s }) {
        if (!s) return null;
        let r = this._isResponseDateFresh(s),
          n = this._getCacheExpiration(t),
          i = "last-used" === this._config.maxAgeFrom,
          c = (async () => {
            (i && (await n.updateTimestamp(a.url)), await n.expireEntries());
          })();
        try {
          e.waitUntil(c);
        } catch {}
        return r ? s : null;
      }
      _isResponseDateFresh(e) {
        if ("last-used" === this._config.maxAgeFrom) return !0;
        let t = Date.now();
        if (!this._config.maxAgeSeconds) return !0;
        let a = this._getDateHeaderTimestamp(e);
        return null === a || a >= t - 1e3 * this._config.maxAgeSeconds;
      }
      _getDateHeaderTimestamp(e) {
        if (!e.headers.has("date")) return null;
        let t = new Date(e.headers.get("date")).getTime();
        return Number.isNaN(t) ? null : t;
      }
      async cacheDidUpdate({ cacheName: e, request: t }) {
        let a = this._getCacheExpiration(e);
        (await a.updateTimestamp(t.url), await a.expireEntries());
      }
      async deleteCacheAndMetadata() {
        for (let [e, t] of this._cacheExpirations) (await self.caches.delete(e), await t.delete());
        this._cacheExpirations = new Map();
      }
    };
  let eg = /^\/(\w+\/)?collect/,
    ew = ({ serwist: e, cacheName: t, ...a }) => {
      let s,
        r,
        c = t || i(n.googleAnalytics),
        o = new z("serwist-google-analytics", {
          maxRetentionTime: 2880,
          onSync: async ({ queue: e }) => {
            let t;
            for (; (t = await e.shiftRequest()); ) {
              let { request: s, timestamp: r } = t,
                n = new URL(s.url);
              try {
                let e =
                    "POST" === s.method
                      ? new URLSearchParams(await s.clone().text())
                      : n.searchParams,
                  t = r - (Number(e.get("qt")) || 0),
                  i = Date.now() - t;
                if ((e.set("qt", String(i)), a.parameterOverrides))
                  for (let t of Object.keys(a.parameterOverrides)) {
                    let s = a.parameterOverrides[t];
                    e.set(t, s);
                  }
                ("function" == typeof a.hitFilter && a.hitFilter.call(null, e),
                  await fetch(
                    new Request(n.origin + n.pathname, {
                      body: e.toString(),
                      method: "POST",
                      mode: "cors",
                      credentials: "omit",
                      headers: { "Content-Type": "text/plain" },
                    }),
                  ));
              } catch (a) {
                throw (await e.unshiftRequest(t), a);
              }
            }
          },
        });
      for (let t of [
        new es(
          ({ url: e }) => "www.googletagmanager.com" === e.hostname && "/gtm.js" === e.pathname,
          new ee({ cacheName: c }),
          "GET",
        ),
        new es(
          ({ url: e }) =>
            "www.google-analytics.com" === e.hostname && "/analytics.js" === e.pathname,
          new ee({ cacheName: c }),
          "GET",
        ),
        new es(
          ({ url: e }) => "www.googletagmanager.com" === e.hostname && "/gtag/js" === e.pathname,
          new ee({ cacheName: c }),
          "GET",
        ),
        new es(
          (s = ({ url: e }) => "www.google-analytics.com" === e.hostname && eg.test(e.pathname)),
          (r = new et({ plugins: [o] })),
          "GET",
        ),
        new es(s, r, "POST"),
      ])
        e.registerRoute(t);
    };
  var ep = class {
    _fallbackUrls;
    _serwist;
    constructor({ fallbackUrls: e, serwist: t }) {
      ((this._fallbackUrls = e), (this._serwist = t));
    }
    async handlerDidError(e) {
      for (let t of this._fallbackUrls)
        if ("string" == typeof t) {
          let e = await this._serwist.matchPrecache(t);
          if (void 0 !== e) return e;
        } else if (t.matcher(e)) {
          let e = await this._serwist.matchPrecache(t.url);
          if (void 0 !== e) return e;
        }
    }
  };
  let ey = async (e, t) => {
    try {
      if (206 === t.status) return t;
      let a = e.headers.get("range");
      if (!a) throw new l("no-range-header");
      let s = ((e) => {
          let t = e.trim().toLowerCase();
          if (!t.startsWith("bytes="))
            throw new l("unit-must-be-bytes", { normalizedRangeHeader: t });
          if (t.includes(",")) throw new l("single-range-only", { normalizedRangeHeader: t });
          let a = /(\d*)-(\d*)/.exec(t);
          if (!a || !(a[1] || a[2]))
            throw new l("invalid-range-values", { normalizedRangeHeader: t });
          return {
            start: "" === a[1] ? void 0 : Number(a[1]),
            end: "" === a[2] ? void 0 : Number(a[2]),
          };
        })(a),
        r = await t.blob(),
        n = ((e, t, a) => {
          let s,
            r,
            n = e.size;
          if ((a && a > n) || (t && t < 0))
            throw new l("range-not-satisfiable", { size: n, end: a, start: t });
          return (
            void 0 !== t && void 0 !== a
              ? ((s = t), (r = a + 1))
              : void 0 !== t && void 0 === a
                ? ((s = t), (r = n))
                : void 0 !== a && void 0 === t && ((s = n - a), (r = n)),
            { start: s, end: r }
          );
        })(r, s.start, s.end),
        i = r.slice(n.start, n.end),
        c = i.size,
        o = new Response(i, { status: 206, statusText: "Partial Content", headers: t.headers });
      return (
        o.headers.set("Content-Length", String(c)),
        o.headers.set("Content-Range", `bytes ${n.start}-${n.end - 1}/${r.size}`),
        o
      );
    } catch (e) {
      return new Response("", { status: 416, statusText: "Range Not Satisfiable" });
    }
  };
  var e_ = class {
      cachedResponseWillBeUsed = async ({ request: e, cachedResponse: t }) =>
        t && e.headers.has("range") ? await ey(e, t) : t;
    },
    ex = class extends Z {
      async _handle(e, t) {
        let a,
          s = await t.cacheMatch(e);
        if (s);
        else
          try {
            s = await t.fetchAndCachePut(e);
          } catch (e) {
            e instanceof Error && (a = e);
          }
        if (!s) throw new l("no-response", { url: e.url, error: a });
        return s;
      }
    },
    eb = class extends Z {
      constructor(e = {}) {
        (super(e), this.plugins.some((e) => "cacheWillUpdate" in e) || this.plugins.unshift(J));
      }
      async _handle(e, t) {
        let a,
          s = t.fetchAndCachePut(e).catch(() => {});
        t.waitUntil(s);
        let r = await t.cacheMatch(e);
        if (r);
        else
          try {
            r = await s;
          } catch (e) {
            e instanceof Error && (a = e);
          }
        if (!r) throw new l("no-response", { url: e.url, error: a });
        return r;
      }
    },
    ev = class extends es {
      constructor(e, t) {
        super(({ request: a }) => {
          let s = e.getUrlsToPrecacheKeys();
          for (let r of (function* (
            e,
            {
              directoryIndex: t = "index.html",
              ignoreURLParametersMatching: a = [/^utm_/, /^fbclid$/],
              cleanURLs: s = !0,
              urlManipulation: r,
            } = {},
          ) {
            let n = new URL(e, location.href);
            ((n.hash = ""), yield n.href);
            let i = ((e, t = []) => {
              for (let a of [...e.searchParams.keys()])
                t.some((e) => e.test(a)) && e.searchParams.delete(a);
              return e;
            })(n, a);
            if ((yield i.href, t && i.pathname.endsWith("/"))) {
              let e = new URL(i.href);
              ((e.pathname += t), yield e.href);
            }
            if (s) {
              let e = new URL(i.href);
              ((e.pathname += ".html"), yield e.href);
            }
            if (r) for (let e of r({ url: n })) yield e.href;
          })(a.url, t)) {
            let t = s.get(r);
            if (t) return { cacheKey: t, integrity: e.getIntegrityForPrecacheKey(t) };
          }
        }, e.precacheStrategy);
      }
    },
    eE = class {
      _precacheController;
      constructor({ precacheController: e }) {
        this._precacheController = e;
      }
      cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
        let a = t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url);
        return a ? new Request(a, { headers: e.headers }) : e;
      };
    },
    eR = class {
      _urlsToCacheKeys = new Map();
      _urlsToCacheModes = new Map();
      _cacheKeysToIntegrities = new Map();
      _concurrentPrecaching;
      _precacheStrategy;
      _routes;
      _defaultHandlerMap;
      _catchHandler;
      _requestRules;
      constructor({
        precacheEntries: e,
        precacheOptions: t,
        skipWaiting: a = !1,
        importScripts: s,
        navigationPreload: r = !1,
        cacheId: i,
        clientsClaim: o = !1,
        runtimeCaching: l,
        offlineAnalyticsConfig: h,
        disableDevLogs: u = !1,
        fallbacks: d,
        requestRules: m,
      } = {}) {
        const {
          precacheStrategyOptions: f,
          precacheRouteOptions: g,
          precacheMiscOptions: w,
        } = ((e, t = {}) => {
          let {
            cacheName: a,
            plugins: s = [],
            fetchOptions: r,
            matchOptions: n,
            fallbackToNetwork: i,
            directoryIndex: o,
            ignoreURLParametersMatching: l,
            cleanURLs: h,
            urlManipulation: u,
            cleanupOutdatedCaches: d,
            concurrency: m = 10,
            navigateFallback: f,
            navigateFallbackAllowlist: g,
            navigateFallbackDenylist: w,
          } = t ?? {};
          return {
            precacheStrategyOptions: {
              cacheName: c(a),
              plugins: [...s, new eE({ precacheController: e })],
              fetchOptions: r,
              matchOptions: n,
              fallbackToNetwork: i,
            },
            precacheRouteOptions: {
              directoryIndex: o,
              ignoreURLParametersMatching: l,
              cleanURLs: h,
              urlManipulation: u,
            },
            precacheMiscOptions: {
              cleanupOutdatedCaches: d,
              concurrency: m,
              navigateFallback: f,
              navigateFallbackAllowlist: g,
              navigateFallbackDenylist: w,
            },
          };
        })(this, t);
        if (
          ((this._concurrentPrecaching = w.concurrency),
          (this._precacheStrategy = new er(f)),
          (this._routes = new Map()),
          (this._defaultHandlerMap = new Map()),
          (this._requestRules = m),
          (this.handleInstall = this.handleInstall.bind(this)),
          (this.handleActivate = this.handleActivate.bind(this)),
          (this.handleFetch = this.handleFetch.bind(this)),
          (this.handleCache = this.handleCache.bind(this)),
          s && s.length > 0 && self.importScripts(...s),
          r &&
            self.registration?.navigationPreload &&
            self.addEventListener("activate", (e) => {
              e.waitUntil(self.registration.navigationPreload.enable().then(() => {}));
            }),
          void 0 !== i &&
            ((e) => {
              var t = e;
              for (let e of Object.keys(n))
                ((e) => {
                  let a = t[e];
                  "string" == typeof a && (n[e] = a);
                })(e);
            })({ prefix: i }),
          a
            ? self.skipWaiting()
            : self.addEventListener("message", (e) => {
                e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
              }),
          o && self.addEventListener("activate", () => self.clients.claim()),
          e && e.length > 0 && this.addToPrecacheList(e),
          w.cleanupOutdatedCaches &&
            ((e) => {
              self.addEventListener("activate", (t) => {
                t.waitUntil(p(c(e)).then((e) => {}));
              });
            })(f.cacheName),
          this.registerRoute(new ev(this, g)),
          w.navigateFallback &&
            this.registerRoute(
              new en(this.createHandlerBoundToUrl(w.navigateFallback), {
                allowlist: w.navigateFallbackAllowlist,
                denylist: w.navigateFallbackDenylist,
              }),
            ),
          void 0 !== h &&
            ("boolean" == typeof h ? h && ew({ serwist: this }) : ew({ ...h, serwist: this })),
          void 0 !== l)
        ) {
          if (void 0 !== d) {
            const e = new ep({ fallbackUrls: d.entries, serwist: this });
            l.forEach((t) => {
              t.handler instanceof Z &&
                !t.handler.plugins.some((e) => "handlerDidError" in e) &&
                t.handler.plugins.push(e);
            });
          }
          for (const e of l) this.registerCapture(e.matcher, e.handler, e.method);
        }
        u && (self.__WB_DISABLE_DEV_LOGS = !0);
      }
      get precacheStrategy() {
        return this._precacheStrategy;
      }
      get routes() {
        return this._routes;
      }
      addEventListeners() {
        (self.addEventListener("install", this.handleInstall),
          self.addEventListener("activate", this.handleActivate),
          self.addEventListener("fetch", this.handleFetch),
          self.addEventListener("message", this.handleCache));
      }
      addToPrecacheList(e) {
        let t = [];
        for (let a of e) {
          "string" == typeof a
            ? t.push(a)
            : a && !a.integrity && void 0 === a.revision && t.push(a.url);
          let { cacheKey: e, url: s } = ec(a),
            r = "string" != typeof a && a.revision ? "reload" : "default";
          if (this._urlsToCacheKeys.has(s) && this._urlsToCacheKeys.get(s) !== e)
            throw new l("add-to-cache-list-conflicting-entries", {
              firstEntry: this._urlsToCacheKeys.get(s),
              secondEntry: e,
            });
          if ("string" != typeof a && a.integrity) {
            if (
              this._cacheKeysToIntegrities.has(e) &&
              this._cacheKeysToIntegrities.get(e) !== a.integrity
            )
              throw new l("add-to-cache-list-conflicting-integrities", { url: s });
            this._cacheKeysToIntegrities.set(e, a.integrity);
          }
          (this._urlsToCacheKeys.set(s, e), this._urlsToCacheModes.set(s, r));
        }
        t.length > 0 &&
          console.warn(`Serwist is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`);
      }
      handleInstall(e) {
        return (
          this.registerRequestRules(e),
          y(e, async () => {
            let t = new eo();
            (this.precacheStrategy.plugins.push(t),
              await el(
                this._concurrentPrecaching,
                Array.from(this._urlsToCacheKeys.entries()),
                async ([t, a]) => {
                  let s = this._cacheKeysToIntegrities.get(a),
                    r = this._urlsToCacheModes.get(t),
                    n = new Request(t, { integrity: s, cache: r, credentials: "same-origin" });
                  await Promise.all(
                    this.precacheStrategy.handleAll({
                      event: e,
                      request: n,
                      url: new URL(n.url),
                      params: { cacheKey: a },
                    }),
                  );
                },
              ));
            let { updatedURLs: a, notUpdatedURLs: s } = t;
            return { updatedURLs: a, notUpdatedURLs: s };
          })
        );
      }
      async registerRequestRules(e) {
        if (this._requestRules && e?.addRoutes)
          try {
            (await e.addRoutes(this._requestRules), (this._requestRules = void 0));
          } catch (e) {
            throw e;
          }
      }
      handleActivate(e) {
        return y(e, async () => {
          let e = await self.caches.open(this.precacheStrategy.cacheName),
            t = await e.keys(),
            a = new Set(this._urlsToCacheKeys.values()),
            s = [];
          for (let r of t) a.has(r.url) || (await e.delete(r), s.push(r.url));
          return { deletedCacheRequests: s };
        });
      }
      handleFetch(e) {
        let { request: t } = e,
          a = this.handleRequest({ request: t, event: e });
        a && e.respondWith(a);
      }
      handleCache(e) {
        if (e.data && "CACHE_URLS" === e.data.type) {
          let { payload: t } = e.data,
            a = Promise.all(
              t.urlsToCache.map((t) => {
                let a;
                return (
                  (a = "string" == typeof t ? new Request(t) : new Request(...t)),
                  this.handleRequest({ request: a, event: e })
                );
              }),
            );
          (e.waitUntil(a), e.ports?.[0] && a.then(() => e.ports[0].postMessage(!0)));
        }
      }
      setDefaultHandler(e, t = "GET") {
        this._defaultHandlerMap.set(t, ea(e));
      }
      setCatchHandler(e) {
        this._catchHandler = ea(e);
      }
      registerCapture(e, t, a) {
        let s = ((e, t, a) => {
          if ("string" == typeof e) {
            let s = new URL(e, location.href);
            return new es(({ url: e }) => e.href === s.href, t, a);
          }
          if (e instanceof RegExp) return new ei(e, t, a);
          if ("function" == typeof e) return new es(e, t, a);
          if (e instanceof es) return e;
          throw new l("unsupported-route-type", {
            moduleName: "serwist",
            funcName: "parseRoute",
            paramName: "capture",
          });
        })(e, t, a);
        return (this.registerRoute(s), s);
      }
      registerRoute(e) {
        (this._routes.has(e.method) || this._routes.set(e.method, []),
          this._routes.get(e.method).push(e));
      }
      unregisterRoute(e) {
        if (!this._routes.has(e.method))
          throw new l("unregister-route-but-not-found-with-method", { method: e.method });
        let t = this._routes.get(e.method).indexOf(e);
        if (t > -1) this._routes.get(e.method).splice(t, 1);
        else throw new l("unregister-route-route-not-registered");
      }
      getUrlsToPrecacheKeys() {
        return this._urlsToCacheKeys;
      }
      getPrecachedUrls() {
        return [...this._urlsToCacheKeys.keys()];
      }
      getPrecacheKeyForUrl(e) {
        let t = new URL(e, location.href);
        return this._urlsToCacheKeys.get(t.href);
      }
      getIntegrityForPrecacheKey(e) {
        return this._cacheKeysToIntegrities.get(e);
      }
      async matchPrecache(e) {
        let t = e instanceof Request ? e.url : e,
          a = this.getPrecacheKeyForUrl(t);
        if (a) return (await self.caches.open(this.precacheStrategy.cacheName)).match(a);
      }
      createHandlerBoundToUrl(e) {
        let t = this.getPrecacheKeyForUrl(e);
        if (!t) throw new l("non-precached-url", { url: e });
        return (a) => (
          (a.request = new Request(e)),
          (a.params = { cacheKey: t, ...a.params }),
          this.precacheStrategy.handle(a)
        );
      }
      handleRequest({ request: e, event: t }) {
        let a,
          s = new URL(e.url, location.href);
        if (!s.protocol.startsWith("http")) return;
        let r = s.origin === location.origin,
          { params: n, route: i } = this.findMatchingRoute({
            event: t,
            request: e,
            sameOrigin: r,
            url: s,
          }),
          c = i?.handler,
          o = e.method;
        if ((!c && this._defaultHandlerMap.has(o) && (c = this._defaultHandlerMap.get(o)), !c))
          return;
        try {
          a = c.handle({ url: s, request: e, event: t, params: n });
        } catch (e) {
          a = Promise.reject(e);
        }
        let l = i?.catchHandler;
        return (
          a instanceof Promise &&
            (this._catchHandler || l) &&
            (a = a.catch(async (a) => {
              if (l)
                try {
                  return await l.handle({ url: s, request: e, event: t, params: n });
                } catch (e) {
                  e instanceof Error && (a = e);
                }
              if (this._catchHandler)
                return this._catchHandler.handle({ url: s, request: e, event: t });
              throw a;
            })),
          a
        );
      }
      findMatchingRoute({ url: e, sameOrigin: t, request: a, event: s }) {
        for (let r of this._routes.get(a.method) || []) {
          let n,
            i = r.match({ url: e, sameOrigin: t, request: a, event: s });
          if (i)
            return (
              (Array.isArray((n = i)) && 0 === n.length) ||
              (i.constructor === Object && 0 === Object.keys(i).length)
                ? (n = void 0)
                : "boolean" == typeof i && (n = void 0),
              { route: r, params: n }
            );
        }
        return {};
      }
    };
  let eq = [
    {
      matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: new ex({
        cacheName: "google-fonts-webfonts",
        plugins: [new ef({ maxEntries: 4, maxAgeSeconds: 31536e3, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: new eb({
        cacheName: "google-fonts-stylesheets",
        plugins: [new ef({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: new eb({
        cacheName: "static-font-assets",
        plugins: [new ef({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new eb({
        cacheName: "static-image-assets",
        plugins: [new ef({ maxEntries: 64, maxAgeSeconds: 2592e3, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\/_next\/static.+\.js$/i,
      handler: new ex({
        cacheName: "next-static-js-assets",
        plugins: [new ef({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\/_next\/image\?url=.+$/i,
      handler: new eb({
        cacheName: "next-image",
        plugins: [new ef({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\.(?:mp3|wav|ogg)$/i,
      handler: new ex({
        cacheName: "static-audio-assets",
        plugins: [
          new ef({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: "last-used" }),
          new e_(),
        ],
      }),
    },
    {
      matcher: /\.(?:mp4|webm)$/i,
      handler: new ex({
        cacheName: "static-video-assets",
        plugins: [
          new ef({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: "last-used" }),
          new e_(),
        ],
      }),
    },
    {
      matcher: /\.(?:js)$/i,
      handler: new eb({
        cacheName: "static-js-assets",
        plugins: [new ef({ maxEntries: 48, maxAgeSeconds: 86400, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\.(?:css|less)$/i,
      handler: new eb({
        cacheName: "static-style-assets",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\/_next\/data\/.+\/.+\.json$/i,
      handler: new ee({
        cacheName: "next-data",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: "last-used" })],
      }),
    },
    {
      matcher: /\.(?:json|xml|csv)$/i,
      handler: new ee({
        cacheName: "static-data-assets",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: "last-used" })],
      }),
    },
    { matcher: /\/api\/auth\/.*/, handler: new et({ networkTimeoutSeconds: 10 }) },
    {
      matcher: ({ sameOrigin: e, url: { pathname: t } }) => e && t.startsWith("/api/"),
      method: "GET",
      handler: new ee({
        cacheName: "apis",
        plugins: [new ef({ maxEntries: 16, maxAgeSeconds: 86400, maxAgeFrom: "last-used" })],
        networkTimeoutSeconds: 10,
      }),
    },
    {
      matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") &&
        "1" === e.headers.get("Next-Router-Prefetch") &&
        a &&
        !t.startsWith("/api/"),
      handler: new ee({
        cacheName: "pages-rsc-prefetch",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
    },
    {
      matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") && a && !t.startsWith("/api/"),
      handler: new ee({
        cacheName: "pages-rsc",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
    },
    {
      matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
        e.headers.get("Content-Type")?.includes("text/html") && a && !t.startsWith("/api/"),
      handler: new ee({
        cacheName: "pages",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
    },
    {
      matcher: ({ url: { pathname: e }, sameOrigin: t }) => t && !e.startsWith("/api/"),
      handler: new ee({
        cacheName: "others",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
    },
    {
      matcher: ({ sameOrigin: e }) => !e,
      handler: new ee({
        cacheName: "cross-origin",
        plugins: [new ef({ maxEntries: 32, maxAgeSeconds: 3600 })],
        networkTimeoutSeconds: 10,
      }),
    },
    { matcher: /.*/i, method: "GET", handler: new et() },
  ];
  new eR({
    precacheEntries: [
      {
        revision: "b56c511ffc393e117319fadba7a8a064",
        url: "/_next/static/LfiQirOD0Fb4jn8z4CeHy/_buildManifest.js",
      },
      {
        revision: "b6652df95db52feb4daf4eca35380933",
        url: "/_next/static/LfiQirOD0Fb4jn8z4CeHy/_ssgManifest.js",
      },
      { revision: null, url: "/_next/static/chunks/213-439d668c1cd250a9.js" },
      { revision: null, url: "/_next/static/chunks/239-fc5aeed65bdef089.js" },
      { revision: null, url: "/_next/static/chunks/25c8a87d-2a8437ecb748c55d.js" },
      { revision: null, url: "/_next/static/chunks/81.52a1932f6f907abb.js" },
      { revision: null, url: "/_next/static/chunks/87c73c54-f46fec743414da25.js" },
      { revision: null, url: "/_next/static/chunks/950-0aa0a1784113b908.js" },
      { revision: null, url: "/_next/static/chunks/962-9aa2a9a736301e44.js" },
      { revision: null, url: "/_next/static/chunks/app/_global-error/page-2c165aa2ee0d3116.js" },
      { revision: null, url: "/_next/static/chunks/app/_not-found/page-a3885bca1e346abe.js" },
      { revision: null, url: "/_next/static/chunks/app/astro/page-a983644076ecd13f.js" },
      { revision: null, url: "/_next/static/chunks/app/commerce/page-fc89565354398472.js" },
      { revision: null, url: "/_next/static/chunks/app/health/page-8b16030596b91e5c.js" },
      { revision: null, url: "/_next/static/chunks/app/jobs/new/page-2c165aa2ee0d3116.js" },
      { revision: null, url: "/_next/static/chunks/app/jobs/old/page-2c165aa2ee0d3116.js" },
      { revision: null, url: "/_next/static/chunks/app/jobs/page-2c165aa2ee0d3116.js" },
      { revision: null, url: "/_next/static/chunks/app/layout-620891f4c992a773.js" },
      { revision: null, url: "/_next/static/chunks/app/page-c2d46007bc77402a.js" },
      { revision: null, url: "/_next/static/chunks/framework-369218c9910949e7.js" },
      { revision: null, url: "/_next/static/chunks/main-app-655b766c2b5f225f.js" },
      { revision: null, url: "/_next/static/chunks/main-bbe9be3c0dbf93b5.js" },
      {
        revision: null,
        url: "/_next/static/chunks/next/dist/client/components/builtin/app-error-2c165aa2ee0d3116.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/next/dist/client/components/builtin/forbidden-2c165aa2ee0d3116.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/next/dist/client/components/builtin/global-error-6dd9cd7b29a380ca.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/next/dist/client/components/builtin/not-found-2c165aa2ee0d3116.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/next/dist/client/components/builtin/unauthorized-2c165aa2ee0d3116.js",
      },
      {
        revision: "846118c33b2c0e922d7b3a7676f81f6f",
        url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
      },
      { revision: null, url: "/_next/static/chunks/webpack-11147b65bb94055c.js" },
      { revision: null, url: "/_next/static/css/54759e944ae9da5c.css" },
      { revision: null, url: "/_next/static/css/a6a6c7db5d43079b.css" },
      {
        revision: "b39676298197422e3f5284bfafdc7dc3",
        url: "/_next/static/media/27834908180db20f-s.p.woff2",
      },
      {
        revision: "8383036bed6b5635fbd81508767479af",
        url: "/_next/static/media/78fec81b34c4a365.p.woff2",
      },
      { revision: "93b90b5712eeadea50c45ee26f31fda0", url: "/assets/shell/ico-astro.svg" },
      { revision: "851325be8d5430cfc0a7ad31b007fad1", url: "/assets/shell/ico-chevron-right.svg" },
      { revision: "1c7ecfa7dbba7c91d37aefde2d5394e1", url: "/assets/shell/ico-commerce.svg" },
      { revision: "7e26506a11b8cb8266413a980530683e", url: "/assets/shell/ico-cricket.svg" },
      { revision: "9458a455aa0384783850543d1e43159d", url: "/assets/shell/ico-devotion.svg" },
      { revision: "de8d5b36bbb6c082fa8023b01f81bf61", url: "/assets/shell/ico-finance.svg" },
      { revision: "552c3505147a71d1a56ffbd274e4c153", url: "/assets/shell/ico-health.svg" },
      { revision: "4eef7b490d1a022777c69b1c1a5a18a9", url: "/assets/shell/ico-jobs.svg" },
      { revision: "efee4114e91a59ff7f9e5e2d7034fc03", url: "/assets/shell/ico-menu.svg" },
      { revision: "f163741b2d3250754cd062d9f48526d4", url: "/assets/shell/ico-news.svg" },
      { revision: "81682f89e35daad7d48aaa1781499211", url: "/assets/shell/jio-logo.png" },
      {
        revision: "8e89a34f7ec3f6ae94e1f9096355edb2",
        url: "/astro/assets/audio/om-namah-shivay.mp3",
      },
      { revision: "630b23a78d156cc9c0261867072e0f06", url: "/astro/assets/audio/shankh.mp3" },
      { revision: "5032e0860c29f128ceb2fd959e886d9f", url: "/astro/assets/audio/shiva-aarti.mp3" },
      { revision: "56c4285cfbf3d1eb05d460ea7d7c1958", url: "/astro/assets/audio/vrat-katha.mp3" },
      { revision: "afcd102eea0575411e64bbec2b204028", url: "/astro/assets/deities/shiva/1.png" },
      { revision: "0e3d4c1d9de71e03ac52e002aa701ff0", url: "/astro/assets/deities/shiva/2.png" },
      { revision: "7e90194bd4a65f57a3df62f5473183d0", url: "/astro/assets/deities/shiva/3.png" },
      { revision: "4e7357ea6197a50ffc14553a91507112", url: "/astro/assets/temples/kashi.jpg" },
      { revision: "5981ff6a3c564fb64f95346fa2ee26eb", url: "/astro/assets/temples/kedarnath.jpg" },
      { revision: "1eda33ad3be579dad037e73c1f139580", url: "/astro/assets/temples/puri.jpg" },
      { revision: "f643d5b8aa508b893d21229a83b65dab", url: "/astro/assets/temples/rameshwar.jpg" },
      { revision: "dadb0a7ea86894a251f9cbc7c51d9def", url: "/astro/assets/temples/somnath.jpg" },
      { revision: "adc0e5163cbd54d95c0ebc3ffbc073a0", url: "/astro/assets/temples/ujjain.jpg" },
      { revision: "7eb358f838c66da84aef7a0718ae2f69", url: "/astro/astro-home-daily-v2.html" },
      { revision: "a0ec6101d86883a0dcac3a476266d2b7", url: "/astro/astro-home.html" },
      { revision: "1cafb2b62328cb5b074db8ba12a42661", url: "/astro/astro-phase0.html" },
      { revision: "a262cb1ea2e5678051f2996fa918120a", url: "/astro/astro-phase1.html" },
      { revision: "5be20d05eccbfcfba83a446e0d79fa49", url: "/astro/astro-unified.html" },
      { revision: "23cb70ed13265d677c6a743a4c2efdb7", url: "/astro/astrologer.png" },
      { revision: "9beeeb301cae4cd44059ebae0acf2f39", url: "/astro/cosmic_bg.wav" },
      { revision: "152800d4ee193990b27b552f031303fd", url: "/astro/jbiq-homepage.html" },
      { revision: "db3140b73327b00811665a6c1a75d177", url: "/astro/kirana-list.png" },
      { revision: "6641b1b1b78818b17fb955e91ba2c94f", url: "/astro/live-darshan.html" },
      { revision: "44ee3ea3b26f9bec4508506328786691", url: "/astro/narration.wav" },
      { revision: "7a76bab266c2d04b80b29fecac6f891a", url: "/astro/vendor/babel.min.js" },
      {
        revision: "c4df83c59489e285a6b9856303d1a05b",
        url: "/astro/vendor/react-dom.production.min.js",
      },
      {
        revision: "78cf3d80e45e6c4ab93859581b657df2",
        url: "/astro/vendor/react.production.min.js",
      },
      { revision: "ed9df9958adc1dc3cb03305479f37eac", url: "/astro/zepto-cart.png" },
      { revision: "587920b6476d66fa55e08d152f2ddeb5", url: "/icons/icon-192.svg" },
      { revision: "61b614d3fff55487dcde895235efd74d", url: "/icons/icon-512.svg" },
      { revision: "76bee6349266e69109d3a599230e87fb", url: "/icons/icon-maskable.svg" },
      { revision: "c15bc9d018aeef5ce672f6ded8d0666a", url: "/icons/icon.svg" },
      {
        revision: "f393e49623e61f8221ee2fc34b3a915d",
        url: "/jobs/assets/audio/00a70bf8edb64f88.mp3",
      },
      {
        revision: "3317904b10459cf331761a262cf8d085",
        url: "/jobs/assets/audio/01a97c399696017e.mp3",
      },
      {
        revision: "04a11acfbe8b5a8ea1b500526354f7fb",
        url: "/jobs/assets/audio/02d7388c96500bf5.mp3",
      },
      {
        revision: "0d1d7f77876d0d18954a1fa257d25340",
        url: "/jobs/assets/audio/03561cc794a7ae05.mp3",
      },
      {
        revision: "20203a4898a63c912277ddfb57469213",
        url: "/jobs/assets/audio/036ef4beccadb38f.mp3",
      },
      {
        revision: "de852ce911d8b0c4b35d79fea900f4cb",
        url: "/jobs/assets/audio/03ab7b61d625a84d.mp3",
      },
      {
        revision: "e88d5dbac50ec28367bbd2510dee6876",
        url: "/jobs/assets/audio/0525928ce225f420.mp3",
      },
      {
        revision: "f5b17b2cc2cc52d67295dabf3886dca3",
        url: "/jobs/assets/audio/05701cd6a78fb5ae.mp3",
      },
      {
        revision: "12a6bf8e09e8d2237f46362337f14782",
        url: "/jobs/assets/audio/05ba3ce3b4082144.mp3",
      },
      {
        revision: "6e59332c48af27c163c2d855d93bbbc9",
        url: "/jobs/assets/audio/079a6740202882bf.mp3",
      },
      {
        revision: "db0099bebd442a0913d056f2e93ac366",
        url: "/jobs/assets/audio/08dbf7b0e1010a2e.mp3",
      },
      {
        revision: "2645dec0703c7666495de29ea02c38a4",
        url: "/jobs/assets/audio/09a42b25ae0b1eb2.mp3",
      },
      {
        revision: "d37ac0aff25aa8d0eab2ddcedd981449",
        url: "/jobs/assets/audio/09b02166b4130363.mp3",
      },
      {
        revision: "d7746137264f26e06e5fbbba64cdb1f9",
        url: "/jobs/assets/audio/09b4c2e7d2151578.mp3",
      },
      {
        revision: "085f0f168081d1f89d22f3c877b3ba78",
        url: "/jobs/assets/audio/0a7c6b1784d63df9.mp3",
      },
      {
        revision: "5d138388276b23c4870e9cd898a1e615",
        url: "/jobs/assets/audio/0d4a97153691551c.mp3",
      },
      {
        revision: "afd8ed4e9cc06a424c8805aa06bf9dea",
        url: "/jobs/assets/audio/0d4cb1b5fe347d3f.mp3",
      },
      {
        revision: "98b947530377eb7f99a6d67de38a0891",
        url: "/jobs/assets/audio/0e12f7341c20ef8e.mp3",
      },
      {
        revision: "627143aab3413af9363307283d8351fd",
        url: "/jobs/assets/audio/117145bcce23fba5.mp3",
      },
      {
        revision: "fe204f309f811320992efe5fb5b7bff4",
        url: "/jobs/assets/audio/120e7d4638b080fb.mp3",
      },
      {
        revision: "a00781276dece0cb1a590e19ca111591",
        url: "/jobs/assets/audio/128375188bb43f4c.mp3",
      },
      {
        revision: "f9759716346b5b8e61c0d04c55b91002",
        url: "/jobs/assets/audio/141764362062438b.mp3",
      },
      {
        revision: "86bd5596eb9715a8fec52a2a27382076",
        url: "/jobs/assets/audio/148fa8d37324a147.mp3",
      },
      {
        revision: "17d81b63f41e42615af902964a791a0a",
        url: "/jobs/assets/audio/170519cebcfa9241.mp3",
      },
      {
        revision: "8b9cbea8e39a82ac8ab236d42bb6beaf",
        url: "/jobs/assets/audio/17e37cf2c6ba5db1.mp3",
      },
      {
        revision: "01d664164c96b2289fedb4a3f93b23ae",
        url: "/jobs/assets/audio/18452209aab53b02.mp3",
      },
      {
        revision: "96fb162d79b3c772e1138c28d4797959",
        url: "/jobs/assets/audio/1ad65912088764d2.mp3",
      },
      {
        revision: "8bb992f77a3085c4d5a5609f8a4c61be",
        url: "/jobs/assets/audio/1b1940bf2d6f4e9c.mp3",
      },
      {
        revision: "3c4e81fc6413665d934388d88c4bdd48",
        url: "/jobs/assets/audio/1c51cae68a52c6c2.mp3",
      },
      {
        revision: "af230f032bc733c6f8b69ab8dc166b30",
        url: "/jobs/assets/audio/1c939a74b3c652dd.mp3",
      },
      {
        revision: "53a6a20e8aa67767d4b09f483610f39a",
        url: "/jobs/assets/audio/1ddcc843af86adf3.mp3",
      },
      {
        revision: "2aa3fbea7440b46d79dc8f5a1259d437",
        url: "/jobs/assets/audio/1ea0378867696dbb.mp3",
      },
      {
        revision: "4b0bdfb0221fb3231563f239ba6d0479",
        url: "/jobs/assets/audio/1ea59486c6837968.mp3",
      },
      {
        revision: "ef28fa5f5deb8639ac7c687cce617462",
        url: "/jobs/assets/audio/2375635edfe674f1.mp3",
      },
      {
        revision: "c9a49540579402578b8ed8088d2b1b27",
        url: "/jobs/assets/audio/23a852072f007d1b.mp3",
      },
      {
        revision: "42421d0e714aaceaf5eb0fac02f87810",
        url: "/jobs/assets/audio/23e1c7dfc154d4b1.mp3",
      },
      {
        revision: "836ac14eb3a6f30e25f12c8131d7e25f",
        url: "/jobs/assets/audio/247bc3ba9a80d27a.mp3",
      },
      {
        revision: "69b2cde7252484016db696723ca5c7c4",
        url: "/jobs/assets/audio/26786a13309451c4.mp3",
      },
      {
        revision: "c8e57d54dfc80564e5ca424e06b0d329",
        url: "/jobs/assets/audio/276208672bc44909.mp3",
      },
      {
        revision: "6a436c8f3a364eb7ddc5c0df8433bab0",
        url: "/jobs/assets/audio/2839aa17c5f1c262.mp3",
      },
      {
        revision: "e35193860e125e87f54a4daae6c18c10",
        url: "/jobs/assets/audio/2879bb3ae10b1f27.mp3",
      },
      {
        revision: "bd61851fd63627118e134b8c35d7baf1",
        url: "/jobs/assets/audio/294fce84080135ac.mp3",
      },
      {
        revision: "f622754d20cc28ac80bd5d83e5b1dad6",
        url: "/jobs/assets/audio/297d0bdf65c711ae.mp3",
      },
      {
        revision: "c5393822b1b6acca6ddd64b93f97a00d",
        url: "/jobs/assets/audio/29f1ca410f4545d5.mp3",
      },
      {
        revision: "bd58c94357c6dafd810ae8cd1af9b490",
        url: "/jobs/assets/audio/2af4088082747567.mp3",
      },
      {
        revision: "fbe73aff7e586fceb50b1541b3815aa1",
        url: "/jobs/assets/audio/2b08dd055e588a4b.mp3",
      },
      {
        revision: "b07ae718870053553827f509289e3719",
        url: "/jobs/assets/audio/2bb1c4436fb775ce.mp3",
      },
      {
        revision: "216c4020d3492374a1abf6ea548415db",
        url: "/jobs/assets/audio/2d7d48abf0b8d513.mp3",
      },
      {
        revision: "efd3f3766d8f11c4b0215c65eb6e0324",
        url: "/jobs/assets/audio/2e0f6cb49a88e1a9.mp3",
      },
      {
        revision: "ddc71e3c03a8c96180981e2745740f4f",
        url: "/jobs/assets/audio/2ebe6dbfa01da242.mp3",
      },
      {
        revision: "d360b588352219f0fc9e27be38273f35",
        url: "/jobs/assets/audio/30667b3882f5d7d3.mp3",
      },
      {
        revision: "26e6afa52aa2cbf640303ecb73838c39",
        url: "/jobs/assets/audio/30800850196e1106.mp3",
      },
      {
        revision: "0c7204f2fcdc182ba346ee9b29543a8f",
        url: "/jobs/assets/audio/308d09eac85d4d0f.mp3",
      },
      {
        revision: "5a96de8edb1d045f0c928f368832b075",
        url: "/jobs/assets/audio/310fca198dba03c7.mp3",
      },
      {
        revision: "719ed4a178ae8581c89ac4391173203a",
        url: "/jobs/assets/audio/312439d30a34b93e.mp3",
      },
      {
        revision: "360e683af6eb4d5cdaccda88652eabe0",
        url: "/jobs/assets/audio/32c081061b433527.mp3",
      },
      {
        revision: "29bbd2233970647cfa06fbdb552d317b",
        url: "/jobs/assets/audio/34a7fb42a40516a6.mp3",
      },
      {
        revision: "68af3e1e964dddb14438dd8c58156f79",
        url: "/jobs/assets/audio/350ee9feddd8526a.mp3",
      },
      {
        revision: "d97f534f51d38e864c3a84d67fb66654",
        url: "/jobs/assets/audio/353853ddb229ac96.mp3",
      },
      {
        revision: "632d14102360ba63422015ea0cf8fcca",
        url: "/jobs/assets/audio/360e06bde5f5425f.mp3",
      },
      {
        revision: "e549eb6557584a59ef34426fcd554c4b",
        url: "/jobs/assets/audio/3727e99267822b55.mp3",
      },
      {
        revision: "0f89de8993b3a9624d849629545b59b8",
        url: "/jobs/assets/audio/375ef72ec351c352.mp3",
      },
      {
        revision: "2949c782469fff360538ac3ae42d98ec",
        url: "/jobs/assets/audio/37a42183be17ec74.mp3",
      },
      {
        revision: "752bc75002de01285cb6c89c3c075ec9",
        url: "/jobs/assets/audio/386dbe73ee6e6a3d.mp3",
      },
      {
        revision: "82eeb5bb6bc4d72cae4f390597542f71",
        url: "/jobs/assets/audio/38d7262cd6796195.mp3",
      },
      {
        revision: "fd20f23709853f2a1325550a25cdbc97",
        url: "/jobs/assets/audio/39d16b8b1ef60883.mp3",
      },
      {
        revision: "3dba0b223dd4b2637d6f12d1b1f5fb31",
        url: "/jobs/assets/audio/3a233274457c0b55.mp3",
      },
      {
        revision: "28355308f13f05e9818e87a06efbb4cb",
        url: "/jobs/assets/audio/3ab0e0f9a9c90f78.mp3",
      },
      {
        revision: "17e53fdafab4eda4167dbbc0e9865b05",
        url: "/jobs/assets/audio/3afb4b7e848fd28f.mp3",
      },
      {
        revision: "2fbc8df5a24584711eb1bd0c93ccae46",
        url: "/jobs/assets/audio/3b0c6bd6f99493e9.mp3",
      },
      {
        revision: "c4a684664d08e3fc0fc52c9ffda28a80",
        url: "/jobs/assets/audio/3be2c4cfb90fc517.mp3",
      },
      {
        revision: "1e941caa33399b28c2a22765e5aaeec4",
        url: "/jobs/assets/audio/3c4664349eff1dcf.mp3",
      },
      {
        revision: "5044d41f0ee17b855323e56a1ec8abcf",
        url: "/jobs/assets/audio/3c8c24e7ba35a1f3.mp3",
      },
      {
        revision: "a6acf23d5a5f5740dbdfa82681eee465",
        url: "/jobs/assets/audio/3d31b6c1a39eec22.mp3",
      },
      {
        revision: "9c70c6a919c5c93f060ab6ca5f727c2d",
        url: "/jobs/assets/audio/3e69f4e2048c6ccd.mp3",
      },
      {
        revision: "15eca9d59db6f4a441c8a0a3aab0cb1a",
        url: "/jobs/assets/audio/3e7a9310d804be13.mp3",
      },
      {
        revision: "dac9a8829fce86a7f6458d1afc4752d8",
        url: "/jobs/assets/audio/3eeee0726683b1f8.mp3",
      },
      {
        revision: "a6d24e7c521d724900004a9ed2cfd8d2",
        url: "/jobs/assets/audio/401cf4189116ca09.mp3",
      },
      {
        revision: "d751b043b7a7cc03dcc14d362146ff2d",
        url: "/jobs/assets/audio/42d743a3c4c11e40.mp3",
      },
      {
        revision: "aa45ee433d032edfa50ede8ce9b57520",
        url: "/jobs/assets/audio/43cd4432d9447c2b.mp3",
      },
      {
        revision: "4835d596cc2fa6aa281a2669547ab6a6",
        url: "/jobs/assets/audio/43fe983d6a788daf.mp3",
      },
      {
        revision: "df72d6b3d209a6a8216c504c0365a325",
        url: "/jobs/assets/audio/45c0aa9ea0f581cf.mp3",
      },
      {
        revision: "b38df7c40254cabe4705545d3726b638",
        url: "/jobs/assets/audio/48be524fbc35a370.mp3",
      },
      {
        revision: "b16bf86c49c963bef6b394a06d097bad",
        url: "/jobs/assets/audio/49cc2569e1c421a6.mp3",
      },
      {
        revision: "246a0542d615228f6010b663fb7e7737",
        url: "/jobs/assets/audio/4a3996e0a9b1a572.mp3",
      },
      {
        revision: "bc7f79796e7bf51b17e1b07c9fd32add",
        url: "/jobs/assets/audio/4ae325ba7f9a7127.mp3",
      },
      {
        revision: "6884130c878a713f0ca91f3240f34066",
        url: "/jobs/assets/audio/4b530793c98ff327.mp3",
      },
      {
        revision: "4d573e86d2a01ab1ccf8e20e49340d1c",
        url: "/jobs/assets/audio/4bd9591ee9bc87f7.mp3",
      },
      {
        revision: "b544f7f09bc6c1ee8a5ff54f375bb2f0",
        url: "/jobs/assets/audio/4dbcfee371ac61d2.mp3",
      },
      {
        revision: "5a0e9d5afe427708040148a773f020a6",
        url: "/jobs/assets/audio/4e5852e631968dbb.mp3",
      },
      {
        revision: "b5e746ee21774cc7a5469f38f05f84c5",
        url: "/jobs/assets/audio/4fa8d8d7b275a2e2.mp3",
      },
      {
        revision: "f26485a7502fd5fc0b98f450d8cdb894",
        url: "/jobs/assets/audio/50b49dabccb90de1.mp3",
      },
      {
        revision: "c7d6d688a0bd25ef861984695a3155c0",
        url: "/jobs/assets/audio/519a1227cb7790b5.mp3",
      },
      {
        revision: "785700a697a8ebaf80b0811e5144c125",
        url: "/jobs/assets/audio/51a67e3839448a0b.mp3",
      },
      {
        revision: "a3f2ad7c58ee43b706f96a32c5b5fd4f",
        url: "/jobs/assets/audio/51af0f7213cef577.mp3",
      },
      {
        revision: "b0a436bcd7617580952bdd5d4b03c0c9",
        url: "/jobs/assets/audio/52eac420918a5b70.mp3",
      },
      {
        revision: "4cd95d32cd00377f74dd2d327a5cd300",
        url: "/jobs/assets/audio/53ad6da42c849943.mp3",
      },
      {
        revision: "b18a225f0783105ba0950726a3cab3ad",
        url: "/jobs/assets/audio/542f7f3cfa13659b.mp3",
      },
      {
        revision: "48a36f45e797b8765a2c27868b43e006",
        url: "/jobs/assets/audio/5485eadbea4655d8.mp3",
      },
      {
        revision: "80cdd9cb1135c6f64bc1d0d5d831bbad",
        url: "/jobs/assets/audio/555fdaa5e2f296d4.mp3",
      },
      {
        revision: "75ef4bdfd06da6cbabf553f23d434808",
        url: "/jobs/assets/audio/57059ded599fb919.mp3",
      },
      {
        revision: "6c4b2de891cde1ac62832c8eec918d17",
        url: "/jobs/assets/audio/57b87480780efce1.mp3",
      },
      {
        revision: "1224d1f821387815f345dde8a2c85477",
        url: "/jobs/assets/audio/5904525643e465ce.mp3",
      },
      {
        revision: "0e7e778c1c73a413acf31b77487b5ba2",
        url: "/jobs/assets/audio/59361a00755c7169.mp3",
      },
      {
        revision: "1f341965602fe64dce774be331df4097",
        url: "/jobs/assets/audio/59991084409776c4.mp3",
      },
      {
        revision: "6b553775a28372e41756b970a35c3c1a",
        url: "/jobs/assets/audio/5a913a1b2f90cd7f.mp3",
      },
      {
        revision: "cd6dddd347b88fc734cdf137b5444134",
        url: "/jobs/assets/audio/5b07b3a855c7d71a.mp3",
      },
      {
        revision: "2a4dbc8bfbd6cb2e23c6cff459bd52e3",
        url: "/jobs/assets/audio/5b3707dae855f82c.mp3",
      },
      {
        revision: "691c1ee9c6be8bdfaf619389b3824461",
        url: "/jobs/assets/audio/5b9b12f0a78630ec.mp3",
      },
      {
        revision: "de632c7d6c64f3e7faffd942daa92e96",
        url: "/jobs/assets/audio/5dd6a0b28da37224.mp3",
      },
      {
        revision: "3012306629409ac6f89c129d3e8ce226",
        url: "/jobs/assets/audio/5f5dbc877fcc4f2d.mp3",
      },
      {
        revision: "d2622123991520552219169097256e15",
        url: "/jobs/assets/audio/5fa095387f0e25f2.mp3",
      },
      {
        revision: "ca581c12c909e0a696891031efbef604",
        url: "/jobs/assets/audio/605eebde4c441dc8.mp3",
      },
      {
        revision: "190f8558b4f5302af616b16f9f00b012",
        url: "/jobs/assets/audio/60cf35ce5a2b10db.mp3",
      },
      {
        revision: "a6c4ce60d40215e9d90a565e4eb6766d",
        url: "/jobs/assets/audio/619956c5aad0dd5d.mp3",
      },
      {
        revision: "14025c3a67a59b64b59fc2f7266afa36",
        url: "/jobs/assets/audio/66096794e188c97e.mp3",
      },
      {
        revision: "d269bd9855d8a76be5e380d52625d108",
        url: "/jobs/assets/audio/66113779eb9ffce6.mp3",
      },
      {
        revision: "1186ccbe24008a3cdc44fa42bc86ac2d",
        url: "/jobs/assets/audio/6733409bf49f1a44.mp3",
      },
      {
        revision: "13591551b59a370df7fb02b106f231fe",
        url: "/jobs/assets/audio/68cc5f0bd5fcfcc0.mp3",
      },
      {
        revision: "c30e74f5a5d91f81c6f328e35ae77779",
        url: "/jobs/assets/audio/698df1a22d71beb0.mp3",
      },
      {
        revision: "3111f00fc53ba517d43dfb7716019652",
        url: "/jobs/assets/audio/69a34ab2f23d490a.mp3",
      },
      {
        revision: "548d58f375e1a458638e248c79c6e0ac",
        url: "/jobs/assets/audio/6ae856bd458031d9.mp3",
      },
      {
        revision: "5fe4ad0a42cab42daf0854e3f666fbe9",
        url: "/jobs/assets/audio/6b8e57f822d2bcdf.mp3",
      },
      {
        revision: "ccce13db87112273c4e3ea26bde82ada",
        url: "/jobs/assets/audio/706a7efe680b69a2.mp3",
      },
      {
        revision: "284d9306fe3e3bd93ce8465c8571ffe0",
        url: "/jobs/assets/audio/714d0eefc0b10f5b.mp3",
      },
      {
        revision: "7a0154757bcf3a59ec8774f123ef42d7",
        url: "/jobs/assets/audio/72292fedf3db7dbf.mp3",
      },
      {
        revision: "ff05ef391d416fcbce82c8e83ea60f6e",
        url: "/jobs/assets/audio/732fa6daf9ead049.mp3",
      },
      {
        revision: "075c2b13bf0c7a00cc184084330e77ed",
        url: "/jobs/assets/audio/75722adb981824da.mp3",
      },
      {
        revision: "7f3a1e625d656bf0f5407537b3982ac6",
        url: "/jobs/assets/audio/762a74c7510eaf4a.mp3",
      },
      {
        revision: "0041965780719b7a40f032ad5784be65",
        url: "/jobs/assets/audio/76db6de6591fca73.mp3",
      },
      {
        revision: "2ca1bb5044daafd829117a4eab229840",
        url: "/jobs/assets/audio/783d5b115f3d0dc5.mp3",
      },
      {
        revision: "b18e481f0b42e2c3aefa3391336c13d9",
        url: "/jobs/assets/audio/78db28a7577dc2c7.mp3",
      },
      {
        revision: "a21babe0ae97a866e0079105f73fba51",
        url: "/jobs/assets/audio/7954c50e4d1d4b06.mp3",
      },
      {
        revision: "642ebcc1dc848b5057ac2d1379e30feb",
        url: "/jobs/assets/audio/7cb728dce3ef0716.mp3",
      },
      {
        revision: "e59898d9b547b9c48fd152d40f33d303",
        url: "/jobs/assets/audio/7d1f5561c232951c.mp3",
      },
      {
        revision: "296739bfd935f6335ea272d1fffb61fb",
        url: "/jobs/assets/audio/7e29a19013228f1a.mp3",
      },
      {
        revision: "8d507b421d5c77bb7d05028704b8a94d",
        url: "/jobs/assets/audio/7e92d1baef30a301.mp3",
      },
      {
        revision: "1012f74bfa9fce4214dbef3a5240b8b3",
        url: "/jobs/assets/audio/7f93f9c2dac7430a.mp3",
      },
      {
        revision: "8fb4d6380a3bb515a56dd88c22734a3c",
        url: "/jobs/assets/audio/7ff2cbf011287cfe.mp3",
      },
      {
        revision: "4ab732cd13bfde109af1b9a76725bb14",
        url: "/jobs/assets/audio/815fd85fbe481f6c.mp3",
      },
      {
        revision: "d7714545c702f686a4b15583b5ec63cb",
        url: "/jobs/assets/audio/81e9566e1cad649a.mp3",
      },
      {
        revision: "6b78bbb8d2262e557595553dcd2eb18f",
        url: "/jobs/assets/audio/81ea6eff6df3ed9a.mp3",
      },
      {
        revision: "a2a292f0e33d82c1d44cc32f9c91197a",
        url: "/jobs/assets/audio/829f7b1a040b4579.mp3",
      },
      {
        revision: "5a0fcd5953ed329ff65db515c3af58c6",
        url: "/jobs/assets/audio/82ae3fc7fa4d4983.mp3",
      },
      {
        revision: "9ed93618c4fe0fde9e78d246c00ee4d0",
        url: "/jobs/assets/audio/8667a6333b436bca.mp3",
      },
      {
        revision: "78f299bb51dd8f974b01a8e71d160aef",
        url: "/jobs/assets/audio/881f6160021666f4.mp3",
      },
      {
        revision: "47d7def077b72706b69894c5cf5b74a0",
        url: "/jobs/assets/audio/8afdf5a73dbdba97.mp3",
      },
      {
        revision: "e2bf94e5a8102768f7b0745099445cfc",
        url: "/jobs/assets/audio/8affb567c9fb7581.mp3",
      },
      {
        revision: "ae707b460363eee6358b9939f7656f9e",
        url: "/jobs/assets/audio/8b17ba1bc7884d4d.mp3",
      },
      {
        revision: "bea08a0a9b33fe181687095e4c8819f3",
        url: "/jobs/assets/audio/8b52637a1ebd3735.mp3",
      },
      {
        revision: "3849b834877a9ae57f95821bddf87dd8",
        url: "/jobs/assets/audio/8b6973404e2db873.mp3",
      },
      {
        revision: "5a115e7a0fae80854694d7a1431e766f",
        url: "/jobs/assets/audio/8b76b981af4e9f67.mp3",
      },
      {
        revision: "ce6ff1c64bfa9da75c838413a754cc80",
        url: "/jobs/assets/audio/8bd0628f31c15a07.mp3",
      },
      {
        revision: "0253b0610cebd4bba0ae493b6ba853db",
        url: "/jobs/assets/audio/8bee8c91bfc013cb.mp3",
      },
      {
        revision: "4e995c9b7584355fe94519c3a6eabaef",
        url: "/jobs/assets/audio/8d32903bee90a021.mp3",
      },
      {
        revision: "453d40f2c097b6b5bdbd0b61b144f928",
        url: "/jobs/assets/audio/8f4267b72b460368.mp3",
      },
      {
        revision: "cc4eea7d96bf493edf47aa0c8d72bae5",
        url: "/jobs/assets/audio/91562039a00c2a97.mp3",
      },
      {
        revision: "9f2eacf0ed477c273e864a35aaabfe84",
        url: "/jobs/assets/audio/91db7a694cd1e7e7.mp3",
      },
      {
        revision: "92b94518552a237f5c0826e46aa2dd2b",
        url: "/jobs/assets/audio/929df99c957c4220.mp3",
      },
      {
        revision: "8abb520cdcdac715b4c396026a38acc0",
        url: "/jobs/assets/audio/92d83609f8fe4a12.mp3",
      },
      {
        revision: "89609a80d870ff2a848d347aee7347d5",
        url: "/jobs/assets/audio/9375634a3274def4.mp3",
      },
      {
        revision: "25bf74e578c5fe94b687a01e0781150a",
        url: "/jobs/assets/audio/93c2e36960312e66.mp3",
      },
      {
        revision: "8fec567024db089f15f602a1aa5e456e",
        url: "/jobs/assets/audio/94ed43629951389a.mp3",
      },
      {
        revision: "0f3255279ec8c3f8f18cb47bd12e8fa9",
        url: "/jobs/assets/audio/95828c270daeebd1.mp3",
      },
      {
        revision: "f977a567d131c123e73339b908d32ee8",
        url: "/jobs/assets/audio/959cb15477574c53.mp3",
      },
      {
        revision: "73f2f9ac0fa4bfd6748e8623bb4ffc9c",
        url: "/jobs/assets/audio/95addf263eb08044.mp3",
      },
      {
        revision: "e16e274d91a93e532b2c5fb8d1ce0140",
        url: "/jobs/assets/audio/96a41125833bee95.mp3",
      },
      {
        revision: "4ea86fd661a23bdd91f4c4291ad6435f",
        url: "/jobs/assets/audio/9704c907294475fd.mp3",
      },
      {
        revision: "51250573d0e45066a4c7f3da60f32219",
        url: "/jobs/assets/audio/97e5cb63d1bd27ec.mp3",
      },
      {
        revision: "2ffb6ea2239b8a7f3b27269b269fd1e0",
        url: "/jobs/assets/audio/98330faa70338224.mp3",
      },
      {
        revision: "d5db90c218ca8c3f219d3b818b9d4cf0",
        url: "/jobs/assets/audio/98b3ef3820bd97f3.mp3",
      },
      {
        revision: "bd6f9b07cefb5dbe9b9b147dd684ccfe",
        url: "/jobs/assets/audio/998542e514a56efb.mp3",
      },
      {
        revision: "dc2487c64b57ca6f02684a78ee29e311",
        url: "/jobs/assets/audio/99c00bd3c0a16d37.mp3",
      },
      {
        revision: "41fb12282620c96ac101af4c24c9c5a2",
        url: "/jobs/assets/audio/9addc30323e3dcb8.mp3",
      },
      {
        revision: "ac120be851f84b00290bf4cc680ebf13",
        url: "/jobs/assets/audio/9b334fd86701386f.mp3",
      },
      {
        revision: "f1f057edbb5130ed9f7677371d1c9463",
        url: "/jobs/assets/audio/9b3ccf0a5cfb9ed4.mp3",
      },
      {
        revision: "ed3b085d289b0f3a88b2edfbcd4056a5",
        url: "/jobs/assets/audio/9c27dc8c7f22b1ef.mp3",
      },
      {
        revision: "26235057c4b37ca19ef54cc022d8424f",
        url: "/jobs/assets/audio/9d5f5a895946aebf.mp3",
      },
      {
        revision: "dd145919b447b5830c389d940aacd7ec",
        url: "/jobs/assets/audio/9f0cde3617853721.mp3",
      },
      {
        revision: "55fc8704103fd12636d0d8ca16b60ad3",
        url: "/jobs/assets/audio/9faf1b06e2068192.mp3",
      },
      {
        revision: "9c88bb33e2a8d4f0b91ca8290f725acb",
        url: "/jobs/assets/audio/a4c73d68fedbae54.mp3",
      },
      {
        revision: "88547bb97eb7441daf70cc0fb7b29da0",
        url: "/jobs/assets/audio/a52c8f27c80ec094.mp3",
      },
      {
        revision: "4fcce8d77eca670f7db985559701a3d6",
        url: "/jobs/assets/audio/a62aaa1ed3c11a69.mp3",
      },
      {
        revision: "d65a2100f972adffec281f61ca25db3e",
        url: "/jobs/assets/audio/a66e49c6f48aff17.mp3",
      },
      {
        revision: "8e966cbbf9948e3759f90878da21f31d",
        url: "/jobs/assets/audio/a6b3aebf5af81fb7.mp3",
      },
      {
        revision: "b1ea7bdc0369cf1cf9a780b25e2aa880",
        url: "/jobs/assets/audio/a6c044b345dec3c2.mp3",
      },
      {
        revision: "bc322e966b60773ab46e2744d1f00482",
        url: "/jobs/assets/audio/a8a9c9a6b883b8bc.mp3",
      },
      {
        revision: "39a3ad5b1f692040e4e328731eb9692f",
        url: "/jobs/assets/audio/ad78050aa8ad9c81.mp3",
      },
      {
        revision: "a6535111d15ca76040dc5e79cd034d5f",
        url: "/jobs/assets/audio/ae1c6666138abd6e.mp3",
      },
      {
        revision: "ff31316976019ed4e243bf552735718f",
        url: "/jobs/assets/audio/aea23a076487951c.mp3",
      },
      {
        revision: "5d0a0849d1bc41d554eaa0ab28aa0103",
        url: "/jobs/assets/audio/af9152f854798f86.mp3",
      },
      {
        revision: "ab5517fbd7e55dfb4cda192cfbe0cb34",
        url: "/jobs/assets/audio/afa76a1b54c425ea.mp3",
      },
      {
        revision: "b681d1c8e177a39ed3e154a695e1dd5d",
        url: "/jobs/assets/audio/afa9fa84ff06b52b.mp3",
      },
      {
        revision: "86d38abd877c1fa5611955bce6ea17b1",
        url: "/jobs/assets/audio/b168ea1ee88907be.mp3",
      },
      {
        revision: "e183d0622289de2b6c5b2c4fb6546684",
        url: "/jobs/assets/audio/b20b20e6aadb22f0.mp3",
      },
      {
        revision: "10725e1625348ba87e7c2394407e4645",
        url: "/jobs/assets/audio/b2c51ead1a954219.mp3",
      },
      {
        revision: "b754511d080d1d81e016a177f0aba914",
        url: "/jobs/assets/audio/b341245562581f34.mp3",
      },
      {
        revision: "179b0bd166c452d8c0a8dfb2a4a7b77c",
        url: "/jobs/assets/audio/b425fa26a2d0d0f6.mp3",
      },
      {
        revision: "f7f41b0892055f6ef38b5b2462b1ed87",
        url: "/jobs/assets/audio/b5d36a8c78cb0e08.mp3",
      },
      {
        revision: "3b2e624743357a04fae133f861d6c6b9",
        url: "/jobs/assets/audio/b69f45060f65d7ab.mp3",
      },
      {
        revision: "cdd01a4d4b643563ee50e341bba09e31",
        url: "/jobs/assets/audio/b7510ccec779f05f.mp3",
      },
      {
        revision: "e4e159f401802093eef110a13f0c109d",
        url: "/jobs/assets/audio/b910d4640020fe64.mp3",
      },
      {
        revision: "aa28db9aec122e20e5557cf238deee43",
        url: "/jobs/assets/audio/b9290b5dd4cc8bdb.mp3",
      },
      {
        revision: "dc9b8f3cd36ab6a3eb649193c4af1b97",
        url: "/jobs/assets/audio/b9f75a295d7c3a6e.mp3",
      },
      {
        revision: "251ae1e508386cf5c155a92b579d88bc",
        url: "/jobs/assets/audio/ba346de6f5fe46ea.mp3",
      },
      {
        revision: "f39e12e1a3c1e68cb49608bce1e51fa5",
        url: "/jobs/assets/audio/ba55d0cb7c9388b5.mp3",
      },
      {
        revision: "33769d30b9c19dc3e949760d29b1947b",
        url: "/jobs/assets/audio/bbb4c19be2b3f56a.mp3",
      },
      {
        revision: "b6a0dec6d2b0f295ff5f93bd2212b016",
        url: "/jobs/assets/audio/bc1e279828b8ed6f.mp3",
      },
      {
        revision: "2711ecf38f02d2a6cd42299bda99e056",
        url: "/jobs/assets/audio/bc3695728fae1d23.mp3",
      },
      {
        revision: "0ce8f854d6fefc8216bdbdb6b87b90d2",
        url: "/jobs/assets/audio/bce7fbf348b24a2d.mp3",
      },
      {
        revision: "23640987e04f09d6967095deafa03c28",
        url: "/jobs/assets/audio/bd83f754ec27ea11.mp3",
      },
      {
        revision: "28d51805e95bd5a7c1e17891cd78cb08",
        url: "/jobs/assets/audio/becd84f49c37ca8a.mp3",
      },
      {
        revision: "c7c2b6d7394accd0e871eafe473a4608",
        url: "/jobs/assets/audio/c06f22339c47a03f.mp3",
      },
      {
        revision: "22ffd9d94dd2ac069985d90411c79e41",
        url: "/jobs/assets/audio/c245a0bb9b3d39c9.mp3",
      },
      {
        revision: "917067d9b2c17287dcd3d188eeb3dada",
        url: "/jobs/assets/audio/c303243a2db16e54.mp3",
      },
      {
        revision: "c4ee18f4142245e4cd5e8e2412dff1f5",
        url: "/jobs/assets/audio/c3b8374a409464d8.mp3",
      },
      {
        revision: "51c3a3481f436f02e0cf2425e98a99ee",
        url: "/jobs/assets/audio/c4130f16442d2098.mp3",
      },
      {
        revision: "20247c6367617510d77967a52bdb98f3",
        url: "/jobs/assets/audio/c5b4476065b3085c.mp3",
      },
      {
        revision: "ee4e7f67305ed242a7c9eadaec00ba53",
        url: "/jobs/assets/audio/c5c1927b1c1c5407.mp3",
      },
      {
        revision: "ea012e8ee0c84b283da4f9452f431668",
        url: "/jobs/assets/audio/c5e2035ff5a563fc.mp3",
      },
      {
        revision: "a76d0363c8fe5314769638ad488fa235",
        url: "/jobs/assets/audio/c7ada417e8858992.mp3",
      },
      {
        revision: "236ce4722f61af8733c17c509d7f7be9",
        url: "/jobs/assets/audio/c81e5129db0432ec.mp3",
      },
      {
        revision: "6ca82eec3594daed26ccdc48f7070feb",
        url: "/jobs/assets/audio/c84f3fb48435a2ec.mp3",
      },
      {
        revision: "ea5157625c23a11dcbcb78c0968fe514",
        url: "/jobs/assets/audio/c87498a6b52bcafe.mp3",
      },
      {
        revision: "ceffe65c0983bf12b86915b37446ded3",
        url: "/jobs/assets/audio/ca9a0d88b35b675f.mp3",
      },
      {
        revision: "4c9998c572252d005827a89d21aa941b",
        url: "/jobs/assets/audio/cac9622ff68fc498.mp3",
      },
      {
        revision: "6274ac1c4434a00393bf3c2fc8315cf3",
        url: "/jobs/assets/audio/cb5e14725d4d7b51.mp3",
      },
      {
        revision: "bf3881e388f9efbadcaa916cfbbdd117",
        url: "/jobs/assets/audio/cb9174e35f2808d9.mp3",
      },
      {
        revision: "e3dc31aee479049c15ea556c653daef2",
        url: "/jobs/assets/audio/cd3574cd7bfddd59.mp3",
      },
      {
        revision: "9f896d938d23cc93ed6cfcedcc4ac6d2",
        url: "/jobs/assets/audio/d0638750d08a8dab.mp3",
      },
      {
        revision: "ce0e28c934cd9153361534ca2090124f",
        url: "/jobs/assets/audio/d198e972327e6d82.mp3",
      },
      {
        revision: "ddf8ebdf308432bd4e83d61dc8bae71b",
        url: "/jobs/assets/audio/d597e8172b0619ab.mp3",
      },
      {
        revision: "4252c379382642e1260afb1e9e8349ec",
        url: "/jobs/assets/audio/d5e33ced8c7ce0c1.mp3",
      },
      {
        revision: "e5fc73688e6c28f71a57c5a5e61e3746",
        url: "/jobs/assets/audio/d6a5ca158b373ad7.mp3",
      },
      {
        revision: "955af8fc8a23ab9b413d56029bf12bd4",
        url: "/jobs/assets/audio/d87042ec38b98af8.mp3",
      },
      {
        revision: "645d0057ad34eda457a5c1580277f472",
        url: "/jobs/assets/audio/d8e593ac846e0fcf.mp3",
      },
      {
        revision: "cb9f115827ce719ed97c869c021bf6c9",
        url: "/jobs/assets/audio/db2231d431916479.mp3",
      },
      {
        revision: "ce9260c40af7db0de533d23ecfbf7e1b",
        url: "/jobs/assets/audio/dc2d01f3bef77081.mp3",
      },
      {
        revision: "bb231dc8caa17cc54a7f62951263d01e",
        url: "/jobs/assets/audio/dc7d16f605be163a.mp3",
      },
      {
        revision: "dcbcb65aa83c5fcea0663a81a35573d9",
        url: "/jobs/assets/audio/dd071297d5bf751c.mp3",
      },
      {
        revision: "7f419908b6fd2dd4194aff07be058bd2",
        url: "/jobs/assets/audio/ddcce597b546a4e0.mp3",
      },
      {
        revision: "006c84be30290d899837ee7c62c64d8d",
        url: "/jobs/assets/audio/dddf760c8c649364.mp3",
      },
      {
        revision: "e72355db36e09c8a3db4fe1cb1470402",
        url: "/jobs/assets/audio/de1ac178a948deca.mp3",
      },
      {
        revision: "2fa0462b79e70b016756a30b6adeb095",
        url: "/jobs/assets/audio/dee86330367c75e1.mp3",
      },
      {
        revision: "3ccd194ef1c9476cb752bccf5238d465",
        url: "/jobs/assets/audio/df4c3112fdd5e548.mp3",
      },
      {
        revision: "728a19dcbf2a55443ea1027d5244b954",
        url: "/jobs/assets/audio/df91a5911eca0a82.mp3",
      },
      {
        revision: "8015c024a52b9793ca3ae8bcb5fbed42",
        url: "/jobs/assets/audio/e158b3980a02e301.mp3",
      },
      {
        revision: "372572a1838f2e2e6c7bf95d7136a50f",
        url: "/jobs/assets/audio/e15f711a972dd6bb.mp3",
      },
      {
        revision: "77400081a380cc6a8d391e385c2231e2",
        url: "/jobs/assets/audio/e1be16b7f7935f29.mp3",
      },
      {
        revision: "06b76dbce22c5638e2c51c9ab5e79de4",
        url: "/jobs/assets/audio/e3bafa8a1a323d6b.mp3",
      },
      {
        revision: "7626ad22c2c3cc7f49aa01e42515bb67",
        url: "/jobs/assets/audio/e422937bc44ed0f8.mp3",
      },
      {
        revision: "d850aac9a1d5950ad1d62db905249a24",
        url: "/jobs/assets/audio/e5d77ba99fc0e586.mp3",
      },
      {
        revision: "1e80699a604ef4cf3a2aab9af252addc",
        url: "/jobs/assets/audio/e6a4b0ca8f5261ed.mp3",
      },
      {
        revision: "9e8c82c39d2de14bc1cb9b11e92f7f84",
        url: "/jobs/assets/audio/e6a825cf8376a267.mp3",
      },
      {
        revision: "2df3243871f752d079fcbe8892c897a6",
        url: "/jobs/assets/audio/e6f1edb35078fc2a.mp3",
      },
      {
        revision: "e4b68bd86249361b38e93e91cf73baf7",
        url: "/jobs/assets/audio/e93a424c7bc23336.mp3",
      },
      {
        revision: "2e03b577aec811c5ed47eeebee02c9c5",
        url: "/jobs/assets/audio/e9e8dd92a6e5acd0.mp3",
      },
      {
        revision: "ea62899b7b8a4ac85370bcd7cce5f692",
        url: "/jobs/assets/audio/ec639e86b2d38591.mp3",
      },
      {
        revision: "3f0c350360bfb30053de3e45eab69587",
        url: "/jobs/assets/audio/f0326cb6804f7156.mp3",
      },
      {
        revision: "0e3ed86dc4d940b3d4e6e021439c728b",
        url: "/jobs/assets/audio/f12e8dd4a537319a.mp3",
      },
      {
        revision: "ac6c2f4370dd03eb439df51a5624d696",
        url: "/jobs/assets/audio/f2791bd14c4c5140.mp3",
      },
      {
        revision: "c6bde8744e371b03b17882358065ea55",
        url: "/jobs/assets/audio/f34cd7896e627638.mp3",
      },
      {
        revision: "fcb949087c0c52d43a78c72d952a262a",
        url: "/jobs/assets/audio/f3a765282b1a9153.mp3",
      },
      {
        revision: "bbf72bb6a526c4cb5ea43afcdaf1f6e8",
        url: "/jobs/assets/audio/f3f3df4368e0efd6.mp3",
      },
      {
        revision: "1836f65141bbbcf4c179d051d4d76127",
        url: "/jobs/assets/audio/f4a71558181770a6.mp3",
      },
      {
        revision: "88fe0af66889fe020a6f66c40efba780",
        url: "/jobs/assets/audio/f619ff42b18fba1d.mp3",
      },
      {
        revision: "6f71ead20fa90da422793f6b639f7167",
        url: "/jobs/assets/audio/f63a55b10f60ca32.mp3",
      },
      {
        revision: "ed792851cef78da37f63e9059902d560",
        url: "/jobs/assets/audio/f68079ed148fa314.mp3",
      },
      {
        revision: "04e33e9eceb5544c4a251eb8c6e917a8",
        url: "/jobs/assets/audio/f6b60132c6e2c774.mp3",
      },
      {
        revision: "032d7072e3b4e1109de5ad3bf1cb410d",
        url: "/jobs/assets/audio/f6badc560a9b0f1f.mp3",
      },
      {
        revision: "841f5c28f43fe81a5737ba678c884d56",
        url: "/jobs/assets/audio/f72ce1d27a6925bd.mp3",
      },
      {
        revision: "69e50ca436085281fdb182110af1fef4",
        url: "/jobs/assets/audio/f77ffe6a0b592bab.mp3",
      },
      {
        revision: "4f5ba69a7066a7673b1beaeae8db2a37",
        url: "/jobs/assets/audio/fe16808f539b6caa.mp3",
      },
      {
        revision: "8d8878373dd7b1b7105db0fe4ba326aa",
        url: "/jobs/assets/audio/fe51da0b7b81e4b6.mp3",
      },
      {
        revision: "98b2267f684bd193a07546e432aee052",
        url: "/jobs/assets/audio/fe669ee1f03a2821.mp3",
      },
      {
        revision: "caef8ee5031aa774c965cdf7af1b2ba8",
        url: "/jobs/assets/design-assets/home/3-dot.svg",
      },
      {
        revision: "3bf0b2dee930c2bcb84333e28a4e77df",
        url: "/jobs/assets/design-assets/home/add.svg",
      },
      {
        revision: "e970a1d7ba0e42e1433740e5cab1596e",
        url: "/jobs/assets/design-assets/home/chevron-right.svg",
      },
      {
        revision: "ce88d4106283091e983219350b81a93f",
        url: "/jobs/assets/design-assets/home/english-learning.png",
      },
      {
        revision: "1c5fd4dbbea9e02a703ed61ced143ab8",
        url: "/jobs/assets/design-assets/home/govt-exams.png",
      },
      {
        revision: "45b0695b1a66a18ae5c7efe41862e496",
        url: "/jobs/assets/design-assets/home/image-thumbnail.svg",
      },
      {
        revision: "1c5fd4dbbea9e02a703ed61ced143ab8",
        url: "/jobs/assets/design-assets/home/interview-prep.png",
      },
      {
        revision: "55ba004bf934eaa22bf364872365c764",
        url: "/jobs/assets/design-assets/home/learning.svg",
      },
      {
        revision: "7dba094b0f85928f2ceb214c6cd03456",
        url: "/jobs/assets/design-assets/home/micro-learning.png",
      },
      {
        revision: "29de71937b372eda7244f5f2eab9239a",
        url: "/jobs/assets/design-assets/home/share.svg",
      },
      {
        revision: "f7b838ee0c68ceaaa158ddb4354df294",
        url: "/jobs/assets/design-assets/home/sparkle.svg",
      },
      {
        revision: "0ad5a9c6a54470e403a41401393bdd5c",
        url: "/jobs/assets/design-assets/home/speak.svg",
      },
      {
        revision: "62521c03d786f557064c6118167ae583",
        url: "/jobs/assets/design-assets/microlearn/ai.svg",
      },
      {
        revision: "40e7e36264628f8c26121c64fd08d07b",
        url: "/jobs/assets/design-assets/microlearn/chevron-right.svg",
      },
      {
        revision: "420f497e4468147586fcf09765d05363",
        url: "/jobs/assets/design-assets/microlearn/course-complete.svg",
      },
      {
        revision: "3529a0ae2c21edc32d0e586939f77f5f",
        url: "/jobs/assets/design-assets/microlearn/creator.svg",
      },
      {
        revision: "8e22bcbe5b3ca4249fb8d9a2b98b0159",
        url: "/jobs/assets/design-assets/microlearn/excel.svg",
      },
      {
        revision: "b888ac8a20f677914c7b79268c0c06f4",
        url: "/jobs/assets/design-assets/microlearn/magic-edit.svg",
      },
      {
        revision: "d141afc2827ed710f2dcbc76f0ee398b",
        url: "/jobs/assets/design-assets/microlearn/office.svg",
      },
      {
        revision: "42fe711e97572a5fe8fcca9e70326e4b",
        url: "/jobs/assets/design-assets/microlearn/play.svg",
      },
      {
        revision: "938df3a257922df74cac9d3e89f85a8e",
        url: "/jobs/assets/design-assets/microlearn/shopkeeper.svg",
      },
      {
        revision: "f2844280ffbb0c7a4d36535917ffc509",
        url: "/jobs/assets/design-assets/microlearn/subtitle.svg",
      },
      {
        revision: "2973c16e7221d31997960ab126026e94",
        url: "/jobs/assets/design-assets/microlearn/thumbnail.svg",
      },
      {
        revision: "3e4bf3ee82f1b2e5193c3becaa3efe0b",
        url: "/jobs/assets/design-assets/microlearn/views.svg",
      },
      { revision: "c9f1afde45a15a48e06e5db393c260b8", url: "/jobs/assets/spin-loader.json" },
      { revision: "62e508d1623c9a7bd5871a3af073a911", url: "/jobs/design-prototype.html" },
      { revision: "3ef06feffffdaa97854b21e68d905ff9", url: "/jobs/english.html" },
      {
        revision: "ec1857220ecad46a6287fac74029fe22",
        url: "/jobs/fonts/JioTypeVarW05-Regular.woff2",
      },
      { revision: "105a84129a97e03deb48f930e8c81c85", url: "/jobs/fonts/JioTypeW05-Black.woff2" },
      { revision: "20bb3fb8a0f265ea810957a19aa287b7", url: "/jobs/fonts/JioTypeW05-Bold.woff2" },
      { revision: "65e2367820f81a1279978784965a5d21", url: "/jobs/fonts/JioTypeW05-Medium.woff2" },
      { revision: "3c48ff4358b8481e32ee9c254a21b4d5", url: "/jobs/govt-exam.html" },
      { revision: "97b3ee19b2212f89a2b47b3b4f04af33", url: "/jobs/index.html" },
      { revision: "a7e069dac6a326ae2026e36384544e65", url: "/jobs/interview-prep.html" },
      { revision: "b976689a8c29072f72d8d682e4e45139", url: "/jobs/microlearning.html" },
      { revision: "262aecf1898ceee78015b922b3e7d435", url: "/jobs/shared/ambient-glow.css" },
      { revision: "e167cd6c94c03c3b82cf83b5132276bf", url: "/jobs/shared/guided-chat.css" },
      { revision: "ea56e238d793457025d8a4f88cae73c6", url: "/jobs/shared/guided-chat.js" },
      { revision: "65a8b088f5980b35a5c770b1be739dd8", url: "/jobs/shared/icons.js" },
      { revision: "809942c54f5825ea56cb996f3d0af011", url: "/jobs/shared/jbiq-voice.js" },
      { revision: "ac9645b6b5fa4e754d5bdea041541d7c", url: "/jobs/shared/jds-tokens.css" },
      { revision: "127913d46793c7653f01fb24aa82045c", url: "/jobs/shared/multimodal.js" },
      { revision: "faee9f95626fe0bcf496d08e994ed627", url: "/jobs/shared/personas.js" },
      { revision: "4ff9c40ef428005955136b1478cac18c", url: "/jobs/shared/tts-cache.js" },
      { revision: "cae87e3f89bf6bde35a18a91e909bc91", url: "/jobs/zero/english.html" },
      { revision: "2f059d5df7d8f02015883b00180cf65e", url: "/jobs/zero/govt-exam.html" },
      { revision: "5bb3a6eeb943ffd522730158f07fb56c", url: "/jobs/zero/index.html" },
      { revision: "5f5fd7a5760452518e8f7b1d5e087520", url: "/jobs/zero/interview-prep.html" },
      { revision: "056ab72b30d645682913de90bfb4b47e", url: "/jobs/zero/microlearning.html" },
      { revision: "0c6e2625bc15a1b949b284e94b045979", url: "/manifest.webmanifest" },
      { revision: "1666c6f1e8ae3b302483082700dd1822", url: "/swe-worker-f61931bc2770d10b.js" },
    ],
    skipWaiting: !0,
    clientsClaim: !0,
    navigationPreload: !0,
    runtimeCaching: [
      { matcher: ({ url: e }) => e.pathname.startsWith("/health"), handler: new et() },
      ...eq,
    ],
  }).addEventListeners();
})();
