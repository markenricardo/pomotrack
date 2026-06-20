import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Mail, Globe, MessageCircle, Clock, User } from "lucide-react";

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
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      flexDirection: 'row',
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Left branding section with gradient */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '4rem 3rem',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Clock icon - top left */}
        <div 
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            zIndex: 2,
          }}
        >
          <Clock size={32} color="white" strokeWidth={1.5} />
        </div>

        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent)',
          borderRadius: '50%',
          top: -150,
          left: -150,
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent)',
          borderRadius: '50%',
          bottom: -100,
          right: -100,
          zIndex: 0,
        }} />

        {/* Top section */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 
            style={{
              fontSize: '2.8rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'white',
              marginTop: '3rem',
              lineHeight: '1.3',
              maxWidth: '350px',
            }}
          >
            Start your productivity journey today
          </h1>
        </div>

        {/* Bottom section with PomoTrack and catchphrase */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div 
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              fontStyle: 'italic',
              color: 'white',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            PomoTrack
          </div>
          <p 
            style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              lineHeight: '1.6',
              letterSpacing: '0.3px',
              maxWidth: '300px',
            }}
          >
            Join thousands of students mastering focus with Pomodoro. Start tracking your sessions now.
          </p>
        </div>
      </div>

      {/* Right signup form section */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem 2rem',
          position: 'relative',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Rounded card form container */}
        <div 
          style={{
            width: '100%',
            maxWidth: '420px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {/* Icon */}
            <div 
              style={{
                fontSize: '2.5rem',
                color: '#3b82f6',
                marginBottom: '1rem',
                letterSpacing: '-0.05em',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <User size={32} strokeWidth={1.5} />
            </div>
            <h2 
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Create Account
            </h2>
            <p 
              style={{
                fontSize: '0.95rem',
                color: '#6b7280',
                fontWeight: 400,
                lineHeight: '1.5',
              }}
            >
              Join PomoTrack and start tracking your study sessions
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <label 
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  backgroundColor: '#f9fafb',
                  border: '1.5px solid #e5e7eb',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  fontSize: '0.95rem',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 400,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#f0f9ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label 
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  backgroundColor: '#f9fafb',
                  border: '1.5px solid #e5e7eb',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  fontSize: '0.95rem',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 400,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#f0f9ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label 
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  backgroundColor: '#f9fafb',
                  border: '1.5px solid #e5e7eb',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  fontSize: '0.95rem',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 400,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#f0f9ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label 
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  backgroundColor: '#f9fafb',
                  border: '1.5px solid #e5e7eb',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  fontSize: '0.95rem',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 400,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#f0f9ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {error && (
              <p 
                style={{
                  borderRadius: '0.75rem',
                  backgroundColor: '#fee2e2',
                  padding: '0.875rem',
                  fontSize: '0.875rem',
                  color: '#dc2626',
                  textAlign: 'center',
                  fontWeight: 500,
                  border: '1px solid #fecaca',
                }}
              >
                {error}
              </p>
            )}

            {success && (
              <p 
                style={{
                  borderRadius: '0.75rem',
                  backgroundColor: '#dcfce7',
                  padding: '0.875rem',
                  fontSize: '0.875rem',
                  color: '#16a34a',
                  textAlign: 'center',
                  fontWeight: 500,
                  border: '1px solid #86efac',
                }}
              >
                {success}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
                fontSize: '1rem',
                color: 'white',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                outline: 'none',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '0.3px',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 10px 15px rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '1.5rem 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
            <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          </div>

          {/* Social signup buttons */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }));
              }}
              style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: '1.5px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1f2937',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <Mail size={18} />
              Email
            </button>
            <button
              type="button"
              onClick={() => console.log('Google signup clicked')}
              style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: '1.5px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1f2937',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <img src="/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
              Google
            </button>
            <button
              type="button"
              onClick={() => console.log('Facebook signup clicked')}
              style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: '1.5px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1f2937',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <img src="/facebook.svg" alt="Facebook" style={{ width: '18px', height: '18px' }} />
              Facebook
            </button>
          </div>

          {/* Sign in link */}
          <p 
            style={{ 
              fontSize: '0.95rem', 
              color: '#6b7280', 
              fontWeight: 400,
              textAlign: 'center',
            }}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                color: '#3b82f6',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;