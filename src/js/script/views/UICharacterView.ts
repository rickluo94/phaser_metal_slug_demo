import GameBase from '@kernel/utility/GameBase';
import Model from '@kernel/utility/Model';
import { SignalType } from '@script/process/EffectStates';

type SignalEvent = {
    CallBack: () => void;
};

type CharacterAction = 'run' | 'stand' | 'shoot' | 'reload' | 'drink' | 'bala';

type CharacterKeys = {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    shoot: Phaser.Input.Keyboard.Key;
    reload: Phaser.Input.Keyboard.Key;
    drink: Phaser.Input.Keyboard.Key;
};

type CharacterAtlasKey = 'marco' | 'marco_blue';

export default class UICharacterView extends GameBase {
    context?: Phaser.GameObjects.Container;
    marco?: Phaser.GameObjects.Sprite;
    bullets?: Phaser.GameObjects.Group;
    keys?: CharacterKeys;
    moveSpeed = 5;
    jumpVelocity = -14;
    gravity = 0.7;
    velocityY = 0;
    groundY = 560; // 地面
    facing: 1 | -1 = 1;
    currentAction: CharacterAction = 'stand';
    hereWeGoKey = 'sfx_here_we_go';
    hereWeGoSound?: Phaser.Sound.BaseSound;
    gunReloadKey = 'gun_reload';
    gunShootKey = 'gun_shoot';
    gunShootSound?: Phaser.Sound.BaseSound;
    gunReloadSound?: Phaser.Sound.BaseSound;
    selectedCharacterAtlas: CharacterAtlasKey = 'marco';

    initUI() {
        this.context = this.game.add.container().setName('UICharacterView');
        this.bullets = this.game.add.group();
        this.#createAnimations();
        this.#createMarco();
        this.#prepareActionSounds();
        this.#registerKeyboard();

        // 註冊事件
        this.addEvent();
    }

    update() {
        if (!this.marco || !this.keys) return;

        let isMoving = false;
        if (this.keys.left.isDown) {
            this.marco.x -= this.moveSpeed;
            this.marco.setFlipX(true);
            this.facing = -1;
            isMoving = true;
        }

        if (this.keys.right.isDown) {
            this.marco.x += this.moveSpeed;
            this.marco.setFlipX(false);
            this.facing = 1;
            isMoving = true;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.jump) && this.marco.y >= this.groundY) {
            this.velocityY = this.jumpVelocity;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.shoot)) {
            this.#playGunShoot();
            this.#shoot();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.reload)) {
            this.#playGunReload();
            this.#playAction('reload');
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.drink)) {
            this.#playAction('drink');
        }

        if (this.marco.y < this.groundY || this.velocityY !== 0) {
            this.velocityY += this.gravity;
            this.marco.y += this.velocityY;

            if (this.marco.y >= this.groundY) {
                this.marco.y = this.groundY;
                this.velocityY = 0;
            }
        }

        if (this.currentAction === 'shoot' || this.currentAction === 'reload' || this.currentAction === 'drink') return;
        this.#playAction(isMoving ? 'run' : 'stand');
    }

    addEvent() {
        this.addSignal(SignalType.CharacterViewInit, this.#onCharacterViewInit.bind(this));
    }

    #onCharacterViewInit(event: SignalEvent) {
        this.#playAction('stand', true);
        event.CallBack();
    }

    #createMarco() {
        this.selectedCharacterAtlas = this.#getCharacterAtlasKey();
        this.marco = this.game.add.sprite(220, this.groundY, this.selectedCharacterAtlas, 'metal_slug_man_10.png')
            .setOrigin(0.5, 1)
            .setScale(0.5);
        this.context?.add(this.marco);
    }


    #prepareActionSounds() {
        this.hereWeGoSound = this.game.sound.get(this.hereWeGoKey) || this.game.sound.add(this.hereWeGoKey, { loop: false });
        this.gunShootSound = this.game.sound.get(this.gunShootKey) || this.game.sound.add(this.gunShootKey, { loop: false });
        this.gunReloadSound = this.game.sound.get(this.gunReloadKey) || this.game.sound.add(this.gunReloadKey, { loop: false });
    }

    #playBeforeCharacterStart() {
        if (!this.hereWeGoSound) return;
        this.hereWeGoSound.stop();
        this.hereWeGoSound.play();
    }

    #playGunShoot() {
        if (!this.gunShootSound) return;
        this.gunShootSound.stop();
        this.gunShootSound.play({ seek: 0.6 });
    }

    #playGunReload() {
        if (!this.gunReloadSound) return;
        this.gunReloadSound.stop();
        this.gunReloadSound.play();
    }

    #registerKeyboard() {
        this.keys = this.game.input.keyboard?.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            jump: Phaser.Input.Keyboard.KeyCodes.UP,
            shoot: Phaser.Input.Keyboard.KeyCodes.SPACE,
            reload: Phaser.Input.Keyboard.KeyCodes.R,
            drink: Phaser.Input.Keyboard.KeyCodes.D
        }) as CharacterKeys;
    }

    #createAnimations() {
        this.#createAnimation('run', [1, 9], 12, -1);
        this.#createAnimation('stand', [10, 12], 6, -1);
        this.#createAnimation('shoot', [13, 17], 18, 0);
        this.#createAnimation('reload', [18, 32], 18, 0);
        this.#createAnimation('drink', [33, 40], 14, 0);
        this.#createAnimation('bala', [41, 42], 16, -1);
    }

    #createAnimation(key: CharacterAction, [start, end]: [number, number], frameRate: number, repeat: number) {
        const animationKey = this.#getAnimationKey(key);
        if (this.game.anims.exists(animationKey)) return;

        this.game.anims.create({
            key: animationKey,
            frames: this.game.anims.generateFrameNames(this.#getCharacterAtlasKey(), {
                start,
                end,
                prefix: 'metal_slug_man_',
                suffix: '.png'
            }),
            frameRate,
            repeat
        });
    }

    #playAction(action: CharacterAction, force = false) {
        if (!this.marco) return;
        const animationKey = this.#getAnimationKey(action);
        if (!force && this.currentAction === action && this.marco.anims.isPlaying) return;

        this.currentAction = action;
        this.marco.play(animationKey, force);

        if (action === 'shoot' || action === 'reload' || action === 'drink') {
            this.marco.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.currentAction = 'stand';
                this.#playAction('stand', true);
            });
        }
    }

    #shoot() {
        if (!this.marco || !this.context) return;

        this.#playAction('shoot', true);
        const bullet = this.game.add.image(this.marco.x + (110 * this.facing), this.marco.y - 80, 'bullet')
            .setScale(0.9);

        if (this.facing < 0) bullet.setFlipX(true);

        this.context.add(bullet);
        this.bullets?.add(bullet);

        this.game.tweens.add({
            targets: bullet,
            x: bullet.x + (700 * this.facing),
            duration: 250,
            ease: 'Linear',
            onComplete: () => {
                this.bullets?.remove(bullet);
                bullet.destroy();
            }
        });
    }

    destroy() {
        super.destroy();
        this.gunShootSound?.stop();
        this.gunReloadSound?.stop();
        this.bullets?.clear(true, true);
        this.context?.destroy(true);
        this.context = undefined;
        this.marco = undefined;
        this.bullets = undefined;
        this.keys = undefined;
        this.gunShootSound = undefined;
        this.gunReloadSound = undefined;
    }

    #getCharacterAtlasKey(): CharacterAtlasKey {
        const atlasKey = Model.Game.selectedCharacterAtlas as CharacterAtlasKey | undefined;
        return atlasKey === 'marco_blue' ? 'marco_blue' : 'marco';
    }

    #getAnimationKey(action: CharacterAction) {
        return `${this.#getCharacterAtlasKey()}_${action}`;
    }
}
