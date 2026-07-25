import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  Maximize2, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Layout, 
  Grid, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Circle,
  Play,
  Square,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';

export const LiveCamera = () => {
  const [activeView, setActiveView] = useState<'grid' | 'single'>('grid');
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const cameras = [
    { id: 1, name: 'Main Entrance', status: 'Online', location: 'Gate 1', resolution: '4K' },
    { id: 2, name: 'Class 10A', status: 'Online', location: 'Academic Block', resolution: '1080p' },
    { id: 3, name: 'Playground', status: 'Online', location: 'Sports Area', resolution: '1080p' },
    { id: 4, name: 'Staff Room', status: 'Online', location: 'Admin Block', resolution: '1080p' },
    { id: 5, name: 'Library', status: 'Online', location: 'Academic Block', resolution: '1080p' },
    { id: 6, name: 'Computer Lab', status: 'Online', location: 'Science Block', resolution: '4K' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Live Campus Surveillance</h1>
          <p className="text-text-sub font-medium">Real-time monitoring of school premises and classrooms.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveView('grid')} className={`p-3 rounded-xl transition-all ${activeView === 'grid' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-text-sub hover:bg-slate-200'}`}><Grid size={20} /></button>
          <button onClick={() => setActiveView('single')} className={`p-3 rounded-xl transition-all ${activeView === 'single' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-text-sub hover:bg-slate-200'}`}><Layout size={20} /></button>
          <button onClick={() => setIsRecording(!isRecording)} className={`btn-primary flex items-center gap-2 ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}>
            {isRecording ? <Square size={18} fill="currentColor" /> : <Circle size={18} fill="currentColor" />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${activeView === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {cameras.map((cam) => (
          <Card key={cam.id} className="overflow-hidden group">
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Live: {cam.name}</p>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button className="p-2 bg-black/50 rounded-lg text-white/80 hover:text-white hover:bg-black/70 transition-all"><Maximize2 size={16} /></button>
                <button className="p-2 bg-black/50 rounded-lg text-white/80 hover:text-white hover:bg-black/70 transition-all"><Settings size={16} /></button>
              </div>
              <div className="flex flex-col items-center gap-4 opacity-40 group-hover:opacity-100 transition-all">
                <Video size={48} className="text-white" />
                <p className="text-xs font-bold text-white uppercase tracking-[0.2em]">Connecting Stream...</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                <div className="flex gap-2">
                  <button className="p-2 bg-black/50 rounded-lg text-white/80 hover:text-white"><Volume2 size={16} /></button>
                  <button className="p-2 bg-black/50 rounded-lg text-white/80 hover:text-white"><Mic size={16} /></button>
                </div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{cam.resolution}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <div>
                <p className="font-bold text-text-heading">{cam.name}</p>
                <p className="text-[10px] font-bold text-text-sub uppercase">{cam.location}</p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-primary"><ChevronRight size={20} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
