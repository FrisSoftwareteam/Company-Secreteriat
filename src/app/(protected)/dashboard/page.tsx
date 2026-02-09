import Link from "next/link";
import { requireStandardUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { surveys } from "@/lib/surveys";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireStandardUser();
  const { q = "" } = await searchParams;
  const term = q.trim().toLowerCase();

  const submissions = await db.submission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const filteredSurveys = term
    ? surveys.filter(
        (survey) =>
          survey.title.toLowerCase().includes(term) ||
          survey.description.toLowerCase().includes(term)
      )
    : surveys;

  const filteredSubmissions = term
    ? submissions.filter((submission) => submission.surveySlug.toLowerCase().includes(term))
    : submissions;

  return (
    <div className="dashboard-grid">
      <div className="section" style={{ marginTop: 0, border: "none" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Welcome back</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>{user.email}</p>
      </div>

      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Available Surveys</h2>
        {term && filteredSurveys.length === 0 ? (
          <p className="text-secondary">No surveys match "{q}".</p>
        ) : (
          <div className="survey-grid">
            {filteredSurveys.map((survey) => (
              <div key={survey.slug} className="survey-card">
                <h3>{survey.title}</h3>
                <p>{survey.description}</p>
                <Link className="button primary" href={`/surveys/${survey.slug}`}>
                  Start Assessment
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" id="recent-activity">
        <h2 style={{ fontSize: "1.5rem" }}>Recent Activity</h2>
        {filteredSubmissions.length === 0 ? (
          <p className="notice" style={{ marginTop: "1rem" }}>
            {term ? `No activity matches "${q}".` : "You haven't submitted any assessments yet."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Assessment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                    <td>{submission.surveySlug}</td>
                    <td>
                      <span className="badge" style={{ background: "rgba(180, 149, 47, 0.2)", color: "#7c6111" }}>
                        Completed
                      </span>
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
