import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore.js';
import ConfigScreen from './screens/ConfigScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import VictoryScreen from './screens/VictoryScreen.jsx';

export default function App() {
  const { setQuestionsData, questionsData } = useGameStore();
  const [apiError, setApiError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    setApiError(false);
    try {
      const BASE = 'http://localhost:8000';
      const [qRes, fRes, dRes] = await Promise.all([
        fetch(`${BASE}/api/questions`),
        fetch(`${BASE}/api/finale`),
        fetch(`${BASE}/api/debut`),
      ]);
      if (!qRes.ok || !fRes.ok || !dRes.ok) throw new Error('API error');
      const [questions, finale, debut] = await Promise.all([
        qRes.json(), fRes.json(), dRes.json(),
      ]);
      setQuestionsData(questions, finale, debut);
    } catch (err) {
      console.error('Erreur chargement questions:', err);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div style={overlay}>
        <p style={{ color: '#7b78a8', fontSize: '16px' }}>Chargement des questions…</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={overlay}>
        <div style={errorBox}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#ff4444' }}>
            ⚠ Impossible de joindre le backend
          </p>
          <p style={{ color: '#7b78a8', fontSize: '14px', marginTop: '8px' }}>
            Vérifie que le backend tourne :<br />
            <code style={{ color: '#00c3ff' }}>python -m uvicorn main:app --port 8000 --reload</code>
          </p>
          <button style={retryBtn} onClick={loadData}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ConfigScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/victory" element={<VictoryScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const overlay = {
  height: '100vh', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};
const errorBox = {
  background: '#13112a', border: '1px solid #2a2650',
  borderRadius: '12px', padding: '32px 40px',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
  textAlign: 'center', maxWidth: '480px',
};
const retryBtn = {
  marginTop: '8px', padding: '10px 28px',
  background: 'linear-gradient(135deg, #7c3aed, #00c3ff)',
  color: '#fff', borderRadius: '50px',
  border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
};
