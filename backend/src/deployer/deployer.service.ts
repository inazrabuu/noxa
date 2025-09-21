import { Injectable, Logger } from "@nestjs/common";

import { exec as execCb } from "child_process";
import { promisify } from "util";
import fs from 'fs';
import path from 'path';
import { PrismaClient } from "@prisma/client";

import { TemplateService } from "src/template.service";

const exec = promisify(execCb);

const DOCKER_USERNAME = process.env.DOCKER_USERNAME,
      DOCKER_TOKEN = process.env.DOCKER_TOKEN,
      DOCKER_REPO = process.env.DOCKER_REPO;

@Injectable()
export class DeployerService {
  private readonly logger = new Logger(DeployerService.name);
  private readonly prisma = new PrismaClient();
  private readonly templateService = new TemplateService();

  async deployGeneratedProject(projectId: number, projectName: string, projectDir: string) {
    try {
      const imageTag = `${DOCKER_REPO}/${projectName}:latest`,
            namespace = 'dev';

      await this.updateProjectStatus(projectId, 'building');
      
      await this.dockerLogin();

      await this.buildImage(projectDir, imageTag);

      await this.pushImage(imageTag);

      await this.updateProjectStatus(projectId, 'deploying');

      const serviceUrl = await this.deployImage(projectDir, projectName, imageTag, namespace);

      await this.updateProject(projectId, serviceUrl, 'deployed');

      return serviceUrl;

    } catch (err) {
      this.logger.error('Deploy failed', err);

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'failed' }
      });

      throw err;
    }
  }

  async updateProjectStatus(projectId: number, status: string) {
    await this.prisma.project.update({
        where: { id: projectId },
        data: { status: status }
      });
  }

  async updateProject(projectId: number, projectUrl: string, status: string) {
    await this.prisma.project.update({
        where: { id: projectId },
        data: { 
          url: projectUrl,
          status: status
        }
      });
  }

  async dockerLogin() {
    this.logger.log('Login into Docker Hub ...');
    await exec(`echo ${DOCKER_TOKEN} | docker login -u ${DOCKER_USERNAME} --password-stdin`)
  }

  async buildImage(projectDir: string, imageTag: string) {
    this.logger.log(`Building Docker image ${imageTag} ...`);

    const dockerFilePath = path.join(projectDir, 'Dockerfile');
      if (!fs.existsSync(dockerFilePath)) {
        const content = `
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
        `.trim();
        fs.writeFileSync(dockerFilePath, content);
      }

      console.log(`docker build -t ${imageTag} ${projectDir}`);

      await exec(`docker build -t ${imageTag} ${projectDir}`);
  }

  async pushImage(imageTag: string) {
    this.logger.log(`Pushing ${imageTag} to Docker Hub ...`);

    await exec(`docker push ${imageTag}`);
  }

  async deployImage(projectDir: string, projectName: string, imageTag: string, namespace: string) {
    this.logger.log(`Deploying to Kubernetes ... `);

    const manifest = await this.templateService.renderTemplate('service-deploy', {
      projectName,
      namespace,
      imageTag
    });

    const manifestFile = path.join(projectDir, 'k8s.yaml');
    fs.writeFileSync(manifestFile, manifest);

    await exec(`kubectl apply -f ${manifestFile}`);

    this.logger.log(`✅ Deployment finished`);

    return `http://localhost/${namespace}/${projectName}`;
  }
}