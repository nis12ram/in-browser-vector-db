import { useDotProduct } from "./vectorDistanceUtils"


export const vectorDistanceAlgorithms = Object.freeze({
    cosine: cosineSimilarity,
    l2,
    hamming: hammingDistance,
    normHamming: normalizedHammingDistance
});

/**
* Uses Modified cosine similarity to compute distance between vectors.
*
* Formulae: 1 - (normV1.normV2)
* 
* @param {Array<number>} vector1 - The first vector.
* @param {Array<Number>} vector2 - The second vector.
* 
* @returns {Number} The distance between two vectors.
*/
function cosineSimilarity({ vector1, vector2 }) {
    return 1 - useDotProduct({ vector1, vector2 });
};

/**
* Uses l2/euclidean distance to compute distance between vectors.
*
* @param {Array<number>} vector1 - The first vector.
* @param {Array<Number>} vector2 - The second vector.
* 
* @returns {Number} The distance between two vectors.
*/
function l2({ vector1, vector2 }) {
    return Math.sqrt(vector1.reduce((accumlator, currentValue, currentIndex) => accumlator + Math.pow(currentValue - vector2[currentIndex], 2), 0));
};

/**
* Uses hamming distance to compute distance between vectors.
*
* Note - Only supports binary vectors.
*
* @param {Array<number>} vector1 - The first vector.
* @param {Array<Number>} vector2 - The second vector.
* 
* @returns {Number} The distance between two vectors.
*/
function hammingDistance({ vector1, vector2 }) {
    let distance = 0;
    for (let i = 0; i < vector1.length; i++) {
        if (vector1[i] !== vector2[i]) distance += 1;
    };
    return distance;
};

/**
* Uses normalized hamming distance to compute distance between vectors.
*
* Note - Only supports binary vectors.
*
* @param {Array<number>} vector1 - The first vector.
* @param {Array<Number>} vector2 - The second vector.
* 
* @returns {Number} The distance between two vectors.
*/
function normalizedHammingDistance({ vector1, vector2 }) {
    let distance = 0;
    const dimension = vector1.length;
    for (let i = 0; i < vector1.length; i++) {
        if (vector1[i] !== vector2[i]) distance += 1;
    };
    return distance / dimension;

};


