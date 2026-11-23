import { getApi, readJson, respond } from "../../_lib/respond";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  return respond(getApi().getEmployee((await params).id));
}

export async function PUT(request: Request, { params }: Context) {
  return respond(getApi().updateEmployee((await params).id, await readJson(request)));
}

export async function DELETE(_request: Request, { params }: Context) {
  return respond(getApi().deleteEmployee((await params).id));
}
