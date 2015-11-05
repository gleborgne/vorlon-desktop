var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');
var jetpack = require('fs-jetpack').cwd(app.getAppPath());
var shell = require('shell');
var config = require("./vorlon.config");
var app_home_1 = require('./screens/home/app.home');
var app_console_1 = require('./screens/console/app.console');
var app_settings_1 = require('./screens/settings/app.settings');
var app_info_1 = require('./screens/info/app.info');
var userDataPath = app.getPath('userData');
var homepanel = null, consolepanel = null, settingspanel = null, infopanel = null;
console.log(jetpack.read('package.json', 'json'));
// window.env contains data from config/env_XXX.json file.
var envName = "DEV";
var env = window.env;
if (env) {
    envName = env.name;
}
document.addEventListener('DOMContentLoaded', function () {
    var panelHome = document.getElementById("panelHome");
    loadPanelContent("./screens/home/app.home.html", panelHome, function () {
        console.log("panel home loaded");
        homepanel = new app_home_1.HomePanel(panelHome);
    }).then(function () {
        var panelConsole = document.getElementById("panelConsole");
        return loadPanelContent("./screens/console/app.console.html", panelConsole, function () {
            console.log("panel console loaded");
            consolepanel = new app_console_1.ConsolePanel(panelConsole);
        });
    }).then(function () {
        ipc.send('getVorlonStatus');
    }).then(function () {
        var panelConfig = document.getElementById("panelConfig");
        return loadPanelContent("./screens/settings/app.settings.html", panelConfig, function () {
            console.log("panel console loaded");
            settingspanel = new app_settings_1.SettingsPanel(panelConfig);
        });
    }).then(function () {
        var panelInfo = document.getElementById("panelInfo");
        loadPanelContent("./screens/info/app.info.html", panelInfo, function () {
            console.log("panel console loaded");
            infopanel = new app_info_1.InfoPanel(panelInfo);
        });
    });
    $("#menubar").on("click", ".icon", function (arg) {
        $("#menubar .icon.selected").removeClass("selected");
        $(".panel.selected").removeClass("selected");
        var panel = $(this).attr("targetpanel");
        $(this).addClass("selected");
        $("#" + panel).addClass("selected");
    });
    var cfg = config.getConfig(userDataPath);
    $(".vorlonscriptsample").text("http://" + os.hostname() + ":" + cfg.port + "/vorlon.js");
});
function loadPanelContent(url, panelElement, callback) {
    return $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
            //console.log(data);
            panelElement.innerHTML = data;
            callback(panelElement);
        },
    });
}
