var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.imagesShouldHaveAlt = {
                    id: "accessibility.images-should-have-alt",
                    title: "images should have alt attribute",
                    description: "Add alt attribute on images to enable blind people to get meaning for images.",
                    nodeTypes: ["IMG", "AREA"],
                    prepare: function (rulecheck, analyzeSummary, htmlString) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        rulecheck.nbfailed = 0;
                        rulecheck.nbcheck = 0;
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        //console.log("check alt images ");
                        var altattr = node.attributes.getNamedItem("alt");
                        rulecheck.nbcheck++;
                        if (!altattr || !altattr.value) {
                            rulecheck.nbfailed++;
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                content: VORLON.Tools.htmlToString(node.outerHTML)
                            });
                        }
                        else {
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
