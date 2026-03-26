type SocketLike = {
    addEventListener: (eventName: string, listener: unknown, context: unknown) => {
        eventName: string;
        listener: unknown;
        context: unknown;
    };
    emitApiEvent: (opcode: number, data: unknown[], isFormat?: boolean) => {
        opcode: number;
        data: unknown[];
        isFormat: boolean;
    };
    connect: (hostName: string) => {
        hostName: string;
    };
    [key: string]: unknown;
};

type ExternalResources = {
    loading: Record<string, Record<string, unknown>>;
    sound: Record<string, Record<string, unknown>>;
    images: Record<string, Record<string, unknown>>;
    currencyPaths: Record<string, unknown>;
};

type MainPageModel = {
    init: (scene: unknown) => void;
    update: (time: number, delta: number) => void;
    destroy?: () => void;
};

type FsmModel = {
    to: (state: unknown, data?: unknown) => void;
    [key: string]: unknown;
};

type FrameToolModel = {
    ignoreLoadError: boolean;
    isEditor: boolean;
    UIPos: unknown;
};

type UrlParamsModel = {
    title: string;
    muted: string;
    fps: string;
    dollarsign: string;
    hideEmu: string;
    skipLoad: string;
    [key: string]: string;
};

type ClientInfoModel = {
    help: string;
    member: string;
    activity: string;
};

/** # 遊戲資料 */
export default class Model {
    /** # 遊戲流程變數(遊戲內部使用) */
    static Game: Record<string, unknown> = {};
    /** 設定 */
    static Setting: Record<string, unknown> = {};
    /** # 狀態機 */
    static Fsm: FsmModel | null = null;
    /** 使用者錢包 */
    static Wallet: unknown = null;
    /** 資源路徑 */
    static External: ExternalResources = {
        loading: {}, // 目前 loading 專案客製化居多, 讓製作者去調整
        /** 音效路徑 */
        sound: {},
        /** 圖檔路徑 */
        images: {},
        /** 幣值資源路徑 */
        currencyPaths: {}
    };
    /** 主頁遊戲 */
    static MainPage: MainPageModel | null = null;
    /** 當前 UI 定位 */
    static UIPos: Record<string, unknown> = {};
    /** UI定位資料版本 */
    static UIPosMap: Record<string, unknown> = {};
    /** 音效播放器 */
    static Sound: unknown = null;
    /** 底層音效 (大多都是Base的業務邏輯居多) */
    static BaseSound: unknown = null;
    /** 是否為DEV */
    static IsDev = false;
    /** 是否回放 */
    static IsReplay = false;
    /** 是否有活動 */
    static HasActivity = false;
    /** 換手氣機台值('0': 未開啟, '1~3': 當前機台, 兩位數: 當局有做切換) */
    static LuckyRoomString = '0';
    /** 回放播放單例 */
    static Replay: unknown = null;
    /** 封包協定 */
    static PROTO: unknown = null;
    /** Network */
    static Network: unknown = null;
    /** Socket */
    static Socket: SocketLike = {
        /**
         * 外部事件綁定
         * @param {string} eventName 事件名稱
         * @param {[type]} listener  事件
         * @param {[type]} context   物件指向目標 (外部的事件的 this)
         */
        addEventListener: (eventName, listener, context) => ({ eventName, listener, context }),
        /**
         * 發送封包事件
         * @param {Number} opcode    opcode
         * @param {Array} data  要傳給 api 的 array 參數
         * @param {Boolean} isFormat 是否需要組成特別格式 Ex: True: {1:內容}、 False: 原始格式
         */
        emitApiEvent: (opcode, data, isFormat = true) => ({ opcode, data, isFormat }),
        /** 執行 connect 連線 */
        connect: (hostName) => ({ hostName })
    };
    /** 框架工具組 */
    static FrameTool: FrameToolModel = {
        /** 是否忽略加載失敗 */
        ignoreLoadError: true,
        /** UIPos 編譯器是否開啟 */
        isEditor: false,
        /** UIPos 編譯器 */
        UIPos: null
    };
    /** 網址列資料 */
    static UrlParams: UrlParamsModel = {
        // 網址列標題
        title: '',
        // 初始時是否關閉音效
        muted: 'N',
        // 開發使用 fps
        fps: 'N',
        // 是否顯示幣別符號
        dollarsign: 'Y',
        // 隱藏 emulator
        hideEmu: 'N',
        // 初始時略過PLAY按鈕
        skipLoad: 'N'
    };
    /** clientInfo資料 */
    static ClientInfo: ClientInfoModel = {
        // help頁
        help: '',
        // 會員系統
        member: '',
        // 活動頁
        activity: ''
    };
}
