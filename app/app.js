// Here is the starting point for code of your own application.
// All stuff below is just to show you how it works. You can delete all of it.

// Node.js modules and those from npm
// are required the same way as always.
var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');
var jetpack = require('fs-jetpack').cwd(app.getAppPath());
var shell = require('shell');

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log(jetpack.read('package.json', 'json'));

// window.env contains data from config/env_XXX.json file.
var envName = "DEV";
var statusText = null, btnStart = null, btnStop = null, errorscontainer = null, messagescontainer = null;

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
    errorscontainer = document.getElementById('vorlonerrors');
    messagescontainer = document.getElementById('vorlonmessages');
    statusText = document.getElementById('vorlonServerStatus');
    btnStart = document.getElementById('btnStartServer');
    btnStart.onclick = function () {
        ipc.send("startVorlon");
    }
    btnStop = document.getElementById('btnStopServer');
    btnStop.onclick = function () {
        ipc.send("stopVorlon");
    }
    
    $("#menubar").on("click", ".icon", function(arg){
        $("#menubar .icon.selected").removeClass("selected");
        $(".panel.selected").removeClass("selected");
        var panel = $(this).attr("targetpanel");
        $(this).addClass("selected");
        $("#"+ panel).addClass("selected");
    });
});

ipc.on("vorlonStatus", function (args) {
    console.log("receive status", args);
    if (statusText) {
        if (args.running) {
            statusText.innerHTML = "VORLON server is running";
            btnStart.style.display = "none";
            btnStop.style.display = "";
        } else {
            statusText.innerHTML = "VORLON server is NOT running";
            btnStart.style.display = "";
            btnStop.style.display = "none";
        }

        if (args.errors && args.errors.length) {
            errorscontainer.innerHTML = "";
            args.errors.forEach(function (err) {
                var e = document.createElement("DIV");
                e.className = "error";
                e.innerText = JSON.stringify(err.args);
                errorscontainer.appendChild(e);
            })
        } else {
            errorscontainer.innerHTML = "no errors";
        }

        if (args.messages && args.messages.length) {
            messagescontainer.innerHTML = "";
            args.messages.forEach(function (log) {
                appendLog(log);
            })
        } else {
            messagescontainer.innerHTML = "";
        }
    }
});

ipc.on("vorlonlog", function (args) {
    if (args.logs) {
        args.logs.forEach(function (log) {
            appendLog(log);
        });
    }
});


function appendLog(log) {
    var e = document.createElement("DIV");
    e.className = "log log-" + log.level;
    e.innerText = JSON.stringify(log.args);
    messagescontainer.insertBefore(e, messagescontainer.firstChild);
}

function getProxyData(url, callback) {
    $.ajax({
        type: "GET",
        url: "http://localhost:1337/httpproxy/inject?url=" + encodeURIComponent(url) + "&ts=" + new Date(),
        success: function (data) {
            callback(JSON.parse(data));
        },
    });
}