class ContainerBtn extends Phaser.GameObjects.Container {
    getUIButtonStyle(imgExt, frameName, frameData) {
        const ext = imgExt || 'png';
        const FrameData = frameData || ['up', 'down', 'hover'];
        return FrameData.map((frameSub) => `${frameName}${frameSub}.${ext}`);
    }

    createImage(key, frame) {
        return this.scene.add.image(0, 0, key, frame);
    }

    onDisable() {
        this.disableInteractive();
    }

    onEnable() {
        this.setInteractive({ useHandCursor: true });
    }
}

export class UIButton extends ContainerBtn {
    onClick = null;
    constructor(scene, data) {
        // 需要的格式內容
        const { x, y, key, FrameName, FrameData, ext } = data;
        super(scene, x, y);
        this.name = key;
        const isKey = scene.textures.exists(key);
        let isTexture = true;
        if (isKey && FrameName !== undefined) {
            this.frameList = this.getUIButtonStyle(ext, FrameName, FrameData);

            this.frameList.forEach((ele) => {
                if (!scene.textures.get(key).has(ele)) isTexture = false;
            });
        }

        const isImageFrame = (isKey && isTexture);
        if (!key || key === '' || key === 'transparent') {
            this.normalState = this.createImage('transparent');
            this.hoverState = this.createImage('transparent');
            this.downState = this.createImage('transparent');
            this.add(this.normalState);
            const { width, height } = this.normalState;
            this.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                useHandCursor: true
            });
            return;
        }

        this.normalState = (isImageFrame)
            ? this.createImage(key, this.frameList[0]) : this.createImage(key, FrameName);
        this.hoverState = (isImageFrame)
            ? this.createImage(key, this.frameList[2] || this.frameList[0]) : this.createImage(key, FrameName);
        this.downState = (isImageFrame)
            ? this.createImage(key, this.frameList[1] || this.frameList[0]) : this.createImage(key, FrameName);

        this.add(this.normalState);
        this.add(this.hoverState);
        this.add(this.downState);
        this.normalState.setVisible(true);
        this.hoverState.setVisible(false);
        this.downState.setVisible(false);

        const { width, height } = this.normalState;
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        })
            .on('pointerover', () => this.showState('hover'))
            .on('pointerout', () => this.showState('normal'))
            .on('pointerdown', () => {
                this.showState('down');
                if (this.onClick) this.onClick(this.name);
            })
            .on('pointerup', () => {
                this.showState('hover');
            });
    }

    onDisable() {
        super.onDisable();
        this.normalState.tint = 0x888888;
        this.hoverState.tint = 0x888888;
        this.downState.tint = 0x888888;
    }

    onEnable() {
        super.onEnable();
        this.normalState.tint = 0xffffff;
        this.hoverState.tint = 0xffffff;
        this.downState.tint = 0xffffff;
    }

    showState(state) {
        this.normalState.setVisible(state === 'normal');
        this.hoverState.setVisible(state === 'hover');
        this.downState.setVisible(state === 'down');
    }
}

export class TextButton extends Phaser.GameObjects.Text {
    onClick = null;
    constructor(scene, data) {
        const { x, y, msg, fontStyle = {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        } } = data;

        super(scene, x, y, msg, fontStyle);
        this.setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.setStyle({ fill: '#f8f684' }))
            .on('pointerover', () => this.setStyle({ fill: '#fffec4' }))
            .on('pointerout', () => this.setStyle({ fill: '#FFF' }))
            .on('pointerup', () => {
                this.setStyle({ fill: '#FFF' });
                if (this.onClick) this.onClick(this.name);
            });
    }

    onDisable() {
        this.disableInteractive();
    }

    onEnable() {
        this.setInteractive({ useHandCursor: true })
            .setTint(0x888888);
    }
}

export class EmptyBtn extends Phaser.GameObjects.Container {
    onClick = null;
    constructor(scene, data, isHandCursor = false) {
        super(scene, data.x, data.y);
        this.isHandCursor = isHandCursor;
        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics
            .lineStyle(data.lineWidth || 1, 0x888888, 0)
            .fillStyle(data.color, data.alpha)
            .fillRect(0, 0, data.width, data.height);
        this.add(this.graphics);

        this.setAlpha(data.itemAlpha || 0.01);

        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, data.width, data.height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        })
            .on('pointerup', () => { if (this.onClick) this.onClick(this.name); });
    }

    onDisable() {
        this.disableInteractive();
    }

    onEnable() {
        this.setInteractive({ useHandCursor: this.isHandCursor });
    }
}

export class StateBtn extends ContainerBtn {
    onClick = null;
    key = '';
    frameName = '';
    checkDataIndex = 0;
    checkData = [];
    ext = '';

    constructor(scene, data) {
        super(scene, data.x, data.y);
        this.writeData(data);
        // 目前使用的物件
        this.btnState = new Phaser.GameObjects.Sprite(scene, 0, 0, this.key, this.getTextureName.frame);
        this.add(this.btnState);

        const { width, height } = this.btnState;
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        })
            .on('pointerdown', () => {
                this.showState('down');
                if (this.onClick) this.onClick(this.name, this);
            });
    }

    writeData(data) {
        const { key, FrameName, checkData, ext = 'png' } = data;
        this.checkData = checkData;
        this.checkDataIndex = 0;
        this.key = key;
        this.frameName = FrameName;
        this.ext = ext;
    }

    get getTextureName() {
        return { key: this.key, frame: `${this.frameName}${this.checkData[this.checkDataIndex]}.${this.ext}` };
    }

    showState(state) {
        if (state !== 'down') return;
        this.checkNext();
    }

    checkNext(isUpdate = true) {
        (this.checkDataIndex + 1 < this.checkData.length)
            ? this.checkDataIndex++
            : this.checkDataIndex = 0;

        if (isUpdate) {
            this.btnState.setTexture(this.getTextureName.key, this.getTextureName.frame);
        }
    }

    setCheckIndex(value) {
        if (value < 0 || value >= this.checkData.length) {
            this.checkDataIndex = 0;
            return;
        }
        this.checkDataIndex = value;
        this.btnState.setTexture(this.getTextureName.key, this.getTextureName.frame);
    }
}

export class ButtonStyle {
    static NewEmptyBtn(scene, x, y, width, height, lineWidth, color = 0x888888, alpha = 0, itemAlpha = 0.01) {
        return new EmptyBtn(scene, { x, y, width, height, lineWidth, color, alpha, itemAlpha });
    }

    static NewTextBtn(scene, x, y, msg, fontStyle) {
        return new TextButton(scene, { x, y, msg, fontStyle });
    }

    static NewUIBtn(scene, x, y, key, FrameName, FrameData, ext = 'png', setting = undefined) {
        return new UIButton(scene, { x, y, key, FrameName, FrameData, ext, setting });
    }

    // 狀態版按鈕
    static NewStateBtn(scene, x, y, key, FrameName, checkData, type = 'image', ext = 'png', setting = undefined) {
        return new StateBtn(scene, { x, y, key, FrameName, checkData, type, ext, setting });
    }

    static GetButton(scene, data) {
        let btn = null;
        switch (data.type) {
            case 'textBtn': {
                btn = new TextButton(scene, data);
                break;
            }
            case 'emptyBtn': {
                btn = new EmptyBtn(scene, data);
                break;
            }
            case 'stateBtn': {
                btn = new StateBtn(scene, data);
                break;
            }
            default: {
                btn = new UIButton(scene, data);
                break;
            }
        }
        if (btn && data.visible !== undefined) btn.visible = data.visible;
        if (btn) btn.data = data;
        return btn;
    }
}
