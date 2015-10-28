var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var WebStandardsClient = (function (_super) {
        __extends(WebStandardsClient, _super);
        function WebStandardsClient() {
            _super.call(this, "webstandards");
            this._currentAnalyze = {};
            this.browserDetectionHook = {
                userAgent: [],
                appVersion: [],
                appName: [],
                product: [],
                vendor: [],
            };
            this.exceptions = [
                "vorlon.max.js",
                "vorlon.min.js",
                "vorlon.js",
                "google-analytics.com"
            ];
            this._id = "WEBSTANDARDS";
            this._ready = true;
            //this.debug = true;            
        }
        WebStandardsClient.prototype.refresh = function () {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        };
        // Start the clientside code
        WebStandardsClient.prototype.startClientSide = function () {
            this.hook(window.navigator, "userAgent");
            this.hook(window.navigator, "appVersion");
            this.hook(window.navigator, "appName");
            this.hook(window.navigator, "product");
            this.hook(window.navigator, "vendor");
        };
        WebStandardsClient.prototype.hook = function (root, prop) {
            var _this = this;
            VORLON.Tools.HookProperty(root, prop, function (stack) {
                //this.trace("browser detection " + stack.file);
                //this.trace(stack.stack);
                if (stack.file) {
                    if (_this.exceptions.some(function (s) { return stack.file.indexOf(s) >= 0; })) {
                        //this.trace("skip browser detection access " + stack.file)
                        return;
                    }
                }
                _this.browserDetectionHook[prop].push(stack);
            });
        };
        WebStandardsClient.prototype.capitalizeFirstLetter = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        WebStandardsClient.prototype.startNewAnalyze = function (data) {
            var allHTML = document.documentElement.outerHTML;
            this.sendedHTML = allHTML;
            var node = document.doctype;
            if (node) {
                var doctypeHtml = "<!DOCTYPE "
                    + node.name
                    + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                    + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                    + (node.systemId ? ' "' + node.systemId + '"' : '')
                    + '>';
                this._doctype = {
                    html: doctypeHtml,
                    name: node.name,
                    publicId: node.publicId,
                    systemId: node.systemId
                };
            }
            var inlineStylesheets = document.querySelectorAll("style");
            var stylesheetErrors = null;
            if (data.analyzeCssFallback) {
                stylesheetErrors = {};
                if (inlineStylesheets.length) {
                    for (var x = 0; x < inlineStylesheets.length; x++) {
                        this.analyzeCssDocument("inline " + [x], inlineStylesheets[x].innerHTML, data.id, stylesheetErrors);
                    }
                }
            }
            this.sendCommandToDashboard("htmlContent", { html: allHTML, doctype: this._doctype, url: window.location, browserDetection: this.browserDetectionHook, id: data.id, stylesheetErrors: stylesheetErrors });
        };
        WebStandardsClient.prototype.checkIfNoPrefix = function (rules, prefix) {
            var present = false;
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf(prefix) === 0) {
                        present = true;
                        break;
                    }
                }
            if (!present) {
                present = this.checkIfMsPrefix(rules, prefix);
            }
            return present;
        };
        WebStandardsClient.prototype.checkIfMsPrefix = function (rules, prefix) {
            var present = false;
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf('-ms-' + prefix) === 0) {
                        present = true;
                        break;
                    }
                }
            return present;
        };
        WebStandardsClient.prototype.unprefixedPropertyName = function (property) {
            return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
        };
        WebStandardsClient.prototype.checkPrefix = function (rules) {
            var errorList = [];
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf('-webkit') === 0) {
                        var _unprefixedPropertyName = this.unprefixedPropertyName(rules[i].directive);
                        var good = this.checkIfNoPrefix(rules, _unprefixedPropertyName);
                        if (!good) {
                            var divTest = document.createElement('div');
                            divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] = rules[i].value;
                            if (divTest.style[_unprefixedPropertyName] == divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)]) {
                                good = true;
                            }
                        }
                        if (!good) {
                            errorList.push(rules[i].directive);
                        }
                    }
                }
            return errorList;
        };
        WebStandardsClient.prototype.analyzeCssDocument = function (url, content, id, results) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            // console.log("processing css " + url);
            for (var i = 0; i < parsed.length; i++) {
                var selector = parsed[i].selector;
                var rules = parsed[i].rules;
                var resultsList = this.checkPrefix(rules);
                if (resultsList.length > 0) {
                    if (!results[url])
                        results[url] = {};
                    if (!results[url][selector])
                        results[url][selector] = [];
                    for (var x = 0; x < resultsList.length; x++) {
                        results[url][selector].push(resultsList[x]);
                    }
                }
            }
        };
        WebStandardsClient.prototype.fetchDocument = function (data, localFetch) {
            var _this = this;
            if (localFetch === void 0) { localFetch = false; }
            var xhr = null;
            var completed = false;
            var timeoutRef = null;
            if (!data || !data.url) {
                this.trace("invalid fetch request");
                return;
            }
            var documentUrl = data.url;
            if (documentUrl.indexOf("//") === 0) {
                documentUrl = window.location.protocol + documentUrl;
            }
            documentUrl = this.getAbsolutePath(documentUrl);
            if (documentUrl.indexOf("http") === 0) {
                //external resources may not have Access Control headers, we make a proxied request to prevent CORS issues
                var serverurl = VORLON.Core._messenger._serverUrl;
                if (serverurl[serverurl.length - 1] !== '/')
                    serverurl = serverurl + "/";
                var target = this.getAbsolutePath(data.url);
                documentUrl = serverurl + "httpproxy/fetch?fetchurl=" + encodeURIComponent(target);
            }
            this.trace("fetching " + documentUrl);
            try {
                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            completed = true;
                            clearTimeout(timeoutRef);
                            var encoding = xhr.getResponseHeader("X-VorlonProxyEncoding") || xhr.getResponseHeader("content-encoding");
                            var contentLength = xhr.getResponseHeader("content-length");
                            _this.trace("encoding for " + data.url + " is " + encoding);
                            var stylesheetErrors = null;
                            if (data.type === "stylesheet" && data.analyzeCssFallback === true) {
                                stylesheetErrors = {};
                                _this.analyzeCssDocument(data.url, xhr.responseText, data.id, stylesheetErrors);
                            }
                            //TODO getting encoding is not working in IE (but do in Chrome), must try on other browsers because getting it may enable performance rules
                            _this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: xhr.status, content: xhr.responseText, contentLength: contentLength, encoding: encoding, stylesheetErrors: stylesheetErrors });
                        }
                        else {
                            completed = true;
                            clearTimeout(timeoutRef);
                            _this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: xhr.status, content: null, error: xhr.statusText });
                        }
                    }
                };
                xhr.open("GET", documentUrl, true);
                xhr.send(null);
                timeoutRef = setTimeout(function () {
                    if (!completed) {
                        completed = true;
                        _this.trace("fetch timeout for " + data.url);
                        xhr.abort();
                        _this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: null, content: null, error: "timeout" });
                    }
                }, 20 * 1000);
            }
            catch (e) {
                console.error(e);
                completed = true;
                clearTimeout(timeoutRef);
                this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: 0, content: null, error: e.message });
            }
        };
        WebStandardsClient.prototype.getAbsolutePath = function (url) {
            var a = document.createElement('a');
            a.href = url;
            return a.href;
        };
        return WebStandardsClient;
    })(VORLON.ClientPlugin);
    VORLON.WebStandardsClient = WebStandardsClient;
    WebStandardsClient.prototype.ClientCommands = {
        startNewAnalyze: function (data) {
            var plugin = this;
            plugin.startNewAnalyze(data);
        },
        fetchDocument: function (data) {
            var plugin = this;
            plugin.fetchDocument(data);
        }
    };
    //Register the plugin with vorlon core
    VORLON.Core.RegisterClientPlugin(new WebStandardsClient());
})(VORLON || (VORLON = {}));
