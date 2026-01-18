import React from 'react';
import { useOrgReposQuery } from '../../hooks';

export const RepoListPanel: React.FC = () => {
  const { org, data, isLoading, isError, error } = useOrgReposQuery();

  const hasOrg = Boolean(org);

  let body: React.ReactNode = null;

  if (!hasOrg) {
    body = (
      <p className="text-xs text-slate-500">
        Enter a GitHub organization handle above to see its public repositories.
      </p>
    );
  } else if (isLoading) {
    body = <p className="text-xs text-slate-500">Loading repositories…</p>;
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
  } else if (data && data.length === 0) {
    body = (
      <p className="text-xs text-slate-500">
        This organization does not have any public repositories, or none are visible with the current criteria.
      </p>
    );
  } else if (data && data.length > 0) {
    body = (
      <ul className="divide-y divide-slate-800">
        {data.map((repo) => (
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
      </div>

      <div className="mt-3 min-h-[3rem] text-sm">{body}</div>
    </div>
  );
};
