'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

export default function AfterActionReport() {
  const [isOpen, setIsOpen] = useState(false);
  const incident = useSimulationStore(state => state.incident);
  const approvedStrats = incident.strategies.filter(s => s.status === 'approved');

  const generateAAR = () => {
    // Simulated JSON download trigger
    const aar = {
      incidentId: incident.id,
      title: incident.title,
      clearanceMetrics: {
        originalEstimate: '90m',
        currentEstimate: `${incident.estimatedClearance}m`,
      },
      approvedActions: approvedStrats.map(s => s.name),
      timeline: incident.timeline
    };
    
    const blob = new Blob([JSON.stringify(aar, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Incident_AAR_${incident.id}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-medium text-neutral-300 py-1 px-2 rounded border border-neutral-700 transition-colors">
        <Download size={12} />
        Export AAR
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-100">
            <FileText size={18} className="text-cyan-400" />
            After-Action Report (AAR)
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Review and export the system-generated command report before closing the incident.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="bg-neutral-950 p-3 rounded border border-neutral-800/50">
             <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Event Summary</h4>
             <p className="text-xs font-medium text-neutral-300 mb-1">{incident.id} - {incident.title}</p>
             <p className="text-[11px] text-neutral-400">Time to Clearance: <span className="text-green-400 font-mono">{(90 - incident.estimatedClearance)}m Saved</span></p>
          </div>

          <div className="bg-neutral-950 p-3 rounded border border-neutral-800/50">
             <h4 className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Executed Strategies</h4>
             {approvedStrats.length > 0 ? (
               <ul className="flex flex-col gap-2">
                 {approvedStrats.map(s => (
                   <li key={s.id} className="text-[11px] text-neutral-300 flex items-center gap-2">
                     <CheckCircle2 size={12} className="text-green-500" /> {s.name}
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-[11px] text-neutral-500 italic">No automated strategies enacted.</p>
             )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="bg-neutral-950 border-neutral-800 text-neutral-400 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={generateAAR} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs">
            Download JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
