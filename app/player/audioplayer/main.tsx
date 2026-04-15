import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/customize-progress-bar.css';

import { AudioPlayerProvider, Track } from './context/audio-player-context';

const DEMO_TRACK: Track = {
  title: 'Demo Track',
  author: 'Demo Author',
  src: '',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AudioPlayerProvider initialTrack={DEMO_TRACK}>
      <App />
    </AudioPlayerProvider>
  </React.StrictMode>
);