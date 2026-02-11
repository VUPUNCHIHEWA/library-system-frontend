import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const BarcodeScanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader", {
      formatsToSupport: [ 
        Html5QrcodeSupportedFormats.EAN_13, 
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.QR_CODE 
      ]
    });
    
    scannerRef.current = html5QrCode;

    // තත්පර 10කින් පස්සේ scan වුණේ නැත්නම් message එකක් පෙන්වනවා
    const timeoutId = setTimeout(() => {
      setErrorMsg("ස්කෑන් කිරීමට අපහසුයි. කරුණාකර ISBN අංකය manually ටයිප් කරන්න.");
    }, 10000);

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          { 
            fps: 15,
            qrbox: { width: 300, height: 150 },
          },
          (decodedText) => {
            clearTimeout(timeoutId); // සාර්ථක වුණොත් timeout එක අයින් කරනවා
            stopCamera();
            onScanSuccess(decodedText);
          },
          (errorMessage) => { /* scanning... */ }
        );
      } catch (err) {
        console.error("Camera Start Error:", err);
      }
    };

    const stopCamera = async () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.error("Stop failed:", err);
        }
      }
    };

    startScanner();

    return () => {
      clearTimeout(timeoutId);
      stopCamera();
    };
  }, [onScanSuccess]);

  return (
    <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
      <style>{`
        #reader video { width: 100% !important; height: 300px !important; object-fit: cover !important; }
        #reader__dashboard { display: none !important; }
        .scan-msg {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 8px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
          z-index: 10;
        }
      `}</style>
      
      <div id="reader"></div>
      
      {/* තත්පර 10ක් ගියාම එන Error Message එක */}
      {errorMsg && <div className="scan-msg">{errorMsg}</div>}
      
      {/* Scanning Line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '280px',
        height: '2px',
        background: 'red',
        boxShadow: '0 0 8px red',
        pointerEvents: 'none'
      }}></div>
    </div>
  );
};

export default BarcodeScanner;