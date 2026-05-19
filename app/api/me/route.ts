import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function GET() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return NextResponse.json({ error }, { status: 401 });
  return NextResponse.json({ user: data.user });
}