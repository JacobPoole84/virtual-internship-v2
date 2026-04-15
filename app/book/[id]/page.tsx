"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AiFillBulb, AiFillStar, AiOutlineAudio, AiOutlineClockCircle } from "react-icons/ai";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useSavedBooks } from "@/components/SavedBooksContext";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useContext } from "react";
import { ModalContext } from "@/components/modals/providers";

interface Book {
  id: string;
  title: string;
  author: string;
  subTitle: string;
  averageRating: number;
  totalRating: number;
  type: string;
  keyIdeas: number;
  imageLink: string;
  audioLink: string;
  subscriptionRequired: boolean;
  tags: string[];
  bookDescription: string;
  authorDescription: string;
}

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState<string | null>(null);
  const { addBook, removeBook, isBookSaved } = useSavedBooks();
  const { user, subscriptionStatus } = useAuth();
  const { setShowSignInModal } = useContext(ModalContext);
  const isSaved = book ? isBookSaved(book.id) : false;

  useEffect(() => {
    if (!id) return;
    fetch(`https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`)
      .then((res) => res.json())
      .then((data) => setBook(data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!book?.audioLink) return;
    const audio = new Audio(book.audioLink);
    const onLoaded = () => {
      const total = Math.floor(audio.duration);
      const mins = Math.floor(total / 60);
      const secs = total % 60;
      setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, [book?.audioLink]);

  if (loading) {
    return (
      <div className="flex flex-col p-6 max-w-[1070px] mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 space-y-3">
            <div className="h-9 w-3/4 rounded bg-[#d8e3e0]" />
            <div className="h-5 w-1/3 rounded bg-[#d8e3e0]" />
            <div className="h-4 w-2/3 rounded bg-[#d8e3e0]" />
            <hr className="my-3 border-t border-[#e1e7ea]" />
            <div className="flex gap-4 items-center">
              <div className="h-4 w-24 rounded bg-[#d8e3e0]" />
              <div className="h-4 w-20 rounded bg-[#d8e3e0]" />
              <div className="h-4 w-20 rounded bg-[#d8e3e0]" />
              <div className="h-4 w-24 rounded bg-[#d8e3e0]" />
            </div>
            <hr className="mb-4 mt-6 border-t border-[#e1e7ea]" />
            <div className="flex gap-4">
              <div className="h-10 w-24 rounded bg-[#d8e3e0]" />
              <div className="h-10 w-24 rounded bg-[#d8e3e0]" />
            </div>
            <div className="h-5 w-40 rounded bg-[#d8e3e0] mt-4" />
          </div>
          <div className="flex-shrink-0">
            <div className="w-[300px] h-[300px] rounded-xl bg-[#d8e3e0]" />
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-7 w-36 rounded bg-[#d8e3e0]" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-[#d8e3e0]" />
            <div className="h-6 w-24 rounded-full bg-[#d8e3e0]" />
          </div>
          <div className="h-4 w-full rounded bg-[#d8e3e0]" />
          <div className="h-4 w-5/6 rounded bg-[#d8e3e0]" />
          <div className="h-4 w-4/6 rounded bg-[#d8e3e0]" />
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-7 w-44 rounded bg-[#d8e3e0]" />
          <div className="h-4 w-full rounded bg-[#d8e3e0]" />
          <div className="h-4 w-5/6 rounded bg-[#d8e3e0]" />
        </div>
      </div>
    );
  }

  if (!book) return <div>Book not found.</div>;

  return (
    <div className="flex flex-col p-6 max-w-[1070px] mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold">
            {book.title}
            {book.subscriptionRequired && (!user || subscriptionStatus !== "premium-plus") && (
              <span className="text-[#0365f2]"> (Premium)</span>
            )}
          </h1>
          <h2 className="text-lg text-[#394547]">{book.author}</h2>
          <div className="text-base text-[#6b757b]">{book.subTitle}</div>
          <hr className="my-3 border-t border-[#e1e7ea]" />
          <div className="flex gap-4 items-center mt-2">
            <span className="flex items-center gap-1 text-[#0365f2]">
              <AiFillStar />
            </span>
            <span>{book.averageRating} ({book.totalRating} ratings)</span>
            <span className="ml-4 flex items-center gap-1 text-[#394547]">
              <AiOutlineAudio />
            </span>
            <span>{book.type}</span>
            {duration && (
              <span className="ml-4 flex items-center gap-1 text-[#394547]">
                <AiOutlineClockCircle />
                {duration}
              </span>
            )}
            <span className="ml-4 flex items-center gap-1 text-[#facc15]">
              <AiFillBulb />
              {book.keyIdeas} key ideas
            </span>
          </div>
          <hr className="mb-4 mt-6 border-t border-[#e1e7ea]" />
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-[#032b41] text-white rounded font-semibold"
              onClick={() => {
                if (!user) {
                  setShowSignInModal(true);
                  return;
                }

                if (book.subscriptionRequired && subscriptionStatus !== "premium-plus") {
                  router.push("/choose-plan");
                  return;
                }

                router.push(`/player/${id}`);
              }}
            >
              Read
            </button>
            <button
              className="px-4 py-2 bg-[#032b41] text-white rounded font-semibold"
              onClick={() => {
                if (!user) {
                  setShowSignInModal(true);
                  return;
                }

                if (book.subscriptionRequired && subscriptionStatus !== "premium-plus") {
                  router.push("/choose-plan");
                  return;
                }

                router.push(`/player/${id}`);
              }}
            >
              Listen
            </button>
          </div>
          <div className="mt-4">
            <button
              className="flex items-center gap-2 text-[#0365f2] font-semibold"
              onClick={() => {
                if (!user) {
                  setShowSignInModal(true);
                  return;
                }

                if (isSaved) {
                  removeBook(book.id);
                } else {
                  addBook({ ...book, keyIdeas: book.keyIdeas });
                }
              }}
            >
              {isSaved ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
              {isSaved ? "Saved in My Library" : "Add title to My Library"}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Image src={book.imageLink} alt={book.title} width={300} height={300} className="rounded-xl" />
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">What's it about</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {book.tags.map((tag, idx) => (
            <span key={idx} className="bg-[#e1e7ea] text-[#394547] px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
          ))}
        </div>
        <div className="text-base text-[#394547]">{book.bookDescription}</div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">About the author</h3>
        <div className="text-base text-[#394547]">{book.authorDescription}</div>
      </div>
    </div>
  );
}
