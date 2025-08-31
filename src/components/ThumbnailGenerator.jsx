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

export function ThumbnailGenerator() {
  // All state and logic remains the same.
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
  const [generatedImage, setGeneratedImage] = useState(null);
  const imageAvailable = "Model/Product Image is available, AI has to place image/model/product in position mentioned in placement, "
  const handleRewriteSubmit = async (e) => {
    e.preventDefault();
    if (!title || !niche || !mood || !style) {
      toast.error("Missing Fields", { description: "Please fill in the Title, Niche, Mood, and Style." });
      return;
    }
    setIsRewriting(true);
    setGeneratedImage(null);
    toast.loading("Crafting the perfect prompt...");
    try {
      const rewritePayload = {
        title,
        niche,
        mood,
        placement,
        thumbnailText,
        textColor,
        ratio,
        style,
      };

      if (uploadedImage) {
        rewritePayload.imageAvailable = imageAvailable;
      }
      // if (uploadedImage) rewritePayload.imageData = uploadedImage;
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
      error(error);
      toast.error("Prompt Rewrite Failed", { description: error.message });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!rewriteData || !rewriteData.rewritten_prompt) {
      toast.error("Missing Prompt", { description: "The prompt for generation is empty." });
      return;
    }
    setIsGenerating(true);
    setStep('generating');
    toast.loading("Generating your thumbnail...");
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
      setGeneratedImage(images[0]);
      setStep('done');
      toast.dismiss();
      toast.success("Success!", { description: "Your thumbnail has been generated.", duration: 3000 });
    } catch (error) {
      error(error);
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

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'thumbnail.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ---------- Form Card ---------- */}
      <Card className="lg:col-span-1 flex flex-col h-full">
        {/* 🎨 CHANGE: Added an amber border to the bottom of the header */}
        <CardHeader className="border-b-2 border-neutral-300">
          <CardTitle>Create Your Thumbnail</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[75vh] space-y-6 pt-6">
          <form onSubmit={handleRewriteSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-medium">Upload Image (Optional)</Label>
              <ImageUploader onImageUpload={setUploadedImage} onImageRemove={() => setUploadedImage(null)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">Video Title / Prompt</Label>
              {/* 🎨 CHANGE: Added amber focus ring */}
              <Input id="title" placeholder="e.g., How I Built a SaaS in 30 Days" value={title} onChange={(e) => setTitle(e.target.value)} className="focus-visible:ring-amber-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailText" className="font-medium">Text on Thumbnail (Optional)</Label>
              <Input id="thumbnailText" placeholder="e.g., 0 to $10K MRR" value={thumbnailText} onChange={(e) => setThumbnailText(e.target.value)} className="focus-visible:ring-amber-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor" className="font-medium">Text Color</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="p-1 h-10 w-14" />
                <Input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} placeholder="#FFFFFF" className="w-full focus-visible:ring-amber-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style" className="font-medium">Style</Label>
              <Select onValueChange={setStyle} value={style}>
                {/* 🎨 CHANGE: Added amber focus ring */}
                <SelectTrigger className="focus:ring-2 focus:ring-amber-500"><SelectValue placeholder="Select a style..." /></SelectTrigger>
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
              <Label htmlFor="niche" className="font-medium">Niche</Label>
              <Select onValueChange={setNiche} value={niche}>
                <SelectTrigger className="focus:ring-2 focus:ring-amber-500"><SelectValue placeholder="Select a niche..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tech / Programming</SelectItem>
                  <SelectItem value="finance">Finance / Business</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle / Vlogging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood" className="font-medium">Mood</Label>
              <Select onValueChange={setMood} value={mood}>
                <SelectTrigger className="focus:ring-2 focus:ring-amber-500"><SelectValue placeholder="Select a mood..." /></SelectTrigger>
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
                <Label className="font-medium">Aspect Ratio</Label>
                {/* 🎨 CHANGE: The selected radio item will be blue */}
                <RadioGroup defaultValue="16:9" value={ratio} className="flex space-x-2 pt-2" onValueChange={setRatio}>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="16:9" id="r-16-9" className="text-blue-600" /> <Label htmlFor="r-16-9">16:9</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="1:1" id="r-1-1" className="text-blue-600" /> <Label htmlFor="r-1-1">1:1</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="9:16" id="r-9-16" className="text-blue-600" /> <Label htmlFor="r-9-16">9:16</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Subject Placement</Label>
                <RadioGroup defaultValue="right" value={placement} className="flex space-x-2 pt-2" onValueChange={setPlacement}>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="left" id="r1" className="text-blue-600" /> <Label htmlFor="r1">Left</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="center" id="r2" className="text-blue-600" /> <Label htmlFor="r2">Center</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="right" id="r3" className="text-blue-600" /> <Label htmlFor="r3">Right</Label></div>
                </RadioGroup>
              </div>
            </div>

            {/* 🎨 CHANGE: Applied blue brand color to the primary button */}
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
          {/* 🎨 CHANGE: Applied blue brand color to the download button */}
          {step === 'done' && generatedImage && <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white">Download Image</Button>}
        </div>

        {step === 'form' && !generatedImage && (
          // 🎨 CHANGE: Replaced text-gray-500 with theme-aware color
          <div className="flex-1 bg-card text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg flex items-center justify-center">
            Your generated thumbnail will appear here.
          </div>
        )}

        {step === 'review' && (
          <Card className="flex  flex-col h-full">
            <CardHeader>
              <CardTitle>Review Your Prompt</CardTitle>
              <CardDescription>Edit your prompt before generating the final image.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {/* 🎨 CHANGE: Added amber focus ring */}
              <Textarea
                value={rewriteData?.rewritten_prompt || ''}
                onChange={(e) => setRewriteData({ ...rewriteData, rewritten_prompt: e.target.value })}
                rows={6}
                className="text-base w-full focus-visible:ring-amber-500"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDeny}>Cancel</Button>
              {/* 🎨 CHANGE: Applied blue brand color to the primary button */}
              <Button onClick={handleGenerateImage} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 'generating' && (
          <Skeleton className="aspect-video w-full rounded-lg" />
        )}

        {(step === 'done' || (step === 'form' && generatedImage)) && generatedImage && (
          <Card className="overflow-hidden w-full">
            <img src={generatedImage} alt="Generated thumbnail" className=" w-96 " />
          </Card>
        )}
      </div>
    </div>
  );
}