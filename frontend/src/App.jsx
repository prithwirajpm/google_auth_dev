import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

function App() {
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    if (!captchaToken) {
      alert("Please complete the CAPTCHA");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          token: credentialResponse.credential,
          captchaToken: captchaToken,
        }
      );

      console.log(response.data);
      alert("Login Successful!");

      setCaptchaToken(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Login Failed");
      setCaptchaToken(null);
    }
  };

  return (
    <div>
      <h1>Google Authentication</h1>

      <h3>Verify CAPTCHA</h3>

      <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={(value) => setCaptchaToken(value)}
        onExpired={() => setCaptchaToken(null)}
      />

      <br />

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export default App;
