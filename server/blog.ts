import fs from "fs";
import path from "path";
import { readFile } from "fs/promises";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, "").trim();
  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
    metadata[key.trim() as keyof Metadata] = value;
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

async function readMDXFile(filePath) {
  let rawContent = await readFile(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function extractTweetIds(content) {
  let tweetMatches = content.match(/<StaticTweet\sid="[0-9]+"\s\/>/g);
  return tweetMatches?.map((tweet) => tweet.match(/[0-9]+/g)[0]) || [];
}

async function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir);
  let promises = mdxFiles.map((file) =>
    readFile(path.join(dir, file), "utf-8")
  );

  let fileContents = await Promise.all(promises);
  return fileContents.map((fileContent, index) => {
    let { metadata, content } = parseFrontmatter(fileContent);
    let slug = path.basename(mdxFiles[index], path.extname(mdxFiles[index]));
    let tweetIds = extractTweetIds(content);
    return {
      metadata,
      slug,
      tweetIds,
      content,
    };
  });
}
export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), "content/blog"));
}
