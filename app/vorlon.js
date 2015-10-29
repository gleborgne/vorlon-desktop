var vorlonhttpConfig = require("./vorlon/config/vorlon.httpconfig");
var vorlonServer = require("./vorlon/Scripts/vorlon.server");
var vorlonDashboard = require("./vorlon/Scripts/vorlon.dashboard");
var vorlonWebserver = require("./vorlon/Scripts/vorlon.webServer");
var vorlonHttpProxy = require("./vorlon/Scripts/vorlon.httpproxy.server");
var config = new vorlonhttpConfig.VORLON.HttpConfig();
var servercontext = require("./vorlon/config/vorlon.servercontext");

//console.log("STARTING VORLON FROM ELECTRON");

var global = this;
if (!global.setImmediate) {
	global.setImmediate = function (callback) {
		setTimeout(callback, 1);
	}
}

try {
	var context = new servercontext.VORLON.DefaultContext();
	//context.logger = new servercontext.VORLON.SimpleConsoleLogger();

	context.logger = {
		debug: function () {
			var args = Array.prototype.slice.call(arguments);
			process.send({ log: { level: "debug", args: args, origin: 'logger.debug'} });
		},
		info: function () {
			var args = Array.prototype.slice.call(arguments);
			process.send({ log: { level: "info", args: args, origin: 'logger.info'} });
		},
		warn: function () {
			var args = Array.prototype.slice.call(arguments);

			process.send({ log: { level: "warn", args: args, origin: 'logger.warn'} });
		},
		error: function () {
			var args = Array.prototype.slice.call(arguments);
			process.send({ log: { level: "error", args: args, origin: 'logger.error'} });
		},
	};

	//context.logger.debug("electron building vorlon server");
	var webServer = new vorlonWebserver.VORLON.WebServer(context);
	//context.logger.debug("webserver ok");
	var dashboard = new vorlonDashboard.VORLON.Dashboard(context);
	//context.logger.debug("dashboard ok");
	var server = new vorlonServer.VORLON.Server(context);
	//context.logger.debug("server ok");
	var HttpProxy = new vorlonHttpProxy.VORLON.HttpProxy(context, false);
	//context.logger.debug("proxy ok");
	
	webServer.components.push(dashboard);
	webServer.components.push(server);
	webServer.components.push(HttpProxy);

	//context.logger.debug("electron starting vorlon server");
	webServer.start();
	webServer._app.use(function logErrors(err, req, res, next) {
		if (err) {
			process.send({ log: { level: "error", args: err.stack, origin: 'logger.error'} });
		}
		next(err);
	});
	//context.logger.debug("electron vorlon server ready");
} catch (exception) {
	process.send({ log: { level: "error", args: [exception.stack], origin: 'trycatch'} });
	//process.send({ error: { err : exception, origin: 'trycatch', stack : exception.stack} });
	//console.error("VORLONERROR " + exception);
}

//throw new Error("oulala");
