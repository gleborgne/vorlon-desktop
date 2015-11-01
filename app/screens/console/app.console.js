var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');

function ConsolePanel(element) {
	var panel = this;
	this.messagescontainer = document.getElementById('vorlonmessages');
	ipc.on("vorlonlog", function(args) {
		if (args.logs) {
			args.logs.forEach(function(log) {
				panel.appendLog(log);
			});
		}
	});

	ipc.on("vorlonStatus", function(args) {
        panel.messagescontainer.innerHTML = "";
		if (args.messages) {
			args.messages.forEach(function(log) {
				panel.appendLog(log);
			});
		}
    });
}
module.exports.ConsolePanel = ConsolePanel


ConsolePanel.prototype.appendLog = function (log) {
    if (typeof log.args == "string"){
		this.appendLogEntry(log.level, log.args);	
	}
    else if (log.args.length == 1) {
		this.appendLogEntry(log.level, log.args[0]);
	}
    else if (log.args.length > 1) {
		this.appendLogEntry(log.level, log.args[0]);
		for (var i=1, l=log.args.length ; i<l; i++){
			this.appendLogEntry(log.level, log.args[i], true);
		}
	}
}

ConsolePanel.prototype.appendLogEntry = function (level, logtext, indent) {
	if (!logtext)
		return;
		
	if (!(typeof logtext == "string")){
		console.log(JSON.stringify(logtext));
		return;
	}
	
    var e = document.createElement("DIV");
    e.className = "log log-" + level + " " + (indent ? "indent" : "");
	var icon = document.createElement("I");
	icon.className = "dripicon " + classNameForLogLevel(level);
	e.appendChild(icon);
	var text = document.createElement("SPAN");
	text.className = "logtext";
    text.innerText = logtext.replace(/(?:\r\n|\r|\n)/g, '<br />');
	e.appendChild(text);
	
    this.messagescontainer.insertBefore(e, this.messagescontainer.firstChild);
}

function classNameForLogLevel(level){
	if (level == "debug"){
		return "dripicon-preview";
	}
	else if (level == "warn"){
		return "dripicon-warning";
	}
	else if (level == "error"){
		return "dripicon-warning";
	}
	return "dripicon-information";
}
