// allowParaBreaks = true -> Do not join Para's.

export function preProcessTextForParentChunking(text, allowParaBreaks = true) {
    const formattedText = text.split('\n').join('#NL#');
    return allowParaBreaks ? text : formattedText;
};
export function preProcessTextForChildrenChunking(text, allowParaBreaks = true) {
    const formattedText = text.split('#NL#').join('\n');
    return allowParaBreaks ? text : formattedText;
};
export function simplifyTextOfParentChunk(text, allowParaBreaks = true) {
    const formattedText = text.split('#NL#').join('.');
    return allowParaBreaks ? text : formattedText;
};