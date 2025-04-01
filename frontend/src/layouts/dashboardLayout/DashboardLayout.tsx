import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Loading from '../../components/loading/Loading';
import ChatList from '../../components/chatList/ChatList';
import styles from './DashboardLayout.module.scss';
import { ChatProvider } from '../../context/ChatContext';


const DashboardLayout = () => {
    const { userId, isLoaded } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !userId) {
            navigate("/sign-in");
        }
    }, [isLoaded, userId, navigate]);

    if (!isLoaded) return <Loading />;

    return (
        <ChatProvider>
            <div className={styles.dashboardLayout}>
                <div className={styles.menu}>
                    <ChatList />
                </div>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        </ChatProvider>
    );
};

export default DashboardLayout;
