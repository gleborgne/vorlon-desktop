/// <reference path="../Scripts/typings/vorlon/vorlon.core.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.clientMessenger.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.plugin.d.ts" /> 
var VORLON;
(function (VORLON) {
    var DashboardManager = (function () {
        function DashboardManager(sessionid, listenClientid) {
            //Dashboard session id
            DashboardManager.SessionId = sessionid;
            DashboardManager.PluginsLoaded = false;
            DashboardManager.DisplayingClient = false;
            //Client ID
            DashboardManager.ListenClientid = listenClientid;
            DashboardManager.ClientList = new Array();
            DashboardManager.StartListeningServer();
            DashboardManager.GetClients();
            DashboardManager.CatalogUrl = vorlonBaseURL + "/config.json";
        }
        DashboardManager.StartListeningServer = function (clientid) {
            if (clientid === void 0) { clientid = ""; }
            var getUrl = window.location;
            var baseUrl = getUrl.protocol + "//" + getUrl.host;
            VORLON.Core.StopListening();
            VORLON.Core.StartDashboardSide(baseUrl, DashboardManager.SessionId, clientid, DashboardManager.divMapper);
            if (!VORLON.Core.Messenger.onAddClient && !VORLON.Core.Messenger.onAddClient) {
                VORLON.Core.Messenger.onAddClient = DashboardManager.addClient;
                VORLON.Core.Messenger.onRemoveClient = DashboardManager.removeClient;
            }
            if (clientid !== "") {
                DashboardManager.DisplayingClient = true;
            }
            else {
                DashboardManager.DisplayingClient = false;
            }
        };
        DashboardManager.GetClients = function () {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        //Init ClientList Object
                        DashboardManager.ClientList = new Array();
                        document.getElementById('test').style.visibility = 'hidden';
                        //Loading client list 
                        var clients = JSON.parse(xhr.responseText);
                        //Test if the client to display is in the list
                        var contains = false;
                        if (clients && clients.length) {
                            for (var j = 0; j < clients.length; j++) {
                                if (clients[j].clientid === DashboardManager.ListenClientid) {
                                    contains = true;
                                    break;
                                }
                            }
                        }
                        //Get the client list placeholder
                        var divClientsListPane = document.getElementById("clientsListPaneContent");
                        //Create the new empty list
                        var clientlist = document.createElement("ul");
                        clientlist.setAttribute("id", "clientsListPaneContentList");
                        divClientsListPane.appendChild(clientlist);
                        //Show waiting logo 
                        if (!contains || clients.length === 0) {
                            var elt = document.querySelector('.dashboard-plugins-overlay');
                            VORLON.Tools.RemoveClass(elt, 'hidden');
                        }
                        for (var i = 0; i < clients.length; i++) {
                            var client = clients[i];
                            DashboardManager.AddClientToList(client);
                        }
                        if (contains) {
                            DashboardManager.loadPlugins();
                        }
                    }
                }
            };
            xhr.open("GET", vorlonBaseURL + "/api/getclients/" + DashboardManager.SessionId);
            xhr.send();
        };
        DashboardManager.AddClientToList = function (client) {
            var clientlist = document.getElementById("clientsListPaneContentList");
            if (DashboardManager.ListenClientid === "") {
                DashboardManager.ListenClientid = client.clientid;
            }
            var pluginlistelement = document.createElement("li");
            pluginlistelement.classList.add('client');
            pluginlistelement.id = client.clientid;
            if (client.clientid === DashboardManager.ListenClientid) {
                pluginlistelement.classList.add('active');
            }
            clientlist.appendChild(pluginlistelement);
            var pluginlistelementa = document.createElement("a");
            pluginlistelementa.textContent = " " + client.name + " - " + client.displayid;
            pluginlistelementa.setAttribute("href", vorlonBaseURL + "/dashboard/" + DashboardManager.SessionId + "/" + client.clientid);
            pluginlistelement.appendChild(pluginlistelementa);
            DashboardManager.ClientList.push(client);
        };
        DashboardManager.UpdateClientInfo = function () {
            document.querySelector('[data-hook~=session-id]').textContent = DashboardManager.SessionId;
            for (var i = 0; i < DashboardManager.ClientList.length; i++) {
                if (DashboardManager.ClientList[i].clientid === DashboardManager.ListenClientid) {
                    DashboardManager.ListenClientDisplayid = DashboardManager.ClientList[i].displayid;
                }
            }
            document.querySelector('[data-hook~=client-id]').textContent = DashboardManager.ListenClientDisplayid;
        };
        DashboardManager.DisplayWaitingLogo = function () {
            //Hide waiting page and let's bounce the logo !
            var elt = document.querySelector('.dashboard-plugins-overlay');
            VORLON.Tools.RemoveClass(elt, 'hidden');
        };
        DashboardManager.DisplayBouncingLogo = function () {
            //Hide waiting page and let's bounce the logo !
            var elt = document.querySelector('.dashboard-plugins-overlay');
            VORLON.Tools.RemoveClass(elt, 'hidden');
            VORLON.Tools.AddClass(elt, 'bounce');
        };
        DashboardManager.loadPlugins = function () {
            var _this = this;
            if (DashboardManager.ListenClientid === "") {
                return;
            }
            if (this.PluginsLoaded) {
                DashboardManager.StartListeningServer(DashboardManager.ListenClientid);
                return;
            }
            var xhr = new XMLHttpRequest();
            var divPluginsBottom = document.getElementById("pluginsPaneBottom");
            var divPluginsTop = document.getElementById("pluginsPaneTop");
            var divPluginBottomTabs = document.getElementById("pluginsListPaneBottom");
            var divPluginTopTabs = document.getElementById("pluginsListPaneTop");
            var coreLoaded = false;
            //Hide waiting page and let's bounce the logo !
            DashboardManager.DisplayBouncingLogo();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var catalog;
                        try {
                            catalog = JSON.parse(xhr.responseText);
                        }
                        catch (ex) {
                            throw new Error("The catalog JSON is not well-formed");
                        }
                        var pluginLoaded = 0;
                        var pluginstoload = 0;
                        //Cleaning unwanted plugins
                        for (var i = 0; i < catalog.plugins.length; i++) {
                            if (catalog.plugins[i].enabled) {
                                pluginstoload++;
                            }
                        }
                        for (var i = 0; i < catalog.plugins.length; i++) {
                            var plugin = catalog.plugins[i];
                            if (!plugin.enabled) {
                                continue;
                            }
                            var existingLocation = document.querySelector('[data-plugin=' + plugin.id + ']');
                            if (!existingLocation) {
                                var pluginmaindiv = document.createElement('div');
                                pluginmaindiv.classList.add('plugin');
                                pluginmaindiv.classList.add('plugin-' + plugin.id.toLowerCase());
                                pluginmaindiv.setAttribute('data-plugin', plugin.id);
                                var plugintab = document.createElement('div');
                                plugintab.classList.add('tab');
                                plugintab.textContent = plugin.name;
                                plugintab.setAttribute('data-plugin-target', plugin.id);
                                if (plugin.panel === "bottom") {
                                    if (divPluginsBottom.children.length === 1) {
                                        pluginmaindiv.classList.add("active");
                                    }
                                    divPluginsBottom.appendChild(pluginmaindiv);
                                    divPluginBottomTabs.appendChild(plugintab);
                                }
                                else {
                                    if (divPluginsTop.children.length === 1) {
                                        pluginmaindiv.classList.add("active");
                                    }
                                    divPluginsTop.appendChild(pluginmaindiv);
                                    divPluginTopTabs.appendChild(plugintab);
                                }
                            }
                            var pluginscript = document.createElement("script");
                            pluginscript.setAttribute("src", vorlonBaseURL + "/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".dashboard.min.js");
                            pluginscript.onload = function (oError) {
                                pluginLoaded++;
                                if (pluginLoaded >= pluginstoload) {
                                    DashboardManager.StartListeningServer(DashboardManager.ListenClientid);
                                    coreLoaded = true;
                                    _this.PluginsLoaded = true;
                                }
                            };
                            document.body.appendChild(pluginscript);
                        }
                        var addPluginBtn = document.createElement('div');
                        addPluginBtn.className = "tab";
                        addPluginBtn.innerText = "+";
                        divPluginTopTabs.appendChild(addPluginBtn);
                        addPluginBtn.addEventListener('click', function () {
                            window.open("http://www.vorlonjs.io/plugins", "_blank");
                        });
                        var collaspseBtn = document.createElement('div');
                        collaspseBtn.className = "fa fa-expand expandBtn";
                        divPluginBottomTabs.appendChild(collaspseBtn);
                        collaspseBtn.addEventListener('click', function () {
                            divPluginsBottom.style.height = 'calc(100% - 58px)';
                            divPluginsTop.style.height = '50px';
                            $('.hsplitter', divPluginsTop.parentElement).css('top', '50px');
                        });
                        var collaspseTopBtn = document.createElement('div');
                        collaspseTopBtn.className = "fa fa-expand expandBtn";
                        divPluginTopTabs.appendChild(collaspseTopBtn);
                        collaspseTopBtn.addEventListener('click', function () {
                            divPluginsBottom.style.height = '50px';
                            divPluginsTop.style.height = 'calc(100% - 58px)';
                            $('.hsplitter', divPluginsTop.parentElement).css('top', 'calc(100% - 58px)');
                        });
                        DashboardManager.UpdateClientInfo();
                    }
                }
            };
            xhr.open("GET", DashboardManager.CatalogUrl);
            xhr.send();
        };
        DashboardManager.divMapper = function (pluginId) {
            var divId = pluginId + "div";
            return (document.getElementById(divId) || document.querySelector("[data-plugin=" + pluginId + "]"));
        };
        DashboardManager.prototype.identify = function () {
            VORLON.Core.Messenger.sendRealtimeMessage("", { "_sessionid": DashboardManager.SessionId }, VORLON.RuntimeSide.Dashboard, "identify");
        };
        DashboardManager.ResetDashboard = function (reload) {
            if (reload === void 0) { reload = true; }
            var sessionid = DashboardManager.SessionId;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (reload) {
                            location.reload();
                        }
                    }
                }
            };
            xhr.open("GET", vorlonBaseURL + "/api/reset/" + sessionid);
            xhr.send();
        };
        DashboardManager.ReloadClient = function () {
            VORLON.Core.Messenger.sendRealtimeMessage("", DashboardManager.ListenClientid, VORLON.RuntimeSide.Dashboard, "reload");
        };
        DashboardManager.addClient = function (client) {
            DashboardManager.AddClientToList(client);
            if (!DashboardManager.DisplayingClient) {
                DashboardManager.loadPlugins();
            }
        };
        DashboardManager.removeClient = function (client) {
            var clientInList = document.getElementById(client.clientid);
            if (clientInList) {
                if (client.clientid === DashboardManager.ListenClientid) {
                    DashboardManager.ListenClientid = "";
                    DashboardManager.StartListeningServer();
                    DashboardManager.DisplayWaitingLogo();
                }
                clientInList.parentElement.removeChild(clientInList);
                DashboardManager.removeInClientList(client);
                if (DashboardManager.ClientList.length === 0) {
                    DashboardManager.ResetDashboard(false);
                }
            }
        };
        DashboardManager.removeInClientList = function (client) {
            for (var j = 0; j < DashboardManager.ClientList.length; j++) {
                if (DashboardManager.ClientList[j].clientid === client.clientid) {
                    DashboardManager.ClientList.splice(j, 1);
                }
            }
        };
        DashboardManager.getSessionId = function () {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var sessionId = xhr.responseText;
                        window.location.assign(vorlonBaseURL + "/dashboard/" + sessionId);
                    }
                }
            };
            xhr.open("GET", vorlonBaseURL + "/api/createsession");
            xhr.send();
        };
        return DashboardManager;
    })();
    VORLON.DashboardManager = DashboardManager;
})(VORLON || (VORLON = {}));
