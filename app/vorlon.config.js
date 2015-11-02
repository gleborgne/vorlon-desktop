'use strict';

var path = require("path");
//var app = require('app');
var jetpack = require('fs-jetpack');
//var userDataDir = jetpack.cwd(app.getPath('userData'));
var stateStoreFile = 'vorlonconfig.json';

var vorlonOriginalConfig = jetpack.cwd(path.join(__dirname, "vorlon")).read('config.json', 'json');

module.exports.getConfig = function (configpath) {
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(stateStoreFile, 'json');
    if (!config)
        config = JSON.parse(JSON.stringify(vorlonOriginalConfig));
      
    return config;
}

module.exports.saveConfig = function (path, config) {
    var userDataDir = jetpack.cwd(path);    
    userDataDir.write(stateStoreFile, config, { atomic: true });
};

module.exports.resetConfig = function(path){
    var userDataDir = jetpack.cwd(path);
    userDataDir.write(stateStoreFile, vorlonOriginalConfig, { atomic: true });
}

module.exports.availablePlugins = function(){
    return JSON.parse(JSON.stringify({ includeSocketIO : vorlonOriginalConfig.includeSocketIO, plugins : vorlonOriginalConfig.plugins }));
}