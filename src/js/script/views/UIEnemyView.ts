import GameBase from '@kernel/utility/GameBase';
// 事件及訊號
import { MainSceneEventType } from '@script/events/MainSceneEventType';
import { SignalType } from '@script/process/EffectStates';

type SignalEvent = {
    CallBack: () => void;
};

export default class UIEnemyView extends GameBase {
    static ANIMATION_KEY = 'flying_tara_fly';
    static MISSILE_ANIMATION_KEY = 'missile_down_fall';
    static EXPLODE_GROUND_ANIMATION_KEY = 'explode_ground_boom';
    static FLYING_TARA_DURATION = 5000;

    context?: Phaser.GameObjects.Container;
    flyingTaras: Phaser.GameObjects.Sprite[] = [];
    startX = -150;
    endX = 1480;
    minPositionY = 70;
    maxPositionY = 150;
    groundY = 560;
    spawnDuration = 10000;
    spawnTimes: number[] = [];
    elapsed = 0;
    spawnIndex = 0;
    isSpawning = false;
    isStageCleared = false;
    explosionKey = 'explosion';
    explosionSound?: Phaser.Sound.BaseSound;
    timerText?: Phaser.GameObjects.BitmapText;
    #createMissileDownCount = 0;

    initUI() {
        this.context = this.game.add.container().setName('UIEnemyView');
        this.#prepareActionSounds();
        this.#createAnimations();
        this.#createTimerText();
        // 註冊事件
        this.addEvent();
    }

    addEvent() {
        this.addSignal(SignalType.EnemyViewInit, this.#onEnemyViewInit.bind(this));
    }

    start() {
        this.addSignal(SignalType.EnemyViewStart, this.#onEnemyViewStart.bind(this));
        this.isSpawning = false;
    }

    update(time, delta) {
        if (!this.isSpawning) {
            this.#updateTimerText();
            return;
        }

        this.elapsed += delta;
        const remainMs = this.#getRemainMs();
        this.#updateTimerText(remainMs);

        if (remainMs === 0) {
            if (this.flyingTaras.length === 0 && !this.isStageCleared) {
                this.#handleStageClear();
            }
            return;
        }

        while (
            this.spawnIndex < this.spawnTimes.length
            && this.elapsed >= this.spawnTimes[this.spawnIndex]
        ) {
            this.#createFlyingTara();
            this.spawnIndex++;
        }

        if (this.elapsed >= this.spawnDuration && this.spawnIndex >= this.spawnTimes.length) {
            this.isSpawning = false;
            this.#updateTimerText(remainMs);
        }
    }

    #prepareActionSounds() {
        this.explosionSound = this.game.sound.get(this.explosionKey) || this.game.sound.add(this.explosionKey, { loop: false });
    }

    #playExplosionSound() {
        if (!this.explosionSound) return;
        this.explosionSound.stop();
        this.explosionSound.play();
    }

    #createSpawnSchedule() {
        const spawnCount = Phaser.Math.Between(10, 20);
        // const spawnCount = 20;
        this.spawnTimes = Array.from({ length: spawnCount }, () => Phaser.Math.Between(0, this.spawnDuration))
            .sort((a, b) => a - b);
        this.elapsed = 0;
        this.spawnIndex = 0;
        this.#createMissileDownCount = 0;
        this.isStageCleared = false;
        this.isSpawning = true;
        this.#updateTimerText();
    }

    #createTimerText() {
        if (!this.context) return;
        this.timerText = this.game.add.bitmapText(1000, 40, 'num', '10.0', 32)
            .setOrigin(0, 0)
            .setScale(0.45);
        this.context.add(this.timerText);
        this.#updateTimerText();
    }

    #getRemainMs() {
        return Math.max(this.spawnDuration - 10 - this.elapsed, 0);
    }

    #updateTimerText(remainMs = this.#getRemainMs()) {
        if (!this.timerText) return;
        this.timerText.setText((remainMs / 1000).toFixed(1));
    }

    #createFlyingTara() {
        const positionY = Phaser.Math.Between(this.minPositionY, this.maxPositionY);
        const flyingTara = this.game.add.sprite(this.startX, positionY, 'flying_tara', 'flying_tara_0.png')
            .setScale(1.8);
        this.context?.add(flyingTara);
        flyingTara.play(UIEnemyView.ANIMATION_KEY);
        this.flyingTaras.push(flyingTara);
        this.#scheduleMissileDrop(flyingTara);

        this.game.tweens.add({
            targets: flyingTara,
            x: this.endX,
            duration: UIEnemyView.FLYING_TARA_DURATION,
            ease: 'Sine.easeInOut',
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                this.flyingTaras = this.flyingTaras.filter((item) => item !== flyingTara);
                flyingTara.destroy();
            }
        });
    }

    #scheduleMissileDrop(flyingTara: Phaser.GameObjects.Sprite) {
        const dropX = Phaser.Math.Between(300, 1000);
        const dropDelay = Phaser.Math.Linear(
            0,
            UIEnemyView.FLYING_TARA_DURATION,
            (dropX - this.startX) / (this.endX - this.startX)
        );

        this.game.time.delayedCall(dropDelay, () => {
            const remainMs = this.#getRemainMs();
            if (!flyingTara.active || remainMs === 0) return;
            this.#createMissileDown(flyingTara.x, flyingTara.y + 40);
        });
    }

    #createMissileDown(positionX: number, positionY: number) {
        if (!this.context) return;
        this.#createMissileDownCount++;

        const missile = this.game.add.sprite(positionX, positionY, 'missile_down', 'missile_down_1.png')
            .setScale(1.6)
            .setOrigin(0.5, 0.5);

        this.context.add(missile);
        missile.play(UIEnemyView.MISSILE_ANIMATION_KEY);

        this.game.tweens.add({
            targets: missile,
            y: this.groundY,
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                this.#createExplodeGround(missile.x, missile.y);
                missile.destroy();
            }
        });
    }

    #handleStageClear() {
        this.isSpawning = false;
        this.isStageCleared = true;
        this.#updateTimerText(0);
        this.dispatchEvent(MainSceneEventType.StopBackgroundBgm);
        this.dispatchEvent(MainSceneEventType.ShowResultView, {
            title: 'STAGE CLEAR',
            bombCount: this.#createMissileDownCount
        });
    }

    #createExplodeGround(positionX: number, positionY: number) {
        if (!this.context) return;

        this.#playExplosionSound();

        const explosion = this.game.add.sprite(positionX, positionY, 'explode_ground', 'explode_ground_small_1.png')
            .setScale(1.6)
            .setOrigin(0.5, 1);

        this.context.add(explosion);
        explosion.play(UIEnemyView.EXPLODE_GROUND_ANIMATION_KEY);
        explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            explosion.destroy();
        });
    }

    #createAnimations() {
        if (!this.game.anims.exists(UIEnemyView.ANIMATION_KEY)) {
            this.game.anims.create({
                key: UIEnemyView.ANIMATION_KEY,
                frames: this.game.anims.generateFrameNames('flying_tara', {
                    start: 0,
                    end: 8,
                    prefix: 'flying_tara_',
                    suffix: '.png'
                }),
                frameRate: 5,
                repeat: -1
            });
        }

        if (!this.game.anims.exists(UIEnemyView.MISSILE_ANIMATION_KEY)) {
            this.game.anims.create({
                key: UIEnemyView.MISSILE_ANIMATION_KEY,
                frames: this.game.anims.generateFrameNames('missile_down', {
                    start: 1,
                    end: 13,
                    prefix: 'missile_down_',
                    suffix: '.png'
                }),
                frameRate: 15,
                repeat: 0
            });
        }

        if (this.game.anims.exists(UIEnemyView.EXPLODE_GROUND_ANIMATION_KEY)) return;

        this.game.anims.create({
            key: UIEnemyView.EXPLODE_GROUND_ANIMATION_KEY,
            frames: this.game.anims.generateFrameNames('explode_ground', {
                start: 1,
                end: 17,
                prefix: 'explode_ground_small_',
                suffix: '.png'
            }),
            frameRate: 20,
            repeat: 0
        });
    }

    #onEnemyViewInit(event: SignalEvent) {
        event.CallBack();
    }

    #onEnemyViewStart(event: SignalEvent) {
        console.log('EnemyView Start');
        this.#createSpawnSchedule();
        event.CallBack();
    }

    destroy() {
        super.destroy();
        this.isSpawning = false;
        this.flyingTaras.forEach((flyingTara) => {
            flyingTara.destroy();
        });
        this.flyingTaras = [];
        this.timerText = undefined;
        this.#createMissileDownCount = 0;
        this.isStageCleared = false;
        this.context?.destroy(true);
        this.context = undefined;
    }
}
