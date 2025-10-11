// Google Analytics configuration and helper functions

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Eventos específicos para el portfolio de arte
export const trackArtworkView = (artworkId: string, artworkTitle: string) => {
  event({
    action: "view_artwork",
    category: "Artwork",
    label: `${artworkTitle} (ID: ${artworkId})`,
  })
}

export const trackContactClick = (method: "email" | "whatsapp", artworkTitle?: string) => {
  event({
    action: "contact_click",
    category: "Contact",
    label: artworkTitle ? `${method} - ${artworkTitle}` : method,
  })
}

export const trackCategoryFilter = (category: string) => {
  event({
    action: "filter_category",
    category: "Navigation",
    label: category,
  })
}

export const trackSearch = (searchTerm: string) => {
  event({
    action: "search",
    category: "Navigation",
    label: searchTerm,
  })
}

export const trackArtworkInquiry = (artworkTitle: string, method: "email" | "whatsapp") => {
  event({
    action: "artwork_inquiry",
    category: "Lead",
    label: `${artworkTitle} - ${method}`,
  })
}
