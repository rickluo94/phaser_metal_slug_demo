type DevPacket = {
    opcode: string | number;
    param: unknown;
};

type DevDecodedPacket = {
    opcode: string | number;
    message: unknown;
};

type BinaryDecodedPacket = {
    opcode: number;
    buffer: Uint8Array;
};

type StringDecodedPacket = {
    opcode: string;
    buffer: Uint8Array;
};

/** 解析讀取內容 */
export class PkgBase {
    static EmitDev(opcode: string | number, param: unknown) {
        return JSON.stringify({
            opcode,
            param
        });
    }

    static DevDecode(pkg: string): DevDecodedPacket {
        const msg = JSON.parse(pkg) as DevPacket & { data?: unknown };
        return {
            opcode: msg.opcode,
            message: msg.data
        };
    }
}

export class GoV1 extends PkgBase {
    static Encode(opcode: number, buffer: ArrayLike<number>) {
        const pkt = new ArrayBuffer(3 + buffer.length);
        const dv = new DataView(pkt);
        dv.setUint16(1, opcode, true);
        for (let i = 0; i < buffer.length; i++) {
            dv.setUint16(3 + i, buffer[i]);
        }
        return pkt;
    }

    static Decode(pkg: ArrayBufferLike): BinaryDecodedPacket {
        const buf = new Uint8Array(pkg);
        const cmd = buf.slice(0, 3);
        const data = buf.slice(3, buf.length);
        const dv = new DataView(cmd.buffer, 1, 2);
        const code = dv.getUint16(0, true);

        return {
            opcode: code,
            buffer: data
        };
    }
}

export class GoV2 extends PkgBase {
    static Encode(buffer: ArrayLike<number>) {
        const pkt = new ArrayBuffer(buffer.length);
        const dv = new DataView(pkt);
        for (let i = 0; i < buffer.length; i++) dv.setUint8(i, buffer[i]);

        return pkt;
    }

    static Decode(pkg: ArrayBufferLike): StringDecodedPacket {
        const buf = new Uint8Array(pkg);
        const nameLength = buf[1];
        const nameBuf = buf.slice(2, nameLength + 2);
        const nameStr = decodeURIComponent(escape(String.fromCharCode(...nameBuf)));

        return {
            opcode: nameStr,
            buffer: buf
        };
    }
}
