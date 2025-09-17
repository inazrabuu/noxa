import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class ProjectService {
  async create(project: { 
    name: string; repoUrl: string; status: string; prompt: string;
    files: any; zipPath: string;
   }) {
    return prisma.project.create({ data: project })
  }

  async findById(id: number) {
    return prisma.project.findUnique({ where: { id } })
  }

  async list() {
    return prisma.project.findMany({ orderBy: { createdAt: 'desc' }})
  }
}