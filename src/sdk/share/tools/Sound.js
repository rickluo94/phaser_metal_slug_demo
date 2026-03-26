export default class Sound {
    constructor(scene, model, config, isLog = false) {
        // 單例
        Sound.instance = this;
        this.game = scene;
        this.config = config;
        if (model.BaseSound !== undefined) this.featSound = new model.BaseSound(Sound);

        // 所有音效
        this.externalSound = Object.values(model.External.sound).reduce((acc, cur) => ({...acc, ...cur}), {});

        this.isLog = isLog;
    }

    /**
     * 判斷是否有這個音效
     * @param {String} key 要檢查的音效
     * @return {Boolean} 是否有這個音效
     */
    static isCacheKey(key) {
        if (this.instance.game.cache.audio.exists(key)) {
            if (!this.instance.game.sound.get(key)) {
                const sound = this.instance.game.sound.add(key);
                sound.loop = (this.instance.externalSound[key].loop) ? this.instance.externalSound[key].loop : false
            }
            return true;
        } else {
            console.warn(`找不到此${key}音效，請檢查檔名是否錯誤或是否有加載或是識別碼錯誤`)
        }

        return false;
    }

    // 取得音效
    static getSound(key) {
        return this.instance.game.sound.get(key);
    }

    /**
     * 音效播放中控
     * @param {String} key 要播放的音效
     * @param {Object} configData 音效設定，seek、rate、loop、volume、detune…等
     * 範例：Sound.play('BG_BGM', { volume: 5, rate: 0.5, detune: 100, onStart: () => {}, onComplete: () => {} });
     */
    static play(key, configData = {}) {
        if (this.isCacheKey(key)) {
            const soundItem = this.getSound(key);

            const soundConfig = {
                volume: (configData.fadeData) ? configData.fadeData.startVolume : 1,
                ...configData
            };
            soundItem.play('', soundConfig);

            if (configData.fadeData) {
                const fadeData = configData.fadeData;
                let tween = gsap.timeline();
                tween.to(soundItem, {
                    ease: fadeData.ease || 'none',
                    duration: fadeData.sec,
                    volume: fadeData.endVolume,
                    onStart: () => {
                        if (this.instance.isLog) console.warn(`播放 淡入淡出音效: ${key}, 起始音量：${fadeData.startVolume}, 結束音量：${fadeData.endVolume}, 淡入淡出秒數: ${fadeData.sec}`);
                    },
                    onComplete: () => {
                        tween.kill()
                        tween = null;
                    }
                });
            } else {
                if (this.instance.isLog) console.warn(`播放: ${key}`);
            }

            // 音效開始後callBack(loop的話不會進來)
            if (configData.onStart) soundItem.on('play', configData.onStart.bind(this));
            // 音效完成後callBack
            if (configData.onComplete) soundItem.on('complete', configData.onComplete.bind(this));
        }
    }


    // 音效暫停
    static stop(key, configData = {}) {
        if (this.instance.isLog) console.warn(`暫停: ${key}`);
        if (this.isCacheKey(key)) this.getSound(key).stop(key);
    }

    // 淡入淡出設定
    static fade(key, soundData, soundConfig = {}) {
        // 預設淡入淡出參數
        let defaultData = {
            startVolume: 0,
            endVolume: 1,
            sec: 1,
        }
        const fadeData = { ...defaultData, ...soundData };
        Sound.play(key, { soundConfig, fadeData });
    }

    // 靜音
    static mute() {
        if (this.instance.isLog) console.warn('全部遊戲靜音');
        this.instance.game.sound.mute = true;
    }

    // 解除靜音
    static unMute() {
        if (this.instance.isLog) console.warn('解除全遊戲靜音');
        this.instance.game.sound.mute = false;
    }

    static get Base() {
        return this.instance.featSound;
    }

}
