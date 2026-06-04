const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY
  }
});

async function sendEmail({ to, subject, html }) {
  if (!to) {
    console.error('Recipient email address is missing');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@realtyai.com',
      to,
      subject,
      html
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function sendAgentNotification(leadData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #2c3e50;">New Lead Captured</h2>
      <p>A new lead has just completed the chatbot flow.</p>
      <hr>
      <p><strong>Name:</strong> ${leadData.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
      <p><strong>Phone:</strong> ${leadData.phone}</p>
      <p><strong>Lead Type:</strong> ${leadData.type}</p>
      <p><strong>Budget:</strong> ${leadData.budget}</p>
      <p><strong>Timeline:</strong> ${leadData.timeline}</p>
      <hr>
      <p style="font-size: 0.8em; color: #7f8c8d;">This is an automated notification from RealtyAI.</p>
    </div>
  `;
  return sendEmail({
    to: process.env.AGENT_EMAIL,
    subject: `New Lead: ${leadData.name}`,
    html
  });
}

async function sendVisitorFollowUp(visitorData, agentName) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <p>Hi ${visitorData.name},</p>
      <p>It was a pleasure meeting you at the open house today! I hope you enjoyed touring the property.</p>
      <p>I wanted to follow up and see if you had any additional questions or if you'd like to schedule a private viewing of this or any other properties in the area.</p>
      <p>Since you mentioned you are looking to move within ${visitorData.timeline}, I'd love to help you find the perfect match.</p>
      <p>Best regards,</p>
      <p><strong>${agentName}</strong></p>
    </div>
  `;
  return sendEmail({
    to: visitorData.email,
    subject: `Great meeting you at the open house!`,
    html
  });
}

async function sendAgentOpenHouseNotification(visitorData) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #2c3e50;">New Open House Visitor</h2>
      <p>A new visitor has registered at your open house.</p>
      <hr>
      <p><strong>Name:</strong> ${visitorData.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${visitorData.email}">${visitorData.email}</a></p>
      <p><strong>Phone:</strong> ${visitorData.phone}</p>
      <p><strong>Current Status:</strong> ${visitorData.rentOrOwn}</p>
      <p><strong>Timeline:</strong> ${visitorData.timeline}</p>
      <hr>
      <p style="font-size: 0.8em; color: #7f8c8d;">This is an automated notification from RealtyAI.</p>
    </div>
  `;
  return sendEmail({
    to: process.env.AGENT_EMAIL,
    subject: `New Open House Visitor: ${visitorData.name}`,
    html
  });
}

module.exports = {
  sendAgentNotification,
  sendVisitorFollowUp,
  sendAgentOpenHouseNotification
};
