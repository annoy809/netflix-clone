// src/pages/AuthForm.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuthForm.css';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sendingOtp, setSendingOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [isOtpModalOpen, setOtpModalOpen] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');

    useEffect(() => {
        Modal.setAppElement('#root');

        const params = new URLSearchParams(location.search);
        const oauthToken = params.get("token");
        const oauthUser = params.get("user");

        if (oauthToken && oauthUser) {
            try {
                const parsedUser = JSON.parse(decodeURIComponent(oauthUser));

                localStorage.setItem("token", oauthToken);
                localStorage.setItem("user", JSON.stringify(parsedUser));

                toast.success("Logged in via Google");

                // ✅ Fix: Wait slightly before navigating to allow localStorage + toast to apply
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 500);

            } catch (err) {
                console.error("Failed to parse Google user", err);
                toast.error("OAuth failed");
            }

            return; // ⛔ don't check existing token in this case
        }

        // Only run this if not coming from OAuth
        const token = localStorage.getItem("token");
        if (token) {
            toast.info("You're already logged in.");
            navigate('/', { replace: true });
        }
    }, [location.search]);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            username: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        });
        setOtp('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            toast.error("Email and password required");
            return;
        }

        if (isLogin) {
            const existingToken = localStorage.getItem("token");
            if (existingToken) {
                toast.info("You're already logged in.");
                return;
            }

            try {
                const res = await axios.post("http://localhost:5000/api/auth/login", {
                    email: form.email,
                    password: form.password
                });

                const token = res.data.token;
                const user = res.data.user;

                if (token && user) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("user", JSON.stringify(user));
                    toast.success("Logged in successfully!");
                    resetForm();

                    if (user.role === "admin") {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }

                } else {
                    toast.error("Unexpected response from server");
                }
            } catch (err) {
                toast.error(err.response?.data?.msg || "Login failed");
            }
        } else {
            if (!form.username || !form.phone || !form.confirmPassword) {
                toast.error("Please fill all fields");
                return;
            }

            if (form.password !== form.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }

            if (form.password.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
            }

            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(form.phone)) {
                toast.error("Invalid Indian phone number");
                return;
            }

            try {
                setSendingOtp(true);
                const res = await axios.post("http://localhost:5000/api/auth/signup", form);
                toast.success(res.data.msg);
                setOtpEmail(form.email);
                setOtpModalOpen(true);
            } catch (err) {
                toast.error(err.response?.data?.msg || "Signup failed");
            } finally {
                setSendingOtp(false);
            }
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        try {
            const res = await axios.post("http://localhost:5000/api/auth/resend-otp", {
                email: otpEmail
            });
            toast.success(res.data.msg || "OTP resent");
            setResendCooldown(30);
            const interval = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Resend failed");
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error("OTP required");

        try {
            const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
                email: otpEmail,
                otp
            });

            toast.success(res.data.msg || "OTP Verified!");
            setOtpModalOpen(false);

            const token = res.data.token;
            const user = res.data.user;

            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                toast.success("Logged in successfully!");
                resetForm();
                setTimeout(() => navigate('/'), 1000);
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || "Invalid OTP");
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5000/api/auth/google";
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                onChange={handleChange}
                                value={form.username}
                                disabled={sendingOtp}
                                required
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                                onChange={handleChange}
                                value={form.phone}
                                disabled={sendingOtp}
                                required
                            />
                        </>
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        value={form.email}
                        disabled={sendingOtp}
                        required
                    />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        value={form.password}
                        disabled={sendingOtp}
                        required
                    />
                    <p className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "🙈 Hide" : "👁 Show"} Password
                    </p>

                    {!isLogin && (
                        <>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                onChange={handleChange}
                                value={form.confirmPassword}
                                disabled={sendingOtp}
                                required
                            />
                            <p className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? "🙈 Hide" : "👁 Show"} Confirm Password
                            </p>
                        </>
                    )}

                    <button type="submit" disabled={sendingOtp}>
                        {sendingOtp ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <button className="google-btn" onClick={handleGoogleLogin}>
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google logo"
                        className="google-icon"
                    />
                    <span>Continue with Google</span>
                </button>


                <p>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Sign up" : "Login"}
                    </span>
                </p>
            </div>

            {/* OTP Modal */}
            <Modal
                isOpen={isOtpModalOpen}
                onRequestClose={() => setOtpModalOpen(false)}
                className="otp-modal"
                overlayClassName="otp-overlay"
            >
                <h2>Verify OTP</h2>
                {sendingOtp && <p className="otp-loading">Sending OTP, please wait...</p>}
                <form onSubmit={handleOtpSubmit}>
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={sendingOtp}
                    />
                    <button type="submit" disabled={sendingOtp}>
                        {sendingOtp ? "Verifying..." : "Verify"}
                    </button>
                    <p className="resend-text">
                        Didn't get the OTP?{" "}
                        <span
                            onClick={handleResendOtp}
                            className={resendCooldown > 0 ? 'disabled' : ''}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                        </span>
                    </p>
                </form>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default AuthForm;
