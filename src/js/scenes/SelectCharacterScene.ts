import Model from '@kernel/utility/Model';

type CharacterAtlasKey = 'marco' | 'marco_blue';

export default class SelectCharacterScene extends Phaser.Scene {
    selectedCharacterAtlas: CharacterAtlasKey = 'marco';

    constructor() {
        super({ key: 'select_character', active: false, visible: false });
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        this.selectedCharacterAtlas = (Model.Game.selectedCharacterAtlas as CharacterAtlasKey) || 'marco';

        this.add.text(centerX, centerY - 180, 'Select Character', {
            fontSize: '42px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 135, 'Choose which atlas UICharacterView should use', {
            fontSize: '20px',
            color: '#d0d0d0'
        }).setOrigin(0.5);

        this.createCharacterButton(centerX - 170, centerY + 50, 'Marco', 'marco');
        this.createCharacterButton(centerX + 170, centerY + 50, 'Marco Blue', 'marco_blue');

        this.createActionButton(centerX, centerY + 230, 'Start Game', () => {
            Model.Game.selectedCharacterAtlas = this.selectedCharacterAtlas;
            this.scene.start('main_game');
        });

        this.createActionButton(centerX, centerY + 305, 'Back', () => {
            this.scene.start('title');
        });
    }

    createCharacterButton(x: number, y: number, label: string, atlasKey: CharacterAtlasKey) {
        const container = this.add.container(x, y);
        const background = this.add.rectangle(0, 0, 260, 220, 0x1f1f1f)
            .setStrokeStyle(2, 0xffffff);
        const preview = this.add.sprite(0, 20, atlasKey, 'metal_slug_man_10.png')
            .setScale(0.7)
            .setOrigin(0.5, 1);
        const text = this.add.text(0, 80, label, {
            fontSize: '26px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const refreshStyle = () => {
            background.setFillStyle(this.selectedCharacterAtlas === atlasKey ? 0x2a4365 : 0x1f1f1f);
        };

        background.setInteractive({ useHandCursor: true });
        background.on('pointerdown', () => {
            this.selectedCharacterAtlas = atlasKey;
            refreshStyle();
            this.refreshCharacterSelections();
        });

        container.setData('refreshStyle', refreshStyle);
        container.add([background, preview, text]);
        refreshStyle();
        return container;
    }

    createActionButton(x: number, y: number, label: string, onClick: () => void) {
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

    refreshCharacterSelections() {
        this.children.each((child) => {
            const refreshStyle = child.getData?.('refreshStyle') as (() => void) | undefined;
            refreshStyle?.();
        });
    }
}
