type GameConfigShape = {
    settings: {
        gameName: string;
        GameID: number;
    };
    injectJS: Record<string, string>;
};

const gameConfig: GameConfigShape = {
    settings: {
        gameName: 'Game Default',
        GameID: 1
    },
    /**
     * key: 全域名稱, value: js 路徑
     * 預設路徑為 src/
     */
    injectJS: {
        // PhaserSpine: 'external/phaser_spine_mesh_fix_min.js',
        // PhaserNineSlice: 'external/phaser-nineslice.min.js'
        Photon: 'external/photon-javascript-sdk/lib/photon.js'
    }
};

export default gameConfig;
