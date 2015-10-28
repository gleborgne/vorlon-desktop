var fs = require("fs");
var http = require("http");
var https = require("https");
var path = require("path");
var VORLON;
(function (VORLON) {
    var HttpConfig = (function () {
        function HttpConfig() {
            var catalogdata = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
            var catalog = JSON.parse(catalogstring);
            if (catalog.useSSL) {
                this.useSSL = true;
                this.protocol = "https";
                this.httpModule = https;
                this.options = {
                    key: fs.readFileSync(catalog.SSLkey),
                    cert: fs.readFileSync(catalog.SSLcert)
                };
            }
            else {
                this.useSSL = false;
                if (catalog.useSSLAzure) {
                    this.protocol = "https";
                    this.httpModule = http;
                }
                else {
                    this.protocol = "http";
                    this.httpModule = http;
                }
            }
            this.proxyEnvPort = catalog.proxyEnvPort;
            if (catalog.proxyEnvPort)
                this.proxyPort = process.env.PORT;
            else
                this.proxyPort = catalog.proxyPort || 5050;
            this.port = process.env.PORT || catalog.port || 1337;
            this.proxyPort = catalog.proxyPort || 5050;
            this.enableWebproxy = catalog.enableWebproxy || false;
            this.vorlonServerURL = catalog.vorlonServerURL || "";
            this.vorlonProxyURL = catalog.vorlonProxyURL || "";
        }
        return HttpConfig;
    })();
    VORLON.HttpConfig = HttpConfig;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
