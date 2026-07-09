import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { extractPdfText } from '../lib/pdfExtract.js';
import EnergyStats from '../components/EnergyStats.jsx';
import HistoryList from '../components/HistoryList.jsx';

const SAMPLE_MENU = `STARTERS
Steamed Veg Momos — vegetable dumplings, spicy chutney
Crispy Chicken Wings — battered, tossed in bbq glaze
Sweet Corn Soup

MAINS
Grilled Salmon — steamed broccoli, lemon butter
Butter Chicken with Naan — creamy makhani gravy
Paneer Tikka Masala — cottage cheese, spiced cream sauce
Quinoa Buddha Bowl — roasted veg, avocado, hummus
Dal Tadka with Brown Rice
Double Cheese Burger with Fries — loaded, bacon, cheddar
Pad Thai Noodles — prawns, peanuts, egg

DESSERTS & DRINKS
Chocolate Brownie Sundae
Fresh Fruit Smoothie — banana, mango, honey, yogurt`;

export default function Scan({ onAnalyzed, onGoToProfile }) {
  const { user, api } = useAuth();
  const [restaurantName, setRestaurantName] = useState('');
  const [menuText, setMenuText] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('Analyze this menu');
  const [error, setError] = useState('');
  const [historyKey, setHistoryKey] = useState(0);
  const fileInputRef = useRef(null);

  function useSample() {
    setMenuText(SAMPLE_MENU);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!user.profile) {
      setError('Complete your health profile first — it takes one minute.');
      onGoToProfile();
      return;
    }

    setSubmitting(true);
    setStatusText('Analyzing…');
    try {
      let data;
      if (file && file.type === 'application/pdf') {
        setStatusText('Reading PDF…');
        const text = await extractPdfText(file);
        setStatusText('Analyzing…');
        data = await api('/api/menu/analyze', { method: 'POST', body: { menuText: text, sourceType: 'pdf', restaurantName } });
      } else if (file) {
        setStatusText('Reading image…');
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
        setStatusText('Analyzing…');
        data = await api('/api/menu/analyze', { method: 'POST', body: { imageData: base64Data, mimeType: file.type, restaurantName } });
      } else {
        data = await api('/api/menu/analyze', { method: 'POST', body: { menuText, restaurantName } });
      }
      setHistoryKey((k) => k + 1);
      onAnalyzed(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setStatusText('Analyze this menu');
    }
  }

  return (
    <>
      <div className="tab-head">
        <h2>Scan a menu</h2>
        <p className="muted">Upload a menu photo or PDF, or paste the menu text. We'll rank every dish for your profile.</p>
      </div>

      {!user.profile && (
        <div className="profile-warning">
          <p>Complete your <button type="button" className="link-btn" onClick={onGoToProfile}>health profile</button> first so we know what to rank against.</p>
        </div>
      )}

      <form className="scan-grid" onSubmit={handleSubmit}>
        <div className="scan-col">
          <div className="field">
            <label htmlFor="restaurant-name">Restaurant name <span className="opt">(optional)</span></label>
            <input type="text" id="restaurant-name" placeholder="e.g. The Green Table"
              value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
          </div>

          <div
            className={`upload-zone${dragOver ? ' dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="upload-inner">
              <div className="upload-icon">▲</div>
              <p><strong>Drop a menu here</strong> or click to browse</p>
              <p className="muted small">Photo (JPG/PNG) or PDF · image OCR is simulated in this demo</p>
              {file && <p className="upload-filename">Selected: {file.name}</p>}
            </div>
          </div>

          <div className="or-rule"><span>or paste the menu</span></div>
          <div className="field">
            <textarea
              rows="9"
              placeholder={'Paste menu text — one dish per line, e.g.\n\nGrilled Salmon — seared, steamed broccoli, lemon butter\nButter Chicken with Naan\nQuinoa Buddha Bowl\nChocolate Brownie Sundae'}
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
            />
          </div>
          <button type="button" className="link-btn" onClick={useSample}>Use a sample menu</button>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>{statusText}</button>
        </div>

        <aside className="scan-aside">
          <div className="aside-card" id="energy-card">
            <h3>Your daily targets</h3>
            <EnergyStats />
          </div>
          <div className="aside-card">
            <h3>How scoring works</h3>
            <p className="small muted">Every dish gets 0–100 for <em>your</em> profile: calorie fit against your per-meal budget, protein for your goal, allergy and condition checks, cooking method, and more. It's guidance, not gospel — estimates are AI-generated.</p>
          </div>
        </aside>
      </form>

      <div className="history-block">
        <h3>Recent scans</h3>
        <HistoryList refreshKey={historyKey} onSelect={onAnalyzed} />
      </div>
    </>
  );
}
