import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getSummary } from "../../api/admin.api";

function Dashboard() {
  const { admin, logout } = useAuth();
  const [message, setMessage] = useState("Loading…");

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getSummary();
        setMessage(data.message);
      } catch (err) {
        setMessage(err.message);
      }
    }
    loadSummary();
  }, []);

  return (
    <section className="page container auth-page">
      <div className="auth-card">
        <h1>Admin Dashboard</h1>
        <p className="auth-subtitle">{message}</p>
        <p className="auth-subtitle">Logged in as {admin.email}</p>
        <button className="btn btn-outline auth-btn" onClick={logout}>
          Log out
        </button>
      </div>
    </section>
  );
}

export default Dashboard;