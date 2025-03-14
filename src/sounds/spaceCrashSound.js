import spaceCrashSound from '../data/spaceCrash.mp3';

export const playSpaceCrashSound = (isMuted, volume = 1.0) => {
  if (isMuted) return;
  const audio = new Audio(spaceCrashSound);
  audio.volume = volume;
  audio.play();
};
