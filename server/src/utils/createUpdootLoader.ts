import DataLoader from "dataloader";
import {Updoot} from "../entities/Updoot";

// it's a function that takes object of postId and userId and returns updoot or null
/*
export const createUpdootLoader = () => new DataLoader<{postId: number, userId: number}, Updoot | null>(async (keys) => {
  const updoots = await Updoot.findByIds(keys as any);
  console.log('updoots', updoots);
  console.log('updoots array', updoots.map((updoot) => updoot))
  // array of updoot objects [{value: 1, postId: 1, userId: 1}, {value: -1, postId: 2, userId: 2}]
  return updoots.map((updoot) => updoot);
});*/

export const createUpdootLoader = () =>
  new DataLoader<{postId: number; userId: number}, Updoot | null>(async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
      });

      return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
    }
  );