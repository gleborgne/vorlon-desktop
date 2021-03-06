'use strict';
var path = require("path");
var jetpack = require('fs-jetpack');
var vorlonConfigFile = 'vorlonconfig.json';
var sessionConfigsStoreFile = 'vorlonsessions.json';
var vorlonOriginalConfig = jetpack.cwd(path.join(__dirname, "vorlon")).read('config.json', 'json');
function getConfig(configpath) {
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(vorlonConfigFile, 'json');
    if (!config)
        config = JSON.parse(JSON.stringify(vorlonOriginalConfig));
    return config;
}
exports.getConfig = getConfig;
function saveConfig(path, config) {
    var userDataDir = jetpack.cwd(path);
    userDataDir.write(vorlonConfigFile, config, { atomic: true });
}
exports.saveConfig = saveConfig;
;
function resetConfig(path) {
    var userDataDir = jetpack.cwd(path);
    userDataDir.write(vorlonConfigFile, vorlonOriginalConfig, { atomic: true });
}
exports.resetConfig = resetConfig;
function availablePlugins() {
    return JSON.parse(JSON.stringify({ includeSocketIO: vorlonOriginalConfig.includeSocketIO, plugins: vorlonOriginalConfig.plugins }));
}
exports.availablePlugins = availablePlugins;
function getSessions(configpath) {
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(sessionConfigsStoreFile, 'json') || {};
    return config;
}
exports.getSessions = getSessions;
function getSessionConfig(configpath, sessionid) {
    var defaultConfig = JSON.parse(JSON.stringify({ includeSocketIO: vorlonOriginalConfig.includeSocketIO, plugins: vorlonOriginalConfig.plugins }));
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(sessionConfigsStoreFile, 'json');
    if (!config || !config[sessionid])
        return defaultConfig;
    var sessionConfig = config[sessionid];
    //todo merge default & stored config to ensure plugins availability
    return sessionConfig;
}
exports.getSessionConfig = getSessionConfig;
function saveSessionConfig(path, sessionid, config) {
    var userDataDir = jetpack.cwd(path);
    var storedconfig = userDataDir.read(sessionConfigsStoreFile, 'json') || {};
    storedconfig[sessionid] = config;
    userDataDir.write(sessionConfigsStoreFile, storedconfig, { atomic: true });
}
exports.saveSessionConfig = saveSessionConfig;
;
function removeSessionConfig(path, sessionid) {
    var userDataDir = jetpack.cwd(path);
    var storedconfig = userDataDir.read(sessionConfigsStoreFile, 'json') || {};
    delete storedconfig[sessionid];
    userDataDir.write(sessionConfigsStoreFile, storedconfig, { atomic: true });
}
exports.removeSessionConfig = removeSessionConfig;
;
