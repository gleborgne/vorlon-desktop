var os = require('os');
var ipc = require('ipc');
var $ = require('jquery');
var app = require('remote').require('app');

function ConsolePanel(element) {
	var panel = this;
	this.messagescontainer = document.getElementById('vorlonmessages');
	ipc.on("vorlonlog", (args) => {
		if (args.logs) {
			args.logs.forEach((log) => {
				this.appendLog(log);
			});
		}
	});

	ipc.on("vorlonStatus", (args) => {
        this.messagescontainer.innerHTML = "";
		if (args.messages) {
			args.messages.forEach((log) => {
				this.appendLog(log);
			});
		}
    });
}
module.exports.ConsolePanel = ConsolePanel


ConsolePanel.prototype.appendLog = function (log) {
    var e = document.createElement("DIV");
    e.className = "log log-" + log.level;
    e.innerText = JSON.stringify(log.args);
    this.messagescontainer.insertBefore(e, this.messagescontainer.firstChild);
}
