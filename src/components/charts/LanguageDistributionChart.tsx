import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLanguageDistribution, useOrgReposQuery } from '../../hooks';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
];

export const LanguageDistributionChart: React.FC = memo(() => {
  const { repos, isLoading: isReposLoading, isError: isReposError } = useOrgReposQuery();
  const { languages, isLoading: isLanguagesLoading, isError: isLanguagesError } = useLanguageDistribution(repos);

  const hasRepos = repos.length > 0;
  const isLoading = isReposLoading || isLanguagesLoading;
  const isError = isReposError || isLanguagesError;

  let body: React.ReactNode = null;

  if (!hasRepos) {
    body = (
      <p className="text-xs text-slate-500">
        Language distribution will appear here once repositories are loaded.
      </p>
    );
  } else if (isLoading && languages.length === 0) {
    body = (
      <div className="flex items-center justify-center py-8">
        <div className="h-32 w-32 animate-pulse rounded-full bg-slate-800/80" />
      </div>
    );
  } else if (isError) {
    body = (
      <p className="text-xs text-rose-400">
        Failed to fetch language data. This may be due to rate limiting.
      </p>
    );
  } else if (languages.length === 0) {
    body = (
      <p className="text-xs text-slate-500">
        No language data available for these repositories.
      </p>
    );
  } else {
    const displayLanguages = languages.slice(0, 10);
    const chartData = displayLanguages.map((lang) => ({
      name: lang.name,
      value: lang.bytes,
      percentage: lang.percentage,
    }));

    body = (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${props.payload.percentage.toFixed(2)}%`,
                name,
              ]}
              contentStyle={{
                backgroundColor: 'rgb(15 23 42)',
                border: '1px solid rgb(51 65 85)',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-1">
          {displayLanguages.map((lang, index) => (
            <div key={lang.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-300">{lang.name}</span>
              </div>
              <span className="tabular-nums text-slate-400">{lang.percentage.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-medium text-slate-300">Language Distribution</h2>
      <div className="mt-3">{body}</div>
    </div>
  );
});

LanguageDistributionChart.displayName = 'LanguageDistributionChart';
