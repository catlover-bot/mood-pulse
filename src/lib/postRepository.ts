import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { moodById } from "../data/moods";
import { regionById } from "../data/regions";
import { getFirebaseDb } from "./firebase";
import { filterRecentPosts, ONE_DAY_MS } from "./moodStats";
import type { MoodId, MoodPost, Region } from "../types/mood";

const LOCAL_POSTS_KEY = "mood-pulse-posts-v1";
const COLLECTION_NAME = "moodPosts";

type CreatePostInput = {
  mood: MoodId;
  region: Region;
  clientId: string;
};

export type MoodPostRepository = {
  listRecentPosts(): Promise<MoodPost[]>;
  createPost(input: CreatePostInput): Promise<MoodPost>;
  mode: "firestore" | "local";
};

function createPostPayload(input: CreatePostInput): Omit<MoodPost, "id"> {
  return {
    mood: input.mood,
    regionId: input.region.id,
    regionName: input.region.name,
    createdAt: Date.now(),
    clientId: input.clientId,
  };
}

function isMoodPost(value: unknown): value is MoodPost {
  if (!value || typeof value !== "object") {
    return false;
  }

  const post = value as MoodPost;

  return (
    typeof post.id === "string" &&
    post.mood in moodById &&
    post.regionId in regionById &&
    typeof post.regionName === "string" &&
    typeof post.createdAt === "number" &&
    typeof post.clientId === "string"
  );
}

class LocalMoodPostRepository implements MoodPostRepository {
  mode = "local" as const;

  async listRecentPosts(): Promise<MoodPost[]> {
    return this.readPosts();
  }

  async createPost(input: CreatePostInput): Promise<MoodPost> {
    const post: MoodPost = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        `post_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...createPostPayload(input),
    };
    const recentPosts = filterRecentPosts([...this.readPosts(), post]);

    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(recentPosts));

    return post;
  }

  private readPosts(): MoodPost[] {
    const rawPosts = localStorage.getItem(LOCAL_POSTS_KEY);

    if (!rawPosts) {
      return [];
    }

    try {
      const parsedPosts = JSON.parse(rawPosts);

      if (!Array.isArray(parsedPosts)) {
        return [];
      }

      const recentPosts = filterRecentPosts(parsedPosts.filter(isMoodPost));

      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(recentPosts));

      return recentPosts;
    } catch {
      return [];
    }
  }
}

class FirestoreMoodPostRepository implements MoodPostRepository {
  mode = "firestore" as const;

  constructor(private readonly db: Firestore) {}

  async listRecentPosts(): Promise<MoodPost[]> {
    const postsQuery = query(
      collection(this.db, COLLECTION_NAME),
      where("createdAt", ">=", Date.now() - ONE_DAY_MS),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(postsQuery);

    return snapshot.docs
      .map((document) => ({ id: document.id, ...document.data() }))
      .filter(isMoodPost);
  }

  async createPost(input: CreatePostInput): Promise<MoodPost> {
    const payload = createPostPayload(input);
    const document = await addDoc(collection(this.db, COLLECTION_NAME), payload);

    return {
      id: document.id,
      ...payload,
    };
  }
}

export function createMoodPostRepository(): MoodPostRepository {
  const db = getFirebaseDb();

  if (db) {
    return new FirestoreMoodPostRepository(db);
  }

  return new LocalMoodPostRepository();
}
