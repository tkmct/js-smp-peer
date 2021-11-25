"use strict";
// To workaround for the issue that "isinstance is borken when class extends `Error` type,
// we need to override `constructor` to set prototype for each error.
//  - https://github.com/Microsoft/TypeScript/issues/13965
//  - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventUnsupported = exports.TimeoutError = exports.ServerFault = exports.ServerUnconnected = exports.SMPPeerError = void 0;
/**
 * The base error for `SMPPeer`.
 */
var SMPPeerError = /** @class */ (function (_super) {
    __extends(SMPPeerError, _super);
    function SMPPeerError(m) {
        var _this = _super.call(this, m) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, SMPPeerError.prototype);
        return _this;
    }
    return SMPPeerError;
}(Error));
exports.SMPPeerError = SMPPeerError;
/**
 * Thrown when there is something wrong with the peer server.
 */
var TimeoutError = /** @class */ (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError(m) {
        var _this = _super.call(this, m) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, TimeoutError.prototype);
        return _this;
    }
    return TimeoutError;
}(SMPPeerError));
exports.TimeoutError = TimeoutError;
/**
 * Thrown when we are not connected to the peer server.
 */
var ServerUnconnected = /** @class */ (function (_super) {
    __extends(ServerUnconnected, _super);
    function ServerUnconnected(m) {
        var _this = _super.call(this, m) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, ServerUnconnected.prototype);
        return _this;
    }
    return ServerUnconnected;
}(SMPPeerError));
exports.ServerUnconnected = ServerUnconnected;
/**
 * Thrown when there is something wrong with the peer server.
 */
var ServerFault = /** @class */ (function (_super) {
    __extends(ServerFault, _super);
    function ServerFault(m) {
        var _this = _super.call(this, m) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, ServerFault.prototype);
        return _this;
    }
    return ServerFault;
}(SMPPeerError));
exports.ServerFault = ServerFault;
/**
 * Thrown when there is something wrong with the peer server.
 */
var EventUnsupported = /** @class */ (function (_super) {
    __extends(EventUnsupported, _super);
    function EventUnsupported(m) {
        var _this = _super.call(this, m) || this;
        // Set the prototype explicitly.
        Object.setPrototypeOf(_this, EventUnsupported.prototype);
        return _this;
    }
    return EventUnsupported;
}(SMPPeerError));
exports.EventUnsupported = EventUnsupported;
