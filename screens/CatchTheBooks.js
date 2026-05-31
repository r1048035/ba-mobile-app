import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const GAME_DURATION = 30;
const MAX_MISSES = 3;
const BOOK_SIZE = 34;
const BASKET_WIDTH = 96;
const BASKET_HEIGHT = 22;
const FALL_SPEED = 5;
const MOVE_INTERVAL = 40;
const SPAWN_INTERVAL = 850;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createBook(fieldWidth, id) {
  const maxX = Math.max(0, fieldWidth - BOOK_SIZE - 16);
  return {
    id,
    x: 8 + Math.random() * maxX,
    y: -BOOK_SIZE,
  };
}

export default function CatchTheBooks() {
  const [fieldLayout, setFieldLayout] = useState({ width: 0, height: 0 });
  const [basketX, setBasketX] = useState(0);
  const [books, setBooks] = useState([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);

  const basketXRef = useRef(0);
  const booksRef = useRef([]);
  const nextBookId = useRef(1);

  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  useEffect(() => {
    booksRef.current = books;
  }, [books]);

  useEffect(() => {
    if (!fieldLayout.width) return;
    const centeredBasket = clamp((fieldLayout.width - BASKET_WIDTH) / 2, 12, Math.max(12, fieldLayout.width - BASKET_WIDTH - 12));
    setBasketX(centeredBasket);
  }, [fieldLayout.width]);

  useEffect(() => {
    if (gameOver) return;

    const timerId = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timerId);
          setGameOver(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || !fieldLayout.width || !fieldLayout.height) return;

    const spawnId = setInterval(() => {
      setBooks((current) => [...current, createBook(fieldLayout.width, nextBookId.current++)]);
    }, SPAWN_INTERVAL);

    const moveId = setInterval(() => {
      let caughtCount = 0;
      let missedCount = 0;
      const basketLeft = basketXRef.current;
      const basketRight = basketLeft + BASKET_WIDTH;
      const basketTop = fieldLayout.height - BASKET_HEIGHT - 16;
      const nextBooks = [];

      booksRef.current.forEach((book) => {
        const nextY = book.y + FALL_SPEED;
        const bookBottom = nextY + BOOK_SIZE;
        const bookCenter = book.x + BOOK_SIZE / 2;

        if (bookBottom >= basketTop) {
          if (bookCenter >= basketLeft && bookCenter <= basketRight) {
            caughtCount += 1;
          } else {
            missedCount += 1;
          }
          return;
        }

        nextBooks.push({ ...book, y: nextY });
      });

      booksRef.current = nextBooks;
      setBooks(nextBooks);

      if (caughtCount) {
        setScore((current) => current + caughtCount);
      }

      if (missedCount) {
        setMisses((current) => {
          const nextMisses = current + missedCount;
          if (nextMisses >= MAX_MISSES) {
            setGameOver(true);
          }
          return nextMisses;
        });
      }
    }, MOVE_INTERVAL);

    return () => {
      clearInterval(spawnId);
      clearInterval(moveId);
    };
  }, [fieldLayout.height, fieldLayout.width, gameOver]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          if (!fieldLayout.width) return;
          const nextX = clamp(event.nativeEvent.locationX - BASKET_WIDTH / 2, 12, fieldLayout.width - BASKET_WIDTH - 12);
          setBasketX(nextX);
        },
        onPanResponderMove: (event) => {
          if (!fieldLayout.width) return;
          const nextX = clamp(event.nativeEvent.locationX - BASKET_WIDTH / 2, 12, fieldLayout.width - BASKET_WIDTH - 12);
          setBasketX(nextX);
        },
      }),
    [fieldLayout.width]
  );

  const restartGame = () => {
    booksRef.current = [];
    setBooks([]);
    setScore(0);
    setMisses(0);
    setSecondsLeft(GAME_DURATION);
    setGameOver(false);

    if (fieldLayout.width) {
      setBasketX(clamp((fieldLayout.width - BASKET_WIDTH) / 2, 12, Math.max(12, fieldLayout.width - BASKET_WIDTH - 12)));
    }
  };

  const timeUp = secondsLeft === 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tijd</Text>
          <Text style={styles.statValue}>{secondsLeft}s</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Gemist</Text>
          <Text style={styles.statValue}>{misses}/{MAX_MISSES}</Text>
        </View>
      </View>

      <Text style={styles.title}>Catch the Books</Text>
      <Text style={styles.subtitle}>Sleep het mandje onderaan en vang zoveel mogelijk vallende boeken.</Text>

      <View
        style={styles.playfield}
        onLayout={(event) => setFieldLayout({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
        {...panResponder.panHandlers}
      >
        {books.map((book) => (
          <View key={book.id} style={[styles.book, { left: book.x, top: book.y }]}>
            <Text style={styles.bookText}>📘</Text>
          </View>
        ))}

        <View style={[styles.basket, { left: basketX, top: Math.max(12, fieldLayout.height - BASKET_HEIGHT - 16) }]}>
          <View style={styles.basketLip} />
          <View style={styles.basketBase} />
        </View>

        {(gameOver || timeUp) && (
          <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.overlayCard}>
              <Text style={styles.overlayTitle}>Game over</Text>
              <Text style={styles.overlayText}>{timeUp ? 'De tijd is op.' : 'Je hebt 3 boeken gemist.'} Je score was {score}.</Text>
              <Pressable style={styles.restartBtn} onPress={restartGame}>
                <Text style={styles.restartText}>Opnieuw starten</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.restartInlineBtn} onPress={restartGame}>
          <Text style={styles.restartInlineText}>Herstart spel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7FAF1',
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E3EBC2',
    marginRight: 10,
    alignItems: 'center',
    ...theme.shadow,
  },
  statLabel: {
    fontFamily: theme.typography.body,
    color: theme.colors.mutedText,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: theme.typography.subtitle,
    color: theme.colors.text,
    fontSize: 18,
  },
  title: {
    fontFamily: theme.typography.title,
    fontSize: 30,
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: theme.typography.body,
    color: theme.colors.mutedText,
    fontSize: 15,
    marginBottom: theme.spacing.md,
  },
  playfield: {
    flex: 1,
    backgroundColor: '#EDF5D6',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D7E7AD',
    overflow: 'hidden',
  },
  book: {
    position: 'absolute',
    width: BOOK_SIZE,
    height: BOOK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: {
    fontSize: 28,
  },
  basket: {
    position: 'absolute',
    width: BASKET_WIDTH,
    height: BASKET_HEIGHT,
    alignItems: 'center',
  },
  basketLip: {
    width: BASKET_WIDTH,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#7A4E1D',
    marginBottom: 2,
  },
  basketBase: {
    width: BASKET_WIDTH - 14,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#A66B2D',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  overlayCard: {
    width: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E3EBC2',
    alignItems: 'center',
    ...theme.shadow,
  },
  overlayTitle: {
    fontFamily: theme.typography.title,
    fontSize: 26,
    color: theme.colors.text,
    marginBottom: 8,
  },
  overlayText: {
    fontFamily: theme.typography.body,
    fontSize: 15,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  restartBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  restartText: {
    fontFamily: theme.typography.subtitle,
    color: theme.colors.white,
    fontSize: 16,
  },
  footer: {
    paddingTop: theme.spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: theme.typography.body,
    color: theme.colors.mutedText,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  restartInlineBtn: {
    borderWidth: 1,
    borderColor: '#D7E7AD',
    backgroundColor: theme.colors.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  restartInlineText: {
    fontFamily: theme.typography.subtitle,
    color: theme.colors.text,
  },
});