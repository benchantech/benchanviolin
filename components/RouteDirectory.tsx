import { listTechnicalRoutes } from "@/lib/benchanviolin-deterministic-router";
import { getRouteUrl } from "@/lib/technical-route-pages";

export function RouteDirectory() {
  const groups = new Map<string, ReturnType<typeof listTechnicalRoutes>>();

  for (const route of listTechnicalRoutes()) {
    const routes = groups.get(route.domain) ?? [];
    routes.push(route);
    groups.set(route.domain, routes);
  }

  return (
    <div className="tag-directory">
      {Array.from(groups.entries()).map(([domain, routes]) => (
        <section key={domain} aria-labelledby={`route-${domain.replace(/\W+/g, "-").toLowerCase()}`}>
          <h2 id={`route-${domain.replace(/\W+/g, "-").toLowerCase()}`}>{domain}</h2>
          <div className="tag-list">
            {routes
              .sort((a, b) => b.priority - a.priority || a.label.localeCompare(b.label))
              .map((route) => (
                <a key={route.id} href={getRouteUrl(route.id)}>
                  <span>{route.label}</span>
                  <small>{route.hasBranch ? "Choose path" : "Route"}</small>
                </a>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
