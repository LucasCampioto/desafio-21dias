import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mic, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { journeyDays, weekMeta } from "@/lib/journey-data";

export const Route = createFileRoute("/jornada/dia/$day")({
  component: DayPage,
  loader: ({ params }) => {
    const day = Number(params.day);
    const data = journeyDays.find((d) => d.day === day);
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Dia ${loaderData?.data.day} — ${loaderData?.data.title} | Quantum` },
      { name: "description", content: loaderData?.data.focus },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl pt-20 text-center">
      <h1 className="font-display text-3xl">Este dia ainda não existe.</h1>
      <Link to="/jornada" className="mt-4 inline-block text-primary underline">
        Voltar à jornada
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-xl pt-20 text-center">
      <h1 className="font-display text-3xl">Algo escapou ao foco.</h1>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-4 py-2 text-primary-foreground">
        Tentar novamente
      </button>
    </div>
  ),
});

function DayPage() {
  const { data } = Route.useLoaderData();
  const meta = weekMeta[data.week];
  const storageKey = `quantum.day.${data.day}`;
  const [reflection, setReflection] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setReflection(parsed.reflection ?? "");
        setDone(Boolean(parsed.done));
      }
    } catch {}
  }, [storageKey]);

  function save() {
    localStorage.setItem(storageKey, JSON.stringify({ reflection, done: true }));
    setDone(true);
    // unlock next day
    const next = data.day + 1;
    localStorage.setItem("quantum.journey.v1", String(Math.min(21, next)));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/jornada"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Jornada
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Semana {data.week} · {meta.title}
        </p>
        <h1 className="mt-2 font-display text-5xl md:text-7xl leading-tight">
          Dia {data.day}
          <br />
          <span className="text-aurora">{data.title}</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">{data.focus}</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="glass-strong mt-10 rounded-3xl p-8 ring-glow"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Declaração do dia</p>
        <blockquote className="mt-3 font-display text-2xl md:text-3xl leading-snug">
          “{data.declaration}”
        </blockquote>
      </motion.section>

      <section className="mt-10">
        <h2 className="font-display text-2xl mb-4">Perguntas para reflexão</h2>
        <ul className="space-y-3">
          {data.questions.map((q, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <p className="text-sm text-muted-foreground">0{i + 1}</p>
              <p className="mt-1 font-display text-xl">{q}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">Sua escrita de hoje</h2>
          <button
            disabled
            title="Disponível com Lovable Cloud"
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground opacity-60"
          >
            <Mic className="h-3.5 w-3.5" /> Gravar voz
          </button>
        </div>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Escreva sem julgar. Deixe a verdade vir."
          className="glass min-h-[220px] w-full resize-y rounded-2xl p-5 text-base leading-relaxed outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40"
        />
        <div className="mt-4 flex items-center justify-end gap-3">
          {done && (
            <span className="inline-flex items-center gap-1.5 text-sm text-primary">
              <Check className="h-4 w-4" /> dia concluído
            </span>
          )}
          <button
            onClick={save}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground ring-glow transition hover:scale-[1.02]"
          >
            Selar o dia
          </button>
        </div>
      </section>
    </div>
  );
}
