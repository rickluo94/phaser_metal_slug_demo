import np from 'number-precision';
// 關閉「is beyond boundary when transfer to integer, the results may not be accurate」警告
np.enableBoundaryChecking(false);

type CurrencyFormatOption = {
    kPoint?: string;
    mPoint?: string;
};

/** # 數學工具
 * 使用 number-precision 插件
*/

// [github](https://github.com/nefe/number-precision)
// [參考 issue](https://github.com/camsong/blog/issues/9)

export default class ToolMath {
    /** 加法
     * @param {...number} numbers - 可以傳遞任意數量的數字
     */
    static accAdd(...numbers: number[]) {
        return np.plus(...numbers);
    }

    /** 減法
     * @param {...number} numbers - 可以傳遞任意數量的數字
     */
    static accSub(...numbers: number[]) {
        return np.minus(...numbers);
    }

    /** 乘法
     * @param {...number} numbers - 可以傳遞任意數量的數字
     */
    static accMul(...numbers: number[]) {
        return np.times(...numbers);
    }

    /** 除法
     * @param {...number} numbers - 可以傳遞任意數量的數字
     */
    static accDiv(...numbers: number[]) {
        return np.divide(...numbers);
    }

    /** 四捨五入
     * @param {number} number
     * @param {number} [decimal=2] 小數點後第幾位, 預設 2
     */
    static round(number: number, decimal = 2) {
        return np.round(number, decimal);
    }

    /** 取得精確數值\
     * ex. \
     * ToolMath.strip(0.15/8) = 0.01875, \
     * ToolMath.strip(0.15/8, 3) = 0.0187
     * @param {any} number
     * @param {number} precision 精度 (從不等於0的數字開始計算第n個)
     */
    static strip(number: number, precision?: number) {
        return np.strip(number, precision);
    }

    /** 將圖片 URL 轉為 base64 字串 */
    static toDataURL(src: string, callback: (result: string | ArrayBuffer | null) => void) {
        const http = new XMLHttpRequest();
        http.onload = () => {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                callback(fileReader.result);
            };
            fileReader.readAsDataURL(http.response);
        };
        http.open('GET', src, true);
        http.responseType = 'blob';
        http.send(null);
    }

    /**
     * 轉換爲千分位格式
     * @param {Number} value 欲轉換數字
     * @param {Number} toFixedLength 顯示小數後幾點位數 預設為0
     */
    static addThousandthSign(value: number, toFixedLength = 0) {
        const regExpInfo = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
        let ret;
        ret = value.toString().replace(regExpInfo, '$1,');
        if (toFixedLength > 0) {
            const resultValue = ((parseFloat(value.toString()) === value) ? Math.round(value * 100) / 100 : 0).toFixed(toFixedLength);
            ret = resultValue.toString().replace(regExpInfo, '$1,');
        }
        return ret;
    }

    /**
     * 格式化金錢，顯示 K、M
    */
    static formatCurrency(money: number, { kPoint = 'k', mPoint = 'M' }: CurrencyFormatOption = {}) {
        if (money < 1) return money;

        const moneyLength = money.toString().split('.')[0].length;

        let dollarMoney: number | string = money;

        if (Number(ToolMath.accDiv(Number(dollarMoney), 1000)) < 1) return dollarMoney;
        // 面值超過四位數時轉換的代號，ex:1000要顯示1K
        if (moneyLength >= 4 && moneyLength <= 6) dollarMoney = `${ToolMath.accDiv(Number(dollarMoney), 1000)}${kPoint}`;
        // // 面值超過六位數時轉換的代號，ex:1000000要顯示1M
        if (moneyLength >= 7) dollarMoney = `${ToolMath.accDiv(Number(dollarMoney), 1000000)}${mPoint}`;

        return dollarMoney;
    }
}
