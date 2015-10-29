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
var HomePanel = require('./app.home.js').HomePanel;
var ConsolePanel = require('./app.console.js').ConsolePanel;
var SettingsPanel = require('./app.settings.js').SettingsPanel;
var InfoPanel = require('./app.info.js').InfoPanel;
var homepanel = null, consolepanel = null, settingspanel = null, infopanel = null;
// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log(jetpack.read('package.json', 'json'));

// window.env contains data from config/env_XXX.json file.
var envName = "DEV";

if (window.env) {
    envName = window.env.name;
}

document.addEventListener('DOMContentLoaded', function () {
    var panelHome = document.getElementById("panelHome");
    loadPanelContent("./app.home.html", panelHome, function(){
        console.log("panel home loaded");
        homepanel = new HomePanel(panelHome);
        ipc.send('getVorlonStatus');
    });
    
    var panelConsole = document.getElementById("panelConsole");
    loadPanelContent("./app.console.html", panelConsole, function(){
        console.log("panel console loaded");
        consolepanel = new ConsolePanel(panelConsole);
    });
    
    var panelConfig = document.getElementById("panelConfig");
    loadPanelContent("./app.settings.html", panelConfig, function(){
        console.log("panel console loaded");
        settingspanel = new SettingsPanel(panelConfig);
    });
    
    var panelInfo = document.getElementById("panelInfo");
    loadPanelContent("./app.info.html", panelInfo, function(){
        console.log("panel console loaded");
        infopanel = new SettingsPanel(panelInfo);
    });
    
    $("#menubar").on("click", ".icon", function(arg){
        $("#menubar .icon.selected").removeClass("selected");
        $(".panel.selected").removeClass("selected");
        var panel = $(this).attr("targetpanel");
        $(this).addClass("selected");
        $("#"+ panel).addClass("selected");
    });
    
});




function loadPanelContent(url, panelElement, callback) {
    $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
            //console.log(data);
            panelElement.innerHTML = data;
            callback(panelElement);
        },
    });
}