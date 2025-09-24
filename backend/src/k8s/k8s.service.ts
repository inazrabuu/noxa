import { Injectable } from "@nestjs/common";
import * as k8s from '@kubernetes/client-node';
import { Writable } from "node:stream";

@Injectable()
export class K8sService {
  private kc: k8s.KubeConfig;
  private core: k8s.CoreV1Api;
  private log: k8s.Log;

  constructor() {
    this.kc = new k8s.KubeConfig();
    
    // TO DO: separate env with env file, differentiate call between local & cloud
    
    // in local
    this.kc.loadFromDefault();

    // in cloud
    // this.kc.loadFromCluster();

    this.core = this.kc.makeApiClient(k8s.CoreV1Api);
    this.log = new k8s.Log(this.kc);
  }

  async getPodLogs(namespace: string, podName: string, containerName: string, tailLines = 500): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let logs = '';

      const writable = new Writable({
        write: (chunk, _enc, next) => {
          logs += chunk.toString();
          next()
        }
      });

      writable.on('finish', () => {
        console.log(`LOGS FINISH: ${logs}`);
        resolve(logs.split('\n').filter(Boolean));
      })

      this.log.log(namespace, podName, containerName, writable, {
        follow: false,
        tailLines
      }).catch(reject);
    });
  }

  async listPods(namespace: string, labelSelector: string) {
    const res = await this.core.listNamespacedPod({namespace, labelSelector});

    return res.items.map(p => ({
      name: p.metadata?.name ?? '',
      status: p.status?.phase ?? 'Unknown',
      containers: p.spec?.containers?.map(c => c.name) ?? []
    }))
  }
}