import { TrackInfo } from './TrackInfo';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { AudioPlayerProvider, Track } from '../context/audio-player-context';

interface AudioPlayerProps {
  track: Track;
  onTrackEnded?: () => void;
}

export const AudioPlayer = ({ track, onTrackEnded }: AudioPlayerProps) => {
  return (
    <AudioPlayerProvider initialTrack={track}>
      <div>
        <div className="min-h-8 bg-[#2e2d2d] flex flex-col gap-9 lg:flex-row justify-between items-center text-white py-2 px-[40px]">
          <TrackInfo />
          <div className="w-full flex flex-col items-center gap-1 m-auto flex-1">
            <Controls onTrackEnded={onTrackEnded} />
            <ProgressBar />
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <VolumeControl />
          </div>
        </div>
      </div>
    </AudioPlayerProvider>
  );
};