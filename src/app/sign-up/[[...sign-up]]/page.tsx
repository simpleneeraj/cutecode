import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign Up — CuteCode",
  description: "Create your free CuteCode account",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111]">
      <SignUp />
    </div>
  );
}
