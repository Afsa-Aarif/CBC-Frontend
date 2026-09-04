import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
                email,
                password
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            const userName = res.data.user.firstName || 'User';
            toast.success(`Welcome back, ${userName}!`);

            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
            
            window.location.reload(); 

        } catch (err) {
            console.error("Login Error:", err);
            toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat"
            style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://jsnjgzyigzcukytqoapx.supabase.co/storage/v1/object/public/background-bucket/WhatsApp%20Image%202026-03-10%20at%209.06.51%20PM.jpeg')` 
            }}
        >
            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/20">
                <div className="text-center mb-10">
                    <h1 className="font-black text-2xl italic tracking-tighter uppercase mb-2">
                        Crystal<span className="text-rose-500">Beauty</span>
                    </h1>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Welcome Back
                    </h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            required
                            placeholder="your@email.com"
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white border border-slate-200 h-14 rounded-2xl px-6 text-sm outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-sm" 
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Password
                        </label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white border border-slate-200 h-14 rounded-2xl px-6 text-sm outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-sm" 
                        />
                    </div>

                    <div className="flex justify-end pr-2">
                        <span 
                            onClick={() => navigate('/forget-password')} 
                            className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 cursor-pointer transition-colors"
                        >
                            Forgot Password?
                        </span>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black tracking-widest text-xs hover:bg-rose-600 transition-all shadow-xl active:scale-95 disabled:bg-slate-200 mt-2"
                    >
                        {isLoading ? "AUTHENTICATING..." : "LOGIN TO ACCOUNT"}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Don't have an account? <span onClick={() => navigate('/register')} className="text-rose-500 cursor-pointer hover:underline">Register Now</span>
                    </p>
                </div>
            </div>
        </div>
    );
}