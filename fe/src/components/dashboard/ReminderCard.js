import { Button, Card, CardContent, CardHeader, TextareaAutosize } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { deleteReminder, createReminder, updateReminder } from '../../engine/service'
import YesNoModal from '../YesNoModal'
import "./reminder.css"

export default function ReminderCard(props) {
    const [id, setId] = useState(props?.reminder?.id)
    const contentRef = useRef(props?.reminder?.content || '')
    const [content, setContent] = useState(props?.reminder?.content || '')
    const [shouldShowButtons, setShouldShowButtons] = useState(false)
    const [openModal, setOpenModal] = useState(false)

    useEffect(
        () => {
            setShouldShowButtons(content !== contentRef.current)
        },
        [content, contentRef]
    )

    const onSave = async () => {
        if (id) {
            const { err } = await updateReminder(id, content)
            if (!err) {
                updateCard()
            }
        } else {
            const { err, response } = await createReminder(content)
            if (!err && response) {
                let newId = response.body.id
                setId(newId)
                updateCard(newId)
            }
        }
    }

    const updateCard = (newId = id) => {
        let oldReminder = { id, content: contentRef.current }
        contentRef.current = content
        setShouldShowButtons(false)
        props?.onSave?.(oldReminder, { id: newId, content: content })
    }

    const onCancel = () => {
        setContent(contentRef.current)
    }

    const onDelete = () => {
        if (!id) { // skip confirmation modal, this is a "new" reminder
            props?.onDelete?.(id)
            return
        }
        setOpenModal(true)
    }

    const onDeleteConfirm = async () => {
        setOpenModal(false)
        if (id) {
            const { err } = await deleteReminder(id)
            if (!err) {
                props?.onDelete?.(id)
            } else {
                debugger
            }
        }

    }

    const onDeleteCancel = () => {
        setOpenModal(false)
    }

    return (
        <div className="card_wrapper">
            <YesNoModal
                open={openModal}
                onYes={onDeleteConfirm}
                onNo={onDeleteCancel}
                title='Confirmation'
                message='Are you sure you want to delete this reminder?'
            />
            <Card
                variant="outlined"
                className='reminder_card'
            >
                <CardHeader
                    className='reminder_card_header'
                    action={
                        <Button
                            sx={{ backgroundColor: '#FF0000', color: '#000000' }}
                            variant="contained"
                            onClick={onDelete}>
                            Delete
                        </Button>
                    } />
                <CardContent className='reminder_card_content'>
                    <TextareaAutosize
                        style={{
                            resize: 'none'
                        }}
                        multiline="true"
                        maxLength={140}
                        value={content}
                        onChange={(e) => setContent(e.currentTarget.value)}
                    />
                    {shouldShowButtons && <div className='button_container'>
                        <Button variant="outlined" onClick={onCancel}>Cancel</Button>
                        <Button variant="contained" onClick={onSave}>Save</Button>
                    </div>}
                </CardContent>
            </Card>
        </div>
    )
}