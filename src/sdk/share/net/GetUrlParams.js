/**
 * 取得網址參數
 */
export default class GetUrlParams {
    // 取得 url 參數
    static get urlParams() {
        const decodeUrl = decodeURIComponent(window.location.href);
        const params = {};

        decodeUrl.replace(/[?&]+([^=&]+)=([^&]*)/gi, (map, key, value) => {
            params[key] = value;
        });

        return params;
    }

    // 取得 url 參數 字串型態
    static getParamsKey(...filter) {
        const data = GetUrlParams.urlParams;
        filter.forEach((item) => {
            delete data[item];
        });
        return `${Object.keys(data).map((item) => `${item}=${data[item]}`).join('&')}`;
    }

    /**
     * 設定當前語系
     * @param {Array} langs 設定檔的所有語系設定
     * @return {String} 當前語系
     */
    static getLanguage(langs, defLang = 'en') {
        let curLang = GetUrlParams.urlParams.language;
        // 部份語系代號共用
        if (curLang === 'vi-vn') curLang = 'vn';
        if (curLang === 'in') curLang = 'id';
        return (langs.indexOf(curLang) === -1) ? defLang : curLang;
    }
}
