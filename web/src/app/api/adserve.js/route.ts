import { NextRequest, NextResponse } from "next/server";

// Minimal ad-serving JS that injects an image with click-through
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slotId = searchParams.get("slotId");
  const campaignCreative = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/placeholder.png`;
  const campaignClick = "https://metashift.example/click";

  const js = `(()=>{try{const c=document.currentScript;const a=document.createElement('a');a.href='${campaignClick}';a.target='_blank';const img=document.createElement('img');img.src='${campaignCreative}';img.style.maxWidth='100%';a.appendChild(img);c.parentNode.insertBefore(a,c); }catch(e){}})();`;
  return new NextResponse(js, {
    headers: { "content-type": "application/javascript" },
  });
}



