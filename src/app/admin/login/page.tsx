"use client";

import { useState, useTransition } from "react";
import { login } from "@/lib/actions/auth";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome back to Lodjisvarga Admin");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden bg-white">
        <div className="bg-[#3A4A1F] p-8 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-white">Lodjisvarga</h2>
          <p className="text-[#A8BFA3] text-sm mt-2 font-light">Admin Portal Access</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-8 px-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input 
                  name="email"
                  type="email" 
                  placeholder="Email Address" 
                  required
                  disabled={isPending}
                  className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#3A4A1F] rounded-xl"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input 
                  name="password"
                  type="password" 
                  placeholder="Password" 
                  required
                  disabled={isPending}
                  className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#3A4A1F] rounded-xl"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-8 pb-8 pt-2">
            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-12 rounded-xl bg-[#3A4A1F] hover:bg-[#6E8F3B] text-white font-bold text-base transition-colors shadow-md"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
