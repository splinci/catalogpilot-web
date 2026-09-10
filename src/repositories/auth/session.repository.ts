import { BaseRepository } from "../base/base.repository";
import { CreateSessionDto } from "@/types/auth";

export class SessionRepository extends BaseRepository {
  async create(data: CreateSessionDto) {
    return this.prisma.session.create({
      data,
    });
  }

  async findByTokenHash(tokenHash: string) {
    return this.prisma.session.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });
  }

  async updateLastActivity(sessionId: string) {
    return this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        createdAt: new Date(),
      },
    });
  }

  async deleteById(sessionId: string) {
    return this.prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async deleteAllForUser(userId: string) {
    return this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  async deleteExpired() {
    return this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}