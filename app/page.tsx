import { Navbar } from "@/components/navbar";
import { StudioPage } from "@/components/studio-page";
import { getAllArticles } from "@/lib/articles";

export default function Home() {
  const articles = getAllArticles();

  return (
    <>
      <Navbar />
      <StudioPage articles={articles} />
    </>
  );
}
