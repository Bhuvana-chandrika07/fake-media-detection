// src/api-client-react.ts

import { useQuery, useMutation } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8081"

// ---------- Stats ----------
export const useGetStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stats`)
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    }
  })
}

// ---------- Scan History ----------
export const useGetHistory = (params?: { limit?: number; mediaType?: string }) => {
  return useQuery({
    queryKey: ['history', params],
    queryFn: async () => {
      const url = new URL(`${API_BASE}/history`)
      if (params?.limit) url.searchParams.set('limit', params.limit.toString())
      if (params?.mediaType) url.searchParams.set('mediaType', params.mediaType)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch history")
      return res.json()
    }
  })
}

// ---------- Scan by ID ----------
export const useGetScanById = (scanId: string) => {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/scan/${scanId}`)
      if (!res.ok) throw new Error("Scan not found")
      return res.json()
    },
    enabled: !!scanId
  })
}

// ---------- Detect Image ----------
export const useDetectImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${API_BASE}/detect/image`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Image detection failed")
      return res.json()
    }
  })
}

// ---------- Detect Video ----------
export const useDetectVideo = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${API_BASE}/detect/video`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Video detection failed")
      return res.json()
    }
  })
}

// ---------- Detect Audio ----------
export const useDetectAudio = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${API_BASE}/detect/audio`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Audio detection failed")
      return res.json()
    }
  })
}