import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

const App = () => (
  <AuthProvider>
    <AppRouter />
    <Toaster 
      position="top-right" 
      toastOptions={{
        className: '!bg-slate-900 !text-white !border !border-white/10 !rounded-2xl',
        duration: 4000,
      }} 
    />
  </AuthProvider>
);

export default App;
