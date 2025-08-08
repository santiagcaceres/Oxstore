import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, payer, shipments } = body

    const preference = new Preference(client)

    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        currency_id: "ARS",
      })),
      payer: {
        name: payer.name,
        surname: payer.surname,
        email: payer.email,
        phone: {
          area_code: payer.phone?.area_code || "",
          number: payer.phone?.number || "",
        },
        identification: {
          type: payer.identification?.type || "DNI",
          number: payer.identification?.number || "",
        },
        address: {
          street_name: payer.address?.street_name || "",
          street_number: payer.address?.street_number || "",
          zip_code: payer.address?.zip_code || "",
        },
      },
      shipments: {
        cost: parseFloat(shipments?.cost || "0"),
        mode: "not_specified",
        receiver_address: {
          street_name: shipments?.receiver_address?.street_name || "",
          street_number: shipments?.receiver_address?.street_number || "",
          zip_code: shipments?.receiver_address?.zip_code || "",
          city_name: shipments?.receiver_address?.city_name || "",
          state_name: shipments?.receiver_address?.state_name || "",
          country_name: shipments?.receiver_address?.country_name || "Argentina",
        },
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacion?status=success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacion?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacion?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      external_reference: `order_${Date.now()}`,
    }

    const result = await preference.create({ body: preferenceData })

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    })
  } catch (error) {
    console.error("Error creating MercadoPago preference:", error)
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" },
      { status: 500 }
    )
  }
}
