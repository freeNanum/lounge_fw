import type { ReactNode } from "react";

interface FormErrorTextProps {
  children: ReactNode;
}

export function FormErrorText({ children }: FormErrorTextProps) {
  if (!children) {
    return null;
  }

  return <div style={{ color: "#b91c1c", fontSize: "14px" }}>{children}</div>;
}
