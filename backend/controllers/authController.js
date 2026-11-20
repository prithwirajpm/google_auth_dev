const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token, captchaToken } = req.body;

    // 1. Check CAPTCHA token
    if (!captchaToken) {
      return res.status(400).json({
        message: "Please complete CAPTCHA verification",
      });
    }

    // 2. Verify CAPTCHA with Google
    const captchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        }),
      }
    );

    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
      return res.status(401).json({
        message: "CAPTCHA verification failed",
      });
    }

    // 3. Verify Google ID token
    if (!token) {
      return res.status(400).json({
        message: "Google token is required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, name, email, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(401).json({
        message: "Google email is not verified",
      });
    }

    // 4. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        profileImage: picture,
      });
    } else {
      user.googleId = sub;
      user.profileImage = picture;
      await user.save();
    }

    // 5. Generate JWT
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Google Login Successful",
      token: authToken,
      user,
    });
  } catch (error) {
    console.error("Google Login Error:", error.message);

    return res.status(500).json({
      message: "Google Authentication Failed",
    });
  }
};
