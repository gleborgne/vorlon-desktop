var fs = require("fs");
var path = require("path");
var VORLON;
(function (VORLON) {
    var PluginsConfig = (function () {
        function PluginsConfig() {
        }
        PluginsConfig.prototype.getPluginsFor = function (sessionid, callback) {
            var configurationFile = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);
            var sessionConfig = configuration.sessions[sessionid];
            if (!sessionConfig)
                sessionConfig = {
                    includeSocketIO: configuration.includeSocketIO,
                    plugins: configuration.plugins
                };
            if (callback)
                callback(null, sessionConfig);
        };
        return PluginsConfig;
    })();
    VORLON.PluginsConfig = PluginsConfig;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
