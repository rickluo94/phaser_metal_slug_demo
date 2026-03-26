import Model from '@kernel/utility/Model';
import CommonBase from '@share/game/CommonBase';
// import Wallet from '@share/user/Wallet';
import { CommonEvent, GameState } from '@script/process/GameEvent';
import { EffectState } from '@script/process/EffectStates';
import GameBase from '@kernel/utility/GameBase';

type ProtoOpCode = Record<string, string | number>;
type ProtoPkg = Record<string | number, (data: unknown) => unknown> & {
    CS_INIT_INFO?: (data: { GameCode: string; ClientVersion: string }) => unknown;
};

type ProtoModel = {
    OpCode: ProtoOpCode;
    PKG: ProtoPkg;
    pkgVersion: string | number;
    [key: string]: unknown;
};

type SocketLike = {
    emitEvent: (data: unknown) => void;
    setOnMessage?: (opcode: string | number, data: unknown) => void;
    setOnComplete?: (data?: unknown) => void;
    setOnConnectClose?: (data?: unknown) => void;
    setOnDisconnectEvent?: (data?: unknown) => void;
    setOnConnectError?: (data?: unknown) => void;
    [key: string]: unknown;
};

type ModelDynamicMap = Record<string | number, unknown>;

type ModelSocketBridge = typeof Model.Socket & SocketLike;

type ErrorMessageData = {
    ErrorMessage: string;
    ErrorCode: string | number;
};

type ConnectScene = unknown;

declare const process: {
    env: {
        GameID?: string;
    };
};

class GameMethod extends GameBase {
    gf: GameFlow;
    apiMap: Record<string | number, (data?: unknown) => void>;
    OpCode: ProtoOpCode;

    constructor(gf: GameFlow, OpCode: ProtoOpCode) {
        super();
        this.gf = gf;
        this.apiMap = {};
        this.OpCode = OpCode;

        // 註冊 Opcode
        this.addOpcodeEvent(OpCode.SC_INIT_INFO, this.onConfig.bind(this));
        this.addOpcodeEvent(OpCode.SC_ERROR_MESSAGE, this.onErrorMessage.bind(this));
    }

    write(opcode: string | number, data: unknown) {
        // console.warn('SC', opcode, data);
        // 自動寫入Model
        const proto = Model.PROTO as ProtoModel;
        if (!proto.PKG[opcode]) return;
        (Model as unknown as ModelDynamicMap)[opcode] = proto.PKG[opcode](data);
        // 判斷是否註冊
        const fn = this.apiMap[opcode];
        if (fn) fn((Model as unknown as ModelDynamicMap)[opcode]);
    }

    addOpcodeEvent(opcode: string | number, fun: (data?: unknown) => void) {
        this.apiMap[opcode] = fun;
    }

    /** 連線成功 */
    onConnect() {
        // 連線成功後 發送CONFIG 取得遊戲設定等
        const proto = Model.PROTO as ProtoModel;
        if (!proto.PKG.CS_INIT_INFO) return;

        const m = proto.PKG.CS_INIT_INFO({
            GameCode: `${process.env.GameID}`,
            ClientVersion: `${proto.pkgVersion}`
        });
        (Model.Socket as unknown as ModelSocketBridge).emitEvent(m);
    }

    /** 使用者餘額 */
    onCredit() {
        // 範例 更新額度  需要看protocol的pkg定義 Ex: Model.Wallet.update(Model.XXXXXX.Balance);
        // Model.Wallet.update(Model.SC_SYNC_BALANCE.Balance);
    }

    /** 取得遊戲設定 */
    onConfig() {
        // 範例 更新額度  需要看protocol的pkg定義 Ex: Model.Wallet.update(Model.XXXXXX.Balance);
        // Model.Wallet.update(Model.XXXXXX.Balance);
        // Model.Wallet.update(Model.SC_SYNC_BALANCE.Balance);

        // 跳轉狀態
        Model.Fsm?.to(GameState.INIT, EffectState.beforeAry.Init);
    }

    onErrorMessage(data: unknown) {
        const message = data as ErrorMessageData;
        this.dispatchEvent(CommonEvent.SHOW_TIP_MSG, `${message.ErrorMessage} (${message.ErrorCode})`);
    }
}

/**
 * 封包id處理區
 */
export default class GameFlow {
    scene: ConnectScene;
    gameMethod: GameMethod;

    constructor(proto: ProtoModel, scene: ConnectScene) {
        Model.PROTO = proto;
        this.scene = scene;
        this.gameMethod = new GameMethod(this, proto.OpCode);
    }

    /** 註冊連線對象的通道 */
    createConnectEvent(ws: SocketLike) {
        Model.Socket = ws as unknown as typeof Model.Socket;
        // 登入 WS 基礎事件
        Model.Socket.setOnMessage = this.gameMethod.write.bind(this.gameMethod);
        Model.Socket.setOnComplete = this.onConnectOK.bind(this);
        Model.Socket.setOnConnectClose = this.onError.bind(this);
        Model.Socket.setOnDisconnectEvent = this.onError.bind(this);
        Model.Socket.setOnConnectError = this.onError.bind(this);
    }

    onError(data: unknown) {
        if (Model.FrameTool.isEditor) return;
        // 公版 - 錯誤處理
        CommonBase.GameErrorBeforeFeature(this.scene, data);
    }

    /** 連線成功 */
    onConnectOK() {
        CommonBase.GameConnectComplete(this.gameMethod);
        this.gameMethod.onConnect();
    }
}
