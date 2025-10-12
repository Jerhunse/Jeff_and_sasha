import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { accessToken } = await req.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      )
    }

    // Fetch contacts from Google People API
    const contactsResponse = await fetch(
      "https://people.googleapis.com/v1/people/me/connections?" +
        new URLSearchParams({
          personFields: "names,emailAddresses,phoneNumbers,addresses",
          pageSize: "1000",
        }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!contactsResponse.ok) {
      const errorData = await contactsResponse.json()
      console.error("Contacts fetch error:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch contacts from Google" },
        { status: 500 }
      )
    }

    const data = await contactsResponse.json()
    const connections = data.connections || []

    // Transform Google contacts to our guest format
    const guests = connections.map((contact: any) => {
      const name = contact.names?.[0]
      const email = contact.emailAddresses?.[0]
      const phone = contact.phoneNumbers?.[0]
      const address = contact.addresses?.[0]

      return {
        firstName: name?.givenName || "",
        lastName: name?.familyName || "",
        email: email?.value || null,
        phone: phone?.value || null,
        addressLine1: address?.streetAddress || null,
        city: address?.city || null,
        state: address?.region || null,
        zipCode: address?.postalCode || null,
        country: address?.country || "US",
        importSource: "google",
        originalData: JSON.stringify(contact),
      }
    }).filter((g: any) => g.firstName || g.lastName || g.email) // Only include contacts with some info

    return NextResponse.json({ guests, count: guests.length })
  } catch (error: any) {
    console.error("Google fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

