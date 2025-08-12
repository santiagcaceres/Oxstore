"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

interface OrderItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

interface Order {
  id: string
  items: OrderItem[]
  shipping: ShippingInfo
  shippingMethod: string
  paymentMethod: string
  subtotal: number
  shippingCost: number
  total: number
  createdAt: string
  status: string
}

interface OrderState {
  currentOrder: Order | null
  orderHistory: Order[]
  isLoading: boolean
}

type OrderAction =
  | { type: "CREATE_ORDER"; payload: Order }
  | { type: "CLEAR_CURRENT_ORDER" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_FROM_STORAGE"; payload: OrderState }

const initialState: OrderState = {
  currentOrder: null,
  orderHistory: [],
  isLoading: false,
}

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "CREATE_ORDER":
      const newState = {
        ...state,
        currentOrder: action.payload,
        orderHistory: [action.payload, ...state.orderHistory],
        isLoading: false,
      }
      // Guardar en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("oxstore_order_state", JSON.stringify(newState))
      }
      return newState

    case "CLEAR_CURRENT_ORDER":
      const clearedState = {
        ...state,
        currentOrder: null,
        isLoading: false,
      }
      // Actualizar localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("oxstore_order_state", JSON.stringify(clearedState))
      }
      return clearedState

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }

    case "LOAD_FROM_STORAGE":
      return action.payload

    default:
      return state
  }
}

const OrderContext = createContext<{
  state: OrderState
  dispatch: React.Dispatch<OrderAction>
} | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState)

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = localStorage.getItem("oxstore_order_state")
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          dispatch({ type: "LOAD_FROM_STORAGE", payload: parsedState })
        }
      } catch (error) {
        console.error("Error loading order state from localStorage:", error)
      }
    }
  }, [])

  return <OrderContext.Provider value={{ state, dispatch }}>{children}</OrderContext.Provider>
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider")
  }
  return context
}

export type { Order }
