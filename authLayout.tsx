import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Colonne image */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `url('/flat.jpg')` }}
        ></div>

        <div className="w-full md:w-1/2 p-8 md:p-12">{children}</div>
      </div>
    </div>
  );
}
