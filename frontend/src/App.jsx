import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function App() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          token: credentialResponse.credential,
        }
      );

      console.log(response.data);

      alert("Login Successful!");
    } catch (error) {
      console.log(error);
      alert("Login Failed");
    }
  };

  return (
    <div>
      <h1>Google Authentication</h1>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export default App;
