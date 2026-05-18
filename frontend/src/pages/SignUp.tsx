import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/v1/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      console.log("Signup successful:", response.data);

      setSuccess("Account created successfully. Redirecting to login...");

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Signup failed. Username or email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'url(/loginbg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          background: 'linear-gradient(135deg, rgba(13, 74, 122, 0.85), rgba(10, 58, 98, 0.85))',
          borderRadius: '3rem',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: 'white',
            marginBottom: '0.5rem',
            fontSize: '2rem',
            fontWeight: 700,
          }}
        >
          Sign Up
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#c4d8e8',
            marginBottom: '1.2rem',
            fontSize: '0.95rem',
          }}
        >
          Create your PomoTrack account
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1.3rem 2rem',
                border: '1px solid #4db8a8',
                borderRadius: '1.3rem',
                fontSize: '1.05rem',
                backgroundColor: '#d4e4f0',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#e8f1f6';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#d4e4f0';
              }}
            />
          </div>

          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1.3rem 2rem',
                border: '1px solid #4db8a8',
                borderRadius: '1.3rem',
                fontSize: '1.05rem',
                backgroundColor: '#d4e4f0',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#e8f1f6';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#d4e4f0';
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1.3rem 2rem',
                border: '1px solid #4db8a8',
                borderRadius: '1.3rem',
                fontSize: '1.05rem',
                backgroundColor: '#d4e4f0',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#e8f1f6';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#d4e4f0';
              }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '1.3rem 2rem',
                border: '1px solid #4db8a8',
                borderRadius: '1.3rem',
                fontSize: '1.05rem',
                backgroundColor: '#d4e4f0',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#e8f1f6';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4db8a8';
                e.target.style.backgroundColor = '#d4e4f0';
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: '#d32f2f',
                backgroundColor: '#ffebee',
                padding: '0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1.4rem',
              background: loading ? '#999' : 'linear-gradient(135deg, #4db8a8 0%, #3da898 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '1.3rem',
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '0.6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 10px 25px rgba(77, 184, 168, 0.35)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(77, 184, 168, 0.6)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(77, 184, 168, 0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#c4d8e8', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4db8a8',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;