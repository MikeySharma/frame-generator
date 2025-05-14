import { useRef, useState, useEffect } from "react";

interface FrameGeneratorProps {
  onFrameGenerated: (frameUrl: string) => void;
}

export default function FrameGenerator({
  onFrameGenerated,
}: FrameGeneratorProps) {
  const [selectedFrame, setSelectedFrame] = useState<string>("frame1");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [frameSize, setFrameSize] = useState<number>(0.9); // 1 = 100%
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frames = [
    { id: "frame1", name: "Classic", thumbnail: "/frames/frame1-thumb.png" },
    { id: "frame2", name: "Floral", thumbnail: "/frames/frame2-thumb.png" },
    { id: "frame3", name: "Modern", thumbnail: "/frames/frame3-thumb.png" },
    // { id: "frame4", name: "Vintage", thumbnail: "/frames/frame4-thumb.png" },
  ];

  useEffect(() => {
    if (profilePic) {
      generateFrame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilePic, selectedFrame, zoomLevel, frameSize]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
        setZoomLevel(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(parseFloat(e.target.value));
  };

  const handleFrameSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrameSize(parseFloat(e.target.value));
  };

  const prepareFrameImage = async (
    frameImg: HTMLImageElement,
    sizeMultiplier: number = 1
  ): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Could not get canvas context");

    // Base canvas size
    const baseSize = 512;
    canvas.width = baseSize;
    canvas.height = baseSize;

    // Clear with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling with size multiplier
    const scale = Math.min(
      (canvas.width / frameImg.width) * sizeMultiplier,
      (canvas.height / frameImg.height) * sizeMultiplier
    );
    const width = frameImg.width * scale;
    const height = frameImg.height * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    // Draw the frame centered
    ctx.drawImage(frameImg, x, y, width, height);

    return canvas;
  };

  const generateFrame = async () => {
    if (!profilePic) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to standard profile picture size
    const canvasSize = 512;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load profile picture
    const profileImg = new Image();
    profileImg.src = profilePic;

    // Load frame image
    const frameImg = new Image();
    frameImg.src = `/frames/${selectedFrame}.png`;

    // Wait for both images to load
    await Promise.all([
      new Promise((resolve) => {
        profileImg.onload = resolve;
      }),
      new Promise((resolve) => {
        frameImg.onload = resolve;
      }),
    ]);

    // Draw profile picture with circular mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate dimensions with zoom
    const size = Math.min(profileImg.width, profileImg.height);
    const centerX = (profileImg.width - size) / 2;
    const centerY = (profileImg.height - size) / 2;

    const profileSize = canvasSize * 0.8 * zoomLevel;
    const profileX = (canvasSize - profileSize) / 2;
    const profileY = (canvasSize - profileSize) / 2;

    ctx.drawImage(
      profileImg,
      centerX,
      centerY,
      size,
      size,
      profileX,
      profileY,
      profileSize,
      profileSize
    );
    ctx.restore();

    // Prepare and draw the frame with size adjustment
    const preparedFrame = await prepareFrameImage(frameImg, frameSize);
    ctx.drawImage(preparedFrame, 0, 0);

    // Convert to PNG and callback
    const frameUrl = canvas.toDataURL("image/png");
    onFrameGenerated(frameUrl);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create Your Frame
      </h2>

      <div className="mb-6">
        <label
          htmlFor="images"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Upload Profile Picture
        </label>
        <input
          id="images"
          name="images"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-500 transition"
        >
          {profilePic ? (
            <div className="flex items-center justify-center">
              <img
                src={profilePic}
                alt="Profile preview"
                className="h-20 w-20 rounded-full object-cover"
              />
              <span className="ml-3 text-purple-600">Change Image</span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">Click to upload</p>
              <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
            </div>
          )}
        </button>
      </div>

      {profilePic && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Zoom ({Math.round(zoomLevel * 100)}%)
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">50%</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoomLevel}
                onChange={handleZoomChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500">200%</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frame Size ({Math.round(frameSize * 100)}%)
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">50%</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={frameSize}
                onChange={handleFrameSizeChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500">150%</span>
            </div>
          </div>
        </>
      )}

      <div className="mb-6">
        <label
          htmlFor="select-frame"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Frame
        </label>
        <div className="grid grid-cols-2 gap-3">
          {frames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => setSelectedFrame(frame.id)}
              className={`border-2 rounded-lg p-2 cursor-pointer transition ${
                selectedFrame === frame.id
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="bg-gray-100 rounded-md h-24 flex items-center justify-center">
                <img
                  src={frame.thumbnail}
                  alt={frame.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-center text-gray-900 mt-1 text-sm font-medium">
                {frame.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
