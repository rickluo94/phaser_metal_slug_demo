type StateKey = string | number | symbol;

type EnumState = {
    name: string;
    signal: StateKey;
};

type StateValue = StateKey | EnumState;
type StateMap = Record<string, StateKey[]> & {
    [key: number]: StateKey[];
    [key: symbol]: StateKey[];
};

function isEnumState(state: StateValue): state is EnumState {
    return typeof state === 'object' && state !== null && 'signal' in state;
}

/**
* 流程狀態機(FSM)
* Finite State Machine
*  @Author  Robert
* */
export default class Fsm {
    currentState: StateValue;
    stateMap: StateMap;

    constructor(state: StateValue) {
        this.currentState = state;
        this.stateMap = {} as StateMap;
    }

    get state() {
        return isEnumState(this.currentState)
            ? this.currentState.signal
            : this.currentState;
    }

    /**
     * 從哪個狀態到哪個狀態
     * from ...to
     * @param {Any} state 可接受泛型註冊
     * @returns
     */
    from(state: StateValue) {
        // EnumKey
        if (isEnumState(state)) {
            return {
                to: (...nextState: StateValue[]) => {
                    if (this.stateMap[state.signal] === undefined) {
                        this.stateMap[state.signal] = [];
                    }
                    nextState.forEach((v) => {
                        if (!isEnumState(v)) {
                            throw new Error('"from" and "to" The two are inconsistent');
                        }
                        this.stateMap[state.signal].push(v.signal);
                    });
                }
            };
        }

        // 非EnumKey類
        return {
            to: (...nextState: StateValue[]) => {
                if (this.stateMap[state] === undefined) {
                    this.stateMap[state] = [];
                }
                nextState.forEach((v) => {
                    if (isEnumState(v) || typeof state !== typeof v) {
                        throw new Error('"from" and "to" The two are inconsistent');
                    }
                    this.stateMap[state].push(v);
                });
            }
        };
    }

    canGo(state: StateValue) {
        const m = this.stateMap;
        return isEnumState(state) && isEnumState(this.currentState)
            ? (m[this.currentState.signal] !== undefined && m[this.currentState.signal].indexOf(state.signal) !== -1)
            : (!isEnumState(this.currentState) && m[this.currentState] !== undefined && m[this.currentState].indexOf(state as StateKey) !== -1);
    }

    go(state: StateValue) {
        if (!this.canGo(state)) {
            throw new Error(`fsm error. check your state  from:${String(this.currentState)} to:${String(state)}`);
        }
        this.currentState = state;
    }

    jump(state: StateValue) {
        this.currentState = state;
    }

    is(state: StateValue) {
        return isEnumState(this.currentState) && isEnumState(state)
            ? this.currentState.signal === state.signal
            : this.currentState === state;
    }
}
