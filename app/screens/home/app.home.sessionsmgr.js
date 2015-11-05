var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');
var shell = require('shell');
var config = require("../../vorlon.config");
var userDataPath = app.getPath('userData');
var SessionsManager = (function () {
    function SessionsManager(element) {
        var mgr = this;
        this.sessions = {};
        this.txtAddSession = element.querySelector('#txtnewsession');
        this.btnAddSession = element.querySelector('#btnAddSession');
        this.sessionsList = element.querySelector('#sessionslist');
        this.sessionconfigpanel = element.querySelector('#sessionconfigpanel');
        this.btnSaveConfig = element.querySelector('#btnSaveConfig');
        this.btnCloseConfig = element.querySelector('#btnCloseConfig');
        this.btnRemoveConfig = element.querySelector('#btnRemoveConfig');
        ipc.on("session.init", function (args) {
            console.log("init sessions", args);
            mgr.sessionsList.innerHTML = '';
            mgr.sessions = {};
            var sessions = [];
            var sessionsKeys = {};
            args.forEach(function (session) {
                sessions.push(session);
                sessionsKeys[session.sessionId] = true;
            });
            var storedsessions = config.getSessions(userDataPath);
            for (var n in storedsessions) {
                if (!sessionsKeys[n]) {
                    sessions.push({
                        sessionId: n,
                        nbClients: -1
                    });
                }
            }
            sessions.sort(function (a, b) {
                return a.sessionId.localeCompare(b.sessionId);
            });
            sessions.forEach(function (session) {
                mgr.addSession(session);
                mgr.updateSession(session);
            });
        });
        ipc.on("session.added", function (args) {
            mgr.addSession(args);
            mgr.updateSession(args);
        });
        ipc.on("session.removed", function (args) {
            mgr.removeSession(args);
        });
        ipc.on("session.updated", function (args) {
            mgr.updateSession(args);
        });
        mgr.refresh();
        this.btnCloseConfig.onclick = function () {
            mgr.closeConfig(false);
        };
        this.btnSaveConfig.onclick = function () {
            mgr.saveConfig();
        };
        this.btnRemoveConfig.onclick = function () {
            mgr.removeConfig();
        };
        this.btnAddSession.onclick = function () {
            var sessionid = mgr.txtAddSession.value;
            if (sessionid && sessionid.length > 2) {
                var session = {
                    sessionId: sessionid,
                    nbClients: -1
                };
                mgr.sessions[sessionid] = session;
                mgr.showConfig(session);
                mgr.currentSessionCallback = function (success) {
                    if (!success) {
                        delete mgr.sessions[sessionid];
                    }
                    mgr.refresh();
                };
            }
        };
    }
    SessionsManager.prototype.refresh = function () {
        ipc.send("getVorlonSessions");
    };
    SessionsManager.prototype.addSession = function (session) {
        var mgr = this;
        var existing = mgr.sessions[session.sessionId];
        if (existing) {
            return;
        }
        var elt = document.createElement("DIV");
        elt.className = "session-item";
        elt.innerHTML = '<div class="status status-down"></div><div class="title">' + session.sessionId + '</div><div class="clientcount"></div>' +
            '<div class="opendashboard dripicon dripicon-export"></div>' +
            '<div class="opensettings dripicon dripicon-gear"></div>';
        //'<div class="bloatsession dripicon dripicon-trash"></div>';
        mgr.sessionsList.appendChild(elt);
        mgr.sessions[session.sessionId] = {
            element: elt,
            session: session
        };
        var opendashboard = elt.querySelector('.opendashboard');
        opendashboard.onclick = function () {
            ipc.send("opendashboard", { sessionid: session.sessionId });
        };
        var openconfig = elt.querySelector('.opensettings');
        openconfig.onclick = function () {
            mgr.showConfig(mgr.sessions[session.sessionId].session);
        };
    };
    SessionsManager.prototype.removeSession = function (session) {
        var mgr = this;
        var existingsession = mgr.sessions[session.sessionId];
        if (existingsession) {
            existingsession.session.nbClients = -1;
        }
        mgr.updateSession(existingsession.session);
    };
    SessionsManager.prototype.updateSession = function (session) {
        var mgr = this;
        var existingsession = mgr.sessions[session.sessionId];
        if (!existingsession) {
            mgr.addSession(existingsession);
        }
        existingsession.session = session;
        var clientCountElt = existingsession.element.querySelector('.clientcount');
        var statusElt = existingsession.element.querySelector('.status');
        console.log(session.nbClients + " clients for " + session.sessionId);
        if (session.nbClients >= 0) {
            clientCountElt.innerText = (session.nbClients + 1);
            clientCountElt.style.display = '';
            statusElt.classList.remove('status-down');
            statusElt.classList.add('status-up');
        }
        else {
            clientCountElt.style.display = 'none';
            statusElt.classList.add('status-down');
            statusElt.classList.remove('status-up');
        }
    };
    SessionsManager.prototype.showConfig = function (session) {
        var mgr = this;
        mgr.sessionconfigpanel.classList.remove('away');
        $('.sessionname', mgr.sessionconfigpanel).text(session.sessionId);
        var pluginscontainer = mgr.sessionconfigpanel.querySelector('#sessionsplugins');
        pluginscontainer.innerHTML = '';
        var pluginsConfig = config.getSessionConfig(userDataPath, session.sessionId);
        // pluginsConfig.plugins.sort(function (a, b) {
        // 	return a.name.localeCompare(b.name);
        // });
        mgr.currentSessionConfig = pluginsConfig;
        mgr.currentSessionId = session.sessionId;
        var includeSocketIO = mgr.sessionconfigpanel.querySelector('#includeSocketIO');
        includeSocketIO.checked = pluginsConfig.includeSocketIO;
        includeSocketIO.onchange = function () {
            pluginsConfig.includeSocketIO = includeSocketIO.checked;
        };
        pluginsConfig.plugins.forEach(function (plugin) {
            var e = document.createElement('DIV');
            e.className = "plugin-config";
            e.innerHTML = '<input type="checkbox" id="' + plugin.id + '" ' + (plugin.enabled ? "checked" : "") + ' /><label for="' + plugin.id + '">' + plugin.name + '</div>';
            var input = e.querySelector("input");
            input.onchange = function () {
                plugin.enabled = input.checked;
            };
            pluginscontainer.appendChild(e);
        });
    };
    SessionsManager.prototype.closeConfig = function (success) {
        var mgr = this;
        mgr.sessionconfigpanel.classList.add('away');
        if (mgr.currentSessionCallback) {
            mgr.currentSessionCallback(success);
        }
        mgr.currentSessionConfig = null;
        mgr.currentSessionId = null;
        mgr.currentSessionCallback = null;
    };
    SessionsManager.prototype.saveConfig = function () {
        var mgr = this;
        console.log(mgr.currentSessionConfig);
        mgr.sessions[mgr.currentSessionId].fromConfig = true;
        config.saveSessionConfig(userDataPath, mgr.currentSessionId, mgr.currentSessionConfig);
        mgr.closeConfig(true);
        ipc.send("updateSession", { sessionid: mgr.currentSessionId });
    };
    SessionsManager.prototype.removeConfig = function () {
        var mgr = this;
        if (confirm("Do you really want to remove configuration for " + mgr.currentSessionId)) {
            mgr.sessions[mgr.currentSessionId].fromConfig = false;
            config.removeSessionConfig(userDataPath, mgr.currentSessionId);
            mgr.closeConfig(false);
            ipc.send("updateSession", { sessionid: mgr.currentSessionId });
            mgr.refresh();
        }
    };
    return SessionsManager;
})();
exports.SessionsManager = SessionsManager;
module.exports.SessionsManager = SessionsManager;
