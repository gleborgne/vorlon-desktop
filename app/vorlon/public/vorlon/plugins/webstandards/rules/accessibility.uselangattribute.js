var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.useLangAttribute = {
                    id: "accessibility.use-lang-attribute",
                    title: "add lang attr on HTML tag",
                    description: "lang attribute on HTML tag helps people finding out if they will understand content without having to get deep into it",
                    nodeTypes: ["html"],
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        var min = htmlString.toLowerCase();
                        var start = min.indexOf("<html");
                        var end = min.indexOf(">", start);
                        var htmltag = min.substr(start, end - start);
                        if (!(htmltag.indexOf(' lang=') >= 0)) {
                            rulecheck.failed = true;
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
