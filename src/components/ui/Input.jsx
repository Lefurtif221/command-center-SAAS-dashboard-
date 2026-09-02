import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-ghost-dim">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`input ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input