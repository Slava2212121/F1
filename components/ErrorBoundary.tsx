import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border border-f1-red/30">
            <AlertTriangle className="w-16 h-16 text-f1-red mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Упс! Что-то пошло не так</h1>
            <p className="text-gray-400 mb-6 text-sm">
              {this.state.error?.message || 'Произошла непредвиденная ошибка в приложении.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-f1-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 w-full"
            >
              <RefreshCw size={18} />
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
