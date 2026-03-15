import { RouterProvider } from 'react-router';
import { router } from './routes.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { RepositoryProvider } from './context/RepositoryContext.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <RepositoryProvider>
        <RouterProvider router={router} />
      </RepositoryProvider>
    </ThemeProvider>
  );
}