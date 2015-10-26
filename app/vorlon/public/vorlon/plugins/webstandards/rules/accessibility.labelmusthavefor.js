var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.labelMustHaveFor = {
                    id: "accessibility.label-must-have-for",
                    title: "label tag must have a \"for\" attribute",
                    description: "label tag is intended to be used with input field. Label tags help people with disabilities to identify input fields.",
                    nodeTypes: ["label"],
                    prepare: function (rulecheck, analyzeSummary, htmlString) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        rulecheck.nbfailed = 0;
                        rulecheck.nbcheck = 0;
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        var forAttr = node.getAttribute("for");
                        rulecheck.nbcheck++;
                        if (!forAttr) {
                            rulecheck.nbfailed++;
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                content: VORLON.Tools.htmlToString(node.outerHTML)
                            });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
