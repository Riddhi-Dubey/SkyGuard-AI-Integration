const fs = require('fs');
const https = require('https');

const mermaidCode = `flowchart TD
    subgraph R1["STAGE 1: TELEMETRY INGESTION AND DUAL-TIER QUALITY CONTROL"]
        direction LR
        A["1. AWS Telemetry Ingest\\n(Pt100 RTD, PTB330, HMP155)\\nINSAT-3DR 402.75MHz / 4G\\nFastAPI Buffer (<15ms)"]
        --> B["2. WMO-No. 8 Physics Gate\\nStep Limit: |dt| <= 5C/10min\\nFlatline Check: var > 0\\n12-D Feature Vector"]
        --> C["3. 12D Isolation Forest ML\\nMultivariate Microclimate Baseline\\nCatches Subtle Drift\\nAnomaly Score (s <= 0.0)"]
    end

    C -->|Anomaly Flagged| R2
    C -->|Nominal Observation| CLEAN["Clean Telemetry Stream (NWP Models)"]

    subgraph R2["STAGE 2: AGENTIC DIAGNOSTICS AND FIELD REMEDIATION"]
        direction LR
        D["4. LangGraph 6-Node Agent\\nConfidence Calibration Engine\\nSHAP Feature Attribution (%)\\nNon-Destructive Baseline Estimate"]
        --> E["5. OpenAI via Groq API\\nRoot-Cause Synthesis (RTD/Wiring)\\nPrescriptive Repair Action\\nMaintenance Risk Score"]
        --> F["6. Actionable Outputs\\nPlain-Text Email to Field Crew\\nLive GIS Dashboard (HITL Accept)\\nRaw Telemetry Preserved"]
    end

    style R1 fill:#f0f9ff,stroke:#0284c7,stroke-width:2px;
    style R2 fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px;
    style A fill:#ffffff,stroke:#0284c7,stroke-width:1.5px;
    style B fill:#ffffff,stroke:#d97706,stroke-width:1.5px;
    style C fill:#ffffff,stroke:#16a34a,stroke-width:1.5px;
    style D fill:#ffffff,stroke:#7c3aed,stroke-width:1.5px;
    style E fill:#ffffff,stroke:#6d28d9,stroke-width:1.5px;
    style F fill:#ffffff,stroke:#059669,stroke-width:1.5px;
    style CLEAN fill:#ecfdf5,stroke:#059669,stroke-width:1.5px;`;

const jsonPayload = JSON.stringify({
  code: mermaidCode,
  mermaid: {
    theme: 'default',
    flowchart: { curve: 'basis' }
  }
});

const b64 = Buffer.from(jsonPayload).toString('base64');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Downloading:', dest);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log('Saved:', dest, '(' + fs.statSync(dest).size + ' bytes)');
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const svgUrl = 'https://mermaid.ink/svg/' + b64 + '?bgColor=!white';
  await download(svgUrl, 'SkyGuard_AI_Architecture_Slide_Readable.svg');
  console.log('Readable SVG saved successfully!');
}

main().catch(console.error);
