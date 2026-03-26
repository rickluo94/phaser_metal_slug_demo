// import Model from '@kernel/utility/Model';
import GameBase from '@kernel/utility/GameBase';
// import { EffectState } from '@script/process/EffectStates';
// import { GameState } from '@script/process/GameEvent';

class InitStage extends GameBase {
    constructor() {
        super();
        // 進入大廳 (範例)
        // Model.Fsm.to(GameState.LOBBY, EffectState.beforeAry.Lobby);
    }
}

class IdleStage extends GameBase {
    constructor() {
        super();
    }
}

export {
    InitStage,
    IdleStage
};
