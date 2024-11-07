
import { getSession } from "@auth0/nextjs-auth0";
import { initTRPC, TRPCError } from "@trpc/server";
import { Context, CreateContextFn } from "../types/trpc";

export const createContext: CreateContextFn = async () => {
    const session = await getSession();
    return {
        session: session ?? null,
        user: session?.user ?? null,
    };
};

const t = initTRPC.context<Context>().create();
const middleware = t.middleware;

const isAuth = middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next({
        ctx: {
            ...ctx,
            userId: ctx.user.sub,
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);