import { Link, Outlet } from "react-router-dom"
import { ClerkProvider } from '@clerk/clerk-react'
import styles from './RootLayout.module.scss'
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from '../../context/ChatContext'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}


const RootLayout = () => {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <UserInfoWrapper />
        </ClerkProvider>
    );
};

const UserInfoWrapper = () => {
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            const iduser = user.primaryEmailAddress?.emailAddress;
            const username = user.fullName;

            axios.post(`${BASE_URL}/auth`, { iduser, username }, {
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json"
                }
            }).then(response => console.log(response.data))
                .catch(error => console.error("Lỗi khi gọi API:", error));
        }
    }, [user])

    return (
        <div className={styles.rootLayout}>
            <header>
                <Link to="/" className={styles.logo}>
                    <img src="/logo4.png" alt="BUKRUM Logo" />
                    <span>ROMI</span>
                    {/* {user && (
                        <>
                            <span>{user.fullName}</span>
                            <span>{user.primaryEmailAddress?.emailAddress}</span>
                        </>
                    )} */}
                </Link>
                <div className={styles.user}>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
};


export default RootLayout