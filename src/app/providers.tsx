import type { PropsWithChildren } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { queryClient } from "@/rest/query-client";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        closeButton={false}
        expand={false}
        mobileOffset={{ bottom: "5.9rem", left: "0.5rem", right: "0.5rem" }}
        offset={{ bottom: "5.9rem", right: "0.5rem" }}
        position="bottom-right"
        richColors
        toastOptions={{
          className:
            "w-[min(17rem,calc(100vw-1rem))] border-none bg-transparent p-0 shadow-none",
          unstyled: true,
        }}
        visibleToasts={2}
      />
    </QueryClientProvider>
  );
}
