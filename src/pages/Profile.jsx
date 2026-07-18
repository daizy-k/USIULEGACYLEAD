import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user?.email}</p>
      {/* Editable profile fields go here */}
    </div>
  );
}