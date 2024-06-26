import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn appearance={{ variables: { colorPrimary: "#0F172A" } }} />
    </div>
  );
};

export default SignInPage;

export const generateMetadata = () => {
  return { title: "IntelliNotes - Sign In" };
};
