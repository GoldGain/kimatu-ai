import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05070d] px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <Card className="relative w-full max-w-md">
        <CardHeader>
          <Badge className="mb-2 w-fit">Kimatu AI</Badge>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Auth UI scaffold — connect Supabase Auth for production email/password
            and OAuth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Link href="/dashboard">
            <Button className="w-full">Continue to dashboard</Button>
          </Link>
          <p className="text-center text-xs text-zinc-500">
            No account?{" "}
            <Link href="/signup" className="text-cyan-300 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
