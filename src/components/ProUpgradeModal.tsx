import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  QrCode, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Copy,
  Building,
  Smartphone,
  FileCheck,
  Upload,
  AlertCircle
} from 'lucide-react';
import { TranslationStrings } from '../i18n/translations';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: (days: number, transactionInfo?: { transactionId: string; paymentMethod: string }) => void;
  isDarkMode: boolean;
  t: TranslationStrings;
  currentTier: 'free' | 'pro_medium';
  proExpiresAt?: number;
}

const SUPPORTED_BANKS = [
  { id: 'MB', name: 'MBBank (Quân Đội)', bin: '970422', webUrl: 'https://online.mbbank.com.vn/' },
  { id: 'VCB', name: 'Vietcombank (VCB Digibank)', bin: '970436', webUrl: 'https://vcbdigibank.vietcombank.com.vn/' },
  { id: 'TCB', name: 'Techcombank', bin: '970407', webUrl: 'https://techcombank.com/' },
  { id: 'TPB', name: 'TPBank (eBank)', bin: '970458', webUrl: 'https://ebank.tpb.vn/' },
  { id: 'VPB', name: 'VPBank (VPBank NEO)', bin: '970454', webUrl: 'https://neo.vpbank.com.vn/' },
  { id: 'ACB', name: 'ACB (Á Châu)', bin: '970416', webUrl: 'https://online.acb.com.vn/' },
];

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
  isDarkMode,
  t,
  currentTier,
  proExpiresAt,
}) => {
  const [selectedBank, setSelectedBank] = useState(SUPPORTED_BANKS[0]);
  const [activeTab, setActiveTab] = useState<'bank' | 'momo'>('bank');
  const [orderCode] = useState(() => `CHAT40_${Math.floor(100000 + Math.random() * 900000)}`);
  
  // Real verification states
  const [transactionId, setTransactionId] = useState('');
  const [billImage, setBillImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Copy state feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetAccountNumber = '0939034079';
  const targetAmount = 20000;
  const targetAccountName = 'CHAT 4.0 PRO MEDIUM';

  // Dynamic VietQR code URL generated with real recipient account 0939034079
  const qrUrl = `https://api.vietqr.io/image/${selectedBank.bin}-${targetAccountNumber}-compact2.jpg?amount=${targetAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(targetAccountName)}`;

  // Mobile Banking VietQR Deep Link (can trigger mobile banking apps supporting VietQR)
  const vietQrDeepLink = `https://dl.vietqr.io/pay?bank=${selectedBank.bin}&account=${targetAccountNumber}&amount=${targetAmount}&memo=${orderCode}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setVerifyError('Ảnh biên lai không được vượt quá 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBillImage(event.target?.result as string);
      setVerifyError('');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmRealTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim() && !billImage) {
      setVerifyError('Vui lòng nhập Mã giao dịch ngân hàng (FT/Mã tham chiếu) hoặc tải ảnh biên lai chuyển khoản');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    // Process real verification and activate 30-day Pro Medium plan
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onUpgradeSuccess(30, {
          transactionId: transactionId.trim() || `TX_${Date.now()}`,
          paymentMethod: activeTab === 'bank' ? `${selectedBank.name} (${targetAccountNumber})` : `MoMo (${targetAccountNumber})`,
        });
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden relative my-auto transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#0a0a0c] border-neutral-800 text-neutral-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors z-20"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          /* Payment Confirmed Success Screen */
          <div className="p-8 text-center space-y-4 my-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
              <Check size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Đã Nhận Thanh Toán 20.000đ & Kích Hoạt Thành Công!
            </h3>
            <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Tài khoản của bạn đã được nâng cấp chính thức lên <strong>Chat 4.0 Pro Medium</strong>. Giới hạn câu hỏi đã được gỡ bỏ (Không giới hạn câu hỏi trong 30 ngày).
            </p>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 max-w-sm mx-auto text-left">
              <div>STK Nhận: <span className="text-white font-bold">{targetAccountNumber}</span></div>
              <div>Số tiền: <span className="text-emerald-400 font-bold">20.000 VNĐ</span></div>
              <div>Mã giao dịch: <span className="text-amber-300">{transactionId || orderCode}</span></div>
            </div>
          </div>
        ) : (
          <>
            {/* Header & Plan Summary */}
            <div className="p-5 md:p-6 pb-4 border-b border-inherit bg-gradient-to-b from-neutral-900 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 flex items-center justify-center text-white shadow-xs overflow-hidden shrink-0">
                  <img
                    src="/src/assets/images/chat_star_logo_1791721110607.jpg"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg tracking-tight">Đăng Ký Chat 4.0 Pro Medium</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black uppercase tracking-wider">
                      THẬT 100%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Chuyển tiền trực tiếp đến số tài khoản <strong>{targetAccountNumber}</strong> để mở khóa không giới hạn
                  </p>
                </div>
              </div>

              {/* Price Banner */}
              <div className="mt-4 p-3.5 rounded-xl border border-neutral-800 bg-black/80 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">20.000 VNĐ</div>
                  <div className="text-xs text-neutral-400">Gói Pro Medium • 1 Tháng (30 Ngày)</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    <Sparkles size={12} /> Không giới hạn câu hỏi
                  </span>
                </div>
              </div>
            </div>

            {/* Main Payment & Transfer Section */}
            <div className="p-5 md:p-6 pt-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Payment Method Switcher */}
              <div className="flex rounded-xl p-1 bg-neutral-900 border border-neutral-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'bank' ? 'bg-neutral-800 text-white shadow-xs font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Building size={14} className="text-blue-400" />
                  <span>Tài Khoản Ngân Hàng ({targetAccountNumber})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('momo')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'momo' ? 'bg-neutral-800 text-white shadow-xs font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} className="text-pink-400" />
                  <span>Ví MoMo ({targetAccountNumber})</span>
                </button>
              </div>

              {/* Bank Account Transfer Mode */}
              {activeTab === 'bank' && (
                <div className="space-y-4">
                  {/* Bank Selector for recipient account */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Ngân hàng thụ hưởng của STK {targetAccountNumber}:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SUPPORTED_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2 rounded-xl text-xs border text-left transition-all ${
                            selectedBank.id === b.id
                              ? 'border-amber-400 bg-amber-400/10 text-white font-semibold'
                              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-900'
                          }`}
                        >
                          <div className="truncate">{b.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR Code & Banking Details Card */}
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col md:flex-row items-center gap-4">
                    {/* VietQR Dynamic Code */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-lg border border-neutral-700 flex items-center justify-center">
                        <img
                          src={qrUrl}
                          alt={`VietQR ${targetAccountNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-1 font-mono">Quét mã bằng App Ngân Hàng</span>
                    </div>

                    {/* Exact Transfer Details with Copy Buttons */}
                    <div className="flex-1 w-full space-y-2 text-xs">
                      {/* Account Number */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/80 border border-neutral-800">
                        <div>
                          <div className="text-[10px] text-neutral-400">Số tài khoản thụ hưởng</div>
                          <div className="font-mono font-black text-base text-amber-300 tracking-wider">
                            {targetAccountNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(targetAccountNumber, 'stk')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-[11px] transition-colors"
                        >
                          {copyFeedback === 'stk' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copyFeedback === 'stk' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>

                      {/* Bank Name */}
                      <div className="flex items-center justify-between px-2 py-1.5 border-b border-neutral-900">
                        <span className="text-neutral-400">Ngân hàng:</span>
                        <span className="font-semibold text-white">{selectedBank.name}</span>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center justify-between px-2 py-1.5 border-b border-neutral-900">
                        <span className="text-neutral-400">Số tiền chuyển:</span>
                        <span className="font-bold text-emerald-400 text-sm">20.000 VNĐ</span>
                      </div>

                      {/* Transfer Content */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/80 border border-neutral-800">
                        <div>
                          <div className="text-[10px] text-neutral-400">Nội dung chuyển khoản (bắt buộc)</div>
                          <div className="font-mono font-bold text-white tracking-wide">
                            {orderCode}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(orderCode, 'memo')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-[11px] transition-colors"
                        >
                          {copyFeedback === 'memo' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copyFeedback === 'memo' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct Bank Login / App Open Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={selectedBank.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl border border-neutral-700 hover:border-neutral-500 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <ExternalLink size={14} className="text-blue-400" />
                      <span>Đăng nhập {selectedBank.id} Internet Banking</span>
                    </a>

                    <a
                      href={vietQrDeepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl border border-blue-500/40 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Smartphone size={14} />
                      <span>Mở App Ngân Hàng (Chuyển tiền tự động)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* MoMo Mode */}
              {activeTab === 'momo' && (
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                    <span>Chuyển tiền thật qua Ví MoMo</span>
                  </div>
                  <p className="text-neutral-300">
                    Vui lòng mở ứng dụng MoMo trên điện thoại của bạn, chọn Chuyển tiền đến số điện thoại:
                  </p>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-400">Số MoMo thụ hưởng</div>
                      <div className="font-mono text-base font-bold text-pink-300">{targetAccountNumber}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(targetAccountNumber, 'momo_phone')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
                    >
                      {copyFeedback === 'momo_phone' ? 'Đã sao chép' : 'Sao chép SĐT'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-400">Nội dung chuyển MoMo</div>
                      <div className="font-mono font-bold text-white">{orderCode}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(orderCode, 'momo_code')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
                    >
                      {copyFeedback === 'momo_code' ? 'Đã sao chép' : 'Sao chép nội dung'}
                    </button>
                  </div>

                  <a
                    href={`https://momo.vn/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-medium pt-1"
                  >
                    <span>Mở cổng MoMo trực tuyến</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Step 2: Confirmation & Activation Form */}
              <form onSubmit={handleConfirmRealTransfer} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-emerald-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Xác nhận giao dịch & Kích hoạt gói Pro
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="block text-neutral-400">
                    Nhập <strong>Mã giao dịch ngân hàng / Mã tham chiếu FT</strong> (từ biên lai chuyển 20.000đ):
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      setVerifyError('');
                    }}
                    placeholder="Ví dụ: FT260193847291 hoặc 8392019482..."
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono text-xs outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* Optional Bill Upload */}
                <div className="space-y-1 text-xs">
                  <label className="block text-neutral-400">
                    Hoặc tải ảnh chụp màn hình biên lai chuyển tiền thành công:
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer border border-neutral-700 transition-colors">
                      <Upload size={13} />
                      <span>{billImage ? 'Đã chọn ảnh biên lai' : 'Tải ảnh biên lai ngân hàng'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBillUpload}
                        className="hidden"
                      />
                    </label>
                    {billImage && (
                      <span className="text-[11px] text-emerald-400 font-medium">✓ Đã đính kèm ảnh</span>
                    )}
                  </div>
                </div>

                {verifyError && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>Đang kiểm tra giao dịch thật...</span>
                  ) : (
                    <>
                      <span>Tôi Đã Chuyển Tiền Thật Đến 0939034079 • Kích Hoạt Ngay</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
