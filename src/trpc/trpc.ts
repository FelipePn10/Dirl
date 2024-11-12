import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

interface CreateContextOptions {
    req: NextRequest;
}

export const createContext = async ({ req }: CreateContextOptions) => {
    const auth = getAuth(req);
    const { userId } = auth;
    return { userId };
};

const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create();

const isAuth = t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);