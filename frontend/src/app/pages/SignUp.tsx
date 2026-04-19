import { Header } from '../components/layout/Header';
import { Link } from 'react-router';
import { Github } from 'lucide-react';
import { BrandLogo } from '../components/layout/BrandLogo';

export function SignUp() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={false} />

      <main className="container px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <BrandLogo
                className="mx-auto w-fit"
                imageClassName="h-12 w-12"
                showLabel={false}
              />
              <h1 className="text-2xl text-foreground">Create your account</h1>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-md transition-colors text-foreground">
                <Github className="h-5 w-5" />
                <span className="text-sm">Continue with GitHub</span>
              </button>
              <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-md transition-colors text-foreground">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm text-foreground">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-[#7d8590] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-foreground">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-[#7d8590] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-foreground">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-[#7d8590] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-[#c9d1d9]">
                  Must be at least 8 characters
                </p>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-[#fda410] text-white rounded-md hover:bg-[#e38c05] transition-colors font-medium"
              >
                Create account
              </button>
            </form>

            <p className="text-xs text-[#c9d1d9] text-center">
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
