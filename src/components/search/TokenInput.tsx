import React, { useState } from 'react';
import { setGithubToken } from '../../api';

export const TokenInput: React.FC = () => {
  const [tokenValue, setTokenValue] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);
  const [showToken, setShowToken] = useState<boolean>(false);

  const handleTokenChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setTokenValue(event.target.value);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter' && tokenValue.trim()) {
      handleSetToken();
    }
  };

  const handleSetToken = () => {
    const trimmed = tokenValue.trim();
    if (!trimmed) {
      return;
    }
    setGithubToken(trimmed);
    setIsTokenSet(true);
    setShowToken(false);
  };

  const handleClearToken = () => {
    setGithubToken(null);
    setTokenValue('');
    setIsTokenSet(false);
    setShowToken(false);
  };

  const handleToggleVisibility = () => {
    setShowToken((prev) => !prev);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-xs font-medium text-slate-400" htmlFor="token-input">
          Personal Access Token (optional)
        </label>
        {isTokenSet && (
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
            Active
          </span>
        )}
      </div>

      {!isTokenSet ? (
        <div className="flex gap-2">
          <input
            id="token-input"
            type={showToken ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            value={tokenValue}
            onChange={handleTokenChange}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          />
          <button
            type="button"
            onClick={handleToggleVisibility}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            aria-label={showToken ? 'Hide token' : 'Show token'}
          >
            {showToken ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            onClick={handleSetToken}
            disabled={!tokenValue.trim()}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Set
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5">
          <span className="text-xs text-slate-400">Token is active (stored in memory)</span>
          <button
            type="button"
            onClick={handleClearToken}
            className="text-xs font-medium text-rose-400 hover:text-rose-300 focus:outline-none focus:underline"
          >
            Clear
          </button>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-slate-500">
        Provide a{' '}
        <a
          href="https://github.com/settings/tokens"
          target="_blank"
          rel="noreferrer"
          className="text-sky-400 hover:underline"
        >
          GitHub Personal Access Token
        </a>{' '}
        to increase your rate limit from 60 to 5,000 requests per hour. Token is stored securely in memory only and
        never persisted.
      </p>
    </div>
  );
};
