import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSurveyBySlug } from "@/lib/surveys";
import { SubmissionDetail } from "@/components/surveys/SubmissionDetail";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const submission = await db.submission.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!submission) {
    return (
      <div className="card">
        <h1>Submission not found</h1>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    );
  }

  const survey = getSurveyBySlug(submission.surveySlug);

  if (!survey) {
    return (
      <div className="card">
        <h1>Survey definition missing</h1>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="form-grid">
      <div className="card">
        <h1>{survey.title}</h1>
        <p>Submitted by: {submission.user?.email ?? "Unknown"}</p>
        <p>Submitted at: {submission.createdAt.toLocaleString()}</p>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
      <div className="card">
        <SubmissionDetail survey={survey} data={submission.data as any} />
      </div>
    </div>
  );
}
