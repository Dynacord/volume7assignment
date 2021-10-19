/**
 * Note a Francis:
 * 
 * J'aurais pu opter pour utiliser seulement un component pour le login et le sign up,
 * mais puisque la majorité du temps on entre des informations additionnelles dans un sign up,
 * j'ai opter pour 2 components
 * 
 */


import React, { useState, useEffect } from 'react'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
} from '@mui/material';
import { Link, Redirect } from 'react-router-dom'
import { isEmail } from 'validator'
import Email from '../../components/authentication/Email';
import Password from '../../components/authentication/Password';
import './authentication.css';
import { signup } from '../../engine/service'

export default function SignUpForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailIsValid, setEmailIsValid] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [isFormValid, setIsFormValid] = useState(false)
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        checkFormValid()
    }, [email, password])

    const onSignUp = async () => {
        const { err } = await signup(email, password)
        if (!err) {
            setRedirect(true)
        } else {
            setErrorMessage(err.message)
        }
    }

    const onEmailChange = (e) => {
        setEmail(e.currentTarget.value)
        setEmailIsValid(isEmail(e.currentTarget.value))
        clearErrorMessage()
    }

    const onPasswordChange = (e) => {
        setPassword(e.currentTarget.value)
        clearErrorMessage()
    }

    const checkFormValid = () => {
        setIsFormValid(Boolean(email && emailIsValid && password))
    }

    const clearErrorMessage = () => setErrorMessage("")

    return (
        <div>
            {redirect && <Redirect to="/dashboard" />}
            <Card raised={true}>
                <CardHeader title="Sign up" />
                <CardContent classes={{ root: 'form' }}>
                    {errorMessage && <span id="error_message">{errorMessage}</span>}
                    <Email onChange={onEmailChange} value={email} />
                    <Password onChange={onPasswordChange} value={password} />
                    <div className="buttons_container_signup">
                        <Link to="/login" className="link">already have an account ? </Link>
                        <Button id="login" variant="contained" onClick={onSignUp} disabled={!isFormValid}>Sign up</Button>
                    </div>
                </CardContent>
            </Card >
        </div>
    );
}