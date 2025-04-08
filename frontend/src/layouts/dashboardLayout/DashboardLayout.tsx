import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Loading from '../../components/loading/Loading';
import ChatList from '../../components/chatList/ChatList';
import styles from './DashboardLayout.module.scss';
import { ChatProvider } from '../../context/ChatContext';
import { Button, Tooltip } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';

const DashboardLayout = () => {
    const { userId, isLoaded } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (isLoaded && !userId) {
            navigate("/sign-in");
        }
    }, [isLoaded, userId, navigate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            }
            if (window.innerWidth > 768) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener('resize', handleResize);
    }, [window.innerWidth]);

    if (!isLoaded) return <Loading />;

    return (
        <ChatProvider>
            <div className={styles.dashboardLayout}>
                {isSidebarOpen ? (
                    <div className={styles.menu}>
                        <ChatList onClose={() => setIsSidebarOpen(false)} />
                    </div>
                ) : (
                    <Tooltip placement="right" title="Open Sidebar">
                        <Button
                            type="link"
                            icon={<DoubleRightOutlined />}
                            onClick={() => setIsSidebarOpen(true)}
                            className={styles.openSidebarBtn}
                        />
                    </Tooltip>
                )}
                <div className={`${styles.content} ${!isSidebarOpen ? styles.fullWidth : ''}`}>
                    <Outlet />
                </div>
            </div>
        </ChatProvider>
    );
};

export default DashboardLayout;