import { useImageViewer } from './ImageViewer';

interface ImageWithViewerProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  images?: string[];
  imageIndex?: number;
}

export function ImageWithViewer({
  src,
  alt,
  className = '',
  onClick,
  images,
  imageIndex = 0,
}: ImageWithViewerProps) {
  const { openViewer } = useImageViewer();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
    if (images && images.length > 0) {
      openViewer(images, imageIndex);
    } else if (src) {
      openViewer([src], 0);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`cursor-pointer ${className}`}
      onClick={handleClick}
    />
  );
}

interface ImageGridWithViewerProps {
  images: { id: string; url: string }[];
  className?: string;
  thumbnailClassName?: string;
}

export function ImageGridWithViewer({
  images,
  className = '',
  thumbnailClassName = 'h-16 w-16 object-cover rounded-md',
}: ImageGridWithViewerProps) {
  const { openViewer } = useImageViewer();

  if (images.length === 0) return null;

  return (
    <div className={`flex gap-2 ${className}`}>
      {images.map((img, index) => (
        <img
          key={img.id}
          src={img.url}
          alt={`Imagen ${index + 1}`}
          className={thumbnailClassName}
          onClick={(e) => {
            e.stopPropagation();
            openViewer(
              images.map((i) => i.url),
              index
            );
          }}
        />
      ))}
    </div>
  );
}