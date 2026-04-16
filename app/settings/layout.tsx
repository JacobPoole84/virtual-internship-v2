import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="md:ml-[200px] flex-1 flex flex-col">
        <SearchBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
