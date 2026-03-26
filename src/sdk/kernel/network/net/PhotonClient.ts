type PhotonHandleContent = {
    opcode: number;
    type: string;
};

type PhotonHandle = {
    content: PhotonHandleContent;
    callBack: (evt: unknown, client: PhotonClient) => unknown;
};

type PhotonPackage = {
    Handle: {
        getHandle: PhotonHandle[];
    };
};

type PhotonPacket = {
    opcode: number;
    sendData: unknown[];
};

type PhotonMessageEvent = (opcode: number, message: unknown) => void;
type PhotonStatusEvent = (message?: unknown) => void;
type PhotonEncryption = {
    decrypt: (data: unknown) => unknown;
};

type PhotonResponseEvent = {
    [key: string]: unknown;
};

export default class PhotonClient extends Photon.PhotonPeer {
    static TYPE = {
        CSC: 'CSC',
        SC: 'SC'
    } as const;

    binaryType: string;
    Encryption: PhotonEncryption;
    completeEvent?: PhotonStatusEvent;
    connectCloseEvent?: PhotonStatusEvent;
    disconnectEvent?: PhotonStatusEvent;
    connectErrorEvent?: PhotonStatusEvent;
    messageEvent?: PhotonMessageEvent;

    static Content(opcode: number, type: string) { return { opcode, type }; }

    /**
     * photon 連線
     * @param  {String} url           連線地址
     */
    constructor(url: string, gameID: string | number, urlParams: { token: string }, pkg: PhotonPackage, encryption: PhotonEncryption | undefined = undefined, binaryType = 'arraybuffer') {
        super(Photon.ConnectionProtocol.Ws, PhotonClient.getIP(url, gameID, urlParams));
        // 設定是否激活 0 : 不觸發激活動作
        // this.keepAliveTimeoutMs = 0;
        this.binaryType = binaryType;
        this.Encryption = encryption || { decrypt: (data) => data };
        // 註冊 Handle
        pkg.Handle.getHandle.forEach((ele) => {
            (ele.content.type === PhotonClient.TYPE.CSC)
                ? this.addOnResultEvent(ele)
                : this.addEvent(ele);
        });
    }

    static getIP(injectIP: string, gameID: string | number, urlParams: { token: string }) {
        return `${injectIP}/gameid=${gameID}?token=${urlParams.token}`;
    }

    // 綁定基本事件 發送連線
    socketConnect() {
        this.addPeerStatusListener('connect', this.onConnect);
        this.addPeerStatusListener('connecting', this.onConnecting);
        this.addPeerStatusListener('connectFailed', () => {});
        this.addPeerStatusListener('connectClosed', this.connectClose);
        this.addPeerStatusListener('disconnect', this.onDisconnect);
        this.addPeerStatusListener('error', this.onConnectError);
        this.addPeerStatusListener('timeout', this.onConnectTimeout);
        this.connect('');
    }

    clear() {}

    // 關閉連線
    closeSocket() {
        this.disconnect();
    }

    // 連線中
    onConnecting() {}

    // 接到 server 回傳 connect 事件
    onConnect() {
        if (typeof this.completeEvent !== 'function') return;
        (this.isConnected()) ? this.completeEvent() : this.onConnectError();
    }

    // 斷線事件
    connectClose() {
        if (typeof this.connectCloseEvent === 'function') this.connectCloseEvent('Connect Close');
    }

    // 斷線事件
    onDisconnect() {
        if (typeof this.disconnectEvent === 'function') this.disconnectEvent('Disconnect');
    }

    // 連線失敗
    onConnectError() {
        if (typeof this.connectErrorEvent === 'function') this.connectErrorEvent('Connect Error');
    }

    // 連線失敗
    onConnectTimeout() {}

    // 設定連線成功事件
    set setOnComplete(externalEvent: PhotonStatusEvent | undefined) {
        this.completeEvent = externalEvent;
    }

    // 設定連線中斷事件
    set setOnConnectClose(externalEvent: PhotonStatusEvent | undefined) {
        this.connectCloseEvent = externalEvent;
    }

    // 設定斷線事件
    set setOnDisconnectEvent(externalEvent: PhotonStatusEvent | undefined) {
        this.disconnectEvent = externalEvent;
    }

    // 設定連線錯誤事件
    set setOnConnectError(externalEvent: PhotonStatusEvent | undefined) {
        this.connectErrorEvent = externalEvent;
    }

    // 訊息內容
    set setOnMessage(externalEvent: PhotonMessageEvent | undefined) {
        this.messageEvent = externalEvent;
    }

    /** 接收 */
    onResponse(content: PhotonHandleContent, packDecode: (evt: unknown, client: PhotonClient) => unknown, evt: PhotonResponseEvent) {
        if (typeof this.messageEvent !== 'function') return;
        // 會經過 pb 註冊的opcode進行 decode 內容
        const message = packDecode(evt, this);
        // 當是CSC模式時, 且解析玩的封包是null則會跳至錯誤事件
        if (content.type !== 'SC' && !message) {
            if (typeof this.connectErrorEvent === 'function') this.connectErrorEvent(evt);
            return;
        }
        // 發送給client端, 處理後的封包 opcode + message; CSC or SC
        this.messageEvent(content.opcode, message);
    }

    /**
     * 發送 opcode 事件
     */
    emitEvent(pkt: PhotonPacket) {
        this.sendOperation(pkt.opcode, pkt.sendData);
    }

    /**
     * 註冊Server opcode 回調事件
     */
    addOnResultEvent(data: PhotonHandle) {
        const { content, callBack } = data;
        this.addResponseListener(content.opcode, this.onResponse.bind(this, content, callBack));
    }

    addEvent(data: PhotonHandle) {
        const { content, callBack } = data;
        this.addEventListener(content.opcode, this.onResponse.bind(this, content, callBack));
    }
}
