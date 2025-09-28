import Image from "next/image";
import { galleryImages } from "@/lib/mock-data";

export default function GalleryPage() {
  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-4xl mx-auto mb-12">
                <h1 className="font-headline text-4xl md:text-6xl text-primary mb-6 text-gradient">Camp Gallery</h1>
                <p className="text-lg text-muted-foreground">
                A glimpse into the adventures and serene moments at Wind & Sunset Camp.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {galleryImages.map((image, index) => (
                <div key={image.id} className="relative aspect-[3/2] rounded-lg overflow-hidden group shadow-md transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl">
                    <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    data-ai-hint={image.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm drop-shadow-md">{image.description}</p>
                    </div>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
}
