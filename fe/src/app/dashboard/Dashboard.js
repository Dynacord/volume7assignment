import React, { useState, useEffect } from 'react'
import ReminderList from '../../components/dashboard/ReminderList'
import {
    logout,
    getUserReminders,
    getSession
} from '../../engine/service'
import {
    Link,
    Redirect
} from 'react-router-dom'
import {
    Button,
    Card, CardContent, CardHeader, CircularProgress
} from '@mui/material'
import './dashboard.css'

export default function Dashboard() {
    const [redirect, setRedirect] = useState(false)
    const [reminders, setReminders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [sessionActive, setSessionActive] = useState(null)

    useEffect(() => {
        setSessionActive(Boolean(getSession()))
    }, [])

    useEffect(() => {
        if (sessionActive) {
            const fetchData = async () => {
                const { err, response } = await getUserReminders()
                if (!err) setReminders([...response.body])
                setIsLoading(false)
            }
            fetchData()
        } else if (sessionActive === false) {
            setRedirect(true)
        }
    }, [sessionActive])

    const onLogout = async () => {
        const { err } = await logout()
        if (!err) {
            setSessionActive(false)
            setRedirect(true)
        }
    }

    return (
        <div>
            {redirect && <Redirect to="/signup" />}
            {sessionActive &&
                <Card raised={true} classes={{ root: 'dashboard' }}>
                    <CardHeader
                        classes={{ root: 'dashboard_header' }}
                        title="Reminders"
                        action={
                            <Button onClick={onLogout} variant="outlined" className='button_link'>
                                <Link to='/signup' className='link_button'>Logout</Link>
                            </Button>
                        }
                    />
                    <CardContent
                        classes={{ root: 'dashboard_content' }}
                        sx={isLoading ? { height: "100%" } : {}}
                    >
                        {
                            isLoading ?
                                <div className="dead_center">
                                    <CircularProgress />
                                </div> :
                                <ReminderList reminders={reminders} />
                        }
                    </CardContent>
                </Card>
            }

        </div>
    )
}