import FsmSystem from '@kernel/utility/FsmSystem';
import Model from '@kernel/utility/Model';
import { GameState } from '@script/process/GameEvent';
import * as GameProcess from '@script/process/GameProcess';

type StateHandler = new (target?: unknown) => unknown;
type ModelFsmShape = {
    to: (state: unknown, data?: unknown) => void;
    [key: string]: unknown;
};

type GameFsm = FsmSystem & {
    AddStateFunc: (state: GameState, target: StateHandler) => FsmSystem;
};

export class GameStateConfig {
    constructor() {
        const isLog = false;
        // 創建有限狀態機
        const fsm = new FsmSystem(GameState._, this, isLog);
        fsm.from(GameState._).to(GameState.INIT);
        fsm.from(GameState.INIT).to(GameState.START);
        // fsm.from(GameState.INIT).to(GameState.IDLE);

        Model.Fsm = fsm as unknown as ModelFsmShape;
    }

    /** 註冊狀態所使用的對象 */
    addGameProcess() {
        const fsm = Model.Fsm as unknown as GameFsm;
        fsm.AddStateFunc(GameState.INIT, GameProcess.InitStage); // Ex: InitStage or InitStageA ...B;
        // fsm.AddStateFunc(GameState.IDLE, GameProcess.IdleStage);
    }
}
