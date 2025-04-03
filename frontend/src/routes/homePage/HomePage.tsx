import { Link } from "react-router-dom";
import styles from './HomePage.module.scss';


const HomePage = () => {
    return (
        <div className={styles.homepage}>
            <div className={styles.left}>
                <h1 className={styles.title}>ROMI</h1>
                <h2>An AI-powered Agent for booking meeting rooms</h2>
                <Link to="/dashboard">Get Started</Link>
            </div>
            <div className={styles.right}>
                <img src="logo-homepage.png" alt="" />
            </div>
        </div>
    )
}

export default HomePage