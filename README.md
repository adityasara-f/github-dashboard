# GitHub Organization Dashboard

A production-grade React application for exploring GitHub organizations, their repositories, and language distribution. Built with performance, modularity, and user experience as core principles.

## Features

### Core Functionality

- **Organization Search**: Debounced search input (400ms) with validation and state persistence
- **Repository List**: Displays public repositories with star counts, forks, and last update timestamps
- **Client-Side Sorting**: Toggle between sorting by stars, forks, or recently updated
- **Infinite Scroll**: Automatic pagination using native Intersection Observer API
- **State Persistence**: Last searched organization, sorting preference, and pagination state persist across browser refreshes using Zustand + localStorage
- **Smart Caching**: 5-minute cache TTL with automatic cache invalidation and background refetching

### Brownie Points

- **Language Distribution Chart**: Aggregated language statistics visualized as an interactive pie chart using Recharts
- **GitHub Token Support**: Optional Personal Access Token input to increase rate limits from 60 to 5,000 requests/hour (stored securely in memory only)
- **Infinite Scroll Pagination**: Seamless loading of additional pages as the user scrolls

### User Experience

- **Skeleton Loading**: Non-blocking skeleton UI during data fetches to prevent layout shift
- **Comprehensive Error States**: 
  - 404: Organization not found
  - 403: Rate limit exceeded with helpful explanation
  - Network failures with user-friendly messages
  - Empty repository states
- **Organization Avatar**: Efficiently rendered with lazy loading
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Perceived Performance**: Optimistic UI updates and instant feedback

## Tech Stack

- **React 18**: Component library
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety with strict mode enabled
- **TanStack Query**: Server state management, caching, and background synchronization
- **Zustand**: UI state management with localStorage persistence
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Charting library for language distribution
- **GitHub REST API v3**: Data source

## Architecture

### Folder Structure

```
src/
├── api/              # API layer with token management
│   └── index.ts      # GitHub API client functions
├── components/       # UI components organized by feature
│   ├── charts/       # Chart components (language distribution)
│   ├── org/          # Organization overview panel
│   ├── repos/        # Repository list panel
│   └── search/       # Search and token input
├── hooks/            # Custom React hooks
│   └── index.ts      # Debounce, queries, intersection observer
├── layout/           # Layout components
│   └── AppLayout.tsx # Main application layout
├── lib/              # Library configurations
│   └── react-query.ts # TanStack Query client setup
├── store/            # Zustand stores
│   └── orgStore.ts   # UI state with persistence
├── types/            # TypeScript type definitions
│   └── index.ts      # Shared types and error classes
├── App.tsx           # Root component
└── main.tsx          # Application entry point
```

### Key Design Decisions

#### 1. **Separation of Concerns**
- **API Layer**: Pure functions for GitHub API interactions with centralized token management
- **Hooks Layer**: Business logic and data fetching abstracted into reusable hooks
- **Component Layer**: Presentational components focused on UI rendering
- **Store Layer**: UI state management separate from server state

#### 2. **Caching Strategy**
TanStack Query manages all server state with:
- **5-minute staleTime**: Data is considered fresh for 5 minutes
- **10-minute gcTime**: Cached data is garbage collected after 10 minutes of inactivity
- **Smart refetching**: Disabled within TTL to reduce API calls
- **Query key invalidation**: Automatic cache invalidation when organization changes

#### 3. **State Management**
- **Server State**: TanStack Query handles all API data, loading states, and errors
- **UI State**: Zustand manages search input, sorting preference, and pagination
- **Persistence**: Only UI state is persisted to localStorage; server state lives in memory
- **Token Storage**: GitHub token stored in memory only (never localStorage) for security

#### 4. **Performance Optimizations**
- **Memo-ized Components**: Expensive components wrapped in `React.memo`
- **Client-Side Sorting**: Repos sorted in-memory using `useMemo` to avoid API calls
- **Intersection Observer**: Native browser API for efficient infinite scroll
- **Debounced Input**: Prevents unnecessary API calls during typing
- **Lazy Loading**: Images loaded with `loading="lazy"` attribute
- **Skeleton UI**: Non-blocking loading states prevent layout shift

#### 5. **Error Handling**
Custom `GithubApiError` class provides:
- Status code propagation
- Descriptive error messages
- GitHub documentation URLs for troubleshooting
- Conditional retry logic (no retries for 404/403)

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Usage

1. **Search for an Organization**: Type a GitHub organization handle (e.g., `vercel`, `facebook`, `microsoft`) in the search field
2. **View Repositories**: Browse the organization's public repositories with infinite scroll
3. **Sort Results**: Toggle sorting by stars, forks, or recently updated
4. **Explore Language Distribution**: View aggregated language statistics in the pie chart
5. **Optional Token**: Add a GitHub Personal Access Token to increase rate limits (Settings → Developer settings → Personal access tokens → Generate new token)

## API Rate Limits

- **Unauthenticated**: 60 requests per hour per IP
- **Authenticated**: 5,000 requests per hour with a Personal Access Token

The application displays helpful error messages when rate limits are exceeded.

## Tradeoffs & Considerations

### What Went Well

- **Modular Architecture**: Clean separation between API, hooks, components, and state makes the codebase easy to navigate and extend
- **Caching Performance**: 5-minute cache significantly reduces API calls and improves perceived performance
- **Type Safety**: Strict TypeScript mode catches errors at compile-time
- **User Experience**: Skeleton loaders, error states, and infinite scroll create a polished experience
- **Token Security**: Storing tokens in memory (not localStorage) prevents XSS vulnerabilities

### Known Limitations

1. **Client-Side Sorting Limitation**: Sorting is client-side only and limited to fetched repositories. If an org has 1,000 repos but only 50 are fetched, sorting only applies to those 50. Alternative: Implement server-side sorting via GitHub's `sort` and `direction` query parameters, but this would require disabling the 5-minute cache or implementing more complex cache invalidation.

2. **Language Data Granularity**: Language distribution is calculated from all fetched repositories. As more pages are loaded via infinite scroll, the chart updates dynamically. This means the chart may not represent the entire organization until all repositories are loaded.

3. **No Search Within Repositories**: The application searches for organizations only, not for specific repositories within an organization.

4. **Rate Limiting Without Token**: Without a Personal Access Token, users are limited to 60 requests/hour. For large organizations with many repositories, this can be exhausted quickly.

5. **No Filtering**: No ability to filter repositories by language, topics, or other criteria beyond sorting.

### Future Enhancements

- **Organization Comparison**: Side-by-side comparison of multiple organizations
- **Repository Filtering**: Filter by language, topics, stars threshold, or date range
- **Server-Side Sorting**: Implement via GitHub API for accurate global sorting
- **Bookmarks**: Save favorite organizations for quick access
- **Dark/Light Mode Toggle**: Currently dark mode only
- **Export Functionality**: Export data to CSV or JSON
- **Advanced Language Analytics**: Trends over time, most used languages per year
- **Search History**: Recently searched organizations

## Browser Support

- Modern browsers with ES2020+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

This is a technical assessment project and not open for contributions.

---

Built with attention to detail, performance, and clean architecture principles.
