import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { CohereClient } from "cohere-ai";
import { NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const { getUser } = getKindeServerSession();
        const user = await getUser();
        const { id: userId } = user;

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { fileId, message } = SendMessageValidator.parse(body);

        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId,
            },
        });

        if (!file) return new NextResponse("Not Found", { status: 404 });

        await db.message.create({
            data: {
                text: message,
                isUserMessage: true,
                userId,
                fileId,
            },
        });

        const embeddings = new CohereEmbeddings({
            model: "embed-english-light-v2.0", //use another AI in the future
            apiKey: process.env.COHERE_API_KEY!,
        });

        const pineconeIndex = getPineconeClient.Index('luapdf')

        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file.id,
        });

        const results = await vectorStore.similaritySearch(message, 4);

        const prevMessages = await db.message.findMany({
            where: {
                fileId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            take: 6,
        });

        const formattedPrevMessages = prevMessages.map((msg) => ({
            role: msg.isUserMessage ? "user" : "assistant",
            content: msg.text,
        }));

        const cohere = new CohereClient({
            token: process.env.COHERE_API_KEY,
        });

        const response = await cohere.generate({
            model: "command",
            prompt: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.
            If you don't know the answer, just say that you don't know, don't try to make up an answer.
            
            Previous conversation:
            ${formattedPrevMessages.map((message) => {
                if (message.role === 'user') return `User: ${message.content}\n`
                return `Assistant: ${message.content}\n`
            })}
            
            Context:
            ${results.map((r) => r.pageContent).join('\n\n')}
            
            User input: ${message}`,
            maxTokens: 500,
            temperature: 0,
        });

        const generatedText = response.generations[0].text;

        await db.message.create({
            data: {
                text: generatedText,
                isUserMessage: false,
                userId,
                fileId,
            },
        });

        return NextResponse.json({ response: generatedText });

    } catch (error) {
        console.error("Error in POST handler:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};