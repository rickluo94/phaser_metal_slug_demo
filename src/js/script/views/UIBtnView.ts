import GameBase from '@kernel/utility/GameBase';
import { MainSceneEventType } from '@script/events/MainSceneEventType';
import { ButtonStyle } from '@share/game/Button';

export default class UIBtnView extends GameBase {
    context;

    initUI() {
        this.context = this.game.add.container().setName('UIBtnView');

        const button = ButtonStyle.NewUIBtn(this.game, 1100, 620, 'buttonAtlas', 'clip_coin_', ['1', '2', '2']);
        button.name = 'mainButton';
        button.onClick = () => {
            button.setScale(0.5);
            this.dispatchEvent(MainSceneEventType.ChangeBackground);
        };
        button.on('pointerup', () => {
            button.setScale(1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
        });

        this.context.add(button);
    }

    destroy() {
        super.destroy();
        this.context?.destroy(true);
        this.context = null;
    }
}
