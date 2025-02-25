import { NextRequest, NextResponse } from "next/server";

export function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;

  // Excludem rutele pentru resurse statice, favicon, fișiere cu extensii sau endpoint-uri API
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Verificăm dacă există parametrul "lang" în query string
  const langParam = searchParams.get("lang");
  let locale = langParam || req.cookies.get("NEXT_LOCALE")?.value || "ro";

  const url = req.nextUrl.clone();

  if (langParam) {
    // Eliminăm parametrul "lang" din query string și setăm cookie-ul
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", langParam, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  const supportedLangs = "bg|hr|cs|en|fr|de|el|hi|id|it|nl|pl|ro|sk|es";
  // Regex care prinde unul sau mai multe segmente de limbă la începutul căii
  const languageRegex = new RegExp(`^(\\/(${supportedLangs}))+`, "i");
  const match = pathname.match(languageRegex);

  if (match) {
    // Extragem toate segmentele de coduri de limbă prezente
    const localesArray = match[0].split("/").filter(Boolean);
    // Dacă sunt duplicate sau primul segment diferă de cel dorit, refacem calea
    if (localesArray.length > 1 || localesArray[0] !== locale) {
      const cleanedPath = pathname.replace(languageRegex, "/");
      url.pathname = `/${locale}${cleanedPath}`.replace(/\/\//g, "/");
      return NextResponse.redirect(url);
    }
  } else {
    // Dacă nu există prefix de limbă, îl adăugăm
    url.pathname = `/${locale}${pathname}`.replace(/\/\//g, "/");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Aplicăm middleware-ul la toate rutele
export const config = {
  matcher: ["/:path*"],
};
