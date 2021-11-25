/**
 * The base error for `SMPPeer`.
 */
declare class SMPPeerError extends Error {
    constructor(m?: string);
}
/**
 * Thrown when there is something wrong with the peer server.
 */
declare class TimeoutError extends SMPPeerError {
    constructor(m?: string);
}
/**
 * Thrown when we are not connected to the peer server.
 */
declare class ServerUnconnected extends SMPPeerError {
    constructor(m?: string);
}
/**
 * Thrown when there is something wrong with the peer server.
 */
declare class ServerFault extends SMPPeerError {
    constructor(m?: string);
}
/**
 * Thrown when there is something wrong with the peer server.
 */
declare class EventUnsupported extends SMPPeerError {
    constructor(m?: string);
}
export { SMPPeerError, ServerUnconnected, ServerFault, TimeoutError, EventUnsupported, };
