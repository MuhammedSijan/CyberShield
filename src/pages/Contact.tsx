import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
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

    setTimeout(() => {
      showToast('Message Sent', 'Thank you! Our support team will review your message.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact CyberShield Support
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Have security feature suggestions, need enterprise integration guidance, or want to report a vulnerability? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* CONTACT FORM (8 cols) */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Jane Doe"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-slate-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jane@company.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="How can we assist you?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Message Body *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Describe your security question, feedback, or integration requirement..."
                rows={6}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder-slate-400 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* SIDE BAR DETAILS (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Operational Headquarters</h3>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="flex gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-primary border border-slate-200 dark:border-slate-700 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Email Inquiries</span>
                  <span>support@cybershield.io</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-primary border border-slate-200 dark:border-slate-700 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Direct Line</span>
                  <span>+1 (555) 019-2834</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-primary border border-slate-200 dark:border-slate-700 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">Location</span>
                  <span>San Francisco, California</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
