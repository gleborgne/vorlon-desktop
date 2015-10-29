var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');
var shell = require('shell');

function HomePanel(element) {
    var panel = this;
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
                //console.log(data);
                if (data) {
                    ipc.send("opendashboard", { sessionid: data.session });
                    setTimeout(function () {
                        shell.openExternal(data.url);
                    }, 500);
                }
            });
        }
    };
    
    this.statusText = document.getElementById('vorlonServerStatus');
    this.btnStart = document.getElementById('btnStartServer');
    this.btnStart.onclick = function () {
        ipc.send("startVorlon");
    }
    this.btnStop = document.getElementById('btnStopServer');
    this.btnStop.onclick = function () {
        ipc.send("stopVorlon");
    }

    ipc.on("vorlonStatus", function (args) {
        console.log("receive status", args);
        if (panel.statusText) {
            if (args.running) {
                panel.statusText.innerHTML = "VORLON server is running";
                panel.btnStart.style.display = "none";
                panel.btnStop.style.display = "";
            } else {
                panel.statusText.innerHTML = "VORLON server is NOT running";
                panel.btnStart.style.display = "";
                panel.btnStop.style.display = "none";
            }
        }
    });
}

module.exports.HomePanel = HomePanel;

function getProxyData(url, callback) {
    $.ajax({
        type: "GET",
        url: "http://localhost:1337/httpproxy/inject?url=" + encodeURIComponent(url) + "&ts=" + new Date(),
        success: function (data) {
            callback(JSON.parse(data));
        },
    });
}