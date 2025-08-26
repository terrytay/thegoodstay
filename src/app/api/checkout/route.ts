import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress } = body as {
      items: CartItem[];
      shippingAddress: {
        name: string;
        email: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Calculate total
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 0;
    const tax = 0;
    const total = Math.round(subtotal + shipping + tax);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        ...items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })),
        // ...(shipping > 0
        //   ? [
        //       {
        //         price_data: {
        //           currency: "usd",
        //           product_data: {
        //             name: "Shipping",
        //           },
        //           unit_amount: Math.round(shipping * 100),
        //         },
        //         quantity: 1,
        //       },
        //     ]
        //   : []),
        // {
        //   price_data: {
        //     currency: "usd",
        //     product_data: {
        //       name: "Tax",
        //     },
        //     unit_amount: Math.round(tax * 100),
        //   },
        //   quantity: 1,
        // },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/shop/cart`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      customer_email: shippingAddress.email,
      metadata: {
        orderData: JSON.stringify({
          items,
          shippingAddress,
          subtotal,
          shipping,
          tax,
          total,
        }),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  console.log(`[CHECKOUT GET] Called with session_id: ${sessionId}`);

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`[CHECKOUT GET] Retrieved session:`, {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal
    });

    // Only return session data - order creation is handled by webhook
    return NextResponse.json({
      session,
      orderCreated: session.payment_status === "paid",
    });
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
