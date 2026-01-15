"use client";

import { DebugContracts } from "./_components/DebugContracts";
import type { NextPage } from "next";
import { notification } from "~~/utils/scaffold-eth";

const Debug: NextPage = () => {
  const testNotification = () => {
    notification.success("Test notification - this should appear at bottom right!");
  };

  return (
    <>
      <DebugContracts />
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Debug Contracts</h1>
        <p className="text-neutral">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / app / debug / page.tsx
          </code>{" "}
        </p>
        <button onClick={testNotification} className="btn btn-primary mt-4">
          Test Notification
        </button>
      </div>
    </>
  );
};

export default Debug;
