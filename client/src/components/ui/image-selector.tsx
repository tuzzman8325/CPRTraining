import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { Control } from 'react-hook-form';

interface ImageSelectorProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  maxSize?: number;
  className?: string;
}

export function ImageSelector({
  control,
  name,
  label = "Image",
  placeholder = "Select an image for this class",
  required = false,
  maxSize = 5,
  className
}: ImageSelectorProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label} {required && <span className="text-destructive">*</span>}</FormLabel>
          <FormControl>
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              maxSize={maxSize}
              data-testid={`image-selector-${name}`}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}