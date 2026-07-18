import "./Login.css";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>

        <div className="badge">
          USIU-AFRICA STUDENTS ONLY
        </div>

        <h1 className="title">
          Pass the torch, not the guesswork.
        </h1>

        <p className="subtitle">
          Sign in to hand over or receive a leadership role.
        </p>

        <label htmlFor="email">
          USIU-EMAIL
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">
          PASSWORD
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Sign in
        </button>

        <p className="admin-text">
          Admin? Use the admin sign-in link on the staff portal
        </p>

      </form>
    </div>
  );
}