// Early error and rejection interceptor for Firebase initialization
// Must be imported first to guarantee execution before any other modules load.

const isFirebaseApiKeyError = (err: any): boolean => {
  if (!err) return false;
  
  // Extract error info from different formats
  const message = err.message || '';
  const code = err.code || '';
  const toStringVal = typeof err.toString === 'function' ? err.toString() : '';
  
  const searchStr = `${message} ${code} ${toStringVal}`.toLowerCase();
  
  return (
    searchStr.includes('invalid-api-key') ||
    searchStr.includes('auth/invalid-api-key') ||
    searchStr.includes('api-key') ||
    searchStr.includes('api_key') ||
    searchStr.includes('auth/invalid-credential')
  );
};

const handleEarlyRejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  if (reason && (isFirebaseApiKeyError(reason) || isFirebaseApiKeyError(reason.reason))) {
    console.warn('Early captured unhandled firebase API key rejection:', reason);
    (window as any).__firebaseError = 'invalid-api-key';
    
    // Call preventDefault() to stop the browser from logging this as an uncaught exception
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch (e) {
      // ignore
    }
    
    window.dispatchEvent(new CustomEvent('firebase-config-error', { detail: 'invalid-api-key' }));
  }
};

const handleEarlyError = (event: ErrorEvent) => {
  const message = event.message || '';
  const errorObj = event.error;
  
  const isKeyError = 
    message.toLowerCase().includes('invalid-api-key') ||
    message.toLowerCase().includes('auth/invalid-api-key') ||
    isFirebaseApiKeyError(errorObj);
    
  if (isKeyError) {
    console.warn('Early captured unhandled firebase API key error:', message, errorObj);
    (window as any).__firebaseError = 'invalid-api-key';
    
    // Call preventDefault() to stop the browser from logging this as an uncaught exception
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch (e) {
      // ignore
    }
    
    window.dispatchEvent(new CustomEvent('firebase-config-error', { detail: 'invalid-api-key' }));
  }
};

window.addEventListener('unhandledrejection', handleEarlyRejection, true);
window.addEventListener('error', handleEarlyError, true);

