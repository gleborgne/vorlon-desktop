!function(e){"use strict";var t=function(){this.cssImportStatements=[],this.cssKeyframeStatements=[],this.cssRegex=new RegExp("([\\s\\S]*?){([\\s\\S]*?)}","gi"),this.cssMediaQueryRegex="((@media [\\s\\S]*?){([\\s\\S]*?}\\s*?)})",this.cssKeyframeRegex="((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})",this.combinedCSSRegex="((\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",this.cssCommentsRegex="(\\/\\*[\\s\\S]*?\\*\\/)",this.cssImportStatementRegex=new RegExp("@import .*?;","gi")};t.prototype.stripComments=function(e){var t=new RegExp(this.cssCommentsRegex,"gi");return e.replace(t,"")},t.prototype.parseCSS=function(e){if(void 0===e)return[];for(var t=[];;){var n=this.cssImportStatementRegex.exec(e);if(null===n)break;this.cssImportStatements.push(n[0]),t.push({selector:"@imports",type:"imports",styles:n[0]})}e=e.replace(this.cssImportStatementRegex,"");for(var o,r=new RegExp(this.cssKeyframeRegex,"gi");;){if(o=r.exec(e),null===o)break;t.push({selector:"@keyframes",type:"keyframes",styles:o[0]})}e=e.replace(r,"");for(var i=new RegExp(this.combinedCSSRegex,"gi");;){if(o=i.exec(e),null===o)break;var s="";s=void 0===o[2]?o[5].split("\r\n").join("\n").trim():o[2].split("\r\n").join("\n").trim();var a=new RegExp(this.cssCommentsRegex,"gi"),l=a.exec(s);if(null!==l&&(s=s.replace(a,"").trim()),-1!==s.indexOf("@media")){var c={selector:s,type:"media",subStyles:this.parseCSS(o[3]+"\n}")};null!==l&&(c.comments=l[0]),t.push(c)}else{var d=this.parseRules(o[6]),u={selector:s,rules:d};"@font-face"===s&&(u.type="font-face"),null!==l&&(u.comments=l[0]),t.push(u)}}return t},t.prototype.parseRules=function(e){e=e.split("\r\n").join("\n");var t=[];e=e.split(";");for(var n=0;n<e.length;n++){var o=e[n];if(o=o.trim(),-1!==o.indexOf(":")){o=o.split(":");var r=o[0].trim(),i=o.slice(1).join(":").trim();if(r.length<1||i.length<1)continue;t.push({directive:r,value:i})}else"base64,"==o.trim().substr(0,7)?t[t.length-1].value+=o.trim():o.length>0&&t.push({directive:"",value:o,defective:!0})}return t},t.prototype.findCorrespondingRule=function(e,t,n){void 0===n&&(n=!1);for(var o=!1,r=0;r<e.length&&(e[r].directive!=t||(o=e[r],n!==e[r].value));r++);return o},t.prototype.findBySelector=function(e,t,n){void 0===n&&(n=!1);for(var o=[],r=0;r<e.length;r++)n===!1?e[r].selector===t&&o.push(e[r]):-1!==e[r].selector.indexOf(t)&&o.push(e[r]);if(o.length<2)return o;var i=o[0];for(r=1;r<o.length;r++)this.intelligentCSSPush([i],o[r]);return[i]},t.prototype.deleteBySelector=function(e,t){for(var n=[],o=0;o<e.length;o++)e[o].selector!==t&&n.push(e[o]);return n},t.prototype.compressCSS=function(e){for(var t=[],n={},o=0;o<e.length;o++){var r=e[o];if(n[r.selector]!==!0){var i=this.findBySelector(e,r.selector);0!==i.length&&(t.push(i[0]),n[r.selector]=!0)}}return t},t.prototype.cssDiff=function(e,t){if(e.selector!==t.selector)return!1;if("media"===e.type||"media"===t.type)return!1;for(var n,o,r={selector:e.selector,rules:[]},i=0;i<e.rules.length;i++)n=e.rules[i],o=this.findCorrespondingRule(t.rules,n.directive,n.value),o===!1?r.rules.push(n):n.value!==o.value&&r.rules.push(n);for(var s=0;s<t.rules.length;s++)o=t.rules[s],n=this.findCorrespondingRule(e.rules,o.directive),n===!1&&(o.type="DELETED",r.rules.push(o));return 0===r.rules.length?!1:r},t.prototype.intelligentMerge=function(e,t,n){void 0===n&&(n=!1);for(var o=0;o<t.length;o++)this.intelligentCSSPush(e,t[o],n);for(o=0;o<e.length;o++){var r=e[o];"media"!==r.type&&"keyframes"!==r.type&&(r.rules=this.compactRules(r.rules))}},t.prototype.intelligentCSSPush=function(e,t,n){var o=(t.selector,!1);if(void 0===n&&(n=!1),n===!1){for(var r=0;r<e.length;r++)if(e[r].selector===t.selector){o=e[r];break}}else for(var i=e.length-1;i>-1;i--)if(e[i].selector===t.selector){o=e[i];break}if(o===!1)e.push(t);else if("media"!==t.type)for(var s=0;s<t.rules.length;s++){var a=t.rules[s],l=this.findCorrespondingRule(o.rules,a.directive);l===!1?o.rules.push(a):"DELETED"==a.type?l.type="DELETED":l.value=a.value}else o.subStyles=t.subStyles},t.prototype.compactRules=function(e){for(var t=[],n=0;n<e.length;n++)"DELETED"!==e[n].type&&t.push(e[n]);return t},t.prototype.getCSSForEditor=function(e,t){void 0===t&&(t=0);var n="";void 0===e&&(e=this.css);for(var o=0;o<e.length;o++)"imports"==e[o].type&&(n+=e[o].styles+"\n\n");for(o=0;o<e.length;o++){var r=e[o];if(void 0!==r.selector){var i="";void 0!==r.comments&&(i=r.comments+"\n"),"media"==r.type?(n+=i+r.selector+"{\n",n+=this.getCSSForEditor(r.subStyles,t+1),n+="}\n\n"):"keyframes"!==r.type&&"imports"!==r.type&&(n+=this.getSpaces(t)+i+r.selector+" {\n",n+=this.getCSSOfRules(r.rules,t+1),n+=this.getSpaces(t)+"}\n\n")}}for(o=0;o<e.length;o++)"keyframes"==e[o].type&&(n+=e[o].styles+"\n\n");return n},t.prototype.getImports=function(e){for(var t=[],n=0;n<e.length;n++)"imports"==e[n].type&&t.push(e[n].styles);return t},t.prototype.getCSSOfRules=function(e,t){for(var n="",o=0;o<e.length;o++)void 0!==e[o]&&(n+=void 0===e[o].defective?this.getSpaces(t)+e[o].directive+" : "+e[o].value+";\n":this.getSpaces(t)+e[o].value+";\n");return n||"\n"},t.prototype.getSpaces=function(e){for(var t="",n=0;4*e>n;n++)t+=" ";return t},t.prototype.applyNamespacing=function(e,t){var n=e,o="."+this.cssPreviewNamespace;void 0!==t&&(o=t),"string"==typeof e&&(n=this.parseCSS(e));for(var r=0;r<n.length;r++){var i=n[r];if(!(i.selector.indexOf("@font-face")>-1||i.selector.indexOf("keyframes")>-1||i.selector.indexOf("@import")>-1||i.selector.indexOf(".form-all")>-1||i.selector.indexOf("#stage")>-1))if("media"!==i.type){for(var s=i.selector.split(","),a=[],l=0;l<s.length;l++)-1===s[l].indexOf(".supernova")?a.push(o+" "+s[l]):a.push(s[l]);i.selector=a.join(",")}else i.subStyles=this.applyNamespacing(i.subStyles,t)}return n},t.prototype.clearNamespacing=function(e,t){void 0===t&&(t=!1);var n=e,o="."+this.cssPreviewNamespace;"string"==typeof e&&(n=this.parseCSS(e));for(var r=0;r<n.length;r++){var i=n[r];if("media"!==i.type){for(var s=i.selector.split(","),a=[],l=0;l<s.length;l++)a.push(s[l].split(o+" ").join(""));i.selector=a.join(",")}else i.subStyles=this.clearNamespacing(i.subStyles,!0)}return t===!1?this.getCSSForEditor(n):n},t.prototype.createStyleElement=function(e,t,n){if(void 0===n&&(n=!1),this.testMode===!1&&"nonamespace"!==n&&(t=this.applyNamespacing(t)),"string"!=typeof t&&(t=this.getCSSForEditor(t)),n===!0&&(t=this.getCSSForEditor(this.parseCSS(t))),this.testMode!==!1)return this.testMode("create style #"+e,t);var o=document.getElementById(e);o&&o.parentNode.removeChild(o);var r=document.head||document.getElementsByTagName("head")[0],i=document.createElement("style");i.id=e,i.type="text/css",r.appendChild(i),i.styleSheet&&!i.sheet?i.styleSheet.cssText=t:i.appendChild(document.createTextNode(t))},e.cssjs=t}(this);var VORLON;!function(e){var t=function(){function t(){}return t.QuerySelectorById=function(e,t){return e.querySelector?e.querySelector("#"+t):document.getElementById(t)},t.SetImmediate=function(e){window.setImmediate?setImmediate(e):setTimeout(e,0)},t.setLocalStorageValue=function(e,t){if(localStorage)try{localStorage.setItem(e,t)}catch(n){}},t.getLocalStorageValue=function(e){if(localStorage)try{return localStorage.getItem(e)}catch(t){return""}},t.Hook=function(e,t,n){var o=e[t];return e[t]=function(){for(var t=[],r=0;r<arguments.length;r++)t[r-0]=arguments[r];n(t),o.apply(e,t)},o},t.HookProperty=function(t,n,o){var r=t[n];Object.defineProperty(t,n,{get:function(){return o&&o(e.Tools.getCallStack(1)),r}})},t.getCallStack=function(e){e=e||0;try{throw new Error}catch(t){for(var n=t.stack.split("\n"),o=0,r=2+e,i=n.length;i>r;r++)if(n[r].indexOf("http://")>=0){o=r;break}var s={stack:t.stack},a=n[o],l=a.indexOf("http://")||a.indexOf("https://");if(l>0){var c=a.indexOf(")",l);0>c&&(c=a.length-1);var d=a.substr(l,c-l),u=d.indexOf(":",d.lastIndexOf("/"));s.file=d.substr(0,u)}return s}},t.CreateCookie=function(e,t,n){var o;if(n){var r=new Date;r.setTime(r.getTime()+24*n*60*60*1e3),o="; expires="+r.toUTCString()}else o="";document.cookie=e+"="+t+o+"; path=/"},t.ReadCookie=function(e){for(var t=e+"=",n=document.cookie.split(";"),o=0;o<n.length;o++){for(var r=n[o];" "===r.charAt(0);)r=r.substring(1,r.length);if(0===r.indexOf(t))return r.substring(t.length,r.length)}return""},t.CreateGUID=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0,n="x"===e?t:3&t|8;return n.toString(16)})},t.RemoveEmpties=function(e){for(var t=e.length,n=t-1;n>=0;n--)e[n]||(e.splice(n,1),t--);return t},t.AddClass=function(e,n){if(e.classList){if(n.indexOf(" ")<0)e.classList.add(n);else{var o=n.split(" ");t.RemoveEmpties(o);for(var r=0,i=o.length;i>r;r++)e.classList.add(o[r])}return e}var s,a=e.className,l=a.split(" "),c=t.RemoveEmpties(l);if(n.indexOf(" ")>=0){for(o=n.split(" "),t.RemoveEmpties(o),r=0;c>r;r++){var d=o.indexOf(l[r]);d>=0&&o.splice(d,1)}o.length>0&&(s=o.join(" "))}else{var u=!1;for(r=0;c>r;r++)if(l[r]===n){u=!0;break}u||(s=n)}return s&&(e.className=c>0&&l[0].length>0?a+" "+s:s),e},t.RemoveClass=function(e,n){if(e.classList){if(0===e.classList.length)return e;var o=n.split(" ");t.RemoveEmpties(o);for(var r=0,i=o.length;i>r;r++)e.classList.remove(o[r]);return e}var s=e.className;if(n.indexOf(" ")>=0)o=n.split(" "),t.RemoveEmpties(o);else{if(s.indexOf(n)<0)return e;o=[n]}var a,l=s.split(" "),c=t.RemoveEmpties(l);for(r=c-1;r>=0;r--)o.indexOf(l[r])>=0&&(l.splice(r,1),a=!0);return a&&(e.className=l.join(" ")),e},t.ToggleClass=function(e,n,o){e.className.match(n)?(t.RemoveClass(e,n),o&&o(!1)):(t.AddClass(e,n),o&&o(!0))},t.htmlToString=function(e){return e.replace(/</g,"&lt;").replace(/>/g,"&gt;")},t}();e.Tools=t;var n=function(){function e(e,t,n,o){this.childs=[],e&&(this.element=document.createElement(e),t&&(this.element.className=t),n&&n.appendChild(this.element),this.parent=o,o&&o.childs.push(this))}return e.forElement=function(t){var n=new e(null);return n.element=t,n},e.prototype.addClass=function(e){return this.element.classList.add(e),this},e.prototype.toggleClass=function(e){return this.element.classList.toggle(e),this},e.prototype.className=function(e){return this.element.className=e,this},e.prototype.opacity=function(e){return this.element.style.opacity=e,this},e.prototype.display=function(e){return this.element.style.display=e,this},e.prototype.hide=function(){return this.element.style.display="none",this},e.prototype.visibility=function(e){return this.element.style.visibility=e,this},e.prototype.text=function(e){return this.element.textContent=e,this},e.prototype.html=function(e){return this.element.innerHTML=e,this},e.prototype.attr=function(e,t){return this.element.setAttribute(e,t),this},e.prototype.editable=function(e){return this.element.contentEditable=e?"true":"false",this},e.prototype.style=function(e,t){return this.element.style[e]=t,this},e.prototype.appendTo=function(e){return e.appendChild(this.element),this},e.prototype.append=function(t,n,o){var r=new e(t,n,this.element,this);return o&&o(r),this},e.prototype.createChild=function(t,n){var o=new e(t,n,this.element,this);return o},e.prototype.click=function(e){return this.element.addEventListener("click",e),this},e.prototype.blur=function(e){return this.element.addEventListener("blur",e),this},e.prototype.keydown=function(e){return this.element.addEventListener("keydown",e),this},e}();e.FluentDOM=n}(VORLON||(VORLON={}));var VORLON;!function(e){!function(e){e[e.Client=0]="Client",e[e.Dashboard=1]="Dashboard",e[e.Both=2]="Both"}(e.RuntimeSide||(e.RuntimeSide={}));e.RuntimeSide;!function(e){e[e.OneOne=0]="OneOne",e[e.MulticastReceiveOnly=1]="MulticastReceiveOnly",e[e.Multicast=2]="Multicast"}(e.PluginType||(e.PluginType={}));e.PluginType}(VORLON||(VORLON={}));var VORLON;!function(e){var t=function(){function t(t){this.name=t,this._ready=!0,this._id="",this._type=e.PluginType.OneOne,this.traceLog=function(e){console.log(e)},this.traceNoop=function(){},this.loadingDirectory="vorlon/plugins",this.debug=e.Core.debug}return Object.defineProperty(t.prototype,"Type",{get:function(){return this._type},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"debug",{get:function(){return this._debug},set:function(e){this._debug=e,this.trace=e?this.traceLog:this.traceNoop},enumerable:!0,configurable:!0}),t.prototype.getID=function(){return this._id},t.prototype.isReady=function(){return this._ready},t}();e.BasePlugin=t}(VORLON||(VORLON={}));var __extends=this&&this.__extends||function(e,t){function n(){this.constructor=e}for(var o in t)t.hasOwnProperty(o)&&(e[o]=t[o]);e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)},VORLON;!function(e){var t=function(t){function n(e){t.call(this,e)}return __extends(n,t),n.prototype.startClientSide=function(){},n.prototype.whenDOMReady=function(){},n.prototype.onRealtimeMessageReceivedFromDashboardSide=function(){},n.prototype.sendToDashboard=function(t){e.Core.Messenger&&e.Core.Messenger.sendRealtimeMessage(this.getID(),t,e.RuntimeSide.Client,"message")},n.prototype.sendCommandToDashboard=function(t,n){void 0===n&&(n=null),e.Core.Messenger&&(this.trace(this.getID()+" send command to dashboard "+t),e.Core.Messenger.sendRealtimeMessage(this.getID(),n,e.RuntimeSide.Client,"message",t))},n.prototype.refresh=function(){console.error("Please override plugin.refresh()")},n.prototype._loadNewScriptAsync=function(e,t,n){function o(){var n=document.createElement("script");n.setAttribute("src",i+e),n.onload=t;var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(n,o)}var r=this,i="";i=0===this.loadingDirectory.indexOf("http")?this.loadingDirectory+"/"+this.name+"/":vorlonBaseURL+"/"+this.loadingDirectory+"/"+this.name+"/",!n||this.domReady?o():setTimeout(function(){r._loadNewScriptAsync(e,t,n)},100)},n}(e.BasePlugin);e.ClientPlugin=t}(VORLON||(VORLON={}));var __extends=this&&this.__extends||function(e,t){function n(){this.constructor=e}for(var o in t)t.hasOwnProperty(o)&&(e[o]=t[o]);e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)},VORLON;!function(e){var t=function(t){function n(n,o,r){t.call(this,n),this.htmlFragmentUrl=o,this.cssStyleSheetUrl=r,this.debug=e.Core.debug}return __extends(n,t),n.prototype.startDashboardSide=function(){},n.prototype.onRealtimeMessageReceivedFromClientSide=function(){},n.prototype.sendToClient=function(t){e.Core.Messenger&&e.Core.Messenger.sendRealtimeMessage(this.getID(),t,e.RuntimeSide.Dashboard,"message")},n.prototype.sendCommandToClient=function(t,n){void 0===n&&(n=null),e.Core.Messenger&&(this.trace(this.getID()+" send command to client "+t),e.Core.Messenger.sendRealtimeMessage(this.getID(),n,e.RuntimeSide.Dashboard,"message",t))},n.prototype.sendCommandToPluginClient=function(t,n,o){void 0===o&&(o=null),e.Core.Messenger&&(this.trace(this.getID()+" send command to plugin client "+n),e.Core.Messenger.sendRealtimeMessage(t,o,e.RuntimeSide.Dashboard,"protocol",n))},n.prototype.sendCommandToPluginDashboard=function(t,n,o){void 0===o&&(o=null),e.Core.Messenger&&(this.trace(this.getID()+" send command to plugin dashboard "+n),e.Core.Messenger.sendRealtimeMessage(t,o,e.RuntimeSide.Client,"protocol",n))},n.prototype._insertHtmlContentAsync=function(e,t){var n=this,o=vorlonBaseURL+"/"+this.loadingDirectory+"/"+this.name+"/",r=!1;e||(e=document.createElement("div"),document.body.appendChild(e),r=!0);var i=new XMLHttpRequest;i.open("GET",o+this.htmlFragmentUrl,!0),i.onreadystatechange=function(){if(4===i.readyState){if(200!==i.status)throw new Error("Error status: "+i.status+" - Unable to load "+o+n.htmlFragmentUrl);e.innerHTML=n._stripContent(i.responseText);var s=document.getElementsByTagName("head")[0],a=document.createElement("link");a.type="text/css",a.rel="stylesheet",a.href=o+n.cssStyleSheetUrl,a.media="screen",s.appendChild(a);var l=e.children[0];r&&(l.className="alone"),t(l)}},i.send(null)},n.prototype._stripContent=function(e){var t=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,n=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im;if(e){e=e.replace(t,"");var o=e.match(n);o&&(e=o[1])}return e},n}(e.BasePlugin);e.DashboardPlugin=t}(VORLON||(VORLON={}));var VORLON;!function(e){var t=function(){function t(t,n,o,r,i){var s=this;switch(this._isConnected=!1,this._isConnected=!1,this._sessionId=o,this._clientId=r,e.Core._listenClientId=i,this._serverUrl=n,t){case e.RuntimeSide.Client:this._socket=io.connect(n),this._isConnected=!0;break;case e.RuntimeSide.Dashboard:this._socket=io.connect(n+"/dashboard"),this._isConnected=!0}if(this.isConnected){var a=io.Manager(n);a.on("connect_error",function(e){s.onError&&s.onError(e)}),this._socket.on("message",function(e){var t=JSON.parse(e);s.onRealtimeMessageReceived&&s.onRealtimeMessageReceived(t)}),this._socket.on("helo",function(t){e.Core._listenClientId=t,s.onHeloReceived&&s.onHeloReceived(t)}),this._socket.on("identify",function(e){s.onIdentifyReceived&&s.onIdentifyReceived(e)}),this._socket.on("stoplisten",function(){s.onStopListenReceived&&s.onStopListenReceived()}),this._socket.on("refreshclients",function(){s.onRefreshClients&&s.onRefreshClients()}),this._socket.on("addclient",function(e){s.onAddClient&&s.onAddClient(e)}),this._socket.on("removeclient",function(e){s.onRemoveClient&&s.onRemoveClient(e)}),this._socket.on("reload",function(t){e.Core._listenClientId=t,s.onReload&&s.onReload(t)})}}return Object.defineProperty(t.prototype,"isConnected",{get:function(){return this._isConnected},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"clientId",{set:function(e){this._clientId=e},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"socketId",{get:function(){return this._socket.id},enumerable:!0,configurable:!0}),t.prototype.stopListening=function(){this._socket&&this._socket.removeAllListeners()},t.prototype.sendRealtimeMessage=function(t,n,o,r,i){void 0===r&&(r="message");var s={metadata:{pluginID:t,side:o,sessionId:this._sessionId,clientId:this._clientId,listenClientId:e.Core._listenClientId},data:n};if(i&&(s.command=i),!this.isConnected)return this.onRealtimeMessageReceived&&this.onRealtimeMessageReceived(s),void 0;if(""!==e.Core._listenClientId||"message"!==r){var a=JSON.stringify(s);this._socket.emit(r,a)}},t.prototype.sendMonitoringMessage=function(e,t){var n=new XMLHttpRequest;n.onreadystatechange=function(){4===n.readyState&&200===n.status},n.open("POST",this._serverUrl+"api/push"),n.setRequestHeader("Content-type","application/json;charset=UTF-8");var o=JSON.stringify({_idsession:this._sessionId,id:e,message:t});n.send(o)},t.prototype.getMonitoringMessage=function(e,t,n,o){void 0===n&&(n="-20"),void 0===o&&(o="-1");var r=new XMLHttpRequest;r.onreadystatechange=function(){4===r.readyState?200===r.status?t&&t(JSON.parse(r.responseText)):t&&t(null):t&&t(null)},r.open("GET",this._serverUrl+"api/range/"+this._sessionId+"/"+e+"/"+n+"/"+o),r.send()},t}();e.ClientMessenger=t}(VORLON||(VORLON={}));var VORLON;!function(e){var t=function(){function t(){this._clientPlugins=new Array,this._dashboardPlugins=new Array,this._socketIOWaitCount=0,this.debug=!1,this._RetryTimeout=1002}return Object.defineProperty(t.prototype,"Messenger",{get:function(){return e.Core._messenger},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"ClientPlugins",{get:function(){return e.Core._clientPlugins},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"DashboardPlugins",{get:function(){return e.Core._dashboardPlugins},enumerable:!0,configurable:!0}),t.prototype.RegisterClientPlugin=function(t){e.Core._clientPlugins.push(t)},t.prototype.RegisterDashboardPlugin=function(t){e.Core._dashboardPlugins.push(t)},t.prototype.StopListening=function(){e.Core._messenger&&(e.Core._messenger.stopListening(),delete e.Core._messenger)},t.prototype.StartClientSide=function(t,n,o){var r=this;if(void 0===t&&(t="'http://localhost:1337/'"),void 0===n&&(n=""),void 0===o&&(o=""),e.Core._side=e.RuntimeSide.Client,e.Core._sessionID=n,e.Core._listenClientId=o,void 0===window.io)return this._socketIOWaitCount<10?(this._socketIOWaitCount++,setTimeout(function(){console.log("Vorlon.js: waiting for socket.io to load..."),e.Core.StartClientSide(t,n,o)},1e3)):(console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file."),e.Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.",0)),void 0;var i=e.Tools.ReadCookie("vorlonJS_clientId");i||(i=e.Tools.CreateGUID(),e.Tools.CreateCookie("vorlonJS_clientId",i,1)),e.Core._messenger&&(e.Core._messenger.stopListening(),delete e.Core._messenger),e.Core._messenger=new e.ClientMessenger(e.Core._side,t,n,i,o),e.Core.Messenger.onRealtimeMessageReceived=e.Core._Dispatch,e.Core.Messenger.onHeloReceived=e.Core._OnIdentificationReceived,e.Core.Messenger.onIdentifyReceived=e.Core._OnIdentifyReceived,e.Core.Messenger.onStopListenReceived=e.Core._OnStopListenReceived,e.Core.Messenger.onError=e.Core._OnError,e.Core.Messenger.onReload=e.Core._OnReloadClient;var s={ua:navigator.userAgent};e.Core.Messenger.sendRealtimeMessage("",s,e.Core._side,"helo");for(var a=0;a<e.Core._clientPlugins.length;a++){var l=e.Core._clientPlugins[a];l.startClientSide()}document.addEventListener("DOMContentLoaded",function(){for(var t=0;t<e.Core._clientPlugins.length;t++){var n=e.Core._clientPlugins[t];n.domReady=!0,n.whenDOMReady()}}),window.addEventListener("beforeunload",function(){e.Core.Messenger.sendRealtimeMessage("",{socketid:e.Core.Messenger.socketId},e.Core._side,"clientclosed")},!1),setTimeout(function(){r.startClientDirtyCheck()},500)},t.prototype.startClientDirtyCheck=function(){var t=this;if(!document.body)return setTimeout(function(){t.startClientDirtyCheck()},200),void 0;var n=window.MutationObserver||window.WebKitMutationObserver||null;if(n){document.body.__vorlon||(document.body.__vorlon={});var o={attributes:!0,childList:!0,subtree:!0,characterData:!0};document.body.__vorlon._observerMutationObserver=new n(function(t){var n=!1,o=!1,r=[];t.forEach(function(t){if(o){for(var i=0;i<r.length;i++)clearTimeout(r[i]);o=!1}return t.target&&t.target.__vorlon&&t.target.__vorlon.ignore?(o=!0,void 0):t.previousSibling&&t.previousSibling.__vorlon&&t.previousSibling.__vorlon.ignore?(o=!0,void 0):(t.target&&!n&&t.target.__vorlon&&t.target.parentNode&&t.target.parentNode.__vorlon&&t.target.parentNode.__vorlon.internalId&&r.push(setTimeout(function(){var n=null;t&&t.target&&t.target.parentNode&&t.target.parentNode.__vorlon&&t.target.parentNode.__vorlon.internalId&&(n=t.target.parentNode.__vorlon.internalId),e.Core.Messenger.sendRealtimeMessage("ALL_PLUGINS",{type:"contentchanged",internalId:n},e.Core._side,"message")},300)),n=!0,void 0)})}),document.body.__vorlon._observerMutationObserver.observe(document.body,o)}else{console.log("dirty check using html string");var r;document.body&&(r=document.body.innerHTML),setInterval(function(){var t=document.body.innerHTML;r!=t&&(r=t,e.Core.Messenger.sendRealtimeMessage("ALL_PLUGINS",{type:"contentchanged"},e.Core._side,"message"))},2e3)}},t.prototype.StartDashboardSide=function(t,n,o,r){if(void 0===t&&(t="'http://localhost:1337/'"),void 0===n&&(n=""),void 0===o&&(o=""),void 0===r&&(r=null),e.Core._side=e.RuntimeSide.Dashboard,e.Core._sessionID=n,e.Core._listenClientId=o,e.Core._errorNotifier=document.createElement("x-notify"),e.Core._errorNotifier.setAttribute("type","error"),e.Core._errorNotifier.setAttribute("position","top"),e.Core._errorNotifier.setAttribute("duration",5e3),e.Core._messageNotifier=document.createElement("x-notify"),e.Core._messageNotifier.setAttribute("position","top"),e.Core._messageNotifier.setAttribute("duration",4e3),document.body.appendChild(e.Core._errorNotifier),document.body.appendChild(e.Core._messageNotifier),void 0===window.io)return this._socketIOWaitCount<10?(this._socketIOWaitCount++,setTimeout(function(){console.log("Vorlon.js: waiting for socket.io to load..."),e.Core.StartDashboardSide(t,n,o,r)},1e3)):(console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file."),e.Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.",0)),void 0;var i=e.Tools.ReadCookie("vorlonJS_clientId");i||(i=e.Tools.CreateGUID(),e.Tools.CreateCookie("vorlonJS_clientId",i,1)),e.Core._messenger&&(e.Core._messenger.stopListening(),delete e.Core._messenger),e.Core._messenger=new e.ClientMessenger(e.Core._side,t,n,i,o),e.Core.Messenger.onRealtimeMessageReceived=e.Core._Dispatch,e.Core.Messenger.onHeloReceived=e.Core._OnIdentificationReceived,e.Core.Messenger.onIdentifyReceived=e.Core._OnIdentifyReceived,e.Core.Messenger.onStopListenReceived=e.Core._OnStopListenReceived,e.Core.Messenger.onError=e.Core._OnError;var s={ua:navigator.userAgent};e.Core.Messenger.sendRealtimeMessage("",s,e.Core._side,"helo");for(var a=0;a<e.Core._dashboardPlugins.length;a++){var l=e.Core._dashboardPlugins[a];l.startDashboardSide(r?r(l.getID()):null)}},t.prototype._OnStopListenReceived=function(){e.Core._listenClientId=""},t.prototype._OnIdentifyReceived=function(t){if(e.Core._side===e.RuntimeSide.Dashboard)e.Core._messageNotifier.innerHTML=t,e.Core._messageNotifier.show();else{var n=document.createElement("div");n.className="vorlonIdentifyNumber",n.style.position="absolute",n.style.left="0",n.style.top="50%",n.style.marginTop="-150px",n.style.width="100%",n.style.height="300px",n.style.fontFamily="Arial",n.style.fontSize="300px",n.style.textAlign="center",n.style.color="white",n.style.textShadow="2px 2px 5px black",n.style.zIndex="100",n.innerHTML=t,document.body.appendChild(n),setTimeout(function(){document.body.removeChild(n)},4e3)}},t.prototype.ShowError=function(t,n){if(void 0===n&&(n=5e3),e.Core._side===e.RuntimeSide.Dashboard)e.Core._errorNotifier.innerHTML=t,e.Core._errorNotifier.setAttribute("duration",n),e.Core._errorNotifier.show();else{var o=document.createElement("div");o.style.position="absolute",o.style.top="0",o.style.left="0",o.style.width="100%",o.style.height="100px",o.style.backgroundColor="red",o.style.textAlign="center",o.style.fontSize="30px",o.style.paddingTop="20px",o.style.color="white",o.style.fontFamily="consolas",o.style.zIndex="1001",o.innerHTML=t,document.body.appendChild(o),n&&setTimeout(function(){document.body.removeChild(o)},n)}},t.prototype._OnError=function(t){e.Core.ShowError("Error while connecting to server. Server may be offline.<BR>Error message: "+t.message)},t.prototype._OnIdentificationReceived=function(t){if(e.Core._listenClientId=t,e.Core._side===e.RuntimeSide.Client)for(var n=0;n<e.Core._clientPlugins.length;n++){var o=e.Core._clientPlugins[n];o.refresh()}else{var r=document.querySelector(".dashboard-plugins-overlay");e.Tools.AddClass(r,"hidden"),e.Tools.RemoveClass(r,"bounce"),document.getElementById("test").style.visibility="visible"}},t.prototype._OnReloadClient=function(){document.location.reload()},t.prototype._RetrySendingRealtimeMessage=function(t,n){setTimeout(function(){return t.isReady()?(e.Core._DispatchFromClientPluginMessage(t,n),void 0):(e.Core._RetrySendingRealtimeMessage(t,n),void 0)},e.Core._RetryTimeout)},t.prototype._Dispatch=function(t){return t.metadata?("ALL_PLUGINS"==t.metadata.pluginID?(e.Core._clientPlugins.forEach(function(n){e.Core._DispatchPluginMessage(n,t)}),e.Core._dashboardPlugins.forEach(function(n){e.Core._DispatchPluginMessage(n,t)})):(e.Core._clientPlugins.forEach(function(n){return n.getID()===t.metadata.pluginID?(e.Core._DispatchPluginMessage(n,t),void 0):void 0}),e.Core._dashboardPlugins.forEach(function(n){return n.getID()===t.metadata.pluginID?(e.Core._DispatchPluginMessage(n,t),void 0):void 0})),void 0):(console.error("invalid message "+JSON.stringify(t)),void 0)},t.prototype._DispatchPluginMessage=function(t,n){t.trace("received "+JSON.stringify(n)),n.metadata.side===e.RuntimeSide.Client?t.isReady()?e.Core._DispatchFromClientPluginMessage(t,n):e.Core._RetrySendingRealtimeMessage(t,n):e.Core._DispatchFromDashboardPluginMessage(t,n)},t.prototype._DispatchFromClientPluginMessage=function(e,t){if(t.command&&e.DashboardCommands){var n=e.DashboardCommands[t.command];if(n)return n.call(e,t.data),void 0}e.onRealtimeMessageReceivedFromClientSide(t.data)},t.prototype._DispatchFromDashboardPluginMessage=function(e,t){if(t.command&&e.ClientCommands){var n=e.ClientCommands[t.command];if(n)return n.call(e,t.data),void 0}e.onRealtimeMessageReceivedFromDashboardSide(t.data)},t}();e._Core=t,e.Core=new t}(VORLON||(VORLON={}));