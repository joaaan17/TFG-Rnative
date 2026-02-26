import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  View,
} from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { SearchBar } from '@/shared/components/ui/search-bar';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { searchMarket, type MarketSearchResultItem } from '../api/marketSearchClient';

const DEBOUNCE_MS = 400;
const SEARCH_LIMIT = 15;

export type StockSearchModalProps = {
  open: boolean;
  onClose: () => void;
  /** Al pulsar un resultado: abrir modal de gráfico (nombre + símbolo). */
  onSelectAsset?: (asset: { symbol: string; name: string }) => void;
  /** Opcional: al elegir ir a detalle de la acción (ej. desde el modal de velas). */
  onSelectSymbol?: (symbol: string) => void;
};

export function StockSearchModal({
  open,
  onClose,
  onSelectAsset,
  onSelectSymbol,
}: StockSearchModalProps) {
  const palette = usePalette();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MarketSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchMarket(trimmed, SEARCH_LIMIT);
      setResults(res.results);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al buscar';
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, query, runSearch]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [open]);

  const handleSelect = useCallback(
    (item: MarketSearchResultItem) => {
      if (onSelectAsset) {
        onSelectAsset({ symbol: item.symbol, name: item.name });
        onClose();
      } else if (onSelectSymbol) {
        onSelectSymbol(item.symbol);
        onClose();
      }
    },
    [onSelectAsset, onSelectSymbol, onClose],
  );

  const renderItem = useCallback(
    ({ item }: { item: MarketSearchResultItem }) => (
      <Pressable
        style={({ pressed }) => ({
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.06)',
          opacity: pressed ? 0.7 : 1,
        })}
        onPress={() => handleSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} ${item.symbol}`}
      >
        <Text style={{ fontWeight: '600', color: palette.text }}>
          {item.name}
        </Text>
        <Text
          variant="muted"
          style={{ marginTop: 2, fontSize: 13 }}
        >
          {item.symbol}
          {item.exchange ? ` · ${item.exchange}` : ''}
          {item.currency ? ` · ${item.currency}` : ''}
        </Text>
      </Pressable>
    ),
    [handleSelect, palette.surfaceBorder, palette.text],
  );

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.75}
      closeOnBackdropPress
      scrollable
    >
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, minHeight: 200 }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre o símbolo (ej. Apple, AAPL)"
          autoFocus={open}
          variant="translucent"
        />

        {loading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={palette.primary} />
          </View>
        )}

        {error && !loading && (
          <View style={{ paddingVertical: 16 }}>
            <Text variant="muted" style={{ textAlign: 'center' }}>
              {error}
            </Text>
          </View>
        )}

        {!loading && !error && results.length === 0 && query.trim().length >= 1 && (
          <View style={{ paddingVertical: 24 }}>
            <Text variant="muted" style={{ textAlign: 'center' }}>
              No se encontraron resultados para "{query.trim()}"
            </Text>
          </View>
        )}

        {!loading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.symbol}
            renderItem={renderItem}
            scrollEnabled={true}
            style={{ flex: 1, marginTop: 8 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>
    </CardModal>
  );
}
