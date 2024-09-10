import { isEqual } from "lodash"

export async function getChunksTokenSpan({ allChildrenChunk, parentTokenIds }, tokenizer) {
    const allChildrenChunkTokenSpan = [];
    const inputs = await tokenizer(allChildrenChunk, { padding: true, truncate: true });
    const allChildrenChunkTokenIds = inputs['input_ids'].tolist();
    allChildrenChunkTokenIds.forEach((childrenChunkTokenIds, i) => {
        const truncatedChildrenChunkTokenIds = truncateArr(childrenChunkTokenIds);
        const childrenChunkTokenSpan = matchSequenceInArr({ arr: parentTokenIds, sequence: truncatedChildrenChunkTokenIds });
        if (childrenChunkTokenSpan) allChildrenChunkTokenSpan.push(childrenChunkTokenSpan);
        else {
            // Sequence does not matches.
        };
    });
    return allChildrenChunkTokenSpan;
};

function truncateArr(arr) {
    let truncatedArray = arr;
    // Removing the pad tokens(padding side is right)
    const padTokenId = BigInt(0);
    const truncateIndex = truncatedArray.indexOf(padTokenId);
    if (truncateIndex !== -1) truncatedArray = truncatedArray.slice(0, truncateIndex);
    // Removing the cls and sep token
    truncatedArray = truncatedArray.slice(1, -1);
    return truncatedArray
};

function matchSequenceInArr({ arr, sequence }) {
    const slidingSize = sequence.length;
    const arrLength = arr.length;
    for (let index = 0; index < arr.length; index++) {
        if (index + slidingSize > arrLength) break;
        const slidingWindow = arr.slice(index, index + slidingSize);
        if (isEqual(sequence, slidingWindow)) return { start: index, end: index + slidingSize };
    };
    return undefined;
};