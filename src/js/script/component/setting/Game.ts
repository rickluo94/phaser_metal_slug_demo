/** 遊戲變數區 */
export const Game = {
    /** 語系 */
    languageID: '',
    /** 角色圖集 key */
    selectedCharacterAtlas: 'marco'
};

/** table 格式表 */
export const textStyleMap = {
    settle1: { fontFamily: 'Arial', fontSize: 24, color: '#FFFFFF' },
    settle2: { fontFamily: '微軟正黑體', fontSize: 21, color: '#FFFFFF' }
} as const;

/** 設定區 */
export const Setting = {
    /** 文字表設定 (系統字專用) */
    langTextTable: {
        main: {
            infoUI: {
                winScore: { style: textStyleMap.settle1, lang: { 'zh-tw': '贏分' } },
                totalScore: { style: textStyleMap.settle2, lang: { 'zh-tw': '總得分' } }
            }
        }
    },
    /** 彈窗內定訊息 */
    messageTip: {
        'zh-tw': {
            AMOUNT_ERROR: '玩家金額不足'
        }
    }
} as const;
