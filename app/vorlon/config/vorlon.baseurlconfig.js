var fs = require("fs");
var path = require("path");
var VORLON;
(function (VORLON) {
    var BaseURLConfig = (function () {
        function BaseURLConfig() {
            var catalogdata = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
            var catalog = JSON.parse(catalogstring);
            if (catalog.baseURL != undefined) {
                this.baseURL = catalog.baseURL;
            }
            else {
                this.baseURL = "";
            }
            if (catalog.baseProxyURL != undefined) {
                this.baseProxyURL = catalog.baseProxyURL;
            }
            else {
                this.baseProxyURL = "";
            }
        }
        return BaseURLConfig;
    })();
    VORLON.BaseURLConfig = BaseURLConfig;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
