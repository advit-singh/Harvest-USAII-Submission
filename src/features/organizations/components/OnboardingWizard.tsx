"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserProfileStep } from "@/features/organizations/components/steps/UserProfileStep";
import { OrgInfoStep } from "@/features/organizations/components/steps/OrgInfoStep";
import { LocationStep } from "@/features/organizations/components/steps/LocationStep";
import { OperationalProfileStep } from "@/features/organizations/components/steps/OperationalProfileStep";
import { AiConfigStep } from "@/features/organizations/components/steps/AiConfigStep";
import { InviteTeamStep } from "@/features/organizations/components/steps/InviteTeamStep";
import { InitialUploadStep } from "@/features/organizations/components/steps/InitialUploadStep";
import {
  useCreateOrganization,
  useInviteMember,
} from "@/features/organizations/hooks/useOrganizations";
import {
  onboardingSchema,
  type OnboardingFormValues,
} from "@/features/organizations/schemas/organization.schema";
import { updateOrganizationSettings } from "@/lib/api/organization-settings";
import { markOnboardingComplete } from "@/lib/demo/onboarding";
import { seedGithubPagesDemoData } from "@/lib/demo/bootstrap";
import { setMockUser } from "@/lib/api/users";

const STEPS = [
  { id: "user", title: "Your profile", component: UserProfileStep },
  { id: "org", title: "Organization", component: OrgInfoStep },
  { id: "location", title: "Location", component: LocationStep },
  { id: "profile", title: "Operations", component: OperationalProfileStep },
  { id: "ai", title: "AI Settings", component: AiConfigStep },
  { id: "team", title: "Team", component: InviteTeamStep },
  { id: "upload", title: "Get Started", component: InitialUploadStep },
] as const;

const AGGRESSIVENESS_MAP = {
  conservative: "low",
  balanced: "medium",
  aggressive: "high",
} as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const createOrg = useCreateOrganization();
  const inviteMemberMutation = useInviteMember();

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      name: "",
      type: "school",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      defaultUnitSystem: "imperial",
      country: "US",
      operationalFocus: "school",
      sitesCount: 1,
      confidenceVisibility: true,
      recommendationAggressiveness: "balanced",
      forecastHorizon: "7",
      memoryEnabled: true,
      invites: [{ email: "", roleId: "role_viewer" }],
    },
    mode: "onChange",
  });

  const CurrentStep = STEPS[step].component;
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = async () => {
    setError(null);
    const fieldsByStep: (keyof OnboardingFormValues)[][] = [
      ["firstName", "lastName"],
      ["name", "type"],
      ["city", "state", "country", "timezone"],
      ["operationalFocus", "sitesCount", "defaultUnitSystem"],
      [
        "confidenceVisibility",
        "recommendationAggressiveness",
        "forecastHorizon",
        "memoryEnabled",
      ],
      ["invites"],
      [],
    ];

    const valid = await methods.trigger(fieldsByStep[step]);
    if (!valid) return;

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    const data = methods.getValues();
    try {
      setMockUser({
        id: "user_dev",
        email: "demo@harvest.app",
        fullName: `${data.firstName} ${data.lastName}`.trim(),
      });

      const org = await createOrg.mutateAsync({
        name: data.name,
        type: data.type,
        timezone: data.timezone,
        city: data.city,
        state: data.state,
        country: data.country,
        defaultUnitSystem: data.defaultUnitSystem,
      });

      await updateOrganizationSettings(org.id, {
        ai: {
          confidenceVisibility: data.confidenceVisibility,
          recommendationAggressiveness:
            AGGRESSIVENESS_MAP[data.recommendationAggressiveness],
          memoryEnabled: data.memoryEnabled,
          assistantEnabled: true,
          autoCommitEnabled: false,
          autoCommitConfidenceThreshold: 0.85,
        },
        forecast: {
          externalDataEnabled: true,
          defaultHorizonDays: Number(data.forecastHorizon),
        },
      });

      for (const invite of data.invites) {
        if (invite.email && invite.roleId) {
          await inviteMemberMutation.mutateAsync({
            orgId: org.id,
            email: invite.email,
            roleId: invite.roleId,
          });
        }
      }

      markOnboardingComplete();
      seedGithubPagesDemoData();
      router.push("/dashboard");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to create organization. Please try again.",
      );
    }
  };

  const isSubmitting = createOrg.isPending || inviteMemberMutation.isPending;

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Set up your organization</CardTitle>
          <CardDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step].title}
          </CardDescription>
          <Progress value={progress} className="mt-4" aria-label="Onboarding progress" />
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <CurrentStep />
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || isSubmitting}
            >
              Back
            </Button>
            <div className="flex gap-2">
              {step === 5 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={isSubmitting}
                >
                  Skip
                </Button>
              )}
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {step === STEPS.length - 1 ? "Complete setup" : "Continue"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
