import nodemailer from 'nodemailer';
import type { Class, Registration, DiscountCode } from '@shared/schema';

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
}

// Email service class
export class EmailService {
  private transporter!: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter(): void {
    try {
      const gmailUser = process.env.GMAIL_USER;
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailAppPassword) {
        console.warn('Gmail credentials not found. Email service will not be available.');
        console.warn('Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.isConfigured = true;
      console.log('Email service configured successfully');
    } catch (error) {
      console.error('Failed to configure email service:', error);
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
      console.log('Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error);
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
    const { registration, classData, discountCode, paymentAmount } = data;
    
    const formattedDate = this.formatDate(classData.date);
    const formattedTime = this.formatTime(classData.time);
    const originalPrice = this.formatCurrency(classData.price);
    const finalAmount = paymentAmount !== undefined ? this.formatCurrency(paymentAmount * 100) : originalPrice;
    
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
                CPR Training Pro
            </div>
            <p class="subtitle">Professional CPR & First Aid Certification</p>
        </div>
        
        <div class="content">
            <div class="confirmation-badge">
                ✓ Registration Confirmed
            </div>
            
            <h2>Hello ${registration.firstName} ${registration.lastName},</h2>
            
            <p>Thank you for registering for our CPR training class! Your registration has been successfully confirmed. Below are your class details:</p>
            
            <div class="class-details">
                <h3 style="margin-top: 0; color: #dc2626;">Class Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Class:</span>
                    <span class="detail-value">${classData.title}</span>
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
                    <span class="detail-value">${classData.duration}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Registration ID:</span>
                    <span class="detail-value">${registration.id}</span>
                </div>
            </div>

            ${discountCode ? `
            <div class="discount-applied">
                <strong>Discount Applied:</strong> ${discountCode.code}
                ${discountCode.description ? `<br><em>${discountCode.description}</em>` : ''}
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
                    <span class="detail-value">${registration.paymentIntentId}</span>
                </div>
                ` : ''}
            </div>

            <div class="certification-note">
                🏆 Upon successful completion, you will receive an American Heart Association (AHA) certification card valid for 2 years.
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
            
            <p><strong>CPR Training Pro Team</strong></p>
        </div>
        
        <div class="footer">
            <div class="contact-info">
                <p><strong>Contact Information</strong></p>
                <p>Email: info@cprtrainingpro.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Website: www.cprtrainingpro.com</p>
            </div>
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
    const { registration, classData, discountCode, paymentAmount } = data;
    
    const formattedDate = this.formatDate(classData.date);
    const formattedTime = this.formatTime(classData.time);
    const originalPrice = this.formatCurrency(classData.price);
    const finalAmount = paymentAmount !== undefined ? this.formatCurrency(paymentAmount * 100) : originalPrice;

    return `
CPR TRAINING PRO - REGISTRATION CONFIRMATION

Hello ${registration.firstName} ${registration.lastName},

Thank you for registering for our CPR training class! Your registration has been successfully confirmed.

CLASS INFORMATION:
- Class: ${classData.title}
- Type: ${classData.type === 'BLS' ? 'Basic Life Support (BLS)' : 'Heartsaver CPR/AED'}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Duration: ${classData.duration}
- Registration ID: ${registration.id}

${discountCode ? `DISCOUNT APPLIED: ${discountCode.code}${discountCode.description ? ` - ${discountCode.description}` : ''}` : ''}

PAYMENT DETAILS:
${classData.price !== (paymentAmount || 0) * 100 ? `- Original Price: ${originalPrice}` : ''}
- Amount Paid: ${finalAmount}
- Payment Status: ${registration.status === 'confirmed' ? 'Confirmed' : 'Pending'}
${registration.paymentIntentId ? `- Payment ID: ${registration.paymentIntentId}` : ''}

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

  // Send registration confirmation email
  public async sendRegistrationConfirmation(data: RegistrationEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      const error = 'Email service is not configured. Please check Gmail credentials.';
      console.error(error);
      return { success: false, error };
    }

    try {
      const { registration, classData } = data;
      
      const subject = `Registration Confirmed - ${classData.title} on ${this.formatDate(classData.date)}`;
      const htmlContent = this.generateRegistrationConfirmationHTML(data);
      const textContent = this.generateRegistrationConfirmationText(data);

      const mailOptions = {
        from: {
          name: 'CPR Training Pro',
          address: process.env.GMAIL_USER!
        },
        to: registration.email,
        subject: subject,
        text: textContent,
        html: htmlContent,
        // Add headers for better email client handling
        headers: {
          'X-Mailer': 'CPR Training Pro Registration System',
          'X-Priority': '1',
          'Importance': 'high'
        }
      };

      console.log(`Sending registration confirmation email to ${registration.email} for class: ${classData.title}`);
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`Registration confirmation email sent successfully. Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to send registration confirmation email:', error);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Send class reminder email (for future use)
  public async sendClassReminder(data: RegistrationEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      const error = 'Email service is not configured. Please check Gmail credentials.';
      console.error(error);
      return { success: false, error };
    }

    try {
      const { registration, classData } = data;
      
      const subject = `Class Reminder - ${classData.title} Tomorrow`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Class Reminder</h2>
          <p>Hello ${registration.firstName},</p>
          <p>This is a friendly reminder that your CPR training class is scheduled for tomorrow:</p>
          <ul>
            <li><strong>Class:</strong> ${classData.title}</li>
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
      
      console.log(`Class reminder email sent successfully. Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to send class reminder email:', error);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Test email functionality
  public async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      const error = 'Email service is not configured. Please check Gmail credentials.';
      console.error(error);
      return { success: false, error };
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
      
      console.log(`Test email sent successfully. Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to send test email:', error);
      
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