import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgetPassword() {
  const [step, setStep] = useState("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function sendOTP() {
    if (!identifier) return toast.error("Please enter email or phone");
    setIsLoading(true);
    try {
      // Changed from GET to POST to match updated backend controller payload
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/send-otp`,
        {
          identifier: identifier.trim(),
          email: identifier.trim(),
        }
      );
      
      toast.success(response.data?.message || "OTP sent successfully!");
      setStep("otp");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function changePassword() {
    if (!otp) return toast.error("Please enter the OTP");
    if (!newPassword) return toast.error("Please enter a new password");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/change-password`,
        {
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword: newPassword,
        }
      );
      toast.success(response.data?.message || "Password changed successfully!");
      navigate("/login");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error updating password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 bg-opacity-90">
      <div className="w-[400px] bg-white bg-opacity-10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white italic mb-2 text-center uppercase tracking-tighter">
          Reset <span className="text-rose-500">Password</span>
        </h1>
        <p className="text-gray-400 text-[10px] text-center mb-8 uppercase tracking-widest font-bold">
          Account Recovery Panel
        </p>

        {step === "identifier" ? (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or Phone (+94...)"
              className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
            />
            <button
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-2xl uppercase text-xs transition-colors disabled:opacity-50"
              onClick={sendOTP}
            >
              {isLoading ? "Sending..." : "Request Reset OTP"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-Digit OTP"
              className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl text-white text-center font-bold outline-none focus:ring-2 focus:ring-rose-500 text-lg tracking-widest"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full bg-black/20 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            />
            <button
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl mt-2 transition-colors disabled:opacity-50"
              onClick={changePassword}
            >
              {isLoading ? "Processing..." : "Confirm Update"}
            </button>
            <button
              type="button"
              onClick={() => setStep("identifier")}
              className="text-xs text-gray-400 hover:text-white mt-2 text-center underline"
            >
              Back to Email Input
            </button>
          </div>
        )}
      </div>
    </div>
  );
}