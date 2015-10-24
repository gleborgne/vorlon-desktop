var vorlonhttpConfig = require("./vorlon/config/vorlon.httpconfig");
var vorlonServer = require("./vorlon/Scripts/vorlon.server");
var vorlonDashboard = require("./vorlon/Scripts/vorlon.dashboard");
var vorlonWebserver = require("./vorlon/Scripts/vorlon.webServer");
var vorlonHttpProxy = require("./vorlon/Scripts/vorlon.httpproxy.server");
var config = new vorlonhttpConfig.VORLON.HttpConfig();

console.log("STARTING VORLON FROM ELECTRON");

var global = this;
if (!global.setImmediate){
	global.setImmediate = function(callback){
		setTimeout(callback, 1);
	}
}

try{
		console.log("electron building vorlon server");
		//WEBSERVER
	    var webServer = new vorlonWebserver.VORLON.WebServer();
	    //DASHBOARD
	    var dashboard = new vorlonDashboard.VORLON.Dashboard();
	    //VORLON SERVER
	    var server = new vorlonServer.VORLON.Server();
	    //VORLON HTTPPROXY
	    var HttpProxy = new vorlonHttpProxy.VORLON.HttpProxy(false);

	    webServer.components.push(dashboard);
	    webServer.components.push(server);
	    webServer.components.push(HttpProxy);

	    console.log("electron starting vorlon server");
	    webServer.start();
	    console.log("electron vorlon server ready");
	} catch (exception){
		console.error(exception);
	}