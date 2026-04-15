import { AudioPlayer } from './components/AudioPlayer';
import { Track } from './context/audio-player-context';

const DEMO_TRACK: Track = {
  title: 'Demo Track',
  author: 'Demo Author',
  src: '',
};

function App() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="text-3xl font-bold mb-5">
        Audio player in React
      </h1>
      <AudioPlayer track={DEMO_TRACK} />
    </div>
  );
}

export default App;