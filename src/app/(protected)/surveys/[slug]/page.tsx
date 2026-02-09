import { getSurveyBySlug } from "@/lib/surveys";
import { requireStandardUser } from "@/lib/auth";
import { SurveyForm } from "@/components/surveys/SurveyForm";
import Link from "next/link";

export default async function SurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireStandardUser();
  const { slug } = await params;
  const survey = getSurveyBySlug(slug);

  if (!survey) {
    return (
      <div className="card">
        <h1>Survey not found</h1>
        <Link className="button" href="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="survey-template-page">
      <div className="survey-template-header">
        <div>
          <h1 className="survey-template-title">{survey.title}</h1>
          <p className="survey-template-desc">{survey.description}</p>
        </div>
        <Link className="button" href="/dashboard">
          Cancel
        </Link>
      </div>

      <div className="card survey-template-card">
        <div className="survey-template-card-body">
          <SurveyForm survey={survey} />
        </div>
      </div>
    </div>
  );
}
