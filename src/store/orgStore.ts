import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortField = 'stars' | 'forks' | 'updated';

interface OrgState {
  orgName: string;
  sortBy: SortField;
  page: number;
  setOrgName: (orgName: string) => void;
  setSortBy: (sortBy: SortField) => void;
  setPage: (page: number) => void;
  resetPagination: () => void;
}

const STORAGE_KEY = 'github-org-dashboard/ui-state';

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      orgName: '',
      sortBy: 'stars',
      page: 1,
      setOrgName: (orgName) =>
        set(() => ({
          orgName,
        })),
      setSortBy: (sortBy) => set(() => ({ sortBy })),
      setPage: (page) => set(() => ({ page })),
      resetPagination: () => set(() => ({ page: 1 })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        orgName: state.orgName,
        sortBy: state.sortBy,
        page: state.page,
      }),
    },
  ),
);
