import React from 'react';
import { Alert, AlertDescription } from '@/components/UI/alert';
import { Button } from '@/components/UI/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a security/router related error
    if (error.message?.includes('replaceState') || 
        error.message?.includes('SecurityError') ||
        error.message?.includes('History')) {
      console.warn('Router/Security error detected, attempting recovery...');
      
      // Try to clean up any problematic URL state
      try {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState(null, '', cleanUrl);
      } catch (cleanupError) {
        console.error('Could not clean up URL:', cleanupError);
      }
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    // Clear error state and reload
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Clean URL and reload
    try {
      const cleanUrl = `${window.location.origin}/login`;
      window.location.href = cleanUrl;
    } catch (error) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-3">
                  <h3 className="font-semibold">Something went wrong</h3>
                  <p className="text-sm">
                    {this.state.error?.message?.includes('replaceState') || 
                     this.state.error?.message?.includes('SecurityError') ? 
                      'There was an issue with the authentication redirect. This is usually temporary.' :
                      'An unexpected error occurred while loading the application.'
                    }
                  </p>
                  <Button 
                    onClick={this.handleRefresh}
                    className="w-full mt-3"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Application
                  </Button>
                    {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-xs">
                      <summary className="cursor-pointer text-gray-600">
                        Developer Info
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap text-red-600 bg-red-100 p-2 rounded">
                        {this.state.error && this.state.error.toString()}
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
