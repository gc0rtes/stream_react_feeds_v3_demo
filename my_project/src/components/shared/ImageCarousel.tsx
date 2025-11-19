import { useImageCarousel } from "@/hooks/useImageCarousel";

type ImageCarouselProps = {
  images: any[];
  imageClassName?: string;
  containerClassName?: string;
};

const ImageCarousel = ({
  images,
  imageClassName = "h-64 xs:h-[400px] lg:h-[450px] w-full rounded-[24px] object-cover",
  containerClassName = "relative w-full mb-5",
}: ImageCarouselProps) => {
  const {
    currentImageIndex,
    hasMultipleImages,
    handlePreviousImage,
    handleNextImage,
    handleJumpToImage,
  } = useImageCarousel(images);

  if (images.length === 0) return null;

  return (
    <div className={containerClassName}>
      {/* Image Display */}
      <img
        src={images[currentImageIndex].image_url}
        alt="post image"
        className={imageClassName}
      />

      {/* Navigation Arrows - Only show if multiple images */}
      {hasMultipleImages && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePreviousImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-dark-4/80 hover:bg-dark-4 rounded-full p-2 transition-colors"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-light-1"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-dark-4/80 hover:bg-dark-4 rounded-full p-2 transition-colors"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-light-1"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
            {images.map((_: any, index: number) => (
              <button
                key={index}
                onClick={(e) => handleJumpToImage(e, index)}
                className={`rounded-full transition-all ${
                  index === currentImageIndex
                    ? "w-3.5 h-3.5 bg-primary-500"
                    : "w-3 h-3 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
