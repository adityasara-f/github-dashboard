import React, { useMemo } from 'react';
import { useIntersectionObserver, useOrgReposQuery } from '../../hooks';
import { useOrgStore } from '../../store/orgStore';

const SKELETON_ITEMS = 5;

export const RepoListPanel: React.FC = () => {
  const { org, repos, isLoading, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useOrgReposQuery();
  const { sortBy, setSortBy } = useOrgStore((state) => ({
    sortBy: state.sortBy,
    setSortBy: state.setSortBy,
  }));

  const hasOrg = Boolean(org);

  const sortedRepos = useMemo(() => {
    if (!repos.length) {
      return [];
    }

    const cloned = [...repos];

    switch (sortBy) {
      case 'forks':
        cloned.sort((a, b) => b.forks_count - a.forks_count);
        break;
      case 'updated':
        cloned.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'stars':
      default:
        cloned.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
    }

    return cloned;
  }, [repos, sortBy]);

  const renderSkeletonList = () => (
    <ul className="divide-y divide-slate-800">
      {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
        <li key={index} className="py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-slate-800/80" />
              <div className="h-3 w-full max-w-xs rounded bg-slate-800/60" />
              <div className="h-2 w-28 rounded bg-slate-900/80" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-3 w-10 rounded bg-slate-800/80" />
              <div className="h-3 w-10 rounded bg-slate-800/80" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  const sentinelRef = useIntersectionObserver<HTMLDivElement>(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    fetchNextPage();
  });

  let body: React.ReactNode = null;

  if (!hasOrg) {
    body = (
      <p className="text-xs text-slate-500">
        Enter a GitHub organization handle above to see its public repositories.
      </p>
    );
  } else if (isLoading && sortedRepos.length === 0) {
    body = renderSkeletonList();
  } else if (isError) {
    if (error?.status === 404) {
      body = <p className="text-xs text-rose-400">Organization not found.</p>;
    } else if (error?.status === 403) {
      body = (
        <p className="text-xs text-amber-300">
          GitHub API rate limit exceeded or access forbidden. Please wait a bit and try again.
        </p>
      );
    } else {
      body = (
        <p className="text-xs text-rose-400">
          Something went wrong while fetching repositories. Please try again.
        </p>
      );
    }
  } else if (sortedRepos.length === 0) {
    body = (
      <p className="text-xs text-slate-500">
        This organization does not have any public repositories, or none are visible with the current criteria.
      </p>
    );
  } else if (sortedRepos.length > 0) {
    body = (
      <ul className="divide-y divide-slate-800">
        {sortedRepos.map((repo) => (
          <li key={repo.id} className="py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-sky-300 hover:text-sky-200 hover:underline"
                >
                  {repo.name}
                </a>
                {repo.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{repo.description}</p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  Updated on {new Date(repo.updated_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 text-[11px] text-slate-400">
                <span>
                  ⭐ <span className="tabular-nums">{repo.stargazers_count}</span>
                </span>
                <span>
                  🍴 <span className="tabular-nums">{repo.forks_count}</span>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-slate-300">Repositories</h2>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span className="mr-1">Sort by:</span>
          <button
            type="button"
            onClick={() => setSortBy('stars')}
            className={`rounded-full px-2 py-1 transition-colors ${
              sortBy === 'stars'
                ? 'bg-sky-600/80 text-slate-50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Stars
          </button>
          <button
            type="button"
            onClick={() => setSortBy('forks')}
            className={`rounded-full px-2 py-1 transition-colors ${
              sortBy === 'forks'
                ? 'bg-sky-600/80 text-slate-50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Forks
          </button>
          <button
            type="button"
            onClick={() => setSortBy('updated')}
            className={`rounded-full px-2 py-1 transition-colors ${
              sortBy === 'updated'
                ? 'bg-sky-600/80 text-slate-50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Recently updated
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-[3rem] text-sm">
        {body}
        {hasNextPage && sortedRepos.length > 0 && (
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
        )}
        {isFetchingNextPage && sortedRepos.length > 0 && (
          <div className="mt-2">{renderSkeletonList()}</div>
        )}
      </div>
    </div>
  );
};
