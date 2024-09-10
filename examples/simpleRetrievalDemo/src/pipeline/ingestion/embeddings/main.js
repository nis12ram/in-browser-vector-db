import { getChunksEmbedding } from "./lateChunking/chunksEmbedding";
/**
* Get the embeddings from the chunks.
* 
* @param {Object} chunks - The chunks.
* @returns {Promise<Array<{chunk:String,embedding:Array<Number>}>>} The embeddings. 
*/
export async function initEmbeddings(chunks, { embModel, tokenizer }) {
    const embeddings = await getChunksEmbedding(chunks, { embModel, tokenizer });
    return embeddings;
};