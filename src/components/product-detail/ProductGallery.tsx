"use client";

import { useState } from "react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/cn";

export type GalleryImage = {
  id: string;
  /** Authorized image URL. Absent while only placeholders exist. */
  src?: string;
  alt: string;
};

/** Main image plus selectable thumbnails. Placeholders stand in until real assets exist. */
export function ProductGallery({ images, className }: { images: GalleryImage[]; className?: string }) {
  const [activeId, setActiveId] = useState(images[0]?.id);
  const active = images.find((image) => image.id === activeId) ?? images[0];
  if (!active) return null;

  return (
    <div className={className}>
      <div className="aspect-square overflow-hidden rounded-2xl bg-surface-1 md:aspect-4/3">
        {active.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote image config arrives with real assets
          <img src={active.src} alt={active.alt} className="size-full object-contain p-6" />
        ) : (
          <ImagePlaceholder label={active.alt} showLabel />
        )}
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product images">
          {images.map((image, index) => {
            const pressed = image.id === active.id;
            return (
              <li key={image.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={pressed}
                  aria-label={`Show image ${index + 1} of ${images.length}`}
                  onClick={() => setActiveId(image.id)}
                  className={cn(
                    "block size-16 overflow-hidden rounded-lg border-2 bg-surface-1 transition-colors",
                    pressed ? "border-brand" : "border-transparent hover:border-line",
                  )}
                >
                  {image.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote image config arrives with real assets
                    <img src={image.src} alt="" className="size-full object-contain p-1" />
                  ) : (
                    <span aria-hidden="true" className="block size-full">
                      <ImagePlaceholder label={image.alt} icon={<span className="text-label-md">{index + 1}</span>} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
