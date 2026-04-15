"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import {
  saveBooksToFirestore,
  addBookToFirestore,
  removeBookFromFirestore,
  loadBooksFromFirestore,
  SavedBook,
} from "@/lib/firebase/library";

interface SavedBooksContextType {
  savedBooks: SavedBook[];
  finishedBooks: SavedBook[];
  isLoading: boolean;
  addBook: (book: SavedBook, type?: "saved" | "finished") => void;
  removeBook: (id: string, type?: "saved" | "finished") => void;
  isBookSaved: (id: string) => boolean;
  isBookFinished: (id: string) => boolean;
}

const SavedBooksContext = createContext<SavedBooksContextType | undefined>(undefined);

export function SavedBooksProvider({ children }: { children: React.ReactNode }) {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<SavedBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load books from Firestore when user logs in
  useEffect(() => {
    let cancelled = false;

    if (user) {
      setIsLoading(true);
      loadBooksFromFirestore(user.uid)
        .then(({ savedBooks, finishedBooks }) => {
          if (cancelled) return;
          setSavedBooks(savedBooks);
          setFinishedBooks(finishedBooks);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    } else {
      // Clear books when user logs out
      setSavedBooks([]);
      setFinishedBooks([]);
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addBook = (book: SavedBook, type: "saved" | "finished" = "saved") => {
    if (type === "saved") {
      setSavedBooks((prev) =>
        prev.some((b) => b.id === book.id) ? prev : [...prev, book]
      );
      if (user) {
        addBookToFirestore(user.uid, book, "saved");
      }
    } else {
      setFinishedBooks((prev) =>
        prev.some((b) => b.id === book.id) ? prev : [...prev, book]
      );
      if (user) {
        addBookToFirestore(user.uid, book, "finished");
      }
    }
  };

  const removeBook = (id: string, type: "saved" | "finished" = "saved") => {
    if (type === "saved") {
      setSavedBooks((prev) => prev.filter((b) => b.id !== id));
      if (user) {
        removeBookFromFirestore(user.uid, id, "saved");
      }
    } else {
      setFinishedBooks((prev) => prev.filter((b) => b.id !== id));
      if (user) {
        removeBookFromFirestore(user.uid, id, "finished");
      }
    }
  };

  const isBookSaved = (id: string) => savedBooks.some((b) => b.id === id);
  const isBookFinished = (id: string) => finishedBooks.some((b) => b.id === id);

  return (
    <SavedBooksContext.Provider
      value={{
        savedBooks,
        finishedBooks,
        isLoading,
        addBook,
        removeBook,
        isBookSaved,
        isBookFinished,
      }}
    >
      {children}
    </SavedBooksContext.Provider>
  );
}

export function useSavedBooks() {
  const context = useContext(SavedBooksContext);
  if (!context) throw new Error("useSavedBooks must be used within a SavedBooksProvider");
  return context;
}
