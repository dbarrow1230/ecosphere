import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from "./api.js";
const StudioContext = createContext(null);
export const useStudio = () => useContext(StudioContext);
export function StudioProvider({
  children
}) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      setData(await api('/api/studio/overview'));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useEffect(() => {
    refresh();
    window.addEventListener('ECOSPHERE_AUTH_UPDATED', refresh);
    return () => window.removeEventListener('ECOSPHERE_AUTH_UPDATED', refresh);
  }, [refresh]);
  const run = async task => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const message = await task();
      setNotice(message || 'Saved.');
      await refresh();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const archive = (url, name) => {
    if (window.confirm('Archive ' + name + '? Its history will be retained.')) return run(() => api(url, null, 'DELETE').then(row => row.message));
  };
  return <StudioContext.Provider value={{
    data,
    error,
    setError,
    notice,
    busy,
    refresh,
    run,
    archive
  }}>{children}</StudioContext.Provider>;
}
