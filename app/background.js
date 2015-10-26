// This is main process of Electron, started as first thing when the Electron
// app starts, and running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

var app = require('app');
var ipc = require('ipc');

var childProcess = require('child_process');
var kill = require('tree-kill');
var path = require('path');

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
var vorlonServerProcess = null;
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

app.on('window-all-closed', function () {
    app.quit();
});

ipc.on("opendashboard", function (event, arg) {
    console.log("receive opendashboard for " + arg);
    if (arg && arg.sessionid) {
        openDashboardWindow(arg.sessionid);
    }
});

ipc.on("startVorlon", function (event, arg) {
    console.log("received startVorlon command");
    startVorlonProcess();
});

ipc.on("stopVorlon", function (event, arg) {
    console.log("received stopVorlon command");
    stopVorlonProcess();
});

ipc.on("getVorlonStatus", function (event, arg) {
    sendVorlonStatus(event, arg);
});

function sendVorlonStatus(event, arg){
    var msg = {
        running : vorlonServerProcess != null
    };
    
    if (event){
        console.log("sending status", msg);
        event.sender.send('vorlonStatus', msg);
    }else{
        console.log("sending status to mainwindow", msg);
        mainWindow.send('vorlonStatus', msg);
    }
}

function openDashboardWindow(sessionid) {
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
    setTimeout(function () {
        dashboardwdw.loadUrl('http://localhost:1337/dashboard/' + sessionid);
    }, 500);

    dashboardWindows.push(dashboardwdw);
    dashboardwdw.on('close', function () {
        var idx = dashboardWindows.indexOf(dashboardwdw);
        if (idx) {
            dashboardWindows.splice(idx, 1);
        }
    });
    
    dashboardwdw.webContents.on('did-fail-load', function(event, errorCode,  errorDescription, validateUrl){
        console.log("dashboard page error " + validateUrl + " " + errorCode + " " + errorDescription);
        dashboardwdw.loadUrl('file://' + __dirname + '/emptypage.html');
    });
}

function startVorlonProcess() {
    if (!vorlonServerProcess) {
        var scriptpath = path.join(__dirname, 'vorlon.js');
        console.log("starting silent " + scriptpath);
        var vorlon = childProcess.fork(scriptpath, [], { silent: true });
        //var vorlon = childProcess.spawn('node', [scriptpath], {});
        
        vorlonServerProcess = vorlon;
        vorlon.on('error', function (data) {
            console.log('stderr: ' + data);
        });

        vorlon.on('message', function (m) {
            console.log("message: " + m);
        });

        vorlon.on('data', function (m) {
            console.log("data: " + m);
        });

        if (vorlon.stdout) {
            console.info("process has stdout");
            vorlon.stdin.on("data", function (data) {
                console.log("received stdin data");
            });

            vorlon.stdout.on("data", function (data) {
                console.log("received data");
                if (data) {
                    console.log("FORWARD " + data.toString());
                }
            });
        }

        vorlon.on('close', function (code) {            
            console.log("VORLON CLOSED WITH CODE " + code);
            stopVorlonProcess();
        });
        sendVorlonStatus();
    }
}

function stopVorlonProcess() {
    if (vorlonServerProcess) {
        kill(vorlonServerProcess.pid, 'SIGKILL', function () {
            vorlonServerProcess = null;
            sendVorlonStatus();
        });
    }
}

function runVorlon() {
    try {
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
    } catch (exception) {
        console.error(exception);
    }
}
