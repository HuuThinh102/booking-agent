import { SignUp } from "@clerk/clerk-react"
import styles from './SignUpPage.module.scss'

const SignUpPage = () => {
    return (
        <div className={styles.signup}>
            <SignUp path="/sign-up" signInUrl="/sign-in" />
        </div>
    )
}

export default SignUpPage