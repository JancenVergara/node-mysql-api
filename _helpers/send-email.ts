import appConfig from './app-config';

export default async function sendEmail({ to, subject, html, from = appConfig.emailFrom }: any) {
    if (!appConfig.sendGridApiKey) throw 'SENDGRID_API_KEY environment variable is required';
    if (!from) throw 'EMAIL_FROM environment variable is required';

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${appConfig.sendGridApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: from },
            subject,
            content: [{ type: 'text/html', value: html }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw `SendGrid email failed: ${response.status} ${errorText}`;
    }

    console.log('SendGrid email accepted', {
        to,
        from,
        subject,
        status: response.status,
        messageId: response.headers.get('x-message-id')
    });
}
