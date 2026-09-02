import { forwardRef } from 'react'

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}, ref) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 focus-ring flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-gradient-to-r from-copper to-copper-dark text-white hover:shadow-lg hover:shadow-copper/40 hover:-translate-y-0.5',
    secondary: 'bg-midnight-lighter border border-white/10 text-ghost hover:border-copper hover:bg-midnight-light',
    ghost: 'text-ghost hover:bg-midnight-lighter hover:text-copper',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
    success: 'bg-success/10 text-success hover:bg-success/20'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Chargement...</span>
        </>
      ) : children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button