import React from 'react'
import {
    Card,
    CardContent
} from '@mui/material'
import BigPlus from '../BigPlus'
import "./reminder.css"
export default function BigPlusCard(props) {
    return (
        <div className="card_wrapper">
            <Card
                variant="outlined"
                onClick={props?.onClick}
                className='reminder_card'
            >
                <CardContent className='reminder_card_content big_plus'>
                    <BigPlus />
                </CardContent>
            </Card >
        </div>
    )
}