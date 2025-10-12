import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set. Email sending will be disabled.")
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail(options: SendEmailOptions) {
  if (!resend) {
    console.error("Resend is not configured. Email not sent.")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || "noreply@wedding.app",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    if (error) {
      console.error("Email send error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Email send exception:", error)
    return { success: false, error: error.message }
  }
}

export interface InvitationEmailData {
  guestFirstName: string
  guestLastName: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venueName?: string
  venueCity?: string
  venueState?: string
  rsvpLink: string
  websiteUrl: string
  primaryColor: string
  secondaryColor: string
}

export function generateSaveTheDateEmail(data: InvitationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Save the Date</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Georgia, serif;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    .header {
      background-color: ${data.primaryColor};
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 42px;
      font-weight: 400;
      letter-spacing: 2px;
    }
    .header .ampersand {
      font-size: 48px;
      margin: 10px 0;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .save-date {
      font-size: 28px;
      color: ${data.primaryColor};
      margin-bottom: 20px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 30px;
    }
    .details {
      font-size: 20px;
      color: #555;
      line-height: 1.8;
      margin: 30px 0;
    }
    .details strong {
      color: #333;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background-color: ${data.primaryColor};
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-size: 16px;
      margin-top: 20px;
      transition: background-color 0.3s;
    }
    .footer {
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .divider {
      width: 100px;
      height: 2px;
      background-color: ${data.primaryColor};
      margin: 30px auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.partner1Name}</h1>
      <div class="ampersand">&</div>
      <h1>${data.partner2Name}</h1>
    </div>
    
    <div class="content">
      <div class="save-date">Save the Date</div>
      
      <div class="greeting">
        Dear ${data.guestFirstName},
      </div>
      
      <p style="font-size: 18px; color: #555; line-height: 1.6;">
        We're getting married and would love for you to be part of our special day!
      </p>
      
      <div class="divider"></div>
      
      <div class="details">
        <strong>${data.weddingDate}</strong><br>
        ${data.venueName ? `${data.venueName}<br>` : ""}
        ${data.venueCity && data.venueState ? `${data.venueCity}, ${data.venueState}` : ""}
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 16px; color: #666; line-height: 1.6;">
        Formal invitation and RSVP details to follow.
      </p>
      
      <a href="${data.websiteUrl}" class="button">Visit Our Wedding Website</a>
    </div>
    
    <div class="footer">
      <p>More details coming soon!</p>
      <p style="margin-top: 10px;">
        <a href="${data.websiteUrl}" style="color: ${data.primaryColor}; text-decoration: none;">
          ${data.websiteUrl}
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

export function generateInvitationEmail(data: InvitationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wedding Invitation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Georgia, serif;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    .header {
      background: linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 42px;
      font-weight: 400;
      letter-spacing: 2px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .header .ampersand {
      font-size: 48px;
      margin: 10px 0;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .invitation-text {
      font-size: 24px;
      color: ${data.primaryColor};
      margin-bottom: 20px;
      font-style: italic;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 30px;
    }
    .details {
      font-size: 20px;
      color: #555;
      line-height: 1.8;
      margin: 30px 0;
    }
    .details strong {
      color: #333;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      padding: 18px 50px;
      background-color: ${data.primaryColor};
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      margin-top: 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    .footer {
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .divider {
      width: 100px;
      height: 2px;
      background-color: ${data.primaryColor};
      margin: 30px auto;
    }
    .celebration {
      font-size: 40px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.partner1Name}</h1>
      <div class="ampersand">&</div>
      <h1>${data.partner2Name}</h1>
    </div>
    
    <div class="content">
      <div class="celebration">💐 ✨ 💒</div>
      
      <div class="invitation-text">
        Request the pleasure of your company
      </div>
      
      <div class="greeting">
        Dear ${data.guestFirstName} ${data.guestLastName},
      </div>
      
      <p style="font-size: 18px; color: #555; line-height: 1.6;">
        We would be honored to have you celebrate with us on our wedding day!
      </p>
      
      <div class="divider"></div>
      
      <div class="details">
        <strong>${data.weddingDate}</strong><br>
        ${data.venueName ? `${data.venueName}<br>` : ""}
        ${data.venueCity && data.venueState ? `${data.venueCity}, ${data.venueState}` : ""}
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 30px 0;">
        Please join us for an evening of celebration, dinner, and dancing.
      </p>
      
      <a href="${data.rsvpLink}" class="button">RSVP Now</a>
      
      <p style="font-size: 14px; color: #888; margin-top: 30px;">
        Visit our wedding website for travel information, accommodations, and more details.
      </p>
      
      <p style="margin-top: 15px;">
        <a href="${data.websiteUrl}" style="color: ${data.primaryColor}; text-decoration: none; font-size: 16px;">
          Visit Wedding Website →
        </a>
      </p>
    </div>
    
    <div class="footer">
      <p>We can't wait to celebrate with you!</p>
      <p style="margin-top: 15px; font-size: 12px; color: #aaa;">
        This invitation is personalized for you. Please do not share your RSVP link.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

export function generateSaveTheDateSMS(data: {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  websiteUrl: string
}): string {
  return `Save the Date! ${data.partner1Name} & ${data.partner2Name} are getting married on ${data.weddingDate}. More details: ${data.websiteUrl}`
}

export function generateInvitationSMS(data: {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  rsvpLink: string
}): string {
  return `You're invited to ${data.partner1Name} & ${data.partner2Name}'s wedding on ${data.weddingDate}! Please RSVP: ${data.rsvpLink}`
}

