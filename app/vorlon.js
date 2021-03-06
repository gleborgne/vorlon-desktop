var http = require("http");
var vorlonServer = require("./vorlon/Scripts/vorlon.server");
var vorlonDashboard = require("./vorlon/Scripts/vorlon.dashboard");
var vorlonWebserver = require("./vorlon/Scripts/vorlon.webServer");
var vorlonHttpProxy = require("./vorlon/Scripts/vorlon.httpproxy.server");
var servercontext = require("./vorlon/config/vorlon.servercontext");
var config = require("./vorlon.config");
//console.log("STARTING VORLON FROM ELECTRON");
var global = this;
if (!global.setImmediate) {
    global.setImmediate = function (callback) {
        setTimeout(callback, 1);
    };
}
try {
    var logger = {
        debug: function () {
            var logargs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                logargs[_i - 0] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments);
            process.send({ log: { level: "debug", args: args, origin: 'logger.debug' } });
        },
        info: function () {
            var logargs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                logargs[_i - 0] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments);
            process.send({ log: { level: "info", args: args, origin: 'logger.info' } });
        },
        warn: function () {
            var logargs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                logargs[_i - 0] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments);
            process.send({ log: { level: "warn", args: args, origin: 'logger.warn' } });
        },
        error: function () {
            var logargs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                logargs[_i - 0] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments);
            process.send({ log: { level: "error", args: args, origin: 'logger.error' } });
        },
    };
    var userdatapath = process.argv[2];
    var vorlonconfig = config.getConfig(userdatapath);
    var context = new servercontext.VORLON.DefaultContext();
    context.sessions.onsessionadded = function (session) {
        process.send({ session: { action: "added", session: session } });
    };
    context.sessions.onsessionremoved = function (session) {
        process.send({ session: { action: "removed", session: session } });
    };
    context.sessions.onsessionupdated = function (session) {
        process.send({ session: { action: "updated", session: session } });
    };
    context.plugins = {
        getPluginsFor: function (sessionid, callback) {
            var plugins = config.getSessionConfig(userdatapath, sessionid);
            logger.debug("get plugins from local for " + sessionid);
            if (callback)
                callback(null, plugins);
        }
    };
    context.sessions.logger = logger;
    vorlonconfig.httpModule = http;
    vorlonconfig.protocol = "http";
    context.httpConfig = vorlonconfig;
    context.baseURLConfig = vorlonconfig;
    context.logger = logger;
    var webServer = new vorlonWebserver.VORLON.WebServer(context);
    var dashboard = new vorlonDashboard.VORLON.Dashboard(context);
    var server = new vorlonServer.VORLON.Server(context);
    var HttpProxy = new vorlonHttpProxy.VORLON.HttpProxy(context, false);
    webServer.components.push(dashboard);
    webServer.components.push(server);
    webServer.components.push(HttpProxy);
    webServer.start();
    var webapp = webServer._app;
    webapp.use(function logErrors(err, req, res, next) {
        if (err) {
            process.send({ log: { level: "error", args: err.stack, origin: 'logger.error' } });
        }
        next(err);
    });
    process.on("message", function (args) {
        process.send({ session: { action: "init", session: context.sessions.all() } });
    });
}
catch (exception) {
    process.send({ log: { level: "error", args: [exception.stack], origin: 'trycatch' } });
}
