import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') ?? 'en-US';

  const draft = await draftMode();
  draft.disable();
  redirect(`/${locale}`);
}
