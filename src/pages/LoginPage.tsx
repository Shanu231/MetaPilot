import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../providers/AuthProvider";

const schema = zod.object({
  email: zod.string().email({ message: "Invalid email address format." }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters." })
});

type FormValues = zod.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "admin@metapilot.io",
      password: "password123"
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login submission error: ", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center mb-2">
        <h3 className="text-xl font-bold font-heading text-white">Sign In</h3>
        <p className="text-xs text-brand-muted">Enter credentials below to access the workspace</p>
      </div>

      <Input
        id="email"
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        leftIcon={<Mail className="h-4 w-4" />}
        {...register("email")}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        leftIcon={<Lock className="h-4 w-4" />}
        {...register("password")}
      />

      <Button
        type="submit"
        variant="glow"
        isLoading={isSubmitting}
        className="w-full mt-2"
      >
        <span>Sign In</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-xs text-center text-brand-muted mt-4">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-brand-secondary hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
