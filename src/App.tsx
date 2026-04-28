import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallbackUI from './components/common/ErrorFallbackUI';
import { AuthProvider } from './auth/AuthProvider';

function BoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={<ErrorFallbackUI />}>{children}</ErrorBoundary>;
}
const App = () => {
  return (
    <div>
      <AuthProvider>
        <Toaster reverseOrder={false} toastOptions={{ duration: 3000, position: 'top-right' }} />
        <BoundaryWrapper>
          <AppRoutes />
        </BoundaryWrapper>
      </AuthProvider>
    </div>
  );
};
export default App;
