import { TextField } from "@mui/material"

const Password = (props) => (<TextField
    id="password"
    variant="outlined"
    label="password"
    type="password"
    spellCheck={false}
    {...props}
/>)
export default Password