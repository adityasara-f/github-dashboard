import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchOrgDetails, fetchOrgRepos, fetchRepoLanguages } from '../api';
import { useOrgStore } from '../store/orgStore';
import { GithubApiError, GithubOrg, GithubRepo } from '../types';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      window.clearTimeout(handle);
    };
  }, [value, delay]);

  return debounced;
}

interface UseOrgReposResult {
  org: string;
  repos: GithubRepo[];
  isLoading: boolean;
  isError: boolean;
  error: GithubApiError | null;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export function useOrgReposQuery(): UseOrgReposResult {
  const { orgName, setPage } = useOrgStore((state) => ({
    orgName: state.orgName,
    setPage: state.setPage,
  }));

  const trimmedOrg = orgName.trim();

  const query = useInfiniteQuery<GithubRepo[], GithubApiError>({
    queryKey: ['orgRepos', trimmedOrg],
    queryFn: ({ pageParam = 1 }) => fetchOrgRepos({ org: trimmedOrg, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // If the last page returned fewer than the requested items, assume there are no more pages.
      if (lastPage.length < 10) {
        return undefined;
      }
      return (typeof lastPageParam === 'number' ? lastPageParam : allPages.length) + 1;
    },
    enabled: Boolean(trimmedOrg),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.status === 404 || error.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Keep the current page index in the persisted store for refresh behavior.
  useEffect(() => {
    const pageParams = query.data?.pageParams;
    if (pageParams && pageParams.length > 0) {
      const last = pageParams[pageParams.length - 1];
      if (typeof last === 'number') {
        setPage(last);
      }
    }
  }, [query.data?.pageParams, setPage]);

  const pages = query.data?.pages ?? [];
  const repos = pages.flat();

  return {
    org: trimmedOrg,
    repos,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: () => {
      if (query.hasNextPage) {
        void query.fetchNextPage();
      }
    },
  };
}

interface UseOrgDetailsResult {
  org: string;
  data: GithubOrg | undefined;
  isLoading: boolean;
  isError: boolean;
  error: GithubApiError | null;
}

export function useOrgDetailsQuery(): UseOrgDetailsResult {
  const orgName = useOrgStore((state) => state.orgName);
  const trimmedOrg = orgName.trim();

  const query = useQuery<GithubOrg, GithubApiError>({
    queryKey: ['orgDetails', trimmedOrg],
    queryFn: () => fetchOrgDetails(trimmedOrg),
    enabled: Boolean(trimmedOrg),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.status === 404 || error.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    org: trimmedOrg,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  };
}

export function useIntersectionObserver<T extends Element>(
  onIntersect: () => void,
  options?: IntersectionObserverInit,
): React.RefObject<T> {
  const targetRef = useRef<T | null>(null);
  const storedCallback = useRef(onIntersect);

  useEffect(() => {
    storedCallback.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        storedCallback.current();
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return targetRef;
}

export interface LanguageData {
  name: string;
  bytes: number;
  percentage: number;
}

interface UseLanguageDistributionResult {
  languages: LanguageData[];
  isLoading: boolean;
  isError: boolean;
  error: GithubApiError | null;
}

export function useLanguageDistribution(repos: GithubRepo[]): UseLanguageDistributionResult {
  const orgName = useOrgStore((state) => state.orgName);
  const trimmedOrg = orgName.trim();

  const repoIds = repos.map((r) => r.id).join(',');

  const query = useQuery<LanguageData[], GithubApiError>({
    queryKey: ['languageDistribution', trimmedOrg, repoIds],
    queryFn: async () => {
      if (repos.length === 0) {
        return [];
      }

      const languageMap = new Map<string, number>();

      const results = await Promise.allSettled(
        repos.map((repo) => fetchRepoLanguages(repo.owner.login, repo.name)),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const languages = result.value;
          for (const [lang, bytes] of Object.entries(languages)) {
            languageMap.set(lang, (languageMap.get(lang) ?? 0) + bytes);
          }
        }
      }

      const totalBytes = Array.from(languageMap.values()).reduce((sum, bytes) => sum + bytes, 0);

      if (totalBytes === 0) {
        return [];
      }

      const languageData: LanguageData[] = Array.from(languageMap.entries())
        .map(([name, bytes]) => ({
          name,
          bytes,
          percentage: (bytes / totalBytes) * 100,
        }))
        .sort((a, b) => b.bytes - a.bytes);

      return languageData;
    },
    enabled: repos.length > 0 && Boolean(trimmedOrg),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.status === 404 || error.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    languages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  };
}
