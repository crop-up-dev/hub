import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Home, CreditCard, ChevronDown, ChevronUp, Upload, CheckCircle2 } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'complete' | 'incomplete';
  count: number;
}

const Documents = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sections: DocSection[] = [
    { id: 'identity', title: 'Proof of identity upload', icon: <FileText className="w-5 h-5 text-muted-foreground" />, status: 'incomplete', count: 0 },
    { id: 'residence', title: 'Proof of residence upload', icon: <Home className="w-5 h-5 text-muted-foreground" />, status: 'incomplete', count: 0 },
    { id: 'payment', title: 'Payment documents', icon: <CreditCard className="w-5 h-5 text-muted-foreground" />, status: 'incomplete', count: 0 },
    { id: 'other', title: 'Other documents', icon: <FileText className="w-5 h-5 text-muted-foreground" />, status: 'incomplete', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">Documents</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <p className="text-sm text-muted-foreground text-center leading-relaxed px-4">
          Providing proof of your identity and residence is obligatory for regulatory purposes.
          Please, make sure your documents' photos are in color, not blurred, cut out, or damaged in any way.
          A confirmation email will be sent as soon as we verify your documents.
        </p>

        <div className="space-y-3 mt-6">
          {sections.map(section => (
            <div key={section.id} className="border border-border/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${section.status === 'complete' ? 'text-trading-green' : 'text-primary'}`}>
                    {section.status === 'complete' ? 'Complete' : 'Incomplete'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{section.count}</span>
                  {expandedId === section.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expandedId === section.id && (
                <div className="px-4 pb-4 border-t border-border/30">
                  <div className="mt-4 flex flex-col items-center gap-3 py-8 border-2 border-dashed border-border/50 rounded-xl">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag & drop files here or click to upload</p>
                    <Button variant="outline" size="sm">Choose File</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documents;
