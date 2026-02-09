import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSurveyBySlug } from "@/lib/surveys";
import { getSessionUser } from "@/lib/auth";

function csvEscape(value: string) {
  const needsQuote = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const survey = getSurveyBySlug(slug);

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const submissions = await db.submission.findMany({
    where: { surveySlug: survey.slug },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const questionKeys = survey.sections.flatMap((section) =>
    section.questions.map((q) => q.key)
  );

  const header = [
    "id",
    "createdAt",
    "userEmail",
    ...questionKeys,
  ];

  const rows = submissions.map((submission) => {
    const answers = (submission.data as { answers?: Record<string, string | string[] | null> })
      .answers ?? {};
    const row = [
      submission.id,
      submission.createdAt.toISOString(),
      submission.user?.email ?? "",
      ...questionKeys.map((key) => {
        const value = answers[key];
        if (Array.isArray(value)) {
          return value.join("; ");
        }
        return value ?? "";
      }),
    ];
    return row.map((cell) => csvEscape(String(cell))).join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${survey.slug}-submissions.csv`,
    },
  });
}
