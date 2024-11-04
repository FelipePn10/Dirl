import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createContext, ReactNode, useState, useContext, useRef } from "react";
import { ExtendedMessage } from "@/types/message";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean,
    messages: ExtendedMessage[]
}

export const ChatContext = createContext<StreamResponse>({
    addMessage: () => { },
    message: '',
    handleInputChange: () => { },
    isLoading: false,
    messages: [],
});

interface Props {
    fileId: string;
    children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const utils = trpc.useContext();
    const [messages, setMessages] = useState<ExtendedMessage[]>([]);
    const { toast } = useToast();
    const backupMessage = useRef('')

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message,
                }),
            });

            if (!response.ok) {
                toast({ title: "Erro", description: "Falha ao enviar mensagem!", variant: "destructive" });
                throw new Error('Falha ao enviar mensagem!');
            }

            const data = response.body;
            if (!data) {
                throw new Error('Resposta vazia do servidor');
            }

            return data as ReadableStream<Uint8Array>;
        },

        onMutate: async ({ message }) => {
            backupMessage.current = message
            setMessage('');

            await utils.getPageFileMessages.cancel()

            const previousMessages = utils.getPageFileMessages.getInfiniteData()

            utils.getPageFileMessages.setInfiniteData(
                { fileId, limit: INFINITE_QUERY_LIMIT },
                (old) => {
                    if (!old) {
                        return {
                            pages: [],
                            pageParams: []
                        }
                    }

                    const newPages = [...old.pages]
                    const latestPage = newPages[0]!
                    latestPage.messages = [
                        {
                            createdAt: new Date().toISOString(),
                            id: crypto.randomUUID(),
                            text: message,
                            isUserMessage: true,
                        },
                        ...latestPage.messages
                    ]
                    newPages[0] = latestPage
                    return {
                        ...old,
                        pages: newPages,
                    }
                }
            )

            setIsLoading(true)
            return {
                previousMessages: previousMessages?.pages.flatMap((page) => page.messages) ?? []
            }
        },

        onSuccess: async (stream) => {
            setIsLoading(false)

            if (!stream) {
                return toast({
                    title: "Erro",
                    description: "Falha ao carregar as mensagens!",
                    variant: "destructive",
                })
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let done = false
            let accResponse = ''

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading

                if (value) {
                    const chunkValue = decoder.decode(value)
                    // Tentar extrair o texto da resposta do JSON, se possível
                    try {
                        const jsonResponse = JSON.parse(chunkValue);
                        if (jsonResponse.response) {
                            // Limpar formatação indesejada e normalizar quebras de linha
                            accResponse = jsonResponse.response
                                .replace(/\\n/g, '\n')
                                .replace(/\r\n/g, '\n')
                                .replace(/\\r\\n/g, '\n')
                                .trim();
                        }
                    } catch {
                        // Se não for JSON válido, apenas acumula o texto normalmente
                        accResponse += chunkValue
                            .replace(/\\n/g, '\n')
                            .replace(/\r\n/g, '\n')
                            .replace(/\\r\\n/g, '\n')
                            .trim();
                    }
                }

                utils.getPageFileMessages.setInfiniteData(
                    { fileId, limit: INFINITE_QUERY_LIMIT },
                    (old) => {
                        if (!old) return { pages: [], pageParams: [] }

                        const isAiResponseCreated = old.pages.some(
                            (page) => page.messages.some((message) => message.id === "ai-response")
                        )

                        const updatedPages = old.pages.map((page) => {
                            if (page === old.pages[0]) {
                                let updatedMessages

                                if (!isAiResponseCreated) {
                                    updatedMessages = [
                                        {
                                            createdAt: new Date().toISOString(),
                                            id: "ai-response",
                                            text: accResponse,
                                            isUserMessage: false
                                        },
                                        ...page.messages
                                    ]
                                } else {
                                    updatedMessages = page.messages.map((message) => {
                                        if (message.id === "ai-response") {
                                            return {
                                                ...message,
                                                text: accResponse
                                            }
                                        }
                                        return message
                                    })
                                }
                                return {
                                    ...page,
                                    messages: updatedMessages,
                                }
                            }
                            return page
                        })
                        return { ...old, pages: updatedPages }
                    }
                )
            }
        },

        onError: (_, __, context) => {
            setMessage(backupMessage.current)
            utils.getPageFileMessages.setData(
                { fileId },
                { messages: context?.previousMessages ?? [] }
            )
        },

        onSettled: async () => {
            setIsLoading(false);
            await utils.getPageFileMessages.invalidate({ fileId })
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    const addMessage = () => {
        if (message.trim()) {
            const userMessage = {
                id: String(Date.now()),
                text: message,
                isUserMessage: true,
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);
            sendMessage({ message });
            setMessage('');
        }
    };

    return (
        <ChatContext.Provider
            value={{
                addMessage,
                message,
                handleInputChange,
                isLoading,
                messages,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};