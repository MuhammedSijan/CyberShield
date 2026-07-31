import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Validation Error', 'Please complete all required fields.', 'warning');
      return;
    }

    setIsSubmitting(true);

    // Mock network transmission
    setTimeout(() => {
      showToast('Message Sent', 'Thank you! Our support team will respond shortly.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Contact CyberShield Support</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Have security feature suggestions, need support, or looking to integrate our APIs? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CONTACT FORM */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-655 dark:text-slate-400">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-400 dark:placeholder-slate-650"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-655 dark:text-slate-400">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@company.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-400 dark:placeholder-slate-655"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-400">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="How can we help?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-400 dark:placeholder-slate-650"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-655 dark:text-slate-400">Message Body *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Write your feedback or query details..."
                rows={6}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-850 dark:text-slate-200 text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder-slate-400 dark:placeholder-slate-650"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* SIDE BAR DETAILS */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Corporate Office</h3>
            
            <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <div className="flex gap-2.5">
                <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">General Support</span>
                  <span>support@cybershield.io</span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Phone className="h-4.5 w-4.5 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Phone Line</span>
                  <span>+1 (555) 019-2834</span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Location</span>
                  <span>San Francisco, California</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 to-slate-900/5 space-y-2">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" /> Rapid Response SLA
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Our engineering support team monitors logs and responds to system integrations within 12 hours. We appreciate your feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
