// Updated: Aug. 20, 2024
// Run: node testRegex.js whatever.txt
// Live demo: https://jina.ai/tokenizer
// LICENSE: Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0)
// COPYRIGHT: Jina AI

import { defaultChildrenConfig, defaultParentConfig } from "./defaultConfig";
import { getChildrenRegexInstance, getParentRegexInstance } from "./regexInstance,js";
export function textSplitter({ text, updateConfigPairs = {}, mode }) {
    if (!mode) throw new Error('mode should be specified');
    if (mode === 'parent') {
        const updatedConfig = { ...defaultParentConfig, ...updateConfigPairs };
        const regex = getParentRegexInstance(updatedConfig);
        let chunks = text.match(regex);
        chunks = chunks.filter(chunk => chunk?.length !== 0 && chunk);
        return chunks;
    } else if (mode === 'children') {
        const updatedConfig = { ...defaultChildrenConfig, ...updateConfigPairs };
        const regex = getChildrenRegexInstance(updatedConfig);
        let chunks = text.match(regex);
        chunks = chunks.filter(chunk => chunk?.length !== 0 && chunk);
        return chunks;
    } else return [];
};



