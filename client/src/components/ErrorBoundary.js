import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Background3D from './UI/Background3D';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {/* Match global medical theme background when in fallback mode */}
          <Background3D variant="medical" />
          <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.6)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 16,
                  padding: '2rem',
                  maxWidth: 560,
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                <motion.div
                  initial={{ rotate: -8 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 10 }}
                  style={{
                    width: 56,
                    height: 56,
                    margin: '0 auto 1rem auto',
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(99,102,241,0.15))',
                    border: '1px solid rgba(239,68,68,0.25)'
                  }}
                >
                  <FiAlertTriangle size={28} color="#ef4444" />
                </motion.div>

                <h1 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.5rem',
                  lineHeight: 1.2,
                  color: '#111827'
                }}>
                  Something went wrong
                </h1>
                <p style={{
                  margin: '0 0 1.5rem 0',
                  color: '#374151'
                }}>
                  The application encountered an unexpected error. You can refresh the page to continue.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.reload()}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: 10,
                      border: '1px solid rgba(99,102,241,0.35)',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Refresh page
                  </motion.button>

                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/"
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: 10,
                      border: '1px solid rgba(17,24,39,0.12)',
                      background: 'rgba(255,255,255,0.8)',
                      color: '#111827',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    Go home
                  </motion.a>
                </div>

                {process.env.NODE_ENV !== 'production' && this.state.error && (
                  <details style={{ marginTop: '1.25rem', textAlign: 'left', color: '#6b7280' }}>
                    <summary style={{ cursor: 'pointer' }}>Error details (dev only)</summary>
                    <pre style={{
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      background: 'rgba(0,0,0,0.05)',
                      padding: '0.75rem',
                      borderRadius: 8,
                      marginTop: '0.5rem'
                    }}>{String(this.state.error)}</pre>
                  </details>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;