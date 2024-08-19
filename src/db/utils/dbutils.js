export class DbUtils {
    static hasKey(object, target) {
        if (object && target) {
            for (const key in object) {
                if (key === target) return true;
            }
            return false;
        } else return false;
    };

    static arraysHaveEqualLengths(...arrays) {
        const firstArrayLength = arrays[0].length;
        return arrays.every(({ length }) => length === firstArrayLength);
    };

    static createEmptyObjectsArray(n) {
        return Array.from({ length: n }, () => { return {} });
    };




};

