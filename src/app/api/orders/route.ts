import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromInput } from "@/lib/orders";
import type { PaymentMethod } from "@/lib/types";

const createSchema = z.object({
  customerName: z.string().min(2, "Nome obrigatório").max(200),
  customerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  customerPhone: z.string().min(9, "Telefone obrigatório").max(30),
  customerWhatsapp: z.string().max(30).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.number().optional(),
        variantId: z.number().optional(),
        productName: z.string().min(1),
        productImage: z.string().optional().nullable(),
        sourceUrl: z.string().optional().nullable(),
        sku: z.string().optional().nullable(),
        variantColor: z.string().optional().nullable(),
        variantSize: z.string().optional().nullable(),
        variantLabel: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(10),
        unitPriceCents: z.number().int().min(0),
        originalPriceUsd: z.number().optional().nullable(),
        originalCurrency: z.string().optional().nullable(),
        priceSnapshot: z.any().optional(),
      })
    )
    .min(1, "Adiciona pelo menos um artigo"),
  address: z.object({
    province: z.string().min(2, "Província obrigatória"),
    municipality: z.string().min(2, "Município obrigatório"),
    neighborhood: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    reference: z.string().optional().nullable(),
    instructions: z.string().optional().nullable(),
  }),
  paymentMethod: z.enum(["BANK_TRANSFER", "REFERENCE", "DIGITAL", "CASH"] as const),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  try {
    const result = await createOrderFromInput({
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone,
      customerWhatsapp: data.customerWhatsapp || null,
      items: data.items.map((i) => ({
        ...i,
        productImage: i.productImage ?? null,
        sourceUrl: i.sourceUrl ?? null,
        sku: i.sku ?? null,
        variantColor: i.variantColor ?? null,
        variantSize: i.variantSize ?? null,
        variantLabel: i.variantLabel ?? null,
        originalPriceUsd: i.originalPriceUsd ?? null,
        originalCurrency: (i as any).originalCurrency ?? "USD",
      })),
      address: {
        province: data.address.province,
        municipality: data.address.municipality,
        neighborhood: data.address.neighborhood ?? null,
        street: data.address.street ?? null,
        reference: data.address.reference ?? null,
        instructions: data.address.instructions ?? null,
      },
      paymentMethod: data.paymentMethod as PaymentMethod,
      notes: data.notes ?? null,
    });
    return NextResponse.json({ ok: true, order: result });
  } catch (err: any) {
    console.error("create order error", err);
    return NextResponse.json(
      { error: "Erro ao criar pedido. Tenta novamente." },
      { status: 500 }
    );
  }
}
