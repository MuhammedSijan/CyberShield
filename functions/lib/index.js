"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shieldAssistantProxy = exports.securityAdvisoryProxy = exports.explainPasswordProxy = exports.analyzeQrProxy = exports.analyzeFileProxy = exports.analyzePhishingProxy = exports.analyzeUrlProxy = void 0;
var url_1 = require("./url");
Object.defineProperty(exports, "analyzeUrlProxy", { enumerable: true, get: function () { return url_1.analyzeUrlProxy; } });
var phishing_1 = require("./phishing");
Object.defineProperty(exports, "analyzePhishingProxy", { enumerable: true, get: function () { return phishing_1.analyzePhishingProxy; } });
var file_1 = require("./file");
Object.defineProperty(exports, "analyzeFileProxy", { enumerable: true, get: function () { return file_1.analyzeFileProxy; } });
var qr_1 = require("./qr");
Object.defineProperty(exports, "analyzeQrProxy", { enumerable: true, get: function () { return qr_1.analyzeQrProxy; } });
var password_1 = require("./password");
Object.defineProperty(exports, "explainPasswordProxy", { enumerable: true, get: function () { return password_1.explainPasswordProxy; } });
var advisory_1 = require("./advisory");
Object.defineProperty(exports, "securityAdvisoryProxy", { enumerable: true, get: function () { return advisory_1.securityAdvisoryProxy; } });
var assistant_1 = require("./assistant");
Object.defineProperty(exports, "shieldAssistantProxy", { enumerable: true, get: function () { return assistant_1.shieldAssistantProxy; } });
//# sourceMappingURL=index.js.map