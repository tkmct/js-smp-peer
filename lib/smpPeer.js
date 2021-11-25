"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var peerjs_1 = __importDefault(require("peerjs"));
var js_smp_1 = require("js-smp");
var msgs_1 = require("js-smp/lib/msgs");
var config_1 = require("./config");
var exceptions_1 = require("./exceptions");
var timeSleep = 10;
var defaultTimeout = 60000; // 60s
/* Message */
var MessageType;
(function (MessageType) {
    MessageType[MessageType["AmountReq"] = 0] = "AmountReq";
    MessageType[MessageType["AmountRes"] = 1] = "AmountRes";
    MessageType[MessageType["SMP"] = 2] = "SMP";
})(MessageType || (MessageType = {}));
var smpMessage = function (msg) { return ({
    type: MessageType.SMP,
    msg: msg,
}); };
var amountReqMessage = function (msg) { return ({
    type: MessageType.AmountReq,
    msg: msg,
}); };
var amountResMessage = function (msg) { return ({
    type: MessageType.AmountRes,
    msg: msg,
}); };
/* Utility functions */
var sleep = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
/**
 * Wait until `SMPStateMachine` is at the finished state.
 */
function waitUntilStateMachineFinished(stateMachine) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!stateMachine.isFinished()) return [3 /*break*/, 2];
                    return [4 /*yield*/, sleep(timeSleep)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 2: return [2 /*return*/];
            }
        });
    });
}
function waitUntilStateMachineFinishedOrTimeout(stateMachine, timeout) {
    return __awaiter(this, void 0, void 0, function () {
        var timeoutID, timeoutPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timeoutPromise = new Promise(function (_, reject) {
                        timeoutID = setTimeout(function () {
                            return reject(new exceptions_1.TimeoutError('state machine is not finished before timeout'));
                        }, timeout);
                    });
                    return [4 /*yield*/, Promise.race([
                            waitUntilStateMachineFinished(stateMachine),
                            timeoutPromise,
                        ])];
                case 1:
                    _a.sent();
                    if (timeoutID !== undefined) {
                        clearTimeout(timeoutID);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var eventServerConnected = 'connected';
var eventServerDisconnected = 'disconnected';
var eventError = 'error';
var eventIncomingSMP = 'incoming';
var SMPPeer = /** @class */ (function () {
    /**
     * @param secret - The secret which will be used to run SMP protocol with the remote peer
     * @param localPeerID - Our peer id. We will "register" our peer id on the peer server later
     *  when calling `connectToPeerServer`.
     * @param peerServerConfig - The information of the peer server. `defaultPeerServerConfig` is
     *  used if this parameter is not supplied.
     */
    function SMPPeer(secret, amount, localPeerID, peerServerConfig, timeout) {
        if (peerServerConfig === void 0) { peerServerConfig = config_1.defaultPeerServerConfig; }
        if (timeout === void 0) { timeout = defaultTimeout; }
        this.amount = amount;
        this.localPeerID = localPeerID;
        this.peerServerConfig = peerServerConfig;
        this.timeout = timeout;
        this.negotiatedAmount = null;
        this.secret = secret;
    }
    Object.defineProperty(SMPPeer.prototype, "id", {
        /**
         * @returns Our peer id.
         * @throws `ServerUnconnected` if `id` is called when `SMPPeer` is not connected to the peer
         *  server.
         */
        get: function () {
            // TODO: Probably shouldn't throw here, since it's reasonable(and benefitial sometimes) that
            //  `id` is called even it is not connected to the peer server. E.g. when a `SMPPeer` is
            //  disconnected from the peer server and is still running `runSMP` with other peers.
            if (this.peer === undefined) {
                throw new exceptions_1.ServerUnconnected('need to be connected to a peer server to discover other peers');
            }
            return this.peer.id;
        },
        enumerable: false,
        configurable: true
    });
    SMPPeer.prototype.createConnDataHandler = function (stateMachine, conn) {
        var _this = this;
        return function (data) {
            if (data.type === MessageType.SMP) {
                var tlv = msgs_1.TLV.deserialize(new Uint8Array(data.msg));
                var replyTLV = stateMachine.transit(tlv);
                if (replyTLV === null) {
                    return;
                }
                conn.send(smpMessage(replyTLV.serialize()));
            }
            else if (data.type === MessageType.AmountReq) {
                conn.send(amountResMessage(_this.amount));
                _this.negotiatedAmount = Math.min(_this.amount, data.msg);
            }
            else if (data.type === MessageType.AmountRes) {
                _this.negotiatedAmount = Math.min(_this.amount, data.msg);
            }
        };
    };
    /**
     * Connect to the peer server with the infromation in `this.peerServerConfig`. A peer server
     *  allows us to discover peers and also others to find us. `connectToPeerServer` asynchronously
     *  waits until the connection to the peer server is established.
     * @throws `ServerFault` when the peer id we sent mismatches the one returned from the peer
     *  server.
     */
    SMPPeer.prototype.connectToPeerServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var localPeer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localPeer = new peerjs_1.default(this.localPeerID, this.peerServerConfig);
                        // Emitted when a new data connection is established from a remote peer.
                        localPeer.on('disconnected', function () {
                            if (_this.cbServerDisconnected !== undefined) {
                                _this.cbServerDisconnected();
                            }
                        });
                        localPeer.on('error', function (error) {
                            if (_this.cbError !== undefined) {
                                _this.cbError(error);
                            }
                        });
                        localPeer.on('connection', function (conn) {
                            // A remote peer has connected us!
                            console.debug("Received a connection from " + conn.peer);
                            // Emitted when the connection is established and ready-to-use.
                            // Ref: https://peerjs.com/docs.html#dataconnection
                            conn.on('open', function () { return __awaiter(_this, void 0, void 0, function () {
                                var stateMachine, e_1, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            stateMachine = new js_smp_1.SMPStateMachine(this.secret);
                                            conn.on('data', this.createConnDataHandler(stateMachine, conn));
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, waitUntilStateMachineFinishedOrTimeout(stateMachine, this.timeout)];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            e_1 = _a.sent();
                                            console.error(e_1 + " is thrown when running SMP with peer=" + conn.peer);
                                            return [2 /*return*/];
                                        case 4:
                                            result = stateMachine.getResult();
                                            console.debug("Finished SMP with peer=" + conn.peer + ": result=" + result + ", negotiatedAmount=" + this.negotiatedAmount);
                                            if (this.cbIncomingSMP !== undefined) {
                                                this.cbIncomingSMP(conn.peer, result, result ? this.negotiatedAmount : 0);
                                                this.negotiatedAmount = null;
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        });
                        // Wait until we are connected to the PeerServer
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                // Emitted when a connection to the PeerServer is established.
                                localPeer.on('open', function (id) {
                                    // Sanity check
                                    // If we expect our PeerID to be `localPeerID` but the peer server returns another one,
                                    // we should be aware that something is wrong between us and the server.
                                    if (_this.localPeerID !== undefined && id !== _this.localPeerID) {
                                        reject(new exceptions_1.ServerFault('the returned id from the peer server is not the one we expect: ' +
                                            ("returned=" + id + ", expected=" + _this.localPeerID)));
                                    }
                                    resolve(id);
                                    _this.peer = localPeer;
                                    if (_this.cbServerConnected !== undefined) {
                                        _this.cbServerConnected();
                                    }
                                });
                            })];
                    case 1:
                        // Wait until we are connected to the PeerServer
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run SMP protocol with a peer. Connecting with a peer server is required before calling
     *  `runSMP`.
     * @param remotePeerID - The id of the peer.
     * @throws `ServerUnconnected` when `runSMP` is called without connecting to a peer server.
     * @returns The result of SMP protocol, i.e. our secret is the same as the secret of the
     *  remote peer.
     */
    SMPPeer.prototype.runSMP = function (remotePeerID) {
        return __awaiter(this, void 0, void 0, function () {
            var conn, stateMachine, result, answer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.peer === undefined) {
                            throw new exceptions_1.ServerUnconnected('need to be connected to a peer server to discover other peers');
                        }
                        conn = this.peer.connect(remotePeerID, { reliable: true });
                        console.debug("Connecting " + remotePeerID + "...");
                        stateMachine = new js_smp_1.SMPStateMachine(this.secret);
                        conn.on('open', function () { return __awaiter(_this, void 0, void 0, function () {
                            var firstMsg;
                            return __generator(this, function (_a) {
                                console.debug("Connection to " + conn.peer + " is ready.");
                                firstMsg = stateMachine.transit(null);
                                // Sanity check
                                if (firstMsg === null) {
                                    throw new Error('msg1 should not be null');
                                }
                                conn.on('data', this.createConnDataHandler(stateMachine, conn));
                                // amount negotiation
                                conn.send(amountReqMessage(this.amount));
                                conn.send(smpMessage(firstMsg.serialize()));
                                return [2 /*return*/];
                            });
                        }); });
                        return [4 /*yield*/, waitUntilStateMachineFinishedOrTimeout(stateMachine, this.timeout)];
                    case 1:
                        _a.sent();
                        result = stateMachine.getResult();
                        answer = {
                            result: result,
                            negotiatedAmount: result ? this.negotiatedAmount : 0,
                        };
                        this.negotiatedAmount = null;
                        return [2 /*return*/, answer];
                }
            });
        });
    };
    /**
     * Disconnect from the peer server.
     */
    SMPPeer.prototype.disconnect = function () {
        if (this.peer === undefined) {
            throw new exceptions_1.ServerUnconnected('need to be connected to a peer server to disconnect');
        }
        this.peer.disconnect();
    };
    /**
     * Set callback functions for events.
     * @param event - Event name
     * @param cb - Callback function
     */
    SMPPeer.prototype.on = function (event, cb) {
        if (event === eventServerConnected) {
            this.cbServerConnected = cb;
        }
        else if (event === eventServerDisconnected) {
            this.cbServerDisconnected = cb;
        }
        else if (event === eventIncomingSMP) {
            this.cbIncomingSMP = cb;
        }
        else if (event === eventError) {
            this.cbError = cb;
        }
        else {
            throw new exceptions_1.EventUnsupported("event unsupported: " + event);
        }
    };
    return SMPPeer;
}());
exports.default = SMPPeer;
