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
    CardHeader
} from '@mui/material';
import { Link, Redirect } from 'react-router-dom'
import { isEmail } from 'validator'
import Email from '../../components/authentication/Email';
import Password from '../../components/authentication/Password'
import './authentication.css';
import { login } from '../../engine/service';

export default function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailIsValid, setEmailIsValid] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [isFormValid, setIsFormValid] = useState(false)
    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        checkFormValid()
    }, [email, password])

    const onLogin = async () => {
        const { err } = await login(email, password)
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
                <CardHeader title="Login" />
                <CardContent classes={{ root: 'form' }}>
                    {errorMessage && <span id="error_message">{errorMessage}</span>}
                    <Email value={email} onChange={onEmailChange} />
                    <Password value={password} onChange={onPasswordChange} />
                    <Link to="/forgot" className="link">
                        forgot password ?
                    </Link>
                    <div className="buttons_container">
                        <Button id="signUp" variant="outlined" className='button_link'>
                            <Link to="/signup" className="link_button">Sign up</Link>
                        </Button>
                        <Button id="login" variant="contained" onClick={onLogin} disabled={!isFormValid}>Login</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}