import { Suspense } from "react";
import Link from "next/link";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Shared shelves",
    body: "Organize what you want to read, what you are reading, and what you cannot stop recommending."
  },
  {
    title: "Review feed",
    body: "Keep up with friends, leave notes, rate books, and surface the reviews worth reading."
  },
  {
    title: "Reading journal",
    body: "Log pages, track streaks, and build a cleaner history of your reading life."
  }
];

const faqs = [
  {
    q: "Is Shelf free to use?",
    a: "Yes. This MVP is free and includes shelves, reviews, follows, and reading stats."
  },
  {
    q: "Can I import my Goodreads data?",
    a: "Yes. Upload a Goodreads CSV from Settings and Shelf will merge what it can without duplicates."
  },
  {
    q: "Do I need an app to use it?",
    a: "No. Shelf runs entirely in the browser."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-warm-fade">
      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
              S
            </div>
            <span className="font-display text-2xl">Shelf</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#faqs">FAQs</a>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Link href="/?auth=login">
              <Button variant="outline" className="w-full sm:w-auto">Log in</Button>
            </Link>
            <Link href="/?auth=signup">
              <Button variant="light" className="w-full sm:w-auto">Sign Up</Button>
            </Link>
          </div>
        </nav>

        <section className="grid gap-8 py-12 sm:py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10 md:py-20">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-600">
              Reading, with context
            </div>
            <h1 className="max-w-2xl font-display text-4xl leading-tight text-slate-950 sm:text-5xl md:text-7xl">
              Read books, together.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
              Shelf is a calmer place to track your reading, trade notes with friends, and actually
              remember what moved you.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/?auth=signup">
                <Button size="lg" variant="light">
                  Sign Up
                </Button>
              </Link>
              <Link href="/?auth=login" className="text-sm font-semibold text-slate-600">
                Already have an account?
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:rounded-[36px] sm:p-5">
            <div className="rounded-[24px] bg-midnight bg-navy-grid bg-[length:32px_32px] p-4 text-white sm:rounded-[30px] sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Trending review</p>
                  <p className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                    Quiet, vivid, impossible to shake.
                  </p>
                </div>
                <div className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold text-slate-950">Beta</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[140px_1fr] md:grid-cols-[160px_1fr]">
                <div className="mx-auto aspect-[3/4] w-full max-w-[210px] rounded-[24px] bg-gradient-to-br from-[#243554] via-[#15203a] to-[#0d1322] p-4 sm:mx-0">
                  <div className="flex h-full items-center justify-center rounded-[20px] border border-white/10 px-4 text-center font-display text-2xl leading-tight sm:text-3xl">
                    Sea of Quiet Maps
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/80">
                      “One of those rare reading apps that makes the social layer feel thoughtful instead
                      of noisy.”
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["Trending", "Shelves", "Journal"].map((item) => (
                      <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">{item}</p>
                        <p className="mt-2 text-xl font-semibold">
                          {item === "Trending" ? "18" : item === "Shelves" ? "6" : "12d"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-10 sm:py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[28px] border border-slate-200 bg-white p-6">
                <h2 className="font-display text-2xl">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faqs" className="py-10 sm:py-12">
          <div className="rounded-[28px] bg-white p-6 sm:rounded-[32px] sm:p-8">
            <h2 className="font-display text-2xl sm:text-3xl">FAQs</h2>
            <div className="mt-6 grid gap-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-[24px] border border-slate-200 p-5">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
