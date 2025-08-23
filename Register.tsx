/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, signInWithGoogle } from "../../../features/auth/authServices";
import FullPageLoader from "../../../components/FullPageLoader";
import ReusableForm from "../../../components/ReusableForm";
import ButtonMotion from "../../../components/ButtonMotion";

function isAtLeast18YearsOld(dateString: string): boolean {
  const birth = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  return age > 18 || (age === 18 && (m > 0 || (m === 0 && today.getDate() >= birth.getDate())));
}

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W).{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!firstName || !lastName || !birthDate || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    if (firstName.length < 2) {
      setError("First name must be at least 2 characters long");
      setLoading(false);
      return;
    }
    if (lastName.length < 2) {
      setError("Last name must be at least 2 characters long");
      setLoading(false);
      return;
    }
    if (!isAtLeast18YearsOld(birthDate)) {
      setError("You must be at least 18 years old");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email address");
      setLoading(false);
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 6 characters long, contain a letter, a number and a special character");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
        await registerUser(email, password, firstName, lastName, birthDate);
        navigate("/");
    
    } catch (err: any) {
        console.error("Firebase error:", err);
        if (err.code === "auth/email-already-in-use") {
            setError("This email is already registered. Please log in instead.");
        } else {
            setError("An error occurred during registration.");
        }
    }   finally {
        setLoading(false);
        }
  };

  const handleGoogle = async () => {
    try {
        await signInWithGoogle();
        navigate("/");
    } catch (err) {
        console.error("Erreur avec Google Sign-In:", err);
        setError("Connexion Google échouée.");
    }
  };

  const fields = [
    {
      label: "First Name",
      name: "firstName",
      type: "text",
      value: firstName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value),
    },
    {
      label: "Last Name",
      name: "lastName",
      type: "text",
      value: lastName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value),
    },
    {
      label: "Birth Date",
      name: "birthDate",
      type: "date",
      value: birthDate,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value),
    },
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
    {
      label: "Confirm Password",
      name: "confirmPassword",
      type: "password",
      value: confirmPassword,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value),
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
          title="Create an account"
          error={error}
          fields={fields}
          onSubmit={handleSubmit}
          submitText="Create Account"
          loading={loading}
          footer={
            <p className="text-center text-sm text-gray-600">
              Already have an account? {" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          }
        />
      </div>

      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url('/register-image.jpg')` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <ButtonMotion
              onClick={handleGoogle}
              className="px-6 py-3 bg-white/80 text-gray-700 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 hover:bg-white"
            >
              <img
                src="/google-icon.svg"
                alt="Google"
                className="w-4.5 h-auto"
              />
              Create an account with Google
            </ButtonMotion>

            <ButtonMotion className="px-6 py-3 bg-black/90 text-white rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 hover:bg-black">
              <img
                src="/apple-icon.svg"
                alt="Apple"
                className="w-4.5 h-auto"
              />
              Create an account with Apple
            </ButtonMotion>
          </div>
        </div>
        <img
          src="/FS-icon.png"
          alt="FS Logo"
          className="absolute bottom-4 right-4 w-10 h-10"
        />
      </div>
    </div>
  );
}
