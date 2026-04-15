import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";

export default function ForYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-[200px] flex-1 flex flex-col">
        <SearchBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
