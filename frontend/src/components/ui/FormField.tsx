import React, { forwardRef } from 'react';

/* ─── Field Wrapper ─────────────────────────────────────── */
interface FieldWrapProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FieldWrap: React.FC<FieldWrapProps> = ({
  label,
  htmlFor,
  error,
  required = false,
  hint,
  children,
  className = '',
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label htmlFor={htmlFor} className="block mono-label text-[11px]">
      {label}
      {required && <span className="text-brand-red ml-1">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-xs text-text-3">{hint}</p>
    )}
    {error && (
      <p className="text-xs text-brand-red flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

/* ─── Input ─────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, icon, className = '', ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`input ${error ? 'input-error' : ''} ${icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  )
);
Input.displayName = 'Input';

/* ─── Select ────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = '', ...props }, ref) => (
    <select
      ref={ref}
      className={`input appearance-none bg-[right_12px_center] bg-[length:16px] bg-no-repeat ${
        error ? 'input-error' : ''
      } ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238B9DC8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
);
Select.displayName = 'Select';

/* ─── Textarea ──────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`input resize-y min-h-[100px] ${error ? 'input-error' : ''} ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
