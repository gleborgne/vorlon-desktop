'use strict';

var path = require("path");
//var app = require('app');
var jetpack = require('fs-jetpack');
//var userDataDir = jetpack.cwd(app.getPath('userData'));
var vorlonConfigFile = 'vorlonconfig.json';
var sessionConfigsStoreFile = 'vorlonsessions.json';

var vorlonOriginalConfig = jetpack.cwd(path.join(__dirname, "vorlon")).read('config.json', 'json');

module.exports.getConfig = function (configpath) {
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(vorlonConfigFile, 'json');
    if (!config)
        config = JSON.parse(JSON.stringify(vorlonOriginalConfig));
      
    return config;
}

module.exports.saveConfig = function (path, config) {
    var userDataDir = jetpack.cwd(path);    
    userDataDir.write(vorlonConfigFile, config, { atomic: true });
};

module.exports.resetConfig = function(path){
    var userDataDir = jetpack.cwd(path);
    userDataDir.write(vorlonConfigFile, vorlonOriginalConfig, { atomic: true });
}

module.exports.availablePlugins = function(){
    return JSON.parse(JSON.stringify({ includeSocketIO : vorlonOriginalConfig.includeSocketIO, plugins : vorlonOriginalConfig.plugins }));
}

module.exports.getSessionConfig = function(configpath, sessionid){
    var defaultConfig = JSON.parse(JSON.stringify({ includeSocketIO : vorlonOriginalConfig.includeSocketIO, plugins : vorlonOriginalConfig.plugins }));
    
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(sessionConfigsStoreFile, 'json');
    
    if (!config || !config[sessionid])
        return defaultConfig
    
    var sessionConfig = config[sessionid];
    
    //todo merge default & stored config to ensure plugins availability
      
    return sessionConfig;
}

module.exports.saveSessionConfig = function (path, sessionid, config) {
    var userDataDir = jetpack.cwd(path);  
    var storedconfig = userDataDir.read(sessionConfigsStoreFile, 'json') || {};
    storedconfig[sessionid] = config
      
    userDataDir.write(sessionConfigsStoreFile, storedconfig, { atomic: true });
};