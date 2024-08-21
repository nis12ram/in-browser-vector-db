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

    static arrayHaveSingleType(arr) {
        if (arr.length === 0) return true;
        const firstType = typeof arr[0];
        const isArrayHaveSingleType = arr.every(item => typeof item === firstType);        
        return { isArrayHaveSingleType, type: isArrayHaveSingleType ? firstType : undefined }
    }




};




