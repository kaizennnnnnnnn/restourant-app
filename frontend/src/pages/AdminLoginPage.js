import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await adminLogin({ username: username.trim(), password });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_username", data.username);
      navigate("/admin/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#E15A32] mb-4">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-stone-900"
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
          >
            Admin Panel
          </h1>
          <p className="text-stone-500 text-sm mt-1">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1.5">Username</label>
            <Input
              data-testid="admin-username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="rounded-xl h-11 border-stone-200 focus:border-[#E15A32] focus:ring-[#E15A32]"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1.5">Password</label>
            <Input
              data-testid="admin-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="rounded-xl h-11 border-stone-200 focus:border-[#E15A32] focus:ring-[#E15A32]"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            data-testid="admin-login-btn"
            disabled={loading}
            className="w-full bg-[#E15A32] hover:bg-[#C84B26] text-white rounded-full h-11 font-semibold active-scale"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</>
            ) : (
              <><Lock className="h-4 w-4 mr-2" /> Sign In</>
            )}
          </Button>
        </form>

        <p className="text-center text-stone-400 text-xs mt-6">
          Default credentials: admin / admin123
        </p>
      </div>
    </div>
  );
}
