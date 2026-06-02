import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  emptyPlatformAnalytics,
  type PlatformAnalytics,
  type PlatformKey,
} from "../types/analytics";

export function useAnalytics(platform: PlatformKey) {
  const [data, setData] = useState<PlatformAnalytics>(
    emptyPlatformAnalytics(platform),
  );
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<PlatformAnalytics>(
          `/analytics/${platform.toLowerCase()}`,
        );

        if (isMounted) {
          setData({ ...emptyPlatformAnalytics(platform), ...res.data });
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setData(emptyPlatformAnalytics(platform));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [platform]);

  return { data, isLoading, error };
}
