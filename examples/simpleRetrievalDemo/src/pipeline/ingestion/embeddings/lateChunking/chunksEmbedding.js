import { getChunksTokenSpan } from "./chunksTokenSpan";

/**
* Get the embeddings from the chunks.
* 
* @param {Object} chunks - The chunks.
* @returns {[{chunk:String,embedding:Array}]} The embeddings. 
*/
export async function getChunksEmbedding(chunks, { embModel, tokenizer }) {
    const allParentChunk = Object.keys(chunks).map(index => chunks[index].parentChunk);
    const inputs = await tokenizer(allParentChunk, { padding: true, truncate: true });
    const embModelResponse = await embModel(inputs);
    const allParentChunkTokenAttentionalRepresentations = embModelResponse['last_hidden_state'].tolist();
    const allParentTokenIds = inputs['input_ids'].tolist();
    const allChunkEmbedding = [];
    // Parallel chunkEmbedding computation
    await Promise.all(allParentTokenIds.map(async (parentTokenIds, parentIndex) => {
        const allChildrenChunk = chunks[parentIndex].allChildrenChunk;
        const allChildrenChunkTokenSpan = await getChunksTokenSpan({ allChildrenChunk, parentTokenIds }, tokenizer);
        const parentChunkTokenAttentionalRepresentations = allParentChunkTokenAttentionalRepresentations[parentIndex];
        allChildrenChunkTokenSpan.forEach((childrenChunkTokenSpan, childrenIndex) => {
            const { start, end } = childrenChunkTokenSpan;
            const childrenChunkTokenAttentionalRepresentations = parentChunkTokenAttentionalRepresentations.slice(start, end);
            const childrenChunkEmbedding = meanPooling(childrenChunkTokenAttentionalRepresentations);
            allChunkEmbedding.push({ chunk: allChildrenChunk[childrenIndex], embedding: childrenChunkEmbedding });;
        });
    }));
    return allChunkEmbedding;
};


/*
* Perfomes Mean Pooling operation..
*  
* @param {Array} arr - The attentional representation of all tokens of a chunk. 
* @returns {Array} The mean pooled array.
*/
function meanPooling(arr) {
    const numVectors = arr.length;
    const vectorDim = arr[0].length;
    let meanPooledVector = [];
    for (let i = 0; i < vectorDim; i++) {
        let meanValue = 0;
        for (let j = 0; j < numVectors; j++) {
            meanValue += arr[j][i];
        };
        meanValue = meanValue / numVectors;
        meanPooledVector.push(meanValue);
    };
    // converting the array(default float64) to float32 precision array
    meanPooledVector = Float32Array.from(meanPooledVector);
    meanPooledVector = Array.from(meanPooledVector);
    return meanPooledVector;
};

