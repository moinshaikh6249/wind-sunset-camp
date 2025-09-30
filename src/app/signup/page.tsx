
import { SignupForm } from "./SignupForm";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function SignupPage() {
    const signupImage = PlaceHolderImages.find(img => img.id === 'gallery-5');
    const signupImageUrl = signupImage ? signupImage.imageUrl : "https://images.unsplash.com/photo-1716249671191-40a680611c21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxmb3Jlc3QlMjBzdW5iZWFtc3xlbnwwfHx8fDE3NTkwNTYyNDV8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="w-full lg:grid lg:grid-cols-2 flex-grow">
       <div className="hidden bg-muted lg:block relative">
        <Image
          src={signupImageUrl}
          alt="Signup image"
          fill
          className="object-cover dark:brightness-[0.7]"
          data-ai-hint="forest sunbeams"
        />
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
