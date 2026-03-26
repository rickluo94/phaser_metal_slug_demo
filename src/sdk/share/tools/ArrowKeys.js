import ToolMath from '@share/tools/ToolMath';

export default class ArrowKeys {
    isShiftDown = false;
    isMoveFloor = false;
    isContainer = false;
    isDragging = false;
    moveValue = 1;
    downLockKey = '';
    useDownLockKey = '';
    moveTimeCount = -1;
    moveStep = 1;
    moveCallCount = 0;
    moveTimeStepCount = 1;
    moveStepLevel = {
        1: 4,
        10: 3,
        50: 2,
        100: 1
    };

    constructor(scene) {
        this.scene = scene;

        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        scene.input.on('dragend', (pointer, gameObject) => {
            if (gameObject.parentContainer.constructor.name === 'UIPos') return;
            this.#showMsg(`x:${gameObject.x}, y:${gameObject.y}`);
            window.guiItem = gameObject;
        });

        const escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on('down', this.#keyDown.bind(this, 'esc'));

        const qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        qKey.on('down', this.#keyDown.bind(this, 'q'));

        const wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        wKey.on('down', this.#keyDown.bind(this, 'w'));

        const eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        eKey.on('down', this.#keyDown.bind(this, 'e'));

        const rKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        rKey.on('down', this.#keyDown.bind(this, 'r'));

        const tKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        tKey.on('up', this.#keyUp.bind(this, 't'));
        tKey.on('down', this.#keyDown.bind(this, 't'));

        const upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        upKey.on('up', this.#keyUp.bind(this, 'up'));
        upKey.on('down', this.#keyDown.bind(this, 'up'));

        const downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        downKey.on('up', this.#keyUp.bind(this, 'down'));
        downKey.on('down', this.#keyDown.bind(this, 'down'));

        const leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        leftKey.on('up', this.#keyUp.bind(this, 'left'));
        leftKey.on('down', this.#keyDown.bind(this, 'left'));

        const rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        rightKey.on('up', this.#keyUp.bind(this, 'right'));
        rightKey.on('down', this.#keyDown.bind(this, 'right'));

        const shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        shiftKey.on('up', this.#keyUp.bind(this, 'shift'));
        shiftKey.on('down', this.#keyDown.bind(this, 'shift'));

        // 計時器
        this.playTime = this.scene.time.addEvent({
            delay: 30,
            callback: this.onTimerTick.bind(this),
            callbackScope: this,
            loop: true
        });
    }

    onTimerTick() {
        if (this.useDownLockKey !== this.downLockKey) {
            this.useDownLockKey = this.downLockKey;
            this.moveTimeCount = -1;
            this.moveStep = 1;
            this.moveCallCount = 0;
            return;
        }
        if (this.moveTimeCount <= this.moveTimeStepCount * this.moveStep || this.moveTimeCount === -1) {
            this.moveTimeCount = 0;
            if (this.moveCallCount + 1 < 3) {
                this.moveCallCount++;
                const stepData = this.moveStepLevel[this.moveCallCount];
                if (stepData !== undefined) this.moveStep = stepData;
            }
            if (this.downLockKey !== '' && this.useDownLockKey === this.downLockKey) this.#keyDown(this.downLockKey);
        }
    }

    #keyUp(key) {
        if (key === 'shift') {
            this.isShiftDown = false;
            return;
        }
        this.moveTimeCount = -1;
        this.moveStep = 1;
        this.moveCallCount = 0;
        this.downLockKey = '';
        if (this.playTimeClick && this.playTimeClick.remove) this.playTimeClick.remove();
    }

    #log() {
        if (!this.scene) return;
        this.#showMsg(`x:${window.guiItem.x}, y:${window.guiItem.y}`);
    }

    #showMsg(message) {
        if (!this.showText) {
            this.showText = new Phaser.GameObjects.Text(this.scene, 0, 0, '');
            this.showText.setOrigin(0, 0);
            this.showText.setStyle({ fontFamily: 'Arial', fontSize: 40, color: '#FFFFFF' });
            this.scene.add.existing(this.showText);
        }
        this.scene.children.bringToTop(this.showText);
        this.showText.visible = true;
        this.showText.setText(message);
        // console.warn(message);
    }

    #keyDown(key) {
        if (!window.guiItem) return;
        switch (key) {
            case 'esc': {
                this.clearItem();
                break;
            }
            case 'q': {
                if (!this.isShiftDown) {
                    window.guiItem.x = Math.floor(window.guiItem.x);
                    window.guiItem.y = Math.floor(window.guiItem.y);
                    this.#log();
                    return;
                }
                window.guiItem.x = 0;
                window.guiItem.y = 0;
                this.#log();
                this.clearItem();
                break;
            }
            case 'w': {
                this.isMoveFloor = !this.isMoveFloor;
                this.moveValue = (this.isMoveFloor) ? 0.5 : 1;
                break;
            }
            case 'e': {
                if (window.guiItem) window.guiItem.visible = !window.guiItem.visible;
                break;
            }
            case 'r': {
                const scaleAry = (this.isShiftDown)
                    ? [ToolMath.accAdd(window.guiItem.scaleX, 0.1), ToolMath.accAdd(window.guiItem.scaleY, 0.1)]
                    : [ToolMath.accSub(window.guiItem.scaleX, 0.1), ToolMath.accSub(window.guiItem.scaleY, 0.1)];
                window.guiItem.setScale(...scaleAry);
                this.#showMsg(`scale X:${window.guiItem.scaleX}, scale Y:${window.guiItem.scaleY}`);
                break;
            }
            case 't': {
                if (window.guiItem.angle !== undefined) {
                    (this.isShiftDown) ? window.guiItem.angle-- : window.guiItem.angle++;
                    this.#keyBoardDown(key);
                    if (this.scene) this.#showMsg(`angle: ${window.guiItem.angle}`);
                }
                break;
            }
            case 'up': {
                (this.isShiftDown) ? window.guiItem.y -= (this.moveValue * 10) : window.guiItem.y -= this.moveValue;
                this.#keyBoardDown(key);
                this.#log();
                break;
            }
            case 'down': {
                (this.isShiftDown) ? window.guiItem.y += (this.moveValue * 10) : window.guiItem.y += this.moveValue;
                this.#keyBoardDown(key);
                this.#log();
                break;
            }
            case 'left': {
                (this.isShiftDown) ? window.guiItem.x -= (this.moveValue * 10) : window.guiItem.x -= this.moveValue;
                this.#keyBoardDown(key);
                this.#log();
                break;
            }
            case 'right': {
                (this.isShiftDown) ? window.guiItem.x += (this.moveValue * 10) : window.guiItem.x += this.moveValue;
                this.#keyBoardDown(key);
                this.#log();
                break;
            }
            case 'shift': {
                this.isShiftDown = true;
                break;
            }
            default: {
                break;
            }
        }
    }

    #keyBoardDown(key) {
        if (this.playTimeClick && this.playTimeClick.remove) this.playTimeClick.remove();
        this.playTimeClick = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                this.downLockKey = key;
            },
            callbackScope: this,
            loop: false
        });
    }

    #pointDown() {
        this.isDragging = true;
    }

    #pointUp() {
        this.isDragging = false;
    }

    #pointMove(pointer) {
        if (this.isDragging) {
            window.guiItem.x = pointer.x;
            window.guiItem.y = pointer.y;
        }
    }

    clearItem() {
        if (!window.guiItem) return;
        window.guiItem.disableInteractive();
        window.guiItem = null;
        if (this.isContainer) {
            this.isContainer = false;
        }
        this.#showMsg('');
    }

    setItem(item) {
        if (!this.tween) {
            this.sx = item.x;
            this.tween = this.scene.tweens.add({
                targets: item,
                x: item.x + 5,
                duration: 100,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    if (this.tween) {
                        this.tween.stop();
                        this.tween.remove();
                        this.tween = null;
                    }
                    item.x = this.sx;
                }
            });
        }

        // 啟動 Tween
        this.tween.play();

        window.guiItem = item;
        this.#log();
        if (item instanceof Phaser.GameObjects.Container) {
            this.isContainer = true;
            window.guiItem.setInteractive(new Phaser.Geom.Rectangle(-50, -50, 100, 150), Phaser.Geom.Rectangle.Contains);
            window.guiItem.on('pointerdown', this.#pointDown.bind(this));
            window.guiItem.on('pointerup', this.#pointUp.bind(this));
            window.guiItem.on('pointermove', this.#pointMove.bind(this));
            return;
        }

        if (item.parentContainer) {
            window.guiItem.setInteractive({ draggable: true });
            return;
        }

        if (!item.context) {
            window.guiItem.setInteractive({ draggable: true });
            return;
        }

        // UIPos編譯view區
        const { width, height } = window.guiItem.context.scene.game.config;
        window.guiItem = window.guiItem.context;
        window.guiItem.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.#log();
        this.sx = window.guiItem.x;
        this.tween = this.scene.tweens.add({
            targets: window.guiItem,
            x: window.guiItem.x + 5,
            duration: 100,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (this.tween) {
                    this.tween.stop();
                    this.tween.remove();
                    this.tween = null;
                }
                window.guiItem.x = this.sx;
            }
        });

        // 啟動 Tween
        this.tween.play();
    }
}
