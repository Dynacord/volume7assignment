const SENDGRID_KEY = ''
const SENDGRID_FROM = 'assignment@volume7.ca'

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_KEY);


// Note: inline CSS because it initially partially didn't work inside the style tag. So moved it to inline CSS.
// And then I learned that flex box is not working well in HTML emails ... Welp. Not moving the css now :D
function generateReminderHtml(i_oReminder) {
    return `
    <div style="
        padding: 5px 15px;
        border: 1px solid black;
        box-sizing: border-box;
        margin-bottom: 10px;
    ">
        ${i_oReminder.content}
    </div>
    `.trim()
}
function generateHtmlBody(i_aReminders = []) {
    return `
        <div style="
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        ">
            <div>
                <h2 style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex: 1 0 100;
                    box-sizing: border-box;
                ">
                    Hey! Don't forget these!
                </h2>
            </div>
            <div style="
                box-sizing: border-box;
            ">
                ${i_aReminders.map(generateReminderHtml).join('\n')}
            </div>
        </div>
    `.trim()
}

function prepareMail(i_sRecipient, i_aReminders) {
    const html = generateHtmlBody(i_aReminders)
    const message = {
        to: i_sRecipient,
        from: SENDGRID_FROM,
        subject: "Hey, don't forget! Here's a few reminders!",
        html
    }
    return {
        send: () => {
            sgMail.send(message, false, (err, res) => {
                if (err) throw err
            })
        }
    }
}

module.exports = { prepareMail }