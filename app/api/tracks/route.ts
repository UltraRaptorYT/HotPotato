import { readdir } from "node:fs/promises";
import path from "node:path";

export async function GET(request: Request) {
  // Read the directory for each request so adding or removing public MP3 files
  // while the dev server is running is reflected in the picker after refresh.
  void new URL(request.url);
  const files = await readdir(path.join(process.cwd(), "public"));
  const tracks = files
    .filter((file) => file.toLowerCase().endsWith(".mp3"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({
      name: file.replace(/\.mp3$/i, ""),
      src: `/${encodeURIComponent(file)}`,
    }));

  return Response.json(
    { tracks },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
