import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Link, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // in MB
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

export function ImageUpload({
  value,
  onChange,
  className,
  placeholder = "Select an image",
  accept = "image/*",
  maxSize = MAX_FILE_SIZE_MB
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [urlInput, setUrlInput] = useState(value || '');
  const [activeTab, setActiveTab] = useState<string>(value && value.startsWith('http') ? 'url' : 'upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPEG, PNG, WebP, or GIF)",
        variant: "destructive"
      });
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      
      // Check if it's HTTP or HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        toast({
          title: "Invalid URL",
          description: "URL must use HTTP or HTTPS protocol",
          variant: "destructive"
        });
        return false;
      }

      // Basic check for image-like extensions (optional, as modern URLs might not have extensions)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      
      // If no image extension, warn but don't reject
      if (!hasImageExtension) {
        toast({
          title: "Warning",
          description: "URL doesn't appear to be an image. Please verify it displays correctly.",
          variant: "default"
        });
      }

      return true;
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { success, imagePath } = await response.json();
      
      if (success && imagePath) {
        const fullPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        setPreviewUrl(fullPath);
        onChange(fullPath);
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    
    if (url.trim() === '') {
      setPreviewUrl(null);
      onChange(null);
      return;
    }

    if (validateUrl(url)) {
      setPreviewUrl(url);
      onChange(url);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setUrlInput('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => ACCEPTED_IMAGE_TYPES.includes(file.type));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop a valid image file",
        variant: "destructive"
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" data-testid="tab-upload">
            <Upload className="w-4 h-4 mr-2" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="url" data-testid="tab-url">
            <Link className="w-4 h-4 mr-2" />
            Image URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover-elevate cursor-pointer transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-drop-zone"
          >
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                <Image className="w-8 h-8 text-muted-foreground" />
              )}
              <div className="text-sm">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-muted-foreground">
                PNG, JPG, WebP or GIF (max {maxSize}MB)
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
              data-testid="input-file"
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              data-testid="input-url"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {previewUrl && (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={() => {
                  toast({
                    title: "Image error",
                    description: "Failed to load image. Please check the URL or try a different image.",
                    variant: "destructive"
                  });
                  setPreviewUrl(null);
                  onChange(null);
                }}
                data-testid="img-preview"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemoveImage}
                data-testid="button-remove"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}