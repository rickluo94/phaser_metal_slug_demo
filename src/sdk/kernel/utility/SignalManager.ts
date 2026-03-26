type SignalKey = string | symbol;

type SignalEvent = {
    signalName: {
        signal: SignalKey;
        name: string;
    };
    CallBack?: () => void;
};

type SignalListener = (signalEvent: SignalEvent) => void;
type SignalMap = Record<string, SignalListener[]> & {
    [key: symbol]: SignalListener[];
};

export default class SignalManager {
    /**
     * 專門處理signal事件派發
     *  @Author  Robert
     */
    static instance?: SignalManager;
    signalDataMap: SignalMap;

    constructor() {
        this.signalDataMap = {} as SignalMap;
    }

    // 單例模式
    static get instances() {
        if (this.instance === undefined) {
            this.instance = new SignalManager();
        }
        return this.instance;
    }

    /**
     * 發布signal事件
     * @param {String} signalEvent signal obj
     */
    static dispatchEvent(signalEvent: SignalEvent) {
        let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
            // signalName.signal<unique唯一屬性>
            const key = signalEvent.signalName.signal;
            if (this.instances.signalDataMap !== undefined && this.instances.signalDataMap[key] !== undefined) {
                const eventFuncs = this.instances.signalDataMap[key];
                for (let i = 0; i < eventFuncs.length; i++) {
                    const fn = eventFuncs[i];
                    if (fn !== undefined) fn(signalEvent);
                }
            }
            if (timer) clearTimeout(timer);
            timer = null;
        }, 0);
    }

    // 註冊unique唯一屬性(註冊方式需要EnumKey格式)
    /**
     *
     * @param {String} event string
     * @param {Function} func function
     */
    static addEventListener(event: SignalKey, func: SignalListener) {
        const d = this.instances.signalDataMap[event];
        if (d === undefined || d.indexOf(func) === -1) {
            if (d === undefined) { this.instances.signalDataMap[event] = []; }
            this.instances.signalDataMap[event].push(func);
        }
    }

    static removeEventListener(event: SignalKey, func?: SignalListener) {
        if (func === undefined) {
            delete this.instances.signalDataMap[event];
            return;
        }
        const listeners = this.instances.signalDataMap[event];
        if (listeners === undefined) return;
        this.instances.signalDataMap[event] = listeners.filter((listener) => listener !== func);
        if (this.instances.signalDataMap[event].length === 0) delete this.instances.signalDataMap[event];
    }
}
