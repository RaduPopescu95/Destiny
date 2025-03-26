// app/sitemap.js
import { MetadataRoute } from "next";

// Funcție care returnează locațiile (judete și orașe)
// În implementarea reală, poți înlocui această listă statică cu o interogare către baza de date (ex: Firestore)
async function getLocations() {
  return [
    "alba", "alba-iulia", "aiud", "blaj", "cugir", "sebese",
    "arad", "arad", "lipova", "ineu", "chisineu-cris", "curtici", "pecica",
    "arges", "pitesti", "campulung", "curtea-de-arges", "mioveni", "costesti",
    "bacau", "bacau", "moinesti", "onesti", "comanesti", "slanic-moldova",
    "bihor", "oradea", "beius", "marghita", "salonta", "alesd",
    "bistrita-nasaud", "bistrita", "nasaud", "beclean", "sangeorz-bai",
    "botosani", "botosani", "darabani", "dorohoi", "flamanzi", "saveni",
    "braila", "braila", "ianca", "faurei", "insuratei",
    "brasov", "brasov", "fagaras", "rasnov", "sacele", "zarnesti", "codlea",
    "bucuresti", "bucuresti",
    "buzau", "buzau", "ramnicu-sarat", "nehoiu", "patarlagele",
    "caras-severin", "resita", "caransebes", "bocsa", "oravita", "moldova-noua",
    "calarasi", "calarasi", "oltenita",
    "cluj", "cluj-napoca", "turda", "dej", "gherla", "campia-turzii", "huedin",
    "constanta", "constanta", "mangalia", "medgidia", "navodari", "cernavoda",
    "covasna", "sfantu-gheorghe", "targu-secui", "barcani",
    "dambovita", "targoviste", "moreni", "gaesti", "pucioasa", "titu",
    "dolj", "craiova", "bailesti", "calafat", "filiasi", "dabuleni", "segarcea",
    "galati", "galati", "tecucci", "beresti",
    "giurgiu", "giurgiu", "mihailesti",
    "gorj", "targu-jiu", "motru", "rovinari", "tismana", "bumbesti-jiu",
    "harghita", "miercurea-ciuc", "gheorgheni", "odorheiu-secuiesc", "toplita",
    "hunedoara", "deva", "hunedoara", "petrosani", "orastie", "vulcan", "brad",
    "ialomita", "slobozia", "fetesti", "urziceni",
    "iasi", "iasi", "pascani", "targu-frumos", "harlau",
    "ilfov", "bucuresti", "otopeni", "popesti-leordeni", "voluntari", "chitila", "bragadiru",
    "maramures", "baia-mare", "sighetu-marmatiei", "baiut", "borsa", "targu-lapus",
    "mehedinti", "drobeta-turnu-severin", "strehaia", "vanju-mare", "orsova",
    "mures", "targu-mures", "reghin", "sighisoara", "tarnaveni", "ludus",
    "neamt", "piatra-neamt", "roman", "targu-neamt", "bicaz",
    "olt", "slatina", "caracal", "corabia", "scornicesti",
    "prahova", "ploiesti", "campina", "busteni", "valenii-de-munte", "baicoi", "comarnic",
    "satu-mare", "satu-mare", "carei", "negresti-oas", "tasnad",
    "salaj", "zalau", "simleu-silvaniei", "jibou", "cehu-silvaniei",
    "sibiu", "sibiu", "medias", "cisnadie", "avrig", "dumbraveni",
    "suceava", "suceava", "falticeni", "radauti", "campulung-moldovenesc", "gura-humorului",
    "teleorman", "alexandria", "rosiorii-de-vede", "turnu-magurele", "zimbreasca",
    "timis", "timisoara", "lugoj", "jimbolia", "sannicolau-mare", "faget",
    "tulcea", "tulcea", "macin", "babadag", "isaccea",
    "vaslui", "vaslui", "barlad", "husi", "negresti",
    "valcea", "ramnicu-valcea", "dragasani", "caciulata", "babeni",
    "vrancea", "focsani", "adjud", "marasesti", "odobesti"
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
