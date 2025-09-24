import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Octokit } from "@octokit/rest";
import simpleGit from "simple-git";
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { K8sService } from "./k8s/k8s.service";

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
    files: any; zipPath: string; env: string
   }) {
    return prisma.project.create({ data: project })
  }

  async findOrCreate(params: { 
    name: string; repoUrl: string; status: string; prompt: string;
    files: any; zipPath: string; env: string
   }) {
    let project = await prisma.project.findFirst({ 
      where: { 
        name: params.name, 
        env: params.env 
      } 
    });

    if (!project) {
      project = await this.create({
        name: params.name, repoUrl: params.repoUrl, status: params.status, 
        prompt: params.prompt, files: params.files, zipPath: params.zipPath, 
        env: params.env
      });
    }

    return project;
  }

  async findById(id: number) {
    return prisma.project.findUnique({ where: { id } })
  }

  async update(id: number, param: any) {
    return prisma.project.update({
      where: { id: id },
      data: param
    })
  }

  async list() {
    return prisma.project.findMany({ orderBy: { createdAt: 'desc' }})
  }

  async getLogs(name: string, namespace: string, limit: number) {
    const k8sService = new K8sService()
    const labelSelector = `app=${name}`;

    const pods = await k8sService.listPods(namespace, labelSelector);
    if (pods.length === 0)
      return []

    // TO DO: refactor this with dynamic name from parameter
    const podName = pods[0].name;
    const containerName = pods[0].containers[0];
    console.log(podName, containerName);

    return k8sService.getPodLogs(namespace, podName, containerName, limit);
  }
}