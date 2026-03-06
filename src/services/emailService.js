import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import axios from 'axios';

class EmailService {
  constructor() {
    this.sendGridApiKey = process.env.REACT_APP_SENDGRID_API_KEY;
    this.brevoApiKey = process.env.REACT_APP_BREVO_API_KEY;
    this.mailgunApiKey = process.env.REACT_APP_MAILGUN_API_KEY;
    this.mailgunDomain = process.env.REACT_APP_MAILGUN_DOMAIN;
    this.smtpHost = process.env.REACT_APP_SMTP_HOST;
    this.smtpPort = process.env.REACT_APP_SMTP_PORT;
    this.smtpUser = process.env.REACT_APP_SMTP_USER;
    this.smtpPass = process.env.REACT_APP_SMTP_PASS;

    this.fromEmail = process.env.REACT_APP_FROM_EMAIL || 'noreply@youthentrepreneur.com';
    this.fromName = process.env.REACT_APP_FROM_NAME || 'Youth Entrepreneur Platform';
  }

  // ==================== EMAIL TEMPLATES ====================

  templates = {
    welcome: {
      subject: 'Welcome to Youth Entrepreneur Platform!',
      templateId: 'd-xxxxxxxxxxxxxxxxxxxx', // SendGrid template ID
    },
    verification: {
      subject: 'Verify Your Email Address',
      templateId: 'd-yyyyyyyyyyyyyyyyyyyy',
    },
    passwordReset: {
      subject: 'Reset Your Password',
      templateId: 'd-zzzzzzzzzzzzzzzzzzzz',
    },
    paymentSuccess: {
      subject: 'Payment Confirmation',
      templateId: 'd-aaaaaaaaaaaaaaaaaaaa',
    },
    paymentFailed: {
      subject: 'Payment Failed',
      templateId: 'd-bbbbbbbbbbbbbbbbbbbb',
    },
    subscriptionRenewal: {
      subject: 'Subscription Renewal',
      templateId: 'd-cccccccccccccccccccc',
    },
    mentorApplication: {
      subject: 'Mentor Application Received',
      templateId: 'd-dddddddddddddddddddd',
    },
    mentorApproval: {
      subject: 'Congratulations! Your Mentor Application is Approved',
      templateId: 'd-eeeeeeeeeeeeeeeeeeee',
    },
    sessionReminder: {
      subject: 'Upcoming Mentoring Session Reminder',
      templateId: 'd-ffffffffffffffffffff',
    },
    sessionFeedback: {
      subject: 'How Was Your Session?',
      templateId: 'd-gggggggggggggggggggg',
    },
    newMessage: {
      subject: 'You Have a New Message',
      templateId: 'd-hhhhhhhhhhhhhhhhhhhh',
    },
    reportGenerated: {
      subject: 'Your Report is Ready',
      templateId: 'd-iiiiiiiiiiiiiiiiiiii',
    },
    accountSuspended: {
      subject: 'Account Suspended',
      templateId: 'd-jjjjjjjjjjjjjjjjjjjj',
    },
    accountReactivated: {
      subject: 'Account Reactivated',
      templateId: 'd-kkkkkkkkkkkkkkkkkkkk',
    },
  };

  // ==================== SENDGRID INTEGRATION ====================

  async sendViaSendGrid(to, templateName, dynamicData = {}, attachments = []) {
    try {
      const template = this.templates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email: to }],
              dynamic_template_data: dynamicData,
            },
          ],
          from: { email: this.fromEmail, name: this.fromName },
          template_id: template.templateId,
          attachments: attachments.map(this.formatAttachment),
        },
        {
          headers: {
            Authorization: `Bearer ${this.sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await this.logEmail({
        to,
        template: templateName,
        provider: 'sendgrid',
        status: 'sent',
        messageId: response.headers['x-message-id'],
      });

      return { success: true, messageId: response.headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending via SendGrid:', error);
      return this.handleEmailError(error, to, templateName);
    }
  }

  // ==================== BREVO (SENDINBLUE) INTEGRATION ====================

  async sendViaBrevo(to, templateName, dynamicData = {}, attachments = []) {
    try {
      const template = this.templates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          to: [{ email: to }],
          templateId: parseInt(template.templateId.replace(/\D/g, '')),
          params: dynamicData,
          attachment: attachments.map(this.formatBrevoAttachment),
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      await this.logEmail({
        to,
        template: templateName,
        provider: 'brevo',
        status: 'sent',
        messageId: response.data.messageId,
      });

      return { success: true, messageId: response.data.messageId };
    } catch (error) {
      console.error('Error sending via Brevo:', error);
      return this.handleEmailError(error, to, templateName);
    }
  }

  // ==================== MAILGUN INTEGRATION ====================

  async sendViaMailgun(to, subject, html, attachments = []) {
    try {
      const formData = new FormData();
      formData.append('from', `${this.fromName} <${this.fromEmail}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', html);

      attachments.forEach((attachment, index) => {
        formData.append(`attachment[${index}]`, attachment);
      });

      const response = await axios.post(
        `https://api.mailgun.net/v3/${this.mailgunDomain}/messages`,
        formData,
        {
          auth: {
            username: 'api',
            password: this.mailgunApiKey,
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      await this.logEmail({
        to,
        subject,
        provider: 'mailgun',
        status: 'sent',
        messageId: response.data.id,
      });

      return { success: true, messageId: response.data.id };
    } catch (error) {
      console.error('Error sending via Mailgun:', error);
      return this.handleEmailError(error, to);
    }
  }

  // ==================== SMTP INTEGRATION ====================

  async sendViaSMTP(to, subject, html, attachments = []) {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/email/send-smtp`,
        {
          to,
          subject,
          html,
          attachments,
          from: this.fromEmail,
          fromName: this.fromName,
        },
        {
          headers: {
            Authorization: `Bearer ${await this.getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await this.logEmail({
        to,
        subject,
        provider: 'smtp',
        status: 'sent',
        messageId: response.data.messageId,
      });

      return { success: true, messageId: response.data.messageId };
    } catch (error) {
      console.error('Error sending via SMTP:', error);
      return this.handleEmailError(error, to);
    }
  }

  // ==================== HIGH-LEVEL SEND METHODS ====================

  async sendEmail(to, templateName, dynamicData = {}, options = {}) {
    try {
      // Choose provider based on configuration or fallback
      const provider = options.provider || this.getPreferredProvider();

      let result;
      switch (provider) {
        case 'sendgrid':
          result = await this.sendViaSendGrid(to, templateName, dynamicData, options.attachments);
          break;
        case 'brevo':
          result = await this.sendViaBrevo(to, templateName, dynamicData, options.attachments);
          break;
        case 'mailgun':
          const template = this.getTemplateContent(templateName, dynamicData);
          result = await this.sendViaMailgun(
            to,
            template.subject,
            template.html,
            options.attachments
          );
          break;
        default:
          result = await this.sendViaSMTP(
            to,
            this.templates[templateName].subject,
            this.generateHtml(templateName, dynamicData),
            options.attachments
          );
      }

      return result;
    } catch (error) {
      console.error('Error sending email:', error);

      // Try fallback provider
      if (options.provider) {
        console.log('Attempting fallback provider...');
        return this.sendEmail(to, templateName, dynamicData, { ...options, provider: null });
      }

      throw error;
    }
  }

  async sendBulkEmails(recipients, templateName, dynamicDataArray = [], options = {}) {
    try {
      const results = [];
      const batchSize = options.batchSize || 50;

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const batchData = dynamicDataArray.slice(i, i + batchSize);

        const promises = batch.map((recipient, index) =>
          this.sendEmail(recipient, templateName, batchData[index] || {}, options).catch(
            (error) => ({ recipient, error })
          )
        );

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        // Rate limiting
        if (i + batchSize < recipients.length) {
          await this.delay(options.delay || 1000);
        }
      }

      return {
        success: true,
        total: recipients.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => r.error).length,
        results,
      };
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      throw error;
    }
  }

  // ==================== SPECIFIC EMAIL TYPES ====================

  async sendWelcomeEmail(user) {
    return this.sendEmail(user.email, 'welcome', {
      name: user.displayName || user.email,
      loginUrl: `${process.env.REACT_APP_URL}/login`,
      dashboardUrl: `${process.env.REACT_APP_URL}/dashboard`,
    });
  }

  async sendVerificationEmail(user, verificationToken) {
    return this.sendEmail(user.email, 'verification', {
      name: user.displayName || user.email,
      verificationUrl: `${process.env.REACT_APP_URL}/verify-email?token=${verificationToken}`,
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    return this.sendEmail(user.email, 'passwordReset', {
      name: user.displayName || user.email,
      resetUrl: `${process.env.REACT_APP_URL}/reset-password?token=${resetToken}`,
      expiresIn: '1 hour',
    });
  }

  async sendPaymentSuccessEmail(user, paymentData) {
    return this.sendEmail(user.email, 'paymentSuccess', {
      name: user.displayName || user.email,
      amount: paymentService.formatAmount(paymentData.amount, paymentData.currency),
      transactionId: paymentData.transactionId,
      date: new Date().toLocaleDateString(),
      invoiceUrl: paymentData.invoiceUrl,
      dashboardUrl: `${process.env.REACT_APP_URL}/dashboard/billing`,
    });
  }

  async sendPaymentFailedEmail(user, paymentData) {
    return this.sendEmail(user.email, 'paymentFailed', {
      name: user.displayName || user.email,
      amount: paymentService.formatAmount(paymentData.amount, paymentData.currency),
      error: paymentData.error,
      retryUrl: `${process.env.REACT_APP_URL}/dashboard/billing/retry/${paymentData.id}`,
      supportUrl: `${process.env.REACT_APP_URL}/support`,
    });
  }

  async sendMentorApplicationEmail(user, applicationData) {
    return this.sendEmail(user.email, 'mentorApplication', {
      name: user.displayName || user.email,
      applicationId: applicationData.id,
      submittedAt: new Date(applicationData.submittedAt).toLocaleDateString(),
      estimatedTime: '3-5 business days',
    });
  }

  async sendMentorApprovalEmail(user, approvalData) {
    return this.sendEmail(user.email, 'mentorApproval', {
      name: user.displayName || user.email,
      dashboardUrl: `${process.env.REACT_APP_URL}/mentor/dashboard`,
      profileUrl: `${process.env.REACT_APP_URL}/mentor/profile`,
      resourcesUrl: `${process.env.REACT_APP_URL}/mentor/resources`,
    });
  }

  async sendSessionReminderEmail(user, sessionData) {
    return this.sendEmail(user.email, 'sessionReminder', {
      name: user.displayName || user.email,
      mentorName: sessionData.mentorName,
      date: new Date(sessionData.date).toLocaleDateString(),
      time: new Date(sessionData.date).toLocaleTimeString(),
      duration: sessionData.duration,
      topic: sessionData.topic,
      meetingLink: sessionData.meetingLink,
      addToCalendarUrl: this.generateCalendarLink(sessionData),
    });
  }

  async sendSessionFeedbackEmail(user, sessionData) {
    return this.sendEmail(user.email, 'sessionFeedback', {
      name: user.displayName || user.email,
      mentorName: sessionData.mentorName,
      feedbackUrl: `${process.env.REACT_APP_URL}/sessions/${sessionData.id}/feedback`,
      expiresIn: '7 days',
    });
  }

  async sendNewMessageEmail(user, messageData) {
    return this.sendEmail(user.email, 'newMessage', {
      name: user.displayName || user.email,
      senderName: messageData.senderName,
      preview: messageData.preview,
      messageUrl: `${process.env.REACT_APP_URL}/messages/${messageData.conversationId}`,
      replyUrl: `${process.env.REACT_APP_URL}/messages/${messageData.conversationId}/reply`,
    });
  }

  async sendReportEmail(user, reportData) {
    return this.sendEmail(
      user.email,
      'reportGenerated',
      {
        name: user.displayName || user.email,
        reportType: reportData.type,
        period: reportData.period,
        downloadUrl: reportData.downloadUrl,
        expiresIn: '30 days',
      },
      {
        attachments: reportData.attachments,
      }
    );
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  getTemplateContent(templateName, dynamicData) {
    const templates = {
      welcome: {
        subject: this.templates.welcome.subject,
        html: this.generateWelcomeHtml(dynamicData),
      },
      verification: {
        subject: this.templates.verification.subject,
        html: this.generateVerificationHtml(dynamicData),
      },
      passwordReset: {
        subject: this.templates.passwordReset.subject,
        html: this.generatePasswordResetHtml(dynamicData),
      },
      // Add more templates as needed
    };

    return templates[templateName] || templates.welcome;
  }

  generateWelcomeHtml(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Youth Entrepreneur Platform</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.REACT_APP_URL}/logo.png" alt="Youth Entrepreneur Platform" style="max-width: 200px;">
        </div>
        
        <h1 style="color: #4F46E5; margin-bottom: 20px;">Welcome to the Family, ${data.name}! 🚀</h1>
        
        <p style="margin-bottom: 20px;">We're thrilled to have you join our community of young entrepreneurs and innovators. Your journey to building something amazing starts now!</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #4F46E5; margin-top: 0;">What's Next?</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 15px;">✓ Complete your profile</li>
            <li style="margin-bottom: 15px;">✓ Explore mentorship opportunities</li>
            <li style="margin-bottom: 15px;">✓ Browse funding options</li>
            <li style="margin-bottom: 15px;">✓ Connect with other entrepreneurs</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${data.dashboardUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #6B7280; font-size: 14px; text-align: center;">
          Need help? Check out our <a href="${process.env.REACT_APP_URL}/help" style="color: #4F46E5;">Help Center</a> or <a href="${process.env.REACT_APP_URL}/contact" style="color: #4F46E5;">contact support</a>.
        </p>
        
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Youth Entrepreneur Platform. All rights reserved.
        </p>
      </body>
      </html>
    `;
  }

  generateVerificationHtml(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Verify Your Email Address</h1>
        
        <p>Hi ${data.name},</p>
        
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background: #F3F4F6; padding: 10px; border-radius: 5px; word-break: break-all;">${data.verificationUrl}</p>
        
        <p>This link will expire in 24 hours.</p>
        
        <p>If you didn't create an account, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #6B7280; font-size: 14px;">Best regards,<br>The Youth Entrepreneur Platform Team</p>
      </body>
      </html>
    `;
  }

  generatePasswordResetHtml(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4F46E5;">Reset Your Password</h1>
        
        <p>Hi ${data.name},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        
        <p>This link will expire in ${data.expiresIn}.</p>
        
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
        
        <p style="color: #6B7280; font-size: 14px;">Best regards,<br>The Youth Entrepreneur Platform Team</p>
      </body>
      </html>
    `;
  }

  // ==================== UTILITY METHODS ====================

  formatAttachment(attachment) {
    return {
      content: attachment.content,
      filename: attachment.filename,
      type: attachment.type,
      disposition: 'attachment',
    };
  }

  formatBrevoAttachment(attachment) {
    return {
      name: attachment.filename,
      content: attachment.content,
      type: attachment.type,
    };
  }

  generateCalendarLink(sessionData) {
    const startTime = new Date(sessionData.date).toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = new Date(new Date(sessionData.date).getTime() + sessionData.duration * 60000)
      .toISOString()
      .replace(/-|:|\.\d+/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(sessionData.topic)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(sessionData.description || '')}&location=${encodeURIComponent(sessionData.meetingLink || '')}`;
  }

  getPreferredProvider() {
    if (this.sendGridApiKey) return 'sendgrid';
    if (this.brevoApiKey) return 'brevo';
    if (this.mailgunApiKey) return 'mailgun';
    return 'smtp';
  }

  async logEmail(emailData) {
    try {
      const logRef = doc(collection(db, 'emailLogs'));
      await setDoc(logRef, {
        ...emailData,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  async getEmailLogs(filters = {}, limit = 100) {
    try {
      let q = query(collection(db, 'emailLogs'), orderBy('timestamp', 'desc'), limit(limit));

      if (filters.to) {
        q = query(q, where('to', '==', filters.to));
      }
      if (filters.template) {
        q = query(q, where('template', '==', filters.template));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      }));

      return { success: true, data: logs };
    } catch (error) {
      console.error('Error getting email logs:', error);
      throw error;
    }
  }

  handleEmailError(error, to, templateName) {
    const errorResponse = {
      success: false,
      error: 'Failed to send email',
      to,
      template: templateName,
      timestamp: new Date().toISOString(),
    };

    if (error.response) {
      errorResponse.message = error.response.data.message || error.message;
      errorResponse.statusCode = error.response.status;
    } else if (error.request) {
      errorResponse.message = 'No response from email service';
    } else {
      errorResponse.message = error.message;
    }

    // Log error
    this.logEmailError(errorResponse);

    return errorResponse;
  }

  async logEmailError(errorData) {
    try {
      const errorRef = doc(collection(db, 'emailErrors'));
      await setDoc(errorRef, {
        ...errorData,
        loggedAt: Timestamp.now(),
      });
    } catch (logError) {
      console.error('Error logging email error:', logError);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAuthToken() {
    // Implement token retrieval logic
    return 'your-auth-token';
  }
}

export const emailService = new EmailService();
