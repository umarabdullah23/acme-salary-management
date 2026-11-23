import { getApi, respond } from "../../_lib/respond";

export const dynamic = "force-dynamic";

export const GET = () => respond(getApi().distribution());
