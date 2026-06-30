import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore.js';
import { QUESTIONS, QUESTIONS_FINALE, QUESTIONS_DEBUT } from './data/questions.js';
import ConfigScreen from './screens/ConfigScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import VictoryScreen from './screens/VictoryScreen.jsx';

export default function App() {
  const { setQuestionsData } = useGameStore();

  useEffect(() => {
    // Questions embarquées directement — pas de réseau, pas d'API
    setQuestionsData(QUESTIONS, QUESTIONS_FINALE, QUESTIONS_DEBUT);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<ConfigScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/victory" element={<VictoryScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
