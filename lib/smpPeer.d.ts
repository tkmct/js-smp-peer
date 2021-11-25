import Peer from 'peerjs';
import { SMPStateMachine } from 'js-smp';
import { TPeerServerConfig } from './config';
declare enum MessageType {
    AmountReq = 0,
    AmountRes = 1,
    SMP = 2
}
declare type Message = {
    type: MessageType;
    msg: any;
};
declare const eventServerConnected = "connected";
declare const eventServerDisconnected = "disconnected";
declare const eventError = "error";
declare const eventIncomingSMP = "incoming";
declare type TCBServerConnected = () => void;
declare type TCBServerDisconnected = () => void;
declare type TCBError = (error: string) => void;
declare type TCBIncomingSMP = (remotePeerID: string, result: boolean, negotiatedAmount: number) => void;
declare class SMPPeer {
    readonly amount: number;
    readonly localPeerID?: string | undefined;
    readonly peerServerConfig: TPeerServerConfig;
    readonly timeout: number;
    secret: string;
    negotiatedAmount: number | null;
    cbServerConnected?: TCBServerConnected;
    cbServerDisconnected?: TCBServerDisconnected;
    cbError?: TCBError;
    cbIncomingSMP?: TCBIncomingSMP;
    private peer?;
    /**
     * @param secret - The secret which will be used to run SMP protocol with the remote peer
     * @param localPeerID - Our peer id. We will "register" our peer id on the peer server later
     *  when calling `connectToPeerServer`.
     * @param peerServerConfig - The information of the peer server. `defaultPeerServerConfig` is
     *  used if this parameter is not supplied.
     */
    constructor(secret: string, amount: number, localPeerID?: string | undefined, peerServerConfig?: TPeerServerConfig, timeout?: number);
    /**
     * @returns Our peer id.
     * @throws `ServerUnconnected` if `id` is called when `SMPPeer` is not connected to the peer
     *  server.
     */
    get id(): string;
    createConnDataHandler(stateMachine: SMPStateMachine, conn: Peer.DataConnection): (data: Message) => void;
    /**
     * Connect to the peer server with the infromation in `this.peerServerConfig`. A peer server
     *  allows us to discover peers and also others to find us. `connectToPeerServer` asynchronously
     *  waits until the connection to the peer server is established.
     * @throws `ServerFault` when the peer id we sent mismatches the one returned from the peer
     *  server.
     */
    connectToPeerServer(): Promise<void>;
    /**
     * Run SMP protocol with a peer. Connecting with a peer server is required before calling
     *  `runSMP`.
     * @param remotePeerID - The id of the peer.
     * @throws `ServerUnconnected` when `runSMP` is called without connecting to a peer server.
     * @returns The result of SMP protocol, i.e. our secret is the same as the secret of the
     *  remote peer.
     */
    runSMP(remotePeerID: string): Promise<{
        result: boolean;
        negotiatedAmount: number;
    }>;
    /**
     * Disconnect from the peer server.
     */
    disconnect(): void;
    /**
     * Emitted when connected to the peer server.
     * @param event - Event name
     * @param cb - Callback function
     */
    on(event: typeof eventServerConnected, cb: TCBServerConnected): void;
    /**
     * Emitted when the connection to the peer server is closed.
     * @param event - Event name
     * @param cb - Callback function
     */
    on(event: typeof eventServerDisconnected, cb: TCBServerDisconnected): void;
    /**
     * Emitted when an error occurs in networking.
     * @param event - Event name
     * @param cb - Callback function
     */
    on(event: typeof eventError, cb: TCBError): void;
    /**
     * Emitted when an incoming SMP request is finished.
     * @param event - Event name
     * @param cb - Callback function
     */
    on(event: typeof eventIncomingSMP, cb: TCBIncomingSMP): void;
}
export default SMPPeer;
