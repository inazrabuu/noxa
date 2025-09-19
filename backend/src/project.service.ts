import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Octokit } from "@octokit/rest";
import simpleGit from "simple-git";
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

const prisma = new PrismaClient();

@Injectable()
export class ProjectService {
  private octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  async unzipProject(zipPath: string, outputDir: string) {
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: outputDir }))
      .promise();
  }

  async createAndPushToGit(projectName: string, zipFilePath: string, tempPath: string) {
    fs.mkdirSync(tempPath, { recursive: true });
    await this.unzipProject(zipFilePath, tempPath);

    const { data } = await this.octokit.repos.createForAuthenticatedUser({
      name: projectName,
    });

    const repoUrl = data.clone_url.replace(
      'https://',
      `https://${process.env.GITHUB_TOKEN}@`
    );

    const git = simpleGit(tempPath);
    await git.init();
    await git.add('.');
    await git.commit('Initial commit from Noxa');
    await git.branch(['-M', 'main']);
    await git.addRemote('origin', repoUrl);
    await git.push('origin', 'main');

    return data.html_url;
  }

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