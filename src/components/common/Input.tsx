import React from 'react';

export const Input = ({ label, type = "text", placeholder, required = false, ...props }: any) => (
  <div className="w-full">
    <label className="label-text">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="input-field"
      {...props}
    />
  </div>
);
