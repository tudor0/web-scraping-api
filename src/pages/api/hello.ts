import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import { DOMParser, Window } from "happy-dom";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const pageData = await page.evaluate(() => {
    const main = document.querySelector("main")?.innerHTML;

    return main;
  });

  if (!pageData) {
    res.send("No data found");
    return;
  }

  new Window({});

  const parser = new DOMParser();

  const doc = parser.parseFromString(pageData, "text/html");

  const divElements = doc.querySelectorAll("div");

  const articlesData: Record<string, string>[] = [];

  for (const div of divElements) {
    const firstChild = div.children[0];
    const secondChild = div.children[1];

    if (
      firstChild &&
      firstChild.tagName.toLowerCase() === "a" &&
      secondChild &&
      secondChild.tagName.toLowerCase() === "div"
    ) {
      const articleData: Record<string, string> = {};

      const image = firstChild.querySelector("img");

      if (image) {
        articleData["image"] = `${url}${image
          .getAttribute("src")
          .replace("/", "")}`;
      }

      const articleLink = `${url}${firstChild
        .getAttribute("href")
        .replace("/", "")}`;

      if (firstChild.getAttribute("href")) {
        articleData["link"] = articleLink;
      }

      await page.goto(articleLink);

      const articleWordCount = await page.evaluate(() => {
        const div = document.querySelector("div")?.textContent;

        const words = div?.split(" ");

        let count = 0;

        const positive_words = [
          "love",
          "joy",
          "happy",
          "excited",
          "delight",
          "bliss",
          "pleasure",
          "euphoria",
          "ecstasy",
          "content",
          "grateful",
          "appreciate",
          "admire",
          "serene",
          "peace",
          "hope",
          "optimism",
          "success",
          "accomplish",
          "thrive",
          "wonderful",
          "fantastic",
          "amazing",
          "marvelous",
          "excellent",
          "superb",
          "terrific",
          "magnificent",
          "beautiful",
          "gorgeous",
          "radiant",
          "glorious",
          "jubilant",
          "exciting",
          "enthusiasm",
          "passion",
          "energetic",
          "vibrant",
          "dynamic",
          "inspire",
          "motivate",
          "empower",
          "uplift",
          "confidence",
          "optimistic",
          "brave",
          "strong",
          "resilient",
          "kind",
          "generous",
          "compassion",
          "empathy",
          "goodness",
          "friendly",
          "cheerful",
          "caring",
          "affection",
          "affirmation",
          "sweet",
          "lively",
          "abundant",
          "bountiful",
          "joys",
          "satisfaction"
        ];
      
        const negative_words = [
          "hate",
          "anger",
          "sad",
          "depressed",
          "disappointment",
          "sorrow",
          "grief",
          "pain",
          "agony",
          "misery",
          "frustration",
          "annoyance",
          "irritation",
          "disgust",
          "revulsion",
          "bitter",
          "resentment",
          "envy",
          "jealousy",
          "regret",
          "guilt",
          "shame",
          "embarrassment",
          "humiliation",
          "despair",
          "loneliness",
          "isolation",
          "abandonment",
          "hopeless",
          "helpless",
          "overwhelmed",
          "stress",
          "anxiety",
          "fear",
          "dread",
          "panic"
        ];

        if (words) {
          for (const word of words) {
            if (positive_words.includes(word.toLowerCase())) {
              count++;
            } else if (negative_words.includes(word.toLowerCase())) {
              count--;
            }
          }
        }

        return {
          words: div?.length,
          sentiment:
            count === 0 ? "neutral" : count > 0 ? "positive" : "negative"
        };
      });

      if (articleWordCount) {
        articleData["words"] = articleWordCount.words?.toString() || "";
      }

      if (articleWordCount) {
        articleData["sentiment"] = articleWordCount.sentiment || "";
      }

      const dataDivs = secondChild.childNodes;

      const infoDiv = dataDivs[0];

      const date = infoDiv.firstChild?.textContent;
      const genre = infoDiv.lastChild?.textContent;

      if (date) {
        articleData["date"] = date;
      }

      if (genre) {
        articleData["genre"] = genre;
      }

      const titleSubDiv = dataDivs[1];

      const title = titleSubDiv.firstChild?.textContent;
      const articleDescription = titleSubDiv.lastChild?.textContent;

      if (title) {
        articleData["title"] = title;
      }

      if (articleDescription) {
        articleData["articleDescription"] = articleDescription;
      }

      const authorDiv = dataDivs[2];

      const authorImage = authorDiv.firstChild?.toString();
      const imageSrc = authorImage?.split('src="')[1].split('"')[0];

      if (imageSrc) {
        articleData["authorImage"] = `${url}${imageSrc.replace("/", "")}`;
      }

      const authorInfo = authorDiv.lastChild;

      const authorName = authorInfo?.firstChild?.textContent;

      if (authorName) {
        articleData["authorName"] = authorName;
      }

      const authorDescription = authorInfo?.lastChild?.textContent;

      if (authorDescription) {
        articleData["authorDescription"] = authorDescription;
      }

      articlesData.push(articleData);
    }
  }

  res.send(articlesData);

  await browser.close();
}
