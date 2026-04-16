"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { RiPlantLine } from "react-icons/ri";
import { AiOutlineSetting } from "react-icons/ai";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { logOut } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { ModalContext } from "./modals/providers";

// Context for sidebar open/close state
export const SidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarToggle() {
  const { setIsOpen } = useContext(SidebarContext);
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-[#394547] hover:bg-[#f0f4f3] rounded-lg relative z-10"
      aria-label="Open menu"
    >
      <FiMenu size={24} />
    </button>
  );
}

type TextSizeOption = "small" | "medium" | "large" | "x-large";

interface SidebarProps {
  showTextSizeControls?: boolean;
  selectedTextSize?: TextSizeOption;
  onTextSizeChange?: (size: TextSizeOption) => void;
}

const textSizeOptions: Array<{ size: TextSizeOption; className: string }> = [
  { size: "small", className: "text-sm" },
  { size: "medium", className: "text-base" },
  { size: "large", className: "text-lg" },
  { size: "x-large", className: "text-xl" },
];

const topLinks = [
  { href: "/for-you", label: "For You", icon: AiOutlineHome, disabled: false },
  { href: "/library", label: "My Library", icon: BsBookmark, disabled: false },
  {
    href: "/highlights",
    label: "Highlights",
    icon: RiPlantLine,
    disabled: true,
  },
  { href: "/search", label: "Search", icon: AiOutlineSearch, disabled: true },
];

const bottomLinks = [
  {
    href: "/settings",
    label: "Settings",
    icon: AiOutlineSetting,
    disabled: false,
  },
  {
    href: "/help",
    label: "Help & Support",
    icon: AiOutlineQuestionCircle,
    disabled: true,
  },
];

export default function Sidebar({
  showTextSizeControls = false,
  selectedTextSize = "medium",
  onTextSizeChange,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { setShowSignInModal } = useContext(ModalContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isOpen, setIsOpen } = useContext(SidebarContext);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-[200px] bg-[#f7faf9] flex flex-col justify-between z-50 border-r border-[#e1e7ea] transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none md:pointer-events-auto"
        }`}
      >
        <div>
          <div className="flex items-center justify-between py-4 px-4 md:justify-center md:px-0 relative">
            <Link href="/for-you" className="shrink min-w-0 overflow-hidden">
              <Image src="/logo.png" alt="Logo" width={160} height={40} className="md:w-[160px] w-[120px]" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] shrink-0 text-[#394547] hover:bg-[#f0f4f3] rounded-lg relative z-10"
              aria-label="Close menu"
            >
              <FiX size={24} />
            </button>
          </div>
        <nav className="flex flex-col mt-4">
          {topLinks.map(({ href, label, icon: Icon, disabled }) =>
            disabled ? (
              <span
                key={href}
                className="flex items-center gap-2 px-6 py-3 text-sm text-[#394547] opacity-50 cursor-not-allowed"
              >
                <Icon size={22} />
                {label}
              </span>
            ) : (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-6 py-3 text-sm transition-colors hover:bg-[#f0f4f3] ${
                  pathname === href
                    ? "text-[#2bd97c] font-semibold"
                    : "text-[#394547]"
                }`}
              >
                <Icon size={22} />
                {label}
              </Link>
            ),
          )}
        </nav>
        {showTextSizeControls && (
          <div className="px-6 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b757b] mb-3">
              Text size
            </p>
            <div className="flex items-center gap-2">
              {textSizeOptions.map(({ size, className }) => {
                const isActive = selectedTextSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onTextSizeChange?.(size)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                      isActive
                        ? "border-[#2bd97c] bg-[#032b41] text-white"
                        : "border-[#d7e1e5] bg-white text-[#394547] hover:bg-[#eef4f2]"
                    }`}
                    aria-label={`Set text size to ${size}`}
                    aria-pressed={isActive}
                  >
                    <span className={`font-semibold leading-none ${className}`}>
                      Aa
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="mb-4">
        <nav className="flex flex-col">
          {bottomLinks.map(({ href, label, icon: Icon, disabled }) =>
            disabled ? (
              <span
                key={href}
                className="flex items-center gap-2 px-6 py-3 text-sm text-[#394547] opacity-50 cursor-not-allowed"
              >
                <Icon size={22} />
                {label}
              </span>
            ) : (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-6 py-3 text-sm transition-colors hover:bg-[#f0f4f3] ${
                  pathname === href
                    ? "text-[#2bd97c] font-semibold"
                    : "text-[#394547]"
                }`}
              >
                <Icon size={22} />
                {label}
              </Link>
            ),
          )}
          {user ? (
            <button
              onClick={async () => {
                setIsLoggingOut(true);
                await logOut();
                setIsLoggingOut(false);
              }}
              className="flex items-center gap-2 px-6 py-3 text-sm text-[#394547] transition-colors hover:bg-[#f0f4f3] w-full"
              disabled={isLoggingOut}
            >
              <FiLogOut size={22} />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <button
              onClick={() => setShowSignInModal(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm text-[#394547] transition-colors hover:bg-[#f0f4f3] w-full"
            >
              <FiLogOut size={22} />
              Login
            </button>
          )}
        </nav>
      </div>
    </aside>
    </>
  );
}
