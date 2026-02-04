import { NextResponse } from 'next/server';
import { generateOpenApiDocument } from '@/lib/openapi/generator';

export async function GET() {
  const doc = generateOpenApiDocument();
  return NextResponse.json(doc);
}
