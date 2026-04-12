import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { feedbackAPI } from '../services/api';
import {
  MessageSquare,
  Star,
  ShieldCheck,
  Ticket,
  Sparkles,
  BellRing,
  GalleryHorizontal,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

type PublicFeedback = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  phone: string;
  createdAt: string;
};

type TopTab = 'feedback' | 'service' | 'tickets';

type PastTicketPassenger = {
  name: string;
  meta: string;
  bookingStatus: string;
  currentStatus: string;
};

type PastTicketItem = {
  id: string;
  trainNo: string;
  trainName: string;
  pnr: string;
  fromName: string;
  fromCode: string;
  toName: string;
  toCode: string;
  departTime: string;
  departDate: string;
  arriveTime: string;
  arriveDate: string;
  duration: string;
  banner: string;
  bannerTone: 'pink' | 'blue';
  summary: string;
  bookedOn: string;
  primaryAction: string;
  secondaryAction: string;
  passengers: PastTicketPassenger[];
  note?: string;
};

const UNSPLASH_BG =
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80';

const PAST_TICKETS: PastTicketItem[] = [
  {
    id: '12381-complete',
    trainNo: '12381',
    trainName: 'POORVA EXPRESS',
    pnr: '6701460015',
    fromName: 'HOWRAH',
    fromCode: 'HWH',
    toName: 'NEW DELHI',
    toCode: 'NDLS',
    departTime: '08:15',
    departDate: 'Wed, 1 Apr 26',
    arriveTime: '06:05',
    arriveDate: 'Thu, 2 Apr 26',
    duration: '21h:50m',
    banner: 'Journey Completed',
    bannerTone: 'pink',
    summary: '1 Adult, 0 Child | 3A | TATKAL | HOWRAH',
    bookedOn: 'Tue, 31 Mar 26',
    primaryAction: 'Book Again',
    secondaryAction: 'Return Journey',
    passengers: [
      {
        name: 'D SAHA',
        meta: 'Male | 22',
        bookingStatus: 'TQWL/1',
        currentStatus: 'CNF/B5/23/SL',
      },
    ],
  },
  {
    id: '12987-complete',
    trainNo: '12987',
    trainName: 'SDAH AI SF EXP',
    pnr: '6939839127',
    fromName: 'SEALDAH',
    fromCode: 'SDAH',
    toName: 'JAIPUR JN.',
    toCode: 'JP',
    departTime: '22:55',
    departDate: 'Tue, 24 Feb 26',
    arriveTime: '23:15',
    arriveDate: 'Wed, 25 Feb 26',
    duration: '24h:20m',
    banner: 'Journey Completed',
    bannerTone: 'pink',
    summary: '1 Adult, 0 Child | SL | TATKAL | SEALDAH',
    bookedOn: 'Mon, 23 Feb 26',
    primaryAction: 'Book Again',
    secondaryAction: 'Return Journey',
    passengers: [
      {
        name: 'D GHOSH',
        meta: 'Male | 22',
        bookingStatus: 'CNF/S5/54/UB',
        currentStatus: 'CNF/S5/54/UB',
      },
    ],
  },
  {
    id: '20802-active',
    trainNo: '20802',
    trainName: 'MAGADH EXPRESS',
    pnr: '2253533673',
    fromName: 'NEW DELHI',
    fromCode: 'NDLS',
    toName: 'PATNA JN',
    toCode: 'PNBE',
    departTime: '21:05',
    departDate: 'Sun, 5 Apr 26',
    arriveTime: '12:38',
    arriveDate: 'Mon, 6 Apr 26',
    duration: '15h:33m',
    banner: 'Change Boarding Station',
    bannerTone: 'blue',
    summary: '1 Adult, 0 Child | SL | TATKAL | NEW DELHI',
    bookedOn: 'Sat, 4 Apr 26',
    primaryAction: 'Return Journey',
    secondaryAction: 'Refund Rules',
    passengers: [
      {
        name: 'M CHANDRA',
        meta: 'Male | 32',
        bookingStatus: 'CNF/S4/26/MB',
        currentStatus: 'CNF',
      },
    ],
    note: 'Chart Not Prepared | Chart is likely to be prepared by 13:05 on 05-04',
  },
  {
    id: '12864-active',
    trainNo: '12864',
    trainName: 'SMVB HOWRAH EXP',
    pnr: '4335738400',
    fromName: 'BANGARAPET JN.',
    fromCode: 'BWT',
    toName: 'KHARAGPUR',
    toCode: 'KGP',
    departTime: '11:35',
    departDate: 'Tue, 31 Mar 26',
    arriveTime: '17:00',
    arriveDate: 'Wed, 1 Apr 26',
    duration: '29h:25m',
    banner: 'Change Boarding Station',
    bannerTone: 'blue',
    summary: '2 Adult, 0 Child | SL | TATKAL | BANGARAPET',
    bookedOn: 'Mon, 30 Mar 26',
    primaryAction: 'Return Journey',
    secondaryAction: 'Refund Rules',
    passengers: [
      {
        name: 'B MAHADANDA',
        meta: 'Male | 24',
        bookingStatus: 'CNF/S1/53/MB',
        currentStatus: 'CNF/S1/53/MB',
      },
      {
        name: 'S L MAHADANDA',
        meta: 'Female | 26',
        bookingStatus: 'CNF/S1/54/UB',
        currentStatus: 'CNF/S1/54/UB',
      },
    ],
  },
  {
    id: '12330-active',
    trainNo: '12330',
    trainName: 'SAMPARK K EXP',
    pnr: '2615615112',
    fromName: 'ANAND VIHAR TERMINAL',
    fromCode: 'ANVT',
    toName: 'SEALDAH',
    toCode: 'SDAH',
    departTime: '20:20',
    departDate: 'Wed, 8 Apr 26',
    arriveTime: '16:35',
    arriveDate: 'Thu, 9 Apr 26',
    duration: '20h:15m',
    banner: 'Change Boarding Station',
    bannerTone: 'blue',
    summary: '1 Adult, 0 Child | 3A | TATKAL | ANAND VIHAR',
    bookedOn: 'Tue, 7 Apr 26',
    primaryAction: 'Return Journey',
    secondaryAction: 'Refund Rules',
    passengers: [
      {
        name: 'D SAHA',
        meta: 'Male | 22',
        bookingStatus: 'CNF/B4/6/UB',
        currentStatus: 'CNF/B4/6/UB',
      },
    ],
  },
  {
    id: '19715-complete',
    trainNo: '19715',
    trainName: 'JP GTNR EXP',
    pnr: '2451696048',
    fromName: 'JAIPUR JN.',
    fromCode: 'JP',
    toName: 'MATHURA JN',
    toCode: 'MTJ',
    departTime: '21:05',
    departDate: 'Fri, 27 Mar 26',
    arriveTime: '01:10',
    arriveDate: 'Sat, 28 Mar 26',
    duration: '4h:15m',
    banner: 'Journey Completed',
    bannerTone: 'pink',
    summary: '4 Adult, 0 Child | 3E | GENERAL | JAIPUR JN.',
    bookedOn: 'Wed, 4 Mar 26',
    primaryAction: 'Book Again',
    secondaryAction: 'Return Journey',
    passengers: [
      {
        name: 'GINIYA SHARMA',
        meta: 'Female | 75',
        bookingStatus: 'CNF/M1/41/LB',
        currentStatus: 'CNF/M1/41/LB',
      },
      {
        name: 'SANJAY SHARMA',
        meta: 'Male | 49',
        bookingStatus: 'CNF/M1/42/SL',
        currentStatus: 'CNF/M1/42/SL',
      },
      {
        name: 'PIYUSH SHARMA',
        meta: 'Male | 22',
        bookingStatus: 'CNF/M1/43/UB',
        currentStatus: 'CNF/M1/43/UB',
      },
      {
        name: 'SHUBHAM SHARMA',
        meta: 'Male | 19',
        bookingStatus: 'CNF/M1/42/MB',
        currentStatus: 'CNF/M1/42/MB',
      },
    ],
  },
  {
    id: '12381-active',
    trainNo: '12381',
    trainName: 'POORVA EXPRESS',
    pnr: '6701460015',
    fromName: 'HOWRAH',
    fromCode: 'HWH',
    toName: 'NEW DELHI',
    toCode: 'NDLS',
    departTime: '08:15',
    departDate: 'Wed, 1 Apr 26',
    arriveTime: '06:05',
    arriveDate: 'Thu, 2 Apr 26',
    duration: '21h:50m',
    banner: 'Change Boarding Station',
    bannerTone: 'blue',
    summary: '1 Adult, 0 Child | 3A | TATKAL | HOWRAH',
    bookedOn: 'Tue, 31 Mar 26',
    primaryAction: 'Return Journey',
    secondaryAction: 'Refund Rules',
    passengers: [
      {
        name: 'D SAHA',
        meta: 'Male | 22',
        bookingStatus: 'TQWL/1',
        currentStatus: 'CNF',
      },
    ],
  },
  {
    id: '12864-complete',
    trainNo: '12864',
    trainName: 'SMVB HOWRAH EXP',
    pnr: '4335738400',
    fromName: 'BANGARAPET JN.',
    fromCode: 'BWT',
    toName: 'KHARAGPUR',
    toCode: 'KGP',
    departTime: '11:35',
    departDate: 'Tue, 31 Mar 26',
    arriveTime: '17:00',
    arriveDate: 'Wed, 1 Apr 26',
    duration: '29h:25m',
    banner: 'Journey Completed',
    bannerTone: 'pink',
    summary: '2 Adult, 0 Child | SL | TATKAL | BANGARAPET',
    bookedOn: 'Mon, 30 Mar 26',
    primaryAction: 'Book Again',
    secondaryAction: 'Return Journey',
    passengers: [
      {
        name: 'B MAHADANDA',
        meta: 'Male | 24',
        bookingStatus: 'CNF/S1/53/MB',
        currentStatus: 'CNF/S1/53/MB',
      },
      {
        name: 'S L MAHADANDA',
        meta: 'Female | 26',
        bookingStatus: 'CNF/S1/54/UB',
        currentStatus: 'CNF/S1/54/UB',
      },
    ],
  },
  {
    id: '20802-ers',
    trainNo: '20802',
    trainName: 'MAGADH EXPRESS',
    pnr: '2253533673',
    fromName: 'NEW DELHI (NDLS)',
    fromCode: 'NDLS',
    toName: 'PATNA JN (PNBE)',
    toCode: 'PNBE',
    departTime: '21:05',
    departDate: '05-Apr-2026',
    arriveTime: '12:38',
    arriveDate: '06-Apr-2026',
    duration: '1000 KM',
    banner: 'Electronic Reservation Slip',
    bannerTone: 'blue',
    summary: '1 Adult, 0 Child | SL | TATKAL | NEW DELHI',
    bookedOn: '04-Apr-2026 11:05:58',
    primaryAction: 'Return Journey',
    secondaryAction: 'Refund Rules',
    passengers: [
      {
        name: 'M CHANDRA',
        meta: 'Male | 32',
        bookingStatus: 'CNF/S4/26/MIDDLE',
        currentStatus: 'CNF/S4/26/MIDDLE',
      },
    ],
    note: 'Quota: TATKAL (TQ) | Transaction ID: 100006487167939',
  },
  {
    id: '12381-ers',
    trainNo: '12381',
    trainName: 'POORVA EXPRESS',
    pnr: '6701460015',
    fromName: 'HOWRAH JN (HWH)',
    fromCode: 'HWH',
    toName: 'NEW DELHI (NDLS)',
    toCode: 'NDLS',
    departTime: '08:15',
    departDate: '01-Apr-2026',
    arriveTime: '06:05',
    arriveDate: '02-Apr-2026',
    duration: '1448 KM',
    banner: 'Electronic Reservation Slip',
    bannerTone: 'pink',
    summary: '1 Adult, 0 Child | 3A | TATKAL | HOWRAH JN',
    bookedOn: '31-Mar-2026 10:03:23',
    primaryAction: 'Book Again',
    secondaryAction: 'Return Journey',
    passengers: [
      {
        name: 'D SAHA',
        meta: 'Male | 22',
        bookingStatus: 'TQWL/1',
        currentStatus: 'TQWL/1',
      },
    ],
    note: 'Quota: TATKAL (TQ) | WL shown on ERS',
  },
];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PublicDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState<PublicFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TopTab>('feedback');
  const [helpOpen, setHelpOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const tabReveal = useReveal<HTMLDivElement>();
  const contentReveal = useReveal<HTMLDivElement>();

  const stats = useMemo(() => {
    const count = feedbacks.length;
    const avg =
      count === 0 ? 0 : feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / count;
    return { count, avg: Number(avg.toFixed(1)) };
  }, [feedbacks]);

  const pastTickets = useMemo(() => PAST_TICKETS, []);
  const visiblePastTickets = useMemo(
    () => (showAllTickets ? pastTickets : pastTickets.slice(0, 8)),
    [pastTickets, showAllTickets]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await feedbackAPI.publicList();
        setFeedbacks(res.data || []);
        setError('');
      } catch {
        setError('Failed to load public feedback');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (activeTab !== 'tickets') {
      setShowAllTickets(false);
    }
  }, [activeTab]);

  return (
    <div
      className="min-h-screen page"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(2,6,23,0.90), rgba(30,58,138,0.74)), url(${UNSPLASH_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-end items-center gap-3 mb-6">
          {isAuthenticated ? (
            <>
              <span className="text-white text-sm">Welcome, {user?.name || 'User'}</span>
              <Link
                to="/dashboard"
                className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-sm font-medium"
              >
                My Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-blue-200 hover:text-white border border-blue-200 hover:border-white px-3 py-1.5 rounded-md text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-gray-200 px-3 py-1.5 rounded-md text-sm">
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 ring-1 ring-white/15">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Railway Ticket Booking Agent System
            </h1>
            <p className="text-white/70 mt-1">
              Real feedback, transparent process, and verified confirmations.
            </p>
          </div>
        </div>

        <div
          ref={tabReveal.ref}
          className={`mb-8 glass-card rounded-2xl p-3 ${tabReveal.inView ? 'reveal in-view' : 'reveal'}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition press ${
                activeTab === 'feedback'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('service')}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition press ${
                activeTab === 'service'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Our Service
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition press ${
                activeTab === 'tickets'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Past Tickets
            </button>
          </div>
        </div>

        <div
          ref={contentReveal.ref}
          className={contentReveal.inView ? 'reveal in-view' : 'reveal'}
        >
          {activeTab === 'service' && (
            <div className="space-y-6">
              <div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2"
              >
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '60ms' }}>
                  <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <ShieldCheck className="w-5 h-5" />
                    Why use this service?
                  </div>
                  <ul className="text-white/80 text-sm space-y-2">
                    <li>- Agent-assisted booking with step-by-step tracking</li>
                    <li>- Manual payment verification for safer transactions</li>
                    <li>- Ticket/Bill shared only after secure process completion</li>
                    <li>- Verified feedback from real booking entries</li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '120ms' }}>
                  <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <Sparkles className="w-5 h-5" />
                    Public stats
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-white/70 text-sm">Feedback count</div>
                      <div className="text-white text-3xl font-extrabold">{stats.count}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/70 text-sm">Average rating</div>
                      <div className="text-white text-3xl font-extrabold flex items-center gap-2 justify-end">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        {stats.avg}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '180ms' }}>
                  <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <MessageSquare className="w-5 h-5" />
                    Before you login
                  </div>
                  <p className="text-white/80 text-sm">
                    Anyone can view public feedback (phone numbers stay masked). Login is only required
                    for booking and feedback submission.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '220ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Public Feedback</h2>
                <span className="text-white/70 text-sm">Phone numbers are masked</span>
              </div>

              {loading ? (
                <div className="py-4 space-y-3">
                  <div className="h-24 rounded-xl skeleton" />
                  <div className="h-24 rounded-xl skeleton" />
                  <div className="h-24 rounded-xl skeleton" />
                </div>
              ) : error ? (
                <div className="text-red-200 py-10 text-center">{error}</div>
              ) : feedbacks.length === 0 ? (
                <div className="text-white/70 py-10 text-center">No feedback yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedbacks.map((f, idx) => (
                    <div
                      key={f.id}
                      className="bg-white/10 rounded-2xl p-5 ring-1 ring-white/10 hover:ring-cyan-300/40 transition stagger-item"
                      style={{ animationDelay: `${260 + Math.min(idx, 10) * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={avatarUrl((f.userName || 'user') + (f.phone || ''))}
                          className="w-10 h-10 rounded-full bg-white/10"
                          alt="avatar"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-white font-semibold">{f.userName || 'User'}</div>
                            <div className="text-yellow-300 font-semibold flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {f.rating}
                            </div>
                          </div>
                          <div className="text-white/60 text-xs mt-0.5">
                            {f.phone} - {new Date(f.createdAt).toLocaleString()}
                          </div>
                          <div className="text-white/85 text-sm mt-3 whitespace-pre-wrap">{f.comment}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 stagger-item" style={{ animationDelay: '220ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <GalleryHorizontal className="w-5 h-5" />
                  Past Tickets
                </h2>
                <span className="text-white/70 text-sm">Updated from your shared ticket screenshots</span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {visiblePastTickets.map((ticket, idx) => (
                  <div
                    key={`${ticket.id}-${idx}`}
                    className="overflow-hidden rounded-[28px] bg-white/95 text-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.28)] ring-1 ring-sky-100/60"
                  >
                    <div className="h-3 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                            {ticket.trainNo}
                          </div>
                          <div className="text-lg font-bold leading-tight">{ticket.trainName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                            PNR
                          </div>
                          <div className="text-sm font-semibold text-sky-600">{ticket.pnr}</div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                        <div>
                          <div className="text-2xl font-extrabold text-slate-900">{ticket.departTime}</div>
                          <div className="text-xs text-slate-500">{ticket.departDate}</div>
                          <div className="mt-3 text-base font-bold leading-tight">{ticket.fromName}</div>
                          <div className="text-sm text-slate-500">{ticket.fromCode}</div>
                        </div>
                        <div className="pt-4 text-center text-xs font-semibold text-slate-400">
                          <div className="mb-1">-{ticket.duration}-</div>
                          <div className="h-px w-12 bg-slate-300" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-slate-900">{ticket.arriveTime}</div>
                          <div className="text-xs text-slate-500">{ticket.arriveDate}</div>
                          <div className="mt-3 text-base font-bold leading-tight">{ticket.toName}</div>
                          <div className="text-sm text-slate-500">{ticket.toCode}</div>
                        </div>
                      </div>

                      <div className="mt-5 flex justify-center">
                        <div
                          className={`min-w-[190px] rounded-full border px-4 py-2 text-center text-xs font-semibold ${
                            ticket.bannerTone === 'pink'
                              ? 'border-rose-100 bg-rose-50 text-rose-300'
                              : 'border-slate-300 bg-white text-sky-600'
                          }`}
                        >
                          {ticket.banner}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <div className="text-sm font-medium">{ticket.summary}</div>
                        <div className="text-xs text-slate-500">Booked on: {ticket.bookedOn}</div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                          {ticket.primaryAction}
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-400 bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-slate-50"
                        >
                          {ticket.secondaryAction}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 bg-white px-5 py-4">
                      <div className="mb-3 text-2xl font-bold leading-none text-slate-900">Passenger Details</div>
                      <div className="space-y-3">
                        {ticket.passengers.map((passenger) => (
                          <div
                            key={`${ticket.id}-${passenger.name}`}
                            className="grid grid-cols-1 gap-2 rounded-2xl bg-slate-50 px-4 py-3 md:grid-cols-[1.4fr_1fr_1fr]"
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{passenger.name}</div>
                              <div className="text-xs text-slate-500">{passenger.meta}</div>
                            </div>
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                Booking Status
                              </div>
                              <div className="text-sm font-semibold text-emerald-600">
                                {passenger.bookingStatus}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                Current Status
                              </div>
                              <div className="text-sm font-semibold text-emerald-600">
                                {passenger.currentStatus}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {ticket.note && <div className="mt-3 text-xs font-medium text-rose-500">{ticket.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
              {pastTickets.length > 8 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllTickets((prev) => !prev)}
                    className="rounded-full border border-cyan-300/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    {showAllTickets ? 'Show Less' : `Show More (${pastTickets.length - 8} more)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setHelpOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.55)] flex items-center justify-center hover:scale-105 transition press"
      >
        <BellRing className="w-6 h-6" />
        <span className="absolute -inset-2 rounded-full border-2 border-cyan-300/70 animate-ping" />
      </button>
      {helpOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-72 rounded-2xl bg-slate-900/90 border border-cyan-300/40 backdrop-blur p-4 text-white">
          <div className="font-semibold mb-2">Need Help?</div>
          <p className="text-sm text-white/80 mb-3">
            Use My Dashboard to track live booking status. Feedback unlocks secure document downloads.
          </p>
          <div className="flex gap-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="px-3 py-2 rounded-lg bg-cyan-400 text-slate-950 text-sm font-semibold"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Login'}
            </Link>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="px-3 py-2 rounded-lg border border-white/30 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
