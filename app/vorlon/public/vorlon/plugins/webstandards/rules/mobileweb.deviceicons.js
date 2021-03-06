var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.deviceIcons = {
                    id: "mobileweb.deviceIcons",
                    title: "define platform icons",
                    description: "Platform icons helps user pinning your website with an icon that fits well on mobile device home.",
                    nodeTypes: ["meta", "link"],
                    prepare: function (rulecheck, analyzeSummary, htmlString) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        rulecheck.hasWindowsIcons = false;
                        rulecheck.hasWindowsNotification = false;
                        rulecheck.hasIOSIcons = false;
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        if (node.nodeName == "LINK") {
                            var rel = node.getAttribute("rel");
                            if (rel && rel == "apple-touch-icon-precomposed") {
                                rulecheck.hasIOSIcons = true;
                            }
                        }
                        else if (node.nodeName == "META") {
                            var name = node.getAttribute("name");
                            if (name) {
                                if (name.toLowerCase() == "msapplication-notification") {
                                    rulecheck.hasWindowsNotification = true;
                                }
                                else if (name.toLowerCase().indexOf("msapplication-") == 0) {
                                    rulecheck.hasWindowsIcons = true;
                                }
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary, htmlstring) {
                        if (!rulecheck.hasIOSIcons) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: VORLON.Tools.htmlToString('add Apple - iOS icons by adding link tags like <link rel="apple-touch-icon-precomposed" href="youricon" sizes="57x57" />')
                            });
                        }
                        if (!rulecheck.hasWindowsIcons) {
                            rulecheck.failed = true;
                            //https://msdn.microsoft.com/en-us/library/dn255024(v=vs.85).aspx
                            rulecheck.items.push({
                                title: VORLON.Tools.htmlToString('add Microsoft - Windows tiles by adding meta tags like <link name="msapplication-square150x150logo" content="yourimage" />')
                            });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
