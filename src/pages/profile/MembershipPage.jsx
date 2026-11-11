
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaGem, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MembershipPage() {
  const [user, setUser] = useState(null);
  const [membershipRequest, setMembershipRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMembershipData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userResponse, requestResponse] = await Promise.all([
        axios.get(`${API_URL}/api/users/me`, { headers }),
        axios.get(`${API_URL}/api/users/membership-request`, { headers }),
      ]);

      setUser(userResponse.data);
      setMembershipRequest(requestResponse.data.request || null);
    } catch (error) {
      console.error("Membership data error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load membership details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login to view your membership");
      setLoading(false);
      return;
    }

    fetchMembershipData();
  }, []);

  const completedCount = user?.membershipCompletedCount || 0;

  const currentTier =
    completedCount >= 10
      ? "VIP"
      : completedCount >= 5
      ? "Premium"
      : "Regular";

  const eligibleTier =
    completedCount === 4
      ? "Premium"
      : completedCount === 9
      ? "VIP"
      : null;

  const handleMembershipRequest = async () => {
    if (!eligibleTier || submitting) return;

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/users/membership-request`,
        { requestedTier: eligibleTier },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembershipRequest(response.data.request);
      toast.success("Membership upgrade request submitted!");
    } catch (error) {
      console.error("Membership request error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit membership request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-semibold">
          Loading membership details...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Please login to view your membership.</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="px-6 py-3 rounded-xl bg-[#324F78] text-white font-bold"
        >
          Login
        </button>
      </div>
    );
  }

  const requestPending = membershipRequest?.status === "Pending";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => (window.location.href = "/profile")}
          className="mb-6 text-sm font-bold text-[#324F78] hover:underline"
        >
          ← Back to Profile
        </button>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            My Membership
          </h1>
          <p className="text-slate-500 mt-2">
            Track your membership progress and request your next upgrade.
          </p>
        </div>

        {/* Current Membership */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#E3FCF9] flex items-center justify-center">
              <FaGem className="text-[#324F78] text-2xl" />
            </div>

            <div>
              <p className="text-sm text-slate-500 font-semibold">
                Current Membership
              </p>
              <h2 className="text-2xl font-black text-[#324F78]">
                {currentTier} Member
              </h2>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5">
            <p className="text-sm text-slate-500 font-semibold">
              Completed Membership Activities
            </p>
            <p className="text-3xl font-black text-slate-800 mt-1">
              {completedCount}
            </p>
          </div>
        </div>

        {/* Membership Progress */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
          <h2 className="text-lg font-black text-slate-800 mb-5">
            Membership Levels
          </h2>

          <div className="space-y-5">
            {[
              { name: "Regular", range: "0–4 activities", active: currentTier === "Regular" },
              { name: "Premium", range: "5–9 activities", active: currentTier === "Premium" },
              { name: "VIP", range: "10+ activities", active: currentTier === "VIP" },
            ].map((tier) => (
              <div
                key={tier.name}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-slate-800">{tier.name}</p>
                  <p className="text-xs text-slate-500">{tier.range}</p>
                </div>

                {tier.active && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-full">
                    Current Level
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Request */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="text-lg font-black text-slate-800 mb-3">
            Membership Upgrade
          </h2>

          {requestPending ? (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-amber-700">
                <FaClock />
                <p className="font-bold">Request Pending</p>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                Your request for {membershipRequest.requestedTier} membership
                is waiting for admin approval.
              </p>
            </div>
          ) : eligibleTier ? (
            <>
              <p className="text-sm text-slate-600 mb-5">
                Congratulations! You are eligible to request an upgrade to{" "}
                <strong>{eligibleTier}</strong> membership.
              </p>

              <button
                onClick={handleMembershipRequest}
                disabled={submitting}
                className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#324F78] text-white font-bold hover:bg-[#5067AA] transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : `Request ${eligibleTier} Upgrade`}
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              {completedCount < 4
                ? `Complete ${4 - completedCount} more membership ${
                    4 - completedCount === 1 ? "activity" : "activities"
                  } to become eligible for Premium.`
                : completedCount < 9
                ? `Complete ${9 - completedCount} more membership ${
                    9 - completedCount === 1 ? "activity" : "activities"
                  } to become eligible for VIP.`
                : "You have reached the highest membership level. Welcome, VIP!"}
            </p>
          )}

          {membershipRequest &&
            membershipRequest.status !== "Pending" && (
              <div
                className={`mt-5 rounded-2xl p-4 ${
                  membershipRequest.status === "Approved"
                    ? "bg-emerald-50"
                    : "bg-rose-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {membershipRequest.status === "Approved" ? (
                    <FaCheckCircle className="text-emerald-600" />
                  ) : (
                    <FaTimesCircle className="text-rose-600" />
                  )}

                  <p className="font-bold text-slate-800">
                    Previous Request: {membershipRequest.status}
                  </p>
                </div>

                <p className="text-sm text-slate-600 mt-2">
                  Your {membershipRequest.requestedTier} membership request
                  was {membershipRequest.status.toLowerCase()}.
                </p>
              </div>
            )}
        </div>

      </div>
    </div>
  );
}

export default MembershipPage;
