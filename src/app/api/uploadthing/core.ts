import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex } from "@/lib/pinecone";

const f = createUploadthing();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY não está definida nas variáveis de ambiente");
}

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {
            const { userId } = getAuth(req);
            if (!userId) throw new Error("Não autorizado");
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            let createdFile;
            try {
                createdFile = await db.file.create({
                    data: {
                        key: file.key,
                        name: file.name,
                        userId: metadata.userId,
                        url: file.url,
                        uploadStatus: "PROCESSING",
                        content: '',
                    },
                });

                const response = await fetch(file.url);
                const blob = await response.blob();
                const loader = new PDFLoader(blob);
                const pageLevelDocs = await loader.load();

                const pineconeIndex = await getPineconeIndex('luapdf');

                const embeddings = new GoogleGenerativeAIEmbeddings({
                    apiKey: geminiApiKey
                });

                await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
                    pineconeIndex,
                    namespace: createdFile.id,
                });

                await db.file.update({
                    data: {
                        uploadStatus: "SUCCESS"
                    },
                    where: {
                        id: createdFile.id,
                    }
                });

                console.log("Arquivo processado com sucesso:", createdFile.id);
            } catch (err) {
                console.error("Erro no processamento do arquivo:", err);
                if (createdFile) {
                    await db.file.update({
                        data: {
                            uploadStatus: "FAILED"
                        },
                        where: {
                            id: createdFile.id,
                        }
                    });
                }
                throw err;
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;