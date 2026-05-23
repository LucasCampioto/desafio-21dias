export const journeyDays = [
  // Semana 1 — Observação
  { day: 1, week: 1, title: "O Observador", focus: "Observar pensamentos recorrentes e padrões emocionais.", declaration: "Eu começo a perceber e direcionar o foco da minha mente.", questions: ["Quais pensamentos se repetem em mim hoje?", "Que emoção predomina quando ninguém está olhando?", "Onde minha mente vai quando não estou ocupado?"] },
  { day: 2, week: 1, title: "Mudando o Foco", focus: "Reações automáticas e expectativas sobre o futuro.", declaration: "Eu escolho onde colocar minha atenção.", questions: ["Como reajo quando algo dá errado?", "Que futuro eu espero, mesmo sem perceber?", "Como tenho me descrito ultimamente?"] },
  { day: 3, week: 1, title: "O Poder das Palavras", focus: "Substituir linguagem negativa por construtiva.", declaration: "Minhas palavras moldam minha realidade.", questions: ["Quais frases negativas eu repito?", "Como posso reescrevê-las hoje?"] },
  { day: 4, week: 1, title: "Padrões Invisíveis", focus: "Hábitos financeiros e comportamentais ocultos.", declaration: "Eu vejo os padrões que me sustentam.", questions: ["Que padrão financeiro se repete em mim?", "Que hábito emocional virou rotina?"] },
  { day: 5, week: 1, title: "Comparação", focus: "Padrões de comparação e influência social.", declaration: "Eu volto para o meu próprio caminho.", questions: ["Com quem tenho me comparado?", "O que isso revela do que eu desejo?"] },
  { day: 6, week: 1, title: "Jejum do Indesejado", focus: "Soltar realidades indesejadas.", declaration: "Eu solto o que não quero mais carregar.", questions: ["Que vida eu não quero mais viver?", "Que vida nova começa agora?"] },
  { day: 7, week: 1, title: "Liberação do Passado", focus: "Fé, abundância, realidade futura.", declaration: "O passado me ensinou. O futuro me chama.", questions: ["Qual realidade eu desejo habitar?", "Qual crença limitante preciso liberar?"] },

  // Semana 2 — Propósito Claro
  { day: 8, week: 2, title: "Definindo o Alvo", focus: "Visão, clareza e direção intencional.", declaration: "Eu sei para onde estou indo.", questions: ["Qual é o meu alvo claro para os próximos 12 meses?", "O que faria meu coração disparar de alegria?"] },
  { day: 9, week: 2, title: "Desejo Ardente", focus: "Motivação emocional e propósito.", declaration: "Meu desejo é o motor da minha transformação.", questions: ["O que eu mais desejo de verdade?", "Por que isso importa tanto para mim?"] },
  { day: 10, week: 2, title: "A Imagem da Realidade", focus: "Visualização do futuro com imersão emocional.", declaration: "Eu vejo, sinto e habito o que está vindo.", questions: ["Como é um dia comum na minha vida ideal?", "O que eu sinto quando me imagino lá?"] },
  { day: 11, week: 2, title: "Gratidão Antecipada", focus: "Gratidão pelo que ainda virá.", declaration: "Eu agradeço pelo que já é meu.", questions: ["Pelo que eu sou grato hoje?", "O que eu agradeço como se já tivesse acontecido?"] },
  { day: 12, week: 2, title: "Nova Identidade", focus: "Afirmações de identidade e autoimagem.", declaration: "Eu sou a versão que escolhi ser.", questions: ["Quem é a pessoa que vive a vida que desejo?", "Que afirmações ela repete todos os dias?"] },
  { day: 13, week: 2, title: "Merecimento", focus: "Autovalor e qualidades pessoais.", declaration: "Eu mereço tudo aquilo que ouso desejar.", questions: ["Quais são as minhas qualidades reais?", "Onde eu duvido do meu merecimento?"] },
  { day: 14, week: 2, title: "Selamento do Propósito", focus: "Definir visão de vida e identidade de longo prazo.", declaration: "Meu propósito está selado dentro de mim.", questions: ["Qual é a minha missão nesta vida?", "Como quero ser lembrado?"] },

  // Semana 3 — Nova Identidade
  { day: 15, week: 3, title: "A Nova Identidade", focus: "Mudança de identidade e coerência emocional.", declaration: "Eu já sou quem escolhi me tornar.", questions: ["Como age a nova versão de mim?", "Do que ela não participa mais?"] },
  { day: 16, week: 3, title: "O Poder da Decisão", focus: "Ação decisiva e compromisso.", declaration: "Cada decisão é uma declaração de quem eu sou.", questions: ["Que decisão preciso tomar hoje?", "Que decisão venho adiando?"] },
  { day: 17, week: 3, title: "Ação Coerente", focus: "Execução alinhada e ação imediata.", declaration: "Minha ação é o reflexo da minha identidade.", questions: ["Qual o próximo passo coerente com quem sou?", "Onde minha ação ainda não acompanha minha visão?"] },
  { day: 18, week: 3, title: "Dinheiro e Valor", focus: "Crenças sobre dinheiro e consciência financeira.", declaration: "Eu sou um canal natural de prosperidade.", questions: ["O que aprendi sobre dinheiro quando criança?", "Como me sinto ao receber valor?"] },
  { day: 19, week: 3, title: "Sustentação da Frequência", focus: "Manutenção emocional e estado consciente.", declaration: "Eu cuido do meu estado interior todos os dias.", questions: ["O que me tira da minha frequência?", "O que me devolve a ela?"] },
  { day: 20, week: 3, title: "Prova da Transformação", focus: "Reconhecimento da evolução emocional.", declaration: "Eu reconheço a minha própria transformação.", questions: ["O que mudou em mim nestes 20 dias?", "Quais provas a vida me trouxe?"] },
  { day: 21, week: 3, title: "O Colapso Consciente", focus: "Integração de identidade e declaração da realidade futura.", declaration: "Eu colapso, agora, a realidade que escolhi viver.", questions: ["Que realidade eu declaro habitar a partir de hoje?", "Como eu honro essa nova versão de mim?"] },
] as const;

export type JourneyDay = (typeof journeyDays)[number];

export const weekMeta = {
  1: { title: "Observação", subtitle: "Ver para mudar", description: "Aprenda a observar pensamentos, emoções e padrões automáticos." },
  2: { title: "Propósito Claro", subtitle: "Definir para criar", description: "Defina direção, visão de futuro e identidade desejada." },
  3: { title: "Nova Identidade", subtitle: "Tornar-se", description: "Integre quem você decidiu ser e sustente sua frequência." },
} as const;
