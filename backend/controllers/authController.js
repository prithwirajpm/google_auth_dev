const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

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

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Google Login Successful",
      token: authToken,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Google Authentication Failed",
    });
  }
};
