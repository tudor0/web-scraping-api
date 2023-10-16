import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);

  const getPageData = async () => {
    try {
      setResult([]);
      const resp = await fetch("http://localhost:3000/api/hello", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: input })
      });

      const data = await resp.text();

      setResult(JSON.parse(data));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 gap-3 ${inter.className}`}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="text-black"
      />
      {result.length > 0 && (
        <div id="page-data" className="max-h-[80vh] overflow-y-auto">
          {result.map((item, index) => {
            return (
              <li key={index} className="list-none">
                <pre>
                  <code>{JSON.stringify(item, null, 2)}</code>
                </pre>
              </li>
            );
          })}
        </div>
      )}
      <button onClick={getPageData}>Scrape</button>
    </main>
  );
}
