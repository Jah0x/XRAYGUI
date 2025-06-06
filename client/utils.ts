export function useAuth(_opts?: { required?: boolean }) {
  return { status: 'authenticated' } as const;
}

export function useToast() {
  return { toast: console.log };
}
