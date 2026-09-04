import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState(""); 
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    async function register() {
        // Validating that all fields, including phone, are filled
        if (!email || !password || !firstName || !lastName || !phone) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            // Sending the complete data object to your backend
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, {
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                phone: phone 
            });
            
            toast.success("Registration successful! Please login.");
            navigate("/login");

        } catch (e) {
            console.error("Registration failed:", e);
            const errorMessage = e.response?.data?.message || "Registration failed. Try again.";
            toast.error(errorMessage);
        }
    }

    return (
        <div className="min-h-screen w-full relative flex items-stretch">
            {/* Background overlay */}
            <div className="absolute inset-0">
                <div className="h-full w-full bg-[url('/bg.jpg')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/70 via-secondary/40 to-primary/70" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full">
                {/* Form Section */}
                <div className="flex items-center justify-center p-6 sm:p-10 order-2 lg:order-1">
                    <div className="w-full max-w-md">
                        <div className="rounded-3xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl p-8 sm:p-10">
                            <div className="mb-6 flex flex-col items-center text-center">
                                <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-2" />
                                <h2 className="text-black text-2xl font-bold">Create Account</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-black">First Name</label>
                                        <input type="text" onChange={(e)=>setFirstName(e.target.value)} className="w-full h-10 rounded-xl bg-white/90 px-4 outline-none text-secondary focus:ring-2 focus:ring-accent/50 transition-all" placeholder="John"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-black">Last Name</label>
                                        <input type="text" onChange={(e)=>setLastName(e.target.value)} className="w-full h-10 rounded-xl bg-white/90 px-4 outline-none text-secondary focus:ring-2 focus:ring-accent/50 transition-all" placeholder="Doe"/>
                                    </div>
                                </div>

                                {/* Phone Number Field */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-black">Phone Number</label>
                                    <input type="text" onChange={(e)=>setPhone(e.target.value)} className="w-full h-10 rounded-xl bg-white/90 px-4 outline-none text-secondary focus:ring-2 focus:ring-accent/50 transition-all" placeholder="+94 77 123 4567"/>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-black">Email address</label>
                                    <input type="email" onChange={(e)=>setEmail(e.target.value)} className="w-full h-10 rounded-xl bg-white/90 px-4 outline-none text-secondary focus:ring-2 focus:ring-accent/50 transition-all" placeholder="you@example.com"/>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-black">Password</label>
                                    <input type="password" onChange={(e)=>setPassword(e.target.value)} className="w-full h-10 rounded-xl bg-white/90 px-4 outline-none text-secondary focus:ring-2 focus:ring-accent/50 transition-all" placeholder="••••••••"/>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-black">Confirm Password</label>
                                    <input type="password" onChange={(e)=>setConfirmPassword(e.target.value)} className="w-full h-10 rounded-xl bg-white/90 px-4 outline-none text-secondary focus:ring-2 focus:ring-accent/50 transition-all" placeholder="••••••••"/>
                                </div>

                                <button onClick={register} className="w-full h-11 mt-4 rounded-xl bg-accent text-white font-bold shadow-lg hover:brightness-110 transition active:scale-95">
                                    Register
                                </button>
                            </div>

                            <div className="mt-6 text-center text-sm text-black font-medium">
                                Already have an account? <Link to="/login" className="text-accent font-bold hover:underline ml-1">Login here</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Side */}
                <div className="hidden lg:flex flex-col justify-center p-20 order-1 lg:order-2">
                    <div className="max-w-xl space-y-6">
                        <h1 className="text-6xl font-bold leading-tight text-white drop-shadow-lg">
                            Glow on. <br/><span className="text-accent">Shop on.</span>
                        </h1>
                        <p className="text-white/90 text-xl leading-relaxed">
                            Join Crystal Beauty today and unlock a world of professional skincare and beauty tools.
                        </p>
                        <div className="h-1.5 w-24 bg-accent rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}