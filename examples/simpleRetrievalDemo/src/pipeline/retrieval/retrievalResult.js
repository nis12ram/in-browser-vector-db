import { mean_pooling } from "@xenova/transformers";

/**
* Retrieve the topK similar entries.
* 
* @param {string} query - The query.
* @param {string} vectorDistance - The algorithm used to compute distance between vectors.
* @param {number} topK - The top k search result to return.
* @param {Object} where - The filter conditions based on metadata.
* @param {VectorBlockConnection} vectorBlockConnection - The connection to the vectorBlock of a db.
* @param {Function} tokenizer - The tokeinzer of embedding model.
* @param {Function} embModel - The mebedding model.
* 
* @returns {Array<[{},distance]>} The topk result.
*/
export async function retrievalResult({ query, vectorDistance, topK, where }, { vectorBlockConnection, tokenizer, embModel }) {
    const queryVector = await convertQueryToVector(query, { tokenizer, embModel });
    const result = await vectorBlockConnection.operations.search({ queryVector, vectorDistance, topK, where });
    return result;
};


/**
* Convert query to vector.
* 
* @param {string} query - The query.
* 
* @returns {Array<number>} The vector.
*/
async function convertQueryToVector(query, { tokenizer, embModel }) {
    const inputs = await tokenizer(query);
    const { last_hidden_state } = await embModel(inputs, { pooling: 'mean' });
    const vector = mean_pooling(last_hidden_state, inputs.attention_mask).tolist();
    return vector[0];
}