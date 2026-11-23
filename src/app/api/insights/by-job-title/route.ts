import { getApi, respond } from "../../_lib/respond";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country") ?? undefined;
  return respond(getApi().byJobTitle(country));
}
