import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileBarChart, Download } from 'lucide-react';
import { toast } from 'sonner';

const Statements = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const handleExport = () => {
    toast.success('Statement export initiated', {
      description: `Period: ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">Statement</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FileBarChart className="w-10 h-10 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Account statement</h2>
          <p className="text-sm text-muted-foreground">
            Get a record of your account transactions and trading activities.
          </p>
        </div>

        <div className="w-full space-y-2">
          <label className="text-xs text-muted-foreground">Select period</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-secondary/50 border-border/50 h-12 text-foreground"
          />
        </div>

        <Button onClick={handleExport} className="w-full h-12 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 gap-2">
          <Download className="w-5 h-5" /> EXPORT PDF
        </Button>
      </div>
    </div>
  );
};

export default Statements;
