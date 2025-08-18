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
})({"1YAAG":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 57516;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "648de74ba2c7d762";
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

},{}],"dy3Yz":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "closePercentBrace", ()=>closePercentBrace);
parcelHelpers.export(exports, "liquid", ()=>liquid);
parcelHelpers.export(exports, "liquidCompletionSource", ()=>liquidCompletionSource);
parcelHelpers.export(exports, "liquidLanguage", ()=>liquidLanguage);
var _language = require("@codemirror/language");
var _langHtml = require("@codemirror/lang-html");
var _highlight = require("@lezer/highlight");
var _common = require("@lezer/common");
var _lr = require("@lezer/lr");
var _state = require("@codemirror/state");
var _view = require("@codemirror/view");
// This file was generated by lezer-generator. You probably shouldn't edit it.
const interpolationStart = 1, tagStart = 2, endTagStart = 3, text = 180, endrawTagStart = 4, rawText = 181, endcommentTagStart = 5, commentText = 182, InlineComment = 6;
function wordChar(code) {
    return code >= 65 && code <= 90 || code >= 97 && code <= 122;
}
const base = /*@__PURE__*/ new (0, _lr.ExternalTokenizer)((input)=>{
    let start = input.pos;
    for(;;){
        let { next } = input;
        if (next < 0) break;
        if (next == 123 /* Ch.BraceL */ ) {
            let after = input.peek(1);
            if (after == 123 /* Ch.BraceL */ ) {
                if (input.pos > start) break;
                input.acceptToken(interpolationStart, 2);
                return;
            } else if (after == 37 /* Ch.Percent */ ) {
                if (input.pos > start) break;
                let scan = 2, size = 2;
                for(;;){
                    let next = input.peek(scan);
                    if (next == 32 /* Ch.Space */  || next == 10 /* Ch.Newline */ ) ++scan;
                    else if (next == 35 /* Ch.Hash */ ) {
                        ++scan;
                        for(;;){
                            let comment = input.peek(scan);
                            if (comment < 0 || comment == 10 /* Ch.Newline */ ) break;
                            scan++;
                        }
                    } else if (next == 45 /* Ch.Dash */  && size == 2) size = ++scan;
                    else {
                        let end = next == 101 /* Ch.e */  && input.peek(scan + 1) == 110 /* Ch.n */  && input.peek(scan + 2) == 100 /* Ch.d */ ;
                        input.acceptToken(end ? endTagStart : tagStart, size);
                        return;
                    }
                }
            }
        }
        input.advance();
        if (next == 10 /* Ch.Newline */ ) break;
    }
    if (input.pos > start) input.acceptToken(text);
});
function rawTokenizer(endTag, text, tagStart) {
    return new (0, _lr.ExternalTokenizer)((input)=>{
        let start = input.pos;
        for(;;){
            let { next } = input;
            if (next == 123 /* Ch.BraceL */  && input.peek(1) == 37 /* Ch.Percent */ ) {
                let scan = 2;
                for(;; scan++){
                    let ch = input.peek(scan);
                    if (ch != 32 /* Ch.Space */  && ch != 10 /* Ch.Newline */ ) break;
                }
                let word = "";
                for(;; scan++){
                    let next = input.peek(scan);
                    if (!wordChar(next)) break;
                    word += String.fromCharCode(next);
                }
                if (word == endTag) {
                    if (input.pos > start) break;
                    input.acceptToken(tagStart, 2);
                    break;
                }
            } else if (next < 0) break;
            input.advance();
            if (next == 10 /* Ch.Newline */ ) break;
        }
        if (input.pos > start) input.acceptToken(text);
    });
}
const comment = /*@__PURE__*/ rawTokenizer("endcomment", commentText, endcommentTagStart);
const raw = /*@__PURE__*/ rawTokenizer("endraw", rawText, endrawTagStart);
const inlineComment = /*@__PURE__*/ new (0, _lr.ExternalTokenizer)((input)=>{
    if (input.next != 35 /* Ch.Hash */ ) return;
    input.advance();
    for(;;){
        if (input.next == 10 /* Ch.Newline */  || input.next < 0) break;
        if ((input.next == 37 /* Ch.Percent */  || input.next == 125 /* Ch.BraceR */ ) && input.peek(1) == 125 /* Ch.BraceR */ ) break;
        input.advance();
    }
    input.acceptToken(InlineComment);
});
// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_identifier = {
    __proto__: null,
    contains: 32,
    or: 36,
    and: 36,
    true: 50,
    false: 50,
    empty: 52,
    forloop: 54,
    tablerowloop: 56,
    continue: 58,
    in: 128,
    with: 194,
    for: 196,
    as: 198,
    if: 234,
    endif: 238,
    unless: 244,
    endunless: 248,
    elsif: 252,
    else: 256,
    case: 262,
    endcase: 266,
    when: 270,
    endfor: 278,
    tablerow: 284,
    endtablerow: 288,
    break: 292,
    cycle: 298,
    echo: 302,
    render: 306,
    include: 312,
    assign: 316,
    capture: 322,
    endcapture: 326,
    increment: 330,
    decrement: 334
};
const spec_TagName = {
    __proto__: null,
    if: 82,
    endif: 86,
    elsif: 90,
    else: 94,
    unless: 100,
    endunless: 104,
    case: 110,
    endcase: 114,
    when: 118,
    for: 126,
    endfor: 136,
    tablerow: 142,
    endtablerow: 146,
    break: 150,
    continue: 154,
    cycle: 158,
    comment: 164,
    endcomment: 170,
    raw: 176,
    endraw: 182,
    echo: 186,
    render: 190,
    include: 202,
    assign: 206,
    capture: 212,
    endcapture: 216,
    increment: 220,
    decrement: 224,
    liquid: 228
};
const parser = /*@__PURE__*/ (0, _lr.LRParser).deserialize({
    version: 14,
    states: "HOQYOPOOOOOP'#F{'#F{OeOaO'#CdOsQhO'#CfO!bQxO'#DQO#{OPO'#DTO$ZOPO'#D^O$iOPO'#DcO$wOPO'#DkO%VOPO'#DsO%eOSO'#EOO%jOQO'#EUO%oOPO'#EhOOOP'#G`'#G`OOOP'#G]'#G]OOOP'#Fz'#FzQYOPOOOOOP-E9y-E9yOOQW'#Cg'#CgO&`Q!jO,59QO&gQ!jO'#G^OsQhO'#CsOOQW'#G^'#G^OOOP,59l,59lO)PQhO,59lOsQhO,59pOsQhO,59tO)ZQhO,59vOsQhO,59yOsQhO,5:OOsQhO,5:SO!]QhO,5:WO!]QhO,5:`O)`QhO,5:dO)eQhO,5:fO)jQhO,5:hO)oQhO,5:kO)tQhO,5:qOsQhO,5:vOsQhO,5:xOsQhO,5;OOsQhO,5;QOsQhO,5;TOsQhO,5;XOsQhO,5;ZO+TQhO,5;]O+[OPO'#CdOOOP,59o,59oO#{OPO,59oO+jQxO'#DWOOOP,59x,59xO$ZOPO,59xO+oQxO'#DaOOOP,59},59}O$iOPO,59}O+tQxO'#DfOOOP,5:V,5:VO$wOPO,5:VO+yQxO'#DqOOOP,5:_,5:_O%VOPO,5:_O,OQxO'#DvOOOS'#GQ'#GQO,TOSO'#ERO,]OSO,5:jOOOQ'#GR'#GRO,bOQO'#EXO,jOQO,5:pOOOP,5;S,5;SO%oOPO,5;SO,oQxO'#EkOOOP-E9x-E9xO,tQ#|O,59SOsQhO,59VOsQhO,59VO,yQhO'#C|OOQW'#F|'#F|O-OQhO1G.lOOOP1G.l1G.lOsQhO,59VOsQhO,59ZO-WQ!jO,59_O-iQ!jO1G/WO-pQhO1G/WOOOP1G/W1G/WO-xQ!jO1G/[O.ZQ!jO1G/`OOOP1G/b1G/bO.lQ!jO1G/eO.}Q!jO1G/jO/qQ!jO1G/nO/xQhO1G/rO/}QhO1G/zOOOP1G0O1G0OOOOP1G0Q1G0QO0SQhO1G0SOOOS1G0V1G0VOOOQ1G0]1G0]O0_Q!jO1G0bO0fQ!jO1G0dO1QQ!jO1G0jO1cQ!jO1G0lO1jQ!jO1G0oO1{Q!jO1G0sO2^Q!jO1G0uO2oQhO'#EsO2vQhO'#ExO2}QhO'#FRO3UQhO'#FYO3]QhO'#F^O3dQhO'#FqOOQW'#Ga'#GaOOQW'#GT'#GTO3kQhO1G0wOsQhO'#EtOsQhO'#EyOsQhO'#E}OOQW'#FP'#FPOsQhO'#FSOsQhO'#FWO!]QhO'#FZO!]QhO'#F_OOQW'#Fc'#FcOOQW'#Fe'#FeO3rQhO'#FfOsQhO'#FhOsQhO'#FjOsQhO'#FmOsQhO'#FoOsQhO'#FrOsQhO'#FvOsQhO'#FxOOOP1G0w1G0wOOOP1G/Z1G/ZO3wQhO,59rOOOP1G/d1G/dO3|QhO,59{OOOP1G/i1G/iO4RQhO,5:QOOOP1G/q1G/qO4WQhO,5:]OOOP1G/y1G/yO4]QhO,5:bOOOS-E:O-E:OOOOP1G0U1G0UO4bQxO'#ESOOOQ-E:P-E:POOOP1G0[1G0[O4gQxO'#EYOOOP1G0n1G0nO4lQhO,5;VOOQW1G.n1G.nOOQW1G.q1G.qO7QQ!jO1G.qOOQW'#DO'#DOO7[QhO,59hOOQW-E9z-E9zOOOP7+$W7+$WO9UQ!jO1G.qO9`Q!jO1G.uOsQhO1G.yO;uQhO7+$rOOOP7+$r7+$rOOOP7+$v7+$vOOOP7+$z7+$zOOOP7+%P7+%POOOP7+%U7+%UOsQhO'#F}O;}QhO7+%YOOOP7+%Y7+%YOsQhO7+%^OsQhO7+%fO<VQhO'#GPO<[QhO7+%nOOOP7+%n7+%nO<dQhO7+%nO<iQhO7+%|OOOP7+%|7+%|O!]QhO'#E`OOQW'#GS'#GSO<qQhO7+&OOsQhO'#E`OOOP7+&O7+&OOOOP7+&U7+&UO=PQhO7+&WOOOP7+&W7+&WOOOP7+&Z7+&ZOOOP7+&_7+&_OOOP7+&a7+&aOOQW,5;_,5;_O2oQhO,5;_OOQW'#Ev'#EvOOQW,5;d,5;dO2vQhO,5;dOOQW'#E{'#E{OOQW,5;m,5;mO2}QhO,5;mOOQW'#FU'#FUOOQW,5;t,5;tO3UQhO,5;tOOQW'#F['#F[OOQW,5;x,5;xO3]QhO,5;xOOQW'#Fa'#FaOOQW,5<],5<]O3dQhO,5<]OOQW'#Ft'#FtOOQW-E:R-E:ROOOP7+&c7+&cO=XQ!jO,5;`O>rQ!jO,5;eO@]Q!jO,5;iOBYQ!jO,5;nOCsQ!jO,5;rOEfQhO,5;uOEkQhO,5;yOEpQhO,5<QOGgQ!jO,5<SOIYQ!jO,5<UOKYQ!jO,5<XOMVQ!jO,5<ZONxQ!jO,5<^O!!cQ!jO,5<bO!$`Q!jO,5<dOOOP1G/^1G/^OOOP1G/g1G/gOOOP1G/l1G/lOOOP1G/w1G/wOOOP1G/|1G/|O!&]QhO,5:nO!&bQhO,5:tOOOP1G0q1G0qOsQhO1G/SO!&gQ!jO7+$eOOOP<<H^<<H^O!&xQ!jO,5<iOOQW-E9{-E9{OOOP<<Ht<<HtO!)ZQ!jO<<HxO!)bQ!jO<<IQOOQW,5<k,5<kOOQW-E9}-E9}OOOP<<IY<<IYO!)iQhO<<IYOOOP<<Ih<<IhO!)qQhO,5:zOOQW-E:Q-E:QOOOP<<Ij<<IjO!)vQ!jO,5:zOOOP<<Ir<<IrOOQW1G0y1G0yOOQW1G1O1G1OOOQW1G1X1G1XOOQW1G1`1G1`OOQW1G1d1G1dOOQW1G1w1G1wO!*eQhO1G1^OsQhO1G1aOsQhO1G1eO!,XQhO1G1lO!-{QhO1G1lO!.QQhO1G1nO!]QhO'#FlOOQW'#GU'#GUO!/tQhO1G1pO!1hQhO1G1uOOOP1G0Y1G0YOOOP1G0`1G0`O!3[Q!jO7+$nOOQW<<HP<<HPOOQW'#Dp'#DpO!5_QhO'#DoOOQW'#GO'#GOO!6xQhOAN>dOOOPAN>dAN>dO!7QQhOAN>lOOOPAN>lAN>lO!7YQhOAN>tOOOPAN>tAN>tOsQhO1G0fO!]QhO1G0fO!7bQ!jO7+&{O!8qQ!jO7+'PO!:QQhO7+'WO!;tQhO,5<WOOQW-E:S-E:SOsQhO,5:ZOOQW-E9|-E9|OOOPG24OG24OOOOPG24WG24WOOOPG24`G24`O!;yQ!jO7+&QOOQW7+&Q7+&QO!<eQhO<<JgO!=uQhO<<JkO!?VQhO<<JrOsQhO1G1rO!@yQ!jO1G/uO!BmQ!jO7+'^",
    stateData: "!Dm~O%OOSUOS~OPROQSO$zPO~O$zPOPWXQWX$yWX~OfeOifOjfOkfOlfOmfOnfOofO%RbO~OuhOvgOyiO}jO!PkO!SlO!XmO!]nO!aoO!ipO!mqO!orO!qsO!ttO!zuO#PvO#RwO#XxO#ZyO#^zO#b{O#d|O#f}O~OPROQSOR!RO$zPO~OPROQSOR!UO$zPO~OPROQSOR!XO$zPO~OPROQSOR![O$zPO~OPROQSOR!_O$zPO~O$|!`O~O${!cO~OPROQSOR!hO$zPO~O]!jO`!qOa!kOb!lOq!mO~OX!pO~P%}Od!rOX%QX]%QX`%QXa%QXb%QXq%QXh%QXv%QX!^%QX#T%QX#U%QXm%QX#i%QX#k%QX#n%QX#r%QX#t%QX#w%QX#{%QX$S%QX$W%QX$Z%QX$]%QX$_%QX$b%QX$d%QX$g%QX$k%QX$m%QX#p%QX#y%QX$i%QXe%QX%R%QX#V%QX$P%QX$U%QX~Oq!mOv!vO~PsOv!yO~Ov#PO~Ov#QO~On#RO~Ov#SO~Ov#TO~Om#oO#U#lO#i#fO#n#gO#r#hO#t#iO#w#jO#{#kO$S#mO$W#nO$Z#pO$]#qO$_#rO$b#sO$d#tO$g#uO$k#vO$m#wO~Ov#xO~P)yO$zPOPWXQWXRWX~O{#zO~O!U#|O~O!Z$OO~O!f$QO~O!k$SO~O$|!`OT!uX~OT$VO~O${!cOS!{X~OS$YO~O#`$[O~O^$]O~O%R$`O~OX$cOq!mO~O]!jO`!qOa!kOb!lOh$fO~Ov$hO~P%}Oq!mOv$hO~O]!jO`!qOa!kOb!lOv$iO~O]!jO`!qOa!kOb!lOv$jO~O]!jO`!qOa!kOb!lOv$kO~O]!jO`!qOa!kOb!lOv$lO~O]!jO`!qOa!kOb!lO!^$mO~Ov$oO~P/`O!b$pO~O!b$qO~Os$uOv$tO!^$rO~Ov$wO~P%}O]!jO`!qOa!kOb!lOv$|O!^$xO#T${O#U${O~O]!jO`!qOa!kOb!lOv$}O~Ov%PO~P%}O]!jO`!qOa!kOb!lOv%QO~O]!jO`!qOa!kOb!lOv%RO~O]!jO`!qOa!kOb!lOv%SO~O#k%VO~P)yO#p%YO~P)yO#y%]O~P)yO$P%`O~P)yO$U%cO~P)yO$i%fO~P)yOv%hO~P)yOn%pO~Ov%xO~Ov%yO~Ov%zO~Ov%{O~Ov%|O~O!w%}O~O!}&OO~Ov&PO~Oa!kOX_i]_iq_ih_iv_i!^_i#T_i#U_im_i#i_i#k_i#n_i#r_i#t_i#w_i#{_i$S_i$W_i$Z_i$]_i$__i$b_i$d_i$g_i$k_i$m_i#p_i#y_i$i_ie_i%R_i#V_i$P_i$U_i~O`!qOb!lO~P4qOs&QOXpaqpavpampa#Upa#ipa#npa#rpa#tpa#wpa#{pa$Spa$Wpa$Zpa$]pa$_pa$bpa$dpa$gpa$kpa$mpa#kpa#ppa#ypa$Ppa$Upa$ipa~O`_ib_i~P4qO`!qOa!kOb!lOXci]ciqcihcivci!^ci#Tci#Ucimci#ici#kci#nci#rci#tci#wci#{ci$Sci$Wci$Zci$]ci$_ci$bci$dci$gci$kci$mci#pci#yci$icieci%Rci#Vci$Pci$Uci~Oq!mOv&SO~Ov&VO!^$mO~On&YO~Ov&[O!^$rO~On&]O~Oq!mOv&^O~Ov&aO!^$xO#T${O#U${O~Oq!mOv&cO~O]!jO`!qOa!kOb!lOm#ha#U#ha#i#ha#k#ha#n#ha#r#ha#t#ha#w#ha#{#ha$S#ha$W#ha$Z#ha$]#ha$_#ha$b#ha$d#ha$g#ha$k#ha$m#ha~O]!jO`!qOa!kOb!lOm#ma#U#ma#i#ma#n#ma#p#ma#r#ma#t#ma#w#ma#{#ma$S#ma$W#ma$Z#ma$]#ma$_#ma$b#ma$d#ma$g#ma$k#ma$m#ma~O]!jO`!qOa!kOb!lOm#qav#qa#U#qa#i#qa#n#qa#r#qa#t#qa#w#qa#{#qa$S#qa$W#qa$Z#qa$]#qa$_#qa$b#qa$d#qa$g#qa$k#qa$m#qa#k#qa#p#qa#y#qa$P#qa$U#qa$i#qa~O]!jO`!qOa!kOb!lOm#va#U#va#i#va#n#va#r#va#t#va#w#va#y#va#{#va$S#va$W#va$Z#va$]#va$_#va$b#va$d#va$g#va$k#va$m#va~Om#zav#za#U#za#i#za#n#za#r#za#t#za#w#za#{#za$S#za$W#za$Z#za$]#za$_#za$b#za$d#za$g#za$k#za$m#za#k#za#p#za#y#za$P#za$U#za$i#za~P/`O!b&kO~O!b&lO~Os&nO!^$rOm$Yav$Ya#U$Ya#i$Ya#n$Ya#r$Ya#t$Ya#w$Ya#{$Ya$S$Ya$W$Ya$Z$Ya$]$Ya$_$Ya$b$Ya$d$Ya$g$Ya$k$Ya$m$Ya#k$Ya#p$Ya#y$Ya$P$Ya$U$Ya$i$Ya~Om$[av$[a#U$[a#i$[a#n$[a#r$[a#t$[a#w$[a#{$[a$S$[a$W$[a$Z$[a$]$[a$_$[a$b$[a$d$[a$g$[a$k$[a$m$[a#k$[a#p$[a#y$[a$P$[a$U$[a$i$[a~P%}O]!jO`!qOa!kOb!lO!^&pOm$^av$^a#U$^a#i$^a#n$^a#r$^a#t$^a#w$^a#{$^a$S$^a$W$^a$Z$^a$]$^a$_$^a$b$^a$d$^a$g$^a$k$^a$m$^a#k$^a#p$^a#y$^a$P$^a$U$^a$i$^a~O]!jO`!qOa!kOb!lOm$aav$aa#U$aa#i$aa#n$aa#r$aa#t$aa#w$aa#{$aa$S$aa$W$aa$Z$aa$]$aa$_$aa$b$aa$d$aa$g$aa$k$aa$m$aa#k$aa#p$aa#y$aa$P$aa$U$aa$i$aa~Om$cav$ca#U$ca#i$ca#n$ca#r$ca#t$ca#w$ca#{$ca$S$ca$W$ca$Z$ca$]$ca$_$ca$b$ca$d$ca$g$ca$k$ca$m$ca#k$ca#p$ca#y$ca$P$ca$U$ca$i$ca~P%}O]!jO`!qOa!kOb!lOm$fa#U$fa#i$fa#n$fa#r$fa#t$fa#w$fa#{$fa$S$fa$W$fa$Z$fa$]$fa$_$fa$b$fa$d$fa$g$fa$i$fa$k$fa$m$fa~O]!jO`!qOa!kOb!lOm$jav$ja#U$ja#i$ja#n$ja#r$ja#t$ja#w$ja#{$ja$S$ja$W$ja$Z$ja$]$ja$_$ja$b$ja$d$ja$g$ja$k$ja$m$ja#k$ja#p$ja#y$ja$P$ja$U$ja$i$ja~O]!jO`!qOa!kOb!lOm$lav$la#U$la#i$la#n$la#r$la#t$la#w$la#{$la$S$la$W$la$Z$la$]$la$_$la$b$la$d$la$g$la$k$la$m$la#k$la#p$la#y$la$P$la$U$la$i$la~Ov&tO~Ov&uO~O]!jO`!qOa!kOb!lOe&wO~O]!jO`!qOa!kOb!lOv$qa!^$qam$qa#U$qa#i$qa#n$qa#r$qa#t$qa#w$qa#{$qa$S$qa$W$qa$Z$qa$]$qa$_$qa$b$qa$d$qa$g$qa$k$qa$m$qa#k$qa#p$qa#y$qa$P$qa$U$qa$i$qa~O]!jO`!qOa!kOb!lO%R&xO~Ov&|O~P!(xOv'OO~P!(xOv'QO!^$rO~Os'RO~O]!jO`!qOa!kOb!lO#V'SOv#Sa!^#Sa#T#Sa#U#Sa~O!^$mOm#ziv#zi#U#zi#i#zi#n#zi#r#zi#t#zi#w#zi#{#zi$S#zi$W#zi$Z#zi$]#zi$_#zi$b#zi$d#zi$g#zi$k#zi$m#zi#k#zi#p#zi#y#zi$P#zi$U#zi$i#zi~O!^$rOm$Yiv$Yi#U$Yi#i$Yi#n$Yi#r$Yi#t$Yi#w$Yi#{$Yi$S$Yi$W$Yi$Z$Yi$]$Yi$_$Yi$b$Yi$d$Yi$g$Yi$k$Yi$m$Yi#k$Yi#p$Yi#y$Yi$P$Yi$U$Yi$i$Yi~On'VO~Oq!mOm$[iv$[i#U$[i#i$[i#n$[i#r$[i#t$[i#w$[i#{$[i$S$[i$W$[i$Z$[i$]$[i$_$[i$b$[i$d$[i$g$[i$k$[i$m$[i#k$[i#p$[i#y$[i$P$[i$U$[i$i$[i~O!^&pOm$^iv$^i#U$^i#i$^i#n$^i#r$^i#t$^i#w$^i#{$^i$S$^i$W$^i$Z$^i$]$^i$_$^i$b$^i$d$^i$g$^i$k$^i$m$^i#k$^i#p$^i#y$^i$P$^i$U$^i$i$^i~Oq!mOm$civ$ci#U$ci#i$ci#n$ci#r$ci#t$ci#w$ci#{$ci$S$ci$W$ci$Z$ci$]$ci$_$ci$b$ci$d$ci$g$ci$k$ci$m$ci#k$ci#p$ci#y$ci$P$ci$U$ci$i$ci~O]!jO`!qOa!kOb!lOXpqqpqvpqmpq#Upq#ipq#npq#rpq#tpq#wpq#{pq$Spq$Wpq$Zpq$]pq$_pq$bpq$dpq$gpq$kpq$mpq#kpq#ppq#ypq$Ppq$Upq$ipq~Os'YOv!cX%R!cXm!cX#U!cX#i!cX#n!cX#r!cX#t!cX#w!cX#{!cX$P!cX$S!cX$W!cX$Z!cX$]!cX$_!cX$b!cX$d!cX$g!cX$k!cX$m!cX$U!cX~Ov'[O%R&xO~Ov']O%R&xO~Ov'^O!^$rO~Om#}q#U#}q#i#}q#n#}q#r#}q#t#}q#w#}q#{#}q$P#}q$S#}q$W#}q$Z#}q$]#}q$_#}q$b#}q$d#}q$g#}q$k#}q$m#}q~P!(xOm$Rq#U$Rq#i$Rq#n$Rq#r$Rq#t$Rq#w$Rq#{$Rq$S$Rq$U$Rq$W$Rq$Z$Rq$]$Rq$_$Rq$b$Rq$d$Rq$g$Rq$k$Rq$m$Rq~P!(xO!^$rOm$Yqv$Yq#U$Yq#i$Yq#n$Yq#r$Yq#t$Yq#w$Yq#{$Yq$S$Yq$W$Yq$Z$Yq$]$Yq$_$Yq$b$Yq$d$Yq$g$Yq$k$Yq$m$Yq#k$Yq#p$Yq#y$Yq$P$Yq$U$Yq$i$Yq~Os'dO~O]!jO`!qOa!kOb!lOv#Sq!^#Sq#T#Sq#U#Sq~O%R&xOm#}y#U#}y#i#}y#n#}y#r#}y#t#}y#w#}y#{#}y$P#}y$S#}y$W#}y$Z#}y$]#}y$_#}y$b#}y$d#}y$g#}y$k#}y$m#}y~O%R&xOm$Ry#U$Ry#i$Ry#n$Ry#r$Ry#t$Ry#w$Ry#{$Ry$S$Ry$U$Ry$W$Ry$Z$Ry$]$Ry$_$Ry$b$Ry$d$Ry$g$Ry$k$Ry$m$Ry~O!^$rOm$Yyv$Yy#U$Yy#i$Yy#n$Yy#r$Yy#t$Yy#w$Yy#{$Yy$S$Yy$W$Yy$Z$Yy$]$Yy$_$Yy$b$Yy$d$Yy$g$Yy$k$Yy$m$Yy#k$Yy#p$Yy#y$Yy$P$Yy$U$Yy$i$Yy~O]!jO`!qOa!kOb!lOv!ci%R!cim!ci#U!ci#i!ci#n!ci#r!ci#t!ci#w!ci#{!ci$P!ci$S!ci$W!ci$Z!ci$]!ci$_!ci$b!ci$d!ci$g!ci$k!ci$m!ci$U!ci~O]!jO`!qOa!kOb!lOm$`qv$`q!^$`q#U$`q#i$`q#n$`q#r$`q#t$`q#w$`q#{$`q$S$`q$W$`q$Z$`q$]$`q$_$`q$b$`q$d$`q$g$`q$k$`q$m$`q#k$`q#p$`q#y$`q$P$`q$U$`q$i$`q~O",
    goto: "7o%UPPPPPPPP%VP%V%g&zPP&zPPP&zPPP&zPPPPPPPP'xP(YP(]PP(](mP(}P(]P(]P(])TP)eP(])kP){P(]PP(]*RPP*c*m*wP(]*}P+_P(]P(]P(]P(]+eP+u+xP(]+{P,],`P(]P(]P,cPPP(]P(]P(],gP,wP(]P(]P(]P,}-_P-oP,}-uP.VP,}P,}P,}.]P.mP,}P,}.s/TP,}/ZP/kP,}P,},}P,}P,}P/q,}P,}P,}/uP0VP,}P,}P0]0{1c2R2]2o3R3X3_3e4TPPPPPP4Z4kP%V7_m^OTUVWX[`!Q!T!W!Z!^!g!vdRehijlmnvwxyz{|!k!l!q!r#f#g#h#j#k#q#r#s#t#u#v#w$f$m$p$q${&Q&k&l'R'Y'dQ!}oQ#OpQ%n#lQ%o#mQ&_$xQ'W&pR'`'S!wfRehijlmnvwxyz{|!k!l!q!r#f#g#h#j#k#q#r#s#t#u#v#w$f$m$p$q${&Q&k&l'R'Y'dm!nch!o!t!u#U#X$g$v%O%q%t&o&sR$a!mm]OTUVWX[`!Q!T!W!Z!^!gmTOTUVWX[`!Q!T!W!Z!^!gQ!PTR#y!QmUOTUVWX[`!Q!T!W!Z!^!gQ!SUR#{!TmVOTUVWX[`!Q!T!W!Z!^!gQ!VVR#}!WmWOTUVWX[`!Q!T!W!Z!^!ga&z&W&X&{&}'T'U'a'ba&y&W&X&{&}'T'U'a'bQ!YWR$P!ZmXOTUVWX[`!Q!T!W!Z!^!gQ!]XR$R!^mYOTUVWX[`!Q!T!W!Z!^!gR!bYR$U!bmZOTUVWX[`!Q!T!W!Z!^!gR!eZR$X!eT$y#V$zm[OTUVWX[`!Q!T!W!Z!^!gQ!f[R$Z!gm#c}#]#^#_#`#a#b#e%U%X%[%_%b%em#]}#]#^#_#`#a#b#e%U%X%[%_%b%eQ%T#]R&d%Um#^}#]#^#_#`#a#b#e%U%X%[%_%b%eQ%W#^R&e%Xm#_}#]#^#_#`#a#b#e%U%X%[%_%b%eQ%Z#_R&f%[m#`}#]#^#_#`#a#b#e%U%X%[%_%b%eQ%^#`R&g%_m#a}#]#^#_#`#a#b#e%U%X%[%_%b%eQ%a#aR&h%bT&q%r&rm#b}#]#^#_#`#a#b#e%U%X%[%_%b%eQ%d#bR&i%eQ`OQ!QTQ!TUQ!WVQ!ZWQ!^XQ!g[_!i`!Q!T!W!Z!^!gSQO`SaQ!Oi!OTUVWX[!Q!T!W!Z!^!gQ!ocQ!uh^$b!o!u$g$v%O&o&sQ$g!tQ$v#UQ%O#XQ&o%qR&s%tQ$n!|S&U$n&jR&j%mQ&{&WQ&}&XW'Z&{&}'a'bQ'a'TR'b'UQ$s#RW&Z$s&m'P'cQ&m%pQ'P&]R'c'VQ!aYR$T!aQ!dZR$W!dQ$z#VR&`$zQ#e}Q%U#]Q%X#^Q%[#_Q%_#`Q%b#aQ%e#b_%g#e%U%X%[%_%b%eQ&r%rR'X&rm_OTUVWX[`!Q!T!W!Z!^!gQcRQ!seQ!thQ!wiQ!xjQ!zlQ!{mQ!|nQ#UvQ#VwQ#WxQ#XyQ#YzQ#Z{Q#[|Q$^!kQ$_!lQ$d!qQ$e!rQ%i#fQ%j#gQ%k#hQ%l#jQ%m#kQ%q#qQ%r#rQ%s#sQ%t#tQ%u#uQ%v#vQ%w#wQ&R$fQ&T$mQ&W$pQ&X$qQ&b${Q&v&QQ'T&kQ'U&lQ'_'RQ'e'YR'f'dm#d}#]#^#_#`#a#b#e%U%X%[%_%b%e",
    nodeNames: "\u26A0 {{ {% {% {% {% InlineComment Template Text }} Interpolation VariableName MemberExpression . PropertyName BinaryExpression contains CompareOp LogicOp AssignmentExpression AssignOp ) ( RangeExpression .. BooleanLiteral empty forloop tablerowloop continue StringLiteral NumberLiteral Filter | FilterName : Tag TagName %} IfDirective Tag if EndTag endif Tag elsif Tag else UnlessDirective Tag unless EndTag endunless CaseDirective Tag case EndTag endcase Tag when , ForDirective Tag for in Parameter ParameterName EndTag endfor TableDirective Tag tablerow EndTag endtablerow Tag break Tag continue Tag cycle Comment Tag comment CommentText EndTag endcomment RawDirective Tag raw RawText EndTag endraw Tag echo Tag render RenderParameter with for as Tag include Tag assign CaptureDirective Tag capture EndTag endcapture Tag increment Tag decrement Tag liquid IfDirective Tag if EndTag endif UnlessDirective Tag unless EndTag endunless Tag elsif Tag else CaseDirective Tag case EndTag endcase Tag when ForDirective Tag EndTag endfor TableDirective Tag tablerow EndTag endtablerow Tag break Tag Tag cycle Tag echo Tag render RenderParameter Tag include Tag assign CaptureDirective Tag capture EndTag endcapture Tag increment Tag decrement",
    maxTerm: 189,
    nodeProps: [
        [
            "closedBy",
            1,
            "}}",
            -4,
            2,
            3,
            4,
            5,
            "%}",
            22,
            ")"
        ],
        [
            "openedBy",
            9,
            "{{",
            21,
            "(",
            38,
            "{%"
        ],
        [
            "group",
            -12,
            11,
            12,
            15,
            19,
            23,
            25,
            26,
            27,
            28,
            29,
            30,
            31,
            "Expression"
        ]
    ],
    skippedNodes: [
        0,
        6
    ],
    repeatNodeCount: 11,
    tokenData: ")Q~RkXY!vYZ!v]^!vpq!vqr#Xrs#duv$Uwx$axy$|yz%R{|%W|}&r}!O&w!O!P'T!Q![&a![!]'e!^!_'j!_!`'r!`!a'j!c!}'z#R#S'z#T#o'z#p#q(p#q#r(u%W;'S'z;'S;:j(j<%lO'z~!{S%O~XY!vYZ!v]^!vpq!v~#[P!_!`#_~#dOa~~#gUOY#dZr#drs#ys;'S#d;'S;=`$O<%lO#d~$OOn~~$RP;=`<%l#d~$XP#q#r$[~$aOv~~$dUOY$aZw$awx#yx;'S$a;'S;=`$v<%lO$a~$yP;=`<%l$a~%ROf~~%WOe~P%ZQ!O!P%a!Q![&aP%dP!Q![%gP%lRoP!Q![%g!g!h%u#X#Y%uP%xR{|&R}!O&R!Q![&XP&UP!Q![&XP&^PoP!Q![&XP&fSoP!O!P%a!Q![&a!g!h%u#X#Y%u~&wO!^~~&zRuv$U!O!P%a!Q![&a~'YQ]S!O!P'`!Q![%g~'eOh~~'jOs~~'oPa~!_!`#_~'wPd~!_!`#__(TV^WuQ%RT!Q!['z!c!}'z#R#S'z#T#o'z%W;'S'z;'S;:j(j<%lO'z_(mP;=`<%l'z~(uOq~~(xP#q#r({~)QOX~",
    tokenizers: [
        base,
        raw,
        comment,
        inlineComment,
        0,
        1,
        2,
        3
    ],
    topRules: {
        "Template": [
            0,
            7
        ]
    },
    specialized: [
        {
            term: 187,
            get: (value)=>spec_identifier[value] || -1
        },
        {
            term: 37,
            get: (value)=>spec_TagName[value] || -1
        }
    ],
    tokenPrec: 0
});
function completions(words, type) {
    return words.split(" ").map((label)=>({
            label,
            type
        }));
}
const Filters = /*@__PURE__*/ completions("abs append at_least at_most capitalize ceil compact concat date default divided_by downcase escape escape_once first floor join last lstrip map minus modulo newline_to_br plus prepend remove remove_first replace replace_first reverse round rstrip size slice sort sort_natural split strip strip_html strip_newlines sum times truncate truncatewords uniq upcase url_decode url_encode where", "function");
const Tags = /*@__PURE__*/ completions("cycle comment endcomment raw endraw echo increment decrement liquid if elsif else endif unless endunless case endcase for endfor tablerow endtablerow break continue assign capture endcapture render include", "keyword");
const Expressions = /*@__PURE__*/ completions("empty forloop tablerowloop in with as contains", "keyword");
const forloop = /*@__PURE__*/ completions("first index index0 last length rindex", "property");
const tablerowloop = /*@__PURE__*/ completions("col col0 col_first col_last first index index0 last length rindex rindex0 row", "property");
function findContext(context) {
    var _a;
    let { state, pos } = context;
    let node = (0, _language.syntaxTree)(state).resolveInner(pos, -1).enterUnfinishedNodesBefore(pos);
    let before = ((_a = node.childBefore(pos)) === null || _a === void 0 ? void 0 : _a.name) || node.name;
    if (node.name == "FilterName") return {
        type: "filter",
        node
    };
    if (context.explicit && before == "|") return {
        type: "filter"
    };
    if (node.name == "TagName") return {
        type: "tag",
        node
    };
    if (context.explicit && before == "{%") return {
        type: "tag"
    };
    if (node.name == "PropertyName" && node.parent.name == "MemberExpression") return {
        type: "property",
        node,
        target: node.parent
    };
    if (node.name == "." && node.parent.name == "MemberExpression") return {
        type: "property",
        target: node.parent
    };
    if (node.name == "MemberExpression" && before == ".") return {
        type: "property",
        target: node
    };
    if (node.name == "VariableName") return {
        type: "expression",
        from: node.from
    };
    let word = context.matchBefore(/[\w\u00c0-\uffff]+$/);
    if (word) return {
        type: "expression",
        from: word.from
    };
    if (context.explicit && node.name != "CommentText" && node.name != "StringLiteral" && node.name != "NumberLiteral" && node.name != "InlineComment") return {
        type: "expression"
    };
    return null;
}
function resolveProperties(state, node, context, properties) {
    let path = [];
    for(;;){
        let obj = node.getChild("Expression");
        if (!obj) return [];
        if (obj.name == "forloop") return path.length ? [] : forloop;
        else if (obj.name == "tablerowloop") return path.length ? [] : tablerowloop;
        else if (obj.name == "VariableName") {
            path.unshift(state.sliceDoc(obj.from, obj.to));
            break;
        } else if (obj.name == "MemberExpression") {
            let name = obj.getChild("PropertyName");
            if (name) path.unshift(state.sliceDoc(name.from, name.to));
            node = obj;
        } else return [];
    }
    return properties ? properties(path, state, context) : [];
}
/**
Returns a completion source for liquid templates. Optionally takes
a configuration that adds additional custom completions.
*/ function liquidCompletionSource(config = {}) {
    let filters = config.filters ? config.filters.concat(Filters) : Filters;
    let tags = config.tags ? config.tags.concat(Tags) : Tags;
    let exprs = config.variables ? config.variables.concat(Expressions) : Expressions;
    let { properties } = config;
    return (context)=>{
        var _a;
        let cx = findContext(context);
        if (!cx) return null;
        let from = (_a = cx.from) !== null && _a !== void 0 ? _a : cx.node ? cx.node.from : context.pos;
        let options;
        if (cx.type == "filter") options = filters;
        else if (cx.type == "tag") options = tags;
        else if (cx.type == "expression") options = exprs;
        else /* property */ options = resolveProperties(context.state, cx.target, context, properties);
        return options.length ? {
            options,
            from,
            validFor: /^[\w\u00c0-\uffff]*$/
        } : null;
    };
}
/**
This extension will, when the user types a `%` between two
matching braces, insert two percent signs instead and put the
cursor between them.
*/ const closePercentBrace = /*@__PURE__*/ (0, _view.EditorView).inputHandler.of((view, from, to, text)=>{
    if (text != "%" || from != to || view.state.doc.sliceString(from - 1, to + 1) != "{}") return false;
    view.dispatch(view.state.changeByRange((range)=>({
            changes: {
                from: range.from,
                to: range.to,
                insert: "%%"
            },
            range: (0, _state.EditorSelection).cursor(range.from + 1)
        })), {
        scrollIntoView: true,
        userEvent: "input.type"
    });
    return true;
});
function directiveIndent(except) {
    return (context)=>{
        let back = except.test(context.textAfter);
        return context.lineIndent(context.node.from) + (back ? 0 : context.unit);
    };
}
const tagLanguage = /*@__PURE__*/ (0, _language.LRLanguage).define({
    name: "liquid",
    parser: /*@__PURE__*/ parser.configure({
        props: [
            /*@__PURE__*/ (0, _highlight.styleTags)({
                "cycle comment endcomment raw endraw echo increment decrement liquid in with as": (0, _highlight.tags).keyword,
                "empty forloop tablerowloop": (0, _highlight.tags).atom,
                "if elsif else endif unless endunless case endcase for endfor tablerow endtablerow break continue": (0, _highlight.tags).controlKeyword,
                "assign capture endcapture": (0, _highlight.tags).definitionKeyword,
                "contains": (0, _highlight.tags).operatorKeyword,
                "render include": (0, _highlight.tags).moduleKeyword,
                VariableName: (0, _highlight.tags).variableName,
                TagName: (0, _highlight.tags).tagName,
                FilterName: /*@__PURE__*/ (0, _highlight.tags).function((0, _highlight.tags).variableName),
                PropertyName: (0, _highlight.tags).propertyName,
                CompareOp: (0, _highlight.tags).compareOperator,
                AssignOp: (0, _highlight.tags).definitionOperator,
                LogicOp: (0, _highlight.tags).logicOperator,
                NumberLiteral: (0, _highlight.tags).number,
                StringLiteral: (0, _highlight.tags).string,
                BooleanLiteral: (0, _highlight.tags).bool,
                InlineComment: (0, _highlight.tags).lineComment,
                CommentText: (0, _highlight.tags).blockComment,
                "{% %} {{ }}": (0, _highlight.tags).brace,
                "( )": (0, _highlight.tags).paren,
                ".": (0, _highlight.tags).derefOperator,
                ", .. : |": (0, _highlight.tags).punctuation
            }),
            /*@__PURE__*/ (0, _language.indentNodeProp).add({
                Tag: /*@__PURE__*/ (0, _language.delimitedIndent)({
                    closing: "%}"
                }),
                "UnlessDirective ForDirective TablerowDirective CaptureDirective": /*@__PURE__*/ directiveIndent(/^\s*(\{%-?\s*)?end\w/),
                IfDirective: /*@__PURE__*/ directiveIndent(/^\s*(\{%-?\s*)?(endif|else|elsif)\b/),
                CaseDirective: /*@__PURE__*/ directiveIndent(/^\s*(\{%-?\s*)?(endcase|when)\b/)
            }),
            /*@__PURE__*/ (0, _language.foldNodeProp).add({
                "UnlessDirective ForDirective TablerowDirective CaptureDirective IfDirective CaseDirective RawDirective Comment" (tree) {
                    let first = tree.firstChild, last = tree.lastChild;
                    if (!first || first.name != "Tag") return null;
                    return {
                        from: first.to,
                        to: last.name == "EndTag" ? last.from : tree.to
                    };
                }
            })
        ]
    }),
    languageData: {
        commentTokens: {
            line: "#"
        },
        indentOnInput: /^\s*{%-?\s*(?:end|elsif|else|when|)$/
    }
});
const baseHTML = /*@__PURE__*/ (0, _langHtml.html)();
function makeLiquid(base) {
    return tagLanguage.configure({
        wrap: (0, _common.parseMixed)((node)=>node.type.isTop ? {
                parser: base.parser,
                overlay: (n)=>n.name == "Text" || n.name == "RawText"
            } : null)
    }, "liquid");
}
/**
A language provider for Liquid templates.
*/ const liquidLanguage = /*@__PURE__*/ makeLiquid(baseHTML.language);
/**
Liquid template support.
*/ function liquid(config = {}) {
    let base = config.base || baseHTML;
    let lang = base.language == baseHTML.language ? liquidLanguage : makeLiquid(base.language);
    return new (0, _language.LanguageSupport)(lang, [
        base.support,
        lang.data.of({
            autocomplete: liquidCompletionSource(config)
        }),
        base.language.data.of({
            closeBrackets: {
                brackets: [
                    "{"
                ]
            }
        }),
        closePercentBrace
    ]);
}

},{"@codemirror/language":"dx7XI","@codemirror/lang-html":"5njbQ","@lezer/highlight":"5AwBv","@lezer/common":"6f22T","@lezer/lr":"hqnf3","@codemirror/state":"axaOu","@codemirror/view":"c2noD","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["1YAAG"], null, "parcelRequire10c2", {})

//# sourceMappingURL=dist.a2c7d762.js.map
