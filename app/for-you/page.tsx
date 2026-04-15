"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useRouter } from "next/navigation";
import { AiFillStar, AiOutlineClockCircle } from "react-icons/ai";
import { BsFillPlayCircleFill } from "react-icons/bs";
import { BiCrown } from "react-icons/bi";

interface SelectedBook {
  id: string;
  title: string;
  subTitle: string;
  author: string;
  imageLink: string;
  audioLink: string;
}

interface Book {
  id: string;
  title: string;
  subTitle: string;
  author: string;
  imageLink: string;
  audioLink: string;
  averageRating: number;
  subscriptionRequired: boolean;
}

function SelectedBookSkeleton() {
  return (
    <div className="flex items-center gap-6 bg-[#fbefd6] rounded-lg p-6 animate-pulse">
      <div className="w-2/5 space-y-3">
        <div className="h-4 w-full rounded bg-[#d8e3e0]" />
        <div className="h-4 w-4/5 rounded bg-[#d8e3e0]" />
      </div>
      <div className="w-px self-stretch bg-[#bac8ce]" />
      <div className="flex items-center gap-4 shrink-0">
        <div className="h-[140px] w-[140px] rounded bg-[#d8e3e0]" />
        <div className="space-y-3">
          <div className="h-4 w-36 rounded bg-[#d8e3e0]" />
          <div className="h-3 w-28 rounded bg-[#d8e3e0]" />
          <div className="h-3 w-24 rounded bg-[#d8e3e0]" />
        </div>
      </div>
    </div>
  );
}

function BookRowSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="min-w-0 flex-[0_0_calc(20%-13px)] p-3 pt-8 rounded-2xl animate-pulse"
        >
          <div className="w-full aspect-square rounded bg-[#d8e3e0]" />
          <div className="h-4 w-11/12 rounded bg-[#d8e3e0] mt-2" />
          <div className="h-3 w-2/3 rounded bg-[#d8e3e0] mt-2" />
          <div className="h-3 w-full rounded bg-[#d8e3e0] mt-2" />
          <div className="h-3 w-1/2 rounded bg-[#d8e3e0] mt-2" />
        </div>
      ))}
    </div>
  );
}

function formatDuration(durationInSeconds: number) {
  const total = Math.floor(durationInSeconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

async function loadBookDurations(books: Book[]) {
  const entries = await Promise.all(
    books.map(
      (book) =>
        new Promise<[string, string]>((resolve) => {
          if (!book.audioLink) {
            resolve([book.id, "0:00"]);
            return;
          }

          const audio = new Audio(book.audioLink);

          const cleanup = () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("error", onError);
          };

          const onLoaded = () => {
            cleanup();
            resolve([book.id, formatDuration(audio.duration)]);
          };

          const onError = () => {
            cleanup();
            resolve([book.id, "0:00"]);
          };

          audio.addEventListener("loadedmetadata", onLoaded);
          audio.addEventListener("error", onError);
        })
    )
  );

  return Object.fromEntries(entries);
}


export default function ForYouPage() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(null);
  const [selectedBookDuration, setSelectedBookDuration] = useState<string | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [recommendedDurations, setRecommendedDurations] = useState<Record<string, string>>({});
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [suggestedDurations, setSuggestedDurations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user, subscriptionStatus } = useAuth();

  useEffect(() => {
    if (!selectedBook?.audioLink) return;
    const audio = new Audio(selectedBook.audioLink);
    const onLoaded = () => {
      const total = Math.floor(audio.duration);
      const mins = Math.floor(total / 60);
      const secs = total % 60;
      setSelectedBookDuration(`${mins} mins ${secs.toString().padStart(2, "0")} secs`);
    };
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, [selectedBook?.audioLink]);

  useEffect(() => {
    if (recommendedBooks.length === 0) {
      setRecommendedDurations({});
      return;
    }

    let cancelled = false;

    loadBookDurations(recommendedBooks).then((durations) => {
      if (!cancelled) {
        setRecommendedDurations(durations);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [recommendedBooks]);

  useEffect(() => {
    if (suggestedBooks.length === 0) {
      setSuggestedDurations({});
      return;
    }

    let cancelled = false;

    loadBookDurations(suggestedBooks).then((durations) => {
      if (!cancelled) {
        setSuggestedDurations(durations);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [suggestedBooks]);

  useEffect(() => {
    let cancelled = false;

    const loadBooks = async () => {
      setIsLoading(true);

      try {
        const [selectedData, recommendedData, suggestedData] = await Promise.all([
          fetch(
            "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=selected"
          ).then((res) => res.json()),
          fetch(
            "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=recommended"
          ).then((res) => res.json()),
          fetch(
            "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=suggested"
          ).then((res) => res.json()),
        ]);

        if (cancelled) return;

        setSelectedBook(selectedData?.[0] ?? null);
        setRecommendedBooks(Array.isArray(recommendedData) ? recommendedData : []);
        setSuggestedBooks(Array.isArray(suggestedData) ? suggestedData : []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-[1070px] mx-auto py-8 space-y-16">
      <section>
        <h2 className="text-[22px] font-bold text-[#394547] mb-4">
          Selected just for you
        </h2>
        {isLoading ? (
          <SelectedBookSkeleton />
        ) : (
          selectedBook && (
          <div className="flex items-center gap-6 bg-[#fbefd6] rounded-lg p-6 cursor-pointer" onClick={() => router.push(`/book/${selectedBook.id}`)}>
            <p className="w-2/5 text-[#394547] font-medium">
              {selectedBook.subTitle}
            </p>
            <div className="w-px self-stretch bg-[#bac8ce]" />
            <div className="flex items-center gap-4 shrink-0">
              <Image
                src={selectedBook.imageLink}
                alt={selectedBook.title}
                width={140}
                height={140}
                className="rounded"
              />
              <div>
                <h3 className="font-bold text-[#394547]">
                  {selectedBook.title}
                </h3>
                <p className="text-sm text-[#394547]">
                  {selectedBook.author}
                </p>
                {selectedBookDuration && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-[#394547]">
                    <BsFillPlayCircleFill size={16} />
                    <span>{selectedBookDuration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          )
        )}
      </section>

      <section>
        <h2 className="text-[22px] font-bold text-[#394547] mb-1">
          Recommended For You
        </h2>
        <p className="text-base text-[#394547] mb-4">We think you'll like these</p>
        {isLoading ? (
          <BookRowSkeleton />
        ) : (
          recommendedBooks.length > 0 && (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
            {recommendedBooks.map((book) => (
              <div
                key={book.id}
                className="relative min-w-0 flex-[0_0_calc(20%-13px)] snap-start p-3 pt-8 rounded-2xl overflow-hidden transition-colors hover:bg-[#f0f4f3] cursor-pointer"
                onClick={() => router.push(`/book/${book.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/book/${book.id}`); }}
                aria-label={`View details for ${book.title}`}
              >
                {book.subscriptionRequired && (!user || subscriptionStatus !== "premium-plus") && (
                  <div className="absolute top-0 right-0 bg-[#032b41] text-white text-xs font-semibold px-2 py-1 rounded-bl z-10 flex items-center gap-1">
                    <BiCrown size={14} /> Premium
                  </div>
                )}
                <Image
                  src={book.imageLink}
                  alt={book.title}
                  width={172}
                  height={172}
                  className="w-full rounded"
                />
                <h3 className="font-bold text-[#394547] text-sm mt-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-[#6b757b] mt-1">{book.author}</p>
                <p className="text-xs text-[#394547] mt-1 line-clamp-2">
                  {book.subTitle}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-[#6b757b]">
                    <AiOutlineClockCircle size={14} />
                    {recommendedDurations[book.id] ?? "0:00"}
                  </span>
                  <AiFillStar className="text-[#0365f2]" size={14} />
                  <span className="text-xs text-[#394547]">
                    {book.averageRating}
                  </span>
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </section>

      <section>
        <h2 className="text-[22px] font-bold text-[#394547] mb-1">
          Suggested Books
        </h2>
        <p className="text-base text-[#394547] mb-4">Browse those books</p>
        {isLoading ? (
          <BookRowSkeleton />
        ) : (
          suggestedBooks.length > 0 && (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
            {suggestedBooks.map((book) => (
              <div
                key={book.id}
                className="relative min-w-0 flex-[0_0_calc(20%-13px)] snap-start p-3 pt-8 rounded-2xl overflow-hidden transition-colors hover:bg-[#f0f4f3] cursor-pointer"
                onClick={() => router.push(`/book/${book.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/book/${book.id}`); }}
                aria-label={`View details for ${book.title}`}
              >
                {book.subscriptionRequired && (!user || subscriptionStatus !== "premium-plus") && (
                  <div className="absolute top-0 right-0 bg-[#032b41] text-white text-xs font-semibold px-2 py-1 rounded-bl z-10 flex items-center gap-1">
                    <BiCrown size={14} /> Premium
                  </div>
                )}
                <Image
                  src={book.imageLink}
                  alt={book.title}
                  width={172}
                  height={172}
                  className="w-full rounded"
                />
                <h3 className="font-bold text-[#394547] text-sm mt-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-[#6b757b] mt-1">{book.author}</p>
                <p className="text-xs text-[#394547] mt-1 line-clamp-2">
                  {book.subTitle}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-[#6b757b]">
                    <AiOutlineClockCircle size={14} />
                    {suggestedDurations[book.id] ?? "0:00"}
                  </span>
                  <AiFillStar className="text-[#0365f2]" size={14} />
                  <span className="text-xs text-[#394547]">
                    {book.averageRating}
                  </span>
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </section>
    </div>
  );
}
