## Install

npm install optimasi-digest

## Usage

```next
"use client";

import { generateDigestPDF } from "diggest-lib";

export default function DownloadButton({ result }: { result: string }) {
  const handleClick = async () => {
    await generateDigestPDF({
      data: result,
      logoUrl: "/logo.png",
    });
  };

  return <button onClick={handleClick}>Download PDF</button>;
```

```Vue
<script setup lang="ts">
import { generateDigestPDF } from "diggest-lib";

async function handleDownload(jsonResult: string) {
  await generateDigestPDF({
    data: jsonResult,
    logoUrl: "/logo-pussansiad.png",
    fileName: `Laporan_${new Date().toISOString().split("T")[0]}.pdf`,
  });
}
</script>
```
