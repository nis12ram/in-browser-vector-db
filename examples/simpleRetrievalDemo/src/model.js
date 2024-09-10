import { env, AutoTokenizer, AutoModel } from '@xenova/transformers'


// skip local model since we are downloading from hugging face
env.allowLocalModels = false;

class Models {
    static async getEmbModelInstance(modelName = 'nomic-ai/nomic-embed-text-v1.5', progressCallback = () => { }) {
        const tokenizer = await AutoTokenizer.from_pretrained(modelName);
        const embModel = await AutoModel.from_pretrained(modelName, {
            quantized: false,
            progress_callback: progressCallback
        });
        return { tokenizer, embModel };
    };
};
const getEmbModelInstance = Models.getEmbModelInstance;
export { getEmbModelInstance };
