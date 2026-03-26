type ExternalEventListener<T = unknown> = (data?: T) => void;

type ExternalEventMap = Record<string, {
    listener: ExternalEventListener;
    context: unknown;
}>;

export default class ManagerBase {
    externalMap: ExternalEventMap;

    constructor() {
        this.externalMap = {};
    }

    /**
     * 外部事件綁定
     * @param {string} eventName 事件名稱
     * @param {[type]} listener  事件
     * @param {[type]} context   物件指向目標 (外部的事件的 this)
     */
    addEventListener(eventName: string, listener: ExternalEventListener, context: unknown) {
        if (typeof listener !== 'function') {
            throw new Error('listener is not a "Function"');
        }

        if (this.externalMap[eventName] === undefined) {
            this.externalMap[eventName] = {
                listener: () => {},
                context: undefined
            };
        }
        this.externalMap[eventName].listener = listener;
        this.externalMap[eventName].context = context;
    }

    /**
     * 發佈對外事件
     * @param  {string} eventName 事件名稱
     * @param  {any}    data      資料
     */
    dispatch(eventName: string, data: unknown = undefined) {
        if (Object.prototype.hasOwnProperty.call(this.externalMap, eventName)) {
            const callObj = this.externalMap[eventName];

            if (data !== undefined) {
                callObj.listener.call(callObj.context, data);
                return;
            }

            callObj.listener.call(callObj.context);
        }
    }

    /**
     * 移除外部監聽事件
     * @param  {string} eventName 事件名稱
     */
    removeEventAll(eventName: string) {
        if (Object.prototype.hasOwnProperty.call(this.externalMap, eventName)) {
            delete this.externalMap[eventName];
        }
    }
}
