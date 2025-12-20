import { useState, useEffect } from "react";

// Accepts only array of banner objects
export default function useBannerRotation(bannerImages) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!Array.isArray(bannerImages) || bannerImages.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [bannerImages]);

  return bannerImages[index] || {};
}
