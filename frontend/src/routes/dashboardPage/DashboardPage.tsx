import SenderCustom from '../../components/senderCustom/SenderCustom'
import styles from './DashboardPage.module.scss'
import { useUser } from '@clerk/clerk-react';
import { useChatContext } from '../../context/ChatContext';
import Loading from '../../components/loading/Loading';

const DashboardPage = () => {
    const { user } = useUser();
    const username = user?.fullName;
    const { handleSubmit, isLoading } = useChatContext();

    return (
        <div className={styles.dashboardPage}>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <div className={styles.logo}>
                        <h1>Hello, {username}</h1>
                    </div>
                    <div className={styles.sender}>
                        <SenderCustom onSubmit={handleSubmit} />
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;