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
})({"3cO0W":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 57516;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "9c3afae6bb3af017";
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

},{}],"g4ln8":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "angular", ()=>angular);
parcelHelpers.export(exports, "angularLanguage", ()=>angularLanguage);
var _language = require("@codemirror/language");
var _langHtml = require("@codemirror/lang-html");
var _langJavascript = require("@codemirror/lang-javascript");
var _highlight = require("@lezer/highlight");
var _common = require("@lezer/common");
var _lr = require("@lezer/lr");
// This file was generated by lezer-generator. You probably shouldn't edit it.
const Text = 1, attributeContentSingle = 33, attributeContentDouble = 34, scriptAttributeContentSingle = 35, scriptAttributeContentDouble = 36;
const text = /*@__PURE__*/ new (0, _lr.ExternalTokenizer)((input)=>{
    let start = input.pos;
    for(;;){
        if (input.next == 10 /* Ch.Newline */ ) {
            input.advance();
            break;
        } else if (input.next == 123 /* Ch.BraceL */  && input.peek(1) == 123 /* Ch.BraceL */  || input.next < 0) break;
        input.advance();
    }
    if (input.pos > start) input.acceptToken(Text);
});
function attrContent(quote, token, script) {
    return new (0, _lr.ExternalTokenizer)((input)=>{
        let start = input.pos;
        while(input.next != quote && input.next >= 0 && (script || input.next != 38 /* Ch.Ampersand */  && (input.next != 123 /* Ch.BraceL */  || input.peek(1) != 123 /* Ch.BraceL */ )))input.advance();
        if (input.pos > start) input.acceptToken(token);
    });
}
const attrSingle = /*@__PURE__*/ attrContent(39 /* Ch.SingleQuote */ , attributeContentSingle, false);
const attrDouble = /*@__PURE__*/ attrContent(34 /* Ch.DoubleQuote */ , attributeContentDouble, false);
const scriptAttrSingle = /*@__PURE__*/ attrContent(39 /* Ch.SingleQuote */ , scriptAttributeContentSingle, true);
const scriptAttrDouble = /*@__PURE__*/ attrContent(34 /* Ch.DoubleQuote */ , scriptAttributeContentDouble, true);
// This file was generated by lezer-generator. You probably shouldn't edit it.
const parser = /*@__PURE__*/ (0, _lr.LRParser).deserialize({
    version: 14,
    states: "(jOVOqOOOeQpOOOvO!bO'#CaOOOP'#Cx'#CxQVOqOOO!OQpO'#CfO!WQpO'#ClO!]QpO'#CrO!bQpO'#CsOOQO'#Cv'#CvQ!gQpOOQ!lQpOOQ!qQpOOOOOV,58{,58{O!vOpO,58{OOOP-E6v-E6vO!{QpO,59QO#TQpO,59QOOQO,59W,59WO#YQpO,59^OOQO,59_,59_O#_QpOOO#_QpOOO#gQpOOOOOV1G.g1G.gO#oQpO'#CyO#tQpO1G.lOOQO1G.l1G.lO#|QpO1G.lOOQO1G.x1G.xO$UO`O'#DUO$ZOWO'#DUOOQO'#Co'#CoQOQpOOOOQO'#Cu'#CuO$`OtO'#CwO$qOrO'#CwOOQO,59e,59eOOQO-E6w-E6wOOQO7+$W7+$WO%SQpO7+$WO%[QpO7+$WOOOO'#Cp'#CpO%aOpO,59pOOOO'#Cq'#CqO%fOpO,59pOOOS'#Cz'#CzO%kOtO,59cOOQO,59c,59cOOOQ'#C{'#C{O%|OrO,59cO&_QpO<<GrOOQO<<Gr<<GrOOQO1G/[1G/[OOOS-E6x-E6xOOQO1G.}1G.}OOOQ-E6y-E6yOOQOAN=^AN=^",
    stateData: "&d~OvOS~OPROSQOVROWRO~OZTO[XO^VOaUOhWO~OR]OU^O~O[`O^aO~O[bO~O[cO~O[dO~ObeO~ObfO~ObgO~ORhO~O]kOwiO~O[lO~O_mO~OynOzoO~OysOztO~O[uO~O]wOwiO~O_yOwiO~OtzO~Os|O~OSQOV!OOW!OOr!OOy!QO~OSQOV!ROW!ROq!ROz!QO~O_!TOwiO~O]!UO~Oy!VO~Oz!VO~OSQOV!OOW!OOr!OOy!XO~OSQOV!ROW!ROq!ROz!XO~O]!ZO~O",
    goto: "#dyPPPPPzPPPP!WPPPPP!WPP!Z!^!a!d!dP!g!j!m!p!v#Q#WPPPPPPPP#^SROSS!Os!PT!Rt!SRYPRqeR{nR}oRZPRqfR[PRqgQSOR_SQj`SvjxRxlQ!PsR!W!PQ!StR!Y!SQpeRrf",
    nodeNames: "\u26A0 Text Content }} {{ Interpolation InterpolationContent Entity InvalidEntity Attribute BoundAttributeName [ Identifier ] ( ) ReferenceName # Is ExpressionAttributeValue AttributeInterpolation AttributeInterpolation EventName DirectiveName * StatementAttributeValue AttributeName AttributeValue",
    maxTerm: 42,
    nodeProps: [
        [
            "openedBy",
            3,
            "{{",
            15,
            "("
        ],
        [
            "closedBy",
            4,
            "}}",
            14,
            ")"
        ],
        [
            "isolate",
            -4,
            5,
            19,
            25,
            27,
            ""
        ]
    ],
    skippedNodes: [
        0
    ],
    repeatNodeCount: 4,
    tokenData: "0r~RyOX#rXY$mYZ$mZ]#r]^$m^p#rpq$mqr#rrs%jst&Qtv#rvw&hwx)zxy*byz*xz{+`{}#r}!O+v!O!P-]!P!Q#r!Q![+v![!]+v!]!_#r!_!`-s!`!c#r!c!}+v!}#O.Z#O#P#r#P#Q.q#Q#R#r#R#S+v#S#T#r#T#o+v#o#p/X#p#q#r#q#r0Z#r%W#r%W;'S+v;'S;:j-V;:j;=`$g<%lO+vQ#wTUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rQ$ZSO#q#r#r;'S#r;'S;=`$g<%lO#rQ$jP;=`<%l#rR$t[UQvPOX#rXY$mYZ$mZ]#r]^$m^p#rpq$mq#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR%qTyPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR&XTaPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR&oXUQWPOp'[pq#rq!]'[!]!^#r!^#q'[#q#r(d#r;'S'[;'S;=`)t<%lO'[R'aXUQOp'[pq#rq!]'[!]!^'|!^#q'[#q#r(d#r;'S'[;'S;=`)t<%lO'[R(TTVPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR(gXOp'[pq#rq!]'[!]!^'|!^#q'[#q#r)S#r;'S'[;'S;=`)t<%lO'[P)VUOp)Sq!])S!]!^)i!^;'S)S;'S;=`)n<%lO)SP)nOVPP)qP;=`<%l)SR)wP;=`<%l'[R*RTzPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR*iT^PUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR+PT_PUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR+gThPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR+}b[PUQO}#r}!O+v!O!Q#r!Q![+v![!]+v!]!c#r!c!}+v!}#R#r#R#S+v#S#T#r#T#o+v#o#q#r#q#r$W#r%W#r%W;'S+v;'S;:j-V;:j;=`$g<%lO+vR-YP;=`<%l+vR-dTwPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR-zTUQbPO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR.bTZPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR.xT]PUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR/^VUQO#o#r#o#p/s#p#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#rR/zTSPUQO#q#r#q#r$W#r;'S#r;'S;=`$g<%lO#r~0^TO#q#r#q#r0m#r;'S#r;'S;=`$g<%lO#r~0rOR~",
    tokenizers: [
        text,
        attrSingle,
        attrDouble,
        scriptAttrSingle,
        scriptAttrDouble,
        0,
        1
    ],
    topRules: {
        "Content": [
            0,
            2
        ],
        "Attribute": [
            1,
            9
        ]
    },
    tokenPrec: 0
});
const exprParser = /*@__PURE__*/ (0, _langJavascript.javascriptLanguage).parser.configure({
    top: "SingleExpression"
});
const baseParser = /*@__PURE__*/ parser.configure({
    props: [
        /*@__PURE__*/ (0, _highlight.styleTags)({
            Text: (0, _highlight.tags).content,
            Is: (0, _highlight.tags).definitionOperator,
            AttributeName: (0, _highlight.tags).attributeName,
            "AttributeValue ExpressionAttributeValue StatementAttributeValue": (0, _highlight.tags).attributeValue,
            Entity: (0, _highlight.tags).character,
            InvalidEntity: (0, _highlight.tags).invalid,
            "BoundAttributeName/Identifier": (0, _highlight.tags).attributeName,
            "EventName/Identifier": /*@__PURE__*/ (0, _highlight.tags).special((0, _highlight.tags).attributeName),
            "ReferenceName/Identifier": (0, _highlight.tags).variableName,
            "DirectiveName/Identifier": (0, _highlight.tags).keyword,
            "{{ }}": (0, _highlight.tags).brace,
            "( )": (0, _highlight.tags).paren,
            "[ ]": (0, _highlight.tags).bracket,
            "# '*'": (0, _highlight.tags).punctuation
        })
    ]
});
const exprMixed = {
    parser: exprParser
}, statementMixed = {
    parser: (0, _langJavascript.javascriptLanguage).parser
};
const textParser = /*@__PURE__*/ baseParser.configure({
    wrap: /*@__PURE__*/ (0, _common.parseMixed)((node, input)=>node.name == "InterpolationContent" ? exprMixed : null)
});
const attrParser = /*@__PURE__*/ baseParser.configure({
    wrap: /*@__PURE__*/ (0, _common.parseMixed)((node, input)=>{
        var _a;
        return node.name == "InterpolationContent" ? exprMixed : node.name != "AttributeInterpolation" ? null : ((_a = node.node.parent) === null || _a === void 0 ? void 0 : _a.name) == "StatementAttributeValue" ? statementMixed : exprMixed;
    }),
    top: "Attribute"
});
const textMixed = {
    parser: textParser
}, attrMixed = {
    parser: attrParser
};
const baseHTML = /*@__PURE__*/ (0, _langHtml.html)({
    selfClosingTags: true
});
function mkAngular(language) {
    return language.configure({
        wrap: (0, _common.parseMixed)(mixAngular)
    }, "angular");
}
/**
A language provider for Angular Templates.
*/ const angularLanguage = /*@__PURE__*/ mkAngular(baseHTML.language);
function mixAngular(node, input) {
    switch(node.name){
        case "Attribute":
            return /^[*#(\[]|\{\{/.test(input.read(node.from, node.to)) ? attrMixed : null;
        case "Text":
            return textMixed;
    }
    return null;
}
/**
Angular Template language support.
*/ function angular(config = {}) {
    let base = baseHTML;
    if (config.base) {
        if (config.base.language.name != "html" || !(config.base.language instanceof (0, _language.LRLanguage))) throw new RangeError("The base option must be the result of calling html(...)");
        base = config.base;
    }
    return new (0, _language.LanguageSupport)(base.language == baseHTML.language ? angularLanguage : mkAngular(base.language), [
        base.support,
        base.language.data.of({
            closeBrackets: {
                brackets: [
                    "[",
                    "{",
                    '"'
                ]
            },
            indentOnInput: /^\s*[\}\]]$/
        })
    ]);
}

},{"@codemirror/language":"dx7XI","@codemirror/lang-html":"5njbQ","@codemirror/lang-javascript":"3QU1O","@lezer/highlight":"5AwBv","@lezer/common":"6f22T","@lezer/lr":"hqnf3","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["3cO0W"], null, "parcelRequire10c2", {})

//# sourceMappingURL=dist.bb3af017.js.map
