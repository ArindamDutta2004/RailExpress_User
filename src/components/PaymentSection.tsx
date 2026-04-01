import { CreditCard, QrCode } from 'lucide-react';
import sumanQr from '../assets/suman-qr.png';
import arindamQr from '../assets/arindam-qr.png';
import debjitQr from '../assets/debjit-qr.png';
import { bookingAPI } from '../services/api';
import { useState } from 'react';

interface PaymentSectionProps {
  bookingId: string;
  amount?: number;
  type: 'advance' | 'final';
  onPaymentSuccess: () => void;
  userMarkedPaid?: boolean;
  qrOwner?: 'suman' | 'debjit' | 'arindam' | null;
}

const PaymentSection = ({ bookingId, amount, type, onPaymentSuccess, userMarkedPaid, qrOwner }: PaymentSectionProps) => {
  const [submitting, setSubmitting] = useState(false);
  const title = type === 'advance' ? 'Advance Payment' : 'Final Payment';
  const bgColor = type === 'advance' ? 'bg-white/85' : 'bg-white/85';
  const borderColor = type === 'advance' ? 'border-white/40' : 'border-white/40';
  const normalizedOwner = (qrOwner || '').toLowerCase();
  const ownerLabel =
    normalizedOwner === 'debjit'
      ? 'Debjit'
      : normalizedOwner === 'arindam'
        ? 'Arindam'
        : normalizedOwner === 'suman'
          ? 'Suman'
          : null;
  const selectedQr =
    normalizedOwner === 'arindam'
      ? arindamQr
      : normalizedOwner === 'debjit'
        ? debjitQr
        : normalizedOwner === 'suman'
          ? sumanQr
          : null;

  if (!amount) {
    return (
      <div className={`${bgColor} border ${borderColor} rounded-xl p-4`}>
        <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
        <p className="text-sm text-slate-700">
          Payment information will be available once the previous step is completed.
        </p>
      </div>
    );
  }

  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-5 h-5 text-slate-700" />
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>

      <div className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-700">Amount to Pay:</span>
          <span className="text-2xl font-bold text-slate-900">₹{amount}</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <QrCode className="w-4 h-4" />
            <span>
              Scan QR Code to Pay{ownerLabel ? ` (QR: ${ownerLabel})` : ''}
            </span>
          </div>

          {selectedQr ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <img
                src={selectedQr}
                alt={`${type} payment QR code`}
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              Payment QR is not assigned yet by agent. Please wait for agent selection.
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-700 space-y-1">
        <p>1. Scan the QR code using any UPI app</p>
        <p>2. Complete the payment</p>
        <p>3. Wait for admin verification</p>
        <p>4. Your booking will be updated automatically</p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          disabled={submitting || !!userMarkedPaid || !selectedQr || !ownerLabel}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed press"
          onClick={async () => {
            try {
              setSubmitting(true);
              await bookingAPI.markPaymentDone(bookingId, type);
              onPaymentSuccess();
            } catch {
              // Keep UI simple; booking card refresh will show latest state on success.
              alert('Unable to mark payment done. Please try again.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {userMarkedPaid ? 'Payment Marked - Waiting Admin Verification' : submitting ? 'Submitting...' : 'I Paid'}
        </button>
      </div>
    </div>
  );
};

export default PaymentSection;
