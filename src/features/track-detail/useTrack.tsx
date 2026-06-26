import { useContext } from 'react';
import { TrackContext } from './TrackContextStore';

export const useTrack = () => {
  const ctx = useContext(TrackContext);
  if (!ctx) throw new Error('useTrack must be used within TrackProvider');
  return ctx;
};
