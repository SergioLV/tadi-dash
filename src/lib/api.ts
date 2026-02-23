import { Visit, Lead } from "./types";
import { decryptData } from "./crypto";
import UAParser from "ua-parser-js";

const VISITS_API =
  "https://nzz30ikxtk.execute-api.us-east-1.amazonaws.com/prod/visit";
const LEADS_API =
  "https://6gbja909qf.execute-api.us-east-1.amazonaws.com/prod/leads";

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return {
    browser: `${browser.name || "Unknown"} ${browser.version || ""}`.trim(),
    os: `${os.name || "Unknown"} ${os.version || ""}`.trim(),
    device: parser.getDevice().type || "desktop",
  };
}

export async function fetchVisits(): Promise<Visit[]> {
  try {
    const res = await fetch(VISITS_API);
    const data = await res.json();

    let visits: Visit[];

    // Handle encrypted response
    if (typeof data === "string") {
      const decrypted = await decryptData(data);
      visits = JSON.parse(decrypted);
    } else if (data.encrypted) {
      const decrypted = await decryptData(data.encrypted);
      visits = JSON.parse(decrypted);
    } else if (data.body && typeof data.body === "string") {
      try {
        const decrypted = await decryptData(data.body);
        visits = JSON.parse(decrypted);
      } catch {
        visits = JSON.parse(data.body);
      }
    } else if (Array.isArray(data)) {
      visits = data;
    } else if (data.body && Array.isArray(data.body)) {
      visits = data.body;
    } else {
      visits = [];
    }

    // Parse user agents
    return visits.map((v) => {
      const parsed = parseUserAgent(v.userAgent || "");
      return { ...v, ...parsed };
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return [];
  }
}

export async function fetchLeads(): Promise<Lead[]> {
  try {
    const res = await fetch(LEADS_API);
    const data = await res.json();

    if (Array.isArray(data)) return data;
    if (data.body && typeof data.body === "string") return JSON.parse(data.body);
    if (data.body && Array.isArray(data.body)) return data.body;
    return [];
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}
