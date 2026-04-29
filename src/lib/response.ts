import { NextResponse } from "next/server";

export const ok = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export const created = (data: unknown) =>
  NextResponse.json(data, { status: 201 });

export const noContent = () =>
  new NextResponse(null, { status: 204 });

export const badRequest = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

export const unauthorized = () =>
  NextResponse.json({ message: "Unauthorized" }, { status: 401 });

export const forbidden = (message = "Forbidden") =>
  NextResponse.json({ message }, { status: 403 });

export const notFound = (message = "Not found") =>
  NextResponse.json({ message }, { status: 404 });

export const conflict = (message: string) =>
  NextResponse.json({ message }, { status: 409 });

export const gone = (message = "Resource expired or exhausted") =>
  NextResponse.json({ message }, { status: 410 });

export const unprocessable = (errors: unknown) =>
  NextResponse.json({ message: "Validation failed", errors }, { status: 422 });

export const serverError = (message = "Internal server error") =>
  NextResponse.json({ message }, { status: 500 });
