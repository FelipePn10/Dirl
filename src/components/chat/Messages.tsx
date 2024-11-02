/* eslint-disable @typescript-eslint/no-unused-vars */
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";

interface MessagesProps {
    fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
    const { data, isLoading, fetchNextPage } = trpc.getPageFileMessages.useInfiniteQuery({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
    }, {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true
    });

    const messages = data?.pages.flatMap((page) => page.messages);

    // Define uma mensagem de carregamento para quando `isLoading` for verdadeiro
    const loadingMessage = {
        createdAt: new Date().toISOString(),
        id: "loading-message",
        isUserMessage: false,
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader2 className="h-2 w-4 animate-spin" />
            </span>
        ),
    };

    // Combine as mensagens normais com a mensagem de carregamento, se necessário
    const combinedMessages = [
        ...(messages ?? []), // Adiciona mensagens reais primeiro
        ...(isLoading ? [loadingMessage] : []), // Adiciona a mensagem de carregamento se `isLoading` for verdadeiro
    ];

    return (
        <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollbar-touch">
            {combinedMessages && combinedMessages.length > 0 ? (
                combinedMessages.map((message, i) => {
                    const isNextMessageSamePerson =
                        combinedMessages[i - 1]?.isUserMessage ===
                        combinedMessages[i]?.isUserMessage;

                    return (
                        <Message
                            message={message}
                            isNextMessageSamePerson={isNextMessageSamePerson}
                            key={message.id}
                        />
                    );
                })
            ) : isLoading ? (
                <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                    <h3 className="font-semibold text-xl">Está tudo pronto!</h3>
                    <p className="text-zinc-500 text-sm">
                        Faça sua pergunta para começar.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Messages;
