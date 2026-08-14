import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/formatters";
import InstallAppButton from "./InstallAppButton";

export default function Navbar() {
  const { isAuthenticated, worker, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = [
    { to: "/report", label: "Report a concern" },
    { to: "/track", label: "Track a report" },
    ...(isAuthenticated
      ? [
          { to: "/dashboard", label: "Triage queue" },
          { to: "/incidents", label: "Incidents" },
        ]
      : []),
  ];

  return (
    <header className="navbar-wrap">
      <nav className="navbar glass-strong">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-mark">+</span>
          <span>CareLink</span>
        </Link>

        <div className="navbar-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={isActive(link.to) ? "navbar-link active" : "navbar-link"}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <InstallAppButton />
          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="navbar-avatar">{initials(worker?.full_name)}</span>
              <div className="navbar-user-meta">
                <strong>{worker?.full_name}</strong>
                <span>{worker?.role?.replace(/_/g, " ")}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm navbar-signin">
              Health worker sign in
            </Link>
          )}

          <button
            type="button"
            className="navbar-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`navbar-toggle-bar ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="navbar-mobile-menu glass-strong">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={isActive(link.to) ? "navbar-mobile-link active" : "navbar-mobile-link"}>
              {link.label}
            </Link>
          ))}
          <div className="navbar-mobile-divider" />
          {isAuthenticated ? (
            <>
              <div className="navbar-mobile-user">
                <span className="navbar-avatar">{initials(worker?.full_name)}</span>
                <div className="navbar-user-meta">
                  <strong>{worker?.full_name}</strong>
                  <span>{worker?.role?.replace(/_/g, " ")}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-block" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-block">
              Health worker sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
