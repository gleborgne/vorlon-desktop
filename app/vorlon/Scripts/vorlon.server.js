var redis = require("redis");
var socketio = require("socket.io");
var fs = require("fs");
var path = require("path");
var fakeredis = require("fakeredis");
var tools = require("./vorlon.tools");
var VORLON;
(function (VORLON) {
    var Server = (function () {
        function Server(context) {
            this.sessions = new Array();
            this.dashboards = new Array();
            this.baseURLConfig = context.baseURLConfig;
            this.httpConfig = context.httpConfig;
            this.redisConfig = context.redisConfig;
            this._log = context.logger;
            //Redis
            if (this.redisConfig.fackredis === true) {
                this._redisApi = fakeredis.createClient();
            }
            else {
                this._redisApi = redis.createClient(this.redisConfig._redisPort, this.redisConfig._redisMachine);
                this._redisApi.auth(this.redisConfig._redisPassword, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
        Server.prototype.addRoutes = function (app, passport) {
            var _this = this;
            app.get(this.baseURLConfig.baseURL + "/api/createsession", function (req, res) {
                _this.json(res, _this.guid());
            });
            app.get(this.baseURLConfig.baseURL + "/api/reset/:idSession", function (req, res) {
                var session = _this.sessions[req.params.idSession];
                if (session && session.connectedClients) {
                    for (var client in session.connectedClients) {
                        delete session.connectedClients[client];
                    }
                }
                delete _this.sessions[req.params.idSession];
                res.writeHead(200, {});
                res.end();
            });
            app.get(this.baseURLConfig.baseURL + "/api/getclients/:idSession", function (req, res) {
                var session = _this.sessions[req.params.idSession];
                var clients = new Array();
                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if (currentclient.opened) {
                            var name = tools.VORLON.Tools.GetOperatingSystem(currentclient.ua);
                            clients.push(currentclient.data);
                            nbClients++;
                        }
                    }
                    _this._log.debug("API : GetClients nb client " + nbClients + " in session " + req.params.idSession, { type: "API", session: req.params.idSession });
                }
                else {
                    _this._log.warn("API : No client in session " + req.params.idSession, { type: "API", session: req.params.idSession });
                }
                //Add header no-cache
                res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.header('Expires', '-1');
                res.header('Pragma', 'no-cache');
                _this.json(res, clients);
            });
            app.get(this.baseURLConfig.baseURL + "/api/range/:idsession/:idplugin/:from/:to", function (req, res) {
                _this._redisApi.lrange(req.params.idsession + req.params.idplugin, req.params.from, req.params.to, function (err, reply) {
                    _this._log.debug("API : Get Range data from : " + req.params.from + " to " + req.params.to + " = " + reply, { type: "API", session: req.params.idsession });
                    _this.json(res, reply);
                });
            });
            app.post(this.baseURLConfig.baseURL + "/api/push", function (req, res) {
                var receiveMessage = req.body;
                _this._log.debug("API : Receve data to log : " + JSON.stringify(req.body), { type: "API", session: receiveMessage._idsession });
                _this._redisApi.rpush([receiveMessage._idsession + receiveMessage.id, receiveMessage.message], function (err) {
                    if (err) {
                        _this._log.error("API : Error data log : " + err, { type: "API", session: receiveMessage._idsession });
                    }
                    else {
                        _this._log.debug("API : Push data ok", { type: "API", session: receiveMessage._idsession });
                    }
                });
                _this.json(res, {});
            });
            app.get(this.baseURLConfig.baseURL + "/vorlon.max.js/", function (req, res) {
                res.redirect("/vorlon.max.js/default");
            });
            app.get(this.baseURLConfig.baseURL + "/vorlon.max.js/:idsession", function (req, res) {
                _this._sendVorlonJSFile(false, req, res);
            });
            app.get(this.baseURLConfig.baseURL + "/vorlon.js", function (req, res) {
                res.redirect(_this.baseURLConfig.baseURL + "/vorlon.js/default");
            });
            app.get(this.baseURLConfig.baseURL + "/vorlon.js/:idsession", function (req, res) {
                _this._sendVorlonJSFile(true, req, res);
            });
            app.get(this.baseURLConfig.baseURL + "/vorlon.max.autostartdisabled.js", function (req, res) {
                _this._sendVorlonJSFile(false, req, res, false);
            });
            app.get(this.baseURLConfig.baseURL + "/vorlon.autostartdisabled.js", function (req, res) {
                _this._sendVorlonJSFile(true, req, res, false);
            });
            app.get(this.baseURLConfig.baseURL + "/config.json", function (req, res) {
                _this._sendConfigJson(req, res);
            });
        };
        Server.prototype._sendConfigJson = function (req, res) {
            var _this = this;
            fs.readFile(path.join(__dirname, "../config.json"), "utf8", function (err, catalogdata) {
                if (err) {
                    _this._log.error("ROUTE : Error reading config.json file");
                    return;
                }
                var catalog = JSON.parse(catalogdata.replace(/^\uFEFF/, ''));
                //remove auth data to not send username and password outside ;)
                if (catalog.activateAuth) {
                    delete catalog.activateAuth;
                }
                if (catalog.username) {
                    delete catalog.username;
                }
                if (catalog.password) {
                    delete catalog.password;
                }
                catalogdata = JSON.stringify(catalog);
                res.header('Content-Type', 'application/json');
                res.send(catalogdata);
            });
        };
        Server.prototype._sendVorlonJSFile = function (ismin, req, res, autostart) {
            var _this = this;
            if (autostart === void 0) { autostart = true; }
            //Read Socket.io file
            var javascriptFile;
            fs.readFile(path.join(__dirname, "../config.json"), "utf8", function (err, catalogdata) {
                if (err) {
                    _this._log.error("ROUTE : Error reading config.json");
                    return;
                }
                var configstring = catalogdata.toString().replace(/^\uFEFF/, '');
                var baseUrl = _this.baseURLConfig.baseURL;
                var catalog = JSON.parse(configstring);
                var vorlonpluginfiles = "";
                var javascriptFile = "";
                javascriptFile += 'var vorlonBaseURL="' + baseUrl + '";\n';
                //read the socket.io file if needed
                if (catalog.includeSocketIO) {
                    javascriptFile += fs.readFileSync(path.join(__dirname, "../public/javascripts/socket.io-1.3.6.js"));
                }
                if (ismin) {
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.js"));
                }
                else {
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.max.js"));
                }
                for (var pluginid = 0; pluginid < catalog.plugins.length; pluginid++) {
                    var plugin = catalog.plugins[pluginid];
                    if (plugin && plugin.enabled) {
                        //Read Vorlon.js file
                        if (ismin) {
                            vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".client.min.js"));
                        }
                        else {
                            vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".client.js"));
                        }
                    }
                }
                vorlonpluginfiles = vorlonpluginfiles.replace('"vorlon/plugins"', '"' + _this.httpConfig.protocol + '://' + req.headers.host + baseUrl + '/vorlon/plugins"');
                javascriptFile += "\r" + vorlonpluginfiles;
                if (autostart) {
                    javascriptFile += "\r (function() { VORLON.Core.StartClientSide('" + _this.httpConfig.protocol + "://" + req.headers.host + "/', '" + req.params.idsession + "'); }());";
                }
                res.header('Content-Type', 'application/javascript');
                res.send(javascriptFile);
            });
        };
        Server.prototype.start = function (httpServer) {
            var _this = this;
            //SOCKET.IO
            var io = socketio(httpServer);
            this._io = io;
            //Redis
            if (this.redisConfig.fackredis === false) {
                var pub = redis.createClient(this.redisConfig._redisPort, this.redisConfig._redisMachine);
                pub.auth(this.redisConfig._redisPassword);
                var sub = redis.createClient(this.redisConfig._redisPort, this.redisConfig._redisMachine);
                sub.auth(this.redisConfig._redisPassword);
                var socketredis = require("socket.io-redis");
                io.adapter(socketredis({ pubClient: pub, subClient: sub }));
            }
            //Listen on /
            io.on("connection", function (socket) {
                _this.addClient(socket);
            });
            //Listen on /dashboard
            var dashboardio = io
                .of("/dashboard")
                .on("connection", function (socket) {
                _this.addDashboard(socket);
            });
        };
        Object.defineProperty(Server.prototype, "io", {
            get: function () {
                return this._io;
            },
            set: function (io) {
                this._io = io;
            },
            enumerable: true,
            configurable: true
        });
        Server.prototype.guid = function () {
            return "xxxxxxxx".replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        Server.prototype.json = function (res, data) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            if (typeof data === "string")
                res.write(data);
            else
                res.write(JSON.stringify(data));
            res.end();
        };
        Server.prototype.addClient = function (socket) {
            var _this = this;
            socket.on("helo", function (message) {
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var data = receiveMessage.data;
                var session = _this.sessions[metadata.sessionId];
                if (session == null) {
                    session = new Session();
                    _this.sessions[metadata.sessionId] = session;
                }
                var client = session.connectedClients[metadata.clientId];
                var dashboard = _this.dashboards[metadata.sessionId];
                if (client == undefined) {
                    var client = new Client(metadata.clientId, data.ua, socket, ++session.nbClients);
                    session.connectedClients[metadata.clientId] = client;
                    _this._log.debug(formatLog("PLUGIN", "Send Add Client to dashboard (" + client.displayId + ")[" + data.ua + "] socketid = " + socket.id, receiveMessage));
                    if (dashboard != undefined) {
                        dashboard.emit("addclient", client.data);
                    }
                    _this._log.debug(formatLog("PLUGIN", "New client (" + client.displayId + ")[" + data.ua + "] socketid = " + socket.id, receiveMessage));
                }
                else {
                    client.socket = socket;
                    client.opened = true;
                    if (dashboard != undefined) {
                        dashboard.emit("addclient", client.data);
                    }
                    _this._log.debug(formatLog("PLUGIN", "Client Reconnect (" + client.displayId + ")[" + data.ua + "] socketid=" + socket.id, receiveMessage));
                }
                _this._log.debug(formatLog("PLUGIN", "Number clients in session : " + (session.nbClients + 1), receiveMessage));
                //If dashboard already connected to this socket send "helo" else wait
                if ((metadata.clientId != "") && (metadata.clientId == session.currentClientId)) {
                    _this._log.debug(formatLog("PLUGIN", "Send helo to client to open socket : " + metadata.clientId, receiveMessage));
                }
                else {
                    _this._log.debug(formatLog("PLUGIN", "New client (" + client.displayId + ") wait...", receiveMessage));
                }
            });
            socket.on("message", function (message) {
                //this._log.warn("CLIENT message " + message);
                var receiveMessage = JSON.parse(message);
                var dashboard = _this.dashboards[receiveMessage.metadata.sessionId];
                if (dashboard != null) {
                    var session = _this.sessions[receiveMessage.metadata.sessionId];
                    if (receiveMessage.metadata.clientId === "") {
                    }
                    else {
                        //Send message if _clientID = clientID selected by dashboard
                        if (session && receiveMessage.metadata.clientId === session.currentClientId) {
                            dashboard.emit("message", message);
                            _this._log.debug(formatLog("PLUGIN", "PLUGIN=>DASHBOARD", receiveMessage));
                        }
                        else {
                            _this._log.error(formatLog("PLUGIN", "must be disconnected", receiveMessage));
                        }
                    }
                }
                else {
                    _this._log.error(formatLog("PLUGIN", "no dashboard found", receiveMessage));
                }
            });
            socket.on("clientclosed", function (message) {
                //this._log.warn("CLIENT clientclosed " + message);
                var receiveMessage = JSON.parse(message);
                for (var session in _this.sessions) {
                    for (var client in _this.sessions[session].connectedClients) {
                        if (receiveMessage.data.socketid === _this.sessions[session].connectedClients[client].socket.id) {
                            _this.sessions[session].connectedClients[client].opened = false;
                            if (_this.dashboards[session]) {
                                _this._log.debug(formatLog("PLUGIN", "Send RemoveClient to Dashboard " + socket.id, receiveMessage));
                                _this.dashboards[session].emit("removeclient", _this.sessions[session].connectedClients[client].data);
                            }
                            else {
                                _this._log.debug(formatLog("PLUGIN", "NOT sending RefreshClients, no Dashboard " + socket.id, receiveMessage));
                            }
                            _this._log.debug(formatLog("PLUGIN", "Client Close " + socket.id, receiveMessage));
                        }
                    }
                }
            });
        };
        Server.prototype.addDashboard = function (socket) {
            var _this = this;
            socket.on("helo", function (message) {
                //this._log.warn("DASHBOARD helo " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var dashboard = _this.dashboards[metadata.sessionId];
                if (dashboard == null) {
                    _this._log.debug(formatLog("DASHBOARD", "New Dashboard", receiveMessage));
                }
                else {
                    _this._log.debug(formatLog("DASHBOARD", "Reconnect", receiveMessage));
                }
                _this.dashboards[metadata.sessionId] = socket;
                dashboard = socket;
                //if client listen by dashboard send helo to selected client
                if (metadata.listenClientId !== "") {
                    _this._log.debug(formatLog("DASHBOARD", "Client selected for :" + metadata.listenClientId, receiveMessage));
                    var session = _this.sessions[metadata.sessionId];
                    if (session != undefined) {
                        _this._log.debug(formatLog("DASHBOARD", "Change currentClient " + metadata.clientId, receiveMessage));
                        session.currentClientId = metadata.listenClientId;
                        for (var clientId in session.connectedClients) {
                            var client = session.connectedClients[clientId];
                            if (client.clientId === metadata.listenClientId) {
                                if (client.socket != null) {
                                    _this._log.debug(formatLog("DASHBOARD", "Send helo to socketid :" + client.socket.id, receiveMessage));
                                    client.socket.emit("helo", metadata.listenClientId);
                                }
                            }
                            else {
                                _this._log.debug(formatLog("DASHBOARD", "Wait for socketid (" + client.socket.id + ")", receiveMessage));
                            }
                        }
                        //Send Helo to DashBoard
                        _this._log.debug(formatLog("DASHBOARD", "Send helo to Dashboard", receiveMessage));
                        socket.emit("helo", metadata.listenClientId);
                    }
                }
                else {
                    _this._log.debug(formatLog("DASHBOARD", "No client selected for this dashboard"));
                }
            });
            socket.on("reload", function (message) {
                //this._log.warn("DASHBOARD reload " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                //if client listen by dashboard send reload to selected client
                if (metadata.listenClientId !== "") {
                    _this._log.debug(formatLog("DASHBOARD", "Client selected for :" + metadata.listenClientId, receiveMessage));
                    var session = _this.sessions[metadata.sessionId];
                    if (session != undefined) {
                        _this._log.debug(formatLog("DASHBOARD", "Change currentClient " + metadata.clientId, receiveMessage));
                        session.currentClientId = metadata.listenClientId;
                        for (var clientId in session.connectedClients) {
                            var client = session.connectedClients[clientId];
                            if (client.clientId === metadata.listenClientId) {
                                if (client.socket != null) {
                                    _this._log.debug(formatLog("DASHBOARD", "Send reload to socketid :" + client.socket.id, receiveMessage));
                                    client.socket.emit("reload", metadata.listenClientId);
                                }
                            }
                            else {
                                _this._log.debug(formatLog("DASHBOARD", "Wait for socketid (" + client.socket.id + ")", receiveMessage));
                            }
                        }
                    }
                }
                else {
                    _this._log.debug(formatLog("DASHBOARD", "No client selected for this dashboard"));
                }
            });
            socket.on("protocol", function (message) {
                //this._log.warn("DASHBOARD protocol " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var dashboard = _this.dashboards[metadata.sessionId];
                if (dashboard == null) {
                    _this._log.error(formatLog("DASHBOARD", "No Dashboard to send message", receiveMessage));
                }
                else {
                    dashboard.emit("message", message);
                    _this._log.debug(formatLog("DASHBOARD", "Dashboard send message", receiveMessage));
                }
            });
            socket.on("identify", function (message) {
                //this._log.warn("DASHBOARD identify " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                _this._log.debug(formatLog("DASHBOARD", "Identify clients", receiveMessage));
                var session = _this.sessions[metadata.sessionId];
                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if (currentclient.opened) {
                            currentclient.socket.emit("identify", currentclient.displayId);
                            _this._log.debug(formatLog("DASHBOARD", "Dashboard send identify " + currentclient.displayId + " to socketid : " + currentclient.socket.id, receiveMessage));
                            nbClients++;
                        }
                    }
                    _this._log.debug(formatLog("DASHBOARD", "Send " + session.nbClients + " identify(s)", receiveMessage));
                }
                else {
                    _this._log.error(formatLog("DASHBOARD", " No client to identify...", receiveMessage));
                }
            });
            socket.on("message", function (message) {
                //this._log.warn("DASHBOARD message " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var arrayClients = _this.sessions[metadata.sessionId];
                if (arrayClients != null) {
                    for (var clientId in arrayClients.connectedClients) {
                        var client = arrayClients.connectedClients[clientId];
                        if (metadata.listenClientId === client.clientId) {
                            client.socket.emit("message", message);
                            _this._log.debug(formatLog("DASHBOARD", "DASHBOARD=>PLUGIN", receiveMessage));
                        }
                    }
                }
                else {
                    _this._log.error(formatLog("DASHBOARD", "No client for message", receiveMessage));
                }
            });
            socket.on("disconnect", function (message) {
                //this._log.warn("DASHBOARD disconnect " + message);          
                //Delete dashboard session
                for (var dashboard in _this.dashboards) {
                    if (_this.dashboards[dashboard].id === socket.id) {
                        delete _this.dashboards[dashboard];
                        _this._log.debug(formatLog("DASHBOARD", "Delete dashboard " + dashboard + " socket " + socket.id));
                    }
                }
                //Send disconnect to all client
                for (var session in _this.sessions) {
                    for (var client in _this.sessions[session].connectedClients) {
                        _this.sessions[session].connectedClients[client].socket.emit("stoplisten");
                    }
                }
            });
        };
        return Server;
    })();
    VORLON.Server = Server;
    var Session = (function () {
        function Session() {
            this.currentClientId = "";
            this.nbClients = -1;
            this.connectedClients = new Array();
        }
        return Session;
    })();
    VORLON.Session = Session;
    var Client = (function () {
        function Client(clientId, ua, socket, displayId, opened) {
            if (opened === void 0) { opened = true; }
            this.clientId = clientId;
            this.ua = ua;
            this.socket = socket;
            this.displayId = displayId;
            this.opened = opened;
        }
        Object.defineProperty(Client.prototype, "data", {
            get: function () {
                return { "clientid": this.clientId, "displayid": this.displayId, "ua": this.ua, "name": tools.VORLON.Tools.GetOperatingSystem(this.ua) };
            },
            enumerable: true,
            configurable: true
        });
        return Client;
    })();
    VORLON.Client = Client;
    function formatLog(type, message, vmessage) {
        var buffer = [];
        buffer.push(type);
        if (type.length < 10) {
            for (var i = type.length; i < 10; i++) {
                buffer.push(" ");
            }
        }
        buffer.push(" : ");
        if (vmessage) {
            if (vmessage.metadata && vmessage.metadata.sessionId)
                buffer.push(vmessage.metadata.sessionId + " ");
        }
        if (message)
            buffer.push(message + " ");
        if (vmessage) {
            if (vmessage.metadata) {
                if (vmessage.metadata.pluginID) {
                    buffer.push(vmessage.metadata.pluginID);
                    if (vmessage.command)
                        buffer.push(":" + vmessage.command);
                    buffer.push(" ");
                }
                if (vmessage.metadata.clientId) {
                    buffer.push(vmessage.metadata.clientId);
                }
            }
        }
        return buffer.join("");
    }
})(VORLON = exports.VORLON || (exports.VORLON = {}));
