import type { GithubOrg, GithubRepo } from '../types';
import { GithubApiError } from '../types';

const GITHUB_API_BASE_URL = 'https://api.github.com';

interface FetchOrgReposParams {
  org: string;
  page: number;
  perPage?: number;
}

export async function fetchOrgRepos({ org, page, perPage = 10 }: FetchOrgReposParams): Promise<GithubRepo[]> {
  const trimmedOrg = org.trim();

  if (!trimmedOrg) {
    return [];
  }

  const url = new URL(`${GITHUB_API_BASE_URL}/orgs/${encodeURIComponent(trimmedOrg)}/repos`);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : null;

    const messageFromBody: string | undefined = body?.message;

    if (response.status === 404) {
      throw new GithubApiError(messageFromBody ?? 'Organization not found', 404, body?.documentation_url);
    }

    if (response.status === 403) {
      throw new GithubApiError(
        messageFromBody ?? 'Rate limit exceeded or access forbidden by GitHub API',
        403,
        body?.documentation_url,
      );
    }

    throw new GithubApiError(messageFromBody ?? 'Failed to fetch organization repositories', response.status, body?.documentation_url);
  }

  const data = (await response.json()) as GithubRepo[];
  return data;
}

export async function fetchOrgDetails(org: string): Promise<GithubOrg> {
  const trimmedOrg = org.trim();

  if (!trimmedOrg) {
    throw new GithubApiError('Organization is required', 400);
  }

  const url = `${GITHUB_API_BASE_URL}/orgs/${encodeURIComponent(trimmedOrg)}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : null;

    const messageFromBody: string | undefined = body?.message;

    if (response.status === 404) {
      throw new GithubApiError(messageFromBody ?? 'Organization not found', 404, body?.documentation_url);
    }

    if (response.status === 403) {
      throw new GithubApiError(
        messageFromBody ?? 'Rate limit exceeded or access forbidden by GitHub API',
        403,
        body?.documentation_url,
      );
    }

    throw new GithubApiError(
      messageFromBody ?? 'Failed to fetch organization details',
      response.status,
      body?.documentation_url,
    );
  }

  const data = (await response.json()) as GithubOrg;
  return data;
}
