var httpConfig = require("./vorlon.httpconfig");
var baseUrlConfig = require("./vorlon.baseurlconfig");
var logConfig = require("./vorlon.logconfig");
var redisConfig = require("./vorlon.redisconfig");
var VORLON;
(function (VORLON) {
    var SimpleConsoleLogger = (function () {
        function SimpleConsoleLogger() {
        }
        SimpleConsoleLogger.prototype.debug = function () {
            console.log.apply(null, arguments);
        };
        SimpleConsoleLogger.prototype.info = function () {
            console.info.apply(null, arguments);
        };
        SimpleConsoleLogger.prototype.warn = function () {
            console.warn.apply(null, arguments);
        };
        SimpleConsoleLogger.prototype.error = function () {
            console.error.apply(null, arguments);
        };
        return SimpleConsoleLogger;
    })();
    VORLON.SimpleConsoleLogger = SimpleConsoleLogger;
    var DefaultContext = (function () {
        function DefaultContext() {
            this.httpConfig = new httpConfig.VORLON.HttpConfig();
            this.baseURLConfig = new baseUrlConfig.VORLON.BaseURLConfig();
            this.logConfig = new logConfig.VORLON.LogConfig();
            this.redisConfig = new redisConfig.VORLON.RedisConfig();
        }
        return DefaultContext;
    })();
    VORLON.DefaultContext = DefaultContext;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
