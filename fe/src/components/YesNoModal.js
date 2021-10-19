import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'

export default function YesNoModal(props) {
  return (
    <Dialog open={props.open}>
      <DialogTitle>{props?.title || ''}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {props?.message || ''}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props?.onNo}>No</Button>
        <Button onClick={props?.onYes}>Yes</Button>
      </DialogActions>
    </Dialog>
  )
}