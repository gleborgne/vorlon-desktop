var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');
var shell = require('shell');
var config = require("../../vorlon.config.js");
var userDataPath = app.getPath('userData');

function SessionsManager(element) {
	var mgr = this;
	this.sessions = {};
	
	this.txtAddSession = element.querySelector('#txtnewsession');
	this.btnAddSession = element.querySelector('#btnAddSession');
	this.sessionsList = element.querySelector('#sessionslist');
	
	ipc.on("session.init", function (args) {
		console.log("init sessions", args);
		args.forEach(function(session){
			mgr.addSession(session);
		});        
    });
	
	ipc.on("session.added", function (args) {
        mgr.addSession(args);
    });
	
	ipc.on("session.removed", function (args) {
        mgr.removeSession(args);
    });
	
	ipc.on("session.updated", function (args) {
        mgr.updateSession(args);
    });
	
	ipc.send("getVorlonSessions");
}

module.exports.SessionsManager = SessionsManager;

SessionsManager.prototype.addSession = function(session){
	var mgr = this;
	
	var elt = document.createElement("DIV");
	elt.className = "session-item";
	elt.innerHTML = '<div class="title">' + session.sessionId + '</div>';
	mgr.sessionsList.appendChild(elt);
	mgr.sessions[session.sessionId] = {
		element : elt,
		session : session
	}
}

SessionsManager.prototype.removeSession = function(session){
	var mgr = this;
}

SessionsManager.prototype.updateSession = function(session){
	var mgr = this;
}