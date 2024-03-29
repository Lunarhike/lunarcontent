// import { readdir, readFile } from "fs/promises";
// import matter from "gray-matter";
// import "@/styles/mdx.css";
// import { Mdx } from "@/components/mdx";
// import Image from "next/image";
// import Link from "next/link";
// import { Suspense } from "react";

// async function getAuthorDetails(authorsList) {
//   // If authorsList is empty or not provided, return an empty array
//   if (!authorsList || authorsList.length === 0) {
//     return [];
//   }

//   let authorsDetails = [];

//   for (const authorName of authorsList) {
//     // Construct the path to the author's metadata file
//     const authorFilename = `./content/authors/${authorName.toLowerCase()}.mdx`; // Ensure the path is lowercase

//     try {
//       // Read the author's metadata file
//       const authorFile = await readFile(authorFilename, "utf8");
//       const { data: authorData } = matter(authorFile);

//       // Store the necessary details
//       authorsDetails.push({
//         name: authorName,
//         avatar: authorData.avatar,
//         linkedIn: authorData.linkedIn,
//       });
//     } catch (error) {
//       console.error(`Error reading author file for ${authorName}:`, error);
//     }
//   }

//   return authorsDetails;
// }

// export default async function PostPage({ params }) {
//   const filename = "./content/blog/" + params.slug + ".mdx";
//   const file = await readFile(filename, "utf8");
//   const { content, data } = matter(file);
//   const authorsInfo = await getAuthorDetails(data.authors);

//   return (
//
//   );
// }

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/mdx";
import { getBlogPosts } from "@/server/blog";
import { getPublicData } from "@/server/queries";
import { formatDate } from "@/lib/utils";
import rehypePrettyCode from "rehype-pretty-code";
import { Placeholder } from "@/server/placeholder";

export default async function Blog({ params }) {
  let posts = await getBlogPosts(); // Wait for the getBlogPosts function to resolve
  let post = posts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="container py-6 lg:py-8 max-w-[650px]">
      <div className="max-w-3xl">
        {post.metadata.publishedAt && (
          <time
            dateTime={post.metadata.publishedAt}
            className="block text-sm text-muted-foreground"
          >
            Published on {formatDate(post.metadata.publishedAt)}
          </time>
        )}
        <h1 className="mt-2 font-heading font-bold inline-block text-4xl leading-tight tracking-tight lg:text-5xl ">
          {post.metadata.title}
        </h1>
        <div className="mt-4 flex space-x-4"></div>
        <Suspense fallback={<div>Loading...</div>}>
          <Placeholder />
        </Suspense>
      </div>
      <div className="prose prose-quoteless prose-neutral dark:prose-invert py-8">
        <Mdx
          source={post.content}
          options={{
            mdxOptions: {
              useDynamicImport: true,
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: "github-dark-dimmed",
                  },
                ],
              ],
            },
          }}
        />
        <hr />
      </div>
    </main>
  );
}
