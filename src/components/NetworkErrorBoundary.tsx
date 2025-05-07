import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wifi, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Verificar se é um erro de rede
    const isNetworkError = (
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('conexão') ||
      error.message.includes('internet')
    );

    // Apenas capturar erros de rede
    if (isNetworkError) {
      return { hasError: true, error };
    }

    // Para outros tipos de erro, deixar o erro propagar
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Erro de rede capturado:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback personalizado fornecido como prop
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão para erros de rede
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="w-full max-w-md p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <Wifi className="h-6 w-6 text-red-600" />
              </div>
              
              <h2 className="text-xl font-semibold">Problema de conexão</h2>
              
              <p className="text-muted-foreground">
                {this.state.error?.message || 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'}
              </p>
              
              <Button 
                onClick={this.handleRetry}
                className="mt-4 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;
