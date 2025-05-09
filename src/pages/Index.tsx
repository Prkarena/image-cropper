
import ImageCropper from "../components/ImageCropper";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Image Crop Tool</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload any image and crop it to match mobile app layouts, social media posts, or print materials.
            Choose from rectangle, square, circle, oval, or portrait formats with customizable sizes.
          </p>
        </header>
        <main>
          <ImageCropper />
        </main>
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© 2025 Precise Pixel Cutter • All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
