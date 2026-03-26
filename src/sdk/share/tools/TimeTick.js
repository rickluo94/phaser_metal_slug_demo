export default class TimeTick {
    updateFunc = null;
    completeFunc = null;
    secType = 'add';
    useSec = null;
    endSec = null;
    timeSetting = { startSec: null, endSec: null, delay: 1000, loop: true };
    constructor(scene, setting) {
        this.game = scene;
        if (setting) this.setTime(setting);
    }

    setTime(setting) {
        Object.assign(this.timeSetting, setting);
    }

    /** 秒數計算 */
    onTimerTick() {
        (this.secType === 'add') ? this.useSec++ : this.useSec--;
        if (this.updateFunc) this.updateFunc(this.useSec);
        if (this.endSec === null) return;
        if (this.useSec === this.endSec && this.completeFunc) this.completeFunc();
    }

    play() {
        const { startSec, endSec, delay, loop } = this.timeSetting;
        this.useSec = startSec;
        this.endSec = endSec || null;
        // 秒數相同跳出
        if (this.useSec === this.endSec) return;

        if (this.endSec != null) {
            this.secType = (this.useSec < this.endSec)
                ? 'add'
                : 'acc';
        }
        // 計時器
        this.playTime = this.scene.time.addEvent({
            delay,
            callback: this.onTimerTick,
            callbackScope: this,
            loop
        });
    }

    pause() {
        if (this.playTime) this.playTime.pause();
    }

    resume() {
        if (this.playTime) this.playTime.resume();
    }

    stop() {
        if (this.playTime) {
            // 清除計時器
            this.playTime.remove();
            this.game.time.removeEvent(this.playTime);
            this.playTime = null;
        }
    }
}

