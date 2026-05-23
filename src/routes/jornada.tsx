import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Lock, Check, Sparkles } from "lucide-react";
import { journeyDays, weekMeta } from "@/lib/journey-data";

export const Route = createFileRoute("/jornada")({
  component: JourneyPage,
  head: () => ({
    meta: [
      { title: "Jornada de 21 dias — Quantum" },
      { name: "description", content: "Sua timeline cinematográfica de 21 dias dividida em 3 semanas: Observação, Propósito Claro e Nova Identidade." },
    ],
  }),
});

const STORAGE_KEY = "quantum.journey.v1";

function JourneyPage() {
  // For v1, currentDay derived from localStorage. Defaults to 1.
  const currentDay =
    typeof window !== "undefined"
      ? Number(localStorage.getItem(STORAGE_KEY) ?? "1") || 1
      : 1;

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 text-center"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Sua sessão</p>
        <h1 className="mt-2 font-display text-5xl md:text-7xl leading-tight">
          <span className="text-aurora">21 dias</span> de transformação
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Três semanas. Uma passagem. Caminhe um dia por vez — o próximo se abre quando o sol nascer novamente.
        </p>
      </motion.div>

      {[1, 2, 3].map((week) => {
        const meta = weekMeta[week as 1 | 2 | 3];
        const days = journeyDays.filter((d) => d.week === week);
        return (
          <section key={week} className="mb-16">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Semana {week}</p>
                <h2 className="mt-1 font-display text-3xl md:text-4xl">{meta.title}</h2>
                <p className="mt-1 text-muted-foreground">{meta.description}</p>
              </div>
            </div>

            <ol className="relative space-y-3 md:space-y-4 border-l border-border/60 pl-6">
              {days.map((d, i) => {
                const completed = d.day < currentDay;
                const isCurrent = d.day === currentDay;
                const locked = d.day > currentDay;
                return (
                  <motion.li
                    key={d.day}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.05 }}
                    className="relative"
                  >
                    <span
                      className={`absolute -left-[34px] top-5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                        completed
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                            ? "bg-accent text-accent-foreground ring-glow animate-pulse-glow"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {completed ? <Check className="h-3 w-3" /> : locked ? <Lock className="h-3 w-3" /> : d.day}
                    </span>

                    {locked ? (
                      <div className="glass rounded-2xl p-5 opacity-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Dia {d.day}</p>
                            <h3 className="font-display text-xl">{d.title}</h3>
                          </div>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">Abre amanhã.</p>
                      </div>
                    ) : (
                      <Link
                        to="/jornada/dia/$day"
                        params={{ day: String(d.day) }}
                        className={`group block rounded-2xl p-5 transition hover:translate-y-[-2px] ${
                          isCurrent ? "glass-strong ring-glow" : "glass"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Dia {d.day}</p>
                            <h3 className="font-display text-xl">{d.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{d.focus}</p>
                          </div>
                          {isCurrent && (
                            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                              <Sparkles className="h-3 w-3" /> hoje
                            </span>
                          )}
                        </div>
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
