declare module 'number-precision' {
    const np: {
        enableBoundaryChecking: (flag: boolean) => void;
        plus: (...numbers: number[]) => number;
        minus: (...numbers: number[]) => number;
        times: (...numbers: number[]) => number;
        divide: (...numbers: number[]) => number;
        round: (value: number, decimal?: number) => number;
        strip: (value: number, precision?: number) => number;
    };

    export default np;
}
