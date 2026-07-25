import React from 'react';
import { Upload } from 'lucide-react';

export const FileUpload = ({ label, icon: Icon = Upload, required = false, onChange, preview }: any) => (
  <div className="w-full">
    <label className="label-text">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={onChange}
      />
      <div className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl group-hover:border-primary group-hover:bg-primary/5 transition-all overflow-hidden min-h-[120px]">
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-20 w-auto object-contain rounded-lg" referrerPolicy="no-referrer" />
        ) : (
          <>
            <Icon className="text-slate-400 group-hover:text-primary" size={24} />
            <span className="text-xs text-text-secondary group-hover:text-primary">Click or drag to upload</span>
          </>
        )}
      </div>
    </div>
  </div>
);
