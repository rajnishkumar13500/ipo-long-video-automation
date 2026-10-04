import React from "react";
import { FONT, C } from "./Tokens";
import { useTypewriter, useFadeIn } from "./Animations";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  color?: string;
  size?: number;
  weight?: number;
  cursor?: boolean;
  style?: React.CSSProperties;
}

/** Text that types itself letter by letter with an optional blinking cursor. */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  speed = 1.2,
  color = C.text,
  size = 28,
  weight = 600,
  cursor = true,
  style = {},
}) => {
  const visibleChars = useTypewriter(text.length, delay, speed);
  const displayText = text.substring(0, visibleChars);
  const showCursor = visibleChars < text.length && cursor;

  return (
    <div
      style={{
        fontFamily: FONT.body,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.4,
        letterSpacing: "-0.01em",
        ...style,
      }}
    >
      {displayText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: size * 0.85,
            backgroundColor: C.cyan,
            marginLeft: 2,
            verticalAlign: "text-bottom",
            animation: "blink 0.8s step-end infinite",
          }}
        />
      )}
    </div>
  );
};

interface KineticTextProps {
  words: string[];
  delay?: number;
  gap?: number;
  colors?: string[];
  size?: number;
  weight?: number;
  style?: React.CSSProperties;
}

/** Each word animates in sequentially with its own color and emphasis. */
const WordSpan: React.FC<{
  word: string;
  wordDelay: number;
  color: string;
  size: number;
  weight: number;
}> = ({ word, wordDelay, color, size, weight }) => {
  const opacity = useFadeIn(wordDelay, 12);
  return (
    <span
      style={{
        fontFamily: FONT.heading,
        fontSize: size,
        fontWeight: weight,
        color,
        opacity,
        letterSpacing: "-0.02em",
        textShadow: color !== C.text ? `0 0 30px ${color}60` : "none",
      }}
    >
      {word}
    </span>
  );
};

export const KineticText: React.FC<KineticTextProps> = ({
  words,
  delay = 0,
  gap = 8,
  colors = [],
  size = 42,
  weight = 800,
  style = {},
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: size * 0.3,
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {words.map((word, idx) => (
        <WordSpan
          key={idx}
          word={word}
          wordDelay={delay + idx * gap}
          color={colors[idx] || C.text}
          size={size}
          weight={weight}
        />
      ))}
    </div>
  );
};

/** Handwritten-style annotation text. */
export const HandwriteText: React.FC<{
  text: string;
  delay?: number;
  speed?: number;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, speed = 1.5, color = C.sketch, size = 22, style = {} }) => {
  const visibleChars = useTypewriter(text.length, delay, speed);
  const displayText = text.substring(0, visibleChars);

  return (
    <div
      style={{
        fontFamily: "'Caveat', 'Segoe Script', cursive, " + FONT.body,
        fontSize: size,
        fontWeight: 600,
        color,
        fontStyle: "italic",
        lineHeight: 1.5,
        ...style,
      }}
    >
      {displayText}
    </div>
  );
};
