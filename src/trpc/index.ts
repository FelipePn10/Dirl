import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '@/db';
import { pdfRouter } from './router/pdf';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';

export const appRouter = router({
    authCallback: publicProcedure.query(async ({ ctx }) => {
        console.log('Starting authCallback with context:', {
            hasSession: !!ctx.session,
            hasUser: !!ctx.user,
            userDetails: ctx.user ? {
                sub: ctx.user.sub,
                email: ctx.user.email
            } : null
        });

        const { session } = ctx;
        if (!session || !session.user) {
            console.log('No session or user found in authCallback');
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        try {
            const dbUser = await db.user.findFirst({
                where: {
                    id: session.user.sub,
                },
            });

            console.log('Existing user check:', {
                searched_id: session.user.sub,
                userFound: !!dbUser
            });

            if (!dbUser) {
                console.log('Creating new user with data:', {
                    id: session.user.sub,
                    email: session.user.email
                });

                try {
                    const newUser = await db.user.create({
                        data: {
                            id: session.user.sub,
                            email: session.user.email,
                        },
                    });
                    console.log('User created successfully:', newUser);
                } catch (error) {
                    console.error('Error creating user:', error);
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to create user in database",
                        cause: error
                    });
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error in authCallback:', error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Authentication callback failed",
                cause: error
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
