import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, ScanLine } from 'lucide-react'

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const runningRef = useRef(false)

  useEffect(() => {
    const scannerId = 'qr-reader'
    const scanner = new Html5Qrcode(scannerId)
    scannerRef.current = scanner

    const config = { fps: 10, qrbox: { width: 250, height: 250 } }

    scanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        if (runningRef.current) return
        runningRef.current = true
        onScan(decodedText.trim())
        scanner.stop().catch(() => {})
      },
      () => {}
    ).catch((err) => {
      setError('Camera access denied or not available. Allow camera permission.')
      console.error(err)
    })

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal qr-scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-scanner-header">
          <div>
            <ScanLine size={20} />
            <h3>Scan Product QR / Barcode</h3>
          </div>
          <button className="qty-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="qr-hint">Point camera at product barcode or QR code (SKU)</p>
        <div id="qr-reader" className="qr-reader" />
        {error && <p className="qr-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
