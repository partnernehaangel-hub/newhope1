import React from 'react';

export const Select = ({ label, options, required = false, ...props }: any) => (
  <div className="w-full">
    <label className="label-text">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select className="input-field" {...props}>
      <option value="">Select {label}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
