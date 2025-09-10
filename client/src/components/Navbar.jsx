import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#f3f3f3" }}>
      <Link to="/" style={{ marginRight: "10px" }}>Login</Link>
      <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
  );
}
