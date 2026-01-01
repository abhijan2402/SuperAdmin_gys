import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type LoginStep = "email" | "otp" | "password";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<LoginStep>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", otp: "", password: "" });
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Resend Timer
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(
        () => setOtpResendTimer(otpResendTimer - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  // Validate Email
  const validateEmail = () => {
    if (!email) {
      setErrors({ ...errors, email: "Email is required" });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ ...errors, email: "Email is invalid" });
      return false;
    }
    setErrors({ ...errors, email: "" });
    return true;
  };

  // Validate OTP
  const validateOtp = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrors({ ...errors, otp: "Please enter complete 6-digit OTP" });
      return false;
    }
    setErrors({ ...errors, otp: "" });
    return true;
  };

  // Validate Password
  const validatePassword = () => {
    if (!password) {
      setErrors({ ...errors, password: "Password is required" });
      return false;
    }
    if (password.length < 6) {
      setErrors({
        ...errors,
        password: "Password must be at least 6 characters",
      });
      return false;
    }
    setErrors({ ...errors, password: "" });
    return true;
  };

  // Handle Email Submission & Send OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setSendingOtp(true);

    try {
      const response = await fetch(
        "https://72.61.232.245:3001/api/auth/login/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();
      console.log(data);

      setSendingOtp(false);
      setCurrentStep("otp");
      setOtpResendTimer(60);
      toast.success("OTP Sent!", {
        description: `A 6-digit code has been sent to ${email}`,
      });
    } catch (error) {
      setSendingOtp(false);
      toast.error("Failed to send OTP", {
        description: `${error}`,
      });
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Backspace
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // Handle OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setVerifyingOtp(true);

    try {
      const otpCode = otp.join("");
      const response = await fetch(
        "https://72.61.232.245:3001/api/auth/login/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: otpCode,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid OTP");
      }

      const data = await response.json();
      console.log(data);
      setVerifyingOtp(false);
      setCurrentStep("password");
      toast.success("OTP Verified!", {
        description: "Please enter your password to continue",
      });
    } catch (error) {
      setVerifyingOtp(false);
      toast.error("Invalid OTP", {
        description: "Please check your OTP and try again.",
      });
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;

    setSendingOtp(true);

    try {
      const response = await fetch(
        "https://72.61.232.245:3001/api/auth/login/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }

      setSendingOtp(false);
      setOtpResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
      toast.success("OTP Resent!", {
        description: `A new code has been sent to ${email}`,
      });
    } catch (error) {
      setSendingOtp(false);
      toast.error("Failed to resend OTP", {
        description: "Please try again later.",
      });
    }
  };

  // Handle Password Submission & Final Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await login({ email, password });
      toast.success("Welcome Back!", {
        description: "Login successful",
      });
      navigate("/");
    } catch (error) {
      toast.error("Invalid Password", {
        description: "Please check your password and try again.",
      });
    }
  };

  // Go Back to Previous Step
  const handleGoBack = () => {
    if (currentStep === "otp") {
      setCurrentStep("email");
      setOtp(["", "", "", "", "", ""]);
    } else if (currentStep === "password") {
      setCurrentStep("otp");
      setPassword("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Logo & Brand */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Visit Tracking Pro
        </h1>
        <p className="text-gray-600">Super Admin Dashboard</p>
      </div>

      <Card className="bg-white/90 backdrop-blur-xl border-gray-200 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Super Admin Login</CardTitle>
          <CardDescription>
            {currentStep === "email" && "Enter your email to get started"}
            {currentStep === "otp" &&
              "Enter the verification code sent to your email"}
            {currentStep === "password" && "Enter your password to sign in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                currentStep === "email"
                  ? "bg-blue-600 text-white"
                  : currentStep === "otp" || currentStep === "password"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep === "otp" || currentStep === "password" ? "✓" : "1"}
            </div>
            <div
              className={`h-1 w-12 rounded transition-all ${
                currentStep === "otp" || currentStep === "password"
                  ? "bg-green-600"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                currentStep === "otp"
                  ? "bg-blue-600 text-white"
                  : currentStep === "password"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep === "password" ? "✓" : "2"}
            </div>
            <div
              className={`h-1 w-12 rounded transition-all ${
                currentStep === "password" ? "bg-green-600" : "bg-gray-200"
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                currentStep === "password"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Email Input */}
            {currentStep === "email" && (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="superadmin@example.com"
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={sendingOtp}
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <Mail className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}

            {/* STEP 2: OTP Verification */}
            {currentStep === "otp" && (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-center block">
                    Enter 6-Digit Code
                  </Label>
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Code sent to{" "}
                    <span className="font-semibold text-gray-700">{email}</span>
                  </p>

                  <div
                    className="flex gap-2 justify-center"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg font-semibold"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {errors.otp && (
                    <p className="text-sm text-red-600 flex items-center justify-center gap-1 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleGoBack}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  {otpResendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend code in{" "}
                      <span className="font-semibold text-blue-600">
                        {otpResendTimer}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      disabled={sendingOtp}
                    >
                      {sendingOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              </motion.form>
            )}

            {/* STEP 3: Password Input */}
            {currentStep === "password" && (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleGoBack}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Demo Credentials - Only show on email step */}
          {currentStep === "email" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <p className="text-xs font-semibold text-blue-900 mb-1">
                Demo Credentials:
              </p>
              <p className="text-xs text-blue-700">
                Email: superadmin@visittrackingpro.com
              </p>
              <p className="text-xs text-blue-700">Password: SuperAdmin123!</p>
              <p className="text-xs text-gray-500 mt-1 italic">
                OTP: Any 6 digits (demo mode)
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-gray-500 text-sm mt-8">
        © 2024 Visit Tracking Pro. All rights reserved.
      </p>
    </motion.div>
  );
}
