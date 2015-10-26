// Here is the starting point for code of your own application.
// All stuff below is just to show you how it works. You can delete all of it.

// Node.js modules and those from npm
// are required the same way as always.
var os = require('os');
var ipc = require('ipc');
var jquery = require('jquery');
var app = require('remote').require('app');
var jetpack = require('fs-jetpack').cwd(app.getAppPath());
var shell = require('shell');

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log(jetpack.read('package.json', 'json'));

// window.env contains data from config/env_XXX.json file.
var envName = "DEV";
var statusText = null, btnStart = null, btnStop = null;

if (window.env) {
    envName = window.env.name;
}

document.addEventListener('DOMContentLoaded', function () {
    var txtSessionId = document.getElementById('vorlonsessionid');
    document.getElementById('btnopendashboard').onclick = function () {
        var sessionid = txtSessionId.value;
        if (sessionid && sessionid.length) {
            console.log("send command opendashboard " + sessionid);
            ipc.send("opendashboard", { sessionid: sessionid });
        }
    };

    var txtProxyTarget = document.getElementById('vorlonproxytarget');
    document.getElementById('btnopenproxy').onclick = function () {
        var targeturl = txtProxyTarget.value;
        if (targeturl && targeturl.length) {
            console.log("request data for proxying " + targeturl);
            getProxyData(targeturl, function (data) {
                console.log(data);
                if (data) {
                    ipc.send("opendashboard", { sessionid: data.session });
                    setTimeout(function () {
                        shell.openExternal(data.url);
                    }, 500);
                }
            });
        }
    };

    ipc.send('getVorlonStatus');

    statusText = document.getElementById('vorlonServerStatus');
    btnStart = document.getElementById('btnStartServer');
    btnStart.onclick = function(){
        ipc.send("startVorlon");
    }
    btnStop = document.getElementById('btnStopServer');
    btnStop.onclick = function(){
        ipc.send("stopVorlon");
    }
});

ipc.on("vorlonStatus", function (args) {
    console.log("receive status", args);
    if (statusText){
        if (args.running) {
            statusText.innerHTML = "VORLON server is running";
            btnStart.style.display = "none";
            btnStop.style.display = "";
        } else {
            statusText.innerHTML = "VORLON server is NOT running";
            btnStart.style.display = "";
            btnStop.style.display = "none";
        }
    }
})

function getProxyData(url, callback) {
    jquery.ajax({
        type: "GET",
        url: "http://localhost:1337/httpproxy/inject?url=" + encodeURIComponent(url) + "&ts=" + new Date(),
        success: function (data) {
            callback(JSON.parse(data));
        },
    });
}