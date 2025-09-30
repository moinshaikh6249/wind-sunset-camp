
import { LoginForm } from "./LoginForm";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(img => img.id === 'gallery-3');
  const loginImageUrl = loginImage ? loginImage.imageUrl : "https://images.unsplash.com/photo-1475483768296-6163e08872a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjYW1wZmlyZSUyMGZyaWVuZHN8ZW58MHx8fHwxNzU4OTg4NDk2fDA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2 xl:min-h-[calc(100vh-8rem)]">
      <div className="hidden bg-muted lg:block">
        <Image
          src={loginImageUrl}
          alt="Login image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.7]"
          data-ai-hint="campfire friends"
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
