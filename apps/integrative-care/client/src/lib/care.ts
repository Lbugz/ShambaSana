import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { uploadIssue } from "@shared/client-journey";
import type { CareCase, CareConfig, PublicUser } from "@shared/care";

export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({
    message: "The care service is unavailable. Please try again.",
  }));
  if (!response.ok)
    throw new Error(data.message || "Unable to complete this request.");
  return data;
}
export const hashParams = () =>
  new URLSearchParams(
    window.location.hash.split("?")[1] || window.location.search,
  );
export const useCareConfig = () =>
  useQuery<CareConfig>({
    queryKey: ["care-config"],
    queryFn: () => api("/config"),
  });
export function useAuth(role?: PublicUser["role"]) {
  const [, navigate] = useLocation();
  const query = useQuery<{ user: PublicUser | null }>({
    queryKey: ["care-auth"],
    queryFn: () => api("/auth/me"),
    staleTime: 30000,
  });
  useEffect(() => {
    if (!query.isSuccess || !role) return;
    if (!query.data.user)
      navigate(role === "practitioner" ? "/admin" : "/auth");
    else if (query.data.user.role !== role)
      navigate(
        query.data.user.role === "practitioner"
          ? "/admin/dashboard"
          : "/dashboard",
      );
  }, [query.isSuccess, query.data, role, navigate]);
  return { ...query, user: query.data?.user };
}
export const useCases = (enabled = true) =>
  useQuery<CareCase[]>({
    queryKey: ["care-cases"],
    queryFn: () => api("/cases"),
    enabled,
    refetchInterval: 15000,
  });
export const useCase = (id: string, enabled = true) =>
  useQuery<CareCase>({
    queryKey: ["care-case", id],
    queryFn: () => api(`/cases/${id}`),
    enabled: enabled && !!id,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
export function useCaseAction(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      path,
      method = "POST",
      body,
    }: {
      path: string;
      method?: string;
      body: unknown;
    }) => api<CareCase>(`/cases/${id}${path}`, method, body),
    onSuccess: (c) => {
      client.setQueryData(["care-case", id], c);
      client.invalidateQueries({ queryKey: ["care-cases"] });
    },
  });
}
export const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
export async function uploadDocument(
  file: File,
  purpose: "lab" | "tongue",
  revision: number,
) {
  const issue=uploadIssue(file,purpose);
  if(issue)throw new Error(issue);
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("Unable to read this file."));
    r.readAsDataURL(file);
  });
  const mime =
    (file.name.toLowerCase().endsWith(".csv") ? "text/csv" : file.type) ||
    (file.name.toLowerCase().endsWith(".csv")
      ? "text/csv"
      : file.name.toLowerCase().endsWith(".txt")
        ? "text/plain"
        : "");
  return { name: file.name, mime, data, purpose, revision };
}
