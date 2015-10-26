var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.avoidMetaRefresh = {
                    id: "accessibility.avoid-meta-refresh",
                    title: "avoid meta refresh",
                    description: "Reading a webpage with your fingers is a lot harder and slower. Avoid auto refreshing your page to allow blind people to read your content.",
                    nodeTypes: ["meta"],
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        var equiv = node.getAttribute("http-equiv");
                        if (equiv && equiv.toLowerCase() == "refresh") {
                            rulecheck.failed = true;
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
