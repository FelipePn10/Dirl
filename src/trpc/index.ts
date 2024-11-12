import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '@/db';
import { pdfRouter } from './router/pdf';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';

export const appRouter = router({
    authCallback: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.userId) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        try {
            const dbUser = await db.user.findFirst({
                where: {
                    id: ctx.userId,
                },
            });

            if (!dbUser) {
                await db.user.create({
                    data: {
                        id: ctx.userId,
                        email: ctx.session?.user?.email ?? '',
                    },
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Erro no authCallback:', error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Falha no callback de autenticação",
            });
        }
    }),

    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        return await db.file.findMany({
            where: {
                userId: userId,
            },
        });
    }),


    getPageFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                fileId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;
            const { fileId, cursor } = input;
            const limit = input.limit ?? INFINITE_QUERY_LIMIT;

            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    userId,
                },
            });
            if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

            const messages = await db.message.findMany({
                take: limit + 1,
                where: {
                    fileId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                cursor: cursor ? { id: cursor } : undefined,
                select: {
                    id: true,
                    isUserMessage: true,
                    createdAt: true,
                    text: true,
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (messages.length > limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem?.id;
            }

            return {
                messages,
                nextCursor,
            };
        }),

    getFileUploadStatus: privateProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ input, ctx }) => {
            const file = await db.file.findFirst({
                where: {
                    id: input.fileId,
                    userId: ctx.userId,
                },
            });

            if (!file) return { status: "PEDING" as const };

            return { status: file.uploadStatus };
        }),

    getFile: privateProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const file = await db.file.findFirst({
                where: {
                    key: input.key,
                    userId,
                },
            });
            if (!file) throw new TRPCError({ code: "NOT_FOUND" });

            return file;
        }),

    deleteFile: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const file = await db.file.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!file) throw new TRPCError({ code: "NOT_FOUND" });

            await db.file.delete({
                where: {
                    id: input.id,
                },
            });

            return file;
        }),

    pdf: pdfRouter,
});

export type AppRouter = typeof appRouter;
