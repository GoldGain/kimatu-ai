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

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05070d] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge className="mb-2 w-fit">Create account</Badge>
          <CardTitle>Join Kimatu AI</CardTitle>
          <CardDescription>
            UI scaffold for email signup. Wire Supabase Auth + email verification
            next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Full name" />
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Link href="/dashboard">
            <Button className="w-full">Create account</Button>
          </Link>
          <p className="text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-300 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
