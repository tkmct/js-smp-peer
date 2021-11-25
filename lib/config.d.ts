declare type TPeerServerConfig = {
    host: string;
    port: number;
    path: string;
    secure: boolean;
    debug?: number;
};
declare const defaultPeerServerConfig: TPeerServerConfig;
export { defaultPeerServerConfig, TPeerServerConfig };
