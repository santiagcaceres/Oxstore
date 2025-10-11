import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = {
  width: 512,
  height: 512,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        borderRadius: "50%",
      }}
    >
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-La1L4yvLgq9BfYliAPK7p5gQDFrtgw.png"
        alt="Luciano Fulco"
        width="512"
        height="512"
      />
    </div>,
    {
      ...size,
    },
  )
}
