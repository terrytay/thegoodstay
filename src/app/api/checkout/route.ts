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

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Create order in Supabase using service role for permissions
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Parse order data from metadata
      const orderData = JSON.parse(session.metadata?.orderData || "{}");

      // Insert order into database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          stripe_payment_intent_id: session.payment_intent as string,
          total_amount: orderData.total,
          status: "paid",
          shipping_address: orderData.shippingAddress,
          user_id: null, // Anonymous order
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
      }

      // Insert order items
      if (order && orderData.items) {
        const orderItems = orderData.items.map((item: CartItem) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("Error creating order items:", itemsError);
        }
      }
    }

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
