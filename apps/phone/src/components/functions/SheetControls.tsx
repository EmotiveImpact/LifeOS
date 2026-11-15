import type { ComponentPropsWithoutRef } from 'react';
import type { CountryCode } from '@life/core/types';

export function fieldSurface(darkMode: boolean) {
  return `mt-1 w-full min-w-0 rounded-xl px-3 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6688FF] ${
    darkMode ? 'bg-[#16161B] text-[#F5F5F7]' : 'bg-white text-[#141416]'
  }`;
}

type NumberFieldProps = Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'type' | 'className' | 'min' | 'max'> & {
  label: string;
  darkMode: boolean;
  value?: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
};

export function NumberField({ label, darkMode, value, onChange, min = 0, max, step = 'any', ...props }: NumberFieldProps) {
  return (
    <label className="block min-w-0 text-[13px] leading-snug">
      {label}
      <input
        {...props}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value ?? ''}
        onChange={(event) => {
          const input = event.currentTarget;
          onChange(input.value === '' || !Number.isFinite(input.valueAsNumber)
            ? undefined
            : Math.min(max ?? Infinity, Math.max(min, input.valueAsNumber)));
        }}
        className={fieldSurface(darkMode)}
      />
    </label>
  );
}

export function moneyFormatter(countryCode: CountryCode) {
  const currency = { UK: 'GBP', US: 'USD', DE: 'EUR', NG: 'NGN' }[countryCode];
  return new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

