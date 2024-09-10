import { retrievalResult } from "./retrievalResult";

/**
* Retrieve the topK similar entries.
* 
* @param {string} query - The query.
* @param {string} [vectorDistance='cosine'] - The algorithm used to compute distance between vectors.
* @param {number} topK - The top k search result to return.
* @param {Object} [where={}]  - The filter conditions based on metadata.
* @param {VectorBlockConnection} vectorBlockConnection - The connection to the vectorBlock of a db.
* @param {Function} tokenizer - The tokeinzer of embedding model.
* @param {Function} embModel - The mebedding model.
* 
* @returns {Array<[{},distance]>} The topk result.
*/
export async function initRetrieval({ query, vectorDistance = 'cosine', topK, where = {} }, { vectorBlockConnection, tokenizer, embModel }) {
    if (vectorBlockConnection.vectorBlockConfigured) {
        const result = await retrievalResult({ query, vectorDistance, topK, where }, { vectorBlockConnection, tokenizer, embModel });
        return result;
    };
};