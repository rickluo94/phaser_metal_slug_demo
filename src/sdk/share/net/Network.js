import JsonLong from 'json-long';

/** 連線創建 */
export default class Network {
    /** 連線設定 */
    constructor(connectSetting, isDev, scene) {
        this.scene = scene;
        const { GameID, IP, UrlParams, GamePkg, GameFlow, Encrypt, MultiGameID } = connectSetting;
        this.connectSetting = { ...connectSetting, GameID: (MultiGameID || GameID) ?? GameID }
        this.isDev = isDev;
        // 防止未帶入 token 就連線
        if (!UrlParams.token) throw new Error('Illegal Parameters');
        // 協定
        this.gameFlow = new GameFlow(GamePkg, this.scene);
        // 連線設定
        this.ws = new GamePkg.WSC(IP, this.connectSetting.GameID, UrlParams, GamePkg, Encrypt);
        // 建立連線事件
        this.gameFlow.createConnectEvent(this.ws);
        // 取得連結網域
        this.connectURL = (window.location.hostname === 'localhost') ? GamePkg.DevHostName : window.location.hostname;
    }

    connect() {
        // 取得新的連線IP
        const url = `${window.location.protocol}//${this.connectURL}/clientinfo/ws`;
        const http = this.newHttpClient('POST', url, this.getNewSocketIP.bind(this));
        http.setRequestHeader('Content-type', 'application/json');
        http.send(`{"cdn":"${this.connectURL}", "gameCode":"${this.connectSetting.GameID}"}`);
    }

    getNewSocketIP(http, isTimeout) {
        let clientData = '';
        if (this.isJson(http.responseText) && !isTimeout) {
            // 轉換格式
            if (JSON.parse(http.responseText).wsData !== null) {
                this.ws.clientInfo = JSON.parse(http.responseText).wsData;
                clientData = this.ws.clientInfo.ws.trim();
            }
        }

        // 成功帶回ip的時候覆蓋原本預設的
        if (clientData) this.ws.ip = this.ws.getIP(clientData, this.connectSetting.GameID, this.connectSetting.UrlParams);
        if (clientData || this.isDev) this.ws.socketConnect();
    }

    /** 取得新的請求 */
    newHttpClient(type, url, callBack) {
        const http = new XMLHttpRequest();
        // 是否超出時間
        let isTimeout = false;
        (type === 'GET') ? http.open('GET', url) : http.open('POST', url, true);
        http.timeout = 3000;
        http.ontimeout = (() => { isTimeout = true; });
        http.onreadystatechange = (() => {
            // 不管成功或失敗都會跑到這狀態
            if (http.readyState === 4) callBack(http, isTimeout);
        });
        return http;
    }

    isJson(str) {
        try {
            if (typeof JsonLong.parse(str) === 'object') return true;
        } catch (e) {
            // Do nothing
        }
        return false;
    }
}
