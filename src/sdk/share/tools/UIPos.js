import { UIButton, TextButton, EmptyBtn, StateBtn } from '@share/game/Button';

class UIContainer extends Phaser.GameObjects.Container {
    bgDown = null;
    bgUp = null;
    bgOut = null;
    bgMove = null;
    constructor(scene, key = 'guiBg', color = 0x000000) {
        super(scene, 0, 0);
        this.scene = scene;
        this.bgKey = key;
        this.bgColor = color;
        this.getUpdateBg();
        this.groupBg = new Phaser.GameObjects.Sprite(scene, 0, 0, key);
        this.groupBg.setOrigin(0, 0);
        this.groupBg.setInteractive();
        this.groupBg.on('pointerdown', (c) => {
            if (this.parentContainer) this.parentContainer.bringToTop(this);
            this.lockItem = this;
            this.lockDownPos = {
                x: c.downX - this.x, y: c.downY - this.y, maskX: c.downX - this.maskImage.x, maskY: c.downY - this.maskImage.y
            };
            if (this.bgDown) this.bgDown(c);
        });
        this.groupBg.on('pointerup', (c) => {
            this.lockItem = null;
            if (this.bgUp) this.bgUp(c);
        });
        this.groupBg.on('pointerout', (c) => {
            this.lockItem = null;
            if (this.bgOut) this.bgOut(c);
        });

        this.groupBg.on('wheel', (pointer) => {
            // 在這裡執行您想要的滾動操作，例如調整容器的位置
            if (pointer.deltaY > 0) {
                // 向下滾動
                const len = (this.itemGroup.list.length - 12);
                if (len > 0 && this.itemGroup.y !== -(len * 28)) this.itemGroup.y -= 28;
            } else if (pointer.deltaY < 0) {
                // 向上滾動
                if (this.itemGroup.y + 28 <= 0) this.itemGroup.y += 28;
            }
        });

        scene.input.on('pointermove', (pointer) => {
            if (this.lockItem) {
                this.x = pointer.x - this.lockDownPos.x;
                this.y = pointer.y - this.lockDownPos.y;
                this.maskImage.x = pointer.x - this.lockDownPos.maskX;
                this.maskImage.y = pointer.y - this.lockDownPos.maskY;
                return;
            }

            if (this.bgMove) this.bgMove(pointer);
        });

        const altKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);
        altKey.on('down', () => {
            this.isAlt = true;
        });
        altKey.on('up', () => {
            this.isAlt = false;
        });

        this.add(this.groupBg);

        const graphics = scene.add.graphics(scene);
        graphics.fillStyle(0xffffff, 0.7).fillRect(0, 28, 250, scene.game.config.height / 2);
        graphics.generateTexture('guiMask', 250, scene.game.config.height / 2);
        graphics.destroy();

        this.maskImage = scene.make.image({
            x: 0,
            y: 0,
            key: 'guiMask',
            add: false
        }).setOrigin(0, 0);
        this.bitMapMask = new Phaser.Display.Masks.BitmapMask(this, this.maskImage);

        this.itemGroup = new Phaser.GameObjects.Container(scene);
        this.add(this.itemGroup);
        this.itemGroup.mask = this.bitMapMask;
    }

    getUpdateBg(width = 280, height = 100) {
        const graphics = this.scene.add.graphics(this.scene);
        graphics.fillStyle(this.bgColor, 0.7).fillRect(0, 0, width, height);
        graphics.generateTexture(this.bgKey, width, height);
        graphics.destroy();
    }

    resetSortBar() {
        this.itemGroup.y = 0;
    }
}

class UILayer extends UIContainer {
    layerMap = {};
    layerSave = null;
    posUIList = [];
    listCount = 0;
    selectItem = null;
    lockItem = null;
    lockDownPos = { x: 0, y: 0 };
    downLockItem = null;
    isSelectDrag = false;
    dragOverData = null;

    constructor(scene, model) {
        super(scene, 'guiLayerBg');
        this.model = model;
        this.scene = scene;
        // 註冊事件
        this.bgUp = () => {
            if (this.isSelectDrag && this.downLockItem.item) {
                this.isSelectDrag = false;
                this.breakDownLockItem();
            }
        };
        this.bgMove = (pointer) => {
            if (this.isSelectDrag && this.downLockItem.item) {
                // this.downLockItem.item.x = pointer.x - this.downLockItem.originXY.x;
                this.downLockItem.item.y = pointer.y - this.downLockItem.originXY.y;
            }
        };
        // 標題
        const fontStyle = { fixedWidth: 196, fontFamily: 'Arial', fontSize: 18, color: '#FFFFFF' };
        this.tableText = new Phaser.GameObjects.Text(this.scene, 0, 0, '遊戲層', fontStyle);
        this.add(this.tableText);
        // 遊戲層級紀錄
        this.layerMap[this.listCount] = { table: '遊戲層', list: [model.MainPage] };
        this.setFileView();

        const escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on('down', () => {
            clearTimeout(this.layer.time);
            this.lockItem = null;
            this.posUIList.forEach((item) => { item.setStyle({ backgroundColor: '#decd94', color: '#000000' }); });
            if (this.isSelectDrag && this.downLockItem.item) {
                this.isSelectDrag = false;
                this.breakDownLockItem();
            }
        });

        // 刷新
        this.updateFileView();
    }

    createItem(target, index = 0, context = undefined) {
        const text = new Phaser.GameObjects.Text(
            this.scene,
            0,
            this.getUIHeight(index),
            '',
            { fixedWidth: 246, fontFamily: 'Arial', fontSize: 22, color: '#000000', backgroundColor: '#decd94' }
        );
        text.baseUI = this.getBaseUI(target);
        this.fileTypeMsg(target, text, context);
        text.setOrigin(0, 0);
        text.setInteractive();
        text.on('pointerdown', this.pointDown.bind(this, text));
        text.on('pointerup', this.pointUp.bind(this, text));
        text.on('pointerout', this.pointerOut.bind(this, text));
        text.on('pointerover', this.pointerOver.bind(this, text));
        this.itemGroup.add(text);
        return text;
    }

    getUIHeight(index) {
        return 28 + (28 * index);
    }

    sortPos(item, index) {
        item.x = 0;
        item.y = this.getUIHeight(index);
    }

    pointDown(gameObject, point) {
        this.lockItem = null;
        if (gameObject.text === '...' || gameObject.name === 'MainGame') return;
        const originXY = { x: point.downX - gameObject.x, y: point.downY - gameObject.y };
        this.posUIList.forEach((item) => { item.setStyle({ backgroundColor: '#decd94', color: '#000000' }); });
        this.downLockItem = { item: gameObject, sx: gameObject.x, sy: gameObject.y, originXY };
        if (this.isAlt && this.model.ArrowKeys && gameObject.textFileData) {
            gameObject.setStyle({ backgroundColor: '#444444', color: '#FFFFFF' });
            setTimeout(() => {
                // gameObject.setStyle({ backgroundColor: '#decd94', color: '#000000' });
                gameObject.setStyle({ backgroundColor: '#ff0000', color: '#000000' });
            }, 150);
            this.model.ArrowKeys.setItem(gameObject.textFileData);
            return;
        }

        this.bringToTop(gameObject);
        this.time = setTimeout(() => {
            this.downLockItem.item.setStyle({ backgroundColor: '#444444', color: '#FFFFFF' });
            this.downLockItem.item.setScale(1, 0.1);
            this.isSelectDrag = true;
        }, 250);
    }

    breakDownLockItem() {
        if (this.downLockItem) {
            this.downLockItem.item.x = this.downLockItem.sx;
            this.downLockItem.item.y = this.downLockItem.sy;
            this.downLockItem.item.setScale(1, 1);
            this.downLockItem = null;
        }
    }

    clearTween() {
        if (this.tween) {
            this.tween.stop();
            if (this.tween.remove) this.tween.remove();
            this.tween = null;
        }
    }

    pointUp(gameObject) {
        if (this.isAlt) return;
        const { textFileData, baseUI } = gameObject;
        // console.log('## up:', gameObject.name);
        clearTimeout(this.time);
        this.lockItem = null;
        if (this.model.ArrowKeys) this.model.ArrowKeys.clearItem();
        this.posUIList.forEach((item) => { item.setStyle({ backgroundColor: '#decd94', color: '#000000' }); });
        if (this.isSelectDrag) {
            this.isSelectDrag = false;
            if (this.dragOverData) {
                const changeData = this.layerMap[this.listCount];
                const getItem = changeData.list.splice(this.dragOverData.from, 1);
                changeData.list = [
                    ...changeData.list.slice(0, this.dragOverData.to),
                    ...getItem,
                    ...changeData.list.slice(this.dragOverData.to, changeData.list.length)
                ];
                this.clearList();
                this.setFileView();
                this.updateRoot();
                this.downLockItem = null;
                this.dragOverData = null;
                return;
            }
            this.breakDownLockItem();
            return;
        }
        this.downLockItem = null;
        this.clearTween();
        // 進入下一層
        if (textFileData) {
            gameObject.setStyle({ backgroundColor: '#ff0000', color: '#000000' });
            if (textFileData.UIClassList && textFileData.UIClassList.length > 0) {
                this.resetSortBar();
                this.clearList();
                this.listCount++;
                this.layerSave = gameObject;
                this.layerMap[this.listCount] = { table: gameObject.text, list: ['...', ...baseUI], context: textFileData };
                this.setFileView();
                return;
            }

            if (textFileData.context instanceof Phaser.GameObjects.Container) {
                this.resetSortBar();
                this.clearList();
                this.listCount++;
                this.layerSave = gameObject;
                this.layerMap[this.listCount] = {
                    table: gameObject.text, list: ['...', ...textFileData.context.list], context: textFileData
                };
                this.setFileView();
                return;
            }

            if (textFileData instanceof Phaser.GameObjects.Container) {
                this.resetSortBar();
                this.clearList();
                this.listCount++;
                this.layerSave = gameObject;
                this.layerMap[this.listCount] = { table: gameObject.text, list: ['...', ...textFileData.list], context: textFileData };
                this.setFileView();
                return;
            }
            if (this.model.ArrowKeys) this.model.ArrowKeys.setItem(textFileData);
            return;
        }

        // 回上一層
        if (gameObject.text === '...') {
            this.clearList();
            this.listCount--;
            this.setFileView();
            this.layerSave = null;
        }
    }

    pointerOver(gameObject) {
        if (this.isSelectDrag && this.downLockItem.item) {
            if (gameObject !== this.downLockItem.item && gameObject.text !== '...') {
                this.tween = this.scene.tweens.add({
                    targets: gameObject,
                    y: gameObject.y - 2,
                    duration: 200,
                    onStart: () => {
                        if (gameObject) gameObject.setStyle({ backgroundColor: '#999999', color: '#FFFFFF' });
                    },
                    onComplete: () => {
                        if (!this.isSelectDrag) return; // 在快速拖移時有機會報錯, 需要擋掉
                        if (gameObject) gameObject.y += 2;
                        this.clearTween();
                        if (gameObject && gameObject.setStyle) gameObject.setStyle({ backgroundColor: '#decd94', color: '#000000' });
                    }
                }).play();
                this.dragOverData = {
                    from: this.posUIList.indexOf(this.downLockItem.item),
                    to: this.posUIList.indexOf(gameObject),
                    toItem: gameObject
                };
            }
        }
    }

    pointerOut(gameObject) {
        if (this.downLockItem && gameObject !== this.downLockItem.item) {
            // this.dragOverData = null;
        }
    }

    getBaseUI(target) {
        const list = [];
        if (target.UIClassList) {
            target.UIClassList.forEach((ui) => {
                list.push(ui);
            });
        }
        return list;
    }

    fileTypeMsg(item, text, context) {
        // console.log(item instanceof Phaser.GameObjects.Container, item, text, context);
        if (typeof item === 'string') {
            text.text = item;
            text.name = item;
            return;
        }

        text.textFileData = item;

        if (item instanceof UIButton || item instanceof TextButton || item instanceof EmptyBtn || item instanceof StateBtn) {
            if (item.name === undefined || item.name === '') {
                text.text = item.constructor.name;
                text.name = item.constructor.name;
                return;
            }
            text.text = `${item.name}`;
            text.name = `${item.name}`;
            return;
        }

        if (item instanceof Phaser.GameObjects.Container) {
            if (item.name === '') {
                text.text = item.constructor.name;
                text.name = item.constructor.name;
                return;
            }
            text.text = `${item.name}`;
            text.name = `${item.name}`;
            return;
        }

        if (item instanceof Phaser.GameObjects.Sprite) {
            if (item.name === '') {
                if (context) {
                    Object.keys(context).forEach((key) => {
                        if (context[key] === item) {
                            text.text = `${key}`;
                            text.name = key;
                        }
                    });
                    if (text.text !== '') return;
                }
                text.text = item.texture.key;
                text.name = item.texture.key;
                return;
            }
            text.text = item.name;
            text.name = item.name;
            return;
        }

        if (item instanceof Phaser.GameObjects.Image) {
            if (item.name === '') {
                if (context) {
                    Object.keys(context).forEach((key) => {
                        if (context[key] === item) {
                            text.text = `${key}`;
                            text.name = key;
                        }
                    });
                    if (text.text !== '') return;
                }
                text.text = item.texture.key;
                text.name = item.texture.key;
                return;
            }
            text.text = item.name;
            text.name = item.name;
            return;
        }

        if (item instanceof Phaser.GameObjects.Text) {
            if (item.name === '') {
                if (context) {
                    Object.keys(context).forEach((key) => {
                        if (context[key] === item) {
                            text.text = `✎${key}`;
                            text.name = key;
                        }
                    });
                    if (text.text !== '') return;
                }
                text.text = item.type;
                text.name = item.type;
                return;
            }
            text.text = item.name;
            text.name = item.name;
            return;
        }

        if (item.context) {
            if (item.name === '') {
                text.text = item.type;
                text.name = item.type;
                return;
            }
            text.text = item.name;
            text.name = item.name;
            return;
        }

        if (!item.context) {
            text.text = item.constructor.name;
            text.name = item.constructor.name;
            return;
        }

        if (item.name === '') {
            text.text = item.type;
            text.name = item.type;
        }
    }

    clearList() {
        this.posUIList.forEach((ui) => {
            this.itemGroup.remove(ui, true);
        });
        this.posUIList = [];
    }

    setFileView() {
        const { table, list, context } = this.layerMap[this.listCount];
        list.forEach((ui, index) => {
            const item = this.createItem(ui, index, context);
            this.posUIList.push(item);
        });
        this.tableText.text = table;
        if (this.parentContainer) this.parentContainer.bringToTop(this);
        const h = this.getUIHeight(list.length);
        this.groupBg.displayHeight = (h <= this.scene.game.config.height / 2) ? h : this.scene.game.config.height / 2;
        this.groupBg.alpha = 0.5;
    }

    updateFileView() {
        this.posUIList.forEach((item, index) => {
            item.visible = true;
            this.sortPos(item, index);
        });
    }

    updateRoot() {
        const { list, context } = this.layerMap[this.listCount];
        if (context.context instanceof Phaser.GameObjects.Container) {
            // view層級
            list.forEach((ui) => {
                if (ui !== '...') {
                    ui.parentContainer.bringToTop(ui);
                }
            });
            return;
        }
        list.forEach((ui, index) => {
            if (ui !== '...' && ui.parentContainer) {
                ui.parentContainer.bringToTop(ui);
            } else if (ui.context instanceof Phaser.GameObjects.Container && ui.game) {
                ui.game.children.bringToTop(ui.context);
            }
            if (index === list.length - 1) {
                context.game.children.list.forEach((sortUI) => {
                    if (list.indexOf(sortUI) === -1) {
                        (sortUI.parentContainer)
                            ? sortUI.parentContainer.bringToTop(sortUI)
                            : context.game.children.bringToTop(sortUI);
                    }
                });
            }
        });
    }
}

class UIObjectView extends UIContainer {

}

class UILibrary extends UIContainer {
    itemView = null;
    isSelectDrag = false;
    constructor(scene, model) {
        super(scene, 'guiLibBg', 0x006666);
        this.model = model;
        this.scene = scene;
        // 標題
        const fontStyle = { fixedWidth: 196, fontFamily: 'Arial', fontSize: 18, color: '#FFFFFF' };
        this.tableText = new Phaser.GameObjects.Text(this.scene, 0, 0, '元件庫', fontStyle);
        this.add(this.tableText);

        Object.keys(this.model.External.images).forEach((ele, index) => {
            this.createItem(ele, index);
        });

        // this.updateFileView();
    }

    createItem(name, index = 0) {
        const text = new Phaser.GameObjects.Text(
            this.scene,
            0,
            28 + (28 * index),
            name,
            { fixedWidth: 246, fontFamily: 'Arial', fontSize: 22, color: '#000000', backgroundColor: '#decd94' }
        );
        text.data = null;
        text.setOrigin(0, 0);
        text.setInteractive();
        text.on('pointerdown', this.pointDown.bind(this, text));
        text.on('pointerup', this.pointUp.bind(this, text));
        text.on('pointerout', this.pointerOut.bind(this, text));
        text.on('pointerover', this.pointerOver.bind(this, text));
        this.itemGroup.add(text);
        return text;
    }

    pointDown(gameObject, point) {
        // const originXY = { x: point.downX - gameObject.x, y: point.downY - gameObject.y };
        // this.downLockItem = { item: gameObject, sx: gameObject.x, sy: gameObject.y, originXY };
        // this.bringToTop(gameObject);
        this.time = setTimeout(() => {
            // this.downLockItem.item.setStyle({ backgroundColor: '#444444', color: '#FFFFFF' });
            this.isSelectDrag = true;
        }, 250);
    }

    pointUp(gameObject) {
    }

    pointerOver(gameObject) {
    }

    pointerOut(gameObject) {
    }
}

export default class UIPos extends Phaser.GameObjects.Container {
    constructor(scene, model) {
        super(scene);
        /** 圖層區 */
        this.layer = new UILayer(scene, model);
        /** 元件庫 */
        this.lib = new UILibrary(scene, model);
        this.lib.y = this.layer.groupBg.height + 10;
        this.lib.visible = false;
        /** 檢視 */
        this.objectView = new UIObjectView(scene, model);
        this.objectView.visible = false;
        // this.lib.itemView = this.objectView;

        this.add(this.layer);
        // this.add(this.lib);
        this.add(this.objectView);

        const hKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        hKey.on('down', () => {
            this.visible = !this.visible;
        });
    }
}
