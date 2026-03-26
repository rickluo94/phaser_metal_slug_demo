/* eslint-disable import/no-unresolved */
import CryptoJS from 'crypto-js';

type EncryptMessageConfig = {
    E: string;
    V: number;
};

type EncryptInput = Record<string, unknown> & {
    '1'?: string;
};

export default class Encrypt {
    ivOrigin: string;
    ivData: CryptoJS.lib.WordArray;
    key: CryptoJS.lib.WordArray;
    setKeySize: number;
    toggle?: boolean;
    newMessage?: EncryptMessageConfig;

    constructor(key = '60A299E7243EDEA7') {
        this.ivOrigin = this.generateKey();
        this.ivData = CryptoJS.enc.Utf8.parse(this.ivStr);
        this.key = CryptoJS.enc.Utf8.parse(key);
        this.setKeySize = 128 / 8;
    }

    /**
     * 是否開啟加解密功能
     * @param {Boolean} bool Boolean
     */
    setToggle(bool: boolean) {
        this.toggle = bool;
    }

    get Toggle() {
        return this.toggle;
    }

    get iv() {
        return this.ivData;
    }

    get ivStr() {
        return this.ivOrigin;
    }

    /**
     * 隨機產生一個 16 進制的 key
     * @return {String} 16
     */
    generateKey() {
        let key = '';
        const hex = '0123456789abcdef';

        for (let i = 0; i < 16; i++) {
            key += hex.charAt(Math.floor(Math.random() * 16));
        }

        return key;
    }

    encrypt(data: EncryptInput) {
        const handleData = data;

        if (this.toggle && typeof data['1'] === 'string') {
            const newData = this.encryptStringAES(data['1']);
            handleData['1'] = (this.newMessage !== undefined)
                ? this.changeNewEncryptMessage(newData, this.ivStr)
                : this.ivStr + newData;
        }

        return handleData;
    }

    changeNewEncryptMessage(msg: string, insertData: string) {
        return msg.slice(0, this.newMessage!.V) + insertData + msg.slice(this.newMessage!.V);
    }

    decrypt(data: string) {
        const handleData = (this.toggle) ? this.decryptStringAES(data) : data;
        return handleData;
    }

    saveEncryptData(data: EncryptMessageConfig) {
        // 解析init response時的資料(K和V值)
        this.newMessage = data;
        this.key = CryptoJS.enc.Utf8.parse(data.E);
        this.setKeySize = data.E.length;
    }

    decryptStringAES(strEncryptText: string) {
        const strE = strEncryptText;

        // 初登入後
        const newStr = (this.newMessage !== undefined)
            ? strE.slice(0, this.newMessage.V) + strE.slice(this.newMessage.V + 16, strE.length)
            : strE.substring(this.setKeySize);

        const newIv = (this.newMessage !== undefined)
            ? CryptoJS.enc.Utf8.parse(strE.slice(this.newMessage.V, 16 + this.newMessage.V))
            : CryptoJS.enc.Utf8.parse(strE.slice(0, 16));

        const decrypted = CryptoJS.AES.decrypt(newStr, this.key, {
            keySize: this.setKeySize,
            iv: newIv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * @param  {Str} strOrignText     hashed strip
     * @return {Str}                  encrypted strip
     */
    encryptStringAES(strOrignText: string) {
        const encrypted = CryptoJS.AES.encrypt(strOrignText, this.key, {
            keySize: this.setKeySize,
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }
}
