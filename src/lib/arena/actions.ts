import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CODE = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);

function mapArenaError(err: unknown): never {
  if (err instanceof Error) {
    // Keep Chinese (or English) messages from store; status is HTTP-only.
    throw new Error(err.message);
  }
  throw new Error("arena failed");
}

async function store() {
  return import("@/lib/arena/store.server");
}

export const arenaCreate = createServerFn({ method: "POST" }).handler(
  async () => {
    try {
      const { createRoom } = await store();
      return await createRoom();
    } catch (err) {
      mapArenaError(err);
    }
  },
);

export const arenaJoin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: CODE,
      nickname: z.string().trim().min(1).max(12),
      avatar: z
        .object({
          species: z.enum(["fox", "cat", "robot", "blob", "star"]),
          color: z.enum([
            "#f05a3a",
            "#f0c43a",
            "#2f9e62",
            "#7ec8e3",
            "#e86a9a",
            "#5b7ae0",
            "#e8893a",
            "#6bb83a",
          ]),
          hat: z.enum(["none", "wizard", "cap", "crown"]),
          accessory: z.enum(["none", "scarf", "glasses", "cape"]),
        })
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { joinRoom } = await store();
      return await joinRoom(data.code, data.nickname, data.avatar);
    } catch (err) {
      mapArenaError(err);
    }
  });

export const arenaFetchState = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: CODE,
      playerId: z.string().min(8).max(128).optional(),
      hostToken: z.string().min(8).max(128).optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { getPublicState } = await store();
      return await getPublicState(data.code, {
        playerId: data.playerId,
        hostToken: data.hostToken,
      });
    } catch (err) {
      mapArenaError(err);
    }
  });

export const arenaStart = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: CODE,
      hostToken: z.string().min(8).max(128),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { startGame } = await store();
      return await startGame(data.code, data.hostToken);
    } catch (err) {
      mapArenaError(err);
    }
  });

export const arenaAnswer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: CODE,
      playerId: z.string().min(8).max(128),
      choiceIndex: z.number().int().min(0).max(15),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { submitAnswer } = await store();
      return await submitAnswer(data.code, data.playerId, data.choiceIndex);
    } catch (err) {
      mapArenaError(err);
    }
  });

export const arenaNext = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: CODE,
      hostToken: z.string().min(8).max(128),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { nextPhase } = await store();
      return await nextPhase(data.code, data.hostToken);
    } catch (err) {
      mapArenaError(err);
    }
  });

export const arenaDemoJoin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: CODE,
      hostToken: z.string().min(8).max(128),
      count: z.number().int().min(1).max(3).optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { addDemoPlayers } = await store();
      return await addDemoPlayers(data.code, data.hostToken, data.count ?? 2);
    } catch (err) {
      mapArenaError(err);
    }
  });
