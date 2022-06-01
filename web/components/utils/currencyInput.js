import ReactCurrencyInput from 'react-currency-input-field';

export default function CurrencyInput(props) {
  const { value, prefix, placeholder, onChange, error, limit, className } =
    props;

  const handleInput = (value, _, values) => {
    console.log(value, values);

    if (!value) {
      onChange('', 0);
      return;
    }

    if (Number.isNaN(Number(value))) {
      return;
    }

    if (limit && Number(value) > limit) {
      onChange(limit, Number(limit));
      return;
    }

    onChange(value, values.float);
  };

  return (
    <>
      <ReactCurrencyInput
        value={value}
        className={`${className || 'textfield py-4 mt-2'} ${
          error && 'border-red-600 focus:border-red-600'
        }`}
        prefix={prefix || '$'}
        placeholder={placeholder}
        onValueChange={handleInput}
      />
      {error && (
        <div className="text-red-600" style={{ marginTop: 0 }}>
          {error}
        </div>
      )}
    </>
  );
}
