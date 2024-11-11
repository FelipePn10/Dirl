/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {
            const { userId } = await auth();
            if (!userId) throw new Error("Não autorizado");
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const createdFile = await db.file.create({
                data: {
                    key: file.key,
                    name: file.name,
                    userId: metadata.userId,
                    url: file.url,
                    uploadStatus: "PROCESSING",
                    content: '', // Add this line to satisfy the 'content' requirement
                },
            });

            try {
                const response = await fetch(file.url);
                const blob = await response.blob();
                const loader = new PDFLoader(blob);
                const pageLevelDocs = await loader.load();
                const pagesAmt = pageLevelDocs.length;

                const pineconeIndex = getPineconeClient.Index('luapdf');

                const embeddings = new CohereEmbeddings({
                    apiKey: process.env.COHERE_API_KEY
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
            } catch (err) {
                await db.file.update({
                    data: {
                        uploadStatus: "FAILED"
                    },
                    where: {
                        id: createdFile.id,
                    }
                });
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;