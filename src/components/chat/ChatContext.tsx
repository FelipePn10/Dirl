/* eslint-disable @typescript-eslint/no-unused-vars */
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { createContext, ReactNode, useState, useContext } from "react";
import { ExtendedMessage } from "@/types/message";

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
    const [messages, setMessages] = useState<ExtendedMessage[]>([]);

    const { toast } = useToast();

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            setIsLoading(true);
            const response = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message,
                }),
            });

            if (!response.ok) {
                toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
                setIsLoading(false);
                throw new Error('Failed to send message');
            }

            // Processing the response stream to add the AI ​​message
            const reader = response.body?.getReader();
            if (reader) {
                let aiResponseText = '';
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    aiResponseText += decoder.decode(value);
                    setMessages((prev) => [
                        ...prev,
                        { id: "ai-response", text: aiResponseText, isUserMessage: false, createdAt: new Date().toISOString() }, // Convertendo `createdAt` para string
                    ]);
                }
            }
            setIsLoading(false);
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    const addMessage = () => {
        if (message.trim()) {
            const userMessage = {
                id: String(Date.now()), // Gera um ID único para cada mensagem
                text: message,
                isUserMessage: true,
                createdAt: new Date().toISOString(), // Convertendo `createdAt` para string
            };
            setMessages((prev) => [...prev, userMessage]); // Adiciona a mensagem do usuário localmente
            sendMessage({ message }); // Envia a mensagem para a API
            setMessage(''); // Limpa o campo de mensagem após o envio
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
