import React, { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../hooks';
import { useOrgStore } from '../../store/orgStore';

const DEBOUNCE_MS = 400;

export const SearchPanel: React.FC = () => {
  const { orgName, setOrgName, resetPagination } = useOrgStore((state) => ({
    orgName: state.orgName,
    setOrgName: state.setOrgName,
    resetPagination: state.resetPagination,
  }));

  const [inputValue, setInputValue] = useState<string>(orgName);
  const debouncedValue = useDebouncedValue(inputValue, DEBOUNCE_MS);

  useEffect(() => {
    // Sync initial persisted org name into local input when the component mounts.
    setInputValue(orgName);
  }, [orgName]);

  useEffect(() => {
    const trimmed = debouncedValue.trim();

    if (!trimmed) {
      setOrgName('');
      resetPagination();
      return;
    }

    setOrgName(trimmed);
    resetPagination();
  }, [debouncedValue, resetPagination, setOrgName]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-slate-300">Search organization</h2>
          <p className="text-xs text-slate-500">
            Type a GitHub organization handle. Results are debounced to avoid unnecessary API calls.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-slate-400" htmlFor="org-input">
          Organization handle
        </label>
        <input
          id="org-input"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={inputValue}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder="e.g. vercel, facebook, microsoft"
        />
      </div>
    </div>
  );
};
