import { useState, useEffect } from 'react';

export const useTypewriter = (
    text: string,
    speed: number = 50,
    delay: number = 0
) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        let currentIndex = 0;

        // Reset when text changes
        setDisplayedText('');
        setIsTyping(true);

        // Initial delay before starting to type
        timeout = setTimeout(() => {
            const typeNextCharacter = () => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.substring(0, currentIndex + 1));
                    currentIndex++;
                    timeout = setTimeout(typeNextCharacter, speed);
                } else {
                    setIsTyping(false);
                }
            };

            typeNextCharacter();
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, speed, delay]);

    return {
        displayedText,
        isTyping,
    };
};