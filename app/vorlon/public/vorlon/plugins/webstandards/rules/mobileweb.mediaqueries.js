var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                CSS.mobileMediaqueries = {
                    id: "mobileweb.usemediaqueries",
                    title: "use responsive approaches",
                    description: "Even if your website target only certain devices, you may have users with unexpected devices or screen ratio.",
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        if (rulecheck.cssnbqueries == undefined)
                            rulecheck.cssnbqueries = 0;
                    },
                    check: function (url, ast, rulecheck, analyzeSummary) {
                        //console.log("check css prefixes");
                        this.checkNodes(url, rulecheck, ast);
                    },
                    checkNodes: function (url, rulecheck, ast) {
                        if (!ast)
                            return;
                        ast.forEach(function (node, i) {
                            var nodeitem = null;
                            //scan content for media queries
                            if (node.type === "media") {
                                var media = node.selector;
                                if (media) {
                                    media = media.toLowerCase();
                                    if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0) {
                                        rulecheck.cssnbqueries++;
                                    }
                                }
                            }
                        });
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                    }
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.mobileMediaqueries = {
                    id: "mobileweb.usemediaqueries",
                    title: "use responsive approaches",
                    description: "Even if your website target only certain devices, you may have users with unexpected devices or screen ratio.",
                    nodeTypes: ["link"],
                    prepare: function (rulecheck, analyzeSummary, htmlString) {
                        rulecheck.items = rulecheck.items || [];
                        if (rulecheck.domnbqueries == undefined)
                            rulecheck.domnbqueries = 0;
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlstring) {
                        if (!node.getAttribute)
                            return;
                        var rel = node.getAttribute("rel");
                        if (rel && rel.toLocaleLowerCase() == "stylesheet") {
                            var media = node.getAttribute("media");
                            if (media) {
                                media = media.toLowerCase();
                                if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0) {
                                    rulecheck.domnbqueries++;
                                }
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary, htmlstring) {
                        //console.log("media queries css:" + rulecheck.cssnbqueries + ", dom:" + rulecheck.domnbqueries);
                        if (rulecheck.cssnbqueries == 0 && rulecheck.domnbqueries == 0) {
                            if (rulecheck.cssnbqueries == 0) {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: 'your css (either files or inline) does not use any media queries'
                                });
                            }
                            if (rulecheck.domnbqueries == 0) {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: 'your link tags does not use any media queries'
                                });
                            }
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
