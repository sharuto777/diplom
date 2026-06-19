import { useEffect, useState } from "react";
import { getStoredTheme } from "../utils/theme";

function getCurrentTheme() {
  if (typeof document === "undefined") {
    return getStoredTheme();
  }

  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function useAppTheme() {
  const [theme, setTheme] = useState(getCurrentTheme);

  useEffect(() => {
    function syncTheme() {
      const nextTheme =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "dark"
          : "light";
      setTheme(nextTheme);
    }

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}