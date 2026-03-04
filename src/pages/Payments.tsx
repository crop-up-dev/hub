import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { getUserTransactions, type TransactionRequest } from '@/lib/transactions';
import { formatNumber } from '@/lib/trading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CreditCard, Building2, Clock, CheckCircle2, XCircle, X, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const DEPOSIT_AMOUNTS = [250, 750, 2000];

const Payments = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderFirst, setCardholderFirst] = useState('');
  const [cardholderLast, setCardholderLast] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [depositMethod, setDepositMethod] = useState<'card' | 'wallet'>('card');

  const userTxns = currentUser ? getUserTransactions(currentUser.id) : [];

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-trading-green" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-trading-red" />;
    return <Clock className="w-4 h-4 text-primary animate-pulse" />;
  };

  const statusColor = (status: string) => {
    if (status === 'approved') return 'text-trading-green';
    if (status === 'rejected') return 'text-trading-red';
    return 'text-primary';
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return toast.error('Enter a valid amount');
    if (depositMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) return toast.error('Enter a valid card number');
      if (!expiryDate) return toast.error('Enter expiry date');
      if (!cvv || cvv.length < 3) return toast.error('Enter CVV');
    }
    toast.success('Deposit request submitted for approval', {
      description: `$${depositAmount} via ${depositMethod === 'card' ? 'Credit/Debit Card' : 'Crypto Wallet'}`,
    });
    setDepositAmount('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return toast.error('Enter a valid amount');
    toast.success('Withdrawal request submitted for approval', {
      description: `$${withdrawAmount} via Bank Transfer`,
    });
    setWithdrawAmount('');
    setWithdrawReason('');
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const tabs = [
    { key: 'deposit' as const, label: 'Deposit' },
    { key: 'withdraw' as const, label: 'Withdrawal' },
    { key: 'history' as const, label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">Payments</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            {/* Payment method selector */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setDepositMethod('card')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border min-w-[120px] transition-all ${
                  depositMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <CreditCard className="w-8 h-8 text-foreground" />
                <span className="text-xs font-medium text-foreground">Credit or Debit Card</span>
              </button>
              <button
                onClick={() => setDepositMethod('wallet')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border min-w-[120px] transition-all ${
                  depositMethod === 'wallet'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Wallet className="w-8 h-8 text-foreground" />
                <span className="text-xs font-medium text-foreground">Crypto Wallet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Amount */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {depositMethod === 'card' ? 'Secure deposit using credit card' : 'Deposit via crypto wallet'}
                </h3>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Amount</label>
                  <Input
                    type="number"
                    placeholder="Or type your amount here"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="bg-secondary/50 border-border/50 h-11"
                  />
                </div>
                <div className="flex gap-2">
                  {DEPOSIT_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(String(amt))}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                        depositAmount === String(amt)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                      }`}
                    >
                      $ {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Card details */}
              {depositMethod === 'card' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Credit or Debit Card Details</h3>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Add a New Card</label>
                    <Input
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      className="bg-secondary/50 border-border/50 h-11 font-mono"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Expiry Date</label>
                      <Input
                        placeholder="mm/yy"
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                        className="bg-secondary/50 border-border/50 h-11 font-mono"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">CVV</label>
                      <Input
                        type="password"
                        placeholder="***"
                        value={cvv}
                        onChange={e => setCvv(e.target.value)}
                        className="bg-secondary/50 border-border/50 h-11 font-mono"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Cardholder</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Name</label>
                        <Input
                          placeholder="First name"
                          value={cardholderFirst}
                          onChange={e => setCardholderFirst(e.target.value)}
                          className="bg-secondary/50 border-border/50 h-10"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Last name</label>
                        <Input
                          placeholder="Last name"
                          value={cardholderLast}
                          onChange={e => setCardholderLast(e.target.value)}
                          className="bg-secondary/50 border-border/50 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleDeposit} className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              Deposit
            </Button>
          </div>
        )}

        {/* Withdrawal Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Please notice that withdrawal fees may apply to your request according to the company Withdrawal policy.
              </p>
            </div>

            <div className="text-center space-y-2">
              <label className="text-sm text-muted-foreground">Amount</label>
              <div className="flex justify-center">
                <Input
                  type="number"
                  placeholder="$ 0"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="bg-transparent border-0 border-b border-border rounded-none text-center text-3xl font-bold font-mono h-16 w-64 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Available: <span className="font-mono font-medium text-foreground">$ 0.00</span>
              </p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Reason (optional)</label>
              <textarea
                placeholder="Reason (optional)"
                value={withdrawReason}
                onChange={e => setWithdrawReason(e.target.value)}
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button onClick={handleWithdraw} className="w-full h-12 text-base font-semibold bg-foreground text-background hover:bg-foreground/90">
              Get my money
            </Button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {userTxns.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No transaction history</p>
              </div>
            ) : (
              userTxns.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-4 rounded-xl border border-border/30 hover:bg-accent/20 transition-all">
                  <div className="flex items-center gap-3">
                    {statusIcon(txn.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {txn.type === 'send' ? 'Withdrawal' : 'Deposit'} • {txn.asset}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleString()}
                      </p>
                      <p className={`text-xs font-medium capitalize ${statusColor(txn.status)}`}>
                        {txn.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-foreground">
                      ${formatNumber(txn.amount, 2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
