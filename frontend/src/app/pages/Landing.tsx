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
              Code Hosting For <span className="text-[#fda410]">Modern Teams</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-[#c9d1d9]">
              Collaborate On Code With Version Control And Code Review. <br />
              With Chizel, We Prioritize Your Privacy.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="rounded-md bg-[#fda410] px-6 py-3 font-medium text-white transition-colors hover:bg-[#e38c05]"
              >
                Get Started For Free
              </Link>
              <Link
                to="/signin"
                className="rounded-md bg-secondary px-6 py-3 font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                Sign In
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
                <h3 className="text-foreground">Version Control</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Branch, Merge, And Collaborate With Confidence Using chz Workflows.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fda410]/10">
                  <Code className="h-6 w-6 text-[#fda410]" />
                </div>
                <h3 className="text-foreground">Code Review</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Review Code, Suggest Changes, And Approve Pull Requests All In One Place.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fda410]/10">
                  <Users className="h-6 w-6 text-[#fda410]" />
                </div>
                <h3 className="text-foreground">Team Repository</h3>
                <p className="text-sm text-[#c9d1d9]">
                  Work Together Seamlessly With Team Repositories.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
