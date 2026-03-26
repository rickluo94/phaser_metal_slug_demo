export enum SignalType {
    ClearLoading = 'ClearLoading',
    CharacterViewInit = 'CharacterViewInit',
    TextViewInit = 'TextViewInit',
    TextViewStart = 'TextViewStart',
    EnemyViewInit = 'EnemyViewInit',
    EnemyViewStart = 'EnemyViewStart',
    ResultViewInit = 'ResultViewInit',
    ResultViewStart = 'ResultViewStart'
}

export class EffectState {
    static beforeAry = {
        Init: [
            [SignalType.ClearLoading],
            [SignalType.CharacterViewInit],
            [SignalType.TextViewInit],
            [SignalType.EnemyViewInit],
            [SignalType.ResultViewInit],
        ],
        Start:[
            [SignalType.TextViewStart],
            [SignalType.EnemyViewStart],
            [SignalType.ResultViewStart],
        ],
    };
}
