import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore.js';
import ConfigScreen from './screens/ConfigScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import VictoryScreen from './screens/VictoryScreen.jsx';

export default function App() {
  const { setQuestionsData, phase } = useGameStore();

  useEffect(() => {
    async function loadData() {
      try {
        const [qRes, fRes, dRes] = await Promise.all([
          fetch('/api/questions'),
          fetch('/api/finale'),
          fetch('/api/debut'),
        ]);
        const [questions, finale, debut] = await Promise.all([
          qRes.json(), fRes.json(), dRes.json(),
        ]);
        setQuestionsData(questions, finale, debut);
      } catch (err) {
        console.error('Erreur chargement questions:', err);
      }
    }
    loadData();
  }, [setQuestionsData]);

  return (
    <Routes>
      <Route path="/" element={<ConfigScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/victory" element={<VictoryScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
