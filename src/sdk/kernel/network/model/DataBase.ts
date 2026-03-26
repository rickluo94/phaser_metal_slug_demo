type SendDataInput = Record<string, unknown>;
type SendDataOutput = [number, string];

export default class DataBase {
    /**
     *  # 封包傳送格式
     *  @Author  Robert
     *  @Ver     0.1.2
     */

    // [傳送資料] 把所有參數組在同一個Object當作只有一組數字參數傳送
    static sendData(data: SendDataInput): SendDataOutput {
        const ary: [number, string?] = [1];
        const obj: Record<string, unknown> = {};

        Object.keys(data).forEach((keyInx) => {
            const item = data[keyInx];
            // 判斷為Object非Array
            (typeof item === 'object' && item !== null && !Array.isArray(item)) ? Object.assign(obj, item) : obj[keyInx] = item;
        });

        const singleData = JSON.stringify(obj);
        ary.push(singleData);

        return ary as SendDataOutput;
    }
}
