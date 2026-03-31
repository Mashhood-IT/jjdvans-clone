import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import LoadingEffect from './LoadingEffect';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [loadingConfig, setLoadingConfig] = useState({
    size: 'medium',
    theme: 'light'
  });

  const showLoading = useCallback((message = 'Loading...', config = {}) => {
    setLoadingMessage(message);
    setLoadingConfig(prev => ({ ...prev, ...config }));
    setLoading(true);
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    window.parent.postMessage({ type: 'scrollToTop' }, '*');
    window.parent.postMessage({ type: 'setHeight', height: window.innerHeight }, '*');
  }, []);
  
  const hideLoading = useCallback(() => {
    setLoading(false);
    document.body.style.overflow = '';
  }, []);

  const value = useMemo(() => ({
    loading,
    showLoading,
    hideLoading,
    loadingMessage,
    loadingConfig
  }), [loading, showLoading, hideLoading, loadingMessage, loadingConfig]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && (
        <LoadingEffect
          overlay={true}
          message={loadingMessage}
          size={loadingConfig.size}
          theme={loadingConfig.theme}
        />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const withLoading = (WrappedComponent) => {
  
  return (props) => {
    const [componentLoading, setComponentLoading] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => {
        setComponentLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }, []);
    if (componentLoading) {
      return (
        <LoadingEffect
          overlay={false}
          message="Loading page..."
          size="medium"
        />
      );
    }
    return <WrappedComponent {...props} />;
  };
};