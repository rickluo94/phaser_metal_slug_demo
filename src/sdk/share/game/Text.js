export default class Text extends Phaser.GameObjects.Text {
    constructor(scene, x, y, msg, data) {
        const style = (data.style !== undefined) ? data.style : data;
        super(scene, x, y, msg, style);
        if (data.style !== undefined) this.textFeat = data;
    }

    setLang(languageID) {
        /** 語系 */
        if (languageID) this.langKey = languageID;
        if (this.textFeat.lang && this.textFeat.lang[this.langKey]) this.text = this.textFeat.lang[this.langKey];
    }

    showNum(amount) {
        this.text = (this.msgStyleFunc)
            ? this.msgStyleFunc(amount)
            : `${amount}`;
    }

    // set text(msg) {
    //     // super.text = (this.msgStyleFunc) ? this.msgStyleFunc(msg) : msg;
    // }
}
