// import * as GamePkg from '@protocol/test/testPkg'; // 範例, 需要選pkg
import Encrypt from '@kernel/network/base/Encrypt';
import Model from '@kernel/utility/Model';
import GameFlow from '@script/process/GameFlow';

type ProtocolPackShape = {
    GameID: string | undefined;
    IP: string;
    UrlParams: typeof Model.UrlParams;
    GameFlow: typeof GameFlow;
    Encrypt: Encrypt;
};

const encrypt = new Encrypt();
encrypt.setToggle(Boolean(Model.Setting.isEncrypted));

/** 使用與後端串接用的對應文件,可隨import切換路徑檔案對象 */
export const ProtocolPack: ProtocolPackShape = {
    GameID: process.env.GameID,
    IP: process.env.IP || 'ws://127.0.0.1:8080', // 'ws://127.0.0.1', // 本地開發的預設IP
    UrlParams: Model.UrlParams,
    // GamePkg,
    GameFlow,
    Encrypt: encrypt
};
