// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"fpfr8":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 57516;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "cb3fbcb871a7bb74";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"bqzw0":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "less", ()=>less);
parcelHelpers.export(exports, "lessCompletionSource", ()=>lessCompletionSource);
parcelHelpers.export(exports, "lessLanguage", ()=>lessLanguage);
var _language = require("@codemirror/language");
var _langCss = require("@codemirror/lang-css");
var _lr = require("@lezer/lr");
var _highlight = require("@lezer/highlight");
// This file was generated by lezer-generator. You probably shouldn't edit it.
const descendantOp = 110, Unit = 1, openArgList = 2;
const space = [
    9,
    10,
    11,
    12,
    13,
    32,
    133,
    160,
    5760,
    8192,
    8193,
    8194,
    8195,
    8196,
    8197,
    8198,
    8199,
    8200,
    8201,
    8202,
    8232,
    8233,
    8239,
    8287,
    12288
];
function isAlpha(ch) {
    return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isDigit(ch) {
    return ch >= 48 && ch <= 57;
}
const argList = /*@__PURE__*/ new (0, _lr.ExternalTokenizer)((input, stack)=>{
    if (input.next == 40 /* Ch.parenL */ ) {
        let prev = input.peek(-1);
        if (isAlpha(prev) || isDigit(prev) || prev == 95 /* Ch.underscore */  || prev == 45 /* Ch.dash */ ) input.acceptToken(openArgList, 1);
    }
});
const descendant = /*@__PURE__*/ new (0, _lr.ExternalTokenizer)((input)=>{
    if (space.indexOf(input.peek(-1)) > -1) {
        let { next } = input;
        if (isAlpha(next) || next == 95 /* Ch.underscore */  || next == 35 /* Ch.hash */  || next == 46 /* Ch.period */  || next == 91 /* Ch.bracketL */  || next == 58 /* Ch.colon */  || next == 45 /* Ch.dash */ ) input.acceptToken(descendantOp);
    }
});
const unitToken = /*@__PURE__*/ new (0, _lr.ExternalTokenizer)((input)=>{
    if (space.indexOf(input.peek(-1)) < 0) {
        let { next } = input;
        if (next == 37 /* Ch.percent */ ) {
            input.advance();
            input.acceptToken(Unit);
        }
        if (isAlpha(next)) {
            do input.advance();
            while (isAlpha(input.next));
            input.acceptToken(Unit);
        }
    }
});
const lessHighlighting = /*@__PURE__*/ (0, _highlight.styleTags)({
    "import charset namespace keyframes media supports when": (0, _highlight.tags).definitionKeyword,
    "from to selector": (0, _highlight.tags).keyword,
    NamespaceName: (0, _highlight.tags).namespace,
    KeyframeName: (0, _highlight.tags).labelName,
    TagName: (0, _highlight.tags).tagName,
    ClassName: (0, _highlight.tags).className,
    PseudoClassName: /*@__PURE__*/ (0, _highlight.tags).constant((0, _highlight.tags).className),
    IdName: (0, _highlight.tags).labelName,
    "FeatureName PropertyName PropertyVariable": (0, _highlight.tags).propertyName,
    AttributeName: (0, _highlight.tags).attributeName,
    NumberLiteral: (0, _highlight.tags).number,
    KeywordQuery: (0, _highlight.tags).keyword,
    UnaryQueryOp: (0, _highlight.tags).operatorKeyword,
    "CallTag ValueName": (0, _highlight.tags).atom,
    VariableName: (0, _highlight.tags).variableName,
    "AtKeyword Interpolation": /*@__PURE__*/ (0, _highlight.tags).special((0, _highlight.tags).variableName),
    Callee: (0, _highlight.tags).operatorKeyword,
    Unit: (0, _highlight.tags).unit,
    "UniversalSelector NestingSelector": (0, _highlight.tags).definitionOperator,
    MatchOp: (0, _highlight.tags).compareOperator,
    "ChildOp SiblingOp, LogicOp": (0, _highlight.tags).logicOperator,
    BinOp: (0, _highlight.tags).arithmeticOperator,
    Important: (0, _highlight.tags).modifier,
    "Comment LineComment": (0, _highlight.tags).blockComment,
    ColorLiteral: (0, _highlight.tags).color,
    "ParenthesizedContent StringLiteral": (0, _highlight.tags).string,
    Escape: /*@__PURE__*/ (0, _highlight.tags).special((0, _highlight.tags).string),
    ": ...": (0, _highlight.tags).punctuation,
    "PseudoOp #": (0, _highlight.tags).derefOperator,
    "; ,": (0, _highlight.tags).separator,
    "( )": (0, _highlight.tags).paren,
    "[ ]": (0, _highlight.tags).squareBracket,
    "{ }": (0, _highlight.tags).brace
});
// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_identifier = {
    __proto__: null,
    lang: 40,
    "nth-child": 40,
    "nth-last-child": 40,
    "nth-of-type": 40,
    "nth-last-of-type": 40,
    dir: 40,
    "host-context": 40,
    and: 244,
    or: 244,
    not: 74,
    only: 74,
    url: 86,
    "url-prefix": 86,
    domain: 86,
    regexp: 86,
    when: 117,
    selector: 142,
    from: 172,
    to: 174
};
const spec_AtKeyword = {
    __proto__: null,
    "@import": 126,
    "@plugin": 126,
    "@media": 152,
    "@charset": 156,
    "@namespace": 160,
    "@keyframes": 166,
    "@supports": 178
};
const parser = /*@__PURE__*/ (0, _lr.LRParser).deserialize({
    version: 14,
    states: "@^O!gQWOOO!nQaO'#CeOOQP'#Cd'#CdO$RQWO'#CgO$xQaO'#EaO%cQWO'#CiO%kQWO'#DZO%pQWO'#D^O%uQaO'#DfOOQP'#Es'#EsO'YQWO'#DlO'yQWO'#DyO(QQWO'#D{O(xQWO'#D}O)TQWO'#EQO'bQWO'#EWO)YQ`O'#FTO)]Q`O'#FTO)hQ`O'#FTO)vQWO'#EYOOQO'#Er'#ErOOQO'#FV'#FVOOQO'#Ec'#EcO){QWO'#EqO*WQWO'#EqQOQWOOOOQP'#Ch'#ChOOQP,59R,59RO$RQWO,59RO*bQWO'#EdO+PQWO,58|O+_QWO,59TO%kQWO,59uO%pQWO,59xO*bQWO,59{O*bQWO,59}OOQO'#De'#DeO*bQWO,5:OO,bQpO'#E}O,iQWO'#DkOOQO,58|,58|O(QQWO,58|O,pQWO,5:{OOQO,5:{,5:{OOQT'#Cl'#ClO-UQeO,59TO.cQ[O,59TOOQP'#D]'#D]OOQP,59u,59uOOQO'#D_'#D_O.hQpO,59xOOQO'#EZ'#EZO.pQ`O,5;oOOQO,5;o,5;oO/OQWO,5:WO/VQWO,5:WOOQS'#Dn'#DnO/rQWO'#DsO/yQ!fO'#FRO0eQWO'#DtOOQS'#FS'#FSO+YQWO,5:eO'bQWO'#DrOOQS'#Cu'#CuO(QQWO'#CwO0jQ!hO'#CyO2^Q!fO,5:gO2oQWO'#DWOOQS'#Ex'#ExO(QQWO'#DQOOQO'#EP'#EPO2tQWO,5:iO2yQWO,5:iOOQO'#ES'#ESO3RQWO,5:lO3WQ!fO,5:rO3iQ`O'#EkO.pQ`O,5;oOOQO,5:|,5:|O3zQWO,5:tOOQO,5:},5:}O4XQWO,5;]OOQO-E8a-E8aOOQP1G.m1G.mOOQP'#Ce'#CeO5RQaO,5;OOOQP'#Df'#DfOOQO-E8b-E8bOOQO1G.h1G.hO(QQWO1G.hO5fQWO1G.hO5nQeO1G.oO.cQ[O1G.oOOQP1G/a1G/aO6{QpO1G/dO7fQaO1G/gO8cQaO1G/iO9`QaO1G/jO:]Q!fO'#FOO:yQ!fO'#ExOOQO'#FO'#FOOOQO,5;i,5;iO<^QWO,5;iO<iQWO,5:VO<nQ!fO1G.hOOQO1G0g1G0gO=PQWO'#CnOOQP1G.o1G.oO=WQWO'#CqOOQP1G/d1G/dO(QQWO1G/dO=_Q`O1G1ZOOQO1G1Z1G1ZO=mQWO1G/rO=rQ!fO'#FQO>WQWO1G/rO>]Q!fO'#DnO>qQWO,5:ZO>vQ!fO,5:_OOQO'#DP'#DPO'bQWO,5:]O?XQWO'#DwOOQS,5:b,5:bO?`QWO,5:dO'bQWO'#EiO?gQWO,5;mO*bQWO,5:`OOQO1G0P1G0PO?uQ!fO,5:^O@aQ!fO,59cOOQS,59e,59eO(QQWO,59iOOQS,59n,59nO@rQWO,59pOOQO1G0R1G0RO@yQ#tO,59rOARQ!fO,59lOOQO1G0T1G0TOBrQWO1G0TOBwQWO'#ETOOQO1G0W1G0WOOQO1G0^1G0^OOQO,5;V,5;VOOQO-E8i-E8iOCVQ!fO1G0bOCvQWO1G0`O%kQWO'#E_O$RQWO'#E`OEZQWO'#E^OOQO1G0b1G0bPEkQWO'#EcO<nQ!fO7+$SOOQO7+$S7+$SO(QQWO7+$SOOQP7+$Z7+$ZOOQP7+%O7+%OO(QQWO7+%OOEpQ!fO'#EeOF}QWO,5;jO(QQWO,5;jOOQO,5;j,5;jO+gQpO'#EgOG[QWO1G1TOOQO1G1T1G1TOOQO1G/q1G/qOGgQaO'#EvOGnQWO,59YOGsQWO'#EwOG}QWO,59]OHSQ!fO7+%OOOQO7+&u7+&uOOQO7+%^7+%^O(QQWO'#EhOHeQWO,5;lOHmQWO7+%^O(QQWO1G/uOOQS1G/y1G/yOOQS1G/w1G/wOHrQWO,5:cOHwQ!fO1G0OOOQS1G0O1G0OOIYQ!fO,5;TOOQO-E8g-E8gOItQaO1G/zOOQS1G.}1G.}OOQS1G/T1G/TOI{Q!fO1G/[OOQS1G/[1G/[OJ^QWO1G/^OOQO7+%o7+%oOJcQYO'#CyO+YQWO'#EjOJkQWO,5:oOOQO,5:o,5:oOJyQ!fO'#ElO(QQWO'#ElOL^QWO7+%|OOQO7+%|7+%|OOQO7+%z7+%zOOQO,5:y,5:yOOQO,5:z,5:zOLqQaO,5:xOOQO,5:x,5:xOOQO<<Gn<<GnO<nQ!fO<<GnOMRQ!fO<<HjOOQO-E8c-E8cOMdQWO1G1UOOQO,5;R,5;ROOQO-E8e-E8eOOQO7+&o7+&oOMqQWO,5;bOOQP1G.t1G.tO(QQWO'#EfOMyQWO,5;cOOQT1G.w1G.wOOQP<<Hj<<HjONRQ!fO,5;SOOQO-E8f-E8fO/OQWO<<HxONgQWO7+%aOOQS1G/}1G/}OOQS7+%j7+%jOOQS7+%f7+%fOOQS7+$v7+$vOOQS7+$x7+$xOOQO,5;U,5;UOOQO-E8h-E8hOOQO1G0Z1G0ZONnQ!fO,5;WOOQO-E8j-E8jOOQO<<Ih<<IhOOQO1G0d1G0dOOQOAN=YAN=YOOQPAN>UAN>UO!!RQWO,5;QOOQO-E8d-E8dO!!]QWOAN>dOOQS<<H{<<H{OOQOG24OG24O",
    stateData: "!!n~O#dOSROSSOS~OVXOYXO^TO_TOfaOgbOoaOpWOyVO!OUO!aYO!nZO!p[O!r]O!u^O!{_O#hPO#iRO~O#a#eP~P]O^XX^!}X_XXcXXjXXp!}XyXX!OXX!UXX!ZXX![XX!^XX#PXX#aXX#bXX#iXX#oXX#pXX#p!}X#x!}X!]XX~O#hjO~O^oO_oOcmOyqO!OpO!UrO#bsO#ilO#otO#ptO~OjvO![yO!^wO#P{O!Z#TX#a#TX!]#TX~P$WOd!OO#h|O~O#h!PO~O#h!RO~O#h!TO#p!VO#x!VO^!YX^#wX_!YXc!YXj!YXy!YX!O!YX!U!YX!Z!YX![!YX!^!YX#P!YX#a!YX#b!YX#i!YX#o!YX#p!YX!]!YX~Oj!XOn!WO~Og!^Oj!ZOo!^Op!^Ou!`O!i!]O#h!YO~O!^#uP~P'bOf!fOg!fOh!fOj!bOl!fOn!fOo!fOp!fOu!gO{!eO#h!aO#m!cO~On!iO{!eO#h!hO~O#h!kO~Op!nO#p!VO#x!VO^#wX~OjvO#p!VO#x!VO^#wX~O^!qO~O!Z!rO#a#eX!]#eX~O#a#eX!]#eX~P]OVXOYXO^TO_TOp!xOyVO!OUO#h!vO#iRO~OcmOjvO![!{O!^wO~Od#OO#h|O~Of!fOg#VOh!fOj!bOl!fOn!fOo!fOp!fOu!gO{!eO#h!aO#m!cO#s#WO~Oa#XO~P+gO!]#eP~P]O![!{O!^wO#P#]O!Z#Ta#a#Ta!]#Ta~OQ#^O^]a_]ac]aj]ay]a!O]a!U]a!Z]a![]a!^]a#P]a#a]a#b]a#i]a#o]a#p]a!]]aa]a~OQ#`O~Ow#aO!S#bO~Op!nO#p#dO#x#dO^#wa~O!Z#uP~P'bOa#tP~P(QOg!^Oj!ZOo!^Op!^Ou!`O!i!]O~O#h#hO~P/^OQ#mOc#pOr#lOy#oO#n#kO!^#uX!Z#uXa#uX~Oj#rO~OP#vOQmXrmXymX!ZmX#nmX^mXamXcmXfmXgmXhmXjmXlmXnmXomXpmXumX{mX#hmX#mmX!^mX#PmX#amXwmX!]mX~OQ#`Or#wOy#yO!Z#zO#n#kO~Oj#{O~O!Z#}O~On$OO{!eO~O!^$PO~OQ#mOr#lOy#oO!^wO#n#kO~O#h!TO^#_Xp#_X#p#_X#x#_X~O!O$WO!^wO#i$XO~P(QO!Z!rO#a#ea!]#ea~O^oO_oOyqO!OpO!UrO#bsO#ilO#otO#ptO~Oc#Waj#Wa![#Wa!^#Waa#Wa~P4dO![$_O!^wO~OQ#^O^]i_]ic]ij]iy]i!O]i!U]i!Z]i![]i!^]i#P]i#a]i#b]i#i]i#o]i#p]i!]]ia]i~Ow$aO!S$bO~O^oO_oOyqO!OpO#ilO~Oc!Tij!Ti!U!Ti!Z!Ti![!Ti!^!Ti#P!Ti#a!Ti#b!Ti#o!Ti#p!Ti!]!Tia!Ti~P7TOc!Vij!Vi!U!Vi!Z!Vi![!Vi!^!Vi#P!Vi#a!Vi#b!Vi#o!Vi#p!Vi!]!Via!Vi~P7TOc!Wij!Wi!U!Wi!Z!Wi![!Wi!^!Wi#P!Wi#a!Wi#b!Wi#o!Wi#p!Wi!]!Wia!Wi~P7TOQ#`O^$eOr#wOy#yO#n#kOa#rXc#rX!Z#rX~P(QO#s$fOQ#lX^#lXa#lXc#lXf#lXg#lXh#lXj#lXl#lXn#lXo#lXp#lXr#lXu#lXy#lX{#lX!Z#lX#h#lX#m#lX#n#lX~Oa$iOc$gO!Z$gO~O!]$jO~OQ#`Or#wOy#yO!^wO#n#kO~Oa#jP~P*bOa#kP~P(QOp!nO#p$pO#x$pO^#wi~O!Z$qO~OQ#`Oc$rOr#wOy#yO#n#kOa#tX~Oa$tO~OQ!bX^!dXa!bXr!bXy!bX#n!bX~O^$uO~OQ#mOa$vOr#lOy#oO#n#kO~Oa#uP~P'bOw$zO~P(QOc#pO!^#ua!Z#uaa#ua~OQ#mOr#lOy#oO#n#kOc!fa!^!fa!Z!faa!fa~OQ#`Oa%OOr#wOy#yO#n#kO~Ow%RO~P(QOn%SO|%SO~OQ#`Or#wOy#yO#n#kO!Zta^taatactaftagtahtajtaltantaotaptauta{ta#hta#mta!^ta#Pta#atawta!]ta~O!Z%TO~O!]%XO!x%VO!y%VO#m%UO~OQ#`Oc%ZOr#wOy#yO#P%]O#n#kO!Z#Oi#a#Oi!]#Oi~P(QO!Z%^OV!|iY!|i^!|i_!|if!|ig!|io!|ip!|iy!|i!O!|i!a!|i!n!|i!p!|i!r!|i!u!|i!{!|i#a!|i#h!|i#i!|i!]!|i~OjvO!Z#QX#a#QX!]#QX~P*bO!Z!rO~OQ#`Or#wOy#yO#n#kOa#XXc#XXf#XXg#XXh#XXj#XXl#XXn#XXo#XXp#XXu#XX{#XX!Z#XX#h#XX#m#XX~Oa#rac#ra!Z#ra~P(QOa%jOc$gO!Z$gO~Oa#jX~P$WOa%lO~Oc%mOa#kX~P(QOa%oO~OQ#`Or#wOw%pOy#yO#n#kO~Oc$rOa#ta~On%sO~Oa%uO~OQ#`Or#wOw%vOy#yO#n#kO~OQ#mOr#lOy#oO#n#kOc#]a!^#]a!Z#]aa#]a~Oa%wO~P4dOQ#`Or#wOw%xOy#yO#n#kO~Oa%yO~OP#vO!^mX~O!]%|O!x%VO!y%VO#m%UO~OQ#`Or#wOy#yO#n#kOc#`Xf#`Xg#`Xh#`Xj#`Xl#`Xn#`Xo#`Xp#`Xu#`X{#`X!Z#`X#P#`X#a#`X#h#`X#m#`X!]#`X~Oc%ZO#P&PO!Z#Oq#a#Oq!]#Oq~P(QOjvO!Z#Qa#a#Qa!]#Qa~P4dOQ#`Or#wOw&SOy#yO#n#kO~Oa#ric#ri!Z#ri~P(QOcmOa#ja~Oc%mOa#ka~OQ#`Or#wOy#yO#n#kOa#[ac#[a~Oa&WO~P(QOQ#`Or#wOy#yO#n#kOc#`af#`ag#`ah#`aj#`al#`an#`ao#`ap#`au#`a{#`a!Z#`a#P#`a#a#`a#h#`a#m#`a!]#`a~Oa#Yac#Ya~P(QO!Z&XO~Of#dpg#m|#iRSRr~",
    goto: "0^#zPPPPPP#{P$Q$^P$Q$j$QPP$sP$yPP%PPPP%jP%jP&ZPPP%jP'O%jP%jP%jP'jPP$QP(a$Q(jP$QP$Q$Q(p$QPPPP(w#{P)f)f)q)f)f)f)fP)f)t)f#{P#{P#{P){#{P*O*RPP#{P#{*U*aP*f*i*i*a*a*l*s*}+e+k+q+w+},T,_PPPP,e,k,pPP-[-_-bPPPP.u/UP/[/_/k0QP0VVdOhweXOhmrsuw#^#r$YeQOhmrsuw#^#r$YQkRQ!ulR%`$XQ}TR!}oQ#_}R$`!}Q#_!Or#x!d#U#[#f#u#|$U$]$c$o$y%Q%Y%d%e%q%}R$`#O!]!f[vy!X!b!g!q!{#U#`#b#o#w#y$U$_$b$d$e$g$m$r$u%Z%[%g%m%t&T![!f[vy!X!b!g!q!{#U#`#b#o#w#y$U$_$b$d$e$g$m$r$u%Z%[%g%m%t&TT%V$P%WY#l![!m#j#t${s#w!d#U#[#f#u#|$U$]$c$o$y%Q%Y%d%e%q%}![!f[vy!X!b!g!q!{#U#`#b#o#w#y$U$_$b$d$e$g$m$r$u%Z%[%g%m%t&TQ!i]R$O!jQ!QUQ#PpR%_$WQ!SVR#QqZuS!w$k$}%aQxSS!znzQ#s!_Q$R!mQ$V!qS$^!|#[Q%c$]Q%z%VR&R%dc!^Z_!W!Z!`#l#m#p%sR#i!ZZ#n![!m#j#t${R!j]R!l^R$Q!lU`OhwQ!UWR$S!nVeOhwR$Z!qR$Y!qShOwR!thQnSS!yn%kR%k$kQ$d#UQ$m#`Y%f$d$m%g%t&TQ%g$eQ%t$uR&T%mQ%n$mR&U%nQ$h#YR%i$hQ$s#fR%r$sQ#q![R$|#qQ%W$PR%{%WQ!o`Q#c!UT$T!o#cQ%[$UR&O%[QiOR#ZwVfOhwUSOhwQ!wmQ#RrQ#SsQ#TuQ$k#^Q$}#rR%a$YR$l#^R$n#`Q!d[S#Uv$gQ#[yQ#f!XQ#u!bQ#|!gQ$U!qQ$]!{d$c#U#`$d$e$m$u%g%m%t&TQ$o#bQ$y#oQ%P#wQ%Q#yS%Y$U%[Q%d$_Q%e$bQ%q$rR%}%ZQzSQ!pbQ!|nQ%b$YR&Q%aQ#YvR%h$gR#g!XQ!_ZQ#e!WQ$x#mR&V%sW![Z!W#m%sQ!m_Q#j!ZQ#t!`Q$w#lR${#pVcOhwSgOwR!sh",
    nodeNames: "\u26A0 Unit ( Comment LineComment StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector ClassSelector ClassName PseudoClassSelector : :: PseudoClassName ) ArgList , PseudoClassName ArgList VariableName AtKeyword PropertyVariable ValueName ( ParenthesizedValue ColorLiteral NumberLiteral StringLiteral Escape Interpolation BinaryExpression BinOp LogicOp UnaryExpression UnaryQueryOp CallExpression ] SubscriptExpression [ CallLiteral CallTag ParenthesizedContent IdSelector # IdName AttributeSelector AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp InterpolatedSelector ; when } { Block ImportStatement import KeywordQuery FeatureQuery FeatureName BinaryQuery UnaryQuery ParenthesizedQuery SelectorQuery selector CallQuery ArgList SubscriptQuery MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList from to SupportsStatement supports DetachedRuleSet PropertyName Declaration Important Inclusion IdSelector ClassSelector Inclusion CallExpression",
    maxTerm: 133,
    nodeProps: [
        [
            "isolate",
            -3,
            3,
            4,
            30,
            ""
        ],
        [
            "openedBy",
            17,
            "(",
            59,
            "{"
        ],
        [
            "closedBy",
            26,
            ")",
            60,
            "}"
        ]
    ],
    propSources: [
        lessHighlighting
    ],
    skippedNodes: [
        0,
        3,
        4
    ],
    repeatNodeCount: 10,
    tokenData: "!2q~R!ZOX$tX^%l^p$tpq%lqr)Ors-xst/ltu6Zuv$tvw8^wx:Uxy;syz<Uz{<Z{|<t|}BQ}!OBc!O!PDo!P!QFY!Q![Jw![!]Kr!]!^Ln!^!_MP!_!`M{!`!aNl!a!b$t!b!c! m!c!}!&R!}#O!'y#O#P$t#P#Q!([#Q#R!(m#R#T$t#T#o!&R#o#p!)S#p#q!(m#q#r!)e#r#s!)v#s#y$t#y#z%l#z$f$t$f$g%l$g#BY$t#BY#BZ%l#BZ$IS$t$IS$I_%l$I_$I|$t$I|$JO%l$JO$JT$t$JT$JU%l$JU$KV$t$KV$KW%l$KW&FU$t&FU&FV%l&FV;'S$t;'S;=`!2k<%lO$t`$wSOy%Tz;'S%T;'S;=`%f<%lO%T`%YS|`Oy%Tz;'S%T;'S;=`%f<%lO%T`%iP;=`<%l%T~%qh#d~OX%TX^']^p%Tpq']qy%Tz#y%T#y#z']#z$f%T$f$g']$g#BY%T#BY#BZ']#BZ$IS%T$IS$I_']$I_$I|%T$I|$JO']$JO$JT%T$JT$JU']$JU$KV%T$KV$KW']$KW&FU%T&FU&FV']&FV;'S%T;'S;=`%f<%lO%T~'dh#d~|`OX%TX^']^p%Tpq']qy%Tz#y%T#y#z']#z$f%T$f$g']$g#BY%T#BY#BZ']#BZ$IS%T$IS$I_']$I_$I|%T$I|$JO']$JO$JT%T$JT$JU']$JU$KV%T$KV$KW']$KW&FU%T&FU&FV']&FV;'S%T;'S;=`%f<%lO%Tk)RUOy%Tz#]%T#]#^)e#^;'S%T;'S;=`%f<%lO%Tk)jU|`Oy%Tz#a%T#a#b)|#b;'S%T;'S;=`%f<%lO%Tk*RU|`Oy%Tz#d%T#d#e*e#e;'S%T;'S;=`%f<%lO%Tk*jU|`Oy%Tz#c%T#c#d*|#d;'S%T;'S;=`%f<%lO%Tk+RU|`Oy%Tz#f%T#f#g+e#g;'S%T;'S;=`%f<%lO%Tk+jU|`Oy%Tz#h%T#h#i+|#i;'S%T;'S;=`%f<%lO%Tk,RU|`Oy%Tz#T%T#T#U,e#U;'S%T;'S;=`%f<%lO%Tk,jU|`Oy%Tz#b%T#b#c,|#c;'S%T;'S;=`%f<%lO%Tk-RU|`Oy%Tz#h%T#h#i-e#i;'S%T;'S;=`%f<%lO%Tk-lS#PZ|`Oy%Tz;'S%T;'S;=`%f<%lO%T~-{WOY-xZr-xrs.es#O-x#O#P.j#P;'S-x;'S;=`/f<%lO-x~.jOn~~.mRO;'S-x;'S;=`.v;=`O-x~.yXOY-xZr-xrs.es#O-x#O#P.j#P;'S-x;'S;=`/f;=`<%l-x<%lO-x~/iP;=`<%l-xo/qY!OROy%Tz!Q%T!Q![0a![!c%T!c!i0a!i#T%T#T#Z0a#Z;'S%T;'S;=`%f<%lO%Tm0fY|`Oy%Tz!Q%T!Q![1U![!c%T!c!i1U!i#T%T#T#Z1U#Z;'S%T;'S;=`%f<%lO%Tm1ZY|`Oy%Tz!Q%T!Q![1y![!c%T!c!i1y!i#T%T#T#Z1y#Z;'S%T;'S;=`%f<%lO%Tm2QYl]|`Oy%Tz!Q%T!Q![2p![!c%T!c!i2p!i#T%T#T#Z2p#Z;'S%T;'S;=`%f<%lO%Tm2wYl]|`Oy%Tz!Q%T!Q![3g![!c%T!c!i3g!i#T%T#T#Z3g#Z;'S%T;'S;=`%f<%lO%Tm3lY|`Oy%Tz!Q%T!Q![4[![!c%T!c!i4[!i#T%T#T#Z4[#Z;'S%T;'S;=`%f<%lO%Tm4cYl]|`Oy%Tz!Q%T!Q![5R![!c%T!c!i5R!i#T%T#T#Z5R#Z;'S%T;'S;=`%f<%lO%Tm5WY|`Oy%Tz!Q%T!Q![5v![!c%T!c!i5v!i#T%T#T#Z5v#Z;'S%T;'S;=`%f<%lO%Tm5}Sl]|`Oy%Tz;'S%T;'S;=`%f<%lO%Tm6^YOy%Tz!_%T!_!`6|!`!c%T!c!}7a!}#T%T#T#o7a#o;'S%T;'S;=`%f<%lO%Td7TS!SS|`Oy%Tz;'S%T;'S;=`%f<%lO%Tm7h[h]|`Oy%Tz}%T}!O7a!O!Q%T!Q![7a![!c%T!c!}7a!}#T%T#T#o7a#o;'S%T;'S;=`%f<%lO%Ta8c[YPOy%Tz}%T}!O9X!O!Q%T!Q![9X![!c%T!c!}9X!}#T%T#T#o9X#o;'S%T;'S;=`%f<%lO%Ta9`[YP|`Oy%Tz}%T}!O9X!O!Q%T!Q![9X![!c%T!c!}9X!}#T%T#T#o9X#o;'S%T;'S;=`%f<%lO%T~:XWOY:UZw:Uwx.ex#O:U#O#P:q#P;'S:U;'S;=`;m<%lO:U~:tRO;'S:U;'S;=`:};=`O:U~;QXOY:UZw:Uwx.ex#O:U#O#P:q#P;'S:U;'S;=`;m;=`<%l:U<%lO:U~;pP;=`<%l:Uo;xSj_Oy%Tz;'S%T;'S;=`%f<%lO%T~<ZOa~m<bUVPrWOy%Tz!_%T!_!`6|!`;'S%T;'S;=`%f<%lO%To<{Y#pQrWOy%Tz!O%T!O!P=k!P!Q%T!Q![@p![#R%T#R#SAm#S;'S%T;'S;=`%f<%lO%Tm=pU|`Oy%Tz!Q%T!Q![>S![;'S%T;'S;=`%f<%lO%Tm>ZY#m]|`Oy%Tz!Q%T!Q![>S![!g%T!g!h>y!h#X%T#X#Y>y#Y;'S%T;'S;=`%f<%lO%Tm?OY|`Oy%Tz{%T{|?n|}%T}!O?n!O!Q%T!Q![@V![;'S%T;'S;=`%f<%lO%Tm?sU|`Oy%Tz!Q%T!Q![@V![;'S%T;'S;=`%f<%lO%Tm@^U#m]|`Oy%Tz!Q%T!Q![@V![;'S%T;'S;=`%f<%lO%Tm@w[#m]|`Oy%Tz!O%T!O!P>S!P!Q%T!Q![@p![!g%T!g!h>y!h#X%T#X#Y>y#Y;'S%T;'S;=`%f<%lO%TbAtS#xQ|`Oy%Tz;'S%T;'S;=`%f<%lO%TkBVScZOy%Tz;'S%T;'S;=`%f<%lO%TmBhXrWOy%Tz}%T}!OCT!O!P=k!P!Q%T!Q![@p![;'S%T;'S;=`%f<%lO%TmCYW|`Oy%Tz!c%T!c!}Cr!}#T%T#T#oCr#o;'S%T;'S;=`%f<%lO%TmCy[f]|`Oy%Tz}%T}!OCr!O!Q%T!Q![Cr![!c%T!c!}Cr!}#T%T#T#oCr#o;'S%T;'S;=`%f<%lO%ToDtW#iROy%Tz!O%T!O!PE^!P!Q%T!Q![>S![;'S%T;'S;=`%f<%lO%TlEcU|`Oy%Tz!O%T!O!PEu!P;'S%T;'S;=`%f<%lO%TlE|S#s[|`Oy%Tz;'S%T;'S;=`%f<%lO%T~F_VrWOy%Tz{Ft{!P%T!P!QIl!Q;'S%T;'S;=`%f<%lO%T~FyU|`OyFtyzG]z{Hd{;'SFt;'S;=`If<%lOFt~G`TOzG]z{Go{;'SG];'S;=`H^<%lOG]~GrVOzG]z{Go{!PG]!P!QHX!Q;'SG];'S;=`H^<%lOG]~H^OR~~HaP;=`<%lG]~HiW|`OyFtyzG]z{Hd{!PFt!P!QIR!Q;'SFt;'S;=`If<%lOFt~IYS|`R~Oy%Tz;'S%T;'S;=`%f<%lO%T~IiP;=`<%lFt~IsV|`S~OYIlYZ%TZyIlyzJYz;'SIl;'S;=`Jq<%lOIl~J_SS~OYJYZ;'SJY;'S;=`Jk<%lOJY~JnP;=`<%lJY~JtP;=`<%lIlmJ|[#m]Oy%Tz!O%T!O!P>S!P!Q%T!Q![@p![!g%T!g!h>y!h#X%T#X#Y>y#Y;'S%T;'S;=`%f<%lO%TkKwU^ZOy%Tz![%T![!]LZ!];'S%T;'S;=`%f<%lO%TcLbS_R|`Oy%Tz;'S%T;'S;=`%f<%lO%TkLsS!ZZOy%Tz;'S%T;'S;=`%f<%lO%ThMUUrWOy%Tz!_%T!_!`Mh!`;'S%T;'S;=`%f<%lO%ThMoS|`rWOy%Tz;'S%T;'S;=`%f<%lO%TlNSW!SSrWOy%Tz!^%T!^!_Mh!_!`%T!`!aMh!a;'S%T;'S;=`%f<%lO%TjNsV!UQrWOy%Tz!_%T!_!`Mh!`!a! Y!a;'S%T;'S;=`%f<%lO%Tb! aS!UQ|`Oy%Tz;'S%T;'S;=`%f<%lO%To! rYg]Oy%Tz!b%T!b!c!!b!c!}!#R!}#T%T#T#o!#R#o#p!$O#p;'S%T;'S;=`%f<%lO%Tm!!iWg]|`Oy%Tz!c%T!c!}!#R!}#T%T#T#o!#R#o;'S%T;'S;=`%f<%lO%Tm!#Y[g]|`Oy%Tz}%T}!O!#R!O!Q%T!Q![!#R![!c%T!c!}!#R!}#T%T#T#o!#R#o;'S%T;'S;=`%f<%lO%To!$TW|`Oy%Tz!c%T!c!}!$m!}#T%T#T#o!$m#o;'S%T;'S;=`%f<%lO%To!$r^|`Oy%Tz}%T}!O!$m!O!Q%T!Q![!$m![!c%T!c!}!$m!}#T%T#T#o!$m#o#q%T#q#r!%n#r;'S%T;'S;=`%f<%lO%To!%uSp_|`Oy%Tz;'S%T;'S;=`%f<%lO%To!&W[#h_Oy%Tz}%T}!O!&|!O!Q%T!Q![!&|![!c%T!c!}!&|!}#T%T#T#o!&|#o;'S%T;'S;=`%f<%lO%To!'T[#h_|`Oy%Tz}%T}!O!&|!O!Q%T!Q![!&|![!c%T!c!}!&|!}#T%T#T#o!&|#o;'S%T;'S;=`%f<%lO%Tk!(OSyZOy%Tz;'S%T;'S;=`%f<%lO%Tm!(aSw]Oy%Tz;'S%T;'S;=`%f<%lO%Td!(pUOy%Tz!_%T!_!`6|!`;'S%T;'S;=`%f<%lO%Tk!)XS!^ZOy%Tz;'S%T;'S;=`%f<%lO%Tk!)jS!]ZOy%Tz;'S%T;'S;=`%f<%lO%To!){Y#oQOr%Trs!*ksw%Twx!.wxy%Tz!_%T!_!`6|!`;'S%T;'S;=`%f<%lO%Tm!*pZ|`OY!*kYZ%TZr!*krs!+csy!*kyz!+vz#O!*k#O#P!-j#P;'S!*k;'S;=`!.q<%lO!*km!+jSo]|`Oy%Tz;'S%T;'S;=`%f<%lO%T]!+yWOY!+vZr!+vrs!,cs#O!+v#O#P!,h#P;'S!+v;'S;=`!-d<%lO!+v]!,hOo]]!,kRO;'S!+v;'S;=`!,t;=`O!+v]!,wXOY!+vZr!+vrs!,cs#O!+v#O#P!,h#P;'S!+v;'S;=`!-d;=`<%l!+v<%lO!+v]!-gP;=`<%l!+vm!-oU|`Oy!*kyz!+vz;'S!*k;'S;=`!.R;=`<%l!+v<%lO!*km!.UXOY!+vZr!+vrs!,cs#O!+v#O#P!,h#P;'S!+v;'S;=`!-d;=`<%l!*k<%lO!+vm!.tP;=`<%l!*km!.|Z|`OY!.wYZ%TZw!.wwx!+cxy!.wyz!/oz#O!.w#O#P!1^#P;'S!.w;'S;=`!2e<%lO!.w]!/rWOY!/oZw!/owx!,cx#O!/o#O#P!0[#P;'S!/o;'S;=`!1W<%lO!/o]!0_RO;'S!/o;'S;=`!0h;=`O!/o]!0kXOY!/oZw!/owx!,cx#O!/o#O#P!0[#P;'S!/o;'S;=`!1W;=`<%l!/o<%lO!/o]!1ZP;=`<%l!/om!1cU|`Oy!.wyz!/oz;'S!.w;'S;=`!1u;=`<%l!/o<%lO!.wm!1xXOY!/oZw!/owx!,cx#O!/o#O#P!0[#P;'S!/o;'S;=`!1W;=`<%l!.w<%lO!/om!2hP;=`<%l!.w`!2nP;=`<%l$t",
    tokenizers: [
        descendant,
        unitToken,
        argList,
        0,
        1,
        2,
        3,
        4
    ],
    topRules: {
        "StyleSheet": [
            0,
            5
        ]
    },
    specialized: [
        {
            term: 116,
            get: (value)=>spec_identifier[value] || -1
        },
        {
            term: 23,
            get: (value)=>spec_AtKeyword[value] || -1
        }
    ],
    tokenPrec: 2180
});
/**
A language provider for Less style sheets.
*/ const lessLanguage = /*@__PURE__*/ (0, _language.LRLanguage).define({
    name: "less",
    parser: /*@__PURE__*/ parser.configure({
        props: [
            /*@__PURE__*/ (0, _language.indentNodeProp).add({
                Declaration: /*@__PURE__*/ (0, _language.continuedIndent)()
            }),
            /*@__PURE__*/ (0, _language.foldNodeProp).add({
                Block: (0, _language.foldInside)
            })
        ]
    }),
    languageData: {
        commentTokens: {
            block: {
                open: "/*",
                close: "*/"
            },
            line: "//"
        },
        indentOnInput: /^\s*\}$/,
        wordChars: "@-"
    }
});
/**
Property, variable, @-variable, and value keyword completion
source.
*/ const lessCompletionSource = /*@__PURE__*/ (0, _langCss.defineCSSCompletionSource)((node)=>node.name == "VariableName" || node.name == "AtKeyword");
/**
Language support for Less.
*/ function less() {
    return new (0, _language.LanguageSupport)(lessLanguage, lessLanguage.data.of({
        autocomplete: lessCompletionSource
    }));
}

},{"@codemirror/language":"dx7XI","@codemirror/lang-css":"lusFz","@lezer/lr":"hqnf3","@lezer/highlight":"5AwBv","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["fpfr8"], null, "parcelRequire10c2", {})

//# sourceMappingURL=dist.71a7bb74.js.map
