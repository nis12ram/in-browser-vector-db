import initReader from "./pipeline/ingestion/reader";
import initChunks from "./pipeline/ingestion/chunks";
import initEmbeddings from "./pipeline/ingestion/embeddings";
import initStore from "./pipeline/ingestion/store";
import initRetrieval from "./pipeline/retrieval";
import { getUniqueInteger } from "in-browser-vector-db"
import { getDbComponentsInstance } from "./dbInterface/dbFunctions";
import { getEmbModelInstance } from "./model";

const instances = {}
self.addEventListener('message', async (e) => {
    const mode = e.data.mode;
    if (mode === 'instance') {
        const prom1 = await getDbComponentsInstance({ dbName: 'simpleRetrievalDemo', vectorBlockName: 'srd1', configuration: { vectorDimension: 768, vectorDType: 'float32' } });
        const prom2 = await getEmbModelInstance();
        const [dbComponentsInstance, embModelInstance] = await Promise.all([prom1, prom2]);
        Object.assign(instances, {
            connection: dbComponentsInstance.connection,
            dbConnection: dbComponentsInstance.dbConnection,
            vectorBlockConnection: dbComponentsInstance.vectorBlockConnection,
            tokenizer: embModelInstance.tokenizer,
            embModel: embModelInstance.embModel
        });
        self.postMessage({ mode, success: true, result: null })
    };

    if (mode === 'ingestion') {
        const { fileType, file, data } = e.data.input;
        const text = await initReader({ fileType, file, data });
        const chunks = initChunks(text);
        const embeddings = await initEmbeddings(chunks, { embModel: instances.embModel, tokenizer: instances.tokenizer });
        const [indices, texts, vectors] = embeddings.reduce(([indices, texts, vectors], { chunk, embedding }) => {
            const index = getUniqueInteger();
            indices.push(index);
            texts.push(chunk);
            vectors.push(embedding);
            return [indices, texts, vectors];
        }, [[], [], []])
        const result = await initStore({ indices, texts, vectors }, instances.vectorBlockConnection);
        self.postMessage({ mode, success: true, result });
    };
    if (mode === 'retrieval') {
        const { query, topK } = e.data.input;
        if (query) {
            const result = await initRetrieval({ query, topK }, { vectorBlockConnection: instances.vectorBlockConnection, tokenizer: instances.tokenizer, embModel: instances.embModel });
            self.postMessage({ mode, success: true, result });
        };
    };
    if (mode === 'db') { };
})


// #### Opening the vectorblock.
// ```
// const vectorBlockConnection = await dbConnection.openVectorBlock("vbTest1");

// ```

