import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "./api";

export default function useApiData(url, { key, pollMs } = {}) {
  const [state, setState] = useState({ data: [], loading: true, error: "" });
  const controller = useRef(null);
  const reload = useCallback(async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    try {
      const response = await apiFetch(url, { signal: request.signal });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || result.message || "Unable to load records.",
        );
      const data = key ? result[key] : result;
      if (!Array.isArray(data))
        throw new Error("The server returned an unexpected response.");
      if (!request.signal.aborted)
        setState({ data, loading: false, error: "" });
    } catch (error) {
      if (!request.signal.aborted)
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error.message,
        }));
    }
  }, [url, key]);
  useEffect(() => {
    // The request updates state only when its response settles.
    const request = new AbortController();
    controller.current = request;
    apiFetch(url, { signal: request.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error || result.message || "Unable to load records.",
          );
        const data = key ? result[key] : result;
        if (!Array.isArray(data))
          throw new Error("The server returned an unexpected response.");
        if (!request.signal.aborted)
          setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (!request.signal.aborted)
          setState((previous) => ({
            ...previous,
            loading: false,
            error: error.message,
          }));
      });
    const interval = pollMs ? setInterval(reload, pollMs) : null;
    return () => {
      request.abort();
      controller.current?.abort();
      clearInterval(interval);
    };
  }, [url, key, pollMs, reload]);
  return { ...state, reload };
}
