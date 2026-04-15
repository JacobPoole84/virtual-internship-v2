"use client";
import Image from "next/image";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useContext } from "react";
import { ModalContext } from "@/components/modals/providers";
import { useSavedBooks } from "@/components/SavedBooksContext";
import { useRouter } from "next/navigation";

function LibraryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl p-4 flex gap-4 items-center bg-[#f7faf9] animate-pulse"
        >
          <div className="w-[60px] h-[90px] rounded bg-[#d8e3e0]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-4/5 rounded bg-[#d8e3e0]" />
            <div className="h-3 w-2/3 rounded bg-[#d8e3e0]" />
            <div className="h-3 w-full rounded bg-[#d8e3e0]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const { user } = useAuth();
  const { setShowSignInModal } = useContext(ModalContext);
  const { savedBooks, finishedBooks, isLoading } = useSavedBooks();
  const router = useRouter();

  if (!user) {
    return (
      <div className="max-w-[1070px] mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-2 w-full text-left">My Library</h1>
        <hr className="mb-8 border-t border-[#e1e7ea] w-full" />
        <Image src="/login.png" alt="Login" width={460} height={460} className="mb-8" />
        <h2 className="text-xl font-bold mb-2 text-center">Login to your account to see your library</h2>
        <button
          className="mt-2 px-6 py-2 bg-[#032b41] text-white rounded font-semibold transition-colors duration-200 hover:bg-[#0365f2]"
          onClick={() => setShowSignInModal(true)}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1070px] mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">My Library</h1>
      <hr className="mb-8 border-t border-[#e1e7ea]" />
      <section className="mb-12">
        <h2 className="text-[22px] font-[700] text-[#394547] mb-1">Saved Books</h2>
        <div className="text-[#6b757b] text-sm mb-4">{isLoading ? "Loading..." : `${savedBooks.length} items`}</div>
        {isLoading ? (
          <LibraryCardsSkeleton />
        ) : savedBooks.length === 0 ? (
          <div className="bg-[#f7faf9] rounded-xl p-6 text-[#6b757b] text-center">
            No saved books yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-[#fbefd6] rounded-xl p-4 flex gap-4 items-center transition-colors duration-200 hover:bg-[#f0f4f3] cursor-pointer"
                onClick={() => router.push(`/book/${book.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/book/${book.id}`); }}
                aria-label={`View details for ${book.title}`}
              >
                <img src={book.imageLink} alt={book.title} width={60} height={90} className="rounded" />
                <div>
                  <div className="font-bold text-[#394547]">{book.title}</div>
                  <div className="text-sm text-[#6b757b]">{book.author}</div>
                  <div className="text-xs text-[#394547] mt-1 line-clamp-2">
                    {book.subTitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="text-[22px] font-[700] text-[#394547] mb-1">Finished</h2>
        <div className="text-[#6b757b] text-sm mb-4">{isLoading ? "Loading..." : `${finishedBooks.length} items`}</div>
        {isLoading ? (
          <LibraryCardsSkeleton />
        ) : finishedBooks.length === 0 ? (
          <div className="bg-[#f7faf9] rounded-xl p-6 text-[#6b757b] text-center">
            No finished books yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {finishedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-[#f7faf9] rounded-xl p-4 flex gap-4 items-center transition-colors duration-200 hover:bg-[#f0f4f3] cursor-pointer"
                onClick={() => router.push(`/book/${book.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/book/${book.id}`); }}
                aria-label={`View details for ${book.title}`}
              >
                <img src={book.imageLink} alt={book.title} width={60} height={90} className="rounded" />
                <div>
                  <div className="font-bold text-[#394547]">{book.title}</div>
                  <div className="text-sm text-[#6b757b]">{book.author}</div>
                  <div className="text-xs text-[#394547] mt-1 line-clamp-2">
                    {book.subTitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
