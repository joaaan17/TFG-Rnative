import React from 'react';
import { Pressable, View } from 'react-native';

import ArrowLeftIcon from '@/shared/icons/arrow-left.svg';
import ArrowRightIcon from '@/shared/icons/arrow-right.svg';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

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

  const goPrev = () => onMonthChange(new Date(year, month - 1, 1));
  const goNext = () => onMonthChange(new Date(year, month + 1, 1));

  const monthYearLabel = monthDate.toLocaleDateString('es-ES', {
    month: 'short',
    year: 'numeric',
  });
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            s.calendarNavButton,
            pressed && { opacity: 0.7 },
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

      {grid.map((row, rowIndex) => (
        <View key={String(rowIndex)} style={s.gridRow}>
          {row.map((cell, colIndex) => {
            const flatIndex = rowIndex * 7 + colIndex;
            const isPrevMonth = flatIndex < startOffset;
            const isNextMonth = flatIndex >= startOffset + daysInMonth;
            const correctDate = cell.isCurrentMonth
              ? new Date(year, month, cell.day)
              : isPrevMonth
                ? new Date(year, month - 1, cell.day)
                : new Date(year, month + 1, cell.day);

            const key = getDayKey(correctDate);
            const hasActivity = daysWithActivity.has(key);
            const selected = isSameDay(correctDate, selectedDate);

            // El View externo maneja flex:1 (distribución de columnas).
            // Pressable con function-style no aplica flex:1 correctamente
            // en Android durante el primer layout pass, concatenando números.
            return (
              <View key={`${rowIndex}-${colIndex}-${key}`} style={s.dayCellWrap}>
                <Pressable
                  onPress={() => onSelectDay(correctDate)}
                  style={({ pressed }) => [
                    s.dayCell,
                    selected && s.daySelectedRing,
                    pressed && !selected && { opacity: 0.7 },
                  ]}
                  accessibilityLabel={`Día ${cell.day}${hasActivity ? ', con movimientos' : ''}`}
                  accessibilityState={{ selected }}
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
    </View>
  );
}
