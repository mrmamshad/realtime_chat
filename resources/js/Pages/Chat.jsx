import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function Chat({ user, auth, msg }) {
    const { data, setData, post, reset } = useForm({
        message: "",
        sender_id: auth.user.id,
        receiver_id: user.id
    });

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (data.message.trim() !== "") {
            post(route("chat.store", user.id), {
                onSuccess: () => {
                    reset("message");
                }
            });
        }
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
                <div className="flex-grow overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 rounded-md shadow mb-4">
                    {msg.map((message, index) => (
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
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        type="text"
                        value={data.message}
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
