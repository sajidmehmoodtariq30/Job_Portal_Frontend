import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TokenHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');
    const token_type = params.get('token_type');
    const scope = params.get('scope');
    if (access_token && refresh_token && expires_in && token_type && scope) {
      const tokenData = {
        access_token,
        refresh_token,
        expires_in,
        token_type,
        scope: decodeURIComponent(scope)
      };
      localStorage.setItem('admin_token', JSON.stringify(tokenData));
      window.history.replaceState({}, document.title, window.location.pathname);
      if (!location.pathname.startsWith('/admin')) {
        navigate('/admin', { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
};

export default TokenHandler;
