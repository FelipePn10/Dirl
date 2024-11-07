import { Session, UserProfile } from "@auth0/nextjs-auth0";

export interface Context {
    session: Session | null;
    user: UserProfile | null;
}

export type CreateContextFn = () => Promise<Context>;