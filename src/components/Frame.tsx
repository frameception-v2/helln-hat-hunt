"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
import type { FrameContext } from "@farcaster/frame-sdk";

function ContextDisplay({ context }: { context: FrameContext | undefined }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  if (!context) return null;

  return (
    <div className="mt-4 text-sm">
      <div className="flex justify-between items-center">
        <Label className="font-medium">Frame Context</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpand}
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md overflow-auto max-h-40">
          <pre className="text-xs">{JSON.stringify(context, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function ActionButtons({ 
  sdk, 
  pinFrame, 
  isFramePinned 
}: { 
  sdk: typeof import("@farcaster/frame-sdk").default; 
  pinFrame: () => Promise<any>; 
  isFramePinned: boolean;
}) {
  const openDocs = useCallback(() => {
    sdk.actions.openUrl("https://docs.farcaster.xyz/developers/");
  }, [sdk]);

  const closeFrame = useCallback(() => {
    sdk.actions.close();
  }, [sdk]);

  return (
    <div className="flex gap-2 justify-end">
      {!isFramePinned && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={pinFrame}
        >
          Pin Frame
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={closeFrame}
      >
        Close Frame
      </Button>
      <Button 
        size="sm" 
        onClick={openDocs}
      >
        Open Docs
      </Button>
    </div>
  );
}

export default function Frame() {
  const { isSDKLoaded, sdk, context, pinFrame, isFramePinned, lastEvent } = useFrameSDK();

  if (!isSDKLoaded) {
    return <div className="flex justify-center items-center h-[200px]">Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-2 px-2">
      <Card>
        <CardHeader>
          <CardTitle>{PROJECT_TITLE}</CardTitle>
          <CardDescription>
            {PROJECT_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            This is a Farcaster Frame v2 mini-app. You can interact with it directly from your Farcaster feed.
          </p>
          
          {lastEvent && (
            <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">
              Last event: {lastEvent}
            </div>
          )}
          
          <ContextDisplay context={context} />
        </CardContent>
        <CardFooter>
          <ActionButtons sdk={sdk} pinFrame={pinFrame} isFramePinned={isFramePinned} />
        </CardFooter>
      </Card>
    </div>
  );
}
