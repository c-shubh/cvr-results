import { config } from "./config";
import { type MinimalResult } from "./types";

function between(x: any, a: any, b: any) {
  return a <= x && x <= b;
}

function nextRollNo(no: string): string {
  if (between(no, "00", "98")) {
    const noNum = parseInt(no);
    if (noNum + 1 > 9) return `${noNum + 1}`;
    else return `0${noNum + 1}`;
  }
  if (no === "99") return "A0";
  if (no === "Z9") return "00";
  if (between(no, "A0", "Z8")) {
    return `${
      no[1] === "9" ? String.fromCharCode(no[0].charCodeAt(0) + 1) : no[0]
    }${(parseInt(no[1]) + 1) % 10}`;
  }
  return "";
}

function getRollNo(html: string) {
  const regex = /<td>Roll Number<\/td><td>(\w+)<\/td>/;
  const match = html.match(regex);
  if (match === null) return "";
  return match[1].trim();
}

function getName(html: string) {
  const regex = /<td>Name<\/td><td>([ \w]+)<\/td>/;
  const match = html.match(regex);
  if (match === null) return "";
  return match[1].trim();
}

function getSGPA(html: string) {
  const regex = /<td>SGPA<\/td><td>([\d\.]+)<\/td>/;
  const match = html.match(regex);
  if (match === null) return "";
  return match[1].trim();
}

function getCGPA(html: string) {
  const regex = /<td>CGPA<\/td><td>([\d\.]+)<\/td>/;
  const match = html.match(regex);
  if (match === null) return "";
  return match[1].trim();
}

function toCSV(results: MinimalResult[]) {
  const heading = Object.keys(results[0]).join(",");
  const rows = [];
  for (const result of results) {
    rows.push(Object.values(result).join(","));
  }
  return `${heading}\n${rows.join("\n")}`;
}

async function fetchResult(rollNo: string) {
  const results = await fetch(config.url, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.6",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "upgrade-insecure-requests": "1",
    },
    body: `srno=${rollNo}&type=roll&phase1=`,
    method: "POST",
  });
  const html = await results.text();
  console.log(`fetchResult: ${rollNo} fetched`);
  return html;
}

export default async function main() {
  let rollNo = config.rollNoStart;
  const results: MinimalResult[] = [];
  for (let i = 0; i < config.resultCount; i++) {
    const html = await fetchResult(config.rollNoPrefix + rollNo);
    const result: MinimalResult = {
      rollNo: getRollNo(html),
      name: getName(html),
      sgpa: getSGPA(html),
      cgpa: getCGPA(html),
    };
    results.push(result);
    console.log(result);
    rollNo = nextRollNo(rollNo);
  }

  console.log(toCSV(results));
}
