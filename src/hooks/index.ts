import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrgDetails, fetchOrgRepos } from '../api';
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
  page: number;
  data: GithubRepo[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: GithubApiError | null;
  isFetching: boolean;
  refetch: () => void;
}

export function useOrgReposQuery(): UseOrgReposResult {
  const { orgName, page } = useOrgStore((state) => ({
    orgName: state.orgName,
    page: state.page,
  }));

  const trimmedOrg = orgName.trim();

  const query = useQuery<GithubRepo[], GithubApiError>({
    queryKey: ['orgRepos', trimmedOrg, page],
    queryFn: () => fetchOrgRepos({ org: trimmedOrg, page }),
    enabled: Boolean(trimmedOrg),
    // 5-minute cache TTL is configured at the QueryClient level.
    // Keep previous data for smoother pagination in later phases.
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Do not aggressively retry on 404/403 – these are usually logical errors, not transient.
      if (error.status === 404 || error.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    org: trimmedOrg,
    page,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    isFetching: query.isFetching,
    refetch: () => {
      // Manual refetch is available, but with staleTime set to 5 minutes the library
      // will not refetch automatically within that TTL.
      void query.refetch();
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
