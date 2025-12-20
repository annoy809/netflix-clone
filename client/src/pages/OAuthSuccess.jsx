// src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const name = urlParams.get("name");

    if (token && name) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ username: name }));

      toast.success("Logged in with Google!");

      navigate("/home", { replace: true });
    } else {
      toast.error("OAuth failed or missing token");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <p>Processing Google login...</p>;
};

export default OAuthSuccess;
