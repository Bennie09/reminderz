"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="w-46 h-46 flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/125d87c6-608f-4d76-8bc2-8468f5b46b9e/CvSplJFSD4.lottie"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
