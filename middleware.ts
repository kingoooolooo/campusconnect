import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Always refresh the session — do not add any logic between
  // createServerClient and supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Public routes — no auth required ─────────────────────
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/auth/forgot-password', '/auth/reset-password', '/auth/pending']
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith('/api/')

  if (isPublicRoute) {
    return supabaseResponse
  }

  // ── Not authenticated → redirect to login ─────────────────
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // ── Fetch profile for status + role checks ────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role, department_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Profile row missing — something went wrong during signup trigger
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // ── Approved users → redirect away from auth pages ────────
  if (profile.status === 'approved') {
    const authPages = ['/auth/login', '/auth/signup', '/auth/pending']
    if (authPages.some(page => pathname.startsWith(page))) {
      const { data: dept } = await supabase
        .from('departments')
        .select('name')
        .eq('id', profile.department_id)
        .single()

      const url = request.nextUrl.clone()
      url.pathname = dept ? `/${encodeURIComponent(dept.name)}` : '/'
      return NextResponse.redirect(url)
    }
  }

  // ── Pending users → redirect to pending page ──────────────
  if (profile.status === 'pending') {
    // Allow access to /auth/pending itself, redirect everything else
    if (pathname !== '/auth/pending') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pending'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ── Banned users → redirect to banned page ──────────────
  if (profile.status === 'banned') {
    if (pathname !== '/banned') {
      const url = request.nextUrl.clone()
      url.pathname = '/banned'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ── Admin route protection ─────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const isAdmin =
      profile.role === 'super_admin' || profile.role === 'department_admin'
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // ── Super admin only routes ────────────────────────────────
  if (
    pathname.startsWith('/admin/departments') ||
    pathname.startsWith('/admin/analytics')
  ) {
    if (profile.role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
