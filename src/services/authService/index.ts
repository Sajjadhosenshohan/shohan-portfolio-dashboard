/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";

export interface DecodedUser {
  email: string;
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const registerUser = async (userData: FieldValues) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const result = await res.json();
    if (result.success) {
      (await cookies()).set("accessToken", result.data.accessToken);
    }
    return result;
  } catch (error: any) {
    return Error(error);
  }
};

export const loginUser = async (userData: FieldValues) => {
  try {
    console.log("LOGIN DATA =>", userData, process.env.NEXT_PUBLIC_BASE_API);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include", // include cookies
    });

    const result = await res.json();
    console.log(result);
    if (result.success) {
      (await cookies()).set("accessToken", result.data.accessToken);
    }

    return result;
  } catch (error: any) {
    return Error(error);
  }
};

export const refreshToken = async () => {
  // console.log("🔄 Calling refreshToken...");
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/auth/refresh-token`,
      {
        method: "POST",
        credentials: "include", // include cookies
      }
    );
    const result = await res.json();
    if (result.success) {
      (await cookies()).set("accessToken", result.data.accessToken);
    }

    return null;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return Error(error);
  }
};

export const forgotPassword = async (userData: FieldValues) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );
    const result = await res.json();
    return result;
  } catch (error: any) {
    return Error(error);
  }
};

export const resetPassword = async (
  userData: FieldValues & { token: string }
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${userData.token}`,
        },
        body: JSON.stringify(userData),
      }
    );
    const result = await res.json();
    return result;
  } catch (error: any) {
    return Error(error);
  }
};

export const getCurrentUser = async (): Promise<DecodedUser | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) return null;

    return jwtDecode(token.value);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const decodeToken = async (token: string): Promise<DecodedUser> => {
  return jwtDecode<DecodedUser>(token);
};

export const logoutUser = async () => {
  (await cookies()).delete("accessToken");
};
