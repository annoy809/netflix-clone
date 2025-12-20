import { useEffect, useState } from 'react';
import axios from 'axios';

const useFetchSections = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setData([]);
      setLoading(false);
      return;
    }

    const cacheKey = `sectionCache_${url}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > 1000 * 60 * 10; // 10 minutes

      if (!isExpired) {
        setData(parsed.data);
        setLoading(false);
        return;
      }
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(url);
        let payload = response.data;

        let finalData = [];

        if (Array.isArray(payload)) {
          finalData = payload;
        } else if (Array.isArray(payload.results)) {
          finalData = payload.results;
        } else if (payload && typeof payload === 'object') {
          finalData = [payload]; // fallback, wrap single object
        }

        setData(finalData);
        localStorage.setItem(cacheKey, JSON.stringify({
          data: finalData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error(`❌ useFetchSections error for ${url}:`, err);
        setError(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetchSections;
