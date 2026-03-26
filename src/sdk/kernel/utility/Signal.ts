type SignalKey = string | symbol;

type SignalDescriptor = {
    name: string;
    signal: SignalKey;
};

type SignalInput = SignalKey | SignalDescriptor;

function isSignalDescriptor(key: SignalInput): key is SignalDescriptor {
    return typeof key === 'object' && key !== null && key.signal !== undefined;
}

export default class Signal {
    signalName: SignalDescriptor;
    CallBack: () => void;

    /**
    * 專門處理signal事件派發
    *  @Author  Robert
    *  @param key type EnumKey
    * */
    constructor(key: SignalInput) {
        this.signalName = isSignalDescriptor(key)
            ? key
            : { name: String(key), signal: key };
        this.CallBack = () => {};
    }

    get EventName() {
        return this.signalName.signal;
    }
}
