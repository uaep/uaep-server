import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as uuid from 'uuid';

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationCode(email: string) {
    const code = uuid.v1();
    const mailOptions = {
      from: `UAEP <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'UAEP Verification Code',
      text: 'Please enter this code : ' + code.substring(0, 8),
    };
    await this.transporter.sendMail(mailOptions);
    return code.substring(0, 8);
  }
}
