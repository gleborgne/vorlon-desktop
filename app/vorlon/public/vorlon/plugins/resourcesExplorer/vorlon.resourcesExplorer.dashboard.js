var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var ResourcesExplorerDashboard = (function (_super) {
        __extends(ResourcesExplorerDashboard, _super);
        function ResourcesExplorerDashboard() {
            _super.call(this, "resourcesExplorer", "control.html", "control.css");
            this._ready = false;
            this._id = "RESOURCES";
            //this.debug = true;
        }
        ResourcesExplorerDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._containerLocalStorage = VORLON.Tools.QuerySelectorById(div, "localStorageList");
                _this._containerSessionStorage = VORLON.Tools.QuerySelectorById(div, "sessionStorageList");
                _this._containerCookies = VORLON.Tools.QuerySelectorById(div, "cookiesList");
                _this._ready = true;
            });
        };
        ResourcesExplorerDashboard.prototype.processEntries = function (receivedObject) {
            if (!this._containerLocalStorage) {
                console.warn("ResourcesExplorer dashboard receive client message but is not ready");
                return;
            }
            this._containerLocalStorage.innerHTML = "";
            this._containerSessionStorage.innerHTML = "";
            this._containerCookies.innerHTML = "";
            if (!receivedObject)
                return;
            if (receivedObject.localStorageList) {
                for (var i = 0; i < receivedObject.localStorageList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');
                    tdKey.innerHTML = receivedObject.localStorageList[i].key;
                    tdValue.innerHTML = receivedObject.localStorageList[i].value;
                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerLocalStorage.appendChild(tr);
                }
            }
            if (receivedObject.sessionStorageList) {
                for (var i = 0; i < receivedObject.sessionStorageList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');
                    tdKey.innerHTML = receivedObject.sessionStorageList[i].key;
                    tdValue.innerHTML = receivedObject.sessionStorageList[i].value;
                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerSessionStorage.appendChild(tr);
                }
            }
            if (receivedObject.cookiesList) {
                for (var i = 0; i < receivedObject.cookiesList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');
                    tdKey.innerHTML = receivedObject.cookiesList[i].key;
                    tdValue.innerHTML = receivedObject.cookiesList[i].value;
                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerCookies.appendChild(tr);
                }
            }
        };
        return ResourcesExplorerDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.ResourcesExplorerDashboard = ResourcesExplorerDashboard;
    ResourcesExplorerDashboard.prototype.DashboardCommands = {
        resourceitems: function (data) {
            var plugin = this;
            plugin.processEntries(data);
        }
    };
    //Register the plugin with vorlon core 
    VORLON.Core.RegisterDashboardPlugin(new ResourcesExplorerDashboard());
})(VORLON || (VORLON = {}));
