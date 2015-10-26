var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                var ariaAttributes = [
                    'aria-atomic',
                    'aria-busy',
                    'aria-controls',
                    'aria-describedby',
                    'aria-disabled',
                    'aria-dropeffect',
                    'aria-flowto',
                    'aria-grabbed',
                    'aria-haspopup',
                    'aria-hidden',
                    'aria-invalid',
                    'aria-label',
                    'aria-labelledby',
                    'aria-live',
                    'aria-owns',
                    'aria-relevant',
                    'aria-autocomplete',
                    'aria-checked',
                    'aria-expanded',
                    'aria-level',
                    'aria-multiline',
                    'aria-multiselectable',
                    'aria-orientation',
                    'aria-pressed',
                    'aria-readonly',
                    'aria-required',
                    'aria-selected',
                    'aria-sort',
                    'aria-valuemax',
                    'aria-valuemin',
                    'aria-valuenow',
                    'aria-valuetext',
                    'aria-activedescendant',
                    'aria-posinset',
                    'aria-setsize'];
                DOM.useAriaAttributes = {
                    id: "accessibility.use-aria",
                    title: "use aria attributes",
                    description: "Use accessibility attributes like aria-label to provide meaningful information for people with visual disabilities.",
                    nodeTypes: [],
                    prepare: function (rulecheck, analyzeSummary, htmlString) {
                        rulecheck.ariaCount = 0;
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlstring) {
                        if (!node.getAttribute)
                            return;
                        ariaAttributes.forEach(function (a) {
                            if (node.getAttribute(a)) {
                                rulecheck.ariaCount++;
                            }
                        });
                    },
                    endcheck: function (rulecheck, analyzeSummary, htmlstring) {
                        if (rulecheck.ariaCount == 0) {
                            rulecheck.failed = true;
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
