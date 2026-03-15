import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { RepositoryProvider } from './context/RepositoryContext';

export default function App() {
  return (
    <ThemeProvider>
      <RepositoryProvider>
        <RouterProvider router={router} />
      </RepositoryProvider>
    </ThemeProvider>
  );
}
