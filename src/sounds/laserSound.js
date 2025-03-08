import laserSound from '../data/laser-zap-90575.mp3';

export const playLaserSound = (isMuted, volume = 1.0) => {
  if (isMuted) return;
  const audio = new Audio(laserSound);
  audio.volume = volume;
  audio.play();
};
