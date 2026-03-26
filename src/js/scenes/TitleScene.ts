export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'title', active: false, visible: false });
    }

    init() {}

    preload() {}

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        this.add.text(centerX, centerY - 120, 'Title Scene', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.createButton(centerX, centerY, 'Start', () => {
            this.scene.start('select_character');
        });

        // this.createButton(centerX, centerY + 80, 'Exit', () => {
        //     if (window.history.length > 1) {
        //         window.close();
        //         window.history.back();
        //         return;
        //     }
        //     this.game.destroy(true);
        // });
    }

    update() {}

    createButton(x: number, y: number, label: string, onClick: () => void) {
        const button = this.add.container(x, y);
        const background = this.add.rectangle(0, 0, 240, 56, 0x1f1f1f)
            .setStrokeStyle(2, 0xffffff);
        const text = this.add.text(0, 0, label, {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        background.setInteractive({ useHandCursor: true });
        background.on('pointerover', () => {
            background.setFillStyle(0x333333);
        });
        background.on('pointerout', () => {
            background.setFillStyle(0x1f1f1f);
        });
        background.on('pointerdown', () => {
            background.setFillStyle(0x4a4a4a);
        });
        background.on('pointerup', () => {
            background.setFillStyle(0x333333);
            onClick();
        });

        button.add([background, text]);
        return button;
    }
}
