// Silent audio base64 (very short wav)
export const SILENT_AUDIO_SRC = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAgACAAM=";

export const playSilentAudio = () => {
  try {
    let audio = document.getElementById('gymapp-silent-audio') as HTMLAudioElement;
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'gymapp-silent-audio';
      audio.src = SILENT_AUDIO_SRC;
      audio.loop = true;
      audio.setAttribute('playsinline', 'true');
      document.body.appendChild(audio);
    }
    audio.play().catch(e => console.warn("Auto-play blocked for silent audio", e));
  } catch (e) {
    console.error(e);
  }
};

export const stopSilentAudio = () => {
  try {
    const audio = document.getElementById('gymapp-silent-audio') as HTMLAudioElement;
    if (audio) {
      audio.pause();
    }
  } catch (e) {}
};
