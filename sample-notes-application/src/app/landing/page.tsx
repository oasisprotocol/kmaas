"use client"

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createUser } from "/src/lib/kmaas-client";
import styles from "../styles.module.css";

export default function LandingPage() {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        setLoading('Creating account...');
        await createUser(username, password);
        setError('');
        setLoading('');
        setSuccess("Account created successfully! Please sign-in");
        setShowRegisterForm(false);
    } catch (error) {
        setError(error.message);
        setLoading('');
        setSuccess('');
    }
  };

  return (
    <div className="container">
      <h1>Welcome!</h1>
      <p>Please choose an option below:</p>

      {success && <p className="success">{success}</p>}
      {loading && <p>{loading}</p>}

      <div className="button-group">
        <button onClick={() => signIn('KMaaS', { callbackUrl: '/'}) } className="sign-in-btn">
          Sign In
        </button>

        <button onClick={() => setShowRegisterForm(!showRegisterForm)} className="register-btn">
          Create an Account
        </button>
      </div>

      {showRegisterForm && (
        <div className="register-form">
          <h2>Create an Account</h2>
          <form onSubmit={handleRegister}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit">Register</button>
          </form>
        </div>
      )}

      <style jsx>{`
        .container {
          text-align: center;
          margin-top: 50px;
        }
        .button-group {
          margin-top: 20px;
        }
        .sign-in-btn, .register-btn {
          padding: 10px 20px;
          margin: 10px;
          font-size: 18px;
          cursor: pointer;
        }
        .register-form {
          margin-top: 20px;
        }
        .register-form label {
          display: block;
          margin-top: 10px;
        }
        .register-form input {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
        }
        .error {
          color: red;
          margin-top: 10px;
        }
        .success {
          color: green;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}