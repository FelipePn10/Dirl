import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ image: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {

            const { getUser } = getKindeServerSession()
            const user = getUser()

            if (!user || !(await user).id) throw new Error("Não autorizado")

            return { userId: (await user).id };
        })
        .onUploadComplete(async ({ metadata, file }) => { }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
