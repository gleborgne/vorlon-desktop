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

process.send({ message: "starting..." });

try {
	var context = new servercontext.VORLON.DefaultContext();
	//context.logger = new servercontext.VORLON.SimpleConsoleLogger();

	context.logger = {
		debug: function () {
			process.send({ message: arguments });
			//console.log.apply(null, arguments);
		},
		info: function () {
			process.send({ message: arguments });
			//console.log.apply(null, arguments);
		},
		warn: function () {
			process.send({ error: { err: arguments, origin: 'console.warn'} });
			//console.log.apply(null, arguments);
		},
		error: function () {
			process.send({ error: { err: arguments, origin: 'console.error'} });
			//console.log.apply(null, arguments);
		},
	};

	context.logger.debug("electron building vorlon server");
	var webServer = new vorlonWebserver.VORLON.WebServer(context);
	context.logger.debug("webserver ok");
	var dashboard = new vorlonDashboard.VORLON.Dashboard(context);
	context.logger.debug("dashboard ok");
	var server = new vorlonServer.VORLON.Server(context);
	context.logger.debug("server ok");
	var HttpProxy = new vorlonHttpProxy.VORLON.HttpProxy(context, false);
	context.logger.debug("proxy ok");
	
	webServer.components.push(dashboard);
	webServer.components.push(server);
	webServer.components.push(HttpProxy);

	context.logger.debug("electron starting vorlon server");
	webServer.start();
	webServer._app.use(function logErrors(err, req, res, next) {
		if (err) {
			process.send({ error: { message: "express catched error", err: err, stack: err.stack } });
		}
		next(err);
	});
	context.logger.debug("electron vorlon server ready");
} catch (exception) {
	process.send({ error: { err : exception, origin: 'trycatch', stack : exception.stack} });
	//console.error("VORLONERROR " + exception);
}

//throw new Error("oulala");
