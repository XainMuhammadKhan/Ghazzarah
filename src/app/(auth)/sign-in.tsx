import { useSignIn } from "@clerk/expo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Logo from "../../../assets/splash/logo.svg";
import { codeSchema, SignInFormValues, signInSchema } from "../../../lib/schemas/auth";
import useSocialAuth from "../hooks/useSocialAuth";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: { code: "" },
  });

  const onSignInPress = async (values: SignInFormValues) => {
    const { error } = await signIn.password({
      emailAddress: values.email,
      password: values.password,
    });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code"
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const onVerifyPress = async ({ code }: { code: string }) => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signIn);
    }
  };

  const isPasswordLoading = fetchStatus === "fetching";
  const isGoogleLoading = loadingStrategy === "oauth_google";
  const isLoading = isPasswordLoading || isGoogleLoading;

  if (signIn.status === "needs_client_trust") {
    return (
      <View className="flex-1 bg-brand-body">
        <KeyboardAwareScrollView
          bottomOffset={24}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          className="px-6 -mt-16"
        >
          <View className="-mb-8 h-48 w-48 self-start items-start -ml-8">
            <Logo width="100%" height="100%" />
          </View>
          <Text className="text-3xl font-bold text-[#1A1D26] mb-2 leading-tight">
            Verify your account
          </Text>

          <Controller
            control={codeControl}
            name="code"
            render={({ field: { value, onChange } }) => {
              return (
                <TextInput
                  className="border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
                  placeholder="Enter verification code"
                  placeholderTextColor="#8A8D96"
                  value={value}
                  onChangeText={onChange}
                />
              );
            }}
          />
          {codeErrors.code && (
            <Text className="text-brand-red-glow mb-4 text-sm">
              {codeErrors.code.message}
            </Text>
          )}
          {errors.fields.code && (
            <Text className="text-brand-red-glow mb-4 text-sm">
              {errors.fields.code.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleCodeSubmit(onVerifyPress)}
            disabled={isLoading}
            className="w-full bg-brand-red py-4 rounded-xl items-center mb-4"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signIn.mfa.sendEmailCode()}
            className="py-2"
          >
            <Text className="text-brand-red text-sm">I need a new code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => signIn.reset()} className="py-2">
            <Text className="text-brand-red text-sm">Start over</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-body">
      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        className="px-6 -mt-16"
      >
        <View className="-mb-8 h-48 w-48 self-start items-start -ml-8">
          <Logo width="100%" height="100%" />
        </View>
        <Text className="text-3xl font-bold text-[#1A1D26] mb-2 leading-tight">
          Welcome back
        </Text>
        <Text className="text-brand-text-muted text-base mb-8">
          Sign in to your account
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
                placeholder="Email Address"
                placeholderTextColor="#8A8D96"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
            );
          }}
        />
        {formErrors.email && (
          <Text className="text-brand-red-glow mb-4 text-sm">
            {formErrors.email.message}
          </Text>
        )}
        {errors.fields.identifier && (
          <Text className="text-brand-red-glow mb-4 text-sm">
            {errors.fields.identifier.message}
          </Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 mb-2 text-[#1A1D26]"
                placeholder="Password"
                placeholderTextColor="#8A8D96"
                value={value}
                onChangeText={onChange}
                secureTextEntry
              />
            );
          }}
        />
        {formErrors.password && (
          <Text className="text-brand-red-glow mb-4 text-sm">
            {formErrors.password.message}
          </Text>
        )}
        {errors.fields.password && (
          <Text className="text-brand-red-glow mb-4 text-sm">
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit(onSignInPress)}
          disabled={isLoading}
          className="w-full bg-brand-red py-4 rounded-xl items-center mb-4"
        >
          {isPasswordLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={isLoading}
          className="mb-6 w-full flex-row items-center justify-center gap-3 rounded-xl border border-brand-surface-border bg-white py-4"
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <MaterialCommunityIcons name="google" size={21} color="#DC1E3D" />
          <Text className="text-base font-semibold text-surface">
            {isGoogleLoading ? "Connecting Google..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-brand-text-muted">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/sign-up">
            <Text className="text-brand-red font-semibold">Sign Up</Text>
          </Link>
        </View>

        <Text className="mt-4 text-center text-xs leading-5 text-brand-text-muted">
          By continuing, you agree to our{" "}
          <Text className="font-semibold text-brand-red">Terms of Service</Text>
          {" and "}
          <Text className="font-semibold text-brand-red">Privacy Policy</Text>.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
}
