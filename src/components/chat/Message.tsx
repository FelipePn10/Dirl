/* eslint-disable react/display-name */
import { cn } from "@/lib/utils"
import { ExtendedMessage } from "@/types/message"
import { Icons } from "../Icons"
import ReactMarkdown from "react-markdown"
import { format } from "date-fns"
import { forwardRef, useEffect, useState } from "react"

interface MessageProps {
    message: ExtendedMessage
    isNextMessageSamePerson: boolean
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
    ({
        message,
        isNextMessageSamePerson
    }, ref) => {
        const [displayText, setDisplayText] = useState('')
        const [isTyping, setIsTyping] = useState(false)

        useEffect(() => {
            // Reset state when message changes
            setDisplayText('')

            // Only animate AI messages that are not loading states
            if (!message.isUserMessage && message.id === "ai-response" && typeof message.text === "string") {
                setIsTyping(true)
                let currentText = ''
                const fullText = message.text
                let currentIndex = 0

                // Create typing animation
                const typingInterval = setInterval(() => {
                    if (currentIndex < fullText.length) {
                        // Add next character
                        currentText += fullText[currentIndex]
                        setDisplayText(currentText)
                        currentIndex++
                    } else {
                        // Animation complete
                        setIsTyping(false)
                        clearInterval(typingInterval)
                    }
                }, 20) // Adjust speed as needed

                return () => clearInterval(typingInterval)
            } else {
                // For user messages or loading states, show text immediately
                setDisplayText(typeof message.text === "string" ? message.text : "")
                setIsTyping(false)
            }
        }, [message.text, message.isUserMessage, message.id])

        return (
            <div
                ref={ref}
                className={cn('flex items-end', {
                    "justify-end": message.isUserMessage
                })}>
                <div className={cn('relative flex h-6 w-6 aspect-square items-center justify-center', {
                    "order-2 bg-blue-600": message.isUserMessage,
                    "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
                    invisible: isNextMessageSamePerson
                })}>
                    {message.isUserMessage ? (
                        <Icons.logo className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
                    ) : (
                        <Icons.logo className="fill-zinc-30 h-3/4 w-3/4" />
                    )}
                </div>

                <div className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
                    "order-1 items-end": message.isUserMessage,
                    "order-2 items-start": !message.isUserMessage
                })}>
                    <div className={cn("px-4 py-2 rounded-lg inline-block", {
                        "bg-blue-600 text-white": message.isUserMessage,
                        "bg-gray-200 text-gray-900": !message.isUserMessage,
                        "rounded-br-none": !isNextMessageSamePerson && message.isUserMessage,
                        "rounded-bl-none": isNextMessageSamePerson && !message.isUserMessage,
                    })}>
                        {typeof displayText === "string" ? (
                            <>
                                <ReactMarkdown className={cn("prose", {
                                    "text-zinc-50": message.isUserMessage
                                })}>
                                    {displayText}
                                </ReactMarkdown>
                                {isTyping && (
                                    <span className="inline-flex ml-1 animate-pulse">▋</span>
                                )}
                            </>
                        ) : (
                            message.text
                        )}

                        {message.id !== "loading-message" && !isTyping ? (
                            <div className={cn("text-xs select-none mt-2 w-full text-right",
                                {
                                    "text-zinc-500": !message.isUserMessage,
                                    "text-blue-600": message.isUserMessage
                                }
                            )}>
                                {format(new Date(message.createdAt), "HH:mm")}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        )
    }
)

export default Message