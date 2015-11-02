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
	
	ipc.send("getVorlonSessions");
}

module.exports.SessionsManager = SessionsManager;

SessionsManager.prototype.addSession = function(session){
	var mgr = this;
	var existing = mgr.sessions[session.sessionId];
	if (existing){
		return;
	}
	
	var elt = document.createElement("DIV");
	elt.className = "session-item";
	elt.innerHTML = '<div class="title">' + session.sessionId + '</div><div class="clientcount"></div><div class="opendashboard dripicon dripicon-export"></div><div class="opensettings dripicon dripicon-gear"></div>';
	mgr.sessionsList.appendChild(elt);
	mgr.sessions[session.sessionId] = {
		element : elt,
		session : session
	};
	
	var opendashboard = elt.querySelector('.opendashboard');
	opendashboard.onclick = function(){
		ipc.send("opendashboard", { sessionid: session.sessionId });
	}
}

SessionsManager.prototype.removeSession = function(session){
	var mgr = this;
	var existingsession = mgr.sessions[session.sessionId];
	if (existingsession){
		existingsession.session.nbClients = -1;
	}
	mgr.updateSession(existingsession.session);
}

SessionsManager.prototype.updateSession = function(session){
	var mgr = this;
	var existingsession = mgr.sessions[session.sessionId];
	if (!existingsession){
		mgr.addSession(existingsession);
	}
	existingsession.session = session;
	var clientCountElt = existingsession.element.querySelector('.clientcount');
	console.log(session.nbClients + " clients for " + session.sessionId)
	if (session.nbClients >= 0){
		clientCountElt.innerText = (session.nbClients + 1);
		clientCountElt.style.display = '';
	} else{
		clientCountElt.style.display = 'none';
	}
}