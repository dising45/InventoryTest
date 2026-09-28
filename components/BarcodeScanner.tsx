import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera } from 'lucide-react'

interface Props {
  onScan: (sku: string) => void
  onClose: () => void
}

const BarcodeScanner: React.FC<Props> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const id = 'qr-scanner-container'
    const scanner = new Html5Qrcode(id)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          const now = Date.now()
          if (decodedText === lastScanRef.current && now - lastScanTimeRef.current < 2000) return
          lastScanRef.current = decodedText
          lastScanTimeRef.current = now
          setFlash(true)
          setTimeout(() => setFlash(false), 400)
          onScan(decodedText)
        },
        undefined
      )
      .catch(() => setError('Could not access camera. Check permissions.'))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 text-white bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-base">Scan Product Code</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera area */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {flash && (
          <div className="absolute inset-0 bg-green-500/30 z-10 pointer-events-none animate-in fade-in duration-100" />
        )}

        {error ? (
          <div className="text-center text-white px-8">
            <Camera className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        ) : (
          <div id="qr-scanner-container" className="w-full max-w-sm" />
        )}
      </div>

      {/* Hint */}
      <div className="bg-black/80 text-center py-4 text-sm text-gray-400 px-6">
        Point camera at a product QR code. Scanning is continuous — tap close when done.
      </div>
    </div>
  )
}

export default BarcodeScanner
