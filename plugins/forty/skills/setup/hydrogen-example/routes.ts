import type {RouteConfigEntry} from '@react-router/dev/routes';

/** The agentic page's module, relative to `app/`. */
const AGENTIC_PAGE = 'forty/route.tsx';

/**
 * With FORTY_AGENTIC=1 — how AMS builds this app — the store's `/` is the
 * agentic webpage: every index route at the root (`_index`, and
 * `($locale)._index` under an optional segment) renders `forty/route.tsx`.
 * Every other route is untouched, so product links and the cart keep working.
 * Without the flag, `routes` as they are.
 */
export function agenticRoutes(routes: RouteConfigEntry[]): RouteConfigEntry[] {
  return process.env.FORTY_AGENTIC === '1' ? routes.map(atRoot) : routes;
}

function atRoot(route: RouteConfigEntry): RouteConfigEntry {
  if (route.index && route.path === undefined) return {...route, file: AGENTIC_PAGE};
  if (route.path === undefined || /^:\w+\?$/.test(route.path)) return {...route, children: route.children?.map(atRoot)};
  return route;
}
