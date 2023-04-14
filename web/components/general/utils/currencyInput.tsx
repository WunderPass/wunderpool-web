import ReactCurrencyInput from 'react-currency-input-field';

type CurrencyInputProps = {
  value: string | number;
  onChange: (numStr: string, num: number) => void;
  prefix?: string;
  placeholder?: string;
  error?: string;
  limit?: number;
  className?: string;
  disabled?: boolean;
};

export default function CurrencyInput(props: CurrencyInputProps) {
  const {
    value,
    prefix,
    placeholder,
    onChange,
    error,
    limit,
    className,
    disabled,
  } = props;

  const handleInput = (value, _, values) => {
    if (!value) {
      onChange('', 0);
      return;
    }

    if (Number.isNaN(Number(value))) {
      return;
    }

    if (limit && Number(value) > limit) {
      onChange(`${limit}`, Number(limit));
      return;
    }

    onChange(value, values.float);
  };

  return (
    <>
      <ReactCurrencyInput
        decimalsLimit={2}
        value={value}
        type="text"
        className={`${className || 'textfield py-4 mt-2'} ${
          error && 'border-red-600 focus:border-red-600'
        }`}
        prefix={prefix || '$ '}
        placeholder={placeholder}
        onValueChange={handleInput}
        disabled={disabled}
      />
      {error && (
        <div className="text-red-600" style={{ marginTop: 0 }}>
          {error}
        </div>
      )}
    </>
  );
}
