
import { SignupForm } from "./SignupForm";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function SignupPage() {
    const signupImage = PlaceHolderImages.find(img => img.id === 'gallery-5');
    const signupImageUrl = signupImage ? signupImage.imageUrl : "https://images.unsplash.com/photo-1716249671191-40a680611c21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxmb3Jlc3QlMjBzdW5iZWFtc3xlbnwwfHx8fDE3NTkwNTYyNDV8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2 xl:min-h-[calc(100vh-8rem)]">
       <div className="hidden bg-muted lg:block">
        <Image
          src={signupImageUrl}
          alt="Signup image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.7]"
          data-ai-hint="forest sunbeams"
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
