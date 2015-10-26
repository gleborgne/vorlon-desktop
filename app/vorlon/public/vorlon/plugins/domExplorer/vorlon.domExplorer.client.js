var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var DOMExplorerClient = (function (_super) {
        __extends(DOMExplorerClient, _super);
        function DOMExplorerClient() {
            _super.call(this, "domExplorer");
            this._internalId = 0;
            this._globalloadactive = false;
            this._id = "DOM";
            //this.debug = true;
            this._ready = false;
        }
        DOMExplorerClient.GetAppliedStyles = function (node) {
            // Style sheets
            var styleNode = new Array();
            var sheets = document.styleSheets;
            var style;
            var appliedStyles = new Array();
            var index;
            for (var c = 0; c < sheets.length; c++) {
                var rules = sheets[c].rules || sheets[c].cssRules;
                if (!rules) {
                    continue;
                }
                for (var r = 0; r < rules.length; r++) {
                    var rule = rules[r];
                    var selectorText = rule.selectorText;
                    try {
                        var matchedElts = document.querySelectorAll(selectorText);
                        for (index = 0; index < matchedElts.length; index++) {
                            var element = matchedElts[index];
                            style = rule.style;
                            if (element === node) {
                                for (var i = 0; i < style.length; i++) {
                                    if (appliedStyles.indexOf(style[i]) === -1) {
                                        appliedStyles.push(style[i]);
                                    }
                                }
                            }
                        }
                    }
                    catch (e) {
                    }
                }
            }
            // Local style
            style = node.style;
            if (style) {
                for (index = 0; index < style.length; index++) {
                    if (appliedStyles.indexOf(style[index]) === -1) {
                        appliedStyles.push(style[index]);
                    }
                }
            }
            // Get effective styles
            var winObject = document.defaultView || window;
            for (index = 0; index < appliedStyles.length; index++) {
                var appliedStyle = appliedStyles[index];
                if (winObject.getComputedStyle) {
                    styleNode.push(appliedStyle + ":" + winObject.getComputedStyle(node, "").getPropertyValue(appliedStyle));
                }
            }
            return styleNode;
        };
        DOMExplorerClient.prototype._packageNode = function (node) {
            if (!node)
                return;
            var packagedNode = {
                id: node.id,
                type: node.nodeType,
                name: node.localName,
                classes: node.className,
                content: null,
                hasChildNodes: false,
                attributes: node.attributes ? Array.prototype.map.call(node.attributes, function (attr) {
                    return [attr.name, attr.value];
                }) : [],
                //styles: DOMExplorerClient.GetAppliedStyles(node),
                children: [],
                isEmpty: false,
                rootHTML: null,
                internalId: VORLON.Tools.CreateGUID()
            };
            if (node.innerHTML === "") {
                packagedNode.isEmpty = true;
            }
            if (packagedNode.type == "3" || node.nodeName === "#comment") {
                if (node.nodeName === "#comment") {
                    packagedNode.name = "#comment";
                }
                packagedNode.content = node.textContent;
            }
            if (node.__vorlon && node.__vorlon.internalId) {
                packagedNode.internalId = node.__vorlon.internalId;
            }
            else {
                if (!node.__vorlon) {
                    node.__vorlon = {};
                }
                node.__vorlon.internalId = packagedNode.internalId;
            }
            return packagedNode;
        };
        DOMExplorerClient.prototype._packageDOM = function (root, packagedObject, withChildsNodes, highlightElementID) {
            if (withChildsNodes === void 0) { withChildsNodes = false; }
            if (highlightElementID === void 0) { highlightElementID = ""; }
            if (!root.childNodes || root.childNodes.length === 0) {
                return;
            }
            for (var index = 0; index < root.childNodes.length; index++) {
                var node = root.childNodes[index];
                var packagedNode = this._packageNode(node);
                var b = false;
                if (node.childNodes && node.childNodes.length > 1 || (node && node.nodeName && (node.nodeName.toLowerCase() === "script" || node.nodeName.toLowerCase() === "style"))) {
                    packagedNode.hasChildNodes = true;
                }
                else if (withChildsNodes || node.childNodes.length == 1) {
                    this._packageDOM(node, packagedNode, withChildsNodes, highlightElementID);
                    b = true;
                }
                if (highlightElementID !== "" && (!b && withChildsNodes)) {
                    this._packageDOM(node, packagedNode, withChildsNodes, highlightElementID);
                }
                if (node.__vorlon && node.__vorlon.ignore) {
                    return;
                }
                packagedObject.children.push(packagedNode);
                if (highlightElementID === packagedNode.internalId) {
                    highlightElementID = "";
                }
            }
        };
        DOMExplorerClient.prototype._packageAndSendDOM = function (element, highlightElementID) {
            if (highlightElementID === void 0) { highlightElementID = ""; }
            this._internalId = 0;
            var packagedObject = this._packageNode(element);
            this._packageDOM(element, packagedObject, false, highlightElementID);
            if (highlightElementID)
                packagedObject.highlightElementID = highlightElementID;
            this.sendCommandToDashboard('refreshNode', packagedObject);
        };
        DOMExplorerClient.prototype._markForRefresh = function () {
            this.refresh();
        };
        DOMExplorerClient.prototype.startClientSide = function () {
        };
        DOMExplorerClient.prototype._getElementByInternalId = function (internalId, node) {
            if (!node) {
                return null;
            }
            if (node.__vorlon && node.__vorlon.internalId === internalId) {
                return node;
            }
            if (!node.children) {
                return null;
            }
            for (var index = 0; index < node.children.length; index++) {
                var result = this._getElementByInternalId(internalId, node.children[index]);
                if (result) {
                    return result;
                }
            }
            return null;
        };
        DOMExplorerClient.prototype.getInnerHTML = function (internalId) {
            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element)
                this.sendCommandToDashboard("innerHTML", { internalId: internalId, innerHTML: element.innerHTML });
        };
        DOMExplorerClient.prototype.getComputedStyleById = function (internalId) {
            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element) {
                var winObject = document.defaultView || window;
                if (winObject.getComputedStyle) {
                    var styles = winObject.getComputedStyle(element);
                    var l = [];
                    for (var style in styles) {
                        if (isNaN(style) && style !== "parentRule" && style !== "length" && style !== "cssText" && typeof styles[style] !== 'function' && styles[style]) {
                            l.push({ name: style, value: styles[style] });
                        }
                    }
                    this.sendCommandToDashboard("setComputedStyle", l);
                }
            }
        };
        DOMExplorerClient.prototype.getStyle = function (internalId) {
            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element) {
                var winObject = document.defaultView || window;
                if (winObject.getComputedStyle) {
                    var styles = winObject.getComputedStyle(element);
                    var layoutStyle = {
                        border: {
                            rightWidth: styles.borderRightWidth,
                            leftWidth: styles.borderLeftWidth,
                            topWidth: styles.borderTopWidth,
                            bottomWidth: styles.borderBottomWidth
                        },
                        margin: {
                            bottom: styles.marginBottom,
                            left: styles.marginLeft,
                            top: styles.marginTop,
                            right: styles.marginRight
                        },
                        padding: {
                            bottom: styles.paddingBottom,
                            left: styles.paddingLeft,
                            top: styles.paddingTop,
                            right: styles.paddingRight
                        },
                        size: {
                            width: styles.width,
                            height: styles.height
                        }
                    };
                    this.sendCommandToDashboard("setLayoutStyle", layoutStyle);
                }
            }
        };
        DOMExplorerClient.prototype.saveInnerHTML = function (internalId, innerHTML) {
            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element) {
                element.innerHTML = innerHTML;
            }
            this.refreshbyId(internalId);
        };
        DOMExplorerClient.prototype._offsetFor = function (element) {
            var p = element.getBoundingClientRect();
            var w = element.offsetWidth;
            var h = element.offsetHeight;
            //console.log("check offset for highlight " + p.top + "," + p.left);
            return { x: p.top - element.scrollTop, y: p.left - element.scrollLeft, width: w, height: h };
        };
        DOMExplorerClient.prototype.setClientHighlightedElement = function (elementId) {
            var element = this._getElementByInternalId(elementId, document.documentElement);
            if (!element) {
                return;
            }
            if (!this._overlay) {
                this._overlay = document.createElement("div");
                this._overlay.id = "vorlonOverlay";
                this._overlay.style.position = "fixed";
                this._overlay.style.backgroundColor = "rgba(255,255,0,0.4)";
                this._overlay.style.pointerEvents = "none";
                this._overlay.__vorlon = { ignore: true };
                document.body.appendChild(this._overlay);
            }
            this._overlay.style.display = "block";
            var position = this._offsetFor(element);
            this._overlay.style.top = (position.x + document.body.scrollTop) + "px";
            this._overlay.style.left = (position.y + document.body.scrollLeft) + "px";
            this._overlay.style.width = position.width + "px";
            this._overlay.style.height = position.height + "px";
        };
        DOMExplorerClient.prototype.unhighlightClientElement = function (internalId) {
            if (this._overlay)
                this._overlay.style.display = "none";
        };
        DOMExplorerClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
        };
        DOMExplorerClient.prototype.refresh = function () {
            var _this = this;
            //sometimes refresh is called before document was loaded
            if (!document.body) {
                setTimeout(function () {
                    _this.refresh();
                }, 200);
                return;
            }
            var packagedObject = this._packageNode(document.documentElement);
            this._packageDOM(document.documentElement, packagedObject, this._globalloadactive, null);
            this.sendCommandToDashboard('init', packagedObject);
        };
        DOMExplorerClient.prototype.inspect = function () {
            var _this = this;
            if (document.elementFromPoint) {
                if (this._overlayInspect)
                    return;
                this.trace("INSPECT");
                this._overlayInspect = document.createElement("DIV");
                this._overlayInspect.__vorlon = { ignore: true };
                this._overlayInspect.style.position = "fixed";
                this._overlayInspect.style.left = "0";
                this._overlayInspect.style.right = "0";
                this._overlayInspect.style.top = "0";
                this._overlayInspect.style.bottom = "0";
                this._overlayInspect.style.zIndex = "5000000000000000";
                this._overlayInspect.style.touchAction = "manipulation";
                this._overlayInspect.style.backgroundColor = "rgba(255,0,0,0.3)";
                document.body.appendChild(this._overlayInspect);
                var event = "mousedown";
                if (this._overlayInspect.onpointerdown !== undefined) {
                    event = "pointerdown";
                }
                this._overlayInspect.addEventListener(event, function (arg) {
                    var evt = arg;
                    _this.trace("tracking element at " + evt.clientX + "/" + evt.clientY);
                    _this._overlayInspect.parentElement.removeChild(_this._overlayInspect);
                    var el = document.elementFromPoint(evt.clientX, evt.clientY);
                    if (el) {
                        _this.trace("element found");
                        _this.openElementInDashboard(el);
                    }
                    else {
                        _this.trace("element not found");
                    }
                    _this._overlayInspect = null;
                });
            }
            else {
                //TODO : send message back to dashboard and disable button
                this.trace("VORLON, inspection not supported");
            }
        };
        DOMExplorerClient.prototype.openElementInDashboard = function (element) {
            if (element) {
                var parentId = this.getFirstParentWithInternalId(element);
                if (parentId) {
                    this.refreshbyId(parentId, this._packageNode(element).internalId);
                }
            }
        };
        DOMExplorerClient.prototype.setStyle = function (internaID, property, newValue) {
            var element = this._getElementByInternalId(internaID, document.documentElement);
            element.style[property] = newValue;
        };
        DOMExplorerClient.prototype.globalload = function (value) {
            this._globalloadactive = value;
            if (this._globalloadactive) {
                this.refresh();
            }
        };
        DOMExplorerClient.prototype.getFirstParentWithInternalId = function (node) {
            if (!node)
                return null;
            if (node.parentNode && node.parentNode.__vorlon && node.parentNode.__vorlon.internalId) {
                return node.parentNode.__vorlon.internalId;
            }
            else
                return this.getFirstParentWithInternalId(node.parentNode);
        };
        DOMExplorerClient.prototype.getMutationObeserverAvailability = function () {
            var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || null;
            if (mutationObserver) {
                this.sendCommandToDashboard('mutationObeserverAvailability', { availability: true });
            }
            else {
                this.sendCommandToDashboard('mutationObeserverAvailability', { availability: false });
            }
        };
        DOMExplorerClient.prototype.searchDOMBySelector = function (selector, position) {
            if (position === void 0) { position = 0; }
            var length = 0;
            try {
                if (selector) {
                    var elements = document.querySelectorAll(selector);
                    length = elements.length;
                    if (elements.length) {
                        if (!elements[position])
                            position = 0;
                        var parentId = this.getFirstParentWithInternalId(elements[position]);
                        if (parentId) {
                            this.refreshbyId(parentId, this._packageNode(elements[position]).internalId);
                        }
                        if (position < elements.length + 1) {
                            position++;
                        }
                    }
                }
            }
            catch (e) {
            }
            this.sendCommandToDashboard('searchDOMByResults', { length: length, selector: selector, position: position });
        };
        DOMExplorerClient.prototype.setAttribute = function (internaID, attributeName, attributeOldName, attributeValue) {
            var element = this._getElementByInternalId(internaID, document.documentElement);
            if (attributeName !== "attributeName") {
                try {
                    element.removeAttribute(attributeOldName);
                }
                catch (e) { }
                if (attributeName)
                    element.setAttribute(attributeName, attributeValue);
                if (attributeName && attributeName.indexOf('on') === 0) {
                    element[attributeName] = function () {
                        try {
                            eval(attributeValue);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    };
                }
            }
        };
        DOMExplorerClient.prototype.refreshbyId = function (internaID, internalIdToshow) {
            if (internalIdToshow === void 0) { internalIdToshow = ""; }
            if (internaID && internalIdToshow) {
                this._packageAndSendDOM(this._getElementByInternalId(internaID, document.documentElement), internalIdToshow);
            }
            else if (internaID) {
                this._packageAndSendDOM(this._getElementByInternalId(internaID, document.documentElement));
            }
        };
        DOMExplorerClient.prototype.setElementValue = function (internaID, value) {
            var element = this._getElementByInternalId(internaID, document.documentElement);
            element.innerHTML = value;
        };
        DOMExplorerClient.prototype.getNodeStyle = function (internalID) {
            var element = this._getElementByInternalId(internalID, document.documentElement);
            if (element) {
                var styles = DOMExplorerClient.GetAppliedStyles(element);
                this.sendCommandToDashboard('nodeStyle', { internalID: internalID, styles: styles });
            }
        };
        return DOMExplorerClient;
    })(VORLON.ClientPlugin);
    VORLON.DOMExplorerClient = DOMExplorerClient;
    DOMExplorerClient.prototype.ClientCommands = {
        getMutationObeserverAvailability: function () {
            var plugin = this;
            plugin.getMutationObeserverAvailability();
        },
        style: function (data) {
            var plugin = this;
            plugin.setStyle(data.order, data.property, data.newValue);
        },
        searchDOMBySelector: function (data) {
            var plugin = this;
            plugin.searchDOMBySelector(data.selector, data.position);
        },
        setSettings: function (data) {
            var plugin = this;
            if (data && data.globalload != null)
                plugin.globalload(data.globalload);
        },
        saveinnerHTML: function (data) {
            var plugin = this;
            plugin.saveInnerHTML(data.order, data.innerhtml);
        },
        attribute: function (data) {
            var plugin = this;
            plugin.setAttribute(data.order, data.attributeName, data.attributeOldName, data.attributeValue);
        },
        setElementValue: function (data) {
            var plugin = this;
            plugin.setElementValue(data.order, data.value);
        },
        select: function (data) {
            var plugin = this;
            plugin.unhighlightClientElement();
            plugin.setClientHighlightedElement(data.order);
            plugin.getNodeStyle(data.order);
        },
        unselect: function (data) {
            var plugin = this;
            plugin.unhighlightClientElement(data.order);
        },
        highlight: function (data) {
            var plugin = this;
            plugin.unhighlightClientElement();
            plugin.setClientHighlightedElement(data.order);
        },
        unhighlight: function (data) {
            var plugin = this;
            plugin.unhighlightClientElement(data.order);
        },
        refreshNode: function (data) {
            var plugin = this;
            plugin.refreshbyId(data.order);
        },
        getNodeStyles: function (data) {
            var plugin = this;
            console.log("get node style");
            //plugin.refreshbyId(data.order);
        },
        refresh: function () {
            var plugin = this;
            plugin.refresh();
        },
        inspect: function () {
            var plugin = this;
            plugin.inspect();
        },
        getInnerHTML: function (data) {
            var plugin = this;
            plugin.getInnerHTML(data.order);
        },
        getStyle: function (data) {
            var plugin = this;
            plugin.getStyle(data.order);
        },
        getComputedStyleById: function (data) {
            var plugin = this;
            plugin.getComputedStyleById(data.order);
        }
    };
    // Register
    VORLON.Core.RegisterClientPlugin(new DOMExplorerClient());
})(VORLON || (VORLON = {}));
