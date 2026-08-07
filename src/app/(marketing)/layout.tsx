import type { Metadata } from "next";
import "@/styles/marketing.css";

export const metadata: Metadata = {
  title: "NexaForge — The Education Ecosystem for African Schools",
  description:
    "NexaForge is the education ecosystem for African schools that refuse to produce students who are only good at passing exams. Software, programmes, and devices — together.",
  openGraph: {
    title: "NexaForge — The Education Ecosystem for African Schools",
    description:
      "Software that runs your school. Programmes that transform your students.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      {children}
    </div>
  );
}
