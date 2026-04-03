import React, { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ValidationError } from '@/hooks/useFormValidation'

interface ValidatedInputProps extends React.ComponentProps<'input'> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  validation?: (value: string) => ValidationError | null
}

const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    { label, error, helperText, required, className, id, validation, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const validationError = validation?.(String(props.value))
    const displayError = error || validationError?.message

    return (
      <div className="grid gap-2">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            displayError &&
              'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {displayError && (
          <p className="text-sm text-red-600 font-medium">{displayError}</p>
        )}
        {helperText && !displayError && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)

ValidatedInput.displayName = 'ValidatedInput'

export { ValidatedInput }
