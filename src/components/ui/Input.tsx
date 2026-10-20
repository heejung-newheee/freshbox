import type { InputHTMLAttributes, Ref } from "react";
import { fieldSizes, cx, fieldClass, type FieldSize } from "./formStyles";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: FieldSize;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ size = "md", className, ...props }: InputProps) {
  return (
    <input
      className={cx(fieldClass, fieldSizes[size], className)}
      {...props}
    />
  );
}
