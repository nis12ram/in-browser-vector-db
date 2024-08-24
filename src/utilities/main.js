import { modifiedSignum } from "./mainHelper";

/**
* Converts float vectors to binary vectors.
* 
* @param {Array<Array>} vectors - The list of vector.
* 
* @returns {Array<Array>} - The list of binary vectors.
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
