import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill in all fields.");
    }

    try {
      setSubmitting(true);
      const response = await axios.post(import.meta.env.VITE_API_URL + "/api/contact", formData);
      if (response.data.success) {
        toast.success("Message sent! We will get back to you shortly.");
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send message. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-5">
          
          {/* Contact Details Panel */}
          <div className="lg:col-span-2 bg-slate-900 text-white p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Get in Touch</span>
              <h2 className="text-3xl font-black italic uppercase tracking-tight">Contact Us</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Have questions about your order or our formulations? Reach out to our customer care team.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl text-rose-400"><FiMail size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email</p>
                  <p className="text-xs font-semibold">support@crystalbeauty.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl text-emerald-400"><FiPhone size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Phone</p>
                  <p className="text-xs font-semibold">+1 (800) 555-0199</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl text-amber-400"><FiMapPin size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Location</p>
                  <p className="text-xs font-semibold">Colombo, Sri Lanka</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              © Crystal Beauty Essentials
            </p>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-3 p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe" 
                  className="bg-slate-50 border border-slate-100 h-12 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@example.com" 
                  className="bg-slate-50 border border-slate-100 h-12 rounded-xl px-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                <textarea 
                  rows="4" 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?" 
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <FiSend /> {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}