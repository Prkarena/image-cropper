import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, getCroppedImgDataUrl, getAspectRatio, getOutputSize } from '../utils/cropUtils';
import { ArrowUpTrayIcon, ArrowsPointingOutIcon, ArrowDownTrayIcon, ParallelogramIcon } from './Icons';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Square, RectangleVertical, Circle } from "lucide-react"; // Removed Shapes import

const ImageCropper = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [shape, setShape] = useState('parallelogram');
  const [selectedSize, setSelectedSize] = useState('parallelogram-small'); // Default to medium
  const [originalFilename, setOriginalFilename] = useState("image"); // Store original filename
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result);
        setCroppedImage(null);
        
        // Save the original filename without extension
        const filename = file.name.replace(/\.[^/.]+$/, "");
        setOriginalFilename(filename);
      };
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result);
        setCroppedImage(null);
        
        // Save the original filename without extension
        const filename = file.name.replace(/\.[^/.]+$/, "");
        setOriginalFilename(filename);
      };
    }
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const dataUrl = await getCroppedImgDataUrl(imageSrc, croppedAreaPixels, shape, selectedSize);
      setCroppedImage(dataUrl);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, shape, selectedSize]);

  const downloadCroppedImage = useCallback(async () => {
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, shape, selectedSize);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use the original filename with appropriate extension based on shape
      const extension = shape === 'parallelogram' ? 'png' : 'jpg';
      link.download = `${originalFilename}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, shape, selectedSize, originalFilename]);

  const handleReset = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setOriginalFilename("image");
  };

  const handleClearImage = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setOriginalFilename("image");
  };

  const handleShapeChange = (value) => {
    setShape(value);
    // Clear previous cropped image when changing shape
    setCroppedImage(null);
  };

  const handleSizeChange = (value) => {
    setSelectedSize(value);
    // Clear previous cropped image when changing size
    setCroppedImage(null);
  };

  // Calculate aspect ratio based on selected shape and size
  const aspect = getAspectRatio(shape, selectedSize);

  // Get output dimensions for display
  const outputSize = getOutputSize(selectedSize, shape);

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Image Cropper
      </h2>
      
      {!imageSrc ? (
        <div 
          className={`p-2 h-96 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all rounded-lg overflow-hidden ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center max-w-md mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-gray-400 text-sm">
            Supports: JPEG, PNG, WebP
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            ref={fileInputRef}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Crop Settings
              </h3>
              
              <div className="space-y-2">
                <Label className="mb-3 block text-base">Select Shape</Label>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div 
                    className={`relative p-4 border rounded-md cursor-pointer transition-all ${shape === 'rectangle' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    onClick={() => handleShapeChange('rectangle')}
                  >
                    <RectangleVertical className="w-10 h-10 mx-auto text-gray-700" />
                    <div className="mt-2 text-center text-sm">Rectangle</div>
                    <input 
                      type="radio" 
                      name="shape"
                      value="rectangle"
                      checked={shape === 'rectangle'} 
                      onChange={() => handleShapeChange('rectangle')} 
                      className="absolute top-2 right-2"
                    />
                  </div>
                  
                  <div 
                    className={`relative p-4 border rounded-md cursor-pointer transition-all ${shape === 'square' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    onClick={() => handleShapeChange('square')}
                  >
                    <Square className="w-10 h-10 mx-auto text-gray-700" />
                    <div className="mt-2 text-center text-sm">Square</div>
                    <input 
                      type="radio" 
                      name="shape" 
                      value="square"
                      checked={shape === 'square'} 
                      onChange={() => handleShapeChange('square')} 
                      className="absolute top-2 right-2"
                    />
                  </div>
                  
                  <div 
                    className={`relative p-4 border rounded-md cursor-pointer transition-all ${shape === 'circle' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    onClick={() => handleShapeChange('circle')}
                  >
                    <Circle className="w-10 h-10 mx-auto text-gray-700" />
                    <div className="mt-2 text-center text-sm">Circle</div>
                    <input 
                      type="radio" 
                      name="shape" 
                      value="circle"
                      checked={shape === 'circle'} 
                      onChange={() => handleShapeChange('circle')} 
                      className="absolute top-2 right-2"
                    />
                  </div>
                  
                  <div 
                    className={`relative p-4 border rounded-md cursor-pointer transition-all ${shape === 'parallelogram' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    onClick={() => handleShapeChange('parallelogram')}
                  >
                    <ParallelogramIcon className="w-10 h-10 mx-auto text-gray-700" />
                    <div className="mt-2 text-center text-sm">Parallelogram</div>
                    <input 
                      type="radio" 
                      name="shape" 
                      value="parallelogram" 
                      checked={shape === 'parallelogram'} 
                      onChange={() => handleShapeChange('parallelogram')} 
                      className="absolute top-2 right-2"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="size-select" className="mb-3 block text-base">Select Size</Label>
                <Select value={selectedSize} onValueChange={handleSizeChange} className="w-full">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium (Mobile)</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    {shape === 'square' && (
                      <>
                        <SelectItem value="square-small">Square Small</SelectItem>
                        <SelectItem value="square-medium">Square Medium</SelectItem>
                        <SelectItem value="square-large">Square Large</SelectItem>
                      </>
                    )}
                    {shape === 'oval' && (
                      <>
                        <SelectItem value="oval-small">Oval Small</SelectItem>
                        <SelectItem value="oval-medium">Oval Medium</SelectItem>
                        <SelectItem value="oval-large">Oval Large</SelectItem>
                      </>
                    )}
                    {shape === 'parallelogram' && (
                      <>
                        <SelectItem value="parallelogram-small">Parallelogram Small</SelectItem>
                        <SelectItem value="parallelogram-medium">Parallelogram Medium</SelectItem>
                        <SelectItem value="parallelogram-large">Parallelogram Large</SelectItem>
                      </>
                    )}
                    {shape === 'portrait' && (
                      <>
                        <SelectItem value="portrait-small">Portrait Small</SelectItem>
                        <SelectItem value="portrait-medium">Portrait Medium</SelectItem>
                        <SelectItem value="portrait-large">Portrait Large</SelectItem>
                      </>
                    )}
                    {shape === 'portrait-id' && (
                      <>
                        <SelectItem value="portrait-id-small">ID Small</SelectItem>
                        <SelectItem value="portrait-id-medium">ID Medium</SelectItem>
                        <SelectItem value="portrait-id-large">ID Large</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                <div className="mt-4 text-sm text-gray-500">
                  Output size: {outputSize.width}×{outputSize.height} pixels
                </div>
              </div>
            </div>
          </div>

          <div className="cropContainer relative bg-gray-100 shadow-lg rounded-lg overflow-hidden" style={{height: '500px'}}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape={shape === 'circle' || shape === 'oval' || shape === 'portrait' || shape === 'portrait-id' ? 'round' : 'rect'}
              showGrid={shape !== 'parallelogram'}
            />
            {/* {shape === 'parallelogram' && (
              <div 
                className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none border-2 border-white z-10"
                style={{
                  transform: 'skew(-15deg)',
                  width: '80%',
                  height: '80%',
                  margin: 'auto',
                  top: '10%',
                  left: '10%',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
              ></div>
            )} */}
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <ArrowsPointingOutIcon className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">{zoom.toFixed(1)}x</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={showCroppedImage}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors flex-1"
            >
              Preview Crop
            </button>
            <button
              onClick={downloadCroppedImage}
              className="bg-secondary hover:bg-secondary/90 text-gray-800 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
              disabled={!croppedAreaPixels}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={handleClearImage}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Clear Image
            </button>
            <button
              onClick={handleReset}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Reset
            </button>
          </div>

          {croppedImage && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">
                Cropped Result ({outputSize.width}×{outputSize.height})
              </h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-center">
                  <img
                    src={croppedImage}
                    alt="Cropped"
                    className="max-h-[600px] w-auto object-contain border"
                    style={{
                      borderRadius: shape === 'circle' || shape === 'oval' || shape === 'portrait' ? '50%' : shape === 'portrait-id' ? '20%' : '0',
                      maxWidth: '100%',
                    }}
                  />
                </div>
                <div className="mt-3 text-xs text-center text-gray-500">
                  Output size: {outputSize.width}×{outputSize.height} pixels
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
