import type { ReactNode } from "react";
import InputMotion from "./InputMotion";
import ButtonMotion from "./ButtonMotion";
import VisibilityIcon from "@mui/icons-material/Visibility"

interface FormField {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showToggle?: boolean;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
}

interface ReusableFormProps {
  logoSrc?: string;
  title: string;
  error?: string;
  fields: FormField[];
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  loading?: boolean;
  googleButton?: ReactNode;
  appleButton?: ReactNode;
  footer?: ReactNode;
}

export default function ReusableForm({
  logoSrc,
  title,
  error,
  fields,
  onSubmit,
  submitText,
  loading,
  googleButton,
  appleButton,
  footer,
}: ReusableFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
      {logoSrc && (
        <img
          src={logoSrc}
          alt="Logo"
          className="w-41 h-auto mx-auto mb-2 mt-2"
        />
      )}
      <h2 className="text-3xl font-semibold text-center">{title}</h2>
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      {fields.map((field) => (
        <div key={field.name} className="space-y-1 relative">
          <label className="block text-sm font-medium">{field.label}</label>
          <InputMotion
            name={field.name}
            type={field.showToggle ? (field.showPassword ? "text" : "password") : field.type}
            value={field.value}
            onChange={field.onChange}
            className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
          />
          {field.showToggle && field.togglePasswordVisibility && (
            <div
              className="absolute top-8 right-3 cursor-pointer text-gray-500"
              onClick={field.togglePasswordVisibility}
            >
              {field.showPassword ? <VisibilityIcon /> : <VisibilityIcon />}
            </div>
          )}
        </div>
      ))}

      <ButtonMotion
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Loading..." : submitText}
      </ButtonMotion>

      {googleButton}
      {appleButton}
      {footer}
    </form>
  );
}
