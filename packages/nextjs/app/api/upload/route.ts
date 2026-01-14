import { NextRequest, NextResponse } from "next/server";
import { pinata } from "~~/utils/pinata";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload using Pinata SDK
    const { cid } = await pinata.upload.public.file(file);

    // Get the gateway URL for the uploaded file
    const url = GATEWAY_URL ? `https://${GATEWAY_URL}/ipfs/${cid}` : await pinata.gateways.public.convert(cid);

    return NextResponse.json({
      cid,
      url,
      size: file.size,
      name: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
