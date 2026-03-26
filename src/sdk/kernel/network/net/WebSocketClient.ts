import ManagerBase from '@kernel/network/handle/ManagerBase';
import { GoV2 } from '@kernel/network/model/PkgBase';

const EVENT_TYPE = {
    /** 當 WebSocket 成功建立連線時，會觸發 onopen 事件 */
    CONNECT: 'onopen',
    /** 當 WebSocket 連線被關閉時，會觸發 onclose 事件。 */
    CLOSE: 'onclose',
    /** 當 WebSocket 發生錯誤時，會觸發 onerror 事件 */
    ERROR: 'onerror',
    /** 處理函式中處理接收到的訊息，例如解析訊息內容、更新界面或執行相應的操作 */
    MESSAGE: 'onmessage'
} as const;

const STATE_TYPE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
} as const;

type SocketStatusEvent = (message?: unknown, data?: unknown) => void;
type SocketMessageEvent = (opcode: string, message: unknown) => void;
type UrlParams = Record<string, string>;
type DecodeHandler = (opcode: string, buffer: Uint8Array, client: WebSocketClient) => unknown;
type HandleItem = {
    content: {
        opcode: string;
    };
    decode: DecodeHandler;
};
type HandlePackage = {
    Handle: {
        getHandle: HandleItem[];
    };
};
type Encryption = {
    decrypt: (data: unknown) => unknown;
};
type EmitPacket = {
    message: ArrayLike<number>;
};
type SocketEventType = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];
type SocketEventHandler = ((event: Event | CloseEvent | MessageEvent<ArrayBuffer>) => void) | null;
type ManagedSocket = WebSocket & {
    onopen: ((this: WebSocket, ev: Event) => unknown) | null;
    onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null;
    onerror: ((this: WebSocket, ev: Event) => unknown) | null;
    onmessage: ((this: WebSocket, ev: MessageEvent<ArrayBuffer>) => unknown) | null;
};

export default class WebSocketClient extends ManagerBase {
    socket: ManagedSocket | null = null;
    ip: string;
    url?: string;
    binaryType: BinaryType;
    Encryption: Encryption;
    completeEvent?: SocketStatusEvent;
    connectCloseEvent?: SocketStatusEvent;
    disconnectEvent?: SocketStatusEvent;
    connectErrorEvent?: SocketStatusEvent;
    messageEvent?: SocketMessageEvent;
    #opcodeMap: Record<string, DecodeHandler> = {};

    static Content(opcode: string) { return { opcode }; }

    constructor(ip: string, gameID: string | number, urlParams: UrlParams, pkg: HandlePackage, encryption: Encryption | undefined = undefined, binaryType: BinaryType = 'arraybuffer') {
        super();
        this.ip = this.getIP(ip, gameID, urlParams);
        this.binaryType = binaryType;
        this.Encryption = encryption || { decrypt: (data) => data };
        // 註冊 Handle
        pkg.Handle.getHandle.forEach((ele) => { this.addOnResultEvent(ele); });
    }

    getIP(injectIP: string, gameID: string | number, urlParams: UrlParams) {
        let ip = `${injectIP.trim()}/ws/?token=${urlParams.token}&gameCode=${gameID}`;
        // 只使用此處的參數設定
        const usedParams = ['language', 'sitename', 'm_s', 'm_g'];
        Object.keys(urlParams).forEach((key) => {
            if (usedParams.indexOf(key) !== -1) {
                ip += `&${key}=${urlParams[key]}`;
            }
        });
        return ip;
    }

    resetIP(newToken: string) {
        const regex = /token=[^&]*/;
        this.ip = this.ip.replace(regex, `token=${newToken}`);
        if (this.url) this.url = this.url.replace(regex, `token=${newToken}`);
        return this;
    }

    get state() {
        return (this.socket) ? this.socket.readyState : STATE_TYPE.CLOSED;
    }

    // 連線中
    get isConnecting() {
        return (this.socket) ? (this.socket.readyState === STATE_TYPE.CONNECTING) : false;
    }

    // 是否已連接且可以正常通訊
    get isOpen() {
        return (this.socket) ? (this.socket.readyState === STATE_TYPE.OPEN) : false;
    }

    socketConnect(url?: string, binaryType?: BinaryType) {
        if (url) this.url = url;
        if (binaryType) this.binaryType = binaryType;

        this.clear();
        // 创建 WebSocket 连接
        this.socket = new WebSocket(this.url || this.ip) as ManagedSocket;
        this.socket.binaryType = this.binaryType;
        this.#addPeerStatusListener(EVENT_TYPE.CONNECT, this.onConnect.bind(this));
        this.#addPeerStatusListener(EVENT_TYPE.CLOSE, this.onClose.bind(this));
        this.#addPeerStatusListener(EVENT_TYPE.ERROR, this.onConnectError.bind(this));
        this.#addPeerStatusListener(EVENT_TYPE.MESSAGE, this.onMessage.bind(this));
    }

    clear() {
        if (!this.socket) return;

        // 清除事件
        this.#removeAllSocketEvent();
        this.socket = null;
    }

    // 關閉連線
    closeSocket(closeString = 'Connect Close', data?: unknown) {
        const { OPEN, CONNECTING } = STATE_TYPE;
        if (this.state === OPEN) this.socket?.close();
        if (this.state === CONNECTING || this.state === OPEN) return;
        if (typeof this.disconnectEvent === 'function') this.disconnectEvent(closeString, data);

        this.#removeAllSocketEvent();
    }

    #addPeerStatusListener(type: SocketEventType, fun: SocketEventHandler) {
        if (!this.socket) return;
        this.socket[type] = fun as never;
    }

    #removeAllSocketEvent() {
        this.#addPeerStatusListener(EVENT_TYPE.CONNECT, null);
        this.#addPeerStatusListener(EVENT_TYPE.CLOSE, null);
        this.#addPeerStatusListener(EVENT_TYPE.ERROR, null);
        this.#addPeerStatusListener(EVENT_TYPE.MESSAGE, null);
    }

    // 接到 server 回傳 connect 事件
    onConnect(data: Event) {
        if (typeof this.completeEvent !== 'function') return;

        (this.isOpen)
            ? this.completeEvent(data)
            : this.onConnectError(data);
    }

    /** WebSocket 連線已關閉 evt.code */
    onClose(data: CloseEvent) {
        if (this.state === STATE_TYPE.CONNECTING || this.state === STATE_TYPE.OPEN) return;
        if (typeof this.connectCloseEvent === 'function') this.connectCloseEvent('Connect Close', data);
    }

    onConnectError(data: unknown) {
        if (typeof this.connectErrorEvent === 'function') this.connectErrorEvent('Connect Close', data);
    }

    // 設定連線成功事件
    set setOnComplete(externalEvent: SocketStatusEvent | undefined) {
        this.completeEvent = externalEvent;
    }

    // 設定連線中斷事件
    set setOnConnectClose(externalEvent: SocketStatusEvent | undefined) {
        this.connectCloseEvent = externalEvent;
    }

    // 設定斷線事件
    set setOnDisconnectEvent(externalEvent: SocketStatusEvent | undefined) {
        this.disconnectEvent = externalEvent;
    }

    // 設定連線錯誤事件
    set setOnConnectError(externalEvent: SocketStatusEvent | undefined) {
        this.connectErrorEvent = externalEvent;
    }

    // 訊息內容
    set setOnMessage(externalEvent: SocketMessageEvent | undefined) {
        this.messageEvent = externalEvent;
    }

    /** 接收到封包內容 */
    onMessage(evt: MessageEvent<ArrayBuffer>) {
        if (typeof this.messageEvent !== 'function') return;
        const data = GoV2.Decode(evt.data);
        const pkgDecode = this.#opcodeMap[data.opcode];
        if (pkgDecode) {
            const message = pkgDecode(data.opcode, data.buffer, this);
            this.messageEvent(data.opcode, message);
        }
    }

    /** 發送 */
    emitEvent(pkt: EmitPacket) {
        this.socket?.send(GoV2.Encode(pkt.message));
    }

    /** 註冊Server opcode 事件 */
    addOnResultEvent(data: HandleItem) {
        const { content, decode } = data;
        this.#opcodeMap[content.opcode] = decode;
    }

    addEvent(data: HandleItem) {
        this.addOnResultEvent(data);
    }
}
