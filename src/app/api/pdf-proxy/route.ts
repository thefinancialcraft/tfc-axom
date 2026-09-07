import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    let arrayBuffer: ArrayBuffer | null = null;
    let contentType = 'application/pdf';

    const cleanFileName = pdfUrl.includes('/resumes/') 
      ? pdfUrl.split('/resumes/').pop()?.split('?')[0]
      : pdfUrl;

    if (cleanFileName && !cleanFileName.startsWith('http://') && !cleanFileName.startsWith('https://')) {
      try {
        const { data: blobData, error } = await supabase.storage
          .from('resumes')
          .download(cleanFileName);

        if (!error && blobData) {
          arrayBuffer = await blobData.arrayBuffer();
          if (blobData.type) contentType = blobData.type;
        }
      } catch (e) {
        console.warn('Proxy Supabase download failed, fallback to fetch:', e);
      }
    }

    if (!arrayBuffer) {
      const res = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (res.ok) {
        arrayBuffer = await res.arrayBuffer();
        const headerType = res.headers.get('content-type');
        if (headerType) contentType = headerType;
      }
    }

    if (!arrayBuffer) {
      return new NextResponse('Could not fetch PDF binary', { status: 404 });
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err: any) {
    console.error('API pdf-proxy error:', err);
    return new NextResponse('Server error fetching PDF', { status: 500 });
  }
}
