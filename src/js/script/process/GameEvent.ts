/** 文本事件 */
export enum UITextEvent {
    ON_TEXT_UPDATE = 'ON_TEXT_UPDATE',
    ON_TEXT_CREDIT = 'ON_TEXT_CREDIT'
}

/** 常見事件 */
export enum CommonEvent {
    /** 秀提示訊息 */
    SHOW_TIP_MSG = 'SHOW_TIP_MSG',
    SHOW_MENU = 'SHOW_MENU',
    SHOW_HELP_VIEW = 'SHOW_HELP_VIEW'
}

// 遊戲狀態機(會依照各遊戲不同增減)
export enum GameState {
    _ = '_',
    /** 初始化 */
    INIT = 'INIT',
    /** 閒置 */
    IDLE = 'IDLE',
    /** 開始 */
    START = 'START',
}

/** 遊戲事件(自定義) */
// export enum GaEvent {
// }
