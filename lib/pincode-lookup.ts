import { promises as fs } from "fs";
import path from "path";

export type PostOffice = {
  Name: string;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  State: string;
  Country: string;
  Pincode: string;
  Latitude?: string;
  Longitude?: string;
};

type DataGovPincodeRecord = {
  circlename?: string;
  regionname?: string;
  divisionname?: string;
  officename?: string;
  pincode?: string;
  officetype?: string;
  delivery?: string;
  district?: string;
  statename?: string;
  latitude?: string;
  longitude?: string;
};

type DataGovPincodeResponse = {
  status?: string;
  records?: DataGovPincodeRecord[];
};

type CachedPincodeLookup = {
  expiresAt: number;
  postOffices: PostOffice[];
};

const DATA_GOV_RESOURCE_ID = "5c2f62fe-5afa-4119-a499-fec9d604d5bd";
const DEFAULT_DATA_GOV_API_KEY = "579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PINCODE_API_TIMEOUT_MS = 6000;
const PINCODE_DATA_PATH = path.join(process.cwd(), "data", "pincode.csv");

const pincodeCache = new Map<string, CachedPincodeLookup>();
let localPincodeIndex: Map<string, PostOffice[]> | null = null;
let localPincodeIndexPromise: Promise<Map<string, PostOffice[]>> | null = null;
let localLoadWarningShown = false;

function clean(value?: string | number | null) {
  return String(value || "").trim();
}

function branchType(record: DataGovPincodeRecord) {
  const officeName = clean(record.officename).toUpperCase();

  if (officeName.endsWith("B.O") || officeName.endsWith("BO")) return "Branch Post Office";
  if (officeName.endsWith("S.O") || officeName.endsWith("SO")) return "Sub Post Office";
  if (officeName.endsWith("H.O") || officeName.endsWith("HO")) return "Head Post Office";
  if (officeName.endsWith("G.P.O.") || officeName.endsWith("GPO")) return "General Post Office";

  return clean(record.officetype) || "Post Office";
}

function toPostOffice(record: DataGovPincodeRecord): PostOffice {
  return {
    Name: clean(record.officename),
    BranchType: branchType(record),
    DeliveryStatus: clean(record.delivery),
    Circle: clean(record.circlename),
    District: clean(record.district),
    Division: clean(record.divisionname),
    Region: clean(record.regionname),
    State: clean(record.statename),
    Country: "India",
    Pincode: clean(record.pincode),
    Latitude: clean(record.latitude),
    Longitude: clean(record.longitude),
  };
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(value);
      value = "";
      continue;
    }

    value += char;
  }

  values.push(value);
  return values.map(clean);
}

function getHeaderIndex(headers: string[], header: string) {
  return headers.findIndex((value) => value.toLowerCase() === header.toLowerCase());
}

async function loadLocalPincodeIndex() {
  if (localPincodeIndex) return localPincodeIndex;
  if (localPincodeIndexPromise) return localPincodeIndexPromise;

  localPincodeIndexPromise = fs.readFile(PINCODE_DATA_PATH, "utf8").then((csv) => {
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = parseCsvLine(lines[0] || "");
    const indexes = {
      circle: getHeaderIndex(headers, "CircleName"),
      region: getHeaderIndex(headers, "RegionName"),
      division: getHeaderIndex(headers, "DivisionName"),
      office: getHeaderIndex(headers, "OfficeName"),
      pincode: getHeaderIndex(headers, "Pincode"),
      officeType: getHeaderIndex(headers, "OfficeType"),
      delivery: getHeaderIndex(headers, "Delivery"),
      district: getHeaderIndex(headers, "District"),
      state: getHeaderIndex(headers, "StateName"),
      latitude: getHeaderIndex(headers, "Latitude"),
      longitude: getHeaderIndex(headers, "Longitude"),
    };

    const index = new Map<string, PostOffice[]>();

    for (const line of lines.slice(1)) {
      const row = parseCsvLine(line);
      const pincode = clean(row[indexes.pincode]);
      const name = clean(row[indexes.office]);

      if (!isValidIndianPincode(pincode) || !name) continue;
      if (name.toUpperCase() === "TEST OFFICE") continue;

      const postOffice = toPostOffice({
        circlename: row[indexes.circle],
        regionname: row[indexes.region],
        divisionname: row[indexes.division],
        officename: name,
        pincode,
        officetype: row[indexes.officeType],
        delivery: row[indexes.delivery],
        district: row[indexes.district],
        statename: row[indexes.state],
        latitude: row[indexes.latitude],
        longitude: row[indexes.longitude],
      });

      const existing = index.get(pincode) || [];
      existing.push(postOffice);
      index.set(pincode, existing);
    }

    localPincodeIndex = index;
    return index;
  }).catch((error) => {
    localPincodeIndexPromise = null;
    throw error;
  });

  return localPincodeIndexPromise;
}

export function isValidIndianPincode(pincode: string) {
  return /^[1-9]\d{5}$/.test(pincode);
}

async function lookupPincodeFromRemote(pincode: string) {
  const apiKey = process.env.PINCODE_DATA_GOV_API_KEY || DEFAULT_DATA_GOV_API_KEY;
  const url = new URL(`https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "100");
  url.searchParams.set("filters[pincode]", pincode);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60 * 60 * 24 * 30,
    },
    signal: AbortSignal.timeout(PINCODE_API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`PIN code lookup failed with status ${response.status}`);
  }

  const data = (await response.json()) as DataGovPincodeResponse;
  if (data.status && data.status !== "ok") {
    throw new Error("PIN code lookup service returned an error");
  }

  return (data.records || [])
    .map(toPostOffice)
    .filter((postOffice) => postOffice.Name && postOffice.Pincode === pincode);
}

export async function lookupPincode(pincode: string) {
  const cached = pincodeCache.get(pincode);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.postOffices;
  }

  let postOffices: PostOffice[];

  try {
    const localIndex = await loadLocalPincodeIndex();
    postOffices = localIndex.get(pincode) || [];
  } catch (error) {
    if (!localLoadWarningShown) {
      console.warn("Local PIN code dataset unavailable, falling back to remote lookup:", error);
      localLoadWarningShown = true;
    }

    postOffices = await lookupPincodeFromRemote(pincode);
  }

  pincodeCache.set(pincode, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    postOffices,
  });

  return postOffices;
}
