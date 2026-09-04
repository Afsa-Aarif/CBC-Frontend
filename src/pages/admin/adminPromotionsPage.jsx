import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    expirationDate: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/coupons`, config);
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to load coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create Coupon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post(`${backendUrl}/api/coupons`, formData, config);
      setMessage({ type: "success", text: res.data.message });
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minPurchase: "",
        expirationDate: "",
      });
      fetchCoupons();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create promo code",
      });
    }
  };

  // Toggle Active Status
  const handleToggle = async (id) => {
    try {
      await axios.put(`${backendUrl}/api/coupons/${id}/toggle`, {}, config);
      fetchCoupons();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Delete Coupon
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return;

    try {
      await axios.delete(`${backendUrl}/api/coupons/${id}`, config);
      fetchCoupons();
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Seasonal Offers & Promotions Manager
      </h1>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Coupon Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Create New Promo Code (Eid, New Year, Christmas)
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Promo Code</label>
            <input
              type="text"
              name="code"
              placeholder="e.g. EID2026 or XMAS20"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Discount Type</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (LKR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Discount Value {formData.discountType === "percentage" ? "(%)" : "(LKR)"}
            </label>
            <input
              type="number"
              name="discountValue"
              placeholder={formData.discountType === "percentage" ? "15" : "1000"}
              value={formData.discountValue}
              onChange={handleChange}
              required
              min="1"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Min. Purchase Amount (LKR)</label>
            <input
              type="number"
              name="minPurchase"
              placeholder="0 (Optional)"
              value={formData.minPurchase}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Expiration Date</label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              required
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
            >
              Add Seasonal Offer
            </button>
          </div>
        </form>
      </div>

      {/* Existing Coupons Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b text-gray-700">Active & Past Promo Codes</h2>
        {loading ? (
          <p className="p-6 text-gray-500">Loading promo codes...</p>
        ) : coupons.length === 0 ? (
          <p className="p-6 text-gray-500">No promo codes created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-sm font-semibold text-gray-600">
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Spend</th>
                  <th className="p-4">Expires On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {coupons.map((c) => {
                  const isExpired = new Date() > new Date(c.expirationDate);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-pink-600">{c.code}</td>
                      <td className="p-4">
                        {c.discountType === "percentage"
                          ? `${c.discountValue}% OFF`
                          : `LKR ${c.discountValue.toLocaleString()} OFF`}
                      </td>
                      <td className="p-4">
                        {c.minPurchase > 0 ? `LKR ${c.minPurchase.toLocaleString()}` : "No Limit"}
                      </td>
                      <td className="p-4">{new Date(c.expirationDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        {isExpired ? (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Expired</span>
                        ) : c.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-semibold">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleToggle(c._id)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                        >
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}