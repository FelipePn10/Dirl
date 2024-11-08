/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSession } from "@auth0/nextjs-auth0";
import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import { type NextApiRequest, type NextApiResponse } from "next";

interface CreateContextOptions {
    req: NextRequest;
}

// Função auxiliar para converter NextRequest para NextApiRequest
function convertToApiRequest(req: NextRequest): NextApiRequest {
    const apiReq = {
        ...req,
        cookies: Object.fromEntries(
            Array.from(req.cookies.getAll()).map(cookie => [cookie.name, cookie.value])
        ),
        query: Object.fromEntries(new URL(req.url).searchParams),
        body: null as any,
        headers: Object.fromEntries(req.headers),
    } as unknown as NextApiRequest;

    return apiReq;
}

// Função auxiliar para criar uma resposta compatível
function createCompatibleResponse(): NextApiResponse {
    let statusCode = 200;
    const responseHeaders = new Headers();

    const res = {
        statusCode,
        setHeader: (name: string, value: string) => {
            responseHeaders.set(name, value);
        },
        getHeader: (name: string) => responseHeaders.get(name),
        status: (code: number) => {
            statusCode = code;
            return res;
        },
        json: (body: any) => {
            return new Response(JSON.stringify(body), {
                status: statusCode,
                headers: responseHeaders
            });
        },
        end: () => { },
        send: (_body: any) => { },
        redirect: (_statusCode: number, _url: string) => { },
    } as unknown as NextApiResponse;

    return res;
}

export const createContext = async ({ req }: CreateContextOptions) => {
    // Convertemos o NextRequest para NextApiRequest
    const apiReq = convertToApiRequest(req);
    // Criamos uma resposta compatível
    const apiRes = createCompatibleResponse();

    const session = await getSession(apiReq, apiRes);

    console.log('Session in createContext:', {
        exists: !!session,
        user: session?.user ? {
            sub: session.user.sub,
            email: session.user.email
        } : null
    });

    return {
        session: session ?? null,
        user: session?.user ?? null,
    };
};

const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create();
const middleware = t.middleware;

const isAuth = middleware(async ({ ctx, next }) => {
    console.log('Auth middleware context:', {
        hasSession: !!ctx.session,
        hasUser: !!ctx.user,
        userSub: ctx.user?.sub
    });

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