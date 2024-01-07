// import { readdir, readFile } from "fs/promises";
// import matter from "gray-matter";
// import rehypePrettyCode from "rehype-pretty-code";
// import "@/styles/mdx.css";
// import { Mdx } from "@/components/mdx";
// import Image from "next/image";
// import Link from "next/link";
// import { formatDate } from "@/lib/utils";
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
//     <main className="container py-6 lg:py-8 max-w-[650px]">
//       <div className="max-w-3xl">
//         {data.publishedAt && (
//           <time
//             dateTime={data.publishedAt}
//             className="block text-sm text-muted-foreground"
//           >
//             Published on {formatDate(data.publishedAt)}
//           </time>
//         )}
//         <h1 className="mt-2 font-heading font-bold inline-block text-4xl leading-tight tracking-tight lg:text-5xl ">
//           {data.title}
//         </h1>
//         <div className="mt-4 flex space-x-4">
//           {authorsInfo.map((author) => (
//             <Link
//               key={author.name}
//               href={`https://www.linkedin.com/in/${author.linkedIn}`}
//               className="flex items-center space-x-2 text-sm"
//             >
//               <Image
//                 loading="lazy"
//                 src={author.avatar}
//                 alt={author.name}
//                 width={42}
//                 height={42}
//                 className="rounded-full"
//               />
//               <div className="flex-1 text-left leading-tight">
//                 <p className="font-medium">{author.name}</p>
//                 <p className="text-[12px] text-muted-foreground">@LinkedIn</p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//       {data.image && (
//         <Image
//           src={data.image}
//           alt={data.title}
//           width={650}
//           height={650}
//           className="my-8 rounded-md border bg-zinc-500 transition-colors"
//           priority
//           loading="lazy"
//         />
//       )}
//       <div className="prose prose-quoteless prose-neutral dark:prose-invert py-8">
//         <Mdx
//           source={content}
//           options={{
//             mdxOptions: {
//               useDynamicImport: true,
//               rehypePlugins: [
//                 [
//                   rehypePrettyCode,
//                   {
//                     theme: "github-dark-dimmed",
//                   },
//                 ],
//               ],
//             },
//           }}
//         />
//         <hr />
//       </div>
//     </main>
//   );
// }

import type { Metadata } from "next";
import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/mdx";
import { getBlogPosts } from "@/server/blog";
import { getPublicData } from "@/server/queries";
import ViewCounter from "@/components/view-counter";

export async function generateMetadata({
  params,
}): Promise<Metadata | undefined> {
  let posts = await getBlogPosts(); // Wait for the getBlogPosts function to resolve
  let post = posts.find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? `https://leerob.io${image}`
    : `https://leerob.io/og?title=${title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `https://leerob.io/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatDate(date: string) {
  let currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  let fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `${fullDate} (${formattedDate})`;
}

export default async function Blog({ params }) {
  let posts = await getBlogPosts(); // Wait for the getBlogPosts function to resolve
  let post = posts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `https://leerob.io${post.metadata.image}`
              : `https://leerob.io/og?title=${post.metadata.title}`,
            url: `https://leerob.io/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Lee Robinson",
            },
          }),
        }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
        <Suspense fallback={<p className="h-5">LADUJE SIE MALY KURWIUUUU</p>}>
          <Views />
        </Suspense>
      </div>
      <article className="prose prose-quoteless prose-neutral dark:prose-invert">
        <Mdx source={post.content} />
      </article>
    </section>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function Views() {
  await sleep(2000);
  let views = await getPublicData();
  return <div>{views.title}</div>;
}
