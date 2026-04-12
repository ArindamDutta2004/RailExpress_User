import { useEffect, useMemo, useState } from 'react';
import { MapPin, Calendar, User, Phone, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PaymentSection from './PaymentSection';
import FeedbackSection from './FeedbackSection';
import { BACKEND_BASE, bookingAPI } from '../services/api';

interface Booking {
  _id: string;
  fromStation: string;
  toStation: string;
  journeyDate: string;
  passengerName: string;
  dateOfBirth: string;
  bookingType: 'tatkal' | 'reservation';
  age: number;
  phone: string;
  passengers: number;
  passengerDetails?: Array<{ name: string; dateOfBirth: string; age: number }>;
  preferredTrains?: string[];
  statusPhase1: string;
  statusPhase2: string;
  paymentStatus: string;
  currentStep: number;
  advanceAmount?: number;
  remainingAmount?: number;
  totalAmount?: number;
  advanceQR?: string;
  finalQR?: string;
  advanceQROwner?: 'suman' | 'debjit' | 'arindam' | null;
  finalQROwner?: 'suman' | 'debjit' | 'arindam' | null;
  advanceUserMarkedPaid?: boolean;
  finalUserMarkedPaid?: boolean;
  ticketPDF?: string;
  billPDF?: string;
  refundQRProof?: string;
  refundVerificationStatus?: 'pending' | 'verified' | 'processed';
  refundProofScreenshot?: string;
  feedbackSubmitted?: boolean;
  createdAt: string;
}

interface BookingCardProps {
  booking: Booking;
  onUpdate: () => void;
}

const BookingCard = ({ booking, onUpdate }: BookingCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [refundFile, setRefundFile] = useState<File | null>(null);
  const [refundUploading, setRefundUploading] = useState(false);
  const [docDownloading, setDocDownloading] = useState<'ticket' | 'bill' | null>(null);
  const localFeedbackKey = useMemo(() => `feedbackSubmitted:${booking._id}`, [booking._id]);
  const [localFeedbackSubmitted, setLocalFeedbackSubmitted] = useState(false);

  useEffect(() => {
    try {
      setLocalFeedbackSubmitted(localStorage.getItem(localFeedbackKey) === 'true');
    } catch (_err) {
      setLocalFeedbackSubmitted(false);
    }
  }, [localFeedbackKey]);

  const normalizeUploadUrl = (url?: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // Backend saves as `/uploads/<file>.pdf` but some records may omit the leading `/`.
    const idxAbs = url.indexOf('/uploads/');
    if (idxAbs !== -1) return `${BACKEND_BASE}${url.slice(idxAbs)}`;

    const idxAbs2 = url.indexOf('/uploads');
    if (idxAbs2 !== -1) return `${BACKEND_BASE}${url.slice(idxAbs2)}`;

    const idxRel = url.indexOf('uploads/');
    if (idxRel !== -1) return `${BACKEND_BASE}/${url.slice(idxRel)}`;

    return url;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'done':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStepLabel = (step: number) => {
    const steps = [
      'Booking Created',
      'Admin Approval Pending',
      'Admin Approved',
      'Advance Payment Pending',
      'Advance Payment Done',
      'Ticket Generation Pending',
      'Ticket Generated',
      'Final Payment Pending',
      'Final Payment Done',
      'Booking Completed'
    ];
    return steps[step] || `Step ${step}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const showAdvancePayment = booking.currentStep === 5 || (booking.currentStep === 4 && !!booking.advanceAmount);
  const showTicketDownload = !!booking.ticketPDF || !!booking.billPDF;
  const showFinalPayment =
    booking.currentStep === 7 &&
    booking.statusPhase2 === 'booking done' &&
    (booking.remainingAmount || 0) > 0;
  const isFeedbackSubmitted = Boolean(booking.feedbackSubmitted || localFeedbackSubmitted);
  const showFeedback = booking.paymentStatus === 'completed' && !isFeedbackSubmitted;
  const showRefundUpload =
    booking.statusPhase1 === 'cancelled' || booking.paymentStatus === 'cancelled';

  const handleRefundUpload = async () => {
    if (!refundFile) return;
    setRefundUploading(true);
    try {
      await bookingAPI.uploadRefundQR(booking._id, refundFile);
      setRefundFile(null);
      onUpdate();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to upload refund QR';
      alert(msg);
    } finally {
      setRefundUploading(false);
    }
  };

  const handleDocumentDownload = async (type: 'ticket' | 'bill') => {
    if (docDownloading) return;
    setDocDownloading(type);
    try {
      const response = await bookingAPI.downloadDocument(booking._id, type);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${type}-${booking._id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      let msg = `Failed to download ${type} document`;
      const fallbackPath = type === 'ticket' ? booking.ticketPDF : booking.billPDF;
      const responseData = (err as { response?: { data?: unknown } })?.response?.data;
      const responseStatus = (err as { response?: { status?: number } })?.response?.status;
      if (responseData && typeof responseData === 'object' && 'message' in (responseData as Record<string, unknown>)) {
        msg = String((responseData as { message?: string }).message || msg);
      } else if (typeof Blob !== 'undefined' && responseData instanceof Blob) {
        try {
          const text = await responseData.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) msg = String(parsed.message);
        } catch (_e) {
          // Keep fallback message.
        }
      }

      const allowFallback =
        isFeedbackSubmitted &&
        Boolean(fallbackPath) &&
        [404, 500, 502, 503].includes(Number(responseStatus || 0));

      if (allowFallback) {
        try {
          const fallbackResponse = await fetch(normalizeUploadUrl(fallbackPath) || '', {
            credentials: 'include',
          });
          if (!fallbackResponse.ok) {
            throw new Error(`Fallback failed with status ${fallbackResponse.status}`);
          }
          const fallbackBlob = await fallbackResponse.blob();
          const fallbackUrl = window.URL.createObjectURL(fallbackBlob);
          const fallbackAnchor = document.createElement('a');
          fallbackAnchor.href = fallbackUrl;
          fallbackAnchor.download = `${type}-${booking._id}.pdf`;
          document.body.appendChild(fallbackAnchor);
          fallbackAnchor.click();
          fallbackAnchor.remove();
          window.URL.revokeObjectURL(fallbackUrl);
          return;
        } catch (_fallbackError) {
          // Show original message if fallback also fails.
        }
      }

      alert(msg);
    } finally {
      setDocDownloading(null);
    }
  };

  return (
    <div className="glass-card hover-glow rounded-2xl overflow-hidden">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-white/90" />
              <span className="font-semibold text-white">
                {booking.fromStation} → {booking.toStation}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="w-4 h-4 text-white/80" />
              <span>{formatDate(booking.journeyDate)}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(booking.paymentStatus)}`}>
            {getStatusIcon(booking.paymentStatus)}
            {booking.paymentStatus}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-white/80">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{booking.passengerName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <span>{booking.phone}</span>
          </div>          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{booking.passengers} passenger(s)</span>
          </div>        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(booking.currentStep / 9) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium text-white/80">
            {Math.round((booking.currentStep / 9) * 100)}%
          </span>
        </div>

        <div className="mt-2 text-xs text-white/70">
          {getStepLabel(booking.currentStep)}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/15 bg-black/10 p-4 space-y-4">
          <div className="bg-white/85 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-medium">{booking.age}</span>
            </div>
            <div>
              <span className="text-gray-600">DOB:</span>
              <span className="ml-2 font-medium">{formatDate(booking.dateOfBirth)}</span>
            </div>
            <div>
              <span className="text-gray-600">Booking Type:</span>
              <span className="ml-2 font-medium uppercase">{booking.bookingType}</span>
            </div>
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-medium">{new Date(booking.createdAt).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-gray-600">Current Step:</span>
              <span className="ml-2 font-medium">{booking.currentStep}</span>
            </div>
            <div>
              <span className="text-gray-600">Phase 1:</span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getStatusColor(booking.statusPhase1)}`}>
                {booking.statusPhase1}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Phase 2:</span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getStatusColor(booking.statusPhase2)}`}>
                {booking.statusPhase2}
              </span>
            </div>
            {!!booking.preferredTrains?.length && (
              <div className="col-span-2">
                <span className="text-gray-600">Preferred Trains:</span>
                <ul className="mt-1 list-disc list-inside text-sm text-slate-800">
                  {booking.preferredTrains.map((train, idx) => (
                    <li key={`preferred-train-${idx}`}>{train}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {showAdvancePayment && (
            <PaymentSection
              bookingId={booking._id}
              amount={booking.advanceAmount}
              type="advance"
              onPaymentSuccess={onUpdate}
              userMarkedPaid={booking.advanceUserMarkedPaid}
              qrOwner={booking.advanceQROwner || null}
            />
          )}

          {showTicketDownload && (
            <div className="bg-white/85 rounded-xl p-4 border border-white/40">
              <h4 className="font-semibold text-slate-900 mb-3">Download Documents</h4>
              {!isFeedbackSubmitted && (
                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                  Submit feedback first to unlock ticket/bill downloads.
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {booking.ticketPDF && (
                  <button
                    type="button"
                    onClick={() => handleDocumentDownload('ticket')}
                    disabled={!isFeedbackSubmitted || docDownloading !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center text-sm press"
                  >
                    {docDownloading === 'ticket' ? 'Downloading...' : 'Download Ticket'}
                  </button>
                )}
                {booking.billPDF && (
                  <button
                    type="button"
                    onClick={() => handleDocumentDownload('bill')}
                    disabled={!isFeedbackSubmitted || docDownloading !== null}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm press"
                  >
                    {docDownloading === 'bill' ? 'Downloading...' : 'Download Bill'}
                  </button>
                )}
              </div>
            </div>
          )}

          {showFinalPayment && (
            <PaymentSection
              bookingId={booking._id}
              amount={booking.remainingAmount}
              type="final"
              onPaymentSuccess={onUpdate}
              userMarkedPaid={booking.finalUserMarkedPaid}
              qrOwner={booking.finalQROwner || booking.advanceQROwner || null}
            />
          )}

          {showFeedback && (
            <FeedbackSection
              bookingId={booking._id}
              phone={booking.phone}
              alreadySubmitted={isFeedbackSubmitted}
              onFeedbackSuccess={() => {
                try {
                  localStorage.setItem(localFeedbackKey, 'true');
                } catch (_err) {
                  // Ignore localStorage errors.
                }
                setLocalFeedbackSubmitted(true);
                onUpdate();
              }}
            />
          )}

          {showRefundUpload && (
            <div className="bg-white/85 rounded-xl p-4 border border-white/40">
              <h4 className="font-semibold text-slate-900 mb-2">Refund / Return Money (Cancelled Ticket)</h4>
              <p className="text-sm text-slate-700">
                Upload your payment QR/screenshot. Refund will be done in 1-2 days. If not received, contact{' '}
                <span className="font-semibold">8942938405 / 9531760624</span> or email{' '}
                <span className="font-semibold">sumankhan2909@gmail.com</span>.
              </p>

              <div className="mt-3 flex flex-col md:flex-row gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRefundFile(e.target.files?.[0] || null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRefundUpload}
                  disabled={!refundFile || refundUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed press"
                >
                  {refundUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              {booking.refundQRProof && (
                <div className="mt-3">
                  <div className="text-xs text-slate-600 mb-2">Uploaded proof:</div>
                  <a
                    href={normalizeUploadUrl(booking.refundQRProof)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:underline"
                  >
                    View uploaded QR/proof
                  </a>
                </div>
              )}
              {booking.refundVerificationStatus && (
                <div className="mt-3 text-xs">
                  <span className="text-slate-600">Refund status: </span>
                  <span className="font-semibold uppercase tracking-wide">
                    {booking.refundVerificationStatus}
                  </span>
                </div>
              )}
              {booking.refundProofScreenshot && (
                <div className="mt-2">
                  <a
                    href={normalizeUploadUrl(booking.refundProofScreenshot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-700 hover:underline"
                  >
                    View admin refund proof
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
