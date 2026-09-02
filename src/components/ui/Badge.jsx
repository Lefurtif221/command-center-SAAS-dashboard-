export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-midnight-lighter text-ghost-dim',
    copper: 'badge-copper',
    teal: 'badge-teal',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'bg-warning/20 text-warning'
  }
  
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}