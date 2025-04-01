import { SignIn } from "@clerk/clerk-react"
import styles from './SignInPage.module.scss'

const SignInPage = () => {
    return (
        <div className={styles.signin}>
            <SignIn path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
        </div>
    )
}

export default SignInPage