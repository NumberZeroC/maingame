import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 ${bgColor} text-white px-lg py-md rounded-lg shadow-lg z-50 animate-fade-in`}
    >
      {message}
    </div>
  )
}
