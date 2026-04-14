import { SignUpForm } from "@/components/auth/SignUpForm";

export default function Page() {
  return (
    <div className="flex-grow flex items-center justify-center py-20 bg-background relative overflow-hidden min-h-[80vh]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[110px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[90px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <SignUpForm />
      </div>
    </div>
  );
}
