from flask_mail import Message
from app import mail


def send_mail(to_email: str, name: str, otp: str, subject: str):
    msg = Message(
        subject=subject,
        sender="ansariali.developer@gmail.com",
        recipients=[to_email],
    )
    msg.html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
                border:1px solid #e5e7eb;border-radius:16px;">
      <h2 style="color:#7c3aed;margin-bottom:4px;">Eduvia</h2>
      <p style="color:#6b7280;font-size:14px;margin-top:0;">AI-Powered Study Planner</p>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;">
      <p style="color:#111827;font-size:16px;">Hi <strong>{name}</strong>,</p>
      <p style="color:#374151;font-size:14px;line-height:1.6;">{subject}</p>
      <div style="text-align:center;margin:32px 0;">
        <span style="display:inline-block;letter-spacing:10px;font-size:36px;
                     font-weight:900;color:#7c3aed;background:#f5f3ff;
                     padding:16px 28px;border-radius:12px;">{otp}</span>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;">
        This OTP is valid for <strong>10 minutes</strong>.<br>
        Do not share it with anyone.
      </p>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;">
      <p style="color:#d1d5db;font-size:11px;text-align:center;">
        © 2026 Eduvia. All rights reserved.
      </p>
    </div>
    """
    mail.send(msg)