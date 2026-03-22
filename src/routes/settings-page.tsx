import { useState } from "react";

import { useRouter } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toWebSocketUrl } from "@/rest/client";
import { queryClient } from "@/rest/query-client";
import { bridgeQueryKeys } from "@/rest/queries";
import { useBridgeConfigStore } from "@/stores/bridge-config-store";

export function SettingsPage() {
  const router = useRouter();
  const gatewayUrl = useBridgeConfigStore((state) => state.gatewayUrl);
  const setGatewayUrl = useBridgeConfigStore((state) => state.setGatewayUrl);
  const [draftGatewayUrl, setDraftGatewayUrl] = useState(gatewayUrl);

  async function handleSave() {
    setGatewayUrl(draftGatewayUrl);
    await queryClient.invalidateQueries({
      queryKey: bridgeQueryKeys.all,
    });
    await router.invalidate();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#d0a954]">
                Routing desk
              </p>
              <CardTitle className="mt-2">Gateway settings</CardTitle>
            </div>
            <Badge variant="secondary">Bridge control</Badge>
          </div>
          <CardDescription>
            Keep the browser skin dumb and point it at a Streamline Bridge
            instance. The bridge remains the owner of machine and scale state.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label
              className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground"
              htmlFor="gatewayUrl"
            >
              Bridge URL
            </label>
            <Input
              id="gatewayUrl"
              placeholder="http://localhost:8080"
              value={draftGatewayUrl}
              onChange={(event) => setDraftGatewayUrl(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleSave()}>Save and reconnect</Button>
            <Button
              variant="secondary"
              onClick={() => setDraftGatewayUrl(window.location.origin)}
            >
              Use current origin
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <div>
            <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#d0a954]">
              Endpoint ladder
            </p>
            <CardTitle className="mt-2">Connection preview</CardTitle>
          </div>
          <CardDescription>
            These are the main endpoints the initial scaffold uses.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PreviewRow label="REST origin" value={gatewayUrl} />
          <PreviewRow
            label="Machine snapshot"
            value={`${toWebSocketUrl(gatewayUrl)}/ws/v1/machine/snapshot`}
          />
          <PreviewRow label="Workflow API" value={`${gatewayUrl}/api/v1/workflow`} />
          <PreviewRow label="Devices API" value={`${gatewayUrl}/api/v1/devices`} />
        </CardContent>
      </Card>
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-border/80 bg-background/70 p-4">
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-all font-mono text-[0.76rem] font-semibold tracking-[0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}
