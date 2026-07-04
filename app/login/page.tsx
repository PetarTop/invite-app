import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-8 px-6 py-12">
      <header className="flex flex-col gap-2 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Invite app
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Accounts are created by an administrator.
        </p>
      </header>

      <LoginForm next={next} />
    </div>
  );
}
