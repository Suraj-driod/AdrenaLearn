import { NextResponse } from 'next/server';
import { getWebDataForQuery, fetchGoogleImages } from './serpService';

export async function POST(req) {
  try {
    const { query, type } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Query is required for SerpApi search.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();

    if (type === 'images') {
      const images = await fetchGoogleImages(trimmedQuery, 2);
      return NextResponse.json({
        query: trimmedQuery,
        images,
      });
    }

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
