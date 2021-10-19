import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import ReminderCard from "./ReminderCard";
import BigPlusCard from "./BigPlusCard";
import { v4 } from 'uuid'
import "./reminder.css"

export default function ReminderList(props) {
    const [reminderList, setReminderList] = useState(props.reminders || [])
    useEffect(() => {
        setReminderList([...props.reminders])
    }, [props.reminders])

    // remove the reminder from the list
    const onDelete = (reminderId) => {
        const copy = reminderList.slice().filter(reminder => reminder.id !== reminderId)
        setReminderList([...copy])
    }

    const onSave = (oldReminder, newReminder) => {
        const copy = reminderList.slice()
        const instance = copy.find(reminder => reminder.id === oldReminder.id)
        // update the list instance with the latest values
        Object.assign(instance, newReminder)
        setReminderList([...copy])
    }

    const createCard = (reminder) => {
        let key = reminder.id || v4()
        return (<ReminderCard key={key} reminder={reminder} onDelete={onDelete} onSave={onSave} />)
    }

    const onAddClick = () => {
        // Make sure we don't already have a new reminder
        if (!reminderList.find(reminder => reminder.id === undefined)) {
            setReminderList(reminderList.concat({ id: undefined, value: '' }))
        }
    }

    return (
        <Box className='reminder_list'>
            {reminderList.map(
                reminder => createCard(reminder)
            )}
            <BigPlusCard onClick={onAddClick} />
        </Box>
    )
}