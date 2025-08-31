'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImageUploader } from './ImageUploader';
import JSZip from 'jszip'; // --- NEW ---
import { saveAs } from 'file-saver'; // --- NEW ---

// --- NEW --- Image Preview Modal Component
function ImagePreviewModal({ imageUrl, onClose }) {
    if (!imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-lg" />
                <Button 
                    variant="destructive"
                    className="absolute -top-2 -right-2 rounded-full h-8 w-8"
                    onClick={onClose}
                >
                    &times;
                </Button>
            </div>
        </div>
    );
}


export function ThumbnailGenerator() {
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState('');
  const [mood, setMood] = useState('');
  const [placement, setPlacement] = useState('right');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [thumbnailText, setThumbnailText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [ratio, setRatio] = useState('16:9');
  const [style, setStyle] = useState('');
  const [step, setStep] = useState('form');
  const [rewriteData, setRewriteData] = useState(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null); // --- NEW --- State for preview modal
  const [isZipping, setIsZipping] = useState(false); // --- NEW --- State for zip download

  const imageAvailable = "Model/Product Image is available, AI has to place image/model/product in position mentioned in placement, ";

  // Prompt rewrite handler
  const handleRewriteSubmit = async (e) => {
    e.preventDefault();
    if (!title || !niche || !mood || !style) {
      toast.error("Missing Fields", { description: "Please fill in Title, Niche, Mood, and Style." });
      return;
    }
    setIsRewriting(true);
    setGeneratedImages([]);
    toast.loading("Crafting the perfect prompt...");
    try {
      const rewritePayload = { title, niche, mood, placement, thumbnailText, textColor, ratio, style };
      if (uploadedImage) rewritePayload.imageAvailable = imageAvailable;

      const rewriteResponse = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewritePayload),
      });

      if (!rewriteResponse.ok) {
        const errorData = await rewriteResponse.json();
        throw new Error(errorData.error || 'Failed to rewrite prompt.');
      }

      const dataFromRewrite = await rewriteResponse.json();
      setRewriteData(dataFromRewrite);
      setStep('review');
      toast.dismiss();
    } catch (error) {
      toast.error("Prompt Rewrite Failed", { description: error.message });
    } finally {
      setIsRewriting(false);
    }
  };

  // Generate multiple thumbnails
  const handleGenerateImages = async () => {
    if (!rewriteData?.rewritten_prompt) {
      toast.error("Missing Prompt", { description: "The prompt for generation is empty." });
      return;
    }
    setIsGenerating(true);
    setStep('generating');
    toast.loading("Generating your thumbnails...");
    try {
      const generatePayload = { ...rewriteData };
      if (uploadedImage) generatePayload.imageData = uploadedImage;

      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatePayload),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to generate images.');
      }

      const { images } = await generateResponse.json();
      setGeneratedImages(images.slice(0, 4));
      setStep('done');
      toast.dismiss();
      toast.success("Success!", { description: "Your thumbnails have been generated.", duration: 3000 });
    } catch (error) {
      toast.error("Generation Failed", { description: error.message });
      setStep('review');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeny = () => {
    setStep('form');
    setRewriteData(null);
  };
  
  // --- NEW --- Create and download a ZIP file
  const handleDownloadAll = async () => {
    if (generatedImages.length === 0) return;
    setIsZipping(true);
    toast.loading("Zipping files...");

    try {
        const zip = new JSZip();
        
        const imagePromises = generatedImages.map(async (imgSrc, index) => {
            // Use a cors-proxy if you face CORS issues with Cloudinary or other services
            const response = await fetch(imgSrc);
            if (!response.ok) {
                throw new Error(`Failed to fetch image ${index + 1}`);
            }
            const blob = await response.blob();
            zip.file(`thumbnail_${index + 1}.png`, blob);
        });

        await Promise.all(imagePromises);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'thumbnails.zip');

        toast.dismiss();
        toast.success("Success!", { description: "Your ZIP file has been downloaded." });
    } catch (error) {
        toast.dismiss();
        toast.error("Zip Creation Failed", { description: error.message });
    } finally {
        setIsZipping(false);
    }
  };

  return (
    <> {/* --- NEW --- Using a Fragment to wrap the component and the modal */}
      <ImagePreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
      <div className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---------- Form Card ---------- */}
        <Card className="lg:col-span-1 flex flex-col h-full">
            <CardHeader className="border-b-2 border-neutral-300">
            <CardTitle>Create Your Thumbnail</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[75vh] space-y-6 pt-6">
                <form onSubmit={handleRewriteSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Upload Image (Optional)</Label>
                        <ImageUploader onImageUpload={setUploadedImage} onImageRemove={() => setUploadedImage(null)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Video Title / Prompt</Label>
                        <Input placeholder="e.g., How I Built a SaaS in 30 Days" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Text on Thumbnail (Optional)</Label>
                        <Input placeholder="e.g., 0 to $10K MRR" value={thumbnailText} onChange={(e) => setThumbnailText(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex items-center gap-2">
                        <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="p-1 h-10 w-14" />
                        <Input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} placeholder="#FFFFFF" className="w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Style</Label>
                        <Select onValueChange={setStyle} value={style}>
                            <SelectTrigger><SelectValue placeholder="Select a style..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="photographic">Photographic</SelectItem>
                                <SelectItem value="illustration">Illustration</SelectItem>
                                <SelectItem value="3d-render">3D Render</SelectItem>
                                <SelectItem value="cartoon">Cartoon / Anime</SelectItem>
                                <SelectItem value="pixel-art">Pixel Art</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Niche</Label>
                        <Select onValueChange={setNiche} value={niche}>
                            <SelectTrigger><SelectValue placeholder="Select a niche..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tech">Tech / Programming</SelectItem>
                                <SelectItem value="finance">Finance / Business</SelectItem>
                                <SelectItem value="gaming">Gaming</SelectItem>
                                <SelectItem value="lifestyle">Lifestyle / Vlogging</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Mood</Label>
                        <Select onValueChange={setMood} value={mood}>
                            <SelectTrigger><SelectValue placeholder="Select a mood..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">Professional / Clean</SelectItem>
                                <SelectItem value="dramatic">Dramatic / Cinematic</SelectItem>
                                <SelectItem value="fun">Fun / Energetic</SelectItem>
                                <SelectItem value="minimalist">Minimalist / Modern</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Aspect Ratio</Label>
                            <RadioGroup value={ratio} className="flex space-x-2 pt-2" onValueChange={setRatio}>
                                <div className="flex items-center space-x-1"><RadioGroupItem value="16:9" /> <Label>16:9</Label></div>
                                <div className="flex items-center space-x-1"><RadioGroupItem value="1:1" /> <Label>1:1</Label></div>
                                <div className="flex items-center space-x-1"><RadioGroupItem value="9:16" /> <Label>9:16</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject Placement</Label>
                            <RadioGroup value={placement} className="flex space-x-2 pt-2" onValueChange={setPlacement}>
                                <div className="flex items-center space-x-1"><RadioGroupItem value="left" /> <Label>Left</Label></div>
                                <div className="flex items-center space-x-1"><RadioGroupItem value="center" /> <Label>Center</Label></div>
                                <div className="flex items-center space-x-1"><RadioGroupItem value="right" /> <Label>Right</Label></div>
                            </RadioGroup>
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isRewriting}>
                        {isRewriting ? 'Rewriting...' : 'Generate Prompt'}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* ---------- Result Section ---------- */}
        <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">Result</h2>
                {step === 'done' && generatedImages.length > 0 && (
                    <Button onClick={handleDownloadAll} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isZipping}>
                        {/* --- NEW --- Changed handler and added disabled state */}
                        {isZipping ? 'Zipping...' : 'Download All'}
                    </Button>
                )}
            </div>

            {/* --- Initial State --- */}
            {step === 'form' && generatedImages.length === 0 && (
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Your generated thumbnails will appear here</p>
                </div>
            )}

            {/* --- Review Step --- */}
            {step === 'review' && (
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>Review Your Prompt</CardTitle>
                        <CardDescription>Edit your prompt before generating the final images.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Textarea
                        value={rewriteData?.rewritten_prompt || ''}
                        onChange={(e) => setRewriteData({ ...rewriteData, rewritten_prompt: e.target.value })}
                        rows={6}
                        className="text-base w-full"
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleDeny}>Cancel</Button>
                        <Button onClick={handleGenerateImages} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isGenerating ? 'Generating...' : 'Generate Images'}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* --- Generating Step --- */}
            {step === 'generating' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="aspect-video w-full rounded-lg" />
                </div>
            )}

            {/* --- Done Step (Display Images) --- */}
            {step === 'done' && generatedImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedImages.map((imgSrc, index) => (
                    <Card key={index} className="overflow-hidden group relative cursor-pointer" onClick={() => setPreviewImage(imgSrc)}>
                        {/* --- NEW --- Added onClick for preview */}
                        <img src={imgSrc} alt={`Generated thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/70 bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <span className="text-white text-lg font-semibold">Click to Preview</span>
                        </div>
                    </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    </>
  );
}