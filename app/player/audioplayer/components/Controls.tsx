import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BsFillFastForwardFill,
  BsFillPauseFill,
  BsFillPlayFill,
  BsFillRewindFill,
  BsSkipEndFill,
  BsSkipStartFill,
  BsRepeat,
} from 'react-icons/bs';

import { useAudioPlayerContext } from '../context/audio-player-context';

interface ControlsProps {
  onTrackEnded?: () => void;
}

export const Controls = ({ onTrackEnded }: ControlsProps) => {
  const {
    currentTrack,
    audioRef,
    setDuration,
    duration,
    setTimeProgress,
    progressBarRef,
    isPlaying,
    setIsPlaying,
  } = useAudioPlayerContext();
  const trackSrc = currentTrack.src.trim() || undefined;

  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const playAnimationRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    if (audioRef.current && progressBarRef.current) {
      const currentTime = audioRef.current.currentTime;
      setTimeProgress(currentTime);

      progressBarRef.current.value = currentTime.toString();
      if (duration > 0) {
        progressBarRef.current.style.setProperty(
          '--range-progress',
          `${(currentTime / duration) * 100}%`
        );
      }
    }
  }, [duration, setTimeProgress, audioRef, progressBarRef]);

  const startAnimation = useCallback(() => {
    if (audioRef.current && progressBarRef.current) {
      const animate = () => {
        updateProgress();
        playAnimationRef.current = requestAnimationFrame(animate);
      };
      playAnimationRef.current = requestAnimationFrame(animate);
    }
  }, [updateProgress, audioRef, progressBarRef]);

  useEffect(() => {
    const currentAudioRef = audioRef.current;
    if (!currentAudioRef || !trackSrc) return;

    const syncMetadata = () => {
      const seconds = currentAudioRef.duration;
      if (!Number.isFinite(seconds) || seconds <= 0) return;

      setDuration(seconds);
      if (progressBarRef.current) {
        progressBarRef.current.max = seconds.toString();
      }
    };

    const syncProgress = () => {
      updateProgress();
    };

    currentAudioRef.addEventListener('loadedmetadata', syncMetadata);
    currentAudioRef.addEventListener('durationchange', syncMetadata);
    currentAudioRef.addEventListener('timeupdate', syncProgress);

    syncMetadata();
    syncProgress();

    return () => {
      currentAudioRef.removeEventListener('loadedmetadata', syncMetadata);
      currentAudioRef.removeEventListener('durationchange', syncMetadata);
      currentAudioRef.removeEventListener('timeupdate', syncProgress);
    };
  }, [trackSrc, audioRef, progressBarRef, setDuration, updateProgress]);

  useEffect(() => {
    if (!trackSrc) {
      setIsPlaying(false);
    }
  }, [trackSrc, setIsPlaying]);

  useEffect(() => {
    if (!trackSrc) {
      audioRef.current?.pause();
      return;
    }

    if (isPlaying) {
      audioRef.current?.play();
      startAnimation();
    } else {
      audioRef.current?.pause();
      if (playAnimationRef.current !== null) {
        cancelAnimationFrame(playAnimationRef.current);
        playAnimationRef.current = null;
      }
      updateProgress(); // Ensure progress is updated immediately when paused
    }

    return () => {
      if (playAnimationRef.current !== null) {
        cancelAnimationFrame(playAnimationRef.current);
      }
    };
  }, [isPlaying, trackSrc, startAnimation, updateProgress, audioRef]);

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 15;
      updateProgress();
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 15;
      updateProgress();
    }
  };

  const handlePrevious = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      updateProgress();
    }
  }, [audioRef, updateProgress]);

  const handleNext = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      updateProgress();
    }
  }, [audioRef, updateProgress]);

  useEffect(() => {
    const currentAudioRef = audioRef.current;

    if (currentAudioRef) {
      currentAudioRef.onended = () => {
        onTrackEnded?.();

        if (isRepeat) {
          currentAudioRef.currentTime = 0;
          currentAudioRef.play();
        } else {
          setIsPlaying(false);
          currentAudioRef.currentTime = 0;
          setTimeProgress(0);
          if (progressBarRef.current) {
            progressBarRef.current.value = '0';
            progressBarRef.current.style.setProperty('--range-progress', '0%');
          }
        }
      };
    }

    return () => {
      if (currentAudioRef) {
        currentAudioRef.onended = null;
      }
    };
  }, [
    isRepeat,
    audioRef,
    progressBarRef,
    setIsPlaying,
    setTimeProgress,
    onTrackEnded,
  ]);

  return (
    <div className="flex gap-4 items-center">
      <audio
        src={trackSrc}
        ref={audioRef}
      />
      <button onClick={handlePrevious}>
        <BsSkipStartFill size={20} />
      </button>
      <button onClick={skipBackward}>
        <BsFillRewindFill size={20} />
      </button>
      <button
        onClick={() => setIsPlaying((prev) => !prev)}
        disabled={!trackSrc}
      >
        {isPlaying ? (
          <BsFillPauseFill size={30} />
        ) : (
          <BsFillPlayFill size={30} />
        )}
      </button>
      <button onClick={skipForward}>
        <BsFillFastForwardFill size={20} />
      </button>
      <button onClick={handleNext}>
        <BsSkipEndFill size={20} />
      </button>
      <button onClick={() => setIsRepeat((prev) => !prev)}>
        <BsRepeat
          size={20}
          className={isRepeat ? 'text-[#f50]' : ''}
        />
      </button>
    </div>
  );
};