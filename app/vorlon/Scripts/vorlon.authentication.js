var fs = require("fs");
var path = require("path");
var VORLON;
(function (VORLON) {
    var Authentication = (function () {
        function Authentication() {
        }
        Authentication.ensureAuthenticated = function (req, res, next) {
            if (!Authentication.ActivateAuth || req.isAuthenticated()) {
                return next();
            }
            res.redirect('/login');
        };
        Authentication.loadAuthConfig = function () {
            fs.readFile(path.join(__dirname, "../config.json"), "utf8", function (err, catalogdata) {
                if (err) {
                    return;
                }
                var catalog = JSON.parse(catalogdata.replace(/^\uFEFF/, ''));
                if (catalog.activateAuth) {
                    Authentication.ActivateAuth = catalog.activateAuth;
                }
                if (catalog.username) {
                    Authentication.UserName = catalog.username;
                }
                if (catalog.password) {
                    Authentication.Password = catalog.password;
                }
            });
        };
        Authentication.ActivateAuth = false;
        return Authentication;
    })();
    VORLON.Authentication = Authentication;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
;
