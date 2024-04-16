import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import CreatePollForm from './components/CreatePollForm';
import Leaderboard from './components/Leaderboard';

const App: React.FC = () => {
  return (
    <div className="app">
      {/* Application routing setup */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreatePollForm />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </div>
  );
};

export default App;
