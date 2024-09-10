import pdfToText from "react-pdftotext";

export async function pdfExtraction(file) {
    const text = await pdfToText(file).catch(
        error => {
            console.error(error);
        }
    );    
    return text;
};