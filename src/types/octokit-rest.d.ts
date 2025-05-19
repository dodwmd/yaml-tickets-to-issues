declare module "@octokit/rest" {
  export class Octokit {
    constructor(options?: OctokitOptions);
    issues: Issues;
    pulls: Pulls;
    repos: Repos;
    actions: Actions;
    checks: Checks;
    git: Git;
    rest: this;
  }

  export interface OctokitOptions {
    auth?: string;
    baseUrl?: string;
    userAgent?: string;
    previews?: string[];
    timeZone?: string;
    request?: {
      timeout?: number;
      agent?: any;
      fetch?: any;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface Issues {
    create: (params: IssuesCreateParams) => Promise<{ data: Issue }>;
    update: (params: IssuesUpdateParams) => Promise<{ data: Issue }>;
    // Add other issue methods as needed
  }

  export interface Pulls {
    // Add pull request methods as needed
  }

  export interface Repos {
    // Add repository methods as needed
  }

  export interface Actions {
    // Add actions methods as needed
  }

  export interface Checks {
    // Add checks methods as needed
  }

  export interface Git {
    // Add git methods as needed
  }

  export interface Issue {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: "open" | "closed";
    created_at: string;
    updated_at: string;
    // Add other issue properties as needed
  }

  export interface IssuesCreateParams {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
    milestone?: number;
    // Add other create params as needed
  }

  export interface IssuesUpdateParams extends IssuesCreateParams {
    issue_number: number;
    state?: "open" | "closed";
    // Add other update params as needed
  }
}
