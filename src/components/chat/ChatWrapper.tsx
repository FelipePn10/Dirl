"use client"

import { trpc } from "@/app/_trpc/client"
import ChatInput from "./ChatInput"
import Messages from "./Messages"
import { Loader2, XCircle } from "lucide-react"

interface ChatWrapperProps {
    fileId: string
}

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {




    const { data, isLoading } = trpc.getFileUploadStatus.useQuery({
        fileId,
    }, {
        refetchInterval: (data) =>
            data?.status === "SUCCESS" ||
                data?.status === "FAILED"
                ? false
                : 500
    }
    )

    if (isLoading)
        return (
            <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
                <div className="flex-1 flex justify-center items-center flex-col mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <h3 className="font-semibold text-xl">Carregando..</h3>
                        <p className="text-zinc-500 text-sm">
                            Estamos preparando seu PDF
                        </p>
                    </div>
                </div>

                <ChatInput isDisabled />
            </div>
        )

    if (data?.status === "PROCESSING") return (
        <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
            <div className="flex-1 flex justify-center items-center flex-col mb-28">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <h3 className="font-semibold text-xl">Estamos processando o seu arquivo PDF</h3>
                    <p className="text-zinc-500 text-sm">
                        Isso não costuma demorar muito.
                    </p>
                </div>
            </div>

            <ChatInput isDisabled />
        </div>
    )

    if (data?.status === "FAILED") return (
        <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
            <div className="flex-1 flex justify-center items-center flex-col mb-28">
                <div className="flex flex-col items-center gap-2">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <h3 className="font-semibold text-xl">Seu arquivo PDF é muito grande!</h3>
                    <p className="text-zinc-500 text-sm">
                        Assine o <span className="font-medium"><a href="#">plano pro</a></span> para fazer o upload desse arquivo com sucesso.
                    </p>
                </div>
            </div>

            <ChatInput isDisabled />
        </div>
    )


    return (
        <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
            <div className="flex-1 justify-between flex flex-col mb-28">
                <Messages />
            </div>

            <ChatInput />
        </div>
    )
}

export default ChatWrapper