import styles from './Loading.module.scss'
import { Spin } from 'antd';

const Loading = () => {
    return (
        <div className={styles.spinWrapper}>
            <Spin size="large" />
        </div>
    )
}

export default Loading