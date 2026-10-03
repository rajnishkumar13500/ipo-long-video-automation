import React from "react";
import { FONT } from "./Tokens";
import { useCountUp } from "./Animations";

interface CountUpNumberProps {
  value: number;
  delay?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: string;
  size?: number;
  weight?: number;
  style?: React.CSSProperties;
}

/** Animated counter that counts from 0 to target value. */
export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  delay = 0,
  duration = 30,
  prefix = "",
  suffix = "",
  decimals = 0,
  color = "#F8FAFC",
  size = 48,
  weight = 900,
  style = {},
}) => {
  const current = useCountUp(value, delay, duration);
  const displayValue = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString("en-IN");

  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: "-0.02em",
        ...style,
      }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
