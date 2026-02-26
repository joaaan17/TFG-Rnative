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
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import { searchMarket, type MarketSearchResultItem } from '../api/marketSearchClient';
import { getQuotes, type QuoteItem } from '../api/marketQuotesClient';

const DEBOUNCE_MS = 400;
const SEARCH_LIMIT = 15;

/** 7 magníficas + oro (GLD) + Bitcoin. Símbolos para la lista por defecto. */
const DEFAULT_SYMBOLS = [
  'AAPL',   // Apple
  'TSLA',   // Tesla
  'NVDA',   // Nvidia
  'MSFT',   // Microsoft
  'GOOGL',  // Alphabet
  'AMZN',   // Amazon
  'META',   // Meta (7ª magnífica)
  'GLD',    // ETF oro (precio en USD)
  'BTC-USD', // Bitcoin
];

/** Nombre de empresa por símbolo para la lista por defecto (arriba el nombre, abajo el símbolo). */
const DEFAULT_DISPLAY_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla, Inc.',
  'NVDA': 'NVIDIA Corporation',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com, Inc.',
  'META': 'Meta Platforms, Inc.',
  'GLD': 'Oro (ETF)',
  'BTC-USD': 'Bitcoin',
};

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
  const [defaultQuotes, setDefaultQuotes] = useState<QuoteItem[]>([]);
  const [defaultQuotesLoading, setDefaultQuotesLoading] = useState(false);
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

  const fetchDefaultQuotes = useCallback(async () => {
    setDefaultQuotesLoading(true);
    try {
      const res = await getQuotes(DEFAULT_SYMBOLS);
      setDefaultQuotes(res.quotes);
    } catch {
      setDefaultQuotes(
        DEFAULT_SYMBOLS.map((symbol) => ({
          symbol,
          name: symbol,
        })),
      );
    } finally {
      setDefaultQuotesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    if (query.trim().length < 1) {
      fetchDefaultQuotes();
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        runSearch(query);
      }, DEBOUNCE_MS);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, query, runSearch, fetchDefaultQuotes]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setDefaultQuotes([]);
      setError(null);
    }
  }, [open]);

  const getDisplayName = useCallback((item: QuoteItem): string => {
    const mapped = DEFAULT_DISPLAY_NAMES[item.symbol];
    if (mapped) return mapped;
    return item.name && item.name !== item.symbol ? item.name : item.symbol;
  }, []);

  /** Nombre para el modal: empresa en lista por defecto, o name del resultado de búsqueda */
  const getAssetNameForModal = useCallback(
    (item: MarketSearchResultItem | QuoteItem): string => {
      if ('price' in item) return getDisplayName(item as QuoteItem);
      return (item as MarketSearchResultItem).name;
    },
    [getDisplayName],
  );

  const handleSelect = useCallback(
    (item: MarketSearchResultItem | QuoteItem) => {
      const symbol = item.symbol;
      const name = getAssetNameForModal(item);
      if (onSelectAsset) {
        onSelectAsset({ symbol, name });
        onClose();
      } else if (onSelectSymbol) {
        onSelectSymbol(symbol);
        onClose();
      }
    },
    [getAssetNameForModal, onSelectAsset, onSelectSymbol, onClose],
  );

  const renderSearchItem = useCallback(
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

  const formatPrice = (item: QuoteItem): string => {
    if (item.price == null) return '';
    if (item.symbol === 'GLD') {
      const usdPerOz = item.price * 10;
      return `~${usdPerOz.toFixed(0)} $/oz`;
    }
    const value = item.price >= 1e6
      ? (item.price / 1e6).toFixed(2) + 'M'
      : item.price >= 1e3
        ? item.price.toFixed(2)
        : item.price < 1
          ? item.price.toFixed(4)
          : item.price.toFixed(2);
    const cur = item.currency === 'USD' ? '$' : item.currency ?? '';
    return `${cur}${value}`;
  };

  const renderDefaultItem = useCallback(
    ({ item }: { item: QuoteItem }) => (
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
        accessibilityLabel={`${getDisplayName(item)} ${item.symbol}`}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontWeight: '600', color: palette.text }}>
              {getDisplayName(item)}
            </Text>
            <Text
              variant="muted"
              style={{ marginTop: 2, fontSize: 13 }}
            >
              {item.symbol}
            </Text>
          </View>
          {item.price != null && (
            <Text style={{ fontSize: 15, fontWeight: '600', color: palette.text }}>
              {formatPrice(item)}
            </Text>
          )}
        </View>
      </Pressable>
    ),
    [handleSelect, getDisplayName, palette.surfaceBorder, palette.text],
  );

  const showDefaultList = query.trim().length < 1 && !loading;
  const showSearchResults = query.trim().length >= 1 && results.length > 0 && !loading;

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.75}
      closeOnBackdropPress
      scrollable
    >
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, minHeight: 200 }}>
        <Text
          style={[Hierarchy.titleModal, { color: palette.text, marginBottom: 12 }]}
        >
          Buscador por nombre o símbolo
        </Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="ej. Apple, AAPL, TSLA"
          autoFocus={open}
          variant="input"
        />

        {loading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={palette.primary} />
          </View>
        )}

        {showDefaultList && defaultQuotesLoading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={palette.primary} />
          </View>
        )}

        {showDefaultList && !defaultQuotesLoading && defaultQuotes.length > 0 && (
          <FlatList
            data={defaultQuotes}
            keyExtractor={(item) => item.symbol}
            renderItem={renderDefaultItem}
            scrollEnabled={true}
            style={{ flex: 1, marginTop: 8 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
          />
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

        {showSearchResults && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.symbol}
            renderItem={renderSearchItem}
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
