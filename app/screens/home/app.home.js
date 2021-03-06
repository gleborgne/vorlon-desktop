var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');
var shell = require('shell');
var config = require("../../vorlon.config");
var SessionsManager = require("./app.home.sessionsmgr").SessionsManager;
var userDataPath = app.getPath('userData');
var HomePanel = (function () {
    function HomePanel(element) {
        var panel = this;
        var sessionspanel = document.getElementById('sessionspanel');
        var sessionsManager = new SessionsManager(sessionspanel);
        var btnopendashboard = document.getElementById('btnopendashboard');
        var txtSessionId = document.getElementById('vorlonsessionid');
        txtSessionId.onkeypress = function (e) {
            var key = e.which ? e.which : e.keyCode;
            if (key == 13) {
                txtSessionId.blur();
                e.preventDefault();
                e.stopPropagation();
                btnopendashboard.focus();
                btnopendashboard.click();
            }
        };
        btnopendashboard.onclick = function () {
            var sessionid = txtSessionId.value;
            if (sessionid && sessionid.length) {
                console.log("send command opendashboard " + sessionid);
                ipc.send("opendashboard", { sessionid: sessionid });
            }
        };
        var txtProxyTarget = document.getElementById('vorlonproxytarget');
        var btnopenproxy = document.getElementById('btnopenproxy');
        txtProxyTarget.onkeypress = function (e) {
            var key = e.which ? e.which : e.keyCode;
            if (key == 13) {
                txtProxyTarget.blur();
                e.preventDefault();
                e.stopPropagation();
                btnopenproxy.focus();
                btnopenproxy.click();
            }
        };
        btnopenproxy.onclick = function () {
            var targeturl = txtProxyTarget.value;
            if (targeturl && targeturl.length) {
                if (!(targeturl.indexOf("http://") == 0 || targeturl.indexOf("https://") == 0)) {
                    txtProxyTarget.value = "http://" + targeturl;
                    targeturl = txtProxyTarget.value;
                }
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
        };
        this.btnStop = document.getElementById('btnStopServer');
        this.btnStop.onclick = function () {
            ipc.send("stopVorlon");
        };
        ipc.on("vorlonStatus", function (args) {
            var cfg = config.getConfig(userDataPath);
            console.log("receive status", args);
            if (panel.statusText) {
                if (args.running) {
                    panel.statusText.innerHTML = "VORLON server is running on port " + cfg.port;
                    panel.btnStart.style.display = "none";
                    panel.btnStop.style.display = "";
                }
                else {
                    panel.statusText.innerHTML = "VORLON server is NOT running";
                    panel.btnStart.style.display = "";
                    panel.btnStop.style.display = "none";
                }
            }
        });
    }
    return HomePanel;
})();
exports.HomePanel = HomePanel;
function getProxyData(targeturl, callback) {
    var cfg = config.getConfig(userDataPath);
    var callurl = "http://localhost:" + cfg.port + "/httpproxy/inject?url=" + encodeURIComponent(targeturl) + "&ts=" + new Date();
    $.ajax({
        type: "GET",
        url: callurl,
        success: function (data) {
            console.log('proxy targets');
            console.log(data);
            callback(JSON.parse(data));
        },
    });
}
