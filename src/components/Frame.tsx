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
import { ERC20_ABI } from "~/lib/abi";
import SnakeGame from "~/components/SnakeGame";
import { createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});


function ActionButtons({ sdk }: { sdk: any }) {
  const buyLives = useCallback(async () => {
    const [account] = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const walletClient = createWalletClient({
      chain: base,
      transport: custom(window.ethereum)
    });

    try {
      const hash = await walletClient.writeContract({
        account: account as `0x${string}`,
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [
          RECIPIENT_ADDRESS,
          BigInt(1000000) // 1.0 USDC (6 decimals)
        ],
      });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        console.log('Transfer successful:', receipt);
      } else {
        console.error('Transfer failed:', receipt);
      }
    } catch (error) {
      console.error('Transaction error:', error);
    }
  }, []);

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
