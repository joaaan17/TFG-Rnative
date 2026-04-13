import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeOut,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import ArrowLeftIcon from '@/shared/icons/arrow-left.svg';
import ArrowRightIcon from '@/shared/icons/arrow-right.svg';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

const RING_SPRING = { damping: 22, stiffness: 300, mass: 0.65 };

/** Lunes a Domingo, una letra (como en la referencia). */
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function getDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type GridCell = { day: number; isCurrentMonth: boolean };

/** Rejilla con semana empezando en Lunes; incluye días del mes anterior/siguiente en faded. */
function buildMonthGrid(year: number, month: number): GridCell[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // 0 = Lunes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  let dayNum = 1 - startOffset;
  const flat: GridCell[] = [];
  for (let i = 0; i < 42; i++) {
    if (dayNum < 1) {
      flat.push({ day: prevMonthLastDay + dayNum, isCurrentMonth: false });
    } else if (dayNum <= daysInMonth) {
      flat.push({ day: dayNum, isCurrentMonth: true });
    } else {
      flat.push({ day: dayNum - daysInMonth, isCurrentMonth: false });
    }
    dayNum++;
  }

  const rows: GridCell[][] = [];
  for (let r = 0; r < 6; r++) {
    rows.push(flat.slice(r * 7, (r + 1) * 7));
  }
  return rows;
}

export type CashCalendarProps = {
  monthDate: Date;
  selectedDate: Date;
  onSelectDay: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  daysWithActivity: Set<string>;
  styles: Record<
    | 'calendarBlock'
    | 'calendarHeader'
    | 'calendarMonthTitle'
    | 'calendarNav'
    | 'calendarNavButton'
    | 'weekdaysRow'
    | 'weekdayCell'
    | 'gridRow'
    | 'dayCellWrap'
    | 'dayCell'
    | 'dayNumber'
    | 'dayNumberFaded'
    | 'daySelectedRing'
    | 'dayDots'
    | 'dayDot',
    object
  >;
};

const CALENDAR_TEXT = 'rgba(255,255,255,0.95)';
const CALENDAR_TEXT_FADED = 'rgba(255,255,255,0.5)';

function monthKey(y: number, m: number): string {
  return `${y}-${m}`;
}

function allRowsMeasured(rows: Array<{ y: number; height: number } | undefined>): boolean {
  for (let i = 0; i < 6; i++) {
    if (!rows[i]) return false;
  }
  return true;
}

export function CashCalendar({
  monthDate,
  selectedDate,
  onSelectDay,
  onMonthChange,
  daysWithActivity,
  styles: s,
}: CashCalendarProps) {
  const palette = usePalette();
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const grid = React.useMemo(() => buildMonthGrid(year, month), [year, month]);

  // Bloquear navegación a meses futuros
  const today = new Date();
  const isCurrentOrFutureMonth =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month >= today.getMonth());

  // direction: 1 = avanzar (→), -1 = retroceder (←)
  const direction = useRef<1 | -1>(1);

  const goPrev = () => {
    direction.current = -1;
    onMonthChange(new Date(year, month - 1, 1));
  };
  const goNext = () => {
    if (!isCurrentOrFutureMonth) {
      direction.current = 1;
      onMonthChange(new Date(year, month + 1, 1));
    }
  };

  const monthYearLabel = monthDate.toLocaleDateString('es-ES', {
    month: 'short',
    year: 'numeric',
  });
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ── Animated ring ──────────────────────────────────────────────────────────
  const gridWidth = useRef(0);
  const rowLayouts = useRef<Array<{ y: number; height: number }>>([]);
  const initialPlaced = useRef(false);
  /** Mes cuyo grid debe medir: evita que onLayout del grid en salida (FadeOut) pise las medidas del mes nuevo. */
  const activeLayoutMonthKey = useRef(monthKey(year, month));
  const lastRenderedMonth = useRef<{ y: number; m: number } | null>(null);

  // Reset en render (no solo en useEffect): si usáramos solo useEffect, el primer onLayout del mes nuevo
  // podría ejecutarse antes del efecto y quedar ignorado, y el anillo no marcaría initialPlaced hasta el primer toque.
  if (
    lastRenderedMonth.current === null ||
    lastRenderedMonth.current.y !== year ||
    lastRenderedMonth.current.m !== month
  ) {
    lastRenderedMonth.current = { y: year, m: month };
    activeLayoutMonthKey.current = monthKey(year, month);
    rowLayouts.current = [];
    initialPlaced.current = false;
  }

  const ringX = useSharedValue(-200);
  const ringY = useSharedValue(-200);
  const ringW = useSharedValue(0);
  const ringH = useSharedValue(0);

  const placeRing = useCallback(() => {
    if (gridWidth.current === 0 || !allRowsMeasured(rowLayouts.current)) return;

    // Find which (row, col) cell corresponds to selectedDate
    let selRow = -1;
    let selCol = -1;
    outer: for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const fi = r * 7 + c;
        const cell = grid[r][c];
        const d = cell.isCurrentMonth
          ? new Date(year, month, cell.day)
          : fi < startOffset
            ? new Date(year, month - 1, cell.day)
            : new Date(year, month + 1, cell.day);
        if (isSameDay(d, selectedDate)) {
          selRow = r;
          selCol = c;
          break outer;
        }
      }
    }
    if (selRow < 0) return;

    const cellW = gridWidth.current / 7;
    const rl = rowLayouts.current[selRow];
    if (!rl) return;

    const targetX = selCol * cellW;
    const targetY = rl.y;

    ringW.value = cellW;
    ringH.value = rl.height;

    if (!initialPlaced.current) {
      // First placement: snap without animation
      ringX.value = targetX;
      ringY.value = targetY;
      initialPlaced.current = true;
    } else {
      ringX.value = withSpring(targetX, RING_SPRING);
      ringY.value = withSpring(targetY, RING_SPRING);
    }
  }, [grid, year, month, startOffset, selectedDate, ringX, ringY, ringW, ringH]);

  // Re-place when selection or grid changes (after layouts are measured)
  useEffect(() => {
    placeRing();
  }, [placeRing]);

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: ringX.value },
      { translateY: ringY.value },
    ],
    width: ringW.value,
    height: ringH.value,
  }));
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={[s.calendarBlock, { backgroundColor: palette.primary }]}>
      <View style={s.calendarHeader}>
        <Pressable
          onPress={goPrev}
          style={({ pressed }) => [
            s.calendarNavButton,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Mes anterior"
        >
          <ArrowLeftIcon width={24} height={24} fill={CALENDAR_TEXT} />
        </Pressable>
        <Animated.View
          key={`title-${year}-${month}`}
          entering={direction.current === 1
            ? SlideInRight.duration(220)
            : SlideInLeft.duration(220)}
          exiting={FadeOut.duration(130)}
          style={{ flex: 1, alignItems: 'center', overflow: 'hidden' }}
        >
          <Text
            style={[
              Hierarchy.bodySmallSemibold,
              s.calendarMonthTitle,
              { color: CALENDAR_TEXT },
            ]}
            numberOfLines={1}
          >
            {monthYearLabel}
          </Text>
        </Animated.View>
        <Pressable
          onPress={goNext}
          disabled={isCurrentOrFutureMonth}
          style={({ pressed }) => [
            s.calendarNavButton,
            (pressed || isCurrentOrFutureMonth) && { opacity: 0 },
          ]}
          accessibilityLabel="Mes siguiente"
        >
          <ArrowRightIcon width={24} height={24} fill={CALENDAR_TEXT} />
        </Pressable>
      </View>

      <View style={s.weekdaysRow}>
        {WEEKDAYS.map((letter) => (
          <View key={letter} style={s.weekdayCell}>
            <Text
              style={[Hierarchy.captionSmall, { color: CALENDAR_TEXT_FADED }]}
            >
              {letter}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid wrapper: the animated ring is positioned absolute inside here */}
      <View
        style={{ position: 'relative' }}
        onLayout={(e) => {
          gridWidth.current = e.nativeEvent.layout.width;
          placeRing();
        }}
      >
        {/* Animated ring — rendered behind the day numbers */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.9)',
            },
            ringAnimatedStyle,
          ]}
        />

        <Animated.View
          key={`grid-${year}-${month}`}
          entering={direction.current === 1
            ? SlideInRight.duration(280).springify().damping(28).stiffness(180)
            : SlideInLeft.duration(280).springify().damping(28).stiffness(180)}
          exiting={FadeOut.duration(140)}
          style={{ overflow: 'hidden' }}
        >
        {grid.map((row, rowIndex) => (
          <View
            key={String(rowIndex)}
            style={s.gridRow}
            onLayout={(e) => {
              const thisMonthKey = monthKey(year, month);
              if (activeLayoutMonthKey.current !== thisMonthKey) return;
              const { y, height } = e.nativeEvent.layout;
              rowLayouts.current[rowIndex] = { y, height };
              if (allRowsMeasured(rowLayouts.current)) {
                placeRing();
              }
            }}
          >
            {row.map((cell, colIndex) => {
              const flatIndex = rowIndex * 7 + colIndex;
              const isPrevMonth = flatIndex < startOffset;
              const correctDate = cell.isCurrentMonth
                ? new Date(year, month, cell.day)
                : isPrevMonth
                  ? new Date(year, month - 1, cell.day)
                  : new Date(year, month + 1, cell.day);

              const key = getDayKey(correctDate);
              const hasActivity = daysWithActivity.has(key);

              return (
                <View key={`${rowIndex}-${colIndex}-${key}`} style={s.dayCellWrap}>
                  <Pressable
                    onPress={() => onSelectDay(correctDate)}
                    style={({ pressed }) => [
                      s.dayCell,
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityLabel={`Día ${cell.day}${hasActivity ? ', con movimientos' : ''}`}
                    accessibilityState={{ selected: isSameDay(correctDate, selectedDate) }}
                  >
                    <Text
                      style={[
                        Hierarchy.bodySmallSemibold,
                        s.dayNumber,
                        {
                          color: cell.isCurrentMonth
                            ? CALENDAR_TEXT
                            : CALENDAR_TEXT_FADED,
                        },
                      ]}
                    >
                      {cell.day}
                    </Text>
                    {hasActivity && (
                      <View style={s.dayDots}>
                        <View
                          style={[
                            s.dayDot,
                            { backgroundColor: CALENDAR_TEXT_FADED },
                          ]}
                        />
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
        </Animated.View>
      </View>
    </View>
  );
}
