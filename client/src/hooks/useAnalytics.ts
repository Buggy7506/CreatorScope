import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PlatformKey } from "../data/mockAnalytics";

export function useAnalytics(platform: PlatformKey) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/analytics/${platform.toLowerCase()}`
        );

        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform]);

  return { data, isLoading, error };
}