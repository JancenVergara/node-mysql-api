import nodemailer from 'nodemailer';
import appConfig from './app-config';

export default async function sendEmail({ to, subject, html, from = appConfig.emailFrom }: any) {
    if (appConfig.emailDelivery === 'log') {
        console.log('Email delivery is set to log mode.');
        console.log({ from, to, subject, html });
        return;
    }

    const transporter = nodemailer.createTransport(appConfig.smtpOptions);
    await transporter.sendMail({ from, to, subject, html});
}
