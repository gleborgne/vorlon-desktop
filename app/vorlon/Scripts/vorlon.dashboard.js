var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require("fs");
var path = require("path");
var vauth = require("./vorlon.authentication");
var baseURLConfig = require("../config/vorlon.baseurlconfig");
var VORLON;
(function (VORLON) {
    var Dashboard = (function () {
        function Dashboard() {
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
        }
        Dashboard.prototype.addRoutes = function (app, passport) {
            app.route(this.baseURLConfig.baseURL + '/').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard/').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard/:sessionid').get(vauth.VORLON.Authentication.ensureAuthenticated, this.dashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard/:sessionid/reset').get(vauth.VORLON.Authentication.ensureAuthenticated, this.dashboardServerReset());
            app.route(this.baseURLConfig.baseURL + '/dashboard/:sessionid/:clientid').get(vauth.VORLON.Authentication.ensureAuthenticated, this.dashboardWithClient());
            //login
            app.post(this.baseURLConfig.baseURL + '/login', passport.authenticate('local', { failureRedirect: '/login',
                successRedirect: '/',
                failureFlash: false }));
            app.route(this.baseURLConfig.baseURL + '/login').get(this.login);
            app.get(this.baseURLConfig.baseURL + '/logout', this.logout);
        };
        Dashboard.prototype.start = function (httpServer) {
            //Not implemented
        };
        //Routes
        Dashboard.prototype.defaultDashboard = function () {
            var _this = this;
            return function (req, res) {
                res.redirect(_this.baseURLConfig.baseURL + '/dashboard/default');
            };
        };
        Dashboard.prototype.dashboard = function () {
            var _this = this;
            return function (req, res) {
                var authent = false;
                var configastext = fs.readFileSync(path.join(__dirname, "../config.json"));
                var catalog = JSON.parse(configastext.toString().replace(/^\uFEFF/, ''));
                if (catalog.activateAuth) {
                    authent = catalog.activateAuth;
                }
                console.log("dashboard authent " + authent);
                res.render('dashboard', { baseURL: _this.baseURLConfig.baseURL, title: 'Dashboard', sessionid: req.params.sessionid, clientid: "", authenticated: authent });
            };
        };
        Dashboard.prototype.dashboardWithClient = function () {
            var _this = this;
            return function (req, res) {
                res.render('dashboard', { baseURL: _this.baseURLConfig.baseURL, title: 'Dashboard', sessionid: req.params.sessionid, clientid: req.params.clientid });
            };
        };
        Dashboard.prototype.getsession = function (req, res) {
            res.render('getsession', { title: 'Get Session' });
        };
        Dashboard.prototype.login = function (req, res) {
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
            res.render('login', { baseURL: this.baseURLConfig.baseURL, message: 'Please login' });
        };
        Dashboard.prototype.logout = function (req, res) {
            req.logout();
            res.redirect('/');
        };
        Dashboard.prototype.dashboardServerReset = function () {
            var _this = this;
            return function (req, res) {
                var sessionid = req.params.sessionid;
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            res.send("Done.");
                        }
                    }
                };
                xhr.open("GET", "http://" + req.headers.host + _this.baseURLConfig.baseURL + "/api/reset/" + sessionid);
                xhr.send();
            };
        };
        return Dashboard;
    })();
    VORLON.Dashboard = Dashboard;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
;
