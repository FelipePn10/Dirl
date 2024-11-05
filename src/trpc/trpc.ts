/* eslint-disable @typescript-eslint/no-explicit-any */
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";

// Define the context type
interface Context {
    userId?: string;
    user?: any;
}

const t = initTRPC.context<Context>().create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return opts.next({
        ctx: {
            userId: user.id,
            user,
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);