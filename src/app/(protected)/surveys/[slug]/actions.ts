"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSurveyBySlug } from "@/lib/surveys";
import { redirect } from "next/navigation";

export async function submitSurveyAction(formData: FormData) {
  const user = await requireUser();
  const surveySlug = String(formData.get("surveySlug") || "");
  const survey = getSurveyBySlug(surveySlug);

  if (!survey) {
    throw new Error("Survey not found");
  }

  if (user.role === "ADMIN") {
    throw new Error("Admins cannot submit assessments.");
  }

  const answers: Record<string, string | string[] | null> = {};

  for (const section of survey.sections) {
    for (const question of section.questions) {
      const key = `q_${question.key}`;
      if (question.type === "multi_select") {
        const values = formData.getAll(key).map((item) => String(item));
        answers[question.key] = values;
      } else {
        const value = formData.get(key);
        answers[question.key] = value ? String(value) : null;
      }
    }
  }

  await db.submission.create({
    data: {
      surveySlug: survey.slug,
      userId: user.id,
      data: {
        answers,
      },
    },
  });

  redirect(`/dashboard?submitted=${survey.slug}`);
}
