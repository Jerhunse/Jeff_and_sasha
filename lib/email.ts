import { Resend } from "resend"
import { sendSESEmail, isSESConfigured } from "./aws"

// Email provider preference: "resend" | "ses" | "auto" (auto tries Resend first, falls back to SES)
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || "auto") as "resend" | "ses" | "auto"

if (!process.env.RESEND_API_KEY && EMAIL_PROVIDER !== "ses") {
  console.warn("RESEND_API_KEY is not set. Email sending may be disabled or will use SES if configured.")
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
  // Determine which provider to use
  const useResend = EMAIL_PROVIDER === "resend" || (EMAIL_PROVIDER === "auto" && resend)
  const useSES = EMAIL_PROVIDER === "ses" || (EMAIL_PROVIDER === "auto" && !resend && isSESConfigured())

  // Try Resend first (if configured and preferred)
  if (useResend && resend) {
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
        console.error("Resend email send error:", error)
        // Fall back to SES if Resend fails and SES is available
        if (useSES && isSESConfigured()) {
          console.log("Falling back to SES after Resend error")
          return sendSESEmail({
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            from: options.from,
            replyTo: options.replyTo ? [options.replyTo] : undefined,
          })
        }
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error("Resend email send exception:", error)
      // Fall back to SES if Resend fails and SES is available
      if (useSES && isSESConfigured()) {
        console.log("Falling back to SES after Resend exception")
        return sendSESEmail({
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          from: options.from,
          replyTo: options.replyTo ? [options.replyTo] : undefined,
        })
      }
      return { success: false, error: error.message }
    }
  }

  // Use SES if configured
  if (useSES && isSESConfigured()) {
    return sendSESEmail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      from: options.from,
      replyTo: options.replyTo ? [options.replyTo] : undefined,
    })
  }

  // No email service configured
  console.error("No email service configured. Set RESEND_API_KEY or configure AWS SES.")
  return { success: false, error: "Email service not configured" }
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

export interface RSVPConfirmationEmailData {
  guestFirstName: string
  guestLastName: string
  email: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  websiteUrl: string
  rsvpLookupUrl: string
  inviteCode?: string
  rsvpDetails: {
    status: string
    mealChoice?: string | null
    dietaryRestrictions?: string | null
    songRequest?: string | null
    busRequired?: boolean
    busRoute?: string | null
    plusOneCount?: number
    plusOneNames?: string[]
    message?: string | null
  }
  primaryColor: string
  secondaryColor: string
}

export function generateRSVPConfirmationEmail(data: RSVPConfirmationEmailData): string {
  const statusDisplay = data.rsvpDetails.status === "ATTENDING" 
    ? "✓ Joyfully Accepts" 
    : data.rsvpDetails.status === "DECLINED"
    ? "✗ Regretfully Declines"
    : "Maybe"
  
  const statusColor = data.rsvpDetails.status === "ATTENDING" ? "#10b981" : "#ef4444"
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmation</title>
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
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 400;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .confirmation-badge {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${statusColor}15;
      color: ${statusColor};
      border: 2px solid ${statusColor};
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0;
    }
    .details-section {
      margin: 30px 0;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .details-section h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: ${data.primaryColor};
      border-bottom: 2px solid ${data.primaryColor};
      padding-bottom: 8px;
    }
    .detail-row {
      margin: 12px 0;
      font-size: 16px;
      color: #555;
    }
    .detail-label {
      font-weight: 600;
      color: #333;
      display: inline-block;
      min-width: 140px;
    }
    .lookup-section {
      margin: 40px 0;
      padding: 25px;
      background: linear-gradient(135deg, ${data.primaryColor}10 0%, ${data.secondaryColor}10 100%);
      border-left: 4px solid ${data.primaryColor};
      border-radius: 8px;
    }
    .lookup-section h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: ${data.primaryColor};
    }
    .lookup-section p {
      margin: 10px 0;
      font-size: 15px;
      color: #555;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: ${data.primaryColor};
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
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
    .no-info {
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RSVP Confirmation</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Dear ${data.guestFirstName} ${data.guestLastName},
      </div>
      
      <p style="font-size: 18px; color: #555; line-height: 1.6;">
        Thank you for your RSVP! We've received your response and are so excited to celebrate with you.
      </p>
      
      <div style="text-align: center;">
        <div class="confirmation-badge">${statusDisplay}</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="details-section">
        <h3>Your RSVP Details</h3>
        
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span>${statusDisplay}</span>
        </div>
        
        ${data.rsvpDetails.mealChoice ? `
        <div class="detail-row">
          <span class="detail-label">Meal Choice:</span>
          <span>${data.rsvpDetails.mealChoice}</span>
        </div>
        ` : ''}
        
        ${data.rsvpDetails.dietaryRestrictions ? `
        <div class="detail-row">
          <span class="detail-label">Dietary Restrictions:</span>
          <span>${data.rsvpDetails.dietaryRestrictions}</span>
        </div>
        ` : ''}
        
        ${data.rsvpDetails.plusOneCount && data.rsvpDetails.plusOneCount > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Additional Guests:</span>
          <span>${data.rsvpDetails.plusOneCount} guest${data.rsvpDetails.plusOneCount > 1 ? 's' : ''}</span>
        </div>
        ${data.rsvpDetails.plusOneNames && data.rsvpDetails.plusOneNames.length > 0 ? `
        <div class="detail-row" style="margin-left: 140px; margin-top: 5px;">
          <span style="color: #777; font-size: 14px;">${data.rsvpDetails.plusOneNames.join(', ')}</span>
        </div>
        ` : ''}
        ` : ''}
        
        ${data.rsvpDetails.busRequired ? `
        <div class="detail-row">
          <span class="detail-label">Bus Transportation:</span>
          <span>Yes${data.rsvpDetails.busRoute ? ` - ${data.rsvpDetails.busRoute}` : ''}</span>
        </div>
        ` : ''}
        
        ${data.rsvpDetails.songRequest ? `
        <div class="detail-row">
          <span class="detail-label">Song Request:</span>
          <span>${data.rsvpDetails.songRequest}</span>
        </div>
        ` : ''}
        
        ${data.rsvpDetails.message ? `
        <div class="detail-row" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
          <div style="font-weight: 600; color: #333; margin-bottom: 8px;">Your Message:</div>
          <div style="color: #555; font-style: italic; line-height: 1.6;">${data.rsvpDetails.message}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="divider"></div>
      
      <div class="lookup-section">
        <h3>📋 Need to Update Your RSVP?</h3>
        <p>
          You can view or update your RSVP at any time by visiting:
        </p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${data.rsvpLookupUrl}" class="button">View/Update My RSVP</a>
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 15px;">
          ${data.inviteCode ? `Or use your invite code: <strong>${data.inviteCode}</strong>` : 'You can also look up your RSVP using your email address on the wedding website.'}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.websiteUrl}" style="color: ${data.primaryColor}; text-decoration: none; font-size: 16px; font-weight: 600;">
          Visit Wedding Website →
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>${data.partner1Name} & ${data.partner2Name}</strong></p>
      <p style="margin-top: 10px;">${data.weddingDate}</p>
      <p style="margin-top: 15px; font-size: 12px; color: #aaa;">
        If you need to make changes to your RSVP, please use the link above or contact us directly.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

