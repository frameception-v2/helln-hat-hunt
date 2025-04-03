"use client";

import { useState, useEffect, useCallback } from "react";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";

export function useFrameSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext | undefined>();
  const [isFramePinned, setIsFramePinned] = useState(false);
  const [lastEvent, setLastEvent] = useState("");

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Get the context from the SDK
        const frameContext = await sdk.context;
        setContext(frameContext);
        
        if (frameContext?.client?.added) {
          setIsFramePinned(true);
        }

        // Set up event listeners
        sdk.on("frameAdded", () => {
          setLastEvent("frameAdded");
          setIsFramePinned(true);
        });

        sdk.on("frameAddRejected", ({ reason }) => {
          setLastEvent(`frameAddRejected: ${reason}`);
        });

        sdk.on("frameRemoved", () => {
          setLastEvent("frameRemoved");
          setIsFramePinned(false);
        });

        // Signal that the frame is ready
        sdk.actions.ready();
        
        // Mark SDK as loaded
        setIsSDKLoaded(true);
      } catch (error) {
        console.error("Error initializing Frame SDK:", error);
        // Still mark as loaded to avoid infinite loading state
        setIsSDKLoaded(true);
      }
    };

    if (!isSDKLoaded) {
      initializeSDK();
    }

    return () => {
      // Clean up event listeners
      sdk.removeAllListeners();
    };
  }, [isSDKLoaded]);

  const pinFrame = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();
      console.log("addFrame result", result);
      return result;
    } catch (error) {
      console.error("Error pinning frame:", error);
      return null;
    }
  }, []);

  return {
    isSDKLoaded,
    sdk,
    context,
    pinFrame,
    isFramePinned,
    lastEvent
  };
}
