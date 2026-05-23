import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, Palette } from "lucide-react";

export const Route = createFileRoute("/")({
  component: MuralPage,
});

type Card = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  rotate: number;
};

const palette = [
  "oklch(0.78 0.14 200 / 0.85)",
  "oklch(0.72 0.18 330 / 0.85)",
  "oklch(0.82 0.14 180 / 0.85)",
  "oklch(0.78 0.16 90 / 0.85)",
  "oklch(0.7 0.14 30 / 0.85)",
];

const seed: Card[] = [
  { id: "1", text: "Eu tenho empresas multimilionárias.", x: 40, y: 20, color: palette[0], rotate: -3 },
  { id: "2", text: "Eu sou abundante em todas as áreas da minha vida.", x: 320, y: 60, color: palette[1], rotate: 2 },
  { id: "3", text: "Eu mereço uma vida extraordinária.", x: 160, y: 240, color: palette[2], rotate: -1 },
  { id: "4", text: "Eu sustento minha frequência todos os dias.", x: 500, y: 220, color: palette[3], rotate: 3 },
];

const STORAGE_KEY = "quantum.mural.v1";

function MuralPage() {
  const [cards, setCards] = useState<Card[]>(seed);
  const [dragId, setDragId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCards(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {}
  }, [cards]);

  function addCard() {
    const id = crypto.randomUUID();
    setCards((c) => [
      ...c,
      {
        id,
        text: "Nova afirmação...",
        x: 80 + Math.random() * 200,
        y: 80 + Math.random() * 200,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotate: (Math.random() - 0.5) * 6,
      },
    ]);
  }

  function onPointerDown(e: React.PointerEvent, card: Card) {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = boardRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left - card.x, y: e.clientY - rect.top - card.y };
    setDragId(card.id);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.current.x;
    const y = e.clientY - rect.top - offset.current.y;
    setCards((cs) => cs.map((c) => (c.id === dragId ? { ...c, x: Math.max(0, x), y: Math.max(0, y) } : c)));
  }
  function onPointerUp() {
    setDragId(null);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Mural da Manifestação</p>
          <h1 className="mt-2 font-display text-4xl md:text-6xl leading-tight">
            <span className="text-aurora">O que você declara</span>
            <br /> torna-se a sua realidade.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Solte pensamentos, afirmações e intenções. Arraste, organize e veja seu mundo interno ganhar forma.
          </p>
        </div>
        <button
          onClick={addCard}
          className="glass-strong inline-flex items-center gap-2 self-start rounded-full px-5 py-3 text-sm font-medium ring-glow transition hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Nova afirmação
        </button>
      </motion.header>

      <div
        ref={boardRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="glass relative h-[70vh] overflow-hidden rounded-3xl"
        style={{ backgroundImage: "radial-gradient(circle at 30% 20%, oklch(1 0 0 / 0.04), transparent 60%)" }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute w-56 cursor-grab select-none touch-none active:cursor-grabbing"
            style={{ left: card.x, top: card.y, transform: `rotate(${card.rotate}deg)` }}
            onPointerDown={(e) => onPointerDown(e, card)}
          >
            <div
              className="rounded-2xl p-4 text-foreground shadow-2xl backdrop-blur"
              style={{ background: card.color, boxShadow: "0 20px 40px -10px oklch(0 0 0 / 0.5)" }}
            >
              <textarea
                value={card.text}
                onChange={(e) =>
                  setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, text: e.target.value } : c)))
                }
                rows={3}
                className="w-full resize-none bg-transparent font-display text-lg leading-snug text-background outline-none placeholder:text-background/50"
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCards((cs) =>
                      cs.map((c) =>
                        c.id === card.id
                          ? { ...c, color: palette[(palette.indexOf(c.color) + 1) % palette.length] }
                          : c,
                      ),
                    );
                  }}
                  className="rounded-full bg-background/20 p-1.5 text-background/80 hover:bg-background/30"
                  aria-label="Mudar cor"
                >
                  <Palette className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCards((cs) => cs.filter((c) => c.id !== card.id));
                  }}
                  className="rounded-full bg-background/20 p-1.5 text-background/80 hover:bg-destructive/80"
                  aria-label="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
