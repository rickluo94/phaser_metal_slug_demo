import Signal from './Signal';
import SignalManager from './SignalManager';

type SignalKey = string | symbol;

type SignalDescriptor = {
    name: string;
    signal: SignalKey;
};

type SignalItem = SignalKey | SignalDescriptor;
type SignalStep = SignalItem[];

function isSignalDescriptor(signalName: SignalItem | null): signalName is SignalDescriptor {
    return typeof signalName === 'object' && signalName !== null && signalName.signal !== undefined;
}

function normalizeSignal(signalName: SignalItem | null): SignalDescriptor {
    return isSignalDescriptor(signalName)
        ? signalName
        : { name: String(signalName), signal: signalName as SignalKey };
}

export default class SignalSchedule {
    static instance: SignalSchedule;
    list: SignalStep[];
    showNextIdx: number;
    showSignalCount: number;
    onCompleteFunc: (() => void) | null;
    logBool?: boolean;
    keys: SignalKey[];

    constructor() {
        SignalSchedule.instance = this;
        // 排程 array
        this.list = [];
        // 目前執行序號
        this.showNextIdx = 0;
        // 執行次數
        this.showSignalCount = 0;
        /// 設定結束排成的偵聽函數
        this.onCompleteFunc = null;
        this.keys = [];
    }

    // 設定log
    isLog(bool: boolean) {
        this.logBool = bool;
    }

    // 由 註冊動畫事件序列並且初始化參數
    Register(value: SignalStep[]) {
        this.list = value;
        this.showNextIdx = 0;
        this.showSignalCount = 0;
        return this;
    }

    // 執行排程
    Show() {
        const len = this.list.length;
        if (len === 0) {
            // 結束排程管理
            this.overBeForeComplete();
            return;
        }

        this.keys = [];
        const datas: string[] = [];
        for (let i = 0; i < len; i++) {
            if (i === this.showNextIdx) {
                this.showSignalCount = this.list[i].length;
                if (this.showSignalCount === 0) {
                    throw new Error('signal list is empty');
                }

                this.list[i].forEach((item) => {
                    if (!item) throw new Error('Signal name is wrong! Please check your signal name');
                    const signalData = normalizeSignal(item);
                    this.keys.push(signalData.signal);
                    datas.push(signalData.name);
                    const event = new Signal(signalData);
                    event.CallBack = () => SignalSchedule.showOverCallBack(signalData);
                    SignalManager.dispatchEvent(event);
                });
                break;
            }
        }

        // 沒有宣告賦值一樣會判斷 false, 除非有設定 isLog 的函數才會宣告並且賦值, 沒使用到isLog功能則this的屬性沒有此logBool參數(發布正式站不會開log功能)
        if (this.logBool) { console.warn('發布Signals:', datas); }
    }

    // 結束排程管理
    overBeForeComplete() {
        if (this.onCompleteFunc) this.onCompleteFunc();
    }

    /**
    * signal完成需觸發此處並且通知 signal 的名稱
    * @param {String} signalName Type EnumKey
    */
    static showOverCallBack(signalName: SignalItem | null = null) {
        const signalData = normalizeSignal(signalName);
        const idx = this.instance.keys.indexOf(signalData.signal);
        if (this.instance.logBool) {
            console.warn('callback:', (idx !== -1) ? signalData.name : `無此或重複呼叫 ${signalData.name}`);
        }
        if (idx === -1) return;
        // 已呼叫移除紀錄避免第二次呼叫
        this.instance.keys.splice(idx, 1);
        this.instance.showSignalCount--;
        // 收到非發布出去的signal並且無視跳出 or 收到一次事件 count - 1並且刪除此紀錄避免第二次呼叫, 當count還大於0代表還有其他事件需等待
        if (this.instance.showSignalCount !== 0) return;
        // 切換下一個階段 or 已完成排程
        this.instance.showNextIdx++;
        (this.instance.showNextIdx < this.instance.list.length)
            ? this.instance.Show()
            : this.instance.overBeForeComplete();
    }
}
