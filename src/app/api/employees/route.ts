import { queryToObject } from "@/server/api/api";
import { getApi, readJson, respond } from "../_lib/respond";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const query = queryToObject(new URL(request.url).searchParams);
  return respond(getApi().listEmployees(query));
}

export async function POST(request: Request) {
  return respond(getApi().createEmployee(await readJson(request)));
}
