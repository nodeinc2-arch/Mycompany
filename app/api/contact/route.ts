import { NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(200).optional().default(""),
  service: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(5000),
})

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function stripNewlines(input: string): string {
  return input.replace(/[\r\n]+/g, " ")
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set")
      return NextResponse.json({ success: false, message: "Email service is not configured" }, { status: 500 })
    }

    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
    }

    const parsed = ContactSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid form data", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }
    const { name, email, company, service, message } = parsed.data

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      company: escapeHtml(company || "Not provided"),
      service: escapeHtml(service),
      messageHtml: escapeHtml(message).replace(/\n/g, "<br />"),
    }
    const subject = stripNewlines(`New Contact from ${name} — ${service}`).slice(0, 200)

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: "Node2 Contact <onboarding@resend.dev>",
      to: "nodeinc2@gmail.com",
      replyTo: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${safe.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${safe.email}">${safe.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Company:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${safe.company}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${safe.service}</td>
            </tr>
          </table>
          <div style="margin-top: 20px;">
            <h3 style="color: #1a1a1a; margin-bottom: 10px;">Message:</h3>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; line-height: 1.6;">${safe.messageHtml}</p>
          </div>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">This email was sent from the Node2 website contact form.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
    }

    const hubspotPortalId = process.env.HUBSPOT_PORTAL_ID
    const hubspotFormId = process.env.HUBSPOT_FORM_ID
    if (hubspotPortalId && hubspotFormId) {
      const [firstname, ...rest] = name.split(/\s+/)
      const lastname = rest.join(" ") || "—"
      const referer = request.headers.get("referer") ?? ""
      try {
        const hsRes = await fetch(
          `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalId}/${hubspotFormId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fields: [
                { objectTypeId: "0-1", name: "firstname", value: firstname },
                { objectTypeId: "0-1", name: "lastname", value: lastname },
                { objectTypeId: "0-1", name: "email", value: email },
                { objectTypeId: "0-1", name: "company", value: company || "" },
                { objectTypeId: "0-1", name: "service", value: service },
                { objectTypeId: "0-1", name: "message", value: message },
              ],
              context: {
                pageUri: referer,
                pageName: "Node2 — Website Contact Form",
              },
            }),
          },
        )
        if (!hsRes.ok) {
          const body = await hsRes.text()
          console.error("HubSpot form submit failed:", hsRes.status, body)
        }
      } catch (hsErr) {
        console.error("HubSpot form submit threw:", hsErr)
      }
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ success: false, message: "Failed to process message" }, { status: 500 })
  }
}
