var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var XHRPanelClient = (function (_super) {
        __extends(XHRPanelClient, _super);
        function XHRPanelClient() {
            _super.call(this, "xhrPanel");
            this.hooked = false;
            this.cache = [];
            this._id = "XHRPANEL";
            this._ready = false;
        }
        XHRPanelClient.prototype.refresh = function () {
            this.sendStateToDashboard();
            this.sendCacheToDashboard();
        };
        XHRPanelClient.prototype.sendStateToDashboard = function () {
            this.sendCommandToDashboard('state', { hooked: this.hooked });
        };
        XHRPanelClient.prototype.sendCacheToDashboard = function () {
            for (var i = 0, l = this.cache.length; i < l; i++) {
                this.sendCommandToDashboard('xhr', this.cache[i]);
            }
        };
        XHRPanelClient.prototype.clearClientCache = function () {
            this.cache = [];
        };
        // This code will run on the client //////////////////////
        XHRPanelClient.prototype.startClientSide = function () {
            //this.setupXMLHttpRequestHook();
        };
        XHRPanelClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
        };
        XHRPanelClient.prototype.setupXMLHttpRequestHook = function () {
            var that = this;
            var w = window;
            w.___XMLHttpRequest = w.XMLHttpRequest;
            var XmlHttpRequestProxy = function () {
                var xhr = new w.___XMLHttpRequest();
                var data = {
                    id: VORLON.Tools.CreateGUID(),
                    url: null,
                    status: null,
                    statusText: null,
                    method: null,
                    responseType: null,
                    responseHeaders: null,
                    requestHeaders: [],
                    readyState: 0,
                };
                that.cache.push(data);
                xhr.__open = xhr.open;
                xhr.__send = xhr.send;
                xhr.__setRequestHeader = xhr.setRequestHeader;
                //todo catch send to get posted data
                //see https://msdn.microsoft.com/en-us/library/hh772834(v=vs.85).aspx
                xhr.open = function () {
                    data.method = arguments[0];
                    data.url = arguments[1];
                    that.trace('request for ' + data.url);
                    that.sendCommandToDashboard('xhr', data);
                    xhr.__open.apply(xhr, arguments);
                    return xhr.__open.apply(xhr, arguments);
                };
                xhr.setRequestHeader = function () {
                    var header = {
                        name: arguments[0],
                        value: arguments[1]
                    };
                    data.requestHeaders.push(header);
                    return xhr.__setRequestHeader.apply(xhr, arguments);
                };
                xhr.addEventListener('readystatechange', function () {
                    data.readyState = xhr.readyState;
                    that.trace('STATE CHANGED ' + data.readyState);
                    if (data.readyState === 4) {
                        data.responseType = xhr.responseType;
                        data.status = xhr.status;
                        data.statusText = xhr.statusText;
                        if (xhr.getAllResponseHeaders)
                            data.responseHeaders = xhr.getAllResponseHeaders();
                        that.trace('LOADED !!!');
                    }
                    that.sendCommandToDashboard('xhr', data);
                });
                return xhr;
            };
            w.XMLHttpRequest = XmlHttpRequestProxy;
            this.hooked = true;
            this.sendStateToDashboard();
        };
        XHRPanelClient.prototype.removeXMLHttpRequestHook = function () {
            if (this.hooked) {
                this.trace('xhrPanel remove hook');
                var w = window;
                w.XMLHttpRequest = w.___XMLHttpRequest;
                this.hooked = false;
                this.sendStateToDashboard();
            }
        };
        XHRPanelClient.prototype._render = function (tagname, parentNode, classname, value) {
            var elt = document.createElement(tagname);
            elt.className = classname || '';
            if (value)
                elt.innerHTML = value;
            parentNode.appendChild(elt);
            return elt;
        };
        return XHRPanelClient;
    })(VORLON.ClientPlugin);
    VORLON.XHRPanelClient = XHRPanelClient;
    XHRPanelClient.prototype.ClientCommands = {
        start: function (data) {
            var plugin = this;
            plugin.setupXMLHttpRequestHook();
        },
        stop: function (data) {
            var plugin = this;
            plugin.removeXMLHttpRequestHook();
        },
        getState: function (data) {
            var plugin = this;
            plugin.sendStateToDashboard();
        },
        clear: function (data) {
            var plugin = this;
            plugin.clearClientCache();
        }
    };
    //Register the plugin with vorlon core
    VORLON.Core.RegisterClientPlugin(new XHRPanelClient());
})(VORLON || (VORLON = {}));
