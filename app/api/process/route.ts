import { NextRequest, NextResponse } from 'next/server';
import { UnifiedProcessor } from '@/lib/processor';
import { ProcessorInput } from '@/lib/types';

// OCR runs a WebAssembly worker, which the edge runtime cannot host.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProcessorInput;
    const result = await UnifiedProcessor.process(body);

    // A handled processing failure is still a well-formed answer, so it returns
    // 200 with success: false. Only an unparseable request is a 4xx/5xx.
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error'
      },
      { status: 500 }
    );
  }
}
