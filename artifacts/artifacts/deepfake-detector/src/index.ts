export const useGetStats = () => {
  return {
    data: {
      total: 120,
      fake: 30,
      real: 90
    },
    isLoading: false
  }
}

export const useGetHistory = () => {
  return {
    data: [],
    isLoading: false
  }
}

export const useGetScanById = () => {
  return {
    data: null,
    isLoading: false
  }
}

export const useDetectImage = () => {}
export const useDetectVideo = () => {}
export const useDetectAudio = () => {}