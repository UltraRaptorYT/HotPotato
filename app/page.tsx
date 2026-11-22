import { readdir } from "node:fs/promises";
import path from "node:path";
import GameClient from "./game-client";

const publicDirectory = path.join(process.cwd(), "public");
const tracks = (await readdir(publicDirectory))
  .filter((file) => file.toLowerCase().endsWith(".mp3"))
  .sort((a, b) => a.localeCompare(b))
  .map((file) => ({
    name: file.replace(/\.mp3$/i, ""),
    src: `/${encodeURIComponent(file)}`,
  }));

export default function Page() {
  return <GameClient libraryTracks={tracks} />;
}
