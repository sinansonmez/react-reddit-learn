import DataLoader from "dataloader";
import {Updoot} from "../entities/Updoot";

// it's a function that takes object of postId and userId and returns updoot or null
export const createUpdootLoader = () => new DataLoader<{postId: number, userId: number}, Updoot | null>(async (keys) => {
  const updoots = await Updoot.findByIds(keys as any);
  // array of updoot objects [{value: 1, postId: 1, userId: 1}, {value: -1, postId: 2, userId: 2}]
  return updoots.map((updoot) => updoot);
});