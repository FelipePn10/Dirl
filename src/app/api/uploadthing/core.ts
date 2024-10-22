import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {

            const { getUser } = getKindeServerSession()
            const user = getUser()

            if (!user || !(await user).id) throw new Error("Não autorizado")

            return { userId: (await user).id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const createdFile = await db.file.create({
                data: {
                    key: file.key,
                    name: file.name,
                    userId: metadata.userId,
                    url: file.url,
                    uploadStatus: "PROCESSING",
                },
            });

            try {
                const response = await fetch(file.url)

                const blob = await response.blob()

                const loader = new PDFLoader(blob)

                const pageLevelDocs = await loader.load()

                const pagesAmt = pageLevelDocs.length

                //vectorize and index entire document

                const pineconeIndex = getPineconeClient.Index('luapdf')

                const embeddings = new CohereEmbeddings({
                    apiKey: process.env.COHERE_API_KEY
                })

                await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
                    pineconeIndex,
                    namespace: createdFile.id,
                })

                await db.file.update({
                    data: {
                        uploadStatus: "SUCCESS"
                    },
                    where: {
                        id: createdFile.id,
                    }
                })
            } catch (err) {


                console.error("Error processing PDF", err)


                await db.file.update({
                    data: {
                        uploadStatus: "FAILED"
                    },
                    where: {
                        id: createdFile.id,
                    }
                })
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
