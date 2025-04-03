import SenderCustom from '../../components/senderCustom/SenderCustom';
import styles from './ChatPage.module.scss'
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import axios from 'axios';
import Loading from '../../components/loading/Loading';
import { useChatContext } from '../../context/ChatContext';
import { v4 as uuidv4 } from 'uuid';
import { BASE_URL } from '../../context/ChatContext'


const ChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const {
        messages,
        setMessages,
        isAITyping,
        handleSendMessage
    } = useChatContext();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            setMessages([]);
            setIsLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/messages?idconversation=${id}`);
                if (response.data.messages) {
                    setMessages(response.data.messages);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    return (
        <div className={styles.chatPage}>
            <div className={styles.wrapper} ref={wrapperRef}>
                <div className={styles.chat}>
                    {isLoading ? (
                        <div><Loading /></div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div key={uuidv4()} className={msg.sender === 'user' ? styles.message_user : styles.message_ai}>
                                    <Markdown>{msg.content}</Markdown>
                                </div>
                            ))}
                            {isAITyping && (
                                <div className={styles.message_ai}>
                                    <Loading />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className={styles.sender}>
                <SenderCustom onSubmit={handleSendMessage} />
            </div>
        </div>
    )
}

export default ChatPage



