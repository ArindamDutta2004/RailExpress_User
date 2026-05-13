import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe } from 'lucide-react';

const termsContent = {
  english: {
    title: 'Railway Ticket Booking – Terms & Conditions',
    content: [
      '1) Pricing Policy',
      '• Ticket Fare + ₹1300 per passenger (Service Charge)',
      '• VIP Ticket: Ticket Fare + ₹2000 per passenger (with full advance payment)',
      '• No hidden or additional charges',
      '• ₹1300 is the maximum service charge applicable for normal booking',
      '• Competitive and lower service charges compared to most agents',
      '',

      '2) Required Information',
      'Please provide the following details:',
      '• Full Name',
      '• Date of Birth (DOB)',
      '• Journey Date',
      '• Boarding / From Station',
      '• Destination / To Station',
      '• Aadhaar Card (Attach clear copy/photo)',
      '',

      '3) Ticket Confirmation',
      '• AC & Sleeper (SL) ticket booking support available',
      '• Confirmation assistance provided for all trains (subject to real-time availability)',
      '• VIP booking available for urgent and premium travel requirements',
      '',

      '4) Payment Policy',
      '• Normal Booking Advance Payment: ₹1000 (via provided QR code)',
      '• Remaining payment to be completed after ticket confirmation',
      '• VIP Booking requires full advance payment',
      '',

      '5) Cancellation Policy',
      '• Cancellation request must be informed before 7:00 PM prior to journey date',
      '• After deadline → Advance payment will be NON-refundable',
      '',

      '6) Additional Terms',
      '• Ticket booking depends on real-time seat availability',
      '• Customers must provide accurate details to avoid booking failure',
      '• No refund for incorrect information submitted by customer',
      '• The agent/service provider is not responsible for train delays, rescheduling, or cancellations by Indian Railways',
      '• Service charge becomes non-refundable once booking process has started',
      '',

      'Final Declaration',
      'By proceeding with booking, customer acknowledges and agrees to all the above-mentioned terms & conditions.',

    ],
  },

  hindi: {
    title: 'रेलवे टिकट बुकिंग – नियम एवं शर्तें',
    content: [
      '1) मूल्य नीति',
      '• टिकट किराया + ₹1300 प्रति यात्री (सर्विस चार्ज)',
      '• VIP टिकट: टिकट किराया + ₹2000 प्रति यात्री (पूर्ण अग्रिम भुगतान के साथ)',
      '• कोई छुपा हुआ या अतिरिक्त शुल्क नहीं',
      '• सामान्य बुकिंग के लिए ₹1300 अधिकतम लागू सर्विस चार्ज है',
      '• अधिकांश एजेंटों की तुलना में कम और प्रतिस्पर्धी सर्विस चार्ज',
      '',

      '2) आवश्यक जानकारी',
      'कृपया निम्नलिखित जानकारी प्रदान करें:',
      '• पूरा नाम',
      '• जन्म तिथि (DOB)',
      '• यात्रा की तिथि',
      '• बोर्डिंग / प्रस्थान स्टेशन',
      '• गंतव्य / आगमन स्टेशन',
      '• आधार कार्ड (स्पष्ट कॉपी/फोटो संलग्न करें)',
      '',

      '3) टिकट कन्फर्मेशन',
      '• AC एवं Sleeper (SL) टिकट बुकिंग सहायता उपलब्ध',
      '• सभी ट्रेनों के लिए कन्फर्मेशन सहायता उपलब्ध (रीयल-टाइम उपलब्धता के अनुसार)',
      '• तत्काल एवं प्रीमियम यात्रा आवश्यकताओं के लिए VIP बुकिंग उपलब्ध',
      '',

      '4) भुगतान नीति',
      '• सामान्य बुकिंग अग्रिम भुगतान: ₹1000 (दिए गए QR कोड के माध्यम से)',
      '• टिकट कन्फर्म होने के बाद शेष भुगतान पूरा करना होगा',
      '• VIP बुकिंग के लिए पूर्ण अग्रिम भुगतान आवश्यक है',
      '',

      '5) रद्दीकरण नीति',
      '• यात्रा तिथि से पहले शाम 7:00 बजे तक रद्दीकरण की सूचना देना अनिवार्य है',
      '• निर्धारित समय के बाद → अग्रिम भुगतान वापस नहीं किया जाएगा',
      '',

      '6) अतिरिक्त नियम एवं शर्तें',
      '• टिकट बुकिंग पूरी तरह रीयल-टाइम सीट उपलब्धता पर निर्भर करती है',
      '• बुकिंग विफलता से बचने के लिए सही जानकारी प्रदान करें',
      '• ग्राहक द्वारा दी गई गलत जानकारी के लिए कोई रिफंड नहीं दिया जाएगा',
      '• भारतीय रेलवे द्वारा ट्रेन विलंब, पुनर्निर्धारण या रद्द होने के लिए एजेंट/सर्विस प्रदाता जिम्मेदार नहीं होगा',
      '• बुकिंग प्रक्रिया शुरू होने के बाद सर्विस चार्ज वापस नहीं किया जाएगा',
      '',

      'अंतिम घोषणा',
      'बुकिंग प्रक्रिया जारी रखने के साथ, ग्राहक उपरोक्त सभी नियम एवं शर्तों को स्वीकार और सहमत माना जाएगा।',

    ],
  },

  bengali: {
    title: 'রেলওয়ে টিকিট বুকিং – নিয়ম ও শর্তাবলী',
    content: [
      '1) মূল্য নীতি',
      '• টিকিট ভাড়া + প্রতি যাত্রীর জন্য ₹1300 (সার্ভিস চার্জ)',
      '• VIP টিকিট: টিকিট ভাড়া + প্রতি যাত্রীর জন্য ₹2000 (সম্পূর্ণ অগ্রিম পেমেন্ট সহ)',
      '• কোনো গোপন বা অতিরিক্ত চার্জ নেই',
      '• সাধারণ বুকিংয়ের জন্য ₹1300 হলো সর্বোচ্চ প্রযোজ্য সার্ভিস চার্জ',
      '• অধিকাংশ এজেন্টের তুলনায় কম ও প্রতিযোগিতামূলক সার্ভিস চার্জ',
      '',

      '2) প্রয়োজনীয় তথ্য',
      'অনুগ্রহ করে নিম্নলিখিত তথ্য প্রদান করুন:',
      '• সম্পূর্ণ নাম',
      '• জন্ম তারিখ (DOB)',
      '• যাত্রার তারিখ',
      '• বোর্ডিং / যাত্রা শুরুর স্টেশন',
      '• গন্তব্য / শেষ স্টেশন',
      '• আধার কার্ড (পরিষ্কার কপি/ছবি সংযুক্ত করুন)',
      '',

      '3) টিকিট কনফার্মেশন',
      '• AC ও Sleeper (SL) টিকিট বুকিং সাপোর্ট উপলব্ধ',
      '• সব ট্রেনের জন্য কনফার্মেশন সহায়তা প্রদান করা হয় (রিয়েল-টাইম উপলব্ধতার উপর নির্ভরশীল)',
      '• জরুরি ও প্রিমিয়াম ভ্রমণের জন্য VIP বুকিং উপলব্ধ',
      '',

      '4) পেমেন্ট নীতি',
      '• সাধারণ বুকিংয়ের অগ্রিম পেমেন্ট: ₹1000 (প্রদত্ত QR কোডের মাধ্যমে)',
      '• টিকিট কনফার্ম হওয়ার পর বাকি পেমেন্ট সম্পূর্ণ করতে হবে',
      '• VIP বুকিংয়ের জন্য সম্পূর্ণ অগ্রিম পেমেন্ট প্রয়োজন',
      '',

      '5) বাতিল নীতি',
      '• যাত্রার তারিখের আগে সন্ধ্যা ৭:০০টার পূর্বে বাতিলের তথ্য জানাতে হবে',
      '• নির্ধারিত সময়ের পরে → অগ্রিম পেমেন্ট ফেরতযোগ্য নয়',
      '',

      '6) অতিরিক্ত শর্তাবলী',
      '• টিকিট বুকিং রিয়েল-টাইম সিট উপলব্ধতার উপর নির্ভর করে',
      '• বুকিং ব্যর্থতা এড়াতে সঠিক তথ্য প্রদান করুন',
      '• গ্রাহকের দেওয়া ভুল তথ্যের জন্য কোনো রিফান্ড দেওয়া হবে না',
      '• ভারতীয় রেলের ট্রেন বিলম্ব, পুনঃনির্ধারণ বা বাতিলের জন্য এজেন্ট/সার্ভিস প্রদানকারী দায়ী নয়',
      '• বুকিং প্রক্রিয়া শুরু হওয়ার পর সার্ভিস চার্জ ফেরতযোগ্য নয়',
      '',

      'চূড়ান্ত ঘোষণা',
      'বুকিং প্রক্রিয়া চালিয়ে যাওয়ার মাধ্যমে, গ্রাহক উপরে উল্লিখিত সমস্ত নিয়ম ও শর্তাবলী স্বীকার ও সম্মত হচ্ছেন।',

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
