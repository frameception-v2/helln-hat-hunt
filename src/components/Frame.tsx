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
import { PROJECT_TITLE, PROJECT_DESCRIPTION, USDC_ADDRESS, RECIPIENT_ADDRESS } from "~/lib/constants";
import SnakeGame from "~/components/SnakeGame";


function ActionButtons({ sdk }: { sdk: import("@farcaster/frame-sdk").FrameSDK }) {
  const buyLives = useCallback(() => {
    sdk.transferTokens({
      tokenAddress: USDC_ADDRESS,
      recipientAddress: RECIPIENT_ADDRESS,
      amount: '1000000', // 1 USDC (6 decimals)
      chainId: '8453', // Base Mainnet
      actionType: 'mint'
    });
  }, [sdk]);

  return (
    <div className="flex gap-2 justify-end">
      <Button 
        size="sm" 
        onClick={buyLives}
      >
        Buy More Lives (1 USDC)
      </Button>
    </div>
  );
}

export default function Frame() {
  const { isSDKLoaded, sdk, lastEvent } = useFrameSDK();

  if (!isSDKLoaded) {
    return <div className="flex justify-center items-center h-[200px]">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative mb-4" style={{ paddingTop: '75%' }}>
        <div className="absolute top-0 left-0 w-full h-full">
          <SnakeGame />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{PROJECT_TITLE}</CardTitle>
          <CardDescription>
            {PROJECT_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Use arrow keys or buttons to control the snake. Collect degen hats 🎩 to score points!
          </p>
          
          {lastEvent && (
            <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">
              Last event: {lastEvent}
            </div>
          )}
          
        </CardContent>
        <CardFooter>
          <ActionButtons sdk={sdk} />
        </CardFooter>
      </Card>
    </div>
  );
}
