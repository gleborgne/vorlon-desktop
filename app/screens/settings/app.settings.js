var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');
var config = require("../../vorlon.config");
var userDataPath = app.getPath('userData');
var SettingsPanel = (function () {
    function SettingsPanel(element) {
        var panel = this;
        this.element = element;
        this.vorlonPort = element.querySelector("#vorlonPort");
        this.vorlonProxyPort = element.querySelector("#vorlonProxyPort");
        this.btnSaveConfig = element.querySelector("#btnSaveConfig");
        this.btnCancelConfig = element.querySelector("#btnCancelConfig");
        this.btnResetConfig = element.querySelector("#btnResetConfig");
        this.vorlonscriptsample = element.querySelector("#vorlonscriptsample");
        this.loadConfig();
        this.btnResetConfig.onclick = function () {
            ipc.send("stopVorlon");
            config.resetConfig(userDataPath);
            setTimeout(function () {
                ipc.send("startVorlon");
                panel.configChanged();
            }, 1000);
        };
        this.btnSaveConfig.onclick = function () {
            ipc.send("stopVorlon");
            panel.cfg.port = panel.vorlonPort.value;
            panel.cfg.proxyPort = panel.vorlonProxyPort.value;
            config.saveConfig(userDataPath, panel.cfg);
            setTimeout(function () {
                ipc.send("startVorlon");
                panel.configChanged();
            }, 1000);
        };
        this.btnCancelConfig.onclick = function () {
            panel.loadConfig();
        };
    }
    SettingsPanel.prototype.configChanged = function () {
        ipc.send("configChanged");
        this.loadConfig();
    };
    SettingsPanel.prototype.loadConfig = function () {
        console.log("load config from " + userDataPath);
        this.cfg = config.getConfig(userDataPath);
        this.vorlonPort.value = this.cfg.port;
        this.vorlonProxyPort.value = this.cfg.proxyPort;
        $(".vorlonscriptsample").text("http://" + os.hostname() + ":" + this.cfg.port + "/vorlon.js");
    };
    return SettingsPanel;
})();
exports.SettingsPanel = SettingsPanel;
