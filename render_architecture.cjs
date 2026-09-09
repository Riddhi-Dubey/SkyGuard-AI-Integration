const fs = require('fs');
const https = require('https');

const mermaidCode = `flowchart LR
    subgraph S1["1. Telemetry Ingest"]
        direction TB
        A1["AWS Synoptic Nodes\\n(Pt100, PTB330, HMP155)"]
        A2["INSAT-3DR Satellite\\n(402.75 MHz DCP Burst / 4G)"]
        A3["FastAPI Gateway\\n(<15ms Async Ingestion)"]
        A1 --> A2 --> A3
    end

    subgraph S2["2. Physics and Features"]
        direction TB
        B1["12-D Synoptic Vector\\n(Gradients dt, Volatility, Dew Pt)"]
        B2{"WMO-No. 8 Physics Gate\\n(Rate of Change Limit\\nFlatline Check)"}
        B1 --> B2
    end

    subgraph S3["3. Isolation Forest ML"]
        direction TB
        C1["12D Isolation Forest\\n(Multivariate Microclimate)"]
        C2{"Outlier Flagged?\\n(Score <= 0.0)"}
        C1 --> C2
    end

    subgraph S4["4. LangGraph + OpenAI"]
        direction TB
        D1["SHAP Attribution (%)"]
        D2["Non-Destructive Baseline\\n(Preserves Raw Telemetry)"]
        D3["OpenAI Model (via Groq)\\n(Root-Cause and Field Action)"]
        D1 --> D2 --> D3
    end

    subgraph S5["5. Actionable Outputs"]
        direction TB
        E1["Plain-Text Email Alert\\n(Dispatched to Field Crew)"]
        E2["Live GIS Dashboard\\n(HITL Operator Review)"]
        E3["Clean Telemetry Feed\\n(NWP Weather Models)"]
        E1 --- E2 --- E3
    end

    A3 --> B1
    B2 -- "Physics Breach" --> D1
    B2 -- "Plausible" --> C1
    C2 -- "Anomalous" --> D1
    C2 -- "Nominal" --> E3
    D3 --> E1
    D3 --> E2

    style S1 fill:#f0f9ff,stroke:#0284c7,stroke-width:2px;
    style S2 fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    style S3 fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    style S4 fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px;
    style S5 fill:#ecfdf5,stroke:#059669,stroke-width:2px;`;

// standard base64 encoding

const jsonPayload = JSON.stringify({
  code: mermaidCode,
  mermaid: {
    theme: 'default',
    flowchart: {
      curve: 'basis'
    }
  }
});

const b64 = Buffer.from(jsonPayload).toString('base64');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Downloading:', dest, 'from', url);
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
  const pngUrl = 'https://mermaid.ink/img/' + b64 + '?type=png&bgColor=!white&scale=2';
  const svgUrl = 'https://mermaid.ink/svg/' + b64 + '?bgColor=!white';
  
  await download(pngUrl, 'SkyGuard_AI_Architecture.png');
  await download(svgUrl, 'SkyGuard_AI_Architecture.svg');
  console.log('ALL FILES GENERATED SUCCESSFULLY!');
}

main().catch(console.error);
