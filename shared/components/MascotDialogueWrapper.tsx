import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  MASCOT_INVESTOR_DIALOGUES,
  type MascotDialogueBucket,
} from '@/shared/data/mascot-investor-dialogues';
import {
  loadMascotDailyState,
  saveMascotDailyState,
  type MascotDailyFlags,
} from '@/shared/lib/mascot-dialogue-storage';
import { MascotDialogueModal } from '@/shared/components/MascotDialogueModal';
import {
  MascotCountdownProvider,
  type MascotCountdownValue,
} from '@/shared/context/mascot-countdown-context';

const ENTRY_DELAY_MS = 1400;
const FOREGROUND_MS_5 = 5 * 60 * 1000;
const FOREGROUND_MS_15 = 15 * 60 * 1000;
const TICK_MS = 2500;
/** Debe coincidir con el cierre animado de `CardModal` (~180ms) para no desmontar antes. */
const MODAL_UNMOUNT_AFTER_MS = 220;

type QueuedKind = 'entry' | 'm5' | 'm15';

function bucketFor(kind: QueuedKind): MascotDialogueBucket {
  if (kind === 'entry') return '0_minutes';
  if (kind === 'm5') return '5_minutes';
  return '15_minutes';
}

function flagKey(
  kind: QueuedKind,
): keyof Pick<MascotDailyFlags, 'entry' | 'm5' | 'm15'> {
  if (kind === 'entry') return 'entry';
  if (kind === 'm5') return 'm5';
  return 'm15';
}

function pickMessage(bucket: MascotDialogueBucket): string {
  const list = MASCOT_INVESTOR_DIALOGUES.dialogues[bucket].messages;
  if (list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)] ?? '';
}

/**
 * Tres momentos al día (máx.): bienvenida al entrar en la app autenticada,
 * a los ~5 min y a los ~15 min de tiempo en primer plano en esa sesión.
 * Las frases se eligen al azar del JSON; el estado diario persiste en AsyncStorage.
 */
export function MascotDialogueWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const dailyRef = useRef<MascotDailyFlags | null>(null);
  const queuedRef = useRef<QueuedKind[]>([]);
  const visibleRef = useRef(false);

  const [modal, setModal] = useState<{
    kind: QueuedKind;
    message: string;
  } | null>(null);
  /** `CardModal` anima con `open`; si desmontamos al cerrar, no hay animación de salida. */
  const [modalOpen, setModalOpen] = useState(false);

  const foregroundMsRef = useRef(0);
  const activeSinceRef = useRef<number | null>(null);
  const m5FiredRef = useRef(false);
  const m15FiredRef = useRef(false);
  /** Hora límite (epoch ms) para el modal de entrada de esta sesión */
  const entryDeadlineRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);

  const persistFlags = useCallback(async (patch: Partial<MascotDailyFlags>) => {
    const base =
      dailyRef.current ??
      ({
        day: new Date().toISOString().slice(0, 10),
        entry: false,
        m5: false,
        m15: false,
      } satisfies MascotDailyFlags);
    const next = { ...base, ...patch };
    dailyRef.current = next;
    await saveMascotDailyState(next);
  }, []);

  const getForegroundMs = useCallback(() => {
    const extra =
      activeSinceRef.current != null ? Date.now() - activeSinceRef.current : 0;
    return foregroundMsRef.current + extra;
  }, []);

  const showKind = useCallback(
    async (kind: QueuedKind) => {
      const key = flagKey(kind);
      const flags = dailyRef.current;
      if (!flags || flags[key]) return;

      const b = bucketFor(kind);
      const message = pickMessage(b);
      if (!message) return;

      if (visibleRef.current) {
        if (!queuedRef.current.includes(kind)) queuedRef.current.push(kind);
        return;
      }

      visibleRef.current = true;
      if (key === 'entry') await persistFlags({ entry: true });
      else if (key === 'm5') await persistFlags({ m5: true });
      else await persistFlags({ m15: true });
      setModal({ kind, message });
      setModalOpen(true);
    },
    [persistFlags],
  );

  const drainQueue = useCallback(async () => {
    const next = queuedRef.current.shift();
    if (!next) return;
    await showKind(next);
  }, [showKind]);

  const handleClose = useCallback(() => {
    visibleRef.current = false;
    setModalOpen(false);
    setTimeout(() => {
      setModal(null);
    }, MODAL_UNMOUNT_AFTER_MS);
    setTimeout(() => {
      void drainQueue();
    }, 380);
  }, [drainQueue]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const countdownValue: MascotCountdownValue = useMemo(() => {
    void tick;
    const isOpen = Boolean(modal && modalOpen);
    const flags = dailyRef.current;
    if (!ready || !flags) {
      return {
        phase: 'loading',
        remainingMs: null,
        isModalOpen: isOpen,
      };
    }

    if (flags.entry && flags.m5 && flags.m15) {
      return { phase: 'complete', remainingMs: null, isModalOpen: isOpen };
    }

    if (!flags.entry) {
      if (entryDeadlineRef.current != null) {
        const ms = Math.max(0, entryDeadlineRef.current - Date.now());
        return {
          phase: 'entry',
          remainingMs: ms,
          isModalOpen: isOpen,
        };
      }
      return {
        phase: 'loading',
        remainingMs: null,
        isModalOpen: isOpen,
      };
    }

    const fg = getForegroundMs();
    if (!flags.m5) {
      return {
        phase: 'm5',
        remainingMs: Math.max(0, FOREGROUND_MS_5 - fg),
        isModalOpen: isOpen,
      };
    }
    if (!flags.m15) {
      return {
        phase: 'm15',
        remainingMs: Math.max(0, FOREGROUND_MS_15 - fg),
        isModalOpen: isOpen,
      };
    }

    return { phase: 'complete', remainingMs: null, isModalOpen: isOpen };
  }, [tick, ready, modal, modalOpen, getForegroundMs]);

  /** Sincroniza AppState con ms acumulados en primer plano */
  useEffect(() => {
    const sync = (state: AppStateStatus) => {
      if (state === 'active') {
        activeSinceRef.current = Date.now();
      } else if (activeSinceRef.current != null) {
        foregroundMsRef.current += Date.now() - activeSinceRef.current;
        activeSinceRef.current = null;
      }
    };

    sync(AppState.currentState);
    const sub = AppState.addEventListener('change', sync);
    return () => sub.remove();
  }, []);

  /** Carga flags + modal de entrada (breve delay tras entrar al shell autenticado) */
  useEffect(() => {
    let cancelled = false;
    let entryTimer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      const loaded = await loadMascotDailyState();
      if (cancelled) return;
      dailyRef.current = loaded;
      m5FiredRef.current = false;
      m15FiredRef.current = false;

      if (!loaded.entry) {
        entryDeadlineRef.current = Date.now() + ENTRY_DELAY_MS;
        entryTimer = setTimeout(() => {
          if (!cancelled) void showKind('entry');
        }, ENTRY_DELAY_MS);
      } else {
        entryDeadlineRef.current = null;
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (entryTimer !== undefined) clearTimeout(entryTimer);
    };
  }, [showKind]);

  /** Comprueba umbrales 5 / 15 min de uso en primer plano */
  useEffect(() => {
    const id = setInterval(() => {
      if (AppState.currentState !== 'active') return;
      const flags = dailyRef.current;
      if (!flags) return;

      const ms = getForegroundMs();

      if (!flags.m5 && !m5FiredRef.current && ms >= FOREGROUND_MS_5) {
        m5FiredRef.current = true;
        void showKind('m5');
      }
      if (!flags.m15 && !m15FiredRef.current && ms >= FOREGROUND_MS_15) {
        m15FiredRef.current = true;
        void showKind('m15');
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [getForegroundMs, showKind]);

  const data = modal
    ? MASCOT_INVESTOR_DIALOGUES.dialogues[bucketFor(modal.kind)]
    : null;

  return (
    <MascotCountdownProvider value={countdownValue}>
      {children}
      {modal && data ? (
        <MascotDialogueModal
          open={modalOpen}
          onClose={handleClose}
          mascotName={MASCOT_INVESTOR_DIALOGUES.mascot}
          bucket={bucketFor(modal.kind)}
          message={modal.message}
          objective={data.objective}
        />
      ) : null}
    </MascotCountdownProvider>
  );
}
