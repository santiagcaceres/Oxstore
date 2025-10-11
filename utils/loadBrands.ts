import { createBrowserClient } from "@supabase/ssr"

interface Brand {
  id: number
  name: string
  slug: string
}

export async function loadBrands(): Promise<Brand[]> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data, error } = await supabase.from("brands").select("*").order("name")

    if (error) {
      console.error("Error loading brands:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error loading brands:", error)
    return []
  }
}
