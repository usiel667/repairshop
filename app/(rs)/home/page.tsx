import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <h2 className="text-4xl font-bold text-blue-500 bg-center">Home Page</h2>
  );
}
