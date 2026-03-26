import { ButtonStyle } from './Button';

export default class ButtonBase {
    btnAry = [];

    setBtnState(data, ...args) {
        const { btnList } = data;
        if (data.func !== undefined) data.func(this, args);
        if (!btnList) return;
        // 判斷是陣列則是取出陣列內容 or 'ALL' 代表全部 btn
        const list = (Array.isArray(btnList)) ? btnList : [];
        if (data.alpha !== undefined) this.setAlpha(list, data.alpha);
        if (data.visible !== undefined) this.setBtnVisible(list, data.visible);
        if (data.enabled !== undefined) this.setEnabled(list, data.enabled);
        if (data.tintEnabled !== undefined) this.tintEnabled(list, data.tintEnabled);
    }

    getBtnListOK(btnList) {
        return (btnList && Array.isArray(btnList));
    }

    setBtnToggle(btnList, toggle) {
        if (!this.getBtnListOK(btnList)) return;
        this.setBtnVisible(btnList, toggle);
    }

    setBtnVisible(btnList, bool) {
        if (!this.getBtnListOK(btnList)) return;
        this.btnAry.forEach((element) => {
            if (btnList.indexOf(element.name) !== -1) {
                element.visible = bool;
            }
        });
    }

    setEnabled(btnList, bool) {
        if (!this.getBtnListOK(btnList)) return;
        this.btnAry.forEach((element) => {
            if (btnList.indexOf(element.name) !== -1) {
                (bool) ? element.onEnable() : element.onDisable();
            }
        });
    }

    tintEnabled(item, bool) {
        item.children.forEach((child) => { child.tint = (bool) ? 0xFFFFFF : 0x999999; });
    }

    createBtn(scene, btnDataList, group) {
        const btnList = [];
        Object.keys(btnDataList).forEach((btnKey) => {
            const btnData = btnDataList[btnKey];
            if (btnData.name === undefined) btnData.name = btnKey;
            const btn = ButtonStyle.getButton(scene, btnData);
            btnList.push(btn);
            this.btnAry.push(btn);
            this.btnAllName.push(btn.name);
            group.add(btn);
        });
        return btnList;
    }
}
