import { Header } from '../components/layout/Header';
import { GitBranch, Code, Users, Shield, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router';

export function Landing() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={false} />

      <main>
        <section className="container px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl tracking-tight text-foreground">
              Code hosting for <span className="text-[#ff8c42]">modern teams</span>
            </h1>
            <p className="text-xl text-[#c9d1d9] max-w-2xl mx-auto">
              Collaborate on code with powerful version control, seamless code review, and built-in security.
              Ship faster with Chizel.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="px-6 py-3 bg-[#ff8c42] text-white rounded-md hover:bg-[#ff6b35] transition-colors font-medium"
              >
                Get started for free
              </Link>
              <Link
                to="/signin"
                className="px-6 py-3 bg-secondary text-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/50">
          <div className="container px-4 py-20">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-[#ff8c42]/10 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-[#ff8c42]" />
                </div>
                <h3 className="text-foreground">Powerful version control</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Branch, merge, and collaborate with confidence using industry-standard Git workflows.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-[#ff8c42]/10 flex items-center justify-center">
                  <Code className="h-6 w-6 text-[#ff8c42]" />
                </div>
                <h3 className="text-foreground">Code review built-in</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Review code, suggest changes, and approve pull requests all in one place.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-[#ff8c42]/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#ff8c42]" />
                </div>
                <h3 className="text-foreground">Team collaboration</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Work together seamlessly with team permissions, discussions, and project boards.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="container px-4 py-20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center space-y-3 mb-12">
                <h2 className="text-3xl text-foreground">Built for security and speed</h2>
                <p className="text-[#c9d1d9]">
                  Enterprise-grade features for teams of all sizes
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg border border-border bg-card">
                  <Shield className="h-8 w-8 text-[#ff8c42] mb-3" />
                  <h4 className="mb-2 text-foreground">Security scanning</h4>
                  <p className="text-sm text-[#c9d1d9]">
                    Automatically detect vulnerabilities in your dependencies and code.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card">
                  <Zap className="h-8 w-8 text-[#ff8c42] mb-3" />
                  <h4 className="mb-2 text-foreground">CI/CD integration</h4>
                  <p className="text-sm text-[#c9d1d9]">
                    Deploy with confidence using integrated continuous integration workflows.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card">
                  <Lock className="h-8 w-8 text-[#ff8c42] mb-3" />
                  <h4 className="mb-2 text-foreground">Access control</h4>
                  <p className="text-sm text-[#c9d1d9]">
                    Fine-grained permissions ensure the right people have the right access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/50">
          <div className="container px-4 py-20">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl text-foreground">Ready to get started?</h2>
              <p className="text-[#c9d1d9]">
                Join thousands of developers building the future with Chizel
              </p>
              <Link
                to="/signup"
                className="inline-block px-6 py-3 bg-[#ff8c42] text-white rounded-md hover:bg-[#ff6b35] transition-colors font-medium"
              >
                Create your account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#ff6b35] to-[#ff8c42]"></div>
              <span className="text-sm text-[#c9d1d9]">© 2026 Chizel</span>
            </div>
            <div className="flex gap-6 text-sm text-[#c9d1d9]">
              <a href="#" className="hover:text-[#ff8c42] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#ff8c42] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#ff8c42] transition-colors">Docs</a>
              <a href="#" className="hover:text-[#ff8c42] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
