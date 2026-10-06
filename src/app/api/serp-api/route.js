import { NextResponse } from 'next/server';
import { getWebDataForQuery } from './serpService';

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Query is required for SerpApi search.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const result = await getWebDataForQuery(trimmedQuery);

    return NextResponse.json({
      query: trimmedQuery,
      links: result.links,
      scannedSitesCount: result.scannedSites.length,
      hasWebData: result.hasWebData,
      scannedContext: result.scannedContext,
    });
  } catch (error) {
    console.error('SerpApi Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute SerpApi search.' },
      { status: 500 }
    );
  }
}
