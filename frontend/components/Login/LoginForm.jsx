import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });

    // TODO:
    // Send login request to backend
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>

      <h4>USIU-AFRICA STUDENTS ONLY</h4>

      <h1>Pass the torch, not the guesswork.</h1>

      <p>
        Sign in to hand over or receive a leadership role.
      </p>

      <label htmlFor="email">
        USIU Email
      </label>

      <input
        id="email"
        type="email"
        placeholder="john.doe@usiu.ac.ke"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="password">
        Password
      </label>

      <input
        id="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">
        Sign In
      </button>

      <p className="admin-text">
        Admin? Use the admin sign-in link on the staff portal.
      </p>

    </form>
  );
}

export default LoginForm;
