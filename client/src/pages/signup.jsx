// /pages/signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import "../pages/signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => console.log("reCAPTCHA passed"),
        "expired-callback": () => console.warn("reCAPTCHA expired"),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Invalid phone number.");
      return setLoading(false);
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return setLoading(false);
    }

    try {
      generateRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, "+91" + form.phone, appVerifier);
      window.confirmationResult = confirmation;
      navigate("/verify-otp", { state: { formData: form } });
    } catch (err) {
      console.error("OTP send failed:", err);
      setError("Failed to send OTP. Try again.");
    }

    setLoading(false);
  };

  return (
  <>
    <div className="auth-background"></div>
    <div className="signup-container">
      <div className="signup-box">
        {/* rest of your signup form here */}

        <div className="logo-placeholder">⬤</div>
        <h2>Create your account</h2>
        <p>Start your Netflix journey with us.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="name-fields">
            <input type="text" name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required disabled={loading} />
            <input type="text" name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required disabled={loading} />
          </div>
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required disabled={loading} />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={loading} />
          <input type="tel" name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} required disabled={loading} />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required disabled={loading} />

          <div id="recaptcha-container"></div>

          <button type="submit" className="continue-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Continue →"}
          </button>
        </form>

        <p className="signin-link">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
    </>
  );
}
