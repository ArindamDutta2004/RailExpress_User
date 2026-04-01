import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe } from 'lucide-react';

const termsContent = {
  english: {
    title: '🎫 Railway Ticket Booking – Terms & Conditions',
    content: [
      '1) Pricing Policy',
      '• Ticket Price + ₹400 per passenger (Service Charge)',
      '• No hidden or extra charges',
      '• This is the maximum service charge (not more than this)',
      '• Lower service charge compared to other agents',
      '',
      '2) Required Information',
      'Please provide the following details:',
      '• Name',
      '• Date of Birth (DOB)',
      '• Journey Date',
      '• From Station',
      '• To Station',
      '• Aadhaar Card (Attach copy/photo)',
      '',
      '3) Ticket Confirmation',
      '• AC & Sleeper (SL) tickets – 100% confirmation support on any train (subject to availability)',
      '',
      '4) Payment Policy',
      '• Advance payment: ₹1000 (via given QR code)',
      '• Full payment after ticket confirmation',
      '',
      '5) Cancellation Policy',
      '• Must inform cancellation before journey date, 7:00 PM',
      '• After deadline → Advance is NON-refundable',
      '',
      '6) Additional Terms',
      '• Ticket booking depends on real-time availability',
      '• Provide correct details to avoid booking failure',
      '• No refund for incorrect details provided by customer',
      '• Agent is not responsible for train delays or cancellations',
      '• Service charge is non-refundable after booking process',
      '',
      'Final Note',
      'By proceeding with booking, you agree to all the above terms & conditions.',
    ],
  },
  hindi: {
    title: '🎫 रेलवे टिकट बुकिंग – नियम और शर्तें',
    content: [
      '1) मूल्य नीति',
      '• टिकट का मूल्य + ₹400 प्रति यात्री (सर्विस चार्ज)',
      '• कोई अतिरिक्त या छुपा शुल्क नहीं',
      '• यह अधिकतम सर्विस चार्ज है (इससे अधिक नहीं लिया जाएगा)',
      '• अन्य एजेंटों की तुलना में कम सर्विस चार्ज',
      '',
      '2) आवश्यक जानकारी',
      'कृपया निम्न जानकारी प्रदान करें:',
      '• नाम',
      '• जन्म तिथि',
      '• यात्रा की तारीख',
      '• प्रस्थान स्टेशन',
      '• गंतव्य स्टेशन',
      '• आधार कार्ड (फोटो/कॉपी संलग्न करें)',
      '',
      '3) टिकट कन्फर्मेशन',
      '• AC और Sleeper टिकट – किसी भी ट्रेन में 100% कन्फर्म सहायता (उपलब्धता पर निर्भर)',
      '',
      '4) भुगतान नीति',
      '• अग्रिम भुगतान: ₹1000 (QR कोड द्वारा)',
      '• टिकट कन्फर्म होने के बाद पूरा भुगतान',
      '',
      '5) रद्द करने की नीति',
      '• यात्रा तिथि से पहले शाम 7:00 बजे तक सूचना दें',
      '• समय के बाद → अग्रिम राशि वापस नहीं होगी',
      '',
      '6) अतिरिक्त नियम',
      '• टिकट बुकिंग उपलब्धता पर निर्भर करती है',
      '• गलत जानकारी देने पर बुकिंग फेल हो सकती है',
      '• ग्राहक की गलत जानकारी पर कोई रिफंड नहीं',
      '• ट्रेन लेट या कैंसिल होने पर एجن्ट जिम्मेदार नहीं',
      '• बुकिंग प्रोसेस के बाद सर्विस चार्ज वापस नहीं होगा',
      '',
      'अंतिम नोट',
      'बुकिंग करने पर आप सभी नियमों और शर्तों से सहमत हैं।',
    ],
  },
  bengali: {
    title: '🎫 রেলওয়ে টিকিট বুকিং – শর্তাবলী',
    content: [
      '১) মূল্য নীতি',
      '• টিকিটের দাম + প্রতি যাত্রী ₹৪০০ (সার্ভিস চার্জ)',
      '• কোনো অতিরিক্ত বা লুকানো চার্জ নেই',
      '• এটি সর্বোচ্চ সার্ভিস চার্জ (এর বেশি নেওয়া হবে না)',
      '• অন্যান্য এজেন্টদের তুলনায় কম সার্ভিস চার্জ',
      '',
      '২) প্রয়োজনীয় তথ্য',
      'দয়া করে নিচের তথ্যগুলো দিন:',
      '• নাম',
      '• জন্ম তারিখ',
      '• যাত্রার তারিখ',
      '• কোন স্টেশন থেকে',
      '• কোন স্টেশনে',
      '• আধার কার্ড (ছবি সংযুক্ত করুন)',
      '',
      '৩) টিকিট কনফার্মেশন',
      '• AC ও Sleeper টিকিট – যেকোনো ট্রেনে ১০০% কনফার্ম সাপোর্ট (সিটের উপর নির্ভরশীল)',
      '',
      '৪) পেমেন্ট নীতি',
      '• অগ্রিম: ₹১০০০ (QR কোডে পেমেন্ট)',
      '• টিকিট কনফার্ম হওয়ার পর সম্পূর্ণ টাকা দিতে হবে',
      '',
      '৫) বাতিল নীতি',
      '• যাত্রার দিনের আগে সন্ধ্যা ৭টার মধ্যে বাতিল জানাতে হবে',
      '• সময় পার হলে → অগ্রিম ফেরতযোগ্য নয়',
      '',
      '৬) অতিরিক্ত শর্ত',
      '• টিকিট বুকিং সিট পাওয়ার উপর নির্ভর করে',
      '• ভুল তথ্য দিলে বুকিং ব্যর্থ হতে পারে',
      '• গ্রাহকের ভুল তথ্যের জন্য কোনো রিফান্ড নেই',
      '• ট্রেন লেট বা বাতিল হলে এজেন্ট দায়ী নয়',
      '• বুকিং প্রসেস হওয়ার পর সার্ভিস চার্জ ফেরতযোগ্য নয়',
      '',
      'শেষ কথা',
      'বুকিং করার মাধ্যমে আপনি উপরোক্ত সকল শর্ত মেনে নিচ্ছেন।',
    ],
  },
};

type Language = 'english' | 'hindi' | 'bengali';

const Terms = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('english');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = () => {
    if (!agreed) {
      setError('You must accept the terms and conditions to continue');
      return;
    }

    localStorage.setItem('termsAccepted', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen animated-bg p-4 page">
      <div className="max-w-4xl mx-auto py-8">
        <div className="glass-card hover-glow rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                {termsContent[language].title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-white/80" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-3 py-2 border border-white/20 bg-white/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="english">English</option>
                <option value="hindi">हिंदी</option>
                <option value="bengali">বাংলা</option>
              </select>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {termsContent[language].content.map((paragraph, index) => (
                <p key={index} className="text-slate-800 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setError('');
              }}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="agree" className="text-white/90 font-medium">
              {language === 'english' && 'I have read and agree to the Terms and Conditions'}
              {language === 'hindi' && 'मैंने नियम और शर्तें पढ़ ली हैं और उनसे सहमत हूं'}
              {language === 'bengali' && 'আমি শর্তাবলী পড়েছি এবং সম্মত হয়েছি'}
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!agreed}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed press"
          >
            {language === 'english' && 'Continue to Dashboard'}
            {language === 'hindi' && 'डैशबोर्ड पर जारी रखें'}
            {language === 'bengali' && 'ড্যাশবোর্ডে চালিয়ে যান'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
