import "./Signup.css";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
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
    <div className="signup-page">
      <form className="signup-form" onSubmit={handleSubmit}>

        <div className="badge">
          USIU-AFRICA STUDENTS ONLY
        </div>

        <h1 className="signup-title">
          Pass the torch, not the guesswork.
        </h1>

        <p className="signup-subtitle">
          Sign up to the USIULEGACYLEAD platform
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

        <button type="submit" >
          Sign up
        </button>

        <p className="admin-text">
          Admin? Use the admin sign-in link on the staff portal
        </p>

        <p className="login-text">
            Already have an account? Sign in <Link to ="/" >Click here</Link>
        </p>
      </form>
    </div>
  );
}
