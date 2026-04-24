import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChzHeader } from '../components/chz-comp/ChzHeader';
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
      <ChzHeader pageTitle="Sign-Up" /*isLoggedIn={false}*/ />

      <main className="container px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="space-y-6 rounded-lg border border-border bg-card p-8">
            <div className="space-y-2 text-center">
              <BrandLogo
                className="mx-auto w-fit"
                imageClassName="h-12 w-12"
                showLabel={false}
              />
              <h1 className="text-2xl text-foreground">Create Your Account</h1>
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
