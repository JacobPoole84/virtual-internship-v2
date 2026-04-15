import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  RefObject,
  useRef,
} from 'react';

export interface Track {
  title: string;
  src: string;
  author: string;
  imageLink?: string;
}

interface AudioPlayerContextType {
  currentTrack: Track;
  setCurrentTrack: Dispatch<SetStateAction<Track>>;
  timeProgress: number;
  setTimeProgress: Dispatch<SetStateAction<number>>;
  duration: number;
  setDuration: Dispatch<SetStateAction<number>>;
  audioRef: RefObject<HTMLAudioElement | null>;
  progressBarRef: RefObject<HTMLInputElement | null>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

const DEFAULT_TRACK: Track = {
  title: 'Untitled',
  author: 'Unknown author',
  src: '',
};

const AudioPlayerContext = createContext<
  AudioPlayerContextType | undefined
>(undefined);

export const AudioPlayerProvider = ({
  children,
  initialTrack,
}: {
  children: ReactNode;
  initialTrack: Track;
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track>(
    initialTrack ?? DEFAULT_TRACK
  );
  const [timeProgress, setTimeProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTrack({
      title: initialTrack?.title ?? DEFAULT_TRACK.title,
      author: initialTrack?.author ?? DEFAULT_TRACK.author,
      src: initialTrack?.src ?? DEFAULT_TRACK.src,
      imageLink: initialTrack?.imageLink,
    });
    setTimeProgress(0);
    setDuration(0);
    setIsPlaying(false);
  }, [
    initialTrack?.title,
    initialTrack?.author,
    initialTrack?.src,
    initialTrack?.imageLink,
  ]);

  const contextValue = {
    currentTrack,
    setCurrentTrack,
    audioRef,
    progressBarRef,
    timeProgress,
    setTimeProgress,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);

  if (context === undefined) {
    throw new Error(
      'useAudioPlayerContext must be used within an AudioPlayerProvider'
    );
  }

  return context;
};