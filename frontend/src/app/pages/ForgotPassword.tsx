import { Header } from '../components/layout/Header';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={false} />

      <main className="container px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
                <span className="text-white text-xl font-bold">C</span>
              </div>
              <h1 className="text-2xl text-foreground">Reset your password</h1>
              <p className="text-sm text-[#c9d1d9]">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-foreground">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-[#7d8590] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-[#ff8c42] text-white rounded-md hover:bg-[#ff6b35] transition-colors font-medium"
              >
                Send reset link
              </button>
            </form>

            <Link
              to="/signin"
              className="flex items-center justify-center gap-2 text-sm text-[#c9d1d9] hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
