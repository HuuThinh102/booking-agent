import styles from './ChatList.module.scss';
import { Conversations } from '@ant-design/x';
import { Button, GetProp, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, DoubleLeftOutlined } from '@ant-design/icons'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ConversationsProps } from '@ant-design/x';
import { useChatContext } from '../../context/ChatContext'


interface ChatListProps {
    onClose: () => void;
}

const ChatList = ({ onClose }: ChatListProps) => {
    const {
        conversationsItems,
        activeKey,
        setActiveKey,
        renameConversation,
        deleteConversation,
    } = useChatContext();

    const navigate = useNavigate();

    const onAddConversation = () => {
        navigate('/dashboard');
    }

    const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (key) => {
        setActiveKey(key);
        navigate(`/dashboard/chats/${key}`);
    };

    const onCloseSidebar = () => {
        onClose();
    }

    const menuConfig: ConversationsProps['menu'] = (conversation) => ({
        items: [
            {
                label: 'Rename',
                key: 'operation1',
                icon: <EditOutlined />,
            },
            {
                label: 'Delete',
                key: 'operation2',
                icon: <DeleteOutlined />,
                danger: true,
            },
        ],
        onClick: async (menuInfo) => {
            if (menuInfo.key === 'operation1') {
                renameConversation(conversation.key, String(conversation.label));
            } else if (menuInfo.key === 'operation2') {
                await deleteConversation(conversation.key);
            }
        },
    });

    return (
        <div className={styles.menu}>
            <div className={styles.option}>
                <Tooltip placement="bottom" title="Add new conversation">
                    <Button
                        onClick={onAddConversation}
                        type="link"
                        className={styles.addBtn}
                        icon={<PlusOutlined />}
                    >
                        New Conversation
                    </Button>
                </Tooltip>
                <Tooltip placement="bottom" title="Close SideBar">
                    <Button onClick={onCloseSidebar}
                        type='link'
                        className={styles.closeSidebar}
                        icon={<DoubleLeftOutlined />}>
                    </Button>
                </Tooltip>
            </div>
            <Conversations
                items={conversationsItems}
                className={styles.conversations}
                activeKey={activeKey}
                onActiveChange={onConversationClick}
                menu={menuConfig}
            />
        </div>
    )
}

export default ChatList