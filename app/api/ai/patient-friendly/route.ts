import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generatePatientFriendlyExplanation } from "@/lib/ai/groq";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const role = cookieStore.get("bh_role")?.value;

  if (role !== "patient") {
    return NextResponse.json({ error: "Only patients can use this feature." }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    content?: string;
    type?: "note" | "treatment-plan";
  };

  if (!body.title || !body.content || !body.type) {
    return NextResponse.json({ error: "Missing AI explanation input." }, { status: 400 });
  }

  const explanation = await generatePatientFriendlyExplanation({
    title: body.title,
    content: body.content,
    type: body.type,
  });

  if (!explanation) {
    return NextResponse.json(
      { error: "AI explanation is unavailable right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ explanation });
}
