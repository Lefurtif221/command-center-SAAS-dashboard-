export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div 
      className={`card ${hover ? 'hover-lift' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}