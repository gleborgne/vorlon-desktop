var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                CSS.cssfallback = {
                    id: "webstandards.cssfallback",
                    title: "incorrect use of css fallback",
                    description: "Ensure css fallback.",
                    check: function (url, ast, rulecheck, analyzeSummary) { },
                    endcheck: function (rulecheck, analyzeSummary) {
                        //console.log("check css css fallback");
                        var nodes = [];
                        rulecheck.items = [];
                        var failed = false;
                        if (analyzeSummary.fallBackErrorList === null) {
                            rulecheck.title = "(disabled !) incorrect use of css fallback";
                            failed = true;
                            var np = {
                                title: "the check of css Fallback is disabled",
                                type: "blockitems",
                                failed: true,
                                items: []
                            };
                            rulecheck.items.push(np);
                        }
                        else {
                            for (var ii = 0; ii < analyzeSummary.fallBackErrorList.length; ii++) {
                                for (var fallErrorFile in analyzeSummary.fallBackErrorList[ii]) {
                                    failed = true;
                                    var proprules = {
                                        title: fallErrorFile,
                                        type: "itemslist",
                                        items: []
                                    };
                                    for (var errorFile in analyzeSummary.fallBackErrorList[ii][fallErrorFile]) {
                                        var peroor = {
                                            failed: true,
                                            id: "." + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind],
                                            items: [],
                                            title: errorFile
                                        };
                                        proprules.items.push(peroor);
                                        for (var ind = 0; ind < analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile].length; ind++) {
                                            peroor.items.push({
                                                failed: true, id: "." + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind], items: [],
                                                title: "from " + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind] + " to " + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind].replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", ""), type: "error"
                                            });
                                        }
                                        if (proprules.items.length) {
                                            rulecheck.items.push(proprules);
                                        }
                                    }
                                }
                            }
                        }
                        rulecheck.failed = failed;
                    },
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
