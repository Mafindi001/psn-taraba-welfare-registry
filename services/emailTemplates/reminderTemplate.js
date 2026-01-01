// services/emailTemplates/reminderTemplate.js
// Email template for celebration reminders

/**
 * Generate reminder email HTML
 */
const generateReminderEmail = (data) => {
  const {
    memberName,
    eventLabel,
    customLabel,
    eventDate,
    daysUntil,
    memberPhone,
    memberEmail
  } = data;

  const displayLabel = eventLabel === 'Other Celebration' && customLabel 
    ? customLabel 
    : eventLabel;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Upcoming Celebration Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 0;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🎉 Celebration Reminder
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 16px;">
                    PSN Taraba State Welfare Registry
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                    Hello! 👋
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    This is a friendly reminder about an upcoming celebration:
                  </p>

                  <!-- Event Details Card -->
                  <table role="presentation" style="width: 100%; background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <tr>
                      <td>
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="padding: 10px 0;">
                              <strong style="color: #1f2937; font-size: 14px;">Member:</strong><br>
                              <span style="color: #4b5563; font-size: 16px;">${memberName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <strong style="color: #1f2937; font-size: 14px;">Event:</strong><br>
                              <span style="color: #4b5563; font-size: 16px;">${displayLabel}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <strong style="color: #1f2937; font-size: 14px;">Date:</strong><br>
                              <span style="color: #4b5563; font-size: 16px;">${formatDate(eventDate)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <strong style="color: #1f2937; font-size: 14px;">Time Until Event:</strong><br>
                              <span style="color: #dc2626; font-size: 18px; font-weight: bold;">
                                ${daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Contact Information -->
                  ${memberPhone || memberEmail ? `
                  <p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
                    Contact Information:
                  </p>
                  <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                    ${memberPhone ? `Phone: <a href="tel:${memberPhone}" style="color: #1e40af; text-decoration: none;">${memberPhone}</a><br>` : ''}
                    ${memberEmail ? `Email: <a href="mailto:${memberEmail}" style="color: #1e40af; text-decoration: none;">${memberEmail}</a>` : ''}
                  </p>
                  ` : ''}

                  <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Please take a moment to reach out and celebrate with your colleague!
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    This is an automated reminder from PSN Taraba State Welfare System
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    Pharmaceutical Society of Nigeria - Taraba State Chapter
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Generate plain text version of reminder email
 */
const generateReminderText = (data) => {
  const {
    memberName,
    eventLabel,
    customLabel,
    eventDate,
    daysUntil
  } = data;

  const displayLabel = eventLabel === 'Other Celebration' && customLabel 
    ? customLabel 
    : eventLabel;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return `
PSN TARABA STATE WELFARE REGISTRY
Celebration Reminder

Hello!

This is a friendly reminder about an upcoming celebration:

Member: ${memberName}
Event: ${displayLabel}
Date: ${formatDate(eventDate)}
Time Until Event: ${daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}

Please take a moment to reach out and celebrate with your colleague!

---
This is an automated reminder from PSN Taraba State Welfare System
Pharmaceutical Society of Nigeria - Taraba State Chapter
  `.trim();
};

module.exports = {
  generateReminderEmail,
  generateReminderText
};