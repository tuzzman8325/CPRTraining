import nodemailer from 'nodemailer';
import type { Class, Registration, DiscountCode, EmailSettings } from '@shared/schema';

// Email configuration interface
export interface EmailConfig {
  user: string;
  appPassword: string;
}

// Email data interface for registration confirmations
export interface RegistrationEmailData {
  registration: Registration;
  classData: Class;
  discountCode?: DiscountCode | null;
  paymentAmount?: number; // Amount in dollars (converted from cents)
  emailSettings?: EmailSettings; // Optional email settings for dynamic configuration
}

// Email service class
export class EmailService {
  private transporter!: nodemailer.Transporter;
  private isConfigured: boolean = false;

  // HTML escaping utility for user-provided content
  private escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') return String(unsafe);
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Email address validation to prevent header injection
  private validateEmailAddress(email: string): boolean {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Check for header injection attempts
    const dangerousChars = /[\r\n\0]/;
    if (dangerousChars.test(email)) return false;
    
    // Additional security checks
    if (email.length > 254) return false; // RFC 5321 limit
    
    return true;
  }

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter(): void {
    try {
      const gmailUser = process.env.GMAIL_USER;
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailAppPassword) {
        console.warn('[EMAIL_CONFIG] Gmail credentials not found. Email service will not be available.');
        console.warn('[EMAIL_CONFIG] Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword
        }
      });

      this.isConfigured = true;
      console.log('[EMAIL_CONFIG] Email service configured successfully');
      
      // Perform startup verification
      this.verifyConnection().then((isWorking) => {
        if (!isWorking) {
          console.warn('[EMAIL_STARTUP] Email connection verification failed - emails may not be delivered');
        }
      });
    } catch (error) {
      console.error('[EMAIL_CONFIG] Failed to configure email service:', error);
      this.isConfigured = false;
    }
  }

  // Verify email configuration
  public async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('[EMAIL_VERIFY] Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('[EMAIL_VERIFY] Email connection verification failed:', error);
      return false;
    }
  }

  // Format currency for display
  private formatCurrency(amountInCents: number): string {
    return `$${(amountInCents / 100).toFixed(2)}`;
  }

  // Format date for display
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time for display
  private formatTime(timeString: string): string {
    // Assuming time is in HH:MM format, convert to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  // Generate registration confirmation email HTML
  private generateRegistrationConfirmationHTML(data: RegistrationEmailData): string {
    const { registration, classData, discountCode, paymentAmount, emailSettings } = data;
    
    // Use configurable settings with fallbacks
    const businessName = emailSettings?.businessName || 'CPR Training Center';
    const businessPhone = emailSettings?.businessPhone;
    const businessAddress = emailSettings?.businessAddress;
    const emailSignature = emailSettings?.emailSignature || 'Thank you for choosing our professional CPR training services!';
    
    const formattedDate = this.formatDate(classData.date);
    const formattedTime = this.formatTime(classData.time);
    const originalPrice = this.formatCurrency(classData.price);
    const finalAmount = paymentAmount !== undefined ? this.formatCurrency(paymentAmount) : 'Pending';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CPR Training Registration Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .ecg-line {
            font-family: monospace;
            font-size: 20px;
            color: #fecaca;
        }
        .subtitle {
            font-size: 16px;
            color: #fecaca;
            margin: 0;
        }
        .content {
            padding: 30px 20px;
        }
        .confirmation-badge {
            background-color: #dcfce7;
            color: #166534;
            padding: 12px 20px;
            border-radius: 6px;
            text-align: center;
            margin-bottom: 25px;
            font-weight: 600;
        }
        .class-details {
            background-color: #f8fafc;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #1f2937;
        }
        .payment-section {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .discount-applied {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            text-align: center;
        }
        .next-steps {
            background-color: #fef7ff;
            border-left: 4px solid #a855f7;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 6px 6px 0;
        }
        .next-steps h3 {
            margin-top: 0;
            color: #7c3aed;
        }
        .next-steps ul {
            margin: 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin-bottom: 8px;
        }
        .footer {
            background-color: #1f2937;
            color: #d1d5db;
            padding: 25px 20px;
            text-align: center;
        }
        .contact-info {
            margin-bottom: 15px;
        }
        .contact-info p {
            margin: 5px 0;
        }
        .certification-note {
            background-color: #ecfccb;
            border: 1px solid #84cc16;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
            font-weight: 500;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-value {
                margin-top: 5px;
                font-weight: 500;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="ecg-line">⎯⎯⎯╱╲⎯╱╲⎯⎯⎯</span>
                ${this.escapeHtml(businessName)}
            </div>
            <p class="subtitle">Professional CPR & First Aid Certification</p>
        </div>
        
        <div class="content">
            <div class="confirmation-badge">
                Registration Confirmed
            </div>
            
            <h2>Hello ${this.escapeHtml(registration.firstName)} ${this.escapeHtml(registration.lastName)},</h2>
            
            <p>Thank you for registering for our CPR training class! Your registration has been successfully confirmed. Below are your class details:</p>
            
            <div class="class-details">
                <h3 style="margin-top: 0; color: #dc2626;">Class Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Class:</span>
                    <span class="detail-value">${this.escapeHtml(classData.title)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${classData.type === 'BLS' ? 'Basic Life Support (BLS)' : 'Heartsaver CPR/AED'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${formattedTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${this.escapeHtml(classData.duration)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Registration ID:</span>
                    <span class="detail-value">${this.escapeHtml(registration.id)}</span>
                </div>
            </div>

            ${discountCode ? `
            <div class="discount-applied">
                <strong>Discount Applied:</strong> ${this.escapeHtml(discountCode.code)}
                ${discountCode.description ? `<br><em>${this.escapeHtml(discountCode.description)}</em>` : ''}
            </div>
            ` : ''}

            <div class="payment-section">
                <h3 style="margin-top: 0; color: #0369a1;">Payment Details</h3>
                ${classData.price !== (paymentAmount || 0) * 100 ? `
                <div class="detail-row">
                    <span class="detail-label">Original Price:</span>
                    <span class="detail-value">${originalPrice}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Amount Paid:</span>
                    <span class="detail-value"><strong>${finalAmount}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value" style="color: #059669;"><strong>${registration.status === 'confirmed' ? 'Confirmed' : 'Pending'}</strong></span>
                </div>
                ${registration.paymentIntentId ? `
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${this.escapeHtml(registration.paymentIntentId)}</span>
                </div>
                ` : ''}
            </div>

            <div class="certification-note">
                Upon successful completion, you will receive an American Heart Association (AHA) certification card valid for 2 years.
            </div>

            <div class="next-steps">
                <h3>What to Expect Next</h3>
                <ul>
                    <li><strong>Arrive 15 minutes early</strong> for check-in and setup</li>
                    <li><strong>Bring a valid photo ID</strong> for certification purposes</li>
                    <li><strong>Wear comfortable clothing</strong> that allows for movement during practice</li>
                    <li><strong>Come prepared to learn</strong> hands-on CPR and AED techniques</li>
                    <li><strong>Certification cards</strong> will be issued immediately upon successful completion</li>
                </ul>
            </div>

            <p>If you have any questions or need to make changes to your registration, please don't hesitate to contact us.</p>
            
            <p>We look forward to seeing you in class!</p>
            
            <p><strong>${this.escapeHtml(businessName)} Team</strong></p>
        </div>
        
        <div class="footer">
            <div class="contact-info">
                <p><strong>Contact Information</strong></p>
                ${businessPhone ? `<p>Phone: ${this.escapeHtml(businessPhone)}</p>` : ''}
                ${businessAddress ? `<p>Address: ${this.escapeHtml(businessAddress)}</p>` : ''}
                ${emailSettings?.replyToEmail ? `<p>Email: ${this.escapeHtml(emailSettings.replyToEmail)}</p>` : ''}
            </div>
            ${emailSignature ? `<p style="font-style: italic; margin-top: 15px;">${this.escapeHtml(emailSignature)}</p>` : ''}
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This is an automated confirmation email. Please save this email for your records.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Generate plain text version of registration confirmation
  private generateRegistrationConfirmationText(data: RegistrationEmailData): string {
    const { registration, classData, discountCode, paymentAmount, emailSettings } = data;
    
    // Use configurable settings with fallbacks
    const businessName = emailSettings?.businessName || 'CPR Training Center';
    const businessPhone = emailSettings?.businessPhone;
    const businessAddress = emailSettings?.businessAddress;
    const emailSignature = emailSettings?.emailSignature || 'Thank you for choosing our professional CPR training services!';
    
    const formattedDate = this.formatDate(classData.date);
    const formattedTime = this.formatTime(classData.time);
    const originalPrice = this.formatCurrency(classData.price);
    const finalAmount = paymentAmount !== undefined ? this.formatCurrency(paymentAmount) : 'Pending';

    return `
${businessName.toUpperCase()} - REGISTRATION CONFIRMATION

Hello ${this.escapeHtml(registration.firstName)} ${this.escapeHtml(registration.lastName)},

Thank you for registering for our CPR training class! Your registration has been successfully confirmed.

CLASS INFORMATION:
- Class: ${this.escapeHtml(classData.title)}
- Type: ${classData.type === 'BLS' ? 'Basic Life Support (BLS)' : 'Heartsaver CPR/AED'}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Duration: ${this.escapeHtml(classData.duration)}
- Registration ID: ${this.escapeHtml(registration.id)}

${discountCode ? `DISCOUNT APPLIED: ${this.escapeHtml(discountCode.code)}${discountCode.description ? ` - ${this.escapeHtml(discountCode.description)}` : ''}` : ''}

PAYMENT DETAILS:
${classData.price !== (paymentAmount || 0) * 100 ? `- Original Price: ${originalPrice}` : ''}
- Amount Paid: ${finalAmount}
- Payment Status: ${registration.status === 'confirmed' ? 'Confirmed' : 'Pending'}
${registration.paymentIntentId ? `- Payment ID: ${this.escapeHtml(registration.paymentIntentId)}` : ''}

CERTIFICATION: Upon successful completion, you will receive an American Heart Association (AHA) certification card valid for 2 years.

WHAT TO EXPECT NEXT:
- Arrive 15 minutes early for check-in and setup
- Bring a valid photo ID for certification purposes
- Wear comfortable clothing that allows for movement during practice
- Come prepared to learn hands-on CPR and AED techniques
- Certification cards will be issued immediately upon successful completion

If you have any questions or need to make changes to your registration, please contact us.

We look forward to seeing you in class!

CPR Training Pro Team

CONTACT INFORMATION:
Email: info@cprtrainingpro.com
Phone: (555) 123-4567
Website: www.cprtrainingpro.com

This is an automated confirmation email. Please save this email for your records.
    `;
  }

  // Generate custom template HTML by replacing placeholders
  private generateCustomTemplateHTML(data: RegistrationEmailData, template: string): string {
    const { registration, classData, discountCode, paymentAmount, emailSettings } = data;
    
    // Create replacement object with all available data
    const replacements: Record<string, string> = {
      'STUDENT_FIRST_NAME': this.escapeHtml(registration.firstName),
      'STUDENT_LAST_NAME': this.escapeHtml(registration.lastName),
      'STUDENT_EMAIL': this.escapeHtml(registration.email),
      'STUDENT_PHONE': this.escapeHtml(registration.phone || ''),
      'CLASS_TITLE': this.escapeHtml(classData.title),
      'CLASS_TYPE': classData.type === 'BLS' ? 'Basic Life Support (BLS)' : 'Heartsaver CPR/AED',
      'CLASS_DATE': this.formatDate(classData.date),
      'CLASS_TIME': this.formatTime(classData.time),
      'CLASS_DURATION': this.escapeHtml(classData.duration),
      'CLASS_ORIGINAL_PRICE': this.formatCurrency(classData.price),
      'PAYMENT_AMOUNT': paymentAmount !== undefined ? this.formatCurrency(paymentAmount) : 'Pending',
      'PAYMENT_STATUS': registration.status === 'confirmed' ? 'Confirmed' : 'Pending',
      'PAYMENT_ID': this.escapeHtml(registration.paymentIntentId || ''),
      'REGISTRATION_ID': this.escapeHtml(registration.id),
      'DISCOUNT_CODE': discountCode ? this.escapeHtml(discountCode.code) : '',
      'DISCOUNT_DESCRIPTION': discountCode ? this.escapeHtml(discountCode.description || '') : '',
      'BUSINESS_NAME': this.escapeHtml(emailSettings?.businessName || 'CPR Training Center'),
      'BUSINESS_PHONE': this.escapeHtml(emailSettings?.businessPhone || ''),
      'BUSINESS_ADDRESS': this.escapeHtml(emailSettings?.businessAddress || ''),
      'EMAIL_SIGNATURE': this.escapeHtml(emailSettings?.emailSignature || 'Thank you for choosing our professional CPR training services!')
    };
    
    // Replace all placeholders in the template
    let result = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  // Generate custom template text by replacing placeholders
  private generateCustomTemplateText(data: RegistrationEmailData, template: string): string {
    // Convert HTML template to plain text and then process placeholders
    const textTemplate = template
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    
    const { registration, classData, discountCode, paymentAmount, emailSettings } = data;
    
    // Create replacement object with all available data (no HTML escaping for text)
    const replacements: Record<string, string> = {
      'STUDENT_FIRST_NAME': registration.firstName,
      'STUDENT_LAST_NAME': registration.lastName,
      'STUDENT_EMAIL': registration.email,
      'STUDENT_PHONE': registration.phone || '',
      'CLASS_TITLE': classData.title,
      'CLASS_TYPE': classData.type === 'BLS' ? 'Basic Life Support (BLS)' : 'Heartsaver CPR/AED',
      'CLASS_DATE': this.formatDate(classData.date),
      'CLASS_TIME': this.formatTime(classData.time),
      'CLASS_DURATION': classData.duration,
      'CLASS_ORIGINAL_PRICE': this.formatCurrency(classData.price),
      'PAYMENT_AMOUNT': paymentAmount !== undefined ? this.formatCurrency(paymentAmount) : 'Pending',
      'PAYMENT_STATUS': registration.status === 'confirmed' ? 'Confirmed' : 'Pending',
      'PAYMENT_ID': registration.paymentIntentId || '',
      'REGISTRATION_ID': registration.id,
      'DISCOUNT_CODE': discountCode ? discountCode.code : '',
      'DISCOUNT_DESCRIPTION': discountCode ? (discountCode.description || '') : '',
      'BUSINESS_NAME': emailSettings?.businessName || 'CPR Training Center',
      'BUSINESS_PHONE': emailSettings?.businessPhone || '',
      'BUSINESS_ADDRESS': emailSettings?.businessAddress || '',
      'EMAIL_SIGNATURE': emailSettings?.emailSignature || 'Thank you for choosing our professional CPR training services!'
    };
    
    // Replace all placeholders in the template
    let result = textTemplate;
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  // Send registration confirmation email
  public async sendRegistrationConfirmation(data: RegistrationEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      console.warn('[EMAIL_CONFIG] Email service not configured - skipping email delivery');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { registration, classData, emailSettings } = data;
      
      // Validate recipient email address
      if (!this.validateEmailAddress(registration.email)) {
        console.error('[EMAIL_SECURITY] Invalid or potentially malicious email address:', registration.email);
        return { success: false, error: 'Invalid email address' };
      }
      
      // Use configurable settings with fallbacks
      const businessName = emailSettings?.businessName || 'CPR Training Center';
      const senderEmail = emailSettings?.senderEmail || process.env.GMAIL_USER!;
      const replyToEmail = emailSettings?.replyToEmail || senderEmail;
      
      const subject = `Registration Confirmed - ${classData.title} on ${this.formatDate(classData.date)}`;
      
      // Use custom template if provided, otherwise use default
      let htmlContent: string;
      let textContent: string;
      
      if (emailSettings?.confirmationEmailTemplate) {
        // Parse custom template and replace placeholders
        htmlContent = this.generateCustomTemplateHTML(data, emailSettings.confirmationEmailTemplate);
        textContent = this.generateCustomTemplateText(data, emailSettings.confirmationEmailTemplate);
      } else {
        // Use default templates
        htmlContent = this.generateRegistrationConfirmationHTML(data);
        textContent = this.generateRegistrationConfirmationText(data);
      }

      const mailOptions: any = {
        from: {
          name: businessName,
          address: senderEmail
        },
        to: registration.email,
        subject: subject,
        text: textContent,
        html: htmlContent,
        // Add headers for better email client handling
        headers: {
          'X-Mailer': `${businessName} Registration System`,
          'X-Priority': '1',
          'Importance': 'high'
        }
      };

      // Add reply-to if different from sender
      if (replyToEmail && replyToEmail !== senderEmail) {
        mailOptions.replyTo = replyToEmail;
      }

      console.log(`[EMAIL_SEND] Sending registration confirmation email to ${registration.email} for class: ${classData.title}`);
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`[EMAIL_SUCCESS] Registration confirmation email sent successfully. Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[EMAIL_ERROR] Failed to send registration confirmation email:', error);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Send class reminder email (for future use)
  public async sendClassReminder(data: RegistrationEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      console.warn('[EMAIL_CONFIG] Email service not configured - skipping reminder email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { registration, classData } = data;
      
      const subject = `Class Reminder - ${classData.title} Tomorrow`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Class Reminder</h2>
          <p>Hello ${this.escapeHtml(registration.firstName)},</p>
          <p>This is a friendly reminder that your CPR training class is scheduled for tomorrow:</p>
          <ul>
            <li><strong>Class:</strong> ${this.escapeHtml(classData.title)}</li>
            <li><strong>Date:</strong> ${this.formatDate(classData.date)}</li>
            <li><strong>Time:</strong> ${this.formatTime(classData.time)}</li>
          </ul>
          <p>Please arrive 15 minutes early and bring a valid photo ID.</p>
          <p>See you tomorrow!</p>
          <p><strong>CPR Training Pro Team</strong></p>
        </div>
      `;

      const mailOptions = {
        from: {
          name: 'CPR Training Pro',
          address: process.env.GMAIL_USER!
        },
        to: registration.email,
        subject: subject,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`[EMAIL_SUCCESS] Class reminder email sent successfully. Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[EMAIL_ERROR] Failed to send class reminder email:', error);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Test email functionality
  public async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      console.warn('[EMAIL_CONFIG] Email service not configured - cannot send test email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: {
          name: 'CPR Training Pro',
          address: process.env.GMAIL_USER!
        },
        to: to,
        subject: 'Email Service Test - CPR Training Pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Email Service Test</h2>
            <p>If you're reading this, the email service is working correctly!</p>
            <p>CPR Training Pro email system is ready to send registration confirmations.</p>
            <p><strong>CPR Training Pro Team</strong></p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`[EMAIL_SUCCESS] Test email sent successfully. Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[EMAIL_ERROR] Failed to send test email:', error);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }
}

// Create and export a singleton instance
export const emailService = new EmailService();

// Export the class for testing purposes
export default EmailService;