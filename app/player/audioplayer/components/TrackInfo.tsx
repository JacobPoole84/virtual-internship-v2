import { BsMusicNoteBeamed } from 'react-icons/bs';

import { useAudioPlayerContext } from '../context/audio-player-context';

export const TrackInfo = () => {
  const { currentTrack } = useAudioPlayerContext();
  const hasImageLink = Boolean(currentTrack.imageLink?.trim());

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
        {hasImageLink ? (
          <img
            className="w-full h-full object-cover"
            src={currentTrack.imageLink}
            alt="audio avatar"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-md">
            <span className="text-xl text-gray-600">
              <BsMusicNoteBeamed />
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="font-bold lg:truncate lg:max-w-64">
          {currentTrack.title}
        </p>
        <p className="text-sm text-gray-400">{currentTrack.author}</p>
      </div>
    </div>
  );
};