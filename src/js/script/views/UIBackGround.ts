import GameBase from '@kernel/utility/GameBase';
import { MainSceneEventType } from '@script/events/MainSceneEventType';

export default class UIBackGround extends GameBase {
    backgroundKeys = ['img_ground_bg', 'img_sky_bg'];
    backgroundIndex = 0;
    isTransitioning = false;
    background;
    context;
    bgmKey = 'ms_character_select';
    bgmSound?: Phaser.Sound.BaseSound;

    initUI() {
        this.context = this.game.add.container().setName('UIBackGround');
        this.background = this.game.add.image(0, 0, this.backgroundKeys[this.backgroundIndex]).setOrigin(0);
        this.context.add(this.background);
        this.#prepareBgmSound();
        this.#playCharacterBgm();
        this.addEvent();
    }

    addEvent() {
        this.addEventListener(MainSceneEventType.StopBackgroundBgm, this.#onStopBackgroundBgm.bind(this));
    }

    switchBackground() {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        const nextIndex = (this.backgroundIndex + 1) % this.backgroundKeys.length;

        this.game.tweens.add({
            targets: this.background,
            alpha: 0,
            duration: 250,
            onComplete: () => {
                this.backgroundIndex = nextIndex;
                this.background.setTexture(this.backgroundKeys[this.backgroundIndex]);
                this.game.tweens.add({
                    targets: this.background,
                    alpha: 1,
                    duration: 250,
                    onComplete: () => {
                        this.isTransitioning = false;
                    }
                });
            }
        });
    }

    #prepareBgmSound() {
        this.bgmSound = this.game.sound.get(this.bgmKey) || this.game.sound.add(this.bgmKey, { loop: true });
    }

    #playCharacterBgm() {
        if (!this.bgmSound) return;
        this.bgmSound.stop();
        this.bgmSound.play();
    }

    #onStopBackgroundBgm() {
        if (!this.bgmSound) return;
        this.bgmSound.stop();
        console.log('isPlaying', this.bgmSound?.isPlaying);
    }

    destroy() {
        super.destroy();
        const currentBgm = this.game.sound.get(this.bgmKey);
        currentBgm?.stop();
        this.context?.destroy(true);
        this.context = null;
        this.background = null;
    }
}
