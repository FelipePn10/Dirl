import { router } from "./trpc";
import { pdfRouter } from "./router/pdf";

export const appRouter = router({
    pdf: pdfRouter,
});

export type AppRouter = typeof appRouter;