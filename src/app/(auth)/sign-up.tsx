import { useAuth, useSignUp } from "@clerk/expo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect, useRouter } from "expo-router";
import { useState } from "react";
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
import { codeSchema, SignUpFormValues, signUpSchema } from "../../../lib/schemas/auth";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const isLoading = fetchStatus === "fetching";

  const [email, setEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
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

  const onSignUpPress = async (values: SignUpFormValues) => {
    setEmail(values.email);

    const { error } = await signUp.password({
      emailAddress: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onVerifyPress = async ({ code }: { code: string }) => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
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
          <Text className="text-brand-text-muted text-base mb-8">
            We sent a code to {email}
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
            onPress={() => signUp.verifications.sendEmailCode()}
            className="py-2"
          >
            <Text className="text-brand-red text-sm">I need a new code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => signUp.reset()} className="py-2">
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
          Create account
        </Text>
        <Text className="text-brand-text-muted text-base mb-8">
          Track your money, powered by AI
        </Text>

        <View className="flex-row gap-3 mb-2">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange } }) => {
              return (
                <TextInput
                  className="flex-1 border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 text-[#1A1D26]"
                  placeholder="First name"
                  placeholderTextColor="#8A8D96"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              );
            }}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange } }) => {
              return (
                <TextInput
                  className="flex-1 border border-[#E8E6DF] bg-white rounded-xl px-4 py-3 text-[#1A1D26]"
                  placeholder="Last name"
                  placeholderTextColor="#8A8D96"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              );
            }}
          />
        </View>
        {(formErrors.firstName || formErrors.lastName) && (
          <Text className="text-brand-red-glow mb-4 text-sm">
            {formErrors.firstName?.message || formErrors.lastName?.message}
          </Text>
        )}

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
        {errors.fields.emailAddress && (
          <Text className="text-brand-red-glow mb-4 text-sm">
            {errors.fields.emailAddress.message}
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
          onPress={handleSubmit(onSignUpPress)}
          disabled={isLoading}
          className="w-full bg-brand-red py-4 rounded-xl items-center mb-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {}}
          className="mb-6 w-full flex-row items-center justify-center gap-3 rounded-xl border border-brand-surface-border bg-white py-4"
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <MaterialCommunityIcons name="google" size={21} color="#DC1E3D" />
          <Text className="text-base font-semibold text-surface">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-brand-text-muted">
            Already have an account?{" "}
          </Text>
          <Link href="/sign-in">
            <Text className="text-brand-red font-semibold">Sign In</Text>
          </Link>
        </View>

        {/* Required by Clerk for bot protection */}
        <View nativeID="clerk-captcha" />
      </KeyboardAwareScrollView>
    </View>
  );
}
