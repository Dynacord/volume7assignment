import {
    Button,
    Card,
    CardContent,
    CardHeader
} from '@mui/material'
import React, { useState } from 'react'
import Email from '../../components/authentication/Email'
import { isEmail } from 'validator'
import { Link } from 'react-router-dom'
import './authentication.css';

export default function ForgotForm() {
    const [email, setEmail] = useState("")
    const [isFormValid, setIsFormValid] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const onSubmit = async (e) => {
        setErrorMessage("Not yet implemented")
    }

    const onEmailChanged = (e) => {
        setEmail(e.currentTarget.value)
        setIsFormValid(isEmail(e.currentTarget.value))
    }

    return (
        <Card raised={true}>
            <CardHeader title="Forgot password" />
            <CardContent classes={{ root: 'form' }}>
                {errorMessage && <span id="error_message">{errorMessage}</span>}
                {successMessage && <span id="success_message">{successMessage}</span>}
                <Email value={email} onChange={onEmailChanged} />
                <div className="buttons_container_signup">
                    <Button variant="outlined" className='button_link'>
                        <Link to="/login" className='link_button'>Back</Link>
                    </Button>
                    <Button
                        onClick={onSubmit}
                        variant="contained"
                        disabled={!isFormValid}
                    >Submit</Button>
                </div>
            </CardContent>
        </Card >
    )
}