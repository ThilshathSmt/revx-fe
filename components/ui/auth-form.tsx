"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthFormProps {
  className?: string;
}

export function AuthForm({ className }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSliding, setIsSliding] = useState(false);

  const toggleForm = () => {
    setIsSliding(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsSliding(false);
    }, 300);
  };

  return (
    <div className="w-full flex">
      {/* Auth Form - Left side for signup, right side for signin */}
      <div className={cn(
        "w-1/2 flex items-center justify-center p-8 transition-transform duration-300",
        isLogin ? "order-2" : "order-1"
      )}>
        <div className={cn("w-full max-w-md", className)}>
          <div className="card">
            <div className="card2">
              <form 
                className={cn(
                  "form",
                  isSliding && (isLogin ? "slide-left" : "slide-right")
                )}
                onSubmit={(e) => e.preventDefault()}
              >
                <p id="heading">{isLogin ? "Sign In" : "Create Account"}</p>
                
                {!isLogin && (
                  <>
                    <div className="field">
                      <User className="input-icon" />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Username"
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        className="input-field"
                        placeholder="Email"
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Password"
                      />
                    </div>
                    <div className="field">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Confirm Password"
                      />
                    </div>
                    <div className="field">
                      <Select>
                        <SelectTrigger className="w-full bg-transparent border-none text-white">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="hr">HR Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {isLogin && (
                  <>
                    <div className="field">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        className="input-field"
                        placeholder="Email"
                        autoComplete="off"
                      />
                    </div>
                    <div className="field">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Password"
                      />
                    </div>
                  </>
                )}

                <div className="btn">
                  <button className="button1">
                    {isLogin ? "Sign In" : "Create Account"}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-400 mt-4">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={toggleForm}
                    className="ml-1 text-white hover:text-green-400 transition-colors"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </div>

                {isLogin && (
                  <div className="text-center mt-2">
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Branding Side - Right side for signup, left side for signin */}
      <div className={cn(
        "w-1/2 p-8 flex flex-col justify-center items-center relative",
        isLogin ? "order-1" : "order-2"
      )}>
        <div className="absolute inset-0">
          <Image
            src="/management-system.png"
            alt="Employee Management"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
          />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            EMPLOYEE MANAGEMENT SYSTEM
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Streamline your workforce management with our comprehensive solution
          </p>
        </div>
      </div>
    </div>
  );
}