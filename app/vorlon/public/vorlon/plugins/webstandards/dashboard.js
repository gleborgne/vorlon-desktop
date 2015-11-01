var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var _webstandardsRefreshLoop;
    var rulesLabels = {
        "webstandards": "Web standards",
        "accessibility": "Accessibility",
        "performances": "Performances",
        "mobileweb": "Mobile web",
    };
    var WebStandardsDashboard = (function (_super) {
        __extends(WebStandardsDashboard, _super);
        function WebStandardsDashboard() {
            _super.call(this, "webstandards", "control.html", "control.css");
            this._currentAnalyze = null;
            this._rulesPanel = null;
            this._ruleDetailPanel = null;
            this.analyzeCssFallback = true;
            this._id = "WEBSTANDARDS";
            //this.debug = true;
            this._ready = true;
        }
        WebStandardsDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            var script = document.createElement("SCRIPT");
            script.src = "/javascripts/css.js";
            document.body.appendChild(script);
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._ruleDetailPanel = new WebStandardsRuleDetailPanel(_this, filledDiv.querySelector('#webstandards-ruledetailpanel'));
                _this._rulesPanel = new WebStandardsRulesPanel(_this, filledDiv.querySelector('#webstandards-rulespanel'), _this._ruleDetailPanel);
                _this._startCheckButton = filledDiv.querySelector('#startCheck');
                _this._cancelCheckButton = filledDiv.querySelector('#cancelCheck');
                _this._rootDiv = filledDiv;
                _this._startCheckButton.addEventListener("click", function (evt) {
                    _this._startCheckButton.disabled = true;
                    _this._cancelCheckButton.disabled = false;
                    _this._currentAnalyze = {
                        processing: true,
                        id: VORLON.Tools.CreateGUID()
                    };
                    _this._rootDiv.classList.add("loading");
                    _this._rulesPanel.clear("analyze in progress...");
                    _this.sendCommandToClient('startNewAnalyze', { id: _this._currentAnalyze.id, analyzeCssFallback: _this.analyzeCssFallback });
                });
                _this._cancelCheckButton.addEventListener("click", function (evt) {
                    _this._startCheckButton.disabled = false;
                    _this._cancelCheckButton.disabled = true;
                    _this._currentAnalyze.processing = false;
                    _this._currentAnalyze.canceled = true;
                    _this._rootDiv.classList.remove("loading");
                    _this._rulesPanel.clear("retry by clicking on start button");
                });
                clearInterval(_webstandardsRefreshLoop);
                _webstandardsRefreshLoop = setInterval(function () {
                    _this.checkLoadingState();
                }, 3000);
            });
        };
        WebStandardsDashboard.prototype.checkLoadingState = function () {
            if (this._currentAnalyze && this._currentAnalyze.pendingLoad <= 0) {
                this.trace("resource load completed");
                this._currentAnalyze.processing = false;
            }
            if (!this._currentAnalyze || this._currentAnalyze.ended || this._currentAnalyze.canceled) {
                return;
            }
            if (this._currentAnalyze.processing) {
            }
            else {
                this.endAnalyze(this._currentAnalyze);
                this._rootDiv.classList.remove("loading");
                this._currentAnalyze.ended = true;
                this._ruleDetailPanel.setMessage("click on a rule in the result panel to show details");
                this._rulesPanel.setRules(this._currentAnalyze);
                this._startCheckButton.disabled = false;
                this._cancelCheckButton.disabled = true;
            }
        };
        WebStandardsDashboard.prototype.receiveHtmlContent = function (data) {
            if (!this._currentAnalyze) {
                this._currentAnalyze = { processing: true };
            }
            if (!this._currentAnalyze.files) {
                this._currentAnalyze.files = {};
            }
            this._currentAnalyze.lastActivity = new Date();
            this._currentAnalyze.html = data.html;
            this._currentAnalyze.doctype = data.doctype;
            this._currentAnalyze.location = data.url;
            this._currentAnalyze.browserDetection = data.browserDetection;
            var fragment = document.implementation.createHTMLDocument("analyze");
            fragment.documentElement.innerHTML = data.html;
            this._currentAnalyze.pendingLoad = 0;
            this._currentAnalyze.files.scripts = {};
            var scripts = fragment.querySelectorAll("script");
            var nbScripts = scripts.length;
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src && src.value) {
                    var isVorlon = src.value.indexOf('vorlon.js') > 0 || src.value.indexOf('vorlon.min.js') > 0 || src.value.indexOf('vorlon.max.js') > 0;
                    if (!isVorlon) {
                        this._currentAnalyze.files.scripts[src.value] = { loaded: false, content: null };
                        this.sendCommandToClient('fetchDocument', { url: src.value, id: this._currentAnalyze.id, type: "script" });
                        this._currentAnalyze.pendingLoad++;
                        this.trace("request file " + src.value + " " + this._currentAnalyze.pendingLoad);
                    }
                }
            }
            this._currentAnalyze.files.stylesheets = {};
            var stylesheets = fragment.querySelectorAll("link[rel=stylesheet]");
            var nbStylesheets = stylesheets.length;
            for (var i = 0; i < stylesheets.length; i++) {
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href) {
                    this._currentAnalyze.files.stylesheets[href.value] = { loaded: false, content: null };
                    this.sendCommandToClient('fetchDocument', { url: href.value, id: this._currentAnalyze.id, type: "stylesheet", analyzeCssFallback: this.analyzeCssFallback });
                    this._currentAnalyze.pendingLoad++;
                    this.trace("request file " + href.value + " " + this._currentAnalyze.pendingLoad);
                }
            }
            if (!this._currentAnalyze.fallBackErrorList)
                this._currentAnalyze.fallBackErrorList = [];
            if (data.stylesheetErrors)
                this._currentAnalyze.fallBackErrorList.push(data.stylesheetErrors);
            this._currentAnalyze.results = {};
            this.prepareAnalyze(this._currentAnalyze);
            this.analyzeDOM(fragment, data.html, this._currentAnalyze);
        };
        WebStandardsDashboard.prototype.receiveDocumentContent = function (data) {
            var item = null;
            var itemContainer = null;
            this._currentAnalyze.lastActivity = new Date();
            for (var n in this._currentAnalyze.files) {
                var container = this._currentAnalyze.files[n];
                if (container[data.url]) {
                    item = container[data.url];
                    itemContainer = n;
                }
            }
            if (item) {
                this._currentAnalyze.pendingLoad--;
                item.loaded = true;
                item.encoding = data.encoding;
                item.content = data.content;
                item.contentLength = data.contentLength;
                item.error = data.error;
                item.status = data.status;
                if (data.error) {
                    item.loaded = false;
                }
            }
            if (itemContainer === "stylesheets") {
                if (this.analyzeCssFallback) {
                    if (!this._currentAnalyze.fallBackErrorList)
                        this._currentAnalyze.fallBackErrorList = [];
                    if (data.stylesheetErrors)
                        this._currentAnalyze.fallBackErrorList.push(data.stylesheetErrors);
                }
                else {
                    this._currentAnalyze.fallBackErrorList = null;
                }
                this.analyzeCssDocument(data.url, data.content, this._currentAnalyze);
            }
            if (itemContainer === "scripts") {
                this.analyzeJsDocument(data.url, data.content, this._currentAnalyze);
            }
            this.trace("receive content " + data.url + " " + this._currentAnalyze.pendingLoad);
        };
        WebStandardsDashboard.prototype.analyzeDOM = function (document, htmlContent, analyze) {
            var _this = this;
            var generalRules = [];
            var commonRules = [];
            var rules = {
                domRulesIndex: {},
                domRulesForAllNodes: []
            };
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = VORLON.WebStandards.Rules.DOM[n];
                if (rule) {
                    var rulecheck = this.initialiseRuleSummary(rule, analyze);
                    if (rule.prepare) {
                        rule.prepare(rulecheck, analyze, htmlContent);
                    }
                    if (rule.generalRule) {
                        generalRules.push(rule);
                    }
                    else {
                        commonRules.push(rule);
                        if (rule.nodeTypes.length) {
                            rule.nodeTypes.forEach(function (n) {
                                n = n.toUpperCase();
                                if (!rules.domRulesIndex[n])
                                    rules.domRulesIndex[n] = [];
                                rules.domRulesIndex[n].push(rule);
                            });
                        }
                        else {
                            rules.domRulesForAllNodes.push(rule);
                        }
                    }
                }
            }
            this.analyzeDOMNode(document, rules, analyze, htmlContent);
            generalRules.forEach(function (rule) {
                _this.applyDOMNodeRule(document, rule, analyze, htmlContent);
            });
        };
        WebStandardsDashboard.prototype.analyzeDOMNode = function (node, rules, analyze, htmlContent) {
            var _this = this;
            if (node.nodeName === "STYLE") {
                this.analyzeCssDocument("inline", node.innerHTML, analyze);
            }
            if (node.nodeName === "SCRIPT") {
                var domnode = node;
                var scriptType = domnode.getAttribute("type");
                var hasContent = domnode.innerHTML.trim().length > 0;
                if (!scriptType || scriptType == "text/javascript" && hasContent) {
                    this.analyzeJsDocument("inline", domnode.innerHTML, analyze);
                }
            }
            var specificRules = rules.domRulesIndex[node.nodeName.toUpperCase()];
            if (specificRules && specificRules.length) {
                specificRules.forEach(function (r) {
                    _this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }
            if (rules.domRulesForAllNodes && rules.domRulesForAllNodes.length) {
                rules.domRulesForAllNodes.forEach(function (r) {
                    _this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }
            for (var i = 0, l = node.childNodes.length; i < l; i++) {
                this.analyzeDOMNode(node.childNodes[i], rules, analyze, htmlContent);
            }
        };
        WebStandardsDashboard.prototype.initialiseRuleSummary = function (rule, analyze) {
            var tokens = rule.id.split('.');
            var current = analyze.results;
            var id = "";
            current.rules = current.rules || {};
            tokens.forEach(function (t) {
                id = (id.length > 0) ? "." + t : t;
                if (!current.rules) {
                    current.rules = {};
                }
                if (!current.rules[t])
                    current.rules[t] = { id: id };
                current = current.rules[t];
            });
            if (current.failed === undefined) {
                current.failed = false;
                current.title = rule.title;
                current.description = rule.description;
            }
            return current;
        };
        WebStandardsDashboard.prototype.applyDOMNodeRule = function (node, rule, analyze, htmlContent) {
            var current = this.initialiseRuleSummary(rule, analyze);
            rule.check(node, current, analyze, htmlContent);
        };
        WebStandardsDashboard.prototype.analyzeCssDocument = function (url, content, analyze) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            this.trace("processing css " + url);
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var rule = VORLON.WebStandards.Rules.CSS[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, parsed, current, analyze);
                }
            }
        };
        WebStandardsDashboard.prototype.analyzeFiles = function (analyze) {
            for (var n in VORLON.WebStandards.Rules.Files) {
                var rule = VORLON.WebStandards.Rules.Files[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(current, analyze);
                }
            }
        };
        WebStandardsDashboard.prototype.analyzeJsDocument = function (url, content, analyze) {
            this.trace("processing script " + url);
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var rule = VORLON.WebStandards.Rules.JavaScript[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, content, current, analyze);
                }
            }
        };
        WebStandardsDashboard.prototype.prepareAnalyze = function (analyze) {
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.prepare)
                        cssrule.prepare(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.prepare)
                        scriptrule.prepare(current, analyze);
                }
            }
        };
        WebStandardsDashboard.prototype.endAnalyze = function (analyze) {
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = VORLON.WebStandards.Rules.DOM[n];
                if (rule && !rule.generalRule && rule.endcheck) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.endcheck(current, analyze, this._currentAnalyze.html);
                }
            }
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.endcheck)
                        cssrule.endcheck(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.endcheck)
                        scriptrule.endcheck(current, analyze);
                }
            }
            this.analyzeFiles(this._currentAnalyze);
        };
        return WebStandardsDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.WebStandardsDashboard = WebStandardsDashboard;
    WebStandardsDashboard.prototype.DashboardCommands = {
        htmlContent: function (data) {
            var plugin = this;
            plugin.receiveHtmlContent(data);
        },
        documentContent: function (data) {
            var plugin = this;
            plugin.receiveDocumentContent(data);
        }
    };
    //Register the plugin with vorlon core
    VORLON.Core.RegisterDashboardPlugin(new WebStandardsDashboard());
    var WebStandardsRulesPanel = (function () {
        function WebStandardsRulesPanel(plugin, element, detailpanel) {
            this.plugin = plugin;
            this.element = element;
            this.element.style.display = "none";
            this.detailpanel = detailpanel;
        }
        WebStandardsRulesPanel.prototype.clear = function (msg) {
            this.element.style.display = "none";
            this.detailpanel.clear(msg);
        };
        WebStandardsRulesPanel.prototype.setRules = function (analyze) {
            this.plugin.trace("RENDER ANALYZE");
            this.plugin.trace(analyze);
            this.element.style.display = "";
            this.element.innerHTML = "";
            this.renderRules(analyze.results.rules, this.element, 1);
        };
        WebStandardsRulesPanel.prototype.renderRules = function (rules, parent, level) {
            var _this = this;
            var items = [];
            for (var n in rules) {
                var rule = rules[n];
                //if (rule.rules || rule.failed){
                if (!rule.title) {
                    rule.title = rulesLabels[rule.id];
                }
                if (!rule.title) {
                    rule.title = n;
                }
                items.push(rule);
            }
            items.sort(function (a, b) {
                return a.title.localeCompare(b.title);
            });
            items.forEach(function (rule) {
                _this.renderRule(rule, parent, level);
            });
        };
        WebStandardsRulesPanel.prototype.renderRule = function (rule, parent, level) {
            var _this = this;
            var ruleitem = new VORLON.FluentDOM('DIV', 'rule level' + level, parent);
            ruleitem.append('DIV', 'title', function (title) {
                if (rule.failed !== undefined) {
                    title.createChild("SPAN", "state fa " + (rule.failed ? "fa-close" : "fa-check"));
                }
                title.createChild("SPAN").text(rule.title);
                if (rule.rules) {
                    title.click(function () {
                        ruleitem.toggleClass("collapsed");
                        ruleitem.toggleClass("expanded");
                    });
                }
                else {
                    title.click(function () {
                        if (_this.selectedRuleElt) {
                            _this.selectedRuleElt.classList.remove("selected");
                        }
                        ruleitem.element.classList.add("selected");
                        _this.selectedRuleElt = ruleitem.element;
                        _this.detailpanel.setRule(rule);
                    });
                }
            });
            if (rule.rules) {
                ruleitem.addClass("collapsible");
                ruleitem.addClass("collapsed");
                ruleitem.append('DIV', 'childs', function (childs) {
                    _this.renderRules(rule.rules, childs.element, level + 1);
                });
            }
        };
        return WebStandardsRulesPanel;
    })();
    var WebStandardsRuleDetailPanel = (function () {
        function WebStandardsRuleDetailPanel(plugin, element) {
            this.element = element;
            this.plugin = plugin;
        }
        WebStandardsRuleDetailPanel.prototype.setRule = function (rule) {
            var _this = this;
            this.element.innerHTML = "";
            var fluent = VORLON.FluentDOM.forElement(this.element);
            fluent.append("DIV", "ruledetailpanel-content", function (content) {
                content.append("DIV", "item", function (item) {
                    if (rule.type)
                        item.addClass(rule.type);
                    item.append("H1", "title", function (title) {
                        title.createChild("SPAN", "state fa " + (rule.failed ? "fa-close" : "fa-check"));
                        title.createChild("SPAN", "text").html(rule.title);
                    });
                    if (rule.description) {
                        item.append("DIV", "description", function (desc) {
                            desc.html(rule.description);
                        });
                    }
                    if (rule.items && rule.items.length) {
                        item.append("DIV", "items", function (itemselt) {
                            rule.items.forEach(function (item) {
                                _this.renderItem(item, itemselt);
                            });
                        });
                    }
                });
            });
        };
        WebStandardsRuleDetailPanel.prototype.renderItem = function (item, parent) {
            var _this = this;
            parent.append("DIV", "item", function (itemelt) {
                if (item.type) {
                    itemelt.addClass(item.type);
                }
                if (item.title && item.alert) {
                    itemelt.createChild("SPAN", "state fa " + (item.failed ? "fa-close" : "fa-check")).html(item.title);
                }
                else if (item.title) {
                    itemelt.createChild("DIV", "title").html(item.title);
                }
                if (item.message) {
                    itemelt.createChild("DIV", "message").html(item.message);
                }
                if (item.content) {
                    itemelt.createChild("DIV", "content").html(item.content);
                }
                if (item.items && item.items.length) {
                    itemelt.append("DIV", "items", function (itemselt) {
                        item.items.forEach(function (item) {
                            _this.renderItem(item, itemselt);
                        });
                    });
                }
            });
        };
        WebStandardsRuleDetailPanel.prototype.clear = function (msg) {
            this.setMessage(msg);
        };
        WebStandardsRuleDetailPanel.prototype.setMessage = function (msg) {
            this.element.innerHTML = '<div class="empty">' + msg + '</div>';
        };
        return WebStandardsRuleDetailPanel;
    })();
})(VORLON || (VORLON = {}));
