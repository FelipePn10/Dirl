import { z } from "zod";
import { router, privateProcedure } from "../trpc";
import { db } from "@/db";
import { TRPCError } from "@trpc/server";

export const pdfRouter = router({
    createPdf: privateProcedure
        .input(
            z.object({
                title: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            if (!userId) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const file = await db.file.create({
                data: {
                    name: input.title,
                    userId: userId,
                    uploadStatus: "PROCESSING",
                    url: "",
                    key: `generated-${Date.now()}`,
                },
            });

            return file;
        }),
});