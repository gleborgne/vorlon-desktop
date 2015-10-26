var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var UnitTestRunnerClient = (function (_super) {
        __extends(UnitTestRunnerClient, _super);
        //public localStorageList: KeyValue[] = [];
        function UnitTestRunnerClient() {
            _super.call(this, "unitTestRunner");
            this._ready = false;
        }
        UnitTestRunnerClient.prototype.getID = function () {
            return "UNITTEST";
        };
        UnitTestRunnerClient.prototype.startClientSide = function () {
            var _this = this;
            this._loadNewScriptAsync("qunit.js", function () {
                var self = _this;
                _this._ready = true;
                QUnit.testDone(function (details) {
                    //console.log("QUnit.testDone");
                    //console.log(details);
                    var message = {};
                    message.commandType = "testDone";
                    message.name = details.name;
                    message.module = details.module;
                    message.failed = details.failed;
                    message.passed = details.passed;
                    message.total = details.total;
                    message.runtime = details.runtime;
                    this.sendCommandToDashboard(message);
                });
                QUnit.done(function (details) {
                    //console.log("QUnit.done");
                    //console.log(details);
                    var message = {};
                    message.commandType = "done";
                    message.failed = details.failed;
                    message.passed = details.passed;
                    message.total = details.total;
                    message.runtime = details.runtime;
                    this.sendCommandToDashboard("done", self.getID(), message);
                });
            });
        };
        UnitTestRunnerClient.prototype.refresh = function () {
        };
        UnitTestRunnerClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            //console.log("onRealtimeMessageReceivedFromDashboardSide");
            //console.log(receivedObject);
            switch (receivedObject.commandType) {
                case "runTest":
                    eval(receivedObject.testContent);
                    break;
            }
        };
        return UnitTestRunnerClient;
    })(VORLON.ClientPlugin);
    VORLON.UnitTestRunnerClient = UnitTestRunnerClient;
    //Register the plugin with vorlon core 
    VORLON.Core.RegisterClientPlugin(new UnitTestRunnerClient());
})(VORLON || (VORLON = {}));
