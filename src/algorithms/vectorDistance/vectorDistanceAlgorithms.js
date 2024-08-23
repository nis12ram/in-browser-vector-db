import { useDotProduct } from "./vectorDistanceUtils"


export const vectorDistanceAlgorithms = Object.freeze({
    cosine: cosineSimilarity
})

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