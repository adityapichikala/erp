import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createServerClient();

  try {
    // Generate a valid bcrypt hash for "password123"
    const salt = await bcrypt.genSalt(10);
    const validHash = await bcrypt.hash('password123', salt);

    // Update ALL users to have this valid hash so they can actually log in
    const { error: updateError } = await supabase
      .from('User')
      .update({ passwordHash: validHash })
      .not('id', 'is', null); // Update all

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 200 });
    }

    // Now make sure the admin user exists
    const { data: colleges } = await supabase.from('College').select('id').limit(1);
    const collegeId = colleges?.[0]?.id || null;
    
    // Check if admin exists
    const { data: admins } = await supabase.from('User').select('id').eq('email', 'admin@apex.edu');
    
    if (!admins || admins.length === 0) {
       // Create Admin User
       const crypto = require('crypto');
       await supabase.from('User').insert({
          id: crypto.randomUUID(),
          name: 'System Administrator',
          email: 'admin@apex.edu',
          passwordHash: validHash,
          role: 'SUPER_ADMIN',
          collegeId: collegeId,
          updatedAt: new Date().toISOString()
       });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All users (including admin) updated to use a valid bcrypt hash.', 
      email: 'admin@apex.edu', 
      password: 'password123' 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
