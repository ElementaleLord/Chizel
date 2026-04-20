import { Header } from '../components/layout/Header';
import { GitBranch, Code, Users, Shield, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router';
import { BrandLogo } from '../components/layout/BrandLogo';

export function Landing() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={false} />

      <main>
        <section className="container px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h1 className="text-5xl tracking-tight text-foreground md:text-6xl">
              Code hosting for <span className="text-[#fda410]">modern teams</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-[#c9d1d9]">
              Collaborate on code with powerful version control, seamless code review, and built-in security.
              Ship faster with Chizel.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="rounded-md bg-[#fda410] px-6 py-3 font-medium text-white transition-colors hover:bg-[#e38c05]"
              >
                Get started for free
              </Link>
              <Link
                to="/signin"
                className="rounded-md bg-secondary px-6 py-3 font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/50">
          <div className="container px-4 py-20">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fda410]/10">
                  <GitBranch className="h-6 w-6 text-[#fda410]" />
                </div>
                <h3 className="text-foreground">Powerful version control</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Branch, merge, and collaborate with confidence using industry-standard Git workflows.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fda410]/10">
                  <Code className="h-6 w-6 text-[#fda410]" />
                </div>
                <h3 className="text-foreground">Code review built-in</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Review code, suggest changes, and approve pull requests all in one place.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fda410]/10">
                  <Users className="h-6 w-6 text-[#fda410]" />
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
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 space-y-3 text-center">
                <h2 className="text-3xl text-foreground">Built for security and speed</h2>
                <p className="text-[#c9d1d9]">Enterprise-grade features for teams of all sizes</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-6">
                  <Shield className="mb-3 h-8 w-8 text-[#fda410]" />
                  <h4 className="mb-2 text-foreground">Security scanning</h4>
                  <p className="text-sm text-[#c9d1d9]">
                    Automatically detect vulnerabilities in your dependencies and code.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Zap className="mb-3 h-8 w-8 text-[#fda410]" />
                  <h4 className="mb-2 text-foreground">CI/CD integration</h4>
                  <p className="text-sm text-[#c9d1d9]">
                    Deploy with confidence using integrated continuous integration workflows.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Lock className="mb-3 h-8 w-8 text-[#fda410]" />
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
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <h2 className="text-3xl text-foreground">Ready to get started?</h2>
              <p className="text-[#c9d1d9]">Join thousands of developers building the future with Chizel</p>
              <Link
                to="/signup"
                className="inline-block rounded-md bg-[#fda410] px-6 py-3 font-medium text-white transition-colors hover:bg-[#e38c05]"
              >
                Create your account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <BrandLogo imageClassName="h-6 w-6" labelClassName="text-sm text-[#c9d1d9]" />
              <span className="text-sm text-[#c9d1d9]">© 2026</span>
            </div>
            <div className="flex gap-6 text-sm text-[#c9d1d9]">
              <span className="transition-colors hover:text-[#fda410]">Terms</span>
              <span className="transition-colors hover:text-[#fda410]">Privacy</span>
              <span className="transition-colors hover:text-[#fda410]">Docs</span>
              <span className="transition-colors hover:text-[#fda410]">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
