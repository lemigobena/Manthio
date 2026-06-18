import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useXP } from '../../context/XPContext';
import { 
  ArrowLeft, Search, Send, ChevronDown, ChevronUp 
} from 'lucide-react';

interface HelpCenterProps {
  onNavigate: (page: string) => void;
}

const FAQS = [
  {
    question: "How do I earn XP in Manthio?",
    answer: "You earn XP by completing modules, watching lessons, finishing quizzes, participating in community discussions, and completing code assignments graded by the AI Tutor."
  },
  {
    question: "What is a 'Flipped' Classroom format?",
    answer: "In a flipped classroom format, you learn the core theory at your own pace through structured video lessons and files in advance. The live interactive sessions with trainers are reserved for hands-on programming, advanced architecture topics, and direct feedback."
  },
  {
    question: "How do I contact David Pinezich?",
    answer: "You can reach out directly via the Support Form on this page, view his details in course information, or contact his training organization at apigenio.ch."
  },
  {
    question: "How do I reset my progress?",
    answer: "Go to your Settings page, select the Account sub-tab, and you can reset your progress, XP, and streaks from the danger zone panel."
  },
  {
    question: "Can I download lecture resources?",
    answer: "Yes, all slides, cheat sheets, code snippets, and resources are available in the 'Files' tab of your workspace. They can be downloaded in PDF or source file formats."
  }
];

export const HelpCenter: React.FC<HelpCenterProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useXP();

  // Support Form State
  const [supportName, setSupportName] = useState(user?.name || '');
  const [supportEmail, setSupportEmail] = useState(user?.email || '');
  const [supportCategory, setSupportCategory] = useState('General Query');
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      addToast('error', 'Please enter a message.');
      return;
    }
    setSendingSupport(true);
    setTimeout(() => {
      setSendingSupport(false);
      addToast('success', 'Support ticket submitted! We will email you shortly.');
      setSupportMessage('');
    }, 800);
  };

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back navigation */}
      <button 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center space-x-1.5 text-xs text-muted hover:text-cyan transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Container Card */}
      <div className="bg-panel border border-line rounded-2xl p-6 lg:p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-text">Help Center & FAQ</h2>
          <p className="text-xs text-muted mt-1">Search our knowledge base or submit a direct support message below.</p>
        </div>

        {/* FAQ Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="w-full bg-bg border border-line rounded-xl pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-muted/50 focus:outline-none focus:border-cyan transition-colors"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider px-1">Frequently Asked Questions</h3>
          {filteredFaqs.length > 0 ? (
            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-line rounded-xl overflow-hidden bg-bg/25"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex justify-between items-center px-4 py-3.5 text-left text-xs font-bold text-text hover:bg-bg/40 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-cyan" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-muted leading-relaxed border-t border-line/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-line rounded-xl text-xs text-muted">
              No FAQs matching "{faqSearch}"
            </div>
          )}
        </div>

        {/* Support Form */}
        <div className="border-t border-line pt-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-text">Still need help?</h3>
            <p className="text-xs text-muted mt-0.5">Submit a message to our training support desk.</p>
          </div>

          <form onSubmit={handleSendSupport} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-cyan transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-cyan transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Topic</label>
              <select
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-cyan transition-colors"
              >
                <option value="General Query">General Question</option>
                <option value="Technical Support">Technical Issue</option>
                <option value="Billing">Billing & Subscription</option>
                <option value="Feedback">Feedback & Suggestions</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Message</label>
              <textarea
                required
                rows={4}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-cyan transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sendingSupport}
              className="bg-cyan hover:bg-cyan2 text-bg font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingSupport ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
