"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { AudioPlayer } from "../audioplayer/components/AudioPlayer";
import { Track } from "../audioplayer/context/audio-player-context";
import { SavedBook } from "@/lib/firebase/library";
import { useSavedBooks } from "@/components/SavedBooksContext";
import { useAuth } from "@/lib/firebase/AuthContext";

interface PlayerBook extends SavedBook {
  audioLink: string;
  summary: string;
}

type TextSizeOption = "small" | "medium" | "large" | "x-large";

const textSizeClasses: Record<TextSizeOption, string> = {
  small: "text-sm leading-6",
  medium: "text-base leading-7",
  large: "text-lg leading-8",
  "x-large": "text-xl leading-9",
};

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<PlayerBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [textSize, setTextSize] = useState<TextSizeOption>("medium");
  const { addBook } = useSavedBooks();
  const { user } = useAuth();

  const track: Track = useMemo(
    () => ({
      title: book?.title ?? "",
      author: book?.author ?? "",
      imageLink: book?.imageLink ?? "",
      src: book?.audioLink ?? "",
    }),
    [book?.title, book?.author, book?.imageLink, book?.audioLink]
  );

  useEffect(() => {
    if (!id) return;

    fetch(`https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBook({
          id: data.id,
          title: data.title,
          author: data.author,
          subTitle: data.subTitle,
          averageRating: data.averageRating,
          totalRating: data.totalRating,
          type: data.type,
          keyIdeas: data.keyIdeas,
          imageLink: data.imageLink,
          tags: data.tags,
          bookDescription: data.bookDescription,
          authorDescription: data.authorDescription,
          audioLink: data.audioLink,
          summary: data.summary,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleTrackEnded = () => {
    if (!user || !book) return;

    addBook(
      {
        id: book.id,
        title: book.title,
        author: book.author,
        subTitle: book.subTitle,
        averageRating: book.averageRating,
        totalRating: book.totalRating,
        type: book.type,
        keyIdeas: book.keyIdeas,
        imageLink: book.imageLink,
        tags: book.tags,
        bookDescription: book.bookDescription,
        authorDescription: book.authorDescription,
      },
      "finished"
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        showTextSizeControls
        selectedTextSize={textSize}
        onTextSizeChange={setTextSize}
      />
      <div className="md:ml-[200px] flex-1 flex flex-col">
        <SearchBar />
        <main className="flex-1 p-6 pb-28 max-w-[1070px] w-full mx-auto">
          {loading ? (
            <div className="text-[#394547]">Loading...</div>
          ) : !book ? (
            <div className="text-[#394547]">Book not found.</div>
          ) : (
            <section>
              <h1 className="text-3xl font-bold text-[#032b41] mb-6">{book.title}</h1>
               <hr className="mb-6 border-t border-[#e1e7ea]" />
              <p
                className={`${textSizeClasses[textSize]} text-[#394547] whitespace-pre-line transition-all duration-150`}
              >
                {book.summary}
              </p>
            </section>
          )}
        </main>
        <div className="fixed bottom-0 left-0 md:left-[200px] right-0 z-40">
          <AudioPlayer track={track} onTrackEnded={handleTrackEnded} />
        </div>
      </div>
    </div>
  );
}
