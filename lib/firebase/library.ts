import { db } from "./init";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export interface SavedBook {
  id: string;
  title: string;
  author: string;
  subTitle: string;
  averageRating: number;
  totalRating: number;
  type: string;
  keyIdeas: number;
  imageLink: string;
  tags: string[];
  bookDescription: string;
  authorDescription: string;
}

export async function saveBooksToFirestore(
  userId: string,
  savedBooks: SavedBook[],
  finishedBooks: SavedBook[]
) {
  const userLibraryRef = doc(db, "userLibraries", userId);
  await setDoc(
    userLibraryRef,
    {
      savedBooks,
      finishedBooks,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

export async function addBookToFirestore(
  userId: string,
  book: SavedBook,
  type: "saved" | "finished" = "saved"
) {
  const userLibraryRef = doc(db, "userLibraries", userId);
  const fieldName = type === "saved" ? "savedBooks" : "finishedBooks";
  await updateDoc(userLibraryRef, {
    [fieldName]: arrayUnion(book),
    updatedAt: new Date(),
  });
}

export async function removeBookFromFirestore(
  userId: string,
  bookId: string,
  type: "saved" | "finished" = "saved"
) {
  const userLibraryRef = doc(db, "userLibraries", userId);
  const docSnap = await getDoc(userLibraryRef);

  if (docSnap.exists()) {
    const fieldName = type === "saved" ? "savedBooks" : "finishedBooks";
    const books = docSnap.data()[fieldName] || [];
    const bookToRemove = books.find((b: SavedBook) => b.id === bookId);

    if (bookToRemove) {
      await updateDoc(userLibraryRef, {
        [fieldName]: arrayRemove(bookToRemove),
        updatedAt: new Date(),
      });
    }
  }
}

export async function loadBooksFromFirestore(
  userId: string
): Promise<{ savedBooks: SavedBook[]; finishedBooks: SavedBook[] }> {
  const userLibraryRef = doc(db, "userLibraries", userId);
  const docSnap = await getDoc(userLibraryRef);

  if (docSnap.exists()) {
    return {
      savedBooks: docSnap.data().savedBooks || [],
      finishedBooks: docSnap.data().finishedBooks || [],
    };
  }

  // Create new user library if it doesn't exist
  await setDoc(userLibraryRef, {
    savedBooks: [],
    finishedBooks: [],
    createdAt: new Date(),
  });

  return { savedBooks: [], finishedBooks: [] };
}
