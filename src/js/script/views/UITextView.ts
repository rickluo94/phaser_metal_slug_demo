import GameBase from '@kernel/utility/GameBase';
import { SignalType } from '@script/process/EffectStates';

type SignalEvent = {
    CallBack: () => void;
};

export default class UITextView extends GameBase {
    context;
    missionKey = 'mission_1_start';
    missionSound?: Phaser.Sound.BaseSound;

    initUI() {
        this.context = this.game.add.container().setName('UITextView');
        this.#prepareMissionSounds();
        // 註冊事件
        this.addEvent();
    }

    addEvent() {
        this.addSignal(SignalType.TextViewInit, this.#onTextViewInit.bind(this));
    }

    start() {
        this.addSignal(SignalType.TextViewStart, this.#onTextViewStart.bind(this));
    }

    #prepareMissionSounds() {
        this.missionSound = this.game.sound.get(this.missionKey) || this.game.sound.add(this.missionKey, { loop: false });
    }

    #playMissionSound() {
        if (!this.missionSound) return;
        this.missionSound.stop();
        this.missionSound.play();
    }

    #showMissionText(text, onComplete?: () => void) {
        if (!this.context) return;
        const { width, height } = this.game.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        this.#playMissionSound();
        const missionText = this.game.add.text(centerX, centerY, text, {
            fontSize: '92px',
            color: '#ff0000'
        }).setOrigin(0.5, 0.5);

        this.context.add(missionText);

        this.game.tweens.add({
            targets: missionText,
            x: missionText.x,
            duration: 3000,
            ease: 'easeInOut',
            onComplete: () => {
                missionText.destroy();
                onComplete?.();
            }
        });
    }

    #onTextViewInit(event: SignalEvent) {
        event.CallBack();
    }

    #onTextViewStart(event: SignalEvent) {
        console.log('TextView start');
        this.#showMissionText('MISSION 1 START !', event.CallBack);
    }

    destroy() {
        super.destroy();
        this.context?.destroy(true);
        this.context = null;
    }
}
