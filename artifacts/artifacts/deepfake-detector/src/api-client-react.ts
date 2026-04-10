// src/api-client-react.ts

import { useQuery, useMutation } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api"

// ---------- Stats ----------
export const useGetStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stats`)
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 5000
  })
}

// ---------- Scan History ----------
export const useGetHistory = (params?: { limit?: number; mediaType?: string }) => {
  return useQuery({
    queryKey: ['history', params?.limit, params?.mediaType],
    queryFn: async () => {
      let url = `${API_BASE}/history`
      const queryParams = new URLSearchParams()
      if (params?.limit) queryParams.set('limit', params.limit.toString())
      if (params?.mediaType) queryParams.set('mediaType', params.mediaType)
      
      const queryString = queryParams.toString()
      if (queryString) url += '?' + queryString
      
      console.log("Fetching history from:", url)
      const res = await fetch(url)
      if (!res.ok) {
        console.error("History fetch failed:", res.status, res.statusText)
        throw new Error("Failed to fetch history")
      }
      const data = await res.json()
      console.log("History response:", data)
      return data
    },
    staleTime: 0,
    refetchOnMount: true
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

// ---------- Batch Upload ----------
export const useBatchUpload = () => {
  return useMutation({
    mutationFn: async (data: { files: File[]; mediaType: string }) => {
      const formData = new FormData()
      data.files.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("mediaType", data.mediaType)
      
      const res = await fetch(`${API_BASE}/batch/upload`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Batch upload failed")
      return res.json()
    }
  })
}

// ---------- Batch Status ----------
export const useGetBatchStatus = (batchId: string) => {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/batch/${batchId}/status`)
      if (!res.ok) throw new Error("Failed to fetch batch status")
      return res.json()
    },
    enabled: !!batchId,
    refetchInterval: 1000 // Poll every second
  })
}

// ---------- Training Progress ----------
export const useGetTrainingProgress = () => {
  return useQuery({
    queryKey: ['training', 'progress'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/training/progress`)
      if (!res.ok) throw new Error("Failed to fetch training progress")
      return res.json()
    },
    refetchInterval: 5000 // Poll every 5 seconds
  })
}

// ---------- Training Metrics ----------
export const useGetTrainingMetrics = () => {
  return useQuery({
    queryKey: ['training', 'metrics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/training/metrics`)
      if (!res.ok) throw new Error("Failed to fetch training metrics")
      return res.json()
    },
    refetchInterval: 10000 // Poll every 10 seconds
  })
}

// ---------- Export CSV ----------
export const useExportCSV = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/export/csv`)
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      
      // Trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deepfake_scans_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return { success: true }
    }
  })
}

// ---------- Export JSON ----------
export const useExportJSON = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/export/json`)
      if (!res.ok) throw new Error("Export failed")
      const data = await res.json()
      
      // Trigger download
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deepfake_scans_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return data
    }
  })
}

// ---------- API Docs ----------
export const useGetAPIDocumentation = () => {
  return useQuery({
    queryKey: ['api', 'docs'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/docs`)
      if (!res.ok) throw new Error("Failed to fetch API docs")
      return res.json()
    }
  })
}