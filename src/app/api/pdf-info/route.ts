import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import zlib from 'zlib';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return NextResponse.json({ pageCount: 1 }, { status: 400 });
  }

  try {
    let arrayBuffer: ArrayBuffer | null = null;

    // 1. Try downloading directly via Supabase SDK if it's a storage path or Supabase URL
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
        }
      } catch (e) {
        console.warn('Supabase storage download attempt failed, falling back to fetch:', e);
      }
    }

    // 2. Fallback: Fetch directly from HTTP URL
    if (!arrayBuffer) {
      const res = await fetch(pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (res.ok) {
        arrayBuffer = await res.arrayBuffer();
      }
    }

    if (!arrayBuffer) {
      console.warn(`Could not retrieve PDF binary for: ${pdfUrl}`);
      return NextResponse.json({ pageCount: 1 });
    }

    const buffer = Buffer.from(arrayBuffer);
    const rawText = buffer.toString('latin1');

    let fullText = rawText;

    // Extract and decompress FlateDecode streams to reveal objects in PDF 1.5+ compressed streams
    const streamRegex = /stream[\r\n]+([\s\S]*?)endstream/gi;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(rawText)) !== null) {
      try {
        const streamData = Buffer.from(match[1], 'latin1');
        let decompressed: Buffer | null = null;
        try {
          decompressed = zlib.unzipSync(streamData);
        } catch {
          try {
            decompressed = zlib.inflateRawSync(streamData);
          } catch {
            // non-flate or encrypted stream
          }
        }
        if (decompressed) {
          fullText += '\n' + decompressed.toString('latin1');
        }
      } catch {
        // ignore
      }
    }

    let maxPages = 1;

    // Method 1: Check /Type /Pages root object /Count N
    const pagesCountMatches = fullText.match(/\/Type\s*\/Pages\b[\s\S]{1,300}?\/Count\s+(\d+)/i) || fullText.match(/\/Count\s+(\d+)[\s\S]{1,300}?\/Type\s*\/Pages\b/i);
    if (pagesCountMatches && pagesCountMatches[1]) {
      const parsed = parseInt(pagesCountMatches[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed < 500) {
        maxPages = parsed;
      }
    }

    // Method 2: Fallback /Count N matches
    if (maxPages === 1) {
      const countMatches = fullText.match(/\/Count\s+(\d+)/gi);
      if (countMatches) {
        for (const m of countMatches) {
          const numMatch = m.match(/\d+/);
          if (numMatch) {
            const val = parseInt(numMatch[0], 10);
            if (!isNaN(val) && val > maxPages && val < 500) {
              maxPages = val;
            }
          }
        }
      }
    }

    // Method 3: Check exact /Type /Page declarations
    const pageMatches = fullText.match(/\/Type\s*\/Page\b/gi) || fullText.match(/\/Type\/Page\b/gi);
    if (pageMatches && pageMatches.length > 0) {
      // /Type /Page declarations match exact page objects
      if (maxPages === 1 || pageMatches.length < maxPages) {
        maxPages = pageMatches.length;
      }
    }

    return NextResponse.json({ pageCount: maxPages });
  } catch (err: any) {
    console.error('API pdf-info error:', err?.message || err);
    return NextResponse.json({ pageCount: 1 });
  }
}

