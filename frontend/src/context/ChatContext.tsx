import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { Modal, Input } from "antd";

export const BASE_URL = import.meta.env.MODE === "development" ? "http://127.0.0.1:5000" : "";

interface ConversationItem {
    key: string;
    label: string;
}

interface Message {
    idconversation: number;
    sender: 'user' | 'ai';
    content: string;
}

interface ChatContextType {
    conversationsItems: ConversationItem[];
    setConversationsItems: React.Dispatch<React.SetStateAction<ConversationItem[]>>;
    activeKey: string | undefined;
    setActiveKey: React.Dispatch<React.SetStateAction<string | undefined>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    isAITyping: boolean;
    setIsAITyping: React.Dispatch<React.SetStateAction<boolean>>;
    fetchConversations: () => Promise<void>;
    renameConversation: (idconversation: string, oldTitle: string) => Promise<void>;
    deleteConversation: (idconversation: string) => Promise<void>;
    handleSendMessage: (message: string) => Promise<void>;
    handleSubmit: (messageContent: string) => Promise<void>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [conversationsItems, setConversationsItems] = useState<ConversationItem[]>([]);
    const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAITyping, setIsAITyping] = useState<boolean>(false);
    const navigate = useNavigate();
    const { user } = useUser();
    const iduser = user?.primaryEmailAddress?.emailAddress;
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const renameConversation = async (idconversation: string, oldTitle: string) => {
        let tempTitle = oldTitle;

        Modal.confirm({
            title: "Rename Conversation",
            content: (
                <Input
                    defaultValue={oldTitle}
                    onChange={(e) => (tempTitle = e.target.value)}
                    onPressEnter={() => {
                        Modal.destroyAll();
                        handleRename(idconversation, tempTitle);
                    }}
                />
            ),
            okText: "Save",
            cancelText: "Cancel",
            onOk: async () => {
                await handleRename(idconversation, tempTitle);
            }
        });
    };

    const handleRename = async (idconversation: string, newTitle: string) => {
        try {
            await axios.put(`${BASE_URL}/conversation`, {
                idconversation,
                title: newTitle,
            });
            fetchConversations();
        } catch (error) {
            console.error("Error renaming conversation:", error);
        }
    };

    const deleteConversation = async (idconversation: string) => {
        Modal.confirm({
            title: "Confirm Deletion",
            content: "Are you sure you want to delete this conversation?",
            okText: "Delete",
            cancelText: "Cancel",
            okType: "danger",
            onOk: async () => {
                try {
                    await axios.delete(`${BASE_URL}/conversation`, {
                        data: { idconversation: idconversation },
                    });

                    setConversationsItems((prevConversations) => {
                        const updatedConversations = prevConversations.filter(conv => conv.key !== idconversation);

                        if (activeKey === idconversation) {
                            navigate('/dashboard');
                        } else {
                            navigate(`/dashboard/chats/${activeKey}`);
                        }
                        return updatedConversations;
                    });
                } catch (error) {
                    console.error("Error deleting conversation:", error);
                }
            }
        });
    };

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/conversation?iduser=${iduser}`, {
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                },
            });

            setConversationsItems(response.data.conversations.map((conv: any) => ({
                key: conv.idconversation.toString(),
                label: conv.title,
            })));
        } catch (error) {
            console.error('Lỗi khi lấy danh sách cuộc hội thoại:', error);
        }
    };

    useEffect(() => {
        if (iduser) {
            fetchConversations();
        }
    }, [iduser]);

    const handleSubmit = async (messageContent: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/conversation`, {
                iduser: iduser,
                first_message: messageContent
            });

            const newConversation = response.data.conversation;
            const conversationId = newConversation.idconversation.toString();

            setConversationsItems((prevConversations) => [
                { key: conversationId, label: newConversation.title },
                ...prevConversations,
            ]);

            setActiveKey(conversationId);

            await axios.post(`${BASE_URL}/messages`, {
                idconversation: conversationId,
                sender: 'user',
                content: messageContent,
            });

            navigate(`/dashboard/chats/${conversationId}`);
        } catch (error) {
            console.error('Error when creating converation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        setIsLoading(true);
        setIsAITyping(true);

        const newMessage: Message = {
            idconversation: Number(id),
            sender: 'user',
            content: message,
        };
        setMessages((prev) => [...prev, newMessage]);

        try {
            const response = await axios.post(`${BASE_URL}/messages`, {
                idconversation: id,
                content: message,
            });

            if (response.data.ai_response) {
                const aiMessage: Message = {
                    idconversation: Number(id),
                    sender: 'ai',
                    content: response.data.ai_response,
                };
                setMessages((prev) => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsAITyping(false);
            setIsLoading(false);
        }
    };

    const value: ChatContextType = {
        conversationsItems,
        setConversationsItems,
        activeKey,
        setActiveKey,
        messages,
        setMessages,
        isAITyping,
        setIsAITyping,
        fetchConversations,
        renameConversation,
        deleteConversation,
        handleSendMessage,
        handleSubmit,
        isLoading,
        setIsLoading,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};