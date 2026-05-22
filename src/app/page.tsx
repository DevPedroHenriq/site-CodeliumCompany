'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare,
  CalendarCheck,
  Globe,
  ShieldCheck,
  TrendingUp,
  Users,
  Phone,
  Menu,
  X,
  ChevronRight,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  ExternalLink,
} from 'lucide-react';

/* ───────────────────────── Animated Section Wrapper ───────────────────────── */
function Section({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── CHAT SIMULATION ───────────────────────── */
interface ChatMessage {
  id: number;
  sender: 'bot' | 'patient';
  text: string;
  time: string;
  type?: 'text' | 'confirmation';
}

/* Conversa realista: o PACIENTE inicia o contacto */
const CHAT_SCRIPT: ChatMessage[] = [
  {
    id: 1,
    sender: 'patient',
    text: 'Oi, vocês fazem limpeza dental?',
    time: '14:01',
  },
  {
    id: 2,
    sender: 'bot',
    text: 'Olá! Fazemos sim 😊 Quer agendar um horário?',
    time: '14:01',
  },
  {
    id: 3,
    sender: 'patient',
    text: 'Quero sim, tem pra essa semana?',
    time: '14:02',
  },
  {
    id: 4,
    sender: 'bot',
    text: 'Temos disponibilidade na quinta às 15h ou sexta às 10h. Qual prefere?',
    time: '14:02',
  },
  {
    id: 5,
    sender: 'patient',
    text: 'Quinta às 15h.',
    time: '14:02',
  },
  {
    id: 6,
    sender: 'bot',
    text: 'Perfeito! Agendado ✅\nQualquer dúvida é só chamar, te esperamos!',
    time: '14:02',
    type: 'confirmation',
  },
  {
    id: 7,
    sender: 'patient',
    text: 'Obrigado!',
    time: '14:03',
  },
  {
    id: 8,
    sender: 'bot',
    text: 'Nós que agradecemos, até lá! 😁',
    time: '14:03',
  },
];

/*
  Timing da simulação (ritmo natural de WhatsApp):
  
  t=1.5s   → paciente envia (msg 1)
  t=3s     → bot digita...
  t=5.5s   → bot envia (msg 2)
  t=8.5s   → paciente responde (msg 3)
  t=10s    → bot digita...
  t=13s    → bot envia (msg 4)
  t=15.5s  → paciente responde (msg 5)
  t=17s    → bot digita...
  t=20s    → bot confirma (msg 6)
  t=22.5s  → paciente agradece (msg 7)
  t=24s    → bot digita...
  t=26.5s  → bot finaliza (msg 8)
  t=26.5-39s → conclusão visível ~12 segundos
  t=39s    → recomeça
*/

function TypingIndicator() {
  return (
    <div className="chat-msg-in flex items-end gap-2 mb-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/20 border border-brand-500/30">
        <Bot className="h-3.5 w-3.5 text-brand-400" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-[#162032] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function ChatMessageBubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.sender === 'bot';

  return (
    <div
      className={`chat-msg-in flex items-end gap-2 mb-3 ${
        isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      {isBot && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/20 border border-brand-500/30">
          <Bot className="h-3.5 w-3.5 text-brand-400" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isBot
            ? 'rounded-bl-sm bg-[#162032] border border-white/[0.04]'
            : 'rounded-br-sm bg-brand-600/90 text-white'
        } ${msg.type === 'confirmation' ? 'border border-brand-500/20' : ''}`}
      >
        <p className="text-[13px] leading-relaxed whitespace-pre-line text-slate-100">
          {msg.text}
        </p>
        <div
          className={`flex items-center gap-1 mt-1.5 ${
            isBot ? 'justify-start' : 'justify-end'
          }`}
        >
          <span className="text-[10px] text-slate-500">{msg.time}</span>
          {isBot && msg.type === 'confirmation' && (
            <CheckCircle2 className="h-3 w-3 text-brand-400" />
          )}
          {!isBot && (
            <CheckCircle2 className="h-3 w-3 text-brand-300/70" />
          )}
        </div>
      </div>
    </div>
  );
}

function ChatSimulation() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, []);

  // Animation loop with natural WhatsApp pacing
  useEffect(() => {
    // When each message appears (ms from loop start)
    const MSG_DELAYS = [1500, 5500, 8500, 13000, 15500, 20000, 22500, 26500];
    // When typing indicator shows before bot messages (bot = msg index 1, 3, 5, 7)
    const TYPING_SHOW = [3000, 10000, 17000, 24000];
    // When typing indicator hides (= when the bot message appears)
    const TYPING_HIDE = [5500, 13000, 20000, 26500];
    // How long to keep the final state visible before restarting
    const HOLD_FINAL = 12000;

    function runLoop() {
      setVisibleMessages(0);
      setIsTyping(false);

      // Show messages progressively
      MSG_DELAYS.forEach((delay, i) => {
        const t = setTimeout(() => {
          setVisibleMessages(i + 1);
        }, delay);
        timerRef.current.push(t);
      });

      // Show/hide typing indicator before each bot message
      TYPING_SHOW.forEach((showAt, idx) => {
        const showT = setTimeout(() => {
          setIsTyping(true);
        }, showAt);
        const hideT = setTimeout(() => {
          setIsTyping(false);
        }, TYPING_HIDE[idx]);
        timerRef.current.push(showT, hideT);
      });

      // Restart loop after final message + hold time
      const totalDuration = MSG_DELAYS[MSG_DELAYS.length - 1] + HOLD_FINAL;
      const loopT = setTimeout(() => {
        timerRef.current = [];
        runLoop();
      }, totalDuration);
      timerRef.current.push(loopT);
    }

    runLoop();
  }, []);

  // Auto-scroll to bottom — only within the chat container, never the page
  // Double scroll: once immediately (to get close) and once after the CSS
  // transition finishes (500ms) so the true scrollHeight is correct.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Immediate scroll after DOM paint
    const raf = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

    // Second scroll after transition completes for accuracy
    const timer = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 550);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [visibleMessages, isTyping]);

  return (
    <div className="relative w-full max-w-[380px] mx-auto lg:mx-0">
      {/* Glow behind the chat */}
      <div className="absolute -inset-8 bg-brand-500/[0.07] rounded-[3rem] blur-[60px] pointer-events-none" />

      {/* Phone frame */}
      <div className="relative glass rounded-[1.75rem] p-1.5 glow-brand-strong">
        <div className="relative rounded-[1.5rem] overflow-hidden bg-[#0b1120]">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0e1628] border-b border-white/[0.05]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/20 border border-brand-500/30">
              <Bot className="h-4 w-4 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                Codelium IA
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-[11px] text-brand-400">Online • responde em segundos</span>
              </div>
            </div>
            <Phone className="h-4 w-4 text-slate-500" />
          </div>

          {/* Chat messages area — fixed height, scroll contained inside */}
          <div
            ref={scrollContainerRef}
            className="chat-wallpaper h-[420px] sm:h-[460px] overflow-y-auto px-4 py-4 flex flex-col scroll-smooth"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Date divider */}
            <div className="flex items-center justify-center mb-4">
              <span className="text-[10px] text-slate-600 bg-[#0e1628]/80 rounded-full px-3 py-1">
                Hoje
              </span>
            </div>

            {/* Incoming message notification */}
            <div className="flex items-center justify-center mb-5">
              <span className="text-[10px] text-slate-500/80 bg-[#0e1628]/60 rounded-lg px-3 py-1.5 text-center leading-relaxed max-w-[90%] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                Nova mensagem recebida
              </span>
            </div>

            {/* Messages — all rendered, visibility controlled by state */}
            <div className="flex flex-col">
              {CHAT_SCRIPT.map((msg, i) => (
                <div
                  key={msg.id}
                  className="transition-all duration-500 ease-out"
                  style={{
                    opacity: i < visibleMessages ? 1 : 0,
                    maxHeight: i < visibleMessages ? '500px' : '0px',
                    marginBottom: i < visibleMessages ? '12px' : '0px',
                    overflow: 'hidden',
                  }}
                >
                  <ChatMessageBubble msg={msg} />
                </div>
              ))}
            </div>

            {/* Typing indicator */}
            <div
              className="transition-all duration-300"
              style={{
                opacity: isTyping ? 1 : 0,
                maxHeight: isTyping ? '80px' : '0px',
                overflow: 'hidden',
              }}
            >
              <TypingIndicator />
            </div>
          </div>

          {/* Chat input bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0e1628] border-t border-white/[0.05]">
            <div className="flex-1 flex items-center rounded-full bg-[#162032] border border-white/[0.06] px-4 py-2">
              <span className="text-[12px] text-slate-600">Mensagem…</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500">
              <Send className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Bottom notch */}
          <div className="flex justify-center py-1.5 bg-[#0e1628]">
            <div className="h-1 w-20 rounded-full bg-white/10" />
          </div>
        </div>
      </div>


    </div>
  );
}

/* ───────────────────────── HEADER ───────────────────────── */
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Benefícios', href: '#beneficios' },
    { label: 'Diagnóstico', href: '#diagnostico' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 border border-brand-500/30 transition-all group-hover:bg-brand-500/30 group-hover:shadow-lg group-hover:shadow-brand-500/20">
            <Bot className="h-5 w-5 text-brand-400" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white">
            Codelium<span className="text-brand-400"> Company</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-brand-400 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-brand-400 after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <a
          href="https://wa.me/5522999067522"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-[#d4a843]/40 bg-[#d4a843]/10 px-5 py-2.5 text-sm font-semibold text-[#d4a843] transition-all hover:bg-[#d4a843]/20 hover:border-[#d4a843]/60 hover:shadow-lg hover:shadow-[#d4a843]/10"
        >
          <Phone className="h-4 w-4" />
          Falar no WhatsApp
        </a>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass md:hidden border-t border-white/5"
        >
          <div className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-brand-400"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://wa.me/5522999067522"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-full border border-[#d4a843]/40 bg-[#d4a843]/10 px-5 py-2.5 text-sm font-semibold text-[#d4a843] transition-all hover:bg-[#d4a843]/20"
            >
              <Phone className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
}

/* ───────────────────────── HERO ───────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[#d4a843]/5 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="flex flex-col gap-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400 w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Automação Inteligente para Clínicas
              </div>

              <h1 className="text-[2rem] sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem] font-extrabold leading-[1.08] tracking-tight text-white">
                Encha a sua agenda e reduza faltas com{' '}
                <span className="gradient-text">automações</span> para clínicas.
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg"
            >
              Capte pacientes pelo WhatsApp e Instagram, automatize agendamentos,
              confirmações e transforme mensagens em consultas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-1"
            >
              <a
                href="https://wa.me/5522999067522"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 animate-pulse-glow"
              >
                Solicitar Diagnóstico Rápido
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:border-white/20"
              >
                Ver Serviços
                <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                +50 clínicas atendidas
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                IA 24/7 ativa
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                Resultados em 30 dias
              </div>
            </motion.div>
          </div>

          {/* Right: Live Chat Simulation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <ChatSimulation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SERVICES (Bento Grid) ───────────────────────── */
function Services() {
  const services = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Atendimento imediato com IA 24/7',
      description:
        'Responda pacientes instantaneamente, mesmo fora do horário. A nossa IA qualifica, responde dúvidas e encaminha automaticamente.',
      span: 'md:col-span-2',
      accent: 'brand',
    },
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      title: 'Agenda cheia',
      description:
        'Redução de no-show com lembretes automáticos via WhatsApp. Confirmações e reagendamentos sem esforço.',
      span: 'md:col-span-1',
      accent: 'gold',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Landing Pages & Fluxos n8n',
      description:
        'Páginas de alta conversão e automações integradas com n8n. Do lead ao agendamento, tudo automatizado.',
      span: 'md:col-span-3',
      accent: 'brand',
    },
  ];

  return (
    <Section id="servicos" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            O que a Codelium faz pela sua{' '}
            <span className="gradient-text">clínica</span>
          </h2>
          <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Soluções integradas que transformam a captação e retenção de pacientes
            em processos automatizados e escaláveis.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`${service.span} glass glass-hover rounded-2xl p-7 lg:p-8 cursor-default group transition-all duration-300 flex flex-col`}
            >
              <div
                className={`inline-flex items-center justify-center h-12 w-12 rounded-xl mb-5 transition-all duration-300 shrink-0 ${
                  service.accent === 'brand'
                    ? 'bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/10'
                    : 'bg-[#d4a843]/10 border border-[#d4a843]/20 group-hover:bg-[#d4a843]/20 group-hover:shadow-lg group-hover:shadow-[#d4a843]/10'
                }`}
              >
                <span
                  className={
                    service.accent === 'brand'
                      ? 'text-brand-400'
                      : 'text-[#d4a843]'
                  }
                >
                  {service.icon}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-brand-300 transition-colors">
                {service.title}
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────────── BENEFITS ───────────────────────── */
function Benefits() {
  const benefits = [
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: 'Processos seguros',
      description:
        'Dados protegidos e fluxos validados. LGPD-compliant com rastreabilidade total.',
    },
    {
      icon: <TrendingUp className="h-7 w-7" />,
      title: 'Decisão com dados',
      description:
        'Dashboards em tempo real que mostram o que funciona e onde investir.',
    },
    {
      icon: <Users className="h-7 w-7" />,
      title: 'Parceria real',
      description:
        'Acompanhamento próximo, suporte dedicado e melhoria contínua dos seus resultados.',
    },
  ];

  return (
    <Section id="beneficios" className="relative py-24 lg:py-32">
      <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-500/5 blur-[120px]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Porquê escolher a{' '}
            <span className="gradient-text">Codelium Company</span>?
          </h2>
          <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Mais do que tecnologia — uma parceria que entrega resultado mensurável
            para a sua clínica.
          </p>
        </div>

        {/* Benefits cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.25 },
              }}
              className="glass glass-hover rounded-2xl p-8 text-center group cursor-default transition-all duration-300 flex flex-col items-center"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500/20 group-hover:border-brand-500/40 group-hover:shadow-lg group-hover:shadow-brand-500/15 transition-all duration-300">
                <span className="text-brand-400 group-hover:text-brand-300 transition-colors">
                  {benefit.icon}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-300 transition-colors">
                {benefit.title}
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ───────────────────────── DIAGNÓSTICO CTA ───────────────────────── */
function DiagnosticForm() {
  const [clicked, setClicked] = useState(false);

  function handleDiagnosticClick() {
    setClicked(true);
    window.open('https://wa.me/5522999067522', '_blank');
  }

  return (
    <Section id="diagnostico" className="relative py-24 lg:py-32">
      <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-[#d4a843]/5 blur-[120px]" />
      <div className="relative mx-auto w-full max-w-2xl px-5 sm:px-8 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Solicite o seu{' '}
            <span className="gradient-gold">Diagnóstico Rápido</span>
          </h2>
          <p className="mt-5 text-slate-400 max-w-md mx-auto text-base leading-relaxed">
            Descubra em poucos minutos como a automação pode transformar a sua
            clínica. Sem compromisso.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 sm:p-10 glow-brand"
        >
          {clicked ? (
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 border border-brand-500/30">
                <CheckCircle2 className="h-8 w-8 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Solicitação enviada!
              </h3>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                Obrigado pelo interesse! Entraremos em contato o mais rápido
                possível para apresentar o diagnóstico personalizado da sua
                clínica.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20">
                  <Sparkles className="h-8 w-8 text-brand-400" />
                </div>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                  Preencha o formulário e nossa equipe entrará em contato para
                  apresentar o diagnóstico personalizado da sua clínica.
                </p>
              </div>

              <button
                onClick={handleDiagnosticClick}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                <Send className="h-4 w-4" />
                Solicitar Diagnóstico Gratuito
                <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

              <p className="text-[11px] text-slate-600">
                Sem compromisso • Resposta rápida
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </Section>
  );
}

/* ───────────────────────── FOOTER ───────────────────────── */
function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-auto">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + social */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 border border-brand-500/30">
                <Bot className="h-4 w-4 text-brand-400" />
              </div>
              <span className="text-sm font-bold text-white">
                Codelium<span className="text-brand-400"> Company</span>
              </span>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/codeliumcompany"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/codeliumcompany/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-8">
            <a href="#servicos" className="text-xs text-slate-500 hover:text-brand-400 transition-colors">
              Serviços
            </a>
            <a href="#beneficios" className="text-xs text-slate-500 hover:text-brand-400 transition-colors">
              Benefícios
            </a>
            <a href="#diagnostico" className="text-xs text-slate-500 hover:text-brand-400 transition-colors">
              Diagnóstico
            </a>
          </nav>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <a
              href="https://wa.me/5522999067522"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-400 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              +55 22 99906-7522
            </a>
            <a
              href="mailto:contato@codeliumcompany.com.br"
              className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
            >
              contato@codeliumcompany.com.br
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Codelium Company. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1e] text-foreground overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Benefits />
        <DiagnosticForm />
      </main>
      <Footer />
    </div>
  );
}
