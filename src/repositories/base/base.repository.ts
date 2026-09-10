import { prisma } from "../../lib/prisma";

/**
 * Base repository for all Atlas repositories.
 * Provides access to the shared Prisma client.
 */
export abstract class BaseRepository {
  protected readonly prisma = prisma;
}