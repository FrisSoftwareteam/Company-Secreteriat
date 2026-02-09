import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSurveyBySlug } from "@/lib/surveys";

export default async function AdminSurveyResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const survey = getSurveyBySlug(slug);

  if (!survey) {
    return (
      <div className="card">
        <h1>Survey not found</h1>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    );
  }

  const submissions = await db.submission.findMany({
    where: { surveySlug: survey.slug },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="dashboard-grid">
      <div className="card">
        <div className="flex-between mb-4">
          <div>
            <h1 style={{ marginBottom: 8 }}>{survey.title}</h1>
            <p className="text-secondary" style={{ margin: 0 }}>
              {survey.description}
            </p>
          </div>
          <div className="flex items-center" style={{ gap: 10 }}>
            <Link className="button" href={`/admin/export/${survey.slug}`}>
              Download CSV
            </Link>
            <Link className="button" href="/admin">
              Back to Admin
            </Link>
          </div>
        </div>
        <p className="text-secondary text-sm" style={{ margin: 0 }}>
          Total submissions: {submissions.length}
        </p>
      </div>

      <div className="card">
        {submissions.length === 0 ? (
          <p className="p-4 text-secondary text-center">No submissions yet for this survey.</p>
        ) : (
          <div className="overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <div className="font-bold">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-secondary text-xs">
                        {new Date(submission.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>{submission.user?.email ?? "Unknown"}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/admin/submissions/${submission.id}`}
                        className="text-primary font-bold hover:underline"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
