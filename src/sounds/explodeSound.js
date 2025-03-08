import explodeSound from '../data/box_explode.mp3';

export const playExplodeSound = (isMuted) => {
  const explodeSoundInstance = new Audio(explodeSound);
  explodeSoundInstance.muted = isMuted;
  explodeSoundInstance.play();
};
