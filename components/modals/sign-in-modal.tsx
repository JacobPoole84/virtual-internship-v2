"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2, UserRound } from "lucide-react";
import Image from "next/image";
import {
  register,
  login,
  loginGuest,
  resetPassword,
  signInWithGoogle,
} from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

function SignInModal({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [signInClicked, setSignInClicked] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <Dialog
      open={showSignInModal}
      onOpenChange={(open) => {
        setShowSignInModal(open);
        if (!open) {
          setMode("login");
          setError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md" style={{ padding: "48px 32px" }}>
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-2xl">
            {mode === "login" && "Login to Summarist"}
            {mode === "signup" && "Sign Up to Summarist"}
            {mode === "forgot" && "Reset your password"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "login" && "Please enter your credentials to access your account."}
            {mode === "signup" && "Create an account to get started."}
            {mode === "forgot" && "Enter your email to receive a reset link."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}

        {mode === "login" && (
          <Button
            variant="outline"
            className="w-full mt-4 text-xl"
            disabled={signInClicked}
            onClick={() => {
              setSignInClicked(true);
              setError(null);
              loginGuest()
                .then(() => {
                  setShowSignInModal(false);
                  router.push("/for-you");
                })
                .catch((error) => {
                  setError(error.message);
                })
                .finally(() => setSignInClicked(false));
            }}
          >
            {signInClicked ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <UserRound className="mr-2" />
            )}
            Login as a Guest
          </Button>
        )}

        {mode !== "forgot" && (
          <div className="w-full">
            {mode === "login" && (
              <div className="flex items-center w-full gap-6">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-gray-300" />
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4 text-xl"
              disabled={signInClicked}
              onClick={() => {
                setSignInClicked(true);
                setError(null);
                signInWithGoogle()
                  .then(() => {
                    setShowSignInModal(false);
                    router.push("/for-you");
                  })
                  .catch((error) => {
                    setError(error.message);
                  })
                  .finally(() => setSignInClicked(false));
              }}
            >
              {signInClicked ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Image
                  src="/google.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
              )}
              {mode === "login" ? "Sign In with Google" : "Sign Up with Google"}
            </Button>
            <div className="flex items-center w-full gap-6 mt-4">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>
          </div>
        )}

        {mode === "login" ? (
          <>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const password = (form.elements.namedItem("password") as HTMLInputElement).value;
                setSignInClicked(true);
                setError(null);
                login(email, password)
                  .then(() => {
                    setShowSignInModal(false);
                    router.push("/for-you");
                  })
                  .catch((error) => {
                    setError(error.message);
                  })
                  .finally(() => setSignInClicked(false));
              }}
            >
              <input
                name="email"
                type="text"
                placeholder="E-mail Address"
                className="h-10 w-full rounded border-2 border-[#bac8ce] px-3 text-[#394547] focus:border-[#2bd97c] focus:outline-none"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="h-10 w-full rounded border-2 border-[#bac8ce] px-3 text-[#394547] focus:border-[#2bd97c] focus:outline-none"
              />
              <button type="submit" className="auth-submit" disabled={signInClicked}>
                Login
              </button>
            </form>
            <div className="text-center mt-4">
              <button
                type="button"
                className="auth-link"
                onClick={() => { setMode("forgot"); setError(null); }}
              >
                Forgot Your Password?
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                type="button"
                className="auth-link"
                onClick={() => { setMode("signup"); setError(null); }}
              >
                Don't have an account? Sign Up
              </button>
            </div>
          </>
        ) : mode === "signup" ? (
          <>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const password = (form.elements.namedItem("password") as HTMLInputElement).value;
                setSignInClicked(true);
                setError(null);
                register(email, password)
                  .then(() => {
                    setShowSignInModal(false);
                    router.push("/for-you");
                  })
                  .catch((error) => {
                    setError(error.message);
                  })
                  .finally(() => setSignInClicked(false));
              }}
            >
              <input
                name="email"
                type="text"
                placeholder="E-mail Address"
                className="h-10 w-full rounded border-2 border-[#bac8ce] px-3 text-[#394547] focus:border-[#2bd97c] focus:outline-none"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="h-10 w-full rounded border-2 border-[#bac8ce] px-3 text-[#394547] focus:border-[#2bd97c] focus:outline-none"
              />
              <button type="submit" className="auth-submit" disabled={signInClicked}>
                Sign Up
              </button>
            </form>
            <div className="text-center mt-4">
              <button
                type="button"
                className="auth-link"
                onClick={() => { setMode("login"); setError(null); }}
              >
                Already have an account? Login
              </button>
            </div>
          </>
        ) : (
          <>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                setSignInClicked(true);
                setError(null);
                resetPassword(email)
                  .then(() => {
                    setError(null);
                    setMode("login");
                  })
                  .catch((error) => {
                    setError(error.message);
                  })
                  .finally(() => setSignInClicked(false));
              }}
            >
              <input
                name="email"
                type="text"
                placeholder="E-mail Address"
                className="h-10 w-full rounded border-2 border-[#bac8ce] px-3 text-[#394547] focus:border-[#2bd97c] focus:outline-none"
              />
              <button type="submit" className="auth-submit" disabled={signInClicked}>
                Send reset password link
              </button>
            </form>
            <div className="text-center mt-4">
              <button
                type="button"
                className="auth-link"
                onClick={() => { setMode("login"); setError(null); }}
              >
                Go to login
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const useSignInModal = () => {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalComponent = () => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  };

  return {
    setShowSignInModal,
    SignInModal: SignInModalComponent,
  };
};

export default useSignInModal;
