import { modifiedSignum } from "./mainHelper";

/**
* Converts float vectors to binary vectors.
* 
* @param {Array<Array<Number>>} vectors - The list of vector.
* 
* @returns {Array<Array<Number>>} - The list of binary vectors.
*
* @example
* const binaryVectors  = convertFloatToBinary([vector1,vector2,vector3]);
* console.log(binaryVectors); // Output: [binaryVector1,binaryVector2,binaryVector3]
*/
export function convertFloatToBinary(vectors) {
    const binaryVectors = [];
    vectors.forEach(vector => {
        const binaryVector = modifiedSignum(vector)
        binaryVectors.push(binaryVector);
    });
    return binaryVectors
};

/**
* Get unique integer.
*
* You can use it for generating unique index for your entry.
*/
export function getUniqueInteger() {
    try {
        const now = new Date();
        return Number([
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getUTCMilliseconds(),
            crypto.getRandomValues(new Uint8Array(1))[0]
        ].join(""));
    } catch (error) { throw new Error(error) }

}
