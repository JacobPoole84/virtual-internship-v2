"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { AiOutlineClose } from "react-icons/ai";
import { SidebarToggle } from "./Sidebar";

interface SearchResultBook {
  id: string;
  title: string;
  author: string;
  imageLink: string;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResultBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();

    const fetchBooks = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBooksByAuthorOrTitle?search=${encodeURIComponent(
            debouncedQuery
          )}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data: SearchResultBook[] = await response.json();
        setResults(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setHasSearched(true);
        }
      }
    };

    fetchBooks();

    return () => controller.abort();
  }, [debouncedQuery]);

  const showResults =
    query.trim().length > 0 && (isLoading || results.length > 0 || hasSearched);

  return (
    <nav className="flex items-center justify-between w-full max-w-[1070px] mx-auto border-b border-[#e1e7ea] px-4 md:px-8 py-3 gap-4 isolate relative z-10">
      <SidebarToggle />
      <div className="relative w-full max-w-[300px] ml-auto">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results.length > 0) {
              const firstResult = results[0];
              router.push(`/book/${firstResult.id}`);
              setQuery("");
              setResults([]);
              setHasSearched(false);
            }
          }}
          placeholder="Search for books"
          className="w-full h-10 rounded-lg border-2 border-[#e1e7ea] pl-10 pr-3 text-sm text-[#394547] focus:border-[#2bd97c] focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setHasSearched(false);
              inputRef.current?.focus();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#394547]"
          >
            <AiOutlineClose size={20} />
          </button>
        ) : (
          <AiOutlineSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#394547]"
          />
        )}

        {showResults && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-[#e1e7ea] rounded-lg shadow-md z-50 max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-3 text-sm text-[#6b757b]">Searching...</div>
            )}

            {!isLoading && results.length > 0 && (
              <ul>
                {results.map((book) => (
                  <li key={book.id}>
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/book/${book.id}`);
                        setQuery("");
                        setResults([]);
                        setHasSearched(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f0f4f3] text-left"
                    >
                      <Image
                        src={book.imageLink}
                        alt={book.title}
                        width={36}
                        height={52}
                        className="rounded object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-[#394547] font-semibold truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-[#6b757b] truncate">{book.author}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!isLoading && hasSearched && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-[#6b757b]">
                No books found for "{query.trim()}"
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
