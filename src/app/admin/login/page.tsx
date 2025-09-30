
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { AdminLoginForm } from './AdminLoginForm';

export default function AdminLoginPage() {
  const loginImage = PlaceHolderImages.find(img => img.id === 'gallery-6');
  const loginImageUrl = loginImage ? loginImage.imageUrl : "https://images.unsplash.com/photo-1566341013452-946caa457784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxtYXAlMjBjb21wYXNzfGVufDB8fHx8MTc1ODk1NzE2MXww&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <AdminLoginForm />
        </div>
      </div>
       <div className="hidden bg-muted lg:block">
        <Image
          src={loginImageUrl}
          alt="Admin login image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.7]"
          data-ai-hint="map compass"
        />
      </div>
    </div>
  );
}
