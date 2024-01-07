"use server";

import { unstable_noStore as noStore } from "next/cache";

export async function getPublicData() {
  noStore();
  let response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  let data = await response.json();
  return data;
}
