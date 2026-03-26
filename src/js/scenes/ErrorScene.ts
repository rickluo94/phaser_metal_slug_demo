import Model from '@kernel/utility/Model';

type ErrorSceneData = {
    errCode?: string;
};

type ErrorSceneTextConfig = {
    x: number;
    y: number;
    msg: string;
    style: Phaser.Types.GameObjects.Text.TextStyle;
    codeMsg: string;
    anchor?: {
        x: number;
        y: number;
    };
};

type ErrorSceneUIPos = {
    errorScene: {
        text: ErrorSceneTextConfig;
    };
};

export default class ErrorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'msg-error', active: false, visible: false });
    }

    init(data: ErrorSceneData) {
        const uiPos = Model.UIPos as ErrorSceneUIPos;
        const { text } = uiPos.errorScene;
        const errorText = this.add.text(text.x, text.y, text.msg, text.style);
        if (text.anchor) errorText.setOrigin(text.anchor.x, text.anchor.y);
        if (data.errCode && data.errCode !== '') errorText.setText(text.codeMsg.replace(/{code}/g, data.errCode));
    }
}
