type EventKey = string | symbol;
type EventLike = EventKey | {
    signal: EventKey;
};

type EventCallback = (eventName: EventKey, data?: unknown) => void;
type EventMap = Record<string, EventCallback[]> & {
    [key: symbol]: EventCallback[];
};

export default class EventManager {
    static instance?: EventManager;
    eventList: EventMap;

    constructor() {
        this.eventList = {} as EventMap;
    }

    // 單例模式(_為私有屬性)
    static get instances() {
        if (this.instance === undefined) {
            this.instance = new EventManager();
        }
        return this.instance;
    }

    static addEventListener(event: EventKey, callback: EventCallback) {
        const d = this.instances.eventList[event];
        if (d === undefined) this.instances.eventList[event] = [];
        this.instances.eventList[event].push(callback);
    }

    static removeEventListener(event: EventKey, callback?: EventCallback) {
        if (callback === undefined) {
            delete this.instances.eventList[event];
            return;
        }
        const listeners = this.instances.eventList[event];
        if (listeners === undefined) return;
        this.instances.eventList[event] = listeners.filter((listener) => listener !== callback);
        if (this.instances.eventList[event].length === 0) delete this.instances.eventList[event];
    }

    static removeAllEventListeners() {
        this.instances.eventList = {} as EventMap;
    }

    static dispatchEvent(event: EventLike, data: unknown = undefined) {
        let eventName: EventKey;
        if (typeof event === 'object' && event !== null && 'signal' in event) {
            eventName = event.signal;
        } else {
            eventName = event as EventKey;
        }
        if (this.instances.eventList !== undefined && this.instances.eventList[eventName] !== undefined) {
            const eventFuncs = this.instances.eventList[eventName];
            for (let i = 0; i < eventFuncs.length; i++) {
                const fn = eventFuncs[i];
                if (fn !== undefined) fn(eventName, data);
            }
        }
    }

    static has(event: EventKey) {
        return this.instances.eventList[event] !== undefined;
    }
}
