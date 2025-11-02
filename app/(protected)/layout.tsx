"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { OnboardingDialog } from "../components/Onboarding/OnboardingDialog";
import { AppSidebar } from "../components/Sidebar/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { DateRangeProvider } from "../contexts/DateRangeContext";
import {
  getOnboardingComplete,
  setOnboardingComplete,
} from "../lib/onboardingStorage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthLoading>
        <ProtectedContent>{children}</ProtectedContent>
      </AuthLoading>

      <Unauthenticated>
        <UnauthenticatedRedirect />
      </Unauthenticated>

      <Authenticated>
        <ProtectedContent>{children}</ProtectedContent>
      </Authenticated>
    </>
  );
}

function UnauthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return null;
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const needsOrg = useQuery(api.users.queries.getUserOrganizationId, {});
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (needsOrg === undefined) return;
    if (!needsOrg) {
      setOnboardingComplete(true);
      setShowOnboarding(false);
    } else {
      setShowOnboarding(!getOnboardingComplete());
    }
  }, [needsOrg]);

  const handleOnboardingChange = (open: boolean) => {
    if (!open) {
      setOnboardingComplete(true);
      setShowOnboarding(false);
    }
  };

  return (
    <DateRangeProvider>
      <SidebarProvider>
        <AppSidebar />
        {children}
        {showOnboarding && (
          <OnboardingDialog open={true} onOpenChange={handleOnboardingChange} />
        )}
      </SidebarProvider>
    </DateRangeProvider>
  );
}
