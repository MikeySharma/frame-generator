interface FramePreviewProps {
  frameUrl: string;
}

export default function FramePreview({ frameUrl }: FramePreviewProps) {
  return (
    <div className="flex justify-center">
      <div className="relative">
        <img
          src={frameUrl}
          alt="Generated frame preview"
          className="rounded-lg border border-gray-200 max-w-full h-auto"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            Preview
          </div>
        </div>
      </div>
    </div>
  );
}
