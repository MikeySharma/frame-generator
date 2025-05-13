import type { MetaFunction } from "@remix-run/node";
import { useRef, useState } from "react";
import FrameGenerator from "~/components/FrameGenerator";
import FramePreview from "~/components/FramePreview";

export const meta: MetaFunction = () => {
  return [
    { title: "Frame Generator" },
    { name: "description", content: "A simple frame generator using Remix." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
};

export default function Index() {
  const [generatedFrame, setGeneratedFrame] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleFrameGenerated = (frameUrl: string) => {
    setGeneratedFrame(frameUrl);
  };

  const handleDownload = () => {
    if (downloadRef.current && generatedFrame) {
      downloadRef.current.href = generatedFrame;
      downloadRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-2">
          Profile Frame Generator
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Create beautiful frames for your profile pictures
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <FrameGenerator onFrameGenerated={handleFrameGenerated} />

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Preview & Download
            </h2>
            {generatedFrame ? (
              <>
                <FramePreview frameUrl={generatedFrame} />
                <button
                  onClick={handleDownload}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Download Frame
                </button>
                <a
                  ref={downloadRef}
                  href={generatedFrame}
                  download="profile-with-frame.png"
                  className="hidden"
                >
                  Download
                </a>
              </>
            ) : (
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-500">
                Your generated frame will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
