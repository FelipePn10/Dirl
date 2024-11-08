/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';
import { createContext } from '@/trpc/trpc';
import { NextRequest } from 'next/server';

const handler = async (req: NextRequest) => {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req: req as any,
        router: appRouter,
        createContext: async () => {
            return createContext({
                req,
                // Não é necessário passar res para createContext no App Router
            });
        },
    });
};

export { handler as GET, handler as POST };