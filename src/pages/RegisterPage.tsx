import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../providers/AuthProvider";

const schema = zod.object({
  name: zod.string().min(2, { message: "Name must be at least 2 characters." }),
  email: zod.string().email({ message: "Invalid email address format." }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters." })
});

type FormValues = zod.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await registerUser(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error: ", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center mb-2">
        <h3 className="text-xl font-bold font-heading text-white">Create Account</h3>
        <p className="text-xs text-brand-muted">Get started with MetaPilot enterprise analytics</p>
      </div>

      <Input
        id="name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        error={errors.name?.message}
        leftIcon={<User className="h-4 w-4" />}
        {...register("name")}
      />

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
        <span>Sign Up</span>
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-xs text-center text-brand-muted mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-secondary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
