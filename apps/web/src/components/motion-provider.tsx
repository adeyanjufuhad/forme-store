"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const Context = createContext({
  paused: false,
  reduced: false,
  toggle: () => {},
});
export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    try {
      setPaused(localStorage.getItem("forme-motion") === "paused");
    } catch {}
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion =
      paused || reduced ? "paused" : "playing";
  }, [paused, reduced]);
  const toggle = () =>
    setPaused((current) => {
      try {
        localStorage.setItem("forme-motion", current ? "playing" : "paused");
      } catch {}
      return !current;
    });
  return (
    <Context.Provider value={{ paused, reduced, toggle }}>
      {children}
    </Context.Provider>
  );
}
export const useMotionPreference = () => useContext(Context);
