import { useEffect, useMemo, useState } from "react";

const isDev = process.env.NODE_ENV === "development";

const useAudio = (path: string): [boolean, () => void] => {
  let url: string;
  if (isDev) {
    url = `http://localhost:3000/${path}`;
  } else {
    url = `https://ray.so/${path}`;
  }

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setAudio(new Audio(url));
  }, [url]);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    if (!audio) return;
    playing ? audio.play() : audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    if (!audio) return;
    const handleEnd = () => setPlaying(false);
    audio.addEventListener("ended", handleEnd);
    return () => {
      audio.removeEventListener("ended", handleEnd);
    };
  }, [audio]);

  return [playing, toggle];
};

export default useAudio;
