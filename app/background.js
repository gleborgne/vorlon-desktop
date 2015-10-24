// This is main process of Electron, started as first thing when the Electron
// app starts, and running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

var app = require('app');
var ipc = require('ipc');

var childProcess = require('child_process');
var kill = require('tree-kill');
var path  = require('path');

var BrowserWindow = require('browser-window');
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');



var vorlonhttpConfig = require("./vorlon/config/vorlon.httpconfig");
var vorlonServer = require("./vorlon/Scripts/vorlon.server");
var vorlonDashboard = require("./vorlon/Scripts/vorlon.dashboard");
var vorlonWebserver = require("./vorlon/Scripts/vorlon.webServer");
var vorlonHttpProxy = require("./vorlon/Scripts/vorlon.httpproxy.server");
var config = new vorlonhttpConfig.VORLON.HttpConfig();

var mainWindow;
var dashboardWindows = [];

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 1000,
    height: 600
});

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height
    });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    if (env && env.name === 'test') {
        mainWindow.loadUrl('file://' + __dirname + '/spec.html');
    } else {
        mainWindow.loadUrl('file://' + __dirname + '/app.html');
    }

    if (!env || env.name !== 'production') {
        devHelper.setDevMenu();
        //mainWindow.openDevTools();
    }

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
    });

    startVorlonProcess();
});

app.on('window-all-closed', function () {
    app.quit();
});

ipc.on("opendashboard", function(event, arg){
	console.log("receive opendashboard for " + arg);
	if(arg && arg.sessionid){
		openDashboardWindow(arg.sessionid);
	}
});

function openDashboardWindow(sessionid){
	sessionid = sessionid || 'default';
	var dashboardwdw = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        "node-integration": false  
    });
    console.log("create dashboard window for " + sessionid);
    
    //load empty page first to prevent bad window title
    dashboardwdw.loadUrl('file://' + __dirname + '/emptypage.html');
    setTimeout(function(){
		dashboardwdw.loadUrl('http://localhost:1337/dashboard/' + sessionid);
	}, 500);

	dashboardWindows.push(dashboardwdw);
	dashboardwdw.on('close', function () {
        var idx = dashboardWindows.indexOf(dashboardwdw);
        if (idx){
        	dashboardWindows.splice(idx, 1);
        }
    });
}

function startVorlonProcess(){
	var vorlon = childProcess.fork(path.join(__dirname, 'vorlon.js'));

	vorlon.on('error', function (data) {
	  console.log('stderr: ' + data);
	});

    vorlon.on('close', function (code) {
        console.log("VORLON CLOSED WITH CODE " + code);
        // User closed the app. Kill the host process.
        kill(vorlon.pid, 'SIGKILL', function () {
            //process.exit();
        });
    });
}

function runVorlon(){
	try{
		console.log("electron building vorlon server");
		//WEBSERVER
	    var webServer = new vorlonWebserver.VORLON.WebServer();
	    //DASHBOARD
	    var dashboard = new vorlonDashboard.VORLON.Dashboard();
	    //VORLON SERVER
	    var server = new vorlonServer.VORLON.Server();
	    //VORLON HTTPPROXY
	    //var HttpProxy = new vorlonHttpProxy.VORLON.HttpProxy(false);

	    webServer.components.push(dashboard);
	    webServer.components.push(server);
	    //webServer.components.push(HttpProxy);

	    console.log("electron starting vorlon server");
	    webServer.start();
	    console.log("electron vorlon server ready");
	} catch (exception){
		console.error(exception);
	}
}
