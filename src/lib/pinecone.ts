import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY não está definida nas variáveis de ambiente');
}

// if (!process.env.PINECONE_ENVIRONMENT) {
//     throw new Error('PINECONE_ENVIRONMENT não está definida nas variáveis de ambiente');
// }

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

export const getPineconeClient = pinecone;

export const getPineconeIndex = async (indexName: string) => {
    return pinecone.index(indexName);
};