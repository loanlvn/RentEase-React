/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, signInWithGoogle } from "../../../features/auth/authServices";
import FullPageLoader from "../../../components/FullPageLoader";
import ReusableForm from "../../../components/ReusableForm";
import ButtonMotion from "../../../components/ButtonMotion";
import { FirebaseError } from "firebase/app";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
        await loginUser(email, password);
        navigate("/");
      } catch (err: any) {
        console.error("Login error:", err);
      
        if (err instanceof FirebaseError) {
          if (
            err.code === "auth/wrong-password" ||
            err.code === "auth/user-not-found" ||
            err.code === "auth/too-many-requests"
          ) {
            setError("Invalid email or password.");
          } else {
            setError("Something went wrong, please try again later.");
          }
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setError("Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Email",
      name: "email",
      type: "email",
      value: email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      value: password,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
      showToggle: true,
      showPassword,
      togglePasswordVisibility: () => setShowPassword(!showPassword),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {loading && <FullPageLoader />}

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10">
      
        <ReusableForm
          logoSrc="/FlatSpark-logo.png"
          title="Login"
          error={error}
          fields={fields}
          onSubmit={handleSubmit}
          submitText="Login"
          loading={loading}
          googleButton={
            <ButtonMotion
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded hover:bg-gray-50"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Login with Google
            </ButtonMotion>
          }
          appleButton={
            <ButtonMotion 
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-black/90 border border-gray-300 py-2 rounded hover:bg-black text-white"
            >
                <img src="/apple-icon.svg" alt="Apple" className="w-5 h-auto" />
                Login with Apple
            </ButtonMotion>
          }
          footer={
            <p className="text-center text-sm text-gray-600">
              Don’t have an account? {" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
          }
        />
      </div>

      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url('/register-image.jpg')` }}
      >
        <img
          src="/FS-icon.png"
          alt="FS icon"
          className="absolute bottom-4 right-4 w-10 h-10"
        />
      </div>
    </div>
  );
}