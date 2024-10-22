import { Cohere } from "@langchain/cohere"

export const cohere = new Cohere({
    apiKey: process.env.COHERE_API_KEY,
})