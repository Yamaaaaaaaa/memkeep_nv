// Export API key từ environment variables
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY

// Debug function để kiểm tra
export const debugEnv = () => {
  console.log("=== ENVIRONMENT DEBUG ===")
  console.log("API Key exists:", !!OPENAI_API_KEY)
  console.log("API Key length:", OPENAI_API_KEY?.length || 0)
  console.log("API Key starts with:", OPENAI_API_KEY?.substring(0, 7))
  console.log("All EXPO_PUBLIC vars:", Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC')))
}

// Validation function
export const validateApiKey = () => {
  if (!OPENAI_API_KEY) {
    throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not defined in environment variables")
  }
  
  if (!OPENAI_API_KEY.startsWith('sk-')) {
    throw new Error("Invalid OpenAI API key format")
  }
  
  return true
}
