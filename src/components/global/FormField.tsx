import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export function FormField({
  label,
  error,
  hint,
  required,
  multiline,
  rows = 3,
  leftIcon,
  rightIcon,
  className,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: FormFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  const inputClassName = cn(
    'transition-all duration-200',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    error && 'border-destructive focus-visible:ring-destructive',
    className
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        {multiline ? (
          <Textarea
            id={inputId}
            rows={rows}
            className={inputClassName}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        ) : (
          <Input
            id={inputId}
            type={type}
            className={inputClassName}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        )}
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 text-sm text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FormField;
