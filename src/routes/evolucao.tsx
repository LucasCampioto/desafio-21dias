import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Heart, Brain } from "lucide-react";

export const Route = createFileRoute("/evolucao")({
  component: EvolutionPage,
  head: () => ({
    meta: [
      { title: "Evolução — Quantum" },
      { name: "description", content: "Reflexo inteligente da sua jornada: padrões, mudanças de linguagem e crescimento emocional." },
    ],
  }),
});

const insights = [
  {
    icon: Heart,
    label: "Tom emocional",
    title: "Você está mais sereno",
    body: "Nas últimas escritas, palavras de medo deram lugar a palavras de aceitação. Sua frequência está se elevando.",
  },
  {
    icon: Brain,
    label: "Padrão recorrente",
    title: "Comparação ainda aparece",
    body: "Notei menções a comparação no Dia 5 e Dia 9. Talvez seja hora de uma pequena pausa das redes hoje.",
  },
  {
    icon: TrendingUp,
    label: "Crescimento",
    title: "Você está agindo mais",
    body: "Verbos no presente aumentaram 38%. Identidade e ação estão começando a caminhar juntas.",
  },
];

function EvolutionPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Espelho inteligente</p>
        <h1 className="mt-2 font-display text-5xl md:text-7xl">
          Sua <span className="text-aurora">evolução</span>
        </h1>
        <p className="mt-4 mx-auto max-w-xl text-muted-foreground">
          Não são gráficos. É um reflexo. Aurora lê o que você escreve e devolve o que está se transformando dentro de você.
        </p>
      </motion.header>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { k: "Dias percorridos", v: "7", s: "de 21" },
          { k: "Palavras escritas", v: "2.184", s: "nesta sessão" },
          { k: "Frequência média", v: "↑ 38%", s: "vs início" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="glass rounded-2xl p-6 text-center"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.k}</p>
            <p className="mt-2 font-display text-4xl text-aurora">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.s}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {insights.map((it, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-strong rounded-3xl p-6 md:p-8 flex gap-5"
          >
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-glow">
              <it.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{it.label}</p>
              <h3 className="mt-1 font-display text-2xl">{it.title}</h3>
              <p className="mt-2 text-muted-foreground">{it.body}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="glass mt-10 rounded-3xl p-8 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-accent" />
        <p className="mt-3 font-display text-xl">
          Conecte o Lovable Cloud para que Aurora leia, lembre e te acompanhe de verdade.
        </p>
      </div>
    </div>
  );
}
