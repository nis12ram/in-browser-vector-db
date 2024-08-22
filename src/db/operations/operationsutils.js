import { vectorDTypes } from "../utils/vectorDTypes";
import { DbUtils } from "../utils/dbUtils";
import { isEqual } from 'lodash'
export class OperationsUtils {

    static convertVectorToBuffer({ vector, vectorDType }) {
        const typedArray = vectorDTypes[vectorDType];
        try {
            const typedArrayView = new typedArray(vector);
            const buffer = typedArrayView.buffer;
            return buffer;
        } catch (error) {
            return null;
        };

    };

    static convertBufferToVector({ buffer, vectorDType }) {
        const typedArray = vectorDTypes[vectorDType];
        try {
            const typedArrayView = new typedArray(buffer);
            const vector = Array.from(typedArrayView);
            return vector;
        } catch (error) {
            return null;
        };

    };

    /**
    * Converts a db entry into a readable entry.
    * It changes the buffer into a vector.
    *
    * @param {{index: number, text: string, buffer: ArrayBuffer, metadata: Object}} dbEntry - The entry to convert.
    * @param {string} vectorDType - The dType of vector
    * 
    * @returns {{index: number, text: string, vector: Array, metadata: Object}} - The converted, readable entry.
    */
    static convertDbEntryToReadableEntry({ dbEntry, vectorDType }) {
        const readableEntry = { ...dbEntry };
        if (!dbEntry.buffer) throw new OperationsError(`Buffer not found in dbEntry.`);
        const vector = this.convertBufferToVector({ buffer: dbEntry.buffer, vectorDType });
        if (!vector) throw new OperationsError(`Buffer to vector conversion failed.`);
        readableEntry.vector = vector;
        delete readableEntry.buffer;
        return readableEntry;
    };

    /**
    * Converts a readable entry to db entry.
    * It changes the vector into a buffer.
    *
    * @param {{index: number, text: string, vector: Array, metadata: Object}} readableEntry - The entry to convert.
    * @param {string} vectorDType - The dType of vector
    *
    * @returns {{index: number, text: string, buffer: ArrayBuffer, metadata: Object}} - The converted, db entry.
    */
    static convertReadableEntryToDbEntry({ readableEntry, vectorDType }) {
        const dbEntry = { ...readableEntry };
        if (!readableEntry.vector) throw new OperationsError(`Vector not found in readableEntry.`);
        const buffer = this.convertVectorToBuffer({ vector: readableEntry.vector, vectorDType });
        if (!buffer) throw new OperationsError(`Vector to buffer conversion failed.`);
        dbEntry.buffer = buffer;
        delete dbEntry.vector;
        return dbEntry;
    };

    static isVectorDimensionMatches({ vector, dimension }) {
        if (vector.length === dimension) return true;
        else false;
    };

    static isVectorDTypeMatches({ vector, dType }) {
        const typedArray = vectorDTypes[dType];
        const typedArrayView = new typedArray(vector);
        if (typedArrayView[0] === vector[0]) return true;
        else false;
    };

    /**
    * Matches 2 readable entries.
    *
    * @param {{index: number, text: string, vector: Array, metadata: Object}} entry1 - The first entry.
    * @param {{index: number, text: string, vector: Array, metadata: Object}} entry2 - The second entry.
    *
    * @returns {Boolean} - The boolean value whether the entries matches or not.
    */
    static matchEntries({ entry1, entry2 }) {
        const { index: index1, text: text1, vector: vector1, metadata: metadata1 } = entry1;
        const { index: index2, text: text2, vector: vector2, metadata: metadata2 } = entry2;

        // Index match 
        if (!isEqual(index1, index2)) return false;
        // Text match
        if (!isEqual(text1, text2)) return false;;
        // Vector match
        if (!isEqual(vector1, vector2)) return false
        // Metadata match 
        return isEqual(metadata1, metadata2);
    };


    static topKStorageTemplate(topK) {
        return Array.from({ length: topK }, () => { return [{}, 1000.0] });
    };
};