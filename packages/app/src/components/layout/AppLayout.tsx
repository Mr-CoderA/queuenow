import { useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../../lib/api-client";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => getStoredUser(), [location.key, location.pathname]);

  function onLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to={user ? "/queues" : "/login"} className="text-lg font-semibold">
            QueueNow
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            {user ? (
              <>
                <span>{user.email}</span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-3 py-1 text-slate-800"
                  onClick={onLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
