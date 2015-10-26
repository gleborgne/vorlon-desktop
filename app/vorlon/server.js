var httpConfig = require("./config/vorlon.httpconfig");
var vorlonServer = require("./Scripts/vorlon.server");
var vorlonDashboard = require("./Scripts/vorlon.dashboard");
var vorlonWebserver = require("./Scripts/vorlon.webServer");
var vorlonHttpProxy = require("./Scripts/vorlon.httpproxy.server");
var config = new httpConfig.VORLON.HttpConfig();
// if proxyEnvPort==true start a standalone instance of httpProxy
if (!config.proxyEnvPort) {
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
    webServer.start();
}
else {
    var serverProxy = new vorlonHttpProxy.VORLON.HttpProxy(true);
    serverProxy.start();
}
