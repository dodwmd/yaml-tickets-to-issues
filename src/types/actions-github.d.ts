import { Octokit } from "@octokit/rest";

declare module "@actions/github" {
  export const context: Context;

  export interface Context {
    payload: WebhookPayload;
    eventName: string;
    sha: string;
    ref: string;
    workflow: string;
    action: string;
    actor: string;
    job: string;
    runNumber: number;
    runId: number;
    apiUrl: string;
    serverUrl: string;
    graphqlUrl: string;
    issue: { owner: string; repo: string; number: number };
    repo: { owner: string; repo: string };
  }

  export interface WebhookPayload {
    [key: string]: unknown;
    issue?: any;
    pull_request?: any;
    repository?: any;
    sender?: any;
    action?: string;
  }

  export class GitHub {
    constructor(token: string, options?: any);
    issues: Octokit["issues"];
    pulls: Octokit["pulls"];
    repos: Octokit["repos"];
    actions: Octokit["actions"];
    checks: Octokit["checks"];
    git: Octokit["git"];
    rest: Octokit;
  }
}
