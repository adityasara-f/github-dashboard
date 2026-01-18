import React, { memo } from 'react';
import { useOrgDetailsQuery } from '../../hooks';

export const OrgOverviewPanel: React.FC = memo(() => {
  const { org, data, isLoading, isError, error } = useOrgDetailsQuery();

  const hasOrg = Boolean(org);

  let body: React.ReactNode = null;

  if (!hasOrg) {
    body = (
      <p className="text-xs text-slate-500">
        Start by searching for an organization to see its avatar and high-level statistics.
      </p>
    );
  } else if (isLoading && !data) {
    body = (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-slate-800/80" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-slate-800/80" />
          <div className="h-3 w-40 rounded bg-slate-800/60" />
        </div>
      </div>
    );
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
          Something went wrong while fetching organization details. Please try again.
        </p>
      );
    }
  } else if (data) {
    body = (
      <div className="flex items-start gap-3">
        <img
          src={data.avatar_url}
          alt={data.login}
          className="h-12 w-12 flex-shrink-0 rounded-full border border-slate-800 bg-slate-900 object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={data.html_url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm font-semibold text-sky-300 hover:text-sky-200 hover:underline"
            >
              {data.name ?? data.login}
            </a>
            {data.name && (
              <span className="truncate text-[11px] text-slate-500">@{data.login}</span>
            )}
          </div>
          {data.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{data.description}</p>
          )}
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <div>
              <dt className="sr-only">Public repositories</dt>
              <dd>
                <span className="tabular-nums">{data.public_repos}</span> repos
              </dd>
            </div>
            <div>
              <dt className="sr-only">Followers</dt>
              <dd>
                <span className="tabular-nums">{data.followers}</span> followers
              </dd>
            </div>
            <div>
              <dt className="sr-only">Following</dt>
              <dd>
                <span className="tabular-nums">{data.following}</span> following
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-medium text-slate-300">Organization Overview</h2>
      <div className="mt-3 text-sm">{body}</div>
    </div>
  );
});

OrgOverviewPanel.displayName = 'OrgOverviewPanel';
