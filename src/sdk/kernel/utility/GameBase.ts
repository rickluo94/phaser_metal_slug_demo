import SignalManager from './SignalManager';
import EventManager from './EventManager';
import SignalSchedule from './SignalSchedule';

type SignalKey = string | symbol;
type EventKey = string | symbol;

type EnumLike<T> = {
    signal: T;
};

type SignalLike = SignalKey | EnumLike<SignalKey>;
type EventLike = EventKey | EnumLike<EventKey>;

type SignalCallback = (signalEvent: unknown) => void;
type UiInitData = unknown;
type RegisteredSignal = {
    event: SignalKey;
    callback: SignalCallback;
};
type RegisteredEvent = {
    event: EventKey;
    callback: (eventName: EventKey, data?: unknown) => void;
};

type UiInstance = {
    game?: any;
    name?: string;
    initUI: (data?: UiInitData) => void;
    update?: (time: number, delta: number) => void;
    start?: () => void;
    destroy?: () => void;
};

type UiClass<T extends UiInstance = UiInstance> = new () => T;

function isEnumLike<T extends SignalKey | EventKey>(value: SignalLike | EventLike): value is EnumLike<T> {
    return typeof value === 'object' && value !== null && 'signal' in value;
}

export default class GameBase {
    game: any = null;
    UIClassList: UiInstance[] = [];
    UIList: UiInstance[] = [];
    registeredSignals: RegisteredSignal[] = [];
    registeredEvents: RegisteredEvent[] = [];

    initUI(data: UiInitData = undefined) {
        for (let i = 0; i < this.UIClassList.length; i++) {
            const ui = this.UIClassList[i];
            if (!ui.game) ui.game = data;
            ui.initUI(data);
            this.UIList.push(ui);
        }
    }

    addUI<T extends UiInstance>(ClassUI: UiClass<T>) {
        const ui = new ClassUI();
        ui.name = `${ClassUI.name}`;
        this.UIClassList.push(ui);
        return ui;
    }

    // 註冊signal<response callback> (備註:必須使用EnumKey來宣告Event name)
    addSignal(eventName: SignalLike, func: SignalCallback) {
        const eventKey = isEnumLike<SignalKey>(eventName) ? eventName.signal : eventName;
        SignalManager.addEventListener(eventKey, func);
        this.registeredSignals.push({ event: eventKey, callback: func });
    }

    // signal指派名稱進行CallBack
    SignalCallBack(eventName: SignalLike) {
        SignalSchedule.showOverCallBack(eventName as any);
    }

    // 偵聽event
    addEventListener(eventName: EventLike, func: (eventName: EventKey, data?: unknown) => void) {
        const eventKey = isEnumLike<EventKey>(eventName) ? eventName.signal : eventName;
        EventManager.addEventListener(eventKey, func);
        this.registeredEvents.push({ event: eventKey, callback: func });
    }

    // 發佈event
    dispatchEvent(eventName: EventLike, ...args: unknown[]) {
        // 判斷是否吃到EnumKey;
        isEnumLike<EventKey>(eventName)
            ? EventManager.dispatchEvent(eventName.signal, ...args)
            : EventManager.dispatchEvent(eventName, ...args);
    }

    destroy() {
        this.registeredSignals.forEach(({ event, callback }) => {
            SignalManager.removeEventListener(event, callback);
        });
        this.registeredSignals = [];

        this.registeredEvents.forEach(({ event, callback }) => {
            EventManager.removeEventListener(event, callback);
        });
        this.registeredEvents = [];
    }
}
