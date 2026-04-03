import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In — CuteCode",
  description: "Sign in to your CuteCode account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111]">
      <SignIn />
    </div>
  );
}
