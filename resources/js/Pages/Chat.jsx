import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

export default function Chat({ user, auth, msg }) {
    const { data, setData, post, reset } = useForm({
        message: "",
        sender_id: auth.user.id,
        receiver_id: user.id
    });

    const [messages, setMessages] = useState(msg);
    const [isTyping, setIsTyping] = useState(false);
    const [isFriendTyping, setIsFriendTyping] = useState(false);
    const typingTimeout = useRef(null);

    useEffect(() => {
        // Listen for new messages on the private channel
        const channel = window.Echo.private(`chat-channel.${auth.user.id}`)
            .listen('MessageSentEvent', (event) => {
                setMessages((prevMessages) => [...prevMessages, event.message]);
            })
            .listenForWhisper('typing', () => {
                setIsFriendTyping(true);

                // Reset typing indicator after a short delay
                if (typingTimeout.current) clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => {
                    setIsFriendTyping(false);
                }, 1000);
            });

        // Cleanup on unmount
        return () => {
            channel.stopListening('MessageSentEvent')
                   .stopListeningForWhisper('typing');
        };
    }, [auth.user.id]);

    useEffect(() => {
        // Scroll to the bottom of the messages area
        const messagesArea = document.querySelector(".messages-area");
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (data.message.trim() !== "") {
            // Add the message to the messages state immediately
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    message: data.message,
                    sender_id: auth.user.id,
                    receiver_id: user.id
                }
            ]);

            // Send the message to the server
            post(route("chat.store", user.id), {
                onSuccess: () => {
                    reset("message"); // Clear the input field
                }
            });
        }
    };

    const sendTypingEvent = () => {
        if (!isTyping) {
            setIsTyping(true);
            window.Echo.private(`chat-channel.${user.id}`).whisper('typing', {});
        }

        if (typingTimeout.current) clearTimeout(typingTimeout.current);

        // Reset typing status after 1 second of inactivity
        typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Chat with {user.name}
                </h2>
            }
        >
            <Head title="Chat" />

            <div className="flex flex-col h-[calc(100vh-140px)] p-4">
                {/* Messages Area */}
                <div className="messages-area flex-grow overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 rounded-md shadow mb-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                message.sender_id === auth.user.id ? "justify-end" : "justify-start"
                            } mb-2`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg ${
                                    message.sender_id === auth.user.id
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                }`}
                            >
                                {message.message}
                            </div>
                        </div>
                    ))}
                    {isFriendTyping && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {user.name} is typing...
                        </p>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        type="text"
                        value={data.message}
                        onKeyDown={sendTypingEvent}
                        onChange={(e) => setData("message", e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow px-4 py-2 mr-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
                    >
                        Send
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
