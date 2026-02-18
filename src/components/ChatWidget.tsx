import { useState } from 'react';

export default function ChatWidget() {
        const [isOpen, setIsOpen] = useState(false);
        const [messages, setMessages] = useState<string[]>([]);

        const handleChatToggle = () => {
            setIsOpen((prev) => !prev);
        };
        
        return (
            <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-lg p-4">
                <button
                    type="button"
                    onClick={handleChatToggle}
                    aria-expanded={isOpen}
                    className={
                        "w-full flex items-center justify-between mb-4 p-2 rounded focus:outline-none transition-colors duration-150 " +
                        (isOpen
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-transparent hover:bg-gray-100 hover:text-gray-900")
                    }
                >
                    <h3 className="text-lg font-semibold">Chat with us!</h3>
                    <span className={isOpen ? "text-white" : "text-gray-500"}>{isOpen ? 'Close' : 'Open'}</span>
                </button>
                <h2>Chat Widget</h2>
                <p>This is a placeholder for the chat widget.</p>
            </div>
        );
}