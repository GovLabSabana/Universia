import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'default', message = 'Cargando...' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500 mx-auto mb-4`} />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}