import { useRef, useState } from "react";

interface FrameGeneratorProps {
  onFrameGenerated: (frameUrl: string) => void;
}

export default function FrameGenerator({
  onFrameGenerated,
}: FrameGeneratorProps) {
  const [selectedFrame, setSelectedFrame] = useState<string>("frame1");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100%
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frames = [
    { id: "frame1", name: "Classic", thumbnail: "/frames/frame1-thumb.png" },
    { id: "frame2", name: "Floral", thumbnail: "/frames/frame2-thumb.png" },
    { id: "frame3", name: "Modern", thumbnail: "/frames/frame3-thumb.png" },
    { id: "frame4", name: "Vintage", thumbnail: "/frames/frame4-thumb.png" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
        // Reset zoom when new image is selected
        setZoomLevel(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(parseFloat(e.target.value));
    generateFrame();
  };

  const generateFrame = () => {
    if (!profilePic) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 500;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load profile picture
    const profileImg = new Image();
    profileImg.crossOrigin = "Anonymous";
    profileImg.src = profilePic;

    profileImg.onload = () => {
      // Create circular mask for profile pic
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 250, 200, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Calculate dimensions with zoom
      const size = Math.min(profileImg.width, profileImg.height);
      const canvasCenter = canvas.width / 2;
      const baseSize = 400; // Base size before zoom
      const zoomedSize = baseSize * zoomLevel;

      // Calculate position to keep image centered
      const destX = canvasCenter - zoomedSize / 2;
      const destY = canvasCenter - zoomedSize / 2;

      // Draw profile pic with zoom
      ctx.drawImage(
        profileImg,
        (profileImg.width - size) / 2,
        (profileImg.height - size) / 2,
        size,
        size,
        destX,
        destY,
        zoomedSize,
        zoomedSize
      );

      ctx.restore();

      // Load frame
      const frameImg = new Image();
      frameImg.crossOrigin = "Anonymous";
      frameImg.src = `/frames/${selectedFrame}.png`;

      frameImg.onload = () => {
        // Draw frame on top
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

        // Convert to PNG
        const frameUrl = canvas.toDataURL("image/png");
        onFrameGenerated(frameUrl);
      };
    };
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
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zoom ({Math.round(zoomLevel * 100)}%)
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
              <p className="text-center mt-1 text-sm font-medium">
                {frame.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generateFrame}
        disabled={!profilePic}
        className={`w-full py-2 px-4 rounded-lg font-medium transition ${
          profilePic
            ? "bg-purple-600 hover:bg-purple-700 text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        Generate Frame
      </button>
    </div>
  );
}
