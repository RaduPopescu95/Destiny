// app/sitemap.js
import { MetadataRoute } from "next";

// Funcție care returnează locațiile (judete și orașe)
// În implementarea reală, poți înlocui această listă statică cu o interogare către baza de date (ex: Firestore)
async function getLocations() {
  return [
    "Bucuresti",
    "Cluj",
    "Timisoara",
    "Iasi",
    "Constanta",
    "Brasov",
    // adaugă alte locații după necesitate
  ];
}

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const locations = await getLocations();

  // Generăm URL-urile pentru paginile dinamice "matrimoniale/{locatie}"
  const matrimonialUrls = locations.map((loc) => ({
    url: `${baseUrl}/matrimoniale/${encodeURIComponent(loc)}`,
    lastModified: new Date().toISOString(),
  }));

  // Alte URL-uri statice, dacă este necesar
  const staticUrls = [
    { url: baseUrl, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString() },
    // adaugă și alte pagini statice
  ];

  return [...staticUrls, ...matrimonialUrls];
}
