import nodemailer from 'nodemailer'

export interface WaitlistEmailData {
  name: string
  age: number
  mobile: string
  email: string
}

export async function sendWaitlistEmail(data: WaitlistEmailData) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const message = {
      from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
      to: process.env.WAITLIST_RECEIVER ?? 'durgeshkukreti27@gmail.com',
      subject: 'New Waitlist Submission',
      text: `Name: ${data.name}\nAge: ${data.age}\nMobile: ${data.mobile}\nEmail: ${data.email}`,
    }

    await transporter.sendMail(message)
  } catch (error) {
    console.error('Error sending waitlist email:', error)
  }
}
