import 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser';

import CommonBase from '@share/game/CommonBase';
import LoadSources from '@share/tools/LoadSources';

import BootScene from '@/js/scenes/BootScene';
import LoaderScene from '@/js/scenes/LoadScene';
import TitleScene from '@/js/scenes/TitleScene';
import SelectCharacterScene from '@/js/scenes/SelectCharacterScene';
import MainGameScene from '@/js/scenes/MainGameScene';
import ErrorScene from '@/js/scenes/ErrorScene';
import { Config } from '@/js/files/Config';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CustomEase } from 'gsap/CustomEase';

declare global {
    interface Window {
        CustomEase: typeof CustomEase;
    }
}

declare const process: {
    env: {
        git?: string;
    };
};

/** # Config
 * title: 遊戲標題
 * version: 遊戲版本
 * width: 遊戲畫布寬度
 * height: 遊戲畫布高度
 * render: 宣染配置
 * scene: 場景配置
 * physics: 實體引擎配置
 * ## render
 * type: 宣染類型
 * scaleMode: 畫布縮放模式 Phaser.ScaleModes.DEFAULT
 * autoFocus: 阻止遊戲畫布自動取得焦點(默認true)
 * clearBeforeRender: 是否在每幀宣染前清除畫布(默認true)
 * fullscreen: 是否全螢幕(默認false)
 * transparent: 遊戲畫布是否透明(默認false)
 * pixelArt: 是否啟動像素藝術 (Pixel Art) (默認false)
 * antialias: 是否啟用抗鋸齒效果(默認true)
 * antialiasGL: 是否啟用 WebGL 抗鋸齒效果(預設true)
 * resolution: 宣染器的縮放比例, 數字或一個對象
 * autoResize: 是否自動化調整視窗大小(預設為 true)
 */
const config = {
    type: Phaser.AUTO,
    // maxWidth: 1280,
    // maxHeight: 1280,
    width: Config.GAME_WIDTH,
    height: Config.GAME_HEIGHT,
    autoFocus: false,
    backgroundColor: '#000000',
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pauseOnBlur: false,
    disableContextMenu: true,
    scene: [BootScene, LoaderScene, TitleScene, SelectCharacterScene, MainGameScene, ErrorScene],
    plugins: {
        scene: [
            { key: 'spine.SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }
        ]
    }
};

/** 建立CommonBase */
new CommonBase(config);
/** 建立loader管理 */
new LoadSources(process.env.git);
window.CustomEase = CustomEase;
gsap.registerPlugin(CustomEase, MotionPathPlugin);
gsap.install(window);
