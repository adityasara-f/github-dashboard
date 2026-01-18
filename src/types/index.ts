export interface GithubOwner {
  login: string;
  avatar_url: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
  owner: GithubOwner;
}

export class GithubApiError extends Error {
  public readonly status: number;
  public readonly documentation_url?: string;

  constructor(message: string, status: number, documentation_url?: string) {
    super(message);
    this.name = 'GithubApiError';
    this.status = status;
    this.documentation_url = documentation_url;
  }
}
