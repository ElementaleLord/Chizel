import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Github } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { BrandLogo } from '../components/layout/BrandLogo';
import { useAuth } from '../components/auth/AuthContext';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signUp(email, password, username);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={false} />

      <main className="container px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="space-y-6 rounded-lg border border-border bg-card p-8">
            <div className="space-y-2 text-center">
              <BrandLogo
                className="mx-auto w-fit"
                imageClassName="h-12 w-12"
                showLabel={false}
              />
              <h1 className="text-2xl text-foreground">Create your account</h1>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-secondary px-4 py-2.5 text-foreground transition-colors hover:bg-secondary/80"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm">Continue with GitHub</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-secondary px-4 py-2.5 text-foreground transition-colors hover:bg-secondary/80"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm">Continue with Google</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-[#c9d1d9]">Or continue with</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm text-foreground">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="johndoe"
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-[#7d8590] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-foreground">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-[#7d8590] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-foreground">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder:text-[#7d8590] focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-[#c9d1d9]">
                  Must be at least 8 characters
                </p>
              </div>
              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-[#fda410] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#e38c05] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-xs text-[#c9d1d9]">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-[#fda410] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#fda410] hover:underline">Privacy Policy</a>
            </p>

            <p className="text-center text-sm text-[#c9d1d9]">
              Already have an account?{' '}
              <Link to="/signin" className="text-[#fda410] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
