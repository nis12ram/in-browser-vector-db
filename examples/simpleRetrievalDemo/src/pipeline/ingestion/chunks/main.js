import { textSplitter } from "./textSplitter";
import { preProcessTextForParentChunking, preProcessTextForChildrenChunking, simplifyTextOfParentChunk } from "./utils";
/**
* Get the chunks from the text.
* 
* @param {string} text - The text for chunking.
* @returns {Object} The chunks. 
*/
export function initChunks(text) {
    const chunks = [];
    const textForParentChunking = preProcessTextForParentChunking(text);
    const parentChunks = textSplitter({
        text: textForParentChunking,
        updateConfigPairs: { MAX_SENTENCE_LENGTH: 10000 },
        mode: 'parent'
    });
    parentChunks.forEach((parentChunk, i) => {
        const textForChildrenChunking = preProcessTextForChildrenChunking(parentChunk);
        const allChildrenChunk = textSplitter({
            text: textForChildrenChunking,
            updateConfigPairs: { MAX_SENTENCE_LENGTH: 300 },
            mode: 'children'
        });
        const simplifiedParentChunk = simplifyTextOfParentChunk(parentChunk);
        chunks[i] = { parentChunk: simplifiedParentChunk, allChildrenChunk };
    });
    return chunks;
};


