import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    try {
      const loginData = new URLSearchParams();

      loginData.append("username", formData.username);
      loginData.append("password", formData.password);

      const response = await api.post("/api/v1/auth/token", loginData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("access_token", response.data.access_token);

      console.log("Login successful:", response.data);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row', background: 'url(/loginbg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backdropFilter: 'blur(0px)' }}>
      {/* Left branding section */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, rgba(212, 232, 247, 0.4), rgba(197, 223, 240, 0.3))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(123, 159, 184, 0.15), transparent)',
          borderRadius: '50%',
          top: -100,
          left: -100,
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(107, 146, 170, 0.1), transparent)',
          borderRadius: '50%',
          bottom: -80,
          right: -80,
          zIndex: 0,
        }} />

        <div style={{ textAlign: 'center', maxWidth: '600px', position: 'relative', zIndex: 1 }}>
          <h1 
            style={{
              fontSize: '4rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #5a7fa3 0%, #7b9fb8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: '3px solid rgba(107, 146, 170, 0.6)',
              textShadow: '2px 4px 8px rgba(0, 0, 0, 0.05)',
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}
          >
            POMOTRACK
          </h1>
          <p 
            style={{
              fontSize: '1.3rem',
              fontStyle: 'italic',
              color: '#6b8fa5',
              fontWeight: 400,
              marginTop: '1.5rem',
              lineHeight: '2',
              letterSpacing: '0.5px',
            }}
          >
            "Elevate your focus, exceed<br/>your goals"
          </p>
        </div>
      </div>

      {/* Right login form section */}
      <div 
        style={{
          width: '45%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem 2.5rem',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(212, 232, 247, 0.4), rgba(197, 223, 240, 0.3))',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(77, 184, 168, 0.08), transparent)',
          borderRadius: '50%',
          top: -150,
          right: -150,
          zIndex: 0,
        }} />
        
        {/* Rounded card form container */}
        <div 
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(13, 74, 122, 0.85), rgba(10, 58, 98, 0.85))',
            borderRadius: '3rem',
            padding: '3.5rem 3.2rem',
            maxWidth: '100%',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 1,
          }}
        >
          {/* Decorative gradient overlay */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(77, 184, 168, 0.2), transparent)',
              borderRadius: '50%',
              filter: 'blur(3rem)',
            }}
          />
          {/* Additional glow effect */}
          <div 
            style={{
              position: 'absolute',
              bottom: -20,
              left: 20,
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(26, 111, 160, 0.15), transparent)',
              borderRadius: '50%',
              filter: 'blur(2.5rem)',
            }}
          />
          
          <div style={{ width: '100%', position: 'relative', zIndex: 10 }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  color: 'white',
                  marginBottom: '0.8rem',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                LOG IN
              </h2>
              <p 
                style={{
                  fontSize: '0.9rem',
                  color: '#c4d8e8',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  fontWeight: 400,
                  letterSpacing: '0.2px',
                }}
              >
                Ready to jump back in? Let's finish your next Pomodoro and<br/>stay ahead of the curve today.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Email/Phone Number"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    borderRadius: '1.3rem',
                    backgroundColor: '#d4e4f0',
                    border: '2px solid transparent',
                    paddingLeft: '2rem',
                    paddingRight: '2rem',
                    paddingTop: '1.3rem',
                    paddingBottom: '1.3rem',
                    fontSize: '1.05rem',
                    color: '#3a5a7a',
                    outline: 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    fontWeight: 600,
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 8px 25px rgba(77, 184, 168, 0.35)';
                    e.target.style.borderColor = '#4db8a8';
                    e.target.style.backgroundColor = '#e8f1f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.backgroundColor = '#d4e4f0';
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    borderRadius: '1.3rem',
                    backgroundColor: '#d4e4f0',
                    border: '2px solid transparent',
                    paddingLeft: '2rem',
                    paddingRight: '2rem',
                    paddingTop: '1.3rem',
                    paddingBottom: '1.3rem',
                    fontSize: '1.05rem',
                    color: '#3a5a7a',
                    outline: 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    fontWeight: 600,
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 8px 25px rgba(77, 184, 168, 0.35)';
                    e.target.style.borderColor = '#4db8a8';
                    e.target.style.backgroundColor = '#e8f1f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.backgroundColor = '#d4e4f0';
                  }}
                />
              </div>

              {error && (
                <p 
                  style={{
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    padding: '1.25rem',
                    fontSize: '0.9rem',
                    color: '#ff9999',
                    textAlign: 'center',
                    fontWeight: 600,
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {error}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  borderRadius: '1.3rem',
                  background: 'linear-gradient(135deg, #4db8a8 0%, #3da898 100%)',
                  border: 'none',
                  paddingTop: '1.4rem',
                  paddingBottom: '1.4rem',
                  fontSize: '1.15rem',
                  color: 'white',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 10px 25px rgba(77, 184, 168, 0.35)',
                  outline: 'none',
                  opacity: loading ? 0.7 : 1,
                  letterSpacing: '0.6px',
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div 
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.7rem',
              }}
            >
              <button 
                type="button" 
                style={{
                  color: '#a8c8e1',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c4d8e8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a8c8e1'}
              >
                Forgot Password?
              </button>
              <p style={{ fontSize: '0.95rem', color: '#c4d8e8', fontWeight: 500 }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  style={{
                    color: '#4db8a8',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#5ecab5'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4db8a8'}
                >
                  Sign Up for free
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;