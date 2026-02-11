import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Lock, User, LogIn, Library } from 'lucide-react';

const Login = ({ setAuth }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    
    if (user === "admin" && pass === "123") {
      setAuth(true);
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'Logging into Library System...',
        showConfirmButton: false,
        timer: 1500,
        background: '#ffffff',
      });
      navigate("/dashboard");
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Incorrect username or password!',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-card shadow-2xl p-5 border-0 rounded-4" style={{ width: "420px" }}>
        
        {/* Logo Section */}
        <div className="text-center mb-4">
          <div className="logo-icon bg-primary bg-opacity-10 text-primary d-inline-flex p-3 rounded-circle mb-3">
            <Library size={40} />
          </div>
          <h2 className="fw-bold text-dark m-0">BookFlow </h2>
          <p className="text-muted small">Enter your credentials to access admin portal</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <User size={18} />
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-start-0 ps-0" 
                placeholder="admin" 
                onChange={(e) => setUser(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                className="form-control bg-light border-start-0 ps-0" 
                placeholder="••••••••" 
                onChange={(e) => setPass(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="btn btn-primary w-100 fw-bold py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm">
            <LogIn size={20} /> Sign In
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-muted extra-small">© 2026 Library Management System. All Rights Reserved.</p>
        </div>
      </div>

      <style>{`
        .login-container {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          overflow: hidden;
        }

       
        .login-container::before {
          content: "";
          position: absolute;
          width: 400px;
          height: 400px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 50%;
          top: -100px;
          right: -100px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .login-card:hover {
          transform: translateY(-5px);
        }

        .form-control {
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .form-control:focus {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .input-group-text {
          border: 1px solid #e2e8f0;
        }

        .extra-small {
          font-size: 0.75rem;
        }

        .btn-primary {
          background-color: #3b82f6;
          border: none;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background-color: #2563eb;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Login;