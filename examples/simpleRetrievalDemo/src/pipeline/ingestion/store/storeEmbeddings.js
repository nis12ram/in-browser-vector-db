/**
* Store the embeddings.
* 
* @param {Array<number>} indices - An array of positions where the entries are stored.
* @param {Array<string>} texts - An array of text content for each entry.
* @param {Array<Array<Number>} vectors - An array containing the vector data for each entry.
* @param {Array<Object>} metadataArray - An array of objects containing additional information about each entry.
* 
* @returns {Promise<Array<{msg:string}>>|Promise<undefined>} 
*/
export async function storeEmbeddings({ indices, texts, vectors, metadataArray }, vectorBlockConnection) {
    if (vectorBlockConnection.vectorBlockConfigured) {
        return await vectorBlockConnection.operations.insertMany({ indices, texts, vectors, metadataArray });
    };
};