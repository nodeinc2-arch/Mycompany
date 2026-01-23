import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, service, message } = body

    // Send email using Resend
    const { error } = await resend.emails.send({
      from: "Node2 Contact <onboarding@resend.dev>",
      to: "nodeinc2@gmail.com",
      replyTo: email,
      subject: `New Contact from ${name} - ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${company || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${service}</td>
            </tr>
          </table>
          <div style="margin-top: 20px;">
            <h3 style="color: #1a1a1a; margin-bottom: 10px;">Message:</h3>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; line-height: 1.6;">${message}</p>
          </div>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">This email was sent from the Node2 website contact form.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ success: false, message: "Failed to process message" }, { status: 500 })
  }
}
