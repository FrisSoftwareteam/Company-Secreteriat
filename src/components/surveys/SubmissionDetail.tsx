import { SurveyDefinition, SurveyQuestion } from "@/lib/surveys";

type SubmissionData = {
  answers?: Record<string, string | string[] | null>;
};

function toRatingValue(
  question: SurveyQuestion,
  value: string | string[] | null | undefined
) {
  if (Array.isArray(value) || !value) return null;
  const normalized = value.trim();
  const isFivePointScale =
    question.type === "rating_5" ||
    (question.options?.length === 5 && question.options.join(",") === "1,2,3,4,5");

  if (!isFivePointScale) return null;
  if (!/^[1-5]$/.test(normalized)) return null;
  return Number(normalized);
}

export function SubmissionDetail({
  survey,
  data,
}: {
  survey: SurveyDefinition;
  data: SubmissionData;
}) {
  const answers = data.answers ?? {};
  let earnedPoints = 0;
  let maxPoints = 0;

  for (const section of survey.sections) {
    for (const question of section.questions) {
      const score = toRatingValue(question, answers[question.key]);
      if (score !== null) {
        earnedPoints += score;
        maxPoints += 5;
      }
    }
  }

  const overallPercent = maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : null;

  return (
    <div className="form-grid">
      {overallPercent !== null ? (
        <section className="score-summary">
          <div className="score-summary-head">
            <h3>Overall Success Score</h3>
            <strong>{overallPercent.toFixed(1)}%</strong>
          </div>
          <div className="score-progress-track">
            <div
              className="score-progress-fill"
              style={{ width: `${Math.max(0, Math.min(100, overallPercent))}%` }}
            />
          </div>
          <p className="text-secondary text-sm" style={{ margin: 0 }}>
            {earnedPoints} / {maxPoints} points based on all 1-5 rating questions.
          </p>
        </section>
      ) : null}

      {survey.sections.map((section) => (
        <section key={section.title} className="section">
          <h3>{section.title}</h3>
          {section.description ? <p>{section.description}</p> : null}
          <div className="form-grid">
            {section.questions.map((question) => {
              const value = answers[question.key];
              const display = Array.isArray(value) ? value.join(", ") : value ?? "";
              return (
                <div key={question.key} className="form-field">
                  <label>{question.label}</label>
                  <div>{display || <span className="badge">No response</span>}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
