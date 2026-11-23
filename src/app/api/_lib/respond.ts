import { createApi, type ApiResult } from "@/server/api/api";
import { getDb } from "@/server/db/connection";

export const getApi = () => createApi(getDb());

export const respond = ({ status, body }: ApiResult): Response => Response.json(body, { status });

/** Invalid or missing JSON becomes `undefined`, which the schema then rejects with a 400. */
export const readJson = (request: Request): Promise<unknown> => request.json().catch(() => undefined);
