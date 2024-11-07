/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { getPineconeClient } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getSession } from "@auth0/nextjs-auth0";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateEmbedding(text: string): Promise<number[]> {
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

class CustomEmbeddings {
    async embedQuery(text: string): Promise<number[]> {
        return generateEmbedding(text);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const session = await getSession();
        const user = session?.user;
        const userId = (user as any)?.id || user?.sub;


        if (!userId) return new NextResponse("Não autorizado", { status: 401 });

        const { fileId, message } = SendMessageValidator.parse(body);

        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId,
            },
        });

        if (!file) return new NextResponse("Não encontrado", { status: 404 });

        await db.message.create({
            data: {
                text: message,
                isUserMessage: true,
                userId,
                fileId,
            },
        });

        const pineconeIndex = getPineconeClient.Index('luapdf');

        const vectorStore = await PineconeStore.fromExistingIndex(
            new CustomEmbeddings(),
            {
                pineconeIndex,
                namespace: file.id,
            }
        );

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
            role: msg.isUserMessage ? "user" : "model",
            parts: [{ text: msg.text }],
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `Use as seguintes partes do contexto (ou conversa anterior, se necessário) para responder à pergunta do usuário em formato markdown.
    Se você não souber a resposta, apenas diga que não sabe, não tente inventar uma resposta.
    
    Conversa anterior:
    ${formattedPrevMessages.map((message) => {
            if (message.role === 'user') return `Usuário: ${message.parts[0].text}\n`;
            return `Assistente: ${message.parts[0].text}\n`;
        }).join('')}
    
    Contexto:
    ${results.map((r) => r.pageContent).join('\n\n')}
    
    Entrada do usuário: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = await response.text();

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
        console.error("Erro no manipulador POST:", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}
