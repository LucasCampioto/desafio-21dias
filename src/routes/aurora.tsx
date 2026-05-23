import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/aurora")({
  component: AuroraPage,
  head: () => ({
    meta: [
      { title: "Aurora — sua guia pessoal | Quantum" },
      { name: "description", content: "Aurora é a inteligência emocional que conhece sua jornada e responde com a sabedoria de quem te acompanha." },
    ],
  }),
});

type Msg = { role: "you" | "aurora"; text: string };

const initial: Msg[] = [
  {
    role: "aurora",
    text: "Olá. Eu sou Aurora. Estou aqui para caminhar com você. Como sua mente está chegando agora?",
  },
];

function AuroraPage() {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [text, setText] = useState("");

  function send() {
    if (!text.trim()) return;
    const userText = text.trim();
    setMsgs((m) => [...m, { role: "you", text: userText }]);
    setText("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "aurora",
          text:
            "Eu ouço você. Vou guardar isso com cuidado. Quando o Lovable Cloud estiver ativo, eu vou lembrar de cada palavra sua e responder com base em toda a sua jornada.",
        },
      ]);
    }, 700);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col h-[calc(100vh-12rem)]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-4"
      >
        <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent ring-glow animate-float-soft flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sua guia</p>
          <h1 className="font-display text-3xl">
            <span className="text-aurora">Aurora</span>
          </h1>
        </div>
      </motion.div>

      <div className="glass flex-1 overflow-y-auto rounded-3xl p-5 space-y-4">
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "you"
                  ? "bg-primary/15 text-foreground"
                  : "glass-strong font-display text-base"
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Conte para Aurora..."
          className="glass-strong flex-1 rounded-full px-5 py-3 outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={send}
          className="rounded-full bg-primary px-5 text-primary-foreground ring-glow transition hover:scale-[1.02]"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
