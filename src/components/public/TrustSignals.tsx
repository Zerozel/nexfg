import { DESIGN_TOKENS } from '@/lib/public/design-tokens';

interface TrustSignal {
  label: string;
  value: string;
}

interface TrustSignalsProps {
  signals: TrustSignal[];
  variant?: 'light' | 'dark';
  primaryColor?: string;
}

export function TrustSignals({
  signals,
  variant = 'light',
  primaryColor,
}: TrustSignalsProps) {
  if (signals.length === 0) return null;

  const isDark = variant === 'dark';
  const dividerColor = isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : DESIGN_TOKENS.neutral.line;
  const labelColor = isDark ? 'rgba(255, 255, 255, 0.6)' : DESIGN_TOKENS.neutral.inkMuted;
  const valueColor = isDark ? '#ffffff' : DESIGN_TOKENS.neutral.ink;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6">
      {signals.map((signal, i) => (
        <div
          key={i}
          className="px-4 text-center md:text-left"
          style={{
            borderLeft:
              i === 0
                ? 'none'
                : `1px solid ${dividerColor}`,
          }}
        >
          <div
            className="text-xs uppercase mb-2"
            style={{
              fontFamily: 'var(--font-inter)',
              letterSpacing: '0.15em',
              fontWeight: 600,
              color: labelColor,
            }}
          >
            {signal.label}
          </div>
          <div
            className="text-2xl md:text-3xl"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontWeight: 500,
              color: valueColor,
              fontVariationSettings: '"opsz" 72, "SOFT" 50',
              lineHeight: 1.1,
            }}
          >
            {signal.value}
          </div>
        </div>
      ))}
    </div>
  );
}
