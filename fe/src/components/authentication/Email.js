import React, { useState } from 'react'
import { TextField } from "@mui/material";
import { isEmail } from 'validator'

export default function Email(props) {
    const [emailIsValid, setEmailIsValid] = useState(true)

    const onEmailChange = function (e) {
        setEmailIsValid(isEmail(e.currentTarget.value))
    }

    // Add a click listener on this component while allowing the user to override it
    // without breaking the component
    const customProps = Object.assign({}, props, {
        onChange: (e) => {
            onEmailChange(e)
            props?.onChange?.(e)
        }
    })

    return (
        <TextField
            id="username"
            variant="outlined"
            label="email"
            type="email"
            spellCheck={false}
            autoFocus={true}
            error={!emailIsValid}
            helperText={!emailIsValid ? 'Please enter a valid email' : ''}
            {...customProps}
        />
    )
}