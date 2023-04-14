import { useEffect, useRef } from 'react';

type CustomInputButtonProps = {
  show: boolean;
  value: string;
  placeholder: string;
  className: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onClickAway: React.FocusEventHandler<HTMLInputElement>;
};

export default function CustomInput({
  show,
  value,
  placeholder,
  className,
  onChange,
  onClickAway,
}: CustomInputButtonProps) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [show]);

  return (
    <div
      className={show ? 'flex items-center justify-center w-full' : 'hidden'}
    >
      <input
        ref={inputRef}
        value={value}
        className={`${
          className || 'bg-gray-200 text-black'
        } text-sm px-2 rounded-lg w-full py-2 text-center`}
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onClickAway}
      />
    </div>
  );
}
