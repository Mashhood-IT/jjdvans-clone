export const otpEmailTemplate = ({ otp }) => `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Password Reset - MTL Chauffeur</title>

<style>
  body {
    margin: 0;
    padding: 20px;
    background: #0f1217;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1a1a1a;
  }

  .email-wrapper {
    max-width: 560px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #d1d5db;
  }

  /* HEADER */
  .header {
    background: #f5f6f8;
    padding: 25px 25px;
  }

  .brand-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 4px;
  }

  .header-sub {
    font-size: 13px;
    margin: 0;
  }

  /* CONTENT */
  .content {
    padding: 25px 28px;
    color: #2b2f36;
  }

  /* OTP BLOCK */
  .otp-container {
    background: #0f1217;
    border-left: 4px solid #3B82F6;
    padding: 18px;
    border-radius: 8px;
    margin: 18px 0;
    text-align: center;
  }

  .otp-label {
    color: #d0d4dd;
    font-size: 12px;
    margin-bottom: 10px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .otp-code {
    display: inline-block;
    padding: 12px 18px;
    background: #ffffff;
    color: #0f1217;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }

  .otp-expiry {
    margin-top: 10px;
    font-size: 12px;
    color: #bfc6d3;
  }

  /* FOOTER */
  .footer {
    background: #f5f6f8;
    padding: 18px;
    text-align: center;
    border-top: 1px solid #d1d5db;
  }
</style>

</head>

<body>
  <div class="email-wrapper">
    
    <div class="header">
      <h1 class="brand-title">MTL Booking App</h1>
      <p class="header-sub">Account Security Verification</p>
    </div>

    <div class="content">

      <div class="otp-container">
        <p class="otp-label">Verification Code</p>
        <div class="otp-code">${otp}</div>
        <p class="otp-expiry">Expires in <strong>2 minutes</strong></p>
      </div>

    </div>

    <div class="footer">
      © ${new Date().getFullYear()} MTL Booking App. All rights reserved.
    </div>

  </div>
</body>
</html>
`;