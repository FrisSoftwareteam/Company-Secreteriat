import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { surveys } from "@/lib/surveys";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const term = q.trim().toLowerCase();

  const submissions = await db.submission.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const filteredSubmissions = term
    ? submissions.filter(
        (submission) =>
          submission.surveySlug.toLowerCase().includes(term) ||
          (submission.user?.email ?? "").toLowerCase().includes(term)
      )
    : submissions;

  const filteredSurveys = term
    ? surveys.filter(
        (survey) =>
          survey.slug.toLowerCase().includes(term) ||
          survey.title.toLowerCase().includes(term) ||
          survey.description.toLowerCase().includes(term)
      )
    : surveys;

  const countsBySurveySlug = filteredSubmissions.reduce<Record<string, number>>((acc, submission) => {
    acc[submission.surveySlug] = (acc[submission.surveySlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dashboard-grid fade-in">
      <div className="card">
        <div className="flex-between mb-4">
          <h1>Admin Dashboard</h1>
        </div>

        <h3 className="text-secondary text-sm mb-4 font-medium">Export Data</h3>
        <div className="flex gap-3 flex-wrap">
          {filteredSurveys.map((survey) => (
            <Link key={survey.slug} className="button hover-scale" href={`/admin/export/${survey.slug}`}>
              <span>Download {survey.title} CSV</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4">Survey Results</h2>
        <div className="overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Survey</th>
                <th>Submissions</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.map((survey) => (
                <tr key={survey.slug}>
                  <td>
                    <div className="font-bold">{survey.title}</div>
                    <div className="text-secondary text-xs">{survey.description}</div>
                  </td>
                  <td>{countsBySurveySlug[survey.slug] ?? 0}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex items-center justify-between" style={{ justifyContent: "flex-end", gap: 12 }}>
                      <Link href={`/admin/results/${survey.slug}`} className="text-primary font-bold hover:underline">
                        View Results
                      </Link>
                      <Link href={`/admin/export/${survey.slug}`} className="text-secondary hover:underline">
                        CSV
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4">Recent Submissions</h2>
        {filteredSubmissions.length === 0 ? (
          <p className="p-4 text-secondary text-center">{term ? `No submissions match "${q}".` : "No submissions yet."}</p>
        ) : (
          <div className="overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Assessment</th>
                  <th>User</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td>
                      <div className="font-bold">{new Date(submission.createdAt).toLocaleDateString()}</div>
                      <div className="text-secondary text-xs">
                        {new Date(submission.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary text-white bg-opacity-10 text-primary">{submission.surveySlug}</span>
                    </td>
                    <td>{submission.user?.email ?? "Unknown"}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/submissions/${submission.id}`} className="text-primary font-bold hover:underline">
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
