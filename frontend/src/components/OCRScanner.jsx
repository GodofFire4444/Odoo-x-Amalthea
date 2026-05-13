import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import api from '../services/api';

const OCRScanner = ({ onComplete, onCancel }) => {
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) {
      setErrorMessage('Please select an image first.');
      return;
    }

    try {
      setScanning(true);
      setProgress(0);
      setErrorMessage('');
      setStatusMessage('Reading receipt image...');

      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        image,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      // Parse OCR text using backend
      setStatusMessage('Parsing receipt details...');
      const { data: parsed } = await api.post('/expenses/ocr/parse', { text });

      if (!parsed?.data) {
        throw new Error('Unable to parse receipt data');
      }

      onComplete(parsed.data);

    } catch (error) {
      console.error('OCR error:', error);
      setErrorMessage(error.response?.data?.message || 'Error scanning receipt. Please try again or enter manually.');
      setStatusMessage('');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Scan Receipt</h2>

      {errorMessage ? (
        <div style={{
          marginBottom: '1rem',
          padding: '0.85rem 1rem',
          borderRadius: '0.75rem',
          backgroundColor: '#fdecea',
          color: '#b42318',
          border: '1px solid #f5c2c7'
        }}>
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div style={{
          marginBottom: '1rem',
          padding: '0.85rem 1rem',
          borderRadius: '0.75rem',
          backgroundColor: '#eef6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe'
        }}>
          {statusMessage}
        </div>
      ) : null}

      <div style={{
        border: '2px dashed #ddd',
        borderRadius: '0.5rem',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        cursor: 'pointer',
        backgroundColor: '#fafafa'
      }}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <img
            src={image}
            alt="Receipt"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '0.5rem'
            }}
          />
        ) : (
          <div>
            <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📷</p>
            <p style={{ margin: 0, color: '#666' }}>
              Click to upload receipt image
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />

      {scanning && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            backgroundColor: '#e5e5e5',
            borderRadius: '1rem',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#4caf50',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s'
            }} />
          </div>
          <p style={{ textAlign: 'center', marginTop: '0.5rem', color: '#666' }}>
            Scanning... {progress}%
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleScan}
          disabled={!image || scanning}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: (!image || scanning) ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            opacity: (!image || scanning) ? 0.6 : 1
          }}
        >
          {scanning ? 'Scanning...' : 'Scan Receipt'}
        </button>
        <button
          onClick={onCancel}
          disabled={scanning}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            cursor: scanning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          Cancel
        </button>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        Tip: Make sure the receipt is clear and well-lit for best results
      </p>
    </div>
  );
};

export default OCRScanner;