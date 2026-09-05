import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiClock, FiSend, FiMail, FiCheckCircle } from 'react-icons/fi';
import Loader from '../../components/loader';

export default function AdminInquiriesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  const fetchInquiries = () => {
    const token = localStorage.getItem("token");
    axios.get(import.meta.env.VITE_API_URL + "/api/contact", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setMessages(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      toast.error("Failed to load inquiries");
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleSendReply = async (id) => {
    const text = replyText[id];
    if (!text) return toast.error("Please enter a reply message.");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/contact/reply/${id}`,
        { reply: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Reply recorded!");
      setReplyText({ ...replyText, [id]: "" });
      fetchInquiries();
    } catch (err) {
      toast.error("Failed to post reply.");
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Customer Inquiries</h1>
        <p className="text-slate-500">View customer requests and send replies directly to their account.</p>
      </div>

      {messages.length === 0 ? (
        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs bg-slate-50 rounded-2xl">
          No inquiries found.
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg._id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase">
                    {msg.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{msg.name}</h4>
                    <p className="text-xs text-slate-400">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    msg.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {msg.status}
                  </span>
                  <a 
                    href={`mailto:${msg.email}?subject=Reply from Crystal Beauty&body=Hi ${msg.name},%0D%0A%0D%0AIn response to your query: "${msg.message}"%0D%0A%0D%0A`}
                    className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900"
                    title="Send Email Directly"
                  >
                    <FiMail size={14} />
                  </a>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                    <FiClock /> {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed font-medium">
                "{msg.message}"
              </p>

              {msg.reply && (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                    <FiCheckCircle /> Admin Response Sent
                  </p>
                  <p className="text-xs text-slate-800 font-medium">{msg.reply}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  placeholder="Type your reply here..." 
                  value={replyText[msg._id] || ""}
                  onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <button 
                  onClick={() => handleSendReply(msg._id)}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black transition-all"
                >
                  <FiSend /> {msg.reply ? "Update Reply" : "Send Reply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}