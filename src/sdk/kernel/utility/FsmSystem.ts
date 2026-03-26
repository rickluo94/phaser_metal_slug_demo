import Fsm from './Fsm';
import SignalSchedule from './SignalSchedule';

type StateKey = string | number | symbol;

type EnumState = {
    name: string;
    signal: StateKey;
};

type StateValue = StateKey | EnumState;

type SignalKey = string | symbol;

type SignalDescriptor = {
    name: string;
    signal: SignalKey;
};

type SignalItem = SignalKey | SignalDescriptor;
type SignalStep = SignalItem[];
type StateHandler = new (target?: unknown) => unknown;
type StateHandlerMap = Record<string, StateHandler> & {
    [key: number]: StateHandler;
    [key: symbol]: StateHandler;
};

function isEnumState(state: StateValue): state is EnumState {
    return typeof state === 'object' && state !== null && 'signal' in state;
}

export default class FsmSystem extends Fsm {
    target: unknown;
    stateMapFunc: StateHandlerMap;
    signalSH: SignalSchedule;

    constructor(nowState: StateValue, target: unknown = undefined, isLog = false) {
        super(nowState);
        this.target = target;
        this.stateMapFunc = {} as StateHandlerMap;
        this.signalSH = new SignalSchedule();
        this.signalSH.isLog(isLog);
        this.signalSH.onCompleteFunc = () => {
            if (this.stateMapFunc[this.state]) new this.stateMapFunc[this.state](this.target);
        };
    }

    AddStateFunc(state: StateValue, target: StateHandler) {
        if (isEnumState(state)) {
            this.stateMapFunc[state.signal] = target;
        } else {
            this.stateMapFunc[state] = target;
        }
        return this;
    }

    to(state: StateValue, list: SignalStep[] | undefined = undefined) {
        const bool = this.canGo(state);
        if (bool) {
            this.go(state);
            this.scheduleRun(list);
        }

        if (!bool) {
            isEnumState(state)
                ? console.warn(`Fsm 切換狀態失敗,請確認 state: ${state.name}`)
                : console.warn(`Fsm 切換狀態失敗,請確認 state: ${String(state)}`);
        }
        return bool;
    }

    scheduleRun(list: SignalStep[] | undefined) {
        if (list !== undefined) {
            this.signalSH.Register(list).Show();
        }
    }
}
