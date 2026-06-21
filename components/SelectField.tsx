"use client";

import {
  SelectHTMLAttributes,
  forwardRef,
  useLayoutEffect,
  useRef,
} from "react";
import { initSelectFields, syncSelectFieldFromNative } from "@/lib/select-fields";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ className = "", children, ...selectProps }, ref) {
    const localRef = useRef<HTMLSelectElement>(null);

    const setRef = (el: HTMLSelectElement | null) => {
      localRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    useLayoutEffect(() => {
      initSelectFields();
      if (localRef.current) syncSelectFieldFromNative(localRef.current);
    });

    return (
      <div className={["select-field", className].filter(Boolean).join(" ")}>
        <select ref={setRef} {...selectProps}>
          {children}
        </select>
      </div>
    );
  },
);

export default SelectField;
